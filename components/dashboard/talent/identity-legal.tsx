"use client";

import React, { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { 
  Save, User, Phone, MapPin, Calendar, 
  MessageSquare, ShieldCheck, Link as LinkIcon, 
  FileText, Youtube, CheckCircle2, AlertCircle, Info 
} from "lucide-react";

interface IdentityLegalProps {
  user: any;
  profile: any;
  onSuccess: () => void;
}

export default function IdentityLegal({ user, profile, onSuccess }: IdentityLegalProps) {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });
  const [driveWarning, setDriveWarning] = useState(false);

  const [formData, setFormData] = useState({
    full_name: profile?.full_name || "",
    gender: profile?.gender || "",
    birth_date: profile?.birth_date || "",
    city: profile?.city || "",
    phone_number: profile?.phone_number || "",
    communication_preference: profile?.communication_preference || "WhatsApp",
    disability_type: profile?.disability_type || "",
    portfolio_url: profile?.portfolio_url || "",
    resume_url: profile?.resume_url || "",
    disability_proof_url: profile?.disability_proof_url || "",
    intro_video_url: profile?.intro_video_url || "",
    bio: profile?.bio || "",
    has_informed_consent: profile?.has_informed_consent || false
  });

  // Fitur Cek Akses Google Drive Otomatis
  useEffect(() => {
    if (formData.resume_url.includes("drive.google.com")) {
      setDriveWarning(true);
    } else {
      setDriveWarning(false);
    }
  }, [formData.resume_url]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ type: "", text: "" });

    try {
      const { error } = await supabase
        .from("profiles")
        .update(formData)
        .eq("id", user.id);

      if (error) throw error;
      
      setMessage({ type: "success", text: "Data Identitas & Dokumen Berhasil Disinkronkan!" });
      onSuccess();
    } catch (error: any) {
      setMessage({ type: "error", text: error.message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto pb-20 animate-in fade-in duration-500 font-sans text-slate-900">
      <header className="mb-10 px-4">
        <h1 className="text-4xl font-black italic uppercase tracking-tighter flex items-center gap-4 text-slate-900">
          <ShieldCheck className="text-blue-600" size={36} aria-hidden="true" />
          {"Identitas & Legal"}
        </h1>
        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-2 italic">
          {"Verifikasi data untuk kepentingan riset BRIN dan profil profesional bisnis."}
        </p>
      </header>

      {/* Region Notifikasi Aksesibel */}
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

      <form onSubmit={handleSubmit} className="space-y-10 px-4">
        {/* SEKSI 1: WAJIB DIISI */}
        <section className="bg-white p-10 rounded-[3rem] border-2 border-slate-100 shadow-sm space-y-8" aria-labelledby="personal-data-title">
          <h3 id="personal-data-title" className="text-xs font-black uppercase text-blue-600 tracking-[0.2em] flex items-center gap-2">
            <User size={16} aria-hidden="true" /> {"Informasi Dasar (Wajib)"}
          </h3>
          <div className="grid md:grid-cols-2 gap-8">
            <div className="space-y-6">
              <div>
                <label htmlFor="full_name" className="text-[10px] font-bold uppercase ml-2 text-slate-400">{"Nama Lengkap"}</label>
                <input id="full_name" type="text" required className="w-full bg-slate-50 border-2 border-slate-50 p-4 rounded-2xl font-bold outline-none focus:border-blue-600" value={formData.full_name} onChange={(e) => setFormData({...formData, full_name: e.target.value})} />
              </div>
              <div>
                <label htmlFor="birth_date" className="text-[10px] font-bold uppercase ml-2 text-slate-400">{"Tanggal Lahir"}</label>
                <input id="birth_date" type="date" required className="w-full bg-slate-50 border-2 border-slate-50 p-4 rounded-2xl font-bold outline-none focus:border-blue-600" value={formData.birth_date} onChange={(e) => setFormData({...formData, birth_date: e.target.value})} />
              </div>
              <div>
                <label htmlFor="gender" className="text-[10px] font-bold uppercase ml-2 text-slate-400">{"Jenis Kelamin"}</label>
                <select id="gender" required className="w-full bg-slate-50 border-2 border-slate-50 p-4 rounded-2xl font-bold outline-none focus:border-blue-600" value={formData.gender} onChange={(e) => setFormData({...formData, gender: e.target.value})}>
                  <option value="">{"Pilih"}</option>
                  <option value="Laki-laki">{"Laki-laki"}</option>
                  <option value="Perempuan">{"Perempuan"}</option>
                </select>
              </div>
            </div>
            <div className="space-y-6">
              <div>
                <label htmlFor="phone_number" className="text-[10px] font-bold uppercase ml-2 text-slate-400">{"Nomor HP/WA"}</label>
                <input id="phone_number" type="text" required className="w-full bg-slate-50 border-2 border-slate-50 p-4 rounded-2xl font-bold outline-none focus:border-blue-600" value={formData.phone_number} onChange={(e) => setFormData({...formData, phone_number: e.target.value})} />
              </div>
              <div>
                <label htmlFor="city" className="text-[10px] font-bold uppercase ml-2 text-slate-400">{"Kota Domisili"}</label>
                <input id="city" type="text" required className="w-full bg-slate-50 border-2 border-slate-50 p-4 rounded-2xl font-bold outline-none focus:border-blue-600" value={formData.city} onChange={(e) => setFormData({...formData, city: e.target.value})} />
              </div>
              <div>
                <label htmlFor="comm_pref" className="text-[10px] font-bold uppercase ml-2 text-slate-400">{"Media Komunikasi"}</label>
                <select id="comm_pref" required className="w-full bg-slate-50 border-2 border-slate-50 p-4 rounded-2xl font-bold outline-none focus:border-blue-600" value={formData.communication_preference} onChange={(e) => setFormData({...formData, communication_preference: e.target.value})}>
                  <option value="WhatsApp">{"WhatsApp"}</option>
                  <option value="Email">{"Email"}</option>
                  <option value="Telepon">{"Telepon"}</option>
                </select>
              </div>
            </div>
          </div>
        </section>

        {/* SEKSI 2: OPSIONAL */}
        <section className="bg-white p-10 rounded-[3rem] border-2 border-slate-100 shadow-sm space-y-8" aria-labelledby="digital-docs-title">
          <h3 id="digital-docs-title" className="text-xs font-black uppercase text-purple-600 tracking-[0.2em] flex items-center gap-2">
            <LinkIcon size={16} aria-hidden="true" /> {"Link & Dokumen (Opsional)"}
          </h3>
          <div className="grid md:grid-cols-2 gap-8">
            <div className="space-y-6">
              <div>
                <label htmlFor="portfolio" className="text-[10px] font-bold uppercase ml-2 text-slate-400">{"URL Portofolio"}</label>
                <input id="portfolio" type="url" placeholder="https://..." className="w-full bg-slate-50 border-2 border-slate-50 p-4 rounded-2xl font-bold outline-none focus:border-purple-600" value={formData.portfolio_url} onChange={(e) => setFormData({...formData, portfolio_url: e.target.value})} />
              </div>
              <div>
                <label htmlFor="resume" className="text-[10px] font-bold uppercase ml-2 text-slate-400">{"Link Resume (Google Drive)"}</label>
                <input id="resume" type="url" placeholder="https://drive.google.com/..." className="w-full bg-slate-50 border-2 border-slate-50 p-4 rounded-2xl font-bold outline-none focus:border-purple-600" value={formData.resume_url} onChange={(e) => setFormData({...formData, resume_url: e.target.value})} />
                {driveWarning && (
                  <p className="text-[9px] font-bold text-amber-600 mt-2 flex items-center gap-1 animate-pulse" role="alert">
                    <Info size={12} /> {"Penting: Pastikan akses Drive sudah 'Anyone with the link'"}
                  </p>
                )}
              </div>
            </div>
            <div className="space-y-6">
              <div>
                <label htmlFor="dis_proof" className="text-[10px] font-bold uppercase ml-2 text-slate-400">{"Bukti Disabilitas (KTA/Surat)"}</label>
                <input id="dis_proof" type="url" placeholder="Link dokumen bukti" className="w-full bg-slate-50 border-2 border-slate-50 p-4 rounded-2xl font-bold outline-none focus:border-purple-600" value={formData.disability_proof_url} onChange={(e) => setFormData({...formData, disability_proof_url: e.target.value})} />
              </div>
              <div>
                <label htmlFor="youtube" className="text-[10px] font-bold uppercase ml-2 text-slate-400">{"Link Video YouTube"}</label>
                <input id="youtube" type="url" placeholder="https://youtube.com/..." className="w-full bg-slate-50 border-2 border-slate-50 p-4 rounded-2xl font-bold outline-none focus:border-purple-600" value={formData.intro_video_url} onChange={(e) => setFormData({...formData, intro_video_url: e.target.value})} />
              </div>
            </div>
          </div>
          <div className="bg-slate-50 p-6 rounded-2xl border-2 border-dashed border-slate-200">
            <h4 className="text-[10px] font-black uppercase flex items-center gap-2 mb-2 text-slate-500">
              <Youtube size={14} aria-hidden="true" /> {"Panduan Video Intro"}
            </h4>
            <p className="text-[10px] font-bold text-slate-400 uppercase leading-relaxed italic">
              {"Buat video 1 menit perkenalan diri dan unggah ke YouTube (Unlisted). Link ini membantu HRD mengenal Anda lebih baik."}
            </p>
          </div>
        </section>

        {/* SEKSI 3: BIO & PERSETUJUAN */}
        <section className="bg-white p-10 rounded-[3rem] border-2 border-slate-100 shadow-sm space-y-6">
          <div className="space-y-2">
            <label htmlFor="disability_type" className="text-[10px] font-bold uppercase ml-2 text-slate-400">{"Ragam Disabilitas"}</label>
            <select id="disability_type" required className="w-full bg-slate-50 border-2 border-slate-50 p-4 rounded-2xl font-bold outline-none focus:border-blue-600" value={formData.disability_type} onChange={(e) => setFormData({...formData, disability_type: e.target.value})}>
              <option value="">{"Pilih Ragam"}</option>
              <option value="Netra">{"Netra"}</option>
              <option value="Rungu">{"Rungu"}</option>
              <option value="Daksa">{"Daksa"}</option>
              <option value="Intelektual">{"Intelektual"}</option>
              <option value="Mental">{"Mental"}</option>
              <option value="Ganda">{"Ganda"}</option>
            </select>
          </div>
          <div>
            <label htmlFor="bio" className="text-[10px] font-bold uppercase ml-2 text-slate-400">{"Bio Singkat (Wajib)"}</label>
            <textarea id="bio" required className="w-full bg-slate-50 border-2 border-slate-50 p-6 rounded-[2rem] font-bold outline-none focus:border-blue-600 h-32 italic" placeholder="Ceritakan siapa Anda..." value={formData.bio} onChange={(e) => setFormData({...formData, bio: e.target.value})} />
          </div>
          <label className="flex items-center gap-4 p-5 bg-blue-50 border-2 border-blue-100 rounded-3xl cursor-pointer hover:bg-blue-100 transition-all">
            <input type="checkbox" required className="w-6 h-6 accent-blue-600" checked={formData.has_informed_consent} onChange={(e) => setFormData({...formData, has_informed_consent: e.target.checked})} />
            <span className="text-[10px] font-black uppercase text-blue-900 leading-tight">
              {"Saya menyetujui Informed Consent untuk kepentingan bisnis & riset BRIN."}
            </span>
          </label>
        </section>

        <div className="flex justify-end pt-4">
          <button type="submit" disabled={loading} className="bg-slate-900 text-white px-12 py-5 rounded-[2rem] font-black uppercase italic tracking-widest text-sm flex items-center gap-4 hover:bg-blue-600 transition-all shadow-2xl disabled:opacity-50">
            {loading ? "Sinkronisasi..." : <><Save size={20} aria-hidden="true" /> {"Simpan Identitas & Dokumen"}</>}
          </button>
        </div>
      </form>
    </div>
  );
}
