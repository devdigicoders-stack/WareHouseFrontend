import { useState, useMemo } from 'react'
import { Link } from 'react-router-dom'
import {
  ChevronDown,
  ChevronRight,
  Warehouse,
  Package,
  FolderTree,
  Layers,
  MapPin,
  X,
  Upload,
  Download,
  FileSpreadsheet,
  Tag,
  Edit2,
  Lock,
  QrCode,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Info,
  SlidersHorizontal,
  RefreshCw,
} from 'lucide-react'

export default function LocationMaster() {
  // Toast state
  const [toastMessage, setToastMessage] = useState(null)
  const triggerToast = (msg) => {
    setToastMessage(msg)
  }

  // Selected Shade for visual grid view
  const [activeShadeId, setActiveShadeId] = useState('SH03') // Default to FMCG (Shade 3)

  // Filter & Search
  const [searchQuery, setSearchQuery] = useState('')
  const [filterModalOpen, setFilterModalOpen] = useState(false)
  const [statusFilter, setStatusFilter] = useState('All')
  const [shadeFilter, setShadeFilter] = useState('All')

  // Pagination
  const [currentPage, setCurrentPage] = useState(1)
  const [perPage, setPerPage] = useState(10)

  // Selected Cell for Bin Inspector Modal / Drawer
  const [selectedCell, setSelectedCell] = useState(null)

  // Tree View Expand / Collapse state (Shades 1 to 6)
  const [expandedNodes, setExpandedNodes] = useState({
    root: true,
    sh01: false,
    sh02: false,
    sh03: true,
    sh04: false,
    sh05: false,
    sh06: false,
  })

  const [selectedTreeNode, setSelectedTreeNode] = useState(null)

  const toggleNode = (nodeKey) => {
    setExpandedNodes((prev) => ({
      ...prev,
      [nodeKey]: !prev[nodeKey],
    }))
  }

  // Modals state
  const [showAddModal, setShowAddModal] = useState(false)
  const [showBulkModal, setShowBulkModal] = useState(false)
  const [showPrintModal, setShowPrintModal] = useState(false)
  const [qrModalBin, setQrModalBin] = useState(null)
  const [editingItem, setEditingItem] = useState(null)
  const [actionMenuId, setActionMenuId] = useState(null)

  // Form State for Add / Edit
  const [formData, setFormData] = useState({
    code: '',
    shadeId: 'SH03',
    row: '01',
    col: '01',
    productName: '',
    batchNo: '',
    baseUnit: 'Pieces',
    packUnit: 'Gatta / Carton',
    unitsPerPack: 6,
    capacity: '1000',
    currentStock: '0',
    status: 'Empty',
  })

  // 6 Dedicated Shades Definition
  const SHADES = [
    {
      id: 'SH01',
      name: 'Shade 1: Grains & Bulk Pulses',
      category: 'Grains & Pulses',
      description: 'Storage for Wheat, Rice, Dal & Pulses',
      baseUnit: 'Kg',
      packUnit: 'Bags (50kg)',
      rows: 8,
      cols: 10,
      totalBins: 80,
      utilization: 76,
      bgAccent: 'border-amber-500/40 text-amber-900',
      badge: 'bg-amber-100 text-amber-800',
    },
    {
      id: 'SH02',
      name: 'Shade 2: Edible Oils & Liquids',
      category: 'Edible Oils',
      description: 'Refined Oil, Mustard Oil, Ghee in Tins & Cans',
      baseUnit: 'Ltr',
      packUnit: 'Tins (15L) / Cans',
      rows: 8,
      cols: 10,
      totalBins: 80,
      utilization: 62,
      bgAccent: 'border-yellow-500/40 text-yellow-900',
      badge: 'bg-yellow-100 text-yellow-800',
    },
    {
      id: 'SH03',
      name: 'Shade 3: Packaged Food & FMCG',
      category: 'Packaged FMCG',
      description: 'Biscuits, Noodles, Spices, Confectionery',
      baseUnit: 'Pieces',
      packUnit: 'Gatta / Cartons',
      rows: 8,
      cols: 10,
      totalBins: 80,
      utilization: 84,
      bgAccent: 'border-emerald-500/40 text-emerald-900',
      badge: 'bg-emerald-100 text-emerald-800',
    },
    {
      id: 'SH04',
      name: 'Shade 4: Packaging Cartons & Bags',
      category: 'Packaging Materials',
      description: 'Corrugated Boxes, Tarpaulins, Empty Gatta, Polythene',
      baseUnit: 'Nos',
      packUnit: 'Bundles (100 Pcs)',
      rows: 8,
      cols: 10,
      totalBins: 80,
      utilization: 45,
      bgAccent: 'border-blue-500/40 text-blue-900',
      badge: 'bg-blue-100 text-blue-800',
    },
    {
      id: 'SH05',
      name: 'Shade 5: Chemicals & Hygiene',
      category: 'Chemicals & Hygiene',
      description: 'Sanitizers, Disinfectants, Detergents, Soap',
      baseUnit: 'Nos / Ltr',
      packUnit: 'Boxes / Drums',
      rows: 8,
      cols: 10,
      totalBins: 80,
      utilization: 58,
      bgAccent: 'border-purple-500/40 text-purple-900',
      badge: 'bg-purple-100 text-purple-800',
    },
    {
      id: 'SH06',
      name: 'Shade 6: Spares, Hardware & General',
      category: 'Spares & General',
      description: 'Maintenance Spares, Tools, Hardware & General Store',
      baseUnit: 'Units',
      packUnit: 'Crates',
      rows: 8,
      cols: 10,
      totalBins: 80,
      utilization: 38,
      bgAccent: 'border-slate-500/40 text-slate-900',
      badge: 'bg-slate-100 text-slate-800',
    },
  ]

  // Master Locations Table Data (Commercial items, Base Units, 6 Shades)
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
      statusClass: 'bg-emerald-100 text-emerald-800 border-emerald-200',
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
      statusClass: 'bg-rose-100 text-rose-800 border-rose-200',
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
      statusClass: 'bg-amber-100 text-amber-800 border-amber-200',
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
      statusClass: 'bg-blue-100 text-blue-800 border-blue-200',
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
      statusClass: 'bg-emerald-100 text-emerald-800 border-emerald-200',
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
      statusClass: 'bg-emerald-100 text-emerald-800 border-emerald-200',
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
      statusClass: 'bg-emerald-100 text-emerald-800 border-emerald-200',
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
      statusClass: 'bg-emerald-100 text-emerald-800 border-emerald-200',
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
      statusClass: 'bg-emerald-100 text-emerald-800 border-emerald-200',
    },
    {
      id: 10,
      code: 'SH06-R01-C01',
      shadeId: 'SH06',
      shadeName: 'Shade 6: Spares, Hardware & General',
      row: 'R01',
      col: 'C01',
      productName: 'Heavy-Duty Hydraulic Pallet Jack Spares',
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
      statusClass: 'bg-emerald-100 text-emerald-800 border-emerald-200',
    },
  ])

  // Filtered Locations
  const filteredLocations = useMemo(() => {
    return locations.filter((loc) => {
      if (shadeFilter !== 'All' && loc.shadeId !== shadeFilter) return false
      if (statusFilter !== 'All' && loc.status !== statusFilter) return false
      if (selectedTreeNode && !loc.code.startsWith(selectedTreeNode)) return false
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
  }, [locations, shadeFilter, statusFilter, selectedTreeNode, searchQuery])

  // Active Shade Info
  const currentActiveShade = useMemo(() => {
    return SHADES.find((s) => s.id === activeShadeId) || SHADES[2]
  }, [activeShadeId])

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

        // Find existing match or synthesize realistic status
        const matched = locations.find((l) => l.code === code)
        if (matched) {
          cells.push(matched)
        } else {
          // Semi-deterministic realistic distribution based on row/col
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
            productName: isOccupied ? `${currentActiveShade.category} Batch Item` : 'Available Bin',
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
            statusClass: isFull
              ? 'bg-rose-100 text-rose-800 border-rose-200'
              : isOccupied
              ? 'bg-emerald-100 text-emerald-800 border-emerald-200'
              : 'bg-blue-100 text-blue-800 border-blue-200',
          })
        }
      }
    }
    return cells
  }, [activeShadeId, locations, currentActiveShade])

  // Handle Save New or Edit Location
  const handleSaveLocation = (e) => {
    e.preventDefault()
    if (!formData.code) {
      triggerToast('Please provide location code.')
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
        statusClass:
          formData.status === 'Occupied'
            ? 'bg-emerald-100 text-emerald-800 border-emerald-200'
            : formData.status === 'Full'
            ? 'bg-rose-100 text-rose-800 border-rose-200'
            : 'bg-blue-100 text-blue-800 border-blue-200',
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

  // Open Print QR Modal for a specific bin
  const handleOpenPrintQr = (bin) => {
    setQrModalBin(bin)
    setShowPrintModal(true)
  }

  // Export CSV
  const handleExportCSV = () => {
    const headers = [
      'Bin Code',
      'Shade',
      'Row',
      'Col',
      'Product Name',
      'Batch No',
      'Base Unit',
      'Packaging Unit',
      'Units Per Pack',
      'Base Capacity',
      'Base Occupied Stock',
      'Packs / Gatta Count',
      'Lab Status',
      'Status',
    ]
    const rows = locations.map((loc) => [
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
    const csvContent =
      'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n')
    const encodedUri = encodeURI(csvContent)
    const link = document.createElement('a')
    link.setAttribute('href', encodedUri)
    link.setAttribute('download', 'Warehouse_6Shades_Location_Master.csv')
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    triggerToast('6-Shades Location Master exported to CSV.')
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
          alt="Warehouse Convoy & Facility"
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
            <Warehouse className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-black text-slate-800 tracking-tight flex items-center gap-2">
              <span>Location Master (6 Warehouse Shades Grid)</span>
            </h1>
            <p className="text-xs text-slate-500 font-medium">
              Manage the 6 dedicated commercial shades, row &amp; column grid coordinates, and base product inventory units.
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="text-xs text-slate-400 flex items-center gap-1.5 font-medium mr-2">
            <Link to="/dashboard" className="hover:text-slate-700">Home</Link>
            <span>›</span>
            <span className="text-slate-500">Warehouse Management</span>
            <span>›</span>
            <span className="text-slate-800 font-semibold">Location Master</span>
          </div>

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
                unitsPerPack: 6,
                capacity: '1000',
                currentStock: '0',
                status: 'Empty',
              })
              setShowAddModal(true)
            }}
            className="bg-[#1F331E] hover:bg-[#2A4428] text-white text-xs font-bold px-4 py-2.5 rounded-lg flex items-center gap-2 shadow-xs transition cursor-pointer"
          >
            <span className="text-sm font-bold leading-none">+</span>
            <span>Add Grid Bin</span>
          </button>
        </div>
      </div>

      {/* 5 KPI Stat Summary Cards tailored to 6-Shade Architecture */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
        {/* Card 1: Total Shades */}
        <div className="bg-white rounded-xl p-3.5 shadow-xs border border-slate-200 flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-emerald-700 text-white flex items-center justify-center shrink-0 shadow-xs">
            <Warehouse className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[11px] font-semibold text-slate-500">Dedicated Shades</p>
            <div className="flex items-center gap-2">
              <h3 className="text-2xl font-black text-slate-800 leading-tight">6</h3>
              <span className="bg-emerald-100 text-emerald-800 text-[9px] font-bold px-1.5 py-0.5 rounded-full">
                Active
              </span>
            </div>
            <p className="text-[10px] text-slate-400 font-medium">Shades 1 to 6</p>
          </div>
        </div>

        {/* Card 2: Total Storage Bins */}
        <div className="bg-white rounded-xl p-3.5 shadow-xs border border-slate-200 flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-indigo-600 text-white flex items-center justify-center shrink-0 shadow-xs">
            <Layers className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[11px] font-semibold text-slate-500">Total Grid Bins</p>
            <h3 className="text-2xl font-black text-slate-800 leading-tight">480</h3>
            <p className="text-[10px] text-slate-400 font-medium">8 Rows × 10 Cols / Shade</p>
          </div>
        </div>

        {/* Card 3: Occupied Bins */}
        <div className="bg-white rounded-xl p-3.5 shadow-xs border border-slate-200 flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-amber-500 text-white flex items-center justify-center shrink-0 shadow-xs">
            <Package className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[11px] font-semibold text-slate-500">Occupied Bins</p>
            <h3 className="text-2xl font-black text-slate-800 leading-tight">324</h3>
            <p className="text-[10px] text-slate-400 font-medium">67.5% utilization</p>
          </div>
        </div>

        {/* Card 4: Available Bins */}
        <div className="bg-white rounded-xl p-3.5 shadow-xs border border-slate-200 flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-blue-500 text-white flex items-center justify-center shrink-0 shadow-xs">
            <CheckCircle2 className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[11px] font-semibold text-slate-500">Available Bins</p>
            <h3 className="text-2xl font-black text-slate-800 leading-tight">156</h3>
            <p className="text-[10px] text-slate-400 font-medium">Ready for Put-Away</p>
          </div>
        </div>

        {/* Card 5: Base Product Units */}
        <div className="bg-white rounded-xl p-3.5 shadow-xs border border-slate-200 flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-[#1E3A1E] text-white flex items-center justify-center shrink-0 shadow-xs">
            <QrCode className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[11px] font-semibold text-slate-500">Base Unit Rule</p>
            <h3 className="text-sm font-black text-slate-800 leading-tight">1 Gatta = 6 Pcs</h3>
            <p className="text-[10px] text-emerald-600 font-bold">Minimum Unit Inventory</p>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* SHADE SELECTION TABS: 6 Shades pill selector                              */}
      {/* ========================================================================= */}
      <div className="bg-white rounded-xl p-3 shadow-xs border border-slate-200 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-1">
          {SHADES.map((s) => {
            const isActive = activeShadeId === s.id
            return (
              <button
                key={s.id}
                type="button"
                onClick={() => {
                  setActiveShadeId(s.id)
                  setSelectedCell(null)
                  triggerToast(`Switched to ${s.name}`)
                }}
                className={`px-3.5 py-2 rounded-lg text-xs font-bold transition flex items-center gap-2 whitespace-nowrap cursor-pointer ${
                  isActive
                    ? 'bg-[#1E3A1E] text-white shadow-xs'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                <span>{s.id}:</span>
                <span>{s.category}</span>
                <span
                  className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono ${
                    isActive ? 'bg-white/20 text-white' : 'bg-slate-200 text-slate-700'
                  }`}
                >
                  {s.utilization}%
                </span>
              </button>
            )
          })}
        </div>

        <div className="flex items-center gap-2 text-xs">
          <button
            type="button"
            onClick={handleExportCSV}
            className="bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-700 px-3 py-1.5 rounded-lg font-semibold flex items-center gap-1.5 cursor-pointer"
          >
            <Download className="w-3.5 h-3.5 text-slate-500" />
            <span>Export CSV</span>
          </button>
          <button
            type="button"
            onClick={() => setShowBulkModal(true)}
            className="bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-700 px-3 py-1.5 rounded-lg font-semibold flex items-center gap-1.5 cursor-pointer"
          >
            <FileSpreadsheet className="w-3.5 h-3.5 text-slate-500" />
            <span>Import Bins</span>
          </button>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 2D VISUAL GRID MATRIX (Rows 1-8 x Columns 1-10) + Bin Details Panel       */}
      {/* ========================================================================= */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-start">
        {/* Left 8 cols: Interactive 2D Grid Matrix */}
        <div className="lg:col-span-8 bg-white rounded-xl p-4 shadow-xs border border-slate-200 space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-slate-100">
            <div>
              <h2 className="text-sm font-black text-slate-800 flex items-center gap-2">
                <span>{currentActiveShade.name} — Visual Grid</span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                  80 Bins (8 Rows × 10 Columns)
                </span>
              </h2>
              <p className="text-[11px] text-slate-500">
                Click any cell to inspect bin capacity, stored batch, packaging ratio &amp; print QR label.
              </p>
            </div>

            {/* Matrix Legend */}
            <div className="flex flex-wrap items-center gap-3 text-[10px] font-semibold text-slate-600">
              <span className="flex items-center gap-1">
                <span className="w-2.5 h-2.5 rounded-xs bg-emerald-500"></span>
                <span>Occupied</span>
              </span>
              <span className="flex items-center gap-1">
                <span className="w-2.5 h-2.5 rounded-xs bg-rose-500"></span>
                <span>Full (100%)</span>
              </span>
              <span className="flex items-center gap-1">
                <span className="w-2.5 h-2.5 rounded-xs bg-amber-400"></span>
                <span>Testing</span>
              </span>
              <span className="flex items-center gap-1">
                <span className="w-2.5 h-2.5 rounded-xs bg-slate-100 border border-slate-300"></span>
                <span>Available</span>
              </span>
            </div>
          </div>

          {/* Grid View Container */}
          <div className="overflow-x-auto no-scrollbar">
            <div className="min-w-[580px] space-y-1.5">
              {/* Column Headers (C01 to C10) */}
              <div className="grid grid-cols-11 gap-1 text-center text-[10px] font-mono font-bold text-slate-400 pb-1">
                <div className="text-right pr-2">Row\Col</div>
                {Array.from({ length: 10 }, (_, i) => (
                  <div key={i} className="py-0.5 bg-slate-50 rounded text-slate-600">
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
                  <div key={rowLabel} className="grid grid-cols-11 gap-1 items-center">
                    {/* Row Header */}
                    <div className="text-right pr-2 text-[10px] font-mono font-bold text-slate-700">
                      {rowLabel}
                    </div>

                    {/* 10 Columns */}
                    {rowCells.map((cell) => {
                      const isSelected = selectedCell?.code === cell.code
                      const isOccupied = cell.status === 'Occupied'
                      const isFull = cell.status === 'Full'
                      const isTesting = cell.labStatus === 'Under Testing'

                      let cellBg =
                        'bg-slate-50 hover:bg-blue-50 border-slate-200 text-slate-700'
                      if (isFull) {
                        cellBg =
                          'bg-rose-50 hover:bg-rose-100 border-rose-300 text-rose-900 font-bold'
                      } else if (isTesting) {
                        cellBg =
                          'bg-amber-50 hover:bg-amber-100 border-amber-300 text-amber-900'
                      } else if (isOccupied) {
                        cellBg =
                          'bg-emerald-50 hover:bg-emerald-100 border-emerald-300 text-emerald-900'
                      }

                      return (
                        <button
                          key={cell.code}
                          type="button"
                          onClick={() => setSelectedCell(cell)}
                          title={`${cell.code} - ${cell.productName} (${cell.currentStock} ${cell.baseUnit})`}
                          className={`h-11 rounded-lg border flex flex-col items-center justify-center p-1 transition cursor-pointer relative ${cellBg} ${
                            isSelected ? 'ring-2 ring-[#1E3A1E] ring-offset-1 z-10 shadow-sm' : ''
                          }`}
                        >
                          <span className="text-[9px] font-mono leading-none">{cell.col}</span>
                          <span className="text-[10px] font-black leading-tight mt-0.5">
                            {cell.currentStock > 0 ? `${cell.currentStock}` : '—'}
                          </span>
                          {/* Mini status indicator dot */}
                          {cell.currentStock > 0 && (
                            <span
                              className={`w-1.5 h-1.5 rounded-full absolute top-1 right-1 ${
                                isFull ? 'bg-rose-500' : isTesting ? 'bg-amber-500' : 'bg-emerald-500'
                              }`}
                            ></span>
                          )}
                        </button>
                      )
                    })}
                  </div>
                )
              })}
            </div>
          </div>
        </div>

        {/* Right 4 cols: Selected Bin Inspector & Quick Details */}
        <div className="lg:col-span-4 bg-white rounded-xl p-4 shadow-xs border border-slate-200 space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100">
            <h2 className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
              <QrCode className="w-4 h-4 text-emerald-700" />
              <span>Bin Inspector &amp; QR Locator</span>
            </h2>
            {selectedCell && (
              <span className="text-[10px] font-mono font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                {selectedCell.code}
              </span>
            )}
          </div>

          {selectedCell ? (
            <div className="space-y-3.5 text-xs">
              {/* Bin Header Card */}
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
                <div className="flex items-start justify-between">
                  <div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                      Grid Coordinate
                    </span>
                    <h3 className="text-base font-black font-mono text-slate-800">
                      {selectedCell.code}
                    </h3>
                    <p className="text-[11px] text-slate-500">{selectedCell.shadeName}</p>
                  </div>
                  <span
                    className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${selectedCell.statusClass}`}
                  >
                    {selectedCell.status}
                  </span>
                </div>
              </div>

              {/* Product & Batch Specs */}
              <div className="space-y-2">
                <div className="flex items-center justify-between py-1 border-b border-slate-100">
                  <span className="text-slate-500 text-[11px]">Commodity Stored:</span>
                  <span className="font-bold text-slate-800 text-right truncate max-w-[180px]">
                    {selectedCell.productName}
                  </span>
                </div>

                <div className="flex items-center justify-between py-1 border-b border-slate-100">
                  <span className="text-slate-500 text-[11px]">Batch Number:</span>
                  <span className="font-mono font-bold text-slate-800">{selectedCell.batchNo}</span>
                </div>

                {/* Base Unit vs Packaging Unit Breakdown */}
                <div className="p-2.5 bg-emerald-50/70 border border-emerald-200 rounded-lg space-y-1.5">
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="font-bold text-emerald-900">Base Unit Stock:</span>
                    <span className="font-mono font-black text-emerald-900 text-sm">
                      {selectedCell.currentStock.toLocaleString()} {selectedCell.baseUnit}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-[10px] text-emerald-800">
                    <span>Packaging Ratio:</span>
                    <span className="font-medium">
                      1 {selectedCell.packUnit} = {selectedCell.unitsPerPack} {selectedCell.baseUnit}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-[10px] text-emerald-800 font-semibold border-t border-emerald-200/60 pt-1">
                    <span>Physical Gatta / Cartons:</span>
                    <span className="font-mono font-bold">{selectedCell.packsCount} Cartons</span>
                  </div>
                </div>

                <div className="flex items-center justify-between py-1 border-b border-slate-100">
                  <span className="text-slate-500 text-[11px]">Lab Testing Status:</span>
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
                </div>

                <div className="flex items-center justify-between py-1 border-b border-slate-100">
                  <span className="text-slate-500 text-[11px]">Expiry Date:</span>
                  <span className="font-mono text-slate-700">{selectedCell.expiryDate}</span>
                </div>
              </div>

              {/* Quick Actions for Selected Bin */}
              <div className="grid grid-cols-2 gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => handleOpenPrintQr(selectedCell)}
                  className="bg-[#1E3A1E] hover:bg-[#2A4428] text-white px-3 py-2 rounded-lg font-bold flex items-center justify-center gap-1.5 text-xs transition cursor-pointer shadow-xs"
                >
                  <QrCode className="w-3.5 h-3.5" />
                  <span>Print Bin QR</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleOpenEdit(selectedCell)}
                  className="bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-300 px-3 py-2 rounded-lg font-bold flex items-center justify-center gap-1.5 text-xs transition cursor-pointer"
                >
                  <Edit2 className="w-3.5 h-3.5 text-slate-600" />
                  <span>Edit Bin</span>
                </button>
              </div>
            </div>
          ) : (
            <div className="py-8 text-center space-y-2 text-slate-400">
              <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center mx-auto text-slate-400">
                <MapPin className="w-6 h-6" />
              </div>
              <p className="text-xs font-semibold text-slate-600">No Bin Selected</p>
              <p className="text-[11px] text-slate-400 max-w-[200px] mx-auto">
                Click any cell in the 8×10 grid matrix to inspect product, batch, and QR locator tag.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* ========================================================================= */}
      {/* MASTER LOCATION RECORDS TABLE: Full Width, 6 Shades Filter                */}
      {/* ========================================================================= */}
      <div className="w-full bg-white rounded-xl shadow-xs border border-slate-200 overflow-hidden flex flex-col">
        {/* Top Filter Tabs & Search Toolbar */}
        <div className="p-4 border-b border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
          {/* Shades Dropdown & Quick Filter */}
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => setShadeFilter('All')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
                shadeFilter === 'All'
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
                onClick={() => setShadeFilter(s.id)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
                  shadeFilter === s.id
                    ? 'bg-[#1E3A1E] text-white shadow-xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {s.id}
              </button>
            ))}
          </div>

          {/* Search Input */}
          <div className="flex items-center gap-2.5">
            <div className="relative w-72 sm:w-80">
              <input
                type="text"
                placeholder="Search by bin code, product, batch..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-lg pl-8 pr-3 py-2 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-emerald-600 focus:bg-white"
              />
              <span className="absolute left-2.5 top-2.5 text-slate-400">🔍</span>
            </div>

            <button
              type="button"
              onClick={() => setFilterModalOpen(!filterModalOpen)}
              className="bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-700 px-3.5 py-2 rounded-lg text-xs font-bold flex items-center gap-1.5 transition cursor-pointer"
            >
              <SlidersHorizontal className="w-3.5 h-3.5 text-slate-600" />
              <span>Filter</span>
            </button>
          </div>
        </div>

        {/* Filter Dropdown Tray */}
        {filterModalOpen && (
          <div className="px-4 py-3 bg-slate-50 border-b border-slate-200 flex flex-wrap items-center gap-4 text-xs">
            <div className="flex items-center gap-2">
              <span className="font-bold text-slate-600">Occupancy Status:</span>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="bg-white border border-slate-200 rounded-lg px-3 py-1.5 text-xs font-medium"
              >
                <option value="All">All Statuses</option>
                <option value="Occupied">Occupied</option>
                <option value="Full">Full</option>
                <option value="Empty">Empty</option>
              </select>
            </div>
            <button
              type="button"
              onClick={() => {
                setStatusFilter('All')
                setShadeFilter('All')
                setSearchQuery('')
                setSelectedTreeNode(null)
                setFilterModalOpen(false)
                triggerToast('Filters reset')
              }}
              className="text-emerald-700 font-bold hover:underline ml-auto cursor-pointer"
            >
              Reset All Filters
            </button>
          </div>
        )}

        {/* Full Width Table Container */}
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
            style={{ minWidth: '1150px' }}
          >
            <thead className="bg-slate-50/90 text-slate-600 font-bold uppercase tracking-wider text-[11px]">
              <tr>
                <th className="py-3.5 px-4 w-12 text-center whitespace-nowrap">#</th>
                <th className="py-3.5 px-5 min-w-[150px] whitespace-nowrap">Location Code</th>
                <th className="py-3.5 px-5 min-w-[180px] whitespace-nowrap">Shade &amp; Grid</th>
                <th className="py-3.5 px-5 min-w-[220px] whitespace-nowrap">Commodity &amp; Batch</th>
                <th className="py-3.5 px-4 min-w-[140px] whitespace-nowrap text-right">
                  Base Unit Stock
                </th>
                <th className="py-3.5 px-4 min-w-[150px] whitespace-nowrap text-right">
                  Packaging (Gatta)
                </th>
                <th className="py-3.5 px-4 text-center min-w-[120px] whitespace-nowrap">
                  Lab Status
                </th>
                <th className="py-3.5 px-4 text-center min-w-[110px] whitespace-nowrap">Status</th>
                <th className="py-3.5 px-4 text-center w-28 whitespace-nowrap">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 bg-white">
              {filteredLocations.map((row, idx) => (
                <tr key={row.id} className="hover:bg-emerald-50/40 transition">
                  <td className="py-3 px-4 text-center text-slate-400 font-bold text-[11px] whitespace-nowrap">
                    {idx + 1}
                  </td>
                  <td className="py-3 px-5 font-mono font-bold text-slate-900 whitespace-nowrap">
                    {row.code}
                  </td>
                  <td className="py-3 px-5 text-slate-700 whitespace-nowrap">
                    <div className="font-semibold text-slate-800">{row.shadeName}</div>
                    <div className="text-[10px] text-slate-400 font-mono">
                      Row {row.row} • Col {row.col}
                    </div>
                  </td>
                  <td className="py-3 px-5 text-slate-800 font-medium whitespace-nowrap">
                    <div className="font-bold text-slate-900">{row.productName}</div>
                    <div className="text-[10px] text-slate-500 font-mono">
                      Batch: {row.batchNo} • Exp: {row.expiryDate}
                    </div>
                  </td>
                  <td className="py-3 px-4 text-right font-mono font-black text-slate-800 whitespace-nowrap">
                    {row.currentStock.toLocaleString()} {row.baseUnit}
                    <div className="text-[10px] text-slate-400 font-normal">
                      Cap: {row.capacity.toLocaleString()}
                    </div>
                  </td>
                  <td className="py-3 px-4 text-right font-mono text-slate-700 whitespace-nowrap">
                    <span className="font-bold text-emerald-800">{row.packsCount} Cartons</span>
                    <div className="text-[10px] text-slate-400 font-medium">
                      @ {row.unitsPerPack} {row.baseUnit}/pack
                    </div>
                  </td>
                  <td className="py-3 px-4 text-center whitespace-nowrap">
                    <span
                      className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
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
                  <td className="py-3 px-4 text-center whitespace-nowrap">
                    <span
                      className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${row.statusClass}`}
                    >
                      {row.status}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-center whitespace-nowrap">
                    <div className="flex items-center justify-center gap-1.5">
                      {/* Print Bin QR Button */}
                      <button
                        type="button"
                        onClick={() => handleOpenPrintQr(row)}
                        className="bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 p-1.5 rounded-lg text-xs font-bold transition cursor-pointer"
                        title="Print Bin QR Locator"
                      >
                        <QrCode className="w-3.5 h-3.5" />
                      </button>

                      {/* Edit Button */}
                      <button
                        type="button"
                        onClick={() => handleOpenEdit(row)}
                        className="bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-600 p-1.5 rounded-lg text-xs font-bold transition cursor-pointer"
                        title="Edit Location"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination Footer */}
        <div className="px-5 py-3.5 bg-slate-50/90 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500">
          <span className="font-medium">
            Showing <strong>1 to 10</strong> of <strong>480</strong> bins across 6 Shades
          </span>

          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
              className="px-2.5 py-1 rounded border border-slate-200 text-slate-600 hover:bg-slate-100 font-bold cursor-pointer"
            >
              ‹
            </button>
            <button
              type="button"
              className="px-3 py-1 rounded font-bold bg-[#1E3A1E] text-white shadow-xs"
            >
              1
            </button>
            <button
              type="button"
              onClick={() => triggerToast('Page 2 loaded')}
              className="px-3 py-1 rounded font-semibold text-slate-700 hover:bg-slate-100 cursor-pointer"
            >
              2
            </button>
            <button
              type="button"
              onClick={() => triggerToast('Page 3 loaded')}
              className="px-3 py-1 rounded font-semibold text-slate-700 hover:bg-slate-100 cursor-pointer"
            >
              3
            </button>
            <button
              type="button"
              onClick={() => setCurrentPage(currentPage + 1)}
              className="px-2.5 py-1 rounded border border-slate-200 text-slate-600 hover:bg-slate-100 font-bold cursor-pointer"
            >
              ›
            </button>
          </div>

          <div className="flex items-center gap-2">
            <span>Show</span>
            <select
              value={perPage}
              onChange={(e) => setPerPage(Number(e.target.value))}
              className="bg-white border border-slate-200 rounded-lg px-2.5 py-1 text-xs font-semibold text-slate-700 focus:outline-none"
            >
              <option value={10}>10</option>
              <option value={25}>25</option>
              <option value={50}>50</option>
            </select>
            <span>per page</span>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* MODAL 1: Add / Edit Location Modal                                        */}
      {/* ========================================================================= */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 animate-in fade-in zoom-in duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Warehouse className="w-5 h-5 text-emerald-700" />
                <h3 className="font-black text-slate-900 text-sm">
                  {editingItem ? 'Edit Grid Bin' : 'Add New Storage Bin'}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setShowAddModal(false)}
                className="text-slate-400 hover:text-slate-700 p-1 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveLocation} className="space-y-4 pt-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">
                    Select Shade <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={formData.shadeId}
                    onChange={(e) => {
                      const sh = e.target.value
                      setFormData({
                        ...formData,
                        shadeId: sh,
                        code: `${sh}-${formData.row}-${formData.col}`,
                      })
                    }}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs font-semibold focus:outline-none"
                  >
                    {SHADES.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">
                    Bin Code <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.code}
                    onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                    placeholder="e.g. SH03-R02-C04"
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs font-mono font-bold focus:outline-none focus:ring-1 focus:ring-emerald-600 focus:bg-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">Row</label>
                  <select
                    value={formData.row}
                    onChange={(e) => {
                      const r = e.target.value
                      setFormData({
                        ...formData,
                        row: r,
                        code: `${formData.shadeId}-${r}-${formData.col}`,
                      })
                    }}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs font-mono font-semibold"
                  >
                    {Array.from({ length: 8 }, (_, i) => (
                      <option key={i} value={`R0${i + 1}`}>
                        Row 0{i + 1}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">Column</label>
                  <select
                    value={formData.col}
                    onChange={(e) => {
                      const c = e.target.value
                      setFormData({
                        ...formData,
                        col: c,
                        code: `${formData.shadeId}-${formData.row}-${c}`,
                      })
                    }}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs font-mono font-semibold"
                  >
                    {Array.from({ length: 10 }, (_, i) => (
                      <option key={i} value={i + 1 < 10 ? `C0${i + 1}` : `C${i + 1}`}>
                        Col {i + 1 < 10 ? `0${i + 1}` : i + 1}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">
                    Commodity Stored
                  </label>
                  <input
                    type="text"
                    value={formData.productName}
                    onChange={(e) => setFormData({ ...formData, productName: e.target.value })}
                    placeholder="e.g. Parle-G Biscuits"
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs font-semibold focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">Batch No</label>
                  <input
                    type="text"
                    value={formData.batchNo}
                    onChange={(e) => setFormData({ ...formData, batchNo: e.target.value })}
                    placeholder="e.g. BT-2026-FMCG-01"
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs font-mono"
                  />
                </div>
              </div>

              {/* Base Unit vs Pack Ratio */}
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-[10px] font-bold text-slate-700 mb-1">
                    Base Unit
                  </label>
                  <input
                    type="text"
                    value={formData.baseUnit}
                    onChange={(e) => setFormData({ ...formData, baseUnit: e.target.value })}
                    placeholder="Pieces / Kg / Ltr"
                    className="w-full bg-white border border-slate-200 rounded px-2.5 py-1.5 text-xs font-semibold"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-700 mb-1">
                    Pack / Gatta Type
                  </label>
                  <input
                    type="text"
                    value={formData.packUnit}
                    onChange={(e) => setFormData({ ...formData, packUnit: e.target.value })}
                    placeholder="Gatta / Carton"
                    className="w-full bg-white border border-slate-200 rounded px-2.5 py-1.5 text-xs font-semibold"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-700 mb-1">
                    Ratio (Units / Pack)
                  </label>
                  <input
                    type="number"
                    value={formData.unitsPerPack}
                    onChange={(e) =>
                      setFormData({ ...formData, unitsPerPack: Number(e.target.value) || 1 })
                    }
                    className="w-full bg-white border border-slate-200 rounded px-2.5 py-1.5 text-xs font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">
                    Base Capacity
                  </label>
                  <input
                    type="number"
                    value={formData.capacity}
                    onChange={(e) => setFormData({ ...formData, capacity: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs font-mono"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">
                    Current Stock
                  </label>
                  <input
                    type="number"
                    value={formData.currentStock}
                    onChange={(e) => setFormData({ ...formData, currentStock: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs font-mono"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">Status</label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs font-bold"
                  >
                    <option value="Empty">Empty</option>
                    <option value="Occupied">Occupied</option>
                    <option value="Full">Full</option>
                  </select>
                </div>
              </div>

              <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-2">
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
                  {editingItem ? 'Update Bin' : 'Save Bin'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 2: Bulk Import (Excel) Modal                                        */}
      {/* ========================================================================= */}
      {showBulkModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="font-black text-slate-900 text-sm flex items-center gap-2">
                <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
                <span>Bulk Import Grid Bins (6 Shades Excel)</span>
              </h3>
              <button
                type="button"
                onClick={() => setShowBulkModal(false)}
                className="text-slate-400 hover:text-slate-700 p-1 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="py-6 text-center space-y-3">
              <div className="w-16 h-16 bg-emerald-50 text-emerald-700 rounded-full flex items-center justify-center mx-auto border border-emerald-200">
                <Upload className="w-8 h-8 text-emerald-700" />
              </div>
              <div>
                <p className="text-xs font-bold text-slate-800">Upload 6-Shade Warehouse Grid Sheet</p>
                <p className="text-[11px] text-slate-400">Supports .xlsx, .xls, .csv format</p>
              </div>
              <input type="file" className="hidden" id="bulk-loc-file" />
              <label
                htmlFor="bulk-loc-file"
                className="inline-block bg-slate-100 hover:bg-slate-200 text-slate-700 px-4 py-2 rounded-lg text-xs font-bold cursor-pointer"
              >
                Choose Excel File
              </label>
            </div>

            <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
              <button
                type="button"
                onClick={() => triggerToast('Sample 6-Shade Grid template downloaded.')}
                className="text-emerald-700 font-bold hover:underline"
              >
                Download Sample Template
              </button>
              <button
                type="button"
                onClick={() => {
                  triggerToast('Importing bins from template...')
                  setTimeout(() => {
                    setShowBulkModal(false)
                    triggerToast('Bulk import completed: 80 bins configured.')
                  }, 1000)
                }}
                className="bg-[#1E3A1E] text-white px-4 py-2 rounded-lg font-bold cursor-pointer"
              >
                Upload &amp; Import
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 3: Print Bin QR Locator Tag Modal                                   */}
      {/* ========================================================================= */}
      {showPrintModal && qrModalBin && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 shadow-2xl border border-slate-200 text-center space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <h3 className="font-black text-slate-800 text-sm flex items-center gap-1.5">
                <QrCode className="w-4 h-4 text-emerald-700" />
                <span>Warehouse Bin QR Locator</span>
              </h3>
              <button
                type="button"
                onClick={() => setShowPrintModal(false)}
                className="text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Printable Bin Tag Container */}
            <div className="border-2 border-dashed border-slate-800 rounded-xl p-4 bg-slate-50 space-y-3">
              <div className="flex items-center justify-between text-[10px] font-bold text-slate-700 pb-1 border-b border-slate-200">
                <span>CENTRAL WAREHOUSE LOGISTICS</span>
                <span className="text-emerald-800">{qrModalBin.shadeId}</span>
              </div>

              {/* Large Bin Coordinates */}
              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                  BIN COORDINATES
                </span>
                <h4 className="text-xl font-black font-mono text-slate-900 tracking-wider">
                  {qrModalBin.code}
                </h4>
                <p className="text-[11px] font-bold text-slate-700">{qrModalBin.shadeName}</p>
                <p className="text-[10px] text-slate-500 font-mono">
                  ROW: {qrModalBin.row} | COLUMN: {qrModalBin.col}
                </p>
              </div>

              {/* High-res Realistic QR Code Canvas Simulation */}
              <div className="w-36 h-36 bg-white p-2.5 mx-auto rounded-lg border border-slate-300 shadow-xs flex items-center justify-center">
                <svg className="w-full h-full text-slate-900" viewBox="0 0 100 100" fill="currentColor">
                  {/* Outer corner markers */}
                  <rect x="0" y="0" width="28" height="28" fill="currentColor" />
                  <rect x="4" y="4" width="20" height="20" fill="white" />
                  <rect x="8" y="8" width="12" height="12" fill="currentColor" />

                  <rect x="72" y="0" width="28" height="28" fill="currentColor" />
                  <rect x="76" y="4" width="20" height="20" fill="white" />
                  <rect x="80" y="8" width="12" height="12" fill="currentColor" />

                  <rect x="0" y="72" width="28" height="28" fill="currentColor" />
                  <rect x="4" y="76" width="20" height="20" fill="white" />
                  <rect x="8" y="80" width="12" height="12" fill="currentColor" />

                  {/* Grid data blocks */}
                  <rect x="36" y="4" width="6" height="6" />
                  <rect x="48" y="4" width="6" height="6" />
                  <rect x="36" y="16" width="6" height="6" />
                  <rect x="54" y="16" width="6" height="6" />
                  <rect x="42" y="28" width="6" height="6" />
                  <rect x="4" y="36" width="6" height="6" />
                  <rect x="16" y="36" width="6" height="6" />
                  <rect x="28" y="36" width="6" height="6" />
                  <rect x="40" y="36" width="6" height="6" />
                  <rect x="52" y="36" width="6" height="6" />
                  <rect x="64" y="36" width="6" height="6" />
                  <rect x="76" y="36" width="6" height="6" />
                  <rect x="88" y="36" width="6" height="6" />
                  <rect x="4" y="48" width="6" height="6" />
                  <rect x="22" y="48" width="6" height="6" />
                  <rect x="34" y="48" width="6" height="6" />
                  <rect x="46" y="48" width="6" height="6" />
                  <rect x="58" y="48" width="6" height="6" />
                  <rect x="70" y="48" width="6" height="6" />
                  <rect x="82" y="48" width="6" height="6" />
                  <rect x="94" y="48" width="6" height="6" />
                  <rect x="36" y="60" width="6" height="6" />
                  <rect x="48" y="60" width="6" height="6" />
                  <rect x="60" y="60" width="6" height="6" />
                  <rect x="36" y="72" width="6" height="6" />
                  <rect x="48" y="72" width="6" height="6" />
                  <rect x="60" y="72" width="6" height="6" />
                  <rect x="72" y="72" width="6" height="6" />
                  <rect x="84" y="72" width="6" height="6" />
                  <rect x="96" y="72" width="6" height="6" />
                  <rect x="42" y="84" width="6" height="6" />
                  <rect x="54" y="84" width="6" height="6" />
                  <rect x="66" y="84" width="6" height="6" />
                  <rect x="78" y="84" width="6" height="6" />
                  <rect x="90" y="84" width="6" height="6" />
                </svg>
              </div>

              {/* Base Unit details */}
              <div className="text-[10px] text-slate-600 border-t border-slate-200 pt-2 text-left space-y-0.5">
                <p>
                  <strong>Commodity:</strong> {qrModalBin.productName}
                </p>
                <p>
                  <strong>Stock:</strong> {qrModalBin.currentStock} {qrModalBin.baseUnit} (
                  {qrModalBin.packsCount} Cartons)
                </p>
                <p>
                  <strong>Base Unit Rule:</strong> 1 {qrModalBin.packUnit} = {qrModalBin.unitsPerPack}{' '}
                  {qrModalBin.baseUnit}
                </p>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowPrintModal(false)}
                className="px-3.5 py-1.5 border border-slate-300 rounded-lg text-xs font-semibold cursor-pointer"
              >
                Close
              </button>
              <button
                type="button"
                onClick={() => {
                  window.print()
                  setShowPrintModal(false)
                }}
                className="px-5 py-1.5 bg-[#1E3A1E] hover:bg-[#2A4428] text-white rounded-lg text-xs font-bold cursor-pointer shadow-xs"
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
