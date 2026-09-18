import { useState, useMemo } from 'react'
import { Link } from 'react-router-dom'
import {
  X,
  AlertTriangle,
  Warehouse,
  Package,
  Layers,
  CheckCircle2,
  FlaskConical,
  QrCode,
  Download,
  Printer,
  Plus,
  Search,
  Eye,
  SlidersHorizontal,
  RefreshCw,
  ShieldCheck,
  ShieldAlert,
} from 'lucide-react'

export default function CurrentStock() {
  // Toast notifications state
  const [toastMessage, setToastMessage] = useState(null)
  const triggerToast = (msg) => {
    setToastMessage(msg)
  }

  // Filter toolbar state
  const [filterShade, setFilterShade] = useState('All Shades')
  const [filterCategory, setFilterCategory] = useState('All Categories')
  const [filterLabStatus, setFilterLabStatus] = useState('All')
  const [filterStockLevel, setFilterStockLevel] = useState('All')
  const [searchQuery, setSearchQuery] = useState('')

  // Modals state
  const [showAddModal, setShowAddModal] = useState(false)
  const [showDetailsModal, setShowDetailsModal] = useState(null)
  const [showQrModal, setShowQrModal] = useState(null)

  // 6 Dedicated Shades
  const SHADES = [
    { id: 'SH01', name: 'Shade 1: Grains & Bulk Pulses' },
    { id: 'SH02', name: 'Shade 2: Edible Oils & Liquids' },
    { id: 'SH03', name: 'Shade 3: Packaged Food & FMCG' },
    { id: 'SH04', name: 'Shade 4: Packaging Materials & Cartons' },
    { id: 'SH05', name: 'Shade 5: Chemicals & Hygiene' },
    { id: 'SH06', name: 'Shade 6: Spares & General Goods' },
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
    labStatus: 'Pending Lab Test',
    status: 'In Stock',
  })

  // Stock List Table Data (6 Shades, Base Units & Gatta tracking, Lab QA Status)
  const [stockData, setStockData] = useState([
    {
      id: 1,
      productName: 'Parle-G Glucose Biscuits (50g)',
      sku: 'FMCG-BIS-01',
      batchNo: 'BT-2026-FMCG-01',
      category: 'Packaged FMCG',
      shadeId: 'SH03',
      shadeName: 'Shade 3: Packaged FMCG',
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
      shadeName: 'Shade 3: Packaged FMCG',
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
      reorderLevel: 300,
    },
    {
      id: 3,
      productName: 'Sharbati Wheat Grain (Grade A)',
      sku: 'GRN-WHT-01',
      batchNo: 'BT-2026-GRN-01',
      category: 'Grains & Pulses',
      shadeId: 'SH01',
      shadeName: 'Shade 1: Grains & Bulk Pulses',
      row: 'R02',
      col: 'C01',
      location: 'SH01-R02-C01',
      baseUnit: 'Kg',
      packUnit: 'Bags (50kg)',
      unitsPerPack: 50,
      packsCount: 40,
      availableQty: 2000,
      reservedQty: 250,
      totalQty: 2250,
      labStatus: 'Passed',
      labCertNo: 'LAB-2026-GRN-042',
      expiryDate: '10 Nov 2027',
      status: 'In Stock',
      reorderLevel: 500,
    },
    {
      id: 4,
      productName: 'Basmati Rice Premium XXL',
      sku: 'GRN-RIC-01',
      batchNo: 'BT-2026-GRN-02',
      category: 'Grains & Pulses',
      shadeId: 'SH01',
      shadeName: 'Shade 1: Grains & Bulk Pulses',
      row: 'R02',
      col: 'C02',
      location: 'SH01-R02-C02',
      baseUnit: 'Kg',
      packUnit: 'Bags (25kg)',
      unitsPerPack: 25,
      packsCount: 60,
      availableQty: 1500,
      reservedQty: 100,
      totalQty: 1600,
      labStatus: 'Passed',
      labCertNo: 'LAB-2026-GRN-045',
      expiryDate: '20 Dec 2027',
      status: 'In Stock',
      reorderLevel: 400,
    },
    {
      id: 5,
      productName: 'Fortune Refined Mustard Oil (15L)',
      sku: 'OIL-REF-01',
      batchNo: 'BT-2026-OIL-01',
      category: 'Edible Oils',
      shadeId: 'SH02',
      shadeName: 'Shade 2: Edible Oils & Liquids',
      row: 'R01',
      col: 'C01',
      location: 'SH02-R01-C01',
      baseUnit: 'Ltr',
      packUnit: 'Tins (15L)',
      unitsPerPack: 15,
      packsCount: 80,
      availableQty: 1200,
      reservedQty: 60,
      totalQty: 1260,
      labStatus: 'Passed',
      labCertNo: 'LAB-2026-OIL-014',
      expiryDate: '18 Aug 2027',
      status: 'In Stock',
      reorderLevel: 300,
    },
    {
      id: 6,
      productName: 'Maggi 2-Minute Noodles (70g)',
      sku: 'FMCG-NOD-01',
      batchNo: 'BT-2026-FMCG-03',
      category: 'Packaged FMCG',
      shadeId: 'SH03',
      shadeName: 'Shade 3: Packaged FMCG',
      row: 'R01',
      col: 'C03',
      location: 'SH03-R01-C03',
      baseUnit: 'Packets',
      packUnit: 'Cartons',
      unitsPerPack: 24,
      packsCount: 20,
      availableQty: 480,
      reservedQty: 96,
      totalQty: 576,
      labStatus: 'Under Testing',
      labCertNo: 'QC-IN-PROGRESS',
      expiryDate: '10 Jan 2027',
      status: 'Under Testing',
      reorderLevel: 250,
    },
    {
      id: 7,
      productName: 'Corrugated Shipping Cartons (5-Ply)',
      sku: 'PKG-CRT-01',
      batchNo: 'BT-2026-PKG-01',
      category: 'Packaging Materials',
      shadeId: 'SH04',
      shadeName: 'Shade 4: Packaging Materials & Cartons',
      row: 'R01',
      col: 'C01',
      location: 'SH04-R01-C01',
      baseUnit: 'Nos',
      packUnit: 'Bundles (50 Nos)',
      unitsPerPack: 50,
      packsCount: 30,
      availableQty: 1500,
      reservedQty: 200,
      totalQty: 1700,
      labStatus: 'Passed',
      labCertNo: 'CERT-NOT-REQ',
      expiryDate: 'N/A',
      status: 'In Stock',
      reorderLevel: 500,
    },
    {
      id: 8,
      productName: 'Industrial Floor Disinfectant Liquid',
      sku: 'CHM-DIS-01',
      batchNo: 'BT-2026-CHM-01',
      category: 'Chemicals & Hygiene',
      shadeId: 'SH05',
      shadeName: 'Shade 5: Chemicals & Hygiene',
      row: 'R01',
      col: 'C01',
      location: 'SH05-R01-C01',
      baseUnit: 'Ltr',
      packUnit: 'Cans (5L)',
      unitsPerPack: 5,
      packsCount: 80,
      availableQty: 400,
      reservedQty: 0,
      totalQty: 400,
      labStatus: 'Passed',
      labCertNo: 'LAB-2026-CHM-008',
      expiryDate: '05 May 2028',
      status: 'In Stock',
      reorderLevel: 150,
    },
    {
      id: 9,
      productName: 'Hydraulic Pallet Jack Spares',
      sku: 'SPR-PLT-01',
      batchNo: 'BT-2026-SPR-01',
      category: 'Spares & General',
      shadeId: 'SH06',
      shadeName: 'Shade 6: Spares & General Goods',
      row: 'R01',
      col: 'C01',
      location: 'SH06-R01-C01',
      baseUnit: 'Units',
      packUnit: 'Crates',
      unitsPerPack: 1,
      packsCount: 120,
      availableQty: 120,
      reservedQty: 15,
      totalQty: 135,
      labStatus: 'Passed',
      labCertNo: 'CERT-MECH-02',
      expiryDate: 'N/A',
      status: 'Low Stock',
      reorderLevel: 150,
    },
    {
      id: 10,
      productName: 'Refined Mustard Oil (New Batch Sample)',
      sku: 'OIL-REF-02',
      batchNo: 'BT-2026-OIL-99',
      category: 'Edible Oils',
      shadeId: 'SH02',
      shadeName: 'Shade 2: Edible Oils & Liquids',
      row: 'R01',
      col: 'C04',
      location: 'SH02-R01-C04',
      baseUnit: 'Ltr',
      packUnit: 'Tins (15L)',
      unitsPerPack: 15,
      packsCount: 20,
      availableQty: 300,
      reservedQty: 0,
      totalQty: 300,
      labStatus: 'Pending Lab Test',
      labCertNo: 'PENDING-QC',
      expiryDate: '10 Aug 2027',
      status: 'Pending Lab Test',
      reorderLevel: 200,
    },
  ])

  // Filtered Stock Items
  const filteredStock = useMemo(() => {
    return stockData.filter((item) => {
      // Shade filter
      if (filterShade !== 'All Shades' && item.shadeId !== filterShade) return false

      // Category filter
      if (filterCategory !== 'All Categories' && item.category !== filterCategory) return false

      // Lab Status filter
      if (filterLabStatus !== 'All' && item.labStatus !== filterLabStatus) return false

      // Stock Level filter
      if (filterStockLevel === 'Low Stock' && item.status !== 'Low Stock') return false
      if (filterStockLevel === 'In Stock' && item.status !== 'In Stock') return false

      // Search Query
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

  // Aggregate metrics
  const totalBaseUnits = useMemo(() => {
    return stockData.reduce((sum, i) => sum + i.availableQty, 0)
  }, [stockData])

  const totalGattaPacks = useMemo(() => {
    return stockData.reduce((sum, i) => sum + i.packsCount, 0)
  }, [stockData])

  const labPassedUnits = useMemo(() => {
    return stockData
      .filter((i) => i.labStatus === 'Passed')
      .reduce((sum, i) => sum + i.availableQty, 0)
  }, [stockData])

  // Handle Add Stock Submit
  const handleAddStockSubmit = (e) => {
    e.preventDefault()
    const computedBase = (Number(newStock.packsCount) || 0) * (Number(newStock.unitsPerPack) || 1)
    const locCode = `${newStock.shadeId}-${newStock.row}-${newStock.col}`
    const matchedShade = SHADES.find((s) => s.id === newStock.shadeId)?.name || newStock.shadeId

    const newEntry = {
      id: Date.now(),
      productName: newStock.productName,
      sku: newStock.sku,
      batchNo: newStock.batchNo,
      category:
        newStock.shadeId === 'SH01'
          ? 'Grains & Pulses'
          : newStock.shadeId === 'SH02'
          ? 'Edible Oils'
          : newStock.shadeId === 'SH03'
          ? 'Packaged FMCG'
          : newStock.shadeId === 'SH04'
          ? 'Packaging Materials'
          : newStock.shadeId === 'SH05'
          ? 'Chemicals & Hygiene'
          : 'Spares & General',
      shadeId: newStock.shadeId,
      shadeName: matchedShade,
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
      labCertNo: newStock.labStatus === 'Passed' ? 'CERT-MANUAL-01' : 'PENDING-QC',
      expiryDate: newStock.expiryDate || '-',
      status: 'In Stock',
      reorderLevel: 250,
    }

    setStockData([newEntry, ...stockData])
    setShowAddModal(false)
    triggerToast(`Added ${computedBase} ${newEntry.baseUnit} of ${newEntry.productName} to ${locCode}.`)
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
      'Pack Type',
      'Units Per Pack',
      'Lab Status',
      'Expiry Date',
      'Status',
    ]
    const rows = stockData.map((row) => [
      row.id,
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
    link.setAttribute('download', 'Current_Stock_6Shades_BaseUnits.csv')
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    triggerToast('Current Stock Inventory exported to CSV.')
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

      {/* Top Himalayan Convoy Banner (Preserved) */}
      <div className="relative rounded-xl overflow-hidden shadow-md border border-slate-200/80 bg-slate-900 h-28 sm:h-32">
        <img
          src="/border.png"
          alt="Warehouse Inventory & Logistics"
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

      {/* Page Header Bar */}
      <div className="bg-white rounded-xl p-4 sm:p-5 shadow-xs border border-slate-200/80 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-xl bg-[#1E3A1E] text-white flex items-center justify-center shadow-xs shrink-0">
            <Package className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-black text-slate-800 tracking-tight flex items-center gap-2">
              <span>Current Stock (6 Dedicated Shades &amp; Base Units)</span>
            </h1>
            <p className="text-xs text-slate-500 font-medium">
              Real-time inventory balances recorded in base product units with Gatta conversion ratios across the 6 warehouse shades.
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <div className="text-xs text-slate-400 flex items-center gap-1.5 font-medium mr-2">
            <Link to="/dashboard" className="hover:text-slate-700">Home</Link>
            <span>›</span>
            <span className="text-slate-500">Inventory</span>
            <span>›</span>
            <span className="text-slate-800 font-semibold">Current Stock</span>
          </div>

          <Link
            to="/location-master"
            className="bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold px-3 py-2 rounded-lg transition"
          >
            2D Grid View
          </Link>

          <button
            type="button"
            onClick={handleExportCSV}
            className="bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold px-3 py-2 rounded-lg flex items-center gap-1.5 transition cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export CSV</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setNewStock({
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
                labStatus: 'Pending Lab Test',
                status: 'In Stock',
              })
              setShowAddModal(true)
            }}
            className="bg-[#1F331E] hover:bg-[#2A4428] text-white text-xs font-bold px-4 py-2 rounded-lg flex items-center gap-2 shadow-xs transition cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Add Stock Item</span>
          </button>
        </div>
      </div>

      {/* 5 KPI Stat Summary Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
        <div className="bg-white rounded-xl p-3.5 shadow-xs border border-slate-200">
          <p className="text-[11px] font-semibold text-slate-500">Total Base Units</p>
          <h3 className="text-2xl font-black text-slate-800 leading-tight">
            {totalBaseUnits.toLocaleString()}
          </h3>
          <p className="text-[10px] text-slate-400">Pieces, Kg, Ltr &amp; Nos</p>
        </div>

        <div className="bg-white rounded-xl p-3.5 shadow-xs border border-slate-200">
          <p className="text-[11px] font-semibold text-slate-500">Physical Gatta / Cartons</p>
          <h3 className="text-2xl font-black text-slate-800 leading-tight">
            {totalGattaPacks.toLocaleString()} Packs
          </h3>
          <p className="text-[10px] text-slate-400">Packaging units count</p>
        </div>

        <div className="bg-white rounded-xl p-3.5 shadow-xs border border-slate-200">
          <p className="text-[11px] font-semibold text-slate-500">Lab Approved Stock</p>
          <h3 className="text-2xl font-black text-emerald-800 leading-tight">
            {labPassedUnits.toLocaleString()}
          </h3>
          <p className="text-[10px] text-emerald-600 font-bold">
            {Math.round((labPassedUnits / totalBaseUnits) * 100)}% Clear for Dispatch
          </p>
        </div>

        <div className="bg-white rounded-xl p-3.5 shadow-xs border border-slate-200">
          <p className="text-[11px] font-semibold text-slate-500">Under Lab Testing</p>
          <h3 className="text-2xl font-black text-amber-700 leading-tight">
            {(totalBaseUnits - labPassedUnits).toLocaleString()}
          </h3>
          <p className="text-[10px] text-amber-600 font-medium">Pending QC verification</p>
        </div>

        <div className="bg-white rounded-xl p-3.5 shadow-xs border border-slate-200">
          <p className="text-[11px] font-semibold text-slate-500">Warehouse Architecture</p>
          <h3 className="text-sm font-black text-slate-800 leading-tight mt-1">
            6 Shades • 480 Bins
          </h3>
          <p className="text-[10px] text-slate-400">8 Rows × 10 Columns</p>
        </div>
      </div>

      {/* SHADE PILL TABS */}
      <div className="bg-white rounded-xl p-2.5 shadow-xs border border-slate-200 flex items-center gap-1.5 overflow-x-auto no-scrollbar">
        <button
          type="button"
          onClick={() => setFilterShade('All Shades')}
          className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition whitespace-nowrap cursor-pointer ${
            filterShade === 'All Shades'
              ? 'bg-[#1E3A1E] text-white shadow-xs'
              : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
          }`}
        >
          All 6 Shades
        </button>
        {SHADES.map((s) => (
          <button
            key={s.id}
            type="button"
            onClick={() => setFilterShade(s.id)}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition whitespace-nowrap cursor-pointer ${
              filterShade === s.id
                ? 'bg-[#1E3A1E] text-white shadow-xs'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            {s.name}
          </button>
        ))}
      </div>

      {/* FILTER & SEARCH TOOLBAR */}
      <div className="bg-white rounded-xl p-3 shadow-xs border border-slate-200 flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs">
        <div className="flex flex-wrap items-center gap-2.5 flex-1">
          {/* Lab Status Filter */}
          <div className="min-w-[130px]">
            <select
              value={filterLabStatus}
              onChange={(e) => setFilterLabStatus(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 font-semibold text-slate-700 focus:outline-none"
            >
              <option value="All">All Lab Status</option>
              <option value="Passed">Lab Passed Only</option>
              <option value="Pending Lab Test">Pending Lab Test</option>
              <option value="Under Testing">Under Testing</option>
            </select>
          </div>

          {/* Stock Level Filter */}
          <div className="min-w-[130px]">
            <select
              value={filterStockLevel}
              onChange={(e) => setFilterStockLevel(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 font-semibold text-slate-700 focus:outline-none"
            >
              <option value="All">All Stock Levels</option>
              <option value="In Stock">In Stock</option>
              <option value="Low Stock">Low Stock Alert</option>
            </select>
          </div>

          {/* Search Box */}
          <div className="relative flex-1 min-w-[220px]">
            <input
              type="text"
              placeholder="Search by product, SKU, batch, or bin code..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-lg pl-8 pr-3 py-1.5 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-emerald-600 focus:bg-white"
            />
            <span className="absolute left-2.5 top-2 text-slate-400 text-xs">🔍</span>
          </div>
        </div>

        <button
          type="button"
          onClick={() => {
            setFilterShade('All Shades')
            setFilterCategory('All Categories')
            setFilterLabStatus('All')
            setFilterStockLevel('All')
            setSearchQuery('')
            triggerToast('Filters reset.')
          }}
          className="text-emerald-700 font-bold hover:underline cursor-pointer text-xs self-end md:self-center"
        >
          Reset Filters
        </button>
      </div>

      {/* MASTER INVENTORY TABLE */}
      <div className="bg-white rounded-xl shadow-xs border border-slate-200 overflow-hidden flex flex-col">
        <div className="overflow-x-auto no-scrollbar scroll-smooth w-full">
          <table className="w-full text-left text-xs divide-y divide-slate-200 border-collapse table-nowrap" style={{ minWidth: '1150px' }}>
            <thead className="bg-slate-50 text-slate-600 font-bold uppercase tracking-wider text-[11px]">
              <tr>
                <th className="py-3 px-3 w-10 text-center">#</th>
                <th className="py-3 px-4 min-w-[200px]">Product Name &amp; SKU</th>
                <th className="py-3 px-4 min-w-[150px]">Storage Bin &amp; Shade</th>
                <th className="py-3 px-4 min-w-[120px]">Batch No.</th>
                <th className="py-3 px-4 min-w-[140px] text-right">Available Base Stock</th>
                <th className="py-3 px-4 min-w-[150px] text-right">Packaging (Gatta)</th>
                <th className="py-3 px-4 text-center min-w-[120px]">Lab Clearance</th>
                <th className="py-3 px-4 min-w-[110px]">Expiry Date</th>
                <th className="py-3 px-4 text-center min-w-[100px]">Status</th>
                <th className="py-3 px-3 text-center w-24">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 bg-white">
              {filteredStock.map((row, idx) => (
                <tr key={row.id} className="hover:bg-emerald-50/40 transition">
                  <td className="py-3 px-3 text-center text-slate-400 font-bold">{idx + 1}</td>
                  <td className="py-3 px-4 text-slate-900">
                    <div className="font-bold text-slate-900">{row.productName}</div>
                    <div className="text-[10px] text-slate-400 font-mono">{row.sku} • {row.category}</div>
                  </td>
                  <td className="py-3 px-4 font-mono font-bold text-slate-800">
                    <span className="bg-slate-100 border border-slate-200 px-2 py-0.5 rounded text-[11px]">
                      {row.location}
                    </span>
                    <div className="text-[10px] text-slate-500 font-sans font-normal mt-0.5 truncate max-w-[140px]">
                      {row.shadeName}
                    </div>
                  </td>
                  <td className="py-3 px-4 font-mono text-slate-700">{row.batchNo}</td>
                  <td className="py-3 px-4 text-right font-mono font-black text-emerald-900">
                    {row.availableQty.toLocaleString()} {row.baseUnit}
                  </td>
                  <td className="py-3 px-4 text-right text-slate-700">
                    <span className="font-bold text-slate-800">{row.packsCount} {row.packUnit}</span>
                    <div className="text-[10px] text-slate-400">
                      @ {row.unitsPerPack} {row.baseUnit}/pack
                    </div>
                  </td>
                  <td className="py-3 px-4 text-center">
                    <span
                      className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                        row.labStatus === 'Passed'
                          ? 'bg-emerald-100 text-emerald-800'
                          : row.labStatus === 'Under Testing'
                          ? 'bg-blue-100 text-blue-800'
                          : 'bg-amber-100 text-amber-800'
                      }`}
                    >
                      {row.labStatus === 'Passed' ? '✓ Passed' : row.labStatus}
                    </span>
                  </td>
                  <td className="py-3 px-4 font-mono text-slate-600 text-[11px]">{row.expiryDate}</td>
                  <td className="py-3 px-4 text-center">
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        row.status === 'In Stock'
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          : 'bg-amber-50 text-amber-700 border border-amber-200'
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
                        className="p-1.5 bg-slate-50 hover:bg-slate-100 text-slate-600 rounded-lg border border-slate-200 transition cursor-pointer"
                        title="View Details"
                      >
                        <Eye className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => setShowQrModal(row)}
                        className="p-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 rounded-lg border border-emerald-200 transition cursor-pointer"
                        title="Print Bin QR Locator"
                      >
                        <QrCode className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL 1: ADD STOCK ITEM */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 animate-in fade-in zoom-in duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="font-black text-slate-900 text-sm flex items-center gap-2">
                <Package className="w-4 h-4 text-emerald-700" />
                <span>Add Stock Item (Base Units &amp; 6 Shades)</span>
              </h3>
              <button
                type="button"
                onClick={() => setShowAddModal(false)}
                className="text-slate-400 hover:text-slate-700 p-1 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleAddStockSubmit} className="space-y-3.5 pt-3 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">Product Name</label>
                  <input
                    type="text"
                    required
                    value={newStock.productName}
                    onChange={(e) => setNewStock({ ...newStock, productName: e.target.value })}
                    placeholder="e.g. Parle-G Glucose Biscuits"
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs font-semibold focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">SKU</label>
                  <input
                    type="text"
                    required
                    value={newStock.sku}
                    onChange={(e) => setNewStock({ ...newStock, sku: e.target.value })}
                    placeholder="e.g. FMCG-BIS-01"
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs font-mono font-bold"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">Batch No.</label>
                  <input
                    type="text"
                    required
                    value={newStock.batchNo}
                    onChange={(e) => setNewStock({ ...newStock, batchNo: e.target.value })}
                    placeholder="e.g. BT-2026-FMCG-01"
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs font-mono"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">Expiry Date</label>
                  <input
                    type="text"
                    value={newStock.expiryDate}
                    onChange={(e) => setNewStock({ ...newStock, expiryDate: e.target.value })}
                    placeholder="e.g. 15 Mar 2027"
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs font-mono"
                  />
                </div>
              </div>

              {/* Grid Location Selection: Shade -> Row -> Column */}
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
                <span className="text-[11px] font-bold text-slate-800">Target Storage Bin Selection</span>
                <div className="grid grid-cols-3 gap-2">
                  <div>
                    <label className="block text-[10px] text-slate-500 font-semibold mb-1">Shade</label>
                    <select
                      value={newStock.shadeId}
                      onChange={(e) => setNewStock({ ...newStock, shadeId: e.target.value })}
                      className="w-full bg-white border border-slate-200 rounded px-2 py-1 text-xs font-bold"
                    >
                      {SHADES.map((s) => (
                        <option key={s.id} value={s.id}>
                          {s.id}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-[10px] text-slate-500 font-semibold mb-1">Row (1-8)</label>
                    <select
                      value={newStock.row}
                      onChange={(e) => setNewStock({ ...newStock, row: e.target.value })}
                      className="w-full bg-white border border-slate-200 rounded px-2 py-1 text-xs font-mono font-bold"
                    >
                      {Array.from({ length: 8 }, (_, i) => (
                        <option key={i} value={`R0${i + 1}`}>
                          Row 0{i + 1}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-[10px] text-slate-500 font-semibold mb-1">Column (1-10)</label>
                    <select
                      value={newStock.col}
                      onChange={(e) => setNewStock({ ...newStock, col: e.target.value })}
                      className="w-full bg-white border border-slate-200 rounded px-2 py-1 text-xs font-mono font-bold"
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

              {/* Base Unit vs Packaging Calculation */}
              <div className="p-3 bg-emerald-50/60 border border-emerald-200 rounded-xl space-y-2">
                <span className="text-[11px] font-bold text-emerald-900">Base Unit Minimum Quantity</span>
                <div className="grid grid-cols-3 gap-2 text-[10px]">
                  <div>
                    <span className="font-semibold block mb-1">Gatta / Pack Count</span>
                    <input
                      type="number"
                      value={newStock.packsCount}
                      onChange={(e) => setNewStock({ ...newStock, packsCount: e.target.value })}
                      className="w-full bg-white border border-slate-200 rounded px-2 py-1 text-xs font-mono font-bold"
                    />
                  </div>
                  <div>
                    <span className="font-semibold block mb-1">Units / Gatta</span>
                    <input
                      type="number"
                      value={newStock.unitsPerPack}
                      onChange={(e) => setNewStock({ ...newStock, unitsPerPack: e.target.value })}
                      className="w-full bg-white border border-slate-200 rounded px-2 py-1 text-xs font-mono font-bold"
                    />
                  </div>
                  <div>
                    <span className="font-semibold block mb-1">Base Unit</span>
                    <input
                      type="text"
                      value={newStock.baseUnit}
                      onChange={(e) => setNewStock({ ...newStock, baseUnit: e.target.value })}
                      className="w-full bg-white border border-slate-200 rounded px-2 py-1 text-xs font-bold"
                    />
                  </div>
                </div>
                <div className="text-[11px] text-emerald-900 font-bold pt-1 flex justify-between">
                  <span>Computed Minimum Inventory:</span>
                  <span className="font-mono">
                    {((Number(newStock.packsCount) || 0) * (Number(newStock.unitsPerPack) || 1)).toLocaleString()}{' '}
                    {newStock.baseUnit}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">Lab Testing Status</label>
                  <select
                    value={newStock.labStatus}
                    onChange={(e) => setNewStock({ ...newStock, labStatus: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-2 text-xs font-bold"
                  >
                    <option value="Pending Lab Test">Pending Lab Test</option>
                    <option value="Under Testing">Under Testing</option>
                    <option value="Passed">Passed</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">Stock Status</label>
                  <select
                    value={newStock.status}
                    onChange={(e) => setNewStock({ ...newStock, status: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-2 text-xs font-bold"
                  >
                    <option value="In Stock">In Stock</option>
                    <option value="Low Stock">Low Stock</option>
                  </select>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 border border-slate-200 rounded-lg text-slate-600 hover:bg-slate-50 text-xs font-semibold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-[#1E3A1E] hover:bg-[#2A4428] text-white rounded-lg text-xs font-bold shadow-xs cursor-pointer"
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
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-5 shadow-2xl border border-slate-200 space-y-3.5 text-xs">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <h3 className="font-bold text-slate-900 text-sm">Stock Item Breakdown</h3>
              <button
                type="button"
                onClick={() => setShowDetailsModal(null)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="text-slate-500">Commodity:</span>
                <span className="font-bold text-slate-800">{showDetailsModal.productName}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="text-slate-500">Storage Bin:</span>
                <span className="font-mono font-bold text-emerald-900">{showDetailsModal.location} ({showDetailsModal.shadeName})</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="text-slate-500">Batch Number:</span>
                <span className="font-mono font-bold text-slate-800">{showDetailsModal.batchNo}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="text-slate-500">Base Unit Stock:</span>
                <span className="font-black font-mono text-emerald-900 text-sm">{showDetailsModal.availableQty.toLocaleString()} {showDetailsModal.baseUnit}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="text-slate-500">Packaging Ratio:</span>
                <span>1 {showDetailsModal.packUnit} = {showDetailsModal.unitsPerPack} {showDetailsModal.baseUnit}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="text-slate-500">Physical Packaging:</span>
                <span className="font-bold text-slate-800">{showDetailsModal.packsCount} {showDetailsModal.packUnit}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="text-slate-500">Lab Clearance:</span>
                <span className="font-bold text-emerald-800">{showDetailsModal.labStatus} ({showDetailsModal.labCertNo})</span>
              </div>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                type="button"
                onClick={() => setShowDetailsModal(null)}
                className="px-4 py-1.5 bg-slate-800 text-white rounded-lg text-xs font-bold"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 3: PRINT QR TAG */}
      {showQrModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-sm w-full p-5 shadow-2xl border border-slate-200 text-center space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <h3 className="font-black text-slate-800 text-sm flex items-center gap-1.5">
                <QrCode className="w-4 h-4 text-emerald-700" />
                <span>Bin QR Locator Sticker</span>
              </h3>
              <button
                type="button"
                onClick={() => setShowQrModal(null)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="border-2 border-dashed border-slate-800 rounded-xl p-4 bg-slate-50 space-y-2">
              <div className="flex justify-between text-[10px] font-bold text-slate-700 border-b pb-1">
                <span>CENTRAL WAREHOUSE LOGISTICS</span>
                <span className="text-emerald-800 font-mono">{showQrModal.location}</span>
              </div>
              <h4 className="text-base font-black text-slate-900">{showQrModal.productName}</h4>
              <p className="text-[10px] font-mono text-slate-500">
                BATCH: {showQrModal.batchNo} • EXP: {showQrModal.expiryDate}
              </p>
              <div className="w-28 h-28 bg-white p-2 mx-auto rounded border border-slate-300 flex items-center justify-center">
                <QrCode className="w-full h-full text-slate-900" />
              </div>
              <div className="text-[10px] text-slate-700 font-medium pt-1 border-t">
                Stock: {showQrModal.availableQty} {showQrModal.baseUnit} ({showQrModal.packsCount} {showQrModal.packUnit})
              </div>
            </div>

            <div className="pt-2 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setShowQrModal(null)}
                className="px-3 py-1.5 border rounded text-xs font-semibold"
              >
                Close
              </button>
              <button
                type="button"
                onClick={() => {
                  window.print()
                  setShowQrModal(null)
                }}
                className="px-4 py-1.5 bg-[#1E3A1E] text-white rounded text-xs font-bold"
              >
                Print Label
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
