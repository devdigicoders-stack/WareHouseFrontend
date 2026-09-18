import Sidebar from './Sidebar'
import Navbar from './Navbar'
import TricolorBar from '../common/TricolorBar'
import { Swords } from 'lucide-react'

export default function Layout({ children }) {
  return (
    <div className="h-screen w-screen max-h-screen overflow-hidden flex bg-[#0E150D] text-slate-900 select-none">
      {/* Sidebar Navigation */}
      <Sidebar />

      {/* Main App Canvas */}
      <div className="flex-1 flex flex-col min-w-0 h-full overflow-hidden bg-[#F3F6F1]">
        {/* Top Navbar */}
        <Navbar />

        {/* Scrollable Dashboard Body */}
        <main className="flex-1 overflow-y-auto overflow-x-hidden p-4 sm:p-5 lg:p-6 space-y-4 sm:space-y-5 bg-[#F3F6F1]">
          {children}
        </main>

        {/* Bottom Master Footer */}
        <footer className="h-9 bg-[#11180F] border-t border-[#1E281C] px-6 flex items-center justify-between text-[11px] text-slate-400 shrink-0 select-none">
          <div className="flex items-center gap-2">
            <svg className="w-3.5 h-3.5 text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
            </svg>
            <span className="text-slate-300 font-semibold">Secure</span>
            <span className="text-slate-600">|</span>
            <span className="text-slate-300">Confidential</span>
            <span className="text-slate-600">|</span>
            <span className="text-slate-300 font-medium">For Official Use Only</span>
          </div>

          <div className="hidden md:flex items-center gap-2">
            <Swords className="w-3.5 h-3.5 text-amber-400" />
            <span className="font-semibold text-slate-200 uppercase tracking-wider text-[11px]">
              INDIAN ARMY
            </span>
            <span className="text-slate-600">|</span>
            <span className="text-slate-400">Warehouse Management System v1.0.0</span>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-slate-400 text-[11px] hidden sm:inline">Developed for a Stronger & Self-Reliant Nation</span>
            <TricolorBar className="w-14 h-1.5 ml-1" />
          </div>
        </footer>
      </div>
    </div>
  )
}
