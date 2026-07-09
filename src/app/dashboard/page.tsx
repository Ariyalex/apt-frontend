"use client";

import React, { useEffect, useMemo, useState } from "react";
import { Award, Users, FileCheck2, ArrowRight } from "lucide-react";
import Link from "next/link";
import { useGetAccreditationStatsQuery } from "@/store/services/accreditationApi";
import { RekognisiPieChart } from "@/components/dashboard/rekognisi/rekognisi-pie-chart";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
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

export default function Dashboard(): React.JSX.Element {
  const [session, setSession] = useState<UserSession | null>(null);
  const [isSessionLoading, setIsSessionLoading] = useState(true);

  // Selection filters
  const [selectedLembaga, setSelectedLembaga] = useState("Semua Lembaga");
  const [isAdmin, setIsAdmin] = useState(false);
  const [userLembaga, setUserLembaga] = useState("");

  // Load session from localStorage
  useEffect(() => {
    const raw = localStorage.getItem("userSession");
    let sessionData: (UserSession & { institute_id?: string | null }) | null =
      null;
    if (raw) {
      try {
        sessionData = JSON.parse(raw);
        if (
          sessionData &&
          (sessionData.username === "admin" ||
            sessionData.role === "Administrator")
        ) {
          // eslint-disable-next-line react-hooks/set-state-in-effect
          setIsAdmin(true);
        }
      } catch {
        // ignore
      }
    }

    const timer = setTimeout(() => {
      if (sessionData) {
        setSession(sessionData);
        // Default all institutes for non-Auditee
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
  const { data: institutesResponse, isLoading: isInstitutesLoading } =
    useGetInstitutesQuery();
  const institutes = useMemo(
    () => institutesResponse?.data || [],
    [institutesResponse],
  );

  const recognitionList = recognitionResponse?.data || [];

  // Update dynamic userLembaga matching once institutes list is loaded
  useEffect(() => {
    if (session && institutes.length > 0) {
      const uSession = session as UserSession & {
        institute_id?: string | null;
      };
      if (uSession.institute_id) {
        const matched = institutes.find(
          (inst) => inst.id.toString() === uSession.institute_id?.toString(),
        );
        if (matched) {
          // eslint-disable-next-line react-hooks/set-state-in-effect
          setUserLembaga(matched.name);
          // For regular auditees, lock selectedLembaga to their own institute
          if (uSession.role === "UPPS") {
            setSelectedLembaga(matched.name);
          }
        }
      }
    }
  }, [session, institutes]);

  // Map API models to components compatibility layout
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
    instituteName: rec.lecturer?.institute?.name || "",
  }));

  const isRoleWithLembagaFilter =
    isAdmin ||
    (session && (session.role === "LPM" || session.role === "Assessor"));
  const isLoading =
    isSessionLoading ||
    isApiLoading ||
    (isRoleWithLembagaFilter && isInstitutesLoading);

  const handleLembagaChange = (val: string) => {
    setSelectedLembaga(val);
  };

  // Filter data based on Admin/Auditor/Assessor role (Lembaga) vs regular Auditee (locked to own institute)
  const facultyData = isRoleWithLembagaFilter
    ? selectedLembaga === "Semua Lembaga"
      ? initialData
      : initialData.filter((item) => item.instituteName === selectedLembaga)
    : userLembaga
      ? initialData.filter((item) => item.instituteName === userLembaga)
      : initialData;

  // Calculate dynamic stats
  const totalRecognition = facultyData.length;
  const uniqueLecturers = new Set(facultyData.map((item) => item.nip)).size;

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
      description: isRoleWithLembagaFilter
        ? `Rekognisi aktif di ${selectedLembaga}`
        : `Rekognisi aktif di ${userLembaga || "Lembaga anda"}`,
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
      description:
        maxCount > 0 ? `${maxCount} rekognisi aktif` : "Tidak ada data",
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
            {isRoleWithLembagaFilter
              ? `Pantau data statistik dan grafik rekognisi dosen di seluruh lembaga.`
              : `Statistik dan grafik rekognisi dosen untuk ${userLembaga}.`}
          </p>
        </div>

        {/* Dynamic Selector based on User Role */}
        {!isLoading && (
          <div className="w-full sm:w-70">
            {isRoleWithLembagaFilter ? (
              /* Admin, Auditor, and Assessor see real Institutes */
              <Select
                value={selectedLembaga}
                onValueChange={handleLembagaChange}
              >
                <SelectTrigger className="w-full h-10 bg-card border border-border rounded-lg px-3 py-2 text-xs font-semibold focus:outline-none focus:border-primary cursor-pointer justify-between">
                  <SelectValue placeholder="Pilih Lembaga" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem
                    value="Semua Lembaga"
                    className="text-xs font-semibold cursor-pointer"
                  >
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
            ) : null}
          </div>
        )}
      </div>

      {isError ? (
        <div className="rounded-xl border border-error/25 bg-error/5 p-4 text-xs text-error flex justify-between items-center">
          <span>Gagal memuat data statistik dashboard dari server.</span>
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
              <MutuInfo />
              <RekognisiPieChart data={facultyData} />
            </div>
          )}
        </>
      )}
    </div>
  );
}

function formatCategoryName(key: string): string {
  return key
    .split("-")
    .map((s) => s.charAt(0).toUpperCase() + s.slice(1))
    .join(" ");
}

