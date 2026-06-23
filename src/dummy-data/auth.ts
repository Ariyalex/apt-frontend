import { UserAuth } from "@/types/auth";

export const initialAuthUsers: UserAuth[] = [
  {
    id: "019ee080-add5-79ad-9196-789f00a16b09",
    username: "admin",
    name: "admin",
    email: "admin@teknohole.com",
    institute_id: null,
    role: "admin",
    is_banned: false,
    must_change_password: true,
    created_at: "2026-06-19T15:29:50.036180Z"
  },
  {
    id: "019ee080-add5-79ad-9196-789f00a16b10",
    username: "fakultas",
    name: "Ahmad Fauzi",
    email: "fauzi@teknohole.com",
    institute_id: "FST",
    role: "Auditee",
    is_banned: false,
    must_change_password: true,
    created_at: "2026-06-19T15:29:50.036180Z"
  },
  {
    id: "019ee080-add5-79ad-9196-789f00a16b11",
    username: "auditor",
    name: "Budi Santoso",
    email: "budi@teknohole.com",
    institute_id: null,
    role: "Auditor",
    is_banned: false,
    must_change_password: true,
    created_at: "2026-06-19T15:29:50.036180Z"
  },
  {
    id: "019ee080-add5-79ad-9196-789f00a16b12",
    username: "assessor",
    name: "Dr. Diana Putri",
    email: "diana@teknohole.com",
    institute_id: null,
    role: "Assessor",
    is_banned: false,
    must_change_password: true,
    created_at: "2026-06-19T15:29:50.036180Z"
  }
];

export const updatePasswordStatus = (username: string, mustChange: boolean): void => {
  const user = initialAuthUsers.find((u) => u.username === username);
  if (user) {
    user.must_change_password = mustChange;
  }
};
