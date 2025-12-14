/**
 * Session Synchronization Service
 * Ensures sessions are properly synced across configured domains
 */

export class SessionSyncService {
  private static instance: SessionSyncService;
  private syncInProgress = false;

  static getInstance(): SessionSyncService {
    if (!SessionSyncService.instance) {
      SessionSyncService.instance = new SessionSyncService();
    }
    return SessionSyncService.instance;
  }

  async syncSession(): Promise<boolean> {
    if (this.syncInProgress) {
      console.log('Session sync already in progress');
      return false;
    }

    this.syncInProgress = true;

    try {
      const clerk = (window as any).Clerk;
      
      if (!clerk) {
        console.error('Clerk not initialized');
        return false;
      }

      // Force session refresh to ensure it's synced across domains
      await clerk.session?.touch();
      
      console.log('Session synced successfully');
      return true;
    } catch (error) {
      console.error('Session sync failed:', error);
      return false;
    } finally {
      this.syncInProgress = false;
    }
  }

  /**
   * Check if user is authenticated across domains
   */
  async isAuthenticated(): Promise<boolean> {
    const clerk = (window as any).Clerk;
    return !!(clerk?.session && clerk?.user);
  }

  /**
   * Get current user ID (consistent across domains)
   */
  getUserId(): string | null {
    const clerk = (window as any).Clerk;
    return clerk?.user?.id || null;
  }

  /**
   * Get session token for API calls
   */
  async getToken(): Promise<string | null> {
    try {
      const clerk = (window as any).Clerk;
      if (!clerk?.session) {
        return null;
      }
      return await clerk.session.getToken();
    } catch (error) {
      console.error('Failed to get session token:', error);
      return null;
    }
  }
}

export const sessionSync = SessionSyncService.getInstance();
