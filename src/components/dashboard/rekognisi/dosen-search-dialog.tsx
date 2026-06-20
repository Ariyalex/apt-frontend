"use client";

import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Field, FieldLabel, FieldTitle } from "@/components/ui/field";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { initialDosenList, initialDosenPengajuanList } from "@/dummy-data/dosen";
import { Dosen } from "@/types/dosen";
import { toast } from "sonner";
import { Search, UserPlus, FileSignature, Check } from "lucide-react";

interface DosenSearchDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSelect: (nip: string, nama: string) => void;
  userRole: "Fakultas" | "Administrator" | "Guest";
  defaultFaculty?: string;
}

const faculties = [
  "Fakultas Sains dan Teknologi",
  "Fakultas Ilmu Tarbiyah dan Keguruan",
  "Fakultas Ekonomi dan Bisnis Islam",
  "Fakultas Dakwah dan Komunikasi",
  "Fakultas Adab dan Ilmu Budaya",
  "Fakultas Syariah dan Hukum",
];

const prodis = [
  "Teknik Informatika",
  "Pendidikan Agama Islam",
  "Perbankan Syariah",
  "PGMI",
  "MPI",
  "Komunikasi Penyiaran Islam",
  "Bahasa dan Sastra Arab",
  "Hukum Ekonomi Syariah",
  "Tadris Bahasa Inggris",
  "Hukum Keluarga Islam",
  "Matematika",
  "Kimia",
  "Fisika",
  "Biologi",
];

const facultyProdiMap: Record<string, string[]> = {
  "Fakultas Sains dan Teknologi": [
    "Teknik Informatika",
    "Matematika",
    "Kimia",
    "Fisika",
    "Biologi",
  ],
  "Fakultas Ilmu Tarbiyah dan Keguruan": [
    "Pendidikan Agama Islam",
    "PGMI",
    "MPI",
    "Tadris Bahasa Inggris",
  ],
  "Fakultas Ekonomi dan Bisnis Islam": [
    "Perbankan Syariah",
  ],
  "Fakultas Dakwah dan Komunikasi": [
    "Komunikasi Penyiaran Islam",
  ],
  "Fakultas Adab dan Ilmu Budaya": [
    "Bahasa dan Sastra Arab",
  ],
  "Fakultas Syariah dan Hukum": [
    "Hukum Ekonomi Syariah",
    "Hukum Keluarga Islam",
  ],
};

