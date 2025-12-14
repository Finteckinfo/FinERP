import { getCookie } from '@/utils/cookies';
import { logger } from './logger';

/**
 * NextAuth Service - Replaces Clerk authService
 * Manages JWT tokens from NextAuth session for backend API calls
 */
export class NextAuthService {
  private static instance: NextAuthService;
  private tokenCache: string | null = null;
  private tokenExpiry: number | null = null;
  private userCache: any = null;

  private constructor() { }

  public static getInstance(): NextAuthService {
    if (!NextAuthService.instance) {
      NextAuthService.instance = new NextAuthService();
    }
    return NextAuthService.instance;
  }

  /**
   * Check if NextAuth session exists
   */
  private hasSession(): boolean {
    const sessionToken = getCookie('next-auth.session-token') ||
      getCookie('__Secure-next-auth.session-token') ||
      getCookie('finerp_sso_token'); // Also check for SSO token
    return !!sessionToken;
  }

  /**
   * PERFORMANCE: Get JWT token synchronously from cookie/cache
   * No network calls - instant response
   */
  public getJWTTokenSync(): string | null {
    // Return cached token if still valid
    if (this.tokenCache && this.tokenExpiry && Date.now() < this.tokenExpiry) {
      return this.tokenCache;
    }

    // Get token from cookie (synchronous)
    const sessionToken = getCookie('next-auth.session-token') ||
      getCookie('__Secure-next-auth.session-token') ||
      getCookie('finerp_sso_token');

    if (sessionToken) {
      this.tokenCache = sessionToken;
      this.tokenExpiry = Date.now() + (10 * 60 * 1000); // 10 minutes cache
      return sessionToken;
    }

    // Check SSO sessionStorage
    const ssoToken = sessionStorage.getItem('erp_session_token');
    if (ssoToken) {
      const timestamp = sessionStorage.getItem('erp_auth_timestamp');
      if (timestamp) {
        const age = Date.now() - parseInt(timestamp);
        if (age < 24 * 60 * 60 * 1000) { // 24 hours
          this.tokenCache = ssoToken;
          this.tokenExpiry = Date.now() + (10 * 60 * 1000);
          return ssoToken;
        }
      }
    }

    return null;
  }

  /**
   * Get JWT token for backend API calls
   * PERFORMANCE: Uses sync method first, only falls back to async if needed
   */
  public async getJWTToken(): Promise<string | null> {
    // PERFORMANCE: Try sync first
    const syncToken = this.getJWTTokenSync();
    if (syncToken) {
      return syncToken;
    }

    try {
      // Check if NextAuth session exists first
      if (this.hasSession()) {
        // Return cached token if still valid
        if (this.tokenCache && this.tokenExpiry && Date.now() < this.tokenExpiry) {
          return this.tokenCache;
        }

        // Get token from cookie
        const sessionToken = getCookie('next-auth.session-token') ||
          getCookie('__Secure-next-auth.session-token') ||
          getCookie('finerp_sso_token');

        if (sessionToken) {
          // PERFORMANCE: Use token directly without backend validation
          // Backend validation happens on actual API calls
          this.tokenCache = sessionToken;
          this.tokenExpiry = Date.now() + (10 * 60 * 1000); // 10 minutes
          return sessionToken;
        }
      }

      // If no NextAuth session, check for SSO session
      logger.debug('[NextAuth] No NextAuth session, checking SSO session...');
      const ssoUser = sessionStorage.getItem('erp_user');
      const ssoToken = sessionStorage.getItem('erp_session_token');

      if (ssoUser && ssoToken) {
        // Validate SSO session is still valid (24 hours)
        const timestamp = sessionStorage.getItem('erp_auth_timestamp');
        if (timestamp) {
          const age = Date.now() - parseInt(timestamp);
          const maxAge = 24 * 60 * 60 * 1000; // 24 hours

          if (age > maxAge) {
            // Session expired, clear storage
            sessionStorage.removeItem('erp_user');
            sessionStorage.removeItem('erp_session_token');
            sessionStorage.removeItem('erp_auth_timestamp');
            logger.debug('[NextAuth] SSO session expired');
            return null;
          }
        }

        logger.debug('[NextAuth] Using SSO session token');
        this.tokenCache = ssoToken;
        this.tokenExpiry = Date.now() + (10 * 60 * 1000);
        return ssoToken;
      }

      logger.debug('[NextAuth] No session found');
      return null;
    } catch (error) {
      logger.error('[NextAuth] Error getting JWT token', error);
      this.clearTokenCache();
      return null;
    }
  }


  /**
   * Get authentication headers for API calls
   * Supports both NextAuth sessions and SSO sessions
   */
  public async getAuthHeaders(): Promise<Record<string, string>> {
    // First, try to get NextAuth session token
    const sessionToken = getCookie('next-auth.session-token') ||
      getCookie('__Secure-next-auth.session-token') ||
      getCookie('finerp_sso_token'); // Also check for SSO token

    if (sessionToken) {
      return {
        'Authorization': `Bearer ${sessionToken}`,
        'Content-Type': 'application/json',
      };
    }

    // If no NextAuth session, check for SSO session
    try {
      const ssoUser = sessionStorage.getItem('erp_user');
      const ssoToken = sessionStorage.getItem('erp_session_token');

      if (ssoUser && ssoToken) {
        // Validate SSO session is still valid (24 hours)
        const timestamp = sessionStorage.getItem('erp_auth_timestamp');
        if (timestamp) {
          const age = Date.now() - parseInt(timestamp);
          const maxAge = 24 * 60 * 60 * 1000; // 24 hours

          if (age > maxAge) {
            // Session expired, clear storage
            sessionStorage.removeItem('erp_user');
            sessionStorage.removeItem('erp_session_token');
            sessionStorage.removeItem('erp_auth_timestamp');
            throw new Error('SSO session expired');
          }
        }

        logger.debug('[NextAuth] Using SSO session for API authentication');
        return {
          'Authorization': `Bearer ${ssoToken}`,
          'Content-Type': 'application/json',
        };
      }
    } catch (error) {
      logger.warn('[NextAuth] SSO session validation failed:', { error });
    }

    throw new Error('No NextAuth session available');
  }

  /**
   * Get current user data
   */
  public getUser(): any {
    return this.userCache;
  }

  /**
   * Clear token cache (for logout)
   */
  public clearTokenCache(): void {
    this.tokenCache = null;
    this.tokenExpiry = null;
    this.userCache = null;
  }

  /**
   * Check if token is expired
   */
  public isTokenExpired(): boolean {
    return !this.tokenExpiry || Date.now() >= this.tokenExpiry;
  }

  /**
   * Handle authentication errors
   */
  public handleAuthError(error: any): void {
    logger.error('[NextAuth] Authentication error occurred', error);

    if (error.response?.status === 401) {
      logger.warn('[NextAuth] Unauthorized - clearing token cache');
      this.clearTokenCache();

      // Redirect to SSO login
      const ssoUrl = import.meta.env.VITE_SSO_PRIMARY_DOMAIN || window.location.origin;
      window.location.href = `${ssoUrl}/login?redirect=${encodeURIComponent(window.location.href)}`;
    }
  }
}

// Export singleton instance
export const nextAuthService = NextAuthService.getInstance();
