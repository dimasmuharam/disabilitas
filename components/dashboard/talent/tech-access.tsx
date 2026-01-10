"use client";

import React, { useState } from "react";
import { createClient } from "@/lib/supabase/client/client";
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
    <div className="mx-auto max-w-4xl pb-20 font-sans text-slate-900 duration-500 animate-in fade-in">
      <header className="mb-10 px-4">
        <h1 className="flex items-center gap-4 text-4xl font-black uppercase italic tracking-tighter">
          <Monitor className="text-blue-600" size={36} aria-hidden="true" />
          {"Sarana Kerja"}
        </h1>
        <p className="mt-2 text-[10px] font-bold uppercase italic tracking-widest text-slate-400">
          {"Verifikasi ketersediaan perangkat & akomodasi teknologi pendukung."}
        </p>
      </header>

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
        {/* SEKSI 1: PERALATAN (CHECKBOX) */}
        <section className="space-y-8 rounded-[3rem] border-2 border-slate-100 bg-white p-10 shadow-sm">
          <h2 className="flex items-center gap-2 text-xs font-black uppercase tracking-[0.2em] text-blue-600">
            <Laptop size={16} aria-hidden="true" /> {"Kepemilikan Alat Kerja"}
          </h2>
          <div className="grid gap-4 md:grid-cols-2">
            <label className="flex cursor-pointer items-center gap-4 rounded-3xl border-2 border-transparent bg-slate-50 p-6 transition-all hover:bg-blue-50 has-[:checked]:border-blue-600">
              <input type="checkbox" className="size-6 accent-blue-600" checked={formData.has_laptop} onChange={(e) => setFormData({...formData, has_laptop: e.target.checked})} />
              <span className="text-xs font-bold uppercase">{"Laptop / Komputer"}</span>
            </label>
            <label className="flex cursor-pointer items-center gap-4 rounded-3xl border-2 border-transparent bg-slate-50 p-6 transition-all hover:bg-blue-50 has-[:checked]:border-blue-600">
              <input type="checkbox" className="size-6 accent-blue-600" checked={formData.has_smartphone} onChange={(e) => setFormData({...formData, has_smartphone: e.target.checked})} />
              <span className="text-xs font-bold uppercase">{"Smartphone / HP"}</span>
            </label>
          </div>
        </section>

        {/* SEKSI 2: INTERNET (SINKRON DENGAN CONSTRAINT DATABASE) */}
        <section className="space-y-8 rounded-[3rem] border-2 border-slate-100 bg-white p-10 shadow-sm">
          <h2 className="flex items-center gap-2 text-xs font-black uppercase tracking-[0.2em] text-emerald-600">
            <Wifi size={16} aria-hidden="true" /> {"Akses Internet"}
          </h2>
          <div>
            <label htmlFor="internet_quality" className="ml-2 text-[10px] font-bold uppercase text-slate-400">{"Jenis Jaringan Terkuat Di Rumah"}</label>
            <select 
              id="internet_quality" 
              className="w-full rounded-2xl border-2 border-slate-50 bg-slate-50 p-4 text-sm font-bold outline-none transition-all focus:border-emerald-600"
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
        <section className="space-y-8 rounded-[3rem] border-2 border-slate-100 bg-white p-10 shadow-sm">
          <h2 className="flex items-center gap-2 text-xs font-black uppercase tracking-[0.2em] text-purple-600">
            <Construction size={16} aria-hidden="true" /> {"Alat Bantu Utama"}
          </h2>
          <div className="custom-scrollbar grid max-h-72 gap-3 overflow-y-auto pr-2 md:grid-cols-2">
            {DISABILITY_TOOLS.map((tool) => (
              <label key={tool} className="flex cursor-pointer items-center gap-3 rounded-2xl border border-transparent bg-slate-50 p-4 transition-all hover:bg-purple-50 has-[:checked]:border-purple-600">
                <input 
                  type="checkbox" 
                  className="size-5 accent-purple-600"
                  checked={formData.used_assistive_tools.includes(tool)}
                  onChange={() => handleMultiSelect("used_assistive_tools", tool)}
                />
                <span className="text-[11px] font-bold uppercase">{tool}</span>
              </label>
            ))}
          </div>
          <div className="border-t border-slate-50 pt-4">
            <label htmlFor="other_tool" className="ml-2 flex items-center gap-2 text-[10px] font-bold uppercase italic text-slate-400">
              <PlusCircle size={12} /> {"Lainnya (Sebutkan jika tidak ada di daftar)"}
            </label>
            <input id="other_tool" type="text" className="mt-2 w-full rounded-2xl border-2 border-slate-50 bg-slate-50 p-4 text-sm font-bold outline-none focus:border-purple-600" value={otherTool} onChange={(e) => setOtherTool(e.target.value)} />
          </div>
        </section>

        {/* SEKSI 4: AKOMODASI (CHECKBOX LIST MULTIPLE) */}
        <section className="space-y-8 rounded-[3rem] border-2 border-slate-100 bg-white p-10 shadow-sm">
          <h2 className="flex items-center gap-2 text-xs font-black uppercase tracking-[0.2em] text-blue-600">
            <Monitor size={16} aria-hidden="true" /> {"Akomodasi Kerja Dibutuhkan"}
          </h2>
          <div className="grid gap-3 md:grid-cols-2">
            {ACCOMMODATION_TYPES.map((acc) => (
              <label key={acc} className="flex cursor-pointer items-center gap-3 rounded-2xl border border-transparent bg-slate-50 p-4 transition-all hover:bg-blue-50 has-[:checked]:border-blue-600">
                <input 
                  type="checkbox" 
                  className="size-5 accent-blue-600"
                  checked={formData.preferred_accommodations.includes(acc)}
                  onChange={() => handleMultiSelect("preferred_accommodations", acc)}
                />
                <span className="text-[11px] font-bold uppercase">{acc}</span>
              </label>
            ))}
          </div>
          <div className="border-t border-slate-50 pt-4">
            <label htmlFor="other_acc" className="ml-2 flex items-center gap-2 text-[10px] font-bold uppercase italic text-slate-400">
              <PlusCircle size={12} /> {"Kebutuhan Akomodasi Lainnya"}
            </label>
            <input id="other_acc" type="text" className="mt-2 w-full rounded-2xl border-2 border-slate-50 bg-slate-50 p-4 text-sm font-bold outline-none focus:border-blue-600" value={otherAcc} onChange={(e) => setOtherAcc(e.target.value)} />
          </div>
        </section>

        <div className="flex justify-end pt-4">
          <button type="submit" disabled={loading} className="flex items-center gap-4 rounded-[2rem] bg-slate-900 px-12 py-5 text-sm font-black uppercase italic tracking-widest text-white shadow-2xl transition-all hover:bg-blue-600 disabled:opacity-50">
            {loading ? "Menyimpan..." : <><Save size={20} /> {"Simpan Sarana Kerja"}</>}
          </button>
        </div>
      </form>
    </div>
  );
}
