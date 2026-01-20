"use client";

import React, { useState, useMemo } from "react";
import { supabase } from "@/lib/supabase";
import { 
  Calculator, ShieldCheck, CheckCircle2, 
  Loader2, Users, Search, FileText, Globe, 
  Map, Lightbulb, GraduationCap
} from "lucide-react";
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";

// SINGLE SOURCE OF TRUTH
import { 
  DISABILITY_TYPES, 
  EDUCATION_LEVELS, 
  UNIVERSITY_MAJORS,
  PROVINCE_LIST,
  PROVINCE_MAP
} from "@/lib/data-static";

const ACCOMMODATION_GUIDE: Record<string, string[]> = {
  [DISABILITY_TYPES.find(t => t.includes("Netra")) || "Netra"]: [
    "Software Screen Reader (JAWS/NVDA)", "Dokumen Digital Accessible (OCR)", "Guiding Block", "Papan Braille"
  ],
  [DISABILITY_TYPES.find(t => t.includes("Tuli")) || "Tuli"]: [
    "Juru Bahasa Isyarat (JBI)", "Visual Alert System", "Komunikasi Berbasis Teks", "Pelatihan Isyarat Dasar"
  ],
  [DISABILITY_TYPES.find(t => t.includes("Daksa")) || "Daksa"]: [
    "Ramp & Lift Aksesibel", "Toilet Disabilitas", "Meja Kerja Adjustable", "Parkir Prioritas"
  ],
  [DISABILITY_TYPES.find(t => t.includes("Intelektual")) || "Intelektual"]: [
    "Instruksi Visual Sederhana", "Job Coaching Intensif", "Metode Evaluasi Praktik"
  ],
  [DISABILITY_TYPES.find(t => t.includes("Mental")) || "Mental"]: [
    "Sensory/Mental Break", "Feedback Privat", "Buddy System", "Lingkungan Kondusif"
  ]
};

