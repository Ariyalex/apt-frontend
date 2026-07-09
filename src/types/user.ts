export interface UserAdminModel {
  id: string;
  username: string;
  name: string;
  email: string;
  institute_id: number | null;
  role: "admin" | "upps" | "lpm" | "assessor";
  is_banned: boolean;
  must_change_password: boolean;
  created_at: string;
}

export interface AddUserRequest {
  username: string;
  email: string;
  name: string;
  institute_id: number | null;
  role: "admin" | "upps" | "lpm" | "assessor";
}

export interface EditUserRequest {
  username: string;
  email: string;
  name: string;
  institute_id: number | null;
  role: "admin" | "upps" | "lpm" | "assessor";
  is_banned: boolean;
}
