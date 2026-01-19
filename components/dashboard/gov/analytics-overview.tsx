"use client";

import React, { useState, useEffect, useCallback } from "react";
import { supabase } from "@/lib/supabase";
import { 
  BarChart3, Users, Building2, Briefcase, 
  TrendingUp, PieChart, MapPin, Loader2,
  Share2, MessageCircle, Globe 
} from "lucide-react";
import { PROVINCE_MAP } from "@/lib/constants/locations";
import { handleGovShare } from "./share-logic";
import GovInclusionCard from "./inclusion-card";

interface Stats {
  totalTalents: number;
  totalCompanies: number;
  activeJobs: number;
  disabilityDistribution: Record<string, number>;
  employmentRate: number;
}

export default function GovAnalyticsOverview({ govData }: { govData: any }) {
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);

  // Identifikasi Level Otoritas
const isPusat = govData.location === "Nasional" || govData.category === "Kementerian/Lembaga";
  const isProvinsi = govData.category.includes("Provinsi");

  const calculateStats = useCallback(async () => {
    setLoading(true);
    try {
      // 1. PENENTUAN SCOPE QUERY
      let talentQuery = supabase.from("profiles").select("disability_type, career_status");
      let companyQuery = supabase.from("companies").select("id", { count: 'exact', head: true });
      let jobQuery = supabase.from("jobs").select("id", { count: 'exact', head: true }).eq("is_active", true);
// Aplikasikan filter jika BUKAN level pusat
if (!isPusat) {
  let targetLocations: string[] = [govData.location];
  if (isProvinsi) {
    targetLocations = PROVINCE_MAP[govData.location] || [govData.location];
  }
  
  talentQuery = talentQuery.in("city", targetLocations);
  companyQuery = companyQuery.in("location", targetLocations);
  jobQuery = jobQuery.in("location", targetLocations);
}
      // 2. EKSEKUSI DATA
      const [talentRes, companyRes, jobRes] = await Promise.all([
        talentQuery,
        companyQuery,
        jobQuery
      ]);

      const talentData = talentRes.data;
      const dist: Record<string, number> = {};
      let employedCount = 0;

      talentData?.forEach(t => {
        if (t.disability_type) dist[t.disability_type] = (dist[t.disability_type] || 0) + 1;
        if (t.career_status && !['Job Seeker', 'Belum Bekerja', 'Fresh Graduate'].includes(t.career_status)) {
          employedCount++;
        }
      });

      setStats({
        totalTalents: talentData?.length || 0,
        totalCompanies: companyRes.count || 0,
        activeJobs: jobRes.count || 0,
        disabilityDistribution: dist,
        employmentRate: talentData?.length ? Math.round((employedCount / talentData.length) * 100) : 0
      });

    } catch (err) {
      console.error("Analytics Error:", err);
    } finally {
      setLoading(false);
    }
  }, [govData, isPusat, isProvinsi]);

  useEffect(() => { calculateStats(); }, [calculateStats]);

  const onShareStats = (mode: 'viral' | 'formal') => {
    if (!stats) return;
    handleGovShare({
      locationName: isPusat ? "Nasional (Indonesia)" : govData.location,
      totalTalents: stats.totalTalents,
      hiredTalents: Math.round((stats.employmentRate / 100) * stats.totalTalents),
      hiredPercentage: `${stats.employmentRate}%`,
      url: `https://disabilitas.com/gov/${govData.id}`,
      mode: mode
    });
  };

  if (loading) return (
    <div className="flex h-96 flex-col items-center justify-center gap-4" role="status">
      <Loader2 className="animate-spin text-blue-600" size={48} />
      <p className="font-black uppercase italic text-slate-400">Menghitung Data {isPusat ? 'Nasional' : 'Wilayah'}...</p>
    </div>
  );

  return (
    <div className="space-y-10 duration-700 animate-in fade-in">
      
      {/* HEADER DYNAMIC */}
      <div className="flex items-center gap-4 mb-4">
        <div className={`p-3 rounded-2xl text-white ${isPusat ? 'bg-indigo-600' : 'bg-blue-600'}`}>
          {isPusat ? <Globe size={24} /> : <MapPin size={24} />}
        </div>
        <div>
          <h2 className="text-2xl font-black uppercase italic text-slate-900 leading-tight">
            Ringkasan Analitik {isPusat ? 'Nasional' : govData.location}
          </h2>
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
            Data Terintegrasi secara Real-time dari Dashboard {govData.category}
          </p>
        </div>
      </div>

      {/* 1. HIGHLIGHT CARDS */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <StatCard icon={<Users className="text-blue-600" />} label="Total Talenta" value={stats?.totalTalents || 0} sub={isPusat ? "Nasional" : "Wilayah Otoritas"} />
        <StatCard icon={<Building2 className="text-emerald-600" />} label="Mitra Industri" value={stats?.totalCompanies || 0} sub="Perusahaan Terdaftar" />
        <StatCard icon={<TrendingUp className="text-purple-600" />} label="Keterserapan" value={`${stats?.employmentRate}%`} sub="Telah Mendapat Pekerjaan" />
        <StatCard icon={<Briefcase className="text-amber-600" />} label="Loker Aktif" value={stats?.activeJobs || 0} sub="Tersedia Saat Ini" />
      </div>

      {/* 2. INCLUSION CARD */}
      {stats && (
        <GovInclusionCard 
          govData={govData}
          stats={{
            total: stats.totalTalents,
            hired: Math.round((stats.employmentRate / 100) * stats.totalTalents),
            percentage: `${stats.employmentRate}%`
          }}
        />
      )}

      {/* 3. CHART & ASIDE */}
      <div className="grid gap-8 lg:grid-cols-3">
        <section className="rounded-[2.5rem] border-4 border-slate-900 bg-white p-8 shadow-[12px_12px_0px_0px_rgba(15,23,42,1)] lg:col-span-2">
          <h3 className="mb-8 flex items-center gap-3 text-xl font-black uppercase italic text-slate-900">
            <PieChart className="text-blue-600" /> Sebaran Ragam Disabilitas {isPusat ? 'Nasional' : ''}
          </h3>
          <div className="space-y-6">
            {Object.entries(stats?.disabilityDistribution || {}).map(([type, count]) => {
              const percentage = Math.round((count / (stats?.totalTalents || 1)) * 100);
              return (
                <div key={type} className="group">
                  <div className="mb-2 flex justify-between text-[11px] font-black uppercase">
                    <span>{type}</span>
                    <span className="text-blue-600 font-black">{count} Jiwa</span>
                  </div>
                  <div className="h-4 rounded-full border-2 border-slate-900 bg-slate-100 overflow-hidden">
                    <div className="h-full bg-blue-500 transition-all duration-1000" style={{ width: `${percentage}%` }}></div>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        <aside className="flex flex-col rounded-[2.5rem] border-4 border-slate-900 bg-slate-900 p-8 text-white shadow-[12px_12px_0px_0px_rgba(59,130,246,1)]">
          <BarChart3 size={40} className="mb-6 text-blue-400" />
          <h3 className="mb-4 text-2xl font-black uppercase italic leading-tight">Aksi Dashboard {isPusat ? 'Pusat' : 'Wilayah'}</h3>
          <p className="text-[11px] text-slate-400 font-bold leading-relaxed mb-8">
            {isPusat 
              ? "Gunakan data nasional ini untuk menyusun kuota formasi CASN dan monitoring indeks inklusi kementerian." 
              : "Bagikan progres inklusi wilayah Anda ke media sosial atau buat laporan PDF formal untuk pimpinan."}
          </p>
          <div className="mt-auto grid grid-cols-2 gap-3">
            <button onClick={() => onShareStats('viral')} className="flex flex-col items-center gap-2 rounded-2xl border-2 border-slate-700 bg-slate-800 p-4 hover:bg-blue-600 transition-all">
              <Share2 size={20} /><span className="text-[8px] font-black uppercase">Viral Share</span>
            </button>
            <button onClick={() => onShareStats('formal')} className="flex flex-col items-center gap-2 rounded-2xl border-2 border-slate-700 bg-slate-800 p-4 hover:bg-emerald-600 transition-all">
              <MessageCircle size={20} /><span className="text-[8px] font-black uppercase">Laporan</span>
            </button>
          </div>
        </aside>
      </div>
    </div>
  );
}

function StatCard({ icon, label, value, sub }: { icon: React.ReactNode, label: string, value: string | number, sub: string }) {
  return (
    <div className="rounded-[2rem] border-4 border-slate-900 bg-white p-6 shadow-[8px_8px_0px_0px_rgba(15,23,42,1)] transition-all hover:-translate-y-1">
      <div className="mb-4 inline-block rounded-xl border-2 border-slate-100 p-3">{icon}</div>
      <div className="text-xs font-black uppercase text-slate-400 tracking-widest">{label}</div>
      <div className="my-1 text-3xl font-black italic text-slate-900 tracking-tighter">{value}</div>
      <p className="text-[9px] font-bold uppercase text-slate-400 italic">{sub}</p>
    </div>
  );
}