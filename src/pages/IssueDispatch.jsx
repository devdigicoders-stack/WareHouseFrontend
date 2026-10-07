import { useState, useMemo, useRef, useEffect } from 'react'
import { Link } from 'react-router-dom'
import QRCode from 'qrcode'
import { printSpecificElement } from '../utils/printHelper'
import {
  Truck,
  Send,
  Layers,
  CheckCircle2,
  Plus,
  Download,
  Eye,
  RotateCcw,
  Search,
  ChevronDown,
  Check,
  X,
  Printer,
  MapPin,
  Calendar,
  User,
  FileText,
  QrCode,
  Package,
  AlertCircle,
  Trash2,
  RefreshCw,
  Clock,
  ArrowRight,
  ShieldCheck,
  Building2
} from 'lucide-react'
import {
  fetchDispatches,
  createDispatch,
  updateDispatchStatus,
  deleteDispatch,
  fetchProducts,
  fetchPartners,
  fetchShades,
  fetchGateEntries
} from '../services/api'

// Custom Accessible Select Dropdown to eliminate native flicker
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
        className="w-full bg-slate-50 hover:bg-slate-100/80 border border-slate-200 rounded-xl px-3 py-2 text-left text-xs font-semibold text-slate-700 flex items-center justify-between gap-2 transition cursor-pointer focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
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
                    ? 'bg-indigo-50 text-indigo-700 font-bold'
                    : 'text-slate-700 hover:bg-slate-50'
                }`}
              >
                <div className="truncate">
                  <div>{opt.label}</div>
                  {opt.sublabel && (
                    <div className="text-[10px] text-slate-400 font-normal">{opt.sublabel}</div>
                  )}
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

// Fallback Standard Storage Shades if DB has none
const DEFAULT_SHADES = [
  { id: 'SH01', name: 'Shade 1: Grains & Bulk Pulses', category: 'Grains & Pulses', baseUnit: 'Kg', packUnit: 'Bags (50kg)', unitsPerPack: 50 },
  { id: 'SH02', name: 'Shade 2: Edible Oils & Liquids', category: 'Edible Oils', baseUnit: 'Ltr', packUnit: 'Tins (15L)', unitsPerPack: 15 },
  { id: 'SH03', name: 'Shade 3: Packaged Food & FMCG', category: 'Packaged FMCG', baseUnit: 'Pieces', packUnit: 'Gatta (Cartons)', unitsPerPack: 6 },
  { id: 'SH04', name: 'Shade 4: Packaging Materials & Cartons', category: 'Packaging', baseUnit: 'Cartons', packUnit: 'Bundles', unitsPerPack: 25 },
  { id: 'SH05', name: 'Shade 5: Chemicals & Hygiene', category: 'Chemicals', baseUnit: 'Ltr', packUnit: 'Carboys (20L)', unitsPerPack: 20 },
  { id: 'SH06', name: 'Shade 6: Spares & General Goods', category: 'Spares', baseUnit: 'Nos', packUnit: 'Crates', unitsPerPack: 10 },
]

export default function IssueDispatch() {
  // Toast notification
  const [toastMessage, setToastMessage] = useState(null)
  const triggerToast = (msg) => {
    setToastMessage(msg)
    setTimeout(() => setToastMessage(null), 3500)
  }

  // Filter toolbar state
  const [filterType, setFilterType] = useState('ALL')
  const [filterShade, setFilterShade] = useState('ALL')
  const [filterCustomer, setFilterCustomer] = useState('ALL')
  const [filterStatus, setFilterStatus] = useState('ALL')
  const [searchQuery, setSearchQuery] = useState('')

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1)
  const perPage = 7

  // Modals state
  const [showNewDispatchModal, setShowNewDispatchModal] = useState(false)
  const [showDetailsModal, setShowDetailsModal] = useState(null)
  const [showGatePassModal, setShowGatePassModal] = useState(null)
  const [deleteConfirmId, setDeleteConfirmId] = useState(null)
  const [gatePassQrUrl, setGatePassQrUrl] = useState('')

  // Backend Live Data
  const [dispatches, setDispatches] = useState([])
  const [products, setProducts] = useState([])
  const [customers, setCustomers] = useState([])
  const [shadesList, setShadesList] = useState(DEFAULT_SHADES)
  const [recentVehicles, setRecentVehicles] = useState([])
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)

  // Selected Product for quick population in modal
  const [selectedProductId, setSelectedProductId] = useState('')

  // New Issue / Dispatch Form State
  const [newDispatch, setNewDispatch] = useState({
    customerUnit: '',
    poIndentNo: '',
    shadeId: 'SH01',
    location: 'SH01-RK01-R1-C1',
    productId: '',
    productName: '',
    sku: '',
    batchNo: '',
    expiryDate: new Date(Date.now() + 90 * 86400000).toISOString().split('T')[0],
    baseUnit: 'Kg',
    packUnit: 'Bags (50kg)',
    unitsPerPack: 50,
    packsCount: 20,
    dispatchType: 'Outward Customer Sale',
    vehicleNo: 'DL-1L-AA-5544',
    driverName: 'Mohd. Imran',
    contactNo: '+91 98711 22334',
    dispatchOfficer: 'Warehouse Manager',
    expectedDelivery: 'Today',
    remarks: 'Scheduled retail replenishment dispatch.',
    availableStock: 0,
  })

  // Load all dynamic master data from backend
  const loadMasterData = async () => {
    setLoading(true)
    try {
      const [dispRes, prodRes, partRes, shadeRes, gateRes] = await Promise.allSettled([
        fetchDispatches(),
        fetchProducts(),
        fetchPartners(),
        fetchShades(),
        fetchGateEntries(),
      ])

      // 1. Process Products
      let loadedProds = []
      if (prodRes.status === 'fulfilled' && Array.isArray(prodRes.value)) {
        loadedProds = prodRes.value
        setProducts(loadedProds)
      }

      // 2. Process Customers / Partners
      if (partRes.status === 'fulfilled' && Array.isArray(partRes.value)) {
        const custs = partRes.value.filter(p => p.type === 'Customer' || !p.type || p.type === 'Both')
        setCustomers(custs)
      }

      // 3. Process Shades
      if (shadeRes.status === 'fulfilled' && Array.isArray(shadeRes.value) && shadeRes.value.length > 0) {
        const mappedShades = shadeRes.value.map((s, idx) => ({
          id: s.code || `SH0${idx + 1}`,
          name: s.name || `Shade ${idx + 1}`,
          category: s.category || 'General Storage',
          baseUnit: s.baseUnit || 'Kg',
          packUnit: s.packUnit || 'Bags (50kg)',
          unitsPerPack: s.unitsPerPack || 50
        }))
        setShadesList(mappedShades)
      } else {
        setShadesList(DEFAULT_SHADES)
      }

      // 4. Process Gate Entries for vehicle/driver suggestions
      if (gateRes.status === 'fulfilled' && Array.isArray(gateRes.value)) {
        const vehicles = gateRes.value
          .map(g => ({ vehicleNo: g.vehicleNo, driverName: g.driverName, contact: g.driverContact || g.driverPhone }))
          .filter(v => v.vehicleNo)
        setRecentVehicles(vehicles)
      }

      // 5. Process Dispatches
      if (dispRes.status === 'fulfilled' && Array.isArray(dispRes.value) && dispRes.value.length > 0) {
        const mapped = dispRes.value.map((d, idx) => {
          const firstItem = d.items?.[0] || {}
          return {
            id: d._id || idx + 1,
            dispatchNo: d.dispatchNo || `DSP-2026-${String(idx + 1).padStart(4, '0')}`,
            date: d.createdAt
              ? new Date(d.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })
              : 'Today',
            poIndentNo: d.orderNo || `SO-2026-${9000 + idx}`,
            customerUnit: d.customerName || d.destination || 'Reliance Retail Mega Hub',
            shadeId: d.shadeId || firstItem.locationCode?.split('-')?.[0] || 'SH01',
            location: firstItem.locationCode || 'SH01-RK01-R1-C1',
            productName: firstItem.productName || (d.items?.length > 1 ? `${firstItem.productName} +${d.items.length - 1} more` : 'Basmati Rice Special'),
            sku: firstItem.sku || 'PRD-RIC-001',
            itemsCount: d.items?.length || 1,
            totalQty: d.totalBaseQty || (firstItem.requestedQty ? firstItem.requestedQty * (firstItem.packSize || 1) : 500),
            baseUnit: d.baseUnit || 'Kg',
            packCount: d.totalPackages || firstItem.requestedQty || 20,
            packUnit: firstItem.packagingUnit || 'Bags (50kg)',
            dispatchType: d.dispatchType || 'Outward Customer Sale',
            status: d.status || 'Draft / Picklist',
            labStatus: d.labStatus || (firstItem.verified ? 'Passed' : 'Passed'),
            expectedDelivery: d.expectedDelivery || 'Today',
            vehicleNo: d.vehicleNo || 'DL-1L-AA-5544',
            driverName: d.driverName || 'Mohd. Imran',
            driverContact: d.driverContact || '+91 98711 22334',
            officer: d.dispatchedBy || 'Warehouse Manager',
            remarks: d.remarks || 'Standard verified outward dispatch.',
            itemsList: d.items && d.items.length > 0 ? d.items.map(it => ({
              name: it.productName,
              sku: it.sku,
              location: it.locationCode || 'SH01-RK01-R1-C1',
              qty: (it.requestedQty || 1) * (it.packSize || 1),
              baseUnit: d.baseUnit || 'Kg',
              packQty: it.requestedQty || 1,
              packUnit: it.packagingUnit || 'Bags',
              batch: it.batchNo || 'BAT-2026-01',
              labCert: it.labCert || 'COA-2026-PASSED'
            })) : [
              {
                name: firstItem.productName || 'Basmati Rice (Grade 1 Special 25kg)',
                sku: firstItem.sku || 'PRD-RIC-001',
                location: firstItem.locationCode || 'SH01-RK01-R1-C1',
                qty: d.totalBaseQty || 500,
                baseUnit: d.baseUnit || 'Kg',
                packQty: d.totalPackages || 20,
                packUnit: 'Bags',
                batch: firstItem.batchNo || 'BAT-2026-RIC-01',
                labCert: 'COA-2026-00101'
              }
            ]
          }
        })
        setDispatches(mapped)
      } else {
        // Fallback default dispatch record if DB empty
        setDispatches([
          {
            id: 'mock-1',
            dispatchNo: 'DSP-2026-0001',
            date: 'Today, Just now',
            poIndentNo: 'SO-2026-9041',
            customerUnit: 'Reliance Retail Mega Hub',
            shadeId: 'SH01',
            location: 'SH01-RK01-R1-C1',
            productName: 'Basmati Rice (Grade 1 Special 25kg)',
            sku: 'PRD-RIC-001',
            itemsCount: 1,
            totalQty: 1000,
            baseUnit: 'Kg',
            packCount: 20,
            packUnit: 'Bags (50kg)',
            dispatchType: 'Outward Customer Sale',
            status: 'Draft / Picklist',
            labStatus: 'Passed',
            expectedDelivery: 'Today',
            vehicleNo: 'DL-1L-AA-5544',
            driverName: 'Mohd. Imran',
            driverContact: '+91 98711 22334',
            officer: 'Warehouse Manager',
            remarks: 'Scheduled retail replenishment for Noida mega hub.',
            itemsList: [
              {
                name: 'Basmati Rice (Grade 1 Special 25kg)',
                sku: 'PRD-RIC-001',
                location: 'SH01-RK01-R1-C1',
                qty: 1000,
                baseUnit: 'Kg',
                packQty: 20,
                packUnit: 'Bags (50kg)',
                batch: 'BAT-2026-RIC-01',
                labCert: 'COA-2026-00101'
              }
            ]
          }
        ])
      }
    } catch (err) {
      console.error('Error loading Master Data for Dispatches:', err)
      triggerToast('Connected in offline mode. Local state active.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadMasterData()
  }, [])

  // When opening modal, initialize default form values based on live products & customers
  const handleOpenNewModal = () => {
    const defaultCust = customers.length > 0 ? customers[0].name : 'Reliance Retail Mega Hub'
    const defaultProd = products.length > 0 ? products[0] : null
    const initialShadeId = defaultProd?.shadeId || (shadesList.length > 0 ? shadesList[0].id : 'SH01')
    const matchedShade = shadesList.find(s => s.id === initialShadeId) || shadesList[0]

    const initialPackUnit = defaultProd?.outerPackaging || matchedShade?.packUnit || 'Bags (50kg)'
    const initialUnitsPerPack = defaultProd?.packSize || matchedShade?.unitsPerPack || 50
    const initialBaseUnit = defaultProd?.baseUnit || matchedShade?.baseUnit || 'Kg'

    setSelectedProductId(defaultProd?._id || '')
    setNewDispatch({
      customerUnit: defaultCust,
      poIndentNo: `SO-2026-${Math.floor(1000 + Math.random() * 9000)}`,
      shadeId: initialShadeId,
      location: defaultProd?.binLocation || `${initialShadeId}-RK01-R1-C1`,
      productId: defaultProd?._id || '',
      productName: defaultProd?.name || 'Basmati Rice (Grade 1 Special 25kg)',
      sku: defaultProd?.sku || 'PRD-RIC-001',
      batchNo: defaultProd?.batchNo || 'BAT-2026-RIC-01',
      expiryDate: defaultProd?.expiryDate || new Date(Date.now() + 90 * 86400000).toISOString().split('T')[0],
      baseUnit: initialBaseUnit,
      packUnit: initialPackUnit,
      unitsPerPack: initialUnitsPerPack,
      packsCount: 20,
      dispatchType: 'Outward Customer Sale',
      vehicleNo: recentVehicles.length > 0 ? recentVehicles[0].vehicleNo : 'DL-1L-AA-5544',
      driverName: recentVehicles.length > 0 ? recentVehicles[0].driverName : 'Mohd. Imran',
      contactNo: recentVehicles.length > 0 ? (recentVehicles[0].contact || '+91 98711 22334') : '+91 98711 22334',
      dispatchOfficer: 'Warehouse Manager',
      expectedDelivery: 'Today',
      remarks: 'Scheduled retail replenishment dispatch.',
      availableStock: defaultProd?.currentStock || 1250,
    })
    setShowNewDispatchModal(true)
  }

  // Handle Dynamic Product Selection in Modal
  const handleSelectProduct = (prodId) => {
    setSelectedProductId(prodId)
    const prod = products.find(p => p._id === prodId)
    if (!prod) return

    const pShade = prod.shadeId || (prod.storageZone?.includes('SH02') ? 'SH02' : prod.storageZone?.includes('SH03') ? 'SH03' : 'SH01')
    const matchedShade = shadesList.find(s => s.id === pShade)

    setNewDispatch(prev => ({
      ...prev,
      productId: prod._id,
      productName: prod.name,
      sku: prod.sku || prev.sku,
      shadeId: pShade || prev.shadeId,
      location: prod.binLocation || `${pShade || 'SH01'}-RK01-R1-C1`,
      batchNo: prod.batchNo && prod.batchNo !== '—' ? prod.batchNo : `BAT-2026-${prod.sku?.slice(-4) || 'GEN'}`,
      expiryDate: prod.expiryDate || prev.expiryDate,
      baseUnit: prod.baseUnit || matchedShade?.baseUnit || prev.baseUnit,
      packUnit: prod.outerPackaging || matchedShade?.packUnit || prev.packUnit,
      unitsPerPack: Number(prod.packSize) || Number(matchedShade?.unitsPerPack) || prev.unitsPerPack || 1,
      availableStock: prod.currentStock !== undefined ? prod.currentStock : 0
    }))
  }

  // Generate dynamic scannable QR code for dispatch gate pass slip
  useEffect(() => {
    if (!showGatePassModal) {
      setGatePassQrUrl('')
      return
    }

    const qrPayload = [
      '=== WAREHOUSE DISPATCH GATE PASS ===',
      `Gate Pass No : ${showGatePassModal.dispatchNo ? 'GPO-' + showGatePassModal.dispatchNo : 'GPO-PASS'}`,
      `Dispatch Slip: ${showGatePassModal.dispatchNo || 'N/A'}`,
      `Order/Indent : ${showGatePassModal.poIndentNo || 'N/A'}`,
      `Date         : ${showGatePassModal.date || 'Today'}`,
      `Status       : ${showGatePassModal.status || 'Verified & Ready'}`,
      `------------------------------------`,
      `Vehicle No   : ${showGatePassModal.vehicleNo || 'N/A'}`,
      `Driver Name  : ${showGatePassModal.driverName || 'N/A'}`,
      `Customer     : ${showGatePassModal.customerUnit || 'N/A'}`,
      `------------------------------------`,
      `Product      : ${showGatePassModal.productName || 'N/A'}`,
      `Total Weight : ${showGatePassModal.totalQty} ${showGatePassModal.baseUnit}`,
      `Total Packs  : ${showGatePassModal.packCount} ${showGatePassModal.packUnit}`,
      `------------------------------------`,
      `QA Status    : 100% QC PASSED`,
      `Gate Stamp   : AUTHORIZED GATE PASS`,
      '===================================='
    ].join('\n')

    QRCode.toDataURL(qrPayload, {
      width: 256,
      margin: 1,
      color: { dark: '#0f172a', light: '#ffffff' },
      errorCorrectionLevel: 'M',
    })
      .then((url) => setGatePassQrUrl(url))
      .catch((err) => console.error('Error generating gate pass QR:', err))
  }, [showGatePassModal])

  // Filtered Dispatches
  const filteredDispatches = useMemo(() => {
    return dispatches.filter((item) => {
      if (filterType !== 'ALL' && item.dispatchType !== filterType) return false
      if (filterShade !== 'ALL' && item.shadeId !== filterShade) return false
      if (filterCustomer !== 'ALL' && item.customerUnit !== filterCustomer) return false
      if (filterStatus !== 'ALL' && item.status !== filterStatus) return false

      if (searchQuery.trim() !== '') {
        const q = searchQuery.toLowerCase()
        return (
          item.dispatchNo?.toLowerCase().includes(q) ||
          item.poIndentNo?.toLowerCase().includes(q) ||
          item.customerUnit?.toLowerCase().includes(q) ||
          item.productName?.toLowerCase().includes(q) ||
          item.sku?.toLowerCase().includes(q) ||
          item.vehicleNo?.toLowerCase().includes(q) ||
          item.driverName?.toLowerCase().includes(q) ||
          item.location?.toLowerCase().includes(q)
        )
      }
      return true
    })
  }, [dispatches, filterType, filterShade, filterCustomer, filterStatus, searchQuery])

  // Paginated Results
  const totalPages = Math.max(1, Math.ceil(filteredDispatches.length / perPage))
  const paginatedDispatches = filteredDispatches.slice((currentPage - 1) * perPage, currentPage * perPage)

  // Dynamic KPI Stats
  const stats = useMemo(() => {
    const total = dispatches.length
    const totalUnits = dispatches.reduce((acc, d) => acc + (Number(d.totalQty) || 0), 0)
    const inTransit = dispatches.filter((d) => d.status === 'In Transit' || d.status === 'Dispatched').length
    const delivered = dispatches.filter((d) => d.status === 'Delivered' || d.status === 'Gate Out / Cleared').length
    return { total, totalUnits, inTransit, delivered }
  }, [dispatches])

  // Create Dispatch (Dynamic submit to MongoDB)
  const handleCreateDispatch = async (e) => {
    e.preventDefault()
    setSubmitting(true)

    const computedPacks = Number(newDispatch.packsCount) || 1
    const computedRatio = Number(newDispatch.unitsPerPack) || 1
    const computedBase = computedPacks * computedRatio
    const locCode = newDispatch.location || `${newDispatch.shadeId}-RK01-R1-C1`

    const payload = {
      orderNo: newDispatch.poIndentNo.trim().toUpperCase(),
      customerName: newDispatch.customerUnit.trim(),
      destination: newDispatch.customerUnit.trim(),
      vehicleNo: newDispatch.vehicleNo.trim().toUpperCase(),
      driverName: newDispatch.driverName.trim(),
      driverContact: newDispatch.contactNo.trim(),
      dispatchType: newDispatch.dispatchType,
      shadeId: newDispatch.shadeId,
      expectedDelivery: newDispatch.expectedDelivery,
      totalPackages: computedPacks,
      totalBaseQty: computedBase,
      baseUnit: newDispatch.baseUnit,
      dispatchedBy: newDispatch.dispatchOfficer,
      remarks: newDispatch.remarks,
      items: [
        {
          productId: newDispatch.productId || null,
          productName: newDispatch.productName.trim(),
          sku: newDispatch.sku.trim().toUpperCase(),
          batchNo: newDispatch.batchNo.trim().toUpperCase(),
          locationCode: locCode,
          packagingUnit: newDispatch.packUnit,
          packSize: computedRatio,
          requestedQty: computedPacks,
          pickedQty: computedPacks,
          verified: true,
          expiryDate: newDispatch.expiryDate,
          labCert: 'COA-2026-PASSED',
        },
      ],
    }

    try {
      const saved = await createDispatch(payload)
      const newRecord = {
        id: saved._id || Date.now(),
        dispatchNo: saved.dispatchNo || `DSP-2026-${String(dispatches.length + 1).padStart(4, '0')}`,
        date: 'Today, Just now',
        poIndentNo: saved.orderNo || newDispatch.poIndentNo,
        customerUnit: saved.customerName || newDispatch.customerUnit,
        shadeId: saved.shadeId || newDispatch.shadeId,
        location: locCode,
        productName: newDispatch.productName,
        sku: newDispatch.sku,
        itemsCount: 1,
        totalQty: computedBase,
        baseUnit: newDispatch.baseUnit,
        packCount: computedPacks,
        packUnit: newDispatch.packUnit,
        dispatchType: newDispatch.dispatchType,
        status: saved.status || 'Draft / Picklist',
        labStatus: 'Passed',
        expectedDelivery: newDispatch.expectedDelivery,
        vehicleNo: newDispatch.vehicleNo,
        driverName: newDispatch.driverName,
        driverContact: newDispatch.contactNo,
        officer: newDispatch.dispatchOfficer,
        remarks: newDispatch.remarks,
        itemsList: payload.items.map(it => ({
          name: it.productName,
          sku: it.sku,
          location: it.locationCode,
          qty: computedBase,
          baseUnit: newDispatch.baseUnit,
          packQty: computedPacks,
          packUnit: newDispatch.packUnit,
          batch: it.batchNo,
          labCert: 'COA-2026-PASSED'
        })),
      }

      setDispatches(prev => [newRecord, ...prev])
      triggerToast(`Dispatch ${newRecord.dispatchNo} created successfully (${computedBase.toLocaleString()} ${newRecord.baseUnit}).`)
      setShowNewDispatchModal(false)
    } catch (err) {
      console.error('Error saving dispatch order:', err)
      // Fallback local creation
      const localNo = `DSP-2026-${String(dispatches.length + 1).padStart(4, '0')}`
      const newRecord = {
        id: `local-${Date.now()}`,
        dispatchNo: localNo,
        date: 'Today, Just now',
        poIndentNo: newDispatch.poIndentNo,
        customerUnit: newDispatch.customerUnit,
        shadeId: newDispatch.shadeId,
        location: locCode,
        productName: newDispatch.productName,
        sku: newDispatch.sku,
        itemsCount: 1,
        totalQty: computedBase,
        baseUnit: newDispatch.baseUnit,
        packCount: computedPacks,
        packUnit: newDispatch.packUnit,
        dispatchType: newDispatch.dispatchType,
        status: 'Draft / Picklist',
        labStatus: 'Passed',
        expectedDelivery: newDispatch.expectedDelivery,
        vehicleNo: newDispatch.vehicleNo,
        driverName: newDispatch.driverName,
        driverContact: newDispatch.contactNo,
        officer: newDispatch.dispatchOfficer,
        remarks: newDispatch.remarks,
        itemsList: [
          {
            name: newDispatch.productName,
            sku: newDispatch.sku,
            location: locCode,
            qty: computedBase,
            baseUnit: newDispatch.baseUnit,
            packQty: computedPacks,
            packUnit: newDispatch.packUnit,
            batch: newDispatch.batchNo,
            labCert: 'COA-2026-PASSED'
          }
        ],
      }
      setDispatches(prev => [newRecord, ...prev])
      triggerToast(`Dispatch ${localNo} saved locally (${computedBase.toLocaleString()} ${newRecord.baseUnit}).`)
      setShowNewDispatchModal(false)
    } finally {
      setSubmitting(false)
    }
  }

  // Handle Advance Status Workflow
  const handleAdvanceStatus = async (id) => {
    const item = dispatches.find((d) => d.id === id)
    if (!item) return

    let nextStatus = 'QR Verified / Ready'
    if (item.status === 'Draft / Picklist' || item.status === 'Pending') nextStatus = 'QR Verified / Ready'
    else if (item.status === 'QR Verified / Ready') nextStatus = 'Dispatched'
    else if (item.status === 'Dispatched') nextStatus = 'In Transit'
    else if (item.status === 'In Transit') nextStatus = 'Delivered'
    else nextStatus = 'Delivered'

    setDispatches(prev =>
      prev.map((d) => (d.id === id ? { ...d, status: nextStatus } : d))
    )

    try {
      if (typeof id === 'string' && id.length === 24) {
        await updateDispatchStatus(id, nextStatus)
      }
    } catch (err) {
      console.error('Error advancing dispatch status:', err)
    }

    triggerToast(`Dispatch ${item.dispatchNo} moved to "${nextStatus}".`)
  }

  // Handle Delete Dispatch
  const handleDeleteDispatch = async (id) => {
    const item = dispatches.find(d => d.id === id)
    setDispatches(prev => prev.filter(d => d.id !== id))
    setDeleteConfirmId(null)

    try {
      if (typeof id === 'string' && id.length === 24) {
        await deleteDispatch(id)
      }
      triggerToast(`Dispatch ${item?.dispatchNo || ''} deleted.`)
    } catch (err) {
      console.error('Error deleting dispatch:', err)
      triggerToast('Dispatch removed from view.')
    }
  }

  // Export CSV
  const handleExportCSV = () => {
    const headers = [
      '#',
      'Dispatch No',
      'Date',
      'PO/Indent No',
      'Customer Unit',
      'Origin Shade',
      'Location',
      'Total Base Qty',
      'Base Unit',
      'Packaging Packs',
      'Dispatch Type',
      'Vehicle No',
      'Driver Name',
      'Lab QC',
      'Status',
    ]

    const rows = filteredDispatches.map((row, idx) => [
      idx + 1,
      row.dispatchNo,
      `"${row.date}"`,
      row.poIndentNo,
      `"${row.customerUnit}"`,
      row.shadeId,
      row.location,
      row.totalQty,
      row.baseUnit,
      `"${row.packCount} ${row.packUnit}"`,
      `"${row.dispatchType}"`,
      row.vehicleNo,
      `"${row.driverName}"`,
      row.labStatus,
      row.status,
    ])

    const csvContent =
      'data:text/csv;charset=utf-8,' +
      [headers.join(','), ...rows.map((e) => e.join(','))].join('\n')
    const encodedUri = encodeURI(csvContent)
    const link = document.createElement('a')
    link.setAttribute('href', encodedUri)
    link.setAttribute('download', `Outward_Dispatches_Manifest_${new Date().toISOString().slice(0, 10)}.csv`)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    triggerToast('Outward dispatch manifests exported to CSV.')
  }

  // Dynamic filter options derived from live data
  const dynamicShadeOptions = useMemo(() => {
    return [
      { value: 'ALL', label: 'All Warehouse Shades' },
      ...shadesList.map((s) => ({ value: s.id, label: s.name })),
    ]
  }, [shadesList])

  const dynamicCustomerOptions = useMemo(() => {
    const custSet = new Set(dispatches.map(d => d.customerUnit).filter(Boolean))
    customers.forEach(c => custSet.add(c.name))
    return [
      { value: 'ALL', label: 'All Customer Hubs' },
      ...Array.from(custSet).map(c => ({ value: c, label: c })),
    ]
  }, [dispatches, customers])

  const typeOptions = [
    { value: 'ALL', label: 'All Dispatch Types' },
    { value: 'Outward Customer Sale', label: 'Outward Customer Sale' },
    { value: 'Inter-Warehouse Transfer', label: 'Inter-Warehouse Transfer' },
    { value: 'Export Consignment', label: 'Export Consignment' },
    { value: 'Sample / Promotional Dispatch', label: 'Sample / Promotional' },
  ]

  const statusOptions = [
    { value: 'ALL', label: 'All Dispatch Statuses' },
    { value: 'Draft / Picklist', label: 'Draft / Picklist' },
    { value: 'QR Verified / Ready', label: 'QR Verified / Ready' },
    { value: 'Dispatched', label: 'Dispatched from Bay' },
    { value: 'In Transit', label: 'In Transit Cargo' },
    { value: 'Delivered', label: 'Delivered / Completed' },
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
      <div className="bg-white rounded-2xl p-4 sm:p-5 shadow-xs border border-slate-200/80 flex flex-col xl:flex-row xl:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5 min-w-0">
          <div className="w-11 h-11 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 shadow-xs shrink-0">
            <Truck className="w-5 h-5" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2.5 flex-wrap">
              <h1 className="text-xl font-bold text-slate-800 tracking-tight">Outward Issue &amp; Dispatch</h1>
              <span className="text-[11px] font-semibold bg-indigo-50 text-indigo-700 border border-indigo-200/60 px-2.5 py-0.5 rounded-full shrink-0">
                Logistics &amp; Delivery Desk
              </span>
            </div>
            <p className="text-xs text-slate-500 font-medium mt-1 max-w-2xl">
              Track outward stock dispatches, retail customer manifests, dual-unit pack reconciliations, and transit deliveries across warehouse storage shades.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 sm:gap-2.5 shrink-0 flex-wrap sm:flex-nowrap">
          <button
            type="button"
            onClick={loadMasterData}
            title="Refresh database records"
            className="p-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 transition cursor-pointer"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-indigo-600' : ''}`} />
          </button>

          <Link
            to="/checkout-qr"
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold shadow-xs transition shrink-0"
          >
            <QrCode className="w-3.5 h-3.5 text-slate-500" />
            <span>QR Checkout</span>
          </Link>

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
            onClick={handleOpenNewModal}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-xs transition shrink-0 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>New Issue / Dispatch</span>
          </button>
        </div>
      </div>

      {/* 4 Dynamic KPI Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
        <div className="bg-white rounded-2xl p-4 shadow-xs border border-slate-200/80 flex items-center gap-3.5 hover:border-indigo-200 transition">
          <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 border border-indigo-100 flex items-center justify-center shrink-0">
            <Truck className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-500">Total Dispatches</p>
            <h3 className="text-xl font-bold text-slate-800 leading-tight mt-0.5">
              {stats.total} Shipments
            </h3>
            <p className="text-[11px] text-indigo-600 font-medium">Logged in database</p>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-4 shadow-xs border border-slate-200/80 flex items-center gap-3.5 hover:border-emerald-200 transition">
          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 border border-emerald-100 flex items-center justify-center shrink-0">
            <Layers className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-500">Total Base Units</p>
            <h3 className="text-xl font-bold text-slate-800 leading-tight mt-0.5">
              {stats.totalUnits.toLocaleString()}
            </h3>
            <p className="text-[11px] text-emerald-600 font-medium">Kg, Ltr, Pcs &amp; Boxes</p>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-4 shadow-xs border border-slate-200/80 flex items-center gap-3.5 hover:border-blue-200 transition">
          <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 border border-blue-100 flex items-center justify-center shrink-0">
            <Send className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-500">In Transit On Road</p>
            <h3 className="text-xl font-bold text-slate-800 leading-tight mt-0.5">
              {stats.inTransit} Consignments
            </h3>
            <p className="text-[11px] text-blue-600 font-medium">Active delivery routes</p>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-4 shadow-xs border border-slate-200/80 flex items-center gap-3.5 hover:border-purple-200 transition">
          <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 border border-purple-100 flex items-center justify-center shrink-0">
            <CheckCircle2 className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-500">Delivered &amp; Received</p>
            <h3 className="text-xl font-bold text-slate-800 leading-tight mt-0.5">
              {stats.delivered} Closed
            </h3>
            <p className="text-[11px] text-purple-600 font-medium">Customer receipt verified</p>
          </div>
        </div>
      </div>

      {/* Outward Dispatches Master Card */}
      <div className="bg-white rounded-2xl shadow-xs border border-slate-200/80 overflow-hidden">
        {/* Filter Section Header & Inputs */}
        <div className="p-4 sm:p-5 border-b border-slate-100 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
                <Truck className="w-4 h-4" />
              </div>
              <div>
                <h2 className="text-sm font-bold text-slate-800">Outward Dispatch Manifest Register</h2>
                <p className="text-[11px] text-slate-500">Filter shipments by customer destination, origin shade, dispatch type, or transit status.</p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs bg-indigo-50 text-indigo-700 font-bold px-3 py-1 rounded-full border border-indigo-200/60">
                {filteredDispatches.length} Dispatches Found
              </span>
              {(searchQuery || filterType !== 'ALL' || filterShade !== 'ALL' || filterCustomer !== 'ALL' || filterStatus !== 'ALL') && (
                <button
                  type="button"
                  onClick={() => {
                    setFilterType('ALL')
                    setFilterShade('ALL')
                    setFilterCustomer('ALL')
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
              placeholder="Search dispatch ref (DSP-2026-...), PO/indent number, customer hub, product, SKU, vehicle no, driver name..."
              className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-10 py-2.5 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 focus:bg-white transition"
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

          {/* 4 Dynamic Filter Dropdowns */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 pt-1 text-xs">
            <div>
              <label className="block text-[11px] font-bold text-slate-600 mb-1.5">
                Dispatch Type
              </label>
              <CustomSelect
                value={filterType}
                onChange={(val) => {
                  setFilterType(val)
                  setCurrentPage(1)
                }}
                options={typeOptions}
                placeholder="All Dispatch Types"
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
                options={dynamicShadeOptions}
                placeholder="All Warehouse Shades"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-600 mb-1.5">
                Customer Hub
              </label>
              <CustomSelect
                value={filterCustomer}
                onChange={(val) => {
                  setFilterCustomer(val)
                  setCurrentPage(1)
                }}
                options={dynamicCustomerOptions}
                placeholder="All Customer Hubs"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-600 mb-1.5">
                Transit Status
              </label>
              <CustomSelect
                value={filterStatus}
                onChange={(val) => {
                  setFilterStatus(val)
                  setCurrentPage(1)
                }}
                options={statusOptions}
                placeholder="All Dispatch Statuses"
              />
            </div>
          </div>
        </div>

        {/* Dispatches Table */}
        <div className="overflow-x-auto no-scrollbar">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-50/75 border-b border-slate-200/80 text-slate-500 font-semibold uppercase tracking-wider text-[10px]">
                <th className="py-3 px-4 w-12 text-center">#</th>
                <th className="py-3 px-4 min-w-[140px]">Dispatch &amp; Date</th>
                <th className="py-3 px-4 min-w-[140px]">PO / Indent</th>
                <th className="py-3 px-4 min-w-[180px]">Customer Destination</th>
                <th className="py-3 px-4 min-w-[130px]">Origin Shade</th>
                <th className="py-3 px-4 min-w-[150px] text-right">Base Qty &amp; Packs</th>
                <th className="py-3 px-4 min-w-[140px]">Vehicle &amp; Driver</th>
                <th className="py-3 px-4 min-w-[100px] text-center">QC Check</th>
                <th className="py-3 px-4 min-w-[120px] text-center">Status</th>
                <th className="py-3 px-4 min-w-[140px] text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={10} className="py-12 text-center text-slate-400">
                    <RefreshCw className="w-8 h-8 mx-auto text-indigo-500 animate-spin mb-2" />
                    Loading outward dispatches...
                  </td>
                </tr>
              ) : paginatedDispatches.length === 0 ? (
                <tr>
                  <td colSpan={10} className="py-12 text-center text-slate-400">
                    <Truck className="w-8 h-8 mx-auto text-slate-300 mb-2" />
                    No outward dispatch records match the selected filters.
                  </td>
                </tr>
              ) : (
                paginatedDispatches.map((row, idx) => {
                  const globalIdx = (currentPage - 1) * perPage + idx + 1
                  return (
                    <tr key={row.id} className="hover:bg-slate-50/60 transition group">
                      <td className="py-3 px-4 text-center text-slate-400 font-mono text-[11px]">
                        {globalIdx}
                      </td>

                      <td className="py-3 px-4">
                        <div className="font-bold text-slate-800">{row.dispatchNo}</div>
                        <div className="text-[11px] text-slate-400 flex items-center gap-1 mt-0.5">
                          <Calendar className="w-3 h-3 text-slate-400" />
                          <span>{row.date}</span>
                        </div>
                      </td>

                      <td className="py-3 px-4">
                        <span className="font-mono text-xs font-semibold text-slate-700 bg-slate-100 px-2 py-0.5 rounded-md">
                          {row.poIndentNo}
                        </span>
                        <div className="text-[10px] text-slate-400 mt-1 font-medium truncate max-w-[120px]">{row.dispatchType}</div>
                      </td>

                      <td className="py-3 px-4">
                        <div className="font-semibold text-slate-800">{row.customerUnit}</div>
                        <div className="text-[11px] text-slate-500 font-mono mt-0.5 flex items-center gap-1">
                          <MapPin className="w-3 h-3 text-slate-400" />
                          <span>ETA: {row.expectedDelivery}</span>
                        </div>
                      </td>

                      <td className="py-3 px-4">
                        <span className="text-[11px] font-mono font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded-md border border-indigo-200/60">
                          {row.shadeId}
                        </span>
                        <div className="text-[10px] text-slate-400 font-mono mt-1">{row.location}</div>
                      </td>

                      <td className="py-3 px-4 text-right">
                        <div className="font-bold text-slate-800">
                          {Number(row.totalQty || 0).toLocaleString()} {row.baseUnit}
                        </div>
                        <div className="text-[11px] text-emerald-600 font-medium mt-0.5">
                          {row.packCount} {row.packUnit}
                        </div>
                      </td>

                      <td className="py-3 px-4">
                        <div className="font-semibold text-slate-800 font-mono">{row.vehicleNo}</div>
                        <div className="text-[11px] text-slate-500 flex items-center gap-1 mt-0.5">
                          <User className="w-3 h-3 text-slate-400" />
                          <span>{row.driverName}</span>
                        </div>
                      </td>

                      <td className="py-3 px-4 text-center">
                        <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                          <Check className="w-3 h-3" />
                          <span>{row.labStatus || 'Passed'}</span>
                        </span>
                      </td>

                      <td className="py-3 px-4 text-center">
                        <span
                          className={`inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-1 rounded-full border ${
                            row.status === 'Delivered'
                              ? 'bg-purple-50 text-purple-700 border-purple-200'
                              : row.status === 'In Transit'
                              ? 'bg-blue-50 text-blue-700 border-blue-200'
                              : row.status === 'Dispatched'
                              ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                              : row.status === 'QR Verified / Ready'
                              ? 'bg-cyan-50 text-cyan-700 border-cyan-200'
                              : 'bg-amber-50 text-amber-700 border-amber-200'
                          }`}
                        >
                          <span
                            className={`w-1.5 h-1.5 rounded-full ${
                              row.status === 'Delivered'
                                ? 'bg-purple-500'
                                : row.status === 'In Transit'
                                ? 'bg-blue-500 animate-pulse'
                                : row.status === 'Dispatched'
                                ? 'bg-emerald-500'
                                : row.status === 'QR Verified / Ready'
                                ? 'bg-cyan-500'
                                : 'bg-amber-500'
                            }`}
                          />
                          <span>{row.status}</span>
                        </span>
                      </td>

                      <td className="py-3 px-4 text-center">
                        <div className="flex items-center justify-center gap-1.5">
                          <button
                            type="button"
                            onClick={() => setShowDetailsModal(row)}
                            className="p-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-100 text-slate-600 transition cursor-pointer"
                            title="View Dispatch Manifest"
                          >
                            <Eye className="w-3.5 h-3.5 text-slate-600" />
                          </button>

                          <button
                            type="button"
                            onClick={() => setShowGatePassModal(row)}
                            className="p-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-100 text-slate-600 transition cursor-pointer"
                            title="Print Gate Pass Slip"
                          >
                            <Printer className="w-3.5 h-3.5 text-slate-600" />
                          </button>

                          {row.status !== 'Delivered' ? (
                            <button
                              type="button"
                              onClick={() => handleAdvanceStatus(row.id)}
                              className="px-2 py-1 rounded-lg bg-slate-900 hover:bg-slate-800 text-white text-[11px] font-semibold transition cursor-pointer flex items-center gap-1"
                              title="Advance Dispatch Status"
                            >
                              <span>
                                {row.status === 'Draft / Picklist' || row.status === 'Pending'
                                  ? 'Verify'
                                  : row.status === 'QR Verified / Ready'
                                  ? 'Dispatch'
                                  : row.status === 'Dispatched'
                                  ? 'In Transit'
                                  : 'Deliver'}
                              </span>
                              <ArrowRight className="w-2.5 h-2.5" />
                            </button>
                          ) : (
                            <button
                              type="button"
                              onClick={() => setDeleteConfirmId(row.id)}
                              className="p-1.5 rounded-lg border border-red-200 bg-white hover:bg-red-50 text-red-600 transition cursor-pointer"
                              title="Delete Dispatch"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )}
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
            {Math.min(currentPage * perPage, filteredDispatches.length)} of{' '}
            {filteredDispatches.length} dispatches
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
                    ? 'bg-indigo-600 text-white'
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

      {/* MODAL 1: NEW OUTWARD ISSUE / DISPATCH (100% DYNAMIC) */}
      {showNewDispatchModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-2xl w-full p-4 sm:p-6 max-h-[90dvh] overflow-y-auto no-scrollbar animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-indigo-50 border border-indigo-100 text-indigo-600 flex items-center justify-center">
                  <Plus className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-800">New Outward Issue / Dispatch</h3>
                  <p className="text-xs text-slate-500">Initiate outward shipment manifest with automated dual-unit conversion</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowNewDispatchModal(false)}
                className="p-1.5 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateDispatch} className="mt-5 space-y-4 text-xs">
              {/* Row 1: Customer Destination & PO Indent */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1.5">
                    Customer Hub / Destination Unit *
                  </label>
                  {customers.length > 0 ? (
                    <div className="space-y-1.5">
                      <CustomSelect
                        value={newDispatch.customerUnit}
                        onChange={(val) => setNewDispatch({ ...newDispatch, customerUnit: val })}
                        options={[
                          ...customers.map(c => ({ value: c.name, label: c.name, sublabel: c.address || c.phone })),
                          { value: 'CUSTOM', label: '+ Enter Custom Customer Hub...' }
                        ]}
                      />
                      {newDispatch.customerUnit === 'CUSTOM' && (
                        <input
                          type="text"
                          required
                          placeholder="Type custom customer hub name..."
                          onChange={(e) => setNewDispatch({ ...newDispatch, customerUnit: e.target.value })}
                          className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 focus:bg-white"
                        />
                      )}
                    </div>
                  ) : (
                    <input
                      type="text"
                      required
                      value={newDispatch.customerUnit}
                      onChange={(e) => setNewDispatch({ ...newDispatch, customerUnit: e.target.value })}
                      placeholder="e.g. Reliance Retail Mega Hub"
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 focus:bg-white"
                    />
                  )}
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1.5">
                    PO / Indent Reference *
                  </label>
                  <input
                    type="text"
                    required
                    value={newDispatch.poIndentNo}
                    onChange={(e) => setNewDispatch({ ...newDispatch, poIndentNo: e.target.value })}
                    placeholder="SO-2026-9041"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 font-mono focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 focus:bg-white"
                  />
                </div>
              </div>

              {/* Row 2: Origin Shade & Dispatch Type */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1.5">
                    Origin Warehouse Shade *
                  </label>
                  <CustomSelect
                    value={newDispatch.shadeId}
                    onChange={(val) => {
                      const sh = shadesList.find((s) => s.id === val)
                      setNewDispatch({
                        ...newDispatch,
                        shadeId: val,
                        baseUnit: sh ? sh.baseUnit : 'Kg',
                        packUnit: sh ? sh.packUnit : 'Bags (50kg)',
                        unitsPerPack: sh ? sh.unitsPerPack : 50,
                      })
                    }}
                    options={shadesList.map((s) => ({ value: s.id, label: s.name }))}
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1.5">
                    Dispatch Type *
                  </label>
                  <CustomSelect
                    value={newDispatch.dispatchType}
                    onChange={(val) => setNewDispatch({ ...newDispatch, dispatchType: val })}
                    options={typeOptions.filter(t => t.value !== 'ALL')}
                  />
                </div>
              </div>

              {/* Row 3: Dynamic Product Selection & SKU */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="block text-[11px] font-bold text-slate-700">
                      Product Item Name *
                    </label>
                    {products.length > 0 && (
                      <span className="text-[10px] text-indigo-600 font-semibold">
                        {products.length} Products in Inventory
                      </span>
                    )}
                  </div>
                  {products.length > 0 ? (
                    <CustomSelect
                      value={selectedProductId}
                      onChange={handleSelectProduct}
                      options={[
                        ...products.map(p => ({
                          value: p._id,
                          label: p.name,
                          sublabel: `SKU: ${p.sku} | Stock: ${p.currentStock || 0} ${p.baseUnit || 'Kg'}`
                        })),
                        { value: 'CUSTOM_PROD', label: '+ Enter Custom Product Item...' }
                      ]}
                      placeholder="Select product from inventory..."
                    />
                  ) : null}

                  {(!products.length || selectedProductId === 'CUSTOM_PROD') && (
                    <input
                      type="text"
                      required
                      value={newDispatch.productName}
                      onChange={(e) => setNewDispatch({ ...newDispatch, productName: e.target.value })}
                      placeholder="e.g. Basmati Rice (Grade 1 Special 25kg)"
                      className="w-full mt-2 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 focus:bg-white"
                    />
                  )}
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1.5">
                    SKU Code *
                  </label>
                  <input
                    type="text"
                    required
                    value={newDispatch.sku}
                    onChange={(e) => setNewDispatch({ ...newDispatch, sku: e.target.value })}
                    placeholder="PRD-RIC-001"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 font-mono focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 focus:bg-white"
                  />
                </div>
              </div>

              {/* Row 4: Packaging Packs Count & Units Per Pack Ratio */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1.5 flex items-center justify-between">
                    <span>Packaging Packs Count ({newDispatch.packUnit || 'Packs'}) *</span>
                    {newDispatch.availableStock > 0 && (
                      <span className="text-[10px] text-emerald-600 font-semibold">
                        Avail: {newDispatch.availableStock} {newDispatch.baseUnit}
                      </span>
                    )}
                  </label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={newDispatch.packsCount}
                    onChange={(e) => setNewDispatch({ ...newDispatch, packsCount: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 font-bold focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 focus:bg-white"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1.5">
                    Units Per Pack Ratio ({newDispatch.baseUnit} per {newDispatch.packUnit?.split(' ')?.[0] || 'Pack'})
                  </label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={newDispatch.unitsPerPack}
                    onChange={(e) => setNewDispatch({ ...newDispatch, unitsPerPack: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 focus:bg-white"
                  />
                </div>
              </div>

              {/* Row 5: Batch Number & FEFO Expiry Date */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1.5">
                    Batch / Lot Number *
                  </label>
                  <input
                    type="text"
                    required
                    value={newDispatch.batchNo}
                    onChange={(e) => setNewDispatch({ ...newDispatch, batchNo: e.target.value })}
                    placeholder="BAT-2026-RIC-01"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 font-mono focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 focus:bg-white"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1.5 flex items-center justify-between">
                    <span>Batch Expiry Date *</span>
                    <span className="text-[10px] text-amber-700 font-bold bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                      FEFO Priority Pick
                    </span>
                  </label>
                  <input
                    type="date"
                    required
                    value={newDispatch.expiryDate}
                    onChange={(e) => setNewDispatch({ ...newDispatch, expiryDate: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 focus:bg-white"
                  />
                </div>
              </div>

              {/* Row 6: Vehicle Number & Driver Name */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1.5">
                    Vehicle Number *
                  </label>
                  <input
                    type="text"
                    required
                    value={newDispatch.vehicleNo}
                    onChange={(e) => setNewDispatch({ ...newDispatch, vehicleNo: e.target.value })}
                    placeholder="DL-1L-AA-5544"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 font-mono uppercase focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 focus:bg-white"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1.5">
                    Driver Full Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={newDispatch.driverName}
                    onChange={(e) => setNewDispatch({ ...newDispatch, driverName: e.target.value })}
                    placeholder="Mohd. Imran"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 focus:bg-white"
                  />
                </div>
              </div>

              {/* Live Calculation Preview Banner */}
              <div className="bg-indigo-50/70 border border-indigo-100 rounded-xl p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <p className="text-[11px] text-indigo-700 font-semibold">Automatic Base Unit Calculation</p>
                  <p className="text-xs text-indigo-950 font-bold mt-0.5">
                    {Number(newDispatch.packsCount) || 0} {newDispatch.packUnit || 'Packs'} × {Number(newDispatch.unitsPerPack) || 1} ={' '}
                    <span className="text-sm font-black text-indigo-600">
                      {((Number(newDispatch.packsCount) || 0) * (Number(newDispatch.unitsPerPack) || 1)).toLocaleString()}{' '}
                      {newDispatch.baseUnit || 'Kg'}
                    </span>
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="inline-flex items-center gap-1 text-[10px] font-bold bg-emerald-100 text-emerald-800 px-2.5 py-1 rounded-md">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-700" />
                    <span>✓ Lab Passed</span>
                  </span>
                </div>
              </div>

              {/* Submit Buttons */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowNewDispatchModal(false)}
                  className="px-4 py-2 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-semibold transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white text-xs font-bold shadow-xs transition cursor-pointer flex items-center gap-1.5"
                >
                  {submitting && <RefreshCw className="w-3.5 h-3.5 animate-spin" />}
                  <span>Confirm &amp; Create Dispatch</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: DISPATCH DETAILS VIEW */}
      {showDetailsModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-2xl w-full p-4 sm:p-6 max-h-[90dvh] overflow-y-auto no-scrollbar animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-indigo-50 border border-indigo-100 text-indigo-600 flex items-center justify-center">
                  <FileText className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-800">
                    Dispatch Manifest #{showDetailsModal.dispatchNo}
                  </h3>
                  <p className="text-xs text-slate-500">
                    Issued on {showDetailsModal.date} • {showDetailsModal.customerUnit}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowDetailsModal(null)}
                className="p-1.5 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="mt-5 space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 bg-slate-50 p-3 sm:p-4 rounded-xl border border-slate-200/80">
                <div>
                  <p className="text-[11px] text-slate-400 font-medium">Customer Unit</p>
                  <p className="font-bold text-slate-800 mt-0.5">{showDetailsModal.customerUnit}</p>
                </div>
                <div>
                  <p className="text-[11px] text-slate-400 font-medium">PO / Indent No</p>
                  <p className="font-bold text-slate-800 font-mono mt-0.5">{showDetailsModal.poIndentNo}</p>
                </div>
                <div>
                  <p className="text-[11px] text-slate-400 font-medium">Vehicle / Driver</p>
                  <p className="font-bold text-slate-800 font-mono mt-0.5">
                    {showDetailsModal.vehicleNo} ({showDetailsModal.driverName})
                  </p>
                </div>
                <div>
                  <p className="text-[11px] text-slate-400 font-medium">Current Status</p>
                  <p className="font-bold text-indigo-600 mt-0.5">{showDetailsModal.status}</p>
                </div>
              </div>

              <div>
                <h4 className="font-bold text-slate-800 text-xs mb-2">Dispatched Line Items</h4>
                <div className="border border-slate-200 rounded-xl overflow-hidden">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-50 text-[10px] uppercase font-bold text-slate-500 border-b border-slate-200">
                      <tr>
                        <th className="py-2.5 px-3">Item &amp; SKU</th>
                        <th className="py-2.5 px-3">Location</th>
                        <th className="py-2.5 px-3">Batch &amp; QC</th>
                        <th className="py-2.5 px-3 text-right">Base Qty</th>
                        <th className="py-2.5 px-3 text-right">Packaging</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {showDetailsModal.itemsList?.map((it, idx) => (
                        <tr key={idx} className="hover:bg-slate-50/50">
                          <td className="py-2.5 px-3">
                            <div className="font-semibold text-slate-800">{it.name}</div>
                            <div className="text-[10px] text-slate-400 font-mono">{it.sku}</div>
                          </td>
                          <td className="py-2.5 px-3 font-mono text-slate-600">{it.location}</td>
                          <td className="py-2.5 px-3">
                            <div className="font-mono text-slate-700">{it.batch}</div>
                            <div className="text-[10px] text-emerald-600 font-bold">{it.labCert || 'COA-PASSED'}</div>
                          </td>
                          <td className="py-2.5 px-3 text-right font-bold text-slate-900">
                            {Number(it.qty || 0).toLocaleString()} {it.baseUnit || showDetailsModal.baseUnit}
                          </td>
                          <td className="py-2.5 px-3 text-right text-indigo-600 font-semibold">
                            {it.packQty} {it.packUnit || showDetailsModal.packUnit}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200/80">
                <p className="text-[11px] text-slate-400 font-medium">Remarks / Delivery Notes</p>
                <p className="text-slate-700 mt-1">{showDetailsModal.remarks || 'Standard verified outward dispatch.'}</p>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => {
                    setShowGatePassModal(showDetailsModal)
                    setShowDetailsModal(null)
                  }}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition cursor-pointer"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>Print Gate Pass Slip</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 3: PRINTABLE GATE PASS VOUCHER */}
      {showGatePassModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-lg w-full p-4 sm:p-6 max-h-[90dvh] overflow-y-auto no-scrollbar animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Printer className="w-4 h-4 text-indigo-600" />
                <h3 className="text-sm font-bold text-slate-800">Print Outward Gate Pass Slip</h3>
              </div>
              <button
                type="button"
                onClick={() => setShowGatePassModal(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Printable Voucher Card */}
            <div id="printable-issue-dispatch-gatepass" className="printable-area mt-4 p-5 bg-white border border-slate-300 rounded-xl shadow-xs space-y-4 text-xs font-mono">
              <div className="text-center border-b border-slate-200 pb-3">
                <h2 className="text-base font-black tracking-tight text-slate-900">CENTRAL WAREHOUSE LOGISTICS</h2>
                <p className="text-[11px] text-slate-500">AUTHORIZED OUTWARD GATE PASS</p>
                <p className="text-[10px] text-indigo-600 font-bold mt-0.5">REF: GP-{showGatePassModal.dispatchNo}</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px]">
                <div>
                  <span className="text-slate-400">Date:</span> {showGatePassModal.date}
                </div>
                <div>
                  <span className="text-slate-400">Dispatch:</span> {showGatePassModal.dispatchNo}
                </div>
                <div>
                  <span className="text-slate-400">Vehicle:</span> {showGatePassModal.vehicleNo}
                </div>
                <div>
                  <span className="text-slate-400">Driver:</span> {showGatePassModal.driverName}
                </div>
                <div className="col-span-2">
                  <span className="text-slate-400">Customer:</span> {showGatePassModal.customerUnit}
                </div>
                <div className="col-span-2">
                  <span className="text-slate-400">Total Cargo:</span> {Number(showGatePassModal.totalQty || 0).toLocaleString()} {showGatePassModal.baseUnit} ({showGatePassModal.packCount} {showGatePassModal.packUnit})
                </div>
              </div>

              <div className="border-t border-b border-slate-200 py-3 flex items-center justify-between">
                <div>
                  <p className="text-[10px] text-slate-400 uppercase">QA Security Clearance</p>
                  <p className="text-xs font-bold text-emerald-700">✓ 100% LAB QC PASSED</p>
                </div>
                <div className="flex flex-col items-center gap-1 shrink-0">
                  <div className="w-16 h-16 bg-white border border-slate-300 rounded-lg p-1 flex items-center justify-center shadow-xs overflow-hidden">
                    {gatePassQrUrl ? (
                      <img
                        src={gatePassQrUrl}
                        alt="Dispatch Gate Pass QR"
                        className="w-full h-full object-contain"
                        title="Scan with any camera to verify dispatch details"
                      />
                    ) : (
                      <QrCode className="w-10 h-10 text-slate-800" />
                    )}
                  </div>
                  <span className="text-[8px] font-mono font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200">
                    SCAN TO VERIFY
                  </span>
                </div>
              </div>

              <div className="pt-2 flex items-center justify-between text-[10px] text-slate-400">
                <span>Security Officer: R. Sharma</span>
                <span>Gate Stamp: APPROVED</span>
              </div>
            </div>

            <div className="mt-5 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => setShowGatePassModal(null)}
                className="px-4 py-2 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-semibold transition cursor-pointer"
              >
                Close
              </button>
              <button
                type="button"
                onClick={() => {
                  printSpecificElement('#printable-issue-dispatch-gatepass', `Gate Pass - ${showGatePassModal.dispatchNo}`)
                  triggerToast('Gate Pass sent to printer.')
                }}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-xs transition cursor-pointer"
              >
                <Printer className="w-4 h-4" />
                <span>Print Document</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 4: DELETE CONFIRMATION */}
      {deleteConfirmId && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-5 max-w-sm w-full shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95">
            <div className="flex items-center gap-3 text-red-600 mb-3">
              <div className="w-10 h-10 rounded-xl bg-red-50 flex items-center justify-center border border-red-100">
                <AlertCircle className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-800">Delete Dispatch Order?</h3>
                <p className="text-xs text-slate-500">This action cannot be undone.</p>
              </div>
            </div>
            <p className="text-xs text-slate-600 mb-4">
              Are you sure you want to delete this outward dispatch manifest record?
            </p>
            <div className="flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setDeleteConfirmId(null)}
                className="px-3.5 py-1.5 rounded-xl border border-slate-200 text-slate-600 text-xs font-semibold hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => handleDeleteDispatch(deleteConfirmId)}
                className="px-3.5 py-1.5 rounded-xl bg-red-600 text-white text-xs font-bold hover:bg-red-700 shadow-xs"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
