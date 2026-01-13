"use client";

import React, { useState, useEffect, useCallback } from "react";
import { supabase } from "@/lib/supabase";
import { 
  Search, Filter, MapPin, 
  ArrowRight, ShieldCheck, Building2, SlidersHorizontal, Activity
} from "lucide-react";
import Link from "next/link";
import { DISABILITY_TYPES } from "@/lib/data-static"; // Hapus TRAINING_ORGANIZER_CATEGORIES

export default function TrainingExplorer() {
  const [trainings, setTrainings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedDisability, setSelectedDisability] = useState("");

  const fetchTrainings = useCallback(async () => {
    setLoading(true);
    try {
      // Query ke tabel trainings, join dengan partners untuk ambil nama & skor inklusi
      let query = supabase
        .from("trainings")
        .select("*, partners(name, inclusion_score)")
        .eq("is_published", true)
        .order("created_at", { ascending: false });

      // Filter berdasarkan ragam disabilitas yang didukung
      if (selectedDisability) {
        query = query.contains("target_disability", [selectedDisability]);
      }

      const { data, error } = await query;
      if (error) throw error;
      setTrainings(data || []);
    } catch (error) { 
      console.error("[TRAINING_FETCH_ERROR]:", error); 
    } finally { 
      setLoading(false); 
    }
  }, [selectedDisability]);

  useEffect(() => { 
    fetchTrainings(); 
    // Set Canonical Link
    const link = document.querySelector("link[rel='canonical']") || document.createElement("link");
    link.setAttribute("rel", "canonical");
    link.setAttribute("href", "https://disabilitas.com/pelatihan");
    if (!document.head.contains(link)) document.head.appendChild(link);
  }, [fetchTrainings]);

  // Pencarian client-side berdasarkan judul atau nama lembaga
  const filtered = trainings.filter(t => 
    t.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
    (t.partners as any)?.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-slate-50 px-4 pt-32 pb-20 text-slate-900">
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

        {/* FILTER BAR - Ramping (Tanpa Kategori) */}
        <section className="flex flex-wrap items-center justify-center gap-4 rounded-[2rem] border-4 border-slate-900 bg-white p-6 shadow-sm">
          <div className="flex items-center gap-2 border-r-2 border-slate-100 px-4">
            <SlidersHorizontal size={16} className="text-slate-400" />
            <span className="text-[10px] font-black uppercase">Filter Riset:</span>
          </div>
          <div className="relative">
            <select 
              className="appearance-none rounded-xl bg-slate-50 px-6 py-3 pr-10 text-[10px] font-black uppercase outline-none focus:ring-2 focus:ring-blue-600 border-2 border-transparent" 
              value={selectedDisability} 
              onChange={(e) => setSelectedDisability(e.target.value)}
            >
              <option value="">Semua Ragam Disabilitas</option>
              {DISABILITY_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
            </select>
            <Filter size={12} className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400" />
          </div>
        </section>

        {/* TRAINING GRID */}
        <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
          {loading ? (
            Array(6).fill(0).map((_, i) => (
              <div key={i} className="h-64 animate-pulse rounded-[3rem] bg-slate-200" />
            ))
          ) : filtered.length > 0 ? (
            filtered.map((t) => (
              <Link 
                key={t.id} 
                href={`/pelatihan/${t.id}`} 
                className="group relative flex flex-col justify-between rounded-[3rem] border-4 border-slate-900 bg-white p-8 transition-all hover:-translate-y-2 hover:shadow-[12px_12px_0px_0px_rgba(37,99,235,0.2)]"
              >
                <div className="space-y-4 text-left">
                  <div className="flex items-center justify-between">
                    <span className="rounded-full bg-blue-50 px-3 py-1 text-[8px] font-black uppercase text-blue-600 tracking-widest">
                      {t.category || "Skill Training"}
                    </span>
                    <div className="flex items-center gap-1 text-emerald-600">
                      <ShieldCheck size={12} />
                      <span className="text-[8px] font-black uppercase">{(t.partners as any)?.inclusion_score || 0}% Score</span>
                    </div>
                  </div>
                  <h3 className="text-2xl font-black uppercase italic leading-tight tracking-tighter text-slate-900 group-hover:text-blue-600">
                    {t.title}
                  </h3>
                  <div className="flex items-center gap-2">
                    <div className="flex size-6 items-center justify-center rounded-md bg-slate-100 text-slate-900 transition-colors group-hover:bg-blue-600 group-hover:text-white">
                      <Building2 size={12} />
                    </div>
                    <span className="text-[10px] font-black uppercase italic text-slate-500 tracking-tight">
                      {(t.partners as any)?.name}
                    </span>
                  </div>
                </div>
                
                <div className="mt-8 flex items-center justify-between border-t-2 border-slate-50 pt-6">
                  <div className="flex items-center gap-1 text-[9px] font-bold uppercase text-slate-400">
                    <MapPin size={12} /> {t.is_online ? "Remote / Online" : t.location}
                  </div>
                  <div className="flex size-10 items-center justify-center rounded-full bg-slate-900 text-white transition-all group-hover:-rotate-45 group-hover:bg-blue-600">
                    <ArrowRight size={18} />
                  </div>
                </div>
              </Link>
            ))
          ) : (
            <div className="col-span-full py-20 text-center">
               <Activity size={48} className="mx-auto mb-4 text-slate-200" />
               <p className="font-black uppercase italic text-slate-300">Tidak ada pelatihan yang ditemukan.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
