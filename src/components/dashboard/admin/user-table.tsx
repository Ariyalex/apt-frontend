"use client";

import React from "react";
import { Edit, Trash2, CheckCircle2, XCircle, Key } from "lucide-react";
import type { UserAdminModel } from "@/types/user";
import type { InstituteModel } from "@/types/institute";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface UserTableProps {
  users: UserAdminModel[];
  lembagaList?: InstituteModel[];
  onEdit: (user: UserAdminModel) => void;
  onDelete: (userId: string) => void;
  onResetPassword: (user: UserAdminModel) => void;
}

export function UserTable({
  users,
  lembagaList = [],
  onEdit,
  onDelete,
  onResetPassword,
}: UserTableProps): React.JSX.Element {
  return (
    <div className="rounded-xl border border-border bg-card overflow-hidden shadow-sm">
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow className="border-b border-border bg-muted/20 text-xs font-bold text-muted-foreground uppercase tracking-wider select-none">
              <TableHead className="px-5 py-3 w-16 text-center">No</TableHead>
              <TableHead className="px-5 py-3">Nama / Username</TableHead>
              <TableHead className="px-5 py-3">Jenis Akun</TableHead>
              <TableHead className="px-5 py-3">Institute ID</TableHead>
              <TableHead className="px-5 py-3">Created At</TableHead>
              <TableHead className="px-5 py-3">Status Password</TableHead>
              <TableHead className="px-5 py-3">Status</TableHead>
              <TableHead className="px-5 py-3 text-right">Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody className="text-xs">
            {users.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={8}
                  className="px-5 py-8 text-center text-muted-foreground"
                >
                  Tidak ada data pengguna.
                </TableCell>
              </TableRow>
            ) : (
              users.map((user, index) => {
                // Determine role badge color
                let typeBadgeColor = "bg-muted text-muted-foreground";
                const roleLower = user.role.toLowerCase();
                if (roleLower === "admin") {
                  typeBadgeColor =
                    "bg-amber-500/10 text-amber-600 dark:text-amber-400";
                } else if (roleLower === "upps") {
                  typeBadgeColor =
                    "bg-blue-500/10 text-blue-600 dark:text-blue-400";
                } else if (roleLower === "lpm") {
                  typeBadgeColor =
                    "bg-purple-500/10 text-purple-600 dark:text-purple-400";
                } else if (roleLower === "assessor") {
                  typeBadgeColor =
                    "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400";
                }

                const displayRole =
                  user.role.charAt(0).toUpperCase() + user.role.slice(1);
                const displayDate = user.created_at.split("T")[0];

                return (
                  <TableRow
                    key={user.id}
                    className="hover:bg-muted/5 transition-colors"
                  >
                    <TableCell className="px-5 py-3.5 text-center font-medium text-muted-foreground">
                      {index + 1}
                    </TableCell>
                    <TableCell className="px-5 py-3.5 text-foreground">
                      <div className="font-bold">
                        {user.name || user.username}
                      </div>
                      <div className="text-[10px] text-muted-foreground font-mono">
                        @{user.username}
                      </div>
                    </TableCell>
                    <TableCell className="px-5 py-3.5">
                      <span
                        className={`inline-flex items-center rounded-full px-2 py-0.5 font-bold uppercase tracking-wide text-[10px] ${typeBadgeColor}`}
                      >
                        {displayRole}
                      </span>
                    </TableCell>
                    <TableCell className="px-5 py-3.5 font-medium text-foreground">
                      {user.institute_id !== null
                        ? lembagaList.find((l) => l.id === user.institute_id)
                            ?.name || `ID: ${user.institute_id}`
                        : "Tidak Ada"}
                    </TableCell>
                    <TableCell className="px-5 py-3.5 text-muted-foreground/85">
                      {displayDate}
                    </TableCell>
                    <TableCell className="px-5 py-3.5">
                      {user.must_change_password ? (
                        <span className="inline-flex items-center rounded-full bg-error/10 text-error border border-error/20 px-2 py-0.5 font-bold text-[10px] uppercase tracking-wide">
                          Belum Diubah
                        </span>
                      ) : (
                        <span className="inline-flex items-center rounded-full bg-success/10 text-success border border-success/20 px-2 py-0.5 font-bold text-[10px] uppercase tracking-wide">
                          Sudah Diubah
                        </span>
                      )}
                    </TableCell>
                    <TableCell className="px-5 py-3.5">
                      <span
                        className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 font-bold text-[10px] uppercase tracking-wide border ${
                          !user.is_banned
                            ? "bg-success/10 text-success border-success/20"
                            : "bg-error/10 text-error border-error/20"
                        }`}
                      >
                        {!user.is_banned ? (
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
                    </TableCell>
                    <TableCell className="px-5 py-3.5 text-right">
                      <div className="flex justify-end gap-1.5">
                        <button
                          onClick={() => onResetPassword(user)}
                          title="Reset Password"
                          className="p-1.5 hover:bg-muted rounded text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
                        >
                          <Key className="h-4 w-4" />
                        </button>
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
                          className="p-1.5 hover:bg-error/10 rounded text-muted-foreground hover:text-error transition-colors cursor-pointer"
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
