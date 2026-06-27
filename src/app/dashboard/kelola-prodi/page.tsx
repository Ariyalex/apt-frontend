"use client";

import React, { useState, useEffect } from "react";
import { GraduationCap, Search, Loader2 } from "lucide-react";
import { ProdiTable } from "@/components/dashboard/admin/prodi-table";
import { ProdiDialog } from "@/components/dashboard/admin/prodi-dialog";
import { toast } from "sonner";
import { Skeleton } from "@/components/ui/skeleton";
import {
  useGetStudyProgramsQuery,
  useCreateStudyProgramMutation,
  useUpdateStudyProgramMutation,
  useDeleteStudyProgramMutation,
} from "@/store/services/studyProgramApi";
import type {
  StudyProgramModel,
  SaveStudyProgramRequest,
} from "@/types/study-program";
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

interface CustomErrorObject {
  data?:
    | {
        message?: string;
        error?: string;
      }
    | string;
}

const extractErrorMessage = (err: unknown): string => {
  if (err && typeof err === "object" && "data" in err) {
    const errObj = err as CustomErrorObject;
    const apiError = errObj.data;
    if (apiError && typeof apiError === "object") {
      return apiError.message || apiError.error || JSON.stringify(apiError);
    }
    if (typeof apiError === "string") {
      return apiError;
    }
  }
  return "Terjadi kesalahan pada server. Silakan coba kembali.";
};

