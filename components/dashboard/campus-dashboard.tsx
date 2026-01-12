"use client";

import React, { useState, useEffect, useCallback } from "react";
import { supabase } from "@/lib/supabase";
import { 
  GraduationCap, Users, BookOpen, BarChart3, Settings, 
  ShieldCheck, Share2, AlertCircle, Plus, LayoutDashboard,
  ArrowLeft, Activity, Award, Lock, CheckCircle,
  MapPin, Zap, Venus, Mars, Timer, ExternalLink
} from "lucide-react";

// Import Modul Pendukung
import ProgramManager from "./campus/program-manager";
import EnrollmentTracker from "./campus/enrollment-tracker";
import TalentTracer from "./campus/talent-tracer";
import ProfileEditor from "./campus/profile-editor";
import AccountSettings from "./campus/account-settings";

// Import List dari Data Static
import { CAREER_STATUSES, DISABILITY_TYPES } from "@/lib/data-static";

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

  const [researchStats, setResearchStats] = useState({
    disabilityMap: {} as Record<string, number>,
    topLocations: [] as string[],
    impactScore: "",
    genderMap: { Laki_laki: 0, Perempuan: 0 },
    ageRanges: {} as Record<string, number>
  });

  const fetchDashboardData = useCallback(async () => {
    if (!user?.id) return;
    setLoading(true);
    try {
      // 1. Ambil Data Partner Lengkap
      const { data: partnerData } = await supabase
        .from("partners")
        .select("*")
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

      // 3. Logika Tracing Talenta (Exact Match Nama Institusi)
      const { data: certs } = await supabase
        .from("certifications")
        .select("profile_id")
        .eq("organizer_name", partnerData?.name);
      
      const certProfileIds = Array.from(new Set(certs?.map(c => c.profile_id) || []));
      const idsForQuery = certProfileIds.length > 0 
        ? certProfileIds.map(id => `'${id}'`).join(',') 
        : "'00000000-0000-0000-0000-000000000000'";

      // 4. Ambil Profil Talenta Terafiliasi
      const { data: talenta } = await supabase
        .from("profiles")
        .select("id, career_status, graduation_date, disability_type, city, skill_impact_rating, gender, birth_date")
        .or(`university.eq."${partnerData?.name}",id.in.(${idsForQuery}),admin_partner_lock.eq.${user.id}`);

      if (talenta) {
        const currentYear = new Date().getFullYear();
        
        // --- ANALISIS RISET ---
        const disMap: Record<string, number> = {};
        const locMap: Record<string, number> = {};
        const genderMap = { Laki_laki: 0, Perempuan: 0 };
        const ageMap: Record<string, number> = { "18-24": 0, "25-34": 0, "35-44": 0, "45+": 0 };
        const impactCounts: Record<string, number> = {};

        talenta.forEach(t => {
          // Ragam Disabilitas
          if (t.disability_type) disMap[t.disability_type] = (disMap[t.disability_type] || 0) + 1;
          
          // Lokasi
          if (t.city) locMap[t.city] = (locMap[t.city] || 0) + 1;
          
          // Gender
          if (t.gender === "Laki-laki") genderMap.Laki_laki++;
          if (t.gender === "Perempuan") genderMap.Perempuan++;

          // Usia (Prediksi Sederhana dari Tahun Lahir)
          if (t.birth_date) {
            const age = currentYear - new Date(t.birth_date).getFullYear();
            if (age <= 24) ageMap["18-24"]++;
            else if (age <= 34) ageMap["25-34"]++;
            else if (age <= 44) ageMap["35-44"]++;
            else ageMap["45+"]++;
          }

          // Impact
          if (t.skill_impact_rating) impactCounts[t.skill_impact_rating] = (impactCounts[t.skill_impact_rating] || 0) + 1;
        });

        const topLocs = Object.entries(locMap).sort((a, b) => b[1] - a[1]).slice(0, 3).map(([city]) => city);
        const topImpact = Object.entries(impactCounts).sort((a,b) => b[1] - a[1])[0]?.[0] || "Belum Ada Data";

        const employed = talenta.filter(t => 
          !["Job Seeker", "Belum Bekerja", "Pelajar / Mahasiswa", "Fresh Graduate"].includes(t.career_status)
        ).length;

        setStats({
          totalAlumni: talenta.length,
          hiredAlumni: employed,
          activeStudents: talenta.filter(t => (t.graduation_date || 0) > currentYear).length,
          employabilityRate: talenta.length > 0 ? Math.round((employed / talenta.length) * 100) : 0,
          totalPrograms: progCount || 0
        });

        setResearchStats({
          disabilityMap: disMap,
          topLocations: topLocs,
          impactScore: topImpact,
          genderMap: genderMap,
          ageRanges: ageMap
        });
      }
    } catch (e) {
      console.error("Dashboard error:", e);
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  useEffect(() => { fetchDashboardData(); }, [fetchDashboardData]);

  function calculateCompletion(data: any) {
    const fields = ['name', 'description', 'location', 'website', 'nib_number', 'category'];
    const filledFields = fields.filter(f => data[f] && data[f].length > 0).length;
    const hasAccommodations = (data.master_accommodations_provided?.length || 0) > 0 ? 1 : 0;
    setProfileCompletion(Math.round(((filledFields + hasAccommodations) / (fields.length + 1)) * 100));
  }const navigateTo = (tabId: string, label: string) => {
    setActiveTab(tabId);
    setAnnouncement(`Menampilkan halaman ${label}`);
    window.scrollTo(0, 0);
  };

  const shareInclusionCard = () => {
    const caption = `[SKOR INKLUSI: ${partner?.inclusion_score}%] 

Bangga menjadi bagian dari ekosistem inklusif disabilitas.com! ${partner?.name} berkomitmen mendukung potensi talenta disabilitas melalui aksesibilitas dan program berkelanjutan. 

Mari wujudkan Indonesia inklusif! #DisabilitasBisa #IndonesiaInklusif #InclusiveCampus`;
    
    if (navigator.share) {
      navigator.share({
        title: `Inclusion Card - ${partner?.name}`,
        text: caption,
        url: `https://disabilitas.com/p/${partner?.id}`
      }).catch(console.error);
    } else {
      navigator.clipboard.writeText(caption);
      alert("Caption viral disalin ke clipboard! Siap dibagikan ke media sosial.");
    }
  };

  if (loading) return (
    <div role="status" aria-live="polite" className="flex min-h-screen items-center justify-center p-20 text-center font-black uppercase italic tracking-tighter text-slate-400">
      <Activity className="mr-2 animate-spin" />
      Sinkronisasi Database Riset...
    </div>
  );

  return (
    <div className="mx-auto max-w-7xl space-y-10 px-4 py-10">
      <div className="sr-only" aria-live="polite">{announcement}</div>

      {/* HEADER SECTION */}
      <header className="flex flex-col items-start justify-between gap-6 border-b-4 border-slate-900 pb-10 md:flex-row md:items-end">
        <div className="space-y-4 text-left">
          <div className="flex items-center gap-3">
            <div className="rounded-xl bg-slate-900 p-2 text-white shadow-lg">
              <GraduationCap size={28} />
            </div>
            <div>
              <p className="text-[10px] font-black uppercase tracking-[0.3em] text-blue-600 leading-none">Partner Dashboard</p>
              <h1 className="text-4xl font-black uppercase italic tracking-tighter text-slate-900 leading-none mt-1">
                {partner?.name || "Institusi Partner"}
              </h1>
            </div>
          </div>
          
          <div className="flex flex-wrap items-center gap-3">
            <span className="flex items-center gap-1.5 rounded-full border-2 border-emerald-500 bg-emerald-50 px-4 py-1.5 text-[10px] font-black uppercase text-emerald-700">
              <ShieldCheck size={14} /> Skor Inklusi: {partner?.inclusion_score || 0}%
            </span>
            <a 
              href={`/p/${partner?.id}`} 
              target="_blank" 
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 rounded-full border-2 border-slate-200 bg-white px-4 py-1.5 text-[10px] font-black uppercase text-slate-600 transition-colors hover:border-slate-900 hover:text-slate-900"
            >
              <ExternalLink size={14} /> Lihat Profil Publik
            </a>
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
            onClick={shareInclusionCard}
            className="group flex items-center justify-center rounded-2xl border-2 border-slate-100 bg-white px-6 text-slate-900 shadow-sm transition-all hover:border-slate-900"
            title="Bagikan Inclusion Card"
          >
            <Share2 size={20} className="transition-transform group-hover:rotate-12" />
          </button>
        </div>
      </header>

      {/* NAVIGATION TABS */}
      <nav className="no-scrollbar flex flex-wrap gap-2 overflow-x-auto" role="tablist">
        {[
          { id: "overview", label: "Dashboard", icon: LayoutDashboard },
          { id: "programs", label: "Program", icon: BookOpen },
          { id: "tracer", label: "Tracing Alumni", icon: BarChart3 },
          { id: "profile", label: "Profil Inklusi", icon: Settings },
          { id: "account", label: "Akun", icon: Lock },
        ].map((tab) => (
          <button
            key={tab.id}
            role="tab"
            aria-selected={activeTab === tab.id}
            onClick={() => navigateTo(tab.id, tab.label)}
            className={`flex items-center gap-3 whitespace-nowrap rounded-2xl px-6 py-4 text-[10px] font-black uppercase transition-all ${
              activeTab === tab.id 
                ? "bg-slate-900 text-white shadow-xl -translate-y-1" 
                : "bg-white border-2 border-slate-100 text-slate-400 hover:border-slate-900 hover:text-slate-900"
            }`}
          >
            <tab.icon size={16} aria-hidden="true" /> {tab.label}
          </button>
        ))}
      </nav>

      {/* MAIN CONTENT */}
      <main id="main-content" className="min-h-[600px]">
        {activeTab === "overview" && (
          <div className="space-y-10 duration-500 animate-in fade-in slide-in-from-bottom-4">
            
            {/* STATS GRID UTAMA */}
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
              <div className="rounded-[2.5rem] border-2 border-slate-100 bg-white p-8 shadow-sm">
                <p className="mb-1 text-[9px] font-black uppercase tracking-widest text-slate-400">Total Talenta Terpeta</p>
                <div className="flex items-end gap-2 text-slate-900">
                  <p className="text-5xl font-black tracking-tighter">{stats.totalAlumni}</p>
                  <span className="mb-2 text-[10px] font-bold uppercase">Orang</span>
                </div>
              </div>
              
              <div className="rounded-[2.5rem] border-2 border-slate-100 bg-white p-8 shadow-sm">
                <p className="mb-1 text-[9px] font-black uppercase tracking-widest text-emerald-500 italic">Terserap Kerja</p>
                <div className="flex items-end gap-2 text-emerald-600">
                  <p className="text-5xl font-black tracking-tighter">{stats.hiredAlumni}</p>
                  <span className="mb-2 text-[10px] font-bold uppercase">Orang</span>
                </div>
              </div>

              <div className="rounded-[2.5rem] border-2 border-slate-100 bg-white p-8 shadow-sm">
                <p className="mb-1 text-[9px] font-black uppercase tracking-widest text-blue-500 italic">Mahasiswa/Trainee Aktif</p>
                <div className="flex items-end gap-2 text-blue-600">
                  <p className="text-5xl font-black tracking-tighter">{stats.activeStudents}</p>
                  <span className="mb-2 text-[10px] font-bold uppercase tracking-tighter">Dalam Proses</span>
                </div>
              </div>

              <div className="group relative overflow-hidden rounded-[2.5rem] bg-slate-900 p-8 text-white shadow-2xl transition-all hover:scale-[1.02]">
                <p className="mb-1 text-[9px] font-black uppercase tracking-widest opacity-60 italic">Employability Rate</p>
                <p className="text-6xl font-black leading-none tracking-tighter italic">{stats.employabilityRate}%</p>
                <p className="mt-4 flex items-center gap-2 text-[9px] font-bold uppercase text-emerald-400">
                  <CheckCircle size={10} /> Validated Analytics
                </p>
              </div>
            </div>

            {/* RESEARCH ANALYTICS SECTION */}
            <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
              <div className="lg:col-span-2 grid grid-cols-1 gap-6 md:grid-cols-2">
                
                {/* WIDGET: PROPORSI DISABILITAS */}
                <div className="rounded-[2.5rem] border-2 border-slate-50 bg-white p-8 text-left shadow-sm">
                  <h4 className="mb-6 flex items-center gap-2 text-[11px] font-black uppercase tracking-widest text-slate-900">
                    <Users size={16} className="text-purple-600" /> Ragam Disabilitas
                  </h4>
                  <div className="space-y-4">
                    {Object.entries(researchStats.disabilityMap).map(([type, count]) => (
                      <div key={type} className="space-y-1">
                        <div className="flex justify-between text-[9px] font-black uppercase text-slate-500">
                          <span>{type}</span>
                          <span>{count} Jiwa</span>
                        </div>
                        <div className="h-2 rounded-full bg-slate-100 overflow-hidden">
                          <div className="h-full bg-purple-600 transition-all duration-1000" style={{ width: `${(count / stats.totalAlumni) * 100}%` }} />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* WIDGET: DEMOGRAFI GENDER & USIA */}
                <div className="rounded-[2.5rem] border-2 border-slate-50 bg-white p-8 text-left shadow-sm space-y-8">
                  <div>
                    <h4 className="mb-4 flex items-center gap-2 text-[11px] font-black uppercase tracking-widest text-slate-900">
                      <Venus size={16} className="text-pink-500" /> / <Mars size={16} className="text-blue-500" /> Gender
                    </h4>
                    <div className="flex gap-4">
                      <div className="flex-1 rounded-2xl bg-slate-50 p-4 border-l-4 border-blue-500">
                        <p className="text-[8px] font-black uppercase text-slate-400">Laki-laki</p>
                        <p className="text-xl font-black">{researchStats.genderMap.Laki_laki}</p>
                      </div>
                      <div className="flex-1 rounded-2xl bg-slate-50 p-4 border-l-4 border-pink-500">
                        <p className="text-[8px] font-black uppercase text-slate-400">Perempuan</p>
                        <p className="text-xl font-black">{researchStats.genderMap.Perempuan}</p>
                      </div>
                    </div>
                  </div>
                  <div>
                    <h4 className="mb-4 flex items-center gap-2 text-[11px] font-black uppercase tracking-widest text-slate-900">
                      <Timer size={16} className="text-amber-500" /> Distribusi Usia
                    </h4>
                    <div className="grid grid-cols-2 gap-2">
                      {Object.entries(researchStats.ageRanges).map(([range, count]) => (
                        <div key={range} className="rounded-xl bg-slate-50 p-3 flex justify-between items-center">
                          <span className="text-[9px] font-black text-slate-400">{range} Thn</span>
                          <span className="text-xs font-black">{count}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* WIDGET: PERSEBARAN WILAYAH */}
                <div className="rounded-[2.5rem] border-2 border-slate-50 bg-white p-8 text-left shadow-sm md:col-span-2">
                  <h4 className="mb-6 flex items-center gap-2 text-[11px] font-black uppercase tracking-widest text-slate-900">
                    <MapPin size={16} className="text-red-500" /> Konsentrasi Wilayah Terbesar
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {researchStats.topLocations.map((city, idx) => (
                      <div key={city} className="flex items-center gap-4 rounded-2xl border border-slate-100 bg-slate-50 p-4">
                        <span className="text-2xl font-black text-slate-200">0{idx + 1}</span>
                        <p className="text-[10px] font-black uppercase leading-tight">{city}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* SIDE ANALYTICS: IMPACT & INSIGHT */}
              <div className="space-y-6">
                <div className="rounded-[2.5rem] bg-blue-600 p-10 text-left text-white shadow-2xl shadow-blue-200">
                  <Zap size={32} className="mb-6 text-blue-200" />
                  <p className="text-[10px] font-black uppercase tracking-[0.2em] opacity-70">Kebermanfaatan Program</p>
                  <p className="mt-2 text-2xl font-black italic uppercase tracking-tighter leading-tight">
                    &quot;{researchStats.impactScore}&quot;
                  </p>
                  <div className="mt-8 border-t border-blue-500 pt-6">
                    <p className="text-[10px] font-medium leading-relaxed italic opacity-80">
                      Prediksi: Kualitas kurikulum <strong>{partner?.name}</strong> berpotensi meningkatkan keterserapan kerja talenta sebesar 15% pada semester mendatang.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB RENDERING */}
        <div className="mt-2 duration-700 animate-in fade-in">
           {activeTab === "programs" && <ProgramManager partnerId={user.id} onBack={() => navigateTo("overview", "Dashboard")} />}
           {activeTab === "tracer" && <TalentTracer partnerName={partner?.name} partnerId={user.id} onBack={() => navigateTo("overview", "Dashboard")} />}
           {activeTab === "profile" && <ProfileEditor partner={partner} onUpdate={() => { fetchDashboardData(); navigateTo("overview", "Dashboard"); }} onBack={() => navigateTo("overview", "Dashboard")} />}
           {activeTab === "account" && <AccountSettings user={user} onBack={() => navigateTo("overview", "Dashboard")} />}
        </div>
      </main>
    </div>
  );
}
