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

export default function RootLoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!username || !password) {
      setError("Username dan password wajib diisi.");
      return;
    }

    setError("");
    setIsLoading(true);

    // Simulate API request and redirect to respective dashboard
    setTimeout(() => {
      setIsLoading(false);

      const normalizedUser = username.trim().toLowerCase();

      if (normalizedUser === "fakultas" && password === "password") {
        localStorage.setItem(
          "userSession",
          JSON.stringify({
            name: "Ahmad Fauzi",
            role: "Fakultas",
            username: "fakultas",
            initials: "AF",
            avatarUrl:
              "https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=256&auto=format&fit=crop",
          }),
        );
        router.push("/dashboard");
      } else if (normalizedUser === "admin" && password === "password") {
        localStorage.setItem(
          "userSession",
          JSON.stringify({
            name: "Admin Utama",
            role: "Administrator",
            username: "admin",
            initials: "AU",
            avatarUrl: "",
          }),
        );
        router.push("/dashboard");
      } else {
        setError("Username atau password salah. Silakan coba kembali.");
      }
    }, 1200);
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
                  Tipe Fakultas:
                </span>
                <span className="text-muted-foreground block">
                  U:{" "}
                  <span className="font-mono font-semibold text-foreground">
                    fakultas
                  </span>
                </span>
                <span className="text-muted-foreground block">
                  P:{" "}
                  <span className="font-mono font-semibold text-foreground">
                    password
                  </span>
                </span>
              </div>
              <div className="p-2.5 rounded-lg bg-muted/20 border border-border/50 text-[11px] space-y-0.5">
                <span className="font-bold text-foreground block leading-tight">
                  Tipe Admin:
                </span>
                <span className="text-muted-foreground block">
                  U:{" "}
                  <span className="font-mono font-semibold text-foreground">
                    admin
                  </span>
                </span>
                <span className="text-muted-foreground block">
                  P:{" "}
                  <span className="font-mono font-semibold text-foreground">
                    password
                  </span>
                </span>
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
