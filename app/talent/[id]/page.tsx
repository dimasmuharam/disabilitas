import { createClient } from "@/lib/supabase/server"
import { notFound } from "next/navigation"
import { Metadata } from "next"
import { 
  User, GraduationCap, Briefcase, Award, MapPin, 
  Linkedin, Globe, CheckCircle, 
  Building2, Calendar, ShieldCheck, MessageSquare,
  ExternalLink, Laptop, Heart, Users, Mail, Phone
} from "lucide-react"

export const runtime = 'edge';
export const revalidate = 60 

/**
 * GENERATE METADATA & CANONICAL
 */
export async function generateMetadata({ params }: { params: { id: string } }): Promise<Metadata> {
  const supabase = createClient()
  const { data: profile } = await supabase
    .from('profiles')
    .select('full_name, disability_type')
    .eq('id', params.id)
    .single()

  if (!profile) return {}

  return {
    title: `${profile.full_name} | Profil Profesional Talenta Inklusif`,
    description: `Hubungi ${profile.full_name}, talenta ${profile.disability_type} di disabilitas.com. Lihat rekam jejak dan keahlian profesionalnya.`,
    alternates: {
      canonical: `https://www.disabilitas.com/talent/${params.id}`,
    },
  }
}

// Helper Kalkulasi Usia
function calculateAge(birthDate: string) {
  if (!birthDate) return null;
  const today = new Date();
  const birth = new Date(birthDate);
  let age = today.getFullYear() - birth.getFullYear();
  const m = today.getMonth() - birth.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) age--;
  return age;
}

async function getTalentProfile(id: string) {
  const supabase = createClient()
  // Pastikan memanggil relasi dengan benar
  const { data } = await supabase
    .from('profiles')
    .select('*, certifications(*), work_experiences(*)')
    .eq('id', id)
    .single()
  return data
}

