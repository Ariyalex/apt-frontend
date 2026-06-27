export interface StudyProgramModel {
  id: number;
  name: string;
  description: string;
  institute: {
    id: number;
    name: string;
  };
}

export interface StudyProgramResponse {
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
  data: StudyProgramModel[];
}

export interface SingleStudyProgramResponse {
  success: boolean;
  status: number;
  message: string;
  path: string;
  timestamp: string;
  data: StudyProgramModel;
}

export interface SaveStudyProgramRequest {
  name: string;
  description: string;
  institute_id: number;
}
