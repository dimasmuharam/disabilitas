"use client";

import React, { useState } from "react";
import { supabase } from "@/lib/supabase";
import { 
  Lock, Mail, ShieldCheck, AlertTriangle, 
  ArrowLeft, Eye, EyeOff, Save, KeyRound 
} from "lucide-react";

interface AccountSettingsProps {
  user: any;
  onBack: () => void;
}

export default function AccountSettings({ user, onBack }: AccountSettingsProps) {
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState({ text: "", isError: false });

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validasi Keamanan Riset
    if (newPassword.length < 8) {
      setMessage({ text: "Password minimal harus 8 karakter.", isError: true });
      return;
    }

    if (newPassword !== confirmPassword) {
      setMessage({ text: "Konfirmasi password tidak cocok.", isError: true });
      return;
    }

    setLoading(true);
    setMessage({ text: "", isError: false });

    try {
      const { error } = await supabase.auth.updateUser({
        password: newPassword,
      });

      if (error) throw error;

      setMessage({ text: "Kredensial institusi berhasil diperbarui!", isError: false });
      setNewPassword("");
      setConfirmPassword("");
    } catch (error: any) {
      setMessage({ text: error.message, isError: true });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="text-left duration-500 animate-in fade-in slide-in-from-bottom-4">
      {/* NAVIGATION BACK */}
      <button 
        onClick={onBack}
        className="group mb-8 flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-400 transition-all hover:text-slate-900"
      >
        <ArrowLeft size={16} className="transition-transform group-hover:-translate-x-1" /> Kembali ke Dashboard
      </button>

      <div className="grid grid-cols-1 gap-10 lg:grid-cols-3">
        {/* INFO PANEL (Left) */}
        <div className="space-y-6">
          <div className="relative overflow-hidden rounded-[2.5rem] bg-slate-900 p-8 text-white shadow-2xl">
            <ShieldCheck className="relative z-10 mb-6 text-emerald-400" size={40} />
            <h2 className="relative z-10 text-2xl font-black uppercase italic leading-tight tracking-tighter">Keamanan Akun Institusi</h2>
            <p className="relative z-10 mt-4 text-[11px] font-medium italic leading-relaxed opacity-70">
              Kelola kredensial akses almamater Anda. Pastikan password Anda kuat untuk menjaga integritas data riset nasional.
            </p>
            {/* Decorative Element */}
            <Lock className="absolute -bottom-8 -right-8 opacity-10" size={120} />
          </div>

          <div className="rounded-[2.5rem] border-4 border-slate-900 bg-white p-8 shadow-[8px_8px_0px_0px_rgba(15,23,42,1)]">
            <h3 className="mb-4 flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-900">
              <Mail size={14} className="text-blue-600" /> ID Email Akses
            </h3>
            <p className="truncate text-sm font-black text-slate-900">{user?.email}</p>
            <div className="mt-4 rounded-xl border-2 border-blue-100 bg-blue-50 p-4">
               <p className="text-[9px] font-black uppercase leading-tight text-blue-600">
                *Sinkronisasi Aktif dengan Database Utama
              </p>
            </div>
          </div>
        </div>

        {/* FORM PANEL (Right) */}
        <div className="lg:col-span-2">
          <div className="rounded-[3rem] border-4 border-slate-900 bg-white p-10 shadow-[15px_15px_0px_0px_rgba(15,23,42,1)]">
            <form onSubmit={handleUpdatePassword} className="space-y-10">
              <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
                {/* NEW PASSWORD */}
                <div className="space-y-3">
                  <label className="ml-1 block text-[10px] font-black uppercase tracking-widest text-slate-400">
                    Password Baru
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? "text" : "password"}
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="••••••••"
                      required
                      className="block w-full rounded-2xl border-2 border-slate-100 bg-slate-50 p-5 font-bold outline-none transition-all focus:border-slate-900 focus:bg-white"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute inset-y-0 right-4 flex items-center text-slate-300 transition-colors hover:text-slate-900"
                      aria-label={showPassword ? "Sembunyikan password" : "Tampilkan password"}
                    >
                      {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                    </button>
                  </div>
                </div>

                {/* CONFIRM PASSWORD */}
                <div className="space-y-3">
                  <label className="ml-1 block text-[10px] font-black uppercase tracking-widest text-slate-400">
                    Konfirmasi Ulang
                  </label>
                  <input
                    type={showPassword ? "text" : "password"}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="••••••••"
                    required
                    className="block w-full rounded-2xl border-2 border-slate-100 bg-slate-50 p-5 font-bold outline-none transition-all focus:border-slate-900 focus:bg-white"
                  />
                </div>
              </div>

              {/* Status Message with ARIA-Live */}
              {message.text && (
                <div 
                  role="alert" 
                  aria-live="polite"
                  className={`flex items-center gap-3 rounded-2xl border-2 p-5 text-[10px] font-black uppercase animate-in zoom-in-95 ${message.isError ? 'border-red-200 bg-red-50 text-red-600' : 'border-emerald-200 bg-emerald-50 text-emerald-600'}`}
                >
                  {message.isError ? <AlertTriangle size={18} /> : <ShieldCheck size={18} />}
                  {message.text}
                </div>
              )}

              <div className="flex flex-col items-center justify-between gap-6 border-t-2 border-slate-100 pt-4 md:flex-row">
                <div className="flex items-start gap-3 text-amber-600">
                  <KeyRound size={24} className="mt-1" />
                  <div className="text-left">
                     <p className="text-[10px] font-black uppercase italic tracking-tight">Prosedur Keamanan:</p>
                     <p className="text-[9px] font-bold uppercase leading-relaxed opacity-80">
                        Anda akan otomatis keluar dan harus <br /> masuk kembali setelah pembaruan.
                     </p>
                  </div>
                </div>
                <button
                  type="submit"
                  disabled={loading}
                  className="group flex w-full items-center justify-center gap-3 rounded-[2rem] bg-slate-900 px-12 py-6 text-[11px] font-black uppercase italic tracking-widest text-white shadow-xl transition-all hover:-translate-y-1 hover:bg-emerald-600 active:translate-y-0 disabled:opacity-50 md:w-auto"
                >
                  {loading ? "MENYINKRONKAN..." : (
                    <>
                      <Save size={18} className="group-hover:animate-bounce" /> UPDATE KREDENSIAL
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>

          {/* DANGER ZONE (Ditarik lebih ke bawah untuk keamanan visual) */}
          <div className="mt-10 rounded-[2.5rem] border-2 border-red-200 bg-red-50/20 p-8 text-left transition-all hover:bg-red-50/50">
            <div className="flex items-start gap-4 text-red-600">
              <AlertTriangle className="shrink-0 animate-pulse" size={24} />
              <div>
                <h4 className="text-[11px] font-black uppercase tracking-widest">Zona Pembatalan Akun</h4>
                <p className="mt-2 text-[10px] font-bold italic leading-relaxed opacity-70">
                  Penghapusan akun institusi hanya dapat diproses melalui pengajuan resmi ke Super Admin. <br />
                  Tindakan ini akan memutus seluruh validasi alumni yang telah dilakukan secara permanen.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}