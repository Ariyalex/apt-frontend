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

import { Field, FieldLabel, FieldTitle } from "@/components/ui/field";

interface EditExpiryDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  currentExpiry: string;
  onSave: (newExpiry: string) => void;
}

export function EditExpiryDialog({
  open,
  onOpenChange,
  currentExpiry,
  onSave,
}: EditExpiryDialogProps): React.JSX.Element {
  const [date, setDate] = useState<Date | undefined>(undefined);
  const [time, setTime] = useState("23:59");
  const [popoverOpen, setPopoverOpen] = useState(false);

  useEffect(() => {
    if (open && currentExpiry) {
      const timer = setTimeout(() => {
        const parsedDate = new Date(currentExpiry);
        setDate(parsedDate);
        const hours = String(parsedDate.getHours()).padStart(2, "0");
        const minutes = String(parsedDate.getMinutes()).padStart(2, "0");
        setTime(`${hours}:${minutes}`);
      }, 0);
      return () => clearTimeout(timer);
    }
  }, [open, currentExpiry]);

  const handleSave = () => {
    if (!date) return;
    const combinedDate = new Date(date);
    const [hours, minutes] = time.split(":");
    combinedDate.setHours(parseInt(hours, 10));
    combinedDate.setMinutes(parseInt(minutes, 10));
    combinedDate.setSeconds(0);
    combinedDate.setMilliseconds(0);
    onSave(combinedDate.toISOString());
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg bg-card border border-border p-6 rounded-xl">
        <DialogHeader>
          <DialogTitle className="text-sm font-bold text-foreground uppercase tracking-wider">
            Edit Masa Berlaku
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="flex flex-row gap-4">
            {/* Date Picker using Shadcn Popover & Calendar */}
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
                    {date ? format(date, "PPP", { locale: id }) : <span className="text-muted-foreground">Pilih Tanggal</span>}
                    <CalendarIcon className="h-4 w-4 opacity-50" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0 border border-border bg-card shadow-md rounded-lg" align="start">
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

        <DialogFooter className="flex justify-end gap-2">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            className="text-xs font-semibold h-9 rounded-lg"
          >
            Batal
          </Button>
          <Button
            onClick={handleSave}
            disabled={!date}
            className="bg-primary text-primary-foreground text-xs font-semibold h-9 rounded-lg hover:bg-primary/90 cursor-pointer"
          >
            Simpan
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
