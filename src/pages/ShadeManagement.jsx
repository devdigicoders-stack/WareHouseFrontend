import { useState, useMemo } from 'react'
import { Link } from 'react-router-dom'
import {
  Edit2,
  Tag,
  Search,
  Settings,
  Warehouse,
  Download,
  FileText,
  FileSpreadsheet,
  Package,
  Layers,
  CheckCircle2,
  AlertTriangle,
  X,
  Upload,
  ArrowUpRight,
  QrCode,
  Box,
  SlidersHorizontal,
} from 'lucide-react'

export default function ShadeManagement() {
  // Toast state
  const [toastMessage, setToastMessage] = useState(null)
  const triggerToast = (msg) => {
    setToastMessage(msg)
  }

  // Filter Toolbar State
  const [selectedCategory, setSelectedCategory] = useState('All Categories')
  const [selectedStatus, setSelectedStatus] = useState('All Status')
  const [searchQuery, setSearchQuery] = useState('')

  // Modals
  const [showAddModal, setShowAddModal] = useState(false)
  const [showBulkModal, setShowBulkModal] = useState(false)
  const [editingItem, setEditingItem] = useState(null)

  // 6 Dedicated Warehouse Shades Data
  const [shades, setShades] = useState([
    {
      id: 1,
      code: 'SH-01',
      name: 'Shade 1: Grains & Bulk Pulses',
      category: 'Grains & Pulses',
      commodities: 'Wheat, Rice, Dal, Pulses (50kg Bags)',
      baseUnit: 'Kg',
      packUnit: 'Bags (50kg)',
      unitsPerPack: 50,
      rows: 8,
      cols: 10,
      totalBins: 80,
      occupiedBins: 61,
      capacity: 150000,
      currentStock: 114000,
      utilization: 76,
      meterColor: 'bg-emerald-500',
      status: 'Active',
      statusClass: 'bg-emerald-100 text-emerald-800 border-emerald-200',
      manager: 'Rajesh Sharma (Storekeeper)',
    },
    {
      id: 2,
      code: 'SH-02',
      name: 'Shade 2: Edible Oils & Liquids',
      category: 'Edible Oils',
      commodities: 'Mustard Oil, Refined Oil, Ghee (15L Tins & Cans)',
      baseUnit: 'Ltr',
      packUnit: 'Tins (15L)',
      unitsPerPack: 15,
      rows: 8,
      cols: 10,
      totalBins: 80,
      occupiedBins: 50,
      capacity: 100000,
      currentStock: 62000,
      utilization: 62,
      meterColor: 'bg-emerald-500',
      status: 'Active',
      statusClass: 'bg-emerald-100 text-emerald-800 border-emerald-200',
      manager: 'Vikas Verma (Storekeeper)',
    },
    {
      id: 3,
      code: 'SH-03',
      name: 'Shade 3: Packaged Food & FMCG',
      category: 'Packaged FMCG',
      commodities: 'Parle-G Biscuits, Good Day, Maggi, Spices (Gatta/Boxes)',
      baseUnit: 'Pieces',
      packUnit: 'Gatta / Carton',
      unitsPerPack: 6,
      rows: 8,
      cols: 10,
      totalBins: 80,
      occupiedBins: 67,
      capacity: 200000,
      currentStock: 168000,
      utilization: 84,
      meterColor: 'bg-amber-500',
      status: 'Active',
      statusClass: 'bg-emerald-100 text-emerald-800 border-emerald-200',
      manager: 'Amit Patel (FMCG Storekeeper)',
    },
    {
      id: 4,
      code: 'SH-04',
      name: 'Shade 4: Packaging Materials, Bags & Cartons',
      category: 'Packaging Materials',
      commodities: 'Empty Gatta, 5-Ply Cartons, Tarpaulins, Sealing Rolls',
      baseUnit: 'Nos',
      packUnit: 'Bundles (50 Pcs)',
      unitsPerPack: 50,
      rows: 8,
      cols: 10,
      totalBins: 80,
      occupiedBins: 36,
      capacity: 80000,
      currentStock: 36000,
      utilization: 45,
      meterColor: 'bg-blue-500',
      status: 'Active',
      statusClass: 'bg-emerald-100 text-emerald-800 border-emerald-200',
      manager: 'Suresh Kumar (Packaging Incharge)',
    },
    {
      id: 5,
      code: 'SH-05',
      name: 'Shade 5: Chemicals, Cleaning & Hygiene',
      category: 'Chemicals & Hygiene',
      commodities: 'Floor Cleaners, Sanitizers, Detergents, Soaps (Drums/Cans)',
      baseUnit: 'Ltr / Nos',
      packUnit: 'Cans / Boxes',
      unitsPerPack: 10,
      rows: 8,
      cols: 10,
      totalBins: 80,
      occupiedBins: 46,
      capacity: 60000,
      currentStock: 34800,
      utilization: 58,
      meterColor: 'bg-purple-500',
      status: 'Active',
      statusClass: 'bg-emerald-100 text-emerald-800 border-emerald-200',
      manager: 'Manoj Singh (Safety Officer)',
    },
    {
      id: 6,
      code: 'SH-06',
      name: 'Shade 6: Spares, Hardware & General Materials',
      category: 'Spares & General',
      commodities: 'Hydraulic Pallet Jack Spares, Hardware, Tools, General Store',
      baseUnit: 'Units',
      packUnit: 'Crates',
      unitsPerPack: 1,
      rows: 8,
      cols: 10,
      totalBins: 80,
      occupiedBins: 30,
      capacity: 40000,
      currentStock: 15200,
      utilization: 38,
      meterColor: 'bg-slate-500',
      status: 'Active',
      statusClass: 'bg-emerald-100 text-emerald-800 border-emerald-200',
      manager: 'Prakash Rao (Maintenance Head)',
    },
  ])

  // Form State
  const [formData, setFormData] = useState({
    code: '',
    name: '',
    category: 'Packaged FMCG',
    commodities: '',
    baseUnit: 'Pieces',
    packUnit: 'Gatta',
    unitsPerPack: 6,
    capacity: '100000',
    currentStock: '50000',
    status: 'Active',
    manager: '',
  })

  // Filtered Shades
  const filteredShades = useMemo(() => {
    return shades.filter((item) => {
      if (selectedCategory !== 'All Categories' && item.category !== selectedCategory) return false
      if (selectedStatus !== 'All Status' && item.status !== selectedStatus) return false
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase()
        return (
          item.code.toLowerCase().includes(q) ||
          item.name.toLowerCase().includes(q) ||
          item.category.toLowerCase().includes(q) ||
          item.commodities.toLowerCase().includes(q) ||
          item.manager.toLowerCase().includes(q)
        )
      }
      return true
    })
  }, [shades, selectedCategory, selectedStatus, searchQuery])

  // Handle Save
  const handleSaveShade = (e) => {
    e.preventDefault()
    if (!formData.name) {
      triggerToast('Please provide shade name.')
      return
    }

    const cap = Number(formData.capacity) || 100000
    const stock = Number(formData.currentStock) || 0
    const util = Math.min(100, Math.round((stock / cap) * 100))
    const mColor = util > 85 ? 'bg-rose-500' : util > 65 ? 'bg-amber-500' : 'bg-emerald-500'

    if (editingItem) {
      setShades((prev) =>
        prev.map((s) =>
          s.id === editingItem.id
            ? {
                ...s,
                ...formData,
                capacity: cap,
                currentStock: stock,
                utilization: util,
                meterColor: mColor,
              }
            : s
        )
      )
      triggerToast(`Shade ${formData.code} updated successfully.`)
    } else {
      const newShade = {
        id: Date.now(),
        code: `SH-0${shades.length + 1}`,
        ...formData,
        rows: 8,
        cols: 10,
        totalBins: 80,
        occupiedBins: Math.round((stock / cap) * 80),
        capacity: cap,
        currentStock: stock,
        utilization: util,
        meterColor: mColor,
        statusClass: 'bg-emerald-100 text-emerald-800 border-emerald-200',
      }
      setShades((prev) => [...prev, newShade])
      triggerToast(`New shade ${newShade.code} created.`)
    }

    setShowAddModal(false)
    setEditingItem(null)
  }

  // Open Edit
  const handleOpenEdit = (shade) => {
    setEditingItem(shade)
    setFormData({
      code: shade.code,
      name: shade.name,
      category: shade.category,
      commodities: shade.commodities,
      baseUnit: shade.baseUnit,
      packUnit: shade.packUnit,
      unitsPerPack: shade.unitsPerPack,
      capacity: String(shade.capacity),
      currentStock: String(shade.currentStock),
      status: shade.status,
      manager: shade.manager,
    })
    setShowAddModal(true)
  }

  // Export CSV
  const handleExportCSV = () => {
    const headers = [
      'Shade Code',
      'Shade Name',
      'Category',
      'Stored Commodities',
      'Base Unit',
      'Packaging Unit',
      'Units Per Pack',
      'Total Bins',
      'Occupied Bins',
      'Base Unit Capacity',
      'Current Stock',
      'Utilization %',
      'Manager',
      'Status',
    ]
    const rows = shades.map((s) => [
      `"${s.code}"`,
      `"${s.name}"`,
      `"${s.category}"`,
      `"${s.commodities}"`,
      s.baseUnit,
      `"${s.packUnit}"`,
      s.unitsPerPack,
      s.totalBins,
      s.occupiedBins,
      s.capacity,
      s.currentStock,
      `${s.utilization}%`,
      `"${s.manager}"`,
      s.status,
    ])
    const csvContent =
      'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n')
    const encodedUri = encodeURI(csvContent)
    const link = document.createElement('a')
    link.setAttribute('href', encodedUri)
    link.setAttribute('download', 'Warehouse_6Shades_Register.csv')
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    triggerToast('6 Shades register exported to CSV.')
  }

  // Aggregate stats
  const totalBaseStock = shades.reduce((sum, s) => sum + s.currentStock, 0)
  const totalBaseCapacity = shades.reduce((sum, s) => sum + s.capacity, 0)
  const totalOccupiedBins = shades.reduce((sum, s) => sum + s.occupiedBins, 0)

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
              <span>Shade Management (6 Dedicated Shades)</span>
            </h1>
            <p className="text-xs text-slate-500 font-medium">
              Overview and configuration of the warehouse&apos;s 6 commercial shades, storage capacities, and base unit stocks.
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="text-xs text-slate-400 flex items-center gap-1.5 font-medium mr-2">
            <Link to="/dashboard" className="hover:text-slate-700">Home</Link>
            <span>›</span>
            <span className="text-slate-500">Warehouse Management</span>
            <span>›</span>
            <span className="text-slate-800 font-semibold">Shade Management</span>
          </div>

          <Link
            to="/location-master"
            className="bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold px-3.5 py-2.5 rounded-lg flex items-center gap-1.5 transition"
          >
            <span>Open 2D Grid Matrix</span>
            <ArrowUpRight className="w-4 h-4" />
          </Link>

          <button
            type="button"
            onClick={() => {
              setEditingItem(null)
              setFormData({
                code: `SH-0${shades.length + 1}`,
                name: `Shade ${shades.length + 1}`,
                category: 'Packaged FMCG',
                commodities: '',
                baseUnit: 'Pieces',
                packUnit: 'Gatta',
                unitsPerPack: 6,
                capacity: '100000',
                currentStock: '0',
                status: 'Active',
                manager: '',
              })
              setShowAddModal(true)
            }}
            className="bg-[#1F331E] hover:bg-[#2A4428] text-white text-xs font-bold px-4 py-2.5 rounded-lg flex items-center gap-2 shadow-xs transition cursor-pointer"
          >
            <span className="text-sm font-bold leading-none">+</span>
            <span>Configure Shade</span>
          </button>
        </div>
      </div>

      {/* 4 KPI Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Total Shades */}
        <div className="bg-white rounded-xl p-4 shadow-xs border border-slate-200 flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-xl bg-emerald-700 text-white flex items-center justify-center shrink-0 shadow-xs">
            <Warehouse className="w-6 h-6" />
          </div>
          <div>
            <p className="text-[11px] font-semibold text-slate-500">Dedicated Shades</p>
            <div className="flex items-center gap-2">
              <h3 className="text-2xl font-black text-slate-800 leading-tight">6</h3>
              <span className="bg-emerald-100 text-emerald-800 text-[9px] font-bold px-1.5 py-0.5 rounded-full">
                100% Active
              </span>
            </div>
            <p className="text-[10px] text-slate-400 font-medium">Shades 1 to 6</p>
          </div>
        </div>

        {/* Card 2: Total Grid Bins */}
        <div className="bg-white rounded-xl p-4 shadow-xs border border-slate-200 flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-xl bg-indigo-600 text-white flex items-center justify-center shrink-0 shadow-xs">
            <Layers className="w-6 h-6" />
          </div>
          <div>
            <p className="text-[11px] font-semibold text-slate-500">Total Storage Bins</p>
            <h3 className="text-2xl font-black text-slate-800 leading-tight">480</h3>
            <p className="text-[10px] text-slate-400 font-medium">{totalOccupiedBins} Bins Occupied (60.4%)</p>
          </div>
        </div>

        {/* Card 3: Base Unit Capacity */}
        <div className="bg-white rounded-xl p-4 shadow-xs border border-slate-200 flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-xl bg-amber-500 text-white flex items-center justify-center shrink-0 shadow-xs">
            <Package className="w-6 h-6" />
          </div>
          <div>
            <p className="text-[11px] font-semibold text-slate-500">Base Unit Capacity</p>
            <h3 className="text-2xl font-black text-slate-800 leading-tight">
              {(totalBaseCapacity / 1000).toFixed(0)}k Units
            </h3>
            <p className="text-[10px] text-slate-400 font-medium">Pieces, Kg, Ltr &amp; Nos</p>
          </div>
        </div>

        {/* Card 4: Base Unit Stock */}
        <div className="bg-white rounded-xl p-4 shadow-xs border border-slate-200 flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-xl bg-[#1E3A1E] text-white flex items-center justify-center shrink-0 shadow-xs">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <div>
            <p className="text-[11px] font-semibold text-slate-500">Occupied Stock</p>
            <h3 className="text-2xl font-black text-slate-800 leading-tight">
              {(totalBaseStock / 1000).toFixed(0)}k Units
            </h3>
            <p className="text-[10px] text-emerald-600 font-bold">
              {Math.round((totalBaseStock / totalBaseCapacity) * 100)}% Overall Utilization
            </p>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 6 DEDICATED SHADES VISUAL CARDS GRID                                      */}
      {/* ========================================================================= */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {shades.map((s) => {
          return (
            <div
              key={s.id}
              className="bg-white rounded-xl p-4.5 shadow-xs border border-slate-200 hover:border-emerald-600/40 transition flex flex-col justify-between space-y-3"
            >
              <div>
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-lg bg-[#1E3A1E] text-white flex items-center justify-center font-mono font-black text-xs">
                      {s.code}
                    </div>
                    <div>
                      <h3 className="font-bold text-slate-900 text-sm leading-tight">{s.name}</h3>
                      <p className="text-[11px] font-semibold text-emerald-700">{s.category}</p>
                    </div>
                  </div>
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${s.statusClass}`}>
                    {s.status}
                  </span>
                </div>

                <p className="text-[11px] text-slate-500 mt-2 line-clamp-2">
                  <strong>Commodities:</strong> {s.commodities}
                </p>

                {/* Base Unit & Packaging Ratio Info */}
                <div className="mt-3 p-2.5 bg-slate-50 rounded-lg border border-slate-200/80 text-[11px] space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500">Base Inventory Unit:</span>
                    <span className="font-bold text-slate-800">{s.baseUnit}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500">Packaging Ratio:</span>
                    <span className="font-medium text-slate-700">
                      1 {s.packUnit} = {s.unitsPerPack} {s.baseUnit}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500">Grid Bins:</span>
                    <span className="font-mono font-bold text-slate-800">
                      {s.occupiedBins} / {s.totalBins} Bins (8R × 10C)
                    </span>
                  </div>
                </div>

                {/* Utilization Progress Bar */}
                <div className="mt-3 space-y-1">
                  <div className="flex items-center justify-between text-[10px] font-semibold">
                    <span className="text-slate-500">Capacity Utilization</span>
                    <span className="text-slate-800 font-mono font-bold">{s.utilization}%</span>
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                    <div
                      className={`h-full rounded-full ${
                        s.utilization > 80 ? 'bg-rose-500' : s.utilization > 60 ? 'bg-amber-500' : 'bg-emerald-500'
                      }`}
                      style={{ width: `${s.utilization}%` }}
                    ></div>
                  </div>
                  <div className="flex items-center justify-between text-[10px] text-slate-400 font-mono pt-0.5">
                    <span>Stock: {s.currentStock.toLocaleString()} {s.baseUnit}</span>
                    <span>Cap: {s.capacity.toLocaleString()}</span>
                  </div>
                </div>
              </div>

              {/* Bottom Card Actions */}
              <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
                <span className="text-[10px] text-slate-400 truncate max-w-[150px]">
                  👤 {s.manager}
                </span>

                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => handleOpenEdit(s)}
                    className="p-1.5 bg-slate-50 hover:bg-slate-100 text-slate-600 rounded-lg border border-slate-200 transition cursor-pointer"
                    title="Edit Shade"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                  <Link
                    to="/location-master"
                    className="px-2.5 py-1.5 bg-[#1E3A1E] hover:bg-[#2A4428] text-white rounded-lg font-bold text-[11px] flex items-center gap-1 transition shadow-xs"
                  >
                    <span>View Grid</span>
                    <ArrowUpRight className="w-3 h-3" />
                  </Link>
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {/* ========================================================================= */}
      {/* SHADES REGISTER MASTER TABLE                                              */}
      {/* ========================================================================= */}
      <div className="bg-white rounded-xl shadow-xs border border-slate-200 overflow-hidden flex flex-col">
        <div className="p-4 border-b border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Warehouse className="w-4 h-4 text-emerald-700" />
            <h2 className="text-sm font-bold text-slate-800">Shade Master Register (6 Dedicated Storage Facilities)</h2>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleExportCSV}
              className="bg-[#1F331E] hover:bg-[#2A4428] text-white text-xs font-bold px-3 py-1.5 rounded-lg flex items-center gap-1.5 shadow-xs transition cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export CSV</span>
            </button>
            <button
              type="button"
              onClick={() => window.print()}
              className="bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition cursor-pointer"
            >
              <FileText className="w-3.5 h-3.5" />
              <span>Print Register</span>
            </button>
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
          <table className="w-full text-left text-xs divide-y divide-slate-200 border-collapse table-nowrap" style={{ minWidth: '1050px' }}>
            <thead className="bg-slate-50 text-slate-600 font-bold uppercase tracking-wider text-[11px]">
              <tr>
                <th className="py-3 px-3 w-10 text-center">#</th>
                <th className="py-3 px-4 min-w-[100px]">Shade Code</th>
                <th className="py-3 px-4 min-w-[200px]">Shade Name &amp; Category</th>
                <th className="py-3 px-4 min-w-[120px]">Base Unit</th>
                <th className="py-3 px-4 min-w-[150px]">Packaging Ratio</th>
                <th className="py-3 px-4 min-w-[110px] text-center">Grid Bins</th>
                <th className="py-3 px-4 min-w-[140px] text-right">Base Capacity</th>
                <th className="py-3 px-4 min-w-[140px] text-right">Occupied Stock</th>
                <th className="py-3 px-4 min-w-[100px] text-center">Utilization</th>
                <th className="py-3 px-4 min-w-[100px] text-center">Status</th>
                <th className="py-3 px-3 text-center w-20">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 bg-white">
              {filteredShades.map((row, idx) => (
                <tr key={row.id} className="hover:bg-emerald-50/40 transition">
                  <td className="py-3 px-3 text-center text-slate-400 font-bold">{idx + 1}</td>
                  <td className="py-3 px-4 font-mono font-bold text-slate-900">{row.code}</td>
                  <td className="py-3 px-4 text-slate-800">
                    <div className="font-bold text-slate-900">{row.name}</div>
                    <div className="text-[10px] text-slate-500 truncate max-w-[220px]">{row.commodities}</div>
                  </td>
                  <td className="py-3 px-4 font-bold text-emerald-800">{row.baseUnit}</td>
                  <td className="py-3 px-4 text-slate-600">
                    1 {row.packUnit} = {row.unitsPerPack} {row.baseUnit}
                  </td>
                  <td className="py-3 px-4 text-center font-mono">
                    <span className="font-bold text-slate-800">{row.occupiedBins}</span>
                    <span className="text-slate-400"> / {row.totalBins}</span>
                  </td>
                  <td className="py-3 px-4 text-right font-mono text-slate-600">
                    {row.capacity.toLocaleString()} {row.baseUnit}
                  </td>
                  <td className="py-3 px-4 text-right font-mono font-bold text-slate-900">
                    {row.currentStock.toLocaleString()} {row.baseUnit}
                  </td>
                  <td className="py-3 px-4 text-center">
                    <span className="font-mono font-bold text-slate-800">{row.utilization}%</span>
                  </td>
                  <td className="py-3 px-4 text-center">
                    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${row.statusClass}`}>
                      {row.status}
                    </span>
                  </td>
                  <td className="py-3 px-3 text-center">
                    <button
                      type="button"
                      onClick={() => handleOpenEdit(row)}
                      className="p-1.5 bg-slate-50 hover:bg-slate-100 text-slate-600 rounded-lg border border-slate-200 transition cursor-pointer"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* MODAL: Configure Shade                                                    */}
      {/* ========================================================================= */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 animate-in fade-in zoom-in duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="font-black text-slate-900 text-sm">
                {editingItem ? 'Edit Shade Configuration' : 'Add New Warehouse Shade'}
              </h3>
              <button
                type="button"
                onClick={() => setShowAddModal(false)}
                className="text-slate-400 hover:text-slate-700 p-1 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveShade} className="space-y-3.5 pt-3 text-xs">
              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">Shade Name</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g. Shade 3: Packaged FMCG"
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs font-semibold focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">Category</label>
                  <input
                    type="text"
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs font-semibold"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">Storekeeper</label>
                  <input
                    type="text"
                    value={formData.manager}
                    onChange={(e) => setFormData({ ...formData, manager: e.target.value })}
                    placeholder="Name"
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">Stored Commodities</label>
                <input
                  type="text"
                  value={formData.commodities}
                  onChange={(e) => setFormData({ ...formData, commodities: e.target.value })}
                  placeholder="e.g. Biscuits, Noodles, Spices"
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs"
                />
              </div>

              <div className="p-2.5 bg-slate-50 border border-slate-200 rounded-lg grid grid-cols-3 gap-2 text-[10px]">
                <div>
                  <span className="font-bold text-slate-600 block mb-1">Base Unit</span>
                  <input
                    type="text"
                    value={formData.baseUnit}
                    onChange={(e) => setFormData({ ...formData, baseUnit: e.target.value })}
                    className="w-full bg-white border border-slate-200 rounded px-2 py-1 text-xs"
                  />
                </div>
                <div>
                  <span className="font-bold text-slate-600 block mb-1">Pack Type</span>
                  <input
                    type="text"
                    value={formData.packUnit}
                    onChange={(e) => setFormData({ ...formData, packUnit: e.target.value })}
                    className="w-full bg-white border border-slate-200 rounded px-2 py-1 text-xs"
                  />
                </div>
                <div>
                  <span className="font-bold text-slate-600 block mb-1">Units / Pack</span>
                  <input
                    type="number"
                    value={formData.unitsPerPack}
                    onChange={(e) => setFormData({ ...formData, unitsPerPack: Number(e.target.value) || 1 })}
                    className="w-full bg-white border border-slate-200 rounded px-2 py-1 text-xs"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">Base Capacity</label>
                  <input
                    type="number"
                    value={formData.capacity}
                    onChange={(e) => setFormData({ ...formData, capacity: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs font-mono"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">Current Stock</label>
                  <input
                    type="number"
                    value={formData.currentStock}
                    onChange={(e) => setFormData({ ...formData, currentStock: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs font-mono"
                  />
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
                  {editingItem ? 'Save Changes' : 'Create Shade'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
