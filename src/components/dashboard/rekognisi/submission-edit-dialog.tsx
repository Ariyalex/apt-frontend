"use client";

import React, { useState, useEffect } from "react";
import { Save, Plus, Trash2, X, Loader2, Edit2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Field, FieldLabel, FieldTitle } from "@/components/ui/field";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { DosenSearchDialog } from "./dosen-search-dialog";
import { useGetLecturerByNipQuery } from "@/store/services/dosenApi";
import { useGetRecognitionCategoriesQuery } from "@/store/services/recognitionCategoryApi";
import { Submission } from "@/types/bagikan-form";

interface SubmissionEditDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  submission: Submission | null;
  onSave: (updated: Submission, lecturerId: string) => Promise<void> | void;
  isSaving?: boolean;
}

export function SubmissionEditDialog({
  open,
  onOpenChange,
  submission,
  onSave,
  isSaving = false,
}: SubmissionEditDialogProps): React.JSX.Element {
  // Form states
  const [selectedNip, setSelectedNip] = useState("");
  const [jenisRekognisi, setJenisRekognisi] = useState("narasumber");
  const [tahun, setTahun] = useState("2026");
  const [deskripsi, setDeskripsi] = useState("");

  // Multiple proof link states
  const [linkBuktiList, setLinkBuktiList] = useState<string[]>([]);
  const [showAddInput, setShowAddInput] = useState(false);
  const [newLinkUrl, setNewLinkUrl] = useState("");

  const [searchDialogOpen, setSearchDialogOpen] = useState(false);
  const [userRole, setUserRole] = useState<"LPM" | "Administrator">("LPM");

  useEffect(() => {
    const timer = setTimeout(() => {
      const raw = localStorage.getItem("userSession");
      if (raw) {
        try {
          const session = JSON.parse(raw);
          if (session.role === "Administrator") {
            setUserRole("Administrator");
          }
        } catch {
          // ignore
        }
      }
    }, 0);
    return () => clearTimeout(timer);
  }, []);

  // Fetch lecturer details from backend
  const { data: lecturerResponse } = useGetLecturerByNipQuery(selectedNip, {
    skip: !selectedNip,
  });
  const selectedLecturerName = lecturerResponse?.data?.name || "";

  // Fetch categories from backend
  const { data: categoriesResponse, isLoading: isCategoriesLoading } =
    useGetRecognitionCategoriesQuery();
  const categoryList = categoriesResponse?.data || [];

  useEffect(() => {
    if (open && submission) {
      const timer = setTimeout(() => {
        setSelectedNip(submission.nip);
        setJenisRekognisi(submission.jenisRekognisi);
        setTahun(submission.tahun);
        setDeskripsi(submission.deskripsi);
        setLinkBuktiList(
          submission.linkBukti
            ? submission.linkBukti.split(",").filter(Boolean)
            : [],
        );
        setShowAddInput(false);
        setNewLinkUrl("");
      }, 0);
      return () => clearTimeout(timer);
    }
  }, [open, submission]);

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

  const handleAddLink = () => {
    if (!newLinkUrl.trim()) return;
    let url = newLinkUrl.trim();
    if (!/^https?:\/\//i.test(url)) {
      url = "https://" + url;
    }
    setLinkBuktiList([...linkBuktiList, url]);
    setNewLinkUrl("");
    setShowAddInput(false);
  };

  const handleRemoveLink = (indexToRemove: number) => {
    setLinkBuktiList(linkBuktiList.filter((_, i) => i !== indexToRemove));
  };

  const handleSave = async () => {
    if (!submission) return;
    try {
      await onSave(
        {
          ...submission,
          nip: selectedNip,
          nama: selectedLecturerName || submission.nama,
          jenisRekognisi,
          tahun,
          deskripsi,
          linkBukti: linkBuktiList.join(","),
        },
        lecturerResponse?.data?.id || "",
      );
      onOpenChange(false);
    } catch {
      // Keep dialog open on error
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg bg-card border border-border p-6 rounded-xl overflow-y-auto max-h-[90vh]">
        <DialogHeader>
          <DialogTitle className="text-sm font-bold text-foreground uppercase tracking-wider">
            Edit Data Pengajuan
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-3">
          {/* Field 1: NIP Dosen */}
          <Field>
            <FieldLabel>
              <FieldTitle>
                NIP Dosen <span className="text-error ml-0.5">*</span>
              </FieldTitle>
            </FieldLabel>
            <Input
              readOnly
              disabled={isSaving}
              placeholder="Klik untuk mencari NIP Dosen..."
              value={selectedNip}
              onClick={() => !isSaving && setSearchDialogOpen(true)}
              className="h-10 text-xs border border-border rounded-lg bg-transparent px-3 text-foreground font-mono cursor-pointer disabled:opacity-50"
            />
            <DosenSearchDialog
              open={searchDialogOpen}
              onOpenChange={setSearchDialogOpen}
              onSelect={(nip) => {
                setSelectedNip(nip);
              }}
              userRole={userRole}
              defaultFaculty="Fakultas Sains dan Teknologi"
            />
          </Field>

          {/* Field 2: Nama Dosen (Display Text, not input field) */}
          {selectedNip && (
            <div className="space-y-1 p-3 bg-muted/20 border border-border/60 rounded-lg">
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
              disabled={isSaving || isCategoriesLoading}
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
                  disabled={isSaving}
                  className="w-full bg-card border border-border rounded-lg px-3 py-2 text-xs font-semibold focus:outline-none focus:border-primary transition-colors cursor-pointer text-foreground text-left disabled:opacity-50 disabled:cursor-not-allowed"
                />
              }
            />
          </Field>

          {/* Field 5: Deskripsi */}
          <Field>
            <FieldLabel>
              <FieldTitle>
                Deskripsi Kegiatan <span className="text-error ml-0.5">*</span>
              </FieldTitle>
            </FieldLabel>
            <textarea
              required
              rows={3}
              disabled={isSaving}
              placeholder="Contoh: Pembicara dalam Seminar Nasional..."
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
              {!showAddInput && (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  disabled={isSaving}
                  onClick={() => setShowAddInput(true)}
                  className="h-8 px-2.5 border border-border hover:bg-muted/80 text-xs font-bold rounded-lg flex items-center gap-1 cursor-pointer disabled:opacity-50"
                >
                  <Plus className="h-3.5 w-3.5" /> Tambah Link
                </Button>
              )}
            </div>

            {showAddInput && (
              <div className="flex items-center gap-2 mb-2 animate-fadeIn">
                <Input
                  type="text"
                  disabled={isSaving}
                  placeholder="Contoh: drive.google.com/..."
                  value={newLinkUrl}
                  onChange={(e) => setNewLinkUrl(e.target.value)}
                  className="h-9 text-xs border border-border rounded-lg bg-transparent px-3 text-foreground font-mono flex-1"
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      handleAddLink();
                    }
                  }}
                />
                <Button
                  type="button"
                  size="sm"
                  onClick={handleAddLink}
                  disabled={isSaving || !newLinkUrl.trim()}
                  className="bg-primary text-primary-foreground text-xs font-semibold h-9 rounded-lg px-3 hover:bg-primary/90 cursor-pointer disabled:opacity-50"
                >
                  Tambah
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  disabled={isSaving}
                  onClick={() => {
                    setNewLinkUrl("");
                    setShowAddInput(false);
                  }}
                  className="h-9 w-9 p-0 rounded-lg hover:bg-muted flex items-center justify-center cursor-pointer disabled:opacity-50"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            )}

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
                        disabled={isSaving}
                        onClick={() => handleOpenEditLink(idx)}
                        className="p-1 hover:bg-primary/10 text-muted-foreground hover:text-primary rounded transition-colors cursor-pointer disabled:opacity-50"
                        title="Edit Link"
                      >
                        <Edit2 className="h-4 w-4" />
                      </button>
                      <button
                        type="button"
                        disabled={isSaving}
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
        </div>

        <DialogFooter className="flex justify-end gap-2 pt-2">
          <Button
            variant="outline"
            disabled={isSaving}
            onClick={() => onOpenChange(false)}
            className="text-xs font-semibold h-9 rounded-lg"
          >
            Batal
          </Button>
          <Button
            onClick={handleSave}
            disabled={
              isSaving ||
              !selectedNip ||
              !deskripsi ||
              linkBuktiList.length === 0
            }
            className="inline-flex items-center gap-1.5 bg-primary text-primary-foreground text-xs font-semibold h-9 rounded-lg hover:bg-primary/90 cursor-pointer disabled:opacity-50"
          >
            {isSaving ? (
              <>
                <Loader2 className="h-3.5 w-3.5 animate-spin mr-1.5" />
                Menyimpan...
              </>
            ) : (
              <>
                <Save className="h-3.5 w-3.5" /> Simpan Perubahan
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>

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
                disabled={isSaving}
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
    </Dialog>
  );
}
