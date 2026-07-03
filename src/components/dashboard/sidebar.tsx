"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  ShieldCheck,
  ChevronDown,
  GraduationCap,
  LogOut,
  Users,
  Activity,
  Loader2,
} from "lucide-react";
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
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { clearSession } from "@/store/slices/userSlice";
import { useLogoutMutation } from "@/store/services/authApi";
import { toast } from "sonner";
import {
  Sidebar as ShadcnSidebar,
  SidebarContent as ShadcnSidebarContent,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarMenuSub,
  SidebarMenuSubItem,
  SidebarMenuSubButton,
  SidebarFooter as ShadcnSidebarFooter,
} from "@/components/ui/sidebar";

interface SidebarItemType {
  title: string;
  icon?: React.ComponentType<{ className?: string }>;
  href?: string;
  children?: SidebarItemType[];
}

const menuItems: SidebarItemType[] = [
  {
    title: "Dashboard",
    icon: LayoutDashboard,
    href: "/dashboard",
  },
  {
    title: "Mutu BANPT",
    icon: ShieldCheck,
    href: "/dashboard/mutu-banpt",
    children: [
      {
        title: "Budaya Mutu",
        href: "/dashboard/mutu-banpt/budaya-mutu",
        children: [
          {
            title: "Masukan",
            href: "/dashboard/mutu-banpt/budaya-mutu/masukan",
          },
          { title: "Proses", href: "/dashboard/mutu-banpt/budaya-mutu/proses" },
          { title: "Luaran", href: "/dashboard/mutu-banpt/budaya-mutu/luaran" },
          { title: "Dampak", href: "/dashboard/mutu-banpt/budaya-mutu/dampak" },
        ],
      },
      {
        title: "Relevansi Pendidikan",
        href: "/dashboard/mutu-banpt/relevansi-pendidikan",
        children: [
          {
            title: "Masukan",
            href: "/dashboard/mutu-banpt/relevansi-pendidikan/masukan",
          },
          {
            title: "Proses",
            href: "/dashboard/mutu-banpt/relevansi-pendidikan/proses",
          },
          {
            title: "Luaran",
            href: "/dashboard/mutu-banpt/relevansi-pendidikan/luaran",
          },
          {
            title: "Dampak",
            href: "/dashboard/mutu-banpt/relevansi-pendidikan/dampak",
          },
        ],
      },
      {
        title: "Relevansi Penelitian",
        href: "/dashboard/mutu-banpt/relevansi-penelitian",
        children: [
          {
            title: "Masukan",
            href: "/dashboard/mutu-banpt/relevansi-penelitian/masukan",
          },
          {
            title: "Proses",
            href: "/dashboard/mutu-banpt/relevansi-penelitian/proses",
          },
          {
            title: "Luaran",
            href: "/dashboard/mutu-banpt/relevansi-penelitian/luaran",
          },
          {
            title: "Dampak",
            href: "/dashboard/mutu-banpt/relevansi-penelitian/dampak",
          },
        ],
      },
      {
        title: "Relevansi PKM",
        href: "/dashboard/mutu-banpt/relevansi-pkm",
        children: [
          {
            title: "Masukan",
            href: "/dashboard/mutu-banpt/relevansi-pkm/masukan",
          },
          {
            title: "Proses",
            href: "/dashboard/mutu-banpt/relevansi-pkm/proses",
          },
          {
            title: "Luaran",
            href: "/dashboard/mutu-banpt/relevansi-pkm/luaran",
          },
          {
            title: "Dampak",
            href: "/dashboard/mutu-banpt/relevansi-pkm/dampak",
          },
        ],
      },
      {
        title: "Akuntabilitas",
        href: "/dashboard/mutu-banpt/akuntabilitas",
        children: [
          {
            title: "Masukan",
            href: "/dashboard/mutu-banpt/akuntabilitas/masukan",
          },
          {
            title: "Proses",
            href: "/dashboard/mutu-banpt/akuntabilitas/proses",
          },
          {
            title: "Luaran",
            href: "/dashboard/mutu-banpt/akuntabilitas/luaran",
          },
          {
            title: "Dampak",
            href: "/dashboard/mutu-banpt/akuntabilitas/dampak",
          },
        ],
      },
      {
        title: "Diferensiasi Misi",
        href: "/dashboard/mutu-banpt/diferensiasi-misi",
        children: [
          {
            title: "Masukan",
            href: "/dashboard/mutu-banpt/diferensiasi-misi/masukan",
          },
          {
            title: "Proses",
            href: "/dashboard/mutu-banpt/diferensiasi-misi/proses",
          },
          {
            title: "Luaran",
            href: "/dashboard/mutu-banpt/diferensiasi-misi/luaran",
          },
          {
            title: "Dampak",
            href: "/dashboard/mutu-banpt/diferensiasi-misi/dampak",
          },
        ],
      },
    ],
  },
  {
    title: "Rekognisi Dosen",
    icon: GraduationCap,
    href: "/dashboard/rekognisi-dosen",
    children: [
      { title: "Kelola Rekognisi", href: "/dashboard/kelola-rekognisi" },
      { title: "Isi Data", href: "/dashboard/rekognisi-dosen/isi-data" },
      {
        title: "Kategori Rekognisi",
        href: "/dashboard/kelola-rekognisi/kategori",
      },
    ],
  },
];

