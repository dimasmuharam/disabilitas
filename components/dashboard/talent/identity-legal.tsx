"use client";

import React, { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
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
    phone: profile?.phone || "",
    communication_preference: profile?.communication_preference || "WhatsApp",
    disability_type: profile?.disability_type || "",
    portfolio_url: profile?.portfolio_url || "",
    resume_url: profile?.resume_url || "",
    document_disability_url: profile?.document_disability_url || "",
    video_intro_url: profile?.video_intro_url || "",
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
    const supabase = createClient();

    try {
      const { error } = await supabase
        .from("profiles")
        .update(formData)
        .eq("id", user.id);

      if (error) throw error;
      
      // 1. Set pesan sukses
      setMessage({ type: "success", text: "Data Berhasil Disimpan. Mengalihkan ke Overview..." });
      
      // 2. Jeda agar suara screen reader selesai
      setTimeout(() => {
        // 3. Pindahkan Tab
        onSuccess(); 
        // 4. Pastikan layar scroll ke atas
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }, 2000);

    } catch (error: any) {
      setMessage({ type: "error", text: error.message });
      setLoading(false); // Penting: tombol nyala lagi kalau gagal
    }
};

return (
    <div className="mx-auto max-w-4xl pb-20 font-sans text-slate-900 duration-500 animate-in fade-in">
      <header className="mb-10 px-4">
        <h1 className="flex items-center gap-4 text-4xl font-black uppercase italic tracking-tighter">
          <ShieldCheck className="text-blue-600" size={36} aria-hidden="true" />
          {"Identitas & Legal"}
        </h1>
        <p className="mt-2 text-[10px] font-bold uppercase italic tracking-widest text-slate-400">
          {"Verifikasi data untuk mengunakan platform Disabilitas.com secara optimal."}
        </p>
      </header>

      {/* REGION NOTIFIKASI AKSESIBEL */}
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

      <form onSubmit={handleSubmit} className="space-y-10 px-4">
        {/* SEKSI 1: INFORMASI WAJIB */}
        <section className="space-y-8 rounded-[3rem] border-2 border-slate-100 bg-white p-10 shadow-sm" aria-labelledby="section-basic">
          <h2 id="section-basic" className="flex items-center gap-2 text-xs font-black uppercase tracking-[0.2em] text-blue-600">
            <User size={16} aria-hidden="true" /> {"Data Personal (Wajib)"}
          </h2>
          <div className="grid gap-8 md:grid-cols-2">
            <div className="space-y-6">
              <div>
                <label htmlFor="full_name" className="ml-2 text-[10px] font-bold uppercase text-slate-400">{"Nama Lengkap"}</label>
                <input id="full_name" type="text" required className="w-full rounded-2xl border-2 border-slate-50 bg-slate-50 p-4 text-sm font-bold outline-none transition-all focus:border-blue-600" value={formData.full_name} onChange={(e) => setFormData({...formData, full_name: e.target.value})} aria-required="true" />
              </div>
              <div>
                <label htmlFor="date_of_birth" className="ml-2 text-[10px] font-bold uppercase text-slate-400">{"Tanggal Lahir"}</label>
                <input id="date_of_birth" type="date" required className="w-full rounded-2xl border-2 border-slate-50 bg-slate-50 p-4 text-sm font-bold outline-none transition-all focus:border-blue-600" value={formData.date_of_birth} onChange={(e) => setFormData({...formData, date_of_birth: e.target.value})} aria-required="true" />
              </div>
              <div>
                <label htmlFor="city" className="ml-2 text-[10px] font-bold uppercase text-slate-400">{"Kota Domisili"}</label>
                <input id="city" list="cities-data" required className="w-full rounded-2xl border-2 border-slate-50 bg-slate-50 p-4 text-sm font-bold outline-none transition-all focus:border-blue-600" value={formData.city} onChange={(e) => setFormData({...formData, city: e.target.value})} aria-required="true" />
                <datalist id="cities-data">
                  {INDONESIA_CITIES.map((c) => <option key={c} value={c} />)}
                </datalist>
              </div>
            </div>
            <div className="space-y-6">
              <div>
                <label htmlFor="phone" className="ml-2 text-[10px] font-bold uppercase text-slate-400">{"Nomor WhatsApp"}</label>
                <input id="phone" type="text" required className="w-full rounded-2xl border-2 border-slate-50 bg-slate-50 p-4 text-sm font-bold outline-none transition-all focus:border-blue-600" value={formData.phone} onChange={(e) => setFormData({...formData, phone: e.target.value})} aria-required="true" />
              </div>
              <div>
                <label htmlFor="gender" className="ml-2 text-[10px] font-bold uppercase text-slate-400">{"Jenis Kelamin"}</label>
                <select id="gender" required className="w-full rounded-2xl border-2 border-slate-50 bg-slate-50 p-4 text-sm font-bold outline-none transition-all focus:border-blue-600" value={formData.gender} onChange={(e) => setFormData({...formData, gender: e.target.value})} aria-required="true">
                  <option value="">{"Pilih"}</option>
                  <option value="male">{"Laki-laki"}</option>
                  <option value="female">{"Perempuan"}</option>
                </select>
              </div>
              <div>
                <label htmlFor="comm_pref" className="ml-2 text-[10px] font-bold uppercase text-slate-400">{"Preferensi Kontak"}</label>
                <select id="comm_pref" required className="w-full rounded-2xl border-2 border-slate-50 bg-slate-50 p-4 text-sm font-bold outline-none transition-all focus:border-blue-600" value={formData.communication_preference} onChange={(e) => setFormData({...formData, communication_preference: e.target.value})} aria-required="true">
                  <option value="WhatsApp">{"WhatsApp"}</option>
                  <option value="Email">{"Email"}</option>
                  <option value="Telepon">{"Telepon"}</option>
                </select>
              </div>
            </div>
          </div>
        </section>

        {/* SEKSI 2: LINK DIGITAL (OPSIONAL) */}
        <section className="space-y-8 rounded-[3rem] border-2 border-slate-100 bg-white p-10 shadow-sm" aria-labelledby="section-digital">
          <h2 id="section-digital" className="flex items-center gap-2 text-xs font-black uppercase tracking-[0.2em] text-purple-600">
            <LinkIcon size={16} aria-hidden="true" /> {"Media & Dokumen (Opsional)"}
          </h2>
          <div className="grid gap-8 md:grid-cols-2">
            <div className="space-y-6">
              <div>
                <label htmlFor="portfolio_url" className="ml-2 text-[10px] font-bold uppercase text-slate-400">{"URL Portofolio"}</label>
                <input id="portfolio_url" type="url" placeholder="https://..." className="w-full rounded-2xl border-2 border-slate-50 bg-slate-50 p-4 text-sm font-bold outline-none transition-all focus:border-purple-600" value={formData.portfolio_url} onChange={(e) => setFormData({...formData, portfolio_url: e.target.value})} />
              </div>
              <div>
                <label htmlFor="resume_url" className="ml-2 text-[10px] font-bold uppercase text-slate-400">{"Link CV (Google Drive)"}</label>
                <input id="resume_url" type="url" placeholder="https://drive.google.com/..." className="w-full rounded-2xl border-2 border-slate-50 bg-slate-50 p-4 text-sm font-bold outline-none transition-all focus:border-purple-600" value={formData.resume_url} onChange={(e) => setFormData({...formData, resume_url: e.target.value})} />
                {driveWarning && (
                  <div className="mt-2 flex items-start gap-2 rounded-xl border border-amber-100 bg-amber-50 p-4 animate-in slide-in-from-top-2" role="alert">
                    <Info size={14} className="mt-0.5 text-amber-600" />
                    <p className="text-[8px] font-black uppercase leading-tight text-amber-700">{"Peringatan: Pastikan izin akses Google Drive diatur ke 'Siapa saja yang memiliki link'!"}</p>
                  </div>
                )}
              </div>
            </div>
            <div className="space-y-6">
              <div>
                <label htmlFor="document_disability_url" className="ml-2 text-[10px] font-bold uppercase text-slate-400">{"Link Bukti Disabilitas"}</label>
                <input id="document_disability_url" type="url" placeholder="Link KTA / Surat Dokter" className="w-full rounded-2xl border-2 border-slate-50 bg-slate-50 p-4 text-sm font-bold outline-none transition-all focus:border-purple-600" value={formData.document_disability_url} onChange={(e) => setFormData({...formData, document_disability_url: e.target.value})} />
              </div>
              <div>
                <label htmlFor="video_intro_url" className="ml-2 text-[10px] font-bold uppercase text-slate-400">{"Link Video Intro (YouTube)"}</label>
                <input id="video_intro_url" type="url" placeholder="https://youtube.com/..." className="w-full rounded-2xl border-2 border-slate-50 bg-slate-50 p-4 text-sm font-bold outline-none transition-all focus:border-purple-600" value={formData.video_intro_url} onChange={(e) => setFormData({...formData, video_intro_url: e.target.value})} />
              </div>
            </div>
          </div>
          <div className="rounded-2xl border-2 border-dashed border-slate-200 bg-slate-50 p-6">
            <h3 className="mb-2 flex items-center gap-2 text-[10px] font-black uppercase text-slate-500">
              <Youtube size={14} aria-hidden="true" /> {"Panduan Video Intro"}
            </h3>
            <p className="text-[10px] font-bold uppercase italic leading-relaxed text-slate-400">
              {"Video 1 menit: Perkenalkan Nama, Ragam Disabilitas, Keahlian, dan Harapan Karir. Upload ke YouTube sebagai 'Unlisted' untuk privasi."}
            </p>
          </div>
        </section>

        {/* SEKSI 3: BIO & DISABILITAS (WAJIB) */}
        <section className="space-y-6 rounded-[3rem] border-2 border-slate-100 bg-white p-10 shadow-sm">
          <div className="space-y-2">
            <label htmlFor="disability_type" className="ml-2 text-[10px] font-bold uppercase text-slate-400">{"Ragam Disabilitas"}</label>
            <select id="disability_type" required className="w-full rounded-2xl border-2 border-slate-50 bg-slate-50 p-4 text-sm font-bold outline-none transition-all focus:border-blue-600" value={formData.disability_type} onChange={(e) => setFormData({...formData, disability_type: e.target.value})} aria-required="true">
              <option value="">{"Pilih Ragam"}</option>
              {DISABILITY_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
            </select>
          </div>
          
          <label className="flex cursor-pointer items-center gap-4 rounded-3xl border-2 border-blue-100 bg-blue-50 p-5 transition-all hover:bg-blue-100">
            <input type="checkbox" required className="size-6 accent-blue-600" checked={formData.has_informed_consent} onChange={(e) => setFormData({...formData, has_informed_consent: e.target.checked})} aria-required="true" />
            <span className="text-[10px] font-black uppercase leading-tight text-blue-900">
              {"Saya menyetujui Informed Consent bahwa data yang saya input dapat dipergunakan untuk pengembangan platform dan riset karir inklusif."}
            </span>
          </label>
        </section>

        <div className="flex justify-end pt-4">
          <button type="submit" disabled={loading} className="flex items-center gap-4 rounded-[2rem] bg-slate-900 px-12 py-5 text-sm font-black uppercase italic tracking-widest text-white shadow-2xl transition-all hover:bg-blue-600 disabled:opacity-50">
            {loading ? "Menyimpan..." : <><Save size={20} aria-hidden="true" /> {"Simpan Identitas"}</>}
          </button>
        </div>
      </form>
    </div>
  );
}
