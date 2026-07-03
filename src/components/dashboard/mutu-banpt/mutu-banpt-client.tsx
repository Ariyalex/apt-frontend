"use client";

import React, { useState, useEffect } from "react";
import {
  Loader2,
  CheckCircle2,
  ShieldCheck,
  Trash2,
  ExternalLink,
  Edit2,
  Plus,
} from "lucide-react";
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

import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { formatCategoryName, formatStageName } from "@/lib/utils";
import {
  IndicatorModel,
  AssessmentAspect,
  FormulaVariable,
  RadioVariable,
  AssessmentRule,
  AssessmentEvaluation,
  RuleVariable,
  SaveAssessmentEvaluationRequest,
} from "@/types/mutu-banpt";
import MutuBanptAdminPage from "./mutu-banpt-admin";
import { useGetIndicatorListQuery } from "@/store/services/indicatorApi";
import { useGetAssessmentRuleListQuery } from "@/store/services/assessmentRuleApi";
import {
  useGetAssessmentEvaluationListQuery,
  useCreateAssessmentEvaluationMutation,
  useUpdateAssessmentEvaluationMutation,
} from "@/store/services/assessmentEvaluationApi";

import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Field, FieldLabel } from "@/components/ui/field";

const mapCriteria = (criteria: string): string => {
  switch (criteria) {
    case "budaya-mutu":
      return "quality_culture";
    case "relevansi-pendidikan":
      return "education_relevance";
    case "relevansi-penelitian":
      return "research_relevance";
    case "relevansi-pkm":
      return "community_service_relevance";
    case "akuntabilitas":
      return "accountability";
    case "diferensiasi-misi":
      return "mission_differentiation";
    default:
      return criteria;
  }
};

const mapTarget = (target: string): string => {
  switch (target) {
    case "masukan":
      return "input";
    case "proses":
      return "process";
    case "luaran":
      return "output";
    case "dampak":
      return "impact";
    default:
      return target;
  }
};

const formatFriendlyFormula = (
  expression: string,
  variables: FormulaVariable[],
): string => {
  if (!expression) return "";
  let formatted = expression;

  // 1. Convert "Input_Numerator_[suffix] / Denominator_Percentage" -> "[value]%"
  const percentageNumerators = variables.filter(
    (v) =>
      v.name.startsWith("Input_Numerator_") &&
      variables.some((d) => d.name === "Denominator_Percentage"),
  );
  percentageNumerators.forEach((num) => {
    const targetExpr = `${num.name} / Denominator_Percentage`;
    if (formatted.includes(targetExpr)) {
      formatted = formatted.replaceAll(targetExpr, `${num.value}%`);
    }
  });

  // 2. Convert "Input_Numerator_[suffix] / Input_Denomerator_[suffix]" -> "[num_val]/[denom_val]"
  const fractionNumerators = variables.filter((v) =>
    v.name.startsWith("Input_Numerator_"),
  );
  fractionNumerators.forEach((num) => {
    const suffix = num.name.replace("Input_Numerator_", "");
    const denomName = `Input_Denomerator_${suffix}`;
    const denom = variables.find((v) => v.name === denomName);
    if (denom) {
      const targetExpr = `${num.name} / ${denomName}`;
      if (formatted.includes(targetExpr)) {
        formatted = formatted.replaceAll(
          targetExpr,
          `${num.value}/${denom.value}`,
        );
      }
    }
  });

  // 3. Convert "Input_Constant_[suffix]" -> "[value]"
  const constants = variables.filter((v) =>
    v.name.startsWith("Input_Constant_"),
  );
  constants.forEach((c) => {
    formatted = formatted.replaceAll(c.name, String(c.value));
  });

  return formatted;
};

interface MutuBanptClientProps {
  criteria: string;
  target: string;
}

