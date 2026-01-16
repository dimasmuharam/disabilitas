"use client";

import React, { useState } from "react";
import { supabase } from "@/lib/supabase";
import { 
  Lock, Mail, ShieldCheck, AlertTriangle, 
  ArrowLeft, Eye, EyeOff, Save, KeyRound, LogOut,
  CheckCircle2 // PERBAIKAN: Menambahkan impor yang hilang
} from "lucide-react";

interface AccountSettingsProps {
  user: any;
  onBack: () => void;
}

export default function AccountSettings({ user, onBack }: AccountSettingsProps) {
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  
  // State Form
  const [email, setEmail] = useState(user?.email || "");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [currentPassword, setCurrentPassword] = useState("");
  
  const [message, setMessage] = useState({ text: "", isError: false });

  const handleUpdateAccount = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!currentPassword) {
      setMessage({ text: "Masukkan password saat ini untuk memverifikasi perubahan.", isError: true });
      return;
    }

    if (newPassword && newPassword !== confirmPassword) {
      setMessage({ text: "Konfirmasi password baru tidak cocok.", isError: true });
      return;
    }

    setLoading(true);
    setMessage({ text: "", isError: false });

    try {
      // 1. Verifikasi Password Saat Ini
      const { error: reauthError } = await supabase.auth.signInWithPassword({
        email: user.email,
        password: currentPassword,
      });

      if (reauthError) throw new Error("Password saat ini tidak valid.");

      // 2. Siapkan Payload Update
      const updateData: any = {};
      if (email !== user.email) updateData.email = email;
      if (newPassword) updateData.password = newPassword;

      if (Object.keys(updateData).length === 0) {
        setMessage({ text: "Tidak ada data yang diubah.", isError: false });
        setLoading(false);
        return;
      }

      // 3. Eksekusi Update
      const { error: updateError } = await supabase.auth.updateUser(updateData);
      if (updateError) throw updateError;

      setMessage({ 
        text: email !== user.email 
          ? "Akun diperbarui! Silakan konfirmasi email baru Anda melalui link yang dikirimkan." 
          : "Keamanan akun berhasil diperbarui!", 
        isError: false 
      });
      
      setNewPassword("");
      setConfirmPassword("");
      setCurrentPassword("");

    } catch (error: any) {
      setMessage({ text: error.message, isError: true });
    } finally {
      setLoading(false);
    }
  };

  const handleSignOutAll = async () => {
    if (!confirm("Keluar dari semua perangkat?")) return;
    setLoading(true);
    try {
      await supabase.auth.signOut({ scope: 'global' });
      window.location.href = "/masuk";
    } catch (error: any) {
      alert("Gagal: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="text-left duration-500 animate-in fade-in slide-in-from-bottom-4">
      <button 
        onClick={onBack}
        className="mb-8 flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-400 transition-colors hover:text-slate-900"
      >
        <ArrowLeft size={16} /> Kembali ke Dashboard
      </button>

      <div className="grid grid-cols-1 gap-10 lg:grid-cols-3">
        <div className="space-y-6 text-left">
          <div className="rounded-[2.5rem] bg-slate-900 p-8 text-white shadow-2xl">
            <ShieldCheck className="mb-6 text-blue-400" size={32} />
            <h2 className="text-2xl font-black uppercase italic leading-none tracking-tighter">Otoritas Akun</h2>
            <p className="mt-4 text-[11px] font-medium leading-relaxed opacity-70">
              Kelola kredensial akses institusi Mitra Pelatihan Anda.
            </p>
          </div>

          <button 
            onClick={handleSignOutAll}
            className="group flex w-full items-center justify-between rounded-[2rem] border-2 border-slate-100 bg-white p-6 transition-all hover:border-red-600 hover:bg-red-50"
          >
            <div className="text-left">
              <p className="text-[10px] font-black uppercase text-slate-900 group-hover:text-red-600">Sesi Perangkat</p>
              <p className="text-[9px] font-bold uppercase text-slate-400">Sign out global</p>
            </div>
            <LogOut size={20} className="text-slate-300 group-hover:text-red-600" />
          </button>
        </div>

        <div className="lg:col-span-2">
          <form onSubmit={handleUpdateAccount} className="space-y-10 rounded-[3rem] border-4 border-slate-900 bg-white p-10 shadow-[12px_12px_0px_0px_rgba(15,23,42,1)]">
            <div className="space-y-4">
              <h3 className="flex items-center gap-2 text-xs font-black uppercase italic tracking-widest text-blue-600">
                <Mail size={16} /> Identitas Login
              </h3>
              <div className="space-y-2">
                <label className="ml-1 block text-[10px] font-black uppercase text-slate-400">Email Aktif</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="block w-full rounded-2xl border-2 border-slate-100 bg-slate-50 p-4 font-bold outline-none focus:border-slate-900 focus:bg-white"
                />
              </div>
            </div>

            <div className="space-y-6 border-t-2 border-slate-50 pt-4">
              <h3 className="flex items-center gap-2 text-xs font-black uppercase italic tracking-widest text-blue-600">
                <Lock size={16} /> Ganti Kata Sandi
              </h3>
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                <div className="space-y-2">
                  <label className="ml-1 block text-[10px] font-black uppercase text-slate-400">Password Baru</label>
                  <div className="relative">
                    <input
                      type={showPassword ? "text" : "password"}
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="••••••••"
                      className="block w-full rounded-2xl border-2 border-slate-100 bg-slate-50 p-4 font-bold outline-none focus:border-slate-900 focus:bg-white"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute inset-y-0 right-4 flex items-center text-slate-300 hover:text-slate-900"
                    >
                      {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="ml-1 block text-[10px] font-black uppercase text-slate-400">Konfirmasi Baru</label>
                  <input
                    type={showPassword ? "text" : "password"}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="••••••••"
                    className="block w-full rounded-2xl border-2 border-slate-100 bg-slate-50 p-4 font-bold outline-none focus:border-slate-900 focus:bg-white"
                  />
                </div>
              </div>
            </div>

            <div className="space-y-4 rounded-3xl border-2 border-blue-100 bg-blue-50 p-8 text-left">
               <div className="flex items-center gap-3 text-blue-800">
                  <KeyRound size={20} />
                  <h4 className="text-[10px] font-black uppercase leading-none tracking-widest">Konfirmasi Otoritas</h4>
               </div>
               <div className="space-y-2">
                 <label className="ml-1 block text-[10px] font-black uppercase text-blue-600">Password Saat Ini</label>
                 <input
                   type="password"
                   required
                   value={currentPassword}
                   onChange={(e) => setCurrentPassword(e.target.value)}
                   className="block w-full rounded-2xl border-2 border-blue-200 bg-white p-4 font-bold outline-none focus:border-slate-900"
                 />
               </div>
            </div>

            {message.text && (
              <div className={`flex items-center gap-3 rounded-2xl border-2 p-5 text-[10px] font-black uppercase animate-in zoom-in-95 ${message.isError ? 'border-red-100 bg-red-50 text-red-600' : 'border-emerald-100 bg-emerald-50 text-emerald-600'}`}>
                {message.isError ? <AlertTriangle size={18} /> : <CheckCircle2 size={18} />}
                {message.text}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="flex w-full items-center justify-center gap-3 rounded-[2rem] bg-slate-900 py-6 text-[11px] font-black uppercase italic tracking-[0.2em] text-white shadow-xl transition-all hover:bg-blue-600 disabled:opacity-50"
            >
              {loading ? "SINKRONISASI..." : <><Save size={20} /> SIMPAN PERUBAHAN</>}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
