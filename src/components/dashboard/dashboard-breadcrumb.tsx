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
import { useGetAccreditationListQuery } from "@/store/services/accreditationApi";

export function DashboardBreadcrumb() {
  const pathname = usePathname();
  const segments = pathname.split("/").filter(Boolean);

  const { data: response, isLoading } = useGetAccreditationListQuery();
  const akredList = React.useMemo(() => response?.data || [], [response]);

  const isMutuBanpt = pathname.startsWith("/dashboard/mutu-banpt");

  const [activeAkredId, setActiveAkredId] = useState<string>("");

  // Sync active accreditation from local storage
  useEffect(() => {
    if (!isMutuBanpt || akredList.length === 0) return;

    const storedId = localStorage.getItem("active_akreditasi_id");
    if (storedId && akredList.some((a) => a.id === storedId)) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setActiveAkredId(storedId);
    } else {
      const defaultId = akredList[0].id;
       
      setActiveAkredId(defaultId);
      localStorage.setItem("active_akreditasi_id", defaultId);
      window.dispatchEvent(new Event("active_akreditasi_change"));
    }
  }, [isMutuBanpt, akredList]);

  // Listen to active_akreditasi_change events from other components
  useEffect(() => {
    const handleActiveChange = () => {
      const storedId = localStorage.getItem("active_akreditasi_id");
      if (storedId) {
        setActiveAkredId(storedId);
      }
    };

    window.addEventListener("active_akreditasi_change", handleActiveChange);
    return () =>
      window.removeEventListener(
        "active_akreditasi_change",
        handleActiveChange,
      );
  }, []);

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
        <div className="flex lg:flex-row flex-col lg:items-center items-end gap-2 animate-fadeIn shrink-0">
          <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
            Akreditasi
          </span>
          <select
            value={activeAkredId}
            onChange={handleSelectChange}
            disabled={isLoading}
            className="bg-card text-foreground border border-border rounded-lg text-xs font-semibold px-3 py-1.5 focus:outline-none focus:ring-1 focus:ring-primary/40 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {akredList.map((a) => (
              <option key={a.id} value={a.id}>
                {a.name}
              </option>
            ))}
          </select>
        </div>
      )}
    </div>
  );
}
