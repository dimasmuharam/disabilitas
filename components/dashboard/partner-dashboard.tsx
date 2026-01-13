"use client";

import React, { useState, useEffect, useCallback } from "react";
import { supabase } from "@/lib/supabase";
import { 
  Users, BookOpen, BarChart3, Settings, 
  ShieldCheck, Share2, LayoutDashboard,
  Activity, Award, Lock, 
  Zap, User, Timer, ExternalLink, GraduationCap
} from "lucide-react";

// Import Modul Pendukung (Arahkan ke folder partner)
import ProgramManager from "./partner/program-manager";
import TalentTracer from "./partner/talent-tracer";
import ProfileEditor from "./partner/profile-editor";
import AccountSettings from "./partner/account-settings";

export default function PartnerDashboard({ user }: { user: any }) {
  const [activeTab, setActiveTab] = useState("overview");
  const [partner, setPartner] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [announcement, setAnnouncement] = useState("");
  const [profileCompletion, setProfileCompletion] = useState(0);

  // Penamaan tetap untuk Portal Mitra Pelatihan
  const labelTalent = "Peserta Pelatihan";
  const labelAlumni = "Lulusan Terampil";

  const fetchDashboardData = useCallback(async () => {
    if (!user?.id) return;
    setLoading(true);
    try {
      // AMBIL DATA PARTNER: Statistik ditarik langsung dari kolom hasil Trigger SQL
      const { data: partnerData, error } = await supabase
        .from("partners")
        .select("*")
        .eq("id", user.id)
        .single();
      
      if (error || !partnerData) return;
      setPartner(partnerData);

      // Hitung kelengkapan profil secara dinamis (tanpa kolom category)
      const fields = ["name", "description", "location", "website", "nib_number"];
      const filled = fields.filter(f => partnerData[f] && partnerData[f].length > 0).length;
      const acc = (partnerData.master_accommodations_provided?.length || 0) > 0 ? 1 : 0;
      setProfileCompletion(Math.round(((filled + acc) / (fields.length + 1)) * 100));

    } catch (e) { 
      console.error("Partner Dashboard Stats Fetch Error:", e); 
    } finally { 
      setLoading(false); 
    }
  }, [user?.id]);

  useEffect(() => { 
    fetchDashboardData(); 
    // Set Canonical Link secara dinamis
    const link = document.querySelector("link[rel='canonical']") || document.createElement("link");
    link.setAttribute("rel", "canonical");
    link.setAttribute("href", "https://disabilitas.com/dashboard/partner");
    if (!document.head.contains(link)) document.head.appendChild(link);
  }, [fetchDashboardData]);

  // Ekstraksi data statistik (Impact Mode)
  const currentStats = {
    total: Number(partner?.stats_impact_total || 0),
    hired: Number(partner?.stats_impact_hired || 0),
    rate: Number(partner?.stats_impact_total || 0) > 0 
      ? Math.round((Number(partner?.stats_impact_hired || 0) / Number(partner?.stats_impact_total || 0)) * 100) 
      : 0
  };

  const disMap = partner?.stats_disability_map || {};
  const genMap = partner?.stats_gender_map || { male: 0, female: 0 };

  const navigateTo = (tabId: string, label: string) => {
    setActiveTab(tabId);
    setAnnouncement(`Menampilkan halaman ${label}`);
    window.scrollTo(0, 0);
  };

  const shareInclusionCard = () => {
    const caption = `[IMPACT REPORT] ${partner?.name} telah melatih ${currentStats.total} talenta disabilitas dengan tingkat keterserapan kerja ${currentStats.rate}% melalui disabilitas.com. Bersama kita wujudkan inklusivitas!`;
    if (navigator.share) {
      navigator.share({ title: partner?.name, text: caption, url: `https://disabilitas.com/partner/${partner?.id}` });
    } else {
      navigator.clipboard.writeText(caption);
      alert("Caption & Link profil disalin ke clipboard!");
    }
  };

  if (loading) return (
    <div role="status" className="flex min-h-screen items-center justify-center font-black uppercase italic tracking-tighter text-slate-400 animate-pulse">
      <Activity className="mr-2 animate-spin" /> Mengakses Data Riset Mitra...
    </div>
  );

  return (
    <div className="mx-auto max-w-7xl space-y-10 px-4 py-10 text-slate-900">
      <div className="sr-only" aria-live="polite">{announcement}</div>

      {/* HEADER */}
      <header className="flex flex-col items-start justify-between gap-6 border-b-4 border-slate-900 pb-10 md:flex-row md:items-end">
        <div className="space-y-4 text-left">
          <div className="flex items-center gap-3">
            <div className="rounded-xl bg-blue-600 p-2 text-white shadow-lg shadow-blue-100">
              <GraduationCap size={28} />
            </div>
            <div>
              <p className="text-[10px] font-black uppercase tracking-[0.3em] text-blue-600 leading-none">Partner Training Portal</p>
              <h1 className="mt-1 text-4xl font-black uppercase italic tracking-tighter leading-none">{partner?.name}</h1>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <span className="flex items-center gap-1.5 rounded-full border-2 border-emerald-500 bg-emerald-50 px-4 py-1.5 text-[10px] font-black uppercase text-emerald-700">
              <ShieldCheck size={14} /> Skor Inklusi: {partner?.inclusion_score || 0}%
            </span>
            <div className="flex items-center gap-3 rounded-full border-2 border-slate-200 bg-white px-4 py-1.5 shadow-sm">
              <div className="h-2 w-24 overflow-hidden rounded-full bg-slate-100">
                <div className="h-full bg-blue-600 transition-all duration-1000" style={{ width: `${profileCompletion}%` }} />
              </div>
              <span className="text-[10px] font-black uppercase text-slate-500 tracking-tighter">Profil: {profileCompletion}%</span>
            </div>
            <a href={`/partner/${partner?.id}`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 rounded-full border-2 border-slate-200 bg-white px-4 py-1.5 text-[10px] font-black uppercase text-slate-600 hover:border-slate-900 transition-all shadow-sm">
              <ExternalLink size={14} /> Profil Publik
            </a>
          </div>
        </div>
        <div className="flex gap-3 w-full md:w-auto">
          <button onClick={() => navigateTo("programs", "Buat Program")} className="flex-1 md:flex-none rounded-2xl bg-slate-900 px-8 py-5 text-[11px] font-black uppercase italic text-white shadow-xl hover:bg-blue-600 transition-all tracking-widest">
            Tambah Pelatihan
          </button>
          <button onClick={shareInclusionCard} className="rounded-2xl border-2 border-slate-100 bg-white px-6 hover:border-slate-900 transition-all shadow-sm" aria-label="Bagikan Impact Report">
            <Share2 size={20} />
          </button>
        </div>
      </header>

      {/* NAV TABS */}
      <nav className="no-scrollbar flex gap-2 overflow-x-auto" role="tablist">
        {[
          { id: "overview", label: "Dashboard", icon: LayoutDashboard },
          { id: "programs", label: "Manajemen Kursus", icon: BookOpen },
          { id: "tracer", label: "Tracer Impact", icon: BarChart3 },
          { id: "profile", label: "Profil Mitra", icon: Settings },
          { id: "account", label: "Keamanan Akun", icon: Lock },
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
            {/* STATS CARD */}
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4 text-left">
              <div className="rounded-[2.5rem] border-2 border-slate-100 bg-white p-8 shadow-sm">
                <p className="text-[9px] font-black uppercase tracking-widest text-slate-400">Total {labelTalent}</p>
                <p className="mt-1 text-5xl font-black tracking-tighter">{currentStats.total}</p>
              </div>
              <div className="rounded-[2.5rem] border-2 border-slate-100 bg-white p-8 shadow-sm">
                <p className="text-[9px] font-black italic uppercase tracking-widest text-emerald-500">Berhasil Penempatan</p>
                <p className="mt-1 text-5xl font-black tracking-tighter text-emerald-600">{currentStats.hired}</p>
              </div>
              <div className="rounded-[2.5rem] border-2 border-slate-100 bg-white p-8 shadow-sm">
                <p className="text-[9px] font-black italic uppercase tracking-widest text-blue-500">Impact Rate</p>
                <p className="mt-1 text-5xl font-black tracking-tighter text-blue-600">{currentStats.rate}%</p>
              </div>
              <div className="rounded-[2.5rem] bg-slate-900 p-8 text-white shadow-2xl flex flex-col justify-center">
                <p className="text-[9px] font-black uppercase tracking-widest opacity-60 italic">Social ROI</p>
                <p className="text-3xl font-black italic tracking-tighter leading-tight mt-1 uppercase">Partner Analytics</p>
              </div>
            </div>

            {/* NARRATIVE SECTION */}
            <section className="rounded-[3rem] border-2 border-slate-100 bg-slate-50 p-10 text-left italic shadow-inner">
              <h3 className="mb-6 flex items-center gap-2 text-[11px] font-black uppercase tracking-widest text-blue-600">
                <Award size={16} /> Narasi Dampak Pelatihan
              </h3>
              <div className="max-w-5xl space-y-6 text-xl font-medium leading-relaxed text-slate-800 md:text-2xl">
                <p>
                  Melalui kolaborasi riset, <strong>{partner?.name}</strong> telah berkontribusi meningkatkan kapabilitas <strong>{currentStats.total} talenta disabilitas</strong>. 
                  Peserta terbanyak berasal dari ragam <strong>{Object.entries(disMap).sort((a: any, b: any) => b[1] - a[1])[0]?.[0] || "..."}</strong>.
                </p>
                <p>
                  Hingga periode 2026, efektivitas pelatihan menghasilkan <strong>{currentStats.rate}%</strong> alumni yang telah terserap di dunia kerja, mencakup <strong>{genMap.male || 0} Laki-laki</strong> dan <strong>{genMap.female || 0} Perempuan</strong>.
                </p>
              </div>
            </section>

            {/* ANALYTICS WIDGETS */}
            <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
              <div className="lg:col-span-2 grid grid-cols-1 gap-6 md:grid-cols-2 text-left">
                <div className="rounded-[2.5rem] border-2 border-slate-50 bg-white p-8 shadow-sm">
                  <h4 className="mb-6 flex items-center gap-2 text-[11px] font-black uppercase tracking-widest text-slate-900">
                    <Users className="text-purple-600" size={16} /> Demografi Peserta
                  </h4>
                  <div className="space-y-4">
                    {Object.entries(disMap).map(([type, count]: [string, any]) => (
                      <div key={type} className="space-y-1">
                        <div className="flex justify-between text-[9px] font-black uppercase text-slate-500">
                          <span>{type}</span><span>{count} Orang</span>
                        </div>
                        <div className="h-2 overflow-hidden rounded-full bg-slate-100">
                          <div className="h-full bg-purple-600 transition-all duration-1000" style={{ width: `${(count / (currentStats.total || 1)) * 100}%` }} />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="space-y-8 rounded-[2.5rem] border-2 border-slate-50 bg-white p-8 shadow-sm">
                  <div>
                    <h4 className="mb-4 flex items-center gap-2 text-[11px] font-black uppercase tracking-widest text-slate-900">
                      <User className="text-blue-500" size={16} /> Distribusi Gender
                    </h4>
                    <div className="flex gap-4">
                      <div className="flex-1 rounded-2xl bg-slate-50 p-4 border-l-4 border-blue-500 text-left">
                        <p className="text-[8px] font-black uppercase text-slate-400">Laki-laki</p>
                        <p className="mt-1 text-xl font-black">{genMap.male || 0}</p>
                      </div>
                      <div className="flex-1 rounded-2xl bg-slate-50 p-4 border-l-4 border-pink-500 text-left">
                        <p className="text-[8px] font-black uppercase text-slate-400">Perempuan</p>
                        <p className="mt-1 text-xl font-black">{genMap.female || 0}</p>
                      </div>
                    </div>
                  </div>
                  <div className="rounded-2xl bg-blue-50 p-5">
                    <h4 className="mb-2 flex items-center gap-2 text-[10px] font-black uppercase text-blue-800">
                      <Timer size={14} /> Sinkronisasi
                    </h4>
                    <p className="text-[9px] font-bold italic text-blue-600 leading-tight">Data diperbarui secara real-time berdasarkan laporan sertifikasi yang diverifikasi sistem.</p>
                  </div>
                </div>
              </div>
              <div className="rounded-[2.5rem] bg-blue-600 p-10 text-left text-white shadow-2xl flex flex-col justify-between">
                <div>
                  <Zap className="mb-6 text-blue-200" size={32} />
                  <p className="text-[10px] font-black uppercase tracking-[0.2em] opacity-70 italic leading-none">Mitra Strategis</p>
                  <p className="mt-4 text-3xl font-black italic tracking-tighter uppercase leading-tight">Menciptakan Lulusan Siap Kerja</p>
                </div>
                <div className="mt-8 border-t border-white/10 pt-4 text-left">
                   <p className="text-[9px] font-bold uppercase opacity-60">Certified Partner 2026</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB CONTENT RENDERER */}
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
