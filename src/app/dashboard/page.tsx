import React from "react";
import { 
  FileCheck2, 
  AlertCircle, 
  TrendingUp, 
  Activity, 
  ArrowRight 
} from "lucide-react";

export default function Dashboard() {
  const stats = [
    {
      title: "Total Audit Mutu",
      value: "12",
      description: "Tahun akademik berjalan",
      icon: FileCheck2,
      color: "text-primary",
    },
    {
      title: "Temuan / Rekomendasi",
      value: "28",
      description: "Butuh tindak lanjut",
      icon: AlertCircle,
      color: "text-amber-500",
    },
    {
      title: "Kepatuhan Standar",
      value: "94.2%",
      description: "+2.1% dari tahun lalu",
      icon: TrendingUp,
      color: "text-emerald-500",
    },
  ];

  return (
    <div className="space-y-6">
      {/* Welcome Message */}
      <div>
        <h1 className="text-xl font-bold tracking-tight text-foreground md:text-2xl">
          Dashboard Penjaminan Mutu
        </h1>
        <p className="text-xs text-muted-foreground mt-1">
          Pantau dan kelola standar mutu akademik Universitas secara real-time.
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        {stats.map((stat, i) => {
          const Icon = stat.icon;
          return (
            <div key={i} className="rounded-xl border border-border bg-card p-5 shadow-sm">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                  {stat.title}
                </span>
                <Icon className={`h-5 w-5 ${stat.color}`} />
              </div>
              <div className="mt-2 flex items-baseline gap-2">
                <span className="text-2xl font-bold tracking-tight text-foreground">
                  {stat.value}
                </span>
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                {stat.description}
              </p>
            </div>
          );
        })}
      </div>

      {/* Main Grid Content */}
      <div className="grid gap-6 md:grid-cols-3">
        {/* Recent Activities */}
        <div className="md:col-span-2 rounded-xl border border-border bg-card p-5 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xs font-bold text-foreground uppercase tracking-wider">Aktivitas Audit Terbaru</h2>
              <Activity className="h-4 w-4 text-muted-foreground" />
            </div>
            <div className="space-y-4">
              {[
                { title: "Audit Lapangan Prodi Teknik Informatika", status: "Selesai", date: "10 Juni 2026", type: "success" },
                { title: "Evaluasi Diri Prodi Pendidikan Agama Islam", status: "Sedang Berjalan", date: "08 Juni 2026", type: "warning" },
                { title: "Verifikasi Borang Fakultas Syariah", status: "Menunggu Review", date: "05 Juni 2026", type: "info" }
              ].map((item, i) => (
                <div key={i} className="flex items-center justify-between border-b border-border/40 pb-3 last:border-0 last:pb-0">
                  <div>
                    <h3 className="text-xs font-semibold text-foreground">{item.title}</h3>
                    <p className="text-xs text-muted-foreground mt-0.5">{item.date}</p>
                  </div>
                  <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${
                    item.type === "success" ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400" :
                    item.type === "warning" ? "bg-amber-500/10 text-amber-600 dark:text-amber-400" :
                    "bg-blue-500/10 text-blue-600 dark:text-blue-400"
                  }`}>
                    {item.status}
                  </span>
                </div>
              ))}
            </div>
          </div>
          <button className="mt-4 flex items-center justify-center gap-1.5 text-xs font-semibold text-primary hover:underline self-start cursor-pointer">
            Lihat semua aktivitas <ArrowRight className="h-3 w-3" />
          </button>
        </div>

        {/* Quick Links */}
        <div className="rounded-xl border border-border bg-card p-5 shadow-sm">
          <h2 className="text-xs font-bold text-foreground uppercase tracking-wider mb-4">Akses Cepat</h2>
          <div className="space-y-2">
            {[
              "Isi Borang Evaluasi Diri",
              "Unggah Laporan Audit",
              "Unduh Standar Mutu UIN",
              "Hubungi Auditor Internal"
            ].map((link, i) => (
              <button key={i} className="w-full text-left rounded-lg border border-border/50 bg-muted/20 hover:bg-muted/50 p-2.5 text-xs font-semibold text-foreground transition-colors cursor-pointer">
                {link}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
