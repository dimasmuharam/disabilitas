"use client";

import React, { useState } from "react";
import { Star, Send, X } from "lucide-react";
import { postInclusionRating } from "@/lib/actions/ratings";
import { INCLUSION_RATING_QUESTIONS } from "@/lib/data-static";

interface RatingModalProps {
  job: any;
  userId: string;
  onClose: () => void;
  onSuccess: () => void;
}

export default function InclusionRatingModal({ job, userId, onClose, onSuccess }: RatingModalProps) {
  const [ratings, setRatings] = useState<Record<string, number>>({
    score_accessibility: 0,
    score_culture: 0,
    score_management: 0,
    score_onboarding: 0
  });
  const [comment, setComment] = useState("");
  const [issubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (Object.values(ratings).some(v => v === 0)) {
      alert("Mohon isi semua kriteria penilaian.");
      return;
    }

    setIsSubmitting(true);
    const result = await postInclusionRating({
      talentId: userId,
      companyId: job.jobs.company_id,
      jobId: job.id,
      accessibility: ratings.score_accessibility,
      culture: ratings.score_culture,
      management: ratings.score_management,
      onboarding: ratings.score_onboarding,
      comment: comment
    });

    if (result.success) {
      onSuccess();
    } else {
      alert(result.error);
    }
    setIsSubmitting(false);
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-sm">
      <div className="w-full max-w-lg overflow-hidden rounded-[3rem] border-4 border-slate-900 bg-white shadow-[12px_12px_0px_0px_rgba(15,23,42,1)]">
        <div className="flex items-center justify-between border-b-2 border-slate-100 bg-slate-50 p-8">
          <div>
            <h3 className="text-xl font-black uppercase italic tracking-tighter text-slate-900">{"Audit Inklusi"}</h3>
            <p className="text-[10px] font-bold uppercase tracking-widest text-blue-600">{(job.jobs as any)?.title}</p>
          </div>
          <button onClick={onClose} className="rounded-full p-2 transition-colors hover:bg-slate-200"><X size={20}/></button>
        </div>

        <div className="max-h-[60vh] space-y-6 overflow-y-auto p-8">
          {INCLUSION_RATING_QUESTIONS.map((q) => (
            <div key={q.id} className="space-y-3">
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-500">{q.label}</label>
              <div className="flex gap-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    onClick={() => setRatings(prev => ({ ...prev, [q.id]: star }))}
                    className={`rounded-xl p-2 transition-all ${ratings[q.id] >= star ? "bg-blue-600 text-white shadow-md" : "border border-slate-100 bg-slate-50 text-slate-300"}`}
                  >
                    <Star size={20} fill={ratings[q.id] >= star ? "currentColor" : "none"} />
                  </button>
                ))}
              </div>
            </div>
          ))}

          <div className="space-y-2 pt-4">
            <label className="text-[10px] font-black uppercase tracking-widest text-slate-500">{"Kesan Tambahan (Opsional & Anonim)"}</label>
            <textarea 
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              className="w-full rounded-2xl border-2 border-slate-100 p-4 text-sm italic outline-none focus:border-blue-600"
              placeholder="Tuliskan pengalaman Anda..."
              rows={3}
            />
          </div>
        </div>

        <div className="border-t-2 border-slate-100 bg-slate-50 p-8">
          <button 
            onClick={handleSubmit}
            disabled={issubmitting}
            className="flex w-full items-center justify-center gap-3 rounded-2xl bg-slate-900 py-4 text-xs font-black uppercase text-white transition-all hover:bg-blue-600"
          >
            {issubmitting ? "MENGIRIM..." : <><Send size={18}/> {"Kirim Penilaian"}</>}
          </button>
        </div>
      </div>
    </div>
  );
}
