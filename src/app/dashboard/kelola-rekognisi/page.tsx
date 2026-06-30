"use client";

import React, { useState, useEffect } from "react";
import { Search, Plus } from "lucide-react";
import { RekognisiTable } from "@/components/dashboard/rekognisi/rekognisi-table";
import { Combobox } from "@/components/ui/combobox";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { useGetRecognitionListQuery } from "@/store/services/recognitionApi";
import { useGetStudyProgramsQuery } from "@/store/services/studyProgramApi";
import { useGetRecognitionCategoriesQuery } from "@/store/services/recognitionCategoryApi";
import { useRouter } from "next/navigation";

export default function KelolaRekognisiDosenPage(): React.JSX.Element {
  const router = useRouter();
  const [isAdmin, setIsAdmin] = useState(false);

  // Load user session to identify Admin role
  useEffect(() => {
    const raw = localStorage.getItem("userSession");
    if (raw) {
      try {
        const session = JSON.parse(raw);
        if (session.username === "admin" || session.role === "Administrator") {
          // eslint-disable-next-line react-hooks/set-state-in-effect
          setIsAdmin(true);
        }
      } catch {
        // ignore
      }
    }
  }, []);

  // Pagination and search/filter states
  const [page, setPage] = useState<number>(1);
  const limit = 10;

  const [tableProdi, setTableProdi] = useState<string>("Semua");
  const [tableJenis, setTableJenis] = useState<string>("Semua");
  const [searchQuery, setSearchQuery] = useState("Cari...");
  const [debouncedSearch, setDebouncedSearch] = useState<string>("");

  // Debounce search input
  useEffect(() => {
    const activeSearch = searchQuery === "Cari..." ? "" : searchQuery;
    const handler = setTimeout(() => {
      setDebouncedSearch(activeSearch);
    }, 400);
    return () => clearTimeout(handler);
  }, [searchQuery]);

  // Reset page to 1 when search or filter criteria changes
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setPage(1);
  }, [debouncedSearch, tableProdi, tableJenis]);

  // Query approved recognition records from API (paginated & filtered)
  const {
    data: recognitionResponse,
    isLoading: isApiLoading,
    isError,
    refetch,
  } = useGetRecognitionListQuery({
    status: "approved",
    page,
    limit,
    lecturer_name: debouncedSearch || undefined,
    study_program: tableProdi !== "Semua" ? tableProdi : undefined,
    category: tableJenis !== "Semua" ? tableJenis : undefined,
  });

  // Query categories and study programs to populate comboboxes
  const { data: prodiRes } = useGetStudyProgramsQuery({ limit: 100 });
  const { data: catRes } = useGetRecognitionCategoriesQuery();

  const recognitionList = recognitionResponse?.data || [];

  // Map API models to expected DosenData properties for components compatibility
  const initialData = recognitionList.map((rec) => ({
    id: rec.id,
    nip: rec.lecturer?.nip || "",
    nama: rec.lecturer?.name || "",
    prodi: rec.lecturer?.study_program?.name || "",
    jenisRekognisi: rec.category?.name || "",
    tahun: rec.obtained_at ? new Date(rec.obtained_at).getFullYear().toString() : "",
    deskripsi: rec.description,
    buktiUrl: (rec.proof_links || []).join(","),
  }));

  const handleFocus = () => {
    if (searchQuery === "Cari...") {
      setSearchQuery("");
    }
  };

  const handleBlur = () => {
    if (searchQuery.trim() === "") {
      setSearchQuery("Cari...");
    }
  };

  // Get lists for filtering
  const prodis = [
    "Semua",
    ...(prodiRes?.data || []).map((p) => p.name),
  ];
  const jenisList = [
    "Semua",
    ...(catRes?.data || []).map((c) => c.name),
  ];

  // Options structures for Combobox
  const prodiComboboxOptions = prodis.map((p) => ({
    value: p,
    label: p,
  }));

  const jenisComboboxOptions = jenisList.map((j) => ({
    value: j,
    label: j === "Semua" ? "Semua Jenis" : j,
  }));

  // Since filtering is now offloaded to the server, data is already filtered
  const tableFilteredData = initialData;

  return (
    <div className="space-y-6">
      {/* Top Title & Header Actions */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-border/40 pb-4">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-foreground md:text-2xl">
            Kelola Rekognisi Dosen
          </h1>
          <p className="text-xs text-muted-foreground mt-1">
            Kelola dan edit data rekognisi dosen yang telah disetujui
          </p>
        </div>
        {!isAdmin && (
          <Button
            onClick={() => router.push("/dashboard/rekognisi-dosen/isi-data")}
            className="inline-flex items-center gap-1.5 bg-primary text-primary-foreground text-xs font-semibold h-9 px-4 rounded-lg hover:bg-primary/95 shadow-sm transition-colors cursor-pointer"
          >
            <Plus className="h-3.5 w-3.5" />
            Tambah Rekognisi
          </Button>
        )}
      </div>

      {isError ? (
        <div className="rounded-xl border border-error/25 bg-error/5 p-4 text-xs text-error flex justify-between items-center">
          <span>Gagal memuat data rekognisi dari server.</span>
          <Button variant="link" onClick={() => refetch()} className="text-xs font-bold text-error underline p-0 h-auto">
            Coba Lagi
          </Button>
        </div>
      ) : (
        /* Flat Table Layout Without Card Shadow/Borders */
        <div className="animate-fadeIn space-y-4">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between pb-3 border-b border-border/40">
            <div className="flex items-center gap-2">
              <h2 className="text-xs font-bold text-foreground uppercase tracking-wider">
                Tabel Kelola Rekognisi Dosen
              </h2>
            </div>

            {/* Combobox Filters & Search */}
            <div className="flex flex-col sm:flex-row items-center gap-3 w-full lg:w-auto">
              <Combobox
                options={prodiComboboxOptions}
                value={tableProdi}
                onChange={(val) => setTableProdi(val)}
                placeholder="Filter Prodi..."
                searchPlaceholder="Cari prodi..."
                className="w-full sm:w-[180px]"
              />

              <Combobox
                options={jenisComboboxOptions}
                value={tableJenis}
                onChange={(val) => setTableJenis(val)}
                placeholder="Filter Jenis..."
                searchPlaceholder="Cari jenis..."
                className="w-full sm:w-[180px]"
              />

              <div className="relative w-full sm:w-64">
                <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="Cari dosen atau NIP..."
                  value={searchQuery}
                  onFocus={handleFocus}
                  onBlur={handleBlur}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-muted/30 border border-border rounded-lg pl-9 pr-4 py-1.5 text-xs focus:outline-none focus:border-primary transition-colors text-foreground"
                />
              </div>
            </div>
          </div>

          {/* Table Representation */}
          {isApiLoading ? (
            <div className="space-y-4 py-2 animate-pulse">
              <div className="flex gap-4 border-b border-border/50 pb-2">
                <Skeleton className="h-4 w-12" />
                <Skeleton className="h-4 w-28" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-4 w-20" />
              </div>
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="flex gap-4 items-center py-2.5 border-b border-border/20 last:border-0">
                  <Skeleton className="h-3.5 w-12" />
                  <Skeleton className="h-3.5 w-28" />
                  <Skeleton className="h-3.5 w-full" />
                  <Skeleton className="h-3.5 w-32" />
                  <Skeleton className="h-3.5 w-20" />
                </div>
              ))}
            </div>
          ) : (
            <RekognisiTable
              data={tableFilteredData}
              page={page}
              totalPages={recognitionResponse?.meta?.total_pages || 1}
              totalItems={recognitionResponse?.meta?.total_items || 0}
              onPageChange={(p) => setPage(p)}
              showActions={true}
            />
          )}
        </div>
      )}
    </div>
  );
}
