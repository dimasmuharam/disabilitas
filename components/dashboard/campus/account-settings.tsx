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

      setMessage({ text: "Password berhasil diperbarui!", isError: false });
      setNewPassword("");
      setConfirmPassword("");
    } catch (error: any) {
      setMessage({ text: error.message, isError: true });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* NAVIGATION BACK */}
      <button 
        onClick={onBack}
        className="mb-8 flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-slate-900 transition-colors"
      >
        <ArrowLeft size={16} /> Kembali ke Dashboard
      </button>

      <div className="grid grid-cols-1 gap-10 lg:grid-cols-3">
        {/* INFO PANEL */}
        <div className="space-y-6">
          <div className="rounded-[2.5rem] bg-slate-900 p-8 text-white shadow-2xl">
            <ShieldCheck className="mb-6 text-emerald-400" size={32} />
            <h2 className="text-2xl font-black uppercase italic tracking-tighter leading-none">Keamanan Akun</h2>
            <p className="mt-4 text-[11px] font-medium leading-relaxed opacity-70">
              Kelola kredensial akses institusi Anda. Pastikan password Anda kuat dan rahasia untuk menjaga integritas data riset.
            </p>
          </div>

          <div className="rounded-[2.5rem] border-2 border-slate-100 bg-white p-8">
            <h3 className="mb-4 flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-900">
              <Mail size={14} className="text-blue-600" /> Email Terdaftar
            </h3>
            <p className="text-sm font-bold text-slate-600">{user?.email}</p>
            <p className="mt-2 text-[9px] font-bold italic text-slate-400">
              *Email sinkron dengan sistem otentikasi utama.
            </p>
          </div>
        </div>

        {/* FORM PANEL */}
        <div className="lg:col-span-2">
          <div className="rounded-[3rem] border-4 border-slate-900 bg-white p-10 shadow-[12px_12px_0px_0px_rgba(15,23,42,1)]">
            <form onSubmit={handleUpdatePassword} className="space-y-8">
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
                      className="block w-full rounded-2xl border-2 border-slate-100 bg-slate-50 px-5 py-4 font-bold outline-none transition-all focus:border-slate-900 focus:bg-white"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute inset-y-0 right-4 flex items-center text-slate-300 hover:text-slate-900"
                    >
                      {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                    </button>
                  </div>
                </div>

                {/* CONFIRM PASSWORD */}
                <div className="space-y-3">
                  <label className="ml-1 block text-[10px] font-black uppercase tracking-widest text-slate-400">
                    Konfirmasi Password
                  </label>
                  <input
                    type={showPassword ? "text" : "password"}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="••••••••"
                    required
                    className="block w-full rounded-2xl border-2 border-slate-100 bg-slate-50 px-5 py-4 font-bold outline-none transition-all focus:border-slate-900 focus:bg-white"
                  />
                </div>
              </div>

              {message.text && (
                <div className={`flex items-center gap-3 rounded-2xl border-2 p-4 text-[10px] font-black uppercase animate-in zoom-in-95 ${message.isError ? 'border-red-100 bg-red-50 text-red-600' : 'border-emerald-100 bg-emerald-50 text-emerald-600'}`}>
                  {message.isError ? <AlertTriangle size={16} /> : <ShieldCheck size={16} />}
                  {message.text}
                </div>
              )}

              <div className="flex flex-col items-center justify-between gap-6 pt-4 md:flex-row">
                <div className="flex items-center gap-3 text-amber-600">
                  <KeyRound size={20} />
                  <p className="text-[9px] font-bold leading-tight uppercase italic opacity-80 text-left">
                    Setelah update, Anda harus masuk kembali <br /> menggunakan password baru Anda.
                  </p>
                </div>
                <button
                  type="submit"
                  disabled={loading}
                  className="group flex w-full items-center justify-center gap-3 rounded-2xl bg-slate-900 px-10 py-5 text-[11px] font-black uppercase italic tracking-widest text-white shadow-xl transition-all hover:bg-emerald-600 active:scale-[0.98] disabled:opacity-50 md:w-auto"
                >
                  {loading ? "MEMPROSES..." : (
                    <>
                      <Save size={18} /> UPDATE KREDENSIAL
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>

          {/* DANGER ZONE */}
          <div className="mt-10 rounded-[2.5rem] border-2 border-red-50 bg-red-50/30 p-8 text-left">
            <div className="flex items-start gap-4 text-red-600">
              <AlertTriangle className="shrink-0" size={24} />
              <div>
                <h4 className="text-[11px] font-black uppercase tracking-widest">Zona Berbahaya</h4>
                <p className="mt-1 text-[10px] font-medium leading-relaxed opacity-70">
                  Jika Anda ingin menghapus akun institusi ini secara permanen, harap hubungi Super Admin. <br />
                  Penghapusan akun akan menghilangkan seluruh data riset yang terhubung secara otomatis.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
