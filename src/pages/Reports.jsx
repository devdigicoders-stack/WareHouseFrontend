import { useState } from 'react'
import { X, Clock, Shield } from 'lucide-react'

export default function Reports() {
  // Toast notifications state
  const [toastMessage, setToastMessage] = useState(null)
  const triggerToast = (msg) => {
    setToastMessage(msg)
    setTimeout(() => setToastMessage(null), 3500)
  }

  // Filter toolbar state
  const [reportType, setReportType] = useState('All Reports')
  const [productCategory, setProductCategory] = useState('All Categories')
  const [selectedLocation, setSelectedLocation] = useState('All Locations')
  const [dateRange, setDateRange] = useState('01 Sep 2026 - 16 Sep 2026')
  const [groupBy, setGroupBy] = useState('Daily')

  // Modals state
  const [showScheduleModal, setShowScheduleModal] = useState(false)
  const [showPreviewModal, setShowPreviewModal] = useState(null)
  const [selectedQuickReport, setSelectedQuickReport] = useState(null)

  // Schedule Modal Form state
  const [scheduleConfig, setScheduleConfig] = useState({
    reportName: 'Consolidated Depot Stock & Movement Report',
    frequency: 'Daily (08:00 IST)',
    format: 'PDF & Excel (.xlsx)',
    recipients: 'Col. A. Sharma (CO), Maj. V. Singh (QM)',
    classification: 'CONFIDENTIAL // OFFICIAL USE ONLY',
  })

  // KPI Stat Cards data (Row of 6)
  const kpiStats = [
    {
      id: 'stock-val',
      title: 'Total Stock Value',
      value: '₹ 12.48 Cr',
      badge: '↑ 8%',
      badgeType: 'positive',
      subtext: 'vs last month',
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
      id: 'goods-rec',
      title: 'Goods Received',
      value: '1,240',
      badge: '↑ 12%',
      badgeType: 'positive',
      subtext: 'This period',
      bgIcon: 'bg-amber-500',
      icon: (
        <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
        </svg>
      ),
    },
    {
      id: 'items-iss',
      title: 'Items Issued',
      value: '980',
      badge: '↑ 6%',
      badgeType: 'positive',
      subtext: 'This period',
      bgIcon: 'bg-purple-600',
      icon: (
        <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
        </svg>
      ),
    },
    {
      id: 'damaged-rej',
      title: 'Damaged / Rejected',
      value: '52',
      badge: '↓ 18%',
      badgeType: 'negative',
      subtext: 'This period',
      bgIcon: 'bg-rose-600',
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
      subtext: 'This period',
      bgIcon: 'bg-amber-500',
      icon: (
        <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
    },
  ]

  // Top 10 Products by Stock Value
  const topProducts = [
    { rank: 1, name: '7.62mm Ammunition Box', sku: 'AMM-762', qty: '3,850', unitPrice: '₹ 12,500', totalValue: '₹ 4,81,25,000' },
    { rank: 2, name: 'Combat Boots', sku: 'CB-001', qty: '2,640', unitPrice: '₹ 4,800', totalValue: '₹ 1,26,72,000' },
    { rank: 3, name: 'Engine Oil 15W-40', sku: 'EO-1540', qty: '1,920', unitPrice: '₹ 2,450', totalValue: '₹ 47,04,000' },
    { rank: 4, name: 'Field Tent', sku: 'FT-001', qty: '1,450', unitPrice: '₹ 3,800', totalValue: '₹ 55,10,000' },
    { rank: 5, name: 'Medical Gloves', sku: 'MG-001', qty: '1,280', unitPrice: '₹ 1,250', totalValue: '₹ 16,00,000' },
    { rank: 6, name: 'First Aid Kit', sku: 'FAK-001', qty: '1,120', unitPrice: '₹ 1,800', totalValue: '₹ 20,16,000' },
    { rank: 7, name: 'VHF Radio Set', sku: 'VHF-001', qty: '980', unitPrice: '₹ 5,600', totalValue: '₹ 54,88,000' },
    { rank: 8, name: 'Water Purification Tablet', sku: 'WPT-001', qty: '860', unitPrice: '₹ 950', totalValue: '₹ 8,17,000' },
    { rank: 9, name: 'Solar Lantern', sku: 'SL-001', qty: '720', unitPrice: '₹ 1,750', totalValue: '₹ 12,60,000' },
    { rank: 10, name: 'Ration Pack', sku: 'RP-001', qty: '690', unitPrice: '₹ 1,200', totalValue: '₹ 8,28,000' },
  ]

  // Transaction Summary
  const transactionSummary = [
    { type: 'Goods Received (GRN)', count: '1,240', qty: '25,680', color: 'bg-emerald-600' },
    { type: 'Product Entry', count: '860', qty: '18,420', color: 'bg-blue-600' },
    { type: 'Issue / Dispatch', count: '980', qty: '22,450', color: 'bg-purple-600' },
    { type: 'Return / Receive Back', count: '120', qty: '2,680', color: 'bg-amber-600' },
    { type: 'Stock Adjustment', count: '95', qty: '1,240', color: 'bg-teal-600' },
    { type: 'Damage / Rejection', count: '52', qty: '980', color: 'bg-rose-600' },
    { type: 'Hold / Release', count: '48', qty: '1,120', color: 'bg-indigo-600' },
  ]

  // Quick Reports Links
  const quickReports = [
    { id: 'qr-current', title: 'Current Stock Report', icon: 'M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4', desc: 'Full snapshot of in-depot inventory and location matrix' },
    { id: 'qr-low', title: 'Low Stock Report', icon: 'M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z', desc: 'Items currently below minimum buffer replenishment thresholds' },
    { id: 'qr-expiry', title: 'Expiry Report', icon: 'M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z', desc: 'Medicines and shelf-life items nearing critical expiration dates' },
    { id: 'qr-damage', title: 'Damage / Rejection Report', icon: 'M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z', desc: 'Detailed triage of damaged ammo, rejected garments and return logs' },
    { id: 'qr-hold', title: 'Hold Stock Report', icon: 'M10 9v6m4-6v6m7-3a9 9 0 11-18 0 9 9 0 0118 0z', desc: 'Quarantine and inspection-halted batches pending QA clearance' },
    { id: 'qr-dispatch', title: 'Issue / Dispatch Report', icon: 'M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1', desc: 'Summary of outbound vouchers, receiving forward units, and drivers' },
    { id: 'qr-gatepass', title: 'Gate Pass Report', icon: 'M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z', desc: 'Log of military convoys, gate exits, and officer authorizations' },
    { id: 'qr-location', title: 'Location Wise Stock Report', icon: 'M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z', desc: 'Aisle, rack, and bin occupancy analysis across all warehouse bays' },
    { id: 'qr-movement', title: 'Product Wise Movement', icon: 'M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15', desc: 'Fast-moving vs slow-moving ordnance velocity and turnover rates' },
    { id: 'qr-audit', title: 'Audit Trail Report', icon: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4', desc: 'Cryptographic ledger of user logins, overrides, and adjustments' },
  ]

  // Category Wise Stock Distribution
  const categories = [
    { name: 'Ammunition', pct: '28%', count: '1,635', color: '#2563EB', bg: 'bg-blue-600' },
    { name: 'Medical', pct: '18%', count: '1,052', color: '#06B6D4', bg: 'bg-cyan-500' },
    { name: 'Combat Gear', pct: '15%', count: '876', color: '#10B981', bg: 'bg-emerald-500' },
    { name: 'Spare Parts', pct: '12%', count: '701', color: '#F97316', bg: 'bg-orange-500' },
    { name: 'Uniform & Textile', pct: '10%', count: '584', color: '#EF4444', bg: 'bg-rose-500' },
    { name: 'Electronics', pct: '8%', count: '467', color: '#8B5CF6', bg: 'bg-purple-500' },
    { name: 'Others', pct: '9%', count: '527', color: '#64748B', bg: 'bg-slate-500' },
  ]

  // Location Wise Stock
  const locations = [
    { loc: 'A1-R1-B1', count: 1240, max: 1300, color: 'bg-[#1E40AF]' },
    { loc: 'B1-R2-B3', count: 980, max: 1300, color: 'bg-[#3B82F6]' },
    { loc: 'C1-R1-B2', count: 760, max: 1300, color: 'bg-[#F97316]' },
    { loc: 'Z1-R1-B1', count: 620, max: 1300, color: 'bg-[#8B5CF6]' },
    { loc: 'A2-R3-B1', count: 580, max: 1300, color: 'bg-[#EF4444]' },
    { loc: 'C3-R2-B1', count: 460, max: 1300, color: 'bg-[#F59E0B]' },
    { loc: 'Others', count: 1202, max: 1300, color: 'bg-[#64748B]' },
  ]

  // Low Stock Alert (Top 5)
  const lowStock = [
    { id: 1, name: 'Battery (AA)', sku: 'BAT-AA', current: 12, reorder: 100 },
    { id: 2, name: 'Helmet Cover', sku: 'HC-001', current: 18, reorder: 100 },
    { id: 3, name: 'Field Stove', sku: 'FS-001', current: 20, reorder: 75 },
    { id: 4, name: 'Rain Coat', sku: 'RC-001', current: 25, reorder: 100 },
    { id: 5, name: 'Thermal Blanket', sku: 'TB-001', current: 28, reorder: 100 },
  ]

  // Expiry Trend Data (6 Months)
  const expiryTrend = [
    { month: 'Sep 2026', total: 180, highRisk: 60 },
    { month: 'Oct 2026', total: 140, highRisk: 40 },
    { month: 'Nov 2026', total: 220, highRisk: 80 },
    { month: 'Dec 2026', total: 190, highRisk: 55 },
    { month: 'Jan 2027', total: 260, highRisk: 70 },
    { month: 'Feb 2027', total: 240, highRisk: 65 },
  ]

  // Stock Movement Line Chart Data (10 Sep - 16 Sep)
  const movementDays = ['10 Sep', '11 Sep', '12 Sep', '13 Sep', '14 Sep', '15 Sep', '16 Sep']
  const goodsReceivedLine = [190, 240, 200, 235, 220, 255, 230]
  const issuedDispatchLine = [150, 180, 160, 180, 180, 210, 195]
  const adjustmentLine = [60, 75, 70, 72, 68, 90, 80]
  const damageRejectionLine = [20, 22, 18, 20, 25, 28, 22]

  // Helper function to map chart coordinates
  const getY = (val) => {
    // scale from 0 to 300 onto y: 190 to 20
    const minY = 20
    const maxY = 190
    return maxY - (val / 300) * (maxY - minY)
  }
  const getX = (index) => {
    // 7 points across width 40 to 460
    return 50 + index * 66
  }

  // Generate path string for SVG line
  const makeLinePath = (data) => {
    return data.map((val, idx) => `${idx === 0 ? 'M' : 'L'} ${getX(idx)} ${getY(val)}`).join(' ')
  }

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

      {/* TOP HIMALAYAN CONVOY BANNER WITH SIGN */}
      <div className="relative rounded-xl overflow-hidden shadow-md border border-slate-200/80 bg-slate-900 h-28 sm:h-32">
        <img
          src="/border.png"
          alt="Central Warehouse Logistics Operations"
          className="w-full h-full object-cover object-center opacity-90"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-black/50 via-black/20 to-black/60" />

        {/* Right side slogan billboard & flag pill matching screenshot */}
        <div className="absolute top-3 right-4 flex flex-col items-end gap-1.5">
          <div className="flex items-center gap-2 bg-black/40 backdrop-blur-md px-3 py-1 rounded-full border border-white/20">
            <div className="h-2 w-5 flex flex-col justify-between rounded-xs overflow-hidden">
              <div className="h-0.5 bg-[#FF9933]" />
              <div className="h-0.5 bg-white" />
              <div className="h-0.5 bg-[#138808]" />
            </div>
            <span className="text-[10px] font-bold text-white tracking-widest uppercase">
              NATION FIRST ALWAYS
            </span>
          </div>
          <div className="bg-black/50 backdrop-blur-md px-2.5 py-0.5 rounded border border-white/10 text-[9px] font-mono font-bold text-amber-300 tracking-wider hidden sm:block">
            SECURE SUPPLY | STRONGER NATION
          </div>
        </div>
      </div>

      {/* PAGE HEADER ROW */}
      <div className="bg-white rounded-xl shadow-xs border border-slate-200 p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            {/* Left Title & Icon */}
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-[#1E3A1E] text-white flex items-center justify-center shadow-xs shrink-0">
                {/* Reports & Analytics Graph Icon */}
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <div>
                <h1 className="text-lg font-bold text-slate-800 tracking-tight flex items-center gap-2">
                  Reports & Analytics
                </h1>
                <p className="text-xs text-slate-500">
                  Insights for better inventory and warehouse operations.
                </p>
              </div>
            </div>

            {/* Right Breadcrumbs & Date Filter Action */}
            <div className="flex flex-wrap items-center gap-3">
              <div className="text-[11px] text-slate-400 font-medium hidden md:block">
                <span>Home</span>
                <span className="mx-1.5">›</span>
                <span className="text-slate-600 font-semibold">Reports & Analytics</span>
              </div>

              <div className="flex items-center gap-2">
                <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 text-xs text-slate-700">
                  <svg className="w-3.5 h-3.5 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  <span className="font-medium">{dateRange}</span>
                </div>
                <button
                  type="button"
                  onClick={() => triggerToast(`Date range applied: ${dateRange}`)}
                  className="px-4 py-1.5 rounded-lg bg-[#1E3A1E] hover:bg-[#2a4e2a] text-white text-xs font-semibold shadow-xs transition-colors"
                >
                  Apply
                </button>
              </div>
            </div>
        </div>

        {/* 6 KPI Stat Cards (Single Row - 6 Columns) */}
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

        {/* Filter Toolbar Container */}
        <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs mb-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 items-end">
            {/* Report Type */}
            <div>
              <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                Report Type
              </label>
              <select
                value={reportType}
                onChange={(e) => setReportType(e.target.value)}
                className="w-full text-xs bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-2 text-slate-700 focus:outline-none focus:ring-1 focus:ring-[#1E3A1E]"
              >
                <option>All Reports</option>
                <option>Stock Summary</option>
                <option>Goods Receiving (GRN)</option>
                <option>Issue / Dispatch</option>
                <option>Damage & Rejection</option>
                <option>Valuation Report</option>
              </select>
            </div>

            {/* Product Category */}
            <div>
              <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                Product Category
              </label>
              <select
                value={productCategory}
                onChange={(e) => setProductCategory(e.target.value)}
                className="w-full text-xs bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-2 text-slate-700 focus:outline-none focus:ring-1 focus:ring-[#1E3A1E]"
              >
                <option>All Categories</option>
                <option>Ammunition</option>
                <option>Medical</option>
                <option>Combat Gear</option>
                <option>Spare Parts</option>
                <option>Uniform & Textile</option>
                <option>Electronics</option>
              </select>
            </div>

            {/* Location */}
            <div>
              <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                Location
              </label>
              <select
                value={selectedLocation}
                onChange={(e) => setSelectedLocation(e.target.value)}
                className="w-full text-xs bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-2 text-slate-700 focus:outline-none focus:ring-1 focus:ring-[#1E3A1E]"
              >
                <option>All Locations</option>
                <option>A1-R1-B1</option>
                <option>B1-R2-B3</option>
                <option>C1-R1-B2</option>
                <option>Z1-R1-B1</option>
                <option>A2-R3-B1</option>
                <option>C3-R2-B1</option>
              </select>
            </div>

            {/* Date Range */}
            <div>
              <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                Date Range
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={dateRange}
                  onChange={(e) => setDateRange(e.target.value)}
                  className="w-full text-xs bg-slate-50 border border-slate-200 rounded-lg pl-8 pr-2.5 py-2 text-slate-700 focus:outline-none focus:ring-1 focus:ring-[#1E3A1E]"
                />
                <svg className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
            </div>

            {/* Group By */}
            <div>
              <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                Group By
              </label>
              <select
                value={groupBy}
                onChange={(e) => setGroupBy(e.target.value)}
                className="w-full text-xs bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-2 text-slate-700 focus:outline-none focus:ring-1 focus:ring-[#1E3A1E]"
              >
                <option>Daily</option>
                <option>Weekly</option>
                <option>Monthly</option>
                <option>Quarterly</option>
              </select>
            </div>

            {/* Generate Report Button */}
            <div>
              <button
                type="button"
                onClick={() => {
                  triggerToast('Generating analytical depot report with selected filters...')
                  setShowPreviewModal({
                    title: 'Consolidated Warehouse Inventory Report',
                    date: dateRange,
                    category: productCategory,
                    location: selectedLocation,
                  })
                }}
                className="w-full py-2 px-4 rounded-lg bg-[#1E3A1E] hover:bg-[#2a4e2a] text-white text-xs font-semibold shadow-xs transition-colors flex items-center justify-center gap-2"
              >
                <span>Generate Report</span>
              </button>
            </div>
          </div>
        </div>

        {/* Row 1: 3 Graphical Visualizations */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 mb-4">
          {/* Card 1: Stock Movement Trend (Span 5) */}
          <div className="lg:col-span-5 bg-white rounded-xl border border-slate-200 p-4 shadow-xs flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-[#1E3A1E]" />
                  <h3 className="text-xs font-bold text-slate-800">
                    Stock Movement Trend
                  </h3>
                </div>
              </div>

              {/* Legends Row */}
              <div className="flex flex-wrap items-center gap-3 text-[10px] text-slate-600 mb-3">
                <div className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-[#1E40AF]" />
                  <span>Goods Received</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-[#0D9488]" />
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

            {/* SVG Multi-Line Chart */}
            <div className="relative w-full h-56 pt-2">
              <svg className="w-full h-full overflow-visible" viewBox="0 0 500 220">
                {/* Horizontal Grid lines and Y labels */}
                {[300, 250, 200, 150, 100, 50, 0].map((val) => {
                  const y = getY(val)
                  return (
                    <g key={val}>
                      <text x="10" y={y + 3} fill="#94A3B8" fontSize="9" fontWeight="500">
                        {val}
                      </text>
                      <line
                        x1="45"
                        y1={y}
                        x2="480"
                        y2={y}
                        stroke="#F1F5F9"
                        strokeDasharray={val === 0 ? '0' : '3 3'}
                        strokeWidth="1"
                      />
                    </g>
                  )
                })}

                {/* X Labels */}
                {movementDays.map((day, idx) => {
                  const x = getX(idx)
                  return (
                    <text
                      key={day}
                      x={x}
                      y="210"
                      textAnchor="middle"
                      fill="#64748B"
                      fontSize="9.5"
                      fontWeight="500"
                    >
                      {day}
                    </text>
                  )
                })}

                {/* Line 1: Goods Received (Blue) */}
                <path
                  d={makeLinePath(goodsReceivedLine)}
                  fill="none"
                  stroke="#1E40AF"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                {goodsReceivedLine.map((val, idx) => (
                  <circle
                    key={idx}
                    cx={getX(idx)}
                    cy={getY(val)}
                    r="3.5"
                    fill="#1E40AF"
                    stroke="#ffffff"
                    strokeWidth="1.5"
                    className="hover:r-5 transition-all cursor-pointer"
                  >
                    <title>{`Goods Received: ${val} units (${movementDays[idx]})`}</title>
                  </circle>
                ))}

                {/* Line 2: Issued / Dispatch (Teal) */}
                <path
                  d={makeLinePath(issuedDispatchLine)}
                  fill="none"
                  stroke="#0D9488"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                {issuedDispatchLine.map((val, idx) => (
                  <circle
                    key={idx}
                    cx={getX(idx)}
                    cy={getY(val)}
                    r="3.5"
                    fill="#0D9488"
                    stroke="#ffffff"
                    strokeWidth="1.5"
                    className="hover:r-5 transition-all cursor-pointer"
                  >
                    <title>{`Issued: ${val} units (${movementDays[idx]})`}</title>
                  </circle>
                ))}

                {/* Line 3: Adjustment (Amber) */}
                <path
                  d={makeLinePath(adjustmentLine)}
                  fill="none"
                  stroke="#F59E0B"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                {adjustmentLine.map((val, idx) => (
                  <circle
                    key={idx}
                    cx={getX(idx)}
                    cy={getY(val)}
                    r="3"
                    fill="#F59E0B"
                    stroke="#ffffff"
                    strokeWidth="1.5"
                    className="hover:r-5 transition-all cursor-pointer"
                  >
                    <title>{`Adjustment: ${val} units (${movementDays[idx]})`}</title>
                  </circle>
                ))}

                {/* Line 4: Damage / Rejection (Red) */}
                <path
                  d={makeLinePath(damageRejectionLine)}
                  fill="none"
                  stroke="#EF4444"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                {damageRejectionLine.map((val, idx) => (
                  <circle
                    key={idx}
                    cx={getX(idx)}
                    cy={getY(val)}
                    r="3"
                    fill="#EF4444"
                    stroke="#ffffff"
                    strokeWidth="1.5"
                    className="hover:r-5 transition-all cursor-pointer"
                  >
                    <title>{`Damage/Rejected: ${val} units (${movementDays[idx]})`}</title>
                  </circle>
                ))}
              </svg>
            </div>
          </div>

          {/* Card 2: Category Wise Stock Distribution (Span 4) */}
          <div className="lg:col-span-4 bg-white rounded-xl border border-slate-200 p-4 shadow-xs flex flex-col">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-2.5 h-2.5 rounded-full bg-[#1E3A1E]" />
              <h3 className="text-xs font-bold text-slate-800">
                Category Wise Stock Distribution
              </h3>
            </div>

            <div className="flex-1 flex items-center justify-center my-auto py-2">
              <div className="grid grid-cols-12 gap-3 items-center w-full">
                {/* Donut Chart with Center Text (Span 6) */}
                <div className="col-span-6 relative flex items-center justify-center">
                  <svg className="w-44 h-44 xl:w-48 xl:h-48 -rotate-90" viewBox="0 0 100 100">
                    {/* Outer segments using stroke-dasharray */}
                    <circle cx="50" cy="50" r="38" fill="transparent" stroke="#2563EB" strokeWidth="15" strokeDasharray="67 172" strokeDashoffset="0" />
                    <circle cx="50" cy="50" r="38" fill="transparent" stroke="#06B6D4" strokeWidth="15" strokeDasharray="43 196" strokeDashoffset="-67" />
                    <circle cx="50" cy="50" r="38" fill="transparent" stroke="#10B981" strokeWidth="15" strokeDasharray="36 203" strokeDashoffset="-110" />
                    <circle cx="50" cy="50" r="38" fill="transparent" stroke="#F97316" strokeWidth="15" strokeDasharray="29 210" strokeDashoffset="-146" />
                    <circle cx="50" cy="50" r="38" fill="transparent" stroke="#EF4444" strokeWidth="15" strokeDasharray="24 215" strokeDashoffset="-175" />
                    <circle cx="50" cy="50" r="38" fill="transparent" stroke="#8B5CF6" strokeWidth="15" strokeDasharray="19 220" strokeDashoffset="-199" />
                    <circle cx="50" cy="50" r="38" fill="transparent" stroke="#64748B" strokeWidth="15" strokeDasharray="22 217" strokeDashoffset="-218" />
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
                <div className="col-span-6 space-y-2">
                  {categories.map((cat) => (
                    <div key={cat.name} className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2 truncate">
                        <span className={`w-2.5 h-2.5 rounded-xs ${cat.bg} shrink-0`} />
                        <span className="text-slate-600 truncate font-medium">{cat.name}</span>
                      </div>
                      <div className="text-right pl-2 shrink-0">
                        <span className="font-bold text-slate-800">{cat.pct}</span>{' '}
                        <span className="text-slate-400 text-[10px]">({cat.count})</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Card 3: Location Wise Stock (Span 3) */}
          <div className="lg:col-span-3 bg-white rounded-xl border border-slate-200 p-4 shadow-xs flex flex-col justify-between">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-2 h-2 rounded-full bg-[#1E3A1E]" />
              <h3 className="text-xs font-bold text-slate-800">
                Location Wise Stock
              </h3>
            </div>

            <div className="space-y-2.5">
              {locations.map((loc) => {
                const widthPct = Math.round((loc.count / loc.max) * 100)
                return (
                  <div key={loc.loc} className="text-xs">
                    <div className="flex items-center justify-between text-[11px] mb-1 font-medium">
                      <span className="text-slate-700 font-semibold">{loc.loc}</span>
                      <span className="text-slate-800 font-bold">{loc.count.toLocaleString()}</span>
                    </div>
                    <div className="w-full h-2 rounded-full bg-slate-100 overflow-hidden">
                      <div
                        className={`h-full rounded-full ${loc.color} transition-all duration-500`}
                        style={{ width: `${widthPct}%` }}
                      />
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </div>

        {/* Row 2: Tables & Quick Reports (3 Columns) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 mb-4">
          {/* Column 1: Top 10 Products by Stock Value (Span 5) */}
          <div className="lg:col-span-5 bg-white rounded-xl border border-slate-200 p-4 shadow-xs">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-[#1E3A1E]" />
                <h3 className="text-xs font-bold text-slate-800">
                  Top 10 Products by Stock Value
                </h3>
              </div>
            </div>

            <div className="overflow-x-auto no-scrollbar">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-100 text-[10px] uppercase font-bold text-slate-400">
                    <th className="pb-2 w-6 text-center">#</th>
                    <th className="pb-2">Product Name</th>
                    <th className="pb-2">SKU</th>
                    <th className="pb-2 text-right">Quantity</th>
                    <th className="pb-2 text-right">Unit Price</th>
                    <th className="pb-2 text-right">Total Value</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-xs">
                  {topProducts.map((p) => (
                    <tr key={p.rank} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-2 text-center">
                        <span
                          className={`inline-flex items-center justify-center w-4 h-4 rounded-full text-[10px] font-bold ${
                            p.rank === 1
                              ? 'bg-amber-100 text-amber-800'
                              : p.rank === 2
                              ? 'bg-blue-100 text-blue-800'
                              : p.rank === 3
                              ? 'bg-orange-100 text-orange-800'
                              : 'bg-slate-100 text-slate-500'
                          }`}
                        >
                          {p.rank}
                        </span>
                      </td>
                      <td className="py-2 font-medium text-slate-800 truncate max-w-[140px]">
                        {p.name}
                      </td>
                      <td className="py-2 text-slate-500 text-[11px] font-mono">
                        {p.sku}
                      </td>
                      <td className="py-2 text-right text-slate-700 font-medium">
                        {p.qty}
                      </td>
                      <td className="py-2 text-right text-slate-500 text-[11px]">
                        {p.unitPrice}
                      </td>
                      <td className="py-2 text-right font-bold text-slate-800">
                        {p.totalValue}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Column 2: Transaction Summary (Span 4) */}
          <div className="lg:col-span-4 bg-white rounded-xl border border-slate-200 p-4 shadow-xs">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-[#1E3A1E]" />
                <h3 className="text-xs font-bold text-slate-800">
                  Transaction Summary
                </h3>
              </div>
            </div>

            <div className="overflow-x-auto no-scrollbar">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-100 text-[10px] uppercase font-bold text-slate-400">
                    <th className="pb-2">Transaction Type</th>
                    <th className="pb-2 text-right">Count</th>
                    <th className="pb-2 text-right">Quantity</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-xs">
                  {transactionSummary.map((t) => (
                    <tr key={t.type} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-2.5 flex items-center gap-2 font-medium text-slate-700">
                        <span className={`w-2.5 h-2.5 rounded-xs ${t.color} shrink-0`} />
                        <span className="truncate">{t.type}</span>
                      </td>
                      <td className="py-2.5 text-right font-semibold text-slate-800">
                        {t.count}
                      </td>
                      <td className="py-2.5 text-right font-bold text-slate-800">
                        {t.qty}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Column 3: Quick Reports (Span 3) */}
          <div className="lg:col-span-3 bg-white rounded-xl border border-slate-200 p-4 shadow-xs flex flex-col justify-between">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-[#1E3A1E]" />
                <h3 className="text-xs font-bold text-slate-800">
                  Quick Reports
                </h3>
              </div>
            </div>

            <div className="space-y-1 divide-y divide-slate-100">
              {quickReports.map((qr) => (
                <button
                  key={qr.id}
                  type="button"
                  onClick={() => {
                    setSelectedQuickReport(qr)
                    triggerToast(`Opening ${qr.title}...`)
                  }}
                  className="w-full flex items-center justify-between py-1.5 px-2 hover:bg-slate-50 rounded-lg text-left transition-colors group"
                >
                  <div className="flex items-center gap-2 truncate">
                    <svg
                      className="w-3.5 h-3.5 text-slate-400 group-hover:text-[#1E3A1E] shrink-0"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d={qr.icon} />
                    </svg>
                    <span className="text-xs text-slate-700 group-hover:text-slate-900 font-medium truncate">
                      {qr.title}
                    </span>
                  </div>
                  <span className="text-[10px] text-slate-400 group-hover:text-slate-600">›</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Row 3: Expiry Trend, Low Stock Alert, Export & Print (3 Cards) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
          {/* Card 1: Expiry Trend (Next 6 Months) (Span 4) */}
          <div className="lg:col-span-4 bg-white rounded-xl border border-slate-200 p-4 shadow-xs flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-[#1E3A1E]" />
                  <h3 className="text-xs font-bold text-slate-800">
                    Expiry Trend (Next 6 Months)
                  </h3>
                </div>
              </div>

              {/* Legend */}
              <div className="flex items-center gap-3 text-[10px] text-slate-600 mb-2">
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-xs bg-emerald-600" />
                  <span>Total Items</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-xs bg-rose-600" />
                  <span>High Risk (≤ 30 days)</span>
                </div>
              </div>
            </div>

            {/* SVG Dual Bar Chart */}
            <div className="relative w-full h-44 pt-1">
              <svg className="w-full h-full overflow-visible" viewBox="0 0 380 150">
                {/* Horizontal Grid lines */}
                {[300, 200, 100, 0].map((val) => {
                  const y = 120 - (val / 300) * 105
                  return (
                    <g key={val}>
                      <text x="5" y={y + 3} fill="#94A3B8" fontSize="8" fontWeight="500">
                        {val}
                      </text>
                      <line x1="30" y1={y} x2="370" y2={y} stroke="#F1F5F9" strokeWidth="1" />
                    </g>
                  )
                })}

                {/* Bars for 6 Months */}
                {expiryTrend.map((item, idx) => {
                  const groupX = 45 + idx * 54
                  const totalH = (item.total / 300) * 105
                  const riskH = (item.highRisk / 300) * 105

                  return (
                    <g key={item.month}>
                      {/* Total Items Bar (Emerald) */}
                      <rect
                        x={groupX}
                        y={120 - totalH}
                        width="11"
                        height={totalH}
                        rx="1.5"
                        fill="#059669"
                        className="hover:opacity-85 transition-opacity cursor-pointer"
                      >
                        <title>{`${item.month} Total: ${item.total}`}</title>
                      </rect>

                      {/* High Risk Bar (Red) */}
                      <rect
                        x={groupX + 13}
                        y={120 - riskH}
                        width="11"
                        height={riskH}
                        rx="1.5"
                        fill="#E11D48"
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

          {/* Card 2: Low Stock Alert (Top 5) (Span 5) */}
          <div className="lg:col-span-5 bg-white rounded-xl border border-slate-200 p-4 shadow-xs">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-rose-500" />
                <h3 className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                  <svg className="w-3.5 h-3.5 text-rose-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                  Low Stock Alert (Top 5)
                </h3>
              </div>
            </div>

            <div className="overflow-x-auto no-scrollbar">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-100 text-[10px] uppercase font-bold text-slate-400">
                    <th className="pb-2 w-6 text-center">#</th>
                    <th className="pb-2">Product Name</th>
                    <th className="pb-2">SKU</th>
                    <th className="pb-2 text-right">Current Stock</th>
                    <th className="pb-2 text-right">Reorder Level</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-xs">
                  {lowStock.map((item) => (
                    <tr key={item.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-2 text-center text-slate-500 text-[11px]">
                        {item.id}
                      </td>
                      <td className="py-2 font-medium text-slate-800 truncate">
                        {item.name}
                      </td>
                      <td className="py-2 text-slate-500 text-[11px] font-mono">
                        {item.sku}
                      </td>
                      <td className="py-2 text-right font-bold text-rose-600">
                        {item.current}
                      </td>
                      <td className="py-2 text-right text-slate-600 font-medium">
                        {item.reorder}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Card 3: Export & Print (Span 3) */}
          <div className="lg:col-span-3 bg-white rounded-xl border border-slate-200 p-4 shadow-xs flex flex-col justify-between">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-2 h-2 rounded-full bg-[#1E3A1E]" />
              <h3 className="text-xs font-bold text-slate-800">
                Export & Print
              </h3>
            </div>

            <div className="grid grid-cols-2 gap-2.5">
              {/* Export to Excel */}
              <button
                type="button"
                onClick={() => triggerToast('Exporting Report to Excel (.xlsx)... Download started.')}
                className="flex items-center gap-2 p-2.5 rounded-lg border border-slate-200 hover:border-emerald-500 hover:bg-emerald-50/40 text-slate-700 text-left transition-all group"
              >
                <div className="w-7 h-7 rounded-md bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <div>
                  <div className="text-[11px] font-bold text-slate-800 group-hover:text-emerald-800">
                    Export to Excel
                  </div>
                </div>
              </button>

              {/* Export to PDF */}
              <button
                type="button"
                onClick={() => {
                  triggerToast('Generating High-Resolution Classified PDF Report...')
                  setShowPreviewModal({
                    title: 'Executive Ordnance Summary Report',
                    date: dateRange,
                    category: productCategory,
                    location: selectedLocation,
                  })
                }}
                className="flex items-center gap-2 p-2.5 rounded-lg border border-slate-200 hover:border-rose-500 hover:bg-rose-50/40 text-slate-700 text-left transition-all group"
              >
                <div className="w-7 h-7 rounded-md bg-rose-100 text-rose-700 flex items-center justify-center shrink-0">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                  </svg>
                </div>
                <div>
                  <div className="text-[11px] font-bold text-slate-800 group-hover:text-rose-800">
                    Export to PDF
                  </div>
                </div>
              </button>

              {/* Schedule Report */}
              <button
                type="button"
                onClick={() => setShowScheduleModal(true)}
                className="flex items-center gap-2 p-2.5 rounded-lg border border-slate-200 hover:border-purple-500 hover:bg-purple-50/40 text-slate-700 text-left transition-all group"
              >
                <div className="w-7 h-7 rounded-md bg-purple-100 text-purple-700 flex items-center justify-center shrink-0">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div>
                  <div className="text-[11px] font-bold text-slate-800 group-hover:text-purple-800">
                    Schedule Report
                  </div>
                </div>
              </button>

              {/* Print Report */}
              <button
                type="button"
                onClick={() => window.print()}
                className="flex items-center gap-2 p-2.5 rounded-lg border border-slate-200 hover:border-slate-500 hover:bg-slate-50 text-slate-700 text-left transition-all group"
              >
                <div className="w-7 h-7 rounded-md bg-slate-100 text-slate-700 flex items-center justify-center shrink-0">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
                  </svg>
                </div>
                <div>
                  <div className="text-[11px] font-bold text-slate-800 group-hover:text-slate-900">
                    Print Report
                  </div>
                </div>
              </button>
            </div>
          </div>
        </div>

      {/* MODAL 1: Schedule Report Modal */}
      {showScheduleModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-md w-full overflow-hidden animate-scale-up">
            <div className="bg-[#1E3A1E] px-5 py-4 text-white flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <Clock className="w-4 h-4 text-amber-400" />
                <h3 className="text-sm font-bold tracking-wide">
                  Schedule Automated Report Dispatch
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setShowScheduleModal(false)}
                className="text-white/70 hover:text-white p-1"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-5 space-y-3.5 text-xs">
              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                  Report Title
                </label>
                <input
                  type="text"
                  value={scheduleConfig.reportName}
                  onChange={(e) => setScheduleConfig({ ...scheduleConfig, reportName: e.target.value })}
                  className="w-full border border-slate-200 rounded-lg px-3 py-2 text-slate-800 font-medium"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                    Frequency
                  </label>
                  <select
                    value={scheduleConfig.frequency}
                    onChange={(e) => setScheduleConfig({ ...scheduleConfig, frequency: e.target.value })}
                    className="w-full border border-slate-200 rounded-lg px-2.5 py-2 text-slate-800"
                  >
                    <option>Daily (08:00 IST)</option>
                    <option>Weekly (Monday 06:00 IST)</option>
                    <option>Fortnightly</option>
                    <option>Monthly (1st Day)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                    Format
                  </label>
                  <select
                    value={scheduleConfig.format}
                    onChange={(e) => setScheduleConfig({ ...scheduleConfig, format: e.target.value })}
                    className="w-full border border-slate-200 rounded-lg px-2.5 py-2 text-slate-800"
                  >
                    <option>PDF & Excel (.xlsx)</option>
                    <option>Encrypted PDF Only</option>
                    <option>Excel Only</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                  Designated Officer Recipient(s)
                </label>
                <input
                  type="text"
                  value={scheduleConfig.recipients}
                  onChange={(e) => setScheduleConfig({ ...scheduleConfig, recipients: e.target.value })}
                  className="w-full border border-slate-200 rounded-lg px-3 py-2 text-slate-800"
                />
                <p className="text-[10px] text-slate-400 mt-0.5">
                  Delivered via secured Army Intranet WAN relay.
                </p>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                  Security Classification
                </label>
                <div className="px-3 py-2 rounded-lg bg-amber-50 border border-amber-200 text-amber-800 font-mono font-bold text-[11px]">
                  {scheduleConfig.classification}
                </div>
              </div>

              <div className="pt-3 flex items-center justify-end gap-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowScheduleModal(false)}
                  className="px-4 py-2 rounded-lg border border-slate-200 text-slate-600 font-semibold hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowScheduleModal(false)
                    triggerToast('Automated schedule saved! Dispatches configured successfully.')
                  }}
                  className="px-5 py-2 rounded-lg bg-[#1E3A1E] text-white font-semibold hover:bg-[#2a4e2a]"
                >
                  Confirm & Schedule
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 2: Full Military Report Preview Modal */}
      {showPreviewModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto animate-scale-up">
            {/* Army Top Ribbon */}
            <div className="bg-[#1E3A1E] p-4 text-white flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-amber-400/20 border border-amber-400/40 flex items-center justify-center">
                  <Shield className="w-4 h-4 text-amber-400" />
                </div>
                <div>
                  <h3 className="text-sm font-bold tracking-wide uppercase">
                    CENTRAL WAREHOUSE LOGISTICS
                  </h3>
                  <p className="text-[10px] text-emerald-300">
                    FMCG INVENTORY &amp; LOGISTICS AUDIT SYSTEM
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowPreviewModal(null)}
                className="text-white/70 hover:text-white p-1"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-6 space-y-4 text-xs">
              <div className="text-center pb-3 border-b border-slate-200">
                <h2 className="text-base font-extrabold text-slate-800 uppercase tracking-tight">
                  {showPreviewModal.title}
                </h2>
                <p className="text-slate-500 text-[11px] mt-0.5">
                  Reporting Horizon: {showPreviewModal.date} | Category: {showPreviewModal.category}
                </p>
              </div>

              {/* Summary Metrics */}
              <div className="grid grid-cols-4 gap-3 bg-slate-50 p-3 rounded-xl border border-slate-200 text-center">
                <div>
                  <div className="text-[10px] text-slate-400 uppercase">Total Valuation</div>
                  <div className="text-sm font-extrabold text-slate-800 mt-0.5">₹ 12.48 Cr</div>
                </div>
                <div>
                  <div className="text-[10px] text-slate-400 uppercase">Total Active SKUs</div>
                  <div className="text-sm font-extrabold text-emerald-700 mt-0.5">5,842 Items</div>
                </div>
                <div>
                  <div className="text-[10px] text-slate-400 uppercase">Received / Inward</div>
                  <div className="text-sm font-extrabold text-blue-700 mt-0.5">1,240 Units</div>
                </div>
                <div>
                  <div className="text-[10px] text-slate-400 uppercase">Dispatched Out</div>
                  <div className="text-sm font-extrabold text-purple-700 mt-0.5">980 Units</div>
                </div>
              </div>

              {/* Top Products In Report */}
              <div>
                <h4 className="font-bold text-slate-800 mb-2">High-Valuation Inventory Snapshot</h4>
                <div className="border border-slate-200 rounded-lg overflow-hidden">
                  <table className="w-full text-left text-[11px]">
                    <thead className="bg-slate-100 text-slate-600 font-semibold">
                      <tr>
                        <th className="p-2">Item Name</th>
                        <th className="p-2">SKU</th>
                        <th className="p-2 text-right">In Stock</th>
                        <th className="p-2 text-right">Unit Price</th>
                        <th className="p-2 text-right">Value</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {topProducts.slice(0, 5).map((p) => (
                        <tr key={p.rank}>
                          <td className="p-2 font-medium text-slate-800">{p.name}</td>
                          <td className="p-2 text-slate-500 font-mono">{p.sku}</td>
                          <td className="p-2 text-right font-medium">{p.qty}</td>
                          <td className="p-2 text-right text-slate-600">{p.unitPrice}</td>
                          <td className="p-2 text-right font-bold text-slate-800">{p.totalValue}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Signatures */}
              <div className="grid grid-cols-2 gap-8 pt-6 border-t border-slate-200">
                <div>
                  <div className="text-[10px] text-slate-400">PREPARED BY:</div>
                  <div className="font-bold text-slate-800 mt-1">Capt. N. K. Roy</div>
                  <div className="text-[10px] text-slate-500">Depot Data Officer // COD</div>
                </div>
                <div className="text-right">
                  <div className="text-[10px] text-slate-400">COUNTERSIGNED & APPROVED:</div>
                  <div className="font-bold text-slate-800 mt-1">Col. A. Sharma</div>
                  <div className="text-[10px] text-slate-500">Commanding Officer // Provision Wing</div>
                </div>
              </div>

              <div className="pt-4 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowPreviewModal(null)}
                  className="px-4 py-2 rounded-lg border border-slate-200 text-slate-600 font-semibold hover:bg-slate-50"
                >
                  Close
                </button>
                <button
                  type="button"
                  onClick={() => {
                    window.print()
                    triggerToast('Printing report...')
                  }}
                  className="px-5 py-2 rounded-lg bg-[#1E3A1E] text-white font-semibold hover:bg-[#2a4e2a] flex items-center gap-2"
                >
                  <span>Print Document</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 3: Quick Report Inspection Modal */}
      {selectedQuickReport && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-lg w-full p-5 animate-scale-up">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-[#1E3A1E] text-white flex items-center justify-center">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d={selectedQuickReport.icon} />
                  </svg>
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-800">{selectedQuickReport.title}</h3>
                  <p className="text-[10px] text-slate-400 font-mono">ID: {selectedQuickReport.id}</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setSelectedQuickReport(null)}
                className="text-slate-400 hover:text-slate-700 p-1"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-slate-600 mb-4">
              {selectedQuickReport.desc}
            </p>

            <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 space-y-2 text-xs mb-4">
              <div className="flex justify-between">
                <span className="text-slate-500">Security Access Level:</span>
                <span className="font-semibold text-emerald-700">Authorized (Level 3 - Provision)</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Total Records:</span>
                <span className="font-bold text-slate-800">5,842 Active Data Points</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Last Synced:</span>
                <span className="font-medium text-slate-700">16 Sep 2026, 10:24 IST</span>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setSelectedQuickReport(null)}
                className="px-4 py-2 rounded-lg border border-slate-200 text-slate-600 font-semibold text-xs hover:bg-slate-50"
              >
                Close
              </button>
              <button
                type="button"
                onClick={() => {
                  setSelectedQuickReport(null)
                  triggerToast(`Downloading ${selectedQuickReport.title} (.pdf)...`)
                }}
                className="px-5 py-2 rounded-lg bg-[#1E3A1E] text-white font-semibold text-xs hover:bg-[#2a4e2a]"
              >
                Download Report
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
