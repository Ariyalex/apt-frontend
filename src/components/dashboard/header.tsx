"use client";

import React, { useEffect, useState, useMemo } from "react";
import Image from "next/image";
import logoUin from "../../../public/logo_uin.png";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useGetInstitutesQuery } from "@/store/services/instituteApi";

interface UserSession {
  name: string;
  role: string;
  username: string;
  initials: string;
  avatarUrl?: string;
  institute_id?: string | null;
}

export function Header(): React.JSX.Element {
  const [session, setSession] = useState<UserSession | null>(null);
  const { data: institutesResponse } = useGetInstitutesQuery();

  useEffect(() => {
    const timer = setTimeout(() => {
      const raw = localStorage.getItem("userSession");
      if (raw) {
        try {
          setSession(JSON.parse(raw));
        } catch {
          // ignore
        }
      }
    }, 0);
    return () => clearTimeout(timer);
  }, []);

  const displayName = session?.name || "Ahmad Fauzi";
  const displayRole = session?.role || "UPPS";
  const displayInstitute = useMemo(() => {
    if (!session) return "FST";
    if (!session.institute_id) return "";
    const matched = institutesResponse?.data?.find(
      (l) => l.id.toString() === session.institute_id?.toString(),
    );
    return matched ? matched.name : `ID: ${session.institute_id}`;
  }, [session, institutesResponse]);

  const initials =
    displayName
      .split(" ")
      .filter(Boolean)
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2) || "AF";

  return (
    <header className="flex h-16 w-full shrink-0 items-center justify-between border-b border-border bg-card px-6 sticky top-0 z-50">
      {/* Kiri: Logo */}
      <div className="flex items-center gap-2.5">
        <Image
          src={logoUin}
          alt="Logo UIN"
          className="object-contain h-11 w-auto"
        />
      </div>

      {/* Kanan: Aplikasi Penjamin Mutu + Profile */}
      <div className="flex items-center gap-6">
        <span className="hidden text-sm font-semibold text-muted-foreground md:inline-block">
          Aplikasi Penjamin Mutu
        </span>

        {/* Separator */}
        <div className="hidden h-6 w-px bg-border md:block"></div>

        {/* User Profile */}
        <div className="flex items-center gap-3">
          <div className="flex flex-col text-right">
            <span className="text-xs font-semibold text-foreground leading-tight">
              {displayName}
            </span>
            <span className="text-xs font-medium text-muted-foreground">
              {displayRole}
              {displayInstitute ? ` (${displayInstitute})` : ""}
            </span>
          </div>
          <Avatar className="h-9 w-9 border border-border shadow-sm">
            <AvatarFallback className="bg-primary/10 text-primary text-xs font-bold">
              {initials}
            </AvatarFallback>
          </Avatar>
        </div>
      </div>
    </header>
  );
}
