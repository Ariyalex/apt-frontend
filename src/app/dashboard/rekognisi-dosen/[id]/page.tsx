"use client";

import React, { use, useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  BookOpen,
  Clock,
  FileText,
  CheckCircle2,
  XCircle,
  ExternalLink,
  Copy,
  Check,
  Award,
  AlertCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useGetRecognitionByIdQuery } from "@/store/services/recognitionApi";

interface DetailPageProps {
  params: Promise<{ id: string }>;
}

export default function DetailRekognisiPage({
  params,
}: DetailPageProps): React.JSX.Element {
  const { id } = use(params);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  // Fetch detail from API
  const {
    data: detailResponse,
    isLoading,
    isError,
  } = useGetRecognitionByIdQuery(id);
  const record = detailResponse?.data;

  // Loading state skeleton
  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto space-y-6 py-6">
        <div className="flex items-center gap-3">
          <Skeleton className="h-8 w-8 rounded-lg" />
          <div className="space-y-1.5">
            <Skeleton className="h-6 w-48 rounded" />
            <Skeleton className="h-4 w-64 rounded" />
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-1 rounded-xl border border-border bg-card p-6 space-y-4 shadow-sm animate-pulse">
            <Skeleton className="h-20 w-20 rounded-full mx-auto" />
            <Skeleton className="h-5 w-32 rounded mx-auto" />
            <Skeleton className="h-4 w-24 rounded mx-auto" />
          </div>
          <div className="md:col-span-2 rounded-xl border border-border bg-card p-6 space-y-4 shadow-sm animate-pulse">
            <Skeleton className="h-5 w-40 rounded" />
            <Skeleton className="h-10 w-full rounded" />
            <Skeleton className="h-10 w-full rounded" />
          </div>
        </div>
      </div>
    );
  }

  // Error/Not Found screen
  if (isError || !record) {
    return (
      <div className="max-w-2xl mx-auto py-16 px-4 text-center space-y-6">
        <div className="mx-auto h-12 w-12 rounded-full bg-rose-500/10 flex items-center justify-center text-rose-500">
          <AlertCircle className="h-6 w-6" />
        </div>
        <div className="space-y-2">
          <h1 className="text-xl font-bold text-foreground">
            Data Tidak Ditemukan
          </h1>
          <p className="text-xs text-muted-foreground">
            Rekognisi dengan ID{" "}
            <span className="font-mono text-foreground font-semibold">
              &quot;{id}&quot;
            </span>{" "}
            tidak tersedia atau telah dihapus dari sistem.
          </p>
        </div>
        <Link
          href="/dashboard/rekognisi-dosen"
          className="inline-flex h-9 items-center justify-center rounded-lg bg-primary text-primary-foreground px-4 text-xs font-semibold hover:bg-primary/95 transition-all"
        >
          Kembali ke Laporan Rekognisi
        </Link>
      </div>
    );
  }

  const lecturerName = record.lecturer?.name || "";
  const lecturerNip = record.lecturer?.nip || "";
  const prodiName = record.lecturer?.study_program?.name || "";
  const instituteName = record.lecturer?.institute?.name || "";
  const jenisRekognisi = record.category?.name || "";
  const isSubmission = !!record.link_id;
  const submissionStatus = record.status || "pending";
  const year = record.obtained_at
    ? new Date(record.obtained_at).getFullYear().toString()
    : "";

  // Get initials for profile placeholder
  const getInitials = (name: string): string => {
    return (
      name
        .split(" ")
        .filter((n) => !n.includes(".") && n.length > 0)
        .slice(0, 2)
        .map((n) => n[0])
        .join("")
        .toUpperCase() || "DS"
    );
  };



  return (
    <div className="max-w-4xl mx-auto space-y-6 py-6">
      {/* Header & Back Action */}
      <div className="flex items-center gap-3">
        <Link
          href="/dashboard/rekognisi-dosen"
          className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-border bg-card text-muted-foreground hover:text-foreground hover:bg-muted transition-all cursor-pointer"
        >
          <ArrowLeft className="h-4 w-4" />
        </Link>
        <div>
          <h1 className="text-xl font-bold tracking-tight text-foreground">
            Detail Rekognisi Dosen
          </h1>
          <p className="text-xs text-muted-foreground">
            {isSubmission
              ? "Informasi pengajuan data rekognisi dosen baru."
              : "Detail lengkap data rekognisi terverifikasi."}
          </p>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Left Card: Profile Overview */}
        <div className="md:col-span-1 rounded-xl border border-border bg-card p-6 text-center space-y-4 shadow-sm h-fit">
          <div className="mx-auto h-20 w-20 rounded-full bg-primary/10 border-2 border-primary/20 flex items-center justify-center text-primary font-bold text-xl select-none">
            {getInitials(lecturerName)}
          </div>
          <div className="space-y-1">
            <h2 className="text-sm font-bold text-foreground leading-snug">
              {lecturerName}
            </h2>
            <p className="text-xs font-mono text-muted-foreground font-semibold">
              {lecturerNip}
            </p>
          </div>
          <div className="border-t border-border/50 pt-4 space-y-3.5 text-left text-xs">
            {/* Program Studi */}
            <div className="space-y-1">
              <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider block">
                Program Studi
              </span>
              <span className="font-bold text-foreground block leading-snug">
                {prodiName}
              </span>
            </div>

            {/* Lembaga */}
            <div className="space-y-1">
              <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider block">
                Lembaga
              </span>
              <span className="font-bold text-foreground block leading-snug">
                {instituteName || "-"}
              </span>
            </div>
          </div>
        </div>

        {/* Right Card: Recognition Details */}
        <div className="md:col-span-2 rounded-xl border border-border bg-card p-6 space-y-6 shadow-sm">
          {/* Header Info */}
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border/40 pb-4">
            <h3 className="text-xs font-bold text-foreground uppercase tracking-wider flex items-center gap-1.5">
              <Award className="h-4 w-4 text-primary" /> Rincian Kegiatan
            </h3>

            {/* Submission Status or Verified Badge */}
            {isSubmission ? (
              <div className="flex items-center">
                {submissionStatus === "approved" && (
                  <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 px-3 py-1 text-xs font-bold text-emerald-600 dark:text-emerald-400">
                    <CheckCircle2 className="h-3.5 w-3.5" /> Disetujui (Admin)
                  </span>
                )}
                {submissionStatus === "rejected" && (
                  <span className="inline-flex items-center gap-1 rounded-full bg-rose-500/10 px-3 py-1 text-xs font-bold text-rose-600 dark:text-rose-400">
                    <XCircle className="h-3.5 w-3.5" /> Ditolak (Admin)
                  </span>
                )}
                {submissionStatus === "pending" && (
                  <span className="inline-flex items-center gap-1 rounded-full bg-amber-500/10 px-3 py-1 text-xs font-bold text-amber-600 dark:text-amber-400">
                    Menunggu Verifikasi
                  </span>
                )}
              </div>
            ) : (
              <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 px-3 py-1 text-xs font-bold text-emerald-600 dark:text-emerald-400">
                <CheckCircle2 className="h-3.5 w-3.5" /> Data Terverifikasi
              </span>
            )}
          </div>

          {/* Details Table List */}
          <div className="space-y-4 text-xs">
            {/* Field: Jenis Rekognisi */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 py-2 border-b border-border/20">
              <span className="font-bold text-muted-foreground uppercase tracking-wider text-xs flex items-center gap-1">
                <Award className="h-3.5 w-3.5 text-muted-foreground/60" /> Jenis
                Rekognisi
              </span>
              <span className="sm:col-span-2">
                <span
                  className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-bold bg-primary/10 text-primary capitalize`}
                >
                  {jenisRekognisi}
                </span>
              </span>
            </div>

            {/* Field: Tahun */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 py-2 border-b border-border/20">
              <span className="font-bold text-muted-foreground uppercase tracking-wider text-xs flex items-center gap-1">
                <Clock className="h-3.5 w-3.5 text-muted-foreground/60" /> Tahun
              </span>
              <span className="sm:col-span-2 font-bold text-foreground">
                {year}
              </span>
            </div>

            {/* Field: Deskripsi */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 py-2 border-b border-border/20">
              <span className="font-bold text-muted-foreground uppercase tracking-wider text-xs flex items-center gap-1">
                <FileText className="h-3.5 w-3.5 text-muted-foreground/60" />{" "}
                Deskripsi Kegiatan
              </span>
              <span className="sm:col-span-2 text-foreground font-semibold leading-relaxed">
                {record.description}
              </span>
            </div>

            {/* Field: Bukti Url */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 py-2">
              <span className="font-bold text-muted-foreground uppercase tracking-wider text-xs flex items-center gap-1">
                <BookOpen className="h-3.5 w-3.5 text-muted-foreground/60" />{" "}
                Link Bukti Dokumen
              </span>

              <div className="sm:col-span-2 space-y-4">
                {(record.proof_links || []).map((url, idx) => (
                  <div
                    key={idx}
                    className="space-y-2 border-b border-border/10 pb-3 last:border-0 last:pb-0"
                  >
                    <div
                      className="text-muted-foreground font-mono text-xs truncate bg-muted/20 border border-border/40 p-2 rounded-lg select-all"
                      title={url}
                    >
                      {url}
                    </div>
                    <div className="flex items-center gap-2">
                      <a
                        href={url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex h-8 items-center gap-1.5 rounded-lg bg-muted border border-border px-3 text-xs font-bold text-foreground hover:bg-muted/80 transition-all cursor-pointer"
                      >
                        <ExternalLink className="h-3.5 w-3.5" />
                        Kunjungi Tautan Bukti
                      </a>
                      <Button
                        variant="outline"
                        onClick={() => {
                          navigator.clipboard.writeText(url);
                          setCopiedIndex(idx);
                          setTimeout(() => setCopiedIndex(null), 2000);
                        }}
                        className="h-8 items-center gap-1.5 rounded-lg px-3 text-xs font-bold cursor-pointer"
                      >
                        {copiedIndex === idx ? (
                          <>
                            <Check className="h-3.5 w-3.5 text-success" />
                            Tersalin
                          </>
                        ) : (
                          <>
                            <Copy className="h-3.5 w-3.5" />
                            Salin Tautan
                          </>
                        )}
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
