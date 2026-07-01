import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
const fileCategories = {
  image: ["jpg", "jpeg", "png"],
  document: ["pdf", "xlsx", "xls", "doc", "docx", "docs"],
  file: ["zip"], // atau bisa disebut 'archive'
};

// Contoh penggunaan untuk mengecek kategori suatu file:
export function getFileCategory(extension: string): string | null {
  const ext = extension.toLowerCase();

  if (fileCategories.image.includes(ext)) return "image";
  if (fileCategories.document.includes(ext)) return "document";
  if (fileCategories.file.includes(ext)) return "file";

  return null;
}

export function formatCategoryName(criteria: string): string {
  switch (criteria) {
    case "budaya-mutu":
      return "Budaya Mutu";
    case "relevansi-pendidikan":
      return "Relevansi Pendidikan";
    case "relevansi-penelitian":
      return "Relevansi Penelitian";
    case "relevansi-pkm":
      return "Relevansi PKM";
    case "akuntabilitas":
      return "Akuntabilitas";
    case "diferensiasi-misi":
      return "Diferensiasi Misi";
    default:
      return criteria
        .split("-")
        .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
        .join(" ");
  }
}

export function formatStageName(stage: string): string {
  switch (stage) {
    case "masukan":
      return "Masukan";
    case "proses":
      return "Proses";
    case "luaran":
      return "Luaran";
    case "dampak":
      return "Dampak";
    default:
      return stage.charAt(0).toUpperCase() + stage.slice(1);
  }
}
