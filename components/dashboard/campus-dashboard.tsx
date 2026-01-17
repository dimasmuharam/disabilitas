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
  Medal, AlertCircle, GraduationCap
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
  
  // STATE DATA REAL PLATFORM (Bukan Agregat)
  const [unverifiedCount, setUnverifiedCount] = useState(0);
  const [platformStats, setPlatformStats] = useState({
    mahasiswa: 0,
    alumni: 0,
    bekerja: 0,
    male: 0,
    female: 0,
    total: 0
  });

  const labelTalent = "Mahasiswa";

  // 1. FUNGSI DATA REAL-TIME DARI TABEL VERIFIKASI & PROFIL
  const fetchRealtimeData = useCallback(async () => {
    if (!user?.id) return;
    
    const currentYear = new Date().getFullYear();

    try {
      // Hitung Antrian Verifikasi
      const { count: pending } = await supabase
        .from("campus_verifications")
        .select("*", { count: 'exact', head: true })
        .eq("campus_id", user.id)
        .eq("status", "pending");
      
      setUnverifiedCount(pending || 0);

      // Hitung Statistik Real Platform dari tabel Profiles (Yang sudah diverifikasi oleh kampus ini)
      // Kita join dengan campus_verifications status 'verified'
      const { data: verifiedTalents } = await supabase
        .from("campus_verifications")
        .select(`
          profile_id,
          profiles (
            gender,
            graduation_date,
            career_status
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

          // Status Mahasiswa vs Alumni (Berdasarkan tahun lulus)
          if (p.graduation_date && p.graduation_date <= currentYear) {
            acc.alumni++;
          } else {
            acc.mahasiswa++;
          }

          // Karir (Bekerja)
          const workingStatus = ['Pegawai Swasta', 'Pegawai BUMN / BUMD', 'ASN (PNS / PPPK)', 'Wiraswasta / Entrepreneur'];
          if (workingStatus.includes(p.career_status)) acc.bekerja++;

          return acc;
        }, { mahasiswa: 0, alumni: 0, bekerja: 0, male: 0, female: 0, total: 0 });

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

    // REALTIME SUBSCRIPTION
    const channel = supabase
      .channel('schema-db-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'campus_verifications', filter: `campus_id=eq.${user.id}` }, () => fetchRealtimeData())
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [user?.id, fetchDashboardData, fetchRealtimeData]);

  // Logika Radar & Badge
  const badgeInfo = useMemo(() => {
    const score = campus?.inclusion_score || 0;
    if (score >= 80) return { label: "Platinum", color: "text-slate-900", bg: "bg-gradient-to-br from-slate-100 to-slate-300", icon: Sparkles };
    if (score >= 60) return { label: "Gold", color: "text-amber-700", bg: "bg-amber-100", icon: Medal };
    return { label: "Silver", color: "text-slate-500", bg: "bg-slate-100", icon: Award };
  }, [campus?.inclusion_score]);

  const radarData = useMemo(() => [
    { subject: 'Fisik', A: campus?.inclusion_score_physical || 0 },
    { subject: 'Digital', A: campus?.inclusion_score_digital || 0 },
    { subject: 'Output', A: campus?.inclusion_score_output || 0 },
  ], [campus]);

  const navigateTo = (tabId: string, label: string) => {
    setActiveTab(tabId);
    setAnnouncement(`Menampilkan ${label}`);
    window.scrollTo(0, 0);
  };

  if (loading) return (
    <div className="flex min-h-screen flex-col items-center justify-center font-black uppercase italic tracking-tighter text-slate-400">
      <Activity className="mb-4 animate-spin text-emerald-500" size={48} />
      Menyinkronkan Data...
    </div>
  );

  return (
    <div className="mx-auto max-w-7xl space-y-10 px-4 py-10 text-slate-900 selection:bg-emerald-100 text-left">
      <div className="sr-only" aria-live="polite">{announcement}</div>

      {/* HEADER */}
      <header className="flex flex-col items-start justify-between gap-6 border-b-4 border-slate-900 pb-10 md:flex-row md:items-end">
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <div className="rounded-xl bg-emerald-600 p-2 text-white shadow-lg"><School size={28} /></div>
            <div>
              <p className="text-[10px] font-black uppercase tracking-[0.3em] text-emerald-600 leading-none">Profil Institusi • {profileCompletion}% Lengkap</p>
              <h1 className="mt-1 text-4xl font-black uppercase italic tracking-tighter leading-none">{campus?.name}</h1>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <div className={`flex items-center gap-2 rounded-full border-2 border-slate-900 ${badgeInfo.bg} px-4 py-1.5 shadow-[4px_4px_0px_0px_rgba(15,23,42,1)]`}>
              <badgeInfo.icon size={16} className={badgeInfo.color} />
              <span className={`text-[10px] font-black uppercase ${badgeInfo.color}`}>Peringkat {badgeInfo.label}</span>
            </div>
          </div>
        </div>
        <div className="flex w-full gap-3 md:w-auto">
          <button onClick={() => navigateTo("tracer", "Talent Tracer")} className="group flex flex-1 items-center justify-center gap-3 rounded-2xl bg-slate-900 px-8 py-5 text-[11px] font-black uppercase italic tracking-widest text-white shadow-xl transition-all hover:bg-emerald-600 md:flex-none">
            <Users size={18} /> Verifikasi Talent
          </button>
        </div>
      </header>

      {activeTab === "overview" && (
        <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
          
          {/* ANALISIS INKLUSI & INSIGHT */}
          <div className="grid grid-cols-1 gap-8 lg:grid-cols-5">
            <section className="rounded-[3rem] border-2 border-slate-100 bg-white p-8 lg:col-span-2">
              <h3 className="mb-6 flex items-center gap-2 text-[11px] font-black uppercase tracking-widest text-slate-900 leading-none">
                <Activity size={16} className="text-emerald-500" /> Keseimbangan Pilar Inklusi
              </h3>
              <div className="h-[220px] w-full" aria-label="Grafik Radar Inklusi">
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
                <Sparkles size={18} /> Narasi Strategis
              </h3>
              <p className="text-2xl font-black italic leading-tight tracking-tighter text-slate-800 md:text-3xl">
                &quot;{campus?.smart_narrative_summary || "Institusi sedang dalam proses pemetaan data."}&quot;
              </p>
            </section>
          </div>

          {/* DUA SUMBER DATA: INPUT USER VS REAL PLATFORM */}
          <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
            
            {/* 1. DATA INPUT UNIVERSITAS (Manual Agregat) */}
            <section className="rounded-[2.5rem] border-2 border-slate-100 bg-white p-10">
              <h4 className="mb-6 flex items-center gap-2 text-xs font-black uppercase tracking-[0.2em] text-slate-400">
                <Settings size={16} /> Estimasi Internal (Input Kampus)
              </h4>
              <div className="grid grid-cols-2 gap-8">
                <div>
                  <p className="text-[10px] font-black uppercase text-slate-400">Total Mahasiswa Disabilitas</p>
                  <p className="text-5xl font-black tracking-tighter text-slate-900 leading-tight">{campus?.stats_academic_total || 0}</p>
                </div>
                <div>
                  <p className="text-[10px] font-black uppercase text-slate-400">Estimasi Sudah Bekerja</p>
                  <p className="text-5xl font-black tracking-tighter text-emerald-600 leading-tight">{campus?.stats_academic_hired || 0}</p>
                </div>
              </div>
              <p className="mt-6 text-[9px] font-bold italic text-slate-400">*Data ini berdasarkan input manual universitas pada tabel agregat.</p>
            </section>

            {/* 2. DATA REAL PLATFORM (Real-time dari Akun Mahasiswa) */}
            <section className="rounded-[2.5rem] border-4 border-emerald-600 bg-emerald-50 p-10 shadow-[8px_8px_0px_0px_rgba(16,185,129,1)]">
              <h4 className="mb-6 flex items-center gap-2 text-xs font-black uppercase tracking-[0.2em] text-emerald-700">
                <Zap size={16} /> Aktivitas Real Platform (Verified)
              </h4>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <p className="text-[9px] font-black uppercase text-emerald-600">Mahasiswa Aktif</p>
                  <p className="text-4xl font-black tracking-tighter text-slate-900">{platformStats.mahasiswa}</p>
                </div>
                <div>
                  <p className="text-[9px] font-black uppercase text-emerald-600">Alumni Terdata</p>
                  <p className="text-4xl font-black tracking-tighter text-slate-900">{platformStats.alumni}</p>
                </div>
                <div>
                  <p className="text-[9px] font-black uppercase text-emerald-600">Terpantau Bekerja</p>
                  <p className="text-4xl font-black tracking-tighter text-blue-600">{platformStats.bekerja}</p>
                </div>
              </div>
              
              {/* REAL-TIME GENDER PROPORTION */}
              <div className="mt-8 border-t border-emerald-200 pt-6">
                <p className="text-[10px] font-black uppercase text-emerald-600 mb-3">Proporsi Gender (Real Platform)</p>
                <div className="flex gap-4">
                  <div className="flex items-center gap-2 rounded-xl bg-white px-4 py-2 border-2 border-emerald-100">
                    <User size={14} className="text-blue-500" />
                    <span className="text-xs font-black">{platformStats.male} Pria</span>
                  </div>
                  <div className="flex items-center gap-2 rounded-xl bg-white px-4 py-2 border-2 border-emerald-100">
                    <User size={14} className="text-pink-500" />
                    <span className="text-xs font-black">{platformStats.female} Wanita</span>
                  </div>
                </div>
              </div>
            </section>
          </div>

          {/* ANTRIAN VERIFIKASI (ALERT BOX) */}
          <section className="rounded-[2.5rem] bg-slate-900 p-10 text-white shadow-2xl relative overflow-hidden">
            <div className="relative z-10 flex flex-col md:flex-row justify-between items-center gap-8">
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-emerald-400">
                  <AlertCircle size={20} />
                  <p className="text-xs font-black uppercase tracking-widest">Konfirmasi Afiliasi</p>
                </div>
                <h4 className="text-3xl font-black uppercase italic tracking-tight" aria-live="polite">
                  {unverifiedCount} Mahasiswa Menunggu Verifikasi Almamater
                </h4>
              </div>
              <button onClick={() => navigateTo("tracer", "Talent Tracer")} className="bg-emerald-500 hover:bg-white text-slate-900 px-10 py-5 rounded-2xl font-black uppercase italic transition-all active:scale-95 whitespace-nowrap shadow-xl">
                Buka Tracer <MousePointerClick size={18} className="inline ml-2" />
              </button>
            </div>
            <School className="absolute -right-10 -bottom-10 opacity-10" size={250} />
          </section>

        </div>
      )}

      {/* TABS HANDLER */}
      <div className="mt-4">
        {activeTab === "hub" && <CareerSkillHub campusName={campus?.name} campusId={user.id} />}
        {activeTab === "tracer" && <TalentTracer campusName={campus?.name} campusId={user.id} onBack={() => navigateTo("overview", "Dashboard")} />}
        {activeTab === "profile" && <ProfileEditor campus={campus} onUpdate={() => { fetchDashboardData(); navigateTo("overview", "Dashboard"); }} onBack={() => navigateTo("overview", "Dashboard")} />}
        {activeTab === "account" && <AccountSettings user={user} onBack={() => navigateTo("overview", "Dashboard")} />}
      </div>
    </div>
  );
}