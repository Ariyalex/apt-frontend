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
import { Field, FieldLabel, FieldTitle } from "@/components/ui/field";
import type { RecognitionCategoryModel, SaveRecognitionCategoryRequest } from "@/types/recognition-category";
import { AlertCircle, Loader2 } from "lucide-react";

interface RecognitionCategoryDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  category: RecognitionCategoryModel | null; // null means Add mode
  onSave: (savedCategory: SaveRecognitionCategoryRequest) => void;
  isLoading?: boolean;
}

export function RecognitionCategoryDialog({
  open,
  onOpenChange,
  category,
  onSave,
  isLoading = false,
}: RecognitionCategoryDialogProps): React.JSX.Element {
  const [nama, setNama] = useState("");
  const [deskripsi, setDeskripsi] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    if (open) {
      const timer = setTimeout(() => {
        if (category) {
          setNama(category.name);
          setDeskripsi(category.description);
        } else {
          setNama("");
          setDeskripsi("");
        }
        setError("");
      }, 0);
      return () => clearTimeout(timer);
    }
  }, [open, category]);

  const handleSave = (): void => {
    if (!nama.trim() || !deskripsi.trim()) {
      setError("Nama dan Deskripsi wajib diisi!");
      return;
    }

    onSave({
      name: nama.trim(),
      description: deskripsi.trim(),
    });
  };

  const isEdit = !!category;

  return (
    <Dialog open={open} onOpenChange={(val) => {
      if (isLoading) return;
      onOpenChange(val);
    }}>
      <DialogContent className="sm:max-w-lg bg-card border border-border p-6 rounded-xl">
        <DialogHeader>
          <DialogTitle className="text-sm font-bold text-foreground uppercase tracking-wider">
            {isEdit ? "Edit Kategori Rekognisi" : "Tambah Kategori Rekognisi"}
          </DialogTitle>
        </DialogHeader>

        {error && (
          <div className="p-3.5 rounded-lg border border-rose-500/10 bg-rose-500/5 text-rose-600 dark:text-rose-400 text-xs font-semibold flex items-center gap-2 animate-fadeIn">
            <AlertCircle className="h-4.5 w-4.5 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <div className="space-y-4 py-4">
          <Field>
            <FieldLabel>
              <FieldTitle>Nama Kategori</FieldTitle>
            </FieldLabel>
            <input
              type="text"
              value={nama}
              onChange={(e) => setNama(e.target.value)}
              disabled={isLoading}
              placeholder="Contoh: narasumber, tenaga ahli..."
              className="w-full h-10 rounded-lg border border-border bg-card px-3 py-2 text-xs text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:ring-1 focus:ring-primary disabled:opacity-50 disabled:cursor-not-allowed"
            />
          </Field>

          <Field>
            <FieldLabel>
              <FieldTitle>Deskripsi</FieldTitle>
            </FieldLabel>
            <textarea
              value={deskripsi}
              onChange={(e) => setDeskripsi(e.target.value)}
              disabled={isLoading}
              placeholder="Masukkan deskripsi kategori..."
              rows={4}
              className="w-full rounded-lg border border-border bg-card px-3 py-2 text-xs text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:ring-1 focus:ring-primary min-h-[100px] disabled:opacity-50 disabled:cursor-not-allowed"
            />
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
