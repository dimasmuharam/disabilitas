"use client";

import React, { useState, useMemo, useRef, useEffect } from "react";
import { 
  Save, Building2, Globe, Users, 
  Accessibility, FileBadge, 
  MapPin, FileText, ChevronDown, CheckCircle2,
  AlertCircle, Link2, Loader2, ShieldCheck
} from "lucide-react";
import { supabase } from "@/lib/supabase"; 
import { 
  INDONESIA_CITIES, 
  ACCOMMODATION_TYPES, 
  INDUSTRY_CATEGORIES, 
  COMPANY_SIZE_CATEGORIES, 
  EMPLOYER_CATEGORIES,
  GOVERNMENT_AGENCIES_LIST,
  STATE_ENTERPRISES_LIST,
  PRIVATE_COMPANIES_LIST,
  NONPROFIT_ORG_LIST
} from "@/lib/data-static";

export default function ProfileEditor({ company, user, onSuccess }: { company: any, user: any, onSuccess: () => void }) {
  const [loading, setLoading] = useState(false);
  const [announcement, setAnnouncement] = useState("");
  
  const [searchTerm, setSearchTerm] = useState("");
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const [formData, setFormData] = useState({
    name: company?.name || "",
    website: company?.website || "",
    industry: company?.industry || "",
    category: company?.category || EMPLOYER_CATEGORIES[0],
    size: company?.size || "",
    nib_number: company?.nib_number || "",
    description: company?.description || "",
    location: company?.location || "",
    total_employees: company?.total_employees || 0,
    total_employees_with_disability: company?.total_employees_with_disability || 0,
    master_accommodations_provided: (company?.master_accommodations_provided as string[]) || [],
    verification_document_link: company?.verification_document_link || ""
  });

  const filteredList = useMemo(() => {
    let list: string[] = [];
    if (formData.category === "Instansi Pemerintah (ASN)") list = GOVERNMENT_AGENCIES_LIST;
    else if (formData.category === "BUMN dan BUMD") list = STATE_ENTERPRISES_LIST;
    else if (formData.category === "Perusahaan Swasta") list = PRIVATE_COMPANIES_LIST;
    else if (formData.category === "Lembaga Nonprofit") list = NONPROFIT_ORG_LIST;
    
    if (!searchTerm) return list;
    return list.filter(item => item.toLowerCase().includes(searchTerm.toLowerCase()));
  }, [formData.category, searchTerm]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // AKSI 1: SIMPAN PROFIL (Aksesibel, No Pop-up)
  const handleSaveProfile = async () => {
    if (!formData.name) {
      setAnnouncement("Kesalahan: Nama instansi harus diisi.");
      return;
    }
    
    setLoading(true);
    setAnnouncement("Sedang menyimpan perubahan profil...");

    try {
      const { error } = await supabase
        .from("companies")
        .upsert({
          id: user.id,
          ...formData,
          updated_at: new Date().toISOString()
        }, { onConflict: 'id' });

      if (error) throw error;
      setAnnouncement("Sukses: Profil berhasil diperbarui.");
    } catch (error: any) {
      setAnnouncement(`Gagal menyimpan profil: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  // AKSI 2: AJUKAN VERIFIKASI (Aksesibel, No Pop-up)
  const handleRequestVerification = async () => {
    if (!formData.verification_document_link.includes("drive.google.com")) {
      setAnnouncement("Kesalahan: Harap masukkan link Google Drive yang valid.");
      return;
    }

    setLoading(true);
    setAnnouncement("Sedang mengirimkan permohonan verifikasi ke Admin...");

    try {
      const { error } = await supabase
        .from("verification_requests")
        .upsert({
          target_id: user.id,
          target_type: 'company',
          document_url: formData.verification_document_link,
          status: 'pending'
        }, { onConflict: 'target_id' });

      if (error) throw error;
      
      setAnnouncement("Sukses: Permohonan verifikasi berhasil dikirim.");
      setTimeout(() => onSuccess(), 2000); 
    } catch (error: any) {
      setAnnouncement(`Gagal mengirim verifikasi: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleFeature = (feature: string) => {
    setFormData(prev => ({
      ...prev,
      master_accommodations_provided: prev.master_accommodations_provided.includes(feature)
        ? prev.master_accommodations_provided.filter((f: string) => f !== feature)
        : [...prev.master_accommodations_provided, feature]
    }));
  };

  return (
    <div className="mx-auto max-w-6xl pb-20 text-left animate-in fade-in duration-500">
      {/* Live Region Aksesibilitas untuk Screen Reader */}
      <div className="sr-only" aria-live="assertive" role="status">{announcement}</div>

      <div className="space-y-10">
        
        {/* SEKSI 0: VERIFIKASI */}
        {!company?.is_verified && (
          <section className="rounded-[3rem] border-4 border-dashed border-blue-600 bg-blue-50 p-10 shadow-xl">
            <div className="mb-6 flex items-center gap-4">
              <div className="rounded-2xl bg-blue-600 p-3 text-white shadow-lg"><Link2 size={24} /></div>
              <div>
                <h2 className="text-xl font-black uppercase italic tracking-tighter text-blue-900">Validasi Akses Dashboard</h2>
                <p className="text-[10px] font-bold uppercase tracking-widest text-blue-500">Sertakan link PDF Surat Pengajuan Kerjasama (Google Drive)</p>
              </div>
            </div>
            
            <div className="space-y-4">
              <label htmlFor="comp-verify-link" className="ml-2 text-[10px] font-black uppercase text-blue-900">Link Google Drive Dokumen Resmi</label>
              <input 
                id="comp-verify-link"
                type="url"
                placeholder="https://drive.google.com/..."
                value={formData.verification_document_link}
                onChange={e => setFormData({...formData, verification_document_link: e.target.value})}
                className="w-full rounded-2xl border-2 border-blue-200 p-5 font-bold outline-none focus:border-blue-600 shadow-inner bg-white text-blue-900"
              />
              <div className="flex items-start gap-3 rounded-2xl bg-white/50 p-4 border border-blue-100">
                <AlertCircle size={16} className="text-blue-600 mt-1 shrink-0" />
                <p className="text-[10px] font-bold leading-relaxed text-blue-800 italic">
                  Pastikan akses Google Drive diatur ke <strong>&quot;Anyone with the link / Siapa saja yang memiliki link&quot;</strong>.
                </p>
              </div>
            </div>
          </section>
        )}

        {/* SEKSI 1: IDENTITAS RESMI */}
        <section className="space-y-10 rounded-[3rem] border-2 border-slate-900 bg-white p-10 shadow-[8px_8px_0px_0px_rgba(15,23,42,1)]">
          <div className="flex items-center gap-4 border-b pb-8">
            <div className="rounded-2xl bg-slate-900 p-3 text-white"><Building2 size={24} /></div>
            <div>
              <h2 className="text-xl font-black uppercase italic tracking-tighter text-slate-900">Informasi Resmi Instansi</h2>
              <p className="text-[9px] font-bold uppercase tracking-widest text-slate-400">Pusat Sinkronisasi Data Master Instansi</p>
            </div>
          </div>

          <div className="grid gap-10 md:grid-cols-2">
            <div className="space-y-6">
              <div className="space-y-2">
                <label htmlFor="comp-cat" className="ml-2 text-[10px] font-black uppercase text-slate-400">Kategori Pemberi Kerja</label>
                <select 
                  id="comp-cat" 
                  value={formData.category} 
                  onChange={e => {
                    setFormData({...formData, category: e.target.value, name: ""});
                    setSearchTerm("");
                  }} 
                  className="w-full rounded-2xl border-2 border-slate-100 bg-white p-4 font-bold outline-none focus:border-blue-600"
                >
                  {EMPLOYER_CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>

              <div className="relative space-y-2" ref={dropdownRef}>
                <label htmlFor="comp-name-search" className="ml-2 text-[10px] font-black uppercase text-slate-400">Nama Resmi (Sesuai SK/NIB)</label>
                <div className="relative">
                  <input 
                    id="comp-name-search"
                    autoComplete="off"
                    placeholder={formData.name || "Ketik nama untuk mencari..."}
                    value={searchTerm}
                    onFocus={() => setIsDropdownOpen(true)}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full rounded-2xl border-2 border-slate-100 p-4 font-bold outline-none focus:border-blue-600"
                  />
                  <ChevronDown className="absolute right-4 top-4 text-slate-300" size={20} />
                </div>

                {isDropdownOpen && (
                  <div className="absolute z-50 mt-1 max-h-60 w-full overflow-y-auto rounded-2xl border-2 border-slate-900 bg-white p-2 shadow-2xl">
                    {filteredList.length > 0 ? filteredList.map((item) => (
                      <button
                        key={item}
                        type="button"
                        onClick={() => {
                          setFormData({...formData, name: item});
                          setSearchTerm("");
                          setIsDropdownOpen(false);
                        }}
                        className="w-full rounded-xl p-3 text-left text-[10px] font-black uppercase hover:bg-blue-50"
                      >
                        {item}
                      </button>
                    )) : (
                      <div className="p-4 text-center text-[10px] font-bold italic text-slate-400">Data tidak tersedia</div>
                    )}
                  </div>
                )}
                {formData.name && (
                  <p className="ml-2 mt-1 flex items-center gap-1 text-[9px] font-black uppercase text-emerald-600">
                    <CheckCircle2 size={12} /> {formData.name}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <label htmlFor="comp-nib" className="ml-2 flex items-center gap-2 text-[10px] font-black uppercase text-slate-400"><FileBadge size={12} /> NIB / Nomor Registrasi</label>
                <input id="comp-nib" placeholder="13 digit nomor..." value={formData.nib_number} onChange={e => setFormData({...formData, nib_number: e.target.value})} className="w-full rounded-2xl border-2 border-slate-100 p-4 font-black tracking-widest outline-none focus:border-blue-600" />
              </div>
            </div>

            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label htmlFor="comp-ind" className="ml-2 text-[10px] font-black uppercase text-slate-400">Sektor Industri</label>
                  <select id="comp-ind" value={formData.industry} onChange={e => setFormData({...formData, industry: e.target.value})} className="w-full rounded-2xl border-2 border-slate-100 bg-white p-4 font-bold outline-none focus:border-blue-600">
                    <option value="">Pilih Industri</option>
                    {INDUSTRY_CATEGORIES.map(i => <option key={i} value={i}>{i}</option>)}
                  </select>
                </div>
                <div className="space-y-2">
                  <label htmlFor="comp-size" className="ml-2 text-[10px] font-black uppercase text-slate-400">Skala Usaha</label>
                  <select id="comp-size" value={formData.size} onChange={e => setFormData({...formData, size: e.target.value})} className="w-full rounded-2xl border-2 border-slate-100 bg-white p-4 font-bold outline-none focus:border-blue-600">
                    <option value="">Pilih Skala</option>
                    {COMPANY_SIZE_CATEGORIES.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
              </div>

              <div className="space-y-2">
                <label htmlFor="comp-web" className="ml-2 flex items-center gap-2 text-[10px] font-black uppercase text-slate-400"><Globe size={12}/> Website Resmi</label>
                <input id="comp-web" type="url" placeholder="https://..." value={formData.website} onChange={e => setFormData({...formData, website: e.target.value})} className="w-full rounded-2xl border-2 border-slate-100 p-4 font-bold outline-none focus:border-blue-600" />
              </div>

              <div className="space-y-2">
                <label htmlFor="comp-loc" className="ml-2 flex items-center gap-2 text-[10px] font-black uppercase text-slate-400"><MapPin size={12}/> Lokasi Kantor Pusat</label>
                <select id="comp-loc" value={formData.location} onChange={e => setFormData({...formData, location: e.target.value})} className="w-full rounded-2xl border-2 border-slate-100 bg-white p-4 font-bold outline-none focus:border-blue-600">
                  <option value="">Pilih Kota</option>
                  {INDONESIA_CITIES.map(city => <option key={city} value={city}>{city}</option>)}
                </select>
              </div>
            </div>
          </div>
        </section>

        {/* SEKSI 2: DATA KARYAWAN & BIO */}
        <section className="space-y-12 rounded-[3rem] border-2 border-slate-100 bg-white p-10 shadow-sm">
          <div className="grid gap-10 md:grid-cols-2">
            <div className="space-y-6">
              <div className="flex items-center gap-3">
                <Users size={24} className="text-blue-600" />
                <h2 className="text-sm font-black uppercase tracking-tight text-slate-900">Statistik Karyawan (Data Riset)</h2>
              </div>
              <div className="grid grid-cols-1 gap-6 rounded-[2rem] border border-slate-100 bg-slate-50 p-8">
                <div className="space-y-2">
                  <label htmlFor="total-emp" className="text-[10px] font-black uppercase text-slate-400">Total Seluruh Pegawai</label>
                  <input id="total-emp" type="number" value={formData.total_employees} onChange={e => setFormData({...formData, total_employees: parseInt(e.target.value) || 0})} className="w-full rounded-2xl border-2 border-slate-200 p-4 text-xl font-black outline-none focus:border-blue-600" />
                </div>
                <div className="space-y-2">
                  <label htmlFor="dis-emp" className="text-[10px] font-black uppercase text-slate-400">Pegawai Disabilitas Saat Ini</label>
                  <input id="dis-emp" type="number" value={formData.total_employees_with_disability} onChange={e => setFormData({...formData, total_employees_with_disability: parseInt(e.target.value) || 0})} className="w-full rounded-2xl border-2 border-slate-200 p-4 text-xl font-black text-blue-600 outline-none focus:border-blue-600" />
                </div>
              </div>
            </div>

            <div className="space-y-6">
              <div className="flex items-center gap-3">
                <FileText size={24} className="text-blue-600" />
                <h2 className="text-sm font-black uppercase tracking-tight text-slate-900">Deskripsi & Budaya Kerja</h2>
              </div>
              <div className="space-y-2">
                <label htmlFor="comp-desc" className="ml-2 text-[10px] font-black uppercase text-slate-400">Tentang Instansi</label>
                <textarea id="comp-desc" rows={8} value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} className="w-full rounded-2xl border-2 border-slate-100 p-4 text-sm font-medium outline-none focus:border-blue-600 shadow-inner" placeholder="Jelaskan lingkungan dan budaya kerja inklusif di instansi Anda..." />
              </div>
            </div>
          </div>

          <div className="space-y-6 border-t pt-10">
            <div className="flex items-center gap-3">
              <Accessibility size={24} className="text-emerald-600" />
              <div>
                <h2 className="text-sm font-black uppercase italic tracking-tighter text-slate-900">Master Fasilitas Inklusi</h2>
                <p className="text-[9px] font-bold uppercase tracking-widest text-slate-400">Pilih fasilitas yang tersedia di kantor Anda</p>
              </div>
            </div>
            
            <fieldset>
              <legend className="sr-only">Akomodasi yang tersedia</legend>
              <div className="flex flex-wrap gap-3">
                {ACCOMMODATION_TYPES.map((acc) => {
                  const isChecked = formData.master_accommodations_provided.includes(acc);
                  return (
                    <label key={acc} className="cursor-pointer">
                      <input type="checkbox" className="sr-only" checked={isChecked} onChange={() => handleToggleFeature(acc)} />
                      <div className={`rounded-2xl border-2 px-6 py-3 text-[10px] font-black uppercase transition-all 
                        ${isChecked ? "border-emerald-600 bg-emerald-600 text-white shadow-md scale-105" : "border-slate-100 bg-slate-50 text-slate-400 hover:border-emerald-200"}
                      `}>
                        {acc}
                      </div>
                    </label>
                  );
                })}
              </div>
            </fieldset>
          </div>
        </section>

        {/* FOOTER: DUA TOMBOL AKSI + INLINE ANNOUNCEMENT */}
        <div className="space-y-6 border-t border-slate-100 pt-10">
          
          {/* Pesan Status Inline Berdasarkan Announcement */}
          {announcement && (
            <div className={`flex items-center gap-3 rounded-2xl border-2 p-4 text-[10px] font-black uppercase italic tracking-widest
              ${announcement.includes("Sukses") ? "border-emerald-500 bg-emerald-50 text-emerald-700" : 
                announcement.includes("Sedang") ? "border-blue-500 bg-blue-50 text-blue-700" : 
                "border-amber-500 bg-amber-50 text-amber-700"}`}>
              {announcement.includes("Sukses") ? <CheckCircle2 size={16} /> : <AlertCircle size={16} />}
              {announcement}
            </div>
          )}

          <div className="flex flex-col items-center justify-between gap-6 md:flex-row">
            <div className="flex flex-wrap gap-4">
              {/* TOMBOL 1: SIMPAN PROFIL */}
              <button 
                type="button"
                onClick={handleSaveProfile}
                disabled={loading} 
                className="flex items-center gap-3 rounded-3xl border-2 border-slate-900 bg-white px-10 py-5 text-[11px] font-black uppercase tracking-widest text-slate-900 transition-all hover:bg-slate-50 disabled:opacity-50"
              >
                {loading && !announcement.includes("verifikasi") ? <Loader2 className="animate-spin" size={18} /> : <Save size={18} />}
                Simpan Profil
              </button>

              {/* TOMBOL 2: AJUKAN VERIFIKASI */}
              {!company?.is_verified && (
                <button 
                  type="button"
                  onClick={handleRequestVerification}
                  disabled={loading} 
                  className="flex items-center gap-3 rounded-3xl bg-blue-600 px-10 py-5 text-[11px] font-black uppercase tracking-widest text-white shadow-xl transition-all hover:bg-blue-700 active:scale-95 disabled:opacity-50"
                >
                  {loading && announcement.includes("verifikasi") ? <Loader2 className="animate-spin" size={18} /> : <ShieldCheck size={18} />}
                  Ajukan Verifikasi
                </button>
              )}
            </div>

            <p className="text-[9px] font-bold uppercase italic text-slate-400 max-w-xs text-right">
              * Data statistik digunakan untuk riset nasional. Verifikasi dokumen diperlukan untuk otorisasi penuh.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}