"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import { supabase } from "@/lib/supabase";
import Link from "next/link";
import { 
  Users, BookOpen, BarChart3, Settings, 
  ShieldCheck, LayoutDashboard,
  Activity, Award, Lock, 
  Zap, User, Timer, ExternalLink, GraduationCap,
  UserCheck, Bell, MessageCircle, Share2, ArrowRight
} from "lucide-react";
import { QRCodeSVG } from "qrcode.react";

// Import Modul Pendukung
import ProgramManager from "./partner/program-manager";
import EnrollmentTracker from "./partner/enrollment-tracker";
import TalentTracer from "./partner/talent-tracer";
import ProfileEditor from "./partner/profile-editor";
import AccountSettings from "./partner/account-settings";

// Import Modular Share Helper
import { handlePartnerNativeShare, handlePartnerWhatsAppShare } from "./partner/share-partner-helper";

export default function PartnerDashboard({ user }: { user: any }) {
  const [activeTab, setActiveTab] = useState("overview");
  const [partner, setPartner] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [announcement, setAnnouncement] = useState("");
  const [profileCompletion, setProfileCompletion] = useState(0);
  const [pendingTraineesCount, setPendingTraineesCount] = useState(0);

  const moduleHeadingRef = useRef<HTMLHeadingElement>(null);

  const fetchDashboardData = useCallback(async () => {
    if (!user?.id) return;
    setLoading(true);
    try {
      // 1. Ambil Profil Partner
      const { data: partnerData, error } = await supabase
        .from("partners")
        .select("*")
        .eq("id", user.id)
        .single();
      
      if (error || !partnerData) return;
      setPartner(partnerData);

      // 2. QUICK NOTIF: Hitung pendaftar yang statusnya masih 'pending'
      const { count } = await supabase
        .from("trainees")
        .select("*", { count: "exact", head: true })
        .eq("partner_id", partnerData.id)
        .eq("status", "pending");
      
      setPendingTraineesCount(count || 0);

      // 3. LOGIKA KELENGKAPAN PROFIL (Sesuai Kebutuhan Riset)
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
    setAnnouncement(`Menampilkan modul ${label}`);
    setTimeout(() => {
      if (moduleHeadingRef.current) moduleHeadingRef.current.focus();
      window.scrollTo(0, 0);
    }, 100);
  };

  if (loading) return (
    <div role="status" className="flex min-h-screen items-center justify-center font-black uppercase italic text-slate-400 animate-pulse">
      <Activity className="mr-2 animate-spin" /> Menghubungkan ke Portal Mitra...
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
    <div className="mx-auto max-w-7xl space-y-10 px-4 py-10 text-slate-900 text-left font-sans">
      <div className="sr-only" aria-live="assertive">{announcement}</div>

      {/* HEADER: Desain Bonafit */}
      <header className="flex flex-col items-start justify-between gap-6 border-b-4 border-slate-900 pb-10 md:flex-row md:items-end">
        <div className="space-y-4">
          <div className="flex items-center gap-4">
            <div className="rounded-[1.5rem] bg-blue-600 p-4 text-white shadow-xl border-2 border-slate-900">
              <GraduationCap size={32} />
            </div>
            <div>
              <p className="text-[10px] font-black uppercase tracking-[0.3em] text-blue-600 leading-none mb-1">Impact Ecosystem Partner</p>
              <h1 className="text-4xl font-black uppercase italic tracking-tighter leading-none">{partner?.name}</h1>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <span className="flex items-center gap-1.5 rounded-full border-2 border-emerald-500 bg-emerald-50 px-4 py-1.5 text-[10px] font-black uppercase text-emerald-700">
              <ShieldCheck size={14} /> Inklusi: {partner?.inclusion_score || 0}%
            </span>
            <div className="flex items-center gap-3 rounded-full border-2 border-slate-200 bg-white px-4 py-1.5 shadow-sm">
              <div className="h-2 w-24 overflow-hidden rounded-full bg-slate-100">
                <div className="h-full bg-blue-600 transition-all duration-1000" style={{ width: `${profileCompletion}%` }} />
              </div>
              <span className="text-[10px] font-black uppercase text-slate-500">Profil: {profileCompletion}%</span>
            </div>
          </div>
        </div>
        
        {/* ACTION BUTTONS */}
        <div className="flex flex-wrap gap-2">
            <button 
              onClick={() => handlePartnerNativeShare(partner, currentStats)}
              className="flex items-center gap-2 rounded-xl bg-slate-900 px-6 py-4 text-[10px] font-black uppercase italic text-white shadow-lg transition-all hover:bg-blue-600"
            >
              <Share2 size={16} /> Native Share
            </button>
            <button 
              onClick={() => handlePartnerWhatsAppShare(partner, currentStats)}
              className="flex items-center gap-2 rounded-xl bg-[#25D366] px-6 py-4 text-[10px] font-black uppercase italic text-white shadow-lg transition-all hover:opacity-90"
            >
              <MessageCircle size={16} /> WhatsApp
            </button>
        </div>
      </header>

      {/* NAVIGATION TABS WITH LIVE COUNTER */}
      <nav className="no-scrollbar flex gap-3 overflow-x-auto pb-2" aria-label="Menu Dashboard Mitra">
        {[
          { id: "overview", label: "Overview", icon: LayoutDashboard, count: 0 },
          { id: "programs", label: "Pelatihan", icon: BookOpen, count: 0 },
          { id: "selection", label: "Pendaftar", icon: UserCheck, count: pendingTraineesCount },
          { id: "tracer", label: "Alumni", icon: BarChart3, count: 0 },
          { id: "profile", label: "Edit Profil", icon: Settings, count: 0 },
          { id: "account", label: "Akun", icon: Lock, count: 0 },
        ].map((tab) => (
          <button 
            key={tab.id} 
            onClick={() => navigateTo(tab.id, tab.label)}
            className={`relative flex items-center gap-3 whitespace-nowrap rounded-[1.5rem] px-8 py-5 text-[10px] font-black uppercase transition-all ${
              activeTab === tab.id 
                ? "bg-slate-900 text-white shadow-2xl" 
                : "bg-white border-2 border-slate-100 text-slate-400 hover:border-slate-900"
            }`}
          >
            <tab.icon size={18} /> 
            {tab.label}
            {tab.count > 0 && (
              <span className="absolute -right-1 -top-1 flex h-6 w-6 items-center justify-center rounded-full bg-red-600 text-[10px] text-white animate-bounce border-2 border-white font-bold">
                {tab.count}
              </span>
            )}
          </button>
        ))}
      </nav>

      <main id="main-content">
        {activeTab === "overview" && (
          <div className="space-y-12 animate-in fade-in duration-700">
            <h2 ref={moduleHeadingRef} tabIndex={-1} className="sr-only">Ringkasan Capaian Pelatihan</h2>
            
            {/* IMPACT GRID */}
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
              <div className="rounded-[2.5rem] border-2 border-slate-100 bg-white p-8 shadow-sm">
                <p className="text-[9px] font-black uppercase tracking-widest text-slate-400">Penerima Manfaat</p>
                <p className="mt-2 text-5xl font-black tracking-tighter">{currentStats.total}</p>
              </div>
              <div className="rounded-[2.5rem] border-2 border-slate-100 bg-white p-8 shadow-sm">
                <p className="text-[9px] font-black uppercase tracking-widest text-emerald-600">Lulusan Bekerja</p>
                <p className="mt-2 text-5xl font-black tracking-tighter text-emerald-600">{currentStats.hired}</p>
              </div>
              <div className="rounded-[2.5rem] border-2 border-slate-100 bg-white p-8 shadow-sm">
                <p className="text-[9px] font-black uppercase tracking-widest text-blue-600">Hired Rate</p>
                <p className="mt-2 text-5xl font-black tracking-tighter text-blue-600">{currentStats.rate}%</p>
              </div>
              <div className="group rounded-[2.5rem] bg-blue-600 p-8 text-white shadow-xl">
                <p className="text-[9px] font-black uppercase tracking-widest text-blue-200">Perlu Tindakan</p>
                <p className="mt-2 text-2xl font-black italic tracking-tighter leading-none uppercase">{pendingTraineesCount} Calon Peserta Baru</p>
                <button onClick={() => setActiveTab("selection")} className="mt-4 flex items-center gap-2 text-[10px] font-black uppercase underline hover:text-white transition-all">Review Pendaftaran <ArrowRight size={14}/></button>
              </div>
            </div>

            {/* IMPACT NARRATIVE */}
            <section className="rounded-[3rem] border-2 border-slate-100 bg-slate-50 p-12 italic shadow-inner">
              <Award className="text-blue-600 mb-6" size={24} />
              <div className="max-w-5xl space-y-6 text-2xl font-medium leading-relaxed text-slate-800 md:text-3xl">
                <p>
                  Melalui kolaborasi strategis dengan disabilitas.com, <strong>{partner?.name}</strong> telah berhasil memberdayakan <strong>{currentStats.total} talenta disabilitas</strong> di seluruh Indonesia.
                </p>
                <p>
                  Upaya inklusif ini menghasilkan dampak nyata dengan tingkat serapan kerja alumni mencapai <strong>{currentStats.rate}%</strong>, membuktikan kualitas program yang Anda kelola.
                </p>
              </div>
            </section>
          </div>
        )}

        {/* MODUL SELECTOR */}
        <div className="mt-2">
           {activeTab === "programs" && <ProgramManager partnerId={user.id} onBack={() => navigateTo("overview", "Dashboard")} />}
           {activeTab === "selection" && <EnrollmentTracker partnerId={user.id} onBack={() => navigateTo("overview", "Dashboard")} />}
           {activeTab === "tracer" && <TalentTracer partnerName={partner?.name} partnerId={user.id} onBack={() => navigateTo("overview", "Dashboard")} />}
           {activeTab === "profile" && <ProfileEditor partner={partner} onUpdate={() => { fetchDashboardData(); navigateTo("overview", "Dashboard"); }} onBack={() => navigateTo("overview", "Dashboard")} />}
           {activeTab === "account" && <AccountSettings user={user} onBack={() => navigateTo("overview", "Dashboard")} />}
        </div>
      </main>

      {/* HIDDEN BONAFIDE IMPACT CARD FOR CAPTURE */}
      <div className="pointer-events-none absolute -z-50 overflow-hidden opacity-0" aria-hidden="true">
        <div id="partner-impact-card" className="flex h-[500px] w-[900px] flex-col justify-between border-[24px] border-slate-900 bg-white p-16 font-sans text-slate-900">
          <div className="flex items-center justify-between border-b-8 border-blue-600 pb-10">
            <div className="space-y-1 text-left">
              <h2 className="text-5xl font-black uppercase italic tracking-tighter text-blue-600 leading-none">disabilitas.com</h2>
              <p className="text-xs font-black uppercase tracking-[0.5em] text-slate-400">Official Impact Partner 2026</p>
            </div>
            <div className="rounded-2xl bg-blue-600 px-10 py-5 text-lg font-black uppercase tracking-widest text-white shadow-xl">VERIFIED IMPACT</div>
          </div>
          <div className="flex flex-1 items-center justify-between py-12 text-left">
            <div className="max-w-[60%] space-y-4">
              <p className="text-xs font-black uppercase tracking-widest text-slate-400 italic">Mitra Terakreditasi:</p>
              <h3 className="text-6xl font-black uppercase italic tracking-tighter leading-[0.9] text-slate-900">{partner?.name}</h3>
              <p className="pt-4 text-sm font-bold uppercase leading-relaxed text-slate-500 italic">Aktif membangun masa depan kerja yang inklusif dan setara bagi semua talenta.</p>
            </div>
            <div className="flex flex-col gap-6 text-right">
              <div className="space-y-1"><p className="text-[10px] font-black uppercase text-blue-600">Impact Reach</p><p className="text-6xl font-black italic leading-none">{currentStats.total}<span className="text-xl"> Talents</span></p></div>
              <div className="space-y-1"><p className="text-[10px] font-black uppercase text-emerald-600">Success Rate</p><p className="text-6xl font-black italic leading-none">{currentStats.rate}<span className="text-xl">% Success</span></p></div>
            </div>
          </div>
          <div className="flex items-end justify-between border-t-4 border-slate-100 pt-10 text-left">
            <p className="max-w-[450px] text-[10px] font-bold uppercase leading-tight text-slate-400">Pengakuan resmi atas dedikasi mitra dalam menyediakan akses pengembangan kompetensi talenta disabilitas.</p>
            <div className="flex flex-col items-center gap-3">
              <div className="rounded-2xl border-4 border-slate-900 p-3 bg-white shadow-2xl"><QRCodeSVG value={`https://disabilitas.com/partner/${partner?.id}`} size={100} /></div>
              <p className="text-[8px] font-black uppercase tracking-widest text-blue-600">Scan Profile Validasi</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}