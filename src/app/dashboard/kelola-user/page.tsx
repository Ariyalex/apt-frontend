"use client";

import React, { useState } from "react";
import { UserPlus, Loader2, Search } from "lucide-react";
import { UserTable } from "@/components/dashboard/admin/user-table";
import { UserDialog } from "@/components/dashboard/admin/user-dialog";
import { UserAdminModel } from "@/types/user";
import { useGetInstitutesQuery } from "@/store/services/instituteApi";
import { toast } from "sonner";
import { Skeleton } from "@/components/ui/skeleton";
import {
  useGetUsersQuery,
  useCreateUserMutation,
  useUpdateUserMutation,
  useDeleteUserMutation,
  useResetUserPasswordMutation,
} from "@/store/services/userApi";
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

export default function KelolaUserPage(): React.JSX.Element {
  // RTK Query endpoints
  const { data: usersResponse, isLoading: isUsersLoading } = useGetUsersQuery();
  const { data: institutesResponse } = useGetInstitutesQuery();
  const [createUser, { isLoading: isCreateLoading }] = useCreateUserMutation();
  const [updateUser, { isLoading: isUpdateLoading }] = useUpdateUserMutation();
  const [deleteUser, { isLoading: isDeleteLoading }] = useDeleteUserMutation();
  const [resetUserPassword, { isLoading: isResetLoading }] =
    useResetUserPasswordMutation();

  const [searchKeyword, setSearchKeyword] = useState<string>("");
  const [dialogOpen, setDialogOpen] = useState<boolean>(false);
  const [selectedUser, setSelectedUser] = useState<UserAdminModel | null>(null);
  const [deleteUserId, setDeleteUserId] = useState<string | null>(null);

  // Reset password states
  const [resetDialogOpen, setResetDialogOpen] = useState<boolean>(false);
  const [resetUser, setResetUser] = useState<UserAdminModel | null>(null);

  // Success Added User Alert Dialog
  const [addedUserAlertOpen, setAddedUserAlertOpen] = useState<boolean>(false);
  const [newAddedUser, setNewAddedUser] = useState<UserAdminModel | null>(null);

  const lembagaList = institutesResponse?.data || [];

  const users = usersResponse?.data || [];

  const filteredUsers = users.filter((user) => {
    const query = searchKeyword.toLowerCase().trim();
    if (!query) return true;
    return (
      (user.name && user.name.toLowerCase().includes(query)) ||
      user.username.toLowerCase().includes(query) ||
      (user.email && user.email.toLowerCase().includes(query)) ||
      user.role.toLowerCase().includes(query)
    );
  });

  const handleAddUser = (): void => {
    setSelectedUser(null);
    setDialogOpen(true);
  };

  const handleEditUser = (user: UserAdminModel): void => {
    setSelectedUser(user);
    setDialogOpen(true);
  };

  const handleResetPasswordClick = (user: UserAdminModel): void => {
    setResetUser(user);
    setResetDialogOpen(true);
  };

  const confirmResetPassword = async (): Promise<void> => {
    if (!resetUser) return;
    try {
      const response = await resetUserPassword(resetUser.id).unwrap();
      logActivity("admin", `mereset password user: ${resetUser.username}`);
      toast.success(
        response.message ||
          `Password untuk user "${resetUser.username}" berhasil direset!`,
      );
      setResetDialogOpen(false);
      setResetUser(null);
    } catch (err: unknown) {
      toast.error(extractErrorMessage(err));
    }
  };

  const handleDeleteUser = (userId: string): void => {
    setDeleteUserId(userId);
  };

  const confirmDeleteUser = async (): Promise<void> => {
    if (!deleteUserId) return;
    const targetUser = users.find((u) => u.id === deleteUserId);
    try {
      const response = await deleteUser(deleteUserId).unwrap();
      logActivity(
        "admin",
        `menghapus user: ${targetUser?.username || deleteUserId}`,
      );
      toast.success(
        response.message ||
          `User "${targetUser?.username || deleteUserId}" berhasil dihapus.`,
      );
      setDeleteUserId(null);
    } catch (err: unknown) {
      toast.error(extractErrorMessage(err));
    }
  };

  const handleSaveUser = async (savedUser: UserAdminModel): Promise<void> => {
    try {
      if (savedUser.id) {
        // Edit Mode
        const response = await updateUser({
          id: savedUser.id,
          body: {
            username: savedUser.username,
            email: savedUser.email,
            name: savedUser.name,
            institute_id: savedUser.institute_id,
            role: savedUser.role,
            is_banned: savedUser.is_banned,
          },
        }).unwrap();
        logActivity("admin", `memperbarui data user: ${savedUser.username}`);
        toast.success(
          response.message ||
            `Data user "${savedUser.username}" berhasil diperbarui.`,
        );
        setDialogOpen(false);
      } else {
        // Create Mode
        const response = await createUser({
          username: savedUser.username,
          email: savedUser.email,
          name: savedUser.name,
          institute_id: savedUser.institute_id,
          role: savedUser.role,
        }).unwrap();
        logActivity("admin", `menambah user baru: ${savedUser.username}`);
        setNewAddedUser(response.data);
        setAddedUserAlertOpen(true);
        setDialogOpen(false);
      }
    } catch (err: unknown) {
      toast.error(extractErrorMessage(err));
    }
  };

  const logActivity = (username: string, action: string): void => {
    const storedLogs = localStorage.getItem("adminAktivitas");
    let currentLogs = [];
    if (storedLogs) {
      try {
        currentLogs = JSON.parse(storedLogs);
      } catch {
        // ignore
      }
    }
    const newLog = {
      id: `act-${Date.now()}`,
      username,
      aktivitas: action,
      waktu: `${new Date().toLocaleDateString("id-ID", {
        day: "numeric",
        month: "long",
        year: "numeric",
      })}, ${new Date().toLocaleTimeString("id-ID", {
        hour: "2-digit",
        minute: "2-digit",
      })} WIB`,
      ip: "127.0.0.1",
    };
    const updatedLogs = [newLog, ...currentLogs];
    localStorage.setItem("adminAktivitas", JSON.stringify(updatedLogs));
  };

  if (isUsersLoading) {
    return (
      <div className="space-y-6 animate-fadeIn">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <Skeleton className="h-6 w-48 rounded" />
            <Skeleton className="h-4 w-[28rem] rounded mt-2" />
          </div>
          <Skeleton className="h-10 w-32 rounded-lg" />
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
              <Skeleton className="h-5 w-24 rounded-full" />
              <Skeleton className="h-5 w-32 rounded" />
              <Skeleton className="h-4 w-28 rounded" />
              <Skeleton className="h-5 w-16 rounded" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fadeIn">
      <div>
        <h1 className="text-xl font-bold tracking-tight text-foreground md:text-2xl">
          Kelola User
        </h1>
        <p className="text-xs text-muted-foreground mt-1">
          Atur hak akses pengguna, tambah akun baru, dan audit data akses sistem
          penjaminan mutu.
        </p>
      </div>

      {/* Search Input */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative max-w-sm">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground/60" />
          <input
            type="text"
            placeholder="Cari user (nama, username, email, role)..."
            value={searchKeyword}
            onChange={(e) => setSearchKeyword(e.target.value)}
            className="w-full h-10 rounded-lg border border-border bg-card pl-9 pr-4 py-2 text-xs text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:ring-1 focus:ring-primary"
          />
        </div>
        <button
          onClick={handleAddUser}
          className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-3 py-2 text-xs font-semibold text-primary-foreground hover:bg-primary/95 transition-all shadow-sm cursor-pointer self-start sm:self-auto"
        >
          <UserPlus className="h-4 w-4" />
          <span>Tambah User</span>
        </button>
      </div>

      <UserTable
        users={filteredUsers}
        lembagaList={lembagaList}
        onEdit={handleEditUser}
        onDelete={handleDeleteUser}
        onResetPassword={handleResetPasswordClick}
      />

      <UserDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        user={selectedUser}
        lembagaList={lembagaList}
        onSave={handleSaveUser}
        isLoading={isCreateLoading || isUpdateLoading}
      />

      {/* Reset Password Confirmation Dialog */}
      <AlertDialog
        open={resetDialogOpen}
        onOpenChange={(open) => {
          if (isResetLoading) return;
          setResetDialogOpen(open);
        }}
      >
        <AlertDialogContent className="bg-card border border-border p-6 rounded-xl sm:max-w-md">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-sm font-bold text-foreground uppercase tracking-wider">
              Konfirmasi Reset Password
            </AlertDialogTitle>
            <AlertDialogDescription className="text-xs text-muted-foreground">
              Apakah Anda yakin ingin mereset password pengguna &quot;
              {resetUser?.username}&quot;?
              <span className="block mt-2 font-semibold text-amber-600 dark:text-amber-400">
                Password akan direset oleh server menjadi sama dengan username
                mereka: &quot;{resetUser?.username}&quot;.
              </span>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="flex justify-end gap-2 pt-2">
            <AlertDialogCancel
              onClick={() => {
                setResetDialogOpen(false);
                setResetUser(null);
              }}
              disabled={isResetLoading}
              className="h-10 text-xs font-bold px-4 rounded-lg cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Batal
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={(e) => {
                e.preventDefault();
                confirmResetPassword();
              }}
              disabled={isResetLoading}
              className="bg-primary text-primary-foreground font-semibold text-xs h-10 px-4 rounded-lg hover:bg-primary/95 cursor-pointer flex items-center justify-center gap-1.5 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isResetLoading ? (
                <>
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  <span>Mereset...</span>
                </>
              ) : (
                <span>Reset Password</span>
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Delete User Confirmation Dialog */}
      <AlertDialog
        open={!!deleteUserId}
        onOpenChange={(open) => {
          if (isDeleteLoading) return;
          if (!open) setDeleteUserId(null);
        }}
      >
        <AlertDialogContent className="bg-card border border-border p-6 rounded-xl sm:max-w-md">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-sm font-bold text-foreground uppercase tracking-wider">
              Konfirmasi Hapus
            </AlertDialogTitle>
            <AlertDialogDescription className="text-xs text-muted-foreground">
              Apakah Anda yakin ingin menghapus pengguna ini? Tindakan ini
              bersifat permanen dan tidak dapat dibatalkan.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="flex justify-end gap-2 pt-2">
            <AlertDialogCancel
              disabled={isDeleteLoading}
              className="h-10 text-xs font-bold px-4 rounded-lg cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Batal
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={(e) => {
                e.preventDefault();
                confirmDeleteUser();
              }}
              disabled={isDeleteLoading}
              className="bg-rose-600 text-white hover:bg-rose-700 font-semibold text-xs h-10 px-4 rounded-lg cursor-pointer flex items-center justify-center gap-1.5 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isDeleteLoading ? (
                <>
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  <span>Menghapus...</span>
                </>
              ) : (
                <span>Hapus</span>
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Success Added User Alert Dialog */}
      <AlertDialog
        open={addedUserAlertOpen}
        onOpenChange={setAddedUserAlertOpen}
      >
        <AlertDialogContent className="bg-card border border-border p-6 rounded-xl sm:max-w-md animate-fadeIn">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-sm font-bold text-foreground uppercase tracking-wider flex items-center gap-2">
              User Berhasil Ditambahkan
            </AlertDialogTitle>
            <AlertDialogDescription className="text-xs text-muted-foreground mt-2">
              User baru{" "}
              <span className="font-bold text-foreground">
                &quot;{newAddedUser?.name}&quot;
              </span>{" "}
              (@{newAddedUser?.username}) telah sukses ditambahkan ke sistem.
              <span className="block mt-3.5 font-semibold text-success bg-success/10 border border-success/20 p-3 rounded-lg">
                Password default untuk user ini diatur oleh server sama dengan
                username:{" "}
                <span className="font-mono underline font-bold">
                  {newAddedUser?.username}
                </span>
              </span>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="flex justify-end pt-2">
            <AlertDialogAction
              onClick={() => {
                setAddedUserAlertOpen(false);
                setNewAddedUser(null);
              }}
              className="bg-primary text-primary-foreground font-semibold text-xs h-10 px-4 rounded-lg cursor-pointer"
            >
              Mengerti
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
