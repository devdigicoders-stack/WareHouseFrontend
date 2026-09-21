import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { LogOut } from 'lucide-react'
import { useApp } from '../../hooks/useApp'

export default function Navbar() {
  const navigate = useNavigate()
  const { logout, user } = useApp()
  const [currentTime, setCurrentTime] = useState(new Date())

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000)
    return () => clearInterval(timer)
  }, [])

  const formattedDate = currentTime.toLocaleDateString('en-GB', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })

  const formattedTime = currentTime.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  })

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  return (
    <header className="h-16 bg-white border-b border-slate-200 px-4 sm:px-6 flex items-center justify-between text-slate-800 shrink-0 select-none z-30 sticky top-0">
      {/* Left: Brand Title */}
      <div className="flex items-center gap-3">
        <div>
          <h1 className="text-base sm:text-lg font-bold tracking-tight text-slate-900 flex items-center gap-2">
            Warehouse Management System
          </h1>
          <p className="text-[11px] text-slate-500 font-medium hidden sm:block">
            Central Logistics & Inventory Operations
          </p>
        </div>
      </div>

      {/* Right: Live Time & Logout Action */}
      <div className="flex items-center gap-3 sm:gap-4">
        {/* Live Date & Time Display */}
        <div className="text-right hidden sm:block leading-tight">
          <p className="text-[11px] text-slate-500">{formattedDate}</p>
          <p className="text-sm font-bold text-slate-800 tracking-wide">{formattedTime}</p>
        </div>

        <div className="h-8 w-px bg-slate-200 hidden sm:block"></div>

        {/* User badge */}
        <div className="hidden md:flex items-center gap-2 px-2.5 py-1 rounded-lg bg-slate-50 border border-slate-200">
          <div className="w-6 h-6 rounded-full bg-indigo-600 text-white flex items-center justify-center text-xs font-bold">
            {(!user?.name || /admin/i.test(user.name)) ? 'W' : user.name.charAt(0)}
          </div>
          <div className="text-left leading-none">
            <p className="text-xs font-semibold text-slate-800">
              {(!user?.name || /admin/i.test(user.name)) ? 'Warehouse Manager' : user.name}
            </p>
            <p className="text-[10px] text-slate-500">{user?.role || 'Operations Manager'}</p>
          </div>
        </div>

        {/* Direct Logout Button */}
        <button
          type="button"
          onClick={handleLogout}
          className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-600 hover:text-rose-700 border border-rose-200 hover:border-rose-300 transition-all cursor-pointer text-xs font-semibold group shadow-xs active:scale-98"
          title="Logout of session"
          aria-label="Logout"
        >
          <LogOut className="w-4 h-4 text-rose-500 group-hover:text-rose-600 transition-transform group-hover:-translate-x-0.5" />
          <span>Logout</span>
        </button>
      </div>
    </header>
  )
}
