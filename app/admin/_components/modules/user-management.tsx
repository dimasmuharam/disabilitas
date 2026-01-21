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

  // --- LOGIC: FILTERING & STATS (Unified Auth Data) ---
  const filteredData = useMemo(() => {
    return allUsers.filter((u: any) => {
      // Mengambil data dari metadata jika tidak ada di level root (Skema Auth Supabase)
      const name = (u.user_metadata?.full_name || u.user_metadata?.name || u.email || "").toLowerCase();
      const email = (u.email || "").toLowerCase();
      const role = (u.user_metadata?.role || "talent");
      const location = (u.user_metadata?.city || u.user_metadata?.location || "Global").toLowerCase();
      
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
      setAnnouncement("Pilihan dibatalkan");
    } else {
      setSelectedIds(paginatedData.map((u: any) => u.id));
      setAnnouncement(`${paginatedData.length} user dipilih`);
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

  const exportToExcel = () => {
    const data = filteredData.map((u: any) => ({
      ID: u.id,
      Nama: u.user_metadata?.full_name || u.user_metadata?.name || "N/A",
      Email: u.email,
      Role: u.user_metadata?.role || "talent",
      Status_Konfirmasi: u.email_confirmed_at ? "Confirmed" : "Pending"
    }));
    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Users");
    XLSX.writeFile(wb, "Data_User_Auth.xlsx");
  };

  return (
    <section className="space-y-6" role="region" aria-label="Identity Management System">
      <div className="sr-only" role="status" aria-live="polite">{announcement}</div>

      {/* 1. STATS - Menampilkan semua Role Utama */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard label="Total User" val={stats.total} bg="bg-slate-900" icon={<Users />} />
        <StatCard label="Talenta" val={stats.talent} bg="bg-blue-600" icon={<Users />} />
        <StatCard label="Mitra Bisnis" val={stats.company + stats.partner} bg="bg-indigo-600" icon={<Building2 />} />
        <StatCard label="Pending" val={stats.unconfirmed} bg="bg-rose-600" icon={<MailWarning />} />
      </div>

      <div className="rounded-[3.5rem] border-4 border-slate-900 bg-white p-6 shadow-[12px_12px_0px_0px_rgba(15,23,42,1)] md:p-10">
        
        {/* 2. FILTERS */}
        <div className="flex flex-col gap-6 border-b-4 border-slate-50 pb-8 lg:flex-row lg:items-center">
          <div className="relative flex-1">
            <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
            <input 
              placeholder="Cari Identitas (Nama/Email)..." 
              className="w-full rounded-3xl border-4 border-slate-900 py-4 pl-14 pr-6 text-sm font-black uppercase outline-none focus:ring-8 focus:ring-blue-50"
              value={query}
              onChange={(e) => { setQuery(e.target.value); setCurrentPage(1); }}
            />
          </div>
          
          <div className="flex flex-wrap gap-3">
            <select 
              aria-label="Pilih Role"
              className="rounded-2xl border-4 border-slate-900 bg-white px-4 py-3 text-[10px] font-black uppercase outline-none"
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
            >
              <option value="all">Semua Role</option>
              <option value="talent">Talent</option>
              <option value="company">Company</option>
              <option value="partner">Partner</option>
              <option value="campus">Campus</option>
              <option value="government">Government</option>
            </select>

            <select 
              aria-label="Pilih Status"
              className="rounded-2xl border-4 border-slate-900 bg-white px-4 py-3 text-[10px] font-black uppercase outline-none"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="all">Semua Status</option>
              <option value="confirmed">Sudah Konfirmasi</option>
              <option value="unconfirmed">Belum Konfirmasi</option>
            </select>

            <button onClick={exportToExcel} className="rounded-2xl bg-emerald-600 p-3 text-white shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-y-1 hover:shadow-none transition-all">
              <Download size={20}/>
            </button>
          </div>
        </div>

        {/* 3. BULK ACTIONS */}
        <div className="flex items-center justify-between py-6">
          <label className="flex items-center gap-3 cursor-pointer group">
            <input 
              type="checkbox" 
              className="size-6 rounded-lg border-4 border-slate-900 accent-blue-600"
              checked={selectedIds.length === paginatedData.length && paginatedData.length > 0}
              onChange={toggleSelectAll}
            />
            <span className="text-[10px] font-black uppercase italic text-slate-400 group-hover:text-slate-900">Pilih Halaman Ini</span>
          </label>

          {selectedIds.length > 0 && (
            <div className="flex gap-2">
              <button onClick={() => onAction("BULK_RESEND", selectedIds)} className="rounded-xl bg-amber-500 px-4 py-2 text-[9px] font-black uppercase text-white shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">Kirim Ulang Email ({selectedIds.length})</button>
              <button onClick={() => onAction("BULK_DELETE", selectedIds)} className="rounded-xl bg-rose-600 px-4 py-2 text-[9px] font-black uppercase text-white shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">Hapus Massal</button>
            </div>
          )}
        </div>

        {/* 4. USER LIST (Auth Table Style) */}
        <div className="space-y-4" role="list">
          {paginatedData.map((user: any) => {
            const role = user.user_metadata?.role || 'talent';
            const name = user.user_metadata?.full_name || user.user_metadata?.name || "No Name Set";
            
            return (
              <div 
                key={user.id} 
                role="listitem"
                className={cn(
                  "flex flex-col gap-4 rounded-3xl border-4 border-slate-900 p-5 lg:flex-row lg:items-center lg:justify-between transition-all",
                  selectedIds.includes(user.id) ? "bg-blue-50 border-blue-600" : "bg-white"
                )}
              >
                <div className="flex items-center gap-5">
                  <input 
                    type="checkbox" 
                    aria-label={`Pilih ${name}`}
                    className="size-6 cursor-pointer rounded-lg border-4 border-slate-900 accent-blue-600"
                    checked={selectedIds.includes(user.id)}
                    onChange={() => toggleSelectOne(user.id)}
                  />
                  
                  <div className="text-left">
                    <div className="flex items-center gap-2">
                      <h4 className="text-sm font-black uppercase text-slate-900">{name}</h4>
                      <a href={getPublicLink(user)} target="_blank" className="text-slate-300 hover:text-blue-600" aria-label="Buka Profil">
                        <ExternalLink size={14} />
                      </a>
                      {user.email_confirmed_at ? 
                        <CheckCircle size={16} className="text-emerald-500" aria-label="Confirmed" /> : 
                        <MailWarning size={16} className="text-rose-500" aria-label="Unconfirmed" />
                      }
                    </div>
                    <p className="text-[11px] font-bold text-slate-500">{user.email}</p>
                    <div className="mt-1 flex items-center gap-2">
                      <span className="rounded-md bg-slate-100 border border-slate-200 px-2 py-0.5 text-[8px] font-black uppercase text-slate-600 italic">
                        {role}
                      </span>
                      <span className="text-[9px] font-bold text-slate-400">ID: {user.id.substring(0,8)}...</span>
                    </div>
                  </div>
                </div>

                {/* ACTION BUTTONS */}
                <div className="flex flex-wrap items-center gap-2 pt-4 border-t-2 border-slate-50 lg:pt-0 lg:border-t-0">
                  {!user.email_confirmed_at && (
                    <ActionButton 
                      icon={<RotateCcw size={12}/>} 
                      label="Resend Link" 
                      onClick={() => onAction("RESEND_CONFIRMATION", user.email)} 
                      color="bg-rose-50 text-rose-700 hover:bg-rose-600 hover:text-white" 
                    />
                  )}
                  <ActionButton icon={<Key size={12}/>} label="Reset PW" onClick={() => onAction("RESET_PASSWORD", user.email)} color="hover:bg-amber-500" />
                  <ActionButton icon={<MailCheck size={12}/>} label="Force Confirm" onClick={() => onAction("FORCE_CONFIRM", user.id)} color="hover:bg-emerald-500" />
                  <ActionButton icon={<Ban size={12}/>} label="Suspend" onClick={() => onAction("SUSPEND", user.id)} color="hover:bg-slate-900" />
                  <button onClick={() => onAction("DELETE_USER", user.id)} className="p-2 ml-2 text-slate-300 hover:text-rose-600 transition-all">
                    <Trash2 size={20} />
                  </button>
                </div>
              </div>
            )
          })}
        </div>

        {/* 5. PAGINATION */}
        {totalPages > 1 && (
          <nav className="mt-10 flex items-center justify-between border-t-4 border-slate-50 pt-8">
            <p className="text-[10px] font-black uppercase text-slate-400">Total {filteredData.length} Users</p>
            <div className="flex gap-2">
              <button disabled={currentPage === 1} onClick={() => setCurrentPage(v => v-1)} className="p-3 border-4 border-slate-900 rounded-xl disabled:opacity-20 hover:bg-slate-900 hover:text-white transition-all">
                <ChevronLeft size={20}/>
              </button>
              <div className="flex items-center px-4 text-xs font-black italic">{currentPage} / {totalPages}</div>
              <button disabled={currentPage === totalPages} onClick={() => setCurrentPage(v => v+1)} className="p-3 border-4 border-slate-900 rounded-xl disabled:opacity-20 hover:bg-slate-900 hover:text-white transition-all">
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
      <div className="absolute -right-2 -bottom-2 scale-150 opacity-20 transform rotate-12">
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
        "flex items-center gap-2 rounded-xl bg-slate-50 px-3 py-2 text-[8px] font-black uppercase text-slate-600 transition-all hover:text-white border border-slate-200",
        color
      )}
    >
      {icon} <span className="hidden sm:inline">{label}</span>
    </button>
  )
}