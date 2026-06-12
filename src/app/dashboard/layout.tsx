import React from "react";
import { Sidebar } from "@/components/dashboard/sidebar";
import { Header } from "@/components/dashboard/header";
import { DashboardBreadcrumb } from "@/components/dashboard/dashboard-breadcrumb";

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-screen w-screen flex-col overflow-hidden bg-background">
      {/* Header Atas */}
      <Header />

      {/* Konten Bawah Header */}
      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar Kiri */}
        <Sidebar />

        {/* Area Kanan Sidebar */}
        <div className="flex flex-1 flex-col overflow-hidden">
          {/* Breadcrumb */}
          <DashboardBreadcrumb />

          {/* Konten Utama */}
          <main className="flex-1 overflow-y-auto p-6 bg-muted/10">
            {children}
          </main>
        </div>
      </div>
    </div>
  );
}
