"use client"

import { useState, useEffect } from "react"
import { supabase } from "@/lib/supabase"

export default function AdminDashboard({ user }: { user: any }) {
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState({ talents: 0, companies: 0, total: 0 })
  const [users, setUsers] = useState<any[]>([])
  const [filter, setFilter] = useState("all") // all, talent, company

  useEffect(() => {
    fetchData()
  }, [])

  async function fetchData() {
    setLoading(true)
    // Ambil semua data profil (Hanya Admin yang bisa lakukan ini berkat Policy SQL tadi)
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .order('created_at', { ascending: false })

    if (data) {
      setUsers(data)
      // Hitung Statistik Sederhana
      setStats({
        total: data.length,
        talents: data.filter(u => u.role === 'talent').length,
        companies: data.filter(u => u.role === 'company').length
      })
    }
    setLoading(false)
  }

  // Filter tampilan tabel
  const filteredUsers = filter === "all" 
    ? users 
    : users.filter(u => u.role === filter)

  return (
    <div className="space-y-6">
      {/* Header Admin */}
      <div className="bg-slate-900 text-white p-6 rounded-lg shadow-md flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Panel Super Admin</h2>
          <p className="text-slate-300 text-sm">Selamat datang, {user.email}</p>
        </div>
        <div className="text-right">
          <p className="text-xs uppercase opacity-70">Total User</p>
          <p className="text-3xl font-bold">{stats.total}</p>
        </div>
      </div>

      {/* Statistik Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white dark:bg-slate-900 p-4 rounded border border-slate-200 dark:border-slate-800 shadow-sm">
          <h3 className="text-sm font-medium text-slate-500">Talenta Terdaftar</h3>
          <p className="text-2xl font-bold text-blue-600">{stats.talents}</p>
        </div>
        <div className="bg-white dark:bg-slate-900 p-4 rounded border border-slate-200 dark:border-slate-800 shadow-sm">
          <h3 className="text-sm font-medium text-slate-500">Mitra Perusahaan</h3>
          <p className="text-2xl font-bold text-green-600">{stats.companies}</p>
        </div>
        <div className="bg-white dark:bg-slate-900 p-4 rounded border border-slate-200 dark:border-slate-800 shadow-sm">
          <h3 className="text-sm font-medium text-slate-500">Kampus/Gov</h3>
          <p className="text-2xl font-bold text-orange-600">
            {stats.total - stats.talents - stats.companies}
          </p>
        </div>
      </div>

      {/* Tabel Manajemen User */}
      <div className="bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center">
          <h3 className="font-bold text-lg">Database Pengguna</h3>
          <select 
            value={filter} 
            onChange={(e) => setFilter(e.target.value)}
            className="p-2 border rounded text-sm bg-slate-50 dark:bg-slate-800"
          >
            <option value="all">Semua Role</option>
            <option value="talent">Hanya Talenta</option>
            <option value="company">Hanya Perusahaan</option>
            <option value="admin">Admin</option>
          </select>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-slate-50 dark:bg-slate-800 text-slate-500 uppercase font-medium">
              <tr>
                <th className="px-4 py-3">Nama Lengkap</th>
                <th className="px-4 py-3">Role</th>
                <th className="px-4 py-3">Email</th>
                <th className="px-4 py-3">Kota</th>
                <th className="px-4 py-3">Disabilitas</th>
                <th className="px-4 py-3">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {loading ? (
                <tr><td colSpan={6} className="p-4 text-center">Memuat data...</td></tr>
              ) : filteredUsers.length === 0 ? (
                <tr><td colSpan={6} className="p-4 text-center">Data kosong.</td></tr>
              ) : (
                filteredUsers.map((u) => (
                  <tr key={u.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                    <td className="px-4 py-3 font-medium">{u.full_name || "-"}</td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-1 rounded text-xs font-bold ${
                        u.role === 'admin' ? 'bg-purple-100 text-purple-700' :
                        u.role === 'company' ? 'bg-green-100 text-green-700' :
                        'bg-blue-100 text-blue-700'
                      }`}>
                        {u.role.toUpperCase()}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-slate-500">{u.email}</td>
                    <td className="px-4 py-3">{u.city || "-"}</td>
                    <td className="px-4 py-3">{u.disability_category || "-"}</td>
                    <td className="px-4 py-3">
                        {/* Contoh Badge Status - Nanti bisa dikembangkan */}
                        <span className="text-green-600 text-xs">Aktif</span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
