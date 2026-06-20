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

export const initialSharingLinks: SharingLink[] = [
  {
    id: "link-1",
    name: "rekognisi-dosen-2026-ganjil",
    status: "active",
    expiredAt: "2026-07-31T23:59:00.000Z",
    createdAt: "2026-06-12T10:00:00.000Z",
    facultySlug: "sains-dan-teknologi",
    submissions: [
      {
        id: "sub-1",
        nip: "198503152010121002",
        nama: "Dr. Ahmad Hidayat, M.T.",
        prodi: "Teknik Informatika",
        jenisRekognisi: "Narasumber",
        tahun: "2026",
        deskripsi: "Pembicara Seminar Internasional tentang AI & IoT di Jakarta",
        linkBukti: "https://drive.google.com/file/d/1a2b3c4d5e/view",
        status: "pending",
      },
      {
        id: "sub-2",
        nip: "197808222005012001",
        nama: "Prof. Dr. Siti Aminah, M.Si.",
        prodi: "Kimia",
        jenisRekognisi: "Reviewer Jurnal",
        tahun: "2026",
        deskripsi: "Reviewer Jurnal Internasional Bereputasi Q1 Kimia Terapan",
        linkBukti: "https://scopus.com/authid/detail.uri?authorId=572049",
        status: "pending",
      },
    ],
  },
  {
    id: "link-2",
    name: "rekognisi-dosen-2025-genap",
    status: "closed",
    expiredAt: "2026-01-15T23:59:00.000Z",
    createdAt: "2025-12-01T08:30:00.000Z",
    facultySlug: "sains-dan-teknologi",
    submissions: [
      {
        id: "sub-3",
        nip: "198503152010121002",
        nama: "Dr. Ahmad Hidayat, M.T.",
        prodi: "Teknik Informatika",
        jenisRekognisi: "Tenaga Ahli",
        tahun: "2025",
        deskripsi: "Konsultan IT Pembangunan Infrastruktur Digital Kemenag RI",
        linkBukti: "https://drive.google.com/file/d/6f7g8h9i0j/view",
        status: "approved",
      },
    ],
  },
];
