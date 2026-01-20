"use client";

import { useEffect, useRef, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import Link from "next/link";

function KonfirmasiContent() {
  const searchParams = useSearchParams();
  const email = searchParams.get("email") || "";
  const headingRef = useRef<HTMLHeadingElement>(null);
  const supabase = createClientComponentClient();

  const [loading, setLoading] = useState(false);
  const [cooldown, setCooldown] = useState(0);
  const [message, setMessage] = useState("");

  // Auto-focus ke heading untuk aksesibilitas NVDA
  useEffect(() => {
    if (headingRef.current) headingRef.current.focus();
  }, []);

  // Timer untuk cooldown tombol kirim ulang
  useEffect(() => {
    if (cooldown > 0) {
      const timer = setTimeout(() => setCooldown(cooldown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [cooldown]);

  const handleResend = async () => {
    if (!email) {
      setMessage("Email tidak ditemukan. Silakan daftar ulang.");
      return;
    }

    setLoading(true);
    setMessage("");

    const { error } = await supabase.auth.resend({
      type: 'signup',
      email: email,
    });

    if (error) {
      setMessage("Gagal mengirim ulang: " + error.message);
    } else {
      setMessage("Email verifikasi baru telah dikirim!");
      setCooldown(60); // Kunci tombol selama 60 detik
    }
    setLoading(false);
  };

  return (
    <main className="flex min-h-screen items-center justify-center bg-gray-50 px-4" role="main">
      <div className="w-full max-w-md space-y-8 rounded-xl border border-gray-100 bg-white p-10 shadow-lg">
        <div className="text-center">
          <div className="mx-auto mb-6 flex size-16 items-center justify-center rounded-full bg-green-100" aria-hidden="true">
            <svg className="size-10 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
            </svg>
          </div>

          <h1 
            ref={headingRef}
            tabIndex={-1}
            className="text-3xl font-extrabold text-gray-900 focus:outline-none"
          >
            Satu Langkah Lagi!
          </h1>
          
          <p className="mt-4 text-gray-600">Pendaftaran berhasil. Silakan verifikasi email Anda:</p>
          <p className="mt-2 break-all font-bold text-blue-600">{email}</p>
        </div>

        <div className="mt-8 space-y-6">
          <div className="rounded-md border-l-4 border-blue-400 bg-blue-50 p-4" role="alert">
            <h2 className="text-sm font-medium text-blue-800">Instruksi:</h2>
            <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-blue-700">
              <li>Klik tombol <strong>Confirm Email</strong> di inbox Anda.</li>
              <li>Cek folder <strong>Spam/Promosi</strong> jika tidak ada.</li>
            </ul>
          </div>

          {/* Alert Message untuk User (Dibaca NVDA via role="status") */}
          {message && (
            <div 
              className={`rounded-md p-3 text-center text-sm ${message.includes('Gagal') ? 'bg-red-50 text-red-700' : 'bg-green-50 text-green-700'}`}
              role="status"
              aria-live="polite"
            >
              {message}
            </div>
          )}

          <div className="space-y-4">
            <Link
              href="/login"
              className="flex w-full justify-center rounded-md border border-transparent bg-blue-600 px-4 py-3 text-sm font-medium text-white shadow-sm transition-colors hover:bg-blue-700"
            >
              Masuk ke Akun
            </Link>

            <button 
              type="button"
              disabled={loading || cooldown > 0}
              onClick={handleResend}
              className={`w-full text-sm font-medium ${cooldown > 0 ? 'text-gray-400' : 'text-blue-600 hover:text-blue-500'} disabled:cursor-not-allowed`}
            >
              {loading ? "Mengirim..." : cooldown > 0 ? `Kirim ulang dalam ${cooldown}s` : "Tidak menerima email? Kirim ulang"}
            </button>
          </div>
        </div>
      </div>
    </main>
  );
}

export default function KonfirmasiPendaftaran() {
  return (
    <Suspense fallback={
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <div className="mx-auto mb-4 size-16 animate-spin rounded-full border-4 border-gray-200 border-t-gray-900"></div>
          <p className="text-sm font-medium text-gray-600">Memuat...</p>
        </div>
      </div>
    }>
      <KonfirmasiContent />
    </Suspense>
  )
}