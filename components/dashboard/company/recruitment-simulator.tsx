"use client";

import React, { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { 
  Search, Users, MapPin, BookOpen, 
  Zap, ArrowRight, Briefcase, Sparkles, X,
  CheckCircle2, Info
} from "lucide-react";
import { SKILLS_LIST, INDONESIA_CITIES } from "@/lib/data-static";

export default function RecruitmentSimulator({ company }: { company: any }) {
  const [loading, setLoading] = useState(false);
  const [resultCount, setResultCount] = useState<number | null>(null);
  const [announcement, setAnnouncement] = useState("");
  
  // Filter berbasis Kompetensi & Kebutuhan Bisnis
  const [filters, setFilters] = useState({
    skills: [] as string[],
    location: company?.location || "",
    education: ""
  });

  const handleToggleSkill = (skill: string) => {
    setFilters(prev => ({
      ...prev,
      skills: prev.skills.includes(skill)
        ? prev.skills.filter(s => s !== skill)
        : [...prev.skills, skill]
    }));
  };

  const runSimulation = async () => {
    setLoading(true);
    setAnnouncement(`{"Sedang memindai database talenta berdasarkan kriteria kompetensi..."}`);

    try {
      let query = supabase.from("profiles").select("id", { count: "exact" });

      if (filters.skills.length > 0) {
        query = query.contains("skills", filters.skills);
      }
      if (filters.location) {
        query = query.eq("city", filters.location);
      }
      if (filters.education) {
        query = query.eq("education_level", filters.education);
      }

      const { count, error } = await query;
      
      setResultCount(count);
      setAnnouncement(`{"Simulasi selesai. Ditemukan "}${count}{" talenta yang cocok dengan kriteria Anda."}`);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8 animate-in fade-in duration-500 pb-20">
      <div className="sr-only" aria-live="polite">{announcement}</div>

      {/* HEADER SIMULATOR */}
      <section className="bg-slate-900 rounded-[3rem] p-12 text-white shadow-2xl relative overflow-hidden">
        <div className="relative z-10 space-y-4">
          <div className="flex items-center gap-3 bg-blue-600/20 text-blue-400 w-fit px-4 py-1 rounded-full border border-blue-600/30 font-black text-[10px] uppercase tracking-widest">
            <Sparkles size={14} fill="currentColor" /> {"Talent Supply Simulator"}
          </div>
          <h2 className="text-4xl font-black italic uppercase tracking-tighter leading-none max-w-2xl">
            {"Temukan Potensi Talenta Inklusif Berdasarkan Kebutuhan Bisnis"}
          </h2>
          <p className="text-slate-400 text-sm font-medium max-w-xl italic">
            {"Gunakan simulator ini untuk melihat ketersediaan talenta di database kami sebelum Anda menerbitkan lowongan pekerjaan."}
          </p>
        </div>
        <Zap className="absolute -right-10 -bottom-10 text-white/5" size={300} />
      </section>

      <div className="grid lg:grid-cols-5 gap-8">
        {/* PANEL FILTER (KIRI) */}
        <aside className="lg:col-span-2 space-y-6">
          <div className="bg-white p-8 rounded-[2.5rem] border-2 border-slate-900 shadow-[6px_6px_0px_0px_rgba(15,23,42,1)] space-y-8">
            <h3 className="text-xs font-black uppercase text-slate-400 tracking-widest flex items-center gap-2">
              <Search size={14} /> {"Kriteria Pencarian"}
            </h3>

            {/* SKILLS SELECTOR */}
            <div className="space-y-4">
              <label className="text-[10px] font-black uppercase text-slate-900">{"Keahlian Spesifik"}</label>
              <div className="flex flex-wrap gap-2 max-h-48 overflow-y-auto p-2 border border-slate-50 rounded-xl">
                {SKILLS_LIST.map(skill => (
                  <button
                    key={skill}
                    onClick={() => handleToggleSkill(skill)}
                    className={`px-3 py-1.5 rounded-lg text-[9px] font-black uppercase border transition-all ${
                      filters.skills.includes(skill)
                      ? "bg-blue-600 text-white border-blue-600"
                      : "bg-slate-50 text-slate-400 border-slate-100 hover:border-blue-200"
                    }`}
                  >
                    {skill}
                  </button>
                ))}
              </div>
            </div>

            {/* LOCATION SELECTOR */}
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase text-slate-900">{"Lokasi Kerja"}</label>
              <select 
                value={filters.location}
                onChange={e => setFilters({...filters, location: e.target.value})}
                className="w-full p-4 rounded-xl border-2 border-slate-50 bg-slate-50 font-bold text-xs outline-none focus:border-blue-600"
              >
                <option value="">{"Semua Lokasi"}</option>
                {INDONESIA_CITIES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>

            <button 
              onClick={runSimulation}
              disabled={loading}
              className="w-full py-5 bg-blue-600 text-white rounded-2xl font-black uppercase tracking-widest text-[11px] shadow-xl hover:bg-slate-900 transition-all flex items-center justify-center gap-3"
            >
              {loading ? "MENGHITUNG..." : <><Zap size={18} /> {"Jalankan Simulasi"}</>}
            </button>
          </div>
        </aside>

        {/* PANEL HASIL (KANAN) */}
        <main className="lg:col-span-3">
          {resultCount !== null ? (
            <div className="bg-white p-12 rounded-[3rem] border-2 border-slate-100 shadow-sm space-y-10 animate-in zoom-in-95">
              <div className="text-center space-y-4">
                <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest">{"Hasil Simulasi"}</p>
                <h3 className="text-7xl font-black text-slate-900 tracking-tighter">{resultCount}</h3>
                <p className="text-sm font-bold text-blue-600 uppercase tracking-tight">
                  {"Talenta Berpotensi Tersedia"}
                </p>
              </div>

              <div className="p-8 bg-emerald-50 rounded-[2.5rem] border border-emerald-100 space-y-4">
                <div className="flex items-center gap-2 text-emerald-600">
                  <CheckCircle2 size={20} />
                  <h4 className="text-[10px] font-black uppercase">{"Rekomendasi Strategis"}</h4>
                </div>
                <p className="text-xs text-emerald-800 leading-relaxed font-medium">
                  {resultCount > 0 
                    ? `{"Berdasarkan data kami, ada ketersediaan talenta yang cukup untuk kriteria tersebut. Anda disarankan segera membuka lowongan kerja inklusif untuk menjangkau mereka."}`
                    : `{"Kriteria Anda sangat spesifik. Coba perluas jangkauan lokasi atau kurangi kriteria keahlian untuk mendapatkan lebih banyak kandidat potensial."}`
                  }
                </p>
              </div>

              <div className="flex gap-4 pt-6">
                <button 
                  onClick={() => window.location.reload()} // Reset Simulator
                  className="flex-1 py-4 bg-slate-100 text-slate-400 rounded-2xl font-black uppercase text-[10px]"
                >
                  {"Reset Filter"}
                </button>
                <button 
                  onClick={() => (window as any).location.hash = "jobs"} // Mock trigger to Job Tab
                  className="flex-1 py-4 bg-slate-900 text-white rounded-2xl font-black uppercase text-[10px] flex items-center justify-center gap-2"
                >
                  {"Buat Lowongan Sekarang"} <ArrowRight size={16} />
                </button>
              </div>
            </div>
          ) : (
            <div className="h-full flex flex-col items-center justify-center p-20 border-2 border-dashed border-slate-100 rounded-[3rem] text-center opacity-40">
              <Users size={64} className="text-slate-200 mb-6" />
              <p className="text-sm font-bold text-slate-300 uppercase tracking-widest">
                {"Tentukan kriteria di panel kiri untuk mulai melihat potensi pasar talenta inklusif."}
              </p>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
