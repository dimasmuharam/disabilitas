"use client";

import { useEffect, useRef } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";

export default function KonfirmasiPendaftaran() {
  const searchParams = useSearchParams();
  const email = searchParams.get("email") || "email Anda";
  const headingRef = useRef<HTMLHeadingElement>(null);

  // Auto-focus ke heading saat halaman dimuat agar Screen Reader langsung membacanya
  useEffect(() => {
    if (headingRef.current) {
      headingRef.current.focus();
    }
  }, []);

  return (
    <main 
      className="min-h-screen flex items-center justify-center bg-gray-50 px-4 py-12"
      role="main"
      aria-labelledby="page-title"
    >
      <div className="max-w-md w-full space-y-8 bg-white p-10 rounded-xl shadow-lg border border-gray-100">
        <div className="text-center">
          {/* Icon visual yang disembunyikan dari SR karena sudah ada teks penjelasan */}
          <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-green-100 mb-6" aria-hidden="true">
            <svg className="h-10 w-10 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
            </svg>
          </div>

          {/* Heading dengan tabIndex -1 agar bisa difokuskan secara programmatik */}
          <h1 
            id="page-title"
            ref={headingRef}
            tabIndex={-1}
            className="text-3xl font-extrabold text-gray-900 focus:outline-none"
          >
            Satu Langkah Lagi!
          </h1>
          
          <p className="mt-4 text-gray-600">
            Pendaftaran akun Anda berhasil dilakukan. Kami telah mengirimkan tautan verifikasi ke:
          </p>
          <p className="mt-2 font-bold text-blue-600 break-all" aria-label={`Alamat email: ${email}`}>
            {email}
          </p>
        </div>

        <div className="mt-8 space-y-6">
          <div className="rounded-md bg-blue-50 p-4 border-l-4 border-blue-400">
            <div className="flex">
              <div className="ml-3">
                <h2 className="text-sm font-medium text-blue-800">Instruksi Penting:</h2>
                <div className="mt-2 text-sm text-blue-700">
                  <ul role="list" className="list-disc pl-5 space-y-1">
                    <li>Periksa kotak masuk (inbox) email Anda.</li>
                    <li>Klik tombol <strong>"Confirm Email"</strong> di dalam pesan tersebut.</li>
                    <li>Jika tidak ada, silakan periksa folder <strong>Spam</strong> atau <strong>Promosi</strong>.</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>

          <div className="text-sm text-center">
            <p className="text-gray-500 mb-4">
              Sudah memverifikasi email?
            </p>
            <Link
              href="/login"
              className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Masuk ke Akun Anda
            </Link>
          </div>

          <div className="flex flex-col items-center justify-center space-y-4">
            <button 
              type="button"
              className="text-sm font-medium text-blue-600 hover:text-blue-500"
              onClick={() => alert("Fitur kirim ulang email sedang diproses.")}
            >
              Tidak menerima email? Kirim ulang
            </button>
            
            <Link href="/" className="text-xs text-gray-400 hover:underline">
              Kembali ke Beranda
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}