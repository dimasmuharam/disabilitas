"use client";

import React, { useState, useEffect, useCallback } from "react";
import { supabase } from "@/lib/supabase";
import { 
  GraduationCap, Users, BarChart3, Settings, 
  ShieldCheck, Share2, LayoutDashboard,
  Activity, Award, Lock, 
  Zap, User, Timer, ExternalLink, School
} from "lucide-react";

// Import Modul Pendukung (Arahkan ke folder campus)
import TalentTracer from "./campus/talent-tracer";
import ProfileEditor from "./campus/profile-editor";
import AccountSettings from "./campus/account-settings";

export default function CampusDashboard({ user }: { user: any }) {
  const [activeTab, setActiveTab] = useState("overview");
  const [campus, setCampus] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [announcement, setAnnouncement] = useState("");
  const [profileCompletion, setProfileCompletion] = useState(0);

  // Terminologi khusus Perguruan Tinggi
  const labelTalent = "Mahasiswa";
  const labelAlumni = "Alumni Disabilitas";

  const fetchDashboardData = useCallback(async () => {
    if (!user?.id) return;
    setLoading(true);
    try {
      // AMBIL DATA KAMPUS: Statistik ditarik langsung dari kolom hasil Trigger SQL
      const { data: campusData, error } = await supabase
        .from("campuses")
        .select("*")
        .eq("id", user.id)
        .single();
      
      if (error || !campusData) return;
      setCampus(campusData);

      // Hitung kelengkapan profil (berdasarkan kolom di tabel campuses)
      const fields = ["name", "description", "location", "website", "nib_number"];
      const filled = fields.filter(f => campusData[f] && campusData[f].length > 0).length;
      const acc = (campusData.master_accommodations_provided?.length || 0) > 0 ? 1 : 0;
      setProfileCompletion(Math.round(((filled + acc) / (fields.length + 1)) * 100));

    } catch (e) { 
      console.error("Campus Dashboard Stats Fetch Error:", e); 
    } finally { 
      setLoading(false); 
    }
  }, [user?.id]);

  useEffect(() => { 
    fetchDashboardData(); 
    // Set Canonical Link
    const link = document.querySelector("link[rel='canonical']") || document.createElement("link");
    link.setAttribute("rel", "canonical");
    link.setAttribute("href", "https://disabilitas.com/dashboard/campus");
    if (!document.head.contains(link)) document.head.appendChild(link);
  }, [fetchDashboardData]);

  // Statistik Akademik & Tracer Study
  const currentStats = {
    total: Number(campus?.stats_academic_total || 0),
    hired: Number(campus?.stats_academic_hired || 0),
    rate: Number(campus?.stats_academic_total || 0) > 0 
      ? Math.round((Number(campus?.stats_academic_hired || 0) / Number(campus?.stats_academic_total || 0)) * 100) 
      : 0
  };

  const disMap = campus?.stats_disability_map || {};
  const genMap = campus?.stats_gender_map || { male: 0, female: 0 };

  const navigateTo = (tabId: string, label: string) => {
    setActiveTab(tabId);
    setAnnouncement(`Menampilkan halaman ${label}`);
    window.scrollTo(0, 0);
  };

  const shareCampusInclusion = () => {
    const caption = `[ACADEMIC REPORT] ${campus?.name} berkomitmen mendukung inklusivitas pendidikan. Saat ini kami mendampingi ${currentStats.total} mahasiswa disabilitas dengan tracer keterserapan ${currentStats.rate}% via disabilitas.com.`;
    if (navigator.share) {
      navigator.share({ title: campus?.name, text: caption, url: `https://disabilitas.com/campus/${campus?.id}` });
    } else {
      navigator.clipboard.writeText(caption);
      alert("Inclusion Report disalin ke clipboard!");
    }
  };

  if (loading) return (
    <div role="status" className="flex min-h-screen items-center justify-center font-black uppercase italic tracking-tighter text-slate-400 animate-pulse">
      <Activity className="mr-2 animate-spin" /> Sinkronisasi Data Almamater...
    </div>
  );

  return (
    <div className="mx-auto max-w-7xl space-y-10 px-4 py-10 text-slate-900">
      <div className="sr-only" aria-live="polite">{announcement}</div>

      {/* HEADER */}
      <header className="flex flex-col items-start justify-between gap-6 border-b-4 border-slate-900 pb-10 md:flex-row md:items-end">
        <div className="space-y-4 text-left">
          <div className="flex items-center gap-3">
            <div className="rounded-xl bg-emerald-600 p-2 text-white shadow-lg shadow-emerald-100">
              <School size={28} />
            </div>
            <div>
              <p className="text-[10px] font-black uppercase tracking-[0.3em] text-emerald-600 leading-none">University Portal</p>
              <h1 className="mt-1 text-4xl font-black uppercase italic tracking-tighter leading-none">{campus?.name}</h1>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <span className="flex items-center gap-1.5 rounded-full border-2 border-emerald-500 bg-emerald-50 px-4 py-1.5 text-[10px] font-black uppercase text-emerald-700">
              <ShieldCheck size={14} /> Skor Inklusi Kampus: {campus?.inclusion_score || 0}%
            </span>
            <div className="flex items-center gap-3 rounded-full border-2 border-slate-200 bg-white px-4 py-1.5 shadow-sm">
              <div className="h-2 w-24 overflow-hidden rounded-full bg-slate-100">
                <div className="h-full bg-emerald-600 transition-all duration-1000" style={{ width: `${profileCompletion}%` }} />
              </div>
              <span className="text-[10px] font-black uppercase text-slate-500 tracking-tighter">Profil: {profileCompletion}%</span>
            </div>
            <a href={`/campus/${campus?.id}`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 rounded-full border-2 border-slate-200 bg-white px-4 py-1.5 text-[10px] font-black uppercase text-slate-600 hover:border-slate-900 transition-all shadow-sm">
              <ExternalLink size={14} /> Lihat Profil Kampus
            </a>
          </div>
        </div>
        <div className="flex gap-3 w-full md:w-auto">
          <button onClick={() => navigateTo("tracer", "Tracer Study")} className="flex-1 md:flex-none rounded-2xl bg-slate-900 px-8 py-5 text-[11px] font-black uppercase italic text-white shadow-xl hover:bg-emerald-600 transition-all tracking-widest">
            Tracer Study
          </button>
          <button onClick={shareCampusInclusion} className="rounded-2xl border-2 border-slate-100 bg-white px-6 hover:border-slate-900 transition-all shadow-sm" aria-label="Bagikan Inclusion Card">
            <Share2 size={20} />
          </button>
        </div>
      </header>

      {/* NAV TABS */}
      <nav className="no-scrollbar flex gap-2 overflow-x-auto" role="tablist">
        {[
          { id: "overview", label: "Dashboard", icon: LayoutDashboard },
          { id: "tracer", label: "Talent Tracer", icon: BarChart3 },
          { id: "profile", label: "Profil Kampus", icon: Settings },
          { id: "account", label: "Pengaturan Akun", icon: Lock },
        ].map((tab) => (
          <button 
            key={tab.id} 
            onClick={() => navigateTo(tab.id, tab.label)} 
            className={`flex items-center gap-3 whitespace-nowrap rounded-2xl px-6 py-4 text-[10px] font-black uppercase transition-all ${activeTab === tab.id ? "bg-slate-900 text-white shadow-xl -translate-y-1" : "bg-white border-2 border-slate-100 text-slate-400 hover:border-slate-900 hover:text-slate-900"}`}
          >
            <tab.icon size={16} /> {tab.label}
          </button>
        ))}
      </nav>

      <main id="main-content" className="min-h-[600px]">
        {activeTab === "overview" && (
          <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* STATS CARDS */}
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4 text-left">
              <div className="rounded-[2.5rem] border-2 border-slate-100 bg-white p-8 shadow-sm">
                <p className="text-[9px] font-black uppercase tracking-widest text-slate-400">Total {labelTalent} Aktif</p>
                <p className="mt-1 text-5xl font-black tracking-tighter">{currentStats.total}</p>
              </div>
              <div className="rounded-[2.5rem] border-2 border-slate-100 bg-white p-8 shadow-sm">
                <p className="text-[9px] font-black italic uppercase tracking-widest text-emerald-500">{labelAlumni} Bekerja</p>
                <p className="mt-1 text-5xl font-black tracking-tighter text-emerald-600">{currentStats.hired}</p>
              </div>
              <div className="rounded-[2.5rem] border-2 border-slate-100 bg-white p-8 shadow-sm">
                <p className="text-[9px] font-black italic uppercase tracking-widest text-blue-500">Employment Rate</p>
                <p className="mt-1 text-5xl font-black tracking-tighter text-blue-600">{currentStats.rate}%</p>
              </div>
              <div className="rounded-[2.5rem] bg-emerald-700 p-8 text-white shadow-2xl flex flex-col justify-center">
                <p className="text-[9px] font-black uppercase tracking-widest opacity-60 italic">Academic Insight</p>
                <p className="text-3xl font-black italic tracking-tighter leading-tight mt-1 uppercase">University Analytics</p>
              </div>
            </div>

            {/* NARRATIVE SECTION */}
            <section className="rounded-[3rem] border-2 border-slate-100 bg-slate-50 p-10 text-left italic shadow-inner">
              <h3 className="mb-6 flex items-center gap-2 text-[11px] font-black uppercase tracking-widest text-emerald-600">
                <Award size={16} /> Laporan Perkembangan Akademik
              </h3>
              <div className="max-w-5xl space-y-6 text-xl font-medium leading-relaxed text-slate-800 md:text-2xl">
                <p>
                  Sebagai perguruan tinggi inklusif, <strong>{campus?.name}</strong> saat ini menaungi <strong>{currentStats.total} {labelTalent.toLowerCase()} disabilitas</strong> yang terdata di sistem. 
                  Spektrum disabilitas terbesar tercatat pada ragam <strong>{Object.entries(disMap).sort((a: any, b: any) => b[1] - a[1])[0]?.[0] || "..."}</strong>.
                </p>
                <p>
                  Melalui pemantauan karier, tercatat <strong>{currentStats.rate}%</strong> dari alumni disabilitas kami telah terserap di pasar kerja profesional, terdiri dari <strong>{genMap.male || 0} Mahasiswa</strong> dan <strong>{genMap.female || 0} Mahasiswi</strong>.
                </p>
              </div>
            </section>

            {/* ANALYTICS WIDGETS */}
            <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
              <div className="lg:col-span-2 grid grid-cols-1 gap-6 md:grid-cols-2 text-left">
                <div className="rounded-[2.5rem] border-2 border-slate-50 bg-white p-8 shadow-sm">
                  <h4 className="mb-6 flex items-center gap-2 text-[11px] font-black uppercase tracking-widest text-slate-900">
                    <Users className="text-emerald-600" size={16} /> Spektrum Disabilitas
                  </h4>
                  <div className="space-y-4">
                    {Object.entries(disMap).map(([type, count]: [string, any]) => (
                      <div key={type} className="space-y-1">
                        <div className="flex justify-between text-[9px] font-black uppercase text-slate-500">
                          <span>{type}</span><span>{count} Jiwa</span>
                        </div>
                        <div className="h-2 overflow-hidden rounded-full bg-slate-100">
                          <div className="h-full bg-emerald-600 transition-all duration-1000" style={{ width: `${(count / (currentStats.total || 1)) * 100}%` }} />
                        </div>
                      </div>
                    ))}
                    {Object.keys(disMap).length === 0 && <p className="text-[10px] font-black uppercase italic text-slate-300">Data sedang disinkronkan...</p>}
                  </div>
                </div>
                <div className="space-y-8 rounded-[2.5rem] border-2 border-slate-50 bg-white p-8 shadow-sm">
                  <div>
                    <h4 className="mb-4 flex items-center gap-2 text-[11px] font-black uppercase tracking-widest text-slate-900">
                      <User className="text-emerald-500" size={16} /> Rasio Gender
                    </h4>
                    <div className="flex gap-4">
                      <div className="flex-1 rounded-2xl bg-slate-50 p-4 border-l-4 border-emerald-500 text-left">
                        <p className="text-[8px] font-black uppercase text-slate-400">Laki-laki</p>
                        <p className="mt-1 text-xl font-black">{genMap.male || 0}</p>
                      </div>
                      <div className="flex-1 rounded-2xl bg-slate-50 p-4 border-l-4 border-pink-500 text-left">
                        <p className="text-[8px] font-black uppercase text-slate-400">Perempuan</p>
                        <p className="mt-1 text-xl font-black">{genMap.female || 0}</p>
                      </div>
                    </div>
                  </div>
                  <div className="rounded-2xl bg-emerald-50 p-5">
                    <h4 className="mb-2 flex items-center gap-2 text-[10px] font-black uppercase text-emerald-800">
                      <Timer size={14} /> Sinkronisasi Otomatis
                    </h4>
                    <p className="text-[9px] font-bold italic text-emerald-600 leading-tight">Data akademik ini terhubung langsung dengan profil talenta yang mencantumkan nama universitas Anda.</p>
                  </div>
                </div>
              </div>
              <div className="rounded-[2.5rem] bg-slate-900 p-10 text-left text-white shadow-2xl flex flex-col justify-between">
                <div>
                  <Zap className="mb-6 text-emerald-400" size={32} />
                  <p className="text-[10px] font-black uppercase tracking-[0.2em] opacity-70 italic leading-none">Inclusion Excellence</p>
                  <p className="mt-4 text-3xl font-black italic tracking-tighter uppercase leading-tight">Mewujudkan Kampus Ramah Disabilitas</p>
                </div>
                <div className="mt-8 border-t border-white/10 pt-4 text-left">
                   <p className="text-[9px] font-bold uppercase opacity-60">Verified Campus 2026</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB CONTENT RENDERER */}
        <div className="mt-2">
           {activeTab === "tracer" && <TalentTracer campusName={campus?.name} campusId={user.id} onBack={() => navigateTo("overview", "Dashboard")} />}
           {activeTab === "profile" && <ProfileEditor campus={campus} onUpdate={() => { fetchDashboardData(); navigateTo("overview", "Dashboard"); }} onBack={() => navigateTo("overview", "Dashboard")} />}
           {activeTab === "account" && <AccountSettings user={user} onBack={() => navigateTo("overview", "Dashboard")} />}
        </div>
      </main>
    </div>
  );
}
