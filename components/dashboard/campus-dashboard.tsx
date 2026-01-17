"use client";

import React, { useState, useEffect, useCallback, useMemo } from "react";
import { supabase } from "@/lib/supabase";
import { 
  Users, BarChart3, Settings, 
  ShieldCheck, Share2, LayoutDashboard,
  Activity, Award, Lock, 
  Zap, School, Briefcase, TrendingUp,
  User, ExternalLink, MousePointerClick
} from "lucide-react";
import { ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, Radar } from "recharts";

// Import Modul Pendukung - Pastikan Path Benar
import TalentTracer from "./campus/talent-tracer";
import ProfileEditor from "./campus/profile-editor";
import AccountSettings from "./campus/account-settings";
import CareerSkillHub from "./campus/career-skill-hub";
import { shareNative } from "./campus/share-actions";

export default function CampusDashboard({ user }: { user: any }) {
  const [activeTab, setActiveTab] = useState("overview");
  const [campus, setCampus] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [announcement, setAnnouncement] = useState("");

  const fetchDashboardData = useCallback(async () => {
    if (!user?.id) return;
    setLoading(true);
    try {
      const { data: campusData, error } = await supabase
        .from("campuses")
        .select("*")
        .eq("id", user.id)
        .single();
      
      if (error || !campusData) return;
      setCampus(campusData);
    } catch (e) { 
      console.error("Campus Dashboard Fetch Error:", e); 
    } finally { 
      setLoading(false); 
    }
  }, [user?.id]);

  useEffect(() => { 
    fetchDashboardData(); 
  }, [fetchDashboardData]);

  const radarData = useMemo(() => [
    { subject: 'Fisik (30%)', A: campus?.inclusion_score_physical || 0 },
    { subject: 'Digital (40%)', A: campus?.inclusion_score_digital || 0 },
    { subject: 'Output (30%)', A: campus?.inclusion_score_output || 0 },
  ], [campus]);

  const currentStats = {
    total: Number(campus?.stats_academic_total || 0),
    hired: Number(campus?.stats_academic_hired || 0),
    unverified: Number(campus?.stats_alumni_unverified_total || 0),
    rate: Number(campus?.stats_academic_total || 0) > 0 
      ? Math.round((Number(campus?.stats_academic_hired || 0) / Number(campus?.stats_academic_total || 0)) * 100) 
      : 0
  };

  const navigateTo = (tabId: string, label: string) => {
    setActiveTab(tabId);
    setAnnouncement(`Menampilkan halaman ${label}`);
    window.scrollTo(0, 0);
  };

  const handleShare = () => {
    const data = {
      name: campus?.name || "Institusi",
      total: currentStats.total,
      rate: currentStats.rate,
      score: campus?.inclusion_score || 0,
      url: `https://disabilitas.com/kampus/${campus?.id}`
    };
    shareNative(data);
  };

  if (loading) return (
    <div role="status" aria-live="polite" className="flex min-h-screen animate-pulse flex-col items-center justify-center font-black uppercase italic tracking-tighter text-slate-400">
      <Activity className="mb-4 animate-spin text-emerald-500" size={48} />
      Sinkronisasi Data Almamater...
    </div>
  );

  return (
    <div className="mx-auto max-w-7xl space-y-10 px-4 py-10 font-sans text-slate-900 selection:bg-emerald-100">
      <div className="sr-only" aria-live="polite">{announcement}</div>

      {/* HEADER SECTION */}
      <header className="flex flex-col items-start justify-between gap-6 border-b-4 border-slate-900 pb-10 text-left md:flex-row md:items-end">
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <div className="rounded-xl bg-emerald-600 p-2 text-white shadow-lg">
              <School size={28} />
            </div>
            <div>
              <p className="text-[10px] font-black uppercase leading-none tracking-[0.3em] text-emerald-600">University Portal</p>
              <h1 className="mt-1 text-4xl font-black uppercase italic leading-none tracking-tighter">{campus?.name}</h1>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <span className="flex items-center gap-1.5 rounded-full border-2 border-emerald-500 bg-emerald-50 px-4 py-1.5 text-[10px] font-black uppercase text-emerald-700">
              <ShieldCheck size={14} /> Inclusion Score: {campus?.inclusion_score || 0}%
            </span>
            <a 
              href={`/kampus/${campus?.id}`} 
              target="_blank" 
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 rounded-full border-2 border-slate-200 bg-white px-4 py-1.5 text-[10px] font-black uppercase text-slate-600 transition-all hover:border-slate-900 hover:text-slate-900"
            >
              <ExternalLink size={14} /> Profil Publik
            </a>
          </div>
        </div>
        
        <div className="flex w-full gap-3 md:w-auto">
          <button 
            onClick={() => navigateTo("hub", "Career Hub")} 
            className="group flex flex-1 items-center justify-center gap-3 rounded-2xl bg-slate-900 px-8 py-5 text-[11px] font-black uppercase italic tracking-widest text-white shadow-xl transition-all hover:bg-emerald-600 md:flex-none"
          >
            <Briefcase size={18} className="group-hover:animate-bounce" />
            Career & Skill Hub
          </button>
          <button 
            onClick={handleShare} 
            className="rounded-2xl border-2 border-slate-100 bg-white px-6 shadow-sm transition-all hover:border-slate-900 hover:bg-slate-50 active:scale-95"
            aria-label="Bagikan Profil"
          >
            <Share2 size={20} />
          </button>
        </div>
      </header>

      {/* NAVIGATION TABS */}
      <nav className="no-scrollbar flex gap-2 overflow-x-auto" role="tablist">
        {[
          { id: "overview", label: "Dashboard", icon: LayoutDashboard },
          { id: "hub", label: "Career & Skill Hub", icon: Zap },
          { id: "tracer", label: "Talent Tracer", icon: BarChart3 },
          { id: "profile", label: "Audit Inklusi", icon: Settings },
          { id: "account", label: "Akun", icon: Lock },
        ].map((tab) => (
          <button 
            key={tab.id} 
            role="tab"
            aria-selected={activeTab === tab.id}
            onClick={() => navigateTo(tab.id, tab.label)} 
            className={`flex items-center gap-3 whitespace-nowrap rounded-2xl px-6 py-4 text-[10px] font-black uppercase transition-all ${activeTab === tab.id ? "-translate-y-1 bg-slate-900 text-white shadow-xl" : "border-2 border-slate-100 bg-white text-slate-400 hover:border-slate-900 hover:text-slate-900"}`}
          >
            <tab.icon size={16} /> {tab.label}
          </button>
        ))}
      </nav>

      {/* MAIN CONTENT AREA */}
      <main id="main-content" className="outline-none">
        {activeTab === "overview" && (
          <div className="space-y-10 duration-500 animate-in fade-in slide-in-from-bottom-4">
            
            {/* RADAR & SMART NARRATIVE */}
            <div className="grid grid-cols-1 gap-8 lg:grid-cols-5">
              <section className="rounded-[3rem] border-2 border-slate-100 bg-white p-8 shadow-sm lg:col-span-2 text-left">
                <h3 className="mb-6 flex items-center gap-2 text-[11px] font-black uppercase tracking-widest text-slate-900 leading-none">
                  <Activity size={16} className="text-emerald-500" /> Keseimbangan Klaster
                </h3>
                <div className="h-[250px] w-full" aria-hidden="true">
                  <ResponsiveContainer width="100%" height="100%">
                    <RadarChart cx="50%" cy="50%" outerRadius="80%" data={radarData}>
                      <PolarGrid stroke="#f1f5f9" />
                      <PolarAngleAxis dataKey="subject" tick={{ fill: '#94a3b8', fontSize: 9, fontWeight: 800 }} />
                      <Radar name="Skor" dataKey="A" stroke="#10b981" fill="#10b981" fillOpacity={0.6} />
                    </RadarChart>
                  </ResponsiveContainer>
                </div>
              </section>

              <section className="flex flex-col justify-center rounded-[3rem] border-4 border-slate-900 bg-white p-10 text-left shadow-[12px_12px_0px_0px_rgba(15,23,42,1)] lg:col-span-3">
                <h3 className="mb-4 flex items-center gap-2 text-[11px] font-black uppercase tracking-widest text-emerald-600 leading-none">
                  <Award size={18} /> Research Executive Summary
                </h3>
                <div className="text-2xl font-black italic leading-tight tracking-tighter text-slate-800 md:text-3xl">
                  &quot;{campus?.smart_narrative_summary || "Menganalisis data almamater Anda..."}&quot;
                </div>
                <div className="mt-6 flex gap-4">
                  <div className="flex items-center gap-2 rounded-xl border-2 border-slate-100 bg-slate-50 px-4 py-2 shadow-sm">
                    <TrendingUp size={16} className="text-blue-500" />
                    <span className="text-[10px] font-black uppercase text-slate-500 leading-none">Employability: {campus?.inclusion_score_output || 0}%</span>
                  </div>
                </div>
              </section>
            </div>

            {/* QUICK STATS CARDS */}
            <section className="grid grid-cols-1 gap-6 text-left sm:grid-cols-2 lg:grid-cols-4">
              {[
                { label: "Total Talenta", val: currentStats.total, color: "slate" },
                { label: "Lulusan Bekerja", val: currentStats.hired, color: "emerald" },
                { label: "Hired Rate", val: `${currentStats.rate}%`, color: "blue" },
                { label: "Pending Validasi", val: currentStats.unverified, color: "orange" }
              ].map((s) => (
                <div key={s.label} className="rounded-[2rem] border-2 border-slate-100 bg-white p-6 shadow-sm">
                  <p className="text-[9px] font-black uppercase tracking-widest text-slate-400">{s.label}</p>
                  <p className={`text-4xl font-black tracking-tighter text-${s.color}-600`}>{s.val}</p>
                </div>
              ))}
            </section>

            {/* DIVERSITY MAPS */}
            <div className="grid grid-cols-1 gap-8 text-left lg:grid-cols-3">
              {/* Ragam Disabilitas */}
              <div className="rounded-[2.5rem] border-2 border-slate-100 bg-white p-8 lg:col-span-2">
                <h4 className="mb-6 flex items-center gap-2 text-[11px] font-black uppercase tracking-widest leading-none text-slate-900">
                  <Users className="text-emerald-600" size={16} /> Sebaran Ragam Disabilitas
                </h4>
                <div className="space-y-4">
                  {Object.entries(campus?.stats_disability_map || {}).map(([type, count]: [string, any]) => (
                    <div key={type} className="space-y-1">
                      <div className="flex justify-between text-[9px] font-black uppercase text-slate-500">
                        <span>{type}</span><span>{count} Orang</span>
                      </div>
                      <div className="h-2 overflow-hidden rounded-full bg-slate-100">
                        <div 
                          className="h-full bg-emerald-600 transition-all duration-1000" 
                          style={{ width: `${(count / (currentStats.total || 1)) * 100}%` }} 
                        />
                      </div>
                    </div>
                  ))}
                  {(!campus?.stats_disability_map || Object.keys(campus.stats_disability_map).length === 0) && (
                    <p className="text-[10px] font-black italic text-slate-300">Belum ada data ragam talenta.</p>
                  )}
                </div>
              </div>

              {/* Gender & Action */}
              <div className="space-y-6">
                <div className="rounded-[2.5rem] border-2 border-slate-100 bg-white p-8">
                  <h4 className="mb-4 flex items-center gap-2 text-[11px] font-black uppercase tracking-widest leading-none text-slate-900">
                    <User className="text-blue-500" size={16} /> Analisis Gender
                  </h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="rounded-2xl bg-blue-50 p-4 border-l-4 border-blue-500 text-center">
                      <p className="text-[8px] font-black uppercase text-blue-400">Laki-laki</p>
                      <p className="text-2xl font-black text-blue-900">{campus?.stats_gender_map?.male || 0}</p>
                    </div>
                    <div className="rounded-2xl bg-pink-50 p-4 border-l-4 border-pink-500 text-center">
                      <p className="text-[8px] font-black uppercase text-pink-400">Perempuan</p>
                      <p className="text-2xl font-black text-pink-900">{campus?.stats_gender_map?.female || 0}</p>
                    </div>
                  </div>
                </div>

                <div className="rounded-[2.5rem] bg-emerald-600 p-8 text-white shadow-lg">
                  <p className="text-[10px] font-black uppercase tracking-widest opacity-80 leading-none">Manajemen Almamater</p>
                  <p className="mt-3 text-xl font-black leading-tight italic tracking-tight uppercase">
                    Ada {currentStats.unverified} lulusan menunggu verifikasi.
                  </p>
                  <button 
                    onClick={() => navigateTo("tracer", "Talent Tracer")}
                    className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl bg-white py-3 text-[10px] font-black uppercase text-emerald-700 transition-all hover:scale-105 active:scale-95"
                  >
                    Mulai Validasi <MousePointerClick size={16} />
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB COMPONENTS */}
        <div className="mt-2">
           {activeTab === "hub" && <CareerSkillHub campusName={campus?.name} campusId={user.id} />}
           {activeTab === "tracer" && <TalentTracer campusName={campus?.name} campusId={user.id} onBack={() => navigateTo("overview", "Dashboard")} />}
           {activeTab === "profile" && <ProfileEditor campus={campus} onUpdate={() => { fetchDashboardData(); navigateTo("overview", "Dashboard"); }} onBack={() => navigateTo("overview", "Dashboard")} />}
           {activeTab === "account" && <AccountSettings user={user} onBack={() => navigateTo("overview", "Dashboard")} />}
        </div>
      </main>
    </div>
  );
}

function ChevronRight({ size, className }: { size: number, className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="m9 18 6-6-6-6"/>
    </svg>
  );
}