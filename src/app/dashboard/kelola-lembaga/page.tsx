"use client";

import React, { useState, useEffect } from "react";
import { Building, Search, Loader2 } from "lucide-react";
import { LembagaTable } from "@/components/dashboard/admin/lembaga-table";
import { LembagaDialog } from "@/components/dashboard/admin/lembaga-dialog";
import { toast } from "sonner";
import { Skeleton } from "@/components/ui/skeleton";
import {
  useGetInstitutesQuery,
  useCreateInstituteMutation,
  useUpdateInstituteMutation,
  useDeleteInstituteMutation,
} from "@/store/services/instituteApi";
import type { InstituteModel, SaveInstituteRequest } from "@/types/institute";
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

export default function KelolaLembagaPage(): React.JSX.Element {
  const [searchKeyword, setSearchKeyword] = useState<string>("");
  const [debouncedSearch, setDebouncedSearch] = useState<string>("");
  const [dialogOpen, setDialogOpen] = useState<boolean>(false);
  const [selectedLembaga, setSelectedLembaga] = useState<InstituteModel | null>(
    null,
  );
  const [deleteLembagaId, setDeleteLembagaId] = useState<number | null>(null);

  // Debounce search query to reduce API calls
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(searchKeyword);
    }, 400);
    return () => clearTimeout(handler);
  }, [searchKeyword]);

  const [page, setPage] = useState<number>(1);
  const limit = 10;

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setPage(1);
  }, [debouncedSearch]);

  // RTK Query hooks
  const { data: responseData, isLoading: isInstitutesLoading } =
    useGetInstitutesQuery({ name: debouncedSearch, page, limit });
  const [createInstitute, { isLoading: isCreateLoading }] =
    useCreateInstituteMutation();
  const [updateInstitute, { isLoading: isUpdateLoading }] =
    useUpdateInstituteMutation();
  const [deleteInstitute, { isLoading: isDeleteLoading }] =
    useDeleteInstituteMutation();

  const lembagaList = responseData?.data || [];

  const handleAddLembaga = (): void => {
    setSelectedLembaga(null);
    setDialogOpen(true);
  };

  const handleEditLembaga = (lembaga: InstituteModel): void => {
    setSelectedLembaga(lembaga);
    setDialogOpen(true);
  };

  const handleDeleteLembaga = (lembagaId: number): void => {
    setDeleteLembagaId(lembagaId);
  };

  const confirmDeleteLembaga = async (): Promise<void> => {
    if (deleteLembagaId === null) return;
    const targetLemb = lembagaList.find((l) => l.id === deleteLembagaId);

    try {
      const response = await deleteInstitute(deleteLembagaId).unwrap();
      logActivity(
        "admin",
        `menghapus lembaga: ${targetLemb?.name || deleteLembagaId}`,
      );
      toast.success(
        response.message ||
          `Lembaga "${targetLemb?.name || deleteLembagaId}" berhasil dihapus.`,
      );
      setDeleteLembagaId(null);
    } catch (err: unknown) {
      toast.error(extractErrorMessage(err));
    }
  };

  const handleSaveLembaga = async (
    savedLembaga: SaveInstituteRequest,
  ): Promise<void> => {
    try {
      if (selectedLembaga) {
        // Edit Mode
        const response = await updateInstitute({
          id: selectedLembaga.id,
          body: savedLembaga,
        }).unwrap();
        logActivity("admin", `memperbarui lembaga: ${savedLembaga.name}`);
        toast.success(
          response.message ||
            `Lembaga "${savedLembaga.name}" berhasil diperbarui.`,
        );
        setDialogOpen(false);
      } else {
        // Create Mode
        const response = await createInstitute(savedLembaga).unwrap();
        logActivity("admin", `menambah lembaga baru: ${savedLembaga.name}`);
        toast.success(
          response.message ||
            `Lembaga "${savedLembaga.name}" berhasil ditambahkan.`,
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

  const activeDeleteLembagaName = deleteLembagaId
    ? lembagaList.find((l) => l.id === deleteLembagaId)?.name
    : "";

  if (isInstitutesLoading) {
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
            <Skeleton className="h-5 w-20 rounded" />
            <Skeleton className="h-5 w-40 rounded" />
          </div>
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="flex justify-between items-center py-2.5">
              <Skeleton className="h-4 w-12 rounded" />
              <Skeleton className="h-5 w-48 rounded" />
              <Skeleton className="h-5 w-[24rem] rounded" />
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
          Kelola Lembaga
        </h1>
        <p className="text-xs text-muted-foreground mt-1">
          Atur unit kerja, fakultas, program studi, dan lembaga penjaminan mutu
          di lingkungan universitas.
        </p>
      </div>

      {/* Search Input */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative max-w-sm">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground/60" />
          <input
            type="text"
            placeholder="Cari nama lembaga..."
            value={searchKeyword}
            onChange={(e) => setSearchKeyword(e.target.value)}
            className="w-full h-10 rounded-lg border border-border bg-card pl-9 pr-4 py-2 text-xs text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:ring-1 focus:ring-primary"
          />
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
        page={page}
        totalPages={responseData?.meta?.total_pages || 1}
        totalItems={responseData?.meta?.total_items || 0}
        onPageChange={(p) => setPage(p)}
        onEdit={handleEditLembaga}
        onDelete={handleDeleteLembaga}
      />

      <LembagaDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        lembaga={selectedLembaga}
        onSave={handleSaveLembaga}
        isLoading={isCreateLoading || isUpdateLoading}
      />

      {/* Delete Lembaga Confirmation Dialog */}
      <AlertDialog
        open={deleteLembagaId !== null}
        onOpenChange={(open) => {
          if (isDeleteLoading) return;
          if (!open) setDeleteLembagaId(null);
        }}
      >
        <AlertDialogContent className="bg-card border border-border p-6 rounded-xl sm:max-w-md">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-sm font-bold text-foreground uppercase tracking-wider">
              Konfirmasi Hapus Lembaga
            </AlertDialogTitle>
            <AlertDialogDescription className="text-xs text-muted-foreground">
              Apakah Anda yakin ingin menghapus lembaga &quot;
              {activeDeleteLembagaName}&quot;?
              <span className="block mt-2 font-semibold text-rose-600 dark:text-rose-400">
                Peringatan: Semua akun pengguna yang terdaftar di lembaga ini
                juga akan terhapus secara otomatis!
              </span>
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
                confirmDeleteLembaga();
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
