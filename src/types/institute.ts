export interface InstituteModel {
  id: number;
  name: string;
  description: string;
}

export interface InstituteResponse {
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
  data: InstituteModel[];
}

export interface SingleInstituteResponse {
  success: boolean;
  status: number;
  message: string;
  path: string;
  timestamp: string;
  data: InstituteModel;
}

export interface SaveInstituteRequest {
  name: string;
  description: string;
}
