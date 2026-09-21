import { useState, useMemo, useRef, useEffect } from 'react'
import { Link } from 'react-router-dom'
import {
  Warehouse,
  Package,
  Layers,
  MapPin,
  Search,
  X,
  Upload,
  Download,
  FileSpreadsheet,
  Edit2,
  QrCode,
  CheckCircle2,
  AlertTriangle,
  Clock,
  SlidersHorizontal,
  RotateCcw,
  Check,
  ChevronDown,
  Printer,
  Sparkles,
  Plus,
  LayoutGrid,
  AlertCircle,
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

export default function LocationMaster() {
  // Toast state
  const [toastMessage, setToastMessage] = useState(null)
  const triggerToast = (msg) => {
    setToastMessage(msg)
    setTimeout(() => setToastMessage(null), 3200)
  }

  // Selected Shade for visual grid view
  const [activeShadeId, setActiveShadeId] = useState('SH03') // Default to FMCG (Shade 3)

  // Filter & Search
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState('ALL')
  const [shadeFilter, setShadeFilter] = useState('ALL')
  const [currentPage, setCurrentPage] = useState(1)
  const perPage = 8

  // Selected Cell for Bin Inspector
  const [selectedCell, setSelectedCell] = useState(null)

  // Modals state
  const [showAddModal, setShowAddModal] = useState(false)
  const [showPrintModal, setShowPrintModal] = useState(false)
  const [showBulkModal, setShowBulkModal] = useState(false)
  const [editingItem, setEditingItem] = useState(null)
  const [qrModalBin, setQrModalBin] = useState(null)

  // Form State for Add / Edit
  const [formData, setFormData] = useState({
    code: '',
    shadeId: 'SH03',
    row: 'R01',
    col: 'C01',
    productName: '',
    batchNo: '',
    baseUnit: 'Pieces',
    packUnit: 'Gatta / Carton',
    unitsPerPack: 6,
    capacity: '1200',
    currentStock: '0',
    status: 'Empty',
  })

  // 6 Dedicated Shades Definition
  const SHADES = useMemo(() => [
    {
      id: 'SH01',
      name: 'Shade 1: Grains & Bulk Pulses',
      category: 'Grains & Pulses',
      description: 'Storage for Wheat, Basmati Rice & Pulses in 50kg bags',
      baseUnit: 'Kg',
      packUnit: 'Bags (50kg)',
      unitsPerPack: 50,
      totalBins: 80,
      utilization: 76,
    },
    {
      id: 'SH02',
      name: 'Shade 2: Edible Oils & Liquids',
      category: 'Edible Oils',
      description: 'Refined Oil, Mustard Oil, and Ghee in 15L tins & cans',
      baseUnit: 'Ltr',
      packUnit: 'Tins (15L)',
      unitsPerPack: 15,
      totalBins: 80,
      utilization: 62,
    },
    {
      id: 'SH03',
      name: 'Shade 3: Packaged Food & FMCG',
      category: 'Packaged FMCG',
      description: 'Biscuits, Noodles, Packaged Groceries, and Confectionery',
      baseUnit: 'Pieces',
      packUnit: 'Gatta / Carton',
      unitsPerPack: 6,
      totalBins: 80,
      utilization: 84,
    },
    {
      id: 'SH04',
      name: 'Shade 4: Packaging Cartons & Bags',
      category: 'Packaging Materials',
      description: '5-Ply Corrugated Cartons, Tarpaulins, and Bundles',
      baseUnit: 'Nos',
      packUnit: 'Bundles (50 Pcs)',
      unitsPerPack: 50,
      totalBins: 80,
      utilization: 45,
    },
    {
      id: 'SH05',
      name: 'Shade 5: Chemicals & Hygiene',
      category: 'Chemicals & Hygiene',
      description: 'Disinfectants, Sanitizers, Detergents, and Cleaning liquid',
      baseUnit: 'Ltr',
      packUnit: 'Cans (5L)',
      unitsPerPack: 5,
      totalBins: 80,
      utilization: 58,
    },
    {
      id: 'SH06',
      name: 'Shade 6: Spares & General Hardware',
      category: 'Spares & General',
      description: 'Conveyor belts, Hydraulic pallet jack spares, and Hardware',
      baseUnit: 'Units',
      packUnit: 'Crates',
      unitsPerPack: 1,
      totalBins: 80,
      utilization: 38,
    },
  ], [])

  // Active Shade Info
  const currentActiveShade = useMemo(() => {
    return SHADES.find((s) => s.id === activeShadeId) || SHADES[2]
  }, [activeShadeId, SHADES])

  // Master Locations Table Data
  const [locations, setLocations] = useState([
    {
      id: 1,
      code: 'SH03-R01-C01',
      shadeId: 'SH03',
      shadeName: 'Shade 3: Packaged FMCG',
      row: 'R01',
      col: 'C01',
      productName: 'Parle-G Glucose Biscuits (50g)',
      batchNo: 'BT-2026-FMCG-01',
      baseUnit: 'Pieces',
      packUnit: 'Gatta',
      unitsPerPack: 6,
      capacity: 1200,
      currentStock: 900,
      packsCount: 150,
      labStatus: 'Passed',
      expiryDate: '15 Mar 2027',
      status: 'Occupied',
    },
    {
      id: 2,
      code: 'SH03-R01-C02',
      shadeId: 'SH03',
      shadeName: 'Shade 3: Packaged FMCG',
      row: 'R01',
      col: 'C02',
      productName: 'Good Day Butter Biscuits (75g)',
      batchNo: 'BT-2026-FMCG-02',
      baseUnit: 'Pieces',
      packUnit: 'Gatta',
      unitsPerPack: 12,
      capacity: 1200,
      currentStock: 1200,
      packsCount: 100,
      labStatus: 'Passed',
      expiryDate: '28 Jun 2027',
      status: 'Full',
    },
    {
      id: 3,
      code: 'SH03-R01-C03',
      shadeId: 'SH03',
      shadeName: 'Shade 3: Packaged FMCG',
      row: 'R01',
      col: 'C03',
      productName: 'Maggi 2-Minute Noodles (70g)',
      batchNo: 'BT-2026-FMCG-03',
      baseUnit: 'Packets',
      packUnit: 'Carton',
      unitsPerPack: 24,
      capacity: 1000,
      currentStock: 480,
      packsCount: 20,
      labStatus: 'Under Testing',
      expiryDate: '10 Jan 2027',
      status: 'Occupied',
    },
    {
      id: 4,
      code: 'SH03-R01-C04',
      shadeId: 'SH03',
      shadeName: 'Shade 3: Packaged FMCG',
      row: 'R01',
      col: 'C04',
      productName: 'Available Bin',
      batchNo: '-',
      baseUnit: 'Pieces',
      packUnit: 'Gatta',
      unitsPerPack: 6,
      capacity: 1200,
      currentStock: 0,
      packsCount: 0,
      labStatus: '-',
      expiryDate: '-',
      status: 'Empty',
    },
    {
      id: 5,
      code: 'SH01-R02-C01',
      shadeId: 'SH01',
      shadeName: 'Shade 1: Grains & Bulk Pulses',
      row: 'R02',
      col: 'C01',
      productName: 'Sharbati Wheat Grain (Grade A)',
      batchNo: 'BT-2026-GRN-01',
      baseUnit: 'Kg',
      packUnit: 'Bags (50kg)',
      unitsPerPack: 50,
      capacity: 2500,
      currentStock: 2000,
      packsCount: 40,
      labStatus: 'Passed',
      expiryDate: '10 Nov 2027',
      status: 'Occupied',
    },
    {
      id: 6,
      code: 'SH01-R02-C02',
      shadeId: 'SH01',
      shadeName: 'Shade 1: Grains & Bulk Pulses',
      row: 'R02',
      col: 'C02',
      productName: 'Basmati Rice Premium XXL',
      batchNo: 'BT-2026-GRN-02',
      baseUnit: 'Kg',
      packUnit: 'Bags (25kg)',
      unitsPerPack: 25,
      capacity: 2000,
      currentStock: 1500,
      packsCount: 60,
      labStatus: 'Passed',
      expiryDate: '20 Dec 2027',
      status: 'Occupied',
    },
    {
      id: 7,
      code: 'SH02-R01-C01',
      shadeId: 'SH02',
      shadeName: 'Shade 2: Edible Oils & Liquids',
      row: 'R01',
      col: 'C01',
      productName: 'Fortune Refined Mustard Oil',
      batchNo: 'BT-2026-OIL-01',
      baseUnit: 'Ltr',
      packUnit: 'Tins (15L)',
      unitsPerPack: 15,
      capacity: 1500,
      currentStock: 1200,
      packsCount: 80,
      labStatus: 'Passed',
      expiryDate: '18 Aug 2027',
      status: 'Occupied',
    },
    {
      id: 8,
      code: 'SH04-R01-C01',
      shadeId: 'SH04',
      shadeName: 'Shade 4: Packaging Cartons & Bags',
      row: 'R01',
      col: 'C01',
      productName: 'Corrugated Shipping Cartons (5-Ply)',
      batchNo: 'BT-2026-PKG-01',
      baseUnit: 'Nos',
      packUnit: 'Bundles (50 Nos)',
      unitsPerPack: 50,
      capacity: 3000,
      currentStock: 1500,
      packsCount: 30,
      labStatus: 'Passed',
      expiryDate: 'N/A',
      status: 'Occupied',
    },
    {
      id: 9,
      code: 'SH05-R01-C01',
      shadeId: 'SH05',
      shadeName: 'Shade 5: Chemicals & Hygiene',
      row: 'R01',
      col: 'C01',
      productName: 'Industrial Floor Disinfectant Liquid',
      batchNo: 'BT-2026-CHM-01',
      baseUnit: 'Ltr',
      packUnit: 'Cans (5L)',
      unitsPerPack: 5,
      capacity: 1000,
      currentStock: 400,
      packsCount: 80,
      labStatus: 'Passed',
      expiryDate: '05 May 2028',
      status: 'Occupied',
    },
    {
      id: 10,
      code: 'SH06-R01-C01',
      shadeId: 'SH06',
      shadeName: 'Shade 6: Spares & General Hardware',
      row: 'R01',
      col: 'C01',
      productName: 'Hydraulic Pallet Jack Spares',
      batchNo: 'BT-2026-SPR-01',
      baseUnit: 'Units',
      packUnit: 'Crates',
      unitsPerPack: 1,
      capacity: 500,
      currentStock: 120,
      packsCount: 120,
      labStatus: 'Passed',
      expiryDate: 'N/A',
      status: 'Occupied',
    },
  ])

  // Filtered Locations
  const filteredLocations = useMemo(() => {
    return locations.filter((loc) => {
      if (shadeFilter !== 'ALL' && loc.shadeId !== shadeFilter) return false
      if (statusFilter !== 'ALL' && loc.status !== statusFilter) return false
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase()
        return (
          loc.code.toLowerCase().includes(q) ||
          loc.shadeName.toLowerCase().includes(q) ||
          loc.productName.toLowerCase().includes(q) ||
          loc.batchNo.toLowerCase().includes(q) ||
          loc.status.toLowerCase().includes(q)
        )
      }
      return true
    })
  }, [locations, shadeFilter, statusFilter, searchQuery])

  // Pagination
  const totalPages = Math.max(1, Math.ceil(filteredLocations.length / perPage))
  const paginatedLocations = filteredLocations.slice((currentPage - 1) * perPage, currentPage * perPage)

  // Dynamic KPI Stats calculated live from state
  const stats = useMemo(() => {
    const totalBins = 480 // 6 shades * 80 bins
    const occupied = locations.filter((l) => l.status === 'Occupied' || l.status === 'Full').length
    const empty = totalBins - occupied
    const full = locations.filter((l) => l.status === 'Full').length
    const overallUtil = Math.round((occupied / totalBins) * 100)
    return { totalShades: 6, totalBins, occupied, empty, full, overallUtil }
  }, [locations])

  // Generate Matrix Cells for Active Shade (8 Rows x 10 Columns)
  const matrixCells = useMemo(() => {
    const rows = 8
    const cols = 10
    const cells = []

    for (let r = 1; r <= rows; r++) {
      for (let c = 1; c <= cols; c++) {
        const rStr = `R0${r}`
        const cStr = c < 10 ? `C0${c}` : `C${c}`
        const code = `${activeShadeId}-${rStr}-${cStr}`

        const matched = locations.find((l) => l.code === code)
        if (matched) {
          cells.push(matched)
        } else {
          // Synthetic deterministic representation
          const isOccupied = (r * 3 + c * 7) % 10 > 3
          const isFull = isOccupied && (r + c) % 5 === 0
          const isTesting = isOccupied && (r + c) % 7 === 0
          const capacity = 1000
          const currentStock = isFull ? 1000 : isOccupied ? Math.floor(capacity * 0.7) : 0
          const unitsPerPack = activeShadeId === 'SH03' ? 6 : activeShadeId === 'SH01' ? 50 : 12

          cells.push({
            id: `${code}-synth`,
            code,
            shadeId: activeShadeId,
            shadeName: currentActiveShade.name,
            row: rStr,
            col: cStr,
            productName: isOccupied ? `${currentActiveShade.category} Stock Item` : 'Available Bin',
            batchNo: isOccupied ? `BT-2026-${activeShadeId}-${rStr}` : '-',
            baseUnit: currentActiveShade.baseUnit,
            packUnit: currentActiveShade.packUnit,
            unitsPerPack,
            capacity,
            currentStock,
            packsCount: Math.floor(currentStock / unitsPerPack),
            labStatus: isTesting ? 'Under Testing' : isOccupied ? 'Passed' : '-',
            expiryDate: isOccupied ? '30 Nov 2027' : '-',
            status: isFull ? 'Full' : isOccupied ? 'Occupied' : 'Empty',
          })
        }
      }
    }
    return cells
  }, [activeShadeId, locations, currentActiveShade])

  // Active Shade Specific Live Counts
  const activeShadeStats = useMemo(() => {
    const occupied = matrixCells.filter((c) => c.status === 'Occupied' || c.status === 'Full').length
    const full = matrixCells.filter((c) => c.status === 'Full').length
    const testing = matrixCells.filter((c) => c.labStatus === 'Under Testing').length
    const empty = matrixCells.filter((c) => c.status === 'Empty').length
    const totalStock = matrixCells.reduce((sum, c) => sum + (Number(c.currentStock) || 0), 0)
    return { occupied, full, testing, empty, totalStock }
  }, [matrixCells])

  // Handle Save New or Edit Location
  const handleSaveLocation = (e) => {
    e.preventDefault()
    if (!formData.code) {
      triggerToast('Please provide valid location code.')
      return
    }

    if (editingItem) {
      setLocations((prev) =>
        prev.map((item) =>
          item.id === editingItem.id
            ? {
                ...item,
                ...formData,
                capacity: Number(formData.capacity) || 1000,
                currentStock: Number(formData.currentStock) || 0,
                packsCount: Math.floor(
                  (Number(formData.currentStock) || 0) / (Number(formData.unitsPerPack) || 1)
                ),
              }
            : item
        )
      )
      triggerToast(`Location ${formData.code} updated successfully.`)
    } else {
      const newItem = {
        id: Date.now(),
        ...formData,
        shadeName: SHADES.find((s) => s.id === formData.shadeId)?.name || 'Shade 1',
        capacity: Number(formData.capacity) || 1000,
        currentStock: Number(formData.currentStock) || 0,
        packsCount: Math.floor(
          (Number(formData.currentStock) || 0) / (Number(formData.unitsPerPack) || 1)
        ),
        labStatus: 'Passed',
        expiryDate: '15 Dec 2027',
      }
      setLocations((prev) => [newItem, ...prev])
      triggerToast(`New bin location ${formData.code} created.`)
    }

    setShowAddModal(false)
    setEditingItem(null)
  }

  // Open Edit Modal
  const handleOpenEdit = (loc) => {
    setEditingItem(loc)
    setFormData({
      code: loc.code,
      shadeId: loc.shadeId || 'SH03',
      row: loc.row,
      col: loc.col,
      productName: loc.productName,
      batchNo: loc.batchNo,
      baseUnit: loc.baseUnit,
      packUnit: loc.packUnit,
      unitsPerPack: loc.unitsPerPack,
      capacity: String(loc.capacity),
      currentStock: String(loc.currentStock),
      status: loc.status,
    })
    setShowAddModal(true)
  }

  // Open Print QR Modal
  const handleOpenPrintQr = (bin) => {
    setQrModalBin(bin)
    setShowPrintModal(true)
  }

  // Export CSV
  const handleExportCSV = () => {
    const headers = [
      '#',
      'Bin Code',
      'Shade',
      'Row',
      'Col',
      'Product Name',
      'Batch No',
      'Base Unit',
      'Pack Unit',
      'Units Per Pack',
      'Capacity',
      'Current Stock',
      'Packs Count',
      'Lab Status',
      'Status',
    ]
    const rows = filteredLocations.map((loc, idx) => [
      idx + 1,
      `"${loc.code}"`,
      `"${loc.shadeName}"`,
      loc.row,
      loc.col,
      `"${loc.productName}"`,
      `"${loc.batchNo}"`,
      loc.baseUnit,
      `"${loc.packUnit}"`,
      loc.unitsPerPack,
      loc.capacity,
      loc.currentStock,
      loc.packsCount,
      loc.labStatus,
      loc.status,
    ])
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n')
    const encodedUri = encodeURI(csvContent)
    const link = document.createElement('a')
    link.setAttribute('href', encodedUri)
    link.setAttribute('download', 'Warehouse_Location_Master.csv')
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    triggerToast('Location Master exported to CSV.')
  }

  // Dropdown Options
  const shadeOptions = [
    { value: 'ALL', label: 'All 6 Dedicated Shades' },
    ...SHADES.map((s) => ({
      value: s.id,
      label: s.name,
      sublabel: `${s.category} • ${s.packUnit}`,
    })),
  ]

  const statusOptions = [
    { value: 'ALL', label: 'All Bin Statuses' },
    { value: 'Occupied', label: 'Occupied (Stock Present)' },
    { value: 'Full', label: 'Full (100% Capacity)' },
    { value: 'Empty', label: 'Empty (Available)' },
  ]

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
      <div className="bg-white rounded-2xl p-4 sm:p-5 shadow-xs border border-slate-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-start sm:items-center gap-3.5 min-w-0 flex-1">
          <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 shadow-xs shrink-0 mt-0.5 sm:mt-0">
            <Warehouse className="w-5 h-5" />
          </div>
          <div className="min-w-0">
            <h1 className="text-lg sm:text-xl font-bold text-slate-800 tracking-tight leading-tight">Location Master (6 Warehouse Shades)</h1>
            <p className="text-xs text-slate-500 font-medium mt-0.5 leading-relaxed">
              Interactive 2D visual bin matrix, 6 dedicated storage shades, and base product inventory mapping.
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2.5 w-full sm:w-auto shrink-0">
          <button
            type="button"
            onClick={handleExportCSV}
            className="flex-1 sm:flex-none justify-center inline-flex items-center gap-2 px-3.5 py-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold shadow-xs transition cursor-pointer"
          >
            <Download className="w-3.5 h-3.5 text-slate-500 shrink-0" />
            <span>Export CSV</span>
          </button>
          <button
            type="button"
            onClick={() => setShowBulkModal(true)}
            className="flex-1 sm:flex-none justify-center inline-flex items-center gap-2 px-3.5 py-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold shadow-xs transition cursor-pointer"
          >
            <FileSpreadsheet className="w-3.5 h-3.5 text-slate-500 shrink-0" />
            <span>Import Bins</span>
          </button>
          <button
            type="button"
            onClick={() => {
              setEditingItem(null)
              setFormData({
                code: `${activeShadeId}-R01-C01`,
                shadeId: activeShadeId,
                row: 'R01',
                col: 'C01',
                productName: '',
                batchNo: '',
                baseUnit: currentActiveShade.baseUnit,
                packUnit: currentActiveShade.packUnit,
                unitsPerPack: currentActiveShade.unitsPerPack,
                capacity: '1000',
                currentStock: '0',
                status: 'Empty',
              })
              setShowAddModal(true)
            }}
            className="w-full sm:w-auto justify-center inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-sm transition cursor-pointer"
          >
            <Plus className="w-4 h-4 shrink-0" />
            <span>Add Grid Bin</span>
          </button>
        </div>
      </div>

      {/* 4 Dynamic KPI Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5">
        <div className="bg-white rounded-2xl p-4 shadow-xs border border-slate-200/80 flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 border border-indigo-100 flex items-center justify-center shrink-0">
            <LayoutGrid className="w-5 h-5" />
          </div>
          <div>
            <div className="text-slate-400 text-xs font-medium">Total Grid Bins</div>
            <h3 className="text-xl font-bold text-slate-800 tracking-tight">{stats.totalBins}</h3>
            <p className="text-[11px] text-slate-500 font-medium">80 per Shade × 6</p>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-4 shadow-xs border border-slate-200/80 flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 border border-emerald-100 flex items-center justify-center shrink-0">
            <CheckCircle2 className="w-5 h-5" />
          </div>
          <div>
            <div className="text-slate-400 text-xs font-medium">Active Stock Bins</div>
            <h3 className="text-xl font-bold text-emerald-600 tracking-tight">{stats.occupied}</h3>
            <p className="text-[11px] text-emerald-600 font-medium">With mapped inventory</p>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-4 shadow-xs border border-slate-200/80 flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-rose-50 text-rose-600 border border-rose-100 flex items-center justify-center shrink-0">
            <AlertCircle className="w-5 h-5" />
          </div>
          <div>
            <div className="text-slate-400 text-xs font-medium">Full Capacity Bins</div>
            <h3 className="text-xl font-bold text-rose-600 tracking-tight">{stats.full}</h3>
            <p className="text-[11px] text-rose-600 font-medium">100% capacity reached</p>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-4 shadow-xs border border-slate-200/80 flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 border border-blue-100 flex items-center justify-center shrink-0">
            <Layers className="w-5 h-5" />
          </div>
          <div>
            <div className="text-slate-400 text-xs font-medium">Empty Bins</div>
            <h3 className="text-xl font-bold text-slate-800 tracking-tight">
              {stats.empty}
            </h3>
            <p className="text-[11px] text-blue-600 font-medium">Ready for put-away</p>
          </div>
        </div>
      </div>

      {/* 6 Shades Switcher Tabs */}
      <div className="bg-white rounded-2xl p-3 shadow-xs border border-slate-200/80">
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar">
          {SHADES.map((s) => {
            const isActive = activeShadeId === s.id
            return (
              <button
                key={s.id}
                type="button"
                onClick={() => {
                  setActiveShadeId(s.id)
                  setSelectedCell(null)
                  triggerToast(`Switched view to ${s.name}`)
                }}
                className={`px-4 py-2.5 rounded-xl text-xs font-bold transition flex items-center gap-2.5 whitespace-nowrap cursor-pointer shrink-0 ${
                  isActive
                    ? 'bg-indigo-600 text-white shadow-sm ring-2 ring-indigo-600/20'
                    : 'bg-slate-50 text-slate-700 hover:bg-slate-100 border border-slate-200/80'
                }`}
              >
                <span className={`w-2 h-2 rounded-full ${isActive ? 'bg-white' : 'bg-indigo-500'}`} />
                <span className="font-mono">{s.id}:</span>
                <span>{s.category}</span>
                <span
                  className={`text-[10px] px-2 py-0.5 rounded-full font-mono font-semibold ${
                    isActive ? 'bg-white/20 text-white' : 'bg-slate-200/80 text-slate-700'
                  }`}
                >
                  {s.utilization}% Full
                </span>
              </button>
            )
          })}
        </div>
      </div>

      {/* 100% Full-Width Interactive 2D Visual Grid Matrix */}
      <div className="w-full bg-white rounded-2xl p-4 sm:p-6 shadow-xs border border-slate-200/80 space-y-4">
        {/* Top Header of Shade Section */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3.5 pb-4 border-b border-slate-100">
          <div className="min-w-0">
            <h2 className="text-base sm:text-lg font-bold text-slate-900 tracking-tight">
              {currentActiveShade.name}
            </h2>
            <div className="flex flex-wrap items-center gap-1.5 sm:gap-2 mt-1.5">
              <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200 shrink-0">
                80 Bins (8 Rows × 10 Cols)
              </span>
              <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 shrink-0">
                Zone {currentActiveShade.zone} • {currentActiveShade.category}
              </span>
              <span className="text-[11px] font-mono font-bold px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700 border border-slate-200 shrink-0">
                Ratio: 1 {currentActiveShade.packUnit} = {currentActiveShade.unitsPerPack} {currentActiveShade.baseUnit}
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-1.5 leading-relaxed">
              Click any bin cell in the 2D layout below to inspect commodity batch, packaging ratio, or print QR locator stickers.
            </p>
          </div>

          {/* Matrix Legend with Live Dynamic Counts */}
          <div className="grid grid-cols-2 sm:flex sm:flex-wrap items-center gap-2 text-xs font-semibold w-full lg:w-auto shrink-0">
            <span className="flex items-center justify-center sm:justify-start gap-1.5 px-2.5 py-1.5 rounded-lg bg-emerald-50 text-emerald-800 border border-emerald-200">
              <span className="w-2.5 h-2.5 rounded-sm bg-emerald-500 shrink-0" />
              <span>Occupied ({activeShadeStats.occupied})</span>
            </span>
            <span className="flex items-center justify-center sm:justify-start gap-1.5 px-2.5 py-1.5 rounded-lg bg-rose-50 text-rose-800 border border-rose-200">
              <span className="w-2.5 h-2.5 rounded-sm bg-rose-500 shrink-0" />
              <span>Full 100% ({activeShadeStats.full})</span>
            </span>
            <span className="flex items-center justify-center sm:justify-start gap-1.5 px-2.5 py-1.5 rounded-lg bg-amber-50 text-amber-800 border border-amber-200">
              <span className="w-2.5 h-2.5 rounded-sm bg-amber-400 shrink-0" />
              <span>QC Testing ({activeShadeStats.testing})</span>
            </span>
            <span className="flex items-center justify-center sm:justify-start gap-1.5 px-2.5 py-1.5 rounded-lg bg-slate-50 text-slate-700 border border-slate-200">
              <span className="w-2.5 h-2.5 rounded-sm bg-slate-200 border border-slate-300 shrink-0" />
              <span>Empty ({activeShadeStats.empty})</span>
            </span>
          </div>
        </div>

        {/* 2D Grid Canvas - Full Width */}
        <div className="w-full overflow-x-auto no-scrollbar">
          <div className="min-w-[820px] space-y-2">
            {/* Columns Header (C01 to C10) */}
            <div className="grid grid-cols-11 gap-2 text-center text-xs font-mono font-bold text-slate-500 pb-1">
              <div className="text-right pr-3 text-slate-400 font-sans text-xs">Row \ Col</div>
              {Array.from({ length: 10 }, (_, i) => (
                <div key={i} className="py-1 bg-slate-100/70 rounded-lg text-slate-700 border border-slate-200/60">
                  {i + 1 < 10 ? `C0${i + 1}` : `C${i + 1}`}
                </div>
              ))}
            </div>

            {/* Rows 1 to 8 */}
            {Array.from({ length: 8 }, (_, rIdx) => {
              const rowNum = rIdx + 1
              const rowLabel = `R0${rowNum}`
              const rowCells = matrixCells.filter((c) => c.row === rowLabel)

              return (
                <div key={rowLabel} className="grid grid-cols-11 gap-2 items-center">
                  <div className="text-right pr-3 text-xs font-mono font-bold text-slate-600">
                    {rowLabel}
                  </div>

                  {rowCells.map((cell) => {
                    const isSelected = selectedCell?.code === cell.code
                    const isOccupied = cell.status === 'Occupied'
                    const isFull = cell.status === 'Full'
                    const isTesting = cell.labStatus === 'Under Testing'

                    let cellStyle = 'bg-slate-50 hover:bg-slate-100/80 border-slate-200 text-slate-600'
                    let dotColor = 'bg-slate-300'
                    if (isFull) {
                      cellStyle = 'bg-rose-50/90 hover:bg-rose-100 border-rose-300 text-rose-950 font-bold'
                      dotColor = 'bg-rose-500 ring-2 ring-rose-200'
                    } else if (isTesting) {
                      cellStyle = 'bg-amber-50/90 hover:bg-amber-100 border-amber-300 text-amber-950 font-semibold'
                      dotColor = 'bg-amber-500 ring-2 ring-amber-200'
                    } else if (isOccupied) {
                      cellStyle = 'bg-emerald-50/90 hover:bg-emerald-100 border-emerald-300 text-emerald-950 font-semibold'
                      dotColor = 'bg-emerald-500 ring-2 ring-emerald-200'
                    }

                    return (
                      <button
                        key={cell.code}
                        type="button"
                        onClick={() => setSelectedCell(cell)}
                        title={`${cell.code} - ${cell.productName} (${cell.currentStock} ${cell.baseUnit})`}
                        className={`h-16 rounded-xl border flex flex-col justify-between p-2 transition cursor-pointer relative shadow-2xs hover:shadow-sm ${cellStyle} ${
                          isSelected ? 'ring-2 ring-indigo-600 ring-offset-2 border-indigo-600 z-10 shadow-md bg-indigo-50/60' : ''
                        }`}
                      >
                        <div className="w-full flex items-center justify-between">
                          <span className="text-[11px] font-mono font-semibold text-slate-600 leading-none">
                            {cell.col}
                          </span>
                          <span className={`w-2 h-2 rounded-full ${dotColor}`} />
                        </div>

                        <div className="my-auto text-center w-full">
                          <span className="text-xs sm:text-sm font-black font-mono tracking-tight leading-tight block">
                            {cell.currentStock > 0 ? cell.currentStock.toLocaleString() : '—'}
                          </span>
                        </div>

                        <div className="w-full text-center">
                          <span className="text-[10px] text-slate-500 block truncate leading-none">
                            {cell.currentStock > 0
                              ? cell.packsCount > 0
                                ? `${cell.packsCount} ${cell.packUnit}`
                                : cell.baseUnit
                              : 'Empty'}
                          </span>
                        </div>
                      </button>
                    )
                  })}
                </div>
              )
            })}
          </div>
        </div>

        {/* Selected Bin Inspector Panel (Full Width) */}
        {selectedCell ? (
          <div className="mt-4 pt-4 border-t border-slate-200/80 space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-indigo-50/50 p-3.5 sm:p-4 rounded-xl border border-indigo-100">
              <div className="flex items-start sm:items-center gap-2.5 min-w-0 flex-1">
                <div className="w-8 h-8 rounded-lg bg-indigo-600 text-white flex items-center justify-center shrink-0 shadow-xs mt-0.5 sm:mt-0">
                  <QrCode className="w-4 h-4" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-xs sm:text-sm font-mono font-black text-indigo-950 whitespace-nowrap">
                      {selectedCell.code}
                    </span>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full border shrink-0 ${
                        selectedCell.status === 'Occupied'
                          ? 'bg-emerald-100 text-emerald-800 border-emerald-200'
                          : selectedCell.status === 'Full'
                          ? 'bg-rose-100 text-rose-800 border-rose-200'
                          : 'bg-blue-100 text-blue-800 border-blue-200'
                      }`}
                    >
                      {selectedCell.status}
                    </span>
                    <span className="hidden sm:inline text-[11px] text-slate-500">
                      {selectedCell.shadeName} (Row {selectedCell.row} • Col {selectedCell.col})
                    </span>
                  </div>
                  <p className="sm:hidden text-[11px] text-slate-500 mt-0.5 leading-relaxed">
                    {selectedCell.shadeName} (Row {selectedCell.row} • Col {selectedCell.col})
                  </p>
                </div>
                {/* Mobile Close Button */}
                <button
                  type="button"
                  onClick={() => setSelectedCell(null)}
                  className="sm:hidden p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-200/60 rounded-lg transition cursor-pointer shrink-0"
                  title="Close Inspector"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="flex items-center gap-2 w-full sm:w-auto shrink-0">
                <button
                  type="button"
                  onClick={() => handleOpenPrintQr(selectedCell)}
                  className="flex-1 sm:flex-none justify-center bg-indigo-600 hover:bg-indigo-700 text-white px-3.5 py-2 rounded-xl font-bold flex items-center gap-1.5 text-xs transition cursor-pointer shadow-xs text-center"
                >
                  <Printer className="w-3.5 h-3.5 shrink-0" />
                  <span>Print QR Sticker</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleOpenEdit(selectedCell)}
                  className="flex-1 sm:flex-none justify-center bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 px-3.5 py-2 rounded-xl font-semibold flex items-center gap-1.5 text-xs transition cursor-pointer shadow-xs text-center"
                >
                  <Edit2 className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                  <span>Edit Bin</span>
                </button>
                {/* Desktop Close Button */}
                <button
                  type="button"
                  onClick={() => setSelectedCell(null)}
                  className="hidden sm:block p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-200/60 rounded-lg transition cursor-pointer"
                  title="Close Inspector"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/80 space-y-1">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                  Stored Commodity
                </span>
                <p className="font-bold text-slate-800 truncate text-sm">
                  {selectedCell.productName}
                </p>
                <p className="text-[11px] text-slate-500">Category: {currentActiveShade.category}</p>
              </div>

              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/80 space-y-1">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                  Batch & Expiry
                </span>
                <p className="font-mono font-bold text-slate-800 text-sm">{selectedCell.batchNo}</p>
                <p className="text-[11px] text-slate-500">Expires: {selectedCell.expiryDate}</p>
              </div>

              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/80 space-y-1">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                  Stock Breakdown
                </span>
                <p className="font-mono font-black text-indigo-900 text-sm">
                  {selectedCell.currentStock.toLocaleString()} {selectedCell.baseUnit}
                </p>
                <p className="text-[11px] text-slate-500">
                  {selectedCell.packsCount} {selectedCell.packUnit} (1 {selectedCell.packUnit} = {selectedCell.unitsPerPack} {selectedCell.baseUnit})
                </p>
              </div>

              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/80 space-y-1">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                  Lab QC Status
                </span>
                <div className="flex items-center gap-2 pt-0.5">
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      selectedCell.labStatus === 'Passed'
                        ? 'bg-emerald-100 text-emerald-800'
                        : selectedCell.labStatus === 'Under Testing'
                        ? 'bg-amber-100 text-amber-800'
                        : 'bg-slate-100 text-slate-600'
                    }`}
                  >
                    {selectedCell.labStatus}
                  </span>
                  <span className="text-[11px] text-slate-500 font-medium">Capacity: {selectedCell.capacity} {selectedCell.baseUnit}</span>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="mt-3 py-3 px-4 bg-slate-50/80 border border-dashed border-slate-200 rounded-xl text-center text-xs text-slate-500 flex items-center justify-center gap-2">
            <MapPin className="w-3.5 h-3.5 text-slate-400" />
            <span>Click any bin cell in the 80-bin grid above to open the full Bin Inspector & print QR tag sticker.</span>
          </div>
        )}
      </div>

      {/* 100% Full-Width Master Bins Register Table */}
      <div className="bg-white rounded-2xl shadow-xs border border-slate-200/80 overflow-hidden">
        {/* Table Toolbar */}
        <div className="p-4 sm:p-5 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3.5">
          <div className="flex items-center gap-2.5">
            <Layers className="w-4 h-4 text-indigo-600" />
            <h2 className="text-sm font-bold text-slate-800">Master Bin Registry</h2>
            <span className="text-xs bg-slate-100 text-slate-600 font-semibold px-2 py-0.5 rounded-full border border-slate-200">
              {filteredLocations.length} bins
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 items-center text-xs">
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-3" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search bin, product, batch..."
                className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-8 pr-3 py-2 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 focus:bg-white"
              />
            </div>

            <CustomSelect
              value={shadeFilter}
              onChange={setShadeFilter}
              options={shadeOptions}
              zIndexClass="z-30"
            />

            <CustomSelect
              value={statusFilter}
              onChange={setStatusFilter}
              options={statusOptions}
              zIndexClass="z-30"
            />
          </div>
        </div>

        {/* Full-Width Table */}
        <div className="overflow-x-auto w-full">
          <table className="w-full text-left text-xs divide-y divide-slate-200">
            <thead className="bg-slate-50/80 text-slate-600 font-bold uppercase tracking-wider text-[11px]">
              <tr>
                <th className="py-3.5 px-4 w-12 text-center">#</th>
                <th className="py-3.5 px-4 min-w-[130px]">Bin Code</th>
                <th className="py-3.5 px-4 min-w-[170px]">Shade</th>
                <th className="py-3.5 px-4 min-w-[200px]">Product Stored</th>
                <th className="py-3.5 px-4 min-w-[120px]">Batch No.</th>
                <th className="py-3.5 px-4 text-center min-w-[120px]">Base Stock</th>
                <th className="py-3.5 px-4 text-center min-w-[110px]">Cartons Count</th>
                <th className="py-3.5 px-4 text-center min-w-[100px]">Lab QC</th>
                <th className="py-3.5 px-4 text-center min-w-[95px]">Status</th>
                <th className="py-3.5 px-4 text-center w-24">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 bg-white">
              {paginatedLocations.length === 0 ? (
                <tr>
                  <td colSpan="10" className="py-10 text-center text-slate-400">
                    No bin locations found matching your filter criteria.
                  </td>
                </tr>
              ) : (
                paginatedLocations.map((row, idx) => (
                  <tr key={row.id} className="hover:bg-slate-50/80 transition">
                    <td className="py-3.5 px-4 text-center text-slate-400 font-bold text-[11px]">
                      {(currentPage - 1) * perPage + idx + 1}
                    </td>
                    <td className="py-3.5 px-4 font-mono font-bold text-slate-900">
                      {row.code}
                    </td>
                    <td className="py-3.5 px-4 text-slate-700 font-medium">
                      {row.shadeName}
                    </td>
                    <td className="py-3.5 px-4 font-semibold text-slate-800">
                      {row.productName}
                    </td>
                    <td className="py-3.5 px-4 font-mono font-semibold text-slate-700 text-[11px]">
                      {row.batchNo}
                    </td>
                    <td className="py-3.5 px-4 text-center font-mono font-bold text-slate-900">
                      {row.currentStock} {row.baseUnit}
                    </td>
                    <td className="py-3.5 px-4 text-center font-mono text-slate-700">
                      {row.packsCount} {row.packUnit}
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      <span
                        className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          row.labStatus === 'Passed'
                            ? 'bg-emerald-100 text-emerald-800'
                            : row.labStatus === 'Under Testing'
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-slate-100 text-slate-600'
                        }`}
                      >
                        {row.labStatus}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      <span
                        className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${
                          row.status === 'Occupied'
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                            : row.status === 'Full'
                            ? 'bg-rose-50 text-rose-700 border-rose-200'
                            : 'bg-blue-50 text-blue-700 border-blue-200'
                        }`}
                      >
                        {row.status}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      <div className="flex items-center justify-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => handleOpenPrintQr(row)}
                          className="p-1.5 rounded-lg text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 border border-slate-200 transition"
                          title="Print QR Tag"
                        >
                          <QrCode className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleOpenEdit(row)}
                          className="p-1.5 rounded-lg text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 border border-slate-200 transition"
                          title="Edit Location"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
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
            Showing <strong>{filteredLocations.length > 0 ? (currentPage - 1) * perPage + 1 : 0}</strong> to{' '}
            <strong>{Math.min(currentPage * perPage, filteredLocations.length)}</strong> of{' '}
            <strong>{filteredLocations.length}</strong> bins
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

      {/* MODAL 1: Add / Edit Bin Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-4 sm:p-6 max-h-[90dvh] overflow-y-auto shadow-2xl border border-slate-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold">
                  <MapPin className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-bold text-sm text-slate-800">
                    {editingItem ? 'Edit Bin Location' : 'Register New Grid Bin'}
                  </h3>
                  <p className="text-[11px] text-slate-500">Configure coordinates &amp; base unit capacity</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowAddModal(false)}
                className="text-slate-400 hover:text-slate-700 p-1"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveLocation} className="pt-4 space-y-3.5 text-xs">
              <div className="grid grid-cols-3 gap-2.5">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Shade</label>
                  <CustomSelect
                    value={formData.shadeId}
                    onChange={(val) => {
                      const s = SHADES.find((x) => x.id === val)
                      setFormData({
                        ...formData,
                        shadeId: val,
                        code: `${val}-${formData.row}-${formData.col}`,
                        baseUnit: s?.baseUnit || formData.baseUnit,
                        packUnit: s?.packUnit || formData.packUnit,
                        unitsPerPack: s?.unitsPerPack || formData.unitsPerPack,
                      })
                    }}
                    options={SHADES.map((s) => ({ value: s.id, label: s.id, sublabel: s.category }))}
                    zIndexClass="z-40"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Row</label>
                  <input
                    type="text"
                    value={formData.row}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        row: e.target.value,
                        code: `${formData.shadeId}-${e.target.value}-${formData.col}`,
                      })
                    }
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2 text-xs font-mono font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 focus:bg-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Col</label>
                  <input
                    type="text"
                    value={formData.col}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        col: e.target.value,
                        code: `${formData.shadeId}-${formData.row}-${e.target.value}`,
                      })
                    }
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2 text-xs font-mono font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 focus:bg-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Generated Bin Code</label>
                <input
                  type="text"
                  readOnly
                  value={formData.code}
                  className="w-full bg-slate-100 border border-slate-200 rounded-xl p-2 text-xs font-mono font-bold text-indigo-700"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Commodity / Product</label>
                  <input
                    type="text"
                    value={formData.productName}
                    onChange={(e) => setFormData({ ...formData, productName: e.target.value })}
                    placeholder="e.g. Parle-G Glucose Biscuits"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 focus:bg-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Batch Number</label>
                  <input
                    type="text"
                    value={formData.batchNo}
                    onChange={(e) => setFormData({ ...formData, batchNo: e.target.value })}
                    placeholder="e.g. BT-2026-FMCG-01"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2 text-xs font-mono text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 focus:bg-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Base Capacity</label>
                  <input
                    type="number"
                    value={formData.capacity}
                    onChange={(e) => setFormData({ ...formData, capacity: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2 text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 focus:bg-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Current Stock</label>
                  <input
                    type="number"
                    value={formData.currentStock}
                    onChange={(e) => setFormData({ ...formData, currentStock: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2 text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 focus:bg-white"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="flex-1 sm:flex-none justify-center px-4 py-2 border border-slate-300 rounded-xl text-xs font-semibold text-slate-700 hover:bg-slate-50 transition cursor-pointer text-center"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 sm:flex-none justify-center bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2 rounded-xl text-xs font-bold transition cursor-pointer text-center"
                >
                  Save Bin
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: Print Bin QR Modal */}
      {showPrintModal && qrModalBin && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
          <div className="bg-white rounded-2xl max-w-sm w-full p-4 sm:p-6 max-h-[90dvh] overflow-y-auto shadow-2xl border border-slate-200 text-center space-y-4">
            <div className="flex items-center justify-between border-b pb-2.5 border-slate-100">
              <h3 className="text-sm font-bold text-slate-800">Physical Bin QR Locator Tag</h3>
              <button
                type="button"
                onClick={() => setShowPrintModal(false)}
                className="text-slate-400 hover:text-slate-700 p-1"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Printable Bin Tag Preview */}
            <div className="border-2 border-slate-900 rounded-xl p-4 bg-white space-y-2.5 text-center">
              <div className="text-[10px] font-black uppercase tracking-wider text-slate-500">
                CENTRAL WAREHOUSE • LOCATION TAG
              </div>
              <div className="text-2xl font-black font-mono tracking-widest text-slate-900 py-1 bg-slate-50 rounded border border-dashed border-slate-300">
                {qrModalBin.code}
              </div>
              <div className="w-32 h-32 mx-auto border border-slate-300 p-1.5 rounded-lg flex items-center justify-center">
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
              <div className="text-[11px] font-semibold text-slate-800">
                {qrModalBin.shadeName}
              </div>
              <div className="text-[10px] text-slate-500 font-mono">
                Capacity: {qrModalBin.capacity} {qrModalBin.baseUnit}
              </div>
            </div>

            <div className="flex gap-2 pt-1">
              <button
                type="button"
                onClick={() => setShowPrintModal(false)}
                className="flex-1 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition"
              >
                Close
              </button>
              <button
                type="button"
                onClick={() => window.print()}
                className="flex-1 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl transition flex items-center justify-center gap-1.5"
              >
                <Printer className="w-4 h-4" />
                <span>Print Tag</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 3: Bulk Import Modal */}
      {showBulkModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-4 sm:p-6 max-h-[90dvh] overflow-y-auto shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <h3 className="text-sm font-bold text-slate-800">Bulk Bin Import</h3>
              <button
                type="button"
                onClick={() => setShowBulkModal(false)}
                className="text-slate-400 hover:text-slate-700 p-1"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="border-2 border-dashed border-slate-300 hover:border-indigo-500 rounded-2xl p-6 text-center bg-slate-50 transition cursor-pointer space-y-2">
              <div className="w-10 h-10 rounded-full bg-indigo-50 text-indigo-600 mx-auto flex items-center justify-center">
                <FileSpreadsheet className="w-5 h-5" />
              </div>
              <p className="text-xs font-bold text-slate-800">Drop your bin layout spreadsheet here (.xlsx / .csv)</p>
              <p className="text-[11px] text-slate-500">Columns: ShadeId, Row, Col, Capacity, BaseUnit</p>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setShowBulkModal(false)}
                className="flex-1 sm:flex-none justify-center px-4 py-2 border border-slate-300 rounded-xl text-xs font-semibold text-slate-700 hover:bg-slate-50 transition cursor-pointer text-center"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowBulkModal(false)
                  triggerToast('Imported 80 bins successfully into Shade 3.')
                }}
                className="flex-1 sm:flex-none justify-center bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2 rounded-xl text-xs font-bold transition cursor-pointer text-center"
              >
                Upload &amp; Sync
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
