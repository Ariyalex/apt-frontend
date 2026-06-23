"use client";

import React, { useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import logoUin from "../../public/logo_uin.png";
import { Lock, User, Eye, EyeOff, Loader2, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
  InputGroupButton,
} from "@/components/ui/input-group";
import { Field, FieldLabel, FieldTitle } from "@/components/ui/field";
import { useLoginMutation } from "@/store/services/authApi";
import { useAppDispatch } from "@/store/hooks";
import { setLoginSession } from "@/store/slices/userSlice";
import { toast } from "sonner";
import type { CustomApiError } from "@/store/services/apiSlice";

export default function RootLoginPage(): React.JSX.Element {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const [login, { isLoading }] = useLoginMutation();

  const [username, setUsername] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [error, setError] = useState<string>("");

  const handleSubmit = async (e: React.FormEvent): Promise<void> => {
    e.preventDefault();

    if (!username || !password) {
      setError("Username dan password wajib diisi.");
      return;
    }

    setError("");

    try {
      const response = await login({ username, password }).unwrap();
      
      toast.success(response.message || "Login berhasil!");
      
      dispatch(
        setLoginSession({
          accessToken: response.data.access_token,
          refreshToken: response.data.refresh_token,
          user: response.data.user,
        })
      );

      if (response.data.user.must_change_password) {
        toast.info("Anda harus mengganti password default Anda terlebih dahulu.");
        router.push("/reset-pass");
      } else {
        router.push("/dashboard");
      }
    } catch (err: unknown) {
      const apiError = err as CustomApiError;
      const errorMessage = apiError?.data || "Username atau password salah. Silakan coba kembali.";
      setError(errorMessage);
      toast.error(errorMessage);
    }
  };

  return (
    <div className="min-h-screen w-screen bg-gradient-to-br from-background via-muted/5 to-muted/20 flex flex-col items-center justify-center p-4 font-sans select-none">
      <div className="max-w-md w-full bg-card border border-border p-8 rounded-xl shadow-md space-y-6 animate-fadeIn">
        {/* Header Section with UIN Logo */}
        <div className="flex flex-col items-center text-center space-y-3.5">
          <Image
            src={logoUin}
            alt="Logo UIN"
            className="object-contain h-14 w-auto select-none"
            priority
          />
          <div>
            <h1 className="text-base font-bold text-foreground tracking-wider uppercase">
              Aplikasi Penjamin Mutu
            </h1>
            <p className="text-xs text-muted-foreground mt-1">
              Universitas Islam Negeri Sunan Kalijaga Yogyakarta
            </p>
          </div>
        </div>

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Error Message Display */}
          {error && (
            <div className="p-3.5 rounded-lg border border-rose-500/10 bg-rose-500/5 text-rose-600 dark:text-rose-400 text-xs font-semibold flex items-center gap-2 animate-fadeIn">
              <AlertCircle className="h-4 w-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Username Input Field */}
          <Field>
            <FieldLabel>
              <FieldTitle>Username</FieldTitle>
            </FieldLabel>
            <InputGroup className="bg-muted/5">
              <InputGroupAddon className="px-2">
                <User className="h-4 w-4 text-muted-foreground/80" />
              </InputGroupAddon>
              <InputGroupInput
                type="text"
                placeholder="Masukkan username Anda..."
                value={username}
                onChange={(e) => {
                  setUsername(e.target.value);
                  if (error) setError("");
                }}
                disabled={isLoading}
                className="h-10 text-xs text-foreground placeholder:text-muted-foreground/60"
              />
            </InputGroup>
          </Field>

          {/* Password Input Field */}
          <Field>
            <FieldLabel>
              <FieldTitle>Password</FieldTitle>
            </FieldLabel>
            <InputGroup className="bg-muted/5">
              <InputGroupAddon className="px-2">
                <Lock className="h-4 w-4 text-muted-foreground/80" />
              </InputGroupAddon>
              <InputGroupInput
                type={showPassword ? "text" : "password"}
                placeholder="Masukkan password Anda..."
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  if (error) setError("");
                }}
                disabled={isLoading}
                className="h-10 text-xs text-foreground placeholder:text-muted-foreground/60"
              />
              <InputGroupButton
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                disabled={isLoading}
                size="icon-sm"
                className="text-muted-foreground hover:text-foreground cursor-pointer flex items-center justify-center shrink-0 w-8"
              >
                {showPassword ? (
                  <EyeOff className="h-3.5 w-3.5" />
                ) : (
                  <Eye className="h-3.5 w-3.5" />
                )}
              </InputGroupButton>
            </InputGroup>
          </Field>

          {/* Submit Action Button */}
          <div className="pt-2">
            <Button
              type="submit"
              disabled={isLoading}
              className="w-full bg-primary text-primary-foreground font-semibold text-xs h-10 rounded-lg hover:bg-primary/95 transition-all shadow-sm flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-75 disabled:pointer-events-none"
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  Memproses Masuk...
                </>
              ) : (
                "Masuk ke Sistem"
              )}
            </Button>
          </div>

          {/* Helper Credentials Card */}
          <div className="pt-4 border-t border-border/40 mt-4 space-y-2 animate-fadeIn">
            <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider block">
              Akun Uji Coba (Demo Accounts)
            </span>
            <div className="grid grid-cols-2 gap-2">
              <div className="p-2.5 rounded-lg bg-muted/20 border border-border/50 text-[11px] space-y-0.5">
                <span className="font-bold text-foreground block leading-tight">
                  Auditee (Fakultas):
                </span>
                <span className="text-muted-foreground block">
                  U: <span className="font-mono font-semibold text-foreground">fakultas</span>
                </span>
                <span className="text-muted-foreground block">
                  P: <span className="font-mono font-semibold text-foreground">password</span>
                </span>
              </div>
              <div className="p-2.5 rounded-lg bg-muted/20 border border-border/50 text-[11px] space-y-0.5">
                <span className="font-bold text-foreground block leading-tight">
                  Admin:
                </span>
                <span className="text-muted-foreground block">
                  U: <span className="font-mono font-semibold text-foreground">admin</span>
                </span>
                <span className="text-muted-foreground block">
                  P: <span className="font-mono font-semibold text-foreground">password</span>
                </span>
              </div>
              <div className="p-2.5 rounded-lg bg-muted/20 border border-border/50 text-[11px] space-y-0.5">
                <span className="font-bold text-foreground block leading-tight">
                  Auditor (LPM):
                </span>
                <span className="text-muted-foreground block">
                  U: <span className="font-mono font-semibold text-foreground">auditor</span>
                </span>
                <span className="text-muted-foreground block">
                  P: <span className="font-mono font-semibold text-foreground">password</span>
                </span>
              </div>
              <div className="p-2.5 rounded-lg bg-muted/20 border border-border/50 text-[11px] space-y-0.5">
                <span className="font-bold text-foreground block leading-tight">
                  Assessor:
                </span>
                <span className="text-muted-foreground block">
                  U: <span className="font-mono font-semibold text-foreground">assessor</span>
                </span>
                <span className="text-muted-foreground block">
                  P: <span className="font-mono font-semibold text-foreground">password</span>
                </span>
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
