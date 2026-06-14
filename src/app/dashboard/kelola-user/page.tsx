"use client";

import React, { useState, useEffect } from "react";
import { UserPlus } from "lucide-react";
import { UserTable } from "@/components/dashboard/admin/user-table";
import { UserDialog } from "@/components/dashboard/admin/user-dialog";
import { AdminUser, AdminLembaga, initialAdminUsers, initialAdminLembaga } from "@/dummy-data/admin";
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
    if (storedUsers) {
      try {
        setUsers(JSON.parse(storedUsers));
      } catch (e) {
        setUsers(initialAdminUsers);
      }
    } else {
      setUsers(initialAdminUsers);
      localStorage.setItem("adminUsers", JSON.stringify(initialAdminUsers));
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

  const handleDeleteUser = (userId: string) => {
    setDeleteUserId(userId);
  };

  const confirmDeleteUser = () => {
    if (!deleteUserId) return;
    const updated = users.filter((u) => u.id !== deleteUserId);
    setUsers(updated);
    localStorage.setItem("adminUsers", JSON.stringify(updated));

    // Append to activity log
    logActivity("admin", `menghapus user dengan ID: ${deleteUserId}`);
    setDeleteUserId(null);
  };

  const handleSaveUser = (savedUser: AdminUser) => {
    let updated: AdminUser[];
    const exists = users.some((u) => u.id === savedUser.id);
    
    if (exists) {
      updated = users.map((u) => (u.id === savedUser.id ? savedUser : u));
      logActivity("admin", `memperbarui data user: ${savedUser.username}`);
    } else {
      updated = [...users, savedUser];
      logActivity("admin", `menambah user baru: ${savedUser.username}`);
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
      />

      <UserDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        user={selectedUser}
        lembagaList={lembagaList}
        onSave={handleSaveUser}
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
