import { useState, useMemo, useRef, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { printSpecificElement } from '../utils/printHelper'
import {
  Wand2,
  Check,
  Package,
  Printer,
  Download,
  Clock,
  X,
  QrCode,
  Warehouse,
  FlaskConical,
  CheckCircle2,
  AlertCircle,
  Layers,
  ArrowRight,
  Search,
  RotateCcw,
  SlidersHorizontal,
  ChevronDown,
  Sparkles,
  MapPin,
  Plus,
} from 'lucide-react'

// Custom Accessible Select Dropdown to eliminate Windows Chromium native black flicker
function CustomSelect({ value, onChange, options, placeholder = 'Select option...', className = '', zIndexClass = 'z-50' }) {
  const [isOpen, setIsOpen] = useState(false)
  const dropdownRef = useRef(null)

  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const selectedOption = options.find((opt) => opt.value === value)

  return (
    <div className={`relative ${className}`} ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full bg-slate-50 hover:bg-slate-100/80 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-left font-medium text-slate-800 flex items-center justify-between transition focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
      >
        <span className="truncate">{selectedOption ? selectedOption.label : placeholder}</span>
        <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform duration-200 shrink-0 ml-2 ${isOpen ? 'rotate-180 text-indigo-600' : ''}`} />
      </button>

      {isOpen && (
        <div className={`absolute left-0 right-0 mt-1.5 bg-white border border-slate-200 rounded-xl shadow-xl py-1.5 ${zIndexClass} max-h-56 overflow-y-auto`}>
          {options.map((opt) => {
            const isSelected = opt.value === value
            return (
              <button
                key={opt.value}
                type="button"
                onClick={() => {
                  onChange(opt.value)
                  setIsOpen(false)
                }}
                className={`w-full px-3.5 py-2 text-xs text-left flex items-center justify-between transition ${
                  isSelected
                    ? 'bg-indigo-50 text-indigo-700 font-semibold'
                    : 'text-slate-700 hover:bg-slate-50'
                }`}
              >
                <div className="truncate">
                  <div className="truncate">{opt.label}</div>
                  {opt.sublabel && <div className="text-[10px] text-slate-400 font-normal">{opt.sublabel}</div>}
                </div>
                {isSelected && <Check className="w-3.5 h-3.5 text-indigo-600 shrink-0 ml-2" />}
              </button>
            )
          })}
        </div>
      )}
    </div>
  )
}

export default function PutAwayCheckIn() {
  // Toast state
  const [toastMessage, setToastMessage] = useState(null)
  const triggerToast = (msg) => {
    setToastMessage(msg)
    setTimeout(() => setToastMessage(null), 3200)
  }

  // Active Tab for Queue
  const [activeTab, setActiveTab] = useState('PENDING')
  const [searchQuery, setSearchQuery] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const perPage = 6

  // 6 Dedicated Shades Reference
  const SHADES = useMemo(() => [
    { id: 'SH01', name: 'Shade 1: Grains & Bulk Pulses', category: 'Grains & Pulses', defaultPack: 'Bags (50kg)', baseUnit: 'Kg', ratio: 50 },
    { id: 'SH02', name: 'Shade 2: Edible Oils & Liquids', category: 'Edible Oils', defaultPack: 'Tins (15L)', baseUnit: 'Ltr', ratio: 15 },
    { id: 'SH03', name: 'Shade 3: Packaged Food & FMCG', category: 'Packaged FMCG', defaultPack: 'Gatta / Carton', baseUnit: 'Pieces', ratio: 6 },
    { id: 'SH04', name: 'Shade 4: Packaging Cartons & Bags', category: 'Packaging Materials', defaultPack: 'Bundles (50 Pcs)', baseUnit: 'Nos', ratio: 50 },
    { id: 'SH05', name: 'Shade 5: Chemicals & Hygiene', category: 'Chemicals & Hygiene', defaultPack: 'Cans (5L)', baseUnit: 'Ltr', ratio: 5 },
    { id: 'SH06', name: 'Shade 6: Spares & General Hardware', category: 'Spares & General', defaultPack: 'Crates', baseUnit: 'Units', ratio: 1 },
  ], [])

  // Form State
  const [formGRN, setFormGRN] = useState('GRN-2026-001')
  const [formProduct, setFormProduct] = useState('Parle-G Glucose Biscuits (50g)')
  const [formBatch, setFormBatch] = useState('BT-2026-FMCG-01')
  const [formPackUnit, setFormPackUnit] = useState('Gatta / Carton')
  const [formBaseUnit, setFormBaseUnit] = useState('Pieces')
  const [formUnitsPerPack, setFormUnitsPerPack] = useState(6)
  const [formPacksCount, setFormPacksCount] = useState(100)
  const [formSelectedShade, setFormSelectedShade] = useState('SH03')
  const [formSelectedRow, setFormSelectedRow] = useState('R02')
  const [formSelectedCol, setFormSelectedCol] = useState('C04')
  const [formRemarks, setFormRemarks] = useState('Checked in from unloading dock in pristine sealed condition.')

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

  // Put-Away Staging Queue Table Data
  const [queueItems, setQueueItems] = useState([
    {
      id: 1,
      grnNo: 'GRN-2026-001',
      productName: 'Parle-G Glucose Biscuits (50g)',
      sku: 'PRD-FMCG-001',
      batchNo: 'BT-2026-001',
      packUnit: 'Gatta',
      packsCount: 100,
      unitsPerPack: 6,
      quantity: 600,
      uom: 'Pieces',
      shadeId: 'SH03',
      recommendedLocation: 'SH03-R02-C04',
      receivedOn: '21 Sep 2026',
      priority: 'High',
      status: 'Pending',
      labStatus: 'Pending Lab Test',
    },
    {
      id: 2,
      grnNo: 'GRN-2026-001',
      productName: 'Good Day Butter Cookies (75g)',
      sku: 'PRD-FMCG-002',
      batchNo: 'BT-2026-002',
      packUnit: 'Gatta',
      packsCount: 50,
      unitsPerPack: 12,
      quantity: 600,
      uom: 'Pieces',
      shadeId: 'SH03',
      recommendedLocation: 'SH03-R02-C05',
      receivedOn: '21 Sep 2026',
      priority: 'Medium',
      status: 'Pending',
      labStatus: 'Pending Lab Test',
    },
    {
      id: 3,
      grnNo: 'GRN-2026-002',
      productName: 'Sharbati Wheat Grain (Grade A)',
      sku: 'PRD-GRN-001',
      batchNo: 'BT-2026-003',
      packUnit: 'Bags',
      packsCount: 30,
      unitsPerPack: 50,
      quantity: 1500,
      uom: 'Kg',
      shadeId: 'SH01',
      recommendedLocation: 'SH01-R01-C02',
      receivedOn: '20 Sep 2026',
      priority: 'High',
      status: 'Pending',
      labStatus: 'Pending Lab Test',
    },
    {
      id: 4,
      grnNo: 'GRN-2026-002',
      productName: 'Refined Mustard Oil (15L Tin)',
      sku: 'PRD-OIL-002',
      batchNo: 'BT-2026-004',
      packUnit: 'Tins',
      packsCount: 20,
      unitsPerPack: 15,
      quantity: 300,
      uom: 'Ltr',
      shadeId: 'SH02',
      recommendedLocation: 'SH02-R01-C03',
      receivedOn: '20 Sep 2026',
      priority: 'Medium',
      status: 'Pending',
      labStatus: 'Pending Lab Test',
    },
    {
      id: 5,
      grnNo: 'GRN-2026-003',
      productName: 'Maggi 2-Minute Noodles (70g)',
      sku: 'PRD-FMCG-003',
      batchNo: 'BT-2026-005',
      packUnit: 'Carton',
      packsCount: 25,
      unitsPerPack: 24,
      quantity: 600,
      uom: 'Packets',
      shadeId: 'SH03',
      recommendedLocation: 'SH03-R03-C01',
      receivedOn: '19 Sep 2026',
      priority: 'Low',
      status: 'Completed',
      labStatus: 'Passed',
    },
    {
      id: 6,
      grnNo: 'GRN-2026-004',
      productName: 'Corrugated Shipping Cartons (5-Ply)',
      sku: 'PRD-BOX-007',
      batchNo: 'BT-2026-006',
      packUnit: 'Bundles',
      packsCount: 20,
      unitsPerPack: 50,
      quantity: 1000,
      uom: 'Nos',
      shadeId: 'SH04',
      recommendedLocation: 'SH04-R01-C01',
      receivedOn: '19 Sep 2026',
      priority: 'Low',
      status: 'Completed',
      labStatus: 'Passed (No Lab Needed)',
    },
  ])

  // Filtered Queue
  const filteredQueue = useMemo(() => {
    return queueItems.filter((item) => {
      if (activeTab === 'PENDING' && item.status !== 'Pending') return false
      if (activeTab === 'COMPLETED' && item.status !== 'Completed') return false
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

  // Pagination
  const totalPages = Math.max(1, Math.ceil(filteredQueue.length / perPage))
  const paginatedQueue = filteredQueue.slice((currentPage - 1) * perPage, currentPage * perPage)

  // Dynamic KPI Stats
  const stats = useMemo(() => {
    const pendingCount = queueItems.filter((i) => i.status === 'Pending').length
    const completedCount = queueItems.filter((i) => i.status === 'Completed').length
    const labPending = queueItems.filter((i) => i.labStatus.includes('Pending')).length
    const totalProcessedUnits = queueItems.reduce((acc, i) => acc + (Number(i.quantity) || 0), 0)
    return { pendingCount, completedCount, labPending, totalProcessedUnits }
  }, [queueItems])

  // Load Queue Item into Form
  const handleLoadQueueItem = (item) => {
    setFormGRN(item.grnNo)
    setFormProduct(item.productName)
    setFormBatch(item.batchNo)
    setFormPackUnit(item.packUnit)
    setFormBaseUnit(item.uom)
    setFormUnitsPerPack(item.unitsPerPack)
    setFormPacksCount(item.packsCount)

    if (item.recommendedLocation) {
      const parts = item.recommendedLocation.split('-')
      if (parts.length === 3) {
        setFormSelectedShade(parts[0])
        setFormSelectedRow(parts[1])
        setFormSelectedCol(parts[2])
      }
    }

    triggerToast(`Loaded "${item.productName}" into Put-Away Form.`)
  }

  // Confirm Put-Away & Check-In
  const handleConfirmPutAway = (e) => {
    e.preventDefault()
    if (!formGRN || !formProduct || !formLocationCode) {
      triggerToast('Please complete all required fields.')
      return
    }

    setQueueItems((prev) =>
      prev.map((i) =>
        i.batchNo === formBatch
          ? {
              ...i,
              status: 'Completed',
              recommendedLocation: formLocationCode,
            }
          : i
      )
    )

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
    triggerToast(`Put-Away confirmed! Allocated to ${formLocationCode}.`)
  }

  // Dropdown Options
  const shadeOptions = SHADES.map((s) => ({
    value: s.id,
    label: `${s.id}: ${s.name}`,
    sublabel: `${s.category} • Ratio: ${s.defaultPack}`,
  }))

  const rowOptions = Array.from({ length: 8 }, (_, i) => ({
    value: `R0${i + 1}`,
    label: `Row R0${i + 1}`,
  }))

  const colOptions = Array.from({ length: 10 }, (_, i) => {
    const cStr = i + 1 < 10 ? `C0${i + 1}` : `C${i + 1}`
    return {
      value: cStr,
      label: `Column ${cStr}`,
    }
  })

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
      <div className="bg-white rounded-2xl p-5 shadow-xs border border-slate-200/80 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 shadow-xs shrink-0">
            <Warehouse className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-slate-800 tracking-tight">Put-Away / Check-In</h1>
            <p className="text-xs text-slate-500 font-medium mt-0.5">
              Allocate received gate items into Shade ➔ Row ➔ Column bins with base product unit auto-calculation.
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <Link
            to="/location-master"
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold shadow-xs transition"
          >
            <span>View 2D Grid Matrix</span>
            <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
          </Link>
        </div>
      </div>

      {/* 4 Dynamic KPI Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5">
        <div className="bg-white rounded-2xl p-4 shadow-xs border border-slate-200/80 flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 border border-amber-100 flex items-center justify-center shrink-0">
            <Package className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-500">Pending Put-Away</p>
            <h3 className="text-xl font-bold text-slate-800 leading-tight mt-0.5">
              {stats.pendingCount} Lots
            </h3>
            <p className="text-[11px] text-amber-600 font-medium">Awaiting bay allocation</p>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-4 shadow-xs border border-slate-200/80 flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 border border-emerald-100 flex items-center justify-center shrink-0">
            <CheckCircle2 className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-500">Put-Away Completed</p>
            <h3 className="text-xl font-bold text-slate-800 leading-tight mt-0.5">
              {stats.completedCount} Lots
            </h3>
            <p className="text-[11px] text-emerald-600 font-medium">Stored in assigned bins</p>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-4 shadow-xs border border-slate-200/80 flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 border border-indigo-100 flex items-center justify-center shrink-0">
            <FlaskConical className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-500">Sent to QC Lab</p>
            <h3 className="text-xl font-bold text-slate-800 leading-tight mt-0.5">
              {stats.labPending} Lots
            </h3>
            <p className="text-[11px] text-indigo-600 font-medium">Quarantined for test</p>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-4 shadow-xs border border-slate-200/80 flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-slate-50 text-slate-600 border border-slate-200 flex items-center justify-center shrink-0">
            <Layers className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-500">Processed Quantity</p>
            <h3 className="text-xl font-bold text-slate-800 leading-tight mt-0.5">
              {stats.totalProcessedUnits.toLocaleString()}
            </h3>
            <p className="text-[11px] text-slate-500 font-medium">Total base units</p>
          </div>
        </div>
      </div>

      {/* 2-Column Workspace: Left Form, Right Live QR Badge */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
        {/* Left Form: Put-Away & Bin Allocation (7 Cols) */}
        <div className="lg:col-span-7 bg-white rounded-2xl p-5 shadow-xs border border-slate-200/80 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <MapPin className="w-4 h-4 text-indigo-600" />
              <h2 className="text-sm font-bold text-slate-800">Bin Allocation &amp; Check-In</h2>
            </div>
            <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-indigo-50 text-indigo-700 border border-indigo-200">
              {formLocationCode}
            </span>
          </div>

          <form onSubmit={handleConfirmPutAway} className="space-y-3.5 text-xs">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Inward GRN Reference <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={formGRN}
                  onChange={(e) => setFormGRN(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2 text-xs font-mono font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 focus:bg-white"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Batch Number <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={formBatch}
                  onChange={(e) => setFormBatch(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2 text-xs font-mono font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 focus:bg-white"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Commodity / Product Name <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                value={formProduct}
                onChange={(e) => setFormProduct(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2 text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 focus:bg-white"
              />
            </div>

            {/* Packaging Ratio & Base Unit Auto-Calculation */}
            <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                  Unit Breakdown Calculation
                </span>
                <span className="text-xs font-bold text-indigo-600 font-mono">
                  Total: {baseQuantityComputed.toLocaleString()} {formBaseUnit}
                </span>
              </div>

              <div className="grid grid-cols-3 gap-2.5">
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 mb-1">Cartons / Packs Count</label>
                  <input
                    type="number"
                    min="1"
                    value={formPacksCount}
                    onChange={(e) => setFormPacksCount(e.target.value)}
                    className="w-full bg-white border border-slate-200 rounded-lg p-2 text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-600 mb-1">Units per Pack</label>
                  <input
                    type="number"
                    min="1"
                    value={formUnitsPerPack}
                    onChange={(e) => setFormUnitsPerPack(e.target.value)}
                    className="w-full bg-white border border-slate-200 rounded-lg p-2 text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-600 mb-1">Base Measure Unit</label>
                  <input
                    type="text"
                    value={formBaseUnit}
                    onChange={(e) => setFormBaseUnit(e.target.value)}
                    className="w-full bg-white border border-slate-200 rounded-lg p-2 text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                  />
                </div>
              </div>
            </div>

            {/* Target Bin Location Coordinates */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Target Warehouse Facility &amp; Coordinates <span className="text-rose-500">*</span>
              </label>
              <div className="grid grid-cols-3 gap-2.5">
                <CustomSelect
                  value={formSelectedShade}
                  onChange={setFormSelectedShade}
                  options={shadeOptions}
                  zIndexClass="z-40"
                />
                <CustomSelect
                  value={formSelectedRow}
                  onChange={setFormSelectedRow}
                  options={rowOptions}
                  zIndexClass="z-30"
                />
                <CustomSelect
                  value={formSelectedCol}
                  onChange={setFormSelectedCol}
                  options={colOptions}
                  zIndexClass="z-30"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Put-Away Remarks</label>
              <input
                type="text"
                value={formRemarks}
                onChange={(e) => setFormRemarks(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 focus:bg-white"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                type="submit"
                className="bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 rounded-xl text-xs font-bold transition flex items-center gap-2"
              >
                <Check className="w-4 h-4" />
                <span>Confirm Put-Away &amp; Print QR</span>
              </button>
            </div>
          </form>
        </div>

        {/* Right: Live Put-Away Confirmation & Physical QR Sticker Badge (5 Cols) */}
        <div className="lg:col-span-5 bg-white rounded-2xl p-5 shadow-xs border border-slate-200/80 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <h2 className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
              <QrCode className="w-4 h-4 text-indigo-600" />
              <span>Physical Pallet / Gatta QR Sticker</span>
            </h2>
            <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
              Auto-Calculated
            </span>
          </div>

          {/* High-Contrast Industrial QR Sticker Canvas */}
          <div id="printable-putaway-tag" className="printable-area border-2 border-slate-900 rounded-2xl p-4 bg-white space-y-3 font-sans shadow-md">
            <div className="flex items-start justify-between border-b pb-2 border-slate-900">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded bg-slate-900 text-white flex items-center justify-center font-bold text-xs">
                  WH
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 text-xs tracking-wider uppercase">
                    CENTRAL WAREHOUSE
                  </h3>
                  <p className="text-[8px] font-bold text-slate-500 uppercase tracking-wider">
                    PUT-AWAY &amp; BIN ALLOCATION TAG
                  </p>
                </div>
              </div>
              <span className="text-xs font-mono font-bold bg-slate-100 text-slate-900 px-2 py-0.5 rounded border border-slate-300">
                {formLocationCode}
              </span>
            </div>

            <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-200 text-center space-y-1">
              <span className="text-[9px] font-bold text-slate-400 uppercase">Allocated Bin Locator</span>
              <div className="text-xl font-black font-mono tracking-widest text-slate-900">
                {formLocationCode}
              </div>
              <p className="text-[10px] text-slate-600 font-semibold">
                {SHADES.find((s) => s.id === formSelectedShade)?.name || formSelectedShade}
              </p>
            </div>

            <div className="space-y-1.5 text-[11px] font-mono bg-slate-50 p-2.5 rounded-lg border border-slate-200">
              <div className="flex justify-between">
                <span className="text-slate-500 font-sans">Product:</span>
                <span className="font-bold text-slate-900 truncate max-w-[170px]">{formProduct}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500 font-sans">Batch No:</span>
                <span className="font-bold text-slate-900">{formBatch}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500 font-sans">Packs Count:</span>
                <span className="font-bold text-slate-900">{formPacksCount} {formPackUnit}</span>
              </div>
              <div className="flex justify-between border-t border-slate-200 pt-1 text-indigo-900 font-bold">
                <span className="font-sans">Base Quantity:</span>
                <span>{baseQuantityComputed.toLocaleString()} {formBaseUnit}</span>
              </div>
            </div>

            <div className="flex items-center justify-between gap-3 pt-1">
              <div className="w-16 h-16 bg-white border border-slate-300 p-1 rounded-lg shrink-0">
                <svg viewBox="0 0 100 100" className="w-full h-full text-slate-900" fill="currentColor">
                  <rect x="0" y="0" width="30" height="30" />
                  <rect x="5" y="5" width="20" height="20" fill="white" />
                  <rect x="9" y="9" width="12" height="12" />
                  <rect x="70" y="0" width="30" height="30" />
                  <rect x="75" y="5" width="20" height="20" fill="white" />
                  <rect x="79" y="9" width="12" height="12" />
                  <rect x="0" y="70" width="30" height="30" />
                  <rect x="5" y="75" width="20" height="20" fill="white" />
                  <rect x="9" y="79" width="12" height="12" />
                  <rect x="36" y="8" width="6" height="14" />
                  <rect x="46" y="12" width="14" height="6" />
                  <rect x="40" y="24" width="8" height="8" />
                  <rect x="54" y="26" width="8" height="8" />
                  <rect x="38" y="38" width="24" height="24" />
                  <rect x="42" y="42" width="16" height="16" fill="white" />
                  <rect x="46" y="46" width="8" height="8" />
                  <rect x="74" y="38" width="8" height="14" />
                  <rect x="38" y="70" width="12" height="8" />
                  <rect x="54" y="74" width="14" height="6" />
                  <rect x="72" y="72" width="8" height="18" />
                </svg>
              </div>

              <div className="flex-1 text-center">
                <div className="flex justify-center items-end h-8 gap-0.5 max-w-[180px] mx-auto">
                  {[2, 1, 3, 1, 2, 4, 1, 2, 1, 3, 2, 1, 4, 2, 1, 3, 1, 2, 3, 1, 4, 2, 1, 3, 1, 2, 3, 2, 1, 4, 1, 2].map((w, i) => (
                    <div key={i} style={{ width: `${w * 1.5}px` }} className="h-full bg-slate-900"></div>
                  ))}
                </div>
                <span className="font-mono text-[9px] tracking-wider text-slate-900 font-bold mt-1 block">
                  {formLocationCode}-{formBatch}
                </span>
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={() => printSpecificElement('#printable-putaway-tag', `PutAway Tag - ${formLocationCode}`)}
            className="w-full py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold rounded-xl transition flex items-center justify-center gap-1.5"
          >
            <Printer className="w-4 h-4 text-slate-600" />
            <span>Print Physical Tag Now</span>
          </button>
        </div>
      </div>

      {/* 100% Full-Width Staging Queue Table */}
      <div className="bg-white rounded-2xl shadow-xs border border-slate-200/80 overflow-hidden">
        {/* Table Toolbar */}
        <div className="p-4 sm:p-5 border-b border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-3.5">
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1.5 p-1 bg-slate-100 rounded-xl text-xs font-semibold">
              <button
                type="button"
                onClick={() => {
                  setActiveTab('PENDING')
                  setCurrentPage(1)
                }}
                className={`px-3 py-1.5 rounded-lg transition cursor-pointer ${
                  activeTab === 'PENDING'
                    ? 'bg-white text-amber-700 shadow-xs font-bold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Pending Put-Away ({queueItems.filter((i) => i.status === 'Pending').length})
              </button>
              <button
                type="button"
                onClick={() => {
                  setActiveTab('COMPLETED')
                  setCurrentPage(1)
                }}
                className={`px-3 py-1.5 rounded-lg transition cursor-pointer ${
                  activeTab === 'COMPLETED'
                    ? 'bg-white text-emerald-700 shadow-xs font-bold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Completed ({queueItems.filter((i) => i.status === 'Completed').length})
              </button>
            </div>
          </div>

          <div className="relative w-full sm:w-72">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-3" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by GRN, product, batch..."
              className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-8 pr-3 py-2 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 focus:bg-white"
            />
          </div>
        </div>

        {/* Full-Width Table */}
        <div className="overflow-x-auto w-full">
          <table className="w-full text-left text-xs divide-y divide-slate-200">
            <thead className="bg-slate-50/80 text-slate-600 font-bold uppercase tracking-wider text-[11px]">
              <tr>
                <th className="py-3.5 px-4 w-12 text-center">#</th>
                <th className="py-3.5 px-4 min-w-[125px]">GRN No.</th>
                <th className="py-3.5 px-4 min-w-[200px]">Product Name</th>
                <th className="py-3.5 px-4 min-w-[120px]">Batch No.</th>
                <th className="py-3.5 px-4 min-w-[130px]">Packs Count</th>
                <th className="py-3.5 px-4 text-center min-w-[110px]">Base Quantity</th>
                <th className="py-3.5 px-4 min-w-[140px]">Target Bin</th>
                <th className="py-3.5 px-4 min-w-[110px]">Received On</th>
                <th className="py-3.5 px-4 text-center min-w-[95px]">Priority</th>
                <th className="py-3.5 px-4 text-center min-w-[120px]">QC Lab Status</th>
                <th className="py-3.5 px-4 text-center w-28">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 bg-white">
              {paginatedQueue.length === 0 ? (
                <tr>
                  <td colSpan="11" className="py-10 text-center text-slate-400">
                    No items in this queue matching your filter criteria.
                  </td>
                </tr>
              ) : (
                paginatedQueue.map((row, idx) => (
                  <tr key={row.id} className="hover:bg-slate-50/80 transition">
                    <td className="py-3.5 px-4 text-center text-slate-400 font-bold text-[11px]">
                      {(currentPage - 1) * perPage + idx + 1}
                    </td>
                    <td className="py-3.5 px-4 font-mono font-bold text-slate-900">
                      {row.grnNo}
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="font-semibold text-slate-800">{row.productName}</div>
                      <div className="text-[10px] text-slate-400 font-mono">{row.sku}</div>
                    </td>
                    <td className="py-3.5 px-4 font-mono font-semibold text-slate-700 text-[11px]">
                      {row.batchNo}
                    </td>
                    <td className="py-3.5 px-4 text-slate-700 font-medium">
                      {row.packsCount} {row.packUnit} ({row.unitsPerPack} / pack)
                    </td>
                    <td className="py-3.5 px-4 text-center font-mono font-bold text-slate-900">
                      {row.quantity} {row.uom}
                    </td>
                    <td className="py-3.5 px-4 font-mono font-bold text-indigo-600">
                      {row.recommendedLocation}
                    </td>
                    <td className="py-3.5 px-4 text-slate-500 font-mono text-[11px]">
                      {row.receivedOn}
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      <span
                        className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          row.priority === 'High'
                            ? 'bg-rose-100 text-rose-800'
                            : row.priority === 'Medium'
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-emerald-100 text-emerald-800'
                        }`}
                      >
                        {row.priority}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      <span
                        className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          row.labStatus.includes('Passed')
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-amber-100 text-amber-800'
                        }`}
                      >
                        {row.labStatus}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      <button
                        type="button"
                        onClick={() => handleLoadQueueItem(row)}
                        className="px-2.5 py-1.5 rounded-lg bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-bold text-xs transition cursor-pointer"
                      >
                        Allocate
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Footer */}
        <div className="p-4 bg-slate-50/80 border-t border-slate-200/80 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500 font-medium">
          <div>
            Showing <strong>{filteredQueue.length > 0 ? (currentPage - 1) * perPage + 1 : 0}</strong> to{' '}
            <strong>{Math.min(currentPage * perPage, filteredQueue.length)}</strong> of{' '}
            <strong>{filteredQueue.length}</strong> items
          </div>

          <div className="flex items-center gap-1">
            <button
              type="button"
              disabled={currentPage === 1}
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              className="px-2.5 py-1 rounded-lg border border-slate-200 bg-white text-slate-600 hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed font-bold"
            >
              ‹ Prev
            </button>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
              <button
                key={p}
                type="button"
                onClick={() => setCurrentPage(p)}
                className={`px-3 py-1 rounded-lg font-bold transition ${
                  currentPage === p
                    ? 'bg-indigo-600 text-white shadow-xs'
                    : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-100'
                }`}
              >
                {p}
              </button>
            ))}
            <button
              type="button"
              disabled={currentPage === totalPages}
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              className="px-2.5 py-1 rounded-lg border border-slate-200 bg-white text-slate-600 hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed font-bold"
            >
              Next ›
            </button>
          </div>
        </div>
      </div>

      {/* MODAL: Printable Physical QR Sticker */}
      {showQrLabelModal && printedLabelData && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
          <div className="bg-white rounded-2xl max-w-sm w-full p-4 sm:p-6 max-h-[90dvh] overflow-y-auto shadow-2xl border border-slate-200 text-center space-y-4">
            <div className="flex items-center justify-between border-b pb-2.5 border-slate-100">
              <h3 className="text-sm font-bold text-slate-800">Confirmed Put-Away QR Tag</h3>
              <button
                type="button"
                onClick={() => setShowQrLabelModal(false)}
                className="text-slate-400 hover:text-slate-700 p-1"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div id="printable-putaway-modal-tag" className="printable-area border-2 border-slate-900 rounded-xl p-4 bg-white space-y-2 text-center">
              <div className="text-[9px] font-black uppercase tracking-wider text-slate-500">
                CENTRAL WAREHOUSE • PALLET / CARTON LABEL
              </div>
              <div className="text-xl font-black font-mono tracking-widest text-slate-900 py-1 bg-slate-50 rounded border border-dashed border-slate-300">
                {printedLabelData.locationCode}
              </div>
              <div className="w-28 h-28 mx-auto border border-slate-300 p-1 rounded-lg flex items-center justify-center">
                <svg viewBox="0 0 100 100" className="w-full h-full text-slate-900" fill="currentColor">
                  <rect x="0" y="0" width="30" height="30" />
                  <rect x="5" y="5" width="20" height="20" fill="white" />
                  <rect x="9" y="9" width="12" height="12" />
                  <rect x="70" y="0" width="30" height="30" />
                  <rect x="75" y="5" width="20" height="20" fill="white" />
                  <rect x="79" y="9" width="12" height="12" />
                  <rect x="0" y="70" width="30" height="30" />
                  <rect x="5" y="75" width="20" height="20" fill="white" />
                  <rect x="9" y="79" width="12" height="12" />
                  <rect x="36" y="8" width="6" height="14" />
                  <rect x="46" y="12" width="14" height="6" />
                  <rect x="40" y="24" width="8" height="8" />
                  <rect x="54" y="26" width="8" height="8" />
                  <rect x="38" y="38" width="24" height="24" />
                  <rect x="42" y="42" width="16" height="16" fill="white" />
                  <rect x="46" y="46" width="8" height="8" />
                  <rect x="74" y="38" width="8" height="14" />
                  <rect x="38" y="70" width="12" height="8" />
                  <rect x="54" y="74" width="14" height="6" />
                  <rect x="72" y="72" width="8" height="18" />
                </svg>
              </div>
              <p className="text-xs font-bold text-slate-900 truncate">{printedLabelData.productName}</p>
              <div className="text-[10px] text-slate-600 font-mono">
                {printedLabelData.packsCount} {printedLabelData.packUnit} = {printedLabelData.baseQuantity} {printedLabelData.baseUnit}
              </div>
              <div className="text-[9px] text-amber-700 font-bold bg-amber-50 px-2 py-0.5 rounded border border-amber-200 inline-block">
                QC Status: {printedLabelData.labStatus}
              </div>
            </div>

            <div className="flex gap-2 pt-1">
              <button
                type="button"
                onClick={() => setShowQrLabelModal(false)}
                className="flex-1 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition"
              >
                Done
              </button>
              <button
                type="button"
                onClick={() => printSpecificElement('#printable-putaway-modal-tag', `PutAway Tag - ${printedLabelData.locationCode}`)}
                className="flex-1 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl transition flex items-center justify-center gap-1.5"
              >
                <Printer className="w-4 h-4" />
                <span>Print Tag</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
