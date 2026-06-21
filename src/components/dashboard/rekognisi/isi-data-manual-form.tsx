"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Save, CheckCircle, Plus, Trash2 } from "lucide-react";
import { initialData } from "@/dummy-data/rekognisi";
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
import { initialDosenList } from "@/dummy-data/dosen";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";

export function IsiDataManualForm() {
  const [submitted, setSubmitted] = useState(false);
  
  // Form states
  const [selectedNip, setSelectedNip] = useState("");
  const [jenisRekognisi, setJenisRekognisi] = useState("Narasumber");
  const [tahun, setTahun] = useState(new Date().getFullYear().toString());
  const [deskripsi, setDeskripsi] = useState("");
  
  // Multiple proof link states
  const [linkBuktiList, setLinkBuktiList] = useState<string[]>([]);
  const [addLinkOpen, setAddLinkOpen] = useState(false);
  const [newLinkUrl, setNewLinkUrl] = useState("");

  const [searchDialogOpen, setSearchDialogOpen] = useState(false);

  // Find dynamic lecturer name based on chosen NIP from initialDosenList
  const selectedLecturerName = initialDosenList.find((l) => l.nip === selectedNip)?.nama || "";

  // Extract unique kinds of recognition
  const jenisList = Array.from(new Set(initialData.map((item) => item.jenisRekognisi)));

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
    setSubmitted(true);
    toast.success("Data rekognisi dosen berhasil disimpan!");
    setTimeout(() => {
      setSubmitted(false);
      // Reset form
      setSelectedNip("");
      setJenisRekognisi("Narasumber");
      setTahun(new Date().getFullYear().toString());
      setDeskripsi("");
      setLinkBuktiList([]);
    }, 2500);
  };

  return (
    <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
      {submitted ? (
        <div className="flex flex-col items-center justify-center py-10 space-y-3 text-center">
          <div className="h-12 w-12 rounded-full bg-success/10 flex items-center justify-center text-success">
            <CheckCircle className="h-8 w-8 animate-bounce" />
          </div>
          <h2 className="text-xs font-bold text-foreground uppercase tracking-wider">Data Berhasil Disimpan!</h2>
          <p className="text-xs text-muted-foreground max-w-sm">
            Rekognisi dosen telah berhasil diinput dan tautan bukti dokumen telah disimpan ke sistem.
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
                placeholder="Klik untuk mencari NIP Dosen..."
                value={selectedNip}
                onClick={() => setSearchDialogOpen(true)}
                className="h-10 text-xs border border-border rounded-lg bg-transparent px-3 text-foreground font-mono cursor-pointer"
              />
              <DosenSearchDialog
                open={searchDialogOpen}
                onOpenChange={setSearchDialogOpen}
                onSelect={(nip, name) => {
                  setSelectedNip(nip);
                }}
                userRole="Fakultas"
                defaultFaculty="Fakultas Sains dan Teknologi"
              />
            </Field>

            {/* Field 2: Nama Dosen (Display Text, not input field) */}
            {selectedNip && (
              <div className="space-y-1 p-3.5 bg-muted/25 border border-border/60 rounded-lg animate-fadeIn">
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
                placeholder="Contoh: Pembicara dalam Seminar Nasional Teknologi Informasi..."
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
                  Belum ada link bukti. Klik tombol "+ Tambah Link" untuk menambahkan.
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
            <div className="pt-2 flex justify-end gap-3">
              <Link href="/dashboard/rekognisi-dosen" className="bg-muted text-muted-foreground font-semibold text-xs px-4 py-2 rounded-lg hover:bg-muted/80 transition-colors">
                Batal
              </Link>
              <button 
                type="submit" 
                disabled={!selectedNip}
                className="inline-flex items-center gap-1.5 bg-primary text-primary-foreground font-semibold text-xs px-4 py-2 rounded-lg hover:bg-primary/95 shadow-sm transition-colors cursor-pointer disabled:opacity-50 disabled:pointer-events-none"
              >
                <Save className="h-3.5 w-3.5" /> Simpan Data
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
        </>
      )}
    </div>
  );
}
