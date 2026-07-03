import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Field, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import {
  AssessmentAspect,
  FormulaVariable,
  LocalConstant,
  RadioVariable,
} from "@/types/mutu-banpt";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import {
  formatFriendlyFormula,
  isInternalConstant,
} from "../mutu-banpt-helper";
import { Loader2, X } from "lucide-react";

export interface AspectFormData {
  description: string;
  compliance: string;
  dataSource: string;
  expectation: string;
  format: "decimal" | "percentage";
  buktiRequired: boolean;
  formulaVariables: FormulaVariable[];
  radioVariables: RadioVariable[];
  formulaExpression: string;
  formulaTokens: string[];
}

interface AspectFormDialogProps {
  isOpen: boolean;
  onClose: () => void;
  isSaving: boolean;
  aspectType: "formula" | "radio";
  initialData: AssessmentAspect | null;
  localConstants: LocalConstant[];
  // onSaveLocalConstant: (input: string) => void;
  onSave: (data: AspectFormData) => void;
}

const operators = ["(", ")", "+", "-", "*", "/"];

export default function AspectRuleFormDialog({
  isOpen,
  onClose,
  isSaving,
  aspectType,
  initialData,
  localConstants,
  // onSaveLocalConstant,
  onSave,
}: AspectFormDialogProps) {
  const [aspDescription, setAspDescription] = useState<string>("");
  const [aspCompliance, setAspCompliance] = useState<string>("");
  const [aspDataSource, setAspDataSource] = useState<string>("");
  const [aspExpectation, setAspExpectation] = useState<string>("");
  const [aspFormat, setAspFormat] = useState<"decimal" | "percentage">(
    "decimal",
  );
  const [aspBuktiRequired, setAspBuktiRequired] = useState<boolean>(true);

  const [formulaVariables, setFormulaVariables] = useState<FormulaVariable[]>(
    [],
  );
  const [newVarName, setNewVarName] = useState<string>("");
  const [newVarType, setNewVarType] = useState<"input" | "static">("input");
  const [newVarValue, setNewVarValue] = useState<string>("0");
  const [radioVariables, setRadioVariables] = useState<RadioVariable[]>([]);

  const [formulaExpression, setFormulaExpression] = useState<string>("");
  const [formulaTokens, setFormulaTokens] = useState<string[]>([]); // for undo support
  const [constInput, setConstInput] = useState<string>("");

  useEffect(() => {
    if (isOpen) {
      if (initialData) {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setAspDescription(initialData.description || "");
        setAspCompliance(initialData.complianceDescription || "");
        setAspDataSource(initialData.dataSource || "");
        setAspExpectation(initialData.expectationResult?.toString() ?? "");
        setAspFormat(initialData.expectationFormat ?? "decimal");
        setAspBuktiRequired(initialData.buktiRequired ?? true);
        setConstInput("");

        // Clear formula states
        setFormulaVariables([]);
        setRadioVariables([]);
        setFormulaExpression("");
        setFormulaTokens([]);

        if (initialData.type === "formula" && initialData.formula) {
          setFormulaVariables(initialData.formula.variables || []);
          let expr = initialData.formula.expression || "";
          const sortedConstants = [...localConstants].sort(
            (a, b) => b.expression.length - a.expression.length,
          );
          for (const lc of sortedConstants) {
            expr = expr.split(lc.expression).join(lc.label);
          }
          setFormulaExpression(expr);
          setFormulaTokens(expr.split(/\s+/).filter(Boolean));
        } else if (initialData.type === "radio") {
          setRadioVariables(initialData.radioVariables || []);
          let expr = initialData.formula?.expression || "";
          const sortedConstants = [...localConstants].sort(
            (a, b) => b.expression.length - a.expression.length,
          );
          for (const lc of sortedConstants) {
            expr = expr.split(lc.expression).join(lc.label);
          }
          setFormulaExpression(expr);
          setFormulaTokens(expr.split(/\s+/).filter(Boolean));
        }
      } else {
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
      }
    }
  }, [isOpen, initialData, localConstants]);

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

  const handleRemoveFormulaVariable = (name: string) => {
    setFormulaVariables(formulaVariables.filter((v) => v.name !== name));
    // Clear formula if it reference deleted variable to avoid compilation issues
    if (formulaExpression.includes(name)) {
      setFormulaExpression("");
      setFormulaTokens([]);
    }
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
        const name = `${base}_${suffix}`;
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

      const denomName = "Denominator_Percentage";
      const suffix = getNextLocalSuffix("Input_Numerator", localConstants);
      const numName = `Input_Numerator_${suffix}`;

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

      const suffix = getNextLocalSuffix("Input_Numerator", localConstants);
      const numName = `Input_Numerator_${suffix}`;
      const denomName = `Input_Denomerator_${suffix}`;

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

      const suffix = getNextLocalSuffix("Input_Constant", localConstants);
      const constName = `Input_Constant_${suffix}`;

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
      updated;
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

  const handleSubmit = () => {
    onSave({
      description: aspDescription,
      compliance: aspCompliance,
      dataSource: aspDataSource,
      expectation: aspExpectation,
      format: aspFormat,
      buktiRequired: aspBuktiRequired,
      formulaVariables,
      radioVariables,
      formulaExpression,
      formulaTokens,
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-2xl p-6 bg-card border border-border text-xs max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-sm font-bold text-foreground">
            {initialData
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
          {aspectType == "formula" ? (
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
          ) : null}

          <Separator className="my-2 border-border/40" />

          {/* VARIABLES MANAGEMENT ZONE */}
          {aspectType === "radio" ? null : (
            /* Variable builder for Formula aspect */
            <div className="space-y-4">
              <div className="p-3 bg-muted/20 border border-border rounded-lg space-y-2">
                <span className="font-bold text-[10px] text-primary uppercase block">
                  Definisikan Variabel Rumus
                </span>

                {/* Dynamic formula variables list */}
                {formulaVariables.filter((v) => !isInternalConstant(v.name))
                  .length === 0 ? (
                  <p className="text-muted-foreground italic text-[11px] py-1">
                    Belum ada variabel rumus. Tambahkan variabel baru.
                  </p>
                ) : (
                  <div className="flex flex-wrap gap-2 py-1">
                    {formulaVariables
                      .filter((v) => !isInternalConstant(v.name))
                      .map((v) => (
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
          {aspectType === "formula" && (
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
                  (Input akan tersimpan di Local Storage dan memunculkan tombol
                  konstanta baru di atas.)
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
                  {aspectType === "formula" &&
                    formulaVariables.filter((v) => !isInternalConstant(v.name))
                      .length === 0 && (
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
                    {formatFriendlyFormula(
                      formulaExpression,
                      formulaVariables,
                    ) || (
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
            onClick={onClose}
            className="text-xs h-9 cursor-pointer"
          >
            Batal
          </Button>
          <Button
            onClick={handleSubmit}
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
  );
}
