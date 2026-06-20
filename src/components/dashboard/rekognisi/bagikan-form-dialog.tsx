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
  onSave: (name: string, expiredAt: string) => void;
  facultySlug: string;
}

export function BagikanFormDialog({
  open,
  onOpenChange,
  onSave,
  facultySlug,
}: BagikanFormDialogProps) {
  const [name, setName] = useState("");
  const [date, setDate] = useState<Date | undefined>(undefined);
  const [time, setTime] = useState("23:59");
  const [popoverOpen, setPopoverOpen] = useState(false);

  // Reset states on open
  useEffect(() => {
    if (open) {
      setName("");
      const defaultDate = new Date();
      defaultDate.setDate(defaultDate.getDate() + 7); // Default to 7 days from now
      setDate(defaultDate);
      setTime("23:59");
    }
  }, [open]);

  const baseUrl = `http://localhost:3000/rekognisi/${facultySlug}/`;

  const handleSave = () => {
    if (!name || !date) return;
    const combinedDate = new Date(date);
    const [hours, minutes] = time.split(":");
    combinedDate.setHours(parseInt(hours, 10));
    combinedDate.setMinutes(parseInt(minutes, 10));
    combinedDate.setSeconds(0);
    combinedDate.setMilliseconds(0);
    onSave(name, combinedDate.toISOString());
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg bg-card border border-border p-6 rounded-xl">
        <DialogHeader>
          <DialogTitle className="text-sm font-bold text-foreground uppercase tracking-wider">
            Tambah Link Baru
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-3">
          {/* Field 1: Nama Link (Identifier) */}
          <Field>
            <FieldLabel>
              <FieldTitle>Nama Link (Identifier Kustom)</FieldTitle>
            </FieldLabel>
            <Input
              type="text"
              placeholder="contoh: rekognisi-dosen-2026-ganjil"
              value={name}
              onChange={(e) =>
                setName(e.target.value.toLowerCase().replace(/\s+/g, "-"))
              }
              className="h-10 text-xs border border-border rounded-lg bg-transparent px-3 text-foreground font-mono"
            />
          </Field>

          {/* Preview Link with Highlighted End Text */}
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
                {name || "[nama-link-kustom]"}
              </span>
            </div>
          </div>

          {/* Field 2: Date & Time Picker */}
          <div className="flex flex-row gap-4">
            {/* Date Picker using Popover + Calendar */}
            <Field className="flex-1">
              <FieldLabel>
                <FieldTitle>Tanggal Kadalwarsa</FieldTitle>
              </FieldLabel>
              <Popover open={popoverOpen} onOpenChange={setPopoverOpen}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className="w-full justify-between text-xs font-semibold hover:bg-muted/80 cursor-pointer h-10 border border-border rounded-lg px-3"
                  >
                    {date ? (
                      format(date, "PPP", { locale: id })
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
                    selected={date}
                    onSelect={(d) => {
                      setDate(d);
                      setPopoverOpen(false);
                    }}
                    locale={id}
                  />
                </PopoverContent>
              </Popover>
            </Field>

            {/* Time Picker */}
            <Field className="w-32">
              <FieldLabel>
                <FieldTitle>Waktu</FieldTitle>
              </FieldLabel>
              <Input
                type="time"
                value={time}
                onChange={(e) => setTime(e.target.value)}
                className="h-10 text-xs font-semibold border border-border rounded-lg bg-transparent px-3 text-foreground"
              />
            </Field>
          </div>
        </div>

        <DialogFooter className="flex justify-end gap-2 pt-2">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            className="text-xs font-semibold h-9 rounded-lg"
          >
            Batal
          </Button>
          <Button
            onClick={handleSave}
            disabled={!name || !date}
            className="bg-primary text-primary-foreground text-xs font-semibold h-9 rounded-lg hover:bg-primary/90 cursor-pointer"
          >
            Simpan & Buat
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
