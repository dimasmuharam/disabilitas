"use client";

import React, { useState } from "react";
import { supabase } from "@/lib/supabase";
import { 
  Save, ArrowLeft, Globe, MapPin, Info, 
  FileText, Building2, CheckCircle2, AlertCircle,
  ListChecks, ChevronDown, Monitor
} from "lucide-react";

// MENGACU KETAT PADA DATA-STATIC.TS (Locked)
import { 
  UNIVERSITIES, 
  ACCOMMODATION_TYPES,
  INDONESIA_CITIES 
} from "@/lib/data-static";

interface ProfileEditorProps {
  campus: any;
  onUpdate: () => void;
  onBack: () => void;
}

export default function ProfileEditor({ campus, onUpdate, onBack }: ProfileEditorProps) {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ text: "", isError: false });
  
  const [formData, setFormData] = useState({
    name: campus?.name || "",
    description: campus?.description || "",
    website: campus?.website || "",
    location: campus?.location || "",
    nib_number: campus?.nib_number || "",
    inclusion_score_digital: campus?.inclusion_score_digital || 0,
    master_accommodations_provided: campus?.master_accommodations_provided || [],
  });

  const handleCheckboxChange = (item: string) => {
    const current = [...formData.master_accommodations_provided];
    const index = current.indexOf(item);
    if (index === -1) {
      current.push(item);
    } else {
      current.splice(index, 1);
    }
    setFormData({ ...formData, master_accommodations_provided: current });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ text: "", isError: false });

    try {
      const { error } = await supabase
        .from("campuses")
        .update({
          name: formData.name,
          description: formData.description,
          website: formData.website,
          location: formData.location,
          nib_number: formData.nib_number,
          inclusion_score_digital: formData.inclusion_score_digital,
          master_accommodations_provided: formData.master_accommodations_provided,
          updated_at: new Date().toISOString(),
        })
        .eq("id", campus.id);

      if (error) throw error;

      setMessage({ text: "Profil Kampus Berhasil Disinkronisasi Secara Valid!", isError: false });
      setTimeout(() => onUpdate(), 1500);
    } catch (error: any) {
      setMessage({ text: error.message, isError: true });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 text-left">
      <div className="mb-10 flex items-center justify-between border-b-4 border-slate-900 pb-6">
        <button onClick={onBack} className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-slate-900 transition-all">
          <ArrowLeft size={16} /> Batal & Kembali
        </button>
        <div className="text-right">
          <h2 className="text-2xl font-black uppercase italic tracking-tighter">Integrasi Profil Akademik</h2>
          <p className="text-[9px] font-bold uppercase tracking-widest text-emerald-600 italic">Closed Database System • Data-Static Locked</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="grid grid-cols-1 gap-12 lg:grid-cols-3">
        <div className="space-y-8 lg:col-span-2">
          
          <div className="rounded-[3rem] border-4 border-slate-900 bg-white p-10 shadow-[12px_12px_0px_0px_rgba(15,23,42,1)]">
            <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
              
              {/* DROPDOWN KAKU (CLOSED SYSTEM) */}
              <div className="md:col-span-2 space-y-3">
                <label className="ml-1 flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-400">
                  <Building2 size={14} /> Pilih Institusi Terdaftar
                </label>
                <div className="relative">
                  <select
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    className="block w-full appearance-none rounded-2xl border-2 border-slate-100 bg-slate-50 px-5 py-4 font-bold outline-none focus:border-slate-900 focus:bg-white"
                    required
                  >
                    <option value="">-- Pilih Universitas Dari Daftar --</option>
                    {UNIVERSITIES.map((uni) => (
                      <option key={uni} value={uni}>{uni}</option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={20} />
                </div>
              </div>

              <div className="md:col-span-2 space-y-3">
                <label className="ml-1 flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-400">
                  <MapPin size={14} /> Lokasi Wilayah
                </label>
                <div className="relative">
                  <select
                    value={formData.location}
                    onChange={(e) => setFormData({...formData, location: e.target.value})}
                    className="block w-full appearance-none rounded-2xl border-2 border-slate-100 bg-slate-50 px-5 py-4 font-bold outline-none focus:border-slate-900 focus:bg-white"
                    required
                  >
                    <option value="">-- Pilih Lokasi --</option>
                    {INDONESIA_CITIES.map((loc) => (
                      <option key={loc} value={loc}>{loc}</option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={20} />
                </div>
              </div>

              {/* SLIDER SKOR DIGITAL (STRATEGI AUDIT) */}
              <div className="md:col-span-2 rounded-2xl border-2 border-orange-100 bg-orange-50 p-6 space-y-4">
                <label className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-orange-600">
                  <Monitor size={16} /> Digital Accessibility Assessment
                </label>
                <div className="flex items-center gap-6">
                  <input
                    type="range"
                    min="0"
                    max="100"
                    step="5"
                    value={formData.inclusion_score_digital}
                    onChange={(e) => setFormData({...formData, inclusion_score_digital: parseInt(e.target.value)})}
                    className="h-2 w-full cursor-pointer appearance-none rounded-lg bg-orange-200 accent-orange-600"
                  />
                  <span className="text-2xl font-black text-orange-600">{formData.inclusion_score_digital}%</span>
                </div>
                <p className="text-[9px] font-bold italic text-orange-500 leading-tight uppercase">
                  Skor ini akan divalidasi oleh tim disabilitas.com melalui audit aksesibilitas profesional.
                </p>
              </div>

              <div className="space-y-3">
                <label className="ml-1 flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-400">
                  <Globe size={14} /> Website Portal
                </label>
                <input
                  type="url"
                  value={formData.website}
                  onChange={(e) => setFormData({...formData, website: e.target.value})}
                  className="block w-full rounded-2xl border-2 border-slate-100 bg-slate-50 px-5 py-4 font-bold outline-none focus:border-slate-900 focus:bg-white"
                />
              </div>

              <div className="space-y-3">
                <label className="ml-1 flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-400">
                  <FileText size={14} /> Nomor NIB / Izin
                </label>
                <input
                  type="text"
                  value={formData.nib_number}
                  onChange={(e) => setFormData({...formData, nib_number: e.target.value})}
                  className="block w-full rounded-2xl border-2 border-slate-100 bg-slate-50 px-5 py-4 font-bold outline-none focus:border-slate-900 focus:bg-white"
                />
              </div>

              <div className="md:col-span-2 space-y-3">
                <label className="ml-1 flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-400">
                  <Info size={14} /> Deskripsi Layanan Inklusi
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  rows={4}
                  className="block w-full rounded-3xl border-2 border-slate-100 bg-slate-50 px-6 py-5 font-medium outline-none focus:border-slate-900 focus:bg-white"
                />
              </div>
            </div>
          </div>
        </div>

        {/* KOLOM KANAN: 14 INDIKATOR STANDAR */}
        <div className="space-y-8">
          <div className="rounded-[2.5rem] bg-slate-900 p-8 text-white shadow-2xl">
            <h3 className="mb-6 flex items-center gap-2 text-[11px] font-black uppercase tracking-widest italic text-emerald-400">
              <ListChecks size={18} /> Akomodasi Tersedia
            </h3>
            <div className="max-h-[450px] space-y-3 overflow-y-auto pr-2 no-scrollbar">
              {ACCOMMODATION_TYPES.map((item) => (
                <label key={item} className="flex cursor-pointer items-start gap-3 rounded-xl border border-white/10 bg-white/5 p-4 transition-all hover:bg-white/10">
                  <input
                    type="checkbox"
                    className="mt-1 size-4 rounded border-gray-300 text-emerald-600 focus:ring-emerald-500"
                    checked={formData.master_accommodations_provided.includes(item)}
                    onChange={() => handleCheckboxChange(item)}
                  />
                  <span className="text-[10px] font-black leading-tight text-slate-300 uppercase">{item}</span>
                </label>
              ))}
            </div>
          </div>

          <div className="space-y-4">
            {message.text && (
              <div className={`flex items-center gap-3 rounded-2xl border-2 p-5 text-[10px] font-black uppercase animate-in zoom-in-95 ${message.isError ? 'border-red-100 bg-red-50 text-red-600' : 'border-emerald-100 bg-emerald-50 text-emerald-600'}`}>
                {message.isError ? <AlertCircle size={18} /> : <CheckCircle2 size={18} />}
                {message.text}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="group flex w-full items-center justify-center gap-3 rounded-[2rem] bg-emerald-600 py-6 text-xs font-black uppercase italic tracking-[0.2em] text-white shadow-xl transition-all hover:bg-slate-900 disabled:opacity-50"
            >
              {loading ? "SAVING RESEARCH DATA..." : (
                <>
                  <Save size={20} className="group-hover:animate-bounce" /> SIMPAN DATA VALID
                </>
              )}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}