export default async function PublicProfilePage({ params }: { params: { id: string } }) {
  const profile = await getTalentProfile(params.id)

  if (!profile) return notFound()

  const getYoutubeId = (url: string) => {
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/
    const match = url.match(regExp)
    return (match && match[2].length === 11) ? match[2] : null
  }
  const videoId = profile.video_intro_url ? getYoutubeId(profile.video_intro_url) : null
  const age = calculateAge(profile.date_of_birth);

  return (
    <div className="min-h-screen bg-[#F8FAFC] pb-20 font-sans">
      {/* HEADER / BANNER AREA */}
      <div className="relative overflow-hidden bg-slate-900 px-4 pb-40 pt-24 text-white">
        <div className="pointer-events-none absolute inset-0 opacity-10">
          <div className="absolute left-0 top-0 size-[500px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-blue-600 blur-[120px]"></div>
        </div>

        <div className="relative z-10 mx-auto flex max-w-5xl flex-col items-center text-center">
          <div className="mb-8 flex size-28 items-center justify-center rounded-[2.5rem] border-4 border-white/10 bg-blue-600 text-5xl font-black uppercase italic shadow-2xl">
            {profile.full_name?.substring(0, 2)}
          </div>
          
          <h1 className="mb-4 flex items-center justify-center gap-3 text-4xl font-black uppercase leading-none tracking-tighter md:text-5xl">
            {profile.full_name}
            {profile.is_verified && <ShieldCheck size={36} className="fill-blue-400/10 text-blue-400" />}
          </h1>

          <div className="mb-8 flex flex-wrap justify-center gap-4">
            <span className="rounded-full bg-blue-600 px-5 py-2 text-[10px] font-black uppercase tracking-[0.2em] text-white shadow-lg">
              {profile.disability_type}
            </span>
            <span className="flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-5 py-2 text-[10px] font-black uppercase tracking-widest text-blue-300 backdrop-blur-md">
              <Briefcase size={14}/> {profile.career_status || "Professional"}
            </span>
          </div>

          <div className="flex flex-wrap justify-center gap-8 text-[10px] font-bold uppercase tracking-[0.15em] text-slate-400">
            <span className="flex items-center gap-2"><MapPin size={16} className="text-blue-500"/> {profile.city || "Indonesia"}</span>
            <span className="flex items-center gap-2"><Users size={16} className="text-blue-500"/> {profile.gender || "Tidak Disebutkan"}</span>
            {age && <span className="flex items-center gap-2"><Calendar size={16} className="text-blue-500"/> {age} Tahun</span>}
          </div>
        </div>
      </div>

      {/* CONTENT AREA */}
      <div className="relative z-20 mx-auto -mt-28 max-w-5xl space-y-8 px-4">
        
        {/* VIDEO SECTION */}
        {videoId && (
          <div className="rounded-[3rem] border border-slate-200 bg-white p-4 shadow-2xl">
            <div className="aspect-video w-full overflow-hidden rounded-[2rem] bg-black shadow-inner">
              <iframe width="100%" height="100%" src={`https://www.youtube.com/embed/${videoId}`} title="Video Perkenalan" frameBorder="0" allowFullScreen></iframe>
            </div>
          </div>
        )}

        <div className="grid gap-8 lg:grid-cols-3">
          <div className="space-y-8 lg:col-span-2">
            
            {/* RINGKASAN */}
            <section className="rounded-[3rem] border border-slate-200 bg-white p-10 shadow-sm">
              <h2 className="mb-6 text-[11px] font-black uppercase tracking-[0.25em] text-blue-600">{"Ringkasan Profesional"}</h2>
              <p className="text-justify text-lg font-medium italic leading-relaxed text-slate-700">
                {"\""}{profile.bio || `Saya adalah ${profile.full_name}, profesional yang siap berkontribusi.`}{"\""}
              </p>
            </section>

            {/* PENGALAMAN KERJA (Sinkron dengan Database) */}
            <section className="rounded-[3rem] border border-slate-200 bg-white p-10 shadow-sm">
              <h2 className="mb-10 flex items-center gap-3 text-[11px] font-black uppercase tracking-[0.25em] text-blue-600">
                <Briefcase size={20}/> {"Pengalaman Karir"}
              </h2>
              <div className="space-y-12">
                {profile.work_experiences && profile.work_experiences.length > 0 ? (
                  profile.work_experiences.map((work: any) => (
                    <div key={work.id} className="relative border-l-2 border-slate-100 pl-10">
                      <div className="absolute left-[-11px] top-0 size-5 rounded-full border-4 border-white bg-blue-600 shadow-sm"></div>
                      <div className="mb-4 flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                        <div>
                          <h3 className="text-xl font-black uppercase leading-none tracking-tight text-slate-900">{work.position}</h3>
                          <p className="mt-2 flex items-center gap-1 text-xs font-bold uppercase text-blue-600">
                            <Building2 size={14}/> {work.company_name} {work.company_location && `, ${work.company_location}`}
                          </p>
                        </div>
                        <span className="whitespace-nowrap rounded-lg bg-slate-100 px-3 py-1 text-[10px] font-black uppercase text-slate-500">
                          {work.start_date} - {work.end_date || 'Sekarang'}
                        </span>
                      </div>
                      {work.description && (
                        <p className="rounded-2xl border border-slate-100 bg-slate-50 p-6 text-justify text-sm italic leading-relaxed text-slate-600">
                          {work.description}
                        </p>
                      )}
                      <div className="mt-4">
                        <span className="rounded-full border border-slate-200 px-3 py-1 text-[9px] font-black uppercase text-slate-400">
                          {work.employment_type}
                        </span>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="py-10 text-center">
                    <p className="text-sm font-bold uppercase italic tracking-widest text-slate-400">{"Data riwayat pekerjaan belum tersedia."}</p>
                  </div>
                )}
              </div>
            </section>

            {/* SERTIFIKASI & PELATIHAN */}
            <section className="rounded-[3rem] border border-slate-200 bg-white p-10 shadow-sm">
              <h2 className="mb-8 flex items-center gap-3 text-[11px] font-black uppercase tracking-[0.25em] text-emerald-600">
                <Award size={22}/> {"Sertifikasi & Pelatihan"}
              </h2>
              <div className="grid gap-4 md:grid-cols-2">
                {profile.certifications && profile.certifications.length > 0 ? (
                  profile.certifications.map((cert: any) => (
                    <div key={cert.id} className="group rounded-[2rem] border border-slate-100 bg-slate-50 p-6 transition-all hover:border-emerald-500">
                      <h3 className="mb-2 text-xs font-black uppercase text-slate-900 group-hover:text-emerald-600">{cert.name}</h3>
                      <div className="space-y-1 text-[10px] font-bold uppercase text-slate-500">
                        <p className="flex items-center gap-2"><Building2 size={12}/> {cert.organizer_name}</p>
                        <p className="flex items-center gap-2"><Calendar size={12}/> {cert.year}</p>
                      </div>
                      {cert.certificate_url && (
                        <a href={cert.certificate_url} target="_blank" className="mt-4 inline-flex items-center gap-2 text-[9px] font-black uppercase text-emerald-600 hover:underline">
                          {"Lihat Dokumen"} <ExternalLink size={12}/>
                        </a>
                      )}
                    </div>
                  ))
                ) : (
                  <div className="py-6 text-center text-sm font-bold uppercase italic tracking-widest text-slate-400 md:col-span-2">
                    {"Belum ada sertifikasi yang dicantumkan."}
                  </div>
                )}
              </div>
            </section>
          </div>

          {/* SIDEBAR */}
          <div className="space-y-6">
            {/* AKOMODASI & AKSES (Penting untuk Aksesibilitas) */}
            <section className="rounded-[2.5rem] border border-slate-200 bg-white p-8 shadow-sm">
              <h2 className="mb-6 flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-blue-600">
                <Laptop size={18}/> {"Kebutuhan & Akses"}
              </h2>
              <div className="space-y-6">
                <div>
                  <p className="mb-2 text-[8px] font-black uppercase tracking-widest text-slate-400">{"Alat Bantu Asistif"}</p>
                  <div className="flex flex-wrap gap-2">
                    {Array.isArray(profile.used_assistive_tools) && profile.used_assistive_tools.length > 0 ? (
                      profile.used_assistive_tools.map((tool: string, idx: number) => (
                        <span key={idx} className="rounded-lg border border-blue-100 bg-blue-50 px-3 py-1 text-[9px] font-black uppercase text-blue-700">
                          {tool}{idx < profile.used_assistive_tools.length - 1 ? "," : ""}
                        </span>
                      ))
                    ) : <span className="text-xs italic text-slate-400">{"-"}</span>}
                  </div>
                </div>
                <div className="border-t border-slate-50 pt-4">
                  <p className="mb-2 text-[8px] font-black uppercase tracking-widest text-slate-400">{"Preferensi Akomodasi"}</p>
                  <p className="rounded-2xl border border-slate-100 bg-slate-50 p-4 text-xs font-bold italic leading-relaxed text-slate-700">
                    {profile.preferred_accommodations || "Informasi belum tersedia."}
                  </p>
                </div>
                <div className="border-t border-slate-50 pt-4">
                  <p className="mb-2 text-[8px] font-black uppercase tracking-widest text-slate-400">{"Preferensi Kerja"}</p>
                  <p className="flex items-center gap-2 text-xs font-bold text-slate-700">
                    <Heart size={14} className="text-red-500"/> {profile.work_preference || "Fleksibel"}
                  </p>
                </div>
              </div>
            </section>

            {/* PENDIDIKAN */}
            <section className="rounded-[2.5rem] border border-slate-200 bg-white p-8 shadow-sm">
              <h2 className="mb-6 flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-900">
                <GraduationCap size={18}/> {"Pendidikan"}
              </h2>
              <div className="space-y-4">
                <div>
                  <p className="mb-1 text-[8px] font-black uppercase tracking-widest text-blue-600">{profile.education_level}</p>
                  <h3 className="text-sm font-black uppercase tracking-tight">{profile.university}</h3>
                  <p className="mt-1 text-xs font-bold uppercase italic text-slate-500">{profile.major}</p>
                  {profile.graduation_date && <p className="mt-2 text-[10px] font-bold uppercase text-slate-400">{"Lulus Tahun: "}{profile.graduation_date}</p>}
                </div>
              </div>
            </section>

            {/* KEAHLIAN (Dengan Jeda Aksesibel) */}
            <section className="rounded-[2.5rem] border border-slate-200 bg-white p-8 shadow-sm">
              <h2 className="mb-6 flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-900">
                <Award size={18}/> {"Keahlian"}
              </h2>
              <div className="flex flex-wrap gap-2">
                {profile.skills?.map((skill: string, idx: number) => (
                  <span key={idx} className="rounded-xl bg-slate-900 px-3 py-1.5 text-[9px] font-black uppercase text-white">
                    {skill}{idx < profile.skills.length - 1 ? "," : ""}
                  </span>
                ))}
              </div>
            </section>

            {/* KONTAK */}
            <section className="rounded-[2.5rem] bg-slate-900 p-8 text-white shadow-xl">
              <h2 className="mb-6 text-[9px] font-black uppercase tracking-widest text-slate-500">{"Hubungi Talenta"}</h2>
              <div className="space-y-3">
                {profile.linkedin_url && (
                  <a href={profile.linkedin_url} target="_blank" className="group flex items-center gap-3 rounded-2xl border border-white/5 bg-white/5 p-4 transition-all hover:bg-white/10">
                    <Linkedin size={18} className="text-blue-400 transition-all group-hover:scale-110"/>
                    <span className="text-[10px] font-black uppercase tracking-widest">{"LinkedIn"}</span>
                  </a>
                )}
                {profile.portfolio_url && (
                  <a href={profile.portfolio_url} target="_blank" className="group flex items-center gap-3 rounded-2xl border border-white/5 bg-white/5 p-4 transition-all hover:bg-white/10">
                    <Globe size={18} className="text-emerald-400 transition-all group-hover:scale-110"/>
                    <span className="text-[10px] font-black uppercase tracking-widest">{"Portfolio"}</span>
                  </a>
                )}
              </div>
              <div className="mt-8 border-t border-white/10 pt-6">
                <p className="mb-2 text-[8px] font-black uppercase tracking-widest text-slate-500">{"Metode Komunikasi"}</p>
                <p className="flex items-center gap-2 text-xs font-bold italic text-blue-400">
                  <MessageSquare size={14}/> {profile.communication_preference || "Dashboard / Email"}
                </p>
              </div>
            </section>

            {/* FOOTER */}
            <div className="px-6 text-center">
              <p className="mb-2 text-[7px] font-black uppercase tracking-[0.3em] text-slate-400">{"DISABILITAS.COM PROFESSIONAL ID"}</p>
              <p className="text-[6px] italic leading-tight text-slate-400">
                {"Data ditampilkan berdasarkan Informed Consent talenta untuk tujuan pengembangan karir inklusif."}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
