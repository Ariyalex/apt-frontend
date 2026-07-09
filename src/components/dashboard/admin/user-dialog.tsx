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
import type { UserAdminModel } from "@/types/user";
import type { InstituteModel } from "@/types/institute";
import { AlertCircle, X, Loader2 } from "lucide-react";

interface UserDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  user: UserAdminModel | null; // null means Add User mode
  lembagaList: InstituteModel[];
  onSave: (savedUser: UserAdminModel) => void;
  isLoading?: boolean;
}

export function UserDialog({
  open,
  onOpenChange,
  user,
  lembagaList,
  onSave,
  isLoading = false,
}: UserDialogProps): React.JSX.Element {
  const [name, setName] = useState("");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [jenisAkun, setJenisAkun] = useState<UserAdminModel["role"] | "">("");
  const [lembaga, setLembaga] = useState("");
  const [isBanned, setIsBanned] = useState<boolean>(false);
  const [error, setError] = useState("");

  const isEdit = !!user;

  useEffect(() => {
    if (open) {
      const timer = setTimeout(() => {
        if (user) {
          setName(user.name || "");
          setUsername(user.username);
          setEmail(user.email || "");
          setJenisAkun(user.role);
          setLembaga(
            user.institute_id !== null
              ? `lemb-${user.institute_id}`
              : "Tidak Ada",
          );
          setIsBanned(user.is_banned);
        } else {
          setName("");
          setUsername("");
          setEmail("");
          setJenisAkun("");
          setLembaga("Tidak Ada");
          setIsBanned(false);
        }
        setError("");
      }, 0);
      return () => clearTimeout(timer);
    }
  }, [open, user, lembagaList]);

  const handleJenisAkunChange = (val: UserAdminModel["role"]): void => {
    setJenisAkun(val);
  };

  const handleSave = (): void => {
    if (!name.trim()) {
      setError("Nama Lengkap wajib diisi!");
      return;
    }
    if (!username.trim()) {
      setError("Username wajib diisi!");
      return;
    }
    // Validation: no spaces, must be all lowercase
    if (/[A-Z\s]/.test(username)) {
      setError("Username tidak boleh mengandung spasi atau huruf kapital!");
      return;
    }
    if (!email.trim() || !email.includes("@")) {
      setError("Email tidak valid!");
      return;
    }
    if (!jenisAkun) {
      setError("Silakan pilih Jenis Akun!");
      return;
    }

    const instituteId = lembaga.startsWith("lemb-")
      ? parseInt(lembaga.replace("lemb-", ""), 10)
      : null;

    onSave({
      id: user?.id || "",
      name: name.trim(),
      username: username.trim(),
      email: email.trim(),
      role: jenisAkun as UserAdminModel["role"],
      institute_id: instituteId,
      is_banned: isBanned,
      must_change_password: user ? user.must_change_password : true,
      created_at: user?.created_at || new Date().toISOString(),
    });
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(val) => {
        if (isLoading) return;
        onOpenChange(val);
      }}
    >
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
          {/* Nama Lengkap (text field) */}
          <Field>
            <FieldLabel>
              <FieldTitle>Nama Lengkap</FieldTitle>
            </FieldLabel>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              disabled={isLoading}
              placeholder="Masukkan nama lengkap..."
              className="w-full h-10 rounded-lg border border-border bg-card px-3 py-2 text-xs text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:ring-1 focus:ring-primary disabled:opacity-50 disabled:cursor-not-allowed"
            />
          </Field>

          {/* Username (text field) */}
          <Field>
            <FieldLabel>
              <FieldTitle>Username</FieldTitle>
            </FieldLabel>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              disabled={isLoading}
              placeholder="Masukkan username..."
              className="w-full h-10 rounded-lg border border-border bg-card px-3 py-2 text-xs text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:ring-1 focus:ring-primary disabled:opacity-50 disabled:cursor-not-allowed"
            />
          </Field>

          {/* Email (text field) */}
          <Field>
            <FieldLabel>
              <FieldTitle>Email</FieldTitle>
            </FieldLabel>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={isLoading}
              placeholder="Masukkan email..."
              className="w-full h-10 rounded-lg border border-border bg-card px-3 py-2 text-xs text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:ring-1 focus:ring-primary disabled:opacity-50 disabled:cursor-not-allowed"
            />
          </Field>

          {/* Jenis Akun (Shadcn select dropdown) */}
          <Field>
            <FieldLabel>
              <FieldTitle>Jenis Akun</FieldTitle>
            </FieldLabel>
            <Select
              value={jenisAkun}
              onValueChange={(val) =>
                handleJenisAkunChange(val as UserAdminModel["role"])
              }
              disabled={isLoading}
            >
              <SelectTrigger className="w-full h-10 bg-card border border-border rounded-lg px-3 py-2 text-xs font-semibold focus:outline-none focus:border-primary transition-colors cursor-pointer justify-between disabled:opacity-50 disabled:cursor-not-allowed">
                <SelectValue placeholder="Pilih Jenis Akun" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem
                  value="upps"
                  className="text-xs font-semibold cursor-pointer"
                >
                  UPPS
                </SelectItem>
                <SelectItem
                  value="lpm"
                  className="text-xs font-semibold cursor-pointer"
                >
                  LPM
                </SelectItem>
                <SelectItem
                  value="admin"
                  className="text-xs font-semibold cursor-pointer"
                >
                  Admin
                </SelectItem>
                <SelectItem
                  value="assessor"
                  className="text-xs font-semibold cursor-pointer"
                >
                  Assessor
                </SelectItem>
              </SelectContent>
            </Select>
          </Field>

          {/* Lembaga (Universal & Optional) */}
          <Field>
            <FieldLabel>
              <FieldTitle>Lembaga (Opsional)</FieldTitle>
            </FieldLabel>
            <div className="flex gap-2">
              <div className="flex-1">
                <Select
                  value={lembaga || "Tidak Ada"}
                  onValueChange={(val) => setLembaga(val)}
                  disabled={isLoading}
                >
                  <SelectTrigger className="w-full h-10 bg-card border border-border rounded-lg px-3 py-2 text-xs font-semibold focus:outline-none focus:border-primary transition-colors cursor-pointer justify-between disabled:opacity-50 disabled:cursor-not-allowed">
                    <SelectValue placeholder="Pilih Lembaga" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem
                      value="Tidak Ada"
                      className="text-xs font-semibold cursor-pointer"
                    >
                      Tidak Ada
                    </SelectItem>
                    {lembagaList.map((lemb) => (
                      <SelectItem
                        key={lemb.id}
                        value={`lemb-${lemb.id}`}
                        className="text-xs font-semibold cursor-pointer"
                      >
                        {lemb.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              {lembaga && lembaga !== "Tidak Ada" && (
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setLembaga("Tidak Ada")}
                  disabled={isLoading}
                  className="h-10 px-3 border border-border hover:bg-muted/80 shrink-0 cursor-pointer rounded-lg text-xs font-bold text-muted-foreground flex items-center gap-1"
                >
                  <X className="h-4 w-4" /> Clear
                </Button>
              )}
            </div>
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
                    name="isBanned"
                    checked={!isBanned}
                    onChange={() => setIsBanned(false)}
                    disabled={isLoading}
                    className="accent-primary h-4 w-4"
                  />
                  <span>Active</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer text-xs text-foreground font-semibold select-none">
                  <input
                    type="radio"
                    name="isBanned"
                    checked={isBanned}
                    onChange={() => setIsBanned(true)}
                    disabled={isLoading}
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
            disabled={isLoading}
            className="h-10 text-xs font-bold px-4 rounded-lg cursor-pointer"
          >
            Batal
          </Button>
          <Button
            type="button"
            onClick={handleSave}
            disabled={isLoading}
            className="bg-primary text-primary-foreground font-semibold text-xs h-10 px-4 rounded-lg hover:bg-primary/95 transition-all shadow-sm cursor-pointer flex items-center gap-1.5"
          >
            {isLoading ? (
              <>
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
                <span>Menyimpan...</span>
              </>
            ) : (
              <span>Simpan</span>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
