"use client";

import React from "react";
import { Edit, Trash2 } from "lucide-react";
import { AdminLembaga } from "@/dummy-data/admin";

interface LembagaTableProps {
  lembagaList: AdminLembaga[];
  onEdit: (lembaga: AdminLembaga) => void;
  onDelete: (lembagaId: string) => void;
}

export function LembagaTable({ lembagaList, onEdit, onDelete }: LembagaTableProps) {
  return (
    <div className="rounded-xl border border-border bg-card overflow-hidden shadow-sm">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-border bg-muted/20 text-xs font-bold text-muted-foreground uppercase tracking-wider select-none">
              <th className="px-5 py-3 w-16 text-center">No</th>
              <th className="px-5 py-3">Nama Lembaga</th>
              <th className="px-5 py-3">Deskripsi</th>
              <th className="px-5 py-3">Jenis Lembaga</th>
              <th className="px-5 py-3 text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border/60 text-xs">
            {lembagaList.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-5 py-8 text-center text-muted-foreground">
                  Tidak ada data lembaga.
                </td>
              </tr>
            ) : (
              lembagaList.map((lemb, index) => {
                // Determine jenis lembaga badge color
                let typeBadgeColor = "bg-muted text-muted-foreground";
                if (lemb.jenisLembaga === "Auditee") {
                  typeBadgeColor = "bg-blue-500/10 text-blue-600 dark:text-blue-400";
                } else if (lemb.jenisLembaga === "Auditor") {
                  typeBadgeColor = "bg-purple-500/10 text-purple-600 dark:text-purple-400";
                } else if (lemb.jenisLembaga === "Assessor") {
                  typeBadgeColor = "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400";
                } else if (lemb.jenisLembaga === "None") {
                  typeBadgeColor = "bg-muted text-muted-foreground/80 border border-border";
                }

                return (
                  <tr key={lemb.id} className="hover:bg-muted/5 transition-colors">
                    <td className="px-5 py-3.5 text-center font-medium text-muted-foreground">
                      {index + 1}
                    </td>
                    <td className="px-5 py-3.5 font-bold text-foreground">
                      {lemb.nama}
                    </td>
                    <td className="px-5 py-3.5 text-muted-foreground/85 leading-normal max-w-sm">
                      {lemb.deskripsi}
                    </td>
                    <td className="px-5 py-3.5">
                      <span className={`inline-flex items-center rounded-full px-2 py-0.5 font-bold uppercase tracking-wide text-[10px] ${typeBadgeColor}`}>
                        {lemb.jenisLembaga === "None" ? "Netral/None" : lemb.jenisLembaga}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 text-right">
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

function userMatchesType(val: string, target: string) {
  return val.trim().toLowerCase() === target.trim().toLowerCase();
}
