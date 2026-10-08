import { useState, useMemo, useEffect } from 'react'
import { Link } from 'react-router-dom'
import QRCode from 'qrcode'
import { printSpecificElement } from '../utils/printHelper'
import { apiRequest } from '../services/api'
import { exportToExcel, exportToCSV, printOrExportPDF } from '../utils/exportHelper'
import {
  Truck, FileText, ClipboardList, Package, Trash2, Check,
  Printer, ChevronDown, Search, ArrowRight, QrCode, LogOut, Clock,
  Plus, Warehouse, AlertCircle, CheckCircle2, ShieldCheck, X, Loader2,
  ArrowUpRight, Lock, Unlock, AlertTriangle, Calendar, Filter, RotateCcw,
  Download, FileSpreadsheet
} from 'lucide-react'

const fmt = (iso) => {
  if (!iso) return '-'
  return new Date(iso).toLocaleString('en-IN', {
    day: '2-digit', month: 'short', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  })
}

const EMPTY_ITEM = () => ({
  id: Date.now() + Math.random(),
  productSku: '',
  packageQty: '1',
  baseUnitEstimate: '',
  remarks: '',
})

const calcEstimate = (prod, qty) => {
  if (!prod || !qty) return ''
  return `${Number(qty) * (prod.packSize || 1)} ${prod.baseUnit || 'Units'}`
}

// Extract main product with highest quantity during gate entry
const getMainMaterialProduct = (entry) => {
  if (!entry) return null
  const items = entry.materialItems || []
  if (items.length === 0) {
    return {
      name: entry.purpose || 'General Material Delivery',
      sku: '',
      qty: 0,
      unit: '',
      estimate: '',
      totalItemsCount: 0,
      otherCount: 0,
    }
  }

  // Sort items by numeric packageQty in descending order
  const sorted = [...items].sort((a, b) => {
    const qtyA = Number(a.packageQty) || 0
    const qtyB = Number(b.packageQty) || 0
    return qtyB - qtyA
  })

  const mainItem = sorted[0]
  const otherCount = items.length - 1

  return {
    name: mainItem.product || mainItem.sku || 'Material Item',
    sku: mainItem.sku || '',
    qty: Number(mainItem.packageQty) || 1,
    unit: mainItem.packagingUnit || 'Packs',
    estimate: mainItem.baseUnitEstimate || '',
    totalItemsCount: items.length,
    otherCount: Math.max(0, otherCount),
  }
}

