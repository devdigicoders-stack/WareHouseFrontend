import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { LogOut } from 'lucide-react'
import { useApp } from '../../hooks/useApp'

export default function Navbar() {
  const navigate = useNavigate()
  const { logout } = useApp()
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
    <header className="h-16 bg-[#131A11] border-b border-[#232F20] px-4 sm:px-6 flex items-center justify-between text-white shrink-0 select-none z-30 sticky top-0">
      {/* Left: Brand Title */}
      <div className="flex items-center gap-3">
        <div>
          <h1 className="text-base sm:text-lg font-bold tracking-tight text-white flex items-center gap-2">
            Warehouse Management System
          </h1>
          <p className="text-[11px] text-slate-400 font-medium hidden sm:block">
            Central Warehouse Logistics &nbsp;|&nbsp; Secure • Scalable • Reliable
          </p>
        </div>
      </div>

      {/* Right: Live Time & Logout Action */}
      <div className="flex items-center gap-3 sm:gap-4">
        {/* Live Date & Time Display */}
        <div className="text-right hidden sm:block leading-tight">
          <p className="text-[11px] text-slate-400">{formattedDate}</p>
          <p className="text-sm font-bold text-white tracking-wide">{formattedTime}</p>
        </div>

        <div className="h-8 w-px bg-[#232F20] hidden sm:block"></div>

        {/* Direct Logout Button */}
        <button
          type="button"
          onClick={handleLogout}
          className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 hover:text-white border border-rose-500/30 hover:border-rose-500/50 transition-all cursor-pointer text-xs font-semibold group shadow-xs active:scale-98"
          title="Logout of session"
          aria-label="Logout"
        >
          <LogOut className="w-4 h-4 text-rose-400 group-hover:text-rose-200 transition-transform group-hover:-translate-x-0.5" />
          <span>Logout</span>
        </button>
      </div>
    </header>
  )
}
