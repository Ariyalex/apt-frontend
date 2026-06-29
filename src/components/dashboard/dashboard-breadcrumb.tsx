"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { getStoredAkreditasi } from "@/dummy-data/mutu-banpt";
import { Akreditasi } from "@/types/mutu-banpt";

export function DashboardBreadcrumb() {
  const pathname = usePathname();
  const segments = pathname.split("/").filter(Boolean);

  const [akredList, setAkredList] = useState<Akreditasi[]>([]);
  const [activeAkredId, setActiveAkredId] = useState<string>("");

  const isMutuBanpt = pathname.startsWith("/dashboard/mutu-banpt");

  // Load accreditations and sync active ID
  useEffect(() => {
    if (isMutuBanpt) {
      const list = getStoredAkreditasi();
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setAkredList(list);

      const storedId = localStorage.getItem("active_akreditasi_id");
      if (storedId && list.some((a) => a.id === storedId)) {
        setActiveAkredId(storedId);
      } else if (list.length > 0) {
        const defaultId = list[0].id;
        setActiveAkredId(defaultId);
        localStorage.setItem("active_akreditasi_id", defaultId);
      }
    }
  }, [isMutuBanpt]);

  // Sync list if changed elsewhere
  useEffect(() => {
    if (!isMutuBanpt) return;

    const handleListChange = () => {
      const list = getStoredAkreditasi();
      setAkredList(list);
    };

    const handleActiveChange = () => {
      const storedId = localStorage.getItem("active_akreditasi_id");
      if (storedId) setActiveAkredId(storedId);
    };

    window.addEventListener("akreditasi_list_change", handleListChange);
    window.addEventListener("active_akreditasi_change", handleActiveChange);

    return () => {
      window.removeEventListener("akreditasi_list_change", handleListChange);
      window.removeEventListener(
        "active_akreditasi_change",
        handleActiveChange,
      );
    };
  }, [isMutuBanpt]);

  const handleSelectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const val = e.target.value;
    setActiveAkredId(val);
    localStorage.setItem("active_akreditasi_id", val);
    window.dispatchEvent(new Event("active_akreditasi_change"));
  };

  if (segments.length === 0) return null;

  return (
    <div className="flex items-center justify-between px-6 py-2.5 border-b border-border bg-card">
      <Breadcrumb className="border-0 p-0 bg-transparent">
        <BreadcrumbList>
          {segments.map((segment, index) => {
            const href = "/" + segments.slice(0, index + 1).join("/");
            const isLast = index === segments.length - 1;

            // Format label: capitalize, replace hyphens with spaces
            const label = segment
              .replace(/-/g, " ")
              .replace(/\b\w/g, (char) => char.toUpperCase());

            return (
              <React.Fragment key={href}>
                <BreadcrumbItem>
                  {isLast ? (
                    <BreadcrumbPage className="font-semibold text-foreground text-xs tracking-wider uppercase">
                      {label}
                    </BreadcrumbPage>
                  ) : (
                    <BreadcrumbLink
                      asChild
                      className="text-xs tracking-wider uppercase font-semibold text-muted-foreground"
                    >
                      <Link href={href}>{label}</Link>
                    </BreadcrumbLink>
                  )}
                </BreadcrumbItem>
                {!isLast && <BreadcrumbSeparator />}
              </React.Fragment>
            );
          })}
        </BreadcrumbList>
      </Breadcrumb>

      {/* Global Accreditation Selector (Mutu BANPT routes only) */}
      {isMutuBanpt && akredList.length > 0 && (
        <div className="flex lg:flex-row flex-col md:items-center items-end gap-2 animate-fadeIn shrink-0">
          <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
            Akreditasi
          </span>
          <select
            value={activeAkredId}
            onChange={handleSelectChange}
            className="bg-card text-foreground border border-border rounded-lg text-xs font-semibold px-3 py-1.5 focus:outline-none focus:ring-1 focus:ring-primary/40 cursor-pointer"
          >
            {akredList.map((a) => (
              <option key={a.id} value={a.id}>
                {a.nama} ({a.tahun})
              </option>
            ))}
          </select>
        </div>
      )}
    </div>
  );
}
