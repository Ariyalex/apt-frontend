import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowUpDown, ArrowUp, ArrowDown, Edit2 } from "lucide-react";
import { DosenData } from "@/types/rekognisi";
import { Button } from "@/components/ui/button";
import { SubmissionEditDialog } from "./submission-edit-dialog";
import { Submission } from "@/dummy-data/bagikan-form";
import { useUpdateRecognitionMutation } from "@/store/services/recognitionApi";
import { useGetRecognitionCategoriesQuery } from "@/store/services/recognitionCategoryApi";
import { toast } from "sonner";

interface RekognisiTableProps {
  data: DosenData[];
}

export function RekognisiTable({ data }: RekognisiTableProps) {
  const router = useRouter();
  const [sortField, setSortField] = useState<keyof DosenData | null>(null);
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");

  // Edit states
  const [editOpen, setEditOpen] = useState(false);
  const [selectedSub, setSelectedSub] = useState<Submission | null>(null);

  // Mutations and queries
  const [updateRecognition, { isLoading: isUpdating }] = useUpdateRecognitionMutation();
  const { data: categoriesResponse } = useGetRecognitionCategoriesQuery();
  const categoryList = categoriesResponse?.data || [];

  const handleSort = (field: keyof DosenData) => {
    const isAsc = sortField === field && sortDirection === "asc";
    setSortField(field);
    setSortDirection(isAsc ? "desc" : "asc");
  };

  const handleOpenEdit = (e: React.MouseEvent, dosen: DosenData) => {
    e.stopPropagation(); // prevent navigation to detail page
    setSelectedSub({
      id: dosen.id || "",
      nip: dosen.nip,
      nama: dosen.nama,
      prodi: dosen.prodi,
      jenisRekognisi: dosen.jenisRekognisi,
      tahun: dosen.tahun,
      deskripsi: dosen.deskripsi,
      linkBukti: dosen.buktiUrl || "",
      status: "approved",
    });
    setEditOpen(true);
  };

  const handleSaveSubmission = async (updated: Submission, lecturerId: string) => {
    const matchedCategory = categoryList.find(
      (c) => c.name.toLowerCase() === updated.jenisRekognisi.toLowerCase()
    );
    const category_id = matchedCategory ? matchedCategory.id : 1;

    try {
      await updateRecognition({
        id: updated.id,
        body: {
          lecturer_id: lecturerId,
          category_id,
          obtained_at: `${updated.tahun}-01-01T00:00:00Z`,
          description: updated.deskripsi,
          proof_links: updated.linkBukti ? updated.linkBukti.split(",").filter(Boolean) : [],
        },
      }).unwrap();
      toast.success("Data rekognisi berhasil diperbarui!");
      setEditOpen(false);
    } catch (err: unknown) {
      const customErr = err as { data?: { message?: string } };
      toast.error(customErr?.data?.message || "Gagal memperbarui data rekognisi");
    }
  };

  const sortedData = [...data].sort((a, b) => {
    if (!sortField) return 0;
    const valA = a[sortField].toString().toLowerCase();
    const valB = b[sortField].toString().toLowerCase();
    if (valA < valB) return sortDirection === "asc" ? -1 : 1;
    if (valA > valB) return sortDirection === "asc" ? 1 : -1;
    return 0;
  });

  const renderSortIcon = (field: keyof DosenData) => {
    if (sortField !== field) {
      return <ArrowUpDown className="h-3 w-3 text-muted-foreground/70 group-hover:text-foreground transition-colors" />;
    }
    return sortDirection === "asc" ? (
      <ArrowUp className="h-3 w-3 text-primary transition-colors" />
    ) : (
      <ArrowDown className="h-3 w-3 text-primary transition-colors" />
    );
  };

  return (
    <div className="space-y-3">
      {/* Scrollable horizontal wrapper without height restrictions */}
      <div className="overflow-x-auto rounded-lg border border-border w-full">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-muted/30 text-xs font-bold text-muted-foreground uppercase">
              <th className="px-4 py-3 font-semibold border-b border-border shadow-[inset_0_-1px_0_0_var(--border)]">NIP</th>
              
              <th 
                onClick={() => handleSort("nama")} 
                className="px-4 py-3 font-semibold cursor-pointer hover:bg-muted/50 transition-colors group border-b border-border shadow-[inset_0_-1px_0_0_var(--border)]"
              >
                <div className="flex items-center gap-1.5">
                  Nama Dosen
                  {renderSortIcon("nama")}
                </div>
              </th>
              
              <th 
                onClick={() => handleSort("prodi")} 
                className="px-4 py-3 font-semibold cursor-pointer hover:bg-muted/50 transition-colors group border-b border-border shadow-[inset_0_-1px_0_0_var(--border)]"
              >
                <div className="flex items-center gap-1.5">
                  Prodi
                  {renderSortIcon("prodi")}
                </div>
              </th>
              
              <th 
                onClick={() => handleSort("jenisRekognisi")} 
                className="px-4 py-3 font-semibold cursor-pointer hover:bg-muted/50 transition-colors group border-b border-border shadow-[inset_0_-1px_0_0_var(--border)]"
              >
                <div className="flex items-center gap-1.5">
                  Jenis Rekognisi
                  {renderSortIcon("jenisRekognisi")}
                </div>
              </th>
              
              <th 
                onClick={() => handleSort("tahun")} 
                className="px-4 py-3 font-semibold cursor-pointer hover:bg-muted/50 transition-colors group border-b border-border shadow-[inset_0_-1px_0_0_var(--border)]"
              >
                <div className="flex items-center gap-1.5">
                  Tahun
                  {renderSortIcon("tahun")}
                </div>
              </th>
              
              <th className="px-4 py-3 font-semibold border-b border-border shadow-[inset_0_-1px_0_0_var(--border)]">Deskripsi</th>
              <th className="px-4 py-3 font-semibold text-right border-b border-border shadow-[inset_0_-1px_0_0_var(--border)]">Aksi</th>
            </tr>
          </thead>
          <tbody>
            {sortedData.length > 0 ? (
              sortedData.map((dosen, i) => (
                <tr 
                  key={dosen.id || i} 
                  onClick={() => router.push(`/dashboard/rekognisi-dosen/${dosen.id}`)}
                  className="border-b border-border last:border-0 hover:bg-muted/10 text-xs text-foreground transition-colors cursor-pointer"
                >
                  <td className="px-4 py-3.5 font-medium text-muted-foreground">{dosen.nip}</td>
                  <td className="px-4 py-3.5 font-semibold">{dosen.nama}</td>
                  <td className="px-4 py-3.5">{dosen.prodi}</td>
                  <td className="px-4 py-3.5">
                    <span className="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold bg-primary/10 text-primary capitalize">
                      {dosen.jenisRekognisi}
                    </span>
                  </td>
                  <td className="px-4 py-3.5 font-semibold text-muted-foreground">{dosen.tahun}</td>
                  <td className="px-4 py-3.5 text-muted-foreground leading-relaxed font-semibold" title={dosen.deskripsi}>
                    {dosen.deskripsi}
                  </td>
                  <td className="px-4 py-3.5 text-right">
                    <Button
                      size="icon"
                      variant="ghost"
                      onClick={(e) => handleOpenEdit(e, dosen)}
                      className="h-7 w-7 text-muted-foreground hover:text-foreground cursor-pointer"
                      title="Edit Data"
                    >
                      <Edit2 className="h-3.5 w-3.5" />
                    </Button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={7} className="px-4 py-8 text-center text-xs text-muted-foreground">
                  Tidak ada data ditemukan
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Table Footer Actions */}
      <div className="flex justify-between items-center text-xs font-semibold text-muted-foreground/60 uppercase tracking-wider pt-2">
        <span>Menampilkan {sortedData.length} baris data</span>
      </div>

      {/* Submission Edit Dialog */}
      <SubmissionEditDialog
        open={editOpen}
        onOpenChange={setEditOpen}
        submission={selectedSub}
        onSave={handleSaveSubmission}
        isSaving={isUpdating}
      />
    </div>
  );
}
