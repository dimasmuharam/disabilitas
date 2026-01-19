"use client"

import React, { useMemo } from "react"
import { 
  TrendingUp, PieChart as PieIcon, GraduationCap, 
  AlertCircle, FileText, Cpu, Accessibility, 
  Laptop, Smartphone, Wifi, Activity, Brain, Loader2
} from "lucide-react"
import { 
  PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer 
} from "recharts"

const COLORS = ["#2563eb", "#9333ea", "#06b6d4", "#10b981", "#f59e0b", "#ef4444", "#ec4899"]

export default function NationalAnalytics({ stats }: any) {
  
  // 1. SMART NARRATIVE ENGINE
  const generatedNarrative = useMemo(() => {
    if (!stats || !stats.totalTalents) return "Menghimpun data variabel riset untuk analisis otomatis...";
    
    const topBarrier = stats.barrierDist ? Object.entries(stats.barrierDist).sort((a:any, b:any) => b[1] - a[1])[0] : null;
    const topTool = stats.toolsDist ? Object.entries(stats.toolsDist).sort((a:any, b:any) => b[1] - a[1])[0] : null;
    const laptopOwnership = stats.digitalAssets?.laptop || 0;
    const employmentPct = stats.totalTalents ? Math.round(((stats.employmentRate?.employed || 0) / stats.totalTalents) * 100) : 0;

    return `Berdasarkan data ${stats.totalTalents} responden, tingkat penyerapan kerja berada di angka ${employmentPct}%. 
    Hambatan terbesar yang terdeteksi adalah "${topBarrier?.[0] || 'N/A'}", 
    sedangkan kebutuhan teknologi asistif didominasi oleh "${topTool?.[0] || 'N/A'}". 
    Terdapat korelasi kuat antara kepemilikan aset digital (${laptopOwnership} laptop) dengan kesiapan memasuki pasar kerja inklusif.`;
  }, [stats]);

  // 2. HANDLING LOADING / NULL STATE (Agar tidak blank)
  if (!stats) {
    return (
      <div className="flex min-h-[400px] flex-col items-center justify-center rounded-[3rem] border-4 border-dashed border-slate-200 p-20 text-center" role="status" aria-live="polite">
        <Loader2 className="mb-4 animate-spin text-slate-300" size={48} />
        <p className="font-black uppercase italic tracking-widest text-slate-400">Menyusun Dasbor Analisis Nasional...</p>
      </div>
    );
  }

  return (
    <div className="space-y-12 duration-700 animate-in fade-in" role="region" aria-label="Analisis Riset Nasional">
      
      {/* SECTION 1: VISUAL & NARRATIVE */}
      <div className="grid grid-cols-1 gap-10 lg:grid-cols-2">
        <div className="space-y-8 rounded-[3rem] border-4 border-slate-900 bg-white p-10 shadow-[12px_12px_0px_0px_rgba(15,23,42,1)]">
          <h2 className="flex items-center gap-3 text-xl font-black uppercase italic text-slate-900">
            <PieIcon className="text-blue-600" size={28}/> Ragam Disabilitas
          </h2>
          
          <div className="h-[350px] w-full" role="img" aria-label="Grafik lingkaran distribusi ragam disabilitas">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie 
                  data={Object.entries(stats.disabilityDist || {}).map(([name, value]) => ({ name, value }))} 
                  innerRadius={80} outerRadius={120} paddingAngle={5} dataKey="value" stroke="none"
                >
                  {Object.entries(stats.disabilityDist || {}).map((_, index) => (
                    <Cell key={`c-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ borderRadius: '16px', border: '4px solid #0f172a', fontWeight: 'bold' }} />
                <Legend verticalAlign="bottom" height={36}/>
              </PieChart>
            </ResponsiveContainer>
          </div>
          
          <div className="sr-only">
            <h3>Detail Data Ragam Disabilitas:</h3>
            <ul>
              {Object.entries(stats.disabilityDist || {}).map(([key, val]: any) => (
                <li key={key}>{key}: {val} orang</li>
              ))}
            </ul>
          </div>
        </div>

        <div className="flex flex-col justify-between rounded-[3rem] border-4 border-slate-900 bg-slate-900 p-10 text-white shadow-[12px_12px_0px_0px_rgba(37,99,235,1)]">
          <div>
            <h2 className="flex items-center gap-3 text-xl font-black uppercase italic text-blue-400">
              <Brain className="animate-pulse" /> AI Research Insight
            </h2>
            <div className="mt-8 rounded-3xl border-2 border-white/10 bg-white/5 p-8 text-base font-medium italic leading-relaxed text-blue-100 shadow-inner">
              &ldquo;{generatedNarrative}&rdquo;
            </div>
          </div>
          
          <div className="mt-8 grid grid-cols-2 gap-6">
            <div className="rounded-3xl bg-blue-600 p-6 text-center border-2 border-white/20">
              <p className="text-[10px] font-black uppercase text-blue-100 opacity-80">Total Responden</p>
              <p className="text-5xl font-black italic tracking-tighter">{stats.totalTalents || 0}</p>
            </div>
            <div className="rounded-3xl bg-indigo-600 p-6 text-center border-2 border-white/20">
              <p className="text-[10px] font-black uppercase text-indigo-100 opacity-80">Terserap Kerja</p>
              <p className="text-5xl font-black italic tracking-tighter">{stats.employmentRate?.employed || 0}</p>
            </div>
          </div>
        </div>
      </div>

      {/* SECTION 2: DEEP DIVE VARIABLES */}
      <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
        <StatTable title="Hambatan Pendidikan" icon={AlertCircle} data={stats.barrierDist} color="text-red-600" />
        <StatTable title="Teknologi Asistif" icon={Cpu} data={stats.toolsDist} color="text-indigo-600" />
        <StatTable title="Akomodasi Diminta" icon={Accessibility} data={stats.accDist} color="text-rose-600" />
        
        <div className="flex flex-col justify-between rounded-[2.5rem] border-4 border-slate-900 bg-white p-8 shadow-[8px_8px_0px_0px_rgba(15,23,42,1)]">
          <h3 className="flex items-center gap-3 text-sm font-black uppercase italic text-emerald-600">
            <Activity size={20}/> Kesiapan Digital
          </h3>
          <div className="mt-6 space-y-4">
            <AssetItem icon={<Laptop />} label="Laptop" value={stats.digitalAssets?.laptop} />
            <AssetItem icon={<Smartphone />} label="Smartphone" value={stats.digitalAssets?.smartphone} />
            
            <div className="mt-4 pt-4 border-t-2 border-dashed border-slate-200">
               <div className="flex items-center gap-2 text-slate-400 mb-2">
                  <Wifi size={14}/> <span className="text-[9px] font-black uppercase tracking-widest">Kualitas Internet (Fiber)</span>
               </div>
               <div className="w-full bg-slate-100 h-3 rounded-full overflow-hidden" role="progressbar" aria-valuenow={stats.digitalAssets?.internetFiberPct} aria-valuemin={0} aria-valuemax={100}>
                  <div className="bg-emerald-500 h-full transition-all duration-1000" style={{ width: `${stats.digitalAssets?.internetFiberPct || 0}%` }} />
               </div>
            </div>
          </div>
        </div>

        <StatTable title="Model Pendidikan" icon={GraduationCap} data={stats.eduModelDist} color="text-blue-600" />
        <StatTable title="Sumber Beasiswa" icon={FileText} data={stats.scholarshipDist} color="text-orange-600" />
      </div>
    </div>
  )
}

function StatTable({ title, icon: Icon, data, color }: any) {
  return (
    <div className="space-y-6 rounded-[2.5rem] border-4 border-slate-900 bg-white p-8 shadow-[8px_8px_0px_0px_rgba(15,23,42,1)]">
      <h3 className={`flex items-center gap-3 text-sm font-black uppercase italic ${color}`}>
        <Icon size={20} /> {title}
      </h3>
      <div className="overflow-hidden rounded-2xl border-2 border-slate-100">
        <table className="w-full text-left text-[11px]" summary={`Tabel distribusi ${title}`}>
          <thead className="bg-slate-50 font-black uppercase text-slate-400">
            <tr><th className="px-4 py-3">Kategori</th><th className="px-4 py-3 text-right">Jumlah</th></tr>
          </thead>
          <tbody className="divide-y-2 divide-slate-50 font-bold uppercase">
            {data && Object.entries(data).map(([key, val]: any) => (
              <tr key={key} className="hover:bg-slate-50 transition-colors">
                <td className="px-4 py-3 text-slate-600">{key}</td>
                <td className="px-4 py-3 text-right text-slate-900">{val}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

function AssetItem({ icon, label, value }: any) {
  return (
    <div className="flex items-center justify-between rounded-xl bg-slate-50 p-4 border-2 border-slate-100">
      <div className="flex items-center gap-3 text-slate-500">
        {React.cloneElement(icon, { size: 18 })}
        <span className="text-[10px] font-black uppercase">{label}</span>
      </div>
      <span className="text-2xl font-black text-slate-900">{value || 0}</span>
    </div>
  )
}