"use client";

import React, { useState, useEffect, useCallback, useMemo, useRef } from "react";
import { supabase } from "@/lib/supabase";
import { 
  Users, BarChart3, Settings, 
  ShieldCheck, Share2, LayoutDashboard,
  Activity, Award, Lock, 
  Zap, User, School,
  MousePointerClick, Briefcase, Sparkles, TrendingUp,
  ExternalLink, ChevronRight, CheckCircle2,
  Medal, Eye, AlertCircle, PieChart, Bell, Loader2
} from "lucide-react";
import { ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, Radar } from "recharts";

// Import Modul Pendukung
import TalentTracer from "./campus/talent-tracer";
import ProfileEditor from "./campus/profile-editor";
import AccountSettings from "./campus/account-settings";
import CareerSkillHub from "./campus/career-skill-hub";
import { shareToWhatsApp, shareNative } from "./campus/share-actions";

export default function CampusDashboard({ user }: { user: any }) {
  const [activeTab, setActiveTab] = useState("overview");
  const [campus, setCampus] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [announcement, setAnnouncement] = useState("");
  const [profileCompletion, setProfileCompletion] = useState(0);
  
  // STATE DATA REAL-TIME PLATFORM
  const [unverifiedCount, setUnverifiedCount] = useState(0);
  const [platformStats, setPlatformStats] = useState({
    mahasiswa: 0,
    alumni: 0,
    bekerja: 0,
    male: 0,
    female: 0,
    disabilityMap: {} as Record<string, number>,
    total: 0
  });

  const headingRef = useRef<HTMLHeadingElement>(null);
  const labelTalent = "Mahasiswa";
  const labelAlumni = "Alumni Disabilitas";

  const fetchRealtimeData = useCallback(async () => {
    if (!user?.id) return;
    const currentYear = new Date().getFullYear();

    try {
      const { count: pending } = await supabase
        .from("campus_verifications")
        .select("*", { count: 'exact', head: true })
        .eq("campus_id", user.id)
        .eq("status", "pending");
      
      setUnverifiedCount(pending || 0);

      const { data: verifiedTalents } = await supabase
        .from("campus_verifications")
        .select(`
          profile_id,
          profiles (
            gender,
            graduation_date,
            career_status,
            disability_type
          )
        `)
        .eq("campus_id", user.id)
        .eq("status", "verified");

      if (verifiedTalents) {
        const stats = verifiedTalents.reduce((acc: any, item: any) => {
          const p = item.profiles;
          if (!p) return acc;

          acc.total++;
          if (p.gender === 'male') acc.male++;
          if (p.gender === 'female') acc.female++;
          if (p.disability_type) {
            acc.disabilityMap[p.disability_type] = (acc.disabilityMap[p.disability_type] || 0) + 1;
          }
          if (p.graduation_date && Number(p.graduation_date) <= currentYear) {
            acc.alumni++;
          } else {
            acc.mahasiswa++;
          }
          const workingStatus = ['Pegawai Swasta', 'Pegawai BUMN / BUMD', 'ASN (PNS / PPPK)', 'Wiraswasta / Entrepreneur', 'Freelancer / Tenaga Lepas'];
          if (workingStatus.includes(p.career_status)) acc.bekerja++;

          return acc;
        }, { mahasiswa: 0, alumni: 0, bekerja: 0, male: 0, female: 0, disabilityMap: {}, total: 0 });

        setPlatformStats(stats);
      }
    } catch (err) {
      console.error("Realtime fetch error:", err);
    }
  }, [user?.id]);

  const fetchDashboardData = useCallback(async () => {
    if (!user?.id) return;
    setLoading(true);
    try {
      const { data: campusData } = await supabase
        .from("campuses")
        .select("*")
        .eq("id", user.id)
        .single();
      
      if (campusData) {
        setCampus(campusData);
        const fields = ["name", "description", "location", "website", "nib_number"];
        const filled = fields.filter(f => campusData[f] && campusData[f].length > 0).length;
        const acc = (campusData.master_accommodations_provided?.length || 0) > 0 ? 1 : 0;
        setProfileCompletion(Math.round(((filled + acc) / (fields.length + 1)) * 100));

        // Forced redirect jika belum verified
        if (!campusData.is_verified) {
          setActiveTab("profile");
        }
      }
      await fetchRealtimeData();
    } finally { 
      setLoading(false); 
    }
  }, [user?.id, fetchRealtimeData]);

  useEffect(() => { 
    fetchDashboardData(); 
    const channel = supabase
      .channel('realtime_campus_verifications')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'campus_verifications', filter: `campus_id=eq.${user.id}` }, () => fetchRealtimeData())
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [user?.id, fetchDashboardData, fetchRealtimeData]);

  useEffect(() => {
    if (headingRef.current) headingRef.current.focus();
  }, [activeTab]);

  const dynamicNarrative = useMemo(() => {
    const rate = platformStats.alumni > 0 ? Math.round((platformStats.bekerja / platformStats.alumni) * 100) : 0;
    if (rate > 70) return `Luar biasa! Tingkat keterserapan alumni Anda mencapai ${rate}%. Fokus pada penguatan pilar Digital untuk mempertahankan performa.`;
    if (rate > 40) return `Performa cukup stabil (${rate}%). Disarankan meningkatkan kemitraan dengan sektor swasta untuk alumni yang belum bekerja.`;
    return `Tantangan terdeteksi. Hanya ${rate}% alumni yang terserap kerja. ULD perlu mengintensifkan program Career Hub dan Skill Hub.`;
  }, [platformStats]);

  const radarData = useMemo(() => [
    { subject: 'Fisik', A: campus?.inclusion_score_physical || 0 },
    { subject: 'Digital', A: campus?.inclusion_score_digital || 0 },
    { subject: 'Output', A: campus?.inclusion_score_output || 0 },
  ], [campus]);

  const isVerified = campus?.is_verified;

  const navigateTo = (tabId: string, label: string) => {
    setActiveTab(tabId);
    setAnnouncement(`Halaman ${label} dimuat`);
    window.scrollTo(0, 0);
  };

  if (loading) return (
    <div role="status" className="flex min-h-screen flex-col items-center justify-center bg-[#F8FAFC]">
      <Loader2 className="mb-4 animate-spin text-emerald-600" size={48} />
      <p className="font-black uppercase italic tracking-widest text-slate-400">Sinkronisasi Portal Akademik...</p>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#F8FAFC] pb-20 font-sans text-slate-900">
      <div className="sr-only" aria-live="assertive">{announcement}</div>

      {/* TOP UTILITY BAR */}
      <nav className="sticky top-0 z-40 flex items-center justify-between border-b-4 border-slate-900 bg-white px-6 py-3 shadow-sm" aria-label="Navigasi Atas">
        <div className="flex items-center gap-2">
          <ShieldCheck className={isVerified ? "text-emerald-600" : "text-slate-400"} size={20} />
          <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">
            {isVerified ? `Portal Akademik Inklusi • ${campus?.location}` : "Verifikasi Identitas Kampus Diperlukan"}
          </span>
        </div>
        
        <div className="flex items-center gap-4">
          <button className="rounded-full p-2 text-slate-400 hover:bg-slate-100" aria-label="Notifikasi">
            <Bell size={20} />
          </button>
          {isVerified && (
            <a href={`/kampus/${campus?.id}`} target="_blank" className="flex items-center gap-2 rounded-xl border-2 border-slate-900 bg-white px-4 py-1.5 text-[10px] font-black uppercase italic shadow-[4px_4px_0px_0px_rgba(15,23,42,1)] transition-all hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-none">
              <Eye size={14} /> Profil Publik
            </a>
          )}
        </div>
      </nav>

      <div className="mx-auto max-w-7xl px-6 pt-10">
        
        {/* HEADER SECTION */}
        <header className="mb-12 flex flex-col items-start justify-between gap-8 lg:flex-row lg:items-end">
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="rounded-2xl bg-emerald-600 p-3 text-white shadow-lg"><School size={32} /></div>
              <div>
                <h1 ref={headingRef} tabIndex={-1} className="text-4xl font-black uppercase italic leading-none tracking-tighter outline-none md:text-5xl">
                  {isVerified ? campus?.name : "Validasi Institusi"}
                </h1>
                <p className="mt-2 text-xs font-bold uppercase tracking-[0.2em] text-slate-400">
                  {isVerified ? `Skor Inklusi: ${campus?.inclusion_score || 0}` : "Lengkapi profil untuk membuka fitur dashboard"}
                </p>
              </div>
            </div>
          </div>

          {isVerified && (
            <div className="flex gap-3">
              <button onClick={() => navigateTo("hub", "Career Hub")} className="flex items-center gap-3 rounded-[2rem] bg-slate-900 px-8 py-5 text-[11px] font-black uppercase italic tracking-widest text-white shadow-xl transition-all hover:bg-emerald-600">
                <Briefcase size={18} /> Career Hub
              </button>
<button 
  onClick={() => shareNative({ 
    name: campus?.name, 
    score: campus?.inclusion_score || 0, 
    url: `https://disabilitas.com/kampus/${campus?.id}`,
    total: Number(campus?.stats_academic_total || 0), // Tambahkan ini
    rate: campus?.stats_academic_total > 0 
      ? Math.round((campus.stats_academic_hired / campus.stats_academic_total) * 100) 
      : 0 // Tambahkan ini
  })} 
  className="rounded-2xl border-4 border-slate-900 bg-white px-6 shadow-[4px_4px_0px_0px_rgba(15,23,42,1)] transition-all hover:shadow-none"
>
  <Share2 size={20} />
</button>
            </div>
          )}
        </header>

        <div className="grid gap-10 lg:grid-cols-[280px_1fr]">
          {/* SIDEBAR NAVIGATION */}
          <aside className="space-y-6">
            <nav className="sticky top-24 flex flex-col gap-3" role="tablist">
              {isVerified ? (
                <>
                  {[
                    { id: "overview", label: "Overview", icon: LayoutDashboard },
                    { id: "hub", label: "Career & Skill", icon: Zap },
                    { id: "tracer", label: "Talent Tracer", icon: BarChart3 },
                    { id: "profile", label: "Edit Profil", icon: Settings },
                    { id: "account", label: "Keamanan", icon: Lock },
                  ].map((tab) => (
                    <button 
                      key={tab.id}
                      role="tab"
                      aria-selected={activeTab === tab.id}
                      onClick={() => navigateTo(tab.id, tab.label)}
                      className={`group flex items-center gap-4 rounded-2xl border-4 p-4 outline-none transition-all ${activeTab === tab.id ? 'border-slate-900 bg-white shadow-[6px_6px_0px_0px_rgba(15,23,42,1)] -translate-y-1' : 'border-transparent text-slate-400 hover:text-slate-600'}`}
                    >
                      <tab.icon size={20} className={activeTab === tab.id ? 'text-emerald-600' : ''} />
                      <span className="text-sm font-black uppercase italic tracking-tight">{tab.label}</span>
                    </button>
                  ))}
                </>
              ) : (
                <div className="rounded-[2.5rem] border-4 border-dashed border-slate-200 p-8 text-center">
                  <Lock className="mx-auto mb-4 text-slate-300" size={40} />
                  <p className="text-[10px] font-black uppercase italic leading-relaxed text-slate-400">
                    Fitur Analitik & Tracer akan terbuka setelah verifikasi selesai.
                  </p>
                </div>
              )}
            </nav>
          </aside>

          {/* MAIN CONTENT */}
          <main className="min-h-[60vh]">
            {!isVerified ? (
              <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4">
                {/* REJECTION / PENDING ALERT */}
                <div className={`flex items-center gap-6 rounded-[3rem] border-4 p-10 shadow-[12px_12px_0px_0px_rgba(0,0,0,0.1)] ${campus?.verification_status === 'rejected' ? 'border-rose-500 bg-rose-50' : 'border-amber-500 bg-amber-50'}`}>
                  <div className={`flex size-20 shrink-0 items-center justify-center rounded-2xl text-white shadow-lg ${campus?.verification_status === 'rejected' ? 'bg-rose-500' : 'bg-amber-500'}`}>
                    <AlertCircle size={40} />
                  </div>
                  <div className="space-y-2">
                    <h2 className={`text-2xl font-black uppercase italic tracking-tighter ${campus?.verification_status === 'rejected' ? 'text-rose-900' : 'text-amber-900'}`}>
                      {campus?.verification_status === 'rejected' ? "Verifikasi Ditolak" : "Menunggu Verifikasi"}
                    </h2>
                    <p className="text-sm font-bold leading-relaxed opacity-80 text-slate-800">
                      {campus?.admin_notes || "Unggah berkas resmi universitas (SK/NIB) pada form di bawah ini agar Admin dapat memvalidasi identitas almamater Anda."}
                    </p>
                  </div>
                </div>

                <ProfileEditor campus={campus} onUpdate={fetchDashboardData} onBack={() => {}} />
              </div>
            ) : (
              <div className="animate-in fade-in duration-500">
                {activeTab === "overview" && (
                  <div className="space-y-10">
                    {/* RADAR & INSIGHT */}
                    <div className="grid grid-cols-1 gap-8 lg:grid-cols-5">
                      <section className="rounded-[3rem] border-4 border-slate-900 bg-white p-8 shadow-[8px_8px_0px_0px_rgba(0,0,0,0.05)] lg:col-span-2">
                        <h3 className="mb-6 flex items-center gap-2 text-[11px] font-black uppercase tracking-widest text-slate-400">
                          <Activity size={16} className="text-emerald-500" /> Keseimbangan Pilar
                        </h3>
                        <div className="h-[220px] w-full" role="img" aria-label="Radar Chart Inklusi">
                          <ResponsiveContainer width="100%" height="100%">
                            <RadarChart data={radarData}>
                              <PolarGrid stroke="#f1f5f9" />
                              <PolarAngleAxis dataKey="subject" tick={{ fill: '#94a3b8', fontSize: 9, fontWeight: 800 }} />
                              <Radar dataKey="A" stroke="#10b981" fill="#10b981" fillOpacity={0.6} />
                            </RadarChart>
                          </ResponsiveContainer>
                        </div>
                      </section>

                      <section className="flex flex-col justify-center rounded-[3rem] border-4 border-slate-900 bg-slate-900 p-10 text-white shadow-[12px_12px_0px_0px_rgba(16,185,129,0.2)] lg:col-span-3">
                        <h3 className="mb-4 flex items-center gap-2 text-[11px] font-black uppercase tracking-widest text-emerald-400">
                          <Sparkles size={18} /> Insight Strategis
                        </h3>
                        <p className="text-2xl font-black italic leading-tight tracking-tighter md:text-3xl">
                          &quot;{dynamicNarrative}&quot;
                        </p>
                      </section>
                    </div>

                    {/* STATS CARDS */}
                    <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
                      <section className="rounded-[2.5rem] border-4 border-slate-100 bg-white p-10 shadow-sm">
                        <h4 className="mb-6 flex items-center gap-2 text-xs font-black uppercase tracking-[0.2em] text-slate-400">Data Internal</h4>
                        <div className="grid grid-cols-2 gap-8">
                          <div>
                            <p className="text-[10px] font-black uppercase text-slate-400">Mahasiswa</p>
                            <p className="text-5xl font-black tracking-tighter">{campus?.stats_academic_total || 0}</p>
                          </div>
                          <div>
                            <p className="text-[10px] font-black uppercase text-slate-400">Alumni Bekerja</p>
                            <p className="text-5xl font-black tracking-tighter text-emerald-600">{campus?.stats_academic_hired || 0}</p>
                          </div>
                        </div>
                      </section>

                      <section className="rounded-[2.5rem] border-4 border-emerald-600 bg-emerald-50 p-10 shadow-[8px_8px_0px_0px_rgba(16,185,129,1)]">
                        <h4 className="mb-6 flex items-center gap-2 text-xs font-black uppercase tracking-[0.2em] text-emerald-700"><Zap size={16} /> Verified Platform</h4>
                        <div className="grid grid-cols-3 gap-4">
                          <div><p className="text-[9px] font-black uppercase text-emerald-600">Terdaftar</p><p className="text-4xl font-black">{platformStats.mahasiswa}</p></div>
                          <div><p className="text-[9px] font-black uppercase text-emerald-600">Alumni</p><p className="text-4xl font-black">{platformStats.alumni}</p></div>
                          <div><p className="text-[9px] font-black uppercase text-emerald-600">Bekerja</p><p className="text-4xl font-black text-blue-600">{platformStats.bekerja}</p></div>
                        </div>
                      </section>
                    </div>

                    {/* TRACER CTA */}
                    <section className="relative flex flex-col items-center justify-between gap-8 overflow-hidden rounded-[2.5rem] bg-slate-900 p-10 text-white shadow-2xl md:flex-row">
                      <div className="relative z-10 space-y-2">
                        <p className="text-xs font-black uppercase tracking-widest text-emerald-400">Verifikasi Almamater</p>
                        <h4 className="text-3xl font-black uppercase italic tracking-tight">{unverifiedCount} Antrean Mahasiswa</h4>
                      </div>
                      <button onClick={() => navigateTo("tracer", "Talent Tracer")} className="relative z-10 rounded-2xl bg-emerald-500 px-10 py-5 font-black uppercase italic text-slate-900 shadow-xl transition-all hover:bg-white">
                        Proses Sekarang <MousePointerClick size={18} className="ml-2 inline" />
                      </button>
                      <School className="absolute -bottom-10 -right-10 opacity-10" size={250} />
                    </section>
                  </div>
                )}

                {activeTab === "hub" && <CareerSkillHub campusName={campus?.name} campusId={user.id} />}
                {activeTab === "tracer" && <TalentTracer campusName={campus?.name} campusId={user.id} onBack={() => setActiveTab("overview")} />}
                {activeTab === "profile" && <ProfileEditor campus={campus} onUpdate={fetchDashboardData} onBack={() => setActiveTab("overview")} />}
                {activeTab === "account" && <AccountSettings user={user} onBack={() => setActiveTab("overview")} />}
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  );
}