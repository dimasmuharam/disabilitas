"use client";

import React, { useState } from "react";
import { updateTalentProfile } from "@/lib/actions/talent";

export default function TestSyncPage() {
  const [status, setStatus] = useState("Siap ngetes...");
  const [loading, setLoading] = useState(false);

  // GANTI ID INI dengan ID Mas yang ada di database (UUID)
  const TEST_USER_ID = "e72b67e4-2f9e-4f6b-a82c-ed9307ddd1e5"; 

  const jalankanTes = async () => {
    setLoading(true);
    setStatus("Sedang mengirim data tes...");
    
    try {
      // Kita tes update kolom paling sederhana
      const dataTes = {
        education_level: "Sarjana (S1 / D4)",
        university: "Universitas Indonesia",
        education_model: "Reguler"
      };

      const result = await updateTalentProfile(TEST_USER_ID, dataTes);

      if (result.success) {
        setStatus("BERHASIL! Kabel ke database nyambung sempurna.");
      } else {
        setStatus(`GAGAL: ${result.error}`);
      }
    } catch (err: any) {
      setStatus(`CRASH: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: "50px", textAlign: "center", fontFamily: "sans-serif" }}>
      <h1 style={{ fontSize: "24px", fontWeight: "bold" }}>Alat Tes Koneksi Database</h1>
      <p style={{ margin: "20px 0", fontSize: "18px", color: "#666" }}>{status}</p>
      
      <button 
        onClick={jalankanTes}
        disabled={loading}
        style={{
          padding: "20px 40px",
          fontSize: "16px",
          fontWeight: "bold",
          backgroundColor: loading ? "#ccc" : "#000",
          color: "#fff",
          border: "none",
          borderRadius: "10px",
          cursor: "pointer"
        }}
      >
        {loading ? "MENGIRIM..." : "KLIK UNTUK TES UPDATE"}
      </button>

      <div style={{ marginTop: "40px", fontSize: "12px", color: "#999" }}>
        <p>Gunakan halaman ini hanya untuk memastikan Server Action talent.ts bekerja.</p>
      </div>
    </div>
  );
}