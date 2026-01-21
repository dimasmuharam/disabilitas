"use client"

import React, { useState, useMemo, useRef, useEffect } from "react"
import { 
  Users, Search, ShieldCheck, Building2, GraduationCap, 
  Landmark, Briefcase, Trash2, CheckCircle, 
  ChevronLeft, ChevronRight, Key, Ban, 
  MailCheck, Download, FileText, MapPin, ExternalLink,
  MailWarning, RotateCcw, UserX
} from "lucide-react"
import * as XLSX from "xlsx"
import jsPDF from "jspdf"
import autoTable from "jspdf-autotable"

export default function UserManagement({ allUsers = [], onAction }: any) {
  // --- STATES ---
  const [query, setQuery] = useState("")
  const [roleFilter, setRoleFilter] = useState("all")
  const [statusFilter, setStatusFilter] = useState("all")
  const [selectedIds, setSelectedIds] = useState<string[]>([])
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 10
  const [announcement, setAnnouncement] = useState("")

  // --- LOGIC: FILTERING & STATS ---
  const filteredData = useMemo(() => {
    return allUsers.filter((u: any) => {
      const name = (u.full_name || u.name || "").toLowerCase();
      const email = (u.email || "").toLowerCase();
      const location = (u.city || u.location || "").toLowerCase();
      
      const matchQuery = name.includes(query.toLowerCase()) || 
                         email.includes(query.toLowerCase()) || 
                         location.includes(query.toLowerCase());
      
      const matchRole = roleFilter === "all" || u.role === roleFilter;
      
      const matchStatus = statusFilter === "all" || 
                         (statusFilter === "unconfirmed" && !u.email_confirmed_at) ||
                         (statusFilter === "verified" && u.is_verified);
      
      return matchQuery && matchRole && matchStatus;
    });
  }, [allUsers, query, roleFilter, statusFilter]);

  const stats = useMemo(() => ({
    total: allUsers.length,
    talent: allUsers.filter((u: any) => u.role === 'talent').length,
    company: allUsers.filter((u: any) => u.role === 'company').length,
    unconfirmed: allUsers.filter((u: any) => !u.email_confirmed_at).length,
  }), [allUsers]);

  const totalPages = Math.ceil(filteredData.length / itemsPerPage);
  const paginatedData = filteredData.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  // --- ACTIONS ---
  const toggleSelectAll = () => {
    if (selectedIds.length === paginatedData.length) {
      setSelectedIds([]);
      setAnnouncement("Pilihan massal dibatalkan");
    } else {
      setSelectedIds(paginatedData.map((u: any) => u.id));
      setAnnouncement(`${paginatedData.length} user dipilih`);
    }
  };

  const toggleSelectOne = (id: string) => {
    setSelectedIds(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
  };

  const getPublicLink = (user: any) => {
    if (user.role === 'company') return `/perusahaan/${user.id}`;
    if (user.role === 'campus') return `/kampus/${user.id}`;
    return `/${user.role}/${user.id}`;
  };

  // --- EXPORTS ---
  const exportToExcel = () => {
    const data = filteredData.map((u: any) => ({
      Nama: u.full_name || u.name,
      Email: u.email,
      Role: u.role,
      Lokasi: u.city || u.location,
      Email_Confirmed: u.email_confirmed_at ? "Yes" : "No"
    }));
    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Users");
    XLSX.writeFile(wb, "Riset_User_Export.xlsx");
  };

  return (
    <section className="space-y-6" role="region" aria-label="Manajemen Identitas & Akses User">
      
      {/* 0. SCREEN READER LIVE REGION */}
      <div className="sr-only" role="status" aria-live="polite">{announcement}</div>

      {/* 1. KATEGORI STATISTIK LENGKAP */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Total Ekosistem" val={stats.total} bg="bg-slate-900" icon={<Users className="opacity-20" />} />
        <StatCard label="Talenta Terdaftar" val={stats.talent} bg="bg-blue-600" icon={<Users className="opacity-20" />} />
        <StatCard label="Mitra Perusahaan" val={stats.company} bg="bg-indigo-600" icon={<Building2 className="opacity-20" />} />
        <StatCard label="Email Belum Konfirmasi" val={stats.unconfirmed} bg="bg-rose-600" icon={<MailWarning className="opacity-20" />} />
      </div>

      <div className="rounded-[3.5rem] border-4 border-slate-900 bg-white p-6 shadow-[12px_12px_0px_0px_rgba(15,23,42,1)] md:p-10">
        
        {/* 2. ADVANCED FILTERS */}
        <div className="flex flex-col gap-6 border-b-4 border-slate-50 pb-8 lg:flex-row lg:items-center">
          <div className="relative flex-1">
            <label htmlFor="user-search" className="sr-only">Cari Nama, Email atau Kota</label>
            <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400" size={20} aria-hidden="true"/>
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
              aria-label="Filter Role"
              className="rounded-2xl border-4 border-slate-900 bg-white px-4 py-3 text-[10px] font-black uppercase outline-none"
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
            >
              <option value="all">Semua Role</option>
              <option value="talent">Talenta</option>
              <option value="company">Perusahaan</option>
              <option value="campus">Kampus</option>
            </select>

            <select 
              aria-label="Filter Status Spesifik"
              className="rounded-2xl border-4 border-slate-900 bg-white px-4 py-3 text-[10px] font-black uppercase outline-none"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="all">Semua Status</option>
              <option value="unconfirmed">Belum Konfirmasi Email</option>
              <option value="verified">Verified Profile</option>
            </select>

            <div className="flex gap-2">
              <button onClick={exportToExcel} className="rounded-2xl bg-emerald-600 p-3 text-white shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-all hover:bg-emerald-700" aria-label="Export ke Excel">
                <Download size={20}/>
              </button>
            </div>
          </div>
        </div>

        {/* 3. BULK ACTION TOOLBAR */}
        <div className="flex items-center justify-between py-6">
          <div className="flex items-center gap-4">
            <label className="group flex cursor-pointer items-center gap-3">
              <input 
                type="checkbox" 
                className="size-6 rounded-lg border-4 border-slate-900 accent-blue-600"
                checked={selectedIds.length === paginatedData.length && paginatedData.length > 0}
                onChange={toggleSelectAll}
                aria-label="Pilih semua di halaman ini"
              />
              <span className="text-[10px] font-black uppercase italic text-slate-400 group-hover:text-slate-900">Pilih Semua</span>
            </label>
          </div>

          {selectedIds.length > 0 && (
            <div className="flex gap-2 animate-in slide-in-from-right-4">
              <button onClick={() => onAction("BULK_VERIFY", selectedIds)} className="rounded-xl bg-blue-600 px-4 py-2 text-[9px] font-black uppercase text-white shadow-[4px_4px_0px_0px_rgba(15,23,42,1)]">Verifikasi ({selectedIds.length})</button>
              <button onClick={() => onAction("BULK_DELETE", selectedIds)} className="rounded-xl bg-rose-600 px-4 py-2 text-[9px] font-black uppercase text-white shadow-[4px_4px_0px_0px_rgba(15,23,42,1)]">Hapus Massal</button>
            </div>
          )}
        </div>

        {/* 4. USER LIST (ACCESSIBLE TABLE-LIKE STRUCTURE) */}
        <div className="space-y-4" role="list">
          {paginatedData.map((user: any) => (
            <div 
              key={user.id} 
              role="listitem"
              className={`flex flex-col gap-4 rounded-3xl border-4 border-slate-900 p-5 transition-all lg:flex-row lg:items-center lg:justify-between ${selectedIds.includes(user.id) ? 'border-blue-600 bg-blue-50' : 'bg-white'}`}
            >
              <div className="flex items-center gap-5">
                <input 
                  type="checkbox" 
                  aria-label={`Pilih ${user.full_name || user.name}`}
                  className="size-6 cursor-pointer rounded-lg border-4 border-slate-900 accent-blue-600"
                  checked={selectedIds.includes(user.id)}
                  onChange={() => toggleSelectOne(user.id)}
                />
                
                <div className="text-left">
                  <div className="flex items-center gap-2">
                    <h4 className="text-sm font-black uppercase text-slate-900">
                      {user.full_name || user.name || "Anonymous"}
                    </h4>
                    <a 
                      href={getPublicLink(user)} 
                      target="_blank" 
                      className="text-slate-300 transition-colors hover:text-blue-600"
                      title={`Lihat Profil Publik ${user.role}`}
                      aria-label={`Lihat Profil Publik ${user.full_name}`}
                    >
                      <ExternalLink size={14} />
                    </a>
                    {user.is_verified && <CheckCircle size={16} className="text-emerald-500" aria-label="Profil Terverifikasi" />}
                    {!user.email_confirmed_at && <MailWarning size={16} className="text-rose-500" aria-label="Email Belum Dikonfirmasi" />}
                  </div>
                  
                  <div className="mt-1 flex flex-col gap-1">
                    <p className="text-[11px] font-bold text-slate-500">{user.email}</p>
                    <div className="flex flex-wrap gap-2">
                      <span className="flex items-center gap-1 rounded-md border border-slate-200 bg-slate-100 px-2 py-0.5 text-[8px] font-black uppercase italic text-slate-500">
                        {user.role}
                      </span>
                      <span className="flex items-center gap-1 text-[10px] font-bold text-slate-400">
                        <MapPin size={10}/> {user.city || user.location || "Lokasi Nihil"}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* ACTION GRID */}
              <div className="flex flex-wrap items-center gap-2 border-t-2 border-slate-50 pt-4 lg:border-t-0 lg:pt-0">
                {!user.email_confirmed_at && (
                  <ActionButton 
                    icon={<RotateCcw size={12}/>} 
                    label="Resend Link" 
                    onClick={() => onAction("RESEND_CONFIRMATION", user.email)} 
                    color="bg-rose-50 text-rose-700 hover:bg-rose-600 hover:text-white" 
                  />
                )}
                <ActionButton icon={<Key size={12}/>} label="Pass" onClick={() => onAction("RESET_PASSWORD", user.email)} color="hover:bg-amber-500" />
                <ActionButton icon={<MailCheck size={12}/>} label="AuthVerify" onClick={() => onAction("VERIFY_EMAIL", user.id)} color="hover:bg-emerald-500" />
                <ActionButton icon={<Ban size={12}/>} label="Suspend" onClick={() => onAction("SUSPEND_USER", user.id)} color="hover:bg-slate-800" />
                
                <button 
                  onClick={() => onAction("DELETE_USER", user.id)} 
                  className="ml-2 p-2 text-slate-300 transition-all hover:text-rose-600"
                  aria-label={`Hapus user ${user.full_name}`}
                >
                  <Trash2 size={20} />
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* 5. ACCESSIBLE PAGINATION */}
        {totalPages > 1 && (
          <nav className="mt-10 flex items-center justify-between border-t-4 border-slate-50 pt-8" aria-label="Navigasi Halaman">
            <p className="text-[10px] font-black uppercase text-slate-400">
              Menampilkan {paginatedData.length} dari {filteredData.length} User
            </p>
            <div className="flex gap-2">
              <button 
                disabled={currentPage === 1} 
                onClick={() => { setCurrentPage(v => v-1); setAnnouncement(`Halaman ${currentPage - 1}`); }} 
                className="rounded-xl border-4 border-slate-900 p-3 transition-all hover:bg-slate-900 hover:text-white disabled:opacity-20"
                aria-label="Halaman Sebelumnya"
              >
                <ChevronLeft size={20}/>
              </button>
              <div className="flex items-center px-4 text-xs font-black uppercase italic">
                {currentPage} / {totalPages}
              </div>
              <button 
                disabled={currentPage === totalPages} 
                onClick={() => { setCurrentPage(v => v+1); setAnnouncement(`Halaman ${currentPage + 1}`); }} 
                className="rounded-xl border-4 border-slate-900 p-3 transition-all hover:bg-slate-900 hover:text-white disabled:opacity-20"
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
        <p className="mt-1 text-3xl font-black italic">{val}</p>
      </div>
      <div className="absolute -bottom-2 -right-2 scale-150">
        {icon}
      </div>
    </div>
  )
}

function ActionButton({ icon, label, onClick, color }: any) {
  return (
    <button 
      onClick={onClick} 
      className={`flex items-center gap-2 rounded-xl bg-slate-100 px-3 py-2 text-[8px] font-black uppercase text-slate-600 transition-all hover:text-white ${color}`}
      aria-label={label}
    >
      {icon} <span className="hidden sm:inline">{label}</span>
    </button>
  )
}