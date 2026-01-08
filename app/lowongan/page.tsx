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
    <div className="flex flex-col bg-[#F8FAFC] min-h-screen font-sans selection:bg-blue-100 selection:text-blue-900">
      
      {/* SEARCH HEADER */}
      <header className="bg-white border-b-2 border-slate-100 py-12 shadow-sm relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-6 relative z-10">
          <div className="flex flex-col md:flex-row justify-between items-end gap-6 mb-10">
            <div className="space-y-2 text-left">
              <h1 className="text-4xl font-black italic uppercase tracking-tighter text-slate-900 leading-none">
                Eksplorasi Peluang
              </h1>
              <p className="text-slate-400 font-bold uppercase text-[10px] tracking-[0.3em]">
                Berdasarkan Kompetensi & Kesiapan Akomodasi Instansi
              </p>
            </div>
            
            <div className="flex items-center gap-3 bg-slate-100 p-2 rounded-2xl border-2 border-slate-200">
              <ListFilter size={18} className="ml-2 text-slate-500" />
              <select 
                aria-label="Urutkan Lowongan"
                value={sortBy} 
                onChange={(e) => setSortBy(e.target.value)}
                className="bg-transparent text-[10px] font-black uppercase outline-none pr-4 cursor-pointer text-slate-700"
              >
                <option value="latest">Terbaru</option>
                <option value="salary_high">Gaji Tertinggi</option>
              </select>
            </div>
          </div>
          
          <form onSubmit={(e) => { e.preventDefault(); fetchJobs(); }} className="flex flex-col md:flex-row gap-4 max-w-5xl">
            <div className="relative flex-[2] group">
              <Search className="absolute left-5 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400 group-focus-within:text-blue-600 transition-colors" />
              <input 
                type="text" 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Cari posisi pekerjaan..." 
                className="w-full h-16 pl-14 pr-4 rounded-[1.5rem] border-2 border-slate-100 font-bold bg-slate-50/50 focus:bg-white focus:border-blue-600 outline-none transition-all shadow-inner"
              />
            </div>
            <div className="relative flex-1">
              <MapPin className="absolute left-5 top-1/2 -translate-y-1/2 h-5 w-5 text-red-500" />
              <select 
                aria-label="Pilih Kota"
                value={selectedCity}
                onChange={(e) => setSelectedCity(e.target.value)}
                className="w-full h-16 pl-14 pr-6 rounded-[1.5rem] border-2 border-slate-100 font-bold bg-white outline-none appearance-none cursor-pointer focus:border-blue-600 shadow-sm"
              >
                <option value="">Seluruh Lokasi</option>
                {INDONESIA_CITIES.map(city => <option key={city} value={city}>{city}</option>)}
              </select>
            </div>
            <button type="submit" className="h-16 px-10 rounded-[1.5rem] bg-slate-900 text-white font-black uppercase text-xs hover:bg-blue-600 transition-all shadow-xl active:scale-95 flex items-center justify-center gap-3">
              Cari Sekarang
            </button>
          </form>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-6 py-12 flex flex-col lg:flex-row gap-12">
        
        {/* SIDEBAR FILTER: DEEP COMPETECE & ACCESS */}
        <aside className="w-full lg:w-80 space-y-8">
          <div className="bg-white p-8 rounded-[3rem] border-2 border-slate-900 shadow-[8px_8px_0px_0px_rgba(15,23,42,1)] sticky top-8">
            <div className="flex justify-between items-center mb-8 border-b-2 border-slate-50 pb-4">
              <h2 className="font-black uppercase italic text-sm flex items-center gap-2">
                <Filter size={18} className="text-blue-600" /> Filter Lanjutan
              </h2>
              <button onClick={handleReset} className="p-2 hover:bg-red-50 rounded-xl transition-colors text-red-500" title="Reset Filter">
                <RotateCcw size={18} />
              </button>
            </div>

            <div className="space-y-8 h-[calc(100vh-320px)] overflow-y-auto pr-3 custom-scrollbar text-left font-black uppercase tracking-tighter">
              
              {/* PENDIDIKAN */}
              <div className="space-y-3">
                <label className="text-[10px] text-slate-400 flex items-center gap-2 italic"><GraduationCap size={14}/> Jenjang Pendidikan</label>
                <select value={selectedEducation} onChange={(e) => setSelectedEducation(e.target.value)} className="w-full p-4 rounded-2xl border-2 border-slate-50 bg-slate-50 text-[11px] font-bold outline-none focus:border-blue-600 transition-all">
                  <option value="">Semua Jenjang</option>
                  {EDUCATION_LEVELS.map(edu => <option key={edu} value={edu}>{edu}</option>)}
                </select>
              </div>

              {/* JURUSAN */}
              <div className="space-y-3">
                <label className="text-[10px] text-slate-400 flex items-center gap-2 italic"><BookOpen size={14}/> Fokus Jurusan</label>
                <select value={selectedMajor} onChange={(e) => setSelectedMajor(e.target.value)} className="w-full p-4 rounded-2xl border-2 border-slate-50 bg-slate-50 text-[11px] font-bold outline-none focus:border-blue-600 transition-all">
                  <option value="">Semua Jurusan</option>
                  {UNIVERSITY_MAJORS.map(major => <option key={major} value={major}>{major}</option>)}
                </select>
              </div>

              {/* SKILL UTAMA */}
              <div className="space-y-3">
                <label className="text-[10px] text-slate-400 flex items-center gap-2 italic"><Wrench size={14}/> Spesialisasi Keahlian</label>
                <select value={selectedSkill} onChange={(e) => setSelectedSkill(e.target.value)} className="w-full p-4 rounded-2xl border-2 border-slate-50 bg-slate-50 text-[11px] font-bold outline-none focus:border-emerald-600 transition-all">
                  <option value="">Semua Skill</option>
                  {SKILLS_LIST.map(skill => <option key={skill} value={skill}>{skill}</option>)}
                </select>
              </div>

              {/* RANGE GAJI */}
              <div className="space-y-4 pt-4 border-t border-slate-100">
                <label className="text-[10px] text-slate-400 flex items-center justify-between italic">
                  <span><DollarSign size={14} className="inline mb-0.5"/> Min. Gaji</span>
                  <span className="text-slate-900 font-black">Rp {minSalary/1000000} Jt</span>
                </label>
                <input type="range" min="0" max="25000000" step="1000000" value={minSalary} onChange={(e) => setMinSalary(parseInt(e.target.value))} className="w-full h-2 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-slate-900" />
              </div>

              {/* DUKUNGAN AKOMODASI (PENGGANTI RAGAM DISABILITAS) */}
              <div className="space-y-4 pt-4 border-t border-slate-100">
                <h3 className="text-[10px] text-slate-400 italic">Dukungan Aksesibilitas Tersedia</h3>
                <div className="space-y-2">
                  {ACCOMMODATION_TYPES.slice(0, 8).map((item) => (
                    <label key={item} className="flex items-center gap-3 cursor-pointer group p-2 rounded-xl hover:bg-blue-50 transition-all border border-transparent hover:border-blue-100">
                      <input 
                        type="checkbox" 
                        checked={selectedAccommodations.includes(item)}
                        onChange={() => handleFilterChange(item, 'acc')}
                        className="w-5 h-5 rounded border-2 border-slate-200 text-blue-600" 
                      />
                      <span className="text-[10px] font-black text-slate-600 group-hover:text-blue-700 leading-tight">{item}</span>
                    </label>
                  ))}
                </div>
              </div>

            </div>
          </div>
        </aside>

        {/* FEED LOWONGAN */}
        <main className="flex-1 space-y-6">
          <div className="flex justify-between items-center px-4">
            <h2 className="text-[11px] font-black uppercase tracking-widest text-slate-400">
              Menampilkan <span className="text-blue-600 bg-blue-50 px-2 py-0.5 rounded-md border border-blue-100">{jobs.length}</span> Lowongan Inklusif
            </h2>
          </div>

          {loading ? (
             <div className="space-y-6">
                {[1, 2, 3].map(i => <div key={i} className="h-48 rounded-[3.5rem] bg-white border-2 border-slate-50 animate-pulse shadow-sm"></div>)}
             </div>
          ) : jobs.length === 0 ? (
            <div className="text-center py-32 bg-white rounded-[4rem] border-4 border-dashed border-slate-100">
              <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-6 text-slate-200"><Briefcase size={40} /></div>
              <p className="text-sm font-black text-slate-300 uppercase italic tracking-widest">Tidak ada data yang sesuai dengan kriteria riset Anda.</p>
              <button onClick={handleReset} className="mt-4 text-blue-600 font-black uppercase text-[10px] underline underline-offset-4">Bersihkan Filter</button>
            </div>
          ) : (
            <div className="grid gap-6">
              {jobs.map((job) => (
                <Link key={job.id} href={`/lowongan/${job.slug}`} className="group bg-white p-8 md:p-10 rounded-[3.5rem] border-2 border-slate-100 hover:border-slate-900 transition-all shadow-sm hover:shadow-2xl flex flex-col md:flex-row justify-between items-center gap-10 relative overflow-hidden">
                  
                  <div className="space-y-6 flex-1 w-full text-left">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 mb-2">
                        <div className="w-8 h-8 bg-slate-900 rounded-xl flex items-center justify-center text-white shrink-0"><Building2 size={16} /></div>
                        <span className="text-[11px] font-black uppercase text-slate-500 tracking-widest truncate max-w-[200px]">{job.companies?.name}</span>
                        {job.companies?.is_verified && <CheckCircle size={16} className="text-blue-500 shrink-0" />}
                      </div>
                      <h2 className="text-2xl md:text-3xl font-black uppercase italic tracking-tighter text-slate-900 group-hover:text-blue-600 transition-colors leading-none">
                        {job.title}
                      </h2>
                    </div>

                    <div className="flex flex-wrap gap-4 text-[10px] font-black uppercase tracking-tighter italic">
                      <span className="flex items-center gap-2 px-3 py-1.5 bg-slate-50 rounded-xl text-slate-500 border border-slate-100 shadow-sm"><MapPin size={12} className="text-red-500"/> {job.location}</span>
                      <span className="flex items-center gap-2 px-3 py-1.5 bg-blue-50 rounded-xl text-blue-600 border border-blue-100 shadow-sm"><GraduationCap size={12}/> {job.required_education_level}</span>
                      <span className="flex items-center gap-2 px-3 py-1.5 bg-emerald-50 rounded-xl text-emerald-600 border border-emerald-100 shadow-sm"><Monitor size={12}/> {job.work_mode}</span>
                    </div>

                    {/* ACCOMMODATION TAGS: Tunjukkan kesiapan instansi */}
                    <div className="flex flex-wrap gap-2 pt-4 border-t-2 border-slate-50 border-dashed">
                      <span className="text-[9px] font-black text-slate-300 uppercase tracking-widest mr-2 mt-1">Dukungan:</span>
                      {job.preferred_disability_tools?.slice(0, 4).map((tool: string) => (
                        <span key={tool} className="text-[9px] font-black bg-slate-900 text-white px-3 py-1 rounded-full uppercase tracking-tighter">
                          {tool}
                        </span>
                      ))}
                      {job.preferred_disability_tools?.length > 4 && <span className="text-[9px] font-black text-slate-300 self-center">+{job.preferred_disability_tools.length - 4}</span>}
                    </div>
                  </div>

                  <div className="flex items-center gap-10 shrink-0 w-full md:w-auto border-t md:border-t-0 md:border-l-2 md:border-slate-50 pt-8 md:pt-0 md:pl-10">
                    <div className="text-left md:text-right flex-1 md:flex-none space-y-1">
                      <p className="text-[9px] font-black text-slate-300 uppercase tracking-[0.2em] italic">Estimasi Gaji</p>
                      <p className="text-2xl font-black text-slate-900 tracking-tighter">
                        <DollarSign size={20} className="inline text-emerald-500 mb-1" />
                        {job.salary_min > 0 ? `${(job.salary_min/1000000).toFixed(1)} - ${(job.salary_max/1000000).toFixed(1)} Jt` : "Kompetitif"}
                      </p>
                    </div>
                    <div className="bg-slate-900 text-white p-5 rounded-3xl group-hover:bg-blue-600 transition-all shadow-xl group-hover:translate-x-2 active:scale-90">
                      <ChevronRight size={28} />
                    </div>
                  </div>

                </Link>
              ))}
            </div>
          )}
          
          <div className="pt-10 text-center">
            <p className="text-[9px] font-bold text-slate-300 uppercase tracking-[0.4em] italic">disabilitas.com © 2026 • Inklusi Melalui Kompetensi</p>
          </div>
        </main>
      </div>
    </div>
  );
}
