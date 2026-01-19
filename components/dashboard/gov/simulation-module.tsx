"use client";

import React, { useState } from "react";
import { supabase } from "@/lib/supabase";
import { 
  Calculator, ShieldCheck, CheckCircle2, 
  Loader2, Users, Search, FileText, Globe, Info
} from "lucide-react";
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";

// SINKRONISASI: Mengacu pada Single Source of Truth
import { DISABILITY_TYPES, EDUCATION_LEVELS } from "@/lib/data-static";

// Pemetaan Akomodasi Berdasarkan Master Data-Static
// Menggunakan .find agar fleksibel jika ada perubahan teks kecil di data-static
const ACCOMMODATION_GUIDE: Record<string, string[]> = {
  [DISABILITY_TYPES.find(t => t.includes("Netra")) || "Netra / Low Vision"]: [
    "Software Screen Reader (JAWS/NVDA) berlisensi",
    "Dokumen ujian/kerja format digital accessible (OCR)",
    "Pemasangan Guiding Block di seluruh area gedung",
    "Papan nama ruangan dengan huruf Braille/Timbul"
  ],
  [DISABILITY_TYPES.find(t => t.includes("Tuli")) || "Tuli / Wicara"]: [
    "Penyediaan Juru Bahasa Isyarat (JBI) untuk diklat & rapat",
    "Sistem alarm/notifikasi berbasis cahaya (Visual Alert)",
    "Platform komunikasi internal berbasis teks resmi",
    "Pelatihan bahasa isyarat dasar bagi unit kerja terkait"
  ],
  [DISABILITY_TYPES.find(t => t.includes("Daksa")) || "Daksa"]: [
    "Ramp dengan kemiringan standar (maks 10 derajat)",
    "Toilet aksesibel dengan handrail & ruang putar kursi roda",
    "Meja kerja yang dapat diatur ketinggiannya (Adjustable)",
    "Area parkir prioritas di dekat akses pintu utama"
  ],
  [DISABILITY_TYPES.find(t => t.includes("Intelektual")) || "Intelektual"]: [
    "Instruksi kerja visual dan bahasa yang sederhana",
    "Metode evaluasi kinerja berbasis praktik langsung",
    "Pendampingan (Job Coaching) intensif masa orientasi"
  ],
  [DISABILITY_TYPES.find(t => t.includes("Mental")) || "Mental / Psikososial"]: [
    "Fleksibilitas waktu istirahat (Sensory/Mental Break)",
    "Pemberian feedback secara privat dan konstruktif",
    "Lingkungan kerja kondusif dan minim polusi suara"
  ]
};

interface GovSimulationModuleProps {
  govData: any;
}

