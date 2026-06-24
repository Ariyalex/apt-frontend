export interface Dosen {
  nip: string;
  nama: string;
  fakultas: string;
  prodi: string;
  photoUrl?: string;
  email?: string;
}

export interface DosenPengajuan extends Dosen {
  id: string;
  status: "pending" | "approved" | "declined";
  submittedAt: string;
}
