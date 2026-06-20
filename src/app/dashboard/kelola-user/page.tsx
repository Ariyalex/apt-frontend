"use client";

import React, { useState, useEffect } from "react";
import { UserPlus } from "lucide-react";
import { UserTable } from "@/components/dashboard/admin/user-table";
import { UserDialog } from "@/components/dashboard/admin/user-dialog";
import { ResetPasswordDialog } from "@/components/dashboard/admin/reset-password-dialog";
import { AdminUser, AdminLembaga, initialAdminUsers, initialAdminLembaga } from "@/dummy-data/admin";
import { toast } from "sonner";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

export default function KelolaUserPage() {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [lembagaList, setLembagaList] = useState<AdminLembaga[]>([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<AdminUser | null>(null);
  const [deleteUserId, setDeleteUserId] = useState<string | null>(null);

  // Reset password states
  const [resetDialogOpen, setResetDialogOpen] = useState(false);
  const [resetUser, setResetUser] = useState<AdminUser | null>(null);

  // Load from localStorage or initialize with dummy data
  useEffect(() => {
    // Load Lembaga first
    const storedLemb = localStorage.getItem("adminLembaga");
    let currentLemb: AdminLembaga[] = [];
    if (storedLemb) {
      try {
        currentLemb = JSON.parse(storedLemb);
      } catch (e) {
        currentLemb = initialAdminLembaga;
      }
    } else {
      currentLemb = initialAdminLembaga;
      localStorage.setItem("adminLembaga", JSON.stringify(initialAdminLembaga));
    }
    setLembagaList(currentLemb);

    // Load Users
    const storedUsers = localStorage.getItem("adminUsers");
    let loadedUsers: AdminUser[] = [];
    let needsMigration = false;
    
    if (storedUsers) {
      try {
        loadedUsers = JSON.parse(storedUsers);
      } catch (e) {
        loadedUsers = initialAdminUsers;
        needsMigration = true;
      }
    } else {
      loadedUsers = initialAdminUsers;
      needsMigration = true;
    }

    // Map old role keys to new ones if found
    const migratedUsers = loadedUsers.map((u) => {
      let newRole = u.jenisAkun;
      if ((u.jenisAkun as string) === "prodi") {
        newRole = "Auditee";
        needsMigration = true;
      } else if ((u.jenisAkun as string) === "LPM") {
        newRole = "Auditor";
        needsMigration = true;
      } else if ((u.jenisAkun as string) === "admin") {
        newRole = "Admin";
        needsMigration = true;
      } else if ((u.jenisAkun as string) === "asessor") {
        newRole = "Assessor";
        needsMigration = true;
      }
      
      let newLembaga = u.lembaga;
      if (newRole === "Admin" && u.lembaga === "Lembaga Penjaminan Mutu") {
        newLembaga = "Tidak Ada";
        needsMigration = true;
      } else if (newRole === "Assessor" && u.lembaga === "Fakultas Tarbiyah dan Keguruan") {
        newLembaga = "Tidak Ada";
        needsMigration = true;
      }

      return {
        ...u,
        jenisAkun: newRole,
        lembaga: newLembaga,
      };
    });

    setUsers(migratedUsers);
    if (needsMigration) {
      localStorage.setItem("adminUsers", JSON.stringify(migratedUsers));
    }
  }, []);

  const handleAddUser = () => {
    setSelectedUser(null);
    setDialogOpen(true);
  };

  const handleEditUser = (user: AdminUser) => {
    setSelectedUser(user);
    setDialogOpen(true);
  };

  const handleResetPasswordClick = (user: AdminUser) => {
    setResetUser(user);
    setResetDialogOpen(true);
  };

  const handleSaveResetPassword = (userId: string, newPassword: string) => {
    const updated = users.map((u) => {
      if (u.id === userId) {
        return { ...u, password: newPassword };
      }
      return u;
    });
    setUsers(updated);
    localStorage.setItem("adminUsers", JSON.stringify(updated));

    const targetUser = users.find((u) => u.id === userId);
    logActivity("admin", `mereset password user: ${targetUser?.username}`);
    toast.success(`Password untuk user "${targetUser?.username}" berhasil direset!`);
  };

  const handleDeleteUser = (userId: string) => {
    setDeleteUserId(userId);
  };

  const confirmDeleteUser = () => {
    if (!deleteUserId) return;
    const targetUser = users.find((u) => u.id === deleteUserId);
    const updated = users.filter((u) => u.id !== deleteUserId);
    setUsers(updated);
    localStorage.setItem("adminUsers", JSON.stringify(updated));

    // Append to activity log
    logActivity("admin", `menghapus user: ${targetUser?.username || deleteUserId}`);
    toast.success(`User "${targetUser?.username || deleteUserId}" berhasil dihapus.`);
    setDeleteUserId(null);
  };

  const handleSaveUser = (savedUser: AdminUser) => {
    let updated: AdminUser[];
    const exists = users.some((u) => u.id === savedUser.id);
    
    if (exists) {
      updated = users.map((u) => (u.id === savedUser.id ? savedUser : u));
      logActivity("admin", `memperbarui data user: ${savedUser.username}`);
      toast.success(`Data user "${savedUser.username}" berhasil diperbarui.`);
    } else {
      updated = [...users, savedUser];
      logActivity("admin", `menambah user baru: ${savedUser.username}`);
      toast.success(`User baru "${savedUser.username}" berhasil ditambahkan.`);
    }

    setUsers(updated);
    localStorage.setItem("adminUsers", JSON.stringify(updated));
  };

  const logActivity = (username: string, action: string) => {
    const storedLogs = localStorage.getItem("adminAktivitas");
    let currentLogs = [];
    if (storedLogs) {
      try {
        currentLogs = JSON.parse(storedLogs);
      } catch (e) {
        // ignore
      }
    }
    const newLog = {
      id: `act-${Date.now()}`,
      username,
      aktivitas: action,
      waktu: `${new Date().toLocaleDateString("id-ID", {
        day: "numeric",
        month: "long",
        year: "numeric",
      })}, ${new Date().toLocaleTimeString("id-ID", {
        hour: "2-digit",
        minute: "2-digit",
      })} WIB`,
      ip: "127.0.0.1",
    };
    const updatedLogs = [newLog, ...currentLogs];
    localStorage.setItem("adminAktivitas", JSON.stringify(updatedLogs));
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-foreground md:text-2xl">
            Kelola User
          </h1>
          <p className="text-xs text-muted-foreground mt-1">
            Atur hak akses pengguna, tambah akun baru, dan audit data akses sistem penjaminan mutu.
          </p>
        </div>
        <button
          onClick={handleAddUser}
          className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-3 py-2 text-xs font-semibold text-primary-foreground hover:bg-primary/95 transition-all shadow-sm cursor-pointer self-start sm:self-auto"
        >
          <UserPlus className="h-4 w-4" />
          <span>Tambah User</span>
        </button>
      </div>

      <UserTable
        users={users}
        onEdit={handleEditUser}
        onDelete={handleDeleteUser}
        onResetPassword={handleResetPasswordClick}
      />

      <UserDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        user={selectedUser}
        lembagaList={lembagaList}
        onSave={handleSaveUser}
      />

      <ResetPasswordDialog
        open={resetDialogOpen}
        onOpenChange={setResetDialogOpen}
        user={resetUser}
        onSave={handleSaveResetPassword}
      />

      {/* Delete User Confirmation Dialog */}
      <AlertDialog open={!!deleteUserId} onOpenChange={(open) => !open && setDeleteUserId(null)}>
        <AlertDialogContent className="bg-card border border-border p-6 rounded-xl sm:max-w-md">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-sm font-bold text-foreground uppercase tracking-wider">
              Konfirmasi Hapus
            </AlertDialogTitle>
            <AlertDialogDescription className="text-xs text-muted-foreground">
              Apakah Anda yakin ingin menghapus pengguna ini? Tindakan ini bersifat permanen dan tidak dapat dibatalkan.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="flex justify-end gap-2 pt-2">
            <AlertDialogCancel className="h-10 text-xs font-bold px-4 rounded-lg cursor-pointer">
              Batal
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDeleteUser}
              className="bg-rose-600 text-white hover:bg-rose-700 font-semibold text-xs h-10 px-4 rounded-lg cursor-pointer"
            >
              Hapus
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
