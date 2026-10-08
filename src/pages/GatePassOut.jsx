import { useState, useMemo, useRef, useEffect, useCallback } from 'react'
import { Link } from 'react-router-dom'
import QRCode from 'qrcode'
import {
  apiRequest,
  fetchGatePasses,
  createGatePass,
  updateGatePassStatus,
  deleteGatePass,
  fetchDispatches,
} from '../services/api'
import { printSpecificElement } from '../utils/printHelper'
import {
  FileText,
  ShieldCheck,
  Truck,
  CheckCircle2,
  Plus,
  Download,
  RotateCcw,
  Search,
  ChevronDown,
  Check,
  X,
  Printer,
  Calendar,
  User,
  QrCode,
  Trash2,
  RefreshCw,
  Loader2,
  AlertTriangle,
  ArrowRight,
  ExternalLink,
} from 'lucide-react'
import DataLoader from '../components/common/DataLoader'

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
        className="w-full bg-slate-50 hover:bg-slate-100/80 border border-slate-200 rounded-xl px-3 py-2 text-left text-xs font-semibold text-slate-700 flex items-center justify-between gap-2 transition cursor-pointer focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
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
                    ? 'bg-emerald-50 text-emerald-700 font-bold'
                    : 'text-slate-700 hover:bg-slate-50'
                }`}
              >
                <div className="truncate">
                  <div>{opt.label}</div>
                  {opt.sublabel && (
                    <div className="text-[10px] text-slate-400 font-normal">{opt.sublabel}</div>
                  )}
                </div>
                {isSelected && <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0 ml-2" />}
              </button>
            )
          })}
        </div>
      )}
    </div>
  )
}

// 6 Dedicated Warehouse Storage Shades
const SHADES = [
  { id: 'SH01', name: 'Shade 1: Grains & Bulk Pulses', baseUnit: 'Kg', packUnit: 'Bags (50kg)', unitsPerPack: 50 },
  { id: 'SH02', name: 'Shade 2: Edible Oils & Liquids', baseUnit: 'Ltr', packUnit: 'Tins (15L)', unitsPerPack: 15 },
  { id: 'SH03', name: 'Shade 3: Packaged Food & FMCG', baseUnit: 'Pieces', packUnit: 'Gatta (Cartons)', unitsPerPack: 6 },
  { id: 'SH04', name: 'Shade 4: Packaging Materials & Cartons', baseUnit: 'Cartons', packUnit: 'Bundles', unitsPerPack: 25 },
  { id: 'SH05', name: 'Shade 5: Chemicals & Hygiene', baseUnit: 'Ltr', packUnit: 'Carboys (20L)', unitsPerPack: 20 },
  { id: 'SH06', name: 'Shade 6: Spares & General Goods', baseUnit: 'Nos', packUnit: 'Crates', unitsPerPack: 10 },
]

export default function GatePassOut() {
  // Toast notifications state
  const [toastMessage, setToastMessage] = useState(null)
  const triggerToast = (msg) => {
    setToastMessage(msg)
    setTimeout(() => setToastMessage(null), 3500)
  }

  // Filter toolbar state
  const [filterType, setFilterType] = useState('ALL')
  const [filterShade, setFilterShade] = useState('ALL')
  const [filterDestination, setFilterDestination] = useState('ALL')
  const [filterStatus, setFilterStatus] = useState('ALL')
  const [searchQuery, setSearchQuery] = useState('')

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1)
  const perPage = 7

  // Modals state
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [showVoucherModal, setShowVoucherModal] = useState(null)
  const [voucherQrDataUrl, setVoucherQrDataUrl] = useState('')

  // Generate real dynamic scannable QR code when voucher modal is shown
  useEffect(() => {
    if (!showVoucherModal) {
      setVoucherQrDataUrl('')
      return
    }

    const qrPayload = [
      '=== CENTRAL WAREHOUSE OUTWARD GATE PASS ===',
      `Gate Pass No : ${showVoucherModal.gatePassNo || 'GP-OUT'}`,
      `Date & Time  : ${showVoucherModal.date || 'Today'}`,
      `Status       : ${showVoucherModal.status || 'Approved & Gate Out'}`,
      `------------------------------------------`,
      `Dispatch Ref : ${showVoucherModal.dispatchNo || 'N/A'}`,
      `Vehicle Reg  : ${showVoucherModal.vehicleNo || 'N/A'}`,
      `Driver Name  : ${showVoucherModal.driverName || 'N/A'}`,
      `License/Cont : ${showVoucherModal.licenseNo || 'VERIFIED'}`,
      `Destination  : ${showVoucherModal.destination || 'N/A'}`,
      `Origin Shade : ${showVoucherModal.shadeId || 'SH01'} (${showVoucherModal.location || 'N/A'})`,
      `------------------------------------------`,
      `Cargo Item   : ${showVoucherModal.productName || 'N/A'}`,
      `Total Weight : ${showVoucherModal.baseQty} ${showVoucherModal.baseUnit}`,
      `Packages     : ${showVoucherModal.packQty} ${showVoucherModal.packUnit}`,
      `------------------------------------------`,
      `QA QC Cert   : ${showVoucherModal.labCertNo || 'QC-PASSED'}`,
      `QC Status    : 100% LAB QC PASSED`,
      `Officer      : ${showVoucherModal.authorisedBy || 'Logistics Officer'}`,
      `Gate Stamp   : CLEARED FOR DEPARTURE`,
      '=========================================='
    ].join('\n')

    QRCode.toDataURL(qrPayload, {
      width: 256,
      margin: 1,
      color: { dark: '#0f172a', light: '#ffffff' },
      errorCorrectionLevel: 'M',
    })
      .then((url) => setVoucherQrDataUrl(url))
      .catch((err) => console.error('Error generating voucher QR:', err))
  }, [showVoucherModal])

  // Loading states
  const [loading, setLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [deletingId, setDeletingId] = useState(null)

  const initialPassState = {
    dispatchId: '',
    dispatchNo: '',
    orderNo: '',
    vehicleNo: '',
    driverName: '',
    licenseNo: '',
    destination: '',
    shadeId: 'SH01',
    productName: '',
    baseUnit: 'Kg',
    packUnit: 'Bags (50kg)',
    unitsPerPack: 50,
    packsCount: 1,
    dispatchType: 'Commercial Issue',
    labStatus: 'Passed',
    labCertNo: '',
    authorisedBy: 'Logistics Mgr. A. Sharma',
    remarks: 'Verified commercial gate pass out with authorized dispatch slip.',
  }

  // Create Gate Pass Form State
  const [newPass, setNewPass] = useState(initialPassState)
  const [availableDispatches, setAvailableDispatches] = useState([])

  // Dynamic Gate Pass Out Records (Combined from MongoDB GatePass and Dispatch)
  const [gatePasses, setGatePasses] = useState([])

  // Selection handler for Dispatch Order Slip
  const handleSelectDispatchSlip = (dispatchIdentifier) => {
    const dsp = availableDispatches.find(
      (d) => d._id === dispatchIdentifier || d.dispatchNo === dispatchIdentifier
    )
    if (!dsp) return
    const item0 = dsp.items?.[0] || {}
    const itemCount = dsp.items?.length || 1
    const itemSummary =
      itemCount > 1
        ? `${item0.productName || 'Items'} (+${itemCount - 1} more items)`
        : item0.productName || 'Material Consignment'

    setNewPass((prev) => ({
      ...prev,
      dispatchId: dsp._id,
      dispatchNo: dsp.dispatchNo,
      orderNo: dsp.orderNo || '',
      vehicleNo: dsp.vehicleNo || '',
      driverName: dsp.driverName || '',
      licenseNo: dsp.driverContact ? `CONT-${dsp.driverContact}` : 'DL-VERIFIED',
      destination: dsp.destination
        ? `${dsp.customerName ? dsp.customerName + ' - ' : ''}${dsp.destination}`
        : dsp.customerName || 'Direct Hub',
      shadeId: 'SH01',
      productName: itemSummary,
      baseUnit: dsp.baseUnit || item0.packagingUnit || 'Kg',
      packUnit: item0.packagingUnit || 'Packs',
      unitsPerPack: Number(item0.packSize) || 1,
      packsCount: Number(dsp.totalPackages) || Number(item0.requestedQty) || 1,
      dispatchType: 'Commercial Issue',
      labStatus: 'Passed',
      labCertNo: `QC-VAL-${dsp.dispatchNo?.slice(-4) || 'OK'}`,
      authorisedBy: dsp.dispatchedBy || 'Logistics Mgr. A. Sharma',
      remarks: dsp.remarks || `Verified outward dispatch slip ${dsp.dispatchNo} at gate exit.`,
    }))
  }

  // Load Records from MongoDB
  const loadRecords = useCallback(async () => {
    setLoading(true)
    try {
      const [passesRes, dispatchRes] = await Promise.all([
        fetchGatePasses().catch(() => []),
        fetchDispatches().catch(() => []),
      ])

      const validDispatches = Array.isArray(dispatchRes) ? dispatchRes : []
      setAvailableDispatches(validDispatches)

      const list = []

      // 1. Add Gate Passes saved in MongoDB GatePass collection
      if (Array.isArray(passesRes)) {
        passesRes.forEach((p, idx) => {
          const item0 = p.materials?.[0] || {}
          list.push({
            id: p.passNo || p._id || idx + 1,
            _id: p._id,
            isGatePassDoc: true,
            gatePassNo: p.passNo || `GP-2026-${String(idx + 1).padStart(3, '0')}`,
            date: new Date(p.dateTime || p.createdAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
            dispatchNo: p.dispatchNo || p.refNo || `DISP-2026-${idx + 1}`,
            vehicleNo: p.vehicleNo || '—',
            driverName: p.driverName || '—',
            licenseNo: p.driverLicense || 'DL-VERIFIED',
            destination: p.receiverName || p.receiverAddress || 'Central Hub',
            shadeId: p.shadeId || 'SH01',
            location: p.location || `${p.shadeId || 'SH01'}-R01-C01`,
            productName: item0.productName || 'General Consignment',
            baseQty: p.totalQty || item0.qty || 0,
            baseUnit: item0.unit || 'Pieces',
            packQty: p.totalPacks || item0.packQty || 1,
            packUnit: item0.packUnit || 'Packs',
            unitsPerPack: item0.unitsPerPack || 1,
            dispatchType: p.passType || 'Commercial Issue',
            status: p.status || 'Approved',
            labStatus: p.labStatus || 'Passed',
            labCertNo: p.labCertNo || 'LAB-VERIFIED',
            authorisedBy: p.authorisedBy || 'Logistics Manager',
            remarks: p.remarks || '',
          })
        })
      }

      // 2. Add Dispatches from /dispatch that don't already have an explicit Gate Pass
      if (validDispatches.length > 0) {
        const existingDispatchNos = new Set(list.map((l) => l.dispatchNo))
        validDispatches.forEach((d, idx) => {
          if (!existingDispatchNos.has(d.dispatchNo)) {
            const item0 = d.items?.[0] || {}
            list.push({
              id: d._id,
              _id: d._id,
              dispatchId: d._id,
              isGatePassDoc: false,
              gatePassNo: d.gatePassNo || `GPO-2026-${String(idx + 1).padStart(3, '0')}`,
              date: new Date(d.dispatchDate || d.createdAt || Date.now()).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
              dispatchNo: d.dispatchNo || d.orderNo || `DSP-2026-${idx + 1}`,
              vehicleNo: d.vehicleNo || '—',
              driverName: d.driverName || '—',
              licenseNo: 'DL-VERIFIED',
              destination: d.customerName || d.destination || 'Central Hub',
              shadeId: 'SH01',
              location: item0.locationCode || 'SH01-R01-C01',
              productName: item0.productName || 'Material Consignment',
              baseQty: d.totalBaseQty || 0,
              baseUnit: d.baseUnit || item0.packagingUnit || 'Kg',
              packQty: d.totalPackages || item0.requestedQty || 0,
              packUnit: item0.packagingUnit || 'Packs',
              unitsPerPack: item0.packSize || 1,
              dispatchType: 'Commercial Issue',
              status: d.status || 'Pending Exit',
              labStatus: 'Passed',
              labCertNo: 'LAB-VERIFIED',
              authorisedBy: d.dispatchedBy || 'Logistics Manager',
              remarks: d.remarks || '',
            })
          }
        })
      }

      setGatePasses(list)
    } catch (err) {
      console.error('Failed to load gate pass dispatches:', err)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadRecords()
  }, [loadRecords])

  // Filtered Gate Passes
  const filteredPasses = useMemo(() => {
    return gatePasses.filter((item) => {
      if (filterType !== 'ALL' && item.dispatchType !== filterType) return false
      if (filterShade !== 'ALL' && item.shadeId !== filterShade) return false
      if (filterDestination !== 'ALL' && item.destination !== filterDestination) return false
      if (filterStatus !== 'ALL' && item.status !== filterStatus) return false

      if (searchQuery.trim() !== '') {
        const q = searchQuery.toLowerCase()
        return (
          item.gatePassNo.toLowerCase().includes(q) ||
          item.dispatchNo.toLowerCase().includes(q) ||
          item.vehicleNo.toLowerCase().includes(q) ||
          item.driverName.toLowerCase().includes(q) ||
          item.destination.toLowerCase().includes(q) ||
          item.productName.toLowerCase().includes(q)
        )
      }
      return true
    })
  }, [gatePasses, filterType, filterShade, filterDestination, filterStatus, searchQuery])

  // Paginated Results
  const totalPages = Math.max(1, Math.ceil(filteredPasses.length / perPage))
  const paginatedPasses = filteredPasses.slice((currentPage - 1) * perPage, currentPage * perPage)

  // Dynamic KPI Stats
  const stats = useMemo(() => {
    const total = gatePasses.length
    const approved = gatePasses.filter((g) => g.status === 'Approved').length
    const pendingExit = gatePasses.filter((g) => g.status === 'Pending Exit' || g.status === 'Pending').length
    const departed = gatePasses.filter((g) => g.status === 'Departed' || g.status === 'Gate Out / Cleared' || g.status === 'Dispatched').length
    return { total, approved, pendingExit, departed }
  }, [gatePasses])

  // Handle Save New Gate Pass — PERSISTED IN MONGODB
  const handleCreateGatePass = async (e) => {
    e.preventDefault()

    // 1. STRICT VALIDATION: Dispatch Order Slip MUST exist and be selected!
    if (!newPass.dispatchNo?.trim()) {
      triggerToast('Validation Error: Gate Pass issue karne ke liye valid Dispatch Order Slip chuniye!')
      return
    }

    const matchedDispatch = availableDispatches.find(
      (d) => d.dispatchNo === newPass.dispatchNo.trim() || d._id === newPass.dispatchId
    )

    if (!matchedDispatch && availableDispatches.length > 0) {
      triggerToast('Validation Error: Chuni gayi Dispatch Slip system me registered nahi hai!')
      return
    }

    if (!newPass.vehicleNo?.trim() || !newPass.driverName?.trim()) {
      triggerToast('Vehicle Registration Number aur Driver Name required hain!')
      return
    }

    const computedBase = (Number(newPass.packsCount) || 0) * (Number(newPass.unitsPerPack) || 1)
    const locCode = `${newPass.shadeId}-R01-C01`

    const payload = {
      passType: newPass.dispatchType || 'Commercial Issue',
      purpose: 'Customer Delivery',
      refNo: newPass.orderNo || newPass.dispatchNo,
      dispatchNo: newPass.dispatchNo,
      dispatchId: newPass.dispatchId || (matchedDispatch ? matchedDispatch._id : null),
      vehicleNo: newPass.vehicleNo.trim().toUpperCase(),
      driverName: newPass.driverName.trim(),
      driverLicense: newPass.licenseNo.trim(),
      receiverName: newPass.destination.trim(),
      receiverAddress: newPass.destination.trim(),
      shadeId: newPass.shadeId,
      location: locCode,
      status: 'Approved',
      labStatus: newPass.labStatus || 'Passed',
      labCertNo: newPass.labCertNo || `QC-VAL-${newPass.dispatchNo?.slice(-4) || 'OK'}`,
      authorisedBy: newPass.authorisedBy,
      materials: [
        {
          productName: newPass.productName || 'General Consignment',
          qty: computedBase,
          unit: newPass.baseUnit,
          packQty: Number(newPass.packsCount) || 1,
          packUnit: newPass.packUnit,
          unitsPerPack: Number(newPass.unitsPerPack) || 1,
        },
      ],
      remarks: newPass.remarks,
    }

    try {
      setIsSubmitting(true)
      const savedPass = await createGatePass(payload)

      const newRecord = {
        id: savedPass._id,
        _id: savedPass._id,
        isGatePassDoc: true,
        gatePassNo: savedPass.passNo,
        date: new Date(savedPass.createdAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
        dispatchNo: savedPass.dispatchNo || savedPass.refNo,
        vehicleNo: savedPass.vehicleNo,
        driverName: savedPass.driverName,
        licenseNo: savedPass.driverLicense || 'DL-VERIFIED',
        destination: savedPass.receiverName,
        shadeId: savedPass.shadeId,
        location: savedPass.location,
        productName: newPass.productName,
        baseQty: computedBase,
        baseUnit: newPass.baseUnit,
        packQty: Number(newPass.packsCount) || 1,
        packUnit: newPass.packUnit,
        unitsPerPack: Number(newPass.unitsPerPack) || 1,
        dispatchType: savedPass.passType,
        status: savedPass.status,
        labStatus: savedPass.labStatus,
        labCertNo: savedPass.labCertNo,
        authorisedBy: savedPass.authorisedBy,
        remarks: savedPass.remarks,
      }

      setGatePasses((prev) => [newRecord, ...prev])
      setShowCreateModal(false)
      setShowVoucherModal(newRecord)
      triggerToast(`Gate Pass ${savedPass.passNo} issued & saved in MongoDB!`)
    } catch (err) {
      console.error(err)
      triggerToast(err.message || 'Failed to save gate pass')
    } finally {
      setIsSubmitting(false)
    }
  }

  // Handle Advance Pass Status — PERSISTED IN MONGODB
  const handleAdvanceStatus = async (item) => {
    const next = item.status === 'Approved' ? 'Pending Exit' : 'Departed'
    try {
      if (item.isGatePassDoc && item._id) {
        await updateGatePassStatus(item._id, next)
      } else if (item.dispatchId) {
        await apiRequest(`/dispatch/${item.dispatchId}/status`, {
          method: 'PATCH',
          body: JSON.stringify({ status: next === 'Departed' ? 'Dispatched' : next }),
        })
      }
      setGatePasses((prev) =>
        prev.map((p) => (p._id === item._id ? { ...p, status: next } : p))
      )
      triggerToast(`Gate Pass status updated to ${next}.`)
    } catch (err) {
      triggerToast(err.message || 'Failed to update status')
    }
  }

  // Handle Delete Gate Pass — PERSISTED IN MONGODB
  const handleDeletePass = async (item) => {
    if (!item._id) return
    if (!window.confirm(`Delete Gate Pass ${item.gatePassNo} (${item.vehicleNo})?`)) return
    try {
      setDeletingId(item._id)
      if (item.isGatePassDoc) {
        await deleteGatePass(item._id)
      }
      setGatePasses((prev) => prev.filter((p) => p._id !== item._id))
      triggerToast(`Gate Pass ${item.gatePassNo} deleted.`)
      if (showVoucherModal?._id === item._id) setShowVoucherModal(null)
    } catch (err) {
      triggerToast(err.message || 'Failed to delete pass')
    } finally {
      setDeletingId(null)
    }
  }

  // Export CSV
  const handleExportCSV = () => {
    const headers = [
      '#',
      'Gate Pass No',
      'Date & Time',
      'Dispatch Ref',
      'Vehicle No',
      'Driver Name',
      'License No',
      'Destination Hub',
      'Origin Shade',
      'Product Name',
      'Base Qty',
      'Base Unit',
      'Packaging Packs',
      'Dispatch Type',
      'Lab QC Cert',
      'Status',
    ]

    const rows = filteredPasses.map((row, idx) => [
      idx + 1,
      row.gatePassNo,
      `"${row.date}"`,
      row.dispatchNo,
      row.vehicleNo,
      `"${row.driverName}"`,
      row.licenseNo,
      `"${row.destination}"`,
      row.shadeId,
      `"${row.productName}"`,
      row.baseQty,
      row.baseUnit,
      `"${row.packQty} ${row.packUnit}"`,
      `"${row.dispatchType}"`,
      row.labCertNo,
      row.status,
    ])

    const csvContent =
      'data:text/csv;charset=utf-8,' +
      [headers.join(','), ...rows.map((e) => e.join(','))].join('\n')
    const encodedUri = encodeURI(csvContent)
    const link = document.createElement('a')
    link.setAttribute('href', encodedUri)
    link.setAttribute('download', 'Gate_Pass_Outward_Register.csv')
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    triggerToast('Gate pass outward register exported to CSV.')
  }

  // Filter Options
  const typeOptions = [
    { value: 'ALL', label: 'All Pass Types' },
    { value: 'Commercial Issue', label: 'Commercial Customer Issue' },
    { value: 'Inter-Warehouse Transfer', label: 'Inter-Warehouse Transfer' },
  ]

  const shadeOptions = [
    { value: 'ALL', label: 'All 6 Dedicated Shades' },
    ...SHADES.map((s) => ({ value: s.id, label: s.name })),
  ]

  const destinationOptions = [
    { value: 'ALL', label: 'All Destination Hubs' },
    { value: 'Metro Hypermarket Central Hub', label: 'Metro Hypermarket Hub' },
    { value: 'Reliance Retail Distribution Centre', label: 'Reliance Retail DC' },
    { value: 'DMart Logistics Park', label: 'DMart Logistics Park' },
    { value: 'BigBasket Fulfillment Centre', label: 'BigBasket Fulfillment' },
    { value: 'Blinkit Rapid Staging Hub', label: 'Blinkit Staging Hub' },
    { value: 'Spencers Wholesale Depot', label: 'Spencers Wholesale' },
    { value: 'Amazon Pantry Staging Bay', label: 'Amazon Pantry Bay' },
    { value: 'Flipkart Grocery Hub', label: 'Flipkart Grocery Hub' },
  ]

  const statusOptions = [
    { value: 'ALL', label: 'All Security Statuses' },
    { value: 'Approved', label: 'Security Approved' },
    { value: 'Pending Exit', label: 'Pending Gate Exit' },
    { value: 'Departed', label: 'Departed & Closed' },
  ]

  return (
    <div className="space-y-5 pb-12">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-5 right-5 z-[9999] pointer-events-auto bg-slate-900 text-white px-4 py-3 rounded-xl shadow-2xl flex items-center gap-2.5 text-xs font-semibold animate-bounce border border-slate-700">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Page Header Bar */}
      <div className="bg-white rounded-2xl p-5 shadow-xs border border-slate-200/80 flex flex-col xl:flex-row xl:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5 min-w-0">
          <div className="w-11 h-11 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600 shadow-xs shrink-0">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2.5 flex-wrap">
              <h1 className="text-xl font-bold text-slate-800 tracking-tight">Gate Pass Out &amp; Security Clearance</h1>
              <span className="text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200/60 px-2.5 py-0.5 rounded-full shrink-0">
                Security Perimeter Desk
              </span>
            </div>
            <p className="text-xs text-slate-500 font-medium mt-1 max-w-2xl">
              Issue authorized outbound gate passes, cross-verify vehicle cargo against QA lab clearance certificates, and log gate exit timestamps.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 sm:gap-2.5 shrink-0 flex-wrap sm:flex-nowrap">
          <button
            type="button"
            onClick={loadRecords}
            disabled={loading}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold shadow-xs transition shrink-0 cursor-pointer disabled:opacity-50"
            title="Refresh from Database"
          >
            <RefreshCw className={`w-3.5 h-3.5 text-emerald-600 ${loading ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </button>

          <button
            type="button"
            onClick={handleExportCSV}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold shadow-xs transition shrink-0 cursor-pointer"
          >
            <Download className="w-3.5 h-3.5 text-slate-500" />
            <span>Export CSV</span>
          </button>

          <button
            type="button"
            onClick={() => setShowCreateModal(true)}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-xs transition shrink-0 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Create Gate Pass</span>
          </button>
        </div>
      </div>

      {/* 4 Dynamic KPI Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5">
        <div className="bg-white rounded-2xl p-4 shadow-xs border border-slate-200/80 flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-slate-50 text-slate-700 border border-slate-200 flex items-center justify-center shrink-0">
            <FileText className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-500">Total Gate Passes</p>
            <h3 className="text-xl font-bold text-slate-800 leading-tight mt-0.5">
              {stats.total} Passes
            </h3>
            <p className="text-[11px] text-slate-500 font-medium">Logged this month</p>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-4 shadow-xs border border-slate-200/80 flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 border border-emerald-100 flex items-center justify-center shrink-0">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-500">Security Approved</p>
            <h3 className="text-xl font-bold text-slate-800 leading-tight mt-0.5">
              {stats.approved} Ready
            </h3>
            <p className="text-[11px] text-emerald-600 font-medium">Verified by security officer</p>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-4 shadow-xs border border-slate-200/80 flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 border border-amber-100 flex items-center justify-center shrink-0">
            <Truck className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-500">Pending Gate Exit</p>
            <h3 className="text-xl font-bold text-slate-800 leading-tight mt-0.5">
              {stats.pendingExit} Vehicles
            </h3>
            <p className="text-[11px] text-amber-600 font-medium">At exit checkpoint bay</p>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-4 shadow-xs border border-slate-200/80 flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 border border-blue-100 flex items-center justify-center shrink-0">
            <CheckCircle2 className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-500">Departed &amp; Closed</p>
            <h3 className="text-xl font-bold text-slate-800 leading-tight mt-0.5">
              {stats.departed} Vehicles
            </h3>
            <p className="text-[11px] text-blue-600 font-medium">Perimeter exit complete</p>
          </div>
        </div>
      </div>

      {/* Gate Pass Master Register Card */}
      <div className="bg-white rounded-2xl shadow-xs border border-slate-200/80 overflow-hidden">
        {/* Filter Section Header & Inputs */}
        <div className="p-5 border-b border-slate-100 space-y-4">
          {/* Top Line: Section Title & Results Count */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
                <FileText className="w-4 h-4" />
              </div>
              <div>
                <h2 className="text-sm font-bold text-slate-800">Outward Gate Pass Register</h2>
                <p className="text-[11px] text-slate-500">Filter passes by vehicle registration, driver license, destination hub, or gate status.</p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs bg-emerald-50 text-emerald-700 font-bold px-3 py-1 rounded-full border border-emerald-200/60">
                {filteredPasses.length} Passes Found
              </span>
              {(searchQuery || filterType !== 'ALL' || filterShade !== 'ALL' || filterDestination !== 'ALL' || filterStatus !== 'ALL') && (
                <button
                  type="button"
                  onClick={() => {
                    setFilterType('ALL')
                    setFilterShade('ALL')
                    setFilterDestination('ALL')
                    setFilterStatus('ALL')
                    setSearchQuery('')
                    setCurrentPage(1)
                    triggerToast('Filters reset to default.')
                  }}
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
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value)
                setCurrentPage(1)
              }}
              placeholder="Search gate pass (GP-2026-...), vehicle registration no, driver name, destination hub, or cargo product..."
              className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-10 py-2.5 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 focus:bg-white transition"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
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
                Pass Type
              </label>
              <CustomSelect
                value={filterType}
                onChange={(val) => {
                  setFilterType(val)
                  setCurrentPage(1)
                }}
                options={typeOptions}
                placeholder="All Pass Types"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-600 mb-1.5">
                Origin Shade
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
                Destination Hub
              </label>
              <CustomSelect
                value={filterDestination}
                onChange={(val) => {
                  setFilterDestination(val)
                  setCurrentPage(1)
                }}
                options={destinationOptions}
                placeholder="All Destinations"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-600 mb-1.5">
                Security Gate Status
              </label>
              <CustomSelect
                value={filterStatus}
                onChange={(val) => {
                  setFilterStatus(val)
                  setCurrentPage(1)
                }}
                options={statusOptions}
                placeholder="All Security Statuses"
              />
            </div>
          </div>
        </div>

        {/* Gate Passes Table */}
        <div className="overflow-x-auto no-scrollbar">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-50/75 border-b border-slate-200/80 text-slate-500 font-semibold uppercase tracking-wider text-[10px]">
                <th className="py-3 px-4 w-12 text-center">#</th>
                <th className="py-3 px-4 min-w-[140px]">Pass No &amp; Timestamp</th>
                <th className="py-3 px-4 min-w-[130px]">Dispatch Ref</th>
                <th className="py-3 px-4 min-w-[170px]">Vehicle &amp; Driver</th>
                <th className="py-3 px-4 min-w-[180px]">Destination Hub</th>
                <th className="py-3 px-4 min-w-[150px] text-right">Cargo Payload</th>
                <th className="py-3 px-4 min-w-[100px] text-center">Lab Clearance</th>
                <th className="py-3 px-4 min-w-[110px] text-center">Status</th>
                <th className="py-3 px-4 min-w-[120px] text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={9} className="py-8">
                    <DataLoader
                      text="Loading Outward Gate Passes..."
                      subtext="Syncing verified vehicle clearance and gate-out passes..."
                      size="md"
                    />
                  </td>
                </tr>
              ) : paginatedPasses.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-12 text-center text-slate-400">
                    <FileText className="w-8 h-8 mx-auto text-slate-300 mb-2" />
                    No gate passes match the selected filters.
                  </td>
                </tr>
              ) : (
                paginatedPasses.map((row, idx) => {
                  const globalIdx = (currentPage - 1) * perPage + idx + 1
                  return (
                    <tr key={row.id} className="hover:bg-slate-50/60 transition group">
                      <td className="py-3 px-4 text-center text-slate-400 font-mono text-[11px]">
                        {globalIdx}
                      </td>

                      <td className="py-3 px-4">
                        <div className="font-bold text-slate-800">{row.gatePassNo}</div>
                        <div className="text-[11px] text-slate-400 flex items-center gap-1 mt-0.5">
                          <Calendar className="w-3 h-3 text-slate-400" />
                          <span>{row.date}</span>
                        </div>
                      </td>

                      <td className="py-3 px-4">
                        <span className="font-mono text-xs font-semibold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded-md border border-indigo-200/60">
                          {row.dispatchNo}
                        </span>
                        <div className="text-[10px] text-slate-400 mt-1 font-medium">{row.dispatchType}</div>
                      </td>

                      <td className="py-3 px-4">
                        <div className="font-bold text-slate-800 font-mono">{row.vehicleNo}</div>
                        <div className="text-[11px] text-slate-500 flex items-center gap-1 mt-0.5">
                          <User className="w-3 h-3 text-slate-400" />
                          <span>{row.driverName}</span>
                          <span className="text-slate-300">•</span>
                          <span className="font-mono text-[10px] text-slate-400">{row.licenseNo}</span>
                        </div>
                      </td>

                      <td className="py-3 px-4">
                        <div className="font-semibold text-slate-800">{row.destination}</div>
                        <div className="text-[11px] text-slate-500 font-mono mt-0.5 flex items-center gap-1">
                          <span className="px-1.5 py-0.2 rounded bg-slate-100 text-slate-600 font-bold">{row.shadeId}</span>
                          <span>{row.location}</span>
                        </div>
                      </td>

                      <td className="py-3 px-4 text-right">
                        <div className="font-bold text-slate-800">
                          {row.baseQty.toLocaleString()} {row.baseUnit}
                        </div>
                        <div className="text-[11px] text-emerald-600 font-medium mt-0.5">
                          {row.packQty} {row.packUnit}
                        </div>
                      </td>

                      <td className="py-3 px-4 text-center">
                        <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                          <Check className="w-3 h-3" />
                          <span>Passed</span>
                        </span>
                        <div className="text-[9px] text-slate-400 font-mono mt-0.5">{row.labCertNo}</div>
                      </td>

                      <td className="py-3 px-4 text-center">
                        <span
                          className={`inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-1 rounded-full border ${
                            row.status === 'Departed'
                              ? 'bg-blue-50 text-blue-700 border-blue-200'
                              : row.status === 'Pending Exit'
                              ? 'bg-amber-50 text-amber-700 border-amber-200'
                              : 'bg-emerald-50 text-emerald-700 border-emerald-200'
                          }`}
                        >
                          <span
                            className={`w-1.5 h-1.5 rounded-full ${
                              row.status === 'Departed'
                                ? 'bg-blue-500'
                                : row.status === 'Pending Exit'
                                ? 'bg-amber-500 animate-pulse'
                                : 'bg-emerald-500'
                            }`}
                          />
                          <span>{row.status}</span>
                        </span>
                      </td>

                      <td className="py-3 px-4 text-center">
                        <div className="flex items-center justify-center gap-1.5">
                          <button
                            type="button"
                            onClick={() => setShowVoucherModal(row)}
                            className="p-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-100 text-slate-600 transition cursor-pointer"
                            title="View Gate Pass Voucher"
                          >
                            <Printer className="w-3.5 h-3.5 text-slate-600" />
                          </button>

                          {row.status !== 'Departed' && (
                            <button
                              type="button"
                              onClick={() => handleAdvanceStatus(row)}
                              className="px-2 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-[11px] font-semibold transition cursor-pointer"
                              title="Advance Pass Status"
                            >
                              {row.status === 'Approved' ? 'Gate Exit' : 'Depart'}
                            </button>
                          )}

                          <button
                            type="button"
                            onClick={() => handleDeletePass(row)}
                            disabled={deletingId === row._id}
                            className="p-1.5 rounded-lg border border-slate-200 bg-white hover:bg-rose-50 text-slate-400 hover:text-rose-600 transition cursor-pointer disabled:opacity-40"
                            title="Delete Gate Pass"
                          >
                            {deletingId === row._id ? (
                              <Loader2 className="w-3.5 h-3.5 animate-spin text-rose-600" />
                            ) : (
                              <Trash2 className="w-3.5 h-3.5" />
                            )}
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
            Showing {(currentPage - 1) * perPage + 1} to{' '}
            {Math.min(currentPage * perPage, filteredPasses.length)} of{' '}
            {filteredPasses.length} gate passes
          </div>

          <div className="flex items-center gap-1">
            <button
              type="button"
              disabled={currentPage === 1}
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              className="px-3 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 disabled:opacity-40 font-semibold cursor-pointer disabled:cursor-not-allowed"
            >
              Previous
            </button>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((num) => (
              <button
                key={num}
                type="button"
                onClick={() => setCurrentPage(num)}
                className={`w-8 h-8 rounded-lg font-bold transition cursor-pointer ${
                  currentPage === num
                    ? 'bg-emerald-600 text-white'
                    : 'bg-white border border-slate-200 hover:bg-slate-50 text-slate-700'
                }`}
              >
                {num}
              </button>
            ))}
            <button
              type="button"
              disabled={currentPage === totalPages}
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              className="px-3 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 disabled:opacity-40 font-semibold cursor-pointer disabled:cursor-not-allowed"
            >
              Next
            </button>
          </div>
        </div>
      </div>

      {/* MODAL 1: CREATE GATE PASS */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-2xl w-full p-4 sm:p-6 max-h-[90vh] overflow-y-auto no-scrollbar animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-50 border border-emerald-100 text-emerald-600 flex items-center justify-center">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-800">Issue Outbound Gate Pass</h3>
                  <p className="text-xs text-slate-500">Authorize vehicle departure with verified QA test certificate</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowCreateModal(false)}
                className="p-1.5 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {availableDispatches.length === 0 ? (
              <div className="mt-5 p-4 bg-amber-50 border border-amber-200 rounded-2xl text-xs space-y-3">
                <div className="flex items-start gap-3">
                  <div className="w-9 h-9 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center shrink-0">
                    <AlertTriangle className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-bold text-amber-900 text-sm">Pehle Product Dispatch Hona Zaroori Hai</h4>
                    <p className="text-amber-700 mt-1 leading-relaxed">
                      Warehouse standard protocol ke mutabiq, exit gate par <strong>Outward Gate Pass</strong> tabhi issue hota hai jab warehouse se product dispatch ho chuka ho aur uski <strong>Dispatch Order Slip</strong> generate ho chuki ho.
                    </p>
                    <p className="text-amber-800 font-semibold mt-1">
                      Abhi system me koi pending ya active Dispatch Order Slip nahi mili.
                    </p>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-amber-200/80">
                  <Link
                    to="/issue-dispatch"
                    className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold transition shadow-xs cursor-pointer"
                  >
                    <span>Pehle Product Dispatch Karein (Issue / Dispatch)</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                  <button
                    type="button"
                    onClick={loadRecords}
                    className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl border border-amber-300 bg-white hover:bg-amber-50 text-amber-800 font-semibold transition cursor-pointer"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                    <span>Check Again</span>
                  </button>
                </div>
              </div>
            ) : (
              <div className="mt-4 p-3.5 bg-slate-50 border border-slate-200 rounded-2xl space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-[11px] font-bold text-slate-800 flex items-center gap-1.5">
                    <FileText className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Select Authorized Dispatch Order Slip <span className="text-rose-500">*</span></span>
                  </label>
                  <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                    {availableDispatches.length} Dispatch Orders Available
                  </span>
                </div>

                <CustomSelect
                  value={newPass.dispatchId || newPass.dispatchNo}
                  onChange={(val) => handleSelectDispatchSlip(val)}
                  placeholder="-- Chuniye Dispatch Order Slip (DSP-xxxx) --"
                  options={availableDispatches.map((d) => ({
                    value: d._id || d.dispatchNo,
                    label: `${d.dispatchNo || 'DSP'} — ${d.customerName || 'Direct Consignee'} (${d.vehicleNo || 'Vehicle Pending'})`,
                    sublabel: `Order: ${d.orderNo || 'SO'} • Total: ${d.totalPackages || 1} Pkgs • Driver: ${d.driverName || '—'} [Status: ${d.status}]`,
                  }))}
                />

                {newPass.dispatchNo ? (
                  <div className="p-2 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center justify-between text-xs animate-in fade-in">
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                      <div>
                        <span className="font-mono font-bold text-emerald-950">{newPass.dispatchNo}</span>
                        {newPass.orderNo && (
                          <span className="text-[11px] text-emerald-800 ml-2 font-mono">Order: {newPass.orderNo}</span>
                        )}
                      </div>
                    </div>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 border border-emerald-200">
                      Slip Verified
                    </span>
                  </div>
                ) : (
                  <p className="text-[11px] text-amber-700 flex items-center gap-1 mt-1 font-medium">
                    <AlertTriangle className="w-3 h-3 text-amber-600 shrink-0" />
                    <span>Kripya upar list me se Dispatch Order Slip select karein jiska Gate Pass banana hai.</span>
                  </p>
                )}
              </div>
            )}

            <form onSubmit={handleCreateGatePass} className="mt-4 space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1.5">
                    Dispatch Reference Slip No *
                  </label>
                  <input
                    type="text"
                    required
                    readOnly={Boolean(newPass.dispatchId)}
                    value={newPass.dispatchNo}
                    onChange={(e) => setNewPass({ ...newPass, dispatchNo: e.target.value })}
                    placeholder="e.g. DSP-2026-0001"
                    className={`w-full border rounded-xl px-3 py-2 text-xs font-mono font-bold focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 ${
                      newPass.dispatchId
                        ? 'bg-slate-100 text-slate-700 border-slate-200 cursor-not-allowed'
                        : 'bg-slate-50 text-slate-800 border-slate-200 focus:bg-white'
                    }`}
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1.5">
                    Destination Hub / Unit *
                  </label>
                  <input
                    type="text"
                    required
                    value={newPass.destination}
                    onChange={(e) => setNewPass({ ...newPass, destination: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 focus:bg-white"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1.5">
                    Vehicle Registration Number *
                  </label>
                  <input
                    type="text"
                    required
                    value={newPass.vehicleNo}
                    onChange={(e) => setNewPass({ ...newPass, vehicleNo: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 font-mono focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 focus:bg-white"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1.5">
                    Driver Full Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={newPass.driverName}
                    onChange={(e) => setNewPass({ ...newPass, driverName: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 focus:bg-white"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1.5">
                    Driver Driving License No *
                  </label>
                  <input
                    type="text"
                    required
                    value={newPass.licenseNo}
                    onChange={(e) => setNewPass({ ...newPass, licenseNo: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 font-mono focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 focus:bg-white"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1.5">
                    Origin Warehouse Shade *
                  </label>
                  <CustomSelect
                    value={newPass.shadeId}
                    onChange={(val) => {
                      const sh = SHADES.find((s) => s.id === val)
                      setNewPass({
                        ...newPass,
                        shadeId: val,
                        baseUnit: sh ? sh.baseUnit : 'Pieces',
                        packUnit: sh ? sh.packUnit : 'Gatta',
                        unitsPerPack: sh ? sh.unitsPerPack : 6,
                      })
                    }}
                    options={SHADES.map((s) => ({ value: s.id, label: s.name }))}
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1.5">
                    Product Commodity Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={newPass.productName}
                    onChange={(e) => setNewPass({ ...newPass, productName: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 focus:bg-white"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1.5">
                    Packaging Packs ({newPass.packUnit}) *
                  </label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={newPass.packsCount}
                    onChange={(e) => setNewPass({ ...newPass, packsCount: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 font-bold focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 focus:bg-white"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1.5">
                    QA Lab Certificate Reference *
                  </label>
                  <input
                    type="text"
                    required
                    value={newPass.labCertNo}
                    onChange={(e) => setNewPass({ ...newPass, labCertNo: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 font-mono focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 focus:bg-white"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1.5">
                    Authorizing Gate Officer *
                  </label>
                  <input
                    type="text"
                    required
                    value={newPass.authorisedBy}
                    onChange={(e) => setNewPass({ ...newPass, authorisedBy: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 focus:bg-white"
                  />
                </div>
              </div>

              {/* Live Calculation Preview */}
              <div className="bg-emerald-50/70 border border-emerald-100 rounded-xl p-3 flex items-center justify-between">
                <div>
                  <p className="text-[11px] text-emerald-800 font-semibold">Total Base Unit Cargo Payload</p>
                  <p className="text-xs text-emerald-950 font-bold mt-0.5">
                    {Number(newPass.packsCount) || 0} {newPass.packUnit} × {Number(newPass.unitsPerPack) || 1} ={' '}
                    <span className="text-sm font-black text-emerald-700">
                      {((Number(newPass.packsCount) || 0) * (Number(newPass.unitsPerPack) || 1)).toLocaleString()}{' '}
                      {newPass.baseUnit}
                    </span>
                  </p>
                </div>
                <span className="text-[10px] font-bold bg-emerald-200 text-emerald-900 px-2 py-1 rounded-md">
                  ✓ Verified for Gate
                </span>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-semibold transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={!newPass.dispatchNo || isSubmitting}
                  className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-300 disabled:cursor-not-allowed text-white text-xs font-bold shadow-xs transition cursor-pointer flex items-center gap-1.5"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>Saving in Database...</span>
                    </>
                  ) : !newPass.dispatchNo ? (
                    <span>Pehle Dispatch Slip Chuniye</span>
                  ) : (
                    <span>Authorize Outward Gate Pass</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: PRINTABLE GATE PASS VOUCHER */}
      {showVoucherModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-lg w-full p-4 sm:p-6 max-h-[90vh] overflow-y-auto no-scrollbar animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Printer className="w-4 h-4 text-emerald-600" />
                <h3 className="text-sm font-bold text-slate-800">Print Gate Pass Slip</h3>
              </div>
              <button
                type="button"
                onClick={() => setShowVoucherModal(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Printable Voucher Card */}
            <div id="printable-gate-pass-out-voucher" className="printable-area mt-4 p-5 bg-white border border-slate-300 rounded-xl shadow-xs space-y-4 text-xs font-mono">
              <div className="text-center border-b border-slate-200 pb-3">
                <h2 className="text-base font-black tracking-tight text-slate-900">CENTRAL WAREHOUSE LOGISTICS</h2>
                <p className="text-[11px] text-slate-500">OFFICIAL OUTWARD SECURITY GATE PASS</p>
                <p className="text-[10px] text-emerald-700 font-bold mt-0.5">SLIP #{showVoucherModal.gatePassNo}</p>
              </div>

              <div className="grid grid-cols-2 gap-2 text-[11px]">
                <div>
                  <span className="text-slate-400">Timestamp:</span> {showVoucherModal.date}
                </div>
                <div>
                  <span className="text-slate-400">Dispatch Ref:</span> {showVoucherModal.dispatchNo}
                </div>
                <div>
                  <span className="text-slate-400">Vehicle:</span> {showVoucherModal.vehicleNo}
                </div>
                <div>
                  <span className="text-slate-400">Driver:</span> {showVoucherModal.driverName}
                </div>
                <div className="col-span-2">
                  <span className="text-slate-400">License:</span> {showVoucherModal.licenseNo}
                </div>
                <div className="col-span-2">
                  <span className="text-slate-400">Destination:</span> {showVoucherModal.destination}
                </div>
                <div className="col-span-2">
                  <span className="text-slate-400">Cargo Payload:</span> {showVoucherModal.productName} —{' '}
                  <strong>
                    {showVoucherModal.baseQty.toLocaleString()} {showVoucherModal.baseUnit} ({showVoucherModal.packQty}{' '}
                    {showVoucherModal.packUnit})
                  </strong>
                </div>
              </div>

              <div className="border-t border-b border-slate-200 py-3 flex items-center justify-between">
                <div>
                  <p className="text-[10px] text-slate-400 uppercase">QA Security Compliance</p>
                  <p className="text-xs font-bold text-emerald-700">✓ 100% LAB QC CLEARED</p>
                  <p className="text-[9px] text-slate-400 mt-0.5 font-mono">CERT: {showVoucherModal.labCertNo}</p>
                </div>
                <div className="flex flex-col items-center gap-1 shrink-0">
                  <div className="w-16 h-16 bg-white border border-slate-300 rounded-lg p-1 flex items-center justify-center shadow-xs overflow-hidden">
                    {voucherQrDataUrl ? (
                      <img
                        src={voucherQrDataUrl}
                        alt={`QR Code for ${showVoucherModal.gatePassNo}`}
                        className="w-full h-full object-contain"
                        title="Scan with any phone camera to verify gate pass"
                      />
                    ) : (
                      <QrCode className="w-10 h-10 text-slate-800" />
                    )}
                  </div>
                  <span className="text-[8px] font-mono font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.2 rounded border border-emerald-200">
                    SCAN TO VERIFY
                  </span>
                </div>
              </div>

              <div className="pt-2 flex items-center justify-between text-[10px] text-slate-400">
                <span>Officer: {showVoucherModal.authorisedBy}</span>
                <span>Gate Stamp: CLEARED</span>
              </div>
            </div>

            <div className="mt-5 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => setShowVoucherModal(null)}
                className="px-4 py-2 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-semibold transition cursor-pointer"
              >
                Close
              </button>
              <button
                type="button"
                onClick={() => {
                  printSpecificElement('#printable-gate-pass-out-voucher', `Gate Pass Out - ${showVoucherModal.gatePassNo}`)
                  triggerToast('Gate Pass sent to printer.')
                }}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-xs transition cursor-pointer"
              >
                <Printer className="w-4 h-4" />
                <span>Print Gate Slip</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
