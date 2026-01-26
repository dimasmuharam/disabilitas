"use client";

import React, { useState, useEffect, useCallback, useMemo, useRef } from "react";
import { supabase } from "@/lib/supabase";
import Link from "next/link";
import { 
  Users, BarChart3, Settings, ShieldCheck, Share2, LayoutDashboard,
  Activity, Zap, MousePointerClick, Sparkles, TrendingUp,
  Loader2, XCircle, Lock, Target, MessageSquareQuote, AlertCircle,
  Briefcase, GraduationCap, HeartHandshake, PieChart, RefreshCw
} from "lucide-react";
import { ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, Radar } from "recharts";

import TalentTracer from "./campus/talent-tracer";
import ProfileEditor from "./campus/profile-editor";
import AccountSettings from "./campus/account-settings";
import CareerSkillHub from "./campus/career-skill-hub";
import { shareNative } from "./campus/share-actions";

export default function CampusDashboard({ user }: { user: any }) {
  const [activeTab, setActiveTab] = useState("overview");
  const [campus, setCampus] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isSyncing, setIsSyncing] = useState(false);
  const [unverifiedCount, setUnverifiedCount] = useState(0);
  const [profileCompletion, setProfileCompletion] = useState({ percent: 0, missing: [] as string[] });

  const headingRef = useRef<HTMLHeadingElement>(null);

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
        
        const fields = [
            { key: 'name', label: 'Nama Kampus' },
            { key: 'description', label: 'Deskripsi' },
            { key: 'location', label: 'Lokasi' },
            { key: 'verification_document_link', label: 'Dokumen Verifikasi' }
        ];
        const missing = fields.filter(f => !campusData[f.key]).map(f => f.label);
        setProfileCompletion({ 
            percent: Math.round(((fields.length - missing.length) / fields.length) * 100),
            missing: missing
        });
      }

      const { count } = await supabase
        .from("campus_verifications")
        .select("*", { count: 'exact', head: true })
        .eq("campus_id", user.id)
        .eq("status", "pending");
      
      setUnverifiedCount(count || 0);

      if (campusData && !campusData.is_verified) setActiveTab("profile");
    } finally { 
      setLoading(false); 
    }
  }, [user?.id]);

  useEffect(() => { fetchDashboardData(); }, [fetchDashboardData]);

  // FITUR BARU: Paksa Hitung Ulang Skor Inklusi (Trigger v3)
  const handleRecalculate = async () => {
    setIsSyncing(true);
    try {
      // Trik dummy update untuk memicu trigger tr_process_eval_v3
      const { error } = await supabase
        .from("campus_evaluations")
        .update({ updated_at: new Date().toISOString() })
        .eq("campus_id", user.id);

      if (error) throw error;
      
      // Ambil data terbaru setelah trigger selesai bekerja
      await fetchDashboardData();
    } catch (err) {
      console.error("Sync Error:", err);
      alert("Gagal memperbarui skor. Pastikan data evaluasi sudah terisi.");
    } finally {
      setIsSyncing(false);
    }
  };

  const employabilityRate = useMemo(() => {
    if (!campus?.stats_academic_total || campus.stats_academic_total === 0) return 0;
    return Math.round((campus.stats_academic_hired / campus.stats_academic_total) * 100);
  }, [campus]);

  const inclusionNarration = useMemo(() => {
    const score = campus?.inclusion_score || 0;
    if (score >= 80) return "Kampus Anda merupakan pionir inklusivitas dengan fasilitas yang sangat memadai bagi disabilitas.";
    if (score >= 50) return "Kampus Anda telah menunjukkan komitmen inklusi yang baik, beberapa area digital masih dapat ditingkatkan.";
    return "Lengkapi data akomodasi untuk meningkatkan skor inklusi dan daya tarik bagi calon mahasiswa disabilitas.";
  }, [campus]);

  const radarData = useMemo(() => [
    { subject: 'Fisik', A: campus?.inclusion_score_physical || 0 },
    { subject: 'Digital', A: campus?.inclusion_score_digital || 0 },
    { subject: 'Output', A: campus?.inclusion_score_output || 0 },
  ], [campus]);

  const isVerified = campus?.is_verified;

  if (loading && !isSyncing) return (
    <div className="flex h-screen flex-col items-center justify-center bg-[#F8FAFC]" aria-busy="true">
      <Loader2 className="animate-spin text-emerald-600" size={48} />
      <p className="mt-4 font-black uppercase italic tracking-widest text-slate-400">Memuat Insights Riset...</p>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#F8FAFC] pb-20 text-left font-sans text-slate-900">
      <nav className="sticky top-0 z-40 border-b-4 border-slate-900 bg-white px-6 py-4 shadow-sm" role="navigation">
        <div className="mx-auto flex max-w-7xl items-center justify-between">
          <div className="flex items-center gap-3">
            <ShieldCheck className={isVerified ? "text-emerald-600" : "text-slate-300"} size={24} aria-hidden="true" />
            <h1 ref={headingRef} className="text-xl font-black uppercase italic tracking-tighter">
              {campus?.name || "Portal Institusi"}
            </h1>
          </div>
          {isVerified && (
            <div className="flex items-center gap-4">
                <button 
                  onClick={() => shareNative({ 
                      name: campus.name, 
                      url: `https://disabilitas.com/kampus/${campus.id}`,
                      total: campus.stats_academic_total,
                      rate: employabilityRate,
                      score: campus.inclusion_score || 0
                  })} 
                  aria-label="Bagikan profil riset kampus"
                  className="rounded-xl border-2 border-slate-900 p-2 transition-all hover:bg-slate-50"
                >
                    <Share2 size={18}/>
                </button>
                <Link href={`/kampus/${campus.id}`} target="_blank" className="border-b-2 border-slate-900 text-[10px] font-black uppercase italic">Publik Profil</Link>
            </div>
          )}
        </div>
      </nav>

      <div className="mx-auto max-w-7xl px-6 pt-10">
        <div className="grid gap-10 lg:grid-cols-[280px_1fr]">
          
          <aside className="space-y-6">
            <nav className="sticky top-24 flex flex-col gap-3" role="tablist">
              {isVerified ? (
                <>
                  {[
                    { id: "overview", label: "Overview", icon: LayoutDashboard },
                    { id: "hub", label: "Career Hub", icon: Zap },
                    { id: "tracer", label: "Verification", icon: BarChart3 },
                    { id: "profile", label: "Edit Profil", icon: Settings },
                    { id: "account", label: "Keamanan", icon: Lock },
                  ].map((tab) => (
                    <button 
                      key={tab.id} 
                      role="tab"
                      aria-selected={activeTab === tab.id}
                      onClick={() => setActiveTab(tab.id)} 
                      className={`flex items-center gap-4 rounded-2xl border-4 p-4 transition-all ${activeTab === tab.id ? '-translate-y-1 border-slate-900 bg-white shadow-[6px_6px_0px_0px_rgba(15,23,42,1)]' : 'border-transparent text-slate-400 hover:text-slate-600'}`}
                    >
                      <tab.icon size={20} className={activeTab === tab.id ? 'text-emerald-600' : ''} aria-hidden="true" />
                      <span className="text-sm font-black uppercase italic">{tab.label}</span>
                    </button>
                  ))}
                </>
              ) : (
                <div className="rounded-3xl border-4 border-dashed border-slate-200 bg-white p-8 text-center shadow-sm">
                  <Lock className="mx-auto mb-4 text-slate-300" size={32} />
                  <p className="text-[10px] font-black uppercase italic text-slate-400">Dashboard Terkunci</p>
                </div>
              )}

              <div className="mt-6 rounded-3xl border-4 border-slate-900 bg-white p-6 text-center shadow-[10px_10px_0px_0px_rgba(15,23,42,1)]">
                <p className="mb-4 text-[10px] font-black uppercase italic tracking-widest text-slate-400">Kesiapan Data</p>
                <div className="mb-2 text-2xl font-black text-emerald-600">{profileCompletion.percent}%</div>
                <div className="h-3 w-full overflow-hidden rounded-full border-2 border-slate-900 bg-slate-100">
                    <div className="h-full bg-emerald-500 transition-all duration-1000" style={{ width: `${profileCompletion.percent}%` }} />
                </div>
              </div>
            </nav>
          </aside>

          <main className="space-y-12">
            {!isVerified ? (
              <div className="space-y-8 animate-in fade-in">
                <div className="flex items-center gap-6 rounded-[3rem] border-4 border-amber-500 bg-amber-50 p-10 shadow-xl">
                    <AlertCircle className="text-amber-500" size={40} />
                    <div className="text-left text-amber-900">
                      <h2 className="text-2xl font-black uppercase italic leading-none tracking-tighter">Menunggu Validasi</h2>
                      <p className="text-sm font-bold italic opacity-80">Data akademik akan terbuka otomatis setelah verifikasi selesai.</p>
                    </div>
                </div>
                <ProfileEditor campus={campus} onUpdate={fetchDashboardData} onBack={() => {}} />
              </div>
            ) : (
              <div className="space-y-12 animate-in fade-in">
                {activeTab === "overview" && (
                  <>
                    <section className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
                        <div className="rounded-[2.5rem] border-4 border-slate-900 bg-white p-8 shadow-[8px_8px_0px_0px_rgba(15,23,42,1)]">
                            <div className="mb-2 flex items-center gap-2">
                                <Users size={16} className="text-slate-400" />
                                <p className="text-[9px] font-black uppercase italic text-slate-400">Talenta Terdaftar</p>
                            </div>
                            <p className="text-5xl font-black italic tracking-tighter text-slate-900">{campus?.stats_academic_total || 0}</p>
                        </div>
                        
                        <div className="rounded-[2.5rem] border-4 border-emerald-600 bg-emerald-50 p-8 shadow-[8px_8px_0px_0px_rgba(16,185,129,1)]">
                            <div className="mb-2 flex items-center gap-2">
                                <Briefcase size={16} className="text-emerald-600" />
                                <p className="text-[9px] font-black uppercase italic text-emerald-600">Sudah Bekerja</p>
                            </div>
                            <p className="text-5xl font-black italic tracking-tighter text-emerald-600">{campus?.stats_academic_hired || 0}</p>
                        </div>

                        <div className="rounded-[2.5rem] border-4 border-blue-600 bg-blue-50 p-8 shadow-[8px_8px_0px_0px_rgba(37,99,235,1)]">
                            <div className="mb-2 flex items-center gap-2">
                                <TrendingUp size={16} className="text-blue-600" />
                                <p className="text-[9px] font-black uppercase italic text-blue-600">Employability Rate</p>
                            </div>
                            <p className="text-5xl font-black italic tracking-tighter text-blue-600">{employabilityRate}%</p>
                        </div>

                        <div className="relative overflow-hidden rounded-[2.5rem] border-4 border-slate-900 bg-slate-900 p-8 text-white shadow-[8px_8px_0px_0px_rgba(15,23,42,1)]">
                            <div className="mb-2 flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <Sparkles size={16} className="text-emerald-400" />
                                    <p className="text-[9px] font-black uppercase italic text-emerald-400">Inclusion Score</p>
                                </div>
                                <button 
                                  onClick={handleRecalculate}
                                  disabled={isSyncing}
                                  className="group relative z-10 rounded-lg p-1.5 transition-all hover:bg-white/10 active:scale-90"
                                  title="Hitung ulang skor berdasarkan data terbaru"
                                >
                                  <RefreshCw size={14} className={`${isSyncing ? 'animate-spin text-emerald-400' : 'text-slate-500 group-hover:text-emerald-400'}`} />
                                </button>
                            </div>
                            <p className="text-5xl font-black italic tracking-tighter text-white">{campus?.inclusion_score || 0}</p>
                            {isSyncing && (
                              <div className="absolute inset-0 flex items-center justify-center bg-slate-900/40 backdrop-blur-[1px]">
                                <span className="animate-pulse text-[8px] font-black uppercase tracking-widest text-emerald-400">Recalculating...</span>
                              </div>
                            )}
                        </div>
                    </section>

                    <section className="grid grid-cols-1 gap-8 lg:grid-cols-2">
                        <div className="rounded-[3rem] border-4 border-slate-900 bg-white p-10 text-left shadow-[12px_12px_0px_0px_rgba(15,23,42,1)]">
                            <h3 className="mb-8 flex items-center gap-2 border-b pb-4 text-xs font-black uppercase tracking-widest text-slate-400">
                                <PieChart size={18}/> Proporsi Gender & Almamater
                            </h3>
                            <div className="space-y-8">
                                <div className="space-y-4">
                                    <div className="flex justify-between text-[10px] font-black uppercase italic">
                                        <span>Pria ({campus?.stats_gender_map?.male || 0})</span>
                                        <span>Wanita ({campus?.stats_gender_map?.female || 0})</span>
                                    </div>
                                    <div className="flex h-4 w-full overflow-hidden rounded-full border-2 border-slate-900 bg-slate-100">
                                        <div 
                                          style={{ width: `${(campus?.stats_gender_map?.male / (campus?.stats_academic_total || 1)) * 100}%` }} 
                                          className="h-full border-r-2 border-slate-900 bg-blue-500" 
                                        />
                                        <div className="h-full flex-1 bg-pink-500" />
                                    </div>
                                </div>
                                <p className="text-[11px] font-medium italic leading-relaxed text-slate-500">
                                    Data menunjukkan distribusi talenta yang terafiliasi secara resmi dengan institusi Anda di dalam sistem.
                                </p>
                            </div>
                        </div>

                        <div className="rounded-[3rem] border-4 border-slate-900 bg-white p-10 text-left shadow-[12px_12px_0px_0px_rgba(15,23,42,1)]">
                            <h3 className="mb-8 flex items-center gap-2 border-b pb-4 text-xs font-black uppercase tracking-widest text-slate-400">
                                <Activity size={18}/> Sebaran Ragam Disabilitas
                            </h3>
                            <div className="custom-scrollbar max-h-[140px] space-y-3 overflow-y-auto pr-4">
                                {Object.entries(campus?.stats_disability_map || {}).length > 0 ? (
                                    Object.entries(campus?.stats_disability_map || {}).map(([k,v]: any) => (
                                        <div key={k} className="group flex items-center justify-between">
                                            <span className="text-[10px] font-black uppercase text-slate-600 transition-colors group-hover:text-slate-900">{k}</span>
                                            <div className="flex items-center gap-3">
                                                <div className="hidden h-2 w-24 overflow-hidden rounded-full border border-slate-900 bg-slate-100 md:block">
                                                    <div style={{ width: `${(v / (campus?.stats_academic_total || 1)) * 100}%` }} className="h-full bg-emerald-400" />
                                                </div>
                                                <span className="text-xs font-black italic text-slate-900">{v}</span>
                                            </div>
                                        </div>
                                    ))
                                ) : <p className="text-xs italic text-slate-400">Belum ada talenta yang terdeteksi.</p>}
                            </div>
                        </div>
                    </section>

                    <div className="grid grid-cols-1 gap-8 lg:grid-cols-5">
                      <section className="flex flex-col items-center rounded-[3rem] border-4 border-slate-900 bg-white p-8 lg:col-span-2">
                        <h3 className="mb-4 flex items-center gap-2 text-[11px] font-black uppercase italic tracking-widest text-slate-400">
                           <Activity size={16}/> Index Pilar Inklusi
                        </h3>
                        <div className="h-[240px] w-full">
                          <ResponsiveContainer width="100%" height="100%">
                            <RadarChart data={radarData}>
                                <PolarGrid stroke="#f1f5f9" />
                                <PolarAngleAxis dataKey="subject" tick={{fontSize: 9, fontWeight: 900, fill: '#94a3b8'}} />
                                <Radar dataKey="A" stroke="#10b981" fill="#10b981" fillOpacity={0.6} />
                            </RadarChart>
                          </ResponsiveContainer>
                        </div>
                      </section>
                      
                      <section className="relative flex flex-col justify-between overflow-hidden rounded-[3.5rem] bg-slate-900 p-10 text-left text-white shadow-2xl lg:col-span-3">
                         <div className="relative z-10 space-y-6">
                            <div className="flex items-center gap-2">
                                <MessageSquareQuote size={20} className="text-emerald-400" />
                                <p className="text-[10px] font-black uppercase italic tracking-[0.2em] text-emerald-400">Insight Aksesibilitas</p>
                            </div>
                            <div className="space-y-4">
                                <h3 className="text-3xl font-black italic leading-tight tracking-tighter text-slate-100">
                                   {inclusionNarration}
                                </h3>
                                <p className="border-l-4 border-emerald-500 pl-4 text-sm font-medium italic leading-relaxed text-slate-400">
                                   {campus?.smart_narrative_summary || "Analisis mendalam terhadap data akomodasi kampus Anda sedang disiapkan oleh sistem pusat."}
                                </p>
                            </div>
                         </div>
                         <div className="relative z-10 mt-8 flex gap-4">
                            <div className="flex-1 rounded-2xl border-2 border-white/20 bg-white/5 p-4">
                                <div className="mb-1 flex items-center gap-2">
                                    <Target size={14} className="text-emerald-400"/>
                                    <p className="text-[9px] font-black uppercase text-emerald-400">Task Antrean</p>
                                </div>
                                <p className="text-xl font-black italic">{unverifiedCount} Verifikasi Pending</p>
                            </div>
                            <button 
                              onClick={() => setActiveTab("tracer")} 
                              className="flex items-center gap-2 rounded-2xl bg-emerald-500 px-8 text-xs font-black uppercase italic text-slate-900 shadow-lg transition-all hover:bg-white active:scale-95"
                            >
                               <MousePointerClick size={16}/> Proses Sekarang
                            </button>
                         </div>
                         <div className="absolute -bottom-10 -right-10 text-white opacity-10" aria-hidden="true"><TrendingUp size={240}/></div>
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