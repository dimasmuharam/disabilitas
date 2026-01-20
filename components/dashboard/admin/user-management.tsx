"use client"

import React, { useState } from "react"
import { Users, Search, ShieldCheck, Building2, GraduationCap, Landmark, Briefcase, Trash2 } from "lucide-react"

export default function UserManagement({ talents, onAction }: any) {
  const [query, setQuery] = useState("")

  const getRoleIcon = (role: string) => {
    switch(role) {
      case 'talent': return <Users size={14} />;
      case 'company': return <Building2 size={14} />;
      case 'campus': return <GraduationCap size={14} />;
      case 'government': return <Landmark size={14} />;
      case 'partner': return <Briefcase size={14} />;
      default: return <ShieldCheck size={14} />;
    }
  }

  return (
    <section className="space-y-8 rounded-[3.5rem] border-4 border-slate-900 bg-white p-10 shadow-[12px_12px_0px_0px_rgba(15,23,42,1)]">
      <div className="flex flex-col items-center justify-between gap-6 border-b-4 border-slate-50 pb-8 md:flex-row">
        <h2 className="flex items-center gap-3 text-3xl font-black uppercase italic text-slate-900">
          <Users size={32} className="text-blue-600" /> Database Ekosistem
        </h2>
        <div className="relative w-full md:w-96">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20}/>
          <input 
            placeholder="Cari Nama / Email / Role..." 
            className="h-16 w-full rounded-2xl border-4 border-slate-900 pl-14 text-sm font-black uppercase outline-none focus:ring-8 focus:ring-blue-50"
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>
      </div>

      <div className="grid gap-4">
        {talents.filter((t: any) => t.full_name?.toLowerCase().includes(query.toLowerCase())).map((t: any) => (
          <div key={t.id} className="group flex items-center justify-between rounded-3xl border-4 border-slate-900 bg-slate-50 p-6 transition-all hover:translate-x-2 hover:bg-white">
            <div className="flex items-center gap-6">
              <div className="flex size-16 items-center justify-center rounded-2xl bg-slate-900 text-xl font-black text-white">
                {t.full_name?.[0]}
              </div>
              <div>
                <h3 className="flex items-center gap-2 font-black uppercase text-slate-900">
                  {t.full_name} 
                  {t.is_verified && <ShieldCheck size={16} className="text-blue-500" />}
                </h3>
                <div className="mt-1 flex gap-3">
                  <span className="flex items-center gap-1 rounded-full bg-blue-100 px-3 py-1 text-[9px] font-black uppercase italic text-blue-600">
                    {getRoleIcon(t.role)} {t.role}
                  </span>
                  <span className="text-[10px] font-bold uppercase text-slate-400">{t.email}</span>
                </div>
              </div>
            </div>
            <div className="flex gap-3">
              <button className="rounded-xl border-4 border-slate-900 bg-white px-4 py-2 text-[10px] font-black uppercase transition-all hover:bg-slate-900 hover:text-white">Details</button>
              <button onClick={() => onAction("DELETE", t.id)} className="p-3 text-slate-300 transition-colors hover:text-red-600"><Trash2 size={20} /></button>
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}