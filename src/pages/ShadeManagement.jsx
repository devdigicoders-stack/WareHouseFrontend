import { useState, useMemo, useRef, useEffect } from 'react'
import { Link } from 'react-router-dom'
import {
  Warehouse,
  Package,
  Layers,
  Edit2,
  Search,
  Download,
  FileSpreadsheet,
  CheckCircle2,
  AlertTriangle,
  X,
  ArrowUpRight,
  Plus,
  RotateCcw,
  Check,
  ChevronDown,
  ShieldCheck,
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

export default function ShadeManagement() {
  // Toast state
  const [toastMessage, setToastMessage] = useState(null)
  const triggerToast = (msg) => {
    setToastMessage(msg)
    setTimeout(() => setToastMessage(null), 3200)
  }

  // Filter Toolbar State
  const [selectedCategory, setSelectedCategory] = useState('ALL')
  const [selectedStatus, setSelectedStatus] = useState('ALL')
  const [searchQuery, setSearchQuery] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const perPage = 6

  // Modals
  const [showAddModal, setShowAddModal] = useState(false)
  const [editingItem, setEditingItem] = useState(null)

  // 6 Dedicated Warehouse Shades Data
  const [shades, setShades] = useState([
    {
      id: 1,
      code: 'SH-01',
      name: 'Shade 1: Grains & Bulk Pulses',
      category: 'Grains & Pulses',
      commodities: 'Wheat, Basmati Rice, Toor Dal, Pulses (50kg Bags)',
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
      status: 'Active',
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
      status: 'Active',
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
      status: 'Active',
      manager: 'Amit Patel (FMCG Storekeeper)',
    },
    {
      id: 4,
      code: 'SH-04',
      name: 'Shade 4: Packaging Materials & Cartons',
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
      status: 'Active',
      manager: 'Suresh Kumar (Packaging Incharge)',
    },
    {
      id: 5,
      code: 'SH-05',
      name: 'Shade 5: Chemicals & Hygiene',
      category: 'Chemicals & Hygiene',
      commodities: 'Floor Cleaners, Sanitizers, Detergents, Soaps (Drums/Cans)',
      baseUnit: 'Ltr',
      packUnit: 'Cans (5L)',
      unitsPerPack: 5,
      rows: 8,
      cols: 10,
      totalBins: 80,
      occupiedBins: 46,
      capacity: 60000,
      currentStock: 34800,
      utilization: 58,
      status: 'Active',
      manager: 'Manoj Singh (Safety Officer)',
    },
    {
      id: 6,
      code: 'SH-06',
      name: 'Shade 6: Spares & General Hardware',
      category: 'Spares & General',
      commodities: 'Hydraulic Pallet Jack Spares, Hardware, Tools, Conveyor Belts',
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
      status: 'Active',
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
      if (selectedCategory !== 'ALL' && item.category !== selectedCategory) return false
      if (selectedStatus !== 'ALL' && item.status !== selectedStatus) return false
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

  // Aggregate stats calculated live
  const stats = useMemo(() => {
    const totalShades = shades.length
    const totalBaseStock = shades.reduce((sum, s) => sum + s.currentStock, 0)
    const totalBaseCapacity = shades.reduce((sum, s) => sum + s.capacity, 0)
    const totalBins = shades.reduce((sum, s) => sum + s.totalBins, 0)
    const totalOccupied = shades.reduce((sum, s) => sum + s.occupiedBins, 0)
    const avgUtil = totalBaseCapacity > 0 ? Math.round((totalBaseStock / totalBaseCapacity) * 100) : 0
    return { totalShades, totalBaseStock, totalBaseCapacity, totalBins, totalOccupied, avgUtil }
  }, [shades])

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
                occupiedBins: Math.round((util / 100) * 80),
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
        occupiedBins: Math.round((util / 100) * 80),
        capacity: cap,
        currentStock: stock,
        utilization: util,
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
      '#',
      'Shade Code',
      'Shade Name',
      'Category',
      'Stored Commodities',
      'Base Unit',
      'Packaging Unit',
      'Units Per Pack',
      'Total Bins',
      'Occupied Bins',
      'Capacity',
      'Current Stock',
      'Utilization %',
      'Manager',
      'Status',
    ]
    const rows = filteredShades.map((s, idx) => [
      idx + 1,
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
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n')
    const encodedUri = encodeURI(csvContent)
    const link = document.createElement('a')
    link.setAttribute('href', encodedUri)
    link.setAttribute('download', 'Warehouse_6Shades_Register.csv')
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    triggerToast('6 Shades register exported to CSV.')
  }

  // Dropdown Options
  const categoryOptions = [
    { value: 'ALL', label: 'All Warehouse Categories' },
    ...Array.from(new Set(shades.map((s) => s.category))).map((c) => ({
      value: c,
      label: c,
    })),
  ]

  const statusOptions = [
    { value: 'ALL', label: 'All Statuses' },
    { value: 'Active', label: 'Active (Operational)' },
    { value: 'Maintenance', label: 'Maintenance (Under Review)' },
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
            <Warehouse className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-slate-800 tracking-tight">Shade Management (6 Dedicated Facilities)</h1>
            <p className="text-xs text-slate-500 font-medium mt-0.5">
              Overview and configuration of the warehouse&apos;s 6 commercial shades, storage capacities, and base unit stocks.
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <Link
            to="/location-master"
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold shadow-xs transition"
          >
            <span>Open 2D Grid Matrix</span>
            <ArrowUpRight className="w-3.5 h-3.5 text-slate-400" />
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
                currentStock: '50000',
                status: 'Active',
                manager: '',
              })
              setShowAddModal(true)
            }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-sm transition"
          >
            <Plus className="w-4 h-4" />
            <span>Configure Shade</span>
          </button>
        </div>
      </div>

      {/* 4 Dynamic KPI Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5">
        <div className="bg-white rounded-2xl p-4 shadow-xs border border-slate-200/80 flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 border border-indigo-100 flex items-center justify-center shrink-0">
            <Warehouse className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-500">Dedicated Shades</p>
            <h3 className="text-xl font-bold text-slate-800 leading-tight mt-0.5">
              {stats.totalShades} Active
            </h3>
            <p className="text-[11px] text-indigo-600 font-medium">Shades 1 to 6 operational</p>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-4 shadow-xs border border-slate-200/80 flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 border border-emerald-100 flex items-center justify-center shrink-0">
            <Package className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-500">Total Stock Stored</p>
            <h3 className="text-xl font-bold text-slate-800 leading-tight mt-0.5">
              {stats.totalBaseStock.toLocaleString()}
            </h3>
            <p className="text-[11px] text-emerald-600 font-medium">{stats.avgUtil}% overall utilization</p>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-4 shadow-xs border border-slate-200/80 flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 border border-amber-100 flex items-center justify-center shrink-0">
            <Layers className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-500">Storage Bins</p>
            <h3 className="text-xl font-bold text-slate-800 leading-tight mt-0.5">
              {stats.totalOccupied} / {stats.totalBins}
            </h3>
            <p className="text-[11px] text-amber-600 font-medium">80 bins per shade (8×10)</p>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-4 shadow-xs border border-slate-200/80 flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-slate-50 text-slate-600 border border-slate-200 flex items-center justify-center shrink-0">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-500">Max Base Capacity</p>
            <h3 className="text-xl font-bold text-slate-800 leading-tight mt-0.5">
              {stats.totalBaseCapacity.toLocaleString()}
            </h3>
            <p className="text-[11px] text-slate-500 font-medium">Facility threshold</p>
          </div>
        </div>
      </div>

      {/* 6 Dedicated Shades Visual Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {shades.map((shade) => {
          const isHighUtil = shade.utilization > 80
          const isMidUtil = shade.utilization > 60

          return (
            <div
              key={shade.id}
              className="bg-white rounded-2xl p-5 shadow-xs border border-slate-200/90 hover:border-indigo-300 hover:shadow-md transition-all duration-200 flex flex-col justify-between group"
            >
              {/* Card Header & Identity */}
              <div className="space-y-3.5">
                <div className="flex items-center justify-between gap-2 pb-3 border-b border-slate-100">
                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-1 rounded-lg bg-indigo-50 text-indigo-700 border border-indigo-200/80 font-mono font-black text-xs shadow-2xs">
                      {shade.code}
                    </span>
                    <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700 border border-slate-200">
                      {shade.category}
                    </span>
                  </div>
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                    {shade.status}
                  </span>
                </div>

                {/* Shade Name */}
                <div>
                  <h3 className="text-base font-bold text-slate-900 group-hover:text-indigo-600 transition-colors leading-snug">
                    {shade.name}
                  </h3>
                </div>

                {/* Stored Commodities Box */}
                <div className="p-3 rounded-xl bg-slate-50/90 border border-slate-200/70">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                    Stored Commodities
                  </span>
                  <p className="text-xs font-semibold text-slate-800 leading-relaxed line-clamp-2">
                    {shade.commodities}
                  </p>
                </div>
              </div>

              {/* Metrics & Progress Section */}
              <div className="space-y-3.5 pt-4 mt-4 border-t border-slate-100">
                {/* Capacity Utilization Progress */}
                <div>
                  <div className="flex items-center justify-between text-xs font-bold mb-1.5">
                    <span className="text-slate-600">Capacity Utilization</span>
                    <span
                      className={`font-black text-xs px-2 py-0.5 rounded-md ${
                        isHighUtil
                          ? 'bg-rose-50 text-rose-700 border border-rose-200'
                          : isMidUtil
                          ? 'bg-amber-50 text-amber-700 border border-amber-200'
                          : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                      }`}
                    >
                      {shade.utilization}%
                    </span>
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden p-0.5 border border-slate-200/70">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${
                        isHighUtil
                          ? 'bg-gradient-to-r from-rose-500 to-red-600'
                          : isMidUtil
                          ? 'bg-gradient-to-r from-amber-400 to-amber-500'
                          : 'bg-gradient-to-r from-emerald-500 to-teal-500'
                      }`}
                      style={{ width: `${shade.utilization}%` }}
                    />
                  </div>
                </div>

                {/* High Contrast 2-Column Stats Box */}
                <div className="grid grid-cols-2 gap-2.5">
                  <div className="bg-slate-50 rounded-xl p-3 border border-slate-200">
                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
                      Storage Bins
                    </span>
                    <div className="text-base font-black text-slate-900 font-mono mt-0.5">
                      {shade.occupiedBins} <span className="text-xs font-semibold text-slate-400 font-sans">/ {shade.totalBins}</span>
                    </div>
                    <span className="text-[10px] text-indigo-600 font-bold block mt-0.5">
                      {Math.round((shade.occupiedBins / shade.totalBins) * 100)}% Bins Active
                    </span>
                  </div>

                  <div className="bg-slate-50 rounded-xl p-3 border border-slate-200">
                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
                      Current Stock
                    </span>
                    <div className="text-base font-black text-slate-900 font-mono mt-0.5 truncate">
                      {shade.currentStock.toLocaleString()}
                    </div>
                    <span className="text-[10px] text-slate-600 font-semibold block mt-0.5 truncate">
                      {shade.baseUnit} <span className="text-slate-400 font-normal">({shade.packUnit})</span>
                    </span>
                  </div>
                </div>

                {/* Storekeeper / Manager Row */}
                <div className="flex items-center justify-between text-xs py-1 px-1 bg-slate-50/50 rounded-lg border border-slate-100">
                  <span className="text-slate-500 font-medium pl-1">Manager:</span>
                  <span className="font-bold text-slate-800 pr-1 truncate max-w-[200px]" title={shade.manager}>
                    {shade.manager}
                  </span>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 pt-1">
                  <Link
                    to="/location-master"
                    className="flex-1 py-2 px-3 bg-indigo-50 hover:bg-indigo-600 text-indigo-700 hover:text-white border border-indigo-200 hover:border-indigo-600 text-xs font-bold rounded-xl text-center transition flex items-center justify-center gap-1.5 shadow-2xs cursor-pointer"
                  >
                    <Layers className="w-3.5 h-3.5 shrink-0" />
                    <span>View Grid Matrix</span>
                  </Link>
                  <button
                    type="button"
                    onClick={() => handleOpenEdit(shade)}
                    className="p-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-100 active:bg-slate-200 text-slate-700 transition cursor-pointer shadow-2xs shrink-0"
                    title="Edit Shade Specs"
                  >
                    <Edit2 className="w-3.5 h-3.5 text-slate-600" />
                  </button>
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {/* 100% Full-Width Shades Table */}
      <div className="bg-white rounded-2xl shadow-xs border border-slate-200/80 overflow-hidden">
        {/* Table Toolbar */}
        <div className="p-4 sm:p-5 border-b border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-3.5">
          <div className="flex items-center gap-2.5">
            <Layers className="w-4 h-4 text-indigo-600" />
            <h2 className="text-sm font-bold text-slate-800">Shade Register &amp; Capacity Specifications</h2>
            <span className="text-xs bg-slate-100 text-slate-600 font-semibold px-2 py-0.5 rounded-full border border-slate-200">
              {filteredShades.length} shades
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 items-center text-xs">
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-3" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search code, shade name, manager..."
                className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-8 pr-3 py-2 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 focus:bg-white"
              />
            </div>

            <CustomSelect
              value={selectedCategory}
              onChange={setSelectedCategory}
              options={categoryOptions}
              zIndexClass="z-30"
            />

            <CustomSelect
              value={selectedStatus}
              onChange={setSelectedStatus}
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
                <th className="py-3.5 px-4 min-w-[90px]">Code</th>
                <th className="py-3.5 px-4 min-w-[200px]">Shade Name</th>
                <th className="py-3.5 px-4 min-w-[150px]">Category</th>
                <th className="py-3.5 px-4 min-w-[140px]">Base &amp; Packaging Unit</th>
                <th className="py-3.5 px-4 text-center min-w-[110px]">Bins (Occ/Tot)</th>
                <th className="py-3.5 px-4 text-center min-w-[130px]">Base Stock</th>
                <th className="py-3.5 px-4 text-center min-w-[120px]">Capacity</th>
                <th className="py-3.5 px-4 text-center min-w-[110px]">Utilization</th>
                <th className="py-3.5 px-4 min-w-[170px]">Store Manager</th>
                <th className="py-3.5 px-4 text-center w-20">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 bg-white">
              {filteredShades.map((row, idx) => (
                <tr key={row.id} className="hover:bg-slate-50/80 transition">
                  <td className="py-3.5 px-4 text-center text-slate-400 font-bold text-[11px]">
                    {idx + 1}
                  </td>
                  <td className="py-3.5 px-4 font-mono font-bold text-slate-900">
                    {row.code}
                  </td>
                  <td className="py-3.5 px-4 font-semibold text-slate-800">
                    {row.name}
                  </td>
                  <td className="py-3.5 px-4 text-slate-600">
                    {row.category}
                  </td>
                  <td className="py-3.5 px-4">
                    <span className="font-semibold text-slate-800">{row.baseUnit}</span>
                    <span className="text-slate-400 text-[10px] block">({row.packUnit})</span>
                  </td>
                  <td className="py-3.5 px-4 text-center font-mono font-bold text-slate-700">
                    {row.occupiedBins} / {row.totalBins}
                  </td>
                  <td className="py-3.5 px-4 text-center font-mono font-bold text-slate-900">
                    {row.currentStock.toLocaleString()}
                  </td>
                  <td className="py-3.5 px-4 text-center font-mono text-slate-500">
                    {row.capacity.toLocaleString()}
                  </td>
                  <td className="py-3.5 px-4 text-center">
                    <span
                      className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        row.utilization > 80
                          ? 'bg-rose-100 text-rose-800'
                          : row.utilization > 60
                          ? 'bg-amber-100 text-amber-800'
                          : 'bg-emerald-100 text-emerald-800'
                      }`}
                    >
                      {row.utilization}%
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-slate-700 font-medium">
                    {row.manager}
                  </td>
                  <td className="py-3.5 px-4 text-center">
                    <button
                      type="button"
                      onClick={() => handleOpenEdit(row)}
                      className="p-1.5 rounded-lg text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 border border-slate-200 transition"
                      title="Edit Shade Details"
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

      {/* MODAL: Configure / Edit Shade */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold">
                  <Warehouse className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-bold text-sm text-slate-800">
                    {editingItem ? 'Edit Shade Parameters' : 'Configure New Warehouse Shade'}
                  </h3>
                  <p className="text-[11px] text-slate-500">Storage capacity and base unit specification</p>
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

            <form onSubmit={handleSaveShade} className="pt-4 space-y-3.5 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Shade Code</label>
                  <input
                    type="text"
                    required
                    value={formData.code}
                    onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2 text-xs font-mono font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 focus:bg-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Shade Name</label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2 text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 focus:bg-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Category</label>
                <input
                  type="text"
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 focus:bg-white"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Stored Commodities Description</label>
                <input
                  type="text"
                  value={formData.commodities}
                  onChange={(e) => setFormData({ ...formData, commodities: e.target.value })}
                  placeholder="e.g. Basmati Rice, Mustard Oil, Confectionery"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 focus:bg-white"
                />
              </div>

              <div className="grid grid-cols-3 gap-2.5">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Base Unit</label>
                  <input
                    type="text"
                    value={formData.baseUnit}
                    onChange={(e) => setFormData({ ...formData, baseUnit: e.target.value })}
                    placeholder="e.g. Kg, Pieces, Ltr"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2 text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 focus:bg-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Pack Unit</label>
                  <input
                    type="text"
                    value={formData.packUnit}
                    onChange={(e) => setFormData({ ...formData, packUnit: e.target.value })}
                    placeholder="e.g. Gatta, Bags"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2 text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 focus:bg-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Units / Pack</label>
                  <input
                    type="number"
                    value={formData.unitsPerPack}
                    onChange={(e) => setFormData({ ...formData, unitsPerPack: Number(e.target.value) || 1 })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2 text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 focus:bg-white"
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
                  <label className="block text-xs font-bold text-slate-700 mb-1">Assigned Manager</label>
                  <input
                    type="text"
                    value={formData.manager}
                    onChange={(e) => setFormData({ ...formData, manager: e.target.value })}
                    placeholder="e.g. Rajesh Sharma"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 focus:bg-white"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 border border-slate-300 rounded-xl text-xs font-semibold text-slate-700 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2 rounded-xl text-xs font-bold transition"
                >
                  Save Shade Settings
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
