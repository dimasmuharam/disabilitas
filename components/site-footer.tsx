import { Globe } from "lucide-react"

export function SiteFooter() {
  return (
    <footer className="w-full py-6 bg-slate-100 dark:bg-slate-950 border-t border-slate-200 dark:border-slate-800 mt-auto">
      <div className="container px-4 md:px-6 flex flex-col md:flex-row justify-between items-center gap-4">
        <div className="flex flex-col space-y-2 text-center md:text-left">
          <p className="text-sm font-bold text-slate-900 dark:text-slate-50">
            Disabilitas.com
          </p>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Platform Ekosistem Digital Inklusif & Terintegrasi.
            <br />
            Bagian dari <a href="https://dimaster.co.id" className="underline hover:text-blue-600 font-medium" target="_blank" rel="noopener noreferrer">Dimaster Group</a>.
          </p>
          <p className="text-[10px] text-slate-400">
            © 2025 PT Dimaster Education Berprestasi. All rights reserved.
          </p>
        </div>
        
        <nav className="flex flex-col sm:flex-row gap-4 sm:gap-6 items-center">
          <a href="https://dimaster.co.id" className="flex items-center text-xs text-slate-500 hover:text-blue-600 dark:text-slate-400 dark:hover:text-blue-400 transition-colors" target="_blank" rel="noopener noreferrer">
            <Globe className="h-3 w-3 mr-1" /> Corporate Profile
          </a>
          <a href="#" className="text-xs text-slate-500 hover:underline underline-offset-4">
            Syarat & Ketentuan
          </a>
          <a href="#" className="text-xs text-slate-500 hover:underline underline-offset-4">
            Kebijakan Privasi
          </a>
        </nav>
      </div>
    </footer>
  )
}
