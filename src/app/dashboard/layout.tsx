import React from "react";
import { Sidebar } from "@/components/dashboard/sidebar";
import { Header } from "@/components/dashboard/header";
import { DashboardBreadcrumb } from "@/components/dashboard/dashboard-breadcrumb";
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className="h-screen flex flex-col overflow-hidden bg-background">
      {/* Header — sticky full-width bar, z-50 stays above everything */}
      <Header />

      {/*
        transform: translateZ(0) creates a new containing block for
        position:fixed children, confining the shadcn fixed sidebar
        below the header instead of the top of the viewport.
        min-h-0 prevents this flex-1 div from expanding beyond its
        allocated height when children have min-h-svh.
      */}
      <div
        className="flex-1 min-h-0"
        style={{ transform: "translateZ(0)", overflow: "clip" }}
      >
        <SidebarProvider
          defaultOpen={true}
          style={{
            "--sidebar-width": "18rem",
            "--sidebar-width-mobile": "18rem",
            // Override min-h-svh from SidebarProvider base class so it
            // fills exactly the transform wrapper height, not the viewport.
            minHeight: 0,
            height: "100%",
          } as React.CSSProperties}
        >
          <Sidebar />

          {/*
            overflow:hidden + minHeight:0 + height:100% override SidebarInset's
            built-in min-h-svh, creating a bounded flex column so that the
            inner <main> can scroll independently.
          */}
          <SidebarInset
            className="flex flex-col bg-background"
            style={{ overflow: "hidden", minHeight: 0, height: "100%" }}
          >
            <DashboardBreadcrumb />

            <main className="flex-1 overflow-y-auto p-6 bg-muted/10">
              {children}
            </main>
          </SidebarInset>
        </SidebarProvider>
      </div>
    </div>
  );
}
