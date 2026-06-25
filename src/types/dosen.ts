export interface Dosen {
  nip: string;
  nama: string;
  fakultas: string;
  prodi: string;
  photoUrl?: string;
  email?: string;
}

export interface DosenPengajuan extends Dosen {
  id: string;
  status: "pending" | "approved" | "declined";
  submittedAt: string;
}

export interface LecturerModel {
  id: string;
  name: string;
  nip: string;
  email: string;
  status: "pending" | "approved" | "rejected";
  study_program: {
    id: number;
    name: string;
  };
  institute: {
    id: number;
    name: string;
  };
}

export interface LecturerListResponse {
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
  data: LecturerModel[];
}

export interface SingleLecturerResponse {
  success: boolean;
  status: number;
  message: string;
  path: string;
  timestamp: string;
  data: LecturerModel;
}

export interface SaveLecturerRequest {
  name: string;
  nip: string;
  email: string;
  study_program_id: number;
}
