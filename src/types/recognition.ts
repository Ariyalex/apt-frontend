import type { LecturerModel } from "./dosen";
import type { RecognitionCategoryModel } from "./recognition-category";

export interface RecognitionModel {
  id: string;
  lecturer: LecturerModel;
  category: RecognitionCategoryModel;
  obtained_at: string;
  description: string;
  proof_links: string[];
  link_id?: string | null;
  status?: "pending" | "approved" | "rejected" | string;
  created_at: string;
}

export interface SaveRecognitionRequest {
  lecturer_id: string;
  category_id: number;
  obtained_at: string;
  description: string;
  proof_links: string[];
  link_id?: string | null;
}
