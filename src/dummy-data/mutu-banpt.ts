import { MutuBanptData, IndicatorTab, Akreditasi, AspectSubmission } from "@/types/mutu-banpt";

export function formatCategoryName(category: string): string {
  switch (category) {
    case "budaya-mutu":
      return "Budaya Mutu";
    case "relevansi-pendidikan":
      return "Relevansi Pendidikan";
    case "relevansi-penelitian":
      return "Relevansi Penelitian";
    case "relevansi-pkm":
      return "Relevansi PKM";
    case "akuntabilitas":
      return "Akuntabilitas";
    default:
      return category
        .split("-")
        .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
        .join(" ");
  }
}

export function formatStageName(stage: string): string {
  switch (stage) {
    case "masukan":
      return "Masukan";
    case "proses":
      return "Proses";
    case "luaran":
      return "Luaran";
    case "dampak":
      return "Dampak";
    default:
      return stage.charAt(0).toUpperCase() + stage.slice(1);
  }
}

// Initial dummy list of accreditations
export const defaultAkreditasiList: Akreditasi[] = [
  {
    id: "akred-1",
    nama: "Akreditasi BANPT 2026 - UIN Sunan Kalijaga",
    deskripsi: "Evaluasi dan penilaian akreditasi institusi tahun ajaran 2026/2027.",
    tahun: "2026",
    referensi: "panduan_spmi_2026.pdf",
  },
  {
    id: "akred-2",
    nama: "Akreditasi Unggul Program Studi 2025",
    deskripsi: "Instrumen penilaian akreditasi kriteria 9 untuk program studi sarjana.",
    tahun: "2025",
    referensi: "sk_rektor_mutu_2025.xlsx",
  },
];

const IS_BROWSER = typeof window !== "undefined";

export function getStoredAkreditasi(): Akreditasi[] {
  if (!IS_BROWSER) return defaultAkreditasiList;
  const stored = localStorage.getItem("dummy_akreditasi_list");
  if (stored) {
    try {
      return JSON.parse(stored);
    } catch {
      return defaultAkreditasiList;
    }
  }
  localStorage.setItem("dummy_akreditasi_list", JSON.stringify(defaultAkreditasiList));
  return defaultAkreditasiList;
}

export function saveStoredAkreditasi(list: Akreditasi[]) {
  if (IS_BROWSER) {
    localStorage.setItem("dummy_akreditasi_list", JSON.stringify(list));
    window.dispatchEvent(new Event("akreditasi_list_change"));
  }
}

