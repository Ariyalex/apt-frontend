"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { ExternalLink, Copy, Check, Edit2, CheckCircle2, XCircle, ArrowUpDown, ArrowUp, ArrowDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Submission } from "@/dummy-data/bagikan-form";

interface BagikanFormSubmissionsTableProps {
  submissions: Submission[];
  onAccept: (subId: string) => void;
  onDecline: (subId: string) => void;
  onEdit: (sub: Submission) => void;
}

export function BagikanFormSubmissionsTable({
  submissions,
  onAccept,
  onDecline,
  onEdit,
}: BagikanFormSubmissionsTableProps) {
  const router = useRouter();
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [sortField, setSortField] = useState<keyof Submission | null>(null);
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");

  const handleCopy = (e: React.MouseEvent, id: string, text: string) => {
    e.stopPropagation();
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleSort = (field: keyof Submission) => {
    const isAsc = sortField === field && sortDirection === "asc";
    setSortField(field);
    setSortDirection(isAsc ? "desc" : "asc");
  };

  const sortedSubmissions = [...submissions].sort((a, b) => {
    if (!sortField) return 0;
    const valA = (a[sortField] || "").toString().toLowerCase();
    const valB = (b[sortField] || "").toString().toLowerCase();
    if (valA < valB) return sortDirection === "asc" ? -1 : 1;
    if (valA > valB) return sortDirection === "asc" ? 1 : -1;
    return 0;
  });

  const renderSortIcon = (field: keyof Submission) => {
    if (sortField !== field) {
      return <ArrowUpDown className="h-3 w-3 text-muted-foreground/70 group-hover:text-foreground transition-colors" />;
    }
    return sortDirection === "asc" ? (
      <ArrowUp className="h-3 w-3 text-primary transition-colors" />
    ) : (
      <ArrowDown className="h-3 w-3 text-primary transition-colors" />
    );
  };

  if (submissions.length === 0) {
    return (
      <div className="py-8 text-center text-xs text-muted-foreground border-t border-border/40">
        Belum ada data pengisian dosen untuk link ini.
      </div>
    );
  }

  return (
    <div className="overflow-x-auto w-full border-t border-border/40">
      <table className="w-full text-left border-collapse">
        <thead>
          <tr className="border-b border-border/40 text-xs font-bold text-muted-foreground uppercase tracking-wider">
            <th className="px-4 py-3">NIP</th>
            <th 
              onClick={() => handleSort("nama")} 
              className="px-4 py-3 cursor-pointer hover:bg-muted/50 transition-colors group"
            >
              <div className="flex items-center gap-1.5">
                Nama Dosen
                {renderSortIcon("nama")}
              </div>
            </th>
            <th className="px-4 py-3">Prodi</th>
            <th className="px-4 py-3">Jenis Rekognisi</th>
            <th 
              onClick={() => handleSort("tahun")} 
              className="px-4 py-3 cursor-pointer hover:bg-muted/50 transition-colors group"
            >
              <div className="flex items-center gap-1.5">
                Tahun
                {renderSortIcon("tahun")}
              </div>
            </th>
            <th className="px-4 py-3 max-w-[180px]">Deskripsi</th>
            <th className="px-4 py-3">Bukti</th>
            <th 
              onClick={() => handleSort("status")} 
              className="px-4 py-3 cursor-pointer hover:bg-muted/50 transition-colors group"
            >
              <div className="flex items-center gap-1.5">
                Status
                {renderSortIcon("status")}
              </div>
            </th>
            <th className="px-4 py-3 text-right">Aksi</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-border/20 text-xs">
          {sortedSubmissions.map((sub) => (
            <tr 
              key={sub.id} 
              onClick={() => router.push(`/dashboard/rekognisi-dosen/${sub.id}`)}
              className="hover:bg-muted/15 transition-colors cursor-pointer"
            >
              <td className="px-4 py-3 font-mono font-semibold">{sub.nip}</td>
              <td className="px-4 py-3 font-semibold text-foreground">{sub.nama}</td>
              <td className="px-4 py-3 text-muted-foreground">{sub.prodi}</td>
              <td className="px-4 py-3 font-semibold text-muted-foreground">{sub.jenisRekognisi}</td>
              <td className="px-4 py-3 text-muted-foreground">{sub.tahun}</td>
              <td className="px-4 py-3 text-muted-foreground max-w-[180px] truncate" title={sub.deskripsi}>
                {sub.deskripsi}
              </td>
              <td className="px-4 py-3">
                <div className="flex flex-col items-start gap-1.5">
                  {sub.linkBukti.split(",").filter(Boolean).map((url, idx) => {
                    const uniqueKey = `${sub.id}-${idx}`;
                    return (
                      <div key={idx} className="flex items-center gap-1.5">
                        {sub.linkBukti.split(",").filter(Boolean).length > 1 && (
                          <span className="text-[10px] text-muted-foreground font-bold">#{idx + 1}</span>
                        )}
                        <a
                          href={url}
                          target="_blank"
                          rel="noopener noreferrer"
                          onClick={(e) => e.stopPropagation()}
                          className="inline-flex h-7 items-center gap-1 rounded bg-muted/65 border border-border px-2 text-xs font-bold text-foreground hover:bg-muted transition-all cursor-pointer"
                          title={`Kunjungi Link Bukti ${idx + 1}`}
                        >
                          <ExternalLink className="h-3 w-3" />
                          Kunjungi
                        </a>
                        <Button
                          variant="outline"
                          onClick={(e) => handleCopy(e, uniqueKey, url)}
                          className="h-7 items-center gap-1 rounded px-2 text-xs font-bold cursor-pointer"
                          title={`Salin Link Bukti ${idx + 1}`}
                        >
                          {copiedId === uniqueKey ? (
                            <>
                              <Check className="h-3 w-3 text-success" />
                              Tersalin
                            </>
                          ) : (
                            <>
                              <Copy className="h-3 w-3" />
                              Salin
                            </>
                          )}
                        </Button>
                      </div>
                    );
                  })}
                </div>
              </td>
              <td className="px-4 py-3">
                {sub.status === "approved" && (
                  <span className="inline-flex items-center gap-1 rounded-full bg-success/10 px-2.5 py-0.5 text-xs font-bold text-success">
                    <CheckCircle2 className="h-3 w-3" /> Disetujui
                  </span>
                )}
                {sub.status === "declined" && (
                  <span className="inline-flex items-center gap-1 rounded-full bg-error/10 px-2.5 py-0.5 text-xs font-bold text-error">
                    <XCircle className="h-3 w-3" /> Ditolak
                  </span>
                )}
                {sub.status === "pending" && (
                  <span className="inline-flex items-center gap-1 rounded-full bg-amber-500/10 px-2.5 py-0.5 text-xs font-bold text-amber-600 dark:text-amber-400">
                    Menunggu
                  </span>
                )}
              </td>
              <td className="px-4 py-3 text-right">
                <div className="flex justify-end items-center gap-1.5 min-h-[28px]">
                  {sub.status === "pending" ? (
                    <>
                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={(e) => {
                          e.stopPropagation();
                          onEdit(sub);
                        }}
                        className="h-7 w-7 text-muted-foreground hover:text-foreground cursor-pointer"
                        title="Edit Data"
                      >
                        <Edit2 className="h-3.5 w-3.5" />
                      </Button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onAccept(sub.id);
                        }}
                        className="h-7 rounded bg-success/10 px-2.5 text-xs font-bold text-success hover:bg-success/20 transition-all cursor-pointer"
                      >
                        Accept
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onDecline(sub.id);
                        }}
                        className="h-7 rounded bg-error/10 px-2.5 text-xs font-bold text-error hover:bg-error/20 transition-all cursor-pointer"
                      >
                        Decline
                      </button>
                    </>
                  ) : (
                    <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider select-none px-2">
                      Selesai
                    </span>
                  )}
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
