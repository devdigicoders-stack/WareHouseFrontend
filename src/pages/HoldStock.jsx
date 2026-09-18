import { useState, useMemo } from 'react'
import { Link } from 'react-router-dom'
import {
  X,
  Warehouse,
  Package,
  Layers,
  FlaskConical,
  CheckCircle2,
  AlertTriangle,
  ShieldAlert,
  ShieldCheck,
  Download,
  Eye,
  ArrowRight,
  Plus,
  Lock,
  Unlock,
} from 'lucide-react'

export default function HoldStock() {
  // Toast notifications state
  const [toastMessage, setToastMessage] = useState(null)
  const triggerToast = (msg) => {
    setToastMessage(msg)
  }

  // Active filter tab
  const [activeTab, setActiveTab] = useState('All Hold Items')

  // Filter toolbar state
  const [searchKeyword, setSearchKeyword] = useState('')
  const [filterShade, setFilterShade] = useState('All Shades')
  const [filterReason, setFilterReason] = useState('All Reasons')
  const [filterStatus, setFilterStatus] = useState('All Status')

  // Modals state
  const [showPutOnHoldModal, setShowPutOnHoldModal] = useState(false)
  const [showReleaseModal, setShowReleaseModal] = useState(null)
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

  // Form State
  const [newHold, setNewHold] = useState({
    productName: 'Refined Mustard Oil (New Batch Sample)',
    sku: 'OIL-REF-02',
    batchNo: 'BT-2026-OIL-99',
    shadeId: 'SH02',
    row: 'R01',
    col: 'C04',
    baseUnit: 'Ltr',
    packUnit: 'Tins (15L)',
    unitsPerPack: 15,
    packsCount: 20,
    baseQty: 300,
    reason: 'Under Lab Testing',
    holdDate: '18 Sep 2026',
    expectedRelease: '24 Sep 2026',
    status: 'On Hold',
    holdOfficer: 'Priya Patel (QC Lead)',
    remarks: 'Awaiting chemical purity and fatty acid profile test results.',
  })

  // Hold Stock Items Data (Linked to Lab Testing, 6 Shades, Base Units)
  const [holdItems, setHoldItems] = useState([
    {
      id: 1,
      refNo: 'HLD-2026-048',
      productName: 'Refined Mustard Oil (New Batch Sample)',
      sku: 'OIL-REF-02',
      batchNo: 'BT-2026-OIL-99',
      shadeId: 'SH02',
      location: 'SH02-R01-C04',
      baseQty: 300,
      baseUnit: 'Ltr',
      packQty: 20,
      packUnit: 'Tins',
      unitsPerPack: 15,
      reason: 'Under Lab Testing',
      labStatus: 'Pending Lab Test',
      holdDate: '18 Sep 2026',
      expectedRelease: '22 Sep 2026',
      status: 'On Hold',
      officer: 'Priya Patel (QC Lead)',
      remarks: 'Sample drawn at gate inward; locked from outward dispatch.',
    },
    {
      id: 2,
      refNo: 'HLD-2026-047',
      productName: 'Maggi 2-Minute Noodles (70g)',
      sku: 'FMCG-NOD-01',
      batchNo: 'BT-2026-FMCG-03',
      shadeId: 'SH03',
      location: 'SH03-R01-C03',
      baseQty: 480,
      baseUnit: 'Packets',
      packQty: 20,
      packUnit: 'Cartons',
      unitsPerPack: 24,
      reason: 'Under Lab Testing',
      labStatus: 'Under Testing',
      holdDate: '17 Sep 2026',
      expectedRelease: '20 Sep 2026',
      status: 'On Hold',
      officer: 'Amit Patel (Storekeeper)',
      remarks: 'Sensory and moisture analysis in progress at central lab.',
    },
    {
      id: 3,
      refNo: 'HLD-2026-046',
      productName: 'Sharbati Wheat Grain (Grade A)',
      sku: 'GRN-WHT-01',
      batchNo: 'BT-2026-GRN-09',
      shadeId: 'SH01',
      location: 'SH01-R02-C08',
      baseQty: 100,
      baseUnit: 'Kg',
      packQty: 2,
      packUnit: 'Bags',
      unitsPerPack: 50,
      reason: 'Quality Rejection (High Moisture)',
      labStatus: 'Failed Lab Test',
      holdDate: '16 Sep 2026',
      expectedRelease: 'Return to Vendor',
      status: 'Quarantine',
      officer: 'Priya Patel (QC Lead)',
      remarks: 'Moisture recorded at 14.8% (spec max 13.0%). Supplier return pass initiated.',
    },
    {
      id: 4,
      refNo: 'HLD-2026-045',
      productName: 'Parle-G Glucose Biscuits (50g)',
      sku: 'FMCG-BIS-01',
      batchNo: 'BT-2026-FMCG-01',
      shadeId: 'SH03',
      location: 'SH03-R02-C04',
      baseQty: 12,
      baseUnit: 'Pieces',
      packQty: 2,
      packUnit: 'Gatta',
      unitsPerPack: 6,
      reason: 'Packaging Damage in Stacking',
      labStatus: 'Passed',
      holdDate: '16 Sep 2026',
      expectedRelease: 'Scrap Write-off',
      status: 'Damaged Hold',
      officer: 'Rajesh Sharma (Warehouse Manager)',
      remarks: 'Outer cartons torn by pallet truck. Biscuits undamaged but packaging compromised.',
    },
    {
      id: 5,
      refNo: 'HLD-2026-044',
      productName: 'Fortune Refined Mustard Oil (15L)',
      sku: 'OIL-REF-01',
      batchNo: 'BT-2026-OIL-01',
      shadeId: 'SH02',
      location: 'SH02-R01-C01',
      baseQty: 15,
      baseUnit: 'Ltr',
      packQty: 1,
      packUnit: 'Tin',
      unitsPerPack: 15,
      reason: 'Container Seepage',
      labStatus: 'Passed',
      holdDate: '15 Sep 2026',
      expectedRelease: 'Repack / Decant',
      status: 'Damaged Hold',
      officer: 'Vikas Verma (Storekeeper)',
      remarks: 'Tin seam pinhole leak. Scheduled for decanting into fresh food-grade canister.',
    },
  ])

  // Filtered rows
  const filteredHold = useMemo(() => {
    return holdItems.filter((item) => {
      if (activeTab === 'Under Lab Testing' && item.reason !== 'Under Lab Testing') return false
      if (activeTab === 'Quarantine' && item.status !== 'Quarantine') return false
      if (activeTab === 'Damaged Hold' && item.status !== 'Damaged Hold') return false

      if (filterShade !== 'All Shades' && item.shadeId !== filterShade) return false
      if (filterReason !== 'All Reasons' && item.reason !== filterReason) return false
      if (filterStatus !== 'All Status' && item.status !== filterStatus) return false

      if (searchKeyword.trim() !== '') {
        const q = searchKeyword.toLowerCase()
        return (
          item.productName.toLowerCase().includes(q) ||
          item.refNo.toLowerCase().includes(q) ||
          item.batchNo.toLowerCase().includes(q) ||
          item.location.toLowerCase().includes(q)
        )
      }
      return true
    })
  }, [holdItems, activeTab, filterShade, filterReason, filterStatus, searchKeyword])

  // Put on hold submit
  const handlePutOnHoldSubmit = (e) => {
    e.preventDefault()
    const locCode = `${newHold.shadeId}-${newHold.row}-${newHold.col}`
    const computedBase = (Number(newHold.packsCount) || 1) * (Number(newHold.unitsPerPack) || 1)

    const newEntry = {
      id: Date.now(),
      refNo: `HLD-2026-${Math.floor(100 + Math.random() * 900)}`,
      productName: newHold.productName,
      sku: newHold.sku,
      batchNo: newHold.batchNo,
      shadeId: newHold.shadeId,
      location: locCode,
      baseQty: computedBase,
      baseUnit: newHold.baseUnit,
      packQty: Number(newHold.packsCount) || 1,
      packUnit: newHold.packUnit,
      unitsPerPack: Number(newHold.unitsPerPack) || 1,
      reason: newHold.reason,
      labStatus: newHold.reason === 'Under Lab Testing' ? 'Pending Lab Test' : 'Passed',
      holdDate: new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }),
      expectedRelease: newHold.expectedRelease || 'Pending Review',
      status: newHold.status,
      officer: newHold.holdOfficer,
      remarks: newHold.remarks,
    }

    setHoldItems([newEntry, ...holdItems])
    setShowPutOnHoldModal(false)
    triggerToast(`Batch ${newEntry.batchNo} placed on Hold at ${locCode}. Outward dispatch locked.`)
  }

  // Release from hold submit
  const handleConfirmRelease = (item) => {
    setHoldItems(holdItems.filter((i) => i.id !== item.id))
    setShowReleaseModal(null)
    triggerToast(
      `Batch ${item.batchNo} released from Hold back to active stock! Dispatch lock removed.`
    )
  }

  // Export CSV
  const handleExportCSV = () => {
    const headers = [
      'Hold Ref',
      'Product Name',
      'SKU',
      'Batch No',
      'Bin Location',
      'Base Qty Held',
      'Packaging (Gatta)',
      'Hold Reason',
      'Lab Status',
      'Hold Date',
      'Expected Release',
      'Officer',
      'Status',
    ]
    const rows = holdItems.map((row) => [
      row.refNo,
      `"${row.productName}"`,
      row.sku,
      row.batchNo,
      row.location,
      `${row.baseQty} ${row.baseUnit}`,
      `${row.packQty} ${row.packUnit}`,
      `"${row.reason}"`,
      row.labStatus,
      row.holdDate,
      row.expectedRelease,
      `"${row.officer}"`,
      row.status,
    ])
    const csvContent =
      'data:text/csv;charset=utf-8,' +
      [headers.join(','), ...rows.map((e) => e.join(','))].join('\n')
    const encodedUri = encodeURI(csvContent)
    const link = document.createElement('a')
    link.setAttribute('href', encodedUri)
    link.setAttribute('download', 'Hold_Quarantine_Stock_6Shades.csv')
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    triggerToast('Hold Stock register exported to CSV.')
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
          alt="Quarantine and Hold Stock Control"
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
            <Lock className="w-5 h-5 text-amber-400" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-800">
              Hold Stock &amp; Quarantine Control (Lab QA Lock)
            </h2>
            <p className="text-xs text-slate-500">
              Isolate batches awaiting Lab Clearance, failed QC tests, or packaging damage from dispatch across 6 shades.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <Link
            to="/lab-reports"
            className="bg-emerald-50 hover:bg-emerald-100 text-emerald-900 border border-emerald-200 text-xs font-bold px-3 py-2 rounded-lg flex items-center gap-1 transition"
          >
            <FlaskConical className="w-3.5 h-3.5" />
            <span>Lab Test Reports</span>
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
            onClick={() => setShowPutOnHoldModal(true)}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-[#1E3A1E] hover:bg-[#152915] text-white text-xs font-bold rounded-lg shadow-xs transition cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Place Stock on Hold</span>
          </button>
        </div>
      </div>

      {/* 4 SUMMARY STAT CARDS */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-white rounded-xl p-3.5 shadow-xs border border-slate-200">
          <p className="text-[11px] font-semibold text-slate-500">Total Batches on Hold</p>
          <h3 className="text-2xl font-black text-slate-800 leading-tight">
            {holdItems.length}
          </h3>
          <p className="text-[10px] text-slate-400">Locked from outward gate</p>
        </div>

        <div className="bg-white rounded-xl p-3.5 shadow-xs border border-slate-200">
          <p className="text-[11px] font-semibold text-slate-500">Under Lab Testing</p>
          <h3 className="text-2xl font-black text-amber-700 leading-tight">
            {holdItems.filter((i) => i.reason === 'Under Lab Testing').length}
          </h3>
          <p className="text-[10px] text-amber-600 font-medium">Awaiting QA clearance</p>
        </div>

        <div className="bg-white rounded-xl p-3.5 shadow-xs border border-slate-200">
          <p className="text-[11px] font-semibold text-slate-500">Quarantine / Rejected</p>
          <h3 className="text-2xl font-black text-rose-800 leading-tight">
            {holdItems.filter((i) => i.status === 'Quarantine').length}
          </h3>
          <p className="text-[10px] text-rose-600 font-medium">Failed lab quality standards</p>
        </div>

        <div className="bg-white rounded-xl p-3.5 shadow-xs border border-slate-200">
          <p className="text-[11px] font-semibold text-slate-500">Dispatch Safety</p>
          <h3 className="text-sm font-black text-emerald-800 leading-tight mt-1">
            Zero Leakage
          </h3>
          <p className="text-[10px] text-slate-400">Strict gate checkout check</p>
        </div>
      </div>

      {/* FILTER TABS & TOOLBAR */}
      <div className="bg-white rounded-xl p-3 shadow-xs border border-slate-200 space-y-2.5">
        <div className="flex flex-wrap items-center justify-between gap-2 border-b pb-2 text-xs">
          <div className="flex items-center gap-1.5">
            {['All Hold Items', 'Under Lab Testing', 'Quarantine', 'Damaged Hold'].map((tab) => (
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
              value={filterReason}
              onChange={(e) => setFilterReason(e.target.value)}
              className="bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1 text-xs font-medium text-slate-700"
            >
              <option value="All Reasons">All Reasons</option>
              <option value="Under Lab Testing">Under Lab Testing</option>
              <option value="Quality Rejection (High Moisture)">Quality Rejection</option>
              <option value="Packaging Damage in Stacking">Packaging Damage</option>
              <option value="Container Seepage">Container Seepage</option>
            </select>
          </div>
        </div>

        <div className="flex items-center gap-2 text-xs">
          <div className="relative flex-1">
            <input
              type="text"
              placeholder="Search by ref no, product, batch, bin code..."
              value={searchKeyword}
              onChange={(e) => setSearchKeyword(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-lg pl-8 pr-3 py-1.5 text-xs text-slate-800 placeholder-slate-400 focus:outline-none"
            />
            <span className="absolute left-2.5 top-2 text-slate-400 text-xs">🔍</span>
          </div>

          <button
            type="button"
            onClick={() => {
              setActiveTab('All Hold Items')
              setFilterShade('All Shades')
              setFilterReason('All Reasons')
              setFilterStatus('All Status')
              setSearchKeyword('')
              triggerToast('Filters reset.')
            }}
            className="text-emerald-700 font-bold hover:underline cursor-pointer"
          >
            Reset
          </button>
        </div>
      </div>

      {/* HOLD STOCK TABLE */}
      <div className="bg-white rounded-xl shadow-xs border border-slate-200 overflow-hidden flex flex-col">
        <div className="overflow-x-auto no-scrollbar scroll-smooth w-full">
          <table className="w-full text-left text-xs divide-y divide-slate-200 border-collapse table-nowrap" style={{ minWidth: '1100px' }}>
            <thead className="bg-slate-50 text-slate-600 font-bold uppercase tracking-wider text-[11px]">
              <tr>
                <th className="py-3 px-3 w-10 text-center">#</th>
                <th className="py-3 px-4 min-w-[120px]">Hold Ref</th>
                <th className="py-3 px-4 min-w-[200px]">Product &amp; SKU</th>
                <th className="py-3 px-4 min-w-[130px]">Storage Bin</th>
                <th className="py-3 px-4 min-w-[120px]">Batch No.</th>
                <th className="py-3 px-4 min-w-[130px] text-right">Base Qty on Hold</th>
                <th className="py-3 px-4 min-w-[120px] text-right">Packaging (Gatta)</th>
                <th className="py-3 px-4 min-w-[180px]">Hold Reason</th>
                <th className="py-3 px-4 text-center min-w-[120px]">Lab Status</th>
                <th className="py-3 px-4 text-center min-w-[100px]">Status</th>
                <th className="py-3 px-3 text-center w-28">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 bg-white">
              {filteredHold.map((row, idx) => (
                <tr key={row.id} className="hover:bg-slate-50 transition">
                  <td className="py-3 px-3 text-center text-slate-400 font-bold">{idx + 1}</td>
                  <td className="py-3 px-4 font-mono font-bold text-slate-900">{row.refNo}</td>
                  <td className="py-3 px-4 text-slate-900">
                    <div className="font-bold text-slate-900">{row.productName}</div>
                    <div className="text-[10px] text-slate-400 font-mono">{row.sku}</div>
                  </td>
                  <td className="py-3 px-4 font-mono font-bold text-slate-800">
                    <span className="bg-slate-100 border border-slate-200 px-2 py-0.5 rounded text-[11px]">
                      {row.location}
                    </span>
                  </td>
                  <td className="py-3 px-4 font-mono text-slate-700">{row.batchNo}</td>
                  <td className="py-3 px-4 text-right font-mono font-black text-rose-800">
                    {row.baseQty} {row.baseUnit}
                  </td>
                  <td className="py-3 px-4 text-right text-slate-700 font-medium">
                    {row.packQty} {row.packUnit}
                  </td>
                  <td className="py-3 px-4 text-slate-700">{row.reason}</td>
                  <td className="py-3 px-4 text-center">
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        row.labStatus === 'Passed'
                          ? 'bg-emerald-100 text-emerald-800'
                          : row.labStatus === 'Failed Lab Test'
                          ? 'bg-rose-100 text-rose-800'
                          : 'bg-amber-100 text-amber-800'
                      }`}
                    >
                      {row.labStatus}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-center">
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        row.status === 'Quarantine'
                          ? 'bg-rose-50 text-rose-800 border border-rose-200'
                          : 'bg-amber-50 text-amber-800 border border-amber-200'
                      }`}
                    >
                      {row.status}
                    </span>
                  </td>
                  <td className="py-3 px-3 text-center">
                    <div className="flex items-center justify-center gap-1.5">
                      <button
                        type="button"
                        onClick={() => setShowDetailsModal(row)}
                        className="p-1.5 bg-slate-50 hover:bg-slate-100 text-slate-600 rounded-lg border cursor-pointer"
                        title="View Details"
                      >
                        <Eye className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => setShowReleaseModal(row)}
                        className="p-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 rounded-lg border border-emerald-200 cursor-pointer"
                        title="Release to Active Stock"
                      >
                        <Unlock className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* PUT ON HOLD MODAL */}
      {showPutOnHoldModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-5 shadow-2xl border space-y-3 text-xs">
            <div className="flex items-center justify-between pb-2 border-b">
              <h3 className="font-bold text-slate-900 text-sm flex items-center gap-1.5">
                <Lock className="w-4 h-4 text-amber-600" />
                <span>Place Stock Batch on Hold / Quarantine</span>
              </h3>
              <button onClick={() => setShowPutOnHoldModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handlePutOnHoldSubmit} className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Product</label>
                  <input
                    type="text"
                    required
                    value={newHold.productName}
                    onChange={(e) => setNewHold({ ...newHold, productName: e.target.value })}
                    className="w-full bg-slate-50 border rounded-lg p-2 font-bold"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Batch No.</label>
                  <input
                    type="text"
                    required
                    value={newHold.batchNo}
                    onChange={(e) => setNewHold({ ...newHold, batchNo: e.target.value })}
                    className="w-full bg-slate-50 border rounded-lg p-2 font-mono"
                  />
                </div>
              </div>

              {/* Grid Location: Shade -> Row -> Col */}
              <div className="p-2.5 bg-slate-50 border rounded-lg space-y-1.5">
                <span className="font-bold text-slate-700 text-[11px]">Storage Bin Coordinates</span>
                <div className="grid grid-cols-3 gap-2 text-[10px]">
                  <div>
                    <span className="font-semibold block mb-1">Shade</span>
                    <select
                      value={newHold.shadeId}
                      onChange={(e) => setNewHold({ ...newHold, shadeId: e.target.value })}
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
                      value={newHold.row}
                      onChange={(e) => setNewHold({ ...newHold, row: e.target.value })}
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
                      value={newHold.col}
                      onChange={(e) => setNewHold({ ...newHold, col: e.target.value })}
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

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Gatta Count</label>
                  <input
                    type="number"
                    min="1"
                    value={newHold.packsCount}
                    onChange={(e) => setNewHold({ ...newHold, packsCount: e.target.value })}
                    className="w-full bg-slate-50 border rounded-lg p-2 font-mono font-bold"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Units / Gatta</label>
                  <input
                    type="number"
                    value={newHold.unitsPerPack}
                    onChange={(e) => setNewHold({ ...newHold, unitsPerPack: e.target.value })}
                    className="w-full bg-slate-50 border rounded-lg p-2 font-mono"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Base Unit</label>
                  <input
                    type="text"
                    value={newHold.baseUnit}
                    onChange={(e) => setNewHold({ ...newHold, baseUnit: e.target.value })}
                    className="w-full bg-slate-50 border rounded-lg p-2 font-bold"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Hold Reason</label>
                  <select
                    value={newHold.reason}
                    onChange={(e) => setNewHold({ ...newHold, reason: e.target.value })}
                    className="w-full bg-slate-50 border rounded-lg p-2"
                  >
                    <option value="Under Lab Testing">Under Lab Testing</option>
                    <option value="Quality Rejection (High Moisture)">Quality Rejection</option>
                    <option value="Packaging Damage in Stacking">Packaging Damage</option>
                    <option value="Container Seepage">Container Seepage</option>
                    <option value="Documentation Missing">Documentation Missing</option>
                  </select>
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Status</label>
                  <select
                    value={newHold.status}
                    onChange={(e) => setNewHold({ ...newHold, status: e.target.value })}
                    className="w-full bg-slate-50 border rounded-lg p-2 font-bold"
                  >
                    <option value="On Hold">On Hold (Pending QC)</option>
                    <option value="Quarantine">Quarantine (Failed QC)</option>
                    <option value="Damaged Hold">Damaged Hold</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Remarks</label>
                <textarea
                  rows={2}
                  value={newHold.remarks}
                  onChange={(e) => setNewHold({ ...newHold, remarks: e.target.value })}
                  className="w-full bg-slate-50 border rounded-lg p-2 text-xs"
                ></textarea>
              </div>

              <div className="pt-2 flex justify-end gap-2 border-t">
                <button
                  type="button"
                  onClick={() => setShowPutOnHoldModal(false)}
                  className="px-4 py-2 border rounded-lg text-slate-600"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-[#1E3A1E] text-white font-bold rounded-lg"
                >
                  Confirm Hold Lock
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* RELEASE MODAL */}
      {showReleaseModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-sm w-full p-5 shadow-2xl border text-center space-y-3 text-xs">
            <div className="w-12 h-12 bg-emerald-100 text-emerald-800 rounded-full flex items-center justify-center mx-auto">
              <Unlock className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-slate-900 text-sm">Release Batch to Active Stock?</h3>
            <p className="text-slate-600">
              Confirm that <strong>{showReleaseModal.productName}</strong> (Batch: {showReleaseModal.batchNo}) has completed Lab QA testing and is approved for dispatch.
            </p>
            <div className="pt-2 flex justify-center gap-2">
              <button
                type="button"
                onClick={() => setShowReleaseModal(null)}
                className="px-4 py-2 border rounded-lg font-semibold"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => handleConfirmRelease(showReleaseModal)}
                className="px-5 py-2 bg-emerald-700 hover:bg-emerald-800 text-white font-bold rounded-lg"
              >
                Release Stock
              </button>
            </div>
          </div>
        </div>
      )}

      {/* DETAILS MODAL */}
      {showDetailsModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-5 shadow-2xl border space-y-3 text-xs">
            <div className="flex justify-between border-b pb-2">
              <h3 className="font-bold text-slate-900 text-sm">Hold Batch Inspection ({showDetailsModal.refNo})</h3>
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
                <span className="text-slate-500">Storage Coordinate:</span>
                <span className="font-mono font-bold text-emerald-900">{showDetailsModal.location}</span>
              </div>
              <div className="flex justify-between py-1 border-b">
                <span className="text-slate-500">Held Base Units:</span>
                <span className="font-mono font-black text-rose-800">{showDetailsModal.baseQty} {showDetailsModal.baseUnit}</span>
              </div>
              <div className="flex justify-between py-1 border-b">
                <span className="text-slate-500">Packaging (Gatta):</span>
                <span className="font-bold">{showDetailsModal.packQty} {showDetailsModal.packUnit}</span>
              </div>
              <div className="flex justify-between py-1 border-b">
                <span className="text-slate-500">Hold Reason:</span>
                <span className="font-semibold">{showDetailsModal.reason}</span>
              </div>
              <div className="flex justify-between py-1 border-b">
                <span className="text-slate-500">Lab Clearance:</span>
                <span className="font-bold text-amber-800">{showDetailsModal.labStatus}</span>
              </div>
              <div className="flex justify-between py-1 border-b">
                <span className="text-slate-500">Locked By:</span>
                <span>{showDetailsModal.officer}</span>
              </div>
              <div className="py-1">
                <span className="text-slate-500 block mb-0.5">QC Officer Remarks:</span>
                <p className="text-slate-700 bg-slate-50 p-2 rounded border">{showDetailsModal.remarks}</p>
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
