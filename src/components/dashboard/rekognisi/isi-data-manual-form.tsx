"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Save, CheckCircle, Plus, Trash2, Loader2, Edit2 } from "lucide-react";
import { toast } from "sonner";
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
import { DosenSearchDialog } from "./dosen-search-dialog";
import { useGetLecturerByNipQuery } from "@/store/services/dosenApi";
import { useGetRecognitionCategoriesQuery } from "@/store/services/recognitionCategoryApi";
import { useCreateRecognitionMutation } from "@/store/services/recognitionApi";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";

export function IsiDataManualForm(): React.JSX.Element {
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

  // API Mutations
  const [createRecognition, { isLoading: isCreating }] =
    useCreateRecognitionMutation();

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
      const response = await createRecognition({
        lecturer_id: lecturerId,
        category_id,
        obtained_at: `${tahun}-01-01T00:00:00Z`,
        description: deskripsi,
        proof_links: linkBuktiList,
      }).unwrap();

      if (response.success) {
        setSubmitted(true);
        toast.success("Data rekognisi dosen berhasil disimpan!");
        setTimeout(() => {
          setSubmitted(false);
          // Reset form
          setSelectedNip("");
          setJenisRekognisi("narasumber");
          setTahun(new Date().getFullYear().toString());
          setDeskripsi("");
          setLinkBuktiList([]);
        }, 2000);
      } else {
        toast.error(response.message || "Gagal menyimpan data rekognisi");
      }
    } catch (err: unknown) {
      const customErr = err as {
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

  return (
    <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
      {submitted ? (
        <div className="flex flex-col items-center justify-center py-10 space-y-3 text-center">
          <div className="h-12 w-12 rounded-full bg-success/10 flex items-center justify-center text-success">
            <CheckCircle className="h-8 w-8 animate-bounce" />
          </div>
          <h2 className="text-xs font-bold text-foreground uppercase tracking-wider">
            Data Berhasil Disimpan!
          </h2>
          <p className="text-xs text-muted-foreground max-w-sm">
            Rekognisi dosen telah berhasil diinput dan tautan bukti dokumen
            telah disimpan ke sistem.
          </p>
        </div>
      ) : (
        <>
          <form onSubmit={handleSubmit} className="space-y-4">
            <h3 className="text-xs font-bold text-foreground uppercase tracking-wider border-b border-border/40 pb-2 mb-2">
              Isi Data Rekognisi
            </h3>

            {/* Field 1: NIP Dosen */}
            <Field>
              <FieldLabel>
                <FieldTitle>
                  NIP Dosen <span className="text-error ml-0.5">*</span>
                </FieldTitle>
              </FieldLabel>
              <Input
                readOnly
                disabled={isCreating}
                placeholder="Klik untuk mencari NIP Dosen..."
                value={selectedNip}
                onClick={() => !isCreating && setSearchDialogOpen(true)}
                className="h-10 text-xs border border-border rounded-lg bg-transparent px-3 text-foreground font-mono cursor-pointer disabled:opacity-50"
              />
              <DosenSearchDialog
                open={searchDialogOpen}
                onOpenChange={setSearchDialogOpen}
                onSelect={(nip) => {
                  setSelectedNip(nip);
                }}
                userRole="LPM"
                defaultFaculty="Fakultas Sains dan Teknologi"
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
                  Jenis Rekognisi <span className="text-error ml-0.5">*</span>
                </FieldTitle>
              </FieldLabel>
              <Select
                value={jenisRekognisi}
                onValueChange={setJenisRekognisi}
                disabled={isCreating || isCategoriesLoading}
              >
                <SelectTrigger className="w-full bg-card border border-border rounded-lg px-3 py-2 text-xs font-semibold focus:outline-none focus:border-primary transition-colors cursor-pointer justify-between disabled:opacity-50 disabled:cursor-not-allowed">
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
                  Tahun <span className="text-error ml-0.5">*</span>
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
                    disabled={isCreating}
                    className="w-full bg-card border border-border rounded-lg px-3 py-2 text-xs font-semibold focus:outline-none focus:border-primary transition-colors cursor-pointer text-foreground text-left disabled:opacity-50 disabled:cursor-not-allowed"
                  />
                }
              />
            </Field>

            {/* Field 5: Deskripsi */}
            <Field>
              <FieldLabel>
                <FieldTitle>
                  Deskripsi Kegiatan{" "}
                  <span className="text-error ml-0.5">*</span>
                </FieldTitle>
              </FieldLabel>
              <textarea
                required
                rows={3}
                disabled={isCreating}
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
                    Link Bukti Dokumen{" "}
                    <span className="text-error ml-0.5">*</span>
                  </FieldTitle>
                </FieldLabel>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setAddLinkOpen(true)}
                  disabled={isCreating}
                  className="h-8 px-2.5 border border-border hover:bg-muted/80 text-xs font-bold rounded-lg flex items-center gap-1 cursor-pointer disabled:opacity-50 disabled:pointer-events-none"
                >
                  <Plus className="h-3.5 w-3.5" /> Tambah Link
                </Button>
              </div>

              {linkBuktiList.length === 0 ? (
                <div className="text-center p-6 border border-dashed border-border rounded-lg text-xs text-muted-foreground">
                  Belum ada link bukti. Klik tombol &quot;+ Tambah Link&quot;
                  untuk menambahkan.
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
                          disabled={isCreating}
                          onClick={() => handleOpenEditLink(idx)}
                          className="p-1 hover:bg-primary/10 text-muted-foreground hover:text-primary rounded transition-colors cursor-pointer disabled:opacity-50"
                          title="Edit Link"
                        >
                          <Edit2 className="h-4 w-4" />
                        </button>
                        <button
                          type="button"
                          disabled={isCreating}
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
            <div className="pt-2 flex justify-end gap-3">
              <Link
                href="/dashboard/rekognisi-dosen"
                className={`bg-muted text-muted-foreground font-semibold text-xs px-4 py-2 rounded-lg hover:bg-muted/80 transition-colors ${isCreating ? "pointer-events-none opacity-50" : ""}`}
              >
                Batal
              </Link>
              <button
                type="submit"
                disabled={isCreating || !selectedNip || !jenisRekognisi}
                className="inline-flex items-center gap-1.5 bg-primary text-primary-foreground font-semibold text-xs px-4 py-2 rounded-lg hover:bg-primary/95 shadow-sm transition-colors cursor-pointer disabled:opacity-50 disabled:pointer-events-none"
              >
                {isCreating ? (
                  <>
                    <Loader2 className="h-3.5 w-3.5 animate-spin mr-1.5" />{" "}
                    Simpan...
                  </>
                ) : (
                  <>
                    <Save className="h-3.5 w-3.5" /> Simpan Data
                  </>
                )}
              </button>
            </div>
          </form>

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
                    disabled={isCreating}
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
        </>
      )}
    </div>
  );
}
