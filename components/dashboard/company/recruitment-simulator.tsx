"use client";

import React, { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { 
  Search, Users, MapPin, BookOpen, 
  Zap, ArrowRight, Briefcase, Sparkles, X,
  CheckCircle2, Info, GraduationCap, Wrench, ShieldCheck,
  Clock, AlertTriangle
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
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  
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
    setCompatibility(null);
    setErrorMessage(null);
    setAnnouncement("Memulai sinkronisasi data talenta inklusif dari database riset.");

    const supabase = createClient();
    try {
      // Sesuai skema public.profiles: city, major, skills (array), education_level
      let query = supabase
        .from("profiles")
        .select("id, used_assistive_tools, skills, major, education_level", { count: "exact" });

      // Logic Filter Dinamis Berbasis Kompetensi
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
        query = query.eq("major", filters.major);
      }

      const { data, count, error } = await query;
      
      if (error) {
        setErrorMessage(`Database Error (${error.code}): ${error.message}.`);
        throw error;
      }

      setResultCount(count || 0);

      // ANALISIS AKOMODASI (Forensik Kebutuhan vs Ketersediaan Instansi)
      if (data && data.length > 0) {
        const toolsMap: Record<string, number> = {};
        data.forEach(p => {
          // Normalisasi data array untuk digunakan dalam kalkulasi
          const tools = Array.isArray(p.used_assistive_tools) ? p.used_assistive_tools : [];
          tools.forEach((t: string) => {
            toolsMap[t] = (toolsMap[t] || 0) + 1;
          });
        });

        const sortedTools = Object.entries(toolsMap).sort((a, b) => b[1] - a[1]);
        const topToolNeed = sortedTools[0];
        
        // Cek apakah instansi sudah punya alat bantu yang paling dibutuhkan talenta tersebut
        const companySupport = Array.isArray(company?.master_accommodations_provided) 
          ? company.master_accommodations_provided 
          : [];

        setCompatibility({
          topNeed: topToolNeed ? topToolNeed[0] : "Dukungan Aksesibilitas Digital",
          isMatched: topToolNeed ? companySupport.includes(topToolNeed[0]) : false
        });
      }

      setAnnouncement(`Simulasi selesai. Ditemukan ${count || 0} talenta profesional.`);
    } catch (err: any) {
      console.error("Simulation Failure:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-6xl space-y-10 pb-24 text-left font-sans selection:bg-blue-50 selection:text-blue-900">
      <div className="sr-only" aria-live="assertive" role="alert">{announcement}</div>

      <header className="relative overflow-hidden rounded-[3.5rem] border-2 border-slate-800 bg-slate-900 p-10 text-white shadow-2xl md:p-16">
        <div className="relative z-10 space-y-6">
          <div className="flex w-fit items-center gap-3 rounded-full border border-blue-500/20 bg-blue-500/10 px-5 py-2 text-[10px] font-black uppercase italic tracking-[0.2em] text-blue-400">
            <Sparkles size={16} /> DATA TALENT SUPPLY
          </div>
          <h1 className="max-w-3xl text-4xl font-black uppercase italic leading-[0.85] tracking-tighter md:text-6xl">
            Simulasikan Kebutuhan Kompetensi Bisnis Anda
          </h1>
          <p className="max-w-2xl text-lg font-medium italic leading-relaxed text-slate-400">
            Membantu instansi memetakan ketersediaan tenaga kerja profesional disabilitas berdasarkan kualifikasi riil di database.
          </p>
        </div>
        <Zap className="absolute -bottom-20 -right-20 rotate-12 text-white/5" size={400} aria-hidden="true" />
      </header>

      {errorMessage && (
        <div className="flex items-start gap-4 rounded-[2rem] border-2 border-red-200 bg-red-50 p-6 duration-300 animate-in slide-in-from-top">
          <AlertTriangle className="shrink-0 text-red-500" size={24} />
          <div className="space-y-1 text-left">
            <p className="text-[10px] font-black uppercase italic tracking-widest text-red-600">Log Error Sistem</p>
            <p className="text-xs font-bold leading-relaxed text-red-800"><strong>{errorMessage}</strong></p>
          </div>
        </div>
      )}

      <div className="grid gap-10 lg:grid-cols-5">
        <aside className="lg:col-span-2">
          <div className="space-y-10 rounded-[3rem] border-2 border-slate-900 bg-white p-8 shadow-[10px_10px_0px_0px_rgba(15,23,42,1)] md:p-10">
            <h2 className="flex items-center gap-3 border-b-2 border-slate-50 pb-4 text-[11px] font-black uppercase italic tracking-[0.3em] text-slate-400">
              <Search size={18} /> Parameter Pencarian
            </h2>

            <fieldset className="space-y-8">
              <div className="space-y-4 text-left">
                <label htmlFor="sim-edu" className="flex items-center gap-2 text-[10px] font-black uppercase italic text-slate-900">
                   <GraduationCap size={14} className="text-blue-600"/> Jenjang Pendidikan
                </label>
                <select id="sim-edu" value={filters.education} onChange={e => setFilters({...filters, education: e.target.value})} className="w-full appearance-none rounded-2xl border-2 border-slate-100 bg-slate-50 p-5 text-xs font-bold outline-none focus:border-blue-600">
                  <option value="">Seluruh Jenjang</option>
                  {EDUCATION_LEVELS.map(lv => <option key={lv} value={lv}>{lv}</option>)}
                </select>
              </div>

              <div className="space-y-4 text-left">
                <label htmlFor="sim-major" className="flex items-center gap-2 text-[10px] font-black uppercase italic text-slate-900">
                   <BookOpen size={14} className="text-indigo-600"/> Bidang Jurusan
                </label>
                <select id="sim-major" value={filters.major} onChange={e => setFilters({...filters, major: e.target.value})} className="w-full appearance-none rounded-2xl border-2 border-slate-100 bg-slate-50 p-5 text-xs font-bold outline-none focus:border-indigo-600">
                  <option value="">Seluruh Jurusan</option>
                  {UNIVERSITY_MAJORS.map(m => <option key={m} value={m}>{m}</option>)}
                </select>
              </div>

              <div className="space-y-4 text-left">
                <p className="flex items-center gap-2 text-[10px] font-black uppercase italic text-slate-900">
                   <Wrench size={14} className="text-emerald-600"/> Keahlian Utama (Skills)
                </p>
                <div className="grid max-h-48 grid-cols-1 gap-2 overflow-y-auto rounded-2xl border-2 border-slate-50 bg-slate-50/30 p-4 shadow-inner" role="group" aria-label="Daftar keahlian">
                  {SKILLS_LIST.map(skill => (
                    <button
                      key={skill}
                      type="button"
                      aria-pressed={filters.skills.includes(skill)}
                      onClick={() => toggleFilter('skills', skill)}
                      className={`rounded-xl border-2 p-3 text-left text-[9px] font-black uppercase leading-tight transition-all ${
                        filters.skills.includes(skill)
                        ? "border-slate-900 bg-slate-900 text-white shadow-md"
                        : "border-white bg-white text-slate-400 hover:border-slate-200"
                      }`}
                    >
                      {skill}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-4 text-left">
                <label htmlFor="sim-loc" className="flex items-center gap-2 text-[10px] font-black uppercase italic text-slate-900">
                   <MapPin size={14} className="text-red-600"/> Domisili Talenta
                </label>
                <select id="sim-loc" value={filters.location} onChange={e => setFilters({...filters, location: e.target.value})} className="w-full appearance-none rounded-2xl border-2 border-slate-100 bg-slate-50 p-5 text-xs font-bold outline-none focus:border-red-600">
                  <option value="">Seluruh Indonesia</option>
                  {INDONESIA_CITIES.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
            </fieldset>

            <button onClick={runSimulation} disabled={loading} className="w-full rounded-2xl bg-blue-600 py-6 text-xs font-black uppercase tracking-[0.2em] text-white shadow-xl transition-all hover:bg-slate-900 active:scale-95 disabled:opacity-50">
              {loading ? "MENYINKRONKAN..." : "JALANKAN SIMULASI"}
            </button>
          </div>
        </aside>

        <main className="lg:col-span-3">
          {resultCount !== null ? (
            <div className="space-y-12 rounded-[4rem] border-2 border-slate-100 bg-white p-8 shadow-sm animate-in zoom-in-95 md:p-14">
              <div className="space-y-4 text-center">
                <h3 className="text-[11px] font-black uppercase italic tracking-[0.5em] text-slate-300">Potensi Supply Tenaga Kerja</h3>
                <div className="flex items-center justify-center gap-5">
                  <span className="text-8xl font-black italic tracking-tighter text-slate-900">{resultCount}</span>
                  <div className="text-left font-black uppercase italic leading-none text-blue-600">
                    <p className="text-2xl">Talenta</p>
                    <p className="text-sm tracking-widest">Tersedia</p>
                  </div>
                </div>
              </div>

              <div className="grid gap-6 md:grid-cols-2">
                <section className="space-y-4 rounded-[2.5rem] border-2 border-emerald-100 bg-emerald-50 p-8 text-left">
                  <div className="flex items-center gap-3 text-emerald-600">
                    <CheckCircle2 size={24} />
                    <h4 className="text-[10px] font-black uppercase tracking-widest">Analisis Riset</h4>
                  </div>
                  <p className="text-sm font-medium italic leading-relaxed text-emerald-900">
                    {resultCount > 0 
                      ? <strong>Sistem mendeteksi pasokan talenta profesional yang melimpah pada kriteria ini. Membuka lowongan sekarang akan memberi instansi Anda keunggulan kompetitif.</strong>
                      : <strong>Kriteria ini sangat spesifik. Anda disarankan untuk mempertimbangkan fleksibilitas syarat domisili guna menjaring lebih banyak pakar profesional.</strong>
                    }
                  </p>
                </section>

                {compatibility && (
                  <section className="space-y-4 rounded-[2.5rem] border-2 border-blue-100 bg-blue-50 p-8 text-left font-black uppercase tracking-tighter">
                    <div className="flex items-center gap-3 text-blue-600">
                      <ShieldCheck size={24} />
                      <h4 className="text-[10px] tracking-widest">Analisis Akomodasi</h4>
                    </div>
                    <div className="space-y-3">
                      <p className="text-[11px] italic leading-tight text-blue-800">
                        Umumnya, talenta pada kriteria ini menggunakan: <strong>{compatibility.topNeed}</strong>.
                      </p>
                      <p className="border-t border-blue-100 pt-3 text-[10px] italic leading-relaxed text-blue-600">
                        {compatibility.isMatched 
                          ? <strong>Instansi Anda sudah memiliki infrastruktur pendukung untuk kebutuhan ini.</strong>
                          : <strong>Anda disarankan menyediakan dukungan tersebut untuk menjamin produktivitas mereka.</strong>}
                      </p>
                    </div>
                  </section>
                )}
              </div>

              <div className="flex flex-col gap-4 pt-6 sm:flex-row">
                <button onClick={() => window.location.reload()} className="flex-1 rounded-2xl border-2 border-slate-100 bg-slate-50 py-5 text-[10px] font-black uppercase italic text-slate-400 transition-all">Atur Ulang</button>
                <button className="flex flex-[2] items-center justify-center gap-3 rounded-2xl bg-slate-900 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-white shadow-xl transition-all hover:bg-blue-600">POSTING LOWONGAN SEKARANG</button>
              </div>
            </div>
          ) : (
            <div className="flex h-full flex-col items-center justify-center rounded-[5rem] border-4 border-dashed border-slate-100 p-24 text-center opacity-40">
              <Users size={64} className="mb-8 text-slate-200" aria-hidden="true" />
              <p className="max-w-md text-sm font-black uppercase italic leading-loose tracking-[0.4em] text-slate-300">
                Tentukan parameter kompetensi profesional untuk mensimulasikan pasokan talenta inklusif dari database riset.
              </p>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
