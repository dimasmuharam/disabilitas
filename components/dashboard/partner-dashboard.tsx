"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import { supabase } from "@/lib/supabase";
import { 
  Users, BookOpen, BarChart3, Settings, 
  ShieldCheck, Share2, LayoutDashboard,
  Activity, Award, Lock, 
  Zap, User, Timer, ExternalLink, GraduationCap,
  UserCheck 
} from "lucide-react";

import ProgramManager from "./partner/program-manager";
import EnrollmentTracker from "./partner/enrollment-tracker";
import TalentTracer from "./partner/talent-tracer";
import ProfileEditor from "./partner/profile-editor";
import AccountSettings from "./partner/account-settings";

export default function PartnerDashboard({ user }: { user: any }) {
  const [activeTab, setActiveTab] = useState("overview");
  const [partner, setPartner] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [announcement, setAnnouncement] = useState("");
  const [profileCompletion, setProfileCompletion] = useState(0);

  // Ref untuk mengarahkan fokus kursor ke judul modul saat tab berpindah
  const moduleHeadingRef = useRef<HTMLHeadingElement>(null);

  const labelTalent = "Peserta Pelatihan";

  const fetchDashboardData = useCallback(async () => {
    if (!user?.id) return;
    setLoading(true);
    try {
      const { data: partnerData, error } = await supabase
        .from("partners")
        .select("*")
        .eq("id", user.id)
        .single();
      
      if (error || !partnerData) return;
      setPartner(partnerData);

      const fields = ["name", "description", "location", "website", "nib_number"];
      const filled = fields.filter(f => partnerData[f] && partnerData[f].length > 0).length;
      const acc = (partnerData.master_accommodations_provided?.length || 0) > 0 ? 1 : 0;
      setProfileCompletion(Math.round(((filled + acc) / (fields.length + 1)) * 100));

    } catch (e) { 
      console.error("Partner Dashboard Error:", e); 
    } finally { 
      setLoading(false); 
    }
  }, [user?.id]);

  useEffect(() => { 
    fetchDashboardData(); 
    const link = document.querySelector("link[rel='canonical']") || document.createElement("link");
    link.setAttribute("rel", "canonical");
    link.setAttribute("href", "https://disabilitas.com/dashboard/partner");
    if (!document.head.contains(link)) document.head.appendChild(link);
  }, [fetchDashboardData]);

  // Fungsi navigasi cerdas yang memindahkan fokus kursor
  const navigateTo = (tabId: string, label: string) => {
    setActiveTab(tabId);
    setAnnouncement(`Menampilkan halaman **${label}**`);
    
    // Memberikan jeda sedikit agar DOM sempat berganti, lalu arahkan fokus kursor
    setTimeout(() => {
      if (moduleHeadingRef.current) {
        moduleHeadingRef.current.focus();
      }
      window.scrollTo(0, 0);
    }, 100);
  };

  const shareInclusionCard = () => {
    const caption = `[IMPACT REPORT] ${partner?.name} telah melatih ${partner?.stats_impact_total || 0} talenta disabilitas.`;
    if (navigator.share) {
      navigator.share({ title: partner?.name, text: caption, url: `https://disabilitas.com/partner/${partner?.id}` });
    } else {
      navigator.clipboard.writeText(caption);
      alert("Teks berhasil disalin ke clipboard!");
    }
  };

  if (loading) return (
    <div role="status" className="flex min-h-screen items-center justify-center font-black uppercase italic tracking-tighter text-slate-400 animate-pulse">
      <Activity className="mr-2 animate-spin" /> Sinkronisasi Data Riset...
    </div>
  );

  const currentStats = {
    total: Number(partner?.stats_impact_total || 0),
    hired: Number(partner?.stats_impact_hired || 0),
    rate: Number(partner?.stats_impact_total || 0) > 0 
      ? Math.round((Number(partner?.stats_impact_hired || 0) / Number(partner?.stats_impact_total || 0)) * 100) 
      : 0
  };

  const disMap = partner?.stats_disability_map || {};
  const genMap = partner?.stats_gender_map || { male: 0, female: 0 };

  return (
    <div className="mx-auto max-w-7xl space-y-10 px-4 py-10 text-slate-900 text-left">
      {/* Pengumuman tersembunyi untuk screen reader */}
      <div className="sr-only" aria-live="assertive">{announcement}</div>

      {/* HEADER UTAMA */}
      <header className="flex flex-col items-start justify-between gap-6 border-b-4 border-slate-900 pb-10 md:flex-row md:items-end">
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <div className="rounded-xl bg-blue-600 p-2 text-white shadow-lg shadow-blue-100">
              <GraduationCap size={28} />
            </div>
            <div>
              <p className="text-[10px] font-black uppercase tracking-[0.3em] text-blue-600 leading-none">Mitra Pelatihan Portal</p>
              <h1 className="mt-1 text-4xl font-black uppercase italic tracking-tighter leading-none">{partner?.name}</h1>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <span className="flex items-center gap-1.5 rounded-full border-2 border-emerald-500 bg-emerald-50 px-4 py-1.5 text-[10px] font-black uppercase text-emerald-700">
              <ShieldCheck size={14} /> Skor Inklusi: {partner?.inclusion_score || 0}%
            </span>
            <div className="flex items-center gap-3 rounded-full border-2 border-slate-200 bg-white px-4 py-1.5 shadow-sm">
              <div className="h-2 w-24 overflow-hidden rounded-full bg-slate-100">
                <div className="h-full bg-blue-600 transition-all duration-1000" style={{ width: `${profileCompletion}%` }} />
              </div>
              <span className="text-[10px] font-black uppercase text-slate-500 tracking-tighter">Profil: {profileCompletion}%</span>
            </div>
          </div>
        </div>
        <div className="flex gap-3 w-full md:w-auto">
          <button onClick={() => navigateTo("programs", "Manajemen Kursus")} className="flex-1 md:flex-none rounded-2xl bg-slate-900 px-8 py-5 text-[11px] font-black uppercase italic text-white shadow-xl hover:bg-blue-600 transition-all tracking-widest">
            Tambah Pelatihan
          </button>
        </div>
      </header>

      {/* NAVIGASI TAB */}
      <nav className="no-scrollbar flex gap-2 overflow-x-auto" aria-label="Menu Utama Dashboard">
        {[
          { id: "overview", label: "Dashboard", icon: LayoutDashboard },
          { id: "programs", label: "Manajemen Kursus", icon: BookOpen },
          { id: "selection", label: "Seleksi Pendaftar", icon: UserCheck },
          { id: "tracer", label: "Tracer Impact", icon: BarChart3 },
          { id: "profile", label: "Profil Mitra", icon: Settings },
          { id: "account", label: "Keamanan Akun", icon: Lock },
        ].map((tab) => (
          <button 
            key={tab.id} 
            onClick={() => navigateTo(tab.id, tab.label)}
            aria-current={activeTab === tab.id ? "page" : undefined}
            className={`flex items-center gap-3 whitespace-nowrap rounded-2xl px-6 py-4 text-[10px] font-black uppercase transition-all ${activeTab === tab.id ? "bg-slate-900 text-white shadow-xl -translate-y-1" : "bg-white border-2 border-slate-100 text-slate-400 hover:border-slate-900 hover:text-slate-900"}`}
          >
            <tab.icon size={16} aria-hidden="true" /> {tab.label}
          </button>
        ))}
      </nav>

      <main id="main-content" className="min-h-[600px] outline-none">
        {/* TAB OVERVIEW: STATS & ANALYTICS */}
        {activeTab === "overview" && (
          <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <h2 ref={moduleHeadingRef} tabIndex={-1} className="sr-only">Dashboard Ringkasan</h2>
            
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
              <div className="rounded-[2.5rem] border-2 border-slate-100 bg-white p-8 shadow-sm">
                <p className="text-[9px] font-black uppercase tracking-widest text-slate-400">Total {labelTalent}</p>
                <p className="mt-1 text-5xl font-black tracking-tighter">{currentStats.total}</p>
              </div>
              <div className="rounded-[2.5rem] border-2 border-slate-100 bg-white p-8 shadow-sm">
                <p className="text-[9px] font-black italic uppercase tracking-widest text-emerald-500">Penempatan Kerja</p>
                <p className="mt-1 text-5xl font-black tracking-tighter text-emerald-600">{currentStats.hired}</p>
              </div>
              <div className="rounded-[2.5rem] border-2 border-slate-100 bg-white p-8 shadow-sm">
                <p className="text-[9px] font-black italic uppercase tracking-widest text-blue-500">Impact Rate</p>
                <p className="mt-1 text-5xl font-black tracking-tighter text-blue-600">{currentStats.rate}%</p>
              </div>
              <div className="rounded-[2.5rem] bg-slate-900 p-8 text-white shadow-2xl flex flex-col justify-center">
                <p className="text-[9px] font-black uppercase tracking-widest opacity-60 italic">Social ROI</p>
                <p className="text-3xl font-black italic tracking-tighter uppercase leading-tight mt-1">Partner Impact</p>
              </div>
            </div>

            <section className="rounded-[3rem] border-2 border-slate-100 bg-slate-50 p-10 italic shadow-inner">
              <h3 className="mb-6 flex items-center gap-2 text-[11px] font-black uppercase tracking-widest text-blue-600">
                <Award size={16} /> Narasi Dampak Pelatihan
              </h3>
              <div className="max-w-5xl space-y-6 text-xl font-medium leading-relaxed text-slate-800 md:text-2xl">
                <p>
                  Melalui kolaborasi riset, **{partner?.name}** telah berkontribusi meningkatkan kapabilitas **{currentStats.total} talenta disabilitas**. 
                  Peserta terbanyak berasal dari ragam **{Object.entries(disMap).sort((a: any, b: any) => b[1] - a[1])[0]?.[0] || "Data..."}**.
                </p>
                <p>
                  Hingga periode 2026, efektivitas pelatihan menghasilkan keterserapan kerja sebesar **{currentStats.rate}%**.
                </p>
              </div>
            </section>
          </div>
        )}

        {/* TAB RENDERER LAINNYA */}
        <div className="mt-2">
           {activeTab === "programs" && (
             <div className="outline-none">
               <h2 ref={moduleHeadingRef} tabIndex={-1} className="sr-only">Halaman Manajemen Kursus</h2>
               <ProgramManager partnerId={user.id} onBack={() => navigateTo("overview", "Dashboard")} />
             </div>
           )}
           
           {activeTab === "selection" && (
             <div className="outline-none">
               <h2 ref={moduleHeadingRef} tabIndex={-1} className="sr-only">Halaman Seleksi Pendaftar</h2>
               <EnrollmentTracker partnerId={user.id} onBack={() => navigateTo("overview", "Dashboard")} />
             </div>
           )}

           {activeTab === "tracer" && (
             <div className="outline-none">
               <h2 ref={moduleHeadingRef} tabIndex={-1} className="sr-only">Halaman Tracer Impact</h2>
               <TalentTracer partnerName={partner?.name} partnerId={user.id} onBack={() => navigateTo("overview", "Dashboard")} />
             </div>
           )}

           {activeTab === "profile" && (
             <div className="outline-none">
               <h2 ref={moduleHeadingRef} tabIndex={-1} className="sr-only">Halaman Profil Mitra</h2>
               <ProfileEditor partner={partner} onUpdate={() => { fetchDashboardData(); navigateTo("overview", "Dashboard"); }} onBack={() => navigateTo("overview", "Dashboard")} />
             </div>
           )}

           {activeTab === "account" && (
             <div className="outline-none">
               <h2 ref={moduleHeadingRef} tabIndex={-1} className="sr-only">Halaman Keamanan Akun</h2>
               <AccountSettings user={user} onBack={() => navigateTo("overview", "Dashboard")} />
             </div>
           )}
        </div>
      </main>
    </div>
  );
}
