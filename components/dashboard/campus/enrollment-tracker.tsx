"use client";

import React, { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
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
  const [enrollments, setEnrollments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState("applied");

  useEffect(() => {
    fetchEnrollments();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [partnerId, filterStatus]);

  async function fetchEnrollments() {
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
  }

  async function updateStatus(id: string, newStatus: string) {
    const { error } = await supabase
      .from("trainees")
      .update({ status: newStatus, updated_at: new Date() })
      .eq("id", id);

    if (!error) fetchEnrollments();
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* HEADER & FILTER */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-2xl font-black uppercase italic tracking-tighter text-slate-900">Seleksi Pendaftar</h2>
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Kelola pendaftaran talenta ke program Anda</p>
        </div>

        <div className="flex gap-2 p-1 bg-slate-100 rounded-2xl">
          {["applied", "accepted", "rejected"].map((s) => (
            <button
              key={s}
              onClick={() => setFilterStatus(s)}
              className={`px-6 py-2 rounded-xl text-[9px] font-black uppercase transition-all ${
                filterStatus === s ? "bg-white text-slate-900 shadow-sm" : "text-slate-400 hover:text-slate-600"
              }`}
            >
              {s === 'applied' ? 'Menunggu' : s === 'accepted' ? 'Diterima' : 'Ditolak'}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="p-20 text-center font-black animate-pulse text-slate-300 uppercase italic">Memuat Pendaftar...</div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {enrollments.length > 0 ? enrollments.map((item) => (
            <div key={item.id} className="bg-white p-8 rounded-[3rem] border-2 border-slate-50 shadow-sm hover:border-slate-200 transition-all flex flex-col lg:flex-row gap-8 items-start lg:items-center">
              
              {/* Info Talenta & Program */}
              <div className="flex-1 space-y-4">
                <div className="flex items-center gap-3">
                  <div className="bg-blue-600 text-white p-3 rounded-2xl">
                    <GraduationCap size={20} />
                  </div>
                  <div>
                    <h4 className="font-black uppercase italic tracking-tighter text-slate-900 text-xl leading-none">
                      {item.profiles?.full_name}
                    </h4>
                    <p className="text-[10px] font-black text-blue-600 uppercase tracking-widest mt-1">
                      Mendaftar: {item.trainings?.title}
                    </p>
                  </div>
                </div>

                {/* Badge Riset: Beasiswa & Disabilitas */}
                <div className="flex flex-wrap gap-2">
                  <span className="bg-slate-100 text-slate-600 px-3 py-1 rounded-full text-[9px] font-black uppercase border border-slate-200">
                    {item.profiles?.disability_type}
                  </span>
                  <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase border ${
                    item.profiles?.scholarship_type === 'Tanpa Beasiswa (Mandiri)' 
                    ? "bg-orange-50 text-orange-600 border-orange-100" 
                    : "bg-emerald-50 text-emerald-600 border-emerald-100"
                  }`}>
                    {item.profiles?.scholarship_type || "Bukan Penerima Beasiswa"}
                  </span>
                </div>
              </div>

              {/* Data Kontak & Skills */}
              <div className="hidden xl:block w-64 border-l border-slate-100 pl-8 space-y-2">
                 <p className="text-[9px] font-black uppercase text-slate-400">Kontak Talenta</p>
                 <div className="flex items-center gap-2 text-xs font-bold text-slate-700">
                   <Mail size={12}/> {item.profiles?.email?.substring(0, 15)}...
                 </div>
                 <div className="flex items-center gap-2 text-xs font-bold text-slate-700">
                   <Phone size={12}/> {item.profiles?.phone || '-'}
                 </div>
              </div>

              {/* Aksi Persetujuan */}
              <div className="flex items-center gap-2 w-full lg:w-auto pt-4 lg:pt-0 border-t lg:border-t-0 border-slate-100">
                {filterStatus === "applied" && (
                  <>
                    <button 
                      onClick={() => updateStatus(item.id, "accepted")}
                      className="flex-1 lg:flex-none flex items-center justify-center gap-2 bg-slate-900 text-white px-6 py-4 rounded-2xl text-[9px] font-black uppercase tracking-widest hover:bg-emerald-600 transition-all shadow-lg"
                    >
                      <CheckCircle size={14} /> Terima
                    </button>
                    <button 
                      onClick={() => updateStatus(item.id, "rejected")}
                      className="flex-1 lg:flex-none flex items-center justify-center gap-2 bg-white border-2 border-slate-100 text-slate-400 px-6 py-4 rounded-2xl text-[9px] font-black uppercase tracking-widest hover:text-red-500 hover:border-red-100 transition-all"
                    >
                      <XCircle size={14} /> Tolak
                    </button>
                  </>
                )}
                {filterStatus !== "applied" && (
                  <span className="text-[9px] font-black uppercase text-slate-300 italic">Sudah Diproses pada {new Date(item.updated_at).toLocaleDateString('id-ID')}</span>
                )}
              </div>
            </div>
          )) : (
            <div className="p-20 text-center border-4 border-dashed border-slate-100 rounded-[4rem]">
              <p className="text-slate-300 font-black uppercase italic tracking-tighter">Tidak ada pendaftar dalam kategori ini.</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
