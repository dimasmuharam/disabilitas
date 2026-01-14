"use client";

import React, { useState, useEffect, useCallback } from "react";
import { supabase } from "@/lib/supabase";
import { 
  Search, Filter, MapPin, 
  ArrowRight, ShieldCheck, Building2, SlidersHorizontal, Activity,
  Timer, Clock
} from "lucide-react";
import Link from "next/link";
import { DISABILITY_TYPES } from "@/lib/data-static";

export default function TrainingExplorer() {
  const [trainings, setTrainings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedDisability, setSelectedDisability] = useState("");
  const [selectedDuration, setSelectedDuration] = useState(""); // Filter Durasi (JP)

  const fetchTrainings = useCallback(async () => {
    setLoading(true);
    try {
      let query = supabase
        .from("trainings")
        .select("*, partners(name, inclusion_score)")
        .eq("is_published", true)
        .order("created_at", { ascending: false });

      if (selectedDisability) {
        query = query.contains("target_disability", [selectedDisability]);
      }

      // Filter berdasarkan range JP (Logic Dinamis)
      if (selectedDuration === "short") query = query.lt("total_hours", 20);
      else if (selectedDuration === "medium") query = query.gte("total_hours", 20).lte("total_hours", 40);
      else if (selectedDuration === "long") query = query.gt("total_hours", 40);

      const { data, error } = await query;
      if (error) throw error;
      setTrainings(data || []);
    } catch (error) { 
      console.error("[TRAINING_FETCH_ERROR]:", error); 
    } finally { 
      setLoading(false); 
    }
  }, [selectedDisability, selectedDuration]);

  useEffect(() => { 
    fetchTrainings(); 
    const link = document.querySelector("link[rel='canonical']") || document.createElement("link");
    link.setAttribute("rel", "canonical");
    link.setAttribute("href", "https://disabilitas.com/pelatihan");
    if (!document.head.contains(link)) document.head.appendChild(link);
  }, [fetchTrainings]);

  const filtered = trainings.filter(t => 
    t.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
    (t.partners as any)?.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-slate-50 px-4 pt-32 pb-20 text-slate-900 selection:bg-blue-100">
      <div className="mx-auto max-w-6xl space-y-12">
        {/* HEADER & SEARCH */}
        <header className="space-y-8 text-center">
          <h1 className="text-4xl font-black uppercase italic leading-none tracking-tighter md:text-6xl">
            Jelajah <span className="text-blue-600">Pelatihan</span>
          </h1>
          <div className="relative mx-auto max-w-3xl">
            <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
            <input 
              placeholder="Cari kursus atau nama lembaga pelatihan..." 
              className="w-full rounded-[2.5rem] border-4 border-slate-900 bg-white p-6 pl-16 text-sm font-bold shadow-[8px_8px_0px_0px_rgba(15,23,42,1)] outline-none focus:border-blue-600 transition-all" 
              value={searchTerm} 
              onChange={(e) => setSearchTerm(e.target.value)} 
            />
          </div>
        </header>

        {/* FILTER BAR - Dengan Tambahan Filter Durasi JP */}
        <section className="flex flex-wrap items-center justify-center gap-4 rounded-[2rem] border-4 border-slate-900 bg-white p-6 shadow-sm">
          <div className="flex items-center gap-2 border-r-2 border-slate-100 px-4">
            <SlidersHorizontal size={16} className="text-slate-400" />
            <span className="text-[10px] font-black uppercase italic">Filter Cerdas:</span>
          </div>
          
          {/* Filter Ragam Disabilitas */}
          <div className="relative">
            <select 
              className="appearance-none rounded-xl bg-slate-50 px-6 py-3 pr-10 text-[10px] font-black uppercase outline-none focus:ring-2 focus:ring-blue-600 border-2 border-transparent transition-all" 
              value={selectedDisability} 
              onChange={(e) => setSelectedDisability(e.target.value)}
            >
              <option value="">Semua Ragam Disabilitas</option>
              {DISABILITY_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
            </select>
            <Filter size={12} className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400" />
          </div>

          {/* Filter Durasi (JP) */}
          <div className="relative">
            <select 
              className="appearance-none rounded-xl bg-slate-50 px-6 py-3 pr-10 text-[10px] font-black uppercase outline-none focus:ring-2 focus:ring-emerald-600 border-2 border-transparent transition-all" 
              value={selectedDuration} 
              onChange={(e) => setSelectedDuration(e.target.value)}
            >
              <option value="">Semua Durasi (JP)</option>
              <option value="short">Singkat (&lt; 20 JP)</option>
              <option value="medium">Intensif (20 - 40 JP)</option>
              <option value="long">Komprehensif (&gt; 40 JP)</option>
            </select>
            <Clock size={12} className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400" />
          </div>
        </section>

        {/* TRAINING GRID */}
        <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
          {loading ? (
            Array(6).fill(0).map((_, i) => (
              <div key={i} className="h-64 animate-pulse rounded-[3rem] bg-slate-200 border-4 border-slate-100" />
            ))
          ) : filtered.length > 0 ? (
            filtered.map((t) => (
              <Link 
                key={t.id} 
                href={`/pelatihan/${t.slug || t.id}`} 
                className="group relative flex flex-col justify-between rounded-[3rem] border-4 border-slate-900 bg-white p-8 transition-all hover:-translate-y-2 hover:shadow-[12px_12px_0px_0px_rgba(37,99,235,1)]"
              >
                <div className="space-y-4 text-left">
                  <div className="flex items-center justify-between">
                    <span className="rounded-full bg-blue-50 px-3 py-1 text-[8px] font-black uppercase text-blue-600 tracking-widest border border-blue-100">
                      {t.is_online ? "Daring" : "Luring"}
                    </span>
                    <div className="flex items-center gap-1 text-emerald-600">
                      <ShieldCheck size={12} />
                      <span className="text-[8px] font-black uppercase">{(t.partners as any)?.inclusion_score || 0}% Inclusion</span>
                    </div>
                  </div>

                  <h3 className="text-2xl font-black uppercase italic leading-tight tracking-tighter text-slate-900 group-hover:text-blue-600 transition-colors">
                    {t.title}
                  </h3>

                  <div className="flex flex-col gap-2">
                    <div className="flex items-center gap-2">
                      <Building2 size={14} className="text-slate-400" />
                      <span className="text-[10px] font-black uppercase italic text-slate-500 tracking-tight">
                        {(t.partners as any)?.name}
                      </span>
                    </div>
                    {/* Badge Jam Pelajaran (JP) */}
                    <div className="flex items-center gap-2">
                      <Timer size={14} className="text-blue-600" />
                      <span className="text-[10px] font-black uppercase text-blue-600">
                        {t.total_hours || 0} Jam Pelajaran (JP)
                      </span>
                    </div>
                  </div>
                </div>
                
                <div className="mt-8 flex items-center justify-between border-t-4 border-slate-900 pt-6">
                  <div className="flex flex-col gap-1 text-left">
                    <div className="flex items-center gap-1 text-[9px] font-black uppercase text-slate-900">
                      <MapPin size={12} className="text-blue-600" /> {t.is_online ? "Seluruh Indonesia" : t.location}
                    </div>
                    <p className="text-[8px] font-bold uppercase text-slate-400 italic">Deadline: {new Date(t.registration_deadline).toLocaleDateString('id-ID')}</p>
                  </div>
                  <div className="flex size-10 items-center justify-center rounded-full bg-slate-900 text-white transition-all group-hover:-rotate-45 group-hover:bg-blue-600 shadow-lg">
                    <ArrowRight size={18} />
                  </div>
                </div>
              </Link>
            ))
          ) : (
            <div className="col-span-full py-32 text-center rounded-[3rem] border-4 border-dashed border-slate-200">
               <Activity size={64} className="mx-auto mb-6 text-slate-200" />
               <h2 className="text-2xl font-black uppercase italic text-slate-300 tracking-tighter">Pelatihan Tidak Ditemukan</h2>
               <p className="text-[10px] font-bold uppercase text-slate-400 mt-2 italic">Coba ubah kata kunci atau filter pencarian Anda</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}