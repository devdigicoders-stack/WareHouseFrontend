import { Link } from 'react-router-dom'
import { Truck, Package, QrCode, MapPin, Search, Send, Clock, ArrowRight, Activity } from 'lucide-react'
import { useApp } from '../hooks/useApp'

export default function Dashboard() {
  const { user } = useApp()

  // 6 KPI Metric Cards
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
        <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
        <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
        <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
        <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
        <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
        <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
        </svg>
      ),
    },
  ]

  // 6 Shades Data
  const shades = [
    { id: 1, name: 'Shade 1', category: 'General Goods', occupancy: 80, current: 320, total: 400, color: 'bg-emerald-500' },
    { id: 2, name: 'Shade 2', category: 'Food & Grains', occupancy: 65, current: 260, total: 400, color: 'bg-amber-500' },
    { id: 3, name: 'Shade 3', category: 'Industrial Supplies', occupancy: 90, current: 360, total: 400, color: 'bg-emerald-500' },
    { id: 4, name: 'Shade 4', category: 'Apparel & Uniforms', occupancy: 50, current: 200, total: 400, color: 'bg-amber-500' },
    { id: 5, name: 'Shade 5', category: 'Hardware & Tools', occupancy: 75, current: 300, total: 400, color: 'bg-emerald-500' },
    { id: 6, name: 'Shade 6', category: 'Medical & Pharma', occupancy: 40, current: 160, total: 400, color: 'bg-blue-400' },
  ]

  // Recent Gate Entries
  const gateEntries = [
    { id: 1, time: '16 Sep 2026, 09:12', vehicle: 'UP32 AB 1256', driver: 'Rajesh Yadav', supplier: 'M/s Bharat Supply', type: 'In', status: 'Completed' },
    { id: 2, time: '16 Sep 2026, 08:45', vehicle: 'HR55 CD 7890', driver: 'Sandeep Singh', supplier: 'M/s Prime Foods', type: 'In', status: 'Completed' },
    { id: 3, time: '16 Sep 2026, 08:20', vehicle: 'DL01 EF 4321', driver: 'Imran Khan', supplier: 'M/s Apex Manufacturing', type: 'In', status: 'Completed' },
    { id: 4, time: '16 Sep 2026, 07:55', vehicle: 'UP78 GH 9987', driver: 'Manoj Tiwari', supplier: 'M/s Metro Supplies', type: 'In', status: 'Completed' },
    { id: 5, time: '16 Sep 2026, 07:30', vehicle: 'RJ14 JK 6543', driver: 'Amit Sharma', supplier: 'M/s National Supply', type: 'Out', status: 'Completed' },
  ]

  // Recent GRN Receipts
  const grnReceipts = [
    { id: 1, grn: 'GRN-2026-00125', product: 'Standard Biscuit Packs', batch: 'B102', qty: '600', status: 'Passed', statusColor: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
    { id: 2, grn: 'GRN-2026-00124', product: 'Basmati Rice Special Grade', batch: 'R201', qty: '1,200', status: 'Testing', statusColor: 'bg-blue-50 text-blue-700 border-blue-200' },
    { id: 3, grn: 'GRN-2026-00123', product: 'Refined Mustard Oil', batch: 'O301', qty: '500', status: 'Passed', statusColor: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
    { id: 4, grn: 'GRN-2026-00122', product: 'Chana Dal Super Clean', batch: 'D110', qty: '800', status: 'Pending', statusColor: 'bg-amber-50 text-amber-700 border-amber-200' },
    { id: 5, grn: 'GRN-2026-00121', product: 'Refined Sugar Bulk Pack', batch: 'S450', qty: '900', status: 'Failed', statusColor: 'bg-rose-50 text-rose-700 border-rose-200' },
  ]

  // Expiry Alerts (FEFO Priority)
  const expiryAlerts = [
    { id: 1, product: 'Standard Biscuit Packs', batch: 'B102', location: 'Shade 2 (R2, C4)', qty: '450', unit: 'Packs', date: '25 Sep 2026', days: 9, status: 'Critical FEFO', statusColor: 'bg-rose-50 text-rose-700 border-rose-200', dayColor: 'bg-rose-50 text-rose-700 border-rose-200' },
    { id: 2, product: 'Refined Mustard Oil', batch: 'O301', location: 'Shade 2 (R1, C2)', qty: '320', unit: 'Tins', date: '28 Sep 2026', days: 12, status: 'Near Expiry', statusColor: 'bg-amber-50 text-amber-700 border-amber-200', dayColor: 'bg-amber-50 text-amber-700 border-amber-200' },
    { id: 3, product: 'Basmati Rice Special Grade', batch: 'R201', location: 'Shade 2 (R3, C1)', qty: '650', unit: 'Bags', date: '30 Sep 2026', days: 14, status: 'Near Expiry', statusColor: 'bg-amber-50 text-amber-700 border-amber-200', dayColor: 'bg-amber-50 text-amber-700 border-amber-200' },
    { id: 4, product: 'Chana Dal Super Clean', batch: 'D110', location: 'Shade 2 (R4, C5)', qty: '800', unit: 'Bags', date: '05 Oct 2026', days: 19, status: 'Valid Stock', statusColor: 'bg-emerald-50 text-emerald-700 border-emerald-200', dayColor: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
    { id: 5, product: 'Refined Sugar Bulk Pack', batch: 'S450', location: 'Shade 1 (R5, C3)', qty: '900', unit: 'Bags', date: '10 Oct 2026', days: 24, status: 'Valid Stock', statusColor: 'bg-emerald-50 text-emerald-700 border-emerald-200', dayColor: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
  ]

  // System Audit Stream Logs
  const auditLogs = [
    { id: 1, time: '10:12 AM', category: 'GRN Inward', catColor: 'bg-emerald-50 text-emerald-700 border-emerald-200', desc: 'New GRN logged for Standard Biscuit Packs', ref: 'GRN-2026-00125', location: 'Unloading Bay 2', user: 'Warehouse Manager', status: 'Verified', badge: 'Pass Verified' },
    { id: 2, time: '09:45 AM', category: 'Quality Control', catColor: 'bg-blue-50 text-blue-700 border-blue-200', desc: 'Lab clearance inspection passed for Batch B102', ref: 'Batch B102', location: 'Central QA Lab', user: 'QA Inspector', status: 'Passed', badge: 'QC Passed' },
    { id: 3, time: '09:30 AM', category: 'Stock Put-Away', catColor: 'bg-indigo-50 text-indigo-700 border-indigo-200', desc: 'Stock placed in allocated storage rack slot', ref: 'Slot R5-C7', location: 'Shade 3 Hub', user: 'Inventory Operator', status: 'Stored', badge: 'Slot Confirmed' },
    { id: 4, time: '09:12 AM', category: 'Gate Clearance', catColor: 'bg-amber-50 text-amber-700 border-amber-200', desc: 'Commercial carrier vehicle arrival cleared at main gate', ref: 'UP32 AB 1256', location: 'Gate Post 1', user: 'Gate Security', status: 'Completed', badge: 'Gate Pass Valid' },
    { id: 5, time: '08:50 AM', category: 'Security Access', catColor: 'bg-purple-50 text-purple-700 border-purple-200', desc: 'Authorized management session authenticated via PIN', ref: 'PIN-1947', location: 'Ops Console 01', user: 'Warehouse Manager', status: 'Active', badge: 'Auth Success' },
  ]

  // Quick Actions
  const quickActions = [
    { label: 'New Gate Entry', desc: 'Log incoming vehicle & driver entry', path: '/gate-entry', icon: Truck, badge: 'Inward', color: 'bg-emerald-50 text-emerald-600 border-emerald-100 group-hover:bg-emerald-600 group-hover:text-white' },
    { label: 'Create GRN', desc: 'Receive goods & verify batch math', path: '/grn', icon: Package, badge: 'Receiving', color: 'bg-amber-50 text-amber-600 border-amber-100 group-hover:bg-amber-600 group-hover:text-white' },
    { label: 'Generate QR / Label', desc: 'Print serialized carton barcodes', path: '/label-qr', icon: QrCode, badge: 'Print', color: 'bg-blue-50 text-blue-600 border-blue-100 group-hover:bg-blue-600 group-hover:text-white' },
    { label: 'Put-Away / Check-In', desc: 'Assign shade & rack storage slots', path: '/put-away', icon: MapPin, badge: 'Storage', color: 'bg-indigo-50 text-indigo-600 border-indigo-100 group-hover:bg-indigo-600 group-hover:text-white' },
    { label: 'Stock Search', desc: 'Instant SKU, batch & location lookup', path: '/stock-search', icon: Search, badge: 'Lookup', color: 'bg-purple-50 text-purple-600 border-purple-100 group-hover:bg-purple-600 group-hover:text-white' },
    { label: 'Issue / Dispatch', desc: 'Scan outward QR & gate clearance', path: '/issue-dispatch', icon: Send, badge: 'Outward', color: 'bg-rose-50 text-rose-600 border-rose-100 group-hover:bg-rose-600 group-hover:text-white' },
  ]

  const displayName = (!user?.name || /admin/i.test(user.name)) ? 'Warehouse Manager' : user.name

  return (
    <div className="space-y-6 max-w-[1720px] mx-auto pb-10 select-none">
      
      {/* 1. Welcome Back Banner - Prominent & Clear */}
      <div className="bg-white rounded-2xl p-6 sm:p-7 border border-slate-200 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-5">
        <div>
          <div className="flex items-center gap-2.5 mb-2">
            <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              Warehouse Active
            </span>
            <span className="text-slate-300">|</span>
            <span className="text-sm text-slate-500 font-medium">
              Central Logistics Hub &bull; Sector 4
            </span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Welcome Back, {displayName}
          </h2>
          <p className="text-sm sm:text-base text-slate-500 mt-1">
            Here is your daily operational summary across all warehouse zones and logistics bays.
          </p>
        </div>

        <div className="hidden sm:flex items-center gap-3 shrink-0">
          <div className="text-right px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200">
            <p className="text-xs uppercase tracking-wider font-bold text-slate-400">Terminal Status</p>
            <p className="text-sm font-extrabold text-emerald-600 font-mono mt-0.5">ONLINE &bull; READY</p>
          </div>
        </div>
      </div>

      {/* 2. Top Stats Row (Proper Balanced Grid: 3 Columns × 2 Rows) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {kpiStats.map((kpi) => (
          <Link
            key={kpi.id}
            to={kpi.path}
            className="group bg-white rounded-2xl p-5 sm:p-6 border border-slate-200 shadow-xs hover:shadow-lg hover:border-indigo-400 transition-all duration-200 cursor-pointer flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between gap-3">
                <div className={`w-12 h-12 rounded-xl ${kpi.color} flex items-center justify-center text-white shadow-md shadow-indigo-950/10 group-hover:scale-105 transition-transform shrink-0`}>
                  {kpi.icon}
                </div>
                {kpi.trend && (
                  <span className={`text-xs font-bold px-3 py-1 rounded-full border ${kpi.trendPositive ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-rose-50 text-rose-700 border-rose-200'}`}>
                    {kpi.trend}
                  </span>
                )}
              </div>

              <div className="mt-4">
                <p className="text-sm font-semibold text-slate-500">
                  {kpi.label}
                </p>
                <p className="text-2xl sm:text-3xl font-extrabold text-slate-900 font-mono tracking-tight mt-1">
                  {kpi.value}
                </p>
              </div>
            </div>

            <div className="mt-4 pt-3.5 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-slate-400 group-hover:text-indigo-600 transition-colors">
              <span>View operational details</span>
              <span className="flex items-center gap-1 group-hover:translate-x-1.5 transition-transform font-bold text-indigo-600">
                Details →
              </span>
            </div>
          </Link>
        ))}
      </div>

      {/* 3. FULL WIDTH Warehouse Location & Shade Storage Overview */}
      <div className="bg-white rounded-2xl p-6 sm:p-7 border border-slate-200 shadow-sm space-y-6">
        
        {/* Header with Title and Legend */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 shrink-0 shadow-xs">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
            </div>
            <div>
              <h3 className="text-lg sm:text-xl font-extrabold text-slate-900 tracking-tight">
                Warehouse Location &amp; Shade Storage Overview
              </h3>
              <p className="text-sm text-slate-500 font-medium mt-0.5">
                Real-time storage space utilization, capacity monitoring &amp; bay allocation across all 6 shades
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-4">
            {/* Legend */}
            <div className="flex items-center gap-3 text-xs sm:text-sm text-slate-600 font-medium bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-200">
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" /> High (≥80%)
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-500" /> Medium (50-79%)
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-blue-500" /> Available (&lt;50%)
              </span>
            </div>

            <Link
              to="/shade-mgmt"
              className="px-4 py-2 rounded-xl bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-sm font-bold transition-all flex items-center gap-1.5 shadow-xs"
            >
              Configure Shades <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>

        {/* Overall Warehouse Capacity Banner */}
        <div className="p-5 sm:p-6 rounded-2xl bg-slate-50/80 border border-slate-200 flex flex-col xl:flex-row xl:items-center justify-between gap-5">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 flex-1">
            <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-2xs">
              <p className="text-xs uppercase font-bold text-slate-400 tracking-wider">Total Capacity</p>
              <p className="text-xl sm:text-2xl font-extrabold font-mono text-slate-900 mt-1 whitespace-nowrap">
                2,400 <span className="text-xs font-semibold text-slate-500 font-sans">Units</span>
              </p>
            </div>
            <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-2xs">
              <p className="text-xs uppercase font-bold text-slate-400 tracking-wider">Total Occupied</p>
              <p className="text-xl sm:text-2xl font-extrabold font-mono text-emerald-700 mt-1 whitespace-nowrap">
                1,600 <span className="text-xs font-semibold text-slate-500 font-sans">Units</span>
              </p>
            </div>
            <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-2xs">
              <p className="text-xs uppercase font-bold text-slate-400 tracking-wider">Available Space</p>
              <p className="text-xl sm:text-2xl font-extrabold font-mono text-blue-700 mt-1 whitespace-nowrap">
                800 <span className="text-xs font-semibold text-slate-500 font-sans">Units</span>
              </p>
            </div>
            <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-2xs">
              <p className="text-xs uppercase font-bold text-slate-400 tracking-wider">Space Utilization</p>
              <p className="text-xl sm:text-2xl font-extrabold font-mono text-indigo-700 mt-1 whitespace-nowrap">
                66.7%
              </p>
            </div>
          </div>

          <div className="w-full xl:w-80 bg-white p-4 rounded-xl border border-slate-200/80 shadow-2xs space-y-2 shrink-0">
            <div className="flex justify-between text-xs font-bold text-slate-700 font-mono">
              <span>OVERALL USAGE</span>
              <span className="text-indigo-600 font-extrabold">1,600 / 2,400 Units</span>
            </div>
            <div className="w-full h-3.5 rounded-full bg-slate-100 overflow-hidden flex shadow-inner">
              <div className="bg-emerald-500 h-full rounded-full transition-all duration-500" style={{ width: '66.7%' }} />
            </div>
            <div className="flex justify-between text-[11px] text-slate-400">
              <span className="text-emerald-600 font-semibold">66.7% Occupied</span>
              <span>33.3% Available</span>
            </div>
          </div>
        </div>

        {/* 6 Shades Grid - Proper 3 Columns × 2 Rows */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6">
          {shades.map((shade) => {
            const isHigh = shade.occupancy >= 80
            const isMed = shade.occupancy >= 50
            const statusColor = isHigh ? 'text-emerald-700 bg-emerald-50 border-emerald-200' : isMed ? 'text-amber-700 bg-amber-50 border-amber-200' : 'text-blue-700 bg-blue-50 border-blue-200'
            const barColor = isHigh ? 'bg-emerald-500' : isMed ? 'bg-amber-500' : 'bg-blue-500'
            const availableUnits = shade.total - shade.current

            return (
              <Link
                key={shade.id}
                to="/shade-mgmt"
                title={`Click to view details for ${shade.name}`}
                className="group flex flex-col justify-between bg-white border-2 border-slate-200 hover:border-indigo-500 rounded-2xl p-5 sm:p-6 transition-all duration-200 shadow-xs hover:shadow-lg cursor-pointer"
              >
                <div>
                  {/* Roof Header */}
                  <div className="flex items-center justify-between gap-3 pb-3.5 border-b border-slate-100">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-slate-900 text-white flex items-center justify-center font-extrabold text-sm font-mono group-hover:bg-indigo-600 transition-colors shadow-xs shrink-0">
                        S{shade.id}
                      </div>
                      <div>
                        <h4 className="text-base font-extrabold text-slate-900 group-hover:text-indigo-600 transition-colors whitespace-nowrap">
                          {shade.name}
                        </h4>
                        <p className="text-xs font-semibold text-slate-500 truncate">
                          {shade.category}
                        </p>
                      </div>
                    </div>
                    <span className={`text-xs font-bold px-3 py-1 rounded-full border shrink-0 ${statusColor}`}>
                      {shade.occupancy}% Full
                    </span>
                  </div>

                  {/* Visual Pallet Grid */}
                  <div className="my-4 p-3 bg-slate-50 border border-slate-200/80 rounded-xl">
                    <div className="flex justify-between text-[11px] font-semibold text-slate-400 mb-2 uppercase tracking-wider">
                      <span>Rack Layout</span>
                      <span className="font-mono text-slate-600">12 Bays</span>
                    </div>
                    <div className="grid grid-cols-6 gap-2">
                      {Array.from({ length: 12 }).map((_, i) => {
                        const filled =
                          shade.occupancy >= 80 ? i < 10 :
                          shade.occupancy >= 60 ? i < 8 :
                          shade.occupancy >= 50 ? i < 6 : i < 4
                        return (
                          <div
                            key={i}
                            className={`h-4 rounded-xs transition-all ${
                              filled ? barColor : 'bg-slate-200/80'
                            }`}
                            title={`Bay ${i + 1}: ${filled ? 'Occupied' : 'Empty'}`}
                          />
                        )
                      })}
                    </div>
                  </div>

                  {/* Stock Counts & Progress */}
                  <div className="space-y-2">
                    <div className="flex justify-between items-center text-xs">
                      <span className="font-semibold text-slate-500">Stock Units</span>
                      <span className="font-mono font-bold text-slate-900 text-sm whitespace-nowrap">
                        {shade.current} <span className="font-normal text-slate-400">/ {shade.total} Units</span>
                      </span>
                    </div>
                    <div className="w-full h-3 rounded-full bg-slate-100 overflow-hidden shadow-inner">
                      <div className={`h-full rounded-full transition-all duration-300 ${barColor}`} style={{ width: `${shade.occupancy}%` }} />
                    </div>
                    <div className="flex justify-between text-[11px] font-medium text-slate-400 pt-0.5">
                      <span>Available: <strong className="text-slate-700 font-mono">{availableUnits} Units</strong></span>
                      <span className="font-semibold">{shade.occupancy >= 80 ? 'Near Capacity' : shade.occupancy >= 50 ? 'Optimal' : 'Plenty Space'}</span>
                    </div>
                  </div>
                </div>

                <div className="mt-4 pt-3.5 border-t border-slate-100 flex items-center justify-between text-xs sm:text-sm font-bold text-indigo-600 group-hover:text-indigo-800">
                  <span>Inspect {shade.name} Bays</span>
                  <span className="group-hover:translate-x-1.5 transition-transform text-base">→</span>
                </div>
              </Link>
            )
          })}
        </div>
      </div>

      {/* 4. Quick Actions (Proper 3 Columns × 2 Rows Grid) */}
      <div className="bg-white rounded-2xl p-6 sm:p-7 border border-slate-200 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100 mb-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-50 border border-amber-100 flex items-center justify-center text-amber-600 font-bold text-lg shadow-xs">
              ⚡
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-extrabold text-slate-900">
                Quick Operational Actions
              </h3>
              <p className="text-xs sm:text-sm text-slate-500 font-medium">
                Instant 1-click access to critical warehouse operational workflows
              </p>
            </div>
          </div>
          <span className="text-xs font-mono font-bold text-slate-500 bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-200 self-start sm:self-auto">
            1-Click Launchers
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {quickActions.map((action) => (
            <Link
              key={action.label}
              to={action.path}
              className="bg-white hover:bg-slate-50/80 border-2 border-slate-200 hover:border-indigo-500 rounded-2xl p-5 flex items-center justify-between gap-4 transition-all duration-200 group shadow-xs hover:shadow-lg cursor-pointer"
            >
              <div className="flex items-center gap-4 min-w-0">
                <div className={`w-13 h-13 rounded-2xl border flex items-center justify-center transition-all duration-200 shadow-xs shrink-0 ${action.color}`}>
                  <action.icon className="w-6 h-6" />
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <h4 className="text-base font-extrabold text-slate-900 group-hover:text-indigo-600 transition-colors truncate">
                      {action.label}
                    </h4>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 group-hover:bg-indigo-100 group-hover:text-indigo-800 transition-colors shrink-0">
                      {action.badge}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 mt-1 truncate">
                    {action.desc}
                  </p>
                </div>
              </div>

              <div className="w-9 h-9 rounded-xl bg-slate-100 group-hover:bg-indigo-600 text-slate-400 group-hover:text-white flex items-center justify-center transition-all shrink-0">
                <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* 5. Full-Width Table 1: Recent Gate Entries */}
      <div className="w-full bg-white rounded-2xl p-6 sm:p-7 border border-slate-200 shadow-sm space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
          <div className="flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 shrink-0 shadow-xs">
              <Truck className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-3 flex-wrap">
                <h3 className="text-lg sm:text-xl font-bold text-slate-900">
                  Recent Gate Entries
                </h3>
                <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                  ● Live Gatefeed
                </span>
                <span className="text-xs font-medium text-slate-400">
                  (5 Entries Today)
                </span>
              </div>
              <p className="text-xs sm:text-sm text-slate-500 font-medium mt-1">
                Real-time inward and outward vehicle gate clearance &amp; movement log
              </p>
            </div>
          </div>

          <Link
            to="/gate-entry"
            className="px-4 py-2 rounded-xl bg-slate-50 hover:bg-indigo-600 text-slate-700 hover:text-white border border-slate-200 hover:border-indigo-600 text-sm font-bold transition-all flex items-center gap-2 shadow-xs self-start sm:self-auto group"
          >
            <span>View All Gate Entries</span>
            <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-white group-hover:translate-x-0.5 transition-all" />
          </Link>
        </div>

        <div className="overflow-x-auto rounded-xl border border-slate-100">
          <table className="w-full text-left text-sm min-w-[760px]">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50/70 text-slate-600 text-xs uppercase tracking-wider font-bold">
                <th className="py-4 px-4 w-14 text-center">#</th>
                <th className="py-4 px-4">Date &amp; Time</th>
                <th className="py-4 px-4">Vehicle No.</th>
                <th className="py-4 px-4">Driver Name</th>
                <th className="py-4 px-4">Supplier / Contracting Party</th>
                <th className="py-4 px-4 text-center">Direction</th>
                <th className="py-4 px-4 text-center">Status</th>
                <th className="py-4 px-5 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 bg-white">
              {gateEntries.map((row) => (
                <tr key={row.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="py-4 px-4 text-slate-400 font-mono text-xs text-center w-14 font-semibold">
                    0{row.id}
                  </td>
                  <td className="py-4 px-4">
                    <span className="text-sm font-medium text-slate-700">{row.time}</span>
                  </td>
                  <td className="py-4 px-4">
                    <span className="text-xs font-mono font-bold text-slate-800 bg-slate-100 border border-slate-200/90 px-3 py-1.5 rounded-lg inline-block tracking-wide shadow-2xs">
                      {row.vehicle}
                    </span>
                  </td>
                  <td className="py-4 px-4 text-slate-900 font-bold text-sm">
                    {row.driver}
                  </td>
                  <td className="py-4 px-4 text-slate-600 font-medium text-sm">
                    {row.supplier}
                  </td>
                  <td className="py-4 px-4 text-center">
                    <span className={`text-xs font-bold px-3 py-1 rounded-full inline-flex items-center gap-1 ${row.type === 'In' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-blue-50 text-blue-700 border border-blue-200'}`}>
                      {row.type === 'In' ? '↓ Inward' : '↑ Outward'}
                    </span>
                  </td>
                  <td className="py-4 px-4 text-center">
                    <span className="text-xs font-semibold px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 inline-flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                      {row.status}
                    </span>
                  </td>
                  <td className="py-4 px-5 text-right">
                    <Link
                      to="/gate-pass"
                      className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-indigo-50 hover:bg-indigo-600 text-indigo-700 hover:text-white border border-indigo-100 hover:border-indigo-600 text-xs font-bold transition-all shadow-2xs"
                    >
                      <span>Gate Pass</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* 6. Full-Width Table 2: Recent GRN Receipts */}
      <div className="w-full bg-white rounded-2xl p-6 sm:p-7 border border-slate-200 shadow-sm space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
          <div className="flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-xl bg-amber-50 border border-amber-100 flex items-center justify-center text-amber-600 shrink-0 shadow-xs">
              <Package className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-3 flex-wrap">
                <h3 className="text-lg sm:text-xl font-bold text-slate-900">
                  Recent GRN Receipts
                </h3>
                <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200">
                  28 Today
                </span>
                <span className="text-xs font-medium text-slate-400">
                  (Goods Receiving Notes)
                </span>
              </div>
              <p className="text-xs sm:text-sm text-slate-500 font-medium mt-1">
                Consignments cleared at unloading bays with batch &amp; quantity calculations
              </p>
            </div>
          </div>

          <Link
            to="/grn"
            className="px-4 py-2 rounded-xl bg-slate-50 hover:bg-amber-600 text-slate-700 hover:text-white border border-slate-200 hover:border-amber-600 text-sm font-bold transition-all flex items-center gap-2 shadow-xs self-start sm:self-auto group"
          >
            <span>View All GRN Receipts</span>
            <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-white group-hover:translate-x-0.5 transition-all" />
          </Link>
        </div>

        <div className="overflow-x-auto rounded-xl border border-slate-100">
          <table className="w-full text-left text-sm min-w-[760px]">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50/70 text-slate-600 text-xs uppercase tracking-wider font-bold">
                <th className="py-4 px-4 w-14 text-center">#</th>
                <th className="py-4 px-4">GRN No.</th>
                <th className="py-4 px-4">Product Name</th>
                <th className="py-4 px-4">Batch No.</th>
                <th className="py-4 px-4 text-right">Received Qty</th>
                <th className="py-4 px-4 text-center">Lab Quality Status</th>
                <th className="py-4 px-5 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 bg-white">
              {grnReceipts.map((row) => (
                <tr key={row.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="py-4 px-4 text-slate-400 font-mono text-xs text-center w-14 font-semibold">
                    0{row.id}
                  </td>
                  <td className="py-4 px-4">
                    <span className="font-mono font-bold text-slate-900 text-xs bg-slate-100 px-2.5 py-1.5 rounded-lg border border-slate-200 inline-block tracking-wide shadow-2xs">
                      {row.grn}
                    </span>
                  </td>
                  <td className="py-4 px-4 text-slate-900 font-bold text-sm">
                    {row.product}
                  </td>
                  <td className="py-4 px-4">
                    <span className="font-mono text-slate-700 text-xs font-bold bg-slate-100 px-2.5 py-1 rounded-md border border-slate-200 inline-block">
                      {row.batch}
                    </span>
                  </td>
                  <td className="py-4 px-4 text-right font-mono font-bold text-slate-900 text-sm">
                    {row.qty} <span className="font-normal text-xs text-slate-500">Units</span>
                  </td>
                  <td className="py-4 px-4 text-center">
                    <span className={`text-xs font-bold px-3 py-1 rounded-full border inline-flex items-center gap-1 ${row.statusColor}`}>
                      {row.status === 'Passed' && '✓ Passed'}
                      {row.status === 'Testing' && '⏳ Testing'}
                      {row.status === 'Pending' && '● Pending'}
                      {row.status === 'Failed' && '✕ Failed'}
                    </span>
                  </td>
                  <td className="py-4 px-5 text-right">
                    <Link
                      to="/put-away"
                      className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-amber-50 hover:bg-amber-600 text-amber-800 hover:text-white border border-amber-200 hover:border-amber-600 text-xs font-bold transition-all shadow-2xs"
                    >
                      <span>Put-Away</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* 7. Full-Width Table 3: Expiry Alerts (FEFO Priority) */}
      <div className="w-full bg-white rounded-2xl p-6 sm:p-7 border border-slate-200 shadow-sm space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
          <div className="flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-xl bg-amber-50 border border-amber-100 flex items-center justify-center text-amber-600 shrink-0 shadow-xs">
              <Clock className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-3 flex-wrap">
                <h3 className="text-lg sm:text-xl font-bold text-slate-900">
                  Expiry Alerts (FEFO Priority)
                </h3>
                <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-rose-50 text-rose-700 border border-rose-200">
                  ● 3 Attention Items
                </span>
                <span className="text-xs font-medium text-slate-400">
                  (First-Expired, First-Out Queue)
                </span>
              </div>
              <p className="text-xs sm:text-sm text-slate-500 font-medium mt-1">
                Automated FEFO inventory depletion queue to avoid product obsolescence and shelf expiration
              </p>
            </div>
          </div>

          <Link
            to="/hold-stock"
            className="px-4 py-2 rounded-xl bg-slate-50 hover:bg-amber-600 text-slate-700 hover:text-white border border-slate-200 hover:border-amber-600 text-sm font-bold transition-all flex items-center gap-2 shadow-xs self-start sm:self-auto group"
          >
            <span>View All Expiry Alerts</span>
            <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-white group-hover:translate-x-0.5 transition-all" />
          </Link>
        </div>

        <div className="overflow-x-auto rounded-xl border border-slate-100">
          <table className="w-full text-left text-sm min-w-[760px]">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50/70 text-slate-600 text-xs uppercase tracking-wider font-bold">
                <th className="py-4 px-4 w-14 text-center">#</th>
                <th className="py-4 px-4">Product Name</th>
                <th className="py-4 px-4">Batch No.</th>
                <th className="py-4 px-4">Warehouse Location</th>
                <th className="py-4 px-4 text-right">Remaining Stock</th>
                <th className="py-4 px-4">Expiry Date</th>
                <th className="py-4 px-4 text-center">Days Remaining</th>
                <th className="py-4 px-4 text-center">FEFO Status</th>
                <th className="py-4 px-5 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 bg-white">
              {expiryAlerts.map((row) => (
                <tr key={row.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="py-4 px-4 text-slate-400 font-mono text-xs text-center w-14 font-semibold">
                    0{row.id}
                  </td>
                  <td className="py-4 px-4 text-slate-900 font-bold text-sm">
                    {row.product}
                  </td>
                  <td className="py-4 px-4">
                    <span className="font-mono text-slate-700 text-xs font-bold bg-slate-100 px-2.5 py-1 rounded-md border border-slate-200 inline-block shadow-2xs">
                      {row.batch}
                    </span>
                  </td>
                  <td className="py-4 px-4 text-slate-700 font-medium text-sm">
                    <span className="inline-flex items-center gap-1.5 text-slate-700 bg-slate-50 border border-slate-200 px-2.5 py-1 rounded-md text-xs font-semibold">
                      <MapPin className="w-3 h-3 text-slate-400" />
                      {row.location}
                    </span>
                  </td>
                  <td className="py-4 px-4 text-right font-mono font-bold text-slate-900 text-sm">
                    {row.qty} <span className="font-normal text-xs text-slate-500">{row.unit}</span>
                  </td>
                  <td className="py-4 px-4 text-slate-700 font-medium text-sm">
                    {row.date}
                  </td>
                  <td className="py-4 px-4 text-center">
                    <span className={`font-mono font-bold px-2.5 py-1 rounded-md text-xs border ${row.dayColor}`}>
                      {row.days} d left
                    </span>
                  </td>
                  <td className="py-4 px-4 text-center">
                    <span className={`text-xs font-bold px-3 py-1 rounded-full border inline-flex items-center gap-1 ${row.statusColor}`}>
                      {row.status.includes('Critical') && '⚠ '}
                      {row.status}
                    </span>
                  </td>
                  <td className="py-4 px-5 text-right">
                    <Link
                      to="/hold-stock"
                      className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-amber-50 hover:bg-amber-600 text-amber-800 hover:text-white border border-amber-200 hover:border-amber-600 text-xs font-bold transition-all shadow-2xs"
                    >
                      <span>Issue FEFO</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* 8. Full-Width Table 4: Warehouse Audit & Activity Stream */}
      <div className="w-full bg-white rounded-2xl p-6 sm:p-7 border border-slate-200 shadow-sm space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
          <div className="flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 shrink-0 shadow-xs">
              <Activity className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-3 flex-wrap">
                <h3 className="text-lg sm:text-xl font-bold text-slate-900">
                  Warehouse Audit &amp; Activity Stream
                </h3>
                <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse inline-block mr-1.5" />
                  Live Real-Time Feed
                </span>
                <span className="text-xs font-medium text-slate-400">
                  (System Audit Trail)
                </span>
              </div>
              <p className="text-xs sm:text-sm text-slate-500 font-medium mt-1">
                Chronological tamper-evident audit ledger of movements, quality checks, gate clearances &amp; manager sessions
              </p>
            </div>
          </div>

          <Link
            to="/current-stock"
            className="px-4 py-2 rounded-xl bg-slate-50 hover:bg-indigo-600 text-slate-700 hover:text-white border border-slate-200 hover:border-indigo-600 text-sm font-bold transition-all flex items-center gap-2 shadow-xs self-start sm:self-auto group"
          >
            <span>View Full Audit Log</span>
            <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-white group-hover:translate-x-0.5 transition-all" />
          </Link>
        </div>

        <div className="overflow-x-auto rounded-xl border border-slate-100">
          <table className="w-full text-left text-sm min-w-[760px]">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50/70 text-slate-600 text-xs uppercase tracking-wider font-bold">
                <th className="py-4 px-4 w-14 text-center">#</th>
                <th className="py-4 px-4">Time</th>
                <th className="py-4 px-4">Event Category</th>
                <th className="py-4 px-4">Activity Description</th>
                <th className="py-4 px-4">Entity Reference</th>
                <th className="py-4 px-4">Location / Bay</th>
                <th className="py-4 px-4">User / Actor</th>
                <th className="py-4 px-4 text-center">Status</th>
                <th className="py-4 px-5 text-right">Verification</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 bg-white">
              {auditLogs.map((row) => (
                <tr key={row.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="py-4 px-4 text-slate-400 font-mono text-xs text-center w-14 font-semibold">
                    0{row.id}
                  </td>
                  <td className="py-4 px-4 text-slate-600 font-mono text-xs font-semibold">
                    {row.time}
                  </td>
                  <td className="py-4 px-4">
                    <span className={`text-xs font-bold px-2.5 py-1 rounded-md border ${row.catColor}`}>
                      {row.category}
                    </span>
                  </td>
                  <td className="py-4 px-4 text-slate-900 font-bold text-sm">
                    {row.desc}
                  </td>
                  <td className="py-4 px-4">
                    <span className="font-mono text-slate-800 text-xs font-bold bg-slate-100 px-2.5 py-1 rounded-md border border-slate-200 inline-block shadow-2xs">
                      {row.ref}
                    </span>
                  </td>
                  <td className="py-4 px-4 text-slate-600 font-medium text-sm">
                    {row.location}
                  </td>
                  <td className="py-4 px-4 text-indigo-700 font-semibold text-sm">
                    {row.user}
                  </td>
                  <td className="py-4 px-4 text-center">
                    <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 inline-flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                      {row.status}
                    </span>
                  </td>
                  <td className="py-4 px-5 text-right">
                    <span className="text-xs font-bold text-slate-500 bg-slate-100 px-2.5 py-1 rounded-md border border-slate-200 inline-block">
                      {row.badge}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  )
}
