import { useState, useMemo, useRef, useEffect, useCallback } from 'react'
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
  RefreshCw,
  Loader2,
} from 'lucide-react'
import DataLoader from '../components/common/DataLoader'
import {
  fetchGateEntries,
  createGateEntry,
  updateGateEntryStatus,
  fetchGatePasses,
  updateGatePassStatus,
  fetchShades,
} from '../services/api'

// Options for Add Vehicle Modal Dropdowns
const VEHICLE_TYPE_OPTIONS = [
  { value: 'Heavy Commercial Truck', label: 'Heavy Commercial Truck (10 Wheeler)' },
  { value: 'Standard Truck (6 Wheeler)', label: 'Standard Truck (6 Wheeler)' },
  { value: 'Covered Container', label: 'Covered Container' },
  { value: 'Light Cargo Vehicle (LCV)', label: 'Light Cargo Vehicle (LCV)' },
]

const PURPOSE_OPTIONS = [
  { value: 'Goods Delivery (GRN Inward)', label: 'Material Inward (GRN Inward)' },
  { value: 'Dispatch', label: 'Dispatch (Outward Delivery)' },
]

const DEFAULT_BAY_OPTIONS = [
  { value: 'Bay 1 (Shade 1: Grains & Bulk Pulses - SH-01)', label: 'Bay 1 (Shade 1: Grains & Bulk Pulses - SH-01)' },
  { value: 'Bay 2 (Shade 2: Edible Oils & Liquids - SH-02)', label: 'Bay 2 (Shade 2: Edible Oils & Liquids - SH-02)' },
  { value: 'Bay 3 (Shade 3: FMCG & Packaged Foods - SH-03)', label: 'Bay 3 (Shade 3: FMCG & Packaged Foods - SH-03)' },
  { value: 'Bay 4 (Shade 4: Packaging & Materials - SH-04)', label: 'Bay 4 (Shade 4: Packaging & Materials - SH-04)' },
  { value: 'Bay 5 (Shade 5: Chemicals & Hygiene - SH-05)', label: 'Bay 5 (Shade 5: Chemicals & Hygiene - SH-05)' },
  { value: 'Bay 6 (Shade 6: Spares & General Hardware - SH-06)', label: 'Bay 6 (Shade 6: Spares & General Hardware - SH-06)' },
  { value: 'Dock 1 (Dispatch Outward)', label: 'Dock 1 (Dispatch Outward)' },
  { value: 'Dock 2 (Dispatch Outward)', label: 'Dock 2 (Dispatch Outward)' },
]

// Pure React Custom Select to eliminate OS native dropdown flicker
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

// Helpers for wait time calculation
function getWaitInfo(inTime) {
  if (!inTime) return { waitText: 'Just Arrived', waitMins: 0, isDelayed: false }
  const diffMs = Math.max(0, Date.now() - new Date(inTime).getTime())
  const diffMins = Math.floor(diffMs / (1000 * 60))
  let waitText = 'Just Arrived'
  if (diffMins >= 60) {
    const hours = Math.floor(diffMins / 60)
    const mins = diffMins % 60
    waitText = `${hours}h ${mins}m`
  } else if (diffMins >= 1) {
    waitText = `${diffMins}m`
  }
  return { waitText, waitMins: diffMins, isDelayed: diffMins >= 60 }
}

function isIncomingPurpose(purpose) {
  const p = (purpose || '').toLowerCase()
  return p.includes('inward') || p.includes('goods delivery') || p.includes('receiving') || p.includes('grn')
}

function isOutgoingPurpose(purpose) {
  const p = (purpose || '').toLowerCase()
  return (
    p.includes('dispatch') ||
    p.includes('outward') ||
    p.includes('customer') ||
    (p.includes('delivery') && !p.includes('inward') && !p.includes('grn'))
  )
}

