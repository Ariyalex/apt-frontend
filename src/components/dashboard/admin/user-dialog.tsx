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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Field, FieldLabel, FieldTitle } from "@/components/ui/field";
import { AdminUser, AdminLembaga } from "@/dummy-data/admin";
import { AlertCircle, Eye, EyeOff } from "lucide-react";

interface UserDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  user: AdminUser | null; // null means Add User mode
  lembagaList: AdminLembaga[];
  onSave: (savedUser: AdminUser) => void;
}

export function UserDialog({
  open,
  onOpenChange,
  user,
  lembagaList,
  onSave,
}: UserDialogProps) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [jenisAkun, setJenisAkun] = useState<AdminUser["jenisAkun"] | "">("");
  const [lembaga, setLembaga] = useState("");
  const [status, setStatus] = useState<AdminUser["status"]>("active");
  const [error, setError] = useState("");

  useEffect(() => {
    if (open) {
      if (user) {
        setUsername(user.username);
        setPassword(user.password || "");
        setJenisAkun(user.jenisAkun);
        setLembaga(user.lembaga);
        setStatus(user.status);
      } else {
        setUsername("");
        setPassword("");
        setJenisAkun("");
        setLembaga("");
        setStatus("active");
      }
      setShowPassword(false);
      setError("");
    }
  }, [open, user, lembagaList]);

  const handleSave = () => {
    if (!username.trim() || !password.trim()) {
      setError("Username dan Password wajib diisi!");
      return;
    }
    if (!jenisAkun) {
      setError("Silakan pilih Jenis Akun!");
      return;
    }
    if (!lembaga) {
      setError("Silakan pilih Lembaga!");
      return;
    }

    onSave({
      id: user?.id || `usr-${Date.now()}`,
      username: username.trim(),
      password: password.trim(),
      jenisAkun: jenisAkun as AdminUser["jenisAkun"],
      lembaga,
      createdAt: user?.createdAt || new Date().toISOString().split("T")[0],
      status: user ? status : "active",
    });
    onOpenChange(false);
  };

  const isEdit = !!user;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg bg-card border border-border p-6 rounded-xl">
        <DialogHeader>
          <DialogTitle className="text-sm font-bold text-foreground uppercase tracking-wider">
            {isEdit ? "Edit User" : "Tambah User"}
          </DialogTitle>
        </DialogHeader>

        {error && (
          <div className="p-3.5 rounded-lg border border-rose-500/10 bg-rose-500/5 text-rose-600 dark:text-rose-400 text-xs font-semibold flex items-center gap-2 animate-fadeIn">
            <AlertCircle className="h-4.5 w-4.5 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <div className="space-y-4 py-4">
          {/* Username (text field) */}
          <Field>
            <FieldLabel>
              <FieldTitle>Username</FieldTitle>
            </FieldLabel>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Masukkan username..."
              className="w-full h-10 rounded-lg border border-border bg-card px-3 py-2 text-xs text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:ring-1 focus:ring-primary"
            />
          </Field>

          {/* Password (password input field with show/hide suffix) */}
          <Field>
            <FieldLabel>
              <FieldTitle>Password</FieldTitle>
            </FieldLabel>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Masukkan password..."
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

          {/* Jenis Akun (Shadcn select dropdown) */}
          <Field>
            <FieldLabel>
              <FieldTitle>Jenis Akun</FieldTitle>
            </FieldLabel>
            <Select
              value={jenisAkun}
              onValueChange={(val) => setJenisAkun(val as any)}
            >
              <SelectTrigger className="w-full h-10 bg-card border border-border rounded-lg px-3 py-2 text-xs font-semibold focus:outline-none focus:border-primary transition-colors cursor-pointer justify-between">
                <SelectValue placeholder="Pilih Jenis Akun" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="prodi" className="text-xs font-semibold cursor-pointer">prodi</SelectItem>
                <SelectItem value="LPM" className="text-xs font-semibold cursor-pointer">LPM</SelectItem>
                <SelectItem value="admin" className="text-xs font-semibold cursor-pointer">admin</SelectItem>
                <SelectItem value="asessor" className="text-xs font-semibold cursor-pointer">asessor</SelectItem>
              </SelectContent>
            </Select>
          </Field>

          {/* Lembaga (Shadcn select dropdown) */}
          <Field>
            <FieldLabel>
              <FieldTitle>Lembaga</FieldTitle>
            </FieldLabel>
            <Select
              value={lembaga}
              onValueChange={setLembaga}
            >
              <SelectTrigger className="w-full h-10 bg-card border border-border rounded-lg px-3 py-2 text-xs font-semibold focus:outline-none focus:border-primary transition-colors cursor-pointer justify-between">
                <SelectValue placeholder="Pilih Lembaga" />
              </SelectTrigger>
              <SelectContent>
                {lembagaList.map((lemb) => (
                  <SelectItem key={lemb.id} value={lemb.nama} className="text-xs font-semibold cursor-pointer">
                    {lemb.nama}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Field>

          {/* Status (radio, edit only) */}
          {isEdit && (
            <Field>
              <FieldLabel>
                <FieldTitle>Status</FieldTitle>
              </FieldLabel>
              <div className="flex gap-6 items-center pt-1">
                <label className="flex items-center gap-2 cursor-pointer text-xs text-foreground font-semibold select-none">
                  <input
                    type="radio"
                    name="status"
                    value="active"
                    checked={status === "active"}
                    onChange={() => setStatus("active")}
                    className="accent-primary h-4 w-4"
                  />
                  <span>Active</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer text-xs text-foreground font-semibold select-none">
                  <input
                    type="radio"
                    name="status"
                    value="banned"
                    checked={status === "banned"}
                    onChange={() => setStatus("banned")}
                    className="accent-rose-500 h-4 w-4"
                  />
                  <span>Banned</span>
                </label>
              </div>
            </Field>
          )}
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
            Simpan
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
