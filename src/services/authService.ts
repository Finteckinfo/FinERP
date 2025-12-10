import { nextAuthService } from './nextAuthService';

/**
 * AuthService - Wrapper around NextAuthService for backward compatibility
 * This file exists to maintain compatibility with existing code that imports authService
 * All functionality is delegated to nextAuthService
 */
export class AuthService {
  private static instance: AuthService;

  private constructor() {}

  public static getInstance(): AuthService {
    if (!AuthService.instance) {
      AuthService.instance = new AuthService();
    }
    return AuthService.instance;
  }

  /**
   * Get JWT token - delegates to nextAuthService
   */
  public async getJWTToken(): Promise<string | null> {
    return nextAuthService.getJWTToken();
  }

  /**
   * Get auth headers - delegates to nextAuthService
   */
  public async getAuthHeaders(): Promise<Record<string, string>> {
    return nextAuthService.getAuthHeaders();
  }

  /**
   * Get user - delegates to nextAuthService
   */
  public getUser(): any {
    return nextAuthService.getUser();
  }

  /**
   * Clear token cache - delegates to nextAuthService
   */
  public clearTokenCache(): void {
    nextAuthService.clearTokenCache();
  }

  /**
   * Check if token is expired - delegates to nextAuthService
   */
  public isTokenExpired(): boolean {
    return nextAuthService.isTokenExpired();
  }

  /**
   * Handle auth error - delegates to nextAuthService
   */
  public handleAuthError(error: any): void {
    nextAuthService.handleAuthError(error);
  }

  /**
   * Decode JWT payload (for compatibility)
   */
  public decodeJWTPayload(token: string): any {
    try {
      const base64Url = token.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload = decodeURIComponent(
        atob(base64)
          .split('')
          .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
          .join('')
      );
      return JSON.parse(jsonPayload);
    } catch (error) {
      console.error('Error decoding JWT:', error);
      return null;
    }
  }
}

// Export singleton instance
export const authService = AuthService.getInstance();
