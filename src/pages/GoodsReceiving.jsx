import { useState, useMemo, useRef, useEffect } from 'react'
import { printSpecificElement } from '../utils/printHelper'
import {
  Package,
  CheckCircle2,
  Clock,
  AlertTriangle,
  X,
  Plus,
  Download,
  Search,
  Printer,
  ChevronDown,
  Check,
  Building2,
  FileText,
  Truck,
  QrCode,
  Layers,
  Trash2,
  Boxes,
  Lock,
} from 'lucide-react'
import { apiRequest } from '../services/api'

// Custom Select Component to prevent black dropdown flicker
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

const STATUS_OPTIONS = [
  { value: 'Completed', label: 'Completed (Verified & Cleared)' },
  { value: 'In Process', label: 'In Process (Quality Inspection)' },
  { value: 'Pending', label: 'Pending (Unloading Bay Verification)' },
  { value: 'Rejected', label: 'Rejected (Quality Defect / Hold)' },
]

export default function GoodsReceiving() {
  const [activeTab, setActiveTab] = useState('all') // 'all', 'completed', 'in_process', 'pending', 'rejected'
  const [searchQuery, setSearchQuery] = useState('')
  const [showAddModal, setShowAddModal] = useState(false)
  const [showPrintModal, setShowPrintModal] = useState(false)
  const [toastMessage, setToastMessage] = useState(null)

  // Real-time Commercial Warehouse Inward GRN Registry
  const [grnList, setGrnList] = useState([])
  const [products, setProducts] = useState([])
  const [shades, setShades] = useState([])
  const [gateEntries, setGateEntries] = useState([])
  const [loading, setLoading] = useState(true)

  const [selectedGrn, setSelectedGrn] = useState(null)

  // Fetch initial data
  const loadData = async () => {
    try {
      setLoading(true)
      const [grnRes, prodRes, shadeRes, gateRes] = await Promise.allSettled([
        apiRequest('/grn'),
        apiRequest('/product'),
        apiRequest('/shade'),
        apiRequest('/gate-entry'),
      ])

      if (grnRes.status === 'fulfilled' && Array.isArray(grnRes.value)) {
        setGrnList(grnRes.value)
        if (grnRes.value.length > 0 && !selectedGrn) {
          setSelectedGrn(grnRes.value[0])
        }
      }
      if (prodRes.status === 'fulfilled' && Array.isArray(prodRes.value)) {
        setProducts(prodRes.value)
      }
      if (shadeRes.status === 'fulfilled' && Array.isArray(shadeRes.value)) {
        setShades(shadeRes.value)
      }
      if (gateRes.status === 'fulfilled' && Array.isArray(gateRes.value)) {
        setGateEntries(gateRes.value)
      }
    } catch {
      triggerToast('Error loading GRN records')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [])

  // Dynamic Shades options
  const shadeOptions = useMemo(() => {
    if (shades && shades.length > 0) {
      return shades.map((s) => ({
        value: `${s.code} (${s.name})`,
        label: `${s.code} - ${s.name} (${s.type || 'Warehouse'})`,
      }))
    }
    return [
      { value: 'SH-01 (Shade 1: Grains & Bulk Pulses)', label: 'SH-01 - Shade 1: Grains & Bulk Pulses' },
      { value: 'SH-02 (Shade 2: Edible Oils & Liquids)', label: 'SH-02 - Shade 2: Edible Oils & Liquids' },
      { value: 'SH-03 (Shade 3: FMCG & Packaged Foods)', label: 'SH-03 - Shade 3: FMCG & Packaged Foods' },
      { value: 'SH-04 (Shade 4: Packaging & Materials)', label: 'SH-04 - Shade 4: Packaging & Materials' },
      { value: 'SH-05 (Shade 5: Chemicals & Hygiene)', label: 'SH-05 - Shade 5: Chemicals & Hygiene' },
      { value: 'SH-06 (Shade 6: Spares & General Hardware)', label: 'SH-06 - Shade 6: Spares & General Hardware' },
    ]
  }, [shades])

  // Dynamic Empty GRN Item Helper
  const EMPTY_GRN_ITEM = () => ({
    id: Date.now() + Math.random(),
    productId: '',
    productName: '',
    sku: '',
    packageQty: '1',
    packagingUnit: 'Bags',
    packSize: 1,
    totalBaseQty: 0,
    baseUnit: 'Kg',
    batchNo: `BTH-${Math.floor(1000 + Math.random() * 9000)}`,
    mfgDate: '',
    expiryDate: '',
    remarks: '',
  })

  // New GRN Form State
  const initialNewGrn = {
    selectedGatePassNo: '',
    gateEntryId: null,
    poNo: '',
    supplier: '',
    vehicleNo: '',
    shade: shadeOptions[0]?.value || 'SH-01 (Shade 1: Grains & Bulk Pulses)',
    status: 'Completed',
    receivedBy: 'Warehouse Manager',
    remarks: 'Received and verified at Inward Receiving Terminal',
    materials: [EMPTY_GRN_ITEM()],
  }
  const [newGrn, setNewGrn] = useState(initialNewGrn)
  const [grnSuccessModal, setGrnSuccessModal] = useState(null)
  const [grnQrDataUrl, setGrnQrDataUrl] = useState('')

  // Toast trigger
  const triggerToast = (msg) => {
    setToastMessage(msg)
    setTimeout(() => setToastMessage(null), 3500)
  }

  // Filtered GRNs
  const filteredGrn = useMemo(() => {
    return grnList.filter((item) => {
      // Tab filter
      if (activeTab === 'completed' && item.status !== 'Completed') return false
      if (activeTab === 'in_process' && item.status !== 'In Process') return false
      if (activeTab === 'pending' && item.status !== 'Pending') return false
      if (activeTab === 'rejected' && item.status !== 'Rejected') return false

      // Search filter
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase()
        return (
          (item.grnNo && item.grnNo.toLowerCase().includes(q)) ||
          (item.poNo && item.poNo.toLowerCase().includes(q)) ||
          (item.supplier && item.supplier.toLowerCase().includes(q)) ||
          (item.vehicleNo && item.vehicleNo.toLowerCase().includes(q)) ||
          (item.receivedBy && item.receivedBy.toLowerCase().includes(q)) ||
          (item.shade && item.shade.toLowerCase().includes(q))
        )
      }
      return true
    })
  }, [grnList, activeTab, searchQuery])

  // Generate QR for Selected GRN
  useEffect(() => {
    if (selectedGrn) {
      const payload = JSON.stringify({
        type: 'WMS_GRN',
        grnNo: selectedGrn.grnNo,
        poNo: selectedGrn.poNo,
        supplier: selectedGrn.supplier,
        vehicleNo: selectedGrn.vehicleNo,
        shade: selectedGrn.shade,
        itemsCount: selectedGrn.itemsCount,
        status: selectedGrn.status,
        date: selectedGrn.createdAt || selectedGrn.dateTime,
      })
      QRCode.toDataURL(payload, { width: 140, margin: 1 })
        .then(setGrnQrDataUrl)
        .catch(() => setGrnQrDataUrl(''))
    }
  }, [selectedGrn])

  // Multi-item management handlers for GRN Modal
  const handleAddGrnItem = () => {
    setNewGrn((prev) => ({
      ...prev,
      materials: [...prev.materials, EMPTY_GRN_ITEM()],
    }))
  }

  const handleRemoveGrnItem = (id) => {
    setNewGrn((prev) => {
      if (prev.materials.length === 1) return prev
      return {
        ...prev,
        materials: prev.materials.filter((m) => m.id !== id),
      }
    })
  }

  const handleGrnItemChange = (id, field, value) => {
    setNewGrn((prev) => ({
      ...prev,
      materials: prev.materials.map((item) => {
        if (item.id !== id) return item
        const updated = { ...item, [field]: value }

        if (field === 'productId') {
          const prod = products.find((p) => p._id === value)
          if (prod) {
            updated.productId = prod._id
            updated.productName = prod.name
            updated.sku = prod.sku
            updated.packagingUnit = prod.outerPackaging || 'Bags'
            updated.packSize = prod.packSize || 1
            updated.baseUnit = prod.baseUnit || 'Kg'
            const qty = Number(updated.packageQty) || 1
            updated.totalBaseQty = qty * updated.packSize
          }
        }

        if (field === 'packageQty') {
          const qty = Math.max(1, Number(value) || 1)
          updated.packageQty = String(qty)
          updated.totalBaseQty = qty * (updated.packSize || 1)
        }

        return updated
      }),
    }))
  }

  // Auto-fill ALL items from Gate Entry
  const handleSelectGateEntry = (gatePassNo) => {
    const entry = gateEntries.find((g) => g.passNumber === gatePassNo)
    if (entry) {
      let populatedMaterials = []

      if (entry.materialItems && entry.materialItems.length > 0) {
        populatedMaterials = entry.materialItems.map((item, idx) => {
          const prod = products.find(
            (p) =>
              (item.sku && p.sku === item.sku) ||
              p.sku === item.product ||
              p.name?.toLowerCase() === item.product?.toLowerCase()
          )

          const qty = Number(item.packageQty) || 1
          const packSize = prod?.packSize || 1
          const totalBase = qty * packSize

          return {
            id: Date.now() + idx + Math.random(),
            productId: prod ? prod._id : '',
            productName: prod ? prod.name : (item.product || 'Consignment Material'),
            sku: prod ? prod.sku : (item.sku || `SKU-${idx + 1}`),
            packageQty: String(qty),
            packagingUnit: prod ? (prod.outerPackaging || 'Bags') : (item.packagingUnit || 'Bags'),
            packSize: packSize,
            totalBaseQty: totalBase,
            baseUnit: prod ? (prod.baseUnit || 'Kg') : 'Kg',
            batchNo: `BTH-${Date.now().toString().slice(-4)}${idx + 1}`,
            mfgDate: '',
            expiryDate: '',
            remarks: item.remarks || '',
          }
        })
      }

      if (populatedMaterials.length === 0) {
        populatedMaterials = [EMPTY_GRN_ITEM()]
      }

      // Match shade from entry.assignedBay
      let matchedShade = newGrn.shade
      if (entry.assignedBay) {
        const foundShade = shadeOptions.find((s) => {
          const shadeCodeMatch = entry.assignedBay.match(/SH-0[1-6]/i)
          if (shadeCodeMatch && s.value.toLowerCase().includes(shadeCodeMatch[0].toLowerCase())) return true
          const bayNum = entry.assignedBay.match(/(?:Bay|Shade)\s*([1-6])/i)
          if (bayNum && s.value.includes(`SH-0${bayNum[1]}`)) return true
          return false
        })
        if (foundShade) matchedShade = foundShade.value
      }

      setNewGrn((prev) => ({
        ...prev,
        selectedGatePassNo: gatePassNo,
        gateEntryId: entry._id,
        vehicleNo: entry.vehicleNumber || prev.vehicleNo,
        supplier: entry.supplier || prev.supplier,
        poNo: entry.poNumber || entry.challanNo || prev.poNo,
        shade: matchedShade,
        materials: populatedMaterials,
      }))
      triggerToast(`Successfully loaded all ${populatedMaterials.length} items from Gate Pass ${entry.passNumber}!`)
    }
  }

  // Create GRN
  const handleCreateGrn = async (e) => {
    e.preventDefault()
    if (!newGrn.poNo.trim() || !newGrn.supplier.trim() || !newGrn.vehicleNo.trim()) {
      triggerToast('PO Number, Supplier Name and Vehicle Number are required!')
      return
    }

    if (!newGrn.materials || newGrn.materials.length === 0) {
      triggerToast('At least 1 material item is required!')
      return
    }

    const materialsPayload = newGrn.materials.map((m, idx) => {
      const prod = products.find((p) => p._id === m.productId || p.sku === m.sku)
      const qtyNum = Math.max(1, Number(m.packageQty) || 1)
      const packRatio = prod?.packSize || m.packSize || 1
      const totalBase = qtyNum * packRatio

      return {
        productId: prod?._id || (m.productId ? m.productId : null),
        productName: prod?.name || m.productName || 'General Consignment Material',
        sku: prod?.sku || m.sku || `SKU-${idx + 1}`,
        packageQty: qtyNum,
        packagingUnit: prod?.outerPackaging || m.packagingUnit || 'Bags',
        packSize: packRatio,
        totalBaseQty: totalBase,
        baseUnit: prod?.baseUnit || m.baseUnit || 'Kg',
        batchNo: m.batchNo?.trim() || `BTH-${Date.now().toString().slice(-4)}${idx + 1}`,
        mfgDate: m.mfgDate || '',
        expiryDate: m.expiryDate || '',
        remarks: m.remarks || '',
      }
    })

    const totalPackages = materialsPayload.reduce((acc, curr) => acc + curr.packageQty, 0)
    const totalQtyStr = `${totalPackages} Packages (${materialsPayload.length} Product Lines)`

    const payload = {
      poNo: newGrn.poNo.trim().toUpperCase(),
      supplier: newGrn.supplier.trim(),
      vehicleNo: newGrn.vehicleNo.trim().toUpperCase(),
      gateEntryId: newGrn.gateEntryId || null,
      shade: newGrn.shade,
      itemsCount: materialsPayload.length,
      totalQty: totalQtyStr,
      status: newGrn.status,
      receivedBy: newGrn.receivedBy.trim() || 'Warehouse Officer',
      remarks: newGrn.remarks.trim() || 'Received and verified at Inward Receiving Terminal',
      materials: materialsPayload,
    }

    try {
      const created = await apiRequest('/grn', {
        method: 'POST',
        body: JSON.stringify(payload),
      })
      setGrnList((prev) => [created, ...prev])
      setSelectedGrn(created)
      setShowAddModal(false)
      setGrnSuccessModal(created)
      triggerToast(`GRN ${created.grnNo} registered & stock updated!`)
      setNewGrn(initialNewGrn)
    } catch (err) {
      triggerToast(err.message || 'Failed to create GRN', 'error')
    }
  }

  // Quick Status update
  const handleStatusUpdate = async (id, newStatus) => {
    try {
      const updated = await apiRequest(`/grn/${id}/status`, {
        method: 'PATCH',
        body: JSON.stringify({ status: newStatus }),
      })
      setGrnList((prev) => prev.map((g) => (g._id === id ? updated : g)))
      if (selectedGrn?._id === id) {
        setSelectedGrn(updated)
      }
      triggerToast(`GRN status updated to ${newStatus}`)
    } catch (err) {
      triggerToast(err.message || 'Failed to update status')
    }
  }

  // Delete GRN
  const handleDeleteGrn = async (id, grnNo) => {
    try {
      await apiRequest(`/grn/${id}`, { method: 'DELETE' })
      setGrnList((prev) => prev.filter((g) => g._id !== id))
      triggerToast(`GRN ${grnNo} deleted.`)
    } catch {
      triggerToast('Failed to delete GRN')
    }
  }

  // Export CSV
  const handleExportCSV = () => {
    const headers = [
      'GRN No',
      'Date & Time',
      'PO Number',
      'Supplier / Party',
      'Vehicle No',
      'Assigned Shade',
      'Total Quantity',
      'Status',
      'Received By',
    ]
    const rows = grnList.map((g) => [
      g.grnNo,
      `"${new Date(g.createdAt || g.dateTime || Date.now()).toLocaleString()}"`,
      `"${g.poNo}"`,
      `"${g.supplier}"`,
      `"${g.vehicleNo}"`,
      `"${g.shade}"`,
      `"${g.totalQty}"`,
      g.status,
      `"${g.receivedBy}"`,
    ])
    const csvContent =
      'data:text/csv;charset=utf-8,' +
      [headers.join(','), ...rows.map((e) => e.join(','))].join('\n')
    const encodedUri = encodeURI(csvContent)
    const link = document.createElement('a')
    link.setAttribute('href', encodedUri)
    link.setAttribute('download', 'Warehouse_GRN_Register.csv')
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    triggerToast('GRN register exported to CSV successfully.')
  }

  // Status Badge Styling
  const getStatusBadge = (status) => {
    switch (status) {
      case 'Completed':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200'
      case 'In Process':
        return 'bg-blue-50 text-blue-700 border-blue-200'
      case 'Pending':
        return 'bg-amber-50 text-amber-700 border-amber-200'
      case 'Rejected':
        return 'bg-rose-50 text-rose-700 border-rose-200'
      default:
        return 'bg-slate-50 text-slate-700 border-slate-200'
    }
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

      {/* 1. Header Banner */}
      <div className="bg-white rounded-2xl p-4 sm:p-6 border border-slate-200 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-start gap-3 sm:gap-4 min-w-0 flex-1">
          <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-indigo-50 border border-indigo-100 text-indigo-600 flex items-center justify-center shrink-0 shadow-xs mt-0.5">
            <Package className="w-5 h-5 sm:w-6 sm:h-6" />
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2 mb-1">
              <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 shrink-0">
                ● Live Database Sync
              </span>
            </div>
            <h1 className="text-lg sm:text-xl lg:text-2xl font-bold text-slate-900 leading-tight">
              Goods Receiving Note (GRN) Master
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 font-medium mt-1 leading-relaxed">
              Record, inspect, and verify incoming vendor consignments with automatic stock update into physical warehouse shades
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2.5 flex-wrap shrink-0">
          <button
            type="button"
            onClick={handleExportCSV}
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
            <span>Create New GRN</span>
          </button>
        </div>
      </div>

      {/* 2. Dynamic KPI Stat Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {/* Total GRN */}
        <div className="bg-white rounded-2xl p-4.5 border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Total Inward Receipts</p>
            <p className="text-2xl font-extrabold text-slate-900 mt-1">{grnList.length}</p>
            <p className="text-xs text-slate-500 font-medium mt-0.5">Stored in MongoDB</p>
          </div>
          <div className="w-11 h-11 rounded-xl bg-indigo-50 border border-indigo-100 text-indigo-600 flex items-center justify-center shrink-0">
            <Package className="w-5 h-5" />
          </div>
        </div>

        {/* Completed */}
        <div className="bg-white rounded-2xl p-4.5 border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Verified &amp; Stock Added</p>
            <p className="text-2xl font-extrabold text-emerald-600 mt-1">
              {grnList.filter((g) => g.status === 'Completed').length}
            </p>
            <p className="text-xs text-emerald-600 font-semibold mt-0.5">Stock Ready for Racking</p>
          </div>
          <div className="w-11 h-11 rounded-xl bg-emerald-50 border border-emerald-100 text-emerald-600 flex items-center justify-center shrink-0">
            <CheckCircle2 className="w-5 h-5" />
          </div>
        </div>

        {/* In Process */}
        <div className="bg-white rounded-2xl p-4.5 border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Under QC Inspection</p>
            <p className="text-2xl font-extrabold text-blue-600 mt-1">
              {grnList.filter((g) => g.status === 'In Process').length}
            </p>
            <p className="text-xs text-blue-600 font-semibold mt-0.5">Testing &amp; Sampling</p>
          </div>
          <div className="w-11 h-11 rounded-xl bg-blue-50 border border-blue-100 text-blue-600 flex items-center justify-center shrink-0">
            <Clock className="w-5 h-5" />
          </div>
        </div>

        {/* Pending & Rejected */}
        <div className="bg-white rounded-2xl p-4.5 border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Pending / Rejected</p>
            <p className="text-2xl font-extrabold text-amber-600 mt-1">
              {grnList.filter((g) => g.status === 'Pending' || g.status === 'Rejected').length}
            </p>
            <p className="text-xs text-amber-600 font-semibold mt-0.5">Hold or Rejected Items</p>
          </div>
          <div className="w-11 h-11 rounded-xl bg-amber-50 border border-amber-100 text-amber-600 flex items-center justify-center shrink-0">
            <AlertTriangle className="w-5 h-5" />
          </div>
        </div>
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
            All GRN Receipts ({grnList.length})
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('completed')}
            className={`px-3.5 py-2 rounded-lg transition whitespace-nowrap cursor-pointer ${
              activeTab === 'completed'
                ? 'bg-indigo-600 text-white shadow-xs font-bold'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/70'
            }`}
          >
            Completed ({grnList.filter((g) => g.status === 'Completed').length})
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('in_process')}
            className={`px-3.5 py-2 rounded-lg transition whitespace-nowrap cursor-pointer ${
              activeTab === 'in_process'
                ? 'bg-indigo-600 text-white shadow-xs font-bold'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/70'
            }`}
          >
            In Process ({grnList.filter((g) => g.status === 'In Process').length})
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('pending')}
            className={`px-3.5 py-2 rounded-lg transition whitespace-nowrap cursor-pointer ${
              activeTab === 'pending'
                ? 'bg-indigo-600 text-white shadow-xs font-bold'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/70'
            }`}
          >
            Pending ({grnList.filter((g) => g.status === 'Pending').length})
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('rejected')}
            className={`px-3.5 py-2 rounded-lg transition whitespace-nowrap cursor-pointer ${
              activeTab === 'rejected'
                ? 'bg-indigo-600 text-white shadow-xs font-bold'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/70'
            }`}
          >
            Rejected ({grnList.filter((g) => g.status === 'Rejected').length})
          </button>
        </div>

        {/* Live Search */}
        <div className="relative flex-1 md:max-w-xs">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3 pointer-events-none" />
          <input
            type="text"
            placeholder="Search GRN, PO, supplier, vehicle, shade..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-50 border border-slate-300 rounded-xl pl-9 pr-3 py-2 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 focus:bg-white"
          />
        </div>
      </div>

      {/* 4. Full-Width Spacious GRN Table */}
      <div className="bg-white rounded-2xl p-4 sm:p-6 border border-slate-200 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 sm:gap-3 border-b border-slate-100 pb-3">
          <div className="min-w-0">
            <h3 className="text-sm sm:text-base font-bold text-slate-900 flex flex-wrap items-center gap-2">
              <span>Goods Receiving Note (GRN) Inward Register</span>
              <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 shrink-0">
                {filteredGrn.length} of {grnList.length}
              </span>
            </h3>
            <p className="text-xs text-slate-500 mt-0.5 leading-relaxed">
              Verified goods receipts with purchase order tracking and warehouse storage allocations
            </p>
          </div>

          <div className="text-xs font-semibold text-slate-500 bg-slate-50 border border-slate-200 px-3 py-1.5 rounded-lg shrink-0 self-start sm:self-auto">
            Dock: Central Inward Receiving
          </div>
        </div>

        <div className="overflow-x-auto rounded-xl border border-slate-200">
          <table className="w-full text-left text-sm min-w-[1100px]">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-200 text-slate-600 text-xs uppercase tracking-wider font-bold">
                <th className="py-3.5 px-3 w-10 text-center">#</th>
                <th className="py-3.5 px-4 w-32">GRN Number</th>
                <th className="py-3.5 px-4 w-40">Date &amp; Time</th>
                <th className="py-3.5 px-4 min-w-[140px]">PO Reference</th>
                <th className="py-3.5 px-4 min-w-[190px]">Supplier / Vendor</th>
                <th className="py-3.5 px-4 min-w-[140px]">Vehicle Reg.</th>
                <th className="py-3.5 px-4 min-w-[180px]">Assigned Shade</th>
                <th className="py-3.5 px-4 w-36">Quantity Received</th>
                <th className="py-3.5 px-4 text-center w-28">Status</th>
                <th className="py-3.5 px-5 text-right w-44">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 bg-white">
              {loading ? (
                <tr>
                  <td colSpan="10" className="py-10 text-center text-slate-400 text-sm">
                    Loading GRN records from server...
                  </td>
                </tr>
              ) : filteredGrn.length === 0 ? (
                <tr>
                  <td colSpan="10" className="py-10 text-center text-slate-400 text-sm">
                    No GRN receipts match the selected filter or search criteria.
                  </td>
                </tr>
              ) : (
                filteredGrn.map((grn, idx) => (
                  <tr key={grn._id || grn.id || idx} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3.5 px-3 text-center text-slate-400 font-mono text-xs font-semibold">
                      {idx + 1}
                    </td>
                    <td className="py-3.5 px-4 font-mono font-bold text-indigo-700 whitespace-nowrap">
                      {grn.grnNo}
                    </td>
                    <td className="py-3.5 px-4 text-xs text-slate-600 whitespace-nowrap">
                      {new Date(grn.createdAt || grn.dateTime || Date.now()).toLocaleString('en-IN', {
                        day: '2-digit',
                        month: 'short',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </td>
                    <td className="py-3.5 px-4 font-mono font-bold text-slate-900 text-xs whitespace-nowrap">
                      {grn.poNo}
                    </td>
                    <td className="py-3.5 px-4 text-slate-700">
                      <p className="font-semibold text-slate-900 truncate max-w-[190px]">{grn.supplier}</p>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="font-mono font-bold text-slate-900 bg-slate-100 px-2 py-0.5 rounded-md border border-slate-200 text-xs whitespace-nowrap shadow-2xs">
                        {grn.vehicleNo}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-xs font-semibold text-slate-800 whitespace-nowrap">
                      {grn.shade}
                    </td>
                    <td className="py-3.5 px-4 text-xs whitespace-nowrap font-medium text-slate-900">
                      <span>{grn.totalQty || `${grn.itemsCount} Items`}</span>
                      {grn.materials && grn.materials.length > 0 && (
                        <span className="text-slate-400 block text-[11px] truncate max-w-[160px]">
                          {grn.materials[0].productName || grn.materials[0].name}
                        </span>
                      )}
                    </td>
                    <td className="py-3.5 px-4 text-center whitespace-nowrap">
                      <span
                        className={`text-xs font-semibold px-2.5 py-1 rounded-full border ${getStatusBadge(
                          grn.status
                        )}`}
                      >
                        {grn.status}
                      </span>
                    </td>
                    <td className="py-3.5 px-5 text-right whitespace-nowrap">
                      <div className="flex items-center justify-end gap-1.5">
                        {grn.status === 'In Process' && (
                          <button
                            type="button"
                            onClick={() => handleStatusUpdate(grn._id, 'Completed')}
                            className="px-2.5 py-1 rounded-lg bg-emerald-50 hover:bg-emerald-600 text-emerald-700 hover:text-white border border-emerald-200 hover:border-emerald-600 text-xs font-bold transition cursor-pointer shadow-2xs flex items-center gap-1"
                            title="Mark Quality Cleared & Add Stock"
                          >
                            <Check className="w-3 h-3" />
                            <span>Verify</span>
                          </button>
                        )}

                        <button
                          type="button"
                          onClick={() => {
                            setSelectedGrn(grn)
                            setShowPrintModal(true)
                          }}
                          className="px-2.5 py-1 rounded-lg bg-indigo-50 hover:bg-indigo-600 text-indigo-700 hover:text-white border border-indigo-200 hover:border-indigo-600 text-xs font-bold transition cursor-pointer shadow-2xs flex items-center gap-1"
                          title="Print Official GRN Slip"
                        >
                          <Printer className="w-3 h-3" />
                          <span>Slip</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => handleDeleteGrn(grn._id, grn.grnNo)}
                          className="p-1.5 rounded-lg bg-slate-50 hover:bg-rose-600 text-slate-400 hover:text-white border border-slate-200 hover:border-rose-600 transition cursor-pointer shadow-2xs"
                          title="Delete GRN"
                        >
                          <Trash2 className="w-3 h-3" />
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

      {/* ========================================================= */}
      {/* CREATE NEW GRN MODAL                                      */}
      {/* ========================================================= */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 animate-fade-in">
          <div className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full max-h-[90dvh] overflow-y-auto p-4 sm:p-6 space-y-5 animate-scale-in border border-slate-200">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b pb-4 border-slate-100">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-indigo-50 border border-indigo-100 text-indigo-600 flex items-center justify-center font-bold">
                  <Package className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">Create New GRN Receipt</h3>
                  <p className="text-xs text-slate-500">Record inward goods receipt voucher against PO and update inventory</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowAddModal(false)}
                className="text-slate-400 hover:text-slate-700 p-1.5 rounded-lg hover:bg-slate-100 cursor-pointer transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Quick autofill from Gate Pass */}
            {gateEntries.length > 0 && (
              <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <span className="text-xs font-semibold text-slate-600 flex items-center gap-1.5">
                  <Truck className="w-3.5 h-3.5 text-indigo-600" />
                  Auto-fill from Active Gate Pass:
                </span>
                <select
                  value={newGrn.selectedGatePassNo || ''}
                  onChange={(e) => {
                    if (e.target.value) handleSelectGateEntry(e.target.value)
                  }}
                  className="bg-white border border-slate-300 rounded-lg px-2.5 py-1 text-xs text-slate-800 font-medium cursor-pointer"
                >
                  <option value="">-- Choose Gate Pass --</option>
                  {gateEntries.map((ge) => (
                    <option key={ge._id} value={ge.passNumber}>
                      {ge.passNumber} - {ge.vehicleNumber} ({ge.supplier})
                    </option>
                  ))}
                </select>
              </div>
            )}

            <form onSubmit={handleCreateGrn} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5 flex items-center justify-between">
                    <span>
                      PO / Indent Reference No. <span className="text-rose-500">*</span>
                    </span>
                    {newGrn.selectedGatePassNo && (
                      <span className="text-[10px] font-bold text-slate-500 flex items-center gap-1 bg-slate-100 px-1.5 py-0.5 rounded border border-slate-200">
                        <Lock className="w-2.5 h-2.5 text-slate-400" /> Locked from Gate Pass
                      </span>
                    )}
                  </label>
                  <input
                    type="text"
                    required
                    readOnly={Boolean(newGrn.selectedGatePassNo)}
                    placeholder="e.g. PO-2026-4587"
                    value={newGrn.poNo}
                    onChange={(e) => setNewGrn({ ...newGrn, poNo: e.target.value.toUpperCase() })}
                    className={`w-full rounded-xl px-3.5 py-2.5 text-xs font-mono font-bold focus:outline-none transition ${
                      newGrn.selectedGatePassNo
                        ? 'bg-slate-100 text-slate-700 border border-slate-200 cursor-not-allowed select-none'
                        : 'bg-white border border-slate-300 text-slate-800 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500'
                    }`}
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5 flex items-center justify-between">
                    <span>
                      Vehicle Number <span className="text-rose-500">*</span>
                    </span>
                    {newGrn.selectedGatePassNo && (
                      <span className="text-[10px] font-bold text-slate-500 flex items-center gap-1 bg-slate-100 px-1.5 py-0.5 rounded border border-slate-200">
                        <Lock className="w-2.5 h-2.5 text-slate-400" /> Locked from Gate Pass
                      </span>
                    )}
                  </label>
                  <div
                    className={`relative flex rounded-xl overflow-hidden border shadow-2xs ${
                      newGrn.selectedGatePassNo
                        ? 'border-slate-200 bg-slate-100 cursor-not-allowed'
                        : 'border-slate-300 bg-white focus-within:ring-2 focus-within:ring-indigo-500/20 focus-within:border-indigo-500'
                    }`}
                  >
                    <span className="inline-flex items-center px-3 bg-slate-200 border-r border-slate-300 text-xs font-bold text-slate-700 select-none">
                      IND
                    </span>
                    <input
                      type="text"
                      required
                      readOnly={Boolean(newGrn.selectedGatePassNo)}
                      placeholder="UP32 AB 1256"
                      value={newGrn.vehicleNo}
                      onChange={(e) =>
                        setNewGrn({ ...newGrn, vehicleNo: e.target.value.toUpperCase() })
                      }
                      className={`w-full px-3 py-2 text-xs font-bold uppercase text-slate-900 font-mono outline-none ${
                        newGrn.selectedGatePassNo
                          ? 'bg-slate-100 text-slate-700 cursor-not-allowed select-none'
                          : 'bg-white'
                      }`}
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5 flex items-center justify-between">
                  <span>
                    Supplier / Vendor Party Name <span className="text-rose-500">*</span>
                  </span>
                  {newGrn.selectedGatePassNo && (
                    <span className="text-[10px] font-bold text-slate-500 flex items-center gap-1 bg-slate-100 px-1.5 py-0.5 rounded border border-slate-200">
                      <Lock className="w-2.5 h-2.5 text-slate-400" /> Locked from Gate Pass
                    </span>
                  )}
                </label>
                <input
                  type="text"
                  required
                  readOnly={Boolean(newGrn.selectedGatePassNo)}
                  placeholder="e.g. M/s Bharat Supply Corp, Prime Foods"
                  value={newGrn.supplier}
                  onChange={(e) => setNewGrn({ ...newGrn, supplier: e.target.value })}
                  className={`w-full rounded-xl px-3.5 py-2.5 text-xs focus:outline-none transition ${
                    newGrn.selectedGatePassNo
                      ? 'bg-slate-100 text-slate-700 border border-slate-200 font-semibold cursor-not-allowed select-none'
                      : 'bg-white border border-slate-300 text-slate-800 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500'
                  }`}
                />
              </div>

              {/* Product Selection Breakdown from Gate Pass / Catalog */}
              <div className="p-3.5 sm:p-4 rounded-xl bg-slate-50/80 border border-slate-200 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Boxes className="w-4 h-4 text-indigo-600" />
                    <span className="text-xs font-bold text-slate-900">
                      Inward Consignment Items ({newGrn.materials.length} Lines)
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={handleAddGrnItem}
                    className="px-2.5 py-1 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs flex items-center gap-1 shadow-xs cursor-pointer transition"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add Item</span>
                  </button>
                </div>

                <div className="space-y-3">
                  {newGrn.materials.map((m, idx) => (
                    <div
                      key={m.id || idx}
                      className="bg-white p-3 rounded-xl border border-slate-200 space-y-2.5 shadow-2xs relative"
                    >
                      <div className="flex items-center justify-between border-b border-slate-100 pb-1.5">
                        <span className="text-[11px] font-bold text-indigo-900 bg-indigo-50 px-2 py-0.5 rounded">
                          Item #{idx + 1} {m.productName ? `— ${m.productName}` : ''}
                        </span>
                        {newGrn.materials.length > 1 && (
                          <button
                            type="button"
                            onClick={() => handleRemoveGrnItem(m.id)}
                            className="text-rose-500 hover:text-rose-700 p-1 rounded hover:bg-rose-50 transition cursor-pointer"
                            title="Remove item"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-12 gap-2.5">
                        {/* Product Select */}
                        <div className="sm:col-span-6">
                          <label className="block text-[11px] font-bold text-slate-700 mb-1">
                            Product Name / SKU <span className="text-rose-500">*</span>
                          </label>
                          <select
                            value={m.productId || ''}
                            onChange={(e) => handleGrnItemChange(m.id, 'productId', e.target.value)}
                            required
                            className="w-full bg-white border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs text-slate-800 font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500/20 cursor-pointer"
                          >
                            <option value="">-- Choose Product from Master --</option>
                            {Array.from(new Set(products.map((p) => p.storageZone || 'Other Zones'))).map((zone) => (
                              <optgroup key={zone} label={zone}>
                                {products
                                  .filter((p) => (p.storageZone || 'Other Zones') === zone)
                                  .map((p) => (
                                    <option key={p._id} value={p._id}>
                                      {p.name} ({p.sku})
                                    </option>
                                  ))}
                              </optgroup>
                            ))}
                          </select>
                        </div>

                        {/* Quantity Received */}
                        <div className="sm:col-span-3">
                          <label className="block text-[11px] font-bold text-slate-700 mb-1">
                            Pkg Qty ({m.packagingUnit || 'Bags'}) <span className="text-rose-500">*</span>
                          </label>
                          <input
                            type="number"
                            min="1"
                            value={m.packageQty}
                            onChange={(e) => handleGrnItemChange(m.id, 'packageQty', e.target.value)}
                            required
                            className="w-full bg-white border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs font-bold text-slate-900 focus:outline-none"
                          />
                        </div>

                        {/* Base Stock Total */}
                        <div className="sm:col-span-3">
                          <label className="block text-[11px] font-bold text-slate-700 mb-1">
                            Total Base Units
                          </label>
                          <div className="px-2.5 py-1.5 bg-emerald-50 border border-emerald-200 rounded-lg text-xs font-mono font-bold text-emerald-800 truncate">
                            {m.totalBaseQty || (Number(m.packageQty) * (m.packSize || 1))} {m.baseUnit || 'Kg'}
                          </div>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-1">
                        <div>
                          <label className="block text-[10px] font-bold text-slate-600 mb-0.5">
                            Batch / Lot No.
                          </label>
                          <input
                            type="text"
                            placeholder="e.g. BTH-2026-081"
                            value={m.batchNo}
                            onChange={(e) => handleGrnItemChange(m.id, 'batchNo', e.target.value.toUpperCase())}
                            className="w-full bg-white border border-slate-300 rounded-lg px-2 py-1 text-xs font-mono text-slate-900 focus:outline-none"
                          />
                        </div>

                        <div>
                          <label className="block text-[10px] font-bold text-slate-600 mb-0.5">
                            Mfg Date
                          </label>
                          <input
                            type="date"
                            value={m.mfgDate}
                            onChange={(e) => handleGrnItemChange(m.id, 'mfgDate', e.target.value)}
                            className="w-full bg-white border border-slate-300 rounded-lg px-2 py-1 text-xs text-slate-900 focus:outline-none"
                          />
                        </div>

                        <div>
                          <label className="block text-[10px] font-bold text-slate-600 mb-0.5">
                            Expiry Date
                          </label>
                          <input
                            type="date"
                            value={m.expiryDate}
                            onChange={(e) => handleGrnItemChange(m.id, 'expiryDate', e.target.value)}
                            className="w-full bg-white border border-slate-300 rounded-lg px-2 py-1 text-xs text-slate-900 focus:outline-none"
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <CustomSelect
                label="Assigned Storage Shade / Building"
                value={newGrn.shade}
                onChange={(val) => setNewGrn({ ...newGrn, shade: val })}
                options={shadeOptions}
                zIndexClass="z-30"
              />

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <CustomSelect
                  label="Initial Clearance Status"
                  value={newGrn.status}
                  onChange={(val) => setNewGrn({ ...newGrn, status: val })}
                  options={STATUS_OPTIONS}
                  zIndexClass="z-20"
                />

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    Receiving Officer
                  </label>
                  <input
                    type="text"
                    value={newGrn.receivedBy}
                    onChange={(e) => setNewGrn({ ...newGrn, receivedBy: e.target.value })}
                    className="w-full bg-white border border-slate-300 rounded-xl px-3.5 py-2.5 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Inspection Remarks / Delivery Notes
                </label>
                <input
                  type="text"
                  placeholder="e.g. Moisture & packaging verified. Unloaded at Bay-2."
                  value={newGrn.remarks}
                  onChange={(e) => setNewGrn({ ...newGrn, remarks: e.target.value })}
                  className="w-full bg-white border border-slate-300 rounded-xl px-3.5 py-2.5 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                />
              </div>

              {/* Action Buttons */}
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
                  Create &amp; Print GRN
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* GRN CREATION SUCCESS CONFIRMATION MODAL                   */}
      {/* ========================================================= */}
      {grnSuccessModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-4 text-center">
            <div className="w-14 h-14 bg-emerald-100 text-emerald-600 rounded-2xl mx-auto flex items-center justify-center">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <div>
              <h3 className="text-lg font-extrabold text-slate-900">GRN Generated Successfully!</h3>
              <p className="text-xs text-slate-500 mt-1">Inward consignment verified and catalog stock updated.</p>
            </div>
            <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 text-left text-xs space-y-1.5 font-medium">
              <div className="flex justify-between">
                <span className="text-slate-500">GRN Token:</span>
                <strong className="font-mono text-indigo-700">{grnSuccessModal.grnNo}</strong>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">PO Number:</span>
                <strong className="font-mono text-slate-900">{grnSuccessModal.poNo}</strong>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Supplier:</span>
                <span className="text-slate-800">{grnSuccessModal.supplier}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Vehicle:</span>
                <span className="font-mono font-bold text-slate-800">{grnSuccessModal.vehicleNo}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Storage Shade:</span>
                <span className="text-indigo-700 font-bold">{grnSuccessModal.shade}</span>
              </div>
            </div>
            <div className="flex gap-2.5 pt-2">
              <button
                type="button"
                onClick={() => setGrnSuccessModal(null)}
                className="flex-1 py-2.5 rounded-xl border border-slate-300 text-slate-700 text-xs font-bold hover:bg-slate-50 cursor-pointer transition"
              >
                Close &amp; Continue
              </button>
              <button
                type="button"
                onClick={() => {
                  const grn = grnSuccessModal
                  setGrnSuccessModal(null)
                  setSelectedGrn(grn)
                  setShowPrintModal(true)
                }}
                className="flex-1 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer shadow-sm transition"
              >
                <Printer className="w-4 h-4" /> View &amp; Print Slip
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* HIGH RESOLUTION PRINTABLE GRN RECEIPT MODAL               */}
      {/* ========================================================= */}
      {showPrintModal && selectedGrn && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 animate-fade-in">
          <div className="bg-white rounded-2xl shadow-2xl max-w-xl w-full max-h-[90dvh] overflow-y-auto p-4 sm:p-6 space-y-4 animate-scale-in border border-slate-200">
            {/* Header */}
            <div className="flex items-center justify-between border-b pb-3 border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-indigo-50 border border-indigo-100 text-indigo-600 flex items-center justify-center font-bold">
                  <FileText className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">Official Goods Receiving Voucher</h3>
                  <p className="text-[11px] text-slate-500">GRN Delivery &amp; Inspection Clearance</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowPrintModal(false)}
                className="text-slate-400 hover:text-slate-700 p-1.5 rounded-lg hover:bg-slate-100 cursor-pointer transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Printable Pass Paper Card */}
            <div id="printable-grn-slip" className="printable-area border border-slate-300 rounded-2xl bg-white p-5 space-y-4 shadow-sm text-xs">
              <div className="flex items-center justify-between border-b border-slate-200 pb-3">
                <div>
                  <span className="text-[10px] uppercase font-bold text-indigo-600 tracking-wider block">
                    WAREHOUSE OPERATIONS
                  </span>
                  <h4 className="text-base font-extrabold text-slate-900 tracking-tight">
                    GOODS RECEIVING NOTE (GRN)
                  </h4>
                  <p className="text-xs font-mono font-bold text-slate-700 mt-0.5">
                    {selectedGrn.grnNo}
                  </p>
                </div>
                <div className="w-16 h-16 bg-white border border-slate-300 rounded-xl p-1 flex items-center justify-center shrink-0">
                  {grnQrDataUrl ? (
                    <img src={grnQrDataUrl} alt="GRN QR" className="w-full h-full object-contain" />
                  ) : (
                    <QrCode className="w-10 h-10 text-slate-800" />
                  )}
                </div>
              </div>

              {/* 2-Column Summary */}
              <div className="grid grid-cols-2 gap-3 border-b border-slate-100 pb-3">
                <div>
                  <span className="text-slate-500 block">Purchase Order:</span>
                  <span className="font-mono font-bold text-slate-900">{selectedGrn.poNo}</span>
                </div>
                <div>
                  <span className="text-slate-500 block">Delivery Vehicle:</span>
                  <span className="font-mono font-bold text-slate-900">{selectedGrn.vehicleNo}</span>
                </div>
                <div>
                  <span className="text-slate-500 block">Supplier / Vendor:</span>
                  <span className="font-semibold text-slate-800">{selectedGrn.supplier}</span>
                </div>
                <div>
                  <span className="text-slate-500 block">Receiving Shade:</span>
                  <span className="font-semibold text-indigo-700">{selectedGrn.shade}</span>
                </div>
                <div>
                  <span className="text-slate-500 block">Receiving Time:</span>
                  <span className="font-semibold text-slate-800">
                    {new Date(selectedGrn.createdAt || selectedGrn.dateTime || Date.now()).toLocaleString('en-IN', {
                      day: '2-digit',
                      month: 'short',
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </span>
                </div>
                <div>
                  <span className="text-slate-500 block">Clearance Status:</span>
                  <span className={`inline-block px-2.5 py-0.5 rounded-full text-[11px] font-bold border ${getStatusBadge(selectedGrn.status)}`}>
                    {selectedGrn.status}
                  </span>
                </div>
              </div>

              {/* Materials Breakdown */}
              {selectedGrn.materials && selectedGrn.materials.length > 0 && (
                <div>
                  <p className="text-[11px] font-bold uppercase text-slate-700 tracking-wider mb-1.5">
                    Received Consignment Items
                  </p>
                  <div className="border border-slate-200 rounded-xl overflow-hidden">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold">
                        <tr>
                          <th className="py-2 px-3">Item Description</th>
                          <th className="py-2 px-3">Batch</th>
                          <th className="py-2 px-3 text-right">Quantity</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 bg-white">
                        {selectedGrn.materials.map((m, idx) => (
                          <tr key={idx}>
                            <td className="py-2 px-3 font-semibold text-slate-900">{m.productName || m.name}</td>
                            <td className="py-2 px-3 font-mono text-slate-600">{m.batchNo || m.batch || '—'}</td>
                            <td className="py-2 px-3 text-right font-bold text-slate-900">
                              {m.packageQty || m.qty} <span className="font-normal text-slate-500">{m.packagingUnit || m.unit}</span>
                              {m.totalBaseQty ? ` (${m.totalBaseQty} ${m.baseUnit})` : ''}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* Remarks */}
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs">
                <span className="text-slate-500 font-semibold block">Inspector Remarks:</span>
                <span className="text-slate-800 font-medium">{selectedGrn.remarks}</span>
              </div>

              {/* Signatures */}
              <div className="pt-4 grid grid-cols-3 gap-3 text-center text-xs border-t border-slate-200">
                <div className="border-t border-dashed border-slate-300 pt-1.5">
                  <p className="font-bold text-slate-800">Unloading Clerk</p>
                  <p className="text-[10px] text-slate-400">Tally Verified</p>
                </div>
                <div className="border-t border-dashed border-slate-300 pt-1.5">
                  <p className="font-bold text-slate-800">QC Inspector</p>
                  <p className="text-[10px] text-slate-400">Quality Cleared</p>
                </div>
                <div className="border-t border-dashed border-slate-300 pt-1.5">
                  <p className="font-bold text-slate-800">Store Manager</p>
                  <p className="text-[10px] text-slate-400">GRN Accepted</p>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center justify-end gap-2.5 pt-2">
              <button
                type="button"
                onClick={() => setShowPrintModal(false)}
                className="px-4 py-2 border border-slate-300 rounded-xl text-xs font-bold text-slate-700 hover:bg-slate-50 cursor-pointer transition"
              >
                Close
              </button>
              <button
                type="button"
                onClick={() => printSpecificElement('#printable-grn-slip', `GRN Slip - ${selectedGrn.grnNo}`)}
                className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-xs transition"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Print Official GRN Slip</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
