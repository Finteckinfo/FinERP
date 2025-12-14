import type { NavigationGuardNext, RouteLocationNormalized } from 'vue-router';
import { getCookie } from '@/utils/cookies';

/**
 * Authentication Guard for FinERP
 * 
 * PERFORMANCE OPTIMIZED:
 * - Uses synchronous cookie/storage checks (no network calls)
 * - Network validation happens in background after page loads
 * - Instant navigation for authenticated users
 */

// PERFORMANCE: Synchronous session check - no network latency
function hasValidSession(): boolean {
  // Check cookies first (fastest)
  const sessionToken = getCookie('next-auth.session-token') ||
    getCookie('__Secure-next-auth.session-token') ||
    getCookie('finerp_sso_token');
  
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
    const cached = localStorage.getItem('finerp_session_cache');
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

  // PERFORMANCE: Use synchronous check - no network call
  if (hasValidSession()) {
    return next();
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
 * Helper function to check if user has NextAuth session
 */
export async function isAuthenticated(): Promise<boolean> {
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
    console.error('[AuthGuard] Error checking authentication:', error);
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
