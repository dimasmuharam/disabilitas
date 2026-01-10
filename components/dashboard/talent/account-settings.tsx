"use client";

import React, { useState } from "react";
import { createClient } from "@/lib/supabase/client/client";
import { 
  Key, Mail, Eye, EyeOff, Save, 
  CheckCircle2, AlertCircle, ShieldCheck, 
  ArrowLeft, LogOut
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

  const handleUpdateAccount = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ type: "", text: "" });
    const supabase = createClient();

    try {
      // 1. Validasi Password Jika Diisi
      if (formData.newPassword) {
        if (formData.newPassword !== formData.confirmPassword) {
          throw new Error("Konfirmasi kata sandi baru tidak cocok.");
        }
        if (formData.newPassword.length < 6) {
          throw new Error("Kata sandi minimal harus 6 karakter.");
        }
        const { error: pwdError } = await supabase.auth.updateUser({ 
          password: formData.newPassword 
        });
        if (pwdError) throw pwdError;
      }

      // 2. Update Email Jika Berubah
      if (formData.newEmail !== user?.email) {
        const { error: emailError } = await supabase.auth.updateUser({ 
          email: formData.newEmail 
        });
        if (emailError) throw emailError;
        setMessage({ type: "success", text: "Link konfirmasi telah dikirim ke email baru dan lama. Silakan cek inbox Anda." });
      }

      // 3. Pengumuman Berhasil (Aria-Live akan membacakan ini)
      const successText = "Pengaturan keamanan berhasil diperbarui. Mengalihkan ke Overview...";
      setMessage({ type: "success", text: successText });

      // 4. Redirect Otomatis ke Overview
      setTimeout(() => {
        onSuccess();
        window.scrollTo({ top: 0, behavior: "smooth" });
      }, 3000);

    } catch (error: any) {
      setMessage({ type: "error", text: error.message });
      setLoading(false);
    }
  };

  const handleLogoutOthers = async () => {
    setLoading(true);
    const supabase = createClient();
    try {
      const { error } = await supabase.auth.signOut({ scope: 'others' });
      if (error) throw error;
      setMessage({ type: "success", text: "Berhasil keluar dari semua perangkat lain." });
    } catch (error: any) {
      setMessage({ type: "error", text: error.message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-4xl pb-20 font-sans text-slate-900 duration-500 animate-in fade-in">
      <header className="mb-10 px-4">
        <h1 className="flex items-center gap-4 text-4xl font-black uppercase italic tracking-tighter">
          <ShieldCheck className="text-blue-600" size={36} aria-hidden="true" />
          {"Keamanan Akun"}
        </h1>
        <p className="mt-2 text-[10px] font-bold uppercase italic tracking-widest text-slate-400">
          {"Kelola akses masuk dan sesi aktif akun Anda."}
        </p>
      </header>

      {/* REGION PENGUMUMAN UNTUK SCREEN READER */}
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
        {/* SEKSI 1: EMAIL & PASSWORD */}
        <section className="space-y-8 rounded-[3rem] border-2 border-slate-100 bg-white p-10 shadow-sm">
          <h2 className="flex items-center gap-2 text-xs font-black uppercase tracking-[0.2em] text-blue-600">
            <Mail size={16} aria-hidden="true" /> {"Kredensial Akun"}
          </h2>
          <div className="space-y-6">
            <div>
              <label htmlFor="email" className="ml-2 text-[10px] font-bold uppercase text-slate-400">{"Alamat Email"}</label>
              <input 
                id="email" 
                type="email" 
                className="w-full rounded-2xl border-2 border-slate-50 bg-slate-50 p-4 text-sm font-bold outline-none transition-all focus:border-blue-600" 
                value={formData.newEmail} 
                onChange={(e) => setFormData({...formData, newEmail: e.target.value})} 
              />
            </div>
            <div className="grid gap-8 md:grid-cols-2">
              <div className="relative">
                <label htmlFor="new_pwd" className="ml-2 text-[10px] font-bold uppercase text-slate-400">{"Kata Sandi Baru"}</label>
                <input 
                  id="new_pwd" 
                  type={showPassword ? "text" : "password"} 
                  className="w-full rounded-2xl border-2 border-slate-50 bg-slate-50 p-4 text-sm font-bold outline-none transition-all focus:border-purple-600" 
                  value={formData.newPassword} 
                  onChange={(e) => setFormData({...formData, newPassword: e.target.value})} 
                  placeholder="Kosongkan jika tidak ingin ganti"
                />
                <button 
                  type="button" 
                  onClick={() => setShowPassword(!showPassword)} 
                  className="absolute right-4 top-10 text-slate-400 hover:text-purple-600"
                  aria-label={showPassword ? "Sembunyikan kata sandi" : "Tampilkan kata sandi"}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              <div>
                <label htmlFor="conf_pwd" className="ml-2 text-[10px] font-bold uppercase text-slate-400">{"Konfirmasi Kata Sandi"}</label>
                <input 
                  id="conf_pwd" 
                  type={showPassword ? "text" : "password"} 
                  className="w-full rounded-2xl border-2 border-slate-50 bg-slate-50 p-4 text-sm font-bold outline-none transition-all focus:border-purple-600" 
                  value={formData.confirmPassword} 
                  onChange={(e) => setFormData({...formData, confirmPassword: e.target.value})} 
                />
              </div>
            </div>
          </div>
        </section>

        {/* SEKSI 2: LOGOUT PERANGKAT LAIN */}
        <section className="rounded-[3rem] bg-slate-900 p-10 text-white shadow-xl">
          <div className="flex flex-col justify-between gap-6 md:flex-row md:items-center">
            <div className="space-y-2">
              <h2 className="flex items-center gap-2 text-xs font-black uppercase tracking-[0.2em] text-blue-400">
                <LogOut size={16} aria-hidden="true" /> {"Kontrol Sesi Aktif"}
              </h2>
              <p className="max-w-md text-[10px] font-bold uppercase italic leading-relaxed text-slate-400">
                {"Jika Anda login di perangkat publik dan lupa keluar, gunakan fitur ini untuk memutuskan semua koneksi lain demi keamanan."}
              </p>
            </div>
            <button 
              type="button" 
              onClick={handleLogoutOthers}
              className="flex items-center justify-center gap-3 rounded-2xl bg-red-600 px-8 py-4 text-[10px] font-black uppercase text-white transition-all hover:bg-red-700 active:scale-95"
            >
              <LogOut size={16} /> {"Keluar dari Sesi Lain"}
            </button>
          </div>
        </section>

        {/* NAVIGASI & SIMPAN */}
        <div className="flex flex-col justify-end gap-4 pt-4 md:flex-row">
          <button 
            type="button" 
            onClick={() => onSuccess()} 
            className="flex items-center justify-center gap-2 rounded-[2rem] border-2 border-slate-100 px-10 py-5 text-sm font-black uppercase text-slate-500 transition-all hover:bg-slate-50"
          >
            <ArrowLeft size={18} /> {"Kembali"}
          </button>
          <button 
            type="submit" 
            disabled={loading} 
            className="flex items-center justify-center gap-4 rounded-[2rem] bg-slate-900 px-12 py-5 text-sm font-black uppercase italic tracking-widest text-white shadow-2xl transition-all hover:bg-blue-600 disabled:opacity-50"
          >
            {loading ? "Memproses..." : <><Save size={20} aria-hidden="true" /> {"Simpan Perubahan"}</>}
          </button>
        </div>
      </form>
    </div>
  );
}
