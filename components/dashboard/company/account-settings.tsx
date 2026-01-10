"use client";

import React, { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { 
  ShieldCheck, Mail, Lock, Eye, EyeOff, 
  Save, CheckCircle2, AlertCircle, LogOut, 
  ArrowLeft, Loader2, Info
} from "lucide-react";

interface AccountSettingsProps {
  user: any;
  onSuccess: () => void;
}

export default function AccountSettings({ user, onSuccess }: AccountSettingsProps) {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });
  const [showPassword, setShowPassword] = useState(false);

  const [formData, setFormData] = useState({
    newEmail: user?.email || "",
    newPassword: "",
    confirmPassword: "",
  });

  async function handleUpdateAccount(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setMessage({ type: "", text: "" });

    try {
      // 1. UPDATE PASSWORD JIKA DIISI
      if (formData.newPassword) {
        if (formData.newPassword !== formData.confirmPassword) {
          throw new Error("Konfirmasi kata sandi baru tidak cocok.");
        }
        if (formData.newPassword.length < 6) {
          throw new Error("Kata sandi minimal harus 6 karakter untuk keamanan.");
        }
        const { error: pwdError } = await supabase.auth.updateUser({ 
          password: formData.newPassword 
        });
        if (pwdError) throw pwdError;
      }

      // 2. UPDATE EMAIL JIKA BERUBAH
      if (formData.newEmail !== user?.email) {
        const { error: emailError } = await supabase.auth.updateUser({ 
          email: formData.newEmail 
        });
        if (emailError) throw emailError;
        setMessage({ type: "success", text: "Permintaan perubahan email berhasil. Silakan cek inbox email baru Anda untuk konfirmasi." });
      } else if (formData.newPassword) {
        setMessage({ type: "success", text: "Kata sandi berhasil diperbarui." });
      }

      setTimeout(() => {
        if (formData.newEmail === user?.email) onSuccess();
      }, 3000);

    } catch (error: any) {
      setMessage({ type: "error", text: error.message });
    } finally {
      setLoading(false);
    }
  }

  async function handleLogoutGlobal() {
    if (!window.confirm(`{"Keluar dari semua perangkat selain ini?"}`)) return;
    
    setLoading(true);
    try {
      const { error } = await supabase.auth.signOut({ scope: "global" });
      if (error) throw error;
      window.location.href = "/login";
    } catch (error: any) {
      setMessage({ type: "error", text: error.message });
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto max-w-4xl pb-20 font-sans text-slate-900 duration-500 animate-in fade-in">
      <header className="mb-10 px-4">
        <h1 className="flex items-center gap-4 text-4xl font-black uppercase italic tracking-tighter">
          <ShieldCheck className="text-blue-600" size={36} />
          {"Keamanan Akun"}
        </h1>
        <p className="mt-2 text-[10px] font-bold uppercase italic tracking-widest text-slate-400">
          {"Kelola akses masuk dan lindungi data instansi Anda."}
        </p>
      </header>

      {/* ALERT MESSAGE */}
      <div aria-live="polite" className="px-4">
        {message.text && (
          <div className={`mb-8 flex items-center gap-4 rounded-[2rem] border-2 p-6 ${
            message.type === "success" ? "border-emerald-200 bg-emerald-50 text-emerald-800" : "border-red-200 bg-red-50 text-red-800"
          }`}>
            {message.type === "success" ? <CheckCircle2 size={24} /> : <AlertCircle size={24} />}
            <p className="text-sm font-black uppercase italic tracking-tight">{message.text}</p>
          </div>
        )}
      </div>

      <form onSubmit={handleUpdateAccount} className="space-y-10 px-4">
        {/* KREDENSIAL SECTION */}
        <section className="space-y-10 rounded-[3rem] border-2 border-slate-900 bg-white p-10 shadow-[8px_8px_0px_0px_rgba(15,23,42,1)]">
          
          {/* EMAIL INPUT */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Mail className="text-blue-600" size={18} />
              <h2 className="text-xs font-black uppercase tracking-widest">{"Alamat Email Login"}</h2>
            </div>
            <div className="relative">
              <input 
                type="email" 
                className="w-full rounded-2xl border-2 border-slate-100 bg-slate-50 p-4 font-bold outline-none transition-all focus:border-blue-600"
                value={formData.newEmail} 
                onChange={(e) => setFormData({...formData, newEmail: e.target.value})} 
                placeholder={`{"Email resmi instansi"}`}
              />
              <p className="ml-2 mt-2 text-[9px] font-bold uppercase italic text-slate-400">
                {"* Jika email diubah, Anda harus memverifikasi ulang melalui link yang dikirim ke email baru."}
              </p>
            </div>
          </div>

          <hr className="border-slate-100" />

          {/* PASSWORD INPUT */}
          <div className="space-y-6">
            <div className="flex items-center gap-2">
              <Lock className="text-blue-600" size={18} />
              <h2 className="text-xs font-black uppercase tracking-widest">{"Pembaruan Kata Sandi"}</h2>
            </div>
            
            <div className="flex items-start gap-3 rounded-2xl border border-blue-100 bg-blue-50 p-4">
              <Info className="shrink-0 text-blue-600" size={16} />
              <p className="text-[10px] font-bold uppercase leading-relaxed text-blue-700">
                {"Kosongkan kedua kolom di bawah ini jika Anda tidak ingin mengubah kata sandi saat ini."}
              </p>
            </div>

            <div className="grid gap-8 md:grid-cols-2">
              <div className="relative">
                <label className="ml-2 text-[10px] font-bold uppercase text-slate-400">{"Kata Sandi Baru"}</label>
                <input 
                  type={showPassword ? "text" : "password"} 
                  className="w-full rounded-2xl border-2 border-slate-100 bg-slate-50 p-4 font-bold outline-none transition-all focus:border-blue-600"
                  value={formData.newPassword} 
                  onChange={(e) => setFormData({...formData, newPassword: e.target.value})}
                  placeholder={`{"Min. 6 karakter"}`}
                />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-10 text-slate-400 hover:text-blue-600">
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              <div>
                <label className="ml-2 text-[10px] font-bold uppercase text-slate-400">{"Konfirmasi Sandi"}</label>
                <input 
                  type={showPassword ? "text" : "password"} 
                  className="w-full rounded-2xl border-2 border-slate-100 bg-slate-50 p-4 font-bold outline-none transition-all focus:border-blue-600"
                  value={formData.confirmPassword} 
                  onChange={(e) => setFormData({...formData, confirmPassword: e.target.value})}
                  placeholder={`{"Ulangi sandi baru"}`}
                />
              </div>
            </div>
          </div>
        </section>

        {/* LOGOUT GLOBAL */}
        <section className="relative flex flex-col items-center justify-between gap-8 overflow-hidden rounded-[3rem] bg-slate-900 p-10 text-white shadow-xl md:flex-row">
          <div className="pointer-events-none absolute right-0 top-0 p-4 opacity-10">
            <LogOut size={100} />
          </div>
          <div className="relative z-10 space-y-2">
            <h2 className="text-xs font-black uppercase tracking-[0.2em] text-blue-400">{"Keamanan Sesi Global"}</h2>
            <p className="max-w-sm text-[10px] font-bold uppercase italic leading-relaxed text-slate-400">
              {"Gunakan fitur ini jika Anda merasa pernah login di perangkat lain dan lupa melakukan logout."}
            </p>
          </div>
          <button 
            type="button" 
            onClick={handleLogoutGlobal} 
            disabled={loading}
            className="relative z-10 rounded-2xl bg-red-600 px-8 py-4 text-[10px] font-black uppercase text-white shadow-lg transition-all hover:bg-red-700 active:scale-95"
          >
            {"Logout dari Semua Perangkat"}
          </button>
        </section>

        {/* NAVIGATION BUTTONS */}
        <div className="flex flex-col justify-end gap-4 pt-4 md:flex-row">
          <button 
            type="button" 
            onClick={onSuccess} 
            className="flex items-center justify-center gap-3 rounded-[2rem] border-2 border-slate-100 px-10 py-5 text-sm font-black uppercase text-slate-500 transition-all hover:bg-slate-50"
          >
            <ArrowLeft size={18} /> {"Kembali"}
          </button>
          <button 
            type="submit" 
            disabled={loading} 
            className="flex items-center justify-center gap-4 rounded-[2rem] bg-slate-900 px-12 py-5 text-sm font-black uppercase italic tracking-widest text-white shadow-2xl transition-all hover:bg-blue-600 disabled:opacity-50"
          >
            {loading ? (
              <Loader2 className="animate-spin" size={20} />
            ) : (
              <><Save size={20} /> {"Simpan Perubahan"}</>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
