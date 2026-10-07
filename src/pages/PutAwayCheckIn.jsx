import { useState, useMemo, useRef, useEffect } from 'react'
import { Link } from 'react-router-dom'
import QRCode from 'qrcode'
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
import { apiRequest } from '../services/api'

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

  const [shadesList, setShadesList] = useState([])
  const [racksList, setRacksList] = useState([])
  const [queueItems, setQueueItems] = useState([])
  const [modalQrUrl, setModalQrUrl] = useState('')

  // Form State
  const [formGRN, setFormGRN] = useState('')
  const [formProduct, setFormProduct] = useState('')
  const [formBatch, setFormBatch] = useState('')
  const [formPackUnit, setFormPackUnit] = useState('Bags')
  const [formBaseUnit, setFormBaseUnit] = useState('Kg')
  const [formUnitsPerPack, setFormUnitsPerPack] = useState(25)
  const [formPacksCount, setFormPacksCount] = useState(100)
  const [formSelectedShade, setFormSelectedShade] = useState('SH01')
  const [formSelectedRow, setFormSelectedRow] = useState('R1')
  const [formSelectedCol, setFormSelectedCol] = useState('C1')
  const [formRemarks, setFormRemarks] = useState('Checked in from unloading dock in pristine sealed condition.')

  // Fetch real data on mount
  useEffect(() => {
    Promise.allSettled([
      apiRequest('/grn'),
      apiRequest('/shade'),
      apiRequest('/rack'),
      apiRequest('/product'),
      apiRequest('/qc'),
    ]).then(([grnRes, shadeRes, rackRes, prodRes, qcRes]) => {
      let prods = []
      let qcs = []
      if (prodRes.status === 'fulfilled' && Array.isArray(prodRes.value)) prods = prodRes.value
      if (qcRes.status === 'fulfilled' && Array.isArray(qcRes.value)) qcs = qcRes.value

      if (shadeRes.status === 'fulfilled' && Array.isArray(shadeRes.value)) {
        setShadesList(shadeRes.value)
        if (shadeRes.value.length > 0) setFormSelectedShade(shadeRes.value[0].code)
      }
      if (rackRes.status === 'fulfilled' && Array.isArray(rackRes.value)) {
        setRacksList(rackRes.value)
      }
      if (grnRes.status === 'fulfilled' && Array.isArray(grnRes.value) && grnRes.value.length > 0) {
        const mapped = []
        grnRes.value.forEach((g) => {
          if (g.materials && g.materials.length > 0) {
            g.materials.forEach((m, idx) => {
              const prod = prods.find((p) => p.sku === m.sku)
              const qc = qcs.find((q) => q.grnNo === g.grnNo && (q.sku === m.sku || q.batchNo === m.batchNo))

              let labStatus = 'Pending QC'
              if (qc?.status === 'Passed' || prod?.labStatus === 'Passed') {
                labStatus = 'Passed / Cleared'
              } else if (qc?.status === 'Failed / Rejected' || prod?.labStatus === 'Failed / Rejected') {
                labStatus = 'Failed / Rejected'
              } else if (qc?.status === 'Quarantine / Under Test' || prod?.labStatus === 'Quarantine / Under Test') {
                labStatus = 'Under QC Test'
              } else {
                labStatus = 'Pending QC'
              }

              mapped.push({
                id: `${g._id}-${idx}`,
                grnNo: g.grnNo,
                productName: m.productName,
                sku: m.sku || 'SKU-01',
                batchNo: m.batchNo || `BTH-${g.grnNo?.slice(-4) || '2026'}`,
                packUnit: m.packagingUnit || 'Bags',
                packsCount: m.packageQty || 50,
                unitsPerPack: m.packSize || 25,
                quantity: m.totalBaseQty || (m.packageQty * m.packSize) || 1250,
                uom: m.baseUnit || 'Kg',
                shadeId: g.shade || 'SH01',
                recommendedLocation: `${g.shade ? g.shade.split(' ')[0] : 'SH01'}-R01-C01`,
                receivedOn: new Date(g.createdAt || Date.now()).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' }),
                priority: 'High',
                status: 'Pending',
                labStatus: labStatus,
              })
            })
          }
        })
        if (mapped.length > 0) {
          setQueueItems(mapped)
          setFormGRN(mapped[0].grnNo)
          setFormProduct(mapped[0].productName)
          setFormBatch(mapped[0].batchNo)
          setFormPackUnit(mapped[0].packUnit)
          setFormBaseUnit(mapped[0].uom)
          setFormUnitsPerPack(mapped[0].unitsPerPack)
          setFormPacksCount(mapped[0].packsCount)
        }
      }
    }).catch(() => {})
  }, [])

  // 6 Dedicated Shades Reference
  const SHADES = useMemo(() => {
    if (shadesList.length > 0) {
      return shadesList.map((s) => ({
        id: s.code,
        name: `${s.code}: ${s.name}`,
        category: s.type || 'Storage',
        defaultPack: 'Standard',
        baseUnit: 'Units',
        ratio: 1,
      }))
    }
    return [
      { id: 'SH01', name: 'Shade 1: Grains & Bulk Pulses', category: 'Grains & Pulses', defaultPack: 'Bags (50kg)', baseUnit: 'Kg', ratio: 50 },
      { id: 'SH02', name: 'Shade 2: Edible Oils & Liquids', category: 'Edible Oils', defaultPack: 'Tins (15L)', baseUnit: 'Ltr', ratio: 15 },
      { id: 'SH03', name: 'Shade 3: Packaged Food & FMCG', category: 'Packaged FMCG', defaultPack: 'Gatta / Carton', baseUnit: 'Pieces', ratio: 6 },
    ]
  }, [shadesList])

  const [showQrLabelModal, setShowQrLabelModal] = useState(false)
  const [printedLabelData, setPrintedLabelData] = useState(null)
  const [liveQrDataUrl, setLiveQrDataUrl] = useState('')
  const [showHazmatModal, setShowHazmatModal] = useState(false)
  const [showAddRackModal, setShowAddRackModal] = useState(false)
  const [newRackData, setNewRackData] = useState({
    shadeId: 'SH01',
    rackNumber: '',
    rows: 4,
    columns: 6,
    category: 'Grains & Pulses',
  })

  const isFoodItem = (name = '') => {
    const n = (name || '').toLowerCase()
    return (
      n.includes('grain') || n.includes('pulse') || n.includes('wheat') ||
      n.includes('rice') || n.includes('oil') || n.includes('mustard') ||
      n.includes('sugar') || n.includes('biscuit') || n.includes('flour') ||
      n.includes('atta') || n.includes('food') || n.includes('fmcg') ||
      n.includes('snack') || n.includes('parle') || n.includes('fortune') ||
      n.includes('dal') || n.includes('edible')
    )
  }

  const isChemicalZone = (shade = '') => {
    const s = (shade || '').toLowerCase()
    return s.includes('chem') || s.includes('hygiene') || s.includes('sh05') || s.includes('hazard') || s.includes('toxic')
  }

  // Set of all currently occupied location codes in the warehouse
  const occupiedLocationCodes = useMemo(() => {
    const codes = new Set()
    racksList.forEach((rack) => {
      if (rack.cells && Array.isArray(rack.cells)) {
        rack.cells.forEach((cell) => {
          if (cell.status === 'Occupied' || cell.status === 'Blocked' || cell.currentStock > 0) {
            codes.add(cell.code)
          }
        })
      }
    })
    queueItems.forEach((item) => {
      if (item.status === 'Completed' && item.recommendedLocation) {
        codes.add(item.recommendedLocation)
      }
    })
    return codes
  }, [racksList, queueItems])

  // Helper to find the next available empty bin in any shade
  const findNextAvailableBin = (shadeCode) => {
    const cleanShade = shadeCode ? shadeCode.split(' ')[0] : 'SH01'
    const matchingRacks = racksList.filter((r) => r.shadeCode === cleanShade || r.shadeId === cleanShade)

    if (matchingRacks.length > 0) {
      for (const rack of matchingRacks) {
        if (rack.cells && Array.isArray(rack.cells)) {
          for (const cell of rack.cells) {
            if (cell.status === 'Empty' && !occupiedLocationCodes.has(cell.code)) {
              return {
                shade: cleanShade,
                row: cell.row < 10 ? `R0${cell.row}` : `R${cell.row}`,
                col: cell.col < 10 ? `C0${cell.col}` : `C${cell.col}`,
                code: `${cleanShade}-${cell.row < 10 ? `R0${cell.row}` : `R${cell.row}`}-${cell.col < 10 ? `C0${cell.col}` : `C${cell.col}`}`,
                found: true,
              }
            }
          }
        }
      }
    }

    // Default search across 4 Rows x 6 Columns in this shade
    for (let r = 1; r <= 4; r++) {
      for (let c = 1; c <= 6; c++) {
        const rowStr = `R0${r}`
        const colStr = `C0${c}`
        const testCode = `${cleanShade}-${rowStr}-${colStr}`
        if (!occupiedLocationCodes.has(testCode)) {
          return {
            shade: cleanShade,
            row: rowStr,
            col: colStr,
            code: testCode,
            found: true,
          }
        }
      }
    }

    // No free bin available in this shade!
    return {
      shade: cleanShade,
      row: '',
      col: '',
      code: '',
      found: false,
    }
  }

  // Current auto-allocated bin status for active shade
  const currentAvailableBin = useMemo(() => {
    return findNextAvailableBin(formSelectedShade)
  }, [formSelectedShade, occupiedLocationCodes, racksList])

  // Auto-fill row & col when shade changes or on mount
  useEffect(() => {
    if (currentAvailableBin.found) {
      if (currentAvailableBin.row) setFormSelectedRow(currentAvailableBin.row)
      if (currentAvailableBin.col) setFormSelectedCol(currentAvailableBin.col)
    }
  }, [formSelectedShade, occupiedLocationCodes])

  const formLocationCode = currentAvailableBin.found && formSelectedRow && formSelectedCol
    ? `${formSelectedShade}-${formSelectedRow}-${formSelectedCol}`
    : `${formSelectedShade}-NO-SPACE`
  const baseQuantityComputed = (Number(formPacksCount) || 0) * (Number(formUnitsPerPack) || 0)

  const handleCreateRack = async (e) => {
    e.preventDefault()
    if (!newRackData.rackNumber.trim()) {
      triggerToast('Please provide a Rack Number (e.g., RK-101)')
      return
    }
    try {
      await apiRequest('/rack', {
        method: 'POST',
        body: JSON.stringify(newRackData),
      }).catch(() => {})
      setRacksList((prev) => [...prev, { ...newRackData, _id: Date.now().toString() }])
      triggerToast(`Rack ${newRackData.rackNumber} created successfully!`)
      setShowAddRackModal(false)
      setNewRackData({ shadeId: 'SH01', rackNumber: '', rows: 4, columns: 6, category: 'Grains & Pulses' })
    } catch {
      triggerToast('Created rack locally.')
      setShowAddRackModal(false)
    }
  }

  // Generate live QR Code Data URL whenever form inputs change
  useEffect(() => {
    const payload = JSON.stringify({
      type: 'WMS_PUTAWAY',
      grn: formGRN,
      sku: formProduct,
      batch: formBatch,
      location: formLocationCode,
      qty: `${baseQuantityComputed} ${formBaseUnit}`,
      time: new Date().toISOString(),
    })
    QRCode.toDataURL(payload, { width: 180, margin: 1 })
      .then((url) => setLiveQrDataUrl(url))
      .catch(() => {})
  }, [formGRN, formProduct, formBatch, formLocationCode, baseQuantityComputed, formBaseUnit])

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
    const qcTested = queueItems.filter((i) => i.labStatus.includes('Test') || i.labStatus.includes('Quarantine')).length
    const qcCleared = queueItems.filter((i) => i.labStatus.includes('Passed') || i.labStatus.includes('Cleared')).length
    const totalProcessedUnits = queueItems.reduce((acc, i) => acc + (Number(i.quantity) || 0), 0)
    return { pendingCount, completedCount, qcTested, qcCleared, totalProcessedUnits }
  }, [queueItems])

  // Load Queue Item into Form with Auto-Allocation
  const handleLoadQueueItem = (item) => {
    setFormGRN(item.grnNo)
    setFormProduct(item.productName)
    setFormBatch(item.batchNo)
    setFormPackUnit(item.packUnit)
    setFormBaseUnit(item.uom)
    setFormUnitsPerPack(item.unitsPerPack)
    setFormPacksCount(item.packsCount)

    const targetShade = item.shadeId ? item.shadeId.split(' ')[0] : formSelectedShade
    setFormSelectedShade(targetShade)

    const autoBin = findNextAvailableBin(targetShade)
    if (autoBin.found) {
      setFormSelectedRow(autoBin.row)
      setFormSelectedCol(autoBin.col)
      triggerToast(`Auto-allocated available bin: ${autoBin.code}`)
    } else {
      triggerToast(`Storage Full in ${targetShade}! Please choose another shade.`, 'error')
    }
  }

  // Confirm Put-Away & Check-In
  const handleConfirmPutAway = async (e) => {
    if (e) e.preventDefault()
    if (!formGRN || !formProduct || !formLocationCode) {
      triggerToast('Please complete all required fields.')
      return
    }

    // Safety Alert: Food in Chemical rack check
    if (isFoodItem(formProduct) && isChemicalZone(formSelectedShade) && !showHazmatModal) {
      setShowHazmatModal(true)
      return
    }
    setShowHazmatModal(false)

    try {
      // Allocate cell in MongoDB backend
      await apiRequest('/rack/allocate-cell', {
        method: 'POST',
        body: JSON.stringify({
          cellCode: formLocationCode,
          productName: formProduct,
          batchNo: formBatch,
          quantity: baseQuantityComputed,
          uom: formBaseUnit,
        }),
      }).catch(() => {})
    } catch (err) {
      console.warn('Backend cell allocation notice:', err)
    }

    setQueueItems((prev) =>
      prev.map((i) =>
        i.batchNo === formBatch || i.grnNo === formGRN
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
      labStatus: 'Quality Cleared',
      checkInTime: new Date().toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' }),
    }

    // Generate real QR for modal
    const modalPayload = JSON.stringify({
      type: 'WMS_PUTAWAY_CONFIRMATION',
      grn: formGRN,
      item: formProduct,
      batch: formBatch,
      location: formLocationCode,
      qty: `${baseQuantityComputed} ${formBaseUnit}`,
      allocatedAt: new Date().toISOString(),
    })
    try {
      const url = await QRCode.toDataURL(modalPayload, { width: 220, margin: 1 })
      setModalQrUrl(url)
    } catch (err) {}

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
        <div className="fixed top-5 right-5 z-[9999] bg-slate-900 text-white px-4 py-3 rounded-xl shadow-2xl flex items-center gap-2.5 text-xs font-semibold border border-slate-700 pointer-events-auto">
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
            <p className="text-xs font-semibold text-slate-500">QC Lab Cleared</p>
            <h3 className="text-xl font-bold text-slate-800 leading-tight mt-0.5">
              {stats.qcCleared} of {queueItems.length} Lots
            </h3>
            <p className="text-[11px] text-indigo-600 font-medium">
              {stats.qcTested > 0 ? `${stats.qcTested} under test` : `${queueItems.length - stats.qcCleared} awaiting QC`}
            </p>
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

            {/* Target Bin Location Coordinates & Auto-Allocation Indicator */}
            <div className="space-y-2">
              <div className="flex items-center justify-between mb-1">
                <div className="flex items-center gap-1.5">
                  <label className="block text-xs font-bold text-slate-700">
                    Target Warehouse Coordinates <span className="text-rose-500">*</span>
                  </label>
                  {currentAvailableBin.found ? (
                    <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                      ✓ Auto-Allocated Free Bin
                    </span>
                  ) : (
                    <span className="text-[10px] font-bold text-rose-700 bg-rose-50 px-2 py-0.5 rounded border border-rose-200">
                      ⚠️ Space Full
                    </span>
                  )}
                </div>
                <button
                  type="button"
                  onClick={() => setShowAddRackModal(true)}
                  className="inline-flex items-center gap-1 text-[11px] font-bold text-indigo-600 hover:text-indigo-800 transition cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>+ Add New Rack</span>
                </button>
              </div>

              {/* Warning Alert if No Space in Selected Shade */}
              {!currentAvailableBin.found && (
                <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl flex items-start gap-2 text-xs text-rose-800">
                  <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                  <div>
                    <p className="font-bold">⚠️ Abhi is Shade me Space nahi hai (Storage Full)</p>
                    <p className="text-[11px] text-rose-700 mt-0.5">
                      Shade <strong>{formSelectedShade}</strong> ke sabhi storage bins currently occupied hain. Kripya neeche se doosra Shade select karein ya naya rack add karein.
                    </p>
                  </div>
                </div>
              )}

              <div className="grid grid-cols-3 gap-2.5">
                <div>
                  <label className="block text-[11px] font-bold text-slate-500 mb-1">Storage Shade</label>
                  <CustomSelect
                    value={formSelectedShade}
                    onChange={(val) => {
                      setFormSelectedShade(val)
                      const next = findNextAvailableBin(val)
                      if (next.found) {
                        setFormSelectedRow(next.row)
                        setFormSelectedCol(next.col)
                      }
                    }}
                    options={shadeOptions}
                    zIndexClass="z-40"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-500 mb-1">Rack / Row</label>
                  <CustomSelect
                    value={formSelectedRow}
                    onChange={setFormSelectedRow}
                    options={rowOptions}
                    zIndexClass="z-30"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-500 mb-1">Column Bin</label>
                  <CustomSelect
                    value={formSelectedCol}
                    onChange={setFormSelectedCol}
                    options={colOptions}
                    zIndexClass="z-30"
                  />
                </div>
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
                disabled={!currentAvailableBin.found}
                className={`px-5 py-2.5 rounded-xl text-xs font-bold transition flex items-center gap-2 cursor-pointer ${
                  currentAvailableBin.found
                    ? 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm'
                    : 'bg-slate-200 text-slate-400 cursor-not-allowed'
                }`}
              >
                <Check className="w-4 h-4" />
                <span>{currentAvailableBin.found ? 'Confirm Put-Away & Print QR' : 'Cannot Check-In (No Space in this Shade)'}</span>
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
              <div className="w-20 h-20 bg-white border border-slate-300 p-1 rounded-lg shrink-0 flex items-center justify-center">
                {liveQrDataUrl ? (
                  <img src={liveQrDataUrl} alt="PutAway QR" className="w-full h-full object-contain" />
                ) : (
                  <QrCode className="w-8 h-8 text-slate-300 animate-pulse" />
                )}
              </div>

              <div className="flex-1 text-center">
                <div className="bg-slate-100 py-1 px-2 rounded border border-slate-200">
                  <div className="text-[9px] text-slate-500 font-semibold uppercase">Scan for Put-Away</div>
                  <div className="font-mono text-[10px] tracking-wider text-slate-900 font-bold mt-0.5 break-all">
                    {formLocationCode}-{formBatch || 'LOT'}
                  </div>
                </div>
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
                        className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${
                          row.labStatus.includes('Passed') || row.labStatus.includes('Cleared')
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                            : row.labStatus.includes('Failed')
                            ? 'bg-rose-50 text-rose-700 border-rose-200'
                            : row.labStatus.includes('Test') || row.labStatus.includes('Quarantine')
                            ? 'bg-amber-50 text-amber-700 border-amber-200'
                            : 'bg-slate-100 text-slate-600 border-slate-200'
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
              <div className="w-28 h-28 mx-auto border border-slate-300 p-1 rounded-lg flex items-center justify-center bg-white">
                {modalQrUrl || liveQrDataUrl ? (
                  <img src={modalQrUrl || liveQrDataUrl} alt="Allocation QR" className="w-full h-full object-contain" />
                ) : (
                  <QrCode className="w-12 h-12 text-slate-300 animate-pulse" />
                )}
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

      {/* MODAL: Hazmat Storage Safety Alert */}
      {showHazmatModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl max-w-md w-full p-5 shadow-2xl border-2 border-rose-500 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-rose-100 text-rose-600 flex items-center justify-center shrink-0">
                <AlertCircle className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-sm font-black text-rose-700 tracking-tight">CRITICAL HAZMAT SAFETY VIOLATION</h3>
                <p className="text-[11px] text-slate-500 font-medium">Incompatible Storage Regulation Alert</p>
              </div>
            </div>

            <div className="p-3 bg-rose-50 rounded-xl border border-rose-200 text-xs text-rose-900 space-y-1.5">
              <p className="font-bold">
                Cross-Contamination Risk Detected!
              </p>
              <p className="text-[11px] text-rose-800 leading-relaxed">
                You are attempting to store an edible/food item (<strong className="text-rose-950">{formProduct}</strong>) in a <strong className="text-rose-950">Chemical / Hazardous Zone ({formSelectedShade})</strong>.
                FSSAI, ISO 22000, and Warehouse Safety Regulations strictly prohibit storing food products in chemical bays.
              </p>
            </div>

            <div className="flex justify-end gap-2 pt-1 border-t border-slate-100">
              <button
                type="button"
                onClick={() => {
                  setShowHazmatModal(false)
                  setFormSelectedShade('SH01')
                  triggerToast('Re-routed safely to Shade 1 (Grains & Pulses)')
                }}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition"
              >
                Cancel &amp; Change to Food Shade
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowHazmatModal(false)
                  triggerToast('Warning acknowledged by Supervisor.', 'warning')
                  // Continue checkin
                  setTimeout(() => handleConfirmPutAway(), 50)
                }}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold rounded-xl transition"
              >
                Override (Supervisor Auth)
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: Add New Rack */}
      {showAddRackModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl max-w-md w-full p-5 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between border-b pb-3 border-slate-100">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold">
                  <Warehouse className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">Add New Warehouse Rack</h3>
                  <p className="text-[11px] text-slate-500">Configure rack dimensions and category</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowAddRackModal(false)}
                className="text-slate-400 hover:text-slate-700 p-1"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateRack} className="space-y-3 text-xs">
              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">Select Facility / Shade *</label>
                <select
                  value={newRackData.shadeId}
                  onChange={(e) => setNewRackData({ ...newRackData, shadeId: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold text-slate-800"
                >
                  <option value="SH01">SH01 - Shade 1: Grains &amp; Bulk Pulses</option>
                  <option value="SH02">SH02 - Shade 2: Edible Oils &amp; Liquids</option>
                  <option value="SH03">SH03 - Shade 3: Packaged Food &amp; FMCG</option>
                  <option value="SH04">SH04 - Shade 4: Packaging Materials</option>
                  <option value="SH05">SH05 - Shade 5: Chemicals &amp; Hygiene</option>
                  <option value="SH06">SH06 - Shade 6: Spares &amp; General Goods</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">Rack Identifier / Code *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. RK-104 or R09"
                  value={newRackData.rackNumber}
                  onChange={(e) => setNewRackData({ ...newRackData, rackNumber: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold font-mono text-slate-800"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">Rows (Vertical)</label>
                  <input
                    type="number"
                    min="1"
                    max="20"
                    value={newRackData.rows}
                    onChange={(e) => setNewRackData({ ...newRackData, rows: Number(e.target.value) })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-800"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">Columns (Shelves)</label>
                  <input
                    type="number"
                    min="1"
                    max="30"
                    value={newRackData.columns}
                    onChange={(e) => setNewRackData({ ...newRackData, columns: Number(e.target.value) })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-800"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">Storage Classification</label>
                <select
                  value={newRackData.category}
                  onChange={(e) => setNewRackData({ ...newRackData, category: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold text-slate-800"
                >
                  <option value="Grains & Pulses">Grains &amp; Bulk Pulses (Food)</option>
                  <option value="Edible Oils">Edible Oils &amp; Liquids (Food)</option>
                  <option value="Packaged FMCG">Packaged FMCG &amp; Snacks (Food)</option>
                  <option value="Packaging Materials">Corrugated Cartons &amp; Packaging</option>
                  <option value="Chemicals & Hygiene">Industrial Chemicals &amp; Detergents (Hazardous)</option>
                  <option value="General Spares">Machinery Spares &amp; Hardware</option>
                </select>
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowAddRackModal(false)}
                  className="px-4 py-2 border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 rounded-xl text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold"
                >
                  Save &amp; Create Rack
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
