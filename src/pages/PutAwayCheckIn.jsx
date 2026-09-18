import { useState, useMemo } from 'react'
import { Link } from 'react-router-dom'
import {
  Wand2,
  Check,
  Package,
  Printer,
  Download,
  Clock,
  X,
  Upload,
  QrCode,
  Warehouse,
  FlaskConical,
  CheckCircle2,
  AlertCircle,
  Layers,
  ArrowRight,
} from 'lucide-react'

export default function PutAwayCheckIn() {
  // Toast state
  const [toastMessage, setToastMessage] = useState(null)
  const triggerToast = (msg) => {
    setToastMessage(msg)
  }

  // Active Tab
  const [activeTab, setActiveTab] = useState('Pending Put-Away')

  // Search query
  const [searchQuery, setSearchQuery] = useState('')
  const [filterModalOpen, setFilterModalOpen] = useState(false)

  // 6 Dedicated Shades Reference
  const SHADES = [
    { id: 'SH01', name: 'Shade 1: Grains & Bulk Pulses', category: 'Grains & Pulses' },
    { id: 'SH02', name: 'Shade 2: Edible Oils & Liquids', category: 'Edible Oils' },
    { id: 'SH03', name: 'Shade 3: Packaged Food & FMCG', category: 'Packaged FMCG' },
    { id: 'SH04', name: 'Shade 4: Packaging Cartons & Bags', category: 'Packaging Materials' },
    { id: 'SH05', name: 'Shade 5: Chemicals & Hygiene', category: 'Chemicals & Hygiene' },
    { id: 'SH06', name: 'Shade 6: Spares & General Goods', category: 'Spares & General' },
  ]

  // Form State: 6 Shades, Row, Col & Base Unit computation
  const [formGRN, setFormGRN] = useState('GRN-2026-FMCG-01')
  const [formProduct, setFormProduct] = useState('Parle-G Glucose Biscuits (50g)')
  const [formBatch, setFormBatch] = useState('BT-2026-FMCG-01')
  const [formPackUnit, setFormPackUnit] = useState('Gatta / Carton')
  const [formBaseUnit, setFormBaseUnit] = useState('Pieces')
  const [formUnitsPerPack, setFormUnitsPerPack] = useState(6) // 1 Gatta = 6 Biscuits
  const [formPacksCount, setFormPacksCount] = useState(100) // 100 Gatta
  const [formSelectedShade, setFormSelectedShade] = useState('SH03')
  const [formSelectedRow, setFormSelectedRow] = useState('R02')
  const [formSelectedCol, setFormSelectedCol] = useState('C04')
  const [formRemarks, setFormRemarks] = useState('Received from gate truck in sealed condition.')

  // Derived Base Quantity
  const baseQuantityComputed = useMemo(() => {
    return (Number(formPacksCount) || 0) * (Number(formUnitsPerPack) || 1)
  }, [formPacksCount, formUnitsPerPack])

  // Derived Target Location Code
  const formLocationCode = useMemo(() => {
    return `${formSelectedShade}-${formSelectedRow}-${formSelectedCol}`
  }, [formSelectedShade, formSelectedRow, formSelectedCol])

  // Modals
  const [showQrLabelModal, setShowQrLabelModal] = useState(false)
  const [printedLabelData, setPrintedLabelData] = useState(null)
  const [showBulkModal, setShowBulkModal] = useState(false)

  // Put-Away Queue Table Data (Civilian commodities, Base Units & Gatta tracking)
  const [queueItems, setQueueItems] = useState([
    {
      id: 1,
      grnNo: 'GRN-2026-001',
      productName: 'Parle-G Glucose Biscuits (50g)',
      batchNo: 'BT-2026-001',
      packUnit: 'Gatta',
      packsCount: 100,
      unitsPerPack: 6,
      quantity: 600, // 100 Gatta @ 6 pcs = 600 Biscuits (Base unit)
      uom: 'Pieces',
      shadeId: 'SH03',
      recommendedLocation: 'SH03-R02-C04',
      receivedOn: '18 Sep 2026',
      priority: 'High',
      priorityClass: 'bg-rose-100 text-rose-800 border-rose-200',
      status: 'Pending',
      statusClass: 'bg-amber-100 text-amber-800 border-amber-200',
      labStatus: 'Pending Lab Test',
    },
    {
      id: 2,
      grnNo: 'GRN-2026-001',
      productName: 'Good Day Butter Cookies (75g)',
      batchNo: 'BT-2026-002',
      packUnit: 'Gatta',
      packsCount: 50,
      unitsPerPack: 12,
      quantity: 600,
      uom: 'Pieces',
      shadeId: 'SH03',
      recommendedLocation: 'SH03-R02-C05',
      receivedOn: '18 Sep 2026',
      priority: 'Medium',
      priorityClass: 'bg-amber-100 text-amber-800 border-amber-200',
      status: 'Pending',
      statusClass: 'bg-amber-100 text-amber-800 border-amber-200',
      labStatus: 'Pending Lab Test',
    },
    {
      id: 3,
      grnNo: 'GRN-2026-002',
      productName: 'Sharbati Wheat Grain (Grade A)',
      batchNo: 'BT-2026-003',
      packUnit: 'Bags',
      packsCount: 30,
      unitsPerPack: 50,
      quantity: 1500,
      uom: 'Kg',
      shadeId: 'SH01',
      recommendedLocation: 'SH01-R01-C02',
      receivedOn: '17 Sep 2026',
      priority: 'High',
      priorityClass: 'bg-rose-100 text-rose-800 border-rose-200',
      status: 'Pending',
      statusClass: 'bg-amber-100 text-amber-800 border-amber-200',
      labStatus: 'Pending Lab Test',
    },
    {
      id: 4,
      grnNo: 'GRN-2026-002',
      productName: 'Fortune Refined Mustard Oil (15L)',
      batchNo: 'BT-2026-004',
      packUnit: 'Tins',
      packsCount: 20,
      unitsPerPack: 15,
      quantity: 300,
      uom: 'Ltr',
      shadeId: 'SH02',
      recommendedLocation: 'SH02-R01-C03',
      receivedOn: '17 Sep 2026',
      priority: 'Medium',
      priorityClass: 'bg-amber-100 text-amber-800 border-amber-200',
      status: 'Pending',
      statusClass: 'bg-amber-100 text-amber-800 border-amber-200',
      labStatus: 'Pending Lab Test',
    },
    {
      id: 5,
      grnNo: 'GRN-2026-003',
      productName: 'Maggi 2-Minute Noodles (70g)',
      batchNo: 'BT-2026-005',
      packUnit: 'Carton',
      packsCount: 25,
      unitsPerPack: 24,
      quantity: 600,
      uom: 'Packets',
      shadeId: 'SH03',
      recommendedLocation: 'SH03-R03-C01',
      receivedOn: '16 Sep 2026',
      priority: 'Low',
      priorityClass: 'bg-emerald-100 text-emerald-800 border-emerald-200',
      status: 'Pending',
      statusClass: 'bg-amber-100 text-amber-800 border-amber-200',
      labStatus: 'Pending Lab Test',
    },
    {
      id: 6,
      grnNo: 'GRN-2026-004',
      productName: 'Corrugated Shipping Cartons (5-Ply)',
      batchNo: 'BT-2026-006',
      packUnit: 'Bundles',
      packsCount: 20,
      unitsPerPack: 50,
      quantity: 1000,
      uom: 'Nos',
      shadeId: 'SH04',
      recommendedLocation: 'SH04-R01-C01',
      receivedOn: '16 Sep 2026',
      priority: 'Low',
      priorityClass: 'bg-emerald-100 text-emerald-800 border-emerald-200',
      status: 'Pending',
      statusClass: 'bg-amber-100 text-amber-800 border-amber-200',
      labStatus: 'Passed (No Lab Needed)',
    },
  ])

  // Filtered Queue
  const filteredQueue = useMemo(() => {
    return queueItems.filter((item) => {
      if (activeTab === 'Pending Put-Away' && item.status !== 'Pending') return false
      if (activeTab === 'Completed' && item.status !== 'Completed') return false
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase()
        return (
          item.grnNo.toLowerCase().includes(q) ||
          item.productName.toLowerCase().includes(q) ||
          item.batchNo.toLowerCase().includes(q) ||
          item.recommendedLocation.toLowerCase().includes(q)
        )
      }
      return true
    })
  }, [queueItems, activeTab, searchQuery])

  // Load Queue Item into Form
  const handleLoadQueueItem = (item) => {
    setFormGRN(item.grnNo)
    setFormProduct(item.productName)
    setFormBatch(item.batchNo)
    setFormPackUnit(item.packUnit)
    setFormBaseUnit(item.uom)
    setFormUnitsPerPack(item.unitsPerPack)
    setFormPacksCount(item.packsCount)

    // Pre-fill shade, row, col
    if (item.recommendedLocation) {
      const parts = item.recommendedLocation.split('-')
      if (parts.length === 3) {
        setFormSelectedShade(parts[0])
        setFormSelectedRow(parts[1])
        setFormSelectedCol(parts[2])
      }
    }

    triggerToast(`Loaded ${item.productName} (${item.quantity} ${item.uom}) into Check-In form.`)
  }

  // Confirm Put-Away & Check-In
  const handleConfirmPutAway = (e) => {
    e.preventDefault()
    if (!formGRN || !formProduct || !formLocationCode) {
      triggerToast('Please complete required fields.')
      return
    }

    // Mark completed in queue
    setQueueItems((prev) =>
      prev.map((i) =>
        i.batchNo === formBatch
          ? {
              ...i,
              status: 'Completed',
              statusClass: 'bg-emerald-100 text-emerald-800 border-emerald-200',
              recommendedLocation: formLocationCode,
              labStatus: 'Pending Lab Test',
            }
          : i
      )
    )

    // Create Label data for physical sticker
    const labelData = {
      grnNo: formGRN,
      productName: formProduct,
      batchNo: formBatch,
      baseQuantity: baseQuantityComputed,
      baseUnit: formBaseUnit,
      packsCount: formPacksCount,
      packUnit: formPackUnit,
      unitsPerPack: formUnitsPerPack,
      locationCode: formLocationCode,
      shadeName: SHADES.find((s) => s.id === formSelectedShade)?.name || formSelectedShade,
      row: formSelectedRow,
      col: formSelectedCol,
      labStatus: 'Pending Lab Test',
      checkInTime: new Date().toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' }),
    }

    setPrintedLabelData(labelData)
    setShowQrLabelModal(true)

    triggerToast(
      `Put-Away confirmed! Allocated to ${formLocationCode}. Lab test status set to PENDING.`
    )
  }

  return (
    <div className="space-y-4 pb-12">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-5 right-5 z-50 bg-[#162214] border border-amber-400 text-amber-300 px-4 py-2.5 rounded-lg shadow-2xl flex items-center gap-2 text-xs font-medium animate-bounce">
          <CheckCircle2 className="w-4 h-4 text-amber-400 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Top Banner (Preserved) */}
      <div className="relative rounded-xl overflow-hidden shadow-md border border-slate-200/80 bg-slate-900 h-28 sm:h-32">
        <img
          src="/border.png"
          alt="Warehouse Put-Away Operations"
          className="w-full h-full object-cover object-center opacity-90"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-black/55 via-black/25 to-black/65"></div>
        <div className="absolute top-3 right-4 flex items-center gap-2 bg-black/40 backdrop-blur-md px-3 py-1 rounded-full border border-white/20">
          <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
          <span className="text-[10px] font-bold text-white tracking-widest uppercase">
            PUT-AWAY &amp; LAB TESTING ACTIVE
          </span>
        </div>
      </div>

      {/* Page Header Bar */}
      <div className="bg-white rounded-xl p-4 sm:p-5 shadow-xs border border-slate-200/80 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-xl bg-[#1E3A1E] text-white flex items-center justify-center shadow-xs shrink-0">
            <Warehouse className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-black text-slate-800 tracking-tight flex items-center gap-2">
              <span>Put-Away / Check-In (6 Shades Grid Allocation)</span>
            </h1>
            <p className="text-xs text-slate-500 font-medium">
              Allocate received gate items into Shade ➔ Row ➔ Column bins in base product units and print physical Gatta QR labels.
            </p>
          </div>
        </div>

        <div className="text-xs text-slate-400 flex items-center gap-1.5 font-medium mr-2">
          <Link to="/dashboard" className="hover:text-slate-700">Home</Link>
          <span>›</span>
          <span className="text-slate-500">Warehouse Management</span>
          <span>›</span>
          <span className="text-slate-800 font-semibold">Put-Away / Check-In</span>
        </div>
      </div>

      {/* 4 Summary Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl p-4 shadow-xs border border-slate-200 flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-xl bg-blue-500 text-white flex items-center justify-center shrink-0 shadow-xs">
            <Package className="w-6 h-6" />
          </div>
          <div>
            <p className="text-[11px] font-semibold text-slate-500">Pending Put-Away</p>
            <h3 className="text-2xl font-black text-slate-800 leading-tight">6 GRNs</h3>
            <p className="text-[10px] text-slate-400 font-medium">From Gate Truck Unloading</p>
          </div>
        </div>

        <div className="bg-white rounded-xl p-4 shadow-xs border border-slate-200 flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-xl bg-amber-500 text-white flex items-center justify-center shrink-0 shadow-xs">
            <FlaskConical className="w-6 h-6" />
          </div>
          <div>
            <p className="text-[11px] font-semibold text-slate-500">Sent to Lab Test</p>
            <h3 className="text-2xl font-black text-slate-800 leading-tight">5 Batches</h3>
            <p className="text-[10px] text-amber-700 font-medium">Under Testing / Pending</p>
          </div>
        </div>

        <div className="bg-white rounded-xl p-4 shadow-xs border border-slate-200 flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-xl bg-emerald-600 text-white flex items-center justify-center shrink-0 shadow-xs">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <div>
            <p className="text-[11px] font-semibold text-slate-500">Allocated Bins Today</p>
            <h3 className="text-2xl font-black text-slate-800 leading-tight">86 Bins</h3>
            <p className="text-[10px] text-emerald-700 font-medium">Across 6 Shades</p>
          </div>
        </div>

        <div className="bg-white rounded-xl p-4 shadow-xs border border-slate-200 flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-xl bg-[#1E3A1E] text-white flex items-center justify-center shrink-0 shadow-xs">
            <QrCode className="w-6 h-6" />
          </div>
          <div>
            <p className="text-[11px] font-semibold text-slate-500">Base Unit Principle</p>
            <h3 className="text-sm font-black text-slate-800 leading-tight">1 Gatta = 6 Pcs</h3>
            <p className="text-[10px] text-slate-400 font-medium">Calculates Minimum Units</p>
          </div>
        </div>
      </div>

      {/* Main Screen Layout: Form & Preview on Top/Side + Queue Table Below */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-start">
        {/* ========================================================================= */}
        {/* PUT-AWAY CHECK-IN FORM (Span 7 / 12)                                      */}
        {/* ========================================================================= */}
        <div className="lg:col-span-7 bg-white rounded-xl p-4 sm:p-5 shadow-xs border border-slate-200 space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100">
            <h2 className="text-sm font-black text-slate-800 flex items-center gap-2">
              <Warehouse className="w-4 h-4 text-emerald-700" />
              <span>Put-Away Check-In &amp; Grid Allocation Form</span>
            </h2>
            <span className="text-[11px] font-bold text-amber-700 bg-amber-50 px-2.5 py-0.5 rounded-full border border-amber-200">
              Lab Status: Auto Pending
            </span>
          </div>

          <form onSubmit={handleConfirmPutAway} className="space-y-3.5 text-xs">
            {/* Row 1: GRN and Product */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">
                  GRN No. <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={formGRN}
                  onChange={(e) => setFormGRN(e.target.value)}
                  placeholder="e.g. GRN-2026-FMCG-01"
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs font-mono font-bold focus:outline-none focus:bg-white focus:ring-1 focus:ring-emerald-600"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">
                  Batch No. <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={formBatch}
                  onChange={(e) => setFormBatch(e.target.value)}
                  placeholder="e.g. BT-2026-001"
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs font-mono focus:outline-none focus:bg-white focus:ring-1 focus:ring-emerald-600"
                />
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-700 mb-1">
                Commodity / Product Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                value={formProduct}
                onChange={(e) => setFormProduct(e.target.value)}
                placeholder="e.g. Parle-G Glucose Biscuits (50g)"
                className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs font-bold text-slate-900 focus:outline-none focus:bg-white focus:ring-1 focus:ring-emerald-600"
              />
            </div>

            {/* Base Unit vs Gatta Breakdown Calculation Card */}
            <div className="p-3.5 bg-emerald-50/60 border border-emerald-200 rounded-xl space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-emerald-900 flex items-center gap-1.5">
                  <Package className="w-3.5 h-3.5 text-emerald-700" />
                  <span>Base Unit Inventory Calculator</span>
                </span>
                <span className="text-[10px] font-semibold text-emerald-800">
                  Minimum Unit Rule Active
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                <div>
                  <label className="block text-[10px] font-bold text-slate-600 mb-1">
                    Gatta / Pack Count
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={formPacksCount}
                    onChange={(e) => setFormPacksCount(Number(e.target.value))}
                    className="w-full bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs font-mono font-bold"
                  />
                  <span className="text-[9px] text-slate-500">e.g. 100 Gatta</span>
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-600 mb-1">
                    Pieces Per Gatta / Pack
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={formUnitsPerPack}
                    onChange={(e) => setFormUnitsPerPack(Number(e.target.value))}
                    className="w-full bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs font-mono font-bold"
                  />
                  <span className="text-[9px] text-slate-500">e.g. 6 Biscuits / Gatta</span>
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-600 mb-1">
                    Base Unit Type
                  </label>
                  <input
                    type="text"
                    value={formBaseUnit}
                    onChange={(e) => setFormBaseUnit(e.target.value)}
                    placeholder="Pieces / Kg / Ltr"
                    className="w-full bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs font-bold"
                  />
                  <span className="text-[9px] text-slate-500">GRN stock unit</span>
                </div>
              </div>

              {/* Live Computed Minimum Quantity Banner */}
              <div className="p-2 bg-white rounded-lg border border-emerald-300 flex items-center justify-between text-xs">
                <span className="text-slate-600 font-semibold">
                  Total Minimum Quantity Recorded:
                </span>
                <span className="font-black font-mono text-emerald-900 text-sm">
                  {baseQuantityComputed.toLocaleString()} {formBaseUnit}
                </span>
              </div>
            </div>

            {/* Grid Allocation: Shade -> Row -> Column */}
            <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-2.5">
              <span className="text-[11px] font-bold text-slate-800 flex items-center gap-1.5">
                <Layers className="w-3.5 h-3.5 text-slate-600" />
                <span>Target Storage Bin Selection (6 Shades Architecture)</span>
              </span>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                <div>
                  <label className="block text-[10px] font-bold text-slate-600 mb-1">
                    Select Shade <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={formSelectedShade}
                    onChange={(e) => setFormSelectedShade(e.target.value)}
                    className="w-full bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs font-bold text-slate-800"
                  >
                    {SHADES.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-600 mb-1">
                    Select Row (1 to 8) <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={formSelectedRow}
                    onChange={(e) => setFormSelectedRow(e.target.value)}
                    className="w-full bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs font-mono font-bold"
                  >
                    {Array.from({ length: 8 }, (_, i) => (
                      <option key={i} value={`R0${i + 1}`}>
                        Row 0{i + 1}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-600 mb-1">
                    Select Column (1 to 10) <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={formSelectedCol}
                    onChange={(e) => setFormSelectedCol(e.target.value)}
                    className="w-full bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs font-mono font-bold"
                  >
                    {Array.from({ length: 10 }, (_, i) => (
                      <option key={i} value={i + 1 < 10 ? `C0${i + 1}` : `C${i + 1}`}>
                        Column {i + 1 < 10 ? `0${i + 1}` : i + 1}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="flex items-center justify-between text-[11px] pt-1 border-t border-slate-200">
                <span className="text-slate-500">Allocated Bin Code:</span>
                <span className="font-mono font-black text-emerald-900 bg-emerald-100 px-2 py-0.5 rounded">
                  {formLocationCode}
                </span>
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-700 mb-1">Remarks</label>
              <textarea
                rows={2}
                value={formRemarks}
                onChange={(e) => setFormRemarks(e.target.value)}
                placeholder="Gate entry check, truck condition, seals..."
                className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-xs focus:outline-none focus:bg-white resize-none"
              ></textarea>
            </div>

            <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
              <div className="text-[10px] text-amber-700 font-semibold flex items-center gap-1">
                <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                <span>Auto marks product as &ldquo;Pending Lab Test&rdquo; on check-in</span>
              </div>

              <button
                type="submit"
                className="px-5 py-2 bg-[#1F331E] hover:bg-[#2A4428] text-white rounded-lg text-xs font-bold shadow-xs flex items-center gap-1.5 cursor-pointer transition"
              >
                <Check className="w-4 h-4" />
                <span>Confirm Put-Away &amp; Print QR</span>
              </button>
            </div>
          </form>
        </div>

        {/* ========================================================================= */}
        {/* LIVE LOCATION & QR STICKER PREVIEW CARD (Span 5 / 12)                     */}
        {/* ========================================================================= */}
        <div className="lg:col-span-5 bg-white rounded-xl p-4 sm:p-5 shadow-xs border border-slate-200 flex flex-col justify-between space-y-4">
          <div>
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <QrCode className="w-4 h-4 text-emerald-700" />
                <h2 className="text-xs font-bold text-slate-800">Gatta Physical QR Sticker Preview</h2>
              </div>
              <span className="text-[10px] font-bold px-2 py-0.5 bg-emerald-100 text-emerald-800 rounded-full">
                Live Preview
              </span>
            </div>

            <p className="text-[11px] text-slate-500 mt-2">
              This QR label is printed and stuck onto the physical cartons/Gatta after put-away. It encodes the base quantity and bin location.
            </p>

            {/* Sticker Graphic Container */}
            <div className="mt-3 border-2 border-slate-800 rounded-xl p-4 bg-slate-50 space-y-3 shadow-xs">
              <div className="flex items-center justify-between text-[10px] font-bold text-slate-700 border-b border-slate-300 pb-1">
                <span>CENTRAL WAREHOUSE LOGISTICS</span>
                <span className="text-emerald-800 font-mono">{formSelectedShade}</span>
              </div>

              <div className="text-center space-y-1">
                <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">
                  BIN LOCATION
                </span>
                <h3 className="text-xl font-black font-mono text-slate-900">{formLocationCode}</h3>
                <p className="text-[11px] font-bold text-slate-800 truncate">
                  {formProduct || 'Product Name'}
                </p>
                <p className="text-[10px] text-slate-500 font-mono">
                  Batch: {formBatch} • GRN: {formGRN}
                </p>
              </div>

              {/* QR Simulation */}
              <div className="w-28 h-28 bg-white p-2 mx-auto rounded border border-slate-300 flex items-center justify-center">
                <svg className="w-full h-full text-slate-900" viewBox="0 0 100 100" fill="currentColor">
                  <rect x="0" y="0" width="28" height="28" />
                  <rect x="4" y="4" width="20" height="20" fill="white" />
                  <rect x="8" y="8" width="12" height="12" />
                  <rect x="72" y="0" width="28" height="28" />
                  <rect x="76" y="4" width="20" height="20" fill="white" />
                  <rect x="80" y="8" width="12" height="12" />
                  <rect x="0" y="72" width="28" height="28" />
                  <rect x="4" y="76" width="20" height="20" fill="white" />
                  <rect x="8" y="80" width="12" height="12" />
                  <rect x="36" y="6" width="8" height="8" />
                  <rect x="52" y="6" width="8" height="8" />
                  <rect x="36" y="24" width="8" height="8" />
                  <rect x="6" y="36" width="8" height="8" />
                  <rect x="24" y="36" width="8" height="8" />
                  <rect x="42" y="36" width="8" height="8" />
                  <rect x="60" y="36" width="8" height="8" />
                  <rect x="78" y="36" width="8" height="8" />
                  <rect x="36" y="54" width="8" height="8" />
                  <rect x="54" y="54" width="8" height="8" />
                  <rect x="72" y="54" width="8" height="8" />
                  <rect x="36" y="72" width="8" height="8" />
                  <rect x="54" y="72" width="8" height="8" />
                  <rect x="72" y="72" width="8" height="8" />
                </svg>
              </div>

              {/* Minimum quantity & lab details */}
              <div className="text-[10px] text-slate-600 border-t border-slate-200 pt-2 space-y-0.5">
                <div className="flex items-center justify-between font-bold text-slate-800">
                  <span>Base Unit Quantity:</span>
                  <span className="font-mono text-emerald-900">
                    {baseQuantityComputed.toLocaleString()} {formBaseUnit}
                  </span>
                </div>
                <div className="flex items-center justify-between text-slate-500">
                  <span>Packaging:</span>
                  <span>
                    {formPacksCount} {formPackUnit} (@ {formUnitsPerPack} {formBaseUnit}/pack)
                  </span>
                </div>
                <div className="flex items-center justify-between pt-1 border-t border-slate-200">
                  <span>Lab Testing Status:</span>
                  <span className="font-bold text-amber-700 bg-amber-100 px-1.5 py-0.2 rounded">
                    Pending Lab Test
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="pt-2 flex items-center justify-between">
            <Link
              to="/lab-reports"
              className="text-xs font-bold text-emerald-800 hover:underline flex items-center gap-1"
            >
              <span>View Lab Reports Queue</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>

            <button
              type="button"
              onClick={() => {
                setPrintedLabelData({
                  grnNo: formGRN,
                  productName: formProduct,
                  batchNo: formBatch,
                  baseQuantity: baseQuantityComputed,
                  baseUnit: formBaseUnit,
                  packsCount: formPacksCount,
                  packUnit: formPackUnit,
                  unitsPerPack: formUnitsPerPack,
                  locationCode: formLocationCode,
                  shadeName: SHADES.find((s) => s.id === formSelectedShade)?.name || formSelectedShade,
                  row: formSelectedRow,
                  col: formSelectedCol,
                  labStatus: 'Pending Lab Test',
                  checkInTime: new Date().toLocaleString(),
                })
                setShowQrLabelModal(true)
              }}
              className="bg-slate-100 hover:bg-slate-200 text-slate-700 px-3.5 py-2 rounded-lg text-xs font-bold flex items-center gap-1.5 transition cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print Sticker</span>
            </button>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* PUT-AWAY QUEUE TABLE                                                      */}
      {/* ========================================================================= */}
      <div className="bg-white rounded-xl shadow-xs border border-slate-200 overflow-hidden flex flex-col">
        <div className="p-4 border-b border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Package className="w-4 h-4 text-emerald-700" />
            <h2 className="text-sm font-bold text-slate-800">
              Gate Inward Put-Away Queue ({filteredQueue.length} Items)
            </h2>
          </div>

          <div className="flex items-center gap-2">
            <div className="relative w-64">
              <input
                type="text"
                placeholder="Search queue..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-lg pl-8 pr-3 py-1.5 text-xs text-slate-800 placeholder-slate-400 focus:outline-none"
              />
              <span className="absolute left-2.5 top-2 text-slate-400 text-xs">🔍</span>
            </div>
          </div>
        </div>

        {/* Table */}
        <div
          className="overflow-x-auto no-scrollbar scroll-smooth w-full"
          style={{
            scrollbarWidth: 'none',
            msOverflowStyle: 'none',
            WebkitOverflowScrolling: 'touch',
          }}
        >
          <table
            className="w-full text-left text-xs divide-y divide-slate-200 border-collapse table-nowrap"
            style={{ minWidth: '1050px' }}
          >
            <thead className="bg-slate-50 text-slate-600 font-bold uppercase tracking-wider text-[11px]">
              <tr>
                <th className="py-3 px-3 w-10 text-center">#</th>
                <th className="py-3 px-4 min-w-[120px]">GRN No.</th>
                <th className="py-3 px-4 min-w-[200px]">Product &amp; Batch</th>
                <th className="py-3 px-4 min-w-[140px] text-right">Base Quantity</th>
                <th className="py-3 px-4 min-w-[160px] text-right">Packaging (Gatta)</th>
                <th className="py-3 px-4 min-w-[130px]">Target Bin</th>
                <th className="py-3 px-4 text-center min-w-[120px]">Lab Status</th>
                <th className="py-3 px-4 text-center min-w-[100px]">Status</th>
                <th className="py-3 px-3 text-center w-28">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 bg-white">
              {filteredQueue.map((item, idx) => (
                <tr key={item.id} className="hover:bg-emerald-50/40 transition">
                  <td className="py-3 px-3 text-center text-slate-400 font-bold">{idx + 1}</td>
                  <td className="py-3 px-4 font-mono font-bold text-slate-900">{item.grnNo}</td>
                  <td className="py-3 px-4 text-slate-800">
                    <div className="font-bold text-slate-900">{item.productName}</div>
                    <div className="text-[10px] text-slate-500 font-mono">
                      Batch: {item.batchNo} • Recd: {item.receivedOn}
                    </div>
                  </td>
                  <td className="py-3 px-4 text-right font-mono font-black text-slate-900">
                    {item.quantity.toLocaleString()} {item.uom}
                  </td>
                  <td className="py-3 px-4 text-right text-slate-700">
                    <span className="font-bold text-emerald-800">
                      {item.packsCount} {item.packUnit}
                    </span>
                    <div className="text-[10px] text-slate-400 font-medium">
                      @ {item.unitsPerPack} {item.uom}/pack
                    </div>
                  </td>
                  <td className="py-3 px-4 font-mono font-bold text-slate-800">
                    <span className="bg-slate-100 border border-slate-200 px-2 py-0.5 rounded">
                      {item.recommendedLocation}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-center">
                    <span
                      className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                        item.labStatus === 'Pending Lab Test'
                          ? 'bg-amber-100 text-amber-800'
                          : 'bg-emerald-100 text-emerald-800'
                      }`}
                    >
                      {item.labStatus}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-center">
                    <span
                      className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${item.statusClass}`}
                    >
                      {item.status}
                    </span>
                  </td>
                  <td className="py-3 px-3 text-center">
                    <button
                      type="button"
                      onClick={() => handleLoadQueueItem(item)}
                      className="px-2.5 py-1.5 bg-[#1F331E] hover:bg-[#2A4428] text-white rounded-lg font-bold text-[11px] transition shadow-xs cursor-pointer"
                    >
                      Allocate
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* MODAL: Printable Gatta QR Sticker Tag                                      */}
      {/* ========================================================================= */}
      {showQrLabelModal && printedLabelData && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-sm w-full p-5 shadow-2xl border border-slate-200 text-center space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <h3 className="font-black text-slate-800 text-sm flex items-center gap-1.5">
                <QrCode className="w-4 h-4 text-emerald-700" />
                <span>Print Physical Gatta QR Sticker</span>
              </h3>
              <button
                type="button"
                onClick={() => setShowQrLabelModal(false)}
                className="text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Printable Carton Sticker */}
            <div className="border-2 border-dashed border-slate-800 rounded-xl p-4 bg-slate-50 space-y-3">
              <div className="flex items-center justify-between text-[10px] font-bold text-slate-700 pb-1 border-b border-slate-200">
                <span>GATE CHECK-IN LABEL</span>
                <span className="text-emerald-800 font-mono">{printedLabelData.locationCode}</span>
              </div>

              <div>
                <h4 className="text-base font-black text-slate-900 leading-tight">
                  {printedLabelData.productName}
                </h4>
                <p className="text-[10px] text-slate-500 font-mono mt-0.5">
                  GRN: {printedLabelData.grnNo} • BATCH: {printedLabelData.batchNo}
                </p>
              </div>

              {/* QR Code */}
              <div className="w-32 h-32 bg-white p-2 mx-auto rounded border border-slate-300 flex items-center justify-center">
                <svg className="w-full h-full text-slate-900" viewBox="0 0 100 100" fill="currentColor">
                  <rect x="0" y="0" width="28" height="28" />
                  <rect x="4" y="4" width="20" height="20" fill="white" />
                  <rect x="8" y="8" width="12" height="12" />
                  <rect x="72" y="0" width="28" height="28" />
                  <rect x="76" y="4" width="20" height="20" fill="white" />
                  <rect x="80" y="8" width="12" height="12" />
                  <rect x="0" y="72" width="28" height="28" />
                  <rect x="4" y="76" width="20" height="20" fill="white" />
                  <rect x="8" y="80" width="12" height="12" />
                  <rect x="36" y="6" width="8" height="8" />
                  <rect x="52" y="6" width="8" height="8" />
                  <rect x="36" y="24" width="8" height="8" />
                  <rect x="6" y="36" width="8" height="8" />
                  <rect x="24" y="36" width="8" height="8" />
                  <rect x="42" y="36" width="8" height="8" />
                  <rect x="60" y="36" width="8" height="8" />
                  <rect x="78" y="36" width="8" height="8" />
                  <rect x="36" y="54" width="8" height="8" />
                  <rect x="54" y="54" width="8" height="8" />
                  <rect x="72" y="54" width="8" height="8" />
                  <rect x="36" y="72" width="8" height="8" />
                  <rect x="54" y="72" width="8" height="8" />
                  <rect x="72" y="72" width="8" height="8" />
                </svg>
              </div>

              <div className="text-[10px] text-slate-700 border-t border-slate-200 pt-2 space-y-1 text-left">
                <div className="flex justify-between">
                  <span className="font-semibold">Base Quantity:</span>
                  <span className="font-black font-mono text-emerald-900">
                    {printedLabelData.baseQuantity.toLocaleString()} {printedLabelData.baseUnit}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="font-semibold">Gatta Breakdown:</span>
                  <span>
                    {printedLabelData.packsCount} {printedLabelData.packUnit} (@ {printedLabelData.unitsPerPack} {printedLabelData.baseUnit})
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="font-semibold">Storage Bin:</span>
                  <span className="font-mono font-bold text-slate-800">
                    {printedLabelData.locationCode} ({printedLabelData.shadeName})
                  </span>
                </div>
                <div className="flex justify-between items-center pt-1 border-t border-slate-200">
                  <span className="font-semibold">Lab Status:</span>
                  <span className="font-bold text-amber-800 bg-amber-100 px-2 py-0.5 rounded text-[9px]">
                    {printedLabelData.labStatus}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowQrLabelModal(false)}
                className="px-3.5 py-1.5 border border-slate-300 rounded-lg text-xs font-semibold cursor-pointer"
              >
                Close
              </button>
              <button
                type="button"
                onClick={() => {
                  window.print()
                  setShowQrLabelModal(false)
                }}
                className="px-5 py-1.5 bg-[#1F331E] hover:bg-[#2A4428] text-white rounded-lg text-xs font-bold cursor-pointer shadow-xs"
              >
                Print Sticker
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