// Default indicator data generator
export function getDefaultIndicators(category: string, stage: string): IndicatorTab[] {
  const catLabel = formatCategoryName(category);
  const stageLabel = formatStageName(stage);

  return [
    {
      id: 1,
      title: "Indikator 1",
      status: "selesai",
      justifikasi: `Permendikbudristek No. 39/2025, pasal 67. PerBANPT No. 21/2025 tentang Evaluasi Mutu Eksternal.`,
      indikatorDescription: `Sistem Penjaminan Mutu Internal (SPMI) bidang ${catLabel} pada tahap ${stageLabel} yang dikembangkan oleh Perguruan Tinggi dengan menerapkan tata kelola perguruan tinggi yang baik dan diimplementasikan secara akuntabel, transparan, nirlaba, efektif, dan efisien.`,
      aspects: [
        {
          id: `${category}-${stage}-ind1-asp1`,
          type: "radio",
          description: `Sistem Penjaminan Mutu Internal yang dikembangkan Perguruan Tinggi, mencakup:
1. Standar Pendidikan Tinggi (akademik dan non akademik yang melampauai SN Dikti dan mengacu pada pedoman Ditjen Dikti, telah ditetapkan oleh perguruan tinggi serta telah disosialisasikan ke seluruh pemangku kepentingan.
2. Sistem Tatakelola Perguruan Tinggi dalam mengimplementasikan SPMI, mencakup minimal: SOP implementasi SPMI, keberfungsian SPMI di berbagai tingkat (pelaksana and sistem implementasi) yang akuntabel, transparan dan telah diimplementasikan secara konsisten paling sedikit selama 3 tahun.
3. Sistem Evaluasi Pemenuhan Standar Pendidikan Tinggi yang transparan, akuntabel, mapan dan telah diimplementasikan secara konsisten paling sedikit selama 3 tahun.
4. Sistem Peningkatan Mutu Berkelanjutan yang telah diimplementasikan secara efektif dan efisien paling sedikit selama 3 tahun.`,
          complianceDescription: `Perguruan tinggi terbukti telah mengembangkan dan mengimplementasikan Sistem Penjaminan Mutu Internal yang mencakup keempat aspek dan telah terbukti efektif dalam peningkatan mutu pendidikan secara berkelanjutan.
Syarat perlu status terakreditasi Unggul`,
          dataSource: "Sistem Informasi SPMI Universitas / LPM",
          buktiRequired: true,
          expectationResult: 3,
          expectationFormat: "decimal",
          proofFileName: "spmi_laporan_lpm_2025.pdf",
          selectedRadioIndex: 1, // Baik (3)
          isSubmitted: true,
          radioVariables: [
            { name: "Kurang", value: 1 },
            { name: "Baik", value: 3 },
            { name: "Unggul", value: 4 },
          ],
          formula: {
            expression: "Kurang + Baik + Unggul",
            targetVariable: "Hasil",
            threshold: 3,
            variables: [
              { name: "Kurang", label: "Kurang", type: "static", value: 0 },
              { name: "Baik", label: "Baik", type: "static", value: 3 },
              { name: "Unggul", label: "Unggul", type: "static", value: 0 },
            ],
          },
        },
        {
          id: `${category}-${stage}-ind1-asp2`,
          type: "formula",
          description: `Rasio dosen tetap berkualifikasi doktor (S3) terhadap total dosen tetap pada lingkup bidang ${catLabel}.`,
          complianceDescription: `Persentase dosen tetap berpendidikan S3 minimal mencapai 40% dari total dosen tetap.`,
          dataSource: "Website LPPM / Kepegawaian",
          buktiRequired: true,
          expectationResult: 40,
          expectationFormat: "percentage",
          proofFileName: "simpeg_rekap_dosen_2025.xlsx",
          isSubmitted: true,
          formula: {
            expression: "PDD = (NDS3 / NDT) * 100%",
            targetVariable: "PDD",
            threshold: 40,
            variables: [
              { name: "NDS3", label: "Jumlah Dosen S3", type: "input", value: 15 },
              { name: "NDT", label: "Total Dosen Tetap", type: "input", value: 30 },
            ],
          },
        },
      ],
    },
    {
      id: 2,
      title: "Indikator 2",
      status: "belum",
      justifikasi: `Ketetapan Rektor UIN Sunan Kalijaga No. 102/2026 mengenai Rencana Strategis Penjaminan Mutu Akademik.`,
      indikatorDescription: `Kelengkapan dokumen kurikulum dan peta jalan kegiatan strategis terkait program kerja ${catLabel} di unit kerja pada tahap ${stageLabel} sesuai standar SN-Dikti.`,
      aspects: [
        {
          id: `${category}-${stage}-ind2-asp1`,
          type: "radio",
          description: `Ketersediaan dokumen kurikulum berbasis Outcome-Based Education (OBE) dan peta jalan yang selaras dengan program strategis universitas.`,
          complianceDescription: `Dokumen kurikulum OBE lengkap tersedia untuk seluruh program studi dan diunggah di repositori institusi.`,
          dataSource: "Sistem Informasi Akademik / LPM",
          buktiRequired: false,
          expectationResult: 3,
          expectationFormat: "decimal",
          radioVariables: [
            { name: "Cukup", value: 2 },
            { name: "Baik", value: 3 },
            { name: "Sangat Baik", value: 4 },
          ],
          formula: {
            expression: "Cukup + Baik + Sangat_Baik",
            targetVariable: "Hasil",
            threshold: 3,
            variables: [
              { name: "Cukup", label: "Cukup", type: "static", value: 0 },
              { name: "Baik", label: "Baik", type: "static", value: 0 },
              { name: "Sangat_Baik", label: "Sangat Baik", type: "static", value: 0 },
            ],
          },
        },
      ],
    },
  ];
}

export function getMutuBanptData(
  category: string,
  stage: string,
  akreditasiId: string
): MutuBanptData {
  if (!IS_BROWSER) {
    return {
      category,
      stage,
      indicators: getDefaultIndicators(category, stage),
    };
  }

  const key = `mutu_banpt_data_${akreditasiId}_${category}_${stage}`;
  const stored = localStorage.getItem(key);
  if (stored) {
    try {
      return JSON.parse(stored);
    } catch {
      // ignore
    }
  }

  const defaultData: MutuBanptData = {
    category,
    stage,
    indicators: getDefaultIndicators(category, stage),
  };
  localStorage.setItem(key, JSON.stringify(defaultData));
  return defaultData;
}

export function saveMutuBanptData(
  category: string,
  stage: string,
  akreditasiId: string,
  data: MutuBanptData
) {
  if (IS_BROWSER) {
    const key = `mutu_banpt_data_${akreditasiId}_${category}_${stage}`;
    localStorage.setItem(key, JSON.stringify(data));
    window.dispatchEvent(
      new CustomEvent("mutu_banpt_change", {
        detail: { category, stage, akreditasiId },
      })
    );
  }
}

export function getSubmissionsForAspect(aspectId: string): AspectSubmission[] {
  return [
    {
      id: `${aspectId}-sub-1`,
      nama: "Program Studi Teknik Informatika",
      bukti: "http://drive.google.com/spmi-ti-dokumen",
      expectationScore: 4,
      score: 4,
      status: "Selesai",
      createdAt: "2026-06-20 09:00",
      updatedAt: "2026-06-25 14:30",
    },
    {
      id: `${aspectId}-sub-2`,
      nama: "Program Studi Sistem Informasi",
      bukti: "http://drive.google.com/spmi-si-laporan",
      expectationScore: 4,
      score: 3,
      status: "Selesai",
      createdAt: "2026-06-21 10:15",
      updatedAt: "2026-06-24 16:00",
    },
  ];
}
