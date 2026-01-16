"use client";

import React, { useState, useEffect, useCallback } from "react";
import { supabase } from "@/lib/supabase";
import { 
  Users, BarChart3, Settings, 
  ShieldCheck, Share2, LayoutDashboard,
  Activity, Award, Lock, 
  Zap, User, Timer, ExternalLink, School,
  MousePointerClick, Briefcase, Sparkles, TrendingUp
} from "lucide-react";

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
    const link = document.querySelector("link[rel='canonical']") || document.createElement("link");
    link.setAttribute("rel", "canonical");
    link.setAttribute("href", "https://disabilitas.com/dashboard/campus");
    if (!document.head.contains(link)) document.head.appendChild(link);
  }, [fetchDashboardData]);

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
      url: `https://disabilitas.com/campus/${campus?.id}`
    };

    // Solusi Type-Safe untuk menghapus error build:
    const canNativeShare = typeof window !== "undefined" && 
                           typeof navigator !== "undefined" && 
                           Boolean(navigator.share);

    if (canNativeShare) {
      shareNative(data);
    } else {
      shareToWhatsApp(data);
    }
  };
if (loading) return (
    <div role="status" aria-live="polite" className="flex min-h-screen flex-col items-center justify-center font-black uppercase italic tracking-tighter text-slate-400 animate-pulse">
      <Activity className="mb-4 animate-spin text-emerald-500" size={48} />
      Sinkronisasi Data Almamater...
    </div>
  );

  return (
    <div className="mx-auto max-w-7xl space-y-10 px-4 py-10 text-slate-900 selection:bg-emerald-100">
      {/* Screen Reader Announcement */}
      <div className="sr-only" aria-live="polite">{announcement}</div>

      {/* HEADER SECTION */}
      <header className="flex flex-col items-start justify-between gap-6 border-b-4 border-slate-900 pb-10 md:flex-row md:items-end">
        <div className="space-y-4 text-left">
          <div className="flex items-center gap-3">
            <div className="rounded-xl bg-emerald-600 p-2 text-white shadow-lg shadow-emerald-100" aria-hidden="true">
              <School size={28} />
            </div>
            <div>
              <p className="text-[10px] font-black uppercase tracking-[0.3em] text-emerald-600 leading-none">University Portal</p>
              <h1 className="mt-1 text-4xl font-black uppercase italic tracking-tighter leading-none">{campus?.name}</h1>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <span className="flex items-center gap-1.5 rounded-full border-2 border-emerald-500 bg-emerald-50 px-4 py-1.5 text-[10px] font-black uppercase text-emerald-700">
              <ShieldCheck size={14} /> Skor Inklusi: {campus?.inclusion_score || 0}%
            </span>
            {currentStats.unverified > 0 && (
               <button 
                onClick={() => navigateTo("tracer", "Talent Tracer")} 
                className="flex items-center gap-1.5 rounded-full border-2 border-orange-500 bg-orange-50 px-4 py-1.5 text-[10px] font-black uppercase text-orange-700 animate-bounce hover:bg-orange-100 transition-colors"
                aria-label={`${currentStats.unverified} alumni menunggu verifikasi`}
               >
                <Users size={14} /> {currentStats.unverified} Menunggu Verifikasi
              </button>
            )}
          </div>
        </div>
        
        <div className="flex gap-3 w-full md:w-auto">
          <button 
            onClick={() => navigateTo("hub", "Career & Skill Hub")} 
            className="flex flex-1 items-center justify-center gap-3 md:flex-none rounded-2xl bg-slate-900 px-8 py-5 text-[11px] font-black uppercase italic text-white shadow-xl hover:bg-emerald-600 transition-all tracking-widest group focus:ring-4 focus:ring-emerald-200"
          >
            <Briefcase size={18} className="group-hover:animate-bounce" />
            Career & Skill Hub
          </button>
          <button 
            onClick={handleShare} 
            className="rounded-2xl border-2 border-slate-100 bg-white px-6 hover:border-slate-900 transition-all shadow-sm focus:ring-4 focus:ring-slate-100" 
            aria-label="Bagikan Laporan Inklusi Kampus"
          >
            <Share2 size={20} />
          </button>
        </div>
      </header>

      {/* NAVIGATION TABS */}
      <nav className="no-scrollbar flex gap-2 overflow-x-auto" role="tablist" aria-label="Menu Dashboard Kampus">
        {[
          { id: "overview", label: "Dashboard", icon: LayoutDashboard },
          { id: "hub", label: "Career & Skill Hub", icon: Zap },
          { id: "tracer", label: "Talent Tracer", icon: BarChart3 },
          { id: "profile", label: "Profil Kampus", icon: Settings },
          { id: "account", label: "Akun", icon: Lock },
        ].map((tab) => (
          <button 
            key={tab.id} 
            role="tab"
            aria-selected={activeTab === tab.id}
            aria-controls="main-content"
            onClick={() => navigateTo(tab.id, tab.label)} 
            className={`flex items-center gap-3 whitespace-nowrap rounded-2xl px-6 py-4 text-[10px] font-black uppercase transition-all ${activeTab === tab.id ? "bg-slate-900 text-white shadow-xl -translate-y-1" : "bg-white border-2 border-slate-100 text-slate-400 hover:border-slate-900 hover:text-slate-900"}`}
          >
            <tab.icon size={16} /> {tab.label}
          </button>
        ))}
      </nav>

      {/* MAIN CONTENT AREA */}
      <main id="main-content" className="min-h-[600px] outline-none" tabIndex={-1}>
        {activeTab === "overview" && (
          <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
            
            {/* SCORE CLUSTERS - Visual Gap Analysis */}
            <section aria-label="Analisis Skor Inklusi Komposit" className="grid grid-cols-1 gap-4 md:grid-cols-3">
               {[
                 { label: "Akses Fisik", score: campus?.inclusion_score_physical, color: "emerald", icon: School },
                 { label: "Akses Digital", score: campus?.inclusion_score_digital, color: (campus?.inclusion_score_digital || 0) < 50 ? "orange" : "blue", icon: Activity },
                 { label: "Output Alumni", score: campus?.inclusion_score_output, color: "purple", icon: TrendingUp }
               ].map((cluster) => (
                 <div key={cluster.label} className={`rounded-3xl border-2 p-6 flex justify-between items-center bg-white ${cluster.color === 'orange' ? 'border-orange-200 bg-orange-50/50' : 'border-slate-100'}`}>
                    <div>
                      <p className="text-[9px] font-black uppercase text-slate-400 tracking-widest">{cluster.label}</p>
                      <p className="text-3xl font-black italic tracking-tighter">{cluster.score || 0}%</p>
                    </div>
                    <div className={`h-14 w-14 rounded-2xl border-4 flex items-center justify-center text-xs font-black bg-white shadow-sm border-${cluster.color}-500 text-${cluster.color}-600`}>
                      {cluster.score || 0}
                    </div>
                 </div>
               ))}
            </section>

            {/* INTEGRATED SMART NARRATIVE */}
            <section className="rounded-[3rem] border-2 border-slate-900 bg-white p-10 text-left shadow-[12px_12px_0px_0px_rgba(15,23,42,1)]">
              <h3 className="mb-6 flex items-center gap-2 text-[11px] font-black uppercase tracking-widest text-emerald-600">
                <Award size={18} /> Strategi & Rekomendasi Kampus
              </h3>
              <div className="max-w-5xl space-y-6 text-xl font-medium leading-relaxed text-slate-800 md:text-2xl italic">
                <p className="whitespace-pre-line">
                  {campus?.smart_narrative_summary || "Menganalisis data almamater Anda..."}
                </p>
              </div>
            </section>

            {/* KEY METRICS */}
            <section aria-label="Metrik Kunci Akademik" className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 text-left">
              <div className="rounded-[2.5rem] border-2 border-slate-100 bg-white p-8 shadow-sm group hover:border-slate-900 transition-colors">
                <p className="text-[9px] font-black uppercase tracking-widest text-slate-400">Populasi {labelTalent}</p>
                <p className="mt-1 text-5xl font-black tracking-tighter group-hover:scale-105 transition-transform origin-left">{currentStats.total}</p>
              </div>
              <div className="rounded-[2.5rem] border-2 border-slate-100 bg-white p-8 shadow-sm group hover:border-emerald-500 transition-colors">
                <p className="text-[9px] font-black italic uppercase tracking-widest text-emerald-500">Alumni Terserap Kerja</p>
                <p className="mt-1 text-5xl font-black tracking-tighter text-emerald-600 group-hover:scale-105 transition-transform origin-left">{currentStats.hired}</p>
              </div>
              <div className="rounded-[2.5rem] border-2 border-slate-100 bg-white p-8 shadow-sm group hover:border-blue-500 transition-colors">
                <p className="text-[9px] font-black italic uppercase tracking-widest text-blue-500">Employment Rate</p>
                <p className="mt-1 text-5xl font-black tracking-tighter text-blue-600 group-hover:scale-105 transition-transform origin-left">{currentStats.rate}%</p>
              </div>
            </section>

            {/* DIVERSITY & GENDER ANALYTICS */}
            <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
              <div className="lg:col-span-2 grid grid-cols-1 gap-6 md:grid-cols-2 text-left">
                <div className="rounded-[2.5rem] border-2 border-slate-50 bg-white p-8 shadow-sm">
                  <h4 className="mb-6 flex items-center gap-2 text-[11px] font-black uppercase tracking-widest text-slate-900">
                    <Users className="text-emerald-600" size={16} /> Peta Ragam Disabilitas
                  </h4>
                  <div className="space-y-4">
                    {Object.entries(campus?.stats_disability_map || {}).map(([type, count]: [string, any]) => (
                      <div key={type} className="space-y-1">
                        <div className="flex justify-between text-[9px] font-black uppercase text-slate-500">
                          <span>{type}</span><span>{count} Orang</span>
                        </div>
                        <div className="h-2 overflow-hidden rounded-full bg-slate-100" aria-hidden="true">
                          <div className="h-full bg-emerald-600 transition-all duration-1000" style={{ width: `${(count / (currentStats.total || 1)) * 100}%` }} />
                        </div>
                      </div>
                    ))}
                    {Object.keys(campus?.stats_disability_map || {}).length === 0 && (
                      <p className="text-[10px] font-black uppercase italic text-slate-300">Belum ada data ragam mahasiswa.</p>
                    )}
                  </div>
                </div>
                
                <div className="space-y-8 rounded-[2.5rem] border-2 border-slate-50 bg-white p-8 shadow-sm">
                   <h4 className="mb-4 flex items-center gap-2 text-[11px] font-black uppercase tracking-widest text-slate-900">
                      <User className="text-emerald-500" size={16} /> Proporsi & Validasi
                    </h4>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="rounded-2xl bg-slate-50 p-4 border-l-4 border-emerald-500">
                        <p className="text-[8px] font-black uppercase text-slate-400 tracking-widest text-left">Laki-laki</p>
                        <p className="mt-1 text-xl font-black text-left">{campus?.stats_gender_map?.male || 0}</p>
                      </div>
                      <div className="rounded-2xl bg-slate-50 p-4 border-l-4 border-pink-500">
                        <p className="text-[8px] font-black uppercase text-slate-400 tracking-widest text-left">Perempuan</p>
                        <p className="mt-1 text-xl font-black text-left">{campus?.stats_gender_map?.female || 0}</p>
                      </div>
                    </div>
                    <button 
                      onClick={() => navigateTo("tracer", "Talent Tracer")} 
                      className="w-full flex items-center justify-between rounded-2xl bg-emerald-50 p-5 text-emerald-800 hover:bg-emerald-100 transition-all group"
                      aria-label="Kelola Verifikasi Alumni"
                    >
                      <div className="text-left">
                        <p className="text-[10px] font-black uppercase">Verifikasi Alumni</p>
                        <p className="text-xs italic font-medium opacity-70">Ada {currentStats.unverified} permohonan.</p>
                      </div>
                      <MousePointerClick size={20} className="group-hover:scale-110 transition-transform" />
                    </button>
                </div>
              </div>

              {/* BRANDING CARD */}
              <div className="rounded-[2.5rem] bg-slate-900 p-10 text-left text-white shadow-2xl flex flex-col justify-between group overflow-hidden relative border-4 border-slate-800">
                <div className="relative z-10">
                  <Sparkles className="mb-6 text-emerald-400" size={32} />
                  <p className="text-[10px] font-black uppercase tracking-[0.2em] opacity-70 italic leading-none">Standard v0.0.2</p>
                  <p className="mt-4 text-3xl font-black italic tracking-tighter uppercase leading-tight">Inklusivitas Berbasis Data Nasional</p>
                </div>
                <div className="mt-8 border-t border-white/10 pt-6 text-left relative z-10">
                    <p className="text-[9px] font-bold uppercase opacity-60 tracking-widest italic">Dashboard disabilitas.com © 2026</p>
                </div>
                <div className="absolute -right-16 -bottom-16 opacity-5 group-hover:opacity-10 transition-all duration-700">
                  <School size={280} />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* RENDER TAB COMPONENTS */}
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