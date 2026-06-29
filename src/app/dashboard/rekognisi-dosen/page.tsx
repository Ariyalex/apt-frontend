"use client";

import React, { useEffect, useState } from "react";
import { Search, Plus } from "lucide-react";
import { RekognisiChart } from "@/components/dashboard/rekognisi/rekognisi-chart";
import { RekognisiTable } from "@/components/dashboard/rekognisi/rekognisi-table";
import { Combobox } from "@/components/ui/combobox";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { useGetRecognitionListQuery } from "@/store/services/recognitionApi";
import { useRouter } from "next/navigation";

export default function RekognisiDosenPage(): React.JSX.Element {
  const router = useRouter();
  // Query recognition records from API
  const {
    data: recognitionResponse,
    isLoading: isApiLoading,
    isError,
    refetch,
  } = useGetRecognitionListQuery({ status: "approved" });

  const recognitionList = recognitionResponse?.data || [];

  // Map API models to expected DosenData properties for components compatibility
  const initialData = recognitionList.map((rec) => ({
    id: rec.id,
    nip: rec.lecturer?.nip || "",
    nama: rec.lecturer?.name || "",
    prodi: rec.lecturer?.study_program?.name || "",
    jenisRekognisi: rec.category?.name || "",
    tahun: rec.obtained_at
      ? new Date(rec.obtained_at).getFullYear().toString()
      : "",
    deskripsi: rec.description,
    buktiUrl: (rec.proof_links || []).join(","),
  }));

  // Separate filter states for Chart and Table
  const [chartProdi, setChartProdi] = useState<string>("Semua");
  const [tableProdi, setTableProdi] = useState<string>("Semua");
  const [tableJenis, setTableJenis] = useState<string>("Semua");
  const [searchQuery, setSearchQuery] = useState("Cari...");
  const [isAuditor, setIsAuditor] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      const raw = localStorage.getItem("userSession");
      if (raw) {
        try {
          const session = JSON.parse(raw);
          if (session.role === "Auditor") {
            setIsAuditor(true);
          }
        } catch {
          // ignore
        }
      }
    }, 0);
    return () => clearTimeout(timer);
  }, []);

  // Custom focus handler to clear default value
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

  const getActiveSearchQuery = () => {
    return searchQuery === "Cari..." ? "" : searchQuery;
  };

  // Get unique lists for filtering
  const prodis = [
    "Semua",
    ...Array.from(new Set(initialData.map((item) => item.prodi))),
  ];
  const jenisList = [
    "Semua",
    ...Array.from(new Set(initialData.map((item) => item.jenisRekognisi))),
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

  // 1. Filter data for Chart (Only filtered by chartProdi)
  const chartFilteredData = initialData.filter((item) => {
    return chartProdi === "Semua" || item.prodi === chartProdi;
  });

  // 2. Filter data for Table (Filtered by tableProdi, tableJenis and searchQuery)
  const tableFilteredData = initialData.filter((item) => {
    const activeSearch = getActiveSearchQuery();
    const matchProdi = tableProdi === "Semua" || item.prodi === tableProdi;
    const matchJenis =
      tableJenis === "Semua" || item.jenisRekognisi === tableJenis;
    const matchSearch =
      item.nama.toLowerCase().includes(activeSearch.toLowerCase()) ||
      item.nip.includes(activeSearch) ||
      item.deskripsi.toLowerCase().includes(activeSearch.toLowerCase());
    return matchProdi && matchJenis && matchSearch;
  });

  return (
    <div className="space-y-6">
      {/* Top Title & Filter */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-border/40 pb-4">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-foreground md:text-2xl">
            Rekognisi Dosen per Fakultas
          </h1>
          <p className="text-xs text-muted-foreground mt-1">
            Data rekognisi dosen
          </p>
        </div>
        {isAuditor ? null : (
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
          <Button
            variant="link"
            onClick={() => refetch()}
            className="text-xs font-bold text-error underline p-0 h-auto"
          >
            Coba Lagi
          </Button>
        </div>
      ) : (
        <>
          {/* Grid 1: Bar Chart Component (with Prodi Filter built-in) */}
          {isApiLoading ? (
            <div className="rounded-xl border border-border bg-card p-6 shadow-sm space-y-4 animate-pulse">
              <div className="flex items-center justify-between">
                <Skeleton className="h-5 w-48 rounded" />
                <Skeleton className="h-9 w-40 rounded" />
              </div>
              <div className="space-y-3 pt-4">
                <Skeleton className="h-9 w-[70%] rounded-r-lg" />
                <Skeleton className="h-9 w-[85%] rounded-r-lg" />
                <Skeleton className="h-9 w-[45%] rounded-r-lg" />
                <Skeleton className="h-9 w-[90%] rounded-r-lg" />
              </div>
            </div>
          ) : (
            <RekognisiChart
              data={chartFilteredData}
              selectedProdi={chartProdi}
              onProdiChange={setChartProdi}
              prodiOptions={prodiComboboxOptions}
            />
          )}

          {/* Grid 2: Table Component */}
          <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between mb-4 border-b border-border/40 pb-3">
              <div className="flex items-center gap-2">
                <h2 className="text-xs font-bold text-foreground uppercase tracking-wider">
                  Tabel Rekognisi Dosen
                </h2>
              </div>

              {/* Combobox Filters & Search inside table filter card (Specifically for Table) */}
              <div className="flex flex-col sm:flex-row items-center gap-3 w-full lg:w-auto">
                {/* Filter Prodi */}
                <Combobox
                  options={prodiComboboxOptions}
                  value={tableProdi}
                  onChange={(tableProdi) => {
                    setTableProdi(tableProdi);
                  }}
                  placeholder="Filter Prodi..."
                  searchPlaceholder="Cari prodi..."
                  className="w-full sm:w-[180px]"
                />

                {/* Filter Jenis Rekognisi */}
                <Combobox
                  options={jenisComboboxOptions}
                  value={tableJenis}
                  onChange={(tableJenis) => {
                    setTableJenis(tableJenis);
                  }}
                  placeholder="Filter Jenis..."
                  searchPlaceholder="Cari jenis..."
                  className="w-full sm:w-[180px]"
                />

                {/* Search Input */}
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

            {/* Table representation */}
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
                  <div
                    key={i}
                    className="flex gap-4 items-center py-2.5 border-b border-border/20 last:border-0"
                  >
                    <Skeleton className="h-3.5 w-12" />
                    <Skeleton className="h-3.5 w-28" />
                    <Skeleton className="h-3.5 w-full" />
                    <Skeleton className="h-3.5 w-32" />
                    <Skeleton className="h-3.5 w-20" />
                  </div>
                ))}
              </div>
            ) : (
              <RekognisiTable data={tableFilteredData} />
            )}
          </div>
        </>
      )}
    </div>
  );
}
