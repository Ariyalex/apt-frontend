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

export interface PaginatedRecognitionResponse {
  success: boolean;
  status: number;
  message: string;
  path: string;
  timestamp: string;
  meta?: {
    current_page: number;
    limit_page: number;
    total_items: number;
    total_pages: number;
  };
  data: RecognitionModel[];
}

export interface SaveRecognitionRequest {
  lecturer_id: string;
  category_id: number;
  obtained_at: string;
  description: string;
  proof_links: string[];
  link_id?: string | null;
}
