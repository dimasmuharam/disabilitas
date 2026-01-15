"use client";

import React, { useState, useEffect, useRef } from "react";
import { supabase } from "@/lib/supabase";
import Link from "next/link";
import { 
  MapPin, Loader2, Briefcase, Building2, Calendar, ArrowLeft, 
  CheckCircle, Send, ShieldCheck, Info, 
  Clock, DollarSign, GraduationCap, Tag, 
  Accessibility, LayoutDashboard, Share2, Search,
  PartyPopper, ChevronRight
} from "lucide-react";
import { useRouter } from "next/navigation";

export default function JobContent({ job, skills, majors, accommodations }: any) {
  const [applying, setApplying] = useState(false);
  const [hasApplied, setHasApplied] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [isSuccess, setIsSuccess] = useState(false);
  const successRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  // Canonical Link standar Mas Dimas
  useEffect(() => {
    const link = document.querySelector("link[rel='canonical']") || document.createElement("link");
    link.setAttribute("rel", "canonical");
    link.setAttribute("href", window.location.origin + window.location.pathname);
    if (!document.head.contains(link)) document.head.appendChild(link);
  }, []);

  useEffect(() => {
    async function checkUser() {
      const { data: { user: authUser } } = await supabase.auth.getUser();
      setUser(authUser);
      if (authUser) {
        const { data } = await supabase.from('applications')
          .select('id').eq('job_id', job.id).eq('applicant_id', authUser.id).maybeSingle();
        if (data) setHasApplied(true);
      }
    }
    checkUser();
  }, [job.id]);

  const handleApply = async () => {
    if (!user) { router.push("/masuk"); return; }
    setApplying(true);
    try {
      const { error } = await supabase.from("applications").insert([{
        job_id: job.id,
        applicant_id: user.id,
        company_id: job.company_id,
        status: "applied",
        applied_at: new Date().toISOString()
      }]);
      
      if (error) throw error;
      
      setIsSuccess(true);
      setHasApplied(true);
      
      // Aksesibilitas: Gulung ke atas dan fokus ke pesan sukses
      window.scrollTo({ top: 0, behavior: 'smooth' });
      setTimeout(() => { successRef.current?.focus(); }, 500);

    } catch (e: any) {
      alert("Gagal mengirim lamaran: " + e.message);
    } finally {
      setApplying(false);
    }
  };

  const formatDate = (dateStr: string) => {
    if (!dateStr) return "Segera";
    return new Date(dateStr).toLocaleDateString("id-ID", { day: 'numeric', month: 'long', year: 'numeric' });
  };

  // TAMPILAN KONFIRMASI BERHASIL (Aksesibel & Jelas)
  if (isSuccess) {
    return (
      <main className="flex min-h-[80vh] items-center justify-center bg-[#FDFDFD] px-6 py-20 font-sans">
        <div 
          ref={successRef} 
          tabIndex={-1} 
          role="alert"
          className="w-full max-w-2xl rounded-[4rem] border-4 border-slate-900 bg-white p-12 text-center shadow-[16px_16px_0px_0px_rgba(16,185,129,1)] outline-none"
        >
          <div className="mx-auto mb-8 flex h-24 w-24 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
            <PartyPopper size={48} />
          </div>
          <h1 className="mb-4 text-4xl font-black uppercase italic tracking-tighter text-slate-900 md:text-5xl">Lamaran Berhasil Dikirim!</h1>
          <p className="mb-10 text-lg font-bold italic text-slate-500 uppercase tracking-tight">
            Data profil dan CV digital Anda telah masuk ke sistem rekrutmen <span className="text-blue-600 underline">{job.companies?.name}</span>.
          </p>
          
          <div className="grid gap-4 md:grid-cols-2">
            <Link 
              href="/dashboard/talent" 
              className="flex items-center justify-center gap-3 rounded-2xl bg-slate-900 py-6 text-xs font-black uppercase tracking-widest text-white transition-all hover:bg-slate-800 active:scale-95"
            >
              <LayoutDashboard size={18} /> Ke Dashboard Saya
            </Link>
            <Link 
              href="/lowongan" 
              className="flex items-center justify-center gap-3 rounded-2xl border-4 border-slate-900 bg-white py-6 text-xs font-black uppercase tracking-widest text-slate-900 transition-all hover:bg-slate-50 active:scale-95"
            >
              <Search size={18} /> Cari Lowongan Lain
            </Link>
          </div>
          
          <p className="mt-8 text-[10px] font-black uppercase italic text-slate-300">
            Pemberitahuan otomatis akan dikirim jika ada perubahan status lamaran.
          </p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#FDFDFD] pb-24 pt-10 text-left font-sans">
      <div className="mx-auto max-w-6xl px-6">
        
        <Link href="/lowongan" aria-label="Kembali ke daftar lowongan kerja" className="group mb-10 inline-flex items-center text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 hover:text-blue-600 transition-all">
          <ArrowLeft className="mr-2 size-4 group-hover:-translate-x-1" /> KEMBALI KE PENCARIAN
        </Link>

        <div className="grid grid-cols-1 items-start gap-12 lg:grid-cols-3">
          <div className="space-y-8 lg:col-span-2">
            <article className="rounded-[3rem] border-2 border-slate-100 bg-white p-8 shadow-sm md:p-12 space-y-6">
              <div className="flex flex-wrap gap-3">
                <span className="rounded-xl border border-blue-100 bg-blue-50 px-4 py-1.5 text-[10px] font-black uppercase italic text-blue-700">{job.job_type}</span>
                <span className="rounded-xl border border-emerald-100 bg-emerald-50 px-4 py-1.5 text-[10px] font-black uppercase italic text-emerald-700">{job.work_mode}</span>
              </div>
              <h1 className="text-4xl font-black uppercase italic leading-tight tracking-tighter text-slate-900 md:text-5xl">{job.title}</h1>
              <Link href={`/perusahaan/${job.companies?.id}`} className="group inline-flex items-center gap-2 text-xl font-bold text-blue-600 underline underline-offset-8 decoration-2 hover:decoration-4 transition-all">
                <Building2 className="size-6 text-slate-900" /> {job.companies?.name}
              </Link>
              <div className="flex flex-wrap gap-8 border-t-2 border-slate-50 pt-8 text-[10px] font-black uppercase italic text-slate-400">
                <span className="flex items-center gap-2"><MapPin size={16} className="text-red-500" /> {job.location}</span>
                <span className="flex items-center gap-2"><DollarSign size={16} className="text-emerald-500" /> {job.salary_min > 0 ? `Rp ${(job.salary_min/1000000).toFixed(1)}jt - ${(job.salary_max/1000000).toFixed(1)}jt` : "Kompetitif"}</span>
                <span className="flex items-center gap-2"><Clock size={16} className="text-orange-500" /> Tutup: {formatDate(job.expires_at)}</span>
              </div>
            </article>

            <section className="grid gap-10 rounded-[3rem] border-2 border-slate-100 bg-white p-8 shadow-sm md:grid-cols-2 md:p-12">
              <div className="space-y-4">
                <h2 className="flex items-center gap-2 text-[10px] font-black uppercase italic tracking-widest text-blue-600"><GraduationCap size={16}/> Pendidikan</h2>
                <p className="text-2xl font-black uppercase italic text-slate-900">{job.required_education_level}</p>
                <div className="flex flex-wrap gap-1 text-[9px] font-black uppercase text-blue-400">
                  {majors.map((m: string) => <span key={m} className="bg-blue-50 px-2 py-0.5 rounded-md">{m}</span>)}
                </div>
              </div>
              <div className="space-y-4 md:border-l-2 md:border-slate-50 md:pl-10">
                <h2 className="flex items-center gap-2 text-[10px] font-black uppercase italic tracking-widest text-emerald-600"><Tag size={16}/> Keahlian Dibutuhkan</h2>
                <div className="flex flex-wrap gap-2">
                  {skills.map((s: string) => <span key={s} className="rounded-lg bg-slate-900 px-3 py-1 text-[9px] font-black uppercase italic text-white">{s}</span>)}
                </div>
              </div>
            </section>

            <section className="rounded-[3rem] border-2 border-slate-100 bg-white p-8 md:p-12 space-y-10 text-slate-700">
              <div className="space-y-4">
                <h2 className="flex items-center gap-2 border-b pb-2 text-[10px] font-black uppercase italic text-slate-400"><Info size={14}/> Deskripsi Pekerjaan</h2>
                <div className="whitespace-pre-line text-lg font-medium italic leading-relaxed">{job.description}</div>
              </div>
              {job.accessibility_note && (
                <div className="rounded-[2.5rem] border-2 border-emerald-100 bg-emerald-50/30 p-8">
                  <h2 className="mb-4 flex items-center gap-2 text-[11px] font-black uppercase italic text-emerald-600"><Accessibility size={18}/> Inklusi & Aksesibilitas</h2>
                  <p className="whitespace-pre-line text-lg font-bold italic text-emerald-900">{job.accessibility_note}</p>
                </div>
              )}
            </section>
          </div>

          <aside className="sticky top-10 space-y-8">
            <div className="rounded-[3.5rem] bg-slate-900 p-10 text-white shadow-2xl space-y-8">
              <h3 className="border-b border-white/10 pb-4 text-[10px] font-black uppercase italic tracking-widest text-blue-400">Panel Rekrutmen</h3>
              
              {hasApplied ? (
                <div className="flex w-full flex-col items-center gap-3 rounded-2xl bg-emerald-500/10 py-8 text-xs font-black italic text-emerald-400 border border-emerald-500/20">
                  <CheckCircle size={32}/> LAMARAN TERKIRIM
                </div>
              ) : (
                <button 
                  onClick={handleApply} disabled={applying}
                  aria-label={applying ? "Sedang memproses lamaran" : "Klik untuk kirim lamaran kerja"}
                  className="group h-16 w-full rounded-2xl bg-blue-600 text-xs font-black uppercase tracking-[0.2em] shadow-xl hover:bg-blue-700 transition-all disabled:bg-slate-800"
                >
                  {applying ? (
                    <span className="flex items-center justify-center gap-2">
                      <Loader2 className="animate-spin" size={18} /> MEMPROSES...
                    </span>
                  ) : (
                    <span className="flex items-center justify-center gap-2">
                      KIRIM LAMARAN <ChevronRight className="group-hover:translate-x-1 transition-transform" size={16} />
                    </span>
                  )}
                </button>
              )}
              <p className="text-center text-[8px] font-bold uppercase text-slate-500 leading-relaxed italic">
                Sistem akan melampirkan Profil Karir, Riwayat Pendidikan, dan Keahlian Anda secara otomatis.
              </p>
            </div>

            <section className="rounded-[3rem] border-2 border-slate-900 bg-white p-10 shadow-[8px_8px_0px_0px_rgba(15,23,42,1)] space-y-6">
              <h3 className="flex items-center gap-2 text-sm font-black uppercase italic text-slate-900"><ShieldCheck className="text-blue-600" size={20}/> Akomodasi Tersedia</h3>
              <div className="space-y-3">
                {accommodations.length > 0 ? accommodations.map((acc: string) => (
                  <div key={acc} className="flex items-start gap-3 text-[10px] font-bold text-slate-700 uppercase italic">
                    <CheckCircle size={14} className="mt-0.5 shrink-0 text-emerald-500" /> {acc}
                  </div>
                )) : <p className="text-[10px] italic text-slate-300 uppercase font-bold">Data akomodasi belum ditentukan.</p>}
              </div>
            </section>
          </aside>
        </div>
      </div>
    </main>
  );
}