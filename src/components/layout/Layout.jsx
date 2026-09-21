import Sidebar from './Sidebar'
import Navbar from './Navbar'

export default function Layout({ children }) {
  return (
    <div className="h-screen h-[100dvh] w-screen max-h-screen overflow-hidden flex bg-slate-900 text-slate-900 select-none">
      {/* Sidebar Navigation */}
      <Sidebar />

      {/* Main App Canvas */}
      <div className="flex-1 flex flex-col min-w-0 h-full overflow-hidden bg-slate-50">
        {/* Top Navbar */}
        <Navbar />

        {/* Scrollable Dashboard Body */}
        <main className="flex-1 overflow-y-auto overflow-x-hidden p-3.5 sm:p-5 lg:p-6 space-y-4 sm:space-y-5 bg-slate-50">
          {children}
        </main>

        {/* Bottom Master Footer */}
        <footer className="py-2 sm:py-0 sm:h-9 bg-white border-t border-slate-200 px-3 sm:px-6 flex flex-col sm:flex-row items-center justify-between text-[10px] sm:text-[11px] text-slate-500 shrink-0 select-none gap-1 sm:gap-0">
          <div className="flex items-center gap-1.5 sm:gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0" />
            <span className="text-slate-700 font-semibold truncate">Warehouse MS</span>
            <span className="text-slate-300">|</span>
            <span className="text-slate-500 truncate">Authorized Session</span>
          </div>

          <div className="text-slate-400 text-[10px] sm:text-[11px]">
            v1.0.0 &bull; All Rights Reserved
          </div>
        </footer>
      </div>
    </div>
  )
}
