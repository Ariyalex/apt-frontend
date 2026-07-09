"use client";

import React, { useState, useEffect } from "react";
import { Plus, Edit2, Trash2, ShieldCheck } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";

import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  IndicatorModel,
  AssessmentAspect,
  FormulaVariable,
  RadioVariable,
  LocalConstant,
  SaveIndicatorRequest,
  SaveAssessmentRuleRequest,
  RuleVariable,
  AssessmentRule,
} from "@/types/mutu-banpt";
import {
  useGetIndicatorListQuery,
  useCreateIndicatorMutation,
  useUpdateIndicatorMutation,
  useDeleteIndicatorMutation,
} from "@/store/services/indicatorApi";
import {
  useGetAssessmentRuleListQuery,
  useCreateAssessmentRuleMutation,
  useUpdateAssessmentRuleMutation,
  useDeleteAssessmentRuleMutation,
} from "@/store/services/assessmentRuleApi";
import { formatCategoryName, formatStageName } from "@/lib/utils";
import {
  formatFriendlyFormula,
  mapCriteria,
  mapTarget,
} from "./mutu-banpt-helper";
import IndicatorFormDialog from "./dialogs/indicatorFormDialog";

import DeleteConfirmAlert from "../../deleteConfirmAlert";
import AspectRuleFormDialog, {
  AspectFormData,
} from "./dialogs/aspectRuleFormDialog";

export interface AdminIndicatorTab extends IndicatorModel {
  apiId?: string;
}

interface MutuBanptAdminProps {
  criteria: string;
  target: string;
  isLoading?: boolean;
}

