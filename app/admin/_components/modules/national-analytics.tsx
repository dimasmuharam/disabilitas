"use client"

import React, { useMemo, useEffect, useState } from "react"
import { 
  PieChart as PieIcon, AlertCircle, Cpu, Accessibility, 
  Laptop, Smartphone, Wifi, Activity, Brain, Loader2, RefreshCw
} from "lucide-react"
import { 
  PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer 
} from "recharts"

const COLORS = ["#2563eb", "#9333ea", "#06b6d4", "#10b981", "#f59e0b", "#ef4444", "#ec4899"]

export default function NationalAnalytics({ stats }: any) {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);
  
  // 1. SMART NARRATIVE ENGINE
  const generatedNarrative = useMemo(() => {
    if (!stats || !stats.totalTalents || stats.totalTalents === 0) {
      return "Sistem sedang mengkalibrasi data riset nasional. Pastikan koneksi stabil untuk sinkronisasi variabel...";
    }
    
    const getTopEntry = (dist: any) => {
      if (!dist || Object.keys(dist).length === 0) return "Belum terdeteksi";
      return Object.entries(dist).sort((a: any, b: any) => b[1] - a[1])[0][0];
    };

    const topBarrier = getTopEntry(stats.barrierDist);
    const topTool = getTopEntry(stats.toolsDist);
    const laptopCount = stats.digitalAssets?.laptop || 0;
    const employmentPct = Math.round(((stats.employmentRate?.employed || 0) / stats.totalTalents) * 100);

    return `Berdasarkan data ${stats.totalTalents} responden, tingkat penyerapan kerja berada di angka ${employmentPct}%. 
    Hambatan terbesar yang terdeteksi adalah "${topBarrier}", sedangkan kebutuhan teknologi asistif didominasi oleh "${topTool}". 
    Data menunjukkan ${laptopCount} responden telah memiliki aset laptop untuk menunjang produktivitas digital.`;
  }, [stats]);

  // 2. HANDLING LOADING STATE
  if (!stats) {
    return (
      <div className="flex min-h-[450px] flex-col items-center justify-center rounded-[3rem] border-4 border-dashed border-slate-200 bg-white/50 p-10 text-center" role="status">
        <div className="relative mb-6">
          <Loader2 className="size-[60px] animate-spin text-blue-600" />
          <Activity className="absolute inset-0 m-auto text-slate-300" size={20} />
        </div>
        <h2 className="text-lg font-black uppercase italic tracking-tight text-slate-900">Sinkronisasi Data BRIN</h2>
        <button 
          onClick={() => window.location.reload()}
          className="mt-8 flex items-center gap-2 rounded-2xl bg-slate-900 px-6 py-3 text-[9px] font-black uppercase text-white hover:bg-blue-600 transition-all"
        >
          <RefreshCw size={14} /> Muat Ulang Paksa
        </button>
      </div>
    );
  }

  // 3. HANDLING EMPTY DATA
  if (stats.totalTalents === 0) {
    return (
      <div className="flex min-h-[400px] flex-col items-center justify-center rounded-[3rem] border-4 border-slate-900 bg-white p-20 text-center shadow-2xl">
        <AlertCircle className="mb-4 text-red-500" size={48} />
        <h2 className="text-2xl font-black uppercase italic">Dataset Kosong</h2>
        <p className="mt-2 text-[10px] font-bold uppercase text-slate-400">Belum ada data responden di database.</p>
      </div>
    );
  }

  return (
    <div className="space-y-12 duration-700 animate-in fade-in slide-in-from-bottom-4" role="region" aria-label="Analisis Riset Nasional">
      
      <div className="grid grid-cols-1 gap-10 lg:grid-cols-2">
        {/* CHART RAGAM DISABILITAS */}
        <div className="space-y-8 rounded-[3rem] border-4 border-slate-900 bg-white p-10 shadow-[12px_12px_0px_0px_rgba(15,23,42,1)]">
          <h2 className="flex items-center gap-3 text-xl font-black uppercase italic text-slate-900">
            <PieIcon className="text-blue-600" size={28}/> Ragam Disabilitas
          </h2>
          
          <div className="h-[350px] w-full">
            {isMounted && (
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
                  <Tooltip 
                    contentStyle={{ borderRadius: '20px', border: '4px solid #0f172a', fontWeight: 'bold', fontSize: '12px' }} 
                  />
                  <Legend verticalAlign="bottom" height={36} wrapperStyle={{ fontSize: '10px', fontWeight: 'bold', textTransform: 'uppercase' }}/>
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* AI NARRATIVE PANEL */}
        <div className="flex flex-col justify-between rounded-[3rem] border-4 border-slate-900 bg-slate-900 p-10 text-white shadow-[12px_12px_0px_0px_rgba(37,99,235,1)]">
          <div>
            <h2 className="flex items-center gap-3 text-xl font-black uppercase italic text-blue-400 text-left">
              <Brain className="animate-pulse" /> AI Research Insight
            </h2>
            <div className="mt-8 rounded-3xl border-2 border-white/10 bg-white/5 p-8 text-base font-medium italic leading-relaxed text-blue-100 shadow-inner text-left">
              &ldquo;{generatedNarrative}&rdquo;
            </div>
          </div>
          
          <div className="mt-8 grid grid-cols-2 gap-6">
            <div className="rounded-3xl border-2 border-white/20 bg-blue-600 p-6 text-center">
              <p className="text-[10px] font-black uppercase text-blue-100 opacity-80">Total Responden</p>
              <p className="mt-2 text-5xl font-black italic leading-none tracking-tighter">{stats.totalTalents || 0}</p>
            </div>
            <div className="rounded-3xl border-2 border-white/20 bg-indigo-600 p-6 text-center">
              <p className="text-[10px] font-black uppercase text-indigo-100 opacity-80">Terserap Kerja</p>
              <p className="mt-2 text-5xl font-black italic leading-none tracking-tighter">{stats.employmentRate?.employed || 0}</p>
            </div>
          </div>
        </div>
      </div>

      {/* SECTION 2: STATISTICAL GRID */}
      <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
        <StatTable title="Hambatan Pendidikan" icon={AlertCircle} data={stats.barrierDist} color="text-red-600" />
        <StatTable title="Teknologi Asistif" icon={Cpu} data={stats.toolsDist} color="text-indigo-600" />
        <StatTable title="Akomodasi Diminta" icon={Accessibility} data={stats.accDist} color="text-rose-600" />
        
        <div className="flex flex-col justify-between rounded-[2.5rem] border-4 border-slate-900 bg-white p-8 shadow-[8px_8px_0px_0px_rgba(15,23,42,1)]">
          <h3 className="flex items-center gap-3 text-sm font-black uppercase italic text-emerald-600 text-left">
            <Activity size={20}/> Kesiapan Digital
          </h3>
          <div className="mt-6 space-y-4">
            <AssetItem icon={<Laptop />} label="Laptop" value={stats.digitalAssets?.laptop} />
            <AssetItem icon={<Smartphone />} label="Smartphone" value={stats.digitalAssets?.smartphone} />
            
            <div className="mt-4 border-t-2 border-dashed border-slate-200 pt-4 text-left">
               <div className="mb-2 flex items-center gap-2 text-slate-400">
                  <Wifi size={14}/> <span className="text-[9px] font-black uppercase tracking-widest">Internet (Fiber)</span>
               </div>
               <div className="h-3 w-full overflow-hidden rounded-full bg-slate-100">
                  <div className="h-full bg-emerald-500 transition-all duration-1000" style={{ width: `${stats.digitalAssets?.internetFiberPct || 0}%` }} />
               </div>
            </div>
          </div>
        </div>

        <StatTable title="Model Pendidikan" data={stats.eduModelDist} color="text-blue-600" />
        <StatTable title="Sumber Beasiswa" data={stats.scholarshipDist} color="text-orange-600" />
      </div>
    </div>
  )
}

