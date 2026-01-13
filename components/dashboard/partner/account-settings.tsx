"use client";

import React, { useState } from "react";
import { supabase } from "@/lib/supabase";
import { 
  Lock, Mail, ShieldCheck, AlertTriangle, 
  ArrowLeft, Eye, EyeOff, Save, KeyRound, LogOut
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
    
    // Validasi Dasar
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
      // 1. Re-autentikasi / Verifikasi Password Saat Ini (Keamanan Ketat)
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

      // 3. Eksekusi Update ke Supabase Auth
      const { error: updateError } = await supabase.auth.updateUser(updateData);
      if (updateError) throw updateError;

      setMessage({ 
        text: email !== user.email 
          ? "Akun diperbarui! Silakan cek email baru Anda untuk konfirmasi perubahan." 
          : "Keamanan akun berhasil diperbarui!", 
        isError: false 
      });
      
      // Reset field password setelah sukses
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
    if (!confirm("Keluar dari semua perangkat yang terhubung? Anda harus login kembali di perangkat ini.")) return;
    
    setLoading(true);
    try {
      const { error } = await supabase.auth.signOut({ scope: 'global' });
      if (error) throw error;
      window.location.href = "/masuk";
    } catch (error: any) {
      alert("Gagal keluar: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 text-left">
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
            <ShieldCheck className="mb-6 text-blue-400" size={32} />
            <h2 className="text-2xl font-black uppercase italic tracking-tighter leading-none">Otoritas Akun</h2>
            <p className="mt-4 text-[11px] font-medium leading-relaxed opacity-70">
              Kelola akses masuk institusi Mitra Pelatihan Anda. Perubahan email atau password memerlukan verifikasi password saat ini.
            </p>
          </div>

          <button 
            onClick={handleSignOutAll}
            className="group flex w-full items-center justify-between rounded-[2rem] border-2 border-slate-100 bg-white p-6 transition-all hover:border-red-600 hover:bg-red-50"
          >
            <div className="text-left">
              <p className="text-[10px] font-black uppercase text-slate-900 group-hover:text-red-600">Sesi Perangkat</p>
              <p className="text-[9px] font-bold text-slate-400 uppercase">Keluar dari semua perangkat</p>
            </div>
            <LogOut size={20} className="text-slate-300 group-hover:text-red-600" />
          </button>
        </div>

        {/* FORM PANEL */}
        <div className="lg:col-span-2">
          <form onSubmit={handleUpdateAccount} className="rounded-[3rem] border-4 border-slate-900 bg-white p-10 shadow-[12px_12px_0px_0px_rgba(15,23,42,1)] space-y-10">
            
            {/* EMAIL SECTION */}
            <div className="space-y-4">
              <h3 className="flex items-center gap-2 text-xs font-black uppercase tracking-widest text-blue-600 italic">
                <Mail size={16} /> Identitas Login
              </h3>
              <div className="space-y-2">
                <label className="ml-1 block text-[10px] font-black uppercase text-slate-400">Alamat Email Aktif</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="block w-full rounded-2xl border-2 border-slate-100 bg-slate-50 p-4 font-bold outline-none focus:border-slate-900 focus:bg-white"
                />
              </div>
            </div>

            {/* PASSWORD SECTION */}
            <div className="space-y-6 pt-4 border-t-2 border-slate-50">
              <h3 className="flex items-center gap-2 text-xs font-black uppercase tracking-widest text-blue-600 italic">
                <Lock size={16} /> Ganti Kata Sandi
              </h3>
              <p className="text-[9px] font-bold uppercase text-slate-400 italic">*Biarkan kosong jika tidak ingin mengubah password.</p>
              
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
                  <label className="ml-1 block text-[10px] font-black uppercase text-slate-400">Konfirmasi Password Baru</label>
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

            {/* VERIFIKASI KEAMANAN (WAJIB ISI) */}
            <div className="rounded-3xl bg-blue-50 p-8 space-y-4 border-2 border-blue-100">
               <div className="flex items-center gap-3 text-blue-800">
                  <KeyRound size={20} />
                  <h4 className="text-[10px] font-black uppercase tracking-widest leading-none">Konfirmasi Otoritas</h4>
               </div>
               <div className="space-y-2">
                 <label className="ml-1 block text-[10px] font-black uppercase text-blue-600">Masukkan Password Saat Ini</label>
                 <input
                   type="password"
                   required
                   value={currentPassword}
                   onChange={(e) => setCurrentPassword(e.target.value)}
                   placeholder="Wajib diisi untuk simpan perubahan"
                   className="block w-full rounded-2xl border-2 border-blue-200 bg-white p-4 font-bold outline-none focus:border-slate-900 shadow-sm"
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
              className="flex w-full items-center justify-center gap-3 rounded-[2rem] bg-slate-900 py-6 text-[11px] font-black uppercase italic tracking-[0.2em] text-white shadow-xl transition-all hover:bg-blue-600 active:scale-[0.98] disabled:opacity-50"
            >
              {loading ? "PROSES SINKRONISASI..." : (
                <>
                  <Save size={20} /> SIMPAN PERUBAHAN AKUN
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
