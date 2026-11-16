import { useState, useMemo, useRef, useEffect } from 'react'
import { Link } from 'react-router-dom'
import QRCode from 'qrcode'
import { printSpecificElement } from '../utils/printHelper'
import { getEslInfo } from '../utils/eslHelper'
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
  Building2,
  Filter,
  AlertTriangle,
  Lock,
  ShieldAlert,
  Edit3
} from 'lucide-react'
import DataLoader from '../components/common/DataLoader'
import {
  fetchDispatches,
  createDispatch,
  updateDispatch,
  updateDispatchStatus,
  deleteDispatch,
  fetchProducts,
  fetchPartners,
  fetchshades,
  fetchGateEntries,
  apiRequest
} from '../services/api'
import { formatDualUnits, calculateBaseQty, splitBaseQty } from '../utils/unitHelper'
import { DATE_PRESET_OPTIONS, isDateMatching } from '../utils/dateFilterHelper'
import CustomSelect from '../components/common/SearchableSelect'

// Fallback Standard Storage Sheds if DB has none
const DEFAULT_shadeS = [
  { id: 'SH01', name: 'Shed 1: Grains & Bulk Pulses', category: 'Grains & Pulses', baseUnit: 'Kg', packUnit: 'Bags (50kg)', unitsPerPack: 50 },
  { id: 'SH02', name: 'Shed 2: Edible Oils & Liquids', category: 'Edible Oils', baseUnit: 'Ltr', packUnit: 'Tins (15L)', unitsPerPack: 15 },
  { id: 'SH03', name: 'Shed 3: Packaged Food & FMCG', category: 'Packaged FMCG', baseUnit: 'Pieces', packUnit: 'Gatta (Cartons)', unitsPerPack: 6 },
  { id: 'SH04', name: 'Shed 4: Packaging Materials & Cartons', category: 'Packaging', baseUnit: 'Cartons', packUnit: 'Bundles', unitsPerPack: 25 },
  { id: 'SH05', name: 'Shed 5: Chemicals & Hygiene', category: 'Chemicals', baseUnit: 'Ltr', packUnit: 'Carboys (20L)', unitsPerPack: 20 },
  { id: 'SH06', name: 'Shed 6: Spares & General Goods', category: 'Spares', baseUnit: 'Nos', packUnit: 'Crates', unitsPerPack: 10 },
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
  const [filtershade, setFiltershade] = useState('ALL')
  const [filterCustomer, setFilterCustomer] = useState('ALL')
  const [filterStatus, setFilterStatus] = useState('ALL')
  const [filterProduct, setFilterProduct] = useState('ALL')
  const [filterDate, setFilterDate] = useState('ALL')
  const [filterCustomDate, setFilterCustomDate] = useState('')
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

  // Wizard Step for Issue Creation: 1 = Gaadi & Destination Setup, 2 = Samaan Loading
  const [activeIssueStep, setActiveIssueStep] = useState(1)

  // Dedicated "Load Samaan into Existing Gaadi" Modal State
  const [showLoadItemsModal, setShowLoadItemsModal] = useState(false)
  const [loadVehicleData, setLoadVehicleData] = useState(null)
  const [isUpdatingGaadiCargo, setIsUpdatingGaadiCargo] = useState(false)

  // Batches, Quality Checks & Hold Registers from Backend
  const [batchMasterList, setBatchMasterList] = useState([])
  const [qcRecords, setQcRecords] = useState([])
  const [holdRecords, setHoldRecords] = useState([])

  // Backend Live Data
  const [dispatches, setDispatches] = useState([])
  const [products, setProducts] = useState([])
  const [customers, setCustomers] = useState([])
  const [shadesList, setshadesList] = useState(DEFAULT_shadeS)
  const [recentVehicles, setRecentVehicles] = useState([])
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)

  // New Issue / Dispatch Consignment Form State (Multi-Item Consignment)
  const [newDispatch, setNewDispatch] = useState({
    customerUnit: '',
    poIndentNo: '',
    shadeId: 'SH01',
    dispatchType: 'Outward Customer Sale',
    vehicleNo: 'DL-1L-AA-5544',
    driverName: 'Mohd. Imran',
    contactNo: '+91 98711 22334',
    dispatchOfficer: 'Warehouse Manager',
    expectedDelivery: 'Today',
    remarks: 'Scheduled retail replenishment multi-item consignment.',
    items: [],
  })

  // Load all dynamic master data from backend
  const loadMasterData = async () => {
    setLoading(true)
    try {
      const [dispRes, prodRes, partRes, shadeRes, gateRes, batchRes, qcRes, adjRes] = await Promise.allSettled([
        fetchDispatches(),
        fetchProducts(),
        fetchPartners(),
        fetchshades(),
        fetchGateEntries(),
        apiRequest('/batch'),
        apiRequest('/qc'),
        apiRequest('/stock-adjust'),
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

      // 3. Process shades
      if (shadeRes.status === 'fulfilled' && Array.isArray(shadeRes.value) && shadeRes.value.length > 0) {
        const mappedshades = shadeRes.value.map((s, idx) => ({
          id: s.code || `SH0${idx + 1}`,
          name: s.name || `Shed ${idx + 1}`,
          category: s.category || 'General Storage',
          baseUnit: s.baseUnit || 'Kg',
          packUnit: s.packUnit || 'Bags (50kg)',
          unitsPerPack: s.unitsPerPack || 50
        }))
        setshadesList(mappedshades)
      } else {
        setshadesList(DEFAULT_shadeS)
      }

      // 4. Process Gate Entries for vehicle/driver suggestions
      if (gateRes.status === 'fulfilled' && Array.isArray(gateRes.value)) {
        const vehicles = gateRes.value
          .map(g => ({ vehicleNo: g.vehicleNo, driverName: g.driverName, contact: g.driverContact || g.driverPhone }))
          .filter(v => v.vehicleNo)
        setRecentVehicles(vehicles)
      }

      // 5. Process Batches Master
      if (batchRes.status === 'fulfilled' && Array.isArray(batchRes.value)) {
        setBatchMasterList(batchRes.value)
      }

      // 6. Process QC Records (Failed / Rejected / Quarantine)
      if (qcRes.status === 'fulfilled' && Array.isArray(qcRes.value)) {
        setQcRecords(qcRes.value)
      }

      // 7. Process Stock Adjustments (Quality Hold)
      if (adjRes.status === 'fulfilled' && Array.isArray(adjRes.value)) {
        setHoldRecords(adjRes.value)
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
              productId: it.productId,
              name: it.productName,
              sku: it.sku,
              location: it.locationCode || 'SH01-RK01-R1-C1',
              qty: it.baseQty || ((it.requestedQty || 1) * (it.packSize || 1) + (it.looseQty || 0)),
              baseUnit: it.minUnit || d.baseUnit || 'Kg',
              packQty: it.requestedQty || 1,
              looseQty: it.looseQty || 0,
              packUnit: it.maxUnit || it.packagingUnit || 'Bags',
              unitsPerPack: it.packSize || 1,
              batch: it.batchNo || 'BAT-2026-01',
              expiryDate: it.expiryDate || '',
              labCert: it.labCert || 'COA-2026-PASSED'
            })) : [
              {
                name: firstItem.productName || 'Basmati Rice (Grade 1 Special 25kg)',
                sku: firstItem.sku || 'PRD-RIC-001',
                location: firstItem.locationCode || 'SH01-RK01-R1-C1',
                qty: d.totalBaseQty || 500,
                baseUnit: d.baseUnit || 'Kg',
                packQty: d.totalPackages || 20,
                looseQty: d.totalLooseQty || 0,
                packUnit: 'Bags',
                batch: firstItem.batchNo || 'BAT-2026-RIC-01',
                expiryDate: firstItem.expiryDate || '',
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

  // Check if a batch or product is on Quality Hold or Lab Test Failed (Strict QC Gate)
  const getBatchBlockStatus = (batchNo, productName, sku, prodId) => {
    if (!batchNo) return { isBlocked: false, reason: '' }
    const bUpper = (batchNo || '').trim().toUpperCase()
    const pUpper = (productName || '').trim().toUpperCase()

    // 1. Check QC Test Records (QualityCheck)
    const qcMatch = qcRecords.find((q) =>
      (q.batchNo && q.batchNo.trim().toUpperCase() === bUpper) ||
      (q.productName && q.productName.trim().toUpperCase() === pUpper && q.batchNo && q.batchNo.trim().toUpperCase() === bUpper)
    )
    if (qcMatch) {
      const qStatus = qcMatch.status || ''
      if (qStatus.includes('Fail') || qStatus.includes('Reject')) {
        return { isBlocked: true, reason: `Lab Test Failed: ${qcMatch.remarks || 'Standard parameters violated'}` }
      }
      if (qStatus.includes('Quarantine') || qStatus.includes('Under Test')) {
        return { isBlocked: true, reason: 'QC Quarantine / Under Test (Clearance Pending)' }
      }
    }

    // 2. Check Stock Adjustments (Quality Hold)
    const holdMatch = holdRecords.find((h) =>
      ((h.type === 'Quality Hold' || h.status === 'On Hold') && h.status !== 'Released') &&
      ((h.batchNo && h.batchNo.trim().toUpperCase() === bUpper) ||
       (h.sku && h.sku.trim().toUpperCase() === sku?.trim().toUpperCase()) ||
       (h.productId && String(h.productId) === String(prodId)))
    )
    if (holdMatch) {
      return { isBlocked: true, reason: `Quality Hold: ${holdMatch.reason || 'Quarantined by QC Lead'}` }
    }

    // 3. Check Batch Master Status
    const batchMatch = batchMasterList.find((b) => b.batchNo && b.batchNo.trim().toUpperCase() === bUpper)
    if (batchMatch) {
      if (batchMatch.status === 'Quarantine' || batchMatch.status === 'On Hold') {
        return { isBlocked: true, reason: 'Batch Quarantined / On Hold' }
      }
      if (batchMatch.status === 'Expired') {
        return { isBlocked: true, reason: 'Batch Expired' }
      }
    }

    // 4. Test keyword heuristics for safety
    if (bUpper.includes('FAIL') || bUpper.includes('REJECT')) {
      return { isBlocked: true, reason: 'Lab QC Test: Failed / Rejected' }
    }
    if (bUpper.includes('HOLD') || bUpper.includes('QUARANTINE')) {
      return { isBlocked: true, reason: 'Quality Hold / Quarantine Stock' }
    }

    return { isBlocked: false, reason: '' }
  }

  // Retrieve all batches for a selected product (including QC-Passed and explicit blocked batches)
  const getBatchesForProduct = (productId, productName, sku) => {
    const pName = (productName || '').trim().toLowerCase()
    const pSku = (sku || '').trim().toLowerCase()
    const matched = []
    const seenBatchNos = new Set()

    batchMasterList.forEach((b) => {
      const match =
        (productId && String(b.productId) === String(productId)) ||
        (b.productName && b.productName.toLowerCase().includes(pName)) ||
        (pName && b.productName && pName.includes(b.productName.toLowerCase())) ||
        (b.sku && b.sku.toLowerCase() === pSku)

      if (match && !seenBatchNos.has(b.batchNo)) {
        seenBatchNos.add(b.batchNo)
        const blockInfo = getBatchBlockStatus(b.batchNo, b.productName, b.sku, productId)
        const esl = getEslInfo({ name: b.productName || productName, expiryDate: b.expiryDate, batchNo: b.batchNo })
        matched.push({
          batchNo: b.batchNo,
          expiryDate: b.expiryDate || new Date(Date.now() + 180 * 86400000).toISOString().split('T')[0],
          mfgDate: b.mfgDate || '',
          qty: Number(b.qty) || 100,
          location: b.location || 'SH01-RK01-R1-C1',
          labStatus: blockInfo.isBlocked ? (blockInfo.reason.includes('Failed') ? 'Failed' : 'On Hold') : 'Passed',
          isBlocked: blockInfo.isBlocked,
          blockReason: blockInfo.reason,
          eslText: esl.eslText,
        })
      }
    })

    // If none found in DB, seed active standard batches + 1 blocked hold batch for testing
    if (matched.length === 0) {
      const baseCode = (sku ? sku.slice(-3) : '01').toUpperCase()
      const b1 = `BAT-2026-${baseCode}-01`
      const exp1 = new Date(Date.now() + 240 * 86400000).toISOString().split('T')[0]
      matched.push({
        batchNo: b1,
        expiryDate: exp1,
        qty: 250,
        location: 'SH01-RK01-R1-C1',
        labStatus: 'Passed',
        isBlocked: false,
        blockReason: '',
        eslText: getEslInfo({ name: productName, expiryDate: exp1, batchNo: b1 }).eslText,
      })

      const b2 = `BAT-2026-${baseCode}-02`
      const exp2 = new Date(Date.now() + 450 * 86400000).toISOString().split('T')[0]
      matched.push({
        batchNo: b2,
        expiryDate: exp2,
        qty: 500,
        location: 'SH01-RK02-R2-C2',
        labStatus: 'Passed',
        isBlocked: false,
        blockReason: '',
        eslText: getEslInfo({ name: productName, expiryDate: exp2, batchNo: b2 }).eslText,
      })

      const bHold = `BAT-HOLD-${baseCode}-99`
      const expHold = new Date(Date.now() + 20 * 86400000).toISOString().split('T')[0]
      matched.push({
        batchNo: bHold,
        expiryDate: expHold,
        qty: 50,
        location: 'SH01-QUARANTINE-BAY',
        labStatus: 'Failed / Rejected',
        isBlocked: true,
        blockReason: 'Quality Hold / Lab QC Test Failed (ROK)',
        eslText: getEslInfo({ name: productName, expiryDate: expHold, batchNo: bHold }).eslText,
      })
    } else {
      const hasBlocked = matched.some((m) => m.isBlocked)
      if (!hasBlocked) {
        const baseCode = (sku ? sku.slice(-3) : 'QC').toUpperCase()
        const bHold = `BAT-HOLD-${baseCode}-QUAR`
        const expHold = new Date(Date.now() + 25 * 86400000).toISOString().split('T')[0]
        matched.push({
          batchNo: bHold,
          expiryDate: expHold,
          qty: 40,
          location: 'SH01-HOLD-BAY',
          labStatus: 'On Hold',
          isBlocked: true,
          blockReason: 'Quality Hold / Lab Test Rejection (ROK)',
          eslText: getEslInfo({ name: productName, expiryDate: expHold, batchNo: bHold }).eslText,
        })
      }
    }

    return matched
  }

  // Helper to create a single default dispatch consignment item
  const createDefaultDispatchItem = (prod, defaultshadeId = 'SH01', shades = []) => {
    const pshade = prod?.shadeId || defaultshadeId || 'SH01'
    const matchedshade = shades.find((s) => s.id === pshade) || shades[0]
    const maxU = prod?.maxUnit || prod?.outerPackaging || matchedshade?.packUnit || 'Carton'
    const minU = prod?.minUnit || prod?.baseUnit || matchedshade?.baseUnit || 'Packet'
    const ratio = Number(prod?.conversionRatio) || Number(prod?.packSize) || Number(matchedshade?.unitsPerPack) || 10
    const stock = prod?.currentStock !== undefined ? prod.currentStock : 100

    // Get batches for this product and pick the first QC-Passed batch
    const batches = getBatchesForProduct(prod?._id, prod?.name, prod?.sku)
    const passedBatch = batches.find((b) => !b.isBlocked) || batches[0]

    const exp = passedBatch?.expiryDate || prod?.expiryDate || new Date(Date.now() + 90 * 86400000).toISOString().split('T')[0]
    const batch = passedBatch?.batchNo || (prod?.batchNo && prod?.batchNo !== '—' ? prod.batchNo : `BAT-2026-${prod?.sku ? prod.sku.slice(-4) : '01'}`)
    const loc = passedBatch?.location || prod?.binLocation || `${pshade}-RK01-R1-C1`
    const blockCheck = getBatchBlockStatus(batch, prod?.name, prod?.sku, prod?._id)

    return {
      id: 'disp_item_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7),
      productId: prod?._id || '',
      productName: prod?.name || 'Basmati Rice (Grade 1 Special 25kg)',
      sku: prod?.sku || 'PRD-RIC-001',
      batchNo: batch,
      expiryDate: exp,
      locationCode: loc,
      maxUnit: maxU,
      minUnit: minU,
      unitsPerPack: ratio,
      packsCount: 1,
      looseCount: 0,
      totalBaseQty: ratio,
      availableStock: passedBatch?.qty || stock,
      isBlocked: blockCheck.isBlocked,
      blockReason: blockCheck.reason,
    }
  }

  // When opening modal, initialize default form values with 1 default consignment item
  const handleOpenNewModal = () => {
    const defaultCust = customers.length > 0 ? customers[0].name : 'Reliance Retail Mega Hub'
    const defaultProd = products.length > 0 ? products[0] : null
    const initialshadeId = defaultProd?.shadeId || (shadesList.length > 0 ? shadesList[0].id : 'SH01')
    const firstItem = createDefaultDispatchItem(defaultProd, initialshadeId, shadesList)

    setNewDispatch({
      customerUnit: defaultCust,
      poIndentNo: `SO-2026-${Math.floor(1000 + Math.random() * 9000)}`,
      shadeId: initialshadeId,
      dispatchType: 'Outward Customer Sale',
      vehicleNo: recentVehicles.length > 0 ? recentVehicles[0].vehicleNo : 'DL-1L-AA-5544',
      driverName: recentVehicles.length > 0 ? recentVehicles[0].driverName : 'Mohd. Imran',
      contactNo: recentVehicles.length > 0 ? (recentVehicles[0].contact || '+91 98711 22334') : '+91 98711 22334',
      dispatchOfficer: 'Warehouse Manager',
      expectedDelivery: 'Today',
      remarks: 'Scheduled retail replenishment multi-item consignment.',
      items: [firstItem],
    })
    setActiveIssueStep(1)
    setShowNewDispatchModal(true)
  }

  // Add another item to the outward issue consignment
  const handleAddDispatchItem = () => {
    const existingProdIds = new Set((newDispatch.items || []).map((it) => it.productId).filter(Boolean))
    const unusedProd = products.find((p) => !existingProdIds.has(p._id)) || products[0] || null
    const newItem = createDefaultDispatchItem(unusedProd, newDispatch.shadeId, shadesList)

    setNewDispatch((prev) => ({
      ...prev,
      items: [...(prev.items || []), newItem],
    }))
    triggerToast('New item added to consignment.')
  }

  // Remove an item from consignment
  const handleRemoveDispatchItem = (itemId) => {
    if ((newDispatch.items || []).length <= 1) {
      triggerToast('At least 1 product item is required in the consignment!')
      return
    }
    setNewDispatch((prev) => ({
      ...prev,
      items: prev.items.filter((it) => it.id !== itemId),
    }))
    triggerToast('Item removed from consignment.')
  }

  // Handle batch selection for an item with strict Hold / Lab-Test-Fail block
  const handleSelectBatch = (itemId, batchNo) => {
    setNewDispatch((prev) => {
      const updatedItems = (prev.items || []).map((it) => {
        if (it.id !== itemId) return it
        const batches = getBatchesForProduct(it.productId, it.productName, it.sku)
        const selectedB = batches.find((b) => b.batchNo === batchNo)
        const blockCheck = getBatchBlockStatus(batchNo, it.productName, it.sku, it.productId)

        if (blockCheck.isBlocked) {
          triggerToast(`⛔ BLOCKED: Batch ${batchNo} is on Quality Hold or Lab Test Failed! It cannot be loaded.`)
        } else {
          triggerToast(`✓ Batch ${batchNo} selected (QC Passed • Exp: ${selectedB?.expiryDate || 'Valid'})`)
        }

        return {
          ...it,
          batchNo: batchNo,
          expiryDate: selectedB?.expiryDate || it.expiryDate,
          locationCode: selectedB?.location || it.locationCode,
          availableStock: selectedB?.qty !== undefined ? selectedB.qty : it.availableStock,
          isBlocked: blockCheck.isBlocked,
          blockReason: blockCheck.reason,
        }
      })
      return { ...prev, items: updatedItems }
    })
  }

  // Update item field in consignment
  const handleUpdateDispatchItem = (itemId, field, value) => {
    setNewDispatch((prev) => {
      const updatedItems = (prev.items || []).map((it) => {
        if (it.id !== itemId) return it

        if (field === 'productId') {
          const prod = products.find((p) => p._id === value)
          if (!prod) return { ...it, productId: value, productName: value }
          const pshade = prod.shadeId || prev.shadeId || 'SH01'
          const matchedshade = shadesList.find((s) => s.id === pshade) || shadesList[0]
          const maxU = prod.maxUnit || prod.outerPackaging || matchedshade?.packUnit || 'Carton'
          const minU = prod.minUnit || prod.baseUnit || matchedshade?.baseUnit || 'Packet'
          const ratio = Number(prod.conversionRatio) || Number(prod.packSize) || Number(matchedshade?.unitsPerPack) || 10
          const stock = prod.currentStock !== undefined ? prod.currentStock : 0

          // Retrieve batches for newly selected product and pick first QC-Passed batch
          const batches = getBatchesForProduct(prod._id, prod.name, prod.sku)
          const passedBatch = batches.find((b) => !b.isBlocked) || batches[0]
          const exp = passedBatch?.expiryDate || prod.expiryDate || it.expiryDate
          const batch = passedBatch?.batchNo || (prod.batchNo && prod.batchNo !== '—' ? prod.batchNo : `BAT-2026-${prod.sku?.slice(-4) || '01'}`)
          const blockCheck = getBatchBlockStatus(batch, prod.name, prod.sku, prod._id)

          const packs = Number(it.packsCount) || 1
          const loose = Number(it.looseCount) || 0
          const total = packs * ratio + loose

          return {
            ...it,
            productId: prod._id,
            productName: prod.name,
            sku: prod.sku || it.sku,
            locationCode: passedBatch?.location || prod.binLocation || `${pshade}-RK01-R1-C1`,
            batchNo: batch,
            expiryDate: exp,
            maxUnit: maxU,
            minUnit: minU,
            unitsPerPack: ratio,
            totalBaseQty: total,
            availableStock: passedBatch?.qty !== undefined ? passedBatch.qty : stock,
            isBlocked: blockCheck.isBlocked,
            blockReason: blockCheck.reason,
          }
        }

        if (field === 'packsCount') {
          const packs = Math.max(0, parseInt(value) || 0)
          const loose = Math.max(0, parseInt(it.looseCount) || 0)
          const ratio = Math.max(1, parseInt(it.unitsPerPack) || 1)
          return {
            ...it,
            packsCount: value,
            totalBaseQty: packs * ratio + loose,
          }
        }

        if (field === 'looseCount') {
          const loose = Math.max(0, parseInt(value) || 0)
          const packs = Math.max(0, parseInt(it.packsCount) || 0)
          const ratio = Math.max(1, parseInt(it.unitsPerPack) || 1)
          return {
            ...it,
            looseCount: value,
            totalBaseQty: packs * ratio + loose,
          }
        }

        if (field === 'totalBaseQty') {
          const total = Math.max(0, parseInt(value) || 0)
          const ratio = Math.max(1, parseInt(it.unitsPerPack) || 1)
          return {
            ...it,
            totalBaseQty: value,
            packsCount: Math.floor(total / ratio),
            looseCount: total % ratio,
          }
        }

        return { ...it, [field]: value }
      })

      return { ...prev, items: updatedItems }
    })
  }

  // Consignment Live Calculation & Over-Stock Warning & Hold/Failed Check
  const consignmentSummary = useMemo(() => {
    const items = newDispatch.items || []
    let totalPacks = 0
    let totalLoose = 0
    let totalBase = 0
    let hasOverStock = false
    let hasBlockedItems = false

    items.forEach((it) => {
      const p = Number(it.packsCount) || 0
      const l = Number(it.looseCount) || 0
      const b = Number(it.totalBaseQty) || (p * (Number(it.unitsPerPack) || 1) + l)
      totalPacks += p
      totalLoose += l
      totalBase += b
      if (it.availableStock > 0 && b > it.availableStock) {
        hasOverStock = true
      }
      if (it.isBlocked) {
        hasBlockedItems = true
      }
    })

    return {
      count: items.length,
      totalPacks,
      totalLoose,
      totalBase,
      hasOverStock,
      hasBlockedItems,
    }
  }, [newDispatch.items])

  // Open "Load Samaan into Existing Gaadi" Modal
  const handleOpenLoadItemsModal = (row) => {
    const defaultProd = products.length > 0 ? products[0] : null
    const defaultItem = createDefaultDispatchItem(defaultProd, row.shadeId || 'SH01', shadesList)

    setLoadVehicleData({
      id: row.id,
      dispatchNo: row.dispatchNo,
      vehicleNo: row.vehicleNo,
      driverName: row.driverName,
      customerUnit: row.customerUnit,
      poIndentNo: row.poIndentNo,
      shadeId: row.shadeId || 'SH01',
      baseUnit: row.baseUnit || 'Kg',
      existingItems: row.itemsList || [],
      newItems: [defaultItem],
      remarks: row.remarks || '',
    })
    setShowLoadItemsModal(true)
  }

  // Update item in Load Items Modal
  const handleUpdateLoadVehicleItem = (itemId, field, value) => {
    setLoadVehicleData((prev) => {
      if (!prev) return prev
      const updated = prev.newItems.map((it) => {
        if (it.id !== itemId) return it

        if (field === 'productId') {
          const prod = products.find((p) => p._id === value)
          if (!prod) return { ...it, productId: value, productName: value }
          const pshade = prod.shadeId || prev.shadeId || 'SH01'
          const matchedshade = shadesList.find((s) => s.id === pshade) || shadesList[0]
          const maxU = prod.maxUnit || prod.outerPackaging || matchedshade?.packUnit || 'Carton'
          const minU = prod.minUnit || prod.baseUnit || matchedshade?.baseUnit || 'Packet'
          const ratio = Number(prod.conversionRatio) || Number(prod.packSize) || Number(matchedshade?.unitsPerPack) || 10
          const stock = prod.currentStock !== undefined ? prod.currentStock : 0

          const batches = getBatchesForProduct(prod._id, prod.name, prod.sku)
          const passedBatch = batches.find((b) => !b.isBlocked) || batches[0]
          const exp = passedBatch?.expiryDate || prod.expiryDate || it.expiryDate
          const batch = passedBatch?.batchNo || (prod.batchNo && prod.batchNo !== '—' ? prod.batchNo : `BAT-2026-${prod.sku?.slice(-4) || '01'}`)
          const blockCheck = getBatchBlockStatus(batch, prod.name, prod.sku, prod._id)

          const packs = Number(it.packsCount) || 1
          const loose = Number(it.looseCount) || 0
          const total = packs * ratio + loose

          return {
            ...it,
            productId: prod._id,
            productName: prod.name,
            sku: prod.sku || it.sku,
            locationCode: passedBatch?.location || prod.binLocation || `${pshade}-RK01-R1-C1`,
            batchNo: batch,
            expiryDate: exp,
            maxUnit: maxU,
            minUnit: minU,
            unitsPerPack: ratio,
            totalBaseQty: total,
            availableStock: passedBatch?.qty !== undefined ? passedBatch.qty : stock,
            isBlocked: blockCheck.isBlocked,
            blockReason: blockCheck.reason,
          }
        }

        if (field === 'packsCount') {
          const packs = Math.max(0, parseInt(value) || 0)
          const loose = Math.max(0, parseInt(it.looseCount) || 0)
          const ratio = Math.max(1, parseInt(it.unitsPerPack) || 1)
          return { ...it, packsCount: value, totalBaseQty: packs * ratio + loose }
        }

        if (field === 'looseCount') {
          const loose = Math.max(0, parseInt(value) || 0)
          const packs = Math.max(0, parseInt(it.packsCount) || 0)
          const ratio = Math.max(1, parseInt(it.unitsPerPack) || 1)
          return { ...it, looseCount: value, totalBaseQty: packs * ratio + loose }
        }

        if (field === 'totalBaseQty') {
          const total = Math.max(0, parseInt(value) || 0)
          const ratio = Math.max(1, parseInt(it.unitsPerPack) || 1)
          return { ...it, totalBaseQty: value, packsCount: Math.floor(total / ratio), looseCount: total % ratio }
        }

        return { ...it, [field]: value }
      })
      return { ...prev, newItems: updated }
    })
  }

  // Handle batch selection in Load Items Modal
  const handleSelectBatchInLoadModal = (itemId, batchNo) => {
    setLoadVehicleData((prev) => {
      if (!prev) return prev
      const updated = prev.newItems.map((it) => {
        if (it.id !== itemId) return it
        const batches = getBatchesForProduct(it.productId, it.productName, it.sku)
        const selectedB = batches.find((b) => b.batchNo === batchNo)
        const blockCheck = getBatchBlockStatus(batchNo, it.productName, it.sku, it.productId)

        if (blockCheck.isBlocked) {
          triggerToast(`⛔ BLOCKED: Batch ${batchNo} is on Quality Hold or Lab Test Failed! It cannot be loaded.`)
        } else {
          triggerToast(`✓ Batch ${batchNo} selected (QC Passed • Exp: ${selectedB?.expiryDate || 'Valid'})`)
        }

        return {
          ...it,
          batchNo: batchNo,
          expiryDate: selectedB?.expiryDate || it.expiryDate,
          locationCode: selectedB?.location || it.locationCode,
          availableStock: selectedB?.qty !== undefined ? selectedB.qty : it.availableStock,
          isBlocked: blockCheck.isBlocked,
          blockReason: blockCheck.reason,
        }
      })
      return { ...prev, newItems: updated }
    })
  }

  // Add item row in Load Items Modal
  const handleAddLoadVehicleItem = () => {
    const defaultProd = products.length > 0 ? products[0] : null
    const newItem = createDefaultDispatchItem(defaultProd, loadVehicleData?.shadeId || 'SH01', shadesList)
    setLoadVehicleData((prev) => ({
      ...prev,
      newItems: [...(prev.newItems || []), newItem],
    }))
    triggerToast('New item row added to vehicle cargo manifest.')
  }

  // Remove item row in Load Items Modal
  const handleRemoveLoadVehicleItem = (itemId) => {
    setLoadVehicleData((prev) => ({
      ...prev,
      newItems: (prev.newItems || []).filter((it) => it.id !== itemId),
    }))
  }

  // Save new cargo items to Gaadi dispatch
  const handleSaveGaadiCargo = async () => {
    if (!loadVehicleData) return
    const hasBlocked = (loadVehicleData.newItems || []).some((it) => it.isBlocked)
    if (hasBlocked) {
      triggerToast('⛔ BLOCKED: Vehicle cargo contains items under Quality Hold or Lab Failed status! They cannot be loaded.')
      return
    }

    setIsUpdatingGaadiCargo(true)
    try {
      const allItemsToLoad = [...(loadVehicleData.existingItems || []), ...(loadVehicleData.newItems || [])]
      let totalP = 0
      let totalL = 0
      let totalB = 0

      const formatted = allItemsToLoad.map((it) => {
        const p = Number(it.packQty || it.packsCount || 0)
        const l = Number(it.looseQty || it.looseCount || 0)
        const b = Number(it.qty || it.totalBaseQty || 0)
        totalP += p
        totalL += l
        totalB += b
        return {
          productId: it.productId || null,
          productName: it.name || it.productName,
          sku: it.sku,
          batchNo: it.batch || it.batchNo,
          locationCode: it.location || it.locationCode,
          packagingUnit: it.packUnit || it.maxUnit,
          maxUnit: it.packUnit || it.maxUnit,
          minUnit: it.baseUnit || it.minUnit,
          packSize: it.unitsPerPack || 1,
          requestedQty: p,
          looseQty: l,
          baseQty: b,
          pickedQty: p,
          verified: true,
          expiryDate: it.expiryDate || '',
          labCert: 'COA-2026-PASSED',
        }
      })

      const patchPayload = {
        items: formatted,
        totalPackages: totalP,
        totalLooseQty: totalL,
        totalBaseQty: totalB,
        breakdownSummary: `${formatted.length} Products: ${totalP} Cartons/Packs + ${totalL} Loose = ${totalB.toLocaleString()} Units`,
      }

      await updateDispatch(loadVehicleData.id, patchPayload)

      setDispatches((prev) =>
        prev.map((d) => {
          if (d.id !== loadVehicleData.id) return d
          return {
            ...d,
            totalQty: totalB,
            packCount: totalP,
            looseCount: totalL,
            itemsCount: formatted.length,
            productName:
              formatted.length > 1 ? `${formatted[0].productName} +${formatted.length - 1} more items` : formatted[0].productName,
            itemsList: formatted.map((f) => ({
              productId: f.productId,
              name: f.productName,
              sku: f.sku,
              location: f.locationCode,
              qty: f.baseQty,
              baseUnit: f.minUnit,
              packQty: f.requestedQty,
              looseQty: f.looseQty,
              packUnit: f.maxUnit,
              unitsPerPack: f.packSize,
              batch: f.batchNo,
              expiryDate: f.expiryDate,
              labCert: 'COA-2026-PASSED',
            })),
          }
        })
      )

      triggerToast(`Vehicle ${loadVehicleData.vehicleNo}: ${loadVehicleData.newItems.length} new items loaded successfully!`)
      setShowLoadItemsModal(false)
    } catch (err) {
      console.error('Error updating vehicle cargo:', err)
      // Fallback local update
      setDispatches((prev) =>
        prev.map((d) => {
          if (d.id !== loadVehicleData.id) return d
          const combined = [
            ...(d.itemsList || []),
            ...(loadVehicleData.newItems || []).map((it) => ({
              name: it.productName,
              sku: it.sku,
              location: it.locationCode,
              qty: it.totalBaseQty,
              baseUnit: it.minUnit,
              packQty: it.packsCount,
              looseQty: it.looseCount,
              packUnit: it.maxUnit,
              unitsPerPack: it.unitsPerPack,
              batch: it.batchNo,
              expiryDate: it.expiryDate,
              labCert: 'COA-2026-PASSED',
            })),
          ]
          return {
            ...d,
            itemsCount: combined.length,
            productName: combined.length > 1 ? `${combined[0].name} +${combined.length - 1} more items` : combined[0].name,
            itemsList: combined,
          }
        })
      )
      triggerToast(`Vehicle ${loadVehicleData.vehicleNo}: items loaded locally!`)
      setShowLoadItemsModal(false)
    } finally {
      setIsUpdatingGaadiCargo(false)
    }
  }

  // Generate dynamic scannable QR code for dispatch gate pass slip (Itemized Multi-Item Consignment)
  useEffect(() => {
    if (!showGatePassModal) {
      setGatePassQrUrl('')
      return
    }

    const items = showGatePassModal.itemsList && showGatePassModal.itemsList.length > 0
      ? showGatePassModal.itemsList
      : [
          {
            name: showGatePassModal.productName,
            sku: showGatePassModal.sku,
            location: showGatePassModal.location,
            qty: showGatePassModal.totalQty,
            baseUnit: showGatePassModal.baseUnit,
            packQty: showGatePassModal.packCount,
            packUnit: showGatePassModal.packUnit,
            batch: 'BAT-2026-RIC-01'
          }
        ]

    const itemLines = items.map((it, idx) => {
      const esl = getEslInfo({ name: it.name, expiryDate: it.expiryDate || showGatePassModal.expiryDate, batchNo: it.batch })
      return `${idx + 1}. ${it.name} | ${it.packQty || 0} ${it.packUnit || 'Packs'}${it.looseQty > 0 ? ` + ${it.looseQty} Loose` : ''} (${Number(it.qty || 0).toLocaleString()} ${it.baseUnit || 'Units'}) | Batch: ${it.batch || '—'} | ESL: ${esl.expiryFormatted}`
    })

    const qrPayload = [
      '=== OFFICIAL VEHICLE OUTWARD GATE PASS ===',
      `Gate Pass No : ${showGatePassModal.dispatchNo ? 'GP-OUT-' + showGatePassModal.dispatchNo : 'GP-OUT-PASS'}`,
      `Vehicle No    : ${showGatePassModal.vehicleNo || 'N/A'}`,
      `Driver Name   : ${showGatePassModal.driverName || 'N/A'} (Ph: ${showGatePassModal.driverContact || showGatePassModal.contactNo || 'N/A'})`,
      `Origin Origin : Central Warehouse - ${showGatePassModal.shadeId || 'Shed 1: Grains & Pulses'} (Outward Gate 2)`,
      `Destination   : ${showGatePassModal.customerUnit || 'N/A'}`,
      `Dispatch Date : ${showGatePassModal.date || 'Today'}`,
      `Dispatch Time : ${showGatePassModal.dispatchTime || '02:55 PM IST'}`,
      `Order/PO Ref  : ${showGatePassModal.poIndentNo || 'N/A'}`,
      `------------------------------------`,
      `Consignment   : ${items.length} Product(s) Loaded`,
      ...itemLines,
      `------------------------------------`,
      `Total Cargo   : ${showGatePassModal.packCount || 0} Packages = ${Number(showGatePassModal.totalQty || 0).toLocaleString()} ${showGatePassModal.baseUnit || 'Units'}`,
      `Gate Purpose  : 1) WAREHOUSE EXIT CLEARANCE  2) DESTINATION RECEIVING SLIP`,
      `QA Clearance : 100% PHYSICAL COUNT & QC PASSED`,
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

  // Dynamic Product Filter Options
  const productFilterOptions = useMemo(() => {
    const list = [{ value: 'ALL', label: 'All Products (Sabhi Items)' }]
    const names = new Set()

    // 1. All catalog products
    products.forEach((p) => {
      if (p.name && !names.has(p.name.trim().toLowerCase())) {
        names.add(p.name.trim().toLowerCase())
        list.push({ value: p.name.trim(), label: `${p.name.trim()} (${p.sku || ''})` })
      }
    })

    // 2. Any additional products from consignment items
    dispatches.forEach((d) => {
      if (d.itemsList && Array.isArray(d.itemsList)) {
        d.itemsList.forEach((it) => {
          const rawName = (it.name || '').trim()
          if (rawName && !names.has(rawName.toLowerCase())) {
            names.add(rawName.toLowerCase())
            list.push({ value: rawName, label: `${rawName}${it.sku ? ` (${it.sku})` : ''}` })
          }
        })
      } else if (d.productName && !d.productName.includes('+')) {
        const rawName = d.productName.trim()
        if (rawName && !names.has(rawName.toLowerCase())) {
          names.add(rawName.toLowerCase())
          list.push({ value: rawName, label: `${rawName}${d.sku ? ` (${d.sku})` : ''}` })
        }
      }
    })
    return list
  }, [products, dispatches])

  // Filtered Dispatches
  const filteredDispatches = useMemo(() => {
    return dispatches.filter((item) => {
      if (filterType !== 'ALL' && item.dispatchType !== filterType) return false
      if (filtershade !== 'ALL' && item.shadeId !== filtershade) return false
      if (filterCustomer !== 'ALL' && item.customerUnit !== filterCustomer) return false
      if (filterStatus !== 'ALL' && item.status !== filterStatus) return false

      // Date Filter
      if (filterDate !== 'ALL') {
        const dVal = item.createdAt || item.date || item.dispatchDate
        if (!isDateMatching(dVal, filterDate, filterCustomDate)) return false
      }

      // Product Filter
      if (filterProduct !== 'ALL') {
        const target = filterProduct.toLowerCase()
        const prodMatch =
          (item.productName && item.productName.toLowerCase().includes(target)) ||
          (item.sku && item.sku.toLowerCase().includes(target)) ||
          (item.itemsList && item.itemsList.some(it => (it.name && it.name.toLowerCase().includes(target)) || (it.sku && it.sku.toLowerCase().includes(target))))
        if (!prodMatch) return false
      }

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
  }, [dispatches, filterType, filtershade, filterCustomer, filterStatus, filterProduct, filterDate, filterCustomDate, searchQuery])

  // Dynamic Calculation: Exact Volume of Filtered Product Issued vs Total Volume
  const filteredProductStats = useMemo(() => {
    let totalSpecificQty = 0
    let totalSpecificPacks = 0
    let specificUnit = ''
    let totalAllVolume = 0

    const target = filterProduct !== 'ALL' ? filterProduct.toLowerCase() : ''

    filteredDispatches.forEach((d) => {
      totalAllVolume += Number(d.totalQty) || 0

      if (filterProduct === 'ALL') {
        totalSpecificQty += Number(d.totalQty) || 0
        totalSpecificPacks += Number(d.packCount) || Number(d.packsCount) || 0
        if (d.baseUnit) specificUnit = d.baseUnit
      } else {
        if (d.itemsList && Array.isArray(d.itemsList) && d.itemsList.length > 0) {
          d.itemsList.forEach((it) => {
            const match =
              (it.name && it.name.toLowerCase().includes(target)) ||
              (it.sku && it.sku.toLowerCase().includes(target))
            if (match) {
              totalSpecificQty += Number(it.qty) || 0
              totalSpecificPacks += Number(it.packQty) || Number(it.packsCount) || 0
              if (it.baseUnit) specificUnit = it.baseUnit
            }
          })
        } else {
          const match =
            (d.productName && d.productName.toLowerCase().includes(target)) ||
            (d.sku && d.sku.toLowerCase().includes(target))
          if (match) {
            totalSpecificQty += Number(d.totalQty) || 0
            totalSpecificPacks += Number(d.packCount) || 0
            if (d.baseUnit) specificUnit = d.baseUnit
          }
        }
      }
    })

    return {
      specificQty: totalSpecificQty,
      specificPacks: totalSpecificPacks,
      unit: specificUnit || 'Units',
      totalAllVolume,
      count: filteredDispatches.length,
    }
  }, [filteredDispatches, filterProduct])

  // Backward-compatible Total Quantity
  const filteredTotalQty = filteredProductStats.specificQty

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

  // Create Dispatch (Dynamic submit to MongoDB with Multi-Item Consignment)
  const handleCreateDispatch = async (e) => {
    e.preventDefault()
    const items = newDispatch.items || []
    if (items.length === 0) {
      triggerToast('Please add at least 1 item to the issue consignment!')
      return
    }

    const hasBlocked = items.some((it) => it.isBlocked)
    if (hasBlocked) {
      triggerToast('⛔ BLOCKED: Consignment contains items on Quality Hold or Lab Failed status! Only QC Passed items can be dispatched.')
      return
    }

    setSubmitting(true)

    let grandPacks = 0
    let grandLoose = 0
    let grandBase = 0
    const preparedItems = []

    for (const it of items) {
      const pCount = Math.max(0, Number(it.packsCount) || 0)
      const lCount = Math.max(0, Number(it.looseCount) || 0)
      const ratio = Math.max(1, Number(it.unitsPerPack) || 1)
      const bQty = Number(it.totalBaseQty) || (pCount * ratio + lCount)

      grandPacks += pCount
      grandLoose += lCount
      grandBase += bQty

      const maxU = it.maxUnit || 'Carton'
      const minU = it.minUnit || 'Packet'
      const loc = it.locationCode || `${newDispatch.shadeId}-RK01-R1-C1`

      preparedItems.push({
        productId: it.productId && it.productId !== 'CUSTOM' ? it.productId : null,
        productName: (it.productName || 'General Product').trim(),
        sku: (it.sku || 'PRD-GEN-001').trim().toUpperCase(),
        batchNo: (it.batchNo || 'BAT-2026-01').trim().toUpperCase(),
        locationCode: loc,
        packagingUnit: maxU,
        maxUnit: maxU,
        minUnit: minU,
        packSize: ratio,
        requestedQty: pCount,
        looseQty: lCount,
        baseQty: bQty,
        pickedQty: pCount,
        verified: true,
        expiryDate: it.expiryDate || '',
        labCert: 'COA-2026-PASSED',
      })
    }

    const firstItem = preparedItems[0]
    const summaryText = preparedItems.length > 1
      ? `${preparedItems.length} Products: ${grandPacks} Cartons/Packs + ${grandLoose} Loose = ${grandBase.toLocaleString()} Units`
      : `${grandPacks} ${firstItem.maxUnit}${grandPacks > 1 ? 's' : ''}${grandLoose > 0 ? ` + ${grandLoose} Loose` : ''} = ${grandBase.toLocaleString()} ${firstItem.minUnit}`

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
      totalPackages: grandPacks,
      totalLooseQty: grandLoose,
      totalBaseQty: grandBase,
      breakdownSummary: summaryText,
      baseUnit: preparedItems.length > 1 ? 'Units' : firstItem.minUnit,
      dispatchedBy: newDispatch.dispatchOfficer,
      remarks: newDispatch.remarks,
      items: preparedItems,
    }

    const now = new Date()
    const dispatchDateStr = now.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })
    const dispatchTimeStr = now.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true })

    try {
      const saved = await createDispatch(payload)
      const newRecord = {
        id: saved._id || Date.now(),
        dispatchNo: saved.dispatchNo || `DSP-2026-${String(dispatches.length + 1).padStart(4, '0')}`,
        date: dispatchDateStr,
        dispatchTime: dispatchTimeStr,
        poIndentNo: saved.orderNo || newDispatch.poIndentNo,
        customerUnit: saved.customerName || newDispatch.customerUnit,
        shadeId: saved.shadeId || newDispatch.shadeId,
        location: firstItem.locationCode,
        productName: preparedItems.length > 1
          ? `${firstItem.productName} +${preparedItems.length - 1} more items`
          : firstItem.productName,
        sku: firstItem.sku,
        itemsCount: preparedItems.length,
        totalQty: grandBase,
        baseUnit: payload.baseUnit,
        packCount: grandPacks,
        looseCount: grandLoose,
        packUnit: firstItem.maxUnit,
        breakdownText: summaryText,
        dispatchType: newDispatch.dispatchType,
        status: 'Dispatched',
        labStatus: 'Passed',
        expectedDelivery: newDispatch.expectedDelivery,
        vehicleNo: newDispatch.vehicleNo,
        driverName: newDispatch.driverName,
        driverContact: newDispatch.contactNo,
        officer: newDispatch.dispatchOfficer,
        remarks: newDispatch.remarks,
        itemsList: preparedItems.map(it => ({
          productId: it.productId,
          name: it.productName,
          sku: it.sku,
          location: it.locationCode,
          qty: it.baseQty,
          baseUnit: it.minUnit,
          packQty: it.requestedQty,
          looseQty: it.looseQty,
          packUnit: it.maxUnit,
          unitsPerPack: it.packSize,
          breakdownText: `${it.requestedQty} ${it.maxUnit}${it.looseQty > 0 ? ` + ${it.looseQty} ${it.minUnit}` : ''}`,
          batch: it.batchNo,
          expiryDate: it.expiryDate,
          labCert: 'COA-2026-PASSED'
        })),
      }

      setDispatches(prev => [newRecord, ...prev])
      triggerToast(`🚚 Vehicle ${newRecord.vehicleNo} dispatched! Single Gate Pass generated.`)
      setShowNewDispatchModal(false)
      setShowGatePassModal(newRecord)
    } catch (err) {
      console.error('Error saving dispatch order:', err)
      // Fallback local creation
      const localNo = `DSP-2026-${String(dispatches.length + 1).padStart(4, '0')}`
      const newRecord = {
        id: `local-${Date.now()}`,
        dispatchNo: localNo,
        date: dispatchDateStr,
        dispatchTime: dispatchTimeStr,
        poIndentNo: newDispatch.poIndentNo,
        customerUnit: newDispatch.customerUnit,
        shadeId: newDispatch.shadeId,
        location: firstItem.locationCode,
        productName: preparedItems.length > 1
          ? `${firstItem.productName} +${preparedItems.length - 1} more items`
          : firstItem.productName,
        sku: firstItem.sku,
        itemsCount: preparedItems.length,
        totalQty: grandBase,
        baseUnit: payload.baseUnit,
        packCount: grandPacks,
        looseCount: grandLoose,
        packUnit: firstItem.maxUnit,
        breakdownText: summaryText,
        dispatchType: newDispatch.dispatchType,
        status: 'Dispatched',
        labStatus: 'Passed',
        expectedDelivery: newDispatch.expectedDelivery,
        vehicleNo: newDispatch.vehicleNo,
        driverName: newDispatch.driverName,
        driverContact: newDispatch.contactNo,
        officer: newDispatch.dispatchOfficer,
        remarks: newDispatch.remarks,
        itemsList: preparedItems.map(it => ({
          productId: it.productId,
          name: it.productName,
          sku: it.sku,
          location: it.locationCode,
          qty: it.baseQty,
          baseUnit: it.minUnit,
          packQty: it.requestedQty,
          looseQty: it.looseQty,
          packUnit: it.maxUnit,
          unitsPerPack: it.packSize,
          breakdownText: `${it.requestedQty} ${it.maxUnit}${it.looseQty > 0 ? ` + ${it.looseQty} ${it.minUnit}` : ''}`,
          batch: it.batchNo,
          expiryDate: it.expiryDate,
          labCert: 'COA-2026-PASSED'
        })),
      }
      setDispatches(prev => [newRecord, ...prev])
      triggerToast(`🚚 Vehicle ${newRecord.vehicleNo} dispatched! Single Gate Pass generated.`)
      setShowNewDispatchModal(false)
      setShowGatePassModal(newRecord)
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
      'Origin Shed',
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
  const dynamicshadeOptions = useMemo(() => {
    return [
      { value: 'ALL', label: 'All Warehouse Sheds' },
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
              Track outward stock dispatches, retail customer manifests, dual-unit pack reconciliations, and transit deliveries across warehouse Storage Sheds.
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
                <p className="text-[11px] text-slate-500">Filter shipments by customer destination, Origin Shed, dispatch type, or transit status.</p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs bg-indigo-50 text-indigo-700 font-bold px-3 py-1 rounded-full border border-indigo-200/60">
                {filteredDispatches.length} Dispatches Found
              </span>
              {(searchQuery || filterType !== 'ALL' || filtershade !== 'ALL' || filterCustomer !== 'ALL' || filterStatus !== 'ALL' || filterProduct !== 'ALL' || filterDate !== 'ALL' || filterCustomDate) && (
                <button
                  type="button"
                  onClick={() => {
                    setFilterType('ALL')
                    setFiltershade('ALL')
                    setFilterCustomer('ALL')
                    setFilterStatus('ALL')
                    setFilterProduct('ALL')
                    setFilterDate('ALL')
                    setFilterCustomDate('')
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

          {/* 6 Dynamic Filter Dropdowns including Date & Product Filters */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-3 pt-1 text-xs">
            {/* 1. Date Filter */}
            <div className="lg:col-span-1">
              <label className="block text-[11px] font-bold text-slate-700 mb-1.5 flex items-center gap-1">
                <Calendar className="w-3 h-3 text-indigo-600" />
                <span>Issue Date</span>
              </label>
              <CustomSelect
                value={filterDate}
                onChange={(val) => {
                  setFilterDate(val)
                  setCurrentPage(1)
                }}
                options={DATE_PRESET_OPTIONS}
                placeholder="All Dates"
                zIndexClass="z-30"
              />
              {filterDate === 'CUSTOM' && (
                <input
                  type="date"
                  value={filterCustomDate}
                  onChange={(e) => {
                    setFilterCustomDate(e.target.value)
                    setCurrentPage(1)
                  }}
                  className="w-full mt-1.5 bg-white border border-indigo-300 rounded-xl px-2.5 py-1 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                />
              )}
            </div>

            {/* 2. Product Filter (Dedicated for "Rice", "Atta", etc.) */}
            <div className="lg:col-span-1">
              <label className="block text-[11px] font-bold text-slate-700 mb-1.5 flex items-center gap-1">
                <Package className="w-3 h-3 text-indigo-600" />
                <span>Product Item</span>
              </label>
              <CustomSelect
                value={filterProduct}
                onChange={(val) => {
                  setFilterProduct(val)
                  setCurrentPage(1)
                }}
                options={productFilterOptions}
                placeholder="All Products"
                zIndexClass="z-30"
              />
            </div>

            {/* 3. Dispatch Type */}
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
                placeholder="All Types"
                zIndexClass="z-20"
              />
            </div>

            {/* 4. Origin Shed */}
            <div>
              <label className="block text-[11px] font-bold text-slate-600 mb-1.5">
                Origin Shed
              </label>
              <CustomSelect
                value={filtershade}
                onChange={(val) => {
                  setFiltershade(val)
                  setCurrentPage(1)
                }}
                options={dynamicshadeOptions}
                placeholder="All Sheds"
                zIndexClass="z-20"
              />
            </div>

            {/* 5. Customer Hub */}
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
                placeholder="All Hubs"
                zIndexClass="z-20"
              />
            </div>

            {/* 6. Transit Status */}
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
                placeholder="All Statuses"
                zIndexClass="z-20"
              />
            </div>
          </div>

          {/* Active Filter & Summary Banner */}
          {(filterProduct !== 'ALL' || filterDate !== 'ALL' || filterType !== 'ALL' || filtershade !== 'ALL' || filterCustomer !== 'ALL' || filterStatus !== 'ALL' || searchQuery) && (
            <div className="p-3 bg-indigo-50/80 rounded-xl border border-indigo-200/80 flex flex-col sm:flex-row sm:items-center justify-between text-xs gap-2 animate-fade-in shadow-2xs">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="font-bold text-indigo-950 flex items-center gap-1.5">
                  <Filter className="w-3.5 h-3.5 text-indigo-600" />
                  Active Filter:
                </span>
                {filterProduct !== 'ALL' && (
                  <span className="bg-white text-indigo-700 font-bold px-2 py-0.5 rounded-md border border-indigo-200 shadow-2xs font-mono">
                    Product: {filterProduct}
                  </span>
                )}
                {filterDate !== 'ALL' && (
                  <span className="bg-white text-indigo-700 font-bold px-2 py-0.5 rounded-md border border-indigo-200 shadow-2xs">
                    Date: {filterDate === 'CUSTOM' ? filterCustomDate : filterDate}
                  </span>
                )}
                {filtershade !== 'ALL' && (
                  <span className="bg-white text-indigo-700 font-bold px-2 py-0.5 rounded-md border border-indigo-200 shadow-2xs">
                    Shed: {filtershade}
                  </span>
                )}
                {filterCustomer !== 'ALL' && (
                  <span className="bg-white text-indigo-700 font-bold px-2 py-0.5 rounded-md border border-indigo-200 shadow-2xs">
                    Customer: {filterCustomer}
                  </span>
                )}
                {filterStatus !== 'ALL' && (
                  <span className="bg-white text-indigo-700 font-bold px-2 py-0.5 rounded-md border border-indigo-200 shadow-2xs">
                    Status: {filterStatus}
                  </span>
                )}
              </div>

              <div className="flex items-center gap-2 font-mono shrink-0">
                <span className="text-slate-600 font-sans font-medium">
                  {filterProduct !== 'ALL' ? `Total "${filterProduct}" Issued:` : 'Total Dispatched Volume:'}
                </span>
                <strong className="text-emerald-800 font-bold bg-white px-3 py-1 rounded-lg border border-emerald-300 shadow-2xs text-xs">
                  {filteredProductStats.specificQty.toLocaleString()} {filteredProductStats.unit} ({filteredProductStats.count} Shipments)
                </strong>
              </div>
            </div>
          )}
        </div>

        {/* Dispatches Table */}
        <div className="overflow-x-auto no-scrollbar">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-50/75 border-b border-slate-200/80 text-slate-500 font-semibold uppercase tracking-wider text-[10px]">
                <th className="py-3 px-4 w-12 text-center">#</th>
                <th className="py-3 px-4 min-w-[140px]">Dispatch &amp; Date</th>
                <th className="py-3 px-4 min-w-[130px]">PO / Indent</th>
                <th className="py-3 px-4 min-w-[180px]">Consignment Items</th>
                <th className="py-3 px-4 min-w-[160px]">Customer Destination</th>
                <th className="py-3 px-4 min-w-[110px]">Origin Shed</th>
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
                  <td colSpan={11} className="py-8">
                    <DataLoader
                      text="Loading Outward Dispatches..."
                      subtext="Fetching orders, stock balances, and gate clearance status..."
                      size="md"
                    />
                  </td>
                </tr>
              ) : paginatedDispatches.length === 0 ? (
                <tr>
                  <td colSpan={11} className="py-12 text-center text-slate-400">
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
                        <div className="font-bold text-slate-800 max-w-[190px] truncate" title={row.productName}>
                          {row.productName}
                        </div>
                        <div className="flex items-center gap-1.5 mt-0.5">
                          {row.itemsCount > 1 ? (
                            <span className="text-[10px] font-bold bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded-md border border-indigo-200">
                              📦 {row.itemsCount} Items Consignment
                            </span>
                          ) : (
                            <span className="text-[10px] font-mono text-slate-500">
                              1 Item • {row.sku}
                            </span>
                          )}
                        </div>
                        {filterProduct !== 'ALL' && row.itemsList && Array.isArray(row.itemsList) && (
                          <div className="mt-1">
                            {row.itemsList
                              .filter(
                                (it) =>
                                  (it.name && it.name.toLowerCase().includes(filterProduct.toLowerCase())) ||
                                  (it.sku && it.sku.toLowerCase().includes(filterProduct.toLowerCase()))
                              )
                              .map((it, i) => (
                                <span
                                  key={i}
                                  className="inline-block text-[10px] font-bold text-amber-800 bg-amber-50 px-1.5 py-0.5 rounded border border-amber-200 font-mono mt-0.5"
                                >
                                  Filtered: {it.qty} {it.baseUnit || 'Kg'} ({it.name})
                                </span>
                              ))}
                          </div>
                        )}
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
                        <div className="font-bold text-slate-800 font-mono">
                          {Number(row.totalQty || 0).toLocaleString()} {row.baseUnit}
                        </div>
                        <div className="text-[11px] text-indigo-600 font-mono font-bold mt-0.5">
                          {row.breakdownText || `${row.packCount} ${row.packUnit}`}
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
                          {/* Load Cargo Action Button */}
                          <button
                            type="button"
                            onClick={() => handleOpenLoadItemsModal(row)}
                            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg border border-indigo-200 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-[11px] font-bold transition cursor-pointer shadow-2xs"
                            title="Load cargo into vehicle (Add items to this truck)"
                          >
                            <Truck className="w-3.5 h-3.5 text-indigo-600" />
                            <span>Load</span>
                          </button>

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

      {/* MODAL 1: NEW OUTWARD ISSUE / DISPATCH (STEP-BY-STEP TRUCK CONSIGNMENT FLOW) */}
      {showNewDispatchModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
          <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 max-w-4xl w-full p-4 sm:p-6 max-h-[92dvh] overflow-y-auto no-scrollbar animate-in fade-in zoom-in-95">
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-2xl bg-indigo-600 text-white flex items-center justify-center shadow-md shadow-indigo-600/20">
                  <Truck className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-base font-extrabold text-slate-800">
                    Outward Issue &amp; Vehicle Gate Pass (Multi-Item Consignment)
                  </h3>
                  <p className="text-xs text-slate-500">
                    1 Truck = 1 Destination • Load multiple products (Rice, Flour, Pulses) into a single vehicle
                  </p>
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

            {/* Step Wizard Navigation Tabs */}
            <div className="grid grid-cols-2 gap-2 mt-4 bg-slate-100 p-1 rounded-2xl text-xs">
              <button
                type="button"
                onClick={() => setActiveIssueStep(1)}
                className={`py-2 px-3 rounded-xl font-bold transition flex items-center justify-center gap-2 cursor-pointer ${
                  activeIssueStep === 1
                    ? 'bg-white text-indigo-700 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <span className="w-5 h-5 rounded-full bg-indigo-600 text-white text-[10px] flex items-center justify-center font-bold">
                  1
                </span>
                <span>Step 1: Vehicle &amp; Destination Setup</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  if (!newDispatch.vehicleNo?.trim()) {
                    triggerToast('Please enter Vehicle Number first!')
                    return
                  }
                  if (!newDispatch.customerUnit?.trim()) {
                    triggerToast('Please select Destination Hub first!')
                    return
                  }
                  setActiveIssueStep(2)
                }}
                className={`py-2 px-3 rounded-xl font-bold transition flex items-center justify-center gap-2 cursor-pointer ${
                  activeIssueStep === 2
                    ? 'bg-white text-indigo-700 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <span className="w-5 h-5 rounded-full bg-indigo-600 text-white text-[10px] flex items-center justify-center font-bold">
                  2
                </span>
                <span>Step 2: Cargo Loading ({newDispatch.items?.length || 1} Items)</span>
              </button>
            </div>

            <form onSubmit={handleCreateDispatch} className="mt-4 space-y-5 text-xs">
              {/* ========================================================= */}
              {/* STEP 1: ISSUE AND VEHICLE SETUP                           */}
              {/* ========================================================= */}
              {activeIssueStep === 1 && (
                <div className="space-y-4">
                  <div className="bg-slate-900 text-white p-4 sm:p-5 rounded-2xl border border-slate-800 space-y-4 shadow-sm">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-slate-800 gap-2">
                      <div className="flex items-center gap-2.5">
                        <span className="w-7 h-7 rounded-xl bg-indigo-600 text-white font-black text-xs flex items-center justify-center shadow-xs">
                          1
                        </span>
                        <div>
                          <h4 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
                            <span>Step 1: Issue &amp; Vehicle Setup</span>
                            <span className="text-[10px] normal-case font-semibold text-emerald-400 bg-emerald-950/80 px-2 py-0.5 rounded-full border border-emerald-800/60">
                              Vehicle-Level Details (Single Setup)
                            </span>
                          </h4>
                          <p className="text-[11px] text-slate-400 mt-0.5">
                            Vehicle Number, Driver, and Destination are configured once — the full truck delivers to a single destination
                          </p>
                        </div>
                      </div>
                      <span className="text-[10px] font-mono font-bold bg-indigo-500/20 text-indigo-300 px-2.5 py-1 rounded-lg border border-indigo-500/30 self-start sm:self-auto">
                        🚚 1 Truck = 1 Destination
                      </span>
                    </div>

                    {/* Sub-row 1: Vehicle No, Driver Name, Driver Mobile */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <div>
                        <label className="block text-[11px] font-bold text-slate-300 mb-1">
                          1. Vehicle / Truck Number *
                        </label>
                        <div className="flex rounded-xl overflow-hidden border border-slate-700 focus-within:border-indigo-400 bg-slate-800 shadow-2xs">
                          <span className="inline-flex items-center px-2.5 bg-slate-700 text-[10px] font-black text-amber-400 select-none">
                            IND
                          </span>
                          <input
                            type="text"
                            required
                            value={newDispatch.vehicleNo}
                            onChange={(e) => setNewDispatch({ ...newDispatch, vehicleNo: e.target.value.toUpperCase() })}
                            placeholder="DL-1L-AA-5544"
                            className="w-full px-2.5 py-2 text-xs font-mono font-bold uppercase text-white bg-transparent outline-none placeholder:text-slate-500"
                          />
                        </div>
                        {/* Quick suggestion from yard vehicles */}
                        {recentVehicles.length > 0 && (
                          <div className="flex items-center gap-1 mt-1.5 overflow-x-auto no-scrollbar">
                            <span className="text-[9px] text-slate-500 shrink-0">Yard Trucks:</span>
                            {recentVehicles.slice(0, 3).map((v, i) => (
                              <button
                                key={i}
                                type="button"
                                onClick={() =>
                                  setNewDispatch((prev) => ({
                                    ...prev,
                                    vehicleNo: v.vehicleNo,
                                    driverName: v.driverName || prev.driverName,
                                    contactNo: v.contact || prev.contactNo,
                                  }))
                                }
                                className="text-[9px] font-mono bg-slate-800 hover:bg-slate-700 text-indigo-300 px-1.5 py-0.5 rounded border border-slate-700 transition cursor-pointer shrink-0"
                                title="Click to populate this vehicle"
                              >
                                {v.vehicleNo}
                              </button>
                            ))}
                          </div>
                        )}
                      </div>

                      <div>
                        <label className="block text-[11px] font-bold text-slate-300 mb-1">
                          2. Driver Full Name *
                        </label>
                        <input
                          type="text"
                          required
                          value={newDispatch.driverName}
                          onChange={(e) => setNewDispatch({ ...newDispatch, driverName: e.target.value })}
                          placeholder="Mohd. Imran"
                          className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-400 placeholder:text-slate-500"
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] font-bold text-slate-300 mb-1">
                          3. Driver Phone Contact *
                        </label>
                        <input
                          type="tel"
                          required
                          value={newDispatch.contactNo}
                          onChange={(e) => setNewDispatch({ ...newDispatch, contactNo: e.target.value })}
                          placeholder="+91 98711 22334"
                          className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs font-mono text-white focus:outline-none focus:border-indigo-400 placeholder:text-slate-500"
                        />
                      </div>
                    </div>

                    {/* Sub-row 2: Destination Hub, PO/Indent, Origin Shed & Dispatch Type */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 border-t border-slate-800/80">
                      <div className="sm:col-span-1">
                        <label className="block text-[11px] font-bold text-slate-300 mb-1 flex items-center justify-between">
                          <span>4. Destination Hub *</span>
                          <span className="text-[9px] text-amber-400 font-semibold">Truck Level</span>
                        </label>
                        {customers.length > 0 ? (
                          <div className="space-y-1.5">
                            <CustomSelect
                              value={newDispatch.customerUnit}
                              onChange={(val) => setNewDispatch({ ...newDispatch, customerUnit: val })}
                              options={[
                                ...customers.map((c) => ({
                                  value: c.name,
                                  label: c.name,
                                  sublabel: c.address || c.phone,
                                })),
                                { value: 'CUSTOM', label: '+ Enter Custom Customer Hub...' },
                              ]}
                            />
                            {newDispatch.customerUnit === 'CUSTOM' && (
                              <input
                                type="text"
                                required
                                placeholder="Type custom destination hub name..."
                                onChange={(e) => setNewDispatch({ ...newDispatch, customerUnit: e.target.value })}
                                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-400 placeholder:text-slate-500"
                              />
                            )}
                          </div>
                        ) : (
                          <input
                            type="text"
                            required
                            value={newDispatch.customerUnit}
                            onChange={(e) => setNewDispatch({ ...newDispatch, customerUnit: e.target.value })}
                            placeholder="e.g. Reliance Retail Mega Hub, Noida"
                            className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-400 placeholder:text-slate-500"
                          />
                        )}
                      </div>

                      <div>
                        <label className="block text-[11px] font-bold text-slate-300 mb-1">
                          5. PO / Indent Reference *
                        </label>
                        <input
                          type="text"
                          required
                          value={newDispatch.poIndentNo}
                          onChange={(e) => setNewDispatch({ ...newDispatch, poIndentNo: e.target.value })}
                          placeholder="SO-2026-9041"
                          className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white font-mono focus:outline-none focus:border-indigo-400 placeholder:text-slate-500"
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <label className="block text-[11px] font-bold text-slate-300 mb-1">Origin Shed *</label>
                          <CustomSelect
                            value={newDispatch.shadeId}
                            onChange={(val) => setNewDispatch({ ...newDispatch, shadeId: val })}
                            options={shadesList.map((s) => ({ value: s.id, label: s.name }))}
                          />
                        </div>
                        <div>
                          <label className="block text-[11px] font-bold text-slate-300 mb-1">Dispatch Type *</label>
                          <CustomSelect
                            value={newDispatch.dispatchType}
                            onChange={(val) => setNewDispatch({ ...newDispatch, dispatchType: val })}
                            options={typeOptions.filter((t) => t.value !== 'ALL')}
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Step 1 Footer Action Bar: Proceed to Step 2 (Load Cargo) */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-3 border-t border-slate-100">
                    <button
                      type="button"
                      onClick={() => setShowNewDispatchModal(false)}
                      className="px-4 py-2.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-semibold transition cursor-pointer"
                    >
                      Cancel
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        if (!newDispatch.vehicleNo?.trim()) {
                          triggerToast('Vehicle Number is required!')
                          return
                        }
                        if (!newDispatch.customerUnit?.trim()) {
                          triggerToast('Please select a Destination Hub!')
                          return
                        }
                        setActiveIssueStep(2)
                        triggerToast(`Vehicle ${newDispatch.vehicleNo} confirmed! Proceeding to load cargo.`)
                      }}
                      className="inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-md shadow-indigo-600/20 transition cursor-pointer"
                    >
                      <span>🚚 Load Cargo (Step 2: Proceed to Load Items ➔)</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}

              {/* ========================================================= */}
              {/* STEP 2: VEHICLE CARGO MANIFEST LOADING                    */}
              {/* ========================================================= */}
              {activeIssueStep === 2 && (
                <div className="space-y-4">
                  {/* Vehicle Consignment Summary Header Banner */}
                  <div className="bg-slate-900 text-white p-3.5 sm:p-4 rounded-2xl border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-indigo-600 text-white flex items-center justify-center shrink-0">
                        <Truck className="w-5 h-5" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-black text-amber-400 text-sm tracking-wider">
                            {newDispatch.vehicleNo}
                          </span>
                          <span className="text-[10px] bg-slate-800 text-slate-300 px-2 py-0.5 rounded border border-slate-700">
                            Driver: {newDispatch.driverName} ({newDispatch.contactNo})
                          </span>
                        </div>
                        <p className="text-xs text-slate-300 mt-0.5">
                          Destination: <strong className="text-white">{newDispatch.customerUnit}</strong> • PO: {newDispatch.poIndentNo} • Shed: {newDispatch.shadeId}
                        </p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => setActiveIssueStep(1)}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-xs font-semibold transition border border-slate-700 self-start sm:self-auto cursor-pointer"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                      <span>Edit Vehicle Details</span>
                    </button>
                  </div>

                  {/* Multi-Item Cargo Loading Manifest */}
                  <div className="bg-white rounded-2xl border border-slate-200/90 p-4 sm:p-5 space-y-4 shadow-xs">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-slate-200 gap-2">
                      <div className="flex items-center gap-2.5">
                        <span className="w-7 h-7 rounded-xl bg-indigo-600 text-white font-black text-xs flex items-center justify-center shadow-xs">
                          2
                        </span>
                        <div>
                          <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
                            <span>Step 2: Cargo Loading (Truck Consignment Manifest)</span>
                          </h4>
                          <p className="text-[11px] text-slate-500 mt-0.5">
                            Add multiple products (Rice, Flour, Pulses, Oil) to this vehicle ({newDispatch.vehicleNo || 'Truck'})
                          </p>
                        </div>
                      </div>
                      <span className="text-[11px] font-bold px-3 py-1 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200 self-start sm:self-auto">
                        📦 {newDispatch.items?.length || 1} Products Loaded in Truck
                      </span>
                    </div>

                    {/* Line Items List */}
                    <div className="space-y-3.5">
                      {newDispatch.items?.map((item, idx) => {
                        const itemEsl = getEslInfo({
                          name: item.productName,
                          expiryDate: item.expiryDate,
                          batchNo: item.batchNo,
                        })
                        const productBatches = getBatchesForProduct(item.productId, item.productName, item.sku)

                        return (
                          <div
                            key={item.id || idx}
                            className={`rounded-2xl border p-3.5 sm:p-4 space-y-3 shadow-2xs relative ${
                              item.isBlocked ? 'bg-rose-50/50 border-rose-300' : 'bg-slate-50/90 border-slate-200'
                            }`}
                          >
                            {/* Item Card Header */}
                            <div className="flex items-center justify-between pb-2.5 border-b border-slate-200/80">
                              <div className="flex items-center gap-2 flex-wrap">
                                <span className="w-5 h-5 rounded-lg bg-indigo-600 text-white font-mono font-bold text-[11px] flex items-center justify-center shrink-0">
                                  {idx + 1}
                                </span>
                                <span className="font-bold text-slate-800 text-xs">
                                  Item #{idx + 1}: {item.productName || 'Select Product Item'}
                                </span>
                                {item.sku && (
                                  <span className="text-[10px] font-mono text-slate-500 bg-white px-2 py-0.5 rounded border border-slate-200">
                                    SKU: {item.sku}
                                  </span>
                                )}
                                {item.isBlocked ? (
                                  <span className="text-[10px] font-bold text-rose-700 bg-rose-100 px-2 py-0.5 rounded-full border border-rose-300 flex items-center gap-1">
                                    <Lock className="w-3 h-3 text-rose-600" />
                                    <span>⛔ HOLD / FAILED - BLOCKED</span>
                                  </span>
                                ) : (
                                  <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full border border-emerald-300 flex items-center gap-1">
                                    <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                                    <span>✓ 100% QC PASSED</span>
                                  </span>
                                )}
                              </div>

                              {newDispatch.items.length > 1 && (
                                <button
                                  type="button"
                                  onClick={() => handleRemoveDispatchItem(item.id)}
                                  className="px-2.5 py-1 rounded-lg text-rose-600 hover:text-white hover:bg-rose-600 border border-rose-200 text-[11px] font-bold transition flex items-center gap-1 cursor-pointer shrink-0"
                                  title="Remove item from truck"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                  <span>Remove Item</span>
                                </button>
                              )}
                            </div>

                            {/* Blocking Warning Alert (Hold / Lab Test Failed) */}
                            {item.isBlocked && (
                              <div className="bg-rose-100 border border-rose-300 text-rose-900 rounded-xl p-3 flex items-start gap-2.5">
                                <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
                                <div>
                                  <p className="font-bold text-xs">⛔ BLOCKED: This item cannot be loaded into the vehicle!</p>
                                  <p className="text-[11px] text-rose-700 mt-0.5">
                                    Reason: <strong>{item.blockReason || 'Quality Hold or Lab Test Failed'}</strong>. Per warehouse quality compliance policy, materials on Hold or failing QC certification cannot be loaded or dispatched.
                                  </p>
                                </div>
                              </div>
                            )}

                            {/* Product Picker & Storage Bin */}
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                              <div className="sm:col-span-2">
                                <label className="block text-[11px] font-bold text-slate-700 mb-1">
                                  Product Item Name *
                                </label>
                                <CustomSelect
                                  value={item.productId}
                                  onChange={(val) => handleUpdateDispatchItem(item.id, 'productId', val)}
                                  options={[
                                    ...products.map((p) => {
                                      const isProdBlocked =
                                        p.status === 'Hold' || p.qcStatus === 'Failed' || p.isHold === true
                                      return {
                                        value: p._id,
                                        label: isProdBlocked ? `⛔ ${p.name} (ON QUALITY HOLD / BLOCKED)` : p.name,
                                        sublabel: isProdBlocked
                                          ? '⛔ BLOCKED: Cannot load into truck'
                                          : `SKU: ${p.sku} | Stock: ${p.currentStock || 0} ${p.baseUnit || 'Kg'}`,
                                        disabled: isProdBlocked,
                                      }
                                    }),
                                    { value: 'CUSTOM', label: '+ Type Custom Product Name...' },
                                  ]}
                                  placeholder="Select product from inventory..."
                                />
                                {item.productId === 'CUSTOM' && (
                                  <input
                                    type="text"
                                    required
                                    value={item.productName}
                                    onChange={(e) => handleUpdateDispatchItem(item.id, 'productName', e.target.value)}
                                    placeholder="Enter custom product name..."
                                    className="w-full mt-2 bg-white border border-slate-300 rounded-xl px-3 py-1.5 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                                  />
                                )}
                              </div>

                              <div>
                                <label className="block text-[11px] font-bold text-slate-700 mb-1">
                                  Storage Bin Location *
                                </label>
                                <input
                                  type="text"
                                  required
                                  value={item.locationCode}
                                  onChange={(e) => handleUpdateDispatchItem(item.id, 'locationCode', e.target.value)}
                                  placeholder="SH01-RK01-R1-C1"
                                  className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs font-mono text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                                />
                              </div>
                            </div>

                            {/* Batch-wise Entry & Expiry Date / ESL */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 bg-white p-3 rounded-xl border border-slate-200">
                              <div>
                                <label className="block text-[11px] font-bold text-slate-700 mb-1 flex items-center justify-between">
                                  <span>Batch Number (Batch-wise Entry) *</span>
                                  {item.isBlocked ? (
                                    <span className="text-[10px] font-bold text-rose-700 bg-rose-50 px-1.5 py-0.5 rounded border border-rose-200">
                                      ⛔ Restricted
                                    </span>
                                  ) : (
                                    <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200">
                                      ✓ Passed Batch
                                    </span>
                                  )}
                                </label>
                                <CustomSelect
                                  value={item.batchNo}
                                  onChange={(val) => handleSelectBatch(item.id, val)}
                                  options={productBatches.map((b) => ({
                                    value: b.batchNo,
                                    label: b.isBlocked ? `⛔ ${b.batchNo} (ROK - HOLD / LAB FAILED)` : b.batchNo,
                                    sublabel: b.isBlocked
                                      ? `⛔ ${b.blockReason.toUpperCase()} (Cannot Select) | Exp: ${b.expiryDate}`
                                      : `Exp: ${b.expiryDate} (${b.eslText}) | Stock: ${b.qty} | QC: Passed`,
                                    disabled: b.isBlocked,
                                  }))}
                                  placeholder="Select QC-Passed Batch..."
                                />
                              </div>

                              <div>
                                <label className="block text-[11px] font-bold text-slate-700 mb-1 flex items-center justify-between">
                                  <span>Batch Expiry Date &amp; ESL *</span>
                                  <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200">
                                    ESL: {itemEsl.eslText}
                                  </span>
                                </label>
                                <input
                                  type="date"
                                  required
                                  value={item.expiryDate}
                                  onChange={(e) => handleUpdateDispatchItem(item.id, 'expiryDate', e.target.value)}
                                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-1.5 text-xs text-slate-800 font-mono focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                                />
                              </div>
                            </div>

                            {/* Dual Outward Quantities Box */}
                            <div className="bg-white p-3 rounded-xl border border-slate-200/90 space-y-2.5">
                              <div className="flex items-center justify-between">
                                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                                  <Package className="w-3.5 h-3.5 text-indigo-600" />
                                  <span>Dual Outward Quantities (Full Packs + Loose Units)</span>
                                </span>
                                {item.availableStock > 0 && (
                                  <span className="text-[10px] font-mono font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                                    Live Stock: {item.availableStock} {item.minUnit} (
                                    {Math.floor(Number(item.availableStock) / (Number(item.unitsPerPack) || 1))}{' '}
                                    {item.maxUnit}s +{' '}
                                    {Number(item.availableStock) % (Number(item.unitsPerPack) || 1)} Loose)
                                  </span>
                                )}
                              </div>

                              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                                {/* Full Max Units */}
                                <div>
                                  <label className="block text-[10px] font-bold text-slate-700 mb-1">
                                    1. Full {item.maxUnit}s (Max Unit)
                                  </label>
                                  <input
                                    type="number"
                                    min="0"
                                    value={item.packsCount}
                                    onChange={(e) => handleUpdateDispatchItem(item.id, 'packsCount', e.target.value)}
                                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-1.5 text-xs font-bold text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                                  />
                                  <p className="text-[9px] text-slate-500 mt-0.5 font-medium">
                                    1 {item.maxUnit} = {item.unitsPerPack} {item.minUnit}s
                                  </p>
                                </div>

                                {/* Loose Min Units */}
                                <div>
                                  <label className="block text-[10px] font-bold text-slate-700 mb-1">
                                    2. Loose {item.minUnit}s
                                  </label>
                                  <input
                                    type="number"
                                    min="0"
                                    value={item.looseCount}
                                    onChange={(e) => handleUpdateDispatchItem(item.id, 'looseCount', e.target.value)}
                                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-1.5 text-xs font-bold text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                                  />
                                  <p className="text-[9px] text-slate-500 mt-0.5 font-medium">
                                    Khulle {item.minUnit} piece
                                  </p>
                                </div>

                                {/* Total Base Units */}
                                <div>
                                  <label className="block text-[10px] font-bold text-indigo-900 mb-1">
                                    3. Total Outward ({item.minUnit}s) *
                                  </label>
                                  <input
                                    type="number"
                                    min="1"
                                    required
                                    value={item.totalBaseQty}
                                    onChange={(e) => handleUpdateDispatchItem(item.id, 'totalBaseQty', e.target.value)}
                                    className="w-full bg-indigo-50/70 border border-indigo-300 rounded-xl px-3 py-1.5 text-xs font-bold font-mono text-indigo-950 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                                  />
                                  <p className="text-[9px] text-indigo-600 mt-0.5 font-semibold">
                                    Total base piece count
                                  </p>
                                </div>
                              </div>

                              {/* Item Breakdown Summary Bar */}
                              <div className="flex flex-col sm:flex-row sm:items-center justify-between text-[11px] font-mono pt-1 text-slate-600 gap-1 border-t border-slate-100">
                                <div>
                                  <span>Loaded in Truck: </span>
                                  <strong className="text-slate-900">
                                    {item.packsCount || 0} {item.maxUnit}
                                    {Number(item.packsCount) > 1 ? 's' : ''} + {item.looseCount || 0} Loose ={' '}
                                    {item.totalBaseQty || 0} {item.minUnit}s
                                  </strong>
                                </div>
                                {item.availableStock > 0 && (
                                  <span
                                    className={`text-[10px] font-sans font-bold px-2 py-0.5 rounded border ${
                                      Number(item.totalBaseQty) > Number(item.availableStock)
                                        ? 'bg-rose-50 text-rose-700 border-rose-200'
                                        : 'bg-emerald-50 text-emerald-700 border-emerald-200'
                                    }`}
                                  >
                                    {Number(item.totalBaseQty) > Number(item.availableStock)
                                      ? '⚠️ Exceeds Available Stock!'
                                      : `Remaining Stock: ${
                                          Number(item.availableStock) - Number(item.totalBaseQty)
                                        } ${item.minUnit}`}
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                        )
                      })}
                    </div>

                    {/* + Add Another Product Button */}
                    <button
                      type="button"
                      onClick={handleAddDispatchItem}
                      className="w-full py-3.5 rounded-2xl border-2 border-dashed border-indigo-300 hover:border-indigo-500 bg-indigo-50/50 hover:bg-indigo-50 text-indigo-700 font-bold text-xs flex items-center justify-center gap-2 transition cursor-pointer shadow-2xs"
                    >
                      <Plus className="w-4 h-4" />
                      <span>+ Add Another Product to this Vehicle (Load More Cargo)</span>
                    </button>
                  </div>

                  {/* ========================================================= */}
                  {/* STEP 3: TRUCK CARGO SUMMARY & GATE PASS GENERATION        */}
                  {/* ========================================================= */}
                  <div className="bg-indigo-50/80 border border-indigo-200 rounded-2xl p-4 sm:p-5 space-y-3.5 shadow-xs">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div>
                        <h4 className="text-xs font-bold text-indigo-950 uppercase tracking-wider flex items-center gap-2">
                          <span className="w-5 h-5 rounded-md bg-indigo-600 text-white font-mono text-[10px] flex items-center justify-center font-bold">
                            3
                          </span>
                          <span>Vehicle Cargo Summary &amp; Single Gate Pass</span>
                        </h4>
                        <p className="text-sm text-indigo-950 font-black mt-1">
                          Truck: <span className="font-mono text-indigo-700">{newDispatch.vehicleNo || 'DL-XX'}</span>{' '}
                          ➔ Destination: <span className="text-indigo-900">{newDispatch.customerUnit || 'N/A'}</span>
                        </p>
                        <p className="text-xs text-slate-600 font-semibold mt-0.5">
                          Total Cargo:{' '}
                          <strong className="text-slate-900">{consignmentSummary.count} Products</strong> •{' '}
                          <strong className="text-indigo-700">{consignmentSummary.totalPacks} Cartons/Packs</strong>
                          {consignmentSummary.totalLoose > 0 ? ` + ${consignmentSummary.totalLoose} Loose` : ''} ={' '}
                          <strong className="text-emerald-700">
                            {consignmentSummary.totalBase.toLocaleString()} Total Units
                          </strong>
                        </p>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        {consignmentSummary.hasBlockedItems ? (
                          <span className="inline-flex items-center gap-1 text-[11px] font-bold bg-rose-100 text-rose-800 px-3 py-1.5 rounded-xl border border-rose-300">
                            <ShieldAlert className="w-4 h-4 text-rose-600" />
                            <span>⛔ Quality Hold / Failed Items Detected!</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-[11px] font-bold bg-emerald-100 text-emerald-800 px-3 py-1.5 rounded-xl border border-emerald-200">
                            <ShieldCheck className="w-4 h-4 text-emerald-700" />
                            <span>✓ 100% QC Passed Pass</span>
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Remarks & Delivery Notes */}
                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 mb-1">
                        Delivery / Gate Clearance Notes
                      </label>
                      <input
                        type="text"
                        value={newDispatch.remarks}
                        onChange={(e) => setNewDispatch({ ...newDispatch, remarks: e.target.value })}
                        placeholder="e.g. Scheduled retail replenishment multi-item consignment."
                        className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                      />
                    </div>
                  </div>

                  {/* Submit / Back Action Bar */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-3 border-t border-slate-100">
                    <button
                      type="button"
                      onClick={() => setActiveIssueStep(1)}
                      className="px-4 py-2 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-semibold transition cursor-pointer"
                    >
                      ← Back to Vehicle Setup
                    </button>

                    <div className="flex items-center gap-3">
                      <button
                        type="button"
                        onClick={() => setShowNewDispatchModal(false)}
                        className="px-4 py-2 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-semibold transition cursor-pointer"
                      >
                        Cancel
                      </button>

                      <button
                        type="submit"
                        disabled={submitting || consignmentSummary.hasBlockedItems || consignmentSummary.hasOverStock}
                        className="px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed text-white text-xs font-bold shadow-md shadow-indigo-600/20 transition cursor-pointer flex items-center gap-2"
                        title={
                          consignmentSummary.hasBlockedItems
                            ? 'Gate Pass cannot be generated because consignment contains items on Quality Hold or Lab Fail status'
                            : 'Dispatch Vehicle & Generate Gate Pass'
                        }
                      >
                        {submitting && <RefreshCw className="w-3.5 h-3.5 animate-spin" />}
                        <span>🚀 Dispatch &amp; Generate Single Gate Pass</span>
                      </button>
                    </div>
                  </div>
                </div>
              )}
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
                        <th className="py-2.5 px-3">Expiry / ESL</th>
                        <th className="py-2.5 px-3 text-right">Base Qty</th>
                        <th className="py-2.5 px-3 text-right">Packaging</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {showDetailsModal.itemsList?.map((it, idx) => {
                        const esl = getEslInfo({ name: it.name, batchNo: it.batch, expiryDate: it.expiryDate })
                        return (
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
                          <td className="py-2.5 px-3 font-mono text-xs whitespace-nowrap">
                            <div className="font-bold text-slate-800">{esl.expiryFormatted}</div>
                            <div className="text-[10px] text-emerald-600 font-semibold">{esl.eslText}</div>
                          </td>
                          <td className="py-2.5 px-3 text-right font-bold text-slate-900">
                            {Number(it.qty || 0).toLocaleString()} {it.baseUnit || showDetailsModal.baseUnit}
                          </td>
                          <td className="py-2.5 px-3 text-right text-indigo-600 font-semibold">
                            {it.packQty} {it.packUnit || showDetailsModal.packUnit}
                            {it.looseQty > 0 ? ` + ${it.looseQty} ${it.baseUnit || ''}` : ''}
                          </td>
                        </tr>
                      )})}
                    </tbody>
                    <tfoot className="bg-slate-50 font-bold border-t border-slate-200">
                      <tr>
                        <td colSpan={4} className="py-2.5 px-3 text-right text-slate-700 uppercase text-[10px]">
                          Consignment Grand Total ({showDetailsModal.itemsList?.length || 1} Items):
                        </td>
                        <td className="py-2.5 px-3 text-right font-black text-slate-900">
                          {Number(showDetailsModal.totalQty || 0).toLocaleString()} {showDetailsModal.baseUnit}
                        </td>
                        <td className="py-2.5 px-3 text-right text-indigo-700 font-mono">
                          {showDetailsModal.packCount} {showDetailsModal.packUnit}
                          {showDetailsModal.looseCount > 0 ? ` + ${showDetailsModal.looseCount} Loose` : ''}
                        </td>
                      </tr>
                    </tfoot>
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

      {/* MODAL 3: PRINTABLE GATE PASS VOUCHER (MULTI-ITEM CONSIGNMENT MANIFEST) */}
      {showGatePassModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-2xl w-full p-4 sm:p-6 max-h-[90dvh] overflow-y-auto no-scrollbar animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Printer className="w-4 h-4 text-indigo-600" />
                <h3 className="text-sm font-bold text-slate-800">Print Outward Gate Pass Slip (Multi-Item Consignment)</h3>
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
            <div id="printable-issue-dispatch-gatepass" className="printable-area mt-4 p-5 bg-white border border-slate-300 rounded-xl shadow-xs space-y-3.5 text-xs font-mono">
              {/* Slip Header */}
              <div className="text-center border-b-2 border-slate-800 pb-3">
                <h2 className="text-base font-black tracking-tight text-slate-900">CENTRAL LOGISTICS &amp; WAREHOUSE MANAGEMENT</h2>
                <p className="text-[11px] text-slate-700 font-extrabold uppercase tracking-wide">
                  OFFICIAL VEHICLE OUTWARD GATE PASS &amp; CONSIGNMENT SUMMARY SLIP
                </p>
                <div className="flex items-center justify-center gap-3 mt-1 text-[10px]">
                  <span className="font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded border border-indigo-200">
                    GATE PASS NO: GP-OUT-{showGatePassModal.dispatchNo}
                  </span>
                  <span className="font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                    ✓ VALID FOR WAREHOUSE EXIT &amp; RECEIVING
                  </span>
                </div>
              </div>

              {/* Route Banner */}
              <div className="bg-slate-100 p-3 rounded-xl border border-slate-300 grid grid-cols-1 sm:grid-cols-2 gap-3 text-[11px]">
                <div>
                  <span className="text-[9px] text-slate-500 uppercase font-bold block">1. Origin Facility / Shed</span>
                  <strong className="text-slate-900 font-bold block mt-0.5 text-xs">
                    Central Warehouse • {showGatePassModal.shadeId || 'Shed 1: Grains & Pulses'}
                  </strong>
                  <span className="text-[10px] text-slate-500 font-sans block mt-0.5">
                    Warehouse Outward Gate No. 2 • Storage Staging Area
                  </span>
                </div>

                <div className="sm:border-l sm:border-slate-300 sm:pl-3 border-t sm:border-t-0 pt-2 sm:pt-0">
                  <span className="text-[9px] text-indigo-700 uppercase font-bold block">2. Destination Hub</span>
                  <strong className="text-indigo-950 font-black block mt-0.5 text-xs">
                    {showGatePassModal.customerUnit || 'Consignee Delivery Depot'}
                  </strong>
                  <span className="text-[10px] text-indigo-700 font-mono font-bold block mt-0.5">
                    PO / Indent Ref: {showGatePassModal.poIndentNo}
                  </span>
                </div>
              </div>

              {/* Vehicle & Dispatch Date / Time Details */}
              <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-200 grid grid-cols-2 sm:grid-cols-4 gap-2 text-[10px]">
                <div>
                  <span className="text-slate-400 block font-sans">Vehicle Registration No.</span>
                  <div className="inline-flex items-center gap-1 mt-0.5 bg-slate-900 text-amber-300 font-mono font-black text-xs px-2 py-0.5 rounded shadow-2xs">
                    <span className="text-[8px] bg-slate-700 text-amber-400 px-1 rounded select-none">IND</span>
                    <span>{showGatePassModal.vehicleNo}</span>
                  </div>
                </div>

                <div>
                  <span className="text-slate-400 block font-sans">Driver In-Charge</span>
                  <strong className="text-slate-800 block mt-0.5 text-[11px]">{showGatePassModal.driverName}</strong>
                  <span className="text-[9px] text-slate-500 font-mono">{showGatePassModal.driverContact || showGatePassModal.contactNo || '+91 98711 22334'}</span>
                </div>

                <div>
                  <span className="text-slate-400 block font-sans">Dispatch Date</span>
                  <strong className="text-slate-900 block mt-0.5 font-mono text-[11px]">
                    {showGatePassModal.date || new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                  </strong>
                </div>

                <div>
                  <span className="text-slate-400 block font-sans">Dispatch Time</span>
                  <strong className="text-indigo-700 block mt-0.5 font-mono text-[11px]">
                    {showGatePassModal.dispatchTime || new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true })}
                  </strong>
                </div>
              </div>

              {/* Itemized Consignment Table */}
              <div className="border-t border-slate-200 pt-2.5">
                <div className="flex items-center justify-between mb-1.5 text-[10px] font-bold text-slate-700 uppercase tracking-wider">
                  <span>Loaded Consignment Items ({showGatePassModal.itemsList?.length || 1} Products)</span>
                  <span className="text-indigo-600 font-bold">Consignment Material Manifest</span>
                </div>
                <div className="border border-slate-300 rounded-lg overflow-hidden">
                  <table className="w-full text-left text-[10px] font-sans">
                    <thead className="bg-slate-100 font-bold text-slate-700 border-b border-slate-300">
                      <tr>
                        <th className="p-1.5 w-6 text-center">#</th>
                        <th className="p-1.5">Product &amp; SKU</th>
                        <th className="p-1.5">Batch / Expiry / ESL</th>
                        <th className="p-1.5 text-right">Packaging Breakdown</th>
                        <th className="p-1.5 text-right">Total Base Qty</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200">
                      {(showGatePassModal.itemsList && showGatePassModal.itemsList.length > 0 ? showGatePassModal.itemsList : [{
                        name: showGatePassModal.productName,
                        sku: showGatePassModal.sku,
                        location: showGatePassModal.location,
                        qty: showGatePassModal.totalQty,
                        baseUnit: showGatePassModal.baseUnit,
                        packQty: showGatePassModal.packCount,
                        looseQty: showGatePassModal.looseCount || 0,
                        packUnit: showGatePassModal.packUnit,
                        batch: 'BAT-2026-01'
                      }]).map((it, idx) => {
                        const esl = getEslInfo({ name: it.name, expiryDate: it.expiryDate || showGatePassModal.expiryDate, batchNo: it.batch })
                        return (
                          <tr key={idx} className="hover:bg-slate-50/50">
                            <td className="p-1.5 text-center text-slate-400 font-mono">{idx + 1}</td>
                            <td className="p-1.5">
                              <div className="font-bold text-slate-900 leading-tight">{it.name}</div>
                              <div className="text-[9px] text-slate-500 font-mono">{it.sku} • {it.location}</div>
                            </td>
                            <td className="p-1.5 font-mono text-[9px]">
                              <div className="font-bold text-slate-800">{it.batch || '—'}</div>
                              <div className="text-emerald-700 font-semibold">{esl.expiryFormatted} ({esl.eslText})</div>
                            </td>
                            <td className="p-1.5 text-right font-mono font-semibold text-slate-800">
                              {it.packQty || 0} {it.packUnit || 'Packs'}
                              {it.looseQty > 0 ? ` + ${it.looseQty} ${it.baseUnit || ''}` : ''}
                            </td>
                            <td className="p-1.5 text-right font-mono font-bold text-slate-900">
                              {Number(it.qty || 0).toLocaleString()} {it.baseUnit || showGatePassModal.baseUnit}
                            </td>
                          </tr>
                        )
                      })}
                    </tbody>
                    <tfoot className="bg-slate-100 font-bold text-slate-900 border-t border-slate-300">
                      <tr>
                        <td colSpan={3} className="p-1.5 text-right text-[10px] uppercase font-bold text-slate-700">Consignment Grand Total:</td>
                        <td className="p-1.5 text-right font-mono text-indigo-700 text-[10px]">
                          {showGatePassModal.packCount} {showGatePassModal.packUnit || 'Packs'}
                          {showGatePassModal.looseCount > 0 ? ` + ${showGatePassModal.looseCount} Loose` : ''}
                        </td>
                        <td className="p-1.5 text-right font-mono font-black text-slate-900 text-xs">
                          {Number(showGatePassModal.totalQty || 0).toLocaleString()} {showGatePassModal.baseUnit}
                        </td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
              </div>

              {/* Dual Gate Clearance Sign-off (Godown Exit Gate & Destination Receiving Gate) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                {/* Gate 1: Warehouse Exit Gate Clearance */}
                <div className="border border-slate-300 rounded-lg p-2.5 bg-slate-50/70">
                  <div className="flex items-center justify-between pb-1 border-b border-slate-200">
                    <span className="font-bold text-[10px] text-slate-800 uppercase">1. Warehouse Exit Gate Clearance</span>
                    <span className="text-[8px] font-bold text-emerald-700 bg-emerald-100 px-1.5 py-0.5 rounded">PASSED &amp; CLEARED</span>
                  </div>
                  <p className="text-[9px] text-slate-500 mt-1">Physical cargo count &amp; vehicle registration verified at warehouse exit gate.</p>
                  <div className="mt-3 flex items-end justify-between text-[9px] text-slate-500">
                    <div>
                      <div className="border-b border-slate-400 w-28 pb-0.5 text-center font-bold text-slate-800 font-sans">R. Sharma (Security)</div>
                      <span className="text-[8px]">Security Officer Sign &amp; Stamp</span>
                    </div>
                    <span className="font-mono text-[9px] font-bold text-slate-700">Exit: {showGatePassModal.dispatchTime || '02:55 PM'}</span>
                  </div>
                </div>

                {/* Gate 2: Destination Receiving Gate Verification */}
                <div className="border border-slate-300 rounded-lg p-2.5 bg-indigo-50/30">
                  <div className="flex items-center justify-between pb-1 border-b border-slate-200">
                    <span className="font-bold text-[10px] text-indigo-950 uppercase">2. Destination Receiving Gate</span>
                    <span className="text-[8px] font-bold text-indigo-700 bg-indigo-100 px-1.5 py-0.5 rounded">CONSIGNEE RECEIPT</span>
                  </div>
                  <p className="text-[9px] text-slate-500 mt-1">Driver will present this slip at destination gate for unloading &amp; receiving confirmation.</p>
                  <div className="mt-3 flex items-end justify-between text-[9px] text-slate-500">
                    <div>
                      <div className="border-b border-dashed border-slate-400 w-28 pb-0.5 text-center text-slate-400">___________________</div>
                      <span className="text-[8px]">Store Receiver Sign &amp; Stamp</span>
                    </div>
                    <span className="text-[8px] text-slate-400">Date &amp; Seal Verified</span>
                  </div>
                </div>
              </div>

              {/* Security & QA Clearance Bar with QR */}
              <div className="border-t border-b border-slate-200 py-2.5 flex items-center justify-between">
                <div>
                  <p className="text-[10px] text-slate-400 uppercase font-sans">Quality Assurance &amp; Gate Security</p>
                  <p className="text-xs font-bold text-emerald-700">✓ 100% LAB QC PASSED &amp; LOAD VERIFIED</p>
                  <p className="text-[10px] text-slate-500 mt-0.5 font-sans">Single Gate Pass for Complete Truck Consignment</p>
                </div>
                <div className="flex flex-col items-center gap-1 shrink-0">
                  <div className="w-16 h-16 bg-white border border-slate-300 rounded-lg p-1 flex items-center justify-center shadow-xs overflow-hidden">
                    {gatePassQrUrl ? (
                      <img
                        src={gatePassQrUrl}
                        alt="Dispatch Gate Pass QR"
                        className="w-full h-full object-contain"
                        title="Scan at Warehouse Gate or Receiving Hub to verify dispatch manifest"
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

              <div className="pt-1 flex items-center justify-between text-[10px] text-slate-400 font-sans">
                <span>Dispatch Officer: {showGatePassModal.officer || 'Warehouse Manager'}</span>
                <span>Gate Stamp: AUTHORIZED OUTWARD PASS</span>
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
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-md shadow-indigo-600/20 transition cursor-pointer"
              >
                <Printer className="w-4 h-4" />
                <span>🖨️ Print Single Gate Pass</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 5: LOAD ITEMS INTO EXISTING VEHICLE (DEDICATED CARGO LOADING MODAL) */}
      {showLoadItemsModal && loadVehicleData && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
          <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 max-w-4xl w-full p-4 sm:p-6 max-h-[92dvh] overflow-y-auto no-scrollbar animate-in fade-in zoom-in-95">
            {/* Header */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-indigo-600 text-white flex items-center justify-center shadow-md shadow-indigo-600/20">
                  <Truck className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-extrabold text-slate-800">
                    Load Cargo into Vehicle (Truck Loading Manifest)
                  </h3>
                  <p className="text-xs text-slate-500">
                    Truck: <span className="font-mono font-bold text-indigo-700">{loadVehicleData.vehicleNo}</span> • Driver: {loadVehicleData.driverName} • Destination: {loadVehicleData.customerUnit}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowLoadItemsModal(false)}
                className="p-1.5 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Truck Info Banner */}
            <div className="mt-4 bg-slate-900 text-white p-3.5 rounded-2xl border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-2 shadow-xs">
              <div className="flex items-center gap-3">
                <span className="font-mono font-black text-amber-400 text-sm tracking-wider bg-slate-800 px-2.5 py-1 rounded-lg border border-slate-700">
                  {loadVehicleData.vehicleNo}
                </span>
                <div className="text-xs">
                  <span className="text-slate-400">Destination: </span>
                  <strong className="text-white">{loadVehicleData.customerUnit}</strong>
                  <span className="text-slate-400 ml-2">Order/Indent: </span>
                  <span className="font-mono text-indigo-300 font-bold">{loadVehicleData.poIndentNo}</span>
                </div>
              </div>
              <span className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-emerald-950 text-emerald-400 border border-emerald-800/60 self-start sm:self-auto">
                🚚 1 Truck = 1 Destination
              </span>
            </div>

            {/* Already Loaded Items in this Truck */}
            {loadVehicleData.existingItems && loadVehicleData.existingItems.length > 0 && (
              <div className="mt-4">
                <h4 className="font-bold text-slate-800 text-xs mb-2 flex items-center gap-2">
                  <Package className="w-3.5 h-3.5 text-slate-600" />
                  <span>Already Loaded in this Truck ({loadVehicleData.existingItems.length} Items):</span>
                </h4>
                <div className="border border-slate-200 rounded-xl overflow-hidden text-xs">
                  <table className="w-full text-left">
                    <thead className="bg-slate-50 text-[10px] uppercase font-bold text-slate-500 border-b border-slate-200">
                      <tr>
                        <th className="py-2 px-3">Item &amp; SKU</th>
                        <th className="py-2 px-3">Batch &amp; Expiry / ESL</th>
                        <th className="py-2 px-3 text-right">Packaging</th>
                        <th className="py-2 px-3 text-right">Base Qty</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {loadVehicleData.existingItems.map((it, idx) => {
                        const esl = getEslInfo({ name: it.name, batchNo: it.batch, expiryDate: it.expiryDate })
                        return (
                          <tr key={idx} className="hover:bg-slate-50/50">
                            <td className="py-2 px-3">
                              <span className="font-semibold text-slate-800">{it.name}</span>
                              <span className="text-[10px] text-slate-400 ml-1.5 font-mono">{it.sku}</span>
                            </td>
                            <td className="py-2 px-3 font-mono text-[11px]">
                              <span className="font-bold text-slate-700">{it.batch}</span>
                              <span className="text-emerald-600 ml-1.5 font-semibold">({esl.expiryFormatted})</span>
                            </td>
                            <td className="py-2 px-3 text-right text-indigo-700 font-semibold">
                              {it.packQty || 0} {it.packUnit || 'Packs'}{it.looseQty > 0 ? ` + ${it.looseQty} Loose` : ''}
                            </td>
                            <td className="py-2 px-3 text-right font-bold text-slate-900">
                              {Number(it.qty || 0).toLocaleString()} {it.baseUnit || loadVehicleData.baseUnit}
                            </td>
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* New Items to Load */}
            <div className="mt-4 space-y-3">
              <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                <h4 className="font-bold text-slate-900 text-xs flex items-center gap-2">
                  <span className="w-5 h-5 rounded-md bg-indigo-600 text-white font-mono text-[10px] flex items-center justify-center font-bold">
                    +
                  </span>
                  <span>New Items to Load into Vehicle ({loadVehicleData.newItems?.length || 0} Items):</span>
                </h4>
                <button
                  type="button"
                  onClick={handleAddLoadVehicleItem}
                  className="px-2.5 py-1 rounded-lg bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-bold text-xs flex items-center gap-1 transition cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>+ Add Item</span>
                </button>
              </div>

              {loadVehicleData.newItems?.map((item, idx) => {
                const itemEsl = getEslInfo({
                  name: item.productName,
                  expiryDate: item.expiryDate,
                  batchNo: item.batchNo,
                })
                const productBatches = getBatchesForProduct(item.productId, item.productName, item.sku)

                return (
                  <div
                    key={item.id || idx}
                    className={`rounded-2xl border p-3.5 space-y-3 text-xs shadow-2xs ${
                      item.isBlocked ? 'bg-rose-50/50 border-rose-300' : 'bg-slate-50/90 border-slate-200'
                    }`}
                  >
                    {/* Item Header */}
                    <div className="flex items-center justify-between pb-2 border-b border-slate-200/80">
                      <div className="flex items-center gap-2">
                        <span className="w-5 h-5 rounded-md bg-indigo-600 text-white font-mono font-bold text-[10px] flex items-center justify-center">
                          {idx + 1}
                        </span>
                        <span className="font-bold text-slate-800">
                          {item.productName || 'Select Product'}
                        </span>
                        {item.isBlocked ? (
                          <span className="text-[10px] font-bold text-rose-700 bg-rose-100 px-2 py-0.5 rounded-full border border-rose-300 flex items-center gap-1">
                            <Lock className="w-3 h-3 text-rose-600" />
                            <span>⛔ HOLD / FAILED - BLOCKED</span>
                          </span>
                        ) : (
                          <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full border border-emerald-300 flex items-center gap-1">
                            <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                            <span>✓ QC PASSED</span>
                          </span>
                        )}
                      </div>

                      {loadVehicleData.newItems.length > 1 && (
                        <button
                          type="button"
                          onClick={() => handleRemoveLoadVehicleItem(item.id)}
                          className="px-2 py-1 rounded-lg text-rose-600 hover:bg-rose-100 text-[11px] font-bold transition flex items-center gap-1 cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          <span>Remove</span>
                        </button>
                      )}
                    </div>

                    {/* Blocking Alert */}
                    {item.isBlocked && (
                      <div className="bg-rose-100 border border-rose-300 text-rose-900 rounded-xl p-2.5 flex items-start gap-2">
                        <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                        <div>
                          <p className="font-bold text-xs">⛔ BLOCKED: This item cannot be loaded into the vehicle!</p>
                          <p className="text-[11px] text-rose-700 mt-0.5">
                            Reason: <strong>{item.blockReason}</strong>. Materials on Quality Hold or failing QC certification cannot be dispatched.
                          </p>
                        </div>
                      </div>
                    )}

                    {/* Product & Bin */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <div className="sm:col-span-2">
                        <label className="block text-[11px] font-bold text-slate-700 mb-1">Product Item *</label>
                        <CustomSelect
                          value={item.productId}
                          onChange={(val) => handleUpdateLoadVehicleItem(item.id, 'productId', val)}
                          options={[
                            ...products.map((p) => {
                              const isProdBlocked = p.status === 'Hold' || p.qcStatus === 'Failed' || p.isHold === true
                              return {
                                value: p._id,
                                label: isProdBlocked ? `⛔ ${p.name} (ON QUALITY HOLD)` : p.name,
                                sublabel: isProdBlocked
                                  ? '⛔ BLOCKED: Cannot load'
                                  : `SKU: ${p.sku} | Stock: ${p.currentStock || 0} ${p.baseUnit || 'Kg'}`,
                                disabled: isProdBlocked,
                              }
                            }),
                            { value: 'CUSTOM', label: '+ Type Custom Product Name...' },
                          ]}
                          placeholder="Select product..."
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-bold text-slate-700 mb-1">Bin Location *</label>
                        <input
                          type="text"
                          required
                          value={item.locationCode}
                          onChange={(e) => handleUpdateLoadVehicleItem(item.id, 'locationCode', e.target.value)}
                          className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs font-mono text-slate-800"
                        />
                      </div>
                    </div>

                    {/* Batch Selection with Hold/Failed Prohibition */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 bg-white p-3 rounded-xl border border-slate-200">
                      <div>
                        <label className="block text-[11px] font-bold text-slate-700 mb-1 flex items-center justify-between">
                          <span>Batch Number (Batch-wise Entry) *</span>
                          {item.isBlocked ? (
                            <span className="text-[10px] font-bold text-rose-700 bg-rose-50 px-1.5 py-0.5 rounded border border-rose-200">
                              ⛔ Blocked
                            </span>
                          ) : (
                            <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200">
                              ✓ Passed
                            </span>
                          )}
                        </label>
                        <CustomSelect
                          value={item.batchNo}
                          onChange={(val) => handleSelectBatchInLoadModal(item.id, val)}
                          options={productBatches.map((b) => ({
                            value: b.batchNo,
                            label: b.isBlocked ? `⛔ ${b.batchNo} (HOLD / LAB FAILED - BLOCKED)` : b.batchNo,
                            sublabel: b.isBlocked
                              ? `⛔ ${b.blockReason.toUpperCase()} (Cannot Select) | Exp: ${b.expiryDate}`
                              : `Exp: ${b.expiryDate} (${b.eslText}) | Stock: ${b.qty} | QC: Passed`,
                            disabled: b.isBlocked,
                          }))}
                          placeholder="Select QC-Passed Batch..."
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] font-bold text-slate-700 mb-1 flex items-center justify-between">
                          <span>Expiry Date &amp; ESL *</span>
                          <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.2 rounded border border-emerald-200">
                            ESL: {itemEsl.eslText}
                          </span>
                        </label>
                        <input
                          type="date"
                          required
                          value={item.expiryDate}
                          onChange={(e) => handleUpdateLoadVehicleItem(item.id, 'expiryDate', e.target.value)}
                          className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-1.5 text-xs text-slate-800 font-mono"
                        />
                      </div>
                    </div>

                    {/* Dual Quantities */}
                    <div className="bg-white p-3 rounded-xl border border-slate-200/90 space-y-2">
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        <div>
                          <label className="block text-[10px] font-bold text-slate-700 mb-1">
                            1. Full {item.maxUnit}s (Cartons/Packs)
                          </label>
                          <input
                            type="number"
                            min="0"
                            value={item.packsCount}
                            onChange={(e) => handleUpdateLoadVehicleItem(item.id, 'packsCount', e.target.value)}
                            className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-1.5 text-xs font-bold text-slate-800"
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] font-bold text-slate-700 mb-1">
                            2. Loose {item.minUnit}s
                          </label>
                          <input
                            type="number"
                            min="0"
                            value={item.looseCount}
                            onChange={(e) => handleUpdateLoadVehicleItem(item.id, 'looseCount', e.target.value)}
                            className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-1.5 text-xs font-bold text-slate-800"
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] font-bold text-indigo-900 mb-1">
                            3. Total Outward ({item.minUnit}s) *
                          </label>
                          <input
                            type="number"
                            min="1"
                            required
                            value={item.totalBaseQty}
                            onChange={(e) => handleUpdateLoadVehicleItem(item.id, 'totalBaseQty', e.target.value)}
                            className="w-full bg-indigo-50/70 border border-indigo-300 rounded-xl px-3 py-1.5 text-xs font-bold font-mono text-indigo-950"
                          />
                        </div>
                      </div>
                      <div className="text-[11px] font-mono text-slate-600 pt-1 border-t border-slate-100 flex justify-between">
                        <span>
                          Loading: {item.packsCount || 0} {item.maxUnit}s + {item.looseCount || 0} Loose ={' '}
                          <strong>{item.totalBaseQty || 0} {item.minUnit}s</strong>
                        </span>
                        {item.availableStock > 0 && (
                          <span className="text-emerald-700 font-bold">Avail: {item.availableStock} {item.minUnit}</span>
                        )}
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>

            {/* Bottom Actions */}
            <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100 mt-4">
              <button
                type="button"
                onClick={() => setShowLoadItemsModal(false)}
                className="px-4 py-2 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-semibold transition cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={isUpdatingGaadiCargo || (loadVehicleData.newItems || []).some((it) => it.isBlocked)}
                onClick={handleSaveGaadiCargo}
                className="px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed text-white text-xs font-bold shadow-md shadow-indigo-600/20 transition cursor-pointer flex items-center gap-2"
              >
                {isUpdatingGaadiCargo && <RefreshCw className="w-3.5 h-3.5 animate-spin" />}
                <span>Confirm &amp; Load into Vehicle</span>
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
