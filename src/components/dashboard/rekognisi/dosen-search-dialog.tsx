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
import type { Dosen } from "@/types/dosen";
import { toast } from "sonner";
import { Search, UserPlus, FileSignature, Check, Loader2 } from "lucide-react";
import {
  useCreateLecturerMutation,
  useCreatePublicLecturerMutation,
  useLazyGetLecturerByNipQuery,
} from "@/store/services/dosenApi";
import { useGetStudyProgramsQuery } from "@/store/services/studyProgramApi";
import { useGetInstitutesQuery } from "@/store/services/instituteApi";

interface DosenSearchDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSelect: (nip: string, nama: string) => void;
  userRole: "Fakultas" | "Administrator" | "Guest";
  defaultFaculty?: string;
}



interface CustomErrorObject {
  data?: {
    message?: string;
    error?: string;
  } | string;
}

const extractErrorMessage = (err: unknown): string => {
  if (err && typeof err === "object" && "data" in err) {
    const errObj = err as CustomErrorObject;
    const apiError = errObj.data;
    if (apiError && typeof apiError === "object") {
      return apiError.message || apiError.error || JSON.stringify(apiError);
    }
    if (typeof apiError === "string") {
      return apiError;
    }
  }
  return "Terjadi kesalahan pada server. Silakan coba kembali.";
};

