"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import { supabase } from "@/lib/supabase";
import Link from "next/link";
import { 
  Users, BookOpen, BarChart3, Settings, 
  ShieldCheck, LayoutDashboard,
  Activity, Award, Lock, 
  Zap, User, Timer, ExternalLink, GraduationCap,
  UserCheck, MessageCircle, Share2, ArrowRight, AlertTriangle, CheckCircle2, Loader2, Eye, Bell
} from "lucide-react";
import { QRCodeSVG } from "qrcode.react";

// Import Modul Pendukung
import ProgramManager from "./partner/program-manager";
import EnrollmentTracker from "./partner/enrollment-tracker";
import TalentTracer from "./partner/talent-tracer";
import ProfileEditor from "./partner/profile-editor";
import AccountSettings from "./partner/account-settings";

// Import Modular Share Helper
import { handlePartnerNativeShare, handlePartnerWhatsAppShare } from "./partner/share-partner-helper";

export default function PartnerDashboard({ user }: { user: any }) {
  const [activeTab, setActiveTab] = useState("overview");
  const [partner, setPartner] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [announcement, setAnnouncement] = useState("");
  const [profileCompletion, setProfileCompletion] = useState(0);
  const [pendingTraineesCount, setPendingTraineesCount] = useState(0);

  const moduleHeadingRef = useRef<HTMLHeadingElement>(null);

  const fetchDashboardData = useCallback(async () => {
    if (!user?.id) return;
    setLoading(true);
    try {
      const { data: partnerData, error } = await supabase
        .from("partners")
        .select("*")
        .eq("id", user.id)
        .single();
      
      if (error || !partnerData) return;
      setPartner(partnerData);

      // Jika sudah verified, baru tarik data pendaftar
      if (partnerData.is_verified) {
        const { count, error: countError } = await supabase
          .from("trainees")
          .select("*", { count: "exact", head: true })
          .eq("partner_id", user.id)
          .eq("status", "applied");
        
        if (!countError) {
          setPendingTraineesCount(count || 0);
        }
      } else {
        // Jika belum verified, paksa ke tab profile
        setActiveTab("profile");
      }

      const fields = ["name", "description", "location", "website", "nib_number"];
      const filled = fields.filter(f => partnerData[f] && partnerData[f].length > 0).length;
      const acc = (partnerData.master_accommodations_provided?.length || 0) > 0 ? 1 : 0;
      setProfileCompletion(Math.round(((filled + acc) / (fields.length + 1)) * 100));

    } catch (e) { 
      console.error("Dashboard Sync Error:", e); 
    } finally { 
      setLoading(false); 
    }
  }, [user?.id]);

  useEffect(() => { 
    fetchDashboardData(); 
  }, [fetchDashboardData]);

  const navigateTo = (tabId: string, label: string) => {
    setActiveTab(tabId);
    setAnnouncement(`Menampilkan modul ${label}`);
    setTimeout(() => {
      if (moduleHeadingRef.current) moduleHeadingRef.current.focus();
      window.scrollTo(0, 0);
    }, 100);
  };

  if (loading) return (
    <div role="status" className="flex min-h-screen flex-col items-center justify-center bg-[#F8FAFC]">
      <Loader2 className="mb-4 animate-spin text-blue-600" size={48} />
      <p className="font-black uppercase italic tracking-widest text-slate-400">Sinkronisasi Portal Mitra...</p>
    </div>
  );

  const isVerified = partner?.is_verified;
  const statsTotal = Number(partner?.stats_impact_total || 0);
  const statsHired = Number(partner?.stats_impact_hired || 0);
  const successRate = statsTotal > 0 ? Math.round((statsHired / statsTotal) * 100) : 0;
  const disMap = partner?.stats_disability_map || {};
  const genMap = partner?.stats_gender_map || { male: 0, female: 0 };

  return (
    <div className="mx-auto max-w-7xl space-y-10 px-4 py-10 text-left font-sans text-slate-900 selection:bg-blue-100">
      <div className="sr-only" aria-live="polite">{announcement}</div>

      {/* HEADER SECTION */}
      <header className="flex flex-col items-start justify-between gap-6 border-b-4 border-slate-900 pb-10 md:flex-row md:items-end">
        <div className="space-y-4">
          <div className="flex items-center gap-6">
            <div className="relative flex size-20 shrink-0 items-center justify-center rounded-[2rem] border-2 border-slate-900 bg-blue-600 text-white shadow-xl">
              <GraduationCap size={40} />
              {isVerified && (
                <div className="absolute -bottom-1 -right-1 flex size-7 items-center justify-center rounded-full border-4 border-white bg-blue-600 text-white">
                  <CheckCircle2 size={14} />
                </div>
              )}
            </div>
            <div>
              <p className="mb-1 text-[10px] font-black uppercase leading-none tracking-[0.3em] text-blue-600">Impact Ecosystem Partner</p>
              <h1 className="text-4xl font-black uppercase italic leading-none tracking-tighter">{partner?.name || "Dashboard Mitra"}</h1>
            </div>
          </div>
          
          <div className="flex flex-wrap items-center gap-3">
            <span className={`flex items-center gap-1.5 rounded-full border-2 px-4 py-1.5 text-[10px] font-black uppercase ${isVerified ? 'border-emerald-500 bg-emerald-50 text-emerald-700' : 'border-amber-500 bg-amber-50 text-amber-700'}`}>
              {isVerified ? <ShieldCheck size={14} /> : <Timer size={14} />}
              Status: {isVerified ? 'Verified' : 'Pending Verification'}
            </span>
            
            <div className="flex items-center gap-3 rounded-full border-2 border-slate-200 bg-white px-4 py-1.5 shadow-sm">
              <div className="h-2 w-24 overflow-hidden rounded-full bg-slate-100">
                <div className="h-full bg-blue-600 transition-all duration-1000" style={{ width: `${profileCompletion}%` }} />
              </div>
              <span className="text-[10px] font-black uppercase text-slate-500">Data: {profileCompletion}%</span>
            </div>

            {isVerified && (
              <Link 
                href={`/partner/${partner?.id}`} 
                target="_blank" 
                className="flex items-center gap-2 rounded-full border-2 border-slate-900 bg-white px-4 py-1.5 text-[10px] font-black uppercase italic shadow-[3px_3px_0px_0px_rgba(15,23,42,1)] transition-all hover:bg-slate-50"
              >
                <ExternalLink size={14} /> Profil Publik
              </Link>
            )}
          </div>
        </div>
        
        {isVerified && (
          <div className="flex flex-wrap gap-2">
            <button 
              onClick={() => handlePartnerNativeShare(partner, { total: statsTotal, rate: successRate })} 
              className="flex items-center gap-2 rounded-xl bg-slate-900 px-6 py-4 text-[10px] font-black uppercase italic text-white shadow-lg transition-all hover:bg-blue-600"
            >
              <Share2 size={16} /> Share
            </button>
            <button 
              onClick={() => handlePartnerWhatsAppShare(partner, { total: statsTotal, rate: successRate })} 
              className="flex items-center gap-2 rounded-xl bg-[#25D366] px-6 py-4 text-[10px] font-black uppercase italic text-white shadow-lg transition-all hover:opacity-90"
            >
              <MessageCircle size={16} /> WhatsApp
            </button>
          </div>
        )}
      </header>

      {/* NAVIGATION */}
      <nav className="no-scrollbar flex gap-3 overflow-x-auto pb-2" aria-label="Menu Dashboard">
        {[
          { id: "overview", label: "Ringkasan", icon: LayoutDashboard, count: 0, protected: false },
          { id: "profile", label: "Edit Profil", icon: Settings, count: 0, protected: false },
          { id: "programs", label: "Pelatihan", icon: BookOpen, count: 0, protected: true },
          { id: "selection", label: "Pendaftar", icon: UserCheck, count: pendingTraineesCount, protected: true },
          { id: "tracer", label: "Alumni", icon: BarChart3, count: 0, protected: true },
          { id: "account", label: "Keamanan Akun", icon: Lock, count: 0, protected: true },
        ].map((tab) => {
          if (!isVerified && tab.protected) return null;
          return (
            <button 
              key={tab.id} 
              onClick={() => navigateTo(tab.id, tab.label)}
              className={`relative flex items-center gap-3 whitespace-nowrap rounded-3xl px-8 py-5 text-[10px] font-black uppercase transition-all ${activeTab === tab.id ? "bg-slate-900 text-white shadow-2xl" : "border-2 border-slate-100 bg-white text-slate-400 hover:border-slate-900"}`}
            >
              <tab.icon size={18} /> 
              {tab.label}
              {tab.count > 0 && isVerified && (
                <span className="absolute -right-1 -top-1 flex size-6 animate-bounce items-center justify-center rounded-full border-2 border-white bg-red-600 text-[10px] font-bold text-white shadow-lg">
                  {tab.count}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      <main id="main-content">
        {/* GATEKEEPING ALERT & ADMIN NOTES */}
        {!isVerified && (
          <div className="mb-10 space-y-6 animate-in fade-in slide-in-from-bottom-4">
            <div className={`flex flex-col gap-6 rounded-[3rem] border-4 p-10 shadow-xl md:flex-row md:items-center ${partner?.verification_status === 'rejected' ? 'border-rose-500 bg-rose-50' : 'border-amber-500 bg-amber-50'}`}>
              <div className={`flex size-20 shrink-0 items-center justify-center rounded-2xl text-white shadow-lg ${partner?.verification_status === 'rejected' ? 'bg-rose-500' : 'bg-amber-500'}`}>
                {partner?.verification_status === 'rejected' ? <AlertTriangle size={40} /> : <Timer size={40} />}
              </div>
              <div className="space-y-2">
                <h2 className={`text-2xl font-black uppercase italic tracking-tighter ${partner?.verification_status === 'rejected' ? 'text-rose-900' : 'text-amber-900'}`}>
                  {partner?.verification_status === 'rejected' ? "Verifikasi Ditolak" : "Akses Terbatas"}
                </h2>
                <p className="text-sm font-bold leading-relaxed opacity-80 text-slate-800">
                  {partner?.verification_status === 'rejected' 
                    ? "Mohon periksa catatan di bawah dan perbarui dokumen verifikasi Anda agar Admin dapat meninjau kembali."
                    : "Dashboard Anda sedang dalam tahap tinjauan. Selesaikan pengisian profil dan unggah dokumen verifikasi agar Admin dapat mengaktifkan fitur operasional."}
                </p>
                {partner?.admin_notes && (
                  <div className={`mt-4 rounded-xl border-2 p-4 bg-white/50 ${partner?.verification_status === 'rejected' ? 'border-rose-200' : 'border-amber-200'}`}>
                    <p className={`text-[10px] font-black uppercase tracking-widest ${partner?.verification_status === 'rejected' ? 'text-rose-600' : 'text-amber-600'}`}>Catatan Admin:</p>
                    <p className="text-sm font-bold italic text-slate-700">&quot;{partner.admin_notes}&quot;</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* OVERVIEW CONTENT */}
        {activeTab === "overview" && (
          <div className="space-y-12 duration-700 animate-in fade-in">
            <h2 ref={moduleHeadingRef} tabIndex={-1} className="sr-only">Ringkasan Statistik</h2>
            
            <div className="grid grid-cols-1 gap-6 text-left sm:grid-cols-2 lg:grid-cols-4">
              <div className="rounded-[2.5rem] border-2 border-slate-100 bg-white p-8 shadow-sm">
                <p className="text-[9px] font-black uppercase tracking-widest text-slate-400">Total Reach</p>
                <p className="mt-2 text-5xl font-black tracking-tighter text-slate-900">{statsTotal}</p>
              </div>
              <div className="rounded-[2.5rem] border-2 border-slate-100 bg-white p-8 shadow-sm">
                <p className="text-[9px] font-black uppercase italic tracking-widest text-emerald-600">Hired Alumnus</p>
                <p className="mt-2 text-5xl font-black tracking-tighter text-emerald-600">{statsHired}</p>
              </div>
              <div className="rounded-[2.5rem] border-2 border-slate-100 bg-white p-8 shadow-sm">
                <p className="text-[9px] font-black uppercase italic tracking-widest text-blue-600">Success Rate</p>
                <p className="mt-2 text-5xl font-black tracking-tighter text-blue-600">{successRate}%</p>
              </div>
              {isVerified ? (
                <div className="flex flex-col justify-center rounded-[2.5rem] bg-blue-600 p-8 text-white shadow-xl">
                  <p className="mb-1 text-[9px] font-black uppercase italic leading-none tracking-widest text-blue-200">Review Pendaftaran</p>
                  <p className="text-2xl font-black uppercase italic leading-none tracking-tighter">{pendingTraineesCount} Aplikasi Baru</p>
                  <button onClick={() => navigateTo("selection", "Seleksi")} className="mt-4 flex items-center gap-2 text-[10px] font-black uppercase underline decoration-2 underline-offset-4">Buka Seleksi <ArrowRight size={14}/></button>
                </div>
              ) : (
                <div className="flex flex-col justify-center rounded-[2.5rem] border-4 border-dashed border-slate-200 p-8 text-slate-400 text-center">
                   <Lock size={24} className="mb-2 opacity-30 mx-auto" />
                   <p className="text-[10px] font-black uppercase italic">Menu Terkunci</p>
                </div>
              )}
            </div>

            <section className="rounded-[3.5rem] border-2 border-slate-100 bg-slate-50 p-12 text-left italic shadow-inner">
              <div className="mb-8 flex items-center gap-3">
                 <Award className="text-blue-600" size={32} />
                 <h3 className="text-xs font-black uppercase tracking-[0.2em] text-blue-600">Impact Narrative Summary</h3>
              </div>
              <div className="max-w-5xl space-y-6 text-2xl font-medium leading-relaxed text-slate-800 md:text-3xl">
                <p>
                  Melalui ekosistem kolaboratif disabilitas.com, <strong>{partner?.name || 'Lembaga Anda'}</strong> telah berhasil memberdayakan <strong>{statsTotal} talenta disabilitas</strong>. 
                  Peserta mayoritas berasal dari kategori ragam <strong>{Object.entries(disMap).sort((a: any, b: any) => b[1] - a[1])[0]?.[0] || "Semua Ragam"}</strong>.
                </p>
                <p>
                  Hingga periode ini, efektivitas program Anda telah menghasilkan keterserapan kerja lulusan sebesar <strong>{successRate}%</strong> di berbagai industri inklusif.
                </p>
              </div>
            </section>

            <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
              <div className="grid grid-cols-1 gap-6 text-left md:grid-cols-2 lg:col-span-2">
                <div className="rounded-[2.5rem] border-2 border-slate-50 bg-white p-8 shadow-sm">
                  <h4 className="mb-6 flex items-center gap-2 text-[11px] font-black uppercase tracking-widest text-slate-900">
                    <Users className="text-purple-600" size={16} /> Peserta Per Ragam
                  </h4>
                  <div className="space-y-4">
                    {Object.entries(disMap).length > 0 ? Object.entries(disMap).map(([type, count]: [string, any]) => (
                      <div key={type} className="space-y-1">
                        <div className="flex justify-between text-[9px] font-black uppercase italic text-slate-500">
                          <span>{type}</span><span>{count} Orang</span>
                        </div>
                        <div className="h-2 overflow-hidden rounded-full bg-slate-100">
                          <div className="h-full bg-purple-600 transition-all duration-1000" style={{ width: `${(count / (statsTotal || 1)) * 100}%` }} />
                        </div>
                      </div>
                    )) : <p className="text-[10px] font-black uppercase italic text-slate-300">Data Belum Tersedia</p>}
                  </div>
                </div>

                <div className="rounded-[2.5rem] border-2 border-slate-50 bg-white p-8 shadow-sm">
                  <h4 className="mb-6 flex items-center gap-2 text-[11px] font-black uppercase tracking-widest text-slate-900">
                    <User className="text-blue-500" size={16} /> Distribusi Gender
                  </h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="rounded-2xl border-l-4 border-blue-500 bg-slate-50 p-4">
                      <p className="mb-1 text-[8px] font-black uppercase italic leading-none text-slate-400">Laki-laki</p>
                      <p className="text-3xl font-black">{genMap.male || 0}</p>
                    </div>
                    <div className="rounded-2xl border-l-4 border-pink-500 bg-slate-50 p-4">
                      <p className="mb-1 text-[8px] font-black uppercase italic leading-none text-slate-400">Perempuan</p>
                      <p className="text-3xl font-black">{genMap.female || 0}</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex flex-col justify-between rounded-[2.5rem] bg-slate-900 p-10 text-left italic text-white shadow-2xl">
                <div>
                  <Zap className="mb-6 text-blue-400" size={32} />
                  <p className="mb-4 text-[10px] font-black uppercase italic tracking-widest opacity-70">Visi Kesetaraan</p>
                  <p className="text-3xl font-black uppercase italic leading-tight tracking-tighter">Mencetak Lulusan Siap Kerja & Berdaya Saing</p>
                </div>
                <div className="mt-8 border-t border-white/10 pt-4">
                   <p className="text-[9px] font-black uppercase opacity-60">Verified Partner 2026</p>
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="mt-2">
           {isVerified && activeTab === "programs" && <ProgramManager partnerId={user.id} onBack={() => navigateTo("overview", "Dashboard")} />}
           {isVerified && activeTab === "selection" && <EnrollmentTracker partnerId={user.id} onBack={() => navigateTo("overview", "Dashboard")} />}
           {isVerified && activeTab === "tracer" && <TalentTracer partnerName={partner?.name} partnerId={user.id} onBack={() => navigateTo("overview", "Dashboard")} />}
           {activeTab === "profile" && (
             <ProfileEditor 
               partner={partner} 
               user={user}
               onUpdate={() => { fetchDashboardData(); navigateTo("overview", "Dashboard"); }} 
               onBack={() => navigateTo("overview", "Dashboard")} 
             />
           )}
           {isVerified && activeTab === "account" && <AccountSettings user={user} onBack={() => navigateTo("overview", "Dashboard")} />}
        </div>
      </main>

      {/* Impact Identity Card (Hidden for Share) */}
      <div className="pointer-events-none absolute -z-50 overflow-hidden opacity-0" aria-hidden="true">
        <div id="partner-impact-card" className="flex h-[500px] w-[900px] flex-col justify-between border-[24px] border-slate-900 bg-white p-16 font-sans text-slate-900">
          <div className="flex items-center justify-between border-b-8 border-blue-600 pb-10">
            <div className="space-y-1 text-left">
              <h2 className="text-5xl font-black uppercase italic leading-none tracking-tighter text-blue-600">disabilitas.com</h2>
              <p className="text-xs font-black uppercase leading-none tracking-[0.5em] text-slate-400">Official Impact Partner 2026</p>
            </div>
            <div className="rounded-2xl bg-blue-600 px-10 py-5 text-lg font-black uppercase tracking-widest text-white shadow-xl">VERIFIED IMPACT</div>
          </div>
          <div className="flex flex-1 items-center justify-between py-12 text-left">
            <div className="max-w-[60%] space-y-4">
              <h3 className="text-6xl font-black uppercase italic leading-[0.9] tracking-tighter text-slate-900">{partner?.name}</h3>
              <p className="pt-4 text-sm font-bold uppercase italic leading-relaxed text-slate-500">Aktif membangun masa depan kerja yang inklusif dan setara bagi semua talenta.</p>
            </div>
            <div className="flex flex-col gap-6 text-right">
              <div className="space-y-1">
                <p className="mb-1 text-[10px] font-black uppercase leading-none text-blue-600">Total Reach</p>
                <p className="text-6xl font-black italic leading-none">{statsTotal}<span className="text-xl"> Talents</span></p>
              </div>
              <div className="space-y-1">
                <p className="mb-1 text-[10px] font-black uppercase leading-none text-emerald-600">Success Rate</p>
                <p className="text-6xl font-black italic leading-none">{successRate}%</p>
              </div>
            </div>
          </div>
          <div className="flex items-end justify-between border-t-4 border-slate-100 pt-10 text-left">
            <p className="max-w-[450px] text-[10px] font-black uppercase italic leading-none text-slate-400">Pengakuan resmi atas dedikasi mitra dalam menyediakan akses pengembangan kompetensi talenta disabilitas.</p>
            <div className="rounded-2xl border-4 border-slate-900 bg-white p-2 shadow-2xl">
              <QRCodeSVG value={`https://disabilitas.com/partner/${partner?.id}`} size={100} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}