export default function GovSimulationModule({ govData }: { govData: any }) {
  const [loading, setLoading] = useState(false);
  const [criteria, setCriteria] = useState({
    education: "",
    major: "",
    province: "",
    city: ""
  });

  const [results, setResults] = useState<{
    total: number;
    disabilityGroups: { type: string; count: number }[];
    requiredAccommodations: string[];
    topCities: { city: string; count: number }[];
    topSkills: { skill: string; count: number }[];
  } | null>(null);

  // List Kota dinamis berdasarkan Provinsi yang dipilih
  const availableCities = useMemo(() => {
    return criteria.province ? PROVINCE_MAP[criteria.province] || [] : [];
  }, [criteria.province]);

  const runSimulation = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      // Menarik kolom skills untuk analisis tambahan
      let query = supabase.from("profiles").select("disability_type, city, skills, major");

      // FILTER FLEKSIBEL (Hanya aktif jika diisi)
      if (criteria.education) query = query.eq("education_level", criteria.education);
      if (criteria.major) query = query.ilike("major", `%${criteria.major}%`);
      if (criteria.city) {
        query = query.eq("city", criteria.city);
      } else if (criteria.province) {
        // Jika hanya pilih provinsi, tarik semua kota di provinsi tersebut
        query = query.in("city", availableCities);
      }

      const { data, error } = await query;
      if (error) throw error;

      const disMap: Record<string, number> = {};
      const geoMap: Record<string, number> = {};
      const skillMap: Record<string, number> = {};
      const accommodations = new Set<string>();

      data?.forEach(t => {
        // 1. Mapping Disabilitas & Akomodasi
        const dType = t.disability_type || "Lainnya";
        disMap[dType] = (disMap[dType] || 0) + 1;
        Object.keys(ACCOMMODATION_GUIDE).forEach(key => {
          if (dType.includes(key)) ACCOMMODATION_GUIDE[key].forEach(a => accommodations.add(a));
        });

        // 2. Mapping Wilayah
        const city = t.city || "Tidak Terdata";
        geoMap[city] = (geoMap[city] || 0) + 1;

        // 3. Mapping Skills (Array column)
        if (Array.isArray(t.skills)) {
          t.skills.forEach((s: string) => {
            skillMap[s] = (skillMap[s] || 0) + 1;
          });
        }
      });

      setResults({
        total: data?.length || 0,
        disabilityGroups: Object.entries(disMap).map(([type, count]) => ({ type, count })),
        requiredAccommodations: Array.from(accommodations),
        topCities: Object.entries(geoMap).map(([city, count]) => ({ city, count })).sort((a, b) => b.count - a.count).slice(0, 10),
        topSkills: Object.entries(skillMap).map(([skill, count]) => ({ skill, count })).sort((a, b) => b.count - a.count).slice(0, 8)
      });
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-10 pb-20 duration-700 animate-in fade-in">
      {/* 1. ADVANCED FILTER PANEL */}
      <section className="rounded-[2.5rem] border-4 border-slate-900 bg-white p-8 shadow-[12px_12px_0px_0px_rgba(15,23,42,1)]">
        <div className="mb-8 flex items-center gap-4 border-b-4 border-slate-100 pb-6">
          <div className="rounded-2xl bg-indigo-600 p-4 text-white shadow-[4px_4px_0px_0px_rgba(15,23,42,1)]">
            <Globe size={32} />
          </div>
          <div>
            <h2 className="text-2xl font-black uppercase italic text-slate-900">Simulator Formasi Nasional</h2>
            <p className="text-[10px] font-bold uppercase italic tracking-widest text-slate-400">Kementerian / Lembaga Eksklusif</p>
          </div>
        </div>

        <form onSubmit={runSimulation} className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {/* Filter Pendidikan */}
          <div className="space-y-2">
            <label className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-500"><GraduationCap size={14}/> Pendidikan</label>
            <select 
              className="w-full rounded-2xl border-4 border-slate-900 bg-slate-50 p-4 font-bold outline-none focus:ring-4 focus:ring-indigo-100"
              value={criteria.education}
              onChange={(e) => setCriteria({...criteria, education: e.target.value})}
            >
              <option value="">Semua Jenjang</option>
              {EDUCATION_LEVELS.map(edu => <option key={edu} value={edu}>{edu}</option>)}
            </select>
          </div>

          {/* Searchable Major (Datalist) */}
          <div className="space-y-2">
            <label className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-500"><Search size={14}/> Cari Jurusan</label>
            <input 
              list="majors-list"
              placeholder="Ketik nama jurusan..."
              className="w-full rounded-2xl border-4 border-slate-900 p-4 font-bold outline-none focus:ring-4 focus:ring-indigo-100"
              value={criteria.major}
              onChange={(e) => setCriteria({...criteria, major: e.target.value})}
            />
            <datalist id="majors-list">
              {UNIVERSITY_MAJORS.map(m => <option key={m} value={m} />)}
            </datalist>
          </div>

          {/* Filter Provinsi */}
          <div className="space-y-2">
            <label className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-500"><Map size={14}/> Provinsi</label>
            <select 
              className="w-full rounded-2xl border-4 border-slate-900 bg-slate-50 p-4 font-bold outline-none focus:ring-4 focus:ring-indigo-100"
              value={criteria.province}
              onChange={(e) => setCriteria({...criteria, province: e.target.value, city: ""})}
            >
              <option value="">Seluruh Indonesia</option>
              {PROVINCE_LIST.map(p => <option key={p} value={p}>{p}</option>)}
            </select>
          </div>

          {/* Filter Kota */}
          <div className="space-y-2">
            <label className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-500"><Map size={14}/> Kota/Kabupaten</label>
            <select 
              disabled={!criteria.province}
              className="w-full rounded-2xl border-4 border-slate-900 bg-slate-50 p-4 font-bold outline-none focus:ring-4 focus:ring-indigo-100 disabled:opacity-50"
              value={criteria.city}
              onChange={(e) => setCriteria({...criteria, city: e.target.value})}
            >
              <option value="">Semua Kota di {criteria.province || 'Provinsi'}</option>
              {availableCities.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>

          <div className="mt-4 flex justify-end lg:col-span-4">
            <button type="submit" disabled={loading} className="flex w-full items-center justify-center gap-2 rounded-2xl bg-slate-900 py-4 font-black uppercase italic text-white shadow-[4px_4px_0px_0px_rgba(79,70,229,1)] transition-all hover:translate-y-1 hover:shadow-none lg:w-1/3">
              {loading ? <Loader2 className="animate-spin" /> : <Calculator size={20} />} Jalankan Analisis Strategis
            </button>
          </div>
        </form>
      </section>

      {/* 2. ENHANCED RESULTS */}
      {results && (
        <div className="space-y-8 duration-500 animate-in zoom-in-95">
          <div className="grid gap-8 lg:grid-cols-4">
            {/* Total Highlight */}
            <div className="rounded-[2.5rem] border-4 border-slate-900 bg-slate-900 p-8 text-white shadow-[12px_12px_0px_0px_rgba(79,70,229,1)] lg:col-span-1">
              <p className="text-[10px] font-black uppercase italic tracking-widest text-blue-400 opacity-60">Total Potensi</p>
              <h3 className="my-2 text-6xl font-black italic">{results.total} <span className="text-lg text-slate-400">Jiwa</span></h3>
              <p className="text-[10px] font-bold uppercase">Siap Menjalani Seleksi</p>
            </div>

            {/* Top Skills (NEW) */}
            <div className="rounded-[2.5rem] border-4 border-slate-900 bg-emerald-50 p-8 shadow-[12px_12px_0px_0px_rgba(15,23,42,1)] lg:col-span-3">
              <h3 className="mb-4 flex items-center gap-2 font-black uppercase italic text-slate-900"><Lightbulb size={20} className="text-emerald-600" /> Keahlian Dominan di Grup Ini</h3>
              <div className="flex flex-wrap gap-2">
                {results.topSkills.map((s, i) => (
                  <div key={i} className="rounded-xl border-2 border-slate-900 bg-white px-4 py-2 text-xs font-black shadow-[3px_3px_0px_0px_rgba(15,23,42,1)]">
                    {s.skill} <span className="ml-2 text-emerald-600">({s.count})</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Geo Distribution */}
            <div className="rounded-[2.5rem] border-4 border-slate-900 bg-white p-8 shadow-[12px_12px_0px_0px_rgba(15,23,42,1)] lg:col-span-2">
              <h3 className="mb-6 flex items-center gap-2 font-black uppercase italic text-slate-900"><Users size={20} className="text-blue-600" /> Persebaran Domisili</h3>
              <div className="grid grid-cols-2 gap-4">
                {results.topCities.map((item, i) => (
                  <div key={i} className="flex items-center justify-between border-b-2 border-slate-50 pb-2">
                    <span className="truncate text-[10px] font-black uppercase italic">{item.city}</span>
                    <span className="rounded-lg bg-slate-100 px-2 py-1 text-xs font-black">{item.count}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Accommodations */}
            <div className="rounded-[2.5rem] border-4 border-slate-900 bg-white p-8 shadow-[12px_12px_0px_0px_rgba(15,23,42,1)] lg:col-span-2">
              <h3 className="mb-6 flex items-center gap-2 font-black uppercase italic text-slate-900"><ShieldCheck className="text-emerald-500" /> Akomodasi Prioritas</h3>
              <div className="grid grid-cols-1 gap-2">
                {results.requiredAccommodations.slice(0, 6).map((item, i) => (
                  <div key={i} className="flex items-start gap-3 rounded-xl border-2 border-slate-100 bg-slate-50 p-3 text-[10px] font-bold uppercase leading-tight">
                    <CheckCircle2 size={14} className="shrink-0 text-emerald-500" /> {item}
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