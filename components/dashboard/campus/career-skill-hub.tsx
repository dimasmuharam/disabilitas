"use client";

import React, { useState, useEffect, useCallback } from "react";
import { supabase } from "@/lib/supabase";
import { 
  Zap, Target, Handshake, Calendar, 
  ArrowUpRight, MessageSquare, Briefcase, 
  TrendingUp, AlertTriangle, Users, Rocket,
  Search, Filter, Sparkles
} from "lucide-react";

interface HubProps {
  campusId: string;
  campusName: string;
}

export default function CareerSkillHub({ campusId, campusName }: HubProps) {
  const [loading, setLoading] = useState(true);
  const [skillAnalysis, setSkillAnalysis] = useState<any>({
    studentSkills: [],
    marketDemands: [],
    gaps: []
  });
  const [partners, setPartners] = useState<any[]>([]);

  const fetchHubData = useCallback(async () => {
    setLoading(true);
    try {
      // 1. Ambil Agregat Skill Mahasiswa (Data Internal Kampus)
      const { data: profiles } = await supabase
        .from("profiles")
        .select("skills")
        .eq("university_id", campusId);

      // 2. Ambil Agregat Skill yang Dicari Industri (Data Marketplace)
      const { data: jobs } = await supabase
        .from("jobs")
        .select("required_skills")
        .eq("is_active", true);

      // 3. Ambil Rekomendasi Partner Pelatihan
      const { data: partnerData } = await supabase
        .from("partners")
        .select("id, name, description, website")
        .limit(3);

      // Logika Pemrosesan Skill Gap
      const sSkills = (profiles || []).flatMap(p => p.skills || []);
      const mSkills = (jobs || []).flatMap(j => j.required_skills || []);

      // Hitung frekuensi (Top 5)
      const getTopSkills = (arr: string[]) => {
        const countMap: any = {};
        arr.forEach(s => countMap[s] = (countMap[s] || 0) + 1);
        return Object.entries(countMap)
          .sort((a: any, b: any) => b[1] - a[1])
          .slice(0, 5)
          .map(item => item[0]);
      };

      const topStudent = getTopSkills(sSkills);
      const topMarket = getTopSkills(mSkills);

      // Cari Skill yang ada di Industri tapi tidak ada di Mahasiswa
      const gaps = topMarket.filter(skill => !topStudent.includes(skill));

      setSkillAnalysis({
        studentSkills: topStudent,
        marketDemands: topMarket,
        gaps: gaps
      });
      setPartners(partnerData || []);

    } catch (err) {
      console.error("Hub Fetch Error:", err);
    } finally {
      setLoading(false);
    }
  }, [campusId]);

  useEffect(() => { fetchHubData(); }, [fetchHubData]);

  if (loading) return (
    <div className="flex flex-col items-center justify-center py-20 text-slate-400">
      <Sparkles className="animate-spin mb-4 text-emerald-500" size={40} />
      <p className="text-[10px] font-black uppercase tracking-widest">Generating Market Insight...</p>
    </div>
  );

  return (
    <div className="space-y-12 animate-in fade-in slide-in-from-bottom-6 duration-700 text-left pb-20">
      
      {/* SECTION A: SKILL GAP ANALYSIS (COMMAND CENTER) */}
      <section className="relative overflow-hidden rounded-[3.5rem] border-4 border-slate-900 bg-white p-10 shadow-[15px_15px_0px_0px_rgba(15,23,42,1)]">
        <div className="relative z-10">
          <div className="mb-10 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div className="flex items-center gap-4">
              <div className="rounded-2xl bg-orange-500 p-3 text-white shadow-lg shadow-orange-100">
                <TrendingUp size={32} />
              </div>
              <div>
                <h2 className="text-3xl font-black uppercase italic tracking-tighter leading-none">Skill Gap Analysis</h2>
                <p className="mt-1 text-[10px] font-black uppercase tracking-widest text-slate-400 italic">Market Insight Dashboard</p>
              </div>
            </div>
            <div className="rounded-full bg-slate-900 px-6 py-2 text-[10px] font-black uppercase tracking-widest text-white">
              Data Updated: Today
            </div>
          </div>

          <div className="grid grid-cols-1 gap-12 lg:grid-cols-2">
            {/* Sisi Kiri: Mahasiswa Anda */}
            <div className="space-y-6">
              <h3 className="flex items-center gap-2 text-xs font-black uppercase tracking-widest text-slate-500">
                <Users size={16} /> Kompetensi Mahasiswa Anda
              </h3>
              <div className="flex flex-wrap gap-3">
                {skillAnalysis.studentSkills.map((skill: string) => (
                  <div key={skill} className="rounded-2xl border-2 border-slate-100 bg-slate-50 px-6 py-3 text-sm font-black text-slate-800 shadow-sm">
                    {skill}
                  </div>
                ))}
              </div>
            </div>

            {/* Sisi Kanan: Demand Industri */}
            <div className="space-y-6">
              <h3 className="flex items-center gap-2 text-xs font-black uppercase tracking-widest text-emerald-600">
                <Target size={16} /> Kebutuhan Industri Terkini
              </h3>
              <div className="flex flex-wrap gap-3">
                {skillAnalysis.marketDemands.map((skill: string) => (
                  <div key={skill} className="rounded-2xl border-2 border-emerald-500 bg-emerald-50 px-6 py-3 text-sm font-black text-emerald-700 shadow-sm">
                    {skill}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* GAP NOTIFICATION (The Strategic Trigger) */}
          {skillAnalysis.gaps.length > 0 && (
            <div className="mt-12 flex flex-col items-center gap-6 rounded-[2.5rem] bg-orange-500 p-8 text-white md:flex-row">
              <AlertTriangle size={48} className="shrink-0" />
              <div className="flex-1 space-y-1">
                <h4 className="text-xl font-black uppercase italic tracking-tighter">Celah Kompetensi Terdeteksi!</h4>
                <p className="text-sm font-bold opacity-90 italic">
                  Industri sangat membutuhkan skill <span className="underline">{skillAnalysis.gaps.join(", ")}</span>, 
                  namun kurikulum internal Anda belum mencakup kebutuhan ini secara luas.
                </p>
              </div>
              <button className="whitespace-nowrap rounded-2xl bg-slate-900 px-8 py-4 text-[10px] font-black uppercase tracking-widest text-white hover:scale-105 transition-all">
                Intervensi Akademik
              </button>
            </div>
          )}
        </div>
      </section>

      <div className="grid grid-cols-1 gap-10 lg:grid-cols-3">
        {/* SECTION B: COLLABORATION BRIDGE */}
        <section className="lg:col-span-2 space-y-8">
          <div className="flex items-center gap-4">
            <div className="rounded-2xl bg-blue-600 p-3 text-white">
              <Handshake size={28} />
            </div>
            <h2 className="text-2xl font-black uppercase italic tracking-tighter">Collaboration Bridge</h2>
          </div>
          
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            {partners.map((partner) => (
              <div key={partner.id} className="group rounded-[2.5rem] border-2 border-slate-100 bg-white p-8 shadow-sm transition-all hover:border-blue-500 hover:shadow-xl">
                <div className="flex items-start justify-between">
                  <div className="h-14 w-14 rounded-2xl bg-slate-100 flex items-center justify-center text-xl font-black text-slate-400 group-hover:bg-blue-600 group-hover:text-white transition-all">
                    {partner.name.charAt(0)}
                  </div>
                  <button className="rounded-full bg-blue-50 p-3 text-blue-600 hover:bg-blue-600 hover:text-white transition-all">
                    <MessageSquare size={20} />
                  </button>
                </div>
                <h4 className="mt-6 text-xl font-black uppercase tracking-tighter">{partner.name}</h4>
                <p className="mt-2 text-xs font-medium text-slate-400 line-clamp-2 italic">{partner.description || "Mitra Pelatihan Strategis"}</p>
                <div className="mt-6 flex gap-2">
                  <span className="rounded-lg bg-blue-50 px-3 py-1 text-[8px] font-black uppercase text-blue-600">Digital Literacy</span>
                  <span className="rounded-lg bg-blue-50 px-3 py-1 text-[8px] font-black uppercase text-blue-600">Soft Skills</span>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* SECTION C: JOB FAIR MANAGER (THE PRESTIGE FEATURE) */}
        <section className="rounded-[3rem] bg-slate-900 p-10 text-white shadow-2xl flex flex-col justify-between group overflow-hidden relative">
          <div className="relative z-10">
            <Calendar className="mb-8 text-emerald-400 group-hover:rotate-12 transition-all" size={48} />
            <h3 className="text-3xl font-black uppercase italic leading-none tracking-tighter">Exclusive Job Fair Manager</h3>
            <p className="mt-6 text-sm font-medium leading-relaxed opacity-60">
              Ciptakan momentum karir bagi mahasiswa Anda. Undang mitra perusahaan pilihan untuk mengadakan rekrutmen eksklusif 
              khusus bagi talenta dari <strong>{campusName}</strong>.
            </p>
          </div>
          
          <div className="relative z-10 mt-10 space-y-4">
            <div className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/5 p-4 italic">
              <Zap size={20} className="text-emerald-400" />
              <p className="text-[10px] font-bold uppercase tracking-widest text-emerald-400">Boost Tracer Study Score</p>
            </div>
            <button className="w-full rounded-2xl bg-emerald-500 py-6 text-[11px] font-black uppercase tracking-[0.2em] text-slate-900 shadow-xl shadow-emerald-900/20 hover:bg-white transition-all">
              Initialize Event
            </button>
          </div>

          {/* Decorative Backgound */}
          <div className="absolute -right-20 -bottom-20 opacity-10 group-hover:opacity-20 transition-all">
            <Rocket size={300} />
          </div>
        </section>
      </div>

      {/* STRATEGIC RESEARCH NOTE (BRIN PERSPECTIVE) */}
      <footer className="mt-10 rounded-[2.5rem] border-2 border-dashed border-slate-200 p-10 text-center">
        <div className="mx-auto max-w-2xl">
          <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-300">Advanced Research Infrastructure</p>
          <p className="mt-4 text-xs italic font-medium text-slate-400 leading-relaxed">
            Modul ini melacak efektivitas kolaborasi antara Perguruan Tinggi dan Mitra Industri. 
            Data yang dikumpulkan akan menjadi basis riset nasional mengenai "Masa Tunggu Kerja (Waiting Period)" 
            alumni disabilitas berdasarkan intervensi ULD.
          </p>
        </div>
      </footer>
    </div>
  );
}