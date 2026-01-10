"use client";

import React, { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { 
  GraduationCap, Users, BookOpen, 
  BarChart3, Settings, ShieldCheck, 
  Share2, AlertCircle, Plus, LayoutDashboard,
  ArrowLeft, Activity, Award, Lock, ExternalLink
} from "lucide-react";

// Import Modul Pendukung (Akan dibuat dalam file terpisah agar rapi)
import ProgramManager from "./campus/program-manager";
import EnrollmentTracker from "./campus/enrollment-tracker";
import TalentTracer from "./campus/talent-tracer";
import ProfileEditor from "./campus/profile-editor";
import AccountSettings from "./campus/account-settings";

export default function CampusDashboard({ session }: { session: any }) {
  const [activeTab, setActiveTab] = useState("overview");
  const [partner, setPartner] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [announcement, setAnnouncement] = useState("");
  const [stats, setStats] = useState({
    totalAlumni: 0,
    hiredAlumni: 0,
    activeStudents: 0,
    employabilityRate: 0,
    totalPrograms: 0
  });

  useEffect(() => {
    if (session?.user?.id) {
      fetchDashboardData();
    }
  }, [session?.user?.id]);

  async function fetchDashboardData() {
    setLoading(true);
    try {
      // 1. Ambil Data Partner (Termasuk inclusion_score dari trigger DB)
      const { data: partnerData } = await supabase
        .from("partners")
        .select("*")
        .eq("id", session.user.id)
        .single();
      setPartner(partnerData);

      // 2. Hitung Statistik Program (Trainings)
      const { count: progCount } = await supabase
        .from("trainings")
        .select("*", { count: 'exact', head: true })
        .eq("partner_id", session.user.id);

      // 3. Logika Tracing Talenta (Multi-Entitas: Nama Kampus + Sertifikasi)
      // Mencari talenta yang menyebut nama kampus ATAU pernah ikut pelatihan partner ini
      const { data: certs } = await supabase
        .from("certifications")
        .select("profile_id")
        .eq("organizer_name", partnerData?.name);
      
      const certProfileIds = Array.from(new Set(certs?.map(c => c.profile_id) || []));

      // Query Gabungan untuk Tracing Alumni & Mahasiswa Aktif
      const { data: talenta } = await supabase
        .from("profiles")
        .select("id, career_status, graduation_date")
        .or(`university.ilike.%${partnerData?.name}%,id.in.(${certProfileIds.length > 0 ? certProfileIds.join(',') : '"00000000-0000-0000-0000-000000000000"'}),admin_partner_lock.eq.${session.user.id}`);

      if (talenta) {
        const currentYear = new Date().getFullYear();
        const employed = talenta.filter(t => 
          !["Job Seeker", "Belum Bekerja", "Pelajar / Mahasiswa"].includes(t.career_status)
        ).length;
        const students = talenta.filter(t => (t.graduation_date || 0) > currentYear).length;

        setStats({
          totalAlumni: talenta.length,
          hiredAlumni: employed,
          activeStudents: students,
          employabilityRate: talenta.length > 0 ? Math.round((employed / talenta.length) * 100) : 0,
          totalPrograms: progCount || 0
        });
      }
    } catch (e) {
      console.error("Gagal sinkronisasi data dashboard:", e);
    } finally {
      setLoading(false);
    }
  }

  // Fungsi navigasi yang aman & mengumumkan perubahan ke Screen Reader
  const navigateTo = (tabId: string, label: string) => {
    setActiveTab(tabId);
    setAnnouncement(`Menampilkan halaman ${label}`);
    window.scrollTo(0, 0);
  };

  if (loading) return (
    <div role="status" className="p-20 text-center font-black animate-pulse text-slate-400 uppercase italic">
      Sinkronisasi Database Riset...
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto px-4 py-10 space-y-10">
      {/* Pengumuman Tersembunyi untuk Aksesibilitas */}
      <div className="sr-only" aria-live="polite">{announcement}</div>

      {/* --- HEADER --- */}
      <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
        <div className="space-y-2 text-left">
          <div className="flex items-center gap-3">
            <div className="bg-slate-900 p-2 rounded-xl text-white">
              <GraduationCap size={24} aria-hidden="true" />
            </div>
            <p className="text-[10px] font-black uppercase tracking-[0.3em] text-blue-600">Partner Dashboard</p>
          </div>
          <h1 className="text-4xl font-black italic tracking-tighter text-slate-900 uppercase leading-none">
            {partner?.name || "Institusi Partner"}
          </h1>
          <div className="flex flex-wrap items-center gap-3 mt-4">
            <span className="flex items-center gap-1.5 bg-emerald-50 text-emerald-700 px-4 py-1.5 rounded-full text-[10px] font-black uppercase border border-emerald-100 shadow-sm">
              <ShieldCheck size={14} /> Skor Inklusi: {partner?.inclusion_score || 0}%
            </span>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest italic border-l-2 border-slate-200 pl-3">
              Kategori: {partner?.category || 'Umum'}
            </span>
          </div>
        </div>

        <div className="flex gap-3">
          <button 
            onClick={() => navigateTo("programs", "Buat Program")}
            className="flex items-center gap-3 bg-blue-600 text-white px-8 py-4 rounded-[2rem] hover:bg-slate-900 transition-all font-black uppercase text-[10px] italic shadow-xl shadow-blue-100"
          >
            <Plus size={18} /> Buat Program Baru
          </button>
          <button 
            className="p-4 bg-white text-slate-900 border-2 border-slate-100 rounded-full hover:border-slate-900 transition-all shadow-sm group"
            title="Bagikan Inclusion Card"
          >
            <Share2 size={20} className="group-hover:rotate-12 transition-transform" />
          </button>
        </div>
      </header>
      {/* --- NAVIGATION TABS --- */}
      <nav className="flex flex-wrap gap-2 border-b-2 border-slate-100 pb-4 no-scrollbar overflow-x-auto" role="tablist">
        {[
          { id: "overview", label: "Dashboard", icon: LayoutDashboard },
          { id: "programs", label: "Kelola Program", icon: BookOpen },
          { id: "enrollment", label: "Pendaftar", icon: Users },
          { id: "tracer", label: "Tracing & Verifikasi", icon: BarChart3 },
          { id: "profile", label: "Profil Inklusi", icon: Settings },
          { id: "account", label: "Manajemen Akun", icon: Lock },
        ].map((tab) => (
          <button
            key={tab.id}
            role="tab"
            aria-selected={activeTab === tab.id}
            onClick={() => navigateTo(tab.id, tab.label)}
            className={`px-8 py-4 rounded-2xl text-[10px] font-black uppercase transition-all flex items-center gap-3 whitespace-nowrap ${
              activeTab === tab.id 
                ? "bg-slate-900 text-white shadow-lg scale-105" 
                : "bg-slate-50 text-slate-400 hover:bg-slate-100"
            }`}
          >
            <tab.icon size={16} aria-hidden="true" /> {tab.label}
          </button>
        ))}
      </nav>

      {/* --- CONTENT AREA --- */}
      <main className="min-h-[500px]">
        {/* Tombol Back Kondisional untuk Aksesibilitas */}
        {activeTab !== "overview" && (
          <button 
            onClick={() => navigateTo("overview", "Dashboard Overview")}
            className="mb-8 flex items-center gap-2 text-[10px] font-black uppercase text-slate-400 hover:text-slate-900 transition-colors italic group"
          >
            <ArrowLeft size={14} className="group-hover:-translate-x-1 transition-transform" /> 
            Kembali ke Overview Dashboard
          </button>
        )}

        {/* 1. MODUL OVERVIEW (DATA RISET) */}
        {activeTab === "overview" && (
          <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Visual Stats Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6" role="region" aria-label="Statistik Cepat">
              <div className="bg-white p-8 rounded-[3rem] border-2 border-slate-100 shadow-sm">
                <p className="text-[9px] font-black uppercase text-slate-400 mb-1 tracking-widest">Total Talenta Terpeta</p>
                <p className="text-5xl font-black text-slate-900 tracking-tighter leading-none">{stats.totalAlumni}</p>
              </div>
              <div className="bg-white p-8 rounded-[3rem] border-2 border-slate-100 shadow-sm border-b-emerald-200">
                <p className="text-[9px] font-black uppercase text-slate-400 mb-1 tracking-widest italic text-emerald-500">Terserap Kerja</p>
                <p className="text-5xl font-black text-emerald-600 tracking-tighter leading-none">{stats.hiredAlumni}</p>
              </div>
              <div className="bg-white p-8 rounded-[3rem] border-2 border-slate-100 shadow-sm border-b-blue-200">
                <p className="text-[9px] font-black uppercase text-slate-400 mb-1 tracking-widest">Mahasiswa Aktif</p>
                <p className="text-5xl font-black text-blue-600 tracking-tighter leading-none">{stats.activeStudents}</p>
              </div>
              <div className="bg-slate-900 p-8 rounded-[3.5rem] text-white shadow-2xl italic relative overflow-hidden group">
                <div className="absolute -right-4 -top-4 opacity-10 group-hover:scale-125 transition-transform duration-700">
                  <Activity size={120} />
                </div>
                <p className="text-[9px] font-black uppercase opacity-60 mb-1 tracking-widest">Employability Rate</p>
                <p className="text-6xl font-black tracking-tighter leading-none">{stats.employabilityRate}%</p>
                <p className="mt-4 text-[9px] font-bold uppercase text-emerald-400 flex items-center gap-2">
                  <CheckCircle size={10} /> Data Terverifikasi Sistem
                </p>
              </div>
            </div>

            {/* Narrative Insight (Aksesibel Naratif) */}
            <section 
              className="bg-slate-50 p-10 rounded-[4rem] border-2 border-slate-100 italic" 
              aria-label="Ringkasan Analisis Data Institusi"
            >
              <h3 className="text-[11px] font-black uppercase text-blue-600 mb-6 tracking-widest flex items-center gap-2">
                <Award size={16} aria-hidden="true" /> Insight Pengembangan SDM
              </h3>
              <div className="text-slate-800 text-lg md:text-xl font-medium leading-relaxed max-w-4xl space-y-4">
                <p>
                  Berdasarkan sinkronisasi data riil lintas tabel, <strong>{partner?.name}</strong> saat ini menaungi ekosistem talenta disabilitas sebanyak <strong>{stats.totalAlumni} orang</strong>. 
                  Tingkat keterserapan kerja (Employability Rate) dari populasi tersebut berada pada angka <strong>{stats.employabilityRate}%</strong>.
                </p>
                <p>
                  Terdapat <strong>{stats.activeStudents} mahasiswa disabilitas aktif</strong> yang sedang dipersiapkan untuk dunia kerja melalui 
                  <strong> {stats.totalPrograms} program pengembangan kompetensi</strong> yang telah dipublikasikan di platform Disabilitas.com.
                </p>
              </div>
            </section>

            {/* Quick Action untuk Admin */}
            <div className="flex flex-wrap gap-4">
               <button 
                 onClick={() => navigateTo("tracer", "Tracing Alumni")}
                 className="flex items-center gap-3 bg-white border-2 border-slate-200 px-6 py-4 rounded-2xl hover:border-slate-900 transition-all text-[10px] font-black uppercase italic"
               >
                 <Search size={16} /> Mulai Tracing Alumni
               </button>
               <button 
                 onClick={() => navigateTo("profile", "Profil Inklusi")}
                 className="flex items-center gap-3 bg-white border-2 border-slate-200 px-6 py-4 rounded-2xl hover:border-slate-900 transition-all text-[10px] font-black uppercase italic"
               >
                 <Settings size={16} /> Audit Aksesibilitas Kampus
               </button>
            </div>
          </div>
        )}

        {/* 2. RENDERING MODUL-MODUL FUNGSIONAL */}
        <div className="mt-2 animate-in fade-in duration-700">
           {activeTab === "programs" && (
             <ProgramManager 
                partnerId={session.user.id} 
                onBack={() => navigateTo("overview", "Dashboard Overview")} 
             />
           )}
           {activeTab === "enrollment" && (
             <EnrollmentTracker 
                partnerId={session.user.id} 
                onBack={() => navigateTo("overview", "Dashboard Overview")} 
             />
           )}
           {activeTab === "tracer" && (
             <TalentTracer 
                partnerName={partner?.name} 
                partnerId={session.user.id} 
                onBack={() => navigateTo("overview", "Dashboard Overview")} 
             />
           )}
           {activeTab === "profile" && (
             <ProfileEditor 
                partner={partner} 
                onUpdate={() => { fetchDashboardData(); navigateTo("overview", "Profil Berhasil Diperbarui"); }} 
                onBack={() => navigateTo("overview", "Dashboard Overview")} 
             />
           )}
           {activeTab === "account" && (
             <AccountSettings 
                session={session} 
                onBack={() => navigateTo("overview", "Dashboard Overview")} 
             />
           )}
        </div>
      </main>
    </div>
  );
}
