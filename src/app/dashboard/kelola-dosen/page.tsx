"use client";

import React, { useState, useEffect } from "react";
import {
  Plus,
  Trash2,
  Edit2,
  Search,
  Loader2,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
} from "lucide-react";
import Link from "next/link";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import { Field, FieldLabel, FieldTitle } from "@/components/ui/field";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
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
import { DosenPengajuan } from "@/types/dosen";
import { toast } from "sonner";
import {
  useGetLecturerListQuery,
  useCreateLecturerMutation,
  useUpdateLecturerMutation,
  useDeleteLecturerMutation,
  useApproveLecturerMutation,
  useRejectLecturerMutation,
} from "@/store/services/dosenApi";
import { useGetStudyProgramsQuery } from "@/store/services/studyProgramApi";
import { useGetInstitutesQuery } from "@/store/services/instituteApi";

interface CustomErrorObject {
  data?:
    | {
        message?: string;
        error?: string;
      }
    | string;
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

export default function DosenManagementPage(): React.JSX.Element {
  const [isAdmin, setIsAdmin] = useState(false);
  const [isAllowed, setIsAllowed] = useState(true);
  const [userFaculty, setUserFaculty] = useState(
    "Fakultas Sains dan Teknologi",
  );
  const [isLoading, setIsLoading] = useState(true);

  // Filter state
  const [filterProdi, setFilterProdi] = useState("Semua");
  const [filterFaculty, setFilterFaculty] = useState("Semua");
  const [searchQuery, setSearchQuery] = useState("");
  const [activeSearchQuery, setActiveSearchQuery] = useState("");

  // Pagination states
  const [approvedPage, setApprovedPage] = useState<number>(1);
  const [pendingPage, setPendingPage] = useState<number>(1);
  const limit = 10;

  // Reset page to 1 when filters or search change
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setApprovedPage(1);
    setPendingPage(1);
  }, [activeSearchQuery, filterProdi, filterFaculty]);

  const handleSearch = (): void => {
    setActiveSearchQuery(searchQuery);
  };

  const handleResetSearch = (): void => {
    setSearchQuery("");
    setActiveSearchQuery("");
  };

  // RTK Queries
  const {
    data: approvedResponse,
    isFetching: isApprovedFetching,
    isLoading: isApprovedLoading,
  } = useGetLecturerListQuery({
    status: "approved",
    name: activeSearchQuery.trim() || undefined,
    study_program: filterProdi !== "Semua" ? filterProdi : undefined,
    institute: filterFaculty !== "Semua" ? filterFaculty : undefined,
    page: approvedPage,
    limit,
  });

  const {
    data: pendingResponse,
    isFetching: isPendingFetching,
    isLoading: isPendingLoading,
  } = useGetLecturerListQuery({
    status: "pending",
    name: activeSearchQuery.trim() || undefined,
    study_program: filterProdi !== "Semua" ? filterProdi : undefined,
    institute: filterFaculty !== "Semua" ? filterFaculty : undefined,
    page: pendingPage,
    limit,
  });

  const { data: studyProgramsResponse } = useGetStudyProgramsQuery();
  const studyProgramList = studyProgramsResponse?.data || [];

  const { data: institutesResponse } = useGetInstitutesQuery();
  const instituteList = institutesResponse?.data || [];

  // Mutations
  const [createLecturer, { isLoading: isAddLoading }] =
    useCreateLecturerMutation();
  const [updateLecturer, { isLoading: isUpdateLoading }] =
    useUpdateLecturerMutation();
  const [deleteLecturer, { isLoading: isDeleteLoading }] =
    useDeleteLecturerMutation();
  const [approveLecturer, { isLoading: isApproveLoading }] =
    useApproveLecturerMutation();
  const [rejectLecturer, { isLoading: isRejectLoading }] =
    useRejectLecturerMutation();

  const isMutationLoading =
    isAddLoading ||
    isUpdateLoading ||
    isDeleteLoading ||
    isApproveLoading ||
    isRejectLoading;
  const isPageLoading =
    isLoading ||
    isApprovedLoading ||
    isPendingLoading ||
    isApprovedFetching ||
    isPendingFetching;

  // Derive Dynamic Fakultas and Prodi list
  const realFaculties = instituteList.map((inst) => inst.name);

  const filteredProdis =
    filterFaculty === "Semua"
      ? studyProgramList.map((p) => p.name)
      : studyProgramList
          .filter((p) => p.institute?.name === filterFaculty)
          .map((p) => p.name);

  const displayFilteredProdis =
    filteredProdis.length > 0 ? filteredProdis : ["Semua"];

  // Add Dosen Dialog States
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [addNip, setAddNip] = useState("");
  const [addNama, setAddNama] = useState("");
  const [addFaculty, setAddFaculty] = useState("");
  const [addProdi, setAddProdi] = useState("");
  const [addEmail, setAddEmail] = useState("");

  // Delete Dosen Dialog States
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [dosenToDelete, setDosenToDelete] = useState<DosenPengajuan | null>(
    null,
  );

  // Edit Dosen Dialog States
  const [isEditDosenOpen, setIsEditDosenOpen] = useState(false);
  const [editingDosen, setEditingDosen] = useState<DosenPengajuan | null>(null);
  const [editDosenNip, setEditDosenNip] = useState("");
  const [editDosenNama, setEditDosenNama] = useState("");
  const [editDosenFaculty, setEditDosenFaculty] = useState("");
  const [editDosenProdi, setEditDosenProdi] = useState("");
  const [editDosenEmail, setEditDosenEmail] = useState("");

  // Edit Pengajuan Dialog States
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [editingPengajuan, setEditingPengajuan] =
    useState<DosenPengajuan | null>(null);
  const [editNip, setEditNip] = useState("");
  const [editNama, setEditNama] = useState("");
  const [editFaculty, setEditFaculty] = useState("");
  const [editProdi, setEditProdi] = useState("");
  const [editEmail, setEditEmail] = useState("");

  // Load Session
  useEffect(() => {
    const sessionTimer = setTimeout(() => {
      const raw = localStorage.getItem("userSession");
      if (raw) {
        try {
          const session = JSON.parse(raw);
          if (session.role === "Auditor" || session.role === "Assessor") {
            setIsAllowed(false);
          } else if (
            session.role === "Administrator" ||
            session.username === "admin"
          ) {
            setIsAdmin(true);
          } else {
            setUserFaculty("Fakultas Sains dan Teknologi");
          }
        } catch {
          // empty
        }
      }
    }, 0);

    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 700);
    return () => {
      clearTimeout(sessionTimer);
      clearTimeout(timer);
    };
  }, []);

  // Map API LecturerModel to legacy structure
  const filteredDosen: DosenPengajuan[] = (approvedResponse?.data || []).map(
    (l) => ({
      id: l.id,
      nip: l.nip,
      nama: l.name,
      fakultas: l.institute?.name || "",
      prodi: l.study_program?.name || "",
      email: l.email,
      status: "approved",
      submittedAt: new Date().toISOString(),
    }),
  );

  const filteredPengajuan: DosenPengajuan[] = (pendingResponse?.data || []).map(
    (l) => ({
      id: l.id,
      nip: l.nip,
      nama: l.name,
      fakultas: l.institute?.name || "",
      prodi: l.study_program?.name || "",
      email: l.email,
      status: "pending",
      submittedAt: new Date().toISOString(),
    }),
  );

  const totalApproved = approvedResponse?.meta?.total_items || 0;
  const totalApprovedPages = approvedResponse?.meta?.total_pages || 1;
  const startApproved = totalApproved === 0 ? 0 : (approvedPage - 1) * 10 + 1;
  const endApproved = Math.min(approvedPage * 10, totalApproved);

  const totalPending = pendingResponse?.meta?.total_items || 0;
  const totalPendingPages = pendingResponse?.meta?.total_pages || 1;
  const startPending = totalPending === 0 ? 0 : (pendingPage - 1) * 10 + 1;
  const endPending = Math.min(pendingPage * 10, totalPending);

  const validateUinEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) return false;
    const domain = email.split("@")[1].toLowerCase();
    return domain === "uin-suka.ac.id" || domain.endsWith(".uin-suka.ac.id");
  };

  // Add Dosen
  const handleOpenAdd = (): void => {
    setAddNip("");
    setAddNama("");
    const defaultFac =
      filterFaculty !== "Semua" ? filterFaculty : realFaculties[0] || "";
    setAddFaculty(defaultFac);

    const allowed = studyProgramList.filter(
      (p) => p.institute?.name === defaultFac,
    );
    setAddProdi(allowed[0]?.name || studyProgramList[0]?.name || "");
    setAddEmail("");
    setIsAddOpen(true);
  };

  const handleAddFacultyChange = (val: string): void => {
    setAddFaculty(val);
    const allowed = studyProgramList.filter((p) => p.institute?.name === val);
    setAddProdi(allowed[0]?.name || "");
  };

  const handleEditDosenFacultyChange = (val: string): void => {
    setEditDosenFaculty(val);
    const allowed = studyProgramList.filter((p) => p.institute?.name === val);
    setEditDosenProdi(allowed[0]?.name || "");
  };

  const handleEditFacultyChange = (val: string): void => {
    setEditFaculty(val);
    const allowed = studyProgramList.filter((p) => p.institute?.name === val);
    setEditProdi(allowed[0]?.name || "");
  };

  const handleAddDosen = async (e: React.FormEvent): Promise<void> => {
    e.preventDefault();
    if (!addNip.trim() || !addNama.trim() || !addEmail.trim()) {
      toast.error("NIP, Nama, dan Email wajib diisi.");
      return;
    }

    if (!validateUinEmail(addEmail.trim())) {
      toast.error(
        "Email harus menggunakan domain resmi uin-suka.ac.id atau subdomainnya.",
      );
      return;
    }

    const matchedProdi = studyProgramList.find((p) => p.name === addProdi);
    if (!matchedProdi) {
      toast.error("Program studi tidak valid atau belum terdaftar di sistem.");
      return;
    }

    try {
      await createLecturer({
        name: addNama.trim(),
        nip: addNip.trim(),
        email: addEmail.trim(),
        study_program_id: matchedProdi.id,
      }).unwrap();
      toast.success(`Dosen "${addNama}" berhasil ditambahkan!`);
      setIsAddOpen(false);
    } catch (err: unknown) {
      toast.error(extractErrorMessage(err));
    }
  };

  // Delete Dosen
  const handleDeleteDosen = async (id: string, name: string): Promise<void> => {
    try {
      await deleteLecturer(id).unwrap();
      toast.success(`Data dosen "${name}" telah dihapus.`);
      setIsDeleteOpen(false);
    } catch (err: unknown) {
      toast.error(extractErrorMessage(err));
    }
  };

  const handleConfirmDelete = (dosen: DosenPengajuan): void => {
    setDosenToDelete(dosen);
    setIsDeleteOpen(true);
  };

  // Accept Submission
  const handleAcceptPengajuan = async (
    pengajuan: DosenPengajuan,
  ): Promise<void> => {
    try {
      await approveLecturer(pengajuan.id).unwrap();
      toast.success(`Pengajuan dosen "${pengajuan.nama}" telah disetujui.`);
    } catch (err: unknown) {
      toast.error(extractErrorMessage(err));
    }
  };

  // Decline Submission
  const handleDeclinePengajuan = async (
    pengajuan: DosenPengajuan,
  ): Promise<void> => {
    try {
      await rejectLecturer(pengajuan.id).unwrap();
      toast.info(`Pengajuan dosen "${pengajuan.nama}" telah ditolak.`);
    } catch (err: unknown) {
      toast.error(extractErrorMessage(err));
    }
  };

  // Prepare Edit dialog
  const handleOpenEdit = (pengajuan: DosenPengajuan): void => {
    setEditingPengajuan(pengajuan);
    setEditNip(pengajuan.nip);
    setEditNama(pengajuan.nama);
    setEditFaculty(pengajuan.fakultas || realFaculties[0]);
    setEditProdi(pengajuan.prodi);
    setEditEmail(pengajuan.email || "");
    setIsEditOpen(true);
  };

  // Prepare Edit Dosen dialog
  const handleOpenEditDosen = (dosen: DosenPengajuan): void => {
    setEditingDosen(dosen);
    setEditDosenNip(dosen.nip);
    setEditDosenNama(dosen.nama);
    setEditDosenFaculty(dosen.fakultas || realFaculties[0]);
    setEditDosenProdi(dosen.prodi);
    setEditDosenEmail(dosen.email || "");
    setIsEditDosenOpen(true);
  };

  // Save Edit Dosen
  const handleSaveEditDosen = async (e: React.FormEvent): Promise<void> => {
    e.preventDefault();
    if (!editingDosen) return;

    if (
      !editDosenNip.trim() ||
      !editDosenNama.trim() ||
      !editDosenEmail.trim()
    ) {
      toast.error("NIP, Nama, dan Email wajib diisi.");
      return;
    }

    if (!validateUinEmail(editDosenEmail.trim())) {
      toast.error(
        "Email harus menggunakan domain resmi uin-suka.ac.id atau subdomainnya.",
      );
      return;
    }

    const matchedProdi = studyProgramList.find(
      (p) => p.name === editDosenProdi,
    );
    if (!matchedProdi) {
      toast.error("Program studi tidak valid atau belum terdaftar di sistem.");
      return;
    }

    try {
      await updateLecturer({
        id: editingDosen.id,
        body: {
          name: editDosenNama.trim(),
          nip: editDosenNip.trim(),
          email: editDosenEmail.trim(),
          study_program_id: matchedProdi.id,
        },
      }).unwrap();
      toast.success("Data dosen berhasil diperbarui!");
      setIsEditDosenOpen(false);
    } catch (err: unknown) {
      toast.error(extractErrorMessage(err));
    }
  };

  // Save Edit
  const handleSaveEdit = async (e: React.FormEvent): Promise<void> => {
    e.preventDefault();
    if (!editingPengajuan) return;

    if (!editNama.trim() || !editEmail.trim()) {
      toast.error("Nama dan Email wajib diisi.");
      return;
    }

    if (!validateUinEmail(editEmail.trim())) {
      toast.error(
        "Email harus menggunakan domain resmi uin-suka.ac.id atau subdomainnya.",
      );
      return;
    }

    const matchedProdi = studyProgramList.find((p) => p.name === editProdi);
    if (!matchedProdi) {
      toast.error("Program studi tidak valid atau belum terdaftar di sistem.");
      return;
    }

    try {
      await updateLecturer({
        id: editingPengajuan.id,
        body: {
          name: editNama.trim(),
          nip: editNip.trim(),
          email: editEmail.trim(),
          study_program_id: matchedProdi.id,
        },
      }).unwrap();
      toast.success("Pengajuan dosen berhasil diperbarui!");
      setIsEditOpen(false);
    } catch (err: unknown) {
      toast.error(extractErrorMessage(err));
    }
  };

  // Filter prodi list for dialog selects
  const addProdiList = studyProgramList.filter(
    (p) => !addFaculty || p.institute?.name === addFaculty,
  );

  const editDosenProdiList = studyProgramList.filter(
    (p) => !editDosenFaculty || p.institute?.name === editDosenFaculty,
  );

  const editProdiList = studyProgramList.filter(
    (p) => !editFaculty || p.institute?.name === editFaculty,
  );
  if (!isAllowed) {
    return (
      <div className="p-6 border border-border bg-card rounded-xl text-center space-y-4">
        <h2 className="text-sm font-bold text-foreground uppercase tracking-wider">
          Akses Ditolak
        </h2>
        <p className="text-xs text-muted-foreground">
          Peran Anda tidak diizinkan untuk mengakses halaman pengaturan dosen.
        </p>
        <Link
          href="/dashboard"
          className="inline-block text-xs font-semibold text-primary underline"
        >
          Kembali ke Dashboard
        </Link>
      </div>
    );
  }

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
            <TabsTrigger
              value="data-dosen"
              className="text-xs font-semibold rounded-md py-1.5 cursor-pointer"
            >
              Data Dosen
            </TabsTrigger>
            <TabsTrigger
              value="pengajuan"
              className="text-xs font-semibold rounded-md py-1.5 cursor-pointer"
            >
              Pengajuan Data ({filteredPengajuan.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent
            value="data-dosen"
            className="mt-0 focus-visible:outline-none"
          >
            <Button
              onClick={handleOpenAdd}
              disabled={isMutationLoading}
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
                  <SelectItem
                    value="Semua"
                    className="text-xs font-semibold cursor-pointer"
                  >
                    Semua Prodi
                  </SelectItem>
                  {displayFilteredProdis.map((p) => (
                    <SelectItem
                      key={p}
                      value={p}
                      className="text-xs font-semibold cursor-pointer"
                    >
                      {p}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Filter Fakultas */}
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
                  <SelectItem
                    value="Semua"
                    className="text-xs font-semibold cursor-pointer"
                  >
                    Semua Fakultas
                  </SelectItem>
                  {realFaculties.map((f) => (
                    <SelectItem
                      key={f}
                      value={f}
                      className="text-xs font-semibold cursor-pointer"
                    >
                      {f}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        {/* Tab Content: Data Dosen */}
        <TabsContent value="data-dosen" className="focus-visible:outline-none">
          <div className="rounded-xl border border-border bg-card shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/30 text-xs font-bold text-muted-foreground uppercase border-b border-border">
                    <TableHead className="px-4 py-3 font-semibold">
                      NIP
                    </TableHead>
                    <TableHead className="px-4 py-3 font-semibold">
                      Nama Lengkap
                    </TableHead>
                    <TableHead className="px-4 py-3 font-semibold">
                      Fakultas
                    </TableHead>
                    <TableHead className="px-4 py-3 font-semibold">
                      Prodi
                    </TableHead>
                    <TableHead className="px-4 py-3 font-semibold text-right">
                      Aksi
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {isPageLoading ? (
                    Array.from({ length: 5 }).map((_, i) => (
                      <TableRow
                        key={i}
                        className="border-b border-border/50 text-xs"
                      >
                        <TableCell className="px-4 py-3">
                          <Skeleton className="h-4 w-28 rounded font-mono" />
                        </TableCell>
                        <TableCell className="px-4 py-3">
                          <Skeleton className="h-4 w-40 rounded" />
                        </TableCell>
                        <TableCell className="px-4 py-3">
                          <Skeleton className="h-4 w-36 rounded" />
                        </TableCell>
                        <TableCell className="px-4 py-3">
                          <Skeleton className="h-4 w-32 rounded" />
                        </TableCell>
                        <TableCell className="px-4 py-3 text-right flex items-center justify-end gap-1.5">
                          <Skeleton className="h-8 w-8 rounded" />
                          <Skeleton className="h-8 w-8 rounded" />
                        </TableCell>
                      </TableRow>
                    ))
                  ) : filteredDosen.length > 0 ? (
                    filteredDosen.map((d) => (
                      <TableRow
                        key={d.nip}
                        className="border-b border-border/50 text-xs hover:bg-muted/10 transition-colors"
                      >
                        <TableCell className="px-4 py-3 font-mono font-semibold text-muted-foreground">
                          {d.nip}
                        </TableCell>
                        <TableCell className="px-4 py-3 font-bold text-foreground">
                          {d.nama}
                        </TableCell>
                        <TableCell className="px-4 py-3 text-foreground">
                          {d.fakultas}
                        </TableCell>
                        <TableCell className="px-4 py-3 text-muted-foreground font-semibold">
                          {d.prodi}
                        </TableCell>
                        <TableCell className="px-4 py-3 text-right flex items-center justify-end gap-1.5">
                          <Button
                            onClick={() => handleOpenEditDosen(d)}
                            disabled={isMutationLoading}
                            size="sm"
                            variant="ghost"
                            className="h-8 w-8 p-0 text-muted-foreground hover:text-foreground cursor-pointer"
                          >
                            <Edit2 className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            onClick={() => handleConfirmDelete(d)}
                            disabled={isMutationLoading}
                            className="h-8 w-8 p-0 text-error hover:text-error/90 hover:bg-error/10 cursor-pointer"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell
                        colSpan={5}
                        className="py-8 text-center text-xs text-muted-foreground font-semibold"
                      >
                        Tidak ada data dosen yang terdaftar.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>

            {/* Pagination Controls */}
            <div className="flex items-center justify-between px-5 py-3 border-t border-border bg-muted/10 text-xs text-muted-foreground select-none">
              <div>
                Menampilkan{" "}
                <span className="font-semibold text-foreground">
                  {startApproved}
                </span>{" "}
                -{" "}
                <span className="font-semibold text-foreground">
                  {endApproved}
                </span>{" "}
                dari{" "}
                <span className="font-semibold text-foreground">
                  {totalApproved}
                </span>{" "}
                data
              </div>
              <div className="flex items-center gap-1.5">
                <Button
                  variant="outline"
                  size="icon"
                  className="h-8 w-8 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                  onClick={() => setApprovedPage(1)}
                  disabled={approvedPage === 1}
                >
                  <ChevronsLeft className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  className="h-8 w-8 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                  onClick={() => setApprovedPage(approvedPage - 1)}
                  disabled={approvedPage === 1}
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <span className="px-2 text-xs font-medium text-foreground">
                  Halaman {approvedPage} dari {totalApprovedPages || 1}
                </span>
                <Button
                  variant="outline"
                  size="icon"
                  className="h-8 w-8 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                  onClick={() => setApprovedPage(approvedPage + 1)}
                  disabled={
                    approvedPage === totalApprovedPages ||
                    totalApprovedPages === 0
                  }
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  className="h-8 w-8 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                  onClick={() => setApprovedPage(totalApprovedPages)}
                  disabled={
                    approvedPage === totalApprovedPages ||
                    totalApprovedPages === 0
                  }
                >
                  <ChevronsRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </TabsContent>

        {/* Tab Content: Pengajuan Data */}
        <TabsContent value="pengajuan" className="focus-visible:outline-none">
          <div className="rounded-xl border border-border bg-card shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/30 text-xs font-bold text-muted-foreground uppercase border-b border-border">
                    <TableHead className="px-4 py-3 font-semibold">
                      NIP
                    </TableHead>
                    <TableHead className="px-4 py-3 font-semibold">
                      Nama Lengkap
                    </TableHead>
                    <TableHead className="px-4 py-3 font-semibold">
                      Fakultas
                    </TableHead>
                    <TableHead className="px-4 py-3 font-semibold">
                      Prodi
                    </TableHead>
                    <TableHead className="px-4 py-3 font-semibold">
                      Tanggal Diajukan
                    </TableHead>
                    <TableHead className="px-4 py-3 font-semibold text-right">
                      Aksi
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {isPageLoading ? (
                    Array.from({ length: 3 }).map((_, i) => (
                      <TableRow
                        key={i}
                        className="border-b border-border/50 text-xs"
                      >
                        <TableCell className="px-4 py-3">
                          <Skeleton className="h-4 w-28 rounded font-mono" />
                        </TableCell>
                        <TableCell className="px-4 py-3">
                          <Skeleton className="h-4 w-40 rounded" />
                        </TableCell>
                        <TableCell className="px-4 py-3">
                          <Skeleton className="h-4 w-36 rounded" />
                        </TableCell>
                        <TableCell className="px-4 py-3">
                          <Skeleton className="h-4 w-32 rounded" />
                        </TableCell>
                        <TableCell className="px-4 py-3">
                          <Skeleton className="h-4 w-24 rounded" />
                        </TableCell>
                        <TableCell className="px-4 py-3 text-right flex items-center justify-end gap-1.5">
                          <Skeleton className="h-7 w-16 rounded" />
                          <Skeleton className="h-7 w-16 rounded" />
                          <Skeleton className="h-7 w-7 rounded" />
                        </TableCell>
                      </TableRow>
                    ))
                  ) : filteredPengajuan.length > 0 ? (
                    filteredPengajuan.map((p) => (
                      <TableRow
                        key={p.id}
                        className="border-b border-border/50 text-xs hover:bg-muted/10 transition-colors"
                      >
                        <TableCell className="px-4 py-3 font-mono font-semibold text-muted-foreground">
                          {p.nip}
                        </TableCell>
                        <TableCell className="px-4 py-3 font-bold text-foreground">
                          {p.nama}
                        </TableCell>
                        <TableCell className="px-4 py-3 text-foreground">
                          {p.fakultas}
                        </TableCell>
                        <TableCell className="px-4 py-3 text-muted-foreground font-semibold">
                          {p.prodi}
                        </TableCell>
                        <TableCell className="px-4 py-3 text-muted-foreground">
                          {new Date(p.submittedAt).toLocaleDateString("id-ID", {
                            dateStyle: "medium",
                          })}
                        </TableCell>
                        <TableCell className="px-4 py-3 text-right flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => handleAcceptPengajuan(p)}
                            disabled={isMutationLoading}
                            className="h-7 rounded bg-success/10 px-2.5 text-xs font-bold text-success hover:bg-success/20 transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            Accept
                          </button>
                          <button
                            onClick={() => handleDeclinePengajuan(p)}
                            disabled={isMutationLoading}
                            className="h-7 rounded bg-error/10 px-2.5 text-xs font-bold text-error hover:bg-error/20 transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            Decline
                          </button>
                          <Button
                            onClick={() => handleOpenEdit(p)}
                            disabled={isMutationLoading}
                            size="sm"
                            variant="ghost"
                            className="h-7 w-7 p-0 text-muted-foreground hover:text-foreground cursor-pointer"
                          >
                            <Edit2 className="h-3.5 w-3.5" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell
                        colSpan={6}
                        className="py-8 text-center text-xs text-muted-foreground font-semibold"
                      >
                        Tidak ada pengajuan data dosen baru saat ini.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>

            {/* Pagination Controls */}
            <div className="flex items-center justify-between px-5 py-3 border-t border-border bg-muted/10 text-xs text-muted-foreground select-none">
              <div>
                Menampilkan{" "}
                <span className="font-semibold text-foreground">
                  {startPending}
                </span>{" "}
                -{" "}
                <span className="font-semibold text-foreground">
                  {endPending}
                </span>{" "}
                dari{" "}
                <span className="font-semibold text-foreground">
                  {totalPending}
                </span>{" "}
                data
              </div>
              <div className="flex items-center gap-1.5">
                <Button
                  variant="outline"
                  size="icon"
                  className="h-8 w-8 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                  onClick={() => setPendingPage(1)}
                  disabled={pendingPage === 1}
                >
                  <ChevronsLeft className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  className="h-8 w-8 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                  onClick={() => setPendingPage(pendingPage - 1)}
                  disabled={pendingPage === 1}
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <span className="px-2 text-xs font-medium text-foreground">
                  Halaman {pendingPage} dari {totalPendingPages || 1}
                </span>
                <Button
                  variant="outline"
                  size="icon"
                  className="h-8 w-8 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                  onClick={() => setPendingPage(pendingPage + 1)}
                  disabled={
                    pendingPage === totalPendingPages || totalPendingPages === 0
                  }
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  className="h-8 w-8 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                  onClick={() => setPendingPage(totalPendingPages)}
                  disabled={
                    pendingPage === totalPendingPages || totalPendingPages === 0
                  }
                >
                  <ChevronsRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </TabsContent>
      </Tabs>

      {/* Dialog: Tambah Dosen Baru */}
      <Dialog
        open={isAddOpen}
        onOpenChange={(val) => {
          if (isAddLoading) return;
          setIsAddOpen(val);
        }}
      >
        <DialogContent className="sm:max-w-lg bg-card border border-border p-6 rounded-xl">
          <DialogHeader>
            <DialogTitle className="text-sm font-bold text-foreground uppercase tracking-wider">
              Tambah Dosen Baru
            </DialogTitle>
          </DialogHeader>

          <form onSubmit={handleAddDosen} className="space-y-4 py-3">
            <Field>
              <FieldLabel>
                <FieldTitle>
                  NIP Dosen <span className="text-error">*</span>
                </FieldTitle>
              </FieldLabel>
              <Input
                type="text"
                required
                disabled={isAddLoading}
                placeholder="Masukkan NIP dosen..."
                value={addNip}
                onChange={(e) => setAddNip(e.target.value)}
                className="h-10 text-xs border border-border rounded-lg bg-transparent px-3 text-foreground font-mono disabled:opacity-50 disabled:cursor-not-allowed"
              />
            </Field>

            <Field>
              <FieldLabel>
                <FieldTitle>
                  Nama Dosen <span className="text-error">*</span>
                </FieldTitle>
              </FieldLabel>
              <Input
                type="text"
                required
                disabled={isAddLoading}
                placeholder="Masukkan nama lengkap beserta gelar..."
                value={addNama}
                onChange={(e) => setAddNama(e.target.value)}
                className="h-10 text-xs border border-border rounded-lg bg-transparent px-3 text-foreground disabled:opacity-50 disabled:cursor-not-allowed"
              />
            </Field>

            <Field>
              <FieldLabel>
                <FieldTitle>
                  Fakultas <span className="text-error">*</span>
                </FieldTitle>
              </FieldLabel>
              <Select
                value={addFaculty}
                disabled={isAddLoading}
                onValueChange={handleAddFacultyChange}
              >
                <SelectTrigger className="w-full bg-card border border-border rounded-lg px-3 py-2 text-xs font-semibold focus:outline-none focus:border-primary cursor-pointer justify-between disabled:opacity-50 disabled:cursor-not-allowed">
                  <SelectValue placeholder="Pilih Fakultas" />
                </SelectTrigger>
                <SelectContent>
                  {realFaculties.map((f) => (
                    <SelectItem
                      key={f}
                      value={f}
                      className="text-xs font-semibold cursor-pointer"
                    >
                      {f}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>

            <Field>
              <FieldLabel>
                <FieldTitle>
                  Program Studi <span className="text-error">*</span>
                </FieldTitle>
              </FieldLabel>
              <Select
                value={addProdi}
                onValueChange={setAddProdi}
                disabled={isAddLoading}
              >
                <SelectTrigger className="w-full bg-card border border-border rounded-lg px-3 py-2 text-xs font-semibold focus:outline-none focus:border-primary cursor-pointer justify-between disabled:opacity-50 disabled:cursor-not-allowed">
                  <SelectValue placeholder="Pilih Program Studi" />
                </SelectTrigger>
                <SelectContent>
                  {addProdiList.map((p) => (
                    <SelectItem
                      key={p.name}
                      value={p.name}
                      className="text-xs font-semibold cursor-pointer"
                    >
                      {p.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>

            {/* Input Email */}
            <Field>
              <FieldLabel>
                <FieldTitle>
                  Email <span className="text-error">*</span>
                </FieldTitle>
              </FieldLabel>
              <Input
                type="email"
                required
                disabled={isAddLoading}
                placeholder="dosen@uin-suka.ac.id"
                value={addEmail}
                onChange={(e) => setAddEmail(e.target.value)}
                className="h-10 text-xs border border-border rounded-lg bg-transparent px-3 text-foreground disabled:opacity-50 disabled:cursor-not-allowed"
              />
            </Field>

            <DialogFooter className="flex justify-end gap-2 pt-2">
              <Button
                type="button"
                variant="outline"
                disabled={isAddLoading}
                onClick={() => setIsAddOpen(false)}
                className="text-xs font-semibold h-9 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Batal
              </Button>
              <Button
                type="submit"
                disabled={isAddLoading}
                className="bg-primary text-primary-foreground text-xs font-semibold h-9 rounded-lg hover:bg-primary/90 cursor-pointer flex items-center justify-center gap-1.5 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isAddLoading ? (
                  <>
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    <span>Menyimpan...</span>
                  </>
                ) : (
                  <span>Tambah Dosen</span>
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Dialog: Edit Pengajuan */}
      <Dialog
        open={isEditOpen}
        onOpenChange={(val) => {
          if (isUpdateLoading) return;
          setIsEditOpen(val);
        }}
      >
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
                  <FieldTitle>
                    NIP Dosen <span className="text-error">*</span>
                  </FieldTitle>
                </FieldLabel>
                <Input
                  type="text"
                  required
                  disabled={isUpdateLoading}
                  value={editNip}
                  onChange={(e) => setEditNip(e.target.value)}
                  className="h-10 text-xs border border-border rounded-lg bg-transparent px-3 text-foreground font-mono font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
                />
              </Field>

              <Field>
                <FieldLabel>
                  <FieldTitle>
                    Nama Dosen <span className="text-error">*</span>
                  </FieldTitle>
                </FieldLabel>
                <Input
                  type="text"
                  required
                  disabled={isUpdateLoading}
                  value={editNama}
                  onChange={(e) => setEditNama(e.target.value)}
                  className="h-10 text-xs border border-border rounded-lg bg-transparent px-3 text-foreground disabled:opacity-50 disabled:cursor-not-allowed"
                />
              </Field>

              <Field>
                <FieldLabel>
                  <FieldTitle>
                    Fakultas <span className="text-error">*</span>
                  </FieldTitle>
                </FieldLabel>
                <Select
                  value={editFaculty}
                  disabled={isUpdateLoading}
                  onValueChange={handleEditFacultyChange}
                >
                  <SelectTrigger className="w-full bg-card border border-border rounded-lg px-3 py-2 text-xs font-semibold focus:outline-none focus:border-primary cursor-pointer justify-between disabled:opacity-50 disabled:cursor-not-allowed">
                    <SelectValue placeholder="Pilih Fakultas" />
                  </SelectTrigger>
                  <SelectContent>
                    {realFaculties.map((f) => (
                      <SelectItem
                        key={f}
                        value={f}
                        className="text-xs font-semibold cursor-pointer"
                      >
                        {f}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </Field>

              <Field>
                <FieldLabel>
                  <FieldTitle>
                    Program Studi <span className="text-error">*</span>
                  </FieldTitle>
                </FieldLabel>
                <Select
                  value={editProdi}
                  onValueChange={setEditProdi}
                  disabled={isUpdateLoading}
                >
                  <SelectTrigger className="w-full bg-card border border-border rounded-lg px-3 py-2 text-xs font-semibold focus:outline-none focus:border-primary cursor-pointer justify-between disabled:opacity-50 disabled:cursor-not-allowed">
                    <SelectValue placeholder="Pilih Program Studi" />
                  </SelectTrigger>
                  <SelectContent>
                    {editProdiList.map((p) => (
                      <SelectItem
                        key={p.name}
                        value={p.name}
                        className="text-xs font-semibold cursor-pointer"
                      >
                        {p.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </Field>

              {/* Input Email */}
              <Field>
                <FieldLabel>
                  <FieldTitle>
                    Email <span className="text-error">*</span>
                  </FieldTitle>
                </FieldLabel>
                <Input
                  type="email"
                  required
                  disabled={isUpdateLoading}
                  placeholder="dosen@uin-suka.ac.id"
                  value={editEmail}
                  onChange={(e) => setEditEmail(e.target.value)}
                  className="h-10 text-xs border border-border rounded-lg bg-transparent px-3 text-foreground disabled:opacity-50 disabled:cursor-not-allowed"
                />
              </Field>

              <DialogFooter className="flex justify-end gap-2 pt-2">
                <Button
                  type="button"
                  variant="outline"
                  disabled={isUpdateLoading}
                  onClick={() => setIsEditOpen(false)}
                  className="text-xs font-semibold h-9 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Batal
                </Button>
                <Button
                  type="submit"
                  disabled={isUpdateLoading}
                  className="bg-primary text-primary-foreground text-xs font-semibold h-9 rounded-lg hover:bg-primary/90 cursor-pointer flex items-center justify-center gap-1.5 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isUpdateLoading ? (
                    <>
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      <span>Menyimpan...</span>
                    </>
                  ) : (
                    <span>Simpan Perubahan</span>
                  )}
                </Button>
              </DialogFooter>
            </form>
          )}
        </DialogContent>
      </Dialog>

      {/* Dialog: Edit Data Dosen */}
      <Dialog
        open={isEditDosenOpen}
        onOpenChange={(val) => {
          if (isUpdateLoading) return;
          setIsEditDosenOpen(val);
        }}
      >
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
                  <FieldTitle>
                    NIP Dosen <span className="text-error">*</span>
                  </FieldTitle>
                </FieldLabel>
                <Input
                  type="text"
                  required
                  disabled={isUpdateLoading}
                  value={editDosenNip}
                  onChange={(e) => setEditDosenNip(e.target.value)}
                  className="h-10 text-xs border border-border rounded-lg bg-transparent px-3 text-foreground font-mono font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
                />
              </Field>

              <Field>
                <FieldLabel>
                  <FieldTitle>
                    Nama Dosen <span className="text-error">*</span>
                  </FieldTitle>
                </FieldLabel>
                <Input
                  type="text"
                  required
                  disabled={isUpdateLoading}
                  value={editDosenNama}
                  onChange={(e) => setEditDosenNama(e.target.value)}
                  className="h-10 text-xs border border-border rounded-lg bg-transparent px-3 text-foreground disabled:opacity-50 disabled:cursor-not-allowed"
                />
              </Field>

              <Field>
                <FieldLabel>
                  <FieldTitle>
                    Fakultas <span className="text-error">*</span>
                  </FieldTitle>
                </FieldLabel>
                <Select
                  value={editDosenFaculty}
                  disabled={isUpdateLoading}
                  onValueChange={handleEditDosenFacultyChange}
                >
                  <SelectTrigger className="w-full bg-card border border-border rounded-lg px-3 py-2 text-xs font-semibold focus:outline-none focus:border-primary cursor-pointer justify-between disabled:opacity-50 disabled:cursor-not-allowed">
                    <SelectValue placeholder="Pilih Fakultas" />
                  </SelectTrigger>
                  <SelectContent>
                    {realFaculties.map((f) => (
                      <SelectItem
                        key={f}
                        value={f}
                        className="text-xs font-semibold cursor-pointer"
                      >
                        {f}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </Field>

              <Field>
                <FieldLabel>
                  <FieldTitle>
                    Program Studi <span className="text-error">*</span>
                  </FieldTitle>
                </FieldLabel>
                <Select
                  value={editDosenProdi}
                  onValueChange={setEditDosenProdi}
                  disabled={isUpdateLoading}
                >
                  <SelectTrigger className="w-full bg-card border border-border rounded-lg px-3 py-2 text-xs font-semibold focus:outline-none focus:border-primary cursor-pointer justify-between disabled:opacity-50 disabled:cursor-not-allowed">
                    <SelectValue placeholder="Pilih Program Studi" />
                  </SelectTrigger>
                  <SelectContent>
                    {editDosenProdiList.map((p) => (
                      <SelectItem
                        key={p.name}
                        value={p.name}
                        className="text-xs font-semibold cursor-pointer"
                      >
                        {p.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </Field>

              {/* Input Email */}
              <Field>
                <FieldLabel>
                  <FieldTitle>
                    Email <span className="text-error">*</span>
                  </FieldTitle>
                </FieldLabel>
                <Input
                  type="email"
                  required
                  disabled={isUpdateLoading}
                  placeholder="dosen@uin-suka.ac.id"
                  value={editDosenEmail}
                  onChange={(e) => setEditDosenEmail(e.target.value)}
                  className="h-10 text-xs border border-border rounded-lg bg-transparent px-3 text-foreground disabled:opacity-50 disabled:cursor-not-allowed"
                />
              </Field>

              <DialogFooter className="flex justify-end gap-2 pt-2">
                <Button
                  type="button"
                  variant="outline"
                  disabled={isUpdateLoading}
                  onClick={() => setIsEditDosenOpen(false)}
                  className="text-xs font-semibold h-9 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Batal
                </Button>
                <Button
                  type="submit"
                  disabled={isUpdateLoading}
                  className="bg-primary text-primary-foreground text-xs font-semibold h-9 rounded-lg hover:bg-primary/90 cursor-pointer flex items-center justify-center gap-1.5 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isUpdateLoading ? (
                    <>
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      <span>Menyimpan...</span>
                    </>
                  ) : (
                    <span>Simpan Perubahan</span>
                  )}
                </Button>
              </DialogFooter>
            </form>
          )}
        </DialogContent>
      </Dialog>

      {/* Alert Dialog: Konfirmasi Hapus Dosen */}
      <AlertDialog
        open={isDeleteOpen}
        onOpenChange={(val) => {
          if (isDeleteLoading) return;
          setIsDeleteOpen(val);
        }}
      >
        <AlertDialogContent className="bg-card border border-border p-6 rounded-xl sm:max-w-md">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-xs font-bold text-foreground tracking-wider uppercase">
              Hapus Data Dosen
            </AlertDialogTitle>
            <AlertDialogDescription className="text-xs text-muted-foreground mt-2">
              Apakah Anda yakin ingin menghapus data dosen{" "}
              <span className="font-bold text-foreground">
                &quot;{dosenToDelete?.nama}&quot;
              </span>{" "}
              ({dosenToDelete?.nip})? Tindakan ini tidak dapat dibatalkan.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="flex justify-end gap-2 pt-2">
            <AlertDialogCancel
              disabled={isDeleteLoading}
              className="text-xs font-semibold h-9 rounded-lg border border-border bg-card text-foreground hover:bg-muted cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Batal
            </AlertDialogCancel>
            <AlertDialogAction
              disabled={isDeleteLoading}
              onClick={(e) => {
                e.preventDefault();
                if (dosenToDelete && dosenToDelete.id) {
                  handleDeleteDosen(dosenToDelete.id, dosenToDelete.nama);
                }
              }}
              className="bg-error text-error-foreground hover:bg-error/90 text-xs font-semibold h-9 rounded-lg cursor-pointer flex items-center justify-center gap-1.5 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isDeleteLoading ? (
                <>
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  <span>Menghapus...</span>
                </>
              ) : (
                <span>Hapus Dosen</span>
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
