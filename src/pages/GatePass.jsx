import { useState, useEffect, useCallback } from 'react'
import { Link } from 'react-router-dom'
import QRCode from 'qrcode'
import { printSpecificElement } from '../utils/printHelper'
import {
  fetchGatePasses,
  createGatePass,
  updateGatePassStatus,
  deleteGatePass,
  fetchDispatches,
} from '../services/api'
import {
  Check,
  X,
  Printer,
  FileText,
  Truck,
  Package,
  Plus,
  Trash2,
  Search,
  Clock,
  ShieldCheck,
  MapPin,
  QrCode,
  RotateCcw,
  RefreshCw,
  Loader2,
  AlertTriangle,
  ArrowRight,
} from 'lucide-react'
import DataLoader from '../components/common/DataLoader'

export default function GatePass() {
  const [activeTab, setActiveTab] = useState('create') // 'create' | 'register'
  const [statusFilter, setStatusFilter] = useState('all') // 'all' | 'Issued' | 'Approved' | 'Pending'
  const [searchFilter, setSearchFilter] = useState('')
  const [showPrintModal, setShowPrintModal] = useState(false)
  const [toastMessage, setToastMessage] = useState(null)
  const [loading, setLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [deletingId, setDeletingId] = useState(null)

  // Form State — Gate Pass Details
  const [passType, setPassType] = useState('Material Outward')
  const [dateTime, setDateTime] = useState(new Date().toISOString().slice(0, 16))
  const [purpose, setPurpose] = useState('Customer Delivery')
  const [referenceNo, setReferenceNo] = useState('')

  // Vehicle & Driver Details
  const [vehicleNo, setVehicleNo] = useState('')
  const [vehicleType, setVehicleType] = useState('Heavy Commercial Truck')
  const [driverName, setDriverName] = useState('')
  const [driverContact, setDriverContact] = useState('')

  // Receiver / Destination Details
  const [receiverName, setReceiverName] = useState('')
  const [receiverAddress, setReceiverAddress] = useState('')
  const [additionalNotes, setAdditionalNotes] = useState('')

  // Material Line Items
  const [materialItems, setMaterialItems] = useState([
    {
      id: 1,
      productName: '',
      batchNo: '',
      qty: '',
      unit: 'Pieces',
      remarks: '',
    },
  ])

  // Recent Gate Passes List (Fetched from MongoDB)
  const [recentPasses, setRecentPasses] = useState([])
  const [availableDispatches, setAvailableDispatches] = useState([])
  const [selectedDispatchId, setSelectedDispatchId] = useState('')

  // Selected Pass for Modal
  const [selectedPass, setSelectedPass] = useState(null)
  const [qrCodeDataUrl, setQrCodeDataUrl] = useState('')

  // Toast Notification
  const triggerToast = (msg) => {
    setToastMessage(msg)
    setTimeout(() => setToastMessage(null), 3500)
  }

  // Generate real dynamic scannable QR code whenever a pass is viewed
  useEffect(() => {
    if (!selectedPass) {
      setQrCodeDataUrl('')
      return
    }

    const itemsSummary = Array.isArray(selectedPass.materials) && selectedPass.materials.length > 0
      ? selectedPass.materials.map((m, idx) => `${idx + 1}. ${m.productName} (Qty: ${m.qty} ${m.unit || 'Units'}${m.batchNo ? ', Batch: ' + m.batchNo : ''})`).join('\n')
      : 'General Consignment'

    const qrPayload = [
      '=== OFFICIAL WAREHOUSE OUTWARD GATE PASS ===',
      `Gate Pass No : ${selectedPass.id || selectedPass.passNo || 'GP-OUT'}`,
      `Issued Date  : ${selectedPass.dateTime || new Date().toLocaleString()}`,
      `Status       : ${selectedPass.status || 'Issued & Cleared'}`,
      `Pass Type    : ${selectedPass.passType || 'Material Outward'}`,
      `--------------------------------------------`,
      `Dispatch Ref : ${selectedPass.refNo || selectedPass.dispatchNo || 'N/A'}`,
      `Vehicle Reg  : ${selectedPass.vehicleNo || 'N/A'}`,
      `Vehicle Type : ${selectedPass.vehicleType || 'Commercial Vehicle'}`,
      `Driver Name  : ${selectedPass.driverName || 'N/A'}`,
      `Driver Phone : ${selectedPass.driverContact || 'N/A'}`,
      `Movement Purpose: ${selectedPass.purpose || 'Customer Delivery'}`,
      `--------------------------------------------`,
      `Consignee    : ${selectedPass.receiverName || 'Direct Consignee'}`,
      `Destination  : ${selectedPass.receiverAddress || 'Warehouse Terminal'}`,
      `--------------------------------------------`,
      `Consignment Items:`,
      itemsSummary,
      `--------------------------------------------`,
      `QA Security  : 100% VERIFIED & CLEARED`,
      `Gate Stamp   : AUTHORIZED GATE EXIT (Gate 01)`,
      '============================================'
    ].join('\n')

    QRCode.toDataURL(qrPayload, {
      width: 256,
      margin: 1,
      color: {
        dark: '#0f172a',
        light: '#ffffff',
      },
      errorCorrectionLevel: 'M',
    })
      .then((url) => setQrCodeDataUrl(url))
      .catch((err) => console.error('Error generating QR code:', err))
  }, [selectedPass])

  // Fetch Live Gate Passes & Dispatches from MongoDB
  const loadGatePasses = useCallback(async () => {
    try {
      setLoading(true)
      const [data, dispatchesData] = await Promise.all([
        fetchGatePasses().catch(() => []),
        fetchDispatches().catch(() => []),
      ])

      setAvailableDispatches(Array.isArray(dispatchesData) ? dispatchesData : [])

      if (Array.isArray(data)) {
        const mapped = data.map((p) => {
          const formattedDate = new Date(p.dateTime || p.createdAt).toLocaleString('en-IN', {
            day: '2-digit',
            month: 'short',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
            hour12: true,
          })
          return {
            id: p.passNo || p._id,
            _id: p._id,
            dateTime: formattedDate,
            vehicleNo: p.vehicleNo,
            vehicleType: p.vehicleType || 'Heavy Commercial Truck',
            status: p.status || 'Issued',
            passType: p.passType || 'Material Outward',
            purpose: p.purpose || 'Customer Delivery',
            refNo: p.refNo || p.dispatchNo || '—',
            driverName: p.driverName,
            driverContact: p.driverContact || '—',
            receiverName: p.receiverName || 'Direct Consignee',
            receiverAddress: p.receiverAddress || 'Warehouse Transit Terminal',
            materials: p.materials || [],
            remarks: p.remarks || 'Gate clearance verified',
          }
        })
        setRecentPasses(mapped)
      }
    } catch (err) {
      console.error('Failed to load gate passes:', err)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadGatePasses()
  }, [loadGatePasses])

  // Select Dispatch Order Slip to auto-populate form
  const handleSelectDispatch = (dispIdentifier) => {
    const dsp = availableDispatches.find(
      (d) => d._id === dispIdentifier || d.dispatchNo === dispIdentifier
    )
    if (!dsp) {
      setSelectedDispatchId('')
      return
    }
    setSelectedDispatchId(dsp._id)
    setReferenceNo(dsp.dispatchNo)
    setVehicleNo(dsp.vehicleNo || '')
    setDriverName(dsp.driverName || '')
    setDriverContact(dsp.driverContact || '')
    setReceiverName(dsp.customerName || '')
    setReceiverAddress(dsp.destination || '')
    if (Array.isArray(dsp.items) && dsp.items.length > 0) {
      setMaterialItems(
        dsp.items.map((it, idx) => ({
          id: idx + 1,
          productName: it.productName || '',
          batchNo: it.batchNo || '—',
          qty: it.requestedQty || it.pickedQty || 1,
          unit: it.packagingUnit || 'Bags',
          remarks: `Outward Dispatch item from ${dsp.dispatchNo}`,
        }))
      )
    }
    triggerToast(`Dispatch Order Slip ${dsp.dispatchNo} verified!`)
  }

  // Add Item to Consignment Table
  const handleAddItem = () => {
    const newId = materialItems.length > 0 ? Math.max(...materialItems.map((m) => m.id)) + 1 : 1
    setMaterialItems([
      ...materialItems,
      { id: newId, productName: '', batchNo: '', qty: '', unit: 'Bags (50 Kg)', remarks: '' },
    ])
  }

  // Remove Item
  const handleRemoveItem = (id) => {
    if (materialItems.length === 1) {
      triggerToast('At least one item is required in the gate pass!')
      return
    }
    setMaterialItems(materialItems.filter((m) => m.id !== id))
  }

  // Update Item
  const handleUpdateItem = (id, field, value) => {
    setMaterialItems(
      materialItems.map((m) => (m.id === id ? { ...m, [field]: value } : m))
    )
  }

  // Reset Form
  const handleResetForm = () => {
    setPassType('Material Outward')
    setPurpose('Customer Delivery')
    setReferenceNo('')
    setVehicleNo('')
    setVehicleType('Heavy Commercial Truck')
    setDriverName('')
    setDriverContact('')
    setReceiverName('')
    setReceiverAddress('')
    setAdditionalNotes('')
    setDateTime(new Date().toISOString().slice(0, 16))
    setMaterialItems([{ id: 1, productName: '', batchNo: '', qty: '', unit: 'Bags (50 Kg)', remarks: '' }])
    triggerToast('Form has been reset.')
  }

  // Save & Generate Gate Pass — PERSISTED IN MONGODB
  const handleGeneratePass = async (e) => {
    e.preventDefault()

    const isOutward = passType === 'Material Outward' || passType === 'Commercial Issue'

    // STRICT VALIDATION FOR OUTWARD PASSES:
    if (isOutward) {
      if (!referenceNo.trim()) {
        triggerToast('Validation Error: Material Outward ke liye Dispatch Order Slip zaroori hai!')
        return
      }

      const matchedDispatch = availableDispatches.find(
        (d) => d.dispatchNo === referenceNo.trim() || d.orderNo === referenceNo.trim() || d._id === selectedDispatchId
      )

      if (!matchedDispatch && availableDispatches.length > 0) {
        triggerToast('Validation Error: Chuna gaya Dispatch Slip system me exist nahi karta. Kripya authorized dispatch slip select karein!')
        return
      }
    }

    if (!vehicleNo.trim() || !driverName.trim()) {
      triggerToast('Vehicle Number and Driver Name are required!')
      return
    }

    const matchedDispatch = availableDispatches.find(
      (d) => d.dispatchNo === referenceNo.trim() || d.orderNo === referenceNo.trim() || d._id === selectedDispatchId
    )

    const payload = {
      passType,
      purpose,
      dateTime: new Date(dateTime),
      refNo: referenceNo.trim() || (isOutward ? '' : `REF-2026-${Math.floor(1000 + Math.random() * 9000)}`),
      dispatchNo: isOutward ? (matchedDispatch ? matchedDispatch.dispatchNo : referenceNo.trim()) : '',
      dispatchId: matchedDispatch ? matchedDispatch._id : (selectedDispatchId || null),
      vehicleNo: vehicleNo.trim().toUpperCase(),
      vehicleType,
      driverName: driverName.trim(),
      driverContact: driverContact.trim() || '—',
      receiverName: receiverName.trim() || 'Direct Consignee',
      receiverAddress: receiverAddress.trim() || 'Warehouse Transit Terminal',
      materials: materialItems.map((m) => ({
        productName: m.productName || 'General Consignment',
        batchNo: m.batchNo || '—',
        qty: Number(m.qty) || 1,
        unit: m.unit,
        remarks: m.remarks || '',
      })),
      status: 'Issued',
      remarks: additionalNotes.trim() || 'Gate clearance verified',
    }

    try {
      setIsSubmitting(true)
      const savedPass = await createGatePass(payload)

      const formattedDate = new Date(savedPass.dateTime || savedPass.createdAt).toLocaleString('en-IN', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        hour12: true,
      })

      const newPassObj = {
        id: savedPass.passNo || savedPass._id,
        _id: savedPass._id,
        dateTime: formattedDate,
        vehicleNo: savedPass.vehicleNo,
        vehicleType: savedPass.vehicleType,
        status: savedPass.status,
        passType: savedPass.passType,
        purpose: savedPass.purpose,
        refNo: savedPass.refNo,
        driverName: savedPass.driverName,
        driverContact: savedPass.driverContact,
        receiverName: savedPass.receiverName,
        receiverAddress: savedPass.receiverAddress,
        materials: savedPass.materials || [],
        remarks: savedPass.remarks,
      }

      setRecentPasses((prev) => [newPassObj, ...prev])
      setSelectedPass(newPassObj)
      setShowPrintModal(true)
      triggerToast(`Gate Pass ${newPassObj.id} created & saved to database!`)
      handleResetForm()
    } catch (err) {
      console.error(err)
      triggerToast(err.message || 'Failed to save gate pass')
    } finally {
      setIsSubmitting(false)
    }
  }

  // Delete Gate Pass from MongoDB
  const handleDeletePass = async (pass) => {
    if (!pass._id) return
    if (!window.confirm(`Are you sure you want to delete Gate Pass ${pass.id} from the database?`)) return

    try {
      setDeletingId(pass._id)
      await deleteGatePass(pass._id)
      setRecentPasses((prev) => prev.filter((p) => p._id !== pass._id))
      triggerToast(`Gate Pass ${pass.id} deleted from database.`)
      if (selectedPass?._id === pass._id) setSelectedPass(null)
    } catch (err) {
      console.error(err)
      triggerToast(err.message || 'Failed to delete pass')
    } finally {
      setDeletingId(null)
    }
  }

  // Filtered Passes
  const filteredPasses = recentPasses.filter((pass) => {
    if (statusFilter !== 'all' && pass.status !== statusFilter) return false

    if (searchFilter.trim()) {
      const q = searchFilter.toLowerCase()
      return (
        pass.id.toLowerCase().includes(q) ||
        pass.vehicleNo.toLowerCase().includes(q) ||
        pass.driverName.toLowerCase().includes(q) ||
        pass.receiverName.toLowerCase().includes(q) ||
        pass.refNo.toLowerCase().includes(q)
      )
    }
    return true
  })

  // Status Badge Colors
  const getStatusBadge = (status) => {
    switch (status) {
      case 'Issued':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200'
      case 'Approved':
        return 'bg-blue-50 text-blue-700 border-blue-200'
      case 'Pending':
        return 'bg-amber-50 text-amber-700 border-amber-200'
      default:
        return 'bg-slate-50 text-slate-700 border-slate-200'
    }
  }

  return (
    <div className="space-y-6 max-w-[1720px] mx-auto pb-10 select-none">
      {/* Toast Alert */}
      {toastMessage && (
        <div className="fixed top-5 right-5 z-[9999] pointer-events-auto bg-slate-900 text-white px-4 py-3 rounded-xl shadow-2xl border border-slate-700 flex items-center gap-3 animate-fade-in text-sm font-semibold">
          <div className="w-6 h-6 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
            <Check className="w-4 h-4" />
          </div>
          <span>{toastMessage}</span>
        </div>
      )}

      {/* 1. Header Banner - Clean, Modern & Professional */}
      <div className="bg-white rounded-2xl p-4 sm:p-6 border border-slate-200 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-start gap-3 sm:gap-4 min-w-0 flex-1">
          <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-indigo-50 border border-indigo-100 text-indigo-600 flex items-center justify-center shrink-0 shadow-xs mt-0.5">
            <FileText className="w-5 h-5 sm:w-6 sm:h-6" />
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2 mb-1">
              <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 shrink-0">
                ● Active Dispatch Operations
              </span>
            </div>
            <h1 className="text-lg sm:text-xl lg:text-2xl font-bold text-slate-900 leading-tight">
              Gate Pass Management
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 font-medium mt-1 leading-relaxed">
              Issue, authenticate, and track vehicle outward gate passes and material consignment dispatches
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 text-xs font-semibold text-slate-500 bg-slate-50 border border-slate-200 px-3.5 py-2 rounded-xl shrink-0">
          <span>Terminal: Gate 01 Outward</span>
        </div>
      </div>

      {/* 2. KPI Summary Bar (4 Balanced Cards) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Total Passes</p>
            <p className="text-2xl font-extrabold text-slate-900 mt-1">{recentPasses.length}</p>
            <p className="text-xs text-slate-500 font-medium mt-1">All Recorded Passes</p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-indigo-50 border border-indigo-100 text-indigo-600 flex items-center justify-center">
            <FileText className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Issued &amp; Cleared</p>
            <p className="text-2xl font-extrabold text-slate-900 mt-1">
              {recentPasses.filter((p) => p.status === 'Issued').length}
            </p>
            <p className="text-xs text-emerald-600 font-semibold mt-1">Cleared for Gate Exit</p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-emerald-50 border border-emerald-100 text-emerald-600 flex items-center justify-center">
            <Truck className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Approved Passes</p>
            <p className="text-2xl font-extrabold text-slate-900 mt-1">
              {recentPasses.filter((p) => p.status === 'Approved').length}
            </p>
            <p className="text-xs text-blue-600 font-semibold mt-1">Ready for Transit</p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-blue-50 border border-blue-100 text-blue-600 flex items-center justify-center">
            <ShieldCheck className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Pending Approval</p>
            <p className="text-2xl font-extrabold text-slate-900 mt-1">
              {recentPasses.filter((p) => p.status === 'Pending').length}
            </p>
            <p className="text-xs text-amber-600 font-semibold mt-1">Awaiting Authorization</p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-amber-50 border border-amber-100 text-amber-600 flex items-center justify-center">
            <Clock className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* 3. Primary Tab Navigation */}
      <div className="bg-white rounded-2xl p-2.5 sm:p-3 border border-slate-200 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2 p-1 bg-slate-100 rounded-xl text-sm font-semibold w-full sm:w-fit">
          <button
            type="button"
            onClick={() => setActiveTab('create')}
            className={`flex-1 sm:flex-none px-4 sm:px-5 py-2.5 rounded-lg transition-all cursor-pointer flex items-center justify-center sm:justify-start gap-2 whitespace-nowrap ${
              activeTab === 'create'
                ? 'bg-indigo-600 text-white shadow-xs font-bold'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/70'
            }`}
          >
            <Plus className="w-4 h-4 shrink-0" />
            <span>Generate Gate Pass</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('register')}
            className={`flex-1 sm:flex-none px-4 sm:px-5 py-2.5 rounded-lg transition-all cursor-pointer flex items-center justify-center sm:justify-start gap-2 whitespace-nowrap ${
              activeTab === 'register'
                ? 'bg-indigo-600 text-white shadow-xs font-bold'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/70'
            }`}
          >
            <FileText className="w-4 h-4 shrink-0" />
            <span>Passes Register</span>
            <span
              className={`px-2 py-0.5 rounded-full text-xs font-bold shrink-0 ${
                activeTab === 'register'
                  ? 'bg-indigo-800 text-white'
                  : 'bg-slate-200 text-slate-800'
              }`}
            >
              {recentPasses.length}
            </span>
          </button>
        </div>

        {activeTab === 'register' && (
          <div className="relative w-full sm:w-auto">
            <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400 pointer-events-none" />
            <input
              type="text"
              value={searchFilter}
              onChange={(e) => setSearchFilter(e.target.value)}
              placeholder="Search pass, vehicle, driver..."
              className="pl-9 pr-3 py-2 rounded-xl border border-slate-300 text-xs text-slate-800 w-full sm:w-64 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
            />
          </div>
        )}
      </div>

      {/* Datalist for Standard Material Suggestions */}
      <datalist id="popular-materials">
        <option value="Basmati Rice (Grade 1 Special)" />
        <option value="Chana Dal (Super Clean)" />
        <option value="Refined Mustard Oil (15L Tins)" />
        <option value="Standard Biscuit Packs (Glucose 100g)" />
        <option value="Refined Sugar Bulk Pack" />
        <option value="Industrial Hardware & Tools Box" />
        <option value="Medical & First Aid Supplies" />
        <option value="Packaging Corrugated Boxes" />
      </datalist>

      {/* ========================================================= */}
      {/* TAB 1: GENERATE GATE PASS FORM                            */}
      {/* ========================================================= */}
      {activeTab === 'create' && (
        <form onSubmit={handleGeneratePass} className="space-y-6">
          <div className="w-full bg-white rounded-2xl p-6 sm:p-7 border border-slate-200 shadow-sm space-y-7">
            
            {/* Step 1: Gate Pass & Transport Details */}
            <div>
              <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-5">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600">
                    <FileText className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-slate-900">
                      1. Pass &amp; Vehicle Authorization
                    </h3>
                    <p className="text-xs text-slate-500">
                      Movement credentials and assigned vehicle details
                    </p>
                  </div>
                </div>
                <span className="text-xs font-semibold text-slate-500 bg-slate-50 border border-slate-200 px-2.5 py-1 rounded-md">
                  Pass ID: Auto-Generated
                </span>
              </div>

              {/* If Material Outward is selected: Show Dispatch Slip Selector / Requirement Banner */}
              {passType === 'Material Outward' && (
                <div className="mb-5">
                  {availableDispatches.length === 0 ? (
                    <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 text-xs space-y-2">
                      <div className="flex items-start gap-3">
                        <div className="w-8 h-8 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center shrink-0">
                          <AlertTriangle className="w-4 h-4" />
                        </div>
                        <div className="flex-1">
                          <h4 className="font-bold text-amber-900 text-sm">Valid Dispatch Order Slip Zaroori Hai</h4>
                          <p className="text-amber-700 mt-1 leading-relaxed">
                            Material Outward Gate Pass issue karne ke liye pehle warehouse se product dispatch hona chahiye aur uski official <strong>Dispatch Order Slip</strong> generate honi chahiye. Abhi system me koi pending dispatch nahi mila.
                          </p>
                          <div className="mt-3 flex items-center gap-2">
                            <Link
                              to="/issue-dispatch"
                              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold transition shadow-xs"
                            >
                              <span>Pehle Outward Issue / Dispatch Karein</span>
                              <ArrowRight className="w-3.5 h-3.5" />
                            </Link>
                            <button
                              type="button"
                              onClick={loadGatePasses}
                              className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl border border-amber-300 bg-white hover:bg-amber-50 text-amber-800 font-semibold transition cursor-pointer"
                            >
                              <RefreshCw className="w-3.5 h-3.5" />
                              <span>Check Again</span>
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="bg-indigo-50/60 border border-indigo-100 rounded-2xl p-4 space-y-2">
                      <div className="flex items-center justify-between">
                        <label className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                          <FileText className="w-4 h-4 text-indigo-600" />
                          <span>Select Authorized Dispatch Order Slip <span className="text-rose-500">*</span></span>
                        </label>
                        <span className="text-[11px] font-bold text-indigo-700 bg-white px-2.5 py-0.5 rounded-full border border-indigo-200">
                          {availableDispatches.length} Active Dispatch Orders
                        </span>
                      </div>
                      <select
                        value={selectedDispatchId || referenceNo}
                        onChange={(e) => handleSelectDispatch(e.target.value)}
                        className="w-full px-3 py-2.5 rounded-xl border border-indigo-200 text-xs font-semibold text-slate-800 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 cursor-pointer"
                      >
                        <option value="">-- Chuniye Dispatch Order Slip (DSP-xxxx) --</option>
                        {availableDispatches.map((d) => (
                          <option key={d._id} value={d._id}>
                            {d.dispatchNo} — {d.customerName || 'Direct'} ({d.vehicleNo || 'No Truck'}) • Order: {d.orderNo} [{d.status}]
                          </option>
                        ))}
                      </select>

                      {referenceNo && (
                        <div className="p-2.5 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center justify-between text-xs">
                          <div className="flex items-center gap-2">
                            <Check className="w-4 h-4 text-emerald-600 font-bold" />
                            <span className="font-bold text-emerald-950 font-mono">Slip Verified: {referenceNo}</span>
                          </div>
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200">
                            Linked with Outward Dispatch
                          </span>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* Pass Type */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    Pass Type <span className="text-rose-500">*</span>
                  </label>
                  <select
                    value={passType}
                    onChange={(e) => setPassType(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-300 text-sm text-slate-800 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 cursor-pointer"
                  >
                    <option value="Material Outward">Material Outward (Dispatch)</option>
                    <option value="Material Inward">Material Inward (Receiving)</option>
                    <option value="Inter-Depot Transfer">Inter-Depot Transfer</option>
                    <option value="Disposal / Scrap Outward">Disposal / Scrap Outward</option>
                    <option value="Vehicle Movement Only">Vehicle Movement Only</option>
                  </select>
                </div>

                {/* Date & Time */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    Date &amp; Time <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="datetime-local"
                    value={dateTime}
                    onChange={(e) => setDateTime(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                  />
                </div>

                {/* Reference No */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    {passType === 'Material Outward' ? (
                      <>
                        Dispatch Order Slip No. <span className="text-rose-500">*</span>
                      </>
                    ) : (
                      'Reference Document No. (SO / PO / MRN)'
                    )}
                  </label>
                  <input
                    type="text"
                    required={passType === 'Material Outward'}
                    placeholder={passType === 'Material Outward' ? 'DSP-2026-XXXX' : 'e.g. SO-2026-4587'}
                    value={referenceNo}
                    onChange={(e) => setReferenceNo(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-sm font-mono font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                  />
                </div>

                {/* Purpose */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    Movement Purpose <span className="text-rose-500">*</span>
                  </label>
                  <select
                    value={purpose}
                    onChange={(e) => setPurpose(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-300 text-sm text-slate-800 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 cursor-pointer"
                  >
                    <option value="Customer Delivery">Customer Delivery</option>
                    <option value="Inter-Depot Transfer">Inter-Depot Transfer</option>
                    <option value="Return to Supplier">Return to Supplier</option>
                    <option value="Scrap Disposal">Scrap Disposal</option>
                    <option value="Sample Dispatch">Sample Dispatch</option>
                  </select>
                </div>

                {/* Vehicle Number */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    Vehicle Registration No. <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative flex rounded-xl overflow-hidden border border-slate-300 focus-within:ring-2 focus-within:ring-indigo-500/20 focus-within:border-indigo-500 shadow-2xs">
                    <span className="inline-flex items-center px-2.5 bg-slate-100 border-r border-slate-200 text-xs font-bold text-indigo-900 select-none">
                      IND
                    </span>
                    <input
                      type="text"
                      placeholder="UP32 AB 1256"
                      value={vehicleNo}
                      onChange={(e) => setVehicleNo(e.target.value.toUpperCase())}
                      required
                      className="w-full px-3 py-2 text-sm font-bold uppercase text-slate-900 font-mono outline-none"
                    />
                  </div>
                </div>

                {/* Vehicle Type */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    Vehicle Type
                  </label>
                  <select
                    value={vehicleType}
                    onChange={(e) => setVehicleType(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-300 text-sm text-slate-800 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 cursor-pointer"
                  >
                    <option value="Heavy Commercial Truck">Heavy Commercial Truck (10 Wheeler)</option>
                    <option value="Standard Truck (6 Wheeler)">Standard Truck (6 Wheeler)</option>
                    <option value="Covered Container">Covered Container</option>
                    <option value="Light Cargo Vehicle (LCV)">Light Cargo Vehicle (LCV)</option>
                    <option value="Trailor (Multi-Axle)">Trailor (Multi-Axle)</option>
                  </select>
                </div>

                {/* Driver Name */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    Driver Full Name <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    placeholder="Enter driver's name"
                    value={driverName}
                    onChange={(e) => setDriverName(e.target.value)}
                    required
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                  />
                </div>

                {/* Driver Contact */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    Driver Phone Contact <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="tel"
                    placeholder="e.g. 98765 43210"
                    value={driverContact}
                    onChange={(e) => setDriverContact(e.target.value)}
                    required
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                  />
                </div>
              </div>
            </div>

            {/* Step 2: Consignee & Destination */}
            <div className="pt-2">
              <div className="flex items-center gap-2.5 border-b border-slate-100 pb-3 mb-5">
                <div className="w-8 h-8 rounded-lg bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600">
                  <MapPin className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">
                    2. Consignee &amp; Destination Details
                  </h3>
                  <p className="text-xs text-slate-500">
                    Recipient organization and drop-off destination address
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    Consignee / Receiver Name <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. ABC Retail Distribution Pvt. Ltd."
                    value={receiverName}
                    onChange={(e) => setReceiverName(e.target.value)}
                    required
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    Delivery Destination Address <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Plot 12, Industrial Area, Sector 4, Transport Hub"
                    value={receiverAddress}
                    onChange={(e) => setReceiverAddress(e.target.value)}
                    required
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                  />
                </div>
              </div>
            </div>

            {/* Step 3: Consignment Line Items */}
            <div className="pt-2 space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600">
                    <Package className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-slate-900">
                      3. Authorized Consignment Line Items
                    </h3>
                    <p className="text-xs text-slate-500">
                      Specify products, batch numbers, and authorized outward quantities
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleAddItem}
                  className="px-3.5 py-2 rounded-xl bg-indigo-50 hover:bg-indigo-600 text-indigo-700 hover:text-white border border-indigo-200 hover:border-indigo-600 text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer shadow-2xs self-start sm:self-auto"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add Line Item</span>
                </button>
              </div>

              <div className="overflow-x-auto rounded-xl border border-slate-200">
                <table className="w-full text-left text-sm min-w-[750px]">
                  <thead>
                    <tr className="border-b border-slate-200 bg-slate-50/80 text-slate-600 text-xs uppercase tracking-wider font-bold">
                      <th className="py-3 px-3 w-10 text-center">#</th>
                      <th className="py-3 px-3 min-w-[240px]">Product Description</th>
                      <th className="py-3 px-3 w-36">Batch / Lot No.</th>
                      <th className="py-3 px-3 w-28">Quantity</th>
                      <th className="py-3 px-3 w-36">Packaging Unit</th>
                      <th className="py-3 px-3 min-w-[160px]">Storage / Remarks</th>
                      <th className="py-3 px-3 w-10 text-center"></th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 bg-white">
                    {materialItems.map((item, index) => (
                      <tr key={item.id} className="hover:bg-slate-50/80 transition-colors">
                        <td className="py-3 px-3 text-slate-400 font-mono text-xs text-center font-semibold">
                          {index + 1}
                        </td>
                        <td className="py-3 px-3">
                          <input
                            type="text"
                            list="popular-materials"
                            placeholder="Select or enter material name"
                            value={item.productName}
                            onChange={(e) => handleUpdateItem(item.id, 'productName', e.target.value)}
                            required
                            className="w-full px-3 py-1.5 rounded-lg border border-slate-300 text-xs bg-white text-slate-800 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                          />
                        </td>
                        <td className="py-3 px-3">
                          <input
                            type="text"
                            placeholder="e.g. B102"
                            value={item.batchNo}
                            onChange={(e) => handleUpdateItem(item.id, 'batchNo', e.target.value)}
                            required
                            className="w-full px-3 py-1.5 rounded-lg border border-slate-300 text-xs font-mono font-bold text-slate-800 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                          />
                        </td>
                        <td className="py-3 px-3">
                          <input
                            type="number"
                            min="1"
                            placeholder="Qty"
                            value={item.qty}
                            onChange={(e) => handleUpdateItem(item.id, 'qty', e.target.value)}
                            required
                            className="w-full px-3 py-1.5 rounded-lg border border-slate-300 text-xs text-slate-900 font-bold focus:outline-none focus:ring-1 focus:ring-indigo-500"
                          />
                        </td>
                        <td className="py-3 px-3">
                          <select
                            value={item.unit}
                            onChange={(e) => handleUpdateItem(item.id, 'unit', e.target.value)}
                            className="w-full px-3 py-1.5 rounded-lg border border-slate-300 text-xs bg-white text-slate-800 focus:outline-none focus:ring-1 focus:ring-indigo-500 cursor-pointer"
                          >
                            <option value="Bags (50 Kg)">Bags (50 Kg)</option>
                            <option value="Cartons / Gatta">Cartons / Gatta</option>
                            <option value="Tins (15 Ltr)">Tins (15 Ltr)</option>
                            <option value="Boxes / Crates">Boxes / Crates</option>
                            <option value="Units">Individual Units</option>
                          </select>
                        </td>
                        <td className="py-3 px-3">
                          <input
                            type="text"
                            placeholder="e.g. Shade 2 (Rack R3)"
                            value={item.remarks}
                            onChange={(e) => handleUpdateItem(item.id, 'remarks', e.target.value)}
                            className="w-full px-3 py-1.5 rounded-lg border border-slate-300 text-xs text-slate-700 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                          />
                        </td>
                        <td className="py-3 px-3 text-center">
                          <button
                            type="button"
                            onClick={() => handleRemoveItem(item.id)}
                            disabled={materialItems.length === 1}
                            className="text-slate-400 hover:text-rose-600 disabled:opacity-30 cursor-pointer p-1.5 rounded-md hover:bg-rose-50 transition-colors"
                            title="Remove line"
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

            {/* Step 4: Notes & Action Buttons */}
            <div className="flex flex-col gap-3 border-t border-slate-100 pt-5">
              <input
                type="text"
                placeholder="Optional gate officer remarks or dispatch note..."
                value={additionalNotes}
                onChange={(e) => setAdditionalNotes(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 shadow-2xs bg-white"
              />

              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={handleResetForm}
                  className="flex-1 sm:flex-none px-5 py-2.5 rounded-xl border border-slate-300 bg-white hover:bg-slate-50 active:bg-slate-100 text-slate-700 text-sm font-bold cursor-pointer shadow-2xs transition-colors flex items-center justify-center gap-1.5"
                >
                  <RotateCcw className="w-4 h-4 text-slate-500" />
                  <span>Clear Form</span>
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting || (passType === 'Material Outward' && !referenceNo.trim())}
                  className="flex-1 sm:flex-none px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-300 disabled:cursor-not-allowed active:bg-indigo-800 text-white text-sm font-bold flex items-center justify-center gap-2 cursor-pointer shadow-sm hover:shadow transition-all"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Saving to Database...</span>
                    </>
                  ) : passType === 'Material Outward' && !referenceNo.trim() ? (
                    <span>Pehle Dispatch Slip Chuniye</span>
                  ) : (
                    <>
                      <Printer className="w-4 h-4 shrink-0" />
                      <span>Generate &amp; Print Pass</span>
                    </>
                  )}
                </button>
              </div>
            </div>

          </div>
        </form>
      )}

      {/* ========================================================= */}
      {/* TAB 2: PASSES REGISTER (FULL WIDTH AUDIT LEDGER)           */}
      {/* ========================================================= */}
      {activeTab === 'register' && (
        <div className="w-full bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-5">
          {/* Filter Pills Bar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
            <div className="flex items-center gap-2 flex-wrap text-xs font-semibold">
              <span className="text-slate-500 font-bold uppercase mr-1">Filter:</span>
              <button
                type="button"
                onClick={() => setStatusFilter('all')}
                className={`px-3 py-1.5 rounded-lg border transition-all cursor-pointer ${
                  statusFilter === 'all'
                    ? 'bg-slate-900 text-white border-slate-900 font-bold'
                    : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                }`}
              >
                All Passes ({recentPasses.length})
              </button>
              <button
                type="button"
                onClick={() => setStatusFilter('Issued')}
                className={`px-3 py-1.5 rounded-lg border transition-all cursor-pointer ${
                  statusFilter === 'Issued'
                    ? 'bg-emerald-600 text-white border-emerald-600 font-bold'
                    : 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100'
                }`}
              >
                Issued ({recentPasses.filter((p) => p.status === 'Issued').length})
              </button>
              <button
                type="button"
                onClick={() => setStatusFilter('Approved')}
                className={`px-3 py-1.5 rounded-lg border transition-all cursor-pointer ${
                  statusFilter === 'Approved'
                    ? 'bg-blue-600 text-white border-blue-600 font-bold'
                    : 'bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100'
                }`}
              >
                Approved ({recentPasses.filter((p) => p.status === 'Approved').length})
              </button>
              <button
                type="button"
                onClick={() => setStatusFilter('Pending')}
                className={`px-3 py-1.5 rounded-lg border transition-all cursor-pointer ${
                  statusFilter === 'Pending'
                    ? 'bg-amber-600 text-white border-amber-600 font-bold'
                    : 'bg-amber-50 text-amber-700 border-amber-200 hover:bg-amber-100'
                }`}
              >
                Pending ({recentPasses.filter((p) => p.status === 'Pending').length})
              </button>
            </div>

            <div className="flex items-center gap-3 text-xs font-semibold text-slate-500">
              <button
                type="button"
                onClick={loadGatePasses}
                disabled={loading}
                className="px-2.5 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 transition flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                title="Refresh from Database"
              >
                <RefreshCw className={`w-3.5 h-3.5 text-indigo-600 ${loading ? 'animate-spin' : ''}`} />
                <span>Refresh</span>
              </button>
              <span>Showing {filteredPasses.length} of {recentPasses.length} entries</span>
            </div>
          </div>

          {/* Full Width Passes Table */}
          <div className="overflow-x-auto rounded-xl border border-slate-200">
            <table className="w-full text-left text-sm min-w-[950px]">
              <thead>
                <tr className="bg-slate-50/80 border-b border-slate-200 text-slate-600 text-xs uppercase tracking-wider font-bold">
                  <th className="py-3.5 px-4 w-12 text-center">#</th>
                  <th className="py-3.5 px-4">Gate Pass No.</th>
                  <th className="py-3.5 px-4">Date &amp; Time</th>
                  <th className="py-3.5 px-4">Vehicle Reg.</th>
                  <th className="py-3.5 px-4">Driver Details</th>
                  <th className="py-3.5 px-4">Consignee / Destination</th>
                  <th className="py-3.5 px-4">Ref. Doc</th>
                  <th className="py-3.5 px-4 text-center">Status</th>
                  <th className="py-3.5 px-5 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 bg-white">
                {loading ? (
                  <tr>
                    <td colSpan="9" className="py-8">
                      <DataLoader
                        text="Loading Registered Gate Passes..."
                        subtext="Fetching live inward entries and vehicle pass records..."
                        size="md"
                      />
                    </td>
                  </tr>
                ) : filteredPasses.length === 0 ? (
                  <tr>
                    <td colSpan="9" className="py-10 text-center text-slate-400 text-sm">
                      No gate passes match the selected criteria.
                    </td>
                  </tr>
                ) : (
                  filteredPasses.map((pass, idx) => (
                    <tr key={pass.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3.5 px-4 text-slate-400 font-mono text-xs text-center font-semibold">
                        {idx + 1}
                      </td>
                      <td className="py-3.5 px-4 font-mono font-bold text-indigo-700 whitespace-nowrap">
                        {pass.id}
                      </td>
                      <td className="py-3.5 px-4 text-slate-600 whitespace-nowrap text-xs">
                        {pass.dateTime}
                      </td>
                      <td className="py-3.5 px-4">
                        <span className="font-mono font-bold text-slate-900 bg-slate-100 px-2.5 py-1 rounded-md border border-slate-200 whitespace-nowrap shadow-2xs">
                          {pass.vehicleNo}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <p className="font-bold text-slate-900">{pass.driverName}</p>
                        <p className="text-xs text-slate-500 font-mono">{pass.driverContact}</p>
                      </td>
                      <td className="py-3.5 px-4 text-slate-700 max-w-[220px]">
                        <p className="font-semibold text-slate-900 truncate">{pass.receiverName}</p>
                        <p className="text-xs text-slate-500 truncate">{pass.receiverAddress}</p>
                      </td>
                      <td className="py-3.5 px-4 font-mono text-slate-600 text-xs whitespace-nowrap">
                        {pass.refNo}
                      </td>
                      <td className="py-3.5 px-4 text-center whitespace-nowrap">
                        <span
                          className={`text-xs font-semibold px-2.5 py-1 rounded-full border ${getStatusBadge(
                            pass.status
                          )}`}
                        >
                          {pass.status}
                        </span>
                      </td>
                      <td className="py-3.5 px-5 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            type="button"
                            onClick={() => {
                              setSelectedPass(pass)
                              setShowPrintModal(true)
                            }}
                            className="px-3 py-1.5 rounded-lg bg-indigo-50 hover:bg-indigo-600 text-indigo-700 hover:text-white border border-indigo-100 hover:border-indigo-600 text-xs font-bold transition-all shadow-2xs inline-flex items-center gap-1.5 cursor-pointer"
                          >
                            <Printer className="w-3.5 h-3.5" />
                            <span>View &amp; Print</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDeletePass(pass)}
                            disabled={deletingId === pass._id}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 border border-transparent hover:border-rose-200 transition cursor-pointer disabled:opacity-40"
                            title="Delete Pass"
                          >
                            {deletingId === pass._id ? (
                              <Loader2 className="w-3.5 h-3.5 animate-spin text-rose-600" />
                            ) : (
                              <Trash2 className="w-3.5 h-3.5" />
                            )}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* PRINTABLE GATE PASS MODAL                                 */}
      {/* ========================================================= */}
      {showPrintModal && selectedPass && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 animate-fade-in">
          <div className="bg-white rounded-2xl max-w-xl w-full max-h-[90dvh] overflow-y-auto shadow-2xl border border-slate-200 space-y-0 animate-scale-in">
            {/* Modal Top Bar */}
            <div className="bg-slate-900 text-white p-5 border-b border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-indigo-600 text-white flex items-center justify-center font-bold shadow-xs">
                  <FileText className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-extrabold text-base tracking-wide text-white">
                    WAREHOUSE OPERATIONS
                  </h3>
                  <p className="text-xs text-indigo-300 font-semibold tracking-wider uppercase">
                    Official Outward Gate Pass Slip
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowPrintModal(false)}
                className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 cursor-pointer transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Printable Document Sheet */}
            <div id="printable-outward-gate-pass" className="printable-area p-6 space-y-4 text-sm max-h-[75vh] overflow-y-auto">
              {/* Slip Token & QR */}
              <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl border border-slate-200">
                <div>
                  <p className="text-xs uppercase font-bold text-slate-500">Gate Pass Number</p>
                  <p className="text-xl font-extrabold text-indigo-700 font-mono mt-0.5">{selectedPass.id}</p>
                  <p className="text-xs text-slate-600 font-medium mt-1">
                    Issued: <strong className="text-slate-900">{selectedPass.dateTime}</strong>
                  </p>
                </div>
                <div className="flex flex-col items-center gap-1 shrink-0">
                  <div className="w-20 h-20 bg-white border border-slate-300 rounded-xl p-1 flex items-center justify-center shadow-xs overflow-hidden">
                    {qrCodeDataUrl ? (
                      <img
                        src={qrCodeDataUrl}
                        alt={`QR Code for ${selectedPass.id}`}
                        className="w-full h-full object-contain"
                        title="Scan with any mobile camera to verify all gate pass details"
                      />
                    ) : (
                      <QrCode className="w-12 h-12 text-slate-400 animate-pulse" />
                    )}
                  </div>
                  <span className="text-[9px] font-mono font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                    SCAN TO VERIFY
                  </span>
                </div>
              </div>

              {/* 2-Column Key Credentials */}
              <div className="grid grid-cols-2 gap-3 border-y border-slate-200 py-4 text-xs">
                <div>
                  <span className="text-slate-500 block">Vehicle Registration:</span>
                  <span className="font-mono font-bold text-slate-900 text-sm">{selectedPass.vehicleNo}</span>
                </div>
                <div>
                  <span className="text-slate-500 block">Vehicle Type:</span>
                  <span className="font-semibold text-slate-800">{selectedPass.vehicleType || 'Commercial Vehicle'}</span>
                </div>
                <div>
                  <span className="text-slate-500 block">Driver Name:</span>
                  <span className="font-bold text-slate-900">{selectedPass.driverName}</span>
                </div>
                <div>
                  <span className="text-slate-500 block">Driver Contact:</span>
                  <span className="font-mono font-semibold text-slate-800">{selectedPass.driverContact}</span>
                </div>
                <div>
                  <span className="text-slate-500 block">Movement Purpose:</span>
                  <span className="font-semibold text-slate-800">{selectedPass.purpose}</span>
                </div>
                <div>
                  <span className="text-slate-500 block">Reference Doc (SO/PO):</span>
                  <span className="font-mono font-bold text-indigo-700">{selectedPass.refNo}</span>
                </div>
                <div className="col-span-2">
                  <span className="text-slate-500 block">Consignee &amp; Delivery Address:</span>
                  <span className="font-bold text-slate-900">{selectedPass.receiverName}</span>
                  <span className="text-slate-600 block text-xs mt-0.5">{selectedPass.receiverAddress}</span>
                </div>
              </div>

              {/* Consignment Items */}
              <div>
                <p className="text-xs font-bold uppercase text-slate-700 tracking-wider mb-2">
                  Authorized Consignment Items
                </p>
                <div className="border border-slate-200 rounded-xl overflow-hidden">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold">
                      <tr>
                        <th className="py-2.5 px-3 w-8 text-center">#</th>
                        <th className="py-2.5 px-3">Product Description</th>
                        <th className="py-2.5 px-3">Batch</th>
                        <th className="py-2.5 px-3 text-right">Quantity</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 bg-white">
                      {selectedPass.materials.map((m, idx) => (
                        <tr key={idx}>
                          <td className="py-2.5 px-3 text-slate-400 font-mono text-center">{idx + 1}</td>
                          <td className="py-2.5 px-3 font-bold text-slate-800">{m.productName}</td>
                          <td className="py-2.5 px-3 font-mono text-slate-600">{m.batchNo}</td>
                          <td className="py-2.5 px-3 text-right font-mono font-bold text-slate-900">
                            {m.qty} <span className="font-normal text-slate-500">{m.unit}</span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Remarks if any */}
              {selectedPass.remarks && (
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs">
                  <span className="text-slate-500 font-semibold block">Remarks / Notes:</span>
                  <span className="text-slate-800 font-medium">{selectedPass.remarks}</span>
                </div>
              )}

              {/* Signatures */}
              <div className="pt-6 grid grid-cols-3 gap-4 text-center text-xs border-t border-slate-200">
                <div className="border-t border-dashed border-slate-300 pt-2">
                  <p className="font-bold text-slate-800">Warehouse Clerk</p>
                  <p className="text-[11px] text-slate-400 mt-0.5">Prepared By</p>
                </div>
                <div className="border-t border-dashed border-slate-300 pt-2">
                  <p className="font-bold text-slate-800">Store Incharge</p>
                  <p className="text-[11px] text-slate-400 mt-0.5">Verified By</p>
                </div>
                <div className="border-t border-dashed border-slate-300 pt-2">
                  <p className="font-bold text-slate-800">Security Officer</p>
                  <p className="text-[11px] text-slate-400 mt-0.5">Gate Clearance</p>
                </div>
              </div>
            </div>

            {/* Modal Bottom Actions */}
            <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => setShowPrintModal(false)}
                className="px-4 py-2 border border-slate-300 rounded-xl text-xs font-semibold text-slate-700 hover:bg-white cursor-pointer transition-colors"
              >
                Close
              </button>
              <button
                type="button"
                onClick={() => printSpecificElement('#printable-outward-gate-pass', `Gate Pass - ${selectedPass.id}`)}
                className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-sm transition-all"
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
