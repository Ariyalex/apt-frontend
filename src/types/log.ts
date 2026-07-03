
export interface PaginatedApiResponse<T> {
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
  data: T;
}

export interface LogModel {
  id: string;
  activity: string;
  user_id: string;
  user_username: string;
  created_at: string;
}

export interface GetLogsParams {
  user_id?: string;
  username?: string;
  created_at?: string;
  page?: number;
  limit?: number;
}
