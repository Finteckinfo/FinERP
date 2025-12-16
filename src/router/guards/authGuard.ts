import type { NavigationGuardNext, RouteLocationNormalized } from 'vue-router';
import { getCookie } from '@/utils/cookies';
import { supabase, isSupabaseOnly } from '@/services/supabase';

/**
 * Authentication Guard for FinPro
 * 
 * PERFORMANCE OPTIMIZED:
 * - Uses synchronous cookie/storage checks (no network calls)
 * - Network validation happens in background after page loads
 * - Instant navigation for authenticated users
 */

// PERFORMANCE: Synchronous session check - no network latency
function hasValidSession(): boolean {
  // SUPABASE-ONLY MODE: Check localStorage cache first (fast sync check)
  if (isSupabaseOnly) {
    try {
      const cached = localStorage.getItem('FinPro_session_cache');
      if (cached) {
        const parsed = JSON.parse(cached);
        const cacheAge = Date.now() - (parsed.timestamp || 0);
        if (cacheAge < 10 * 60 * 1000 && parsed.session) { // 10 min cache
          return true;
        }
      }
    } catch (e) {
      // Ignore storage errors
    }

    // Check sessionStorage for Supabase auth
    try {
      const user = sessionStorage.getItem('erp_user');
      const token = sessionStorage.getItem('erp_session_token');
      const timestamp = sessionStorage.getItem('erp_auth_timestamp');

      if (user && token && timestamp) {
        const age = Date.now() - parseInt(timestamp);
        const maxAge = 24 * 60 * 60 * 1000; // 24 hours
        if (age < maxAge) return true;
      }
    } catch (e) {
      // Ignore storage errors
    }

    // For Supabase-only mode, also check if we have a Supabase access token
    try {
      const supabaseAuth = localStorage.getItem('sb-' + import.meta.env.VITE_SUPABASE_URL?.split('//')[1]?.split('.')[0] + '-auth-token');
      if (supabaseAuth) {
        const parsed = JSON.parse(supabaseAuth);
        if (parsed?.access_token && parsed?.expires_at) {
          const expiresAt = new Date(parsed.expires_at * 1000);
          if (expiresAt > new Date()) return true;
        }
      }
    } catch (e) {
      // Ignore storage errors
    }

    return false;
  }

  // Check cookies first (fastest) - for NextAuth mode
  const sessionToken = getCookie('next-auth.session-token') ||
    getCookie('__Secure-next-auth.session-token') ||
    getCookie('FinPro_sso_token');

  if (sessionToken) return true;

  // Check sessionStorage (SSO fallback)
  try {
    const user = sessionStorage.getItem('erp_user');
    const token = sessionStorage.getItem('erp_session_token');
    const timestamp = sessionStorage.getItem('erp_auth_timestamp');

    if (user && token && timestamp) {
      const age = Date.now() - parseInt(timestamp);
      const maxAge = 24 * 60 * 60 * 1000; // 24 hours
      if (age < maxAge) return true;
    }
  } catch (e) {
    // Ignore storage errors
  }

  // Check localStorage cache
  try {
    const cached = localStorage.getItem('FinPro_session_cache');
    if (cached) {
      const parsed = JSON.parse(cached);
      const cacheAge = Date.now() - (parsed.timestamp || 0);
      if (cacheAge < 10 * 60 * 1000 && parsed.session) { // 10 min cache
        return true;
      }
    }
  } catch (e) {
    // Ignore storage errors
  }

  return false;
}

export async function authGuard(
  to: RouteLocationNormalized,
  from: RouteLocationNormalized,
  next: NavigationGuardNext
) {
  // Public routes that don't require authentication
  const publicRoutes = [
    '/auth-loading',
    '/unauthorized',
    '/error',
    '/sso-callback',
    '/login',
    '/register'
  ];

  // Check if current route is public
  if (publicRoutes.includes(to.path)) {
    return next();
  }

  // PERFORMANCE: Use synchronous session check - no network latency
  const hasSession = hasValidSession();
  if (hasSession) {
    // BACKGROUND VALIDATION: For Supabase-only mode, validate session in background
    if (isSupabaseOnly && supabase) {
      setTimeout(async () => {
        try {
          const { data: { session }, error } = await supabase!.auth.getSession();
          if (error || !session?.user) {
            console.log('[AuthGuard] Background validation: No valid Supabase session, redirecting to login');
            // Clear invalid session data
            localStorage.removeItem('FinPro_session_cache');
            sessionStorage.removeItem('erp_user');
            sessionStorage.removeItem('erp_session_token');
            sessionStorage.removeItem('erp_auth_timestamp');
            // Redirect to login
            window.location.href = '/login';
          }
        } catch (e) {
          console.error('[AuthGuard] Background validation error:', e);
        }
      }, 100); // Small delay to not block initial navigation
    }

    return next();
  }

  // SUPABASE-ONLY MODE: Redirect to login page instead of SSO
  if (isSupabaseOnly) {
    console.log('[AuthGuard] Supabase-only mode: No session, redirecting to login');
    // Store intended destination for post-auth redirect
    try {
      sessionStorage.setItem('post_auth_redirect', to.fullPath);
    } catch (error) {
      // Ignore storage errors
    }
    return next('/login');
  }

  // No session found - redirect to SSO login
  console.log('[AuthGuard] No session, redirecting to SSO login');

  // Store intended destination for post-auth redirect
  try {
    sessionStorage.setItem('post_auth_redirect', window.location.href);
  } catch (error) {
    // Ignore storage errors
  }

  // Redirect to primary domain's login page
  const ssoUrl = import.meta.env.VITE_SSO_PRIMARY_DOMAIN || window.location.origin;
  const redirectUrl = encodeURIComponent(window.location.href);
  window.location.href = `${ssoUrl}/login?redirect=${redirectUrl}`;
}

/**
 * Helper function to check if user is authenticated (Supabase or NextAuth)
 */
export async function isAuthenticated(): Promise<boolean> {
  // SUPABASE-ONLY MODE: Check Supabase session
  if (isSupabaseOnly && supabase) {
    try {
      const { data: { session }, error } = await supabase.auth.getSession();
      if (error) throw error;
      return !!(session?.user);
    } catch (error) {
      console.error('[AuthGuard] Error checking Supabase authentication:', error);
      return false;
    }
  }

  // NEXTAUTH MODE: Check backend session
  try {
    const backendUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3000';
    const response = await fetch(`${backendUrl}/api/auth/session`, {
      method: 'GET',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json'
      }
    });

    if (response.ok) {
      const session = await response.json();
      return !!(session && session.user);
    }
  } catch (error) {
    console.error('[AuthGuard] Error checking NextAuth authentication:', error);
  }
  return false;
}

/**
 * Helper function to get stored redirect destination
 */
export function getPostAuthRedirect(): string | null {
  try {
    const redirect = sessionStorage.getItem('post_auth_redirect');
    if (redirect && redirect !== '/auth-loading') {
      return redirect;
    }
  } catch (error) {
    console.warn('Unable to retrieve redirect destination:', error);
  }
  return null;
}

/**
 * Helper function to clear stored redirect destination
 */
export function clearPostAuthRedirect(): void {
  try {
    sessionStorage.removeItem('post_auth_redirect');
  } catch (error) {
    console.warn('Unable to clear redirect destination:', error);
  }
}
