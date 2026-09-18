import { useState, useMemo } from 'react'
import { Link } from 'react-router-dom'
import {
  X,
  Warehouse,
  Package,
  Layers,
  AlertTriangle,
  FlaskConical,
  CheckCircle2,
  Plus,
  SlidersHorizontal,
  Download,
  Eye,
  ShieldAlert,
  ArrowRight,
} from 'lucide-react'

export default function DamageRejection() {
  // Toast notifications state
  const [toastMessage, setToastMessage] = useState(null)
  const triggerToast = (msg) => {
    setToastMessage(msg)
  }

  // Active filter tab
  const [activeTab, setActiveTab] = useState('All Cases')

  // Filter toolbar state
  const [filterShade, setFilterShade] = useState('All Shades')
  const [filterDamageType, setFilterDamageType] = useState('All Types')
  const [filterStatus, setFilterStatus] = useState('All Status')
  const [searchQuery, setSearchQuery] = useState('')

  // Modals state
  const [showReportModal, setShowReportModal] = useState(false)
  const [showDetailsModal, setShowDetailsModal] = useState(null)

  // 6 Dedicated Shades
  const SHADES = [
    { id: 'SH01', name: 'Shade 1: Grains & Bulk Pulses' },
    { id: 'SH02', name: 'Shade 2: Edible Oils & Liquids' },
    { id: 'SH03', name: 'Shade 3: Packaged Food & FMCG' },
    { id: 'SH04', name: 'Shade 4: Packaging Materials & Cartons' },
    { id: 'SH05', name: 'Shade 5: Chemicals & Hygiene' },
    { id: 'SH06', name: 'Shade 6: Spares & General Goods' },
  ]

  // Report Form State
  const [newCase, setNewCase] = useState({
    productName: 'Parle-G Glucose Biscuits (50g)',
    batchNo: 'BT-2026-FMCG-01',
    shadeId: 'SH03',
    row: 'R02',
    col: 'C04',
    damageType: 'Crushed Gatta Packaging',
    baseUnit: 'Pieces',
    packUnit: 'Gatta',
    unitsPerPack: 6,
    packsCount: 2,
    baseQty: 12,
    reason: 'Cartons crushed during forklift pallet stacking',
    status: 'Moved to Hold',
    reportedBy: 'Amit Patel (Storekeeper)',
    disposalAction: 'Segregate to Quarantine / Return to Vendor',
  })

  // Damage & Rejection Data (Commercial commodities, Base Units, 6 Shades)
  const [damageCases, setDamageCases] = useState([
    {
      id: 1,
      refNo: 'DMG-2026-086',
      date: '18 Sep 2026',
      productName: 'Parle-G Glucose Biscuits (50g)',
      batchNo: 'BT-2026-FMCG-01',
      shadeId: 'SH03',
      location: 'SH03-R02-C04',
      damageType: 'Crushed Gatta Packaging',
      baseQty: 12,
      baseUnit: 'Pieces',
      packQty: 2,
      packUnit: 'Gatta',
      unitsPerPack: 6,
      reason: 'Forklift pallet impact crushed outer Gatta',
      status: 'Moved to Hold',
      reportedBy: 'Amit Patel (Storekeeper)',
    },
    {
      id: 2,
      refNo: 'REJ-2026-085',
      date: '17 Sep 2026',
      productName: 'Sharbati Wheat Grain (Grade A)',
      batchNo: 'BT-2026-GRN-09',
      shadeId: 'SH01',
      location: 'SH01-R02-C08',
      damageType: 'Lab QA Quality Rejection',
      baseQty: 100,
      baseUnit: 'Kg',
      packQty: 2,
      packUnit: 'Bags',
      unitsPerPack: 50,
      reason: 'Failed lab test: Moisture content >14% threshold',
      status: 'Lab Rejected',
      reportedBy: 'Priya Patel (QC Lead)',
    },
    {
      id: 3,
      refNo: 'DMG-2026-084',
      date: '17 Sep 2026',
      productName: 'Fortune Refined Mustard Oil (15L)',
      batchNo: 'BT-2026-OIL-01',
      shadeId: 'SH02',
      location: 'SH02-R01-C01',
      damageType: 'Liquid Tin Leakage',
      baseQty: 15,
      baseUnit: 'Ltr',
      packQty: 1,
      packUnit: 'Tin',
      unitsPerPack: 15,
      reason: 'Bottom corner seam puncture during transit',
      status: 'Moved to Hold',
      reportedBy: 'Vikas Verma (Storekeeper)',
    },
    {
      id: 4,
      refNo: 'REJ-2026-083',
      date: '16 Sep 2026',
      productName: 'Good Day Butter Cookies (75g)',
      batchNo: 'BT-2026-FMCG-99',
      shadeId: 'SH03',
      location: 'SH03-R02-C10',
      damageType: 'Past Expiry Date',
      baseQty: 48,
      baseUnit: 'Pieces',
      packQty: 4,
      packUnit: 'Gatta',
      unitsPerPack: 12,
      reason: 'Reached shelf life expiry in storage',
      status: 'Scrap Disposed',
      reportedBy: 'Rajesh Sharma (Warehouse Manager)',
    },
    {
      id: 5,
      refNo: 'DMG-2026-082',
      date: '15 Sep 2026',
      productName: 'Maggi 2-Minute Noodles (70g)',
      batchNo: 'BT-2026-FMCG-03',
      shadeId: 'SH03',
      location: 'SH03-R01-C03',
      damageType: 'Crushed Gatta Packaging',
      baseQty: 24,
      baseUnit: 'Packets',
      packQty: 1,
      packUnit: 'Carton',
      unitsPerPack: 24,
      reason: 'Moisture dampness on bottom tier carton',
      status: 'Under Review',
      reportedBy: 'Amit Patel (Storekeeper)',
    },
    {
      id: 6,
      refNo: 'DMG-2026-081',
      date: '14 Sep 2026',
      productName: 'Industrial Floor Disinfectant Liquid',
      batchNo: 'BT-2026-CHM-01',
      shadeId: 'SH05',
      location: 'SH05-R01-C01',
      damageType: 'Liquid Can Leakage',
      baseQty: 10,
      baseUnit: 'Ltr',
      packQty: 2,
      packUnit: 'Cans',
      unitsPerPack: 5,
      reason: 'Cap seal defect causing slow seepage',
      status: 'Moved to Hold',
      reportedBy: 'Manoj Singh (Safety Officer)',
    },
  ])

  // Filtered rows
  const filteredCases = useMemo(() => {
    return damageCases.filter((item) => {
      if (activeTab === 'Under Review' && item.status !== 'Under Review') return false
      if (activeTab === 'Moved to Hold' && item.status !== 'Moved to Hold') return false
      if (activeTab === 'Lab Rejected' && item.status !== 'Lab Rejected') return false

      if (filterShade !== 'All Shades' && item.shadeId !== filterShade) return false
      if (filterDamageType !== 'All Types' && item.damageType !== filterDamageType) return false
      if (filterStatus !== 'All Status' && item.status !== filterStatus) return false

      if (searchQuery.trim() !== '') {
        const q = searchQuery.toLowerCase()
        return (
          item.productName.toLowerCase().includes(q) ||
          item.refNo.toLowerCase().includes(q) ||
          item.batchNo.toLowerCase().includes(q) ||
          item.location.toLowerCase().includes(q) ||
          item.reason.toLowerCase().includes(q)
        )
      }
      return true
    })
  }, [damageCases, activeTab, filterShade, filterDamageType, filterStatus, searchQuery])

  // Handle Report Damage Submit
  const handleReportDamage = (e) => {
    e.preventDefault()
    const locCode = `${newCase.shadeId}-${newCase.row}-${newCase.col}`
    const computedBase = (Number(newCase.packsCount) || 1) * (Number(newCase.unitsPerPack) || 1)

    const newEntry = {
      id: Date.now(),
      refNo: `DMG-2026-${Math.floor(100 + Math.random() * 900)}`,
      date: new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }),
      productName: newCase.productName,
      batchNo: newCase.batchNo,
      shadeId: newCase.shadeId,
      location: locCode,
      damageType: newCase.damageType,
      baseQty: computedBase,
      baseUnit: newCase.baseUnit,
      packQty: Number(newCase.packsCount) || 1,
      packUnit: newCase.packUnit,
      unitsPerPack: Number(newCase.unitsPerPack) || 1,
      reason: newCase.reason,
      status: newCase.status,
      reportedBy: newCase.reportedBy,
    }

    setDamageCases([newEntry, ...damageCases])
    setShowReportModal(false)
    triggerToast(`Damage Case ${newEntry.refNo} logged: ${computedBase} ${newEntry.baseUnit} moved to Hold.`)
  }

  // Export CSV
  const handleExportCSV = () => {
    const headers = [
      'Case Ref',
      'Date',
      'Product Name',
      'Batch No',
      'Bin Location',
      'Damage Type',
      'Base Qty Damaged',
      'Packaging (Gatta)',
      'Reason',
      'Reported By',
      'Status',
    ]
    const rows = damageCases.map((row) => [
      row.refNo,
      row.date,
      `"${row.productName}"`,
      row.batchNo,
      row.location,
      `"${row.damageType}"`,
      `${row.baseQty} ${row.baseUnit}`,
      `${row.packQty} ${row.packUnit}`,
      `"${row.reason}"`,
      `"${row.reportedBy}"`,
      row.status,
    ])
    const csvContent =
      'data:text/csv;charset=utf-8,' +
      [headers.join(','), ...rows.map((e) => e.join(','))].join('\n')
    const encodedUri = encodeURI(csvContent)
    const link = document.createElement('a')
    link.setAttribute('href', encodedUri)
    link.setAttribute('download', 'Damage_Rejection_Register_6Shades.csv')
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    triggerToast('Damage & Rejection register exported to CSV.')
  }

  return (
    <div className="space-y-4 font-sans text-slate-800 pb-12">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-20 right-6 z-50 bg-[#142312] text-amber-300 border border-amber-400 px-4 py-3 rounded-lg shadow-2xl flex items-center gap-2 text-xs font-semibold animate-bounce">
          <CheckCircle2 className="w-4 h-4 text-amber-400 shrink-0" />
          <span>{toastMessage}</span>
          <button onClick={() => setToastMessage(null)} className="ml-2 text-slate-400 hover:text-white">
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Top Himalayan Convoy Banner (Preserved) */}
      <div className="relative rounded-xl overflow-hidden shadow-md border border-slate-200/80 bg-slate-900 h-28 sm:h-32">
        <img
          src="/border.png"
          alt="Damage and Quality Rejection Control"
          className="w-full h-full object-cover object-center opacity-90"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-black/55 via-black/25 to-black/65"></div>
        <div className="absolute top-3 right-4 flex items-center gap-2 bg-black/40 backdrop-blur-md px-3 py-1 rounded-full border border-white/20">
          <div className="h-2 w-5 flex flex-col justify-between rounded-xs overflow-hidden">
            <div className="h-0.5 bg-[#FF9933]"></div>
            <div className="h-0.5 bg-white"></div>
            <div className="h-0.5 bg-[#138808]"></div>
          </div>
          <span className="text-[10px] font-bold text-white tracking-widest uppercase">
            NATION FIRST ALWAYS
          </span>
        </div>
      </div>

      {/* PAGE HEADER ROW */}
      <div className="bg-white rounded-xl shadow-xs border border-slate-200 p-4 flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-[#1E3A1E] text-white flex items-center justify-center shadow-xs shrink-0">
            <ShieldAlert className="w-5 h-5 text-amber-400" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-800">
              Damage &amp; Rejection Control (Base Units &amp; Lab QA Rejections)
            </h2>
            <p className="text-xs text-slate-500">
              Log crushed Gatta cartons, failed Lab Quality Test batches, and quarantine damaged commodities across 6 shades.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <Link
            to="/hold-stock"
            className="bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-200 text-xs font-bold px-3 py-2 rounded-lg flex items-center gap-1 transition"
          >
            <span>View Hold Stock</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>

          <button
            type="button"
            onClick={handleExportCSV}
            className="flex items-center gap-1.5 px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-lg transition cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export CSV</span>
          </button>

          <button
            type="button"
            onClick={() => setShowReportModal(true)}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-[#1E3A1E] hover:bg-[#152915] text-white text-xs font-bold rounded-lg shadow-xs transition cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Report Damage / Rejection</span>
          </button>
        </div>
      </div>

      {/* 4 SUMMARY STAT CARDS */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-white rounded-xl p-3.5 shadow-xs border border-slate-200">
          <p className="text-[11px] font-semibold text-slate-500">Total Cases Logged</p>
          <h3 className="text-2xl font-black text-slate-800 leading-tight">
            {damageCases.length}
          </h3>
          <p className="text-[10px] text-slate-400">Across all 6 shades</p>
        </div>

        <div className="bg-white rounded-xl p-3.5 shadow-xs border border-slate-200">
          <p className="text-[11px] font-semibold text-slate-500">Lab QA Rejections</p>
          <h3 className="text-2xl font-black text-rose-800 leading-tight">
            {damageCases.filter((i) => i.damageType.includes('Lab QA')).length}
          </h3>
          <p className="text-[10px] text-rose-600 font-medium">Failed lab quality standards</p>
        </div>

        <div className="bg-white rounded-xl p-3.5 shadow-xs border border-slate-200">
          <p className="text-[11px] font-semibold text-slate-500">Packaging / Gatta Damage</p>
          <h3 className="text-2xl font-black text-amber-700 leading-tight">
            {damageCases.filter((i) => i.damageType.includes('Gatta') || i.damageType.includes('Leakage')).length}
          </h3>
          <p className="text-[10px] text-amber-600 font-medium">Crushed cartons / tin leaks</p>
        </div>

        <div className="bg-white rounded-xl p-3.5 shadow-xs border border-slate-200">
          <p className="text-[11px] font-semibold text-slate-500">Quarantine Isolation</p>
          <h3 className="text-sm font-black text-emerald-800 leading-tight mt-1">
            Moved to Hold Stock
          </h3>
          <p className="text-[10px] text-slate-400">Prevented unauthorized dispatch</p>
        </div>
      </div>

      {/* FILTER TABS & TOOLBAR */}
      <div className="bg-white rounded-xl p-3 shadow-xs border border-slate-200 space-y-2.5">
        <div className="flex flex-wrap items-center justify-between gap-2 border-b pb-2 text-xs">
          <div className="flex items-center gap-1.5">
            {['All Cases', 'Under Review', 'Moved to Hold', 'Lab Rejected'].map((tab) => (
              <button
                key={tab}
                type="button"
                onClick={() => setActiveTab(tab)}
                className={`px-3 py-1.5 rounded-lg font-bold transition cursor-pointer ${
                  activeTab === tab
                    ? 'bg-[#1E3A1E] text-white shadow-xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-2">
            <select
              value={filterShade}
              onChange={(e) => setFilterShade(e.target.value)}
              className="bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1 text-xs font-bold text-slate-700"
            >
              <option value="All Shades">All 6 Shades</option>
              {SHADES.map((s) => (
                <option key={s.id} value={s.id}>{s.name}</option>
              ))}
            </select>

            <select
              value={filterDamageType}
              onChange={(e) => setFilterDamageType(e.target.value)}
              className="bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1 text-xs font-medium text-slate-700"
            >
              <option value="All Types">All Damage Types</option>
              <option value="Lab QA Quality Rejection">Lab QA Quality Rejection</option>
              <option value="Crushed Gatta Packaging">Crushed Gatta Packaging</option>
              <option value="Liquid Tin Leakage">Liquid Tin / Can Leakage</option>
              <option value="Past Expiry Date">Past Expiry Date</option>
            </select>
          </div>
        </div>

        <div className="flex items-center gap-2 text-xs">
          <div className="relative flex-1">
            <input
              type="text"
              placeholder="Search by case ref, product, batch, bin code..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-lg pl-8 pr-3 py-1.5 text-xs text-slate-800 placeholder-slate-400 focus:outline-none"
            />
            <span className="absolute left-2.5 top-2 text-slate-400 text-xs">🔍</span>
          </div>

          <button
            type="button"
            onClick={() => {
              setActiveTab('All Cases')
              setFilterShade('All Shades')
              setFilterDamageType('All Types')
              setFilterStatus('All Status')
              setSearchQuery('')
              triggerToast('Filters reset.')
            }}
            className="text-emerald-700 font-bold hover:underline cursor-pointer"
          >
            Reset
          </button>
        </div>
      </div>

      {/* CASES TABLE */}
      <div className="bg-white rounded-xl shadow-xs border border-slate-200 overflow-hidden flex flex-col">
        <div className="overflow-x-auto no-scrollbar scroll-smooth w-full">
          <table className="w-full text-left text-xs divide-y divide-slate-200 border-collapse table-nowrap" style={{ minWidth: '1100px' }}>
            <thead className="bg-slate-50 text-slate-600 font-bold uppercase tracking-wider text-[11px]">
              <tr>
                <th className="py-3 px-3 w-10 text-center">#</th>
                <th className="py-3 px-4 min-w-[120px]">Case Ref</th>
                <th className="py-3 px-4 min-w-[110px]">Date</th>
                <th className="py-3 px-4 min-w-[200px]">Product &amp; Batch</th>
                <th className="py-3 px-4 min-w-[130px]">Storage Bin</th>
                <th className="py-3 px-4 min-w-[160px]">Damage Classification</th>
                <th className="py-3 px-4 min-w-[120px] text-right">Base Qty Damaged</th>
                <th className="py-3 px-4 min-w-[120px] text-right">Packaging (Gatta)</th>
                <th className="py-3 px-4 text-center min-w-[110px]">Status</th>
                <th className="py-3 px-3 text-center w-16">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 bg-white">
              {filteredCases.map((row, idx) => (
                <tr key={row.id} className="hover:bg-slate-50 transition">
                  <td className="py-3 px-3 text-center text-slate-400 font-bold">{idx + 1}</td>
                  <td className="py-3 px-4 font-mono font-bold text-slate-900">{row.refNo}</td>
                  <td className="py-3 px-4 text-slate-500 font-mono text-[11px]">{row.date}</td>
                  <td className="py-3 px-4 text-slate-900">
                    <div className="font-bold text-slate-900">{row.productName}</div>
                    <div className="text-[10px] text-slate-400 font-mono">Batch: {row.batchNo}</div>
                  </td>
                  <td className="py-3 px-4 font-mono font-bold text-slate-800">
                    <span className="bg-slate-100 border border-slate-200 px-2 py-0.5 rounded text-[11px]">
                      {row.location}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <span
                      className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold ${
                        row.damageType.includes('Lab QA')
                          ? 'bg-rose-100 text-rose-800 border border-rose-200'
                          : 'bg-amber-100 text-amber-800 border border-amber-200'
                      }`}
                    >
                      {row.damageType}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-right font-mono font-black text-rose-800">
                    {row.baseQty} {row.baseUnit}
                  </td>
                  <td className="py-3 px-4 text-right text-slate-700 font-medium">
                    {row.packQty} {row.packUnit}
                  </td>
                  <td className="py-3 px-4 text-center">
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        row.status === 'Moved to Hold'
                          ? 'bg-amber-50 text-amber-800 border border-amber-200'
                          : row.status === 'Lab Rejected'
                          ? 'bg-rose-50 text-rose-800 border border-rose-200'
                          : 'bg-slate-100 text-slate-700'
                      }`}
                    >
                      {row.status}
                    </span>
                  </td>
                  <td className="py-3 px-3 text-center">
                    <button
                      type="button"
                      onClick={() => setShowDetailsModal(row)}
                      className="p-1.5 bg-slate-50 hover:bg-slate-100 text-slate-600 rounded-lg border cursor-pointer"
                      title="Inspect Case"
                    >
                      <Eye className="w-3.5 h-3.5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* REPORT DAMAGE MODAL */}
      {showReportModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-5 shadow-2xl border border-slate-200 space-y-3.5 text-xs">
            <div className="flex items-center justify-between pb-2 border-b">
              <h3 className="font-bold text-slate-900 text-sm flex items-center gap-1.5">
                <AlertTriangle className="w-4 h-4 text-amber-600" />
                <span>Log Damage / Quality Rejection Case</span>
              </h3>
              <button onClick={() => setShowReportModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleReportDamage} className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">Product</label>
                  <input
                    type="text"
                    required
                    value={newCase.productName}
                    onChange={(e) => setNewCase({ ...newCase, productName: e.target.value })}
                    className="w-full bg-slate-50 border rounded-lg p-2 font-bold"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">Batch No.</label>
                  <input
                    type="text"
                    required
                    value={newCase.batchNo}
                    onChange={(e) => setNewCase({ ...newCase, batchNo: e.target.value })}
                    className="w-full bg-slate-50 border rounded-lg p-2 font-mono"
                  />
                </div>
              </div>

              {/* Grid Location: Shade -> Row -> Col */}
              <div className="p-2.5 bg-slate-50 border rounded-lg space-y-1.5">
                <span className="font-bold text-slate-700 text-[11px]">Storage Bin Origin</span>
                <div className="grid grid-cols-3 gap-2 text-[10px]">
                  <div>
                    <span className="font-semibold block mb-1">Shade</span>
                    <select
                      value={newCase.shadeId}
                      onChange={(e) => setNewCase({ ...newCase, shadeId: e.target.value })}
                      className="w-full bg-white border rounded p-1 text-xs font-bold"
                    >
                      {SHADES.map((s) => (
                        <option key={s.id} value={s.id}>{s.id}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <span className="font-semibold block mb-1">Row</span>
                    <select
                      value={newCase.row}
                      onChange={(e) => setNewCase({ ...newCase, row: e.target.value })}
                      className="w-full bg-white border rounded p-1 text-xs font-mono font-bold"
                    >
                      {Array.from({ length: 8 }, (_, i) => (
                        <option key={i} value={`R0${i + 1}`}>Row 0{i + 1}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <span className="font-semibold block mb-1">Column</span>
                    <select
                      value={newCase.col}
                      onChange={(e) => setNewCase({ ...newCase, col: e.target.value })}
                      className="w-full bg-white border rounded p-1 text-xs font-mono font-bold"
                    >
                      {Array.from({ length: 10 }, (_, i) => (
                        <option key={i} value={i + 1 < 10 ? `C0${i + 1}` : `C${i + 1}`}>
                          Col {i + 1 < 10 ? `0${i + 1}` : i + 1}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              {/* Base Unit & Gatta count */}
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">Gatta Damaged</label>
                  <input
                    type="number"
                    min="1"
                    value={newCase.packsCount}
                    onChange={(e) => setNewCase({ ...newCase, packsCount: e.target.value })}
                    className="w-full bg-slate-50 border rounded-lg p-2 font-mono font-bold"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">Units / Gatta</label>
                  <input
                    type="number"
                    value={newCase.unitsPerPack}
                    onChange={(e) => setNewCase({ ...newCase, unitsPerPack: e.target.value })}
                    className="w-full bg-slate-50 border rounded-lg p-2 font-mono"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">Base Unit</label>
                  <input
                    type="text"
                    value={newCase.baseUnit}
                    onChange={(e) => setNewCase({ ...newCase, baseUnit: e.target.value })}
                    className="w-full bg-slate-50 border rounded-lg p-2 font-bold"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">Damage Classification</label>
                  <select
                    value={newCase.damageType}
                    onChange={(e) => setNewCase({ ...newCase, damageType: e.target.value })}
                    className="w-full bg-slate-50 border rounded-lg p-2 font-medium"
                  >
                    <option value="Crushed Gatta Packaging">Crushed Gatta Packaging</option>
                    <option value="Lab QA Quality Rejection">Lab QA Quality Rejection</option>
                    <option value="Liquid Tin Leakage">Liquid Tin / Can Leakage</option>
                    <option value="Past Expiry Date">Past Expiry Date</option>
                    <option value="Moisture Contamination">Moisture Contamination</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">Quarantine Action</label>
                  <select
                    value={newCase.status}
                    onChange={(e) => setNewCase({ ...newCase, status: e.target.value })}
                    className="w-full bg-slate-50 border rounded-lg p-2 font-bold"
                  >
                    <option value="Moved to Hold">Move to Hold Stock</option>
                    <option value="Lab Rejected">Mark Lab Rejected</option>
                    <option value="Under Review">Under Review</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">Root Cause / Reason</label>
                <textarea
                  rows={2}
                  value={newCase.reason}
                  onChange={(e) => setNewCase({ ...newCase, reason: e.target.value })}
                  className="w-full bg-slate-50 border rounded-lg p-2 text-xs"
                ></textarea>
              </div>

              <div className="pt-2 flex justify-end gap-2 border-t">
                <button
                  type="button"
                  onClick={() => setShowReportModal(false)}
                  className="px-4 py-2 border rounded-lg text-slate-600"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-[#1E3A1E] text-white font-bold rounded-lg"
                >
                  Confirm &amp; Move to Quarantine
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* DETAILS MODAL */}
      {showDetailsModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-5 shadow-2xl border space-y-3 text-xs">
            <div className="flex justify-between border-b pb-2">
              <h3 className="font-bold text-slate-900 text-sm">Damage Case ({showDetailsModal.refNo})</h3>
              <button onClick={() => setShowDetailsModal(null)} className="text-slate-400 hover:text-slate-600">
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between py-1 border-b">
                <span className="text-slate-500">Product:</span>
                <span className="font-bold">{showDetailsModal.productName}</span>
              </div>
              <div className="flex justify-between py-1 border-b">
                <span className="text-slate-500">Bin Location:</span>
                <span className="font-mono font-bold text-emerald-900">{showDetailsModal.location}</span>
              </div>
              <div className="flex justify-between py-1 border-b">
                <span className="text-slate-500">Damage Classification:</span>
                <span className="font-bold text-rose-800">{showDetailsModal.damageType}</span>
              </div>
              <div className="flex justify-between py-1 border-b">
                <span className="text-slate-500">Damaged Base Units:</span>
                <span className="font-mono font-black text-rose-800">{showDetailsModal.baseQty} {showDetailsModal.baseUnit}</span>
              </div>
              <div className="flex justify-between py-1 border-b">
                <span className="text-slate-500">Gatta / Carton Equivalent:</span>
                <span className="font-bold">{showDetailsModal.packQty} {showDetailsModal.packUnit}</span>
              </div>
              <div className="flex justify-between py-1 border-b">
                <span className="text-slate-500">Reported By:</span>
                <span>{showDetailsModal.reportedBy}</span>
              </div>
              <div className="py-1">
                <span className="text-slate-500 block mb-0.5">Root Cause:</span>
                <p className="text-slate-700 bg-slate-50 p-2 rounded border">{showDetailsModal.reason}</p>
              </div>
            </div>
            <div className="pt-2 flex justify-end">
              <button
                onClick={() => setShowDetailsModal(null)}
                className="px-4 py-1.5 bg-slate-800 text-white rounded-lg text-xs font-bold"
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
