"use client";

import React, { useState, useEffect } from "react";
import {
  Plus,
  Edit,
  Trash2,
  Shield,
  Calendar,
  FileText,
  UploadCloud,
  Loader2,
  X,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Field, FieldLabel } from "@/components/ui/field";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
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
import {
  Attachment,
  AttachmentContent,
  AttachmentTitle,
  AttachmentDescription,
  AttachmentMedia,
  AttachmentActions,
  AttachmentAction,
} from "@/components/ui/attachment";
import {
  getStoredAkreditasi,
  saveStoredAkreditasi,
} from "@/dummy-data/mutu-banpt";
import { Akreditasi } from "@/types/mutu-banpt";

export default function AkreditasiPage(): React.JSX.Element {
  const [list, setList] = useState<Akreditasi[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Dialog Add/Edit State
  const [isDialogOpen, setIsDialogOpen] = useState<boolean>(false);
  const [editingAkred, setEditingAkred] = useState<Akreditasi | null>(null);

  // Form Fields
  const [formNama, setFormNama] = useState<string>("");
  const [formDeskripsi, setFormDeskripsi] = useState<string>("");
  const [formTahun, setFormTahun] = useState<string>("");
  const [formRef, setFormRef] = useState<string>("");
  const [isSaving, setIsSaving] = useState<boolean>(false);

  // Attachment upload status
  const [uploadState, setUploadState] = useState<"idle" | "uploading" | "done">(
    "idle",
  );
  const [dragActive, setDragActive] = useState<boolean>(false);

  // Delete State
  const [deleteTarget, setDeleteTarget] = useState<Akreditasi | null>(null);

  // Simulated Loading State
  useEffect(() => {
    const timer = setTimeout(() => {
      setList(getStoredAkreditasi());
      setIsLoading(false);
    }, 700);
    return () => clearTimeout(timer);
  }, []);

  // Listen for local list updates
  useEffect(() => {
    const handleListChange = () => {
      setList(getStoredAkreditasi());
    };
    window.addEventListener("akreditasi_list_change", handleListChange);
    return () =>
      window.removeEventListener("akreditasi_list_change", handleListChange);
  }, []);

  const openAddDialog = () => {
    setEditingAkred(null);
    setFormNama("");
    setFormDeskripsi("");
    setFormTahun(new Date().getFullYear().toString());
    setFormRef("");
    setUploadState("idle");
    setIsDialogOpen(true);
  };

  const openEditDialog = (item: Akreditasi) => {
    setEditingAkred(item);
    setFormNama(item.nama);
    setFormDeskripsi(item.deskripsi);
    setFormTahun(item.tahun);
    setFormRef(item.referensi);
    setUploadState(item.referensi ? "done" : "idle");
    setIsDialogOpen(true);
  };

  // Drag & drop handlers
  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      processFile(e.target.files[0]);
    }
  };

  const processFile = (file: File) => {
    const allowedExtensions = [
      "jpg",
      "jpeg",
      "png",
      "zip",
      "pdf",
      "xlsx",
      "xls",
      "doc",
      "docx",
      "docs",
    ];
    const ext = file.name.split(".").pop()?.toLowerCase();

    if (!ext || !allowedExtensions.includes(ext)) {
      toast.error(
        `Format file .${ext} tidak diizinkan. Gunakan dokumen/gambar valid.`,
      );
      return;
    }

    setUploadState("uploading");
    setTimeout(() => {
      setFormRef(file.name);
      setUploadState("done");
      toast.success("File referensi berhasil dilampirkan!");
    }, 1000);
  };

  const removeAttachment = () => {
    setFormRef("");
    setUploadState("idle");
  };

  const handleSave = async () => {
    if (!formNama.trim() || !formTahun.trim()) {
      toast.error("Nama akreditasi dan tahun harus diisi!");
      return;
    }

    setIsSaving(true);
    await new Promise((resolve) => setTimeout(resolve, 800));

    const currentList = getStoredAkreditasi();

    if (editingAkred) {
      // Edit mode
      const updatedList = currentList.map((a) =>
        a.id === editingAkred.id
          ? {
              ...a,
              nama: formNama,
              deskripsi: formDeskripsi,
              tahun: formTahun,
              referensi: formRef,
            }
          : a,
      );
      saveStoredAkreditasi(updatedList);
      toast.success("Akreditasi berhasil diperbarui!");
    } else {
      // Add mode
      const newItem: Akreditasi = {
        id: `akred-${Date.now()}`,
        nama: formNama,
        deskripsi: formDeskripsi,
        tahun: formTahun,
        referensi: formRef,
      };
      saveStoredAkreditasi([...currentList, newItem]);
      toast.success("Akreditasi baru berhasil ditambahkan!");
    }

    setIsSaving(false);
    setIsDialogOpen(false);
  };

  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return;

    const currentList = getStoredAkreditasi();
    const updatedList = currentList.filter((a) => a.id !== deleteTarget.id);
    saveStoredAkreditasi(updatedList);

    // Clear active selection if the active one was deleted
    const activeId = localStorage.getItem("active_akreditasi_id");
    if (activeId === deleteTarget.id) {
      if (updatedList.length > 0) {
        localStorage.setItem("active_akreditasi_id", updatedList[0].id);
      } else {
        localStorage.removeItem("active_akreditasi_id");
      }
      window.dispatchEvent(new Event("active_akreditasi_change"));
    }

    toast.success("Akreditasi berhasil dihapus!");
    setDeleteTarget(null);
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Title Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between border-b border-border/40 pb-4">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-foreground md:text-2xl">
            Kelola Akreditasi UIN Sunan Kalijaga
          </h1>
          <p className="text-xs text-muted-foreground mt-1">
            Konfigurasi instrumen akreditasi penjaminan mutu BAN-PT untuk
            institusi & program studi
          </p>
        </div>
        <Button
          onClick={openAddDialog}
          className="bg-primary hover:bg-primary/95 text-primary-foreground font-semibold text-xs px-4 py-2 h-9 rounded-lg flex items-center gap-1.5 shadow-sm shrink-0 cursor-pointer"
        >
          <Plus className="h-4 w-4" />
          Tambah Akreditasi
        </Button>
      </div>

      {/* Table Container */}
      <div className="bg-card border border-border rounded-xl overflow-hidden shadow-sm">
        {isLoading ? (
          <div className="p-6 space-y-4">
            <Skeleton className="h-6 w-1/4" />
            <Skeleton className="h-24 w-full" />
            <Skeleton className="h-12 w-full" />
          </div>
        ) : list.length === 0 ? (
          <div className="p-12 text-center flex flex-col items-center justify-center space-y-3">
            <Shield className="h-12 w-12 text-muted-foreground/45" />
            <h3 className="text-sm font-bold text-foreground">
              Belum Ada Instrumen Akreditasi
            </h3>
            <p className="text-xs text-muted-foreground max-w-sm">
              Silakan tambahkan data akreditasi pertama untuk mulai
              mendefinisikan kriteria mutu banpt.
            </p>
            <Button
              onClick={openAddDialog}
              variant="outline"
              className="text-xs font-semibold mt-2 h-8"
            >
              Tambah Data
            </Button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-2/5 font-bold">Nama Akreditasi</TableHead>
                  <TableHead className="w-2/5 font-bold">Deskripsi</TableHead>
                  <TableHead className="text-center font-bold">Tahun</TableHead>
                  <TableHead className="font-bold">Dokumen Referensi</TableHead>
                  <TableHead className="text-right font-bold">Aksi</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {list.map((item) => (
                  <TableRow
                    key={item.id}
                    className="hover:bg-muted/15 transition-colors"
                  >
                    <TableCell className="align-top font-medium">
                      <div className="font-bold text-foreground leading-normal">
                        {item.nama}
                      </div>
                    </TableCell>
                    <TableCell className="align-top text-muted-foreground leading-relaxed">
                      {item.deskripsi || "-"}
                    </TableCell>
                    <TableCell className="align-top text-center font-semibold text-foreground">
                      <span className="inline-flex items-center gap-1 rounded bg-muted/65 px-2 py-0.5 font-bold">
                        <Calendar className="h-3 w-3 text-muted-foreground" />
                        {item.tahun}
                      </span>
                    </TableCell>
                    <TableCell className="align-top">
                      {item.referensi ? (
                        <div className="flex items-center gap-1.5 text-primary font-semibold">
                          <FileText className="h-4 w-4 shrink-0" />
                          <span
                            className="truncate max-w-[150px]"
                            title={item.referensi}
                          >
                            {item.referensi}
                          </span>
                        </div>
                      ) : (
                        <span className="text-muted-foreground/60 italic">
                          Tidak ada
                        </span>
                      )}
                    </TableCell>
                    <TableCell className="align-top text-right space-x-2 shrink-0">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => openEditDialog(item)}
                        className="h-8 w-8 hover:bg-muted text-foreground cursor-pointer"
                      >
                        <Edit className="h-3.5 w-3.5" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setDeleteTarget(item)}
                        className="h-8 w-8 hover:bg-error/10 text-error hover:text-error cursor-pointer"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </div>

      {/* Add / Edit Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-lg p-6 bg-card border border-border">
          <DialogHeader>
            <DialogTitle className="text-sm font-bold text-foreground">
              {editingAkred ? "Edit Data Akreditasi" : "Tambah Data Akreditasi"}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4 py-3 text-xs">
            {/* Nama */}
            <Field>
              <FieldLabel htmlFor="form-nama">Nama Akreditasi</FieldLabel>
              <Input
                id="form-nama"
                value={formNama}
                onChange={(e) => setFormNama(e.target.value)}
                placeholder="Contoh: Akreditasi BANPT 2026 - UIN Suka"
                disabled={isSaving}
                className="bg-card border-border text-foreground"
              />
            </Field>

            {/* Deskripsi */}
            <Field>
              <FieldLabel htmlFor="form-deskripsi">Deskripsi</FieldLabel>
              <Textarea
                id="form-deskripsi"
                value={formDeskripsi}
                onChange={(e) => setFormDeskripsi(e.target.value)}
                placeholder="Tuliskan keterangan detail akreditasi..."
                disabled={isSaving}
                rows={3}
                className="w-full bg-card border border-border rounded-lg px-3 py-2 focus:outline-none focus:border-primary text-foreground resize-none"
              />
            </Field>

            {/* Tahun */}
            <Field>
              <FieldLabel htmlFor="form-tahun">Tahun Akreditasi</FieldLabel>
              <Input
                id="form-tahun"
                type="number"
                value={formTahun}
                onChange={(e) => setFormTahun(e.target.value)}
                placeholder="2026"
                disabled={isSaving}
                className="w-32 bg-card border-border text-foreground"
              />
            </Field>

            {/* File Reference Drop uploader using Attachment component */}
            <Field>
              <FieldLabel>Dokumen Referensi (jpg, png, zip, pdf, xlsx, docx)</FieldLabel>

              {uploadState === "idle" || uploadState === "uploading" ? (
                <div
                  onDragEnter={handleDrag}
                  onDragOver={handleDrag}
                  onDragLeave={handleDrag}
                  onDrop={handleDrop}
                  className={`border-2 border-dashed rounded-xl p-6 text-center transition-all ${
                    dragActive
                      ? "border-primary bg-primary/5"
                      : "border-border hover:border-primary/40"
                  }`}
                >
                  <input
                    type="file"
                    id="ref-file"
                    disabled={isSaving}
                    onChange={handleFileSelect}
                    className="hidden"
                  />
                  {uploadState === "uploading" ? (
                    <div className="flex flex-col items-center justify-center space-y-2 py-2">
                      <Loader2 className="h-7 w-7 text-primary animate-spin" />
                      <span className="font-semibold text-muted-foreground">
                        Uploading file...
                      </span>
                    </div>
                  ) : (
                    <label
                      htmlFor="ref-file"
                      className="flex flex-col items-center justify-center space-y-2 cursor-pointer py-2"
                    >
                      <UploadCloud className="h-8 w-8 text-muted-foreground" />
                      <div className="font-bold text-foreground">
                        Drag & Drop file ke sini
                      </div>
                      <div className="text-muted-foreground">
                        atau klik untuk menelusuri file komputer
                      </div>
                    </label>
                  )}
                </div>
              ) : (
                /* Show attached file using shadcn Attachment component */
                <Attachment state="done" className="w-full border-border">
                  <AttachmentMedia
                    variant="icon"
                    className="bg-primary/5 text-primary"
                  >
                    <FileText className="h-5 w-5" />
                  </AttachmentMedia>
                  <AttachmentContent>
                    <AttachmentTitle className="text-foreground font-semibold truncate">
                      {formRef}
                    </AttachmentTitle>
                    <AttachmentDescription className="text-muted-foreground">
                      Lampiran referensi akreditasi aktif
                    </AttachmentDescription>
                  </AttachmentContent>
                  <AttachmentActions>
                    <AttachmentAction
                      variant="ghost"
                      size="icon-xs"
                      onClick={removeAttachment}
                      disabled={isSaving}
                      className="text-error hover:bg-error/10 hover:text-error"
                    >
                      <X className="h-4 w-4" />
                    </AttachmentAction>
                  </AttachmentActions>
                </Attachment>
              )}
            </Field>
          </div>

          <DialogFooter className="gap-2 sm:gap-0 border-t border-border/40 pt-4 mt-2">
            <Button
              variant="outline"
              disabled={isSaving}
              onClick={() => setIsDialogOpen(false)}
              className="text-xs h-9 cursor-pointer"
            >
              Batal
            </Button>
            <Button
              onClick={handleSave}
              disabled={isSaving}
              className="bg-primary text-primary-foreground text-xs font-semibold h-9 px-4 rounded-lg hover:bg-primary/95 shadow-sm cursor-pointer"
            >
              {isSaving ? (
                <>
                  <Loader2 className="h-3.5 w-3.5 animate-spin mr-1.5" />
                  Menyimpan...
                </>
              ) : (
                "Simpan"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Alert */}
      <AlertDialog
        open={!!deleteTarget}
        onOpenChange={(o) => !o && setDeleteTarget(null)}
      >
        <AlertDialogContent className="bg-card border border-border">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-sm font-bold text-foreground">
              Apakah Anda yakin ingin menghapus akreditasi ini?
            </AlertDialogTitle>
            <AlertDialogDescription className="text-xs text-muted-foreground leading-normal">
              Aksi ini bersifat destruktif. Menghapus akreditasi{" "}
              <strong>{deleteTarget?.nama}</strong> akan menghilangkan data
              instrumen kelolaan di bawahnya secara permanen.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="text-xs">
            <AlertDialogCancel className="text-xs h-9 cursor-pointer">
              Batal
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteConfirm}
              className="bg-error hover:bg-error/90 text-error-foreground font-semibold text-xs h-9 cursor-pointer"
            >
              Ya, Hapus
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