export default function GateEntry() {
  const [activeTab, setActiveTab] = useState('new')
  const [toast, setToast] = useState(null)
  const [loading, setLoading] = useState(false)
  const [allEntries, setAllEntries] = useState([])
  const [products, setProducts] = useState([])
  const [grns, setGrns] = useState([])
  const [activePassModal, setActivePassModal] = useState(null)
  const [passQrDataUrl, setPassQrDataUrl] = useState('')
  const [logSearch, setLogSearch] = useState('')
  const [logFilter, setLogFilter] = useState('All')

  // Date & Time Filter state
  const [dateFilterPreset, setDateFilterPreset] = useState('All') // 'All' | 'Today' | 'Yesterday' | '7D' | '30D' | 'Custom'
  const [startDate, setStartDate] = useState(() => new Date().toISOString().slice(0, 10))
  const [startTime, setStartTime] = useState('00:00')
  const [endDate, setEndDate] = useState(() => new Date().toISOString().slice(0, 10))
  const [endTime, setEndTime] = useState('23:59')
  const [timeShift, setTimeShift] = useState('All') // 'All' | 'Morning' | 'Evening' | 'Night'
  const [filterTimestampField, setFilterTimestampField] = useState('inTime') // 'inTime' | 'outTime'
  const [showDateTimePanel, setShowDateTimePanel] = useState(false)

  // Registration Success Modal State
  const [registrationSuccessModal, setRegistrationSuccessModal] = useState(null)

  // Gate Out Confirmation Modal State
  const [gateOutConfirmModal, setGateOutConfirmModal] = useState(null)
  const [gateOutRemark, setGateOutRemark] = useState('')
  const [gateOutOfficerName, setGateOutOfficerName] = useState('Security Officer')
  const [gateOutOfficerId, setGateOutOfficerId] = useState('SEC-01')
  const [forceBypassGateOut, setForceBypassGateOut] = useState(false)

  // Form state
  const [vehicleNumber, setVehicleNumber] = useState('')
  const [vehicleType, setVehicleType] = useState('Heavy Commercial Truck')
  const [driverName, setDriverName] = useState('')
  const [driverContact, setDriverContact] = useState('')
  const [supplier, setSupplier] = useState('')
  const [challanNo, setChallanNo] = useState('')
  const [poNumber, setPoNumber] = useState('')
  const [purpose, setPurpose] = useState('Goods Delivery (GRN Inward)')
  const [assignedBay, setAssignedBay] = useState('Bay 1 (Shade 1: Grains & Bulk Pulses - SH-01)')
  const [officerRemark, setOfficerRemark] = useState('')
  const [materialItems, setMaterialItems] = useState([EMPTY_ITEM()])
  const [backendShades, setBackendShades] = useState([])

  const bayOptions = useMemo(() => {
    if (backendShades.length > 0) {
      return backendShades.map((s, idx) => `Bay ${idx + 1} (${s.name} - ${s.code})`)
    }
    return [
      'Bay 1 (Shade 1: Grains & Bulk Pulses - SH-01)',
      'Bay 2 (Shade 2: Edible Oils & Liquids - SH-02)',
      'Bay 3 (Shade 3: FMCG & Packaged Foods - SH-03)',
      'Bay 4 (Shade 4: Packaging & Materials - SH-04)',
      'Bay 5 (Shade 5: Chemicals & Hygiene - SH-05)',
      'Bay 6 (Shade 6: Spares & General Hardware - SH-06)',
    ]
  }, [backendShades])

  // Auto-filter products matching the assigned bay's shade
  const filteredProductsForBay = useMemo(() => {
    if (!assignedBay || products.length === 0) return products

    const shadeCodeMatch = assignedBay.match(/SH-0[1-6]/i)
    const bayNumMatch = assignedBay.match(/(?:Bay|Shade)\s*([1-6])/i)

    const filtered = products.filter((p) => {
      if (!p.storageZone) return false
      if (shadeCodeMatch && p.storageZone.toLowerCase().includes(shadeCodeMatch[0].toLowerCase())) {
        return true
      }
      if (bayNumMatch) {
        const num = bayNumMatch[1]
        return p.storageZone.includes(`SH-0${num}`) || p.storageZone.toLowerCase().includes(`shade ${num}`)
      }
      return false
    })

    return filtered.length > 0 ? filtered : products
  }, [assignedBay, products])

  const triggerToast = (msg, type = 'success') => {
    setToast({ msg, type })
    setTimeout(() => setToast(null), 3800)
  }

  const fetchEntries = () => {
    apiRequest('/gate-entry')
      .then((data) => {
        if (Array.isArray(data)) setAllEntries(data)
      })
      .catch(() => triggerToast('Failed to load gate entries', 'error'))

    apiRequest('/grn')
      .then((data) => {
        if (Array.isArray(data)) setGrns(data)
      })
      .catch(() => {})
  }

  useEffect(() => {
    fetchEntries()
    apiRequest('/product').then((data) => {
      if (Array.isArray(data)) setProducts(data)
    }).catch(() => {})
    apiRequest('/shade').then((data) => {
      if (Array.isArray(data) && data.length > 0) setBackendShades(data)
    }).catch(() => {})
  }, [])

  // Helper: Live Inward verification pipeline status (GRN -> Put-Away -> Clearance)
  const getGateEntryInwardStatus = (entry) => {
    if (!entry) return { stage: 'UNKNOWN', canGateOut: false, label: 'Unknown' }

    if (entry.status === 'Gate Out / Cleared') {
      return {
        stage: 'CLEARED',
        label: 'Gate Out / Cleared',
        badgeClass: 'bg-slate-100 text-slate-700 border-slate-200',
        canGateOut: false,
        reason: 'Vehicle has already exited warehouse premises.',
        grn: null,
      }
    }

    const cleanVeh = (entry.vehicleNumber || '').trim().toLowerCase()
    const cleanChallan = (entry.challanNo || '').trim().toLowerCase()
    const cleanPo = (entry.poNumber || '').trim().toLowerCase()

    const matchingGrn = grns.find((g) => {
      if (g.gateEntryId && String(g.gateEntryId) === String(entry._id)) return true
      if (g.vehicleNo && g.vehicleNo.trim().toLowerCase() === cleanVeh) return true
      if (cleanPo && g.poNo && g.poNo.trim().toLowerCase() === cleanPo) return true
      return false
    })

    if (!matchingGrn) {
      return {
        stage: 'PENDING_GRN',
        label: 'GRN Pending',
        badgeClass: 'bg-rose-50 text-rose-700 border-rose-200',
        canGateOut: false,
        reason: `Goods Receiving (GRN) has not been created yet for vehicle ${entry.vehicleNumber} (Challan: ${entry.challanNo || 'N/A'}).`,
        grn: null,
        pendingItemsCount: 0,
        totalItemsCount: 0,
      }
    }

    const materials = matchingGrn.materials || []
    const pendingPutAway = materials.filter(
      (m) => m.putAwayStatus !== 'Completed' && !m.location
    )

    if (pendingPutAway.length > 0) {
      return {
        stage: 'PENDING_PUTAWAY',
        label: `Put-Away Pending (${materials.length - pendingPutAway.length}/${materials.length})`,
        badgeClass: 'bg-amber-50 text-amber-700 border-amber-200',
        canGateOut: false,
        reason: `${pendingPutAway.length} item(s) in GRN (${matchingGrn.grnNo}) are still pending Put-Away check-in.`,
        grn: matchingGrn,
        pendingItemsCount: pendingPutAway.length,
        totalItemsCount: materials.length,
      }
    }

    return {
      stage: 'READY_FOR_OUT',
      label: 'Ready for Gate Out',
      badgeClass: 'bg-emerald-50 text-emerald-700 border-emerald-200',
      canGateOut: true,
      reason: `GRN (${matchingGrn.grnNo}) and all ${materials.length} items checked into warehouse bins.`,
      grn: matchingGrn,
      pendingItemsCount: 0,
      totalItemsCount: materials.length,
    }
  }

  // Generate QR Code for Pass Modal
  useEffect(() => {
    if (activePassModal) {
      const payload = JSON.stringify({
        type: 'GATE_PASS',
        passNo: activePassModal.passNumber,
        vehicleNo: activePassModal.vehicleNumber,
        driver: activePassModal.driverName,
        phone: activePassModal.driverContact,
        supplier: activePassModal.supplier,
        challan: activePassModal.challanNo,
        bay: activePassModal.assignedBay,
        inTime: activePassModal.inTime,
        status: activePassModal.status,
      })
      QRCode.toDataURL(payload, { width: 140, margin: 1 })
        .then(setPassQrDataUrl)
        .catch(() => setPassQrDataUrl(''))
    } else {
      setPassQrDataUrl('')
    }
  }, [activePassModal])

  const activeVehicles = allEntries.filter((e) => e.status !== 'Gate Out / Cleared')

  // Date Filter Preset handler
  const applyDatePreset = (preset) => {
    setDateFilterPreset(preset)
    const today = new Date()
    const todayStr = today.toISOString().slice(0, 10)

    if (preset === 'All') {
      return
    } else if (preset === 'Today') {
      setStartDate(todayStr)
      setStartTime('00:00')
      setEndDate(todayStr)
      setEndTime('23:59')
    } else if (preset === 'Yesterday') {
      const y = new Date()
      y.setDate(today.getDate() - 1)
      const yStr = y.toISOString().slice(0, 10)
      setStartDate(yStr)
      setStartTime('00:00')
      setEndDate(yStr)
      setEndTime('23:59')
    } else if (preset === '7D') {
      const d = new Date()
      d.setDate(today.getDate() - 7)
      setStartDate(d.toISOString().slice(0, 10))
      setStartTime('00:00')
      setEndDate(todayStr)
      setEndTime('23:59')
    } else if (preset === '30D') {
      const d = new Date()
      d.setDate(today.getDate() - 30)
      setStartDate(d.toISOString().slice(0, 10))
      setStartTime('00:00')
      setEndDate(todayStr)
      setEndTime('23:59')
    }
  }

  // Filtered Gate Inward & Outward Register Logs
  const filteredLog = useMemo(() => {
    return allEntries.filter((e) => {
      // 1. Status filter
      if (logFilter === 'Inside' && e.status === 'Gate Out / Cleared') return false
      if (logFilter === 'Cleared' && e.status !== 'Gate Out / Cleared') return false

      // 2. Keyword Search
      if (logSearch.trim()) {
        const q = logSearch.toLowerCase()
        const match = (
          e.passNumber?.toLowerCase().includes(q) ||
          e.vehicleNumber?.toLowerCase().includes(q) ||
          e.driverName?.toLowerCase().includes(q) ||
          e.supplier?.toLowerCase().includes(q) ||
          e.challanNo?.toLowerCase().includes(q) ||
          e.poNumber?.toLowerCase().includes(q) ||
          e.officerRemark?.toLowerCase().includes(q) ||
          e.assignedBay?.toLowerCase().includes(q)
        )
        if (!match) return false
      }

      // 3. Date & Time Range filter
      if (dateFilterPreset !== 'All') {
        const targetDateVal = filterTimestampField === 'outTime' ? (e.outTime || e.inTime) : (e.inTime || e.createdAt)
        if (targetDateVal) {
          const recordDate = new Date(targetDateVal)
          const recordTimeMs = recordDate.getTime()
          const startMs = new Date(`${startDate}T${startTime || '00:00'}:00`).getTime()
          const endMs = new Date(`${endDate}T${endTime || '23:59'}:59`).getTime()

          if (!isNaN(startMs) && !isNaN(endMs)) {
            if (recordTimeMs < startMs || recordTimeMs > endMs) return false
          }
        }
      }

      // 4. Shift / Time of Day filter
      if (timeShift !== 'All') {
        const targetDateVal = filterTimestampField === 'outTime' ? (e.outTime || e.inTime) : (e.inTime || e.createdAt)
        if (targetDateVal) {
          const recordDate = new Date(targetDateVal)
          const hours = recordDate.getHours() // 0 - 23

          if (timeShift === 'Morning' && (hours < 6 || hours >= 14)) return false
          if (timeShift === 'Evening' && (hours < 14 || hours >= 22)) return false
          if (timeShift === 'Night' && (hours >= 6 && hours < 22)) return false
        }
      }

      return true
    })
  }, [allEntries, logSearch, logFilter, dateFilterPreset, startDate, startTime, endDate, endTime, timeShift, filterTimestampField])

  // Export Filtered Log to Excel, CSV or PDF
  const handleExportFilteredLog = (format = 'excel') => {
    if (filteredLog.length === 0) {
      triggerToast('No records match the current filters to export.', 'error')
      return
    }

    const exportRows = filteredLog.map((e) => {
      const main = getMainMaterialProduct(e)
      return {
        'Pass Number': e.passNumber || '—',
        'Vehicle Number': e.vehicleNumber || '—',
        'Vehicle Type': e.vehicleType || 'Commercial Truck',
        'Driver Name': e.driverName || '—',
        'Driver Contact': e.driverContact || '—',
        'Supplier / Vendor': e.supplier || '—',
        'Challan No': e.challanNo || '—',
        'PO Number': e.poNumber || '—',
        'Main Product (Max Qty)': main ? main.name : '—',
        'Main Product Qty': main && main.qty > 0 ? `${main.qty} ${main.unit}` : '—',
        'Total Items Count': main ? main.totalItemsCount : 0,
        'Assigned Bay': e.assignedBay || '—',
        'In Time': e.inTime ? fmt(e.inTime) : '—',
        'Out Time': e.outTime ? fmt(e.outTime) : 'On-site (Inside)',
        'Officer Inward Remark': e.officerRemark || e.remarks || '—',
        'Gate Out Officer': e.gateOutOfficerName ? `${e.gateOutOfficerName} (${e.gateOutOfficerId || 'SEC-01'})` : '—',
        'Gate Out Remark': e.gateOutRemark || '—',
        'Status': e.status || 'Waiting at Gate',
      }
    })

    const dateScopeLabel = dateFilterPreset === 'All' ? 'All_History' : `${startDate}_${endDate}`
    const fileName = `Gate_Register_${dateScopeLabel}`

    if (format === 'excel') {
      exportToExcel(exportRows, fileName, 'Gate_Register')
      triggerToast(`Exported ${filteredLog.length} gate logs to Excel (.xlsx)`)
    } else if (format === 'csv') {
      exportToCSV(exportRows, fileName)
      triggerToast(`Exported ${filteredLog.length} gate logs to CSV (.csv)`)
    } else {
      printOrExportPDF(exportRows, 'Gate Inward & Outward Register', `Scope: ${dateFilterPreset} • Time Slot: ${timeShift}`)
      triggerToast(`Opened PDF Print / Save dialog for gate register`)
    }
  }

  const handleAddItem = () => setMaterialItems((p) => [...p, EMPTY_ITEM()])

  const handleRemoveItem = (id) => {
    if (materialItems.length === 1) return
    setMaterialItems((p) => p.filter((i) => i.id !== id))
  }

  const handleItemChange = (id, field, val) => {
    setMaterialItems((prev) =>
      prev.map((item) => {
        if (item.id !== id) return item
        // Prevent negative quantities
        let finalVal = val
        if (field === 'packageQty') {
          const num = Math.max(1, parseInt(val) || 1)
          finalVal = String(num)
        }
        const updated = { ...item, [field]: finalVal }
        const sku = field === 'productSku' ? finalVal : item.productSku
        const qty = field === 'packageQty' ? finalVal : item.packageQty
        const prod = products.find((p) => p.sku === sku)
        updated.baseUnitEstimate = calcEstimate(prod, qty)
        return updated
      })
    )
  }

  const handleReset = () => {
    setVehicleNumber('')
    setVehicleType('Heavy Commercial Truck')
    setDriverName('')
    setDriverContact('')
    setSupplier('')
    setChallanNo('')
    setPoNumber('')
    setPurpose('Goods Delivery (GRN Inward)')
    setAssignedBay(bayOptions[0] || 'Bay 1 (Shade 1: Grains & Bulk Pulses - SH-01)')
    setOfficerRemark('')
    setMaterialItems([EMPTY_ITEM()])
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    // 1. Phone number 10 digits check
    const cleanPhone = driverContact.replace(/\D/g, '')
    if (cleanPhone.length !== 10) {
      triggerToast('Driver phone number must be exactly 10 digits', 'error')
      return
    }

    // 2. Challan & PO check
    if (!challanNo.trim()) {
      triggerToast('Challan Number is required', 'error')
      return
    }

    // 3. Officer Remark check
    if (!officerRemark.trim()) {
      triggerToast('Gate Officer Remark is mandatory', 'error')
      return
    }

    // 4. Duplicate vehicle check: cannot enter if already inside
    const cleanVehicle = vehicleNumber.trim().toUpperCase()
    const duplicate = allEntries.find(
      (entry) => entry.vehicleNumber?.toUpperCase() === cleanVehicle && entry.status !== 'Gate Out / Cleared'
    )
    if (duplicate) {
      triggerToast(
        `Vehicle ${cleanVehicle} is already INSIDE premises (Pass: ${duplicate.passNumber}). Please perform Gate Out before registering new entry!`,
        'error'
      )
      return
    }

    setLoading(true)
    try {
      const entry = await apiRequest('/gate-entry', {
        method: 'POST',
        body: JSON.stringify({
          vehicleNumber: cleanVehicle,
          vehicleType,
          driverName: driverName.trim(),
          driverContact: cleanPhone,
          supplier: supplier.trim(),
          challanNo: challanNo.trim().toUpperCase(),
          poNumber: poNumber.trim().toUpperCase(),
          purpose,
          assignedBay,
          officerRemark: officerRemark.trim(),
          remarks: officerRemark.trim(),
          materialItems: materialItems.map(({ id, productSku, ...rest }) => {
            const prod = products.find((p) => p.sku === productSku)
            return {
              ...rest,
              product: prod?.name || productSku || 'General Material',
              sku: productSku,
              packagingUnit: prod ? `${prod.outerPackaging || 'Bags'}` : 'Bags',
            }
          }),
          status: 'Waiting at Gate',
        }),
      })

      setAllEntries((p) => [entry, ...p])
      setRegistrationSuccessModal(entry)
      triggerToast(`Gate Entry ${entry.passNumber} registered successfully!`)
      handleReset()
    } catch (err) {
      triggerToast(err.message || 'Failed to register gate entry', 'error')
    } finally {
      setLoading(false)
    }
  }

  // Handle Gate Out with Confirmation
  const handleOpenGateOutModal = (entry) => {
    setGateOutConfirmModal(entry)
    const inward = getGateEntryInwardStatus(entry)
    if (inward.canGateOut) {
      setGateOutRemark(`Vehicle unloaded and inspected. GRN (${inward.grn?.grnNo || 'Verified'}) put-away completed. Cleared for exit from ${entry.assignedBay}.`)
    } else {
      setGateOutRemark(`Gate Out Clearance Notice: ${inward.reason}`)
    }
    setGateOutOfficerName('Security Officer')
    setGateOutOfficerId('SEC-01')
    setForceBypassGateOut(false)
  }

  const handleConfirmGateOut = async () => {
    if (!gateOutConfirmModal) return
    const inward = getGateEntryInwardStatus(gateOutConfirmModal)

    if (!inward.canGateOut && !forceBypassGateOut) {
      triggerToast(`Cannot Gate Out: ${inward.reason}`, 'error')
      return
    }

    if (!gateOutRemark.trim()) {
      triggerToast('Gate Out Remark is required', 'error')
      return
    }

    try {
      const updated = await apiRequest(`/gate-entry/${gateOutConfirmModal._id}/gate-out`, {
        method: 'PATCH',
        body: JSON.stringify({
          forceGateOut: forceBypassGateOut,
          gateOutRemark: gateOutRemark.trim(),
          gateOutOfficerName: gateOutOfficerName.trim(),
          gateOutOfficerId: gateOutOfficerId.trim(),
        }),
      })

      setAllEntries((p) => p.map((e) => (e._id === gateOutConfirmModal._id ? updated : e)))
      triggerToast(`Vehicle ${gateOutConfirmModal.vehicleNumber} cleared for Gate Out!`)
      setGateOutConfirmModal(null)
      fetchEntries()
    } catch (err) {
      triggerToast(err.message || 'Failed to process Gate Out', 'error')
    }
  }

  return (
    <div className="space-y-6 max-w-[1720px] mx-auto pb-10 select-none">
      {/* Toast Alert */}
      {toast && (
        <div
          className={`fixed top-5 right-5 z-[9999] px-4 py-3 rounded-xl shadow-2xl border flex items-center gap-3 text-sm font-semibold animate-in fade-in duration-200 pointer-events-auto ${
            toast.type === 'error'
              ? 'bg-rose-900 text-white border-rose-700'
              : 'bg-slate-900 text-white border-slate-700'
          }`}
        >
          {toast.type === 'error' ? (
            <AlertCircle className="w-5 h-5 text-rose-400 shrink-0" />
          ) : (
            <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
          )}
          <span>{toast.msg}</span>
        </div>
      )}

      {/* Header */}
      <div className="bg-white rounded-2xl p-5 sm:p-7 border border-slate-200 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-11 h-11 rounded-xl bg-indigo-50 border border-indigo-100 text-indigo-600 flex items-center justify-center shrink-0">
            <Truck className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-slate-900">Gate Entry &amp; Vehicle Clearance</h1>
            <p className="text-sm text-slate-500 mt-0.5">Vehicle check-in, bay allocation &amp; gate pass management</p>
          </div>
        </div>
        <Link
          to="/grn"
          className="px-4 py-2.5 rounded-xl bg-slate-50 hover:bg-indigo-600 text-slate-700 hover:text-white border border-slate-200 text-sm font-bold transition-all flex items-center gap-2 group shrink-0"
        >
          <span>Proceed to GRN</span>
          <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
        </Link>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Vehicles Inside', value: activeVehicles.length, icon: <Warehouse className="w-5 h-5" />, color: 'bg-indigo-50 border-indigo-100 text-indigo-600' },
          { label: 'Total Entries', value: allEntries.length, icon: <Truck className="w-5 h-5" />, color: 'bg-emerald-50 border-emerald-100 text-emerald-600' },
          { label: 'At Unloading Bay', value: activeVehicles.filter((v) => v.status === 'Unloading at Bay').length, icon: <Package className="w-5 h-5" />, color: 'bg-amber-50 border-amber-100 text-amber-600' },
          { label: 'Gate Out Cleared', value: allEntries.filter((v) => v.status === 'Gate Out / Cleared').length, icon: <LogOut className="w-5 h-5" />, color: 'bg-slate-100 border-slate-200 text-slate-600' },
        ].map((k) => (
          <div key={k.label} className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
            <div>
              <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">{k.label}</p>
              <p className="text-2xl font-extrabold text-slate-900 mt-1">{k.value}</p>
            </div>
            <div className={`w-11 h-11 rounded-xl border flex items-center justify-center ${k.color}`}>{k.icon}</div>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-2xl p-3 border border-slate-200 shadow-sm flex items-center gap-2">
        <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-xl text-sm font-semibold flex-wrap">
          {[
            { key: 'new', label: 'New Gate Entry', icon: <Plus className="w-4 h-4" /> },
            { key: 'queue', label: `Vehicles Inside (${activeVehicles.length})`, icon: <Truck className="w-4 h-4" /> },
            { key: 'log', label: 'Gate Register', icon: <ClipboardList className="w-4 h-4" /> },
          ].map((t) => (
            <button
              key={t.key}
              type="button"
              onClick={() => setActiveTab(t.key)}
              className={`px-4 py-2 rounded-lg transition-all cursor-pointer flex items-center gap-2 whitespace-nowrap ${
                activeTab === t.key ? 'bg-indigo-600 text-white font-bold' : 'text-slate-600 hover:bg-slate-200/70'
              }`}
            >
              {t.icon}
              <span>{t.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* TAB: NEW ENTRY FORM */}
      {activeTab === 'new' && (
        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Vehicle & Driver Details */}
          <div className="bg-white rounded-2xl p-5 sm:p-7 border border-slate-200 shadow-sm space-y-4">
            <h3 className="text-base font-bold text-slate-900 border-b border-slate-100 pb-3 flex items-center gap-2">
              <Truck className="w-4 h-4 text-indigo-600" /> 1. Vehicle &amp; Driver Information
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Vehicle Number Plate <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  value={vehicleNumber}
                  onChange={(e) => setVehicleNumber(e.target.value.toUpperCase())}
                  placeholder="e.g. MH12 AB 1234"
                  required
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 text-sm font-mono font-bold focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 uppercase"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">Vehicle Type</label>
                <div className="relative">
                  <select
                    value={vehicleType}
                    onChange={(e) => setVehicleType(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 appearance-none pr-8"
                  >
                    <option>Heavy Commercial Truck</option>
                    <option>Covered Container</option>
                    <option>Light Cargo Vehicle (LCV)</option>
                    <option>Mini Truck / Pickup</option>
                    <option>Trailer (Multi-Axle)</option>
                  </select>
                  <ChevronDown className="w-4 h-4 absolute right-2.5 top-3 pointer-events-none text-slate-400" />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Driver Name <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  value={driverName}
                  onChange={(e) => setDriverName(e.target.value)}
                  placeholder="e.g. Ramesh Kumar"
                  required
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Driver Mobile No. (10 Digits) <span className="text-rose-500">*</span>
                </label>
                <input
                  type="tel"
                  maxLength={10}
                  pattern="[0-9]{10}"
                  value={driverContact}
                  onChange={(e) => setDriverContact(e.target.value.replace(/\D/g, ''))}
                  placeholder="10-digit mobile number"
                  required
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                />
                <span className="text-[10px] text-slate-400 font-mono mt-0.5 block">
                  {driverContact.length}/10 digits entered
                </span>
              </div>
            </div>
          </div>

          {/* Supplier, PO & Challan */}
          <div className="bg-white rounded-2xl p-5 sm:p-7 border border-slate-200 shadow-sm space-y-4">
            <h3 className="text-base font-bold text-slate-900 border-b border-slate-100 pb-3 flex items-center gap-2">
              <FileText className="w-4 h-4 text-indigo-600" /> 2. Delivery &amp; Challan Details
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Supplier / Vendor Name <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  value={supplier}
                  onChange={(e) => setSupplier(e.target.value)}
                  placeholder="e.g. M/s Golden Agro Industries"
                  required
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Delivery Challan No. <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  value={challanNo}
                  onChange={(e) => setChallanNo(e.target.value.toUpperCase())}
                  placeholder="e.g. CH-2026-9912"
                  required
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 text-sm font-mono font-bold focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 uppercase"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Purchase Order (PO) No. <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  value={poNumber}
                  onChange={(e) => setPoNumber(e.target.value.toUpperCase())}
                  placeholder="e.g. PO-2026-4410"
                  required
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 text-sm font-mono font-bold focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 uppercase"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">Assigned Unloading Bay</label>
                <div className="relative">
                  <select
                    value={assignedBay}
                    onChange={(e) => setAssignedBay(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 appearance-none pr-8 cursor-pointer"
                  >
                    {bayOptions.map((bay) => (
                      <option key={bay} value={bay}>
                        {bay}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="w-4 h-4 absolute right-2.5 top-3 pointer-events-none text-slate-400" />
                </div>
              </div>
            </div>
          </div>

          {/* Material Items */}
          <div className="bg-white rounded-2xl p-5 sm:p-7 border border-slate-200 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Package className="w-4 h-4 text-indigo-600" /> 3. Declared Material &amp; Packages (Non-Negative Limits)
              </h3>
              <button
                type="button"
                onClick={handleAddItem}
                className="px-3 py-1.5 rounded-xl bg-indigo-50 hover:bg-indigo-600 text-indigo-700 hover:text-white border border-indigo-200 text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" /> Add Item
              </button>
            </div>
            <div className="overflow-x-auto rounded-xl border border-slate-100">
              <table className="w-full text-left text-sm min-w-[680px]">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50/70 text-slate-600 text-xs uppercase tracking-wider font-bold">
                    <th className="py-3 px-3 w-8 text-center">#</th>
                    <th className="py-3 px-3">Product Description</th>
                    <th className="py-3 px-3 w-32">Packages Qty (Min 1)</th>
                    <th className="py-3 px-3 w-44">Packaging Unit</th>
                    <th className="py-3 px-3 w-40">Base Estimate</th>
                    <th className="py-3 px-3 w-36">Item Remarks</th>
                    <th className="py-3 px-3 w-8"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 bg-white">
                  {materialItems.map((item, idx) => {
                    const selectedProd = products.find((p) => p.sku === item.productSku)
                    return (
                      <tr key={item.id}>
                        <td className="py-3 px-3 text-slate-400 font-mono text-xs text-center">{idx + 1}</td>
                        <td className="py-3 px-3">
                          <select
                            value={item.productSku}
                            onChange={(e) => handleItemChange(item.id, 'productSku', e.target.value)}
                            required
                            className="w-full px-2 py-1.5 rounded-lg border border-slate-300 text-xs bg-white focus:outline-none focus:ring-1 focus:ring-indigo-500 font-medium cursor-pointer"
                          >
                            <option value="">-- Select Product ({filteredProductsForBay.length} for this Bay) --</option>
                            {filteredProductsForBay.map((p) => (
                              <option key={p.sku} value={p.sku}>
                                {p.name} ({p.sku})
                              </option>
                            ))}
                          </select>
                        </td>
                        <td className="py-3 px-3">
                          <input
                            type="number"
                            min="1"
                            max="50000"
                            value={item.packageQty}
                            onChange={(e) => handleItemChange(item.id, 'packageQty', e.target.value)}
                            placeholder="Qty (Min 1)"
                            required
                            className="w-full px-2 py-1.5 rounded-lg border border-slate-300 text-xs font-bold font-mono focus:outline-none focus:ring-1 focus:ring-indigo-500"
                          />
                        </td>
                        <td className="py-3 px-3">
                          <span className="text-xs font-semibold text-slate-700 bg-slate-50 px-2 py-1.5 rounded-md border border-slate-200 block truncate">
                            {selectedProd
                              ? `${selectedProd.outerPackaging || 'Bags'} (${selectedProd.packSize} ${selectedProd.baseUnit})`
                              : 'Standard Packaging'}
                          </span>
                        </td>
                        <td className="py-3 px-3">
                          <span className="text-xs font-semibold text-emerald-800 bg-emerald-50 px-2 py-1 rounded-md border border-emerald-200 block truncate font-mono">
                            {item.baseUnitEstimate || 'Auto-calc'}
                          </span>
                        </td>
                        <td className="py-3 px-3">
                          <input
                            type="text"
                            value={item.remarks}
                            onChange={(e) => handleItemChange(item.id, 'remarks', e.target.value)}
                            placeholder="Notes..."
                            className="w-full px-2 py-1.5 rounded-lg border border-slate-300 text-xs focus:outline-none focus:ring-1 focus:ring-indigo-500"
                          />
                        </td>
                        <td className="py-3 px-3 text-center">
                          <button
                            type="button"
                            onClick={() => handleRemoveItem(item.id)}
                            disabled={materialItems.length === 1}
                            className="text-slate-400 hover:text-rose-600 disabled:opacity-30 cursor-pointer p-1 rounded hover:bg-rose-50 transition-colors"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Mandatory Gate Officer Remark & Submit */}
          <div className="bg-white rounded-2xl p-5 sm:p-7 border border-slate-200 shadow-sm space-y-4">
            <h3 className="text-base font-bold text-slate-900 border-b border-slate-100 pb-3 flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-indigo-600" /> 4. Security Gate Officer Verification &amp; Mandatory Remarks
            </h3>
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
              <input
                type="text"
                required
                value={officerRemark}
                onChange={(e) => setOfficerRemark(e.target.value)}
                placeholder="Gate officer verification remarks (MANDATORY: e.g. Seal verified, driver ID checked, bay allocated)..."
                className="flex-1 px-4 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 bg-white"
              />
              <div className="flex gap-3 shrink-0">
                <button
                  type="button"
                  onClick={handleReset}
                  className="px-5 py-2.5 rounded-xl border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 text-sm font-bold cursor-pointer transition-colors"
                >
                  Clear
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-bold flex items-center gap-2 cursor-pointer shadow-sm transition-all disabled:opacity-60 disabled:cursor-not-allowed disabled:pointer-events-none"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Registering Gate Entry...</span>
                    </>
                  ) : (
                    <>
                      <Printer className="w-4 h-4" />
                      <span>Register Gate Entry</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </form>
      )}

      {/* TAB: VEHICLES INSIDE */}
      {activeTab === 'queue' && (
        <div className="bg-white rounded-2xl p-5 sm:p-7 border border-slate-200 shadow-sm space-y-5">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h3 className="text-lg font-bold text-slate-900">Vehicles Currently Inside Warehouse Premises</h3>
            <span className="text-xs font-bold px-3 py-1 rounded-full bg-amber-50 text-amber-800 border border-amber-200">
              {activeVehicles.length} Vehicles Inside
            </span>
          </div>
          {activeVehicles.length === 0 ? (
            <div className="py-16 text-center">
              <Truck className="w-12 h-12 mx-auto mb-3 text-slate-300" />
              <p className="text-slate-500 font-semibold">No vehicles inside premises</p>
              <button
                onClick={() => setActiveTab('new')}
                className="mt-4 px-5 py-2 bg-indigo-600 text-white rounded-xl text-xs font-bold hover:bg-indigo-700 transition-colors cursor-pointer"
              >
                Register New Entry
              </button>
            </div>
          ) : (
            <div className="overflow-x-auto rounded-xl border border-slate-100">
              <table className="w-full text-left text-sm min-w-[1050px]">
                <thead>
                  <tr className="bg-slate-50/70 border-b border-slate-200 text-slate-600 text-xs uppercase tracking-wider font-bold">
                    <th className="py-4 px-4">Pass No.</th>
                    <th className="py-4 px-4">Vehicle</th>
                    <th className="py-4 px-4">Driver</th>
                    <th className="py-4 px-4">Supplier / Challan</th>
                    <th className="py-4 px-4">Main Commodity (Max Qty)</th>
                    <th className="py-4 px-4">Bay</th>
                    <th className="py-4 px-4">In Time</th>
                    <th className="py-4 px-4 text-center">Inward &amp; Clearance Status</th>
                    <th className="py-4 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 bg-white">
                  {activeVehicles.map((v) => {
                    const inward = getGateEntryInwardStatus(v)
                    return (
                      <tr key={v._id} className="hover:bg-slate-50/80 transition-colors">
                        <td className="py-4 px-4 font-mono font-bold text-indigo-700">{v.passNumber}</td>
                        <td className="py-4 px-4">
                          <span className="font-mono font-bold text-slate-900 bg-slate-100 px-2.5 py-1 rounded-md border border-slate-200">
                            {v.vehicleNumber}
                          </span>
                          <span className="block text-xs text-slate-500 mt-1">{v.vehicleType}</span>
                        </td>
                        <td className="py-4 px-4">
                          <p className="font-bold text-slate-900">{v.driverName}</p>
                          <p className="text-xs text-slate-500 font-mono">{v.driverContact}</p>
                        </td>
                        <td className="py-4 px-4">
                          <p className="font-medium text-slate-800">{v.supplier}</p>
                          <p className="text-xs text-slate-500 font-mono">Ref: {v.challanNo}</p>
                        </td>
                        <td className="py-4 px-4">
                          {(() => {
                            const main = getMainMaterialProduct(v)
                            if (!main || (!main.name && main.qty === 0)) {
                              return <span className="text-slate-400 text-xs">—</span>
                            }
                            return (
                              <div className="space-y-1">
                                <div className="flex items-center gap-1.5 flex-wrap">
                                  <span className="font-semibold text-slate-900 text-xs leading-tight" title={main.name}>
                                    {main.name}
                                  </span>
                                  {main.otherCount > 0 && (
                                    <span className="text-[10px] font-bold px-1.5 py-0.5 bg-indigo-50 text-indigo-700 rounded-md border border-indigo-200 shrink-0">
                                      +{main.otherCount} more
                                    </span>
                                  )}
                                </div>
                                <div className="flex items-center gap-1.5 text-[11px] text-slate-500 font-mono">
                                  <span className="font-bold text-indigo-700 bg-indigo-50/80 px-2 py-0.5 rounded border border-indigo-100">
                                    {main.qty} {main.unit}
                                  </span>
                                  {main.sku && <span className="text-slate-400 text-[10px]">({main.sku})</span>}
                                </div>
                              </div>
                            )
                          })()}
                        </td>
                        <td className="py-4 px-4 text-xs font-semibold text-slate-700 bg-slate-50">{v.assignedBay}</td>
                        <td className="py-4 px-4 text-xs font-mono text-slate-500">{fmt(v.inTime)}</td>
                        <td className="py-4 px-4 text-center">
                          <div className="inline-flex flex-col items-center">
                            <span
                              className={`text-xs font-bold px-2.5 py-1 rounded-full border inline-flex items-center gap-1.5 ${inward.badgeClass}`}
                            >
                              {inward.stage === 'READY_FOR_OUT' ? (
                                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                              ) : inward.stage === 'PENDING_PUTAWAY' ? (
                                <Clock className="w-3.5 h-3.5 text-amber-600" />
                              ) : (
                                <AlertCircle className="w-3.5 h-3.5 text-rose-600" />
                              )}
                              <span>{inward.label}</span>
                            </span>

                            {inward.stage === 'PENDING_GRN' && (
                              <Link
                                to="/grn"
                                className="text-[10px] text-indigo-600 hover:text-indigo-800 font-bold hover:underline flex items-center gap-0.5 mt-1"
                              >
                                <span>Create GRN</span>
                                <ArrowUpRight className="w-3 h-3" />
                              </Link>
                            )}
                            {inward.stage === 'PENDING_PUTAWAY' && (
                              <Link
                                to="/put-away"
                                className="text-[10px] text-amber-700 hover:text-amber-900 font-bold hover:underline flex items-center gap-0.5 mt-1"
                              >
                                <span>Check-In Bins</span>
                                <ArrowUpRight className="w-3 h-3" />
                              </Link>
                            )}
                            {inward.stage === 'READY_FOR_OUT' && (
                              <span className="text-[10px] text-slate-500 font-mono mt-0.5">
                                {inward.grn?.grnNo || 'GRN Verified'}
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="py-4 px-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              type="button"
                              onClick={() => setActivePassModal(v)}
                              className="px-3 py-1.5 rounded-lg border border-slate-300 hover:bg-slate-100 text-slate-700 text-xs font-semibold cursor-pointer transition-colors"
                            >
                              Pass Slip
                            </button>
                            <button
                              type="button"
                              onClick={() => handleOpenGateOutModal(v)}
                              className={`px-3 py-1.5 rounded-lg text-xs font-bold cursor-pointer flex items-center gap-1.5 transition-colors shadow-xs ${
                                inward.canGateOut
                                  ? 'bg-rose-600 hover:bg-rose-700 text-white'
                                  : 'bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-300'
                              }`}
                              title={inward.canGateOut ? 'Clear Vehicle for Exit' : inward.reason}
                            >
                              {inward.canGateOut ? <LogOut className="w-3.5 h-3.5" /> : <Lock className="w-3.5 h-3.5 text-rose-500" />}
                              <span>Gate Out</span>
                            </button>
                          </div>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* TAB: GATE REGISTER (LOG) */}
      {activeTab === 'log' && (
        <div className="bg-white rounded-2xl p-5 sm:p-7 border border-slate-200 shadow-sm space-y-5">
          {/* Header & Export Toolbar */}
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-slate-100 pb-4">
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="text-lg font-bold text-slate-900">Complete Gate Inward &amp; Outward Audit Register</h3>
                <span className="text-[11px] font-semibold bg-indigo-50 text-indigo-700 border border-indigo-200/60 px-2.5 py-0.5 rounded-full">
                  {filteredLog.length} Records
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">Filter by date, timestamp, shift window, vehicle, or clearance status.</p>
            </div>

            {/* Quick Export Actions */}
            <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap">
              <button
                type="button"
                onClick={() => handleExportFilteredLog('excel')}
                className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200 text-xs font-bold transition cursor-pointer"
                title="Export Filtered Register to Excel (.xlsx)"
              >
                <FileSpreadsheet className="w-3.5 h-3.5" />
                <span>Export Excel</span>
              </button>

              <button
                type="button"
                onClick={() => handleExportFilteredLog('csv')}
                className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-blue-50 text-blue-700 hover:bg-blue-100 border border-blue-200 text-xs font-bold transition cursor-pointer"
                title="Export Filtered Register to CSV (.csv)"
              >
                <Download className="w-3.5 h-3.5" />
                <span>CSV</span>
              </button>

              <button
                type="button"
                onClick={() => handleExportFilteredLog('pdf')}
                className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-rose-50 text-rose-700 hover:bg-rose-100 border border-rose-200 text-xs font-bold transition cursor-pointer"
                title="Print / Save PDF"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Print PDF</span>
              </button>
            </div>
          </div>

          {/* Date & Time Filtering Toolbar */}
          <div className="p-4 bg-slate-50/75 rounded-2xl border border-slate-200/80 space-y-3.5 text-xs">
            {/* Top Filter Row: Presets & Shift Window */}
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 flex-wrap">
              {/* Date Presets */}
              <div className="flex items-center gap-1.5 flex-wrap">
                <span className="text-[11px] font-bold text-slate-500 mr-1 flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5 text-indigo-600" />
                  Date Scope:
                </span>
                {[
                  { id: 'All', label: 'All Records' },
                  { id: 'Today', label: 'Today' },
                  { id: 'Yesterday', label: 'Yesterday' },
                  { id: '7D', label: 'Last 7 Days' },
                  { id: '30D', label: 'Last 30 Days' },
                  { id: 'Custom', label: 'Custom Range' },
                ].map((p) => (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => applyDatePreset(p.id)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition cursor-pointer ${
                      dateFilterPreset === p.id
                        ? 'bg-indigo-600 text-white shadow-xs font-bold'
                        : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-100'
                    }`}
                  >
                    {p.label}
                  </button>
                ))}
              </div>

              {/* Time Shift Selector */}
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-bold text-slate-500 flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5 text-blue-600" />
                  Shift / Time Window:
                </span>
                <select
                  value={timeShift}
                  onChange={(e) => setTimeShift(e.target.value)}
                  className="px-2.5 py-1.5 border border-slate-300 rounded-xl text-xs bg-white font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                >
                  <option value="All">All Shifts (24 Hrs)</option>
                  <option value="Morning">Morning Shift (06:00 - 14:00)</option>
                  <option value="Evening">Evening Shift (14:00 - 22:00)</option>
                  <option value="Night">Night Shift (22:00 - 06:00)</option>
                </select>
              </div>
            </div>

            {/* Custom Date & Time Inputs (shown when not All) */}
            {dateFilterPreset !== 'All' && (
              <div className="p-3 bg-white rounded-xl border border-indigo-100 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 animate-in fade-in">
                <div>
                  <label className="block text-[10px] font-bold text-slate-600 mb-1">
                    From (Start Date &amp; Time)
                  </label>
                  <div className="flex items-center gap-1.5">
                    <input
                      type="date"
                      value={startDate}
                      onChange={(e) => {
                        setStartDate(e.target.value)
                        setDateFilterPreset('Custom')
                      }}
                      className="w-full bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                    />
                    <input
                      type="time"
                      value={startTime}
                      onChange={(e) => {
                        setStartTime(e.target.value)
                        setDateFilterPreset('Custom')
                      }}
                      className="w-24 bg-slate-50 border border-slate-200 rounded-lg px-2 py-1.5 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-600 mb-1">
                    To (End Date &amp; Time)
                  </label>
                  <div className="flex items-center gap-1.5">
                    <input
                      type="date"
                      value={endDate}
                      onChange={(e) => {
                        setEndDate(e.target.value)
                        setDateFilterPreset('Custom')
                      }}
                      className="w-full bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                    />
                    <input
                      type="time"
                      value={endTime}
                      onChange={(e) => {
                        setEndTime(e.target.value)
                        setDateFilterPreset('Custom')
                      }}
                      className="w-24 bg-slate-50 border border-slate-200 rounded-lg px-2 py-1.5 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-600 mb-1">
                    Filter Based On Timestamp
                  </label>
                  <select
                    value={filterTimestampField}
                    onChange={(e) => setFilterTimestampField(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs text-slate-800 font-semibold focus:outline-none"
                  >
                    <option value="inTime">Vehicle Arrival (In Time)</option>
                    <option value="outTime">Vehicle Exit (Out Time)</option>
                  </select>
                </div>

                <div className="flex items-end">
                  <button
                    type="button"
                    onClick={() => {
                      setDateFilterPreset('All')
                      setTimeShift('All')
                      setLogFilter('All')
                      setLogSearch('')
                      triggerToast('All date and time filters reset.')
                    }}
                    className="w-full px-3 py-1.5 rounded-lg border border-slate-200 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold transition cursor-pointer flex items-center justify-center gap-1.5"
                  >
                    <RotateCcw className="w-3.5 h-3.5 text-slate-500" />
                    <span>Reset All Filters</span>
                  </button>
                </div>
              </div>
            )}

            {/* Bottom Row: Search & Status Filter */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1">
              <div className="relative flex-1 max-w-md">
                <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
                <input
                  type="text"
                  value={logSearch}
                  onChange={(e) => setLogSearch(e.target.value)}
                  placeholder="Search vehicle, driver, supplier, challan, officer remark..."
                  className="w-full pl-9 pr-8 py-2 bg-white border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                />
                {logSearch && (
                  <button
                    type="button"
                    onClick={() => setLogSearch('')}
                    className="absolute right-2.5 top-2 text-slate-400 hover:text-slate-600"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              <div className="flex items-center gap-2">
                <span className="text-[11px] font-bold text-slate-500">Status:</span>
                <select
                  value={logFilter}
                  onChange={(e) => setLogFilter(e.target.value)}
                  className="px-3 py-2 border border-slate-200 rounded-xl text-xs bg-white text-slate-700 font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                >
                  <option value="All">All Statuses ({allEntries.length})</option>
                  <option value="Inside">Inside Only ({activeVehicles.length})</option>
                  <option value="Cleared">Cleared (Gate Out)</option>
                </select>

                {(dateFilterPreset !== 'All' || timeShift !== 'All' || logSearch || logFilter !== 'All') && (
                  <button
                    type="button"
                    onClick={() => {
                      setDateFilterPreset('All')
                      setTimeShift('All')
                      setLogFilter('All')
                      setLogSearch('')
                      triggerToast('Filters reset.')
                    }}
                    className="p-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-100 text-slate-600 transition cursor-pointer shrink-0"
                    title="Clear Filters"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>
          </div>

          <div className="overflow-x-auto rounded-xl border border-slate-100">
            <table className="w-full text-left text-sm min-w-[1100px]">
              <thead>
                <tr className="bg-slate-50/70 border-b border-slate-200 text-slate-600 text-xs uppercase tracking-wider font-bold">
                  <th className="py-4 px-4">Pass No.</th>
                  <th className="py-4 px-4">Vehicle</th>
                  <th className="py-4 px-4">Driver</th>
                  <th className="py-4 px-4">Supplier / Challan</th>
                  <th className="py-4 px-4">Main Commodity (Max Qty)</th>
                  <th className="py-4 px-4">Officer Inward Remark</th>
                  <th className="py-4 px-4">In Time</th>
                  <th className="py-4 px-4">Out Time &amp; Officer</th>
                  <th className="py-4 px-4 text-center">Status</th>
                  <th className="py-4 px-4 text-right">Gate Pass</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 bg-white">
                {filteredLog.length === 0 ? (
                  <tr>
                    <td colSpan="10" className="py-10 text-center text-slate-400">
                      No records found
                    </td>
                  </tr>
                ) : (
                  filteredLog.map((e) => (
                    <tr key={e._id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-4 px-4 font-mono font-bold text-indigo-700">{e.passNumber}</td>
                      <td className="py-4 px-4 font-mono font-bold text-slate-900">
                        <span className="bg-slate-100 px-2.5 py-1 rounded-md border border-slate-200">{e.vehicleNumber}</span>
                      </td>
                      <td className="py-4 px-4">
                        <p className="font-bold text-slate-900">{e.driverName}</p>
                        <p className="text-xs text-slate-500 font-mono">{e.driverContact}</p>
                      </td>
                      <td className="py-4 px-4">
                        <p className="text-slate-800 font-medium">{e.supplier}</p>
                        <p className="text-xs text-slate-500 font-mono">Challan: {e.challanNo}</p>
                      </td>
                      <td className="py-4 px-4">
                        {(() => {
                          const main = getMainMaterialProduct(e)
                          if (!main || (!main.name && main.qty === 0)) {
                            return <span className="text-slate-400 text-xs">—</span>
                          }
                          return (
                            <div className="space-y-1">
                              <div className="flex items-center gap-1.5 flex-wrap">
                                <span className="font-semibold text-slate-900 text-xs leading-tight" title={main.name}>
                                  {main.name}
                                </span>
                                {main.otherCount > 0 && (
                                  <span className="text-[10px] font-bold px-1.5 py-0.5 bg-indigo-50 text-indigo-700 rounded-md border border-indigo-200 shrink-0">
                                    +{main.otherCount} more
                                  </span>
                                )}
                              </div>
                              <div className="flex items-center gap-1.5 text-[11px] text-slate-500 font-mono">
                                <span className="font-bold text-indigo-700 bg-indigo-50/80 px-2 py-0.5 rounded border border-indigo-100">
                                  {main.qty} {main.unit}
                                </span>
                                {main.sku && <span className="text-slate-400 text-[10px]">({main.sku})</span>}
                              </div>
                            </div>
                          )
                        })()}
                      </td>
                      <td className="py-4 px-4 text-xs text-slate-600 max-w-[200px] truncate" title={e.officerRemark || e.remarks}>
                        {e.officerRemark || e.remarks || '—'}
                      </td>
                      <td className="py-4 px-4 font-mono text-slate-500 text-xs">{fmt(e.inTime)}</td>
                      <td className="py-4 px-4 font-mono text-xs">
                        {e.outTime ? (
                          <div>
                            <span className="text-slate-700 font-bold block">{fmt(e.outTime)}</span>
                            <span className="text-[10px] text-emerald-700 font-sans block">
                              By: {e.gateOutOfficerName || 'Security'} ({e.gateOutOfficerId || 'SEC-01'})
                            </span>
                            {e.gateOutRemark && (
                              <span className="text-[10px] text-slate-500 font-sans italic block truncate max-w-[150px]" title={e.gateOutRemark}>
                                {e.gateOutRemark}
                              </span>
                            )}
                          </div>
                        ) : (
                          <span className="text-amber-600 font-semibold bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                            On-site (Inside)
                          </span>
                        )}
                      </td>
                      <td className="py-4 px-4 text-center">
                        <span
                          className={`text-xs font-semibold px-2.5 py-1 rounded-full border ${
                            e.status === 'Gate Out / Cleared'
                              ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                              : 'bg-amber-50 text-amber-700 border-amber-200'
                          }`}
                        >
                          {e.status}
                        </span>
                      </td>
                      <td className="py-4 px-4 text-right">
                        <button
                          type="button"
                          onClick={() => setActivePassModal(e)}
                          className="px-3 py-1.5 rounded-lg border border-slate-300 hover:bg-slate-100 text-slate-700 text-xs font-semibold cursor-pointer inline-flex items-center gap-1.5 transition-colors"
                        >
                          <Printer className="w-3.5 h-3.5" /> View Slip
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 1. REGISTRATION SUCCESS CONFIRMATION MODAL */}
      {registrationSuccessModal && (
        <div className="fixed inset-0 bg-slate-900/60 z-50 flex items-center justify-center p-4 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-4 text-center">
            <div className="w-14 h-14 bg-emerald-100 text-emerald-600 rounded-2xl mx-auto flex items-center justify-center">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <div>
              <h3 className="text-lg font-extrabold text-slate-900">Gate Entry Registered Successfully!</h3>
              <p className="text-xs text-slate-500 mt-1">Vehicle check-in and bay allocation confirmed.</p>
            </div>
            <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 text-left text-xs space-y-1.5">
              <div className="flex justify-between">
                <span className="text-slate-500">Pass Token:</span>
                <strong className="font-mono text-indigo-700">{registrationSuccessModal.passNumber}</strong>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Vehicle Number:</span>
                <strong className="font-mono text-slate-900">{registrationSuccessModal.vehicleNumber}</strong>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Driver:</span>
                <span className="font-semibold text-slate-800">{registrationSuccessModal.driverName} ({registrationSuccessModal.driverContact})</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Assigned Bay:</span>
                <span className="font-bold text-slate-800">{registrationSuccessModal.assignedBay}</span>
              </div>
            </div>
            <div className="flex gap-2.5 pt-2">
              <button
                type="button"
                onClick={() => setRegistrationSuccessModal(null)}
                className="flex-1 py-2.5 rounded-xl border border-slate-300 text-slate-700 text-xs font-bold hover:bg-slate-50 cursor-pointer transition"
              >
                Close &amp; Register Next
              </button>
              <button
                type="button"
                onClick={() => {
                  const entry = registrationSuccessModal
                  setRegistrationSuccessModal(null)
                  setActivePassModal(entry)
                }}
                className="flex-1 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer shadow-sm transition"
              >
                <Printer className="w-4 h-4" /> Print Gate Pass
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 2. GATE OUT CONFIRMATION MODAL */}
      {gateOutConfirmModal && (
        <div className="fixed inset-0 bg-slate-900/60 z-50 flex items-center justify-center p-4 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center">
                  <LogOut className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-base text-slate-900">Confirm Vehicle Gate Out</h3>
                  <p className="text-xs text-slate-500">Record officer verification &amp; exit stamp</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setGateOutConfirmModal(null)}
                className="text-slate-400 hover:text-slate-700 p-1 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Inward Pipeline Verification Card */}
            {(() => {
              const inward = getGateEntryInwardStatus(gateOutConfirmModal)
              return (
                <div className="space-y-3">
                  {!inward.canGateOut ? (
                    <div className="bg-rose-50 border border-rose-200 rounded-xl p-3.5 space-y-2">
                      <div className="flex items-center gap-2 text-rose-800 font-bold text-xs">
                        <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
                        <span>Gate Out Blocked — Inward Checklist Incomplete</span>
                      </div>
                      <p className="text-xs text-rose-700 leading-relaxed font-medium">
                        {inward.reason}
                      </p>
                      <div className="pt-1 flex flex-wrap items-center gap-2">
                        {inward.stage === 'PENDING_GRN' && (
                          <Link
                            to="/grn"
                            className="px-3 py-1.5 bg-rose-600 hover:bg-rose-700 text-white rounded-lg text-xs font-bold transition flex items-center gap-1 shadow-xs"
                          >
                            <span>1. Create Goods Receiving (GRN)</span>
                            <ArrowUpRight className="w-3.5 h-3.5" />
                          </Link>
                        )}
                        {inward.stage === 'PENDING_PUTAWAY' && (
                          <Link
                            to="/put-away"
                            className="px-3 py-1.5 bg-amber-600 hover:bg-amber-700 text-white rounded-lg text-xs font-bold transition flex items-center gap-1 shadow-xs"
                          >
                            <span>2. Complete Put-Away Check-In ({inward.pendingItemsCount} items)</span>
                            <ArrowUpRight className="w-3.5 h-3.5" />
                          </Link>
                        )}
                      </div>
                    </div>
                  ) : (
                    <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-3 flex items-center gap-2.5 text-xs text-emerald-800 font-medium">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                      <span>✓ Inward Verified: GRN ({inward.grn?.grnNo}) and Put-Away Check-In are 100% completed. Ready for exit clearance.</span>
                    </div>
                  )}

                  <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 text-xs text-slate-800 space-y-1.5">
                    <div className="flex justify-between">
                      <span className="text-slate-500">Pass Number:</span>
                      <strong className="font-mono">{gateOutConfirmModal.passNumber}</strong>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Vehicle:</span>
                      <strong className="font-mono">{gateOutConfirmModal.vehicleNumber}</strong>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Driver:</span>
                      <span className="font-semibold">{gateOutConfirmModal.driverName}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Assigned Bay:</span>
                      <span>{gateOutConfirmModal.assignedBay}</span>
                    </div>
                  </div>

                  <div className="space-y-3 text-xs">
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block font-bold text-slate-700 mb-1">Gate Officer Name *</label>
                        <input
                          type="text"
                          required
                          value={gateOutOfficerName}
                          onChange={(e) => setGateOutOfficerName(e.target.value)}
                          className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                        />
                      </div>
                      <div>
                        <label className="block font-bold text-slate-700 mb-1">Officer Badge ID *</label>
                        <input
                          type="text"
                          required
                          value={gateOutOfficerId}
                          onChange={(e) => setGateOutOfficerId(e.target.value)}
                          className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-mono font-bold focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block font-bold text-slate-700 mb-1">
                        Gate Out Clearance Remarks <span className="text-rose-500">*</span>
                      </label>
                      <textarea
                        rows={2}
                        required
                        value={gateOutRemark}
                        onChange={(e) => setGateOutRemark(e.target.value)}
                        placeholder="Reason for clearance, empty load inspection, etc."
                        className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                      />
                    </div>

                    {!inward.canGateOut && (
                      <label className="flex items-center gap-2 p-2 rounded-xl bg-amber-50 border border-amber-200 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={forceBypassGateOut}
                          onChange={(e) => setForceBypassGateOut(e.target.checked)}
                          className="rounded border-amber-400 text-amber-600 focus:ring-amber-500"
                        />
                        <span className="text-[11px] font-bold text-amber-900">
                          Security Officer Manual Override (Emergency / Non-unloaded Exit)
                        </span>
                      </label>
                    )}
                  </div>

                  <div className="flex justify-end gap-2.5 pt-2 border-t border-slate-100">
                    <button
                      type="button"
                      onClick={() => setGateOutConfirmModal(null)}
                      className="px-4 py-2 border border-slate-300 rounded-xl text-xs font-semibold text-slate-700 hover:bg-slate-50 cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      disabled={!inward.canGateOut && !forceBypassGateOut}
                      onClick={handleConfirmGateOut}
                      className={`px-5 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-sm transition ${
                        inward.canGateOut || forceBypassGateOut
                          ? 'bg-rose-600 hover:bg-rose-700 text-white cursor-pointer'
                          : 'bg-slate-200 text-slate-400 cursor-not-allowed'
                      }`}
                    >
                      <LogOut className="w-4 h-4" /> Confirm Gate Out
                    </button>
                  </div>
                </div>
              )
            })()}
          </div>
        </div>
      )}

      {/* 3. GATE PASS SLIP PRINT MODAL (Compact 1:4 / A4 Card Format with Scannable QR & Officer Remarks) */}
      {activePassModal && (
        <div className="fixed inset-0 bg-slate-900/60 z-50 flex items-center justify-center p-4 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-md w-full max-h-[92dvh] overflow-y-auto shadow-2xl border border-slate-200 space-y-4">
            {/* Printable Pass Container with standard compact 1:4 voucher ratio */}
            <div id="printable-gate-entry-pass" className="p-4 sm:p-5 font-sans bg-white">
              {/* Header */}
              <div className="border-b-2 border-slate-900 pb-3 mb-3 text-center">
                <div className="flex items-center justify-center gap-2">
                  <div className="w-6 h-6 rounded bg-slate-900 text-white flex items-center justify-center text-xs font-black">
                    WH
                  </div>
                  <h2 className="text-sm font-black tracking-wider uppercase text-slate-900">
                    CENTRAL WAREHOUSE LOGISTICS
                  </h2>
                </div>
                <p className="text-[10px] font-bold text-slate-600 tracking-wider uppercase mt-0.5">
                  Official Inward Vehicle Entry Gate Pass
                </p>
              </div>

              {/* Pass Token & Scannable QR Row */}
              <div className="flex items-center justify-between p-3 bg-slate-100 rounded-xl border border-slate-300 mb-3">
                <div>
                  <span className="text-[9px] font-bold text-slate-500 uppercase block">Gate Pass Token</span>
                  <span className="text-base font-black text-indigo-800 font-mono block">
                    {activePassModal.passNumber}
                  </span>
                  <span className="text-[10px] text-slate-700 font-semibold block mt-0.5">
                    Bay: <strong>{activePassModal.assignedBay}</strong>
                  </span>
                </div>

                <div className="w-20 h-20 bg-white border border-slate-300 rounded-lg p-1 flex items-center justify-center shrink-0">
                  {passQrDataUrl ? (
                    <img src={passQrDataUrl} alt="Gate Pass QR" className="w-full h-full object-contain" />
                  ) : (
                    <QrCode className="w-12 h-12 text-slate-800" />
                  )}
                </div>
              </div>

              {/* Detail Grid */}
              <div className="grid grid-cols-2 gap-2 text-[11px] border border-slate-200 rounded-xl p-3 bg-slate-50/70 mb-3">
                <div>
                  <span className="text-slate-500 block text-[9px] uppercase font-bold">Vehicle No:</span>
                  <span className="font-mono font-bold text-slate-900">{activePassModal.vehicleNumber}</span>
                </div>
                <div>
                  <span className="text-slate-500 block text-[9px] uppercase font-bold">Vehicle Type:</span>
                  <span className="font-semibold text-slate-800">{activePassModal.vehicleType}</span>
                </div>
                <div>
                  <span className="text-slate-500 block text-[9px] uppercase font-bold">Driver Name:</span>
                  <span className="font-bold text-slate-900">{activePassModal.driverName}</span>
                </div>
                <div>
                  <span className="text-slate-500 block text-[9px] uppercase font-bold">Driver Phone:</span>
                  <span className="font-mono font-semibold text-slate-800">{activePassModal.driverContact}</span>
                </div>
                <div className="col-span-2 border-t border-slate-200 pt-1">
                  <span className="text-slate-500 block text-[9px] uppercase font-bold">Supplier:</span>
                  <span className="font-bold text-slate-900">{activePassModal.supplier}</span>
                </div>
                <div>
                  <span className="text-slate-500 block text-[9px] uppercase font-bold">Challan No:</span>
                  <span className="font-mono font-bold text-indigo-700">{activePassModal.challanNo}</span>
                </div>
                <div>
                  <span className="text-slate-500 block text-[9px] uppercase font-bold">PO No:</span>
                  <span className="font-mono font-bold text-indigo-700">{activePassModal.poNumber || 'PO-2026-AUTO'}</span>
                </div>
                <div>
                  <span className="text-slate-500 block text-[9px] uppercase font-bold">Inward Time:</span>
                  <span className="font-mono text-slate-700">{fmt(activePassModal.inTime)}</span>
                </div>
                <div>
                  <span className="text-slate-500 block text-[9px] uppercase font-bold">Status:</span>
                  <span className="font-bold text-amber-700">{activePassModal.status}</span>
                </div>
              </div>

              {/* Declared Materials */}
              {activePassModal.materialItems?.length > 0 && (
                <div className="bg-indigo-50/80 p-2.5 rounded-xl border border-indigo-200 mb-3 text-[11px]">
                  <span className="text-[10px] font-bold uppercase text-indigo-900 block mb-1">Declared Packages:</span>
                  {activePassModal.materialItems.map((m, i) => (
                    <div key={i} className="flex justify-between text-slate-800 font-medium">
                      <span>• {m.product}</span>
                      <span className="font-mono font-bold">{m.packageQty} {m.packagingUnit}</span>
                    </div>
                  ))}
                </div>
              )}

              {/* Gate Officer Remarks (MANDATORY DISPLAY) */}
              <div className="bg-amber-50 p-2.5 rounded-xl border border-amber-200 mb-3 text-[11px]">
                <span className="text-[10px] font-bold uppercase text-amber-900 block">Gate Officer Verification Remarks:</span>
                <p className="text-slate-800 italic mt-0.5 font-medium">
                  "{activePassModal.officerRemark || activePassModal.remarks || 'Verified & Allowed Entry'}"
                </p>
              </div>

              {/* Gate Out Metadata (if cleared) */}
              {activePassModal.outTime && (
                <div className="bg-emerald-50 p-2.5 rounded-xl border border-emerald-200 mb-3 text-[11px]">
                  <span className="text-[10px] font-bold uppercase text-emerald-900 block">Gate Out Exit Audit:</span>
                  <p className="text-slate-800">
                    Exit Time: <strong className="font-mono">{fmt(activePassModal.outTime)}</strong>
                  </p>
                  <p className="text-slate-800">
                    Cleared By: <strong>{activePassModal.gateOutOfficerName || 'Security Officer'}</strong> ({activePassModal.gateOutOfficerId || 'SEC-01'})
                  </p>
                  {activePassModal.gateOutRemark && (
                    <p className="text-slate-700 italic mt-0.5">Remark: "{activePassModal.gateOutRemark}"</p>
                  )}
                </div>
              )}

              {/* Footer Signatures */}
              <div className="border-t border-dashed border-slate-400 pt-2 grid grid-cols-2 gap-3 text-[10px] text-center text-slate-600">
                <div className="border-t border-slate-300 pt-1 mt-3">
                  <span className="font-bold block">Gate Security Officer</span>
                  <span className="text-[9px] text-slate-400">Inward Stamp &amp; Sign</span>
                </div>
                <div className="border-t border-slate-300 pt-1 mt-3">
                  <span className="font-bold block">Unloading Bay Supervisor</span>
                  <span className="text-[9px] text-slate-400">Handover Acknowledgment</span>
                </div>
              </div>
            </div>

            {/* Modal Controls */}
            <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-end gap-2.5">
              <button
                type="button"
                onClick={() => setActivePassModal(null)}
                className="px-4 py-2 border border-slate-300 rounded-xl text-xs font-semibold text-slate-700 hover:bg-white cursor-pointer"
              >
                Close
              </button>
              <button
                type="button"
                onClick={() => printSpecificElement('#printable-gate-entry-pass', `Gate Pass - ${activePassModal.passNumber}`)}
                className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-sm"
              >
                <Printer className="w-4 h-4" /> Print Gate Pass (1:4)
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
