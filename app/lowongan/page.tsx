"use client";

export const runtime = 'edge';

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import Link from "next/link";
import { 
  MapPin, Briefcase, DollarSign, Filter, 
  Search, Building2, CheckCircle, Monitor, 
  X, GraduationCap, ChevronRight 
} from "lucide-react";

import { 
  WORK_MODES, 
  EMPLOYMENT_TYPES, 
  ACCOMMODATION_TYPES 
} from "@/lib/data-static";

export default function LowonganPage() {
  const [jobs, setJobs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  // State Filter & Search
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedAccommodations, setSelectedAccommodations] = useState<string[]>([]);
  const [selectedTypes, setSelectedTypes] = useState<string[]>([]);
  const [selectedWorkModes, setSelectedWorkModes] = useState<string[]>([]);

  useEffect(() => {
    fetchJobs();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedAccommodations, selectedTypes, selectedWorkModes]); 

  async function fetchJobs() {
    setLoading(true);
    try {
      let query = supabase
        .from('jobs')
        .select(`
          *,
          companies (
            name,
            is_verified,
            location
          )
        `)
        .eq('is_active', true)
        .order('created_at', { ascending: false });

      if (searchQuery) {
        query = query.ilike('title', `%${searchQuery}%`);
      }

      // Filter Akomodasi (Sesuai kolom preferred_disability_tools)
      if (selectedAccommodations.length > 0) {
        query = query.contains('preferred_disability_tools', selectedAccommodations);
      }

      if (selectedTypes.length > 0) {
        query = query.in('job_type', selectedTypes);
      }

      if (selectedWorkModes.length > 0) {
        query = query.in('work_mode', selectedWorkModes);
      }

      const { data, error } = await query;
      if (error) throw error;
      setJobs(data || []);
    } catch (error) {
      console.error("Error fetching jobs", error);
    } finally {
      setLoading(false);
    }
  }

  const formatSalary = (min: number, max: number) => {
    if (!min && !max) return "Kompetitif";
    const format = (n: number) => (n / 1000000).toFixed(1);
    return `Rp ${format(min)} - ${format(max)} Juta`;
  };

  const timeAgo = (dateString: string) => {
    const days = Math.floor((new Date().getTime() - new Date(dateString).getTime()) / (1000 * 3600 * 24));
    if (days === 0) return "Hari ini";
    if (days === 1) return "Kemarin";
    return `${days} hari lalu`;
  };

  const handleFilterChange = (value: string, category: 'acc' | 'type' | 'mode') => {
    const setters = {
      acc: [selectedAccommodations, setSelectedAccommodations],
      type: [selectedTypes, setSelectedTypes],
      mode: [selectedWorkModes, setSelectedWorkModes]
    };
    const [state, setter] = setters[category] as [string[], any];
    setter(state.includes(value) ? state.filter(i => i !== value) : [...state, value]);
  };
  return (
    <div className="flex flex-col bg-[#F8FAFC] min-h-screen font-sans">
      
      {/* SEARCH HEADER */}
      <header className="bg-white border-b-2 border-slate-100 py-16 shadow-sm">
        <div className="max-w-7xl mx-auto px-6">
          <h1 className="text-4xl font-black italic uppercase tracking-tighter text-slate-900 mb-8 animate-in slide-in-from-left">
            Jelajah Karir Inklusif
          </h1>
          
          <form onSubmit={(e) => { e.preventDefault(); fetchJobs(); }} className="flex flex-col md:flex-row gap-4 max-w-4xl">
            <div className="relative flex-1 group">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400 group-focus-within:text-blue-600 transition-colors" />
              <input 
                type="text" 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Cari posisi pekerjaan (Contoh: Admin, IT, Desain)..." 
                className="w-full h-16 pl-12 pr-4 rounded-[1.5rem] border-2 border-slate-100 bg-white text-base font-bold focus:border-blue-600 outline-none shadow-sm transition-all"
              />
            </div>
            <button type="submit" className="h-16 px-10 rounded-[1.5rem] bg-slate-900 text-white font-black uppercase text-sm hover:bg-blue-600 transition-all shadow-xl active:scale-95">
              Cari Lowongan
            </button>
          </form>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-6 py-12 flex flex-col lg:flex-row gap-12">
        
        {/* SIDEBAR FILTER - AKSESIBEL */}
        <aside className="w-full lg:w-80 space-y-10">
          <section className="bg-white p-8 rounded-[2.5rem] border-2 border-slate-900 shadow-[6px_6px_0px_0px_rgba(15,23,42,1)]">
            <h2 className="flex items-center gap-2 font-black uppercase italic tracking-tighter text-lg text-slate-900 mb-8 border-b-2 border-slate-50 pb-4">
              <Filter className="h-5 w-5 text-blue-600" /> Filter Riset
            </h2>

            <div className="space-y-8">
              {/* Filter Akomodasi */}
              <div className="space-y-4">
                <h3 className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Dukungan Akomodasi</h3>
                <div className="space-y-2">
                  {ACCOMMODATION_TYPES.slice(0, 7).map((item) => (
                    <label key={item} className="flex items-center gap-3 cursor-pointer group">
                      <input 
                        type="checkbox" 
                        checked={selectedAccommodations.includes(item)}
                        onChange={() => handleFilterChange(item, 'acc')}
                        className="w-5 h-5 rounded border-2 border-slate-200 text-blue-600 focus:ring-blue-600" 
                      />
                      <span className="text-[11px] font-bold uppercase text-slate-600 group-hover:text-blue-600 transition-colors">{item}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Filter Work Mode */}
              <div className="space-y-4 pt-6 border-t border-slate-100">
                <h3 className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Sistem Kerja</h3>
                <div className="space-y-2">
                  {WORK_MODES.map((mode) => (
                    <label key={mode} className="flex items-center gap-3 cursor-pointer group">
                      <input 
                        type="checkbox" 
                        checked={selectedWorkModes.includes(mode)}
                        onChange={() => handleFilterChange(mode, 'mode')}
                        className="w-5 h-5 rounded border-2 border-slate-200 text-emerald-600 focus:ring-emerald-600" 
                      />
                      <span className="text-[11px] font-bold uppercase text-slate-600 group-hover:text-emerald-600 transition-colors">{mode}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>
          </section>
        </aside>

        {/* LIST LOWONGAN */}
        <main className="flex-1 space-y-6">
          <div className="flex justify-between items-center px-2">
            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400" role="status">
              Ditemukan <span className="text-blue-600">{jobs.length}</span> Lowongan Aktif
            </p>
          </div>

          {loading ? (
            <div className="space-y-6">
              {[1, 2, 3].map(i => <div key={i} className="h-48 rounded-[3rem] bg-white border-2 border-slate-50 animate-pulse"></div>)}
            </div>
          ) : jobs.length === 0 ? (
            <div className="text-center py-24 bg-white rounded-[3rem] border-4 border-dashed border-slate-100">
              <p className="text-sm font-black text-slate-300 uppercase italic tracking-widest">Tidak ada lowongan yang sesuai filter.</p>
              <button onClick={() => { setSelectedAccommodations([]); setSelectedTypes([]); setSelectedWorkModes([]); setSearchQuery(""); }} className="mt-4 text-blue-600 font-black uppercase text-[10px] underline">Reset Semua Filter</button>
            </div>
          ) : (
            <div className="grid gap-6">
              {jobs.map((job) => (
                <Link key={job.id} href={`/lowongan/${job.slug}`} className="group bg-white p-8 rounded-[3.5rem] border-2 border-slate-100 hover:border-slate-900 transition-all shadow-sm hover:shadow-xl flex flex-col md:flex-row justify-between items-center gap-8 relative overflow-hidden">
                  
                  <div className="space-y-5 flex-1 w-full text-left">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 mb-1">
                        <Building2 size={14} className="text-blue-600" />
                        <span className="text-[10px] font-black uppercase text-slate-400 tracking-widest">{job.companies?.name}</span>
                        {job.companies?.is_verified && <CheckCircle size={14} className="text-blue-500" />}
                      </div>
                      <h2 className="text-2xl font-black uppercase italic tracking-tighter text-slate-900 group-hover:text-blue-600 transition-colors leading-tight">
                        {job.title}
                      </h2>
                    </div>

                    <div className="flex flex-wrap gap-4 text-[10px] font-black uppercase">
                      <span className="flex items-center gap-1.5 px-3 py-1 bg-slate-50 rounded-lg text-slate-500 border border-slate-100 italic"><MapPin size={12} className="text-red-500"/> {job.location}</span>
                      <span className="flex items-center gap-1.5 px-3 py-1 bg-blue-50 rounded-lg text-blue-600 border border-blue-100 italic"><Briefcase size={12}/> {job.job_type}</span>
                      <span className="flex items-center gap-1.5 px-3 py-1 bg-emerald-50 rounded-lg text-emerald-600 border border-emerald-100 italic"><Monitor size={12}/> {job.work_mode}</span>
                    </div>

                    <div className="flex flex-wrap gap-2 pt-2 border-t border-slate-50">
                      {job.preferred_disability_tools?.slice(0, 3).map((tool: string) => (
                        <span key={tool} className="text-[8px] font-black bg-emerald-600 text-white px-3 py-1 rounded-full uppercase tracking-tighter">
                          {tool}
                        </li>
                      ))}
                    </div>
                  </div>

                  <div className="flex items-center gap-6 shrink-0 w-full md:w-auto border-t md:border-t-0 md:border-l border-slate-50 pt-6 md:pt-0 md:pl-8">
                    <div className="text-left md:text-right flex-1 md:flex-none space-y-1">
                      <p className="text-[8px] font-black text-slate-300 uppercase tracking-[0.2em]">Estimasi Gaji</p>
                      <p className="text-lg font-black text-slate-900 italic">
                        <DollarSign size={16} className="inline text-emerald-500 mb-1" />
                        {job.salary_min > 0 ? `${(job.salary_min/1000000).toFixed(1)}jt - ${(job.salary_max/1000000).toFixed(1)}jt` : "Kompetitif"}
                      </p>
                    </div>
                    <div className="bg-slate-900 text-white p-5 rounded-3xl group-hover:bg-blue-600 transition-all shadow-lg group-hover:translate-x-2">
                      <ChevronRight size={24} />
                    </div>
                  </div>

                </Link>
              ))}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
