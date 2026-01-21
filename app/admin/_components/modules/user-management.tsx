"use client"

import React, { useState, useMemo } from "react"
import { 
  Users, Search, ShieldCheck, Building2, GraduationCap, 
  Landmark, Briefcase, Trash2, CheckCircle, 
  ChevronLeft, ChevronRight, Key, Ban, 
  MailCheck, Download, FileText, MapPin, ExternalLink
} from "lucide-react"
import * as XLSX from "xlsx"
import jsPDF from "jspdf"
import autoTable from "jspdf-autotable"

export default function UserManagement({ allUsers = [], onAction }: any) {
  const [query, setQuery] = useState("")
  const [roleFilter, setRoleFilter] = useState("all")
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 10

  // --- LOGIC: FILTERING ---
  const filteredData = useMemo(() => {
    return allUsers.filter((u: any) => {
      const name = (u.full_name || u.name || "").toLowerCase();
      const email = (u.email || "").toLowerCase();
      const location = (u.city || u.location || "").toLowerCase();
      const matchQuery = name.includes(query.toLowerCase()) || 
                         email.includes(query.toLowerCase()) || 
                         location.includes(query.toLowerCase());
      const matchRole = roleFilter === "all" || u.role === roleFilter;
      return matchQuery && matchRole;
    });
  }, [allUsers, query, roleFilter]);

  const totalPages = Math.ceil(filteredData.length / itemsPerPage);
  const paginatedData = filteredData.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  // --- EXPORT EXCEL ---
  const exportToExcel = () => {
    const dataToExport = filteredData.map((u: any) => ({
      Nama: u.full_name || u.name,
      Email: u.email,
      Role: u.role.toUpperCase(),
      Lokasi: u.city || u.location || "N/A",
      Status: u.is_verified ? "Verified" : "Pending",
    }));
    const worksheet = XLSX.utils.json_to_sheet(dataToExport);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Data_User");
    XLSX.writeFile(workbook, `Ekosistem_Disabilitas_Export.xlsx`);
  };

  // --- EXPORT PDF (JSPDF) ---
  const exportToPDF = () => {
    const doc = new jsPDF();
    doc.text("Laporan Ekosistem Talenta Disabilitas", 14, 15);
    const tableData = filteredData.map((u: any) => [
      u.full_name || u.name,
      u.role.toUpperCase(),
      u.email,
      u.city || u.location || "-"
    ]);
    autoTable(doc, {
      head: [["Nama", "Role", "Email", "Lokasi"]],
      body: tableData,
      startY: 20,
      theme: 'grid',
      headStyles: { fillColor: [15, 23, 42] }
    });
    doc.save("Laporan_User_Ekosistem.pdf");
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
    <section className="space-y-6" role="region" aria-label="User Auth & Profile Management">
      
      {/* 1. STATS */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-4">
        <StatCard label="Total User" val={allUsers.length} bg="bg-slate-900" />
        <StatCard label="Talenta" val={allUsers.filter((u:any)=>u.role==='talent').length} bg="bg-blue-600" />
        <StatCard label="Instansi/Bisnis" val={allUsers.filter((u:any)=>u.role==='company').length} bg="bg-indigo-600" />
        <StatCard label="Lainnya" val={allUsers.filter((u:any)=>!['talent', 'company'].includes(u.role)).length} bg="bg-slate-500" />
      </div>

      <div className="rounded-[3.5rem] border-4 border-slate-900 bg-white p-8 shadow-[12px_12px_0px_0px_rgba(15,23,42,1)]">
        
        {/* 2. FILTERS & EXPORTS */}
        <div className="flex flex-col gap-6 border-b-4 border-slate-50 pb-8 lg:flex-row lg:items-center">
          <div className="relative flex-1">
            <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400" size={20}/>
            <input 
              placeholder="Cari Nama, Email, atau Lokasi..." 
              className="w-full rounded-3xl border-4 border-slate-900 py-4 pl-14 pr-6 text-sm font-black uppercase outline-none focus:ring-8 focus:ring-blue-50"
              value={query}
              onChange={(e) => { setQuery(e.target.value); setCurrentPage(1); }}
            />
          </div>
          
          <div className="flex flex-wrap gap-3">
            <select 
              className="rounded-2xl border-4 border-slate-900 bg-white px-6 py-3 text-[10px] font-black uppercase outline-none"
              value={roleFilter}
              onChange={(e) => { setRoleFilter(e.target.value); setCurrentPage(1); }}
            >
              <option value="all">Semua Tipe User</option>
              <option value="talent">Talenta</option>
              <option value="company">Perusahaan</option>
              <option value="campus">Kampus</option>
              <option value="partner">Mitra</option>
              <option value="government">Pemerintah</option>
            </select>

            <button onClick={exportToExcel} className="flex items-center gap-2 rounded-2xl bg-emerald-600 px-6 py-3 text-[10px] font-black uppercase text-white hover:bg-emerald-700 shadow-[4px_4px_0px_0px_rgba(6,95,70,1)] transition-all">
              <Download size={16}/> Excel
            </button>
            <button onClick={exportToPDF} className="flex items-center gap-2 rounded-2xl bg-slate-900 px-6 py-3 text-[10px] font-black uppercase text-white hover:bg-slate-800 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-all">
              <FileText size={16}/> PDF
            </button>
          </div>
        </div>

        {/* 3. USER LIST */}
        <div className="mt-8 space-y-4">
          {paginatedData.map((user: any) => (
            <div key={user.id} className="group flex flex-col gap-4 rounded-3xl border-4 border-slate-900 p-6 bg-white hover:bg-slate-50 transition-all lg:flex-row lg:items-center lg:justify-between text-left">
              
              <div className="flex items-center gap-5">
                <div className="hidden size-12 items-center justify-center rounded-2xl bg-slate-900 text-white font-black sm:flex uppercase italic">
                  {user.role?.[0] || "U"}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm font-black uppercase text-slate-900">
                      {user.full_name || user.name || "Unnamed"}
                    </h3>
                    <a 
                      href={`/${user.role}/${user.id}`} 
                      target="_blank" 
                      className="text-slate-300 hover:text-blue-600 transition-colors"
                      title="Lihat Profil Publik"
                    >
                      <ExternalLink size={14} />
                    </a>
                    {user.is_verified && <CheckCircle size={14} className="text-emerald-500" />}
                  </div>
                  <div className="flex gap-2 mt-1">
                    <span className="flex items-center gap-1 rounded-lg bg-slate-100 px-2 py-0.5 text-[8px] font-black uppercase italic text-slate-500 border border-slate-200">
                      {getRoleIcon(user.role)} {user.role}
                    </span>
                    <span className="text-[10px] font-bold text-slate-400 flex items-center gap-1">
                      <MapPin size={10}/> {user.city || user.location || "N/A"}
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-2 border-t-2 border-slate-50 pt-4 lg:border-t-0 lg:pt-0">
                <ActionButton icon={<Key size={12}/>} label="Reset" onClick={() => onAction("RESET_PASSWORD", user.email)} color="hover:bg-amber-500" />
                <ActionButton icon={<MailCheck size={12}/>} label="Verify" onClick={() => onAction("VERIFY_EMAIL", user.id)} color="hover:bg-emerald-500" />
                <ActionButton icon={<Ban size={12}/>} label="Ban" onClick={() => onAction("SUSPEND_USER", user.id)} color="hover:bg-slate-800" />
                <button onClick={() => onAction("DELETE_USER", user.id)} className="ml-2 p-2 text-slate-300 hover:text-rose-600 transition-all">
                  <Trash2 size={20} />
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* 4. PAGINATION */}
        {totalPages > 1 && (
          <div className="mt-10 flex items-center justify-between border-t-4 border-slate-50 pt-8">
            <p className="text-[10px] font-black uppercase text-slate-400">Page {currentPage} of {totalPages}</p>
            <div className="flex gap-2">
              <button disabled={currentPage === 1} onClick={() => setCurrentPage(v => v-1)} className="p-3 border-4 border-slate-900 rounded-xl disabled:opacity-20 hover:bg-slate-900 hover:text-white transition-all"><ChevronLeft size={18}/></button>
              <button disabled={currentPage === totalPages} onClick={() => setCurrentPage(v => v+1)} className="p-3 border-4 border-slate-900 rounded-xl disabled:opacity-20 hover:bg-slate-900 hover:text-white transition-all"><ChevronRight size={18}/></button>
            </div>
          </div>
        )}
      </div>
    </section>
  )
}

function StatCard({ label, val, bg }: any) {
  return (
    <div className={`rounded-[2.5rem] border-4 border-slate-900 ${bg} p-8 text-white shadow-[8px_8px_0px_0px_rgba(15,23,42,1)]`}>
      <p className="text-[10px] font-black uppercase opacity-60 text-left">{label}</p>
      <p className="text-4xl font-black italic text-left">{val}</p>
    </div>
  )
}

function ActionButton({ icon, label, onClick, color }: any) {
  return (
    <button onClick={onClick} className={`flex items-center gap-2 rounded-xl bg-slate-100 px-3 py-2 text-[8px] font-black uppercase text-slate-600 transition-all hover:text-white ${color}`}>
      {icon} {label}
    </button>
  )
}