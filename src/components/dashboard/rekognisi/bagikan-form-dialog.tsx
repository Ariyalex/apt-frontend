"use client";

import React, { useState, useEffect } from "react";
import { format } from "date-fns";
import { id } from "date-fns/locale";
import { Calendar as CalendarIcon, Link as LinkIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Input } from "@/components/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Field, FieldLabel, FieldTitle } from "@/components/ui/field";

interface BagikanFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (
    name: string,
    slug: string,
    description: string,
    startedAt: string,
    endedAt: string,
  ) => void;
  isSaving?: boolean;
}

export function BagikanFormDialog({
  open,
  onOpenChange,
  onSave,
  isSaving = false,
}: BagikanFormDialogProps): React.JSX.Element {
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [description, setDescription] = useState("");

  // Started At Date/Time Picker States
  const [startDate, setStartDate] = useState<Date | undefined>(undefined);
  const [startTime, setStartTime] = useState("08:00");
  const [startPopoverOpen, setStartPopoverOpen] = useState(false);

  // Ended At Date/Time Picker States
  const [endDate, setEndDate] = useState<Date | undefined>(undefined);
  const [endTime, setEndTime] = useState("23:59");
  const [endPopoverOpen, setEndPopoverOpen] = useState(false);

  // Reset states on open
  useEffect(() => {
    if (open) {
      const timer = setTimeout(() => {
        setName("");
        setSlug("");
        setDescription("");

        const now = new Date();
        setStartDate(now);
        setStartTime("08:00");

        const future = new Date();
        future.setDate(future.getDate() + 7);
        setEndDate(future);
        setEndTime("23:59");
      }, 0);
      return () => clearTimeout(timer);
    }
  }, [open]);

  const [baseUrl, setBaseUrl] = useState("http://localhost:3000/");

  useEffect(() => {
    if (typeof window !== "undefined") {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setBaseUrl(`${window.location.origin}/`);
    }
  }, []);

  const handleSave = () => {
    if (!name.trim() || !slug.trim() || !startDate || !endDate) return;

    // Combine Start Date & Time
    const combinedStart = new Date(startDate);
    const [startH, startM] = startTime.split(":");
    combinedStart.setHours(parseInt(startH, 10));
    combinedStart.setMinutes(parseInt(startM, 10));
    combinedStart.setSeconds(0);
    combinedStart.setMilliseconds(0);

    // Combine End Date & Time
    const combinedEnd = new Date(endDate);
    const [endH, endM] = endTime.split(":");
    combinedEnd.setHours(parseInt(endH, 10));
    combinedEnd.setMinutes(parseInt(endM, 10));
    combinedEnd.setSeconds(59);
    combinedEnd.setMilliseconds(0);

    onSave(
      name.trim(),
      slug.trim(),
      description.trim(),
      combinedStart.toISOString(),
      combinedEnd.toISOString(),
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg bg-card border border-border p-6 rounded-xl overflow-y-auto max-h-[90vh] scrollbar-thin">
        <DialogHeader>
          <DialogTitle className="text-sm font-bold text-foreground uppercase tracking-wider">
            Tambah Link Baru
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-3">
          {/* Field: Name */}
          <Field>
            <FieldLabel>
              <FieldTitle>Nama Form / Judul Link</FieldTitle>
            </FieldLabel>
            <Input
              type="text"
              disabled={isSaving}
              placeholder="Contoh: Pendaftaran Beasiswa Unggulan"
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                // Auto-slugify (allowing capitalization)
                setSlug(
                  e.target.value
                    .replace(/[^a-zA-Z0-9]+/g, "-")
                    .replace(/(^-|-$)/g, ""),
                );
              }}
              className="h-10 text-xs border border-border rounded-lg bg-transparent px-3 text-foreground"
            />
          </Field>

          {/* Field: Slug */}
          <Field>
            <FieldLabel>
              <FieldTitle>Link Slug (Custom Path)</FieldTitle>
            </FieldLabel>
            <Input
              type="text"
              disabled={isSaving}
              placeholder="beasiswa-unggulan-2026"
              value={slug}
              onChange={(e) => setSlug(e.target.value.replace(/\s+/g, "-"))}
              className="h-10 text-xs border border-border rounded-lg bg-transparent px-3 text-foreground font-mono"
            />
          </Field>

          {/* Field: Description */}
          <Field>
            <FieldLabel>
              <FieldTitle>Deskripsi Form</FieldTitle>
            </FieldLabel>
            <textarea
              rows={2}
              disabled={isSaving}
              placeholder="Masukkan deskripsi mengenai form ini..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full bg-card border border-border rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-primary transition-colors text-foreground resize-none"
            />
          </Field>

          {/* Preview Link */}
          <div className="space-y-1 p-3.5 bg-muted/20 border border-border/60 rounded-lg">
            <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider block mb-1">
              Preview Link
            </span>
            <div className="flex items-center gap-1.5 overflow-x-auto whitespace-nowrap pb-1">
              <LinkIcon className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
              <span className="text-xs font-mono text-muted-foreground select-all">
                {baseUrl}
              </span>
              <span className="text-xs font-mono font-bold text-primary underline select-all">
                {slug || "[nama-link-kustom]"}
              </span>
            </div>
          </div>

          {/* Date & Time Mulai */}
          <div className="flex flex-row gap-4">
            <Field className="flex-1">
              <FieldLabel>
                <FieldTitle>Tanggal Mulai</FieldTitle>
              </FieldLabel>
              <Popover
                open={startPopoverOpen}
                onOpenChange={setStartPopoverOpen}
              >
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    disabled={isSaving}
                    className="w-full justify-between text-xs font-semibold hover:bg-muted/80 cursor-pointer h-10 border border-border rounded-lg px-3 disabled:opacity-50"
                  >
                    {startDate ? (
                      format(startDate, "PPP", { locale: id })
                    ) : (
                      <span className="text-muted-foreground">
                        Pilih Tanggal
                      </span>
                    )}
                    <CalendarIcon className="h-4 w-4 opacity-50" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent
                  className="w-auto p-0 border border-border bg-card shadow-md rounded-lg"
                  align="start"
                >
                  <Calendar
                    mode="single"
                    selected={startDate}
                    onSelect={(d) => {
                      setStartDate(d);
                      setStartPopoverOpen(false);
                    }}
                    locale={id}
                  />
                </PopoverContent>
              </Popover>
            </Field>

            <Field className="w-32">
              <FieldLabel>
                <FieldTitle>Waktu</FieldTitle>
              </FieldLabel>
              <Input
                type="time"
                disabled={isSaving}
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                className="h-10 text-xs font-semibold border border-border rounded-lg bg-transparent px-3 text-foreground disabled:opacity-50"
              />
            </Field>
          </div>

          {/* Date & Time Berakhir */}
          <div className="flex flex-row gap-4">
            <Field className="flex-1">
              <FieldLabel>
                <FieldTitle>Tanggal Berakhir (Masa Berlaku)</FieldTitle>
              </FieldLabel>
              <Popover open={endPopoverOpen} onOpenChange={setEndPopoverOpen}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    disabled={isSaving}
                    className="w-full justify-between text-xs font-semibold hover:bg-muted/80 cursor-pointer h-10 border border-border rounded-lg px-3 disabled:opacity-50"
                  >
                    {endDate ? (
                      format(endDate, "PPP", { locale: id })
                    ) : (
                      <span className="text-muted-foreground">
                        Pilih Tanggal
                      </span>
                    )}
                    <CalendarIcon className="h-4 w-4 opacity-50" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent
                  className="w-auto p-0 border border-border bg-card shadow-md rounded-lg"
                  align="start"
                >
                  <Calendar
                    mode="single"
                    selected={endDate}
                    onSelect={(d) => {
                      setEndDate(d);
                      setEndPopoverOpen(false);
                    }}
                    locale={id}
                  />
                </PopoverContent>
              </Popover>
            </Field>

            <Field className="w-32">
              <FieldLabel>
                <FieldTitle>Waktu</FieldTitle>
              </FieldLabel>
              <Input
                type="time"
                disabled={isSaving}
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
                className="h-10 text-xs font-semibold border border-border rounded-lg bg-transparent px-3 text-foreground disabled:opacity-50"
              />
            </Field>
          </div>
        </div>

        <DialogFooter className="flex justify-end gap-2 pt-2">
          <Button
            variant="outline"
            disabled={isSaving}
            onClick={() => onOpenChange(false)}
            className="text-xs font-semibold h-9 rounded-lg"
          >
            Batal
          </Button>
          <Button
            onClick={handleSave}
            disabled={
              isSaving || !name.trim() || !slug.trim() || !startDate || !endDate
            }
            className="bg-primary text-primary-foreground text-xs font-semibold h-9 rounded-lg hover:bg-primary/90 cursor-pointer disabled:opacity-50"
          >
            {isSaving ? "Membuat..." : "Simpan & Buat"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
