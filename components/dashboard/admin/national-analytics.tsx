"use client"

import React from "react"
import { 
  TrendingUp, PieChart as PieIcon, GraduationCap, 
  AlertCircle, FileText, Cpu, Accessibility, 
  Laptop, Smartphone, Wifi, Activity
} from "lucide-react"
import { 
  PieChart as RePie, Pie as RePieSlice, Cell as ReCell, 
  Tooltip as ReTooltip, Legend as ReLegend, ResponsiveContainer as ReContainer 
} from "recharts"

const COLORS = ["#2563eb", "#9333ea", "#06b6d4", "#10b981", "#f59e0b", "#ef4444", "#ec4899"]

// Sub-komponen Tabel Statistik (Aksesibel & Neo-Brutalism)
const StatTable = ({ title, icon: Icon, data, color }: any) => (
  <div className="space-y-6 rounded-[2.5rem] border-4 border-slate-900 bg-white p-8 shadow-[8px_8px_0px_0px_rgba(15,23,42,1)]">
    <h3 className={`flex items-center gap-3 text-sm font-black uppercase italic ${color}`}>
      <Icon size={20} /> {title}
    </h3>
    <div className="overflow-hidden rounded-2xl border-2 border-slate-100">
      <table className="w-full text-left text-[11px]">
        <thead className="bg-slate-50 font-black uppercase text-slate-400">
          <tr><th className="px-4 py-3">Variabel Riset</th><th className="px-4 py-3 text-right">n</th></tr>
        </thead>
        <tbody className="divide-y-2 divide-slate-50">
          {data && Object.entries(data).map(([key, val]: any) => (
            <tr key={key} className="font-bold uppercase hover:bg-slate-50 transition-colors">
              <td className="px-4 py-3 text-slate-600">{key}</td>
              <td className="px-4 py-3 text-right text-slate-900">{val}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  </div>
)

export default function NationalAnalytics({ stats, transitionInsights }: any) {
  return (
    <div className="space-y-12 duration-500 animate-in fade-in">
      
      {/* ROW 1: DISABILITY DISTRIBUTION & NARRATIVE */}
      <div className="grid grid-cols-1 gap-10 lg:grid-cols-2">
        <div className="space-y-8 rounded-[3rem] border-4 border-slate-900 bg-white p-10 shadow-[12px_12px_0px_0px_rgba(15,23,42,1)]">
          <h2 className="flex items-center gap-3 text-xl font-black uppercase italic text-slate-900">
            <PieIcon className="text-blue-600" size={28}/> Ragam Disabilitas (Nasional)
          </h2>
          <div className="h-[350px] w-full">
            <ReContainer width="100%" height="100%">
              <RePieChart>
                <RePieSlice 
                  data={Object.entries(stats?.disabilityDist || {}).map(([name, value]) => ({ name, value }))} 
                  innerRadius={80} outerRadius={120} paddingAngle={5} dataKey="value" stroke="none"
                >
                  {Object.entries(stats?.disabilityDist || {}).map((_, index) => (
                    <ReCell key={`c-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </RePieSlice>
                <ReTooltip 
                    contentStyle={{ borderRadius: '16px', border: '4px solid #0f172a', fontWeight: 'bold' }}
                />
                <ReLegend verticalAlign="bottom" height={36}/>
              </RePieChart>
            </ReContainer>
          </div>
        </div>

        <div className="flex flex-col justify-between rounded-[3rem] border-4 border-slate-900 bg-slate-900 p-10 text-white shadow-[12px_12px_0px_0px_rgba(37,99,235,1)]">
          <div>
            <h2 className="flex items-center gap-3 text-xl font-black uppercase italic text-blue-400">
              <TrendingUp/> Research Intelligence Summary
            </h2>
            <div className="mt-8 rounded-3xl border-2 border-white/10 bg-white/5 p-8 text-sm italic leading-relaxed text-blue-100 shadow-inner">
              "{transitionInsights?.narrative || 'Menunggu kalkulasi cerdas dari pusat data...'}"
            </div>
          </div>
          
          <div className="mt-8 grid grid-cols-2 gap-6">
            <div className="rounded-3xl bg-blue-600 p-6 shadow-[4px_4px_0px_0px_rgba(255,255,255,0.2)]">
              <p className="text-[10px] font-black uppercase text-blue-100 opacity-80">Total Responden</p>
              <p className="text-5xl font-black italic tracking-tighter">{stats?.totalTalents || 0}</p>
            </div>
            <div className="rounded-3xl bg-indigo-600 p-6 shadow-[4px_4px_0px_0px_rgba(255,255,255,0.2)]">
              <p className="text-[10px] font-black uppercase text-indigo-100 opacity-80">Terserap Kerja</p>
              <p className="text-5xl font-black italic tracking-tighter">{stats?.employmentRate?.employed || 0}</p>
            </div>
          </div>
        </div>
      </div>

      {/* ROW 2: VARIABEL RISET (SINKRON DENGAN TABEL PROFILES) */}
      <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
        {/* Sinkron kolom: education_model */}
        <StatTable title="Model Pendidikan" icon={GraduationCap} data={stats?.eduModelDist} color="text-blue-600" />
        
        {/* Sinkron kolom: education_barrier */}
        <StatTable title="Hambatan Pendidikan" icon={AlertCircle} data={stats?.barrierDist} color="text-red-600" />
        
        {/* Sinkron kolom: scholarship_type */}
        <StatTable title="Jenis Beasiswa" icon={FileText} data={stats?.scholarshipDist} color="text-orange-600" />
        
        {/* Sinkron kolom: used_assistive_tools */}
        <StatTable title="Teknologi Asistif" icon={Cpu} data={stats?.toolsDist} color="text-indigo-600" />
        
        {/* Sinkron kolom: preferred_accommodations */}
        <StatTable title="Permintaan Akomodasi" icon={Accessibility} data={stats?.accDist} color="text-rose-600" />

        {/* ROW 3: DIGITAL ASSETS (has_laptop, has_smartphone, internet_quality) */}
        <div className="flex flex-col justify-between rounded-[2.5rem] border-4 border-slate-900 bg-white p-8 shadow-[8px_8px_0px_0px_rgba(15,23,42,1)]">
          <h3 className="flex items-center gap-3 text-sm font-black uppercase italic text-emerald-600">
            <Activity size={20}/> Kesiapan Digital
          </h3>
          <div className="mt-6 space-y-4">
            <div className="flex items-center justify-between rounded-xl bg-slate-50 p-4 border-2 border-slate-100">
              <div className="flex items-center gap-3 text-slate-500"><Laptop size={18}/> <span className="text-[10px] font-black uppercase">Laptop</span></div>
              <span className="text-2xl font-black text-slate-900">{stats?.digitalAssets?.laptop || 0}</span>
            </div>
            <div className="flex items-center justify-between rounded-xl bg-slate-50 p-4 border-2 border-slate-100">
              <div className="flex items-center gap-3 text-slate-500"><Smartphone size={18}/> <span className="text-[10px] font-black uppercase">Smartphone</span></div>
              <span className="text-2xl font-black text-slate-900">{stats?.digitalAssets?.smartphone || 0}</span>
            </div>
            <div className="mt-4 pt-4 border-t-2 border-dashed border-slate-200">
               <div className="flex items-center gap-2 text-slate-400 mb-2">
                  <Wifi size={14}/> <span className="text-[9px] font-black uppercase">Kualitas Internet (Fiber)</span>
               </div>
               <div className="w-full bg-slate-100 h-3 rounded-full overflow-hidden">
                  <div 
                    className="bg-emerald-500 h-full" 
                    style={{ width: `${stats?.digitalAssets?.internetFiberPct || 0}%` }}
                  />
               </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}