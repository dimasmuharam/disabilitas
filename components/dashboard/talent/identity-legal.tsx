"use client";

import React, { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { 
  Save, User, Phone, MapPin, Calendar, 
  MessageSquare, ShieldCheck, Link as LinkIcon, 
  Youtube, CheckCircle2, AlertCircle, Info 
} from "lucide-react";

// MENGGUNAKAN BASIS DATA STATIS YANG SUDAH DIKUNCI
import { INDONESIA_CITIES, DISABILITY_TYPES } from "@/lib/data-static";

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
    date_of_birth: profile?.date_of_birth || "",
    city: profile?.city || "",
    phone_number: profile?.phone_number || "",
    communication_preference: profile?.communication_preference || "WhatsApp",
    disability_type: profile?.disability_type || "",
    portfolio_url: profile?.portfolio_url || "",
    resume_url: profile?.resume_url || "",
    document_disability_url: profile?.document_disability_url || "",
    intro_video_url: profile?.intro_video_url || "",
    bio: profile?.bio || "",
    has_informed_consent: profile?.has_informed_consent || false
  });

  // FITUR: OTOMATIS CEK AKSES GOOGLE DRIVE
  useEffect(() => {
    if (formData.resume_url && formData.resume_url.includes("drive.google.com")) {
      // Jika link tidak mengandung kata 'sharing', biasanya akses belum dibuka untuk umum
      if (!formData.resume_url.includes("sharing") && !formData.resume_url.includes("usp=drivesdk")) {
        setDriveWarning(true);
      } else {
        setDriveWarning(false);
      }
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
      
      setMessage({ type: "success", text: "Data Identitas Berhasil Disimpan!" });
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
        <h1 className="text-4xl font-black italic uppercase tracking-tighter flex items-center gap-4">
          <ShieldCheck className="text-blue-600" size={36} aria-hidden="true" />
          {"Identitas & Legal"}
        </h1>
        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-2 italic">
          {"Verifikasi data untuk mengunakan platform Disabilitas.com secara optimal."}
        </p>
      </header>

      {/* REGION NOTIFIKASI AKSESIBEL */}
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
        {/* SEKSI 1: INFORMASI WAJIB */}
        <section className="bg-white p-10 rounded-[3rem] border-2 border-slate-100 shadow-sm space-y-8" aria-labelledby="section-basic">
          <h2 id="section-basic" className="text-xs font-black uppercase text-blue-600 tracking-[0.2em] flex items-center gap-2">
            <User size={16} aria-hidden="true" /> {"Data Personal (Wajib)"}
          </h2>
          <div className="grid md:grid-cols-2 gap-8">
            <div className="space-y-6">
              <div>
                <label htmlFor="full_name" className="text-[10px] font-bold uppercase ml-2 text-slate-400">{"Nama Lengkap"}</label>
                <input id="full_name" type="text" required className="w-full bg-slate-50 border-2 border-slate-50 p-4 rounded-2xl font-bold outline-none focus:border-blue-600 transition-all text-sm" value={formData.full_name} onChange={(e) => setFormData({...formData, full_name: e.target.value})} aria-required="true" />
              </div>
              <div>
                <label htmlFor="date_of_birth" className="text-[10px] font-bold uppercase ml-2 text-slate-400">{"Tanggal Lahir"}</label>
                <input id="date_of_birth" type="date" required className="w-full bg-slate-50 border-2 border-slate-50 p-4 rounded-2xl font-bold outline-none focus:border-blue-600 transition-all text-sm" value={formData.date_of_birth} onChange={(e) => setFormData({...formData, date_of_birth: e.target.value})} aria-required="true" />
              </div>
              <div>
                <label htmlFor="city" className="text-[10px] font-bold uppercase ml-2 text-slate-400">{"Kota Domisili"}</label>
                <input id="city" list="cities-data" required className="w-full bg-slate-50 border-2 border-slate-50 p-4 rounded-2xl font-bold outline-none focus:border-blue-600 transition-all text-sm" value={formData.city} onChange={(e) => setFormData({...formData, city: e.target.value})} aria-required="true" />
                <datalist id="cities-data">
                  {INDONESIA_CITIES.map((c) => <option key={c} value={c} />)}
                </datalist>
              </div>
            </div>
            <div className="space-y-6">
              <div>
                <label htmlFor="phone_number" className="text-[10px] font-bold uppercase ml-2 text-slate-400">{"Nomor WhatsApp"}</label>
                <input id="phone_number" type="text" required className="w-full bg-slate-50 border-2 border-slate-50 p-4 rounded-2xl font-bold outline-none focus:border-blue-600 transition-all text-sm" value={formData.phone_number} onChange={(e) => setFormData({...formData, phone_number: e.target.value})} aria-required="true" />
              </div>
              <div>
                <label htmlFor="gender" className="text-[10px] font-bold uppercase ml-2 text-slate-400">{"Jenis Kelamin"}</label>
                <select id="gender" required className="w-full bg-slate-50 border-2 border-slate-50 p-4 rounded-2xl font-bold outline-none focus:border-blue-600 transition-all text-sm" value={formData.gender} onChange={(e) => setFormData({...formData, gender: e.target.value})} aria-required="true">
                  <option value="">{"Pilih"}</option>
                  <option value="Laki-laki">{"Laki-laki"}</option>
                  <option value="Perempuan">{"Perempuan"}</option>
                </select>
              </div>
              <div>
                <label htmlFor="comm_pref" className="text-[10px] font-bold uppercase ml-2 text-slate-400">{"Preferensi Kontak"}</label>
                <select id="comm_pref" required className="w-full bg-slate-50 border-2 border-slate-50 p-4 rounded-2xl font-bold outline-none focus:border-blue-600 transition-all text-sm" value={formData.communication_preference} onChange={(e) => setFormData({...formData, communication_preference: e.target.value})} aria-required="true">
                  <option value="WhatsApp">{"WhatsApp"}</option>
                  <option value="Email">{"Email"}</option>
                  <option value="Telepon">{"Telepon"}</option>
                </select>
              </div>
            </div>
          </div>
        </section>

        {/* SEKSI 2: LINK DIGITAL (OPSIONAL) */}
        <section className="bg-white p-10 rounded-[3rem] border-2 border-slate-100 shadow-sm space-y-8" aria-labelledby="section-digital">
          <h2 id="section-digital" className="text-xs font-black uppercase text-purple-600 tracking-[0.2em] flex items-center gap-2">
            <LinkIcon size={16} aria-hidden="true" /> {"Media & Dokumen (Opsional)"}
          </h2>
          <div className="grid md:grid-cols-2 gap-8">
            <div className="space-y-6">
              <div>
                <label htmlFor="portfolio_url" className="text-[10px] font-bold uppercase ml-2 text-slate-400">{"URL Portofolio"}</label>
                <input id="portfolio_url" type="url" placeholder="https://..." className="w-full bg-slate-50 border-2 border-slate-50 p-4 rounded-2xl font-bold outline-none focus:border-purple-600 transition-all text-sm" value={formData.portfolio_url} onChange={(e) => setFormData({...formData, portfolio_url: e.target.value})} />
              </div>
              <div>
                <label htmlFor="resume_url" className="text-[10px] font-bold uppercase ml-2 text-slate-400">{"Link CV (Google Drive)"}</label>
                <input id="resume_url" type="url" placeholder="https://drive.google.com/..." className="w-full bg-slate-50 border-2 border-slate-50 p-4 rounded-2xl font-bold outline-none focus:border-purple-600 transition-all text-sm" value={formData.resume_url} onChange={(e) => setFormData({...formData, resume_url: e.target.value})} />
                {driveWarning && (
                  <div className="bg-amber-50 p-4 rounded-xl border border-amber-100 mt-2 flex items-start gap-2 animate-in slide-in-from-top-2" role="alert">
                    <Info size={14} className="text-amber-600 mt-0.5" />
                    <p className="text-[8px] font-black uppercase text-amber-700 leading-tight">{"Peringatan: Pastikan izin akses Google Drive diatur ke 'Siapa saja yang memiliki link'!"}</p>
                  </div>
                )}
              </div>
            </div>
            <div className="space-y-6">
              <div>
                <label htmlFor="document_disability_url" className="text-[10px] font-bold uppercase ml-2 text-slate-400">{"Link Bukti Disabilitas"}</label>
                <input id="document_disability_url" type="url" placeholder="Link KTA / Surat Dokter" className="w-full bg-slate-50 border-2 border-slate-50 p-4 rounded-2xl font-bold outline-none focus:border-purple-600 transition-all text-sm" value={formData.document_disability_url} onChange={(e) => setFormData({...formData, document_disability_url: e.target.value})} />
              </div>
              <div>
                <label htmlFor="intro_video_url" className="text-[10px] font-bold uppercase ml-2 text-slate-400">{"Link Video Intro (YouTube)"}</label>
                <input id="intro_video_url" type="url" placeholder="https://youtube.com/..." className="w-full bg-slate-50 border-2 border-slate-50 p-4 rounded-2xl font-bold outline-none focus:border-purple-600 transition-all text-sm" value={formData.intro_video_url} onChange={(e) => setFormData({...formData, intro_video_url: e.target.value})} />
              </div>
            </div>
          </div>
          <div className="bg-slate-50 p-6 rounded-2xl border-2 border-dashed border-slate-200">
            <h3 className="text-[10px] font-black uppercase flex items-center gap-2 mb-2 text-slate-500">
              <Youtube size={14} aria-hidden="true" /> {"Panduan Video Intro"}
            </h3>
            <p className="text-[10px] font-bold text-slate-400 uppercase leading-relaxed italic">
              {"Video 1 menit: Perkenalkan Nama, Ragam Disabilitas, Keahlian, dan Harapan Karir. Upload ke YouTube sebagai 'Unlisted' untuk privasi."}
            </p>
          </div>
        </section>

        {/* SEKSI 3: BIO & DISABILITAS (WAJIB) */}
        <section className="bg-white p-10 rounded-[3rem] border-2 border-slate-100 shadow-sm space-y-6">
          <div className="space-y-2">
            <label htmlFor="disability_type" className="text-[10px] font-bold uppercase ml-2 text-slate-400">{"Ragam Disabilitas"}</label>
            <select id="disability_type" required className="w-full bg-slate-50 border-2 border-slate-50 p-4 rounded-2xl font-bold outline-none focus:border-blue-600 transition-all text-sm" value={formData.disability_type} onChange={(e) => setFormData({...formData, disability_type: e.target.value})} aria-required="true">
              <option value="">{"Pilih Ragam"}</option>
              {DISABILITY_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
            </select>
          </div>
          <div>
            <label htmlFor="bio" className="text-[10px] font-bold uppercase ml-2 text-slate-400">{"Bio Singkat"}</label>
            <textarea id="bio" required className="w-full bg-slate-50 border-2 border-slate-50 p-6 rounded-[2rem] font-bold outline-none focus:border-blue-600 h-32 italic transition-all text-sm" value={formData.bio} onChange={(e) => setFormData({...formData, bio: e.target.value})} aria-required="true" />
          </div>
          <label className="flex items-center gap-4 p-5 bg-blue-50 border-2 border-blue-100 rounded-3xl cursor-pointer hover:bg-blue-100 transition-all">
            <input type="checkbox" required className="w-6 h-6 accent-blue-600" checked={formData.has_informed_consent} onChange={(e) => setFormData({...formData, has_informed_consent: e.target.checked})} aria-required="true" />
            <span className="text-[10px] font-black uppercase text-blue-900 leading-tight">
              {"Saya menyetujui Informed Consent untuk pengembangan platform dan riset."}
            </span>
          </label>
        </section>

        <div className="flex justify-end pt-4">
          <button type="submit" disabled={loading} className="bg-slate-900 text-white px-12 py-5 rounded-[2rem] font-black uppercase italic tracking-widest text-sm flex items-center gap-4 hover:bg-blue-600 transition-all shadow-2xl disabled:opacity-50">
            {loading ? "Menyimpan..." : <><Save size={20} aria-hidden="true" /> {"Simpan Identitas"}</>}
          </button>
        </div>
      </form>
    </div>
  );
}
