export const runtime = 'edge';
export const revalidate = 0;

import { Metadata } from "next";
import { supabase } from "@/lib/supabase";
import { notFound } from "next/navigation";
import JobContent from "./JobContent";

type PageProps = {
  params: { id: string };
};

const isUuid = (id: string) => /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(id);

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  let query = supabase.from("jobs").select("title, companies(name)");
  if (isUuid(params.id)) { query = query.eq("id", params.id); } 
  else { query = query.eq("slug", params.id); }

  const { data: job } = await query.maybeSingle();
  if (!job) return { title: "Lowongan Tidak Ditemukan | disabilitas.com" };

  const companyName = (job.companies as any)?.name || "Instansi Mitra";
  const title = `${job.title} di ${companyName} | Lowongan Kerja Inklusif`;
  const description = `Lamar lowongan kerja inklusif sebagai ${job.title} di ${companyName}. Pelajari syarat, gaji, dan dukungan akomodasi disabilitas di sini.`;

  return {
    title,
    description,
    alternates: { canonical: `https://disabilitas.com/lowongan/${params.id}` },
    openGraph: { title, description, url: `https://disabilitas.com/lowongan/${params.id}` }
  };
}

export default async function JobPage({ params }: PageProps) {
  let query = supabase.from("jobs").select(`*, companies (*)`).eq(isUuid(params.id) ? 'id' : 'slug', params.id);
  const { data: job, error } = await query.maybeSingle();

  if (error || !job) notFound();

  // Helper untuk parsing data
  const parseToArray = (fieldData: any) => {
    if (!fieldData) return [];
    if (Array.isArray(fieldData)) return fieldData;
    return typeof fieldData === 'string' ? fieldData.split(',').filter(Boolean) : [];
  };

  const skills = parseToArray(job.required_skills);
  const majors = parseToArray(job.required_education_major);
  const accommodations = parseToArray(job.companies?.master_accommodations_provided);

  return (
    <JobContent 
      job={job} 
      skills={skills} 
      majors={majors} 
      accommodations={accommodations} 
    />
  );
}