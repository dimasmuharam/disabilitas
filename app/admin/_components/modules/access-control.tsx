"use client"

import React, { useState } from "react"
import { ShieldCheck, UserPlus, Trash2, Shield, UserCog, Eye } from "lucide-react"

export default function AccessControl({ whitelist = [], onAction }: any) {
  const [newEmail, setNewEmail] = useState("")
  const [newName, setNewName] = useState("")
  const [newLevel, setNewLevel] = useState("researcher")

  return (
    <section className="space-y-8 rounded-[3.5rem] border-4 border-slate-900 bg-white p-10 shadow-[12px_12px_0px_0px_rgba(15,23,42,1)]">
      
      {/* FORM TAMBAH AKSES */}
      <div className="rounded-[2.5rem] bg-slate-900 p-8 text-white">
        <h3 className="flex items-center gap-2 text-sm font-black uppercase italic text-blue-400">
          <UserPlus size={18}/> Daftarkan Otoritas Tim
        </h3>
        <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-4">
          <input 
            placeholder="Nama Lengkap"
            className="h-14 rounded-2xl bg-white/10 px-4 text-xs font-bold uppercase outline-none focus:bg-white/20"
            value={newName} onChange={(e) => setNewName(e.target.value)}
          />
          <input 
            placeholder="Email Tim"
            className="h-14 rounded-2xl bg-white/10 px-4 text-xs font-bold outline-none focus:bg-white/20"
            value={newEmail} onChange={(e) => setNewEmail(e.target.value)}
          />
          <select 
            className="h-14 rounded-2xl bg-white/10 px-4 text-[10px] font-black uppercase outline-none focus:bg-white/20"
            value={newLevel} onChange={(e) => setNewLevel(e.target.value)}
          >
            <option value="researcher" className="text-slate-900">Level: Periset (Baca)</option>
            <option value="staff" className="text-slate-900">Level: Staf (Adminis)</option>
            <option value="admin" className="text-slate-900">Level: Admin (Full)</option>
          </select>
          <button 
            onClick={() => {
              onAction("ADD_WHITELIST", { email: newEmail, name: newName, level: newLevel });
              setNewEmail(""); setNewName("");
            }}
            className="h-14 rounded-2xl bg-blue-600 text-[10px] font-black uppercase hover:bg-blue-500 transition-all"
          >
            Beri Akses
          </button>
        </div>
      </div>

      {/* DAFTAR WHITELIST */}
      <div className="overflow-hidden rounded-3xl border-4 border-slate-900">
        <table className="w-full text-left text-[11px]">
          <thead className="bg-slate-100 font-black uppercase text-slate-500">
            <tr>
              <th className="px-6 py-4">Tim Riset</th>
              <th className="px-6 py-4">Otoritas</th>
              <th className="px-6 py-4 text-right">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y-2 divide-slate-50 font-bold uppercase">
            {whitelist.map((item: any) => (
              <tr key={item.email} className="hover:bg-slate-50">
                <td className="px-6 py-5">
                  <p className="text-slate-900">{item.name}</p>
                  <p className="text-[9px] text-slate-400 lowercase">{item.email}</p>
                </td>
                <td className="px-6 py-5">
                  <span className={`flex w-fit items-center gap-1 rounded-full px-3 py-1 text-[8px] font-black 
                    ${item.access_level === 'admin' ? 'bg-rose-100 text-rose-600' : 
                      item.access_level === 'staff' ? 'bg-amber-100 text-amber-600' : 
                      'bg-blue-100 text-blue-600'}`}>
                    {item.access_level === 'admin' ? <Shield size={10}/> : 
                     item.access_level === 'staff' ? <UserCog size={10}/> : <Eye size={10}/>}
                    {item.access_level}
                  </span>
                </td>
                <td className="px-6 py-5 text-right">
                  <button onClick={() => onAction("REMOVE_WHITELIST", item.email)} className="text-slate-300 hover:text-rose-600">
                    <Trash2 size={18} />
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