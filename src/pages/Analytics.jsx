import { useState, useMemo } from 'react'
import { Link } from 'react-router-dom'
import {
  TrendingUp,
  TrendingDown,
  BarChart3,
  PieChart,
  Layers,
  Package,
  AlertTriangle,
  CheckCircle2,
  Clock,
  ArrowUpRight,
  ArrowDownRight,
  Download,
  Calendar,
  Warehouse,
  ShieldCheck,
  Truck,
  Send,
  SlidersHorizontal,
  Flame,
  Snowflake,
  ShieldAlert,
} from 'lucide-react'

export default function Analytics() {
  // Toast notifications state
  const [toastMessage, setToastMessage] = useState(null)
  const triggerToast = (msg) => {
    setToastMessage(msg)
    setTimeout(() => setToastMessage(null), 3500)
  }

  // Time horizon filter state
  const [timeHorizon, setTimeHorizon] = useState('7D') // '7D' | '30D' | '90D'

  // 6 Dedicated Warehouse Shades Capacity Data
  const shadesCapacity = [
    {
      id: 'SH01',
      name: 'Shade 1: Grains & Bulk Pulses',
      category: 'Grains & Pulses',
      occupied: 4100,
      totalCapacity: 5000,
      unit: 'Bags (50kg)',
      fillPercent: 82,
      status: 'Normal',
      color: 'bg-amber-500',
      lightColor: 'bg-amber-50 text-amber-700 border-amber-200',
    },
    {
      id: 'SH02',
      name: 'Shade 2: Edible Oils & Liquids',
      category: 'Edible Oils',
      occupied: 2040,
      totalCapacity: 3000,
      unit: 'Tins (15L)',
      fillPercent: 68,
      status: 'Normal',
      color: 'bg-blue-500',
      lightColor: 'bg-blue-50 text-blue-700 border-blue-200',
    },
    {
      id: 'SH03',
      name: 'Shade 3: Packaged Food & FMCG',
      category: 'Packaged FMCG',
      occupied: 5460,
      totalCapacity: 6000,
      unit: 'Gatta',
      fillPercent: 91,
      status: 'Near Full',
      color: 'bg-rose-500',
      lightColor: 'bg-rose-50 text-rose-700 border-rose-200',
    },
    {
      id: 'SH04',
      name: 'Shade 4: Packaging Materials & Cartons',
      category: 'Packaging',
      occupied: 3000,
      totalCapacity: 5000,
      unit: 'Bundles',
      fillPercent: 60,
      status: 'Normal',
      color: 'bg-indigo-500',
      lightColor: 'bg-indigo-50 text-indigo-700 border-indigo-200',
    },
    {
      id: 'SH05',
      name: 'Shade 5: Chemicals & Hygiene',
      category: 'Chemicals',
      occupied: 900,
      totalCapacity: 2000,
      unit: 'Carboys (20L)',
      fillPercent: 45,
      status: 'Ample Space',
      color: 'bg-emerald-500',
      lightColor: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    },
    {
      id: 'SH06',
      name: 'Shade 6: Spares & General Goods',
      category: 'Spares',
      occupied: 1100,
      totalCapacity: 2000,
      unit: 'Crates',
      fillPercent: 55,
      status: 'Normal',
      color: 'bg-purple-500',
      lightColor: 'bg-purple-50 text-purple-700 border-purple-200',
    },
  ]

  // 7-Day Throughput Activity (Mon to Sun)
  const throughputData = [
    { day: 'Mon', inward: 180, outward: 140 },
    { day: 'Tue', inward: 220, outward: 160 },
    { day: 'Wed', inward: 190, outward: 175 },
    { day: 'Thu', inward: 240, outward: 210 },
    { day: 'Fri', inward: 280, outward: 240 },
    { day: 'Sat', inward: 210, outward: 190 },
    { day: 'Sun', inward: 90, outward: 65 },
  ]

  // Fast vs Slow Moving SKUs
  const velocityData = [
    { name: 'Parle-G Glucose Biscuits (50g)', sku: 'FMCG-BIS-01', type: 'Fast', shade: 'SH03', rate: '2,400 units/wk', trend: '↑ 14%' },
    { name: 'Fortune Refined Mustard Oil (15L)', sku: 'OIL-REF-01', type: 'Fast', shade: 'SH02', rate: '650 tins/wk', trend: '↑ 9%' },
    { name: 'Sharbati Wheat Flour (10kg Bags)', sku: 'GRN-ATA-01', type: 'Fast', shade: 'SH01', rate: '1,800 bags/wk', trend: '↑ 11%' },
    { name: 'Master 5-Ply Corrugated Cartons', sku: 'PKG-CRT-01', type: 'Slow', shade: 'SH04', rate: '120 bundles/wk', trend: '↓ 4%' },
    { name: 'Industrial Disinfectant Concentrate', sku: 'CHM-DIS-01', type: 'Slow', shade: 'SH05', rate: '35 carboys/wk', trend: '↓ 2%' },
  ]

  // Real-Time Critical Operational Alerts
  const criticalAlerts = [
    { id: 1, type: 'CRITICAL', title: 'Shade 3 Storage Near Capacity (91%)', desc: 'Packaged Food shade approaching maximum threshold. Relocate 500 Gatta to buffer.', time: '10m ago' },
    { id: 2, type: 'WARNING', title: 'Low Stock: Chana Dal Extra Bold (50kg)', desc: 'Safety threshold breached (20 bags left). Auto purchase indent suggested.', time: '1h ago' },
    { id: 3, type: 'SECURITY', title: 'Quarantine Hold: Lab Moisture High', desc: 'Batch BT-2026-ATA-09 locked in Shade 1 awaiting re-test clearance.', time: '3h ago' },
  ]

  // Export Analytics Summary
  const handleExportAnalytics = () => {
    const csvContent =
      'data:text/csv;charset=utf-8,Metric,Value,Benchmark,Status\n' +
      '"Warehouse Fill Rate","76.8%","75.0%","Optimal"\n' +
      '"Inventory Turnover Velocity","4.8x","4.5x","High Velocity"\n' +
      '"7-Day Throughput Ratio","1.27","1.00","Healthy Inward Flow"\n' +
      '"QA Quality Clearance Rate","98.6%","98.0%","Exceeds Target"\n'
    const encodedUri = encodeURI(csvContent)
    const link = document.createElement('a')
    link.setAttribute('href', encodedUri)
    link.setAttribute('download', `Warehouse_Analytics_Summary_${timeHorizon}.csv`)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    triggerToast('Analytics executive summary exported to CSV.')
  }

  return (
    <div className="space-y-5 pb-12">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-5 right-5 z-50 bg-slate-900 text-white px-4 py-3 rounded-xl shadow-2xl flex items-center gap-2.5 text-xs font-semibold animate-bounce border border-slate-700">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Page Header Bar */}
      <div className="bg-white rounded-2xl p-4 sm:p-5 shadow-xs border border-slate-200/80 flex flex-col xl:flex-row xl:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5 min-w-0">
          <div className="w-11 h-11 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600 shadow-xs shrink-0">
            <TrendingUp className="w-5 h-5" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2.5 flex-wrap">
              <h1 className="text-xl font-bold text-slate-800 tracking-tight">Warehouse Analytics &amp; Intelligence</h1>
              <span className="text-[11px] font-semibold bg-blue-50 text-blue-700 border border-blue-200/60 px-2.5 py-0.5 rounded-full shrink-0">
                Live Intelligence
              </span>
            </div>
            <p className="text-xs text-slate-500 font-medium mt-1 max-w-2xl">
              Real-time capacity tracking across 6 storage shades, throughput volume trends, inventory velocity, and operational alerts.
            </p>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-2.5 w-full sm:w-auto">
          {/* Time Horizon Filter Switcher */}
          <div className="flex items-center justify-between sm:justify-start bg-slate-100 p-1 rounded-xl text-xs font-bold">
            <button
              type="button"
              onClick={() => {
                setTimeHorizon('7D')
                triggerToast('Updated horizon to Last 7 Days.')
              }}
              className={`px-3 py-1.5 rounded-lg transition cursor-pointer ${
                timeHorizon === '7D'
                  ? 'bg-white text-blue-700 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              7 Days
            </button>
            <button
              type="button"
              onClick={() => {
                setTimeHorizon('30D')
                triggerToast('Updated horizon to Last 30 Days.')
              }}
              className={`px-3 py-1.5 rounded-lg transition cursor-pointer ${
                timeHorizon === '30D'
                  ? 'bg-white text-blue-700 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              30 Days
            </button>
            <button
              type="button"
              onClick={() => {
                setTimeHorizon('90D')
                triggerToast('Updated horizon to Last 90 Days.')
              }}
              className={`px-3 py-1.5 rounded-lg transition cursor-pointer ${
                timeHorizon === '90D'
                  ? 'bg-white text-blue-700 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Quarter
            </button>
          </div>

          <button
            type="button"
            onClick={handleExportAnalytics}
            className="inline-flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold shadow-xs transition shrink-0 cursor-pointer"
          >
            <Download className="w-3.5 h-3.5 text-slate-500" />
            <span>Export Analytics</span>
          </button>
        </div>
      </div>

      {/* 4 Dynamic KPI Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
        <div className="bg-white rounded-2xl p-4 shadow-xs border border-slate-200/80 flex items-center gap-3.5 min-w-0">
          <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 border border-blue-100 flex items-center justify-center shrink-0">
            <PieChart className="w-5 h-5" />
          </div>
          <div className="min-w-0">
            <p className="text-xs font-semibold text-slate-500 truncate">Warehouse Fill Rate</p>
            <h3 className="text-xl font-bold text-slate-800 leading-tight mt-0.5 truncate">
              76.8%
            </h3>
            <p className="text-[11px] text-blue-600 font-medium truncate">Optimal storage load</p>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-4 shadow-xs border border-slate-200/80 flex items-center gap-3.5 min-w-0">
          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 border border-emerald-100 flex items-center justify-center shrink-0">
            <Flame className="w-5 h-5" />
          </div>
          <div className="min-w-0">
            <p className="text-xs font-semibold text-slate-500 truncate">Inventory Turnover</p>
            <h3 className="text-xl font-bold text-slate-800 leading-tight mt-0.5 truncate">
              4.8x Velocity
            </h3>
            <p className="text-[11px] text-emerald-600 font-medium truncate">Annualized turnover</p>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-4 shadow-xs border border-slate-200/80 flex items-center gap-3.5 min-w-0">
          <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 border border-indigo-100 flex items-center justify-center shrink-0">
            <BarChart3 className="w-5 h-5" />
          </div>
          <div className="min-w-0">
            <p className="text-xs font-semibold text-slate-500 truncate">Throughput Ratio</p>
            <h3 className="text-xl font-bold text-slate-800 leading-tight mt-0.5 truncate">
              1.27 Ratio
            </h3>
            <p className="text-[11px] text-indigo-600 font-medium truncate">Inward vs Outward balance</p>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-4 shadow-xs border border-slate-200/80 flex items-center gap-3.5 min-w-0">
          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 border border-emerald-100 flex items-center justify-center shrink-0">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div className="min-w-0">
            <p className="text-xs font-semibold text-slate-500 truncate">QA Clearance Rate</p>
            <h3 className="text-xl font-bold text-emerald-700 leading-tight mt-0.5 truncate">
              98.6% Passed
            </h3>
            <p className="text-[11px] text-emerald-600 font-medium truncate">Strict FSSAI standard</p>
          </div>
        </div>
      </div>

      {/* Main Analytics Grid: Capacity Matrix & 7-Day Throughput */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* 6 Dedicated Shades Capacity Matrix (7 Cols) */}
        <div className="lg:col-span-7 bg-white rounded-2xl shadow-xs border border-slate-200/80 p-4 sm:p-5 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
            <div className="flex items-center gap-2 min-w-0">
              <Warehouse className="w-4 h-4 text-indigo-600 shrink-0" />
              <h3 className="text-sm font-bold text-slate-800 truncate">6 Dedicated Storage Shades Capacity</h3>
            </div>
            <span className="text-[11px] font-semibold text-slate-500 bg-slate-50 border border-slate-200 px-2.5 py-1 rounded-lg shrink-0 self-start sm:self-auto">
              Live Bin Occupancy
            </span>
          </div>

          <div className="space-y-3">
            {shadesCapacity.map((shade) => (
              <div key={shade.id} className="p-3 sm:p-3.5 rounded-xl border border-slate-200/70 hover:border-slate-300 transition bg-slate-50/50 space-y-2">
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2 min-w-0 flex-1">
                    <span className="font-mono font-bold text-xs text-indigo-700 bg-white px-2 py-0.5 rounded border border-slate-200 shrink-0">
                      {shade.id}
                    </span>
                    <span className="text-xs font-bold text-slate-800 truncate" title={shade.name}>
                      {shade.name}
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border whitespace-nowrap shrink-0 ${shade.lightColor}`}>
                      {shade.status}
                    </span>
                    <span className="font-mono text-xs font-black text-slate-900 shrink-0 min-w-[32px] text-right">
                      {shade.fillPercent}%
                    </span>
                  </div>
                </div>

                {/* Progress Bar */}
                <div className="w-full bg-slate-200/80 h-2 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${shade.color}`}
                    style={{ width: `${shade.fillPercent}%` }}
                  />
                </div>

                <div className="flex items-center justify-between gap-2 text-[10px] sm:text-[11px] text-slate-500">
                  <span className="truncate">Occupied: <strong className="text-slate-800">{shade.occupied.toLocaleString()}</strong> {shade.unit}</span>
                  <span className="truncate text-right">Capacity: <strong className="text-slate-800">{shade.totalCapacity.toLocaleString()}</strong> {shade.unit}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 7-Day Throughput Bar Chart & Velocity (5 Cols) */}
        <div className="lg:col-span-5 space-y-5">
          {/* Throughput Chart Card */}
          <div className="bg-white rounded-2xl shadow-xs border border-slate-200/80 p-4 sm:p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <BarChart3 className="w-4 h-4 text-blue-600" />
                <h3 className="text-sm font-bold text-slate-800">Weekly Throughput Activity</h3>
              </div>
              <div className="flex items-center gap-3 text-[10px] font-bold">
                <span className="flex items-center gap-1 text-emerald-600">
                  <span className="w-2 h-2 rounded-full bg-emerald-500" /> Inward GRN
                </span>
                <span className="flex items-center gap-1 text-blue-600">
                  <span className="w-2 h-2 rounded-full bg-blue-500" /> Outward Dispatch
                </span>
              </div>
            </div>

            {/* Visual SVG Bar Chart */}
            <div className="flex items-end justify-between gap-2 h-44 pt-6 pb-2 px-2 border-b border-slate-100">
              {throughputData.map((d, i) => {
                const inHeight = Math.round((d.inward / 300) * 100)
                const outHeight = Math.round((d.outward / 300) * 100)
                return (
                  <div key={i} className="flex-1 flex flex-col items-center gap-1.5 h-full justify-end group">
                    <div className="w-full flex items-end justify-center gap-1 h-full">
                      {/* Inward Bar */}
                      <div
                        className="w-3 bg-emerald-500 rounded-t hover:bg-emerald-600 transition-all cursor-pointer"
                        style={{ height: `${inHeight}%` }}
                        title={`${d.day} Inward: ${d.inward} batches`}
                      />
                      {/* Outward Bar */}
                      <div
                        className="w-3 bg-blue-500 rounded-t hover:bg-blue-600 transition-all cursor-pointer"
                        style={{ height: `${outHeight}%` }}
                        title={`${d.day} Outward: ${d.outward} consignments`}
                      />
                    </div>
                    <span className="text-[10px] font-bold text-slate-500">{d.day}</span>
                  </div>
                )
              })}
            </div>

            <div className="flex items-center justify-between text-xs text-slate-500 pt-1">
              <span>Weekly Inward: <strong className="text-emerald-700">1,410 Batches</strong></span>
              <span>Weekly Outward: <strong className="text-blue-700">1,180 Dispatches</strong></span>
            </div>
          </div>

          {/* Operational Health Alerts */}
          <div className="bg-white rounded-2xl shadow-xs border border-slate-200/80 p-4 sm:p-5 space-y-3">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-500" />
                <h3 className="text-sm font-bold text-slate-800">Operational Alerts &amp; Triggers</h3>
              </div>
              <span className="text-[10px] font-bold text-amber-700 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-full">
                3 Active
              </span>
            </div>

            <div className="space-y-2.5">
              {criticalAlerts.map((alt) => (
                <div key={alt.id} className="p-3 rounded-xl border border-slate-200/80 bg-slate-50/60 flex items-start gap-2.5">
                  <div className="w-2 h-2 rounded-full bg-amber-500 mt-1.5 shrink-0" />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <h4 className="text-xs font-bold text-slate-800 truncate">{alt.title}</h4>
                      <span className="text-[10px] text-slate-400 font-mono shrink-0">{alt.time}</span>
                    </div>
                    <p className="text-[11px] text-slate-500 mt-0.5 leading-relaxed">{alt.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Stock Velocity & Movement Table Card */}
      <div className="bg-white rounded-2xl shadow-xs border border-slate-200/80 p-4 sm:p-5 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2 min-w-0">
            <Flame className="w-4 h-4 text-rose-500 shrink-0" />
            <h3 className="text-sm font-bold text-slate-800 truncate">Inventory Movement Velocity (Fast vs Slow Moving SKUs)</h3>
          </div>
          <Link to="/reports" className="text-xs font-bold text-indigo-600 hover:text-indigo-700 flex items-center gap-1 shrink-0 self-start sm:self-auto">
            <span>View Velocity Ledger</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="overflow-x-auto no-scrollbar">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-50 text-[10px] uppercase font-bold text-slate-500 border-b border-slate-200">
                <th className="py-2.5 px-3">Product Name &amp; SKU</th>
                <th className="py-2.5 px-3">Storage Shade</th>
                <th className="py-2.5 px-3 text-center">Velocity Classification</th>
                <th className="py-2.5 px-3 text-right">Weekly Turnover Rate</th>
                <th className="py-2.5 px-3 text-right">Demand Trend</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {velocityData.map((row, idx) => (
                <tr key={idx} className="hover:bg-slate-50/50">
                  <td className="py-2.5 px-3">
                    <div className="font-bold text-slate-800">{row.name}</div>
                    <div className="text-[10px] text-slate-400 font-mono">{row.sku}</div>
                  </td>
                  <td className="py-2.5 px-3 font-mono font-bold text-indigo-700">{row.shade}</td>
                  <td className="py-2.5 px-3 text-center">
                    <span
                      className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                        row.type === 'Fast'
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          : 'bg-slate-100 text-slate-600 border border-slate-200'
                      }`}
                    >
                      {row.type === 'Fast' ? '🔥 Fast Moving' : '⏳ Slow Moving'}
                    </span>
                  </td>
                  <td className="py-2.5 px-3 text-right font-bold text-slate-800">{row.rate}</td>
                  <td className={`py-2.5 px-3 text-right font-bold ${row.trend.includes('↑') ? 'text-emerald-600' : 'text-slate-500'}`}>
                    {row.trend}
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
