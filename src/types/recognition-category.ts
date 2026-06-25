export interface RecognitionCategoryModel {
  id: number;
  name: string;
  description: string;
}

export interface RecognitionCategoryResponse {
  success: boolean;
  status: number;
  message: string;
  path: string;
  timestamp: string;
  data: RecognitionCategoryModel[];
}

export interface SingleRecognitionCategoryResponse {
  success: boolean;
  status: number;
  message: string;
  path: string;
  timestamp: string;
  data: RecognitionCategoryModel;
}

export interface SaveRecognitionCategoryRequest {
  name: string;
  description: string;
}
