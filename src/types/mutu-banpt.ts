export interface FormulaVariable {
  name: string; // e.g. "NDS3"
  label: string; // e.g. "Jumlah Dosen S3"
  type: "input" | "static";
  value: number;
}

export interface RadioVariable {
  name: string; // e.g. "Unggul" (acts as label)
  value: number; // e.g. 4 (acts as value/point)
}

export interface FormulaData {
  expression: string;
  variables: FormulaVariable[];
  targetVariable: string;
  threshold: number; // threshold value to compare
}

export interface AssessmentAspect {
  id: string;
  type: "radio" | "formula";
  description: string;           // assessment description
  complianceDescription: string;     // compliance description
  dataSource: string;              // data source
  proofUrl?: string;               // URL if uploaded/referenced (fallback)
  proofFileName?: string;          // Name of uploaded document
  buktiRequired: boolean;          // Whether proof document is mandatory
  expectationResult?: number;      // Expectation target value
  expectationFormat?: "decimal" | "percentage"; // Format
  score?: number;                  // Selected score/value (for auditing)
  selectedRadioIndex?: number;     // Index of selected custom radio choice
  radioVariables?: RadioVariable[]; // Custom radio variables/choices for ordinary assessment
  formula?: FormulaData;           // formula and variable inputs
  isSubmitted?: boolean;           // Track submission status
}

export interface IndicatorTab {
  id: number; // 1 - 4
  title: string; // e.g. "Indikator 1"
  status: "selesai" | "belum";
  justifikasi: string;
  indikatorDescription: string;
  aspects: AssessmentAspect[];
}

export interface MutuBanptData {
  category: string;
  stage: string;
  indicators: IndicatorTab[];
}

export interface Akreditasi {
  id: string;
  nama: string;
  deskripsi: string;
  tahun: string;
  referensi: string; // uploaded reference file name
}

export interface LocalConstant {
  label: string;
  expression: string;
  variables: FormulaVariable[];
}

export interface AspectSubmission {
  id: string;
  nama: string; // e.g. "Program Studi Teknik Informatika"
  bukti: string; // URL/Link to proof document
  expectationScore: number;
  score: number;
  status: "Selesai" | "Belum Selesai";
  createdAt: string;
  updatedAt: string;
}
