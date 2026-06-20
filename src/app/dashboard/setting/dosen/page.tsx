"use client";

import React, { useState, useEffect } from "react";
import { Plus, Trash2, Check, X, Edit2, ShieldAlert, Search } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import { Field, FieldLabel, FieldTitle } from "@/components/ui/field";
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
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { initialDosenList, initialDosenPengajuanList } from "@/dummy-data/dosen";
import { Dosen, DosenPengajuan } from "@/types/dosen";
import { toast } from "sonner";

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

export default function DosenManagementPage() {
  const [isAdmin, setIsAdmin] = useState(false);
  const [userFaculty, setUserFaculty] = useState("Fakultas Sains dan Teknologi");
  const [isLoading, setIsLoading] = useState(true);

  // Filter state
  const [filterProdi, setFilterProdi] = useState("Semua");
  const [filterFaculty, setFilterFaculty] = useState("Semua");
  const [searchQuery, setSearchQuery] = useState("");
  const [activeSearchQuery, setActiveSearchQuery] = useState("");

  const handleSearch = () => {
    setActiveSearchQuery(searchQuery);
  };

  const handleResetSearch = () => {
    setSearchQuery("");
    setActiveSearchQuery("");
  };

  // Local state initialized from shared mock database
  const [dosenList, setDosenList] = useState<Dosen[]>([]);
  const [pengajuanList, setPengajuanList] = useState<DosenPengajuan[]>([]);

  // Add Dosen Dialog States
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [addNip, setAddNip] = useState("");
  const [addNama, setAddNama] = useState("");
  const [addFaculty, setAddFaculty] = useState("");
  const [addProdi, setAddProdi] = useState("");
  const [addPhotoUrl, setAddPhotoUrl] = useState("");

  // Delete Dosen Dialog States
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [dosenToDelete, setDosenToDelete] = useState<Dosen | null>(null);

  // Edit Dosen Dialog States
  const [isEditDosenOpen, setIsEditDosenOpen] = useState(false);
  const [editingDosen, setEditingDosen] = useState<Dosen | null>(null);
  const [editDosenNip, setEditDosenNip] = useState("");
  const [editDosenNama, setEditDosenNama] = useState("");
  const [editDosenFaculty, setEditDosenFaculty] = useState("");
  const [editDosenProdi, setEditDosenProdi] = useState("");
  const [editDosenPhotoUrl, setEditDosenPhotoUrl] = useState("");

  // Edit Pengajuan Dialog States
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [editingPengajuan, setEditingPengajuan] = useState<DosenPengajuan | null>(null);
  const [editNip, setEditNip] = useState("");
  const [editNama, setEditNama] = useState("");
  const [editFaculty, setEditFaculty] = useState("");
  const [editProdi, setEditProdi] = useState("");
  const [editPhotoUrl, setEditPhotoUrl] = useState("");

  // Load Session and lists
  useEffect(() => {
    const raw = localStorage.getItem("userSession");
    if (raw) {
      try {
        const session = JSON.parse(raw);
        if (session.role === "Administrator" || session.username === "admin") {
          setIsAdmin(true);
        } else {
          // If fakultas user, default to Sains dan Teknologi for mock
          setUserFaculty("Fakultas Sains dan Teknologi");
        }
      } catch (e) {}
    }
    // Bind lists
    setDosenList([...initialDosenList]);
    setPengajuanList([...initialDosenPengajuanList]);

    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 700);
    return () => clearTimeout(timer);
  }, []);

  // Filter based on role, prodi, faculty, and search query
  const filteredDosen = dosenList.filter((d) => {
    const matchFaculty = isAdmin
      ? (filterFaculty === "Semua" || d.fakultas === filterFaculty)
      : (d.fakultas === userFaculty);
    const matchProdi = filterProdi === "Semua" || d.prodi === filterProdi;
    const matchSearch = !activeSearchQuery.trim() || 
      d.nama.toLowerCase().includes(activeSearchQuery.toLowerCase()) || 
      d.nip.includes(activeSearchQuery.trim());
    return matchFaculty && matchProdi && matchSearch;
  });

  const filteredPengajuan = pengajuanList.filter((p) => {
    const matchFaculty = isAdmin
      ? (filterFaculty === "Semua" || p.fakultas === filterFaculty)
      : (p.fakultas === userFaculty);
    const matchProdi = filterProdi === "Semua" || p.prodi === filterProdi;
    const matchSearch = !activeSearchQuery.trim() || 
      p.nama.toLowerCase().includes(activeSearchQuery.toLowerCase()) || 
      p.nip.includes(activeSearchQuery.trim());
    return matchFaculty && matchProdi && matchSearch;
  });

  // Sync back to shared mock database
  const syncDosenDatabase = (newList: Dosen[]) => {
    initialDosenList.length = 0;
    initialDosenList.push(...newList);
    setDosenList(newList);
  };

  const syncPengajuanDatabase = (newList: DosenPengajuan[]) => {
    initialDosenPengajuanList.length = 0;
    initialDosenPengajuanList.push(...newList);
    setPengajuanList(newList);
  };

  // Add Dosen
  const handleOpenAdd = () => {
    setAddNip("");
    setAddNama("");
    setAddFaculty(isAdmin ? faculties[0] : userFaculty);
    setAddProdi(prodis[0]);
    setAddPhotoUrl("");
    setIsAddOpen(true);
  };

  const handleAddDosen = (e: React.FormEvent) => {
    e.preventDefault();
    if (!addNip.trim() || !addNama.trim()) {
      toast.error("NIP dan Nama wajib diisi.");
      return;
    }

    const isDuplicate = dosenList.some((d) => d.nip === addNip.trim());
    if (isDuplicate) {
      toast.error("Dosen dengan NIP ini sudah terdaftar.");
      return;
    }

    const newDosen: Dosen = {
      nip: addNip.trim(),
      nama: addNama.trim(),
      fakultas: addFaculty,
      prodi: addProdi,
      photoUrl: addPhotoUrl.trim() || undefined,
    };

    const updated = [...dosenList, newDosen];
    syncDosenDatabase(updated);
    toast.success(`Dosen "${addNama}" berhasil ditambahkan!`);
    setIsAddOpen(false);
  };

  // Delete Dosen
  const handleDeleteDosen = (nip: string, name: string) => {
    const updated = dosenList.filter((d) => d.nip !== nip);
    syncDosenDatabase(updated);
    toast.success(`Data dosen "${name}" telah dihapus.`);
    setIsDeleteOpen(false);
  };

  const handleConfirmDelete = (dosen: Dosen) => {
    setDosenToDelete(dosen);
    setIsDeleteOpen(true);
  };

  // Accept Submission
  const handleAcceptPengajuan = (pengajuan: DosenPengajuan) => {
    // 1. Remove from pengajuan
    const updatedPengajuan = pengajuanList.filter((p) => p.id !== pengajuan.id);
    syncPengajuanDatabase(updatedPengajuan);

    // 2. Add to main dosen list
    const newDosen: Dosen = {
      nip: pengajuan.nip,
      nama: pengajuan.nama,
      fakultas: pengajuan.fakultas,
      prodi: pengajuan.prodi,
      photoUrl: pengajuan.photoUrl,
    };

    const updatedDosen = [...dosenList, newDosen];
    syncDosenDatabase(updatedDosen);
    toast.success(`Pengajuan dosen "${pengajuan.nama}" telah disetujui.`);
  };

  // Decline Submission
  const handleDeclinePengajuan = (pengajuan: DosenPengajuan) => {
    const updated = pengajuanList.filter((p) => p.id !== pengajuan.id);
    syncPengajuanDatabase(updated);
    toast.info(`Pengajuan dosen "${pengajuan.nama}" telah ditolak.`);
  };

  // Prepare Edit dialog
  const handleOpenEdit = (pengajuan: DosenPengajuan) => {
    setEditingPengajuan(pengajuan);
    setEditNip(pengajuan.nip);
    setEditNama(pengajuan.nama);
    setEditFaculty(pengajuan.fakultas);
    setEditProdi(pengajuan.prodi);
    setEditPhotoUrl(pengajuan.photoUrl || "");
    setIsEditOpen(true);
  };

  // Prepare Edit Dosen dialog
  const handleOpenEditDosen = (dosen: Dosen) => {
    setEditingDosen(dosen);
    setEditDosenNip(dosen.nip);
    setEditDosenNama(dosen.nama);
    setEditDosenFaculty(dosen.fakultas);
    setEditDosenProdi(dosen.prodi);
    setEditDosenPhotoUrl(dosen.photoUrl || "");
    setIsEditDosenOpen(true);
  };

  // Save Edit Dosen
  const handleSaveEditDosen = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingDosen) return;

    if (!editDosenNip.trim() || !editDosenNama.trim()) {
      toast.error("NIP dan Nama wajib diisi.");
      return;
    }

    const isDuplicate = dosenList.some(
      (d) => d.nip === editDosenNip.trim() && d.nip !== editingDosen.nip
    );
    if (isDuplicate) {
      toast.error("Dosen dengan NIP ini sudah terdaftar.");
      return;
    }

    const updated = dosenList.map((d) => {
      if (d.nip === editingDosen.nip) {
        return {
          nip: editDosenNip.trim(),
          nama: editDosenNama.trim(),
          fakultas: editDosenFaculty,
          prodi: editDosenProdi,
          photoUrl: editDosenPhotoUrl.trim() || undefined,
        };
      }
      return d;
    });

    syncDosenDatabase(updated);
    toast.success("Data dosen berhasil diperbarui!");
    setIsEditDosenOpen(false);
  };

  // Save Edit
  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingPengajuan) return;

    if (!editNama.trim()) {
      toast.error("Nama wajib diisi.");
      return;
    }

    const updated = pengajuanList.map((p) => {
      if (p.id === editingPengajuan.id) {
        return {
          ...p,
          nip: editNip.trim(),
          nama: editNama.trim(),
          fakultas: editFaculty,
          prodi: editProdi,
          photoUrl: editPhotoUrl.trim() || undefined,
        };
      }
      return p;
    });

    syncPengajuanDatabase(updated);
    toast.success("Pengajuan dosen berhasil diperbarui!");
    setIsEditOpen(false);
  };

  return (
    <div className="w-full space-y-6 animate-fadeIn">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-border/40 pb-4">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-foreground md:text-2xl">
            {isAdmin ? "Pengelolaan Data Dosen" : "Pengaturan Dosen"}
          </h1>
          <p className="text-xs text-muted-foreground mt-1">
            {isAdmin
              ? "Kelola semua data profil dosen universitas dan tinjau pengajuan dosen baru"
              : `Kelola data profil dosen dan pengajuan data baru untuk ${userFaculty}`}
          </p>
        </div>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="data-dosen" className="w-full">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between mb-4">
          <TabsList className="bg-muted/40 border border-border rounded-lg p-1 h-11 grid grid-cols-2 w-full sm:w-80">
            <TabsTrigger value="data-dosen" className="text-xs font-semibold rounded-md py-1.5 cursor-pointer">
              Data Dosen
            </TabsTrigger>
            <TabsTrigger value="pengajuan" className="text-xs font-semibold rounded-md py-1.5 cursor-pointer">
              Pengajuan Data ({filteredPengajuan.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="data-dosen" className="mt-0 focus-visible:outline-none">
            <Button
              onClick={handleOpenAdd}
              className="bg-primary text-primary-foreground text-xs font-semibold h-10 px-4 rounded-lg flex items-center gap-1.5 cursor-pointer w-full sm:w-auto"
            >
              <Plus className="h-4 w-4" /> Tambah Dosen Baru
            </Button>
          </TabsContent>
        </div>

        {/* Filter and Search Bar */}
        <div className="bg-card border border-border rounded-xl p-4 flex flex-col md:flex-row items-center justify-between gap-4 shadow-sm mb-4">
          <div className="flex flex-col sm:flex-row items-center gap-3 w-full flex-1">
            {/* Search Block */}
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <Input
                type="text"
                placeholder="Cari dosen berdasarkan nama atau NIP..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleSearch();
                }}
                className="h-10 text-xs border border-border rounded-lg bg-transparent px-3 text-foreground flex-1 sm:w-72 sm:flex-initial"
              />
              <Button
                onClick={handleSearch}
                className="bg-primary text-primary-foreground text-xs font-semibold h-10 px-4 rounded-lg flex items-center gap-1.5 shrink-0 cursor-pointer"
              >
                <Search className="h-4 w-4" /> Cari
              </Button>
              {activeSearchQuery && (
                <Button
                  variant="outline"
                  onClick={handleResetSearch}
                  className="h-10 text-xs font-semibold px-3 rounded-lg flex items-center gap-1 cursor-pointer shrink-0 text-muted-foreground border-border hover:bg-muted"
                >
                  Reset
                </Button>
              )}
            </div>

            {/* Filter Prodi */}
            <div className="w-full sm:w-[200px]">
              <Select value={filterProdi} onValueChange={setFilterProdi}>
                <SelectTrigger className="w-full h-10 bg-card border border-border rounded-lg px-3 py-2 text-xs font-semibold focus:outline-none focus:border-primary cursor-pointer justify-between">
                  <SelectValue placeholder="Filter Prodi" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Semua" className="text-xs font-semibold cursor-pointer">Semua Prodi</SelectItem>
                  {((isAdmin ? facultyProdiMap[filterFaculty] : facultyProdiMap[userFaculty]) || prodis).map((p) => (
                    <SelectItem key={p} value={p} className="text-xs font-semibold cursor-pointer">
                      {p}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Filter Fakultas (Admin only) */}
            {isAdmin && (
              <div className="w-full sm:w-[240px]">
                <Select
                  value={filterFaculty}
                  onValueChange={(val) => {
                    setFilterFaculty(val);
                    setFilterProdi("Semua");
                  }}
                >
                  <SelectTrigger className="w-full h-10 bg-card border border-border rounded-lg px-3 py-2 text-xs font-semibold focus:outline-none focus:border-primary cursor-pointer justify-between">
                    <SelectValue placeholder="Filter Fakultas" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Semua" className="text-xs font-semibold cursor-pointer">Semua Fakultas</SelectItem>
                    {faculties.map((f) => (
                      <SelectItem key={f} value={f} className="text-xs font-semibold cursor-pointer">
                        {f}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>
        </div>

        {/* Tab Content: Data Dosen */}
        <TabsContent value="data-dosen" className="focus-visible:outline-none">
          <div className="rounded-xl border border-border bg-card shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-muted/30 text-xs font-bold text-muted-foreground uppercase border-b border-border">
                    <th className="px-4 py-3 font-semibold">Foto</th>
                    <th className="px-4 py-3 font-semibold">NIP</th>
                    <th className="px-4 py-3 font-semibold">Nama Lengkap</th>
                    {isAdmin && <th className="px-4 py-3 font-semibold">Fakultas</th>}
                    <th className="px-4 py-3 font-semibold">Prodi</th>
                    <th className="px-4 py-3 font-semibold text-right">Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  {isLoading ? (
                    Array.from({ length: 5 }).map((_, i) => (
                      <tr key={i} className="border-b border-border/50 text-xs">
                        <td className="px-4 py-3">
                          <Skeleton className="h-8 w-8 rounded-full" />
                        </td>
                        <td className="px-4 py-3">
                          <Skeleton className="h-4 w-28 rounded font-mono" />
                        </td>
                        <td className="px-4 py-3">
                          <Skeleton className="h-4 w-40 rounded" />
                        </td>
                        {isAdmin && (
                          <td className="px-4 py-3">
                            <Skeleton className="h-4 w-36 rounded" />
                          </td>
                        )}
                        <td className="px-4 py-3">
                          <Skeleton className="h-4 w-32 rounded" />
                        </td>
                        <td className="px-4 py-3 text-right flex items-center justify-end gap-1.5">
                          <Skeleton className="h-8 w-8 rounded" />
                          <Skeleton className="h-8 w-8 rounded" />
                        </td>
                      </tr>
                    ))
                  ) : filteredDosen.length > 0 ? (
                    filteredDosen.map((d, index) => (
                      <tr key={d.nip} className="border-b border-border/50 text-xs hover:bg-muted/10 transition-colors">
                        <td className="px-4 py-3">
                          <div className="h-8 w-8 rounded-full bg-muted overflow-hidden border border-border">
                            {d.photoUrl ? (
                              <img src={d.photoUrl} alt={d.nama} className="h-full w-full object-cover" />
                            ) : (
                              <div className="h-full w-full flex items-center justify-center bg-primary/10 text-primary font-bold">
                                {d.nama.charAt(0)}
                              </div>
                            )}
                          </div>
                        </td>
                        <td className="px-4 py-3 font-mono font-semibold text-muted-foreground">{d.nip}</td>
                        <td className="px-4 py-3 font-bold text-foreground">{d.nama}</td>
                        {isAdmin && <td className="px-4 py-3 text-foreground">{d.fakultas}</td>}
                        <td className="px-4 py-3 text-muted-foreground font-semibold">{d.prodi}</td>
                        <td className="px-4 py-3 text-right flex items-center justify-end gap-1.5">
                          <Button
                            onClick={() => handleOpenEditDosen(d)}
                            size="sm"
                            variant="ghost"
                            className="h-8 w-8 p-0 text-muted-foreground hover:text-foreground cursor-pointer"
                          >
                            <Edit2 className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            onClick={() => handleConfirmDelete(d)}
                            className="h-8 w-8 p-0 text-error hover:text-error/90 hover:bg-error/10 cursor-pointer"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={isAdmin ? 6 : 5} className="py-8 text-center text-xs text-muted-foreground font-semibold">
                        Tidak ada data dosen yang terdaftar.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </TabsContent>

        {/* Tab Content: Pengajuan Data */}
        <TabsContent value="pengajuan" className="focus-visible:outline-none">
          <div className="rounded-xl border border-border bg-card shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-muted/30 text-xs font-bold text-muted-foreground uppercase border-b border-border">
                    <th className="px-4 py-3 font-semibold">NIP</th>
                    <th className="px-4 py-3 font-semibold">Nama Lengkap</th>
                    {isAdmin && <th className="px-4 py-3 font-semibold">Fakultas</th>}
                    <th className="px-4 py-3 font-semibold">Prodi</th>
                    <th className="px-4 py-3 font-semibold">Tanggal Diajukan</th>
                    <th className="px-4 py-3 font-semibold text-right">Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  {isLoading ? (
                    Array.from({ length: 3 }).map((_, i) => (
                      <tr key={i} className="border-b border-border/50 text-xs">
                        <td className="px-4 py-3">
                          <Skeleton className="h-4 w-28 rounded font-mono" />
                        </td>
                        <td className="px-4 py-3">
                          <Skeleton className="h-4 w-40 rounded" />
                        </td>
                        {isAdmin && (
                          <td className="px-4 py-3">
                            <Skeleton className="h-4 w-36 rounded" />
                          </td>
                        )}
                        <td className="px-4 py-3">
                          <Skeleton className="h-4 w-32 rounded" />
                        </td>
                        <td className="px-4 py-3">
                          <Skeleton className="h-4 w-24 rounded" />
                        </td>
                        <td className="px-4 py-3 text-right flex items-center justify-end gap-1.5">
                          <Skeleton className="h-7 w-16 rounded" />
                          <Skeleton className="h-7 w-16 rounded" />
                          <Skeleton className="h-7 w-7 rounded" />
                        </td>
                      </tr>
                    ))
                  ) : filteredPengajuan.length > 0 ? (
                    filteredPengajuan.map((p) => (
                      <tr key={p.id} className="border-b border-border/50 text-xs hover:bg-muted/10 transition-colors">
                        <td className="px-4 py-3 font-mono font-semibold text-muted-foreground">{p.nip}</td>
                        <td className="px-4 py-3 font-bold text-foreground">{p.nama}</td>
                        {isAdmin && <td className="px-4 py-3 text-foreground">{p.fakultas}</td>}
                        <td className="px-4 py-3 text-muted-foreground font-semibold">{p.prodi}</td>
                        <td className="px-4 py-3 text-muted-foreground">
                          {new Date(p.submittedAt).toLocaleDateString("id-ID", {
                            dateStyle: "medium",
                          })}
                        </td>
                        <td className="px-4 py-3 text-right flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => handleAcceptPengajuan(p)}
                            className="h-7 rounded bg-success/10 px-2.5 text-xs font-bold text-success hover:bg-success/20 transition-all cursor-pointer"
                          >
                            Accept
                          </button>
                          <button
                            onClick={() => handleDeclinePengajuan(p)}
                            className="h-7 rounded bg-error/10 px-2.5 text-xs font-bold text-error hover:bg-error/20 transition-all cursor-pointer"
                          >
                            Decline
                          </button>
                          <Button
                            onClick={() => handleOpenEdit(p)}
                            size="sm"
                            variant="ghost"
                            className="h-7 w-7 p-0 text-muted-foreground hover:text-foreground cursor-pointer"
                          >
                            <Edit2 className="h-3.5 w-3.5" />
                          </Button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={isAdmin ? 6 : 5} className="py-8 text-center text-xs text-muted-foreground font-semibold">
                        Tidak ada pengajuan data dosen baru saat ini.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </TabsContent>
      </Tabs>

      {/* Dialog: Tambah Dosen Baru */}
      <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
        <DialogContent className="sm:max-w-lg bg-card border border-border p-6 rounded-xl">
          <DialogHeader>
            <DialogTitle className="text-sm font-bold text-foreground uppercase tracking-wider">
              Tambah Dosen Baru
            </DialogTitle>
          </DialogHeader>

          <form onSubmit={handleAddDosen} className="space-y-4 py-3">
            <Field>
              <FieldLabel>
                <FieldTitle>NIP Dosen <span className="text-error">*</span></FieldTitle>
              </FieldLabel>
              <Input
                type="text"
                required
                placeholder="Masukkan NIP dosen..."
                value={addNip}
                onChange={(e) => setAddNip(e.target.value)}
                className="h-10 text-xs border border-border rounded-lg bg-transparent px-3 text-foreground font-mono"
              />
            </Field>

            <Field>
              <FieldLabel>
                <FieldTitle>Nama Dosen <span className="text-error">*</span></FieldTitle>
              </FieldLabel>
              <Input
                type="text"
                required
                placeholder="Masukkan nama lengkap beserta gelar..."
                value={addNama}
                onChange={(e) => setAddNama(e.target.value)}
                className="h-10 text-xs border border-border rounded-lg bg-transparent px-3 text-foreground"
              />
            </Field>

            <Field>
              <FieldLabel>
                <FieldTitle>Fakultas <span className="text-error">*</span></FieldTitle>
              </FieldLabel>
              {isAdmin ? (
                <Select
                  value={addFaculty}
                  onValueChange={(val) => {
                    setAddFaculty(val);
                    const allowed = facultyProdiMap[val] || [];
                    setAddProdi(allowed[0] || "");
                  }}
                >
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
              ) : (
                <Input
                  type="text"
                  disabled
                  value={addFaculty}
                  className="h-10 text-xs border border-border rounded-lg bg-muted px-3 text-muted-foreground font-semibold"
                />
              )}
            </Field>

            <Field>
              <FieldLabel>
                <FieldTitle>Program Studi <span className="text-error">*</span></FieldTitle>
              </FieldLabel>
              <Select value={addProdi} onValueChange={setAddProdi}>
                <SelectTrigger className="w-full bg-card border border-border rounded-lg px-3 py-2 text-xs font-semibold focus:outline-none focus:border-primary cursor-pointer justify-between">
                  <SelectValue placeholder="Pilih Program Studi" />
                </SelectTrigger>
                <SelectContent>
                  {(facultyProdiMap[addFaculty] || prodis).map((p) => (
                    <SelectItem key={p} value={p} className="text-xs font-semibold cursor-pointer">
                      {p}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>

            {/* Input Foto (Opsional, Upload Gambar) */}
            <Field>
              <FieldLabel>
                <FieldTitle>Foto Dosen (Opsional)</FieldTitle>
              </FieldLabel>
              <div className="flex flex-col sm:flex-row items-center gap-4 p-3 bg-muted/10 border border-border rounded-lg">
                <div className="h-28 w-24 rounded-lg border border-border overflow-hidden bg-muted flex items-center justify-center shrink-0 relative group shadow-sm">
                  {addPhotoUrl ? (
                    <>
                      <img src={addPhotoUrl} alt="Preview" className="h-full w-full object-cover" />
                      <button
                        type="button"
                        onClick={() => setAddPhotoUrl("")}
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
                            setAddPhotoUrl(reader.result as string);
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
                onClick={() => setIsAddOpen(false)}
                className="text-xs font-semibold h-9 rounded-lg"
              >
                Batal
              </Button>
              <Button
                type="submit"
                className="bg-primary text-primary-foreground text-xs font-semibold h-9 rounded-lg hover:bg-primary/90 cursor-pointer"
              >
                Tambah Dosen
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
      
      {/* Dialog: Edit Pengajuan */}
      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent className="sm:max-w-lg bg-card border border-border p-6 rounded-xl">
          <DialogHeader>
            <DialogTitle className="text-sm font-bold text-foreground uppercase tracking-wider">
              Edit Data Pengajuan Dosen
            </DialogTitle>
          </DialogHeader>

          {editingPengajuan && (
            <form onSubmit={handleSaveEdit} className="space-y-4 py-3">
              <Field>
                <FieldLabel>
                  <FieldTitle>NIP Dosen <span className="text-error">*</span></FieldTitle>
                </FieldLabel>
                <Input
                  type="text"
                  required
                  value={editNip}
                  onChange={(e) => setEditNip(e.target.value)}
                  className="h-10 text-xs border border-border rounded-lg bg-transparent px-3 text-foreground font-mono font-semibold"
                />
              </Field>

              <Field>
                <FieldLabel>
                  <FieldTitle>Nama Dosen <span className="text-error">*</span></FieldTitle>
                </FieldLabel>
                <Input
                  type="text"
                  required
                  value={editNama}
                  onChange={(e) => setEditNama(e.target.value)}
                  className="h-10 text-xs border border-border rounded-lg bg-transparent px-3 text-foreground"
                />
              </Field>

              <Field>
                <FieldLabel>
                  <FieldTitle>Fakultas <span className="text-error">*</span></FieldTitle>
                </FieldLabel>
                {isAdmin ? (
                  <Select
                    value={editFaculty}
                    onValueChange={(val) => {
                      setEditFaculty(val);
                      const allowed = facultyProdiMap[val] || [];
                      setEditProdi(allowed[0] || "");
                    }}
                  >
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
                ) : (
                  <Input
                    type="text"
                    disabled
                    value={editFaculty}
                    className="h-10 text-xs border border-border rounded-lg bg-muted px-3 text-muted-foreground font-semibold"
                  />
                )}
              </Field>

              <Field>
                <FieldLabel>
                  <FieldTitle>Program Studi <span className="text-error">*</span></FieldTitle>
                </FieldLabel>
                <Select value={editProdi} onValueChange={setEditProdi}>
                  <SelectTrigger className="w-full bg-card border border-border rounded-lg px-3 py-2 text-xs font-semibold focus:outline-none focus:border-primary cursor-pointer justify-between">
                    <SelectValue placeholder="Pilih Program Studi" />
                  </SelectTrigger>
                  <SelectContent>
                    {(facultyProdiMap[editFaculty] || prodis).map((p) => (
                      <SelectItem key={p} value={p} className="text-xs font-semibold cursor-pointer">
                        {p}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </Field>

              {/* Input Foto (Opsional, Upload Gambar) */}
              <Field>
                <FieldLabel>
                  <FieldTitle>Foto Dosen (Opsional)</FieldTitle>
                </FieldLabel>
                <div className="flex flex-col sm:flex-row items-center gap-4 p-3 bg-muted/10 border border-border rounded-lg">
                  <div className="h-28 w-24 rounded-lg border border-border overflow-hidden bg-muted flex items-center justify-center shrink-0 relative group shadow-sm">
                    {editPhotoUrl ? (
                      <>
                        <img src={editPhotoUrl} alt="Preview" className="h-full w-full object-cover" />
                        <button
                          type="button"
                          onClick={() => setEditPhotoUrl("")}
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
                              setEditPhotoUrl(reader.result as string);
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
                  onClick={() => setIsEditOpen(false)}
                  className="text-xs font-semibold h-9 rounded-lg"
                >
                  Batal
                </Button>
                <Button
                  type="submit"
                  className="bg-primary text-primary-foreground text-xs font-semibold h-9 rounded-lg hover:bg-primary/90 cursor-pointer"
                >
                  Simpan Perubahan
                </Button>
              </DialogFooter>
            </form>
          )}
        </DialogContent>
      </Dialog>

      {/* Dialog: Edit Data Dosen */}
      <Dialog open={isEditDosenOpen} onOpenChange={setIsEditDosenOpen}>
        <DialogContent className="sm:max-w-lg bg-card border border-border p-6 rounded-xl">
          <DialogHeader>
            <DialogTitle className="text-sm font-bold text-foreground uppercase tracking-wider">
              Edit Data Dosen
            </DialogTitle>
          </DialogHeader>

          {editingDosen && (
            <form onSubmit={handleSaveEditDosen} className="space-y-4 py-3">
              <Field>
                <FieldLabel>
                  <FieldTitle>NIP Dosen <span className="text-error">*</span></FieldTitle>
                </FieldLabel>
                <Input
                  type="text"
                  required
                  value={editDosenNip}
                  onChange={(e) => setEditDosenNip(e.target.value)}
                  className="h-10 text-xs border border-border rounded-lg bg-transparent px-3 text-foreground font-mono font-semibold"
                />
              </Field>

              <Field>
                <FieldLabel>
                  <FieldTitle>Nama Dosen <span className="text-error">*</span></FieldTitle>
                </FieldLabel>
                <Input
                  type="text"
                  required
                  value={editDosenNama}
                  onChange={(e) => setEditDosenNama(e.target.value)}
                  className="h-10 text-xs border border-border rounded-lg bg-transparent px-3 text-foreground"
                />
              </Field>

              <Field>
                <FieldLabel>
                  <FieldTitle>Fakultas <span className="text-error">*</span></FieldTitle>
                </FieldLabel>
                {isAdmin ? (
                  <Select
                    value={editDosenFaculty}
                    onValueChange={(val) => {
                      setEditDosenFaculty(val);
                      const allowed = facultyProdiMap[val] || [];
                      setEditDosenProdi(allowed[0] || "");
                    }}
                  >
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
                ) : (
                  <Input
                    type="text"
                    disabled
                    value={editDosenFaculty}
                    className="h-10 text-xs border border-border rounded-lg bg-muted px-3 text-muted-foreground font-semibold"
                  />
                )}
              </Field>

              <Field>
                <FieldLabel>
                  <FieldTitle>Program Studi <span className="text-error">*</span></FieldTitle>
                </FieldLabel>
                <Select value={editDosenProdi} onValueChange={setEditDosenProdi}>
                  <SelectTrigger className="w-full bg-card border border-border rounded-lg px-3 py-2 text-xs font-semibold focus:outline-none focus:border-primary cursor-pointer justify-between">
                    <SelectValue placeholder="Pilih Program Studi" />
                  </SelectTrigger>
                  <SelectContent>
                    {(facultyProdiMap[editDosenFaculty] || prodis).map((p) => (
                      <SelectItem key={p} value={p} className="text-xs font-semibold cursor-pointer">
                        {p}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </Field>

              {/* Input Foto (Opsional, Upload Gambar) */}
              <Field>
                <FieldLabel>
                  <FieldTitle>Foto Dosen (Opsional)</FieldTitle>
                </FieldLabel>
                <div className="flex flex-col sm:flex-row items-center gap-4 p-3 bg-muted/10 border border-border rounded-lg">
                  <div className="h-28 w-24 rounded-lg border border-border overflow-hidden bg-muted flex items-center justify-center shrink-0 relative group shadow-sm">
                    {editDosenPhotoUrl ? (
                      <>
                        <img src={editDosenPhotoUrl} alt="Preview" className="h-full w-full object-cover" />
                        <button
                          type="button"
                          onClick={() => setEditDosenPhotoUrl("")}
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
                              setEditDosenPhotoUrl(reader.result as string);
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
                  onClick={() => setIsEditDosenOpen(false)}
                  className="text-xs font-semibold h-9 rounded-lg"
                >
                  Batal
                </Button>
                <Button
                  type="submit"
                  className="bg-primary text-primary-foreground text-xs font-semibold h-9 rounded-lg hover:bg-primary/90 cursor-pointer"
                >
                  Simpan Perubahan
                </Button>
              </DialogFooter>
            </form>
          )}
        </DialogContent>
      </Dialog>

      {/* Alert Dialog: Konfirmasi Hapus Dosen */}
      <AlertDialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
        <AlertDialogContent className="bg-card border border-border p-6 rounded-xl sm:max-w-md">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-xs font-bold text-foreground tracking-wider uppercase">
              Hapus Data Dosen
            </AlertDialogTitle>
            <AlertDialogDescription className="text-xs text-muted-foreground mt-2">
              Apakah Anda yakin ingin menghapus data dosen <span className="font-bold text-foreground">"{dosenToDelete?.nama}"</span> ({dosenToDelete?.nip})? Tindakan ini tidak dapat dibatalkan.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="flex justify-end gap-2 pt-2">
            <AlertDialogCancel className="text-xs font-semibold h-9 rounded-lg border border-border bg-card text-foreground hover:bg-muted cursor-pointer">
              Batal
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (dosenToDelete) {
                  handleDeleteDosen(dosenToDelete.nip, dosenToDelete.nama);
                }
              }}
              className="bg-error text-error-foreground hover:bg-error/90 text-xs font-semibold h-9 rounded-lg cursor-pointer"
            >
              Hapus Dosen
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
