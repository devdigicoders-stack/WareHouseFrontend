import { useState, useRef } from 'react'
import { Link } from 'react-router-dom'
import { X, Check, Save } from 'lucide-react'

export default function Settings() {
  // Toast notifications state
  const [toastMessage, setToastMessage] = useState(null)
  const triggerToast = (msg) => {
    setToastMessage(msg)
    setTimeout(() => setToastMessage(null), 3500)
  }

  // Active navigation tab (defaults to 'general' matching screenshot)
  const [activeTab, setActiveTab] = useState('general')

  // General Settings Form state
  const [generalSettings, setGeneralSettings] = useState({
    systemName: 'Warehouse Management System',
    organization: 'Central Warehouse Logistics & Supply Chain',
    timezone: 'Asia/Kolkata (GMT +05:30)',
    dateFormat: 'DD MMM YYYY (16 Sep 2026)',
    timeFormat: '12 Hour (AM/PM)',
    defaultLanguage: 'English',
  })

  // Organization Logo state
  const [logoPreview, setLogoPreview] = useState('/logo.png')
  const fileInputRef = useRef(null)

  const handleLogoUpload = (e) => {
    const file = e.target.files?.[0]
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        triggerToast('File size exceeds 2MB limit.')
        return
      }
      const reader = new FileReader()
      reader.onload = (event) => {
        setLogoPreview(event.target.result)
        triggerToast('Organization logo updated successfully.')
      }
      reader.readAsDataURL(file)
    }
  }

  const handleRemoveLogo = () => {
    setLogoPreview('/logo.png')
    triggerToast('Logo reset to default emblem.')
  }

  // Security Settings state
  const [twoFactorAuth, setTwoFactorAuth] = useState(true)
  const [sessionTimeout, setSessionTimeout] = useState('30 Minutes')
  const [passwordExpiry, setPasswordExpiry] = useState('90 Days')
  const [loginAttemptLimit, setLoginAttemptLimit] = useState('5 Attempts')

  // Notification Settings toggles
  const [notifications, setNotifications] = useState({
    email: true,
    sms: false,
    lowStock: true,
    expiry: true,
    announcements: true,
  })

  // System Preferences toggles
  const [preferences, setPreferences] = useState({
    autoGenerateTxNo: true,
    requireApprovalAdjustments: true,
    enableQualityCheck: true,
    enableLocationTracking: true,
    allowNegativeStock: false,
    enableAuditTrail: true,
  })

  // Theme selection: 'light' | 'dark' | 'system'
  const [themeMode, setThemeMode] = useState('light')

  // Backup State
  const [lastBackupDate, setLastBackupDate] = useState('15 Sep 2026, 11:30 PM')
  const [isBackingUp, setIsBackingUp] = useState(false)
  const [showBackupModal, setShowBackupModal] = useState(false)

  // Backup ledger history
  const [backupLedger] = useState([
    {
      id: 'BKP-20260915-01',
      date: '15 Sep 2026, 11:30 PM',
      size: '48.6 MB',
      type: 'Automated Daily',
      status: 'Success',
      checksum: 'SHA256:7f8e...3b1a',
    },
    {
      id: 'BKP-20260914-01',
      date: '14 Sep 2026, 11:30 PM',
      size: '48.1 MB',
      type: 'Automated Daily',
      status: 'Success',
      checksum: 'SHA256:4d2c...89ef',
    },
    {
      id: 'BKP-20260913-01',
      date: '13 Sep 2026, 11:30 PM',
      size: '47.8 MB',
      type: 'Manual Snapshot',
      status: 'Success',
      checksum: 'SHA256:1a9c...772d',
    },
    {
      id: 'BKP-20260912-01',
      date: '12 Sep 2026, 11:30 PM',
      size: '47.2 MB',
      type: 'Automated Daily',
      status: 'Success',
      checksum: 'SHA256:9e4b...55bc',
    },
  ])

  // Navigation Items (13 items matching screenshot)
  const navItems = [
    {
      id: 'general',
      label: 'General Settings',
      icon: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
      ),
    },
    {
      id: 'org',
      label: 'Organization Profile',
      icon: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
        </svg>
      ),
    },
    {
      id: 'users',
      label: 'User Management',
      icon: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
        </svg>
      ),
    },
    {
      id: 'roles',
      label: 'Roles & Permissions',
      icon: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
        </svg>
      ),
    },
    {
      id: 'notifications',
      label: 'Notification Settings',
      icon: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
        </svg>
      ),
    },
    {
      id: 'barcode',
      label: 'Barcode / QR Settings',
      icon: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" />
        </svg>
      ),
    },
    {
      id: 'location',
      label: 'Location & Inventory',
      icon: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
      ),
    },
    {
      id: 'quality',
      label: 'Quality & Compliance',
      icon: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
    },
    {
      id: 'preferences',
      label: 'System Preferences',
      icon: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
        </svg>
      ),
    },
    {
      id: 'backup',
      label: 'Backup & Data',
      icon: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
        </svg>
      ),
    },
    {
      id: 'audit',
      label: 'Audit Logs',
      icon: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
        </svg>
      ),
    },
    {
      id: 'api',
      label: 'API & Integrations',
      icon: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 4a2 2 0 114 0v1a1 1 0 001 1h3a1 1 0 011 1v3a1 1 0 01-1 1h-1a2 2 0 100 4h1a1 1 0 011 1v3a1 1 0 01-1 1h-3a1 1 0 01-1-1v-1a2 2 0 10-4 0v1a1 1 0 01-1 1H7a1 1 0 01-1-1v-3a1 1 0 00-1-1H4a2 2 0 110-4h1a1 1 0 001-1V7a1 1 0 011-1h3a1 1 0 001-1V4z" />
        </svg>
      ),
    },
    {
      id: 'theme',
      label: 'Appearance & Theme',
      icon: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
        </svg>
      ),
    },
  ]

  // Handle Save Changes
  const handleSaveChanges = () => {
    triggerToast('All system settings and security policies saved successfully.')
  }

  // Handle Backup Trigger
  const handleTriggerBackup = () => {
    setIsBackingUp(true)
    triggerToast('Initiating encrypted database snapshot...')
    setTimeout(() => {
      setIsBackingUp(false)
      const now = new Date()
      setLastBackupDate(`${now.getDate()} Sep 2026, 05:25 PM`)
      triggerToast('Database snapshot completed successfully. Archived to secure cloud backup.')
    }, 1500)
  }

  return (
    <div className="p-4 sm:p-6 space-y-4 max-w-[1600px] mx-auto min-h-screen bg-slate-50/50 font-sans">
      {/* Hidden File Input for Logo Upload */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleLogoUpload}
        accept="image/png,image/jpeg,image/svg+xml"
        className="hidden"
      />

      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-5 right-5 z-50 flex items-center gap-3 px-4 py-3 rounded-xl bg-slate-900 text-white text-xs shadow-2xl border border-slate-700 animate-slide-in">
          <div className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
          <span>{toastMessage}</span>
          <button
            type="button"
            onClick={() => setToastMessage(null)}
            className="text-slate-400 hover:text-white p-1 ml-2 transition-colors"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* TOP OPERATIONS BANNER */}
      <div className="relative rounded-xl overflow-hidden shadow-md border border-slate-200/80 bg-slate-900 h-28 sm:h-32">
        <img
          src="/border.png"
          alt="Warehouse Management Operations"
          className="w-full h-full object-cover object-center opacity-90"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-black/50 via-black/20 to-black/60" />

        <div className="absolute top-3 right-4 flex flex-col items-end gap-1.5">
          <div className="flex items-center gap-2 bg-black/40 backdrop-blur-md px-3 py-1 rounded-full border border-white/20">
            <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
            <span className="text-[10px] font-bold text-white tracking-widest uppercase">
              SYSTEM ACTIVE
            </span>
          </div>
          <div className="bg-black/50 backdrop-blur-md px-2.5 py-0.5 rounded border border-white/10 text-[9px] font-mono font-bold text-emerald-300 tracking-wider hidden sm:block">
            CONFIGURATION &amp; ACCESS CONTROL HUB
          </div>
        </div>
      </div>

      {/* PAGE HEADER ROW */}
      <div className="bg-white rounded-xl shadow-xs border border-slate-200 p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            {/* Left Title & Icon */}
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-[#1E3A1E] text-white flex items-center justify-center shadow-xs shrink-0">
                {/* Settings Gear Icon */}
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </div>
              <div>
                <h1 className="text-lg font-bold text-slate-800 tracking-tight">
                  Settings
                </h1>
                <p className="text-xs text-slate-500">
                  Manage system configuration, users, security, notifications and more.
                </p>
              </div>
            </div>

            {/* Right Breadcrumbs & Save Button */}
            <div className="flex flex-wrap items-center gap-3">
              <div className="text-[11px] text-slate-400 font-medium hidden md:block">
                <Link to="/dashboard" className="hover:text-slate-600 transition-colors">Home</Link>
                <span className="mx-1.5">›</span>
                <span className="text-slate-600 font-semibold">Settings</span>
              </div>

              <button
                type="button"
                onClick={handleSaveChanges}
                className="flex items-center gap-2 px-4 py-2 rounded-lg bg-[#1E3A1E] hover:bg-[#2a4e2a] text-white text-xs font-semibold shadow-xs transition-colors"
              >
                <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" />
                </svg>
                <span>Save Changes</span>
              </button>
            </div>
          </div>

        {/* Settings Layout: Left Navigation Menu (Span 3) + Right Content Grid (Span 9) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
          {/* Left Navigation Menu (Span 3) */}
          <div className="lg:col-span-3">
            <div className="bg-white rounded-xl border border-slate-200 p-2 shadow-xs space-y-1">
              {navItems.map((item) => {
                const isActive = activeTab === item.id
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => {
                      setActiveTab(item.id)
                      if (item.id !== 'general') {
                        triggerToast(`Switched to: ${item.label}`)
                      }
                    }}
                    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs font-medium transition-all text-left ${
                      isActive
                        ? 'bg-[#EAF2EA] text-[#1E3A1E] font-bold shadow-xs'
                        : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                    }`}
                  >
                    <span className={isActive ? 'text-[#1E3A1E]' : 'text-slate-400'}>
                      {item.icon}
                    </span>
                    <span className="truncate">{item.label}</span>
                  </button>
                )
              })}
            </div>
          </div>

          {/* Right Main Content Area (Span 9) */}
          <div className="lg:col-span-9 space-y-4">
            {/* Top Row: General Settings (Span 7) + Organization Logo (Span 5) */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
              {/* Card 1: General Settings (Span 7) */}
              <div className="lg:col-span-7 bg-white rounded-xl border border-slate-200 p-4 shadow-xs">
                {/* Header */}
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-6 h-6 rounded-md bg-[#1E3A1E] text-white flex items-center justify-center shadow-xs">
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-xs font-bold text-slate-800">General Settings</h3>
                    <p className="text-[10px] text-slate-400">Basic system configuration and preferences.</p>
                  </div>
                </div>

                {/* Form Fields Grid */}
                <div className="space-y-3 text-xs">
                  {/* Row 1: System Name & Organization */}
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-700 mb-1 flex items-center gap-1.5">
                        <span className="w-4 h-4 rounded border border-slate-200 bg-slate-50 flex items-center justify-center shrink-0">
                          <svg className="w-2.5 h-2.5 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                          </svg>
                        </span>
                        <span>System Name</span>
                      </label>
                      <input
                        type="text"
                        value={generalSettings.systemName}
                        onChange={(e) => setGeneralSettings({ ...generalSettings, systemName: e.target.value })}
                        className="w-full bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 text-slate-800 font-medium focus:outline-none focus:ring-1 focus:ring-[#1E3A1E]"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-700 mb-1 flex items-center gap-1.5">
                        <span className="w-4 h-4 rounded border border-slate-200 bg-slate-50 flex items-center justify-center shrink-0">
                          <svg className="w-2.5 h-2.5 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                          </svg>
                        </span>
                        <span>Organization</span>
                      </label>
                      <input
                        type="text"
                        value={generalSettings.organization}
                        onChange={(e) => setGeneralSettings({ ...generalSettings, organization: e.target.value })}
                        className="w-full bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 text-slate-800 font-medium focus:outline-none focus:ring-1 focus:ring-[#1E3A1E]"
                      />
                    </div>
                  </div>

                  {/* Row 2: Timezone & Date Format */}
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-700 mb-1 flex items-center gap-1.5">
                        <span className="w-4 h-4 rounded border border-slate-200 bg-slate-50 flex items-center justify-center shrink-0">
                          <svg className="w-2.5 h-2.5 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                          </svg>
                        </span>
                        <span>Timezone</span>
                      </label>
                      <select
                        value={generalSettings.timezone}
                        onChange={(e) => setGeneralSettings({ ...generalSettings, timezone: e.target.value })}
                        className="w-full bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 text-slate-800 focus:outline-none focus:ring-1 focus:ring-[#1E3A1E]"
                      >
                        <option>Asia/Kolkata (GMT +05:30)</option>
                        <option>UTC (GMT +00:00)</option>
                        <option>Asia/Dubai (GMT +04:00)</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-700 mb-1 flex items-center gap-1.5">
                        <span className="w-4 h-4 rounded border border-slate-200 bg-slate-50 flex items-center justify-center shrink-0">
                          <svg className="w-2.5 h-2.5 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                        </span>
                        <span>Date Format</span>
                      </label>
                      <select
                        value={generalSettings.dateFormat}
                        onChange={(e) => setGeneralSettings({ ...generalSettings, dateFormat: e.target.value })}
                        className="w-full bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 text-slate-800 focus:outline-none focus:ring-1 focus:ring-[#1E3A1E]"
                      >
                        <option>DD MMM YYYY (16 Sep 2026)</option>
                        <option>YYYY-MM-DD (2026-09-16)</option>
                        <option>DD/MM/YYYY (16/09/2026)</option>
                      </select>
                    </div>
                  </div>

                  {/* Row 3: Time Format & Default Language */}
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-700 mb-1 flex items-center gap-1.5">
                        <span className="w-4 h-4 rounded border border-slate-200 bg-slate-50 flex items-center justify-center shrink-0">
                          <svg className="w-2.5 h-2.5 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                        </span>
                        <span>Time Format</span>
                      </label>
                      <select
                        value={generalSettings.timeFormat}
                        onChange={(e) => setGeneralSettings({ ...generalSettings, timeFormat: e.target.value })}
                        className="w-full bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 text-slate-800 focus:outline-none focus:ring-1 focus:ring-[#1E3A1E]"
                      >
                        <option>12 Hour (AM/PM)</option>
                        <option>24 Hour (24-Hour Standard)</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-700 mb-1 flex items-center gap-1.5">
                        <span className="w-4 h-4 rounded border border-slate-200 bg-slate-50 flex items-center justify-center shrink-0">
                          <svg className="w-2.5 h-2.5 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                          </svg>
                        </span>
                        <span>Default Language</span>
                      </label>
                      <select
                        value={generalSettings.defaultLanguage}
                        onChange={(e) => setGeneralSettings({ ...generalSettings, defaultLanguage: e.target.value })}
                        className="w-full bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 text-slate-800 focus:outline-none focus:ring-1 focus:ring-[#1E3A1E]"
                      >
                        <option>English</option>
                        <option>Hindi (हिंदी)</option>
                      </select>
                    </div>
                  </div>
                </div>
              </div>

              {/* Card 2: Organization Logo (Span 5) */}
              <div className="lg:col-span-5 bg-white rounded-xl border border-slate-200 p-4 shadow-xs flex flex-col justify-between">
                <div>
                  {/* Header */}
                  <div className="flex items-center gap-2 mb-3">
                    <div className="w-6 h-6 rounded-md bg-[#1E3A1E] text-white flex items-center justify-center shadow-xs">
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                    </div>
                    <div>
                      <h3 className="text-xs font-bold text-slate-800">Organization Logo</h3>
                      <p className="text-[10px] text-slate-400">Upload and manage your organization logo.</p>
                    </div>
                  </div>

                  {/* Logo Preview & Action Controls */}
                  <div className="flex items-center gap-4 py-1">
                    {/* Organization Emblem Preview */}
                    <div className="w-28 h-28 rounded-xl border border-slate-200 bg-slate-50/60 flex flex-col items-center justify-center p-2 text-center shrink-0 shadow-xs">
                      <img
                        src={logoPreview}
                        alt="Organization Emblem"
                        className="h-22 w-auto max-w-[90px] object-contain drop-shadow-xs"
                      />
                    </div>

                    {/* Action Buttons & Recommendation */}
                    <div className="space-y-2 flex-1">
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="w-full py-1.5 px-3 rounded-lg bg-[#1E3A1E] hover:bg-[#2a4e2a] text-white text-xs font-semibold shadow-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                      >
                        <svg className="w-3.5 h-3.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                        </svg>
                        <span>Upload New Logo</span>
                      </button>

                      <button
                        type="button"
                        onClick={handleRemoveLogo}
                        className="w-full py-1.5 px-3 rounded-lg border border-slate-200 hover:bg-rose-50 hover:border-rose-200 hover:text-rose-700 text-slate-600 text-xs font-semibold transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                      >
                        <svg className="w-3.5 h-3.5 text-slate-500 hover:text-rose-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                        <span>Remove</span>
                      </button>

                      <div className="text-[10px] text-slate-400 leading-tight pt-1">
                        Recommended size: 300 x 300 px<br />
                        Formats: PNG, JPG (Max 2MB)
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Middle Row: Security Settings (Span 4) + Notification Settings (Span 4) + System Preferences (Span 4) */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
              {/* Card 1: Security Settings (Span 4) */}
              <div className="lg:col-span-4 bg-white rounded-xl border border-slate-200 p-4 shadow-xs flex flex-col justify-between">
                <div>
                  {/* Header */}
                  <div className="flex items-center gap-2 mb-3">
                    <div className="w-6 h-6 rounded-md bg-[#1E3A1E] text-white flex items-center justify-center shadow-xs">
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                      </svg>
                    </div>
                    <div>
                      <h3 className="text-xs font-bold text-slate-800">Security Settings</h3>
                      <p className="text-[10px] text-slate-400">Manage security and session settings.</p>
                    </div>
                  </div>

                  {/* Settings rows with left icon boxes matching screenshot */}
                  <div className="space-y-3 text-xs">
                    {/* Two Factor Authentication (2FA) */}
                    <div className="flex items-center justify-between py-1">
                      <div className="flex items-center gap-2.5">
                        <span className="w-5 h-5 rounded border border-slate-200 bg-slate-50 flex items-center justify-center shrink-0">
                          <svg className="w-3 h-3 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
                          </svg>
                        </span>
                        <div>
                          <div className="font-semibold text-slate-800 text-[11px]">Two Factor Authentication (2FA)</div>
                          <div className="text-[9.5px] text-slate-400">Add an extra layer of security</div>
                        </div>
                      </div>
                      <div
                        onClick={() => {
                          setTwoFactorAuth(!twoFactorAuth)
                          triggerToast(`2FA is now ${!twoFactorAuth ? 'ENABLED' : 'DISABLED'}`)
                        }}
                        className={`w-9 h-5 rounded-full p-0.5 transition-colors duration-200 cursor-pointer shrink-0 ${
                          twoFactorAuth ? 'bg-[#1E3A1E]' : 'bg-slate-300'
                        }`}
                      >
                        <div
                          className={`w-4 h-4 rounded-full bg-white transition-transform duration-200 shadow-xs ${
                            twoFactorAuth ? 'translate-x-4' : 'translate-x-0'
                          }`}
                        />
                      </div>
                    </div>

                    {/* Session Timeout */}
                    <div className="flex items-center justify-between py-1">
                      <div className="flex items-center gap-2.5">
                        <span className="w-5 h-5 rounded border border-slate-200 bg-slate-50 flex items-center justify-center shrink-0">
                          <svg className="w-3 h-3 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                        </span>
                        <div>
                          <div className="font-semibold text-slate-800 text-[11px]">Session Timeout</div>
                          <div className="text-[9.5px] text-slate-400">Auto logout after inactivity</div>
                        </div>
                      </div>
                      <select
                        value={sessionTimeout}
                        onChange={(e) => setSessionTimeout(e.target.value)}
                        className="bg-white border border-slate-200 rounded-lg px-2 py-1 text-slate-800 font-medium text-xs focus:outline-none focus:ring-1 focus:ring-[#1E3A1E]"
                      >
                        <option>15 Minutes</option>
                        <option>30 Minutes</option>
                        <option>60 Minutes</option>
                      </select>
                    </div>

                    {/* Password Expiry */}
                    <div className="flex items-center justify-between py-1">
                      <div className="flex items-center gap-2.5">
                        <span className="w-5 h-5 rounded border border-slate-200 bg-slate-50 flex items-center justify-center shrink-0">
                          <svg className="w-3 h-3 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                          </svg>
                        </span>
                        <div>
                          <div className="font-semibold text-slate-800 text-[11px]">Password Expiry</div>
                          <div className="text-[9.5px] text-slate-400">Force password change after</div>
                        </div>
                      </div>
                      <select
                        value={passwordExpiry}
                        onChange={(e) => setPasswordExpiry(e.target.value)}
                        className="bg-white border border-slate-200 rounded-lg px-2 py-1 text-slate-800 font-medium text-xs focus:outline-none focus:ring-1 focus:ring-[#1E3A1E]"
                      >
                        <option>60 Days</option>
                        <option>90 Days</option>
                        <option>180 Days</option>
                      </select>
                    </div>

                    {/* Login Attempt Limit */}
                    <div className="flex items-center justify-between py-1">
                      <div className="flex items-center gap-2.5">
                        <span className="w-5 h-5 rounded border border-slate-200 bg-slate-50 flex items-center justify-center shrink-0">
                          <svg className="w-3 h-3 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
                          </svg>
                        </span>
                        <div>
                          <div className="font-semibold text-slate-800 text-[11px]">Login Attempt Limit</div>
                          <div className="text-[9.5px] text-slate-400">Block after failed attempts</div>
                        </div>
                      </div>
                      <select
                        value={loginAttemptLimit}
                        onChange={(e) => setLoginAttemptLimit(e.target.value)}
                        className="bg-white border border-slate-200 rounded-lg px-2 py-1 text-slate-800 font-medium text-xs focus:outline-none focus:ring-1 focus:ring-[#1E3A1E]"
                      >
                        <option>3 Attempts</option>
                        <option>5 Attempts</option>
                        <option>10 Attempts</option>
                      </select>
                    </div>
                  </div>
                </div>
              </div>

              {/* Card 2: Notification Settings (Span 4) */}
              <div className="lg:col-span-4 bg-white rounded-xl border border-slate-200 p-4 shadow-xs flex flex-col justify-between">
                <div>
                  {/* Header */}
                  <div className="flex items-center gap-2 mb-3">
                    <div className="w-6 h-6 rounded-md bg-[#1E3A1E] text-white flex items-center justify-center shadow-xs">
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                      </svg>
                    </div>
                    <div>
                      <h3 className="text-xs font-bold text-slate-800">Notification Settings</h3>
                      <p className="text-[10px] text-slate-400">Configure system notifications.</p>
                    </div>
                  </div>

                  {/* 5 Notification Toggle Rows */}
                  <div className="space-y-2.5 text-xs">
                    {/* Email */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2.5">
                        <span className="w-5 h-5 rounded border border-slate-200 bg-slate-50 flex items-center justify-center shrink-0">
                          <svg className="w-3 h-3 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                          </svg>
                        </span>
                        <div>
                          <div className="font-semibold text-slate-800 text-[11px]">Email Notifications</div>
                          <div className="text-[9.5px] text-slate-400">Receive important updates via email</div>
                        </div>
                      </div>
                      <div
                        onClick={() => setNotifications({ ...notifications, email: !notifications.email })}
                        className={`w-9 h-5 rounded-full p-0.5 transition-colors duration-200 cursor-pointer shrink-0 ${
                          notifications.email ? 'bg-[#1E3A1E]' : 'bg-slate-300'
                        }`}
                      >
                        <div className={`w-4 h-4 rounded-full bg-white transition-transform duration-200 shadow-xs ${notifications.email ? 'translate-x-4' : 'translate-x-0'}`} />
                      </div>
                    </div>

                    {/* SMS */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2.5">
                        <span className="w-5 h-5 rounded border border-slate-200 bg-slate-50 flex items-center justify-center shrink-0">
                          <svg className="w-3 h-3 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
                          </svg>
                        </span>
                        <div>
                          <div className="font-semibold text-slate-800 text-[11px]">SMS Notifications</div>
                          <div className="text-[9.5px] text-slate-400">Receive critical alerts via SMS</div>
                        </div>
                      </div>
                      <div
                        onClick={() => setNotifications({ ...notifications, sms: !notifications.sms })}
                        className={`w-9 h-5 rounded-full p-0.5 transition-colors duration-200 cursor-pointer shrink-0 ${
                          notifications.sms ? 'bg-[#1E3A1E]' : 'bg-slate-300'
                        }`}
                      >
                        <div className={`w-4 h-4 rounded-full bg-white transition-transform duration-200 shadow-xs ${notifications.sms ? 'translate-x-4' : 'translate-x-0'}`} />
                      </div>
                    </div>

                    {/* Low Stock Alerts */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2.5">
                        <span className="w-5 h-5 rounded border border-slate-200 bg-slate-50 flex items-center justify-center shrink-0">
                          <svg className="w-3 h-3 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                          </svg>
                        </span>
                        <div>
                          <div className="font-semibold text-slate-800 text-[11px]">Low Stock Alerts</div>
                          <div className="text-[9.5px] text-slate-400">Get notified when stock is low</div>
                        </div>
                      </div>
                      <div
                        onClick={() => setNotifications({ ...notifications, lowStock: !notifications.lowStock })}
                        className={`w-9 h-5 rounded-full p-0.5 transition-colors duration-200 cursor-pointer shrink-0 ${
                          notifications.lowStock ? 'bg-[#1E3A1E]' : 'bg-slate-300'
                        }`}
                      >
                        <div className={`w-4 h-4 rounded-full bg-white transition-transform duration-200 shadow-xs ${notifications.lowStock ? 'translate-x-4' : 'translate-x-0'}`} />
                      </div>
                    </div>

                    {/* Expiry Alerts */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2.5">
                        <span className="w-5 h-5 rounded border border-slate-200 bg-slate-50 flex items-center justify-center shrink-0">
                          <svg className="w-3 h-3 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                        </span>
                        <div>
                          <div className="font-semibold text-slate-800 text-[11px]">Expiry Alerts</div>
                          <div className="text-[9.5px] text-slate-400">Get notified before item expiry</div>
                        </div>
                      </div>
                      <div
                        onClick={() => setNotifications({ ...notifications, expiry: !notifications.expiry })}
                        className={`w-9 h-5 rounded-full p-0.5 transition-colors duration-200 cursor-pointer shrink-0 ${
                          notifications.expiry ? 'bg-[#1E3A1E]' : 'bg-slate-300'
                        }`}
                      >
                        <div className={`w-4 h-4 rounded-full bg-white transition-transform duration-200 shadow-xs ${notifications.expiry ? 'translate-x-4' : 'translate-x-0'}`} />
                      </div>
                    </div>

                    {/* System Announcements */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2.5">
                        <span className="w-5 h-5 rounded border border-slate-200 bg-slate-50 flex items-center justify-center shrink-0">
                          <svg className="w-3 h-3 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z" />
                          </svg>
                        </span>
                        <div>
                          <div className="font-semibold text-slate-800 text-[11px]">System Announcements</div>
                          <div className="text-[9.5px] text-slate-400">Receive system updates</div>
                        </div>
                      </div>
                      <div
                        onClick={() => setNotifications({ ...notifications, announcements: !notifications.announcements })}
                        className={`w-9 h-5 rounded-full p-0.5 transition-colors duration-200 cursor-pointer shrink-0 ${
                          notifications.announcements ? 'bg-[#1E3A1E]' : 'bg-slate-300'
                        }`}
                      >
                        <div className={`w-4 h-4 rounded-full bg-white transition-transform duration-200 shadow-xs ${notifications.announcements ? 'translate-x-4' : 'translate-x-0'}`} />
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Card 3: System Preferences (Span 4) */}
              <div className="lg:col-span-4 bg-white rounded-xl border border-slate-200 p-4 shadow-xs flex flex-col justify-between">
                <div>
                  {/* Header */}
                  <div className="flex items-center gap-2 mb-3">
                    <div className="w-6 h-6 rounded-md bg-[#1E3A1E] text-white flex items-center justify-center shadow-xs">
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
                      </svg>
                    </div>
                    <div>
                      <h3 className="text-xs font-bold text-slate-800">System Preferences</h3>
                    </div>
                  </div>

                  {/* 6 Preferences Toggle Rows */}
                  <div className="space-y-2 text-xs">
                    {/* Auto Generate */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2.5">
                        <span className="w-5 h-5 rounded border border-slate-200 bg-slate-50 flex items-center justify-center shrink-0">
                          <svg className="w-3 h-3 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                          </svg>
                        </span>
                        <div>
                          <div className="font-semibold text-slate-800 text-[11px]">Auto Generate Transaction No.</div>
                          <div className="text-[9.5px] text-slate-400">Automatically generate unique numbers</div>
                        </div>
                      </div>
                      <div
                        onClick={() => setPreferences({ ...preferences, autoGenerateTxNo: !preferences.autoGenerateTxNo })}
                        className={`w-9 h-5 rounded-full p-0.5 transition-colors duration-200 cursor-pointer shrink-0 ${
                          preferences.autoGenerateTxNo ? 'bg-[#1E3A1E]' : 'bg-slate-300'
                        }`}
                      >
                        <div className={`w-4 h-4 rounded-full bg-white transition-transform duration-200 shadow-xs ${preferences.autoGenerateTxNo ? 'translate-x-4' : 'translate-x-0'}`} />
                      </div>
                    </div>

                    {/* Require Approval */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2.5">
                        <span className="w-5 h-5 rounded border border-slate-200 bg-slate-50 flex items-center justify-center shrink-0">
                          <svg className="w-3 h-3 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                          </svg>
                        </span>
                        <div>
                          <div className="font-semibold text-slate-800 text-[11px]">Require Approval for Adjustments</div>
                          <div className="text-[9.5px] text-slate-400">Needs approval for stock adjustments</div>
                        </div>
                      </div>
                      <div
                        onClick={() => setPreferences({ ...preferences, requireApprovalAdjustments: !preferences.requireApprovalAdjustments })}
                        className={`w-9 h-5 rounded-full p-0.5 transition-colors duration-200 cursor-pointer shrink-0 ${
                          preferences.requireApprovalAdjustments ? 'bg-[#1E3A1E]' : 'bg-slate-300'
                        }`}
                      >
                        <div className={`w-4 h-4 rounded-full bg-white transition-transform duration-200 shadow-xs ${preferences.requireApprovalAdjustments ? 'translate-x-4' : 'translate-x-0'}`} />
                      </div>
                    </div>

                    {/* Enable Quality Check */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2.5">
                        <span className="w-5 h-5 rounded border border-slate-200 bg-slate-50 flex items-center justify-center shrink-0">
                          <svg className="w-3 h-3 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                        </span>
                        <div>
                          <div className="font-semibold text-slate-800 text-[11px]">Enable Quality Check</div>
                          <div className="text-[9.5px] text-slate-400">Mandatory QC for inward items</div>
                        </div>
                      </div>
                      <div
                        onClick={() => setPreferences({ ...preferences, enableQualityCheck: !preferences.enableQualityCheck })}
                        className={`w-9 h-5 rounded-full p-0.5 transition-colors duration-200 cursor-pointer shrink-0 ${
                          preferences.enableQualityCheck ? 'bg-[#1E3A1E]' : 'bg-slate-300'
                        }`}
                      >
                        <div className={`w-4 h-4 rounded-full bg-white transition-transform duration-200 shadow-xs ${preferences.enableQualityCheck ? 'translate-x-4' : 'translate-x-0'}`} />
                      </div>
                    </div>

                    {/* Enable Location Tracking */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2.5">
                        <span className="w-5 h-5 rounded border border-slate-200 bg-slate-50 flex items-center justify-center shrink-0">
                          <svg className="w-3 h-3 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                        </span>
                        <div>
                          <div className="font-semibold text-slate-800 text-[11px]">Enable Location Tracking</div>
                          <div className="text-[9.5px] text-slate-400">Track item movement between locations</div>
                        </div>
                      </div>
                      <div
                        onClick={() => setPreferences({ ...preferences, enableLocationTracking: !preferences.enableLocationTracking })}
                        className={`w-9 h-5 rounded-full p-0.5 transition-colors duration-200 cursor-pointer shrink-0 ${
                          preferences.enableLocationTracking ? 'bg-[#1E3A1E]' : 'bg-slate-300'
                        }`}
                      >
                        <div className={`w-4 h-4 rounded-full bg-white transition-transform duration-200 shadow-xs ${preferences.enableLocationTracking ? 'translate-x-4' : 'translate-x-0'}`} />
                      </div>
                    </div>

                    {/* Allow Negative Stock */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2.5">
                        <span className="w-5 h-5 rounded border border-slate-200 bg-slate-50 flex items-center justify-center shrink-0">
                          <svg className="w-3 h-3 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
                          </svg>
                        </span>
                        <div>
                          <div className="font-semibold text-slate-800 text-[11px]">Allow Negative Stock</div>
                          <div className="text-[9.5px] text-slate-400">Allow stock to go below zero</div>
                        </div>
                      </div>
                      <div
                        onClick={() => setPreferences({ ...preferences, allowNegativeStock: !preferences.allowNegativeStock })}
                        className={`w-9 h-5 rounded-full p-0.5 transition-colors duration-200 cursor-pointer shrink-0 ${
                          preferences.allowNegativeStock ? 'bg-[#1E3A1E]' : 'bg-slate-300'
                        }`}
                      >
                        <div className={`w-4 h-4 rounded-full bg-white transition-transform duration-200 shadow-xs ${preferences.allowNegativeStock ? 'translate-x-4' : 'translate-x-0'}`} />
                      </div>
                    </div>

                    {/* Enable Audit Trail */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2.5">
                        <span className="w-5 h-5 rounded border border-slate-200 bg-slate-50 flex items-center justify-center shrink-0">
                          <svg className="w-3 h-3 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                          </svg>
                        </span>
                        <div>
                          <div className="font-semibold text-slate-800 text-[11px]">Enable Audit Trail</div>
                          <div className="text-[9.5px] text-slate-400">Log all user activities</div>
                        </div>
                      </div>
                      <div
                        onClick={() => setPreferences({ ...preferences, enableAuditTrail: !preferences.enableAuditTrail })}
                        className={`w-9 h-5 rounded-full p-0.5 transition-colors duration-200 cursor-pointer shrink-0 ${
                          preferences.enableAuditTrail ? 'bg-[#1E3A1E]' : 'bg-slate-300'
                        }`}
                      >
                        <div className={`w-4 h-4 rounded-full bg-white transition-transform duration-200 shadow-xs ${preferences.enableAuditTrail ? 'translate-x-4' : 'translate-x-0'}`} />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Bottom Row: Theme & Appearance (Span 4) + Data Backup (Span 4) + System Information (Span 4) */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
              {/* Card 1: Theme & Appearance (Span 4) */}
              <div className="lg:col-span-4 bg-white rounded-xl border border-slate-200 p-4 shadow-xs flex flex-col justify-between">
                <div>
                  {/* Header */}
                  <div className="flex items-center gap-2 mb-3">
                    <div className="w-6 h-6 rounded-md bg-[#1E3A1E] text-white flex items-center justify-center shadow-xs">
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" />
                      </svg>
                    </div>
                    <div>
                      <h3 className="text-xs font-bold text-slate-800">Theme & Appearance</h3>
                      <p className="text-[10px] text-slate-400">Customize the look and feel.</p>
                    </div>
                  </div>

                  {/* 3 Theme Thumbnail Previews matching screenshot */}
                  <div className="grid grid-cols-3 gap-2.5 mb-2">
                    {/* Light Mode Thumbnail (Active with green border & checkmark) */}
                    <div
                      onClick={() => setThemeMode('light')}
                      className={`rounded-lg border p-1.5 cursor-pointer transition-all ${
                        themeMode === 'light'
                          ? 'border-[#1E3A1E] ring-1.5 ring-[#1E3A1E] bg-slate-50/50'
                          : 'border-slate-200 hover:border-slate-300 bg-white'
                      }`}
                    >
                      <div className="h-10 rounded bg-white border border-slate-200 p-1 flex flex-col justify-between relative overflow-hidden">
                        <div className="flex items-center gap-1">
                          <div className="w-2 h-2 rounded-full bg-[#1E3A1E]" />
                          <div className="w-8 h-1 rounded bg-slate-200" />
                        </div>
                        <div className="space-y-0.5">
                          <div className="w-full h-1 rounded bg-slate-100" />
                          <div className="w-3/4 h-1 rounded bg-slate-100" />
                        </div>
                        {themeMode === 'light' && (
                          <div className="absolute top-0.5 right-0.5 w-3.5 h-3.5 rounded-full bg-[#1E3A1E] text-white flex items-center justify-center">
                            <Check className="w-2.5 h-2.5" />
                          </div>
                        )}
                      </div>
                      <div className="flex items-center justify-center gap-1 mt-1.5 text-[10px] font-semibold text-slate-800">
                        <span className={`w-2.5 h-2.5 rounded-full flex items-center justify-center ${themeMode === 'light' ? 'border-2 border-[#1E3A1E] p-0.5' : 'border border-slate-400'}`}>
                          {themeMode === 'light' && <span className="w-1 h-1 rounded-full bg-[#1E3A1E]" />}
                        </span>
                        <span>Light Mode</span>
                      </div>
                    </div>

                    {/* Dark Mode Thumbnail */}
                    <div
                      onClick={() => setThemeMode('dark')}
                      className={`rounded-lg border p-1.5 cursor-pointer transition-all ${
                        themeMode === 'dark'
                          ? 'border-[#1E3A1E] ring-1.5 ring-[#1E3A1E] bg-slate-50/50'
                          : 'border-slate-200 hover:border-slate-300 bg-white'
                      }`}
                    >
                      <div className="h-10 rounded bg-slate-900 border border-slate-700 p-1 flex flex-col justify-between relative overflow-hidden">
                        <div className="flex items-center gap-1">
                          <div className="w-2 h-2 rounded-full bg-emerald-400" />
                          <div className="w-8 h-1 rounded bg-slate-700" />
                        </div>
                        <div className="space-y-0.5">
                          <div className="w-full h-1 rounded bg-slate-800" />
                          <div className="w-3/4 h-1 rounded bg-slate-800" />
                        </div>
                        {themeMode === 'dark' && (
                          <div className="absolute top-0.5 right-0.5 w-3.5 h-3.5 rounded-full bg-[#1E3A1E] text-white flex items-center justify-center">
                            <Check className="w-2.5 h-2.5" />
                          </div>
                        )}
                      </div>
                      <div className="flex items-center justify-center gap-1 mt-1.5 text-[10px] font-medium text-slate-500">
                        <span className={`w-2.5 h-2.5 rounded-full flex items-center justify-center ${themeMode === 'dark' ? 'border-2 border-[#1E3A1E] p-0.5' : 'border border-slate-400'}`}>
                          {themeMode === 'dark' && <span className="w-1 h-1 rounded-full bg-[#1E3A1E]" />}
                        </span>
                        <span>Dark Mode</span>
                      </div>
                    </div>

                    {/* System Default Thumbnail */}
                    <div
                      onClick={() => setThemeMode('system')}
                      className={`rounded-lg border p-1.5 cursor-pointer transition-all ${
                        themeMode === 'system'
                          ? 'border-[#1E3A1E] ring-1.5 ring-[#1E3A1E] bg-slate-50/50'
                          : 'border-slate-200 hover:border-slate-300 bg-white'
                      }`}
                    >
                      <div className="h-10 rounded border border-slate-200 flex overflow-hidden relative">
                        <div className="w-1/2 bg-white p-1 flex flex-col justify-between">
                          <div className="w-2 h-2 rounded-full bg-[#1E3A1E]" />
                          <div className="w-full h-1 rounded bg-slate-100" />
                        </div>
                        <div className="w-1/2 bg-slate-900 p-1 flex flex-col justify-between">
                          <div className="w-2 h-2 rounded-full bg-emerald-400" />
                          <div className="w-full h-1 rounded bg-slate-800" />
                        </div>
                        {themeMode === 'system' && (
                          <div className="absolute top-0.5 right-0.5 w-3.5 h-3.5 rounded-full bg-[#1E3A1E] text-white flex items-center justify-center">
                            <Check className="w-2.5 h-2.5" />
                          </div>
                        )}
                      </div>
                      <div className="flex items-center justify-center gap-1 mt-1.5 text-[10px] font-medium text-slate-500">
                        <span className={`w-2.5 h-2.5 rounded-full flex items-center justify-center ${themeMode === 'system' ? 'border-2 border-[#1E3A1E] p-0.5' : 'border border-slate-400'}`}>
                          {themeMode === 'system' && <span className="w-1 h-1 rounded-full bg-[#1E3A1E]" />}
                        </span>
                        <span>System Default</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Card 2: Data Backup (Span 4) */}
              <div className="lg:col-span-4 bg-white rounded-xl border border-slate-200 p-4 shadow-xs flex flex-col justify-between">
                <div>
                  {/* Header */}
                  <div className="flex items-center gap-2 mb-3">
                    <div className="w-6 h-6 rounded-md bg-[#1E3A1E] text-white flex items-center justify-center shadow-xs">
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4m0 5c0 2.21-3.582 4-8 4s-8-1.79-8-4" />
                      </svg>
                    </div>
                    <div>
                      <h3 className="text-xs font-bold text-slate-800">Data Backup</h3>
                      <p className="text-[10px] text-slate-400">Manage data backup and recovery.</p>
                    </div>
                  </div>

                  {/* Last Backup Details */}
                  <div className="mb-3">
                    <div className="text-[11px] font-medium text-slate-500 mb-1.5">Last Backup</div>
                    <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200 flex items-center justify-between">
                      <div className="flex items-center gap-2 text-xs text-slate-700 font-mono">
                        <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        <span>{lastBackupDate}</span>
                      </div>
                      <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-[#D1FAE5] text-[#065F46]">
                        Success
                      </span>
                    </div>
                  </div>

                  {/* Actions Buttons */}
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={handleTriggerBackup}
                      disabled={isBackingUp}
                      className="flex-1 py-1.5 px-3 rounded-lg bg-[#1E3A1E] hover:bg-[#2a4e2a] text-white text-xs font-semibold shadow-xs transition-colors flex items-center justify-center gap-1.5 disabled:opacity-60 cursor-pointer"
                    >
                      <svg className={`w-3.5 h-3.5 text-white ${isBackingUp ? 'animate-spin' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                      </svg>
                      <span>{isBackingUp ? 'Backing up...' : 'Backup Now'}</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setShowBackupModal(true)}
                      className="flex-1 py-1.5 px-3 rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-semibold shadow-xs transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      <svg className="w-3.5 h-3.5 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                      </svg>
                      <span>View Backups</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* Card 3: System Information (Span 4) */}
              <div className="lg:col-span-4 bg-white rounded-xl border border-slate-200 p-4 shadow-xs flex flex-col justify-between">
                <div>
                  {/* Header */}
                  <div className="flex items-center gap-2 mb-3">
                    <div className="w-6 h-6 rounded-md bg-[#1E3A1E] text-white flex items-center justify-center shadow-xs">
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <div>
                      <h3 className="text-xs font-bold text-slate-800">System Information</h3>
                      <p className="text-[10px] text-slate-400">Version and server details.</p>
                    </div>
                  </div>

                  {/* Diagnostics list */}
                  <div className="space-y-2 text-xs divide-y divide-slate-100">
                    <div className="flex items-center justify-between pt-1">
                      <span className="text-slate-500 text-[11px]">Application Version</span>
                      <span className="font-bold text-slate-800 font-mono text-[11px]">v1.0.0</span>
                    </div>
                    <div className="flex items-center justify-between pt-1.5">
                      <span className="text-slate-500 text-[11px]">Build Number</span>
                      <span className="font-bold text-slate-800 font-mono text-[11px]">2026.09.16.01</span>
                    </div>
                    <div className="flex items-center justify-between pt-1.5">
                      <span className="text-slate-500 text-[11px]">Database</span>
                      <span className="font-bold text-slate-800 font-mono text-[11px]">MongoDB 7.0</span>
                    </div>
                    <div className="flex items-center justify-between pt-1.5">
                      <span className="text-slate-500 text-[11px]">Server Environment</span>
                      <span className="font-bold text-slate-800 text-[11px]">Production</span>
                    </div>
                    <div className="flex items-center justify-between pt-1.5">
                      <span className="text-slate-500 text-[11px]">Last Updated</span>
                      <span className="font-medium text-slate-600 font-mono text-[11px]">16 Sep 2026, 09:15 AM</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

      {/* MODAL: View Backups Modal */}
      {showBackupModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-lg w-full p-5 animate-scale-up">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-[#1E3A1E] text-emerald-400 flex items-center justify-center font-bold">
                  <Save className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-800">Database Snapshot Ledger</h3>
                  <p className="text-[11px] text-slate-400">Encrypted WAN archival backups</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowBackupModal(false)}
                className="text-slate-400 hover:text-slate-600 p-1"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Table of Backups */}
            <div className="overflow-hidden rounded-xl border border-slate-200 mb-4">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                  <tr>
                    <th className="px-3 py-2">Backup ID</th>
                    <th className="px-3 py-2">Timestamp</th>
                    <th className="px-3 py-2">Size</th>
                    <th className="px-3 py-2">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-mono text-[11px]">
                  {backupLedger.map((b) => (
                    <tr key={b.id} className="hover:bg-slate-50/60">
                      <td className="px-3 py-2 font-bold text-slate-800">{b.id}</td>
                      <td className="px-3 py-2 text-slate-600">{b.date}</td>
                      <td className="px-3 py-2 text-slate-600">{b.size}</td>
                      <td className="px-3 py-2">
                        <span className="px-2 py-0.5 rounded-full text-[9px] font-bold bg-[#D1FAE5] text-[#065F46]">
                          {b.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => triggerToast('Ledger exported to encrypted audit report.')}
                className="px-3 py-1.5 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 text-xs font-semibold cursor-pointer"
              >
                Export Ledger
              </button>
              <button
                type="button"
                onClick={() => setShowBackupModal(false)}
                className="px-4 py-1.5 rounded-lg bg-[#1E3A1E] text-white text-xs font-semibold hover:bg-[#2a4e2a] cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
