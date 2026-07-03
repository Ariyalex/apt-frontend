"use client";

import React, { useState, useEffect } from "react";
import { Search, Calendar as CalendarIcon, X, Trash2, Loader2, ChevronsLeft, ChevronLeft, ChevronRight, ChevronsRight } from "lucide-react";
import { format } from "date-fns";
import { id } from "date-fns/locale";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
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
import { useGetLogsQuery, useDeleteLogMutation } from "@/store/services/logApi";
import type { LogModel } from "@/types/log";

interface AktivitasTableProps {
  refreshTrigger: number;
}

export function AktivitasTable({ refreshTrigger }: AktivitasTableProps): React.JSX.Element {
  // Query parameters state
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [activeSearch, setActiveSearch] = useState<string>("");
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
  const [popoverOpen, setPopoverOpen] = useState<boolean>(false);
  const [page, setPage] = useState<number>(1);
  const limit = 10;

  // Confirm delete dialog state
  const [deleteTarget, setDeleteTarget] = useState<LogModel | null>(null);

  // RTK Query hooks
  const { data, isFetching, refetch } = useGetLogsQuery(
    {
      username: activeSearch || undefined,
      created_at: selectedDate ? selectedDate.toISOString() : undefined,
      page,
      limit,
    },
    { refetchOnMountOrArgChange: true }
  );

  const [deleteLog, { isLoading: isDeleting }] = useDeleteLogMutation();

  // Force refetch on refreshTrigger change
  useEffect(() => {
    refetch();
  }, [refreshTrigger, refetch]);

  const handleSearch = (): void => {
    setActiveSearch(searchQuery);
    setPage(1); // reset to page 1 on new search
  };

  const clearFilters = (): void => {
    setSearchQuery("");
    setActiveSearch("");
    setSelectedDate(undefined);
    setPage(1);
  };

  const handleDeleteConfirm = async (): Promise<void> => {
    if (!deleteTarget) return;
    try {
      const res = await deleteLog(deleteTarget.id).unwrap();
      if (res.success) {
        toast.success(res.message || "Log berhasil dihapus!");
        setDeleteTarget(null);
      } else {
        toast.error(res.message || "Gagal menghapus log.");
      }
    } catch (err: unknown) {
      const errorObj = err as { data?: { message?: string }; message?: string };
      toast.error(errorObj.data?.message || errorObj.message || "Terjadi kesalahan saat menghapus log.");
    }
  };

  const logs = data?.data || [];
  const meta = data?.meta;
  const totalPages = meta?.total_pages || 1;
  const totalItems = meta?.total_items || 0;
  const startItem = totalItems === 0 ? 0 : (page - 1) * limit + 1;
  const endItem = Math.min(page * limit, totalItems);

  return (
    <div className="space-y-4">
      {/* Search & Filter Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
        {/* Search Input */}
        <div className="flex flex-1 items-center max-w-md bg-card border border-border rounded-xl px-3 py-1.5 focus-within:border-primary transition-colors">
          <Search className="h-4 w-4 text-muted-foreground mr-2 shrink-0" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSearch()}
            placeholder="Cari username..."
            disabled={isFetching || isDeleting}
            className="w-full bg-transparent text-xs text-foreground focus:outline-none placeholder:text-muted-foreground/75 disabled:opacity-50"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              disabled={isFetching || isDeleting}
              className="text-muted-foreground hover:text-foreground cursor-pointer shrink-0 ml-1.5 disabled:opacity-50"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          )}
        </div>

        {/* Date Filter & Clear */}
        <div className="flex items-center gap-2">
          {(activeSearch || selectedDate) && (
            <Button
              onClick={clearFilters}
              variant="ghost"
              disabled={isFetching || isDeleting}
              className="text-xs text-error hover:bg-error/10 hover:text-error h-9 px-3 rounded-lg disabled:opacity-50"
            >
              Bersihkan Filter
            </Button>
          )}

          <Popover open={popoverOpen} onOpenChange={setPopoverOpen}>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                disabled={isFetching || isDeleting}
                className={`text-xs h-9 font-semibold border-border px-3.5 rounded-lg flex items-center gap-2 cursor-pointer disabled:opacity-50 ${
                  selectedDate ? "bg-primary/5 border-primary text-primary" : "text-foreground"
                }`}
              >
                <CalendarIcon className="h-3.5 w-3.5" />
                <span>
                  {selectedDate 
                    ? format(selectedDate, "dd MMMM yyyy", { locale: id }) 
                    : "Pilih Tanggal"}
                </span>
              </Button>
            </PopoverTrigger>
            <PopoverContent align="end" className="p-0 border-border bg-card">
              <Calendar
                mode="single"
                selected={selectedDate}
                onSelect={(date) => {
                  setSelectedDate(date);
                  setPopoverOpen(false);
                  setPage(1); // reset to page 1
                }}
                locale={id}
                className="bg-card text-foreground"
              />
            </PopoverContent>
          </Popover>
        </div>
      </div>

      {/* Logs Table */}
      <div className="rounded-xl border border-border bg-card overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="border-b border-border bg-muted/20 text-xs font-bold text-muted-foreground uppercase tracking-wider select-none">
                <TableHead className="px-5 py-3 w-16 text-center">No</TableHead>
                <TableHead className="px-5 py-3">Username</TableHead>
                <TableHead className="px-5 py-3">Aktivitas</TableHead>
                <TableHead className="px-5 py-3">Waktu</TableHead>
                <TableHead className="px-5 py-3 text-right">Aksi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody className="text-xs">
              {isFetching ? (
                // Skeletons during loading
                Array.from({ length: limit }).map((_, idx) => (
                  <TableRow key={idx}>
                    <TableCell className="text-center"><Skeleton className="h-4 w-6 mx-auto bg-muted/40" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-24 bg-muted/40" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-3/4 bg-muted/40" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-28 bg-muted/40" /></TableCell>
                    <TableCell className="text-right"><Skeleton className="h-6 w-6 ml-auto bg-muted/40" /></TableCell>
                  </TableRow>
                ))
              ) : logs.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="px-5 py-8 text-center text-muted-foreground italic">
                    Tidak ada aktivitas ditemukan.
                  </TableCell>
                </TableRow>
              ) : (
                logs.map((log, index) => (
                  <TableRow key={log.id} className="hover:bg-muted/5 transition-colors">
                    <TableCell className="px-5 py-3.5 text-center font-medium text-muted-foreground">
                      {(page - 1) * limit + index + 1}
                    </TableCell>
                    <TableCell className="px-5 py-3.5 font-bold text-foreground">
                      {log.user_username}
                    </TableCell>
                    <TableCell className="px-5 py-3.5 text-foreground leading-normal whitespace-pre-wrap break-all max-w-lg">
                      {log.activity}
                    </TableCell>
                    <TableCell className="px-5 py-3.5 font-medium text-muted-foreground whitespace-nowrap">
                      {format(new Date(log.created_at), "dd MMMM yyyy HH:mm:ss", { locale: id })}
                    </TableCell>
                    <TableCell className="px-5 py-3.5 text-right">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={(e) => {
                          e.stopPropagation();
                          setDeleteTarget(log);
                        }}
                        className="h-8 w-8 hover:bg-error/10 text-error hover:text-error cursor-pointer"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>

        {/* Pagination Controls */}
        {!isFetching && totalItems > 0 && (
          <div className="flex items-center justify-between px-5 py-3 border-t border-border bg-muted/10 text-xs text-muted-foreground select-none">
            <div>
              Menampilkan{" "}
              <span className="font-semibold text-foreground">{startItem}</span> -{" "}
              <span className="font-semibold text-foreground">{endItem}</span> dari{" "}
              <span className="font-semibold text-foreground">{totalItems}</span> log
            </div>
            <div className="flex items-center gap-1.5">
              <Button
                variant="outline"
                size="icon"
                className="h-8 w-8 cursor-pointer disabled:opacity-50"
                onClick={() => setPage(1)}
                disabled={page === 1}
              >
                <ChevronsLeft className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="icon"
                className="h-8 w-8 cursor-pointer disabled:opacity-50"
                onClick={() => setPage((prev) => Math.max(prev - 1, 1))}
                disabled={page === 1}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <span className="px-2 font-medium text-foreground">
                Halaman {page} dari {totalPages}
              </span>
              <Button
                variant="outline"
                size="icon"
                className="h-8 w-8 cursor-pointer disabled:opacity-50"
                onClick={() => setPage((prev) => Math.min(prev + 1, totalPages))}
                disabled={page === totalPages}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="icon"
                className="h-8 w-8 cursor-pointer disabled:opacity-50"
                onClick={() => setPage(totalPages)}
                disabled={page === totalPages}
              >
                <ChevronsRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Delete Confirmation Alert */}
      <AlertDialog open={!!deleteTarget} onOpenChange={(o) => !o && setDeleteTarget(null)}>
        <AlertDialogContent className="bg-card border border-border">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-sm font-bold text-foreground">
              Apakah Anda yakin ingin menghapus log ini?
            </AlertDialogTitle>
            <AlertDialogDescription className="text-xs text-muted-foreground leading-normal">
              Tindakan ini bersifat permanen dan tidak dapat dibatalkan. Log aktivitas oleh{" "}
              <strong>{deleteTarget?.user_username}</strong> akan dihapus dari sistem.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="text-xs">
            <AlertDialogCancel disabled={isDeleting} className="text-xs h-9 cursor-pointer">
              Batal
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={(e) => {
                e.preventDefault();
                handleDeleteConfirm();
              }}
              disabled={isDeleting}
              className="bg-error hover:bg-error/90 text-error-foreground font-semibold text-xs h-9 cursor-pointer flex items-center justify-center gap-1.5"
            >
              {isDeleting ? (
                <>
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  Menghapus...
                </>
              ) : (
                "Ya, Hapus"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
