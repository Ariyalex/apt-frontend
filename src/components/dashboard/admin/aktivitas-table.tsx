"use client";

import React, { useState } from "react";
import { Search, Calendar as CalendarIcon, X } from "lucide-react";
import { format } from "date-fns";
import { id } from "date-fns/locale";
import { AdminAktivitas } from "@/dummy-data/admin";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

interface AktivitasTableProps {
  logs: AdminAktivitas[];
}

export function AktivitasTable({ logs }: AktivitasTableProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeSearchQuery, setActiveSearchQuery] = useState("");
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
  const [popoverOpen, setPopoverOpen] = useState(false);

  const handleSearch = () => {
    setActiveSearchQuery(searchQuery);
  };

  const handleResetSearch = () => {
    setSearchQuery("");
    setActiveSearchQuery("");
  };

  // Filtering logic
  const filteredLogs = logs.filter((log) => {
    // Username and activity filter
    const matchesUser = !activeSearchQuery.trim() || 
      log.username.toLowerCase().includes(activeSearchQuery.toLowerCase().trim()) ||
      log.aktivitas.toLowerCase().includes(activeSearchQuery.toLowerCase().trim());
    
    // Date filter
    if (selectedDate) {
      const formattedFilterDate = format(selectedDate, "d MMMM yyyy", { locale: id });
      return matchesUser && log.waktu.toLowerCase().includes(formattedFilterDate.toLowerCase());
    }
    
    return matchesUser;
  });

  const handleClearDate = (e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedDate(undefined);
  };

  return (
    <div className="space-y-4">
      {/* Search & Filter Header */}
      <div className="flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-start">
        {/* Search Block */}
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <input
            type="text"
            placeholder="Cari log berdasarkan username..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") handleSearch();
            }}
            className="w-full h-10 px-3 rounded-lg border border-border bg-card text-xs text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:ring-1 focus:ring-primary flex-1 sm:w-64 sm:flex-initial"
          />
          <Button
            onClick={handleSearch}
            className="bg-primary text-primary-foreground text-xs font-semibold h-10 px-4 rounded-lg flex items-center gap-1.5 shrink-0 cursor-pointer"
          >
            <Search className="h-4 w-4" /> Cari
          </Button>
          {activeSearchQuery && (
            <Button
              variant="outline"
              onClick={handleResetSearch}
              className="h-10 text-xs font-semibold px-3 rounded-lg flex items-center gap-1 cursor-pointer shrink-0 text-muted-foreground border-border hover:bg-muted"
            >
              Reset
            </Button>
          )}
        </div>

        {/* Time filter: Date Picker */}
        <div className="relative max-w-xs w-full sm:w-56">
          <Popover open={popoverOpen} onOpenChange={setPopoverOpen}>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className="w-full justify-between text-xs font-semibold hover:bg-muted/80 cursor-pointer h-10 border border-border rounded-lg px-3 bg-card"
              >
                <span className="flex items-center gap-1.5 truncate">
                  <CalendarIcon className="h-4 w-4 text-muted-foreground/80 shrink-0" />
                  {selectedDate ? (
                    format(selectedDate, "d MMMM yyyy", { locale: id })
                  ) : (
                    <span className="text-muted-foreground">Filter Waktu</span>
                  )}
                </span>
                {selectedDate ? (
                  <button
                    onClick={handleClearDate}
                    className="p-1 hover:bg-muted-foreground/10 rounded-md transition-colors"
                  >
                    <X className="h-3 w-3 text-muted-foreground" />
                  </button>
                ) : null}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0 border border-border bg-card shadow-md rounded-lg" align="start">
              <Calendar
                mode="single"
                selected={selectedDate}
                onSelect={(d) => {
                  setSelectedDate(d);
                  setPopoverOpen(false);
                }}
                locale={id}
              />
            </PopoverContent>
          </Popover>
        </div>
      </div>

      {/* Logs Table */}
      <div className="rounded-xl border border-border bg-card overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-border bg-muted/20 text-xs font-bold text-muted-foreground uppercase tracking-wider select-none">
                <th className="px-5 py-3 w-16 text-center">No</th>
                <th className="px-5 py-3">Username</th>
                <th className="px-5 py-3">Aktivitas</th>
                <th className="px-5 py-3 text-right">Waktu</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/60 text-xs">
              {filteredLogs.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-5 py-8 text-center text-muted-foreground">
                    Tidak ada aktivitas ditemukan.
                  </td>
                </tr>
              ) : (
                filteredLogs.map((log, index) => (
                  <tr key={log.id} className="hover:bg-muted/5 transition-colors">
                    <td className="px-5 py-3.5 text-center font-medium text-muted-foreground">
                      {index + 1}
                    </td>
                    <td className="px-5 py-3.5 font-bold text-foreground">
                      {log.username}
                    </td>
                    <td className="px-5 py-3.5 text-foreground leading-normal">
                      {log.aktivitas}
                    </td>
                    <td className="px-5 py-3.5 text-right font-medium text-muted-foreground">
                      {log.waktu}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
