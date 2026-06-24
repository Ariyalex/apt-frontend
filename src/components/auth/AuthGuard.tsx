"use client";

import React, { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useAppSelector, useAppDispatch } from "@/store/hooks";
import { setLoginSession, clearSession } from "@/store/slices/userSlice";
import { Loader2 } from "lucide-react";
import type { UserAuth } from "@/types/auth";

export default function AuthGuard({ children }: { children: React.ReactNode }): React.JSX.Element {
  const router = useRouter();
  const pathname = usePathname();
  const dispatch = useAppDispatch();
  const { isLoggedIn, user } = useAppSelector((state) => state.user);
  const [isInitializing, setIsInitializing] = useState<boolean>(true);

  // Restore session from localStorage during application mount
  useEffect(() => {
    const restoreSession = (): void => {
      if (typeof window !== "undefined") {
        const rawSession = localStorage.getItem("userSession");
        const accessToken = localStorage.getItem("accessToken");
        const refreshToken = localStorage.getItem("refreshToken");

        if (rawSession && accessToken && refreshToken) {
          try {
            const parsedSession = JSON.parse(rawSession);
            const reconstructedUser: UserAuth = {
              id: parsedSession.id || "",
              username: parsedSession.username || "",
              name: parsedSession.name || "",
              email: parsedSession.email || "",
              institute_id: parsedSession.institute_id || null,
              role: parsedSession.role || "",
              is_banned: parsedSession.is_banned || false,
              must_change_password: parsedSession.must_change_password ?? false,
              created_at: parsedSession.created_at || new Date().toISOString(),
            };
            
            dispatch(
              setLoginSession({
                accessToken,
                refreshToken,
                user: reconstructedUser,
              })
            );
          } catch {
            dispatch(clearSession());
          }
        }
      }
      setIsInitializing(false);
    };

    restoreSession();
  }, [dispatch]);

  // Route authorization and path-locking validation
  useEffect(() => {
    if (isInitializing) return;

    const isDashboardPath = pathname.startsWith("/dashboard");
    const isResetPassPath = pathname === "/reset-pass";
    const isLoginPage = pathname === "/";
    
    // Public paths like /[customLink] (e.g. generated forms) bypass authentication entirely
    const isPublicPage = !isDashboardPath && !isResetPassPath && !isLoginPage;

    if (isLoggedIn && user) {
      if (user.must_change_password) {
        // Force-lock to /reset-pass if must_change_password is true (unless visiting a public page)
        if (!isResetPassPath && !isPublicPage) {
          router.replace("/reset-pass");
        }
      } else {
        // Prevent logged in users with false must_change_password from accessing login or reset-pass pages
        if (isResetPassPath || isLoginPage) {
          router.replace("/dashboard");
        }
      }
    } else {
      // Unauthenticated users attempting to access dashboard or reset-pass are redirected to login
      if (isDashboardPath || isResetPassPath) {
        router.replace("/");
      }
    }
  }, [isLoggedIn, user, pathname, isInitializing, router]);

  const isDashboardPath = pathname.startsWith("/dashboard");
  const isResetPassPath = pathname === "/reset-pass";
  const isLoginPage = pathname === "/";
  const isProtectedPath = isDashboardPath || isResetPassPath;

  // Verify authorization synchronously before rendering children
  let isAuthorized = false;

  if (!isInitializing) {
    if (!isLoggedIn) {
      isAuthorized = !isProtectedPath;
    } else if (user) {
      if (user.must_change_password) {
        isAuthorized = isResetPassPath || !isProtectedPath;
      } else {
        isAuthorized = !isResetPassPath && !isLoginPage;
      }
    }
  }

  // Display a full-screen loading spinner during initialization or while unauthorized redirect is pending
  if (isInitializing || !isAuthorized) {
    return (
      <div className="min-h-screen w-screen flex items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return <>{children}</>;
}
