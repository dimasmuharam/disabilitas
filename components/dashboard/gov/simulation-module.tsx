"use client";

import React, { useState } from "react";
import { supabase } from "@/lib/supabase";
import { 
  Calculator, Info, ShieldCheck, CheckCircle2, 
  Loader2, Accessibility, BookOpen, Users, 
  Search, FileSpreadsheet, FileText 
} from "lucide-react";
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";

// DATA MASTER: Panduan Akomodasi (Tetap Lengkap)
const ACCOMMODATION_GUIDE: Record<string, string[]> = {
  "Netra / Low Vision": [
    "Software Screen Reader (JAWS/NVDA)",
    "Dokumen dalam format digital accessible (OCR)",
    "Pemasangan Guiding Block di area kantor",
    "Papan nama ruangan dengan huruf Braille/Timbul"
  ],
  "Tuli / Wicara": [
    "Penyediaan Juru Bahasa Isyarat (JBI) untuk rapat resmi",
    "Sistem notifikasi/alarm berbasis cahaya (Visual Alert)",
    "Platform komunikasi internal berbasis teks/tulisan",
    "Pelatihan bahasa isyarat dasar bagi rekan kerja satu tim"
  ],
  "Daksa": [
    "Ramp dengan kemiringan standar (maks 7-10 derajat)",
    "Toilet aksesibel dengan handrail dan ruang putar kursi roda",
    "Meja kerja yang dapat diatur ketinggiannya (Adjustable Desk)",
    "Area parkir prioritas dekat pintu masuk utama"
  ],
  "Intelektual": [
    "Instruksi kerja tertulis yang sederhana & menggunakan alat bantu visual",
    "Metode evaluasi kinerja yang lebih aplikatif/praktik",
    "Pendampingan (Job Coaching) intensif di masa orientasi",
    "Pembagian tugas dalam tahapan-tahapan kecil yang jelas"
  ],
  "Mental": [
    "Fleksibilitas waktu istirahat jika diperlukan (Sensory/Mental Break)",
    "Pemberian feedback secara privat dan konstruktif",
    "Lingkungan kerja yang kondusif dan minim polusi suara",
    "Sistem dukungan teman sejawat (Buddy System)"
  ]
};

