"use client";

import React, { useState, useEffect, useCallback } from "react";
import { supabase } from "@/lib/supabase";
import Image from "next/image";
import { 
  Building2, ShieldCheck, Search, Info, 
  Loader2, ShieldAlert, Filter
} from "lucide-react";
import { PROVINCE_MAP } from "@/lib/constants/locations";

export default function GovPartnershipManager({ govData }: { govData: any }) {
  const [companies, setCompanies] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState<"all" | "verified" | "pending">("all");

  const fetchLocalCompanies = useCallback(async () => {
    if (!govData?.location) return;
    setLoading(true);
    try {
      // 1. QUERY SINKRON: Ambil data perusahaan + hitung relasi loker aktif
      let query = supabase.from("companies").select(`
        *,
        jobs(id)
      `);

      // 2. LOGIKA WILAYAH: Sesuai cakupan otoritas (Provinsi/Kota)
      if (govData.category.includes("Provinsi")) {
        const citiesInProvince = PROVINCE_MAP[govData.location] || [];
        query = query.in("location", citiesInProvince);
      } else {
        query = query.eq("location", govData.location);
      }

      const { data, error } = await query.order('name', { ascending: true });
      if (error) throw error;

      // 3. DATA MAPPING: Format jumlah loker
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
  }, [govData]);

  useEffect(() => {
    fetchLocalCompanies();
  }, [fetchLocalCompanies]);

  const toggleVerification = async (companyId: string, currentStatus: boolean) => {
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

  // LOGIKA FILTER & SEARCH
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
      
      {/* 1. HEADER SUMMARY */}
      <div className="rounded-[2.5rem] border-4 border-slate-900 bg-white p-8 shadow-[12px_12px_0px_0px_rgba(15,23,42,1)]">
        <div className="flex flex-col items-center justify-between gap-6 md:flex-row">
          <div className="flex items-center gap-4">
            <div className="rounded-2xl bg-emerald-500 p-4 text-white shadow-[4px_4px_0px_0px_rgba(15,23,42,1)]">
              <Building2 size={32} />
            </div>
            <div>
              <h2 className="text-2xl font-black uppercase italic tracking-tight text-slate-900">Kemitraan Industri</h2>
              <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
                Otoritas Wilayah: {govData.location}
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

      {/* 2. CONTROL BAR (SEARCH & FILTER) */}
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

      {/* 3. COMPANY GRID */}
      {loading ? (
        <div className="flex flex-col items-center justify-center p-20">
          <Loader2 className="animate-spin text-emerald-500" size={48} />
          <p className="mt-4 font-black uppercase italic text-slate-400 text-center">Sinkronisasi Data Industri...</p>
        </div>
      ) : filteredCompanies.length > 0 ? (
        <div className="grid gap-6 md:grid-cols-2">
          {filteredCompanies.map((company) => (
            <article 
              key={company.id} 
              className="group relative rounded-[2rem] border-4 border-slate-900 bg-white p-6 shadow-[8px_8px_0px_0px_rgba(15,23,42,1)] transition-all hover:translate-x-1 hover:translate-y-1 hover:shadow-none"
            >
              {/* Badge Status */}
              <div className="absolute right-6 top-6">
                {company.is_verified ? (
                  <div className="flex items-center gap-1 rounded-full border-2 border-emerald-600 bg-emerald-100 px-3 py-1 text-[9px] font-black uppercase text-emerald-600 shadow-sm">
                    <ShieldCheck size={12} /> Terverifikasi ULD
                  </div>
                ) : (
                  <div className="flex items-center gap-1 rounded-full border-2 border-slate-200 bg-slate-100 px-3 py-1 text-[9px] font-black uppercase text-slate-400">
                    <ShieldAlert size={12} /> Belum Verifikasi
                  </div>
                )}
              </div>

              <div className="flex gap-4">
                <div className="size-16 overflow-hidden rounded-xl border-2 border-slate-900 bg-slate-50 relative shrink-0">
                   <Image 
                     src={company.official_seal_url || company.logo_url || '/placeholder-company.png'} 
                     alt={`Logo ${company.name}`} 
                     fill
                     className="object-contain p-2" 
                   />
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="mb-1 text-lg font-black uppercase italic leading-tight text-slate-900 truncate">
                    {company.name}
                  </h4>
                  <p className="text-[10px] font-bold uppercase text-slate-400 truncate">
                    {company.industry || 'Industri Umum'}
                  </p>
                </div>
              </div>

              <div className="mt-6 flex items-center justify-between border-t-2 border-slate-100 pt-6">
                <div className="flex gap-4">
                  <div className="text-center">
                    <p className="text-[8px] font-black uppercase text-slate-400 italic">Loker Aktif</p>
                    <p className="text-sm font-black text-blue-600">{company.active_jobs_count}</p>
                  </div>
                  <div className="text-center">
                    <p className="text-[8px] font-black uppercase text-slate-400 italic">Karyawan Disabilitas</p>
                    <p className="text-sm font-black text-slate-700">{company.total_employees_with_disability || 0}</p>
                  </div>
                </div>

                <button 
                  onClick={() => toggleVerification(company.id, company.is_verified)}
                  className={`rounded-xl border-2 border-slate-900 px-4 py-2 text-[10px] font-black uppercase italic transition-all active:scale-95 ${
                    company.is_verified 
                    ? 'bg-rose-400 hover:bg-rose-500 shadow-[2px_2px_0px_0px_rgba(15,23,42,1)]' 
                    : 'bg-emerald-400 hover:bg-emerald-500 shadow-[2px_2px_0px_0px_rgba(15,23,42,1)]'
                  }`}
                >
                  {company.is_verified ? 'Cabut Verifikasi' : 'Verifikasi Mitra'}
                </button>
              </div>
            </article>
          ))}
        </div>
      ) : (
        <div className="bg-slate-50 border-4 border-dashed border-slate-200 rounded-[2rem] p-20 text-center">
          <p className="font-black uppercase italic text-slate-400">Tidak ada perusahaan ditemukan</p>
        </div>
      )}

      {/* Info Footer */}
      <section className="flex items-start gap-4 rounded-2xl border-2 border-dashed border-amber-300 bg-amber-50 p-6">
        <Info className="shrink-0 text-amber-500" />
        <div>
          <h5 className="text-[11px] font-black uppercase text-amber-700 italic">Panduan Verifikasi</h5>
          <p className="mt-1 text-[11px] font-bold leading-relaxed text-amber-700">
            Gunakan filter untuk mempercepat proses verifikasi. Status <strong>Mitra ULD</strong> akan memberikan badge khusus pada lowongan kerja perusahaan tersebut, menandakan bahwa mereka telah diverifikasi oleh otoritas wilayah.
          </p>
        </div>
      </section>
    </div>
  );
}