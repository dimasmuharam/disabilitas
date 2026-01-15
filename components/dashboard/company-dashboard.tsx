"use client";

import React, { useState, useEffect, useRef, useMemo } from "react";
import { supabase } from "@/lib/supabase";
import { 
  Building2, Briefcase, Users, Star, TrendingUp, AlertCircle, CheckCircle2, 
  LayoutDashboard, FileText, Settings, Search, ShieldCheck, MapPin, Zap, 
  ExternalLink, Share2, PieChart, GraduationCap, ArrowRight, Accessibility
} from "lucide-react";
import { QRCodeSVG } from "qrcode.react";

// Modul Anak
import ProfileEditor from "./company/profile-editor";
import JobManager from "./company/job-manager";
import ApplicantTracker from "./company/applicant-tracker";
import RecruitmentSimulator from "./company/recruitment-simulator";
import AccountSettings from "./company/account-settings";

// Helper & Actions
import { handleShareInclusionCard } from "./company/share-helper";
import { getCompanyStats } from "@/lib/actions/company";
import { getCompanyRatingAggregate } from "@/lib/actions/ratings";

export default function CompanyDashboard({ user, company: initialCompany }: { user: any, company: any }) {
  const [activeTab, setActiveTab] = useState("overview");
  const [company, setCompany] = useState(initialCompany);
  const [stats, setStats] = useState({ jobCount: 0, applicantCount: 0, pendingAction: 0 });
  const [ratings, setRatings] = useState<any>(null);
  const [trendingSkills, setTrendingSkills] = useState<{skill: string, count: number}[]>([]);
  const [loading, setLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const [announcement, setAnnouncement] = useState("");
  
  const cardRef = useRef<HTMLDivElement>(null);
  const headerRef = useRef<HTMLHeadingElement>(null);

  useEffect(() => {
    if (user?.id) fetchDashboardData();
  }, [user?.id]);

  async function fetchDashboardData() {
    setLoading(true);
    try {
      // 1. Ambil Profil & Data Agregat Baru (Sync dengan Trigger SQL)
      const { data: latestComp } = await supabase.from("companies").select("*").eq("id", user.id).single();
      if (latestComp) setCompany(latestComp);

      // 2. Ambil Statistik Operasional & Ratings
      const [statsData, ratingData, { count: pendingCount }] = await Promise.all([
        getCompanyStats(user.id),
        getCompanyRatingAggregate(user.id),
        supabase.from("applications").select("*", { count: 'exact', head: true }).eq("company_id", user.id).eq("status", "applied")
      ]);
      
      setStats({ ...statsData, pendingAction: pendingCount || 0 });
      setRatings(ratingData);

      // 3. Trending Skills Berbasis Lokasi (Filter Kota)
      const { data: talentSkills } = await supabase.from("profiles").select("skills").eq("city", latestComp?.location).limit(50);
      const finalSkills = talentSkills?.length && talentSkills.length > 3 ? talentSkills : (await supabase.from("profiles").select("skills").limit(50)).data;

      if (finalSkills) {
        const counts: Record<string, number> = {};
        finalSkills.forEach(t => t.skills?.forEach((s: string) => counts[s] = (counts[s] || 0) + 1));
        setTrendingSkills(Object.entries(counts).map(([skill, count]) => ({ skill, count })).sort((a,b) => b.count - a.count).slice(0, 3));
      }
    } catch (err) {
      console.error("Dashboard Sync Error:", err);
    } finally { setLoading(false); }
  }

  // --- LOGIKA 1: KELENGKAPAN PROFIL (RISET) ---
  const completionData = useMemo(() => {
    const checklist = [
      { key: 'name', weight: 20 }, { key: 'industry', weight: 15 },
      { key: 'category', weight: 15 }, { key: 'location', weight: 15 },
      { key: 'description', weight: 15 }, { key: 'master_accommodations_provided', weight: 20 }
    ];
    let score = 0;
    checklist.forEach(item => {
      const val = company?.[item.key];
      if (val && (Array.isArray(val) ? val.length > 0 : val.trim() !== "")) score += item.weight;
    });
    return score;
  }, [company]);

  // --- LOGIKA 2: KUOTA INKLUSI 1% (REGULASI) ---
  const inclusionQuota = useMemo(() => {
    const total = company?.total_employees || 0;
    const dis = company?.total_employees_with_disability || 0;
    const mandateMin = Math.ceil(total * 0.01);
    return { 
      percent: total > 0 ? ((dis / total) * 100).toFixed(1) : "0.0", 
      need: mandateMin > dis ? mandateMin - dis : 0,
      isCompliant: dis >= mandateMin && total > 0
    };
  }, [company]);

  const handleTabChange = (id: string) => {
    setActiveTab(id);
    setAnnouncement(`Membuka modul ${id}`);
    if (headerRef.current) headerRef.current.focus();
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const renderOverview = () => (
    <div className="space-y-8 animate-in fade-in duration-500 text-left">
      
      {/* SECTION 1: KELENGKAPAN & SKOR AKSESIBILITAS */}
      <div className="grid gap-6 md:grid-cols-2">
        <section className="rounded-[2.5rem] border-2 border-amber-100 bg-amber-50 p-8 shadow-sm">
          <div className="flex items-center gap-6">
            <div className="relative size-20 flex items-center justify-center rounded-full bg-white border-4 border-amber-200 text-xl font-black text-amber-600 italic">
              {completionData}%
            </div>
            <div>
              <h3 className="text-[10px] font-black uppercase tracking-widest text-amber-900">Kelengkapan Profil Riset</h3>
              <p className="text-[9px] font-bold uppercase text-amber-700/60 leading-tight">Data instansi memengaruhi validasi riset nasional.</p>
              {completionData < 100 && (
                <button onClick={() => setActiveTab("profile")} className="mt-2 text-[9px] font-black uppercase text-amber-700 underline decoration-2 underline-offset-4">Lengkapi Sekarang</button>
              )}
            </div>
          </div>
        </section>

        <section className="rounded-[2.5rem] border-2 border-blue-100 bg-blue-50 p-8 shadow-sm">
          <div className="flex items-center gap-6">
            <div className="p-5 bg-white rounded-3xl text-blue-600 border-2 border-blue-100 shadow-inner"><Accessibility size={32} /></div>
            <div>
              <h3 className="text-[10px] font-black uppercase tracking-widest text-blue-900">Inclusion Score</h3>
              <p className="text-4xl font-black text-blue-600 italic leading-none mt-1">{company?.inclusion_score || 0}<span className="text-sm text-blue-300">/100</span></p>
              <p className="text-[8px] font-bold uppercase text-blue-400 mt-1">Berdasarkan penilaian audit sistem</p>
            </div>
          </div>
        </section>
      </div>

      {/* SECTION 2: ACTIONABLE PENDING APPLICATIONS */}
      {stats.pendingAction > 0 && (
        <button 
          onClick={() => handleTabChange("applicants")} 
          className="w-full group flex items-center justify-between rounded-[2.5rem] border-2 border-blue-600 bg-blue-50 p-8 shadow-md hover:bg-blue-100 transition-all"
          aria-label={`${stats.pendingAction} lamaran baru menunggu. Klik untuk proses.`}
        >
          <div className="flex items-center gap-6">
            <div className="size-16 flex items-center justify-center rounded-2xl bg-blue-600 text-white shadow-lg"><AlertCircle size={32} /></div>
            <div>
              <h2 className="text-xl font-black uppercase italic text-blue-900 tracking-tighter">Ada {stats.pendingAction} Lamaran Menunggu</h2>
              <p className="text-[10px] font-bold uppercase text-blue-700/60 tracking-widest">Segera review talenta baru di modul Applicants</p>
            </div>
          </div>
          <ArrowRight className="text-blue-600 group-hover:translate-x-2 transition-transform" />
        </button>
      )}

      {/* SECTION 3: AGREGAT AFILIASI (DATA RISET BARU) & KUOTA 1% */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {/* Total & Gender */}
        <section className="rounded-[2.5rem] border-2 border-slate-900 bg-slate-900 p-8 text-white shadow-xl">
          <h3 className="text-[9px] font-black uppercase tracking-widest text-blue-400 opacity-60">Afiliasi Talenta</h3>
          <p className="text-5xl font-black italic tracking-tighter leading-none mt-2">{company?.total_employees_with_disability || 0}</p>
          <div className="mt-4 flex gap-4 text-[9px] font-black uppercase text-blue-400">
            <span className="flex items-center gap-1"><Zap size={10} fill="currentColor"/> M: {company?.stats_talent_gender_map?.male || 0}</span>
            <span className="flex items-center gap-1"><Zap size={10} fill="currentColor"/> F: {company?.stats_talent_gender_map?.female || 0}</span>
          </div>
        </section>

        {/* Status Kuota 1% */}
        <section className={`rounded-[2.5rem] border-2 p-8 shadow-sm ${inclusionQuota.isCompliant ? 'border-emerald-100 bg-emerald-50' : 'border-amber-100 bg-amber-50'}`}>
          <div className="flex justify-between items-start">
            <h3 className={`text-[9px] font-black uppercase tracking-widest ${inclusionQuota.isCompliant ? 'text-emerald-600' : 'text-amber-600'}`}>Status Kuota 1%</h3>
            {inclusionQuota.isCompliant ? <CheckCircle2 size={16} className="text-emerald-600" /> : <AlertCircle size={16} className="text-amber-600" />}
          </div>
          <p className="text-4xl font-black text-slate-900 mt-1 italic">{inclusionQuota.percent}%</p>
          <div className="mt-3">
            {inclusionQuota.need > 0 ? (
              <p className="text-[9px] font-bold uppercase text-amber-700 leading-tight">Butuh <span className="text-sm font-black underline">{inclusionQuota.need}</span> talenta lagi.</p>
            ) : (
              <p className="text-[9px] font-bold uppercase text-emerald-700 leading-tight italic">Kuota Terpenuhi.</p>
            )}
          </div>
        </section>

        {/* Ragam Disabilitas */}
        <section className="rounded-[2.5rem] border-2 border-slate-100 bg-white p-6 shadow-sm overflow-hidden">
          <h3 className="text-[9px] font-black uppercase tracking-widest text-blue-600 mb-4 flex items-center gap-2"><PieChart size={14}/> Ragam</h3>
          <div className="space-y-1 max-h-[85px] overflow-y-auto pr-2 custom-scrollbar">
            {Object.entries(company?.stats_talent_disability_map || {}).map(([k, v]: any) => (
              <div key={k} className="flex justify-between text-[10px] font-bold border-b border-slate-50 py-1 uppercase"><span className="text-slate-400">{k}</span><span className="text-slate-900">{v}</span></div>
            ))}
          </div>
        </section>

        {/* Rating Index */}
        <section className="rounded-[2.5rem] border-2 border-slate-900 bg-white p-6 shadow-[6px_6px_0px_0px_rgba(15,23,42,1)] text-center flex flex-col justify-center">
          <h3 className="text-[9px] font-black uppercase text-slate-400">Inclusion Index</h3>
          <p className="text-5xl font-black text-slate-900 mt-1">{ratings?.totalAvg?.toFixed(1) || "0.0"}</p>
          <div className="mt-2 flex justify-center gap-1">{[1,2,3,4,5].map(s => <Star key={s} size={12} className={ratings?.totalAvg >= s ? "fill-amber-400 text-amber-400" : "text-slate-100"} />)}</div>
        </section>
      </div>

      {/* SECTION 4: TRENDING SKILLS */}
      <section className="rounded-[3rem] border-2 border-slate-100 bg-white p-10 shadow-sm">
        <div className="mb-8 flex items-center gap-4">
          <div className="rounded-2xl bg-amber-50 p-3 text-amber-500"><Zap size={24} /></div>
          <div>
            <h3 className="text-xl font-black uppercase italic tracking-tighter">Trending Skills di {company?.location || 'Sekitar Anda'}</h3>
            <p className="text-[9px] font-bold uppercase text-slate-400 tracking-[0.2em]">Keahlian talenta disabilitas yang paling banyak tersedia saat ini</p>
          </div>
        </div>
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
          {trendingSkills.map((s, i) => (
            <div key={i} className="rounded-3xl bg-slate-50 p-8 text-center border-2 border-transparent hover:border-blue-600 hover:bg-white transition-all group">
              <p className="mb-1 text-[10px] font-black uppercase text-slate-400 group-hover:text-blue-600">{s.skill}</p>
              <p className="text-4xl font-black text-slate-900">{s.count}</p>
              <p className="text-[8px] font-bold uppercase text-slate-300">Talenta Tersedia</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );

  if (loading) return <div role="status" className="p-40 text-center font-black animate-pulse text-slate-400 uppercase italic tracking-widest">Sinkronisasi Pusat Riset Instansi...</div>;

  return (
    <div className="min-h-screen bg-[#FDFDFD] pb-24 text-slate-900">
      <div className="mx-auto max-w-7xl space-y-8 px-4 pt-8">
        <div className="sr-only" aria-live="polite" role="status">{announcement}</div>

        {/* Header Dashboard */}
        <header className="flex flex-col items-center justify-between gap-10 rounded-[3.5rem] border-2 border-slate-900 bg-white p-10 shadow-[12px_12px_0px_0px_rgba(15,23,42,1)] lg:flex-row">
          <div className="flex items-center gap-8 text-left">
            <div className="flex size-24 shrink-0 items-center justify-center rounded-[2rem] bg-slate-900 text-white shadow-2xl"><Building2 size={48} /></div>
            <div>
              <div className="flex items-center gap-3">
                <h1 ref={headerRef} tabIndex={-1} className="text-3xl font-black uppercase italic tracking-tighter focus:outline-none">{company?.name || "Instansi"}</h1>
                {company?.is_verified && <CheckCircle2 className="text-blue-600" size={24} />}
              </div>
              <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-blue-600 mt-1">{company?.industry} | {company?.location}</p>
            </div>
          </div>
          <nav className="flex flex-wrap justify-center gap-2 rounded-[2.5rem] bg-slate-50 p-2 shadow-inner border-2 border-slate-100" aria-label="Menu Utama">
            {[
              { id: "overview", label: "Overview", icon: LayoutDashboard },
              { id: "applicants", label: "Applicants", icon: Users },
              { id: "jobs", label: "Jobs", icon: FileText },
              { id: "simulator", label: "Simulator", icon: Search },
              { id: "profile", label: "Profile", icon: Settings },
              { id: "settings", label: "Account", icon: ShieldCheck },
            ].map(tab => (
              <button key={tab.id} onClick={() => handleTabChange(tab.id)} aria-current={activeTab === tab.id ? "page" : undefined}
                className={`flex items-center gap-3 rounded-2xl px-6 py-4 text-[10px] font-black uppercase transition-all ${activeTab === tab.id ? 'bg-slate-900 text-white shadow-xl scale-105' : 'text-slate-400 hover:bg-white'}`}>
                <tab.icon size={16} /> {tab.label}
                {tab.id === "applicants" && stats.pendingAction > 0 && <span className="ml-2 flex size-5 items-center justify-center rounded-full bg-blue-600 text-[8px] text-white animate-pulse">{stats.pendingAction}</span>}
              </button>
            ))}
          </nav>
        </header>

        {/* Main Area */}
        <main id="main-content" className="min-h-[60vh]">
          {activeTab === "overview" && renderOverview()}
          {activeTab === "applicants" && <ApplicantTracker company={company} />}
          {activeTab === "jobs" && <JobManager company={company} onSuccess={fetchDashboardData} />}
          {activeTab === "simulator" && <RecruitmentSimulator company={company} />}
          {activeTab === "profile" && <ProfileEditor company={company} user={user} onSuccess={fetchDashboardData} />}
          {activeTab === "settings" && <AccountSettings user={user} onSuccess={fetchDashboardData} />}
        </main>

        {/* Floating Share Button */}
        {activeTab === "overview" && (
          <div className="fixed bottom-10 right-10 z-50">
            <button onClick={() => handleShareInclusionCard(cardRef, company, ratings, setIsProcessing, setAnnouncement)} disabled={isProcessing}
              className="group flex items-center gap-4 rounded-full bg-emerald-600 p-2 pr-8 text-white shadow-2xl hover:bg-slate-900 transition-all active:scale-95 disabled:opacity-50">
              <div className="size-14 flex items-center justify-center rounded-full bg-white text-emerald-600 shadow-inner group-hover:text-slate-900"><Share2 size={24} /></div>
              <div className="text-left"><p className="text-[10px] font-black uppercase leading-none">Share Card</p><p className="text-[8px] font-bold uppercase opacity-60">Inclusion Identity</p></div>
            </button>
          </div>
        )}
      </div>

      {/* Hidden Capture Area for Share Card */}
      <div className="pointer-events-none fixed left-[-9999px] top-[-9999px] opacity-0" aria-hidden="true">
        <div ref={cardRef} className="flex h-[450px] w-[800px] flex-col justify-between border-[16px] border-slate-900 bg-white p-12 text-left font-sans">
            <div className="flex items-center justify-between border-b-4 border-blue-600 pb-6">
              <h2 className="text-3xl font-black uppercase italic text-blue-600 tracking-tighter leading-none">disabilitas.com</h2>
              <span className="rounded-full bg-emerald-500 px-5 py-2 text-[10px] font-black uppercase text-white shadow-lg">Verified Partner</span>
            </div>
            <div className="flex flex-1 items-center gap-10 py-10">
              <div className="flex size-32 shrink-0 items-center justify-center rounded-[2rem] bg-slate-900 text-5xl font-black italic text-white shadow-2xl">{company?.name?.charAt(0)}</div>
              <div className="space-y-2 text-left">
                <p className="text-4xl font-black uppercase italic tracking-tighter text-slate-900 leading-none">{company?.name}</p>
                <p className="text-lg font-bold uppercase tracking-widest text-blue-600 leading-none">{company?.industry}</p>
                <div className="mt-6 flex gap-10 text-left">
                  <div><p className="text-[10px] font-black uppercase text-slate-400">Inclusion Index</p><p className="text-3xl font-black">{ratings?.totalAvg?.toFixed(1) || "0.0"}</p></div>
                  <div><p className="text-[10px] font-black uppercase text-slate-400">Affiliation</p><p className="text-3xl font-black">{company?.total_employees_with_disability || 0}</p></div>
                </div>
              </div>
            </div>
            <div className="flex items-center justify-between border-t-2 border-slate-100 pt-6">
              <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Inclusion Card — 2026</p>
              <div className="rounded-2xl border-4 border-slate-900 bg-white p-1 shadow-lg"><QRCodeSVG value={`https://disabilitas.com/perusahaan/${company?.id}`} size={60} /></div>
            </div>
        </div>
      </div>
    </div>
  );
}