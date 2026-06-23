"use client";

import React, { useState, useEffect } from "react";
import { Building } from "lucide-react";
import { LembagaTable } from "@/components/dashboard/admin/lembaga-table";
import { LembagaDialog } from "@/components/dashboard/admin/lembaga-dialog";
import { AdminLembaga, AdminUser, initialAdminLembaga } from "@/dummy-data/admin";
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

export default function KelolaLembagaPage(): React.JSX.Element {
  const [lembagaList, setLembagaList] = useState<AdminLembaga[]>([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedLembaga, setSelectedLembaga] = useState<AdminLembaga | null>(null);
  const [deleteLembagaId, setDeleteLembagaId] = useState<string | null>(null);

  useEffect(() => {
    const timer = setTimeout(() => {
      const storedLemb = localStorage.getItem("adminLembaga");
      let loadedLemb: AdminLembaga[] = [];
      let needsMigration = false;

      if (storedLemb) {
        try {
          loadedLemb = JSON.parse(storedLemb);
        } catch {
          loadedLemb = initialAdminLembaga;
          needsMigration = true;
        }
      } else {
        loadedLemb = initialAdminLembaga;
        needsMigration = true;
      }

      const migratedLemb = loadedLemb.map((l) => {
        let newType = l.jenisLembaga;
        if ((l.jenisLembaga as string) === "fakultas") {
          newType = "Auditee";
          needsMigration = true;
        } else if ((l.jenisLembaga as string) === "lembaga") {
          newType = "Auditor";
          needsMigration = true;
        } else if ((l.jenisLembaga as string) === "assessor") {
          newType = "Assessor";
          needsMigration = true;
        }
        return { ...l, jenisLembaga: newType };
      });

      setLembagaList(migratedLemb);
      if (needsMigration) {
        localStorage.setItem("adminLembaga", JSON.stringify(migratedLemb));
      }
    }, 0);

    return () => clearTimeout(timer);
  }, []);

  const handleAddLembaga = () => {
    setSelectedLembaga(null);
    setDialogOpen(true);
  };

  const handleEditLembaga = (lembaga: AdminLembaga) => {
    setSelectedLembaga(lembaga);
    setDialogOpen(true);
  };

  const handleDeleteLembaga = (lembagaId: string) => {
    setDeleteLembagaId(lembagaId);
  };

  const confirmDeleteLembaga = () => {
    if (!deleteLembagaId) return;
    const targetLemb = lembagaList.find((l) => l.id === deleteLembagaId);
    if (!targetLemb) return;

    // Delete lembaga
    const updatedLembaga = lembagaList.filter((l) => l.id !== deleteLembagaId);
    setLembagaList(updatedLembaga);
    localStorage.setItem("adminLembaga", JSON.stringify(updatedLembaga));

    // Cascade delete users belonging to this lembaga
    const storedUsers = localStorage.getItem("adminUsers");
    if (storedUsers) {
      try {
        const users: AdminUser[] = JSON.parse(storedUsers);
        const updatedUsers = users.filter((u) => u.lembaga !== targetLemb.nama);
        localStorage.setItem("adminUsers", JSON.stringify(updatedUsers));
      } catch {
        // ignore
      }
    }

    // Log activity
    logActivity("admin", `menghapus lembaga: ${targetLemb.nama} (beserta seluruh user terkait)`);
    setDeleteLembagaId(null);
  };

  const activeDeleteLembagaName = deleteLembagaId 
    ? lembagaList.find((l) => l.id === deleteLembagaId)?.nama 
    : "";

  const handleSaveLembaga = (savedLembaga: AdminLembaga) => {
    let updated: AdminLembaga[];
    const exists = lembagaList.some((l) => l.id === savedLembaga.id);

    if (exists) {
      updated = lembagaList.map((l) => (l.id === savedLembaga.id ? savedLembaga : l));
      logActivity("admin", `memperbarui lembaga: ${savedLembaga.nama}`);
    } else {
      updated = [...lembagaList, savedLembaga];
      logActivity("admin", `menambah lembaga baru: ${savedLembaga.nama}`);
    }

    setLembagaList(updated);
    localStorage.setItem("adminLembaga", JSON.stringify(updated));
  };

  const logActivity = (username: string, action: string) => {
    const storedLogs = localStorage.getItem("adminAktivitas");
    let currentLogs = [];
    if (storedLogs) {
      try {
        currentLogs = JSON.parse(storedLogs);
      } catch {
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
            Kelola Lembaga
          </h1>
          <p className="text-xs text-muted-foreground mt-1">
            Atur unit kerja, fakultas, program studi, dan lembaga penjaminan mutu di lingkungan universitas.
          </p>
        </div>
        <button
          onClick={handleAddLembaga}
          className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-3 py-2 text-xs font-semibold text-primary-foreground hover:bg-primary/95 transition-all shadow-sm cursor-pointer self-start sm:self-auto"
        >
          <Building className="h-4 w-4" />
          <span>Tambah Lembaga</span>
        </button>
      </div>

      <LembagaTable
        lembagaList={lembagaList}
        onEdit={handleEditLembaga}
        onDelete={handleDeleteLembaga}
      />

      <LembagaDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        lembaga={selectedLembaga}
        onSave={handleSaveLembaga}
      />

      {/* Delete Lembaga Confirmation Dialog */}
      <AlertDialog open={!!deleteLembagaId} onOpenChange={(open) => !open && setDeleteLembagaId(null)}>
        <AlertDialogContent className="bg-card border border-border p-6 rounded-xl sm:max-w-md">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-sm font-bold text-foreground uppercase tracking-wider">
              Konfirmasi Hapus Lembaga
            </AlertDialogTitle>
            <AlertDialogDescription className="text-xs text-muted-foreground">
              Apakah Anda yakin ingin menghapus lembaga &quot;{activeDeleteLembagaName}&quot;? 
              <span className="block mt-2 font-semibold text-rose-600 dark:text-rose-400">
                Peringatan: Semua akun pengguna yang terdaftar di lembaga ini juga akan terhapus secara otomatis!
              </span>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="flex justify-end gap-2 pt-2">
            <AlertDialogCancel className="h-10 text-xs font-bold px-4 rounded-lg cursor-pointer">
              Batal
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDeleteLembaga}
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
