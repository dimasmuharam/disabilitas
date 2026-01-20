"use client"

import React from "react"
import { AlertTriangle, ArrowRight, Database, Search, History } from "lucide-react"

export default function AuditHub({ logs = [], onMerge, canAction }: any) {
  return (
    <section className="space-y-8 rounded-[3.5rem] border-4 border-slate-900 bg-white p-10 shadow-[12px_12px_0px_0px_rgba(15,23,42,1)] animate-in fade-in" role="region" aria-label="Pusat Audit Data Manual">
      
      {/* 1. HERO HEADER */}
      <div className="flex items-center gap-8 rounded-[2.5rem] bg-orange-500 p-10 text-white shadow-[8px_8px_0px_0px_rgba(15,23,42,1)]">
        <div className="rounded-2xl bg-white/20 p-4 shadow-inner">
          <Database size={48} strokeWidth={2.5} />
        </div>
        <div>
          <h2 className="text-3xl font-black uppercase italic leading-none">Data Standardization Hub</h2>
          <p className="mt-2 text-[10px] font-bold uppercase tracking-[0.2em] opacity-90">
            Validasi & Pembersihan Variabel Riset Nasional (manual_input_logs)
          </p>
        </div>
      </div>

      {/* 2. INFO BANNER (Aksesibilitas NVDA) */}
      <div className="rounded-2xl border-4 border-slate-900 bg-slate-50 p-6">
        <p className="text-[10px] font-black uppercase italic leading-relaxed text-slate-600">
          <AlertTriangle className="inline-block mr-2 text-orange-500" size={16}/>
          Daftar di bawah ini adalah input manual dari user yang tidak ada dalam database pilihan. 
          Gunakan fitur <strong>Merge</strong> untuk menggabungkan data ke variabel resmi.
        </p>
      </div>

      {/* 3. AUDIT TABLE */}
      <div className="overflow-hidden rounded-[2.5rem] border-4 border-slate-900">
        <table className="w-full text-left border-collapse" summary="Tabel log input manual yang membutuhkan standarisasi">
          <thead className="bg-slate-900 text-[10px] font-black uppercase text-slate-400">
            <tr>
              <th scope="col" className="px-10 py-6">Field Name</th>
              <th scope="col" className="px-10 py-6">Raw User Input</th>
              <th scope="col" className="px-10 py-6 text-center">Frequency</th>
              <th scope="col" className="px-10 py-6 text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y-4 divide-slate-100 text-[12px] font-black uppercase italic">
            {logs.length > 0 ? logs.map((log: any) => (
              <tr key={log.id} className="transition-all hover:bg-slate-50">
                <td className="px-10 py-6 font-black text-blue-600">
                  <span className="rounded-lg bg-blue-50 px-3 py-1">{log.field_name}</span>
                </td>
                <td className="px-10 py-6 text-slate-900 font-bold">{log.input_value}</td>
                <td className="px-10 py-6 text-center">
                   <div className="flex flex-col items-center gap-1">
                      <span className="rounded-full border-2 border-slate-900 bg-white px-6 py-2 shadow-[4px_4px_0px_0px_rgba(15,23,42,1)]">
                        {log.occurrence_count}
                      </span>
                      <span className="text-[8px] font-black text-slate-400 mt-2">KALI INPUT</span>
                   </div>
                </td>
                <td className="px-10 py-6 text-right">
                  {/* PROTEKSI AKSES: Hanya tampilkan tombol jika punya izin (Admin/Staff) */}
                  {canAction ? (
                    <button 
                      onClick={() => onMerge(log)}
                      className="group inline-flex items-center gap-2 rounded-xl bg-slate-900 px-8 py-4 text-[10px] font-black uppercase text-white transition-all hover:bg-blue-600 active:scale-95"
                      aria-label={`Merge data ${log.input_value} untuk field ${log.field_name}`}
                    >
                      Merge <ArrowRight size={14} className="transition-transform group-hover:translate-x-1" />
                    </button>
                  ) : (
                    <span className="text-[9px] font-black text-slate-300 uppercase italic">View Only</span>
                  )}
                </td>
              </tr>
            )) : (
              <tr>
                <td colSpan={4} className="py-20 text-center">
                  <div className="flex flex-col items-center opacity-30">
                    <History size={48} />
                    <p className="mt-4 font-black uppercase italic">Semua data sudah bersih & terstandarisasi.</p>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </section>
  )
}