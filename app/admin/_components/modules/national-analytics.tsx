"use client"

import React, { useMemo, useEffect, useState } from "react"
import { 
  PieChart as PieIcon, AlertCircle, Cpu, Accessibility, 
  Laptop, Smartphone, Wifi, Activity, Brain, Loader2, 
  MapPin, Briefcase, GraduationCap, Landmark, MessageSquare, 
  Star, TrendingUp, BookOpen, Video, FileText, Globe, Coins
} from "lucide-react"
import { 
  PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer 
} from "recharts"

const COLORS = ["#2563eb", "#9333ea", "#06b6d4", "#10b981", "#f59e0b", "#ef4444", "#ec4899"]

export default function NationalAnalytics({ rawData = [] }: { rawData: any[] }) {
  const [isMounted, setIsMounted] = useState(false);
  useEffect(() => { setIsMounted(true); }, []);

  const stats = useMemo(() => {
    if (!rawData || rawData.length === 0) return null;
    const total = rawData.length;

    const getDist = (key: string, isArray = false) => {
      const counts: Record<string, number> = {};
      rawData.forEach(item => {
        const val = item[key];
        if (isArray && Array.isArray(val)) {
          val.forEach(v => { if(v && v !== "null") counts[v] = (counts[v] || 0) + 1; });
        } else if (val !== null && val !== undefined && val !== "" && val !== "Tidak Terisi") {
          counts[val] = (counts[val] || 0) + 1;
        }
      });
      return counts;
    };

    // --- LOGIKA KHUSUS GAJI (Expected Salary Range) ---
    const salaryDist: Record<string, number> = {
      "< 2 Juta": 0,
      "2 - 5 Juta": 0,
      "5 - 10 Juta": 0,
      "> 10 Juta": 0
    };
    rawData.forEach(p => {
      const s = Number(p.expected_salary);
      if (!s) return;
      if (s < 2000000) salaryDist["< 2 Juta"]++;
      else if (s <= 5000000) salaryDist["2 - 5 Juta"]++;
      else if (s <= 10000000) salaryDist["5 - 10 Juta"]++;
      else salaryDist["> 10 Juta"]++;
    });

    const ratingValues = rawData.map(p => p.training_accessibility_rating).filter(r => r > 0);
    const avgRating = ratingValues.length > 0 ? (ratingValues.reduce((a, b) => a + b, 0) / ratingValues.length).toFixed(1) : "0";

    return {
      total,
      disability: getDist('disability_type'),
      city: getDist('city'),
      career: getDist('career_status'),
      barrier: getDist('education_barrier', true),
      tools: getDist('used_assistive_tools', true),
      accommodations: getDist('preferred_accommodations', true),
      academicSupport: getDist('academic_support_received', true),
      academicTools: getDist('academic_assistive_tools', true),
      major: getDist('major'),
      university: getDist('university'),
      eduModel: getDist('education_model'),
      scholarship: getDist('scholarship_type'),
      commPref: getDist('communication_preference'),
      relevance: getDist('study_relevance'),
      skillMethod: getDist('skill_acquisition_method'),
      impact: getDist('skill_impact_rating'),
      gradYear: getDist('graduation_date'),
      salaryDist,
      avgRating,
      professional: {
        linkedin: Math.round((rawData.filter(p => p.linkedin_url?.length > 5).length / total) * 100),
        portfolio: Math.round((rawData.filter(p => p.portfolio_url?.length > 5).length / total) * 100),
        video: Math.round((rawData.filter(p => p.video_intro_url?.length > 5).length / total) * 100),
        consent: Math.round((rawData.filter(p => p.has_informed_consent).length / total) * 100)
      },
      digital: {
        laptop: rawData.filter(p => p.has_laptop).length,
        smartphone: rawData.filter(p => p.has_smartphone).length,
        fiberPct: Math.round((rawData.filter(p => p.internet_quality === 'fiber').length / total) * 100) || 0
      }
    };
  }, [rawData]);

  if (!stats) return <div className="p-20 text-center"><Loader2 className="animate-spin mx-auto text-blue-600" /></div>;

  return (
    <div className="space-y-12 pb-24 animate-in fade-in duration-700" role="region" aria-label="Dashboard Riset Nasional Komprehensif">
      
      {/* 1. HERO ANALYTICS */}
      <div className="grid grid-cols-1 gap-10 lg:grid-cols-2">
        <div className="rounded-[3rem] border-4 border-slate-900 bg-white p-10 shadow-[12px_12px_0px_0px_rgba(15,23,42,1)]">
          <h2 className="flex items-center gap-3 text-xl font-black uppercase italic text-left"><PieIcon className="text-blue-600"/> Ragam Disabilitas</h2>
          <div className="h-[350px] mt-6">
            {isMounted && (
              <ResponsiveContainer>
                <PieChart>
                  <Pie data={Object.entries(stats.disability).map(([name, value]) => ({ name, value }))} innerRadius={80} outerRadius={120} dataKey="value" stroke="none">
                    {Object.entries(stats.disability).map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                  </Pie>
                  <Tooltip formatter={(v: any) => `${((v/stats.total)*100).toFixed(1)}%`} />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        <div className="rounded-[3rem] border-4 border-slate-900 bg-slate-900 p-10 text-white shadow-[12px_12px_0px_0px_rgba(37,99,235,1)] flex flex-col justify-between text-left">
          <div className="space-y-6">
            <h2 className="flex items-center gap-3 text-xl font-black uppercase italic text-blue-400"><Brain className="animate-pulse" /> Research Narrative</h2>
            <div className="rounded-3xl border-2 border-white/10 bg-white/5 p-8 italic text-blue-100 text-lg leading-relaxed">
              &ldquo;Dataset mencakup {stats.total} responden. Inklusi data tervalidasi (Consent) mencapai {stats.professional.consent}%. Mayoritas talenta berada pada fase karir sebagai {Object.entries(stats.career).sort((a:any,b:any)=>b[1]-a[1])[0]?.[0] || '...'}.&rdquo;
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4 mt-8">
            <div className="bg-blue-600 p-6 rounded-[2rem] border-2 border-white/20 text-center">
              <p className="text-[10px] font-black uppercase opacity-60">Total Responden</p>
              <p className="text-4xl font-black italic">{stats.total}</p>
            </div>
            <div className="bg-emerald-600 p-6 rounded-[2rem] border-2 border-white/20 text-center">
              <p className="text-[10px] font-black uppercase opacity-60">Avg Training Access</p>
              <p className="text-4xl font-black italic">{stats.avgRating}/5</p>
            </div>
          </div>
        </div>
      </div>

      {/* 2. EKOSISTEM PENDIDIKAN & HAMBATAN */}
      <h3 className="text-2xl font-black uppercase italic text-slate-900 text-left border-b-4 border-slate-900 pb-2 flex items-center gap-3"><GraduationCap size={32}/> Pendidikan & Hambatan</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatTable title="Hambatan Studi" icon={AlertCircle} data={stats.barrier} total={stats.total} color="text-rose-600" />
        <StatTable title="Dukungan Kampus" icon={Accessibility} data={stats.academicSupport} total={stats.total} color="text-emerald-600" />
        <StatTable title="Top Kampus" icon={Landmark} data={stats.university} total={stats.total} color="text-indigo-600" />
        <StatTable title="Top Jurusan" icon={BookOpen} data={stats.major} total={stats.total} color="text-blue-600" />
      </div>

      {/* 3. EKONOMI & KARIR */}
      <h3 className="text-2xl font-black uppercase italic text-slate-900 text-left border-b-4 border-slate-900 pb-2 flex items-center gap-3"><Coins size={32}/> Ekonomi & Dinamika Karir</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatTable title="Ekspektasi Gaji" icon={Coins} data={stats.salaryDist} total={stats.total} color="text-emerald-700" isFixed={true} />
        <StatTable title="Status Karir" icon={Briefcase} data={stats.career} total={stats.total} color="text-blue-600" />
        <StatTable title="Kesesuaian Studi" icon={TrendingUp} data={stats.relevance} total={stats.total} color="text-emerald-600" />
        <StatTable title="Tahun Kelulusan" icon={PieIcon} data={stats.gradYear} total={stats.total} color="text-slate-600" />
      </div>

      {/* 4. PROFESIONALISME & DIGITAL PRESENCE */}
      <h3 className="text-2xl font-black uppercase italic text-slate-900 text-left border-b-4 border-slate-900 pb-2 flex items-center gap-3"><Globe size={32}/> Kesiapan Profesional & Digital</h3>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="rounded-[2.5rem] border-4 border-slate-900 bg-white p-8 shadow-[8px_8px_0px_0px_rgba(15,23,42,1)] flex flex-col justify-between">
           <h3 className="text-sm font-black uppercase italic text-indigo-600 flex items-center gap-2 text-left"><PieIcon size={18}/> Branding Digital</h3>
           <div className="space-y-3 mt-6">
             <SmallProgress label="LinkedIn" pct={stats.professional.linkedin} icon={<PieIcon size={12}/>}/>
             <SmallProgress label="Portofolio" pct={stats.professional.portfolio} icon={<FileText size={12}/>}/>
             <SmallProgress label="Video Intro" pct={stats.professional.video} icon={<Video size={12}/>}/>
           </div>
        </div>
        
        <div className="rounded-[2.5rem] border-4 border-slate-900 bg-white p-8 shadow-[8px_8px_0px_0px_rgba(15,23,42,1)] flex flex-col justify-between">
          <h3 className="text-sm font-black uppercase italic text-emerald-600 flex items-center gap-2 text-left"><Activity size={18}/> Kesiapan Gadget</h3>
          <div className="space-y-4 mt-6">
             <SmallProgress label="Akses Laptop" pct={Math.round((stats.digital.laptop/stats.total)*100)} icon={<Laptop size={14}/>}/>
             <SmallProgress label="Smartphone" pct={Math.round((stats.digital.smartphone/stats.total)*100)} icon={<Smartphone size={14}/>}/>
             <div className="pt-4 border-t-2 border-dashed border-slate-100">
               <div className="flex justify-between text-[9px] font-black uppercase mb-2"><span>INTERNET FIBER</span><span>{stats.digital.fiberPct}%</span></div>
               <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden" role="progressbar" aria-valuenow={stats.digital.fiberPct} aria-valuemin={0} aria-valuemax={100}>
                 <div className="h-full bg-emerald-500 transition-all duration-1000" style={{ width: `${stats.digital.fiberPct}%` }} />
               </div>
             </div>
          </div>
        </div>

        <StatTable title="Metode Belajar" icon={Accessibility} data={stats.skillMethod} total={stats.total} color="text-amber-600" />
      </div>

      {/* 5. SEBARAN & IMPACT */}
      <h3 className="text-2xl font-black uppercase italic text-slate-900 text-left border-b-4 border-slate-900 pb-2 flex items-center gap-3"><Star size={32}/> Sebaran & Dampak Pelatihan</h3>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <StatTable title="Sebaran Kota" icon={MapPin} data={stats.city} total={stats.total} color="text-slate-600" />
        <StatTable title="Dampak Pelatihan" icon={Star} data={stats.impact} total={stats.total} color="text-orange-600" />
        <StatTable title="Preferensi Komunikasi" icon={MessageSquare} data={stats.commPref} total={stats.total} color="text-cyan-600" />
      </div>
    </div>
  )
}

function StatTable({ title, icon: Icon, data, total, color, isFixed = false }: any) {
  const sorted = useMemo(() => {
    const entries = Object.entries(data || {}).filter(([k]) => k !== "null" && k !== "undefined" && k !== "");
    if (isFixed) return entries; // Jangan diurutkan jika data range (gaji)
    return entries.sort((a: any, b: any) => b[1] - a[1]).slice(0, 10);
  }, [data, isFixed]);

  return (
    <div className="rounded-[2.5rem] border-4 border-slate-900 bg-white p-8 shadow-[8px_8px_0px_0px_rgba(15,23,42,1)] text-left" role="group" aria-label={`Tabel Proporsi ${title}`}>
      <h3 className={`text-[11px] font-black uppercase italic mb-4 flex items-center gap-2 ${color}`}>
        {Icon && <Icon size={14} aria-hidden="true"/>} {title}
      </h3>
      <div className="rounded-2xl border-2 border-slate-50 overflow-hidden">
        <table className="w-full text-[10px] font-bold">
          <tbody className="divide-y-2 divide-slate-50 uppercase">
            {sorted.length > 0 ? sorted.map(([k, v]: any) => {
              const pct = Math.round((v / total) * 100);
              return (
                <tr key={k} className="hover:bg-slate-50 transition-colors">
                  <td className="py-2.5 px-3 text-slate-500 truncate max-w-[130px]">{k}</td>
                  <td className="py-2.5 px-3 text-right font-black" aria-label={`${pct} persen`}>{pct}%</td>
                </tr>
              )
            }) : <tr><td className="py-4 text-center text-slate-300 italic">Nihil</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function SmallProgress({ label, pct, icon }: any) {
  return (
    <div className="bg-slate-50 p-3 rounded-xl border-2 border-slate-100 flex justify-between items-center" aria-label={`${label}: ${pct} persen`}>
      <span className="text-[9px] font-black text-slate-400 flex items-center gap-2">{icon} {label}</span>
      <span className="text-xs font-black">{pct}%</span>
    </div>
  );
}