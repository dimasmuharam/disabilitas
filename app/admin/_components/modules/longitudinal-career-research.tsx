"use client"

import React, { useMemo, useState } from 'react'
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  BarChart, Bar, Cell, Legend, PieChart, Pie
} from 'recharts'
import { 
  TrendingUp, Calendar, Users, Briefcase, 
  Search, FileSpreadsheet, Info, ArrowRight,
  Clock, Award, School
} from 'lucide-react'
import * as XLSX from 'xlsx'

interface LongitudinalProps {
  careerTimeline: any[]
}

export default function LongitudinalCareerResearch({ careerTimeline }: LongitudinalProps) {
  const [searchTerm, setSearchTerm] = useState("")

  // --- 1. LOGIKA RISET: DISTRIBUSI MASA TUNGGU (Sejak Lulus) ---
  const waitingTimeStats = useMemo(() => {
    const categories = {
      "Cepat (<6bln)": 0,
      "Menengah (6-12bln)": 0,
      "Lama (>1thn)": 0,
      "Sangat Lama (>2thn)": 0
    }

    careerTimeline.forEach(item => {
      if (item.days_since_origin) {
        const days = item.days_since_origin;
        if (days <= 180) categories["Cepat (<6bln)"]++;
        else if (days <= 365) categories["Menengah (6-12bln)"]++;
        else if (days <= 730) categories["Lama (>1thn)"]++;
        else categories["Sangat Lama (>2thn)"]++;
      }
    });

    return Object.entries(categories).map(([name, value]) => ({ name, value }));
  }, [careerTimeline]);

  // --- 2. LOGIKA RISET: EFEKTIVITAS MODEL PENDIDIKAN ---
  const educationSuccess = useMemo(() => {
    const stats: any = {};
    careerTimeline.forEach(item => {
      const model = item.education_model || "Umum/Lainnya";
      if (!stats[model]) stats[model] = { name: model, total_moves: 0, to_work: 0 };
      
      stats[model].total_moves++;
      // Hitung jika status berubah menjadi bekerja
      const workingStatus = ['Pegawai Swasta', 'ASN (PNS / PPPK)', 'Pegawai BUMN / BUMD', 'Wiraswasta / Entrepreneur'];
      if (workingStatus.includes(item.new_status)) {
        stats[model].to_work++;
      }
    });

    return Object.values(stats).map((s: any) => ({
      name: s.name,
      conversion: Math.round((s.to_work / s.total_moves) * 100)
    })).sort((a, b) => b.conversion - a.conversion);
  }, [careerTimeline]);

  // --- FITUR EKSPOR ---
  const exportLongitudinalData = () => {
    const data = careerTimeline.map(item => ({
      Talent: item.full_name,
      Disabilitas: item.disability_type,
      Model_Pendidikan: item.education_model,
      Status_Lama: item.old_status,
      Status_Baru: item.new_status,
      Tanggal_Perubahan: new Date(item.changed_at).toLocaleDateString('id-ID'),
      Masa_Tunggu_Hari: item.days_since_origin || "N/A"
    }));

    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Longitudinal_Report");
    XLSX.writeFile(wb, `Riset_Longitudinal_${new Date().toISOString().slice(0,10)}.xlsx`);
  };

  const COLORS = ['#2563eb', '#7c3aed', '#db2777', '#ea580c', '#16a34a'];

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      
      {/* HEADER RISET */}
      <section className="rounded-[2.5rem] border-4 border-slate-900 bg-slate-900 p-8 text-white shadow-[8px_8px_0px_0px_rgba(37,99,235,1)]">
        <div className="flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-4">
            <div className="bg-blue-600 p-4 rounded-3xl">
              <TrendingUp size={32} />
            </div>
            <div>
              <h2 className="text-2xl font-black uppercase italic tracking-tighter">Longitudinal Career Tracker</h2>
              <p className="text-slate-400 text-xs font-bold uppercase tracking-widest">Memantau Transisi & Stabilitas Karir Jangka Panjang</p>
            </div>
          </div>
          <button 
            onClick={exportLongitudinalData}
            className="flex items-center gap-2 rounded-2xl bg-white px-8 py-4 text-[10px] font-black uppercase text-slate-900 transition-all hover:bg-blue-50 active:scale-95"
          >
            <FileSpreadsheet size={18} /> Export Research Dataset
          </button>
        </div>
      </section>

      {/* ANALYTICS GRID */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
        
        {/* CHART 1: WAITING TIME DISTRIBUTION */}
        <div className="rounded-[2.5rem] border-4 border-slate-900 bg-white p-8 shadow-[10px_10px_0px_0px_rgba(15,23,42,1)]">
          <h3 className="mb-6 flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-400">
            <Clock size={16} /> True Waiting Time (Dari Lulus)
          </h3>
          <div className="h-[250px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={waitingTimeStats} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={60} outerRadius={80} paddingAngle={5}>
                  {waitingTimeStats.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                </Pie>
                <Tooltip />
                <Legend verticalAlign="bottom" wrapperStyle={{ fontSize: '9px', fontWeight: 'bold' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* CHART 2: EDUCATION MODEL SUCCESS */}
        <div className="rounded-[2.5rem] border-4 border-slate-900 bg-white p-8 shadow-[10px_10px_0px_0px_rgba(15,23,42,1)]">
          <h3 className="mb-6 flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-400">
            <School size={16} /> Success Rate by Model
          </h3>
          <div className="h-[250px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={educationSuccess}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="name" tick={{ fontSize: 9, fontWeight: 'bold' }} />
                <YAxis unit="%" tick={{ fontSize: 10 }} />
                <Tooltip cursor={{ fill: '#f8fafc' }} />
                <Bar dataKey="conversion" fill="#2563eb" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* CHART 3: RECENT MOVEMENTS */}
        <div className="rounded-[2.5rem] border-4 border-slate-900 bg-white p-8 shadow-[10px_10px_0px_0px_rgba(15,23,42,1)]">
          <h3 className="mb-6 flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-400">
            <Briefcase size={16} /> Career Mobility Index
          </h3>
          <div className="space-y-4">
            {careerTimeline.slice(0, 3).map((item, i) => (
              <div key={i} className="flex items-start gap-3 border-l-4 border-blue-600 pl-4 py-1">
                <div>
                  <p className="text-[11px] font-black uppercase text-slate-900">{item.talent_name}</p>
                  <p className="text-[9px] font-bold text-slate-400 uppercase tracking-tighter">
                    {item.old_status} <ArrowRight size={10} className="inline mx-1" /> {item.new_status}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* DETAILED TIMELINE TABLE */}
      <section className="rounded-[2.5rem] border-4 border-slate-900 bg-white shadow-[12px_12px_0px_0px_rgba(15,23,42,1)] overflow-hidden">
        <div className="bg-slate-50 p-6 border-b-4 border-slate-900 flex justify-between items-center">
          <h3 className="font-black uppercase italic tracking-tight">Timeline Perjalanan Karir</h3>
          <div className="relative w-72">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
            <input 
              type="text" 
              placeholder="Cari Riwayat Talent..."
              className="w-full pl-10 pr-4 py-2 rounded-xl border-2 border-slate-900 text-[10px] font-bold outline-none"
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-900 text-white text-[10px] font-black uppercase tracking-widest">
                <th className="p-6">Talent & Latar Belakang</th>
                <th className="p-6">Transisi Karir</th>
                <th className="p-6">Masa Tunggu / Durasi</th>
                <th className="p-6">Waktu Perubahan</th>
              </tr>
            </thead>
            <tbody className="divide-y-2 divide-slate-100">
              {careerTimeline
                .filter(t => t.talent_name?.toLowerCase().includes(searchTerm.toLowerCase()))
                .map((log, i) => (
                <tr key={i} className="hover:bg-slate-50 transition-colors">
                  <td className="p-6">
                    <div className="text-[11px] font-black text-slate-900">{log.talent_name}</div>
                    <div className="text-[9px] font-bold text-blue-600 uppercase italic">
                      {log.education_model} • Lulus {log.graduation_date || 'N/A'}
                    </div>
                  </td>
                  <td className="p-6">
                    <div className="flex items-center gap-2">
                      <span className="text-[9px] font-bold bg-slate-100 px-2 py-1 rounded text-slate-500">{log.old_status || 'Start'}</span>
                      <ArrowRight size={12} className="text-slate-400" />
                      <span className="text-[9px] font-black bg-blue-600 px-2 py-1 rounded text-white">{log.new_status}</span>
                    </div>
                  </td>
                  <td className="p-6">
                    <div className="flex items-center gap-1 text-[10px] font-black text-slate-700">
                      <Clock size={14} className="text-blue-500" />
                      {log.days_since_origin ? `${log.days_since_origin} Hari` : '--'}
                    </div>
                    <div className="text-[8px] font-bold text-slate-400 uppercase tracking-widest italic">
                      {log.old_status ? 'Durasi Status Sebelumnya' : 'Masa Tunggu Sejak Lulus'}
                    </div>
                  </td>
                  <td className="p-6">
                    <div className="text-[10px] font-bold text-slate-500">
                      {new Date(log.changed_at).toLocaleString('id-ID', { dateStyle: 'medium' })}
                    </div>
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