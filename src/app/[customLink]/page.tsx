"use client";

import React, { use, useState } from "react";
import Image from "next/image";
import logoUin from "../../../public/logo_uin.png";
import { Save, CheckCircle, AlertCircle, FileText, Plus, Trash2 } from "lucide-react";

import { initialSharingLinks } from "@/dummy-data/bagikan-form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Field, FieldLabel, FieldTitle } from "@/components/ui/field";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { DosenSearchDialog } from "@/components/dashboard/rekognisi/dosen-search-dialog";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import { notFound } from "next/navigation";
import { useGetLecturerByNipQuery } from "@/store/services/dosenApi";
import { useGetRecognitionCategoriesQuery } from "@/store/services/recognitionCategoryApi";

const facultySlugToName: Record<string, string> = {
  "sains-dan-teknologi": "Fakultas Sains dan Teknologi",
  "ilmu-tarbiyah-dan-keguruan": "Fakultas Ilmu Tarbiyah dan Keguruan",
  "ekonomi-dan-bisnis-islam": "Fakultas Ekonomi dan Bisnis Islam",
  "dakwah-dan-komunikasi": "Fakultas Dakwah dan Komunikasi",
  "adab-dan-ilmu-budaya": "Fakultas Adab dan Ilmu Budaya",
  "syariah-dan-hukum": "Fakultas Syariah dan Hukum",
};

interface PublicFormPageProps {
  params: Promise<{ customLink: string }>;
}

// Header Component (shared layout for both states)
const Header = () => (
  <header className="flex h-16 w-full items-center justify-between border-b border-border bg-card px-6 animate-fadeIn">
    {/* Left: Logo */}
    <div className="flex items-center gap-2.5">
      <Image
        src={logoUin}
        alt="Logo UIN"
        className="object-contain h-11 w-auto"
      />
    </div>
    {/* Right: App Title Only (No User Profile, No Sidebar) */}
    <div className="flex items-center">
      <span className="text-sm font-semibold text-muted-foreground">
        Aplikasi Penjamin Mutu
      </span>
    </div>
  </header>
);

const generateSubId = (): string => {
  return `sub-${Date.now()}`;
};

