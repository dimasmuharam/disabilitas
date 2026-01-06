"use client";

import React, { useState } from "react";
import { supabase } from "@/lib/supabase";
import { 
  ShieldCheck, Mail, Lock, LogOut, 
  AlertTriangle, CheckCircle2, XCircle,
  Loader2, Eye, EyeOff
} from "lucide-react";

export default function AccountSettings({ user, onSuccess }: { user: any, onSuccess: () => void }) {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ text: string; type: "success" | "error" | null }>({ text: "", type: null });
  const [email, setEmail] = useState(user?.email || "");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [announcement, setAnnouncement] = useState("");

  const announce = (text: string) => {
    setAnnouncement(text);
    setTimeout(() => setAnnouncement(""), 3000);
  };

  const handleUpdateEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    if (email === user?.email) return;
    setLoading(true);
    try {
      const { error } = await supabase.auth.updateUser({ email });
      if (error) throw error;
      announce(`{"Verifikasi dikirim ke email baru."}`);
      setMessage({ text: `{"Cek email baru Anda."}`, type: "success" });
    } catch (err: any) {
      setMessage({ text: err.message, type: "error" });
    } finally {
      setLoading(false);
    }
  };

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      setMessage({ text: `{"Sandi tidak cocok."}`, type: "error" });
      return;
    }
    setLoading(true);
    try {
      const { error } = await supabase.auth.updateUser({ password });
      if (error) throw error;
      announce(`{"Sandi diperbarui."}`);
      setMessage({ text: `{"Sandi diperbarui!"}`, type: "success" });
      setPassword("");
      setConfirmPassword("");
    } catch (err: any) {
      setMessage({ text: err.message, type: "error" });
    } finally {
      setLoading(false);
    }
  };

  const handleLogoutAll = async () => {
    setLoading(true);
    try {
      await supabase.auth.signOut({ scope: "global" });
      window.location.href = "/login";
    } catch (err: any) {
      announce(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteAccount = () => {
    if (window.confirm(`{"Hapus akun instansi secara permanen?"}`)) {
      alert(`{"Hubungi admin disabilitas.com untuk penghapusan data."}`);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="sr-only" aria-live="polite">{announcement}</div>

      <section className="bg-white p-10 rounded-[3rem] border-2 border-slate-900 shadow-[8px_8px_0px_0px_rgba(15,23,42,1)] space-y-10">
        <div className="flex items-center gap-4 border-b pb-6">
          <div className="p-3 bg-blue-600 text-white rounded-2xl"><ShieldCheck size={24} /></div>
          <div>
            <h2 className="text-xl font-black uppercase italic tracking-tighter">{"Pengaturan Akun"}</h2>
            <p className="text-[10px] font-bold text-slate-400 uppercase">{"Login & Keamanan"}</p>
          </div>
        </div>

        <form onSubmit={handleUpdateEmail} className="grid md:grid-cols-3 gap-8">
          <div className="text-sm font-black uppercase">{"Email"}</div>
          <div className="md:col-span-2 space-y-4">
            <div className="relative">
              <Mail className="absolute left-4 top-4 text-slate-300" size={20} />
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full pl-12 pr-4 py-4 rounded-2xl border-2 border-slate-100 bg-slate-50 font-bold outline-none" />
            </div>
            <button type="submit" disabled={loading || email === user?.email} className="px-6 py-2 bg-slate-900 text-white rounded-xl text-[9px] font-black uppercase disabled:opacity-50">
              {loading ? <Loader2 className="animate-spin" size={14} /> : "{"Simpan Email"}"}
            </button>
          </div>
        </form>

        <hr className="border-slate-100" />

        <form onSubmit={handleUpdatePassword} className="grid md:grid-cols-3 gap-8">
          <div className="text-sm font-black uppercase">{"Sandi"}</div>
          <div className="md:col-span-2 space-y-4">
            <div className="relative">
              <Lock className="absolute left-4 top-4 text-slate-300" size={20} />
              <input type={showPassword ? "text" : "password"} value={password} onChange={(e) => setPassword(e.target.value)} className="w-full pl-12 pr-12 py-4 rounded-2xl border-2 border-slate-100 bg-slate-50 font-bold outline-none" placeholder={`{"Sandi Baru"}`} required />
              <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-4 text-slate-400">
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
            <input type={showPassword ? "text" : "password"} value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} className="w-full px-6 py-4 rounded-2xl border-2 border-slate-100 bg-slate-50 font-bold outline-none" placeholder={`{"Konfirmasi"}`} required />
            <div className="flex justify-end">
              <button type="submit" disabled={loading || !password} className="px-6 py-2 bg-slate-900 text-white rounded-xl text-[9px] font-black uppercase">
                {"Update Sandi"}
              </button>
            </div>
          </div>
        </form>

        <hr className="border-slate-100" />

        <div className="grid md:grid-cols-3 gap-8">
          <div className="text-sm font-black uppercase">{"Sesi"}</div>
          <div className="md:col-span-2">
            <button type="button" onClick={handleLogoutAll} disabled={loading} className="px-6 py-3 bg-slate-100 text-slate-700 rounded-xl text-[10px] font-black uppercase flex items-center gap-2">
              <LogOut size={16} /> {"Logout Global"}
            </button>
          </div>
        </div>

        <hr className="border-slate-100" />

        <div className="p-8 bg-red-50 rounded-[2rem] border-2 border-red-100 flex flex-col md:flex-row justify-between items-center gap-6">
          <p className="text-[10px] font-bold text-red-700 uppercase leading-relaxed max-w-xs">{"Hapus akun instansi secara permanen."}</p>
          <button type="button" onClick={handleDeleteAccount} className="px-8 py-4 bg-red-600 text-white rounded-2xl font-black uppercase text-[10px]">{"Hapus Akun"}</button>
        </div>
      </section>

      {message.text && (
        <div className={`p-4 rounded-2xl flex items-center gap-3 border-2 ${message.type === "success" ? "bg-emerald-50 border-emerald-100 text-emerald-700" : "bg-red-50 border-red-100 text-red-700"}`} role="alert">
          {message.type === "success" ? <CheckCircle2 size={20} /> : <XCircle size={20} />}
          <p className="text-[10px] font-black uppercase">{message.text}</p>
        </div>
      )}
    </div>
  );
}
