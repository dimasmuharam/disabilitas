"use client";

export const runtime = 'edge';

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import Link from "next/link";
import { 
  MapPin, Briefcase, DollarSign, Filter, 
  Search, Building2, CheckCircle, Monitor, 
  X, GraduationCap, ChevronRight, BookOpen,
  Wrench, ListFilter, RotateCcw
} from "lucide-react";

import { 
  WORK_MODES, 
  EMPLOYMENT_TYPES, 
  ACCOMMODATION_TYPES,
  EDUCATION_LEVELS,
  UNIVERSITY_MAJORS,
  SKILLS_LIST,
  INDONESIA_CITIES
} from "@/lib/data-static";

export default function LowonganPage() {
  const [jobs, setJobs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  // State Filter Utama (Fokus pada Kesiapan Instansi & Kompetensi Talenta)
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedAccommodations, setSelectedAccommodations] = useState<string[]>([]);
  const [selectedTypes, setSelectedTypes] = useState<string[]>([]);
  const [selectedWorkModes, setSelectedWorkModes] = useState<string[]>([]);
  const [selectedEducation, setSelectedEducation] = useState<string>("");
  const [selectedMajor, setSelectedMajor] = useState<string>("");
  const [selectedSkill, setSelectedSkill] = useState<string>("");
  const [selectedCity, setSelectedCity] = useState<string>("");
  const [minSalary, setMinSalary] = useState<number>(0);
  const [sortBy, setSortBy] = useState<string>("latest");

  useEffect(() => {
    fetchJobs();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedAccommodations, selectedTypes, selectedWorkModes, selectedEducation, selectedMajor, selectedSkill, selectedCity, sortBy]); 

  async function fetchJobs() {
    setLoading(true);
    try {
      let query = supabase
        .from('jobs')
        .select(`*, companies (name, is_verified, location)`)
        .eq('is_active', true);

      if (searchQuery) query = query.ilike('title', `%${searchQuery}%`);
      if (selectedCity) query = query.eq('location', selectedCity);
      if (selectedEducation) query = query.eq('required_education_level', selectedEducation);
      if (selectedMajor) query = query.contains('required_education_major', [selectedMajor]);
      if (selectedSkill) query = query.contains('required_skills', [selectedSkill]);
      if (minSalary > 0) query = query.gte('salary_max', minSalary);
      
      // Filter Akomodasi (Fokus pada Tools, bukan jenis disabilitas)
      if (selectedAccommodations.length > 0) {
        query = query.contains('preferred_disability_tools', selectedAccommodations);
      }

      if (selectedTypes.length > 0) query = query.in('job_type', selectedTypes);
      if (selectedWorkModes.length > 0) query = query.in('work_mode', selectedWorkModes);

      if (sortBy === "latest") {
        query = query.order('created_at', { ascending: false });
      } else {
        query = query.order('salary_max', { ascending: false });
      }

      const { data, error } = await query;
      if (error) throw error;
      setJobs(data || []);
    } catch (error) {
      console.error("Fetch Jobs Error:", error);
    } finally {
      setLoading(false);
    }
  }

  const formatSalary = (min: number, max: number) => {
    if (!min && !max) return "Kompetitif";
    const format = (n: number) => (n / 1000000).toFixed(1);
    return `Rp ${format(min)} - ${format(max)} Jt`;
  };

  const handleFilterChange = (value: string, category: 'acc' | 'type' | 'mode') => {
    const setters: Record<string, [string[], (v: string[]) => void]> = {
      acc: [selectedAccommodations, setSelectedAccommodations],
      type: [selectedTypes, setSelectedTypes],
      mode: [selectedWorkModes, setSelectedWorkModes]
    };
    const [state, setter] = setters[category];
    setter(state.includes(value) ? state.filter(i => i !== value) : [...state, value]);
  };

  const handleReset = () => {
    setSelectedAccommodations([]);
    setSelectedTypes([]);
    setSelectedWorkModes([]);
    setSelectedEducation("");
    setSelectedMajor("");
    setSelectedSkill("");
    setSelectedCity("");
    setMinSalary(0);
    setSearchQuery("");
  };
  return (
    <div className="flex min-h-screen flex-col bg-[#F8FAFC] font-sans selection:bg-blue-100 selection:text-blue-900">
      
      {/* SEARCH HEADER */}
      <header className="relative overflow-hidden border-b-2 border-slate-100 bg-white py-12 shadow-sm">
        <div className="relative z-10 mx-auto max-w-7xl px-6">
          <div className="mb-10 flex flex-col items-end justify-between gap-6 md:flex-row">
            <div className="space-y-2 text-left">
              <h1 className="text-4xl font-black uppercase italic leading-none tracking-tighter text-slate-900">
                Eksplorasi Peluang
              </h1>
              <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-slate-400">
                Berdasarkan Kompetensi & Kesiapan Akomodasi Instansi
              </p>
            </div>
            
            <div className="flex items-center gap-3 rounded-2xl border-2 border-slate-200 bg-slate-100 p-2">
              <ListFilter size={18} className="ml-2 text-slate-500" aria-hidden="true" />
              <select 
                aria-label="Urutkan Lowongan"
                value={sortBy} 
                onChange={(e) => setSortBy(e.target.value)}
                className="cursor-pointer bg-transparent pr-4 text-[10px] font-black uppercase text-slate-700 outline-none"
              >
                <option value="latest">Terbaru</option>
                <option value="salary_high">Gaji Tertinggi</option>
              </select>
            </div>
          </div>
          
          <form onSubmit={(e) => { e.preventDefault(); fetchJobs(); }} className="flex max-w-5xl flex-col gap-4 md:flex-row">
            <div className="group relative flex-[2]">
              <Search className="absolute left-5 top-1/2 size-5 -translate-y-1/2 text-slate-400 transition-colors group-focus-within:text-blue-600" aria-hidden="true" />
              <input 
                type="text" 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Cari posisi pekerjaan..." 
                aria-label="Cari posisi pekerjaan"
                className="h-16 w-full rounded-3xl border-2 border-slate-100 bg-slate-50/50 pl-14 pr-4 font-bold shadow-inner outline-none transition-all focus:border-blue-600 focus:bg-white"
              />
            </div>
            <div className="relative flex-1">
              <MapPin className="absolute left-5 top-1/2 size-5 -translate-y-1/2 text-red-500" aria-hidden="true" />
              <select 
                aria-label="Pilih Kota"
                value={selectedCity}
                onChange={(e) => setSelectedCity(e.target.value)}
                className="h-16 w-full cursor-pointer appearance-none rounded-3xl border-2 border-slate-100 bg-white pl-14 pr-6 font-bold shadow-sm outline-none focus:border-blue-600"
              >
                <option value="">Seluruh Lokasi</option>
                {INDONESIA_CITIES.map(city => <option key={city} value={city}>{city}</option>)}
              </select>
            </div>
            <button type="submit" className="flex h-16 items-center justify-center gap-3 rounded-3xl bg-slate-900 px-10 text-xs font-black uppercase text-white shadow-xl transition-all hover:bg-blue-700 active:scale-95" aria-label="Cari lowongan pekerjaan">
              Cari Sekarang
            </button>
          </form>
        </div>
      </header>

      <div className="mx-auto flex max-w-7xl flex-col gap-12 px-6 py-12 lg:flex-row">
        
        {/* SIDEBAR FILTER: DEEP COMPETECE & ACCESS */}
        <aside className="w-full space-y-8 lg:w-80" aria-label="Filter Lowongan Pekerjaan">
          <div className="sticky top-8 rounded-[3rem] border-2 border-slate-900 bg-white p-8 shadow-[8px_8px_0px_0px_rgba(15,23,42,1)]">
            <div className="mb-8 flex items-center justify-between border-b-2 border-slate-50 pb-4">
              <h2 className="flex items-center gap-2 text-sm font-black uppercase italic">
                <Filter size={18} className="text-blue-600" aria-hidden="true" /> Filter Lanjutan
              </h2>
              <button onClick={handleReset} className="rounded-xl p-2 text-red-500 transition-colors hover:bg-red-50" title="Reset Filter" aria-label="Reset semua filter">
                <RotateCcw size={18} aria-hidden="true" />
              </button>
            </div>

            <div className="custom-scrollbar h-[calc(100vh-320px)] space-y-8 overflow-y-auto pr-3 text-left font-black uppercase tracking-tighter">
              
              {/* PENDIDIKAN */}
              <div className="space-y-3">
                <label htmlFor="education-filter" className="flex items-center gap-2 text-[10px] italic text-slate-400"><GraduationCap size={14} aria-hidden="true" /> Jenjang Pendidikan</label>
                <select id="education-filter" value={selectedEducation} onChange={(e) => setSelectedEducation(e.target.value)} className="w-full rounded-2xl border-2 border-slate-50 bg-slate-50 p-4 text-[11px] font-bold outline-none transition-all focus:border-blue-600" aria-label="Filter berdasarkan jenjang pendidikan">
                  <option value="">Semua Jenjang</option>
                  {EDUCATION_LEVELS.map(edu => <option key={edu} value={edu}>{edu}</option>)}
                </select>
              </div>

              {/* JURUSAN */}
              <div className="space-y-3">
                <label htmlFor="major-filter" className="flex items-center gap-2 text-[10px] italic text-slate-400"><BookOpen size={14} aria-hidden="true" /> Fokus Jurusan</label>
                <select id="major-filter" value={selectedMajor} onChange={(e) => setSelectedMajor(e.target.value)} className="w-full rounded-2xl border-2 border-slate-50 bg-slate-50 p-4 text-[11px] font-bold outline-none transition-all focus:border-blue-600" aria-label="Filter berdasarkan jurusan pendidikan">
                  <option value="">Semua Jurusan</option>
                  {UNIVERSITY_MAJORS.map(major => <option key={major} value={major}>{major}</option>)}
                </select>
              </div>

              {/* SKILL UTAMA */}
              <div className="space-y-3">
                <label htmlFor="skill-filter" className="flex items-center gap-2 text-[10px] italic text-slate-400"><Wrench size={14} aria-hidden="true" /> Spesialisasi Keahlian</label>
                <select id="skill-filter" value={selectedSkill} onChange={(e) => setSelectedSkill(e.target.value)} className="w-full rounded-2xl border-2 border-slate-50 bg-slate-50 p-4 text-[11px] font-bold outline-none transition-all focus:border-emerald-600" aria-label="Filter berdasarkan keahlian">
                  <option value="">Semua Skill</option>
                  {SKILLS_LIST.map(skill => <option key={skill} value={skill}>{skill}</option>)}
                </select>
              </div>

              {/* RANGE GAJI */}
              <div className="space-y-4 border-t border-slate-100 pt-4">
                <label htmlFor="salary-range" className="flex items-center justify-between text-[10px] italic text-slate-400">
                  <span><DollarSign size={14} className="mb-0.5 inline" aria-hidden="true" /> Min. Gaji</span>
                  <span className="font-black text-slate-900">Rp {minSalary/1000000} Jt</span>
                </label>
                <input id="salary-range" type="range" min="0" max="25000000" step="1000000" value={minSalary} onChange={(e) => setMinSalary(parseInt(e.target.value))} className="h-2 w-full cursor-pointer appearance-none rounded-lg bg-slate-100 accent-slate-900" aria-label="Filter berdasarkan gaji minimum" />
              </div>

              {/* DUKUNGAN AKOMODASI (PENGGANTI RAGAM DISABILITAS) */}
              <div className="space-y-4 border-t border-slate-100 pt-4">
                <h3 className="text-[10px] italic text-slate-400">Dukungan Aksesibilitas Tersedia</h3>
                <div className="space-y-2">
                  {ACCOMMODATION_TYPES.slice(0, 8).map((item) => (
                    <label key={item} className="group flex cursor-pointer items-center gap-3 rounded-xl border border-transparent p-2 transition-all hover:border-blue-100 hover:bg-blue-50">
                      <input 
                        type="checkbox" 
                        checked={selectedAccommodations.includes(item)}
                        onChange={() => handleFilterChange(item, 'acc')}
                        className="size-5 rounded border-2 border-slate-200 text-blue-600"
                        aria-label={`Filter berdasarkan dukungan ${item}`}
                      />
                      <span className="text-[10px] font-black leading-tight text-slate-600 group-hover:text-blue-700">{item}</span>
                    </label>
                  ))}
                </div>
              </div>

            </div>
          </div>
        </aside>

        {/* FEED LOWONGAN */}
        <main className="flex-1 space-y-6">
          <div className="flex items-center justify-between px-4">
            <h2 className="text-[11px] font-black uppercase tracking-widest text-slate-400">
              Menampilkan <span className="rounded-md border border-blue-100 bg-blue-50 px-2 py-0.5 text-blue-600">{jobs.length}</span> Lowongan Inklusif
            </h2>
          </div>

          {loading ? (
             <div className="space-y-6">
                {[1, 2, 3].map(i => <div key={i} className="h-48 animate-pulse rounded-[3.5rem] border-2 border-slate-50 bg-white shadow-sm"></div>)}
             </div>
          ) : jobs.length === 0 ? (
            <div className="rounded-[4rem] border-4 border-dashed border-slate-100 bg-white py-32 text-center">
              <div className="mx-auto mb-6 flex size-20 items-center justify-center rounded-full bg-slate-50 text-slate-200"><Briefcase size={40} aria-hidden="true" /></div>
              <p className="text-sm font-black uppercase italic tracking-widest text-slate-300">Tidak ada data yang sesuai dengan kriteria riset Anda.</p>
              <button onClick={handleReset} className="mt-4 text-[10px] font-black uppercase text-blue-600 underline underline-offset-4">Bersihkan Filter</button>
            </div>
          ) : (
            <div className="grid gap-6">
              {jobs.map((job) => (
                <Link key={job.id} href={`/lowongan/${job.slug}`} className="group relative flex flex-col items-center justify-between gap-10 overflow-hidden rounded-[3.5rem] border-2 border-slate-100 bg-white p-8 shadow-sm transition-all hover:border-slate-900 hover:shadow-2xl md:flex-row md:p-10">
                  
                  <div className="w-full flex-1 space-y-6 text-left">
                    <div className="space-y-2">
                      <div className="mb-2 flex items-center gap-2">
                        <div className="flex size-8 shrink-0 items-center justify-center rounded-xl bg-slate-900 text-white"><Building2 size={16} aria-hidden="true" /></div>
                        <span className="max-w-[200px] truncate text-[11px] font-black uppercase tracking-widest text-slate-500">{job.companies?.name}</span>
                        {job.companies?.is_verified && <CheckCircle size={16} className="shrink-0 text-blue-500" aria-hidden="true" />}
                      </div>
                      <h2 className="text-2xl font-black uppercase italic leading-none tracking-tighter text-slate-900 transition-colors group-hover:text-blue-600 md:text-3xl">
                        {job.title}
                      </h2>
                    </div>

                    <div className="flex flex-wrap gap-4 text-[10px] font-black uppercase italic tracking-tighter">
                      <span className="flex items-center gap-2 rounded-xl border border-slate-100 bg-slate-50 px-3 py-1.5 text-slate-500 shadow-sm"><MapPin size={12} className="text-red-500" aria-hidden="true" /> {job.location}</span>
                      <span className="flex items-center gap-2 rounded-xl border border-blue-100 bg-blue-50 px-3 py-1.5 text-blue-600 shadow-sm"><GraduationCap size={12} aria-hidden="true" /> {job.required_education_level}</span>
                      <span className="flex items-center gap-2 rounded-xl border border-emerald-100 bg-emerald-50 px-3 py-1.5 text-emerald-600 shadow-sm"><Monitor size={12} aria-hidden="true" /> {job.work_mode}</span>
                    </div>

                    {/* ACCOMMODATION TAGS: Tunjukkan kesiapan instansi */}
                    <div className="flex flex-wrap gap-2 border-t-2 border-dashed border-slate-50 pt-4">
                      <span className="mr-2 mt-1 text-[9px] font-black uppercase tracking-widest text-slate-300">Dukungan:</span>
                      {job.preferred_disability_tools?.slice(0, 4).map((tool: string) => (
                        <span key={tool} className="rounded-full bg-slate-900 px-3 py-1 text-[9px] font-black uppercase tracking-tighter text-white">
                          {tool}
                        </span>
                      ))}
                      {job.preferred_disability_tools?.length > 4 && <span className="self-center text-[9px] font-black text-slate-300">+{job.preferred_disability_tools.length - 4}</span>}
                    </div>
                  </div>

                  <div className="flex w-full shrink-0 items-center gap-10 border-t pt-8 md:w-auto md:border-l-2 md:border-t-0 md:border-slate-50 md:pl-10 md:pt-0">
                    <div className="flex-1 space-y-1 text-left md:flex-none md:text-right">
                      <p className="text-[9px] font-black uppercase italic tracking-[0.2em] text-slate-300">Estimasi Gaji</p>
                      <p className="text-2xl font-black tracking-tighter text-slate-900">
                        <DollarSign size={20} className="mb-1 inline text-emerald-500" aria-hidden="true" />
                        {job.salary_min > 0 ? `${(job.salary_min/1000000).toFixed(1)} - ${(job.salary_max/1000000).toFixed(1)} Jt` : "Kompetitif"}
                      </p>
                    </div>
                    <div className="rounded-3xl bg-slate-900 p-5 text-white shadow-xl transition-all active:scale-90 group-hover:translate-x-2 group-hover:bg-blue-700">
                      <ChevronRight size={28} aria-hidden="true" />
                    </div>
                  </div>

                </Link>
              ))}
            </div>
          )}
          
          <div className="pt-10 text-center">
            <p className="text-[9px] font-bold uppercase italic tracking-[0.4em] text-slate-300">disabilitas.com © 2026 • Inklusi Melalui Kompetensi</p>
          </div>
        </main>
      </div>
    </div>
  );
}
