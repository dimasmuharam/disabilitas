"use client";

import React, { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { 
  GraduationCap, 
  Users, 
  BookOpen, 
  BarChart3, 
  Settings, 
  ShieldCheck, 
  Share2, 
  AlertCircle, 
  Plus, 
  LayoutDashboard,
  ArrowLeft, 
  Activity, 
  Award, 
  Lock, 
  CheckCircle, 
  Search 
} from "lucide-react";

// Import Modul Pendukung
import ProgramManager from "./campus/program-manager";
import EnrollmentTracker from "./campus/enrollment-tracker";
import TalentTracer from "./campus/talent-tracer";
import ProfileEditor from "./campus/profile-editor";
import AccountSettings from "./campus/account-settings";

// SEKARANG SUDAH SERAGAM: Menggunakan { user } bukan { session }
export default function CampusDashboard({ user }: { user: any }) {
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
    if (user?.id) {
      fetchDashboardData();
    }
  }, [user?.id]);

  async function fetchDashboardData() {
    setLoading(true);
    try {
      // 1. Ambil Data Partner
      const { data: partnerData } = await supabase
        .from("partners")
        .select("*")
        .eq("id", user.id)
        .single();
      setPartner(partnerData);

      // 2. Hitung Statistik Program
      const { count: progCount } = await supabase
        .from("trainings")
        .select("*", { count: 'exact', head: true })
        .eq("partner_id", user.id);

      // 3. Logika Tracing Talenta
      const { data: certs } = await supabase
        .from("certifications")
        .select("profile_id")
        .eq("organizer_name", partnerData?.name);
      
      const certProfileIds = Array.from(new Set(certs?.map(c => c.profile_id) || []));

      const { data: talenta } = await supabase
        .from("profiles")
        .select("id, career_status, graduation_date")
        .or(`university.ilike.%${partnerData?.name}%,id.in.(${certProfileIds.length > 0 ? certProfileIds.join(',') : '"00000000-0000-0000-0000-000000000000"'}),admin_partner_lock.eq.${user.id}`);

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
      console.error("Gagal sinkronisasi dashboard:", e);
    } finally {
      setLoading(false);
    }
  }

  const navigateTo = (tabId: string, label: string) => {
    setActiveTab(tabId);
    setAnnouncement(`Menampilkan halaman ${label}`);
    window.scrollTo(0, 0);
  };

  if (loading) return (
    <div role="status" className="p-20 text-center font-black animate-pulse italic uppercase tracking-tighter text-slate-400">
      Sinkronisasi Database Riset...
    </div>
  );

  return (
    <div className="mx-auto max-w-7xl space-y-10 px-4 py-10">
      <div className="sr-only" aria-live="polite">{announcement}</div>

      {/* HEADER */}
      <header className="flex flex-col items-start justify-between gap-6 md:flex-row md:items-end">
        <div className="space-y-2 text-left">
          <div className="flex items-center gap-3">
            <div className="rounded-xl bg-slate-900 p-2 text-white">
              <GraduationCap size={24} aria-hidden="true" />
            </div>
            <p className="text-[10px] font-black uppercase tracking-[0.3em] text-blue-600">Partner Dashboard</p>
          </div>
          <h1 className="text-4xl font-black uppercase italic tracking-tighter text-slate-900">
            {partner?.name || "Institusi Partner"}
          </h1>
          <div className="mt-4 flex flex-wrap items-center gap-3">
            <span className="flex items-center gap-1.5 rounded-full border border-emerald-100 bg-emerald-50 px-4 py-1.5 text-[10px] font-black uppercase text-emerald-700 shadow-sm">
              <ShieldCheck size={14} /> Skor Inklusi: {partner?.inclusion_score || 0}%
            </span>
          </div>
        </div>

        <div className="flex gap-3">
          <button 
            onClick={() => navigateTo("programs", "Buat Program")}
            className="flex items-center gap-3 rounded-[2rem] bg-blue-600 px-8 py-4 text-[10px] font-black uppercase italic text-white shadow-xl shadow-blue-100 transition-all hover:bg-slate-900"
          >
            <Plus size={18} /> Buat Program Baru
          </button>
          <button 
            className="group rounded-full border-2 border-slate-100 bg-white p-4 text-slate-900 shadow-sm transition-all hover:border-slate-900"
            title="Bagikan Inclusion Card"
          >
            <Share2 size={20} className="transition-transform group-hover:rotate-12" />
          </button>
        </div>
      </header>

      {/* TABS */}
      <nav className="no-scrollbar flex flex-wrap gap-2 overflow-x-auto border-b-2 border-slate-100 pb-4" role="tablist">
        {[
          { id: "overview", label: "Dashboard", icon: LayoutDashboard },
          { id: "programs", label: "Kelola Program", icon: BookOpen },
          { id: "enrollment", label: "Pendaftaran", icon: Users },
          { id: "tracer", label: "Tracing & Verifikasi", icon: BarChart3 },
          { id: "profile", label: "Profil Inklusi", icon: Settings },
          { id: "account", label: "Manajemen Akun", icon: Lock },
        ].map((tab) => (
          <button
            key={tab.id}
            role="tab"
            aria-selected={activeTab === tab.id}
            onClick={() => navigateTo(tab.id, tab.label)}
            className={`flex items-center gap-3 whitespace-nowrap rounded-2xl px-8 py-4 text-[10px] font-black uppercase transition-all ${
              activeTab === tab.id 
                ? "scale-105 bg-slate-900 text-white shadow-lg" 
                : "bg-slate-50 text-slate-400 hover:bg-slate-100"
            }`}
          >
            <tab.icon size={16} aria-hidden="true" /> {tab.label}
          </button>
        ))}
      </nav>

      {/* CONTENT */}
      <main className="min-h-[500px]">
        {activeTab !== "overview" && (
          <button 
            onClick={() => navigateTo("overview", "Dashboard Overview")}
            className="group mb-8 flex items-center gap-2 text-[10px] font-black uppercase italic text-slate-400 transition-colors hover:text-slate-900"
          >
            <ArrowLeft size={14} className="transition-transform group-hover:-translate-x-1" /> 
            Kembali ke Overview Dashboard
          </button>
        )}

        {activeTab === "overview" && (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 space-y-10">
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4" role="region" aria-label="Statistik Cepat">
              <div className="rounded-[3rem] border-2 border-slate-100 bg-white p-8 shadow-sm">
                <p className="mb-1 text-[9px] font-black uppercase tracking-widest text-slate-400">Total Talenta Terpeta</p>
                <p className="text-5xl font-black tracking-tighter text-slate-900">{stats.totalAlumni}</p>
              </div>
              <div className="rounded-[3rem] border-2 border-slate-100 bg-white p-8 shadow-sm border-b-emerald-200">
                <p className="mb-1 text-[9px] font-black uppercase italic tracking-widest text-emerald-500">Terserap Kerja</p>
                <p className="text-5xl font-black tracking-tighter text-emerald-600">{stats.hiredAlumni}</p>
              </div>
              <div className="rounded-[3rem] border-2 border-slate-100 bg-white p-8 shadow-sm border-b-blue-200">
                <p className="mb-1 text-[9px] font-black uppercase tracking-widest text-slate-400">Mahasiswa Aktif</p>
                <p className="text-5xl font-black tracking-tighter text-blue-600">{stats.activeStudents}</p>
              </div>
              <div className="group relative overflow-hidden rounded-[3.5rem] bg-slate-900 p-8 italic text-white shadow-2xl">
                <div className="absolute -right-4 -top-4 opacity-10 transition-transform duration-700 group-hover:scale-125">
                  <Activity size={120} />
                </div>
                <p className="mb-1 text-[9px] font-black uppercase tracking-widest opacity-60">Employability Rate</p>
                <p className="text-6xl font-black tracking-tighter leading-none">{stats.employabilityRate}%</p>
                <p className="mt-4 flex items-center gap-2 text-[9px] font-bold uppercase text-emerald-400">
                  <CheckCircle size={10} /> Data Terverifikasi Sistem
                </p>
              </div>
            </div>

            <section className="rounded-[4rem] border-2 border-slate-100 bg-slate-50 p-10 italic" aria-label="Analisis Naratif">
              <h3 className="mb-6 flex items-center gap-2 text-[11px] font-black uppercase tracking-widest text-blue-600">
                <Award size={16} aria-hidden="true" /> Insight Pengembangan SDM
              </h3>
              <div className="max-w-4xl space-y-4 text-lg font-medium leading-relaxed text-slate-800 md:text-xl">
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
          </div>
        )}

        {/* RENDER MODUL DENGAN PROP USER YANG SERAGAM */}
        <div className="mt-2 animate-in fade-in duration-700">
           {activeTab === "programs" && <ProgramManager partnerId={user.id} onBack={() => navigateTo("overview", "Dashboard Overview")} />}
           {activeTab === "enrollment" && <EnrollmentTracker partnerId={user.id} onBack={() => navigateTo("overview", "Dashboard Overview")} />}
           {activeTab === "tracer" && <TalentTracer partnerName={partner?.name} partnerId={user.id} onBack={() => navigateTo("overview", "Dashboard Overview")} />}
           {activeTab === "profile" && <ProfileEditor partner={partner} onUpdate={() => { fetchDashboardData(); navigateTo("overview", "Profil Berhasil Diperbarui"); }} onBack={() => navigateTo("overview", "Dashboard Overview")} />}
           {activeTab === "account" && <AccountSettings user={user} onBack={() => navigateTo("overview", "Dashboard Overview")} />}
        </div>
      </main>
    </div>
  );
}
