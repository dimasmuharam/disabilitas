"use client";

import React, { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { 
  Search, Filter, BookOpen, MapPin, 
  Calendar, Zap, GraduationCap, ArrowRight,
  SlidersHorizontal, X, LayoutGrid, Building2
} from "lucide-react";
import Link from "next/link";
import { DISABILITY_TYPES, TRAINING_ORGANIZER_CATEGORIES } from "@/lib/data-static";

export default function TrainingExplorer() {
  const [trainings, setTrainings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  // States Filter
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedDisability, setSelectedDisability] = useState<string>("");
  const [selectedCategory, setSelectedCategory] = useState<string>("");
  const [isOnline, setIsOnline] = useState<boolean | null>(null);

  useEffect(() => {
    fetchTrainings();
  }, [selectedDisability, selectedCategory, isOnline]);

  async function fetchTrainings() {
    setLoading(true);
    try {
      let query = supabase
        .from("trainings")
        .select(`
          *,
          partners (
            name,
            inclusion_score
          )
        `)
        .eq("is_published", true)
        .order("created_at", { ascending: false });

      if (selectedDisability) {
        query = query.contains("target_disability", [selectedDisability]);
      }
      
      if (selectedCategory) {
        query = query.eq("category", selectedCategory);
      }

      if (isOnline !== null) {
        query = query.eq("is_online", isOnline);
      }

      const { data } = await query;
      setTrainings(data || []);
    } catch (error) {
      console.error("Error fetching trainings:", error);
    } finally {
      setLoading(false);
    }
  }

  const filteredTrainings = trainings.filter(t => 
    t.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (t.partners as any)?.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-slate-50 pb-20 pt-32 px-4">
      <div className="mx-auto max-w-6xl space-y-12">
        
        {/* HEADER & SEARCH */}
        <header className="space-y-8 text-center">
          <div className="space-y-4">
            <h1 className="text-4xl md:text-6xl font-black uppercase italic tracking-tighter text-slate-900 leading-none">
              Jelajah <span className="text-blue-600">Pelatihan</span>
            </h1>
            <p className="mx-auto max-w-2xl text-[10px] md:text-xs font-bold uppercase tracking-[0.2em] text-slate-400 leading-relaxed">
              Tingkatkan kompetensi melalui program inklusif dari berbagai institusi mitra terverifikasi riset nasional.
            </p>
          </div>

          <div className="mx-auto max-w-3xl relative">
            <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
            <input 
              type="text"
              placeholder="Cari judul pelatihan atau nama institusi..."
              className="w-full rounded-[2.5rem] border-2 border-transparent bg-white p-6 pl-16 text-sm font-bold shadow-xl shadow-slate-200/50 outline-none focus:border-blue-600 transition-all"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </header>

        {/* FILTER BAR */}
        <section className="flex flex-wrap items-center justify-center gap-4 bg-white p-6 rounded-[2rem] shadow-sm border border-slate-100">
          <div className="flex items-center gap-2 px-4 border-r border-slate-100">
            <SlidersHorizontal size={16} className="text-slate-400" />
            <span className="text-[10px] font-black uppercase text-slate-900">Filter Riset:</span>
          </div>

          {/* Filter Ragam Disabilitas */}
          <select 
            className="bg-slate-50 rounded-xl px-4 py-2 text-[10px] font-black uppercase outline-none focus:ring-2 focus:ring-blue-600"
            value={selectedDisability}
            onChange={(e) => setSelectedDisability(e.target.value)}
          >
            <option value="">Semua Ragam Disabilitas</option>
            {DISABILITY_TYPES.map(type => <option key={type} value={type}>{type}</option>)}
          </select>

          {/* Filter Kategori */}
          <select 
            className="bg-slate-50 rounded-xl px-4 py-2 text-[10px] font-black uppercase outline-none focus:ring-2 focus:ring-blue-600"
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
          >
            <option value="">Semua Kategori</option>
            {TRAINING_ORGANIZER_CATEGORIES.map(cat => <option key={cat} value={cat}>{cat}</option>)}
          </select>

          <button 
            onClick={() => {
              setSelectedDisability("");
              setSelectedCategory("");
              setIsOnline(null);
              setSearchTerm("");
            }}
            className="text-[9px] font-black uppercase text-red-500 hover:underline"
          >
            Reset Filter
          </button>
        </section>
        {/* TRAINING GRID */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {loading ? (
            Array(6).fill(0).map((_, i) => (
              <div key={i} className="h-64 rounded-[2.5rem] bg-slate-200 animate-pulse" />
            ))
          ) : filteredTrainings.map((training) => {
            const partner = training.partners as any;
            return (
              <Link 
                key={training.id}
                href={`/pelatihan/${training.id}`}
                className="group relative flex flex-col justify-between rounded-[3rem] border-2 border-transparent bg-white p-8 shadow-sm transition-all hover:border-blue-600 hover:shadow-2xl hover:shadow-blue-100 hover:-translate-y-2"
              >
                <div className="space-y-4 text-left">
                  <div className="flex items-center justify-between">
                    <span className="rounded-full bg-blue-50 px-3 py-1 text-[8px] font-black uppercase text-blue-600">
                      {training.category}
                    </span>
                    <div className="flex items-center gap-1 text-emerald-600">
                      <ShieldCheck size={12} />
                      <span className="text-[8px] font-black uppercase">{partner?.inclusion_score || 0}%</span>
                    </div>
                  </div>

                  <h3 className="text-xl font-black uppercase italic tracking-tighter text-slate-900 group-hover:text-blue-600 leading-tight">
                    {training.title}
                  </h3>

                  <div className="flex items-center gap-2">
                    <div className="flex size-6 items-center justify-center rounded-md bg-slate-100 text-slate-900 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                      <Building2 size={12} />
                    </div>
                    <span className="text-[10px] font-black uppercase italic text-slate-600">
                      {partner?.name}
                    </span>
                  </div>

                  <div className="flex flex-wrap gap-2 pt-4">
                    {training.target_disability?.slice(0, 2).map((d: string) => (
                      <span key={d} className="rounded-lg bg-slate-50 px-2 py-1 text-[8px] font-bold text-slate-400 uppercase">
                        {d}
                      </span>
                    ))}
                    {training.target_disability?.length > 2 && <span className="text-[8px] font-bold text-slate-300">+{training.target_disability.length - 2}</span>}
                  </div>
                </div>

                <div className="mt-8 flex items-center justify-between border-t border-slate-50 pt-6">
                  <div className="flex items-center gap-3 text-[9px] font-bold text-slate-400 uppercase">
                    <div className="flex items-center gap-1">
                      <MapPin size={12} /> {training.is_online ? "Online" : training.location}
                    </div>
                  </div>
                  <div className="flex size-10 items-center justify-center rounded-full bg-slate-900 text-white transition-transform group-hover:rotate-[-45deg] group-hover:bg-blue-600">
                    <ArrowRight size={18} />
                  </div>
                </div>
              </Link>
            );
          })}
        </div>

        {/* EMPTY STATE */}
        {!loading && filteredTrainings.length === 0 && (
          <div className="py-20 text-center space-y-4">
            <div className="mx-auto flex size-20 items-center justify-center rounded-full bg-slate-100 text-slate-300">
              <Search size={40} />
            </div>
            <p className="text-xs font-black uppercase tracking-widest text-slate-400">
              Tidak ada pelatihan yang cocok dengan filter Anda.
            </p>
            <button 
              onClick={() => { setSelectedDisability(""); setSelectedCategory(""); setSearchTerm(""); }}
              className="text-[10px] font-black uppercase text-blue-600 hover:underline"
            >
              Lihat Semua Program
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
