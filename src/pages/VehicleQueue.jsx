import { useState, useMemo, useRef, useEffect } from 'react'
import {
  Truck,
  Clock,
  Plus,
  Search,
  Megaphone,
  Check,
  AlertTriangle,
  X,
  Download,
  Zap,
  CheckCircle2,
  ChevronDown,
} from 'lucide-react'

// Options for Add Vehicle Modal Dropdowns
const VEHICLE_TYPE_OPTIONS = [
  { value: 'Heavy Commercial Truck', label: 'Heavy Commercial Truck (10 Wheeler)' },
  { value: 'Standard Truck (6 Wheeler)', label: 'Standard Truck (6 Wheeler)' },
  { value: 'Covered Container', label: 'Covered Container' },
  { value: 'Light Cargo Vehicle (LCV)', label: 'Light Cargo Vehicle (LCV)' },
]

const PURPOSE_OPTIONS = [
  { value: 'Material Inward', label: 'Material Inward (GRN)' },
  { value: 'Dispatch', label: 'Dispatch (Outward Delivery)' },
]

const BAY_OPTIONS = [
  { value: 'Bay 1 (General Stores - Shade 1)', label: 'Bay 1 (General Stores - Shade 1)' },
  { value: 'Bay 2 (Food & Grains - Shade 2)', label: 'Bay 2 (Food & Grains - Shade 2)' },
  { value: 'Bay 3 (Industrial Supplies - Shade 3)', label: 'Bay 3 (Industrial Supplies - Shade 3)' },
  { value: 'Bay 4 (Chemical & Hazardous - Shade 4)', label: 'Bay 4 (Chemical - Shade 4)' },
  { value: 'Dock 1 (Dispatch Outward)', label: 'Dock 1 (Dispatch Outward)' },
  { value: 'Dock 2 (Dispatch Outward)', label: 'Dock 2 (Dispatch Outward)' },
]

// Pure React Custom Select to completely eliminate OS native dropdown black-frame flicker
function CustomSelect({ label, value, onChange, options, required, zIndexClass = 'z-20' }) {
  const [isOpen, setIsOpen] = useState(false)
  const containerRef = useRef(null)

  useEffect(() => {
    function handleOutside(e) {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleOutside)
    return () => document.removeEventListener('mousedown', handleOutside)
  }, [])

  const selectedOption = options.find((opt) => opt.value === value) || options[0]

  return (
    <div className={`relative ${zIndexClass}`} ref={containerRef}>
      {label && (
        <label className="block text-xs font-bold text-slate-700 mb-1.5">
          {label} {required && <span className="text-rose-500">*</span>}
        </label>
      )}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={`w-full bg-white border rounded-xl px-3.5 py-2.5 text-xs text-left flex items-center justify-between transition-all cursor-pointer shadow-2xs ${
          isOpen
            ? 'border-indigo-600 ring-2 ring-indigo-500/20 text-slate-900'
            : 'border-slate-300 text-slate-800 hover:border-slate-400'
        }`}
      >
        <span className="truncate font-medium">{selectedOption?.label || value}</span>
        <ChevronDown
          className={`w-4 h-4 text-slate-400 shrink-0 transition-transform duration-200 ml-2 ${
            isOpen ? 'rotate-180 text-indigo-600' : ''
          }`}
        />
      </button>

      {isOpen && (
        <div className="absolute left-0 right-0 top-full mt-1.5 bg-white border border-slate-200 rounded-xl shadow-xl py-1 max-h-56 overflow-y-auto z-50">
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
                className={`w-full px-3.5 py-2 text-xs text-left flex items-center justify-between transition-colors cursor-pointer ${
                  isSelected
                    ? 'bg-indigo-50 text-indigo-700 font-bold'
                    : 'text-slate-700 hover:bg-slate-50 hover:text-slate-900'
                }`}
              >
                <span className="truncate">{opt.label}</span>
                {isSelected && <Check className="w-3.5 h-3.5 text-indigo-600 shrink-0 ml-2" />}
              </button>
            )
          })}
        </div>
      )}
    </div>
  )
}

