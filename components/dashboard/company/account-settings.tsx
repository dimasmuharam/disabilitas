"use client";

import React, { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { 
  ShieldCheck, Mail, Lock, LogOut, 
  Trash2, AlertTriangle, CheckCircle2, XCircle 
} from "lucide-react";

export default function AccountSettings({ user, onSuccess }: { user: any, onSuccess: () => void }) {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ text: string; type: "success" | "error" | null }>({ text: "", type: null });
  const [newEmail, setNewEmail] = useState(user?.email || "");
  
  // ARIA Announcement State
  const [announcement, setAnnouncement] = useState("");

  const announce = (text: string) => {
    setAnnouncement(text);
    // Reset announcement setelah dibacakan agar bisa dipicu lagi
    setTimeout(() => setAnnouncement(""), 3000);
  };

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const { error } = await supabase.auth.updateUser({ password: "NEW_PASSWORD_FROM_INPUT" }); // Placeholder logika
    
    if (error) {
      announce(`{"Gagal memperbarui kata sandi: "}${error.message}`);
      setMessage({ text: error.message, type: "error" });
    } else {
      announce(`{"Kata sandi berhasil diperbarui. Kembali ke Overview."}`);
      setMessage({ text: "Password updated!", type: "success" });
      setTimeout(onSuccess, 2000); // Otomatis balik ke Overview
    }
    setLoading(false);
  };

  const handleLogoutAll = async () => {
    setLoading(true);
    const { error } = await supabase.auth.signOut({ scope: 'global' });
    if (!error) announce(`{"Berhasil keluar dari semua perangkat."}`);
    setLoading(false);
  };

  const handleDeleteAccount = async () => {
    const confirm = window.confirm(`{"PERINGATAN: Menghapus akun akan menghapus seluruh data perusahaan dan lowongan Anda secara permanen. Lanjutkan?"}`);
    if (confirm) {
      announce(`{"Sedang memproses penghapusan akun."}`);
      // Logika delete akun via admin API atau RPC
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in slide-in-from-bottom-4">
      {/* SCREEN READER ANNOUNCER (Hidden) */}
      <div className="sr-only" aria-live="polite" role="status">
        {announcement}
      </div>

      <section className="bg-white p-10 rounded-[3rem] border-2 border-slate-900 shadow-[8px_8px_0px_0px_rgba(15,23,42,1)] space-y-10">
        <div className="flex items-center gap-4 border-b pb-6">
          <div className="p-3 bg-blue-600 text-white rounded-2xl"><ShieldCheck size={24} /></div>
          <div>
            <h2 className="text-xl font-black uppercase italic tracking-tighter">{"Pengaturan Akun & Keamanan"}</h2>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{"Kelola Kredensial Instansi Anda"}</p>
          </div>
        </div>

        {/* EMAIL SETTINGS */}
        <div className="grid md:grid-cols-3 gap-8 items-start">
          <div className="space-y-1">
            <h3 className="text-sm font-black uppercase tracking-tight">{"Email Akses"}</h3>
            <p className="text-[10px] text-slate-400">{"Gunakan email resmi instansi untuk korespondensi rekrutmen."}</p>
          </div>
          <div className="md:col-span-2 space-y-4">
            <div className="relative">
              <Mail className="absolute left-4 top-4 text-slate-300" size={20} />
              <input 
                type="email" 
                value={newEmail}
                readOnly
                className="w-full pl-12 pr-4 py-4 rounded-2xl border-2 border-slate-100 bg-slate-50 font-bold text-slate-500 cursor-not-allowed"
                aria-label="Email Address (Read Only)"
              />
            </div>
            <p className="text-[9px] font-bold text-amber-600 uppercase italic">{"* Perubahan email memerlukan verifikasi admin."}</p>
          </div>
        </div>

        <hr className="border-slate-100" />

        {/* SECURITY ACTIONS */}
        <div className="grid md:grid-cols-3 gap-8 items-start">
          <div className="space-y-1">
            <h3 className="text-sm font-black uppercase tracking-tight">{"Keamanan Perangkat"}</h3>
            <p className="text-[10px] text-slate-400">{"Lindungi akun dari akses yang tidak dikenal."}</p>
          </div>
          <div className="md:col-span-2 flex flex-wrap gap-4">
            <button 
              onClick={handleLogoutAll}
              className="px-6 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-[10px] font-black uppercase flex items-center gap-2 transition-all"
              aria-label="Logout from all devices"
            >
              <LogOut size={16} /> {"Keluar dari Semua Perangkat"}
            </button>
          </div>
        </div>

        <hr className="border-slate-100" />

        {/* DANGER ZONE */}
        <div className="p-8 bg-red-50 rounded-[2rem] border-2 border-red-100 space-y-6">
          <div className="flex items-center gap-3 text-red-600">
            <AlertTriangle size={24} />
            <h3 className="text-sm font-black uppercase tracking-widest">{"Zona Berbahaya"}</h3>
          </div>
          <div className="flex flex-col md:flex-row justify-between items-center gap-6">
            <p className="text-[10px] font-bold text-red-700/70 leading-relaxed max-w-md">
              {"Menghapus akun akan memutus seluruh akses instansi, menghapus data lowongan, dan riwayat pelamar. Tindakan ini tidak dapat dibatalkan."}
            </p>
            <button 
              onClick={handleDeleteAccount}
              className="px-8 py-4 bg-red-600 text-white rounded-2xl font-black uppercase text-[10px] hover:bg-red-700 transition-all shadow-lg shadow-red-200"
            >
              {"Hapus Akun Perusahaan"}
            </button>
          </div>
        </div>
      </section>

      {/* FEEDBACK UI */}
      {message.text && (
        <div 
          className={`p-4 rounded-2xl flex items-center gap-3 border-2 ${message.type === 'success' ? 'bg-emerald-50 border-emerald-100 text-emerald-700' : 'bg-red-50 border-red-100 text-red-700'}`}
          role="alert"
        >
          {message.type === 'success' ? <CheckCircle2 size={20} /> : <XCircle size={20} />}
          <p className="text-[10px] font-black uppercase">{message.text}</p>
        </div>
      )}
    </div>
  );
}
