"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { supabase } from "@/lib/supabase";
import { GOV_INSTANSI_CATEGORIES } from "@/lib/data-static";
import { PROVINCE_LIST, PROVINCE_MAP } from "@/lib/constants/locations";
import { 
  Building2, MapPin, Search, Save, 
  Loader2, Globe, MessageSquare, 
  CheckCircle2, AlertCircle
} from "lucide-react";

interface GovProfileEditorProps {
  user: any;
}

export default function GovProfileEditor({ user }: GovProfileEditorProps) {
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [message, setMessage] = useState<{ msg: string; type: 'success' | 'error' | null }>({ msg: "", type: null });
  
  // Search States
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
    email: user?.email || ""
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

  const notify = (msg: string, type: 'success' | 'error') => {
    setMessage({ msg, type });
    setTimeout(() => setMessage({ msg: "", type: null }), 5000);
  };

  // Logika Pencarian Statis (Tanpa Database Call)
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
      filtered = Array.from(new Set(allCities)) // Unique
        .filter(c => c.toLowerCase().includes(query.toLowerCase()))
        .map(c => ({ name: c, type: 'KOTA/KAB' }));
    }

    setRegionResults(filtered.slice(0, 6));
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isNasional && !formData.location) {
      return notify("Harap tentukan wilayah otoritas", "error");
    }

    setLoading(true);
    try {
      const { error } = await supabase
        .from("government")
        .upsert({
          id: user.id,
          ...formData,
          updated_at: new Date().toISOString()
        });

      if (error) throw error;
      notify("Profil Otoritas Berhasil Diperbarui", "success");
    } catch (err: any) {
      notify(err.message, "error");
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
    <div className="max-w-4xl space-y-10 pb-20">
      
      {/* NOTIFIKASI - ARIA LIVE UNTUK NVDA */}
      <div role="status" aria-live="polite">
        {message.msg && (
          <div className={`fixed bottom-10 right-10 z-[60] flex items-center gap-3 rounded-2xl border-4 border-slate-900 px-6 py-4 font-black uppercase italic shadow-[8px_8px_0px_0px_rgba(15,23,42,1)] ${message.type === 'success' ? 'bg-emerald-400' : 'bg-rose-400'}`}>
            {message.type === 'success' ? <CheckCircle2 size={20} /> : <AlertCircle size={20} />}
            <span>{message.msg}</span>
          </div>
        )}
      </div>

      <form onSubmit={handleSave} className="grid gap-10">
        
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
            {/* Kategori Level */}
            <div className="space-y-2">
              <label htmlFor="category" className="text-[10px] font-black uppercase tracking-widest text-slate-500">Level Otoritas</label>
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

            {/* Input Wilayah atau Nama Manual */}
            {isNasional ? (
              <div className="space-y-2">
                <label htmlFor="manual-name" className="text-[10px] font-black uppercase tracking-widest text-slate-500">Nama Lengkap Instansi (Manual)</label>
                <input 
                  id="manual-name"
                  type="text"
                  placeholder="Contoh: Kementerian Sosial RI"
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  className="w-full rounded-2xl border-4 border-slate-900 p-4 font-bold outline-none focus:ring-4 focus:ring-blue-100"
                  aria-required="true"
                />
              </div>
            ) : (
              <div className="relative space-y-2" ref={searchRef}>
                <label htmlFor="search-region" className="text-[10px] font-black uppercase tracking-widest text-slate-500">Cari Wilayah Otoritas</label>
                <div className="relative">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} aria-hidden="true" />
                  <input 
                    id="search-region"
                    type="text"
                    autoComplete="off"
                    aria-autocomplete="list"
                    aria-controls="region-results"
                    placeholder={formData.location || "Ketik min. 2 huruf..."}
                    value={searchQuery}
                    onChange={(e) => handleSearchRegion(e.target.value)}
                    className="w-full rounded-2xl border-4 border-slate-900 p-4 pl-12 font-bold outline-none focus:ring-4 focus:ring-blue-100"
                  />
                </div>

                {regionResults.length > 0 && (
                  <ul id="region-results" role="listbox" className="absolute z-50 mt-2 w-full overflow-hidden rounded-2xl border-4 border-slate-900 bg-white shadow-2xl transition-all">
                    {regionResults.map((region, idx) => (
                      <li 
                        key={idx}
                        role="option"
                        aria-selected="false"
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

          {!isNasional && (
            <div className="mt-8 rounded-2xl border-2 border-dashed border-blue-200 bg-blue-50 p-6" aria-live="polite">
              <p className="text-[10px] font-black uppercase italic text-blue-700 mb-1">Preview Identitas:</p>
              <p className="text-lg font-black uppercase text-slate-900">
                {formData.name || "Pilih wilayah untuk menjana nama instansi..."}
              </p>
            </div>
          )}
        </section>

        {/* SECTION 2: KONTAK */}
        <section className="rounded-[2.5rem] border-4 border-slate-900 bg-white p-8 shadow-[12px_12px_0px_0px_rgba(15,23,42,1)]" aria-labelledby="section-kontak">
          <div className="mb-8 flex items-center gap-4 border-b-2 border-slate-100 pb-4">
            <Globe className="text-emerald-600" size={28} aria-hidden="true" />
            <h2 id="section-kontak" className="text-xl font-black uppercase italic tracking-tight">Atribut Operasional</h2>
          </div>

          <div className="grid gap-8 md:grid-cols-2">
            <div className="space-y-2">
              <label htmlFor="wa" className="text-[10px] font-black uppercase tracking-widest text-slate-500">WhatsApp Official</label>
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
              <label htmlFor="seal" className="text-[10px] font-black uppercase tracking-widest text-slate-500">URL Logo/Stempel</label>
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
            <label htmlFor="desc" className="text-[10px] font-black uppercase tracking-widest text-slate-500">Deskripsi Instansi</label>
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

        <button 
          type="submit" 
          disabled={loading}
          className="group relative flex w-full items-center justify-center gap-4 rounded-[2rem] border-4 border-slate-900 bg-slate-900 py-6 text-xl font-black uppercase italic text-white shadow-[10px_10px_0px_0px_rgba(59,130,246,1)] transition-all hover:bg-blue-600 hover:shadow-none active:translate-x-1 active:translate-y-1 disabled:opacity-50"
          aria-label={loading ? "Sedang menyimpan..." : "Simpan Data Profil Otoritas"}
        >
          {loading ? <Loader2 className="animate-spin" /> : <Save size={24} />}
          <span>{loading ? "Menyimpan..." : "Simpan Profil Otoritas"}</span>
        </button>

      </form>
    </div>
  );
}