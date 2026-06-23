import { apiSlice, CustomApiError } from "./apiSlice";
import { 
  LoginRequest, 
  AuthResponse, 
  RefreshRequest, 
  LogoutRequest, 
  LogoutResponse, 
  ResetPasswordRequest, 
  ResetPasswordResponse 
} from "@/types/auth";
import { initialAuthUsers, updatePasswordStatus } from "@/dummy-data/auth";

export const authApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    login: builder.mutation<AuthResponse, LoginRequest>({
      async queryFn(credentials: LoginRequest): Promise<{ data: AuthResponse } | { error: CustomApiError }> {
        // Simulate network delay
        await new Promise<void>((resolve) => setTimeout(resolve, 800));

        const username = credentials.username.trim().toLowerCase();
        const password = credentials.password || "";

        // Determine correct password for mock database
        let isValid = false;
        if (username === "admin" && (password === "admin123" || password === "password")) {
          isValid = true;
        } else if (username === "fakultas" && password === "password") {
          isValid = true;
        } else if (username === "auditor" && password === "password") {
          isValid = true;
        } else if (username === "assessor" && password === "password") {
          isValid = true;
        }

        if (isValid) {
          const user = initialAuthUsers.find((u) => u.username === username);
          if (user) {
            return {
              data: {
                success: true,
                status: 200,
                message: "Login successfuly!",
                path: "/login",
                timestamp: new Date().toISOString(),
                data: {
                  access_token: `access_token_for_${username}_${Date.now()}`,
                  refresh_token: `refresh_token_for_${username}_${Date.now()}`,
                  user,
                },
              },
            };
          }
        }

        return {
          error: {
            status: 401,
            data: "Username atau password salah.",
          },
        };
      },
    }),
    refresh: builder.mutation<AuthResponse, RefreshRequest>({
      async queryFn(body: RefreshRequest): Promise<{ data: AuthResponse } | { error: CustomApiError }> {
        await new Promise<void>((resolve) => setTimeout(resolve, 600));

        // Extract username from fake token
        const match = body.refresh_token.match(/refresh_token_for_([^_]+)_/);
        const username = match ? match[1] : "";
        const user = initialAuthUsers.find((u) => u.username === username);

        if (user) {
          return {
            data: {
              success: true,
              status: 200,
              message: "Refresh successfuly!",
              path: "/refresh",
              timestamp: new Date().toISOString(),
              data: {
                access_token: `access_token_for_${username}_${Date.now()}`,
                refresh_token: `refresh_token_for_${username}_${Date.now()}`,
                user,
              },
            },
          };
        }

        return {
          error: {
            status: 401,
            data: "Refresh token tidak valid atau kadaluarsa.",
          },
        };
      },
    }),
    logout: builder.mutation<LogoutResponse, LogoutRequest>({
      async queryFn(): Promise<{ data: LogoutResponse } | { error: CustomApiError }> {
        await new Promise<void>((resolve) => setTimeout(resolve, 600));

        return {
          data: {
            success: true,
            status: 200,
            message: "Logout successfuly!",
            path: "/logout",
            timestamp: new Date().toISOString(),
            data: null,
          },
        };
      },
    }),
    resetPassword: builder.mutation<ResetPasswordResponse, ResetPasswordRequest>({
      async queryFn(body: ResetPasswordRequest): Promise<{ data: ResetPasswordResponse } | { error: CustomApiError }> {
        await new Promise<void>((resolve) => setTimeout(resolve, 800));

        if (body.password1 !== body.password2) {
          return {
            error: {
              status: 400,
              data: "Konfirmasi password tidak cocok.",
            },
          };
        }

        // Get logged in username from localStorage to perform the reset on mock database
        let username = "admin";
        if (typeof window !== "undefined") {
          const raw = localStorage.getItem("userSession");
          if (raw) {
            try {
              const session = JSON.parse(raw);
              username = session.username || "admin";
            } catch {
              // ignore
            }
          }
        }

        // Update password change status to false
        updatePasswordStatus(username, false);

        return {
          data: {
            success: true,
            status: 200,
            message: "Password berhasil direset silahkan login kembali.",
            path: "/reset-password",
            timestamp: new Date().toISOString(),
            data: null,
          },
        };
      },
    }),
  }),
});

export const {
  useLoginMutation,
  useRefreshMutation,
  useLogoutMutation,
  useResetPasswordMutation,
} = authApi;
