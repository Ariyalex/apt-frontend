"use client";

import React from "react";
import { Edit, Trash2 } from "lucide-react";
import type { StudyProgramModel } from "@/types/study-program";

interface ProdiTableProps {
  prodiList: StudyProgramModel[];
  onEdit: (prodi: StudyProgramModel) => void;
  onDelete: (prodiId: number) => void;
}

export function ProdiTable({ prodiList, onEdit, onDelete }: ProdiTableProps): React.JSX.Element {
  return (
    <div className="rounded-xl border border-border bg-card overflow-hidden shadow-sm">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-border bg-muted/20 text-xs font-bold text-muted-foreground uppercase tracking-wider select-none">
              <th className="px-5 py-3 w-16 text-center">No</th>
              <th className="px-5 py-3">Nama Program Studi</th>
              <th className="px-5 py-3">Deskripsi</th>
              <th className="px-5 py-3">Lembaga / Fakultas</th>
              <th className="px-5 py-3 text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border/60 text-xs">
            {prodiList.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-5 py-8 text-center text-muted-foreground">
                  Tidak ada data program studi.
                </td>
              </tr>
            ) : (
              prodiList.map((prodi, index) => {
                return (
                  <tr key={prodi.id} className="hover:bg-muted/5 transition-colors">
                    <td className="px-5 py-3.5 text-center font-medium text-muted-foreground">
                      {index + 1}
                    </td>
                    <td className="px-5 py-3.5 font-bold text-foreground">
                      {prodi.name}
                    </td>
                    <td className="px-5 py-3.5 text-muted-foreground/85 leading-normal max-w-sm">
                      {prodi.description}
                    </td>
                    <td className="px-5 py-3.5 font-medium text-foreground">
                      {prodi.institute?.name || "Tidak Ada"}
                    </td>
                    <td className="px-5 py-3.5 text-right">
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
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
