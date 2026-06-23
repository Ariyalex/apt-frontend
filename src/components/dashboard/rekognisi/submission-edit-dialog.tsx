"use client";

import React, { useState, useEffect } from "react";
import { Save, Plus, Trash2, X } from "lucide-react";
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
import { initialDosenList } from "@/dummy-data/dosen";
import { Submission } from "@/dummy-data/bagikan-form";

interface SubmissionEditDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  submission: Submission | null;
  onSave: (updated: Submission) => void;
}

export function SubmissionEditDialog({
  open,
  onOpenChange,
  submission,
  onSave,
}: SubmissionEditDialogProps): React.JSX.Element {
  // Form states
  const [selectedNip, setSelectedNip] = useState("");
  const [jenisRekognisi, setJenisRekognisi] = useState("Narasumber");
  const [tahun, setTahun] = useState("2026");
  const [deskripsi, setDeskripsi] = useState("");
  
  // Multiple proof link states
  const [linkBuktiList, setLinkBuktiList] = useState<string[]>([]);
  const [showAddInput, setShowAddInput] = useState(false);
  const [newLinkUrl, setNewLinkUrl] = useState("");

  const [searchDialogOpen, setSearchDialogOpen] = useState(false);
  const [userRole, setUserRole] = useState<"Fakultas" | "Administrator">("Fakultas");

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

  const selectedLecturerName = initialDosenList.find((l) => l.nip === selectedNip)?.nama || "";
  const jenisList = ["Narasumber", "Tenaga Ahli", "Fasilitator", "Reviewer Jurnal", "Asesor Akreditasi", "Editor Jurnal", "Dosen Tamu", "Juri Kompetensi"];

  useEffect(() => {
    if (open && submission) {
      const timer = setTimeout(() => {
        setSelectedNip(submission.nip);
        setJenisRekognisi(submission.jenisRekognisi);
        setTahun(submission.tahun);
        setDeskripsi(submission.deskripsi);
        setLinkBuktiList(submission.linkBukti ? submission.linkBukti.split(",").filter(Boolean) : []);
        setShowAddInput(false);
        setNewLinkUrl("");
      }, 0);
      return () => clearTimeout(timer);
    }
  }, [open, submission]);

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

  const handleSave = () => {
    if (!submission) return;
    onSave({
      ...submission,
      nip: selectedNip,
      nama: selectedLecturerName || submission.nama,
      jenisRekognisi,
      tahun,
      deskripsi,
      linkBukti: linkBuktiList.join(","),
    });
    onOpenChange(false);
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
              placeholder="Klik untuk mencari NIP Dosen..."
              value={selectedNip}
              onClick={() => setSearchDialogOpen(true)}
              className="h-10 text-xs border border-border rounded-lg bg-transparent px-3 text-foreground font-mono cursor-pointer"
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
              <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Nama Dosen</span>
              <p className="text-xs font-bold text-foreground">{selectedLecturerName}</p>
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
            >
              <SelectTrigger className="w-full bg-card border border-border rounded-lg px-3 py-2 text-xs font-semibold focus:outline-none focus:border-primary transition-colors cursor-pointer justify-between">
                <SelectValue placeholder="Pilih Jenis Rekognisi" />
              </SelectTrigger>
              <SelectContent>
                {jenisList.map((jenis) => (
                  <SelectItem key={jenis} value={jenis} className="text-xs font-semibold cursor-pointer">
                    {jenis}
                  </SelectItem>
                ))}
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
                <input className="w-full bg-card border border-border rounded-lg px-3 py-2 text-xs font-semibold focus:outline-none focus:border-primary transition-colors cursor-pointer text-foreground text-left" />
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
              placeholder="Contoh: Pembicara dalam Seminar Nasional..."
              value={deskripsi}
              onChange={(e) => setDeskripsi(e.target.value)}
              className="w-full bg-card border border-border rounded-lg px-3.5 py-2 text-xs focus:outline-none focus:border-primary transition-colors resize-none text-foreground"
            />
          </Field>

          {/* Field 6: Link Bukti (Multiple) */}
          <Field>
            <div className="flex justify-between items-center mb-1">
              <FieldLabel className="mb-0">
                <FieldTitle>
                  Link Bukti Dokumen <span className="text-error ml-0.5">*</span>
                </FieldTitle>
              </FieldLabel>
              {!showAddInput && (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setShowAddInput(true)}
                  className="h-8 px-2.5 border border-border hover:bg-muted/80 text-xs font-bold rounded-lg flex items-center gap-1 cursor-pointer"
                >
                  <Plus className="h-3.5 w-3.5" /> Tambah Link
                </Button>
              )}
            </div>

            {showAddInput && (
              <div className="flex items-center gap-2 mb-2 animate-fadeIn">
                <Input
                  type="text"
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
                  disabled={!newLinkUrl.trim()}
                  className="bg-primary text-primary-foreground text-xs font-semibold h-9 rounded-lg px-3 hover:bg-primary/90 cursor-pointer"
                >
                  Tambah
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setNewLinkUrl("");
                    setShowAddInput(false);
                  }}
                  className="h-9 w-9 p-0 rounded-lg hover:bg-muted flex items-center justify-center cursor-pointer"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            )}

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
        </div>

        <DialogFooter className="flex justify-end gap-2 pt-2">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            className="text-xs font-semibold h-9 rounded-lg"
          >
            Batal
          </Button>
          <Button
            onClick={handleSave}
            disabled={!selectedNip || !deskripsi || linkBuktiList.length === 0}
            className="inline-flex items-center gap-1.5 bg-primary text-primary-foreground text-xs font-semibold h-9 rounded-lg hover:bg-primary/90 cursor-pointer"
          >
            <Save className="h-3.5 w-3.5" /> Simpan Perubahan
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
