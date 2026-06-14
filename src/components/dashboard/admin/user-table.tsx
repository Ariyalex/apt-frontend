"use client";

import React from "react";
import { Edit, Trash2, CheckCircle2, XCircle } from "lucide-react";
import { AdminUser } from "@/dummy-data/admin";

interface UserTableProps {
  users: AdminUser[];
  onEdit: (user: AdminUser) => void;
  onDelete: (userId: string) => void;
}

export function UserTable({ users, onEdit, onDelete }: UserTableProps) {
  return (
    <div className="rounded-xl border border-border bg-card overflow-hidden shadow-sm">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-border bg-muted/20 text-xs font-bold text-muted-foreground uppercase tracking-wider select-none">
              <th className="px-5 py-3 w-16 text-center">No</th>
              <th className="px-5 py-3">Username</th>
              <th className="px-5 py-3">Password</th>
              <th className="px-5 py-3">Jenis Akun</th>
              <th className="px-5 py-3">Lembaga</th>
              <th className="px-5 py-3">Created At</th>
              <th className="px-5 py-3">Status</th>
              <th className="px-5 py-3 text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border/60 text-xs">
            {users.length === 0 ? (
              <tr>
                <td colSpan={8} className="px-5 py-8 text-center text-muted-foreground">
                  Tidak ada data pengguna.
                </td>
              </tr>
            ) : (
              users.map((user, index) => {
                // Determine jenis akun badge color
                let typeBadgeColor = "bg-muted text-muted-foreground";
                if (user.jenisAkun === "admin") {
                  typeBadgeColor = "bg-amber-500/10 text-amber-600 dark:text-amber-400";
                } else if (user.jenisAkun === "prodi") {
                  typeBadgeColor = "bg-blue-500/10 text-blue-600 dark:text-blue-400";
                } else if (user.jenisAkun === "LPM") {
                  typeBadgeColor = "bg-purple-500/10 text-purple-600 dark:text-purple-400";
                } else if (user.jenisAkun === "asessor") {
                  typeBadgeColor = "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400";
                }

                // Mask password
                const maskedPassword = "••••••••";

                return (
                  <tr key={user.id} className="hover:bg-muted/5 transition-colors">
                    <td className="px-5 py-3.5 text-center font-medium text-muted-foreground">
                      {index + 1}
                    </td>
                    <td className="px-5 py-3.5 font-bold text-foreground">
                      {user.username}
                    </td>
                    <td className="px-5 py-3.5 font-mono text-muted-foreground/60 select-none">
                      {maskedPassword}
                    </td>
                    <td className="px-5 py-3.5">
                      <span className={`inline-flex items-center rounded-full px-2 py-0.5 font-bold uppercase tracking-wide text-[10px] ${typeBadgeColor}`}>
                        {user.jenisAkun}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 font-medium text-foreground">
                      {user.lembaga}
                    </td>
                    <td className="px-5 py-3.5 text-muted-foreground/85">
                      {user.createdAt}
                    </td>
                    <td className="px-5 py-3.5">
                      <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 font-bold text-[10px] uppercase tracking-wide ${
                        user.status === "active"
                          ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                          : "bg-rose-500/10 text-rose-600 dark:text-rose-400"
                      }`}>
                        {user.status === "active" ? (
                          <>
                            <CheckCircle2 className="h-3 w-3" />
                            <span>active</span>
                          </>
                        ) : (
                          <>
                            <XCircle className="h-3 w-3" />
                            <span>banned</span>
                          </>
                        )}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 text-right">
                      <div className="flex justify-end gap-1.5">
                        <button
                          onClick={() => onEdit(user)}
                          title="Edit User"
                          className="p-1.5 hover:bg-muted rounded text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
                        >
                          <Edit className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => onDelete(user.id)}
                          title="Hapus User"
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
