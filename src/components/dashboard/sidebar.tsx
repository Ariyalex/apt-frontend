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
  Building2,
  Activity,
  Settings,
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
    children: [
      {
        title: "Budaya Mutu",
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
    ],
  },
  {
    title: "Rekognisi Dosen",
    icon: GraduationCap,
    href: "/dashboard/rekognisi-dosen",
    children: [
      { title: "Isi Data", href: "/dashboard/rekognisi-dosen/isi-data" },
    ],
  },
  {
    title: "Setting",
    icon: Settings,
    children: [
      { title: "Dosen", href: "/dashboard/kelola-dosen" },
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
    title: "Kelola User",
    icon: Users,
    href: "/dashboard/kelola-user",
  },
  {
    title: "Kelola Lembaga",
    icon: Building2,
    href: "/dashboard/kelola-lembaga",
  },
  {
    title: "Aktivitas User",
    icon: Activity,
    href: "/dashboard/aktivitas-user",
  },
  {
    title: "Kelola Dosen",
    icon: GraduationCap,
    href: "/dashboard/kelola-dosen",
  },
];

function SidebarItem({
  item,
  depth = 0,
}: {
  item: SidebarItemType;
  depth?: number;
}) {
  const pathname = usePathname();
  // Default open for the first level parent items if they match or if it's Mutu BANPT
  const [isOpen, setIsOpen] = useState(
    depth === 0 &&
      (item.title === "Mutu BANPT" || item.title === "Rekognisi Dosen"),
  );

  const hasChildren = item.children && item.children.length > 0;
  const Icon = item.icon;
  const isActive = pathname === item.href;

  const toggle = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsOpen(!isOpen);
  };

  const isLevel0 = depth === 0;
  const isLevel1 = depth === 1;

  // Styling based on nesting depth
  const textStyle = isLevel0
    ? "text-xs font-semibold uppercase tracking-wider text-foreground/95"
    : isLevel1
      ? "text-xs font-medium text-muted-foreground hover:text-foreground"
      : "text-xs font-normal text-muted-foreground/80 hover:text-foreground";

  const paddingStyle = isLevel0
    ? "px-3 py-2"
    : isLevel1
      ? "px-3 py-1.5 hover:bg-muted/30"
      : "px-3 py-1 hover:bg-muted/10";

  return (
    <div className="flex flex-col space-y-0.5">
      {hasChildren ? (
        item.href ? (
          /* Parent with href AND children: Clicking the main area navigates, clicking the chevron toggles expansion */
          <div
            className={`flex w-full items-center justify-between rounded-lg transition-all duration-200 hover:bg-muted/50 ${paddingStyle} ${textStyle} ${isActive ? "bg-primary/10 text-primary font-semibold" : ""}`}
          >
            <Link
              href={item.href}
              className="flex flex-1 items-center gap-2.5"
              onClick={() => setIsOpen(true)}
            >
              {Icon && (
                <Icon
                  className={`h-4 w-4 shrink-0 ${isActive ? "text-primary" : "text-muted-foreground"}`}
                />
              )}
              <span>{item.title}</span>
            </Link>
            <button
              onClick={toggle}
              className="p-2 hover:bg-muted-foreground/10 rounded-md transition-colors cursor-pointer"
            >
              <ChevronDown
                className={`h-4 w-4 shrink-0 transition-transform duration-200 text-muted-foreground/70 ${
                  isOpen ? "rotate-180" : ""
                }`}
              />
            </button>
          </div>
        ) : (
          /* Parent with children but NO href: Clicking anywhere toggles expansion */
          <button
            onClick={toggle}
            className={`flex w-full items-center justify-between rounded-lg transition-all duration-200 hover:bg-muted/50 cursor-pointer ${paddingStyle} ${textStyle}`}
          >
            <div className="flex items-center gap-2.5">
              {Icon && (
                <Icon className="h-4 w-4 shrink-0 text-muted-foreground" />
              )}
              <span>{item.title}</span>
            </div>
            <ChevronDown
              className={`h-3.5 w-3.5 shrink-0 transition-transform duration-200 text-muted-foreground/70 ${
                isOpen ? "rotate-180" : ""
              }`}
            />
          </button>
        )
      ) : (
        /* Regular Link with no children */
        <Link
          href={item.href || "#"}
          className={`flex items-center gap-2.5 rounded-lg transition-all duration-200 hover:bg-muted/50 ${paddingStyle} ${textStyle} ${
            isActive ? "bg-primary/10 text-primary font-semibold" : ""
          }`}
        >
          {Icon && (
            <Icon
              className={`h-4 w-4 shrink-0 ${isActive ? "text-primary" : "text-muted-foreground"}`}
            />
          )}
          <span>{item.title}</span>
        </Link>
      )}

      {hasChildren && isOpen && (
        <div className="relative ml-4.5 border-l border-border/80 pl-3 py-1 flex flex-col space-y-1">
          {item.children?.map((child) => (
            <SidebarItem key={child.title} item={child} depth={depth + 1} />
          ))}
        </div>
      )}
    </div>
  );
}

