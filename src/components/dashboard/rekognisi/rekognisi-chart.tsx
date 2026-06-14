"use client";

import React, { useState } from "react";
import { DosenData } from "@/types/rekognisi";
import { Combobox } from "@/components/ui/combobox";
import { ChevronDown, ChevronUp } from "lucide-react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  LabelList,
  XAxis,
  YAxis,
} from "recharts";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";

interface RekognisiChartProps {
  data: DosenData[];
  selectedProdi: string;
  onProdiChange: (prodi: string) => void;
  prodiOptions: { value: string; label: string }[];
}

const chartConfig = {
  count: {
    label: "Jumlah",
    color: "var(--primary)",
  },
} satisfies ChartConfig;

export function RekognisiChart({
  data,
  selectedProdi,
  onProdiChange,
  prodiOptions,
}: RekognisiChartProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  // Get all unique jenisRekognisi names from the active data
  const jenisList = Array.from(
    new Set(data.map((item) => item.jenisRekognisi)),
  );

  // Calculate count for each jenisRekognisi
  const chartData = jenisList
    .map((jenis) => {
      const count = data.filter((item) => item.jenisRekognisi === jenis).length;
      return { name: jenis, count };
    })
    .sort((a, b) => b.count - a.count); // Sort by count descending

  const scrollClass = isExpanded
    ? "pt-4"
    : "pt-4 max-h-[160px] overflow-y-auto pr-2 scrollbar-thin";

  const chartHeight = Math.max(chartData.length * 40, 140);

  return (
    <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
      <div className="flex flex-row items-center justify-between pb-4 mb-2 border-b border-border/40">
        <div className="space-y-1">
          <h2 className="text-xs font-bold text-foreground uppercase tracking-wider">
            Jenis Rekognisi Dosen
          </h2>
          <p className="text-xs text-muted-foreground">
            Grafik pembagian jenis rekognisi aktif
          </p>
        </div>
        <Combobox
          options={prodiOptions}
          value={selectedProdi}
          onChange={onProdiChange}
          placeholder="Filter Prodi..."
          searchPlaceholder="Cari prodi..."
          className="w-45 h-8 text-xs font-semibold"
        />
      </div>
      <div className={scrollClass}>
        {chartData.length > 0 ? (
          <ChartContainer
            config={chartConfig}
            className="w-full"
            style={{ height: `${chartHeight}px` }}
          >
            <BarChart
              accessibilityLayer
              data={chartData}
              layout="vertical"
              margin={{
                left: 10,
                right: 32,
                top: 5,
                bottom: 5,
              }}
            >
              <CartesianGrid
                horizontal={false}
                strokeDasharray="3 3"
                className="stroke-border/50"
              />
              <YAxis
                dataKey="name"
                type="category"
                tickLine={false}
                tickMargin={10}
                axisLine={false}
                hide
              />
              <XAxis dataKey="count" type="number" hide />
              <ChartTooltip
                cursor={false}
                content={<ChartTooltipContent indicator="line" />}
              />
              <Bar dataKey="count" fill="var(--color-count)" radius={6}>
                <LabelList
                  dataKey="name"
                  position="insideLeft"
                  offset={10}
                  className="fill-white font-semibold text-xs"
                  fill="#ffffff"
                  fontSize={12}
                />
                <LabelList
                  dataKey="count"
                  position="right"
                  offset={10}
                  className="fill-muted-foreground font-bold text-xs"
                  fontSize={12}
                />
              </Bar>
            </BarChart>
          </ChartContainer>
        ) : (
          <div className="py-12 text-center text-xs text-muted-foreground">
            Tidak ada data untuk ditampilkan grafik
          </div>
        )}
      </div>
      <div className="mt-3 border-t border-border/40 pt-3 flex justify-between items-center text-xs font-semibold text-muted-foreground/60 uppercase tracking-wider">
        <span>Menampilkan {chartData.length} Jenis Rekognisi</span>

        {/* Toggle Expand / Collapse Button */}
        {chartData.length > 4 && (
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="text-xs font-bold text-primary hover:underline flex items-center gap-1 cursor-pointer bg-transparent border-0 outline-none"
          >
            {isExpanded ? (
              <>
                Sembunyikan <ChevronUp className="h-3.5 w-3.5" />
              </>
            ) : (
              <>
                Lihat Semua <ChevronDown className="h-3.5 w-3.5" />
              </>
            )}
          </button>
        )}
      </div>
    </div>
  );
}
