import React from "react";
import Image from "next/image";
import logoUin from "../../../public/logo_uin.png";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export function Header() {
  return (
    <header className="flex h-16 w-full items-center justify-between border-b border-border bg-card px-6">
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
              Ahmad Fauzi
            </span>
            <span className="text-[10px] font-medium text-muted-foreground">
              Fakultas
            </span>
          </div>
          <Avatar className="h-9 w-9 border border-border shadow-sm">
            <AvatarImage
              src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=256&auto=format&fit=crop"
              alt="Ahmad Fauzi"
            />
            <AvatarFallback className="bg-primary/10 text-primary text-xs font-bold">
              AF
            </AvatarFallback>
          </Avatar>
        </div>
      </div>
    </header>
  );
}