const adminMenuItems: SidebarItemType[] = [
  {
    title: "Dashboard",
    icon: LayoutDashboard,
    href: "/dashboard",
  },
  {
    title: "Kelola Pengguna",
    icon: Users,
    children: [
      { title: "User", href: "/dashboard/kelola-user" },
      { title: "Lembaga", href: "/dashboard/kelola-lembaga" },
      { title: "Prodi", href: "/dashboard/kelola-prodi" },
      { title: "Dosen", href: "/dashboard/kelola-dosen" },
    ],
  },
  {
    title: "Aktivitas User",
    icon: Activity,
    href: "/dashboard/aktivitas-user",
  },
  {
    title: "Rekognisi Dosen",
    icon: GraduationCap,
    children: [
      { title: "Kelola Rekognisi", href: "/dashboard/kelola-rekognisi" },
      {
        title: "Kategori Rekognisi",
        href: "/dashboard/kelola-rekognisi/kategori",
      },
    ],
  },
  {
    title: "Mutu BANPT",
    icon: ShieldCheck,
    href: "/dashboard/mutu-banpt",
    children: [
      {
        title: "Kelola Akreditasi",
        href: "/dashboard/mutu-banpt/akreditasi",
      },
      {
        title: "Budaya Mutu",
        href: "/dashboard/mutu-banpt/budaya-mutu",
        children: [
          {
            title: "Masukan",
            href: "/dashboard/mutu-banpt/budaya-mutu/masukan",
          },
          { title: "Proses", href: "/dashboard/mutu-banpt/budaya-mutu/proses" },
          { title: "Luaran", href: "/dashboard/mutu-banpt/budaya-mutu/luaran" },
          { title: "Dampak", href: "/dashboard/mutu-banpt/budaya-mutu/dampak" },
        ],
      },
      {
        title: "Relevansi Pendidikan",
        href: "/dashboard/mutu-banpt/relevansi-pendidikan",
        children: [
          {
            title: "Masukan",
            href: "/dashboard/mutu-banpt/relevansi-pendidikan/masukan",
          },
          {
            title: "Proses",
            href: "/dashboard/mutu-banpt/relevansi-pendidikan/proses",
          },
          {
            title: "Luaran",
            href: "/dashboard/mutu-banpt/relevansi-pendidikan/luaran",
          },
          {
            title: "Dampak",
            href: "/dashboard/mutu-banpt/relevansi-pendidikan/dampak",
          },
        ],
      },
      {
        title: "Relevansi Penelitian",
        href: "/dashboard/mutu-banpt/relevansi-penelitian",
        children: [
          {
            title: "Masukan",
            href: "/dashboard/mutu-banpt/relevansi-penelitian/masukan",
          },
          {
            title: "Proses",
            href: "/dashboard/mutu-banpt/relevansi-penelitian/proses",
          },
          {
            title: "Luaran",
            href: "/dashboard/mutu-banpt/relevansi-penelitian/luaran",
          },
          {
            title: "Dampak",
            href: "/dashboard/mutu-banpt/relevansi-penelitian/dampak",
          },
        ],
      },
      {
        title: "Relevansi PKM",
        href: "/dashboard/mutu-banpt/relevansi-pkm",
        children: [
          {
            title: "Masukan",
            href: "/dashboard/mutu-banpt/relevansi-pkm/masukan",
          },
          {
            title: "Proses",
            href: "/dashboard/mutu-banpt/relevansi-pkm/proses",
          },
          {
            title: "Luaran",
            href: "/dashboard/mutu-banpt/relevansi-pkm/luaran",
          },
          {
            title: "Dampak",
            href: "/dashboard/mutu-banpt/relevansi-pkm/dampak",
          },
        ],
      },
      {
        title: "Akuntabilitas",
        href: "/dashboard/mutu-banpt/akuntabilitas",
        children: [
          {
            title: "Masukan",
            href: "/dashboard/mutu-banpt/akuntabilitas/masukan",
          },
          {
            title: "Proses",
            href: "/dashboard/mutu-banpt/akuntabilitas/proses",
          },
          {
            title: "Luaran",
            href: "/dashboard/mutu-banpt/akuntabilitas/luaran",
          },
          {
            title: "Dampak",
            href: "/dashboard/mutu-banpt/akuntabilitas/dampak",
          },
        ],
      },
      {
        title: "Diferensiasi Misi",
        href: "/dashboard/mutu-banpt/diferensiasi-misi",
        children: [
          {
            title: "Masukan",
            href: "/dashboard/mutu-banpt/diferensiasi-misi/masukan",
          },
          {
            title: "Proses",
            href: "/dashboard/mutu-banpt/diferensiasi-misi/proses",
          },
          {
            title: "Luaran",
            href: "/dashboard/mutu-banpt/diferensiasi-misi/luaran",
          },
          {
            title: "Dampak",
            href: "/dashboard/mutu-banpt/diferensiasi-misi/dampak",
          },
        ],
      },
    ],
  },
];

