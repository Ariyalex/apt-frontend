"use client";

import React, { useEffect, useState } from "react";
import { Award, Users, FileCheck2 } from "lucide-react";
import { initialData } from "@/dummy-data/rekognisi";
import { RekognisiChart } from "@/components/dashboard/rekognisi/rekognisi-chart";
import { RekognisiPieChart } from "@/components/dashboard/rekognisi/rekognisi-pie-chart";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

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
  const [isLoading, setIsLoading] = useState(true);
  const [selectedFaculty, setSelectedFaculty] = useState(
    "Semua Fakultas",
  );

  useEffect(() => {
    const raw = localStorage.getItem("userSession");
    let sessionData: UserSession | null = null;
    if (raw) {
      try {
        sessionData = JSON.parse(raw);
      } catch {
        // ignore
      }
    }

    const timer = setTimeout(() => {
      if (sessionData) {
        setSession(sessionData);
        if (sessionData.role === "Auditee") {
          // If Auditee user, lock faculty to "Fakultas Sains dan Teknologi" for mock
          setSelectedFaculty("Fakultas Sains dan Teknologi");
        } else {
          // Default to "Semua Fakultas" for Admin, Auditor, and Assessor
          setSelectedFaculty("Semua Fakultas");
        }
      }
      setIsLoading(false);
    }, 700);
    return () => clearTimeout(timer);
  }, []);


  // Reset selected prodi when selected faculty changes
  const handleFacultyChange = (val: string) => {
    setSelectedFaculty(val);
  };

  // Filter data to only include active faculty
  const facultyData = selectedFaculty === "Semua Fakultas"
    ? initialData
    : initialData.filter((item) => {
        const allowed = facultyProdiMap[selectedFaculty] || [];
        return allowed.includes(item.prodi);
      });

  // Calculate dynamic stats
  const totalRecognition = facultyData.length;
  const uniqueLecturers = new Set(facultyData.map((item) => item.nip))
    .size;

  const jenisCounts: Record<string, number> = {};
  facultyData.forEach((item) => {
    jenisCounts[item.jenisRekognisi] =
      (jenisCounts[item.jenisRekognisi] || 0) + 1;
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
      description: `Rekognisi aktif di ${selectedFaculty}`,
      icon: Award,
      color: "text-primary",
    },
    {
      title: "Dosen Terlibat",
      value: `${uniqueLecturers} Dosen`,
      description: "Dosen yang memiliki rekognisi",
      icon: Users,
      color: "text-emerald-500",
    },
    {
      title: "Jenis Terpopuler",
      value: topJenis,
      description:
        maxCount > 0 ? `${maxCount} rekognisi aktif` : "Tidak ada data",
      icon: FileCheck2,
      color: "text-amber-500",
    },
  ];

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Welcome Message & Faculty Selector */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-border/40 pb-4">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-foreground md:text-2xl">
            Dashboard Rekognisi Dosen
          </h1>
          <p className="text-xs text-muted-foreground mt-1">
            {session?.role !== "Auditee"
              ? "Pantau data statistik dan grafik rekognisi dosen di seluruh fakultas."
              : `Statistik dan grafik rekognisi dosen untuk ${selectedFaculty}.`}
          </p>
        </div>

        {/* Show faculty selector for all roles except Auditee */}
        {session?.role !== "Auditee" && !isLoading && (
          <div className="w-full sm:w-70">
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
          </div>
        )}
      </div>

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

      {/* Recognition Chart */}
      {isLoading ? (
        session?.role === "Auditee" ? (
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
        ) : (
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
        )
      ) : session?.role === "Auditee" ? (
        <RekognisiChart data={facultyData} />
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <RekognisiChart data={facultyData} />
          <RekognisiPieChart data={facultyData} />
        </div>
      )}
    </div>
  );
}
