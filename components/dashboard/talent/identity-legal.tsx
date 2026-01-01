"use client";

import React, { useState } from "react";
import { updateTalentProfile } from "@/lib/actions/talent";
import { 
  User, Mail, Phone, MapPin, Info, 
  Link as LinkIcon, Youtube, FileText, 
  CheckCircle2, AlertCircle, Save, MessageSquare 
} from "lucide-react";
import { INDONESIA_CITIES, DISABILITY_TYPES } from "@/lib/data-static";

interface IdentityLegalProps {
  user: any;
  profile: any;
  onSuccess?: () => void;
}

export default function IdentityLegal({ user, profile, onSuccess }: IdentityLegalProps) {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });

  // State Management dengan Data Real dari Profile
  const [formData, setFormData] = useState({
    full_name: profile?.full_name || "",
    date_of_birth: profile?.date_of_birth || "",
    gender: profile?.gender || "",
    phone: profile?.phone || "",
    city: profile?.city || "",
    disability_type: profile?.disability_type || "",
    communication_preference: profile?.communication_preference || "",
    resume_url: profile?.resume_url || "",
    portfolio_url: profile?.portfolio_url || "",
    document_disability_url: profile?.document_disability_url || "",
    video_intro_url: profile?.video_intro_url || "",
    has_informed_consent: profile?.has_informed_consent || false,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.has_informed_consent) {
      setMessage({ type: "error", text: "Anda harus menyetujui Informed Consent untuk melanjutkan." });
      return;
    }

    setLoading(true);
    const result = await updateTalentProfile(user.id, formData);
    setLoading(false);

    if (result.success) {
      setMessage({ type: "success", text: "Data Identitas & Legalitas berhasil disimpan!" });
      if (onSuccess) onSuccess();
    } else {
      setMessage({ type: "error", text: `Gagal menyimpan: ${result.error}` });
    }
  };

  return (
    <div className="max-w-4xl mx-auto pb-20">
      <header className="mb-10">
        <h1 className="text-4xl font-black italic uppercase tracking-tighter text-slate-900 flex items-center gap-4">
          <User className="text-blue-600" size={36} />
          {"Identitas & Legalitas"}
        </h1>
        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-2">
          {"Lengkapi data dasar dan persetujuan riset/bisnis Anda."}
        </p>
      </header>

      {/* NOTIFIKASI ARIA-LIVE */}
      {message.text && (
        <div 
          role="status" 
          aria-live="polite"
          className={`mb-8 p-6 rounded-[2rem] flex items-center gap-4 border-2 ${
            message.type === "success" ? "bg-emerald-50 border-emerald-200 text-emerald-800" : "bg-red-50 border-red-200 text-red-800"
          }`}
        >
          {message.type === "success" ? <CheckCircle2 size={24} /> : <AlertCircle size={24} />}
          <p className="text-sm font-black uppercase italic tracking-tight">{message.text}</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-12">
        
        {/* SEKSI 1: IDENTITAS DASAR */}
        <section className="bg-white p-10 rounded-[3rem] border-2 border-slate-100 shadow-sm space-y-8">
          <div className="grid md:grid-cols-2 gap-8">
            <div className="space-y-2">
              <label htmlFor="full_name" className="text-[10px] font-black uppercase text-slate-400 px-2">{"Nama Lengkap (Wajib)"}</label>
              <input 
                id="full_name" required aria-required="true"
                type="text" value={formData.full_name}
                onChange={(e) => setFormData({...formData, full_name: e.target.value})}
                className="w-full bg-slate-50 border-2 border-slate-100 p-4 rounded-2xl font-bold focus:border-blue-600 outline-none transition-all"
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="phone" className="text-[10px] font-black uppercase text-slate-400 px-2">{"WhatsApp Aktif (Wajib)"}</label>
              <input 
                id="phone" required aria-required="true"
                type="tel" value={formData.phone}
                onChange={(e) => setFormData({...formData, phone: e.target.value})}
                className="w-full bg-slate-50 border-2 border-slate-100 p-4 rounded-2xl font-bold focus:border-blue-600 outline-none transition-all"
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="city" className="text-[10px] font-black uppercase text-slate-400 px-2">{"Domisili Kota (Wajib)"}</label>
              <select 
                id="city" required
                value={formData.city}
                onChange={(e) => setFormData({...formData, city: e.target.value})}
                className="w-full bg-slate-50 border-2 border-slate-100 p-4 rounded-2xl font-bold focus:border-blue-600 outline-none transition-all"
              >
                <option value="">{"Pilih Kota"}</option>
                {INDONESIA_CITIES.map((city, i) => (
                  <option key={i} value={city}>{city}</option>
                ))}
              </select>
            </div>
            <div className="space-y-2">
              <label htmlFor="disability_type" className="text-[10px] font-black uppercase text-slate-400 px-2">{"Ragam Disabilitas (Wajib)"}</label>
              <select 
                id="disability_type" required
                value={formData.disability_type}
                onChange={(e) => setFormData({...formData, disability_type: e.target.value})}
                className="w-full bg-slate-50 border-2 border-slate-100 p-4 rounded-2xl font-bold focus:border-blue-600 outline-none transition-all"
              >
                <option value="">{"Pilih Ragam"}</option>
                {DISABILITY_TYPES.map((type, i) => (
                  <option key={i} value={type}>{type}</option>
                ))}
              </select>
            </div>
            <div className="space-y-2">
              <label htmlFor="comm_pref" className="text-[10px] font-black uppercase text-slate-400 px-2">{"Preferensi Komunikasi (Wajib)"}</label>
              <select 
                id="comm_pref" required
                value={formData.communication_preference}
                onChange={(e) => setFormData({...formData, communication_preference: e.target.value})}
                className="w-full bg-slate-50 border-2 border-slate-100 p-4 rounded-2xl font-bold focus:border-blue-600 outline-none transition-all"
              >
                <option value="">{"Pilih Preferensi"}</option>
                <option value="WhatsApp / Text Only">{"WhatsApp / Text Only"}</option>
                <option value="Voice Call / Telepon">{"Voice Call / Telepon"}</option>
                <option value="Video Call (Sign Language)">{"Video Call (Sign Language)"}</option>
              </select>
            </div>
          </div>
        </section>

        {/* SEKSI 2: PUSAT MEDIA & DOKUMEN (OPSIONAL) */}
        <section className="bg-white p-10 rounded-[3rem] border-2 border-slate-100 shadow-sm space-y-8">
          <h3 className="text-xs font-black uppercase text-blue-600 tracking-[0.2em]">{"Pusat Media & Portofolio"}</h3>
          <div className="grid md:grid-cols-2 gap-8">
            <div className="space-y-2">
              <label htmlFor="resume" className="text-[10px] font-black uppercase text-slate-400 px-2 flex items-center gap-2"><FileText size={12}/> {"Link Resume/CV PDF (Google Drive)"}</label>
              <input 
                id="resume" type="url" placeholder="https://drive.google.com/..."
                value={formData.resume_url}
                onChange={(e) => setFormData({...formData, resume_url: e.target.value})}
                className="w-full bg-slate-50 border-2 border-slate-100 p-4 rounded-2xl font-bold outline-none transition-all"
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="video" className="text-[10px] font-black uppercase text-slate-400 px-2 flex items-center gap-2"><Youtube size={12}/> {"Link Video Perkenalan (YouTube)"}</label>
              <input 
                id="video" type="url" placeholder="https://youtube.com/..."
                value={formData.video_intro_url}
                onChange={(e) => setFormData({...formData, video_intro_url: e.target.value})}
                className="w-full bg-slate-50 border-2 border-slate-100 p-4 rounded-2xl font-bold outline-none transition-all"
              />
            </div>
          </div>
        </section>

        {/* SEKSI 3: LEGALITAS & INFORMED CONSENT */}
        <section className="bg-slate-900 p-10 rounded-[3rem] text-white space-y-6 shadow-2xl">
          <div className="flex items-start gap-4">
            <div className="bg-blue-600 p-2 rounded-xl mt-1">
              <Info size={20} />
            </div>
            <div className="space-y-4">
              <h3 className="text-lg font-black italic uppercase tracking-tighter">{"Informed Consent"}</h3>
              <p className="text-xs font-medium text-slate-400 leading-relaxed italic">
                {"Saya menyatakan bahwa data yang saya berikan adalah benar. Saya memahami bahwa data ini akan digunakan untuk kebutuhan platform bisnis inklusi disabilitas.com dan juga dapat digunakan sebagai sumber data riset penelitian secara anonim untuk pengembangan kebijakan disabilitas."}
              </p>
              <div className="flex items-center gap-4 bg-slate-800 p-6 rounded-2xl border border-slate-700">
                <input 
                  id="consent" required type="checkbox"
                  checked={formData.has_informed_consent}
                  onChange={(e) => setFormData({...formData, has_informed_consent: e.target.checked})}
                  className="w-6 h-6 rounded-lg accent-blue-600"
                />
                <label htmlFor="consent" className="text-xs font-black uppercase italic tracking-widest cursor-pointer">
                  {"Ya, Saya Setuju & Memberikan Izin"}
                </label>
              </div>
            </div>
          </div>
        </section>

        {/* SUBMIT BUTTON */}
        <div className="flex justify-end pt-6">
          <button 
            type="submit" disabled={loading}
            className="bg-blue-600 text-white px-12 py-5 rounded-[2rem] font-black uppercase italic tracking-widest text-sm flex items-center gap-4 hover:bg-slate-900 transition-all shadow-xl shadow-blue-200"
          >
            {loading ? "Menyimpan..." : (
              <>
                <Save size={20} /> {"Simpan Identitas & Legalitas"}
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
