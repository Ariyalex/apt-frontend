import { FormulaVariable } from "@/types/mutu-banpt";

export const isInternalConstant = (name: string): boolean => {
  const lower = name.toLowerCase();
  return (
    lower.includes("numerator") ||
    lower.includes("denominator") ||
    lower.includes("denomerator") ||
    lower.includes("constant")
  );
};
export const formatFriendlyFormula = (
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
export const mapCriteria = (criteria: string): string => {
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
export const mapTarget = (target: string): string => {
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
