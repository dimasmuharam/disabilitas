"use client";

import React, { useState } from "react";
import { supabase } from "@/lib/supabase";
import { 
  Search, Users, MapPin, BookOpen, 
  Zap, ArrowRight, Briefcase, Sparkles, X,
  CheckCircle2, Info, GraduationCap, Wrench, ShieldCheck,
  Clock // Ikon yang tadi ketinggalan
} from "lucide-react";
import { 
  SKILLS_LIST, 
  INDONESIA_CITIES, 
  EDUCATION_LEVELS, 
  UNIVERSITY_MAJORS 
} from "@/lib/data-static";

export default function RecruitmentSimulator({ company }: { company: any }) {
  const [loading, setLoading] = useState(false);
  const [resultCount, setResultCount] = useState<number | null>(null);
  const [compatibility, setCompatibility] = useState<any>(null);
  const [announcement, setAnnouncement] = useState("");
  
  const [filters, setFilters] = useState({
    skills: [] as string[],
    location: company?.location || "",
    education: "",
    major: ""
  });

  const toggleFilter = (field: 'skills', value: string) => {
    setFilters(prev => ({
      ...prev,
      [field]: prev[field].includes(value)
        ? prev[field].filter(s => s !== value)
        : [...prev[field], value]
    }));
  };

  const runSimulation = async () => {
    setLoading(true);
    setResultCount(null);
    setAnnouncement("Memulai pemindaian sistem database talenta inklusif.");

    try {
      // Menghitung ketersediaan talenta berdasarkan profil
      let query = supabase.from("profiles").select("id, tech_access_tools", { count: "exact" });

      // LOGIKA FILTER OPSIONAL: Hanya memfilter jika ada input
      if (filters.skills.length > 0) {
        query = query.contains("skills", filters.skills);
      }
      if (filters.location) {
        query = query.eq("city", filters.location);
      }
      if (filters.education) {
        query = query.eq("education_level", filters.education);
      }
      if (filters.major) {
        // Karena education_major disimpan sebagai array di database kita
        query = query.contains("education_major", [filters.major]);
      }

      const { data, count, error } = await query.limit(100);
      if (error) throw error;

      setResultCount(count);

      // ANALISIS AKOMODASI (Untuk Encouragement)
      if (data && data.length > 0) {
        const needsMap: Record<string, number> = {};
        data.forEach(p => {
          const tools = Array.isArray(p.tech_access_tools) ? p.tech_access_tools : [];
          tools.forEach((t: string) => {
            needsMap[t] = (needsMap[t] || 0) + 1;
          });
        });

        const topNeed = Object.entries(needsMap).sort((a, b) => b[1] - a[1])[0];
        const companyTools = Array.isArray(company?.master_accommodations_provided) 
          ? company.master_accommodations_provided 
          : [];

        setCompatibility({
          topNeed: topNeed ? topNeed[0] : "Dukungan Aksesibilitas Umum",
          isMatched: topNeed ? companyTools.includes(topNeed[0]) : true
        });
      }

      setAnnouncement(`Simulasi selesai. Ditemukan ${count} talenta yang sesuai.`);
    } catch (err) {
      console.error(err);
      setAnnouncement("Gagal menjalankan simulasi.");
    } finally {
      setLoading(false);
    }
  };
  return (
    <div className="max-w-6xl mx-auto space-y-10 pb-20 font-sans text-left selection:bg-blue-100">
      <div className="sr-only" aria-live="polite" role="status">{announcement}</div>

      {/* HERO SECTION */}
      <section className="bg-slate-900 rounded-[3.5rem] p-10 md:p-16 text-white shadow-2xl relative overflow-hidden border-2 border-slate-800">
        <div className="relative z-10 space-y-6">
          <div className="flex items-center gap-3 bg-blue-500/10 text-blue-400 w-fit px-5 py-2 rounded-full border border-blue-500/20 font-black text-[10px] uppercase tracking-[0.2em]">
            <Sparkles size={16} /> DATA TALENT SUPPLY
          </div>
          <h1 className="text-4xl md:text-6xl font-black italic uppercase tracking-tighter leading-[0.85] max-w-3xl">
            Simulasikan Kebutuhan Kompetensi Bisnis Anda
          </h1>
          <p className="text-slate-400 text-lg font-medium max-w-2xl italic leading-relaxed">
            Temukan bukti statistik bahwa talenta disabilitas memiliki kualifikasi pendidikan dan keahlian yang relevan dengan industri Anda.
          </p>
        </div>
        <Zap className="absolute -right-20 -bottom-20 text-white/5 rotate-12" size={400} />
      </section>

      <div className="grid lg:grid-cols-5 gap-10">
        {/* PANEL PARAMETER (FILTER) */}
        <aside className="lg:col-span-2 space-y-8">
          <div className="bg-white p-8 md:p-10 rounded-[3rem] border-2 border-slate-900 shadow-[10px_10px_0px_0px_rgba(15,23,42,1)] space-y-10">
            <h2 className="text-[11px] font-black uppercase text-slate-400 tracking-[0.3em] flex items-center gap-3 border-b-2 border-slate-50 pb-4 italic">
              <Search size={18} /> Parameter Riset
            </h2>

            <fieldset className="space-y-6">
              <div className="space-y-4">
                <label className="text-[10px] font-black uppercase text-slate-900 flex items-center gap-2 italic">
                   <GraduationCap size={14} className="text-blue-600"/> Pendidikan Minimal
                </label>
                <select 
                  aria-label="Pilih kriteria pendidikan"
                  value={filters.education}
                  onChange={e => setFilters({...filters, education: e.target.value})}
                  className="w-full p-4 rounded-2xl bg-slate-50 border-2 border-slate-50 font-bold text-xs outline-none focus:border-blue-600 appearance-none"
                >
                  <option value="">Semua Jenjang</option>
                  {EDUCATION_LEVELS.map(lv => <option key={lv} value={lv}>{lv}</option>)}
                </select>
              </div>

              <div className="space-y-4">
                <label className="text-[10px] font-black uppercase text-slate-900 flex items-center gap-2 italic">
                   <BookOpen size={14} className="text-indigo-600"/> Bidang Jurusan
                </label>
                <select 
                  aria-label="Pilih kriteria jurusan"
                  value={filters.major}
                  onChange={e => setFilters({...filters, major: e.target.value})}
                  className="w-full p-4 rounded-2xl bg-slate-50 border-2 border-slate-50 font-bold text-xs outline-none focus:border-indigo-600 appearance-none"
                >
                  <option value="">Semua Jurusan</option>
                  {UNIVERSITY_MAJORS.map(m => <option key={m} value={m}>{m}</option>)}
                </select>
              </div>

              <div className="space-y-4">
                <label className="text-[10px] font-black uppercase text-slate-900 flex items-center gap-2 italic">
                   <Wrench size={14} className="text-emerald-600"/> Keahlian (Skills)
                </label>
                <div className="grid grid-cols-2 gap-2 max-h-48 overflow-y-auto p-3 border-2 border-slate-50 rounded-2xl bg-slate-50/30">
                  {SKILLS_LIST.map(skill => (
                    <button
                      key={skill}
                      type="button"
                      aria-pressed={filters.skills.includes(skill)}
                      onClick={() => toggleFilter('skills', skill)}
                      className={`p-3 rounded-xl text-[9px] font-black uppercase border-2 transition-all text-left leading-tight ${
                        filters.skills.includes(skill)
                        ? "bg-blue-600 text-white border-blue-600 shadow-md"
                        : "bg-white text-slate-400 border-white hover:border-blue-200"
                      }`}
                    >
                      {skill}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-4">
                <label className="text-[10px] font-black uppercase text-slate-900 flex items-center gap-2 italic">
                   <MapPin size={14} className="text-red-600"/> Target Lokasi
                </label>
                <select 
                  aria-label="Pilih lokasi kerja"
                  value={filters.location}
                  onChange={e => setFilters({...filters, location: e.target.value})}
                  className="w-full p-4 rounded-2xl bg-slate-50 border-2 border-slate-50 font-bold text-xs outline-none focus:border-red-600 appearance-none"
                >
                  <option value="">Seluruh Indonesia</option>
                  {INDONESIA_CITIES.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
            </fieldset>

            <button 
              onClick={runSimulation}
              disabled={loading}
              className="w-full py-6 bg-blue-600 text-white rounded-2xl font-black uppercase tracking-[0.2em] text-xs shadow-xl hover:bg-slate-900 transition-all flex items-center justify-center gap-4 disabled:opacity-50"
            >
              {loading ? <Clock className="animate-spin" /> : <Zap size={20} fill="currentColor" />} 
              JALANKAN SIMULASI
            </button>
          </div>
        </aside>

        {/* PANEL HASIL ANALISIS */}
        <main className="lg:col-span-3">
          {resultCount !== null ? (
            <div className="bg-white p-10 md:p-14 rounded-[4rem] border-2 border-slate-100 shadow-sm space-y-12 animate-in zoom-in-95">
              <div className="text-center space-y-4">
                <p className="text-[11px] font-black uppercase text-slate-300 tracking-[0.5em]">HASIL ANALISIS TALENTA</p>
                <div className="flex items-center justify-center gap-5">
                  <span className="text-8xl font-black text-slate-900 tracking-tighter italic">{resultCount}</span>
                  <div className="text-left font-black uppercase text-blue-600 italic leading-none">
                    <p className="text-2xl">Talenta</p>
                    <p className="text-sm tracking-widest">Tersedia</p>
                  </div>
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <div className="p-8 bg-emerald-50 rounded-[2.5rem] border-2 border-emerald-100 space-y-4">
                  <div className="flex items-center gap-3 text-emerald-600">
                    <CheckCircle2 size={24} />
                    <h4 className="text-[10px] font-black uppercase tracking-widest">Rekomendasi Strategis</h4>
                  </div>
                  <p className="text-sm text-emerald-900 leading-relaxed font-medium text-left">
                    {resultCount > 0 
                      ? <strong>Data menunjukkan ketersediaan talenta profesional yang melimpah. Membuka lowongan sekarang akan memperkuat branding inklusi instansi Anda.</strong>
                      : <strong>Kriteria ini sangat spesifik. Disarankan untuk melonggarkan syarat lokasi agar dapat menjangkau lebih banyak pakar dari berbagai daerah.</strong>
                    }
                  </p>
                </div>

                {compatibility && (
                  <div className="p-8 bg-blue-50 rounded-[2.5rem] border-2 border-blue-100 space-y-4">
                    <div className="flex items-center gap-3 text-blue-600">
                      <ShieldCheck size={24} />
                      <h4 className="text-[10px] font-black uppercase tracking-widest text-left">Kesiapan Akomodasi</h4>
                    </div>
                    <div className="space-y-2 text-left">
                      <p className="text-[11px] text-blue-800 font-black">
                        Talenta dalam kategori ini mayoritas memerlukan: <strong>{compatibility.topNeed}</strong>.
                      </p>
                      <p className="text-[10px] text-blue-600 font-bold italic">
                        {compatibility.isMatched 
                          ? "Fasilitas instansi Anda sudah selaras dengan kebutuhan mereka."
                          : "Pertimbangkan untuk menyediakan dukungan ini guna menarik kandidat terbaik."}
                      </p>
                    </div>
                  </div>
                )}
              </div>

              <div className="flex flex-col sm:flex-row gap-4 pt-6">
                <button 
                  onClick={() => window.location.reload()}
                  className="flex-1 py-5 bg-slate-50 text-slate-400 rounded-2xl font-black uppercase text-[10px] border-2 border-slate-100 italic"
                >
                  Reset Simulasi
                </button>
                <button 
                  className="flex-[2] py-5 bg-slate-900 text-white rounded-2xl font-black uppercase text-[10px] flex items-center justify-center gap-3 tracking-[0.2em] shadow-xl hover:bg-blue-600 transition-all"
                >
                  Tayangkan Lowongan <ArrowRight size={18} />
                </button>
              </div>
            </div>
          ) : (
            <div className="h-full flex flex-col items-center justify-center p-24 border-4 border-dashed border-slate-100 rounded-[5rem] text-center opacity-40">
              <Users size={64} className="text-slate-200 mb-8" />
              <p className="text-sm font-black text-slate-300 uppercase tracking-[0.4em] italic leading-loose max-w-md">
                Tentukan parameter di panel kiri untuk melihat potensi pasar talenta inklusif bagi bisnis Anda.
              </p>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
