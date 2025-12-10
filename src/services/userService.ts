// Unified User Service for Web2 and Web3 Authentication
// Handles user data consistently across both authentication methods

export interface UserInfo {
  authMethod: 'web2' | 'web3';
  userId: string;
  username: string;
  displayName: string;
  email?: string;
  walletAddress?: string;
  firstName?: string;
  lastName?: string;
  avatar?: string;
  createdAt: number;
}

export class UserService {
  private static instance: UserService;
  private currentUser: UserInfo | null = null;

  private constructor() {
    this.loadUserFromStorage();
  }

  public static getInstance(): UserService {
    if (!UserService.instance) {
      UserService.instance = new UserService();
    }
    return UserService.instance;
  }

  // Load user info from localStorage
  private loadUserFromStorage(): void {
    try {
      const storedUser = localStorage.getItem('user_info');
      if (storedUser) {
        this.currentUser = JSON.parse(storedUser);
      }
    } catch (error) {
      console.error('Error loading user from storage:', error);
      this.currentUser = null;
    }
  }

  // Set Web2 user (from Clerk)
  public setWeb2User(clerkUser: any): void {
    const userInfo: UserInfo = {
      authMethod: 'web2',
      userId: clerkUser.id,
      username: clerkUser.username || `user-${clerkUser.id.substring(0, 8)}`,
      displayName: `${clerkUser.firstName || ''} ${clerkUser.lastName || ''}`.trim() || clerkUser.username || clerkUser.emailAddresses[0]?.emailAddress || 'User',
      email: clerkUser.emailAddresses[0]?.emailAddress,
      firstName: clerkUser.firstName,
      lastName: clerkUser.lastName,
      avatar: clerkUser.imageUrl,
      createdAt: clerkUser.createdAt || Date.now()
    };

    this.currentUser = userInfo;
    localStorage.setItem('user_info', JSON.stringify(userInfo));
    localStorage.setItem('clerk_authenticated', 'true');
  }

  // Set Web3 user (from wallet)
  public setWeb3User(walletAddress: string, additionalInfo?: Partial<UserInfo>): void {
    const userInfo: UserInfo = {
      authMethod: 'web3',
      userId: walletAddress,
      walletAddress: walletAddress,
      username: additionalInfo?.username || `User-${walletAddress.substring(0, 8)}`,
      displayName: additionalInfo?.displayName || `${walletAddress.substring(0, 6)}...${walletAddress.substring(walletAddress.length - 4)}`,
      createdAt: additionalInfo?.createdAt || Date.now()
    };

    this.currentUser = userInfo;
    localStorage.setItem('user_info', JSON.stringify(userInfo));
    localStorage.setItem('web3_authenticated', 'true');
  }

  // Get current user
  public getCurrentUser(): UserInfo | null {
    if (!this.currentUser) {
      this.loadUserFromStorage();
    }
    return this.currentUser;
  }

  // Get user display name
  public getDisplayName(): string {
    const user = this.getCurrentUser();
    return user?.displayName || 'Guest';
  }

  // Get username
  public getUsername(): string {
    const user = this.getCurrentUser();
    return user?.username || 'guest';
  }

  // Check if user is authenticated
  public isAuthenticated(): boolean {
    return this.getCurrentUser() !== null;
  }

  // Check if authenticated via Web2
  public isWeb2User(): boolean {
    const user = this.getCurrentUser();
    return user?.authMethod === 'web2';
  }

  // Check if authenticated via Web3
  public isWeb3User(): boolean {
    const user = this.getCurrentUser();
    return user?.authMethod === 'web3';
  }

  // Get user identifier (email for Web2, wallet for Web3)
  public getUserIdentifier(): string {
    const user = this.getCurrentUser();
    if (!user) return '';
    
    return user.authMethod === 'web2' 
      ? (user.email || user.username) 
      : (user.walletAddress || user.username);
  }

  // Clear user session
  public clearUser(): void {
    this.currentUser = null;
    localStorage.removeItem('user_info');
    localStorage.removeItem('clerk_authenticated');
    localStorage.removeItem('web3_authenticated');
    localStorage.removeItem('clerk_session');
    localStorage.removeItem('active_wallet');
  }

  // Update user info
  public updateUserInfo(updates: Partial<UserInfo>): void {
    if (!this.currentUser) return;

    this.currentUser = {
      ...this.currentUser,
      ...updates
    };

    localStorage.setItem('user_info', JSON.stringify(this.currentUser));
  }
}

// Export singleton instance
export const userService = UserService.getInstance();
