"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";
import logoUin from "../../../public/logo_uin.png";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface UserSession {
  name: string;
  role: string;
  username: string;
  initials: string;
  avatarUrl?: string;
}

export function Header() {
  const [session, setSession] = useState<UserSession | null>(null);

  useEffect(() => {
    const raw = localStorage.getItem("userSession");
    if (raw) {
      try {
        setSession(JSON.parse(raw));
      } catch (e) {
        // ignore
      }
    }
  }, []);

  const displayName = session?.name || "Ahmad Fauzi";
  const displayRole = session?.role || "Fakultas";
  const displayInitials = session?.initials || "AF";
  const displayAvatar = session?.avatarUrl || "";

  return (
    <header className="flex h-16 w-full items-center justify-between border-b border-border bg-card px-6 z-20">
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
            </span>
          </div>
          <Avatar className="h-9 w-9 border border-border shadow-sm">
            {displayAvatar ? (
              <AvatarImage
                src={displayAvatar}
                alt={displayName}
              />
            ) : null}
            <AvatarFallback className="bg-primary/10 text-primary text-xs font-bold">
              {displayInitials}
            </AvatarFallback>
          </Avatar>
        </div>
      </div>
    </header>
  );
}
