"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import { supabase } from "@/lib/supabase";
import { 
  Users, BookOpen, BarChart3, Settings, 
  ShieldCheck, LayoutDashboard,
  Activity, Award, Lock, 
  Zap, User, Timer, ExternalLink, GraduationCap,
  UserCheck 
} from "lucide-react";

// Import Modul Pendukung
import ProgramManager from "./partner/program-manager";
import EnrollmentTracker from "./partner/enrollment-tracker";
import TalentTracer from "./partner/talent-tracer";
import ProfileEditor from "./partner/profile-editor";
import AccountSettings from "./partner/account-settings";
import InclusionCard from "./partner/inclusion-card"; // Modul Kartu Viral

export default function PartnerDashboard({ user }: { user: any }) {
  const [activeTab, setActiveTab] = useState("overview");
  const [partner, setPartner] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [announcement, setAnnouncement] = useState("");
  const [profileCompletion, setProfileCompletion] = useState(0);

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
      console.error("Dashboard Fetch Error:", e); 
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

  const navigateTo = (tabId: string, label: string) => {
    setActiveTab(tabId);
    setAnnouncement(`Menampilkan halaman ${label}`);
    setTimeout(() => {
      if (moduleHeadingRef.current) moduleHeadingRef.current.focus();
      window.scrollTo(0, 0);
    }, 100);
  };

  if (loading) return (
    <div role="status" className="flex min-h-screen items-center justify-center font-black uppercase italic text-slate-400 animate-pulse">
      <Activity className="mr-2 animate-spin" /> Sinkronisasi Data Portal...
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
      <div className="sr-only" aria-live="assertive">{announcement}</div>

      {/* HEADER */}
      <header className="flex flex-col items-start justify-between gap-6 border-b-4 border-slate-900 pb-10 md:flex-row md:items-end">
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <div className="rounded-xl bg-blue-600 p-2 text-white shadow-lg">
              <GraduationCap size={28} />
            </div>
            <div>
              <p className="text-[10px] font-black uppercase tracking-[0.3em] text-blue-600 leading-none">Mitra Portal Pengembangan Talenta</p>
              <h1 className="mt-1 text-4xl font-black uppercase italic tracking-tighter leading-none">{partner?.name}</h1>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <span className="flex items-center gap-1.5 rounded-full border-2 border-emerald-500 bg-emerald-50 px-4 py-1.5 text-[10px] font-black uppercase text-emerald-700">
              <ShieldCheck size={14} /> Skor Inklusi: {partner?.inclusion_score || 0}%
            </span>
            <a href={`/partner/${partner?.id}`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 rounded-full border-2 border-slate-200 bg-white px-4 py-1.5 text-[10px] font-black uppercase text-slate-600 hover:border-slate-900 transition-all">
              <ExternalLink size={14} /> Lihat Profil Publik
            </a>
          </div>
        </div>
        
        {/* MODUL KARTU VIRAL SEBAGAI PENGGANTI TOMBOL SHARE BIASA */}
        <div className="w-full md:w-auto">
          <InclusionCard partner={partner} stats={currentStats} />
        </div>
      </header>

      {/* NAV TABS */}
      <nav className="no-scrollbar flex gap-2 overflow-x-auto" aria-label="Menu Utama Dashboard">
        {[
          { id: "overview", label: "Dashboard", icon: LayoutDashboard },
          { id: "programs", label: "Pelatihan", icon: BookOpen },
          { id: "selection", label: "Seleksi Peserta", icon: UserCheck },
          { id: "tracer", label: "Lacak Alumni", icon: BarChart3 },
          { id: "profile", label: "Profil Mitra", icon: Settings },
          { id: "account", label: "Akun", icon: Lock },
        ].map((tab) => (
          <button 
            key={tab.id} 
            onClick={() => navigateTo(tab.id, tab.label)}
            aria-current={activeTab === tab.id ? "page" : undefined}
            className={`flex items-center gap-3 whitespace-nowrap rounded-2xl px-6 py-4 text-[10px] font-black uppercase transition-all ${activeTab === tab.id ? "bg-slate-900 text-white shadow-xl" : "bg-white border-2 border-slate-100 text-slate-400 hover:border-slate-900"}`}
          >
            <tab.icon size={16} aria-hidden="true" /> {tab.label}
          </button>
        ))}
      </nav>

      <main id="main-content" className="min-h-[600px] outline-none">
        {activeTab === "overview" && (
          <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <h2 ref={moduleHeadingRef} tabIndex={-1} className="sr-only">Ringkasan Performa Mitra</h2>
            
            {/* STATS CARD */}
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
                <p className="text-[9px] font-black italic uppercase tracking-widest text-blue-500">Success Rate</p>
                <p className="mt-1 text-5xl font-black tracking-tighter text-blue-600">{currentStats.rate}%</p>
              </div>
              <div className="rounded-[2.5rem] bg-slate-900 p-8 text-white shadow-2xl flex flex-col justify-center">
                <p className="text-[9px] font-black uppercase tracking-widest opacity-60 italic text-left text-blue-400 leading-none">Impact Statistics</p>
                <p className="text-3xl font-black italic tracking-tighter uppercase leading-tight mt-1">Capaian Mitra</p>
              </div>
            </div>

            {/* NARASI DAMPAK */}
            <section className="rounded-[3rem] border-2 border-slate-100 bg-slate-50 p-10 italic shadow-inner">
              <h3 className="mb-6 flex items-center gap-2 text-[11px] font-black uppercase tracking-widest text-blue-600">
                <Award size={16} /> Narasi Capaian Pelatihan
              </h3>
              <div className="max-w-5xl space-y-6 text-xl font-medium leading-relaxed text-slate-800 md:text-2xl">
                <p>
                  Melalui kolaborasi di platform ini, <strong>{partner?.name}</strong> telah berhasil meningkatkan kapabilitas <strong>{currentStats.total} talenta disabilitas</strong>. 
                  Mayoritas peserta berasal dari ragam <strong>{Object.entries(disMap).sort((a: any, b: any) => b[1] - a[1])[0]?.[0] || "Data..."}</strong>.
                </p>
                <p>
                  Hingga periode saat ini, program Anda telah mencatatkan tingkat keterserapan kerja sebesar <strong>{currentStats.rate}%</strong> dari seluruh alumni.
                </p>
              </div>
            </section>

            {/* DEMOGRAFI & GENDER */}
            <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
              <div className="lg:col-span-2 grid grid-cols-1 gap-6 md:grid-cols-2 text-left">
                <div className="rounded-[2.5rem] border-2 border-slate-50 bg-white p-8 shadow-sm">
                  <h4 className="mb-6 flex items-center gap-2 text-[11px] font-black uppercase tracking-widest text-slate-900">
                    <Users className="text-purple-600" size={16} /> Peserta Per Ragam
                  </h4>
                  <div className="space-y-4">
                    {Object.entries(disMap).length > 0 ? Object.entries(disMap).map(([type, count]: [string, any]) => (
                      <div key={type} className="space-y-1">
                        <div className="flex justify-between text-[9px] font-black uppercase text-slate-500">
                          <span>{type}</span><span>{count} Orang</span>
                        </div>
                        <div className="h-2 overflow-hidden rounded-full bg-slate-100">
                          <div className="h-full bg-purple-600 transition-all duration-1000" style={{ width: `${(count / (currentStats.total || 1)) * 100}%` }} />
                        </div>
                      </div>
                    )) : <p className="text-[10px] font-bold text-slate-300 uppercase italic">Menunggu pendaftaran pertama...</p>}
                  </div>
                </div>

                <div className="rounded-[2.5rem] border-2 border-slate-50 bg-white p-8 shadow-sm">
                  <h4 className="mb-6 flex items-center gap-2 text-[11px] font-black uppercase tracking-widest text-slate-900">
                    <User className="text-blue-500" size={16} /> Distribusi Peserta
                  </h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="rounded-2xl bg-slate-50 p-4 border-l-4 border-blue-500">
                      <p className="text-[8px] font-black uppercase text-slate-400">Laki-laki</p>
                      <p className="mt-1 text-2xl font-black">{genMap.male || 0}</p>
                    </div>
                    <div className="rounded-2xl bg-slate-50 p-4 border-l-4 border-pink-500">
                      <p className="text-[8px] font-black uppercase text-slate-400">Perempuan</p>
                      <p className="mt-1 text-2xl font-black">{genMap.female || 0}</p>
                    </div>
                  </div>
                  <div className="mt-8 rounded-2xl bg-blue-50 p-5 border-2 border-blue-100 text-left">
                    <h4 className="mb-1 flex items-center gap-2 text-[10px] font-black uppercase text-blue-800 leading-none">
                      <Timer size={14} /> Sinkronisasi Aktif
                    </h4>
                    <p className="text-[9px] font-bold italic text-blue-600 leading-tight">Data disesuaikan secara otomatis saat Anda melakukan seleksi dan pembaruan tracer.</p>
                  </div>
                </div>
              </div>

              <div className="rounded-[2.5rem] bg-blue-600 p-10 text-white shadow-2xl flex flex-col justify-between text-left">
                <div>
                  <Zap className="mb-6 text-blue-200" size={32} />
                  <p className="text-[10px] font-black uppercase tracking-widest opacity-70 italic leading-none">Visi Kesetaraan</p>
                  <p className="mt-4 text-3xl font-black italic tracking-tighter uppercase leading-tight">Mencetak Lulusan Siap Kerja & Inklusif</p>
                </div>
                <div className="mt-8 border-t border-white/10 pt-4">
                   <p className="text-[9px] font-bold uppercase opacity-60">Certified Partner 2026</p>
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="mt-2 text-left">
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
               <h2 ref={moduleHeadingRef} tabIndex={-1} className="sr-only">Halaman Tracer Alumni</h2>
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
