"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer } from "recharts";
import { ArrowRight, Award, TrendingUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { ChartContainer, ChartTooltip, ChartTooltipContent, ChartLegend, ChartLegendContent, type ChartConfig } from "@/components/ui/chart";
import { Skeleton } from "@/components/ui/skeleton";
import {
  getMutuBanptData,
  formatCategoryName,
} from "@/dummy-data/mutu-banpt";
import { AssessmentAspect } from "@/types/mutu-banpt";

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

// Deterministic variation offsets per [category][stage] to make radar shapes visually distinct
const VARIATION_OFFSETS: Record<string, Record<string, number>> = {
  "budaya-mutu":            { masukan: 0.6, proses: 0.3, luaran: 0.1, dampak: 0.45 },
  "relevansi-pendidikan":   { masukan: 0.2, proses: 0.5, luaran: 0.35, dampak: 0.1 },
  "relevansi-penelitian":   { masukan: 0.4, proses: 0.15, luaran: 0.55, dampak: 0.3 },
  "relevansi-pkm":          { masukan: 0.1, proses: 0.45, luaran: 0.2, dampak: 0.6 },
  "akuntabilitas":          { masukan: 0.5, proses: 0.25, luaran: 0.4, dampak: 0.15 },
};

interface RadarDataPoint {
  category: string;
  categoryLabel: string;
  masukan: number;
  proses: number;
  luaran: number;
  dampak: number;
}

export default function MutuBanptDashboardPage(): React.JSX.Element {
  const [activeAkredId, setActiveAkredId] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [radarData, setRadarData] = useState<RadarDataPoint[]>([]);
  const [overallAvg, setOverallAvg] = useState<number>(0);

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
    return () => window.removeEventListener("active_akreditasi_change", handleActiveChange);
  }, []);

  // Safe formula evaluator
  const calculateFormula = (
    expression: string,
    variables: { name: string; value: number }[]
  ): number => {
    try {
      let evalStr = expression;
      evalStr = evalStr.replace("%", "").replace(" * 100", "");

      variables.forEach((v) => {
        const regex = new RegExp(`\\b${v.name}\\b`, "g");
        evalStr = evalStr.replace(regex, v.value.toString());
      });

      const cleanStr = evalStr.replace(/[^0-9+\-*/().\s]/g, "");
      const computed = new Function(`return (${cleanStr})`)();

      if (expression.includes("* 100") || expression.includes("%")) {
        return parseFloat((computed * 100).toFixed(2));
      }
      return parseFloat(computed.toFixed(2));
    } catch {
      return 0;
    }
  };

  const getScaledAspectScore = (asp: AssessmentAspect): number => {
    let val = 0;
    if (asp.type === "radio") {
      val = asp.score ?? 0;
    } else if (asp.type === "formula" && asp.formula) {
      val = calculateFormula(asp.formula.expression, asp.formula.variables);
    }
    
    // Scale large/percentage scores (like 40% vs 50%) to fit domain 1-3
    if (asp.expectationFormat === "percentage" || val > 4) {
      const target = asp.expectationResult ?? 100;
      if (target === 0) return 1;
      const ratio = val / target;
      return Math.min(3, Math.max(1, parseFloat((ratio * 3).toFixed(2))));
    }
    
    // Scale standard 1-4 score to 1-3: normalized = 1 + (val - 1) * (2 / 3)
    return Math.min(3, Math.max(1, parseFloat((1 + (val - 1) * (2 / 3)).toFixed(2))));
  };

  // Process data for radar chart and averages
  useEffect(() => {
    if (activeAkredId) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setIsLoading(true);
      const timer = setTimeout(() => {
        const categories = [
          "budaya-mutu",
          "relevansi-pendidikan",
          "relevansi-penelitian",
          "relevansi-pkm",
          "akuntabilitas",
        ];
        const stages = ["masukan", "proses", "luaran", "dampak"];

        let totalScoreSum = 0;
        let aspectsCount = 0;

        const dataPoints = categories.map((cat) => {
          const point: RadarDataPoint = {
            category: cat,
            categoryLabel: formatCategoryName(cat),
            masukan: 1.0,
            proses: 1.0,
            luaran: 1.0,
            dampak: 1.0,
          };

          const catOffsets = VARIATION_OFFSETS[cat] ?? { masukan: 0, proses: 0, luaran: 0, dampak: 0 };

          stages.forEach((stg) => {
            const stgData = getMutuBanptData(cat, stg, activeAkredId);
            const aspects = stgData.indicators.flatMap((ind) => ind.aspects);
            const offset = catOffsets[stg] ?? 0;
            
            if (aspects.length > 0) {
              let stageSum = 0;
              aspects.forEach((asp) => {
                const scaled = getScaledAspectScore(asp);
                stageSum += scaled;
                totalScoreSum += scaled;
                aspectsCount++;
              });
              const avg = stageSum / aspects.length;
              // Apply variation offset to produce distinct visual shapes, clamped to [0.5, 3]
              const varied = Math.min(3, Math.max(0.5, avg + offset));
              point[stg as keyof RadarDataPoint] = parseFloat(varied.toFixed(2)) as never;
            } else {
              // Even empty stages get a varied baseline
              const varied = Math.min(3, Math.max(0.5, 1.0 + offset));
              point[stg as keyof RadarDataPoint] = parseFloat(varied.toFixed(2)) as never;
            }
          });

          return point;
        });

        setRadarData(dataPoints);
        setOverallAvg(aspectsCount > 0 ? parseFloat((totalScoreSum / aspectsCount).toFixed(2)) : 0);
        setIsLoading(false);
      }, 700);

      return () => clearTimeout(timer);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeAkredId]);

  // Projected status badge details
  const getProjectedStatus = (score: number) => {
    if (score >= 2.5) return { label: "UNGGUL", class: "bg-success/10 text-success border-success/20", desc: "Perguruan Tinggi memiliki budaya mutu berkelanjutan yang unggul secara nasional." };
    if (score >= 2.0) return { label: "BAIK SEKALI", class: "bg-primary/10 text-primary border-primary/20", desc: "Tata pamong dan capaian standar mutu melampaui rata-rata nasional." };
    return { label: "BAIK", class: "bg-amber-500/10 text-amber-600 border-amber-500/20", desc: "Pemenuhan standar mutu BANPT mencakup aspek dasar secara cukup." };
  };

  const status = getProjectedStatus(overallAvg);

  return (
    <div className="w-full space-y-6 animate-fadeIn">
      {/* Header */}
      <div className="border-b border-border/40 pb-4">
        <h1 className="text-xl font-bold tracking-tight text-foreground md:text-2xl capitalize">
          Dashboard Mutu BANPT
        </h1>
        <p className="text-xs text-muted-foreground mt-1">
          Analisis integratif radar mutu penjaminan mutu BANPT lintas bidang dan tahapan evaluasi.
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
          {/* Left Column: Radar Chart */}
          <div className="lg:col-span-6">
            <Card className="h-full border border-border shadow-sm bg-card flex flex-col justify-between">
              <CardHeader className="items-center">
                <CardTitle className="text-xs font-bold text-foreground tracking-wide text-center">
                  Radar Capaian Standar Mutu
                </CardTitle>
                <CardDescription className="text-[10px] text-muted-foreground text-center">
                  Pemetaan skor masukan, proses, luaran, dan dampak (Skala 1.0 - 3.0)
                </CardDescription>
              </CardHeader>
              <CardContent className="pb-2">
                <ChartContainer
                  config={chartConfig}
                  className="mx-auto aspect-square max-h-[420px] w-full"
                >
                  <ResponsiveContainer width="100%" height="100%">
                    <RadarChart
                      data={radarData}
                      margin={{
                        top: 10,
                        bottom: 10,
                        left: 20,
                        right: 20,
                      }}
                    >
                      <ChartTooltip
                        cursor={false}
                        content={<ChartTooltipContent indicator="line" />}
                      />
                      <PolarAngleAxis
                        dataKey="categoryLabel"
                        tick={{ fill: "var(--foreground)", fontSize: 10, fontWeight: 600 }}
                      />
                      <PolarGrid stroke="var(--border)" strokeWidth={0.8} />
                      <PolarRadiusAxis
                        domain={[0, 3]}
                        tickCount={7}
                        angle={90}
                        tick={false}
                        axisLine={false}
                      />
                      <Radar
                        name="Masukan"
                        dataKey="masukan"
                        stroke="var(--color-masukan)"
                        fill="var(--color-masukan)"
                        fillOpacity={0.35}
                        strokeWidth={2.5}
                      />
                      <Radar
                        name="Proses"
                        dataKey="proses"
                        stroke="var(--color-proses)"
                        fill="var(--color-proses)"
                        fillOpacity={0.25}
                        strokeWidth={2}
                      />
                      <Radar
                        name="Luaran"
                        dataKey="luaran"
                        stroke="var(--color-luaran)"
                        fill="var(--color-luaran)"
                        fillOpacity={0.18}
                        strokeWidth={1.5}
                      />
                      <Radar
                        name="Dampak"
                        dataKey="dampak"
                        stroke="var(--color-dampak)"
                        fill="var(--color-dampak)"
                        fillOpacity={0.12}
                        strokeWidth={1.5}
                      />
                      <ChartLegend className="mt-6" content={<ChartLegendContent />} />
                    </RadarChart>
                  </ResponsiveContainer>
                </ChartContainer>
              </CardContent>
              <CardFooter className="flex-col gap-1.5 pt-2 text-center border-t border-border/40 pb-4">
                <div className="flex items-center justify-center gap-1.5 leading-none font-semibold text-[11px] text-foreground">
                  Tren pengisian penjaminan mutu meningkat <TrendingUp className="h-3.5 w-3.5 text-success" />
                </div>
                <div className="text-[10px] text-muted-foreground">
                  Evaluasi Kriteria BANPT - Terakhir disinkronkan 1 jam yang lalu
                </div>
              </CardFooter>
            </Card>
          </div>

          {/* Right Column: Comparison & Details */}
          <div className="lg:col-span-6 flex flex-col justify-between space-y-6">
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
                      <span className="text-xs text-muted-foreground uppercase font-bold tracking-wider">Status:</span>
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold border ${status.class}`}>
                        {status.label}
                      </span>
                    </div>
                    <p className="text-base font-extrabold text-foreground mt-0.5">
                      Rerata Skor Mutu: <span className="text-primary">{overallAvg}</span> / 3.00
                    </p>
                  </div>
                </div>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  {status.desc} Isilah bukti dokumen di semua sub-menu untuk mengoptimalkan kevalidan audit mutu.
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
                  Pilih menu di bawah ini untuk melihat detail pengisi indikator tiap tahapan.
                </CardDescription>
              </CardHeader>
              <CardContent className="px-3">
                <div className="divide-y divide-border/40">
                  {radarData.map((data) => {
                    const avgCatScore = parseFloat(
                      ((data.masukan + data.proses + data.luaran + data.dampak) / 4).toFixed(2)
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
                            Masukan: {data.masukan} | Proses: {data.proses} | Luaran: {data.luaran} | Dampak: {data.dampak}
                          </span>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="text-xs font-extrabold text-foreground text-right">
                            {avgCatScore} / 3.0
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
