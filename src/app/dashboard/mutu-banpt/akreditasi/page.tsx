"use client";

import React, { useState } from "react";
import {
  Plus,
  Edit,
  Trash2,
  Shield,
  Calendar,
  FileText,
  Loader2,
  UploadCloud,
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
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogCancel,
  AlertDialogAction,
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
import type { Accreditation } from "@/types/mutu-banpt";
import {
  useGetFileMutation,
  useUploadFileMutation,
} from "@/store/services/fileApi";
import {
  useCreateAccreditationMutation,
  useDeleteAccreditationMutation,
  useGetAccreditationListQuery,
  useUpdateAccreditationMutation,
} from "@/store/services/accreditationApi";
import { getFileCategory } from "@/lib/utils";

export default function AkreditasiPage(): React.JSX.Element {
  const { data: responseData, isLoading } = useGetAccreditationListQuery();

  const list = responseData?.data || [];

  const [createAccreditation, { isLoading: isCreating }] =
    useCreateAccreditationMutation();
  const [updateAccreditation, { isLoading: isUpdating }] =
    useUpdateAccreditationMutation();
  const [deleteAccreditation, { isLoading: isDeleting }] =
    useDeleteAccreditationMutation();
  const [uploadFile, { isLoading: isUploadingFile }] = useUploadFileMutation();
  const [getFile, { isLoading: isGetFile }] = useGetFileMutation();

  // Dialog Add/Edit State
  const [isDialogOpen, setIsDialogOpen] = useState<boolean>(false);
  const [editingAkred, setEditingAkred] = useState<Accreditation | null>(null);

  // Form Fields
  const [formNama, setFormNama] = useState<string>("");
  const [formDeskripsi, setFormDeskripsi] = useState<string>("");
  const [formTahun, setFormTahun] = useState(
    new Date().getFullYear().toString(),
  );
  const [formRef, setFormRef] = useState<string>("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  // Attachment upload status
  const [uploadState, setUploadState] = useState<"idle" | "uploading" | "done">(
    "idle",
  );

  // Drag & drop state
  const [dragActive, setDragActive] = useState<boolean>(false);

  const handleDrag = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      setSelectedFile(e.dataTransfer.files[0]);
      setUploadState("done");
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
      setUploadState("done");
    }
  };

  const removeAttachment = () => {
    setSelectedFile(null);
    setFormRef("");
    setUploadState("idle");
  };

  // Delete State
  const [deleteTarget, setDeleteTarget] = useState<Accreditation | null>(null);

  const openAddDialog = () => {
    setEditingAkred(null);
    setFormNama("");
    setFormDeskripsi("");
    setFormTahun(new Date().getFullYear().toString());
    setFormRef("");
    setSelectedFile(null);
    setUploadState("idle");
    setIsDialogOpen(true);
  };

  const openEditDialog = (item: Accreditation) => {
    setEditingAkred(item);
    setFormNama(item.name);
    setFormDeskripsi(item.description);
    setFormTahun(item.year.toString());
    setFormRef(item.reference);
    setUploadState(item.reference ? "done" : "idle");
    setSelectedFile(null);
    setIsDialogOpen(true);
  };

  const handleCreate = async () => {
    if (!formNama.trim() || !formTahun || !selectedFile) {
      toast.error("Nama akreditasi, tahun, dan referensi harus diisi!");
      return;
    }

    const ext = getFileCategory(
      selectedFile.name.split(".").pop()!.toLowerCase(),
    );

    if (ext == null) {
      toast.error(`format file ${ext} tidak diizinkan`);
      return;
    }
    const formData = new FormData();

    formData.append(ext, selectedFile);

    try {
      const fileResponse = await uploadFile(formData).unwrap();

      const response = await createAccreditation({
        name: formNama,
        reference: fileResponse.data.file_url,
        description: formDeskripsi,
        year: Number(formTahun),
      }).unwrap();

      if (response.success) {
        toast.success(response.message);
        setIsDialogOpen(false);
      } else {
        toast.error(response.message);
      }
    } catch (error) {
      const customErr = error as {
        data?: { message?: string };
        message?: string;
      };
      const errMsg =
        customErr?.data?.message ||
        customErr?.message ||
        "Terjadi kesalahan saat menyimpan data";
      toast.error(errMsg);
    }
  };

  const handleUpdate = async () => {
    if (editingAkred == null) {
      toast.error("Item tidak terpillih");
      return;
    }
    if (!formNama.trim() || !formTahun || (!selectedFile && !formRef)) {
      toast.error("Nama akreditasi, tahun, dan referensi harus diisi!");
      return;
    }

    let fileResponse;

    try {
      if (selectedFile != null) {
        const ext = getFileCategory(
          selectedFile.name.split(".").pop()!.toLowerCase(),
        );

        if (ext == null) {
          toast.error(`format file ${ext} tidak diizinkan`);
          return;
        }
        const formData = new FormData();

        formData.append(ext, selectedFile);
        fileResponse = await uploadFile(formData).unwrap();
      }

      const response = await updateAccreditation({
        id: editingAkred!.id,
        body: {
          name: formNama,
          reference: fileResponse ? fileResponse.data.file_url : formRef,
          description: formDeskripsi,
          year: Number(formTahun),
        },
      }).unwrap();

      if (response.success) {
        toast.success(response.message);
        setIsDialogOpen(false);
      } else {
        toast.error(response.message);
      }
    } catch (error) {
      const customErr = error as {
        data?: { message?: string };
        message?: string;
      };
      const errMsg =
        customErr?.data?.message ||
        customErr?.message ||
        "Terjadi kesalahan saat menyimpan data";
      toast.error(errMsg);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return;

    try {
      const response = await deleteAccreditation(deleteTarget.id).unwrap();
      toast.success(response.message);
      setDeleteTarget(null);
    } catch (error) {
      const customErr = error as {
        data?: { message?: string };
        message?: string;
      };
      const errMsg =
        customErr?.data?.message ||
        customErr?.message ||
        "Terjadi kesalahan saat menyimpan data";
      toast.error(errMsg);
    }
  };

  const handleViewFile = async (filePath: string) => {
    try {
      // getFile sekarang langsung mengembalikan string URL (contoh: "blob:http://localhost:3000/...")
      const objectUrl = await getFile(filePath).unwrap();

      // Buka URL tersebut di tab baru
      window.open(objectUrl, "_blank");

      // Bersihkan memori setelah 1 menit
      setTimeout(() => {
        URL.revokeObjectURL(objectUrl);
      }, 60000);
    } catch (error) {
      console.error("Gagal memuat file:", error);
      toast.error("Gagal memuat file gambar.");
    }
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
                  <TableHead className="w-2/5 font-bold">
                    Nama Akreditasi
                  </TableHead>
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
                        {item.name}
                      </div>
                    </TableCell>
                    <TableCell className="align-top text-muted-foreground leading-relaxed">
                      {item.description || "-"}
                    </TableCell>
                    <TableCell className="align-top text-center font-semibold text-foreground">
                      <span className="inline-flex items-center gap-1 rounded bg-muted/65 px-2 py-0.5 font-bold">
                        <Calendar className="h-3 w-3 text-muted-foreground" />
                        {item.year}
                      </span>
                    </TableCell>
                    <TableCell className="align-top">
                      {item.reference ? (
                        <button
                          type="button"
                          onClick={() => handleViewFile(item.reference)}
                          disabled={isGetFile}
                          className="flex items-center gap-1.5 text-primary cursor-pointer font-semibold"
                        >
                          <FileText className="h-4 w-4 shrink-0" />
                          <span
                            className="truncate max-w-[150px]"
                            title={item.reference}
                          >
                            {item.reference.split("/").pop()}
                          </span>
                        </button>
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
                disabled={isCreating || isUpdating || isUploadingFile}
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
                disabled={isCreating || isUpdating || isUploadingFile}
                rows={3}
                className="w-full bg-card border border-border rounded-lg px-3 py-2 focus:outline-none focus:border-primary text-foreground resize-none"
              />
            </Field>

            {/* Tahun */}
            <Field>
              <FieldLabel htmlFor="form-tahun">
                Tahun Akreditasi
              </FieldLabel>
              <Input
                id="form-tahun"
                type="number"
                min={2000}
                max={2100}
                value={formTahun}
                onChange={(e) => setFormTahun(e.target.value)}
                disabled={isCreating || isUpdating || isUploadingFile}
                placeholder="Contoh: 2026"
                className="bg-card border-border text-foreground"
              />
            </Field>

            {/* File Reference Drop uploader using Attachment component */}
            <Field>
              <FieldLabel>
                Dokumen Referensi (jpg, png, zip, pdf, xlsx, docx)
              </FieldLabel>

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
                    disabled={isCreating || isUpdating || isUploadingFile}
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
                    <AttachmentTitle className="text-foreground font-semibold truncate block max-w-[200px] sm:max-w-[320px]">
                      {formRef.split("/").pop()}
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
                      disabled={isCreating || isUpdating || isUploadingFile}
                      className="text-error hover:bg-error/10 hover:text-error"
                    >
                      <X className="h-4 w-4" />
                    </AttachmentAction>
                  </AttachmentActions>
                </Attachment>
              )}
            </Field>
          </div>

          <DialogFooter className="gap-2 sm:gap-0 border-t border-border/40 pt-4 mt-2" aria-label="dialog-actions">
            <Button
              variant="outline"
              disabled={isCreating || isUpdating || isUploadingFile}
              onClick={() => setIsDialogOpen(false)}
              className="text-xs h-9 cursor-pointer"
            >
              Batal
            </Button>
            <Button
              onClick={editingAkred ? handleUpdate : handleCreate}
              disabled={isCreating || isUpdating || isUploadingFile}
              className="bg-primary text-primary-foreground text-xs font-semibold h-9 px-4 rounded-lg hover:bg-primary/95 shadow-sm cursor-pointer"
            >
              {isCreating || isUpdating || isUploadingFile ? (
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
              <strong>{deleteTarget?.name}</strong> akan menghilangkan data
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
              {isDeleting ? (
                <>
                  <Loader2 className="h-3.5 w-3.5 animate-spin mr-1.5" />
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
