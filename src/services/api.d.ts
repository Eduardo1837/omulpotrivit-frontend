import type { AxiosInstance } from 'axios';

export interface AuthUser {
  id: number;
  name: string;
  email: string;
  phone: string | null;
  city: string | null;
  avatarUrl: string | null;
  role: string;
}

export interface AuthResponse {
  user: AuthUser;
  token: string;
}

export interface RegisterPayload {
  name: string;
  email: string;
  password: string;
  password_confirmation: string;
  phone?: string;
  city?: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export const authService: {
  register(payload: RegisterPayload): Promise<AuthResponse>;
  login(credentials: LoginCredentials): Promise<AuthResponse>;
  logout(): Promise<void>;
  getUser(): Promise<AuthUser>;
  getToken(): string | null;
  isAuthenticated(): boolean;
};

declare const api: AxiosInstance;
export default api;
