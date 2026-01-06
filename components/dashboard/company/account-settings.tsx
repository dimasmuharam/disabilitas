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
  
  // States untuk Form
  const [email, setEmail] = useState(user?.email || "");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  
  // ARIA Announcement State untuk Aksesibilitas Screen Reader
  const [announcement, setAnnouncement] = useState("");

  const announce = (text: string) => {
    setAnnouncement(text);
    setTimeout(() => setAnnouncement(""), 3000);
  };

  const handleUpdateEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    if (email === user?.email) return;
    
    setLoading(true);
    setMessage({ text: "", type: null });

    try {
      const { error } = await supabase.auth.updateUser({ email: email });
      if (error) throw error;

      announce(`{"Permintaan ganti email terkirim. Silakan cek email baru Anda untuk konfirmasi."}`);
      setMessage({ 
        text: `{"Permintaan terkirim! Cek kotak masuk email baru Anda untuk verifikasi."}`, 
        type: "success" 
      });
    } catch (error: any) {
      announce(`{"Gagal memperbarui email: "}${error.message}`);
      setMessage({ text: error.message, type: "error" });
    } finally {
      setLoading(false);
    }
  };

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      announce(`{"Kata sandi tidak cocok."}`);
      setMessage({ text: `{"Konfirmasi kata sandi tidak cocok."}`, type: "error" });
      return;
    }

    setLoading(true);
    setMessage({ text: "", type: null });

    try {
      const { error } = await supabase.auth.updateUser({ password: password });
      if (error) throw error;

      announce(`{"Kata sandi berhasil diperbarui."}`);
      setMessage({ text: `{"Kata sandi berhasil diperbarui!"}`, type: "success" });
      setPassword("");
      setConfirmPassword("");
    } catch (error: any) {
      announce(`{"Gagal memperbarui kata sandi: "}${error.message}`);
      setMessage({ text: error.message, type: "error" });
    } finally {
      setLoading(false);
    }
  };

  const handleLogoutAll = async () => {
    setLoading(true);
    try {
      const { error } = await supabase.auth.signOut({ scope: 'global' });
      if (error) throw error;
      announce(`{"Berhasil keluar dari semua perangkat."}`);
      window.location.href = "/login";
    } catch (error: any) {
      announce(`{"Gagal keluar: "}${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteAccount = () => {
    const confirm = window.confirm(`{"PERINGATAN: Menghapus akun akan menghapus seluruh data instansi secara permanen. Lanjutkan?"}`);
    if (confirm) {
      announce(`{"Fitur penghapusan akun memerlukan konfirmasi admin."}`);
      alert(`{"Silakan hubungi admin disabilitas.com untuk proses penghapusan data instansi Anda."}`);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in slide-in-from-bottom-4">
      {/* Hidden announcer for screen readers */}
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

        {/* SECTION: GANTI EMAIL */}
        <form onSubmit={handleUpdateEmail} className="grid md:grid-cols-3 gap-8 items-start">
          <div className="space-y-1">
            <h3 className="text-sm font-black uppercase tracking-tight">{"Email Akses"}</h3>
            <p className="text-[10px] text-slate-400">{"Email utama untuk login dan notifikasi."}</p>
          </div>
          <div className="md:col-span-2 space-y-4">
            <div className="relative">
              <Mail className="absolute left-4 top-4 text-slate-300" size={20} />
              <input 
                type="email" 
                value={email} 
                onChange={(e) => setEmail(e.target.value)} 
                className="w-full pl-12 pr-4 py-4 rounded-2xl border-2 border-slate-100 bg-slate-50 font-bold focus:border-blue-600 outline-none" 
                placeholder={`{"Email Baru"}`} 
                aria-label="New Email Address"
              />
            </div>
            <div className="flex justify-between items-center">
              <p className="text-[9px] font-bold text-amber-600 uppercase italic">{"* Perlu verifikasi di email baru."}</p>
              <button 
                type="submit" 
                disabled={loading || email === user?.email} 
                className="px-6 py-2 bg-slate-900 text-white rounded-xl text-[9px] font-black uppercase hover:bg-blue-600 disabled:opacity-30 transition-all shadow-md"
              >
                {loading ? <Loader2 className="animate-spin" size={14} /> : "{"Simpan Email"}"}
              </button>
            </div>
          </div>
        </form>

        <hr className="border-slate-100" />

        {/* SECTION: GANTI PASSWORD */}
        <form onSubmit={handleUpdatePassword} className="grid md:grid-cols-3 gap-8 items-start">
          <div className="space-y-1">
            <h3 className="text-sm font-black uppercase tracking-tight">{"Kata Sandi"}</h3>
            <p className="text-[10px] text-slate-400">{"Amankan akun dengan sandi yang kuat."}</p>
          </div>
          <div className="md:col-span-2 space-y-4">
            <div className="relative">
              <Lock className="absolute left-4 top-4 text-slate-300" size={20} />
              <input 
                type={showPassword ? "text" : "password"} 
                value={password} 
                onChange={(e) => setPassword(e.target.value)} 
                className="w-full pl-12 pr-12 py-4 rounded-2xl border-2 border-slate-100 bg-slate-50 font-bold focus:border-blue-600 outline-none" 
                placeholder={`{"Kata Sandi Baru"}`} 
                required 
              />
              <button 
                type="button" 
                onClick={() => setShowPassword(!showPassword)} 
                className="absolute right-4 top-4 text-slate-400 p-1"
                aria-label={showPassword ? "{"Sembunyikan"}" : "{"Tampilkan"}"}
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
            <div className="relative">
              <Lock className="absolute left-4 top-4 text-slate-300" size={20} />
              <input 
                type={showPassword ? "text" : "password"} 
                value={confirmPassword} 
                onChange={(e) => setConfirmPassword(e.target.value)} 
                className="w-full pl-12 pr-4 py-4 rounded-2xl border-2 border-slate-100 bg-slate-50 font-bold focus:border-blue-600 outline-none" 
                placeholder={`{"Konfirmasi Kata Sandi"}`} 
                required 
              />
            </div>
            <div className="flex justify-end">
              <button 
                type="submit" 
                disabled={loading || !password} 
                className="px-6 py-2 bg-slate-900 text-white rounded-xl text-[9px] font-black uppercase hover:bg-blue-600 disabled:opacity-30 transition-all shadow-md"
              >
                {loading ? <Loader2 className="animate-spin" size={14} /> : "{"Update Sandi"}"}
              </button>
            </div>
          </div>
        </form>

        <hr className="border-slate-100" />

        {/* SECTION: LOGOUT GLOBAL */}
        <div className="grid md:grid-cols-3 gap-8 items-start">
          <div className="space-y-1">
            <h3 className="text-sm font-black uppercase tracking-tight">{"Sesi Aktif"}</h3>
            <p className="text-[10px] text-slate-400">{"Keluar dari semua perangkat lain."}</p>
          </div>
          <div className="md:col-span-2">
            <button 
              onClick={handleLogoutAll} 
              disabled={loading} 
              className="px-6 py-3 bg-slate-100 text-slate-700 rounded-xl text-[10px] font-black uppercase flex items-center gap-2 hover:bg-slate-200 transition-all"
            >
              <LogOut size={16} /> {"Logout Global"}
            </button>
          </div>
        </div>

        <hr className="border-slate-100" />

        {/* SECTION: HAPUS AKUN (DANGER ZONE) */}
        <div className="p-8 bg-red-50 rounded-[2rem] border-2 border-red-100 flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="space-y-2 text-center md:text-left">
            <div className="flex items-center justify-center md:justify-start gap-2 text-red-600">
              <AlertTriangle size={18} />
              <h3 className="text-sm font-black uppercase">{"Zona Berbahaya"}</h3>
            </div>
            <p className="text-[10px] font-bold text-red-700/70 max-w-md uppercase tracking-tight leading-relaxed">
              {"Menghapus akun akan memusnahkan seluruh data perusahaan secara permanen dari sistem kami."}
            </p>
          </div>
          <button 
            onClick={handleDeleteAccount} 
            className="px-8 py-4 bg-red-600 text-white rounded-2xl font-black uppercase text-[10px] hover:bg-red-700 transition-all shadow-lg shadow-red-100 active:scale-95"
          >
            {"Hapus Akun"}
          </button>
        </div>
      </section>

      {/* FEEDBACK NOTIFICATION */}
      {message.text && (
        <div className={`p-4 rounded-2xl flex items-center gap-3 border-2 animate-in fade-in slide-in-from-top-2 ${message.type === 'success' ? 'bg-emerald-50 border-emerald-100 text-emerald-700' : 'bg-red-50 border-red-100 text-red-700'}`} role="alert">
          {message.type === 'success' ? <CheckCircle2 size={20} /> : <XCircle size={20} />}
          <p className="text-[10px] font-black uppercase">{message.text}</p>
        </div>
      )}
    </div>
  );
}
