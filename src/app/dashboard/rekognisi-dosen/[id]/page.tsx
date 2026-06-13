"use client";

import React, { use, useState } from "react";
import Link from "next/link";
import { 
  ArrowLeft, 
  User, 
  BookOpen, 
  Clock, 
  FileText, 
  CheckCircle2, 
  XCircle, 
  ExternalLink, 
  Copy, 
  Check, 
  Award,
  AlertCircle
} from "lucide-react";
import { initialData } from "@/dummy-data/rekognisi";
import { initialSharingLinks } from "@/dummy-data/bagikan-form";
import { Button } from "@/components/ui/button";

interface DetailPageProps {
  params: Promise<{ id: string }>;
}

export default function DetailRekognisiPage({ params }: DetailPageProps) {
  const { id } = use(params);
  const [copied, setCopied] = useState(false);

  // Search in standard initialData
  let record = initialData.find((item) => item.id === id);
  let isSubmission = false;
  let submissionStatus = "";

  if (!record) {
    // Search in sharing link submissions
    for (const link of initialSharingLinks) {
      const sub = link.submissions.find((s) => s.id === id);
      if (sub) {
        record = {
          id: sub.id,
          nip: sub.nip,
          nama: sub.nama,
          prodi: sub.prodi,
          jenisRekognisi: sub.jenisRekognisi,
          tahun: sub.tahun,
          deskripsi: sub.deskripsi,
          buktiUrl: sub.linkBukti,
        };
        isSubmission = true;
        submissionStatus = sub.status;
        break;
      }
    }
  }

  if (!record) {
    return (
      <div className="max-w-2xl mx-auto py-16 px-4 text-center space-y-6">
        <div className="mx-auto h-12 w-12 rounded-full bg-rose-500/10 flex items-center justify-center text-rose-500">
          <AlertCircle className="h-6 w-6" />
        </div>
        <div className="space-y-2">
          <h1 className="text-xl font-bold text-foreground">Data Tidak Ditemukan</h1>
          <p className="text-xs text-muted-foreground">
            Rekognisi dengan ID kustom <span className="font-mono text-foreground font-semibold">"{id}"</span> tidak tersedia atau telah dihapus dari sistem.
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

  // Get initials for profile placeholder
  const getInitials = (name: string) => {
    return name
      .split(" ")
      .filter((n) => !n.includes(".") && n.length > 0)
      .slice(0, 2)
      .map((n) => n[0])
      .join("")
      .toUpperCase() || "DS";
  };

  // Get faculty name dynamically based on study program
  const getFakultas = (prodi: string) => {
    const p = prodi.toLowerCase();
    if (
      p.includes("pendidikan agama islam") ||
      p.includes("pgmi") ||
      p.includes("mpi") ||
      p.includes("tadris bahasa inggris") ||
      p.includes("pendidikan")
    ) {
      return "Fakultas Tarbiyah dan Keguruan (FTK)";
    }
    if (
      p.includes("teknik informatika") ||
      p.includes("kimia") ||
      p.includes("sains") ||
      p.includes("teknik") ||
      p.includes("matematika")
    ) {
      return "Fakultas Sains dan Teknologi (FST)";
    }
    if (
      p.includes("perbankan syariah") ||
      p.includes("ekonomi") ||
      p.includes("manajemen keuangan") ||
      p.includes("akuntansi")
    ) {
      return "Fakultas Ekonomi dan Bisnis Islam (FEBI)";
    }
    if (
      p.includes("hukum ekonomi syariah") ||
      p.includes("hukum keluarga islam") ||
      p.includes("syariah") ||
      p.includes("hukum tata negara")
    ) {
      return "Fakultas Syariah (FS)";
    }
    if (
      p.includes("komunikasi penyiaran islam") ||
      p.includes("bimbingan penyuluhan") ||
      p.includes("dakwah")
    ) {
      return "Fakultas Dakwah dan Komunikasi (FDK)";
    }
    if (
      p.includes("bahasa dan sastra arab") ||
      p.includes("sejarah peradaban") ||
      p.includes("perpustakaan")
    ) {
      return "Fakultas Adab dan Humaniora (FAH)";
    }
    return "Fakultas Ushuluddin dan Filsafat (FUF)";
  };

  const handleCopyLink = () => {
    if (!record) return;
    navigator.clipboard.writeText(record.buktiUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
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
          <h1 className="text-xl font-bold tracking-tight text-foreground">Detail Rekognisi Dosen</h1>
          <p className="text-xs text-muted-foreground">
            {isSubmission ? "Informasi pengajuan data rekognisi dosen baru." : "Detail lengkap data rekognisi terverifikasi."}
          </p>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Left Card: Profile Overview */}
        <div className="md:col-span-1 rounded-xl border border-border bg-card p-6 text-center space-y-4 shadow-sm h-fit">
          <div className="mx-auto h-20 w-20 rounded-full bg-primary/10 border-2 border-primary/20 flex items-center justify-center text-primary font-bold text-xl select-none">
            {getInitials(record.nama)}
          </div>
          <div className="space-y-1">
            <h2 className="text-sm font-bold text-foreground leading-snug">{record.nama}</h2>
            <p className="text-xs font-mono text-muted-foreground font-semibold">{record.nip}</p>
          </div>
          <div className="border-t border-border/50 pt-4 space-y-3.5 text-left text-xs">
            {/* Program Studi */}
            <div className="space-y-1">
              <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider block">
                Program Studi
              </span>
              <span className="font-bold text-foreground block leading-snug">
                {record.prodi}
              </span>
            </div>

            {/* Fakultas */}
            <div className="space-y-1">
              <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider block">
                Fakultas
              </span>
              <span className="font-bold text-foreground block leading-snug">
                {getFakultas(record.prodi)}
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
                {submissionStatus === "declined" && (
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
                <Award className="h-3.5 w-3.5 text-muted-foreground/60" /> Jenis Rekognisi
              </span>
              <span className="sm:col-span-2">
                <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-bold ${
                  record.jenisRekognisi === "Narasumber" ? "bg-cyan-500/10 text-cyan-600 dark:text-cyan-400" :
                  record.jenisRekognisi === "Tenaga Ahli" ? "bg-indigo-500/10 text-indigo-600 dark:text-indigo-400" :
                  record.jenisRekognisi === "Reviewer Jurnal" ? "bg-purple-500/10 text-purple-600 dark:text-purple-400" :
                  record.jenisRekognisi === "Asesor Akreditasi" ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400" :
                  "bg-amber-500/10 text-amber-600 dark:text-amber-400"
                }`}>
                  {record.jenisRekognisi}
                </span>
              </span>
            </div>

            {/* Field: Tahun */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 py-2 border-b border-border/20">
              <span className="font-bold text-muted-foreground uppercase tracking-wider text-xs flex items-center gap-1">
                <Clock className="h-3.5 w-3.5 text-muted-foreground/60" /> Tahun
              </span>
              <span className="sm:col-span-2 font-bold text-foreground">{record.tahun}</span>
            </div>

            {/* Field: Deskripsi */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 py-2 border-b border-border/20">
              <span className="font-bold text-muted-foreground uppercase tracking-wider text-xs flex items-center gap-1">
                <FileText className="h-3.5 w-3.5 text-muted-foreground/60" /> Deskripsi Kegiatan
              </span>
              <span className="sm:col-span-2 text-foreground font-semibold leading-relaxed">
                {record.deskripsi}
              </span>
            </div>

            {/* Field: Bukti Url */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 py-2">
              <span className="font-bold text-muted-foreground uppercase tracking-wider text-xs flex items-center gap-1">
                <BookOpen className="h-3.5 w-3.5 text-muted-foreground/60" /> Link Bukti Dokumen
              </span>
              
              <div className="sm:col-span-2 space-y-2">
                <div className="text-muted-foreground font-mono text-xs truncate bg-muted/20 border border-border/40 p-2 rounded-lg select-all" title={record.buktiUrl}>
                  {record.buktiUrl}
                </div>
                <div className="flex items-center gap-2">
                  <a
                    href={record.buktiUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex h-8 items-center gap-1.5 rounded-lg bg-muted border border-border px-3 text-xs font-bold text-foreground hover:bg-muted/80 transition-all cursor-pointer"
                  >
                    <ExternalLink className="h-3.5 w-3.5" />
                    Kunjungi Tautan Bukti
                  </a>
                  <Button
                    variant="outline"
                    onClick={handleCopyLink}
                    className="h-8 items-center gap-1.5 rounded-lg px-3 text-xs font-bold cursor-pointer"
                  >
                    {copied ? (
                      <>
                        <Check className="h-3.5 w-3.5 text-emerald-500" />
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
            </div>
            
          </div>
        </div>
        
      </div>
    </div>
  );
}