export default function GovSimulationModule() {
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<{
    total: number;
    disabilityGroups: { type: string; count: number }[];
    requiredAccommodations: string[];
    topCities: { city: string; count: number }[];
  } | null>(null);

  const [criteria, setCriteria] = useState({ education: "", major: "" });

  const runSimulation = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      let query = supabase.from("profiles").select("disability_type, city");
      if (criteria.education) query = query.eq("education_level", criteria.education);
      if (criteria.major) query = query.ilike("major", `%${criteria.major}%`);

      const { data, error } = await query;
      if (error) throw error;

      const disMap: Record<string, number> = {};
      const geoMap: Record<string, number> = {};
      const uniqueAccommodations = new Set<string>();

      data?.forEach(t => {
        const dType = t.disability_type || "Lainnya";
        disMap[dType] = (disMap[dType] || 0) + 1;
        const city = t.city || "Domisili Belum Set";
        geoMap[city] = (geoMap[city] || 0) + 1;
        ACCOMMODATION_GUIDE[dType]?.forEach(item => uniqueAccommodations.add(item));
      });

      setResults({
        total: data?.length || 0,
        disabilityGroups: Object.entries(disMap).map(([type, count]) => ({ type, count })),
        requiredAccommodations: Array.from(uniqueAccommodations),
        topCities: Object.entries(geoMap).map(([city, count]) => ({ city, count })).sort((a, b) => b.count - a.count).slice(0, 10)
      });
    } catch (err) { console.error(err); } finally { setLoading(false); }
  };

  // 1. EXPORT EXCEL (CSV BLOB)
  const exportExcel = () => {
    if (!results) return;
    const rows = [
      ["KATEGORI", "DETAIL", "JUMLAH"],
      ["Total Potensi", "Nasional", results.total],
      ...results.disabilityGroups.map(g => ["Ragam Disabilitas", g.type, g.count]),
      ...results.topCities.map(c => ["Konsentrasi Wilayah", c.city, c.count]),
      ...results.requiredAccommodations.map(a => ["Kebutuhan Akomodasi", a, "Wajib Disiapkan"])
    ];
    const csvContent = "data:text/csv;charset=utf-8," + rows.map(e => e.join(",")).join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `Simulasi_CASN_${criteria.major || 'Nasional'}.csv`);
    document.body.appendChild(link);
    link.click();
  };

  // 2. EXPORT PDF BONAFIT (jsPDF)
  const exportPDF = () => {
    if (!results) return;
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();

    // Header Kop
    doc.addImage("/logo.png", "PNG", 14, 10, 25, 10);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(14);
    doc.text("LAPORAN ANALISIS PERENCANAAN FORMASI INKLUSIF", pageWidth / 2, 18, { align: "center" });
    doc.setFontSize(9);
    doc.setFont("helvetica", "normal");
    doc.text("Diterbitkan secara resmi melalui sistem disabilitas.com", pageWidth / 2, 24, { align: "center" });
    doc.line(14, 28, pageWidth - 14, 28);

    // Params
    doc.setFontSize(10);
    doc.text(`Pendidikan: ${criteria.education || 'Semua'}`, 14, 38);
    doc.text(`Jurusan: ${criteria.major || 'Semua Jurusan'}`, 14, 44);
    doc.text(`Tanggal Cetak: ${new Date().toLocaleDateString('id-ID')}`, 14, 50);

    // Total Count Box
    doc.setFillColor(15, 23, 42);
    doc.rect(14, 55, pageWidth - 28, 15, "F");
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(11);
    doc.text(`TOTAL POTENSI TALENTA TERDETEKSI: ${results.total} JIWA`, pageWidth / 2, 65, { align: "center" });
    doc.setTextColor(0, 0, 0);

    // Table Wilayah
    doc.setFont("helvetica", "bold");
    doc.text("Top 10 Konsentrasi Wilayah Talenta:", 14, 82);
    autoTable(doc, {
      startY: 85,
      head: [["Peringkat", "Kota / Kabupaten", "Jumlah"]],
      body: results.topCities.map((c, i) => [i + 1, c.city, `${c.count} Org`]),
      theme: "striped",
      headStyles: { fillColor: [59, 130, 246] }
    });

    // Table Akomodasi
    const finalY = (doc as any).lastAutoTable.finalY;
    doc.text("Rekomendasi Akomodasi & Aksesibilitas:", 14, finalY + 15);
    autoTable(doc, {
      startY: finalY + 18,
      body: results.requiredAccommodations.map(a => [a]),
      styles: { fontSize: 8 }
    });

    // QR Code Verifikasi
    const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=100x100&data=https://disabilitas.com/verify-sim/${new Date().getTime()}`;
    const bottomY = doc.internal.pageSize.getHeight() - 40;
    doc.addImage(qrCodeUrl, "JPEG", pageWidth - 35, bottomY, 20, 20);
    doc.setFontSize(7);
    doc.text("Validasi Sistem", pageWidth - 25, bottomY + 25, { align: "center" });

    doc.save(`Laporan_Simulasi_CASN.pdf`);
  };

  return (
    <div className="space-y-10 pb-20 duration-700 animate-in fade-in">
      {/* 1. INPUT PANEL */}
      <section className="rounded-[2.5rem] border-4 border-slate-900 bg-white p-8 shadow-[12px_12px_0px_0px_rgba(15,23,42,1)]">
        <div className="mb-8 flex items-center gap-4 border-b-4 border-slate-100 pb-6">
          <div className="bg-purple-600 p-4 rounded-2xl text-white shadow-[4px_4px_0px_0px_rgba(15,23,42,1)]">
            <Accessibility size={32} />
          </div>
          <div>
            <h2 className="text-2xl font-black uppercase italic text-slate-900">Simulator Perencanaan Formasi</h2>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Analisis ketersediaan talenta & kebutuhan akomodasi nasional</p>
          </div>
        </div>

        <form onSubmit={runSimulation} className="grid gap-6 md:grid-cols-3">
          <div className="space-y-2">
            <label htmlFor="sim-edu" className="text-[10px] font-black uppercase text-slate-500">Pendidikan</label>
            <select id="sim-edu" className="w-full rounded-2xl border-4 border-slate-900 bg-slate-50 p-4 font-bold outline-none focus:ring-4 focus:ring-purple-100" value={criteria.education} onChange={(e) => setCriteria({...criteria, education: e.target.value})}>
              <option value="">Semua Jenjang</option><option value="S1">S1 / Sarjana</option><option value="D3">D3 / Diploma</option><option value="SMA">SMA / Sederajat</option>
            </select>
          </div>
          <div className="space-y-2">
            <label htmlFor="sim-major" className="text-[10px] font-black uppercase text-slate-500">Jurusan</label>
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input id="sim-major" type="text" placeholder="Contoh: Akuntansi" className="w-full rounded-2xl border-4 border-slate-900 p-4 pl-12 font-bold outline-none focus:ring-4 focus:ring-purple-100" value={criteria.major} onChange={(e) => setCriteria({...criteria, major: e.target.value})} />
            </div>
          </div>
          <div className="flex items-end">
            <button type="submit" disabled={loading} className="w-full rounded-2xl bg-slate-900 py-4 font-black uppercase italic text-white shadow-[4px_4px_0px_0px_rgba(59,130,246,1)] flex items-center justify-center gap-2">
              {loading ? <Loader2 className="animate-spin" /> : <Calculator size={20} />} Jalankan Simulasi
            </button>
          </div>
        </form>
      </section>

      {/* 2. RESULTS */}
      {results && (
        <div className="space-y-8">
          <div className="flex justify-end gap-3">
            <button onClick={exportExcel} className="flex items-center gap-2 rounded-xl border-4 border-slate-900 bg-emerald-400 px-6 py-3 text-[10px] font-black uppercase italic shadow-[4px_4px_0px_0px_rgba(15,23,42,1)] hover:translate-y-1 hover:shadow-none transition-all">
              <FileSpreadsheet size={18} /> Export Excel
            </button>
            <button onClick={exportPDF} className="flex items-center gap-2 rounded-xl border-4 border-slate-900 bg-white px-6 py-3 text-[10px] font-black uppercase italic shadow-[4px_4px_0px_0px_rgba(15,23,42,1)] hover:translate-y-1 hover:shadow-none transition-all">
              <FileText size={18} /> Laporan PDF Resmi
            </button>
          </div>

          <div className="grid gap-8 lg:grid-cols-3">
            <div className="rounded-[2.5rem] border-4 border-slate-900 bg-slate-900 p-8 text-white shadow-[12px_12px_0px_0px_rgba(59,130,246,1)]">
              <p className="text-[10px] font-black uppercase tracking-widest opacity-60">Potensi Kandidat</p>
              <h3 className="text-7xl font-black italic my-2">{results.total} <span className="text-xl">Org</span></h3>
              <p className="text-xs font-bold text-blue-400 italic">SIAP MENGISI FORMASI</p>
            </div>

            <div className="rounded-[2.5rem] border-4 border-slate-900 bg-white p-8 shadow-[12px_12px_0px_0px_rgba(15,23,42,1)]">
              <h3 className="mb-6 flex items-center gap-2 font-black uppercase italic text-slate-900"><Users size={20} className="text-blue-600" /> Wilayah Terbanyak</h3>
              <div className="space-y-4">
                {results.topCities.map((item, i) => (
                  <div key={i} className="flex items-center justify-between border-b-2 border-slate-50 pb-2">
                    <span className="text-xs font-black uppercase italic">{item.city}</span>
                    <span className="rounded-lg bg-slate-100 px-3 py-1 text-xs font-black">{item.count}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-[2.5rem] border-4 border-slate-900 bg-white p-8 shadow-[12px_12px_0px_0px_rgba(15,23,42,1)]">
              <h3 className="mb-6 flex items-center gap-2 font-black uppercase italic text-slate-900"><ShieldCheck className="text-emerald-500" /> Akomodasi Wajib</h3>
              <div className="space-y-3">
                {results.requiredAccommodations.slice(0, 8).map((item, i) => (
                  <div key={i} className="flex items-start gap-3 rounded-xl border-2 border-slate-100 bg-slate-50 p-2 text-[10px] font-bold">
                    <CheckCircle2 size={14} className="text-emerald-500 shrink-0" /> {item}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}