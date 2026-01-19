"use client";

import React, { useState, useEffect, useCallback } from "react";
import { supabase } from "@/lib/supabase";
import { 
  BarChart3, Users, Building2, Briefcase, 
  TrendingUp, PieChart, MapPin, Loader2,
  Share2, MessageCircle
} from "lucide-react";
import { PROVINCE_MAP } from "@/lib/constants/locations";
import { handleGovShare } from "./share-logic";
import GovInclusionCard from "./inclusion-card"; // Import Inclusion Card

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

  const calculateStats = useCallback(async () => {
    if (!govData?.location) return;
    setLoading(true);
    
    try {
      let targetLocations: string[] = [govData.location];
      if (govData.category === "ULD Ketenagakerjaan Provinsi") {
        targetLocations = PROVINCE_MAP[govData.location] || [govData.location];
      }

      const { data: talentData } = await supabase
        .from("profiles")
        .select("disability_type, career_status")
        .in("city", targetLocations);

      const { count: companyCount } = await supabase
        .from("companies")
        .select("id", { count: 'exact', head: true })
        .in("location", targetLocations);

      const { count: jobCount } = await supabase
        .from("jobs")
        .select("id", { count: 'exact', head: true })
        .in("location", targetLocations)
        .eq("is_active", true);

      const dist: Record<string, number> = {};
      let employedCount = 0;

      talentData?.forEach(t => {
        if (t.disability_type) {
          dist[t.disability_type] = (dist[t.disability_type] || 0) + 1;
        }
        if (t.career_status && !['Job Seeker', 'Belum Bekerja', 'Fresh Graduate'].includes(t.career_status)) {
          employedCount++;
        }
      });

      setStats({
        totalTalents: talentData?.length || 0,
        totalCompanies: companyCount || 0,
        activeJobs: jobCount || 0,
        disabilityDistribution: dist,
        employmentRate: talentData?.length ? Math.round((employedCount / talentData.length) * 100) : 0
      });

    } catch (err) {
      console.error("Analytics Error:", err);
    } finally {
      setLoading(false);
    }
  }, [govData]);

  useEffect(() => {
    calculateStats();
  }, [calculateStats]);

  const onShareStats = (mode: 'viral' | 'formal') => {
    if (!stats) return;
    const hiredCount = Math.round((stats.employmentRate / 100) * stats.totalTalents);
    
    handleGovShare({
      locationName: govData.location,
      totalTalents: stats.totalTalents,
      hiredTalents: hiredCount,
      hiredPercentage: `${stats.employmentRate}%`,
      url: `https://disabilitas.com/gov/${govData.id}`,
      mode: mode
    });
  };

  if (loading) return (
    <div className="flex h-96 flex-col items-center justify-center gap-4" role="status">
      <Loader2 className="animate-spin text-blue-600" size={48} aria-hidden="true" />
      <p className="font-black uppercase italic text-slate-400">Sinkronisasi Data Wilayah...</p>
    </div>
  );

  return (
    <div className="space-y-10 duration-700 animate-in fade-in">
      <h2 className="sr-only">Statistik Wilayah {govData.location}</h2>
      
      {/* 1. HIGHLIGHT CARDS */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <StatCard 
          icon={<Users className="text-blue-600" aria-hidden="true" />} 
          label="Total Talenta" 
          value={stats?.totalTalents || 0} 
          sub="Individu Terdata"
        />
        <StatCard 
          icon={<Building2 className="text-emerald-600" aria-hidden="true" />} 
          label="Mitra Industri" 
          value={stats?.totalCompanies || 0} 
          sub="Perusahaan Inklusif"
        />
        <StatCard 
          icon={<TrendingUp className="text-purple-600" aria-hidden="true" />} 
          label="Keterserapan" 
          value={`${stats?.employmentRate}%`} 
          sub="Sudah Bekerja"
        />
        <StatCard 
          icon={<Briefcase className="text-amber-600" aria-hidden="true" />} 
          label="Loker Aktif" 
          value={stats?.activeJobs || 0} 
          sub="Peluang Terbuka"
        />
      </div>

      {/* 2. INCLUSION CARD (SINKRONISASI BARU) */}
      {stats && (
        <section className="animate-in fade-in zoom-in-95 duration-500 delay-200">
          <GovInclusionCard 
            govData={{
              id: govData.id,
              name: govData.name,
              location: govData.location,
              official_seal_url: govData.official_seal_url
            }}
            stats={{
              total: stats.totalTalents,
              hired: Math.round((stats.employmentRate / 100) * stats.totalTalents),
              percentage: `${stats.employmentRate}%`
            }}
          />
        </section>
      )}

      {/* 3. CHART & INFO SECTION */}
      <div className="grid gap-8 lg:grid-cols-3">
        <section className="rounded-[2.5rem] border-4 border-slate-900 bg-white p-8 shadow-[12px_12px_0px_0px_rgba(15,23,42,1)] lg:col-span-2">
          <div className="mb-8 flex items-center justify-between">
            <h3 className="flex items-center gap-3 text-xl font-black uppercase italic tracking-tight text-slate-900">
              <PieChart className="text-blue-600" aria-hidden="true" />
              Sebaran Ragam Disabilitas
            </h3>
          </div>
          
          <div className="space-y-6">
            {Object.entries(stats?.disabilityDistribution || {}).map(([type, count]) => {
              const percentage = Math.round((count / (stats?.totalTalents || 1)) * 100);
              return (
                <div key={type} className="group">
                  <div className="mb-2 flex justify-between text-[11px] font-black uppercase italic">
                    <span>{type}</span>
                    <span className="text-blue-600">{count} Jiwa ({percentage}%)</span>
                  </div>
                  <div className="h-4 w-full overflow-hidden rounded-full border-2 border-slate-900 bg-slate-100">
                    <div 
                      role="img"
                      aria-label={`${type}: ${count} jiwa, atau ${percentage} persen`}
                      className="h-full bg-blue-500 transition-all duration-1000 group-hover:bg-blue-600" 
                      style={{ width: `${percentage}%` }}
                    ></div>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        <aside className="flex flex-col rounded-[2.5rem] border-4 border-slate-900 bg-slate-900 p-8 text-white shadow-[12px_12px_0px_0px_rgba(59,130,246,1)]">
          <MapPin size={40} className="mb-6 text-blue-400" aria-hidden="true" />
          <h3 className="mb-4 text-2xl font-black uppercase italic leading-tight">
            Yurisdiksi {govData.location}
          </h3>
          
          <div className="mt-auto space-y-4">
            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">Aksi Cepat Laporan</p>
            <div className="grid grid-cols-2 gap-3">
              <button 
                onClick={() => onShareStats('viral')}
                className="flex flex-col items-center gap-2 rounded-2xl border-2 border-slate-700 bg-slate-800 p-4 transition-all hover:bg-blue-600 hover:border-white"
              >
                <Share2 size={20} />
                <span className="text-[8px] font-black">MEDSOS</span>
              </button>
              <button 
                onClick={() => onShareStats('formal')}
                className="flex flex-col items-center gap-2 rounded-2xl border-2 border-slate-700 bg-slate-800 p-4 transition-all hover:bg-emerald-600 hover:border-white"
              >
                <MessageCircle size={20} />
                <span className="text-[8px] font-black">LAPORAN</span>
              </button>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}

function StatCard({ icon, label, value, sub }: { icon: React.ReactNode, label: string, value: string | number, sub: string }) {
  return (
    <div className="rounded-[2rem] border-4 border-slate-900 bg-white p-6 shadow-[8px_8px_0px_0px_rgba(15,23,42,1)] transition-all hover:-translate-y-1">
      <div className="mb-4 inline-block rounded-xl border-2 border-slate-100 p-3" aria-hidden="true">{icon}</div>
      <div className="text-xs font-black uppercase tracking-widest text-slate-400">{label}</div>
      <div className="my-1 text-3xl font-black italic tracking-tighter text-slate-900">{value}</div>
      <p className="text-[9px] font-bold uppercase text-slate-400">{sub}</p>
    </div>
  );
}