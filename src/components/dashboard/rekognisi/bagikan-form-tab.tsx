"use client";

import React, { useState } from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { BagikanFormCard } from "./bagikan-form-card";
import { BagikanFormDialog } from "./bagikan-form-dialog";
import { EditExpiryDialog } from "./edit-expiry-dialog";
import { SubmissionEditDialog } from "./submission-edit-dialog";
import { initialSharingLinks, SharingLink, Submission } from "@/dummy-data/bagikan-form";

export function BagikanFormTab() {
  const [links, setLinks] = useState<SharingLink[]>(initialSharingLinks);

  // Dialog control states
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  
  const [expiryDialogOpen, setExpiryDialogOpen] = useState(false);
  const [selectedExpiryLinkId, setSelectedExpiryLinkId] = useState<string | null>(null);
  
  const [subDialogOpen, setSubDialogOpen] = useState(false);
  const [selectedSubLinkId, setSelectedSubLinkId] = useState<string | null>(null);
  const [selectedSubmission, setSelectedSubmission] = useState<Submission | null>(null);

  // Expose current expiry value for selected link
  const currentExpiryValue = 
    links.find((l) => l.id === selectedExpiryLinkId)?.expiredAt || new Date().toISOString();

  // Aksi Link
  const handleCreateLink = (name: string, expiredAt: string) => {
    const newLink: SharingLink = {
      id: `link-${Date.now()}`,
      name,
      status: "active",
      expiredAt,
      createdAt: new Date().toISOString(),
      submissions: [],
    };
    setLinks([newLink, ...links]);
  };

  const handleToggleStatus = (linkId: string) => {
    setLinks(
      links.map((link) =>
        link.id === linkId
          ? { ...link, status: link.status === "active" ? "closed" : "active" }
          : link
      )
    );
  };

  const handleSaveExpiry = (newExpiry: string) => {
    if (!selectedExpiryLinkId) return;
    setLinks(
      links.map((link) =>
        link.id === selectedExpiryLinkId ? { ...link, expiredAt: newExpiry } : link
      )
    );
  };

  // Aksi Submissions
  const handleAcceptSubmission = (linkId: string, subId: string) => {
    setLinks(
      links.map((link) => {
        if (link.id !== linkId) return link;
        return {
          ...link,
          submissions: link.submissions.map((sub) =>
            sub.id === subId ? { ...sub, status: "approved" as const } : sub
          ),
        };
      })
    );
  };

  const handleDeclineSubmission = (linkId: string, subId: string) => {
    setLinks(
      links.map((link) => {
        if (link.id !== linkId) return link;
        return {
          ...link,
          submissions: link.submissions.map((sub) =>
            sub.id === subId ? { ...sub, status: "declined" as const } : sub
          ),
        };
      })
    );
  };

  const handleOpenEditSubmission = (linkId: string, sub: Submission) => {
    setSelectedSubLinkId(linkId);
    setSelectedSubmission(sub);
    setSubDialogOpen(true);
  };

  const handleSaveSubmission = (updatedSub: Submission) => {
    if (!selectedSubLinkId) return;
    setLinks(
      links.map((link) => {
        if (link.id !== selectedSubLinkId) return link;
        return {
          ...link,
          submissions: link.submissions.map((sub) =>
            sub.id === updatedSub.id ? updatedSub : sub
          ),
        };
      })
    );
  };

  const handleOpenEditExpiry = (linkId: string) => {
    setSelectedExpiryLinkId(linkId);
    setExpiryDialogOpen(true);
  };

  return (
    <div className="space-y-6">
      {/* Top Header Controls */}
      <div className="flex items-center justify-between pb-2 border-b border-border/40">
        <div>
          <h2 className="text-xs font-bold text-foreground uppercase tracking-wider">Daftar Link Pengisian Form</h2>
          <p className="text-xs text-muted-foreground mt-0.5">Kelola link sharing untuk mengumpulkan data rekognisi dari dosen.</p>
        </div>
        <Button
          onClick={() => setAddDialogOpen(true)}
          className="inline-flex items-center gap-1.5 bg-primary text-primary-foreground text-xs font-semibold h-9 px-4 rounded-lg hover:bg-primary/95 shadow-sm transition-colors cursor-pointer"
        >
          <Plus className="h-3.5 w-3.5" /> Tambah Link
        </Button>
      </div>

      {/* Cards Stack */}
      <div className="space-y-6">
        {links.length === 0 ? (
          <div className="rounded-xl border border-dashed border-border bg-card p-10 text-center text-xs text-muted-foreground">
            Belum ada link yang dibuat. Klik tombol "Tambah Link" di atas untuk membuat link pengisian baru.
          </div>
        ) : (
          links.map((link) => (
            <BagikanFormCard
              key={link.id}
              link={link}
              onToggleStatus={handleToggleStatus}
              onEditExpiry={handleOpenEditExpiry}
              onAcceptSubmission={handleAcceptSubmission}
              onDeclineSubmission={handleDeclineSubmission}
              onEditSubmission={handleOpenEditSubmission}
            />
          ))
        )}
      </div>

      {/* Dialog: Tambah Link Baru */}
      <BagikanFormDialog
        open={addDialogOpen}
        onOpenChange={setAddDialogOpen}
        onSave={handleCreateLink}
      />

      {/* Dialog: Edit Masa Berlaku */}
      <EditExpiryDialog
        open={expiryDialogOpen}
        onOpenChange={setExpiryDialogOpen}
        currentExpiry={currentExpiryValue}
        onSave={handleSaveExpiry}
      />

      {/* Dialog: Edit Submission */}
      <SubmissionEditDialog
        open={subDialogOpen}
        onOpenChange={setSubDialogOpen}
        submission={selectedSubmission}
        onSave={handleSaveSubmission}
      />
    </div>
  );
}
