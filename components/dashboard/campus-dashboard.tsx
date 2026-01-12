"use client";

import React, { useState, useEffect, useCallback } from "react";
import { supabase } from "@/lib/supabase";
import { 
  GraduationCap, Users, BookOpen, BarChart3, Settings, 
  ShieldCheck, Share2, AlertCircle, Plus, LayoutDashboard,
  ArrowLeft, Activity, Award, Lock, CheckCircle,
  MapPin, Zap, User, UserPlus, Timer, ExternalLink
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

  const [researchStats, setResearchStats] = useState({
    disabilityMap: {} as Record<string, number>,
    topLocations: [] as string[],
    impactScore: "",
    genderMap: { male: 0, female: 0 },
    ageRanges: { "18-24": 0, "25-34": 0, "35-44": 0, "45+": 0 }
  });

  const fetchDashboardData = useCallback(async () => {
    if (!user?.id) return;
    setLoading(true);
    try {
      // 1. AMBIL DATA PARTNER (Table: partners)
      const { data: partnerData } = await supabase
        .from("partners")
        .select("*")
        .eq("id", user.id)
        .single();
      
      if (partnerData) {
        setPartner(partnerData);
        calculateCompletion(partnerData);
        
        // 2. IDENTIFIKASI AFILIASI (Table: certifications - Menggunakan profile_id)
        const { data: certs } = await supabase
          .from("certifications")
          .select("profile_id")
          .eq("organizer_name", partnerData.name);
        
        const certProfileIds = Array.from(new Set(certs?.map(c => c.profile_id) || []));

        // 3. AMBIL DATA DASAR TALENT (Table: profiles - Menggunakan id)
        // Gabungkan university match, certification match, dan manual admin lock
        let query = supabase
          .from("profiles")
          .select("id, career_status, graduation_date, disability_type, city, skill_impact_rating, gender, date_of_birth");

        const orConditions = [`university.eq."${partnerData.name}"`, `admin_partner_lock.eq.${user.id}`];
        if (certProfileIds.length > 0) {
          orConditions.push(`id.in.(${certProfileIds.map(id => `'${id}'`).join(',')})`);
        }
        
        const { data: talenta } = await query.or(orConditions.join(','));

        if (talenta) {
          const currentYear = new Date().getFullYear();
          const disMap: Record<string, number> = {};
          const locMap: Record<string, number> = {};
          const genderMap = { male: 0, female: 0 };
          const ageMap: Record<string, number> = { "18-24": 0, "25-34": 0, "35-44": 0, "45+": 0 };
          const impactCounts: Record<string, number> = {};

          talenta.forEach(t => {
            if (t.disability_type) disMap[t.disability_type] = (disMap[t.disability_type] || 0) + 1;
            if (t.city) locMap[t.city] = (locMap[t.city] || 0) + 1;
            if (t.gender === "male") genderMap.male++;
            if (t.gender === "female") genderMap.female++;
            
            if (t.date_of_birth) {
              const age = currentYear - new Date(t.date_of_birth).getFullYear();
              if (age <= 24) ageMap["18-24"]++;
              else if (age <= 34) ageMap["25-34"]++;
              else if (age <= 44) ageMap["35-44"]++;
              else ageMap["45+"]++;
            }
            if (t.skill_impact_rating) impactCounts[t.skill_impact_rating] = (impactCounts[t.skill_impact_rating] || 0) + 1;
          });

          const employed = talenta.filter(t => 
            !["Job Seeker", "Belum Bekerja", "Pelajar / Mahasiswa", "Fresh Graduate"].includes(t.career_status)
          ).length;

          setStats({
            totalAlumni: talenta.length,
            hiredAlumni: employed,
            activeStudents: talenta.filter(t => (t.graduation_date || 0) > currentYear).length,
            employabilityRate: talenta.length > 0 ? Math.round((employed / talenta.length) * 100) : 0,
            totalPrograms: 0 
          });

          setResearchStats({
            disabilityMap: disMap,
            topLocations: Object.entries(locMap).sort((a,b) => b[1]-a[1]).slice(0,3).map(([c]) => c),
            impactScore: Object.entries(impactCounts).sort((a,b) => b[1]-a[1])[0]?.[0] || "Belum Ada Data",
            genderMap: genderMap,
            ageRanges: ageMap
          });
        }
      }
    } catch (e) {
      console.error("Sync Error:", e);
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
    setAnnouncement(`Menampilkan ${label}`);
    window.scrollTo(0, 0);
  };

  const shareInclusionCard = () => {
    const caption = `[SKOR INKLUSI: ${partner?.inclusion_score || 0}%] 
Bangga mendukung talenta disabilitas bersama disabilitas.com! #IndonesiaInklusif`;
    if (navigator.share) {
      navigator.share({ title: partner?.name, text: caption, url: `https://disabilitas.com/p/${partner?.id}` });
    } else {
      navigator.clipboard.writeText(caption);
      alert("Caption disalin!");
    }
  };

  if (loading) return <div className="flex min-h-screen items-center justify-center font-black uppercase italic text-slate-400">Loading Riset...</div>;

  return (
    <div className="mx-auto max-w-7xl space-y-10 px-4 py-10 text-slate-900">
      <div className="sr-only" aria-live="polite">{announcement}</div>

      {/* HEADER & PROGRESS */}
      <header className="flex flex-col items-start justify-between gap-6 border-b-4 border-slate-900 pb-10 md:flex-row md:items-end">
        <div className="space-y-4 text-left">
          <div className="flex items-center gap-3">
            <div className="rounded-xl bg-slate-900 p-2 text-white shadow-lg"><GraduationCap size={28} /></div>
            <div>
              <p className="text-[10px] font-black uppercase tracking-[0.3em] text-blue-600">Partner Dashboard</p>
              <h1 className="text-4xl font-black uppercase italic tracking-tighter">{partner?.name}</h1>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <span className="flex items-center gap-1.5 rounded-full border-2 border-emerald-500 bg-emerald-50 px-4 py-1.5 text-[10px] font-black uppercase text-emerald-700">
              <ShieldCheck size={14} /> Skor Inklusi: {partner?.inclusion_score || 0}%
            </span>
            <div className="flex items-center gap-3 rounded-full border-2 border-slate-200 bg-white px-4 py-1.5">
              <div className="h-2 w-24 overflow-hidden rounded-full bg-slate-100">
                <div className="h-full bg-blue-600 transition-all duration-1000" style={{ width: `${profileCompletion}%` }} />
              </div>
              <span className="text-[10px] font-black uppercase text-slate-500">Profil: {profileCompletion}%</span>
            </div>
          </div>
        </div>
        <div className="flex gap-3">
          <button onClick={() => navigateTo("programs", "Program")} className="rounded-2xl bg-blue-600 px-8 py-5 text-[11px] font-black uppercase italic text-white shadow-xl shadow-blue-100 hover:bg-slate-900 transition-all uppercase">Program Baru</button>
          <button onClick={shareInclusionCard} className="rounded-2xl border-2 border-slate-100 bg-white px-6 shadow-sm hover:border-slate-900 transition-all"><Share2 size={20} /></button>
        </div>
      </header>

      {/* TABS */}
      <nav className="flex gap-2 overflow-x-auto no-scrollbar" role="tablist">
        {[
          { id: "overview", label: "Dashboard", icon: LayoutDashboard },
          { id: "programs", label: "Program", icon: BookOpen },
          { id: "tracer", label: "Tracing", icon: BarChart3 },
          { id: "profile", label: "Profil", icon: Settings }
        ].map((tab) => (
          <button key={tab.id} onClick={() => navigateTo(tab.id, tab.label)} className={`flex items-center gap-3 rounded-2xl px-6 py-4 text-[10px] font-black uppercase transition-all ${activeTab === tab.id ? "bg-slate-900 text-white shadow-xl -translate-y-1" : "bg-white border-2 border-slate-100 text-slate-400"}`}>
            <tab.icon size={16} /> {tab.label}
          </button>
        ))}
      </nav>

      <main id="main-content" className="min-h-[600px]">
        {activeTab === "overview" && (
          <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* STATS GRID */}
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
              <div className="rounded-[2.5rem] border-2 border-slate-100 bg-white p-8 text-left shadow-sm">
                <p className="text-[9px] font-black uppercase text-slate-400">Talenta Terpeta</p>
                <p className="text-5xl font-black tracking-tighter mt-1">{stats.totalAlumni}</p>
              </div>
              <div className="rounded-[2.5rem] border-2 border-slate-100 bg-white p-8 text-left shadow-sm">
                <p className="text-[9px] font-black uppercase text-emerald-500 italic">Terserap Kerja</p>
                <p className="text-5xl font-black tracking-tighter text-emerald-600 mt-1">{stats.hiredAlumni}</p>
              </div>
              <div className="rounded-[2.5rem] border-2 border-slate-100 bg-white p-8 text-left shadow-sm">
                <p className="text-[9px] font-black uppercase text-blue-500 italic">Mahasiswa Aktif</p>
                <p className="text-5xl font-black tracking-tighter text-blue-600 mt-1">{stats.activeStudents}</p>
              </div>
              <div className="rounded-[2.5rem] bg-slate-900 p-8 text-left text-white shadow-2xl">
                <p className="text-[9px] font-black uppercase opacity-60">Employability Rate</p>
                <p className="text-6xl font-black italic tracking-tighter">{stats.employabilityRate}%</p>
              </div>
            </div>

            {/* STRATEGIC NARRATIVE */}
            <section className="rounded-[3rem] border-2 border-slate-100 bg-slate-50 p-10 italic shadow-inner text-left">
              <h3 className="mb-6 flex items-center gap-2 text-[11px] font-black uppercase tracking-widest text-blue-600">
                <Award size={16} /> Analisis Naratif Strategis
              </h3>
              <div className="max-w-5xl space-y-6 text-xl font-medium leading-relaxed text-slate-800 md:text-2xl">
                <p>
                  Berdasarkan sinkronisasi riset, <strong>{partner?.name}</strong> saat ini mengayomi <strong>{stats.totalAlumni} talenta disabilitas</strong>. 
                  Populasi ini didominasi oleh talenta dengan ragam <strong>{Object.entries(researchStats.disabilityMap).sort((a,b) => b[1]-a[1])[0]?.[0] || "..."}</strong>, 
                  dengan komposisi gender <strong>{researchStats.genderMap.male} Laki-laki</strong> dan <strong>{researchStats.genderMap.female} Perempuan</strong>.
                </p>
                <p>
                  Tingkat keterserapan alumni mencapai <strong>{stats.employabilityRate}%</strong>. Program Anda dinilai memiliki dampak 
                  dominan pada level <strong>&quot;{researchStats.impactScore}&quot;</strong> oleh para alumni.
                </p>
                <p>
                  Strategi disarankan fokus pada <strong>{stats.activeStudents} mahasiswa aktif</strong> yang mayoritas berada di wilayah <strong>{researchStats.topLocations[0] || "..."}</strong>. 
                  Lengkapi profil untuk validasi riset nasional.
                </p>
              </div>
            </section>

            {/* RESEARCH WIDGETS */}
            <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
              <div className="lg:col-span-2 grid grid-cols-1 gap-6 md:grid-cols-2">
                <div className="rounded-[2.5rem] border-2 border-slate-50 bg-white p-8 text-left shadow-sm">
                  <h4 className="flex items-center gap-2 text-[11px] font-black uppercase text-slate-900 mb-6"><Users size={16} className="text-purple-600" /> Ragam Disabilitas</h4>
                  <div className="space-y-4">
                    {Object.entries(researchStats.disabilityMap).map(([type, count]) => (
                      <div key={type} className="space-y-1">
                        <div className="flex justify-between text-[9px] font-black text-slate-500 uppercase"><span>{type}</span><span>{count}</span></div>
                        <div className="h-1.5 rounded-full bg-slate-100 overflow-hidden">
                          <div className="h-full bg-purple-600" style={{ width: `${(count / stats.totalAlumni) * 100}%` }} />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="rounded-[2.5rem] border-2 border-slate-50 bg-white p-8 text-left shadow-sm space-y-6">
                  <div>
                    <h4 className="flex items-center gap-2 text-[11px] font-black uppercase text-slate-900 mb-4"><User size={16} className="text-blue-500" /> Gender</h4>
                    <div className="flex gap-3 text-center">
                      <div className="flex-1 rounded-xl bg-slate-50 p-3"><p className="text-[8px] font-black uppercase text-slate-400">Laki-laki</p><p className="text-lg font-black">{researchStats.genderMap.male}</p></div>
                      <div className="flex-1 rounded-xl bg-slate-50 p-3"><p className="text-[8px] font-black uppercase text-slate-400">Perempuan</p><p className="text-lg font-black">{researchStats.genderMap.female}</p></div>
                    </div>
                  </div>
                  <div>
                    <h4 className="flex items-center gap-2 text-[11px] font-black uppercase text-slate-900 mb-4"><Timer size={16} className="text-amber-500" /> Usia</h4>
                    <div className="grid grid-cols-2 gap-2">
                      {Object.entries(researchStats.ageRanges).map(([range, count]) => (
                        <div key={range} className="rounded-lg bg-slate-50 p-2 flex justify-between items-center"><span className="text-[9px] font-black text-slate-400 uppercase">{range}</span><span className="text-xs font-black">{count}</span></div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
              <div className="rounded-[2.5rem] bg-blue-600 p-10 text-left text-white shadow-2xl">
                <Zap size={32} className="mb-6 text-blue-200" />
                <p className="text-[10px] font-black uppercase opacity-70">Impact Pelatihan</p>
                <p className="text-2xl font-black italic uppercase tracking-tighter mt-2 leading-tight">&quot;{researchStats.impactScore}&quot;</p>
              </div>
            </div>
          </div>
        )}

        {activeTab !== "overview" && (
           <div className="mt-2">
              {activeTab === "programs" && <ProgramManager partnerId={user.id} onBack={() => navigateTo("overview", "Dashboard")} />}
              {activeTab === "tracer" && <TalentTracer partnerName={partner?.name} partnerId={user.id} onBack={() => navigateTo("overview", "Dashboard")} />}
              {activeTab === "profile" && <ProfileEditor partner={partner} onUpdate={() => { fetchDashboardData(); navigateTo("overview", "Dashboard"); }} onBack={() => navigateTo("overview", "Dashboard")} />}
           </div>
        )}
      </main>
    </div>
  );
}
