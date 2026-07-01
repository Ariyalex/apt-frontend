"use client";

import React, { useState, useEffect } from "react";
import { Plus, Edit2, Trash2, ShieldCheck, Loader2, X } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { Field, FieldLabel } from "@/components/ui/field";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  IndicatorTab,
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

interface AdminIndicatorTab extends IndicatorTab {
  apiId?: string;
}

const isInternalConstant = (name: string): boolean => {
  const lower = name.toLowerCase();
  return (
    lower.includes("numerator") ||
    lower.includes("denominator") ||
    lower.includes("denomerator") ||
    lower.includes("constant")
  );
};

const formatFriendlyFormula = (expression: string, variables: FormulaVariable[]): string => {
  if (!expression) return "";
  let formatted = expression;

  // 1. Convert "Input-Numerator-[suffix] / Denominator-Percentage" -> "[value]%"
  const percentageNumerators = variables.filter(v => v.name.startsWith("Input-Numerator-") && variables.some(d => d.name === "Denominator-Percentage"));
  percentageNumerators.forEach(num => {
    const targetExpr = `${num.name} / Denominator-Percentage`;
    if (formatted.includes(targetExpr)) {
      formatted = formatted.replaceAll(targetExpr, `${num.value}%`);
    }
  });

  // 2. Convert "Input-Numerator-[suffix] / Input-Denomerator-[suffix]" -> "[num_val]/[denom_val]"
  const fractionNumerators = variables.filter(v => v.name.startsWith("Input-Numerator-"));
  fractionNumerators.forEach(num => {
    const suffix = num.name.replace("Input-Numerator-", "");
    const denomName = `Input-Denomerator-${suffix}`;
    const denom = variables.find(v => v.name === denomName);
    if (denom) {
      const targetExpr = `${num.name} / ${denomName}`;
      if (formatted.includes(targetExpr)) {
        formatted = formatted.replaceAll(targetExpr, `${num.value}/${denom.value}`);
      }
    }
  });

  // 3. Convert "Input-Constant-[suffix]" -> "[value]"
  const constants = variables.filter(v => v.name.startsWith("Input-Constant-"));
  constants.forEach(c => {
    formatted = formatted.replaceAll(c.name, String(c.value));
  });

  return formatted;
};


