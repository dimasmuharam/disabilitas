"use client"

import React, { useState, useMemo } from "react"
import { 
  Users, Search, Building2, Trash2, CheckCircle, 
  ChevronLeft, ChevronRight, Key, Ban, 
  MailCheck, Download, MapPin, ExternalLink,
  MailWarning, RotateCcw, GraduationCap, Landmark, ShieldCheck
} from "lucide-react"
import * as XLSX from "xlsx"
import { cn } from "@/lib/utils"

export default function UserManagement({ allUsers = [], onAction }: any) {
  // --- STATES ---
  const [query, setQuery] = useState("")
  const [roleFilter, setRoleFilter] = useState("all")
  const [statusFilter, setStatusFilter] = useState("all")
  const [selectedIds, setSelectedIds] = useState<string[]>([])
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 10
  const [announcement, setAnnouncement] = useState("")

  // --- LOGIC: DATA MAPPING ---
  const filteredData = useMemo(() => {
    return allUsers.filter((u: any) => {
      const meta = u.user_metadata || {};
      const name = (meta.full_name || meta.name || u.email || "").toLowerCase();
      const email = (u.email || "").toLowerCase();
      const role = (meta.role || "talent");
      
      const matchQuery = name.includes(query.toLowerCase()) || email.includes(query.toLowerCase());
      const matchRole = roleFilter === "all" || role === roleFilter;
      const matchStatus = statusFilter === "all" || 
                         (statusFilter === "unconfirmed" && !u.email_confirmed_at) ||
                         (statusFilter === "confirmed" && u.email_confirmed_at);
      
      return matchQuery && matchRole && matchStatus;
    });
  }, [allUsers, query, roleFilter, statusFilter]);

  const stats = useMemo(() => {
    const getRoleCount = (r: string) => allUsers.filter((u: any) => (u.user_metadata?.role || 'talent') === r).length;
    return {
      total: allUsers.length,
      talent: getRoleCount('talent'),
      company: getRoleCount('company'),
      partner: getRoleCount('partner'),
      campus: getRoleCount('campus'),
      government: getRoleCount('government'),
      unconfirmed: allUsers.filter((u: any) => !u.email_confirmed_at).length,
    }
  }, [allUsers]);

  const totalPages = Math.ceil(filteredData.length / itemsPerPage);
  const paginatedData = filteredData.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  // --- ACTIONS ---
  const toggleSelectAll = () => {
    if (selectedIds.length === paginatedData.length) {
      setSelectedIds([]);
      setAnnouncement("Pilihan massal dibatalkan");
    } else {
      setSelectedIds(paginatedData.map((u: any) => u.id));
      setAnnouncement(`${paginatedData.length} user dipilih di halaman ini`);
    }
  };

  const toggleSelectOne = (id: string) => {
    setSelectedIds(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
  };

  const getPublicLink = (user: any) => {
    const role = user.user_metadata?.role || 'talent';
    const roleMap: Record<string, string> = {
      company: 'perusahaan',
      campus: 'kampus',
      government: 'government',
      partner: 'partner',
      talent: 'talent'
    };
    return `/${roleMap[role]}/${user.id}`;
  };

  return (
    <section className="space-y-6" role="region" aria-label="Sistem Manajemen Identitas">
      {/* 0. ARIA LIVE FOR ACCESSIBILITY */}
      <div className="sr-only" role="status" aria-live="polite">{announcement}</div>

      {/* 1. STATS GRID - 5 Roles + Total */}
      <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-6">
        <StatCard label="Total" val={stats.total} bg="bg-slate-900" icon={<Users />} />
        <StatCard label="Talent" val={stats.talent} bg="bg-blue-600" icon={<Users />} />
        <StatCard label="Company" val={stats.company} bg="bg-indigo-600" icon={<Building2 />} />
        <StatCard label="Partner" val={stats.partner} bg="bg-emerald-600" icon={<ShieldCheck />} />
        <StatCard label="Campus" val={stats.campus} bg="bg-amber-600" icon={<GraduationCap />} />
        <StatCard label="Gov" val={stats.government} bg="bg-rose-600" icon={<Landmark />} />
      </div>

      <div className="rounded-[3.5rem] border-4 border-slate-900 bg-white p-6 shadow-[12px_12px_0px_0px_rgba(15,23,42,1)] md:p-10">
        
        {/* 2. ADVANCED FILTERS */}
        <div className="flex flex-col gap-6 border-b-4 border-slate-50 pb-8 lg:flex-row lg:items-center">
          <div className="relative flex-1">
            <label htmlFor="user-search" className="sr-only">Cari Nama atau Email</label>
            <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
            <input 
              id="user-search"
              placeholder="Cari Identitas..." 
              className="w-full rounded-3xl border-4 border-slate-900 py-4 pl-14 pr-6 text-sm font-black uppercase outline-none focus:ring-8 focus:ring-blue-50"
              value={query}
              onChange={(e) => { setQuery(e.target.value); setCurrentPage(1); }}
            />
          </div>
          
          <div className="flex flex-wrap gap-3">
            <select 
              aria-label="Filter Berdasarkan Role"
              className="rounded-2xl border-4 border-slate-900 bg-white px-4 py-3 text-[10px] font-black uppercase outline-none cursor-pointer"
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
            >
              <option value="all">Semua Role</option>
              <option value="talent">Talenta</option>
              <option value="company">Perusahaan</option>
              <option value="partner">Partner</option>
              <option value="campus">Kampus</option>
              <option value="government">Pemerintah</option>
            </select>

            <select 
              aria-label="Filter Berdasarkan Status"
              className="rounded-2xl border-4 border-slate-900 bg-white px-4 py-3 text-[10px] font-black uppercase outline-none cursor-pointer"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="all">Semua Status</option>
              <option value="confirmed">Email Terverifikasi</option>
              <option value="unconfirmed">Belum Konfirmasi</option>
            </select>

            <button 
              onClick={() => onAction("EXPORT_EXCEL", filteredData)}
              className="rounded-2xl bg-emerald-600 p-3 text-white shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-y-1 hover:shadow-none transition-all"
              aria-label="Unduh Laporan Excel"
            >
              <Download size={20}/>
            </button>
          </div>
        </div>

        {/* 3. BULK ACTION TOOLBAR */}
        <div className="flex items-center justify-between py-6">
          <div className="flex items-center gap-4">
            <input 
              id="select-all"
              type="checkbox" 
              className="size-7 cursor-pointer rounded-lg border-4 border-slate-900 accent-blue-600"
              checked={selectedIds.length === paginatedData.length && paginatedData.length > 0}
              onChange={toggleSelectAll}
              aria-label="Pilih semua user di halaman ini"
            />
            <label htmlFor="select-all" className="text-xs font-black uppercase italic text-slate-400">Pilih Halaman Ini</label>
          </div>

          {selectedIds.length > 0 && (
            <div className="flex gap-2">
              <button 
                onClick={() => onAction("BULK_CONFIRM", selectedIds)}
                className="rounded-xl bg-blue-600 px-4 py-2 text-[9px] font-black uppercase text-white shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]"
              >
                Konfirmasi ({selectedIds.length})
              </button>
              <button 
                onClick={() => onAction("BULK_DELETE", selectedIds)}
                className="rounded-xl bg-rose-600 px-4 py-2 text-[9px] font-black uppercase text-white shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]"
              >
                Hapus Permanen
              </button>
            </div>
          )}
        </div>

        {/* 4. USER LIST CARDS */}
        <div className="space-y-4" role="list">
          {paginatedData.map((user: any) => {
            const meta = user.user_metadata || {};
            const role = meta.role || 'talent';
            const name = meta.full_name || meta.name || user.email?.split('@')[0] || "User Tanpa Nama";
            
            return (
              <div 
                key={user.id} 
                role="listitem"
                className={cn(
                  "flex flex-col gap-4 rounded-3xl border-4 border-slate-900 p-5 lg:flex-row lg:items-center lg:justify-between transition-all",
                  selectedIds.includes(user.id) ? "bg-blue-50 border-blue-600 ring-4 ring-blue-100" : "bg-white"
                )}
              >
                <div className="flex items-center gap-5">
                  <input 
                    type="checkbox" 
                    aria-label={`Pilih user ${name}`}
                    className="size-7 cursor-pointer rounded-lg border-4 border-slate-900 accent-blue-600"
                    checked={selectedIds.includes(user.id)}
                    onChange={() => toggleSelectOne(user.id)}
                  />
                  
                  <div className="text-left">
                    <div className="flex items-center gap-2">
                      <h4 className="text-sm font-black uppercase text-slate-900">{name}</h4>
                      <a 
                        href={getPublicLink(user)} 
                        target="_blank" 
                        className="text-slate-300 hover:text-blue-600 transition-colors"
                        aria-label={`Buka profil publik ${name}`}
                      >
                        <ExternalLink size={14} />
                      </a>
                      {user.email_confirmed_at ? 
                        <CheckCircle size={16} className="text-emerald-500" aria-label="Email Terverifikasi" /> : 
                        <MailWarning size={16} className="text-rose-500" aria-label="Email Belum Konfirmasi" />
                      }
                    </div>
                    <p className="text-[11px] font-bold text-slate-500">{user.email}</p>
                    <div className="mt-1 flex items-center gap-2">
                      <span className="rounded-md bg-slate-900 px-2 py-0.5 text-[8px] font-black uppercase italic text-white">
                        {role}
                      </span>
                      <span className="text-[10px] font-bold text-slate-400 flex items-center gap-1">
                        <MapPin size={10}/> {meta.city || meta.location || "Lokasi Nihil"}
                      </span>
                    </div>
                  </div>
                </div>

                {/* 5. ACTION BUTTONS - FULL ACCESSIBILITY */}
                <div className="flex flex-wrap items-center gap-2 pt-4 border-t-2 border-slate-50 lg:pt-0 lg:border-t-0">
                  {!user.email_confirmed_at && (
                    <ActionButton 
                      icon={<RotateCcw size={12}/>} 
                      label="Resend Email" 
                      onClick={() => onAction("RESEND_CONFIRMATION", user.email)} 
                      color="bg-amber-50 text-amber-700 hover:bg-amber-500 hover:text-white border-amber-200" 
                    />
                  )}
                  <ActionButton 
                    icon={<Key size={12}/>} 
                    label="Reset Password" 
                    onClick={() => onAction("RESET_PASSWORD", user.email)} 
                    color="hover:bg-slate-900" 
                  />
                  <ActionButton 
                    icon={<MailCheck size={12}/>} 
                    label="Force Confirm" 
                    onClick={() => onAction("FORCE_CONFIRM", user.id)} 
                    color="hover:bg-emerald-600" 
                  />
                  <ActionButton 
                    icon={<Ban size={12}/>} 
                    label="Suspend" 
                    onClick={() => onAction("SUSPEND", user.id)} 
                    color="hover:bg-rose-900" 
                  />
                  <button 
                    onClick={() => onAction("DELETE_USER", user.id)}
                    className="p-2 ml-2 text-slate-300 hover:text-rose-600 transition-all focus:outline-none focus:ring-4 focus:ring-rose-100 rounded-lg"
                    aria-label={`Hapus permanen user ${name}`}
                  >
                    <Trash2 size={20} />
                  </button>
                </div>
              </div>
            )
          })}
        </div>

        {/* 6. PAGINATION */}
        {totalPages > 1 && (
          <nav className="mt-10 flex items-center justify-between border-t-4 border-slate-50 pt-8" aria-label="Navigasi Halaman">
            <p className="text-[10px] font-black uppercase text-slate-400">Total {filteredData.length} Users</p>
            <div className="flex gap-2">
              <button 
                disabled={currentPage === 1} 
                onClick={() => { setCurrentPage(v => v-1); setAnnouncement(`Halaman ${currentPage - 1}`); }}
                className="p-3 border-4 border-slate-900 rounded-xl disabled:opacity-20 hover:bg-slate-900 hover:text-white transition-all"
                aria-label="Halaman Sebelumnya"
              >
                <ChevronLeft size={20}/>
              </button>
              <div className="flex items-center px-4 text-xs font-black italic" aria-current="page">
                {currentPage} / {totalPages}
              </div>
              <button 
                disabled={currentPage === totalPages} 
                onClick={() => { setCurrentPage(v => v+1); setAnnouncement(`Halaman ${currentPage + 1}`); }}
                className="p-3 border-4 border-slate-900 rounded-xl disabled:opacity-20 hover:bg-slate-900 hover:text-white transition-all"
                aria-label="Halaman Selanjutnya"
              >
                <ChevronRight size={20}/>
              </button>
            </div>
          </nav>
        )}
      </div>
    </section>
  )
}

function StatCard({ label, val, bg, icon }: any) {
  return (
    <div className={`relative overflow-hidden rounded-[2rem] border-4 border-slate-900 ${bg} p-6 text-white shadow-[6px_6px_0px_0px_rgba(15,23,42,1)]`}>
      <div className="relative z-10">
        <p className="text-[9px] font-black uppercase tracking-widest opacity-70">{label}</p>
        <p className="mt-1 text-2xl font-black italic">{val}</p>
      </div>
      <div className="absolute -right-2 -bottom-2 scale-150 opacity-20 transform rotate-12" aria-hidden="true">
        {icon}
      </div>
    </div>
  )
}

function ActionButton({ icon, label, onClick, color }: any) {
  return (
    <button 
      onClick={onClick} 
      className={cn(
        "flex items-center gap-2 rounded-xl bg-slate-50 px-3 py-2 text-[8px] font-black uppercase text-slate-600 transition-all hover:text-white border-2 border-slate-100",
        color
      )}
      aria-label={label}
    >
      {icon} <span className="hidden sm:inline">{label}</span>
    </button>
  )
}