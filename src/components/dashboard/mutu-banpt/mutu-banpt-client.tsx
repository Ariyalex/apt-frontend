"use client";

import React, { useState, useEffect } from "react";
import { Loader2, CheckCircle2, ShieldCheck, FileText, UploadCloud, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card";
import {
  Attachment,
  AttachmentContent,
  AttachmentTitle,
  AttachmentDescription,
  AttachmentMedia,
  AttachmentActions,
  AttachmentAction,
} from "@/components/ui/attachment";
import {
  getMutuBanptData,
  saveMutuBanptData,
  formatCategoryName,
  formatStageName,
} from "@/dummy-data/mutu-banpt";
import { IndicatorTab, AssessmentAspect } from "@/types/mutu-banpt";
import MutuBanptAdminPage from "./mutu-banpt-admin";

interface MutuBanptClientProps {
  category: string;
  stage: string;
}

export default function MutuBanptClientPage({
  category,
  stage,
}: MutuBanptClientProps): React.JSX.Element {
  const catLabel = formatCategoryName(category);
  const stageLabel = formatStageName(stage);

  // Detect admin role
  const [isAdmin, setIsAdmin] = useState<boolean>(false);
  const [userRole, setUserRole] = useState<string>("");

  useEffect(() => {
    const raw = localStorage.getItem("userSession");
    if (raw) {
      try {
        const session = JSON.parse(raw);
        if (session.username === "admin" || session.role === "Administrator") {
          // eslint-disable-next-line react-hooks/set-state-in-effect
          setIsAdmin(true);
        }
        setUserRole(session.role || "");
      } catch {
        // ignore
      }
    }
  }, []);

  // Active accreditation filter state
  const [activeAkredId, setActiveAkredId] = useState<string>("");
  const [indicatorsState, setIndicatorsState] = useState<IndicatorTab[]>([]);
  const [selectedIndicatorId, setSelectedIndicatorId] = useState<number>(1);
  const [savingAspectId, setSavingAspectId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // File upload state per aspect
  const [uploadingAspectId, setUploadingAspectId] = useState<string | null>(null);
  const [dragActiveId, setDragActiveId] = useState<string | null>(null);

  // Edit Mode states
  const [editModes, setEditModes] = useState<Record<string, boolean>>({});
  const [backupAspects, setBackupAspects] = useState<Record<string, AssessmentAspect>>({});

  // Load selected accreditation ID and setup listener
  useEffect(() => {
    const handleActiveChange = () => {
      const storedId = localStorage.getItem("active_akreditasi_id");
      if (storedId) {
        setActiveAkredId(storedId);
        setIsLoading(true);
      }
    };

    const storedId = localStorage.getItem("active_akreditasi_id");
    if (storedId) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setActiveAkredId(storedId);
    }

    window.addEventListener("active_akreditasi_change", handleActiveChange);
    return () => window.removeEventListener("active_akreditasi_change", handleActiveChange);
  }, []);

  // Fetch indicators data based on category, stage and active accreditation
  useEffect(() => {
    if (category && stage && activeAkredId) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setIsLoading(true);
      const timer = setTimeout(() => {
        const initialData = getMutuBanptData(category, stage, activeAkredId);
        
        // Populate isSubmitted based on existing data
        const mappedIndicators = initialData.indicators.map((ind) => ({
          ...ind,
          aspects: ind.aspects.map((asp) => {
            const hasRadioVal = asp.type === "radio" && asp.selectedRadioIndex !== undefined;
            const isSub = asp.isSubmitted ?? (hasRadioVal || !!asp.proofFileName);
            return {
              ...asp,
              isSubmitted: isSub,
            };
          }),
        }));

        setIndicatorsState(mappedIndicators);
        if (mappedIndicators.length > 0) {
          const valid = mappedIndicators.some((ind) => ind.id === selectedIndicatorId);
          setSelectedIndicatorId(valid ? selectedIndicatorId : mappedIndicators[0].id);
        }
        setIsLoading(false);
      }, 500);
      return () => clearTimeout(timer);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [category, stage, activeAkredId]);

  // Synchronise state when modified by admin or other views
  useEffect(() => {
    if (!category || !stage || !activeAkredId) return;

    const handleMutuChange = (e: Event) => {
      const customEvent = e as CustomEvent;
      if (
        customEvent.detail.category === category &&
        customEvent.detail.stage === stage &&
        customEvent.detail.akreditasiId === activeAkredId
      ) {
        const data = getMutuBanptData(category, stage, activeAkredId);
        const mappedIndicators = data.indicators.map((ind) => ({
          ...ind,
          aspects: ind.aspects.map((asp) => {
            const hasRadioVal = asp.type === "radio" && asp.selectedRadioIndex !== undefined;
            const isSub = asp.isSubmitted ?? (hasRadioVal || !!asp.proofFileName);
            return {
              ...asp,
              isSubmitted: isSub,
            };
          }),
        }));
        setIndicatorsState(mappedIndicators);
      }
    };

    window.addEventListener("mutu_banpt_change", handleMutuChange);
    return () => window.removeEventListener("mutu_banpt_change", handleMutuChange);
  }, [category, stage, activeAkredId]);

  if (isAdmin) {
    return <MutuBanptAdminPage category={category} stage={stage} />;
  }

  if (userRole && userRole !== "Auditor" && userRole !== "Assessor") {
    return (
      <div className="p-6">
        <div className="bg-error/10 text-error p-4 rounded-lg font-semibold text-sm">
          Akses Ditolak: Anda tidak memiliki izin untuk mengakses halaman ini.
        </div>
      </div>
    );
  }

  const activeIndicator = indicatorsState.find((ind) => ind.id === selectedIndicatorId);

  // Custom radio choice selection (variables mapping points)
  const handleRadioChoiceSelect = (aspectId: string, choiceIndex: number) => {
    setIndicatorsState((prev) =>
      prev.map((ind) => {
        if (ind.id !== selectedIndicatorId) return ind;

        return {
          ...ind,
          aspects: ind.aspects.map((asp) => {
            if (asp.id !== aspectId || !asp.radioVariables || !asp.formula) return asp;

            const selectedChoice = asp.radioVariables[choiceIndex];
            const score = selectedChoice.value;

            // Map variables: active selected choice gets its points, others get 0
            const updatedVars = asp.formula.variables.map((v) => {
              if (v.name === selectedChoice.name) {
                return { ...v, value: selectedChoice.value };
              }
              return { ...v, value: 0 };
            });

            return {
              ...asp,
              score,
              selectedRadioIndex: choiceIndex,
              formula: {
                ...asp.formula,
                variables: updatedVars,
              },
            };
          }),
        };
      })
    );
  };

  // Variable input change for formula types
  const handleVariableChange = (aspectId: string, varName: string, value: number) => {
    setIndicatorsState((prev) =>
      prev.map((ind) => ({
        ...ind,
        aspects: ind.aspects.map((asp) => {
          if (asp.id !== aspectId || !asp.formula) return asp;
          return {
            ...asp,
            formula: {
              ...asp.formula,
              variables: asp.formula.variables.map((v) =>
                v.name === varName ? { ...v, value } : v
              ),
            },
          };
        }),
      }))
    );
  };

  // Safe formula evaluator
  const calculateFormula = (
    expression: string,
    variables: { name: string; value: number }[]
  ): number => {
    try {
      let evalStr = expression;
      evalStr = evalStr.replace("%", "").replace(" * 100", "");

      variables.forEach((v) => {
        const regex = new RegExp(`\\b${v.name}\\b`, "g");
        evalStr = evalStr.replace(regex, v.value.toString());
      });

      const cleanStr = evalStr.replace(/[^0-9+\-*/().\s]/g, "");
      const computed = new Function(`return (${cleanStr})`)();

      if (expression.includes("* 100") || expression.includes("%")) {
        return parseFloat((computed * 100).toFixed(2));
      }
      return parseFloat(computed.toFixed(2));
    } catch {
      return 0;
    }
  };

  // Document uploader events
  const handleDrag = (e: React.DragEvent, aspectId: string) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActiveId(aspectId);
    } else if (e.type === "dragleave") {
      setDragActiveId(null);
    }
  };

  const handleDrop = (e: React.DragEvent, aspectId: string) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActiveId(null);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processUploadFile(aspectId, e.dataTransfer.files[0]);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>, aspectId: string) => {
    if (e.target.files && e.target.files[0]) {
      processUploadFile(aspectId, e.target.files[0]);
    }
  };

  const processUploadFile = (aspectId: string, file: File) => {
    setUploadingAspectId(aspectId);
    setTimeout(() => {
      setIndicatorsState((prev) =>
        prev.map((ind) => ({
          ...ind,
          aspects: ind.aspects.map((asp) =>
            asp.id === aspectId ? { ...asp, proofFileName: file.name } : asp
          ),
        }))
      );
      setUploadingAspectId(null);
      toast.success("Dokumen bukti berhasil diunggah!");
    }, 900);
  };

  const handleRemoveFile = (aspectId: string) => {
    setIndicatorsState((prev) =>
      prev.map((ind) => ({
        ...ind,
        aspects: ind.aspects.map((asp) =>
          asp.id === aspectId ? { ...asp, proofFileName: undefined } : asp
        ),
      }))
    );
  };

  // Edit mode actions
  const handleStartEdit = (aspect: AssessmentAspect) => {
    setBackupAspects((prev) => ({ ...prev, [aspect.id]: JSON.parse(JSON.stringify(aspect)) }));
    setEditModes((prev) => ({ ...prev, [aspect.id]: true }));
  };

  const handleCancelEdit = (aspectId: string) => {
    const backup = backupAspects[aspectId];
    if (backup) {
      setIndicatorsState((prev) =>
        prev.map((ind) => ({
          ...ind,
          aspects: ind.aspects.map((a) => (a.id === aspectId ? backup : a)),
        }))
      );
    }
    setEditModes((prev) => ({ ...prev, [aspectId]: false }));
  };

  const handleSaveEdit = async (aspectId: string) => {
    setSavingAspectId(aspectId);
    await new Promise((resolve) => setTimeout(resolve, 800));

    const finalIndicators = [...indicatorsState];
    const updatedIndicators = finalIndicators.map((ind) => {
      const hasActiveAspect = ind.aspects.some((asp) => asp.id === aspectId);
      if (!hasActiveAspect) return ind;

      const allCompleted = ind.aspects.every((asp) => {
        const isSub = asp.id === aspectId ? true : asp.isSubmitted;
        if (!isSub) return false;
        if (asp.buktiRequired && !asp.proofFileName) return false;

        let val = 0;
        if (asp.type === "radio") {
          if (asp.selectedRadioIndex === undefined) return false;
          val = asp.score || 0;
        } else if (asp.type === "formula" && asp.formula) {
          val = calculateFormula(asp.formula.expression, asp.formula.variables);
        }
        const expectation = asp.expectationResult ?? 0;
        if (val < expectation) return false;

        return true;
      });

      return {
        ...ind,
        aspects: ind.aspects.map((asp) =>
          asp.id === aspectId ? { ...asp, isSubmitted: true } : asp
        ),
        status: allCompleted ? ("selesai" as const) : ("belum" as const),
      };
    });

    setIndicatorsState(updatedIndicators);
    saveMutuBanptData(category, stage, activeAkredId, {
      category,
      stage,
      indicators: updatedIndicators,
    });

    setEditModes((prev) => ({ ...prev, [aspectId]: false }));
    setSavingAspectId(null);
    toast.success("Perubahan penilaian berhasil disimpan!");
  };

  // Save/Submit assessment action (Initial submission)
  const handleSaveAspect = async (aspectId: string) => {
    setSavingAspectId(aspectId);
    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 800));

    const finalIndicators = [...indicatorsState];
    const updatedIndicators = finalIndicators.map((ind) => {
      const hasActiveAspect = ind.aspects.some((asp) => asp.id === aspectId);
      if (!hasActiveAspect) return ind;

      // Verify if all aspects in the indicator have values filled
      const allCompleted = ind.aspects.every((asp) => {
        const isSub = asp.id === aspectId ? true : asp.isSubmitted;
        if (!isSub) return false;
        if (asp.buktiRequired && !asp.proofFileName) return false;
        
        let val = 0;
        if (asp.type === "radio") {
          if (asp.selectedRadioIndex === undefined) return false;
          val = asp.score || 0;
        } else if (asp.type === "formula" && asp.formula) {
          val = calculateFormula(asp.formula.expression, asp.formula.variables);
        }

        const expectation = asp.expectationResult ?? 0;
        if (val < expectation) return false;

        return true;
      });

      return {
        ...ind,
        aspects: ind.aspects.map((asp) =>
          asp.id === aspectId ? { ...asp, isSubmitted: true } : asp
        ),
        status: allCompleted ? ("selesai" as const) : ("belum" as const),
      };
    });

    setIndicatorsState(updatedIndicators);
    saveMutuBanptData(category, stage, activeAkredId, {
      category,
      stage,
      indicators: updatedIndicators,
    });

    toast.success("Penilaian berhasil dikirim!");
    setSavingAspectId(null);
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Title Header */}
      <div className="border-b border-border/40 pb-4">
        <h1 className="text-xl font-bold tracking-tight text-foreground md:text-2xl capitalize">
          {catLabel} - {stageLabel}
        </h1>
        <p className="text-xs text-muted-foreground mt-1">
          Lakukan audit mutu internal dan penilaian aspek berdasarkan indikator kriteria BAN-PT
        </p>
      </div>

      {isLoading ? (
        <div className="space-y-6">
          <div className="flex gap-3">
            {[1, 2, 3, 4].map((i) => (
              <Skeleton key={i} className="h-12 w-28 rounded-xl" />
            ))}
          </div>
          <Skeleton className="h-28 w-full rounded-xl" />
          <Skeleton className="h-44 w-full rounded-xl" />
        </div>
      ) : indicatorsState.length === 0 ? (
        <div className="bg-card border border-border rounded-xl p-12 text-center flex flex-col items-center justify-center space-y-3">
          <ShieldCheck className="h-12 w-12 text-muted-foreground/35" />
          <h3 className="text-sm font-bold text-foreground">Instrumen Evaluasi Belum Tersedia</h3>
          <p className="text-xs text-muted-foreground max-w-sm">
            Admin belum membuat konfigurasi instrumen mutu BAN-PT untuk kategori <strong>{catLabel}</strong> di tahap ini.
          </p>
        </div>
      ) : (
        <>
          {/* Tabs Menu Section */}
          <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-thin max-w-full">
            {indicatorsState.map((ind) => (
              <HoverCard key={ind.id} openDelay={200}>
                <HoverCardTrigger asChild>
                  <button
                    onClick={() => setSelectedIndicatorId(ind.id)}
                    className={`flex items-center justify-center gap-2 shrink-0 px-5 py-3 rounded-xl border text-xs font-bold cursor-pointer transition-all duration-200 ${
                      selectedIndicatorId === ind.id
                        ? "bg-primary text-primary-foreground border-primary shadow-sm"
                        : "bg-card text-foreground border-border hover:bg-muted/40"
                    }`}
                  >
                    <span>{ind.title}</span>
                    {ind.status === "selesai" && (
                      <CheckCircle2
                        className={`h-4 w-4 ${
                          selectedIndicatorId === ind.id
                            ? "text-primary-foreground"
                            : "text-success"
                        }`}
                      />
                    )}
                  </button>
                </HoverCardTrigger>
                <HoverCardContent className="w-80 p-3 bg-card border border-border rounded-lg shadow-md text-xs leading-relaxed text-foreground z-50">
                  <p className="font-bold text-primary mb-1 uppercase tracking-wider text-[10px]">
                    Deskripsi Indikator:
                  </p>
                  <p className="text-muted-foreground">{ind.indikatorDescription}</p>
                </HoverCardContent>
              </HoverCard>
            ))}
          </div>

          {/* Persistent Information Box */}
          {activeIndicator && (
            <div className="p-5 border border-primary/20 bg-primary/5 rounded-xl space-y-3 animate-fadeIn text-xs leading-relaxed">
              <div>
                <span className="font-bold text-primary uppercase tracking-wider text-[10px]">
                  Justifikasi :
                </span>
                <p className="text-foreground font-semibold mt-0.5 whitespace-pre-line">
                  {activeIndicator.justifikasi}
                </p>
              </div>
              <div>
                <span className="font-bold text-primary uppercase tracking-wider text-[10px]">
                  Indikator :
                </span>
                <p className="text-muted-foreground mt-0.5 whitespace-pre-line">
                  {activeIndicator.indikatorDescription}
                </p>
              </div>
            </div>
          )}

          {/* Aspects Assessments Forms */}
          {activeIndicator && (
            <div className="space-y-6">
              <div className="flex items-center gap-1.5 border-b border-border/40 pb-2">
                <ShieldCheck className="h-4 w-4 text-primary" />
                <h2 className="text-xs font-bold text-foreground uppercase tracking-wider">
                  Aspek Penilaian
                </h2>
              </div>

              {activeIndicator.aspects.length === 0 ? (
                <div className="text-center p-8 border border-dashed border-border rounded-xl text-muted-foreground text-xs">
                  Belum ada kriteria penilaian aspek untuk indikator ini.
                </div>
              ) : (
                <div className="space-y-6">
                  {activeIndicator.aspects.map((asp) => {
                    // Compute formula calculation values
                    let formulaVal = 0;
                    let isFulfilled = false;

                    if (asp.formula) {
                      formulaVal = calculateFormula(asp.formula.expression, asp.formula.variables);
                      isFulfilled = formulaVal >= (asp.expectationResult ?? asp.formula.threshold);
                    }

                    // Check if submit is allowed: score/choices filled & proof attached if required
                    const isChoiceFilled = asp.type === "radio" 
                      ? asp.selectedRadioIndex !== undefined 
                      : true;
                    
                    const isProofFilled = asp.buktiRequired 
                      ? !!asp.proofFileName 
                      : true;

                    const isReadOnly = asp.isSubmitted && !editModes[asp.id];

                    return (
                      <div
                        key={asp.id}
                        className="rounded-xl border border-border bg-card p-5 space-y-4 shadow-sm animate-fadeIn"
                      >
                        {/* Top Row: Penilaian & Pemenuhan */}
                        <div className="flex flex-col md:flex-row gap-5 items-stretch">
                          <div className="flex-1 space-y-1">
                            <span className="font-bold text-[10px] text-muted-foreground uppercase tracking-wider block">
                              Aspek Penilaian
                            </span>
                            <p className="text-xs font-semibold text-foreground leading-relaxed whitespace-pre-line">
                              {asp.description}
                            </p>
                          </div>

                          <Separator orientation="vertical" className="hidden md:block w-[1px]" />
                          <Separator orientation="horizontal" className="md:hidden h-[1px] w-full" />

                          <div className="flex-1 space-y-1">
                            <span className="font-bold text-[10px] text-muted-foreground uppercase tracking-wider block">
                              Aspek Pemenuhan
                            </span>
                            <p className="text-xs text-foreground font-semibold leading-relaxed whitespace-pre-line">
                              {asp.complianceDescription}
                            </p>
                          </div>
                        </div>

                        {/* Data Source Row */}
                        <div className="py-2 px-3 bg-muted/20 border-l-2 border-primary rounded text-xs font-semibold text-muted-foreground">
                          Sumber Data: <span className="text-foreground">{asp.dataSource}</span>
                        </div>

                        {/* Form Bottom Area */}
                        <div className="pt-2 border-t border-border/40">
                          {asp.type === "radio" ? (
                            /* Form Type 1: Dynamic Radio Buttons Choices */
                            <div className="flex flex-col lg:flex-row gap-5 items-stretch w-full">
                              <div className="space-y-1.5 flex-1 min-w-0">
                                <span className="font-bold text-[10px] text-muted-foreground uppercase tracking-wider block">
                                  Pilih Penilaian Skor
                                </span>
                                <div className="flex flex-wrap gap-2.5">
                                  {asp.radioVariables?.map((v, idx) => (
                                    <label
                                      key={v.name}
                                      className={`flex items-center justify-center px-4 py-2 h-9 rounded-lg border text-xs font-semibold cursor-pointer transition-all ${
                                        asp.selectedRadioIndex === idx
                                          ? "bg-primary text-primary-foreground border-primary shadow-sm"
                                          : "bg-card border-border hover:bg-muted/50 text-foreground"
                                      } ${
                                        isReadOnly ? "opacity-75 cursor-not-allowed" : ""
                                      }`}
                                    >
                                      <input
                                        type="radio"
                                        name={`choice-${asp.id}`}
                                        value={idx}
                                        checked={asp.selectedRadioIndex === idx}
                                        disabled={isReadOnly || savingAspectId === asp.id}
                                        onChange={() => handleRadioChoiceSelect(asp.id, idx)}
                                        className="sr-only"
                                      />
                                      {v.name.replace(/_/g, " ")} ({v.value})
                                    </label>
                                  ))}
                                  {(!asp.radioVariables || asp.radioVariables.length === 0) && (
                                    <span className="text-muted-foreground italic">
                                      Tidak ada pilihan.
                                    </span>
                                  )}
                                </div>
                              </div>

                              {/* Upload Bukti Zone (File drag-drop) */}
                              {asp.buktiRequired && (
                                <div className="space-y-1.5 flex-1 min-w-0">
                                  <span className="font-bold text-[10px] text-muted-foreground uppercase tracking-wider block">
                                    Upload Bukti Dokumen (Wajib)
                                  </span>
                                  {asp.proofFileName ? (
                                    <Attachment state="done" className="w-full border-border">
                                      <AttachmentMedia variant="icon" className="bg-primary/5 text-primary">
                                        <FileText className="h-5 w-5" />
                                      </AttachmentMedia>
                                      <AttachmentContent>
                                        <AttachmentTitle className="text-foreground font-semibold truncate">
                                          {asp.proofFileName}
                                        </AttachmentTitle>
                                        <AttachmentDescription className="text-muted-foreground">
                                          Selesai diunggah
                                        </AttachmentDescription>
                                      </AttachmentContent>
                                      <AttachmentActions>
                                        {!isReadOnly && (
                                          <AttachmentAction
                                            variant="ghost"
                                            size="icon-xs"
                                            onClick={() => handleRemoveFile(asp.id)}
                                            disabled={savingAspectId === asp.id}
                                            className="text-error hover:bg-error/10 hover:text-error"
                                          >
                                            <Trash2 className="h-4 w-4" />
                                          </AttachmentAction>
                                        )}
                                      </AttachmentActions>
                                    </Attachment>
                                  ) : (
                                    <div
                                      onDragEnter={(e) => !isReadOnly && handleDrag(e, asp.id)}
                                      onDragOver={(e) => !isReadOnly && handleDrag(e, asp.id)}
                                      onDragLeave={(e) => !isReadOnly && handleDrag(e, asp.id)}
                                      onDrop={(e) => !isReadOnly && handleDrop(e, asp.id)}
                                      className={`border border-dashed rounded-lg p-3.5 text-center transition-all ${
                                        dragActiveId === asp.id && !isReadOnly
                                          ? "border-primary bg-primary/5"
                                          : "border-border hover:border-primary/40"
                                      } ${isReadOnly ? "opacity-60 cursor-not-allowed" : ""}`}
                                    >
                                      <input
                                        type="file"
                                        id={`file-upload-${asp.id}`}
                                        disabled={isReadOnly || uploadingAspectId === asp.id || savingAspectId === asp.id}
                                        onChange={(e) => handleFileSelect(e, asp.id)}
                                        className="hidden"
                                      />
                                      {uploadingAspectId === asp.id ? (
                                        <div className="flex items-center justify-center gap-1.5 py-1">
                                          <Loader2 className="h-4 w-4 text-primary animate-spin" />
                                          <span className="font-semibold text-muted-foreground">Uploading...</span>
                                        </div>
                                      ) : (
                                        <label
                                          htmlFor={`file-upload-${asp.id}`}
                                          className={`flex items-center justify-center gap-2 py-1 ${
                                            isReadOnly ? "cursor-not-allowed" : "cursor-pointer"
                                          }`}
                                        >
                                          <UploadCloud className="h-5 w-5 text-muted-foreground" />
                                          <span className="font-bold text-foreground">Upload file bukti</span>
                                        </label>
                                      )}
                                    </div>
                                  )}
                                </div>
                              )}

                              {/* Calculations Output & Submit */}
                              <div className="flex flex-col gap-3 justify-between items-end text-right p-4 rounded-lg border border-border bg-muted/15 min-w-[210px] shrink-0">
                                <div className="text-right space-y-2 w-full">
                                  <div>
                                    <span className="font-bold text-[9px] text-muted-foreground uppercase tracking-wider block">
                                      Status Pemenuhan
                                    </span>
                                    <span
                                      className={`inline-flex items-center rounded-full px-2 py-0.5 text-[9px] font-bold mt-0.5 uppercase ${
                                        isFulfilled
                                          ? "bg-success/20 text-success"
                                          : "bg-error/20 text-error"
                                      }`}
                                    >
                                      {isFulfilled ? "Terpenuhi" : "Tidak Terpenuhi"}
                                    </span>
                                  </div>
                                  <div>
                                    <span className="font-bold text-[9px] text-muted-foreground uppercase tracking-wider block">
                                      Hasil Perhitungan
                                    </span>
                                    <span className="text-xs font-bold text-foreground block mt-0.5">
                                      {formulaVal} {asp.expectationFormat === "percentage" ? "%" : ""} (Harapan: {asp.expectationResult} {asp.expectationFormat === "percentage" ? "%" : ""})
                                    </span>
                                  </div>
                                </div>

                                {asp.isSubmitted ? (
                                  editModes[asp.id] ? (
                                    <div className="flex gap-2 w-full">
                                      <Button
                                        variant="outline"
                                        onClick={() => handleCancelEdit(asp.id)}
                                        disabled={savingAspectId === asp.id}
                                        className="flex-1 border-border font-bold text-xs h-9 px-3 rounded-lg cursor-pointer"
                                      >
                                        Batal
                                      </Button>
                                      <Button
                                        onClick={() => handleSaveEdit(asp.id)}
                                        disabled={savingAspectId === asp.id || !isProofFilled}
                                        className="flex-1 bg-primary text-primary-foreground font-bold text-xs h-9 px-3 rounded-lg hover:bg-primary/95 shadow-sm transition-all cursor-pointer disabled:opacity-50"
                                      >
                                        {savingAspectId === asp.id ? (
                                          <Loader2 className="h-3.5 w-3.5 animate-spin" />
                                        ) : (
                                          "Simpan"
                                        )}
                                      </Button>
                                    </div>
                                  ) : (
                                    <Button
                                      onClick={() => handleStartEdit(asp)}
                                      disabled={savingAspectId === asp.id}
                                      className="w-full bg-secondary text-secondary-foreground border border-border font-bold text-xs h-9 px-4 rounded-lg hover:bg-secondary/80 shadow-sm transition-all cursor-pointer"
                                    >
                                      Edit Penilaian
                                    </Button>
                                  )
                                ) : (
                                  <Button
                                    onClick={() => handleSaveAspect(asp.id)}
                                    disabled={savingAspectId === asp.id || !isChoiceFilled || !isProofFilled}
                                    className="w-full bg-primary text-primary-foreground font-bold text-xs h-9 px-4 rounded-lg hover:bg-primary/95 shadow-sm transition-all cursor-pointer disabled:opacity-50"
                                  >
                                    {savingAspectId === asp.id ? (
                                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                                    ) : (
                                      "Kirim Penilaian"
                                    )}
                                  </Button>
                                )}
                              </div>
                            </div>
                          ) : (
                            /* Form Type 2: Formula Calculations */
                            <div className="flex flex-col lg:flex-row gap-5 items-stretch w-full">
                              {/* Formula Preview & Inputs */}
                              <div className="space-y-3 flex-1 min-w-0">
                                <div className="p-2.5 bg-muted/40 border border-border rounded-lg text-xs">
                                  <span className="font-bold text-[10px] text-primary uppercase block mb-1">
                                    Rumus Evaluasi
                                  </span>
                                  <code className="font-mono text-foreground font-semibold">
                                    {asp.formula?.expression}
                                  </code>
                                </div>

                                <div className="space-y-2 w-full">
                                  <span className="font-bold text-[10px] text-muted-foreground uppercase tracking-wider block">
                                    Input Variabel
                                  </span>
                                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 w-full">
                                    {asp.formula?.variables.map((v) => (
                                      <div
                                        key={v.name}
                                        className="flex items-center justify-between gap-3 text-xs bg-card border border-border p-2 rounded-lg"
                                      >
                                        <span
                                          className="font-semibold text-muted-foreground pr-2"
                                          title={v.label}
                                        >
                                          {v.label} ({v.name}):
                                        </span>
                                        <Input
                                          type="number"
                                          value={v.value}
                                          disabled={isReadOnly || savingAspectId === asp.id}
                                          onChange={(e) =>
                                            handleVariableChange(
                                              asp.id,
                                              v.name,
                                              parseFloat(e.target.value) || 0
                                            )
                                          }
                                          className="w-24 bg-card border border-border rounded px-2.5 py-1 text-xs focus:outline-none focus:border-primary text-foreground text-right shrink-0 disabled:opacity-75 disabled:cursor-not-allowed"
                                        />
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              </div>

                              {/* Upload Bukti Zone (File drag-drop) */}
                              {asp.buktiRequired && (
                                <div className="space-y-1.5 flex-1 min-w-0">
                                  <span className="font-bold text-[10px] text-muted-foreground uppercase tracking-wider block">
                                    Upload Bukti Dokumen (Wajib)
                                  </span>
                                  {asp.proofFileName ? (
                                    <Attachment state="done" className="w-full border-border">
                                      <AttachmentMedia variant="icon" className="bg-primary/5 text-primary">
                                        <FileText className="h-5 w-5" />
                                      </AttachmentMedia>
                                      <AttachmentContent>
                                        <AttachmentTitle className="text-foreground font-semibold truncate">
                                          {asp.proofFileName}
                                        </AttachmentTitle>
                                        <AttachmentDescription className="text-muted-foreground">
                                          Selesai diunggah
                                        </AttachmentDescription>
                                      </AttachmentContent>
                                      <AttachmentActions>
                                        {!isReadOnly && (
                                          <AttachmentAction
                                            variant="ghost"
                                            size="icon-xs"
                                            onClick={() => handleRemoveFile(asp.id)}
                                            disabled={savingAspectId === asp.id}
                                            className="text-error hover:bg-error/10 hover:text-error"
                                          >
                                            <Trash2 className="h-4 w-4" />
                                          </AttachmentAction>
                                        )}
                                      </AttachmentActions>
                                    </Attachment>
                                  ) : (
                                    <div
                                      onDragEnter={(e) => !isReadOnly && handleDrag(e, asp.id)}
                                      onDragOver={(e) => !isReadOnly && handleDrag(e, asp.id)}
                                      onDragLeave={(e) => !isReadOnly && handleDrag(e, asp.id)}
                                      onDrop={(e) => !isReadOnly && handleDrop(e, asp.id)}
                                      className={`border border-dashed rounded-lg p-3.5 text-center transition-all ${
                                        dragActiveId === asp.id && !isReadOnly
                                          ? "border-primary bg-primary/5"
                                          : "border-border hover:border-primary/40"
                                      } ${isReadOnly ? "opacity-60 cursor-not-allowed" : ""}`}
                                    >
                                      <input
                                        type="file"
                                        id={`file-upload-${asp.id}`}
                                        disabled={isReadOnly || uploadingAspectId === asp.id || savingAspectId === asp.id}
                                        onChange={(e) => handleFileSelect(e, asp.id)}
                                        className="hidden"
                                      />
                                      {uploadingAspectId === asp.id ? (
                                        <div className="flex items-center justify-center gap-1.5 py-1">
                                          <Loader2 className="h-4 w-4 text-primary animate-spin" />
                                          <span className="font-semibold text-muted-foreground">Uploading...</span>
                                        </div>
                                      ) : (
                                        <label
                                          htmlFor={`file-upload-${asp.id}`}
                                          className={`flex items-center justify-center gap-2 py-1 ${
                                            isReadOnly ? "cursor-not-allowed" : "cursor-pointer"
                                          }`}
                                        >
                                          <UploadCloud className="h-5 w-5 text-muted-foreground" />
                                          <span className="font-bold text-foreground">Upload file bukti</span>
                                        </label>
                                      )}
                                    </div>
                                  )}
                                </div>
                              )}

                              {/* Calculation Results Card */}
                              <div className="flex flex-col gap-3 justify-between items-end text-right p-4 rounded-lg border border-border bg-muted/15 min-w-[210px] shrink-0">
                                <div className="text-right space-y-2 w-full">
                                  <div>
                                    <span className="font-bold text-[9px] text-muted-foreground uppercase tracking-wider block">
                                      Status Pemenuhan
                                    </span>
                                    <span
                                      className={`inline-flex items-center rounded-full px-2 py-0.5 text-[9px] font-bold mt-0.5 uppercase ${
                                        isFulfilled
                                          ? "bg-success/20 text-success"
                                          : "bg-error/20 text-error"
                                      }`}
                                    >
                                      {isFulfilled ? "Terpenuhi" : "Tidak Terpenuhi"}
                                    </span>
                                  </div>
                                  <div>
                                    <span className="font-bold text-[9px] text-muted-foreground uppercase tracking-wider block">
                                      Hasil Perhitungan
                                    </span>
                                    <span className="text-xs font-bold text-foreground block mt-0.5">
                                      {formulaVal} {asp.expectationFormat === "percentage" ? "%" : ""} (Harapan: {asp.expectationResult} {asp.expectationFormat === "percentage" ? "%" : ""})
                                    </span>
                                  </div>
                                </div>

                                {asp.isSubmitted ? (
                                  editModes[asp.id] ? (
                                    <div className="flex gap-2 w-full">
                                      <Button
                                        variant="outline"
                                        onClick={() => handleCancelEdit(asp.id)}
                                        disabled={savingAspectId === asp.id}
                                        className="flex-1 border-border font-bold text-xs h-9 px-3 rounded-lg cursor-pointer"
                                      >
                                        Batal
                                      </Button>
                                      <Button
                                        onClick={() => handleSaveEdit(asp.id)}
                                        disabled={savingAspectId === asp.id || !isProofFilled}
                                        className="flex-1 bg-primary text-primary-foreground font-bold text-xs h-9 px-3 rounded-lg hover:bg-primary/95 shadow-sm transition-all cursor-pointer disabled:opacity-50"
                                      >
                                        {savingAspectId === asp.id ? (
                                          <Loader2 className="h-3.5 w-3.5 animate-spin" />
                                        ) : (
                                          "Simpan"
                                        )}
                                      </Button>
                                    </div>
                                  ) : (
                                    <Button
                                      onClick={() => handleStartEdit(asp)}
                                      disabled={savingAspectId === asp.id}
                                      className="w-full bg-secondary text-secondary-foreground border border-border font-bold text-xs h-9 px-4 rounded-lg hover:bg-secondary/80 shadow-sm transition-all cursor-pointer"
                                    >
                                      Edit Penilaian
                                    </Button>
                                  )
                                ) : (
                                  <Button
                                    onClick={() => handleSaveAspect(asp.id)}
                                    disabled={savingAspectId === asp.id || !isProofFilled}
                                    className="w-full bg-primary text-primary-foreground font-bold text-xs h-9 px-4 rounded-lg hover:bg-primary/95 shadow-sm transition-all cursor-pointer disabled:opacity-50"
                                  >
                                    {savingAspectId === asp.id ? (
                                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                                    ) : (
                                      "Kirim Penilaian"
                                    )}
                                  </Button>
                                )}
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
}
