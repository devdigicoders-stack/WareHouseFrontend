import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Truck, Package, QrCode, MapPin, Search, Send } from 'lucide-react'

export default function Dashboard() {
  const [selectedShade, setSelectedShade] = useState('All')

  // 6 KPI Metric Cards - Balanced typography & clear operational indicators
  const kpiStats = [
    {
      id: 'gate',
      label: "Today's Gate Entries",
      value: '12',
      trend: '↑ +20%',
      trendPositive: true,
      color: 'bg-emerald-600',
      path: '/gate-entry',
      icon: (
        <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M8 17H5a2 2 0 01-2-2V7a2 2 0 012-2h10a2 2 0 012 2v2m-6 8h6m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0zm10-6h3.5a1.5 1.5 0 011.2.6L22 14v3a1 1 0 01-1 1h-2" />
        </svg>
      ),
    },
    {
      id: 'grn',
      label: 'GRN Received',
      value: '28',
      trend: '↑ +12%',
      trendPositive: true,
      color: 'bg-amber-500',
      path: '/grn',
      icon: (
        <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
        </svg>
      ),
    },
    {
      id: 'stock',
      label: 'Total Stock (Units)',
      value: '12,45,680',
      trend: '↑ +5%',
      trendPositive: true,
      color: 'bg-emerald-700',
      path: '/current-stock',
      icon: (
        <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
        </svg>
      ),
    },
    {
      id: 'lab',
      label: 'Under Lab Testing',
      value: '18',
      trend: '6 in sampling',
      trendPositive: true,
      color: 'bg-blue-600',
      path: '/lab-testing',
      icon: (
        <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
        </svg>
      ),
    },
    {
      id: 'approved',
      label: 'Approved Stock',
      value: '10,24,560',
      trend: '82% of Total',
      trendPositive: true,
      color: 'bg-emerald-600',
      path: '/current-stock',
      icon: (
        <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
        </svg>
      ),
    },
    {
      id: 'expired',
      label: 'Expired / Near Expiry',
      value: '1,250',
      trend: 'Action needed',
      trendPositive: false,
      color: 'bg-rose-600',
      path: '/hold-stock',
      icon: (
        <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
        </svg>
      ),
    },
  ]

  // 6 Shades Data
  const shades = [
    { id: 1, name: 'Shade 1', category: 'General', occupancy: 80, current: 320, total: 400, color: 'bg-emerald-500' },
    { id: 2, name: 'Shade 2', category: 'Rations', occupancy: 65, current: 260, total: 400, color: 'bg-amber-500' },
    { id: 3, name: 'Shade 3', category: 'Ammunition', occupancy: 90, current: 360, total: 400, color: 'bg-emerald-500' },
    { id: 4, name: 'Shade 4', category: 'Uniforms', occupancy: 50, current: 200, total: 400, color: 'bg-amber-500' },
    { id: 5, name: 'Shade 5', category: 'Hardware', occupancy: 75, current: 300, total: 400, color: 'bg-emerald-500' },
    { id: 6, name: 'Shade 6', category: 'Medical', occupancy: 40, current: 160, total: 400, color: 'bg-slate-400' },
  ]

  // Recent Gate Entries
  const gateEntries = [
    { id: 1, time: '16 Sep 2026, 09:12', vehicle: 'UP32 AB 1256', driver: 'Rajesh Yadav', supplier: 'M/s Bharat Supply', type: 'In', status: 'Completed' },
    { id: 2, time: '16 Sep 2026, 08:45', vehicle: 'HR55 CD 7890', driver: 'Sandeep Singh', supplier: 'M/s Defence Foods', type: 'In', status: 'Completed' },
    { id: 3, time: '16 Sep 2026, 08:20', vehicle: 'DL01 EF 4321', driver: 'Imran Khan', supplier: 'M/s Ordnance Factory', type: 'In', status: 'Completed' },
    { id: 4, time: '16 Sep 2026, 07:55', vehicle: 'UP78 GH 9987', driver: 'Manoj Tiwari', supplier: 'M/s Army Stores', type: 'In', status: 'Completed' },
    { id: 5, time: '16 Sep 2026, 07:30', vehicle: 'RJ14 JK 6543', driver: 'Amit Sharma', supplier: 'M/s National Supply', type: 'Out', status: 'Completed' },
  ]

  // Recent GRN Receipts
  const grnReceipts = [
    { id: 1, grn: 'GRN-2026-00125', product: 'Standard Biscuit Ration', batch: 'B102', qty: '600', status: 'Passed', statusColor: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
    { id: 2, grn: 'GRN-2026-00124', product: 'Basmati Rice Special Grade', batch: 'R201', qty: '1,200', status: 'Testing', statusColor: 'bg-blue-50 text-blue-700 border-blue-200' },
    { id: 3, grn: 'GRN-2026-00123', product: 'Refined Mustard Oil', batch: 'O301', qty: '500', status: 'Passed', statusColor: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
    { id: 4, grn: 'GRN-2026-00122', product: 'Chana Dal Super Clean', batch: 'D110', qty: '800', status: 'Pending', statusColor: 'bg-amber-50 text-amber-700 border-amber-200' },
    { id: 5, grn: 'GRN-2026-00121', product: 'Refined Sugar Depot Pack', batch: 'S450', qty: '900', status: 'Failed', statusColor: 'bg-rose-50 text-rose-700 border-rose-200' },
  ]

  // Expiry Alerts
  const expiryAlerts = [
    { id: 1, product: 'Standard Biscuit Ration', batch: 'B102', date: '25 Sep 2026', days: 9, status: 'Near Expiry', statusColor: 'bg-amber-50 text-amber-700 border-amber-200' },
    { id: 2, product: 'Refined Mustard Oil', batch: 'O301', date: '28 Sep 2026', days: 12, status: 'Near Expiry', statusColor: 'bg-amber-50 text-amber-700 border-amber-200' },
    { id: 3, product: 'Basmati Rice Special Grade', batch: 'R201', date: '30 Sep 2026', days: 14, status: 'Near Expiry', statusColor: 'bg-amber-50 text-amber-700 border-amber-200' },
    { id: 4, product: 'Chana Dal Super Clean', batch: 'D110', date: '05 Oct 2026', days: 19, status: 'Valid', statusColor: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
    { id: 5, product: 'Refined Sugar Depot Pack', batch: 'S450', date: '10 Oct 2026', days: 24, status: 'Valid', statusColor: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
  ]

  // Quick Actions with direct routes and iconography
  const quickActions = [
    { label: 'New Gate Entry', path: '/gate-entry', icon: Truck, badge: 'Inward' },
    { label: 'Create GRN', path: '/grn', icon: Package, badge: 'Receiving' },
    { label: 'Generate QR/Label', path: '/label-qr', icon: QrCode, badge: 'Print' },
    { label: 'Put-Away / Check-In', path: '/put-away', icon: MapPin, badge: 'Storage' },
    { label: 'Stock Search', path: '/stock-search', icon: Search, badge: 'Lookup' },
    { label: 'Issue / Dispatch', path: '/issue-dispatch', icon: Send, badge: 'Outward' },
  ]

  return (
    <div className="space-y-4 max-w-[1720px] mx-auto pb-6 select-none">
      
      {/* 1. Welcome Back Banner */}
      <div
        className="relative rounded-2xl overflow-hidden shadow-xs border border-slate-200/90 bg-cover bg-center min-h-[96px] p-5 sm:p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
        style={{
          backgroundImage: "url('/border.png')",
          backgroundPosition: 'center',
          backgroundSize: 'cover',
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-r from-white/95 via-white/85 to-black/25 pointer-events-none" />

        {/* Welcome Text with Refined Typography */}
        <div className="relative z-10">
          <div className="flex items-center gap-2 mb-1">
            <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-medium bg-emerald-100/90 text-emerald-800 border border-emerald-300/60">
              ● Depot Active
            </span>
            <span className="text-xs text-slate-500 font-medium">
              AOC Supply Base • Sector 4
            </span>
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-slate-800 tracking-tight">
            Welcome Back, Col. A. Sharma
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 font-normal mt-0.5">
            Here is your daily operational summary across all depot shades and logistics bays.
          </p>
        </div>

        {/* Nation First Always Emblem Badge */}
        <div className="relative z-10 text-right shrink-0 hidden sm:block">
          <div className="bg-black/35 backdrop-blur-xs border border-white/20 px-3.5 py-1.5 rounded-xl shadow-xs">
            <h3 className="text-xs font-bold tracking-[0.2em] text-white uppercase">
              NATION FIRST
            </h3>
            <p className="text-[9px] font-semibold tracking-[0.25em] text-amber-300 uppercase mt-0.5">
              ── ALWAYS ──
            </p>
          </div>
        </div>
      </div>

      {/* 2. Top Stats Row (6 KPI Metric Cards) - Refined font weights & soft borders */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        {kpiStats.map((kpi) => (
          <Link
            key={kpi.id}
            to={kpi.path}
            className="group bg-white rounded-xl p-3.5 border border-slate-200/90 shadow-xs flex flex-col justify-between hover:shadow-md hover:border-slate-300 transition-all cursor-pointer"
          >
            <div className="flex items-center justify-between">
              <div className={`w-8 h-8 rounded-lg ${kpi.color} flex items-center justify-center shadow-xs group-hover:scale-105 transition-transform`}>
                {kpi.icon}
              </div>
              {kpi.trend && (
                <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded ${kpi.trendPositive ? 'bg-emerald-50 text-emerald-700 border border-emerald-200/60' : 'bg-rose-50 text-rose-700 border border-rose-200/60'}`}>
                  {kpi.trend}
                </span>
              )}
            </div>

            <div className="mt-2.5">
              <p className="text-[11px] text-slate-500 font-medium leading-tight">
                {kpi.label}
              </p>
              <p className="text-xl font-bold text-slate-800 font-mono tracking-tight mt-0.5">
                {kpi.value}
              </p>
            </div>

            <div className="mt-2 pt-2 border-t border-slate-100 flex items-center justify-between text-[10px] font-medium text-slate-500 group-hover:text-slate-800 transition-colors">
              <span>View Details</span>
              <span className="group-hover:translate-x-0.5 transition-transform text-slate-400 group-hover:text-slate-600">→</span>
            </div>
          </Link>
        ))}
      </div>

      {/* 3. Middle Tier: Warehouse Location Overview + Stock Status Donut + Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-stretch">
        
        {/* Column 1 (5 Cols): Warehouse Location Overview (6 Shades) */}
        <div className="lg:col-span-5 bg-white rounded-xl p-4 border border-slate-200/90 shadow-xs flex flex-col justify-between">
          <div>
            {/* Header with Title and Legend */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-md bg-slate-100 flex items-center justify-center text-slate-700">
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                  </svg>
                </div>
                <h3 className="text-xs font-semibold text-slate-800 uppercase tracking-wider">
                  Warehouse Location Overview
                </h3>
              </div>

              {/* Clean Legend */}
              <div className="flex items-center gap-2.5 text-[10px] text-slate-500 font-medium">
                <span className="flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-emerald-500" /> Occupied
                </span>
                <span className="flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-amber-400" /> Partial
                </span>
                <span className="flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-slate-200" /> Empty
                </span>
              </div>
            </div>

            {/* Depot Capacity Summary Banner */}
            <div className="mt-3 mb-3 p-2.5 rounded-lg bg-slate-50 border border-slate-100 flex items-center justify-between">
              <div>
                <span className="text-[11px] font-medium text-slate-600">Overall Depot Capacity:</span>
                <span className="ml-1.5 font-mono font-semibold text-xs text-slate-800">1,600 / 2,400 Units</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="text-[11px] font-semibold text-emerald-700 font-mono">66.7%</span>
                <span className="text-[10px] text-slate-400 font-normal">utilized</span>
              </div>
            </div>

            {/* 6 Shades Shed Graphic Grid - Perfectly spaced without empty void */}
            <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
              {shades.map((shade) => (
                <Link
                  key={shade.id}
                  to="/shade-mgmt"
                  title={`Click to inspect ${shade.name}`}
                  className="flex flex-col bg-white border border-slate-200 rounded-lg overflow-hidden group hover:border-slate-400 hover:shadow-xs transition-all cursor-pointer"
                >
                  {/* Pitched Roof Graphic with Shade Title */}
                  <div className="w-full relative h-6 bg-[#1D271B] flex items-center justify-center">
                    <svg viewBox="0 0 100 35" className="w-full h-full text-[#141E13] fill-current" preserveAspectRatio="none">
                      <polygon points="0,35 50,2 100,35" />
                    </svg>
                    <span className="absolute bottom-0.5 text-[9px] font-semibold text-white tracking-wide">
                      {shade.name}
                    </span>
                  </div>

                  {/* Interior 4x3 Storage Pallet Grid */}
                  <div className="p-1.5 flex flex-col items-center flex-1 justify-between">
                    <div className="grid grid-cols-4 gap-0.5 p-1 bg-slate-50 border border-slate-100 rounded w-full">
                      {Array.from({ length: 12 }).map((_, i) => {
                        const boxColor =
                          shade.occupancy >= 80
                            ? i < 10
                              ? 'bg-emerald-500'
                              : 'bg-amber-400'
                            : shade.occupancy >= 60
                            ? i < 8
                              ? 'bg-emerald-500'
                              : i < 10
                              ? 'bg-amber-400'
                              : 'bg-slate-200'
                            : shade.occupancy >= 50
                            ? i < 6
                              ? 'bg-amber-400'
                              : 'bg-slate-200'
                            : i < 4
                            ? 'bg-slate-400'
                            : 'bg-slate-200'

                        return <div key={i} className={`h-1.5 rounded-xs ${boxColor}`} />
                      })}
                    </div>

                    {/* Progress Bar & Numbers */}
                    <div className="w-full mt-1.5 text-center">
                      <span className="text-[10px] font-semibold text-slate-800 block">
                        {shade.occupancy}%
                      </span>
                      <span className="text-[8px] text-slate-400 font-medium font-mono block">
                        {shade.current}/{shade.total}
                      </span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>

          {/* Bottom Card Footer with Direct Link */}
          <div className="mt-3 pt-2 border-t border-slate-100 flex items-center justify-between text-[11px]">
            <span className="text-slate-500 text-[10px]">6 Active Shades • Sector B Bays</span>
            <Link
              to="/shade-mgmt"
              className="text-[11px] font-medium text-emerald-700 hover:text-emerald-900 flex items-center gap-1 cursor-pointer"
            >
              Configure Shades <span>→</span>
            </Link>
          </div>
        </div>

        {/* Column 2 (4 Cols): Stock Status Donut Chart & Breakdown */}
        <div className="lg:col-span-4 bg-white rounded-xl p-4 border border-slate-200/90 shadow-xs flex flex-col justify-between">
          <div>
            {/* Header */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-md bg-slate-100 flex items-center justify-center text-slate-700">
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M11 3.055A9.001 9.001 0 1020.945 13H11V3.055z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M20.488 9H15V3.512A9.025 9.025 0 0120.488 9z" />
                  </svg>
                </div>
                <h3 className="text-xs font-semibold text-slate-800 uppercase tracking-wider">
                  Stock Status
                </h3>
              </div>

              <select
                value={selectedShade}
                onChange={(e) => setSelectedShade(e.target.value)}
                className="text-[11px] font-medium bg-slate-50 border border-slate-200 rounded-md px-2 py-1 text-slate-600 outline-none cursor-pointer hover:bg-slate-100 transition-colors"
              >
                <option value="All">All Shades</option>
                <option value="1">Shade 1</option>
                <option value="2">Shade 2</option>
                <option value="3">Shade 3</option>
                <option value="4">Shade 4</option>
                <option value="5">Shade 5</option>
                <option value="6">Shade 6</option>
              </select>
            </div>

            {/* Donut & Legend Container */}
            <div className="flex items-center gap-3.5 pt-3">
              {/* Donut SVG with clean proportions */}
              <div className="relative w-28 h-28 sm:w-32 sm:h-32 shrink-0 flex items-center justify-center">
                <svg viewBox="0 0 120 120" className="w-full h-full -rotate-90">
                  <circle cx="60" cy="60" r="45" stroke="#F1F5F9" strokeWidth="16" fill="none" />
                  {/* Approved (82%) */}
                  <circle
                    cx="60"
                    cy="60"
                    r="45"
                    stroke="#10B981"
                    strokeWidth="16"
                    fill="none"
                    strokeDasharray="282.7"
                    strokeDashoffset="50.8"
                  />
                  {/* Under Testing (1.5%) */}
                  <circle
                    cx="60"
                    cy="60"
                    r="45"
                    stroke="#3B82F6"
                    strokeWidth="16"
                    fill="none"
                    strokeDasharray="282.7"
                    strokeDashoffset="278.4"
                    transform="rotate(295 60 60)"
                  />
                  {/* On Hold (1%) */}
                  <circle
                    cx="60"
                    cy="60"
                    r="45"
                    stroke="#F59E0B"
                    strokeWidth="16"
                    fill="none"
                    strokeDasharray="282.7"
                    strokeDashoffset="279.8"
                    transform="rotate(305 60 60)"
                  />
                  {/* Rejected (0.7%) */}
                  <circle
                    cx="60"
                    cy="60"
                    r="45"
                    stroke="#EF4444"
                    strokeWidth="16"
                    fill="none"
                    strokeDasharray="282.7"
                    strokeDashoffset="280.7"
                    transform="rotate(315 60 60)"
                  />
                </svg>

                <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                  <span className="text-xs font-bold text-slate-800 font-mono tracking-tight leading-none">
                    12.45 L
                  </span>
                  <span className="text-[9px] text-slate-500 font-medium mt-1">
                    Total Units
                  </span>
                </div>
              </div>

              {/* Clean Breakdown List - No Awkward Text Wrapping */}
              <div className="flex-1 min-w-0 space-y-1 text-xs">
                {[
                  { label: 'Approved', count: '10,24,560', pct: '82%', color: 'bg-emerald-500', path: '/current-stock' },
                  { label: 'Under Testing', count: '18,450', pct: '1.5%', color: 'bg-blue-500', path: '/lab-testing' },
                  { label: 'On Hold', count: '12,340', pct: '1.0%', color: 'bg-amber-500', path: '/hold-stock' },
                  { label: 'Rejected', count: '8,230', pct: '0.7%', color: 'bg-rose-500', path: '/damage-rejection' },
                  { label: 'Expired', count: '1,250', pct: '0.1%', color: 'bg-rose-700', path: '/hold-stock' },
                ].map((item) => (
                  <Link
                    key={item.label}
                    to={item.path}
                    className="flex items-center justify-between py-1 px-1.5 rounded-md hover:bg-slate-50 transition-colors group"
                  >
                    <div className="flex items-center gap-1.5 min-w-0">
                      <span className={`w-2 h-2 rounded-full ${item.color} shrink-0`} />
                      <span className="text-[11px] text-slate-600 font-medium truncate group-hover:text-slate-900">
                        {item.label}
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5 shrink-0 pl-1.5">
                      <span className="font-mono text-[11px] font-medium text-slate-800">
                        {item.count}
                      </span>
                      <span className="text-[9px] text-slate-500 font-mono bg-slate-100 px-1 py-0.2 rounded">
                        {item.pct}
                      </span>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          </div>

          {/* Bottom Link */}
          <div className="mt-3 pt-2 border-t border-slate-100 flex items-center justify-between text-[11px]">
            <span className="text-slate-500 text-[10px]">Real-time Inventory Ledger</span>
            <Link
              to="/current-stock"
              className="text-[11px] font-medium text-emerald-700 hover:text-emerald-900 flex items-center gap-1 cursor-pointer"
            >
              Inventory Details <span>→</span>
            </Link>
          </div>
        </div>

        {/* Column 3 (3 Cols): Quick Actions - Full Width Buttons without Truncation */}
        <div className="lg:col-span-3 bg-white rounded-xl p-4 border border-slate-200/90 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-md bg-amber-50 flex items-center justify-center text-amber-600">
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
                <h3 className="text-xs font-semibold text-slate-800 uppercase tracking-wider">
                  Quick Actions
                </h3>
              </div>
              <span className="text-[10px] text-slate-400 font-mono">1-Click</span>
            </div>

            {/* Actions Grid - Plenty of space for full text */}
            <div className="grid grid-cols-1 gap-1.5 pt-2.5">
              {quickActions.map((action) => (
                <Link
                  key={action.label}
                  to={action.path}
                  className="w-full px-3 py-2 rounded-lg border border-slate-200/80 hover:border-[#283822] hover:bg-slate-50/90 flex items-center justify-between text-left transition-all cursor-pointer group"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <action.icon className="w-4 h-4 text-slate-600 group-hover:text-slate-900 group-hover:scale-110 transition-transform shrink-0" />
                    <span className="text-xs font-medium text-slate-700 group-hover:text-slate-900 truncate">
                      {action.label}
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5 shrink-0">
                    <span className="text-[9px] font-medium px-1.5 py-0.5 rounded bg-slate-100 text-slate-500 group-hover:bg-amber-100 group-hover:text-amber-800 transition-colors">
                      {action.badge}
                    </span>
                    <span className="text-slate-400 group-hover:text-slate-700 text-xs font-bold">›</span>
                  </div>
                </Link>
              ))}
            </div>
          </div>

          <div className="mt-2.5 pt-2 border-t border-slate-100 text-right">
            <span className="text-[10px] text-slate-400">Authorized Terminal Mode</span>
          </div>
        </div>

      </div>

      {/* 4. Data Tables Row: Recent Gate Entries & Recent GRN / Product Receipts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        
        {/* Table 1: Recent Gate Entries */}
        <div className="bg-white rounded-xl p-4 border border-slate-200/90 shadow-xs">
          <div className="flex items-center justify-between mb-3 pb-2 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-md bg-slate-100 flex items-center justify-center text-slate-700">
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M8 17H5a2 2 0 01-2-2V7a2 2 0 012-2h10a2 2 0 012 2v2m-6 8h6m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0zm10-6h3.5a1.5 1.5 0 011.2.6L22 14v3a1 1 0 01-1 1h-2" />
                </svg>
              </div>
              <h3 className="text-xs font-semibold text-slate-800 uppercase tracking-wider">
                Recent Gate Entries
              </h3>
            </div>
            <Link to="/gate-entry" className="text-[11px] font-medium text-emerald-700 hover:text-emerald-900 transition-colors">
              View All →
            </Link>
          </div>

          <div className="overflow-x-auto scrollbar-thin">
            <table className="w-full text-left text-xs whitespace-nowrap min-w-[620px]">
              <thead>
                <tr className="border-b border-slate-100 text-slate-400 text-[10px] uppercase tracking-wider font-semibold">
                  <th className="py-2 px-3 w-10 text-center">#</th>
                  <th className="py-2 px-3">Date &amp; Time</th>
                  <th className="py-2 px-3">Vehicle No.</th>
                  <th className="py-2 px-3">Driver Name</th>
                  <th className="py-2 px-3">Supplier / Party</th>
                  <th className="py-2 px-3 text-center">Type</th>
                  <th className="py-2 px-3 text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {gateEntries.map((row) => (
                  <tr key={row.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-2.5 px-3 text-slate-400 font-mono text-[11px] text-center w-10">
                      {row.id}
                    </td>
                    <td className="py-2.5 px-3 whitespace-nowrap">
                      <span className="text-[11px] text-slate-600 font-medium">{row.time}</span>
                    </td>
                    <td className="py-2.5 px-3 whitespace-nowrap">
                      <span className="text-[11px] font-mono font-semibold text-slate-800 bg-slate-100/90 border border-slate-200/80 px-2 py-0.5 rounded inline-block">
                        {row.vehicle}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 whitespace-nowrap text-slate-700 font-medium text-[11px]">
                      {row.driver}
                    </td>
                    <td className="py-2.5 px-3 whitespace-nowrap text-slate-500 text-[11px]">
                      {row.supplier}
                    </td>
                    <td className="py-2.5 px-3 text-center whitespace-nowrap">
                      <span className={`text-[10px] font-semibold px-2 py-0.5 rounded ${row.type === 'In' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200/70' : 'bg-blue-50 text-blue-700 border border-blue-200/70'}`}>
                        {row.type}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 text-right whitespace-nowrap">
                      <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200/70 inline-flex items-center gap-1">
                        <span className="w-1 h-1 rounded-full bg-emerald-500" />
                        {row.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Table 2: Recent GRN / Product Receipts */}
        <div className="bg-white rounded-xl p-4 border border-slate-200/90 shadow-xs">
          <div className="flex items-center justify-between mb-3 pb-2 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-md bg-slate-100 flex items-center justify-center text-slate-700">
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                </svg>
              </div>
              <h3 className="text-xs font-semibold text-slate-800 uppercase tracking-wider">
                Recent GRN Receipts
              </h3>
            </div>
            <Link to="/grn" className="text-[11px] font-medium text-emerald-700 hover:text-emerald-900 transition-colors">
              View All →
            </Link>
          </div>

          <div className="overflow-x-auto scrollbar-thin">
            <table className="w-full text-left text-xs whitespace-nowrap min-w-[580px]">
              <thead>
                <tr className="border-b border-slate-100 text-slate-400 text-[10px] uppercase tracking-wider font-semibold">
                  <th className="py-2 px-3 w-10 text-center">#</th>
                  <th className="py-2 px-3">GRN No.</th>
                  <th className="py-2 px-3">Product</th>
                  <th className="py-2 px-3">Batch No.</th>
                  <th className="py-2 px-3 text-right">Qty (Units)</th>
                  <th className="py-2 px-3 text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {grnReceipts.map((row) => (
                  <tr key={row.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-2.5 px-3 text-slate-400 font-mono text-[11px] text-center w-10">
                      {row.id}
                    </td>
                    <td className="py-2.5 px-3 whitespace-nowrap">
                      <span className="font-mono font-semibold text-slate-800 text-[11px]">
                        {row.grn}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 whitespace-nowrap text-slate-700 font-medium text-[11px]">
                      {row.product}
                    </td>
                    <td className="py-2.5 px-3 whitespace-nowrap">
                      <span className="font-mono text-slate-600 text-[10px] bg-slate-100 px-1.5 py-0.5 rounded border border-slate-200/60">
                        {row.batch}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 whitespace-nowrap text-right font-mono font-semibold text-slate-800 text-[11px]">
                      {row.qty}
                    </td>
                    <td className="py-2.5 px-3 text-right whitespace-nowrap">
                      <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full border ${row.statusColor}`}>
                        {row.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

      </div>

      {/* 5. Bottom Row: Lab Testing Status + Expiry Alerts + System Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        
        {/* Lab Testing Status (4 Cols) */}
        <div className="lg:col-span-4 bg-white rounded-xl p-4 border border-slate-200/90 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-2.5 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-md bg-blue-50 flex items-center justify-center text-blue-600">
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
                  </svg>
                </div>
                <h3 className="text-xs font-semibold text-slate-800 uppercase tracking-wider">
                  Lab Testing Status
                </h3>
              </div>
              <select className="text-[10px] font-medium bg-slate-50 border border-slate-200 rounded px-1.5 py-0.5 text-slate-600 outline-none">
                <option>This Month</option>
                <option>This Year</option>
              </select>
            </div>

            {/* Bar Chart Graphic */}
            <div className="pt-4">
              <div className="h-36 flex items-end justify-between gap-3 px-2 border-b border-slate-200 pb-1 relative">
                {/* Horizontal Grid lines */}
                <div className="absolute inset-x-0 top-0 border-t border-dashed border-slate-100" />
                <div className="absolute inset-x-0 top-1/4 border-t border-dashed border-slate-100" />
                <div className="absolute inset-x-0 top-2/4 border-t border-dashed border-slate-100" />
                <div className="absolute inset-x-0 top-3/4 border-t border-dashed border-slate-100" />

                {/* Bar 1: Pending (40) */}
                <div className="flex-1 flex flex-col items-center gap-1 relative z-10">
                  <span className="text-[10px] font-mono font-medium text-slate-600">40</span>
                  <div className="w-full bg-amber-400 rounded-t-md h-14" />
                  <span className="text-[10px] text-slate-500 font-normal">Pending</span>
                </div>

                {/* Bar 2: Under Testing (65) */}
                <div className="flex-1 flex flex-col items-center gap-1 relative z-10">
                  <span className="text-[10px] font-mono font-medium text-slate-600">65</span>
                  <div className="w-full bg-blue-500 rounded-t-md h-22" />
                  <span className="text-[10px] text-slate-500 font-normal">Testing</span>
                </div>

                {/* Bar 3: Passed (120) */}
                <div className="flex-1 flex flex-col items-center gap-1 relative z-10">
                  <span className="text-[10px] font-mono font-semibold text-emerald-700">120</span>
                  <div className="w-full bg-emerald-500 rounded-t-md h-28" />
                  <span className="text-[10px] text-slate-500 font-normal">Passed</span>
                </div>

                {/* Bar 4: Failed (18) */}
                <div className="flex-1 flex flex-col items-center gap-1 relative z-10">
                  <span className="text-[10px] font-mono font-medium text-slate-600">18</span>
                  <div className="w-full bg-rose-500 rounded-t-md h-7" />
                  <span className="text-[10px] text-slate-500 font-normal">Failed</span>
                </div>

                {/* Bar 5: Hold (12) */}
                <div className="flex-1 flex flex-col items-center gap-1 relative z-10">
                  <span className="text-[10px] font-mono font-medium text-slate-600">12</span>
                  <div className="w-full bg-slate-300 rounded-t-md h-5" />
                  <span className="text-[10px] text-slate-500 font-normal">Hold</span>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-3 pt-2 border-t border-slate-100 flex items-center justify-between text-[11px]">
            <span className="text-slate-500 text-[10px]">Quality Gatekeeper Active</span>
            <Link to="/lab-testing" className="text-[11px] font-medium text-blue-700 hover:text-blue-900">
              Lab Ledger →
            </Link>
          </div>
        </div>

        {/* Expiry Alerts (5 Cols) */}
        <div className="lg:col-span-5 bg-white rounded-xl p-4 border border-slate-200/90 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-2.5 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-md bg-amber-50 flex items-center justify-center text-amber-600">
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h3 className="text-xs font-semibold text-slate-800 uppercase tracking-wider">
                  Expiry Alerts (FEFO Priority)
                </h3>
              </div>
              <Link to="/hold-stock" className="text-[11px] font-medium text-emerald-700 hover:text-emerald-900">
                View All →
              </Link>
            </div>

            <div className="overflow-x-auto scrollbar-thin mt-2">
              <table className="w-full text-left text-xs whitespace-nowrap min-w-[500px]">
                <thead>
                  <tr className="border-b border-slate-100 text-slate-400 text-[10px] uppercase tracking-wider font-semibold">
                    <th className="py-2 px-2.5 w-8 text-center">#</th>
                    <th className="py-2 px-2.5">Product</th>
                    <th className="py-2 px-2.5">Batch</th>
                    <th className="py-2 px-2.5">Expiry Date</th>
                    <th className="py-2 px-2.5 text-center">Days Left</th>
                    <th className="py-2 px-2.5 text-right">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {expiryAlerts.map((row) => (
                    <tr key={row.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-2 px-2.5 text-slate-400 font-mono text-[10px] text-center w-8">{row.id}</td>
                      <td className="py-2 px-2.5 whitespace-nowrap font-medium text-slate-800 text-[11px]">{row.product}</td>
                      <td className="py-2 px-2.5 whitespace-nowrap font-mono text-slate-500 text-[10px] bg-slate-100/60 px-1.5 py-0.5 rounded border border-slate-200/50 inline-block">{row.batch}</td>
                      <td className="py-2 px-2.5 whitespace-nowrap text-slate-500 text-[11px]">{row.date}</td>
                      <td className="py-2 px-2.5 whitespace-nowrap text-center">
                        <span className="font-mono font-semibold text-amber-700 bg-amber-50 border border-amber-200/70 px-1.5 py-0.5 rounded text-[10px]">
                          {row.days} d
                        </span>
                      </td>
                      <td className="py-2 px-2.5 text-right whitespace-nowrap">
                        <span className={`text-[9px] font-medium px-1.5 py-0.5 rounded-full border ${row.statusColor}`}>
                          {row.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="mt-3 pt-2 border-t border-slate-100 flex items-center justify-between text-[11px]">
            <span className="text-slate-500 text-[10px]">FEFO Automated Depletion Enforced</span>
            <Link to="/current-stock" className="text-[11px] font-medium text-emerald-700 hover:text-emerald-900">
              Audit Register →
            </Link>
          </div>
        </div>

        {/* System Activity (3 Cols) */}
        <div className="lg:col-span-3 bg-white rounded-xl p-4 border border-slate-200/90 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-2.5 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-md bg-slate-100 flex items-center justify-center text-slate-700">
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h3 className="text-xs font-semibold text-slate-800 uppercase tracking-wider">
                  Audit Activity
                </h3>
              </div>
              <span className="text-[10px] text-emerald-600 font-medium flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" /> Live
              </span>
            </div>

            <div className="space-y-2 pt-2.5 text-xs">
              <div className="flex items-start gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-1.5 shrink-0" />
                <div className="flex-1 leading-snug">
                  <p className="text-[11px] font-normal text-slate-700">
                    New GRN logged <span className="font-mono font-medium text-slate-800">(GRN-00125)</span>
                  </p>
                  <span className="text-[9px] text-slate-400 font-mono">10:12 AM</span>
                </div>
              </div>

              <div className="flex items-start gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-blue-500 mt-1.5 shrink-0" />
                <div className="flex-1 leading-snug">
                  <p className="text-[11px] font-normal text-slate-700">
                    Lab clearance <span className="font-mono text-emerald-700 font-medium">B102 Passed</span>
                  </p>
                  <span className="text-[9px] text-slate-400 font-mono">09:45 AM</span>
                </div>
              </div>

              <div className="flex items-start gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-1.5 shrink-0" />
                <div className="flex-1 leading-snug">
                  <p className="text-[11px] font-normal text-slate-700">
                    Stock put-away in <span className="font-medium text-slate-800">Shade 3 (R5, C7)</span>
                  </p>
                  <span className="text-[9px] text-slate-400 font-mono">09:30 AM</span>
                </div>
              </div>

              <div className="flex items-start gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-500 mt-1.5 shrink-0" />
                <div className="flex-1 leading-snug">
                  <p className="text-[11px] font-normal text-slate-700">
                    Gate vehicle arrival <span className="font-mono font-medium text-slate-800">UP32 AB 1256</span>
                  </p>
                  <span className="text-[9px] text-slate-400 font-mono">09:12 AM</span>
                </div>
              </div>

              <div className="flex items-start gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-slate-400 mt-1.5 shrink-0" />
                <div className="flex-1 leading-snug">
                  <p className="text-[11px] font-normal text-slate-700">
                    Terminal login <span className="font-medium text-slate-800">Col. A. Sharma</span>
                  </p>
                  <span className="text-[9px] text-slate-400 font-mono">08:50 AM</span>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-2 pt-2 border-t border-slate-100 text-right">
            <span className="text-[10px] text-slate-400">Mil-Log Event Stream</span>
          </div>
        </div>

      </div>

    </div>
  )
}
