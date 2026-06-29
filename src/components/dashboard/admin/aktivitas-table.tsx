"use client";

import React, { useState } from "react";
import { Search, Calendar as CalendarIcon, X } from "lucide-react";
import { format } from "date-fns";
import { id } from "date-fns/locale";
import { AdminAktivitas } from "@/dummy-data/admin";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

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

  const clearFilters = () => {
    setSearchQuery("");
    setActiveSearchQuery("");
    setSelectedDate(undefined);
  };

  // Filter logs based on active search query and date
  const filteredLogs = logs.filter((log) => {
    const matchesSearch = log.username.toLowerCase().includes(activeSearchQuery.toLowerCase()) || 
                          log.aktivitas.toLowerCase().includes(activeSearchQuery.toLowerCase());
    
    let matchesDate = true;
    if (selectedDate) {
      const searchDay = selectedDate.getDate().toString().padStart(2, "0");
      const searchMonth = format(selectedDate, "MMM", { locale: id });
      const searchYear = selectedDate.getFullYear().toString();
      const formattedSearchDate = `${searchDay} ${searchMonth} ${searchYear}`;
      matchesDate = log.waktu.includes(formattedSearchDate);
    }

    return matchesSearch && matchesDate;
  });

  return (
    <div className="space-y-4">
      {/* Search & Filter Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
        {/* Search Input */}
        <div className="flex flex-1 items-center max-w-md bg-card border border-border rounded-xl px-3 py-1.5 focus-within:border-primary transition-colors">
          <Search className="h-4 w-4 text-muted-foreground mr-2 shrink-0" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSearch()}
            placeholder="Cari aktivitas atau username..."
            className="w-full bg-transparent text-xs text-foreground focus:outline-none placeholder:text-muted-foreground/75"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="text-muted-foreground hover:text-foreground cursor-pointer shrink-0 ml-1.5"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          )}
        </div>

        {/* Date Filter & Clear */}
        <div className="flex items-center gap-2">
          {(activeSearchQuery || selectedDate) && (
            <Button
              onClick={clearFilters}
              variant="ghost"
              className="text-xs text-red-500 hover:bg-red-500/10 hover:text-red-600 h-9 px-3 rounded-lg"
            >
              Bersihkan Filter
            </Button>
          )}

          <Popover open={popoverOpen} onOpenChange={setPopoverOpen}>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={`text-xs h-9 font-semibold border-border px-3.5 rounded-lg flex items-center gap-2 cursor-pointer ${
                  selectedDate ? "bg-primary/5 border-primary text-primary" : "text-foreground"
                }`}
              >
                <CalendarIcon className="h-3.5 w-3.5" />
                <span>
                  {selectedDate 
                    ? format(selectedDate, "dd MMMM yyyy", { locale: id }) 
                    : "Pilih Tanggal"}
                </span>
              </Button>
            </PopoverTrigger>
            <PopoverContent align="end" className="p-0 border-border bg-card">
              <Calendar
                mode="single"
                selected={selectedDate}
                onSelect={(date) => {
                  setSelectedDate(date);
                  setPopoverOpen(false);
                }}
                locale={id}
                className="bg-card text-foreground"
              />
            </PopoverContent>
          </Popover>
        </div>
      </div>

      {/* Logs Table */}
      <div className="rounded-xl border border-border bg-card overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="border-b border-border bg-muted/20 text-xs font-bold text-muted-foreground uppercase tracking-wider select-none">
                <TableHead className="px-5 py-3 w-16 text-center">No</TableHead>
                <TableHead className="px-5 py-3">Username</TableHead>
                <TableHead className="px-5 py-3">Aktivitas</TableHead>
                <TableHead className="px-5 py-3 text-right">Waktu</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody className="text-xs">
              {filteredLogs.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} className="px-5 py-8 text-center text-muted-foreground">
                    Tidak ada aktivitas ditemukan.
                  </TableCell>
                </TableRow>
              ) : (
                filteredLogs.map((log, index) => (
                  <TableRow key={log.id} className="hover:bg-muted/5 transition-colors">
                    <TableCell className="px-5 py-3.5 text-center font-medium text-muted-foreground">
                      {index + 1}
                    </TableCell>
                    <TableCell className="px-5 py-3.5 font-bold text-foreground">
                      {log.username}
                    </TableCell>
                    <TableCell className="px-5 py-3.5 text-foreground leading-normal">
                      {log.aktivitas}
                    </TableCell>
                    <TableCell className="px-5 py-3.5 text-right font-medium text-muted-foreground">
                      {log.waktu}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
}
