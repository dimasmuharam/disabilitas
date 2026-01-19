"use client";

import React, { useState, useEffect, useCallback } from "react";
import { supabase } from "@/lib/supabase";
import Image from "next/image";
import { 
  Building2, ShieldCheck, Search, Info, 
  Loader2, ShieldAlert, MapPin, Globe,
  BarChart3
} from "lucide-react";
import { PROVINCE_MAP } from "@/lib/constants/locations";

export default function GovPartnershipManager({ govData }: { govData: any }) {
  const [companies, setCompanies] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState<"all" | "verified" | "pending">("all");

  // Identifikasi Level Otoritas
  const isPusat = govData.category === "Kementerian" || govData.category === "Lembaga";
  const isProvinsi = govData.category.includes("Provinsi");
  const isKotaKab = !isPusat && !isProvinsi;

  const fetchLocalCompanies = useCallback(async () => {
    setLoading(true);
    try {
      let query = supabase.from("companies").select(`
        *,
        jobs(id)
      `);

      // LOGIKA CAKUPAN DATA (DATA SCOPE)
      if (isPusat) {
        // Pusat: Lihat Nasional (Tanpa Filter)
      } else if (isProvinsi) {
        // Provinsi: Lihat semua Kota di bawahnya
        const citiesInProvince = PROVINCE_MAP[govData.location] || [];
        query = query.in("location", citiesInProvince);
      } else {
        // Kota/Kab: Hanya lihat wilayah sendiri
        query = query.eq("location", govData.location);
      }

      const { data, error } = await query.order('name', { ascending: true });
      if (error) throw error;

      const formattedData = data?.map(company => ({
        ...company,
        active_jobs_count: company.jobs ? company.jobs.length : 0 
      })) || [];

      setCompanies(formattedData);
    } catch (err) {
      console.error("Fetch Error:", err);
    } finally {
      setLoading(false);
    }
  }, [govData, isPusat, isProvinsi]);

  useEffect(() => {
    fetchLocalCompanies();
  }, [fetchLocalCompanies]);

  const toggleVerification = async (companyId: string, currentStatus: boolean) => {
    // Keamanan Tambahan: Hanya Kota/Kab yang boleh eksekusi update
    if (!isKotaKab) return;

    const { error } = await supabase
      .from("companies")
      .update({ 
        is_verified: !currentStatus,
        uld_verified_at: !currentStatus ? new Date().toISOString() : null,
        uld_verified_by: govData.id
      })
      .eq("id", companyId);

    if (!error) {
      setCompanies(prev => prev.map(c => 
        c.id === companyId ? { ...c, is_verified: !currentStatus } : c
      ));
    }
  };

  const filteredCompanies = companies.filter(c => {
    const matchesSearch = c.name?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = 
      filterStatus === "all" ? true :
      filterStatus === "verified" ? c.is_verified === true :
      c.is_verified === false;
    
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-8 duration-700 animate-in fade-in">
      
      {/* 1. HEADER DYNAMIC SUMMARY */}
      <div className="rounded-[2.5rem] border-4 border-slate-900 bg-white p-8 shadow-[12px_12px_0px_0px_rgba(15,23,42,1)]">
        <div className="flex flex-col items-center justify-between gap-6 md:flex-row">
          <div className="flex items-center gap-4">
            <div className={`rounded-2xl p-4 text-white shadow-[4px_4px_0px_0px_rgba(15,23,42,1)] ${isPusat ? 'bg-indigo-500' : 'bg-emerald-500'}`}>
              {isPusat ? <Globe size={32} /> : <Building2 size={32} />}
            </div>
            <div>
              <h2 className="text-2xl font-black uppercase italic tracking-tight text-slate-900">
                {isPusat ? "Monitoring Kemitraan Nasional" : "Kemitraan Industri"}
              </h2>
              <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
                {isPusat ? "Lembaga Pusat" : `Otoritas Wilayah: ${govData.location}`}
              </p>
            </div>
          </div>
          
          <div className="flex gap-4 rounded-2xl border-2 border-slate-900 bg-slate-100 p-4">
             <div className="border-r-2 border-slate-300 px-4 text-center">
                <p className="text-[9px] font-black uppercase text-slate-500">Total Mitra</p>
                <p className="text-xl font-black">{companies.length}</p>
             </div>
             <div className="px-4 text-center">
                <p className="text-[9px] font-black uppercase text-emerald-500">Terverifikasi</p>
                <p className="text-xl font-black text-emerald-600">
                  {companies.filter(c => c.is_verified).length}
                </p>
             </div>
          </div>
        </div>
      </div>

      {/* 2. CONTROL BAR */}
      <div className="flex flex-col gap-4 md:flex-row">
        <div className="relative flex-1 group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-emerald-500" size={20} />
          <input 
            type="text" 
            placeholder="Cari nama perusahaan..." 
            className="w-full rounded-2xl border-4 border-slate-900 p-4 pl-12 font-bold outline-none transition-all focus:ring-4 focus:ring-emerald-100"
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="flex gap-2 p-1 bg-slate-200 rounded-2xl border-4 border-slate-900">
          {(['all', 'verified', 'pending'] as const).map((status) => (
            <button
              key={status}
              onClick={() => setFilterStatus(status)}
              className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase transition-all ${
                filterStatus === status 
                ? 'bg-slate-900 text-white shadow-lg' 
                : 'text-slate-500 hover:bg-slate-300'
              }`}
            >
              {status === 'all' ? 'Semua' : status === 'verified' ? 'Mitra ULD' : 'Belum Verif'}
            </button>
          ))}
        </div>
      </div>

      {/* 3. GRID PERUSAHAAN */}
      {loading ? (
        <div className="flex flex-col items-center justify-center p-20">
          <Loader2 className="animate-spin text-emerald-500" size={48} />
          <p className="mt-4 font-black uppercase italic text-slate-400">Sinkronisasi Data Industri...</p>
        </div>
      ) : filteredCompanies.length > 0 ? (
        <div className="grid gap-6 md:grid-cols-2">
          {filteredCompanies.map((company) => (
            <article key={company.id} className="group relative rounded-[2rem] border-4 border-slate-900 bg-white p-6 shadow-[8px_8px_0px_0px_rgba(15,23,42,1)] transition-all hover:translate-x-1 hover:translate-y-1 hover:shadow-none">
              
              {/* Badge Status & Lokasi (Untuk Pusat/Provinsi) */}
              <div className="absolute right-6 top-6 flex flex-col items-end gap-2">
                {company.is_verified ? (
                  <div className="flex items-center gap-1 rounded-full border-2 border-emerald-600 bg-emerald-100 px-3 py-1 text-[9px] font-black uppercase text-emerald-600">
                    <ShieldCheck size={12} /> Terverifikasi
                  </div>
                ) : (
                  <div className="flex items-center gap-1 rounded-full border-2 border-slate-200 bg-slate-100 px-3 py-1 text-[9px] font-black uppercase text-slate-400">
                    <ShieldAlert size={12} /> Pending
                  </div>
                )}
                {(isPusat || isProvinsi) && (
                  <div className="flex items-center gap-1 text-[8px] font-black uppercase text-slate-400 italic">
                    <MapPin size={10} /> {company.location}
                  </div>
                )}
              </div>

              <div className="flex gap-4">
                <div className="size-16 overflow-hidden rounded-xl border-2 border-slate-900 bg-slate-50 relative shrink-0">
                   <Image 
                     src={company.logo_url || '/placeholder-company.png'} 
                     alt="logo" fill className="object-contain p-2" 
                   />
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="mb-1 text-lg font-black uppercase italic leading-tight text-slate-900 truncate">{company.name}</h4>
                  <p className="text-[10px] font-bold uppercase text-slate-400">{company.industry || 'Industri'}</p>
                </div>
              </div>

              <div className="mt-6 flex items-center justify-between border-t-2 border-slate-100 pt-6">
                <div className="flex gap-4">
                  <div className="text-center">
                    <p className="text-[8px] font-black uppercase text-slate-400 italic">Loker</p>
                    <p className="text-sm font-black text-blue-600">{company.active_jobs_count}</p>
                  </div>
                  <div className="text-center">
                    <p className="text-[8px] font-black uppercase text-slate-400 italic">Karyawan Disabilitas</p>
                    <p className="text-sm font-black text-slate-700">{company.total_employees_with_disability || 0}</p>
                  </div>
                </div>

                {/* HAK AKSES TOMBOL */}
                {isKotaKab ? (
                  <button 
                    onClick={() => toggleVerification(company.id, company.is_verified)}
                    className={`rounded-xl border-2 border-slate-900 px-4 py-2 text-[10px] font-black uppercase italic transition-all active:scale-95 shadow-[2px_2px_0px_0px_rgba(15,23,42,1)] ${
                      company.is_verified ? 'bg-rose-400 hover:bg-rose-500' : 'bg-emerald-400 hover:bg-emerald-500'
                    }`}
                  >
                    {company.is_verified ? 'Cabut Verifikasi' : 'Verifikasi Mitra'}
                  </button>
                ) : (
                  <div className="flex items-center gap-2 rounded-lg bg-slate-50 px-3 py-2 border-2 border-slate-200">
                    <BarChart3 size={14} className="text-slate-400" />
                    <span className="text-[9px] font-black uppercase text-slate-400 italic">Mode Monitoring</span>
                  </div>
                )}
              </div>
            </article>
          ))}
        </div>
      ) : (
        <div className="bg-slate-50 border-4 border-dashed border-slate-200 rounded-[2rem] p-20 text-center text-slate-400 font-black uppercase italic">
          Data tidak ditemukan
        </div>
      )}

      {/* FOOTER INFO SESUAI LEVEL */}
      <section className="flex items-start gap-4 rounded-2xl border-2 border-dashed border-slate-300 bg-slate-50 p-6">
        <Info className="shrink-0 text-slate-500" />
        <div>
          <h5 className="text-[11px] font-black uppercase text-slate-700 italic">
            {isPusat ? "Panduan Monitoring Pusat" : isProvinsi ? "Panduan Koordinasi Wilayah" : "Panduan Verifikasi Lokal"}
          </h5>
          <p className="mt-1 text-[11px] font-bold leading-relaxed text-slate-500">
            {isPusat 
              ? "Anda melihat seluruh mitra industri nasional. Gunakan data ini untuk merumuskan kebijakan inklusi tenaga kerja secara makro." 
              : isProvinsi 
              ? "Data mencakup seluruh Kabupaten/Kota di wilayah Anda. Verifikasi tetap dilakukan oleh otoritas tingkat Kota/Kabupaten."
              : "Pastikan profil perusahaan sudah sesuai dengan standar inklusi sebelum menekan tombol verifikasi."}
          </p>
        </div>
      </section>
    </div>
  );
}