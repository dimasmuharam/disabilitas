"use client"

import React from "react"
import { AlertTriangle, CheckCircle2, ArrowRight } from "lucide-react"

export default function AuditHub({ logs, onMerge }: any) {
  return (
    <section className="space-y-8 rounded-[3.5rem] border-4 border-slate-900 bg-white p-10 shadow-[12px_12px_0px_0px_rgba(15,23,42,1)] animate-in fade-in">
      <div className="flex items-center gap-8 rounded-[2.5rem] bg-orange-500 p-10 text-white shadow-[8px_8px_0px_0px_rgba(15,23,42,1)]">
        <AlertTriangle size={48} strokeWidth={2.5}/>
        <div>
          <h2 className="text-2xl font-black uppercase italic">Data Standardization Hub</h2>
          <p className="text-xs font-bold uppercase tracking-widest opacity-90">Sinkronisasi tabel manual_input_logs untuk validitas riset.</p>
        </div>
      </div>

      <div className="overflow-hidden rounded-[2.5rem] border-4 border-slate-900">
        <table className="w-full text-left">
          <thead className="bg-slate-900 text-[10px] font-black uppercase text-slate-400">
            <tr>
              <th className="px-10 py-6">Field Name</th>
              <th className="px-10 py-6">Raw User Input</th>
              <th className="px-10 py-6 text-center">Frequency</th>
              <th className="px-10 py-6 text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y-4 divide-slate-100 text-[12px] font-black uppercase italic">
            {logs.map((log: any) => (
              <tr key={log.id} className="transition-all hover:bg-slate-50">
                <td className="px-10 py-6 font-black text-blue-600">{log.field_name}</td>
                <td className="px-10 py-6 text-slate-900">{log.input_value}</td>
                <td className="px-10 py-6 text-center">
                   <span className="rounded-full border-2 border-slate-200 bg-slate-100 px-6 py-2">{log.occurrence_count}</span>
                </td>
                <td className="px-10 py-6 text-right">
                  <button 
                    onClick={() => onMerge(log)}
                    className="group flex items-center gap-2 rounded-xl bg-slate-900 px-6 py-3 text-[10px] font-black uppercase text-white transition-all hover:bg-blue-600"
                  >
                    Merge <ArrowRight size={14} className="transition-transform group-hover:translate-x-1" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  )
}