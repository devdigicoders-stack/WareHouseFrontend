import { useState, useMemo } from 'react'
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
} from 'lucide-react'

export default function StockSearch() {
  // Toast notifications state
  const [toastMessage, setToastMessage] = useState(null)
  const triggerToast = (msg) => {
    setToastMessage(msg)
  }

  // Filter form states
  const [searchKeyword, setSearchKeyword] = useState('')
  const [filterShade, setFilterShade] = useState('All Shades')
  const [filterRow, setFilterRow] = useState('All Rows')
  const [filterCol, setFilterCol] = useState('All Columns')
  const [filterCategory, setFilterCategory] = useState('All Categories')
  const [filterLabStatus, setFilterLabStatus] = useState('All')
  const [filterStatus, setFilterStatus] = useState('All')

  // Checkbox selection state
  const [selectedRows, setSelectedRows] = useState([])

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
      shadeName: 'Shade 3: Packaged FMCG',
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
      shadeName: 'Shade 3: Packaged FMCG',
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
      status: 'In Stock',
      expiryDate: '10 Nov 2027',
      labStatus: 'Passed',
      labCertNo: 'LAB-2026-GRN-042',
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
      status: 'In Stock',
      expiryDate: '20 Dec 2027',
      labStatus: 'Passed',
      labCertNo: 'LAB-2026-GRN-045',
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
      status: 'In Stock',
      expiryDate: '18 Aug 2027',
      labStatus: 'Passed',
      labCertNo: 'LAB-2026-OIL-014',
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
      status: 'Under Testing',
      expiryDate: '10 Jan 2027',
      labStatus: 'Under Testing',
      labCertNo: 'QC-IN-PROGRESS',
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
      status: 'In Stock',
      expiryDate: 'N/A',
      labStatus: 'Passed',
      labCertNo: 'CERT-NOT-REQ',
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
      status: 'In Stock',
      expiryDate: '05 May 2028',
      labStatus: 'Passed',
      labCertNo: 'LAB-2026-CHM-008',
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
      status: 'Low Stock',
      expiryDate: 'N/A',
      labStatus: 'Passed',
      labCertNo: 'CERT-MECH-02',
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
      status: 'Pending Lab Test',
      expiryDate: '10 Aug 2027',
      labStatus: 'Pending Lab Test',
      labCertNo: 'PENDING-QC',
    },
  ])

  // Filtered results
  const filteredStock = useMemo(() => {
    return stockItems.filter((item) => {
      // Shade filter
      if (filterShade !== 'All Shades' && item.shadeId !== filterShade) return false

      // Row filter
      if (filterRow !== 'All Rows' && item.row !== filterRow) return false

      // Col filter
      if (filterCol !== 'All Columns' && item.col !== filterCol) return false

      // Category filter
      if (filterCategory !== 'All Categories' && item.category !== filterCategory) return false

      // Lab status filter
      if (filterLabStatus !== 'All' && item.labStatus !== filterLabStatus) return false

      // Stock status filter
      if (filterStatus !== 'All' && item.status !== filterStatus) return false

      // Search keyword
      if (searchKeyword.trim() !== '') {
        const q = searchKeyword.toLowerCase()
        return (
          item.productName.toLowerCase().includes(q) ||
          item.sku.toLowerCase().includes(q) ||
          item.batchNo.toLowerCase().includes(q) ||
          item.location.toLowerCase().includes(q)
        )
      }

      return true
    })
  }, [stockItems, filterShade, filterRow, filterCol, filterCategory, filterLabStatus, filterStatus, searchKeyword])

  // Reset all filters
  const handleResetFilters = () => {
    setSearchKeyword('')
    setFilterShade('All Shades')
    setFilterRow('All Rows')
    setFilterCol('All Columns')
    setFilterCategory('All Categories')
    setFilterLabStatus('All')
    setFilterStatus('All')
    setSelectedRows([])
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
      'Packaging (Gatta)',
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
    link.setAttribute('download', 'Stock_Search_6Shades_Export.csv')
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    triggerToast(`Exported ${dataToExport.length} search records to CSV.`)
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
          alt="Warehouse Stock Search Operations"
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
            <Search className="w-5 h-5 text-white" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-800">
              Stock Search (6 Warehouse Shades &amp; Grid Coordinates)
            </h2>
            <p className="text-xs text-slate-500">
              Query inventory across the 6 dedicated shades, row &amp; column grid bins, base product units, and lab clearance status.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <nav className="text-xs text-slate-500 hidden lg:flex items-center gap-1.5 font-medium mr-2">
            <Link to="/dashboard" className="hover:text-slate-800">Home</Link>
            <span>›</span>
            <span className="text-slate-600">Inventory</span>
            <span>›</span>
            <span className="text-slate-800 font-semibold">Stock Search</span>
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
            onClick={() => setShowScannerModal(true)}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-[#1E3A1E] hover:bg-[#152915] text-white text-xs font-bold rounded-lg shadow-xs transition cursor-pointer"
          >
            <QrCode className="w-4 h-4" />
            <span>Scan QR / Barcode</span>
          </button>
        </div>
      </div>

      {/* COMPREHENSIVE SEARCH FILTERS CARD */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs space-y-3">
        <div className="flex items-center justify-between pb-2 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <SlidersHorizontal className="w-4 h-4 text-emerald-700" />
            <h2 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
              6-Shades Grid Search Filters
            </h2>
          </div>
          <button
            type="button"
            onClick={handleResetFilters}
            className="text-xs font-bold text-emerald-800 hover:underline flex items-center gap-1 cursor-pointer"
          >
            <RotateCcw className="w-3 h-3" />
            <span>Reset All Filters</span>
          </button>
        </div>

        {/* Filters Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-6 gap-3 text-xs">
          {/* 1. Keyword */}
          <div className="md:col-span-2">
            <label className="block text-[11px] font-bold text-slate-600 mb-1">Search Keyword</label>
            <input
              type="text"
              placeholder="Product name, SKU, batch no., bin code..."
              value={searchKeyword}
              onChange={(e) => setSearchKeyword(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 text-xs focus:ring-1 focus:ring-emerald-600 focus:bg-white focus:outline-none"
            />
          </div>

          {/* 2. Warehouse Shade */}
          <div>
            <label className="block text-[11px] font-bold text-slate-600 mb-1">Warehouse Shade</label>
            <select
              value={filterShade}
              onChange={(e) => setFilterShade(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-lg px-2 py-1.5 text-xs font-bold text-slate-800 focus:outline-none"
            >
              <option value="All Shades">All 6 Shades</option>
              {SHADES.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name}
                </option>
              ))}
            </select>
          </div>

          {/* 3. Row */}
          <div>
            <label className="block text-[11px] font-bold text-slate-600 mb-1">Row (1 to 8)</label>
            <select
              value={filterRow}
              onChange={(e) => setFilterRow(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-lg px-2 py-1.5 text-xs font-mono font-semibold text-slate-800 focus:outline-none"
            >
              <option value="All Rows">All Rows</option>
              {Array.from({ length: 8 }, (_, i) => (
                <option key={i} value={`R0${i + 1}`}>
                  Row 0{i + 1}
                </option>
              ))}
            </select>
          </div>

          {/* 4. Column */}
          <div>
            <label className="block text-[11px] font-bold text-slate-600 mb-1">Column (1 to 10)</label>
            <select
              value={filterCol}
              onChange={(e) => setFilterCol(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-lg px-2 py-1.5 text-xs font-mono font-semibold text-slate-800 focus:outline-none"
            >
              <option value="All Columns">All Columns</option>
              {Array.from({ length: 10 }, (_, i) => (
                <option key={i} value={i + 1 < 10 ? `C0${i + 1}` : `C${i + 1}`}>
                  Col {i + 1 < 10 ? `0${i + 1}` : i + 1}
                </option>
              ))}
            </select>
          </div>

          {/* 5. Lab Clearance Status */}
          <div>
            <label className="block text-[11px] font-bold text-slate-600 mb-1">Lab QC Status</label>
            <select
              value={filterLabStatus}
              onChange={(e) => setFilterLabStatus(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-lg px-2 py-1.5 text-xs font-bold text-slate-800 focus:outline-none"
            >
              <option value="All">All QC Status</option>
              <option value="Passed">Lab Passed Only</option>
              <option value="Under Testing">Under Testing</option>
              <option value="Pending Lab Test">Pending Lab Test</option>
            </select>
          </div>
        </div>
      </div>

      {/* SEARCH RESULTS TABLE */}
      <div className="bg-white rounded-xl shadow-xs border border-slate-200 overflow-hidden flex flex-col">
        <div className="p-3.5 border-b border-slate-100 flex items-center justify-between text-xs">
          <span className="font-bold text-slate-800">
            Found <strong>{filteredStock.length}</strong> matching stock items across 6 Shades
          </span>
          {selectedRows.length > 0 && (
            <span className="bg-emerald-50 text-emerald-800 border border-emerald-200 px-2.5 py-0.5 rounded-full font-bold">
              {selectedRows.length} items selected
            </span>
          )}
        </div>

        <div className="overflow-x-auto no-scrollbar scroll-smooth w-full">
          <table className="w-full text-left text-xs divide-y divide-slate-200 border-collapse table-nowrap" style={{ minWidth: '1100px' }}>
            <thead className="bg-slate-50 text-slate-600 font-bold uppercase tracking-wider text-[11px]">
              <tr>
                <th className="py-3 px-3 w-8 text-center">
                  <input
                    type="checkbox"
                    checked={selectedRows.length === filteredStock.length && filteredStock.length > 0}
                    onChange={handleSelectAll}
                    className="rounded text-emerald-700"
                  />
                </th>
                <th className="py-3 px-4 min-w-[200px]">Product &amp; SKU</th>
                <th className="py-3 px-4 min-w-[150px]">Shade &amp; Grid Bin</th>
                <th className="py-3 px-4 min-w-[120px]">Batch No.</th>
                <th className="py-3 px-4 min-w-[140px] text-right">Base Quantity</th>
                <th className="py-3 px-4 min-w-[140px] text-right">Packaging (Gatta)</th>
                <th className="py-3 px-4 text-center min-w-[120px]">Lab Status</th>
                <th className="py-3 px-4 min-w-[110px]">Expiry Date</th>
                <th className="py-3 px-4 text-center min-w-[100px]">Status</th>
                <th className="py-3 px-3 text-center w-20">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 bg-white">
              {filteredStock.map((row) => (
                <tr key={row.id} className="hover:bg-emerald-50/40 transition">
                  <td className="py-3 px-3 text-center">
                    <input
                      type="checkbox"
                      checked={selectedRows.includes(row.id)}
                      onChange={() => handleToggleRow(row.id)}
                      className="rounded text-emerald-700"
                    />
                  </td>
                  <td className="py-3 px-4 text-slate-900">
                    <div className="font-bold text-slate-900">{row.productName}</div>
                    <div className="text-[10px] text-slate-400 font-mono">{row.sku} • {row.category}</div>
                  </td>
                  <td className="py-3 px-4 font-mono font-bold text-slate-800">
                    <span className="bg-slate-100 border border-slate-200 px-2 py-0.5 rounded text-[11px]">
                      {row.location}
                    </span>
                    <div className="text-[10px] text-slate-500 font-sans font-normal truncate max-w-[140px]">
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
                        className="p-1.5 bg-slate-50 hover:bg-slate-100 text-slate-600 rounded-lg border border-slate-200 cursor-pointer"
                        title="View Details"
                      >
                        <Eye className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => setShowQrModal(row)}
                        className="p-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 rounded-lg border border-emerald-200 cursor-pointer"
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

      {/* SCANNER MODAL */}
      {showScannerModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-sm w-full p-5 shadow-2xl border border-slate-200 text-center space-y-4">
            <div className="flex items-center justify-between pb-2 border-b">
              <h3 className="font-bold text-slate-900 text-sm">Optical Gatta / Bin Scanner</h3>
              <button onClick={() => setShowScannerModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="w-36 h-36 mx-auto bg-slate-900 rounded-xl flex items-center justify-center relative border-2 border-emerald-500">
              <QrCode className="w-20 h-20 text-white animate-pulse" />
            </div>
            <p className="text-xs text-slate-500">Align QR sticker on Gatta or Bin locator to search.</p>
            <button
              onClick={() => {
                setSearchKeyword('SH03-R02-C04')
                setShowScannerModal(false)
                triggerToast('Scanned: SH03-R02-C04 applied to search.')
              }}
              className="w-full py-2 bg-[#1E3A1E] text-white rounded-lg text-xs font-bold"
            >
              Simulate Scan (SH03-R02-C04)
            </button>
          </div>
        </div>
      )}

      {/* DETAILS MODAL */}
      {showDetailsModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-5 shadow-2xl border border-slate-200 space-y-3 text-xs">
            <div className="flex items-center justify-between pb-2 border-b">
              <h3 className="font-bold text-slate-900 text-sm">Stock Item Inspection</h3>
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
                <span className="font-mono font-bold text-emerald-900">{showDetailsModal.location} ({showDetailsModal.shadeName})</span>
              </div>
              <div className="flex justify-between py-1 border-b">
                <span className="text-slate-500">Base Unit Stock:</span>
                <span className="font-mono font-black text-emerald-900">{showDetailsModal.availableQty} {showDetailsModal.baseUnit}</span>
              </div>
              <div className="flex justify-between py-1 border-b">
                <span className="text-slate-500">Packaging Ratio:</span>
                <span>1 {showDetailsModal.packUnit} = {showDetailsModal.unitsPerPack} {showDetailsModal.baseUnit}</span>
              </div>
              <div className="flex justify-between py-1 border-b">
                <span className="text-slate-500">Physical Gatta Count:</span>
                <span className="font-bold">{showDetailsModal.packsCount} {showDetailsModal.packUnit}</span>
              </div>
              <div className="flex justify-between py-1 border-b">
                <span className="text-slate-500">Lab Clearance:</span>
                <span className="font-bold text-emerald-800">{showDetailsModal.labStatus} ({showDetailsModal.labCertNo})</span>
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

      {/* QR MODAL */}
      {showQrModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-sm w-full p-5 shadow-2xl border border-slate-200 text-center space-y-3">
            <div className="flex items-center justify-between pb-2 border-b">
              <h3 className="font-black text-slate-800 text-sm flex items-center gap-1.5">
                <QrCode className="w-4 h-4 text-emerald-700" />
                <span>Bin QR Locator Tag</span>
              </h3>
              <button onClick={() => setShowQrModal(null)} className="text-slate-400 hover:text-slate-600">
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
              <button onClick={() => setShowQrModal(null)} className="px-3 py-1.5 border rounded text-xs font-semibold">
                Close
              </button>
              <button
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
