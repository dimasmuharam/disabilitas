"use client";

import React, { useState } from "react";
import { supabase } from "@/lib/supabase";
import { Lock, Mail, LogOut, ShieldAlert, KeyRound } from "lucide-react";

// SEKARANG MENGGUNAKAN PROPS 'user' AGAR SERAGAM
export default function AccountSettings({ user, onBack }: { user: any, onBack: () => void }) {
  const [loading, setLoading] = useState(false);

  const handleSignOutAll = async () => {
    setLoading(true);
    // Menggunakan scope global untuk logout dari semua perangkat
    const { error } = await supabase.auth.signOut({ scope: 'global' });
    if (!error) window.location.href = "/";
    setLoading(false);
  };

  return (
    <div className="mx-auto max-w-2xl animate-in fade-in pb-20 duration-500">
      <div className="space-y-2 text-center">
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-slate-100">
          <Lock size={28} className="text-slate-900" />
        </div>
        <h2 className="text-2xl font-black uppercase italic tracking-tighter">Manajemen Akun</h2>
        <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Kelola keamanan dan sesi login institusi</p>
      </div>

      <div className="mt-10 grid gap-6">
        {/* Email Info */}
        <div className="flex items-center justify-between rounded-[3rem] border-2 border-slate-50 bg-white p-8">
          <div className="flex items-center gap-4">
            <div className="rounded-2xl bg-blue-50 p-3 text-blue-600">
              <Mail size={20} />
            </div>
            <div>
              <p className="text-[9px] font-black uppercase tracking-widest text-slate-400">Email Terdaftar</p>
              <p className="font-bold text-slate-900">{user?.email}</p>
            </div>
          </div>
        </div>

        {/* Change Password Link */}
        <div className="group flex cursor-pointer items-center justify-between rounded-[3rem] border-2 border-slate-50 bg-white p-8 transition-all hover:border-slate-900">
          <div className="flex items-center gap-4">
            <div className="rounded-2xl bg-slate-50 p-3 text-slate-400 group-hover:bg-slate-900 group-hover:text-white">
              <KeyRound size={20} />
            </div>
            <div>
              <p className="text-[9px] font-black uppercase tracking-widest text-slate-400">Keamanan</p>
              <p className="font-bold uppercase italic text-slate-900">Ganti Kata Sandi</p>
            </div>
          </div>
          <span className="text-[10px] font-black uppercase text-blue-600">Update</span>
        </div>

        {/* Global Logout */}
        <section className="space-y-6 rounded-[4rem] border-2 border-red-100 bg-red-50 p-10">
          <div className="flex items-start gap-4">
            <ShieldAlert className="shrink-0 text-red-500" size={24} />
            <div>
              <h3 className="font-black uppercase italic tracking-tight text-red-700">Keamanan Sesi Global</h3>
              <p className="mt-1 text-xs font-medium leading-relaxed text-red-600/70">
                Gunakan fitur ini jika Anda merasa akun diakses dari perangkat yang tidak dikenal. 
                Anda akan dikeluarkan dari semua browser dan aplikasi secara instan.
              </p>
            </div>
          </div>
          
          <button 
            onClick={handleSignOutAll}
            disabled={loading}
            className="flex w-full items-center justify-center gap-2 rounded-2xl bg-red-600 py-4 text-[10px] font-black uppercase tracking-widest text-white transition-all hover:bg-red-700"
          >
            <LogOut size={16} /> {loading ? "Memproses..." : "Keluar dari Semua Perangkat"}
          </button>
        </section>
      </div>
    </div>
  );
}
