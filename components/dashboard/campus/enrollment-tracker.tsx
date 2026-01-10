"use client";

import React, { useState, useEffect, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import { 
  Users, CheckCircle, XCircle, Search, 
  Filter, ArrowLeft, GraduationCap, 
  Mail, Phone, FileText, BadgeInfo
} from "lucide-react";

interface EnrollmentTrackerProps {
  partnerId: string;
  onBack: () => void;
}

export default function EnrollmentTracker({ partnerId, onBack }: EnrollmentTrackerProps) {
  const supabase = createClient();
  const [enrollments, setEnrollments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState("applied");

  const fetchEnrollments = useCallback(async () => {
    setLoading(true);
    // Kita join ke tabel trainings untuk ambil judul program 
    // dan ke tabel profiles untuk ambil data talenta
    const { data, error } = await supabase
      .from("trainees")
      .select(`
        *,
        trainings (title, category),
        profiles (full_name, email, phone, disability_type, scholarship_type, skills)
      `)
      .eq("partner_id", partnerId)
      .eq("status", filterStatus)
      .order("applied_at", { ascending: false });

    if (data) setEnrollments(data);
    setLoading(false);
  }, [partnerId, filterStatus, supabase]);

  useEffect(() => {
    fetchEnrollments();
  }, [fetchEnrollments]);

  async function updateStatus(id: string, newStatus: string) {
    const { error } = await supabase
      .from("trainees")
      .update({ status: newStatus, updated_at: new Date() })
      .eq("id", id);

    if (!error) fetchEnrollments();
  }

  return (
    <div className="space-y-8 duration-500 animate-in fade-in">
      {/* HEADER & FILTER */}
      <div className="flex flex-col items-start justify-between gap-4 md:flex-row md:items-center">
        <div>
          <h2 className="text-2xl font-black uppercase italic tracking-tighter text-slate-900">Seleksi Pendaftar</h2>
          <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Kelola pendaftaran talenta ke program Anda</p>
        </div>

        <div className="flex gap-2 rounded-2xl bg-slate-100 p-1">
          {["applied", "accepted", "rejected"].map((s) => (
            <button
              key={s}
              onClick={() => setFilterStatus(s)}
              className={`rounded-xl px-6 py-2 text-[9px] font-black uppercase transition-all ${
                filterStatus === s ? "bg-white text-slate-900 shadow-sm" : "text-slate-400 hover:text-slate-600"
              }`}
            >
              {s === 'applied' ? 'Menunggu' : s === 'accepted' ? 'Diterima' : 'Ditolak'}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="animate-pulse p-20 text-center font-black uppercase italic text-slate-300">Memuat Pendaftar...</div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {enrollments.length > 0 ? enrollments.map((item) => (
            <div key={item.id} className="flex flex-col items-start gap-8 rounded-[3rem] border-2 border-slate-50 bg-white p-8 shadow-sm transition-all hover:border-slate-200 lg:flex-row lg:items-center">
              
              {/* Info Talenta & Program */}
              <div className="flex-1 space-y-4">
                <div className="flex items-center gap-3">
                  <div className="rounded-2xl bg-blue-600 p-3 text-white">
                    <GraduationCap size={20} />
                  </div>
                  <div>
                    <h4 className="text-xl font-black uppercase italic leading-none tracking-tighter text-slate-900">
                      {item.profiles?.full_name}
                    </h4>
                    <p className="mt-1 text-[10px] font-black uppercase tracking-widest text-blue-600">
                      Mendaftar: {item.trainings?.title}
                    </p>
                  </div>
                </div>

                {/* Badge Riset: Beasiswa & Disabilitas */}
                <div className="flex flex-wrap gap-2">
                  <span className="rounded-full border border-slate-200 bg-slate-100 px-3 py-1 text-[9px] font-black uppercase text-slate-600">
                    {item.profiles?.disability_type}
                  </span>
                  <span className={`rounded-full border px-3 py-1 text-[9px] font-black uppercase ${
                    item.profiles?.scholarship_type === 'Tanpa Beasiswa (Mandiri)' 
                    ? "border-orange-100 bg-orange-50 text-orange-600" 
                    : "border-emerald-100 bg-emerald-50 text-emerald-600"
                  }`}>
                    {item.profiles?.scholarship_type || "Bukan Penerima Beasiswa"}
                  </span>
                </div>
              </div>

              {/* Data Kontak & Skills */}
              <div className="hidden w-64 space-y-2 border-l border-slate-100 pl-8 xl:block">
                 <p className="text-[9px] font-black uppercase text-slate-400">Kontak Talenta</p>
                 <div className="flex items-center gap-2 text-xs font-bold text-slate-700">
                   <Mail size={12}/> {item.profiles?.email?.substring(0, 15)}...
                 </div>
                 <div className="flex items-center gap-2 text-xs font-bold text-slate-700">
                   <Phone size={12}/> {item.profiles?.phone || '-'}
                 </div>
              </div>

              {/* Aksi Persetujuan */}
              <div className="flex w-full items-center gap-2 border-t border-slate-100 pt-4 lg:w-auto lg:border-t-0 lg:pt-0">
                {filterStatus === "applied" && (
                  <>
                    <button 
                      onClick={() => updateStatus(item.id, "accepted")}
                      className="flex flex-1 items-center justify-center gap-2 rounded-2xl bg-slate-900 px-6 py-4 text-[9px] font-black uppercase tracking-widest text-white shadow-lg transition-all hover:bg-emerald-600 lg:flex-none"
                    >
                      <CheckCircle size={14} /> Terima
                    </button>
                    <button 
                      onClick={() => updateStatus(item.id, "rejected")}
                      className="flex flex-1 items-center justify-center gap-2 rounded-2xl border-2 border-slate-100 bg-white px-6 py-4 text-[9px] font-black uppercase tracking-widest text-slate-400 transition-all hover:border-red-100 hover:text-red-500 lg:flex-none"
                    >
                      <XCircle size={14} /> Tolak
                    </button>
                  </>
                )}
                {filterStatus !== "applied" && (
                  <span className="text-[9px] font-black uppercase italic text-slate-300">Sudah Diproses pada {new Date(item.updated_at).toLocaleDateString('id-ID')}</span>
                )}
              </div>
            </div>
          )) : (
            <div className="rounded-[4rem] border-4 border-dashed border-slate-100 p-20 text-center">
              <p className="font-black uppercase italic tracking-tighter text-slate-300">Tidak ada pendaftar dalam kategori ini.</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
