"use client";

export const runtime = 'edge';

import React, { useState, useEffect, useRef } from "react";
import { supabase } from "@/lib/supabase";
import { notFound } from "next/navigation";
import { 
  Calendar, MapPin, BookOpen, ShieldCheck, 
  CheckCircle2, Clock, Users, ArrowLeft, 
  Zap, FileText, Share2, Building2,
  GraduationCap, ArrowRight, Star, Timer, Gem, Award,
  Accessibility, MessageCircle, LayoutDashboard
} from "lucide-react";
import Link from "next/link";

type PageProps = {
  params: { id: string };
};

export default function TrainingDetail({ params }: PageProps) {
  const [training, setTraining] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const successHeadingRef = useRef<HTMLHeadingElement>(null);

  const isUuid = (id: string) => /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(id);

  useEffect(() => {
    async function fetchData() {
      let query = supabase.from("trainings").select(`*, partners (*)`);
      if (isUuid(params.id)) { query = query.eq("id", params.id); } 
      else { query = query.eq("slug", params.id); }

      const { data, error } = await query.maybeSingle();
      if (error || !data) return notFound();
      setTraining(data);
      setLoading(false);
    }
    fetchData();
  }, [params.id]);

  // Fungsi Pendaftaran
  const handleRegister = async () => {
    setIsSubmitting(true);
    // Logika simulasi insert ke tabel trainees (sesuaikan dengan skema Mas nanti)
    // const { error } = await supabase.from("trainees").insert([...]);
    
    // Beri jeda sedikit untuk simulasi proses sistem
    setTimeout(() => {
      setIsSubmitting(false);
      setShowSuccess(true);
    }, 1000);
  };

  // Efek untuk memindahkan fokus kursor saat sukses
  useEffect(() => {
    if (showSuccess && successHeadingRef.current) {
      successHeadingRef.current.focus();
    }
  }, [showSuccess]);

  if (loading) return <div className="p-20 text-center font-black uppercase italic animate-pulse">Memuat Program...</div>;

  const partner = training.partners as any;
  const deadline = new Date(training.registration_deadline || '');
  const isExpired = deadline < new Date();

  // Inclusion Badge Logic
  const score = partner.inclusion_score || 0;
  let badgeConfig = {
    label: "Inclusive Entity",
    color: "text-orange-700 bg-orange-50 border-orange-200",
    icon: <ShieldCheck size={20} />
  };
  if (score >= 85) {
    badgeConfig = { label: "Inclusion Champion", color: "text-amber-700 bg-amber-50 border-amber-200", icon: <Gem size={20} /> };
  } else if (score >= 50) {
    badgeConfig = { label: "Inclusion Leader", color: "text-slate-700 bg-slate-50 border-slate-200", icon: <Award size={20} /> };
  }

  const parseArray = (data: any) => {
    if (!data) return [];
    if (Array.isArray(data)) return data;
    return [];
  };

  const accommodations = Array.from(new Set([
    ...parseArray(training.training_accommodations),
    ...parseArray(partner?.master_accommodations_provided)
  ]));

  // TAMPILAN SUKSES (AKSESIBEL)
  if (showSuccess) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-slate-900 p-6 text-center text-white">
        <div 
          className="max-w-2xl space-y-10 animate-in fade-in zoom-in duration-500"
          role="alert" 
          aria-live="assertive"
        >
          <div className="mx-auto flex size-24 items-center justify-center rounded-full bg-emerald-500 shadow-[0_0_50px_rgba(16,185,129,0.4)]">
            <CheckCircle2 size={48} />
          </div>
          
          <div className="space-y-4">
            <h1 
              ref={successHeadingRef}
              tabIndex={-1} // Agar bisa difokuskan secara programmatik
              className="text-4xl font-black uppercase italic tracking-tighter outline-none md:text-6xl"
            >
              Pendaftaran Berhasil!
            </h1>
            <p className="text-sm font-bold uppercase tracking-widest text-emerald-400">Data Anda telah terdaftar di sistem kami</p>
          </div>

          <div className="rounded-[3rem] border-2 border-slate-700 bg-slate-800/50 p-10 text-left space-y-6 shadow-2xl">
            <h2 className="flex items-center gap-3 text-xs font-black uppercase tracking-widest text-blue-400">
              <MessageCircle size={18} /> Instruksi Selanjutnya:
            </h2>
            <div className="text-xl font-medium leading-relaxed italic text-slate-200">
              {training.registration_instructions || "Silakan cek email Anda atau hubungi mitra penyelenggara untuk informasi lebih lanjut."}
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <Link 
              href="/dashboard/talent" 
              className="flex items-center justify-center gap-3 rounded-[2rem] bg-white py-6 text-xs font-black uppercase italic text-slate-900 transition-all hover:bg-blue-500 hover:text-white"
            >
              <LayoutDashboard size={18} /> Dashboard Saya
            </Link>
            <Link 
              href="/pelatihan" 
              className="flex items-center justify-center gap-3 rounded-[2rem] border-2 border-slate-700 py-6 text-xs font-black uppercase italic text-white transition-all hover:bg-slate-800"
            >
              Cari Pelatihan Lain
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // TAMPILAN DETAIL (NORMAL)
  return (
    <div className="min-h-screen bg-[#FDFDFD] pb-20 text-slate-900 font-sans text-left">
      <nav className="sticky top-0 z-50 border-b-2 border-slate-100 bg-white/90 p-4 backdrop-blur-md">
        <div className="mx-auto flex max-w-6xl items-center justify-between">
          <Link href="/pelatihan" aria-label="Kembali ke daftar pelatihan" className="flex items-center gap-2 text-[10px] font-black uppercase italic text-slate-400 hover:text-blue-600 transition-all">
            <ArrowLeft size={16} /> Kembali
          </Link>
          <button aria-label="Bagikan program ini" className="text-slate-400 hover:text-slate-900"><Share2 size={18} /></button>
        </div>
      </nav>

      <header className="border-b-4 border-slate-900 bg-white px-6 pt-16 pb-20 shadow-sm">
        <div className="mx-auto max-w-6xl text-left">
          <div className="flex flex-col items-start gap-12 lg:flex-row lg:items-center">
            <div className="shrink-0">
              <div className="flex size-28 items-center justify-center rounded-[2.5rem] bg-blue-600 text-white shadow-[8px_8px_0px_0px_rgba(15,23,42,1)] border-4 border-slate-900 animate-in zoom-in">
                <GraduationCap size={48} aria-hidden="true" />
              </div>
            </div>
            
            <div className="flex-1 space-y-6">
              <div className="flex flex-wrap gap-3">
                <span className="rounded-full bg-blue-50 border-2 border-blue-100 px-4 py-1 text-[10px] font-black uppercase tracking-widest text-blue-600">
                  {training.is_online ? "Daring (Online)" : "Luring (Offline)"}
                </span>
                <div className={`flex items-center gap-2 rounded-full border-2 px-4 py-1 text-[10px] font-black uppercase ${badgeConfig.color}`}>
                  {badgeConfig.icon} {badgeConfig.label}
                </div>
              </div>
              
              <h1 className="text-4xl font-black uppercase italic leading-[0.9] tracking-tighter md:text-6xl text-slate-900">
                {training.title}
              </h1>
              
              <div className="flex flex-wrap items-center gap-8 pt-2">
                <Link href={`/partner/${partner?.id}`} className="group flex items-center gap-3">
                  <div className="flex size-10 items-center justify-center rounded-xl bg-slate-900 text-white transition-all group-hover:bg-blue-600">
                    <Building2 size={18} />
                  </div>
                  <span className="text-sm font-black uppercase italic text-slate-900 border-b-2 border-slate-900/10 group-hover:border-blue-600">
                    {partner?.name}
                  </span>
                </Link>
                <div className="flex items-center gap-2 text-xs font-bold uppercase text-slate-400">
                  <MapPin size={18} className="text-blue-600" /> {training.location || "Lokasi Global"}
                </div>
              </div>
            </div>

            <div className="w-full lg:w-auto">
              {!isExpired ? (
                <button 
                  onClick={handleRegister}
                  disabled={isSubmitting}
                  aria-label={isSubmitting ? "Sedang memproses pendaftaran" : "Daftar pelatihan sekarang"} 
                  className="group w-full rounded-[2rem] border-4 border-slate-900 bg-slate-900 px-12 py-8 text-sm font-black uppercase italic tracking-widest text-white shadow-[10px_10px_0px_0px_rgba(37,99,235,1)] transition-all hover:bg-blue-600 hover:shadow-none hover:translate-x-1 hover:translate-y-1 disabled:opacity-50"
                >
                  {isSubmitting ? "MEMPROSES..." : <>DAFTAR SEKARANG <ArrowRight size={20} className="inline ml-2 transition-transform group-hover:translate-x-2" /></>}
                </button>
              ) : (
                <div className="rounded-[2rem] border-4 border-slate-200 bg-slate-50 px-12 py-8 text-center text-xs font-black uppercase italic text-slate-400">
                  Pendaftaran Ditutup
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-6 py-20 text-left">
        <div className="grid grid-cols-1 gap-16 lg:grid-cols-3">
          <div className="space-y-20 lg:col-span-2">
            <section className="space-y-6">
              <h2 className="flex items-center gap-4 text-2xl font-black uppercase italic tracking-tighter text-slate-900">
                <FileText className="text-blue-600" size={32} /> Tentang Program
              </h2>
              <div className="rounded-[3rem] border-2 border-slate-100 bg-white p-10 text-xl font-medium italic leading-relaxed text-slate-700 shadow-sm">
                {training.description || "Deskripsi program pelatihan belum tersedia."}
              </div>
            </section>

            <section className="space-y-8">
              <h2 className="flex items-center gap-4 text-2xl font-black uppercase italic tracking-tighter text-slate-900">
                <BookOpen className="text-blue-600" size={32} /> Materi Pembelajaran
              </h2>
              <div className="grid gap-4">
                {training.syllabus?.split('\n').filter((s: string) => s.trim() !== "").map((item: string, idx: number) => (
                  <div key={idx} className="flex items-center gap-6 rounded-3xl border-2 border-slate-50 bg-white p-6 transition-all hover:border-blue-600 group">
                    <span className="flex size-10 shrink-0 items-center justify-center rounded-2xl bg-slate-900 text-sm font-black text-white group-hover:bg-blue-600">
                      {idx + 1}
                    </span>
                    <p className="text-sm font-black uppercase italic tracking-tight text-slate-700">{item}</p>
                  </div>
                ))}
              </div>
            </section>
          </div>

          <aside className="space-y-12">
            <section className="rounded-[3.5rem] bg-blue-600 p-10 text-white shadow-2xl space-y-8">
              <h3 className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest italic border-b border-blue-400 pb-4">
                <Timer size={16} /> Jadwal Pelaksanaan
              </h3>
              <div className="space-y-6">
                <div>
                  <p className="text-[8px] font-black uppercase opacity-60 mb-1">Tanggal</p>
                  <p className="text-lg font-black italic uppercase leading-tight">{training.start_date} - {training.end_date}</p>
                </div>
                {training.start_time && (
                  <div>
                    <p className="text-[8px] font-black uppercase opacity-60 mb-1">Waktu (WIB)</p>
                    <p className="text-lg font-black italic uppercase">{training.start_time.substring(0,5)} - {training.end_time?.substring(0,5)}</p>
                  </div>
                )}
              </div>
            </section>

            <section className="rounded-[3.5rem] border-2 border-slate-900 bg-white p-10 shadow-[10px_10px_0px_0px_rgba(15,23,42,1)] space-y-8">
              <h3 className="flex items-center gap-3 text-lg font-black uppercase tracking-tighter text-slate-900">
                <Accessibility className="text-blue-600" size={24} /> Fasilitas Inklusi
              </h3>
              <ul className="space-y-4">
                {accommodations.length > 0 ? accommodations.map((item: string, idx: number) => (
                  <li key={idx} className="flex items-start gap-4 rounded-2xl border-2 border-emerald-50 bg-emerald-50/20 p-4 shadow-sm">
                    <CheckCircle2 size={18} className="mt-0.5 shrink-0 text-emerald-500" />
                    <span className="text-[11px] font-black uppercase leading-tight text-emerald-950">{item}</span>
                  </li>
                )) : (
                  <li className="text-center text-[10px] font-black uppercase italic text-slate-300">Data akomodasi sedang diverifikasi.</li>
                )}
              </ul>
            </section>
          </aside>
        </div>
      </main>
    </div>
  );
}