import { useState } from 'react'
import { Package, Footprints, Fuel, Tent, Shield, Zap, Shirt, Layers, Archive, Flame, X, AlertTriangle } from 'lucide-react'

export default function Analytics() {
  // Toast notifications state
  const [toastMessage, setToastMessage] = useState(null)
  const triggerToast = (msg) => {
    setToastMessage(msg)
    setTimeout(() => setToastMessage(null), 3500)
  }

  // Header filters
  const [dateRange, setDateRange] = useState('01 Sep 2026 - 16 Sep 2026')
  const [horizonPeriod, setHorizonPeriod] = useState('Last 16 Days')
  const [movementGranularity, setMovementGranularity] = useState('Daily')

  // Modals state
  const [selectedItemModal, setSelectedItemModal] = useState(null)
  const [selectedAlertModal, setSelectedAlertModal] = useState(null)
  const [viewAllType, setViewAllType] = useState(null)

  // 6 KPI Stat Cards Data
  const kpiStats = [
    {
      id: 'stock-value',
      title: 'Total Stock Value',
      value: '₹ 12.48 Cr',
      badge: '↑ 8%',
      badgeType: 'positive',
      subtext: 'vs last period',
      bgIcon: 'bg-blue-500',
      icon: (
        <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
        </svg>
      ),
    },
    {
      id: 'total-items',
      title: 'Total Items',
      value: '5,842',
      badge: '↑ 4%',
      badgeType: 'positive',
      subtext: 'Active SKUs',
      bgIcon: 'bg-emerald-600',
      icon: (
        <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
        </svg>
      ),
    },
    {
      id: 'incoming-grn',
      title: 'Incoming (GRN)',
      value: '1,240',
      badge: '↑ 12%',
      badgeType: 'positive',
      subtext: 'This period',
      bgIcon: 'bg-[#166534]',
      icon: (
        <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
        </svg>
      ),
    },
    {
      id: 'outgoing-dispatch',
      title: 'Outgoing (Dispatch)',
      value: '980',
      badge: '↑ 6%',
      badgeType: 'positive',
      subtext: 'This period',
      bgIcon: 'bg-rose-600',
      icon: (
        <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l4-4m0 0l4 4m-4-4v12" />
        </svg>
      ),
    },
    {
      id: 'low-stock-items',
      title: 'Low Stock Items',
      value: '52',
      badge: '↑ 18%',
      badgeType: 'negative',
      subtext: 'Require attention',
      bgIcon: 'bg-amber-500',
      icon: (
        <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
        </svg>
      ),
    },
    {
      id: 'on-hold',
      title: 'On Hold',
      value: '48',
      badge: '↓ 22%',
      badgeType: 'negative',
      subtext: 'Under review',
      bgIcon: 'bg-amber-500',
      icon: (
        <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
    },
  ]

  // Stock Movement Line Chart (9 Points: 01 Sep to 16 Sep)
  const movementDates = ['01 Sep', '03 Sep', '05 Sep', '07 Sep', '09 Sep', '11 Sep', '13 Sep', '15 Sep', '16 Sep']
  const goodsReceivedSeries = [140, 185, 170, 210, 200, 175, 215, 185, 200]
  const issuedDispatchSeries = [110, 150, 145, 160, 150, 140, 165, 150, 160]
  const adjustmentSeries = [60, 75, 65, 80, 75, 70, 85, 75, 80]
  const damageSeries = [18, 22, 19, 24, 21, 20, 26, 22, 24]

  const getMovementY = (val) => {
    // 0 to 300 scaled between 190 to 20
    const minY = 20
    const maxY = 190
    return maxY - (val / 300) * (maxY - minY)
  }
  const getMovementX = (index) => {
    // 9 points across width 45 to 475
    return 48 + index * 53
  }
  const makeMovementPath = (series) => {
    return series.map((val, idx) => `${idx === 0 ? 'M' : 'L'} ${getMovementX(idx)} ${getMovementY(val)}`).join(' ')
  }

  // Inventory Status Donut Data
  const inventoryStatusItems = [
    { name: 'In Stock', pct: '68%', count: '3,975', color: '#047857', bg: 'bg-[#047857]' },
    { name: 'On Hold', pct: '8%', count: '467', color: '#F59E0B', bg: 'bg-[#F59E0B]' },
    { name: 'Low Stock', pct: '12%', count: '701', color: '#3B82F6', bg: 'bg-[#3B82F6]' },
    { name: 'Damaged', pct: '4%', count: '247', color: '#A855F7', bg: 'bg-[#A855F7]' },
    { name: 'Expired', pct: '3%', count: '175', color: '#EF4444', bg: 'bg-[#EF4444]' },
    { name: 'In Transit', pct: '5%', count: '277', color: '#06B6D4', bg: 'bg-[#06B6D4]' },
  ]

  // Location Wise Stock Value
  const locationValues = [
    { loc: 'A1-R1-B1', val: '₹ 2.48 Cr', pct: 100, color: 'bg-[#1E40AF]' },
    { loc: 'B1-R2-B3', val: '₹ 1.86 Cr', pct: 75, color: 'bg-[#3B82F6]' },
    { loc: 'C1-R1-B2', val: '₹ 1.24 Cr', pct: 50, color: 'bg-[#F97316]' },
    { loc: 'Z1-R1-B1', val: '₹ 0.98 Cr', pct: 40, color: 'bg-[#EF4444]' },
    { loc: 'A2-R3-B1', val: '₹ 0.76 Cr', pct: 31, color: 'bg-[#EC4899]' },
    { loc: 'C3-R2-B1', val: '₹ 0.62 Cr', pct: 25, color: 'bg-[#A855F7]' },
    { loc: 'D1-R1-B1', val: '₹ 0.54 Cr', pct: 22, color: 'bg-[#14B8A6]' },
    { loc: 'B2-R1-B1', val: '₹ 0.48 Cr', pct: 19, color: 'bg-[#10B981]' },
    { loc: 'E1-R2-B1', val: '₹ 0.42 Cr', pct: 17, color: 'bg-[#06B6D4]' },
    { loc: 'Others', val: '₹ 1.08 Cr', pct: 44, color: 'bg-[#94A3B8]' },
  ]

  // Top 5 Fast Moving Items
  const fastMoving = [
    { id: 1, name: 'Rice (Superior Grade 25kg)', sku: 'RIC-25KG', qty: '3,850', val: '₹ 48,12,500', icon: Package },
    { id: 2, name: 'Cooking Oil (Refined Mustard 15L)', sku: 'OIL-15L', qty: '2,640', val: '₹ 12,76,200', icon: Footprints },
    { id: 3, name: 'Engine Oil 15W-40 (20L Drum)', sku: 'EO-1540', qty: '1,920', val: '₹ 47,04,000', icon: Fuel },
    { id: 4, name: 'Heavy Duty Waterproof Tarpaulin', sku: 'TAR-001', qty: '1,450', val: '₹ 55,10,000', icon: Tent },
    { id: 5, name: 'Corrugated Packaging Cartons', sku: 'CRT-001', qty: '1,280', val: '₹ 16,00,000', icon: Shield },
  ]

  // Top 5 Slow Moving Items
  const slowMoving = [
    { id: 1, name: 'Solar Lantern', sku: 'SL-001', days: 142, qty: 80, icon: Zap },
    { id: 2, name: 'Rain Coat', sku: 'RC-001', days: 128, qty: 60, icon: Shirt },
    { id: 3, name: 'Sleeping Bag', sku: 'SB-001', days: 120, qty: 45, icon: Layers },
    { id: 4, name: 'Thermal Blanket', sku: 'TB-001', days: 118, qty: 40, icon: Archive },
    { id: 5, name: 'Field Stove', sku: 'FS-001', days: 110, qty: 35, icon: Flame },
  ]

  // Stock Alerts
  const stockAlerts = [
    { id: 1, type: 'Low Stock', name: 'Battery (AA)', sku: 'BAT-AA', status: '12 / 100', icon: 'alert' },
    { id: 2, type: 'Low Stock', name: 'Packing Tape Rolls', sku: 'PTR-001', status: '18 / 100', icon: 'alert' },
    { id: 3, type: 'Expiry (30 Days)', name: 'Disinfectant Spray', sku: 'DS-001', status: '20 / 75', icon: 'expiry' },
    { id: 4, type: 'Damaged Stock', name: 'First Aid Kit', sku: 'FAK-001', status: '25', icon: 'damage' },
    { id: 5, type: 'On Hold (Long)', name: 'Barcode Scanner', sku: 'SCN-001', status: '45 days', icon: 'hold' },
  ]

  // Expiry Trend (Next 6 Months)
  const expiryData = [
    { month: 'Sep 2026', total: 70, highRisk: 25 },
    { month: 'Oct 2026', total: 110, highRisk: 30 },
    { month: 'Nov 2026', total: 105, highRisk: 28 },
    { month: 'Dec 2026', total: 130, highRisk: 35 },
    { month: 'Jan 2027', total: 90, highRisk: 20 },
    { month: 'Feb 2027', total: 85, highRisk: 38 },
  ]

  // Monthly Dispatch vs Receipt
  const monthlyData = [
    { month: 'Sep 2026', received: 1200, dispatched: 950 },
    { month: 'Oct 2026', received: 1350, dispatched: 1000 },
    { month: 'Nov 2026', received: 1280, dispatched: 1050 },
    { month: 'Dec 2026', received: 1400, dispatched: 1100 },
    { month: 'Jan 2027', received: 1450, dispatched: 1150 },
    { month: 'Feb 2027', received: 1500, dispatched: 1100 },
  ]

  // Quick Insights items
  const quickInsights = [
    'Stock value increased by 8% compared to last period.',
    'Dispatches are 6% higher than last period.',
    '52 items are below reorder level.',
    '175 items will expire in next 30 days.',
    'Location A1-R1-B1 holds the highest stock value.',
  ]

  return (
    <div className="p-4 sm:p-6 space-y-4 max-w-[1600px] mx-auto min-h-screen bg-slate-50/50 font-sans">
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
          alt="Warehouse Analytics & Operations"
          className="w-full h-full object-cover object-center opacity-90"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-black/50 via-black/20 to-black/60" />

        <div className="absolute top-3 right-4 flex flex-col items-end gap-1.5">
          <div className="flex items-center gap-2 bg-black/40 backdrop-blur-md px-3 py-1 rounded-full border border-white/20">
            <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
            <span className="text-[10px] font-bold text-white tracking-widest uppercase">
              ANALYTICS ACTIVE
            </span>
          </div>
          <div className="bg-black/50 backdrop-blur-md px-2.5 py-0.5 rounded border border-white/10 text-[9px] font-mono font-bold text-emerald-300 tracking-wider hidden sm:block">
            REAL-TIME INVENTORY &amp; LOGISTICS INTELLIGENCE
          </div>
        </div>
      </div>

      {/* PAGE HEADER ROW */}
      <div className="bg-white rounded-xl shadow-xs border border-slate-200 p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            {/* Left Title & Icon */}
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-[#1E3A1E] text-white flex items-center justify-center shadow-xs shrink-0">
                {/* Analytics Dashboard Graph Icon */}
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <div>
                <h1 className="text-lg font-bold text-slate-800 tracking-tight">
                  Analytics Dashboard
                </h1>
                <p className="text-xs text-slate-500">
                  Real-time insights for smarter warehouse operations.
                </p>
              </div>
            </div>

            {/* Right Dropdown Filters */}
            <div className="flex flex-wrap items-center gap-2.5">
              {/* Date Range Picker */}
              <div className="relative">
                <select
                  value={dateRange}
                  onChange={(e) => {
                    setDateRange(e.target.value)
                    triggerToast(`Date filter updated: ${e.target.value}`)
                  }}
                  className="text-xs bg-slate-50 border border-slate-200 rounded-lg pl-8 pr-8 py-2 text-slate-700 font-medium focus:outline-none focus:ring-1 focus:ring-[#1E3A1E] appearance-none cursor-pointer"
                >
                  <option>01 Sep 2026 - 16 Sep 2026</option>
                  <option>01 Aug 2026 - 31 Aug 2026</option>
                  <option>01 Jul 2026 - 31 Jul 2026</option>
                  <option>Year to Date (2026)</option>
                </select>
                <svg className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <svg className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-2.5 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                </svg>
              </div>

              {/* Horizon Period Dropdown */}
              <div className="relative">
                <select
                  value={horizonPeriod}
                  onChange={(e) => {
                    setHorizonPeriod(e.target.value)
                    triggerToast(`Horizon changed to: ${e.target.value}`)
                  }}
                  className="text-xs bg-slate-50 border border-slate-200 rounded-lg pl-3 pr-8 py-2 text-slate-700 font-medium focus:outline-none focus:ring-1 focus:ring-[#1E3A1E] appearance-none cursor-pointer"
                >
                  <option>Last 16 Days</option>
                  <option>Last 30 Days</option>
                  <option>Last 90 Days</option>
                  <option>Last 6 Months</option>
                  <option>Current FY (2026-27)</option>
                </select>
                <svg className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-2.5 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </div>
          </div>

        {/* 6 KPI Stat Cards (Single Row - 6 Columns Grid) */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3.5 mb-4">
          {kpiStats.map((kpi) => (
            <div
              key={kpi.id}
              className="bg-white rounded-xl border border-slate-200 p-3.5 shadow-xs hover:shadow-md transition-shadow relative overflow-hidden"
            >
              <div className="flex items-center justify-between mb-2">
                <div className={`w-9 h-9 rounded-lg ${kpi.bgIcon} flex items-center justify-center shadow-xs shrink-0`}>
                  {kpi.icon}
                </div>
                <span
                  className={`text-[11px] font-bold px-1.5 py-0.5 rounded-full ${
                    kpi.badgeType === 'positive'
                      ? 'bg-emerald-50 text-emerald-700 border border-emerald-200/50'
                      : 'bg-rose-50 text-rose-700 border border-rose-200/50'
                  }`}
                >
                  {kpi.badge}
                </span>
              </div>
              <p className="text-[11px] font-medium text-slate-500 uppercase tracking-wider mb-0.5 truncate">
                {kpi.title}
              </p>
              <h3 className="text-lg font-extrabold text-slate-800 tracking-tight">
                {kpi.value}
              </h3>
              <p className="text-[10px] text-slate-400 mt-0.5">
                {kpi.subtext}
              </p>
            </div>
          ))}
        </div>

        {/* Row 1: 3 Visualizations (Stock Movement, Inventory Status, Location Value) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 mb-4">
          {/* Card 1: Stock Movement Overview (Span 5) */}
          <div className="lg:col-span-5 bg-white rounded-xl border border-slate-200 p-4 shadow-xs flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-[#1E3A1E]" />
                  <h3 className="text-xs font-bold text-slate-800">
                    Stock Movement Overview
                  </h3>
                </div>

                {/* Granularity Dropdown */}
                <select
                  value={movementGranularity}
                  onChange={(e) => setMovementGranularity(e.target.value)}
                  className="text-[11px] bg-slate-50 border border-slate-200 rounded-md px-2 py-0.5 text-slate-600 focus:outline-none"
                >
                  <option>Daily</option>
                  <option>Weekly</option>
                  <option>Monthly</option>
                </select>
              </div>

              {/* Legends Row */}
              <div className="flex flex-wrap items-center gap-3 text-[10px] text-slate-600 mb-2">
                <div className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-[#16A34A]" />
                  <span>Goods Received</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-[#2563EB]" />
                  <span>Issued / Dispatch</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-[#F59E0B]" />
                  <span>Adjustment</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-[#EF4444]" />
                  <span>Damage / Rejection</span>
                </div>
              </div>
            </div>

            {/* Multi-Line SVG Chart */}
            <div className="relative w-full h-56 pt-2">
              <svg className="w-full h-full overflow-visible" viewBox="0 0 520 220">
                {/* Horizontal Grid lines and Y labels */}
                {[300, 250, 200, 150, 100, 50, 0].map((val) => {
                  const y = getMovementY(val)
                  return (
                    <g key={val}>
                      <text x="8" y={y + 3} fill="#94A3B8" fontSize="9" fontWeight="500">
                        {val}
                      </text>
                      <line
                        x1="38"
                        y1={y}
                        x2="495"
                        y2={y}
                        stroke="#F1F5F9"
                        strokeDasharray={val === 0 ? '0' : '3 3'}
                        strokeWidth="1"
                      />
                    </g>
                  )
                })}

                {/* X Labels */}
                {movementDates.map((day, idx) => {
                  const x = getMovementX(idx)
                  return (
                    <text
                      key={day}
                      x={x}
                      y="210"
                      textAnchor="middle"
                      fill="#64748B"
                      fontSize="9"
                      fontWeight="500"
                    >
                      {day}
                    </text>
                  )
                })}

                {/* Line 1: Goods Received (Emerald/Green) */}
                <path
                  d={makeMovementPath(goodsReceivedSeries)}
                  fill="none"
                  stroke="#16A34A"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                {goodsReceivedSeries.map((val, idx) => (
                  <circle
                    key={idx}
                    cx={getMovementX(idx)}
                    cy={getMovementY(val)}
                    r="3.5"
                    fill="#16A34A"
                    stroke="#ffffff"
                    strokeWidth="1.5"
                    className="hover:r-5 transition-all cursor-pointer"
                  >
                    <title>{`Goods Received: ${val} units (${movementDates[idx]})`}</title>
                  </circle>
                ))}

                {/* Line 2: Issued / Dispatch (Blue) */}
                <path
                  d={makeMovementPath(issuedDispatchSeries)}
                  fill="none"
                  stroke="#2563EB"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                {issuedDispatchSeries.map((val, idx) => (
                  <circle
                    key={idx}
                    cx={getMovementX(idx)}
                    cy={getMovementY(val)}
                    r="3.5"
                    fill="#2563EB"
                    stroke="#ffffff"
                    strokeWidth="1.5"
                    className="hover:r-5 transition-all cursor-pointer"
                  >
                    <title>{`Issued: ${val} units (${movementDates[idx]})`}</title>
                  </circle>
                ))}

                {/* Line 3: Adjustment (Amber) */}
                <path
                  d={makeMovementPath(adjustmentSeries)}
                  fill="none"
                  stroke="#F59E0B"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                {adjustmentSeries.map((val, idx) => (
                  <circle
                    key={idx}
                    cx={getMovementX(idx)}
                    cy={getMovementY(val)}
                    r="3"
                    fill="#F59E0B"
                    stroke="#ffffff"
                    strokeWidth="1.5"
                    className="hover:r-5 transition-all cursor-pointer"
                  >
                    <title>{`Adjustment: ${val} units (${movementDates[idx]})`}</title>
                  </circle>
                ))}

                {/* Line 4: Damage / Rejection (Red) */}
                <path
                  d={makeMovementPath(damageSeries)}
                  fill="none"
                  stroke="#EF4444"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                {damageSeries.map((val, idx) => (
                  <circle
                    key={idx}
                    cx={getMovementX(idx)}
                    cy={getMovementY(val)}
                    r="3"
                    fill="#EF4444"
                    stroke="#ffffff"
                    strokeWidth="1.5"
                    className="hover:r-5 transition-all cursor-pointer"
                  >
                    <title>{`Damage/Rejected: ${val} units (${movementDates[idx]})`}</title>
                  </circle>
                ))}
              </svg>
            </div>
          </div>

          {/* Card 2: Inventory Status (Span 4) */}
          <div className="lg:col-span-4 bg-white rounded-xl border border-slate-200 p-4 shadow-xs flex flex-col">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-2.5 h-2.5 rounded-full bg-[#1E3A1E]" />
              <h3 className="text-xs font-bold text-slate-800">
                Inventory Status
              </h3>
            </div>

            <div className="flex-1 flex items-center justify-center my-auto py-2">
              <div className="grid grid-cols-12 gap-3 items-center w-full">
                {/* Donut Chart with Center Text (Span 6) */}
                <div className="col-span-6 relative flex items-center justify-center">
                  <svg className="w-44 h-44 xl:w-48 xl:h-48 -rotate-90" viewBox="0 0 100 100">
                    {/* Outer segments using stroke-dasharray (Circumference ~ 238) */}
                    <circle cx="50" cy="50" r="38" fill="transparent" stroke="#047857" strokeWidth="15" strokeDasharray="162.4 76.4" strokeDashoffset="0" />
                    <circle cx="50" cy="50" r="38" fill="transparent" stroke="#F59E0B" strokeWidth="15" strokeDasharray="19.1 219.7" strokeDashoffset="-162.4" />
                    <circle cx="50" cy="50" r="38" fill="transparent" stroke="#3B82F6" strokeWidth="15" strokeDasharray="28.7 210.1" strokeDashoffset="-181.5" />
                    <circle cx="50" cy="50" r="38" fill="transparent" stroke="#A855F7" strokeWidth="15" strokeDasharray="9.6 229.2" strokeDashoffset="-210.2" />
                    <circle cx="50" cy="50" r="38" fill="transparent" stroke="#EF4444" strokeWidth="15" strokeDasharray="7.2 231.6" strokeDashoffset="-219.8" />
                    <circle cx="50" cy="50" r="38" fill="transparent" stroke="#06B6D4" strokeWidth="15" strokeDasharray="11.9 226.9" strokeDashoffset="-227.0" />
                  </svg>
                  {/* Center text overlay */}
                  <div className="absolute inset-0 flex flex-col items-center justify-center text-center pointer-events-none">
                    <span className="text-2xl font-black text-slate-800 tracking-tight leading-none">
                      5,842
                    </span>
                    <span className="text-[11px] text-slate-400 font-semibold mt-1">
                      Total Items
                    </span>
                  </div>
                </div>

                {/* Legend List (Span 6) */}
                <div className="col-span-6 space-y-2.5">
                  {inventoryStatusItems.map((item) => (
                    <div key={item.name} className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2 truncate">
                        <span className={`w-3 h-3 rounded-xs ${item.bg} shrink-0`} />
                        <span className="text-slate-600 truncate font-medium">{item.name}</span>
                      </div>
                      <div className="text-right pl-2 shrink-0">
                        <span className="font-bold text-slate-800">{item.pct}</span>{' '}
                        <span className="text-slate-400 text-[11px]">({item.count})</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Card 3: Location Wise Stock Value (Span 3.5) */}
          <div className="lg:col-span-3 bg-white rounded-xl border border-slate-200 p-4 shadow-xs flex flex-col justify-between">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-[#1E3A1E]" />
                <h3 className="text-xs font-bold text-slate-800">
                  Location Wise Stock Value
                </h3>
              </div>
              <button
                type="button"
                onClick={() => triggerToast('Viewing Top 10 Depot Locations')}
                className="text-[10px] text-slate-400 hover:text-slate-700 flex items-center gap-0.5 font-medium"
              >
                <span>Top 10 Locations</span>
                <span>▾</span>
              </button>
            </div>

            <div className="space-y-1.5">
              {locationValues.map((loc) => (
                <div key={loc.loc} className="text-xs">
                  <div className="flex items-center justify-between text-[10px] mb-0.5 font-medium">
                    <span className="text-slate-700 font-semibold">{loc.loc}</span>
                    <span className="text-slate-800 font-bold">{loc.val}</span>
                  </div>
                  <div className="w-full h-1.5 rounded-full bg-slate-100 overflow-hidden">
                    <div
                      className={`h-full rounded-full ${loc.color} transition-all duration-500`}
                      style={{ width: `${loc.pct}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Row 2: Item Rankings & Alerts (Fast Moving, Slow Moving, Stock Alerts) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 mb-4">
          {/* Card 1: Top 5 Fast Moving Items (Span 4) */}
          <div className="lg:col-span-4 bg-white rounded-xl border border-slate-200 p-4 shadow-xs flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full bg-[#1E3A1E]" />
                  <h3 className="text-xs font-bold text-slate-800">
                    Top 5 Fast Moving Items
                  </h3>
                </div>
                <button
                  type="button"
                  onClick={() => setViewAllType('fast')}
                  className="text-[11px] font-semibold text-emerald-800 hover:underline flex items-center gap-1"
                >
                  <span>View All</span>
                  <span>→</span>
                </button>
              </div>

              <div className="overflow-x-auto no-scrollbar">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-slate-100 text-[10px] uppercase font-bold text-slate-400">
                      <th className="pb-2.5 px-1.5 w-6 text-center whitespace-nowrap">#</th>
                      <th className="pb-2.5 px-1.5 whitespace-nowrap">Product Name</th>
                      <th className="pb-2.5 px-1.5 whitespace-nowrap">SKU</th>
                      <th className="pb-2.5 px-1.5 text-right whitespace-nowrap">Issued Qty</th>
                      <th className="pb-2.5 px-1.5 text-right whitespace-nowrap">Value (₹)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-xs">
                    {fastMoving.map((item) => (
                      <tr
                        key={item.id}
                        onClick={() => setSelectedItemModal({ ...item, category: 'Fast Moving', type: 'fast' })}
                        className="hover:bg-slate-50/80 transition-colors cursor-pointer"
                      >
                        <td className="py-2.5 px-1.5 text-center text-slate-400 text-[11px] whitespace-nowrap">
                          {item.id}
                        </td>
                        <td className="py-2.5 px-1.5 font-medium text-slate-800 whitespace-nowrap">
                          <div className="flex items-center gap-1.5">
                            <item.icon className="w-4 h-4 shrink-0 text-slate-500" />
                            <span>{item.name}</span>
                          </div>
                        </td>
                        <td className="py-2.5 px-1.5 text-slate-500 text-[11px] font-mono whitespace-nowrap">
                          {item.sku}
                        </td>
                        <td className="py-2.5 px-1.5 text-right font-medium text-slate-700 whitespace-nowrap">
                          {item.qty}
                        </td>
                        <td className="py-2.5 px-1.5 text-right font-bold text-slate-800 whitespace-nowrap">
                          {item.val}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* Card 2: Top 5 Slow Moving Items (Span 4) */}
          <div className="lg:col-span-4 bg-white rounded-xl border border-slate-200 p-4 shadow-xs flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full bg-[#1E3A1E]" />
                  <h3 className="text-xs font-bold text-slate-800">
                    Top 5 Slow Moving Items
                  </h3>
                </div>
                <button
                  type="button"
                  onClick={() => setViewAllType('slow')}
                  className="text-[11px] font-semibold text-emerald-800 hover:underline flex items-center gap-1"
                >
                  <span>View All</span>
                  <span>→</span>
                </button>
              </div>

              <div className="overflow-x-auto no-scrollbar">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-slate-100 text-[10px] uppercase font-bold text-slate-400">
                      <th className="pb-2.5 px-1.5 w-6 text-center whitespace-nowrap">#</th>
                      <th className="pb-2.5 px-1.5 whitespace-nowrap">Product Name</th>
                      <th className="pb-2.5 px-1.5 whitespace-nowrap">SKU</th>
                      <th className="pb-2.5 px-2.5 text-right whitespace-nowrap">Days in Stock</th>
                      <th className="pb-2.5 px-2 text-right whitespace-nowrap">Qty</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-xs">
                    {slowMoving.map((item) => (
                      <tr
                        key={item.id}
                        onClick={() => setSelectedItemModal({ ...item, category: 'Slow Moving', type: 'slow' })}
                        className="hover:bg-slate-50/80 transition-colors cursor-pointer"
                      >
                        <td className="py-2.5 px-1.5 text-center text-slate-400 text-[11px] whitespace-nowrap">
                          {item.id}
                        </td>
                        <td className="py-2.5 px-1.5 font-medium text-slate-800 whitespace-nowrap">
                          <div className="flex items-center gap-1.5">
                            <item.icon className="w-4 h-4 shrink-0 text-slate-500" />
                            <span>{item.name}</span>
                          </div>
                        </td>
                        <td className="py-2.5 px-1.5 text-slate-500 text-[11px] font-mono whitespace-nowrap">
                          {item.sku}
                        </td>
                        <td className="py-2.5 px-2.5 text-right font-bold text-rose-600 whitespace-nowrap">
                          {item.days}
                        </td>
                        <td className="py-2.5 px-2 text-right font-medium text-slate-700 whitespace-nowrap">
                          {item.qty}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* Card 3: Stock Alerts (Span 4) */}
          <div className="lg:col-span-4 bg-white rounded-xl border border-slate-200 p-4 shadow-xs flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full bg-rose-500" />
                  <h3 className="text-xs font-bold text-slate-800">
                    Stock Alerts
                  </h3>
                </div>
                <button
                  type="button"
                  onClick={() => setViewAllType('alerts')}
                  className="text-[11px] font-semibold text-emerald-800 hover:underline flex items-center gap-1"
                >
                  <span>View All</span>
                  <span>→</span>
                </button>
              </div>

              <div className="overflow-x-auto no-scrollbar">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-slate-100 text-[10px] uppercase font-bold text-slate-400">
                      <th className="pb-2.5 px-1.5 w-5 text-center whitespace-nowrap">#</th>
                      <th className="pb-2.5 px-1.5 whitespace-nowrap">Alert Type</th>
                      <th className="pb-2.5 px-1.5 whitespace-nowrap">Product Name</th>
                      <th className="pb-2.5 px-1.5 whitespace-nowrap">SKU</th>
                      <th className="pb-2.5 px-2 text-right whitespace-nowrap">Current / Reorder</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-xs">
                    {stockAlerts.map((alert) => (
                      <tr
                        key={alert.id}
                        onClick={() => setSelectedAlertModal(alert)}
                        className="hover:bg-slate-50/80 transition-colors cursor-pointer"
                      >
                        <td className="py-2.5 px-1.5 text-center text-slate-400 text-[11px] whitespace-nowrap">
                          {alert.id}
                        </td>
                        <td className="py-2.5 px-1.5 font-medium whitespace-nowrap">
                          <div className="flex items-center gap-1.5">
                            {alert.icon === 'alert' && (
                              <svg className="w-3.5 h-3.5 text-rose-500 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                              </svg>
                            )}
                            {alert.icon === 'expiry' && (
                              <svg className="w-3.5 h-3.5 text-amber-500 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                              </svg>
                            )}
                            {alert.icon === 'damage' && (
                              <svg className="w-3.5 h-3.5 text-orange-500 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                              </svg>
                            )}
                            {alert.icon === 'hold' && (
                              <svg className="w-3.5 h-3.5 text-amber-600 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                              </svg>
                            )}
                            <span className="text-slate-700 text-[11px] font-medium">{alert.type}</span>
                          </div>
                        </td>
                        <td className="py-2.5 px-1.5 font-medium text-slate-800 whitespace-nowrap">
                          {alert.name}
                        </td>
                        <td className="py-2.5 px-1.5 text-slate-500 text-[11px] font-mono whitespace-nowrap">
                          {alert.sku}
                        </td>
                        <td className="py-2.5 px-2 text-right font-bold text-rose-600 whitespace-nowrap">
                          {alert.status}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>

        {/* Row 3: Trends & Quick Insights (Expiry Trend, Monthly Dispatch vs Receipt, Quick Insights) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
          {/* Card 1: Expiry Trend (Span 4) */}
          <div className="lg:col-span-4 bg-white rounded-xl border border-slate-200 p-4 shadow-xs flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-[#1E3A1E]" />
                  <h3 className="text-xs font-bold text-slate-800">
                    Expiry Trend
                  </h3>
                </div>

                {/* Legend */}
                <div className="flex items-center gap-2.5 text-[10px] text-slate-600">
                  <div className="flex items-center gap-1">
                    <span className="w-2 h-2 rounded-xs bg-[#2563EB]" />
                    <span>Total Expiring</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <span className="w-2 h-2 rounded-xs bg-[#EF4444]" />
                    <span>High Risk (&lt; 30 days)</span>
                  </div>
                </div>
              </div>
            </div>

            {/* SVG Dual Bar Chart (0 to 200) */}
            <div className="relative w-full h-44 pt-1">
              <svg className="w-full h-full overflow-visible" viewBox="0 0 380 150">
                {/* Horizontal Grid lines */}
                {[200, 150, 100, 50, 0].map((val) => {
                  const y = 120 - (val / 200) * 105
                  return (
                    <g key={val}>
                      <text x="5" y={y + 3} fill="#94A3B8" fontSize="8" fontWeight="500">
                        {val}
                      </text>
                      <line x1="28" y1={y} x2="370" y2={y} stroke="#F1F5F9" strokeWidth="1" />
                    </g>
                  )
                })}

                {/* Bars for 6 Months */}
                {expiryData.map((item, idx) => {
                  const groupX = 42 + idx * 55
                  const totalH = (item.total / 200) * 105
                  const riskH = (item.highRisk / 200) * 105

                  return (
                    <g key={item.month}>
                      {/* Total Expiring Bar (Blue) */}
                      <rect
                        x={groupX}
                        y={120 - totalH}
                        width="11"
                        height={totalH}
                        rx="1.5"
                        fill="#2563EB"
                        className="hover:opacity-85 transition-opacity cursor-pointer"
                      >
                        <title>{`${item.month} Total Expiring: ${item.total}`}</title>
                      </rect>

                      {/* High Risk Bar (Red) */}
                      <rect
                        x={groupX + 13}
                        y={120 - riskH}
                        width="11"
                        height={riskH}
                        rx="1.5"
                        fill="#EF4444"
                        className="hover:opacity-85 transition-opacity cursor-pointer"
                      >
                        <title>{`${item.month} High Risk: ${item.highRisk}`}</title>
                      </rect>

                      {/* X Label */}
                      <text
                        x={groupX + 12}
                        y="136"
                        textAnchor="middle"
                        fill="#64748B"
                        fontSize="8"
                        fontWeight="500"
                      >
                        {item.month}
                      </text>
                    </g>
                  )
                })}
              </svg>
            </div>
          </div>

          {/* Card 2: Dispatch vs Receipt (Monthly) (Span 4) */}
          <div className="lg:col-span-4 bg-white rounded-xl border border-slate-200 p-4 shadow-xs flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-[#1E3A1E]" />
                  <h3 className="text-xs font-bold text-slate-800">
                    Dispatch vs Receipt (Monthly)
                  </h3>
                </div>

                {/* Legend */}
                <div className="flex items-center gap-2.5 text-[10px] text-slate-600">
                  <div className="flex items-center gap-1">
                    <span className="w-2 h-2 rounded-xs bg-[#059669]" />
                    <span>Received (GRN)</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <span className="w-2 h-2 rounded-xs bg-[#2563EB]" />
                    <span>Dispatched</span>
                  </div>
                </div>
              </div>
            </div>

            {/* SVG Dual Bar Chart (0 to 2000) */}
            <div className="relative w-full h-44 pt-1">
              <svg className="w-full h-full overflow-visible" viewBox="0 0 380 150">
                {/* Horizontal Grid lines */}
                {[2000, 1500, 1000, 500, 0].map((val) => {
                  const y = 120 - (val / 2000) * 105
                  return (
                    <g key={val}>
                      <text x="5" y={y + 3} fill="#94A3B8" fontSize="8" fontWeight="500">
                        {val.toLocaleString()}
                      </text>
                      <line x1="32" y1={y} x2="370" y2={y} stroke="#F1F5F9" strokeWidth="1" />
                    </g>
                  )
                })}

                {/* Bars for 6 Months */}
                {monthlyData.map((item, idx) => {
                  const groupX = 45 + idx * 55
                  const recH = (item.received / 2000) * 105
                  const dispH = (item.dispatched / 2000) * 105

                  return (
                    <g key={item.month}>
                      {/* Received Bar (Emerald) */}
                      <rect
                        x={groupX}
                        y={120 - recH}
                        width="11"
                        height={recH}
                        rx="1.5"
                        fill="#059669"
                        className="hover:opacity-85 transition-opacity cursor-pointer"
                      >
                        <title>{`${item.month} Received: ${item.received}`}</title>
                      </rect>

                      {/* Dispatched Bar (Blue) */}
                      <rect
                        x={groupX + 13}
                        y={120 - dispH}
                        width="11"
                        height={dispH}
                        rx="1.5"
                        fill="#2563EB"
                        className="hover:opacity-85 transition-opacity cursor-pointer"
                      >
                        <title>{`${item.month} Dispatched: ${item.dispatched}`}</title>
                      </rect>

                      {/* X Label */}
                      <text
                        x={groupX + 12}
                        y="136"
                        textAnchor="middle"
                        fill="#64748B"
                        fontSize="8"
                        fontWeight="500"
                      >
                        {item.month}
                      </text>
                    </g>
                  )
                })}
              </svg>
            </div>
          </div>

          {/* Card 3: Quick Insights (Span 4) */}
          <div className="lg:col-span-4 bg-white rounded-xl border border-slate-200 p-4 shadow-xs flex flex-col justify-between">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-2 h-2 rounded-full bg-[#1E3A1E]" />
              <h3 className="text-xs font-bold text-slate-800">
                Quick Insights
              </h3>
            </div>

            <div className="space-y-2.5">
              {quickInsights.map((insight, idx) => (
                <div key={idx} className="flex items-start gap-2 text-xs text-slate-700 font-medium">
                  <div className="w-4 h-4 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0 mt-0.5">
                    <svg className="w-2.5 h-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <span>{insight}</span>
                </div>
              ))}
            </div>

            <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
              <span>Last updated: Just now</span>
              <button
                type="button"
                onClick={() => triggerToast('Refreshing analytics insights from server...')}
                className="text-emerald-800 font-semibold hover:underline"
              >
                Refresh Data ↺
              </button>
            </div>
          </div>
        </div>

      {/* MODAL 1: Item Inspection Modal */}
      {selectedItemModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-md w-full p-5 animate-scale-up">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
              <div className="flex items-center gap-2.5">
                <selectedItemModal.icon className="w-7 h-7 text-emerald-700" />
                <div>
                  <h3 className="text-sm font-bold text-slate-800">{selectedItemModal.name}</h3>
                  <p className="text-[10px] text-slate-400 font-mono">SKU: {selectedItemModal.sku} | {selectedItemModal.category}</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setSelectedItemModal(null)}
                className="text-slate-400 hover:text-slate-700 p-1"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-2.5 text-xs text-slate-600 mb-5">
              <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 space-y-1.5">
                <div className="flex justify-between">
                  <span className="text-slate-400">Velocity Classification:</span>
                  <span className="font-bold text-emerald-700">{selectedItemModal.category}</span>
                </div>
                {selectedItemModal.type === 'fast' ? (
                  <>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Monthly Dispatched Quantity:</span>
                      <span className="font-bold text-slate-800">{selectedItemModal.qty} Units</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Total Consumption Value:</span>
                      <span className="font-bold text-slate-800">{selectedItemModal.val}</span>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Days Sitting in Depot:</span>
                      <span className="font-bold text-rose-600">{selectedItemModal.days} Days</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Remaining Inventory:</span>
                      <span className="font-bold text-slate-800">{selectedItemModal.qty} Units</span>
                    </div>
                  </>
                )}
                <div className="flex justify-between">
                  <span className="text-slate-400">Location Bay:</span>
                  <span className="font-semibold text-slate-700">A1-R1-B1 (Primary Bay)</span>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setSelectedItemModal(null)}
                className="px-4 py-2 rounded-lg border border-slate-200 text-slate-600 font-semibold text-xs hover:bg-slate-50"
              >
                Close
              </button>
              <button
                type="button"
                onClick={() => {
                  setSelectedItemModal(null)
                  triggerToast(`Initiating logistics reallocation for ${selectedItemModal.sku}...`)
                }}
                className="px-5 py-2 rounded-lg bg-[#1E3A1E] text-white font-semibold text-xs hover:bg-[#2a4e2a]"
              >
                Reallocate Stock
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 2: Alert Action Modal */}
      {selectedAlertModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-md w-full p-5 animate-scale-up">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-rose-50 text-rose-600 flex items-center justify-center font-bold">
                  <AlertTriangle className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-800">{selectedAlertModal.type}: {selectedAlertModal.name}</h3>
                  <p className="text-[10px] text-slate-400 font-mono">SKU: {selectedAlertModal.sku}</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setSelectedAlertModal(null)}
                className="text-slate-400 hover:text-slate-700 p-1"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="bg-rose-50/60 border border-rose-200 rounded-xl p-3.5 space-y-2 text-xs mb-4">
              <div className="flex justify-between">
                <span className="text-slate-600 font-medium">Critical Metric:</span>
                <span className="font-bold text-rose-700">{selectedAlertModal.status}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-600 font-medium">Severity:</span>
                <span className="font-bold text-rose-600">HIGH PRIORITY (DEPOT INDENT REQUIRED)</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-600 font-medium">Action Needed:</span>
                <span className="text-slate-700">Immediate purchase indent or QA re-inspection</span>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setSelectedAlertModal(null)}
                className="px-4 py-2 rounded-lg border border-slate-200 text-slate-600 font-semibold text-xs hover:bg-slate-50"
              >
                Dismiss
              </button>
              <button
                type="button"
                onClick={() => {
                  setSelectedAlertModal(null)
                  triggerToast(`Indent requisition submitted for ${selectedAlertModal.sku}!`)
                }}
                className="px-5 py-2 rounded-lg bg-rose-600 text-white font-semibold text-xs hover:bg-rose-700"
              >
                Trigger Reorder Indent
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 3: View All Items List Modal */}
      {viewAllType && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-2xl w-full p-5 animate-scale-up">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
              <h3 className="text-sm font-bold text-slate-800">
                {viewAllType === 'fast' && 'Complete High-Velocity Inventory (Fast Moving)'}
                {viewAllType === 'slow' && 'Complete Low-Velocity Inventory (Slow Moving)'}
                {viewAllType === 'alerts' && 'Complete Warehouse Risk & Stock Alerts'}
              </h3>
              <button
                type="button"
                onClick={() => setViewAllType(null)}
                className="text-slate-400 hover:text-slate-700 p-1"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="max-h-80 overflow-y-auto no-scrollbar mb-4">
              {viewAllType === 'fast' && (
                <table className="w-full text-left text-xs">
                  <thead className="text-[10px] text-slate-400 uppercase border-b border-slate-100">
                    <tr>
                      <th className="pb-2">Product</th>
                      <th className="pb-2">SKU</th>
                      <th className="pb-2 text-right">Issued Qty</th>
                      <th className="pb-2 text-right">Value (₹)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {fastMoving.map((item) => (
                      <tr key={item.id} className="hover:bg-slate-50">
                        <td className="py-2.5 font-medium flex items-center gap-2">
                          <item.icon className="w-4 h-4 text-slate-500 shrink-0" />
                          <span>{item.name}</span>
                        </td>
                        <td className="py-2.5 font-mono text-slate-500">{item.sku}</td>
                        <td className="py-2.5 text-right font-medium">{item.qty}</td>
                        <td className="py-2.5 text-right font-bold text-slate-800">{item.val}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}

              {viewAllType === 'slow' && (
                <table className="w-full text-left text-xs">
                  <thead className="text-[10px] text-slate-400 uppercase border-b border-slate-100">
                    <tr>
                      <th className="pb-2">Product</th>
                      <th className="pb-2">SKU</th>
                      <th className="pb-2 text-right">Days in Stock</th>
                      <th className="pb-2 text-right">Qty</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {slowMoving.map((item) => (
                      <tr key={item.id} className="hover:bg-slate-50">
                        <td className="py-2.5 font-medium flex items-center gap-2">
                          <item.icon className="w-4 h-4 text-slate-500 shrink-0" />
                          <span>{item.name}</span>
                        </td>
                        <td className="py-2.5 font-mono text-slate-500">{item.sku}</td>
                        <td className="py-2.5 text-right font-bold text-rose-600">{item.days} days</td>
                        <td className="py-2.5 text-right font-medium">{item.qty}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}

              {viewAllType === 'alerts' && (
                <table className="w-full text-left text-xs">
                  <thead className="text-[10px] text-slate-400 uppercase border-b border-slate-100">
                    <tr>
                      <th className="pb-2">Alert</th>
                      <th className="pb-2">Product</th>
                      <th className="pb-2">SKU</th>
                      <th className="pb-2 text-right">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {stockAlerts.map((item) => (
                      <tr key={item.id} className="hover:bg-slate-50">
                        <td className="py-2.5 font-medium text-rose-600">{item.type}</td>
                        <td className="py-2.5 font-medium">{item.name}</td>
                        <td className="py-2.5 font-mono text-slate-500">{item.sku}</td>
                        <td className="py-2.5 text-right font-bold text-rose-600">{item.status}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>

            <div className="flex items-center justify-end">
              <button
                type="button"
                onClick={() => setViewAllType(null)}
                className="px-4 py-2 rounded-lg bg-[#1E3A1E] text-white font-semibold text-xs hover:bg-[#2a4e2a]"
              >
                Close List
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
