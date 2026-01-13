"use client";

import React, { useState, useEffect, useCallback } from "react";
import { supabase } from "@/lib/supabase";
import { 
  Search, Filter, MapPin, 
  ArrowRight, ShieldCheck, Building2, SlidersHorizontal
} from "lucide-react";
import Link from "next/link";
import { DISABILITY_TYPES, TRAINING_ORGANIZER_CATEGORIES } from "@/lib/data-static";

export default function TrainingExplorer() {
  const [trainings, setTrainings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedDisability, setSelectedDisability] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");

  const fetchTrainings = useCallback(async () => {
    setLoading(true);
    try {
      let query = supabase.from("trainings").select("*, partners(name, inclusion_score)").eq("is_published", true).order("created_at", { ascending: false });
      if (selectedDisability) query = query.contains("target_disability", [selectedDisability]);
      if (selectedCategory) query = query.eq("category", selectedCategory);
      const { data } = await query;
      setTrainings(data || []);
    } catch (error) { console.error(error); } finally { setLoading(false); }
  }, [selectedDisability, selectedCategory]);

  useEffect(() => { fetchTrainings(); }, [fetchTrainings]);

  const filtered = trainings.filter(t => t.title.toLowerCase().includes(searchTerm.toLowerCase()) || (t.partners as any)?.name.toLowerCase().includes(searchTerm.toLowerCase()));

  return (
    <div className="min-h-screen bg-slate-50 px-4 pt-32 pb-20">
      <div className="mx-auto max-w-6xl space-y-12">
        <header className="space-y-8 text-center">
          <h1 className="text-4xl font-black uppercase italic leading-none tracking-tighter text-slate-900 md:text-6xl">Jelajah <span className="text-blue-600">Pelatihan</span></h1>
          <div className="relative mx-auto max-w-3xl">
            <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
            <input placeholder="Cari pelatihan..." className="w-full rounded-[2.5rem] bg-white p-6 pl-16 text-sm font-bold shadow-xl shadow-slate-200/50 outline-none focus:border-blue-600 border-2 border-transparent transition-all" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
          </div>
        </header>

        <section className="flex flex-wrap items-center justify-center gap-4 rounded-[2rem] border border-slate-100 bg-white p-6 shadow-sm">
          <div className="flex items-center gap-2 border-r border-slate-100 px-4"><SlidersHorizontal size={16} className="text-slate-400" /><span className="text-[10px] font-black uppercase text-slate-900">Filter:</span></div>
          <select className="rounded-xl bg-slate-50 px-4 py-2 text-[10px] font-black uppercase outline-none focus:ring-2 focus:ring-blue-600" value={selectedDisability} onChange={(e) => setSelectedDisability(e.target.value)}>
            <option value="">Semua Ragam Disabilitas</option>
            {DISABILITY_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
          </select>
          <select className="rounded-xl bg-slate-50 px-4 py-2 text-[10px] font-black uppercase outline-none focus:ring-2 focus:ring-blue-600" value={selectedCategory} onChange={(e) => setSelectedCategory(e.target.value)}>
            <option value="">Semua Kategori</option>
            {TRAINING_ORGANIZER_CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
        </section>

        <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
          {loading ? Array(3).fill(0).map((_, i) => <div key={i} className="h-64 animate-pulse rounded-[2.5rem] bg-slate-200" />) : filtered.map((t) => (
            <Link key={t.id} href={`/pelatihan/${t.id}`} className="group relative flex flex-col justify-between rounded-[3rem] border-2 border-transparent bg-white p-8 shadow-sm transition-all hover:-translate-y-2 hover:border-blue-600 hover:shadow-2xl hover:shadow-blue-100">
              <div className="space-y-4 text-left">
                <div className="flex items-center justify-between"><span className="rounded-full bg-blue-50 px-3 py-1 text-[8px] font-black uppercase text-blue-600">{t.category}</span><div className="flex items-center gap-1 text-emerald-600"><ShieldCheck size={12} /><span className="text-[8px] font-black uppercase">{(t.partners as any)?.inclusion_score}%</span></div></div>
                <h3 className="text-xl font-black uppercase italic leading-tight tracking-tighter text-slate-900 group-hover:text-blue-600">{t.title}</h3>
                <div className="flex items-center gap-2"><div className="flex size-6 items-center justify-center rounded-md bg-slate-100 text-slate-900 transition-colors group-hover:bg-blue-600 group-hover:text-white"><Building2 size={12} /></div><span className="text-[10px] font-black uppercase italic text-slate-600">{(t.partners as any)?.name}</span></div>
              </div>
              <div className="mt-8 flex items-center justify-between border-t border-slate-50 pt-6">
                <div className="flex items-center gap-1 text-[9px] font-bold uppercase text-slate-400"><MapPin size={12} /> {t.is_online ? "Online" : t.location}</div>
                <div className="flex size-10 items-center justify-center rounded-full bg-slate-900 text-white transition-all group-hover:-rotate-45 group-hover:bg-blue-600"><ArrowRight size={18} /></div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