function StatTable({ title, icon: Icon, data, color }: any) {
  // MENGURUTKAN DATA DARI TERBESAR KE TERKECIL
  const sortedData = useMemo(() => {
    if (!data) return [];
    return Object.entries(data).sort((a: any, b: any) => b[1] - a[1]);
  }, [data]);

  return (
    <div className="space-y-6 rounded-[2.5rem] border-4 border-slate-900 bg-white p-8 shadow-[8px_8px_0px_0px_rgba(15,23,42,1)] text-left">
      <h3 className={`flex items-center gap-3 text-sm font-black uppercase italic ${color}`}>
        {Icon && <Icon size={20} />} {title}
      </h3>
      <div className="overflow-hidden rounded-2xl border-2 border-slate-100">
        <table className="w-full text-left text-[11px]">
          <thead className="bg-slate-50 font-black uppercase text-slate-400">
            <tr><th className="px-4 py-3">Variabel</th><th className="px-4 py-3 text-right">n</th></tr>
          </thead>
          <tbody className="divide-y-2 divide-slate-50 font-bold uppercase">
            {sortedData.length > 0 ? (
              sortedData.map(([key, val]: any) => (
                <tr key={key} className="transition-colors hover:bg-slate-50">
                  <td className="px-4 py-3 text-slate-600">{key}</td>
                  <td className="px-4 py-3 text-right font-black text-slate-900">{val}</td>
                </tr>
              ))
            ) : (
              <tr><td colSpan={2} className="px-4 py-3 text-center italic text-slate-300">Data nihil</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}

function AssetItem({ icon, label, value }: any) {
  return (
    <div className="flex items-center justify-between rounded-xl border-2 border-slate-100 bg-slate-50 p-4">
      <div className="flex items-center gap-3 text-slate-500">
        {React.cloneElement(icon as React.ReactElement, { size: 18 })}
        <span className="text-[10px] font-black uppercase">{label}</span>
      </div>
      <span className="text-2xl font-black text-slate-900">{value || 0}</span>
    </div>
  )
}