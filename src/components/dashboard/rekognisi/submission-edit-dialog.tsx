"use client";

import React, { useState, useEffect } from "react";
import { Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Combobox } from "@/components/ui/combobox";
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
import { initialData } from "@/dummy-data/rekognisi";
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
}: SubmissionEditDialogProps) {
  // Form states
  const [selectedNip, setSelectedNip] = useState("");
  const [jenisRekognisi, setJenisRekognisi] = useState("Narasumber");
  const [tahun, setTahun] = useState("2026");
  const [deskripsi, setDeskripsi] = useState("");
  const [linkBukti, setLinkBukti] = useState("");

  // Extract lecturers list
  const lecturers = Array.from(
    new Map(initialData.map((item) => [item.nip, item.nama])).entries()
  ).map(([nip, nama]) => ({ nip, nama }));

  const nipOptions = lecturers.map((l) => ({
    value: l.nip,
    label: `${l.nip} - ${l.nama}`,
  }));

  const selectedLecturerName = lecturers.find((l) => l.nip === selectedNip)?.nama || "";
  const jenisList = Array.from(new Set(initialData.map((item) => item.jenisRekognisi)));
  const years = Array.from({ length: 11 }, (_, i) => (2020 + i).toString());

  useEffect(() => {
    if (open && submission) {
      setSelectedNip(submission.nip);
      setJenisRekognisi(submission.jenisRekognisi);
      setTahun(submission.tahun);
      setDeskripsi(submission.deskripsi);
      setLinkBukti(submission.linkBukti);
    }
  }, [open, submission]);

  const handleSave = () => {
    if (!submission) return;
    onSave({
      ...submission,
      nip: selectedNip,
      nama: selectedLecturerName || submission.nama,
      jenisRekognisi,
      tahun,
      deskripsi,
      linkBukti,
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
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-1">
              NIP Dosen
              <span className="text-rose-500">*</span>
            </label>
            <Combobox
              options={nipOptions}
              value={selectedNip}
              onChange={setSelectedNip}
              placeholder="Pilih atau cari NIP Dosen..."
              searchPlaceholder="Cari NIP..."
              className="w-full justify-between"
            />
          </div>

          {/* Field 2: Nama Dosen (Display Text, not input field) */}
          {selectedNip && (
            <div className="space-y-1 p-3 bg-muted/20 border border-border/60 rounded-lg">
              <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Nama Dosen</span>
              <p className="text-xs font-bold text-foreground">{selectedLecturerName}</p>
            </div>
          )}

          {/* Field 3: Jenis Rekognisi */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
              Jenis Rekognisi
              <span className="text-rose-500">*</span>
            </label>
            <Select
              value={jenisRekognisi}
              onValueChange={setJenisRekognisi}
            >
              <SelectTrigger className="w-full bg-muted/20 border border-border rounded-lg px-3 py-2 text-xs font-semibold focus:outline-none focus:border-primary transition-colors cursor-pointer justify-between">
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
          </div>

          {/* Field 4: Tahun */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
              Tahun
              <span className="text-rose-500">*</span>
            </label>
            <Select
              value={tahun}
              onValueChange={setTahun}
            >
              <SelectTrigger className="w-full bg-muted/20 border border-border rounded-lg px-3 py-2 text-xs font-semibold focus:outline-none focus:border-primary transition-colors cursor-pointer justify-between">
                <SelectValue placeholder="Pilih Tahun" />
              </SelectTrigger>
              <SelectContent>
                {years.map((y) => (
                  <SelectItem key={y} value={y} className="text-xs font-semibold cursor-pointer">
                    {y}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Field 5: Deskripsi */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
              Deskripsi Kegiatan
              <span className="text-rose-500">*</span>
            </label>
            <textarea 
              required
              rows={3}
              placeholder="Contoh: Pembicara dalam Seminar Nasional..."
              value={deskripsi}
              onChange={(e) => setDeskripsi(e.target.value)}
              className="w-full bg-muted/20 border border-border rounded-lg px-3.5 py-2 text-xs focus:outline-none focus:border-primary transition-colors resize-none text-foreground"
            />
          </div>

          {/* Field 6: Link Bukti */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
              Link Bukti Dokumen
              <span className="text-rose-500">*</span>
            </label>
            <textarea 
              required
              rows={2}
              placeholder="Contoh: https://drive.google.com/file/d/..."
              value={linkBukti}
              onChange={(e) => setLinkBukti(e.target.value)}
              className="w-full bg-muted/20 border border-border rounded-lg px-3.5 py-2 text-xs focus:outline-none focus:border-primary transition-colors resize-none text-foreground font-mono"
            />
          </div>
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
            disabled={!selectedNip || !deskripsi || !linkBukti}
            className="inline-flex items-center gap-1.5 bg-primary text-primary-foreground text-xs font-semibold h-9 rounded-lg hover:bg-primary/90 cursor-pointer"
          >
            <Save className="h-3.5 w-3.5" /> Simpan Perubahan
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
