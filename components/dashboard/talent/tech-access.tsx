"use client";

import React, { useState } from "react";
import { supabase } from "@/lib/supabase";
import { 
  Save, Monitor, Laptop, Wifi, Construction,
  CheckCircle2, AlertCircle, Info 
} from "lucide-react";

// MENGAMBIL DATA DARI STANDAR KITA (data-static.ts)
import { DISABILITY_TOOLS, ACCOMMODATION_TYPES } from "@/lib/data-static";

interface TechAccessProps {
  user: any;
  profile: any;
  onSuccess: () => void;
}

export default function TechAccess({ user, profile, onSuccess }: TechAccessProps) {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });

  // STATE: Sinkron dengan skema database profiles
  const [formData, setFormData] = useState({
    // Peralatan Kerja (Boolean Checkbox)
    has_laptop: profile?.has_laptop || false,
    has_smartphone: profile?.has_smartphone || false,
    
    // Ketersediaan Internet (Constraint fix: male/female style)
    internet_access: profile?.internet_access || "Data Seluler", 
    
    // Alat Bantu & Akomodasi (Combobox dari data-static)
    assistive_tool: profile?.assistive_tool || "",
    required_accommodation: profile?.required_accommodation || ""
  });

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
      
      // Pesan konfirmasi untuk pengguna screen reader
      setMessage({ type: "success", text: "Sarana Kerja Berhasil Disimpan. Mengalihkan ke Overview..." });
      
      // FITUR: PASTI KEMBALI KE OVERVIEW
      setTimeout(() => {
        onSuccess(); // Memicu setActiveTab("overview") di parent
        window.scrollTo({ top: 0, behavior: "smooth" });
      }, 2000);

    } catch (error: any) {
      // Penanganan Error Constraint yang lebih spesifik
      const errorText = error.message.includes("check constraint") 
        ? "Gagal: Format pilihan internet tidak sesuai. Gunakan pilihan yang tersedia."
        : error.message;
        
      setMessage({ type: "error", text: errorText });
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto pb-20 animate-in fade-in duration-500 font-sans text-slate-900">
      <header className="mb-10 px-4">
        <h1 className="text-4xl font-black italic uppercase tracking-tighter flex items-center gap-4">
          <Monitor className="text-blue-600" size={36} aria-hidden="true" />
          {"Sarana Kerja"}
        </h1>
        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-2 italic">
          {"Informasi ketersediaan perangkat & akomodasi teknologi."}
        </p>
      </header>

      {/* ARIA-LIVE REGION UNTUK SCREEN READER */}
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
        {/* SEKSI 1: PERALATAN (CHECKBOX SESUAI INSTRUKSI) */}
        <section className="bg-white p-10 rounded-[3rem] border-2 border-slate-100 shadow-sm space-y-8" aria-labelledby="heading-peralatan">
          <h2 id="heading-peralatan" className="text-xs font-black uppercase text-blue-600 tracking-[0.2em] flex items-center gap-2">
            <Laptop size={16} aria-hidden="true" /> {"Kepemilikan Alat"}
          </h2>
          <div className="grid md:grid-cols-2 gap-4">
            <label className="group flex items-center gap-4 p-6 bg-slate-50 rounded-3xl cursor-pointer hover:bg-blue-50 transition-all border-2 border-transparent has-[:checked]:border-blue-600">
              <input 
                type="checkbox" 
                className="w-6 h-6 accent-blue-600"
                checked={formData.has_laptop}
                onChange={(e) => setFormData({...formData, has_laptop: e.target.checked})}
              />
              <span className="text-xs font-bold uppercase tracking-tight text-slate-700">{"Laptop / Komputer Pribadi"}</span>
            </label>

            <label className="group flex items-center gap-4 p-6 bg-slate-50 rounded-3xl cursor-pointer hover:bg-blue-50 transition-all border-2 border-transparent has-[:checked]:border-blue-600">
              <input 
                type="checkbox" 
                className="w-6 h-6 accent-blue-600"
                checked={formData.has_smartphone}
                onChange={(e) => setFormData({...formData, has_smartphone: e.target.checked})}
              />
              <span className="text-xs font-bold uppercase tracking-tight text-slate-700">{"Smartphone"}</span>
            </label>
          </div>
        </section>

        {/* SEKSI 2: INTERNET (KETERSEDIAAN JARINGAN) */}
        <section className="bg-white p-10 rounded-[3rem] border-2 border-slate-100 shadow-sm space-y-8" aria-labelledby="heading-internet">
          <h2 id="heading-internet" className="text-xs font-black uppercase text-emerald-600 tracking-[0.2em] flex items-center gap-2">
            <Wifi size={16} aria-hidden="true" /> {"Akses Internet Di Rumah"}
          </h2>
          <div className="space-y-4">
            <label htmlFor="internet_access" className="text-[10px] font-bold uppercase ml-2 text-slate-400">{"Jenis Jaringan"}</label>
            <select 
              id="internet_access" 
              className="w-full bg-slate-50 border-2 border-slate-50 p-4 rounded-2xl font-bold outline-none focus:border-emerald-600 transition-all text-sm"
              value={formData.internet_access}
              onChange={(e) => setFormData({...formData, internet_access: e.target.value})}
            >
              <option value="WiFi-Internet Kabel">{"WiFi / Internet Kabel"}</option>
              <option value="Data Seluler">{"Hanya Data Seluler"}</option>
              <option value="Tidak Ada">{"Tidak Ada Akses Internet"}</option>
            </select>
          </div>
        </section>

        {/* SEKSI 3: ALAT BANTU & AKOMODASI (COMBOBOX) */}
        <section className="bg-white p-10 rounded-[3rem] border-2 border-slate-100 shadow-sm space-y-8" aria-labelledby="heading-acc">
          <h2 id="heading-acc" className="text-xs font-black uppercase text-purple-600 tracking-[0.2em] flex items-center gap-2">
            <Construction size={16} aria-hidden="true" /> {"Teknologi & Akomodasi"}
          </h2>
          <div className="grid md:grid-cols-2 gap-8">
            <div className="space-y-2">
              <label htmlFor="assistive_tool" className="text-[10px] font-bold uppercase ml-2 text-slate-400">{"Alat Bantu Utama"}</label>
              <select 
                id="assistive_tool" 
                className="w-full bg-slate-50 border-2 border-slate-50 p-4 rounded-2xl font-bold outline-none focus:border-purple-600 transition-all text-sm"
                value={formData.assistive_tool}
                onChange={(e) => setFormData({...formData, assistive_tool: e.target.value})}
              >
                <option value="">{"Pilih Alat Bantu"}</option>
                {DISABILITY_TOOLS.map((tool) => (
                  <option key={tool} value={tool}>{tool}</option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <label htmlFor="required_accommodation" className="text-[10px] font-bold uppercase ml-2 text-slate-400">{"Akomodasi Dibutuhkan"}</label>
              <select 
                id="required_accommodation" 
                className="w-full bg-slate-50 border-2 border-slate-50 p-4 rounded-2xl font-bold outline-none focus:border-purple-600 transition-all text-sm"
                value={formData.required_accommodation}
                onChange={(e) => setFormData({...formData, required_accommodation: e.target.value})}
              >
                <option value="">{"Pilih Akomodasi"}</option>
                {ACCOMMODATION_TYPES.map((acc) => (
                  <option key={acc} value={acc}>{acc}</option>
                ))}
              </select>
            </div>
          </div>
        </section>

        <div className="flex justify-end pt-4">
          <button 
            type="submit" 
            disabled={loading} 
            className="bg-slate-900 text-white px-12 py-5 rounded-[2rem] font-black uppercase italic tracking-widest text-sm flex items-center gap-4 hover:bg-blue-600 transition-all shadow-2xl disabled:opacity-50"
          >
            {loading ? "Sinkronisasi..." : <><Save size={20} aria-hidden="true" /> {"Simpan Sarana"}</>}
          </button>
        </div>
      </form>
    </div>
  );
}
