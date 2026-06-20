"use client";

import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Field, FieldLabel, FieldTitle } from "@/components/ui/field";
import { AdminUser } from "@/dummy-data/admin";
import { AlertCircle, Eye, EyeOff } from "lucide-react";

interface ResetPasswordDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  user: AdminUser | null;
  onSave: (userId: string, newPassword: string) => void;
}

export function ResetPasswordDialog({
  open,
  onOpenChange,
  user,
  onSave,
}: ResetPasswordDialogProps) {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (open) {
      setPassword("");
      setConfirmPassword("");
      setShowPassword(false);
      setShowConfirmPassword(false);
      setError("");
    }
  }, [open]);

  const handleSave = () => {
    if (!password.trim() || !confirmPassword.trim()) {
      setError("Semua field wajib diisi!");
      return;
    }
    if (password.trim() !== confirmPassword.trim()) {
      setError("Password dan Ulangi Password tidak cocok!");
      return;
    }
    if (password.length < 4) {
      setError("Password minimal harus 4 karakter!");
      return;
    }

    if (user) {
      onSave(user.id, password.trim());
    }
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md bg-card border border-border p-6 rounded-xl">
        <DialogHeader>
          <DialogTitle className="text-sm font-bold text-foreground uppercase tracking-wider">
            Reset Password - {user?.username}
          </DialogTitle>
        </DialogHeader>

        {error && (
          <div className="p-3.5 rounded-lg border border-rose-500/10 bg-rose-500/5 text-rose-600 dark:text-rose-400 text-xs font-semibold flex items-center gap-2 animate-fadeIn">
            <AlertCircle className="h-4.5 w-4.5 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <div className="space-y-4 py-4">
          {/* Password Baru */}
          <Field>
            <FieldLabel>
              <FieldTitle>Password Baru</FieldTitle>
            </FieldLabel>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Masukkan password baru..."
                className="w-full h-10 rounded-lg border border-border bg-card pl-3 pr-10 py-2 text-xs text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:ring-1 focus:ring-primary"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground cursor-pointer transition-colors"
              >
                {showPassword ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </button>
            </div>
          </Field>

          {/* Ulangi Password */}
          <Field>
            <FieldLabel>
              <FieldTitle>Ulangi Password</FieldTitle>
            </FieldLabel>
            <div className="relative">
              <input
                type={showConfirmPassword ? "text" : "password"}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Ulangi password baru..."
                className="w-full h-10 rounded-lg border border-border bg-card pl-3 pr-10 py-2 text-xs text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:ring-1 focus:ring-primary"
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground cursor-pointer transition-colors"
              >
                {showConfirmPassword ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </button>
            </div>
          </Field>
        </div>

        <DialogFooter className="flex justify-end gap-2 pt-2">
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            className="h-10 text-xs font-bold px-4 rounded-lg cursor-pointer"
          >
            Batal
          </Button>
          <Button
            type="button"
            onClick={handleSave}
            className="bg-primary text-primary-foreground font-semibold text-xs h-10 px-4 rounded-lg hover:bg-primary/95 transition-all shadow-sm cursor-pointer"
          >
            Reset Password
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
