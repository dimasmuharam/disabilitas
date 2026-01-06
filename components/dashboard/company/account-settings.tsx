"use client";

import React, { useState } from "react";
import { supabase } from "@/lib/supabase";
import { 
  ShieldCheck, Mail, Lock, Eye, EyeOff, 
  Save, CheckCircle2, AlertCircle, LogOut, 
  ArrowLeft, Loader2 
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
      if (formData.newPassword) {
        if (formData.newPassword !== formData.confirmPassword) {
          throw new Error("Konfirmasi kata sandi tidak cocok.");
        }
        const { error: pwdError } = await supabase.auth.updateUser({ 
          password: formData.newPassword 
        });
        if (pwdError) throw pwdError;
      }

      if (formData.newEmail !== user?.email) {
        const { error: emailError } = await supabase.auth.updateUser({ 
          email: formData.newEmail 
        });
        if (emailError) throw emailError;
        setMessage({ type: "success", text: "Link verifikasi dikirim ke email baru." });
      }

      setMessage({ type: "success", text: "Pengaturan berhasil diperbarui." });
      setTimeout(() => onSuccess(), 2000);
    } catch (error: any) {
      setMessage({ type: "error", text: error.message });
    } finally {
      setLoading(false);
    }
  }

  async function handleLogoutGlobal() {
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

  function handleDeleteAccount() {
    if (window.confirm(`{"Hapus akun instansi secara permanen?"}`)) {
      alert(`{"Hubungi admin disabilitas.com untuk penghapusan data."}`);
    }
  }

  return (
    <div className="max-w-4xl mx-auto pb-20 font-sans text-slate-900">
      <header className="mb-10 px-4">
        <h1 className="text-4xl font-black italic uppercase tracking-tighter flex items-center gap-4">
          <ShieldCheck className="text-blue-600" size={36} />
          {"Keamanan Akun"}
        </h1>
      </header>

      {message.text && (
        <div className={`mx-4 mb-8 p-6 rounded-[2rem] border-2 flex items-center gap-4 ${
          message.type === "success" ? "bg-emerald-50 border-emerald-200 text-emerald-800" : "bg-red-50 border-red-200 text-red-800"
        }`}>
          {message.type === "success" ? <CheckCircle2 size={24} /> : <AlertCircle size={24} />}
          <p className="text-sm font-black uppercase italic">{message.text}</p>
        </div>
      )}

      <form onSubmit={handleUpdateAccount} className="space-y-10 px-4">
        <section className="bg-white p-10 rounded-[3rem] border-2 border-slate-900 shadow-[8px_8px_0px_0px_rgba(15,23,42,1)] space-y-8">
          <div className="space-y-6">
            <div>
              <label className="text-[10px] font-bold uppercase ml-2 text-slate-400">{"Email"}</label>
              <input type="email" className="w-full bg-slate-50 border-2 border-slate-100 p-4 rounded-2xl font-bold outline-none focus:border-blue-600" value={formData.newEmail} onChange={(e) => setFormData({...formData, newEmail: e.target.value})} />
            </div>
            <div className="grid md:grid-cols-2 gap-8">
              <div className="relative">
                <label className="text-[10px] font-bold uppercase ml-2 text-slate-400">{"Sandi Baru"}</label>
                <input type={showPassword ? "text" : "password"} className="w-full bg-slate-50 border-2 border-slate-100 p-4 rounded-2xl font-bold outline-none focus:border-blue-600" value={formData.newPassword} onChange={(e) => setFormData({...formData, newPassword: e.target.value})} />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-10 text-slate-400">
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              <div>
                <label className="text-[10px] font-bold uppercase ml-2 text-slate-400">{"Konfirmasi"}</label>
                <input type={showPassword ? "text" : "password"} className="w-full bg-slate-50 border-2 border-slate-100 p-4 rounded-2xl font-bold outline-none focus:border-blue-600" value={formData.confirmPassword} onChange={(e) => setFormData({...formData, confirmPassword: e.target.value})} />
              </div>
            </div>
          </div>
        </section>

        <section className="bg-slate-900 p-10 rounded-[3rem] text-white flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="text-xs font-black uppercase tracking-widest text-blue-400">{"Logout Global"}</div>
          <button type="button" onClick={handleLogoutGlobal} className="bg-red-600 hover:bg-red-700 text-white px-8 py-4 rounded-2xl text-[10px] font-black uppercase">{"Logout Semua Perangkat"}</button>
        </section>

        <section className="bg-red-50 p-10 rounded-[3rem] border-2 border-red-100 flex justify-between items-center">
          <p className="text-[10px] font-bold text-red-700 uppercase">{"Hapus akun instansi."}</p>
          <button type="button" onClick={handleDeleteAccount} className="text-red-600 font-black uppercase text-[10px] underline">{"Hapus Akun"}</button>
        </section>

        <div className="flex justify-end gap-4">
          <button type="button" onClick={onSuccess} className="px-10 py-5 rounded-[2rem] font-black uppercase text-sm text-slate-500 border-2">{"Kembali"}</button>
          <button type="submit" disabled={loading} className="bg-slate-900 text-white px-12 py-5 rounded-[2rem] font-black uppercase text-sm flex items-center gap-4 hover:bg-blue-600 disabled:opacity-50">
            {loading ? <Loader2 className="animate-spin" size={20} /> : "{"Simpan Perubahan"}"}
          </button>
        </div>
      </form>
    </div>
  );
}
