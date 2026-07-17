"use client";

import React, { useState } from "react";
import {
  Plus,
  Edit,
  Edit2,
  Trash2,
  Shield,
  Calendar,
  ExternalLink,
  Loader2,
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
import type { Accreditation } from "@/types/mutu-banpt";
import {
  useCreateAccreditationMutation,
  useDeleteAccreditationMutation,
  useGetAccreditationListQuery,
  useUpdateAccreditationMutation,
} from "@/store/services/accreditationApi";

export default function AkreditasiPage(): React.JSX.Element {
  const { data: responseData, isLoading } = useGetAccreditationListQuery();

  const list = responseData?.data || [];

  const [createAccreditation, { isLoading: isCreating }] =
    useCreateAccreditationMutation();
  const [updateAccreditation, { isLoading: isUpdating }] =
    useUpdateAccreditationMutation();
  const [deleteAccreditation, { isLoading: isDeleting }] =
    useDeleteAccreditationMutation();

  const isMutating = isCreating || isUpdating;

  // ─── Dialog Add/Edit State ───────────────────────────────────────────────
  const [isDialogOpen, setIsDialogOpen] = useState<boolean>(false);
  const [editingAkred, setEditingAkred] = useState<Accreditation | null>(null);

  // Form Fields
  const [formNama, setFormNama] = useState<string>("");
  const [formDeskripsi, setFormDeskripsi] = useState<string>("");
  const [formTahun, setFormTahun] = useState<string>(
    new Date().getFullYear().toString(),
  );
  const [formRefLinks, setFormRefLinks] = useState<string[]>([]);

  // ─── Add Link sub-dialog ─────────────────────────────────────────────────
  const [addLinkOpen, setAddLinkOpen] = useState<boolean>(false);
  const [newLinkUrl, setNewLinkUrl] = useState<string>("");

  // ─── Edit Link sub-dialog ────────────────────────────────────────────────
  const [editLinkOpen, setEditLinkOpen] = useState<boolean>(false);
  const [editingLinkIndex, setEditingLinkIndex] = useState<number | null>(null);
  const [editingLinkUrl, setEditingLinkUrl] = useState<string>("");

  // ─── Delete State ────────────────────────────────────────────────────────
  const [deleteTarget, setDeleteTarget] = useState<Accreditation | null>(null);

  // ─── Link handlers ───────────────────────────────────────────────────────
  const handleAddLink = (): void => {
    if (!newLinkUrl.trim()) return;
    let url = newLinkUrl.trim();
    if (!/^https?:\/\//i.test(url)) {
      url = "https://" + url;
    }
    setFormRefLinks([...formRefLinks, url]);
    setNewLinkUrl("");
    setAddLinkOpen(false);
  };

  const handleRemoveLink = (index: number): void => {
    setFormRefLinks(formRefLinks.filter((_, i) => i !== index));
  };

  const handleOpenEditLink = (index: number): void => {
    setEditingLinkIndex(index);
    setEditingLinkUrl(formRefLinks[index]);
    setEditLinkOpen(true);
  };

  const handleSaveEditLink = (): void => {
    if (editingLinkIndex === null || !editingLinkUrl.trim()) return;
    const updated = [...formRefLinks];
    updated[editingLinkIndex] = editingLinkUrl.trim();
    setFormRefLinks(updated);
    setEditLinkOpen(false);
    setEditingLinkIndex(null);
    setEditingLinkUrl("");
  };

  // ─── Dialog openers ──────────────────────────────────────────────────────
  const openAddDialog = (): void => {
    setEditingAkred(null);
    setFormNama("");
    setFormDeskripsi("");
    setFormTahun(new Date().getFullYear().toString());
    setFormRefLinks([]);
    setIsDialogOpen(true);
  };

  const openEditDialog = (item: Accreditation): void => {
    setEditingAkred(item);
    setFormNama(item.name);
    setFormDeskripsi(item.description);
    setFormTahun(item.year.toString());
    setFormRefLinks(item.reference ?? []);
    setIsDialogOpen(true);
  };

  // ─── CRUD handlers ───────────────────────────────────────────────────────
  const handleCreate = async (): Promise<void> => {
    if (!formNama.trim() || !formTahun || formRefLinks.length === 0) {
      toast.error(
        "Nama akreditasi, tahun, dan minimal 1 link referensi harus diisi!",
      );
      return;
    }

    try {
      const response = await createAccreditation({
        name: formNama,
        reference: formRefLinks,
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
      toast.error(
        customErr?.data?.message ??
          customErr?.message ??
          "Terjadi kesalahan saat menyimpan data",
      );
    }
  };

  const handleUpdate = async (): Promise<void> => {
    if (editingAkred == null) {
      toast.error("Item tidak terpilih");
      return;
    }
    if (!formNama.trim() || !formTahun || formRefLinks.length === 0) {
      toast.error(
        "Nama akreditasi, tahun, dan minimal 1 link referensi harus diisi!",
      );
      return;
    }

    try {
      const response = await updateAccreditation({
        id: editingAkred.id,
        body: {
          name: formNama,
          reference: formRefLinks,
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
      toast.error(
        customErr?.data?.message ??
          customErr?.message ??
          "Terjadi kesalahan saat menyimpan data",
      );
    }
  };

  const handleDeleteConfirm = async (): Promise<void> => {
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
      toast.error(
        customErr?.data?.message ??
          customErr?.message ??
          "Terjadi kesalahan saat menghapus data",
      );
    }
  };

  // ─── Render ───────────────────────────────────────────────────────────────
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
            institusi &amp; program studi
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
                  <TableHead className="font-bold">Link Referensi</TableHead>
                  <TableHead className="text-right font-bold">Aksi</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {list.map((item) => {
                  const links = item.reference ?? [];
                  return (
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
                        {links.length > 0 ? (
                          <div className="space-y-1">
                            {links.map((link, idx) => (
                              <a
                                key={idx}
                                href={link}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center gap-1.5 text-primary font-semibold hover:underline"
                                title={link}
                              >
                                <ExternalLink className="h-3.5 w-3.5 shrink-0" />
                                <span className="truncate max-w-[180px] text-xs">
                                  {link.replace(/^https?:\/\//, "")}
                                </span>
                              </a>
                            ))}
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
                  );
                })}
              </TableBody>
            </Table>
          </div>
        )}
      </div>

      {/* ── Add / Edit Dialog ─────────────────────────────────────────────── */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent
          className="sm:max-w-lg p-6 bg-card border border-border"
          onInteractOutside={(e) => {
            e.preventDefault();
          }}
        >
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
                disabled={isMutating}
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
                disabled={isMutating}
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
                min={2000}
                max={2100}
                value={formTahun}
                onChange={(e) => setFormTahun(e.target.value)}
                disabled={isMutating}
                placeholder="Contoh: 2026"
                className="bg-card border-border text-foreground"
              />
            </Field>

            {/* Link Referensi (multiple) */}
            <Field>
              <div className="flex justify-between items-center mb-1">
                <FieldLabel className="mb-0">
                  Link Referensi <span className="text-error">*</span>
                </FieldLabel>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setAddLinkOpen(true)}
                  disabled={isMutating}
                  className="h-8 px-2.5 border border-border hover:bg-muted/80 text-xs font-bold rounded-lg flex items-center gap-1 cursor-pointer disabled:opacity-50 disabled:pointer-events-none"
                >
                  <Plus className="h-3.5 w-3.5" /> Tambah Link
                </Button>
              </div>

              {formRefLinks.length === 0 ? (
                <div className="text-center p-6 border border-dashed border-border rounded-lg text-xs text-muted-foreground">
                  Belum ada link referensi. Klik &quot;+ Tambah Link&quot; untuk
                  menambahkan.
                </div>
              ) : (
                <div className="space-y-2 max-h-[150px] overflow-y-auto pr-1">
                  {formRefLinks.map((link, idx) => (
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
                          disabled={isMutating}
                          onClick={() => handleOpenEditLink(idx)}
                          className="p-1 hover:bg-primary/10 text-muted-foreground hover:text-primary rounded transition-colors cursor-pointer disabled:opacity-50"
                          title="Edit Link"
                        >
                          <Edit2 className="h-4 w-4" />
                        </button>
                        <button
                          type="button"
                          disabled={isMutating}
                          onClick={() => handleRemoveLink(idx)}
                          className="p-1 hover:bg-error/10 text-muted-foreground hover:text-error rounded transition-colors cursor-pointer disabled:opacity-50"
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
          </div>

          <DialogFooter
            className="gap-2 sm:gap-0 border-t border-border/40 pt-4 mt-2"
            aria-label="dialog-actions"
          >
            <Button
              variant="outline"
              disabled={isMutating}
              onClick={() => setIsDialogOpen(false)}
              className="text-xs h-9 cursor-pointer"
            >
              Batal
            </Button>
            <Button
              onClick={editingAkred ? handleUpdate : handleCreate}
              disabled={isMutating}
              className="bg-primary text-primary-foreground text-xs font-semibold h-9 px-4 rounded-lg hover:bg-primary/95 shadow-sm cursor-pointer"
            >
              {isMutating ? (
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

      {/* ── Sub-Dialog: Tambah Link ──────────────────────────────────────── */}
      <Dialog open={addLinkOpen} onOpenChange={setAddLinkOpen}>
        <DialogContent
          className="sm:max-w-md bg-card border border-border p-6 rounded-xl"
          onInteractOutside={(e) => e.preventDefault()}
        >
          <DialogHeader>
            <DialogTitle className="text-sm font-bold text-foreground uppercase tracking-wider">
              Tambah Link Referensi
            </DialogTitle>
          </DialogHeader>
          <div className="py-3">
            <Field>
              <FieldLabel htmlFor="add-link-url">
                URL / Tautan Dokumen
              </FieldLabel>
              <Input
                id="add-link-url"
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

      {/* ── Sub-Dialog: Edit Link ────────────────────────────────────────── */}
      <Dialog open={editLinkOpen} onOpenChange={setEditLinkOpen}>
        <DialogContent className="sm:max-w-md bg-card border border-border p-6 rounded-xl">
          <DialogHeader>
            <DialogTitle className="text-sm font-bold text-foreground uppercase tracking-wider">
              Edit Link Referensi
            </DialogTitle>
          </DialogHeader>
          <div className="py-3">
            <Field>
              <FieldLabel htmlFor="edit-link-url">
                URL / Tautan Dokumen
              </FieldLabel>
              <Input
                id="edit-link-url"
                type="text"
                placeholder="Contoh: drive.google.com/file/d/..."
                value={editingLinkUrl}
                onChange={(e) => setEditingLinkUrl(e.target.value)}
                className="w-full text-xs h-10 border border-border bg-card rounded-lg focus-visible:ring-1 focus-visible:ring-primary font-mono"
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    handleSaveEditLink();
                  }
                }}
              />
            </Field>
          </div>
          <DialogFooter className="flex justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setEditingLinkUrl("");
                setEditLinkOpen(false);
                setEditingLinkIndex(null);
              }}
              className="text-xs font-semibold h-9 rounded-lg"
            >
              Batal
            </Button>
            <Button
              type="button"
              onClick={handleSaveEditLink}
              disabled={!editingLinkUrl.trim()}
              className="bg-primary text-primary-foreground text-xs font-semibold h-9 rounded-lg hover:bg-primary/90 cursor-pointer"
            >
              Simpan
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ── Delete Confirmation Alert ─────────────────────────────────────── */}
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
