"use client";

import React, { useState } from "react";
import { supabase } from "@/lib/supabase";
import { 
  ShieldCheck, Mail, Lock, LogOut, 
  AlertTriangle, CheckCircle2, XCircle,
  Loader2, Eye, EyeOff, Save, ArrowLeft
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

    try {
      // 1. UPDATE PASSWORD JIKA DIISI
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

      // 2. UPDATE EMAIL JIKA BERUBAH
      if (formData.newEmail !== user?.email) {
        const { error: emailError } = await supabase.auth.updateUser({ 
          email: formData.newEmail 
        });
        if (emailError) throw emailError;
        setMessage({ type: "success", text: "Link konfirmasi dikirim ke email baru. Silakan cek inbox Anda." });
      }

      const successText = "Pengaturan keamanan berhasil diperbarui.";
      setMessage({ type: "success", text: successText });

      setTimeout(() => {
        onSuccess();
      }, 2500);

    } catch (error: any) {
      setMessage({ type: "error", text: error.message });
      setLoading(false);
    }
  };

  const handleLogoutOthers = async () => {
    setLoading(true);
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

  const handleDeleteAccount = () => {
    if (window.confirm(`{"PERINGATAN: Menghapus akun akan menghapus seluruh data instansi secara permanen. Lanjutkan?"}`)) {
      alert(`{"Silakan hubungi admin disabilitas.com untuk proses penghapusan data instansi Anda."}`);
    }
  };

  return (
    <div className="max-w-4xl mx-auto pb-20 animate-in fade-in duration-500 font-sans text-slate-900">
      <header className="mb-10 px-4">
        <h1 className="text-4xl font-black italic uppercase tracking-tighter flex items-center gap-4">
          <ShieldCheck className="text-blue-600" size={36} aria-hidden="true" />
          {"Keamanan Akun"}
        </h1>
        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-2 italic">
          {"Kelola kredensial login dan akses instansi Anda."}
        </p>
      </header>

      {/* NOTIFIKASI */}
      <div aria-live="polite" className="px-4">
        {message.text && (
          <div className={`mb-8 p-6 rounded-[2rem] border-2 flex items-center gap-4 ${
            message.type === "success" ? "bg-emerald-50 border-emerald-200 text-emerald-800" : "bg-red-50 border-red-200 text-red-800"
          }`}>
            {message.type === "success" ? <CheckCircle2 size={24} /> : <AlertCircle size={24} />}
            <p className="text-sm font-black uppercase italic tracking-tight">{message.text}</p>
          </div>
        )}
      </div>

      <form onSubmit={handleUpdateAccount} className="space-y-10 px-4">
        {/* KREDENSIAL */}
        <section className="bg-white p-10 rounded-[3rem] border-2 border-slate-900 shadow-[8px_8px_0px_0px_rgba(15,23,42,1)] space-y-8">
          <h2 className="text-xs font-black uppercase text-blue-600 tracking-[0.2em] flex items-center gap-2">
            <Mail size={16} aria-hidden="true" /> {"Login & Akses"}
          </h2>
          <div className="space-y-6">
            <div>
              <label htmlFor="email" className="text-[10px] font-bold uppercase ml-2 text-slate-400">{"Email Resmi Instansi"}</label>
              <input 
                id="email" type="email" 
                className="w-full bg-slate-50 border-2 border-slate-100 p-4 rounded-2xl font-bold outline-none focus:border-blue-600 transition-all text-sm" 
                value={formData.newEmail} 
                onChange={(e) => setFormData({...formData, newEmail: e.target.value})} 
              />
            </div>
            <div className="grid md:grid-cols-2 gap-8">
              <div className="relative">
                <label htmlFor="new_pwd" className="text-[10px] font-bold uppercase ml-2 text-slate-400">{"Kata Sandi Baru"}</label>
                <input 
                  id="new_pwd" type={showPassword ? "text" : "password"} 
                  className="w-full bg-slate-50 border-2 border-slate-100 p-4 rounded-2xl font-bold outline-none focus:border-blue-600 transition-all text-sm" 
                  value={formData.newPassword} 
                  onChange={(e) => setFormData({...formData, newPassword: e.target.value})} 
                  placeholder="Isi untuk mengganti"
                />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-10 text-slate-400">
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              <div>
                <label htmlFor="conf_pwd" className="text-[10px] font-bold uppercase ml-2 text-slate-400">{"Konfirmasi Sandi"}</label>
                <input 
                  id="conf_pwd" type={showPassword ? "text" : "password"} 
                  className="w-full bg-slate-50 border-2 border-slate-100 p-4 rounded-2xl font-bold outline-none focus:border-blue-600 transition-all text-sm" 
                  value={formData.confirmPassword} 
                  onChange={(e) => setFormData({...formData, confirmPassword: e.target.value})} 
                />
              </div>
            </div>
          </div>
        </form>

        {/* SESSION CONTROL */}
        <section className="bg-slate-900 p-10 rounded-[3rem] shadow-xl text-white">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="space-y-2">
              <h2 className="text-xs font-black uppercase text-blue-400 tracking-[0.2em] flex items-center gap-2">
                <LogOut size={16} aria-hidden="true" /> {"Sesi Global"}
              </h2>
              <p className="text-[10px] font-bold text-slate-400 uppercase leading-relaxed italic max-w-md">{"Logout dari semua perangkat lain untuk keamanan tambahan."}</p>
            </div>
            <button type="button" onClick={handleLogoutOthers} className="bg-white/10 hover:bg-white/20 text-white px-8 py-4 rounded-2xl text-[10px] font-black uppercase transition-all">{"Keluar Sesi Lain"}</button>
          </div>
        </section>

        {/* DANGER ZONE */}
        <section className="bg-red-50 p-10 rounded-[3rem] border-2 border-red-100 flex flex-col md:flex-row items-center justify-between gap-6">
          <p className="text-[10px] font-bold text-red-700 uppercase">{"Hapus seluruh data instansi secara permanen."}</p>
          <button type="button" onClick={handleDeleteAccount} className="bg-red-600 text-white px-8 py-4 rounded-2xl text-[10px] font-black uppercase">{"Hapus Akun"}</button>
        </section>

        {/* BUTTONS */}
        <div className="flex flex-col md:flex-row justify-end gap-4">
          <button type="button" onClick={() => onSuccess()} className="px-10 py-5 rounded-[2rem] font-black uppercase text-sm text-slate-500 border-2 border-slate-100">{"Kembali"}</button>
          <button type="submit" disabled={loading} className="bg-slate-900 text-white px-12 py-5 rounded-[2rem] font-black uppercase text-sm flex items-center justify-center gap-4 hover:bg-blue-600 transition-all disabled:opacity-50">
            {loading ? <Loader2 className="animate-spin" size={20} /> : "{"Simpan Perubahan"}"}
          </button>
        </div>
      </form>
    </div>
  );
}
