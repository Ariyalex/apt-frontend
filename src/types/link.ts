export interface LinkModel {
  id: string;
  name: string;
  slug: string;
  description: string;
  is_active: boolean;
  institute_id: number;
  started_at: string;
  ended_at: string;
  created_at: string;
}

export interface SaveLinkRequest {
  name: string;
  slug: string;
  description: string;
  is_active: boolean;
  started_at: string;
  ended_at: string;
}
