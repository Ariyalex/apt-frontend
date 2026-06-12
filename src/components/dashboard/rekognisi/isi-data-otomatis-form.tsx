"use client";

import React from "react";
import { HelpCircle } from "lucide-react";

export function IsiDataOtomatisForm() {
  return (
    <div className="rounded-xl border border-dashed border-border bg-card p-10 shadow-sm flex flex-col items-center justify-center text-center space-y-3 min-h-[300px]">
      <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center text-muted-foreground/80">
        <HelpCircle className="h-5 w-5" />
      </div>
      <div className="space-y-1">
        <h3 className="text-xs font-bold text-foreground uppercase tracking-wider">Form Otomatis</h3>
        <p className="text-xs text-muted-foreground max-w-sm">
          Fitur pengisian form otomatis berbasis ekstraksi dokumen (AI OCR) sedang dalam pengembangan dan akan segera hadir.
        </p>
      </div>
    </div>
  );
}
