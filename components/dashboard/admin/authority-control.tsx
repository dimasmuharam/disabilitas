"use client"

import React from "react"
import { Link2, ShieldAlert, Save } from "lucide-react"

export default function AuthorityControl({ users, onLock }: any) {
  return (
    <section className="space-y-8 rounded-[3.5rem] border-4 border-slate-900 bg-white p-10 shadow-[12px_12px_0px_0px_rgba(15,23,42,1)]">
      <div className="flex items-center gap-4 border-b-4 border-slate-50 pb-6">
         <div className="bg-red-500 p-4 rounded-2xl text-white"><ShieldAlert size={32}/></div>
         <div>
            <h2 className="text-2xl font-black uppercase italic">Authority & Access Control</h2>
            <p className="text-[10px] font-bold text-slate-400 uppercase">Mengatur hirarki akses data sektoral (Agency/Partner Lock)</p>
         </div>
      </div>

      <div className="space-y-4">
        {users.slice(0, 10).map((u: any) => (
          <div key={u.id} className="grid grid-cols-1 md:grid-cols-3 items-center gap-6 p-6 rounded-[2rem] border-2 border-slate-100 bg-slate-50 hover:border-slate-900 transition-all">
            <div>
              <p className="text-[10px] font-black text-blue-600 uppercase italic">User Identity</p>
              <h4 className="font-black uppercase text-slate-900 truncate">{u.full_name}</h4>
              <p className="text-[9px] font-bold text-slate-400 truncate">{u.id}</p>
            </div>
            <div className="space-y-3">
               <label className="text-[9px] font-black uppercase text-slate-400 tracking-widest">Agency Lock ID</label>
               <input 
                defaultValue={u.admin_agency_lock}
                onBlur={(e) => onLock(u.id, "agency", e.target.value)}
                className="w-full h-12 rounded-xl border-2 border-slate-200 bg-white px-4 text-xs font-black uppercase outline-none focus:border-slate-900"
                placeholder="Ex: UUID Instansi"
               />
            </div>
            <div className="space-y-3">
               <label className="text-[9px] font-black uppercase text-slate-400 tracking-widest">Partner Lock ID</label>
               <input 
                defaultValue={u.admin_partner_lock}
                onBlur={(e) => onLock(u.id, "partner", e.target.value)}
                className="w-full h-12 rounded-xl border-2 border-slate-200 bg-white px-4 text-xs font-black uppercase outline-none focus:border-slate-900"
                placeholder="Ex: UUID Mitra"
               />
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}