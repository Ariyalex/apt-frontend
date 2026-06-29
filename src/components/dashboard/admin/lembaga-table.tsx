"use client";

import React from "react";
import { Edit, Trash2 } from "lucide-react";
import type { InstituteModel } from "@/types/institute";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface LembagaTableProps {
  lembagaList: InstituteModel[];
  onEdit: (lembaga: InstituteModel) => void;
  onDelete: (lembagaId: number) => void;
}

export function LembagaTable({ lembagaList, onEdit, onDelete }: LembagaTableProps): React.JSX.Element {
  return (
    <div className="rounded-xl border border-border bg-card overflow-hidden shadow-sm">
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow className="border-b border-border bg-muted/20 text-xs font-bold text-muted-foreground uppercase tracking-wider select-none">
              <TableHead className="px-5 py-3 w-16 text-center">No</TableHead>
              <TableHead className="px-5 py-3">Nama Lembaga</TableHead>
              <TableHead className="px-5 py-3">Deskripsi</TableHead>
              <TableHead className="px-5 py-3 text-right">Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody className="text-xs">
            {lembagaList.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} className="px-5 py-8 text-center text-muted-foreground">
                   Tidak ada data lembaga.
                </TableCell>
              </TableRow>
            ) : (
              lembagaList.map((lemb, index) => {
                return (
                  <TableRow key={lemb.id} className="hover:bg-muted/5 transition-colors">
                    <TableCell className="px-5 py-3.5 text-center font-medium text-muted-foreground">
                      {index + 1}
                    </TableCell>
                    <TableCell className="px-5 py-3.5 font-bold text-foreground">
                      {lemb.name}
                    </TableCell>
                    <TableCell className="px-5 py-3.5 text-muted-foreground/85 leading-normal max-w-sm">
                      {lemb.description}
                    </TableCell>
                    <TableCell className="px-5 py-3.5 text-right">
                      <div className="flex justify-end gap-1.5">
                        <button
                          onClick={() => onEdit(lemb)}
                          title="Edit Lembaga"
                          className="p-1.5 hover:bg-muted rounded text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
                        >
                          <Edit className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => onDelete(lemb.id)}
                          title="Hapus Lembaga (Semua user di lembaga ini juga akan terhapus)"
                          className="p-1.5 hover:bg-rose-500/10 rounded text-muted-foreground hover:text-rose-600 transition-colors cursor-pointer"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}