export function DosenSearchDialog({
  open,
  onOpenChange,
  onSelect,
  userRole,
  defaultFaculty = "",
}: DosenSearchDialogProps): React.JSX.Element {
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

  // RTK Query endpoints
  const [triggerSearch, { isFetching: isSearching }] = useLazyGetLecturerByNipQuery();
  const [createLecturer, { isLoading: isCreatingNormal }] = useCreateLecturerMutation();
  const [createPublicLecturer, { isLoading: isCreatingPublic }] = useCreatePublicLecturerMutation();
  const isCreating = isCreatingNormal || isCreatingPublic;
  const { data: studyProgramsResponse } = useGetStudyProgramsQuery();
  const { data: institutesResponse } = useGetInstitutesQuery();

  const studyProgramList = React.useMemo(() => studyProgramsResponse?.data || [], [studyProgramsResponse]);
  const instituteList = React.useMemo(() => institutesResponse?.data || [], [institutesResponse]);

  const realFaculties = React.useMemo(() => instituteList.map((inst) => inst.name), [instituteList]);

  const addProdiList = studyProgramList.filter((p) => !newFaculty || p.institute?.name === newFaculty);

  // Reset dialog state when opened
  useEffect(() => {
    if (open) {
      const timer = setTimeout(() => {
        setSearchNip("");
        setSearchResults([]);
        setHasSearched(false);
        setShowForm(false);
        
        // Init form fields
        setNewNip("");
        setNewName("");
        setNewEmail("");
        const initialFaculty = (userRole === "Fakultas" || userRole === "Guest") ? defaultFaculty : (realFaculties[0] || "");
        setNewFaculty(initialFaculty);
        
        const allowed = studyProgramList.filter((p) => p.institute?.name === initialFaculty);
        setNewProdi(allowed[0]?.name || (studyProgramList[0]?.name || ""));
      }, 0);
      return () => clearTimeout(timer);
    }
  }, [open, userRole, defaultFaculty, realFaculties, studyProgramList]);

  const handleFacultyChange = (val: string): void => {
    setNewFaculty(val);
    const allowed = studyProgramList.filter((p) => p.institute?.name === val);
    setNewProdi(allowed[0]?.name || "");
  };

  const handleSearch = async (): Promise<void> => {
    if (!searchNip.trim()) {
      toast.error("Silakan masukkan NIP untuk mencari.");
      return;
    }
    try {
      const response = await triggerSearch(searchNip.trim()).unwrap();
      if (response && response.data) {
        setSearchResults([
          {
            nip: response.data.nip,
            nama: response.data.name,
            fakultas: response.data.institute?.name || "",
            prodi: response.data.study_program?.name || "",
            email: response.data.email,
          },
        ]);
      } else {
        setSearchResults([]);
      }
      setHasSearched(true);
    } catch {
      setSearchResults([]);
      setHasSearched(true);
    }
  };

  const handleSelectDosen = (dosen: Dosen): void => {
    onSelect(dosen.nip, dosen.nama);
    onOpenChange(false);
  };

  const handlePrepareForm = (): void => {
    setNewNip(searchNip);
    setShowForm(true);
  };

  const validateUinEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) return false;
    const domain = email.split("@")[1].toLowerCase();
    return domain === "uin-suka.ac.id" || domain.endsWith(".uin-suka.ac.id");
  };

  const handleSubmitNewDosen = async (e: React.FormEvent): Promise<void> => {
    e.preventDefault();
    if (!newNip.trim() || !newName.trim() || !newEmail.trim()) {
      toast.error("NIP, Nama, dan Email wajib diisi.");
      return;
    }

    if (!validateUinEmail(newEmail.trim())) {
      toast.error("Email harus menggunakan domain resmi uin-suka.ac.id atau subdomainnya.");
      return;
    }

    const matchedProdi = studyProgramList.find((p) => p.name === newProdi);
    if (!matchedProdi) {
      toast.error("Program studi tidak valid atau belum terdaftar di sistem.");
      return;
    }

    try {
      const payload = {
        name: newName.trim(),
        nip: newNip.trim(),
        email: newEmail.trim(),
        study_program_id: matchedProdi.id,
      };
      const response = await (userRole === "Guest"
        ? createPublicLecturer(payload)
        : createLecturer(payload)
      ).unwrap();

      toast.success(response.message || "Data dosen baru berhasil ditambahkan!");
      onSelect(response.data.nip, response.data.name);
      onOpenChange(false);
    } catch (err: unknown) {
      toast.error(extractErrorMessage(err));
    }
  };

  return (
    <Dialog open={open} onOpenChange={(val) => {
      if (isSearching || isCreating) return;
      onOpenChange(val);
    }}>
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
                  disabled={isSearching}
                  className="flex-1 text-xs border border-border rounded-lg bg-transparent px-3 text-foreground font-mono disabled:opacity-50 disabled:cursor-not-allowed"
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !isSearching) handleSearch();
                  }}
                />
                <Button
                  onClick={handleSearch}
                  disabled={isSearching}
                  className="bg-primary text-primary-foreground text-xs font-semibold h-10 px-4 rounded-lg flex items-center gap-1.5 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSearching ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <span>Mencari...</span>
                    </>
                  ) : (
                    <>
                      <Search className="h-4 w-4" />
                      <span>Cari</span>
                    </>
                  )}
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
                      Dosen dengan NIP mirip <span className="font-mono font-bold text-foreground">&quot;{searchNip}&quot;</span> tidak terdaftar dalam database.
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
                disabled={isCreating}
                className="h-10 text-xs border border-border rounded-lg bg-transparent px-3 text-foreground font-mono disabled:opacity-50 disabled:cursor-not-allowed"
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
                disabled={isCreating}
                className="h-10 text-xs border border-border rounded-lg bg-transparent px-3 text-foreground disabled:opacity-50 disabled:cursor-not-allowed"
              />
            </Field>

            {/* Input Fakultas */}
            <Field>
              <FieldLabel>
                <FieldTitle>Fakultas <span className="text-error">*</span></FieldTitle>
              </FieldLabel>
              <Select value={newFaculty} onValueChange={handleFacultyChange} disabled={isCreating}>
                <SelectTrigger className="w-full bg-card border border-border rounded-lg px-3 py-2 text-xs font-semibold focus:outline-none focus:border-primary cursor-pointer justify-between disabled:opacity-50 disabled:cursor-not-allowed">
                  <SelectValue placeholder="Pilih Fakultas" />
                </SelectTrigger>
                <SelectContent>
                  {realFaculties.map((f) => (
                    <SelectItem key={f} value={f} className="text-xs font-semibold cursor-pointer">
                      {f}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>

            {/* Input Prodi */}
            <Field>
              <FieldLabel>
                <FieldTitle>Program Studi <span className="text-error">*</span></FieldTitle>
              </FieldLabel>
              <Select value={newProdi} onValueChange={setNewProdi} disabled={isCreating}>
                <SelectTrigger className="w-full bg-card border border-border rounded-lg px-3 py-2 text-xs font-semibold focus:outline-none focus:border-primary cursor-pointer justify-between disabled:opacity-50 disabled:cursor-not-allowed">
                  <SelectValue placeholder="Pilih Program Studi" />
                </SelectTrigger>
                <SelectContent>
                  {addProdiList.map((p) => (
                    <SelectItem key={p.name} value={p.name} className="text-xs font-semibold cursor-pointer">
                      {p.name}
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
                disabled={isCreating}
                className="h-10 text-xs border border-border rounded-lg bg-transparent px-3 text-foreground disabled:opacity-50 disabled:cursor-not-allowed"
              />
            </Field>

            <DialogFooter className="flex justify-end gap-2 pt-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowForm(false)}
                disabled={isCreating}
                className="text-xs font-semibold h-9 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Kembali
              </Button>
              <Button
                type="submit"
                disabled={isCreating}
                className="bg-primary text-primary-foreground text-xs font-semibold h-9 rounded-lg hover:bg-primary/90 cursor-pointer flex items-center justify-center gap-1.5 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isCreating ? (
                  <>
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    <span>Menyimpan...</span>
                  </>
                ) : (
                  <span>{userRole === "Guest" ? "Kirim Pengajuan" : "Simpan Dosen"}</span>
                )}
              </Button>
            </DialogFooter>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
