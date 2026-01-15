"use client";

import React, { useState, useEffect, useCallback } from "react";
import { supabase } from "@/lib/supabase";
import { 
  Users, Search, FileDown, ExternalLink, CheckCircle, XCircle, 
  Clock, Activity, Download, CheckSquare, Square
} from "lucide-react";

// Import helper dari file terpisah
import { exportApplicantsToExcel, generateProfessionalCV } from "./export-helpers";

export default function ApplicantTracker({ company }: { company: any }) {
  const [loading, setLoading] = useState(true);
  const [applicants, setApplicants] = useState<any[]>([]);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [filterJob, setFilterJob] = useState("all");
  
  // State untuk Toast Aksesibel & Modal
  const [toast, setToast] = useState<{ msg: string; type: "success" | "error" | null }>({ msg: "", type: null });
  const [noteModal, setNoteModal] = useState({ isOpen: false, appId: "", name: "", status: "" });
  const [hrdNote, setHrdNote] = useState("");

  const fetchApplicants = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("applications")
      .select(`*, jobs(id, title), profiles(*)`)
      .eq("company_id", company.id)
      .order("created_at", { ascending: false });

    if (!error) setApplicants(data || []);
    setLoading(false);
  }, [company?.id]);

  useEffect(() => {
    if (company?.id) fetchApplicants();
  }, [company?.id, fetchApplicants]);

  const showToast = (msg: string, type: "success" | "error") => {
    setToast({ msg, type });
    setTimeout(() => setToast({ msg: "", type: null }), 5000);
  };

  const handleUpdateStatus = async (appId: string, newStatus: string, note?: string) => {
    const { error } = await supabase
      .from("applications")
      .update({ status: newStatus, hrd_notes: note || null })
      .eq("id", appId);
      
    if (!error) {
      showToast(`Berhasil memperbarui status ke ${newStatus}`, "success");
      setNoteModal({ isOpen: false, appId: "", name: "", status: "" });
      setHrdNote("");
      fetchApplicants();
    }
  };

  const handleBulkUpdate = async (newStatus: string) => {
    const { error } = await supabase
      .from("applications")
      .update({ status: newStatus })
      .in("id", selectedIds);
      
    if (!error) {
      showToast(`${selectedIds.length} pelamar berhasil diperbarui`, "success");
      setSelectedIds([]);
      fetchApplicants();
    }
  };

  const toggleSelect = (id: string) => {
    setSelectedIds(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
  };

  const filteredApplicants = applicants.filter(app => {
    const matchSearch = app.profiles?.full_name?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchStatus = filterStatus === "all" || app.status === filterStatus;
    const matchJob = filterJob === "all" || app.jobs?.title === filterJob;
    return matchSearch && matchStatus && matchJob;
  });

  if (loading) return <div role="status" className="p-20 text-center font-black animate-pulse text-slate-400 uppercase italic">Menyinkronkan Data Riset...</div>;

  return (
    <div className="mx-auto max-w-6xl space-y-8 pb-32 text-left">
      
      {/* ARIA-LIVE REGION: Memungkinkan screen reader membacakan notifikasi secara otomatis */}
      <div aria-live="polite" role="status" className="fixed bottom-10 right-10 z-[100]">
        {toast.msg && (
          <div className={`rounded-3xl border-4 p-6 font-black uppercase italic shadow-2xl animate-in slide-in-from-right-10 ${
            toast.type === "success" ? "border-slate-900 bg-emerald-500 text-white" : "border-slate-900 bg-red-500 text-white"
          }`}>
            {toast.msg}
          </div>
        )}
      </div>

      {/* Header & Export */}
      <div className="flex flex-col justify-between gap-6 md:flex-row md:items-center">
        <h2 className="text-2xl font-black uppercase italic tracking-tighter">
          <Users className="mr-2 inline text-blue-600" aria-hidden="true" /> Applicant Tracker
        </h2>
        <button 
          onClick={() => exportApplicantsToExcel(filteredApplicants, company.name)}
          aria-label="Unduh daftar komparasi pelamar dalam format CSV"
          className="rounded-2xl bg-slate-900 px-8 py-4 text-[10px] font-black uppercase italic text-white hover:bg-blue-600 transition-all focus:ring-4 focus:ring-blue-300"
        >
          <Download size={16} className="mr-2 inline" /> Export Komparasi (CSV)
        </button>
      </div>

      {/* Filter Bar */}
      <div className="grid gap-4 rounded-[2.5rem] border-2 border-slate-100 bg-white p-6 md:grid-cols-3">
        <div className="relative">
          <input 
            aria-label="Cari nama talenta"
            placeholder="CARI NAMA..." 
            className="w-full rounded-xl border-2 border-slate-50 bg-slate-50 px-6 py-3 text-[10px] font-black outline-none focus:border-slate-900"
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <select aria-label="Filter status" onChange={(e) => setFilterStatus(e.target.value)} className="rounded-xl border-2 border-slate-100 bg-white px-6 py-3 text-[10px] font-black uppercase">
          <option value="all">SEMUA STATUS</option>
          <option value="applied">BARU MASUK</option>
          <option value="interview">INTERVIEW</option>
          <option value="hired">DITERIMA KERJA</option>
          <option value="rejected">DITOLAK</option>
        </select>
        <select aria-label="Filter lowongan" onChange={(e) => setFilterJob(e.target.value)} className="rounded-xl border-2 border-slate-100 bg-white px-6 py-3 text-[10px] font-black uppercase">
          <option value="all">SEMUA LOWONGAN</option>
          {Array.from(new Set(applicants.map(a => a.jobs?.title))).filter(Boolean).map(t => (
            <option key={t as string} value={t as string}>{t as string}</option>
          ))}
        </select>
      </div>

      {/* Bulk Action Bar */}
      {selectedIds.length > 0 && (
        <div className="flex items-center justify-between rounded-[2rem] bg-blue-600 p-6 text-white shadow-xl animate-in fade-in slide-in-from-top-4">
          <p className="text-[10px] font-black uppercase italic">{selectedIds.length} Pelamar Terpilih</p>
          <div className="flex gap-2">
            <button onClick={() => handleBulkUpdate('interview')} className="rounded-xl bg-white/20 px-4 py-2 text-[9px] font-black uppercase hover:bg-white/40">SET INTERVIEW</button>
            <button onClick={() => handleBulkUpdate('rejected')} className="rounded-xl bg-red-500 px-4 py-2 text-[9px] font-black uppercase hover:bg-red-600">REJECT SEMUA</button>
          </div>
        </div>
      )}

      {/* List Pelamar */}
      <div className="space-y-4" role="list">
        {filteredApplicants.map(app => {
          const p = app.profiles;
          const skills = Array.isArray(p?.skills) ? p.skills : [];
          
          return (
            <article key={app.id} className={`flex flex-col items-start gap-6 rounded-[3rem] border-2 p-8 transition-all md:flex-row md:items-center ${selectedIds.includes(app.id) ? 'border-blue-600 bg-blue-50/50 shadow-md' : 'border-slate-100 bg-white hover:border-slate-900'}`}>
              <div className="flex items-center shrink-0">
                <input 
                  type="checkbox"
                  id={`check-${app.id}`}
                  checked={selectedIds.includes(app.id)}
                  onChange={() => toggleSelect(app.id)}
                  className="peer sr-only"
                />
                <label 
                  htmlFor={`check-${app.id}`}
                  aria-label={`Pilih ${p?.full_name} untuk aksi massal`}
                  className="cursor-pointer text-slate-200 peer-checked:text-blue-600 transition-colors"
                >
                  {selectedIds.includes(app.id) ? <CheckSquare size={28} /> : <Square size={28} />}
                </label>
              </div>

              <div className="flex-1 space-y-1">
                <div className="flex items-center gap-3">
                  <h3 className="text-xl font-black uppercase italic text-slate-900">{p?.full_name}</h3>
                  <span className={`rounded-full px-3 py-1 text-[8px] font-black uppercase italic ${app.status === 'hired' ? 'bg-emerald-100 text-emerald-600' : app.status === 'rejected' ? 'bg-red-100 text-red-600' : 'bg-slate-100 text-slate-500'}`}>
                    {app.status}
                  </span>
                </div>
                <p className="text-[9px] font-black uppercase tracking-[0.2em] text-blue-600">{app.jobs?.title}</p>
                <div className="mt-4 rounded-2xl bg-slate-50 p-5 text-sm font-medium italic text-slate-700">
                  <p>Lulusan <strong>{p?.education_level} {p?.major}</strong> dari <strong>{p?.university}</strong> tahun <strong>{p?.graduation_date || "-"}</strong>.</p>
                  <p className="mt-1">Berdomisili di <strong>{p?.city || "Lokasi tidak diketahui"}</strong>.</p>
                  {skills.length > 0 && <p className="mt-2 text-[10px] uppercase not-italic opacity-60">Keahlian: {skills.join(", ")}</p>}
                </div>
              </div>

              <div className="flex w-full flex-wrap gap-2 md:w-auto md:flex-col">
                <div className="flex gap-2">
                  <button onClick={() => setNoteModal({ isOpen: true, appId: app.id, name: p?.full_name, status: 'interview' })} aria-label={`Jadwalkan interview untuk ${p?.full_name}`} className="flex-1 rounded-xl bg-orange-50 px-4 py-3 text-[9px] font-black uppercase text-orange-600 hover:bg-orange-600 hover:text-white transition-all">INTERVIEW</button>
                  <button onClick={() => setNoteModal({ isOpen: true, appId: app.id, name: p?.full_name, status: 'hired' })} aria-label={`Terima ${p?.full_name}`} className="flex-1 rounded-xl bg-emerald-50 px-4 py-3 text-[9px] font-black uppercase text-emerald-600 hover:bg-emerald-600 hover:text-white transition-all">HIRE</button>
                  <button onClick={() => setNoteModal({ isOpen: true, appId: app.id, name: p?.full_name, status: 'rejected' })} aria-label={`Tolak ${p?.full_name}`} className="flex-1 rounded-xl bg-red-50 px-4 py-3 text-[9px] font-black uppercase text-red-500 hover:bg-red-600 hover:text-white transition-all">REJECT</button>
                </div>
                <div className="flex gap-2">
                  <button onClick={() => generateProfessionalCV(app, company)} aria-label={`Unduh CV Audit ${p?.full_name}`} className="flex-1 rounded-xl bg-slate-50 p-3 text-slate-400 hover:text-blue-600 transition-all"><FileDown size={20} className="mx-auto" /></button>
                  <a href={`/talent/${p?.id}`} target="_blank" aria-label={`Profil lengkap ${p?.full_name}`} className="flex-1 rounded-xl bg-slate-50 p-3 text-slate-400 hover:text-slate-900 transition-all"><ExternalLink size={20} className="mx-auto" /></a>
                </div>
              </div>
            </article>
          );
        })}
      </div>

      {/* MODAL NOTE (Aksesibel Dialog) */}
      {noteModal.isOpen && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center bg-slate-900/80 backdrop-blur-sm p-4" role="dialog" aria-modal="true">
          <div className="w-full max-w-md rounded-[3rem] border-4 border-slate-900 bg-white p-10 shadow-2xl">
            <h2 className="text-xl font-black uppercase italic">Konfirmasi: {noteModal.status}</h2>
            <p className="mt-2 text-[10px] font-black uppercase italic text-slate-400">Target: {noteModal.name}</p>
            <textarea 
              autoFocus 
              className="mt-6 h-32 w-full rounded-2xl border-2 border-slate-100 bg-slate-50 p-4 text-sm font-medium italic outline-none focus:border-blue-600" 
              placeholder="Catatan HRD (Opsional)..." 
              value={hrdNote} 
              onChange={(e) => setHrdNote(e.target.value)} 
            />
            <div className="mt-6 flex gap-3">
              <button onClick={() => setNoteModal({ isOpen: false, appId: "", name: "", status: "" })} className="flex-1 rounded-xl border-2 border-slate-100 py-3 text-[10px] font-black uppercase">BATAL</button>
              <button onClick={() => handleUpdateStatus(noteModal.appId, noteModal.status, hrdNote)} className="flex-1 rounded-xl bg-slate-900 py-3 text-[10px] font-black uppercase italic text-white hover:bg-blue-600">KONFIRMASI</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}