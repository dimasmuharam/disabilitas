"use client";

import React, { useState } from "react";
import { supabase } from "@/lib/supabase";
import { Lock, Mail, LogOut, ShieldAlert, KeyRound } from "lucide-react";

export default function AccountSettings({ session, onBack }: { session: any, onBack: () => void }) {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const handleSignOutAll = async () => {
    setLoading(true);
    const { error } = await supabase.auth.signOut({ scope: 'global' });
    if (!error) window.location.href = "/";
    setLoading(false);
  };

  return (
    <div className="max-w-2xl mx-auto space-y-8 animate-in fade-in duration-500 pb-20">
      <div className="text-center space-y-2">
        <div className="bg-slate-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
          <Lock size={28} className="text-slate-900" />
        </div>
        <h2 className="text-2xl font-black uppercase italic tracking-tighter">Manajemen Akun</h2>
        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Kelola keamanan dan sesi login institusi</p>
      </div>

      <div className="grid gap-6">
        {/* Email Info */}
        <div className="bg-white p-8 rounded-[3rem] border-2 border-slate-50 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-blue-50 text-blue-600 rounded-2xl"><Mail size={20}/></div>
            <div>
              <p className="text-[9px] font-black uppercase text-slate-400 tracking-widest">Email Terdaftar</p>
              <p className="font-bold text-slate-900">{session?.user?.email}</p>
            </div>
          </div>
        </div>

        {/* Change Password Placeholder */}
        <div className="bg-white p-8 rounded-[3rem] border-2 border-slate-50 flex items-center justify-between group hover:border-slate-900 transition-all cursor-pointer">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-slate-50 text-slate-400 rounded-2xl group-hover:bg-slate-900 group-hover:text-white"><KeyRound size={20}/></div>
            <div>
              <p className="text-[9px] font-black uppercase text-slate-400 tracking-widest">Keamanan</p>
              <p className="font-bold text-slate-900 uppercase italic">Ganti Kata Sandi</p>
            </div>
          </div>
          <button className="text-[10px] font-black uppercase text-blue-600">Update</button>
        </div>

        {/* Global Logout Section */}
        <section className="bg-red-50 p-10 rounded-[4rem] border-2 border-red-100 space-y-6">
          <div className="flex items-start gap-4">
            <ShieldAlert className="text-red-500 shrink-0" size={24} />
            <div>
              <h3 className="font-black uppercase italic text-red-700 tracking-tight">Keamanan Sesi Global</h3>
              <p className="text-xs font-medium text-red-600/70 leading-relaxed mt-1">
                Gunakan fitur ini jika Anda merasa akun diakses dari perangkat yang tidak dikenal. Anda akan dikeluarkan dari semua browser dan aplikasi secara instan.
              </p>
            </div>
          </div>
          
          <button 
            onClick={handleSignOutAll}
            disabled={loading}
            className="w-full py-4 bg-red-600 text-white rounded-2xl font-black uppercase tracking-widest text-[10px] hover:bg-red-700 transition-all flex items-center justify-center gap-2"
          >
            <LogOut size={16} /> {loading ? "Memproses..." : "Keluar dari Semua Perangkat"}
          </button>
        </section>
      </div>
    </div>
  );
}
