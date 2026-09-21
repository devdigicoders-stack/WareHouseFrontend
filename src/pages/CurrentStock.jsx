import { useState, useMemo, useRef, useEffect } from 'react'
import { Link } from 'react-router-dom'
import {
  X,
  Package,
  Layers,
  CheckCircle2,
  AlertTriangle,
  QrCode,
  Download,
  Printer,
  Plus,
  Search,
  Eye,
  RotateCcw,
  Warehouse,
  ChevronDown,
  Check,
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
        className="w-full bg-slate-50 hover:bg-slate-100/80 border border-slate-200 rounded-xl px-3 py-2 text-left text-xs font-semibold text-slate-700 flex items-center justify-between gap-2 transition cursor-pointer focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
      >
        <span className="truncate">
          {selectedOption ? selectedOption.label : placeholder}
        </span>
        <ChevronDown className={`w-3.5 h-3.5 text-slate-400 transition-transform shrink-0 ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className={`absolute top-full left-0 mt-1.5 w-full bg-white border border-slate-200 rounded-xl shadow-xl py-1 ${zIndexClass} max-h-56 overflow-y-auto no-scrollbar animate-in fade-in zoom-in-95 duration-100`}>
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
                className={`w-full px-3 py-2 text-left text-xs flex items-center justify-between transition cursor-pointer ${
                  isSelected
                    ? 'bg-indigo-50 text-indigo-700 font-bold'
                    : 'text-slate-700 hover:bg-slate-50'
                }`}
              >
                <div className="truncate">
                  <div>{opt.label}</div>
                  {opt.sublabel && (
                    <div className="text-[10px] text-slate-400 font-normal">{opt.sublabel}</div>
                  )}
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

export default function CurrentStock() {
  // Toast notifications state
  const [toastMessage, setToastMessage] = useState(null)
  const triggerToast = (msg) => {
    setToastMessage(msg)
    setTimeout(() => setToastMessage(null), 3500)
  }

  // Filter toolbar state
  const [filterShade, setFilterShade] = useState('ALL')
  const [filterCategory, setFilterCategory] = useState('ALL')
  const [filterLabStatus, setFilterLabStatus] = useState('ALL')
  const [filterStockLevel, setFilterStockLevel] = useState('ALL')
  const [searchQuery, setSearchQuery] = useState('')

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1)
  const perPage = 8

  // Modals state
  const [showAddModal, setShowAddModal] = useState(false)
  const [showDetailsModal, setShowDetailsModal] = useState(null)
  const [showQrModal, setShowQrModal] = useState(null)

  // 6 Dedicated Shades
  const SHADES = [
    { id: 'SH01', name: 'Shade 1: Grains & Bulk Pulses', category: 'Grains & Pulses', baseUnit: 'Kg', packUnit: 'Bags (50kg)', unitsPerPack: 50 },
    { id: 'SH02', name: 'Shade 2: Edible Oils & Liquids', category: 'Edible Oils', baseUnit: 'Ltr', packUnit: 'Tins (15L)', unitsPerPack: 15 },
    { id: 'SH03', name: 'Shade 3: Packaged Food & FMCG', category: 'Packaged FMCG', baseUnit: 'Pieces', packUnit: 'Gatta (Cartons)', unitsPerPack: 6 },
    { id: 'SH04', name: 'Shade 4: Packaging Materials & Cartons', category: 'Packaging', baseUnit: 'Cartons', packUnit: 'Bundles', unitsPerPack: 25 },
    { id: 'SH05', name: 'Shade 5: Chemicals & Hygiene', category: 'Chemicals', baseUnit: 'Ltr', packUnit: 'Barrels (200L)', unitsPerPack: 200 },
    { id: 'SH06', name: 'Shade 6: Spares & General Goods', category: 'Spares', baseUnit: 'Nos', packUnit: 'Crates', unitsPerPack: 10 },
  ]

  // Add Stock Form State
  const [newStock, setNewStock] = useState({
    productName: '',
    sku: '',
    batchNo: '',
    shadeId: 'SH03',
    row: 'R01',
    col: 'C01',
    baseUnit: 'Pieces',
    packUnit: 'Gatta',
    unitsPerPack: 6,
    packsCount: 100,
    availableQty: 600,
    reservedQty: 0,
    expiryDate: '15 Mar 2027',
    labStatus: 'Passed',
    status: 'In Stock',
  })

  // Stock List Table Data
  const [stockData, setStockData] = useState([
    {
      id: 1,
      productName: 'Parle-G Glucose Biscuits (50g)',
      sku: 'FMCG-BIS-01',
      batchNo: 'BT-2026-FMCG-01',
      category: 'Packaged FMCG',
      shadeId: 'SH03',
      shadeName: 'Shade 3: Packaged Food & FMCG',
      row: 'R02',
      col: 'C04',
      location: 'SH03-R02-C04',
      baseUnit: 'Pieces',
      packUnit: 'Gatta',
      unitsPerPack: 6,
      packsCount: 150,
      availableQty: 900,
      reservedQty: 120,
      totalQty: 1020,
      labStatus: 'Passed',
      labCertNo: 'LAB-2026-FMCG-088',
      expiryDate: '15 Mar 2027',
      status: 'In Stock',
      reorderLevel: 200,
    },
    {
      id: 2,
      productName: 'Good Day Butter Cookies (75g)',
      sku: 'FMCG-BIS-02',
      batchNo: 'BT-2026-FMCG-02',
      category: 'Packaged FMCG',
      shadeId: 'SH03',
      shadeName: 'Shade 3: Packaged Food & FMCG',
      row: 'R02',
      col: 'C05',
      location: 'SH03-R02-C05',
      baseUnit: 'Pieces',
      packUnit: 'Gatta',
      unitsPerPack: 12,
      packsCount: 100,
      availableQty: 1200,
      reservedQty: 0,
      totalQty: 1200,
      labStatus: 'Passed',
      labCertNo: 'LAB-2026-FMCG-091',
      expiryDate: '28 Jun 2027',
      status: 'In Stock',
      reorderLevel: 250,
    },
    {
      id: 3,
      productName: 'Sharbati Wheat Grain (Grade A)',
      sku: 'GRN-WHT-01',
      batchNo: 'BT-2026-GRN-09',
      category: 'Grains & Pulses',
      shadeId: 'SH01',
      shadeName: 'Shade 1: Grains & Bulk Pulses',
      row: 'R02',
      col: 'C08',
      location: 'SH01-R02-C08',
      baseUnit: 'Kg',
      packUnit: 'Bags (50kg)',
      unitsPerPack: 50,
      packsCount: 40,
      availableQty: 2000,
      reservedQty: 200,
      totalQty: 2200,
      labStatus: 'Passed',
      labCertNo: 'LAB-2026-GRN-104',
      expiryDate: '30 Nov 2027',
      status: 'In Stock',
      reorderLevel: 500,
    },
    {
      id: 4,
      productName: 'Fortune Refined Sunflower Oil',
      sku: 'OIL-SUN-01',
      batchNo: 'BT-2026-OIL-14',
      category: 'Edible Oils',
      shadeId: 'SH02',
      shadeName: 'Shade 2: Edible Oils & Liquids',
      row: 'R01',
      col: 'C02',
      location: 'SH02-R01-C02',
      baseUnit: 'Ltr',
      packUnit: 'Tins (15L)',
      unitsPerPack: 15,
      packsCount: 60,
      availableQty: 900,
      reservedQty: 90,
      totalQty: 990,
      labStatus: 'Passed',
      labCertNo: 'LAB-2026-OIL-052',
      expiryDate: '15 Oct 2027',
      status: 'In Stock',
      reorderLevel: 300,
    },
    {
      id: 5,
      productName: 'Tata Premium Tea (500g)',
      sku: 'FMCG-TEA-01',
      batchNo: 'BT-2026-FMCG-11',
      category: 'Packaged FMCG',
      shadeId: 'SH03',
      shadeName: 'Shade 3: Packaged Food & FMCG',
      row: 'R01',
      col: 'C06',
      location: 'SH03-R01-C06',
      baseUnit: 'Pieces',
      packUnit: 'Gatta',
      unitsPerPack: 24,
      packsCount: 15,
      availableQty: 360,
      reservedQty: 0,
      totalQty: 360,
      labStatus: 'Under Testing',
      labCertNo: 'LAB-PENDING-QC',
      expiryDate: '10 Dec 2027',
      status: 'In Stock',
      reorderLevel: 200,
    },
    {
      id: 6,
      productName: 'Basmati Rice (Classic Grade)',
      sku: 'GRN-RIC-02',
      batchNo: 'BT-2026-GRN-15',
      category: 'Grains & Pulses',
      shadeId: 'SH01',
      shadeName: 'Shade 1: Grains & Bulk Pulses',
      row: 'R03',
      col: 'C07',
      location: 'SH01-R03-C07',
      baseUnit: 'Kg',
      packUnit: 'Bags (50kg)',
      unitsPerPack: 50,
      packsCount: 10,
      availableQty: 500,
      reservedQty: 0,
      totalQty: 500,
      labStatus: 'Passed',
      labCertNo: 'LAB-2026-GRN-112',
      expiryDate: '20 Jan 2028',
      status: 'Low Stock',
      reorderLevel: 800,
    },
    {
      id: 7,
      productName: 'Industrial Disinfectant Concentrate',
      sku: 'CHM-DIS-01',
      batchNo: 'BT-2026-CHM-03',
      category: 'Chemicals',
      shadeId: 'SH05',
      shadeName: 'Shade 5: Chemicals & Hygiene',
      row: 'R01',
      col: 'C03',
      location: 'SH05-R01-C03',
      baseUnit: 'Ltr',
      packUnit: 'Carboys (20L)',
      unitsPerPack: 20,
      packsCount: 25,
      availableQty: 500,
      reservedQty: 40,
      totalQty: 540,
      labStatus: 'Passed',
      labCertNo: 'LAB-2026-CHM-019',
      expiryDate: '14 May 2028',
      status: 'In Stock',
      reorderLevel: 100,
    },
    {
      id: 8,
      productName: 'Corrugated Shipping Cartons (5-Ply)',
      sku: 'PKG-BOX-01',
      batchNo: 'BT-2026-PKG-08',
      category: 'Packaging',
      shadeId: 'SH04',
      shadeName: 'Shade 4: Packaging Materials & Cartons',
      row: 'R02',
      col: 'C02',
      location: 'SH04-R02-C02',
      baseUnit: 'Cartons',
      packUnit: 'Bundles',
      unitsPerPack: 25,
      packsCount: 80,
      availableQty: 2000,
      reservedQty: 0,
      totalQty: 2000,
      labStatus: 'Passed',
      labCertNo: 'LAB-2026-PKG-041',
      expiryDate: '31 Dec 2029',
      status: 'In Stock',
      reorderLevel: 500,
    },
  ])

  // Filtered Stock Items
  const filteredStock = useMemo(() => {
    return stockData.filter((item) => {
      if (filterShade !== 'ALL' && item.shadeId !== filterShade) return false
      if (filterCategory !== 'ALL' && item.category !== filterCategory) return false
      if (filterLabStatus !== 'ALL' && item.labStatus !== filterLabStatus) return false
      if (filterStockLevel === 'Low Stock' && item.status !== 'Low Stock') return false
      if (filterStockLevel === 'In Stock' && item.status !== 'In Stock') return false

      if (searchQuery.trim() !== '') {
        const q = searchQuery.toLowerCase()
        return (
          item.productName.toLowerCase().includes(q) ||
          item.sku.toLowerCase().includes(q) ||
          item.batchNo.toLowerCase().includes(q) ||
          item.location.toLowerCase().includes(q) ||
          item.category.toLowerCase().includes(q)
        )
      }
      return true
    })
  }, [stockData, filterShade, filterCategory, filterLabStatus, filterStockLevel, searchQuery])

  // Paginated List
  const totalPages = Math.max(1, Math.ceil(filteredStock.length / perPage))
  const paginatedStock = filteredStock.slice((currentPage - 1) * perPage, currentPage * perPage)

  // Dynamic KPI Aggregates
  const stats = useMemo(() => {
    const totalBaseUnits = stockData.reduce((sum, i) => sum + i.availableQty, 0)
    const totalPacks = stockData.reduce((sum, i) => sum + i.packsCount, 0)
    const labPassedUnits = stockData
      .filter((i) => i.labStatus === 'Passed')
      .reduce((sum, i) => sum + i.availableQty, 0)
    const lowStockCount = stockData.filter((i) => i.status === 'Low Stock').length
    const clearancePct = totalBaseUnits > 0 ? Math.round((labPassedUnits / totalBaseUnits) * 100) : 100
    return { totalBaseUnits, totalPacks, labPassedUnits, lowStockCount, clearancePct }
  }, [stockData])

  // Handle Add Stock Submit
  const handleAddStockSubmit = (e) => {
    e.preventDefault()
    if (!newStock.productName || !newStock.sku || !newStock.batchNo) {
      triggerToast('Please complete all required fields.')
      return
    }

    const computedBase = (Number(newStock.packsCount) || 0) * (Number(newStock.unitsPerPack) || 1)
    const locCode = `${newStock.shadeId}-${newStock.row}-${newStock.col}`
    const matchedShade = SHADES.find((s) => s.id === newStock.shadeId)

    const newEntry = {
      id: Date.now(),
      productName: newStock.productName,
      sku: newStock.sku,
      batchNo: newStock.batchNo,
      category: matchedShade?.category || 'General',
      shadeId: newStock.shadeId,
      shadeName: matchedShade?.name || newStock.shadeId,
      row: newStock.row,
      col: newStock.col,
      location: locCode,
      baseUnit: newStock.baseUnit,
      packUnit: newStock.packUnit,
      unitsPerPack: Number(newStock.unitsPerPack) || 1,
      packsCount: Number(newStock.packsCount) || 1,
      availableQty: computedBase,
      reservedQty: 0,
      totalQty: computedBase,
      labStatus: newStock.labStatus,
      labCertNo: newStock.labStatus === 'Passed' ? `LAB-2026-${Date.now().toString().slice(-4)}` : 'PENDING-QC',
      expiryDate: newStock.expiryDate || '31 Dec 2027',
      status: newStock.status,
      reorderLevel: 200,
    }

    setStockData([newEntry, ...stockData])
    setShowAddModal(false)
    triggerToast(`Added ${computedBase} ${newEntry.baseUnit} of ${newEntry.productName}.`)
  }

  // Export CSV
  const handleExportCSV = () => {
    const headers = [
      '#',
      'Product Name',
      'SKU',
      'Batch No',
      'Category',
      'Shade',
      'Storage Bin',
      'Base Unit Stock',
      'Base Unit',
      'Packaging Packs',
      'Pack Unit',
      'Units Per Pack',
      'Lab Status',
      'Expiry Date',
      'Status',
    ]
    const rows = filteredStock.map((row, idx) => [
      idx + 1,
      `"${row.productName}"`,
      row.sku,
      row.batchNo,
      `"${row.category}"`,
      `"${row.shadeName}"`,
      row.location,
      row.availableQty,
      row.baseUnit,
      row.packsCount,
      `"${row.packUnit}"`,
      row.unitsPerPack,
      row.labStatus,
      row.expiryDate,
      row.status,
    ])
    const csvContent =
      'data:text/csv;charset=utf-8,' +
      [headers.join(','), ...rows.map((e) => e.join(','))].join('\n')
    const encodedUri = encodeURI(csvContent)
    const link = document.createElement('a')
    link.setAttribute('href', encodedUri)
    link.setAttribute('download', 'Current_Stock_Inventory.csv')
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    triggerToast('Current Stock Inventory exported to CSV.')
  }

  // Filter Dropdown Options
  const categoryOptions = [
    { value: 'ALL', label: 'All Categories' },
    { value: 'Packaged FMCG', label: 'Packaged FMCG' },
    { value: 'Grains & Pulses', label: 'Grains & Pulses' },
    { value: 'Edible Oils', label: 'Edible Oils' },
    { value: 'Packaging', label: 'Packaging Materials' },
    { value: 'Chemicals', label: 'Chemicals & Hygiene' },
    { value: 'Spares', label: 'Spares & General' },
  ]

  const labStatusOptions = [
    { value: 'ALL', label: 'All Lab Status' },
    { value: 'Passed', label: 'Lab Clearance Passed' },
    { value: 'Under Testing', label: 'Under QC Testing' },
  ]

  const stockLevelOptions = [
    { value: 'ALL', label: 'All Stock Levels' },
    { value: 'In Stock', label: 'Optimal In Stock' },
    { value: 'Low Stock', label: 'Low Stock Alerts' },
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
      <div className="bg-white rounded-2xl p-5 shadow-xs border border-slate-200/80 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 shadow-xs shrink-0">
            <Package className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-slate-800 tracking-tight">Current Stock Registry</h1>
            <p className="text-xs text-slate-500 font-medium mt-0.5">
              Live inventory balances, dual-unit conversion ratios, and lab clearance status across 6 warehouse shades.
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <Link
            to="/location-master"
            className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold shadow-xs transition"
          >
            <Warehouse className="w-3.5 h-3.5 text-slate-500" />
            <span>2D Bin Matrix</span>
          </Link>

          <button
            type="button"
            onClick={handleExportCSV}
            className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold shadow-xs transition"
          >
            <Download className="w-3.5 h-3.5 text-slate-500" />
            <span>Export CSV</span>
          </button>

          <button
            type="button"
            onClick={() => setShowAddModal(true)}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-sm transition"
          >
            <Plus className="w-4 h-4" />
            <span>Add Stock Item</span>
          </button>
        </div>
      </div>

      {/* 4 Dynamic KPI Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5">
        <div className="bg-white rounded-2xl p-4 shadow-xs border border-slate-200/80 flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 border border-indigo-100 flex items-center justify-center shrink-0">
            <Package className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-500">Total Base Units</p>
            <h3 className="text-xl font-bold text-slate-800 leading-tight mt-0.5">
              {stats.totalBaseUnits.toLocaleString()}
            </h3>
            <p className="text-[11px] text-indigo-600 font-medium">Pieces, Kg, Ltr &amp; Cartons</p>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-4 shadow-xs border border-slate-200/80 flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 border border-emerald-100 flex items-center justify-center shrink-0">
            <Layers className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-500">Packaging Cartons / Packs</p>
            <h3 className="text-xl font-bold text-slate-800 leading-tight mt-0.5">
              {stats.totalPacks.toLocaleString()} Packs
            </h3>
            <p className="text-[11px] text-emerald-600 font-medium">Physical handling units</p>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-4 shadow-xs border border-slate-200/80 flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 border border-blue-100 flex items-center justify-center shrink-0">
            <CheckCircle2 className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-500">Lab Approved Stock</p>
            <h3 className="text-xl font-bold text-slate-800 leading-tight mt-0.5">
              {stats.clearancePct}% Cleared
            </h3>
            <p className="text-[11px] text-blue-600 font-medium">{stats.labPassedUnits.toLocaleString()} ready for dispatch</p>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-4 shadow-xs border border-slate-200/80 flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 border border-amber-100 flex items-center justify-center shrink-0">
            <AlertTriangle className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-500">Reorder Level Alerts</p>
            <h3 className="text-xl font-bold text-slate-800 leading-tight mt-0.5">
              {stats.lowStockCount} Items
            </h3>
            <p className="text-[11px] text-amber-600 font-medium">Stock below threshold</p>
          </div>
        </div>
      </div>

      {/* 6 Dedicated Shades Switcher Tabs */}
      <div className="bg-white rounded-2xl p-3 shadow-xs border border-slate-200/80">
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar">
          <button
            type="button"
            onClick={() => {
              setFilterShade('ALL')
              setCurrentPage(1)
            }}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 whitespace-nowrap cursor-pointer shrink-0 ${
              filterShade === 'ALL'
                ? 'bg-indigo-600 text-white shadow-sm ring-2 ring-indigo-600/20'
                : 'bg-slate-50 text-slate-700 hover:bg-slate-100 border border-slate-200/80'
            }`}
          >
            <span>All 6 Shades</span>
            <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono ${filterShade === 'ALL' ? 'bg-white/20 text-white' : 'bg-slate-200 text-slate-700'}`}>
              {stockData.length}
            </span>
          </button>
          {SHADES.map((s) => {
            const isActive = filterShade === s.id
            const count = stockData.filter((i) => i.shadeId === s.id).length
            return (
              <button
                key={s.id}
                type="button"
                onClick={() => {
                  setFilterShade(s.id)
                  setCurrentPage(1)
                }}
                className={`px-3.5 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 whitespace-nowrap cursor-pointer shrink-0 ${
                  isActive
                    ? 'bg-indigo-600 text-white shadow-sm ring-2 ring-indigo-600/20'
                    : 'bg-slate-50 text-slate-700 hover:bg-slate-100 border border-slate-200/80'
                }`}
              >
                <span className="font-mono">{s.id}:</span>
                <span>{s.category}</span>
                <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono ${isActive ? 'bg-white/20 text-white' : 'bg-slate-200 text-slate-700'}`}>
                  {count}
                </span>
              </button>
            )
          })}
        </div>
      </div>

      {/* 100% Full-Width Master Inventory Register Card */}
      <div className="bg-white rounded-2xl shadow-xs border border-slate-200/80 overflow-hidden">
        {/* Table Filter Toolbar */}
        <div className="p-5 border-b border-slate-100 space-y-4">
          {/* Top Line: Section Title & Results Count */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
                <Package className="w-4 h-4" />
              </div>
              <div>
                <h2 className="text-sm font-bold text-slate-800">Master Stock Registry</h2>
                <p className="text-[11px] text-slate-500">Live item balances, batch allocations, and bin coordinates across all warehouse shades.</p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs bg-indigo-50 text-indigo-700 font-bold px-3 py-1 rounded-full border border-indigo-200/60">
                {filteredStock.length} Items Found
              </span>
              {(searchQuery || filterShade !== 'ALL' || filterCategory !== 'ALL' || filterLabStatus !== 'ALL' || filterStockLevel !== 'ALL') && (
                <button
                  type="button"
                  onClick={() => {
                    setFilterShade('ALL')
                    setFilterCategory('ALL')
                    setFilterLabStatus('ALL')
                    setFilterStockLevel('ALL')
                    setSearchQuery('')
                    setCurrentPage(1)
                    triggerToast('Filters reset to default.')
                  }}
                  className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-600 text-xs font-semibold transition cursor-pointer"
                >
                  <RotateCcw className="w-3 h-3 text-slate-400" />
                  <span>Reset Filters</span>
                </button>
              )}
            </div>
          </div>

          {/* Main Keyword Search Bar */}
          <div className="relative w-full">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value)
                setCurrentPage(1)
              }}
              placeholder="Search product name, SKU code, batch number, or bin coordinate..."
              className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-10 py-2.5 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 focus:bg-white transition"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600 p-0.5 rounded-full cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* 4 Filter Dropdowns in Spacious Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 pt-1 text-xs">
            <div>
              <label className="block text-[11px] font-bold text-slate-600 mb-1.5">
                Category
              </label>
              <CustomSelect
                value={filterCategory}
                onChange={(val) => {
                  setFilterCategory(val)
                  setCurrentPage(1)
                }}
                options={categoryOptions}
                placeholder="All Categories"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-600 mb-1.5">
                Lab Clearance Status
              </label>
              <CustomSelect
                value={filterLabStatus}
                onChange={(val) => {
                  setFilterLabStatus(val)
                  setCurrentPage(1)
                }}
                options={labStatusOptions}
                placeholder="All Lab Status"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-600 mb-1.5">
                Stock Availability
              </label>
              <CustomSelect
                value={filterStockLevel}
                onChange={(val) => {
                  setFilterStockLevel(val)
                  setCurrentPage(1)
                }}
                options={stockLevelOptions}
                placeholder="Stock Level"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-600 mb-1.5">
                Warehouse Shade
              </label>
              <CustomSelect
                value={filterShade}
                onChange={(val) => {
                  setFilterShade(val)
                  setCurrentPage(1)
                }}
                options={[
                  { value: 'ALL', label: 'All 6 Dedicated Shades' },
                  ...SHADES.map((s) => ({ value: s.id, label: s.name })),
                ]}
                placeholder="All Shades"
              />
            </div>
          </div>
        </div>

        {/* Master Stock Table */}
        <div className="overflow-x-auto no-scrollbar">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-50/75 border-b border-slate-200/80 text-slate-500 font-semibold uppercase tracking-wider text-[10px]">
                <th className="py-3 px-4 w-12 text-center">#</th>
                <th className="py-3 px-4 min-w-[200px]">Product &amp; SKU</th>
                <th className="py-3 px-4 min-w-[150px]">Storage Bin &amp; Shade</th>
                <th className="py-3 px-4 min-w-[120px]">Batch No</th>
                <th className="py-3 px-4 min-w-[130px] text-right">Available Stock</th>
                <th className="py-3 px-4 min-w-[140px] text-right">Packaging Packs</th>
                <th className="py-3 px-4 min-w-[120px] text-center">Lab QC Status</th>
                <th className="py-3 px-4 min-w-[110px]">Expiry Date</th>
                <th className="py-3 px-4 min-w-[100px] text-center">Stock Level</th>
                <th className="py-3 px-4 text-center w-28">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {paginatedStock.length === 0 ? (
                <tr>
                  <td colSpan="10" className="py-12 text-center text-slate-400">
                    <Package className="w-8 h-8 mx-auto text-slate-300 mb-2" />
                    <p className="font-semibold text-slate-600">No stock records found</p>
                    <p className="text-[11px] text-slate-400 mt-0.5">Try adjusting search query or active shade filters.</p>
                  </td>
                </tr>
              ) : (
                paginatedStock.map((row, idx) => (
                  <tr key={row.id} className="hover:bg-indigo-50/20 transition">
                    <td className="py-3.5 px-4 text-center text-slate-400 font-bold">
                      {(currentPage - 1) * perPage + idx + 1}
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="font-bold text-slate-900">{row.productName}</div>
                      <div className="text-[10px] text-slate-400 font-mono mt-0.5">
                        {row.sku} • <span className="text-slate-500 font-sans">{row.category}</span>
                      </div>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="font-mono font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded border border-indigo-200/60 text-[11px]">
                        {row.location}
                      </span>
                      <div className="text-[10px] text-slate-500 mt-1 truncate max-w-[150px]">
                        {row.shadeName}
                      </div>
                    </td>
                    <td className="py-3.5 px-4 font-mono font-bold text-slate-700">
                      {row.batchNo}
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <span className="font-mono font-black text-slate-900 text-xs">
                        {row.availableQty.toLocaleString()}
                      </span>
                      <span className="text-[11px] text-slate-500 ml-1">{row.baseUnit}</span>
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <span className="font-bold text-slate-800">
                        {row.packsCount} {row.packUnit}
                      </span>
                      <div className="text-[10px] text-slate-400">
                        @ {row.unitsPerPack} {row.baseUnit}/pack
                      </div>
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                          row.labStatus === 'Passed'
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                            : 'bg-amber-50 text-amber-700 border-amber-200'
                        }`}
                      >
                        {row.labStatus === 'Passed' ? '✓ Passed' : row.labStatus}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 font-mono text-[11px] text-slate-600">
                      {row.expiryDate}
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          row.status === 'In Stock'
                            ? 'bg-slate-100 text-slate-700'
                            : 'bg-rose-50 text-rose-700 border border-rose-200 font-black'
                        }`}
                      >
                        {row.status}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      <div className="flex items-center justify-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => setShowDetailsModal(row)}
                          className="p-1.5 rounded-lg text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 transition cursor-pointer"
                          title="View Details"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => setShowQrModal(row)}
                          className="p-1.5 rounded-lg text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 transition cursor-pointer"
                          title="Print QR Sticker"
                        >
                          <QrCode className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Table Pagination Footer */}
        <div className="p-4 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-slate-500">
          <div>
            Showing <span className="font-semibold text-slate-800">{filteredStock.length === 0 ? 0 : (currentPage - 1) * perPage + 1}</span> to{' '}
            <span className="font-semibold text-slate-800">{Math.min(currentPage * perPage, filteredStock.length)}</span> of{' '}
            <span className="font-semibold text-slate-800">{filteredStock.length}</span> results
          </div>

          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="px-3 py-1.5 rounded-lg border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 font-semibold disabled:opacity-40 disabled:cursor-not-allowed transition"
            >
              Previous
            </button>
            <span className="px-3 py-1.5 text-slate-700 font-bold">
              Page {currentPage} of {totalPages}
            </span>
            <button
              type="button"
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="px-3 py-1.5 rounded-lg border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 font-semibold disabled:opacity-40 disabled:cursor-not-allowed transition"
            >
              Next
            </button>
          </div>
        </div>
      </div>

      {/* MODAL 1: ADD STOCK ITEM */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
                  <Package className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">Add Stock Item</h3>
                  <p className="text-[11px] text-slate-500">Record inventory balance with dual-unit packaging ratio.</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowAddModal(false)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg transition"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleAddStockSubmit} className="space-y-3.5 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">Product Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Basmati Rice (50kg Bags)"
                    value={newStock.productName}
                    onChange={(e) => setNewStock({ ...newStock, productName: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">SKU Code *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. GRN-RIC-01"
                    value={newStock.sku}
                    onChange={(e) => setNewStock({ ...newStock, sku: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 font-mono text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">Batch Number *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. BT-2026-GRN-101"
                    value={newStock.batchNo}
                    onChange={(e) => setNewStock({ ...newStock, batchNo: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 font-mono text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">Expiry Date</label>
                  <input
                    type="text"
                    placeholder="e.g. 30 Nov 2027"
                    value={newStock.expiryDate}
                    onChange={(e) => setNewStock({ ...newStock, expiryDate: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 font-mono text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">Target Shade</label>
                  <CustomSelect
                    value={newStock.shadeId}
                    onChange={(val) => {
                      const matched = SHADES.find((s) => s.id === val)
                      setNewStock({
                        ...newStock,
                        shadeId: val,
                        baseUnit: matched?.baseUnit || newStock.baseUnit,
                        packUnit: matched?.packUnit || newStock.packUnit,
                        unitsPerPack: matched?.unitsPerPack || newStock.unitsPerPack,
                      })
                    }}
                    options={SHADES.map((s) => ({ value: s.id, label: s.name }))}
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">Row</label>
                  <input
                    type="text"
                    value={newStock.row}
                    onChange={(e) => setNewStock({ ...newStock, row: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 font-mono text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">Column</label>
                  <input
                    type="text"
                    value={newStock.col}
                    onChange={(e) => setNewStock({ ...newStock, col: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 font-mono text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                  />
                </div>
              </div>

              {/* Packaging Conversion Ratio Card */}
              <div className="p-3.5 bg-indigo-50/50 border border-indigo-100 rounded-xl space-y-2">
                <span className="text-[11px] font-bold text-indigo-950">Packaging Conversion Calculation</span>
                <div className="grid grid-cols-3 gap-2.5 text-xs">
                  <div>
                    <label className="block text-[10px] font-semibold text-slate-600 mb-1">Packs Count</label>
                    <input
                      type="number"
                      value={newStock.packsCount}
                      onChange={(e) => setNewStock({ ...newStock, packsCount: e.target.value })}
                      className="w-full bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 font-mono font-bold text-slate-800 focus:outline-none focus:border-indigo-500"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-semibold text-slate-600 mb-1">Units / Pack</label>
                    <input
                      type="number"
                      value={newStock.unitsPerPack}
                      onChange={(e) => setNewStock({ ...newStock, unitsPerPack: e.target.value })}
                      className="w-full bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 font-mono font-bold text-slate-800 focus:outline-none focus:border-indigo-500"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-semibold text-slate-600 mb-1">Base Unit</label>
                    <input
                      type="text"
                      value={newStock.baseUnit}
                      onChange={(e) => setNewStock({ ...newStock, baseUnit: e.target.value })}
                      className="w-full bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 font-bold text-slate-800 focus:outline-none focus:border-indigo-500"
                    />
                  </div>
                </div>
                <div className="flex items-center justify-between text-[11px] text-indigo-900 font-bold pt-1 border-t border-indigo-100">
                  <span>Computed Base Units:</span>
                  <span className="font-mono text-xs">
                    {((Number(newStock.packsCount) || 0) * (Number(newStock.unitsPerPack) || 1)).toLocaleString()} {newStock.baseUnit}
                  </span>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 rounded-xl font-semibold transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold shadow-sm transition cursor-pointer"
                >
                  Save Stock Item
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: VIEW DETAILS */}
      {showDetailsModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-4 text-xs animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
                  <Eye className="w-4 h-4" />
                </div>
                <h3 className="font-bold text-slate-900 text-sm">Stock Item Details</h3>
              </div>
              <button
                type="button"
                onClick={() => setShowDetailsModal(null)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg transition"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-2.5">
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 flex items-center justify-between">
                <div>
                  <p className="text-[10px] text-slate-400 font-bold uppercase">Commodity</p>
                  <p className="font-bold text-slate-900 text-sm">{showDetailsModal.productName}</p>
                  <p className="text-[10px] text-slate-400 font-mono mt-0.5">{showDetailsModal.sku} • {showDetailsModal.category}</p>
                </div>
                <span className="font-mono font-bold text-indigo-700 bg-indigo-50 border border-indigo-200 px-2 py-1 rounded text-xs">
                  {showDetailsModal.location}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-100">
                  <span className="text-[10px] text-slate-400 font-bold block uppercase">Batch No</span>
                  <span className="font-mono font-bold text-slate-800">{showDetailsModal.batchNo}</span>
                </div>
                <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-100">
                  <span className="text-[10px] text-slate-400 font-bold block uppercase">Expiry Date</span>
                  <span className="font-mono text-slate-800">{showDetailsModal.expiryDate}</span>
                </div>
              </div>

              <div className="p-3 bg-indigo-50/50 rounded-xl border border-indigo-100 space-y-1">
                <div className="flex justify-between text-xs">
                  <span className="text-indigo-950 font-bold">Total Available Stock:</span>
                  <span className="font-mono font-black text-indigo-900 text-sm">
                    {showDetailsModal.availableQty.toLocaleString()} {showDetailsModal.baseUnit}
                  </span>
                </div>
                <div className="flex justify-between text-[11px] text-indigo-800">
                  <span>Physical Packs:</span>
                  <span className="font-bold">{showDetailsModal.packsCount} {showDetailsModal.packUnit}</span>
                </div>
                <div className="flex justify-between text-[10px] text-slate-500 border-t border-indigo-100/80 pt-1">
                  <span>Packaging Ratio:</span>
                  <span>1 {showDetailsModal.packUnit} = {showDetailsModal.unitsPerPack} {showDetailsModal.baseUnit}</span>
                </div>
              </div>

              <div className="flex items-center justify-between p-2.5 bg-slate-50 rounded-xl border border-slate-100">
                <span className="text-slate-500 font-medium">Lab QC Clearance:</span>
                <span className="font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                  {showDetailsModal.labStatus} ({showDetailsModal.labCertNo})
                </span>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => {
                  const item = showDetailsModal
                  setShowDetailsModal(null)
                  setShowQrModal(item)
                }}
                className="px-3.5 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 rounded-xl font-bold transition flex items-center gap-1.5"
              >
                <QrCode className="w-3.5 h-3.5" />
                <span>QR Sticker</span>
              </button>
              <button
                type="button"
                onClick={() => setShowDetailsModal(null)}
                className="px-4 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold transition"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 3: PRINT QR TAG */}
      {showQrModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 shadow-2xl border border-slate-200 space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
                  <QrCode className="w-4 h-4" />
                </div>
                <h3 className="font-bold text-slate-900 text-sm">Bin Locator Sticker</h3>
              </div>
              <button
                type="button"
                onClick={() => setShowQrModal(null)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg transition"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="border-2 border-dashed border-slate-300 rounded-2xl p-4 bg-slate-50/50 space-y-3 text-center">
              <div className="flex items-center justify-between text-[10px] font-bold text-slate-500 border-b border-slate-200 pb-1.5">
                <span>WAREHOUSE INVENTORY SYSTEM</span>
                <span className="font-mono text-indigo-700 bg-indigo-50 px-1.5 py-0.2 rounded border border-indigo-200">
                  {showQrModal.location}
                </span>
              </div>
              <div>
                <h4 className="text-sm font-bold text-slate-900">{showQrModal.productName}</h4>
                <p className="text-[10px] font-mono text-slate-500 mt-0.5">
                  BATCH: {showQrModal.batchNo} • EXP: {showQrModal.expiryDate}
                </p>
              </div>
              <div className="w-28 h-28 bg-white p-2 mx-auto rounded-xl border border-slate-200 flex items-center justify-center shadow-xs">
                <QrCode className="w-full h-full text-slate-800" />
              </div>
              <div className="text-[11px] text-slate-700 font-semibold pt-1 border-t border-slate-200">
                Stock: {showQrModal.availableQty.toLocaleString()} {showQrModal.baseUnit} ({showQrModal.packsCount} {showQrModal.packUnit})
              </div>
            </div>

            <div className="pt-2 flex items-center justify-end gap-2.5">
              <button
                type="button"
                onClick={() => setShowQrModal(null)}
                className="px-3.5 py-2 border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 rounded-xl text-xs font-semibold transition"
              >
                Close
              </button>
              <button
                type="button"
                onClick={() => {
                  window.print()
                  setShowQrModal(null)
                }}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold shadow-sm transition flex items-center gap-1.5"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Print Sticker</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
