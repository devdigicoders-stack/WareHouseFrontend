import { useState, useMemo, useRef, useEffect } from 'react'
import { Link } from 'react-router-dom'
import {
  X,
  Search,
  Warehouse,
  Package,
  Layers,
  FlaskConical,
  QrCode,
  Download,
  Printer,
  CheckCircle2,
  SlidersHorizontal,
  RotateCcw,
  Eye,
  ChevronDown,
  Check,
  ScanLine,
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

export default function StockSearch() {
  // Toast notifications state
  const [toastMessage, setToastMessage] = useState(null)
  const triggerToast = (msg) => {
    setToastMessage(msg)
    setTimeout(() => setToastMessage(null), 3500)
  }

  // Filter form states
  const [searchKeyword, setSearchKeyword] = useState('')
  const [filterShade, setFilterShade] = useState('ALL')
  const [filterCategory, setFilterCategory] = useState('ALL')
  const [filterLabStatus, setFilterLabStatus] = useState('ALL')
  const [filterStatus, setFilterStatus] = useState('ALL')

  // Checkbox selection state
  const [selectedRows, setSelectedRows] = useState([])

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1)
  const perPage = 8

  // Modals state
  const [showScannerModal, setShowScannerModal] = useState(false)
  const [showDetailsModal, setShowDetailsModal] = useState(null)
  const [showQrModal, setShowQrModal] = useState(null)

  // 6 Dedicated Warehouse Shades
  const SHADES = [
    { id: 'SH01', name: 'Shade 1: Grains & Bulk Pulses' },
    { id: 'SH02', name: 'Shade 2: Edible Oils & Liquids' },
    { id: 'SH03', name: 'Shade 3: Packaged Food & FMCG' },
    { id: 'SH04', name: 'Shade 4: Packaging Materials & Cartons' },
    { id: 'SH05', name: 'Shade 5: Chemicals & Hygiene' },
    { id: 'SH06', name: 'Shade 6: Spares & General Goods' },
  ]

  // Commercial Stock Items Database
  const [stockItems] = useState([
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
      status: 'In Stock',
      expiryDate: '15 Mar 2027',
      labStatus: 'Passed',
      labCertNo: 'LAB-2026-FMCG-088',
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
      status: 'In Stock',
      expiryDate: '28 Jun 2027',
      labStatus: 'Passed',
      labCertNo: 'LAB-2026-FMCG-091',
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
      status: 'In Stock',
      expiryDate: '30 Nov 2027',
      labStatus: 'Passed',
      labCertNo: 'LAB-2026-GRN-104',
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
      status: 'In Stock',
      expiryDate: '15 Oct 2027',
      labStatus: 'Passed',
      labCertNo: 'LAB-2026-OIL-052',
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
      status: 'In Stock',
      expiryDate: '10 Dec 2027',
      labStatus: 'Under Testing',
      labCertNo: 'LAB-PENDING-QC',
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
      status: 'Low Stock',
      expiryDate: '20 Jan 2028',
      labStatus: 'Passed',
      labCertNo: 'LAB-2026-GRN-112',
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
      status: 'In Stock',
      expiryDate: '14 May 2028',
      labStatus: 'Passed',
      labCertNo: 'LAB-2026-CHM-019',
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
      status: 'In Stock',
      expiryDate: '31 Dec 2029',
      labStatus: 'Passed',
      labCertNo: 'LAB-2026-PKG-041',
    },
  ])

  // Filtered Stock Results
  const filteredStock = useMemo(() => {
    return stockItems.filter((item) => {
      if (filterShade !== 'ALL' && item.shadeId !== filterShade) return false
      if (filterCategory !== 'ALL' && item.category !== filterCategory) return false
      if (filterLabStatus !== 'ALL' && item.labStatus !== filterLabStatus) return false
      if (filterStatus !== 'ALL' && item.status !== filterStatus) return false

      if (searchKeyword.trim() !== '') {
        const q = searchKeyword.toLowerCase()
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
  }, [stockItems, filterShade, filterCategory, filterLabStatus, filterStatus, searchKeyword])

  // Paginated Results
  const totalPages = Math.max(1, Math.ceil(filteredStock.length / perPage))
  const paginatedStock = filteredStock.slice((currentPage - 1) * perPage, currentPage * perPage)

  // Reset all filters
  const handleResetFilters = () => {
    setSearchKeyword('')
    setFilterShade('ALL')
    setFilterCategory('ALL')
    setFilterLabStatus('ALL')
    setFilterStatus('ALL')
    setSelectedRows([])
    setCurrentPage(1)
    triggerToast('Search filters have been reset.')
  }

  // Toggle selection
  const handleToggleRow = (id) => {
    setSelectedRows((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    )
  }

  const handleSelectAll = (e) => {
    if (e.target.checked) {
      setSelectedRows(filteredStock.map((i) => i.id))
    } else {
      setSelectedRows([])
    }
  }

  // Export CSV
  const handleExportCSV = () => {
    const dataToExport =
      selectedRows.length > 0
        ? filteredStock.filter((i) => selectedRows.includes(i.id))
        : filteredStock

    const headers = [
      '#',
      'Product Name',
      'SKU',
      'Batch No',
      'Shade',
      'Storage Bin',
      'Base Unit Quantity',
      'Packaging Packs',
      'Lab Status',
      'Expiry Date',
      'Status',
    ]

    const rows = dataToExport.map((row) => [
      row.id,
      `"${row.productName}"`,
      row.sku,
      row.batchNo,
      `"${row.shadeName}"`,
      row.location,
      `${row.availableQty} ${row.baseUnit}`,
      `${row.packsCount} ${row.packUnit}`,
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
    link.setAttribute('download', 'Stock_Search_Results.csv')
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    triggerToast(`Exported ${dataToExport.length} search records to CSV.`)
  }

  // Dropdown Options
  const shadeOptions = [
    { value: 'ALL', label: 'All 6 Dedicated Shades' },
    ...SHADES.map((s) => ({ value: s.id, label: s.name })),
  ]

  const categoryOptions = [
    { value: 'ALL', label: 'All Categories' },
    { value: 'Packaged FMCG', label: 'Packaged FMCG' },
    { value: 'Grains & Pulses', label: 'Grains & Pulses' },
    { value: 'Edible Oils', label: 'Edible Oils' },
    { value: 'Packaging', label: 'Packaging Materials' },
    { value: 'Chemicals', label: 'Chemicals & Hygiene' },
  ]

  const labStatusOptions = [
    { value: 'ALL', label: 'All QC Statuses' },
    { value: 'Passed', label: 'Lab Clearance Passed' },
    { value: 'Under Testing', label: 'Under QC Testing' },
  ]

  const statusOptions = [
    { value: 'ALL', label: 'All Availability' },
    { value: 'In Stock', label: 'In Stock' },
    { value: 'Low Stock', label: 'Low Stock Alert' },
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
            <Search className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-slate-800 tracking-tight">Stock Search &amp; Bin Locator</h1>
            <p className="text-xs text-slate-500 font-medium mt-0.5">
              Query inventory across 6 shades, physical grid coordinates, SKU identifiers, and quality lab test certificates.
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            type="button"
            onClick={() => setShowScannerModal(true)}
            className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold shadow-xs transition"
          >
            <ScanLine className="w-3.5 h-3.5 text-slate-500" />
            <span>Simulate QR Scan</span>
          </button>

          <button
            type="button"
            onClick={handleExportCSV}
            className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold shadow-xs transition"
          >
            <Download className="w-3.5 h-3.5 text-slate-500" />
            <span>Export CSV {selectedRows.length > 0 && `(${selectedRows.length})`}</span>
          </button>
        </div>
      </div>

      {/* 4 Dynamic KPI Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Indexed Stock Records */}
        <div className="bg-white rounded-2xl p-4.5 shadow-2xs border border-slate-200/90 hover:border-slate-300 transition-all flex flex-col justify-between">
          <div className="flex items-center justify-between gap-2 mb-3">
            <div className="w-9 h-9 rounded-xl bg-indigo-50 border border-indigo-100/80 text-indigo-600 flex items-center justify-center shrink-0">
              <Package className="w-4.5 h-4.5" />
            </div>
            <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200/60 truncate">
              Catalog Live
            </span>
          </div>
          <div>
            <div className="flex items-baseline gap-1.5">
              <span className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight leading-none">
                {stockItems.length}
              </span>
              <span className="text-xs font-bold text-slate-500">Products</span>
            </div>
            <div className="text-xs font-bold text-slate-800 mt-2 truncate">
              Indexed Stock Records
            </div>
            <div className="text-[11px] text-indigo-600 font-semibold mt-0.5 truncate">
              Ready for instant lookup
            </div>
          </div>
        </div>

        {/* Card 2: Active Storage Bins */}
        <div className="bg-white rounded-2xl p-4.5 shadow-2xs border border-slate-200/90 hover:border-slate-300 transition-all flex flex-col justify-between">
          <div className="flex items-center justify-between gap-2 mb-3">
            <div className="w-9 h-9 rounded-xl bg-emerald-50 border border-emerald-100/80 text-emerald-600 flex items-center justify-center shrink-0">
              <Layers className="w-4.5 h-4.5" />
            </div>
            <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200/60 truncate">
              2D Matrix
            </span>
          </div>
          <div>
            <div className="flex items-baseline gap-1.5">
              <span className="text-2xl sm:text-3xl font-black text-emerald-600 tracking-tight leading-none">
                {new Set(stockItems.map((i) => i.location)).size}
              </span>
              <span className="text-xs font-bold text-slate-500">Bins Occupied</span>
            </div>
            <div className="text-xs font-bold text-slate-800 mt-2 truncate">
              Active Storage Bins
            </div>
            <div className="text-[11px] text-emerald-600 font-semibold mt-0.5 truncate">
              Mapped across warehouse
            </div>
          </div>
        </div>

        {/* Card 3: QC Passed Batches */}
        <div
          onClick={() => {
            setFilterLabStatus(filterLabStatus === 'Passed' ? 'ALL' : 'Passed')
            setCurrentPage(1)
          }}
          className={`bg-white rounded-2xl p-4.5 shadow-2xs border transition-all flex flex-col justify-between cursor-pointer ${
            filterLabStatus === 'Passed'
              ? 'border-blue-500 ring-2 ring-blue-500/20 shadow-sm bg-blue-50/15'
              : 'border-slate-200/90 hover:border-slate-300'
          }`}
          title="Click to filter QC Passed items"
        >
          <div className="flex items-center justify-between gap-2 mb-3">
            <div className="w-9 h-9 rounded-xl bg-blue-50 border border-blue-100/80 text-blue-600 flex items-center justify-center shrink-0">
              <CheckCircle2 className="w-4.5 h-4.5" />
            </div>
            <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200/60 truncate">
              Lab Verified
            </span>
          </div>
          <div>
            <div className="flex items-baseline gap-1.5">
              <span className="text-2xl sm:text-3xl font-black text-blue-600 tracking-tight leading-none">
                {stockItems.filter((i) => i.labStatus === 'Passed').length}
              </span>
              <span className="text-xs font-bold text-slate-500">
                of {stockItems.length} Batches
              </span>
            </div>
            <div className="text-xs font-bold text-slate-800 mt-2 truncate">
              QC Passed Clearances
            </div>
            <div className="text-[11px] text-blue-600 font-semibold mt-0.5 truncate">
              Verified by QA lab
            </div>
          </div>
        </div>

        {/* Card 4: Facility Shade Coverage */}
        <div className="bg-white rounded-2xl p-4.5 shadow-2xs border border-slate-200/90 hover:border-slate-300 transition-all flex flex-col justify-between">
          <div className="flex items-center justify-between gap-2 mb-3">
            <div className="w-9 h-9 rounded-xl bg-purple-50 border border-purple-100/80 text-purple-600 flex items-center justify-center shrink-0">
              <Warehouse className="w-4.5 h-4.5" />
            </div>
            <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-purple-50 text-purple-700 border border-purple-200/60 truncate">
              Full Coverage
            </span>
          </div>
          <div>
            <div className="flex items-baseline gap-1.5">
              <span className="text-2xl sm:text-3xl font-black text-purple-600 tracking-tight leading-none">
                6
              </span>
              <span className="text-xs font-bold text-slate-500">Shades</span>
            </div>
            <div className="text-xs font-bold text-slate-800 mt-2 truncate">
              Dedicated Shade Coverage
            </div>
            <div className="text-[11px] text-purple-600 font-semibold mt-0.5 truncate">
              Shades 1 to 6 online
            </div>
          </div>
        </div>
      </div>

      {/* Search & Filter Master Card */}
      <div className="bg-white rounded-2xl shadow-xs border border-slate-200/80 overflow-hidden">
        {/* Filter Section Header & Inputs */}
        <div className="p-5 border-b border-slate-100 space-y-4">
          {/* Top Line: Section Title & Results Count */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
                <Search className="w-4 h-4" />
              </div>
              <div>
                <h2 className="text-sm font-bold text-slate-800">Advanced Stock Search</h2>
                <p className="text-[11px] text-slate-500">Filter by SKU, storage bin coordinate, shade zone, or quality status.</p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs bg-indigo-50 text-indigo-700 font-bold px-3 py-1 rounded-full border border-indigo-200/60">
                {filteredStock.length} Results Found
              </span>
              {(searchKeyword || filterShade !== 'ALL' || filterCategory !== 'ALL' || filterLabStatus !== 'ALL' || filterStatus !== 'ALL') && (
                <button
                  type="button"
                  onClick={handleResetFilters}
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
              value={searchKeyword}
              onChange={(e) => {
                setSearchKeyword(e.target.value)
                setCurrentPage(1)
              }}
              placeholder="Search by product name, SKU identifier, batch number, or storage bin coordinate (e.g. SH03-R02-C04)..."
              className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-10 py-2.5 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 focus:bg-white transition"
            />
            {searchKeyword && (
              <button
                type="button"
                onClick={() => setSearchKeyword('')}
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
                Warehouse Storage Shade
              </label>
              <CustomSelect
                value={filterShade}
                onChange={(val) => {
                  setFilterShade(val)
                  setCurrentPage(1)
                }}
                options={shadeOptions}
                placeholder="All 6 Dedicated Shades"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-600 mb-1.5">
                Commodity Category
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
                Quality Lab Clearance
              </label>
              <CustomSelect
                value={filterLabStatus}
                onChange={(val) => {
                  setFilterLabStatus(val)
                  setCurrentPage(1)
                }}
                options={labStatusOptions}
                placeholder="All QC Statuses"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-600 mb-1.5">
                Inventory Availability
              </label>
              <CustomSelect
                value={filterStatus}
                onChange={(val) => {
                  setFilterStatus(val)
                  setCurrentPage(1)
                }}
                options={statusOptions}
                placeholder="All Availability"
              />
            </div>
          </div>
        </div>

        {/* Search Results Table */}
        <div className="overflow-x-auto no-scrollbar">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-50/75 border-b border-slate-200/80 text-slate-500 font-semibold uppercase tracking-wider text-[10px]">
                <th className="py-3 px-4 w-10 text-center">
                  <input
                    type="checkbox"
                    onChange={handleSelectAll}
                    checked={selectedRows.length === filteredStock.length && filteredStock.length > 0}
                    className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                  />
                </th>
                <th className="py-3 px-4 min-w-[200px]">Product Name &amp; SKU</th>
                <th className="py-3 px-4 min-w-[150px]">Bin Coordinate &amp; Shade</th>
                <th className="py-3 px-4 min-w-[120px]">Batch No</th>
                <th className="py-3 px-4 min-w-[130px] text-right">Base Unit Stock</th>
                <th className="py-3 px-4 min-w-[140px] text-right">Packaging Packs</th>
                <th className="py-3 px-4 min-w-[120px] text-center">Lab Clearance</th>
                <th className="py-3 px-4 min-w-[110px]">Expiry Date</th>
                <th className="py-3 px-4 min-w-[100px] text-center">Availability</th>
                <th className="py-3 px-4 text-center w-24">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {paginatedStock.length === 0 ? (
                <tr>
                  <td colSpan="10" className="py-12 text-center text-slate-400">
                    <Search className="w-8 h-8 mx-auto text-slate-300 mb-2" />
                    <p className="font-semibold text-slate-600">No matching stock items found</p>
                    <p className="text-[11px] text-slate-400 mt-0.5">Try widening your search keyword or resetting filters.</p>
                  </td>
                </tr>
              ) : (
                paginatedStock.map((row) => {
                  const isChecked = selectedRows.includes(row.id)
                  return (
                    <tr key={row.id} className={`hover:bg-indigo-50/20 transition ${isChecked ? 'bg-indigo-50/30' : ''}`}>
                      <td className="py-3.5 px-4 text-center">
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => handleToggleRow(row.id)}
                          className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                        />
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
                            title="Print QR Tag"
                          >
                            <QrCode className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  )
                })
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

      {/* MODAL 1: SCANNER SIMULATOR */}
      {showScannerModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
          <div className="bg-white rounded-2xl max-w-sm w-full p-4 sm:p-6 max-h-[90dvh] overflow-y-auto shadow-2xl border border-slate-200 text-center space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
                  <ScanLine className="w-4 h-4" />
                </div>
                <h3 className="font-bold text-slate-900 text-sm">QR / Barcode Scanner</h3>
              </div>
              <button
                type="button"
                onClick={() => setShowScannerModal(false)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg transition"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="relative bg-slate-900 rounded-2xl h-48 flex flex-col items-center justify-center text-white overflow-hidden shadow-inner">
              <div className="w-36 h-36 border-2 border-indigo-400/80 rounded-xl relative flex items-center justify-center">
                <div className="absolute inset-x-0 top-1/2 h-0.5 bg-rose-500 shadow-[0_0_8px_rgba(244,63,94,0.8)] animate-pulse" />
                <QrCode className="w-20 h-20 text-white/40" />
              </div>
              <p className="text-[11px] text-slate-400 mt-2">Point camera at bin locator QR tag</p>
            </div>

            <div className="pt-2 flex flex-col gap-2">
              <button
                type="button"
                onClick={() => {
                  setSearchKeyword('SH03-R02-C04')
                  setShowScannerModal(false)
                  triggerToast('Scanned code: SH03-R02-C04 (Parle-G Glucose Biscuits)')
                }}
                className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold shadow-sm transition cursor-pointer"
              >
                Simulate Scan: SH03-R02-C04
              </button>
              <button
                type="button"
                onClick={() => {
                  setSearchKeyword('SH01-R02-C08')
                  setShowScannerModal(false)
                  triggerToast('Scanned code: SH01-R02-C08 (Sharbati Wheat Grain)')
                }}
                className="w-full py-2 border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-700 rounded-xl text-xs font-semibold transition cursor-pointer"
              >
                Simulate Scan: SH01-R02-C08
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 2: ITEM DETAILS */}
      {showDetailsModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-4 sm:p-6 max-h-[90dvh] overflow-y-auto shadow-2xl border border-slate-200 space-y-4 text-xs animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
                  <Eye className="w-4 h-4" />
                </div>
                <h3 className="font-bold text-slate-900 text-sm">Stock Item Inspection</h3>
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
                <span>QR Tag</span>
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

      {/* MODAL 3: QR LOCATOR TAG */}
      {showQrModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
          <div className="bg-white rounded-2xl max-w-sm w-full p-4 sm:p-6 max-h-[90dvh] overflow-y-auto shadow-2xl border border-slate-200 space-y-4 animate-in fade-in zoom-in-95 duration-150">
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
