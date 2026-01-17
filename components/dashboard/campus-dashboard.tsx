"use client";

import React, { useState, useEffect, useCallback, useMemo } from "react";
import { supabase } from "@/lib/supabase";
import { 
  Users, BarChart3, Settings, 
  ShieldCheck, Share2, LayoutDashboard,
  Activity, Award, Lock, 
  Zap, User, School,
  MousePointerClick, Briefcase, Sparkles, TrendingUp,
  ExternalLink, ChevronRight
} from "lucide-react";
import { ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, Radar } from "recharts";

// Import Modul Pendukung
import TalentTracer from "./campus/talent-tracer";
import ProfileEditor from "./campus/profile-editor";
import AccountSettings from "./campus/account-settings";
import CareerSkillHub from "./campus/career-skill-hub";
import { shareToWhatsApp, shareNative } from "./campus/share-actions";

export default function CampusDashboard({ user }: { user: any }) {
  const [activeTab, setActiveTab] = useState("overview");
  const [campus, setCampus] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [announcement, setAnnouncement] = useState("");
  const [profileCompletion, setProfileCompletion] = useState(0);

  const labelTalent = "Mahasiswa";
  const labelAlumni = "Alumni Disabilitas";

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

      // Kembalikan Logika Profile Completion Mas
      const fields = ["name", "description", "location", "website", "nib_number"];
      const filled = fields.filter(f => campusData[f] && campusData[f].length > 0).length;
      const acc = (campusData.master_accommodations_provided?.length || 0) > 0 ? 1 : 0;
      setProfileCompletion(Math.round(((filled + acc) / (fields.length + 1)) * 100));

    } catch (e) { 
      console.error("Campus Dashboard Fetch Error:", e); 
    } finally { 
      setLoading(false); 
    }
  }, [user?.id]);

  useEffect(() => { 
    fetchDashboardData(); 
    // Kembalikan Canonical Link Mas
    const link = document.querySelector("link[rel='canonical']") || document.createElement("link");
    link.setAttribute("rel", "canonical");
    link.setAttribute("href", "https://disabilitas.com/dashboard/campus");
    if (!document.head.contains(link)) document.head.appendChild(link);
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

  const handleShare = () => {
    const data = {
      name: campus?.name || "Institusi",
      total: currentStats.total,
      rate: currentStats.rate,
      score: campus?.inclusion_score || 0,
      url: `https://disabilitas.com/kampus/${campus?.id}`
    };

    const canNativeShare = typeof window !== "undefined" && typeof navigator !== "undefined" && Boolean(navigator.share);
    if (canNativeShare) { shareNative(data); } 
    else { shareToWhatsApp(data); }
  };

  const navigateTo = (tabId: string, label: string) => {
    setActiveTab(tabId);
    setAnnouncement(`Menampilkan halaman ${label}`);
    window.scrollTo(0, 0);
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
            <div className="rounded-xl bg-emerald-600 p-2 text-white shadow-lg" aria-hidden="true">
              <School size={28} />
            </div>
            <div>
              <p className="text-[10px] font-black uppercase leading-none tracking-[0.3em] text-emerald-600">University Portal • {profileCompletion}% Complete</p>
              <h1 className="mt-1 text-4xl font-black uppercase italic leading-none tracking-tighter">{campus?.name}</h1>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <span className="flex items-center gap-1.5 rounded-full border-2 border-emerald-500 bg-emerald-50 px-4 py-1.5 text-[10px] font-black uppercase text-emerald-700">
              <ShieldCheck size={14} /> National Inclusion Index: {campus?.inclusion_score || 0}%
            </span>
            <a href={`/kampus/${campus?.id}`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 rounded-full border-2 border-slate-200 bg-white px-4 py-1.5 text-[10px] font-black uppercase text-slate-600 transition-all hover:border-slate-900 hover:text-slate-900">
              <ExternalLink size={14} /> Profil Publik
            </a>
            {currentStats.unverified > 0 && (
               <button onClick={() => navigateTo("tracer", "Talent Tracer")} className="flex animate-bounce items-center gap-1.5 rounded-full border-2 border-orange-500 bg-orange-50 px-4 py-1.5 text-[10px] font-black uppercase text-orange-700 transition-colors hover:bg-orange-100">
                <Users size={14} /> {currentStats.unverified} Menunggu Verifikasi
              </button>
            )}
          </div>
        </div>
        
        <div className="flex w-full gap-3 md:w-auto">
          <button onClick={() => navigateTo("hub", "Career Hub")} className="group flex flex-1 items-center justify-center gap-3 rounded-2xl bg-slate-900 px-8 py-5 text-[11px] font-black uppercase italic tracking-widest text-white shadow-xl transition-all hover:bg-emerald-600 md:flex-none">
            <Briefcase size={18} className="group-hover:animate-bounce" /> Career & Skill Hub
          </button>
          <button onClick={handleShare} className="rounded-2xl border-2 border-slate-100 bg-white px-6 shadow-sm transition-all hover:border-slate-900 hover:bg-slate-50 active:scale-95" aria-label="Bagikan Laporan">
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
          <button key={tab.id} role="tab" aria-selected={activeTab === tab.id} onClick={() => navigateTo(tab.id, tab.label)} className={`flex items-center gap-3 whitespace-nowrap rounded-2xl px-6 py-4 text-[10px] font-black uppercase transition-all ${activeTab === tab.id ? "-translate-y-1 bg-slate-900 text-white shadow-xl" : "border-2 border-slate-100 bg-white text-slate-400 hover:border-slate-900 hover:text-slate-900"}`}>
            <tab.icon size={16} /> {tab.label}
          </button>
        ))}
      </nav>

      {/* MAIN CONTENT AREA */}
      <main id="main-content" className="outline-none">
        {activeTab === "overview" && (
          <div className="space-y-10 duration-500 animate-in fade-in slide-in-from-bottom-4">
            
            {/* TOP ANALYTICS */}
            <div className="grid grid-cols-1 gap-8 lg:grid-cols-5">
              <section className="rounded-[3rem] border-2 border-slate-100 bg-white p-8 shadow-sm lg:col-span-2">
                <h3 className="mb-6 flex items-center gap-2 text-[11px] font-black uppercase tracking-widest text-slate-900"><Activity size={16} className="text-emerald-500" /> Keseimbangan Klaster</h3>
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
                <h3 className="mb-4 flex items-center gap-2 text-[11px] font-black uppercase tracking-widest text-emerald-600"><Award size={18} /> Research Executive Summary</h3>
                <div className="text-2xl font-black italic leading-tight tracking-tighter text-slate-800 md:text-3xl">
                  &quot;{campus?.smart_narrative_summary || "Menganalisis data almamater Anda..."}&quot;
                </div>
              </section>
            </div>

            {/* KEY METRICS GRID */}
            <section aria-label="Metrik Kunci Akademik" className="grid grid-cols-1 gap-6 text-left sm:grid-cols-2 lg:grid-cols-4">
               <div className="rounded-[2rem] border-2 border-slate-100 bg-white p-6 shadow-sm">
                  <p className="text-[9px] font-black uppercase tracking-widest text-slate-400">Populasi {labelTalent}</p>
                  <p className="text-4xl font-black tracking-tighter">{currentStats.total}</p>
               </div>
               <div className="rounded-[2rem] border-2 border-slate-100 bg-white p-6 shadow-sm text-emerald-600">
                  <p className="text-[9px] font-black uppercase tracking-widest text-emerald-500">Alumni Sudah Kerja</p>
                  <p className="text-4xl font-black tracking-tighter">{currentStats.hired}</p>
               </div>
               <div className="rounded-[2rem] border-2 border-slate-100 bg-white p-6 shadow-sm text-blue-600">
                  <p className="text-[9px] font-black uppercase tracking-widest text-blue-500">Employment Rate</p>
                  <p className="text-4xl font-black tracking-tighter">{currentStats.rate}%</p>
               </div>
               <div className="rounded-[2rem] border-2 border-orange-200 bg-orange-50 p-6 shadow-sm text-orange-700">
                  <p className="text-[9px] font-black uppercase tracking-widest text-orange-500">Pending Validasi</p>
                  <p className="text-4xl font-black tracking-tighter">{currentStats.unverified}</p>
               </div>
            </section>

            {/* DIVERSITY & GENDER ANALYTICS */}
            <div className="grid grid-cols-1 gap-8 text-left lg:grid-cols-3">
              <div className="rounded-[2.5rem] border-2 border-slate-100 bg-white p-8 lg:col-span-2">
                <h4 className="mb-6 flex items-center gap-2 text-[11px] font-black uppercase tracking-widest"><Users className="text-emerald-600" size={16} /> Peta Ragam Disabilitas</h4>
                <div className="space-y-4">
                  {Object.entries(campus?.stats_disability_map || {}).map(([type, count]: [string, any]) => (
                    <div key={type} className="space-y-1">
                      <div className="flex justify-between text-[9px] font-black uppercase text-slate-500"><span>{type}</span><span>{count} Orang</span></div>
                      <div className="h-2 overflow-hidden rounded-full bg-slate-100">
                        <div className="h-full bg-emerald-600 transition-all duration-1000" style={{ width: `${(count / (currentStats.total || 1)) * 100}%` }} />
                      </div>
                    </div>
                  ))}
                  {(!campus?.stats_disability_map || Object.keys(campus.stats_disability_map).length === 0) && <p className="text-[10px] font-black italic text-slate-300">Belum ada data ragam talenta.</p>}
                </div>
              </div>

              <div className="space-y-6">
                <div className="rounded-[2.5rem] border-2 border-slate-100 bg-white p-8">
                  <h4 className="mb-4 flex items-center gap-2 text-[11px] font-black uppercase tracking-widest"><User className="text-blue-500" size={16} /> Proporsi Gender</h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="rounded-2xl bg-blue-50 p-4 border-l-4 border-blue-500 text-center">
                      <p className="text-[8px] font-black uppercase text-blue-400">Laki-laki</p>
                      <p className="text-2xl font-black">{campus?.stats_gender_map?.male || 0}</p>
                    </div>
                    <div className="rounded-2xl bg-pink-50 p-4 border-l-4 border-pink-500 text-center">
                      <p className="text-[8px] font-black uppercase text-pink-400">Perempuan</p>
                      <p className="text-2xl font-black">{campus?.stats_gender_map?.female || 0}</p>
                    </div>
                  </div>
                </div>
                <div className="rounded-[2.5rem] bg-emerald-600 p-8 text-white shadow-lg">
                  <p className="text-[10px] font-black uppercase tracking-widest opacity-80">Verifikasi Alumni</p>
                  <p className="mt-2 text-xl font-black leading-tight italic tracking-tight uppercase">Ada {currentStats.unverified} lulusan menunggu divalidasi.</p>
                  <button onClick={() => navigateTo("tracer", "Talent Tracer")} className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl bg-white py-3 text-[10px] font-black uppercase text-emerald-700 transition-transform hover:scale-105">
                    Mulai Validasi <MousePointerClick size={16} />
                  </button>
                </div>
              </div>
            </div>

            {/* ACTION CARD */}
            <div className="rounded-[2.5rem] bg-slate-900 p-10 text-white relative overflow-hidden flex flex-col justify-between text-left">
              <div className="relative z-10 max-w-2xl">
                <Zap className="mb-4 text-amber-400" size={32} />
                <h4 className="text-2xl font-black uppercase italic leading-tight tracking-tighter">Mulai Audit Inklusi Berkala</h4>
                <p className="mt-4 text-[11px] font-medium italic leading-relaxed opacity-60">Lengkapi 14 indikator riset untuk mendapatkan skor National Inclusion Index yang valid bagi institusi Anda.</p>
              </div>
              <button onClick={() => navigateTo("profile", "Audit Inklusi")} className="relative z-10 mt-8 flex w-full items-center justify-center gap-2 rounded-2xl bg-white py-4 text-[10px] font-black uppercase tracking-widest text-slate-900 transition-all hover:bg-emerald-400 md:max-w-xs">
                Buka Panel Audit <ChevronRight size={16} />
              </button>
              <School className="absolute -bottom-10 -right-10 opacity-10" size={200} aria-hidden="true" />
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