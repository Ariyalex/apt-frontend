"use client";

import React, { use, useState } from "react";
import Image from "next/image";
import logoUin from "../../../public/logo_uin.png";
import {
  Save,
  CheckCircle,
  AlertCircle,
  FileText,
  Plus,
  Trash2,
  Loader2,
  Edit2,
} from "lucide-react";
import { format } from "date-fns";
import { id } from "date-fns/locale";

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
import { Skeleton } from "@/components/ui/skeleton";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import { useGetLecturerByNipQuery } from "@/store/services/dosenApi";
import { useGetRecognitionCategoriesQuery } from "@/store/services/recognitionCategoryApi";
import { useGetLinkBySlugQuery } from "@/store/services/linkApi";
import { useCreatePublicRecognitionMutation } from "@/store/services/recognitionApi";

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

export default function PublicFormPage({ params }: PublicFormPageProps) {
  const { customLink } = use(params);

  // Validate and get link info from API
  const {
    data: linkResponse,
    isLoading: isLinkLoading,
    isError: isLinkError,
  } = useGetLinkBySlugQuery(customLink);

  const linkInfo = linkResponse?.data;

  const [submitted, setSubmitted] = useState(false);

  // Form states
  const [selectedNip, setSelectedNip] = useState("");
  const [jenisRekognisi, setJenisRekognisi] = useState("");
  const [tahun, setTahun] = useState(new Date().getFullYear().toString());
  const [deskripsi, setDeskripsi] = useState("");

  // Multiple proof link states
  const [linkBuktiList, setLinkBuktiList] = useState<string[]>([]);
  const [addLinkOpen, setAddLinkOpen] = useState(false);
  const [newLinkUrl, setNewLinkUrl] = useState("");

  const [searchDialogOpen, setSearchDialogOpen] = useState(false);

  // Edit Link states
  const [editLinkOpen, setEditLinkOpen] = useState(false);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [editingUrl, setEditingUrl] = useState("");

  const handleOpenEditLink = (index: number) => {
    setEditingIndex(index);
    setEditingUrl(linkBuktiList[index]);
    setEditLinkOpen(true);
  };

  const handleSaveEditLink = () => {
    if (editingIndex === null || !editingUrl.trim()) return;
    const newList = [...linkBuktiList];
    newList[editingIndex] = editingUrl.trim();
    setLinkBuktiList(newList);
    setEditLinkOpen(false);
    setEditingIndex(null);
    setEditingUrl("");
  };

  // Find dynamic lecturer name based on chosen NIP from backend API
  const { data: lecturerResponse } = useGetLecturerByNipQuery(selectedNip, {
    skip: !selectedNip,
  });
  const selectedLecturerName = lecturerResponse?.data?.name || "";

  // Fetch categories dynamically from API
  const { data: categoriesResponse, isLoading: isCategoriesLoading } =
    useGetRecognitionCategoriesQuery();
  const categoryList = categoriesResponse?.data || [];

  // Mutations
  const [createPublicRecognition, { isLoading: isSubmitting }] =
    useCreatePublicRecognitionMutation();

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (linkBuktiList.length === 0) {
      toast.error("Silakan tambahkan minimal 1 link bukti dokumen!");
      return;
    }

    if (!linkInfo) return;

    const matchedCategory = categoryList.find(
      (cat) => cat.name.toLowerCase() === jenisRekognisi.toLowerCase(),
    );
    const category_id = matchedCategory
      ? matchedCategory.id
      : categoryList[0]?.id || 1;

    const lecturerId = lecturerResponse?.data?.id;
    if (!lecturerId) {
      toast.error(
        "Data dosen belum ditemukan. Silakan cari NIP dosen terlebih dahulu.",
      );
      return;
    }

    try {
      const response = await createPublicRecognition({
        lecturer_id: lecturerId,
        category_id,
        obtained_at: `${tahun}-01-01T00:00:00Z`,
        description: deskripsi,
        proof_links: linkBuktiList,
        link_id: linkInfo.id,
      }).unwrap();

      if (response.success) {
        setSubmitted(true);
        toast.success("Tanggapan rekognisi berhasil dikirim!");
      } else {
        toast.error(response.message || "Gagal mengirim tanggapan");
      }
    } catch (err: unknown) {
      const customErr = err as {
        data?: { message?: string };
        message?: string;
      };
      const errMsg =
        customErr?.data?.message ||
        customErr?.message ||
        "Terjadi kesalahan saat mengirim tanggapan";
      toast.error(errMsg);
    }
  };

  const handleResetForm = () => {
    setSubmitted(false);
    setSelectedNip("");
    setJenisRekognisi("narasumber");
    setTahun(new Date().getFullYear().toString());
    setDeskripsi("");
    setLinkBuktiList([]);
  };

  // Loading Screen
  if (isLinkLoading) {
    return (
      <div className="min-h-screen bg-muted/10 flex flex-col font-sans">
        <Header />
        <main className="flex-1 flex flex-col py-8 px-4 items-center">
          <div className="max-w-2xl w-full rounded-xl border border-border bg-card p-6 shadow-sm space-y-4 animate-pulse">
            <Skeleton className="h-6 w-1/3 rounded" />
            <Skeleton className="h-10 w-full rounded" />
            <Skeleton className="h-10 w-full rounded" />
            <Skeleton className="h-28 w-full rounded" />
          </div>
        </main>
      </div>
    );
  }

  // Error / Not Found Screen
  if (isLinkError || !linkInfo) {
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
                Tautan Tidak Ditemukan
              </h1>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Tautan formulir dengan pengenal &quot;{customLink}&quot; tidak
                terdaftar atau telah dihapus dari sistem.
              </p>
            </div>
          </div>
        </main>
      </div>
    );
  }

  // Check validity
  const now = new Date();
  const isLinkClosed = !linkInfo.is_active;
  const isLinkExpired = now > new Date(linkInfo.ended_at);
  const isLinkUpcoming = now < new Date(linkInfo.started_at);
  const isLinkInvalid = isLinkClosed || isLinkExpired || isLinkUpcoming;

  // Closed, Expired, or Upcoming Screen
  if (isLinkInvalid) {
    let title = "Formulir Sudah Ditutup";
    let desc = `Formulir pengisian untuk "${linkInfo.name}" saat ini dinonaktifkan atau telah melewati batas waktu pengisian.`;
    if (isLinkUpcoming) {
      title = "Formulir Belum Dibuka";
      desc = `Formulir pengisian untuk "${linkInfo.name}" baru akan dibuka pada ${format(new Date(linkInfo.started_at), "d MMMM yyyy HH:mm", { locale: id })}.`;
    }
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
                {title}
              </h1>
              <p className="text-xs text-muted-foreground leading-relaxed">
                {desc}
              </p>
            </div>

            <div className="bg-muted/30 border border-border/50 rounded-lg p-3 text-left space-y-1.5">
              <div className="text-xs text-muted-foreground flex justify-between">
                <span>Nama Form:</span>
                <span className="font-bold text-foreground">
                  {linkInfo.name}
                </span>
              </div>
              <div className="text-xs text-muted-foreground flex justify-between">
                <span>Mulai:</span>
                <span className="font-semibold text-foreground">
                  {format(new Date(linkInfo.started_at), "d MMMM yyyy HH:mm", {
                    locale: id,
                  })}
                </span>
              </div>
              <div className="text-xs text-muted-foreground flex justify-between">
                <span>Selesai:</span>
                <span className="font-semibold text-foreground">
                  {format(new Date(linkInfo.ended_at), "d MMMM yyyy HH:mm", {
                    locale: id,
                  })}
                </span>
              </div>
            </div>
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
                  {linkInfo.description && (
                    <p className="text-xs text-muted-foreground">
                      {linkInfo.description}
                    </p>
                  )}
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
                    disabled={isSubmitting}
                    placeholder="Klik untuk mencari NIP Dosen..."
                    value={selectedNip}
                    onClick={() => !isSubmitting && setSearchDialogOpen(true)}
                    className="h-10 text-xs border border-border rounded-lg bg-transparent px-3 text-foreground font-mono cursor-pointer disabled:opacity-50"
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
                    disabled={isSubmitting || isCategoriesLoading}
                  >
                    <SelectTrigger className="w-full bg-card border border-border rounded-lg px-3 py-2 text-xs font-semibold focus:outline-none focus:border-primary transition-colors cursor-pointer justify-between disabled:opacity-50">
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
                        <SelectItem
                          value="narasumber"
                          disabled
                          className="text-xs font-semibold"
                        >
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
                      <input
                        disabled={isSubmitting}
                        className="w-full bg-card border border-border rounded-lg px-3 py-2 text-xs font-semibold focus:outline-none focus:border-primary transition-colors cursor-pointer text-foreground text-left disabled:opacity-50 disabled:cursor-not-allowed"
                      />
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
                    disabled={isSubmitting}
                    placeholder="Contoh: Pembicara dalam Seminar Nasional Teknologi Informasi..."
                    value={deskripsi}
                    onChange={(e) => setDeskripsi(e.target.value)}
                    className="w-full bg-card border border-border rounded-lg px-3.5 py-2 text-xs focus:outline-none focus:border-primary transition-colors resize-none text-foreground disabled:opacity-50"
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
                      disabled={isSubmitting}
                      onClick={() => setAddLinkOpen(true)}
                      className="h-8 px-2.5 border border-border hover:bg-muted/80 text-xs font-bold rounded-lg flex items-center gap-1 cursor-pointer disabled:opacity-50"
                    >
                      <Plus className="h-3.5 w-3.5" /> Tambah Link
                    </Button>
                  </div>

                  {linkBuktiList.length === 0 ? (
                    <div className="text-center p-6 border border-dashed border-border rounded-lg text-xs text-muted-foreground">
                      Belum ada link bukti. Klik tombol &quot;+ Tambah
                      Link&quot; untuk menambahkan.
                    </div>
                  ) : (
                    <div className="space-y-2 max-h-[150px] overflow-y-auto pr-1 scrollbar-thin">
                      {linkBuktiList.map((link, idx) => (
                        <div
                          key={idx}
                          className="p-2.5 bg-muted/15 border border-border rounded-lg flex items-center justify-between gap-3 text-xs"
                        >
                          <span
                            className="font-mono text-muted-foreground truncate select-all flex-1"
                            title={link}
                          >
                            {link}
                          </span>
                          <div className="flex items-center gap-1 shrink-0">
                            <button
                              type="button"
                              disabled={isSubmitting}
                              onClick={() => handleOpenEditLink(idx)}
                              className="p-1 hover:bg-primary/10 text-muted-foreground hover:text-primary rounded transition-colors cursor-pointer disabled:opacity-50"
                              title="Edit Link"
                            >
                              <Edit2 className="h-4 w-4" />
                            </button>
                            <button
                              type="button"
                              disabled={isSubmitting}
                              onClick={() => handleRemoveLink(idx)}
                              className="p-1 hover:bg-rose-500/10 text-muted-foreground hover:text-rose-600 rounded transition-colors cursor-pointer disabled:opacity-50"
                              title="Hapus Link"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </Field>

                {/* Form Actions */}
                <div className="pt-2 flex justify-end">
                  <button
                    type="submit"
                    disabled={isSubmitting || !selectedNip || !jenisRekognisi}
                    className="inline-flex items-center gap-1.5 bg-primary text-primary-foreground font-semibold text-xs px-4 py-2 rounded-lg hover:bg-primary/95 shadow-sm transition-colors cursor-pointer disabled:opacity-50 disabled:pointer-events-none"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="h-3.5 w-3.5 animate-spin mr-1.5" />
                        Kirim...
                      </>
                    ) : (
                      <>
                        <Save className="h-3.5 w-3.5" /> Kirim Tanggapan
                      </>
                    )}
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
                disabled={isSubmitting}
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
              disabled={isSubmitting}
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
              disabled={isSubmitting || !newLinkUrl.trim()}
              className="bg-primary text-primary-foreground text-xs font-semibold h-9 rounded-lg px-3 hover:bg-primary/90 cursor-pointer disabled:opacity-50"
            >
              Tambah
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog Edit Link */}
      <Dialog open={editLinkOpen} onOpenChange={setEditLinkOpen}>
        <DialogContent className="sm:max-w-md bg-card border border-border p-6 rounded-xl">
          <DialogHeader>
            <DialogTitle className="text-sm font-bold text-foreground uppercase tracking-wider">
              Edit Link Bukti Dokumen
            </DialogTitle>
          </DialogHeader>
          <div className="py-3">
            <Field>
              <FieldLabel>
                <FieldTitle>URL / Tautan Dokumen</FieldTitle>
              </FieldLabel>
              <Input
                type="text"
                disabled={isSubmitting}
                placeholder="Contoh: drive.google.com/file/d/..."
                value={editingUrl}
                onChange={(e) => setEditingUrl(e.target.value)}
                className="w-full text-xs h-10 border border-border bg-card rounded-lg focus-visible:ring-1 focus-visible:ring-primary"
              />
            </Field>
          </div>
          <DialogFooter className="flex justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setEditingUrl("");
                setEditLinkOpen(false);
                setEditingIndex(null);
              }}
              className="text-xs font-semibold h-9 rounded-lg"
            >
              Batal
            </Button>
            <Button
              type="button"
              onClick={handleSaveEditLink}
              disabled={!editingUrl.trim()}
              className="bg-primary text-primary-foreground text-xs font-semibold h-9 rounded-lg hover:bg-primary/90 cursor-pointer"
            >
              Simpan
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
