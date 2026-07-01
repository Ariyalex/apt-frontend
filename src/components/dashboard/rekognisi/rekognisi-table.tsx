import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowUpDown, ArrowUp, ArrowDown, Edit2, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from "lucide-react";
import { DosenData } from "@/types/rekognisi";
import { Button } from "@/components/ui/button";
import { SubmissionEditDialog } from "./submission-edit-dialog";
import { Submission } from "@/types/bagikan-form";
import { useUpdateRecognitionMutation } from "@/store/services/recognitionApi";
import { useGetRecognitionCategoriesQuery } from "@/store/services/recognitionCategoryApi";
import { toast } from "sonner";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  useReactTable,
  getCoreRowModel,
  flexRender,
  createColumnHelper,
} from "@tanstack/react-table";

interface RekognisiTableProps {
  data: DosenData[];
  page: number;
  totalPages: number;
  totalItems: number;
  onPageChange: (page: number) => void;
  showActions?: boolean;
}

const columnHelper = createColumnHelper<DosenData>();

export function RekognisiTable({
  data,
  page,
  totalPages,
  totalItems,
  onPageChange,
  showActions = false,
}: RekognisiTableProps) {
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

  const sortedData = React.useMemo(() => {
    const sorted = [...data];
    if (!sortField) return sorted;
    
    sorted.sort((a, b) => {
      const aVal = (a[sortField] || "").toString().toLowerCase();
      const bVal = (b[sortField] || "").toString().toLowerCase();
      
      if (aVal < bVal) return sortDirection === "asc" ? -1 : 1;
      if (aVal > bVal) return sortDirection === "asc" ? 1 : -1;
      return 0;
    });
    return sorted;
  }, [data, sortField, sortDirection]);

  const columns = React.useMemo(
    () => [
      columnHelper.accessor("nip", {
        header: () => <span className="font-semibold text-muted-foreground">NIP</span>,
        cell: (info) => <span className="font-medium text-muted-foreground">{info.getValue()}</span>,
      }),
      columnHelper.accessor("nama", {
        header: () => (
          <div className="flex items-center gap-1.5 cursor-pointer select-none" onClick={() => handleSort("nama")}>
            Nama Dosen {renderSortIcon("nama")}
          </div>
        ),
        cell: (info) => <span className="font-semibold text-foreground">{info.getValue()}</span>,
      }),
      columnHelper.accessor("prodi", {
        header: () => (
          <div className="flex items-center gap-1.5 cursor-pointer select-none" onClick={() => handleSort("prodi")}>
            Prodi {renderSortIcon("prodi")}
          </div>
        ),
        cell: (info) => <span className="text-foreground">{info.getValue()}</span>,
      }),
      columnHelper.accessor("jenisRekognisi", {
        header: () => (
          <div className="flex items-center gap-1.5 cursor-pointer select-none" onClick={() => handleSort("jenisRekognisi")}>
            Jenis Rekognisi {renderSortIcon("jenisRekognisi")}
          </div>
        ),
        cell: (info) => (
          <span className="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold bg-primary/10 text-primary capitalize">
            {info.getValue()}
          </span>
        ),
      }),
      columnHelper.accessor("tahun", {
        header: () => (
          <div className="flex items-center gap-1.5 cursor-pointer select-none" onClick={() => handleSort("tahun")}>
            Tahun {renderSortIcon("tahun")}
          </div>
        ),
        cell: (info) => <span className="font-semibold text-muted-foreground">{info.getValue()}</span>,
      }),
      columnHelper.accessor("deskripsi", {
        header: () => <span className="font-semibold text-muted-foreground">Deskripsi</span>,
        cell: (info) => (
          <div className="text-muted-foreground leading-relaxed font-semibold max-w-xs truncate" title={info.getValue()}>
            {info.getValue()}
          </div>
        ),
      }),
      ...(showActions
        ? [
            columnHelper.display({
              id: "actions",
              header: () => <div className="text-right font-semibold text-muted-foreground">Aksi</div>,
              cell: (info) => {
                const dosen = info.row.original;
                return (
                  <div className="flex justify-end">
                    <Button
                      size="icon"
                      variant="ghost"
                      onClick={(e) => handleOpenEdit(e, dosen)}
                      className="h-7 w-7 text-muted-foreground hover:text-foreground cursor-pointer"
                      title="Edit Data"
                    >
                      <Edit2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                );
              },
            }),
          ]
        : []),
    ],
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [sortField, sortDirection, showActions]
  );

  // eslint-disable-next-line react-hooks/incompatible-library
  const table = useReactTable({
    data: sortedData,
    columns,
    getCoreRowModel: getCoreRowModel(),
    manualPagination: true,
    pageCount: totalPages,
  });

  const startItem = totalItems === 0 ? 0 : (page - 1) * 10 + 1;
  const endItem = Math.min(page * 10, totalItems);

  return (
    <div className="space-y-3">
      <div className="overflow-x-auto rounded-lg border border-border w-full">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id} className="bg-muted/30 text-xs font-bold text-muted-foreground uppercase">
                {headerGroup.headers.map((header) => (
                  <TableHead key={header.id} className="px-4 py-3 border-b border-border shadow-[inset_0_-1px_0_0_var(--border)]">
                    {header.isPlaceholder
                      ? null
                      : flexRender(header.column.columnDef.header, header.getContext())}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows.length > 0 ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  onClick={() => router.push(`/dashboard/rekognisi-dosen/${row.original.id}`)}
                  className="border-b border-border last:border-0 hover:bg-muted/10 text-xs text-foreground transition-colors cursor-pointer"
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id} className="px-4 py-3.5">
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={showActions ? 7 : 6} className="px-4 py-8 text-center text-xs text-muted-foreground">
                  Tidak ada data ditemukan
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination Controls */}
      <div className="flex items-center justify-between px-4 py-3 border border-border rounded-lg bg-muted/10 text-xs text-muted-foreground select-none">
        <div>
          Menampilkan <span className="font-semibold text-foreground">{startItem}</span> - <span className="font-semibold text-foreground">{endItem}</span> dari <span className="font-semibold text-foreground">{totalItems}</span> data
        </div>
        <div className="flex items-center gap-1.5">
          <Button
            variant="outline"
            size="icon"
            className="h-8 w-8 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            onClick={() => onPageChange(1)}
            disabled={page === 1}
          >
            <ChevronsLeft className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="h-8 w-8 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            onClick={() => onPageChange(page - 1)}
            disabled={page === 1}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <span className="px-2 text-xs font-medium text-foreground">
            Halaman {page} dari {totalPages || 1}
          </span>
          <Button
            variant="outline"
            size="icon"
            className="h-8 w-8 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            onClick={() => onPageChange(page + 1)}
            disabled={page === totalPages || totalPages === 0}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="h-8 w-8 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            onClick={() => onPageChange(totalPages)}
            disabled={page === totalPages || totalPages === 0}
          >
            <ChevronsRight className="h-4 w-4" />
          </Button>
        </div>
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
