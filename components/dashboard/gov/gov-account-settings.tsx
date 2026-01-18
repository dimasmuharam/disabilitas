"use client";

import React, { useState } from "react";
import { supabase } from "@/lib/supabase";
import { 
  KeyRound, ShieldAlert, LogOut, Mail, 
  Lock, Loader2, CheckCircle2, AlertCircle 
} from "lucide-react";

export default function GovAccountSettings({ user }: { user: any }) {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ msg: string; type: 'success' | 'error' | null }>({ msg: "", type: null });
  
  // States untuk Keamanan
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [newEmail, setNewEmail] = useState(user?.email || "");

  const notify = (msg: string, type: 'success' | 'error') => {
    setMessage({ msg, type });
    setTimeout(() => setMessage({ msg: "", type: null }), 5000);
  };

  // 1. UPDATE EMAIL (Membutuhkan password saat ini)
  const handleUpdateEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentPassword) return notify("Masukkan password saat ini untuk keamanan", "error");
    
    setLoading(true);
    try {
      // Re-autentikasi (Opsional tergantung policy Supabase, tapi disarankan)
      const { error: authError } = await supabase.auth.signInWithPassword({
        email: user.email,
        password: currentPassword,
      });
      if (authError) throw new Error("Password saat ini salah.");

      const { error } = await supabase.auth.updateUser({ email: newEmail });
      if (error) throw error;

      notify("Permintaan perubahan email dikirim. Cek inbox email baru Anda.", "success");
      setCurrentPassword("");
    } catch (err: any) {
      notify(err.message, "error");
    } finally {
      setLoading(false);
    }
  };

  // 2. UPDATE PASSWORD
  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentPassword || !newPassword) return notify("Lengkapi form password", "error");

    setLoading(true);
    try {
      const { error: authError } = await supabase.auth.signInWithPassword({
        email: user.email,
        password: currentPassword,
      });
      if (authError) throw new Error("Password saat ini salah.");

      const { error } = await supabase.auth.updateUser({ password: newPassword });
      if (error) throw error;

      notify("Password berhasil diperbarui secara aman.", "success");
      setCurrentPassword("");
      setNewPassword("");
    } catch (err: any) {
      notify(err.message, "error");
    } finally {
      setLoading(false);
    }
  };

  // 3. LOGOUT DARI SEMUA PERANGKAT
  const handleSignOutAll = async () => {
    const confirmed = window.confirm(
      "PERINGATAN: Anda akan dikeluarkan dari SEMUA perangkat yang sedang login. Anda harus login kembali setelah ini. Lanjutkan?"
    );
    
    if (confirmed) {
      setLoading(true);
      const { error } = await supabase.auth.signOut({ scope: 'global' });
      if (error) notify(error.message, "error");
      window.location.href = "/masuk";
    }
  };

  return (
    <div className="max-w-3xl space-y-10 animate-in fade-in duration-500">
      
      {/* HEADER KEAMANAN */}
      <div className="rounded-[2.5rem] border-4 border-slate-900 bg-rose-50 p-8">
        <div className="flex items-center gap-4">
          <div className="rounded-2xl bg-rose-500 p-3 text-white">
            <ShieldAlert size={24} />
          </div>
          <div>
            <h3 className="text-xl font-black uppercase italic tracking-tight text-slate-900">Pusat Keamanan Akun</h3>
            <p className="text-[10px] font-bold uppercase text-rose-600">Kelola kredensial login dan sesi aktif instansi Anda</p>
          </div>
        </div>
      </div>

      {/* TOAST MESSAGE - ARIA LIVE */}
      {message.msg && (
        <div 
          role="alert" 
          aria-live="assertive"
          className={`flex items-center gap-3 rounded-2xl border-4 border-slate-900 px-6 py-4 font-black uppercase italic shadow-[8px_8px_0px_0px_rgba(15,23,42,1)] ${message.type === 'success' ? 'bg-emerald-400' : 'bg-rose-400'}`}
        >
          {message.type === 'success' ? <CheckCircle2 size={20} /> : <AlertCircle size={20} />}
          <span>{message.msg}</span>
        </div>
      )}

      {/* STEP 1: VERIFIKASI IDENTITAS (Password Saat Ini) */}
      <div className="rounded-[2.5rem] border-4 border-slate-900 bg-white p-8 shadow-[8px_8px_0px_0px_rgba(15,23,42,1)]">
        <div className="mb-6 flex items-center gap-2 text-slate-400">
          <Lock size={16} />
          <label htmlFor="current-pw" className="text-[10px] font-black uppercase tracking-widest">Konfirmasi Password Saat Ini</label>
        </div>
        <input 
          id="current-pw"
          type="password" 
          value={currentPassword}
          onChange={(e) => setCurrentPassword(e.target.value)}
          placeholder="Masukkan password Anda untuk melakukan perubahan"
          className="w-full rounded-2xl border-4 border-slate-900 bg-slate-50 p-4 font-bold outline-none focus:bg-white focus:ring-4 focus:ring-blue-100"
        />
      </div>

      <div className="grid gap-8 md:grid-cols-2">
        {/* FORM GANTI EMAIL */}
        <form onSubmit={handleUpdateEmail} className="flex flex-col rounded-[2.5rem] border-4 border-slate-900 bg-white p-8 shadow-[8px_8px_0px_0px_rgba(15,23,42,1)]">
          <div className="mb-6 flex items-center gap-3 border-b-2 border-slate-100 pb-4 text-slate-900">
            <Mail size={20} />
            <h4 className="font-black uppercase italic tracking-tight">Update Email</h4>
          </div>
          <div className="flex-1 space-y-4">
            <input 
              type="email" 
              value={newEmail} 
              onChange={(e) => setNewEmail(e.target.value)}
              className="w-full rounded-xl border-2 border-slate-200 p-3 font-bold outline-none focus:border-slate-900"
              aria-label="Email Baru"
            />
            <button 
              type="submit" 
              disabled={loading || !currentPassword}
              className="w-full rounded-xl bg-slate-900 py-3 text-[10px] font-black uppercase italic text-white hover:bg-blue-600 disabled:opacity-30 transition-all"
            >
              Simpan Email Baru
            </button>
          </div>
        </form>

        {/* FORM GANTI PASSWORD */}
        <form onSubmit={handleUpdatePassword} className="flex flex-col rounded-[2.5rem] border-4 border-slate-900 bg-white p-8 shadow-[8px_8px_0px_0px_rgba(15,23,42,1)]">
          <div className="mb-6 flex items-center gap-3 border-b-2 border-slate-100 pb-4 text-slate-900">
            <KeyRound size={20} />
            <h4 className="font-black uppercase italic tracking-tight">Ganti Password</h4>
          </div>
          <div className="flex-1 space-y-4">
            <input 
              type="password" 
              value={newPassword} 
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="Password Baru"
              className="w-full rounded-xl border-2 border-slate-200 p-3 font-bold outline-none focus:border-slate-900"
              aria-label="Password Baru"
            />
            <button 
              type="submit" 
              disabled={loading || !currentPassword}
              className="w-full rounded-xl bg-slate-900 py-3 text-[10px] font-black uppercase italic text-white hover:bg-rose-600 disabled:opacity-30 transition-all"
            >
              Update Password
            </button>
          </div>
        </form>
      </div>

      {/* LOGOUT DARI SEMUA DEVICES */}
      <div className="flex flex-col items-center justify-between gap-6 rounded-[2.5rem] border-4 border-slate-900 bg-slate-900 p-8 text-white md:flex-row">
        <div className="flex items-center gap-4">
          <LogOut className="text-rose-400" size={32} />
          <div>
            <h4 className="font-black uppercase italic tracking-tight">Logout Global</h4>
            <p className="text-[9px] font-bold uppercase text-slate-400">Putuskan semua sesi aktif di perangkat lain</p>
          </div>
        </div>
        <button 
          onClick={handleSignOutAll}
          disabled={loading}
          className="rounded-2xl bg-rose-500 px-8 py-4 text-[10px] font-black uppercase tracking-widest text-white hover:bg-white hover:text-rose-600 transition-all active:translate-y-1"
        >
          Keluar Semua Sesi
        </button>
      </div>
    </div>
  );
}