export default function VehicleQueue() {
  const [activeTab, setActiveTab] = useState('all') // 'all', 'in-queue', 'processing', 'delayed', 'incoming', 'outgoing'
  const [searchQuery, setSearchQuery] = useState('')
  const [showAddModal, setShowAddModal] = useState(false)
  const [openActionMenuId, setOpenActionMenuId] = useState(null)
  const [toastMessage, setToastMessage] = useState(null)

  // Real-time Queue Data (Commercial Warehouse Logistics)
  const [vehicles, setVehicles] = useState([
    {
      id: 1,
      tokenNo: 'TKN-001',
      vehicleNo: 'UP32 AB 1256',
      type: 'Heavy Commercial Truck',
      driverName: 'Rajesh Yadav',
      driverPhone: '98765 43210',
      supplier: 'M/s Bharat Supply Corp',
      purpose: 'Material Inward',
      bay: 'Bay 2 (Shade 2)',
      arrivedAt: '09:12 AM',
      waitingTime: '1h 12m',
      status: 'In Queue',
    },
    {
      id: 2,
      tokenNo: 'TKN-002',
      vehicleNo: 'HR55 CD 7890',
      type: 'Covered Container',
      driverName: 'Sandeep Kumar',
      driverPhone: '98123 45678',
      supplier: 'Prime Foods & Logistics',
      purpose: 'Material Inward',
      bay: 'Bay 1 (Shade 1)',
      arrivedAt: '09:45 AM',
      waitingTime: '39m',
      status: 'In Queue',
    },
    {
      id: 3,
      tokenNo: 'TKN-003',
      vehicleNo: 'DL01 EF 4321',
      type: 'Light Cargo Vehicle (LCV)',
      driverName: 'Amit Singh',
      driverPhone: '98450 12345',
      supplier: 'Apex Manufacturing Ltd',
      purpose: 'Dispatch',
      bay: 'Dock 4 (Dispatch)',
      arrivedAt: '10:05 AM',
      waitingTime: '19m',
      status: 'Processing',
    },
    {
      id: 4,
      tokenNo: 'TKN-004',
      vehicleNo: 'UP78 GH 9987',
      type: 'Heavy Commercial Truck',
      driverName: 'Vikram Pal',
      driverPhone: '97920 01122',
      supplier: 'Global Agri Traders',
      purpose: 'Material Inward',
      bay: 'Bay 3 (Shade 3)',
      arrivedAt: '08:55 AM',
      waitingTime: '1h 29m',
      status: 'Delayed',
    },
    {
      id: 5,
      tokenNo: 'TKN-005',
      vehicleNo: 'RJ14 JK 6543',
      type: 'Standard Truck (6 Wheeler)',
      driverName: 'Imran Khan',
      driverPhone: '99100 88223',
      supplier: 'National Retail Distribution',
      purpose: 'Dispatch',
      bay: 'Dock 5 (Dispatch)',
      arrivedAt: '10:10 AM',
      waitingTime: '14m',
      status: 'In Queue',
    },
    {
      id: 6,
      tokenNo: 'TKN-006',
      vehicleNo: 'UP32 ZZ 1111',
      type: 'Heavy Commercial Truck',
      driverName: 'Ramesh Tiwari',
      driverPhone: '98333 44556',
      supplier: 'Kansai Industrial Paints',
      purpose: 'Material Inward',
      bay: 'Bay 4 (Hazardous)',
      arrivedAt: '07:50 AM',
      waitingTime: '2h 34m',
      status: 'Delayed',
    },
    {
      id: 7,
      tokenNo: 'TKN-007',
      vehicleNo: 'BR01 XY 2222',
      type: 'Light Cargo Vehicle (LCV)',
      driverName: 'Manoj Kumar',
      driverPhone: '98222 33441',
      supplier: 'Eastern Logistics Corridors',
      purpose: 'Dispatch',
      bay: 'Dock 3 (Dispatch)',
      arrivedAt: '10:15 AM',
      waitingTime: '9m',
      status: 'In Queue',
    },
    {
      id: 8,
      tokenNo: 'TKN-008',
      vehicleNo: 'MP09 KL 3333',
      type: 'Heavy Commercial Truck',
      driverName: 'Suresh Patel',
      driverPhone: '98111 22334',
      supplier: 'Central Warehouse Depot B',
      purpose: 'Material Inward',
      bay: 'Bay 2 (Shade 2)',
      arrivedAt: '09:20 AM',
      waitingTime: '1h 04m',
      status: 'Processing',
    },
    {
      id: 9,
      tokenNo: 'TKN-009',
      vehicleNo: 'GJ05 MN 4444',
      type: 'Covered Container',
      driverName: 'Arun Mehta',
      driverPhone: '98999 11223',
      supplier: 'Western Cargo Logistics',
      purpose: 'Dispatch',
      bay: 'Dock 1 (Dispatch)',
      arrivedAt: '10:18 AM',
      waitingTime: '6m',
      status: 'In Queue',
    },
    {
      id: 10,
      tokenNo: 'TKN-010',
      vehicleNo: 'UP81 RT 5555',
      type: 'Heavy Commercial Truck',
      driverName: 'Deepak Singh',
      driverPhone: '97888 77665',
      supplier: 'Northern Agro Supply Ltd',
      purpose: 'Material Inward',
      bay: 'Bay 1 (Shade 1)',
      arrivedAt: '08:30 AM',
      waitingTime: '1h 54m',
      status: 'Delayed',
    },
  ])

  // New Vehicle Form State
  const [newVehicle, setNewVehicle] = useState({
    vehicleNo: '',
    type: 'Heavy Commercial Truck',
    driverName: '',
    driverPhone: '',
    supplier: '',
    purpose: 'Material Inward',
    bay: 'Bay 1 (General Stores - Shade 1)',
  })

  // Toast trigger
  const triggerToast = (msg) => {
    setToastMessage(msg)
    setTimeout(() => setToastMessage(null), 3500)
  }

  // Filtered vehicles calculated from state
  const filteredVehicles = useMemo(() => {
    return vehicles.filter((item) => {
      // Tab filter
      if (activeTab === 'in-queue' && item.status !== 'In Queue') return false
      if (activeTab === 'processing' && item.status !== 'Processing') return false
      if (activeTab === 'delayed' && item.status !== 'Delayed') return false
      if (activeTab === 'incoming' && item.purpose !== 'Material Inward') return false
      if (activeTab === 'outgoing' && item.purpose !== 'Dispatch') return false

      // Search query filter
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase()
        return (
          item.vehicleNo.toLowerCase().includes(q) ||
          item.driverName.toLowerCase().includes(q) ||
          item.supplier.toLowerCase().includes(q) ||
          item.tokenNo.toLowerCase().includes(q) ||
          item.bay.toLowerCase().includes(q)
        )
      }
      return true
    })
  }, [vehicles, activeTab, searchQuery])

  // Add Vehicle handler
  const handleAddVehicle = (e) => {
    e.preventDefault()
    if (!newVehicle.vehicleNo.trim() || !newVehicle.driverName.trim()) {
      triggerToast('Vehicle Number and Driver Name are required!')
      return
    }

    const nextTokenNum = vehicles.length + 1
    const tokenStr = `TKN-${String(nextTokenNum).padStart(3, '0')}`

    const newItem = {
      id: Date.now(),
      tokenNo: tokenStr,
      vehicleNo: newVehicle.vehicleNo.trim().toUpperCase(),
      type: newVehicle.type,
      driverName: newVehicle.driverName.trim(),
      driverPhone: newVehicle.driverPhone.trim() || '—',
      supplier: newVehicle.supplier.trim() || 'Direct Consignment',
      purpose: newVehicle.purpose,
      bay: newVehicle.bay,
      arrivedAt: new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true }),
      waitingTime: 'Just Arrived',
      status: 'In Queue',
    }

    setVehicles([newItem, ...vehicles])
    setShowAddModal(false)
    setNewVehicle({
      vehicleNo: '',
      type: 'Heavy Commercial Truck',
      driverName: '',
      driverPhone: '',
      supplier: '',
      purpose: 'Material Inward',
      bay: 'Bay 1 (General Stores - Shade 1)',
    })
    triggerToast(`Vehicle ${newItem.vehicleNo} added with Token ${tokenStr}`)
  }

  // Action status update
  const handleStatusUpdate = (id, newStatus) => {
    setVehicles(
      vehicles.map((v) => (v.id === id ? { ...v, status: newStatus } : v))
    )
    setOpenActionMenuId(null)
    triggerToast(`Vehicle status updated to ${newStatus}`)
  }

  // Call Next Vehicle
  const handleCallNext = () => {
    const nextVeh = vehicles.find((v) => v.status === 'In Queue')
    if (nextVeh) {
      triggerToast(`📢 Calling Vehicle ${nextVeh.vehicleNo} (${nextVeh.tokenNo}) to ${nextVeh.bay}!`)
    } else {
      triggerToast('No vehicles currently waiting in queue.')
    }
  }

  // CSV export
  const handleExport = () => {
    const headers = [
      'Token No',
      'Vehicle No',
      'Type',
      'Driver Name',
      'Driver Phone',
      'Supplier / Consignee',
      'Purpose',
      'Assigned Bay',
      'Arrived At',
      'Waiting Time',
      'Status',
    ]
    const rows = vehicles.map((v) => [
      v.tokenNo,
      v.vehicleNo,
      v.type,
      `"${v.driverName}"`,
      v.driverPhone,
      `"${v.supplier}"`,
      v.purpose,
      `"${v.bay}"`,
      v.arrivedAt,
      v.waitingTime,
      v.status,
    ])
    const csvContent =
      'data:text/csv;charset=utf-8,' +
      [headers.join(','), ...rows.map((e) => e.join(','))].join('\n')
    const encodedUri = encodeURI(csvContent)
    const link = document.createElement('a')
    link.setAttribute('href', encodedUri)
    link.setAttribute('download', 'Warehouse_Vehicle_Queue.csv')
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    triggerToast('Vehicle queue exported to CSV successfully.')
  }

  // Status Badge Styling
  const getStatusBadge = (status) => {
    switch (status) {
      case 'In Queue':
        return 'bg-amber-50 text-amber-700 border-amber-200'
      case 'Processing':
        return 'bg-blue-50 text-blue-700 border-blue-200'
      case 'Completed':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200'
      case 'Delayed':
        return 'bg-rose-50 text-rose-700 border-rose-200'
      default:
        return 'bg-slate-50 text-slate-700 border-slate-200'
    }
  }

  // Waiting Time Color Coding
  const getWaitingTimeClass = (time) => {
    if (time.includes('2h') || (time.includes('1h') && !time.includes('0m'))) {
      return 'text-rose-600 font-bold'
    }
    if (time.includes('1h') || time.includes('4') || time.includes('5')) {
      return 'text-amber-700 font-semibold'
    }
    return 'text-emerald-700 font-semibold'
  }

  return (
    <div className="space-y-6 max-w-[1720px] mx-auto pb-10 select-none">
      {/* Toast Alert */}
      {toastMessage && (
        <div className="fixed top-5 right-5 z-50 bg-slate-900 text-white px-4 py-3 rounded-xl shadow-2xl border border-slate-700 flex items-center gap-3 animate-fade-in text-sm font-semibold">
          <div className="w-6 h-6 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
            <Check className="w-4 h-4" />
          </div>
          <span>{toastMessage}</span>
        </div>
      )}

      {/* 1. Header Banner - Clean, Modern & Professional */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-indigo-50 border border-indigo-100 text-indigo-600 flex items-center justify-center shrink-0 shadow-xs">
            <Truck className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-3 flex-wrap">
              <h1 className="text-xl sm:text-2xl font-bold text-slate-900">
                Vehicle Queue Management
              </h1>
              <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                ● Live Terminal Queue Active
              </span>
            </div>
            <p className="text-xs sm:text-sm text-slate-500 font-medium mt-1">
              Real-time monitoring of vehicle arrival, queue tokens, bay loading, and dispatch turnaround
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2.5 flex-wrap shrink-0">
          <button
            type="button"
            onClick={handleCallNext}
            className="px-4 py-2.5 rounded-xl border border-indigo-200 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-xs sm:text-sm font-bold flex items-center gap-2 transition cursor-pointer shadow-2xs"
          >
            <Megaphone className="w-4 h-4 text-indigo-600 shrink-0" />
            <span>Call Next Vehicle</span>
          </button>

          <button
            type="button"
            onClick={handleExport}
            className="px-4 py-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs sm:text-sm font-bold flex items-center gap-2 transition cursor-pointer shadow-2xs"
          >
            <Download className="w-4 h-4 text-slate-500 shrink-0" />
            <span>Export CSV</span>
          </button>

          <button
            type="button"
            onClick={() => setShowAddModal(true)}
            className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white text-xs sm:text-sm font-bold flex items-center gap-2 transition cursor-pointer shadow-xs"
          >
            <Plus className="w-4 h-4 shrink-0" />
            <span>Add to Queue</span>
          </button>
        </div>
      </div>

      {/* 2. Dynamic KPI Stat Cards (Interactive Fleet Indicators) */}
      <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3.5">
        {/* Card 1: Total in Queue */}
        <button
          type="button"
          onClick={() => setActiveTab('all')}
          className={`text-left bg-white rounded-2xl p-4 border transition-all duration-200 cursor-pointer flex flex-col justify-between ${
            activeTab === 'all'
              ? 'border-indigo-600 ring-2 ring-indigo-500/20 shadow-sm bg-indigo-50/15'
              : 'border-slate-200 hover:border-slate-300 hover:shadow-xs shadow-2xs'
          }`}
        >
          <div className="flex items-center justify-between gap-2 mb-3">
            <div className="w-9 h-9 rounded-xl bg-indigo-50 border border-indigo-100/80 text-indigo-600 flex items-center justify-center shrink-0">
              <Truck className="w-4.5 h-4.5" />
            </div>
            <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 border border-slate-200/60 truncate">
              Registry
            </span>
          </div>
          <div>
            <div className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight leading-none">
              {vehicles.length}
            </div>
            <div className="text-xs font-bold text-slate-800 mt-2 truncate">
              Total Active
            </div>
            <div className="text-[11px] text-slate-400 font-medium mt-0.5 truncate">
              Vehicles in Terminal
            </div>
          </div>
        </button>

        {/* Card 2: Waiting in Queue */}
        <button
          type="button"
          onClick={() => setActiveTab('in-queue')}
          className={`text-left bg-white rounded-2xl p-4 border transition-all duration-200 cursor-pointer flex flex-col justify-between ${
            activeTab === 'in-queue'
              ? 'border-amber-500 ring-2 ring-amber-500/20 shadow-sm bg-amber-50/15'
              : 'border-slate-200 hover:border-slate-300 hover:shadow-xs shadow-2xs'
          }`}
        >
          <div className="flex items-center justify-between gap-2 mb-3">
            <div className="w-9 h-9 rounded-xl bg-amber-50 border border-amber-100/80 text-amber-600 flex items-center justify-center shrink-0">
              <Clock className="w-4.5 h-4.5" />
            </div>
            <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200/80 truncate">
              In Queue
            </span>
          </div>
          <div>
            <div className="text-2xl sm:text-3xl font-black text-amber-600 tracking-tight leading-none">
              {vehicles.filter((v) => v.status === 'In Queue').length}
            </div>
            <div className="text-xs font-bold text-slate-800 mt-2 truncate">
              Waiting in Line
            </div>
            <div className="text-[11px] text-slate-400 font-medium mt-0.5 truncate">
              Awaiting Dock Call
            </div>
          </div>
        </button>

        {/* Card 3: Currently Processing */}
        <button
          type="button"
          onClick={() => setActiveTab('processing')}
          className={`text-left bg-white rounded-2xl p-4 border transition-all duration-200 cursor-pointer flex flex-col justify-between ${
            activeTab === 'processing'
              ? 'border-blue-500 ring-2 ring-blue-500/20 shadow-sm bg-blue-50/15'
              : 'border-slate-200 hover:border-slate-300 hover:shadow-xs shadow-2xs'
          }`}
        >
          <div className="flex items-center justify-between gap-2 mb-3">
            <div className="w-9 h-9 rounded-xl bg-blue-50 border border-blue-100/80 text-blue-600 flex items-center justify-center shrink-0">
              <Zap className="w-4.5 h-4.5" />
            </div>
            <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200/80 truncate">
              At Dock
            </span>
          </div>
          <div>
            <div className="text-2xl sm:text-3xl font-black text-blue-600 tracking-tight leading-none">
              {vehicles.filter((v) => v.status === 'Processing').length}
            </div>
            <div className="text-xs font-bold text-slate-800 mt-2 truncate">
              At Bay / Dock
            </div>
            <div className="text-[11px] text-blue-600 font-semibold mt-0.5 truncate">
              Unloading / Loading
            </div>
          </div>
        </button>

        {/* Card 4: Incoming Inward */}
        <button
          type="button"
          onClick={() => setActiveTab('incoming')}
          className={`text-left bg-white rounded-2xl p-4 border transition-all duration-200 cursor-pointer flex flex-col justify-between ${
            activeTab === 'incoming'
              ? 'border-emerald-500 ring-2 ring-emerald-500/20 shadow-sm bg-emerald-50/15'
              : 'border-slate-200 hover:border-slate-300 hover:shadow-xs shadow-2xs'
          }`}
        >
          <div className="flex items-center justify-between gap-2 mb-3">
            <div className="w-9 h-9 rounded-xl bg-emerald-50 border border-emerald-100/80 text-emerald-600 flex items-center justify-center shrink-0">
              <CheckCircle2 className="w-4.5 h-4.5" />
            </div>
            <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200/80 truncate">
              Inward
            </span>
          </div>
          <div>
            <div className="text-2xl sm:text-3xl font-black text-emerald-600 tracking-tight leading-none">
              {vehicles.filter((v) => v.purpose === 'Material Inward').length}
            </div>
            <div className="text-xs font-bold text-slate-800 mt-2 truncate">
              Inward Deliveries
            </div>
            <div className="text-[11px] text-slate-400 font-medium mt-0.5 truncate">
              Goods Receiving
            </div>
          </div>
        </button>

        {/* Card 5: Delayed Vehicles */}
        <button
          type="button"
          onClick={() => setActiveTab('delayed')}
          className={`text-left bg-white rounded-2xl p-4 border transition-all duration-200 cursor-pointer flex flex-col justify-between ${
            activeTab === 'delayed'
              ? 'border-rose-500 ring-2 ring-rose-500/20 shadow-sm bg-rose-50/15'
              : 'border-slate-200 hover:border-slate-300 hover:shadow-xs shadow-2xs'
          }`}
        >
          <div className="flex items-center justify-between gap-2 mb-3">
            <div className="w-9 h-9 rounded-xl bg-rose-50 border border-rose-100/80 text-rose-600 flex items-center justify-center shrink-0">
              <AlertTriangle className="w-4.5 h-4.5" />
            </div>
            <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-rose-50 text-rose-700 border border-rose-200/80 truncate">
              &gt; 1h Alert
            </span>
          </div>
          <div>
            <div className="text-2xl sm:text-3xl font-black text-rose-600 tracking-tight leading-none">
              {vehicles.filter((v) => v.status === 'Delayed').length}
            </div>
            <div className="text-xs font-bold text-slate-800 mt-2 truncate">
              Delayed Vehicles
            </div>
            <div className="text-[11px] text-rose-600 font-semibold mt-0.5 truncate">
              Supervisor Alert
            </div>
          </div>
        </button>
      </div>

      {/* 3. Filter Navigation & Live Search Bar */}
      <div className="bg-white rounded-2xl p-3 border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-3">
        {/* Filter Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto p-1 bg-slate-100 rounded-xl text-xs font-semibold">
          <button
            type="button"
            onClick={() => setActiveTab('all')}
            className={`px-3.5 py-2 rounded-lg transition whitespace-nowrap cursor-pointer ${
              activeTab === 'all'
                ? 'bg-indigo-600 text-white shadow-xs font-bold'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/70'
            }`}
          >
            All Vehicles ({vehicles.length})
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('in-queue')}
            className={`px-3.5 py-2 rounded-lg transition whitespace-nowrap cursor-pointer ${
              activeTab === 'in-queue'
                ? 'bg-indigo-600 text-white shadow-xs font-bold'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/70'
            }`}
          >
            In Queue ({vehicles.filter((v) => v.status === 'In Queue').length})
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('processing')}
            className={`px-3.5 py-2 rounded-lg transition whitespace-nowrap cursor-pointer ${
              activeTab === 'processing'
                ? 'bg-indigo-600 text-white shadow-xs font-bold'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/70'
            }`}
          >
            Processing ({vehicles.filter((v) => v.status === 'Processing').length})
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('delayed')}
            className={`px-3.5 py-2 rounded-lg transition whitespace-nowrap cursor-pointer ${
              activeTab === 'delayed'
                ? 'bg-indigo-600 text-white shadow-xs font-bold'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/70'
            }`}
          >
            Delayed ({vehicles.filter((v) => v.status === 'Delayed').length})
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('incoming')}
            className={`px-3.5 py-2 rounded-lg transition whitespace-nowrap cursor-pointer ${
              activeTab === 'incoming'
                ? 'bg-indigo-600 text-white shadow-xs font-bold'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/70'
            }`}
          >
            Inward Deliveries ({vehicles.filter((v) => v.purpose === 'Material Inward').length})
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('outgoing')}
            className={`px-3.5 py-2 rounded-lg transition whitespace-nowrap cursor-pointer ${
              activeTab === 'outgoing'
                ? 'bg-indigo-600 text-white shadow-xs font-bold'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/70'
            }`}
          >
            Dispatch Outward ({vehicles.filter((v) => v.purpose === 'Dispatch').length})
          </button>
        </div>

        {/* Live Search */}
        <div className="relative flex-1 md:max-w-xs">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3 pointer-events-none" />
          <input
            type="text"
            placeholder="Search vehicle, driver, supplier, bay..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-50 border border-slate-300 rounded-xl pl-9 pr-3 py-2 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 focus:bg-white"
          />
        </div>
      </div>

      {/* 4. Full-Width Spacious Queue Table */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div>
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <span>Active Vehicles &amp; Dock Turnaround Ledger</span>
              <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700">
                {filteredVehicles.length} of {vehicles.length}
              </span>
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Sequence order based on token generation and priority bay allocation
            </p>
          </div>

          <div className="text-xs font-semibold text-slate-500">
            Auto-refresh active
          </div>
        </div>

        <div className="overflow-x-auto rounded-xl border border-slate-200">
          <table className="w-full text-left text-sm min-w-[1050px]">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-200 text-slate-600 text-xs uppercase tracking-wider font-bold">
                <th className="py-3.5 px-3 w-10 text-center">#</th>
                <th className="py-3.5 px-4 w-28">Token No.</th>
                <th className="py-3.5 px-4 min-w-[150px]">Vehicle Reg.</th>
                <th className="py-3.5 px-4 min-w-[170px]">Driver Details</th>
                <th className="py-3.5 px-4 min-w-[180px]">Supplier / Party</th>
                <th className="py-3.5 px-4 min-w-[140px]">Purpose</th>
                <th className="py-3.5 px-4 min-w-[150px]">Assigned Bay</th>
                <th className="py-3.5 px-4 w-28">Arrived</th>
                <th className="py-3.5 px-4 w-32">Wait Time</th>
                <th className="py-3.5 px-4 text-center w-28">Status</th>
                <th className="py-3.5 px-5 text-right w-36">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 bg-white">
              {filteredVehicles.length === 0 ? (
                <tr>
                  <td colSpan="11" className="py-10 text-center text-slate-400 text-sm">
                    No vehicles found matching current filter or search criteria.
                  </td>
                </tr>
              ) : (
                filteredVehicles.map((row, idx) => (
                  <tr key={row.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3.5 px-3 text-center text-slate-400 font-mono text-xs font-semibold">
                      {idx + 1}
                    </td>
                    <td className="py-3.5 px-4 font-mono font-bold text-indigo-700 whitespace-nowrap">
                      {row.tokenNo}
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="flex flex-col">
                        <span className="font-mono font-bold text-slate-900 bg-slate-100 px-2 py-0.5 rounded-md border border-slate-200 w-fit whitespace-nowrap shadow-2xs text-xs">
                          {row.vehicleNo}
                        </span>
                        <span className="text-[11px] text-slate-500 mt-0.5 truncate max-w-[160px]">
                          {row.type}
                        </span>
                      </div>
                    </td>
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <p className="font-bold text-slate-900">{row.driverName}</p>
                      <p className="text-xs text-slate-500 font-mono">{row.driverPhone}</p>
                    </td>
                    <td className="py-3.5 px-4 text-slate-700">
                      <p className="font-medium text-slate-900 truncate max-w-[180px]">{row.supplier}</p>
                    </td>
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <span
                        className={`text-xs font-semibold px-2 py-0.5 rounded-md border ${
                          row.purpose === 'Material Inward'
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                            : 'bg-blue-50 text-blue-700 border-blue-200'
                        }`}
                      >
                        {row.purpose}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-xs font-semibold text-slate-800 whitespace-nowrap">
                      {row.bay}
                    </td>
                    <td className="py-3.5 px-4 text-xs text-slate-600 whitespace-nowrap">
                      {row.arrivedAt}
                    </td>
                    <td className="py-3.5 px-4 text-xs whitespace-nowrap">
                      <span className={getWaitingTimeClass(row.waitingTime)}>
                        {row.waitingTime}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-center whitespace-nowrap">
                      <span
                        className={`text-xs font-semibold px-2.5 py-1 rounded-full border ${getStatusBadge(
                          row.status
                        )}`}
                      >
                        {row.status}
                      </span>
                    </td>
                    <td className="py-3.5 px-5 text-right relative whitespace-nowrap">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          type="button"
                          onClick={() => {
                            triggerToast(`📢 Calling ${row.vehicleNo} (${row.tokenNo}) to ${row.bay}!`)
                          }}
                          className="p-1.5 rounded-lg bg-indigo-50 hover:bg-indigo-600 text-indigo-700 hover:text-white border border-indigo-200 hover:border-indigo-600 transition cursor-pointer shadow-2xs"
                          title="Call Vehicle to Dock"
                        >
                          <Megaphone className="w-3.5 h-3.5" />
                        </button>

                        <button
                          type="button"
                          onClick={() =>
                            setOpenActionMenuId(openActionMenuId === row.id ? null : row.id)
                          }
                          className="px-2 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-bold transition cursor-pointer"
                          title="Update Status"
                        >
                          Status ▾
                        </button>
                      </div>

                      {/* Dropdown Menu */}
                      {openActionMenuId === row.id && (
                        <div className="absolute right-5 top-12 w-48 bg-white border border-slate-200 rounded-xl shadow-xl z-20 py-1 text-left text-xs font-medium">
                          <button
                            type="button"
                            onClick={() => handleStatusUpdate(row.id, 'In Queue')}
                            className="w-full px-3 py-2 hover:bg-amber-50 text-amber-800 flex items-center gap-2 cursor-pointer"
                          >
                            <Clock className="w-3.5 h-3.5 text-amber-600" />
                            <span>Mark In Queue</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => handleStatusUpdate(row.id, 'Processing')}
                            className="w-full px-3 py-2 hover:bg-blue-50 text-blue-700 flex items-center gap-2 cursor-pointer"
                          >
                            <Zap className="w-3.5 h-3.5 text-blue-600" />
                            <span>Mark Processing (Bay)</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => handleStatusUpdate(row.id, 'Completed')}
                            className="w-full px-3 py-2 hover:bg-emerald-50 text-emerald-700 flex items-center gap-2 cursor-pointer"
                          >
                            <Check className="w-3.5 h-3.5 text-emerald-600" />
                            <span>Mark Completed</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => handleStatusUpdate(row.id, 'Delayed')}
                            className="w-full px-3 py-2 hover:bg-rose-50 text-rose-700 flex items-center gap-2 cursor-pointer"
                          >
                            <AlertTriangle className="w-3.5 h-3.5 text-rose-600" />
                            <span>Mark Delayed</span>
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ========================================================= */}
      {/* ADD VEHICLE TO QUEUE MODAL (PURE REACT DROPDOWNS - NO FLICKER) */}
      {/* ========================================================= */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full p-6 space-y-5 animate-scale-in border border-slate-200">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b pb-4 border-slate-100">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-indigo-50 border border-indigo-100 text-indigo-600 flex items-center justify-center font-bold">
                  <Truck className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">Add Vehicle to Queue</h3>
                  <p className="text-xs text-slate-500">Issue queue token and assign bay dock</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowAddModal(false)}
                className="text-slate-400 hover:text-slate-700 p-1.5 rounded-lg hover:bg-slate-100 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddVehicle} className="space-y-4 text-xs">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Vehicle Registration Number <span className="text-rose-500">*</span>
                </label>
                <div className="relative flex rounded-xl overflow-hidden border border-slate-300 focus-within:ring-2 focus-within:ring-indigo-500/20 focus-within:border-indigo-500 shadow-2xs">
                  <span className="inline-flex items-center px-3 bg-slate-100 border-r border-slate-200 text-xs font-bold text-indigo-900 select-none">
                    IND
                  </span>
                  <input
                    type="text"
                    required
                    placeholder="e.g. DL01 EF 4321"
                    value={newVehicle.vehicleNo}
                    onChange={(e) =>
                      setNewVehicle({ ...newVehicle, vehicleNo: e.target.value.toUpperCase() })
                    }
                    className="w-full px-3 py-2.5 text-sm font-bold uppercase text-slate-900 font-mono outline-none"
                  />
                </div>
              </div>

              {/* Row 1: Vehicle Type & Purpose (Custom Select with High Z-Index) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <CustomSelect
                  label="Vehicle Type"
                  value={newVehicle.type}
                  onChange={(val) => setNewVehicle({ ...newVehicle, type: val })}
                  options={VEHICLE_TYPE_OPTIONS}
                  zIndexClass="z-30"
                />

                <CustomSelect
                  label="Purpose"
                  value={newVehicle.purpose}
                  onChange={(val) => setNewVehicle({ ...newVehicle, purpose: val })}
                  options={PURPOSE_OPTIONS}
                  zIndexClass="z-30"
                />
              </div>

              {/* Row 2: Driver Name & Contact */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    Driver Full Name <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Enter driver name"
                    value={newVehicle.driverName}
                    onChange={(e) => setNewVehicle({ ...newVehicle, driverName: e.target.value })}
                    className="w-full bg-white border border-slate-300 rounded-xl px-3.5 py-2.5 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    Driver Phone Contact
                  </label>
                  <input
                    type="tel"
                    placeholder="e.g. 98765 43210"
                    value={newVehicle.driverPhone}
                    onChange={(e) => setNewVehicle({ ...newVehicle, driverPhone: e.target.value })}
                    className="w-full bg-white border border-slate-300 rounded-xl px-3.5 py-2.5 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                  />
                </div>
              </div>

              {/* Row 3: Supplier & Assigned Bay (Custom Select for Bay) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    Supplier / Transporter Party
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Bharat Supply, Prime Foods"
                    value={newVehicle.supplier}
                    onChange={(e) => setNewVehicle({ ...newVehicle, supplier: e.target.value })}
                    className="w-full bg-white border border-slate-300 rounded-xl px-3.5 py-2.5 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                  />
                </div>

                <CustomSelect
                  label="Assigned Bay / Dock"
                  value={newVehicle.bay}
                  onChange={(val) => setNewVehicle({ ...newVehicle, bay: val })}
                  options={BAY_OPTIONS}
                  zIndexClass="z-10"
                />
              </div>

              {/* Submit Buttons */}
              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2.5 border border-slate-300 rounded-xl text-slate-700 hover:bg-slate-50 font-bold cursor-pointer transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 rounded-xl font-bold shadow-xs cursor-pointer transition"
                >
                  Add Vehicle to Queue
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
