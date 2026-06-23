"use client";

import React, { useState, useEffect } from "react";
import { RefreshCw } from "lucide-react";
import { AktivitasTable } from "@/components/dashboard/admin/aktivitas-table";
import { AdminAktivitas, initialAdminAktivitas } from "@/dummy-data/admin";

export default function AktivitasUserPage() {
  const [logs, setLogs] = useState<AdminAktivitas[]>([]);

  const loadLogs = () => {
    const storedLogs = localStorage.getItem("adminAktivitas");
    if (storedLogs) {
      try {
        setLogs(JSON.parse(storedLogs));
      } catch {
        setLogs(initialAdminAktivitas);
      }
    } else {
      setLogs(initialAdminAktivitas);
      localStorage.setItem("adminAktivitas", JSON.stringify(initialAdminAktivitas));
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      loadLogs();
    }, 0);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="space-y-6 animate-fadeIn">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-foreground md:text-2xl">
            Aktivitas User
          </h1>
          <p className="text-xs text-muted-foreground mt-1">
            Audit trail dan log aktivitas pengisian data penjaminan mutu secara real-time.
          </p>
        </div>
        <button
          onClick={loadLogs}
          title="Segarkan Log"
          className="p-2 border border-border bg-card hover:bg-muted/50 rounded-lg text-muted-foreground hover:text-foreground transition-colors cursor-pointer flex items-center justify-center"
        >
          <RefreshCw className="h-4 w-4" />
        </button>
      </div>

      <AktivitasTable logs={logs} />
    </div>
  );
}
