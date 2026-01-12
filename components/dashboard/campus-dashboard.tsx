"use client";

import React, { useState, useEffect, useCallback } from "react";
import { supabase } from "@/lib/supabase";
import { 
  GraduationCap, Users, BookOpen, BarChart3, Settings, 
  ShieldCheck, Share2, AlertCircle, Plus, LayoutDashboard,
  Activity, Award, Lock, CheckCircle,
  MapPin, Zap, User, UserPlus, Timer, ExternalLink, Search
} from "lucide-react";

// Import Modul Pendukung
import ProgramManager from "./campus/program-manager";
import TalentTracer from "./campus/talent-tracer";
import ProfileEditor from "./campus/profile-editor";
import AccountSettings from "./campus/account-settings";

// Import Data Static
import { AGE_RANGES } from "@/lib/data-static";

export default function CampusDashboard({ user }: { user: any }) {
  const [activeTab, setActiveTab] = useState("overview");
  const [trackingMode, setTrackingMode] = useState<"academic" | "impact">("academic");
  const [partner, setPartner] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [announcement, setAnnouncement] = useState("");
  const [profileCompletion, setProfileCompletion] = useState(0);
  
  const [stats, setStats] = useState({
    totalTalenta: 0,
    hiredTalenta: 0,
    activeTalenta: 0,
    employabilityRate: 0,
  });

  const [researchStats, setResearchStats] = useState({
    disabilityMap: {} as Record<string, number>,
    topLocations: [] as string[],
    impactScore: "",
    genderMap: { male: 0, female: 0 },
    ageRanges: {} as Record<string, number>
  });

  const isUni = partner?.category === "Perguruan Tinggi";
  
  // Penamaan dinamis untuk aksesibilitas & terminologi
  const labelTalent = isUni && trackingMode === "academic" ? "Mahasiswa" : "Peserta";
  const labelAlumni = isUni && trackingMode === "academic" ? "Alumni" : "Lulusan";

  const fetchDashboardData = useCallback(async () => {
    if (!user?.id) return;
    setLoading(true);
    try {
      // 1. Ambil Data Partner
      const { data: partnerData } = await supabase.from("partners").select("*").eq("id", user.id).single();
      if (!partnerData) return;
      setPartner(partnerData);
      
      // Jika bukan kampus, paksa ke mode impact
      if (partnerData.category !== "Perguruan Tinggi" && trackingMode === "academic") {
        setTrackingMode("impact");
      }

      // 2. Identifikasi ID berdasarkan mode
      let targetIds: string[] = [];

      if (trackingMode === "academic") {
        // Jalur Almamater: profiles.university
        const { data: uniTalent } = await supabase.from("profiles").select("id").eq("university", partnerData.name);
        targetIds = uniTalent?.map(t => t.id) || [];
      } else {
        // Jalur Impact: certifications.profile_id
        const { data: certTalent } = await supabase.from("certifications").select("profile_id").eq("organizer_name", partnerData.name);
        targetIds = Array.from(new Set(certTalent?.map(c => c.profile_id) || []));
      }

      // 3. Tambahkan ID dari Admin Lock (Selalu disertakan)
      const { data: lockedTalent } = await supabase.from("profiles").select("id").eq("admin_partner_lock", user.id);
      const lockedIds = lockedTalent?.map(t => t.id) || [];
      const finalUniqueIds = Array.from(new Set([...targetIds, ...lockedIds]));

      if (finalUniqueIds.length > 0) {
        const { data: profiles } = await supabase
          .from("profiles")
          .select("id, career_status, graduation_date, disability_type, city, skill_impact_rating, gender, date_of_birth")
          .in("id", finalUniqueIds);

        if (profiles) {
          const currentYear = new Date().getFullYear();
          const disMap: Record<string, number> = {};
          const locMap: Record<string, number> = {};
          const genderMap = { male: 0, female: 0 };
          const ageMap: Record<string, number> = {};
          AGE_RANGES.forEach(r => ageMap[r] = 0);
          const impactCounts: Record<string, number> = {};

          profiles.forEach(p => {
            if (p.disability_type) disMap[p.disability_type] = (disMap[p.disability_type] || 0) + 1;
            if (p.city) locMap[p.city] = (locMap[p.city] || 0) + 1;
            if (p.gender === "male") genderMap.male++;
            if (p.gender === "female") genderMap.female++;
            
            if (p.date_of_birth) {
              const age = currentYear - new Date(p.date_of_birth).getFullYear();
              if (age >= 18 && age <= 24) ageMap["18-24 Tahun"]++;
              else if (age >= 25 && age <= 34) ageMap["25-34 Tahun"]++;
              else if (age >= 35 && age <= 44) ageMap["35-44 Tahun"]++;
              else if (age >= 45) ageMap["Di atas 45 Tahun"]++;
            }
            if (p.skill_impact_rating) impactCounts[p.skill_impact_rating] = (impactCounts[p.skill_impact_rating] || 0) + 1;
          });

          const employed = profiles.filter(p => !["Job Seeker", "Belum Bekerja", "Pelajar / Mahasiswa", "Fresh Graduate"].includes(p.career_status)).length;

          setStats({
            totalTalenta: finalUniqueIds.length,
            hiredTalenta: employed,
            activeTalenta: profiles.filter(p => (p.graduation_date || 0) > currentYear).length,
            employabilityRate: finalUniqueIds.length > 0 ? Math.round((employed / finalUniqueIds.length) * 100) : 0,
          });

          setResearchStats({
            disabilityMap: disMap,
            topLocations: Object.entries(locMap).sort((a,b) => b[1]-a[1]).slice(0,3).map(([c]) => c),
            impactScore: Object.entries(impactCounts).sort((a,b) => b[1]-a[1])[0]?.[0] || "Belum Ada Data",
            genderMap,
            ageRanges: ageMap
          });
        }
      } else {
        setStats({ totalTalenta: 0, hiredTalenta: 0, activeTalenta: 0, employabilityRate: 0 });
      }

      // Calculate profile completion
      const fields = ["name", "description", "location", "website", "nib_number", "category"];
      const filled = fields.filter(f => partnerData[f] && partnerData[f].length > 0).length;
      const acc = (partnerData.master_accommodations_provided?.length || 0) > 0 ? 1 : 0;
      setProfileCompletion(Math.round(((filled + acc) / (fields.length + 1)) * 100));

    } catch (e) { console.error(e); } finally { setLoading(false); }
  }, [user?.id, trackingMode]);

  useEffect(() => { fetchDashboardData(); }, [fetchDashboardData]);
  const navigateTo = (tabId: string, label: string) => {
    setActiveTab(tabId);
    setAnnouncement(`Menampilkan halaman ${label}`);
    window.scrollTo(0, 0);
  };

  const shareInclusionCard = () => {
    const caption = `[SKOR INKLUSI: ${partner?.inclusion_score || 0}%] 
Bangga mendukung talenta disabilitas bersama disabilitas.com! Sebagai ${partner?.category}, ${partner?.name} berkomitmen menciptakan ekosistem inklusif di Indonesia. #DisabilitasBisa #IndonesiaInklusif`;
    
    if (navigator.share) {
      navigator.share({ title: partner?.name, text: caption, url: `https://disabilitas.com/partner/${partner?.id}` });
    } else {
      navigator.clipboard.writeText(caption);
      alert("Caption viral disalin!");
    }
  };

  if (loading) return <div role="status" className="flex min-h-screen items-center justify-center font-black uppercase italic text-slate-400 animate-pulse">Sinkronisasi Database Riset...</div>;

  return (
    <div className="mx-auto max-w-7xl space-y-10 px-4 py-10 text-slate-900">
      <div className="sr-only" aria-live="polite">{announcement}</div>

      {/* HEADER */}
      <header className="flex flex-col items-start justify-between gap-6 border-b-4 border-slate-900 pb-10 md:flex-row md:items-end">
        <div className="space-y-4 text-left">
          <div className="flex items-center gap-3">
            <div className="rounded-xl bg-slate-900 p-2 text-white shadow-lg"><GraduationCap size={28} /></div>
            <div>
              <p className="text-[10px] font-black uppercase tracking-[0.3em] text-blue-600">{partner?.category} Portal</p>
              <h1 className="text-4xl font-black uppercase italic tracking-tighter leading-none">{partner?.name}</h1>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <span className="flex items-center gap-1.5 rounded-full border-2 border-emerald-500 bg-emerald-50 px-4 py-1.5 text-[10px] font-black uppercase text-emerald-700">
              <ShieldCheck size={14} /> Skor Inklusi: {partner?.inclusion_score}%
            </span>
            <div className="flex items-center gap-3 rounded-full border-2 border-slate-200 bg-white px-4 py-1.5 shadow-sm" title="Kelengkapan Profil">
              <div className="h-2 w-24 overflow-hidden rounded-full bg-slate-100">
                <div className="h-full bg-blue-600 transition-all duration-1000" style={{ width: `${profileCompletion}%` }} />
              </div>
              <span className="text-[10px] font-black uppercase text-slate-500">Profil: {profileCompletion}%</span>
            </div>
            <a href={`/partner/${partner?.id}`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 rounded-full border-2 border-slate-200 bg-white px-4 py-1.5 text-[10px] font-black uppercase text-slate-600 hover:border-slate-900 transition-all">
              <ExternalLink size={14} /> Profil Publik
            </a>
          </div>
        </div>
        <div className="flex gap-3 w-full md:w-auto">
          <button onClick={() => navigateTo("programs", "Buat Program")} className="flex-1 md:flex-none rounded-2xl bg-blue-600 px-8 py-5 text-[11px] font-black uppercase italic text-white shadow-blue-100 shadow-xl hover:bg-slate-900 transition-all uppercase tracking-widest">Program Baru</button>
          <button onClick={shareInclusionCard} className="rounded-2xl border-2 border-slate-100 bg-white px-6 hover:border-slate-900 transition-all" aria-label="Bagikan Inclusion Card"><Share2 size={20} /></button>
        </div>
      </header>

      {/* TRACKING MODE SWITCHER - Khusus Kampus */}
      {isUni && (
        <div className="flex p-1 bg-slate-100 rounded-2xl w-fit" role="radiogroup" aria-label="Mode Tracking Data">
          <button 
            onClick={() => setTrackingMode("academic")}
            className={`px-6 py-3 rounded-xl text-[10px] font-black uppercase transition-all ${trackingMode === "academic" ? "bg-white text-blue-600 shadow-sm" : "text-slate-400 hover:text-slate-600"}`}
          >
            Data Almamater (Gelar)
          </button>
          <button 
            onClick={() => setTrackingMode("impact")}
            className={`px-6 py-3 rounded-xl text-[10px] font-black uppercase transition-all ${trackingMode === "impact" ? "bg-white text-blue-600 shadow-sm" : "text-slate-400 hover:text-slate-600"}`}
          >
            Penerima Manfaat (Impact)
          </button>
        </div>
      )}

      {/* NAV TABS */}
      <nav className="no-scrollbar flex gap-2 overflow-x-auto" role="tablist">
        {[
          { id: "overview", label: "Dashboard", icon: LayoutDashboard },
          { id: "programs", label: "Program", icon: BookOpen },
          { id: "tracer", label: "Tracing", icon: BarChart3 },
          { id: "profile", label: "Profil", icon: Settings },
          { id: "account", label: "Akun", icon: Lock },
        ].map((tab) => (
          <button key={tab.id} onClick={() => navigateTo(tab.id, tab.label)} className={`flex items-center gap-3 whitespace-nowrap rounded-2xl px-6 py-4 text-[10px] font-black uppercase transition-all ${activeTab === tab.id ? "bg-slate-900 text-white shadow-xl -translate-y-1" : "bg-white border-2 border-slate-100 text-slate-400 hover:border-slate-900 hover:text-slate-900"}`}>
            <tab.icon size={16} /> {tab.label}
          </button>
        ))}
      </nav>

      <main id="main-content" className="min-h-[600px]">
        {activeTab === "overview" && (
          <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* STATS */}
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
              <div className="rounded-[2.5rem] border-2 border-slate-100 bg-white p-8 text-left shadow-sm">
                <p className="text-[9px] font-black uppercase tracking-widest text-slate-400">Total {labelTalent} Terpeta</p>
                <p className="mt-1 text-5xl font-black tracking-tighter">{stats.totalTalenta}</p>
              </div>
              <div className="rounded-[2.5rem] border-2 border-slate-100 bg-white p-8 text-left shadow-sm">
                <p className="text-[9px] font-black italic uppercase tracking-widest text-emerald-500">Terserap Kerja</p>
                <p className="mt-1 text-5xl font-black tracking-tighter text-emerald-600">{stats.hiredTalenta}</p>
              </div>
              <div className="rounded-[2.5rem] border-2 border-slate-100 bg-white p-8 text-left shadow-sm">
                <p className="text-[9px] font-black italic uppercase tracking-widest text-blue-500">{labelTalent} Aktif</p>
                <p className="mt-1 text-5xl font-black tracking-tighter text-blue-600">{stats.activeTalenta}</p>
              </div>
              <div className="rounded-[2.5rem] bg-slate-900 p-8 text-left text-white shadow-2xl">
                <p className="text-[9px] font-black uppercase tracking-widest opacity-60 italic">Employability Rate</p>
                <p className="text-6xl font-black italic tracking-tighter leading-none">{stats.employabilityRate}%</p>
              </div>
            </div>

            {/* NARRATIVE */}
            <section className="rounded-[3rem] border-2 border-slate-100 bg-slate-50 p-10 text-left italic shadow-inner">
              <h3 className="mb-6 flex items-center gap-2 text-[11px] font-black uppercase tracking-widest text-blue-600"><Award size={16} /> Analisis Naratif Strategis</h3>
              <div className="max-w-5xl space-y-6 text-xl font-medium leading-relaxed text-slate-800 md:text-2xl">
                <p>
                  Melalui sinkronisasi data {trackingMode === "academic" ? "Almamater" : "Program Impact"}, <strong>{partner?.name}</strong> saat ini mengayomi <strong>{stats.totalTalenta} {labelTalent.toLowerCase()} disabilitas</strong>. 
                  Populasi didominasi ragam <strong>{Object.entries(researchStats.disabilityMap).sort((a,b) => b[1]-a[1])[0]?.[0] || "..."}</strong>.
                </p>
                <p>
                  Tingkat keterserapan {labelAlumni.toLowerCase()} mencapai <strong>{stats.employabilityRate}%</strong>. {trackingMode === "impact" && `Program dinilai memiliki dampak dominan pada level "${researchStats.impactScore}" oleh peserta.`}
                </p>
              </div>
            </section>

            {/* RESEARCH WIDGETS */}
            <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
              <div className="lg:col-span-2 grid grid-cols-1 gap-6 md:grid-cols-2">
                <div className="rounded-[2.5rem] border-2 border-slate-50 bg-white p-8 text-left shadow-sm">
                  <h4 className="mb-6 flex items-center gap-2 text-[11px] font-black uppercase tracking-widest text-slate-900"><Users className="text-purple-600" size={16} /> Ragam Disabilitas</h4>
                  <div className="space-y-4">
                    {Object.entries(researchStats.disabilityMap).map(([type, count]) => (
                      <div key={type} className="space-y-1">
                        <div className="flex justify-between text-[9px] font-black uppercase text-slate-500"><span>{type}</span><span>{count} Jiwa</span></div>
                        <div className="h-2 overflow-hidden rounded-full bg-slate-100"><div className="h-full bg-purple-600 transition-all duration-1000" style={{ width: `${(count / (stats.totalTalenta || 1)) * 100}%` }} /></div>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="space-y-8 rounded-[2.5rem] border-2 border-slate-50 bg-white p-8 text-left shadow-sm">
                  <div>
                    <h4 className="mb-4 flex items-center gap-2 text-[11px] font-black uppercase tracking-widest text-slate-900"><User className="text-blue-500" size={16} /> Gender</h4>
                    <div className="flex gap-4">
                      <div className="flex-1 rounded-2xl bg-slate-50 p-4 border-l-4 border-blue-500"><p className="text-[8px] font-black uppercase text-slate-400">Laki-laki</p><p className="mt-1 text-xl font-black">{researchStats.genderMap.male}</p></div>
                      <div className="flex-1 rounded-2xl bg-slate-50 p-4 border-l-4 border-pink-500"><p className="text-[8px] font-black uppercase text-slate-400">Perempuan</p><p className="mt-1 text-xl font-black">{researchStats.genderMap.female}</p></div>
                    </div>
                  </div>
                  <div>
                    <h4 className="mb-4 flex items-center gap-2 text-[11px] font-black uppercase tracking-widest text-slate-900"><Timer className="text-amber-500" size={16} /> Usia</h4>
                    <div className="grid grid-cols-2 gap-2">
                      {Object.entries(researchStats.ageRanges).map(([range, count]) => (
                        <div key={range} className="flex items-center justify-between rounded-xl bg-slate-50 p-3"><span className="text-[9px] font-black uppercase text-slate-400">{range}</span><span className="text-xs font-black">{count}</span></div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
              <div className="rounded-[2.5rem] bg-blue-600 p-10 text-left text-white shadow-2xl">
                <Zap className="mb-6 text-blue-200" size={32} />
                <p className="text-[10px] font-black uppercase tracking-[0.2em] opacity-70">Impact Pelatihan</p>
                <p className="mt-2 text-2xl font-black italic tracking-tighter uppercase">&quot;{researchStats.impactScore}&quot;</p>
              </div>
            </div>
          </div>
        )}

        <div className="mt-2">
           {activeTab === "programs" && <ProgramManager partnerId={user.id} onBack={() => navigateTo("overview", "Dashboard")} />}
           {activeTab === "tracer" && <TalentTracer partnerName={partner?.name} partnerId={user.id} onBack={() => navigateTo("overview", "Dashboard")} />}
           {activeTab === "profile" && <ProfileEditor partner={partner} onUpdate={() => { fetchDashboardData(); navigateTo("overview", "Dashboard"); }} onBack={() => navigateTo("overview", "Dashboard")} />}
           {activeTab === "account" && <AccountSettings user={user} onBack={() => navigateTo("overview", "Dashboard")} />}
        </div>
      </main>
    </div>
  );
}
