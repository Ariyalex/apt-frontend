export interface UserAuth {
  id: string;
  username: string;
  name: string;
  email: string;
  institute_id: string | null;
  role: "admin" | "fakultas" | "auditor" | string;
  is_banned: boolean;
  must_change_password: boolean;
  created_at: string;
}

export interface AuthData {
  access_token: string;
  refresh_token: string;
  user: UserAuth;
}

export interface ApiResponse<T> {
  success: boolean;
  status: number;
  message: string;
  path: string;
  timestamp: string;
  data: T;
}

export type AuthResponse = ApiResponse<AuthData>;
export type LogoutResponse = ApiResponse<null>;
export type ResetPasswordResponse = ApiResponse<null>;

export interface LoginRequest {
  username: string;
  password?: string;
}

export interface RefreshRequest {
  refresh_token: string;
}

export interface LogoutRequest {
  refresh_token: string;
}

export interface ResetPasswordRequest {
  password1: string;
  password2: string;
}
