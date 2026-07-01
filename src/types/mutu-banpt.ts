export interface FormulaVariable {
  name: string; // e.g. "NDS3"
  label?: string; // e.g. "Jumlah Dosen S3"
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
  description: string; // assessment description
  complianceDescription: string; // compliance description
  dataSource: string; // data source
  proofUrl?: string; // URL if uploaded/referenced (fallback)
  proofFileName?: string; // Name of uploaded document
  buktiRequired: boolean; // Whether proof document is mandatory
  expectationResult?: number; // Expectation target value
  expectationFormat?: "decimal" | "percentage"; // Format
  score?: number; // Selected score/value (for auditing)
  selectedRadioIndex?: number; // Index of selected custom radio choice
  radioVariables?: RadioVariable[]; // Custom radio variables/choices for ordinary assessment
  formula?: FormulaData; // formula and variable inputs
  isSubmitted?: boolean; // Track submission status
}

export interface MutuBanptData {
  category: string;
  stage: string;
  indicators: IndicatorModel[];
}

export interface Accreditation {
  id: string;
  name: string;
  description: string;
  year: number;
  reference: string;
  created_at: string;
}

export interface SaveAccreditationRequest {
  name: string;
  description?: string | null;
  year: number;
  reference: string;
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
  status: "Memenuhi" | "Tidak Memenuhi";
  createdAt: string;
  updatedAt: string;
}

export interface IndicatorModel {
  id: string;
  accreditation: {
    id: string;
    name: string;
  };
  number: string;
  name: string;
  justification: string;
  criteria:
    | `quality_culture`
    | `education_relevance`
    | `research_relevance`
    | `community_service_relevance`
    | `accountability`
    | string;
  target: `input` | `process` | `output` | `impact` | string;
  updated_at: string;
  created_at: string;
  status?: "selesai" | "belum";
  aspects?: AssessmentAspect[];
}

export interface SaveIndicatorRequest {
  accreditation_id: string;
  number: string;
  name: string;
  justification: string;
  criteria:
    | `quality_culture`
    | `education_relevance`
    | `research_relevance`
    | `community_service_relevance`
    | `accountability`
    | string;
  target: `input` | `process` | `output` | `impact` | string;
}

export interface RuleVariable {
  type: "static" | "input" | string;
  val: number | string;
  var: string;
}

export interface AssessmentRule {
  id: string;
  indicator: {
    id: string;
    name: string;
  };
  assessment: string;
  fulfillment: string;
  data_source: string;
  type: "maths" | "points" | string;
  input_rules: RuleVariable[];
  formula: string;
  expectation_result: string;
  result_format: "decimal" | "percentage" | string;
  proof_required: boolean;
  updated_at: string;
  created_at: string;
}

export interface SaveAssessmentRuleRequest {
  indicator_id: string;
  assessment: string;
  fulfillment: string;
  data_source: string;
  type: "maths" | "points";
  input_rules: RuleVariable[];
  formula: string;
  expectation_result: number;
  result_format: "decimal" | "percentage" | string;
  proof_required: boolean;
}

export interface AssessmentEvaluation {
  id: string;
  user: {
    id: string;
    name: string;
    email: string;
  };
  institute: string | null;
  study_program: string | null;
  calculation_rule: {
    id: string;
    formula: string;
    expectation_result: string;
    result_format: "decimal" | "percentage" | string;
  };
  input_variables: RuleVariable[];
  calculated_result: string;
  score: string;
  proof: string | null;
  updated_at: string | null;
  created_at: string | null;
}

export interface SaveAssessmentEvaluationRequest {
  rule_id: string;
  level: "university";
  institute_id: string | null;
  study_program_id: string | null;
  proof: string;
  input_variables: RuleVariable[];
}

export interface AccreditationStats {
  accreditation_id: string;
  accreditation_name: string;
  quality_culture_input: string;
  quality_culture_process: string;
  quality_culture_output: string;
  quality_culture_impact: string;
  quality_culture_total: string;
  education_relevance_input: string;
  education_relevance_process: string;
  education_relevance_output: string;
  education_relevance_impact: string;
  education_relevance_total: string;
  research_relevance_input: string;
  research_relevance_process: string;
  research_relevance_output: string;
  research_relevance_impact: string;
  research_relevance_total: string;
  community_service_relevance_input: string;
  community_service_relevance_process: string;
  community_service_relevance_output: string;
  community_service_relevance_impact: string;
  community_service_relevance_total: string;
  accountability_input: string;
  accountability_process: string;
  accountability_output: string;
  accountability_impact: string;
  accountability_total: string;
  mission_differentiation_input: string;
  mission_differentiation_process: string;
  mission_differentiation_output: string;
  mission_differentiation_impact: string;
  mission_differentiation_total: string;
  accreditation_total: string;
}

export interface IndicatorStatItem {
  accreditation_id: string;
  indicator_id: string;
  number: string;
  name: string;
  criteria:
    | "quality_culture"
    | "education_relevance"
    | "research_relevance"
    | "community_service_relevance"
    | "accountability"
    | "mission_differentiation";
  target: "input" | "process" | "output" | "impact";
  assessment: string;
  fulfillment: string;
  score: string;
}
