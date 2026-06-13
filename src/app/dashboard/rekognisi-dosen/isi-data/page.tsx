"use client";

import React from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { IsiDataManualForm } from "@/components/dashboard/rekognisi/isi-data-manual-form";
import { BagikanFormTab } from "@/components/dashboard/rekognisi/bagikan-form-tab";

export default function IsiDataRekognisiPage() {
  return (
    <div className="w-full space-y-6">
      {/* Header Back Button */}
      <div className="flex items-center gap-3">
        <Link 
          href="/dashboard/rekognisi-dosen" 
          className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-border bg-card text-muted-foreground hover:text-foreground hover:bg-muted transition-all cursor-pointer"
        >
          <ArrowLeft className="h-4 w-4" />
        </Link>
        <div>
          <h1 className="text-xl font-bold tracking-tight text-foreground">Isi Data Rekognisi Dosen</h1>
          <p className="text-xs text-muted-foreground">Pilih metode input untuk menambahkan data rekognisi dosen baru.</p>
        </div>
      </div>

      {/* Tabs Container */}
      <Tabs defaultValue="manual" className="w-full">
        <TabsList className="grid w-full grid-cols-2 bg-muted/40 border border-border rounded-lg p-1 h-11">
          <TabsTrigger value="manual" className="text-xs font-semibold rounded-md py-1.5 cursor-pointer">
            Isi Manual
          </TabsTrigger>
          <TabsTrigger value="bagikan" className="text-xs font-semibold rounded-md py-1.5 cursor-pointer">
            Bagikan Form
          </TabsTrigger>
        </TabsList>

        {/* Tab 1: Isi Manual */}
        <TabsContent value="manual" className="mt-4 focus-visible:outline-none">
          <IsiDataManualForm />
        </TabsContent>

        {/* Tab 2: Bagikan Form */}
        <TabsContent value="bagikan" className="mt-4 focus-visible:outline-none">
          <BagikanFormTab />
        </TabsContent>
      </Tabs>
    </div>
  );
}
