"use client";

import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Field, FieldLabel, FieldTitle } from "@/components/ui/field";
import type { StudyProgramModel, SaveStudyProgramRequest } from "@/types/study-program";
import { useGetInstitutesQuery } from "@/store/services/instituteApi";
import { AlertCircle, Loader2 } from "lucide-react";

interface ProdiDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  prodi: StudyProgramModel | null; // null means Add mode
  onSave: (savedProdi: SaveStudyProgramRequest) => void;
  isLoading?: boolean;
}

export function ProdiDialog({
  open,
  onOpenChange,
  prodi,
  onSave,
  isLoading = false,
}: ProdiDialogProps): React.JSX.Element {
  const [nama, setNama] = useState("");
  const [deskripsi, setDeskripsi] = useState("");
  const [instituteId, setInstituteId] = useState<string>("");
  const [error, setError] = useState("");

  const { data: responseInstitutes } = useGetInstitutesQuery();
  const lembagaList = responseInstitutes?.data || [];

  useEffect(() => {
    if (open) {
      const timer = setTimeout(() => {
        if (prodi) {
          setNama(prodi.name);
          setDeskripsi(prodi.description);
          setInstituteId(prodi.institute?.id ? prodi.institute.id.toString() : "");
        } else {
          setNama("");
          setDeskripsi("");
          setInstituteId("");
        }
        setError("");
      }, 0);
      return () => clearTimeout(timer);
    }
  }, [open, prodi]);

  const handleSave = (): void => {
    if (!nama.trim() || !deskripsi.trim()) {
      setError("Nama Program Studi dan Deskripsi wajib diisi!");
      return;
    }
    if (!instituteId) {
      setError("Pilih Lembaga / Fakultas terlebih dahulu!");
      return;
    }

    onSave({
      name: nama.trim(),
      description: deskripsi.trim(),
      institute_id: parseInt(instituteId, 10),
    });
  };

  const isEdit = !!prodi;

  return (
    <Dialog open={open} onOpenChange={(val) => {
      if (isLoading) return;
      onOpenChange(val);
    }}>
      <DialogContent className="sm:max-w-lg bg-card border border-border p-6 rounded-xl">
        <DialogHeader>
          <DialogTitle className="text-sm font-bold text-foreground uppercase tracking-wider">
            {isEdit ? "Edit Program Studi" : "Tambah Program Studi"}
          </DialogTitle>
        </DialogHeader>

        {error && (
          <div className="p-3.5 rounded-lg border border-rose-500/10 bg-rose-500/5 text-rose-600 dark:text-rose-400 text-xs font-semibold flex items-center gap-2 animate-fadeIn">
            <AlertCircle className="h-4.5 w-4.5 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <div className="space-y-4 py-4">
          {/* Nama Prodi (text field) */}
          <Field>
            <FieldLabel>
              <FieldTitle>Nama Program Studi</FieldTitle>
            </FieldLabel>
            <input
              type="text"
              value={nama}
              onChange={(e) => setNama(e.target.value)}
              disabled={isLoading}
              placeholder="Masukkan nama program studi..."
              className="w-full h-10 rounded-lg border border-border bg-card px-3 py-2 text-xs text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:ring-1 focus:ring-primary disabled:opacity-50 disabled:cursor-not-allowed"
            />
          </Field>

          {/* Deskripsi (text area) */}
          <Field>
            <FieldLabel>
              <FieldTitle>Deskripsi</FieldTitle>
            </FieldLabel>
            <textarea
              value={deskripsi}
              onChange={(e) => setDeskripsi(e.target.value)}
              disabled={isLoading}
              placeholder="Masukkan deskripsi..."
              rows={4}
              className="w-full rounded-lg border border-border bg-card px-3 py-2 text-xs text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:ring-1 focus:ring-primary min-h-[100px] disabled:opacity-50 disabled:cursor-not-allowed"
            />
          </Field>

          {/* Lembaga / Fakultas (Select Component) */}
          <Field>
            <FieldLabel>
              <FieldTitle>Lembaga / Fakultas</FieldTitle>
            </FieldLabel>
            <Select
              value={instituteId}
              onValueChange={(val) => setInstituteId(val)}
              disabled={isLoading}
            >
              <SelectTrigger className="w-full h-10 bg-card border border-border rounded-lg px-3 py-2 text-xs font-semibold focus:outline-none focus:border-primary transition-colors cursor-pointer justify-between disabled:opacity-50 disabled:cursor-not-allowed">
                <SelectValue placeholder="Pilih Lembaga / Fakultas" />
              </SelectTrigger>
              <SelectContent>
                {lembagaList.map((lemb) => (
                  <SelectItem key={lemb.id} value={lemb.id.toString()} className="text-xs font-semibold cursor-pointer">
                    {lemb.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Field>
        </div>

        <DialogFooter className="flex justify-end gap-2 pt-2">
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isLoading}
            className="h-10 text-xs font-bold px-4 rounded-lg cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Batal
          </Button>
          <Button
            type="button"
            onClick={handleSave}
            disabled={isLoading}
            className="bg-primary text-primary-foreground font-semibold text-xs h-10 px-4 rounded-lg hover:bg-primary/95 transition-all shadow-sm cursor-pointer flex items-center gap-1.5 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <>
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
                <span>Menyimpan...</span>
              </>
            ) : (
              <span>Simpan</span>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
