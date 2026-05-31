import { validateUserCredentials, getUserById, AuthorizedUser } from '@/data/authorizedUsers';
import { User, AuthResponse } from '@/types';
import { storage } from '@/utils';

// Authentication service class
class AuthService {
  private readonly TOKEN_KEY = 'auth_token';
  private readonly LOGIN_ATTEMPTS_KEY = 'login_attempts';
  private readonly MAX_LOGIN_ATTEMPTS = 5;
  private readonly LOCKOUT_DURATION = 15 * 60 * 1000; // 15 minutes

  // Generate a JWT-like token
  private generateToken(userId: string): string {
    const header = btoa(JSON.stringify({ alg: 'HS256', typ: 'JWT' }));
    const payload = btoa(JSON.stringify({ 
      userId, 
      iat: Date.now(), 
      exp: Date.now() + (24 * 60 * 60 * 1000), // 24 hours
      iss: 'npd-havells'
    }));
    const signature = btoa(`${header}.${payload}.havells-secret-key`);
    return `${header}.${payload}.${signature}`;
  }

  // Validate token and extract user ID
  private validateToken(token: string): string | null {
    try {
      const parts = token.split('.');
      if (parts.length !== 3) return null;
      
      const payload = JSON.parse(atob(parts[1]));
      
      // Check if token is expired
      if (payload.exp < Date.now()) return null;
      
      // Check issuer
      if (payload.iss !== 'npd-havells') return null;
      
      return payload.userId;
    } catch {
      return null;
    }
  }

  // Convert AuthorizedUser to User type
  private mapToUser(authorizedUser: AuthorizedUser): User {
    return {
      id: authorizedUser.id,
      email: authorizedUser.email,
      username: authorizedUser.email.split('@')[0],
      firstName: authorizedUser.firstName,
      lastName: authorizedUser.lastName,
      role: authorizedUser.role,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
  }

  // Check if user is locked out due to too many failed attempts
  private isUserLockedOut(email: string): boolean {
    const attempts = storage.get<any>(`${this.LOGIN_ATTEMPTS_KEY}_${email}`);
    if (!attempts) return false;

    if (attempts.count >= this.MAX_LOGIN_ATTEMPTS) {
      const timeSinceLastAttempt = Date.now() - attempts.lastAttempt;
      return timeSinceLastAttempt < this.LOCKOUT_DURATION;
    }

    return false;
  }

  // Record failed login attempt
  private recordFailedAttempt(email: string): void {
    const key = `${this.LOGIN_ATTEMPTS_KEY}_${email}`;
    const attempts = storage.get<any>(key) || { count: 0, lastAttempt: 0 };
    
    attempts.count += 1;
    attempts.lastAttempt = Date.now();
    
    storage.set(key, attempts);
  }

  // Clear failed login attempts
  private clearFailedAttempts(email: string): void {
    storage.remove(`${this.LOGIN_ATTEMPTS_KEY}_${email}`);
  }

  // Get remaining lockout time
  private getRemainingLockoutTime(email: string): number {
    const attempts = storage.get<any>(`${this.LOGIN_ATTEMPTS_KEY}_${email}`);
    if (!attempts) return 0;

    const timeSinceLastAttempt = Date.now() - attempts.lastAttempt;
    const remainingTime = this.LOCKOUT_DURATION - timeSinceLastAttempt;
    
    return remainingTime > 0 ? remainingTime : 0;
  }

  // Login method
  async login(email: string, password: string): Promise<AuthResponse> {
    try {
      // Check if user is locked out
      if (this.isUserLockedOut(email)) {
        const remainingTime = Math.ceil(this.getRemainingLockoutTime(email) / 60000);
        throw new Error(`Account temporarily locked. Try again in ${remainingTime} minutes.`);
      }

      // Simulate network delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Validate credentials
      const authorizedUser = validateUserCredentials(email, password);
      
      if (!authorizedUser) {
        this.recordFailedAttempt(email);
        const attempts = storage.get<any>(`${this.LOGIN_ATTEMPTS_KEY}_${email}`) || { count: 0 };
        const remainingAttempts = this.MAX_LOGIN_ATTEMPTS - attempts.count;
        
        if (remainingAttempts <= 0) {
          throw new Error('Account temporarily locked due to too many failed attempts.');
        } else {
          throw new Error(`Invalid credentials. ${remainingAttempts} attempts remaining.`);
        }
      }

      // Clear failed attempts on successful login
      this.clearFailedAttempts(email);

      // Generate token and user object
      const token = this.generateToken(authorizedUser.id);
      const user = this.mapToUser(authorizedUser);

      // Store token
      storage.set(this.TOKEN_KEY, token);

      return {
        success: true,
        data: { user, token }
      };

    } catch (error) {
      return {
        success: false,
        error: {
          code: 'AUTH_ERROR',
          message: error instanceof Error ? error.message : 'Authentication failed'
        }
      };
    }
  }

  // Logout method
  logout(): void {
    storage.remove(this.TOKEN_KEY);
  }

  // Get current user from stored token
  getCurrentUser(): User | null {
    const token = storage.get<string>(this.TOKEN_KEY);
    if (!token) return null;

    const userId = this.validateToken(token);
    if (!userId) {
      this.logout(); // Clear invalid token
      return null;
    }

    const authorizedUser = getUserById(userId);
    if (!authorizedUser) {
      this.logout(); // Clear token for non-existent user
      return null;
    }

    return this.mapToUser(authorizedUser);
  }

  // Check if user is authenticated
  isAuthenticated(): boolean {
    return this.getCurrentUser() !== null;
  }

  // Refresh token
  refreshToken(): string | null {
    const currentToken = storage.get<string>(this.TOKEN_KEY);
    if (!currentToken) return null;

    const userId = this.validateToken(currentToken);
    if (!userId) return null;

    const newToken = this.generateToken(userId);
    storage.set(this.TOKEN_KEY, newToken);
    
    return newToken;
  }

  // Get token
  getToken(): string | null {
    return storage.get<string>(this.TOKEN_KEY);
  }
}

// Export singleton instance
export const authService = new AuthService();