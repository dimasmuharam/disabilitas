"use client";

import React, { useState, useEffect, useCallback } from "react";
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
  FileText
} from "lucide-react";

// Import Modul Pendukung
import ProgramManager from "./campus/program-manager";
import EnrollmentTracker from "./campus/enrollment-tracker";
import TalentTracer from "./campus/talent-tracer";
import ProfileEditor from "./campus/profile-editor";
import AccountSettings from "./campus/account-settings";

export default function CampusDashboard({ user }: { user: any }) {
  const [activeTab, setActiveTab] = useState("overview");
  const [partner, setPartner] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [announcement, setAnnouncement] = useState("");
  const [profileCompletion, setProfileCompletion] = useState(0);
  const [stats, setStats] = useState({
    totalAlumni: 0,
    hiredAlumni: 0,
    activeStudents: 0,
    employabilityRate: 0,
    totalPrograms: 0
  });

  const fetchDashboardData = useCallback(async () => {
    if (!user?.id) return;
    setLoading(true);
    try {
      // 1. Ambil Data Partner Lengkap (Sinkron dengan skema DB)
      const { data: partnerData, error: pError } = await supabase
        .from("partners")
        .select("id, name, description, category, location, website, nib_number, inclusion_score, master_accommodations_provided")
        .eq("id", user.id)
        .single();
      
      if (partnerData) {
        setPartner(partnerData);
        calculateCompletion(partnerData);
      }

      // 2. Hitung Statistik Program
      const { count: progCount } = await supabase
        .from("trainings")
        .select("*", { count: 'exact', head: true })
        .eq("partner_id", user.id);

      // 3. Logika Tracing Talenta Berdasarkan Institusi & Verifikasi
      const { data: certs } = await supabase
        .from("certifications")
        .select("profile_id")
        .eq("organizer_name", partnerData?.name);
      
      const certProfileIds = Array.from(new Set(certs?.map(c => c.profile_id) || []));

      // Query talenta: Alumni Universitas OR Pemegang Sertifikat OR Dikunci Admin
      const { data: talenta } = await supabase
        .from("profiles")
        .select("id, career_status, graduation_date")
        .or(`university.ilike.%${partnerData?.name}%,id.in.(${certProfileIds.length > 0 ? certProfileIds.join(',') : '"00000000-0000-0000-0000-000000000000"'}),admin_partner_lock.eq.${user.id}`);

      if (talenta) {
        const currentYear = new Date().getFullYear();
        // Definisi bekerja: Status bukan Job Seeker, Belum Bekerja, atau Pelajar
        const employed = talenta.filter(t => 
          !["Job Seeker", "Belum Bekerja", "Pelajar / Mahasiswa"].includes(t.career_status)
        ).length;
        
        // Mahasiswa aktif: Yang tahun kelulusannya di masa depan
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
  }, [user?.id]);

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  // Fungsi hitung kelengkapan data institusi untuk riset
  function calculateCompletion(data: any) {
    const fields = ['name', 'description', 'location', 'website', 'nib_number', 'category'];
    const filledFields = fields.filter(f => data[f] && data[f].length > 0).length;
    const hasAccommodations = data.master_accommodations_provided?.length > 0 ? 1 : 0;
    const total = Math.round(((filledFields + hasAccommodations) / (fields.length + 1)) * 100);
    setProfileCompletion(total);
  }

  const navigateTo = (tabId: string, label: string) => {
    setActiveTab(tabId);
    setAnnouncement(`Menampilkan halaman ${label}`);
    window.scrollTo(0, 0);
  };

  if (loading) return (
    <div role="status" aria-live="polite" className="flex min-h-screen items-center justify-center p-20 text-center font-black uppercase italic tracking-tighter text-slate-400">
      <Activity className="mr-2 animate-spin" />
      Sinkronisasi Database Riset...
    </div>
  );

  return (
    <div className="mx-auto max-w-7xl space-y-10 px-4 py-10">
      {/* SCREEN READER ANNOUNCER */}
      <div className="sr-only" aria-live="polite">{announcement}</div>

      {/* HEADER SECTION */}
      <header className="flex flex-col items-start justify-between gap-6 border-b-4 border-slate-900 pb-10 md:flex-row md:items-end">
        <div className="space-y-4 text-left">
          <div className="flex items-center gap-3">
            <div className="rounded-xl bg-slate-900 p-2 text-white shadow-lg">
              <GraduationCap size={28} aria-hidden="true" />
            </div>
            <div>
              <p className="text-[10px] font-black uppercase tracking-[0.3em] text-blue-600 leading-none">Partner Dashboard</p>
              <h1 className="text-4xl font-black uppercase italic tracking-tighter text-slate-900 leading-none mt-1">
                {partner?.name || "Institusi Partner"}
              </h1>
            </div>
          </div>
          
          <div className="flex flex-wrap items-center gap-3">
            <span className="flex items-center gap-1.5 rounded-full border-2 border-emerald-500 bg-emerald-50 px-4 py-1.5 text-[10px] font-black uppercase text-emerald-700 shadow-sm">
              <ShieldCheck size={14} /> Skor Inklusi: {partner?.inclusion_score || 0}%
            </span>
            <div className="flex items-center gap-2 rounded-full border-2 border-slate-200 bg-white px-4 py-1.5 shadow-sm">
              <div className="h-2 w-24 overflow-hidden rounded-full bg-slate-100">
                <div 
                  className="h-full bg-blue-600 transition-all duration-1000" 
                  style={{ width: `${profileCompletion}%` }}
                />
              </div>
              <span className="text-[10px] font-black uppercase text-slate-500">Kelengkapan Profil: {profileCompletion}%</span>
            </div>
          </div>
        </div>

        <div className="flex w-full gap-3 md:w-auto">
          <button 
            onClick={() => navigateTo("programs", "Buat Program")}
            className="flex flex-1 items-center justify-center gap-3 rounded-2xl bg-blue-600 px-8 py-5 text-[11px] font-black uppercase italic text-white shadow-xl shadow-blue-100 transition-all hover:bg-slate-900 md:flex-none"
          >
            <Plus size={18} /> Program Baru
          </button>
          <button 
            className="group flex items-center justify-center rounded-2xl border-2 border-slate-100 bg-white px-6 text-slate-900 shadow-sm transition-all hover:border-slate-900"
            title="Bagikan Inclusion Card"
            aria-label="Bagikan Kartu Inklusi Institusi"
          >
            <Share2 size={20} className="transition-transform group-hover:rotate-12" />
          </button>
        </div>
      </header>

      {/* NAVIGATION TABS */}
      <nav className="no-scrollbar flex flex-wrap gap-2 overflow-x-auto" role="tablist">
        {[
          { id: "overview", label: "Dashboard", icon: LayoutDashboard },
          { id: "programs", label: "Kelola Program", icon: BookOpen },
          { id: "enrollment", label: "Pendaftaran", icon: Users },
          { id: "tracer", label: "Tracing & Verifikasi", icon: BarChart3 },
          { id: "profile", label: "Profil Inklusi", icon: Settings },
          { id: "account", label: "Akun", icon: Lock },
        ].map((tab) => (
          <button
            key={tab.id}
            role="tab"
            aria-selected={activeTab === tab.id}
            aria-controls="main-content"
            onClick={() => navigateTo(tab.id, tab.label)}
            className={`flex items-center gap-3 whitespace-nowrap rounded-2xl px-6 py-4 text-[10px] font-black uppercase transition-all ${
              activeTab === tab.id 
                ? "bg-slate-900 text-white shadow-xl translate-y-[-2px]" 
                : "bg-white border-2 border-slate-100 text-slate-400 hover:border-slate-900 hover:text-slate-900"
            }`}
          >
            <tab.icon size={16} aria-hidden="true" /> {tab.label}
          </button>
        ))}
      </nav>

      {/* MAIN CONTENT AREA */}
      <main id="main-content" className="min-h-[600px]">
        {activeTab !== "overview" && (
          <button 
            onClick={() => navigateTo("overview", "Dashboard Overview")}
            className="group mb-8 flex items-center gap-2 text-[10px] font-black uppercase italic text-slate-400 transition-colors hover:text-slate-900"
          >
            <ArrowLeft size={14} className="transition-transform group-hover:-translate-x-1" /> 
            Kembali ke Dashboard Utama
          </button>
        )}

        {activeTab === "overview" && (
          <div className="space-y-10 duration-500 animate-in fade-in slide-in-from-bottom-4">
            {/* STATS GRID */}
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4" role="region" aria-label="Ringkasan Statistik">
              <div className="rounded-[2.5rem] border-2 border-slate-100 bg-white p-8 shadow-sm transition-hover hover:border-blue-200">
                <p className="mb-1 text-[9px] font-black uppercase tracking-widest text-slate-400">Total Talenta Terpeta</p>
                <div className="flex items-end gap-2">
                  <p className="text-5xl font-black tracking-tighter text-slate-900" aria-label={`${stats.totalAlumni} orang`}>{stats.totalAlumni}</p>
                  <span className="mb-2 text-[10px] font-bold text-slate-400 uppercase">Orang</span>
                </div>
              </div>
              
              <div className="rounded-[2.5rem] border-2 border-slate-100 bg-white p-8 shadow-sm transition-hover hover:border-emerald-200">
                <p className="mb-1 text-[9px] font-black uppercase italic tracking-widest text-emerald-500">Terserap Kerja</p>
                <div className="flex items-end gap-2">
                  <p className="text-5xl font-black tracking-tighter text-emerald-600" aria-label={`${stats.hiredAlumni} orang`}>{stats.hiredAlumni}</p>
                  <span className="mb-2 text-[10px] font-bold text-emerald-400 uppercase">Orang</span>
                </div>
              </div>

              <div className="rounded-[2.5rem] border-2 border-slate-100 bg-white p-8 shadow-sm transition-hover hover:border-blue-200">
                <p className="mb-1 text-[9px] font-black uppercase tracking-widest text-slate-400">Mahasiswa Aktif</p>
                <div className="flex items-end gap-2">
                  <p className="text-5xl font-black tracking-tighter text-blue-600" aria-label={`${stats.activeStudents} orang`}>{stats.activeStudents}</p>
                  <span className="mb-2 text-[10px] font-bold text-blue-400 uppercase">Orang</span>
                </div>
              </div>

              <div className="group relative overflow-hidden rounded-[2.5rem] bg-slate-900 p-8 italic text-white shadow-2xl transition-all hover:scale-[1.02]">
                <div className="absolute -right-4 -top-4 opacity-10 transition-transform duration-700 group-hover:scale-125" aria-hidden="true">
                  <Activity size={120} />
                </div>
                <p className="mb-1 text-[9px] font-black uppercase tracking-widest opacity-60">Employability Rate</p>
                <p className="text-6xl font-black leading-none tracking-tighter" aria-label={`${stats.employabilityRate} persen`}>{stats.employabilityRate}%</p>
                <p className="mt-4 flex items-center gap-2 text-[9px] font-bold uppercase text-emerald-400">
                  <CheckCircle size={10} /> Data Terverifikasi
                </p>
              </div>
            </div>

            {/* NARRATIVE ANALYSIS */}
            <section className="rounded-[3rem] border-2 border-slate-100 bg-slate-50 p-10 italic shadow-inner" aria-label="Analisis Naratif Strategis">
              <h3 className="mb-6 flex items-center gap-2 text-[11px] font-black uppercase tracking-widest text-blue-600">
                <Award size={16} aria-hidden="true" /> Insight Pengembangan Institusi
              </h3>
              <div className="max-w-4xl space-y-6 text-xl font-medium leading-relaxed text-slate-800 md:text-2xl">
                <p>
                  Melalui sinkronisasi data riil, <strong>{partner?.name}</strong> saat ini mengelola ekosistem <strong>{stats.totalAlumni} talenta disabilitas</strong>. 
                  Tingkat keterserapan alumni di pasar kerja mencapai <strong>{stats.employabilityRate}%</strong>, yang mencerminkan efektivitas kurikulum inklusif institusi.
                </p>
                <p>
                  Strategi saat ini difokuskan pada <strong>{stats.activeStudents} mahasiswa aktif</strong> melalui <strong>{stats.totalPrograms} program pengembangan</strong> yang sedang berjalan. 
                  Lengkapi <strong>Profil Inklusi</strong> untuk meningkatkan skor visibilitas bagi pemberi kerja di Disabilitas.com.
                </p>
              </div>
              
              {profileCompletion < 100 && (
                <div className="mt-8 flex items-center gap-4 rounded-2xl bg-amber-50 p-4 border border-amber-100">
                  <AlertCircle className="text-amber-600" size={20} />
                  <p className="text-[10px] font-bold uppercase text-amber-700">
                    Perhatian: Data profil Anda baru mencapai {profileCompletion}%. Lengkapi data Registrasi Institusi dan Akomodasi untuk validitas riset.
                  </p>
                </div>
              )}
            </section>
          </div>
        )}

        {/* MODUL RENDER ENGINE */}
        <div className="mt-2 duration-700 animate-in fade-in">
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
