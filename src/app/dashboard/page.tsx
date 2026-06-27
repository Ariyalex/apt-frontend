"use client";

import React, { useEffect, useState } from "react";
import { Award, Users, FileCheck2 } from "lucide-react";
import { RekognisiChart } from "@/components/dashboard/rekognisi/rekognisi-chart";
import { RekognisiPieChart } from "@/components/dashboard/rekognisi/rekognisi-pie-chart";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useGetRecognitionListQuery } from "@/store/services/recognitionApi";
import { useGetInstitutesQuery } from "@/store/services/instituteApi";

interface UserSession {
  name: string;
  role: string;
  username: string;
  initials: string;
  avatarUrl?: string;
}

const faculties = [
  "Semua Fakultas",
  "Fakultas Sains dan Teknologi",
  "Fakultas Ilmu Tarbiyah dan Keguruan",
  "Fakultas Ekonomi dan Bisnis Islam",
  "Fakultas Dakwah dan Komunikasi",
  "Fakultas Adab dan Ilmu Budaya",
  "Fakultas Syariah dan Hukum",
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
  "Fakultas Ekonomi dan Bisnis Islam": ["Perbankan Syariah"],
  "Fakultas Dakwah dan Komunikasi": ["Komunikasi Penyiaran Islam"],
  "Fakultas Adab dan Ilmu Budaya": ["Bahasa dan Sastra Arab"],
  "Fakultas Syariah dan Hukum": [
    "Hukum Ekonomi Syariah",
    "Hukum Keluarga Islam",
  ],
};

