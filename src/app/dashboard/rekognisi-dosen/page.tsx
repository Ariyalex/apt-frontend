"use client";

import React, { useState } from "react";
import { Search, Plus } from "lucide-react";
import Link from "next/link";
import { initialData } from "@/dummy-data/rekognisi";
import { RekognisiChart } from "@/components/dashboard/rekognisi/rekognisi-chart";
import { RekognisiTable } from "@/components/dashboard/rekognisi/rekognisi-table";
import { Combobox } from "@/components/ui/combobox";

export default function RekognisiDosenPage() {
  // Separate filter states for Chart and Table
  const [chartProdi, setChartProdi] = useState<string>("Semua");
  const [tableProdi, setTableProdi] = useState<string>("Semua");
  const [tableJenis, setTableJenis] = useState<string>("Semua");
  const [searchQuery, setSearchQuery] = useState("Cari...");

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
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-foreground md:text-2xl">
            Rekognisi Dosen per Fakultas
          </h1>
          <p className="text-xs text-muted-foreground mt-1">
            Data rekognisi dosen
          </p>
        </div>
      </div>

      {/* Grid 1: Bar Chart Component (with Prodi Filter built-in) */}
      <RekognisiChart
        data={chartFilteredData}
        selectedProdi={chartProdi}
        onProdiChange={setChartProdi}
        prodiOptions={prodiComboboxOptions}
      />

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
        <RekognisiTable data={tableFilteredData} />
      </div>
    </div>
  );
}
