"use client";

import React, { useState } from "react";
import { format } from "date-fns";
import { id } from "date-fns/locale";
import { MoreVertical, Calendar, Check, Copy, Link as LinkIcon, Lock, Unlock } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { BagikanFormSubmissionsTable } from "./bagikan-form-submissions-table";
import { SharingLink, Submission } from "@/dummy-data/bagikan-form";

interface BagikanFormCardProps {
  link: SharingLink;
  onToggleStatus: (id: string) => void;
  onEditExpiry: (id: string) => void;
  onAcceptSubmission: (linkId: string, subId: string) => void;
  onDeclineSubmission: (linkId: string, subId: string) => void;
  onEditSubmission: (linkId: string, sub: Submission) => void;
}

export function BagikanFormCard({
  link,
  onToggleStatus,
  onEditExpiry,
  onAcceptSubmission,
  onDeclineSubmission,
  onEditSubmission,
}: BagikanFormCardProps) {
  const [copied, setCopied] = useState(false);
  const baseUrl = `http://localhost:3000/rekognisi/${link.facultySlug || "sains-dan-teknologi"}/`;
  const fullUrl = `${baseUrl}${link.name}`;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(fullUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const isExpired = new Date(link.expiredAt) < new Date();
  const displayStatus = isExpired ? "expired" : link.status;

  return (
    <div className="rounded-xl border border-border bg-card shadow-sm overflow-hidden flex flex-col">
      {/* Header section */}
      <div className="p-4 flex items-center justify-between gap-4 bg-muted/10 border-b border-border/30">
        <div className="flex flex-col gap-1.5 md:flex-row md:items-center md:gap-4 flex-1 min-w-0">
          {/* Clickable URL display with styled end text */}
          <div 
            onClick={handleCopyLink}
            className="flex items-center gap-1.5 cursor-pointer group select-none shrink-0"
            title="Klik untuk menyalin link"
          >
            <div className="flex items-center gap-1">
              <span className="text-xs font-mono text-muted-foreground">{baseUrl}</span>
              <span className="text-xs font-mono font-bold text-primary underline decoration-primary/40 group-hover:decoration-primary transition-all">
                {link.name}
              </span>
            </div>
            {copied ? (
              <span className="inline-flex items-center gap-1 rounded bg-emerald-500/10 px-1.5 py-0.5 text-xs font-bold text-emerald-600 animate-fadeIn shrink-0">
                <Check className="h-2.5 w-2.5" /> Tersalin
              </span>
            ) : (
              <span className="text-xs text-muted-foreground/0 group-hover:text-muted-foreground/75 transition-all flex items-center gap-0.5 shrink-0">
                <Copy className="h-3 w-3" />
              </span>
            )}
          </div>

          {/* Expiration date */}
          <div className="flex items-center gap-1 text-xs text-muted-foreground font-semibold shrink-0">
            <Calendar className="h-3.5 w-3.5 opacity-60" />
            Masa Berlaku: {format(new Date(link.expiredAt), "d MMMM yyyy HH:mm", { locale: id })}
          </div>

          {/* Status Badge */}
          <div className="shrink-0 md:ml-auto">
            {displayStatus === "active" && (
              <span className="inline-flex items-center rounded-full bg-emerald-500/10 px-2.5 py-0.5 text-xs font-bold text-emerald-600 dark:text-emerald-400">
                Aktif
              </span>
            )}
            {displayStatus === "closed" && (
              <span className="inline-flex items-center rounded-full bg-muted/70 border border-border px-2.5 py-0.5 text-xs font-bold text-muted-foreground">
                Ditutup
              </span>
            )}
            {displayStatus === "expired" && (
              <span className="inline-flex items-center rounded-full bg-rose-500/10 px-2.5 py-0.5 text-xs font-bold text-rose-600 dark:text-rose-400">
                Kedaluwarsa
              </span>
            )}
          </div>
        </div>

        {/* Ellipsis Actions Menu */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-muted-foreground hover:text-foreground cursor-pointer rounded-lg shrink-0"
            >
              <MoreVertical className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="bg-card border border-border rounded-lg shadow-md p-1 min-w-[170px]">
            <DropdownMenuItem
              onClick={() => onToggleStatus(link.id)}
              className="cursor-pointer text-xs font-semibold px-3 py-2 hover:bg-muted flex items-center gap-2"
            >
              {link.status === "active" ? (
                <>
                  <Lock className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                  <span>Tutup Link</span>
                </>
              ) : (
                <>
                  <Unlock className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                  <span>Aktifkan Link</span>
                </>
              )}
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => onEditExpiry(link.id)}
              className="cursor-pointer text-xs font-semibold px-3 py-2 hover:bg-muted flex items-center gap-2"
            >
              <Calendar className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
              <span>Edit Masa Berlaku</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Submissions table */}
      <div className="flex-1">
        <BagikanFormSubmissionsTable
          submissions={link.submissions}
          onAccept={(subId) => onAcceptSubmission(link.id, subId)}
          onDecline={(subId) => onDeclineSubmission(link.id, subId)}
          onEdit={(sub) => onEditSubmission(link.id, sub)}
        />
      </div>
    </div>
  );
}