function RenderMenuItem({
  item,
  isSubmenuItem = false,
}: {
  item: SidebarItemType;
  isSubmenuItem?: boolean;
}): React.JSX.Element {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const hasChildren = item.children && item.children.length > 0;
  const Icon = item.icon;
  const isActive = item.href ? pathname.startsWith(item.href) : false;

  // Auto expand menu if a child is active
  useEffect(() => {
    if (item.children) {
      const childActive = item.children.some((child) => {
        if (child.href && pathname.startsWith(child.href)) return true;
        if (child.children) {
          return child.children.some(
            (c) => c.href && pathname.startsWith(c.href),
          );
        }
        return false;
      });
      if (childActive) {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setIsOpen(true);
      }
    }
  }, [pathname, item.children]);

  if (hasChildren) {
    const buttonContent = item.href ? (
      <SidebarMenuButton isActive={isActive} asChild className="w-full">
        <Link href={item.href} onClick={() => setIsOpen(true)}>
          {Icon && <Icon />}
          <span className="flex-1">{item.title}</span>
          <ChevronDown
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              setIsOpen(!isOpen);
            }}
            className={`h-3 w-3 shrink-0 transition-transform duration-200 text-muted-foreground/75 cursor-pointer hover:text-foreground ${
              isOpen ? "rotate-180" : ""
            }`}
          />
        </Link>
      </SidebarMenuButton>
    ) : (
      <SidebarMenuButton
        isActive={isActive}
        onClick={() => setIsOpen(!isOpen)}
        className="w-full"
      >
        {Icon && <Icon />}
        <span className="flex-1">{item.title}</span>
        <ChevronDown
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            setIsOpen(!isOpen);
          }}
          className={`h-3 w-3 shrink-0 transition-transform duration-200 text-muted-foreground/75 cursor-pointer hover:text-foreground ${
            isOpen ? "rotate-180" : ""
          }`}
        />
      </SidebarMenuButton>
    );

    const content = (
      <>
        {buttonContent}
        {isOpen && (
          <SidebarMenuSub className="ml-3.5 border-l border-border/80 pl-3.5 py-1">
            {item.children?.map((child) => {
              if (child.children && child.children.length > 0) {
                // Return RenderMenuItem content directly, but wrapped in custom sub structure
                // to avoid double nested <li> tag compilation error.
                return (
                  <SidebarMenuSubItem key={child.title}>
                    <RenderMenuItem item={child} isSubmenuItem />
                  </SidebarMenuSubItem>
                );
              }
              return (
                <SidebarMenuSubItem key={child.title}>
                  <SidebarMenuSubButton
                    isActive={pathname === child.href}
                    asChild
                    className="text-sidebar-foreground hover:text-sidebar-accent-foreground font-medium"
                  >
                    <Link href={child.href || "#"}>{child.title}</Link>
                  </SidebarMenuSubButton>
                </SidebarMenuSubItem>
              );
            })}
          </SidebarMenuSub>
        )}
      </>
    );

    if (isSubmenuItem) {
      return content;
    }

    return <SidebarMenuItem>{content}</SidebarMenuItem>;
  }

  const singleItemContent = (
    <SidebarMenuButton isActive={isActive} asChild>
      <Link href={item.href || "#"}>
        {Icon && <Icon className="h-4 w-4 shrink-0" />}
        <span>{item.title}</span>
      </Link>
    </SidebarMenuButton>
  );

  if (isSubmenuItem) {
    return singleItemContent;
  }

  return <SidebarMenuItem>{singleItemContent}</SidebarMenuItem>;
}

