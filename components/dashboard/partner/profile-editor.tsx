"use client";

import React, { useState, useEffect, useRef } from "react";
import { supabase } from "@/lib/supabase";
import { 
  Building2, Globe, MapPin, Save, ShieldCheck, 
  CheckCircle2, AlertCircle, FileText, ChevronDown, ArrowLeft,
  Link2, Loader2
} from "lucide-react";
import { 
  getAccommodationsByRole, // Menggunakan helper cerdas
  INDONESIA_CITIES,
  TRAINING_PARTNERS 
} from "@/lib/data-static";

interface ProfileEditorProps {
  partner: any;
  user: any; 
  onUpdate: () => void;
  onBack: () => void;
}

export default function ProfileEditor({ partner, user, onUpdate, onBack }: ProfileEditorProps) {
  const [loading, setLoading] = useState(false);
  const [announcement, setAnnouncement] = useState("");
  const [isCustomName, setIsCustomName] = useState(false);
  
  const manualNameRef = useRef<HTMLInputElement>(null);

  // Mendapatkan list akomodasi khusus role partner
  const partnerAccommodations = getAccommodationsByRole('partner');

  const [formData, setFormData] = useState({
    name: partner?.name || "",
    description: partner?.description || "",
    website: partner?.website || "",
    location: partner?.location || "",
    nib_number: partner?.nib_number || "",
    manual_name: "",
    master_accommodations_provided: partner?.master_accommodations_provided || [],
    verification_document_link: partner?.verification_document_link || ""
  });

  useEffect(() => {
    if (formData.name && !TRAINING_PARTNERS.includes(formData.name)) {
      setIsCustomName(true);
      setFormData(prev => ({ ...prev, manual_name: partner.name, name: "LAINNYA" }));
    }
  }, [partner.name, formData.name]);

  // AKSI 1: SIMPAN PROFIL
  async function handleSaveProfile() {
    const finalName = formData.name === "LAINNYA" ? formData.manual_name : formData.name;
    if (!finalName) {
      setAnnouncement("Kesalahan: Nama lembaga harus diisi.");
      return;
    }

    setLoading(true);
    setAnnouncement("Sedang menyimpan perubahan profil mitra...");
    
    try {
      if (formData.name === "LAINNYA" && formData.manual_name) {
        await supabase.from("manual_input_logs").upsert([{
          field_name: "partner_name_manual",
          input_value: formData.manual_name
        }], { onConflict: 'input_value' });
      }

      const { error } = await supabase
        .from("partners")
        .upsert({
          id: user.id,
          name: finalName,
          description: formData.description,
          website: formData.website,
          location: formData.location,
          nib_number: formData.nib_number,
          master_accommodations_provided: formData.master_accommodations_provided,
          // Link tetap disimpan namun inputnya disembunyikan di UI jika sudah verified
          verification_document_link: formData.verification_document_link,
          updated_at: new Date().toISOString()
        }, { onConflict: 'id' });

      if (error) throw error;

      setAnnouncement("Sukses: Profil Berhasil Diperbarui!");
      setTimeout(() => onUpdate(), 1500);
    } catch (err: any) {
      setAnnouncement(`Gagal: ${err.message}`);
    } finally {
      setLoading(false);
    }
  }

  // AKSI 2: AJUKAN VERIFIKASI
  async function handleRequestVerification() {
    if (!formData.verification_document_link || !formData.verification_document_link.trim()) {
      setAnnouncement("Kesalahan: Harap isi link Google Drive dokumen legalitas.");
      return;
    }

    if (!formData.verification_document_link.includes("drive.google.com")) {
      setAnnouncement("Kesalahan: Link dokumen harus berasal dari Google Drive.");
      return;
    }

    setLoading(true);
    setAnnouncement("Sedang mengirimkan permohonan verifikasi ke Admin...");

    try {
      const { error } = await supabase
        .from("verification_requests")
        .upsert({
          target_id: user.id,
          target_type: 'partner',
          document_url: formData.verification_document_link,
          status: 'pending'
        }, { onConflict: 'target_id' });

      if (error) throw error;

      setAnnouncement("Sukses: Permohonan verifikasi berhasil dikirim.");
      setTimeout(() => onUpdate(), 2000);
    } catch (err: any) {
      setAnnouncement(`Gagal: ${err.message}`);
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
    <div className="mx-auto max-w-6xl space-y-10 pb-20 duration-500 animate-in fade-in">
      <div className="sr-only" aria-live="assertive" role="status">{announcement}</div>

      {/* HEADER NAV */}
      <div className="mb-10 flex flex-col justify-between gap-6 border-b-4 border-slate-900 pb-8 md:flex-row md:items-center">
        <button onClick={onBack} className="flex size-fit items-center gap-2 rounded-xl border-2 border-slate-200 px-4 py-2 text-[10px] font-black uppercase tracking-widest text-slate-400 transition-all hover:border-slate-900 hover:text-slate-900">
          <ArrowLeft size={16} /> Batal & Kembali
        </button>
        <div className="text-left md:text-right">
          <h2 className="text-3xl font-black uppercase italic leading-none tracking-tighter text-slate-900">Profil Institusi Mitra</h2>
          <p className="mt-2 text-[10px] font-bold uppercase tracking-widest text-blue-600">Manajemen Kredensial & Fasilitas Pelatihan Inklusif</p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-12 lg:grid-cols-3">
        <div className="space-y-10 lg:col-span-2">
          
          {/* SEKSI 0: VERIFIKASI - OTOMATIS HILANG JIKA SUDAH VERIFIED */}
          {!partner?.is_verified && (
            <section className="rounded-[3rem] border-4 border-dashed border-blue-600 bg-blue-50 p-10 shadow-xl">
              <div className="mb-6 flex items-center gap-4">
                <div className="rounded-2xl bg-blue-600 p-3 text-white shadow-lg"><Link2 size={24} /></div>
                <div>
                  <h3 className="text-xl font-black uppercase italic tracking-tighter text-blue-900">Validasi Kemitraan Resmi</h3>
                  <p className="text-[10px] font-bold uppercase tracking-widest text-blue-500">Cantunkan tautan surat permohonan kerjasama resmi dari lembaga Anda (format PDF) yang diunggah ke Google Drive</p>
                </div>
              </div>
              
              <div className="space-y-4">
                <label htmlFor="part-verify-link" className="ml-2 text-[10px] font-black uppercase text-blue-900">Link Google Drive Dokumen Resmi</label>
                <input 
                  id="part-verify-link"
                  type="url"
                  placeholder="https://drive.google.com/..."
                  value={formData.verification_document_link}
                  onChange={e => setFormData({...formData, verification_document_link: e.target.value})}
                  className="w-full rounded-2xl border-2 border-blue-200 bg-white p-5 font-bold text-blue-900 shadow-inner outline-none focus:border-blue-600"
                />
                <div className="flex items-start gap-3 rounded-2xl border border-blue-100 bg-white/50 p-4">
                  <AlertCircle size={16} className="mt-1 shrink-0 text-blue-600" />
                  <p className="text-[10px] font-bold italic leading-relaxed text-blue-800">
                    Pastikan akses file Google Drive diatur ke <strong>&quot;Anyone with the link / Siapa saja yang memiliki link&quot;</strong>.
                  </p>
                </div>
              </div>
            </section>
          )}

          {/* IDENTITAS UTAMA */}
          <section className="space-y-8 rounded-[3rem] border-4 border-slate-900 bg-white p-10 shadow-[12px_12px_0px_0px_rgba(15,23,42,1)]">
            <h3 className="flex items-center gap-2 text-xs font-black uppercase italic tracking-widest text-blue-600">
              <Building2 size={20} /> Kredensial Resmi Lembaga
            </h3>
            
            <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
              <div className="space-y-3 md:col-span-2">
                <label id="inst-name-label" htmlFor="inst-name" className="ml-1 text-[10px] font-black uppercase text-slate-400">Nama Lembaga Pelatihan</label>
                {!isCustomName ? (
                  <div className="relative">
                    <select 
                      id="inst-name"
                      required
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

              <div className="space-y-3 md:col-span-2">
                <label htmlFor="inst-website" className="ml-1 text-[10px] font-black uppercase text-slate-400">Website Resmi Institusi</label>
                <div className="relative">
                   <Globe className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
                   <input 
                    id="inst-website"
                    type="url"
                    className="w-full rounded-2xl border-2 border-slate-100 bg-slate-50 p-4 font-bold outline-none focus:border-slate-900 focus:bg-white"
                    placeholder="https://..."
                    value={formData.website}
                    onChange={(e) => setFormData({...formData, website: e.target.value})}
                  />
                </div>
              </div>

              <div className="space-y-3">
                <label htmlFor="inst-loc" className="ml-1 text-[10px] font-black uppercase text-slate-400">Domisili Kota (Pusat)</label>
                <div className="relative">
                  <select 
                    id="inst-loc"
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

              <div className="space-y-3 md:col-span-2">
                <label htmlFor="inst-desc" className="ml-1 text-[10px] font-black uppercase text-slate-400">Visi & Deskripsi Singkat</label>
                <textarea 
                  id="inst-desc"
                  rows={4}
                  className="w-full rounded-3xl border-2 border-slate-100 bg-slate-50 p-6 font-medium leading-relaxed outline-none focus:border-slate-900 focus:bg-white"
                  placeholder="Ceritakan visi inklusi institusi Anda..."
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                />
              </div>
            </div>
          </section>
        </div>

        {/* KOLOM KANAN: AKOMODASI & AKSI */}
        <div className="space-y-8">
          <fieldset className="rounded-[2.5rem] border-4 border-slate-900 bg-slate-900 p-8 text-left text-white shadow-2xl">
            <legend className="sr-only">Akomodasi Aksesibilitas</legend>
            <h3 className="mb-6 flex items-center gap-2 text-[11px] font-black uppercase italic tracking-widest text-blue-400">
              <ShieldCheck size={18} /> Fasilitas Pelatihan Inklusif
            </h3>
            <div className="no-scrollbar max-h-[400px] space-y-3 overflow-y-auto pr-2">
              {partnerAccommodations.map((item, idx) => {
                const isSelected = formData.master_accommodations_provided.includes(item);
                return (
                  <label key={item} className={`flex cursor-pointer items-start gap-3 rounded-xl border-2 p-4 transition-all focus-within:ring-4 focus-within:ring-blue-500/30 ${isSelected ? "border-blue-500 bg-blue-600/20" : "border-slate-800 bg-slate-800/50 hover:border-slate-700"}`}>
                    <input
                      type="checkbox"
                      className="mt-1 size-5 rounded border-gray-700 bg-slate-800 text-blue-600 accent-blue-500"
                      checked={isSelected}
                      onChange={() => toggleAccommodation(item)}
                    />
                    <span className={`text-[9px] font-black uppercase leading-tight tracking-widest ${isSelected ? "text-white" : "text-slate-500"}`}>
                      {item}
                    </span>
                    {isSelected && <CheckCircle2 className="ml-auto shrink-0 text-blue-400" size={14} />}
                  </label>
                );
              })}
            </div>
          </fieldset>

          {/* AREA NOTIFIKASI & TOMBOL */}
          <div className="space-y-6 rounded-[2.5rem] border-4 border-slate-900 bg-white p-8 shadow-lg">
            
            {announcement && (
              <div className={`flex items-center gap-3 rounded-2xl border-2 p-5 text-[10px] font-black uppercase tracking-widest animate-in zoom-in-95
                ${announcement.includes("Sukses") ? "border-emerald-500 bg-emerald-50 text-emerald-700" : 
                  announcement.includes("Sedang") ? "border-blue-500 bg-blue-50 text-blue-700" : 
                  "border-amber-500 bg-amber-50 text-amber-700"}`}>
                {announcement.includes("Sukses") ? <CheckCircle2 size={18} /> : <AlertCircle size={18} />}
                {announcement}
              </div>
            )}

            <div className="flex flex-col gap-4">
              {/* TOMBOL 1: SIMPAN KE TABLE */}
              <button 
                type="button"
                onClick={handleSaveProfile}
                disabled={loading}
                className="flex w-full items-center justify-center gap-3 rounded-3xl border-4 border-slate-900 bg-white py-5 text-[11px] font-black uppercase italic text-slate-900 transition-all hover:bg-slate-50 disabled:opacity-50"
              >
                {loading && !announcement.includes("verifikasi") ? <Loader2 className="animate-spin" size={18} /> : <Save size={18} />}
                Simpan Profil
              </button>

              {/* TOMBOL 2: AJUKAN VERIFIKASI - HILANG JIKA SUDAH VERIFIED */}
              {!partner?.is_verified && (
                <button 
                  type="button"
                  onClick={handleRequestVerification}
                  disabled={loading}
                  className="flex w-full items-center justify-center gap-3 rounded-3xl bg-blue-600 py-5 text-[11px] font-black uppercase italic text-white shadow-[6px_6px_0px_0px_rgba(15,23,42,1)] transition-all hover:bg-blue-700 active:scale-95 disabled:opacity-50"
                >
                  {loading && announcement.includes("verifikasi") ? <Loader2 className="animate-spin" size={18} /> : <ShieldCheck size={18} />}
                  Ajukan Verifikasi
                </button>
              )}
            </div>
            
            <p className="text-[8px] font-black uppercase italic text-slate-400">
              * Verifikasi kemitraan resmi diperlukan untuk mempublikasikan program pelatihan Anda secara nasional.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}