export default function VehicleQueue() {
  const [activeTab, setActiveTab] = useState('all') // 'all', 'in-queue', 'processing', 'delayed', 'incoming', 'outgoing'
  const [searchQuery, setSearchQuery] = useState('')
  const [showAddModal, setShowAddModal] = useState(false)
  const [openActionMenuId, setOpenActionMenuId] = useState(null)
  const [toastMessage, setToastMessage] = useState(null)
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [bayOptions, setBayOptions] = useState(DEFAULT_BAY_OPTIONS)

  // Real-time Queue Data from MongoDB Gate Entries & Passes
  const [vehicles, setVehicles] = useState([])

  // New Vehicle Form State
  const [newVehicle, setNewVehicle] = useState({
    vehicleNo: '',
    type: 'Heavy Commercial Truck',
    driverName: '',
    driverPhone: '',
    supplier: '',
    challanNo: '',
    purpose: 'Goods Delivery (GRN Inward)',
    bay: 'Bay 1 (Shade 1: Grains & Bulk Pulses - SH-01)',
  })

  // Toast trigger
  const triggerToast = (msg) => {
    setToastMessage(msg)
    setTimeout(() => setToastMessage(null), 4000)
  }

  // Load backend shades for bay options
  useEffect(() => {
    fetchShades()
      .then((data) => {
        if (Array.isArray(data) && data.length > 0) {
          const dynamicBays = data.map((s, idx) => ({
            value: `Bay ${idx + 1} (${s.name} - ${s.code})`,
            label: `Bay ${idx + 1} (${s.name} - ${s.code})`,
          }))
          dynamicBays.push({ value: 'Dock 1 (Dispatch Outward)', label: 'Dock 1 (Dispatch Outward)' })
          dynamicBays.push({ value: 'Dock 2 (Dispatch Outward)', label: 'Dock 2 (Dispatch Outward)' })
          setBayOptions(dynamicBays)
        }
      })
      .catch(() => {})
  }, [])

  // Load and sync real-time queue data from MongoDB
  const loadQueueData = useCallback(async (silent = false) => {
    if (!silent) setRefreshing(true)
    try {
      const [gateRes, passRes] = await Promise.allSettled([
        fetchGateEntries(),
        fetchGatePasses(),
      ])

      const combined = []
      const registeredVehicles = new Set()

      // 1. Process Gate Entries (Primary gate security registry)
      if (gateRes.status === 'fulfilled' && Array.isArray(gateRes.value)) {
        gateRes.value.forEach((g) => {
          const isCleared = g.status === 'Gate Out / Cleared' || g.status === 'Completed'
          const wait = getWaitInfo(g.inTime || g.createdAt)

          let displayStatus = 'In Queue'
          if (isCleared) {
            displayStatus = 'Completed'
          } else if (g.status === 'Unloading at Bay' || g.status === 'GRN In Process' || g.status === 'Processing') {
            displayStatus = 'Processing'
          } else if (g.status === 'Delayed' || wait.isDelayed) {
            displayStatus = 'Delayed'
          } else {
            displayStatus = 'In Queue'
          }

          const vehUpper = (g.vehicleNumber || '').trim().toUpperCase()
          if (!isCleared) registeredVehicles.add(vehUpper)

          combined.push({
            id: g._id,
            rawId: g._id,
            source: 'gate-entry',
            tokenNo: g.passNumber || `GE-${g._id.slice(-4).toUpperCase()}`,
            vehicleNo: vehUpper || 'UNKNOWN',
            type: g.vehicleType || 'Heavy Commercial Truck',
            driverName: g.driverName || 'Driver',
            driverPhone: g.driverContact || '—',
            supplier: g.supplier || 'Direct Consignment',
            purpose: g.purpose || 'Goods Delivery (GRN Inward)',
            bay: g.assignedBay || 'Bay 1 (SH-01)',
            inTime: g.inTime || g.createdAt,
            arrivedAt: g.inTime
              ? new Date(g.inTime).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true })
              : '—',
            waitingTime: wait.waitText,
            waitMins: wait.waitMins,
            isDelayed: wait.isDelayed,
            isInside: !isCleared,
            isIncoming: isIncomingPurpose(g.purpose),
            isOutgoing: isOutgoingPurpose(g.purpose),
            status: displayStatus,
          })
        })
      }

      // 2. Process Active Outward Gate Passes (if not already represented in gate entries)
      if (passRes.status === 'fulfilled' && Array.isArray(passRes.value)) {
        passRes.value.forEach((gp) => {
          const vehUpper = (gp.vehicleNo || '').trim().toUpperCase()
          const isDeparted = gp.status === 'Departed' || gp.status === 'Gate Out / Cleared'
          if (!isDeparted && !registeredVehicles.has(vehUpper)) {
            const wait = getWaitInfo(gp.dateTime || gp.createdAt)
            let displayStatus = 'Processing'
            if (gp.status === 'Pending') displayStatus = 'In Queue'
            else if (gp.status === 'Approved') displayStatus = 'Processing'
            else if (wait.isDelayed) displayStatus = 'Delayed'

            combined.push({
              id: gp._id,
              rawId: gp._id,
              source: 'gate-pass',
              tokenNo: gp.passNo || `GP-${gp._id.slice(-4).toUpperCase()}`,
              vehicleNo: vehUpper,
              type: gp.vehicleType || 'Heavy Commercial Truck',
              driverName: gp.driverName || 'Driver',
              driverPhone: gp.driverContact || gp.driverLicense || '—',
              supplier: gp.receiverName || 'Direct Consignee',
              purpose: 'Dispatch',
              bay: gp.location || (gp.shadeId ? `Dock 1 (${gp.shadeId})` : 'Dock 1 (Dispatch Outward)'),
              inTime: gp.dateTime || gp.createdAt,
              arrivedAt: gp.dateTime
                ? new Date(gp.dateTime).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true })
                : '—',
              waitingTime: wait.waitText,
              waitMins: wait.waitMins,
              isDelayed: wait.isDelayed,
              isInside: true,
              isIncoming: false,
              isOutgoing: true,
              status: displayStatus,
            })
          }
        })
      }

      setVehicles(combined)
    } catch {
      triggerToast('Unable to refresh vehicle queue data from server')
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }, [])

  // Auto-refresh interval (15 seconds) & window focus
  useEffect(() => {
    loadQueueData(false)
    const interval = setInterval(() => {
      loadQueueData(true)
    }, 15000)

    const handleFocus = () => loadQueueData(true)
    window.addEventListener('focus', handleFocus)

    return () => {
      clearInterval(interval)
      window.removeEventListener('focus', handleFocus)
    }
  }, [loadQueueData])

  // Filtered vehicles calculated from active vehicles currently in-site
  const activeInsideVehicles = useMemo(() => {
    return vehicles.filter((v) => v.isInside)
  }, [vehicles])

  const filteredVehicles = useMemo(() => {
    return activeInsideVehicles.filter((item) => {
      // Tab filter
      if (activeTab === 'in-queue' && item.status !== 'In Queue') return false
      if (activeTab === 'processing' && item.status !== 'Processing') return false
      if (activeTab === 'delayed' && item.status !== 'Delayed' && !item.isDelayed) return false
      if (activeTab === 'incoming' && !item.isIncoming) return false
      if (activeTab === 'outgoing' && !item.isOutgoing) return false

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
  }, [activeInsideVehicles, activeTab, searchQuery])

  // Add Vehicle handler (Persists to MongoDB GateEntry)
  const handleAddVehicle = async (e) => {
    e.preventDefault()
    if (!newVehicle.vehicleNo.trim() || !newVehicle.driverName.trim()) {
      triggerToast('Vehicle Number and Driver Name are required!')
      return
    }

    const cleanPhone = (newVehicle.driverPhone || '').replace(/\D/g, '')
    if (cleanPhone.length > 0 && cleanPhone.length !== 10) {
      triggerToast('Driver phone number must be exactly 10 digits!')
      return
    }

    const payload = {
      vehicleNumber: newVehicle.vehicleNo.trim().toUpperCase(),
      vehicleType: newVehicle.type,
      driverName: newVehicle.driverName.trim(),
      driverContact: cleanPhone || '9876543210',
      supplier: newVehicle.supplier.trim() || 'Direct Consignment',
      challanNo: newVehicle.challanNo.trim() || `CH-Q-${Date.now().toString().slice(-6)}`,
      poNumber: `PO-${Date.now().toString().slice(-6)}`,
      purpose: newVehicle.purpose,
      assignedBay: newVehicle.bay,
      status: 'Waiting at Gate',
      remarks: 'Added directly via Vehicle Queue Terminal',
      officerRemark: 'Terminal Queue Check-in',
      materialItems: [],
    }

    try {
      const created = await createGateEntry(payload)
      setShowAddModal(false)
      setNewVehicle({
        vehicleNo: '',
        type: 'Heavy Commercial Truck',
        driverName: '',
        driverPhone: '',
        supplier: '',
        challanNo: '',
        purpose: 'Goods Delivery (GRN Inward)',
        bay: 'Bay 1 (Shade 1: Grains & Bulk Pulses - SH-01)',
      })
      triggerToast(`Vehicle ${created.vehicleNumber} checked in with Pass/Token ${created.passNumber}!`)
      loadQueueData(false)
    } catch (err) {
      triggerToast(err.message || 'Failed to add vehicle to queue')
    }
  }

  // Action status update (Saves to MongoDB)
  const handleStatusUpdate = async (item, newStatus) => {
    try {
      if (item.source === 'gate-entry') {
        let dbStatus = 'Waiting at Gate'
        if (newStatus === 'Processing') dbStatus = 'Unloading at Bay'
        else if (newStatus === 'Completed') dbStatus = 'Gate Out / Cleared'
        else if (newStatus === 'Delayed') dbStatus = 'Delayed'
        else dbStatus = 'Waiting at Gate'

        await updateGateEntryStatus(item.rawId, { status: dbStatus })
      } else if (item.source === 'gate-pass') {
        let dbPassStatus = 'Pending'
        if (newStatus === 'Processing') dbPassStatus = 'Approved'
        else if (newStatus === 'Completed') dbPassStatus = 'Gate Out / Cleared'
        else dbPassStatus = 'Pending'

        await updateGatePassStatus(item.rawId, dbPassStatus, 'Status updated from Vehicle Queue')
      }

      setOpenActionMenuId(null)
      triggerToast(`Vehicle ${item.vehicleNo} marked as ${newStatus}`)
      loadQueueData(true)
    } catch (err) {
      triggerToast(err.message || 'Failed to update vehicle status')
    }
  }

  // Voice announcement helper
  const announceVehicle = (vehicleNo, tokenNo, bay) => {
    const textMsg = `📢 Calling Vehicle ${vehicleNo} (${tokenNo}) to ${bay}!`
    triggerToast(textMsg)

    if ('speechSynthesis' in window) {
      try {
        window.speechSynthesis.cancel()
        const voiceText = `Attention please. Vehicle ${vehicleNo}, Token ${tokenNo}, please proceed immediately to ${bay.split('(')[0]}.`
        const utterance = new SpeechSynthesisUtterance(voiceText)
        utterance.rate = 0.95
        utterance.pitch = 1.0
        window.speechSynthesis.speak(utterance)
      } catch {
        // Fallback gracefully to visual toast
      }
    }
  }

  // Call Next Vehicle in line
  const handleCallNext = () => {
    const nextVeh = activeInsideVehicles.find((v) => v.status === 'In Queue')
    if (nextVeh) {
      announceVehicle(nextVeh.vehicleNo, nextVeh.tokenNo, nextVeh.bay)
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
    const rows = activeInsideVehicles.map((v) => [
      v.tokenNo,
      v.vehicleNo,
      v.type,
      `"${v.driverName}"`,
      v.driverPhone,
      `"${v.supplier}"`,
      `"${v.purpose}"`,
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
    triggerToast('Active vehicle queue exported to CSV successfully.')
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
    if (time.includes('h')) {
      return 'text-rose-600 font-bold'
    }
    if (time.includes('3') || time.includes('4') || time.includes('5')) {
      return 'text-amber-700 font-semibold'
    }
    return 'text-emerald-700 font-semibold'
  }

  return (
    <div className="space-y-6 max-w-[1720px] mx-auto pb-10 select-none">
      {/* Toast Alert */}
      {toastMessage && (
        <div className="fixed top-5 right-5 z-[9999] pointer-events-auto bg-slate-900 text-white px-4 py-3 rounded-xl shadow-2xl border border-slate-700 flex items-center gap-3 animate-fade-in text-sm font-semibold">
          <div className="w-6 h-6 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
            <Check className="w-4 h-4" />
          </div>
          <span>{toastMessage}</span>
        </div>
      )}

      {/* 1. Header Banner */}
      <div className="bg-white rounded-2xl p-4 sm:p-6 border border-slate-200 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-start gap-3 sm:gap-4 min-w-0 flex-1">
          <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-indigo-50 border border-indigo-100 text-indigo-600 flex items-center justify-center shrink-0 shadow-xs mt-0.5">
            <Truck className="w-5 h-5 sm:w-6 sm:h-6" />
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2 mb-1">
              <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 shrink-0 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                Live Terminal Queue Active
              </span>
              {refreshing && (
                <span className="text-xs font-medium text-slate-400 flex items-center gap-1">
                  <RefreshCw className="w-3 h-3 animate-spin" /> Syncing...
                </span>
              )}
            </div>
            <h1 className="text-lg sm:text-xl lg:text-2xl font-bold text-slate-900 leading-tight">
              Vehicle Queue Management
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 font-medium mt-1 leading-relaxed">
              Real-time monitoring of vehicles inside warehouse premises, token queue, dock bays, and gate turnaround
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2.5 w-full sm:w-auto shrink-0">
          <button
            type="button"
            onClick={handleCallNext}
            className="flex-1 sm:flex-none justify-center px-4 py-2.5 rounded-xl border border-indigo-200 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-xs sm:text-sm font-bold flex items-center gap-2 transition cursor-pointer shadow-2xs"
          >
            <Megaphone className="w-4 h-4 text-indigo-600 shrink-0" />
            <span>Call Next Vehicle</span>
          </button>

          <button
            type="button"
            onClick={() => loadQueueData(false)}
            className="p-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 transition cursor-pointer shadow-2xs"
            title="Refresh Queue"
          >
            <RefreshCw className={`w-4 h-4 text-slate-600 ${refreshing ? 'animate-spin' : ''}`} />
          </button>

          <button
            type="button"
            onClick={handleExport}
            className="flex-1 sm:flex-none justify-center px-4 py-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs sm:text-sm font-bold flex items-center gap-2 transition cursor-pointer shadow-2xs"
          >
            <Download className="w-4 h-4 text-slate-500 shrink-0" />
            <span>Export CSV</span>
          </button>

          <button
            type="button"
            onClick={() => setShowAddModal(true)}
            className="flex-1 sm:flex-none justify-center px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white text-xs sm:text-sm font-bold flex items-center gap-2 transition cursor-pointer shadow-xs"
          >
            <Plus className="w-4 h-4 shrink-0" />
            <span>Add to Queue</span>
          </button>
        </div>
      </div>

      {/* 2. Dynamic KPI Stat Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3.5">
        {/* Card 1: Total Active in Terminal */}
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
              In-Site
            </span>
          </div>
          <div>
            <div className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight leading-none">
              {activeInsideVehicles.length}
            </div>
            <div className="text-xs font-bold text-slate-800 mt-2 truncate">
              Total Active
            </div>
            <div className="text-[11px] text-slate-400 font-medium mt-0.5 truncate">
              Vehicles Inside Premises
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
              {activeInsideVehicles.filter((v) => v.status === 'In Queue').length}
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
              {activeInsideVehicles.filter((v) => v.status === 'Processing').length}
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
              {activeInsideVehicles.filter((v) => v.isIncoming).length}
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
              {activeInsideVehicles.filter((v) => v.status === 'Delayed' || v.isDelayed).length}
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
      <div className="bg-white rounded-2xl p-3 border border-slate-200 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3">
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
            All Active ({activeInsideVehicles.length})
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
            In Queue ({activeInsideVehicles.filter((v) => v.status === 'In Queue').length})
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
            Processing ({activeInsideVehicles.filter((v) => v.status === 'Processing').length})
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
            Delayed ({activeInsideVehicles.filter((v) => v.status === 'Delayed' || v.isDelayed).length})
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
            Inward Deliveries ({activeInsideVehicles.filter((v) => v.isIncoming).length})
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
            Dispatch Outward ({activeInsideVehicles.filter((v) => v.isOutgoing).length})
          </button>
        </div>

        {/* Live Search */}
        <div className="relative flex-1 sm:max-w-xs">
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
      <div className="bg-white rounded-2xl p-4 sm:p-6 border border-slate-200 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 sm:gap-3 border-b border-slate-100 pb-3">
          <div className="min-w-0">
            <h3 className="text-sm sm:text-base font-bold text-slate-900 flex flex-wrap items-center gap-2">
              <span>Active Vehicles &amp; Dock Turnaround Ledger</span>
              <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 shrink-0">
                {filteredVehicles.length} of {activeInsideVehicles.length} Active
              </span>
            </h3>
            <p className="text-xs text-slate-500 mt-0.5 leading-relaxed">
              Real-time sequence of registered vehicles currently inside warehouse terminal
            </p>
          </div>

          <div className="flex items-center gap-2">
            <div className="text-xs font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 px-3 py-1.5 rounded-lg shrink-0 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              Auto-sync active (15s)
            </div>
          </div>
        </div>

        {loading ? (
          <DataLoader
            text="Loading Live Vehicle Logistics & Dock Queue..."
            subtext="Syncing active gate entries and bay allocations..."
            size="md"
          />
        ) : (
          <div className="overflow-x-auto rounded-xl border border-slate-200">
            <table className="w-full text-left text-sm min-w-[1050px]">
              <thead>
                <tr className="bg-slate-50/80 border-b border-slate-200 text-slate-600 text-xs uppercase tracking-wider font-bold">
                  <th className="py-3.5 px-3 w-10 text-center">#</th>
                  <th className="py-3.5 px-4 w-28">Token / Pass</th>
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
                    <td colSpan="11" className="py-12 text-center text-slate-400 text-sm">
                      <div className="flex flex-col items-center justify-center gap-2">
                        <Truck className="w-10 h-10 text-slate-300 stroke-1" />
                        <span className="font-semibold text-slate-600">No active vehicles currently inside matching criteria.</span>
                        <span className="text-xs text-slate-400">
                          Vehicles registered at Security Gate Entry will automatically appear here.
                        </span>
                      </div>
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
                            row.isIncoming
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
                      <td className="py-3.5 px-4 text-xs text-slate-600 whitespace-nowrap font-medium">
                        {row.arrivedAt}
                      </td>
                      <td className="py-3.5 px-4 text-xs whitespace-nowrap">
                        <span className={getWaitingTimeClass(row.waitingTime)}>
                          {row.waitingTime}
                        </span>
                        {row.isDelayed && (
                          <span className="ml-1 text-[10px] bg-rose-100 text-rose-700 px-1 py-0.2 rounded font-bold">
                            &gt;1h
                          </span>
                        )}
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
                            onClick={() => announceVehicle(row.vehicleNo, row.tokenNo, row.bay)}
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
                          <div className="absolute right-5 top-12 w-52 bg-white border border-slate-200 rounded-xl shadow-xl z-20 py-1 text-left text-xs font-medium animate-scale-in">
                            <button
                              type="button"
                              onClick={() => handleStatusUpdate(row, 'In Queue')}
                              className="w-full px-3 py-2 hover:bg-amber-50 text-amber-800 flex items-center gap-2 cursor-pointer font-medium"
                            >
                              <Clock className="w-3.5 h-3.5 text-amber-600" />
                              <span>Mark In Queue</span>
                            </button>
                            <button
                              type="button"
                              onClick={() => handleStatusUpdate(row, 'Processing')}
                              className="w-full px-3 py-2 hover:bg-blue-50 text-blue-700 flex items-center gap-2 cursor-pointer font-medium"
                            >
                              <Zap className="w-3.5 h-3.5 text-blue-600" />
                              <span>Mark Processing (Bay)</span>
                            </button>
                            <button
                              type="button"
                              onClick={() => handleStatusUpdate(row, 'Delayed')}
                              className="w-full px-3 py-2 hover:bg-rose-50 text-rose-700 flex items-center gap-2 cursor-pointer font-medium"
                            >
                              <AlertTriangle className="w-3.5 h-3.5 text-rose-600" />
                              <span>Mark Delayed</span>
                            </button>
                            <div className="my-1 border-t border-slate-100"></div>
                            <button
                              type="button"
                              onClick={() => handleStatusUpdate(row, 'Completed')}
                              className="w-full px-3 py-2 hover:bg-emerald-50 text-emerald-700 flex items-center gap-2 cursor-pointer font-semibold"
                            >
                              <Check className="w-3.5 h-3.5 text-emerald-600" />
                              <span>Mark Completed (Gate Out)</span>
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
        )}
      </div>

      {/* ========================================================= */}
      {/* ADD VEHICLE TO QUEUE MODAL (SAVES TO MONGODB) */}
      {/* ========================================================= */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 animate-fade-in">
          <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full max-h-[90dvh] overflow-y-auto p-4 sm:p-6 space-y-5 animate-scale-in border border-slate-200">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b pb-4 border-slate-100">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-indigo-50 border border-indigo-100 text-indigo-600 flex items-center justify-center font-bold">
                  <Truck className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">Add Vehicle to Terminal Queue</h3>
                  <p className="text-xs text-slate-500">Check in vehicle to database and assign unloading bay</p>
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
                    placeholder="e.g. DL 01 EF 4321"
                    value={newVehicle.vehicleNo}
                    onChange={(e) =>
                      setNewVehicle({ ...newVehicle, vehicleNo: e.target.value.toUpperCase() })
                    }
                    className="w-full px-3 py-2.5 text-sm font-bold uppercase text-slate-900 font-mono outline-none"
                  />
                </div>
              </div>

              {/* Row 1: Vehicle Type & Purpose */}
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
                    Driver Phone Contact (10 Digits) <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="tel"
                    required
                    maxLength={10}
                    placeholder="e.g. 9876543210"
                    value={newVehicle.driverPhone}
                    onChange={(e) =>
                      setNewVehicle({ ...newVehicle, driverPhone: e.target.value.replace(/\D/g, '') })
                    }
                    className="w-full bg-white border border-slate-300 rounded-xl px-3.5 py-2.5 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 font-mono"
                  />
                </div>
              </div>

              {/* Row 3: Supplier & Challan Ref */}
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

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    Challan / PO Ref No.
                  </label>
                  <input
                    type="text"
                    placeholder="Auto-generated if blank"
                    value={newVehicle.challanNo}
                    onChange={(e) => setNewVehicle({ ...newVehicle, challanNo: e.target.value.toUpperCase() })}
                    className="w-full bg-white border border-slate-300 rounded-xl px-3.5 py-2.5 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 font-mono uppercase"
                  />
                </div>
              </div>

              {/* Row 4: Assigned Bay */}
              <div>
                <CustomSelect
                  label="Assigned Bay / Dock"
                  value={newVehicle.bay}
                  onChange={(val) => setNewVehicle({ ...newVehicle, bay: val })}
                  options={bayOptions}
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
                  Check-in Vehicle
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