export default function MutuBanptClientPage({
  criteria,
  target,
}: MutuBanptClientProps): React.JSX.Element {
  const catLabel = formatCategoryName(criteria);
  const stageLabel = formatStageName(target);

  // Active accreditation filter state
  const [activeAkredId, setActiveAkredId] = useState<string>("");
  const [currentUserId, setCurrentUserId] = useState<string>("");
  const [indicatorsState, setIndicatorsState] = useState<IndicatorModel[]>([]);
  const [selectedIndicatorId, setSelectedIndicatorId] = useState<string>("");
  const [savingAspectId, setSavingAspectId] = useState<string | null>(null);

  // link management states
  const [addLinkOpen, setAddLinkOpen] = useState(false);
  const [editLinkOpen, setEditLinkOpen] = useState(false);
  const [activeAspectIdForLink, setActiveAspectIdForLink] = useState<
    string | null
  >(null);
  const [newLinkUrl, setNewLinkUrl] = useState("");
  const [editingUrl, setEditingUrl] = useState("");
  const [editingIndex, setEditingIndex] = useState<number | null>(null);

  // RTK Query API Hooks
  const {
    data: indicatorsRes,
    isFetching: isIndicatorsFetching,
    refetch: refetchIndicators,
  } = useGetIndicatorListQuery(
    {
      accreditation_id: activeAkredId,
      criteria: mapCriteria(criteria),
      target: mapTarget(target),
    },
    { skip: !activeAkredId || !criteria || !target },
  );

  const {
    data: rulesRes,
    isFetching: isRulesFetching,
    refetch: refetchRules,
  } = useGetAssessmentRuleListQuery(
    { indicator_id: selectedIndicatorId, limit: 999999999999 },
    { skip: !selectedIndicatorId },
  );

  const {
    data: evalsRes,
    isFetching: isEvalsFetching,
    refetch: refetchEvals,
  } = useGetAssessmentEvaluationListQuery(
    {
      accreditation_id: activeAkredId,
      user_id: currentUserId,
      limit: 999999999999,
    },
    { skip: !activeAkredId || !currentUserId },
  );

  const [createEvaluation, { isLoading: isCreatingEval }] =
    useCreateAssessmentEvaluationMutation();
  const [updateEvaluation, { isLoading: isUpdatingEval }] =
    useUpdateAssessmentEvaluationMutation();

  // const handleViewProof = (proofUrl: string) => {
  //   if (!proofUrl) return;
  //   const promise = getFile(proofUrl)
  //     .unwrap()
  //     .then((objectUrl) => {
  //       window.open(objectUrl, "_blank");
  //       return objectUrl;
  //     });

  //   toast.promise(promise, {
  //     loading: "Mengunduh file bukti...",
  //     success: "File berhasil dimuat!",
  //     error: (err: unknown) => {
  //       const errorObj = err as { message?: string };
  //       return errorObj.message || "Gagal memuat file bukti";
  //     },
  //   });
  // };

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
        if (session.id) {
          setCurrentUserId(session.id);
        }
      } catch {
        // ignore
      }
    }
  }, []);

  const isQuerySkipped = !activeAkredId || !currentUserId;
  const isLoading =
    isQuerySkipped ||
    isIndicatorsFetching ||
    isRulesFetching ||
    isEvalsFetching;

  // Edit Mode states
  const [editModes, setEditModes] = useState<Record<string, boolean>>({});
  const [backupAspects, setBackupAspects] = useState<
    Record<string, AssessmentAspect>
  >({});

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

  // Sync default selectedIndicatorId based on loaded indicatorsRes data
  useEffect(() => {
    if (indicatorsRes?.data && indicatorsRes.data.length > 0) {
      if (!selectedIndicatorId) {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setSelectedIndicatorId(indicatorsRes.data[0].id);
      } else {
        const valid = indicatorsRes.data.some(
          (ind) => ind.id === selectedIndicatorId,
        );
        if (!valid) {
          setSelectedIndicatorId(indicatorsRes.data[0].id);
        }
      }
    }
  }, [indicatorsRes, selectedIndicatorId]);

  // Map API response models to UI Component states (IndicatorTab / AssessmentAspect)
  useEffect(() => {
    if (indicatorsRes?.data) {
      const apiIndicators = indicatorsRes.data;
      const apiRules = rulesRes?.data || [];
      const apiEvals = evalsRes?.data || [];

      // Group rules by indicator_id
      const rulesMap: Record<string, AssessmentRule[]> = {};
      apiRules.forEach((rule) => {
        const indId = rule.indicator.id;
        if (!rulesMap[indId]) {
          rulesMap[indId] = [];
        }
        rulesMap[indId].push(rule);
      });

      // Group evaluations by rule_id (ONLY for the current user!)
      const evalsMap: Record<string, AssessmentEvaluation> = {};
      apiEvals.forEach((ev) => {
        if (ev.user?.id === currentUserId) {
          evalsMap[ev.calculation_rule.id] = ev;
        }
      });

      // Map to IndicatorModel[]
      const mapped: IndicatorModel[] = apiIndicators.map((ind) => {
        const indRules = rulesMap[ind.id] || [];
        const aspects: AssessmentAspect[] = indRules.map((rule) => {
          const evalItem = evalsMap[rule.id];

          // Parse formula variables
          const formulaVars: FormulaVariable[] = rule.input_rules.map((v) => {
            const evalVar = evalItem?.input_variables.find(
              (ev) => ev.var === v.var,
            );
            return {
              name: v.var,
              label: v.var,
              type: (v.type as "input" | "static") || "input",
              value: evalVar ? Number(evalVar.val) : Number(v.val || 0),
            };
          });

          // If type is points (radio), prepare radioVariables
          const radioVars: RadioVariable[] =
            rule.type === "points"
              ? rule.input_rules.map((v) => ({
                  name: v.var,
                  value: Number(v.val),
                }))
              : [];

          // Determine selected radio index if evaluated
          let selectedRadioIdx = -1;
          if (rule.type === "points" && evalItem && evalItem.input_variables) {
            const filledVar = evalItem.input_variables.find(
              (v) => Number(v.val) > 0,
            );
            if (filledVar) {
              selectedRadioIdx = radioVars.findIndex(
                (r) => r.name === filledVar.var,
              );
            }
          }

          let linksArray: string[] = [];
          if (evalItem?.proof) {
            // Mengatasi jika response API dari backend adalah array asli, atau fallback string
            if (Array.isArray(evalItem.proof)) {
              linksArray = evalItem.proof;
            } else if (typeof evalItem.proof === "string") {
              linksArray = (evalItem.proof as string)
                .split(",")
                .filter(Boolean);
            }
          }

          return {
            id: rule.id, // API rule ID
            type:
              rule.type === "maths" ? ("formula" as const) : ("radio" as const),
            description: rule.assessment,
            complianceDescription: rule.fulfillment,
            dataSource: rule.data_source,
            proofLinks: linksArray,
            buktiRequired: rule.proof_required,
            expectationResult: Number(rule.expectation_result || 0),
            expectationFormat:
              (rule.result_format as "decimal" | "percentage") || "decimal",
            score: evalItem ? Number(evalItem.calculated_result) : undefined,
            selectedRadioIndex:
              selectedRadioIdx >= 0 ? selectedRadioIdx : undefined,
            radioVariables: radioVars,
            formula: rule.formula
              ? {
                  expression: rule.formula,
                  variables: formulaVars,
                  targetVariable: rule.type === "maths" ? "Hasil" : "Skor",
                  threshold: Number(rule.expectation_result || 0),
                }
              : undefined,
            isSubmitted: !!evalItem,
          };
        });

        const allCompleted =
          aspects.length > 0 &&
          aspects.every((asp) => {
            if (!asp.isSubmitted) return false;
            if (asp.buktiRequired && !asp.proofLinks) return false;
            return true;
          });

        return {
          ...ind,
          id: ind.id,
          status: allCompleted ? ("selesai" as const) : ("belum" as const),
          aspects,
        };
      });

      // eslint-disable-next-line react-hooks/set-state-in-effect
      setIndicatorsState(mapped);
    }
  }, [indicatorsRes, rulesRes, evalsRes, currentUserId]);

  const handleOpenAddLink = (aspectId: string) => {
    setActiveAspectIdForLink(aspectId);
    setNewLinkUrl("");
    setAddLinkOpen(true);
  };

  const handleSaveAddLink = () => {
    if (!newLinkUrl.trim() || !activeAspectIdForLink) return;
    setIndicatorsState((prev) =>
      prev.map((ind) => ({
        ...ind,
        aspects: ind.aspects?.map((asp) =>
          asp.id == activeAspectIdForLink
            ? {
                ...asp,
                proofLinks: [...(asp.proofLinks || []), newLinkUrl.trim()],
              }
            : asp,
        ),
      })),
    );
    setAddLinkOpen(false);
  };

  const handleOpenEditLink = (
    aspectId: string,
    index: number,
    currentUrl: string,
  ) => {
    setActiveAspectIdForLink(aspectId);
    setEditingIndex(index);
    setEditingUrl(currentUrl);
    setEditLinkOpen(true);
  };

  const handleSaveEditLink = () => {
    if (!editingUrl.trim() || !activeAspectIdForLink || editingIndex === null)
      return;
    setIndicatorsState((prev) =>
      prev.map((ind) => ({
        ...ind,
        aspects: ind.aspects?.map((asp) => {
          if (asp.id !== activeAspectIdForLink) return asp;
          const newLinks = [...(asp.proofLinks || [])];
          newLinks[editingIndex] = editingUrl.trim();
          return { ...asp, proofLinks: newLinks };
        }),
      })),
    );
    setEditLinkOpen(false);
  };

  const handleDeleteLink = (aspectId: string, index: number) => {
    setIndicatorsState((prev) =>
      prev.map((ind) => ({
        ...ind,
        aspects: ind.aspects?.map((asp) => {
          if (asp.id !== aspectId) return asp;
          const newLinks = [...(asp.proofLinks || [])];
          newLinks.splice(index, 1);
          return { ...asp, proofLinks: newLinks };
        }),
      })),
    );
  };

  // Sync state event listener
  useEffect(() => {
    const handleMutuChange = () => {
      refetchIndicators();
      refetchRules();
      refetchEvals();
    };

    window.addEventListener("mutu_banpt_change", handleMutuChange);
    return () =>
      window.removeEventListener("mutu_banpt_change", handleMutuChange);
  }, [refetchIndicators, refetchRules, refetchEvals]);

  if (isAdmin) {
    return (
      <MutuBanptAdminPage
        criteria={criteria}
        target={target}
        isLoading={isLoading}
      />
    );
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

  const activeIndicator = indicatorsState.find(
    (ind) => ind.id === selectedIndicatorId,
  );

  // Custom radio choice selection (variables mapping points)
  const handleRadioChoiceSelect = (aspectId: string, choiceIndex: number) => {
    setIndicatorsState((prev) =>
      prev.map((ind) => {
        if (ind.id !== selectedIndicatorId) return ind;

        return {
          ...ind,
          aspects: (ind.aspects || []).map((asp) => {
            if (asp.id !== aspectId || !asp.radioVariables) return asp;

            const selectedChoice = asp.radioVariables[choiceIndex];
            const score = selectedChoice.value;

            // Map formula variables if formula exists
            let updatedFormula = undefined;
            if (asp.formula) {
              const updatedVars = asp.formula.variables.map((v) => {
                if (v.name === selectedChoice.name) {
                  return { ...v, value: selectedChoice.value };
                }
                return { ...v, value: 0 };
              });
              updatedFormula = {
                ...asp.formula,
                variables: updatedVars,
              };
            }

            return {
              ...asp,
              score,
              selectedRadioIndex: choiceIndex,
              formula: updatedFormula || asp.formula,
            };
          }),
        };
      }),
    );
  };

  // Variable input change for formula types
  const handleVariableChange = (
    aspectId: string,
    varName: string,
    value: number,
  ) => {
    setIndicatorsState((prev) =>
      prev.map((ind) => ({
        ...ind,
        aspects: (ind.aspects || []).map((asp) => {
          if (asp.id !== aspectId || !asp.formula) return asp;
          return {
            ...asp,
            formula: {
              ...asp.formula,
              variables: asp.formula.variables.map((v) =>
                v.name === varName ? { ...v, value } : v,
              ),
            },
          };
        }),
      })),
    );
  };

  // Safe formula evaluator
  const calculateFormula = (
    expression: string,
    variables: { name: string; value: number }[],
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

  const handleSaveEvaluation = async (aspectId: string) => {
    setSavingAspectId(aspectId);
    try {
      const aspect = (activeIndicator?.aspects || []).find(
        (asp) => asp.id === aspectId,
      );
      if (!aspect) return;

      if (
        aspect.buktiRequired &&
        (!aspect.proofLinks || aspect.proofLinks.length === 0)
      ) {
        toast.error("Minimal satu link bukti dokumen wajib ditambahkan!");
        setSavingAspectId(null);
        return;
      }

      // Prepare variables format for API: RuleVariable[]
      let inputVars: RuleVariable[] = [];

      if (aspect.type === "radio") {
        if (aspect.selectedRadioIndex === undefined) {
          toast.error("Pilihan penilaian harus dipilih!");
          setSavingAspectId(null);
          return;
        }
        const selected = aspect.radioVariables?.[aspect.selectedRadioIndex];
        if (!selected) return;

        // In points evaluation, the selected option has value, others are 0
        inputVars = (aspect.radioVariables || []).map((rv) => ({
          var: rv.name,
          type: "input",
          val: rv.name === selected.name ? rv.value : 0,
        }));
      } else if (aspect.type === "formula" && aspect.formula) {
        inputVars = aspect.formula.variables.map((v) => ({
          var: v.name,
          type: v.type,
          val: v.value,
        }));
      }

      const payload: SaveAssessmentEvaluationRequest = {
        rule_id: aspectId,
        level: "university",
        institute_id: null,
        study_program_id: null,
        proof: aspect.proofLinks || [],
        input_variables: inputVars,
      };

      // Check if existing evaluation exists for current user
      const existingEval = evalsRes?.data?.find(
        (ev) =>
          ev.calculation_rule.id === aspectId && ev.user?.id === currentUserId,
      );

      if (existingEval) {
        await updateEvaluation({ id: existingEval.id, body: payload }).unwrap();
      } else {
        await createEvaluation(payload).unwrap();
      }

      toast.success("Penilaian berhasil disimpan!");
      refetchEvals();
      setEditModes((prev) => ({ ...prev, [aspectId]: false }));
    } catch {
      toast.error("Gagal menyimpan penilaian.");
    } finally {
      setSavingAspectId(null);
    }
  };

  const handleStartEdit = (aspect: AssessmentAspect) => {
    setBackupAspects((prev) => ({
      ...prev,
      [aspect.id]: JSON.parse(JSON.stringify(aspect)),
    }));
    setEditModes((prev) => ({ ...prev, [aspect.id]: true }));
  };

  const handleCancelEdit = (aspectId: string) => {
    const backup = backupAspects[aspectId];
    if (backup) {
      setIndicatorsState((prev) =>
        prev.map((ind) => ({
          ...ind,
          aspects: (ind.aspects || []).map((a) =>
            a.id === aspectId ? backup : a,
          ),
        })),
      );
    }
    setEditModes((prev) => ({ ...prev, [aspectId]: false }));
  };

  const handleSaveEdit = async (aspectId: string) => {
    await handleSaveEvaluation(aspectId);
  };

  const handleSaveAspect = async (aspectId: string) => {
    await handleSaveEvaluation(aspectId);
  };

  console.log(indicatorsState);

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Title Header */}
      <div className="border-b border-border/40 pb-4">
        <h1 className="text-xl font-bold tracking-tight text-foreground md:text-2xl capitalize">
          {catLabel} - {stageLabel}
        </h1>
        <p className="text-xs text-muted-foreground mt-1">
          Lakukan audit mutu internal dan penilaian aspek berdasarkan indikator
          kriteria BAN-PT
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
          <h3 className="text-sm font-bold text-foreground">
            Instrumen Evaluasi Belum Tersedia
          </h3>
          <p className="text-xs text-muted-foreground max-w-sm">
            Admin belum membuat konfigurasi instrumen mutu BAN-PT untuk kategori{" "}
            <strong>{catLabel}</strong> di tahap ini.
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
                    <span>
                      {ind.number.toLowerCase().includes("indikator")
                        ? ind.number
                        : `Indikator ${ind.number}`}
                    </span>
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
                  <p className="text-muted-foreground">{ind.name}</p>
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
                  {activeIndicator.justification}
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

          {/* Aspects Assessments Forms */}
          {activeIndicator && (
            <div className="space-y-6">
              <div className="flex items-center gap-1.5 border-b border-border/40 pb-2">
                <ShieldCheck className="h-4 w-4 text-primary" />
                <h2 className="text-xs font-bold text-foreground uppercase tracking-wider">
                  Aspek Penilaian
                </h2>
              </div>

              {(activeIndicator.aspects || []).length === 0 ? (
                <div className="text-center p-8 border border-dashed border-border rounded-xl text-muted-foreground text-xs">
                  Belum ada kriteria penilaian aspek untuk indikator ini.
                </div>
              ) : (
                <div className="space-y-6">
                  {(activeIndicator.aspects || []).map((asp) => {
                    // Compute formula calculation values
                    let formulaVal = 0;
                    let isFulfilled = false;

                    if (asp.formula) {
                      formulaVal = calculateFormula(
                        asp.formula.expression,
                        asp.formula.variables,
                      );
                      isFulfilled =
                        formulaVal >=
                        (asp.expectationResult ?? asp.formula.threshold);
                    }

                    // Check if submit is allowed: score/choices filled & proof attached if required
                    const isChoiceFilled =
                      asp.type === "radio"
                        ? asp.selectedRadioIndex !== undefined
                        : true;

                    const isProofFilled = asp.buktiRequired
                      ? !!asp.proofLinks
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
                              {asp.complianceDescription}
                            </p>
                          </div>
                        </div>

                        {/* Data Source Row */}
                        <div className="py-2 px-3 bg-muted/20 border-l-2 border-primary rounded text-xs font-semibold text-muted-foreground">
                          Sumber Data:{" "}
                          <span className="text-foreground">
                            {asp.dataSource}
                          </span>
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
                                <div className="flex flex-col gap-2.5">
                                  {asp.radioVariables &&
                                  asp.radioVariables.length > 0 ? (
                                    <RadioGroup
                                      value={
                                        asp.selectedRadioIndex !== undefined
                                          ? String(asp.selectedRadioIndex)
                                          : undefined
                                      }
                                      onValueChange={(val) =>
                                        handleRadioChoiceSelect(
                                          asp.id,
                                          Number(val),
                                        )
                                      }
                                      disabled={
                                        isReadOnly || savingAspectId === asp.id
                                      }
                                      className="flex flex-col gap-2.5"
                                    >
                                      {asp.radioVariables.map((v, idx) => (
                                        <div
                                          key={v.name}
                                          className={`flex items-center gap-3 px-4 py-3 rounded-xl border text-xs font-semibold transition-all ${
                                            asp.selectedRadioIndex === idx
                                              ? "bg-primary/5 border-primary/45 shadow-sm text-foreground"
                                              : "bg-card border-border hover:bg-muted/30 text-muted-foreground"
                                          }`}
                                        >
                                          <RadioGroupItem
                                            value={String(idx)}
                                            id={`choice-${asp.id}-${idx}`}
                                            className="h-4.5 w-4.5 border-border"
                                          />
                                          <label
                                            htmlFor={`choice-${asp.id}-${idx}`}
                                            className="flex-1 cursor-pointer select-none text-foreground py-0.5 leading-none"
                                          >
                                            {v.name.replace(/_/g, " ")} (
                                            {v.value})
                                          </label>
                                        </div>
                                      ))}
                                    </RadioGroup>
                                  ) : (
                                    <span className="text-muted-foreground italic">
                                      Tidak ada pilihan.
                                    </span>
                                  )}
                                </div>
                              </div>

                              {/* Upload Bukti Zone  */}
                              {asp.buktiRequired && (
                                <div className="space-y-1.5 flex-1 min-w-0">
                                  <div className="flex justify-between items-center mb-1">
                                    <span className="font-bold text-[10px] text-muted-foreground uppercase">
                                      Link Bukti Dokumen{" "}
                                      <span className="text-error">*</span>
                                    </span>
                                    {!isReadOnly && (
                                      <Button
                                        type="button"
                                        variant="outline"
                                        size="sm"
                                        onClick={() =>
                                          handleOpenAddLink(asp.id)
                                        }
                                        disabled={
                                          isCreatingEval || isUpdatingEval
                                        }
                                        className="h-7 px-2.5 border-border text-[10px] font-bold rounded flex items-center gap-1 cursor-pointer"
                                      >
                                        <Plus className="h-3 w-3" /> Tambah Link
                                      </Button>
                                    )}
                                  </div>

                                  {!asp.proofLinks ||
                                  asp.proofLinks.length === 0 ? (
                                    <div className="text-center p-6 border border-dashed border-border rounded-lg text-xs text-muted-foreground bg-muted/5">
                                      Belum ada link bukti yang ditambahkan.
                                    </div>
                                  ) : (
                                    <div className="space-y-2 max-h-[220px] overflow-y-auto pr-1 scrollbar-thin">
                                      {asp.proofLinks.map((link, idx) => (
                                        <div
                                          key={idx}
                                          className="p-2.5 bg-muted/15 border border-border rounded-lg flex items-center justify-between gap-3 text-xs group"
                                        >
                                          <a
                                            href={
                                              link.startsWith("http")
                                                ? link
                                                : `https://${link}`
                                            }
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="font-mono text-primary truncate hover:underline flex-1 flex items-center gap-1.5"
                                            title={link}
                                          >
                                            <ExternalLink className="h-3 w-3 shrink-0" />
                                            <span className="truncate">
                                              {link}
                                            </span>
                                          </a>

                                          {!isReadOnly && (
                                            <div className="flex items-center gap-1 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                                              <button
                                                type="button"
                                                disabled={
                                                  isCreatingEval ||
                                                  isUpdatingEval
                                                }
                                                onClick={() =>
                                                  handleOpenEditLink(
                                                    asp.id,
                                                    idx,
                                                    link,
                                                  )
                                                }
                                                className="p-1 hover:bg-primary/10 text-muted-foreground hover:text-primary rounded cursor-pointer"
                                                title="Edit Link"
                                              >
                                                <Edit2 className="h-3.5 w-3.5" />
                                              </button>
                                              <button
                                                type="button"
                                                disabled={
                                                  isCreatingEval ||
                                                  isUpdatingEval
                                                }
                                                onClick={() =>
                                                  handleDeleteLink(asp.id, idx)
                                                }
                                                className="p-1 hover:bg-error/10 text-muted-foreground hover:text-error rounded cursor-pointer"
                                                title="Hapus Link"
                                              >
                                                <Trash2 className="h-3.5 w-3.5" />
                                              </button>
                                            </div>
                                          )}
                                        </div>
                                      ))}
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
                                      {isFulfilled
                                        ? "Terpenuhi"
                                        : "Tidak Terpenuhi"}
                                    </span>
                                  </div>
                                  <div>
                                    <span className="font-bold text-[9px] text-muted-foreground uppercase tracking-wider block">
                                      Hasil Perhitungan
                                    </span>
                                    <span className="text-xs font-bold text-foreground block mt-0.5">
                                      {formulaVal}{" "}
                                      {asp.expectationFormat === "percentage"
                                        ? "%"
                                        : ""}{" "}
                                      (Harapan: {asp.expectationResult}{" "}
                                      {asp.expectationFormat === "percentage"
                                        ? "%"
                                        : ""}
                                      )
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
                                        disabled={
                                          savingAspectId === asp.id ||
                                          !isProofFilled
                                        }
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
                                    disabled={
                                      savingAspectId === asp.id ||
                                      !isChoiceFilled ||
                                      !isProofFilled
                                    }
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
                                <div className="space-y-1">
                                  <span className="font-bold text-[10px] text-primary uppercase block">
                                    Rumus Evaluasi
                                  </span>
                                  <div className="bg-card border border-border p-2.5 rounded-lg font-mono text-foreground font-semibold text-xs select-none">
                                    {formatFriendlyFormula(
                                      asp.formula?.expression || "",
                                      asp.formula?.variables || [],
                                    ) || "Rumus Kosong"}
                                  </div>
                                </div>

                                <div className="space-y-2 w-full">
                                  <span className="font-bold text-[10px] text-muted-foreground uppercase tracking-wider block">
                                    Input Variabel
                                  </span>
                                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 w-full">
                                    {asp.formula?.variables
                                      .filter((v) => v.type === "input")
                                      .map((v) => (
                                        <div
                                          key={v.name}
                                          className="flex items-center justify-between gap-3 text-xs bg-card border border-border p-2 rounded-lg"
                                        >
                                          <span
                                            className="font-semibold text-muted-foreground pr-2"
                                            title={v.name}
                                          >
                                            {v.name}:
                                          </span>
                                          <Input
                                            type="number"
                                            value={v.value === 0 ? "" : v.value}
                                            placeholder="0"
                                            disabled={
                                              isReadOnly ||
                                              savingAspectId === asp.id
                                            }
                                            onChange={(e) =>
                                              handleVariableChange(
                                                asp.id,
                                                v.name,
                                                parseFloat(e.target.value) || 0,
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
                                  <div className="flex justify-between items-center mb-1">
                                    <span className="font-bold text-[10px] text-muted-foreground uppercase">
                                      Link Bukti Dokumen{" "}
                                      <span className="text-error">*</span>
                                    </span>
                                    {!isReadOnly && (
                                      <Button
                                        type="button"
                                        variant="outline"
                                        size="sm"
                                        onClick={() =>
                                          handleOpenAddLink(asp.id)
                                        }
                                        disabled={
                                          isCreatingEval || isUpdatingEval
                                        }
                                        className="h-7 px-2.5 border-border text-[10px] font-bold rounded flex items-center gap-1 cursor-pointer"
                                      >
                                        <Plus className="h-3 w-3" /> Tambah Link
                                      </Button>
                                    )}
                                  </div>

                                  {!asp.proofLinks ||
                                  asp.proofLinks.length === 0 ? (
                                    <div className="text-center p-6 border border-dashed border-border rounded-lg text-xs text-muted-foreground bg-muted/5">
                                      Belum ada link bukti yang ditambahkan.
                                    </div>
                                  ) : (
                                    <div className="space-y-2 max-h-[220px] overflow-y-auto pr-1 scrollbar-thin">
                                      {asp.proofLinks.map((link, idx) => (
                                        <div
                                          key={idx}
                                          className="p-2.5 bg-muted/15 border border-border rounded-lg flex items-center justify-between gap-3 text-xs group"
                                        >
                                          <a
                                            href={
                                              link.startsWith("http")
                                                ? link
                                                : `https://${link}`
                                            }
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="font-mono text-primary truncate hover:underline flex-1 flex items-center gap-1.5"
                                            title={link}
                                          >
                                            <ExternalLink className="h-3 w-3 shrink-0" />
                                            <span className="truncate">
                                              {link}
                                            </span>
                                          </a>

                                          {!isReadOnly && (
                                            <div className="flex items-center gap-1 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                                              <button
                                                type="button"
                                                disabled={
                                                  isCreatingEval ||
                                                  isUpdatingEval
                                                }
                                                onClick={() =>
                                                  handleOpenEditLink(
                                                    asp.id,
                                                    idx,
                                                    link,
                                                  )
                                                }
                                                className="p-1 hover:bg-primary/10 text-muted-foreground hover:text-primary rounded cursor-pointer"
                                                title="Edit Link"
                                              >
                                                <Edit2 className="h-3.5 w-3.5" />
                                              </button>
                                              <button
                                                type="button"
                                                disabled={
                                                  isCreatingEval ||
                                                  isUpdatingEval
                                                }
                                                onClick={() =>
                                                  handleDeleteLink(asp.id, idx)
                                                }
                                                className="p-1 hover:bg-error/10 text-muted-foreground hover:text-error rounded cursor-pointer"
                                                title="Hapus Link"
                                              >
                                                <Trash2 className="h-3.5 w-3.5" />
                                              </button>
                                            </div>
                                          )}
                                        </div>
                                      ))}
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
                                      {isFulfilled
                                        ? "Terpenuhi"
                                        : "Tidak Terpenuhi"}
                                    </span>
                                  </div>
                                  <div>
                                    <span className="font-bold text-[9px] text-muted-foreground uppercase tracking-wider block">
                                      Hasil Perhitungan
                                    </span>
                                    <span className="text-xs font-bold text-foreground block mt-0.5">
                                      {formulaVal}{" "}
                                      {asp.expectationFormat === "percentage"
                                        ? "%"
                                        : ""}{" "}
                                      (Harapan: {asp.expectationResult}{" "}
                                      {asp.expectationFormat === "percentage"
                                        ? "%"
                                        : ""}
                                      )
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
                                        disabled={
                                          savingAspectId === asp.id ||
                                          !isProofFilled
                                        }
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
                                    disabled={
                                      savingAspectId === asp.id ||
                                      !isProofFilled
                                    }
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

      {/* --- DIALOGS UNTUK LINK BUKTI --- */}
      <Dialog open={addLinkOpen} onOpenChange={setAddLinkOpen}>
        <DialogContent className="sm:max-w-md bg-card border border-border p-6 rounded-xl">
          <DialogHeader>
            <DialogTitle className="text-sm font-bold uppercase tracking-wider">
              Tambah Link Bukti
            </DialogTitle>
          </DialogHeader>
          <div className="py-3">
            <Field>
              <FieldLabel>URL / Tautan Dokumen</FieldLabel>
              <Input
                type="text"
                placeholder="Contoh: https://drive.google.com/..."
                value={newLinkUrl}
                onChange={(e) => setNewLinkUrl(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleSaveAddLink();
                }}
                className="h-10 text-xs"
              />
            </Field>
          </div>
          <DialogFooter className="gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setAddLinkOpen(false)}
              className="text-xs h-9"
            >
              Batal
            </Button>
            <Button
              type="button"
              onClick={handleSaveAddLink}
              disabled={!newLinkUrl.trim()}
              className="bg-primary text-xs h-9 cursor-pointer"
            >
              Tambah
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={editLinkOpen} onOpenChange={setEditLinkOpen}>
        <DialogContent className="sm:max-w-md bg-card border border-border p-6 rounded-xl">
          <DialogHeader>
            <DialogTitle className="text-sm font-bold uppercase tracking-wider">
              Edit Link Bukti
            </DialogTitle>
          </DialogHeader>
          <div className="py-3">
            <Field>
              <FieldLabel>URL / Tautan Dokumen</FieldLabel>
              <Input
                type="text"
                value={editingUrl}
                onChange={(e) => setEditingUrl(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleSaveEditLink();
                }}
                className="h-10 text-xs"
              />
            </Field>
          </div>
          <DialogFooter className="gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setEditLinkOpen(false)}
              className="text-xs h-9"
            >
              Batal
            </Button>
            <Button
              type="button"
              onClick={handleSaveEditLink}
              disabled={!editingUrl.trim()}
              className="bg-primary text-xs h-9 cursor-pointer"
            >
              Simpan
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
