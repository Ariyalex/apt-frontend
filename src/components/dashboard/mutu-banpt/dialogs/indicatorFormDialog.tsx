import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Field, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Loader2 } from "lucide-react";
import { AdminIndicatorTab } from "../mutu-banpt-admin";
import { useEffect, useState } from "react";

interface IndicatorFormDialogProps {
  isOpen: boolean;
  onClose: () => void;
  isSaving: boolean;
  initialData: AdminIndicatorTab | null;
  onSave: (data: {
    no: string;
    justifikasi: string;
    deskripsi: string;
  }) => void;
  onDeleteRequest: () => void;
}

export default function IndicatorFormDialog({
  isOpen,
  onClose,
  isSaving,
  initialData,
  onSave,
  onDeleteRequest,
}: IndicatorFormDialogProps) {
  const [indNo, setIndNo] = useState<string>("");
  const [indJustifikasi, setIndJustifikasi] = useState<string>("");
  const [indDeskripsi, setIndDeskripsi] = useState<string>("");

  useEffect(() => {
    if (isOpen) {
      if (initialData) {
        const match = initialData.number.match(/\d+/);
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setIndNo(match ? match[0] : "");
        setIndJustifikasi(initialData.justification);
        setIndDeskripsi(initialData.name);
      } else {
        setIndNo("");
        setIndJustifikasi("");
        setIndDeskripsi("");
      }
    }
  }, [isOpen, initialData]);

  const handelSave = () => {
    onSave({
      no: indNo,
      justifikasi: indJustifikasi,
      deskripsi: indDeskripsi,
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-lg p-6 bg-card border border-border text-xs">
        <DialogHeader>
          <DialogTitle className="text-sm font-bold text-foreground">
            {initialData ? "Edit Indikator Mutu" : "Tambah Indikator Mutu"}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-3">
          <Field>
            <FieldLabel htmlFor="ind-no">Nomor Indikator</FieldLabel>
            <Input
              id="ind-no"
              type="number"
              value={indNo}
              onChange={(e) => setIndNo(e.target.value)}
              placeholder="1"
              disabled={isSaving}
              className="w-28 bg-card border-border text-foreground"
            />
          </Field>

          <Field>
            <FieldLabel htmlFor="ind-justifikasi">
              Justifikasi (Rujukan Hukum / SK)
            </FieldLabel>
            <Textarea
              id="ind-justifikasi"
              value={indJustifikasi}
              onChange={(e) => setIndJustifikasi(e.target.value)}
              placeholder="Tuliskan justifikasi..."
              disabled={isSaving}
              rows={3}
              className="w-full bg-card border border-border rounded-lg px-3 py-2 focus:outline-none focus:border-primary text-foreground resize-none"
            />
          </Field>

          <Field>
            <FieldLabel htmlFor="ind-deskripsi">Deskripsi Indikator</FieldLabel>
            <Textarea
              id="ind-deskripsi"
              value={indDeskripsi}
              onChange={(e) => setIndDeskripsi(e.target.value)}
              placeholder="Tuliskan deskripsi kriteria mutu..."
              disabled={isSaving}
              rows={4}
              className="w-full bg-card border border-border rounded-lg px-3 py-2 focus:outline-none focus:border-primary text-foreground resize-none"
            />
          </Field>
        </div>

        <DialogFooter className="flex-row items-center justify-between border-t border-border/40 pt-4 mt-2">
          <div>
            {initialData && (
              <Button
                onClick={onDeleteRequest}
                disabled={isSaving}
                className="bg-error hover:bg-error/90 text-error-foreground font-semibold text-xs h-9 cursor-pointer"
              >
                Hapus Indikator
              </Button>
            )}
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              disabled={isSaving}
              onClick={onClose}
              className="text-xs h-9 cursor-pointer"
            >
              Batal
            </Button>
            <Button
              onClick={handelSave}
              disabled={isSaving}
              className="bg-primary text-primary-foreground text-xs font-semibold h-9 px-4 rounded-lg hover:bg-primary/95 shadow-sm cursor-pointer"
            >
              {isSaving ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              ) : (
                "Simpan"
              )}
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
