"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { ExternalLink, Copy, Check, Edit2, CheckCircle2, XCircle, ArrowUpDown, ArrowUp, ArrowDown, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Submission } from "@/types/bagikan-form";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface BagikanFormSubmissionsTableProps {
  submissions: Submission[];
  isLoading?: boolean;
  onAccept: (subId: string) => void;
  onDecline: (subId: string) => void;
  onEdit: (sub: Submission) => void;
  isAuditing?: boolean;
}

export function BagikanFormSubmissionsTable({
  submissions,
  isLoading = false,
  onAccept,
  onDecline,
  onEdit,
  isAuditing = false,
}: BagikanFormSubmissionsTableProps) {
  const router = useRouter();
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [sortField, setSortField] = useState<"nama" | "tahun" | "status" | null>(null);
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");

  const [loadingRowId, setLoadingRowId] = useState<string | null>(null);
  const [loadingAction, setLoadingAction] = useState<"accept" | "decline" | null>(null);

  React.useEffect(() => {
    if (!isAuditing) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setLoadingRowId(null);
      setLoadingAction(null);
    }
  }, [isAuditing]);

  const handleAcceptClick = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    setLoadingRowId(id);
    setLoadingAction("accept");
    onAccept(id);
  };

  const handleDeclineClick = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    setLoadingRowId(id);
    setLoadingAction("decline");
    onDecline(id);
  };

  const handleCopy = (e: React.MouseEvent, id: string, text: string) => {
    e.stopPropagation();
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleSort = (field: "nama" | "tahun" | "status") => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
  };

  const renderSortIcon = (field: "nama" | "tahun" | "status") => {
    if (sortField !== field) {
      return <ArrowUpDown className="h-3 w-3 text-muted-foreground/70 group-hover:text-foreground transition-colors" />;
    }
    return sortDirection === "asc" ? (
      <ArrowUp className="h-3 w-3 text-primary transition-colors" />
    ) : (
      <ArrowDown className="h-3 w-3 text-primary transition-colors" />
    );
  };

  if (isLoading) {
    return (
      <div className="overflow-x-auto w-full border-t border-border/40">
        <Table>
          <TableHeader>
            <TableRow className="border-b border-border/40 text-xs font-bold text-muted-foreground uppercase tracking-wider">
              <TableHead className="px-4 py-3">NIP</TableHead>
              <TableHead className="px-4 py-3">Nama Dosen</TableHead>
              <TableHead className="px-4 py-3">Prodi</TableHead>
              <TableHead className="px-4 py-3">Jenis Rekognisi</TableHead>
              <TableHead className="px-4 py-3">Tahun</TableHead>
              <TableHead className="px-4 py-3 max-w-[180px]">Deskripsi</TableHead>
              <TableHead className="px-4 py-3">Bukti</TableHead>
              <TableHead className="px-4 py-3">Status</TableHead>
              <TableHead className="px-4 py-3 text-right">Aksi</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {[1, 2].map((i) => (
              <TableRow key={i} className="animate-pulse">
                <TableCell className="px-4 py-3.5"><Skeleton className="h-3.5 w-24 rounded" /></TableCell>
                <TableCell className="px-4 py-3.5"><Skeleton className="h-3.5 w-32 rounded" /></TableCell>
                <TableCell className="px-4 py-3.5"><Skeleton className="h-3.5 w-24 rounded" /></TableCell>
                <TableCell className="px-4 py-3.5"><Skeleton className="h-3.5 w-28 rounded" /></TableCell>
                <TableCell className="px-4 py-3.5"><Skeleton className="h-3.5 w-10 rounded" /></TableCell>
                <TableCell className="px-4 py-3.5"><Skeleton className="h-3.5 w-[90%] rounded" /></TableCell>
                <TableCell className="px-4 py-3.5"><Skeleton className="h-7 w-20 rounded" /></TableCell>
                <TableCell className="px-4 py-3.5"><Skeleton className="h-5 w-16 rounded-full" /></TableCell>
                <TableCell className="px-4 py-3.5"><Skeleton className="h-7 w-20 rounded ml-auto" /></TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    );
  }

  if (submissions.length === 0) {
    return (
      <div className="py-8 text-center text-xs text-muted-foreground border-t border-border/40">
        Belum ada data pengisian dosen untuk link ini.
      </div>
    );
  }

  const sortedSubmissions = [...submissions].sort((a, b) => {
    if (!sortField) return 0;
    
    let aVal = "";
    let bVal = "";

    if (sortField === "nama") {
      aVal = a.nama;
      bVal = b.nama;
    } else if (sortField === "tahun") {
      aVal = a.tahun.toString();
      bVal = b.tahun.toString();
    } else if (sortField === "status") {
      aVal = a.status;
      bVal = b.status;
    }

    if (sortDirection === "asc") {
      return aVal.localeCompare(bVal);
    } else {
      return bVal.localeCompare(aVal);
    }
  });

  return (
    <div className="overflow-x-auto w-full border-t border-border/40">
      <Table>
        <TableHeader>
          <TableRow className="border-b border-border/40 text-xs font-bold text-muted-foreground uppercase tracking-wider">
            <TableHead className="px-4 py-3">NIP</TableHead>
            <TableHead 
              onClick={() => handleSort("nama")} 
              className="px-4 py-3 cursor-pointer hover:bg-muted/50 transition-colors group"
            >
              <div className="flex items-center gap-1.5">
                Nama Dosen
                {renderSortIcon("nama")}
              </div>
            </TableHead>
            <TableHead className="px-4 py-3">Prodi</TableHead>
            <TableHead className="px-4 py-3">Jenis Rekognisi</TableHead>
            <TableHead 
              onClick={() => handleSort("tahun")} 
              className="px-4 py-3 cursor-pointer hover:bg-muted/50 transition-colors group"
            >
              <div className="flex items-center gap-1.5">
                Tahun
                {renderSortIcon("tahun")}
              </div>
            </TableHead>
            <TableHead className="px-4 py-3 max-w-[180px]">Deskripsi</TableHead>
            <TableHead className="px-4 py-3">Bukti</TableHead>
            <TableHead 
              onClick={() => handleSort("status")} 
              className="px-4 py-3 cursor-pointer hover:bg-muted/50 transition-colors group"
            >
              <div className="flex items-center gap-1.5">
                Status
                {renderSortIcon("status")}
              </div>
            </TableHead>
            <TableHead className="px-4 py-3 text-right">Aksi</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody className="divide-y divide-border/20 text-xs">
          {sortedSubmissions.map((sub) => (
            <TableRow 
              key={sub.id} 
              onClick={() => router.push(`/dashboard/rekognisi-dosen/${sub.id}`)}
              className="hover:bg-muted/15 transition-colors cursor-pointer"
            >
              <TableCell className="px-4 py-3 font-mono font-semibold">{sub.nip}</TableCell>
              <TableCell className="px-4 py-3 font-semibold text-foreground">{sub.nama}</TableCell>
              <TableCell className="px-4 py-3 text-muted-foreground">{sub.prodi}</TableCell>
              <TableCell className="px-4 py-3 font-semibold text-muted-foreground">{sub.jenisRekognisi}</TableCell>
              <TableCell className="px-4 py-3 text-muted-foreground">{sub.tahun}</TableCell>
              <TableCell className="px-4 py-3 text-muted-foreground max-w-[180px] truncate" title={sub.deskripsi}>
                {sub.deskripsi}
              </TableCell>
              <TableCell className="px-4 py-3">
                <div className="flex flex-col items-start gap-1.5">
                  {(sub.linkBukti || "").split(",").filter(Boolean).map((url, idx) => {
                    const uniqueKey = `${sub.id}-${idx}`;
                    return (
                      <div key={idx} className="flex items-center gap-1.5">
                        {(sub.linkBukti || "").split(",").filter(Boolean).length > 1 && (
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
              </TableCell>
              <TableCell className="px-4 py-3">
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
              </TableCell>
              <TableCell className="px-4 py-3 text-right">
                <div className="flex justify-end items-center gap-1.5 min-h-[28px]">
                  {sub.status === "pending" ? (
                    <>
                      <Button
                        size="icon"
                        variant="ghost"
                        disabled={isAuditing}
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
                        disabled={isAuditing}
                        onClick={(e) => handleAcceptClick(e, sub.id)}
                        className="inline-flex items-center gap-1 h-7 rounded bg-success/10 px-2.5 text-xs font-bold text-success hover:bg-success/20 transition-all cursor-pointer disabled:opacity-50 disabled:pointer-events-none"
                      >
                        {isAuditing && loadingRowId === sub.id && loadingAction === "accept" && (
                          <Loader2 className="h-3 w-3 animate-spin mr-0.5" />
                        )}
                        Accept
                      </button>
                      <button
                        disabled={isAuditing}
                        onClick={(e) => handleDeclineClick(e, sub.id)}
                        className="inline-flex items-center gap-1 h-7 rounded bg-error/10 px-2.5 text-xs font-bold text-error hover:bg-error/20 transition-all cursor-pointer disabled:opacity-50 disabled:pointer-events-none"
                      >
                        {isAuditing && loadingRowId === sub.id && loadingAction === "decline" && (
                          <Loader2 className="h-3 w-3 animate-spin mr-0.5" />
                        )}
                        Decline
                      </button>
                    </>
                  ) : (
                    <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider select-none px-2">
                      Selesai
                    </span>
                  )}
                </div>
              </TableCell>
            </TableRow>
          ))}
          </TableBody>
        </Table>
    </div>
  );
}
