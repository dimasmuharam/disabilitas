"use client";

import React, { useState, useEffect, useCallback } from "react";
import { supabase } from "@/lib/supabase";
import { 
  BarChart3, Users, Building2, Briefcase, 
  TrendingUp, PieChart, MapPin, Loader2 
} from "lucide-react";

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
    setLoading(true);
    try {
      // 1. Fetch Talenta di Wilayah (Profiles Table)
      let talentQuery = supabase.from("profiles").select("disability_type, career_status");
      
      if (govData.category.includes("Provinsi")) {
        talentQuery = talentQuery.like("city_id", `${govData.location_id}%`);
      } else {
        talentQuery = talentQuery.eq("city_id", govData.location_id);
      }

      const { data: talentData } = await talentQuery;

      // 2. Fetch Perusahaan di Wilayah (Assuming companies table)
      let companyQuery = supabase.from("companies").select("id", { count: 'exact', head: true });
      if (govData.category.includes("Provinsi")) {
        companyQuery = companyQuery.like("city_id", `${govData.location_id}%`);
      } else {
        companyQuery = companyQuery.eq("city_id", govData.location_id);
      }
      const { count: companyCount } = await companyQuery;

      // Logika Kalkulasi Distribusi
      const dist: Record<string, number> = {};
      let employed = 0;

      talentData?.forEach(t => {
        dist[t.disability_type] = (dist[t.disability_type] || 0) + 1;
        if (t.career_status !== 'Job Seeker' && t.career_status !== 'Belum Bekerja') {
          employed++;
        }
      });

      setStats({
        totalTalents: talentData?.length || 0,
        totalCompanies: companyCount || 0,
        activeJobs: 0, // Bisa ditarik dari table jobs nanti
        disabilityDistribution: dist,
        employmentRate: talentData?.length ? Math.round((employed / talentData.length) * 100) : 0
      });

    } catch (err) {
      console.error("Analytics Error:", err);
    } finally {
      setLoading(false);
    }
  }, [govData.category, govData.location_id]);

  useEffect(() => {
    if (govData?.location_id) {
      calculateStats();
    }
  }, [govData?.location_id, calculateStats]);

  if (loading) return (
    <div className="flex h-96 flex-col items-center justify-center gap-4">
      <Loader2 className="animate-spin text-blue-600" size={48} />
      <p className="font-black uppercase italic text-slate-400">Mengompilasi Data Wilayah...</p>
    </div>
  );

  return (
    <div className="space-y-10 duration-700 animate-in fade-in">
      
      {/* 1. HIGHLIGHT CARDS */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <StatCard 
          icon={<Users className="text-blue-600" />} 
          label="Total Talenta" 
          value={stats?.totalTalents || 0} 
          sub="Terdaftar di Wilayah"
        />
        <StatCard 
          icon={<Building2 className="text-emerald-600" />} 
          label="Mitra Industri" 
          value={stats?.totalCompanies || 0} 
          sub="Perusahaan Lokal"
        />
        <StatCard 
          icon={<TrendingUp className="text-purple-600" />} 
          label="Tingkat Kerja" 
          value={`${stats?.employmentRate}%`} 
          sub="Keterserapan"
        />
        <StatCard 
          icon={<Briefcase className="text-amber-600" />} 
          label="Loker Aktif" 
          value={stats?.activeJobs || 0} 
          sub="Peluang Baru"
        />
      </div>

      {/* 2. CHART SECTION */}
      <div className="grid gap-8 lg:grid-cols-3">
        {/* Distribusi Ragam Disabilitas */}
        <div className="rounded-[2.5rem] border-4 border-slate-900 bg-white p-8 shadow-[12px_12px_0px_0px_rgba(15,23,42,1)] lg:col-span-2">
          <div className="mb-8 flex items-center justify-between">
            <h3 className="flex items-center gap-3 text-xl font-black uppercase italic tracking-tight">
              <PieChart className="text-blue-600" />
              Sebaran Ragam Disabilitas
            </h3>
            <span className="rounded-full bg-slate-100 px-3 py-1 text-[10px] font-black uppercase text-slate-400">Data Real-time</span>
          </div>
          
          <div className="space-y-6">
            {Object.entries(stats?.disabilityDistribution || {}).map(([type, count]) => (
              <div key={type} className="group">
                <div className="mb-2 flex justify-between text-[11px] font-black uppercase italic">
                  <span>{type}</span>
                  <span className="text-blue-600">{count} Orang</span>
                </div>
                <div className="h-4 w-full overflow-hidden rounded-full border-2 border-slate-900 bg-slate-100">
                  <div 
                    className="h-full bg-blue-500 transition-all duration-1000 group-hover:bg-blue-600" 
                    style={{ width: `${(count / (stats?.totalTalents || 1)) * 100}%` }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Info Otoritas Quick View */}
        <div className="rounded-[2.5rem] border-4 border-slate-900 bg-slate-900 p-8 text-white shadow-[12px_12px_0px_0px_rgba(59,130,246,1)]">
          <MapPin size={40} className="mb-6 text-blue-400" />
          <h3 className="mb-4 text-2xl font-black uppercase italic leading-tight">
            Ringkasan Yurisdiksi {govData.location}
          </h3>
          <p className="mb-8 text-sm font-medium italic text-slate-400">
            &quot;Data ini digunakan untuk mendukung penyusunan kebijakan inklusi di level {govData.category}.&quot;
          </p>
          <div className="space-y-4 border-t-2 border-slate-800 pt-6">
            <div className="flex justify-between text-[10px] font-black uppercase tracking-widest">
              <span>Kode Wilayah:</span>
              <span className="text-blue-400">{govData.location_id}</span>
            </div>
            <div className="flex justify-between text-[10px] font-black uppercase tracking-widest">
              <span>Admin Otoritas:</span>
              <span className="text-blue-400">{govData.email}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function StatCard({ icon, label, value, sub }: { icon: React.ReactNode, label: string, value: string | number, sub: string }) {
  return (
    <div className="rounded-[2rem] border-4 border-slate-900 bg-white p-6 shadow-[8px_8px_0px_0px_rgba(15,23,42,1)] transition-all hover:-translate-y-1">
      <div className="mb-4 inline-block rounded-xl border-2 border-slate-100 p-3">{icon}</div>
      <div className="text-xs font-black uppercase tracking-widest text-slate-400">{label}</div>
      <div className="my-1 text-3xl font-black italic tracking-tighter text-slate-900">{value}</div>
      <div className="text-[9px] font-bold uppercase text-slate-400">{sub}</div>
    </div>
  );
}