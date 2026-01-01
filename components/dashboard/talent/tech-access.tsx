"use client";

import React, { useState } from "react";
import { updateTalentProfile } from "@/lib/actions/talent";
import { 
  Laptop, Smartphone, Wifi, MousePointer2, 
  Settings, CheckCircle2, AlertCircle, Save,
  Accessibility
} from "lucide-react";
import { DISABILITY_TOOLS, ACCOMMODATION_TYPES } from "@/lib/data-static";

interface TechAccessProps {
  user: any;
  profile: any;
  onSuccess?: () => void;
}

export default function TechAccess({ user, profile, onSuccess }: TechAccessProps) {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });

  // State Management dengan Data Real
  const [formData, setFormData] = useState({
    has_laptop: profile?.has_laptop ?? false,
    has_smartphone: profile?.has_smartphone ?? false,
    internet_quality: profile?.internet_quality || "",
    used_assistive_tools: profile?.used_assistive_tools || [],
    preferred_accommodations: profile?.preferred_accommodations || [],
  });

  const handleToggle = (field: string) => {
    setFormData((prev: any) => ({ ...prev, [field]: !prev[field] }));
  };

  const handleMultiSelect = (field: string, value: string) => {
    setFormData((prev: any) => {
      const current = prev[field] || [];
      const updated = current.includes(value)
        ? current.filter((i: string) => i !== value)
        : [...current, value];
      return { ...prev, [field]: updated };
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const result = await updateTalentProfile(user.id, formData);
    setLoading(false);

    if (result.success) {
      setMessage({ type: "success", text: "Data Sarana & Aksesibilitas berhasil diperbarui!" });
      if (onSuccess) onSuccess();
    } else {
      setMessage({ type: "error", text: `Gagal menyimpan: ${result.error}` });
    }
  };

  return (
    <div className="max-w-4xl mx-auto pb-20">
      <header className="mb-10">
        <h1 className="text-4xl font-black italic uppercase tracking-tighter text-slate-900 flex items-center gap-4">
          <Laptop className="text-indigo-600" size={36} />
          {"Sarana & Aksesibilitas"}
        </h1>
        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-2">
          {"Informasi perangkat kerja dan dukungan aksesibilitas yang Anda butuhkan."}
        </p>
      </header>

      {/* NOTIFIKASI ARIA-LIVE */}
      {message.text && (
        <div 
          role="status" aria-live="polite"
          className={`mb-8 p-6 rounded-[2rem] flex items-center gap-4 border-2 ${
            message.type === "success" ? "bg-emerald-50 border-emerald-200 text-emerald-800" : "bg-red-50 border-red-200 text-red-800"
          }`}
        >
          {message.type === "success" ? <CheckCircle2 size={24} /> : <AlertCircle size={24} />}
          <p className="text-sm font-black uppercase italic tracking-tight">{message.text}</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-12">
        
        {/* SEKSI 1: PERANGKAT KERJA (WAJIB) */}
        <section className="bg-white p-10 rounded-[3rem] border-2 border-slate-100 shadow-sm space-y-8">
          <h3 className="text-xs font-black uppercase text-indigo-600 tracking-[0.2em]">{"Peralatan Utama (Wajib)"}</h3>
          <div className="grid md:grid-cols-2 gap-6">
            <button
              type="button"
              onClick={() => handleToggle("has_laptop")}
              className={`p-6 rounded-3xl border-2 flex items-center justify-between transition-all ${
                formData.has_laptop ? "border-indigo-600 bg-indigo-50" : "border-slate-100 bg-slate-50"
              }`}
            >
              <div className="flex items-center gap-4">
                <Laptop className={formData.has_laptop ? "text-indigo-600" : "text-slate-400"} />
                <span className="text-xs font-black uppercase italic">{"Memiliki Laptop"}</span>
              </div>
              {formData.has_laptop && <CheckCircle2 size={16} className="text-indigo-600" />}
            </button>

            <button
              type="button"
              onClick={() => handleToggle("has_smartphone")}
              className={`p-6 rounded-3xl border-2 flex items-center justify-between transition-all ${
                formData.has_smartphone ? "border-indigo-600 bg-indigo-50" : "border-slate-100 bg-slate-50"
              }`}
            >
              <div className="flex items-center gap-4">
                <Smartphone className={formData.has_smartphone ? "text-indigo-600" : "text-slate-400"} />
                <span className="text-xs font-black uppercase italic">{"Memiliki Smartphone"}</span>
              </div>
              {formData.has_smartphone && <CheckCircle2 size={16} className="text-indigo-600" />}
            </button>
          </div>

          <div className="space-y-2">
            <label htmlFor="internet" className="text-[10px] font-black uppercase text-slate-400 px-2 flex items-center gap-2">
              <Wifi size={12}/> {"Koneksi Internet Utama (Wajib)"}
            </label>
            <select 
              id="internet" required
              value={formData.internet_quality}
              onChange={(e) => setFormData({...formData, internet_quality: e.target.value})}
              className="w-full bg-slate-50 border-2 border-slate-100 p-4 rounded-2xl font-bold outline-none focus:border-indigo-600 transition-all"
            >
              <option value="">{"Pilih Kualitas Koneksi"}</option>
              <option value="Wifi Rumah / Fiber Optic">{"Wifi Rumah / Fiber Optic"}</option>
              <option value="Mobile Data / Hotspot">{"Mobile Data / Hotspot"}</option>
              <option value="Sangat Terbatas">{"Sangat Terbatas"}</option>
            </select>
          </div>
        </section>

        {/* SEKSI 2: ALAT BANTU & AKOMODASI (OPSIONAL) */}
        <section className="bg-white p-10 rounded-[3rem] border-2 border-slate-100 shadow-sm space-y-10">
          <div className="space-y-6">
            <h3 className="text-xs font-black uppercase text-indigo-600 tracking-[0.2em] flex items-center gap-2">
              <Settings size={14} /> {"Alat Bantu yang Digunakan (Multi-select)"}
            </h3>
            <div className="flex flex-wrap gap-3">
              {DISABILITY_TOOLS.map((tool, i) => (
                <button
                  key={i} type="button"
                  onClick={() => handleMultiSelect("used_assistive_tools", tool)}
                  className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase transition-all border-2 ${
                    formData.used_assistive_tools.includes(tool)
                      ? "bg-indigo-600 border-indigo-600 text-white shadow-lg"
                      : "bg-white border-slate-100 text-slate-400 hover:border-indigo-200"
                  }`}
                >
                  {tool}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-6 pt-6 border-t border-slate-50">
            <h3 className="text-xs font-black uppercase text-indigo-600 tracking-[0.2em] flex items-center gap-2">
              <Accessibility size={14} /> {"Akomodasi Kerja yang Dibutuhkan"}
            </h3>
            <div className="flex flex-wrap gap-3">
              {ACCOMMODATION_TYPES.map((acc, i) => (
                <button
                  key={i} type="button"
                  onClick={() => handleMultiSelect("preferred_accommodations", acc)}
                  className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase transition-all border-2 ${
                    formData.preferred_accommodations.includes(acc)
                      ? "bg-indigo-600 border-indigo-600 text-white shadow-lg"
                      : "bg-white border-slate-100 text-slate-400 hover:border-indigo-200"
                  }`}
                >
                  {acc}
                </button>
              ))}
            </div>
          </div>
        </section>

        {/* SUBMIT */}
        <div className="flex justify-end pt-6">
          <button 
            type="submit" disabled={loading}
            className="bg-indigo-600 text-white px-12 py-5 rounded-[2rem] font-black uppercase italic tracking-widest text-sm flex items-center gap-4 hover:bg-slate-900 transition-all shadow-xl shadow-indigo-200"
          >
            {loading ? "Menyimpan..." : (
              <>
                <Save size={20} /> {"Simpan Sarana & Aksesibilitas"}
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
