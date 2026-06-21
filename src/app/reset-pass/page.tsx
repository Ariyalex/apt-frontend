"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import logoUin from "../../../public/logo_uin.png";
import { Lock, Eye, EyeOff, Loader2, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
  InputGroupButton,
} from "@/components/ui/input-group";
import { Field, FieldLabel, FieldTitle } from "@/components/ui/field";
import { toast } from "sonner";

export default function ResetPasswordPage() {
  const router = useRouter();
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  
  // Logged-in user state (defaults to dummy data)
  const [currentUser, setCurrentUser] = useState({ 
    name: "Ahmad Fauzi", 
    username: "fakultas" 
  });

  useEffect(() => {
    const raw = localStorage.getItem("userSession");
    if (raw) {
      try {
        const session = JSON.parse(raw);
        if (session.name && session.username) {
          setCurrentUser({ name: session.name, username: session.username });
        }
      } catch (e) {
        // Keep fallback dummy data
      }
    }
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!newPassword || !confirmPassword) {
      setError("Semua field wajib diisi.");
      return;
    }

    if (newPassword.length < 6) {
      setError("Password baru minimal harus 6 karakter.");
      return;
    }

    if (newPassword !== confirmPassword) {
      setError("Password konfirmasi tidak cocok.");
      return;
    }

    setError("");
    setIsLoading(true);

    // Simulate API request
    setTimeout(() => {
      setIsLoading(false);
      toast.success("Password Anda berhasil direset!");
      
      // Clear forms
      setNewPassword("");
      setConfirmPassword("");
    }, 1500);
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
              Reset Password Akun
            </p>
          </div>
        </div>

        {/* User Session Info Card */}
        <div className="p-3.5 bg-muted/25 border border-border/60 rounded-lg text-xs space-y-1.5 animate-fadeIn">
          <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block">
            Pengguna yang Sedang Login
          </span>
          <div className="flex justify-between items-center gap-4">
            <span className="font-bold text-foreground truncate max-w-[60%]">
              {currentUser.name}
            </span>
            <span className="font-mono text-muted-foreground text-[11px] shrink-0 font-semibold">
              @{currentUser.username}
            </span>
          </div>
        </div>

        {/* Reset Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Error Message Display */}
          {error && (
            <div className="p-3.5 rounded-lg border border-rose-500/10 bg-rose-500/5 text-rose-600 dark:text-rose-400 text-xs font-semibold flex items-center gap-2 animate-fadeIn">
              <AlertCircle className="h-4 w-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* New Password Input Field */}
          <Field>
            <FieldLabel>
              <FieldTitle>Password Baru</FieldTitle>
            </FieldLabel>
            <InputGroup className="bg-muted/5">
              <InputGroupAddon className="px-2">
                <Lock className="h-4 w-4 text-muted-foreground/80" />
              </InputGroupAddon>
              <InputGroupInput
                type={showNewPassword ? "text" : "password"}
                placeholder="Masukkan password baru..."
                value={newPassword}
                onChange={(e) => {
                  setNewPassword(e.target.value);
                  if (error) setError("");
                }}
                disabled={isLoading}
                className="h-10 text-xs text-foreground placeholder:text-muted-foreground/60"
              />
              <InputGroupButton
                type="button"
                onClick={() => setShowNewPassword(!showNewPassword)}
                disabled={isLoading}
                size="icon-sm"
                className="text-muted-foreground hover:text-foreground cursor-pointer flex items-center justify-center shrink-0 w-8"
              >
                {showNewPassword ? (
                  <EyeOff className="h-3.5 w-3.5" />
                ) : (
                  <Eye className="h-3.5 w-3.5" />
                )}
              </InputGroupButton>
            </InputGroup>
          </Field>

          {/* Confirm Password Input Field */}
          <Field>
            <FieldLabel>
              <FieldTitle>Ulangi Password</FieldTitle>
            </FieldLabel>
            <InputGroup className="bg-muted/5">
              <InputGroupAddon className="px-2">
                <Lock className="h-4 w-4 text-muted-foreground/80" />
              </InputGroupAddon>
              <InputGroupInput
                type={showConfirmPassword ? "text" : "password"}
                placeholder="Ulangi password baru..."
                value={confirmPassword}
                onChange={(e) => {
                  setConfirmPassword(e.target.value);
                  if (error) setError("");
                }}
                disabled={isLoading}
                className="h-10 text-xs text-foreground placeholder:text-muted-foreground/60"
              />
              <InputGroupButton
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                disabled={isLoading}
                size="icon-sm"
                className="text-muted-foreground hover:text-foreground cursor-pointer flex items-center justify-center shrink-0 w-8"
              >
                {showConfirmPassword ? (
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
                  Memproses Reset...
                </>
              ) : (
                "Reset Password"
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
