"use client";

import React, { useState } from "react";
import { supabase } from "@/lib/supabase";
import { 
  Save, Monitor, Laptop, Wifi, Construction,
  CheckCircle2, AlertCircle, Info, PlusCircle
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

  // Input manual sementara untuk "Others"
  const [otherTool, setOtherTool] = useState("");
  const [otherAcc, setOtherAcc] = useState("");

  const [formData, setFormData] = useState({
    has_laptop: profile?.has_laptop || false,
    has_smartphone: profile?.has_smartphone || false,
    // KOREKSI: Default value disesuaikan dengan constraint database
    internet_quality: profile?.internet_quality || "mobile_stable", 
    used_assistive_tools: profile?.used_assistive_tools || [], 
    preferred_accommodations: profile?.preferred_accommodations || []
  });

  const handleMultiSelect = (column: string, value: string) => {
    const currentValues = (formData as any)[column] || [];
    const newValues = currentValues.includes(value)
      ? currentValues.filter((v: string) => v !== value)
      : [...currentValues, value];
    
    setFormData({ ...formData, [column]: newValues });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ type: "", text: "" });

    // Integrasi isian manual ke dalam array
    let finalTools = [...formData.used_assistive_tools];
    if (otherTool) finalTools.push(`Lainnya: ${otherTool}`);

    let finalAccs = [...formData.preferred_accommodations];
    if (otherAcc) finalAccs.push(`Lainnya: ${otherAcc}`);

    try {
      const { error } = await supabase
        .from("profiles")
        .update({
          ...formData,
          used_assistive_tools: finalTools,
          preferred_accommodations: finalAccs
        })
        .eq("id", user.id);

      if (error) throw error;
      
      // Pesan untuk Screen Reader
      setMessage({ type: "success", text: "Sarana Kerja Berhasil Disimpan. Mengalihkan ke Overview..." });
      
      // AUTO-REDIRECT PASTI BEKERJA
      setTimeout(() => {
        onSuccess();
        window.scrollTo({ top: 0, behavior: "smooth" });
      }, 2000);

    } catch (error: any) {
      setMessage({ type: "error", text: error.message });
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
          {"Verifikasi ketersediaan perangkat & akomodasi teknologi pendukung."}
        </p>
      </header>

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
        {/* SEKSI 1: PERALATAN (CHECKBOX) */}
        <section className="bg-white p-10 rounded-[3rem] border-2 border-slate-100 shadow-sm space-y-8">
          <h2 className="text-xs font-black uppercase text-blue-600 tracking-[0.2em] flex items-center gap-2">
            <Laptop size={16} aria-hidden="true" /> {"Kepemilikan Alat Kerja"}
          </h2>
          <div className="grid md:grid-cols-2 gap-4">
            <label className="flex items-center gap-4 p-6 bg-slate-50 rounded-3xl cursor-pointer hover:bg-blue-50 transition-all border-2 border-transparent has-[:checked]:border-blue-600">
              <input type="checkbox" className="w-6 h-6 accent-blue-600" checked={formData.has_laptop} onChange={(e) => setFormData({...formData, has_laptop: e.target.checked})} />
              <span className="text-xs font-bold uppercase">{"Laptop / Komputer"}</span>
            </label>
            <label className="flex items-center gap-4 p-6 bg-slate-50 rounded-3xl cursor-pointer hover:bg-blue-50 transition-all border-2 border-transparent has-[:checked]:border-blue-600">
              <input type="checkbox" className="w-6 h-6 accent-blue-600" checked={formData.has_smartphone} onChange={(e) => setFormData({...formData, has_smartphone: e.target.checked})} />
              <span className="text-xs font-bold uppercase">{"Smartphone / HP"}</span>
            </label>
          </div>
        </section>

        {/* SEKSI 2: INTERNET (SINKRON DENGAN CONSTRAINT DATABASE) */}
        <section className="bg-white p-10 rounded-[3rem] border-2 border-slate-100 shadow-sm space-y-8">
          <h2 className="text-xs font-black uppercase text-emerald-600 tracking-[0.2em] flex items-center gap-2">
            <Wifi size={16} aria-hidden="true" /> {"Akses Internet"}
          </h2>
          <div>
            <label htmlFor="internet_quality" className="text-[10px] font-bold uppercase ml-2 text-slate-400">{"Jenis Jaringan Terkuat Di Rumah"}</label>
            <select 
              id="internet_quality" 
              className="w-full bg-slate-50 border-2 border-slate-50 p-4 rounded-2xl font-bold outline-none focus:border-emerald-600 transition-all text-sm"
              value={formData.internet_quality}
              onChange={(e) => setFormData({...formData, internet_quality: e.target.value})}
            >
              <option value="fiber">{"WiFi / Fiber Optic (Indihome/Biznet/dsb)"}</option>
              <option value="mobile_stable">{"Data Seluler Stabil (4G/5G)"}</option>
              <option value="unstable">{"Jaringan Sering Terputus / Lemah"}</option>
              <option value="none">{"Tidak Ada Akses Internet"}</option>
            </select>
          </div>
        </section>

        {/* SEKSI 3: ALAT BANTU (CHECKBOX LIST MULTIPLE) */}
        <section className="bg-white p-10 rounded-[3rem] border-2 border-slate-100 shadow-sm space-y-8">
          <h2 className="text-xs font-black uppercase text-purple-600 tracking-[0.2em] flex items-center gap-2">
            <Construction size={16} aria-hidden="true" /> {"Alat Bantu Utama"}
          </h2>
          <div className="grid md:grid-cols-2 gap-3 max-h-72 overflow-y-auto pr-2 custom-scrollbar">
            {DISABILITY_TOOLS.map((tool) => (
              <label key={tool} className="flex items-center gap-3 p-4 bg-slate-50 rounded-2xl cursor-pointer hover:bg-purple-50 transition-all border border-transparent has-[:checked]:border-purple-600">
                <input 
                  type="checkbox" 
                  className="w-5 h-5 accent-purple-600"
                  checked={formData.used_assistive_tools.includes(tool)}
                  onChange={() => handleMultiSelect("used_assistive_tools", tool)}
                />
                <span className="text-[11px] font-bold uppercase">{tool}</span>
              </label>
            ))}
          </div>
          <div className="pt-4 border-t border-slate-50">
            <label htmlFor="other_tool" className="text-[10px] font-bold uppercase ml-2 text-slate-400 flex items-center gap-2 italic">
              <PlusCircle size={12} /> {"Lainnya (Sebutkan jika tidak ada di daftar)"}
            </label>
            <input id="other_tool" type="text" className="w-full bg-slate-50 border-2 border-slate-50 p-4 rounded-2xl font-bold outline-none focus:border-purple-600 text-sm mt-2" value={otherTool} onChange={(e) => setOtherTool(e.target.value)} />
          </div>
        </section>

        {/* SEKSI 4: AKOMODASI (CHECKBOX LIST MULTIPLE) */}
        <section className="bg-white p-10 rounded-[3rem] border-2 border-slate-100 shadow-sm space-y-8">
          <h2 className="text-xs font-black uppercase text-blue-600 tracking-[0.2em] flex items-center gap-2">
            <Monitor size={16} aria-hidden="true" /> {"Akomodasi Kerja Dibutuhkan"}
          </h2>
          <div className="grid md:grid-cols-2 gap-3">
            {ACCOMMODATION_TYPES.map((acc) => (
              <label key={acc} className="flex items-center gap-3 p-4 bg-slate-50 rounded-2xl cursor-pointer hover:bg-blue-50 transition-all border border-transparent has-[:checked]:border-blue-600">
                <input 
                  type="checkbox" 
                  className="w-5 h-5 accent-blue-600"
                  checked={formData.preferred_accommodations.includes(acc)}
                  onChange={() => handleMultiSelect("preferred_accommodations", acc)}
                />
                <span className="text-[11px] font-bold uppercase">{acc}</span>
              </label>
            ))}
          </div>
          <div className="pt-4 border-t border-slate-50">
            <label htmlFor="other_acc" className="text-[10px] font-bold uppercase ml-2 text-slate-400 flex items-center gap-2 italic">
              <PlusCircle size={12} /> {"Kebutuhan Akomodasi Lainnya"}
            </label>
            <input id="other_acc" type="text" className="w-full bg-slate-50 border-2 border-slate-50 p-4 rounded-2xl font-bold outline-none focus:border-blue-600 text-sm mt-2" value={otherAcc} onChange={(e) => setOtherAcc(e.target.value)} />
          </div>
        </section>

        <div className="flex justify-end pt-4">
          <button type="submit" disabled={loading} className="bg-slate-900 text-white px-12 py-5 rounded-[2rem] font-black uppercase italic tracking-widest text-sm flex items-center gap-4 hover:bg-blue-600 transition-all shadow-2xl disabled:opacity-50">
            {loading ? "Menyimpan..." : <><Save size={20} /> {"Simpan Sarana Kerja"}</>}
          </button>
        </div>
      </form>
    </div>
  );
}
