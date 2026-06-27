"use client";

import React, { useState, useEffect } from "react";
import { Plus, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { BagikanFormCard } from "./bagikan-form-card";
import { BagikanFormDialog } from "./bagikan-form-dialog";
import { useGetLinksQuery, useCreateLinkMutation } from "@/store/services/linkApi";
import { toast } from "sonner";

export function BagikanFormTab(): React.JSX.Element {
  const [instituteId, setInstituteId] = useState<number | null>(null);
  const [hasCheckedInstitute, setHasCheckedInstitute] = useState(false);
  const [addDialogOpen, setAddDialogOpen] = useState(false);

  // Retrieve user session from localStorage to check institute
  useEffect(() => {
    const raw = localStorage.getItem("userSession");
    let instId: number | null = null;
    if (raw) {
      try {
        const session = JSON.parse(raw);
        if (session.institute_id) {
          instId = Number(session.institute_id);
        }
      } catch {
        // ignore
      }
    }
    const timer = setTimeout(() => {
      if (instId) {
        setInstituteId(instId);
      }
      setHasCheckedInstitute(true);
    }, 0);
    return () => clearTimeout(timer);
  }, []);

  // Fetch links list for this institute
  const {
    data: linksResponse,
    isLoading: isLinksLoading,
    isError: isLinksError,
    refetch: refetchLinks,
  } = useGetLinksQuery(undefined, { skip: !instituteId });

  const links = linksResponse?.data || [];

  // Create link mutation
  const [createLink, { isLoading: isCreating }] = useCreateLinkMutation();

  const handleCreateLink = async (
    name: string,
    slug: string,
    description: string,
    startedAt: string,
    endedAt: string
  ) => {
    try {
      await createLink({
        name,
        slug,
        description,
        is_active: true,
        started_at: startedAt,
        ended_at: endedAt,
      }).unwrap();
      toast.success("Link shared form berhasil dibuat!");
      setAddDialogOpen(false);
    } catch (err: unknown) {
      const customErr = err as { data?: { message?: string } };
      toast.error(customErr?.data?.message || "Gagal membuat link shared form");
    }
  };

  if (!hasCheckedInstitute) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-40 w-full" />
      </div>
    );
  }

  // Warning if user has no institute_id
  if (!instituteId) {
    return (
      <div className="rounded-xl border border-error/25 bg-error/5 p-6 text-center space-y-4 max-w-xl mx-auto my-8 animate-fadeIn">
        <div className="mx-auto h-12 w-12 rounded-full bg-error/10 flex items-center justify-center text-error">
          <AlertCircle className="h-6 w-6" />
        </div>
        <div className="space-y-1.5">
          <h3 className="text-sm font-bold text-foreground uppercase tracking-wider">Akses Terbatas</h3>
          <p className="text-xs text-muted-foreground leading-relaxed">
            Akun Anda tidak terhubung dengan lembaga/institut terdaftar. Anda tidak diizinkan untuk membuat atau mengelola link shared form pengisian data rekognisi.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Top Header Controls */}
      <div className="flex items-center justify-between pb-2 border-b border-border/40">
        <div>
          <h2 className="text-xs font-bold text-foreground uppercase tracking-wider">Daftar Link Pengisian Form</h2>
          <p className="text-xs text-muted-foreground mt-0.5">Kelola link sharing untuk mengumpulkan data rekognisi dari dosen.</p>
        </div>
        <Button
          onClick={() => setAddDialogOpen(true)}
          className="inline-flex items-center gap-1.5 bg-primary text-primary-foreground text-xs font-semibold h-9 px-4 rounded-lg hover:bg-primary/95 shadow-sm transition-colors cursor-pointer"
        >
          <Plus className="h-3.5 w-3.5" /> Tambah Link
        </Button>
      </div>

      {/* Cards Stack */}
      <div className="space-y-6">
        {isLinksLoading ? (
          [1, 2].map((i) => (
            <div key={i} className="rounded-xl border border-border bg-card p-6 shadow-sm space-y-5 animate-pulse">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-3 border-b border-border/40">
                <div className="space-y-2">
                  <Skeleton className="h-5 w-48 rounded" />
                  <Skeleton className="h-4 w-72 rounded" />
                </div>
                <div className="flex gap-2 shrink-0">
                  <Skeleton className="h-8 w-24 rounded" />
                  <Skeleton className="h-8 w-20 rounded" />
                </div>
              </div>
              <div className="space-y-2.5">
                <Skeleton className="h-4 w-32 rounded" />
                <Skeleton className="h-10 w-full rounded" />
              </div>
            </div>
          ))
        ) : isLinksError ? (
          <div className="rounded-xl border border-error/25 bg-error/5 p-4 text-xs text-error flex justify-between items-center">
            <span>Gagal memuat daftar link dari server.</span>
            <Button variant="link" onClick={() => refetchLinks()} className="text-xs font-bold text-error underline p-0 h-auto">
              Coba Lagi
            </Button>
          </div>
        ) : links.length === 0 ? (
          <div className="rounded-xl border border-dashed border-border bg-card p-10 text-center text-xs text-muted-foreground">
            Belum ada link yang dibuat. Klik tombol &quot;Tambah Link&quot; di atas untuk membuat link pengisian baru.
          </div>
        ) : (
          links.map((link) => (
            <BagikanFormCard
              key={link.id}
              link={link}
            />
          ))
        )}
      </div>

      {/* Dialog: Tambah Link Baru */}
      <BagikanFormDialog
        open={addDialogOpen}
        onOpenChange={setAddDialogOpen}
        onSave={handleCreateLink}
        isSaving={isCreating}
      />
    </div>
  );
}