export default function PublicFormPage({ params }: PublicFormPageProps) {
  const { customLink } = use(params);

  // Find sharing link by name (matching the identifier customLink directly)
  const linkInfo = initialSharingLinks.find(
    (l) => l.name === customLink,
  );

  // If the link does not exist in our database records, throw a 404 notFound
  if (!linkInfo) {
    notFound();
  }

  const [submitted, setSubmitted] = useState(false);

  const faculty = linkInfo?.facultySlug || "sains-dan-teknologi";
  const facultyName =
    facultySlugToName[faculty] || "Fakultas Sains dan Teknologi";

  // Form states
  const [selectedNip, setSelectedNip] = useState("");
  const [jenisRekognisi, setJenisRekognisi] = useState("narasumber");
  const [tahun, setTahun] = useState(new Date().getFullYear().toString());
  const [deskripsi, setDeskripsi] = useState("");
  
  // Multiple proof link states
  const [linkBuktiList, setLinkBuktiList] = useState<string[]>([]);
  const [addLinkOpen, setAddLinkOpen] = useState(false);
  const [newLinkUrl, setNewLinkUrl] = useState("");

  // Check link validity
  const isLinkFound = !!linkInfo;
  const isLinkClosed = linkInfo?.status === "closed";
  const isLinkExpired = linkInfo
    ? new Date() > new Date(linkInfo.expiredAt)
    : false;
  const isLinkInvalid = !isLinkFound || isLinkClosed || isLinkExpired;

  const [searchDialogOpen, setSearchDialogOpen] = useState(false);

  // Find dynamic lecturer name based on chosen NIP from backend API
  const { data: lecturerResponse } = useGetLecturerByNipQuery(selectedNip, { skip: !selectedNip });
  const selectedLecturerName = lecturerResponse?.data?.name || "";

  // Fetch categories dynamically from API
  const { data: categoriesResponse, isLoading: isCategoriesLoading } = useGetRecognitionCategoriesQuery();
  const categoryList = categoriesResponse?.data || [];



  const handleAddLink = () => {
    if (!newLinkUrl.trim()) return;
    let url = newLinkUrl.trim();
    if (!/^https?:\/\//i.test(url)) {
      url = "https://" + url;
    }
    setLinkBuktiList([...linkBuktiList, url]);
    setNewLinkUrl("");
    setAddLinkOpen(false);
  };

  const handleRemoveLink = (indexToRemove: number) => {
    setLinkBuktiList(linkBuktiList.filter((_, i) => i !== indexToRemove));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (linkBuktiList.length === 0) {
      toast.error("Silakan tambahkan minimal 1 link bukti dokumen!");
      return;
    }
    
    // Construct and push new submission joined by comma
    if (linkInfo) {
      const prodiName = lecturerResponse?.data?.study_program?.name || "Teknik Informatika";
      linkInfo.submissions.push({
        id: generateSubId(),
        nip: selectedNip,
        nama: selectedLecturerName,
        prodi: prodiName,
        jenisRekognisi,
        tahun,
        deskripsi,
        linkBukti: linkBuktiList.join(","),
        status: "pending",
      });
    }
    
    setSubmitted(true);
    toast.success("Tanggapan rekognisi berhasil dikirim!");
  };

  const handleResetForm = () => {
    setSubmitted(false);
    setSelectedNip("");
    setJenisRekognisi("Narasumber");
    setTahun(new Date().getFullYear().toString());
    setDeskripsi("");
    setLinkBuktiList([]);
  };


  // Error/Invalid Screen
  if (isLinkInvalid) {
    return (
      <div className="min-h-screen bg-muted/10 flex flex-col font-sans">
        <Header />
        <main className="flex-1 flex items-center justify-center p-6">
          <div className="max-w-md w-full bg-card border border-border rounded-xl p-8 text-center space-y-6 shadow-sm animate-fadeIn">
            <div className="mx-auto h-12 w-12 rounded-full bg-error/10 flex items-center justify-center text-error">
              <AlertCircle className="h-6 w-6" />
            </div>

            <div className="space-y-2">
              <h1 className="text-sm font-bold text-foreground uppercase tracking-wider">
                {!isLinkFound
                  ? "Tautan Tidak Ditemukan"
                  : "Formulir Sudah Ditutup"}
              </h1>
              <p className="text-xs text-muted-foreground leading-relaxed">
                {!isLinkFound
                  ? `Tautan formulir dengan pengenal "${customLink}" tidak terdaftar dalam sistem.`
                  : `Formulir pengisian untuk "${linkInfo?.name}" saat ini dinonaktifkan atau telah melewati batas waktu pengisian.`}
              </p>
            </div>

            {linkInfo && (
              <div className="bg-muted/30 border border-border/50 rounded-lg p-3 text-left space-y-1.5">
                <div className="text-xs text-muted-foreground flex justify-between">
                  <span>Nama Form:</span>
                  <span className="font-bold text-foreground">
                    {linkInfo.name}
                  </span>
                </div>
                <div className="text-xs text-muted-foreground flex justify-between">
                  <span>Batas Waktu:</span>
                  <span className="font-semibold text-foreground">
                    {new Date(linkInfo.expiredAt).toLocaleString("id-ID", {
                      dateStyle: "medium",
                      timeStyle: "short",
                    })}
                  </span>
                </div>
              </div>
            )}
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-muted/10 flex flex-col font-sans">
      <Header />

      <main className="flex-1 flex flex-col py-8 px-4 items-center">
        <div className="max-w-2xl w-full space-y-6">
          {/* Main Card */}
          <div className="rounded-xl border border-border bg-card p-6 shadow-sm animate-fadeIn">
            {submitted ? (
              <div className="flex flex-col items-center justify-center py-12 space-y-4 text-center">
                <div className="h-14 w-14 rounded-full bg-success/10 flex items-center justify-center text-success">
                  <CheckCircle className="h-9 w-9 animate-bounce" />
                </div>
                <div className="space-y-1">
                  <h2 className="text-xs font-bold text-foreground uppercase tracking-wider">
                    Tanggapan Berhasil Dikirim!
                  </h2>
                  <p className="text-xs text-muted-foreground max-w-sm">
                    Terima kasih, data rekognisi Anda telah berhasil direkam ke
                    dalam form{" "}
                    <span className="font-bold text-foreground">
                      &quot;{linkInfo.name}&quot;
                    </span>
                    .
                  </p>
                </div>
                <div className="pt-4">
                  <Button
                    onClick={handleResetForm}
                    className="inline-flex items-center gap-1.5 bg-primary text-primary-foreground font-semibold text-xs px-4 py-2 rounded-lg hover:bg-primary/95 shadow-sm transition-colors cursor-pointer"
                  >
                    Kirim Tanggapan Lain
                  </Button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-5">
                {/* Form Header Info */}
                <div className="border-b border-border/40 pb-4 mb-2 space-y-1">
                  <div className="flex items-center gap-2 text-primary">
                    <FileText className="h-5 w-5" />
                    <span className="text-xs font-bold uppercase tracking-wider">
                      Formulir Rekognisi Dosen
                    </span>
                  </div>
                  <h1 className="text-sm font-bold text-foreground leading-tight">
                    {linkInfo.name}
                  </h1>
                  <p className="text-xs text-muted-foreground">
                    Gunakan formulir ini untuk mengajukan data rekognisi Anda.
                    Data akan divalidasi oleh Administrator sebelum
                    dipublikasikan.
                  </p>
                </div>

                {/* Field 1: NIP Dosen */}
                <Field>
                  <FieldLabel>
                    <FieldTitle>
                      NIP Dosen
                      <span className="text-error ml-0.5">*</span>
                    </FieldTitle>
                  </FieldLabel>
                  <Input
                    readOnly
                    placeholder="Klik untuk mencari NIP Dosen..."
                    value={selectedNip}
                    onClick={() => setSearchDialogOpen(true)}
                    className="h-10 text-xs border border-border rounded-lg bg-transparent px-3 text-foreground font-mono cursor-pointer"
                  />
                </Field>

                {/* Field 2: Nama Dosen (Display Text, not input field) */}
                {selectedNip && (
                  <div className="space-y-1 p-3.5 bg-muted/25 border border-border/60 rounded-lg animate-fadeIn">
                    <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                      Nama Dosen
                    </span>
                    <p className="text-xs font-bold text-foreground">
                      {selectedLecturerName}
                    </p>
                  </div>
                )}

                {/* Field 3: Jenis Rekognisi */}
                <Field>
                  <FieldLabel>
                    <FieldTitle>
                      Jenis Rekognisi
                      <span className="text-error ml-0.5">*</span>
                    </FieldTitle>
                  </FieldLabel>
                  <Select
                    value={jenisRekognisi}
                    onValueChange={setJenisRekognisi}
                    disabled={isCategoriesLoading}
                  >
                    <SelectTrigger className="w-full bg-muted/20 border border-border rounded-lg px-3 py-2 text-xs font-semibold focus:outline-none focus:border-primary transition-colors cursor-pointer justify-between disabled:opacity-50 disabled:cursor-not-allowed">
                      <SelectValue placeholder="Pilih Jenis Rekognisi" />
                    </SelectTrigger>
                    <SelectContent>
                      {categoryList.length > 0 ? (
                        categoryList.map((cat) => (
                          <SelectItem
                            key={cat.id}
                            value={cat.name}
                            className="text-xs font-semibold cursor-pointer capitalize"
                          >
                            {cat.name}
                          </SelectItem>
                        ))
                      ) : (
                        <SelectItem value="narasumber" disabled className="text-xs font-semibold">
                          Loading kategori...
                        </SelectItem>
                      )}
                    </SelectContent>
                  </Select>
                </Field>

                {/* Field 4: Tahun */}
                <Field>
                  <FieldLabel>
                    <FieldTitle>
                      Tahun
                      <span className="text-error ml-0.5">*</span>
                    </FieldTitle>
                  </FieldLabel>
                  <DatePicker
                    selected={tahun ? new Date(parseInt(tahun), 0, 1) : null}
                    onChange={(date: Date | null) => {
                      if (date) {
                        setTahun(date.getFullYear().toString());
                      }
                    }}
                    showYearPicker
                    dateFormat="yyyy"
                    customInput={
                      <input className="w-full bg-muted/20 border border-border rounded-lg px-3 py-2 text-xs font-semibold focus:outline-none focus:border-primary transition-colors cursor-pointer text-foreground text-left" />
                    }
                  />
                </Field>

                {/* Field 5: Deskripsi */}
                <Field>
                  <FieldLabel>
                    <FieldTitle>
                      Deskripsi Kegiatan
                      <span className="text-error ml-0.5">*</span>
                    </FieldTitle>
                  </FieldLabel>
                  <textarea
                    required
                    rows={3}
                    placeholder="Contoh: Pembicara dalam Seminar Nasional Teknologi Informasi..."
                    value={deskripsi}
                    onChange={(e) => setDeskripsi(e.target.value)}
                    className="w-full bg-muted/20 border border-border rounded-lg px-3.5 py-2 text-xs focus:outline-none focus:border-primary transition-colors resize-none text-foreground"
                  />
                </Field>

                {/* Field 6: Link Bukti (Multiple) */}
                <Field>
                  <div className="flex justify-between items-center mb-1">
                    <FieldLabel className="mb-0">
                      <FieldTitle>
                        Link Bukti Dokumen
                        <span className="text-error ml-0.5">*</span>
                      </FieldTitle>
                    </FieldLabel>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => setAddLinkOpen(true)}
                      className="h-8 px-2.5 border border-border hover:bg-muted/80 text-xs font-bold rounded-lg flex items-center gap-1 cursor-pointer"
                    >
                      <Plus className="h-3.5 w-3.5" /> Tambah Link
                    </Button>
                  </div>

                  {linkBuktiList.length === 0 ? (
                    <div className="text-center p-6 border border-dashed border-border rounded-lg text-xs text-muted-foreground">
                      Belum ada link bukti. Klik tombol &quot;+ Tambah Link&quot; untuk menambahkan.
                    </div>
                  ) : (
                    <div className="space-y-2 max-h-[150px] overflow-y-auto pr-1 scrollbar-thin">
                      {linkBuktiList.map((link, idx) => (
                        <div key={idx} className="p-2.5 bg-muted/15 border border-border rounded-lg flex items-center justify-between gap-3 text-xs">
                          <span className="font-mono text-muted-foreground truncate select-all flex-1" title={link}>
                            {link}
                          </span>
                          <button
                            type="button"
                            onClick={() => handleRemoveLink(idx)}
                            className="p-1 hover:bg-rose-500/10 text-muted-foreground hover:text-rose-600 rounded transition-colors cursor-pointer"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </Field>

                {/* Form Actions */}
                <div className="pt-2 flex justify-end">
                  <button
                    type="submit"
                    disabled={!selectedNip}
                    className="inline-flex items-center gap-1.5 bg-primary text-primary-foreground font-semibold text-xs px-4 py-2 rounded-lg hover:bg-primary/95 shadow-sm transition-colors cursor-pointer disabled:opacity-50 disabled:pointer-events-none"
                  >
                    <Save className="h-3.5 w-3.5" /> Kirim Tanggapan
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      </main>

      <DosenSearchDialog
        open={searchDialogOpen}
        onOpenChange={setSearchDialogOpen}
        onSelect={(nip) => {
          setSelectedNip(nip);
        }}
        userRole="Guest"
        defaultFaculty={facultyName}
      />

      {/* Dialog Tambah Link */}
      <Dialog open={addLinkOpen} onOpenChange={setAddLinkOpen}>
        <DialogContent className="sm:max-w-md bg-card border border-border p-6 rounded-xl">
          <DialogHeader>
            <DialogTitle className="text-sm font-bold text-foreground uppercase tracking-wider">
              Tambah Link Bukti Dokumen
            </DialogTitle>
          </DialogHeader>
          <div className="py-3">
            <Field>
              <FieldLabel>
                <FieldTitle>URL / Tautan Dokumen</FieldTitle>
              </FieldLabel>
              <Input
                type="text"
                placeholder="Contoh: drive.google.com/file/d/..."
                value={newLinkUrl}
                onChange={(e) => setNewLinkUrl(e.target.value)}
                className="h-10 text-xs border border-border rounded-lg bg-transparent px-3 text-foreground font-mono"
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    handleAddLink();
                  }
                }}
              />
            </Field>
          </div>
          <DialogFooter className="flex justify-end gap-2 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setNewLinkUrl("");
                setAddLinkOpen(false);
              }}
              className="text-xs font-semibold h-9 rounded-lg"
            >
              Batal
            </Button>
            <Button
              type="button"
              onClick={handleAddLink}
              disabled={!newLinkUrl.trim()}
              className="bg-primary text-primary-foreground text-xs font-semibold h-9 rounded-lg hover:bg-primary/90 cursor-pointer"
            >
              Tambah
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
