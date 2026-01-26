"use client"

import React, { useMemo, useState } from 'react'
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  Cell, PieChart, Pie, Legend 
} from 'recharts'
import { 
  Download, FileSpreadsheet, Info, ArrowUpRight, 
  Search, Filter, History, GraduationCap 
} from 'lucide-react'
import * as XLSX from 'xlsx'

interface TransitionAnalyticsProps {
  logs: any[]
}

export default function TransitionHiringAnalytics({ logs }: TransitionAnalyticsProps) {
  const [searchTerm, setSearchTerm] = useState("")

  // --- LOGIKA RISET (DATA CRUNCHING) ---
  
  // 1. Analisis Drop-off (Di mana mereka gagal?)
  const funnelData = useMemo(() => {
    const counts = logs.reduce((acc: any, log) => {
      acc[log.new_status] = (acc[log.new_status] || 0) + 1;
      return acc;
    }, {});
    
    return Object.entries(counts)
      .map(([name, value]) => ({ name, value: value as number }))
      .sort((a, b) => b.value - a.value);
  }, [logs]);

  // 2. Analisis Berdasarkan Tingkat Pendidikan
  const educationImpact = useMemo(() => {
    const eduMap = logs.reduce((acc: any, log) => {
      const edu = log.education_level || "Tidak Terdeteksi";
      if (!acc[edu]) acc[edu] = { name: edu, hired: 0, total: 0 };
      acc[edu].total += 1;
      if (log.new_status === 'hired' || log.new_status === 'accepted') acc[edu].hired += 1;
      return acc;
    }, {});
    return Object.values(eduMap);
  }, [logs]);

  // 3. Analisis Sukses Rate berdasarkan Model Pendidikan (Inklusi vs SLB vs Reguler)
  const modelSuccessRate = useMemo(() => {
    const modelMap = logs.reduce((acc: any, log) => {
      const model = log.education_model || "Lainnya";
      if (!acc[model]) acc[model] = { name: model, hired: 0, total: 0 };
      acc[model].total += 1;
      if (log.new_status === 'hired' || log.new_status === 'accepted') {
        acc[model].hired += 1;
      }
      return acc;
    }, {});

    return Object.values(modelMap).map((m: any) => ({
      name: m.name,
      rate: Math.round((m.hired / m.total) * 100) || 0,
      total: m.total
    })).sort((a, b) => b.rate - a.rate);
  }, [logs]);

  // --- FITUR EKSPOR ---
  const exportToExcel = () => {
    const dataToExport = logs.map(log => ({
      Waktu: new Date(log.log_time).toLocaleString('id-ID'),
      Talent: log.talent_name,
      Disabilitas: log.disability_type,
      Pendidikan: log.education_level,
      Kampus: log.university,
      Model_Sekolah: log.education_model,
      Perusahaan: log.company_name,
      Status_Lama: log.old_status,
      Status_Baru: log.new_status,
      Catatan_HRD: log.hrd_notes_snapshot
    }));

    const ws = XLSX.utils.json_to_sheet(dataToExport);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Transition_Research");
    XLSX.writeFile(wb, `Riset_Transisi_Hiring_${new Date().toISOString().slice(0,10)}.xlsx`);
  };

  const COLORS = ['#2563eb', '#7c3aed', '#db2777', '#ea580c', '#16a34a'];

  return (
    <div className="space-y-8 duration-500 animate-in fade-in">
      
      {/* NARRATIVE SECTION (Aksesibilitas & Konteks) */}
      <section 
        aria-labelledby="research-narration-title"
        className="rounded-[2rem] border-4 border-slate-900 bg-blue-50 p-8 shadow-[8px_8px_0px_0px_rgba(30,58,138,1)]"
      >
        <div className="flex items-start gap-4">
          <div className="rounded-full bg-blue-600 p-3 text-white">
            <Info size={24} />
          </div>
          <div>
            <h2 id="research-narration-title" className="text-xl font-black uppercase italic tracking-tight text-slate-900">
              Analisis Transisi Pendidikan ke Pekerjaan
            </h2>
            <p className="mt-2 text-sm leading-relaxed text-slate-700">
              Modul ini memantau secara <strong>real-time</strong> bagaimana lulusan disabilitas bergerak dari bangku pendidikan ke pasar kerja. 
              Data diambil dari <em>application logs</em> yang merekam setiap perubahan status lamaran. Gunakan data ini untuk mengidentifikasi 
              hambatan sistemik pada tahap seleksi tertentu.
            </p>
          </div>
          <button 
            onClick={exportToExcel}
            className="ml-auto flex items-center gap-2 rounded-2xl border-4 border-slate-900 bg-green-500 px-6 py-3 text-[10px] font-black uppercase text-white shadow-[4px_4px_0px_0px_rgba(15,23,42,1)] transition-all hover:translate-y-[-2px] active:translate-y-[2px]"
          >
            <FileSpreadsheet size={16} /> Export Research Data
          </button>
        </div>
      </section>

      {/* GRID GRAFIK */}
      <div className="grid grid-cols-1 gap-8 md:grid-cols-2 xl:grid-cols-3">
        
        {/* CHART 1: DROP-OFF ANALYSIS */}
        <div className="rounded-[2.5rem] border-4 border-slate-900 bg-white p-8 shadow-[10px_10px_0px_0px_rgba(15,23,42,1)]">
          <h3 className="mb-6 flex items-center gap-2 text-sm font-black uppercase tracking-widest text-slate-500">
            <History size={18} /> Funnel Alur Rekrutmen
          </h3>
          <div className="h-[300px] w-full" role="img" aria-label="Grafik batang menunjukkan frekuensi status lamaran">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={funnelData} layout="vertical" margin={{ left: 40 }}>
                <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                <XAxis type="number" hide />
                <YAxis dataKey="name" type="category" width={100} tick={{ fontSize: 10, fontWeight: 'bold' }} />
                <Tooltip cursor={{ fill: '#f1f5f9' }} />
                <Bar dataKey="value" radius={[0, 10, 10, 0]}>
                  {funnelData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* CHART 2: EDUCATION IMPACT */}
        <div className="rounded-[2.5rem] border-4 border-slate-900 bg-white p-8 shadow-[10px_10px_0px_0px_rgba(15,23,42,1)]">
          <h3 className="mb-6 flex items-center gap-2 text-sm font-black uppercase tracking-widest text-slate-500">
            <GraduationCap size={18} /> Populasi per Jenjang
          </h3>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={educationImpact}
                  dataKey="total"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  label
                >
                  {educationImpact.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend iconType="circle" wrapperStyle={{ fontSize: '10px', fontWeight: 'bold', textTransform: 'uppercase' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* CHART 3: SUCCESS RATE BY EDUCATION MODEL */}
        <div className="rounded-[2.5rem] border-4 border-slate-900 bg-white p-8 shadow-[10px_10px_0px_0px_rgba(15,23,42,1)]">
          <h3 className="mb-6 flex items-center gap-2 text-sm font-black uppercase tracking-widest text-slate-500">
            <ArrowUpRight size={18} /> Success Rate by Model
          </h3>
          <div className="h-[300px] w-full" role="img" aria-label="Grafik persentase kesuksesan berdasarkan model sekolah">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={modelSuccessRate} margin={{ top: 20 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="name" tick={{ fontSize: 9, fontWeight: 'bold' }} />
                <YAxis tick={{ fontSize: 10 }} unit="%" />
                <Tooltip formatter={(value) => [`${value}% Success`, 'Rate']} />
                <Bar dataKey="rate" radius={[10, 10, 0, 0]}>
                  {modelSuccessRate.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[(index + 2) % COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* RAW DATA TABLE (AUDIT & RESEARCH) */}
      <section className="overflow-hidden rounded-[2.5rem] border-4 border-slate-900 bg-white shadow-[12px_12px_0px_0px_rgba(15,23,42,1)]">
        <div className="flex flex-col items-center justify-between gap-4 border-b-4 border-slate-900 bg-slate-50 p-6 md:flex-row">
          <h3 className="text-lg font-black uppercase italic tracking-tighter">Detailed Application Logs</h3>
          <div className="relative w-full max-w-md">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input 
              type="text"
              placeholder="Cari talent, perusahaan, atau status..."
              className="w-full rounded-2xl border-4 border-slate-900 py-3 pl-12 pr-4 text-[10px] font-bold uppercase shadow-[4px_4px_0px_0px_rgba(15,23,42,1)] outline-none transition-all focus:translate-y-[-2px]"
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-left">
            <thead>
              <tr className="bg-slate-900 text-[10px] font-black uppercase tracking-widest text-white">
                <th className="px-6 py-4">Waktu</th>
                <th className="px-6 py-4">Talent & Pendidikan</th>
                <th className="px-6 py-4">Status Transisi</th>
                <th className="px-6 py-4">Catatan HRD</th>
              </tr>
            </thead>
            <tbody className="divide-y-2 divide-slate-100">
              {logs.filter(l => 
                l.talent_name?.toLowerCase().includes(searchTerm.toLowerCase()) || 
                l.company_name?.toLowerCase().includes(searchTerm.toLowerCase())
              ).map((log, i) => (
                <tr key={i} className="transition-colors hover:bg-slate-50">
                  <td className="px-6 py-4 text-[10px] font-bold text-slate-500">
                    {new Date(log.log_time).toLocaleDateString('id-ID')}
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-[11px] font-black text-slate-900">{log.talent_name}</div>
                    <div className="flex items-center gap-1 text-[9px] font-bold uppercase text-blue-600">
                      <GraduationCap size={12} /> {log.education_level} - {log.university} ({log.education_model || 'N/A'})
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <span className="rounded-md bg-slate-100 px-2 py-1 text-[9px] font-bold text-slate-500">{log.old_status}</span>
                      <ArrowUpRight size={14} className="text-slate-400" />
                      <span className="rounded-md bg-blue-600 px-2 py-1 text-[9px] font-black text-white">{log.new_status}</span>
                    </div>
                    <div className="mt-1 text-[9px] font-bold uppercase italic text-slate-400">@ {log.company_name}</div>
                  </td>
                  <td className="px-6 py-4">
                    <p className="max-w-xs text-[10px] font-medium italic text-slate-600">
                      &quot;{log.hrd_notes_snapshot || 'Tidak ada catatan khusus.'}&quot;
                    </p>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  )
}