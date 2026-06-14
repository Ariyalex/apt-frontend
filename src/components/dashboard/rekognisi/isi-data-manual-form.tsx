"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Save, CheckCircle } from "lucide-react";
import { initialData } from "@/dummy-data/rekognisi";
import { Combobox } from "@/components/ui/combobox";
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

export function IsiDataManualForm() {
  const [submitted, setSubmitted] = useState(false);
  
  // Form states
  const [selectedNip, setSelectedNip] = useState("");
  const [jenisRekognisi, setJenisRekognisi] = useState("Narasumber");
  const [tahun, setTahun] = useState(new Date().getFullYear().toString());
  const [deskripsi, setDeskripsi] = useState("");
  const [linkBukti, setLinkBukti] = useState("");

  // Extract unique lecturers (NIP & Name) from dummy data
  const lecturers = Array.from(
    new Map(initialData.map((item) => [item.nip, item.nama])).entries()
  ).map(([nip, nama]) => ({ nip, nama }));

  // Map to Combobox option structure
  const nipOptions = lecturers.map((l) => ({
    value: l.nip,
    label: `${l.nip} - ${l.nama}`,
  }));

  // Find dynamic lecturer name based on chosen NIP
  const selectedLecturerName = lecturers.find((l) => l.nip === selectedNip)?.nama || "";

  // Extract unique kinds of recognition
  const jenisList = Array.from(new Set(initialData.map((item) => item.jenisRekognisi)));

  // Generate years list from 2020 to 2030
  const years = Array.from({ length: 11 }, (_, i) => (2020 + i).toString());

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
    setTimeout(() => {
      setSubmitted(false);
      // Reset form
      setSelectedNip("");
      setJenisRekognisi("Narasumber");
      setTahun(new Date().getFullYear().toString());
      setDeskripsi("");
      setLinkBukti("");
    }, 2500);
  };

  return (
    <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
      {submitted ? (
        <div className="flex flex-col items-center justify-center py-10 space-y-3 text-center">
          <div className="h-12 w-12 rounded-full bg-emerald-500/10 flex items-center justify-center text-emerald-500">
            <CheckCircle className="h-8 w-8 animate-bounce" />
          </div>
          <h2 className="text-xs font-bold text-foreground uppercase tracking-wider">Data Berhasil Disimpan!</h2>
          <p className="text-xs text-muted-foreground max-w-sm">
            Rekognisi dosen telah berhasil diinput dan tautan bukti dokumen telah disimpan ke sistem.
          </p>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          <h3 className="text-xs font-bold text-foreground uppercase tracking-wider border-b border-border/40 pb-2 mb-2">
            Isi Data Rekognisi
          </h3>

          {/* Field 1: NIP Dosen */}
          <Field>
            <FieldLabel>
              <FieldTitle>
                NIP Dosen <span className="text-rose-500 ml-0.5">*</span>
              </FieldTitle>
            </FieldLabel>
            <Combobox
              options={nipOptions}
              value={selectedNip}
              onChange={setSelectedNip}
              placeholder="Pilih atau cari NIP Dosen..."
              searchPlaceholder="Cari NIP..."
              className="w-full justify-between"
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
                Jenis Rekognisi <span className="text-rose-500 ml-0.5">*</span>
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
                Tahun <span className="text-rose-500 ml-0.5">*</span>
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
                Deskripsi Kegiatan <span className="text-rose-500 ml-0.5">*</span>
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

          {/* Field 6: Link Bukti */}
          <Field>
            <FieldLabel>
              <FieldTitle>
                Link Bukti Dokumen <span className="text-rose-500 ml-0.5">*</span>
              </FieldTitle>
            </FieldLabel>
            <textarea 
              required
              rows={2}
              placeholder="Contoh: https://drive.google.com/file/d/..."
              value={linkBukti}
              onChange={(e) => setLinkBukti(e.target.value)}
              className="w-full bg-card border border-border rounded-lg px-3.5 py-2 text-xs focus:outline-none focus:border-primary transition-colors resize-none text-foreground font-mono"
            />
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
      )}
    </div>
  );
}
