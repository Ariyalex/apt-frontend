"use client";

import React, { useState } from "react";
import { Award, Search, Loader2 } from "lucide-react";
import { RecognitionCategoryTable } from "@/components/dashboard/admin/recognition-category-table";
import { RecognitionCategoryDialog } from "@/components/dashboard/admin/recognition-category-dialog";
import { toast } from "sonner";
import { Skeleton } from "@/components/ui/skeleton";
import {
  useGetRecognitionCategoriesQuery,
  useCreateRecognitionCategoryMutation,
  useUpdateRecognitionCategoryMutation,
  useDeleteRecognitionCategoryMutation,
} from "@/store/services/recognitionCategoryApi";
import type { RecognitionCategoryModel, SaveRecognitionCategoryRequest } from "@/types/recognition-category";
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

interface CustomErrorObject {
  data?:
    | {
        message?: string;
        error?: string;
      }
    | string;
}

const extractErrorMessage = (err: unknown): string => {
  if (err && typeof err === "object" && "data" in err) {
    const errObj = err as CustomErrorObject;
    const apiError = errObj.data;
    if (apiError && typeof apiError === "object") {
      return apiError.message || apiError.error || JSON.stringify(apiError);
    }
    if (typeof apiError === "string") {
      return apiError;
    }
  }
  return "Terjadi kesalahan pada server. Silakan coba kembali.";
};