export function Sidebar() {
  const router = useRouter();
  const [isAdmin, setIsAdmin] = useState(false);
  const [userRole, setUserRole] = useState("");
  const [logoutOpen, setLogoutOpen] = useState(false);

  useEffect(() => {
    const raw = localStorage.getItem("userSession");
    if (raw) {
      try {
        const session = JSON.parse(raw);
        if (session.username === "admin" || session.role === "Administrator") {
          setIsAdmin(true);
        }
        setUserRole(session.role || "");
      } catch (e) {
        // ignore
      }
    }
  }, []);

  const confirmLogout = () => {
    localStorage.removeItem("userSession");
    router.push("/");
  };

  let activeMenuItems = isAdmin ? adminMenuItems : menuItems;

  if (!isAdmin) {
    activeMenuItems = menuItems.map(item => {
      if (item.title === "Rekognisi Dosen" && (userRole === "Auditor" || userRole === "Assessor")) {
        return {
          title: item.title,
          icon: item.icon,
          href: item.href,
        };
      }
      return item;
    });

    if (userRole === "Auditor" || userRole === "Assessor") {
      activeMenuItems = activeMenuItems.filter(item => item.title !== "Setting");
    }
  }

  return (
    <>
      <aside className="flex h-full w-64 shrink-0 flex-col border-r border-border bg-card">
        {/* Navigation Links */}
        <nav className="flex-1 overflow-y-auto p-4 space-y-2 scrollbar-thin">
          {activeMenuItems.map((item) => (
            <SidebarItem key={item.title} item={item} />
          ))}
        </nav>

        {/* Footer / Info Singkat */}
        <div className="border-t border-border p-4 flex flex-col gap-3">
          <button
            onClick={() => setLogoutOpen(true)}
            className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground hover:bg-muted/50 hover:text-foreground transition-all duration-200 cursor-pointer"
          >
            <LogOut className="h-4 w-4 shrink-0" />
            <span>Keluar</span>
          </button>

          <div className="rounded-lg bg-muted/30 p-3 text-center">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Aplikasi Penjamin Mutu
            </p>
            <p className="mt-1 text-xs text-muted-foreground/60">v1.0.0-beta</p>
          </div>
        </div>
      </aside>

      {/* Logout Confirmation Dialog */}
      <AlertDialog open={logoutOpen} onOpenChange={setLogoutOpen}>
        <AlertDialogContent className="bg-card border border-border p-6 rounded-xl sm:max-w-md">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-sm font-bold text-foreground uppercase tracking-wider">
              Konfirmasi Keluar
            </AlertDialogTitle>
            <AlertDialogDescription className="text-xs text-muted-foreground">
              Apakah Anda yakin ingin keluar dari sistem? Anda harus memasukkan kembali kredensial Anda untuk mengakses dasbor.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="flex justify-end gap-2 pt-2">
            <AlertDialogCancel className="h-10 text-xs font-bold px-4 rounded-lg cursor-pointer">
              Batal
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmLogout}
              className="bg-primary text-primary-foreground font-semibold text-xs h-10 px-4 rounded-lg hover:bg-primary/95 cursor-pointer"
            >
              Keluar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
