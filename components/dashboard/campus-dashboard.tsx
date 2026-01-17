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
  Medal, AlertCircle, PieChart
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
  
  // STATE DATA REAL-TIME PLATFORM
  const [unverifiedCount, setUnverifiedCount] = useState(0);
  const [platformStats, setPlatformStats] = useState({
    mahasiswa: 0,
    alumni: 0,
    bekerja: 0,
    male: 0,
    female: 0,
    disabilityMap: {} as Record<string, number>,
    total: 0
  });

  const labelTalent = "Mahasiswa";
  const labelAlumni = "Alumni Disabilitas";

  const fetchRealtimeData = useCallback(async () => {
    if (!user?.id) return;
    const currentYear = new Date().getFullYear();

    try {
      const { count: pending } = await supabase
        .from("campus_verifications")
        .select("*", { count: 'exact', head: true })
        .eq("campus_id", user.id)
        .eq("status", "pending");
      
      setUnverifiedCount(pending || 0);

      const { data: verifiedTalents, error } = await supabase
        .from("campus_verifications")
        .select(`
          profile_id,
          profiles (
            gender,
            graduation_date,
            career_status,
            disability_type
          )
        `)
        .eq("campus_id", user.id)
        .eq("status", "verified");

      if (verifiedTalents) {
        const stats = verifiedTalents.reduce((acc: any, item: any) => {
          const p = item.profiles;
          if (!p) return acc;

          acc.total++;
          
          // Gender
          if (p.gender === 'male') acc.male++;
          if (p.gender === 'female') acc.female++;

          // Disabilitas
          if (p.disability_type) {
            acc.disabilityMap[p.disability_type] = (acc.disabilityMap[p.disability_type] || 0) + 1;
          }

          // Mahasiswa vs Alumni
          if (p.graduation_date && Number(p.graduation_date) <= currentYear) {
            acc.alumni++;
          } else {
            acc.mahasiswa++;
          }

          // Karir
          const workingStatus = ['Pegawai Swasta', 'Pegawai BUMN / BUMD', 'ASN (PNS / PPPK)', 'Wiraswasta / Entrepreneur', 'Freelancer / Tenaga Lepas'];
          if (workingStatus.includes(p.career_status)) acc.bekerja++;

          return acc;
        }, { mahasiswa: 0, alumni: 0, bekerja: 0, male: 0, female: 0, disabilityMap: {}, total: 0 });

        setPlatformStats(stats);
      }
    } catch (err) {
      console.error("Realtime fetch error:", err);
    }
  }, [user?.id]);

  const fetchDashboardData = useCallback(async () => {
    if (!user?.id) return;
    setLoading(true);
    try {
      const { data: campusData } = await supabase
        .from("campuses")
        .select("*")
        .eq("id", user.id)
        .single();
      
      if (campusData) {
        setCampus(campusData);
        const fields = ["name", "description", "location", "website", "nib_number"];
        const filled = fields.filter(f => campusData[f] && campusData[f].length > 0).length;
        const acc = (campusData.master_accommodations_provided?.length || 0) > 0 ? 1 : 0;
        setProfileCompletion(Math.round(((filled + acc) / (fields.length + 1)) * 100));
      }
      await fetchRealtimeData();
    } finally { 
      setLoading(false); 
    }
  }, [user?.id, fetchRealtimeData]);

  useEffect(() => { 
    fetchDashboardData(); 
    const link = document.querySelector("link[rel='canonical']") || document.createElement("link");
    link.setAttribute("rel", "canonical");
    link.setAttribute("href", "https://disabilitas.com/dashboard/campus");
    if (!document.head.contains(link)) document.head.appendChild(link);

    const channel = supabase
      .channel('realtime_campus_verifications')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'campus_verifications', filter: `campus_id=eq.${user.id}` }, () => fetchRealtimeData())
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [user?.id, fetchDashboardData, fetchRealtimeData]);

  // LOGIKA NARASI STRATEGIS (Employability)
  const dynamicNarrative = useMemo(() => {
    const rate = platformStats.alumni > 0 ? Math.round((platformStats.bekerja / platformStats.alumni) * 100) : 0;
    if (rate > 70) return `Luar biasa! Tingkat keterserapan alumni Anda mencapai ${rate}%. Fokus pada penguatan pilar Digital untuk mempertahankan performa.`;
    if (rate > 40) return `Performa cukup stabil (${rate}%). Disarankan meningkatkan kemitraan dengan sektor swasta untuk alumni yang belum bekerja.`;
    return `Tantangan terdeteksi. Hanya ${rate}% alumni yang terserap kerja. ULD perlu mengintensifkan program Career Hub dan Skill Hub.`;
  }, [platformStats]);

  const radarData = useMemo(() => [
    { subject: 'Fisik', A: campus?.inclusion_score_physical || 0 },
    { subject: 'Digital', A: campus?.inclusion_score_digital || 0 },
    { subject: 'Output', A: campus?.inclusion_score_output || 0 },
  ], [campus]);

  const handleShare = () => {
    const data = {
      name: campus?.name || "Institusi",
      total: Number(campus?.stats_academic_total || 0),
      rate: campus?.stats_academic_total > 0 ? Math.round((campus.stats_academic_hired / campus.stats_academic_total) * 100) : 0,
      score: campus?.inclusion_score || 0,
      url: `https://disabilitas.com/kampus/${campus?.id}`
    };
    if (typeof window !== "undefined" && (window.navigator as any).share) {
      shareNative(data);
    } else {
      shareToWhatsApp(data);
    }
  };

  const navigateTo = (tabId: string, label: string) => {
    setActiveTab(tabId);
    setAnnouncement(`Halaman ${label} dimuat`);
    window.scrollTo(0, 0);
  };

  if (loading) return (
    <div role="status" className="flex min-h-screen flex-col items-center justify-center font-black uppercase italic tracking-tighter text-slate-400 animate-pulse">
      <Activity className="mb-4 animate-spin text-emerald-500" size={48} aria-hidden="true" />
      Menyiapkan Portal Inklusi...
    </div>
  );

  return (
    <div className="mx-auto max-w-7xl space-y-10 px-4 py-10 text-slate-900 selection:bg-emerald-100 text-left">
      <div className="sr-only" aria-live="assertive">{announcement}</div>

      {/* HEADER */}
      <header className="flex flex-col items-start justify-between gap-6 border-b-4 border-slate-900 pb-10 md:flex-row md:items-end">
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <div className="rounded-xl bg-emerald-600 p-2 text-white shadow-lg"><School size={28} aria-hidden="true" /></div>
            <div>
              <p className="text-[10px] font-black uppercase tracking-[0.3em] text-emerald-600 leading-none">
                Profil Almamater • {profileCompletion}% Lengkap
              </p>
              <h1 className="mt-1 text-4xl font-black uppercase italic tracking-tighter leading-none">{campus?.name}</h1>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <div className={`flex items-center gap-2 rounded-full border-2 border-slate-900 ${campus?.inclusion_score >= 80 ? 'bg-slate-100' : 'bg-white'} px-4 py-1.5 shadow-[4px_4px_0px_0px_rgba(15,23,42,1)]`}>
              <Award size={16} className="text-slate-900" aria-hidden="true" />
              <span className="text-[10px] font-black uppercase tracking-widest">Skor Inklusi: {campus?.inclusion_score || 0}</span>
            </div>
            <a href={`/kampus/${campus?.id}`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 rounded-full border-2 border-slate-200 bg-white px-4 py-1.5 text-[10px] font-black uppercase text-slate-500 hover:border-slate-900 transition-all shadow-sm">
              <ExternalLink size={14} aria-hidden="true" /> Profil Publik
            </a>
          </div>
        </div>
        <div className="flex w-full gap-3 md:w-auto">
          <button onClick={() => navigateTo("hub", "Career Hub")} className="group flex flex-1 items-center justify-center gap-3 rounded-2xl bg-slate-900 px-8 py-5 text-[11px] font-black uppercase italic tracking-widest text-white shadow-xl hover:bg-emerald-600 transition-all md:flex-none">
            <Briefcase size={18} aria-hidden="true" /> Career & Skill Hub
          </button>
          <button onClick={handleShare} aria-label="Bagikan Dashboard" className="rounded-2xl border-2 border-slate-100 bg-white px-6 shadow-sm hover:border-slate-900 transition-all">
            <Share2 size={20} aria-hidden="true" />
          </button>
        </div>
      </header>

      {/* NAVIGATION TABS */}
      <nav className="no-scrollbar flex gap-2 overflow-x-auto" role="tablist">
        {[
          { id: "overview", label: "Dashboard", icon: LayoutDashboard },
          { id: "hub", label: "Career & Hub", icon: Zap },
          { id: "tracer", label: "Talent Tracer", icon: BarChart3 },
          { id: "profile", label: "Lengkapi Profil", icon: Settings },
          { id: "account", label: "Akun", icon: Lock },
        ].map((tab) => (
          <button 
            key={tab.id} 
            role="tab"
            aria-selected={activeTab === tab.id}
            onClick={() => navigateTo(tab.id, tab.label)} 
            className={`flex items-center gap-3 whitespace-nowrap rounded-2xl px-6 py-4 text-[10px] font-black uppercase transition-all ${activeTab === tab.id ? "bg-slate-900 text-white shadow-xl -translate-y-1" : "border-2 border-slate-100 bg-white text-slate-400 hover:border-slate-900"}`}
          >
            <tab.icon size={16} aria-hidden="true" /> {tab.label}
          </button>
        ))}
      </nav>

      <main id="main-content">
        {activeTab === "overview" && (
          <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
            
            {/* ANALISIS RADAR */}
            <div className="grid grid-cols-1 gap-8 lg:grid-cols-5">
              <section className="rounded-[3rem] border-2 border-slate-100 bg-white p-8 lg:col-span-2">
                <h3 className="mb-6 flex items-center gap-2 text-[11px] font-black uppercase tracking-widest leading-none">
                  <Activity size={16} className="text-emerald-500" aria-hidden="true" /> Keseimbangan Pilar Inklusi
                </h3>
                {/* ACCESSIBLE RADAR CHART */}
                <div 
                  className="h-[220px] w-full" 
                  role="img" 
                  aria-label={`Grafik Radar Inklusi. Skor Fisik: ${radarData[0].A}, Skor Digital: ${radarData[1].A}, Skor Output: ${radarData[2].A}`}
                >
                  <ResponsiveContainer width="100%" height="100%">
                    <RadarChart data={radarData}>
                      <PolarGrid stroke="#f1f5f9" />
                      <PolarAngleAxis dataKey="subject" tick={{ fill: '#94a3b8', fontSize: 9, fontWeight: 800 }} />
                      <Radar dataKey="A" stroke="#10b981" fill="#10b981" fillOpacity={0.6} />
                    </RadarChart>
                  </ResponsiveContainer>
                </div>
              </section>

              <section className="flex flex-col justify-center rounded-[3rem] border-4 border-slate-900 bg-white p-10 shadow-[12px_12px_0px_0px_rgba(15,23,42,1)] lg:col-span-3">
                <h3 className="mb-4 flex items-center gap-2 text-[11px] font-black uppercase tracking-widest text-emerald-600 leading-none">
                  <Sparkles size={18} aria-hidden="true" /> Insight Strategis (Platform AI)
                </h3>
                <p className="text-2xl font-black italic leading-tight tracking-tighter text-slate-800 md:text-3xl">
                  &quot;{dynamicNarrative}&quot;
                </p>
                <div className="mt-6 flex items-center gap-3">
                  <div className="flex -space-x-2">
                    {[1,2,3].map(i => <div key={i} className="h-8 w-8 rounded-full border-2 border-white bg-slate-200" />)}
                  </div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Dianalisis dari {platformStats.total} talenta aktif</p>
                </div>
              </section>
            </div>

            {/* DUA DIMENSI DATA */}
            <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
              <section className="rounded-[2.5rem] border-2 border-slate-100 bg-white p-10">
                <h4 className="mb-6 flex items-center gap-2 text-xs font-black uppercase tracking-[0.2em] text-slate-400">
                  <Settings size={16} aria-hidden="true" /> Estimasi Internal (Input Kampus)
                </h4>
                <div className="grid grid-cols-2 gap-8">
                  <div className="space-y-1">
                    <p className="text-[10px] font-black uppercase text-slate-400">Total {labelTalent}</p>
                    <p className="text-5xl font-black tracking-tighter text-slate-900 leading-tight" aria-label={`${campus?.stats_academic_total || 0} Mahasiswa sesuai data internal`}>
                      {campus?.stats_academic_total || 0}
                    </p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-[10px] font-black uppercase text-slate-400">Terpantau Kerja</p>
                    <p className="text-5xl font-black tracking-tighter text-emerald-600 leading-tight">
                      {campus?.stats_academic_hired || 0}
                    </p>
                  </div>
                </div>
              </section>

              <section className="rounded-[2.5rem] border-4 border-emerald-600 bg-emerald-50 p-10 shadow-[8px_8px_0px_0px_rgba(16,185,129,1)]">
                <h4 className="mb-6 flex items-center gap-2 text-xs font-black uppercase tracking-[0.2em] text-emerald-700">
                  <Zap size={16} aria-hidden="true" /> Realitas Platform (Verified)
                </h4>
                <div className="grid grid-cols-3 gap-4 text-left">
                  <div>
                    <p className="text-[9px] font-black uppercase text-emerald-600">Terdaftar</p>
                    <p className="text-4xl font-black text-slate-900">{platformStats.mahasiswa}</p>
                  </div>
                  <div>
                    <p className="text-[9px] font-black uppercase text-emerald-600">{labelAlumni}</p>
                    <p className="text-4xl font-black text-slate-900">{platformStats.alumni}</p>
                  </div>
                  <div>
                    <p className="text-[9px] font-black uppercase text-emerald-600">Bekerja</p>
                    <p className="text-4xl font-black text-blue-600">{platformStats.bekerja}</p>
                  </div>
                </div>
                
                <div className="mt-8 border-t border-emerald-200 pt-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <p className="text-[10px] font-black uppercase text-emerald-600 mb-3 flex items-center gap-1.5"><User size={12}/> Gender</p>
                      <div className="flex gap-2">
                        <div className="rounded-lg bg-white px-3 py-1.5 border border-emerald-100 text-[10px] font-black">L: {platformStats.male}</div>
                        <div className="rounded-lg bg-white px-3 py-1.5 border border-emerald-100 text-[10px] font-black">P: {platformStats.female}</div>
                      </div>
                    </div>
                    <div>
                      <p className="text-[10px] font-black uppercase text-emerald-600 mb-3 flex items-center gap-1.5"><PieChart size={12}/> Ragam Disabilitas</p>
                      <div className="flex flex-wrap gap-2">
                        {Object.entries(platformStats.disabilityMap).slice(0, 3).map(([type, count]) => (
                          <div key={type} className="rounded-lg bg-white px-3 py-1.5 border border-emerald-100 text-[9px] font-black uppercase">
                            {type}: {count as number}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </section>
            </div>

            {/* VERIFIKASI ALERT BOX */}
            <section className="rounded-[2.5rem] bg-slate-900 p-10 text-white shadow-2xl relative overflow-hidden flex flex-col md:flex-row justify-between items-center gap-8">
              <div className="relative z-10 space-y-2">
                <div className="flex items-center gap-2 text-emerald-400">
                  <AlertCircle size={20} aria-hidden="true" />
                  <p className="text-xs font-black uppercase tracking-widest leading-none">Verifikasi Almamater</p>
                </div>
                <h4 className="text-3xl font-black uppercase italic tracking-tight" aria-live="polite">
                  {unverifiedCount} Mahasiswa Menunggu Antrean
                </h4>
              </div>
              <button 
                onClick={() => navigateTo("tracer", "Talent Tracer")} 
                aria-label={`Buka halaman tracer untuk memproses ${unverifiedCount} antrean`}
                className="relative z-10 bg-emerald-500 hover:bg-white text-slate-900 px-10 py-5 rounded-2xl font-black uppercase italic transition-all active:scale-95 shadow-xl"
              >
                Proses Sekarang <MousePointerClick size={18} className="inline ml-2" aria-hidden="true" />
              </button>
              <School className="absolute -right-10 -bottom-10 opacity-10" size={250} aria-hidden="true" />
            </section>
          </div>
        )}

        {/* MODUL TAB COMPONENTS */}
        <div className="mt-4">
          {activeTab === "hub" && <CareerSkillHub campusName={campus?.name} campusId={user.id} />}
          {activeTab === "tracer" && <TalentTracer campusName={campus?.name} campusId={user.id} onBack={() => navigateTo("overview", "Dashboard")} />}
          {activeTab === "profile" && <ProfileEditor campus={campus} onUpdate={() => { fetchDashboardData(); navigateTo("overview", "Dashboard"); }} onBack={() => navigateTo("overview", "Dashboard")} />}
          {activeTab === "account" && <AccountSettings user={user} onBack={() => navigateTo("overview", "Dashboard")} />}
        </div>
      </main>
    </div>
  );
}