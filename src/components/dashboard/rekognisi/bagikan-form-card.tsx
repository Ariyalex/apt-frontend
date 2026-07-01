"use client";

import React, { useState, useEffect } from "react";
import { format } from "date-fns";
import { id } from "date-fns/locale";
import { MoreVertical, Calendar, Check, Copy, Settings2, Trash2, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
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
import { BagikanFormSubmissionsTable } from "./bagikan-form-submissions-table";
import { EditLinkDialog } from "./edit-link-dialog";
import { SubmissionEditDialog } from "./submission-edit-dialog";
import { LinkModel } from "@/types/link";
import { useGetRecognitionListQuery, useApproveSubmissionMutation, useRejectSubmissionMutation, useUpdateRecognitionMutation } from "@/store/services/recognitionApi";
import { useUpdateLinkMutation, useDeleteLinkMutation } from "@/store/services/linkApi";
import { useGetRecognitionCategoriesQuery } from "@/store/services/recognitionCategoryApi";
import { toast } from "sonner";
import { Submission } from "@/dummy-data/bagikan-form";

interface BagikanFormCardProps {
  link: LinkModel;
}

export function BagikanFormCard({ link }: BagikanFormCardProps): React.JSX.Element {
  const [copied, setCopied] = useState(false);
  const [editLinkOpen, setEditLinkOpen] = useState(false);
  const [deleteAlertOpen, setDeleteAlertOpen] = useState(false);
  
  // Submission editing states
  const [editSubOpen, setEditSubOpen] = useState(false);
  const [selectedSub, setSelectedSub] = useState<Submission | null>(null);

  const [baseUrl, setBaseUrl] = useState("http://localhost:3000/form/rekognisi/");

  useEffect(() => {
    if (typeof window !== "undefined") {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setBaseUrl(`${window.location.origin}/form/rekognisi/`);
    }
  }, []);

  const fullUrl = `${baseUrl}${link.slug}`;

  // Fetch submissions for this link
  const { data: recognitionResponse, isLoading: isSubmissionsLoading } = useGetRecognitionListQuery({ link_id: link.id });
  const { data: categoriesResponse } = useGetRecognitionCategoriesQuery();
  const categoryList = categoriesResponse?.data || [];

  // Mutations
  const [updateLink, { isLoading: isUpdatingLink }] = useUpdateLinkMutation();
  const [deleteLink, { isLoading: isDeletingLink }] = useDeleteLinkMutation();
  const [approveSubmission, { isLoading: isApproving }] = useApproveSubmissionMutation();
  const [rejectSubmission, { isLoading: isRejecting }] = useRejectSubmissionMutation();
  const [updateRecognition, { isLoading: isUpdatingRec }] = useUpdateRecognitionMutation();

  const handleCopyLink = () => {
    navigator.clipboard.writeText(fullUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleEditLink = async (
    id: string,
    name: string,
    slug: string,
    description: string,
    isActive: boolean,
    startedAt: string,
    endedAt: string
  ) => {
    try {
      await updateLink({
        id,
        body: { name, slug, description, is_active: isActive, started_at: startedAt, ended_at: endedAt },
      }).unwrap();
      toast.success("Link shared form berhasil diperbarui!");
      setEditLinkOpen(false);
    } catch (err: unknown) {
      const customErr = err as { data?: { message?: string } };
      toast.error(customErr?.data?.message || "Gagal memperbarui link shared form");
    }
  };

  const handleDeleteLink = async () => {
    try {
      await deleteLink(link.id).unwrap();
      toast.success("Link shared form berhasil dihapus!");
      setDeleteAlertOpen(false);
    } catch (err: unknown) {
      const customErr = err as { data?: { message?: string } };
      toast.error(customErr?.data?.message || "Gagal menghapus link shared form");
    }
  };

  const handleAcceptSubmission = async (subId: string) => {
    try {
      await approveSubmission(subId).unwrap();
      toast.success("Pengajuan berhasil disetujui!");
    } catch (err: unknown) {
      const customErr = err as { data?: { message?: string } };
      toast.error(customErr?.data?.message || "Gagal menyetujui pengajuan");
    }
  };

  const handleDeclineSubmission = async (subId: string) => {
    try {
      await rejectSubmission(subId).unwrap();
      toast.success("Pengajuan berhasil ditolak!");
    } catch (err: unknown) {
      const customErr = err as { data?: { message?: string } };
      toast.error(customErr?.data?.message || "Gagal menolak pengajuan");
    }
  };

  const handleOpenEditSubmission = (sub: Submission) => {
    setSelectedSub(sub);
    setEditSubOpen(true);
  };

  const handleSaveSubmission = async (updated: Submission, lecturerId?: string) => {
    const matchedCategory = categoryList.find(
      (c) => c.name.toLowerCase() === updated.jenisRekognisi.toLowerCase()
    );
    const category_id = matchedCategory ? matchedCategory.id : 1;

    let resolvedLecturerId = lecturerId;
    if (!resolvedLecturerId) {
      const originalRec = (recognitionResponse?.data || []).find(r => r.id === updated.id);
      resolvedLecturerId = originalRec?.lecturer?.id || "";
    }

    try {
      await updateRecognition({
        id: updated.id,
        body: {
          lecturer_id: resolvedLecturerId,
          category_id,
          obtained_at: `${updated.tahun}-01-01T00:00:00Z`,
          description: updated.deskripsi,
          proof_links: updated.linkBukti ? updated.linkBukti.split(",").filter(Boolean) : [],
          link_id: link.id,
        },
      }).unwrap();
      toast.success("Data pengajuan berhasil diperbarui!");
      setEditSubOpen(false);
    } catch (err: unknown) {
      const customErr = err as { data?: { message?: string } };
      toast.error(customErr?.data?.message || "Gagal memperbarui data pengajuan");
    }
  };

  // Status computation
  const now = new Date();
  const isExpired = new Date(link.ended_at) < now;
  const isStarted = new Date(link.started_at) <= now;
  const displayStatus = !link.is_active
    ? "closed"
    : isExpired
    ? "expired"
    : !isStarted
    ? "upcoming"
    : "active";

  // Map recognition list to submission interface
  const submissions: Submission[] = (recognitionResponse?.data || []).map((rec) => ({
    id: rec.id,
    nip: rec.lecturer?.nip || "",
    nama: rec.lecturer?.name || "",
    prodi: rec.lecturer?.study_program?.name || "",
    jenisRekognisi: rec.category?.name || "",
    tahun: rec.obtained_at ? new Date(rec.obtained_at).getFullYear().toString() : "",
    deskripsi: rec.description,
    linkBukti: (rec.proof_links || []).join(","),
    status: (rec.status === "rejected" ? "declined" : rec.status || "pending") as "pending" | "approved" | "declined",
  }));

  return (
    <div className="rounded-xl border border-border bg-card shadow-md overflow-hidden flex flex-col">
      {/* Header section */}
      <div className="p-4 flex flex-col gap-3 border-b border-border/30 bg-muted/10">
        <div className="flex items-center justify-between gap-4">
          {/* Link Title and Details */}
          <div className="min-w-0">
            <h4 className="text-sm font-bold text-foreground truncate">{link.name}</h4>
            {link.description && (
              <p className="text-xs text-muted-foreground mt-0.5 line-clamp-1" title={link.description}>
                {link.description}
              </p>
            )}
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {/* Status Badge */}
            <div className="shrink-0">
              {displayStatus === "active" && (
                <span className="inline-flex items-center rounded-full bg-success/10 px-2.5 py-0.5 text-xs font-bold text-success">
                  Aktif
                </span>
              )}
              {displayStatus === "closed" && (
                <span className="inline-flex items-center rounded-full bg-muted border border-border px-2.5 py-0.5 text-xs font-bold text-muted-foreground">
                  Ditutup
                </span>
              )}
              {displayStatus === "expired" && (
                <span className="inline-flex items-center rounded-full bg-error/10 px-2.5 py-0.5 text-xs font-bold text-error">
                  Kedaluwarsa
                </span>
              )}
              {displayStatus === "upcoming" && (
                <span className="inline-flex items-center rounded-full bg-amber-500/10 px-2.5 py-0.5 text-xs font-bold text-amber-600">
                  Akan Datang
                </span>
              )}
            </div>

            {/* Ellipsis Actions Menu */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-muted-foreground hover:text-foreground cursor-pointer rounded-lg shrink-0"
                >
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="bg-card border border-border rounded-lg shadow-md p-1 min-w-[170px]">
                <DropdownMenuItem
                  onClick={() => setEditLinkOpen(true)}
                  className="cursor-pointer text-xs font-semibold px-3 py-2 hover:bg-muted flex items-center gap-2"
                >
                  <Settings2 className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                  <span>Edit Link</span>
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => setDeleteAlertOpen(true)}
                  className="cursor-pointer text-xs font-semibold px-3 py-2 hover:bg-muted flex items-center gap-2 text-error hover:text-error"
                >
                  <Trash2 className="h-3.5 w-3.5 text-error shrink-0" />
                  <span>Hapus Link</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        {/* Link Copy Bar & Expiry Details */}
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-4 text-xs">
          {/* Click-to-copy display */}
          <div
            onClick={handleCopyLink}
            className="flex items-center gap-1.5 cursor-pointer group select-none shrink-0"
            title="Klik untuk menyalin link"
          >
            <div className="flex items-center gap-1">
              <span className="font-mono text-muted-foreground">{baseUrl}</span>
              <span className="font-mono font-bold text-primary underline decoration-primary/40 group-hover:decoration-primary transition-all">
                {link.slug}
              </span>
            </div>
            {copied ? (
              <span className="inline-flex items-center gap-1 rounded bg-success/10 px-1.5 py-0.5 font-bold text-success animate-fadeIn shrink-0">
                <Check className="h-2.5 w-2.5" /> Tersalin
              </span>
            ) : (
              <span className="text-muted-foreground/0 group-hover:text-muted-foreground/75 transition-all flex items-center gap-0.5 shrink-0">
                <Copy className="h-3 w-3" />
              </span>
            )}
          </div>

          {/* Mulai & Selesai Dates */}
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 font-semibold text-muted-foreground">
            <span className="flex items-center gap-1 shrink-0">
              <Calendar className="h-3.5 w-3.5 opacity-60" />
              Mulai: {format(new Date(link.started_at), "d MMMM yyyy HH:mm", { locale: id })}
            </span>
            <span className="flex items-center gap-1 shrink-0">
              <Calendar className="h-3.5 w-3.5 opacity-60" />
              Selesai: {format(new Date(link.ended_at), "d MMMM yyyy HH:mm", { locale: id })}
            </span>
          </div>
        </div>
      </div>

      {/* Submissions table */}
      <div className="flex-1">
        <BagikanFormSubmissionsTable
          submissions={submissions}
          isLoading={isSubmissionsLoading}
          onAccept={handleAcceptSubmission}
          onDecline={handleDeclineSubmission}
          onEdit={handleOpenEditSubmission}
          isAuditing={isApproving || isRejecting}
        />
      </div>

      {/* Edit Link Dialog */}
      <EditLinkDialog
        open={editLinkOpen}
        onOpenChange={setEditLinkOpen}
        link={link}
        onSave={handleEditLink}
        isSaving={isUpdatingLink}
      />

      {/* Delete Link Alert */}
      <AlertDialog open={deleteAlertOpen} onOpenChange={setDeleteAlertOpen}>
        <AlertDialogContent className="bg-card border border-border p-6 rounded-xl">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-sm font-bold text-foreground uppercase tracking-wider">
              Hapus Link Shared Form
            </AlertDialogTitle>
            <AlertDialogDescription className="text-xs text-muted-foreground leading-relaxed mt-2">
              Apakah Anda yakin ingin menghapus link shared form <strong>&quot;{link.name}&quot;</strong>?
              Tindakan ini bersifat merusak, permanen, dan tidak dapat dibatalkan. Semua data rekognisi yang telah dikirim melalui link ini juga akan kehilangan relasi datanya.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="flex justify-end gap-2 pt-2">
            <AlertDialogCancel asChild>
              <Button variant="outline" disabled={isDeletingLink} className="text-xs font-semibold h-9 rounded-lg">
                Batal
              </Button>
            </AlertDialogCancel>
            <AlertDialogAction asChild>
              <Button
                onClick={(e) => {
                  e.preventDefault();
                  handleDeleteLink();
                }}
                disabled={isDeletingLink}
                className="bg-error text-error-foreground hover:bg-error/90 text-xs font-semibold h-9 rounded-lg cursor-pointer"
              >
                {isDeletingLink ? (
                  <>
                    <Loader2 className="h-3.5 w-3.5 animate-spin mr-1.5" />
                    Menghapus...
                  </>
                ) : (
                  "Hapus Link"
                )}
              </Button>
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Edit Submission Dialog */}
      <SubmissionEditDialog
        open={editSubOpen}
        onOpenChange={setEditSubOpen}
        submission={selectedSub}
        onSave={handleSaveSubmission}
        isSaving={isUpdatingRec}
      />
    </div>
  );
}