export function DosenSearchDialog({
  open,
  onOpenChange,
  onSelect,
  userRole,
  defaultFaculty = "Fakultas Sains dan Teknologi",
}: DosenSearchDialogProps) {
  const [searchNip, setSearchNip] = useState("");
  const [searchResults, setSearchResults] = useState<Dosen[]>([]);
  const [hasSearched, setHasSearched] = useState(false);
  const [showForm, setShowForm] = useState(false);

  // Form states for new lecturer
  const [newNip, setNewNip] = useState("");
  const [newName, setNewName] = useState("");
  const [newFaculty, setNewFaculty] = useState("");
  const [newProdi, setNewProdi] = useState("");
  const [newEmail, setNewEmail] = useState("");
  const [newPhotoUrl, setNewPhotoUrl] = useState("");

  // Reset dialog state when opened
  useEffect(() => {
    if (open) {
      setSearchNip("");
      setSearchResults([]);
      setHasSearched(false);
      setShowForm(false);
      
      // Init form fields
      setNewNip("");
      setNewName("");
      setNewEmail("");
      const initialFaculty = (userRole === "Fakultas" || userRole === "Guest") ? defaultFaculty : faculties[0];
      setNewFaculty(initialFaculty);
      
      const allowedProdis = facultyProdiMap[initialFaculty] || prodis;
      setNewProdi(allowedProdis[0]);
      setNewPhotoUrl("");
    }
  }, [open, userRole, defaultFaculty]);

  const handleFacultyChange = (val: string) => {
    setNewFaculty(val);
    const allowedProdis = facultyProdiMap[val] || prodis;
    setNewProdi(allowedProdis[0]);
  };

  const handleSearch = () => {
    if (!searchNip.trim()) {
      toast.error("Silakan masukkan NIP untuk mencari.");
      return;
    }
    const matches = initialDosenList.filter((d) => d.nip.includes(searchNip.trim()));
    setSearchResults(matches);
    setHasSearched(true);
  };

  const handleSelectDosen = (dosen: Dosen) => {
    onSelect(dosen.nip, dosen.nama);
    onOpenChange(false);
  };

  const handlePrepareForm = () => {
    setNewNip(searchNip);
    setShowForm(true);
  };

  const validateUinEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) return false;
    const domain = email.split("@")[1].toLowerCase();
    return domain === "uin-suka.ac.id" || domain.endsWith(".uin-suka.ac.id");
  };

  const handleSubmitNewDosen = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNip.trim() || !newName.trim() || !newEmail.trim()) {
      toast.error("NIP, Nama, dan Email wajib diisi.");
      return;
    }

    if (!validateUinEmail(newEmail.trim())) {
      toast.error("Email harus menggunakan domain resmi uin-suka.ac.id atau subdomainnya.");
      return;
    }

    // Check if duplicate in main list
    const isDuplicate = initialDosenList.some((d) => d.nip === newNip.trim());
    if (isDuplicate) {
      toast.error("NIP dosen ini sudah terdaftar di sistem.");
      return;
    }

    const lecturerData: Dosen = {
      nip: newNip.trim(),
      nama: newName.trim(),
      fakultas: newFaculty,
      prodi: newProdi,
      email: newEmail.trim(),
      photoUrl: newPhotoUrl.trim() || undefined,
    };

    if (userRole === "Guest") {
      // Add as submission
      const newSubmission = {
        ...lecturerData,
        id: `pengajuan-${Date.now()}`,
        status: "pending" as const,
        submittedAt: new Date().toISOString(),
      };
      initialDosenPengajuanList.push(newSubmission);
      toast.success("Pengajuan data dosen baru berhasil dikirim!");
    } else {
      // Add directly
      initialDosenList.push(lecturerData);
      toast.success("Data dosen baru berhasil ditambahkan!");
      onSelect(newNip.trim(), newName.trim());
    }

    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg bg-card border border-border p-6 rounded-xl">
        <DialogHeader>
          <DialogTitle className="text-sm font-bold text-foreground uppercase tracking-wider">
            {showForm ? (userRole === "Guest" ? "Ajukan Data Dosen" : "Tambah Data Dosen") : "Cari NIP Dosen"}
          </DialogTitle>
        </DialogHeader>

        {!showForm ? (
          /* Search View */
          <div className="space-y-4 py-4">
            <Field>
              <FieldLabel>
                <FieldTitle>Cari NIP Dosen</FieldTitle>
              </FieldLabel>
              <div className="flex gap-2">
                <Input
                  placeholder="Masukkan NIP Dosen..."
                  value={searchNip}
                  onChange={(e) => {
                    setSearchNip(e.target.value);
                  }}
                  className="flex-1 text-xs border border-border rounded-lg bg-transparent px-3 text-foreground font-mono"
                  onKeyDown={(e) => {
                    if (e.key === "Enter") handleSearch();
                  }}
                />
                <Button
                  onClick={handleSearch}
                  className="bg-primary text-primary-foreground text-xs font-semibold h-10 px-4 rounded-lg flex items-center gap-1.5 cursor-pointer"
                >
                  <Search className="h-4 w-4" /> Cari
                </Button>
              </div>
            </Field>

            {hasSearched && (
              <div className="pt-2 animate-fadeIn">
                {searchResults.length > 0 ? (
                  /* Result Found */
                  <div className="space-y-2.5 max-h-[220px] overflow-y-auto pr-1 scrollbar-thin">
                    <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block mb-1">
                      Dosen Ditemukan ({searchResults.length})
                    </span>
                    {searchResults.map((result) => (
                      <div key={result.nip} className="p-3 bg-muted/20 border border-border rounded-lg flex items-center justify-between gap-3 hover:bg-muted/30 transition-colors">
                        <div className="space-y-0.5 min-w-0 flex-1">
                          <p className="text-xs font-bold text-foreground truncate">{result.nama}</p>
                          <p className="text-[11px] font-mono text-muted-foreground">{result.nip}</p>
                          <p className="text-[10px] text-muted-foreground truncate">{result.prodi} - {result.fakultas}</p>
                        </div>
                        <Button
                          onClick={() => handleSelectDosen(result)}
                          size="sm"
                          className="bg-success hover:bg-success/90 text-success-foreground text-[10px] font-semibold h-8 px-2.5 rounded-md flex items-center gap-1 shrink-0 cursor-pointer"
                        >
                          <Check className="h-3 w-3" /> Pilih
                        </Button>
                      </div>
                    ))}
                  </div>
                ) : (
                  /* Result Not Found */
                  <div className="p-4 border border-dashed border-border rounded-lg text-center space-y-3">
                    <p className="text-xs text-muted-foreground">
                      Dosen dengan NIP mirip <span className="font-mono font-bold text-foreground">"{searchNip}"</span> tidak terdaftar dalam database.
                    </p>
                    {userRole === "Guest" ? (
                      <Button
                        onClick={handlePrepareForm}
                        className="bg-primary text-primary-foreground text-xs font-semibold h-9 px-4 rounded-lg inline-flex items-center gap-1.5 cursor-pointer"
                      >
                        <FileSignature className="h-4 w-4" /> Ajukan Data Dosen Baru
                      </Button>
                    ) : (
                      <Button
                        onClick={handlePrepareForm}
                        className="bg-primary text-primary-foreground text-xs font-semibold h-9 px-4 rounded-lg inline-flex items-center gap-1.5 cursor-pointer"
                      >
                        <UserPlus className="h-4 w-4" /> Tambahkan Data Dosen Baru
                      </Button>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        ) : (
          /* Form View */
          <form onSubmit={handleSubmitNewDosen} className="space-y-4 py-3">
            {/* Input NIP */}
            <Field>
              <FieldLabel>
                <FieldTitle>NIP Dosen <span className="text-error">*</span></FieldTitle>
              </FieldLabel>
              <Input
                type="text"
                required
                value={newNip}
                onChange={(e) => setNewNip(e.target.value)}
                className="h-10 text-xs border border-border rounded-lg bg-transparent px-3 text-foreground font-mono"
              />
            </Field>

            {/* Input Nama */}
            <Field>
              <FieldLabel>
                <FieldTitle>Nama Dosen <span className="text-error">*</span></FieldTitle>
              </FieldLabel>
              <Input
                type="text"
                required
                placeholder="Masukkan nama lengkap beserta gelar..."
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                className="h-10 text-xs border border-border rounded-lg bg-transparent px-3 text-foreground"
              />
            </Field>

            {/* Input Fakultas */}
            <Field>
              <FieldLabel>
                <FieldTitle>Fakultas <span className="text-error">*</span></FieldTitle>
              </FieldLabel>
              {userRole === "Fakultas" || userRole === "Guest" ? (
                <Input
                  type="text"
                  disabled
                  value={newFaculty}
                  className="h-10 text-xs border border-border rounded-lg bg-muted px-3 text-muted-foreground font-semibold"
                />
              ) : (
                <Select value={newFaculty} onValueChange={handleFacultyChange}>
                  <SelectTrigger className="w-full bg-card border border-border rounded-lg px-3 py-2 text-xs font-semibold focus:outline-none focus:border-primary cursor-pointer justify-between">
                    <SelectValue placeholder="Pilih Fakultas" />
                  </SelectTrigger>
                  <SelectContent>
                    {faculties.map((f) => (
                      <SelectItem key={f} value={f} className="text-xs font-semibold cursor-pointer">
                        {f}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            </Field>

            {/* Input Prodi */}
            <Field>
              <FieldLabel>
                <FieldTitle>Program Studi <span className="text-error">*</span></FieldTitle>
              </FieldLabel>
              <Select value={newProdi} onValueChange={setNewProdi}>
                <SelectTrigger className="w-full bg-card border border-border rounded-lg px-3 py-2 text-xs font-semibold focus:outline-none focus:border-primary cursor-pointer justify-between">
                  <SelectValue placeholder="Pilih Program Studi" />
                </SelectTrigger>
                <SelectContent>
                  {(facultyProdiMap[newFaculty] || prodis).map((p) => (
                    <SelectItem key={p} value={p} className="text-xs font-semibold cursor-pointer">
                      {p}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>

            {/* Input Email */}
            <Field>
              <FieldLabel>
                <FieldTitle>Email <span className="text-error">*</span></FieldTitle>
              </FieldLabel>
              <Input
                type="email"
                required
                placeholder="dosen@uin-suka.ac.id"
                value={newEmail}
                onChange={(e) => setNewEmail(e.target.value)}
                className="h-10 text-xs border border-border rounded-lg bg-transparent px-3 text-foreground"
              />
            </Field>

            {/* Input Foto (Opsional, Upload Gambar) */}
            <Field>
              <FieldLabel>
                <FieldTitle>Foto Dosen (Opsional)</FieldTitle>
              </FieldLabel>
              <div className="flex flex-col sm:flex-row items-center gap-4 p-3 bg-muted/10 border border-border rounded-lg">
                <div className="h-28 w-24 rounded-lg border border-border overflow-hidden bg-muted flex items-center justify-center shrink-0 relative group shadow-sm">
                  {newPhotoUrl ? (
                    <>
                      <img src={newPhotoUrl} alt="Preview" className="h-full w-full object-cover" />
                      <button
                        type="button"
                        onClick={() => setNewPhotoUrl("")}
                        className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white text-[10px] font-bold cursor-pointer"
                      >
                        Hapus Foto
                      </button>
                    </>
                  ) : (
                    <div className="text-center p-2">
                      <span className="text-[10px] text-muted-foreground font-bold block uppercase tracking-wider">No Photo</span>
                      <span className="text-[9px] text-muted-foreground block mt-0.5">3 x 4 Ratio</span>
                    </div>
                  )}
                </div>
                <div className="flex-1 w-full space-y-2">
                  <p className="text-[11px] text-muted-foreground leading-normal">
                    Pilih file foto formal dengan latar belakang polos. Format yang didukung: JPG, JPEG, atau PNG (Maksimal 2 MB).
                  </p>
                  <div className="relative">
                    <Input
                      type="file"
                      accept="image/*"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          if (file.size > 2 * 1024 * 1024) {
                            toast.error("Ukuran file maksimal 2 MB.");
                            return;
                          }
                          const reader = new FileReader();
                          reader.onloadend = () => {
                            setNewPhotoUrl(reader.result as string);
                          };
                          reader.readAsDataURL(file);
                        }
                      }}
                      className="h-10 text-xs border border-border rounded-lg bg-card px-3 py-1.5 text-foreground file:bg-primary file:text-primary-foreground file:border-0 file:rounded-md file:px-2.5 file:py-0.5 file:text-[10px] file:font-bold hover:file:bg-primary/90 file:cursor-pointer cursor-pointer"
                    />
                  </div>
                </div>
              </div>
            </Field>

            <DialogFooter className="flex justify-end gap-2 pt-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowForm(false)}
                className="text-xs font-semibold h-9 rounded-lg"
              >
                Kembali
              </Button>
              <Button
                type="submit"
                className="bg-primary text-primary-foreground text-xs font-semibold h-9 rounded-lg hover:bg-primary/90 cursor-pointer"
              >
                {userRole === "Guest" ? "Kirim Pengajuan" : "Simpan Dosen"}
              </Button>
            </DialogFooter>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
