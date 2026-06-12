import React, { useState } from "react";
import { DosenData } from "@/types/rekognisi";
import { ChevronDown, ChevronUp } from "lucide-react";
import { Combobox } from "@/components/ui/combobox";

interface RekognisiChartProps {
  data: DosenData[];
  selectedProdi: string;
  onProdiChange: (prodi: string) => void;
  prodiOptions: { value: string; label: string }[];
}

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
  const chartBars = jenisList
    .map((jenis) => {
      const count = data.filter((item) => item.jenisRekognisi === jenis).length;
      return { name: jenis, count };
    })
    .sort((a, b) => b.count - a.count); // Sort by count descending

  const scrollClass = isExpanded
    ? "space-y-3 pr-2"
    : "space-y-3 max-h-[160px] overflow-y-auto pr-2 scrollbar-thin";

  return (
    <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
      <div className="flex items-center justify-between mb-4 pb-2 border-b border-border/40">
        <h2 className="text-xs font-bold text-foreground uppercase tracking-wider">
          Jenis Rekognisi Dosen
        </h2>

        {/* Combobox filter prodi replaces the old badge */}
        <Combobox
          options={prodiOptions}
          value={selectedProdi}
          onChange={onProdiChange}
          placeholder="Filter Prodi..."
          searchPlaceholder="Cari prodi..."
          className="w-[180px] h-8 text-xs font-semibold"
        />
      </div>

      {/* Horizontal Bar Chart - Max height 160px with scroll or auto height based on isExpanded */}
      <div className={scrollClass}>
        {chartBars.length > 0 ? (
          chartBars.map((bar, idx) => {
            const maxCount = Math.max(...chartBars.map((b) => b.count), 1);
            const percentage = (bar.count / maxCount) * 100;
            return (
              <div key={idx} className="flex items-center gap-4">
                <span
                  className="w-44 shrink-0 text-xs font-semibold text-foreground text-left truncate"
                  title={bar.name}
                >
                  {bar.name}
                </span>
                <div className="flex-1 h-6 bg-muted rounded-md overflow-hidden relative">
                  <div
                    className="h-full bg-primary/80 hover:bg-primary transition-all duration-500 rounded-r-md"
                    style={{ width: `${percentage}%` }}
                  ></div>
                </div>
                <span className="w-10 text-start text-xs font-bold text-muted-foreground">
                  {bar.count}
                </span>
              </div>
            );
          })
        ) : (
          <div className="py-8 text-center text-xs text-muted-foreground">
            Tidak ada data untuk ditampilkan grafik
          </div>
        )}
      </div>

      <div className="mt-3 border-t border-border/40 pt-3 flex justify-between items-center text-[9px] font-semibold text-muted-foreground/60 uppercase tracking-wider">
        <span>Menampilkan {chartBars.length} Jenis Rekognisi</span>

        {/* Toggle Expand / Collapse Button */}
        {chartBars.length > 4 && (
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="text-[9px] font-bold text-primary hover:underline flex items-center gap-1 cursor-pointer bg-transparent border-0 outline-none"
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