export function Sidebar(): React.JSX.Element {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { refreshToken } = useAppSelector((state) => state.user);
  const [logout, { isLoading: isLogoutLoading }] = useLogoutMutation();

  const [isAdmin, setIsAdmin] = useState(false);
  const [userRole, setUserRole] = useState("");
  const [logoutOpen, setLogoutOpen] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      const raw = localStorage.getItem("userSession");
      if (raw) {
        try {
          const session = JSON.parse(raw);
          if (
            session.username === "admin" ||
            session.role === "Administrator"
          ) {
            setIsAdmin(true);
          }
          setUserRole(session.role || "");
        } catch {
          // ignore
        }
      }
    }, 0);
    return () => clearTimeout(timer);
  }, []);

  const confirmLogout = async (): Promise<void> => {
    try {
      const tokenToUse =
        refreshToken ||
        (typeof window !== "undefined"
          ? localStorage.getItem("refreshToken")
          : null) ||
        "";
      await logout({ refresh_token: tokenToUse }).unwrap();
      toast.success("Anda berhasil keluar dari sistem.");
    } catch {
      toast.error("Gagal memproses keluar di server, sesi lokal dibersihkan.");
    } finally {
      dispatch(clearSession());
      router.push("/");
    }
  };

  let activeMenuItems = isAdmin ? adminMenuItems : menuItems;

  if (!isAdmin) {
    const hasMutuAccess = userRole === "Auditor" || userRole === "Assessor";
    const isAssessor = userRole === "Assessor";
    const isAuditor = userRole === "Auditor";

    activeMenuItems = menuItems
      .filter((item) => {
        if (item.title === "Mutu BANPT" && !hasMutuAccess) {
          return false;
        }
        return true;
      })
      .map((item) => {
        // Cut submenus for assessor so they can only see up to category level
        if (item.title === "Mutu BANPT" && isAssessor && item.children) {
          return {
            ...item,
            children: item.children.map((c) => ({
              title: c.title,
              href: c.href, // category href (no further children)
            })),
          };
        }

        // Filter Rekognisi Dosen submenus based on role
        if (item.title === "Rekognisi Dosen" && item.children) {
          if (isAuditor) {
            // Auditor only sees "Kategori Rekognisi"
            return {
              ...item,
              children: item.children.filter(
                (c) => c.title === "Kategori Rekognisi",
              ),
            };
          } else {
            // Default/Auditee/others see all except "Kategori Rekognisi"
            return {
              ...item,
              children: item.children.filter(
                (c) => c.title !== "Kategori Rekognisi",
              ),
            };
          }
        }
        return item;
      });
  }

  return (
    <>
      <ShadcnSidebar
        collapsible="offcanvas"
        className="border-r border-border bg-card"
      >
        {/* Content: Main Menu Group items */}
        <ShadcnSidebarContent className="p-2">
          <SidebarGroup className="p-0">
            <SidebarGroupLabel className="sr-only">
              Navigasi Utama
            </SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {activeMenuItems.map((item) => (
                  <RenderMenuItem key={item.title} item={item} />
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </ShadcnSidebarContent>

        {/* Footer: Logout + app version */}
        <ShadcnSidebarFooter className="border-t border-border p-3 flex flex-col gap-3.5">
          <button
            onClick={() => setLogoutOpen(true)}
            className="flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground hover:bg-muted/50 hover:text-foreground transition-all duration-200 cursor-pointer"
          >
            <LogOut className="h-4 w-4 shrink-0" />
            <span>Keluar</span>
          </button>

          <div className="rounded-lg bg-muted/30 p-2.5 text-center">
            <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">
              Aplikasi Penjamin Mutu
            </p>
          </div>
        </ShadcnSidebarFooter>
      </ShadcnSidebar>

      {/* Logout Confirmation Dialog */}
      <AlertDialog
        open={logoutOpen}
        onOpenChange={(open) => {
          if (isLogoutLoading) return;
          setLogoutOpen(open);
        }}
      >
        <AlertDialogContent className="bg-card border border-border p-6 rounded-xl sm:max-w-md">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-sm font-bold text-foreground uppercase tracking-wider">
              Konfirmasi Keluar
            </AlertDialogTitle>
            <AlertDialogDescription className="text-xs text-muted-foreground">
              Apakah Anda yakin ingin keluar dari sistem? Anda harus memasukkan
              kembali kredensial Anda untuk mengakses dasbor.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="flex justify-end gap-2 pt-2">
            <AlertDialogCancel
              disabled={isLogoutLoading}
              className="h-10 text-xs font-bold px-4 rounded-lg cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Batal
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={async (e) => {
                e.preventDefault();
                await confirmLogout();
              }}
              disabled={isLogoutLoading}
              className="bg-primary text-primary-foreground font-semibold text-xs h-10 px-4 rounded-lg hover:bg-primary/95 cursor-pointer flex items-center justify-center gap-1.5 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLogoutLoading ? (
                <>
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  <span>Keluar...</span>
                </>
              ) : (
                <span>Keluar</span>
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
