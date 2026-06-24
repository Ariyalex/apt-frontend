import { apiSlice } from "./apiSlice";
import type { 
  LoginRequest, 
  AuthResponse, 
  RefreshRequest, 
  LogoutRequest, 
  LogoutResponse, 
  ResetPasswordRequest, 
  ResetPasswordResponse 
} from "@/types/auth";

export const authApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    login: builder.mutation<AuthResponse, LoginRequest>({
      query: (credentials) => ({
        url: "/login",
        method: "POST",
        body: credentials,
      }),
    }),
    refresh: builder.mutation<AuthResponse, RefreshRequest>({
      query: (body) => ({
        url: "/refresh",
        method: "POST",
        body,
      }),
    }),
    logout: builder.mutation<LogoutResponse, LogoutRequest>({
      query: (body) => ({
        url: "/logout",
        method: "POST",
        body,
      }),
    }),
    resetPassword: builder.mutation<ResetPasswordResponse, ResetPasswordRequest>({
      query: (body) => ({
        url: "/reset-password",
        method: "POST",
        body,
      }),
    }),
  }),
});

export const {
  useLoginMutation,
  useRefreshMutation,
  useLogoutMutation,
  useResetPasswordMutation,
} = authApi;
