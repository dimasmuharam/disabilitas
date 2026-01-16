export const runtime = 'edge';
export const revalidate = 0;

import { Metadata } from "next";
import { supabase } from "@/lib/supabase";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import TrainingContent from "./TrainingContent";

type PageProps = {
  params: { id: string };
};

const isUuid = (id: string) => /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(id);

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  let query = supabase.from("trainings").select("title, description, partners(name)");
  if (isUuid(params.id)) { query = query.eq("id", params.id); } 
  else { query = query.eq("slug", params.id); }

  const { data: training } = await query.maybeSingle();
  if (!training) return { title: "Pelatihan Tidak Ditemukan" };

  const partnerName = (training.partners as any)?.name || "Mitra";
  return {
    title: `${training.title} | Pelatihan oleh ${partnerName} - disabilitas.com`,
    description: training.description?.substring(0, 160) || "Daftar program pelatihan inklusif.",
  };
}

export default async function TrainingPage({ params }: PageProps) {
  let query = supabase.from("trainings").select(`*, partners (*)`);
  if (isUuid(params.id)) { query = query.eq("id", params.id); } 
  else { query = query.eq("slug", params.id); }

  const { data: training, error } = await query.maybeSingle();

  // Proteksi jika data tidak ditemukan atau error database
  if (error || !training) notFound();

  const partner = training.partners as any;
  
  // Normalisasi data untuk mencegah error "split of undefined" di Client Side
  const parseArray = (data: any) => (Array.isArray(data) ? data : []);
  
  const accommodations = Array.from(new Set([
    ...parseArray(training.training_accommodations),
    ...parseArray(partner?.master_accommodations_provided)
  ]));

  const skills = parseArray(training.provided_skills);

  return (
    <div className="min-h-screen bg-[#FDFDFD] pb-24 text-left font-sans">
      <nav className="sticky top-0 z-50 border-b-2 border-slate-100 bg-white/90 p-4 backdrop-blur-md">
        <div className="mx-auto flex max-w-6xl items-center justify-between">
          <Link href="/pelatihan" className="flex items-center gap-2 text-[10px] font-black uppercase italic text-slate-400 transition-all hover:text-blue-600">
            <ArrowLeft size={16} /> Kembali ke Pelatihan
          </Link>
        </div>
      </nav>

      {/* Kirim data yang sudah di-sanitize */}
      <TrainingContent 
        training={training} 
        partner={partner || {}} 
        accommodations={accommodations} 
        skills={skills} 
      />
    </div>
  );
}