export default function KelolaProdiPage(): React.JSX.Element {
  const [searchKeyword, setSearchKeyword] = useState<string>("");
  const [debouncedSearch, setDebouncedSearch] = useState<string>("");
  const [dialogOpen, setDialogOpen] = useState<boolean>(false);
  const [selectedProdi, setSelectedProdi] = useState<StudyProgramModel | null>(
    null,
  );
  const [deleteProdiId, setDeleteProdiId] = useState<number | null>(null);

  // Debounce search input
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(searchKeyword);
    }, 400);
    return () => clearTimeout(handler);
  }, [searchKeyword]);

  // RTK Query calls
  const { data: prodiResponse, isLoading: isProdiLoading } =
    useGetStudyProgramsQuery({ name: debouncedSearch });
  const [createProdi, { isLoading: isCreateLoading }] =
    useCreateStudyProgramMutation();
  const [updateProdi, { isLoading: isUpdateLoading }] =
    useUpdateStudyProgramMutation();
  const [deleteProdi, { isLoading: isDeleteLoading }] =
    useDeleteStudyProgramMutation();

  const prodiList = prodiResponse?.data || [];

  const handleAddProdi = (): void => {
    setSelectedProdi(null);
    setDialogOpen(true);
  };

  const handleEditProdi = (prodi: StudyProgramModel): void => {
    setSelectedProdi(prodi);
    setDialogOpen(true);
  };

  const handleDeleteProdi = (prodiId: number): void => {
    setDeleteProdiId(prodiId);
  };

  const confirmDeleteProdi = async (): Promise<void> => {
    if (deleteProdiId === null) return;
    const targetProdi = prodiList.find((p) => p.id === deleteProdiId);

    try {
      const response = await deleteProdi(deleteProdiId).unwrap();
      logActivity(
        "admin",
        `menghapus program studi: ${targetProdi?.name || deleteProdiId}`,
      );
      toast.success(
        response.message ||
          `Program studi "${targetProdi?.name || deleteProdiId}" berhasil dihapus.`,
      );
      setDeleteProdiId(null);
    } catch (err: unknown) {
      toast.error(extractErrorMessage(err));
    }
  };

  const handleSaveProdi = async (
    savedProdi: SaveStudyProgramRequest,
  ): Promise<void> => {
    try {
      if (selectedProdi) {
        // Edit Mode
        const response = await updateProdi({
          id: selectedProdi.id,
          body: savedProdi,
        }).unwrap();
        logActivity("admin", `memperbarui program studi: ${savedProdi.name}`);
        toast.success(
          response.message ||
            `Program studi "${savedProdi.name}" berhasil diperbarui.`,
        );
        setDialogOpen(false);
      } else {
        // Create Mode
        const response = await createProdi(savedProdi).unwrap();
        logActivity("admin", `menambah program studi baru: ${savedProdi.name}`);
        toast.success(
          response.message ||
            `Program studi "${savedProdi.name}" berhasil ditambahkan.`,
        );
        setDialogOpen(false);
      }
    } catch (err: unknown) {
      toast.error(extractErrorMessage(err));
    }
  };

  const logActivity = (username: string, action: string): void => {
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

  const activeDeleteProdiName = deleteProdiId
    ? prodiList.find((p) => p.id === deleteProdiId)?.name
    : "";

  if (isProdiLoading) {
    return (
      <div className="space-y-6 animate-fadeIn">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <Skeleton className="h-6 w-48 rounded" />
            <Skeleton className="h-4 w-[28rem] rounded mt-2" />
          </div>
          <Skeleton className="h-10 w-32 rounded-lg" />
        </div>
        <div className="relative max-w-sm">
          <Skeleton className="h-10 w-full rounded-lg" />
        </div>
        <div className="rounded-xl border border-border bg-card overflow-hidden shadow-sm p-5 space-y-4">
          <div className="flex justify-between items-center pb-4 border-b border-border/60">
            <Skeleton className="h-5 w-25 rounded" />
            <Skeleton className="h-5 w-40 rounded" />
          </div>
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="flex justify-between items-center py-2.5">
              <Skeleton className="h-4 w-12 rounded" />
              <Skeleton className="h-5 w-48 rounded" />
              <Skeleton className="h-5 w-[20rem] rounded" />
              <Skeleton className="h-5 w-24 rounded" />
              <Skeleton className="h-5 w-16 rounded" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fadeIn">
      <div>
        <h1 className="text-xl font-bold tracking-tight text-foreground md:text-2xl">
          Kelola Prodi
        </h1>
        <p className="text-xs text-muted-foreground mt-1">
          Atur program studi, rumpun akademik, dan penjaminan mutu fakultas di
          lingkungan universitas.
        </p>
      </div>

      {/* Search Bar */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative max-w-sm">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground/60" />
          <input
            type="text"
            placeholder="Cari nama prodi..."
            value={searchKeyword}
            onChange={(e) => setSearchKeyword(e.target.value)}
            className="w-full h-10 rounded-lg border border-border bg-card pl-9 pr-4 py-2 text-xs text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:ring-1 focus:ring-primary"
          />
        </div>
        <button
          onClick={handleAddProdi}
          className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-3 py-2 text-xs font-semibold text-primary-foreground hover:bg-primary/95 transition-all shadow-sm cursor-pointer self-start sm:self-auto"
        >
          <GraduationCap className="h-4 w-4" />
          <span>Tambah Prodi</span>
        </button>
      </div>

      <ProdiTable
        prodiList={prodiList}
        onEdit={handleEditProdi}
        onDelete={handleDeleteProdi}
      />

      <ProdiDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        prodi={selectedProdi}
        onSave={handleSaveProdi}
        isLoading={isCreateLoading || isUpdateLoading}
      />

      {/* Delete Prodi Confirmation Dialog */}
      <AlertDialog
        open={deleteProdiId !== null}
        onOpenChange={(open) => {
          if (isDeleteLoading) return;
          if (!open) setDeleteProdiId(null);
        }}
      >
        <AlertDialogContent className="bg-card border border-border p-6 rounded-xl sm:max-w-md">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-sm font-bold text-foreground uppercase tracking-wider">
              Konfirmasi Hapus Prodi
            </AlertDialogTitle>
            <AlertDialogDescription className="text-xs text-muted-foreground">
              Apakah Anda yakin ingin menghapus program studi &quot;
              {activeDeleteProdiName}&quot;? Tindakan ini bersifat permanen.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="flex justify-end gap-2 pt-2">
            <AlertDialogCancel
              disabled={isDeleteLoading}
              className="h-10 text-xs font-bold px-4 rounded-lg cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Batal
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={(e) => {
                e.preventDefault();
                confirmDeleteProdi();
              }}
              disabled={isDeleteLoading}
              className="bg-rose-600 text-white hover:bg-rose-700 font-semibold text-xs h-10 px-4 rounded-lg cursor-pointer flex items-center justify-center gap-1.5 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isDeleteLoading ? (
                <>
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  <span>Menghapus...</span>
                </>
              ) : (
                <span>Hapus</span>
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
