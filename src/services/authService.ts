import { LoginCredentials, LoginResponse, User } from "@/types/Auth";
import axios from "axios";
import Cookies from "js-cookie";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "/api";

export class AuthService {
  private static readonly TOKEN_KEY = "authToken";
  private static readonly USER_KEY = "userData";

  /**
   * Login with username and password
   */
  static async login(credentials: LoginCredentials): Promise<LoginResponse> {
    try {
      const response = await axios.post(
        `${API_BASE_URL}/auth/login`,
        credentials,
        {
          headers: {
            "Content-Type": "application/json",
          },
        },
      );

      if (response.data.success && response.data.token) {
        // Store token and user data
        this.setToken(response.data.token);
        if (response.data.user) {
          this.setUser(response.data.user);
        }

        return {
          success: true,
          user: response.data.user,
          token: response.data.token,
          message: response.data.message || "Login successful",
        };
      }

      return {
        success: false,
        message: response.data.message || "Login failed",
      };
    } catch (error: any) {
      console.error("Login error:", error);
      return {
        success: false,
        message:
          error.response?.data?.message || "Login failed. Please try again.",
      };
    }
  }

  /**
   * Logout user and clear stored data
   */
  static logout(): void {
    try {
      // Clear token and user data from storage
      this.clearToken();
      this.clearUser();

      // Optional: Call logout endpoint to invalidate token on server
      // This can be done without awaiting to avoid blocking the UI
      this.callLogoutEndpoint().catch(console.error);
    } catch (error) {
      console.error("Logout error:", error);
    }
  }

  /**
   * Get stored authentication token
   */
  static getToken(): string | null {
    if (typeof window === "undefined") return null;

    // Try to get from cookie first (more secure)
    const cookieToken = Cookies.get(this.TOKEN_KEY);
    if (cookieToken) return cookieToken;

    // Fallback to localStorage
    return localStorage.getItem(this.TOKEN_KEY);
  }

  /**
   * Set authentication token
   */
  static setToken(token: string): void {
    if (typeof window === "undefined") return;

    // Store in both cookie and localStorage
    Cookies.set(this.TOKEN_KEY, token, {
      expires: 7, // 7 days
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
    });
    localStorage.setItem(this.TOKEN_KEY, token);
  }

  /**
   * Clear authentication token
   */
  static clearToken(): void {
    if (typeof window === "undefined") return;

    Cookies.remove(this.TOKEN_KEY);
    localStorage.removeItem(this.TOKEN_KEY);
  }

  /**
   * Get stored user data
   */
  static getUser(): User | null {
    if (typeof window === "undefined") return null;

    try {
      const userData = localStorage.getItem(this.USER_KEY);
      return userData ? JSON.parse(userData) : null;
    } catch (error) {
      console.error("Error parsing user data:", error);
      return null;
    }
  }

  /**
   * Set user data
   */
  static setUser(user: User): void {
    if (typeof window === "undefined") return;

    localStorage.setItem(this.USER_KEY, JSON.stringify(user));
  }

  /**
   * Clear user data
   */
  static clearUser(): void {
    if (typeof window === "undefined") return;

    localStorage.removeItem(this.USER_KEY);
  }

  /**
   * Check if user is authenticated
   */
  static isAuthenticated(): boolean {
    const token = this.getToken();
    return !!token;
  }

  /**
   * Verify token with server
   */
  static async verifyToken(): Promise<{ valid: boolean; user?: User }> {
    const token = this.getToken();
    if (!token) {
      return { valid: false };
    }

    try {
      const response = await axios.get(`${API_BASE_URL}/auth/verify`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.data.success) {
        // Update user data if provided
        if (response.data.user) {
          this.setUser(response.data.user);
        }
        return { valid: true, user: response.data.user };
      }

      // Token is invalid, clear it
      this.clearToken();
      this.clearUser();
      return { valid: false };
    } catch (error: any) {
      console.error("Token verification error:", error);

      // If unauthorized, clear stored data
      if (error.response?.status === 401) {
        this.clearToken();
        this.clearUser();
      }

      return { valid: false };
    }
  }

  /**
   * Refresh authentication token
   */
  static async refreshToken(): Promise<{ success: boolean; token?: string }> {
    const currentToken = this.getToken();
    if (!currentToken) {
      return { success: false };
    }

    try {
      const response = await axios.post(
        `${API_BASE_URL}/auth/refresh`,
        {},
        {
          headers: {
            Authorization: `Bearer ${currentToken}`,
          },
        },
      );

      if (response.data.success && response.data.token) {
        this.setToken(response.data.token);
        return { success: true, token: response.data.token };
      }

      return { success: false };
    } catch (error: any) {
      console.error("Token refresh error:", error);

      // If refresh fails, clear stored data
      if (error.response?.status === 401) {
        this.clearToken();
        this.clearUser();
      }

      return { success: false };
    }
  }

  /**
   * Call logout endpoint to invalidate token on server
   */
  private static async callLogoutEndpoint(): Promise<void> {
    const token = this.getToken();
    if (!token) return;

    try {
      await axios.post(
        `${API_BASE_URL}/auth/logout`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );
    } catch (error) {
      // Don't throw error here as logout should work even if server call fails
      console.warn("Server logout call failed:", error);
    }
  }
}

export default AuthService;
