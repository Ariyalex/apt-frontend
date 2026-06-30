import React from "react";
import { Edit, Trash2, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from "lucide-react";
import type { InstituteModel } from "@/types/institute";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import {
  useReactTable,
  getCoreRowModel,
  flexRender,
  createColumnHelper,
} from "@tanstack/react-table";

interface LembagaTableProps {
  lembagaList: InstituteModel[];
  page: number;
  totalPages: number;
  totalItems: number;
  onPageChange: (page: number) => void;
  onEdit: (lembaga: InstituteModel) => void;
  onDelete: (lembagaId: number) => void;
}

const columnHelper = createColumnHelper<InstituteModel>();

export function LembagaTable({
  lembagaList,
  page,
  totalPages,
  totalItems,
  onPageChange,
  onEdit,
  onDelete,
}: LembagaTableProps): React.JSX.Element {
  const columns = React.useMemo(
    () => [
      columnHelper.accessor((_, index) => index + 1 + (page - 1) * 10, {
        id: "index",
        header: () => <div className="text-center">No</div>,
        cell: (info) => (
          <div className="text-center font-medium text-muted-foreground">
            {info.getValue()}
          </div>
        ),
      }),
      columnHelper.accessor("name", {
        header: "Nama Lembaga",
        cell: (info) => <span className="font-bold text-foreground">{info.getValue()}</span>,
      }),
      columnHelper.accessor("description", {
        header: "Deskripsi",
        cell: (info) => (
          <div className="text-muted-foreground/85 leading-normal max-w-sm whitespace-pre-line">
            {info.getValue()}
          </div>
        ),
      }),
      columnHelper.display({
        id: "actions",
        header: () => <div className="text-right">Action</div>,
        cell: (info) => {
          const lembaga = info.row.original;
          return (
            <div className="flex justify-end gap-1.5">
              <button
                onClick={() => onEdit(lembaga)}
                title="Edit Lembaga"
                className="p-1.5 hover:bg-muted rounded text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
              >
                <Edit className="h-4 w-4" />
              </button>
              <button
                onClick={() => onDelete(lembaga.id)}
                title="Hapus Lembaga (Semua user di lembaga ini juga akan terhapus)"
                className="p-1.5 hover:bg-rose-500/10 rounded text-muted-foreground hover:text-rose-600 transition-colors cursor-pointer"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          );
        },
      }),
    ],
    [page, onEdit, onDelete]
  );

  const table = useReactTable({
    data: lembagaList,
    columns,
    getCoreRowModel: getCoreRowModel(),
    manualPagination: true,
    pageCount: totalPages,
  });

  const startItem = totalItems === 0 ? 0 : (page - 1) * 10 + 1;
  const endItem = Math.min(page * 10, totalItems);

  return (
    <div className="rounded-xl border border-border bg-card overflow-hidden shadow-sm">
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow
                key={headerGroup.id}
                className="border-b border-border bg-muted/20 text-xs font-bold text-muted-foreground uppercase tracking-wider select-none"
              >
                {headerGroup.headers.map((header) => (
                  <TableHead key={header.id} className="px-5 py-3">
                    {header.isPlaceholder
                      ? null
                      : flexRender(header.column.columnDef.header, header.getContext())}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody className="text-xs">
            {table.getRowModel().rows.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} className="px-5 py-8 text-center text-muted-foreground">
                  Tidak ada data lembaga.
                </TableCell>
              </TableRow>
            ) : (
              table.getRowModel().rows.map((row) => (
                <TableRow key={row.id} className="hover:bg-muted/5 transition-colors">
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id} className="px-5 py-3.5">
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination Controls */}
      <div className="flex items-center justify-between px-5 py-3 border-t border-border bg-muted/10 text-xs text-muted-foreground select-none">
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
    </div>
  );
}


