"use client";

import React, { use, useState } from "react";
import Image from "next/image";
import logoUin from "../../../../../public/logo_uin.png";
import { Save, CheckCircle, AlertCircle, FileText } from "lucide-react";
import { initialData } from "@/dummy-data/rekognisi";
import { initialSharingLinks } from "@/dummy-data/bagikan-form";
import { Combobox } from "@/components/ui/combobox";
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

interface PublicFormPageProps {
  params: Promise<{ customLink: string }>;
}

export default function PublicFormPage({ params }: PublicFormPageProps) {
  const { customLink } = use(params);
  const [submitted, setSubmitted] = useState(false);

  // Form states
  const [selectedNip, setSelectedNip] = useState("");
  const [jenisRekognisi, setJenisRekognisi] = useState("Narasumber");
  const [tahun, setTahun] = useState(new Date().getFullYear().toString());
  const [deskripsi, setDeskripsi] = useState("");
  const [linkBukti, setLinkBukti] = useState("");

  // Find sharing link by name (which is customLink)
  const linkInfo = initialSharingLinks.find((l) => l.name === customLink);

  // Check link validity
  const isLinkFound = !!linkInfo;
  const isLinkClosed = linkInfo?.status === "closed";
  const isLinkExpired = linkInfo ? new Date() > new Date(linkInfo.expiredAt) : false;
  const isLinkInvalid = !isLinkFound || isLinkClosed || isLinkExpired;

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
  };

  const handleResetForm = () => {
    setSubmitted(false);
    setSelectedNip("");
    setJenisRekognisi("Narasumber");
    setTahun(new Date().getFullYear().toString());
    setDeskripsi("");
    setLinkBukti("");
  };

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

  // Error/Invalid Screen
  if (isLinkInvalid) {
    return (
      <div className="min-h-screen bg-muted/10 flex flex-col font-sans">
        <Header />
        <main className="flex-1 flex items-center justify-center p-6">
          <div className="max-w-md w-full bg-card border border-border rounded-xl p-8 text-center space-y-6 shadow-sm animate-fadeIn">
            <div className="mx-auto h-12 w-12 rounded-full bg-rose-500/10 flex items-center justify-center text-rose-500">
              <AlertCircle className="h-6 w-6" />
            </div>
            
            <div className="space-y-2">
              <h1 className="text-sm font-bold text-foreground uppercase tracking-wider">
                {!isLinkFound ? "Tautan Tidak Ditemukan" : "Formulir Sudah Ditutup"}
              </h1>
              <p className="text-xs text-muted-foreground leading-relaxed">
                {!isLinkFound 
                  ? `Tautan formulir dengan pengenal "${customLink}" tidak terdaftar dalam sistem.`
                  : `Formulir pengisian untuk "${linkInfo?.name}" saat ini dinonaktifkan atau telah melewati batas waktu pengisian.`}
              </p>
            </div>

            {linkInfo && (
              <div className="bg-muted/30 border border-border/50 rounded-lg p-3 text-left space-y-1.5">
                <div className="text-xs text-muted-foreground flex justify-between">
                  <span>Nama Form:</span>
                  <span className="font-bold text-foreground">{linkInfo.name}</span>
                </div>
                <div className="text-xs text-muted-foreground flex justify-between">
                  <span>Batas Waktu:</span>
                  <span className="font-semibold text-foreground">
                    {new Date(linkInfo.expiredAt).toLocaleString("id-ID", {
                      dateStyle: "medium",
                      timeStyle: "short",
                    })}
                  </span>
                </div>
              </div>
            )}
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
                <div className="h-14 w-14 rounded-full bg-emerald-500/10 flex items-center justify-center text-emerald-500">
                  <CheckCircle className="h-9 w-9 animate-bounce" />
                </div>
                <div className="space-y-1">
                  <h2 className="text-xs font-bold text-foreground uppercase tracking-wider">Tanggapan Berhasil Dikirim!</h2>
                  <p className="text-xs text-muted-foreground max-w-sm">
                    Terima kasih, data rekognisi Anda telah berhasil direkam ke dalam form <span className="font-bold text-foreground">"{linkInfo.name}"</span>.
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
                    <span className="text-xs font-bold uppercase tracking-wider">Formulir Rekognisi Dosen</span>
                  </div>
                  <h1 className="text-sm font-bold text-foreground leading-tight">
                    {linkInfo.name}
                  </h1>
                  <p className="text-xs text-muted-foreground">
                    Gunakan formulir ini untuk mengajukan data rekognisi Anda. Data akan divalidasi oleh Administrator sebelum dipublikasikan.
                  </p>
                </div>

                {/* Field 1: NIP Dosen */}
                <Field>
                  <FieldLabel>
                    <FieldTitle>
                      NIP Dosen
                      <span className="text-rose-500 ml-0.5">*</span>
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
                      Jenis Rekognisi
                      <span className="text-rose-500 ml-0.5">*</span>
                    </FieldTitle>
                  </FieldLabel>
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
                </Field>

                {/* Field 4: Tahun */}
                <Field>
                  <FieldLabel>
                    <FieldTitle>
                      Tahun
                      <span className="text-rose-500 ml-0.5">*</span>
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
                      <input className="w-full bg-muted/20 border border-border rounded-lg px-3 py-2 text-xs font-semibold focus:outline-none focus:border-primary transition-colors cursor-pointer text-foreground text-left" />
                    }
                  />
                </Field>

                {/* Field 5: Deskripsi */}
                <Field>
                  <FieldLabel>
                    <FieldTitle>
                      Deskripsi Kegiatan
                      <span className="text-rose-500 ml-0.5">*</span>
                    </FieldTitle>
                  </FieldLabel>
                  <textarea 
                    required
                    rows={3}
                    placeholder="Contoh: Pembicara dalam Seminar Nasional Teknologi Informasi..."
                    value={deskripsi}
                    onChange={(e) => setDeskripsi(e.target.value)}
                    className="w-full bg-muted/20 border border-border rounded-lg px-3.5 py-2 text-xs focus:outline-none focus:border-primary transition-colors resize-none text-foreground"
                  />
                </Field>

                {/* Field 6: Link Bukti */}
                <Field>
                  <FieldLabel>
                    <FieldTitle>
                      Link Bukti Dokumen
                      <span className="text-rose-500 ml-0.5">*</span>
                    </FieldTitle>
                  </FieldLabel>
                  <textarea 
                    required
                    rows={2}
                    placeholder="Contoh: https://drive.google.com/file/d/..."
                    value={linkBukti}
                    onChange={(e) => setLinkBukti(e.target.value)}
                    className="w-full bg-muted/20 border border-border rounded-lg px-3.5 py-2 text-xs focus:outline-none focus:border-primary transition-colors resize-none text-foreground font-mono"
                  />
                </Field>

                {/* Form Actions */}
                <div className="pt-2 flex justify-end">
                  <button 
                    type="submit" 
                    disabled={!selectedNip}
                    className="inline-flex items-center gap-1.5 bg-primary text-primary-foreground font-semibold text-xs px-4 py-2 rounded-lg hover:bg-primary/95 shadow-sm transition-colors cursor-pointer disabled:opacity-50 disabled:pointer-events-none"
                  >
                    <Save className="h-3.5 w-3.5" /> Kirim Tanggapan
                  </button>
                </div>
              </form>
            )}
          </div>
          
        </div>
      </main>
    </div>
  );
}
