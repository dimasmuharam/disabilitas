"use client";

import React, { useState, useEffect, useRef, useMemo, useCallback } from "react";
import { supabase } from "@/lib/supabase";
import Link from "next/link";
import { 
  Building2, Briefcase, Users, Star, TrendingUp, AlertCircle, CheckCircle2, 
  LayoutDashboard, FileText, Settings, Search, ShieldCheck, MapPin, Zap, 
  ExternalLink, Share2, PieChart, GraduationCap, ArrowRight, Accessibility,
  MessageCircle, Loader2
} from "lucide-react";
import { QRCodeSVG } from "qrcode.react";

// Modul Anak
import ProfileEditor from "./company/profile-editor";
import JobManager from "./company/job-manager";
import ApplicantTracker from "./company/applicant-tracker";
import RecruitmentSimulator from "./company/recruitment-simulator";
import AccountSettings from "./company/account-settings";

// Helper
import { handleShareInclusionCard } from "./company/share-helper";
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

  // REFACTOR: Panggil data statistik langsung tanpa lib/actions/company.ts
  const fetchDashboardData = useCallback(async () => {
    try {
      // 1. Ambil Profil Perusahaan Terbaru
      const { data: latestComp } = await supabase.from("companies").select("*").eq("id", user.id).single();
      if (latestComp) setCompany(latestComp);

      // 2. Ambil Statistik Loker & Pelamar Secara Langsung
      const [jobsRes, appsRes, ratingData] = await Promise.all([
        supabase.from("jobs").select("*", { count: "exact", head: true }).eq("company_id", user.id),
        supabase.from("applications").select("*", { count: 'exact' }).eq("company_id", user.id),
        getCompanyRatingAggregate(user.id)
      ]);
      
      // Hitung tindakan yang tertunda (status applied)
      const pendingCount = (appsRes.data as any[])?.filter(a => a.status === 'applied').length || 0;
      
      setStats({ 
        jobCount: jobsRes.count || 0, 
        applicantCount: appsRes.count || 0, 
        pendingAction: pendingCount 
      });
      setRatings(ratingData);

      // 3. Ambil Trending Skills (Data Riset Lokal)
      const city = latestComp?.location || "Jakarta";
      const { data: talentSkills } = await supabase.from("profiles").select("skills").eq("city", city).limit(50);
      const finalSkills = talentSkills?.length && talentSkills.length > 3 ? talentSkills : (await supabase.from("profiles").select("skills").limit(50)).data;

      if (finalSkills) {
        const counts: Record<string, number> = {};
        finalSkills.forEach(t => t.skills?.forEach((s: string) => counts[s] = (counts[s] || 0) + 1));
        setTrendingSkills(Object.entries(counts).map(([skill, count]) => ({ skill, count })).sort((a,b) => b.count - a.count).slice(0, 3));
      }
    } catch (err) {
      console.error("Dashboard Sync Error:", err);
    } finally { 
      setLoading(false); 
    }
  }, [user.id]);

  useEffect(() => {
    if (user?.id) fetchDashboardData();
  }, [user?.id, fetchDashboardData]);

  const inclusionQuota = useMemo(() => {
    const total = company?.total_employees || 0;
    const dis = company?.total_employees_with_disability || 0;
    const category = company?.category?.toLowerCase();
    
    const mandateRate = (category?.includes('pemerintah') || category?.includes('bumn')) ? 0.02 : 0.01;
    const mandateMin = Math.ceil(total * mandateRate);
    const currentPercent = total > 0 ? (dis / total) * 100 : 0;
    
    return { 
      percent: currentPercent.toFixed(1), 
      need: mandateMin > dis ? mandateMin - dis : 0,
      isCompliant: dis >= mandateMin && total > 0,
      mandateRate: mandateRate * 100
    };
  }, [company]);

  const handleTabChange = (id: string) => {
    setActiveTab(id);
    setAnnouncement(`Membuka modul ${id}`);
    if (headerRef.current) headerRef.current.focus();
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const renderOverview = () => (
    <div className="space-y-8 text-left duration-500 animate-in fade-in">
      <div className="grid gap-6 md:grid-cols-2">
        {stats.pendingAction > 0 ? (
          <button onClick={() => handleTabChange("applicants")} className="group flex items-center justify-between rounded-[2.5rem] border-2 border-blue-600 bg-blue-50 p-8 shadow-md transition-all hover:bg-blue-100">
            <div className="flex items-center gap-6 text-left">
              <div className="flex size-16 animate-bounce items-center justify-center rounded-2xl bg-blue-600 text-white shadow-lg"><AlertCircle size={32} /></div>
              <div>
                <h2 className="text-xl font-black uppercase italic leading-none tracking-tighter text-blue-900">Review Talenta Baru</h2>
                <p className="mt-2 text-[10px] font-bold uppercase text-blue-700/60">Ada {stats.pendingAction} lamaran menunggu tindakan</p>
              </div>
            </div>
            <ArrowRight className="text-blue-600 transition-transform group-hover:translate-x-2" />
          </button>
        ) : (
          <section className="rounded-[2.5rem] border-2 border-slate-100 bg-white p-8 shadow-sm">
            <div className="flex items-center gap-6">
              <div className="flex size-16 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600"><CheckCircle2 size={32} /></div>
              <div className="text-left">
                <h2 className="text-xl font-black uppercase italic leading-none tracking-tighter text-slate-900">Semua Terkendali</h2>
                <p className="mt-2 text-[10px] font-bold uppercase text-slate-400">Belum ada lamaran baru saat ini</p>
              </div>
            </div>
          </section>
        )}

        <section className="rounded-[2.5rem] border-2 border-blue-100 bg-blue-50 p-8 shadow-sm">
          <div className="flex items-center gap-6 text-left">
            <div className="rounded-3xl border-2 border-blue-100 bg-white p-5 text-blue-600"><Accessibility size={32} /></div>
            <div>
              <h3 className="text-[10px] font-black uppercase tracking-widest text-blue-900">Inclusion Index</h3>
              <p className="mt-1 text-4xl font-black italic leading-none text-blue-600">{ratings?.totalAvg?.toFixed(1) || "0.0"}<span className="text-sm text-blue-300">/5.0</span></p>
              <p className="mt-1 text-[8px] font-bold uppercase italic text-blue-400">Berdasarkan feedback nyata talenta</p>
            </div>
          </div>
        </section>
      </div>

      {/* Quota Compliance */}
      <section className={`rounded-[3rem] border-2 p-10 shadow-sm ${inclusionQuota.isCompliant ? 'border-emerald-100 bg-emerald-50/50' : 'border-amber-100 bg-amber-50/50'}`}>
        <div className="flex flex-col items-center justify-between gap-8 text-left md:flex-row">
          <div className="flex-1 space-y-3">
            <h3 className={`text-[10px] font-black uppercase tracking-[0.2em] ${inclusionQuota.isCompliant ? 'text-emerald-700' : 'text-amber-700'}`}>
              <ShieldCheck className="mr-2 inline" size={16}/> Status Kepatuhan Tenaga Kerja Inklusif
            </h3>
            {inclusionQuota.isCompliant ? (
              <h4 className="text-2xl font-black italic leading-tight tracking-tighter text-slate-900">
                Instansi Anda telah memenuhi ambang batas minimal {inclusionQuota.mandateRate}% karyawan disabilitas. 
                <span className="mt-2 block text-[11px] font-bold uppercase tracking-widest text-emerald-600">Mari terus dorong inklusivitas tanpa batas!</span>
              </h4>
            ) : (
              <h4 className="text-2xl font-black italic leading-tight tracking-tighter text-slate-900">
                Anda memerlukan <span className="text-amber-600 underline">{inclusionQuota.need} talenta disabilitas</span> lagi untuk mencapai kuota minimal {inclusionQuota.mandateRate}%.
              </h4>
            )}
          </div>
          <div className="flex size-28 shrink-0 flex-col items-center justify-center rounded-full border-8 border-slate-900 bg-white shadow-xl">
            <p className="text-2xl font-black italic">{inclusionQuota.percent}%</p>
            <p className="text-[8px] font-black uppercase opacity-40">Capaian</p>
          </div>
        </div>
      </section>

      {/* Impact Statistics */}
      <div className="grid gap-8 lg:grid-cols-3">
        <section className="relative overflow-hidden rounded-[3rem] bg-slate-900 p-10 text-left text-white shadow-2xl lg:col-span-2">
          <div className="relative z-10">
            <h3 className="mb-8 flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-blue-400">
              <Users size={16}/> Jejak Dampak Inklusi
            </h3>
            <h2 className="mb-12 max-w-2xl text-4xl font-black uppercase italic leading-none tracking-tighter">
              Sebanyak <span className="text-blue-500">{company?.total_employees_with_disability || 0} Talenta</span> mendedikasikan karirnya di {company?.name}.
            </h2>
            
            <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
              <div className="rounded-[2.5rem] border border-white/10 bg-white/5 p-6">
                <p className="mb-6 text-[9px] font-black uppercase tracking-widest text-slate-400">Komposisi Gender</p>
                <div className="space-y-4">
                  <div className="flex justify-between text-[11px] font-black uppercase"><span>Laki-Laki</span><span className="text-blue-400">{company?.stats_talent_gender_map?.male || 0}</span></div>
                  <div className="flex justify-between text-[11px] font-black uppercase"><span>Perempuan</span><span className="text-blue-400">{company?.stats_talent_gender_map?.female || 0}</span></div>
                </div>
              </div>
              <div className="rounded-[2.5rem] border border-white/10 bg-white/5 p-6">
                <p className="mb-6 text-[9px] font-black uppercase tracking-widest text-slate-400">Ragam Disabilitas</p>
                <div className="custom-scrollbar max-h-[80px] space-y-2 overflow-y-auto text-[9px] font-black uppercase">
                  {Object.entries(company?.stats_talent_disability_map || {}).map(([k, v]: any) => (
                    <div key={k} className="flex justify-between border-b border-white/5 pb-1"><span>{k}</span><span className="text-blue-400">{v}</span></div>
                  ))}
                </div>
              </div>
              <div className="rounded-[2.5rem] border border-white/10 bg-white/5 p-6">
                <p className="mb-6 text-[9px] font-black uppercase tracking-widest text-slate-400">Latar Pendidikan</p>
                <div className="custom-scrollbar max-h-[80px] space-y-2 overflow-y-auto text-[9px] font-black uppercase">
                  {Object.entries(company?.stats_talent_education_map || {}).map(([k, v]: any) => (
                    <div key={k} className="flex justify-between border-b border-white/5 pb-1"><span>{k}</span><span className="text-blue-400">{v}</span></div>
                  ))}
                </div>
              </div>
            </div>
          </div>
          <TrendingUp className="absolute -bottom-10 -right-10 size-64 rotate-12 text-white/5" />
        </section>

        <section className="flex flex-col justify-between rounded-[3rem] border-2 border-slate-900 bg-white p-10 text-center shadow-[10px_10px_0px_0px_rgba(15,23,42,1)]">
          <div>
            <p className="mb-6 text-[10px] font-black uppercase tracking-widest text-slate-400">Profil Publik Instansi</p>
            <div className="mx-auto flex justify-center rounded-[2.5rem] border-2 border-slate-100 bg-slate-50 p-6 shadow-inner">
              <QRCodeSVG value={`https://disabilitas.com/perusahaan/${company?.id}`} size={100} />
            </div>
          </div>
          <Link href={`/perusahaan/${company?.id}`} target="_blank" className="mt-8 flex items-center justify-center gap-3 rounded-2xl border-2 border-slate-900 py-4 text-[9px] font-black uppercase shadow-md transition-all hover:bg-slate-900 hover:text-white">
            <ExternalLink size={16} /> Halaman Publik
          </Link>
        </section>
      </div>
    </div>
  );

  if (loading) return <div role="status" className="animate-pulse p-40 text-center font-black uppercase italic tracking-widest text-slate-400">Sinkronisasi Portal Perusahaan...</div>;

  return (
    <div className="min-h-screen bg-[#FDFDFD] pb-32 text-slate-900">
      <div className="mx-auto max-w-7xl space-y-8 px-4 pt-8">
        <div className="sr-only" aria-live="polite">{announcement}</div>
        
        <header className="flex flex-col items-center justify-between gap-10 rounded-[3.5rem] border-2 border-slate-900 bg-white p-10 shadow-[12px_12px_0px_0px_rgba(15,23,42,1)] lg:flex-row">
          <div className="flex items-center gap-8 text-left">
            <div className="relative flex size-24 shrink-0 items-center justify-center rounded-[2.2rem] bg-slate-900 text-white shadow-2xl">
              <Building2 size={48} />
              <div className="absolute -bottom-2 -right-2 flex size-10 items-center justify-center rounded-full border-4 border-white bg-blue-600 text-[10px] font-black italic">HQ</div>
            </div>
            <div>
              <div className="flex items-center gap-4">
                <h1 ref={headerRef} tabIndex={-1} className="text-4xl font-black uppercase italic leading-none tracking-tighter focus:outline-none">{company?.name || "Dashboard"}</h1>
                {company?.is_verified && <CheckCircle2 className="text-blue-600" size={28} />}
              </div>
              <p className="mt-2 text-[10px] font-bold uppercase tracking-[0.3em] text-blue-600">{company?.industry} | {company?.location}</p>
            </div>
          </div>

          {/* Navigasi hanya muncul jika verified */}
          {company?.is_verified && (
            <nav className="flex flex-wrap justify-center gap-2 rounded-[2.5rem] border-2 border-slate-100 bg-slate-50 p-2 shadow-inner">
              {[
                { id: "overview", label: "Overview", icon: LayoutDashboard },
                { id: "applicants", label: "Applicants", icon: Users },
                { id: "jobs", label: "Jobs", icon: FileText },
                { id: "simulator", label: "Simulator", icon: Search },
                { id: "profile", label: "Profile", icon: Settings },
                { id: "settings", label: "Account", icon: ShieldCheck },
              ].map(tab => (
                <button key={tab.id} onClick={() => handleTabChange(tab.id)} className={`flex items-center gap-3 rounded-2xl px-6 py-4 text-[10px] font-black uppercase transition-all ${activeTab === tab.id ? 'scale-105 bg-slate-900 text-white shadow-xl' : 'text-slate-400 hover:bg-white'}`}>
                  <tab.icon size={16} /> {tab.label}
                </button>
              ))}
            </nav>
          )}
        </header>

        <main id="main-content" className="min-h-[60vh]">
          {!company?.is_verified ? (
            <div className="space-y-8 animate-in fade-in duration-500">
              <div className="rounded-3xl border-2 border-amber-500 bg-amber-50 p-8 text-amber-900 font-bold text-xs uppercase italic flex items-center gap-4 shadow-sm">
                <div className="p-3 bg-amber-500 text-white rounded-2xl shadow-lg"><AlertCircle size={24} /></div>
                <div>
                  <p>Akun Anda memerlukan verifikasi dokumen.</p>
                  <p className="text-[10px] opacity-70">Lengkapi profil dan tautan Google Drive untuk membuka akses dashboard penuh.</p>
                </div>
              </div>
              
              <ProfileEditor 
                company={company} 
                user={user} 
                onSuccess={() => {
                  fetchDashboardData();
                  setAnnouncement("Profil diperbarui, menunggu verifikasi admin.");
                }} 
              />
            </div>
          ) : (
            <>
              {activeTab === "overview" && renderOverview()}
              {activeTab === "applicants" && <ApplicantTracker company={company} />}
              {activeTab === "jobs" && <JobManager company={company} onSuccess={fetchDashboardData} />}
              {activeTab === "simulator" && <RecruitmentSimulator company={company} />}
              {activeTab === "profile" && (
                <ProfileEditor 
                  company={company} 
                  user={user} 
                  onSuccess={() => {
                    fetchDashboardData();
                    setActiveTab("overview");
                  }} 
                />
              )}
              {activeTab === "settings" && <AccountSettings user={user} onSuccess={fetchDashboardData} />}
            </>
          )}
        </main>

        {activeTab === "overview" && company?.is_verified && (
          <div className="fixed bottom-10 right-10 z-50 flex flex-col gap-3">
            <button 
              onClick={() => handleShareInclusionCard(cardRef, company, ratings, setIsProcessing, setAnnouncement, "native")} 
              disabled={isProcessing}
              className="group flex items-center gap-4 rounded-full bg-slate-900 p-2 pr-8 text-white shadow-2xl transition-all hover:bg-blue-600 active:scale-95 disabled:opacity-50"
            >
              <div className="flex size-14 items-center justify-center rounded-full bg-white text-slate-900 shadow-inner group-hover:text-blue-600"><Share2 size={24} /></div>
              <div className="text-left"><p className="text-[10px] font-black uppercase leading-none">Share Card</p><p className="text-[8px] font-bold uppercase opacity-60">Social Media</p></div>
            </button>
          </div>
        )}
      </div>

      {/* Identity Card Container (Hidden) */}
      <div className="pointer-events-none fixed left-[-9999px] top-[-9999px] opacity-0" aria-hidden="true">
        <div ref={cardRef} className="flex h-[450px] w-[800px] flex-col justify-between border-[16px] border-slate-900 bg-white p-12 text-left">
            <div className="flex items-center justify-between border-b-4 border-blue-600 pb-6">
              <h2 className="text-3xl font-black uppercase italic text-blue-600">disabilitas.com</h2>
              <span className="rounded-full bg-emerald-500 px-5 py-2 text-[10px] font-black uppercase text-white">Verified Inclusion Partner</span>
            </div>
            <div className="flex flex-1 items-center gap-10 py-10">
              <div className="flex size-32 shrink-0 items-center justify-center rounded-[2.5rem] bg-slate-900 text-5xl font-black italic text-white shadow-2xl">{company?.name?.charAt(0)}</div>
              <div className="space-y-3">
                <p className="text-4xl font-black uppercase italic tracking-tighter text-slate-900">{company?.name}</p>
                <p className="text-xl font-bold uppercase tracking-widest text-blue-600">{company?.industry}</p>
                <div className="mt-6 flex gap-10 border-t-2 border-slate-50 pt-4">
                  <div><p className="text-[10px] font-black uppercase text-slate-400">Inclusion Index</p><p className="text-3xl font-black">{ratings?.totalAvg?.toFixed(1) || "0.0"}</p></div>
                  <div><p className="text-[10px] font-black uppercase text-slate-400">Impact Affiliation</p><p className="text-3xl font-black">{company?.total_employees_with_disability || 0}</p></div>
                </div>
              </div>
            </div>
            <div className="flex items-center justify-between border-t-2 border-slate-100 pt-6">
              <p className="text-[10px] font-black uppercase italic tracking-widest text-slate-400">Official Inclusion Identity Card — © 2026</p>
              <div className="rounded-2xl border-4 border-slate-900 bg-white p-1 shadow-lg"><QRCodeSVG value={`https://disabilitas.com/perusahaan/${company?.id}`} size={60} /></div>
            </div>
        </div>
      </div>
    </div>
  );
}