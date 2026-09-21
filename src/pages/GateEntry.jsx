import { useState, useMemo } from 'react'
import { Link } from 'react-router-dom'
import {
  Truck,
  FileText,
  ClipboardList,
  Calendar,
  Package,
  Trash2,
  Check,
  Printer,
  ChevronDown,
  X,
  Search,
  ArrowRight,
  QrCode,
  LogOut,
  Clock,
  Plus,
  Warehouse,
} from 'lucide-react'

export default function GateEntry() {
  const [activeTab, setActiveTab] = useState('new') // 'new' | 'queue' | 'log'
  const [toastMessage, setToastMessage] = useState(null)

  const triggerToast = (msg) => {
    setToastMessage(msg)
    setTimeout(() => setToastMessage(null), 3500)
  }

  // --- Form State (Streamlined & Simple for Gate Operator) ---
  const [vehicleNumber, setVehicleNumber] = useState('')
  const [vehicleType, setVehicleType] = useState('Heavy Commercial Truck')
  const [driverName, setDriverName] = useState('')
  const [driverContact, setDriverContact] = useState('')
  const [supplier, setSupplier] = useState('')
  const [challanNo, setChallanNo] = useState('')
  const [purpose, setPurpose] = useState('Goods Delivery (GRN Inward)')
  const [assignedBay, setAssignedBay] = useState('Bay 2 (Dry Ration / Food - Shade 2)')
  const [inTime, setInTime] = useState('18 Sep 2026, 10:30 AM')
  const [remarks, setRemarks] = useState('')

  // Declared Packaging / Material Items (e.g. 100 Gatta Biscuit)
  const [materialItems, setMaterialItems] = useState([
    {
      id: 1,
      product: 'Standard Biscuit Packs (Glucose 100g)',
      packageQty: 100,
      packagingUnit: 'Gatta (Carton)',
      baseUnitEstimate: '600 Packs (6 pcs/gatta)',
      remarks: 'Primary shipment for Shade 2',
    },
  ])

  // --- Modal State for Viewing / Printing Gate Pass ---
  const [activePassModal, setActivePassModal] = useState(null)

  // --- Active Vehicles Inside Warehouse Queue ---
  const [activeVehicles, setActiveVehicles] = useState([
    {
      id: 'GE-2026-0041',
      vehicleNo: 'UP32 AB 1256',
      vehicleType: 'Heavy Commercial Truck',
      driver: 'Sukhwinder Singh',
      phone: '98112-34501',
      supplier: 'M/s Bharat Supply Corp',
      challanNo: 'CH-9912',
      itemsSummary: '100 Gatta (Biscuits)',
      inTime: '18 Sep 2026, 09:12 AM',
      bay: 'Bay 2 (Food & Grains - Shade 2)',
      status: 'Unloading at Bay',
    },
    {
      id: 'GE-2026-0042',
      vehicleNo: 'HR55 CD 7890',
      vehicleType: 'Covered Container',
      driver: 'Manoj Yadav',
      phone: '94120-78123',
      supplier: 'M/s Prime Foods Ltd',
      challanNo: 'PO-2026-4587',
      itemsSummary: '200 Bags (Basmati Rice)',
      inTime: '18 Sep 2026, 09:45 AM',
      bay: 'Bay 1 (General Stores - Shade 1)',
      status: 'GRN In Process',
    },
    {
      id: 'GE-2026-0043',
      vehicleNo: 'DL01 EF 4321',
      vehicleType: 'Light Cargo Vehicle (LCV)',
      driver: 'Abdul Kalam',
      phone: '99201-44589',
      supplier: 'M/s Apex Manufacturing Ltd',
      challanNo: 'ORD-5521',
      itemsSummary: '50 Boxes (Hardware & Tools)',
      inTime: '18 Sep 2026, 10:15 AM',
      bay: 'Bay 3 (Industrial Supplies - Shade 3)',
      status: 'Waiting at Gate',
    },
  ])

  // --- Historical Gate Entries Log ---
  const [gateLog, setGateLog] = useState([
    {
      id: 'GE-2026-0041',
      vehicleNo: 'UP32 AB 1256',
      vehicleType: 'Heavy Commercial Truck',
      driver: 'Sukhwinder Singh',
      phone: '98112-34501',
      supplier: 'M/s Bharat Supply Corp',
      challanNo: 'CH-9912',
      itemsSummary: '100 Gatta (Biscuits)',
      inTime: '18 Sep 2026, 09:12 AM',
      outTime: '-',
      type: 'Inward',
      status: 'Inside Warehouse',
      bay: 'Bay 2',
    },
    {
      id: 'GE-2026-0042',
      vehicleNo: 'HR55 CD 7890',
      vehicleType: 'Covered Container',
      driver: 'Manoj Yadav',
      phone: '94120-78123',
      supplier: 'M/s Prime Foods Ltd',
      challanNo: 'PO-2026-4587',
      itemsSummary: '200 Bags (Basmati Rice)',
      inTime: '18 Sep 2026, 09:45 AM',
      outTime: '-',
      type: 'Inward',
      status: 'Inside Warehouse',
      bay: 'Bay 1',
    },
    {
      id: 'GE-2026-0043',
      vehicleNo: 'DL01 EF 4321',
      vehicleType: 'Light Cargo Vehicle (LCV)',
      driver: 'Abdul Kalam',
      phone: '99201-44589',
      supplier: 'M/s Apex Manufacturing Ltd',
      challanNo: 'ORD-5521',
      itemsSummary: '50 Boxes (Hardware & Tools)',
      inTime: '18 Sep 2026, 10:15 AM',
      outTime: '-',
      type: 'Inward',
      status: 'Inside Warehouse',
      bay: 'Bay 3',
    },
    {
      id: 'GE-2026-0040',
      vehicleNo: 'UP78 GH 9987',
      vehicleType: 'Heavy Commercial Truck',
      driver: 'Ram Kumar',
      phone: '98711-22334',
      supplier: 'M/s Metro Supplies Corp',
      challanNo: 'CH-9844',
      itemsSummary: '150 Tins (Cooking Oil)',
      inTime: '18 Sep 2026, 07:30 AM',
      outTime: '18 Sep 2026, 09:05 AM',
      type: 'Outward',
      status: 'Gate Out / Cleared',
      bay: 'Bay 4',
    },
    {
      id: 'GE-2026-0039',
      vehicleNo: 'RJ14 JK 6543',
      vehicleType: 'Trailor (Multi-Axle)',
      driver: 'Kishan Singh',
      phone: '91234-56780',
      supplier: 'M/s National Logistics',
      challanNo: 'PO-2026-1189',
      itemsSummary: '400 Bags (Sugar Refined)',
      inTime: '17 Sep 2026, 16:20 PM',
      outTime: '17 Sep 2026, 18:40 PM',
      type: 'Outward',
      status: 'Gate Out / Cleared',
      bay: 'Bay 1',
    },
  ])

  // Search & Filter in Log Tab
  const [logSearch, setLogSearch] = useState('')
  const [logStatusFilter, setLogStatusFilter] = useState('All')

  const filteredGateLog = useMemo(() => {
    return gateLog.filter((item) => {
      if (logStatusFilter === 'Inside' && item.status !== 'Inside Warehouse') return false
      if (logStatusFilter === 'Cleared' && item.status !== 'Gate Out / Cleared') return false

      if (logSearch.trim()) {
        const q = logSearch.toLowerCase()
        return (
          item.id.toLowerCase().includes(q) ||
          item.vehicleNo.toLowerCase().includes(q) ||
          item.driver.toLowerCase().includes(q) ||
          item.supplier.toLowerCase().includes(q) ||
          item.challanNo.toLowerCase().includes(q)
        )
      }
      return true
    })
  }, [gateLog, logSearch, logStatusFilter])

  // --- Dynamic Item Handlers ---
  const handleAddItem = () => {
    setMaterialItems((prev) => [
      ...prev,
      {
        id: Date.now(),
        product: '',
        packageQty: '',
        packagingUnit: 'Gatta (Carton)',
        baseUnitEstimate: '',
        remarks: '',
      },
    ])
  }

  const handleRemoveItem = (id) => {
    if (materialItems.length === 1) return
    setMaterialItems((prev) => prev.filter((item) => item.id !== id))
  }

  const handleItemChange = (id, field, val) => {
    setMaterialItems((prev) =>
      prev.map((item) => {
        if (item.id !== id) return item
        const updated = { ...item, [field]: val }

        // Helper: auto-calculate base unit estimate for common packaging units
        if (field === 'packageQty' || field === 'product' || field === 'packagingUnit') {
          const qty = parseInt(field === 'packageQty' ? val : item.packageQty) || 0
          const unit = field === 'packagingUnit' ? val : item.packagingUnit
          const prod = field === 'product' ? val : item.product

          if (unit.includes('Gatta') && prod.includes('Biscuit')) {
            updated.baseUnitEstimate = `${qty * 6} Packs (6 pcs/gatta)`
          } else if (unit.includes('Bags') && prod.includes('Rice')) {
            updated.baseUnitEstimate = `${qty * 50} Kg (50 kg/bag)`
          } else if (unit.includes('Tins') && prod.includes('Oil')) {
            updated.baseUnitEstimate = `${qty * 15} Litres (15 L/tin)`
          } else if (qty > 0) {
            updated.baseUnitEstimate = `${qty} ${unit} (Pending GRN verification)`
          }
        }
        return updated
      })
    )
  }

  // --- Reset Form ---
  const handleReset = () => {
    setVehicleNumber('')
    setVehicleType('Heavy Commercial Truck')
    setDriverName('')
    setDriverContact('')
    setSupplier('')
    setChallanNo('')
    setPurpose('Goods Delivery (GRN Inward)')
    setAssignedBay('Bay 2 (Dry Ration / Food - Shade 2)')
    setRemarks('')
    setMaterialItems([
      {
        id: Date.now(),
        product: 'Standard Biscuit Packs (Glucose 100g)',
        packageQty: 100,
        packagingUnit: 'Gatta (Carton)',
        baseUnitEstimate: '600 Packs (6 pcs/gatta)',
        remarks: '',
      },
    ])
  }

  // --- Form Submit: Register Inward Gate Pass ---
  const handleSubmit = (e) => {
    e.preventDefault()

    if (!vehicleNumber.trim()) {
      triggerToast('Please enter a valid vehicle number.')
      return
    }
    if (!driverName.trim()) {
      triggerToast('Please enter the driver name.')
      return
    }

    const nextTokenNum = 44 + (gateLog.length - 5)
    const newPassNumber = `GE-2026-00${nextTokenNum}`
    const summaryText = materialItems
      .map((m) => `${m.packageQty || 0} ${m.packagingUnit} ${m.product ? `(${m.product.split(' ')[0]})` : ''}`)
      .join(', ')

    const newVehicleRecord = {
      id: newPassNumber,
      vehicleNo: vehicleNumber.toUpperCase().trim(),
      vehicleType,
      driver: driverName.trim(),
      phone: driverContact.trim() || 'N/A',
      supplier: supplier || 'M/s Bharat Logistics',
      challanNo: challanNo.trim() || 'N/A',
      itemsSummary: summaryText || 'General Consignment',
      inTime,
      outTime: '-',
      bay: assignedBay,
      status: 'Unloading at Bay',
      type: 'Inward',
      items: materialItems,
      remarks,
    }

    // Add to Active Bay Queue & Log
    setActiveVehicles([newVehicleRecord, ...activeVehicles])
    setGateLog([
      { ...newVehicleRecord, status: 'Inside Warehouse' },
      ...gateLog,
    ])

    // Open Printable Gate Pass Modal
    setActivePassModal(newVehicleRecord)
    triggerToast(`Gate Entry ${newPassNumber} registered successfully!`)

    // Reset Form for next incoming truck
    handleReset()
  }

  // --- Gate Outward Pass Clearance ---
  const handleGateOut = (vehicleId) => {
    const target = activeVehicles.find((v) => v.id === vehicleId)
    if (!target) return

    const currentTime = '18 Sep 2026, 11:15 AM'

    // Remove from active queue
    setActiveVehicles((prev) => prev.filter((v) => v.id !== vehicleId))

    // Update in gate log
    setGateLog((prev) =>
      prev.map((entry) =>
        entry.id === vehicleId
          ? {
              ...entry,
              status: 'Gate Out / Cleared',
              outTime: currentTime,
            }
          : entry
      )
    )

    triggerToast(`Truck ${target.vehicleNo} cleared for Exit (Gate Out complete).`)
  }

  return (
    <div className="space-y-6 max-w-[1720px] mx-auto pb-10 select-none">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-5 right-5 z-50 bg-slate-900 text-white px-4 py-3 rounded-xl shadow-2xl border border-slate-700 flex items-center gap-3 animate-fade-in text-sm font-semibold">
          <div className="w-6 h-6 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
            <Check className="w-4 h-4" />
          </div>
          <span>{toastMessage}</span>
        </div>
      )}

      {/* 1. Header Hero Banner - Clean & Modern */}
      <div className="bg-white rounded-2xl p-4 sm:p-6 lg:p-7 border border-slate-200 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4 sm:gap-5">
        <div className="flex items-start gap-3 sm:gap-4 min-w-0 flex-1">
          <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-indigo-50 border border-indigo-100 text-indigo-600 flex items-center justify-center shrink-0 shadow-xs mt-0.5">
            <Truck className="w-5 h-5 sm:w-6 sm:h-6" />
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2 mb-1">
              <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 shrink-0">
                ● Gate 01 Operational
              </span>
            </div>
            <h1 className="text-lg sm:text-xl lg:text-2xl font-bold text-slate-900 leading-tight">
              Gate Entry &amp; Vehicle Clearance
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 font-medium mt-1 leading-relaxed">
              Commercial vehicle check-in, driver authentication, unloading bay allocation &amp; gate pass management
            </p>
          </div>
        </div>

        <Link
          to="/goods-receiving"
          className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-slate-50 hover:bg-indigo-600 text-slate-700 hover:text-white border border-slate-200 hover:border-indigo-600 text-sm font-bold transition-all flex items-center justify-center sm:justify-start gap-2 shadow-xs group shrink-0"
        >
          <span>Proceed to GRN Receiving</span>
          <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-white group-hover:translate-x-0.5 transition-all" />
        </Link>
      </div>

      {/* 2. KPI Summary Bar (4 Balanced Stat Cards) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Vehicles Inside</p>
            <p className="text-2xl font-extrabold text-slate-900 mt-1">{activeVehicles.length}</p>
            <p className="text-xs text-emerald-600 font-semibold flex items-center gap-1 mt-1">
              <Clock className="w-3.5 h-3.5" /> Inside Warehouse
            </p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-indigo-50 border border-indigo-100 text-indigo-600 flex items-center justify-center">
            <Warehouse className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Today&apos;s Inward</p>
            <p className="text-2xl font-extrabold text-slate-900 mt-1">{gateLog.length}</p>
            <p className="text-xs text-slate-500 font-medium mt-1">Total Gate Check-Ins</p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-emerald-50 border border-emerald-100 text-emerald-600 flex items-center justify-center">
            <Truck className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">At Unloading Bay</p>
            <p className="text-2xl font-extrabold text-slate-900 mt-1">
              {activeVehicles.filter((v) => v.status.includes('Unloading') || v.status.includes('GRN')).length}
            </p>
            <p className="text-xs text-amber-600 font-semibold mt-1">Unloading &amp; Stacking</p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-amber-50 border border-amber-100 text-amber-600 flex items-center justify-center">
            <Package className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Gate Out Cleared</p>
            <p className="text-2xl font-extrabold text-slate-900 mt-1">
              {gateLog.filter((v) => v.status === 'Gate Out / Cleared').length}
            </p>
            <p className="text-xs text-slate-500 font-medium mt-1">Departed with Outward Slip</p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-slate-100 border border-slate-200 text-slate-600 flex items-center justify-center">
            <LogOut className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* 3. Navigation Tabs Bar */}
      <div className="bg-white rounded-2xl p-3 border border-slate-200 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2 p-1 bg-slate-100 rounded-xl w-fit text-sm font-semibold flex-wrap">
          <button
            type="button"
            onClick={() => setActiveTab('new')}
            className={`px-4 py-2.5 rounded-lg transition-all cursor-pointer flex items-center gap-2 whitespace-nowrap shrink-0 ${
              activeTab === 'new'
                ? 'bg-indigo-600 text-white shadow-xs font-bold'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/70'
            }`}
          >
            <Plus className="w-4 h-4 shrink-0" />
            <span>New Gate Entry (Inward)</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('queue')}
            className={`px-4 py-2.5 rounded-lg transition-all cursor-pointer flex items-center gap-2 whitespace-nowrap shrink-0 ${
              activeTab === 'queue'
                ? 'bg-indigo-600 text-white shadow-xs font-bold'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/70'
            }`}
          >
            <Truck className="w-4 h-4 shrink-0" />
            <span>Vehicles Inside</span>
            <span className={`px-2 py-0.5 rounded-full text-xs font-bold shrink-0 ${
              activeTab === 'queue' ? 'bg-indigo-800 text-white' : 'bg-slate-200 text-slate-800'
            }`}>
              {activeVehicles.length}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('log')}
            className={`px-4 py-2.5 rounded-lg transition-all cursor-pointer flex items-center gap-2 whitespace-nowrap shrink-0 ${
              activeTab === 'log'
                ? 'bg-indigo-600 text-white shadow-xs font-bold'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/70'
            }`}
          >
            <ClipboardList className="w-4 h-4 shrink-0" />
            <span>Daily Gate Register (Log)</span>
          </button>
        </div>

        <div className="flex items-center gap-2 px-2 text-xs font-semibold text-slate-500">
          <span>Inward Station: Terminal 01</span>
        </div>
      </div>

      {/* ========================================================= */}
      {/* TAB 1: NEW GATE ENTRY FORM                                */}
      {/* ========================================================= */}
      {activeTab === 'new' && (
        <form onSubmit={handleSubmit} className="w-full space-y-6">
          {/* Section 1: Vehicle & Driver */}
          <div className="bg-white rounded-2xl p-6 sm:p-7 border border-slate-200 shadow-sm space-y-5">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <h3 className="text-base font-bold text-slate-900 flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600">
                    <Truck className="w-4 h-4" />
                  </div>
                  <span>1. Vehicle &amp; Driver Details</span>
                </h3>
                <div className="flex items-center gap-2 text-xs text-slate-600 bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-200">
                  <Calendar className="w-3.5 h-3.5 text-slate-500" />
                  <span className="font-medium text-slate-500">In-Time:</span>
                  <input
                    type="text"
                    value={inTime}
                    onChange={(e) => setInTime(e.target.value)}
                    className="w-40 bg-transparent font-semibold text-slate-800 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {/* Vehicle Number */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    Vehicle Number <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative flex shadow-2xs rounded-lg overflow-hidden border border-slate-300 focus-within:ring-2 focus-within:ring-indigo-500/20 focus-within:border-indigo-500">
                    <span className="inline-flex items-center px-2.5 bg-slate-100 border-r border-slate-200 text-xs font-bold text-indigo-900 select-none">
                      IND
                    </span>
                    <input
                      type="text"
                      value={vehicleNumber}
                      onChange={(e) => setVehicleNumber(e.target.value.toUpperCase())}
                      placeholder="e.g. RJ14 GA 4589"
                      required
                      className="w-full px-3 py-2 text-sm font-bold uppercase text-slate-900 font-mono outline-none"
                    />
                  </div>
                </div>

                {/* Vehicle Type */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    Vehicle Type <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <select
                      value={vehicleType}
                      onChange={(e) => setVehicleType(e.target.value)}
                      className="w-full pl-3 pr-8 py-2 rounded-lg border border-slate-300 text-sm text-slate-800 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 appearance-none cursor-pointer"
                    >
                      <option value="Heavy Commercial Truck">Heavy Commercial Truck</option>
                      <option value="Covered Container">Covered Container</option>
                      <option value="Light Cargo Vehicle (LCV)">Light Cargo Vehicle (LCV)</option>
                      <option value="Trailor (Multi-Axle)">Trailor (Multi-Axle)</option>
                      <option value="Tanker (Fuel/Liquid)">Tanker (Fuel/Liquid)</option>
                    </select>
                    <ChevronDown className="w-4 h-4 absolute right-2.5 top-3 pointer-events-none text-slate-400" />
                  </div>
                </div>

                {/* Driver Name */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    Driver Full Name <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={driverName}
                    onChange={(e) => setDriverName(e.target.value)}
                    placeholder="Enter driver name"
                    required
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                  />
                </div>

                {/* Driver Contact Phone */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    Driver Phone Contact <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="tel"
                    value={driverContact}
                    onChange={(e) => setDriverContact(e.target.value)}
                    placeholder="e.g. 98765 43210"
                    required
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                  />
                </div>

                {/* Purpose of Entry */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    Purpose of Entry <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <select
                      value={purpose}
                      onChange={(e) => setPurpose(e.target.value)}
                      className="w-full pl-3 pr-8 py-2 rounded-lg border border-slate-300 text-sm text-slate-800 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 appearance-none cursor-pointer"
                    >
                      <option value="Goods Delivery (GRN Inward)">Goods Delivery (GRN Inward)</option>
                      <option value="Quality / Lab Testing Sample">Quality / Lab Sample</option>
                      <option value="Return / Replaced Stock">Return / Replaced Stock</option>
                      <option value="Maintenance / Transfer">Maintenance / Transfer</option>
                    </select>
                    <ChevronDown className="w-4 h-4 absolute right-2.5 top-3 pointer-events-none text-slate-400" />
                  </div>
                </div>

                {/* Unloading Bay Assignment */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    Assign Unloading Bay <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <select
                      value={assignedBay}
                      onChange={(e) => setAssignedBay(e.target.value)}
                      className="w-full pl-3 pr-8 py-2 rounded-lg border border-slate-300 text-sm text-slate-800 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 appearance-none cursor-pointer font-medium"
                    >
                      <option value="Bay 1 (General Stores - Shade 1)">Bay 1 (General Stores - Shade 1)</option>
                      <option value="Bay 2 (Food & Grains - Shade 2)">Bay 2 (Food &amp; Grains - Shade 2)</option>
                      <option value="Bay 3 (Industrial Supplies - Shade 3)">Bay 3 (Industrial Supplies - Shade 3)</option>
                      <option value="Bay 4 (Apparel & Uniforms - Shade 4)">Bay 4 (Apparel &amp; Uniforms - Shade 4)</option>
                      <option value="Bay 5 (Hardware & Tools - Shade 5)">Bay 5 (Hardware &amp; Tools - Shade 5)</option>
                      <option value="Bay 6 (Medical & Pharma - Shade 6)">Bay 6 (Medical &amp; Pharma - Shade 6)</option>
                    </select>
                    <ChevronDown className="w-4 h-4 absolute right-2.5 top-3 pointer-events-none text-slate-400" />
                  </div>
                </div>
              </div>
            </div>

            {/* Section 2: Supplier & Document Reference */}
            <div className="bg-white rounded-2xl p-6 sm:p-7 border border-slate-200 shadow-sm space-y-5">
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2.5 border-b border-slate-100 pb-3">
                <div className="w-8 h-8 rounded-lg bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600">
                  <FileText className="w-4 h-4" />
                </div>
                <span>2. Supplier &amp; Document Reference</span>
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Supplier / Vendor Name */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    Supplier / Vendor / Party Name <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <select
                      value={supplier}
                      onChange={(e) => setSupplier(e.target.value)}
                      required
                      className="w-full pl-3 pr-8 py-2 rounded-lg border border-slate-300 text-sm text-slate-800 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 appearance-none cursor-pointer"
                    >
                      <option value="">Select Registered Supplier</option>
                      <option value="M/s Bharat Supply Corp">M/s Bharat Supply Corp</option>
                      <option value="M/s Prime Foods Ltd">M/s Prime Foods Ltd</option>
                      <option value="M/s Apex Manufacturing Ltd">M/s Apex Manufacturing Ltd</option>
                      <option value="M/s Metro Supplies Corp">M/s Metro Supplies Corp</option>
                      <option value="M/s National Logistics">M/s National Logistics</option>
                      <option value="M/s Reliance Logistics & Retail">M/s Reliance Logistics &amp; Retail</option>
                    </select>
                    <ChevronDown className="w-4 h-4 absolute right-2.5 top-3 pointer-events-none text-slate-400" />
                  </div>
                </div>

                {/* PO / Challan / Invoice Reference */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    Challan / PO / Invoice Number <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={challanNo}
                    onChange={(e) => setChallanNo(e.target.value.toUpperCase())}
                    placeholder="e.g. CH-2026-9912 or PO-4587"
                    required
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 text-sm font-mono font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                  />
                  <span className="text-xs text-slate-400 mt-1 block">Cross-verified by GRN inspection team</span>
                </div>
              </div>
            </div>

            {/* Section 3: Material & Declared Packaging */}
            <div className="bg-white rounded-2xl p-6 sm:p-7 border border-slate-200 shadow-sm space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
                <div>
                  <h3 className="text-base font-bold text-slate-900 flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-lg bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600">
                      <Package className="w-4 h-4" />
                    </div>
                    <span>3. Declared Packaging / Material Inward</span>
                  </h3>
                  <p className="text-xs text-slate-500 mt-1">
                    Gate logs physical carton/packaging count. Detailed piece verification happens at Step 3 (GRN).
                  </p>
                </div>
                <button
                  type="button"
                  onClick={handleAddItem}
                  className="px-3.5 py-1.5 rounded-xl bg-indigo-50 hover:bg-indigo-600 text-indigo-700 hover:text-white border border-indigo-200 hover:border-indigo-600 text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer shadow-2xs self-start sm:self-auto"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add Line Item</span>
                </button>
              </div>

              <div className="overflow-x-auto rounded-xl border border-slate-100">
                <table className="w-full text-left text-sm min-w-[700px]">
                  <thead>
                    <tr className="border-b border-slate-200 bg-slate-50/70 text-slate-600 text-xs uppercase tracking-wider font-bold">
                      <th className="py-3 px-3 w-10 text-center">#</th>
                      <th className="py-3 px-3 min-w-[200px]">Product / Material</th>
                      <th className="py-3 px-3 w-32">Declared Qty</th>
                      <th className="py-3 px-3 w-40">Packaging Unit</th>
                      <th className="py-3 px-3 min-w-[170px]">Estimated Base Units</th>
                      <th className="py-3 px-3 min-w-[130px]">Remarks / Note</th>
                      <th className="py-3 px-3 w-10 text-center"></th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 bg-white">
                    {materialItems.map((item, index) => (
                      <tr key={item.id} className="hover:bg-slate-50/80 transition-colors">
                        <td className="py-3 px-3 text-slate-400 font-mono text-xs text-center font-semibold">{index + 1}</td>
                        <td className="py-3 px-3">
                          <select
                            value={item.product}
                            onChange={(e) => handleItemChange(item.id, 'product', e.target.value)}
                            required
                            className="w-full px-2.5 py-1.5 rounded-lg border border-slate-300 text-xs bg-white text-slate-800 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                          >
                            <option value="">Select Material</option>
                            <option value="Biscuit (Glucose 100g)">Standard Biscuit Packs (Glucose 100g)</option>
                            <option value="Rice (Basmati Grade 1)">Basmati Rice (Grade 1 Special)</option>
                            <option value="Cooking Oil (Refined)">Refined Mustard Oil (15L)</option>
                            <option value="Dal (Arhar / Toor)">Chana Dal (Super Clean)</option>
                            <option value="Sugar (Refined)">Refined Sugar (Bulk Pack)</option>
                            <option value="Industrial Hardware Tools">Industrial Hardware &amp; Tools Box</option>
                            <option value="Medical & Pharma Supplies">Medical &amp; First Aid Supplies</option>
                          </select>
                        </td>
                        <td className="py-3 px-3">
                          <input
                            type="number"
                            min="1"
                            value={item.packageQty}
                            onChange={(e) => handleItemChange(item.id, 'packageQty', e.target.value)}
                            placeholder="e.g. 100"
                            required
                            className="w-full px-2.5 py-1.5 rounded-lg border border-slate-300 text-xs text-slate-900 font-bold focus:outline-none focus:ring-1 focus:ring-indigo-500"
                          />
                        </td>
                        <td className="py-3 px-3">
                          <select
                            value={item.packagingUnit}
                            onChange={(e) => handleItemChange(item.id, 'packagingUnit', e.target.value)}
                            className="w-full px-2.5 py-1.5 rounded-lg border border-slate-300 text-xs bg-white text-slate-800 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                          >
                            <option value="Gatta (Carton)">Gatta (Carton)</option>
                            <option value="Bags (50 Kg)">Bags (50 Kg)</option>
                            <option value="Tins (15 Ltr)">Tins (15 Ltr)</option>
                            <option value="Boxes / Crates">Boxes / Crates</option>
                            <option value="Individual Pieces">Individual Pieces</option>
                          </select>
                        </td>
                        <td className="py-3 px-3">
                          <span className="text-xs font-semibold text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded-md border border-emerald-200 block truncate">
                            {item.baseUnitEstimate || 'Calculated in GRN'}
                          </span>
                        </td>
                        <td className="py-3 px-3">
                          <input
                            type="text"
                            value={item.remarks}
                            onChange={(e) => handleItemChange(item.id, 'remarks', e.target.value)}
                            placeholder="e.g. Shade 2"
                            className="w-full px-2.5 py-1.5 rounded-lg border border-slate-300 text-xs text-slate-700 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                          />
                        </td>
                        <td className="py-3 px-3 text-center">
                          <button
                            type="button"
                            onClick={() => handleRemoveItem(item.id)}
                            disabled={materialItems.length === 1}
                            className="text-slate-400 hover:text-rose-600 disabled:opacity-30 cursor-pointer p-1.5 rounded-md hover:bg-rose-50 transition-colors"
                            title="Remove row"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* General Remarks & Action Buttons */}
            <div className="pt-2 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
              <div className="flex-1 min-w-[200px]">
                <input
                  type="text"
                  value={remarks}
                  onChange={(e) => setRemarks(e.target.value)}
                  placeholder="Optional gate officer remarks or delivery note..."
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 shadow-2xs bg-white"
                />
              </div>

              <div className="flex items-center justify-end gap-3 shrink-0">
                <button
                  type="button"
                  onClick={handleReset}
                  className="px-5 py-2.5 rounded-xl border border-slate-300 bg-white hover:bg-slate-50 active:bg-slate-100 text-slate-700 text-sm font-bold whitespace-nowrap shrink-0 cursor-pointer shadow-2xs transition-colors"
                >
                  Clear Form
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white text-sm font-bold whitespace-nowrap shrink-0 flex items-center justify-center gap-2 cursor-pointer shadow-sm hover:shadow transition-all"
                >
                  <Printer className="w-4 h-4 shrink-0" />
                  <span>Register &amp; Print Pass</span>
                </button>
              </div>
            </div>
        </form>
      )}

      {/* ========================================================= */}
      {/* TAB 2: TRUCKS INSIDE DEPOT (LIVE BAY QUEUE)               */}
      {/* ========================================================= */}
      {activeTab === 'queue' && (
        <div className="w-full bg-white rounded-2xl p-6 sm:p-7 border border-slate-200 shadow-sm space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
            <div className="flex items-center gap-3.5">
              <div className="w-11 h-11 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 shrink-0 shadow-xs">
                <Truck className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-lg sm:text-xl font-bold text-slate-900">
                  Vehicles Inside Warehouse Premises
                </h3>
                <p className="text-xs sm:text-sm text-slate-500 font-medium mt-0.5">
                  Live tracking of carriers actively parked, unloading at bays, or undergoing receiving inspections
                </p>
              </div>
            </div>

            <span className="text-xs font-bold text-indigo-700 bg-indigo-50 border border-indigo-200 px-3.5 py-1.5 rounded-xl self-start sm:self-auto">
              Active Count: {activeVehicles.length} Vehicles
            </span>
          </div>

          {activeVehicles.length === 0 ? (
            <div className="py-16 text-center text-slate-400 text-sm">
              <Truck className="w-12 h-12 mx-auto mb-3 opacity-30" />
              <p className="font-semibold text-slate-600">No vehicles currently inside the premises.</p>
              <button
                onClick={() => setActiveTab('new')}
                className="mt-4 px-5 py-2.5 bg-indigo-600 text-white rounded-xl text-xs font-bold shadow-xs hover:bg-indigo-700 transition-colors"
              >
                Register New Gate Inward
              </button>
            </div>
          ) : (
            <div className="overflow-x-auto rounded-xl border border-slate-100">
              <table className="w-full text-left text-sm min-w-[850px]">
                <thead>
                  <tr className="bg-slate-50/70 border-b border-slate-200 text-slate-600 text-xs uppercase tracking-wider font-bold">
                    <th className="py-4 px-4">Pass Token</th>
                    <th className="py-4 px-4">Vehicle Reg.</th>
                    <th className="py-4 px-4">Driver &amp; Phone</th>
                    <th className="py-4 px-4">Supplier / Challan</th>
                    <th className="py-4 px-4">Assigned Bay</th>
                    <th className="py-4 px-4">Declared Material</th>
                    <th className="py-4 px-4">In Time</th>
                    <th className="py-4 px-4 text-center">Status</th>
                    <th className="py-4 px-5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 bg-white">
                  {activeVehicles.map((vehicle) => (
                    <tr key={vehicle.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-4 px-4 font-mono font-bold text-indigo-700 whitespace-nowrap">{vehicle.id}</td>
                      <td className="py-4 px-4">
                        <span className="font-mono font-bold text-slate-900 bg-slate-100 px-2.5 py-1 rounded-md border border-slate-200 whitespace-nowrap shadow-2xs">
                          {vehicle.vehicleNo}
                        </span>
                        <span className="block text-xs text-slate-500 mt-1 font-medium">{vehicle.vehicleType}</span>
                      </td>
                      <td className="py-4 px-4 whitespace-nowrap">
                        <p className="font-bold text-slate-900">{vehicle.driver}</p>
                        <p className="text-xs text-slate-500 font-mono mt-0.5">{vehicle.phone}</p>
                      </td>
                      <td className="py-4 px-4">
                        <p className="font-medium text-slate-800">{vehicle.supplier}</p>
                        <p className="text-xs text-slate-500 font-mono mt-0.5">Ref: {vehicle.challanNo}</p>
                      </td>
                      <td className="py-4 px-4">
                        <span className="font-semibold text-slate-700 bg-slate-100 px-2.5 py-1 rounded-md border border-slate-200 text-xs whitespace-nowrap">
                          {vehicle.bay}
                        </span>
                      </td>
                      <td className="py-4 px-4 text-slate-700 font-medium max-w-[180px]">
                        <span className="block truncate">{vehicle.itemsSummary}</span>
                      </td>
                      <td className="py-4 px-4 text-slate-500 font-mono text-xs whitespace-nowrap">{vehicle.inTime}</td>
                      <td className="py-4 px-4 text-center">
                        <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-amber-50 text-amber-700 border border-amber-200 whitespace-nowrap">
                          {vehicle.status}
                        </span>
                      </td>
                      <td className="py-4 px-5 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            type="button"
                            onClick={() => setActivePassModal(vehicle)}
                            className="px-3 py-1.5 rounded-lg border border-slate-300 hover:bg-slate-100 text-slate-700 text-xs font-semibold cursor-pointer transition-colors shadow-2xs"
                            title="View Inward Slip"
                          >
                            Slip
                          </button>
                          <button
                            type="button"
                            onClick={() => handleGateOut(vehicle.id)}
                            className="px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold cursor-pointer shadow-2xs flex items-center gap-1.5 transition-colors"
                            title="Issue Outward Gate Pass"
                          >
                            <LogOut className="w-3.5 h-3.5" />
                            <span>Gate Out</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* ========================================================= */}
      {/* TAB 3: DAILY GATE REGISTER (LOG)                          */}
      {/* ========================================================= */}
      {activeTab === 'log' && (
        <div className="w-full bg-white rounded-2xl p-6 sm:p-7 border border-slate-200 shadow-sm space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
            <div className="flex items-center gap-3.5">
              <div className="w-11 h-11 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 shrink-0 shadow-xs">
                <ClipboardList className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-lg sm:text-xl font-bold text-slate-900">
                  Daily Gate Inward &amp; Outward Register
                </h3>
                <p className="text-xs sm:text-sm text-slate-500 font-medium mt-0.5">
                  Complete historical audit ledger of all vehicle check-ins and check-outs
                </p>
              </div>
            </div>

            {/* Filters & Search */}
            <div className="flex flex-wrap items-center gap-2.5">
              <div className="relative">
                <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400 pointer-events-none" />
                <input
                  type="text"
                  value={logSearch}
                  onChange={(e) => setLogSearch(e.target.value)}
                  placeholder="Search vehicle, driver, token..."
                  className="pl-9 pr-3 py-2 rounded-xl border border-slate-300 text-xs text-slate-800 w-64 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                />
              </div>

              <select
                value={logStatusFilter}
                onChange={(e) => setLogStatusFilter(e.target.value)}
                className="px-3 py-2 rounded-xl border border-slate-300 text-xs bg-white text-slate-700 font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
              >
                <option value="All">All Movements</option>
                <option value="Inside">Inside Warehouse Only</option>
                <option value="Cleared">Gate Out Cleared Only</option>
              </select>
            </div>
          </div>

          <div className="overflow-x-auto rounded-xl border border-slate-100">
            <table className="w-full text-left text-sm min-w-[850px]">
              <thead>
                <tr className="bg-slate-50/70 border-b border-slate-200 text-slate-600 text-xs uppercase tracking-wider font-bold">
                  <th className="py-4 px-4">Pass Token</th>
                  <th className="py-4 px-4">Vehicle Reg.</th>
                  <th className="py-4 px-4">Driver Name</th>
                  <th className="py-4 px-4">Supplier</th>
                  <th className="py-4 px-4">Challan / PO</th>
                  <th className="py-4 px-4">In Time</th>
                  <th className="py-4 px-4">Out Time</th>
                  <th className="py-4 px-4 text-center">Status</th>
                  <th className="py-4 px-5 text-right">Gate Pass</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 bg-white">
                {filteredGateLog.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-4 px-4 font-mono font-bold text-indigo-700 whitespace-nowrap">{log.id}</td>
                    <td className="py-4 px-4 font-mono font-bold text-slate-900 whitespace-nowrap">
                      <span className="bg-slate-100 px-2.5 py-1 rounded-md border border-slate-200">
                        {log.vehicleNo}
                      </span>
                    </td>
                    <td className="py-4 px-4 font-bold text-slate-900 whitespace-nowrap">{log.driver}</td>
                    <td className="py-4 px-4 text-slate-700">{log.supplier}</td>
                    <td className="py-4 px-4 font-mono text-slate-600 whitespace-nowrap">{log.challanNo}</td>
                    <td className="py-4 px-4 font-mono text-slate-500 text-xs whitespace-nowrap">{log.inTime}</td>
                    <td className="py-4 px-4 font-mono text-slate-500 text-xs whitespace-nowrap">
                      {log.outTime === '-' ? (
                        <span className="text-amber-600 font-semibold italic bg-amber-50 px-2 py-0.5 rounded border border-amber-200">On-site</span>
                      ) : (
                        log.outTime
                      )}
                    </td>
                    <td className="py-4 px-4 text-center">
                      <span
                        className={`text-xs font-semibold px-2.5 py-1 rounded-full border whitespace-nowrap ${
                          log.status === 'Inside Warehouse'
                            ? 'bg-amber-50 text-amber-700 border-amber-200'
                            : 'bg-emerald-50 text-emerald-700 border-emerald-200'
                        }`}
                      >
                        {log.status}
                      </span>
                    </td>
                    <td className="py-4 px-5 text-right">
                      <button
                        type="button"
                        onClick={() => setActivePassModal(log)}
                        className="px-3 py-1.5 rounded-lg border border-slate-300 hover:bg-slate-100 text-slate-700 text-xs font-semibold cursor-pointer inline-flex items-center gap-1.5 transition-colors shadow-2xs"
                      >
                        <Printer className="w-3.5 h-3.5 text-slate-500" />
                        <span>View Pass</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* PRINTABLE GATE PASS / INWARD SLIP MODAL (WITH QR CODE)   */}
      {/* ========================================================= */}
      {activePassModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-3 sm:p-4 backdrop-blur-xs animate-fade-in">
          <div className="bg-white rounded-2xl max-w-lg w-full max-h-[90dvh] overflow-y-auto shadow-2xl border border-slate-200 space-y-0 animate-scale-in">
            {/* Slip Header */}
            <div className="bg-slate-900 text-white p-5 border-b border-slate-800">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-indigo-600 text-white flex items-center justify-center font-bold">
                    <Truck className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-extrabold text-base tracking-wide text-white">
                      WAREHOUSE OPERATIONS
                    </h3>
                    <p className="text-xs text-indigo-300 font-semibold tracking-wider uppercase">
                      Official Vehicle Inward Gate Pass
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setActivePassModal(null)}
                  className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Slip Body Content */}
            <div className="p-6 space-y-4 text-sm">
              {/* Token & Simulated QR Code */}
              <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl border border-slate-200">
                <div>
                  <p className="text-xs uppercase font-bold text-slate-500">Gate Pass Token No.</p>
                  <p className="text-lg font-extrabold text-indigo-700 font-mono mt-0.5">{activePassModal.id}</p>
                  <p className="text-xs text-slate-600 font-medium mt-1">
                    Assigned Bay: <strong className="text-slate-900">{activePassModal.bay || 'Bay 2'}</strong>
                  </p>
                </div>
                <div className="w-18 h-18 bg-white border border-slate-300 rounded-xl p-2 flex flex-col items-center justify-center shadow-xs">
                  <QrCode className="w-12 h-12 text-slate-800" />
                  <span className="text-[9px] font-mono font-bold text-slate-500 mt-0.5">GATE-PASS</span>
                </div>
              </div>

              {/* Two Column Key-Value Details */}
              <div className="grid grid-cols-2 gap-3 border-y border-slate-200 py-4 text-xs">
                <div>
                  <span className="text-slate-500 block">Vehicle Registration:</span>
                  <span className="font-mono font-bold text-slate-900 text-sm">{activePassModal.vehicleNo}</span>
                </div>
                <div>
                  <span className="text-slate-500 block">Vehicle Type:</span>
                  <span className="font-semibold text-slate-800">{activePassModal.vehicleType}</span>
                </div>
                <div>
                  <span className="text-slate-500 block">Driver Name:</span>
                  <span className="font-bold text-slate-900">{activePassModal.driver}</span>
                </div>
                <div>
                  <span className="text-slate-500 block">Driver Contact:</span>
                  <span className="font-mono font-semibold text-slate-800">{activePassModal.phone}</span>
                </div>
                <div>
                  <span className="text-slate-500 block">Supplier / Contracting Party:</span>
                  <span className="font-semibold text-slate-800">{activePassModal.supplier}</span>
                </div>
                <div>
                  <span className="text-slate-500 block">Challan / PO Ref:</span>
                  <span className="font-mono font-bold text-indigo-700">{activePassModal.challanNo}</span>
                </div>
                <div>
                  <span className="text-slate-500 block">Gate In Time:</span>
                  <span className="font-mono text-slate-700">{activePassModal.inTime}</span>
                </div>
                <div>
                  <span className="text-slate-500 block">Current Status:</span>
                  <span className="font-bold text-amber-700">{activePassModal.status}</span>
                </div>
              </div>

              {/* Declared Material Summary */}
              <div className="bg-indigo-50/70 p-3.5 rounded-xl border border-indigo-100">
                <span className="text-xs font-bold uppercase text-indigo-900 block">
                  Declared Consignment &amp; Packaging:
                </span>
                <p className="text-sm font-semibold text-slate-800 mt-1">
                  {activePassModal.itemsSummary || 'Standard Commercial Consignment'}
                </p>
              </div>

              {/* Tear-Off Instructions */}
              <div className="border-t border-dashed border-slate-300 pt-3 flex items-center justify-between text-xs text-slate-500">
                <span>Security Officer Verified</span>
                <span className="font-mono font-bold text-slate-700">GRN Handover Copy</span>
              </div>
            </div>

            {/* Modal Buttons */}
            <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => setActivePassModal(null)}
                className="px-4 py-2 border border-slate-300 rounded-xl text-xs font-semibold text-slate-700 hover:bg-white cursor-pointer"
              >
                Close
              </button>
              <button
                type="button"
                onClick={() => {
                  window.print()
                }}
                className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-sm"
              >
                <Printer className="w-4 h-4" />
                <span>Print Official Gate Pass</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
