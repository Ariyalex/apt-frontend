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
import { AlertCircle, X } from "lucide-react";

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
  const [name, setName] = useState("");
  const [username, setUsername] = useState("");
  const [jenisAkun, setJenisAkun] = useState<AdminUser["jenisAkun"] | "">("");
  const [lembaga, setLembaga] = useState("");
  const [status, setStatus] = useState<AdminUser["status"]>("active");
  const [error, setError] = useState("");

  const isEdit = !!user;

  useEffect(() => {
    if (open) {
      if (user) {
        setName(user.name || "");
        setUsername(user.username);
        setJenisAkun(user.jenisAkun);
        setLembaga(user.lembaga);
        setStatus(user.status);
      } else {
        setName("");
        setUsername("");
        setJenisAkun("");
        setLembaga("Tidak Ada");
        setStatus("active");
      }
      setError("");
    }
  }, [open, user, lembagaList]);

  const handleJenisAkunChange = (val: AdminUser["jenisAkun"]) => {
    setJenisAkun(val);
  };

  const handleSave = () => {
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
    if (!jenisAkun) {
      setError("Silakan pilih Jenis Akun!");
      return;
    }

    onSave({
      id: user?.id || `usr-${Date.now()}`,
      name: name.trim(),
      username: username.trim(),
      password: isEdit ? user.password : username.trim(), // Default password to match username on creation
      jenisAkun: jenisAkun as AdminUser["jenisAkun"],
      lembaga: lembaga || "Tidak Ada",
      createdAt: user?.createdAt || new Date().toISOString().split("T")[0],
      status: user ? status : "active",
    });
    onOpenChange(false);
  };

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
          {/* Nama Lengkap (text field) */}
          <Field>
            <FieldLabel>
              <FieldTitle>Nama Lengkap</FieldTitle>
            </FieldLabel>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Masukkan nama lengkap..."
              className="w-full h-10 rounded-lg border border-border bg-card px-3 py-2 text-xs text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:ring-1 focus:ring-primary"
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
              placeholder="Masukkan username..."
              className="w-full h-10 rounded-lg border border-border bg-card px-3 py-2 text-xs text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:ring-1 focus:ring-primary"
            />
          </Field>

          {/* Jenis Akun (Shadcn select dropdown) */}
          <Field>
            <FieldLabel>
              <FieldTitle>Jenis Akun</FieldTitle>
            </FieldLabel>
            <Select
              value={jenisAkun}
              onValueChange={(val) => handleJenisAkunChange(val as AdminUser["jenisAkun"])}
            >
              <SelectTrigger className="w-full h-10 bg-card border border-border rounded-lg px-3 py-2 text-xs font-semibold focus:outline-none focus:border-primary transition-colors cursor-pointer justify-between">
                <SelectValue placeholder="Pilih Jenis Akun" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Auditee" className="text-xs font-semibold cursor-pointer">Auditee</SelectItem>
                <SelectItem value="Auditor" className="text-xs font-semibold cursor-pointer">Auditor</SelectItem>
                <SelectItem value="Admin" className="text-xs font-semibold cursor-pointer">Admin</SelectItem>
                <SelectItem value="Assessor" className="text-xs font-semibold cursor-pointer">Assessor</SelectItem>
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
                >
                  <SelectTrigger className="w-full h-10 bg-card border border-border rounded-lg px-3 py-2 text-xs font-semibold focus:outline-none focus:border-primary transition-colors cursor-pointer justify-between">
                    <SelectValue placeholder="Pilih Lembaga" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Tidak Ada" className="text-xs font-semibold cursor-pointer">Tidak Ada</SelectItem>
                    {lembagaList.map((lemb) => (
                      <SelectItem key={lemb.id} value={lemb.nama} className="text-xs font-semibold cursor-pointer">
                        {lemb.nama}
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

