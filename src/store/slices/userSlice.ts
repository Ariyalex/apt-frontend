"use client";

import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { UserAuth } from "@/types/auth";

export interface UserState {
  accessToken: string | null;
  refreshToken: string | null;
  user: UserAuth | null;
  isLoggedIn: boolean;
}

const initialState: UserState = {
  accessToken: null,
  refreshToken: null,
  user: null,
  isLoggedIn: false,
};

const mapRole = (role: string): string => {
  const r = role.toLowerCase();
  if (r === "admin") return "Administrator";
  if (r === "upps") return "UPPS";
  if (r === "lpm") return "LPM";
  if (r === "assessor") return "Assessor";
  return role;
};

export const userSlice = createSlice({
  name: "user",
  initialState,
  reducers: {
    setLoginSession: (
      state: UserState,
      action: PayloadAction<{
        accessToken: string;
        refreshToken: string;
        user: UserAuth;
      }>,
    ): void => {
      state.accessToken = action.payload.accessToken;
      state.refreshToken = action.payload.refreshToken;
      state.user = action.payload.user;
      state.isLoggedIn = true;

      // Persist to localStorage for compatibility with other parts of the app
      if (typeof window !== "undefined") {
        const u = action.payload.user;
        const initials =
          u.name
            .split(" ")
            .map((n) => n[0])
            .join("")
            .toUpperCase()
            .slice(0, 2) || "US";
        const avatarUrl =
          "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?q=80&w=256&auto=format&fit=crop";
        const role = mapRole(u.role);

        localStorage.setItem(
          "userSession",
          JSON.stringify({
            id: u.id,
            name: u.name,
            role,
            username: u.username,
            initials,
            avatarUrl,
            must_change_password: u.must_change_password,
            email: u.email,
            institute_id: u.institute_id,
            is_banned: u.is_banned,
            created_at: u.created_at,
          }),
        );
        localStorage.setItem("accessToken", action.payload.accessToken);
        localStorage.setItem("refreshToken", action.payload.refreshToken);
      }
    },
    clearSession: (state: UserState): void => {
      state.accessToken = null;
      state.refreshToken = null;
      state.user = null;
      state.isLoggedIn = false;

      if (typeof window !== "undefined") {
        localStorage.removeItem("userSession");
        localStorage.removeItem("accessToken");
        localStorage.removeItem("refreshToken");
      }
    },
    updatePasswordStatus: (
      state: UserState,
      action: PayloadAction<boolean>,
    ): void => {
      if (state.user) {
        state.user.must_change_password = action.payload;

        // Update userSession in localStorage if it exists
        if (typeof window !== "undefined") {
          const raw = localStorage.getItem("userSession");
          if (raw) {
            try {
              const session = JSON.parse(raw);
              localStorage.setItem(
                "userSession",
                JSON.stringify({
                  ...session,
                  must_change_password: action.payload,
                }),
              );
            } catch {
              // ignore
            }
          }
        }
      }
    },
  },
});

export const { setLoginSession, clearSession, updatePasswordStatus } =
  userSlice.actions;
export default userSlice.reducer;
