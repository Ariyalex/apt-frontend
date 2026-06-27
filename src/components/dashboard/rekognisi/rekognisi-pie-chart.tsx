"use client";

import React from "react";
import { DosenData } from "@/types/rekognisi";
import { Pie, PieChart } from "recharts";
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
  type ChartConfig,
} from "@/components/ui/chart";

interface RekognisiPieChartProps {
  data: DosenData[];
}

export function RekognisiPieChart({
  data,
}: RekognisiPieChartProps): React.JSX.Element {
  // Get all unique jenisRekognisi names from the active data
  const jenisList = Array.from(
    new Set(data.map((item) => item.jenisRekognisi)),
  );

  // Calculate count and map to colors for each jenis
  // Calculate count and map to colors for each jenis
  const chartData = jenisList
    .map((jenis) => {
      const count = data.filter((item) => item.jenisRekognisi === jenis).length;
      const key = jenis.toLowerCase().replace(/\s+/g, "_");
      return {
        jenisKey: key,
        name: jenis,
        count: count,
        fill: `var(--color-${key})`,
      };
    })
    .sort((a, b) => b.count - a.count);

  // Dynamic ChartConfig
  const chartConfig: ChartConfig = {
    count: {
      label: "Jumlah",
    },
  };

  chartData.forEach((item, i) => {
    const colorIndex = (i % 5) + 1;
    chartConfig[item.jenisKey] = {
      label: item.name,
      color: `var(--chart-${colorIndex})`,
    };
  });

  const chartHeight = 320;

  return (
    <Card className="flex flex-col rounded-xl border border-border bg-card shadow-sm h-full justify-between">
      <CardHeader className="flex flex-row items-center justify-between pb-4 mb-2 border-b border-border/40">
        <div className="space-y-1">
          <CardTitle className="text-xs font-bold text-foreground uppercase tracking-wider">
            Jenis Rekognisi Dosen
          </CardTitle>
          <CardDescription className="text-xs text-muted-foreground">
            Grafik persentase pembagian jenis rekognisi aktif
          </CardDescription>
        </div>
      </CardHeader>
      <CardContent className="flex-1 pb-4 flex items-center justify-center min-h-[340px]">
        {chartData.length > 0 ? (
          <div className="flex flex-row items-center justify-between gap-6 w-full h-full">
            {/* Left: Large Pie Chart */}
            <div className="flex-1 flex justify-center items-center max-w-[55%]">
              <ChartContainer
                config={chartConfig}
                className="w-full aspect-square"
                style={{ height: `${chartHeight}px` }}
              >
                <PieChart>
                  <ChartTooltip content={<ChartTooltipContent hideLabel />} />
                  <Pie
                    data={chartData}
                    dataKey="count"
                    nameKey="jenisKey"
                    label={false}
                    outerRadius="95%"
                  />
                </PieChart>
              </ChartContainer>
            </div>

            {/* Right: Legend list detailing each segment */}
            <div className="flex-1 flex flex-col justify-center space-y-2 border-l border-border/40 pl-6 h-full min-w-[45%]">
              <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-2">
                Keterangan
              </span>
              <div className="space-y-2.5 max-h-[300px] overflow-y-auto pr-1 scrollbar-thin">
                {chartData.map((item) => {
                  const config = chartConfig[item.jenisKey];
                  return (
                    <div
                      key={item.jenisKey}
                      className="flex items-center justify-between text-xs gap-3"
                    >
                      <div className="flex items-center gap-2 min-w-0">
                        <span
                          className="h-3 w-3 shrink-0 rounded-full animate-fadeIn"
                          style={{ backgroundColor: config?.color }}
                        />
                        <span
                          className="font-semibold text-foreground truncate"
                          title={item.name}
                        >
                          {item.name}
                        </span>
                      </div>
                      <span className="font-bold text-muted-foreground font-mono shrink-0">
                        {item.count} Dosen
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        ) : (
          <div className="py-12 text-center text-xs text-muted-foreground">
            Tidak ada data untuk ditampilkan grafik
          </div>
        )}
      </CardContent>
    </Card>
  );
}
