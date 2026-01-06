"use client";

import React, { useState } from "react";
import { supabase } from "@/lib/supabase";
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
    <div className="max-w-4xl mx-auto pb-20 font-sans text-slate-900 animate-in fade-in duration-500">
      <header className="mb-10 px-4">
        <h1 className="text-4xl font-black italic uppercase tracking-tighter flex items-center gap-4">
          <ShieldCheck className="text-blue-600" size={36} />
          {"Keamanan Akun"}
        </h1>
        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-2 italic">
          {"Kelola akses masuk dan lindungi data instansi Anda."}
        </p>
      </header>

      {/* ALERT MESSAGE */}
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
        {/* KREDENSIAL SECTION */}
        <section className="bg-white p-10 rounded-[3rem] border-2 border-slate-900 shadow-[8px_8px_0px_0px_rgba(15,23,42,1)] space-y-10">
          
          {/* EMAIL INPUT */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Mail className="text-blue-600" size={18} />
              <h2 className="text-xs font-black uppercase tracking-widest">{"Alamat Email Login"}</h2>
            </div>
            <div className="relative">
              <input 
                type="email" 
                className="w-full bg-slate-50 border-2 border-slate-100 p-4 rounded-2xl font-bold outline-none focus:border-blue-600 transition-all"
                value={formData.newEmail} 
                onChange={(e) => setFormData({...formData, newEmail: e.target.value})} 
                placeholder={`{"Email resmi instansi"}`}
              />
              <p className="text-[9px] font-bold text-slate-400 mt-2 ml-2 uppercase italic">
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
            
            <div className="bg-blue-50 p-4 rounded-2xl flex items-start gap-3 border border-blue-100">
              <Info className="text-blue-600 shrink-0" size={16} />
              <p className="text-[10px] font-bold text-blue-700 uppercase leading-relaxed">
                {"Kosongkan kedua kolom di bawah ini jika Anda tidak ingin mengubah kata sandi saat ini."}
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-8">
              <div className="relative">
                <label className="text-[10px] font-bold uppercase ml-2 text-slate-400">{"Kata Sandi Baru"}</label>
                <input 
                  type={showPassword ? "text" : "password"} 
                  className="w-full bg-slate-50 border-2 border-slate-100 p-4 rounded-2xl font-bold outline-none focus:border-blue-600 transition-all"
                  value={formData.newPassword} 
                  onChange={(e) => setFormData({...formData, newPassword: e.target.value})}
                  placeholder={`{"Min. 6 karakter"}`}
                />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-10 text-slate-400 hover:text-blue-600">
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              <div>
                <label className="text-[10px] font-bold uppercase ml-2 text-slate-400">{"Konfirmasi Sandi"}</label>
                <input 
                  type={showPassword ? "text" : "password"} 
                  className="w-full bg-slate-50 border-2 border-slate-100 p-4 rounded-2xl font-bold outline-none focus:border-blue-600 transition-all"
                  value={formData.confirmPassword} 
                  onChange={(e) => setFormData({...formData, confirmPassword: e.target.value})}
                  placeholder={`{"Ulangi sandi baru"}`}
                />
              </div>
            </div>
          </div>
        </section>

        {/* LOGOUT GLOBAL */}
        <section className="bg-slate-900 p-10 rounded-[3rem] text-white flex flex-col md:flex-row justify-between items-center gap-8 shadow-xl relative overflow-hidden">
          <div className="absolute top-0 right-0 p-4 opacity-10 pointer-events-none">
            <LogOut size={100} />
          </div>
          <div className="space-y-2 relative z-10">
            <h2 className="text-xs font-black uppercase text-blue-400 tracking-[0.2em]">{"Keamanan Sesi Global"}</h2>
            <p className="text-[10px] font-bold text-slate-400 uppercase leading-relaxed italic max-w-sm">
              {"Gunakan fitur ini jika Anda merasa pernah login di perangkat lain dan lupa melakukan logout."}
            </p>
          </div>
          <button 
            type="button" 
            onClick={handleLogoutGlobal} 
            disabled={loading}
            className="bg-red-600 hover:bg-red-700 text-white px-8 py-4 rounded-2xl text-[10px] font-black uppercase transition-all active:scale-95 shadow-lg relative z-10"
          >
            {"Logout dari Semua Perangkat"}
          </button>
        </section>

        {/* NAVIGATION BUTTONS */}
        <div className="flex flex-col md:flex-row justify-end gap-4 pt-4">
          <button 
            type="button" 
            onClick={onSuccess} 
            className="px-10 py-5 rounded-[2rem] font-black uppercase text-sm text-slate-500 border-2 border-slate-100 hover:bg-slate-50 transition-all flex items-center justify-center gap-3"
          >
            <ArrowLeft size={18} /> {"Kembali"}
          </button>
          <button 
            type="submit" 
            disabled={loading} 
            className="bg-slate-900 text-white px-12 py-5 rounded-[2rem] font-black uppercase italic tracking-widest text-sm flex items-center justify-center gap-4 hover:bg-blue-600 transition-all shadow-2xl disabled:opacity-50"
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
