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
