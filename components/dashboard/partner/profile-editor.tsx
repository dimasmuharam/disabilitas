"use client";

import React, { useState, useEffect, useRef } from "react";
import { supabase } from "@/lib/supabase";
import { 
  Building2, Globe, MapPin, Save, ShieldCheck, 
  CheckCircle2, AlertCircle, FileText, ChevronDown, ArrowLeft
} from "lucide-react";
import { 
  ACCOMMODATION_TYPES, 
  INDONESIA_CITIES,
  TRAINING_PARTNERS 
} from "@/lib/data-static";

interface ProfileEditorProps {
  partner: any;
  onUpdate: () => void;
  onBack: () => void;
}

export default function ProfileEditor({ partner, onUpdate, onBack }: ProfileEditorProps) {
  const [loading, setLoading] = useState(false);
  const [statusMsg, setStatusMsg] = useState("");
  const [isCustomName, setIsCustomName] = useState(false);
  
  const manualNameRef = useRef<HTMLInputElement>(null);

  const [formData, setFormData] = useState({
    name: partner?.name || "",
    description: partner?.description || "",
    website: partner?.website || "",
    location: partner?.location || "",
    nib_number: partner?.nib_number || "",
    manual_name: "",
    master_accommodations_provided: partner?.master_accommodations_provided || []
  });

  useEffect(() => {
    // Cek jika nama saat ini adalah input manual (tidak ada di list standar)
    if (formData.name && !TRAINING_PARTNERS.includes(formData.name)) {
      setIsCustomName(true);
      setFormData(prev => ({ ...prev, manual_name: partner.name, name: "LAINNYA" }));
    }
  }, [partner.name, formData.name]);

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setStatusMsg("Menyinkronkan data riset...");
    
    const finalName = formData.name === "LAINNYA" ? formData.manual_name : formData.name;

    try {
      if (formData.name === "LAINNYA" && formData.manual_name) {
        await supabase.from("manual_input_logs").insert([{
          field_name: "partner_name_manual",
          input_value: formData.manual_name
        }]);
      }

      const { error } = await supabase
        .from("partners")
        .update({
          name: finalName,
          description: formData.description,
          website: formData.website,
          location: formData.location,
          nib_number: formData.nib_number,
          master_accommodations_provided: formData.master_accommodations_provided,
          updated_at: new Date()
        })
        .eq("id", partner.id);

      if (error) throw error;

      setStatusMsg("Profil Berhasil Diperbarui!");
      setTimeout(() => onUpdate(), 1500);
    } catch (err: any) {
      setStatusMsg("Gagal: " + err.message);
    } finally {
      setLoading(false);
    }
  }

  const toggleAccommodation = (item: string) => {
    const current = formData.master_accommodations_provided;
    const next = current.includes(item)
      ? current.filter((i: string) => i !== item)
      : [...current, item];
    setFormData({ ...formData, master_accommodations_provided: next });
  };

  return (
    <div className="mx-auto max-w-5xl space-y-10 pb-20 duration-500 animate-in fade-in">
      {/* HEADER NAV */}
      <div className="mb-10 flex items-center justify-between border-b-4 border-slate-900 pb-6">
        <button onClick={onBack} className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-400 transition-all hover:text-slate-900">
          <ArrowLeft size={16} /> Batal & Kembali
        </button>
        <div className="text-right text-slate-900">
          <h2 className="text-2xl font-black uppercase italic leading-none tracking-tighter">Profil Institusi Mitra</h2>
          <p className="mt-1 text-[9px] font-bold uppercase tracking-widest text-blue-600">Lengkapi Profil Institusi untuk Menjangkau Talenta Inklusif yang Terafiliasi dengan Anda</p>
        </div>
      </div>

      <form onSubmit={handleSave} className="grid grid-cols-1 gap-12 lg:grid-cols-3">
        <div className="space-y-8 text-left lg:col-span-2">
          {/* IDENTITAS UTAMA */}
          <section className="space-y-8 rounded-[3rem] border-4 border-slate-900 bg-white p-10 shadow-[12px_12px_0px_0px_rgba(15,23,42,1)]">
            <h3 className="flex items-center gap-2 text-xs font-black uppercase italic tracking-widest text-blue-600">
              <Building2 size={20} /> Kredensial Resmi
            </h3>
            
            <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
              {/* NAMA PENYELENGGARA */}
              <div className="space-y-3 md:col-span-2">
                <label id="inst-name-label" htmlFor="inst-name" className="ml-1 text-[10px] font-black uppercase text-slate-400">Nama Lembaga Pelatihan (List Resmi)</label>
                {!isCustomName ? (
                  <div className="relative">
                    <select 
                      id="inst-name"
                      required
                      aria-labelledby="inst-name-label"
                      className="w-full appearance-none rounded-2xl border-2 border-slate-100 bg-slate-50 p-4 font-bold outline-none focus:border-slate-900 focus:bg-white"
                      value={formData.name}
                      onChange={(e) => {
                        if (e.target.value === "LAINNYA") {
                          setIsCustomName(true);
                          setFormData({...formData, name: "LAINNYA"});
                          setTimeout(() => manualNameRef.current?.focus(), 100);
                        } else {
                          setFormData({...formData, name: e.target.value});
                        }
                      }}
                    >
                      <option value="">-- Pilih Lembaga --</option>
                      {TRAINING_PARTNERS.map(inst => <option key={inst} value={inst}>{inst}</option>)}
                      <option value="LAINNYA" className="font-black italic text-blue-600">+ TAMBAHKAN NAMA BARU</option>
                    </select>
                    <ChevronDown className="pointer-events-none absolute right-5 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                  </div>
                ) : (
                  <div className="space-y-3 animate-in zoom-in-95">
                    <input 
                      ref={manualNameRef}
                      type="text"
                      className="w-full rounded-2xl border-2 border-blue-200 bg-blue-50 p-4 font-bold outline-none focus:border-slate-900 focus:bg-white"
                      placeholder="Ketik Nama Lengkap Lembaga..."
                      value={formData.manual_name}
                      onChange={(e) => setFormData({...formData, manual_name: e.target.value})}
                      required
                    />
                    <button type="button" onClick={() => setIsCustomName(false)} className="ml-1 text-[9px] font-black uppercase text-blue-600 underline">
                      Pilih dari Daftar Resmi
                    </button>
                  </div>
                )}
              </div>

              {/* WEBSITE RESMI (FIX: SEBELUMNYA TIDAK ADA) */}
              <div className="space-y-3 md:col-span-2">
                <label htmlFor="inst-website" className="ml-1 text-[10px] font-black uppercase text-slate-400">Website Resmi Institusi</label>
                <div className="relative">
                   <Globe className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
                   <input 
                    id="inst-website"
                    type="url"
                    className="w-full rounded-2xl border-2 border-slate-100 bg-slate-50 p-4 pl-12 font-bold outline-none focus:border-slate-900 focus:bg-white"
                    placeholder="https://www.nama-lembaga.com"
                    value={formData.website}
                    onChange={(e) => setFormData({...formData, website: e.target.value})}
                  />
                </div>
              </div>

              {/* LOKASI STANDAR */}
              <div className="space-y-3">
                <label id="inst-loc-label" htmlFor="inst-loc" className="ml-1 text-[10px] font-black uppercase text-slate-400">Domisili Kota (Operasional)</label>
                <div className="relative">
                  <select 
                    id="inst-loc"
                    aria-labelledby="inst-loc-label"
                    className="w-full appearance-none rounded-2xl border-2 border-slate-100 bg-slate-50 p-4 font-bold outline-none focus:border-slate-900 focus:bg-white"
                    value={formData.location}
                    onChange={(e) => setFormData({...formData, location: e.target.value})}
                    required
                  >
                    <option value="">Pilih Kota</option>
                    {INDONESIA_CITIES.map(city => <option key={city} value={city}>{city}</option>)}
                  </select>
                  <ChevronDown className="pointer-events-none absolute right-5 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                </div>
              </div>

              {/* NIB / IZIN */}
              <div className="space-y-3">
                <label htmlFor="inst-nib" className="ml-1 text-[10px] font-black uppercase text-slate-400">Nomor Legalitas (NIB/Izin)</label>
                <input 
                  id="inst-nib"
                  className="w-full rounded-2xl border-2 border-slate-100 bg-slate-50 p-4 font-bold outline-none focus:border-slate-900 focus:bg-white"
                  placeholder="Masukkan Nomor Izin"
                  value={formData.nib_number}
                  onChange={(e) => setFormData({...formData, nib_number: e.target.value})}
                />
              </div>

              {/* VISI/DESKRIPSI */}
              <div className="space-y-3 md:col-span-2">
                <label htmlFor="inst-desc" className="ml-1 text-[10px] font-black uppercase text-slate-400">Mengenai Institusi Anda</label>
                <textarea 
                  id="inst-desc"
                  rows={4}
                  className="w-full rounded-3xl border-2 border-slate-100 bg-slate-50 p-6 font-medium leading-relaxed outline-none focus:border-slate-900 focus:bg-white"
                  placeholder="Jelaskan bagaimana institusi Anda melatih talenta disabilitas secara inklusif..."
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                />
              </div>
            </div>
          </section>
        </div>

        {/* KOLOM KANAN: AKOMODASI & SAVE */}
        <div className="space-y-8">
          <fieldset className="rounded-[2.5rem] bg-slate-900 p-8 text-left text-white shadow-2xl">
            <legend className="sr-only">Akomodasi Aksesibilitas yang Tersedia</legend>
            <h3 id="audit-title" className="mb-6 flex items-center gap-2 text-[11px] font-black uppercase italic tracking-widest text-blue-400">
              <ShieldCheck size={18} /> Akomodasi Aksesibilitas yang Tersedia
            </h3>
            <div className="no-scrollbar max-h-[380px] space-y-3 overflow-y-auto pr-2">
              {ACCOMMODATION_TYPES.map((item, idx) => {
                const isSelected = formData.master_accommodations_provided.includes(item);
                return (
                  <label key={item} className={`flex cursor-pointer items-start gap-3 rounded-xl border-2 p-4 transition-all focus-within:ring-4 focus-within:ring-blue-500/30 ${isSelected ? "border-blue-500 bg-blue-600/20" : "border-slate-800 bg-slate-800/50 hover:border-slate-700"}`}>
                    <input
                      type="checkbox"
                      aria-labelledby={`audit-title opt-acc-${idx}`}
                      className="mt-1 size-5 rounded border-gray-700 bg-slate-800 text-blue-600 accent-blue-500"
                      checked={isSelected}
                      onChange={() => toggleAccommodation(item)}
                    />
                    <span id={`opt-acc-${idx}`} className={`text-[9px] font-black uppercase leading-tight tracking-widest ${isSelected ? "text-white" : "text-slate-500"}`}>
                      {item}
                    </span>
                    {isSelected && <CheckCircle2 className="ml-auto shrink-0 text-blue-400" size={14} />}
                  </label>
                );
              })}
            </div>
          </fieldset>

          <div className="space-y-4">
            {statusMsg && (
              <div aria-live="polite" className={`flex items-center gap-3 rounded-2xl border-2 p-5 text-[10px] font-black uppercase animate-in zoom-in-95 ${statusMsg.includes("Gagal") ? 'border-red-100 bg-red-50 text-red-600' : 'border-emerald-100 bg-emerald-50 text-emerald-700'}`}>
                {statusMsg.includes("Gagal") ? <AlertCircle size={18} /> : <CheckCircle2 size={18} />}
                {statusMsg}
              </div>
            )}

            <button 
              type="submit" 
              disabled={loading}
              className="flex w-full items-center justify-center gap-3 rounded-[2rem] bg-blue-600 py-6 text-xs font-black uppercase italic tracking-[0.2em] text-white shadow-xl shadow-blue-100 transition-all hover:bg-slate-900 active:scale-[0.98] disabled:opacity-50"
            >
              {loading ? "SINKRONISASI..." : (
                <>
                  <Save size={20} /> PERBARUI DATA MITRA
                </>
              )}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