export default function KelolaKategoriRekognisiPage(): React.JSX.Element {
  const [searchKeyword, setSearchKeyword] = useState<string>("");
  const [dialogOpen, setDialogOpen] = useState<boolean>(false);
  const [selectedCategory, setSelectedCategory] = useState<RecognitionCategoryModel | null>(null);
  const [deleteCategoryId, setDeleteCategoryId] = useState<number | null>(null);

  // RTK Query hooks
  const { data: responseData, isLoading: isCategoriesLoading } = useGetRecognitionCategoriesQuery();
  const [createCategory, { isLoading: isCreateLoading }] = useCreateRecognitionCategoryMutation();
  const [updateCategory, { isLoading: isUpdateLoading }] = useUpdateRecognitionCategoryMutation();
  const [deleteCategory, { isLoading: isDeleteLoading }] = useDeleteRecognitionCategoryMutation();

  const isMutationLoading = isCreateLoading || isUpdateLoading || isDeleteLoading;

  const rawCategoryList = responseData?.data || [];

  // Client-side filtering based on keyword
  const filteredCategoryList = rawCategoryList.filter((cat) =>
    cat.name.toLowerCase().includes(searchKeyword.toLowerCase()) ||
    cat.description.toLowerCase().includes(searchKeyword.toLowerCase())
  );

  const handleAddCategory = (): void => {
    setSelectedCategory(null);
    setDialogOpen(true);
  };

  const handleEditCategory = (category: RecognitionCategoryModel): void => {
    setSelectedCategory(category);
    setDialogOpen(true);
  };

  const handleDeleteCategory = (categoryId: number): void => {
    setDeleteCategoryId(categoryId);
  };

  const confirmDeleteCategory = async (): Promise<void> => {
    if (deleteCategoryId === null) return;
    const targetCat = rawCategoryList.find((c) => c.id === deleteCategoryId);

    try {
      const response = await deleteCategory(deleteCategoryId).unwrap();
      toast.success(
        response.message ||
          `Kategori "${targetCat?.name || deleteCategoryId}" berhasil dihapus.`
      );
      setDeleteCategoryId(null);
    } catch (err: unknown) {
      toast.error(extractErrorMessage(err));
    }
  };

  const handleSaveCategory = async (
    savedCategory: SaveRecognitionCategoryRequest
  ): Promise<void> => {
    try {
      if (selectedCategory) {
        // Edit Mode
        const response = await updateCategory({
          id: selectedCategory.id,
          body: {
            name: savedCategory.name.toLowerCase(),
            description: savedCategory.description,
          },
        }).unwrap();
        toast.success(
          response.message ||
            `Kategori "${savedCategory.name}" berhasil diperbarui.`
        );
        setDialogOpen(false);
      } else {
        // Create Mode
        const response = await createCategory({
          name: savedCategory.name.toLowerCase(),
          description: savedCategory.description,
        }).unwrap();
        toast.success(
          response.message ||
            `Kategori "${savedCategory.name}" berhasil ditambahkan.`
        );
        setDialogOpen(false);
      }
    } catch (err: unknown) {
      toast.error(extractErrorMessage(err));
    }
  };

  const activeDeleteCategoryName = deleteCategoryId
    ? rawCategoryList.find((c) => c.id === deleteCategoryId)?.name
    : "";

  if (isCategoriesLoading) {
    return (
      <div className="space-y-6 animate-fadeIn">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-border/40 pb-4">
          <div>
            <Skeleton className="h-6 w-56 rounded" />
            <Skeleton className="h-4 w-96 rounded mt-2" />
          </div>
          <Skeleton className="h-10 w-36 rounded-lg" />
        </div>
        <div className="relative max-w-sm">
          <Skeleton className="h-10 w-full rounded-lg" />
        </div>
        <div className="rounded-xl border border-border bg-card overflow-hidden shadow-sm p-5 space-y-4">
          <div className="flex justify-between items-center pb-4 border-b border-border/60">
            <Skeleton className="h-5 w-20 rounded" />
            <Skeleton className="h-5 w-40 rounded" />
          </div>
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="flex justify-between items-center py-2.5">
              <Skeleton className="h-4 w-12 rounded" />
              <Skeleton className="h-5 w-48 rounded" />
              <Skeleton className="h-5 w-[24rem] rounded" />
              <Skeleton className="h-5 w-16 rounded" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fadeIn">
      <div className="border-b border-border/40 pb-4">
        <h1 className="text-xl font-bold tracking-tight text-foreground md:text-2xl">
          Kelola Kategori Rekognisi
        </h1>
        <p className="text-xs text-muted-foreground mt-1">
          Kelola parameter kategori jenis rekognisi dosen untuk keperluan akreditasi BAN-PT.
        </p>
      </div>

      {/* Search Input and Add Button */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative max-w-sm w-full">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground/60" />
          <input
            type="text"
            placeholder="Cari kategori..."
            value={searchKeyword}
            onChange={(e) => setSearchKeyword(e.target.value)}
            className="w-full h-10 rounded-lg border border-border bg-card pl-9 pr-4 py-2 text-xs text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:ring-1 focus:ring-primary"
          />
        </div>
        <button
          onClick={handleAddCategory}
          disabled={isMutationLoading}
          className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-3 py-2 text-xs font-semibold text-primary-foreground hover:bg-primary/95 transition-all shadow-sm cursor-pointer self-start sm:self-auto disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Award className="h-4 w-4" />
          <span>Tambah Kategori</span>
        </button>
      </div>

      <RecognitionCategoryTable
        categoryList={filteredCategoryList}
        onEdit={handleEditCategory}
        onDelete={handleDeleteCategory}
      />

      <RecognitionCategoryDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        category={selectedCategory}
        onSave={handleSaveCategory}
        isLoading={isMutationLoading}
      />

      {/* Alert Dialog Hapus Kategori */}
      <AlertDialog open={deleteCategoryId !== null} onOpenChange={(open) => {
        if (!open && !isDeleteLoading) setDeleteCategoryId(null);
      }}>
        <AlertDialogContent className="bg-card border border-border p-6 rounded-xl sm:max-w-md animate-fadeIn">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-xs font-bold text-foreground tracking-wider uppercase">
              Hapus Kategori Rekognisi
            </AlertDialogTitle>
            <AlertDialogDescription className="text-xs text-muted-foreground mt-2">
              Apakah Anda yakin ingin menghapus kategori rekognisi <span className="font-bold text-foreground capitalize">&quot;{activeDeleteCategoryName}&quot;</span>? Tindakan ini tidak dapat dibatalkan.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="flex justify-end gap-2 pt-2">
            <AlertDialogCancel
              disabled={isDeleteLoading}
              className="text-xs font-semibold h-9 rounded-lg border border-border bg-card text-foreground hover:bg-muted cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Batal
            </AlertDialogCancel>
            <AlertDialogAction
              disabled={isDeleteLoading}
              onClick={(e) => {
                e.preventDefault();
                confirmDeleteCategory();
              }}
              className="bg-error text-error-foreground hover:bg-error/90 text-xs font-semibold h-9 rounded-lg cursor-pointer flex items-center justify-center gap-1.5 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isDeleteLoading ? (
                <>
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  <span>Menghapus...</span>
                </>
              ) : (
                <span>Hapus Kategori</span>
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
