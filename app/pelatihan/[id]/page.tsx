export const runtime = 'edge';
export const revalidate = 0;

import { Metadata } from "next";
import { supabase } from "@/lib/supabase";
import { notFound } from "next/navigation";
import { 
  Calendar, MapPin, BookOpen, ShieldCheck, 
  CheckCircle2, Clock, Users, ArrowLeft, 
  Zap, FileText, Share2, Building2,
  GraduationCap, ArrowRight, Star
} from "lucide-react";
import Link from "next/link";

type PageProps = {
  params: { id: string };
};

// Fungsi helper untuk deteksi UUID vs Slug (Pelajaran dari file Lowongan)
const isUuid = (id: string) => /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(id);

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  let query = supabase.from("trainings").select("title, partners(name)");
  
  if (isUuid(params.id)) {
    query = query.eq("id", params.id);
  } else {
    query = query.eq("slug", params.id);
  }

  const { data: training } = await query.maybeSingle();

  if (!training) return { title: "Pelatihan Tidak Ditemukan | disabilitas.com" };
  const partnerName = (training.partners as any)?.name || "Mitra";
  
  return {
    title: `${training.title} | Program Pelatihan ${partnerName}`,
    description: `Ikuti program pelatihan inklusif: ${training.title} oleh ${partnerName}.`,
    alternates: { 
      canonical: `https://disabilitas.com/pelatihan/${params.id}` 
    },
  };
}

export default async function TrainingDetail({ params }: PageProps) {
  let query = supabase
    .from("trainings")
    .select(`
      *,
      partners (
        id, name, location, inclusion_score, master_accommodations_provided
      )
    `);

  // Logika pencarian fleksibel (Slug atau UUID)
  if (isUuid(params.id)) {
    query = query.eq("id", params.id);
  } else {
    query = query.eq("slug", params.id);
  }

  const { data: training, error } = await query.maybeSingle();

  if (error || !training) notFound();

  const partner = training.partners as any;
  const deadline = new Date(training.registration_deadline || '');
  const isExpired = deadline < new Date();

  // Helper untuk parsing array (Pelajaran dari file Lowongan)
  const parseArray = (data: any) => {
    if (!data) return [];
    if (Array.isArray(data)) return data;
    return [];
  };

  const accommodations = Array.from(new Set([
    ...parseArray(training.training_accommodations),
    ...parseArray(partner?.master_accommodations_provided)
  ]));

  return (
    <div className="min-h-screen bg-[#FDFDFD] pb-20 text-slate-900 font-sans text-left">
      {/* ... bagian UI navigasi & header sama seperti v0.3.1 ... */}
      {/* Tombol Daftar sekarang akan mengarah ke pendaftaran dengan ID asli (UUID) */}
      
      <div className="mx-auto max-w-5xl px-4">
         {/* Konten rincian tetap konsisten secara visual */}
         {/* Pastikan menggunakan parseArray untuk syllabus agar tidak error .map */}
         <section className="space-y-8">
            <h2 className="flex items-center gap-4 text-2xl font-black uppercase italic tracking-tighter">
              <BookOpen className="text-blue-600" size={32} /> Materi Pelatihan
            </h2>
            <div className="grid gap-4">
              {training.syllabus?.split('\n').filter((s: string) => s.trim() !== "").map((item: string, idx: number) => (
                <div key={idx} className="flex items-center gap-6 rounded-3xl border-2 border-slate-50 bg-white p-6 transition-all hover:border-blue-600 group">
                  <span className="flex size-10 shrink-0 items-center justify-center rounded-2xl bg-slate-900 text-sm font-black text-white group-hover:bg-blue-600">
                    {idx + 1}
                  </span>
                  <p className="text-sm font-black uppercase italic text-slate-700">{item}</p>
                </div>
              ))}
            </div>
          </section>
      </div>
    </div>
  );
}
