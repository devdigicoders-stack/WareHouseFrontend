import React from 'react'
import { Loader2, Warehouse, RefreshCw } from 'lucide-react'

/**
 * Universal Data Loading Component for Warehouse Pages & Tables
 * @param {string} text - Primary loading message
 * @param {string} subtext - Optional detailed subtitle
 * @param {'sm' | 'md' | 'lg' | 'full' | 'inline'} size - Display size variant
 * @param {string} className - Optional container styling
 */
export default function DataLoader({
  text = 'Loading Warehouse Data...',
  subtext = 'Synchronizing live records from database...',
  size = 'md',
  className = '',
}) {
  if (size === 'inline') {
    return (
      <span className={`inline-flex items-center gap-2 text-xs text-slate-500 font-medium ${className}`}>
        <Loader2 className="w-3.5 h-3.5 animate-spin text-indigo-600" />
        <span>{text}</span>
      </span>
    )
  }

  if (size === 'sm') {
    return (
      <div className={`flex items-center justify-center gap-2.5 py-6 px-4 text-slate-500 text-xs ${className}`}>
        <Loader2 className="w-4 h-4 animate-spin text-indigo-600" />
        <span>{text}</span>
      </div>
    )
  }

  if (size === 'full') {
    return (
      <div className={`min-h-[420px] flex flex-col items-center justify-center p-8 bg-white/70 backdrop-blur-xs rounded-2xl border border-slate-100 shadow-xs ${className}`}>
        <div className="relative mb-4 flex items-center justify-center">
          <div className="w-14 h-14 rounded-2xl bg-indigo-50 border border-indigo-100 flex items-center justify-center animate-pulse">
            <Warehouse className="w-7 h-7 text-indigo-600" />
          </div>
          <div className="absolute -top-1.5 -right-1.5">
            <span className="relative flex h-4 w-4">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-4 w-4 bg-emerald-500"></span>
            </span>
          </div>
        </div>
        <div className="flex items-center gap-2 text-slate-800 font-bold text-base">
          <Loader2 className="w-4 h-4 animate-spin text-indigo-600" />
          <span>{text}</span>
        </div>
        {subtext && <p className="text-xs text-slate-400 mt-1.5 font-medium text-center max-w-sm">{subtext}</p>}
      </div>
    )
  }

  // Default 'md' variant (perfect for tab panels, cards, and tables)
  return (
    <div className={`py-14 px-4 flex flex-col items-center justify-center text-center bg-white rounded-2xl border border-slate-100 ${className}`}>
      <div className="relative mb-3 flex items-center justify-center">
        <div className="w-11 h-11 rounded-xl bg-gradient-to-tr from-indigo-50 to-slate-100 border border-indigo-100/80 flex items-center justify-center shadow-xs">
          <Loader2 className="w-5 h-5 text-indigo-600 animate-spin" />
        </div>
      </div>
      <h4 className="text-sm font-bold text-slate-800 tracking-tight">{text}</h4>
      {subtext && <p className="text-xs text-slate-400 mt-1 max-w-xs">{subtext}</p>}
    </div>
  )
}