function MutuInfo(): React.JSX.Element {
  const [activeAkredId] = useState<string>(() =>
    typeof window !== "undefined"
      ? localStorage.getItem("active_akreditasi_id") || "akred-1"
      : "akred-1",
  );

  const { data: statsRes } = useGetAccreditationStatsQuery(activeAkredId, {
    skip: !activeAkredId,
  });

  const stats = statsRes?.data;

  const categories = [
    "budaya-mutu",
    "relevansi-pendidikan",
    "relevansi-penelitian",
    "relevansi-pkm",
    "akuntabilitas",
    "diferensiasi-misi",
  ];

  const chartData = stats
    ? categories.map((cat) => {
        const prefix = ((): string => {
          switch (cat) {
            case "budaya-mutu":
              return "quality_culture";
            case "relevansi-pendidikan":
              return "education_relevance";
            case "relevansi-penelitian":
              return "research_relevance";
            case "relevansi-pkm":
              return "community_service_relevance";
            case "akuntabilitas":
              return "accountability";
            case "diferensiasi-misi":
              return "mission_differentiation";
            default:
              return cat;
          }
        })();

        // const toPercent = (v: number) => Number((v * (100 / 3)).toFixed(2));

        const inputVal = Number(
          stats[`${prefix}_input` as keyof typeof stats] || 0,
        );
        const processVal = Number(
          stats[`${prefix}_process` as keyof typeof stats] || 0,
        );
        const outputVal = Number(
          stats[`${prefix}_output` as keyof typeof stats] || 0,
        );
        const impactVal = Number(
          stats[`${prefix}_impact` as keyof typeof stats] || 0,
        );

        return {
          category: cat,
          categoryLabel: formatCategoryName(cat),
          masukan: inputVal,
          proses: processVal,
          luaran: outputVal,
          dampak: impactVal,
        };
      })
    : [];

  const overallAvg = stats ? Number(stats.accreditation_total || 0) : 0;

  const getProjectedStatus = (score: number) => {
    if (score >= 80)
      return {
        label: "UNGGUL",
        class: "bg-success/10 text-success border-success/20",
        desc: "Perguruan Tinggi memiliki budaya mutu berkelanjutan yang unggul secara nasional.",
      };

    return {
      label: "Tidak Unggul",
      class: "bg-amber-500/10 text-amber-600 border-amber-500/20",
      desc: "Pemenuhan standar mutu BANPT belum mencukupi.",
    };
  };

  const status = getProjectedStatus(overallAvg);

  return (
    <div className="flex flex-col justify-between space-y-6">
      <Card className="border border-border shadow-sm bg-card">
        <CardHeader className="pb-3">
          <CardTitle className="text-xs font-bold text-foreground tracking-wide">
            Proyeksi Capaian Institusi
          </CardTitle>
          <CardDescription className="text-[10px] text-muted-foreground">
            Hasil akumulasi penilaian instrumen mutu BANPT saat ini.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-4 bg-muted/20 p-4 border border-border rounded-xl">
            <div className="flex items-center justify-center h-12 w-12 rounded-lg bg-primary/10 border border-primary/20 shrink-0 text-primary">
              <Award className="h-6 w-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs text-muted-foreground uppercase font-bold tracking-wider">
                  Status:
                </span>
                <span
                  className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold border ${status.class}`}
                >
                  {status.label}
                </span>
              </div>
              <p className="text-base font-extrabold text-foreground mt-0.5">
                Rerata Skor Mutu:{" "}
                <span className="text-primary">{overallAvg}</span> / 100
              </p>
            </div>
          </div>
          <p className="text-xs text-muted-foreground leading-relaxed">
            {status.desc} Isilah bukti dokumen di semua sub-menu untuk
            mengoptimalkan kevalidan audit mutu.
          </p>
        </CardContent>
      </Card>

      <Card className="border border-border shadow-sm bg-card flex-1">
        <CardHeader className="pb-3">
          <CardTitle className="text-xs font-bold text-foreground tracking-wide">
            Detail Rincian Aspek per Kategori
          </CardTitle>
          <CardDescription className="text-[10px] text-muted-foreground">
            Pilih menu di bawah ini untuk melihat detail pengisi indikator tiap
            tahapan.
          </CardDescription>
        </CardHeader>
        <CardContent className="px-3">
          <div className="divide-y divide-border/40">
            {chartData.map((data) => {
              const avgCatPercent = parseFloat(
                (
                  (data.masukan + data.proses + data.luaran + data.dampak) /
                  4
                ).toFixed(2),
              );
              return (
                <div
                  key={data.category}
                  className="flex items-center justify-between py-2.5 px-3 hover:bg-muted/30 rounded-lg transition-all duration-150"
                >
                  <div className="space-y-0.5">
                    <span className="text-xs font-bold text-foreground block capitalize">
                      {data.categoryLabel}
                    </span>
                    <span className="text-[10px] text-muted-foreground block">
                      Masukan: {data.masukan}% | Proses: {data.proses}% |
                      Luaran: {data.luaran}% | Dampak: {data.dampak}%
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-xs font-extrabold text-foreground text-right">
                      {avgCatPercent}%
                    </span>
                    <Link href={`/dashboard/mutu-banpt/${data.category}`}>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7 text-muted-foreground hover:text-primary hover:bg-primary/10 cursor-pointer"
                      >
                        <ArrowRight className="h-4 w-4" />
                      </Button>
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
