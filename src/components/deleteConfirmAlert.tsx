import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface DeleteConfirmAlertProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  description: string;
  isDeleting?: boolean;
}

export default function DeleteConfirmAlert({
  isOpen,
  onClose,
  onConfirm,
  title,
  description,
  isDeleting,
}: DeleteConfirmAlertProps) {
  return (
    <AlertDialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <AlertDialogContent className="bg-card border border-border">
        <AlertDialogHeader>
          <AlertDialogTitle className="text-sm font-bold text-foreground">
            {title}
          </AlertDialogTitle>
          <AlertDialogDescription className="text-xs text-muted-foreground leading-normal">
            {description}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter className="text-xs">
          <AlertDialogCancel
            disabled={isDeleting}
            className="text-xs h-9 cursor-pointer"
          >
            Batal
          </AlertDialogCancel>
          <AlertDialogAction
            disabled={isDeleting}
            onClick={(e) => {
              if (isDeleting) e.preventDefault();
              onConfirm();
            }}
            className="bg-error hover:bg-error/90 text-error-foreground font-semibold text-xs h-9 cursor-pointer"
          >
            Ya, Hapus
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
