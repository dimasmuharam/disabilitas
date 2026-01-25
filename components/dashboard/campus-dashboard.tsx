"use client";

import React, { useState, useEffect, useCallback, useMemo, useRef } from "react";
import { supabase } from "@/lib/supabase";
import Link from "next/link";
import { 
  Users, BarChart3, Settings, ShieldCheck, Share2, LayoutDashboard,
  Activity, Zap, School, MousePointerClick, Briefcase, Sparkles, TrendingUp,
  ExternalLink, CheckCircle2, AlertCircle, Bell, Loader2, XCircle, Lock,
  ClipboardList, Target
} from "lucide-react";
import { ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, Radar } from "recharts";

// Modul Anak
import TalentTracer from "./campus/talent-tracer";
import ProfileEditor from "./campus/profile-editor";
import AccountSettings from "./campus/account-settings";
import CareerSkillHub from "./campus/career-skill-hub";
import { shareNative } from "./campus/share-actions";

export default function CampusDashboard({ user }: { user: any }) {
  const [activeTab, setActiveTab] = useState("overview");
  const [campus, setCampus] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [announcement, setAnnouncement] = useState("");
  const [profileCompletion, setProfileCompletion] = useState({ percent: 0, missing: [] as string[] });
  
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

  // LOGIKA AGREGASI LIVE: Mendeteksi Talent via String Matching Nama Universitas
  const fetchRealtimeAnalytics = useCallback(async (campusName: string) => {
    if (!campusName) return;
    const currentYear = new Date().getFullYear();

    try {
      // 1. Antrean Verifikasi (Data dari tabel jembatan)
      const { count: pending } = await supabase
        .from("campus_verifications")
        .select("*", { count: 'exact', head: true })
        .eq("campus_id", user.id)
        .eq("status", "pending");
      
      setUnverifiedCount(pending || 0);

      // 2. Scan Langsung Tabel Profiles (Mencari Talent yang mencantumkan nama kampus ini)
      const { data: allTalents } = await supabase
        .from("profiles")
        .select("gender, graduation_date, career_status, disability_type")
        .eq("university", campusName);

      if (allTalents) {
        const stats = allTalents.reduce((acc: any, p: any) => {
          acc.total++;
          if (p.gender === 'male') acc.male++;
          if (p.gender === 'female') acc.female++;
          
          if (p.disability_type) {
            acc.disabilityMap[p.disability_type] = (acc.disabilityMap[p.disability_type] || 0) + 1;
          }

          // Identifikasi Mahasiswa vs Alumni (Live Coding)
          if (p.graduation_date && Number(p.graduation_date) <= currentYear) {
            acc.alumni++;
            // Hitung Alumni Bekerja
            const workingStatus = ['Pegawai Swasta', 'Pegawai BUMN / BUMD', 'ASN (PNS / PPPK)', 'Wiraswasta / Entrepreneur', 'Freelancer / Tenaga Lepas'];
            if (workingStatus.includes(p.career_status)) acc.bekerja++;
          } else {
            acc.mahasiswa++;
          }

          return acc;
        }, { mahasiswa: 0, alumni: 0, bekerja: 0, male: 0, female: 0, disabilityMap: {}, total: 0 });

        setPlatformStats(stats);
      }
    } catch (err) {
      console.error("Live Analysis Error:", err);
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
        
        // Hitung Skor Kelengkapan
        const fields = [
            { key: 'name', label: 'Nama Kampus' },
            { key: 'description', label: 'Deskripsi' },
            { key: 'location', label: 'Lokasi' },
            { key: 'website', label: 'Website' },
            { key: 'nib_number', label: 'NIB/SK' },
            { key: 'verification_document_link', label: 'Dokumen Verifikasi' }
        ];
        const missing = fields.filter(f => !campusData[f.key]).map(f => f.label);
        const accBonus = (campusData.master_accommodations_provided?.length || 0) > 0 ? 1 : 0;
        setProfileCompletion({ 
            percent: Math.round(((fields.length - missing.length + accBonus) / (fields.length + 1)) * 100),
            missing: missing
        });

        if (!campusData.is_verified) setActiveTab("profile");
        
        // Jalankan Analitik Live berdasarkan Nama Kampus
        await fetchRealtimeAnalytics(campusData.name);
      }
    } finally { 
      setLoading(false); 
    }
  }, [user?.id, fetchRealtimeAnalytics]);

  useEffect(() => { fetchDashboardData(); }, [fetchDashboardData]);

  const radarData = useMemo(() => [
    { subject: 'Fisik', A: campus?.inclusion_score_physical || 0 },
    { subject: 'Digital', A: campus?.inclusion_score_digital || 0 },
    { subject: 'Output', A: campus?.inclusion_score_output || 0 },
  ], [campus]);

  const isVerified = campus?.is_verified;

  if (loading) return (
    <div className="flex h-screen flex-col items-center justify-center bg-[#F8FAFC]" role="status">
      <Loader2 className="animate-spin text-emerald-600" size={48} />
      <p className="mt-4 font-black uppercase italic tracking-widest text-slate-400">Menyinkronkan Data Riset...</p>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#F8FAFC] pb-20 font-sans text-slate-900 text-left">
      <div className="sr-only" aria-live="polite">{announcement}</div>

      {/* HEADER NAVBAR */}
      <nav className="sticky top-0 z-40 border-b-4 border-slate-900 bg-white px-6 py-4 shadow-sm">
        <div className="mx-auto flex max-w-7xl items-center justify-between">
          <div className="flex items-center gap-3">
            <ShieldCheck className={isVerified ? "text-emerald-600" : "text-slate-300"} size={24} />
            <h1 ref={headingRef} tabIndex={-1} className="text-xl font-black uppercase italic tracking-tighter outline-none">
              {campus?.name || "Portal Institusi"}
            </h1>
          </div>
          {isVerified && (
            <div className="flex gap-4 items-center">
                <button onClick={() => shareNative({ 
                    name: campus.name, 
                    url: `https://disabilitas.com/kampus/${campus.id}`,
                    total: platformStats.total,
                    rate: platformStats.alumni > 0 ? Math.round((platformStats.bekerja / platformStats.alumni) * 100) : 0,
                    score: campus.inclusion_score || 0
                })} className="p-2 rounded-xl border-2 border-slate-900 hover:bg-slate-50 transition-all">
                    <Share2 size={18}/>
                </button>
                <Link href={`/kampus/${campus.id}`} target="_blank" className="text-[10px] font-black uppercase italic border-b-2 border-slate-900">Lihat Profil Publik</Link>
            </div>
          )}
        </div>
      </nav>

      <div className="mx-auto max-w-7xl px-6 pt-10">
        <div className="grid gap-10 lg:grid-cols-[280px_1fr]">
          
          {/* SIDEBAR NAVIGATION */}
          <aside className="space-y-6">
            <nav className="sticky top-24 flex flex-col gap-3">
              {isVerified ? (
                <>
                  {[
                    { id: "overview", label: "Overview", icon: LayoutDashboard },
                    { id: "hub", label: "Career & Skill", icon: Zap },
                    { id: "tracer", label: "Talent Tracer", icon: BarChart3 },
                    { id: "profile", label: "Edit Profil", icon: Settings },
                    { id: "account", label: "Keamanan", icon: Lock },
                  ].map((tab) => (
                    <button key={tab.id} onClick={() => setActiveTab(tab.id)} className={`flex items-center gap-4 rounded-2xl border-4 p-4 transition-all ${activeTab === tab.id ? 'border-slate-900 bg-white shadow-[6px_6px_0px_0px_rgba(15,23,42,1)] -translate-y-1' : 'border-transparent text-slate-400 hover:text-slate-600'}`}>
                      <tab.icon size={20} className={activeTab === tab.id ? 'text-emerald-600' : ''} />
                      <span className="text-sm font-black uppercase italic tracking-tight">{tab.label}</span>
                    </button>
                  ))}
                </>
              ) : (
                <div className="rounded-3xl border-4 border-dashed border-slate-200 p-8 text-center bg-white">
                  <Lock className="mx-auto mb-4 text-slate-300" size={32} />
                  <p className="text-[10px] font-black uppercase italic text-slate-400 leading-relaxed">Fitur Terkunci <br/> Menunggu Verifikasi</p>
                </div>
              )}

              {/* SIDEBAR WIDGET: PROGRESS */}
              <div className="rounded-3xl border-4 border-slate-900 bg-white p-6 shadow-[10px_10px_0px_0px_rgba(15,23,42,1)] mt-6">
                <p className="text-[10px] font-black uppercase text-slate-400 mb-4 tracking-widest text-center italic">Kesiapan Data</p>
                <div className="flex items-center justify-center mb-2 font-black text-2xl text-emerald-600">
                    {profileCompletion.percent}%
                </div>
                <div className="h-3 w-full bg-slate-100 border-2 border-slate-900 rounded-full overflow-hidden">
                    <div className="h-full bg-emerald-500 transition-all duration-1000" style={{ width: `${profileCompletion.percent}%` }} />
                </div>
                {profileCompletion.missing.length > 0 && (
                   <div className="mt-4 space-y-1">
                      <p className="text-[8px] font-black text-slate-400 uppercase">Data Kurang:</p>
                      {profileCompletion.missing.slice(0,2).map(m => (
                        <p key={m} className="text-[8px] font-bold text-rose-500 uppercase flex items-center gap-1"><AlertCircle size={8}/> {m}</p>
                      ))}
                   </div>
                )}
              </div>
            </nav>
          </aside>

          {/* MAIN CONTENT AREA */}
          <main className="space-y-12">
            {!isVerified ? (
              /* --- DASHBOARD LOCKDOWN MODE --- */
              <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4">
                {campus?.verification_status === 'rejected' ? (
                  <div className="flex items-center gap-6 rounded-[2.5rem] border-4 border-rose-500 bg-rose-50 p-10 shadow-xl transition-all">
                    <XCircle className="text-rose-500 shrink-0" size={40} />
                    <div className="space-y-2">
                      <h2 className="text-2xl font-black uppercase italic tracking-tighter text-rose-900 leading-none">Verifikasi Ditolak</h2>
                      <p className="text-sm font-bold leading-relaxed text-rose-800">Alasan: {campus?.admin_notes || "Dokumen belum sesuai standar."}</p>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center gap-6 rounded-[3rem] border-4 border-amber-500 bg-amber-50 p-10 shadow-xl transition-all">
                    <AlertCircle className="text-amber-500 shrink-0" size={40} />
                    <div className="space-y-2 text-amber-900">
                      <h2 className="text-2xl font-black uppercase italic tracking-tighter leading-none">Menunggu Verifikasi</h2>
                      <p className="text-sm font-bold leading-relaxed opacity-80 italic">Lengkapi profil untuk membuka fitur Database Talenta dan Skill Hub.</p>
                    </div>
                  </div>
                )}
                <ProfileEditor campus={campus} onUpdate={fetchDashboardData} onBack={() => {}} />
              </div>
            ) : (
              /* --- DASHBOARD VERIFIED MODE --- */
              <div className="space-y-12 animate-in fade-in">
                {activeTab === "overview" && (
                  <>
                    {/* STATS: COMPARISON CLAIMS VS LIVE */}
                    <section className="space-y-6">
                        <div className="flex items-center gap-3">
                            <ClipboardList className="text-blue-600" size={20}/>
                            <h2 className="text-sm font-black uppercase italic tracking-widest text-slate-400 border-b-2 border-slate-100 pb-2 flex-1">Integrasi Validitas Data Akademik</h2>
                        </div>
                        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
                            <div className="rounded-[2.5rem] border-4 border-slate-100 bg-white p-8">
                                <p className="text-[9px] font-black uppercase text-slate-400 mb-2 italic">Total Mhs (Klaim)</p>
                                <p className="text-4xl font-black italic tracking-tighter text-slate-400">{campus?.stats_academic_total || 0}</p>
                            </div>
                            <div className="rounded-[2.5rem] border-4 border-slate-100 bg-white p-8">
                                <p className="text-[9px] font-black uppercase text-slate-400 mb-2 italic">Bekerja (Klaim)</p>
                                <p className="text-4xl font-black italic tracking-tighter text-slate-400">{campus?.stats_academic_hired || 0}</p>
                            </div>
                            <div className="rounded-[2.5rem] border-4 border-blue-600 bg-white p-8 shadow-[8px_8px_0px_0px_rgba(37,99,235,1)]">
                                <p className="text-[9px] font-black uppercase text-blue-600 mb-2 flex items-center gap-1 italic"><Zap size={10}/> Total Mhs (Live)</p>
                                <p className="text-4xl font-black italic tracking-tighter text-slate-900">{platformStats.mahasiswa}</p>
                            </div>
                            <div className="rounded-[2.5rem] border-4 border-emerald-600 bg-white p-8 shadow-[8px_8px_0px_0px_rgba(16,185,129,1)]">
                                <p className="text-[9px] font-black uppercase text-emerald-600 mb-2 flex items-center gap-1 italic"><Target size={10}/> Bekerja (Live)</p>
                                <p className="text-4xl font-black italic tracking-tighter text-slate-900">{platformStats.bekerja}</p>
                            </div>
                        </div>
                    </section>

                    {/* STATS: PROPORTIONS */}
                    <section className="grid grid-cols-1 gap-8 lg:grid-cols-2">
                        <div className="rounded-[3rem] border-4 border-slate-900 bg-white p-10 shadow-[12px_12px_0px_0px_rgba(15,23,42,1)]">
                            <h3 className="text-[10px] font-black uppercase text-slate-400 mb-8 tracking-widest border-b pb-4 italic">Proporsi Gender (Platform)</h3>
                            <div className="grid grid-cols-2 gap-8 text-center">
                                <div>
                                    <p className="text-5xl font-black text-blue-600 italic leading-none">{platformStats.male}</p>
                                    <p className="text-[10px] font-black uppercase mt-3 tracking-tighter">Laki-Laki</p>
                                </div>
                                <div>
                                    <p className="text-5xl font-black text-pink-500 italic leading-none">{platformStats.female}</p>
                                    <p className="text-[10px] font-black uppercase mt-3 tracking-tighter">Perempuan</p>
                                </div>
                            </div>
                        </div>
                        <div className="rounded-[3rem] border-4 border-slate-900 bg-white p-10 shadow-[12px_12px_0px_0px_rgba(15,23,42,1)]">
                            <h3 className="text-[10px] font-black uppercase text-slate-400 mb-8 tracking-widest border-b pb-4 italic">Ragam Disabilitas (Platform)</h3>
                            <div className="max-h-[100px] overflow-y-auto custom-scrollbar pr-3 space-y-3">
                                {Object.entries(platformStats.disabilityMap).length > 0 ? (
                                    Object.entries(platformStats.disabilityMap).map(([k,v]) => (
                                        <div key={k} className="flex justify-between text-[10px] font-black uppercase border-b border-slate-50 pb-2">
                                            <span className="truncate max-w-[200px]">{k}</span>
                                            <span className="text-blue-600 font-black">{v}</span>
                                        </div>
                                    ))
                                ) : <p className="text-xs italic text-slate-400">Belum ada talenta terafiliasi.</p>}
                            </div>
                        </div>
                    </section>

                    {/* RADAR & QUEUE */}
                    <div className="grid grid-cols-1 gap-8 lg:grid-cols-5">
                      <section className="rounded-[3rem] border-4 border-slate-900 bg-white p-8 lg:col-span-2">
                        <h3 className="mb-6 flex items-center gap-2 text-[11px] font-black uppercase text-slate-400 tracking-widest"><Activity size={16}/> Index Pilar Inklusi</h3>
                        <div className="h-[220px] w-full">
                          <ResponsiveContainer width="100%" height="100%">
                            <RadarChart data={radarData}>
                                <PolarGrid stroke="#f1f5f9" />
                                <PolarAngleAxis dataKey="subject" tick={{fontSize: 9, fontWeight: 900, fill: '#94a3b8'}} />
                                <Radar dataKey="A" stroke="#10b981" fill="#10b981" fillOpacity={0.6} />
                            </RadarChart>
                          </ResponsiveContainer>
                        </div>
                      </section>
                      <section className="rounded-[3.5rem] bg-slate-900 p-10 text-white shadow-2xl lg:col-span-3 flex flex-col justify-between">
                         <div className="space-y-4">
                            <p className="text-emerald-400 font-black uppercase text-[10px] tracking-[0.2em] flex items-center gap-2 italic"><Sparkles size={16}/> Snapshot Strategis</p>
                            <h3 className="text-3xl font-black italic tracking-tighter leading-none">
                                Terdeteksi <span className="text-emerald-400">{unverifiedCount} Mahasiswa</span> baru menunggu verifikasi ijazah/status almamater.
                            </h3>
                         </div>
                         <button onClick={() => setActiveTab("tracer")} className="w-full bg-emerald-500 py-6 rounded-2xl text-slate-900 font-black uppercase italic tracking-widest shadow-xl hover:bg-white transition-all flex items-center justify-center gap-3 active:scale-95">
                            <MousePointerClick size={20}/> Proses Antrean Sekarang
                         </button>
                      </section>
                    </div>
                  </>
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