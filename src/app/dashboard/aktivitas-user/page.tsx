"use client";

import React, { useEffect, useState } from "react";
import { RefreshCw } from "lucide-react";
import { AktivitasTable } from "@/components/dashboard/admin/aktivitas-table";
import { useCleanOlderLogsMutation } from "@/store/services/logApi";
import { toast } from "sonner";

export default function AktivitasUserPage(): React.JSX.Element {
  const [cleanOlderLogs] = useCleanOlderLogsMutation();
  const [refreshTrigger, setRefreshTrigger] = useState<number>(0);

  // Detect admin role and trigger clean log older than 100 days
  useEffect(() => {
    const raw = localStorage.getItem("userSession");
    if (raw) {
      try {
        const session = JSON.parse(raw);
        if (session.username === "admin" || session.role === "Administrator") {
          // Trigger pembersihan log otomatis 100 hari
          cleanOlderLogs(100)
            .unwrap()
            .then((res) => {
              if (res.success && res.message) {
                toast.success(`Pembersihan Log: ${res.message}`);
              }
            })
            .catch(() => {
              // Silently ignore or show minimal warning
            });
        }
      } catch {
        // ignore
      }
    }
  }, [cleanOlderLogs]);

  const handleRefresh = (): void => {
    setRefreshTrigger((prev) => prev + 1);
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      <div className="flex items-center justify-between border-b border-border/40 pb-4">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-foreground md:text-2xl">
            Aktivitas User
          </h1>
          <p className="text-xs text-muted-foreground mt-1">
            Audit trail dan log aktivitas pengisian data penjaminan mutu secara real-time.
          </p>
        </div>
        <button
          onClick={handleRefresh}
          type="button"
          title="Segarkan Log"
          className="p-2 border border-border bg-card hover:bg-muted/50 rounded-lg text-muted-foreground hover:text-foreground transition-colors cursor-pointer flex items-center justify-center"
        >
          <RefreshCw className="h-4 w-4" />
        </button>
      </div>

      <AktivitasTable refreshTrigger={refreshTrigger} />
    </div>
  );
}
