"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { supabase } from "@/lib/supabase";
import { GOV_INSTANSI_CATEGORIES } from "@/lib/data-static";
import { PROVINCE_LIST, PROVINCE_MAP } from "@/lib/constants/locations";
import { 
  Building2, MapPin, Search, Save, 
  Loader2, Globe, MessageSquare, 
  CheckCircle2, AlertCircle, ShieldCheck, Link2, ChevronDown
} from "lucide-react";

interface GovProfileEditorProps {
  user: any;
  company?: any; // Menggunakan prop company untuk konsistensi pengecekan is_verified
  onSaveSuccess?: () => void;
}

export default function GovProfileEditor({ user, company, onSaveSuccess }: GovProfileEditorProps) {
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [announcement, setAnnouncement] = useState("");
  
  const [searchQuery, setSearchQuery] = useState("");
  const [regionResults, setRegionResults] = useState<any[]>([]);
  const searchRef = useRef<HTMLDivElement>(null);

  const [formData, setFormData] = useState({
    name: "",
    category: "ULD Ketenagakerjaan Kota/Kabupaten",
    description: "",
    location: "",
    whatsapp_official: "",
    official_seal_url: "",
    email: user?.email || "",
    verification_document_link: ""
  });

  const isNasional = formData.category.includes("Kementerian") || formData.category.includes("Lembaga");

  const fetchProfile = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from("government")
        .select("*")
        .eq("id", user.id)
        .single();
      
      if (data) {
        setFormData(prev => ({ ...prev, ...data }));
      }
    } catch (err) {
      console.error("Error fetching profile:", err);
    } finally {
      setFetching(false);
    }
  }, [user.id]);

  useEffect(() => {
    fetchProfile();
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setRegionResults([]);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [fetchProfile]);

  const handleSearchRegion = (query: string) => {
    setSearchQuery(query);
    if (query.length < 2) {
      setRegionResults([]);
      return;
    }

    const isProvCategory = formData.category.includes("Provinsi");
    let filtered: any[] = [];

    if (isProvCategory) {
      filtered = PROVINCE_LIST
        .filter(p => p.toLowerCase().includes(query.toLowerCase()))
        .map(p => ({ name: p, type: 'PROVINSI' }));
    } else {
      const allCities = Object.values(PROVINCE_MAP).flat();
      filtered = Array.from(new Set(allCities))
        .filter(c => c.toLowerCase().includes(query.toLowerCase()))
        .map(c => ({ name: c, type: 'KOTA/KAB' }));
    }

    setRegionResults(filtered.slice(0, 6));
  };

  // AKSI 1: SIMPAN PROFIL
  const handleSaveProfile = async () => {
    if (!isNasional && !formData.location) {
      setAnnouncement("Kesalahan: Harap tentukan wilayah otoritas terlebih dahulu.");
      return;
    }

    setLoading(true);
    setAnnouncement("Sedang menyimpan profil otoritas...");
    
    try {
      const { error } = await supabase
        .from("government")
        .upsert({
          id: user.id,
          ...formData,
          updated_at: new Date().toISOString()
        }, { onConflict: 'id' });

      if (error) throw error;
      
      setAnnouncement("Sukses: Profil Otoritas Berhasil Diperbarui.");
      if (onSaveSuccess) onSaveSuccess();
      
    } catch (err: any) {
      setAnnouncement(`Gagal: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  // AKSI 2: AJUKAN VERIFIKASI
  const handleRequestVerification = async () => {
    if (!formData.verification_document_link || !formData.verification_document_link.trim()) {
      setAnnouncement("Kesalahan: Dokumen verifikasi kosong. Harap isi link Google Drive terlebih dahulu.");
      return;
    }

    if (!formData.verification_document_link.includes("drive.google.com")) {
      setAnnouncement("Kesalahan: Link dokumen tidak valid. Gunakan link Google Drive resmi.");
      return;
    }

    setLoading(true);
    setAnnouncement("Mengirimkan permohonan verifikasi ke Admin...");

    try {
      const { error } = await supabase
        .from("verification_requests")
        .upsert({
          target_id: user.id,
          target_type: 'government',
          document_url: formData.verification_document_link,
          status: 'pending'
        }, { onConflict: 'target_id' });

      if (error) throw error;
      
      setAnnouncement("Sukses: Permohonan verifikasi berhasil dikirim.");
      if (onSaveSuccess) setTimeout(() => onSaveSuccess(), 2000);
    } catch (err: any) {
      setAnnouncement(`Gagal: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  if (fetching) return (
    <div className="flex h-64 flex-col items-center justify-center gap-4" role="status" aria-label="Memuat data">
      <Loader2 className="animate-spin text-blue-600" size={40} />
      <p className="font-black uppercase italic tracking-widest text-slate-400">Sinkronisasi Data Otoritas...</p>
    </div>
  );

  return (
    <div className="mx-auto max-w-4xl space-y-10 pb-20 text-left animate-in fade-in duration-500">
      
      <div className="sr-only" aria-live="assertive" role="status">{announcement}</div>

      <div className="grid gap-10">
        
        {/* SEKSI 0: VERIFIKASI DOKUMEN */}
        {!company?.is_verified && (
          <section className="rounded-[3rem] border-4 border-dashed border-blue-600 bg-blue-50 p-10 shadow-xl" aria-labelledby="section-verif">
            <div className="mb-6 flex items-center gap-4">
              <div className="rounded-2xl bg-blue-600 p-3 text-white shadow-lg"><Link2 size={24} aria-hidden="true" /></div>
              <div>
                <h2 id="section-verif" className="text-xl font-black uppercase italic tracking-tighter text-blue-900">Validasi Otoritas Resmi</h2>
                <p className="text-[10px] font-bold uppercase tracking-widest text-blue-500">Sertakan tautan PDF Surat Pengajuan kerjasama dari instansi (Google Drive)</p>
              </div>
            </div>
            
            <div className="space-y-4">
              <label htmlFor="gov-verify-link" className="ml-2 text-[10px] font-black uppercase text-blue-900">Link Google Drive Dokumen Resmi</label>
              <input 
                id="gov-verify-link"
                type="url"
                placeholder="https://drive.google.com/..."
                value={formData.verification_document_link}
                onChange={e => setFormData({...formData, verification_document_link: e.target.value})}
                className="w-full rounded-2xl border-2 border-blue-200 p-5 font-bold outline-none focus:border-blue-600 shadow-inner bg-white text-blue-900"
              />
              <div className="flex items-start gap-3 rounded-2xl bg-white/50 p-4 border border-blue-100">
                <AlertCircle size={16} className="text-blue-600 mt-1 shrink-0" aria-hidden="true" />
                <p className="text-[10px] font-bold leading-relaxed text-blue-800 italic">
                  Pastikan akses Google Drive diatur ke <strong>&quot;Anyone with the link / Siapa saja yang memiliki link&quot;</strong>.
                </p>
              </div>
            </div>
          </section>
        )}

        {/* SECTION 1: PENETAPAN OTORITAS */}
        <section className="rounded-[2.5rem] border-4 border-slate-900 bg-white p-8 shadow-[12px_12px_0px_0px_rgba(15,23,42,1)]" aria-labelledby="section-otoritas">
          <div className="mb-8 flex items-center gap-4 border-b-2 border-slate-100 pb-4">
            <MapPin className="text-blue-600" size={28} aria-hidden="true" />
            <div>
              <h2 id="section-otoritas" className="text-xl font-black uppercase italic tracking-tight">Cakupan Wilayah Kerja</h2>
              <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Identitas administratif instansi pemerintah</p>
            </div>
          </div>

          <div className="grid gap-8 md:grid-cols-2">
            <div className="space-y-2">
              <label htmlFor="category" className="ml-2 text-[10px] font-black uppercase tracking-widest text-slate-500">Level Otoritas</label>
              <select 
                id="category"
                value={formData.category}
                onChange={(e) => {
                  const val = e.target.value;
                  const isNowNasional = val.includes("Kementerian") || val.includes("Lembaga");
                  setFormData({ 
                    ...formData, 
                    category: val, 
                    location: isNowNasional ? "Nasional" : "",
                    name: isNowNasional ? "" : formData.name 
                  });
                  setSearchQuery("");
                }}
                className="w-full rounded-2xl border-4 border-slate-900 bg-slate-50 p-4 font-bold outline-none focus:ring-4 focus:ring-blue-100"
              >
                {GOV_INSTANSI_CATEGORIES.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>

            {isNasional ? (
              <div className="space-y-2">
                <label htmlFor="manual-name" className="ml-2 text-[10px] font-black uppercase tracking-widest text-slate-500">Nama Lengkap Instansi</label>
                <input 
                  id="manual-name"
                  type="text"
                  placeholder="Contoh: Kementerian Sosial RI"
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  className="w-full rounded-2xl border-4 border-slate-900 p-4 font-bold outline-none focus:ring-4 focus:ring-blue-100"
                />
              </div>
            ) : (
              <div className="relative space-y-2" ref={searchRef}>
                <label htmlFor="search-region" className="ml-2 text-[10px] font-black uppercase tracking-widest text-slate-500">Cari Wilayah Otoritas</label>
                <div className="relative">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} aria-hidden="true" />
                  <input 
                    id="search-region"
                    type="text"
                    role="combobox"
                    autoComplete="off"
                    aria-autocomplete="list"
                    aria-expanded={regionResults.length > 0}
                    aria-controls="region-results-list"
                    placeholder={formData.location || "Ketik min. 2 huruf..."}
                    value={searchQuery}
                    onChange={(e) => handleSearchRegion(e.target.value)}
                    className="w-full rounded-2xl border-4 border-slate-900 p-4 pl-12 font-bold outline-none focus:ring-4 focus:ring-blue-100"
                  />
                  <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-300" size={20} aria-hidden="true" />
                </div>

                {regionResults.length > 0 && (
                  <ul id="region-results-list" role="listbox" className="absolute z-50 mt-2 w-full overflow-hidden rounded-2xl border-4 border-slate-900 bg-white shadow-2xl">
                    {regionResults.map((region, idx) => (
                      <li 
                        key={idx}
                        role="option"
                        aria-selected={formData.location === region.name}
                        tabIndex={0}
                        onClick={() => {
                          setFormData({
                            ...formData,
                            location: region.name,
                            name: `${formData.category} ${region.name}`
                          });
                          setSearchQuery("");
                          setRegionResults([]);
                        }}
                        onKeyDown={(e) => { if(e.key === 'Enter') e.currentTarget.click(); }}
                        className="group flex cursor-pointer items-center justify-between p-4 hover:bg-slate-900 focus:bg-slate-900 focus:outline-none"
                      >
                        <span className="font-black uppercase italic group-hover:text-white group-focus:text-white">{region.name}</span>
                        <span className="text-[10px] font-bold text-slate-400 group-hover:text-blue-400">{region.type}</span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            )}
          </div>
        </section>

        {/* SECTION 2: ATRIBUT OPERASIONAL */}
        <section className="rounded-[2.5rem] border-4 border-slate-900 bg-white p-8 shadow-[12px_12px_0px_0px_rgba(15,23,42,1)]" aria-labelledby="section-kontak">
          <div className="mb-8 flex items-center gap-4 border-b-2 border-slate-100 pb-4">
            <Globe className="text-emerald-600" size={28} aria-hidden="true" />
            <h2 id="section-kontak" className="text-xl font-black uppercase italic tracking-tight">Atribut Operasional</h2>
          </div>

          <div className="grid gap-8 md:grid-cols-2">
            <div className="space-y-2">
              <label htmlFor="wa" className="ml-2 text-[10px] font-black uppercase tracking-widest text-slate-500">WhatsApp Official</label>
              <div className="relative">
                <MessageSquare className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} aria-hidden="true" />
                <input 
                  id="wa"
                  type="text" 
                  value={formData.whatsapp_official || ""} 
                  onChange={e => setFormData({...formData, whatsapp_official: e.target.value})}
                  placeholder="628123..."
                  className="w-full rounded-2xl border-4 border-slate-900 p-4 pl-12 font-bold outline-none focus:ring-4 focus:ring-emerald-50" 
                />
              </div>
            </div>
            <div className="space-y-2">
              <label htmlFor="seal" className="ml-2 text-[10px] font-black uppercase tracking-widest text-slate-500">URL Logo/Stempel Resmi</label>
              <input 
                id="seal"
                type="url" 
                value={formData.official_seal_url || ""} 
                onChange={e => setFormData({...formData, official_seal_url: e.target.value})}
                placeholder="https://..."
                className="w-full rounded-2xl border-4 border-slate-900 p-4 font-bold outline-none focus:ring-4 focus:ring-emerald-50" 
              />
            </div>
          </div>

          <div className="mt-8 space-y-2">
            <label htmlFor="desc" className="ml-2 text-[10px] font-black uppercase tracking-widest text-slate-500">Deskripsi Instansi</label>
            <textarea 
              id="desc"
              value={formData.description || ""} 
              onChange={e => setFormData({...formData, description: e.target.value})}
              rows={4}
              className="w-full rounded-2xl border-4 border-slate-900 p-4 font-bold outline-none focus:ring-4 focus:ring-emerald-50"
              placeholder="Visi misi inklusi instansi..."
            />
          </div>
        </section>

        {/* FOOTER: STATUS INLINE & TOMBOL AKSI */}
        <div className="space-y-6 border-t border-slate-100 pt-10">
          {announcement && (
            <div className={`flex items-center gap-3 rounded-2xl border-4 p-5 text-[10px] font-black uppercase italic tracking-widest border-slate-900 shadow-[4px_4px_0px_0px_rgba(15,23,42,1)]
              ${announcement.includes("Sukses") ? "bg-emerald-400 text-slate-900" : 
                announcement.includes("Sedang") ? "bg-blue-400 text-white" : 
                "bg-rose-400 text-white"}`}>
              {announcement.includes("Sukses") ? <CheckCircle2 size={18} /> : <AlertCircle size={18} />}
              {announcement}
            </div>
          )}

          <div className="flex flex-col items-center justify-between gap-6 md:flex-row">
            <div className="flex flex-wrap gap-4">
              <button 
                type="button"
                onClick={handleSaveProfile}
                disabled={loading} 
                className="flex items-center gap-4 rounded-3xl border-4 border-slate-900 bg-white px-10 py-5 text-[11px] font-black uppercase tracking-widest text-slate-900 transition-all hover:bg-slate-50 disabled:opacity-50"
              >
                {loading && !announcement.includes("verifikasi") ? <Loader2 className="animate-spin" size={20} /> : <Save size={20} />}
                Simpan Profil Otoritas
              </button>

              {!company?.is_verified && (
                <button 
                  type="button"
                  onClick={handleRequestVerification}
                  disabled={loading} 
                  className="flex items-center gap-4 rounded-3xl bg-blue-600 px-10 py-5 text-[11px] font-black uppercase tracking-widest text-white shadow-[6px_6px_0px_0px_rgba(15,23,42,1)] transition-all hover:bg-blue-700 active:scale-95 disabled:opacity-50"
                >
                  {loading && announcement.includes("verifikasi") ? <Loader2 className="animate-spin" size={20} /> : <ShieldCheck size={20} />}
                  Ajukan Verifikasi
                </button>
              )}
            </div>

            <p className="max-w-xs text-right text-[9px] font-black uppercase italic text-slate-400">
              * Otoritas OMP (Official Mission Partner) membutuhkan validasi administratif manual oleh Admin Nasional.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}