export default function MutuBanptAdminPage({
  criteria: category,
  target: stage,
  isLoading,
}: MutuBanptAdminProps): React.JSX.Element {
  const catLabel = formatCategoryName(category);
  const stageLabel = formatStageName(stage);

  const [activeAkredId, setActiveAkredId] = useState<string>("");
  const [indicators, setIndicators] = useState<AdminIndicatorTab[]>([]);
  const [selectedId, setSelectedId] = useState<string>("");
  const [isSaving, setIsSaving] = useState<boolean>(false);

  // Dialogs open state
  const [isIndicatorDialogOpen, setIsIndicatorDialogOpen] =
    useState<boolean>(false);
  const [isAspectDialogOpen, setIsAspectDialogOpen] = useState<boolean>(false);

  // Indicator Form state
  const [editingIndicator, setEditingIndicator] =
    useState<AdminIndicatorTab | null>(null);

  const [indDeleteConfirm, setIndDeleteConfirm] = useState<boolean>(false);

  // Aspect Form state
  const [editingAspect, setEditingAspect] = useState<AssessmentAspect | null>(
    null,
  );
  const [aspectType, setAspectType] = useState<"radio" | "formula">("radio");
  const [aspDeleteConfirm, setAspDeleteConfirm] = useState<string | null>(null);

  // Variable management (within Aspect dialog)

  // Visual Formula Builder state
  const [localConstants, setLocalConstants] = useState<LocalConstant[]>([]);

  // Load local constants from localStorage on mount
  useEffect(() => {
    const raw = localStorage.getItem("mutu_banpt_local_constants");
    if (raw) {
      try {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setLocalConstants(JSON.parse(raw));
      } catch {
        // ignore
      }
    } else {
      const initial: LocalConstant[] = [
        {
          label: "100%",
          expression: "Input_Numerator_100Percent / Denominator_Percentage",
          variables: [
            {
              name: "Input_Numerator_100Percent",
              label: "Konstanta Persen 100%",
              type: "static",
              value: 100,
            },
            {
              name: "Denominator_Percentage",
              label: "Denominator Persen (Default 100)",
              type: "static",
              value: 100,
            },
          ],
        },
      ];
      localStorage.setItem(
        "mutu_banpt_local_constants",
        JSON.stringify(initial),
      );
      setLocalConstants(initial);
    }
  }, []);

  // RTK Query API Hooks
  const { data: indicatorsRes, refetch: refetchIndicators } =
    useGetIndicatorListQuery(
      {
        accreditation_id: activeAkredId,
        criteria: mapCriteria(category),
        target: mapTarget(stage),
      },
      { skip: !activeAkredId || !category || !stage },
    );

  const { data: rulesRes, refetch: refetchRules } =
    useGetAssessmentRuleListQuery(
      { indicator_id: selectedId },
      { skip: !selectedId },
    );

  const [createIndicator] = useCreateIndicatorMutation();
  const [updateIndicator] = useUpdateIndicatorMutation();
  const [deleteIndicator, { isLoading: isDeletingInd }] =
    useDeleteIndicatorMutation();

  const [createRule] = useCreateAssessmentRuleMutation();
  const [updateRule] = useUpdateAssessmentRuleMutation();
  const [deleteRule, { isLoading: isDeletingRule }] =
    useDeleteAssessmentRuleMutation();

  // Sync active accreditation from local storage
  useEffect(() => {
    const storedId = localStorage.getItem("active_akreditasi_id");
    if (storedId) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setActiveAkredId(storedId);
    }

    const handleActiveChange = () => {
      const newId = localStorage.getItem("active_akreditasi_id");
      if (newId) {
        setActiveAkredId(newId);
      }
    };

    window.addEventListener("active_akreditasi_change", handleActiveChange);
    return () =>
      window.removeEventListener(
        "active_akreditasi_change",
        handleActiveChange,
      );
  }, []);

  // Sync default selectedId based on loaded indicatorsRes data
  useEffect(() => {
    if (indicatorsRes?.data && indicatorsRes.data.length > 0) {
      if (!selectedId) {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setSelectedId(indicatorsRes.data[0].id);
      } else {
        const valid = indicatorsRes.data.some((ind) => ind.id === selectedId);
        if (!valid) {
          setSelectedId(indicatorsRes.data[0].id);
        }
      }
    }
  }, [indicatorsRes, selectedId]);

  // Map API responses to state
  useEffect(() => {
    if (indicatorsRes?.data) {
      const apiIndicators = indicatorsRes.data;
      const apiRules = rulesRes?.data || [];

      // Group rules by indicator_id
      const rulesMap: Record<string, AssessmentRule[]> = {};
      apiRules.forEach((rule) => {
        const indId = rule.indicator.id;
        if (!rulesMap[indId]) {
          rulesMap[indId] = [];
        }
        rulesMap[indId].push(rule);
      });

      // Map to IndicatorTab[]
      const mapped: AdminIndicatorTab[] = apiIndicators.map((ind) => {
        const indRules = rulesMap[ind.id] || [];
        const aspects: AssessmentAspect[] = indRules.map((rule) => {
          const formulaVars: FormulaVariable[] = rule.input_rules.map((v) => ({
            name: v.var,
            label: v.var,
            type: (v.type as "input" | "static") || "input",
            value: Number(v.val || 0),
          }));

          const radioVars: RadioVariable[] =
            rule.type === "points"
              ? rule.input_rules.map((v) => ({
                  name: v.var,
                  value: Number(v.val),
                }))
              : [];

          return {
            id: rule.id,
            type:
              rule.type === "maths" ? ("formula" as const) : ("radio" as const),
            description: rule.assessment,
            complianceDescription: rule.fulfillment,
            dataSource: rule.data_source,
            buktiRequired: rule.proof_required,
            expectationResult: Number(rule.expectation_result || 0),
            expectationFormat:
              (rule.result_format as "decimal" | "percentage") || "decimal",
            radioVariables: radioVars,
            formula: rule.formula
              ? {
                  expression: rule.formula,
                  variables: formulaVars,
                  targetVariable: rule.type === "maths" ? "Hasil" : "Skor",
                  threshold: Number(rule.expectation_result || 0),
                }
              : undefined,
          };
        });

        return {
          ...ind,
          id: ind.id,
          apiId: ind.id, // KEEP the actual indicator uuid
          status: "belum" as const,
          aspects,
        };
      });

      // eslint-disable-next-line react-hooks/set-state-in-effect
      setIndicators(mapped);
    }
  }, [indicatorsRes, rulesRes]);

  // Sync state event listener
  useEffect(() => {
    const handleMutuChange = () => {
      refetchIndicators();
      refetchRules();
    };

    window.addEventListener("mutu_banpt_change", handleMutuChange);
    return () =>
      window.removeEventListener("mutu_banpt_change", handleMutuChange);
  }, [refetchIndicators, refetchRules]);

  const activeIndicator = indicators.find((ind) => ind.id === selectedId);

  // INDICATOR ACTIONS
  const openAddIndicator = () => {
    setEditingIndicator(null);

    setIsIndicatorDialogOpen(true);
  };

  const openEditIndicator = () => {
    if (!activeIndicator) return;
    setEditingIndicator(activeIndicator);

    setIsIndicatorDialogOpen(true);
  };

  const handleSaveIndicator = async (formData: {
    no: string;
    justifikasi: string;
    deskripsi: string;
  }) => {
    const parsedNo = parseInt(formData.no);
    if (isNaN(parsedNo)) {
      toast.error("Nomor indikator harus berupa angka!");
      return;
    }
    if (!formData.deskripsi.trim()) {
      toast.error("Deskripsi indikator tidak boleh kosong!");
      return;
    }

    setIsSaving(true);
    try {
      const payload: SaveIndicatorRequest = {
        accreditation_id: activeAkredId,
        number: `Indikator ${parsedNo}`,
        name: formData.deskripsi,
        justification: formData.justifikasi,
        criteria: mapCriteria(category),
        target: mapTarget(stage),
      };

      if (editingIndicator) {
        // Edit mode (we read apiId!)
        const apiId = editingIndicator.apiId;
        if (apiId) {
          await updateIndicator({ id: apiId, body: payload }).unwrap();
          toast.success("Indikator berhasil diperbarui!");
        }
      } else {
        // Add mode
        await createIndicator(payload).unwrap();
        toast.success("Indikator baru berhasil ditambahkan!");
      }

      refetchIndicators();
      setIsIndicatorDialogOpen(false);
    } catch {
      toast.error("Gagal menyimpan indikator.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteIndicator = async () => {
    if (!editingIndicator) return;
    const apiId = editingIndicator.apiId;
    if (!apiId) return;

    setIsSaving(true);
    try {
      await deleteIndicator(apiId).unwrap();
      refetchIndicators();
      setSelectedId("");
      setIndDeleteConfirm(false);
      setIsIndicatorDialogOpen(false);
      toast.success("Indikator berhasil dihapus!");
    } catch {
      toast.error("Gagal menghapus indikator.");
    } finally {
      setIsSaving(false);
    }
  };

  // ASPECT ACTIONS
  const openAddAspect = (type: "radio" | "formula") => {
    setEditingAspect(null);
    setAspectType(type);

    setIsAspectDialogOpen(true);
  };

  const openEditAspect = (asp: AssessmentAspect) => {
    setEditingAspect(asp);
    setAspectType(asp.type);
    setIsAspectDialogOpen(true);
  };

  // Variables list helpers

  const handleSaveAspect = async (formData: AspectFormData) => {
    if (!formData.description.trim() || !formData.dataSource.trim()) {
      toast.error("Deskripsi dan sumber data tidak boleh kosong!");
      return;
    }
    if (!activeIndicator) return;
    const activeIndicatorApiId = activeIndicator.apiId;
    if (!activeIndicatorApiId) return;

    const parsedExpectation =
      aspectType === "formula" ? parseFloat(formData.expectation) : 1;

    // Prepare variables list as RuleVariable[] for the database
    let variablesList: RuleVariable[] = [];
    if (aspectType === "formula") {
      variablesList = formData.formulaVariables.map((v) => ({
        var: v.name,
        type: v.type,
        val: v.value,
      }));
    } else {
      variablesList = [
        {
          type: "input",
          var: "Memenuhi",
          val: 1,
        },
        {
          type: "input",
          var: "Tidak_Memenuhi",
          val: 0,
        },
      ];
    }

    // Merge variables from used local constants in formula tokens
    for (const tok of formData.formulaTokens) {
      const found = localConstants.find((lc) => lc.label === tok);
      if (found) {
        for (const v of found.variables) {
          if (!variablesList.some((vl) => vl.var === v.name)) {
            variablesList.push({
              var: v.name,
              type: v.type,
              val: v.value,
            });
          }
        }
      }
    }

    // Map tokens to actual backend expressions
    const mappedTokens = formData.formulaTokens.map((tok) => {
      const found = localConstants.find((lc) => lc.label === tok);
      return found ? found.expression : tok;
    });
    const finalExpression = mappedTokens.join(" ");

    const payload: SaveAssessmentRuleRequest = {
      indicator_id: activeIndicatorApiId,
      assessment: formData.description,
      fulfillment: formData.compliance,
      data_source: formData.dataSource,
      type: aspectType === "formula" ? "maths" : "points",
      input_rules: variablesList, // Backend typo 'inut_rules' matches SaveAssessmentRuleRequest
      formula:
        aspectType === "formula"
          ? finalExpression
          : "Memenuhi + Tidak_Memenuhi",
      expectation_result: isNaN(parsedExpectation) ? 0 : parsedExpectation,
      result_format: aspectType === "formula" ? formData.format : "decimal",
      proof_required: false,
    };

    setIsSaving(true);
    try {
      if (editingAspect) {
        await updateRule({ id: editingAspect.id, body: payload }).unwrap();
        toast.success("Aspek penilaian diperbarui!");
      } else {
        await createRule(payload).unwrap();
        toast.success("Aspek penilaian baru berhasil dibuat!");
      }

      refetchRules();
      setIsAspectDialogOpen(false);
    } catch {
      toast.error("Gagal menyimpan aspek penilaian.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteAspect = async (aspId: string) => {
    setIsSaving(true);
    try {
      await deleteRule(aspId).unwrap();
      refetchRules();
      setAspDeleteConfirm(null);
      toast.success("Aspek penilaian berhasil dihapus!");
    } catch {
      toast.error("Gagal menghapus aspek penilaian.");
    } finally {
      setIsSaving(false);
    }
  };

  // Math operators catalog

  if (isLoading) {
    return (
      <div className="space-y-6 animate-fadeIn">
        <div className="border-b border-border/40 pb-4">
          <Skeleton className="h-8 w-64 rounded-lg" />
          <Skeleton className="h-4 w-96 rounded-lg mt-2" />
        </div>
        <div className="space-y-6">
          <div className="flex gap-3">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-10 w-24 rounded-lg" />
            ))}
          </div>
          <Skeleton className="h-32 w-full rounded-xl" />
          <Skeleton className="h-64 w-full rounded-xl" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Title Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between border-b border-border/40 pb-4">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-foreground md:text-2xl capitalize">
            Kelola {catLabel} - {stageLabel}
          </h1>
          <p className="text-xs text-muted-foreground mt-1">
            Konfigurasi indikator, justifikasi, aspek penilaian, dan variabel
            rumus untuk LPM.
          </p>
        </div>
        {indicators.length > 0 && (
          <Button
            onClick={openAddIndicator}
            className="bg-primary text-primary-foreground font-semibold text-xs h-9 px-4 rounded-lg hover:bg-primary/95 shadow-sm transition-all cursor-pointer flex items-center gap-1.5 shrink-0"
          >
            <Plus className="h-4 w-4" />
            Tambah Indikator
          </Button>
        )}
      </div>

      {/* Main Content Layout */}
      {indicators.length === 0 ? (
        /* Empty State */
        <div className="bg-card border border-border rounded-xl p-12 text-center flex flex-col items-center justify-center space-y-4 shadow-sm">
          <ShieldCheck className="h-14 w-14 text-muted-foreground/35 animate-pulse" />
          <div className="space-y-1">
            <h3 className="text-sm font-bold text-foreground">
              Kriteria Mutu Masih Kosong
            </h3>
            <p className="text-xs text-muted-foreground max-w-sm">
              Belum ada indikator mutu untuk kategori{" "}
              <strong>{catLabel}</strong> di tahap <strong>{stageLabel}</strong>
              .
            </p>
          </div>
          <Button
            onClick={openAddIndicator}
            className="bg-primary text-primary-foreground font-semibold text-xs h-9 px-5 rounded-lg hover:bg-primary/95 shadow-sm cursor-pointer"
          >
            <Plus className="h-4 w-4 mr-1.5" />
            Tambah Indikator Pertama
          </Button>
        </div>
      ) : (
        /* Regular content editor layout */
        <div className="space-y-6">
          {/* Tabs Menu list */}
          <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-thin max-w-full">
            {indicators.map((ind) => (
              <HoverCard key={ind.id} openDelay={200}>
                <HoverCardTrigger asChild>
                  <button
                    onClick={() => setSelectedId(ind.id)}
                    className={`flex items-center justify-center gap-2 shrink-0 px-5 py-3 rounded-xl border text-xs font-bold cursor-pointer transition-all duration-200 ${
                      selectedId === ind.id
                        ? "bg-primary text-primary-foreground border-primary shadow-sm"
                        : "bg-card text-foreground border-border hover:bg-muted/40"
                    }`}
                  >
                    <span>
                      {ind.number.toLowerCase().includes("indikator")
                        ? ind.number
                        : `Indikator ${ind.number}`}
                    </span>
                  </button>
                </HoverCardTrigger>
                <HoverCardContent className="w-80 p-3 bg-card border border-border rounded-lg shadow-md text-xs leading-relaxed text-foreground z-50">
                  <p className="font-bold text-primary mb-1 uppercase tracking-wider text-[10px]">
                    Keterangan:
                  </p>
                  <p className="text-muted-foreground">{ind.name}</p>
                </HoverCardContent>
              </HoverCard>
            ))}
          </div>

          {/* Justifikasi & Indikator Box */}
          {activeIndicator && (
            <div className="relative p-5 border border-primary/20 bg-primary/5 rounded-xl space-y-3 animate-fadeIn text-xs leading-relaxed">
              <Button
                onClick={openEditIndicator}
                variant="ghost"
                size="icon"
                className="absolute top-4 right-4 h-7 w-7 hover:bg-primary/10 text-primary cursor-pointer"
              >
                <Edit2 className="h-3.5 w-3.5" />
              </Button>

              <div>
                <span className="font-bold text-primary uppercase tracking-wider text-[10px]">
                  Justifikasi :
                </span>
                <p className="text-foreground font-semibold mt-0.5 whitespace-pre-line">
                  {activeIndicator.justification || "-"}
                </p>
              </div>
              <div>
                <span className="font-bold text-primary uppercase tracking-wider text-[10px]">
                  Indikator :
                </span>
                <p className="text-muted-foreground mt-0.5 whitespace-pre-line">
                  {activeIndicator.name}
                </p>
              </div>
            </div>
          )}

          {/* Aspects management block */}
          {activeIndicator && (
            <div className="space-y-6">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between border-b border-border/40 pb-2">
                <div className="flex items-center gap-1.5">
                  <ShieldCheck className="h-4 w-4 text-primary" />
                  <h2 className="text-xs font-bold text-foreground uppercase tracking-wider">
                    Aspek Penilaian ({activeIndicator.number})
                  </h2>
                </div>

                <div className="flex items-center gap-2">
                  <Button
                    onClick={() => openAddAspect("radio")}
                    variant="outline"
                    className="text-xs font-bold h-8 px-3 border-border hover:bg-muted/40 text-foreground cursor-pointer"
                  >
                    <Plus className="h-3.5 w-3.5 mr-1" />
                    Penilaian Biasa
                  </Button>
                  <Button
                    onClick={() => openAddAspect("formula")}
                    variant="outline"
                    className="text-xs font-bold h-8 px-3 border-border hover:bg-muted/40 text-foreground cursor-pointer"
                  >
                    <Plus className="h-3.5 w-3.5 mr-1" />
                    Penilaian Rumus
                  </Button>
                </div>
              </div>

              {/* Render aspects list */}
              {(activeIndicator.aspects || []).length === 0 ? (
                <div className="text-center p-8 border border-dashed border-border rounded-xl text-muted-foreground text-xs">
                  Belum ada aspek penilaian untuk indikator ini. Silakan
                  tambahkan aspek biasa/rumus.
                </div>
              ) : (
                <div className="space-y-6">
                  {(activeIndicator.aspects || []).map((asp) => (
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

                        <Separator
                          orientation="vertical"
                          className="hidden md:block w-[1px]"
                        />
                        <Separator
                          orientation="horizontal"
                          className="md:hidden h-[1px] w-full"
                        />

                        <div className="flex-1 space-y-1">
                          <span className="font-bold text-[10px] text-muted-foreground uppercase tracking-wider block">
                            Aspek Pemenuhan
                          </span>
                          <p className="text-xs text-foreground font-semibold leading-relaxed whitespace-pre-line">
                            {asp.complianceDescription || "-"}
                          </p>
                        </div>
                      </div>

                      {/* Middle row details */}
                      <div className="flex flex-wrap gap-4 text-xs font-semibold text-muted-foreground py-2 border-t border-b border-border/40">
                        <div>
                          Sumber Data:{" "}
                          <span className="text-foreground">
                            {asp.dataSource}
                          </span>
                        </div>
                        <Separator
                          orientation="vertical"
                          className="h-4 w-[1px]"
                        />
                        <div>
                          Harapan:{" "}
                          <span className="text-foreground">
                            {asp.expectationResult || "-"}{" "}
                            {asp.expectationFormat === "percentage" ? "%" : ""}
                          </span>
                        </div>
                        <Separator
                          orientation="vertical"
                          className="h-4 w-[1px]"
                        />
                        <div>
                          Bukti Diperlukan:{" "}
                          <span className="text-foreground">
                            {asp.buktiRequired ? "Ya" : "Tidak"}
                          </span>
                        </div>
                      </div>

                      {/* Bottom actions row */}
                      <div className="flex items-center justify-between pt-1">
                        <div>
                          {asp.type === "formula" || asp.type === "radio" ? (
                            <div className="text-xs">
                              <span className="font-bold text-[9px] text-primary uppercase block">
                                Rumus Perhitungan
                              </span>
                              <div className="bg-card border border-border px-3 py-1.5 rounded-lg font-mono text-foreground font-semibold text-xs mt-1 min-w-[200px]">
                                {formatFriendlyFormula(
                                  asp.formula?.expression || "",
                                  asp.formula?.variables || [],
                                ) || "Rumus Kosong"}
                              </div>
                            </div>
                          ) : null}
                        </div>

                        <div className="flex items-center gap-2">
                          <Button
                            onClick={() => openEditAspect(asp)}
                            className="bg-primary hover:bg-primary/95 text-primary-foreground text-xs font-semibold h-8 px-3 rounded flex items-center gap-1 cursor-pointer"
                          >
                            <Edit2 className="h-3 w-3" />
                            Edit
                          </Button>
                          <Button
                            onClick={() => setAspDeleteConfirm(asp.id)}
                            className="bg-error/15 hover:bg-error/25 text-error text-xs font-semibold h-8 px-3 rounded flex items-center gap-1 cursor-pointer"
                          >
                            <Trash2 className="h-3 w-3" />
                            Hapus
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Dialog Add/Edit Indicator */}
      <IndicatorFormDialog
        isOpen={isIndicatorDialogOpen}
        onClose={() => setIsIndicatorDialogOpen(false)}
        isSaving={isSaving}
        initialData={editingIndicator}
        onSave={handleSaveIndicator}
        onDeleteRequest={() => setIndDeleteConfirm(true)}
      />

      {/* Dialog Add/Edit Aspect (Unified) */}
      <AspectRuleFormDialog
        isOpen={isAspectDialogOpen}
        onClose={() => setIsAspectDialogOpen(false)}
        isSaving={isSaving}
        aspectType={aspectType}
        initialData={editingAspect}
        localConstants={localConstants}
        onSave={handleSaveAspect}
      />

      {/* Delete Aspect Confirmation */}
      <DeleteConfirmAlert
        isOpen={!!aspDeleteConfirm}
        isDeleting={isDeletingRule}
        onClose={() => setAspDeleteConfirm(null)}
        onConfirm={() =>
          aspDeleteConfirm && handleDeleteAspect(aspDeleteConfirm)
        }
        title="Hapus Aspek Penilaian?"
        description="Aksi ini bersifat destruktif dan akan menghapus kriteria evaluasi aspek ini secara permanen."
      />

      {/* Delete Indicator Confirmation */}
      <DeleteConfirmAlert
        isOpen={indDeleteConfirm}
        isDeleting={isDeletingInd}
        onClose={() => setIndDeleteConfirm(false)}
        onConfirm={handleDeleteIndicator}
        title={`Hapus Indikator ${editingIndicator}?`}
        description="Aksi ini bersifat destruktif. Menghapus indikator akan menghilangkan seluruh data justifikasi dan aspek penilaian di bawahnya."
      />
    </div>
  );
}