export default function Dashboard(): React.JSX.Element {
  const [session, setSession] = useState<UserSession | null>(null);
  const [isSessionLoading, setIsSessionLoading] = useState(true);
  
  // Selection filters
  const [selectedFaculty, setSelectedFaculty] = useState("Semua Fakultas");
  const [selectedLembaga, setSelectedLembaga] = useState("Semua Lembaga");
  const [isAdmin, setIsAdmin] = useState(false);

  // Load session from localStorage
  useEffect(() => {
    const raw = localStorage.getItem("userSession");
    let sessionData: UserSession | null = null;
    if (raw) {
      try {
        sessionData = JSON.parse(raw);
        if (sessionData && (sessionData.username === "admin" || sessionData.role === "Administrator")) {
          setIsAdmin(true);
        }
      } catch {
        // ignore
      }
    }

    const timer = setTimeout(() => {
      if (sessionData) {
        setSession(sessionData);
        if (sessionData.role === "Auditee") {
          setSelectedFaculty("Fakultas Sains dan Teknologi");
        } else {
          setSelectedFaculty("Semua Fakultas");
        }
      }
      setIsSessionLoading(false);
    }, 500);
    return () => clearTimeout(timer);
  }, []);

  // Fetch approved recognition data from backend API
  const {
    data: recognitionResponse,
    isLoading: isApiLoading,
    isError,
    refetch,
  } = useGetRecognitionListQuery({ status: "approved" });

  // Fetch real institutes list from API
  const { data: institutesResponse, isLoading: isInstitutesLoading } = useGetInstitutesQuery();
  const institutes = institutesResponse?.data || [];

  const recognitionList = recognitionResponse?.data || [];

  // Map API models to components compatibility layout
  const initialData = recognitionList.map((rec) => ({
    id: rec.id,
    nip: rec.lecturer?.nip || "",
    nama: rec.lecturer?.name || "",
    prodi: rec.lecturer?.study_program?.name || "",
    jenisRekognisi: rec.category?.name || "",
    tahun: rec.obtained_at ? new Date(rec.obtained_at).getFullYear().toString() : "",
    deskripsi: rec.description,
    buktiUrl: (rec.proof_links || []).join(","),
    instituteName: rec.lecturer?.institute?.name || "",
  }));

  const isLoading = isSessionLoading || isApiLoading || (isAdmin && isInstitutesLoading);

  const handleFacultyChange = (val: string) => {
    setSelectedFaculty(val);
  };

  const handleLembagaChange = (val: string) => {
    setSelectedLembaga(val);
  };

  // Filter data based on Admin role (Lembaga) vs non-Admin role (Fakultas)
  const facultyData = isAdmin
    ? (selectedLembaga === "Semua Lembaga"
      ? initialData
      : initialData.filter((item) => item.instituteName === selectedLembaga))
    : (selectedFaculty === "Semua Fakultas"
      ? initialData
      : initialData.filter((item) => {
          const allowed = facultyProdiMap[selectedFaculty] || [];
          return allowed.includes(item.prodi);
        }));

  // Calculate dynamic stats
  const totalRecognition = facultyData.length;
  const uniqueLecturers = new Set(facultyData.map((item) => item.nip)).size;

  const jenisCounts: Record<string, number> = {};
  facultyData.forEach((item) => {
    jenisCounts[item.jenisRekognisi] = (jenisCounts[item.jenisRekognisi] || 0) + 1;
  });

  let topJenis = "-";
  let maxCount = 0;
  Object.entries(jenisCounts).forEach(([jenis, count]) => {
    if (count > maxCount) {
      maxCount = count;
      topJenis = jenis;
    }
  });

  const stats = [
    {
      title: "Total Rekognisi",
      value: `${totalRecognition} Rekognisi`,
      description: isAdmin 
        ? `Rekognisi aktif di ${selectedLembaga}` 
        : `Rekognisi aktif di ${selectedFaculty}`,
      icon: Award,
      color: "text-primary",
    },
    {
      title: "Dosen Terlibat",
      value: `${uniqueLecturers} Dosen`,
      description: "Dosen yang memiliki rekognisi",
      icon: Users,
      color: "text-success",
    },
    {
      title: "Jenis Terpopuler",
      value: topJenis,
      description: maxCount > 0 ? `${maxCount} rekognisi aktif` : "Tidak ada data",
      icon: FileCheck2,
      color: "text-amber-500",
    },
  ];

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Welcome Message & Selector */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-border/40 pb-4">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-foreground md:text-2xl">
            Dashboard Rekognisi Dosen
          </h1>
          <p className="text-xs text-muted-foreground mt-1">
            {isAdmin
              ? `Pantau data statistik dan grafik rekognisi dosen di seluruh lembaga.`
              : session?.role !== "Auditee"
                ? "Pantau data statistik dan grafik rekognisi dosen di seluruh fakultas."
                : `Statistik dan grafik rekognisi dosen untuk ${selectedFaculty}.`}
          </p>
        </div>

        {/* Dynamic Selector based on User Role */}
        {!isLoading && (
          <div className="w-full sm:w-70">
            {isAdmin ? (
              /* Admin sees real Institutes */
              <Select value={selectedLembaga} onValueChange={handleLembagaChange}>
                <SelectTrigger className="w-full h-10 bg-card border border-border rounded-lg px-3 py-2 text-xs font-semibold focus:outline-none focus:border-primary cursor-pointer justify-between">
                  <SelectValue placeholder="Pilih Lembaga" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Semua Lembaga" className="text-xs font-semibold cursor-pointer">
                    Semua Lembaga
                  </SelectItem>
                  {institutes.map((inst) => (
                    <SelectItem
                      key={inst.id}
                      value={inst.name}
                      className="text-xs font-semibold cursor-pointer"
                    >
                      {inst.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            ) : (
              /* Non-Admin (except locked Auditee) sees Faculty filter */
              session?.role !== "Auditee" && (
                <Select value={selectedFaculty} onValueChange={handleFacultyChange}>
                  <SelectTrigger className="w-full h-10 bg-card border border-border rounded-lg px-3 py-2 text-xs font-semibold focus:outline-none focus:border-primary cursor-pointer justify-between">
                    <SelectValue placeholder="Pilih Fakultas" />
                  </SelectTrigger>
                  <SelectContent>
                    {faculties.map((f) => (
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
              )
            )}
          </div>
        )}
      </div>

      {isError ? (
        <div className="rounded-xl border border-error/25 bg-error/5 p-4 text-xs text-error flex justify-between items-center">
          <span>Gagal memuat data statistik dashboard dari server.</span>
          <Button variant="link" onClick={() => refetch()} className="text-xs font-bold text-error underline p-0 h-auto">
            Coba Lagi
          </Button>
        </div>
      ) : (
        <>
          {/* Stats Cards */}
          <div className="grid gap-4 md:grid-cols-3">
            {isLoading
              ? Array.from({ length: 3 }).map((_, i) => (
                  <div
                    key={i}
                    className="rounded-xl border border-border bg-card p-5 shadow-sm space-y-3"
                  >
                    <div className="flex items-center justify-between">
                      <Skeleton className="h-4 w-28 rounded" />
                      <Skeleton className="h-5 w-5 rounded-full" />
                    </div>
                    <Skeleton className="h-7 w-36 rounded" />
                    <Skeleton className="h-3 w-48 rounded" />
                  </div>
                ))
              : stats.map((stat, i) => {
                  const Icon = stat.icon;
                  return (
                    <div
                      key={i}
                      className="rounded-xl border border-border bg-card p-5 shadow-sm"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                          {stat.title}
                        </span>
                        <Icon className={`h-5 w-5 ${stat.color}`} />
                      </div>
                      <div className="mt-2 flex items-baseline gap-2">
                        <span className="text-2xl font-bold tracking-tight text-foreground truncate">
                          {stat.value}
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground mt-1 truncate">
                        {stat.description}
                      </p>
                    </div>
                  );
                })}
          </div>

          {/* Recognition Charts (Always side-by-side grid for all roles) */}
          {isLoading ? (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Left: Bar chart skeleton */}
              <div className="rounded-xl border border-border bg-card p-6 shadow-sm space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <Skeleton className="h-4 w-40 rounded" />
                    <Skeleton className="h-3 w-60 rounded" />
                  </div>
                  <Skeleton className="h-8 w-40 rounded" />
                </div>
                <div className="space-y-3 pt-6">
                  <Skeleton className="h-9 w-[70%] rounded-r-lg" />
                  <Skeleton className="h-9 w-[85%] rounded-r-lg" />
                  <Skeleton className="h-9 w-[45%] rounded-r-lg" />
                  <Skeleton className="h-9 w-[90%] rounded-r-lg" />
                </div>
              </div>

              {/* Right: Pie chart skeleton */}
              <div className="rounded-xl border border-border bg-card p-6 shadow-sm space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <Skeleton className="h-4 w-40 rounded" />
                    <Skeleton className="h-3 w-60 rounded" />
                  </div>
                  <Skeleton className="h-8 w-40 rounded" />
                </div>
                <div className="flex flex-col items-center pt-6 pb-2 space-y-4">
                  <Skeleton className="h-48 w-48 rounded-full" />
                  <div className="flex gap-4 justify-center w-full">
                    <Skeleton className="h-4 w-20 rounded" />
                    <Skeleton className="h-4 w-24 rounded" />
                    <Skeleton className="h-4 w-16 rounded" />
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <RekognisiChart data={facultyData} />
              <RekognisiPieChart data={facultyData} />
            </div>
          )}
        </>
      )}
    </div>
  );
}