export default function GovSimulationModule({ govData }: GovSimulationModuleProps) {
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
      // LOGIKA EKSKLUSIF PUSAT: 
      // Karena hanya kementerian yang bisa akses, kita tarik data NASIONAL (Tanpa filter city/location)
      let query = supabase.from("profiles").select("disability_type, city");

      if (criteria.education) query = query.eq("education_level", criteria.education);
      if (criteria.major) query = query.ilike("major", `%${criteria.major}%`);

      const { data, error } = await query;
      if (error) throw error;

      const disMap: Record<string, number> = {};
      const geoMap: Record<string, number> = {};
      const accommodations = new Set<string>();

      data?.forEach(t => {
        const dType = t.disability_type || "Lainnya";
        disMap[dType] = (disMap[dType] || 0) + 1;
        const city = t.city || "Domisili Belum Set";
        geoMap[city] = (geoMap[city] || 0) + 1;
        
        // Mapping akomodasi berdasarkan dType yang cocok dengan key di ACCOMMODATION_GUIDE
        Object.keys(ACCOMMODATION_GUIDE).forEach(key => {
            if (dType.includes(key) || key.includes(dType)) {
                ACCOMMODATION_GUIDE[key].forEach(item => accommodations.add(item));
            }
        });
      });

      setResults({
        total: data?.length || 0,
        disabilityGroups: Object.entries(disMap).map(([type, count]) => ({ type, count })),
        requiredAccommodations: Array.from(accommodations),
        topCities: Object.entries(geoMap)
          .map(([city, count]) => ({ city, count }))
          .sort((a, b) => b.count - a.count)
          .slice(0, 10)
      });
    } catch (err) {
      console.error("Simulation Error:", err);
    } finally {
      setLoading(false);
    }
  };

  const exportPDF = () => {
    if (!results) return;
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();

    // HEADER LAPORAN (KOP RESMI)
    if (govData.official_seal_url) {
      doc.addImage(govData.official_seal_url, "PNG", 14, 10, 20, 20);
    }
    doc.setFont("helvetica", "bold").setFontSize(14);
    doc.text("LAPORAN ANALISIS PERENCANAAN FORMASI INKLUSIF", 105, 18, { align: "center" });
    doc.setFontSize(9).setFont("helvetica", "normal");
    doc.text(`Diterbitkan oleh: ${govData.name} (Level Pusat/Nasional)`, 105, 24, { align: "center" });
    doc.line(14, 32, pageWidth - 14, 32);

    // PARAMETER ANALISIS
    doc.setFontSize(10).text(`Parameter: ${criteria.major || 'Semua Jurusan'} | ${criteria.education || 'Semua Jenjang'}`, 14, 40);

    // HIGHLIGHT TOTAL
    doc.setFillColor(15, 23, 42).rect(14, 45, pageWidth - 28, 12, "F");
    doc.setTextColor(255).setFontSize(11).text(`TOTAL POTENSI TALENTA TERDETEKSI: ${results.total} JIWA`, 105, 53, { align: "center" });

    // TABEL KONSENTRASI WILAYAH
    doc.setTextColor(0).setFont("helvetica", "bold").text("10 Besar Konsentrasi Wilayah Domisili:", 14, 70);
    autoTable(doc, {
      startY: 73,
      head: [["Peringkat", "Kota / Kabupaten", "Jumlah"]],
      body: results.topCities.map((c, i) => [i + 1, c.city, `${c.count} Orang`]),
      headStyles: { fillColor: [59, 130, 246] }
    });

    // TABEL REKOMENDASI AKOMODASI
    const finalY = (doc as any).lastAutoTable.finalY;
    doc.text("Kebutuhan Akomodasi & Aksesibilitas Wajib:", 14, finalY + 15);
    autoTable(doc, {
      startY: finalY + 18,
      body: results.requiredAccommodations.map(a => [a]),
      styles: { fontSize: 8 },
      headStyles: { fillColor: [16, 185, 129] }
    });

    doc.save(`Analisis_Formasi_${govData.name}.pdf`);
  };

  return (
    <div className="space-y-10 pb-20 duration-700 animate-in fade-in">
      
      {/* 1. INPUT PANEL */}
      <section className="rounded-[2.5rem] border-4 border-slate-900 bg-white p-8 shadow-[12px_12px_0px_0px_rgba(15,23,42,1)]">
        <div className="mb-8 flex items-center gap-4 border-b-4 border-slate-100 pb-6">
          <div className="bg-indigo-600 p-4 rounded-2xl text-white shadow-[4px_4px_0px_0px_rgba(15,23,42,1)]">
            <Globe size={32} />
          </div>
          <div>
            <h2 className="text-2xl font-black uppercase italic text-slate-900">Simulator Formasi Nasional</h2>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest italic">Modul Eksklusif: {govData.name}</p>
          </div>
        </div>

        <form onSubmit={runSimulation} className="grid gap-6 md:grid-cols-3">
          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase text-slate-500 tracking-widest">Kualifikasi Pendidikan</label>
            <select 
              className="w-full rounded-2xl border-4 border-slate-900 bg-slate-50 p-4 font-bold outline-none focus:ring-4 focus:ring-indigo-100"
              value={criteria.education}
              onChange={(e) => setCriteria({...criteria, education: e.target.value})}
            >
              <option value="">Semua Jenjang</option>
              {EDUCATION_LEVELS.filter(e => e.includes("SMA") || e.includes("Diploma") || e.includes("Sarjana")).map(edu => (
                <option key={edu} value={edu}>{edu}</option>
              ))}
            </select>
          </div>
          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase text-slate-500 tracking-widest">Bidang Jurusan / Keahlian</label>
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input 
                type="text" 
                placeholder="Contoh: Akuntansi, IT..." 
                className="w-full rounded-2xl border-4 border-slate-900 p-4 pl-12 font-bold outline-none focus:ring-4 focus:ring-indigo-100"
                value={criteria.major}
                onChange={(e) => setCriteria({...criteria, major: e.target.value})}
              />
            </div>
          </div>
          <div className="flex items-end">
            <button type="submit" disabled={loading} className="w-full rounded-2xl bg-slate-900 py-4 font-black uppercase italic text-white shadow-[4px_4px_0px_0px_rgba(79,70,229,1)] hover:translate-y-1 hover:shadow-none transition-all flex items-center justify-center gap-2">
              {loading ? <Loader2 className="animate-spin" /> : <Calculator size={20} />} Jalankan Analisis
            </button>
          </div>
        </form>
      </section>

      {/* 2. RESULTS PANEL */}
      {results && (
        <div className="space-y-8 animate-in zoom-in-95 duration-500">
          <div className="flex justify-end gap-3">
            <button onClick={exportPDF} className="flex items-center gap-2 rounded-xl border-4 border-slate-900 bg-white px-6 py-3 text-[10px] font-black uppercase italic shadow-[4px_4px_0px_0px_rgba(15,23,42,1)] hover:translate-y-1 transition-all">
              <FileText size={18} /> Unduh Laporan Analisis (.PDF)
            </button>
          </div>

          <div className="grid gap-8 lg:grid-cols-3">
            {/* Total Highlight */}
            <div className="rounded-[2.5rem] border-4 border-slate-900 bg-slate-900 p-8 text-white shadow-[12px_12px_0px_0px_rgba(79,70,229,1)]">
              <p className="text-[10px] font-black uppercase tracking-widest opacity-60 italic text-blue-400">Database Nasional</p>
              <h3 className="text-7xl font-black italic my-2">{results.total} <span className="text-xl">Jiwa</span></h3>
              <p className="text-xs font-bold uppercase tracking-tighter">Potensi Pelamar Terdeteksi</p>
            </div>

            {/* Geo Distribution */}
            <div className="rounded-[2.5rem] border-4 border-slate-900 bg-white p-8 shadow-[12px_12px_0px_0px_rgba(15,23,42,1)]">
              <h3 className="mb-6 flex items-center gap-2 font-black uppercase italic text-slate-900"><Users size={20} className="text-blue-600" /> Konsentrasi Wilayah</h3>
              <div className="space-y-4 max-h-64 overflow-y-auto pr-2 custom-scrollbar">
                {results.topCities.map((item, i) => (
                  <div key={i} className="flex items-center justify-between border-b-2 border-slate-50 pb-2">
                    <span className="text-[10px] font-black uppercase italic truncate pr-4">{item.city}</span>
                    <span className="rounded-lg bg-slate-100 px-3 py-1 text-xs font-black">{item.count}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Accommodations */}
            <div className="rounded-[2.5rem] border-4 border-slate-900 bg-white p-8 shadow-[12px_12px_0px_0px_rgba(15,23,42,1)]">
              <h3 className="mb-6 flex items-center gap-2 font-black uppercase italic text-slate-900"><ShieldCheck className="text-emerald-500" /> Akomodasi Wajib</h3>
              <div className="space-y-3">
                {results.requiredAccommodations.slice(0, 6).map((item, i) => (
                  <div key={i} className="flex items-start gap-3 rounded-xl border-2 border-slate-100 bg-slate-50 p-3 text-[9px] font-bold leading-tight uppercase">
                    <CheckCircle2 size={14} className="text-emerald-500 shrink-0" /> {item}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* INFO BOX */}
      {!results && (
        <section className="flex items-start gap-4 rounded-3xl border-4 border-dashed border-slate-200 bg-slate-50 p-8">
          <Info className="text-slate-400 shrink-0" />
          <div>
            <h4 className="text-xs font-black uppercase italic text-slate-500">Petunjuk Simulasi</h4>
            <p className="mt-1 text-[11px] font-bold leading-relaxed text-slate-400">
              Modul ini menarik data dari seluruh talenta disabilitas yang terdaftar secara nasional. Gunakan filter pendidikan dan jurusan untuk melihat sebaran domisili pelamar potensial guna menentukan titik lokasi ujian atau penempatan formasi yang paling efektif.
            </p>
          </div>
        </section>
      )}
    </div>
  );
}