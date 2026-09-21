import Sidebar from './Sidebar'
import Navbar from './Navbar'

export default function Layout({ children }) {
  return (
    <div className="h-screen w-screen max-h-screen overflow-hidden flex bg-slate-900 text-slate-900 select-none">
      {/* Sidebar Navigation */}
      <Sidebar />

      {/* Main App Canvas */}
      <div className="flex-1 flex flex-col min-w-0 h-full overflow-hidden bg-slate-50">
        {/* Top Navbar */}
        <Navbar />

        {/* Scrollable Dashboard Body */}
        <main className="flex-1 overflow-y-auto overflow-x-hidden p-4 sm:p-5 lg:p-6 space-y-4 sm:space-y-5 bg-slate-50">
          {children}
        </main>

        {/* Bottom Master Footer */}
        <footer className="h-9 bg-white border-t border-slate-200 px-6 flex items-center justify-between text-[11px] text-slate-500 shrink-0 select-none">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
            <span className="text-slate-700 font-semibold">Warehouse Management System</span>
            <span className="text-slate-300">|</span>
            <span className="text-slate-500">Authorized Operator Session</span>
          </div>

          <div className="text-slate-400 text-[11px]">
            v1.0.0 &bull; All Rights Reserved
          </div>
        </footer>
      </div>
    </div>
  )
}
