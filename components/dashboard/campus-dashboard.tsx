"use client";

import React, { useState, useEffect, useCallback, useMemo } from "react";
import { supabase } from "@/lib/supabase";
import { 
  Users, BarChart3, Settings, 
  ShieldCheck, Share2, LayoutDashboard,
  Activity, Award, Lock, 
  Zap, User, School,
  MousePointerClick, Briefcase, Sparkles, TrendingUp,
  ExternalLink, ChevronRight, CheckCircle2,
  Medal, AlertCircle
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
  
  // STATE REAL-TIME
  const [unverifiedCount, setUnverifiedCount] = useState(0);

  const labelTalent = "Mahasiswa";

  // Fungsi khusus untuk mengambil angka verifikasi secara Real-time
  const fetchRealtimeStats = useCallback(async () => {
    if (!user?.id) return;
    const { count, error } = await supabase
      .from("campus_verifications")
      .select("*", { count: 'exact', head: true })
      .eq("campus_id", user.id)
      .eq("status", "pending");

    if (!error) setUnverifiedCount(count || 0);
  }, [user?.id]);

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

      // Hitung kelengkapan profil
      const fields = ["name", "description", "location", "website", "nib_number"];
      const filled = fields.filter(f => campusData[f] && campusData[f].length > 0).length;
      const acc = (campusData.master_accommodations_provided?.length || 0) > 0 ? 1 : 0;
      setProfileCompletion(Math.round(((filled + acc) / (fields.length + 1)) * 100));

      // Ambil angka verifikasi awal
      await fetchRealtimeStats();

    } catch (e) { 
      console.error("Campus Dashboard Fetch Error:", e); 
    } finally { 
      setLoading(false); 
    }
  }, [user?.id, fetchRealtimeStats]);

  useEffect(() => { 
    fetchDashboardData(); 

    // SETUP SUPABASE REALTIME SUBSCRIPTION
    const channel = supabase
      .channel('realtime_campus_verifications')
      .on(
        'postgres_changes', 
        { 
          event: '*', 
          schema: 'public', 
          table: 'campus_verifications',
          filter: `campus_id=eq.${user.id}`
        }, 
        () => {
          fetchRealtimeStats(); // Update angka secara instan jika ada data masuk/berubah
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user?.id, fetchDashboardData, fetchRealtimeStats]);

  // Logika Penentuan Badge
  const badgeInfo = useMemo(() => {
    const score = campus?.inclusion_score || 0;
    if (score >= 80) return { label: "Platinum", color: "text-slate-900", bg: "bg-gradient-to-br from-slate-100 to-slate-300", icon: Sparkles };
    if (score >= 60) return { label: "Gold", color: "text-amber-700", bg: "bg-amber-100", icon: Medal };
    if (score >= 40) return { label: "Silver", color: "text-slate-500", bg: "bg-slate-100", icon: Award };
    return { label: "Bronze", color: "text-orange-700", bg: "bg-orange-50", icon: ShieldCheck };
  }, [campus?.inclusion_score]);

  const radarData = useMemo(() => [
    { subject: 'Fisik (30%)', A: campus?.inclusion_score_physical || 0 },
    { subject: 'Digital (40%)', A: campus?.inclusion_score_digital || 0 },
    { subject: 'Output (30%)', A: campus?.inclusion_score_output || 0 },
  ], [campus]);

  const currentStats = {
    total: Number(campus?.stats_academic_total || 0),
    hired: Number(campus?.stats_academic_hired || 0),
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
    <div role="status" aria-live="polite" className="flex min-h-screen flex-col items-center justify-center font-black uppercase italic tracking-tighter text-slate-400 animate-pulse">
      <Activity className="mb-4 animate-spin text-emerald-500" size={48} />
      Menyiapkan Data Institusi...
    </div>
  );

  return (
    <div className="mx-auto max-w-7xl space-y-10 px-4 py-10 font-sans text-slate-900 selection:bg-emerald-100">
      <div className="sr-only" aria-live="polite">{announcement}</div>

      {/* HEADER SECTION */}
      <header className="flex flex-col items-start justify-between gap-6 border-b-4 border-slate-900 pb-10 text-left md:flex-row md:items-end">
        <div className="space-y-4 text-left">
          <div className="flex items-center gap-3">
            <div className="rounded-xl bg-emerald-600 p-2 text-white shadow-lg" aria-hidden="true">
              <School size={28} />
            </div>
            <div>
              <p className="text-[10px] font-black uppercase leading-none tracking-[0.3em] text-emerald-600">Portal Almamater • {profileCompletion}% Kelengkapan</p>
              <h1 className="mt-1 text-4xl font-black uppercase italic leading-none tracking-tighter">{campus?.name}</h1>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <div className={`flex items-center gap-2 rounded-full border-2 border-slate-900 ${badgeInfo.bg} px-4 py-1.5 shadow-[4px_4px_0px_0px_rgba(15,23,42,1)]`}>
              <badgeInfo.icon size={16} className={badgeInfo.color} />
              <span className={`text-[10px] font-black uppercase ${badgeInfo.color}`}>Peringkat {badgeInfo.label}</span>
            </div>
            <span className="flex items-center gap-1.5 rounded-full border-2 border-emerald-500 bg-emerald-50 px-4 py-1.5 text-[10px] font-black uppercase text-emerald-700">
              Inclusion Index: {campus?.inclusion_score || 0}%
            </span>
          </div>
        </div>
        
        <div className="flex w-full gap-3 md:w-auto">
          <button onClick={() => navigateTo("hub", "Career Hub")} className="group flex flex-1 items-center justify-center gap-3 rounded-2xl bg-slate-900 px-8 py-5 text-[11px] font-black uppercase italic tracking-widest text-white shadow-xl transition-all hover:bg-emerald-600 md:flex-none">
            <Briefcase size={18} className="group-hover:animate-bounce" /> Career & Skill Hub
          </button>
          <button onClick={handleShare} className="rounded-2xl border-2 border-slate-100 bg-white px-6 shadow-sm transition-all hover:border-slate-900 hover:bg-slate-50 active:scale-95" aria-label="Bagikan profil institusi">
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
          { id: "profile", label: "Lengkapi Profil", icon: Settings },
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
            
            {/* 1. SCORING CLUSTER ANALYSIS */}
            <div className="grid grid-cols-1 gap-8 lg:grid-cols-5">
              <section className="rounded-[3rem] border-2 border-slate-100 bg-white p-8 shadow-sm lg:col-span-2 text-left">
                <h3 className="mb-6 flex items-center gap-2 text-[11px] font-black uppercase tracking-widest text-slate-900 leading-none">
                  <Activity size={16} className="text-emerald-500" /> Keseimbangan Klaster Inklusi
                </h3>
                <div className="h-[250px] w-full" aria-label="Grafik Radar Keseimbangan Inklusi">
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
                  <Award size={18} /> Ringkasan Insight & Narasi Strategis
                </h3>
                <div className="text-2xl font-black italic leading-tight tracking-tighter text-slate-800 md:text-3xl text-left">
                  &quot;{campus?.smart_narrative_summary || "Institusi Anda sedang dalam proses pemetaan data inklusi nasional."}&quot;
                </div>
              </section>
            </div>

            {/* 2. REAL-TIME VERIFICATION ALERT */}
            <div className="grid grid-cols-1 gap-8 text-left lg:grid-cols-3">
               <div className="rounded-[2.5rem] border-2 border-slate-100 bg-white p-10 lg:col-span-2 text-left">
                  <h4 className="mb-8 flex items-center gap-2 text-xl font-black uppercase italic tracking-tighter leading-none">
                    <Users className="text-emerald-600" size={24} /> Sebaran Ragam Disabilitas {labelTalent}
                  </h4>
                  <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                    {Object.entries(campus?.stats_disability_map || {}).map(([type, count]: [string, any]) => (
                      <div key={type} className="space-y-2">
                        <div className="flex justify-between text-[10px] font-black uppercase text-slate-500">
                          <span>{type}</span><span>{count} Orang</span>
                        </div>
                        <div className="h-3 overflow-hidden rounded-full bg-slate-100 shadow-inner">
                          <div className="h-full bg-emerald-600 transition-all duration-1000" style={{ width: `${(count / (currentStats.total || 1)) * 100}%` }} />
                        </div>
                      </div>
                    ))}
                  </div>
               </div>

               <div className="space-y-8">
                  <section className="rounded-[2.5rem] bg-emerald-600 p-8 text-white shadow-[8px_8px_0px_0px_rgba(15,23,42,1)] text-left">
                    <div className="flex items-center gap-2">
                       <AlertCircle size={16} className="text-emerald-200" />
                       <p className="text-[10px] font-black uppercase tracking-widest opacity-80 leading-none">Status Afiliasi Alumni (Real-time)</p>
                    </div>
                    <p className="mt-3 text-3xl font-black leading-tight italic tracking-tight uppercase" aria-live="polite">
                      {unverifiedCount} Antrian Konfirmasi
                    </p>
                    <button onClick={() => navigateTo("tracer", "Talent Tracer")} className="mt-8 flex w-full items-center justify-center gap-2 rounded-2xl bg-slate-900 py-4 text-[10px] font-black uppercase tracking-widest transition-transform hover:scale-105 active:scale-95 shadow-xl">
                      Verifikasi Sekarang <MousePointerClick size={16} />
                    </button>
                  </section>

                  <div className="rounded-[2.5rem] border-2 border-slate-100 bg-white p-8 text-left">
                    <p className="text-[9px] font-black uppercase tracking-widest text-slate-400">Total Talent Terdata</p>
                    <p className="mt-2 text-5xl font-black tracking-tighter">{currentStats.total}</p>
                  </div>
               </div>
            </div>

            {/* 3. CALL TO ACTION */}
            <div className="relative flex flex-col items-center justify-between overflow-hidden rounded-[3.5rem] bg-slate-900 p-12 text-center text-white lg:flex-row lg:text-left">
              <div className="relative z-10 max-w-2xl text-left">
                <Sparkles className="mb-6 text-emerald-400" size={40} />
                <h4 className="text-3xl font-black uppercase italic leading-tight tracking-tighter md:text-4xl">Lengkapi Profil Inklusi Institusi</h4>
                <p className="mt-4 text-sm font-medium italic leading-relaxed text-slate-400">
                  Update informasi fasilitas dan layanan kampus Anda secara berkala.
                </p>
              </div>
              <button 
                onClick={() => navigateTo("profile", "Lengkapi Profil")}
                className="relative z-10 mt-10 flex items-center justify-center gap-3 rounded-3xl bg-emerald-500 px-10 py-6 text-xs font-black uppercase tracking-widest text-slate-900 transition-all hover:bg-white lg:mt-0"
              >
                Update Profil Institusi <ChevronRight size={20} />
              </button>
              <School className="absolute -bottom-20 -right-20 opacity-[0.03]" size={400} aria-hidden="true" />
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