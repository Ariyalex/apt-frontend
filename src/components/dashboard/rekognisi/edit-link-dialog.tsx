"use client";

import React, { useState, useEffect } from "react";
import { format } from "date-fns";
import { id } from "date-fns/locale";
import { Calendar as CalendarIcon } from "lucide-react";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Field, FieldLabel, FieldTitle } from "@/components/ui/field";
import { LinkModel } from "@/types/link";

interface EditLinkDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  link: LinkModel | null;
  onSave: (id: string, name: string, slug: string, description: string, isActive: boolean, startedAt: string, endedAt: string) => void;
  isSaving?: boolean;
}

export function EditLinkDialog({
  open,
  onOpenChange,
  link,
  onSave,
  isSaving = false,
}: EditLinkDialogProps): React.JSX.Element {
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [description, setDescription] = useState("");
  const [isActive, setIsActive] = useState(true);

  // Started At Picker States
  const [startDate, setStartDate] = useState<Date | undefined>(undefined);
  const [startTime, setStartTime] = useState("08:00");
  const [startPopoverOpen, setStartPopoverOpen] = useState(false);

  // Ended At Picker States
  const [endDate, setEndDate] = useState<Date | undefined>(undefined);
  const [endTime, setEndTime] = useState("23:59");
  const [endPopoverOpen, setEndPopoverOpen] = useState(false);

  useEffect(() => {
    if (open && link) {
      const timer = setTimeout(() => {
        setName(link.name);
        setSlug(link.slug);
        setDescription(link.description || "");
        setIsActive(link.is_active);

        // Parse Started At
        const start = new Date(link.started_at);
        setStartDate(start);
        const startH = String(start.getHours()).padStart(2, "0");
        const startM = String(start.getMinutes()).padStart(2, "0");
        setStartTime(`${startH}:${startM}`);

        // Parse Ended At
        const end = new Date(link.ended_at);
        setEndDate(end);
        const endH = String(end.getHours()).padStart(2, "0");
        const endM = String(end.getMinutes()).padStart(2, "0");
        setEndTime(`${endH}:${endM}`);
      }, 0);
      return () => clearTimeout(timer);
    }
  }, [open, link]);

  const handleSave = () => {
    if (!name.trim() || !slug.trim() || !startDate || !endDate || !link) return;

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
      link.id,
      name.trim(),
      slug.trim(),
      description.trim(),
      isActive,
      combinedStart.toISOString(),
      combinedEnd.toISOString()
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg bg-card border border-border p-6 rounded-xl overflow-y-auto max-h-[90vh] scrollbar-thin">
        <DialogHeader>
          <DialogTitle className="text-sm font-bold text-foreground uppercase tracking-wider">
            Edit Link Shared Form
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
                // Auto slugify if changed
                setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, ""));
              }}
              className="h-10 text-xs border border-border rounded-lg bg-transparent px-3 text-foreground"
            />
          </Field>

          {/* Field: Slug */}
          <Field>
            <FieldLabel>
              <FieldTitle>Link Slug (Custom Path)</FieldTitle>
            </FieldLabel>
            <div className="flex items-center gap-1">
              <span className="text-xs font-mono text-muted-foreground">/</span>
              <Input
                type="text"
                disabled={isSaving}
                placeholder="beasiswa-unggulan-2026"
                value={slug}
                onChange={(e) => setSlug(e.target.value.toLowerCase().replace(/\s+/g, "-"))}
                className="h-10 text-xs border border-border rounded-lg bg-transparent px-3 text-foreground font-mono flex-1"
              />
            </div>
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

          {/* Field: Status Active */}
          <Field>
            <FieldLabel>
              <FieldTitle>Status Link</FieldTitle>
            </FieldLabel>
            <Select
              disabled={isSaving}
              value={isActive ? "true" : "false"}
              onValueChange={(val) => setIsActive(val === "true")}
            >
              <SelectTrigger className="w-full bg-card border border-border rounded-lg px-3 py-2 text-xs font-semibold focus:outline-none focus:border-primary transition-colors justify-between cursor-pointer">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="true" className="text-xs font-semibold cursor-pointer">Aktif</SelectItem>
                <SelectItem value="false" className="text-xs font-semibold cursor-pointer">Nonaktif / Ditutup</SelectItem>
              </SelectContent>
            </Select>
          </Field>

          {/* Field: Started At Picker */}
          <div className="flex flex-row gap-4">
            <Field className="flex-1">
              <FieldLabel>
                <FieldTitle>Tanggal Mulai</FieldTitle>
              </FieldLabel>
              <Popover open={startPopoverOpen} onOpenChange={setStartPopoverOpen}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    disabled={isSaving}
                    className="w-full justify-between text-xs font-semibold hover:bg-muted/80 cursor-pointer h-10 border border-border rounded-lg px-3 disabled:opacity-50"
                  >
                    {startDate ? format(startDate, "PPP", { locale: id }) : <span className="text-muted-foreground">Pilih Tanggal</span>}
                    <CalendarIcon className="h-4 w-4 opacity-50" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0 border border-border bg-card shadow-md rounded-lg" align="start">
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

          {/* Field: Ended At Picker */}
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
                    {endDate ? format(endDate, "PPP", { locale: id }) : <span className="text-muted-foreground">Pilih Tanggal</span>}
                    <CalendarIcon className="h-4 w-4 opacity-50" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0 border border-border bg-card shadow-md rounded-lg" align="start">
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
            disabled={isSaving || !name.trim() || !slug.trim() || !startDate || !endDate}
            className="bg-primary text-primary-foreground text-xs font-semibold h-9 rounded-lg hover:bg-primary/90 cursor-pointer disabled:opacity-50"
          >
            {isSaving ? "Menyimpan..." : "Simpan Perubahan"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
