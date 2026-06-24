export interface AdminUser {
  id: string;
  name: string;
  username: string;
  password?: string;
  jenisAkun: "Auditee" | "Auditor" | "Admin" | "Assessor";
  lembaga: string;
  createdAt: string;
  status: "active" | "banned";
}

export interface AdminLembaga {
  id: string;
  nama: string;
  deskripsi: string;
  jenisLembaga: "Auditee" | "Auditor" | "Assessor" | "None";
}

export interface AdminAktivitas {
  id: string;
  username: string;
  aktivitas: string;
  waktu: string;
  ip: string;
}

export const initialAdminUsers: AdminUser[] = [
  {
    id: "usr-1",
    name: "User Auditee Sains dan Teknologi",
    username: "fakultas",
    password: "password",
    jenisAkun: "Auditee",
    lembaga: "Fakultas Sains dan Teknologi",
    createdAt: "2026-06-01",
    status: "active",
  },
  {
    id: "usr-2",
    name: "System Administrator",
    username: "admin",
    password: "password",
    jenisAkun: "Admin",
    lembaga: "Tidak Ada",
    createdAt: "2026-05-15",
    status: "active",
  },
  {
    id: "usr-3",
    name: "Dr. Siti Aminah, M.A. (Auditor)",
    username: "siti",
    password: "password",
    jenisAkun: "Auditor",
    lembaga: "Lembaga Penjaminan Mutu",
    createdAt: "2026-06-10",
    status: "active",
  },
  {
    id: "usr-4",
    name: "Budi Santoso, Ph.D. (Assessor)",
    username: "budi",
    password: "password",
    jenisAkun: "Assessor",
    lembaga: "Tidak Ada",
    createdAt: "2026-04-20",
    status: "banned",
  },
];

export const initialAdminLembaga: AdminLembaga[] = [
  {
    id: "lemb-1",
    nama: "Fakultas Sains dan Teknologi",
    deskripsi: "Mengelola rumpun program studi eksakta, teknik, dan sains murni.",
    jenisLembaga: "Auditee",
  },
  {
    id: "lemb-2",
    nama: "Fakultas Tarbiyah dan Keguruan",
    deskripsi: "Mengelola pendidikan calon guru dan tenaga kependidikan Islam.",
    jenisLembaga: "Auditee",
  },
  {
    id: "lemb-3",
    nama: "Fakultas Syariah dan Hukum",
    deskripsi: "Mengelola program studi hukum Islam, hukum umum, dan tata negara.",
    jenisLembaga: "Auditee",
  },
  {
    id: "lemb-4",
    nama: "Lembaga Penjaminan Mutu",
    deskripsi: "Pusat penjaminan mutu dan audit internal universitas secara berkala.",
    jenisLembaga: "Auditor",
  },
];

export const initialAdminAktivitas: AdminAktivitas[] = [
  {
    id: "act-1",
    username: "fakultas",
    aktivitas: "user melakukan pengisian data rekognisi baru",
    waktu: "14 Juni 2026, 14:15 WIB",
    ip: "192.168.1.102",
  },
  {
    id: "act-2",
    username: "admin",
    aktivitas: "user menambah user baru",
    waktu: "14 Juni 2026, 11:30 WIB",
    ip: "10.0.4.15",
  },
  {
    id: "act-3",
    username: "fakultas",
    aktivitas: "user mengunggah berkas bukti pendukung",
    waktu: "13 Juni 2026, 16:45 WIB",
    ip: "192.168.1.102",
  },
  {
    id: "act-4",
    username: "siti",
    aktivitas: "user memperbarui dokumen penjaminan mutu FST",
    waktu: "13 Juni 2026, 10:20 WIB",
    ip: "192.168.1.72",
  },
  {
    id: "act-5",
    username: "budi",
    aktivitas: "user mencoba masuk ke sistem (gagal)",
    waktu: "12 Juni 2026, 09:15 WIB",
    ip: "192.168.1.110",
  },
];
