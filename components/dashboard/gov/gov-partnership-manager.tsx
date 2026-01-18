"use client";

import React, { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { 
  Building2, ShieldCheck, Search, Info, 
  CheckCircle, XCircle, Loader2, ExternalLink,
  Award, Briefcase
} from "lucide-react";

export default function GovPartnershipManager({ govData }: { govData: any }) {
  const [companies, setCompanies] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    if (govData?.location_id) {
      fetchLocalCompanies();
    }
  }, [govData?.location_id]);

  const fetchLocalCompanies = async () => {
    setLoading(true);
    try {
      let query = supabase.from("companies").select("*");

      // LOGIKA FILTER WILAYAH (Sama dengan Talent)
      if (govData.category.includes("Provinsi")) {
        query = query.like("city_id", `${govData.location_id}%`);
      } else if (govData.category.includes("Kota/Kabupaten")) {
        query = query.eq("city_id", govData.location_id);
      }

      const { data, error } = await query.order('name', { ascending: true });
      if (error) throw error;
      setCompanies(data || []);
    } catch (err) {
      console.error("Error:", err);
    } finally {
      setLoading(false);
    }
  };

  const toggleVerification = async (companyId: string, currentStatus: boolean) => {
    const { error } = await supabase
      .from("companies")
      .update({ is_verified_by_uld: !currentStatus })
      .eq("id", companyId);

    if (!error) {
      setCompanies(prev => prev.map(c => 
        c.id === companyId ? { ...c, is_verified_by_uld: !currentStatus } : c
      ));
    }
  };

  const filteredCompanies = companies.filter(c => 
    c.name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      
      {/* 1. HEADER SUMMARY */}
      <div className="rounded-[2.5rem] border-4 border-slate-900 bg-white p-8 shadow-[8px_8px_0px_0px_rgba(15,23,42,1)]">
        <div className="flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-4">
            <div className="rounded-2xl bg-emerald-500 p-4 text-white shadow-[4px_4px_0px_0px_rgba(15,23,42,1)]">
              <Building2 size={32} />
            </div>
            <div>
              <h3 className="text-2xl font-black uppercase italic tracking-tight">Kemitraan Industri</h3>
              <p className="text-[10px] font-bold uppercase text-slate-400 tracking-widest">Manajemen Perusahaan di Wilayah {govData.location}</p>
            </div>
          </div>
          <div className="flex gap-4 bg-slate-100 rounded-2xl p-4 border-2 border-slate-900">
             <div className="text-center px-4 border-r-2 border-slate-300">
                <p className="text-[9px] font-black uppercase text-slate-500">Total Mitra</p>
                <p className="text-xl font-black">{companies.length}</p>
             </div>
             <div className="text-center px-4">
                <p className="text-[9px] font-black uppercase text-emerald-500">Terverifikasi</p>
                <p className="text-xl font-black text-emerald-600">
                  {companies.filter(c => c.is_verified_by_uld).length}
                </p>
             </div>
          </div>
        </div>
      </div>

      {/* 2. SEARCH BAR */}
      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
        <input 
          type="text" 
          placeholder="Cari berdasarkan nama perusahaan..." 
          className="w-full rounded-2xl border-4 border-slate-900 p-4 pl-12 font-bold outline-none focus:ring-4 focus:ring-emerald-100 transition-all"
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {/* 3. COMPANY GRID */}
      {loading ? (
        <div className="flex justify-center p-20"><Loader2 className="animate-spin text-emerald-500" size={48} /></div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2">
          {filteredCompanies.map((company) => (
            <div key={company.id} className="group relative rounded-[2rem] border-4 border-slate-900 bg-white p-6 shadow-[8px_8px_0px_0px_rgba(15,23,42,1)] transition-all hover:shadow-none hover:translate-x-1 hover:translate-y-1">
              
              {/* Badge Status */}
              <div className="absolute right-6 top-6">
                {company.is_verified_by_uld ? (
                  <div className="flex items-center gap-1 rounded-full bg-emerald-100 px-3 py-1 text-[9px] font-black uppercase text-emerald-600 border-2 border-emerald-600">
                    <ShieldCheck size={12} /> Verified
                  </div>
                ) : (
                  <div className="rounded-full bg-slate-100 px-3 py-1 text-[9px] font-black uppercase text-slate-400 border-2 border-slate-200">
                    Unverified
                  </div>
                )}
              </div>

              <div className="flex gap-4">
                <div className="h-16 w-16 overflow-hidden rounded-xl border-2 border-slate-900 bg-slate-50">
                   <img src={company.logo_url || '/placeholder-company.png'} alt={company.name} className="h-full w-full object-cover" />
                </div>
                <div className="flex-1">
                  <h4 className="text-lg font-black uppercase italic text-slate-900 leading-tight mb-1">{company.name}</h4>
                  <p className="text-[10px] font-bold text-slate-400 uppercase mb-4">{company.industry}</p>
                </div>
              </div>

              <div className="mt-6 flex items-center justify-between border-t-2 border-slate-50 pt-6">
                <div className="flex gap-4">
                  <div className="text-center">
                    <p className="text-[8px] font-black uppercase text-slate-400 tracking-tighter">Loker</p>
                    <p className="font-black text-sm">{company.active_jobs_count || 0}</p>
                  </div>
                  <div className="text-center">
                    <p className="text-[8px] font-black uppercase text-slate-400 tracking-tighter">Disabilitas</p>
                    <p className="font-black text-sm">{company.disabled_workers_count || 0}</p>
                  </div>
                </div>

                <div className="flex gap-2">
                   <button 
                    onClick={() => toggleVerification(company.id, company.is_verified_by_uld)}
                    className={`rounded-xl border-2 border-slate-900 px-4 py-2 text-[10px] font-black uppercase italic transition-all ${
                      company.is_verified_by_uld 
                      ? 'bg-rose-400 hover:bg-rose-500' 
                      : 'bg-emerald-400 hover:bg-emerald-500'
                    }`}
                   >
                    {company.is_verified_by_uld ? 'Cabut Verifikasi' : 'Berikan Verifikasi'}
                   </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* FOOTER INFO */}
      <div className="rounded-2xl bg-amber-50 border-2 border-dashed border-amber-300 p-6 flex gap-4 items-start">
        <Info className="text-amber-500 shrink-0" />
        <p className="text-[11px] font-bold text-amber-700 leading-relaxed uppercase">
          <span className="font-black">PENTING:</span> Verifikasi ULD memberikan kepercayaan lebih bagi talenta disabilitas untuk melamar. Pastikan Anda telah melakukan visitasi atau pengecekan dokumen akomodasi layak perusahaan sebelum memberikan verifikasi.
        </p>
      </div>
    </div>
  );
}