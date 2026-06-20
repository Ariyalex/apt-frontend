import { Dosen, DosenPengajuan } from "@/types/dosen";

export const initialDosenList: Dosen[] = [
  {
    nip: "198503122011011002",
    nama: "Dr. H. Ahmad Rofiq, M.Ag.",
    fakultas: "Fakultas Ilmu Tarbiyah dan Keguruan",
    prodi: "Pendidikan Agama Islam",
    photoUrl: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?q=80&w=256&auto=format&fit=crop"
  },
  {
    nip: "197805232008012004",
    nama: "Fitriani, M.Kom.",
    fakultas: "Fakultas Sains dan Teknologi",
    prodi: "Teknik Informatika",
    photoUrl: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?q=80&w=256&auto=format&fit=crop"
  },
  {
    nip: "199109052020121008",
    nama: "Zainal Abidin, Ph.D.",
    fakultas: "Fakultas Ekonomi dan Bisnis Islam",
    prodi: "Perbankan Syariah",
    photoUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=256&auto=format&fit=crop"
  },
  {
    nip: "198301142010012003",
    nama: "Dr. Siti Aminah, M.A.",
    fakultas: "Fakultas Ilmu Tarbiyah dan Keguruan",
    prodi: "Pendidikan Agama Islam",
    photoUrl: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=256&auto=format&fit=crop"
  },
  {
    nip: "197511302005011001",
    nama: "Prof. Dr. Irwan, M.T.",
    fakultas: "Fakultas Sains dan Teknologi",
    prodi: "Teknik Informatika",
    photoUrl: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=256&auto=format&fit=crop"
  },
  {
    nip: "198904222019031005",
    nama: "Muhammad Yusuf, M.Pd.",
    fakultas: "Fakultas Ilmu Tarbiyah dan Keguruan",
    prodi: "PGMI",
    photoUrl: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?q=80&w=256&auto=format&fit=crop"
  },
  {
    nip: "198107152009122002",
    nama: "Dr. Lilik Herawati, M.Pd.I.",
    fakultas: "Fakultas Ilmu Tarbiyah dan Keguruan",
    prodi: "MPI",
    photoUrl: "https://images.unsplash.com/photo-1580489944761-15a19d654956?q=80&w=256&auto=format&fit=crop"
  },
  {
    nip: "199302182022031007",
    nama: "Rahmat Hidayat, M.I.Kom.",
    fakultas: "Fakultas Dakwah dan Komunikasi",
    prodi: "Komunikasi Penyiaran Islam",
    photoUrl: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?q=80&w=256&auto=format&fit=crop"
  },
  {
    nip: "198710052015032004",
    nama: "Dr. Halimah, M.Hum.",
    fakultas: "Fakultas Adab dan Ilmu Budaya",
    prodi: "Bahasa dan Sastra Arab",
    photoUrl: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?q=80&w=256&auto=format&fit=crop"
  },
  {
    nip: "198212122009011003",
    nama: "Dr. H. Sulaiman, M.H.",
    fakultas: "Fakultas Syariah dan Hukum",
    prodi: "Hukum Ekonomi Syariah",
    photoUrl: "https://images.unsplash.com/photo-1560250097-0b93528c311a?q=80&w=256&auto=format&fit=crop"
  },
  {
    nip: "199505242024011009",
    nama: "Fadel Muhammad, M.Hum.",
    fakultas: "Fakultas Ilmu Tarbiyah dan Keguruan",
    prodi: "Tadris Bahasa Inggris",
    photoUrl: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=256&auto=format&fit=crop"
  },
  {
    nip: "197208141999032001",
    nama: "Prof. Dr. Rahmawati, M.Ag.",
    fakultas: "Fakultas Ilmu Tarbiyah dan Keguruan",
    prodi: "Pendidikan Agama Islam",
    photoUrl: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?q=80&w=256&auto=format&fit=crop"
  },
  {
    nip: "198610052014021003",
    nama: "Nurhadi, M.T.",
    fakultas: "Fakultas Sains dan Teknologi",
    prodi: "Teknik Informatika",
    photoUrl: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?q=80&w=256&auto=format&fit=crop"
  },
  {
    nip: "199011122020122011",
    nama: "Aisyah, M.E.",
    fakultas: "Fakultas Ekonomi dan Bisnis Islam",
    prodi: "Perbankan Syariah",
    photoUrl: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=256&auto=format&fit=crop"
  },
  {
    nip: "198409252011012008",
    nama: "Dr. Khadijah, M.H.",
    fakultas: "Fakultas Syariah dan Hukum",
    prodi: "Hukum Keluarga Islam",
    photoUrl: "https://images.unsplash.com/photo-1580489944761-15a19d654956?q=80&w=256&auto=format&fit=crop"
  }
];

export const initialDosenPengajuanList: DosenPengajuan[] = [
  {
    id: "pengajuan-1",
    nip: "199201012025011001",
    nama: "Hendra Wijaya, M.T.",
    fakultas: "Fakultas Sains dan Teknologi",
    prodi: "Teknik Informatika",
    status: "pending",
    submittedAt: "2026-06-19T08:00:00.000Z",
    photoUrl: ""
  },
  {
    id: "pengajuan-2",
    nip: "198811222018032002",
    nama: "Dr. Rina Lestari, M.Si.",
    fakultas: "Fakultas Sains dan Teknologi",
    prodi: "Teknik Informatika",
    status: "pending",
    submittedAt: "2026-06-20T09:30:00.000Z",
    photoUrl: ""
  }
];
