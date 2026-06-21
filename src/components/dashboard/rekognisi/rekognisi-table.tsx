import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowUpDown, ArrowUp, ArrowDown, ExternalLink, ChevronDown, ChevronUp, Copy, Check } from "lucide-react";
import { DosenData } from "@/types/rekognisi";

interface RekognisiTableProps {
  data: DosenData[];
}

export function RekognisiTable({ data }: RekognisiTableProps) {
  const router = useRouter();
  const [isExpanded, setIsExpanded] = useState(false);
  const [sortField, setSortField] = useState<keyof DosenData | null>(null);
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const handleCopy = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleSort = (field: keyof DosenData) => {
    const isAsc = sortField === field && sortDirection === "asc";
    setSortField(field);
    setSortDirection(isAsc ? "desc" : "asc");
  };

  const sortedData = [...data].sort((a, b) => {
    if (!sortField) return 0;
    const valA = a[sortField].toString().toLowerCase();
    const valB = b[sortField].toString().toLowerCase();
    if (valA < valB) return sortDirection === "asc" ? -1 : 1;
    if (valA > valB) return sortDirection === "asc" ? 1 : -1;
    return 0;
  });

  const renderSortIcon = (field: keyof DosenData) => {
    if (sortField !== field) {
      return <ArrowUpDown className="h-3 w-3 text-muted-foreground/70 group-hover:text-foreground transition-colors" />;
    }
    return sortDirection === "asc" ? (
      <ArrowUp className="h-3 w-3 text-primary transition-colors" />
    ) : (
      <ArrowDown className="h-3 w-3 text-primary transition-colors" />
    );
  };

  const scrollClass = isExpanded 
    ? "overflow-x-auto rounded-lg border border-border pr-1" 
    : "overflow-x-auto rounded-lg border border-border max-h-[300px] overflow-y-auto pr-1 scrollbar-thin";

  return (
    <div className="space-y-3">
      {/* Set max height with vertical scroll or full height based on isExpanded */}
      <div className={scrollClass}>
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-muted/30 text-xs font-bold text-muted-foreground uppercase">
              <th className="px-4 py-3 font-semibold sticky top-0 bg-card z-10 border-b border-border shadow-[inset_0_-1px_0_0_var(--border)]">NIP</th>
              
              {/* Column sort indicators styled in default theme icons */}
              <th 
                onClick={() => handleSort("nama")} 
                className="px-4 py-3 font-semibold cursor-pointer hover:bg-muted/50 transition-colors group sticky top-0 bg-card z-10 border-b border-border shadow-[inset_0_-1px_0_0_var(--border)]"
              >
                <div className="flex items-center gap-1.5">
                  Nama Dosen
                  {renderSortIcon("nama")}
                </div>
              </th>
              
              <th 
                onClick={() => handleSort("prodi")} 
                className="px-4 py-3 font-semibold cursor-pointer hover:bg-muted/50 transition-colors group sticky top-0 bg-card z-10 border-b border-border shadow-[inset_0_-1px_0_0_var(--border)]"
              >
                <div className="flex items-center gap-1.5">
                  Prodi
                  {renderSortIcon("prodi")}
                </div>
              </th>
              
              <th 
                onClick={() => handleSort("jenisRekognisi")} 
                className="px-4 py-3 font-semibold cursor-pointer hover:bg-muted/50 transition-colors group sticky top-0 bg-card z-10 border-b border-border shadow-[inset_0_-1px_0_0_var(--border)]"
              >
                <div className="flex items-center gap-1.5">
                  Jenis Rekognisi
                  {renderSortIcon("jenisRekognisi")}
                </div>
              </th>
              
              <th 
                onClick={() => handleSort("tahun")} 
                className="px-4 py-3 font-semibold cursor-pointer hover:bg-muted/50 transition-colors group sticky top-0 bg-card z-10 border-b border-border shadow-[inset_0_-1px_0_0_var(--border)]"
              >
                <div className="flex items-center gap-1.5">
                  Tahun
                  {renderSortIcon("tahun")}
                </div>
              </th>
              
              <th className="px-4 py-3 font-semibold sticky top-0 bg-card z-10 border-b border-border shadow-[inset_0_-1px_0_0_var(--border)]">Deskripsi</th>
              <th className="px-4 py-3 font-semibold text-center sticky top-0 bg-card z-10 border-b border-border shadow-[inset_0_-1px_0_0_var(--border)]">Bukti</th>
            </tr>
          </thead>
          <tbody>
            {sortedData.length > 0 ? (
              sortedData.map((dosen, i) => (
                <tr 
                  key={dosen.id || i} 
                  onClick={() => router.push(`/dashboard/rekognisi-dosen/${dosen.id}`)}
                  className="border-b border-border last:border-0 hover:bg-muted/10 text-xs text-foreground transition-colors cursor-pointer"
                >
                  <td className="px-4 py-3.5 font-medium text-muted-foreground">{dosen.nip}</td>
                  <td className="px-4 py-3.5 font-semibold">{dosen.nama}</td>
                  <td className="px-4 py-3.5">{dosen.prodi}</td>
                  <td className="px-4 py-3.5">
                    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                      dosen.jenisRekognisi === "Narasumber" ? "bg-cyan-500/10 text-cyan-600 dark:text-cyan-400" :
                      dosen.jenisRekognisi === "Tenaga Ahli" ? "bg-indigo-500/10 text-indigo-600 dark:text-indigo-400" :
                      dosen.jenisRekognisi === "Reviewer Jurnal" ? "bg-purple-500/10 text-purple-600 dark:text-purple-400" :
                      dosen.jenisRekognisi === "Asesor Akreditasi" ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400" :
                      "bg-amber-500/10 text-amber-600 dark:text-amber-400"
                    }`}>
                      {dosen.jenisRekognisi}
                    </span>
                  </td>
                  <td className="px-4 py-3.5 font-semibold text-muted-foreground">{dosen.tahun}</td>
                  <td className="px-4 py-3.5 text-muted-foreground line-clamp-1 max-w-[200px]" title={dosen.deskripsi}>
                    {dosen.deskripsi}
                  </td>
                  <td className="px-4 py-3.5 text-center">
                    <div className="flex flex-col items-center gap-1.5">
                      {dosen.buktiUrl.split(",").filter(Boolean).map((url, idx) => {
                        const uniqueKey = `${dosen.id || i}-${idx}`;
                        return (
                          <div key={idx} className="flex items-center gap-1">
                            {dosen.buktiUrl.split(",").filter(Boolean).length > 1 && (
                              <span className="text-[10px] text-muted-foreground mr-0.5 font-bold">#{idx + 1}</span>
                            )}
                            <a 
                              href={url}
                              target="_blank"
                              rel="noopener noreferrer"
                              onClick={(e) => e.stopPropagation()}
                              className="inline-flex h-7 w-7 items-center justify-center rounded-md border border-border hover:bg-muted text-muted-foreground transition-colors"
                              title={`Kunjungi Link Bukti ${idx + 1}`}
                            >
                              <ExternalLink className="h-3.5 w-3.5" />
                            </a>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleCopy(uniqueKey, url);
                              }}
                              className="inline-flex h-7 w-7 items-center justify-center rounded-md border border-border hover:bg-muted text-muted-foreground transition-colors cursor-pointer"
                              title={`Salin Link Bukti ${idx + 1}`}
                            >
                              {copiedId === uniqueKey ? (
                                <Check className="h-3.5 w-3.5 text-success" />
                              ) : (
                                <Copy className="h-3.5 w-3.5" />
                              )}
                            </button>
                          </div>
                        );
                      })}
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={7} className="px-4 py-8 text-center text-xs text-muted-foreground">
                  Tidak ada data ditemukan
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Table Footer Actions */}
      <div className="flex justify-between items-center text-xs font-semibold text-muted-foreground/60 uppercase tracking-wider pt-2">
        <span>Menampilkan {sortedData.length} baris data</span>

        {/* Toggle Expand / Collapse Button */}
        {sortedData.length > 5 && (
          <button 
            onClick={() => setIsExpanded(!isExpanded)} 
            className="text-xs font-bold text-primary hover:underline flex items-center gap-1 cursor-pointer bg-transparent border-0 outline-none"
          >
            {isExpanded ? (
              <>Sembunyikan <ChevronUp className="h-3.5 w-3.5" /></>
            ) : (
              <>Lihat Semua <ChevronDown className="h-3.5 w-3.5" /></>
            )}
          </button>
        )}
      </div>
    </div>
  );
}
