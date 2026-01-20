"use client"

import React, { useState, useMemo } from "react"
import { 
  Users, Search, ShieldCheck, Building2, GraduationCap, 
  Landmark, Briefcase, Trash2, CheckCircle, 
  ChevronLeft, ChevronRight, MoreHorizontal 
} from "lucide-react"

export default function UserManagement({ talents = [], onAction }: any) {
  // --- STATES ---
  const [query, setQuery] = useState("")
  const [roleFilter, setRoleFilter] = useState("all")
  const [statusFilter, setStatusFilter] = useState("all")
  const [selectedIds, setSelectedIds] = useState<string[]>([])
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 10

  // --- LOGIC: STATS ---
  const stats = useMemo(() => {
    const unverified = talents.filter((t: any) => t.role !== 'talent' && t.verification_status !== 'verified').length;
    const verified = talents.filter((t: any) => t.verification_status === 'verified').length;
    return { unverified, verified, total: talents.length };
  }, [talents]);

  // --- LOGIC: FILTERING & PAGINATION ---
  const filteredData = useMemo(() => {
    return talents.filter((t: any) => {
      const matchQuery = (t.full_name || "").toLowerCase().includes(query.toLowerCase()) || 
                         (t.email || "").toLowerCase().includes(query.toLowerCase());
      const matchRole = roleFilter === "all" || t.role === roleFilter;
      const matchStatus = statusFilter === "all" || 
                         (statusFilter === "unverified" && t.verification_status !== 'verified') ||
                         (statusFilter === "verified" && t.verification_status === 'verified');
      
      return matchQuery && matchRole && matchStatus;
    });
  }, [talents, query, roleFilter, statusFilter]);

  const totalPages = Math.ceil(filteredData.length / itemsPerPage);
  const paginatedData = filteredData.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  // --- HANDLERS ---
  const toggleSelectOne = (id: string) => {
    setSelectedIds(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
  };

  const getRoleIcon = (role: string) => {
    const icons: any = {
      talent: <Users size={14} />,
      company: <Building2 size={14} />,
      campus: <GraduationCap size={14} />,
      government: <Landmark size={14} />,
      partner: <Briefcase size={14} />,
    };
    return icons[role] || <ShieldCheck size={14} />;
  };

  return (
    <section className="space-y-6" role="region" aria-label="User Management Dashboard">
      
      {/* 1. TOP STATS CARDS */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
        <div className="rounded-[2.5rem] border-4 border-slate-900 bg-blue-600 p-8 text-white shadow-[8px_8px_0px_0px_rgba(15,23,42,1)]">
          <p className="text-[10px] font-black uppercase tracking-widest opacity-80 text-left">Total Ekosistem</p>
          <p className="text-4xl font-black italic text-left">{stats.total}</p>
        </div>
        <div className="rounded-[2.5rem] border-4 border-slate-900 bg-emerald-500 p-8 text-white shadow-[8px_8px_0px_0px_rgba(15,23,42,1)]">
          <p className="text-[10px] font-black uppercase tracking-widest opacity-80 text-left">Terverifikasi</p>
          <p className="text-4xl font-black italic text-left">{stats.verified}</p>
        </div>
        <div className="rounded-[2.5rem] border-4 border-slate-900 bg-rose-500 p-8 text-white shadow-[8px_8px_0px_0px_rgba(15,23,42,1)]">
          <p className="text-[10px] font-black uppercase tracking-widest opacity-80 text-left">Menunggu Verifikasi</p>
          <p className="text-4xl font-black italic text-left">{stats.unverified}</p>
        </div>
      </div>

      <div className="rounded-[3.5rem] border-4 border-slate-900 bg-white p-8 shadow-[12px_12px_0px_0px_rgba(15,23,42,1)]">
        
        {/* 2. FILTERS & SEARCH */}
        <div className="flex flex-col gap-6 border-b-4 border-slate-50 pb-8 lg:flex-row lg:items-center">
          <div className="relative flex-1">
            <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400" size={20}/>
            <input 
              placeholder="Cari Nama atau Email..." 
              className="w-full rounded-3xl border-4 border-slate-900 py-4 pl-14 pr-6 text-sm font-black uppercase outline-none focus:ring-8 focus:ring-blue-50"
              value={query}
              onChange={(e) => { setQuery(e.target.value); setCurrentPage(1); }}
            />
          </div>
          
          <div className="flex flex-wrap gap-3">
            <select 
              aria-label="Filter Berdasarkan Role"
              className="rounded-2xl border-4 border-slate-900 bg-white px-4 py-3 text-[10px] font-black uppercase outline-none"
              value={roleFilter}
              onChange={(e) => { setRoleFilter(e.target.value); setCurrentPage(1); }}
            >
              <option value="all">Semua Role</option>
              <option value="talent">Talenta</option>
              <option value="company">Instansi/Bisnis</option>
              <option value="campus">Perguruan Tinggi</option>
              <option value="government">Pemerintah</option>
              <option value="partner">Mitra</option>
            </select>

            <select 
              aria-label="Filter Berdasarkan Status Verifikasi"
              className="rounded-2xl border-4 border-slate-900 bg-white px-4 py-3 text-[10px] font-black uppercase outline-none"
              value={statusFilter}
              onChange={(e) => { setStatusFilter(e.target.value); setCurrentPage(1); }}
            >
              <option value="all">Semua Status</option>
              <option value="verified">Sudah Verifikasi</option>
              <option value="unverified">Belum Verifikasi</option>
            </select>
          </div>
        </div>

        {/* 3. BULK ACTIONS - DIPERBAIKI: Menghubungkan ke onAction */}
        {selectedIds.length > 0 && (
          <div className="flex items-center justify-between bg-blue-50 p-4 animate-in fade-in slide-in-from-top-2 rounded-2xl mb-6">
            <p className="text-[10px] font-black uppercase text-blue-700 ml-4">{selectedIds.length} User Terpilih</p>
            <div className="flex gap-2 mr-4">
              <button 
                onClick={() => {
                   onAction("BULK_VERIFY", selectedIds);
                   setSelectedIds([]); // Reset setelah aksi
                }}
                className="rounded-xl bg-blue-600 px-4 py-2 text-[9px] font-black uppercase text-white hover:bg-blue-700 transition-all"
              >
                Verifikasi Massal
              </button>
              <button 
                onClick={() => {
                   onAction("BULK_DELETE", selectedIds);
                   setSelectedIds([]); // Reset setelah aksi
                }}
                className="rounded-xl bg-rose-600 px-4 py-2 text-[9px] font-black uppercase text-white hover:bg-rose-700 transition-all"
              >
                Hapus Massal
              </button>
            </div>
          </div>
        )}

        {/* 4. DATA LIST */}
        <div className="mt-8 space-y-4">
          {paginatedData.length > 0 ? (
            paginatedData.map((t: any) => (
              <div key={t.id} className={`group flex items-center justify-between rounded-3xl border-4 border-slate-900 p-5 transition-all hover:bg-slate-50 ${selectedIds.includes(t.id) ? 'bg-blue-50 border-blue-600' : 'bg-white'}`}>
                <div className="flex items-center gap-5">
                  <div className="relative flex items-center">
                    <input 
                      type="checkbox" 
                      aria-label={`Pilih ${t.full_name}`}
                      className="size-6 cursor-pointer rounded-lg border-4 border-slate-900 accent-blue-600"
                      checked={selectedIds.includes(t.id)}
                      onChange={() => toggleSelectOne(t.id)}
                    />
                  </div>
                  <div className="hidden size-14 items-center justify-center rounded-2xl bg-slate-900 text-lg font-black text-white sm:flex">
                    {t.full_name?.[0] || "?"}
                  </div>
                  <div className="text-left">
                    <h3 className="flex items-center gap-2 text-sm font-black uppercase text-slate-900">
                      {t.full_name} 
                      {t.verification_status === 'verified' && <CheckCircle size={16} className="text-emerald-500" />}
                    </h3>
                    <div className="flex flex-wrap gap-2 mt-1">
                      <span className="flex items-center gap-1 rounded-lg bg-slate-100 px-2 py-1 text-[8px] font-black uppercase italic text-slate-500">
                        {getRoleIcon(t.role)} {t.role}
                      </span>
                      <span className="text-[10px] font-bold text-slate-400">{t.email}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {t.role !== 'talent' && t.verification_status !== 'verified' && (
                    <button 
                      onClick={() => onAction("VERIFY", t.id)}
                      className="rounded-xl bg-emerald-100 px-4 py-2 text-[9px] font-black uppercase text-emerald-700 hover:bg-emerald-600 hover:text-white transition-all"
                    >
                      Verifikasi
                    </button>
                  )}
                  
                  <button 
                    onClick={() => onAction("DELETE", t.id)}
                    className="p-2 text-slate-300 hover:text-rose-600 transition-colors"
                  >
                    <Trash2 size={20} />
                  </button>
                  
                  <button className="p-2 text-slate-300 hover:text-slate-900">
                    <MoreHorizontal size={20} />
                  </button>
                </div>
              </div>
            ))
          ) : (
            <div className="py-20 text-center">
              <p className="font-black uppercase italic text-slate-300">Data tidak ditemukan...</p>
            </div>
          )}
        </div>

        {/* 5. PAGINATION */}
        {totalPages > 1 && (
          <div className="mt-10 flex items-center justify-between border-t-4 border-slate-50 pt-8">
            <p className="text-[10px] font-black uppercase text-slate-400">
              Halaman {currentPage} dari {totalPages} ({filteredData.length} User)
            </p>
            <div className="flex gap-2">
              <button 
                disabled={currentPage === 1}
                onClick={() => setCurrentPage(prev => prev - 1)}
                className="flex size-12 items-center justify-center rounded-xl border-4 border-slate-900 disabled:opacity-20 hover:bg-slate-900 hover:text-white transition-all"
              >
                <ChevronLeft size={20} />
              </button>
              <button 
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage(prev => prev + 1)}
                className="flex size-12 items-center justify-center rounded-xl border-4 border-slate-900 disabled:opacity-20 hover:bg-slate-900 hover:text-white transition-all"
              >
                <ChevronRight size={20} />
              </button>
            </div>
          </div>
        )}
      </div>
    </section>
  )
}