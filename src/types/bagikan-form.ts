export interface Submission {
  id: string;
  nip: string;
  nama: string;
  prodi: string;
  jenisRekognisi: string;
  tahun: string;
  deskripsi: string;
  linkBukti: string;
  status: "pending" | "approved" | "declined";
}

export interface SharingLink {
  id: string;
  name: string; // custom identifier, e.g. "rekognisi-dosen-2026-ganjil"
  status: "active" | "closed";
  expiredAt: string; // ISO datetime string
  createdAt: string; // ISO datetime string
  submissions: Submission[];
  facultySlug: string; // e.g. "fakultas-sains-dan-teknologi"
}
