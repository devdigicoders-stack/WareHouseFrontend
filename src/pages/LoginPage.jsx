import { useState, useEffect, useRef, useCallback } from 'react'
import { KeyRound, HardDrive, Unlock, CheckCircle2, AlertCircle, Usb, FolderOpen, Shield } from 'lucide-react'

// Single Operator Profile
const designatedUser = {
  userId: 'WMS-MGR-001',
  name: 'Warehouse Manager',
  role: 'Operations Manager',
  department: 'Central Warehouse Logistics',
  terminal: 'WMS-TERMINAL-01',
}

export default function LoginPage({ onLoginSuccess }) {
  const [authMode, setAuthMode] = useState('pin')

  // PIN state
  const [pin, setPin] = useState('')
  const [pinError, setPinError] = useState('')
  const [pinLoading, setPinLoading] = useState(false)
  const [shake, setShake] = useState(false)
  const inputRefs = useRef([])

  // USB / Pendrive state
  const [usbStatus, setUsbStatus] = useState('idle') // idle | reading | verifying | authenticated | rejected
  const [usbError, setUsbError] = useState('')
  const [selectedFileName, setSelectedFileName] = useState('')
  const fileInputRef = useRef(null)

  // Auto-focus first PIN input on mount or tab switch
  useEffect(() => {
    if (authMode === 'pin') {
      inputRefs.current[0]?.focus()
    }
  }, [authMode])

  // PIN verification
  const handlePinSubmit = useCallback((pinToTest) => {
    const code = (pinToTest || pin).replace(/\s/g, '')
    if (code.length < 4) {
      setPinError('Please enter a 4-digit PIN')
      return
    }
    setPinLoading(true)
    setPinError('')
    setTimeout(() => {
      if (code === '1947') {
        setPinLoading(false)
        onLoginSuccess?.({ ...designatedUser, authMethod: 'PIN', loginTime: new Date().toISOString() })
      } else {
        setPinLoading(false)
        setPinError('Invalid PIN. Please try again.')
        setShake(true)
        setTimeout(() => setShake(false), 500)
        setPin('')
        setTimeout(() => inputRefs.current[0]?.focus(), 100)
      }
    }, 700)
  }, [pin, onLoginSuccess])

  // Digit change handler for 4-box PIN input
  const handleDigitChange = (idx, e) => {
    if (pinLoading) return
    const rawVal = e.target.value
    const digitsOnly = rawVal.replace(/\D/g, '')

    if (!digitsOnly) {
      // Cleared
      const arr = pin.padEnd(4, ' ').split('')
      arr[idx] = ' '
      const newPin = arr.join('').trimEnd()
      setPin(newPin)
      setPinError('')
      return
    }

    // Pasted or autofilled multiple digits
    if (digitsOnly.length > 1) {
      const code = digitsOnly.slice(0, 4)
      setPin(code)
      setPinError('')
      const nextIdx = Math.min(code.length - 1, 3)
      inputRefs.current[nextIdx]?.focus()
      if (code.length === 4) {
        handlePinSubmit(code)
      }
      return
    }

    // Single digit typed
    const digit = digitsOnly.slice(-1)
    const arr = pin.padEnd(4, ' ').split('')
    arr[idx] = digit
    const nextPin = arr.join('').trimEnd()
    setPin(nextPin)
    setPinError('')

    // Auto-advance focus to next input
    if (idx < 3) {
      inputRefs.current[idx + 1]?.focus()
    }

    // Auto-submit if all 4 digits entered
    const completeCode = arr.join('')
    if (completeCode.length === 4 && !completeCode.includes(' ')) {
      handlePinSubmit(completeCode)
    }
  }

  // Key navigation handler (Backspace, Arrow keys, Enter)
  const handleDigitKeyDown = (idx, e) => {
    if (pinLoading) return

    if (e.key === 'Backspace') {
      if (!pin[idx] || pin[idx] === ' ') {
        if (idx > 0) {
          e.preventDefault()
          const arr = pin.padEnd(4, ' ').split('')
          arr[idx - 1] = ' '
          setPin(arr.join('').trimEnd())
          setPinError('')
          inputRefs.current[idx - 1]?.focus()
        }
      }
    } else if (e.key === 'ArrowLeft' && idx > 0) {
      e.preventDefault()
      inputRefs.current[idx - 1]?.focus()
    } else if (e.key === 'ArrowRight' && idx < 3) {
      e.preventDefault()
      inputRefs.current[idx + 1]?.focus()
    } else if (e.key === 'Enter') {
      const cleanCode = pin.replace(/\s/g, '')
      if (cleanCode.length === 4) {
        handlePinSubmit(cleanCode)
      }
    }
  }



  // USB: Authorized
  const handleInsertAuthorizedUsb = () => {
    setUsbError('')
    setUsbStatus('reading')
    setTimeout(() => {
      setUsbStatus('verifying')
      setTimeout(() => {
        setUsbStatus('authenticated')
        setTimeout(() => {
          onLoginSuccess?.({
            ...designatedUser,
            authMethod: 'USB Token',
            usbToken: 'WMS-SEC-KEY-2026-AUTH-TOKEN',
            loginTime: new Date().toISOString(),
          })
        }, 600)
      }, 800)
    }, 700)
  }

  // USB: Rejected
  const handleInsertInvalidUsb = () => {
    setUsbError('')
    setUsbStatus('reading')
    setTimeout(() => {
      setUsbStatus('rejected')
      setUsbError('Invalid token. Access denied.')
      setShake(true)
      setTimeout(() => setShake(false), 500)
      setTimeout(() => { setUsbStatus('idle'); setUsbError('') }, 3000)
    }, 900)
  }

  // File select (simulate USB)
  const handleFileSelect = (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    setSelectedFileName(file.name)
    handleInsertAuthorizedUsb()
  }

  const switchTab = (mode) => {
    setAuthMode(mode)
    setPinError('')
    setUsbError('')
    setUsbStatus('idle')
    setPin('')
    setSelectedFileName('')
  }

  return (
    <div className="min-h-screen w-screen flex items-center justify-center bg-slate-50 select-none">

      {/* Card */}
      <div
        className={`w-full max-w-sm mx-4 bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden transition-transform duration-150 ${shake ? 'animate-shake' : ''}`}
      >
        {/* Card Header */}
        <div className="px-6 pt-7 pb-5 text-center border-b border-slate-100">
          {/* Icon */}
          <div className="w-12 h-12 rounded-xl bg-indigo-600 flex items-center justify-center mx-auto mb-3 shadow-md shadow-indigo-200">
            <Shield className="w-6 h-6 text-white" />
          </div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">Warehouse Management</h1>
          <p className="text-sm text-slate-500 mt-1">Sign in to continue</p>
        </div>

        {/* Tab Switcher */}
        <div className="px-5 pt-5">
          <div className="grid grid-cols-2 gap-1 p-1 bg-slate-100 rounded-xl">
            <button
              type="button"
              onClick={() => switchTab('pin')}
              className={`py-2 rounded-lg text-sm font-semibold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                authMode === 'pin'
                  ? 'bg-white text-slate-900 shadow-sm'
                  : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              <KeyRound className="w-4 h-4" />
              PIN Login
            </button>
            <button
              type="button"
              onClick={() => switchTab('pendrive')}
              className={`py-2 rounded-lg text-sm font-semibold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                authMode === 'pendrive'
                  ? 'bg-white text-slate-900 shadow-sm'
                  : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              <HardDrive className="w-4 h-4" />
              USB Login
            </button>
          </div>
        </div>

        {/* ── PIN LOGIN ── */}
        {authMode === 'pin' && (
          <div className="px-5 py-6 space-y-5">
            {/* Hint */}
            <p className="text-center text-xs text-slate-500 font-medium">
              Enter your 4-digit PIN
            </p>

            {/* 4 Direct Interactive Input Boxes */}
            <div className="flex items-center justify-center gap-3">
              {[0, 1, 2, 3].map((idx) => (
                <input
                  key={idx}
                  ref={(el) => (inputRefs.current[idx] = el)}
                  type="password"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  maxLength={1}
                  value={pin[idx] && pin[idx] !== ' ' ? pin[idx] : ''}
                  onChange={(e) => handleDigitChange(idx, e)}
                  onKeyDown={(e) => handleDigitKeyDown(idx, e)}
                  onFocus={(e) => e.target.select()}
                  autoComplete={idx === 0 ? 'one-time-code' : 'off'}
                  className={`w-13 h-13 sm:w-14 sm:h-14 rounded-2xl border-2 text-center text-2xl font-bold transition-all duration-150 outline-none cursor-pointer ${
                    pin[idx] && pin[idx] !== ' '
                      ? 'border-indigo-600 bg-indigo-50/70 text-indigo-700 shadow-xs'
                      : 'border-slate-300 bg-white text-slate-800 focus:border-indigo-600 focus:ring-4 focus:ring-indigo-500/20 shadow-2xs'
                  }`}
                />
              ))}
            </div>

            {/* Error */}
            {pinError && (
              <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-red-50 border border-red-200 text-red-700 text-xs animate-shake">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{pinError}</span>
              </div>
            )}

            {/* Submit button */}
            <button
              type="button"
              disabled={pinLoading || pin.replace(/\s/g, '').length !== 4}
              onClick={() => handlePinSubmit(pin.replace(/\s/g, ''))}
              className="w-full py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 active:scale-[0.99] text-white text-sm font-semibold flex items-center justify-center gap-2 shadow-sm shadow-indigo-200 transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed mt-2"
            >
              {pinLoading ? (
                <>
                  <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Verifying...
                </>
              ) : (
                <>
                  <Unlock className="w-4 h-4" />
                  Sign In
                </>
              )}
            </button>

            {/* Quick fill helper */}
            <div className="text-center pt-1">
              <button
                type="button"
                onClick={() => {
                  setPin('1947')
                  setPinError('')
                  handlePinSubmit('1947')
                }}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-50/70 hover:bg-indigo-100/80 border border-indigo-200/70 text-indigo-700 text-xs font-semibold transition cursor-pointer"
              >
                <span>Default PIN:</span>
                <span className="font-mono font-black text-indigo-900">1947</span>
                <span className="text-[10px] text-indigo-500 font-normal">(Tap to auto-fill)</span>
              </button>
            </div>
          </div>
        )}

        {/* ── USB / PENDRIVE LOGIN ── */}
        {authMode === 'pendrive' && (
          <div className="px-5 py-5 space-y-4">
            <p className="text-center text-xs text-slate-500">
              Insert your authorized USB token
            </p>

            {/* USB Status Box */}
            <div className="rounded-xl border border-slate-200 bg-slate-50 p-5 flex flex-col items-center gap-3">
              {/* USB Icon */}
              <div className={`w-14 h-14 rounded-xl flex items-center justify-center transition-all duration-300 ${
                usbStatus === 'authenticated'
                  ? 'bg-emerald-100 text-emerald-600'
                  : usbStatus === 'rejected'
                  ? 'bg-red-100 text-red-500'
                  : usbStatus === 'reading' || usbStatus === 'verifying'
                  ? 'bg-indigo-100 text-indigo-600'
                  : 'bg-slate-200 text-slate-400'
              }`}>
                {usbStatus === 'authenticated' ? (
                  <CheckCircle2 className="w-7 h-7" />
                ) : usbStatus === 'rejected' ? (
                  <AlertCircle className="w-7 h-7" />
                ) : (
                  <Usb className={`w-7 h-7 ${(usbStatus === 'reading' || usbStatus === 'verifying') ? 'animate-pulse' : ''}`} />
                )}
              </div>

              {/* Status text */}
              <div className="text-center">
                <p className={`text-sm font-semibold ${
                  usbStatus === 'authenticated' ? 'text-emerald-600'
                  : usbStatus === 'rejected' ? 'text-red-600'
                  : usbStatus === 'reading' || usbStatus === 'verifying' ? 'text-indigo-600'
                  : 'text-slate-500'
                }`}>
                  {usbStatus === 'idle' && 'Waiting for USB token...'}
                  {usbStatus === 'reading' && 'Reading device...'}
                  {usbStatus === 'verifying' && 'Verifying token...'}
                  {usbStatus === 'authenticated' && 'Token verified! Signing in...'}
                  {usbStatus === 'rejected' && 'Token rejected'}
                </p>
                {(usbStatus === 'reading' || usbStatus === 'verifying') && (
                  <div className="mt-2 h-1 w-32 bg-slate-200 rounded-full overflow-hidden mx-auto">
                    <div className="h-full bg-indigo-500 rounded-full animate-pulse w-2/3" />
                  </div>
                )}
              </div>
            </div>

            {/* Error */}
            {usbError && (
              <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-red-50 border border-red-200 text-red-700 text-xs">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{usbError}</span>
              </div>
            )}

            {/* Action Buttons */}
            <div className="space-y-2">
              <button
                type="button"
                disabled={['reading', 'verifying', 'authenticated'].includes(usbStatus)}
                onClick={handleInsertAuthorizedUsb}
                className="w-full py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold flex items-center justify-center gap-2 shadow-sm shadow-indigo-200 transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {['reading', 'verifying'].includes(usbStatus) ? (
                  <>
                    <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Verifying...
                  </>
                ) : (
                  <>
                    <Usb className="w-4 h-4" />
                    Simulate USB Insert
                  </>
                )}
              </button>

              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  disabled={['reading', 'verifying'].includes(usbStatus)}
                  onClick={handleInsertInvalidUsb}
                  className="py-2 px-3 rounded-lg border border-red-200 bg-red-50 hover:bg-red-100 text-red-700 text-xs font-semibold flex items-center justify-center gap-1 transition-colors cursor-pointer disabled:opacity-50"
                >
                  <AlertCircle className="w-3.5 h-3.5" />
                  Test Invalid
                </button>

                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="py-2 px-3 rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-600 text-xs font-semibold flex items-center justify-center gap-1 transition-colors cursor-pointer truncate"
                >
                  <FolderOpen className="w-3.5 h-3.5 shrink-0" />
                  <span className="truncate">{selectedFileName || 'Browse File'}</span>
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

        {/* Card Footer */}
        <div className="px-5 py-3 border-t border-slate-100 text-center">
          <p className="text-[11px] text-slate-400">
            Warehouse Management System &nbsp;·&nbsp; v1.0.0
          </p>
        </div>
      </div>
    </div>
  )
}
