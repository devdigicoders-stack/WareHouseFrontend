import { useState, useEffect, useRef, useCallback } from 'react'
import { KeyRound, HardDrive, Delete, Zap, Unlock, CheckCircle2, AlertOctagon, Usb, AlertTriangle, FolderOpen } from 'lucide-react'
import TricolorBar from '../components/common/TricolorBar'
import HimalayanWatermark from '../components/common/HimalayanWatermark'
import MilitarySilhouettes from '../components/common/MilitarySilhouettes'

// Designated Single Operator Profile (constant)
const designatedUser = {
  userId: 'WMS-ADMIN-1947',
  name: 'Rajesh Sharma',
  role: 'Warehouse Operations Manager',
  rank: 'Head Storekeeper',
  department: 'Central Warehouse Logistics Operations',
  terminal: 'WMS-TERMINAL-01',
}

export default function LoginPage({ onLoginSuccess }) {
  // Authentication mode: 'pin' or 'pendrive'
  const [authMode, setAuthMode] = useState('pin')
  
  // PIN state (4 digits)
  const [pin, setPin] = useState('')
  const [pinError, setPinError] = useState('')
  const [pinLoading, setPinLoading] = useState(false)
  const [shake, setShake] = useState(false)
  
  // Pendrive / USB state
  const [usbStatus, setUsbStatus] = useState('idle') // 'idle' | 'reading' | 'verifying' | 'authenticated' | 'rejected'
  const [usbError, setUsbError] = useState('')
  const [selectedFileName, setSelectedFileName] = useState('')
  const fileInputRef = useRef(null)

  // PIN verification logic declared before usage in useEffect
  const handlePinSubmit = useCallback((pinToTest) => {
    const code = pinToTest || pin
    if (code.length < 4) {
      setPinError('Please enter a 4-digit security PIN')
      return
    }

    setPinLoading(true)
    setPinError('')

    setTimeout(() => {
      // Valid PINs: 1947, 1234, 0000, 9999
      if (code === '1947' || code === '1234' || code === '0000' || code === '9999') {
        setPinLoading(false)
        if (onLoginSuccess) {
          onLoginSuccess({
            ...designatedUser,
            authMethod: 'Security PIN',
            loginTime: new Date().toISOString(),
          })
        }
      } else {
        setPinLoading(false)
        setPinError('Access Denied: Invalid Security PIN! Unauthorized attempt logged.')
        setShake(true)
        setTimeout(() => setShake(false), 500)
        setPin('')
      }
    }, 600)
  }, [pin, onLoginSuccess])

  // Handle Physical Keyboard Input for PIN
  useEffect(() => {
    if (authMode !== 'pin') return

    const handleKeyDown = (e) => {
      if (pinLoading) return

      if (e.key >= '0' && e.key <= '9') {
        if (pin.length < 4) {
          const nextPin = pin + e.key
          setPin(nextPin)
          setPinError('')
          if (nextPin.length === 4) {
            handlePinSubmit(nextPin)
          }
        }
      } else if (e.key === 'Backspace') {
        setPin((prev) => prev.slice(0, -1))
        setPinError('')
      } else if (e.key === 'Enter') {
        if (pin.length === 4) {
          handlePinSubmit(pin)
        }
      } else if (e.key === 'Escape') {
        setPin('')
        setPinError('')
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [authMode, pin, pinLoading, handlePinSubmit])

  // Keypad click handler
  const handleKeypadPress = (val) => {
    if (pinLoading) return
    setPinError('')

    if (val === 'clear') {
      setPin('')
    } else if (val === 'backspace') {
      setPin((prev) => prev.slice(0, -1))
    } else if (typeof val === 'number') {
      if (pin.length < 4) {
        const nextPin = pin + val.toString()
        setPin(nextPin)
        if (nextPin.length === 4) {
          handlePinSubmit(nextPin)
        }
      }
    }
  }

  // Pendrive simulation: Authorized USB insertion
  const handleInsertAuthorizedUsb = () => {
    setUsbError('')
    setUsbStatus('reading')

    setTimeout(() => {
      setUsbStatus('verifying')
      setTimeout(() => {
        setUsbStatus('authenticated')
        setTimeout(() => {
          if (onLoginSuccess) {
            onLoginSuccess({
              ...designatedUser,
              authMethod: 'Hardware Security Key (USB Dongle)',
              usbToken: 'WMS-SEC-KEY-2026-AUTH-TOKEN',
              loginTime: new Date().toISOString(),
            })
          }
        }, 600)
      }, 700)
    }, 600)
  }

  // Pendrive simulation: Unauthorized / Corrupt USB key
  const handleInsertInvalidUsb = () => {
    setUsbError('')
    setUsbStatus('reading')

    setTimeout(() => {
      setUsbStatus('rejected')
      setUsbError('Security Exception: Unauthorized Hardware Token!')
      setShake(true)
      setTimeout(() => setShake(false), 500)
      setTimeout(() => setUsbStatus('idle'), 2500)
    }, 800)
  }

  // Handle Token File Select
  const handleFileSelect = (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    setSelectedFileName(file.name)
    handleInsertAuthorizedUsb()
  }

  const features = [
    {
      id: 'gate',
      title: 'Gate Management',
      icon: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M8 17H5a2 2 0 01-2-2V7a2 2 0 012-2h10a2 2 0 012 2v2m-6 8h6m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0zm10-6h3.5a1.5 1.5 0 011.2.6L22 14v3a1 1 0 01-1 1h-2" />
        </svg>
      ),
    },
    {
      id: 'grn',
      title: 'GRN & Receiving',
      icon: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
        </svg>
      ),
    },
    {
      id: 'location',
      title: 'Location Tracking',
      icon: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
      ),
    },
    {
      id: 'lab',
      title: 'Lab Testing',
      icon: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
        </svg>
      ),
    },
    {
      id: 'qr',
      title: 'QR / Barcode',
      icon: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" />
        </svg>
      ),
    },
    {
      id: 'inventory',
      title: 'Inventory Control',
      icon: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
        </svg>
      ),
    },
    {
      id: 'expiry',
      title: 'Expiry Management',
      icon: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
      ),
    },
    {
      id: 'reports',
      title: 'Reports & Analytics',
      icon: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
        </svg>
      ),
    },
    {
      id: 'visibility',
      title: 'End-to-End Visibility',
      icon: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
        </svg>
      ),
    },
  ]

  return (
    <div
      className="min-h-screen w-screen overflow-x-hidden overflow-y-auto relative flex flex-col justify-between select-none"
      style={{
        backgroundImage: "url('/login.png')",
        backgroundColor: '#0A0F1A',
        backgroundPosition: 'center top',
        backgroundSize: 'cover',
        backgroundRepeat: 'no-repeat',
      }}
    >
      {/* Background Overlays: Responsive gradient */}
      <div className="absolute inset-0 bg-black/60 lg:bg-transparent pointer-events-none"></div>
      <div className="absolute inset-y-0 left-0 w-full lg:w-1/2 bg-gradient-to-b lg:bg-gradient-to-r from-black/95 via-black/85 via-65% to-transparent pointer-events-none"></div>
      <div className="absolute inset-x-0 top-0 h-20 bg-gradient-to-b from-black/60 to-transparent pointer-events-none"></div>
      <div className="absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-black/70 to-transparent pointer-events-none"></div>

      {/* Top Header Bar */}
      <header className="relative z-20 w-full px-4 sm:px-6 lg:px-12 pt-2 pb-1 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-3 sm:gap-4">
          <img
            src="/logo.png"
            alt="Central Warehouse Logo"
            className="h-10 sm:h-12 w-auto object-contain drop-shadow-xl"
          />
          <div className="h-7 w-px bg-white/25 hidden sm:block"></div>
          <div className="hidden sm:block">
            <h2 className="text-white text-[10px] sm:text-[11px] font-bold tracking-[0.2em] uppercase leading-tight">
              STRONG LOGISTICS
            </h2>
            <h2 className="text-amber-400 text-[10px] sm:text-[11px] font-bold tracking-[0.2em] uppercase leading-tight mt-0.5">
              STRONGER NATION
            </h2>
            <TricolorBar className="w-16 h-0.5 mt-1" />
          </div>
        </div>
      </header>

      {/* Main Viewport Content */}
      <main className="relative z-10 w-full flex-1 max-w-[1680px] mx-auto px-4 sm:px-8 lg:px-12 flex flex-col lg:flex-row items-center justify-center my-auto min-h-0 py-2 sm:py-3 gap-6 lg:gap-8">
        
        {/* Left Side: Brand Statement & 3x3 Feature Grid */}
        <div className="w-full lg:flex-1 flex flex-col justify-center max-w-xl py-1 min-h-0 space-y-2.5 my-auto text-white order-2 lg:order-1">
          <div className="text-center lg:text-left">
            <p className="text-amber-400 font-bold tracking-[0.25em] text-[10px] uppercase mb-0.5 drop-shadow">
              FMCG WAREHOUSE LOGISTICS MANAGEMENT
            </p>
            <h1 className="text-2xl sm:text-3xl lg:text-[38px] font-bold tracking-tight text-white leading-tight drop-shadow-md">
              Warehouse <br className="hidden sm:block" />
              <span className="text-slate-100">Management System</span>
            </h1>
            <div className="flex justify-center lg:justify-start">
              <TricolorBar className="w-16 h-0.5 mt-1.5" />
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-center lg:justify-start gap-1.5 text-[11px] font-semibold tracking-wider text-slate-200">
            <span>Gate</span>
            <span className="text-amber-400/70">›</span>
            <span>GRN</span>
            <span className="text-amber-400/70">›</span>
            <span>Batch</span>
            <span className="text-amber-400/70">›</span>
            <span>Lab</span>
            <span className="text-amber-400/70">›</span>
            <span>Warehouse (6 Shades)</span>
            <span className="text-amber-400/70">›</span>
            <span>Dispatch</span>
          </div>

          <p className="text-slate-300 text-xs leading-relaxed max-w-lg mx-auto lg:mx-0 text-center lg:text-left drop-shadow">
            Single-console operational terminal for Central Warehouse Logistics. End-to-end material tracking from Gate Entry, Goods Receiving, Quality Lab Inspection to 6-Shade Warehouse Put-Away and QR Dispatch.
          </p>

          {/* 3x3 Glassmorphic Feature Cards Grid */}
          <div className="grid grid-cols-3 gap-1.5 sm:gap-2 max-w-md mx-auto lg:mx-0 w-full pt-0.5">
            {features.map((item) => (
              <div
                key={item.id}
                className="bg-black/55 hover:bg-black/75 backdrop-blur-md border border-white/10 hover:border-amber-400/40 rounded-xl p-1.5 sm:p-2 flex flex-col items-center justify-center text-center transition-all duration-200 shadow-md group cursor-default"
              >
                <div className="w-6 h-6 rounded-lg bg-white/10 flex items-center justify-center text-amber-300 group-hover:scale-105 group-hover:text-amber-400 transition-transform">
                  {item.icon}
                </div>
                <span className="text-[10px] font-medium text-slate-200 mt-1 leading-tight">
                  {item.title}
                </span>
              </div>
            ))}
          </div>

          {/* Bottom Left Footer Tagline + Soldiers Silhouette */}
          <div className="pt-1.5 border-t border-white/10 flex items-center justify-between max-w-md mx-auto lg:mx-0 w-full">
            <div>
              <p className="text-[9px] font-semibold uppercase tracking-[0.2em] text-slate-400">
                LOGISTICS TODAY
              </p>
              <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-white mt-0.5">
                READINESS TOMORROW
              </p>
              <TricolorBar className="w-12 h-0.5 mt-0.5" />
            </div>
            <MilitarySilhouettes className="w-32 sm:w-36 h-7 text-white/50 hidden sm:block" />
          </div>
        </div>

        {/* Right Side: Single-User Military Authentication Console */}
        <div className="w-full sm:w-[380px] lg:w-[400px] shrink-0 self-center order-1 lg:order-2 my-auto">
          <div className={`relative bg-white text-slate-900 rounded-2xl shadow-2xl overflow-hidden border border-white/90 p-4 sm:p-4.5 flex flex-col justify-between max-h-[95vh] overflow-y-auto scrollbar-none transition-transform duration-150 ${shake ? 'animate-shake' : ''}`}>
            
            {/* Top Logo & Console Title */}
            <div className="text-center flex flex-col items-center">
              <img
                src="/logo.png"
                alt="Central Warehouse Emblem"
                className="h-11 sm:h-12 w-auto object-contain drop-shadow"
              />
              <p className="text-[#2B3A1C] font-extrabold text-[10px] sm:text-[11px] tracking-[0.16em] uppercase mt-1">
                WAREHOUSE MANAGEMENT SYSTEM
              </p>
              <TricolorBar className="w-14 h-0.5 my-1" />
              <p className="text-[9px] text-gray-500 font-medium">
                Secure Logistics &nbsp;|&nbsp; Stronger Forces
              </p>
            </div>

            {/* Authentication Method Selector Tabs (PIN vs Pendrive) */}
            <div className="mt-2.5 grid grid-cols-2 gap-1.5 p-1 rounded-xl bg-slate-100 border border-slate-200">
              <button
                type="button"
                onClick={() => {
                  setAuthMode('pin')
                  setPinError('')
                  setUsbError('')
                }}
                className={`py-1.5 px-2 rounded-lg text-[11px] font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                  authMode === 'pin'
                    ? 'bg-[#1E3A1E] text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
                }`}
              >
                <KeyRound className="w-3.5 h-3.5" />
                <span>Login with PIN</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setAuthMode('pendrive')
                  setPinError('')
                  setUsbError('')
                }}
                className={`py-1.5 px-2 rounded-lg text-[11px] font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                  authMode === 'pendrive'
                    ? 'bg-[#1E3A1E] text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
                }`}
              >
                <HardDrive className="w-3.5 h-3.5" />
                <span>Login with Pendrive</span>
              </button>
            </div>

            {/* OPTION 1: PIN LOGIN FORM */}
            {authMode === 'pin' && (
              <div className="mt-2 space-y-2">
                <div className="text-center">
                  <p className="text-xs font-bold text-slate-700">
                    Enter 4-Digit Security PIN
                  </p>
                  <p className="text-[9px] text-slate-400 mt-0.5">
                    Use on-screen keypad or keyboard (Default: <strong className="text-slate-700 font-mono">1947</strong>)
                  </p>
                </div>

                {/* 4 PIN Circles / Boxes */}
                <div className="flex items-center justify-center gap-2.5 my-0.5">
                  {[0, 1, 2, 3].map((idx) => {
                    const isFilled = pin.length > idx
                    const isCurrent = pin.length === idx
                    return (
                      <div
                        key={idx}
                        className={`w-9 h-9 sm:w-10 sm:h-10 rounded-lg border-2 flex items-center justify-center text-base font-mono font-bold transition-all duration-150 ${
                          isFilled
                            ? 'border-[#1E3A1E] bg-[#1E3A1E]/10 text-[#1E3A1E] scale-105 shadow-xs'
                            : isCurrent
                            ? 'border-emerald-500 bg-white ring-2 ring-emerald-400/30'
                            : 'border-slate-200 bg-slate-50 text-slate-400'
                        }`}
                      >
                        {isFilled ? '●' : ''}
                      </div>
                    )
                  })}
                </div>

                {/* Error Banner */}
                {pinError && (
                  <div className="p-1.5 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 text-[10px] font-medium flex items-center gap-1.5 animate-fade-in">
                    <svg className="w-3.5 h-3.5 text-rose-500 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span className="truncate">{pinError}</span>
                  </div>
                )}

                {/* On-Screen Numeric Keypad */}
                <div className="grid grid-cols-3 gap-1.5 max-w-[240px] mx-auto pt-0.5">
                  {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
                    <button
                      key={num}
                      type="button"
                      onClick={() => handleKeypadPress(num)}
                      className="h-8 rounded-md bg-slate-50 hover:bg-slate-100 active:bg-slate-200 border border-slate-200/90 text-slate-800 font-bold text-xs font-mono shadow-2xs transition-all active:scale-95 cursor-pointer flex items-center justify-center"
                    >
                      {num}
                    </button>
                  ))}
                  
                  {/* Clear button */}
                  <button
                    type="button"
                    onClick={() => handleKeypadPress('clear')}
                    className="h-8 rounded-md bg-rose-50 hover:bg-rose-100 border border-rose-200 text-rose-700 font-bold text-[11px] shadow-2xs transition-all active:scale-95 cursor-pointer flex items-center justify-center"
                    title="Clear All"
                  >
                    Clear
                  </button>

                  {/* 0 Key */}
                  <button
                    type="button"
                    onClick={() => handleKeypadPress(0)}
                    className="h-8 rounded-md bg-slate-50 hover:bg-slate-100 active:bg-slate-200 border border-slate-200/90 text-slate-800 font-bold text-xs font-mono shadow-2xs transition-all active:scale-95 cursor-pointer flex items-center justify-center"
                  >
                    0
                  </button>

                  {/* Backspace Key */}
                  <button
                    type="button"
                    onClick={() => handleKeypadPress('backspace')}
                    className="h-8 rounded-md bg-slate-100 hover:bg-slate-200 border border-slate-200 text-slate-700 font-bold text-xs shadow-2xs transition-all active:scale-95 cursor-pointer flex items-center justify-center"
                    title="Backspace"
                  >
                    <Delete className="w-3.5 h-3.5" />
                  </button>
                </div>

                {/* Action Buttons: Auto-fill & Submit */}
                <div className="space-y-1.5 pt-0.5">
                  <button
                    type="button"
                    onClick={() => {
                      setPin('1947')
                      setPinError('')
                      handlePinSubmit('1947')
                    }}
                    className="w-full py-1 px-2.5 rounded-lg border border-emerald-300 bg-emerald-50/70 hover:bg-emerald-100 text-emerald-800 text-[10px] font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <Zap className="w-3.5 h-3.5 text-amber-500" />
                    <span>Quick Fill Default Commander PIN (1947)</span>
                  </button>

                  <button
                    type="button"
                    disabled={pinLoading || pin.length !== 4}
                    onClick={() => handlePinSubmit(pin)}
                    className="w-full py-2 px-3 rounded-lg bg-[#1E3A1E] hover:bg-[#274a27] active:scale-[0.99] text-white text-xs font-bold flex items-center justify-center gap-2 shadow-sm transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {pinLoading ? (
                      <>
                        <span className="inline-block w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                        <span>Verifying PIN...</span>
                      </>
                    ) : (
                      <>
                        <Unlock className="w-3.5 h-3.5" />
                        <span>Authenticate & Open Dashboard</span>
                        <span>→</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            )}

            {/* OPTION 2: PENDRIVE LOGIN FORM */}
            {authMode === 'pendrive' && (
              <div className="mt-2 space-y-2">
                <div className="text-center">
                  <p className="text-xs font-bold text-slate-700">
                    Hardware USB Security Key
                  </p>
                  <p className="text-[9px] text-slate-400 mt-0.5">
                    Insert military dongle or select authorization token
                  </p>
                </div>

                {/* USB Dongle Visual Graphic & Status */}
                <div className="bg-slate-900 text-white rounded-xl p-3 border border-slate-800 relative overflow-hidden shadow-inner">
                  <div className="absolute inset-0 bg-[radial-gradient(#334155_1px,transparent_1px)] [background-size:10px_10px] opacity-20"></div>

                  <div className="relative z-10 flex flex-col items-center text-center">
                    {/* USB Dongle Graphic */}
                    <div className="relative my-1">
                      <div className="w-16 h-8 rounded-md bg-gradient-to-b from-slate-700 to-slate-800 border border-slate-600 shadow flex items-center justify-between px-2.5">
                        <div className="w-2.5 h-4 bg-gradient-to-r from-slate-300 to-slate-400 rounded-2xs border border-slate-500 -ml-4 flex flex-col justify-around py-0.5 px-0.5">
                          <div className="h-0.5 bg-slate-600 rounded-2xs"></div>
                          <div className="h-0.5 bg-slate-600 rounded-2xs"></div>
                        </div>
                        <div className="text-[9px] font-bold text-amber-400 font-mono tracking-wider">
                          AOC
                        </div>
                        <div
                          className={`w-2.5 h-2.5 rounded-full transition-colors ${
                            usbStatus === 'authenticated'
                              ? 'bg-emerald-400 shadow-[0_0_8px_#34d399]'
                              : usbStatus === 'reading' || usbStatus === 'verifying'
                              ? 'bg-amber-400 animate-ping shadow-[0_0_8px_#fbbf24]'
                              : usbStatus === 'rejected'
                              ? 'bg-rose-500 shadow-[0_0_8px_#f43f5e]'
                              : 'bg-emerald-500/40'
                          }`}
                        />
                      </div>
                    </div>

                    {/* Diagnostics */}
                    <div className="mt-1 text-center w-full">
                      <div className="text-[9px] font-mono text-slate-400 flex items-center justify-center gap-1.5">
                        <span>PORT: 01</span>
                        <span>•</span>
                        <span className="text-emerald-400 font-semibold">TPM 2.0</span>
                      </div>

                      <div className="mt-0.5 font-mono text-[11px] font-bold text-amber-300 min-h-[16px] flex items-center justify-center">
                        {usbStatus === 'idle' && 'Waiting for Hardware Token...'}
                        {usbStatus === 'reading' && 'Detecting USB Device...'}
                        {usbStatus === 'verifying' && 'Validating RSA Signature...'}
                        {usbStatus === 'authenticated' && (
                          <span className="text-emerald-400 flex items-center gap-1">
                            <CheckCircle2 className="w-3.5 h-3.5 inline" /> Token Verified: Access Granted!
                          </span>
                        )}
                        {usbStatus === 'rejected' && (
                          <span className="text-rose-400 flex items-center gap-1">
                            <AlertOctagon className="w-3.5 h-3.5 inline" /> Unauthorized Token Signature!
                          </span>
                        )}
                      </div>

                      <div className="text-[8px] font-mono text-slate-400 truncate">
                        TOKEN: {usbStatus === 'authenticated' ? 'IND-ARMY-SEC-2026-HQ-AUTH' : 'STANDBY'}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Error Banner */}
                {usbError && (
                  <div className="p-1.5 rounded-md bg-rose-50 border border-rose-200 text-rose-700 text-[10px] font-medium flex items-center gap-1.5 animate-fade-in">
                    <svg className="w-3.5 h-3.5 text-rose-500 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span className="truncate">{usbError}</span>
                  </div>
                )}

                {/* Actions */}
                <div className="space-y-1.5 pt-0.5">
                  <button
                    type="button"
                    disabled={usbStatus === 'reading' || usbStatus === 'verifying' || usbStatus === 'authenticated'}
                    onClick={handleInsertAuthorizedUsb}
                    className="w-full py-2 px-3 rounded-lg bg-[#1E3A1E] hover:bg-[#274a27] text-white text-xs font-bold flex items-center justify-center gap-2 shadow-sm transition-all cursor-pointer disabled:opacity-50"
                  >
                    {usbStatus === 'reading' || usbStatus === 'verifying' ? (
                      <>
                        <span className="inline-block w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                        <span>Verifying Hardware Key...</span>
                      </>
                    ) : (
                      <>
                        <Usb className="w-3.5 h-3.5" />
                        <span>Insert Authorized Pendrive</span>
                        <span>→</span>
                      </>
                    )}
                  </button>

                  <div className="grid grid-cols-2 gap-1.5">
                    <button
                      type="button"
                      disabled={usbStatus === 'reading' || usbStatus === 'verifying'}
                      onClick={handleInsertInvalidUsb}
                      className="py-1 px-2 rounded-md border border-rose-200 bg-rose-50/70 hover:bg-rose-100 text-rose-700 text-[10px] font-bold transition-colors cursor-pointer flex items-center justify-center gap-1"
                    >
                      <AlertTriangle className="w-3 h-3 text-rose-500" />
                      <span>Test Invalid USB</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="py-1 px-2 rounded-md border border-slate-200 hover:bg-slate-50 text-slate-700 text-[10px] font-bold transition-colors cursor-pointer truncate flex items-center justify-center gap-1"
                    >
                      <FolderOpen className="w-3 h-3 text-slate-500 shrink-0" />
                      <span className="truncate">{selectedFileName || 'Browse .key'}</span>
                    </button>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept=".key,.auth,.token,.bin"
                      onChange={handleFileSelect}
                      className="hidden"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Bottom Card Silhouette Watermark */}
            <div className="relative mt-2 pt-1.5 text-center border-t border-gray-100">
              <HimalayanWatermark className="absolute inset-x-0 bottom-0 h-8 pointer-events-none opacity-30" />
              <div className="relative z-10">
                <h4 className="font-bold text-gray-800 text-[11px] tracking-wider">
                  CENTRAL WAREHOUSE LOGISTICS
                </h4>
                <p className="text-[8px] text-gray-500 font-bold uppercase tracking-[0.2em] mt-0.5">
                  SECURE OPERATOR CONSOLE
                </p>
              </div>
            </div>

            {/* Security Footer */}
            <div className="mt-1 pt-1 flex items-center justify-between text-[8px] text-gray-400 border-t border-gray-100 font-mono">
              <span>v1.0.0</span>
              <div className="flex items-center gap-1">
                <svg className="w-2.5 h-2.5 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
                <span>Secure Terminal</span>
              </div>
            </div>

          </div>
        </div>

      </main>

      {/* Bottom Copyright / System Info Bar */}
      <footer className="relative z-10 w-full text-center py-1.5 text-[9px] text-slate-400/80 shrink-0">
        FMCG Warehouse Logistics Management System • Central Warehouse Operations Portal • Authorised Access Only • Single Console Terminal
      </footer>
    </div>
  )
}
