export const runtime = 'edge';
export const revalidate = 0;

import { Metadata } from "next";
import { supabase } from "@/lib/supabase";
import { notFound } from "next/navigation";
import { ArrowLeft, Share2 } from "lucide-react";
import Link from "next/link";
import TrainingContent from "./TrainingContent";

type PageProps = {
  params: { id: string };
};

// Helper untuk deteksi apakah ID berupa UUID atau SLUG
const isUuid = (id: string) => /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(id);

// --- 1. SEO & METADATA (Wajib di Server Side) ---
export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  let query = supabase.from("trainings").select("title, description, partners(name)");
  
  if (isUuid(params.id)) {
    query = query.eq("id", params.id);
  } else {
    query = query.eq("slug", params.id);
  }

  const { data: training } = await query.maybeSingle();

  if (!training) {
    return {
      title: "Pelatihan Tidak Ditemukan | disabilitas.com",
    };
  }

  const partnerName = (training.partners as any)?.name || "Mitra";

  return {
    title: `${training.title} | Pelatihan oleh ${partnerName} - disabilitas.com`,
    description: training.description?.substring(0, 160) || `Ikuti pelatihan ${training.title} untuk meningkatkan kompetensi profesional Anda.`,
    alternates: {
      canonical: `https://disabilitas.com/pelatihan/${params.id}`,
    },
    openGraph: {
      title: training.title,
      description: training.description,
      type: 'article',
      url: `https://disabilitas.com/pelatihan/${params.id}`,
    }
  };
}

// --- 2. MAIN PAGE COMPONENT ---
export default async function TrainingPage({ params }: PageProps) {
  // Fetch data pelatihan dan relasi partner
  let query = supabase.from("trainings").select(`
    *,
    partners (*)
  `);

  if (isUuid(params.id)) {
    query = query.eq("id", params.id);
  } else {
    query = query.eq("slug", params.id);
  }

  const { data: training, error } = await query.maybeSingle();

  // Jika data tidak ada, lempar ke halaman 404
  if (error || !training) {
    notFound();
  }

  const partner = training.partners as any;

  // Normalisasi data array agar tidak error saat di-map
  const parseArray = (data: any) => (Array.isArray(data) ? data : []);
  
  // Gabungkan fasilitas dari pelatihan dan fasilitas default dari partner (Unik)
  const accommodations = Array.from(new Set([
    ...parseArray(training.training_accommodations),
    ...parseArray(partner?.master_accommodations_provided)
  ]));

  const skills = parseArray(training.provided_skills);

  // Helper Format Tanggal
  const formatFullDate = (dateStr: string) => {
    if (!dateStr) return "-";
    return new Date(dateStr).toLocaleDateString("id-ID", {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  };

  return (
    <div className="min-h-screen bg-[#FDFDFD] pb-24 font-sans text-left">
      {/* Navigation Bar */}
      <nav className="sticky top-0 z-50 border-b-2 border-slate-100 bg-white/90 p-4 backdrop-blur-md">
        <div className="mx-auto flex max-w-6xl items-center justify-between">
          <Link 
            href="/pelatihan" 
            className="flex items-center gap-2 text-[10px] font-black uppercase italic text-slate-400 hover:text-blue-600 transition-all"
          >
            <ArrowLeft size={16} /> Kembali ke Daftar Pelatihan
          </Link>
          <div className="flex items-center gap-4">
            <button className="flex items-center gap-2 text-[10px] font-black uppercase italic text-slate-400 hover:text-slate-900">
              <Share2 size={16} /> Share
            </button>
          </div>
        </div>
      </nav>

      {/* CLIENT COMPONENT: TrainingContent
          Semua interaksi (klik tombol daftar, popup sukses, dll) 
          ada di dalam komponen ini agar tidak merusak SEO.
      */}
      <TrainingContent 
        training={training} 
        partner={partner} 
        accommodations={accommodations} 
        skills={skills} 
        formatFullDate={formatFullDate} 
      />

      {/* Footer SEO Friendly */}
      <footer className="mx-auto mt-20 max-w-6xl border-t border-slate-100 px-6 pt-10 text-center">
        <p className="text-[10px] font-bold uppercase tracking-widest text-slate-300">
          © 2026 disabilitas.com — Membangun Ekosistem Kerja Inklusif
        </p>
      </footer>
    </div>
  );
}