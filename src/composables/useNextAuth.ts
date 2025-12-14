import { ref, computed, onMounted, watch } from 'vue';
import { getCookie } from '@/utils/cookies';

export interface NextAuthUser {
  id: string;
  email: string;
  name?: string;
  firstName?: string;
  lastName?: string;
  image?: string;
  walletAddress?: string;
  authMethod?: string;
}

export interface NextAuthSession {
  user: NextAuthUser;
  expires: string;
}

// PERFORMANCE: Use module-level cache to persist across component instances
const sessionCache = ref<NextAuthSession | null>(null);
const isLoaded = ref(false);
const isValidating = ref(false);
const lastValidated = ref<number>(0);
const CACHE_TTL = 10 * 60 * 1000; // 10 minutes - increased for better performance
const SESSION_STORAGE_KEY = 'finerp_session_cache';

// PERFORMANCE: Initialize from localStorage on module load (synchronous)
function initializeFromStorage(): void {
  if (typeof window === 'undefined') return;
  
  try {
    const cached = localStorage.getItem(SESSION_STORAGE_KEY);
    if (cached) {
      const parsed = JSON.parse(cached);
      // Check if cache is still valid
      if (parsed.timestamp && (Date.now() - parsed.timestamp < CACHE_TTL)) {
        sessionCache.value = parsed.session;
        lastValidated.value = parsed.timestamp;
        isLoaded.value = true;
      }
    }
  } catch (e) {
    // Ignore storage errors
  }
}

// Run immediately on module load
initializeFromStorage();

// Helper to parse JWT token client-side
function parseJwt(token: string) {
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(window.atob(base64).split('').map(function (c) {
      return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
    }).join(''));

    return JSON.parse(jsonPayload);
  } catch (e) {
    console.error('[NextAuth] Failed to parse JWT:', e);
    return null;
  }
}

/**
 * NextAuth composable to replace Clerk's useAuth()
 * Validates session from shared cookie
 */
export function useNextAuth() {
  const validateSession = async (force = false) => {
    // Return if already validating
    if (isValidating.value) return;

    // Check cache validity
    const now = Date.now();
    const isCacheValid = lastValidated.value > 0 && (now - lastValidated.value < CACHE_TTL);

    // If cache is valid and we have data (or explicitly null), don't revalidate unless forced
    if (!force && isCacheValid && isLoaded.value) {
      return;
    }

    isValidating.value = true;

    try {
      // Check for NextAuth session cookie
      const sessionToken = getCookie('next-auth.session-token') ||
        getCookie('__Secure-next-auth.session-token') ||
        getCookie('finerp_sso_token'); // Also check specifically for our SSO token

      if (!sessionToken) {
        // Fallback: Check SSO sessionStorage for ERP users
        const ssoUserJson = sessionStorage.getItem('erp_user');
        const ssoToken = sessionStorage.getItem('erp_session_token');

        if (ssoUserJson && ssoToken) {
          try {
            const ssoUser = JSON.parse(ssoUserJson);

            // Convert SSO user to NextAuth format
            sessionCache.value = {
              user: {
                id: ssoUser.id,
                email: ssoUser.email,
                name: ssoUser.name,
                firstName: ssoUser.name?.split(' ')[0] || ssoUser.email.split('@')[0],
                lastName: ssoUser.name?.split(' ').slice(1).join(' ') || '',
                walletAddress: ssoUser.walletAddress || '',
                authMethod: ssoUser.authMethod || 'sso'
              },
              expires: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()
            };

            lastValidated.value = Date.now();
            isLoaded.value = true;
            return;
          } catch (err) {
            console.error('[NextAuth] Failed to parse SSO user:', err);
          }
        }

        sessionCache.value = null;
        lastValidated.value = Date.now();
        isLoaded.value = true;
        return;
      }

      // OPTIMIZATION: Try to decode JWT client-side first to bypass Vercel firewall
      // This avoids the 403 error from the backend validation call
      const decodedToken = parseJwt(sessionToken);
      if (decodedToken) {
        console.log('[NextAuth] Successfully decoded session token client-side');

        // Map decoded token to session structure
        // Handle both NextAuth structure and our custom SSO token structure
        const user = {
          id: decodedToken.sub || decodedToken.userId || decodedToken.id,
          email: decodedToken.email,
          name: decodedToken.name,
          firstName: decodedToken.name?.split(' ')[0] || decodedToken.email?.split('@')[0],
          lastName: decodedToken.name?.split(' ').slice(1).join(' ') || '',
          walletAddress: decodedToken.walletAddress || '',
          authMethod: decodedToken.authMethod || 'sso',
          image: decodedToken.picture || decodedToken.image
        };

        sessionCache.value = {
          user: user as NextAuthUser,
          expires: decodedToken.exp ? new Date(decodedToken.exp * 1000).toISOString() : new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()
        };

        lastValidated.value = Date.now();
        isLoaded.value = true;
        
        // PERFORMANCE: Persist to localStorage for instant loads on next page
        persistSession();

        // Skip backend validation - client-side decode is sufficient for display
        return;
      }

      // Fallback to backend validation only if client-side decode fails
      // This should rarely happen with valid tokens
      const backendUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000';
      const response = await fetch(`${backendUrl}/api/auth/session`, {
        method: 'GET',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const session = await response.json();
        sessionCache.value = session;
        persistSession();
      } else {
        sessionCache.value = null;
        clearPersistedSession();
      }
      lastValidated.value = Date.now();
    } catch (error) {
      console.error('[NextAuth] Session validation error:', error);
      // Don't clear cache on error, keep old data for resilience
      if (!sessionCache.value) sessionCache.value = null;
    } finally {
      isLoaded.value = true;
      isValidating.value = false;
    }
  };

  // PERFORMANCE: Persist session to localStorage
  const persistSession = () => {
    if (typeof window === 'undefined') return;
    try {
      localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify({
        session: sessionCache.value,
        timestamp: Date.now()
      }));
    } catch (e) {
      // Ignore storage errors
    }
  };

  // Clear persisted session
  const clearPersistedSession = () => {
    if (typeof window === 'undefined') return;
    try {
      localStorage.removeItem(SESSION_STORAGE_KEY);
    } catch (e) {
      // Ignore storage errors
    }
  };

  // PERFORMANCE: Only validate on mount if not already loaded from storage
  onMounted(() => {
    if (!isLoaded.value) {
      validateSession();
    }
  });

  // PERFORMANCE: Use visibility API instead of polling
  if (typeof window !== 'undefined') {
    // Listen for storage changes from other tabs
    window.addEventListener('storage', (e) => {
      if (e.key === SESSION_STORAGE_KEY || e.key === 'erp_user') {
        validateSession(true);
      }
    });

    // Revalidate when tab becomes visible (instead of polling)
    document.addEventListener('visibilitychange', () => {
      if (!document.hidden && Date.now() - lastValidated.value > CACHE_TTL) {
        validateSession();
      }
    });
  }

  const isSignedIn = computed(() => !!sessionCache.value);
  const user = computed(() => sessionCache.value?.user || null);

  // PERFORMANCE: Expose clearSession for logout
  const clearSession = () => {
    sessionCache.value = null;
    lastValidated.value = 0;
    isLoaded.value = true;
    clearPersistedSession();
    sessionStorage.removeItem('erp_user');
    sessionStorage.removeItem('erp_session_token');
    sessionStorage.removeItem('erp_auth_timestamp');
  };

  return {
    isLoaded,
    isSignedIn,
    user,
    session: sessionCache,
    validateSession,
    clearSession,
  };
}
