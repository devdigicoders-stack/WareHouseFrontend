import { useState, useMemo } from 'react'
import { Link } from 'react-router-dom'
import {
  X,
  Warehouse,
  Package,
  Layers,
  CheckCircle2,
  AlertTriangle,
  Plus,
  SlidersHorizontal,
  Download,
  Eye,
  RotateCcw,
} from 'lucide-react'

export default function StockAdjustment() {
  // Toast notifications state
  const [toastMessage, setToastMessage] = useState(null)
  const triggerToast = (msg) => {
    setToastMessage(msg)
  }

  // Filter toolbar state
  const [filterType, setFilterType] = useState('All Types')
  const [filterShade, setFilterShade] = useState('All Shades')
  const [filterReason, setFilterReason] = useState('All Reasons')
  const [filterStatus, setFilterStatus] = useState('All Status')
  const [searchQuery, setSearchQuery] = useState('')

  // Modals state
  const [showNewModal, setShowNewModal] = useState(false)
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
  const [newAdjustment, setNewAdjustment] = useState({
    productName: 'Parle-G Glucose Biscuits (50g)',
    sku: 'FMCG-BIS-01',
    batchNo: 'BT-2026-FMCG-01',
    shadeId: 'SH03',
    row: 'R02',
    col: 'C04',
    baseUnit: 'Pieces',
    packUnit: 'Gatta',
    unitsPerPack: 6,
    adjustmentType: 'Increase',
    baseQtyChange: 12, // 12 Pieces = 2 Gatta
    adjustedBy: 'Rajesh Sharma (Warehouse Manager)',
    reason: 'Physical Stock Audit Variance',
    status: 'Approved',
    remarks: 'Reconciliation after monthly physical stock count.',
  })

  // Adjustment History Data (Base Units, 6 Shades, Civilian Goods & Personnel)
  const [adjustmentList, setAdjustmentList] = useState([
    {
      id: 1,
      dateTime: '18 Sep 2026, 11:30',
      refNo: 'ADJ-2026-0146',
      productName: 'Parle-G Glucose Biscuits (50g)',
      sku: 'FMCG-BIS-01',
      batchNo: 'BT-2026-FMCG-01',
      shadeId: 'SH03',
      location: 'SH03-R02-C04',
      baseUnit: 'Pieces',
      packUnit: 'Gatta',
      unitsPerPack: 6,
      adjustmentType: 'Increase',
      baseQtyChange: '+12',
      packsChange: '+2 Gatta',
      adjustedBy: 'Rajesh Sharma',
      reason: 'Physical Stock Audit Variance',
      status: 'Approved',
      remarks: 'Found 2 extra sealed cartons during shelf audit.',
    },
    {
      id: 2,
      dateTime: '17 Sep 2026, 16:45',
      refNo: 'ADJ-2026-0145',
      productName: 'Good Day Butter Cookies (75g)',
      sku: 'FMCG-BIS-02',
      batchNo: 'BT-2026-FMCG-02',
      shadeId: 'SH03',
      location: 'SH03-R02-C05',
      baseUnit: 'Pieces',
      packUnit: 'Gatta',
      unitsPerPack: 12,
      adjustmentType: 'Decrease',
      baseQtyChange: '-24',
      packsChange: '-2 Gatta',
      adjustedBy: 'Amit Patel',
      reason: 'Gatta Carton Crushed in Stacking',
      status: 'Approved',
      remarks: 'Damaged by forklift mast, moved to rejection.',
    },
    {
      id: 3,
      dateTime: '17 Sep 2026, 14:15',
      refNo: 'ADJ-2026-0144',
      productName: 'Sharbati Wheat Grain (Grade A)',
      sku: 'GRN-WHT-01',
      batchNo: 'BT-2026-GRN-01',
      shadeId: 'SH01',
      location: 'SH01-R02-C01',
      baseUnit: 'Kg',
      packUnit: 'Bags',
      unitsPerPack: 50,
      adjustmentType: 'Decrease',
      baseQtyChange: '-50',
      packsChange: '-1 Bag',
      adjustedBy: 'Priya Patel (QC)',
      reason: 'Lab Testing Sampling Draw',
      status: 'Approved',
      remarks: 'Drawn for central food lab moisture test.',
    },
    {
      id: 4,
      dateTime: '16 Sep 2026, 10:20',
      refNo: 'ADJ-2026-0143',
      productName: 'Fortune Refined Mustard Oil (15L)',
      sku: 'OIL-REF-01',
      batchNo: 'BT-2026-OIL-01',
      shadeId: 'SH02',
      location: 'SH02-R01-C01',
      baseUnit: 'Ltr',
      packUnit: 'Tins',
      unitsPerPack: 15,
      adjustmentType: 'Decrease',
      baseQtyChange: '-15',
      packsChange: '-1 Tin',
      adjustedBy: 'Vikas Verma',
      reason: 'Minor Tin Seam Leakage',
      status: 'Approved',
      remarks: 'Seepage noticed during morning aisle rounds.',
    },
    {
      id: 5,
      dateTime: '15 Sep 2026, 17:30',
      refNo: 'ADJ-2026-0142',
      productName: 'Maggi 2-Minute Noodles (70g)',
      sku: 'FMCG-NOD-01',
      batchNo: 'BT-2026-FMCG-03',
      shadeId: 'SH03',
      location: 'SH03-R01-C03',
      baseUnit: 'Packets',
      packUnit: 'Cartons',
      unitsPerPack: 24,
      adjustmentType: 'Increase',
      baseQtyChange: '+24',
      packsChange: '+1 Carton',
      adjustedBy: 'Amit Patel',
      reason: 'Inward Count Discrepancy',
      status: 'Pending',
      remarks: 'Gate invoice reconciliation confirmed 1 additional carton.',
    },
    {
      id: 6,
      dateTime: '15 Sep 2026, 11:00',
      refNo: 'ADJ-2026-0141',
      productName: 'Industrial Floor Disinfectant Liquid',
      sku: 'CHM-DIS-01',
      batchNo: 'BT-2026-CHM-01',
      shadeId: 'SH05',
      location: 'SH05-R01-C01',
      baseUnit: 'Ltr',
      packUnit: 'Cans',
      unitsPerPack: 5,
      adjustmentType: 'Decrease',
      baseQtyChange: '-10',
      packsChange: '-2 Cans',
      adjustedBy: 'Manoj Singh',
      reason: 'Internal Facility Hygiene Use',
      status: 'Approved',
      remarks: 'Issued for warehouse floor chemical wash.',
    },
  ])

  // Filtered rows
  const filteredAdjustments = useMemo(() => {
    return adjustmentList.filter((item) => {
      if (filterType !== 'All Types' && item.adjustmentType !== filterType) return false
      if (filterShade !== 'All Shades' && item.shadeId !== filterShade) return false
      if (filterReason !== 'All Reasons' && item.reason !== filterReason) return false
      if (filterStatus !== 'All Status' && item.status !== filterStatus) return false
      if (searchQuery.trim() !== '') {
        const q = searchQuery.toLowerCase()
        return (
          item.productName.toLowerCase().includes(q) ||
          item.refNo.toLowerCase().includes(q) ||
          item.batchNo.toLowerCase().includes(q) ||
          item.location.toLowerCase().includes(q) ||
          item.adjustedBy.toLowerCase().includes(q)
        )
      }
      return true
    })
  }, [adjustmentList, filterType, filterShade, filterReason, filterStatus, searchQuery])

  // Handle Create Adjustment Submit
  const handleCreateAdjustment = (e) => {
    e.preventDefault()
    const locCode = `${newAdjustment.shadeId}-${newAdjustment.row}-${newAdjustment.col}`
    const qtyNum = Number(newAdjustment.baseQtyChange) || 0
    const packsCount = Math.round(qtyNum / (Number(newAdjustment.unitsPerPack) || 1))

    const newEntry = {
      id: Date.now(),
      dateTime: new Date().toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' }),
      refNo: `ADJ-2026-${Math.floor(1000 + Math.random() * 9000)}`,
      productName: newAdjustment.productName,
      sku: newAdjustment.sku,
      batchNo: newAdjustment.batchNo,
      shadeId: newAdjustment.shadeId,
      location: locCode,
      baseUnit: newAdjustment.baseUnit,
      packUnit: newAdjustment.packUnit,
      unitsPerPack: newAdjustment.unitsPerPack,
      adjustmentType: newAdjustment.adjustmentType,
      baseQtyChange: newAdjustment.adjustmentType === 'Increase' ? `+${qtyNum}` : `-${qtyNum}`,
      packsChange:
        newAdjustment.adjustmentType === 'Increase'
          ? `+${packsCount} ${newAdjustment.packUnit}`
          : `-${packsCount} ${newAdjustment.packUnit}`,
      adjustedBy: newAdjustment.adjustedBy,
      reason: newAdjustment.reason,
      status: 'Approved',
      remarks: newAdjustment.remarks,
    }

    setAdjustmentList([newEntry, ...adjustmentList])
    setShowNewModal(false)
    triggerToast(
      `Stock adjustment ${newEntry.refNo} (${newEntry.baseQtyChange} ${newEntry.baseUnit}) applied to ${locCode}.`
    )
  }

  // Export CSV
  const handleExportCSV = () => {
    const headers = [
      'Ref No',
      'Date & Time',
      'Product Name',
      'Batch No',
      'Location Bin',
      'Type',
      'Base Qty Change',
      'Packaging (Gatta)',
      'Reason',
      'Adjusted By',
      'Status',
    ]
    const rows = adjustmentList.map((row) => [
      row.refNo,
      `"${row.dateTime}"`,
      `"${row.productName}"`,
      row.batchNo,
      row.location,
      row.adjustmentType,
      row.baseQtyChange,
      row.packsChange,
      `"${row.reason}"`,
      `"${row.adjustedBy}"`,
      row.status,
    ])
    const csvContent =
      'data:text/csv;charset=utf-8,' +
      [headers.join(','), ...rows.map((e) => e.join(','))].join('\n')
    const encodedUri = encodeURI(csvContent)
    const link = document.createElement('a')
    link.setAttribute('href', encodedUri)
    link.setAttribute('download', 'Stock_Adjustment_Register_6Shades.csv')
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    triggerToast('Stock Adjustment register exported to CSV.')
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
          alt="Warehouse Stock Adjustment Operations"
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
            <SlidersHorizontal className="w-5 h-5 text-white" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-800">
              Stock Adjustment (Base Units &amp; 6 Shades Reconciliation)
            </h2>
            <p className="text-xs text-slate-500">
              Record inventory reconciliations, audit variations, sampling draws, and damage write-offs in base product units.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <nav className="text-xs text-slate-500 hidden lg:flex items-center gap-1.5 font-medium mr-2">
            <Link to="/dashboard" className="hover:text-slate-800">Home</Link>
            <span>›</span>
            <span className="text-slate-600">Inventory</span>
            <span>›</span>
            <span className="text-slate-800 font-semibold">Stock Adjustment</span>
          </nav>

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
            onClick={() => setShowNewModal(true)}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-[#1E3A1E] hover:bg-[#152915] text-white text-xs font-bold rounded-lg shadow-xs transition cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>New Adjustment</span>
          </button>
        </div>
      </div>

      {/* 4 SUMMARY STAT CARDS */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-white rounded-xl p-3.5 shadow-xs border border-slate-200">
          <p className="text-[11px] font-semibold text-slate-500">Total Adjustments</p>
          <h3 className="text-2xl font-black text-slate-800 leading-tight">
            {adjustmentList.length}
          </h3>
          <p className="text-[10px] text-slate-400">Audit reconciliations</p>
        </div>

        <div className="bg-white rounded-xl p-3.5 shadow-xs border border-slate-200">
          <p className="text-[11px] font-semibold text-slate-500">Positive Adjustments</p>
          <h3 className="text-2xl font-black text-emerald-800 leading-tight">
            {adjustmentList.filter((i) => i.adjustmentType === 'Increase').length}
          </h3>
          <p className="text-[10px] text-emerald-600 font-medium">Found stock / count additions</p>
        </div>

        <div className="bg-white rounded-xl p-3.5 shadow-xs border border-slate-200">
          <p className="text-[11px] font-semibold text-slate-500">Deductions &amp; Sampling</p>
          <h3 className="text-2xl font-black text-rose-800 leading-tight">
            {adjustmentList.filter((i) => i.adjustmentType === 'Decrease').length}
          </h3>
          <p className="text-[10px] text-rose-600 font-medium">Damage / lab sampling draws</p>
        </div>

        <div className="bg-white rounded-xl p-3.5 shadow-xs border border-slate-200">
          <p className="text-[11px] font-semibold text-slate-500">Minimum Unit Precision</p>
          <h3 className="text-sm font-black text-slate-800 leading-tight mt-1">
            Base Units (Pcs/Kg)
          </h3>
          <p className="text-[10px] text-slate-400">With Gatta carton ratios</p>
        </div>
      </div>

      {/* FILTER TOOLBAR */}
      <div className="bg-white rounded-xl p-3 shadow-xs border border-slate-200 flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs">
        <div className="flex flex-wrap items-center gap-2.5 flex-1">
          <div>
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 font-semibold text-slate-700"
            >
              <option value="All Types">All Types</option>
              <option value="Increase">Increase (+)</option>
              <option value="Decrease">Decrease (-)</option>
            </select>
          </div>

          <div>
            <select
              value={filterShade}
              onChange={(e) => setFilterShade(e.target.value)}
              className="bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 font-semibold text-slate-700"
            >
              <option value="All Shades">All 6 Shades</option>
              {SHADES.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name}
                </option>
              ))}
            </select>
          </div>

          <div className="relative flex-1 min-w-[200px]">
            <input
              type="text"
              placeholder="Search by product, batch, ref no, location..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-lg pl-8 pr-3 py-1.5 text-xs text-slate-800 placeholder-slate-400 focus:outline-none"
            />
            <span className="absolute left-2.5 top-2 text-slate-400 text-xs">🔍</span>
          </div>
        </div>

        <button
          type="button"
          onClick={() => {
            setFilterType('All Types')
            setFilterShade('All Shades')
            setFilterReason('All Reasons')
            setFilterStatus('All Status')
            setSearchQuery('')
            triggerToast('Filters reset.')
          }}
          className="text-emerald-700 font-bold hover:underline cursor-pointer self-end md:self-center"
        >
          Reset Filters
        </button>
      </div>

      {/* ADJUSTMENT TABLE */}
      <div className="bg-white rounded-xl shadow-xs border border-slate-200 overflow-hidden flex flex-col">
        <div className="overflow-x-auto no-scrollbar scroll-smooth w-full">
          <table className="w-full text-left text-xs divide-y divide-slate-200 border-collapse table-nowrap" style={{ minWidth: '1100px' }}>
            <thead className="bg-slate-50 text-slate-600 font-bold uppercase tracking-wider text-[11px]">
              <tr>
                <th className="py-3 px-3 w-10 text-center">#</th>
                <th className="py-3 px-4 min-w-[120px]">Ref No.</th>
                <th className="py-3 px-4 min-w-[140px]">Date &amp; Time</th>
                <th className="py-3 px-4 min-w-[180px]">Product &amp; Batch</th>
                <th className="py-3 px-4 min-w-[130px]">Storage Bin</th>
                <th className="py-3 px-4 min-w-[120px] text-right">Base Quantity Change</th>
                <th className="py-3 px-4 min-w-[120px] text-right">Packaging (Gatta)</th>
                <th className="py-3 px-4 min-w-[180px]">Adjustment Reason</th>
                <th className="py-3 px-4 min-w-[130px]">Adjusted By</th>
                <th className="py-3 px-4 text-center min-w-[90px]">Status</th>
                <th className="py-3 px-3 text-center w-16">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 bg-white">
              {filteredAdjustments.map((row, idx) => (
                <tr key={row.id} className="hover:bg-slate-50 transition">
                  <td className="py-3 px-3 text-center text-slate-400 font-bold">{idx + 1}</td>
                  <td className="py-3 px-4 font-mono font-bold text-slate-900">{row.refNo}</td>
                  <td className="py-3 px-4 text-slate-500 font-mono text-[11px]">{row.dateTime}</td>
                  <td className="py-3 px-4 font-bold text-slate-900">
                    <div>{row.productName}</div>
                    <div className="text-[10px] text-slate-400 font-mono">Batch: {row.batchNo}</div>
                  </td>
                  <td className="py-3 px-4 font-mono font-bold text-slate-800">
                    <span className="bg-slate-100 border border-slate-200 px-2 py-0.5 rounded text-[11px]">
                      {row.location}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-right font-mono font-black">
                    <span
                      className={
                        row.adjustmentType === 'Increase' ? 'text-emerald-700' : 'text-rose-700'
                      }
                    >
                      {row.baseQtyChange} {row.baseUnit}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-right text-slate-600 font-medium">
                    {row.packsChange}
                  </td>
                  <td className="py-3 px-4 text-slate-700">{row.reason}</td>
                  <td className="py-3 px-4 text-slate-600 text-[11px]">👤 {row.adjustedBy}</td>
                  <td className="py-3 px-4 text-center">
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        row.status === 'Approved'
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-amber-100 text-amber-800'
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
                      title="View Details"
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

      {/* NEW ADJUSTMENT MODAL */}
      {showNewModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-5 shadow-2xl border border-slate-200 space-y-3.5 text-xs">
            <div className="flex items-center justify-between pb-2 border-b">
              <h3 className="font-bold text-slate-900 text-sm flex items-center gap-1.5">
                <SlidersHorizontal className="w-4 h-4 text-emerald-700" />
                <span>New Stock Reconciliation (Base Units)</span>
              </h3>
              <button onClick={() => setShowNewModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateAdjustment} className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">Product</label>
                  <input
                    type="text"
                    required
                    value={newAdjustment.productName}
                    onChange={(e) => setNewAdjustment({ ...newAdjustment, productName: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 font-bold"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">Batch No.</label>
                  <input
                    type="text"
                    required
                    value={newAdjustment.batchNo}
                    onChange={(e) => setNewAdjustment({ ...newAdjustment, batchNo: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 font-mono"
                  />
                </div>
              </div>

              {/* Shade ➔ Row ➔ Col */}
              <div className="p-2.5 bg-slate-50 border rounded-lg space-y-1.5">
                <span className="font-bold text-slate-700 text-[11px]">Storage Bin Coordinates</span>
                <div className="grid grid-cols-3 gap-2 text-[10px]">
                  <div>
                    <span className="font-semibold block mb-1">Shade</span>
                    <select
                      value={newAdjustment.shadeId}
                      onChange={(e) => setNewAdjustment({ ...newAdjustment, shadeId: e.target.value })}
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
                      value={newAdjustment.row}
                      onChange={(e) => setNewAdjustment({ ...newAdjustment, row: e.target.value })}
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
                      value={newAdjustment.col}
                      onChange={(e) => setNewAdjustment({ ...newAdjustment, col: e.target.value })}
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
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">Type</label>
                  <select
                    value={newAdjustment.adjustmentType}
                    onChange={(e) => setNewAdjustment({ ...newAdjustment, adjustmentType: e.target.value })}
                    className="w-full bg-slate-50 border rounded-lg p-2 font-bold"
                  >
                    <option value="Increase">Increase (+)</option>
                    <option value="Decrease">Decrease (-)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">Base Quantity Change</label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={newAdjustment.baseQtyChange}
                    onChange={(e) => setNewAdjustment({ ...newAdjustment, baseQtyChange: e.target.value })}
                    className="w-full bg-slate-50 border rounded-lg p-2 font-mono font-bold"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">Base Unit</label>
                  <input
                    type="text"
                    value={newAdjustment.baseUnit}
                    onChange={(e) => setNewAdjustment({ ...newAdjustment, baseUnit: e.target.value })}
                    className="w-full bg-slate-50 border rounded-lg p-2 font-bold"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">Reason</label>
                <select
                  value={newAdjustment.reason}
                  onChange={(e) => setNewAdjustment({ ...newAdjustment, reason: e.target.value })}
                  className="w-full bg-slate-50 border rounded-lg p-2"
                >
                  <option value="Physical Stock Audit Variance">Physical Stock Audit Variance</option>
                  <option value="Gatta Carton Crushed in Stacking">Gatta Carton Crushed in Stacking</option>
                  <option value="Lab Testing Sampling Draw">Lab Testing Sampling Draw</option>
                  <option value="Minor Tin Seam Leakage">Minor Tin Seam Leakage</option>
                  <option value="Inward Count Discrepancy">Inward Count Discrepancy</option>
                  <option value="Internal Facility Hygiene Use">Internal Facility Hygiene Use</option>
                  <option value="Expiry Date Write-Off">Expiry Date Write-Off</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">Remarks</label>
                <textarea
                  rows={2}
                  value={newAdjustment.remarks}
                  onChange={(e) => setNewAdjustment({ ...newAdjustment, remarks: e.target.value })}
                  className="w-full bg-slate-50 border rounded-lg p-2 text-xs"
                ></textarea>
              </div>

              <div className="pt-2 flex justify-end gap-2 border-t">
                <button
                  type="button"
                  onClick={() => setShowNewModal(false)}
                  className="px-4 py-2 border rounded-lg text-slate-600"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-[#1E3A1E] text-white font-bold rounded-lg"
                >
                  Save Adjustment
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
              <h3 className="font-bold text-slate-900 text-sm">Adjustment Record ({showDetailsModal.refNo})</h3>
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
                <span className="text-slate-500">Storage Bin:</span>
                <span className="font-mono font-bold text-emerald-900">{showDetailsModal.location}</span>
              </div>
              <div className="flex justify-between py-1 border-b">
                <span className="text-slate-500">Base Unit Delta:</span>
                <span className="font-mono font-black">{showDetailsModal.baseQtyChange} {showDetailsModal.baseUnit}</span>
              </div>
              <div className="flex justify-between py-1 border-b">
                <span className="text-slate-500">Packaging (Gatta) Delta:</span>
                <span className="font-bold">{showDetailsModal.packsChange}</span>
              </div>
              <div className="flex justify-between py-1 border-b">
                <span className="text-slate-500">Reason:</span>
                <span>{showDetailsModal.reason}</span>
              </div>
              <div className="flex justify-between py-1 border-b">
                <span className="text-slate-500">Adjusted By:</span>
                <span>{showDetailsModal.adjustedBy}</span>
              </div>
              <div className="py-1">
                <span className="text-slate-500 block mb-0.5">Remarks:</span>
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