const mapCriteria = (criteria: string): string => {
  switch (criteria) {
    case "budaya-mutu":
      return "quality_culture";
    case "relevansi-pendidikan":
      return "education_relevance";
    case "relevansi-penelitian":
      return "research_relevance";
    case "relevansi-pkm":
      return "comunity_service_relevance";
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
  const [selectedId, setSelectedId] = useState<number>(1);
  const [isSaving, setIsSaving] = useState<boolean>(false);

  // Dialogs open state
  const [isIndicatorDialogOpen, setIsIndicatorDialogOpen] =
    useState<boolean>(false);
  const [isAspectDialogOpen, setIsAspectDialogOpen] = useState<boolean>(false);

  // Indicator Form state
  const [editingIndicator, setEditingIndicator] =
    useState<AdminIndicatorTab | null>(null);
  const [indNo, setIndNo] = useState<string>("");
  const [indJustifikasi, setIndJustifikasi] = useState<string>("");
  const [indDeskripsi, setIndDeskripsi] = useState<string>("");
  const [indDeleteConfirm, setIndDeleteConfirm] = useState<boolean>(false);

  // Aspect Form state
  const [editingAspect, setEditingAspect] = useState<AssessmentAspect | null>(
    null,
  );
  const [aspectType, setAspectType] = useState<"radio" | "formula">("radio");
  const [aspDescription, setAspDescription] = useState<string>("");
  const [aspCompliance, setAspCompliance] = useState<string>("");
  const [aspDataSource, setAspDataSource] = useState<string>("");
  const [aspExpectation, setAspExpectation] = useState<string>("");
  const [aspFormat, setAspFormat] = useState<"decimal" | "percentage">(
    "decimal",
  );
  const [aspBuktiRequired, setAspBuktiRequired] = useState<boolean>(true);
  const [aspDeleteConfirm, setAspDeleteConfirm] = useState<string | null>(null);

  // Variable management (within Aspect dialog)
  const [formulaVariables, setFormulaVariables] = useState<FormulaVariable[]>(
    [],
  );
  const [newVarName, setNewVarName] = useState<string>("");
  const [newVarType, setNewVarType] = useState<"input" | "static">("input");
  const [newVarValue, setNewVarValue] = useState<string>("0");

  // Radio choices variables
  const [radioVariables, setRadioVariables] = useState<RadioVariable[]>([]);
  const [newRadioName, setNewRadioName] = useState<string>("");
  const [newRadioValue, setNewRadioValue] = useState<string>("0");

  // Visual Formula Builder state
  const [formulaExpression, setFormulaExpression] = useState<string>("");
  const [formulaTokens, setFormulaTokens] = useState<string[]>([]); // for undo support
  const [constInput, setConstInput] = useState<string>("");
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
          expression: "Input-Numerator-100Percent / Denominator-Percentage",
          variables: [
            {
              name: "Input-Numerator-100Percent",
              label: "Konstanta Persen 100%",
              type: "static",
              value: 100,
            },
            {
              name: "Denominator-Percentage",
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
    useGetAssessmentRuleListQuery();

  const [createIndicator] = useCreateIndicatorMutation();
  const [updateIndicator] = useUpdateIndicatorMutation();
  const [deleteIndicator] = useDeleteIndicatorMutation();

  const [createRule] = useCreateAssessmentRuleMutation();
  const [updateRule] = useUpdateAssessmentRuleMutation();
  const [deleteRule] = useDeleteAssessmentRuleMutation();

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

  // Map API responses to state
  useEffect(() => {
    if (indicatorsRes?.data && rulesRes?.data) {
      const apiIndicators = indicatorsRes.data;
      const apiRules = rulesRes.data;

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
      const mapped: AdminIndicatorTab[] = apiIndicators.map((ind, index) => {
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
          id: index + 1, // local id index
          apiId: ind.id, // KEEP the actual indicator uuid
          title: ind.number,
          status: "belum" as const,
          justifikasi: ind.justification,
          indikatorDescription: ind.name,
          aspects,
        };
      });

      // eslint-disable-next-line react-hooks/set-state-in-effect
      setIndicators(mapped);
      if (mapped.length > 0) {
        const valid = mapped.some((ind) => ind.id === selectedId);
         
        setSelectedId(valid ? selectedId : mapped[0].id);
      }
    }
  }, [indicatorsRes, rulesRes, selectedId]);

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
    setIndNo((indicators.length + 1).toString());
    setIndJustifikasi("");
    setIndDeskripsi("");
    setIsIndicatorDialogOpen(true);
  };

  const openEditIndicator = () => {
    if (!activeIndicator) return;
    setEditingIndicator(activeIndicator);
    setIndNo(activeIndicator.id.toString());
    setIndJustifikasi(activeIndicator.justifikasi);
    setIndDeskripsi(activeIndicator.indikatorDescription);
    setIsIndicatorDialogOpen(true);
  };

  const handleSaveIndicator = async () => {
    const parsedNo = parseInt(indNo);
    if (isNaN(parsedNo)) {
      toast.error("Nomor indikator harus berupa angka!");
      return;
    }
    if (!indDeskripsi.trim()) {
      toast.error("Deskripsi indikator tidak boleh kosong!");
      return;
    }

    setIsSaving(true);
    try {
      const payload: SaveIndicatorRequest = {
        accreditation_id: activeAkredId,
        number: `Indikator ${parsedNo}`,
        name: indDeskripsi,
        justification: indJustifikasi,
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
      setSelectedId(1);
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
    setAspDescription("");
    setAspCompliance("");
    setAspDataSource("");
    setAspExpectation("");
    setAspFormat("decimal");
    setAspBuktiRequired(true);
    setConstInput("");

    // Clear formula states
    setFormulaVariables([]);
    setRadioVariables([]);
    setFormulaExpression("");
    setFormulaTokens([]);

    setIsAspectDialogOpen(true);
  };

  const openEditAspect = (asp: AssessmentAspect) => {
    setEditingAspect(asp);
    setAspectType(asp.type);
    setAspDescription(asp.description);
    setAspCompliance(asp.complianceDescription);
    setAspDataSource(asp.dataSource);
    setAspExpectation(asp.expectationResult?.toString() ?? "");
    setAspFormat(asp.expectationFormat ?? "decimal");
    setAspBuktiRequired(asp.buktiRequired);
    setConstInput("");

    if (asp.type === "formula" && asp.formula) {
      setFormulaVariables(asp.formula.variables || []);
      let expr = asp.formula.expression || "";
      const sortedConstants = [...localConstants].sort(
        (a, b) => b.expression.length - a.expression.length,
      );
      for (const lc of sortedConstants) {
        expr = expr.split(lc.expression).join(lc.label);
      }
      setFormulaExpression(expr);
      setFormulaTokens(expr.split(/\s+/).filter(Boolean));
    } else if (asp.type === "radio") {
      setRadioVariables(asp.radioVariables || []);
      let expr = asp.formula?.expression || "";
      const sortedConstants = [...localConstants].sort(
        (a, b) => b.expression.length - a.expression.length,
      );
      for (const lc of sortedConstants) {
        expr = expr.split(lc.expression).join(lc.label);
      }
      setFormulaExpression(expr);
      setFormulaTokens(expr.split(/\s+/).filter(Boolean));
    }

    setIsAspectDialogOpen(true);
  };

  // Variables list helpers
  const handleAddFormulaVariable = () => {
    if (!newVarName.trim()) {
      toast.error("Nama variabel tidak boleh kosong!");
      return;
    }
    // Only letters & numbers
    if (!/^[a-zA-Z0-9_]+$/.test(newVarName)) {
      toast.error("Nama variabel hanya boleh huruf, angka, dan underscore!");
      return;
    }
    if (formulaVariables.some((v) => v.name === newVarName)) {
      toast.error("Variabel dengan nama tersebut sudah didefinisikan!");
      return;
    }

    const newItem: FormulaVariable = {
      name: newVarName.trim(),
      label: newVarName.trim(),
      type: newVarType,
      value: newVarType === "static" ? parseFloat(newVarValue) || 0 : 0,
    };

    setFormulaVariables([...formulaVariables, newItem]);
    setNewVarName("");
    setNewVarValue("0");
  };

  const handleAddRadioVariable = () => {
    if (!newRadioName.trim()) {
      toast.error("Nama pilihan radio tidak boleh kosong!");
      return;
    }
    const val = parseFloat(newRadioValue);
    if (isNaN(val)) {
      toast.error("Point pilihan radio harus berupa angka!");
      return;
    }

    // We construct a clean variable name by replacing spaces with underscores
    const varName = newRadioName.trim().replace(/\s+/g, "_");

    if (radioVariables.some((v) => v.name === varName)) {
      toast.error("Pilihan radio tersebut sudah dibuat!");
      return;
    }

    const newItem: RadioVariable = {
      name: varName,
      value: val,
    };

    const updatedRadios = [...radioVariables, newItem];
    setRadioVariables(updatedRadios);

    // Auto-update formula and tokens for ordinary/radio assessment
    // "berikan default var + var + var sesuai jumlah var yang sudah dibuat"
    const expression = updatedRadios.map((r) => r.name).join(" + ");
    setFormulaExpression(expression);
    setFormulaTokens(
      updatedRadios
        .map((r) => r.name)
        .flatMap((t, i) => (i > 0 ? ["+", t] : [t])),
    );

    setNewRadioName("");
    setNewRadioValue("0");
  };

  const handleRemoveFormulaVariable = (name: string) => {
    setFormulaVariables(formulaVariables.filter((v) => v.name !== name));
    // Clear formula if it reference deleted variable to avoid compilation issues
    if (formulaExpression.includes(name)) {
      setFormulaExpression("");
      setFormulaTokens([]);
    }
  };

  const handleRemoveRadioVariable = (name: string) => {
    const updatedRadios = radioVariables.filter((v) => v.name !== name);
    setRadioVariables(updatedRadios);
    const expression = updatedRadios.map((r) => r.name).join(" + ");
    setFormulaExpression(expression);
    setFormulaTokens(
      updatedRadios
        .map((r) => r.name)
        .flatMap((t, i) => (i > 0 ? ["+", t] : [t])),
    );
  };

  // Visual Formula building actions
  const appendFormulaToken = (token: string) => {
    const updatedTokens = [...formulaTokens, token];
    setFormulaTokens(updatedTokens);
    setFormulaExpression(updatedTokens.join(" "));
  };

  const handleCreateLocalConstant = () => {
    const input = constInput.trim();
    if (!input) {
      toast.error("Input tidak boleh kosong!");
      return;
    }

    if (localConstants.some((c) => c.label === input)) {
      toast.error("Konstanta dengan nama tersebut sudah terdaftar!");
      return;
    }

    const getNextLocalSuffix = (base: string, existing: LocalConstant[]) => {
      let charCode = 65; // 'A'
      while (true) {
        const suffix = String.fromCharCode(charCode);
        const name = `${base}-${suffix}`;
        const collision = existing.some((c) =>
          c.variables.some((v) => v.name === name),
        );
        if (!collision) return suffix;
        charCode++;
        if (charCode > 90) {
          return Math.random().toString(36).substring(2, 5).toUpperCase();
        }
      }
    };

    let newConst: LocalConstant | null = null;

    if (input.endsWith("%")) {
      const valStr = input.slice(0, -1).trim();
      const value = parseFloat(valStr);
      if (isNaN(value)) {
        toast.error("Format persen tidak valid!");
        return;
      }

      const denomName = "Denominator-Percentage";
      const suffix = getNextLocalSuffix("Input-Numerator", localConstants);
      const numName = `Input-Numerator-${suffix}`;

      const variables: FormulaVariable[] = [
        {
          name: numName,
          label: `Konstanta Persen ${input}`,
          type: "static",
          value,
        },
        {
          name: denomName,
          label: "Denominator Persen (Default 100)",
          type: "static",
          value: 100,
        },
      ];

      newConst = {
        label: input,
        expression: `${numName} / ${denomName}`,
        variables,
      };
    } else if (input.includes("/")) {
      const parts = input.split("/");
      if (parts.length !== 2) {
        toast.error("Format pecahan tidak valid!");
        return;
      }
      const numVal = parseFloat(parts[0].trim());
      const denomVal = parseFloat(parts[1].trim());
      if (isNaN(numVal) || isNaN(denomVal) || denomVal === 0) {
        toast.error("Nilai pembilang/penyebut tidak valid!");
        return;
      }

      const suffix = getNextLocalSuffix("Input-Numerator", localConstants);
      const numName = `Input-Numerator-${suffix}`;
      const denomName = `Input-Denomerator-${suffix}`;

      const variables: FormulaVariable[] = [
        {
          name: numName,
          label: `Pembilang Pecahan ${input}`,
          type: "static",
          value: numVal,
        },
        {
          name: denomName,
          label: `Penyebut Pecahan ${input}`,
          type: "static",
          value: denomVal,
        },
      ];

      newConst = {
        label: input,
        expression: `${numName} / ${denomName}`,
        variables,
      };
    } else {
      const staticVal = parseFloat(input);
      if (isNaN(staticVal)) {
        toast.error("Format tidak valid! Gunakan format seperti: 90% atau 5/3");
        return;
      }

      const suffix = getNextLocalSuffix("Input-Constant", localConstants);
      const constName = `Input-Constant-${suffix}`;

      newConst = {
        label: input,
        expression: constName,
        variables: [
          {
            name: constName,
            label: `Konstanta ${input}`,
            type: "static",
            value: staticVal,
          },
        ],
      };
    }

    if (newConst) {
      const updated = [...localConstants, newConst];
      setLocalConstants(updated);
      localStorage.setItem(
        "mutu_banpt_local_constants",
        JSON.stringify(updated),
      );
      setConstInput("");
      toast.success(`Konstanta local "${input}" berhasil disimpan!`);
    }
  };

  const undoFormulaToken = () => {
    if (formulaTokens.length === 0) return;
    const updatedTokens = formulaTokens.slice(0, -1);
    setFormulaTokens(updatedTokens);
    setFormulaExpression(updatedTokens.join(" "));
  };

  const clearFormula = () => {
    setFormulaTokens([]);
    setFormulaExpression("");
  };

  const handleSaveAspect = async () => {
    if (!aspDescription.trim() || !aspDataSource.trim()) {
      toast.error("Deskripsi dan sumber data tidak boleh kosong!");
      return;
    }
    if (!activeIndicator) return;
    const activeIndicatorApiId = activeIndicator.apiId;
    if (!activeIndicatorApiId) return;

    const parsedExpectation = parseFloat(aspExpectation);

    // Prepare variables list as RuleVariable[] for the database
    let variablesList: RuleVariable[] = [];
    if (aspectType === "formula") {
      variablesList = formulaVariables.map((v) => ({
        var: v.name,
        type: v.type,
        val: v.value,
      }));
    } else {
      variablesList = radioVariables.map((rv) => ({
        var: rv.name,
        type: "input",
        val: rv.value,
      }));
    }

    // Merge variables from used local constants in formula tokens
    for (const tok of formulaTokens) {
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
    const mappedTokens = formulaTokens.map((tok) => {
      const found = localConstants.find((lc) => lc.label === tok);
      return found ? found.expression : tok;
    });
    const finalExpression = mappedTokens.join(" ");

    const payload: SaveAssessmentRuleRequest = {
      indicator_id: activeIndicatorApiId,
      assessment: aspDescription,
      fulfillment: aspCompliance,
      data_source: aspDataSource,
      type: aspectType === "formula" ? "maths" : "points",
      input_rules: variablesList, // Backend typo 'inut_rules' matches SaveAssessmentRuleRequest
      formula: finalExpression,
      expectation_result: isNaN(parsedExpectation) ? 0 : parsedExpectation,
      result_format: aspFormat,
      proof_required: aspBuktiRequired,
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
  const operators = ["(", ")", "+", "-", "*", "/"];

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
            rumus untuk auditor.
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
                    <span>Indikator {ind.id}</span>
                  </button>
                </HoverCardTrigger>
                <HoverCardContent className="w-80 p-3 bg-card border border-border rounded-lg shadow-md text-xs leading-relaxed text-foreground z-50">
                  <p className="font-bold text-primary mb-1 uppercase tracking-wider text-[10px]">
                    Keterangan:
                  </p>
                  <p className="text-muted-foreground">
                    {ind.indikatorDescription}
                  </p>
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
                  {activeIndicator.justifikasi || "-"}
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

          {/* Aspects management block */}
          {activeIndicator && (
            <div className="space-y-6">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between border-b border-border/40 pb-2">
                <div className="flex items-center gap-1.5">
                  <ShieldCheck className="h-4 w-4 text-primary" />
                  <h2 className="text-xs font-bold text-foreground uppercase tracking-wider">
                    Aspek Penilaian (Indikator {activeIndicator.id})
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
              {activeIndicator.aspects.length === 0 ? (
                <div className="text-center p-8 border border-dashed border-border rounded-xl text-muted-foreground text-xs">
                  Belum ada aspek penilaian untuk indikator ini. Silakan
                  tambahkan aspek biasa/rumus.
                </div>
              ) : (
                <div className="space-y-6">
                  {activeIndicator.aspects.map((asp) => (
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
                                {formatFriendlyFormula(asp.formula?.expression || "", asp.formula?.variables || []) || "Rumus Kosong"}
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
      <Dialog
        open={isIndicatorDialogOpen}
        onOpenChange={setIsIndicatorDialogOpen}
      >
        <DialogContent className="sm:max-w-lg p-6 bg-card border border-border text-xs">
          <DialogHeader>
            <DialogTitle className="text-sm font-bold text-foreground">
              {editingIndicator
                ? "Edit Indikator Mutu"
                : "Tambah Indikator Mutu"}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4 py-3">
            <Field>
              <FieldLabel htmlFor="ind-no">Nomor Indikator</FieldLabel>
              <Input
                id="ind-no"
                type="number"
                value={indNo}
                onChange={(e) => setIndNo(e.target.value)}
                placeholder="1"
                disabled={isSaving}
                className="w-28 bg-card border-border text-foreground"
              />
            </Field>

            <Field>
              <FieldLabel htmlFor="ind-justifikasi">
                Justifikasi (Rujukan Hukum / SK)
              </FieldLabel>
              <Textarea
                id="ind-justifikasi"
                value={indJustifikasi}
                onChange={(e) => setIndJustifikasi(e.target.value)}
                placeholder="Tuliskan justifikasi..."
                disabled={isSaving}
                rows={3}
                className="w-full bg-card border border-border rounded-lg px-3 py-2 focus:outline-none focus:border-primary text-foreground resize-none"
              />
            </Field>

            <Field>
              <FieldLabel htmlFor="ind-deskripsi">
                Deskripsi Indikator
              </FieldLabel>
              <Textarea
                id="ind-deskripsi"
                value={indDeskripsi}
                onChange={(e) => setIndDeskripsi(e.target.value)}
                placeholder="Tuliskan deskripsi kriteria mutu..."
                disabled={isSaving}
                rows={4}
                className="w-full bg-card border border-border rounded-lg px-3 py-2 focus:outline-none focus:border-primary text-foreground resize-none"
              />
            </Field>
          </div>

          <DialogFooter className="flex-row items-center justify-between border-t border-border/40 pt-4 mt-2">
            <div>
              {editingIndicator && (
                <Button
                  onClick={() => setIndDeleteConfirm(true)}
                  disabled={isSaving}
                  className="bg-error hover:bg-error/90 text-error-foreground font-semibold text-xs h-9 cursor-pointer"
                >
                  Hapus Indikator
                </Button>
              )}
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                disabled={isSaving}
                onClick={() => setIsIndicatorDialogOpen(false)}
                className="text-xs h-9 cursor-pointer"
              >
                Batal
              </Button>
              <Button
                onClick={handleSaveIndicator}
                disabled={isSaving}
                className="bg-primary text-primary-foreground text-xs font-semibold h-9 px-4 rounded-lg hover:bg-primary/95 shadow-sm cursor-pointer"
              >
                {isSaving ? (
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                ) : (
                  "Simpan"
                )}
              </Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog Add/Edit Aspect (Unified) */}
      <Dialog open={isAspectDialogOpen} onOpenChange={setIsAspectDialogOpen}>
        <DialogContent className="sm:max-w-2xl p-6 bg-card border border-border text-xs max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-sm font-bold text-foreground">
              {editingAspect
                ? `Edit Aspek Penilaian (${aspectType === "formula" ? "Rumus" : "Biasa"})`
                : `Tambah Aspek Penilaian (${aspectType === "formula" ? "Rumus" : "Biasa"})`}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4 py-3">
            {/* Aspek Penilaian & Pemenuhan */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Field>
                <FieldLabel htmlFor="asp-description">
                  Aspek Penilaian (Deskripsi Aspek)
                </FieldLabel>
                <Textarea
                  id="asp-description"
                  value={aspDescription}
                  onChange={(e) => setAspDescription(e.target.value)}
                  placeholder="Tuliskan aspek penilaian..."
                  disabled={isSaving}
                  rows={3}
                  className="w-full bg-card border border-border rounded-lg px-3 py-2 focus:outline-none focus:border-primary text-foreground resize-none"
                />
              </Field>
              <Field>
                <FieldLabel htmlFor="asp-compliance">
                  Aspek Pemenuhan (Kriteria Lulus)
                </FieldLabel>
                <Textarea
                  id="asp-compliance"
                  value={aspCompliance}
                  onChange={(e) => setAspCompliance(e.target.value)}
                  placeholder="Tuliskan aspek pemenuhan..."
                  disabled={isSaving}
                  rows={3}
                  className="w-full bg-card border border-border rounded-lg px-3 py-2 focus:outline-none focus:border-primary text-foreground resize-none"
                />
              </Field>
            </div>

            {/* Sumber data */}
            <Field>
              <FieldLabel htmlFor="asp-data-source">Sumber Data</FieldLabel>
              <Input
                id="asp-data-source"
                value={aspDataSource}
                onChange={(e) => setAspDataSource(e.target.value)}
                placeholder="Contoh: Website LPPM, Kepegawaian"
                disabled={isSaving}
                className="bg-card border-border text-foreground"
              />
            </Field>

            {/* Harapan (Expectation) & Format */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Field>
                <FieldLabel htmlFor="asp-expectation">
                  Expectation Result (Nilai Kelulusan)
                </FieldLabel>
                <Input
                  id="asp-expectation"
                  type="number"
                  value={aspExpectation}
                  onChange={(e) => setAspExpectation(e.target.value)}
                  placeholder="Contoh: 3, 40"
                  disabled={isSaving}
                  className="bg-card border-border text-foreground"
                />
              </Field>
              <Field>
                <FieldLabel>Format Output Harapan</FieldLabel>
                <div className="flex gap-4 mt-2">
                  <label className="flex items-center gap-1.5 font-semibold text-foreground cursor-pointer">
                    <input
                      type="radio"
                      name="expect-format"
                      value="decimal"
                      checked={aspFormat === "decimal"}
                      onChange={() => setAspFormat("decimal")}
                      className="accent-primary"
                    />
                    Angka Desimal
                  </label>
                  <label className="flex items-center gap-1.5 font-semibold text-foreground cursor-pointer">
                    <input
                      type="radio"
                      name="expect-format"
                      value="percentage"
                      checked={aspFormat === "percentage"}
                      onChange={() => setAspFormat("percentage")}
                      className="accent-primary"
                    />
                    Persentase (%)
                  </label>
                </div>
              </Field>
            </div>

            {/* Kebutuhan Bukti */}
            <Field>
              <FieldLabel>Apakah Bukti Dokumen Diperlukan?</FieldLabel>
              <div className="flex gap-4 mt-1.5">
                <label className="flex items-center gap-1.5 font-semibold text-foreground cursor-pointer">
                  <input
                    type="radio"
                    name="bukti-required"
                    checked={aspBuktiRequired === true}
                    onChange={() => setAspBuktiRequired(true)}
                    className="accent-primary"
                  />
                  Ya, Diperlukan File Upload
                </label>
                <label className="flex items-center gap-1.5 font-semibold text-foreground cursor-pointer">
                  <input
                    type="radio"
                    name="bukti-required"
                    checked={aspBuktiRequired === false}
                    onChange={() => setAspBuktiRequired(false)}
                    className="accent-primary"
                  />
                  Tidak Diperlukan
                </label>
              </div>
            </Field>

            <Separator className="my-2 border-border/40" />

            {/* VARIABLES MANAGEMENT ZONE */}
            {aspectType === "radio" ? (
              /* Variable builder for Radio / Ordinary aspect */
              <div className="space-y-4">
                <div className="p-3 bg-muted/20 border border-border rounded-lg space-y-2">
                  <span className="font-bold text-[10px] text-primary uppercase block">
                    Definisikan Variabel Pilihan Radio
                  </span>

                  {/* Dynamic choices variables list */}
                  {radioVariables.length === 0 ? (
                    <p className="text-muted-foreground italic text-[11px] py-1">
                      Belum ada pilihan radio. Definisikan minimal satu pilihan.
                    </p>
                  ) : (
                    <div className="flex flex-wrap gap-2 py-1">
                      {radioVariables.map((v) => (
                        <div
                          key={v.name}
                          className="flex items-center gap-1.5 bg-card border border-border px-2 py-1 rounded"
                        >
                          <span className="font-semibold text-foreground">
                            {v.name.replace(/_/g, " ")} ({v.value})
                          </span>
                          <button
                            type="button"
                            onClick={() => handleRemoveRadioVariable(v.name)}
                            className="text-error hover:bg-error/10 p-0.5 rounded cursor-pointer"
                          >
                            <X className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Add radio variable fields */}
                  <div className="flex flex-wrap gap-3 items-end pt-1">
                    <Field className="flex-1 min-w-[150px]">
                      <FieldLabel
                        htmlFor="new-radio-name"
                        className="text-[10px] font-bold text-muted-foreground uppercase"
                      >
                        Nama Pilihan
                      </FieldLabel>
                      <Input
                        id="new-radio-name"
                        value={newRadioName}
                        onChange={(e) => setNewRadioName(e.target.value)}
                        placeholder="Contoh: Baik, Unggul"
                        className="bg-card text-xs h-8 border-border text-foreground"
                      />
                    </Field>
                    <Field className="w-24">
                      <FieldLabel
                        htmlFor="new-radio-value"
                        className="text-[10px] font-bold text-muted-foreground uppercase"
                      >
                        Poin / Nilai
                      </FieldLabel>
                      <Input
                        id="new-radio-value"
                        type="number"
                        value={newRadioValue}
                        onChange={(e) => setNewRadioValue(e.target.value)}
                        className="bg-card text-xs h-8 border-border text-foreground text-right"
                      />
                    </Field>
                    <Button
                      type="button"
                      onClick={handleAddRadioVariable}
                      variant="outline"
                      className="h-8 text-xs font-semibold border-border hover:bg-muted/40 text-foreground cursor-pointer shrink-0"
                    >
                      + Tambah Pilihan
                    </Button>
                  </div>
                </div>
              </div>
            ) : (
              /* Variable builder for Formula aspect */
              <div className="space-y-4">
                <div className="p-3 bg-muted/20 border border-border rounded-lg space-y-2">
                  <span className="font-bold text-[10px] text-primary uppercase block">
                    Definisikan Variabel Rumus
                  </span>

                  {/* Dynamic formula variables list */}
                  {formulaVariables.filter((v) => !isInternalConstant(v.name)).length === 0 ? (
                    <p className="text-muted-foreground italic text-[11px] py-1">
                      Belum ada variabel rumus. Tambahkan variabel baru.
                    </p>
                  ) : (
                    <div className="flex flex-wrap gap-2 py-1">
                      {formulaVariables.filter((v) => !isInternalConstant(v.name)).map((v) => (
                        <div
                          key={v.name}
                          className="flex items-center gap-1.5 bg-card border border-border px-2 py-1 rounded"
                        >
                          <span className="font-semibold text-foreground">
                            {v.name} (
                            {v.type === "static"
                              ? `Static: ${v.value}`
                              : "Input Auditor"}
                            )
                          </span>
                          <button
                            type="button"
                            onClick={() => handleRemoveFormulaVariable(v.name)}
                            className="text-error hover:bg-error/10 p-0.5 rounded cursor-pointer"
                          >
                            <X className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Add formula variable sub-form */}
                  <div className="flex flex-wrap gap-3 items-end pt-1">
                    <Field className="flex-1 min-w-[150px]">
                      <FieldLabel
                        htmlFor="new-var-name"
                        className="text-[10px] font-bold text-muted-foreground uppercase"
                      >
                        Nama Variabel
                      </FieldLabel>
                      <Input
                        id="new-var-name"
                        value={newVarName}
                        onChange={(e) => setNewVarName(e.target.value)}
                        placeholder="Contoh: NDT, NDS3"
                        className="bg-card text-xs h-8 border-border text-foreground"
                      />
                    </Field>
                    <Field className="w-32">
                      <FieldLabel className="text-[10px] font-bold text-muted-foreground uppercase">
                        Tipe
                      </FieldLabel>
                      <Select
                        value={newVarType}
                        onValueChange={(val) =>
                          setNewVarType(val as "input" | "static")
                        }
                      >
                        <SelectTrigger className="w-full bg-card border border-border rounded-lg text-xs h-8 px-2 text-foreground cursor-pointer">
                          <SelectValue placeholder="Tipe" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="input">Input Auditor</SelectItem>
                          <SelectItem value="static">Static (Tetap)</SelectItem>
                        </SelectContent>
                      </Select>
                    </Field>
                    {newVarType === "static" && (
                      <Field className="w-20">
                        <FieldLabel
                          htmlFor="new-var-value"
                          className="text-[10px] font-bold text-muted-foreground uppercase"
                        >
                          Nilai
                        </FieldLabel>
                        <Input
                          id="new-var-value"
                          type="number"
                          value={newVarValue}
                          onChange={(e) => setNewVarValue(e.target.value)}
                          className="bg-card text-xs h-8 border-border text-foreground text-right"
                        />
                      </Field>
                    )}
                    <Button
                      type="button"
                      onClick={handleAddFormulaVariable}
                      variant="outline"
                      className="h-8 text-xs font-semibold border-border hover:bg-muted/40 text-foreground cursor-pointer shrink-0"
                    >
                      + Tambah Variabel
                    </Button>
                  </div>
                </div>
              </div>
            )}

            {/* VISUAL FORMULA BUILDER */}
            {(aspectType === "formula" || aspectType === "radio") && (
              <div className="p-4 border border-primary/20 bg-primary/5 rounded-xl space-y-3">
                <span className="font-bold text-[10px] text-primary uppercase tracking-wider block">
                  Visual Formula Builder (Rakit Rumus)
                </span>

                {/* Operator Selector buttons */}
                <div className="space-y-1.5">
                  <span className="text-[9px] font-bold text-muted-foreground uppercase">
                    Klik tombol operator:
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {operators.map((op) => (
                      <button
                        key={op}
                        type="button"
                        onClick={() => appendFormulaToken(op)}
                        className="bg-card hover:bg-muted border border-border px-3 py-1 rounded text-xs font-semibold text-foreground cursor-pointer font-mono shrink-0"
                      >
                        {op}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Local Constants buttons */}
                <div className="space-y-1.5">
                  <span className="text-[9px] font-bold text-muted-foreground uppercase">
                    Klik tombol konstanta local:
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {localConstants.map((lc) => (
                      <button
                        key={lc.label}
                        type="button"
                        onClick={() => appendFormulaToken(lc.label)}
                        className="bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/20 px-2.5 py-1 rounded text-xs font-semibold text-amber-600 dark:text-amber-400 cursor-pointer shrink-0"
                      >
                        {lc.label}
                      </button>
                    ))}
                    {localConstants.length === 0 && (
                      <span className="text-[11px] text-muted-foreground/60 italic">
                        Belum ada konstanta local.
                      </span>
                    )}
                  </div>
                </div>

                {/* Custom local constants builder */}
                <div className="space-y-1.5 pt-1">
                  <span className="text-[9px] font-bold text-muted-foreground uppercase">
                    Rakit Konstanta Baru (Angka / Persen / Pecahan):
                  </span>
                  <div className="flex gap-2 items-center">
                    <Input
                      id="const-input"
                      value={constInput}
                      onChange={(e) => setConstInput(e.target.value)}
                      placeholder="Contoh: 90% atau 5/3"
                      className="bg-card text-xs h-8 border-border text-foreground max-w-[200px]"
                    />
                    <Button
                      type="button"
                      onClick={handleCreateLocalConstant}
                      variant="outline"
                      className="h-8 text-xs font-semibold border-border hover:bg-muted/40 text-foreground cursor-pointer shrink-0"
                    >
                      Simpan Konstanta
                    </Button>
                  </div>
                  <span className="text-[9px] text-muted-foreground block leading-relaxed">
                    (Input akan tersimpan di Local Storage dan memunculkan
                    tombol konstanta baru di atas.)
                  </span>
                </div>

                {/* Variable Selector buttons */}
                <div className="space-y-1.5">
                  <span className="text-[9px] font-bold text-muted-foreground uppercase">
                    Klik tombol variabel:
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {aspectType === "formula"
                      ? formulaVariables
                          .filter((v) => !isInternalConstant(v.name))
                          .map((v) => (
                            <button
                              key={v.name}
                              type="button"
                              onClick={() => appendFormulaToken(v.name)}
                              className="bg-primary/10 hover:bg-primary/20 border border-primary/20 px-2.5 py-1 rounded text-xs font-semibold text-primary cursor-pointer shrink-0"
                            >
                              {v.name}
                            </button>
                          ))
                      : radioVariables
                          .filter((v) => !isInternalConstant(v.name))
                          .map((v) => (
                            <button
                              key={v.name}
                              type="button"
                              onClick={() => appendFormulaToken(v.name)}
                              className="bg-primary/10 hover:bg-primary/20 border border-primary/20 px-2.5 py-1 rounded text-xs font-semibold text-primary cursor-pointer shrink-0"
                            >
                              {v.name}
                            </button>
                          ))}
                    {((aspectType === "formula" &&
                      formulaVariables.filter((v) => !isInternalConstant(v.name)).length === 0) ||
                      (aspectType === "radio" &&
                        radioVariables.filter((v) => !isInternalConstant(v.name)).length === 0)) && (
                      <span className="text-[11px] text-muted-foreground/60 italic">
                        Definisikan variabel di atas terlebih dahulu.
                      </span>
                    )}
                  </div>
                </div>

                {/* Formula expression preview */}
                <div className="space-y-1.5">
                  <span className="text-[9px] font-bold text-muted-foreground uppercase block">
                    Preview Rumus Perhitungan
                  </span>
                  <div className="flex gap-2 items-center">
                    <div className="bg-card border border-border p-2.5 rounded-lg font-mono text-foreground font-semibold flex-1 text-xs select-none">
                      {formatFriendlyFormula(formulaExpression, formulaVariables) || (
                        <span className="text-muted-foreground/50">
                          Rumus kosong...
                        </span>
                      )}
                    </div>
                    <Button
                      type="button"
                      onClick={undoFormulaToken}
                      variant="outline"
                      className="h-8 text-xs font-semibold border-border text-foreground cursor-pointer shrink-0"
                    >
                      Undo
                    </Button>
                    <Button
                      type="button"
                      onClick={clearFormula}
                      variant="outline"
                      className="h-8 text-xs font-semibold border-border text-error hover:bg-error/5 cursor-pointer shrink-0"
                    >
                      Clear
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </div>

          <DialogFooter className="gap-2 sm:gap-0 border-t border-border/40 pt-4 mt-2">
            <Button
              variant="outline"
              disabled={isSaving}
              onClick={() => setIsAspectDialogOpen(false)}
              className="text-xs h-9 cursor-pointer"
            >
              Batal
            </Button>
            <Button
              onClick={handleSaveAspect}
              disabled={isSaving}
              className="bg-primary text-primary-foreground text-xs font-semibold h-9 px-4 rounded-lg hover:bg-primary/95 shadow-sm cursor-pointer"
            >
              {isSaving ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin mr-1" />
              ) : (
                "Simpan"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Aspect Confirmation */}
      <AlertDialog
        open={!!aspDeleteConfirm}
        onOpenChange={(o) => !o && setAspDeleteConfirm(null)}
      >
        <AlertDialogContent className="bg-card border border-border">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-sm font-bold text-foreground">
              Hapus Aspek Penilaian?
            </AlertDialogTitle>
            <AlertDialogDescription className="text-xs text-muted-foreground leading-normal">
              Aksi ini bersifat destruktif dan akan menghapus kriteria evaluasi
              aspek ini secara permanen.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="text-xs">
            <AlertDialogCancel className="text-xs h-9 cursor-pointer">
              Batal
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={() =>
                aspDeleteConfirm && handleDeleteAspect(aspDeleteConfirm)
              }
              className="bg-error hover:bg-error/90 text-error-foreground font-semibold text-xs h-9 cursor-pointer"
            >
              Ya, Hapus
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Delete Indicator Confirmation */}
      <AlertDialog open={indDeleteConfirm} onOpenChange={setIndDeleteConfirm}>
        <AlertDialogContent className="bg-card border border-border">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-sm font-bold text-foreground">
              Hapus Indikator {editingIndicator?.id}?
            </AlertDialogTitle>
            <AlertDialogDescription className="text-xs text-muted-foreground leading-normal">
              Aksi ini bersifat destruktif. Menghapus indikator akan
              menghilangkan seluruh data justifikasi dan aspek penilaian di
              bawahnya.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="text-xs">
            <AlertDialogCancel className="text-xs h-9 cursor-pointer">
              Batal
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteIndicator}
              className="bg-error hover:bg-error/90 text-error-foreground font-semibold text-xs h-9 cursor-pointer"
            >
              Ya, Hapus
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
