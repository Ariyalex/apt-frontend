"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  Bar,
  BarChart,
  CartesianGrid,
  XAxis,
  YAxis,
  ReferenceLine,
  ResponsiveContainer,
} from "recharts";
import { ArrowRight, Award } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
  type ChartConfig,
} from "@/components/ui/chart";
import { Skeleton } from "@/components/ui/skeleton";
import { formatCategoryName } from "@/lib/utils";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { useGetAccreditationStatsQuery } from "@/store/services/accreditationApi";

const chartConfig = {
  masukan: {
    label: "Masukan",
    color: "var(--chart-1)",
  },
  proses: {
    label: "Proses",
    color: "var(--chart-2)",
  },
  luaran: {
    label: "Luaran",
    color: "var(--chart-3)",
  },
  dampak: {
    label: "Dampak",
    color: "var(--chart-4)",
  },
} satisfies ChartConfig;

const mapCategoryToApiPrefix = (cat: string): string => {
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
};

interface DataPoint {
  category: string;
  categoryLabel: string;
  masukan: number; // percent 0-100
  proses: number;
  luaran: number;
  dampak: number;
}

export default function MutuBanptDashboardPage(): React.JSX.Element {
  const [activeAkredId, setActiveAkredId] = useState<string>("");
  const [selectedStage, setSelectedStage] = useState<
    "semua" | "masukan" | "proses" | "luaran" | "dampak"
  >("semua");
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [radarData, setRadarData] = useState<DataPoint[]>([]);
  const [overallAvg, setOverallAvg] = useState<number>(0);

  const { data: statsRes, isFetching: isStatsFetching } =
    useGetAccreditationStatsQuery(activeAkredId, {
      skip: !activeAkredId,
      refetchOnMountOrArgChange: true,
    });

  // Sync active accreditation
  useEffect(() => {
    const handleActiveChange = () => {
      const storedId = localStorage.getItem("active_akreditasi_id");
      if (storedId) {
        setActiveAkredId(storedId);
        setIsLoading(true);
      }
    };

    const storedId = localStorage.getItem("active_akreditasi_id");
    if (storedId) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setActiveAkredId(storedId);
    } else {
      setActiveAkredId("akred-1"); // fallback default
    }

    window.addEventListener("active_akreditasi_change", handleActiveChange);
    return () =>
      window.removeEventListener(
        "active_akreditasi_change",
        handleActiveChange,
      );
  }, []);

  useEffect(() => {
    if (isStatsFetching) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setIsLoading(true);
      return;
    }
    if (statsRes?.data) {
      const stats = statsRes.data;
      const categories = [
        "budaya-mutu",
        "relevansi-pendidikan",
        "relevansi-penelitian",
        "relevansi-pkm",
        "akuntabilitas",
        "diferensiasi-misi",
      ];

      const dataPoints = categories.map((cat) => {
        const prefix = mapCategoryToApiPrefix(cat);
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

        // Convert 0-3 scale to 0-100 percent
        // const toPercent = (v: number) => Number((v * (100 / 3)).toFixed(2));

        return {
          category: cat,
          categoryLabel: formatCategoryName(cat),
          masukan: inputVal,
          proses: processVal,
          luaran: outputVal,
          dampak: impactVal,
        };
      });

      setRadarData(dataPoints);
      setOverallAvg(Number(stats.accreditation_total || 0));
      setIsLoading(false);
    } else {
      setIsLoading(false);
    }
  }, [statsRes, isStatsFetching]);

  // Dummy data to use during development.
  // TOGGLE: USE_REAL_DATA
  // To use real data, replace `chartData` below with `radarData`
  // (radarData already converted to percent in the effect above).

  // Use dummy data for now. To switch to real data, set `chartData = radarData`.
  const chartData: DataPoint[] = radarData; // <-- swap to `radarData` when ready

  // Projected status badge details
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

  // const chartWidth = Math.max(720, chartData.length * 140);

  return (
    <div className="w-full space-y-6 animate-fadeIn">
      {/* Header */}
      <div className="border-b border-border/40 pb-4">
        <h1 className="text-xl font-bold tracking-tight text-foreground md:text-2xl capitalize">
          Dashboard Mutu BANPT
        </h1>
        <p className="text-xs text-muted-foreground mt-1">
          Analisis integratif bar mutu penjaminan mutu BANPT lintas bidang dan
          tahapan evaluasi (persentase 0–100).
        </p>
      </div>

      {isLoading ? (
        /* Loading Skeletons */
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
          <div className="lg:col-span-6">
            <Card className="h-full border border-border shadow-sm bg-card">
              <CardHeader className="items-center">
                <Skeleton className="h-5 w-48 rounded bg-muted/40" />
                <Skeleton className="h-3.5 w-64 rounded mt-2 bg-muted/40" />
              </CardHeader>
              <CardContent className="flex justify-center items-center py-6">
                <Skeleton className="h-64 w-64 rounded-full bg-muted/40 animate-pulse" />
              </CardContent>
            </Card>
          </div>
          <div className="lg:col-span-6 space-y-6">
            <Card className="border border-border shadow-sm bg-card p-6 space-y-4">
              <Skeleton className="h-6 w-32 bg-muted/40" />
              <Skeleton className="h-4 w-full bg-muted/40" />
              <Skeleton className="h-20 w-full bg-muted/40" />
            </Card>
          </div>
        </div>
      ) : (
        /* Main Layout Content */
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
          {/* Left Column: Bar Chart */}
          <div className="lg:col-span-8">
            <Card className="h-full border border-border shadow-sm bg-card flex flex-col justify-between">
              <CardHeader className="flex flex-col sm:flex-row items-center justify-between gap-4 border-b border-border/40 pb-4">
                <div className="text-center sm:text-left">
                  <CardTitle className="text-xs font-bold text-foreground tracking-wide">
                    Bar Capaian Standar Mutu
                  </CardTitle>
                  <CardDescription className="text-[10px] text-muted-foreground mt-1">
                    Pemetaan persentase masukan, proses, luaran, dan dampak
                    (Skala 0 - 100)
                  </CardDescription>
                </div>
                <div className="w-[180px] shrink-0">
                  <Select
                    value={selectedStage}
                    onValueChange={(v) =>
                      setSelectedStage(
                        v as
                          | "semua"
                          | "masukan"
                          | "proses"
                          | "luaran"
                          | "dampak",
                      )
                    }
                  >
                    <SelectTrigger className="w-full h-8 bg-card border border-border rounded-lg px-2.5 py-1 text-[11px] font-semibold focus:outline-none focus:border-primary cursor-pointer justify-between">
                      <SelectValue placeholder="Pilih Tahap" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="semua">Semua Tahap</SelectItem>
                      <SelectItem value="masukan">Masukan (Input)</SelectItem>
                      <SelectItem value="proses">Proses (Process)</SelectItem>
                      <SelectItem value="luaran">Luaran (Output)</SelectItem>
                      <SelectItem value="dampak">Dampak (Impact)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardHeader>
              <CardContent className="pb-2 h-full flex justify-center items-center">
                <ChartContainer
                  config={chartConfig}
                  className="mx-auto aspect-square max-h-[420px] w-full"
                >
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={chartData}
                      margin={{ top: 10, bottom: 10, left: 10, right: 10 }}
                    >
                      <CartesianGrid vertical={false} stroke="var(--border)" />
                      <XAxis
                        dataKey="categoryLabel"
                        tickLine={false}
                        axisLine={false}
                        tick={{
                          fill: "var(--foreground)",
                          fontSize: 11,
                          fontWeight: 600,
                        }}
                      />
                      <YAxis
                        domain={[0, 100]}
                        tickFormatter={(v) => `${v}%`}
                        axisLine={false}
                        tick={{ fill: "var(--foreground)" }}
                        tickCount={6}
                      />
                      <ReferenceLine
                        y={80}
                        stroke="var(--border)"
                        strokeDasharray="4 4"
                      />
                      <ChartTooltip
                        cursor={false}
                        content={<ChartTooltipContent />}
                      />
                      {(selectedStage === "semua" ||
                        selectedStage === "masukan") && (
                        <Bar
                          dataKey="masukan"
                          name="Masukan"
                          fill="var(--color-masukan)"
                          radius={[6, 6, 0, 0]}
                        />
                      )}
                      {(selectedStage === "semua" ||
                        selectedStage === "proses") && (
                        <Bar
                          dataKey="proses"
                          name="Proses"
                          fill="var(--color-proses)"
                          radius={[6, 6, 0, 0]}
                        />
                      )}
                      {(selectedStage === "semua" ||
                        selectedStage === "luaran") && (
                        <Bar
                          dataKey="luaran"
                          name="Luaran"
                          fill="var(--color-luaran)"
                          radius={[6, 6, 0, 0]}
                        />
                      )}
                      {(selectedStage === "semua" ||
                        selectedStage === "dampak") && (
                        <Bar
                          dataKey="dampak"
                          name="Dampak"
                          fill="var(--color-dampak)"
                          radius={[6, 6, 0, 0]}
                        />
                      )}
                      <ChartLegend
                        className="mt-6"
                        content={<ChartLegendContent />}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </ChartContainer>
              </CardContent>
            </Card>
          </div>

          {/* Right Column: Comparison & Details */}
          <div className="lg:col-span-4 flex flex-col justify-between space-y-6">
            {/* Projected Status Card */}
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

            {/* Submenu Quick Navigation List */}
            <Card className="border border-border shadow-sm bg-card flex-1">
              <CardHeader className="pb-3">
                <CardTitle className="text-xs font-bold text-foreground tracking-wide">
                  Detail Rincian Aspek per Kategori
                </CardTitle>
                <CardDescription className="text-[10px] text-muted-foreground">
                  Pilih menu di bawah ini untuk melihat detail pengisi indikator
                  tiap tahapan.
                </CardDescription>
              </CardHeader>
              <CardContent className="px-3">
                <div className="divide-y divide-border/40">
                  {chartData.map((data) => {
                    const avgCatPercent = parseFloat(
                      (
                        (data.masukan +
                          data.proses +
                          data.luaran +
                          data.dampak) /
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
        </div>
      )}
    </div>
  );
}
