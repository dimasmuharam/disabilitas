"use client";

import React, { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { 
  Building2, Globe, MapPin, Save, ShieldCheck, 
  CheckCircle2, AlertCircle, FileText, ChevronDown, ArrowLeft
} from "lucide-center";
import { 
  ACCOMMODATION_TYPES, 
  INDONESIA_CITIES,
  TRAINING_PARTNERS // Hanya menggunakan ini sebagai acuan tunggal
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
  }, []);

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setStatusMsg("Sinkronisasi data riset...");
    
    const finalName = formData.name === "LAINNYA" ? formData.manual_name : formData.name;

    try {
      // Log input manual untuk audit Super Admin nanti
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

      setStatusMsg("Data Berhasil Diperbarui!");
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
        <button onClick={onBack} className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-slate-900">
          <ArrowLeft size={16} /> Batal
        </button>
        <div className="text-right text-slate-900">
          <h2 className="text-2xl font-black uppercase italic tracking-tighter">Profil Mitra Pelatihan</h2>
          <p className="text-[9px] font-bold uppercase tracking-widest text-blue-600">Standardisasi: Training Partners List</p>
        </div>
      </div>

      <form onSubmit={handleSave} className="grid grid-cols-1 gap-12 lg:grid-cols-3">
        <div className="space-y-8 lg:col-span-2 text-left">
          {/* IDENTITAS UTAMA */}
          <section className="rounded-[3rem] border-4 border-slate-900 bg-white p-10 shadow-[12px_12px_0px_0px_rgba(15,23,42,1)] space-y-8">
            <div className="flex items-center gap-2">
              <Building2 className="text-blue-600" size={20} />
              <h3 className="text-xs font-black uppercase tracking-widest italic">Kredensial Institusi</h3>
            </div>
            
            <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
              {/* NAMA PENYELENGGARA - DROPDOWN DARI TRAINING_PARTNERS */}
              <div className="md:col-span-2 space-y-3">
                <label className="ml-1 text-[10px] font-black uppercase text-slate-400">Pilih Nama Lembaga Pelatihan (List Resmi)</label>
                {!isCustomName ? (
                  <div className="relative">
                    <select 
                      required
                      className="w-full appearance-none rounded-2xl border-2 border-slate-100 bg-slate-50 p-4 font-bold outline-none focus:border-slate-900 focus:bg-white"
                      value={formData.name}
                      onChange={(e) => {
                        if (e.target.value === "LAINNYA") {
                          setIsCustomName(true);
                          setFormData({...formData, name: "LAINNYA"});
                        } else {
                          setFormData({...formData, name: e.target.value});
                        }
                      }}
                    >
                      <option value="">-- Pilih Lembaga Pelatihan --</option>
                      {TRAINING_PARTNERS.map(inst => <option key={inst} value={inst}>{inst}</option>)}
                      <option value="LAINNYA" className="text-blue-600 font-black italic">+ TAMBAHKAN NAMA BARU</option>
                    </select>
                    <ChevronDown className="absolute right-5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={20} />
                  </div>
                ) : (
                  <div className="space-y-3 animate-in zoom-in-95">
                    <input 
                      type="text"
                      className="w-full rounded-2xl border-2 border-blue-200 bg-blue-50 p-4 font-bold outline-none focus:border-slate-900 focus:bg-white"
                      placeholder="Ketik Nama Lengkap Lembaga..."
                      value={formData.manual_name}
                      onChange={(e) => setFormData({...formData, manual_name: e.target.value})}
                      required
                    />
                    <button type="button" onClick={() => setIsCustomName(false)} className="text-[9px] font-black uppercase text-blue-600 underline">
                      Kembali ke Daftar Resmi
                    </button>
                  </div>
                )}
              </div>

              {/* LOKASI STANDAR */}
              <div className="space-y-3">
                <label className="ml-1 text-[10px] font-black uppercase text-slate-400">Lokasi Kota (Domisili)</label>
                <div className="relative">
                  <select 
                    className="w-full appearance-none rounded-2xl border-2 border-slate-100 bg-slate-50 p-4 font-bold outline-none focus:border-slate-900 focus:bg-white"
                    value={formData.location}
                    onChange={(e) => setFormData({...formData, location: e.target.value})}
                    required
                  >
                    <option value="">Pilih Kota</option>
                    {INDONESIA_CITIES.map(city => <option key={city} value={city}>{city}</option>)}
                  </select>
                  <ChevronDown className="absolute right-5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={20} />
                </div>
              </div>

              <div className="space-y-3">
                <label className="ml-1 text-[10px] font-black uppercase text-slate-400">Legalitas (NIB/Izin)</label>
                <input 
                  className="w-full rounded-2xl border-2 border-slate-100 bg-slate-50 p-4 font-bold outline-none focus:border-slate-900 focus:bg-white"
                  placeholder="Masukkan Nomor Izin"
                  value={formData.nib_number}
                  onChange={(e) => setFormData({...formData, nib_number: e.target.value})}
                />
              </div>

              <div className="md:col-span-2 space-y-3">
                <label className="ml-1 text-[10px] font-black uppercase text-slate-400">Visi Inklusi Lembaga</label>
                <textarea 
                  rows={4}
                  className="w-full rounded-3xl border-2 border-slate-100 bg-slate-50 p-6 font-medium outline-none focus:border-slate-900 focus:bg-white"
                  placeholder="Ceritakan bagaimana lembaga Anda melatih talenta disabilitas secara inklusif..."
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                />
              </div>
            </div>
          </section>
        </div>

        {/* KOLOM KANAN: AKOMODASI & SAVE */}
        <div className="space-y-8">
          <section className="rounded-[2.5rem] bg-slate-900 p-8 text-left text-white shadow-2xl">
            <h3 className="mb-6 flex items-center gap-2 text-[11px] font-black uppercase tracking-widest italic text-blue-400">
              <ShieldCheck size={18} /> Audit Akomodasi
            </h3>
            <div className="max-h-[380px] space-y-3 overflow-y-auto pr-2 no-scrollbar">
              {ACCOMMODATION_TYPES.map((item) => {
                const isSelected = formData.master_accommodations_provided.includes(item);
                return (
                  <label key={item} className={`flex cursor-pointer items-start gap-3 rounded-xl border-2 p-4 transition-all ${isSelected ? "border-blue-500 bg-blue-600/20" : "border-slate-800 bg-slate-800/50 hover:border-slate-700"}`}>
                    <input
                      type="checkbox"
                      className="sr-only"
                      checked={isSelected}
                      onChange={() => toggleAccommodation(item)}
                    />
                    <span className={`text-[9px] font-black uppercase leading-tight tracking-widest ${isSelected ? "text-white" : "text-slate-500"}`}>
                      {item}
                    </span>
                    {isSelected && <CheckCircle2 className="shrink-0 text-blue-400 ml-auto" size={14} />}
                  </label>
                );
              })}
            </div>
          </section>

          <div className="space-y-4">
            {statusMsg && (
              <div className={`flex items-center gap-3 rounded-2xl border-2 p-5 text-[10px] font-black uppercase animate-in zoom-in-95 ${statusMsg.includes("Gagal") ? 'border-red-100 bg-red-50 text-red-600' : 'border-emerald-100 bg-emerald-50 text-emerald-700'}`}>
                {statusMsg.includes("Gagal") ? <AlertCircle size={18} /> : <CheckCircle2 size={18} />}
                {statusMsg}
              </div>
            )}

            <button 
              type="submit" 
              disabled={loading}
              className="flex w-full items-center justify-center gap-3 rounded-[2rem] bg-blue-600 py-6 text-xs font-black uppercase italic tracking-[0.2em] text-white shadow-xl shadow-blue-100 transition-all hover:bg-slate-900 disabled:opacity-50"
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
