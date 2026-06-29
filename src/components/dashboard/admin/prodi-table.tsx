"use client";

import React from "react";
import { Edit, Trash2 } from "lucide-react";
import type { StudyProgramModel } from "@/types/study-program";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface ProdiTableProps {
  prodiList: StudyProgramModel[];
  onEdit: (prodi: StudyProgramModel) => void;
  onDelete: (prodiId: number) => void;
}

export function ProdiTable({ prodiList, onEdit, onDelete }: ProdiTableProps): React.JSX.Element {
  return (
    <div className="rounded-xl border border-border bg-card overflow-hidden shadow-sm">
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow className="border-b border-border bg-muted/20 text-xs font-bold text-muted-foreground uppercase tracking-wider select-none">
              <TableHead className="px-5 py-3 w-16 text-center">No</TableHead>
              <TableHead className="px-5 py-3">Nama Program Studi</TableHead>
              <TableHead className="px-5 py-3">Deskripsi</TableHead>
              <TableHead className="px-5 py-3">Lembaga / Fakultas</TableHead>
              <TableHead className="px-5 py-3 text-right">Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody className="text-xs">
            {prodiList.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="px-5 py-8 text-center text-muted-foreground">
                  Tidak ada data program studi.
                </TableCell>
              </TableRow>
            ) : (
              prodiList.map((prodi, index) => {
                return (
                  <TableRow key={prodi.id} className="hover:bg-muted/5 transition-colors">
                    <TableCell className="px-5 py-3.5 text-center font-medium text-muted-foreground">
                      {index + 1}
                    </TableCell>
                    <TableCell className="px-5 py-3.5 font-bold text-foreground">
                      {prodi.name}
                    </TableCell>
                    <TableCell className="px-5 py-3.5 text-muted-foreground/85 leading-normal max-w-sm">
                      {prodi.description}
                    </TableCell>
                    <TableCell className="px-5 py-3.5 font-medium text-foreground">
                      {prodi.institute?.name || "Tidak Ada"}
                    </TableCell>
                    <TableCell className="px-5 py-3.5 text-right">
                      <div className="flex justify-end gap-1.5">
                        <button
                          onClick={() => onEdit(prodi)}
                          title="Edit Prodi"
                          className="p-1.5 hover:bg-muted rounded text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
                        >
                          <Edit className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => onDelete(prodi.id)}
                          title="Hapus Prodi"
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
