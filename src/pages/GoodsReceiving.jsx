import { useState, useMemo, useRef, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import QRCode from 'qrcode'
import { printSpecificElement } from '../utils/printHelper'
import { getEslInfo, formatDisplayDate } from '../utils/eslHelper'
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
  Loader2,
  Calendar,
  Filter,
  RotateCcw,
  MapPin,
  Sparkles,
  ArrowRight,
  SlidersHorizontal,
  Wand2,
} from 'lucide-react'
import { apiRequest } from '../services/api'
import DataLoader from '../components/common/DataLoader'
import { DATE_PRESET_OPTIONS, isDateMatching } from '../utils/dateFilterHelper'
import CustomSelect from '../components/common/SearchableSelect'
import { formatDualUnits, calculateBaseQty } from '../utils/unitHelper'

const STATUS_OPTIONS = [
  { value: 'Completed', label: 'Completed (Verified & Cleared)' },
  { value: 'In Process', label: 'In Process (Quality Inspection)' },
  { value: 'Pending', label: 'Pending (Unloading Bay Verification)' },
  { value: 'Rejected', label: 'Rejected (Quality Defect / Hold)' },
]

const RACK_OPTIONS = [
  { value: 'RK-01', label: 'RK-01: Primary Inward Storage' },
  { value: 'RK-02', label: 'RK-02: Bulk Pallet Storage' },
  { value: 'RK-03', label: 'RK-03: Secondary Reserve Storage' },
  { value: 'RK-04', label: 'RK-04: High Density Bay' },
]

const ROW_OPTIONS = [
  { value: 'R1', label: 'Row 1 (R1 - Base Tier)' },
  { value: 'R2', label: 'Row 2 (R2 - Middle Tier)' },
  { value: 'R3', label: 'Row 3 (R3 - High Tier)' },
  { value: 'R4', label: 'Row 4 (R4 - Top Tier)' },
  { value: 'R5', label: 'Row 5 (R5 - Extra High)' },
  { value: 'R6', label: 'Row 6 (R6 - Overhead)' },
]

const COL_OPTIONS = [
  { value: 'C1', label: 'Column 1 (C1 - Front Left)' },
  { value: 'C2', label: 'Column 2 (C2 - Left Bay)' },
  { value: 'C3', label: 'Column 3 (C3 - Center Left)' },
  { value: 'C4', label: 'Column 4 (C4 - Center Right)' },
  { value: 'C5', label: 'Column 5 (C5 - Right Bay)' },
  { value: 'C6', label: 'Column 6 (C6 - Far Right)' },
]

export default function GoodsReceiving() {
  const [searchParams, setSearchParams] = useSearchParams()

  // Primary Unified Workflow Tab: 'PENDING_PUT_IN' | 'COMPLETED_PUT_IN' | 'ALL_GRN'
  const initialWorkflowTab = () => {
    const t = searchParams.get('tab')
    if (t === 'completed') return 'COMPLETED_PUT_IN'
    if (t === 'all_grn' || t === 'all') return 'ALL_GRN'
    return 'PENDING_PUT_IN'
  }
  const [workflowTab, setWorkflowTab] = useState(initialWorkflowTab)

  // Sub-status tab for All GRN view
  const [activeTab, setActiveTab] = useState('all') // 'all', 'completed', 'in_process', 'pending', 'rejected'
  const [searchQuery, setSearchQuery] = useState('')
  const [showAddModal, setShowAddModal] = useState(false)
  const [showPrintModal, setShowPrintModal] = useState(false)
  const [toastMessage, setToastMessage] = useState(null)

  // Filter States for Date, Product, Supplier & Shed
  const [filterDate, setFilterDate] = useState('ALL')
  const [filterCustomDate, setFilterCustomDate] = useState('')
  const [filterProduct, setFilterProduct] = useState('ALL')
  const [filterSupplier, setFilterSupplier] = useState('ALL')
  const [filterShed, setFilterShed] = useState('ALL')

  // Real-time Commercial Warehouse Inward GRN Registry
  const [grnList, setGrnList] = useState([])
  const [products, setProducts] = useState([])
  const [shades, setshades] = useState([])
  const [racksList, setRacksList] = useState([])
  const [qcList, setQcList] = useState([])
  const [gateEntries, setGateEntries] = useState([])
  const [loading, setLoading] = useState(true)

  const [selectedGrn, setSelectedGrn] = useState(null)

  // Put-in Modal State
  const [showPutInModal, setShowPutInModal] = useState(false)
  const [activePutInLot, setActivePutInLot] = useState(null)
  const [putInShade, setPutInShade] = useState('SH-01')
  const [putInRack, setPutInRack] = useState('RK-01')
  const [putInDeck, setPutInDeck] = useState('Lower Deck')
  const [putInRow, setPutInRow] = useState('R1')
  const [putInCol, setPutInCol] = useState('C1')
  const [putInRemarks, setPutInRemarks] = useState('')
  const [isSavingPutIn, setIsSavingPutIn] = useState(false)

  // Put-in Slip Modal State
  const [showPutInSlipModal, setShowPutInSlipModal] = useState(false)
  const [putInSlipData, setPutInSlipData] = useState(null)
  const [putInSlipQrUrl, setPutInSlipQrUrl] = useState('')

  // Toast trigger
  const triggerToast = (msg) => {
    setToastMessage(msg)
    setTimeout(() => setToastMessage(null), 3500)
  }

  // Fetch initial data
  const loadData = async () => {
    try {
      setLoading(true)
      const [grnRes, prodRes, shadeRes, gateRes, rackRes, qcRes] = await Promise.allSettled([
        apiRequest('/grn'),
        apiRequest('/product'),
        apiRequest('/shade'),
        apiRequest('/gate-entry'),
        apiRequest('/rack'),
        apiRequest('/qc'),
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
        setshades(shadeRes.value)
      }
      if (gateRes.status === 'fulfilled' && Array.isArray(gateRes.value)) {
        setGateEntries(gateRes.value)
      }
      if (rackRes.status === 'fulfilled' && Array.isArray(rackRes.value)) {
        setRacksList(rackRes.value)
      }
      if (qcRes.status === 'fulfilled' && Array.isArray(qcRes.value)) {
        setQcList(qcRes.value)
      }
    } catch {
      triggerToast('Error loading GRN and Rack records')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [])

  // Sync Tab with searchParams changes if back button used
  useEffect(() => {
    const t = searchParams.get('tab')
    if (t === 'completed' && workflowTab !== 'COMPLETED_PUT_IN') {
      setWorkflowTab('COMPLETED_PUT_IN')
    } else if (t === 'pending' && workflowTab !== 'PENDING_PUT_IN') {
      setWorkflowTab('PENDING_PUT_IN')
    } else if ((t === 'all_grn' || t === 'all') && workflowTab !== 'ALL_GRN') {
      setWorkflowTab('ALL_GRN')
    }
  }, [searchParams])

  // Dynamic shades options
  const shadeOptions = useMemo(() => {
    if (shades && shades.length > 0) {
      return shades.map((s) => ({
        value: `${s.code} (${s.name})`,
        label: `${s.code} - ${s.name} (${s.type || 'Warehouse'})`,
      }))
    }
    return [
      { value: 'SH-01 (Shed 1: Grains & Bulk Pulses)', label: 'SH-01 - Shed 1: Grains & Bulk Pulses' },
      { value: 'SH-02 (Shed 2: Edible Oils & Liquids)', label: 'SH-02 - Shed 2: Edible Oils & Liquids' },
      { value: 'SH-03 (Shed 3: FMCG & Packaged Foods)', label: 'SH-03 - Shed 3: FMCG & Packaged Foods' },
      { value: 'SH-04 (Shed 4: Packaging & Materials)', label: 'SH-04 - Shed 4: Packaging & Materials' },
      { value: 'SH-05 (Shed 5: Chemicals & Hygiene)', label: 'SH-05 - Shed 5: Chemicals & Hygiene' },
      { value: 'SH-06 (Shed 6: Spares & General Hardware)', label: 'SH-06 - Shed 6: Spares & General Hardware' },
    ]
  }, [shades])

  // Extract all individual material lots from all GRNs for Put-in tracking
  const allInwardLots = useMemo(() => {
    const lots = []
    grnList.forEach((g) => {
      if (Array.isArray(g.materials) && g.materials.length > 0) {
        g.materials.forEach((m, idx) => {
          const isCompleted = m.putAwayStatus === 'Completed' || (Boolean(m.location) && m.location.trim().length > 0)
          const assignedLocation = m.location || ''

          // QC status match
          const qc = qcList.find((q) => q.grnNo === g.grnNo && (q.sku === m.sku || q.batchNo === m.batchNo))
          let qcStatus = 'Pending QC'
          if (qc?.status === 'Passed') qcStatus = 'Passed / Cleared'
          else if (qc?.status === 'Failed / Rejected') qcStatus = 'Failed / Rejected'
          else if (qc?.status) qcStatus = qc.status

          lots.push({
            lotId: `${g._id || g.grnNo}-${idx}`,
            grnId: g._id,
            grnNo: g.grnNo,
            poNo: g.poNo,
            supplier: g.supplier,
            vehicleNo: g.vehicleNo,
            grnDate: g.createdAt || g.dateTime || g.date,
            grnShade: g.shade,
            productName: m.productName || m.name || 'Consignment Material',
            productId: m.productId,
            sku: m.sku || `SKU-${idx + 1}`,
            batchNo: m.batchNo || `BTH-${g.grnNo?.slice(-4) || '2026'}`,
            packageQty: Number(m.packageQty) || 0,
            looseQty: Number(m.looseQty) || 0,
            packagingUnit: m.maxUnit || m.packagingUnit || 'Carton',
            packSize: Number(m.conversionRatio) || Number(m.packSize) || 1,
            totalBaseQty: Number(m.totalBaseQty) || (((Number(m.packageQty) || 0) * (Number(m.packSize) || 1)) + (Number(m.looseQty) || 0)),
            baseUnit: m.minUnit || m.baseUnit || 'Packet',
            mfgDate: m.mfgDate || '',
            expiryDate: m.expiryDate || '',
            location: assignedLocation,
            putAwayStatus: isCompleted ? 'Completed' : 'Pending',
            putAwayAt: m.putAwayAt || null,
            qcStatus,
            grnStatus: g.status,
            rawMaterial: m,
            rawGrn: g,
          })
        })
      }
    })
    return lots
  }, [grnList, qcList])

  // Set of all occupied location codes in warehouse
  const occupiedLocationCodes = useMemo(() => {
    const codes = new Set()
    racksList.forEach((rack) => {
      if (rack.cells && Array.isArray(rack.cells)) {
        rack.cells.forEach((cell) => {
          if (cell.status === 'Occupied' || cell.status === 'Blocked' || cell.currentStock > 0) {
            codes.add(cell.code)
          }
        })
      }
    })
    grnList.forEach((g) => {
      if (Array.isArray(g.materials)) {
        g.materials.forEach((m) => {
          if (m.location) codes.add(m.location)
        })
      }
    })
    return codes
  }, [racksList, grnList])

  // Food vs Chemical safety helper
  const isFoodItem = (name = '') => {
    const n = (name || '').toLowerCase()
    return (
      n.includes('grain') || n.includes('pulse') || n.includes('wheat') ||
      n.includes('rice') || n.includes('oil') || n.includes('mustard') ||
      n.includes('sugar') || n.includes('biscuit') || n.includes('flour') ||
      n.includes('atta') || n.includes('food') || n.includes('fmcg') ||
      n.includes('snack') || n.includes('parle') || n.includes('fortune') ||
      n.includes('dal') || n.includes('edible')
    )
  }

  const isChemicalZone = (shade = '') => {
    const s = (shade || '').toLowerCase()
    return s.includes('chem') || s.includes('hygiene') || s.includes('sh-05') || s.includes('sh05') || s.includes('hazard') || s.includes('toxic')
  }

  // Find next free bin in any shed
  const findNextAvailableBin = (shadeCode) => {
    const cleanshade = shadeCode ? shadeCode.split(' ')[0] : 'SH-01'
    const sMatch = cleanshade.match(/SH[-_]?0?(\d+)/i)
    const sNum = sMatch ? parseInt(sMatch[1]) : 1

    const matchingRacks = racksList.filter((r) => {
      const rSMatch = (r.shadeCode || '').match(/SH[-_]?0?(\d+)/i)
      return (
        (rSMatch && parseInt(rSMatch[1]) === sNum) ||
        r.shadeCode === cleanshade ||
        r.shadeId === cleanshade
      )
    })

    if (matchingRacks.length > 0) {
      for (const rack of matchingRacks) {
        if (rack.cells && Array.isArray(rack.cells)) {
          for (const cell of rack.cells) {
            const cellCode = cell.code || `${rack.shadeCode}-${rack.rackNumber}-R${cell.row}-C${cell.col}`
            if (
              cell.status === 'Empty' &&
              !occupiedLocationCodes.has(cellCode) &&
              (!cell.currentStock || Number(cell.currentStock) === 0)
            ) {
              return {
                shade: rack.shadeCode || cleanshade,
                rackNumber: rack.rackNumber,
                row: `R${cell.row}`,
                col: `C${cell.col}`,
                code: cellCode,
                found: true,
              }
            }
          }
        }
      }
    }

    // Default fallback search across 4 Rows x 6 Cols
    for (let r = 1; r <= 4; r++) {
      for (let c = 1; c <= 6; c++) {
        const rowStr = `R${r}`
        const colStr = `C${c}`
        const testCode = `${cleanshade}-RK-01-${rowStr}-${colStr}`
        if (!occupiedLocationCodes.has(testCode)) {
          return {
            shade: cleanshade,
            rackNumber: 'RK-01',
            row: rowStr,
            col: colStr,
            code: testCode,
            found: true,
          }
        }
      }
    }

    return {
      shade: cleanshade,
      rackNumber: 'RK-01',
      row: 'R1',
      col: 'C1',
      code: `${cleanshade}-RK-01-R1-C1`,
      found: false,
    }
  }

  // Product options formatted for SearchableSelect
  const grnProductOptions = useMemo(() => {
    return products.map((p) => {
      const maxU = p.maxUnit || p.outerPackaging || 'Carton'
      const minU = p.minUnit || p.baseUnit || 'Packet'
      const ratio = p.conversionRatio || p.packSize || 1
      return {
        value: p._id,
        label: `${p.name} (${p.sku}) — [1 ${maxU} = ${ratio} ${minU}s]`,
      }
    })
  }, [products])

  // Dynamic Empty GRN Item Helper
  const EMPTY_GRN_ITEM = () => ({
    id: Date.now() + Math.random(),
    productId: '',
    productName: '',
    sku: '',
    packageQty: '1',
    looseQty: '0',
    packagingUnit: 'Carton',
    packSize: 1,
    totalBaseQty: 1,
    baseUnit: 'Packet',
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
    shade: shadeOptions[0]?.value || 'SH-01 (Shed 1: Grains & Bulk Pulses)',
    status: 'Completed',
    receivedBy: 'Warehouse Manager',
    remarks: 'Received and verified at Inward Receiving Terminal',
    materials: [EMPTY_GRN_ITEM()],
  }
  const [newGrn, setNewGrn] = useState(initialNewGrn)
  const [grnSuccessModal, setGrnSuccessModal] = useState(null)
  const [grnQrDataUrl, setGrnQrDataUrl] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Pending Gate Passes filter
  const pendingGateEntries = useMemo(() => {
    return gateEntries.filter((ge) => {
      if (ge.status === 'Gate Out / Cleared') return false
      const alreadyHasGrn = grnList.some(
        (grn) =>
          (grn.gateEntryId && String(grn.gateEntryId) === String(ge._id)) ||
          (grn.poNo && grn.poNo === ge.poNumber && grn.vehicleNo === ge.vehicleNumber)
      )
      return !alreadyHasGrn
    })
  }, [gateEntries, grnList])

  // Dynamic Product Filter Options
  const productFilterOptions = useMemo(() => {
    const list = [{ value: 'ALL', label: 'All Products (Sabhi Items)' }]
    const names = new Set()
    products.forEach((p) => {
      if (p.name && !names.has(p.name)) {
        names.add(p.name)
        list.push({ value: p.name, label: `${p.name} (${p.sku || ''})` })
      }
    })
    grnList.forEach((g) => {
      if (Array.isArray(g.materials)) {
        g.materials.forEach((m) => {
          const mName = m.productName || m.name
          if (mName && !names.has(mName)) {
            names.add(mName)
            list.push({ value: mName, label: mName })
          }
        })
      }
    })
    return list
  }, [products, grnList])

  // Dynamic Gate Pass Options for Autofill
  const gatePassOptions = useMemo(() => {
    return [
      { value: '', label: pendingGateEntries.length > 0 ? `-- Search & Select Gate Pass (${pendingGateEntries.length} Pending) --` : '-- No Pending Gate Passes --' },
      ...pendingGateEntries.map((ge) => ({
        value: ge.passNumber,
        label: `${ge.passNumber} — ${ge.vehicleNumber} (${ge.supplier || 'Vendor'})`,
      }))
    ]
  }, [pendingGateEntries])

  // Dynamic Supplier Filter Options
  const supplierFilterOptions = useMemo(() => {
    const list = [{ value: 'ALL', label: 'All Suppliers / Vendors' }]
    const supps = new Set()
    grnList.forEach((g) => {
      if (g.supplier && !supps.has(g.supplier)) {
        supps.add(g.supplier)
        list.push({ value: g.supplier, label: g.supplier })
      }
    })
    return list
  }, [grnList])

  // Dynamic Shed Filter Options
  const shedFilterOptions = useMemo(() => {
    const list = [{ value: 'ALL', label: 'All Warehouse Sheds' }]
    if (shades && shades.length > 0) {
      shades.forEach((s) => {
        list.push({ value: s.code || s.name, label: `${s.code || ''} - ${s.name || ''}`.trim() })
      })
    } else {
      shadeOptions.forEach((s) => {
        list.push({ value: s.value, label: s.label })
      })
    }
    return list
  }, [shades, shadeOptions])

  // Filtered GRNs for All GRN view
  const filteredGrn = useMemo(() => {
    return grnList.filter((item) => {
      if (activeTab === 'completed' && item.status !== 'Completed') return false
      if (activeTab === 'in_process' && item.status !== 'In Process') return false
      if (activeTab === 'pending' && item.status !== 'Pending') return false
      if (activeTab === 'rejected' && item.status !== 'Rejected') return false

      if (filterDate !== 'ALL') {
        const dVal = item.createdAt || item.dateTime || item.date
        if (!isDateMatching(dVal, filterDate, filterCustomDate)) return false
      }

      if (filterProduct !== 'ALL') {
        const target = filterProduct.toLowerCase()
        const hasProd =
          item.materials &&
          Array.isArray(item.materials) &&
          item.materials.some(
            (m) =>
              ((m.productName || m.name) && (m.productName || m.name).toLowerCase().includes(target)) ||
              (m.sku && m.sku.toLowerCase().includes(target))
          )
        if (!hasProd) return false
      }

      if (filterSupplier !== 'ALL' && item.supplier !== filterSupplier) return false

      if (filterShed !== 'ALL') {
        if (!item.shade || !item.shade.toLowerCase().includes(filterShed.toLowerCase())) {
          return false
        }
      }

      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase()
        const matchBasic =
          (item.grnNo && item.grnNo.toLowerCase().includes(q)) ||
          (item.poNo && item.poNo.toLowerCase().includes(q)) ||
          (item.supplier && item.supplier.toLowerCase().includes(q)) ||
          (item.vehicleNo && item.vehicleNo.toLowerCase().includes(q)) ||
          (item.receivedBy && item.receivedBy.toLowerCase().includes(q)) ||
          (item.shade && item.shade.toLowerCase().includes(q))

        const matchMaterials =
          item.materials &&
          Array.isArray(item.materials) &&
          item.materials.some(
            (m) =>
              ((m.productName || m.name) && (m.productName || m.name).toLowerCase().includes(q)) ||
              (m.sku && m.sku.toLowerCase().includes(q)) ||
              (m.batchNo && m.batchNo.toLowerCase().includes(q))
          )

        return matchBasic || matchMaterials
      }
      return true
    })
  }, [grnList, activeTab, searchQuery, filterDate, filterCustomDate, filterProduct, filterSupplier, filterShed])

  // Filtered Put-in Lots for Pending & Completed tabs
  const filteredLots = useMemo(() => {
    const targetStatus = workflowTab === 'PENDING_PUT_IN' ? 'Pending' : 'Completed'
    return allInwardLots.filter((item) => {
      if (item.putAwayStatus !== targetStatus) return false

      // Date Filter
      if (filterDate !== 'ALL') {
        const dVal = item.grnDate || item.putAwayAt
        if (!isDateMatching(dVal, filterDate, filterCustomDate)) return false
      }

      // Product Filter
      if (filterProduct !== 'ALL') {
        const target = filterProduct.toLowerCase()
        const prodMatch =
          (item.productName && item.productName.toLowerCase().includes(target)) ||
          (item.sku && item.sku.toLowerCase().includes(target))
        if (!prodMatch) return false
      }

      // Shed Filter
      if (filterShed !== 'ALL') {
        const sTarget = filterShed.toLowerCase()
        const shedMatch =
          (item.grnShade && item.grnShade.toLowerCase().includes(sTarget)) ||
          (item.location && item.location.toLowerCase().includes(sTarget))
        if (!shedMatch) return false
      }

      // Supplier Filter
      if (filterSupplier !== 'ALL' && item.supplier !== filterSupplier) {
        return false
      }

      // Search Query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase()
        return (
          (item.grnNo && item.grnNo.toLowerCase().includes(q)) ||
          (item.productName && item.productName.toLowerCase().includes(q)) ||
          (item.sku && item.sku.toLowerCase().includes(q)) ||
          (item.batchNo && item.batchNo.toLowerCase().includes(q)) ||
          (item.poNo && item.poNo.toLowerCase().includes(q)) ||
          (item.supplier && item.supplier.toLowerCase().includes(q)) ||
          (item.vehicleNo && item.vehicleNo.toLowerCase().includes(q)) ||
          (item.location && item.location.toLowerCase().includes(q))
        )
      }

      return true
    })
  }, [allInwardLots, workflowTab, filterDate, filterCustomDate, filterProduct, filterShed, filterSupplier, searchQuery])

  // Filtered Inward Summary Stats
  const filteredInwardStats = useMemo(() => {
    let totalQty = 0
    let totalPackages = 0
    let unitLabel = 'Units'

    if (workflowTab === 'ALL_GRN') {
      filteredGrn.forEach((g) => {
        if (!g.materials || !Array.isArray(g.materials)) return
        g.materials.forEach((m) => {
          if (filterProduct !== 'ALL') {
            const target = filterProduct.toLowerCase()
            const matches =
              ((m.productName || m.name) && (m.productName || m.name).toLowerCase().includes(target)) ||
              (m.sku && m.sku.toLowerCase().includes(target))
            if (!matches) return
          }
          totalPackages += Number(m.packageQty) || 0
          totalQty += Number(m.totalBaseQty) || (Number(m.packageQty) * (Number(m.packSize) || 1)) || 0
          if (m.baseUnit) unitLabel = m.baseUnit
        })
      })
      return { totalQty, totalPackages, unitLabel, count: filteredGrn.length }
    }

    filteredLots.forEach((l) => {
      totalPackages += Number(l.packageQty) || 0
      totalQty += Number(l.totalBaseQty) || 0
      if (l.baseUnit) unitLabel = l.baseUnit
    })
    return { totalQty, totalPackages, unitLabel, count: filteredLots.length }
  }, [filteredGrn, filteredLots, workflowTab, filterProduct])

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
            updated.packagingUnit = prod.maxUnit || prod.outerPackaging || 'Carton'
            updated.packSize = prod.conversionRatio || prod.packSize || 1
            updated.baseUnit = prod.minUnit || prod.baseUnit || 'Packet'
            const packs = Number(updated.packageQty) || 0
            const loose = Number(updated.looseQty) || 0
            updated.totalBaseQty = (packs * updated.packSize) + loose
          }
        }

        if (field === 'packageQty' || field === 'looseQty') {
          const packs = Math.max(0, Number(field === 'packageQty' ? value : updated.packageQty) || 0)
          const loose = Math.max(0, Number(field === 'looseQty' ? value : updated.looseQty) || 0)
          updated[field] = value
          const ratio = Number(updated.packSize) || 1
          updated.totalBaseQty = (packs * ratio) + loose
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

          const qty = Number(item.packageQty) || 0
          const loose = Number(item.looseQty) || 0
          const packSize = prod?.conversionRatio || prod?.packSize || Number(item.packSize) || 1
          const totalBase = (qty * packSize) + loose

          return {
            id: Date.now() + idx + Math.random(),
            productId: prod ? prod._id : '',
            productName: prod ? prod.name : (item.product || 'Consignment Material'),
            sku: prod ? prod.sku : (item.sku || `SKU-${idx + 1}`),
            packageQty: String(qty),
            looseQty: String(loose),
            packagingUnit: prod ? (prod.maxUnit || prod.outerPackaging || 'Carton') : (item.packagingUnit || 'Carton'),
            packSize: packSize,
            totalBaseQty: totalBase,
            baseUnit: prod ? (prod.minUnit || prod.baseUnit || 'Packet') : (item.baseUnit || 'Packet'),
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
      let matchedshade = newGrn.shade
      if (entry.assignedBay) {
        const foundshade = shadeOptions.find((s) => {
          const shadeCodeMatch = entry.assignedBay.match(/SH-0[1-6]/i)
          if (shadeCodeMatch && s.value.toLowerCase().includes(shadeCodeMatch[0].toLowerCase())) return true
          const bayNum = entry.assignedBay.match(/(?:Bay|shade)\s*([1-6])/i)
          if (bayNum && s.value.includes(`SH-0${bayNum[1]}`)) return true
          return false
        })
        if (foundshade) matchedshade = foundshade.value
      }

      setNewGrn((prev) => ({
        ...prev,
        selectedGatePassNo: gatePassNo,
        gateEntryId: entry._id,
        vehicleNo: entry.vehicleNumber || prev.vehicleNo,
        supplier: entry.supplier || prev.supplier,
        poNo: entry.poNumber || entry.challanNo || prev.poNo,
        shade: matchedshade,
        materials: populatedMaterials,
      }))
      triggerToast(`Successfully loaded all ${populatedMaterials.length} items from Gate Pass ${entry.passNumber}!`)
    }
  }

  // Create GRN
  const handleCreateGrn = async (e) => {
    e.preventDefault()
    if (isSubmitting) return

    if (!newGrn.poNo.trim() || !newGrn.supplier.trim() || !newGrn.vehicleNo.trim()) {
      triggerToast('PO Number, Supplier Name and Vehicle Number are required!')
      return
    }

    if (!newGrn.materials || newGrn.materials.length === 0) {
      triggerToast('At least 1 material item is required!')
      return
    }

    // Validate Mandatory Mfg Date & Expiry Date for each item
    for (let i = 0; i < newGrn.materials.length; i++) {
      const item = newGrn.materials[i]
      const itemNum = i + 1
      const pQty = Number(item.packageQty) || 0
      const lQty = Number(item.looseQty) || 0
      if (pQty <= 0 && lQty <= 0) {
        triggerToast(`Please specify either Full Cartons or Loose Quantity for Item #${itemNum}!`)
        return
      }
      if (!item.mfgDate) {
        triggerToast(`Manufacturing Date is required for Item #${itemNum} (${item.productName || 'Consignment'})!`)
        return
      }
      if (!item.expiryDate) {
        triggerToast(`Expiry Date is required for Item #${itemNum} (${item.productName || 'Consignment'})!`)
        return
      }
      if (new Date(item.expiryDate) < new Date(item.mfgDate)) {
        triggerToast(`Expiry Date cannot be earlier than Manufacturing Date for Item #${itemNum}!`)
        return
      }
    }

    setIsSubmitting(true)

    const materialsPayload = newGrn.materials.map((m, idx) => {
      const prod = products.find((p) => p._id === m.productId || p.sku === m.sku)
      const qtyNum = Math.max(0, Number(m.packageQty) || 0)
      const looseNum = Math.max(0, Number(m.looseQty) || 0)
      const packRatio = prod?.conversionRatio || prod?.packSize || m.packSize || 1
      const totalBase = (qtyNum * packRatio) + looseNum
      const maxU = prod?.maxUnit || prod?.outerPackaging || m.packagingUnit || 'Carton'
      const minU = prod?.minUnit || prod?.baseUnit || m.baseUnit || 'Packet'

      return {
        productId: prod?._id || (m.productId ? m.productId : null),
        productName: prod?.name || m.productName || 'General Consignment Material',
        sku: prod?.sku || m.sku || `SKU-${idx + 1}`,
        packageQty: qtyNum,
        looseQty: looseNum,
        packagingUnit: maxU,
        maxUnit: maxU,
        minUnit: minU,
        packSize: packRatio,
        conversionRatio: packRatio,
        totalBaseQty: totalBase,
        baseUnit: minU,
        breakdownSummary: `${qtyNum} ${maxU}${looseNum > 0 ? ` + ${looseNum} Loose ${minU}` : ''} (= ${totalBase} ${minU})`,
        batchNo: m.batchNo?.trim() || `BTH-${Date.now().toString().slice(-4)}${idx + 1}`,
        mfgDate: m.mfgDate || '',
        expiryDate: m.expiryDate || '',
        remarks: m.remarks || '',
        location: '',
        putAwayStatus: 'Pending',
      }
    })

    const totalPackages = materialsPayload.reduce((acc, curr) => acc + curr.packageQty, 0)
    const totalLoose = materialsPayload.reduce((acc, curr) => acc + (curr.looseQty || 0), 0)
    const totalQtyStr = `${totalPackages} Cartons${totalLoose > 0 ? ` + ${totalLoose} Loose` : ''} (${materialsPayload.length} Product Lines)`

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

      if (newGrn.gateEntryId) {
        apiRequest(`/gate-entry/${newGrn.gateEntryId}/status`, {
          method: 'PATCH',
          body: JSON.stringify({ status: 'GRN In Process' }),
        }).catch(() => {})
      }

      setGrnList((prev) => [created, ...prev])
      setSelectedGrn(created)
      setShowAddModal(false)
      setGrnSuccessModal(created)
      triggerToast(`GRN ${created.grnNo} registered! Material is ready in Pending Put-in.`)
      setNewGrn(initialNewGrn)
    } catch (err) {
      triggerToast(err.message || 'Failed to create GRN', 'error')
    } finally {
      setIsSubmitting(false)
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
    if (!window.confirm(`Are you sure you want to delete GRN ${grnNo}? This will remove all associated inward lots.`)) return
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
      'Assigned Shed',
      'Total Quantity',
      'Put-in Status',
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
      `"${(g.materials || []).every((m) => m.putAwayStatus === 'Completed' || m.location) ? 'All Shelved' : 'Pending Put-in'}"`,
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

  // Computed live cell code for Put-in modal
  const computedCellCode = useMemo(() => {
    const sClean = putInShade ? putInShade.split(' ')[0].replace(/[^A-Za-z0-9-]/g, '') : 'SH-01'
    const rkClean = putInRack || 'RK-01'
    const rClean = putInRow || 'R1'
    const cClean = putInCol || 'C1'
    return `${sClean}-${rkClean}-${rClean}-${cClean}`
  }, [putInShade, putInRack, putInRow, putInCol])

  const isCurrentCellOccupied = useMemo(() => {
    return occupiedLocationCodes.has(computedCellCode)
  }, [computedCellCode, occupiedLocationCodes])

  // Open Put-in Modal with auto-allocation
  const handleOpenPutInModal = (lot) => {
    setActivePutInLot(lot)
    const initialShade = lot.grnShade ? lot.grnShade.split(' ')[0] : 'SH-01'
    setPutInShade(initialShade)

    const freeBin = findNextAvailableBin(initialShade)
    if (freeBin.found) {
      setPutInRack(freeBin.rackNumber || 'RK-01')
      setPutInRow(freeBin.row || 'R1')
      setPutInCol(freeBin.col || 'C1')
    } else {
      setPutInRack('RK-01')
      setPutInRow('R1')
      setPutInCol('C1')
    }
    setPutInDeck('Lower Deck')
    setPutInRemarks(`Checked in from dock staging. Inwarded via GRN ${lot.grnNo}`)
    setShowPutInModal(true)
  }

  // Auto-find free bin in modal
  const handleAutoFindBin = () => {
    const freeBin = findNextAvailableBin(putInShade)
    if (freeBin.found) {
      setPutInRack(freeBin.rackNumber || 'RK-01')
      setPutInRow(freeBin.row || 'R1')
      setPutInCol(freeBin.col || 'C1')
      triggerToast(`✨ Auto-assigned empty bin: ${freeBin.code}`)
    } else {
      triggerToast(`⚠️ Shed ${putInShade} is completely full! Please select another shed.`, 'error')
    }
  }

  // Save Put-in & Generate Check-in Slip
  const handleSavePutIn = async (e) => {
    e.preventDefault()
    if (!activePutInLot) return
    if (isSavingPutIn) return

    // Food safety check
    if (isFoodItem(activePutInLot.productName) && isChemicalZone(putInShade)) {
      const confirmHazard = window.confirm(
        `⚠️ FOOD SAFETY WARNING:\n\nYou are attempting to place "${activePutInLot.productName}" into a Chemical / Hazardous Shed (${putInShade}).\n\nAre you sure you want to proceed with this allocation?`
      )
      if (!confirmHazard) return
    }

    setIsSavingPutIn(true)
    const allocatedLocation = `${computedCellCode}${putInDeck === 'Upper Deck' ? '-Upper' : '-Lower'}`

    try {
      // 1. Allocate in backend GRN collection
      await apiRequest('/grn/allocate-item', {
        method: 'POST',
        body: JSON.stringify({
          grnNo: activePutInLot.grnNo,
          batchNo: activePutInLot.batchNo,
          sku: activePutInLot.sku,
          cellCode: allocatedLocation,
          shade: putInShade,
          row: putInRow,
          col: putInCol,
          productName: activePutInLot.productName,
          quantity: activePutInLot.totalBaseQty,
        }),
      })

      // 2. Allocate in backend Rack collection
      await apiRequest('/rack/allocate-cell', {
        method: 'POST',
        body: JSON.stringify({
          cellCode: allocatedLocation,
          productName: activePutInLot.productName,
          batchNo: activePutInLot.batchNo,
          quantity: activePutInLot.totalBaseQty,
          uom: activePutInLot.baseUnit,
        }),
      }).catch(() => {})

      // 3. Update local state
      setGrnList((prev) =>
        prev.map((g) => {
          if (g.grnNo !== activePutInLot.grnNo) return g
          const updatedMaterials = (g.materials || []).map((m) => {
            const isMatch =
              (m.batchNo && m.batchNo === activePutInLot.batchNo) ||
              (m.sku && m.sku === activePutInLot.sku) ||
              (m.productName && m.productName === activePutInLot.productName)
            if (isMatch) {
              return {
                ...m,
                location: allocatedLocation,
                putAwayStatus: 'Completed',
                putAwayAt: new Date().toISOString(),
              }
            }
            return m
          })
          return { ...g, materials: updatedMaterials }
        })
      )

      // 4. Update local racksList
      setRacksList((prev) =>
        prev.map((rack) => {
          if (!rack.cells || !Array.isArray(rack.cells)) return rack
          const cells = rack.cells.map((cell) => {
            if (cell.code === computedCellCode || cell.code === allocatedLocation) {
              return {
                ...cell,
                status: 'Occupied',
                productName: activePutInLot.productName,
                batchNo: activePutInLot.batchNo,
                currentStock: activePutInLot.totalBaseQty,
              }
            }
            return cell
          })
          return { ...rack, cells }
        })
      )

      // 5. Prepare Slip Data
      const slipData = {
        grnNo: activePutInLot.grnNo,
        poNo: activePutInLot.poNo,
        supplier: activePutInLot.supplier,
        vehicleNo: activePutInLot.vehicleNo,
        productName: activePutInLot.productName,
        sku: activePutInLot.sku,
        batchNo: activePutInLot.batchNo,
        packageQty: activePutInLot.packageQty,
        looseQty: activePutInLot.looseQty || 0,
        packagingUnit: activePutInLot.packagingUnit,
        packSize: activePutInLot.packSize,
        totalBaseQty: activePutInLot.totalBaseQty,
        baseUnit: activePutInLot.baseUnit,
        mfgDate: activePutInLot.mfgDate,
        expiryDate: activePutInLot.expiryDate,
        locationCode: allocatedLocation,
        shadeName: putInShade,
        rackNumber: putInRack || 'RK-01',
        row: putInRow,
        col: putInCol,
        deck: putInDeck,
        checkInTime: new Date().toLocaleString('en-IN', {
          day: '2-digit',
          month: 'short',
          year: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
        }),
        remarks: putInRemarks,
      }

      // 6. Generate QR for Slip
      const qrPayload = JSON.stringify({
        type: 'WMS_PUT_IN_SLIP',
        grn: slipData.grnNo,
        prod: slipData.productName,
        sku: slipData.sku,
        batch: slipData.batchNo,
        loc: slipData.locationCode,
        qty: `${slipData.totalBaseQty} ${slipData.baseUnit}`,
        time: slipData.checkInTime,
      })
      const qrUrl = await QRCode.toDataURL(qrPayload, { width: 180, margin: 1 }).catch(() => '')
      setPutInSlipQrUrl(qrUrl)
      setPutInSlipData(slipData)

      triggerToast(`✅ Put-in Completed! Material is safely stored in ${allocatedLocation}.`)
      setShowPutInModal(false)
      setShowPutInSlipModal(true)
    } catch (err) {
      triggerToast(err.message || 'Failed to complete Put-in', 'error')
    } finally {
      setIsSavingPutIn(false)
    }
  }

  // View Put-in Slip for already completed items
  const handleViewPutInSlip = async (lot) => {
    const slipData = {
      grnNo: lot.grnNo,
      poNo: lot.poNo,
      supplier: lot.supplier,
      vehicleNo: lot.vehicleNo,
      productName: lot.productName,
      sku: lot.sku,
      batchNo: lot.batchNo,
      packageQty: lot.packageQty,
      looseQty: lot.looseQty || 0,
      packagingUnit: lot.packagingUnit,
      packSize: lot.packSize,
      totalBaseQty: lot.totalBaseQty,
      baseUnit: lot.baseUnit,
      mfgDate: lot.mfgDate,
      expiryDate: lot.expiryDate,
      locationCode: lot.location || 'Central Yard',
      shadeName: lot.grnShade || 'Shed 1',
      rackNumber: lot.location?.split('-')[1] || 'RK-01',
      row: lot.location?.match(/R\d+/)?.[0] || 'R1',
      col: lot.location?.match(/C\d+/)?.[0] || 'C1',
      deck: lot.location?.includes('Upper') ? 'Upper Deck' : 'Lower Deck',
      checkInTime: lot.putAwayAt
        ? new Date(lot.putAwayAt).toLocaleString('en-IN', {
            day: '2-digit',
            month: 'short',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
          })
        : new Date(lot.grnDate || Date.now()).toLocaleString('en-IN', {
            day: '2-digit',
            month: 'short',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
          }),
      remarks: 'Material stored and verified in warehouse rack cell.',
    }
    const qrPayload = JSON.stringify({
      type: 'WMS_PUT_IN_SLIP',
      grn: slipData.grnNo,
      prod: slipData.productName,
      sku: slipData.sku,
      batch: slipData.batchNo,
      loc: slipData.locationCode,
      qty: `${slipData.totalBaseQty} ${slipData.baseUnit}`,
      time: slipData.checkInTime,
    })
    const qrUrl = await QRCode.toDataURL(qrPayload, { width: 180, margin: 1 }).catch(() => '')
    setPutInSlipQrUrl(qrUrl)
    setPutInSlipData(slipData)
    setShowPutInSlipModal(true)
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

  const pendingLotsCount = allInwardLots.filter((l) => l.putAwayStatus === 'Pending').length
  const completedLotsCount = allInwardLots.filter((l) => l.putAwayStatus === 'Completed').length

  return (
    <div className="space-y-6 max-w-[1720px] mx-auto pb-10 select-none">
      {/* Toast Alert */}
      {toastMessage && (
        <div className="fixed top-5 right-5 z-[9999] bg-slate-900 text-white px-4 py-3 rounded-xl shadow-2xl border border-slate-700 flex items-center gap-3 animate-fade-in text-sm font-semibold pointer-events-auto">
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
                ● Unified GRN &amp; Put-in Terminal
              </span>
            </div>
            <h1 className="text-lg sm:text-xl lg:text-2xl font-bold text-slate-900 leading-tight">
              Goods Receiving Note (GRN) &amp; Put-in Check-in Hub
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 font-medium mt-1 leading-relaxed">
              Complete inward workflow from material arrival (GRN) to rack storage (Put-in). Instant location allocation and single check-in slip.
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
        <div
          onClick={() => {
            setWorkflowTab('ALL_GRN')
            setSearchParams({ tab: 'all_grn' })
          }}
          className={`bg-white rounded-2xl p-4.5 border transition cursor-pointer shadow-sm flex items-center justify-between ${
            workflowTab === 'ALL_GRN' ? 'border-indigo-500 ring-2 ring-indigo-500/10' : 'border-slate-200 hover:border-slate-300'
          }`}
        >
          <div>
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Total Inward GRNs</p>
            <p className="text-2xl font-extrabold text-slate-900 mt-1">{grnList.length}</p>
            <p className="text-xs text-slate-500 font-medium mt-0.5">{allInwardLots.length} Total Material Lots</p>
          </div>
          <div className="w-11 h-11 rounded-xl bg-indigo-50 border border-indigo-100 text-indigo-600 flex items-center justify-center shrink-0">
            <Package className="w-5 h-5" />
          </div>
        </div>

        {/* Pending Put-in (Highlight Card) */}
        <div
          onClick={() => {
            setWorkflowTab('PENDING_PUT_IN')
            setSearchParams({ tab: 'pending' })
          }}
          className={`bg-white rounded-2xl p-4.5 border transition cursor-pointer shadow-sm flex items-center justify-between ${
            workflowTab === 'PENDING_PUT_IN' ? 'border-amber-500 ring-2 ring-amber-500/15' : 'border-slate-200 hover:border-slate-300'
          }`}
        >
          <div>
            <div className="flex items-center gap-1.5">
              <p className="text-xs font-bold text-amber-700 uppercase tracking-wider">Pending Put-in</p>
              {pendingLotsCount > 0 && (
                <span className="w-2 h-2 rounded-full bg-amber-500 animate-ping"></span>
              )}
            </div>
            <p className="text-2xl font-extrabold text-amber-600 mt-1">
              {pendingLotsCount}
            </p>
            <p className="text-xs text-amber-700 font-semibold mt-0.5">Rack Allocation Pending</p>
          </div>
          <div className="w-11 h-11 rounded-xl bg-amber-50 border border-amber-200 text-amber-600 flex items-center justify-center shrink-0">
            <Clock className="w-5 h-5" />
          </div>
        </div>

        {/* Completed Put-in */}
        <div
          onClick={() => {
            setWorkflowTab('COMPLETED_PUT_IN')
            setSearchParams({ tab: 'completed' })
          }}
          className={`bg-white rounded-2xl p-4.5 border transition cursor-pointer shadow-sm flex items-center justify-between ${
            workflowTab === 'COMPLETED_PUT_IN' ? 'border-emerald-500 ring-2 ring-emerald-500/15' : 'border-slate-200 hover:border-slate-300'
          }`}
        >
          <div>
            <p className="text-xs font-bold text-emerald-700 uppercase tracking-wider">Completed Put-in</p>
            <p className="text-2xl font-extrabold text-emerald-600 mt-1">
              {completedLotsCount}
            </p>
            <p className="text-xs text-emerald-700 font-semibold mt-0.5">Shelved Inside Racks</p>
          </div>
          <div className="w-11 h-11 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-600 flex items-center justify-center shrink-0">
            <CheckCircle2 className="w-5 h-5" />
          </div>
        </div>

        {/* QC Tested */}
        <div className="bg-white rounded-2xl p-4.5 border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Under QC / Verified</p>
            <p className="text-2xl font-extrabold text-blue-600 mt-1">
              {grnList.filter((g) => g.status === 'Completed').length}
            </p>
            <p className="text-xs text-blue-600 font-semibold mt-0.5">QC Cleared Receipts</p>
          </div>
          <div className="w-11 h-11 rounded-xl bg-blue-50 border border-blue-100 text-blue-600 flex items-center justify-center shrink-0">
            <Layers className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* 3. Primary Unified Workflow Navigation Tabs */}
      <div className="bg-white p-2.5 sm:p-3 rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div className="flex items-center gap-2 p-1 bg-slate-100 rounded-xl overflow-x-auto text-xs font-semibold">
          {/* Tab 1: Pending Put-in */}
          <button
            type="button"
            onClick={() => {
              setWorkflowTab('PENDING_PUT_IN')
              setSearchParams({ tab: 'pending' })
            }}
            className={`px-4 py-2.5 rounded-xl font-bold flex items-center gap-2 transition cursor-pointer whitespace-nowrap ${
              workflowTab === 'PENDING_PUT_IN'
                ? 'bg-amber-500 text-white shadow-xs font-extrabold'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/70'
            }`}
          >
            <Clock className="w-4 h-4 shrink-0" />
            <span>Pending Put-in</span>
            <span
              className={`px-2 py-0.5 rounded-full text-xs font-mono font-bold ${
                workflowTab === 'PENDING_PUT_IN'
                  ? 'bg-amber-600/70 text-white'
                  : 'bg-amber-100 text-amber-800'
              }`}
            >
              {pendingLotsCount}
            </span>
          </button>

          {/* Tab 2: Completed Put-in */}
          <button
            type="button"
            onClick={() => {
              setWorkflowTab('COMPLETED_PUT_IN')
              setSearchParams({ tab: 'completed' })
            }}
            className={`px-4 py-2.5 rounded-xl font-bold flex items-center gap-2 transition cursor-pointer whitespace-nowrap ${
              workflowTab === 'COMPLETED_PUT_IN'
                ? 'bg-emerald-600 text-white shadow-xs font-extrabold'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/70'
            }`}
          >
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>Completed Put-in</span>
            <span
              className={`px-2 py-0.5 rounded-full text-xs font-mono font-bold ${
                workflowTab === 'COMPLETED_PUT_IN'
                  ? 'bg-emerald-700/70 text-white'
                  : 'bg-emerald-100 text-emerald-800'
              }`}
            >
              {completedLotsCount}
            </span>
          </button>

          {/* Tab 3: All GRN Receipts */}
          <button
            type="button"
            onClick={() => {
              setWorkflowTab('ALL_GRN')
              setSearchParams({ tab: 'all_grn' })
            }}
            className={`px-4 py-2.5 rounded-xl font-bold flex items-center gap-2 transition cursor-pointer whitespace-nowrap ${
              workflowTab === 'ALL_GRN'
                ? 'bg-indigo-600 text-white shadow-xs font-extrabold'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/70'
            }`}
          >
            <Package className="w-4 h-4 shrink-0" />
            <span>All GRN Receipts</span>
            <span
              className={`px-2 py-0.5 rounded-full text-xs font-mono font-bold ${
                workflowTab === 'ALL_GRN'
                  ? 'bg-indigo-700/70 text-white'
                  : 'bg-slate-200 text-slate-800'
              }`}
            >
              {grnList.length}
            </span>
          </button>
        </div>

        {/* Live Search */}
        <div className="relative flex-1 md:max-w-xs">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3 pointer-events-none" />
          <input
            type="text"
            placeholder={
              workflowTab === 'ALL_GRN'
                ? 'Search GRN, PO, supplier, vehicle...'
                : 'Search product, SKU, batch, location...'
            }
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-50 border border-slate-300 rounded-xl pl-9 pr-3 py-2 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 focus:bg-white"
          />
        </div>
      </div>

      {/* 4. Operational Inward Filters (Date, Product, Vendor, Shed) */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-sm space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <Filter className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-xs font-bold text-slate-800">Operational Inward Filters</h3>
              <p className="text-[11px] text-slate-500">Filter entries by date, item, vendor, or warehouse shed.</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs bg-indigo-50 text-indigo-700 font-bold px-3 py-1 rounded-full border border-indigo-200/60">
              {filteredInwardStats.count} {workflowTab === 'ALL_GRN' ? 'GRN Receipts' : 'Material Lots'} Found
            </span>
            {(searchQuery || filterDate !== 'ALL' || filterProduct !== 'ALL' || filterSupplier !== 'ALL' || filterShed !== 'ALL' || filterCustomDate) && (
              <button
                type="button"
                onClick={() => {
                  setFilterDate('ALL')
                  setFilterCustomDate('')
                  setFilterProduct('ALL')
                  setFilterSupplier('ALL')
                  setFilterShed('ALL')
                  setSearchQuery('')
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

        {/* 4 Filter Dropdowns */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs pt-1">
          {/* 1. Date Filter */}
          <div>
            <label className="block text-[11px] font-bold text-slate-700 mb-1 flex items-center gap-1">
              <Calendar className="w-3 h-3 text-indigo-600" />
              <span>Inward Date</span>
            </label>
            <CustomSelect
              value={filterDate}
              onChange={(val) => setFilterDate(val)}
              options={DATE_PRESET_OPTIONS}
              placeholder="All Dates"
              zIndexClass="z-30"
            />
            {filterDate === 'CUSTOM' && (
              <input
                type="date"
                value={filterCustomDate}
                onChange={(e) => setFilterCustomDate(e.target.value)}
                className="w-full mt-1.5 bg-white border border-indigo-300 rounded-xl px-2.5 py-1 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
              />
            )}
          </div>

          {/* 2. Product Filter */}
          <div>
            <label className="block text-[11px] font-bold text-slate-700 mb-1 flex items-center gap-1">
              <Package className="w-3 h-3 text-indigo-600" />
              <span>Product Item</span>
            </label>
            <CustomSelect
              value={filterProduct}
              onChange={(val) => setFilterProduct(val)}
              options={productFilterOptions}
              placeholder="All Products"
              zIndexClass="z-30"
            />
          </div>

          {/* 3. Supplier Filter */}
          <div>
            <label className="block text-[11px] font-bold text-slate-700 mb-1 flex items-center gap-1">
              <Truck className="w-3 h-3 text-indigo-600" />
              <span>Supplier / Vendor</span>
            </label>
            <CustomSelect
              value={filterSupplier}
              onChange={(val) => setFilterSupplier(val)}
              options={supplierFilterOptions}
              placeholder="All Suppliers"
              zIndexClass="z-20"
            />
          </div>

          {/* 4. Shed Filter */}
          <div>
            <label className="block text-[11px] font-bold text-slate-700 mb-1 flex items-center gap-1">
              <Building2 className="w-3 h-3 text-indigo-600" />
              <span>Warehouse Shed</span>
            </label>
            <CustomSelect
              value={filterShed}
              onChange={(val) => setFilterShed(val)}
              options={shedFilterOptions}
              placeholder="All Sheds"
              zIndexClass="z-20"
            />
          </div>
        </div>

        {/* Active Filter & Summary Banner */}
        {(filterProduct !== 'ALL' || filterDate !== 'ALL' || filterSupplier !== 'ALL' || filterShed !== 'ALL' || searchQuery) && (
          <div className="p-3 bg-indigo-50/80 rounded-xl border border-indigo-200/80 flex flex-col sm:flex-row sm:items-center justify-between text-xs gap-2 animate-fade-in shadow-2xs mt-2">
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
              {filterSupplier !== 'ALL' && (
                <span className="bg-white text-indigo-700 font-bold px-2 py-0.5 rounded-md border border-indigo-200 shadow-2xs">
                  Vendor: {filterSupplier}
                </span>
              )}
              {filterShed !== 'ALL' && (
                <span className="bg-white text-indigo-700 font-bold px-2 py-0.5 rounded-md border border-indigo-200 shadow-2xs">
                  Shed: {filterShed}
                </span>
              )}
            </div>

            <div className="flex items-center gap-2 font-mono shrink-0">
              <span className="text-slate-600 font-sans font-medium">
                {filterProduct !== 'ALL' ? `Total Inward "${filterProduct}":` : 'Total Inward Volume:'}
              </span>
              <strong className="text-emerald-800 font-bold bg-white px-2.5 py-1 rounded-lg border border-emerald-300 shadow-2xs">
                {filteredInwardStats.totalQty.toLocaleString()} {filteredInwardStats.unitLabel} ({filteredInwardStats.totalPackages} Packs across {filteredInwardStats.count} entries)
              </strong>
            </div>
          </div>
        )}
      </div>

      {/* ========================================================================= */}
      {/* SECTION 5A: PENDING PUT-IN TABLE (Awaiting Rack Allocation)               */}
      {/* ========================================================================= */}
      {workflowTab === 'PENDING_PUT_IN' && (
        <div className="bg-white rounded-2xl p-4 sm:p-6 border border-slate-200 shadow-sm space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
            <div>
              <h3 className="text-sm sm:text-base font-bold text-slate-900 flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span>
                <span>Pending Put-in Queue</span>
                <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-amber-50 text-amber-800 border border-amber-200">
                  {filteredLots.length} Lots Awaiting Racking
                </span>
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                These goods have been received at the warehouse (GRN generated) but are awaiting rack/bin assignment. Click &quot;Put-in&quot; to allocate location.
              </p>
            </div>
          </div>

          <div className="overflow-x-auto rounded-xl border border-slate-200">
            <table className="w-full text-left text-sm min-w-[1150px]">
              <thead>
                <tr className="bg-slate-50/80 border-b border-slate-200 text-slate-600 text-xs uppercase tracking-wider font-bold">
                  <th className="py-3.5 px-3 w-10 text-center">#</th>
                  <th className="py-3.5 px-4 w-32">GRN Number</th>
                  <th className="py-3.5 px-4 min-w-[180px]">Product / Material</th>
                  <th className="py-3.5 px-4 w-36">Batch &amp; ESL</th>
                  <th className="py-3.5 px-4 w-40">Inward Packaging</th>
                  <th className="py-3.5 px-4 w-36">Total Base Stock</th>
                  <th className="py-3.5 px-4 min-w-[150px]">Receiving Shed</th>
                  <th className="py-3.5 px-4 min-w-[160px]">Supplier &amp; Vehicle</th>
                  <th className="py-3.5 px-5 text-right w-44">Put-in Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 bg-white">
                {loading ? (
                  <tr>
                    <td colSpan="9" className="py-8">
                      <DataLoader
                        text="Loading Pending Inward Material Lots..."
                        subtext="Checking staging yard dock and GRN inward records..."
                        size="md"
                      />
                    </td>
                  </tr>
                ) : filteredLots.length === 0 ? (
                  <tr>
                    <td colSpan="9" className="py-12 text-center text-slate-400 text-sm">
                      <div className="flex flex-col items-center justify-center gap-2">
                        <CheckCircle2 className="w-8 h-8 text-emerald-500/60" />
                        <p className="font-semibold text-slate-700">No pending items!</p>
                        <p className="text-xs text-slate-400 max-w-sm">
                          All inward goods have been safely checked into racks. View their locations under the &quot;Completed Put-in&quot; tab.
                        </p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  filteredLots.map((item, idx) => (
                    <tr key={item.lotId || idx} className="hover:bg-amber-50/30 transition-colors">
                      <td className="py-3.5 px-3 text-center text-slate-400 font-mono text-xs font-semibold">
                        {idx + 1}
                      </td>
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <span className="font-mono font-bold text-indigo-700 block text-xs">{item.grnNo}</span>
                        <span className="text-[11px] text-slate-500 block">
                          {new Date(item.grnDate || Date.now()).toLocaleDateString('en-IN', {
                            day: '2-digit',
                            month: 'short',
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </span>
                      </td>
                      <td className="py-3.5 px-4">
                        <p className="font-semibold text-slate-900 truncate max-w-[220px]">{item.productName}</p>
                        <span className="text-[10px] text-slate-500 font-mono block">SKU: {item.sku}</span>
                      </td>
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <span className="font-mono font-bold text-slate-800 text-xs block">{item.batchNo}</span>
                        <span className="text-indigo-600 font-bold text-[10px] block">
                          Exp: {formatDisplayDate(item.expiryDate)} ({getEslInfo(item).eslText})
                        </span>
                      </td>
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <span className="font-bold text-slate-900 text-xs">
                          {item.packageQty} {item.packagingUnit || 'Carton'}{Number(item.looseQty) > 0 ? ` + ${item.looseQty} Loose` : ''}
                        </span>
                        <span className="text-[10px] text-slate-500 block">
                          (1 {item.packagingUnit} = {item.packSize} {item.baseUnit})
                        </span>
                      </td>
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <span className="px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-800 font-mono font-bold text-xs border border-emerald-200">
                          {item.totalBaseQty.toLocaleString()} {item.baseUnit}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-xs font-semibold text-slate-800">
                        <span className="truncate max-w-[150px] block">{item.grnShade}</span>
                        <span className="text-[10px] text-amber-700 bg-amber-50 px-1.5 py-0.2 rounded border border-amber-200 font-bold inline-block mt-0.5">
                          Dock Staging
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-xs">
                        <p className="font-semibold text-slate-800 truncate max-w-[160px]">{item.supplier}</p>
                        <span className="font-mono font-bold text-slate-600 text-[10px]">{item.vehicleNo}</span>
                      </td>
                      <td className="py-3.5 px-5 text-right whitespace-nowrap">
                        <button
                          type="button"
                          onClick={() => handleOpenPutInModal(item)}
                          className="px-3.5 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 active:bg-amber-700 text-white font-bold text-xs shadow-xs transition flex items-center gap-1.5 ml-auto cursor-pointer"
                        >
                          <Truck className="w-3.5 h-3.5" />
                          <span>Put-in (Allocate Rack)</span>
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

      {/* ========================================================================= */}
      {/* SECTION 5B: COMPLETED PUT-IN TABLE (Material Stored in Racks)             */}
      {/* ========================================================================= */}
      {workflowTab === 'COMPLETED_PUT_IN' && (
        <div className="bg-white rounded-2xl p-4 sm:p-6 border border-slate-200 shadow-sm space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
            <div>
              <h3 className="text-sm sm:text-base font-bold text-slate-900 flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
                <span>Completed Put-in Archive</span>
                <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200">
                  {filteredLots.length} Shelved Lots
                </span>
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                These goods have been successfully allocated to racks and bins. No risk of duplicate entry. You can reprint check-in slips anytime.
              </p>
            </div>
          </div>

          <div className="overflow-x-auto rounded-xl border border-slate-200">
            <table className="w-full text-left text-sm min-w-[1150px]">
              <thead>
                <tr className="bg-slate-50/80 border-b border-slate-200 text-slate-600 text-xs uppercase tracking-wider font-bold">
                  <th className="py-3.5 px-3 w-10 text-center">#</th>
                  <th className="py-3.5 px-4 w-32">GRN Number</th>
                  <th className="py-3.5 px-4 min-w-[180px]">Product / Material</th>
                  <th className="py-3.5 px-4 w-32">Batch No</th>
                  <th className="py-3.5 px-4 min-w-[180px]">Assigned Rack Location</th>
                  <th className="py-3.5 px-4 w-36">Quantity Stored</th>
                  <th className="py-3.5 px-4 w-40">Put-in Time</th>
                  <th className="py-3.5 px-4 min-w-[140px]">Supplier</th>
                  <th className="py-3.5 px-5 text-right w-44">Check-in Slip</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 bg-white">
                {loading ? (
                  <tr>
                    <td colSpan="9" className="py-8">
                      <DataLoader
                        text="Loading Shelved Material Inventory..."
                        subtext="Retrieving warehouse rack cell allocations..."
                        size="md"
                      />
                    </td>
                  </tr>
                ) : filteredLots.length === 0 ? (
                  <tr>
                    <td colSpan="9" className="py-12 text-center text-slate-400 text-sm">
                      No completed put-ins recorded yet or no records match the selected filter.
                    </td>
                  </tr>
                ) : (
                  filteredLots.map((item, idx) => (
                    <tr key={item.lotId || idx} className="hover:bg-emerald-50/30 transition-colors">
                      <td className="py-3.5 px-3 text-center text-slate-400 font-mono text-xs font-semibold">
                        {idx + 1}
                      </td>
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <span className="font-mono font-bold text-indigo-700 block text-xs">{item.grnNo}</span>
                        <span className="text-[10px] text-slate-500 font-mono">PO: {item.poNo}</span>
                      </td>
                      <td className="py-3.5 px-4">
                        <p className="font-semibold text-slate-900 truncate max-w-[220px]">{item.productName}</p>
                        <span className="text-[10px] text-slate-500 font-mono block">SKU: {item.sku}</span>
                      </td>
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <span className="font-mono font-bold text-slate-800 text-xs block">{item.batchNo}</span>
                        <span className="text-emerald-700 font-bold text-[10px] block">
                          Exp: {formatDisplayDate(item.expiryDate)}
                        </span>
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-emerald-50 border border-emerald-300 text-emerald-800 font-mono font-bold text-xs shadow-2xs">
                          <MapPin className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                          <span>{item.location}</span>
                        </div>
                        <span className="text-[10px] text-slate-500 block mt-0.5 truncate max-w-[180px]">
                          {item.grnShade}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <span className="font-bold text-slate-900 text-xs block">
                          {item.packageQty} {item.packagingUnit || 'Carton'}{Number(item.looseQty) > 0 ? ` + ${item.looseQty} Loose` : ''}
                        </span>
                        <span className="text-[10px] font-mono text-emerald-700 font-bold">
                          {item.totalBaseQty} {item.baseUnit}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-xs text-slate-600 whitespace-nowrap">
                        {item.putAwayAt
                          ? new Date(item.putAwayAt).toLocaleString('en-IN', {
                              day: '2-digit',
                              month: 'short',
                              year: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit',
                            })
                          : new Date(item.grnDate || Date.now()).toLocaleString('en-IN', {
                              day: '2-digit',
                              month: 'short',
                              year: 'numeric',
                            })}
                      </td>
                      <td className="py-3.5 px-4 text-xs">
                        <p className="font-semibold text-slate-800 truncate max-w-[140px]">{item.supplier}</p>
                      </td>
                      <td className="py-3.5 px-5 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            type="button"
                            onClick={() => handleViewPutInSlip(item)}
                            className="px-3 py-1.5 rounded-xl bg-indigo-50 hover:bg-indigo-600 text-indigo-700 hover:text-white border border-indigo-200 hover:border-indigo-600 text-xs font-bold transition cursor-pointer shadow-2xs flex items-center gap-1.5"
                            title="View & Print Put-in Slip"
                          >
                            <Printer className="w-3.5 h-3.5" />
                            <span>Slip</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => handleOpenPutInModal(item)}
                            className="px-2 py-1.5 rounded-xl bg-slate-50 hover:bg-slate-200 text-slate-600 border border-slate-200 text-xs font-semibold transition cursor-pointer"
                            title="Relocate to another rack/cell"
                          >
                            <RotateCcw className="w-3 h-3" />
                            <span>Relocate</span>
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

      {/* ========================================================================= */}
      {/* SECTION 5C: ALL GRN RECEIPTS MASTER (All GRN Inward Register)              */}
      {/* ========================================================================= */}
      {workflowTab === 'ALL_GRN' && (
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

            <div className="flex items-center gap-1 overflow-x-auto p-1 bg-slate-100 rounded-xl text-xs font-semibold">
              <button
                type="button"
                onClick={() => setActiveTab('all')}
                className={`px-3 py-1 rounded-lg transition whitespace-nowrap cursor-pointer ${
                  activeTab === 'all'
                    ? 'bg-indigo-600 text-white font-bold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                All ({grnList.length})
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('completed')}
                className={`px-3 py-1 rounded-lg transition whitespace-nowrap cursor-pointer ${
                  activeTab === 'completed'
                    ? 'bg-indigo-600 text-white font-bold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Completed ({grnList.filter((g) => g.status === 'Completed').length})
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('in_process')}
                className={`px-3 py-1 rounded-lg transition whitespace-nowrap cursor-pointer ${
                  activeTab === 'in_process'
                    ? 'bg-indigo-600 text-white font-bold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                In Process ({grnList.filter((g) => g.status === 'In Process').length})
              </button>
            </div>
          </div>

          <div className="overflow-x-auto rounded-xl border border-slate-200">
            <table className="w-full text-left text-sm min-w-[1150px]">
              <thead>
                <tr className="bg-slate-50/80 border-b border-slate-200 text-slate-600 text-xs uppercase tracking-wider font-bold">
                  <th className="py-3.5 px-3 w-10 text-center">#</th>
                  <th className="py-3.5 px-4 w-32">GRN Number</th>
                  <th className="py-3.5 px-4 w-40">Date &amp; Time</th>
                  <th className="py-3.5 px-4 min-w-[140px]">PO Reference</th>
                  <th className="py-3.5 px-4 min-w-[180px]">Supplier / Vendor</th>
                  <th className="py-3.5 px-4 min-w-[130px]">Vehicle Reg.</th>
                  <th className="py-3.5 px-4 min-w-[160px]">Assigned Shed</th>
                  <th className="py-3.5 px-4 w-40">Put-in Status</th>
                  <th className="py-3.5 px-4 text-center w-28">Status</th>
                  <th className="py-3.5 px-5 text-right w-44">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 bg-white">
                {loading ? (
                  <tr>
                    <td colSpan="10" className="py-8">
                      <DataLoader
                        text="Loading Goods Receiving (GRN) Records..."
                        subtext="Syncing received materials and batch lot numbers..."
                        size="md"
                      />
                    </td>
                  </tr>
                ) : filteredGrn.length === 0 ? (
                  <tr>
                    <td colSpan="10" className="py-10 text-center text-slate-400 text-sm">
                      No GRN receipts match the selected filter or search criteria.
                    </td>
                  </tr>
                ) : (
                  filteredGrn.map((grn, idx) => {
                    const allShelved =
                      grn.materials &&
                      grn.materials.length > 0 &&
                      grn.materials.every((m) => m.putAwayStatus === 'Completed' || (m.location && m.location.trim().length > 0))
                    const pendingCountInGrn = (grn.materials || []).filter(
                      (m) => m.putAwayStatus !== 'Completed' && (!m.location || m.location.trim().length === 0)
                    ).length

                    return (
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
                          <p className="font-semibold text-slate-900 truncate max-w-[180px]">{grn.supplier}</p>
                        </td>
                        <td className="py-3.5 px-4">
                          <span className="font-mono font-bold text-slate-900 bg-slate-100 px-2 py-0.5 rounded-md border border-slate-200 text-xs whitespace-nowrap shadow-2xs">
                            {grn.vehicleNo}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 text-xs font-semibold text-slate-800 whitespace-nowrap">
                          {grn.shade}
                        </td>
                        <td className="py-3.5 px-4 whitespace-nowrap">
                          {allShelved ? (
                            <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                              <CheckCircle2 className="w-3 h-3" /> All Shelved
                            </span>
                          ) : (
                            <button
                              type="button"
                              onClick={() => {
                                setWorkflowTab('PENDING_PUT_IN')
                                setSearchQuery(grn.grnNo)
                              }}
                              className="inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-full bg-amber-50 text-amber-800 border border-amber-300 hover:bg-amber-100 transition cursor-pointer"
                            >
                              <Clock className="w-3 h-3 text-amber-600" />
                              <span>{pendingCountInGrn} Pending Put-in</span>
                            </button>
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
                                title="Mark Quality Cleared"
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
                    )
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* 6. PUT-IN & RACK CELL ALLOCATION MODAL (Pop-up)           */}
      {/* ========================================================= */}
      {showPutInModal && activePutInLot && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 animate-fade-in">
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[92dvh] overflow-y-auto p-5 sm:p-6 space-y-4 border border-slate-200 animate-scale-in">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b pb-3 border-slate-100">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-amber-50 border border-amber-200 text-amber-600 flex items-center justify-center font-bold">
                  <Truck className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-extrabold text-slate-900">
                    Put-in &amp; Rack Allocation
                  </h3>
                  <p className="text-xs text-slate-500 font-medium">
                    GRN: <span className="font-mono text-indigo-700 font-bold">{activePutInLot.grnNo}</span> • Lot: <span className="font-mono text-slate-800 font-bold">{activePutInLot.batchNo}</span>
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowPutInModal(false)}
                className="text-slate-400 hover:text-slate-700 p-1.5 rounded-lg hover:bg-slate-100 cursor-pointer transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Consignment Item Details Card */}
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-2 text-xs">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 border-b border-slate-200/60 pb-2">
                <div>
                  <span className="text-[10px] text-slate-500 uppercase font-bold tracking-wider">Product Name &amp; SKU:</span>
                  <p className="font-bold text-slate-900 text-sm">{activePutInLot.productName}</p>
                  <p className="text-[11px] font-mono text-slate-600">SKU: {activePutInLot.sku}</p>
                </div>
                <div className="sm:text-right">
                  <span className="text-[10px] text-slate-500 uppercase font-bold tracking-wider">Inward Batch &amp; Expiry:</span>
                  <p className="font-mono font-bold text-slate-900">{activePutInLot.batchNo}</p>
                  <p className="text-[11px] text-indigo-700 font-bold">
                    Exp: {formatDisplayDate(activePutInLot.expiryDate)} ({getEslInfo(activePutInLot).eslText})
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 pt-1 font-medium">
                <div>
                  <span className="text-slate-500 block text-[10px]">Inward Bulk Packaging:</span>
                  <strong className="text-slate-900">
                    {activePutInLot.packageQty} {activePutInLot.packagingUnit || 'Carton'}{Number(activePutInLot.looseQty) > 0 ? ` + ${activePutInLot.looseQty} Loose` : ''}
                  </strong>
                </div>
                <div>
                  <span className="text-slate-500 block text-[10px]">Total Base Quantity:</span>
                  <strong className="text-emerald-700">{activePutInLot.totalBaseQty} {activePutInLot.baseUnit}</strong>
                </div>
                <div>
                  <span className="text-slate-500 block text-[10px]">Current Location:</span>
                  <span className="font-bold text-amber-700">Dock Staging Area</span>
                </div>
              </div>
            </div>

            {/* Put-in Form */}
            <form onSubmit={handleSavePutIn} className="space-y-4 text-xs">
              {/* Shed Selector & Smart Auto-Find Button */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                    <Building2 className="w-3.5 h-3.5 text-indigo-600" />
                    <span>Target Warehouse Shed <span className="text-rose-500">*</span></span>
                  </label>
                  <button
                    type="button"
                    onClick={handleAutoFindBin}
                    className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-xs font-bold transition border border-indigo-200 cursor-pointer shadow-2xs"
                  >
                    <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
                    <span>Auto-Suggest Free Bin</span>
                  </button>
                </div>
                <CustomSelect
                  value={putInShade}
                  onChange={(val) => {
                    setPutInShade(val)
                    const free = findNextAvailableBin(val)
                    if (free.found) {
                      setPutInRack(free.rackNumber || 'RK-01')
                      setPutInRow(free.row || 'R1')
                      setPutInCol(free.col || 'C1')
                    }
                  }}
                  options={shedFilterOptions.filter((s) => s.value !== 'ALL')}
                  placeholder="Select Warehouse Shed"
                  zIndexClass="z-30"
                />
              </div>

              {/* Rack & Deck Level Selection */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* Rack Selector (Searchable) */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Rack Number <span className="text-rose-500">*</span>
                  </label>
                  <CustomSelect
                    value={putInRack}
                    onChange={(val) => setPutInRack(val)}
                    options={RACK_OPTIONS}
                    placeholder="Select Rack"
                    zIndexClass="z-20"
                  />
                </div>

                {/* Deck Level (Upper / Lower Deck) */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Shelf Level / Deck <span className="text-rose-500">*</span>
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setPutInDeck('Lower Deck')}
                      className={`py-2 px-3 rounded-xl border text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer ${
                        putInDeck === 'Lower Deck'
                          ? 'bg-indigo-600 text-white border-indigo-600 shadow-xs'
                          : 'bg-slate-50 text-slate-700 border-slate-300 hover:bg-slate-100'
                      }`}
                    >
                      <span>Lower Deck</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setPutInDeck('Upper Deck')}
                      className={`py-2 px-3 rounded-xl border text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer ${
                        putInDeck === 'Upper Deck'
                          ? 'bg-indigo-600 text-white border-indigo-600 shadow-xs'
                          : 'bg-slate-50 text-slate-700 border-slate-300 hover:bg-slate-100'
                      }`}
                    >
                      <span>Upper Deck</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* Row and Column Pickers (Searchable) */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Rack Row <span className="text-rose-500">*</span>
                  </label>
                  <CustomSelect
                    value={putInRow}
                    onChange={(val) => setPutInRow(val)}
                    options={ROW_OPTIONS}
                    placeholder="Select Row"
                    zIndexClass="z-20"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Shelf Column / Slot <span className="text-rose-500">*</span>
                  </label>
                  <CustomSelect
                    value={putInCol}
                    onChange={(val) => setPutInCol(val)}
                    options={COL_OPTIONS}
                    placeholder="Select Column"
                    zIndexClass="z-20"
                  />
                </div>
              </div>

              {/* Live Preview Box of Cell Code */}
              <div className="p-3.5 rounded-xl border border-indigo-200 bg-indigo-50/50 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <span className="text-[10px] text-indigo-900 uppercase font-bold tracking-wider block">
                    Generated Storage Bin Code:
                  </span>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="font-mono font-extrabold text-base text-indigo-950">
                      {computedCellCode}{putInDeck === 'Upper Deck' ? '-Upper' : '-Lower'}
                    </span>
                    <span className="text-xs font-semibold text-indigo-700">
                      ({putInDeck})
                    </span>
                  </div>
                </div>

                <div>
                  {isCurrentCellOccupied ? (
                    <span className="px-2.5 py-1 rounded-md text-xs font-bold bg-amber-100 text-amber-800 border border-amber-300 inline-flex items-center gap-1">
                      <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
                      <span>⚠️ Bin Already In Use</span>
                    </span>
                  ) : (
                    <span className="px-2.5 py-1 rounded-md text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-300 inline-flex items-center gap-1">
                      <Check className="w-3.5 h-3.5 text-emerald-600" />
                      <span>✅ Empty &amp; Available Bin</span>
                    </span>
                  )}
                </div>
              </div>

              {/* Food vs Chemical Warning Alert */}
              {isFoodItem(activePutInLot.productName) && isChemicalZone(putInShade) && (
                <div className="p-3 rounded-xl bg-rose-50 border border-rose-300 text-rose-800 text-xs flex items-start gap-2">
                  <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                  <div>
                    <strong className="block font-bold">CROSS-CONTAMINATION HAZARD ALERT:</strong>
                    You are attempting to store an edible/food product in a Chemical/Hazardous zone ({putInShade}). Please select a designated food storage shed.
                  </div>
                </div>
              )}

              {/* Operator Remarks */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Operator Placement Notes / Pallet Tag
                </label>
                <input
                  type="text"
                  value={putInRemarks}
                  onChange={(e) => setPutInRemarks(e.target.value)}
                  placeholder="e.g. Placed on wooden pallet #4, verified sealed packing"
                  className="w-full bg-white border border-slate-300 rounded-xl px-3.5 py-2 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                />
              </div>

              {/* Action Buttons */}
              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-3">
                <button
                  type="button"
                  disabled={isSavingPutIn}
                  onClick={() => setShowPutInModal(false)}
                  className="px-4 py-2.5 border border-slate-300 rounded-xl text-slate-700 hover:bg-slate-50 font-bold cursor-pointer transition disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSavingPutIn}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white px-5 py-2.5 rounded-xl font-bold shadow-xs transition flex items-center gap-2 cursor-pointer disabled:opacity-60"
                >
                  {isSavingPutIn ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Allocating Rack &amp; Generating Slip...</span>
                    </>
                  ) : (
                    <>
                      <Check className="w-4 h-4" />
                      <span>Save &amp; Generate Put-in Slip</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* 7. HIGH RESOLUTION PRINTABLE PUT-IN CHECK-IN SLIP MODAL   */}
      {/* ========================================================= */}
      {showPutInSlipModal && putInSlipData && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 animate-fade-in">
          <div className="bg-white rounded-2xl shadow-2xl max-w-xl w-full max-h-[92dvh] overflow-y-auto p-4 sm:p-6 space-y-4 animate-scale-in border border-slate-200">
            {/* Header */}
            <div className="flex items-center justify-between border-b pb-3 border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-600 flex items-center justify-center font-bold">
                  <CheckCircle2 className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">Official Put-in Check-in Slip</h3>
                  <p className="text-[11px] text-slate-500">Warehouse Rack &amp; Bin Allocation Verification</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowPutInSlipModal(false)}
                className="text-slate-400 hover:text-slate-700 p-1.5 rounded-lg hover:bg-slate-100 cursor-pointer transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Printable Pass Paper Card */}
            <div id="printable-put-in-slip" className="printable-area border-2 border-slate-300 rounded-2xl bg-white p-5 space-y-4 shadow-sm text-xs">
              <div className="flex items-center justify-between border-b-2 border-slate-300 pb-3">
                <div>
                  <span className="text-[10px] uppercase font-bold text-emerald-700 tracking-wider block">
                    CENTRAL WAREHOUSE INWARD STORAGE
                  </span>
                  <h4 className="text-base font-extrabold text-slate-900 tracking-tight">
                    PUT-AWAY &amp; BIN ALLOCATION SLIP
                  </h4>
                  <p className="text-xs font-mono font-bold text-slate-700 mt-0.5">
                    GRN Ref: {putInSlipData.grnNo} • Batch: {putInSlipData.batchNo}
                  </p>
                </div>
                <div className="w-20 h-20 bg-white border border-slate-300 rounded-xl p-1 flex items-center justify-center shrink-0">
                  {putInSlipQrUrl ? (
                    <img src={putInSlipQrUrl} alt="Put-in QR" className="w-full h-full object-contain" />
                  ) : (
                    <QrCode className="w-12 h-12 text-slate-800" />
                  )}
                </div>
              </div>

              {/* Big High-Contrast Location Banner */}
              <div className="p-3.5 bg-slate-900 text-white rounded-xl space-y-1">
                <span className="text-[10px] uppercase font-bold text-emerald-400 tracking-wider block">
                  PHYSICAL STORAGE LOCATION
                </span>
                <div className="flex items-center justify-between">
                  <span className="font-mono text-lg font-extrabold tracking-wide text-emerald-300">
                    {putInSlipData.locationCode}
                  </span>
                  <span className="text-xs bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded font-bold border border-emerald-500/30">
                    {putInSlipData.deck}
                  </span>
                </div>
                <div className="text-[11px] text-slate-300 font-medium pt-0.5 flex flex-wrap gap-x-4">
                  <span>Shed: {putInSlipData.shadeName}</span>
                  <span>Rack: {putInSlipData.rackNumber}</span>
                  <span>Row: {putInSlipData.row}</span>
                  <span>Col: {putInSlipData.col}</span>
                </div>
              </div>

              {/* 2-Column Summary */}
              <div className="grid grid-cols-2 gap-3 border-b border-slate-200 pb-3">
                <div>
                  <span className="text-slate-500 block text-[10px]">Product Name:</span>
                  <strong className="text-slate-900 block text-xs">{putInSlipData.productName}</strong>
                  <span className="text-[10px] font-mono text-slate-500">SKU: {putInSlipData.sku}</span>
                </div>
                <div>
                  <span className="text-slate-500 block text-[10px]">Batch Number:</span>
                  <strong className="font-mono text-slate-900 block text-xs">{putInSlipData.batchNo}</strong>
                  <span className="text-[10px] text-emerald-700 font-bold block">
                    Exp: {formatDisplayDate(putInSlipData.expiryDate)}
                  </span>
                </div>
                <div>
                  <span className="text-slate-500 block text-[10px]">Stored Packaging Quantity:</span>
                  <strong className="text-slate-900 text-xs">
                    {putInSlipData.packageQty} {putInSlipData.packagingUnit}{Number(putInSlipData.looseQty) > 0 ? ` + ${putInSlipData.looseQty} Loose` : ''}
                  </strong>
                  <span className="text-[10px] text-slate-500 block">
                    Total: {putInSlipData.totalBaseQty} {putInSlipData.baseUnit}
                  </span>
                </div>
                <div>
                  <span className="text-slate-500 block text-[10px]">Put-in Check-in Time:</span>
                  <span className="font-semibold text-slate-800 block text-xs">{putInSlipData.checkInTime}</span>
                  <span className="text-[10px] text-emerald-700 font-bold">Status: Shelved &amp; Verified</span>
                </div>
                <div>
                  <span className="text-slate-500 block text-[10px]">Vendor / Source:</span>
                  <span className="font-semibold text-slate-800">{putInSlipData.supplier}</span>
                </div>
                <div>
                  <span className="text-slate-500 block text-[10px]">Vehicle Reg / PO:</span>
                  <span className="font-mono font-bold text-slate-900">{putInSlipData.vehicleNo} ({putInSlipData.poNo})</span>
                </div>
              </div>

              {/* Remarks */}
              <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-200 text-xs">
                <span className="text-slate-500 font-semibold block text-[10px]">Placement Remarks:</span>
                <span className="text-slate-800 font-medium">{putInSlipData.remarks}</span>
              </div>

              {/* Signatures */}
              <div className="pt-3 grid grid-cols-2 gap-4 text-center text-xs border-t border-slate-200">
                <div className="border-t border-dashed border-slate-300 pt-1.5">
                  <p className="font-bold text-slate-800">Forklift / Stacker Operator</p>
                  <p className="text-[10px] text-slate-400">Physical Placement Verified</p>
                </div>
                <div className="border-t border-dashed border-slate-300 pt-1.5">
                  <p className="font-bold text-slate-800">Store In-Charge / Supervisor</p>
                  <p className="text-[10px] text-slate-400">Location Record Logged</p>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center justify-end gap-2.5 pt-2">
              <button
                type="button"
                onClick={() => setShowPutInSlipModal(false)}
                className="px-4 py-2 border border-slate-300 rounded-xl text-xs font-bold text-slate-700 hover:bg-slate-50 cursor-pointer transition"
              >
                Close
              </button>
              <button
                type="button"
                onClick={() => printSpecificElement('#printable-put-in-slip', `Put-in Slip - ${putInSlipData.grnNo} - ${putInSlipData.batchNo}`)}
                className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-xs transition"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Print Official Put-in Slip</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* 8. CREATE NEW GRN MODAL                                   */}
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

            {/* Quick autofill from Gate Pass (Searchable) */}
            <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <span className="text-xs font-semibold text-slate-700 flex items-center gap-1.5 shrink-0">
                <Truck className="w-3.5 h-3.5 text-indigo-600" />
                Auto-fill from Active Gate Pass:
              </span>
              <div className="w-full sm:w-80">
                <CustomSelect
                  value={newGrn.selectedGatePassNo || ''}
                  onChange={(val) => {
                    if (val) handleSelectGateEntry(val)
                    else setNewGrn(initialNewGrn)
                  }}
                  options={gatePassOptions}
                  placeholder="-- Search & Select Gate Pass --"
                  zIndexClass="z-40"
                />
              </div>
            </div>

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

              {/* Product Selection Breakdown */}
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

                      <div className="grid grid-cols-1 sm:grid-cols-12 gap-2.5 items-end">
                        {/* Product Select (Searchable) */}
                        <div className="sm:col-span-12 md:col-span-5">
                          <label className="block text-[11px] font-bold text-slate-700 mb-1">
                            Product Master <span className="text-rose-500">*</span>
                          </label>
                          {newGrn.selectedGatePassNo ? (
                            <div className="w-full bg-slate-100 border border-slate-200 rounded-lg px-2.5 py-2 text-xs font-semibold text-slate-800">
                              {m.productName} ({m.sku})
                            </div>
                          ) : (
                            <CustomSelect
                              value={m.productId || ''}
                              onChange={(val) => handleGrnItemChange(m.id, 'productId', val)}
                              options={grnProductOptions}
                              placeholder="-- Search & Select Product --"
                              zIndexClass="z-30"
                            />
                          )}
                        </div>

                        {/* Quantity Received in Maximum Unit (Full Cartons) */}
                        <div className="sm:col-span-6 md:col-span-2">
                          <label className="block text-[11px] font-bold text-slate-700 mb-1 truncate">
                            Full {m.packagingUnit || 'Carton'}s <span className="text-rose-500">*</span>
                          </label>
                          <input
                            type="number"
                            min="0"
                            value={m.packageQty}
                            onChange={(e) => handleGrnItemChange(m.id, 'packageQty', e.target.value)}
                            placeholder="0"
                            className="w-full bg-white border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs font-bold text-slate-900 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                          />
                          <p className="text-[10px] text-slate-500 mt-0.5 truncate">
                            1 {m.packagingUnit || 'Carton'} = {m.packSize || 1} {m.baseUnit || 'Pkt'}
                          </p>
                        </div>

                        {/* Loose Quantity */}
                        <div className="sm:col-span-6 md:col-span-2">
                          <label className="block text-[11px] font-bold text-slate-700 mb-1 truncate">
                            Loose ({m.baseUnit || 'Packet'}s)
                          </label>
                          <input
                            type="number"
                            min="0"
                            value={m.looseQty ?? '0'}
                            onChange={(e) => handleGrnItemChange(m.id, 'looseQty', e.target.value)}
                            placeholder="0"
                            className="w-full bg-white border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs font-bold text-slate-900 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                          />
                          <p className="text-[10px] text-slate-500 mt-0.5">
                            Loose Pieces
                          </p>
                        </div>

                        {/* Base Stock Total (Minimum Unit) */}
                        <div className="sm:col-span-12 md:col-span-3">
                          <label className="block text-[11px] font-bold text-indigo-900 mb-1 truncate">
                            Total Base Qty ({m.baseUnit || 'Packet'}s)
                          </label>
                          <div className="px-2.5 py-1.5 bg-emerald-50 border border-emerald-200 rounded-lg text-xs font-mono font-bold text-emerald-800">
                            <div className="flex items-center justify-between">
                              <span>{m.totalBaseQty || 0} {m.baseUnit || 'Packet'}</span>
                              <span className="text-[10px] font-sans font-semibold text-emerald-700">
                                {m.packageQty || 0} {m.packagingUnit || 'Carton'}{Number(m.looseQty) > 0 ? ` + ${m.looseQty} Loose` : ''}
                              </span>
                            </div>
                          </div>
                          <p className="text-[10px] text-emerald-700 mt-0.5 font-medium truncate">
                            Stock inward in base minimum unit
                          </p>
                        </div>
                      </div>

                      {/* Mandatory Manufacturing Date & Expiry Date Inputs */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1 border-t border-slate-100">
                        <div>
                          <label className="block text-[10px] font-bold text-slate-700 mb-0.5">
                            Manufacturing Date (Mfg Date) <span className="text-rose-500">*</span>
                          </label>
                          <input
                            type="date"
                            required
                            value={m.mfgDate}
                            onChange={(e) => handleGrnItemChange(m.id, 'mfgDate', e.target.value)}
                            className="w-full bg-white border border-slate-300 rounded-lg px-2.5 py-1 text-xs text-slate-900 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                          />
                        </div>

                        <div>
                          <label className="block text-[10px] font-bold text-slate-700 mb-0.5">
                            Expiry Date <span className="text-rose-500">*</span>
                          </label>
                          <input
                            type="date"
                            required
                            min={m.mfgDate || undefined}
                            value={m.expiryDate}
                            onChange={(e) => handleGrnItemChange(m.id, 'expiryDate', e.target.value)}
                            className="w-full bg-white border border-slate-300 rounded-lg px-2.5 py-1 text-xs text-slate-900 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <CustomSelect
                label="Assigned Storage Shed / Building"
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
                  disabled={isSubmitting}
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2.5 border border-slate-300 rounded-xl text-slate-700 hover:bg-slate-50 font-bold cursor-pointer transition disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 rounded-xl font-bold shadow-xs transition flex items-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed disabled:pointer-events-none cursor-pointer"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Creating &amp; Processing GRN...</span>
                    </>
                  ) : (
                    <>
                      <Check className="w-4 h-4" />
                      <span>Create &amp; Process GRN</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* 9. GRN CREATION SUCCESS CONFIRMATION MODAL                */}
      {/* ========================================================= */}
      {grnSuccessModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-4 text-center">
            <div className="w-14 h-14 bg-emerald-100 text-emerald-600 rounded-2xl mx-auto flex items-center justify-center">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <div>
              <h3 className="text-lg font-extrabold text-slate-900">GRN Generated Successfully!</h3>
              <p className="text-xs text-slate-500 mt-1">
                The inward consignment has been recorded. You can now allocate it to warehouse racks via Put-in!
              </p>
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
                <span className="text-slate-500">Storage Shed:</span>
                <span className="text-indigo-700 font-bold">{grnSuccessModal.shade}</span>
              </div>
            </div>

            {/* Direct Put-in Action from GRN Generation */}
            <div className="flex flex-col gap-2 pt-1">
              <button
                type="button"
                onClick={() => {
                  const grn = grnSuccessModal
                  setGrnSuccessModal(null)
                  setWorkflowTab('PENDING_PUT_IN')
                  setSearchParams({ tab: 'pending' })
                  if (grn.materials && grn.materials.length > 0) {
                    const firstLot = {
                      lotId: `${grn._id || grn.grnNo}-0`,
                      grnId: grn._id,
                      grnNo: grn.grnNo,
                      poNo: grn.poNo,
                      supplier: grn.supplier,
                      vehicleNo: grn.vehicleNo,
                      grnDate: grn.createdAt || grn.dateTime,
                      grnShade: grn.shade,
                      productName: grn.materials[0].productName,
                      productId: grn.materials[0].productId,
                      sku: grn.materials[0].sku,
                      batchNo: grn.materials[0].batchNo,
                      packageQty: grn.materials[0].packageQty,
                      looseQty: grn.materials[0].looseQty || 0,
                      packagingUnit: grn.materials[0].packagingUnit,
                      packSize: grn.materials[0].packSize,
                      totalBaseQty: grn.materials[0].totalBaseQty,
                      baseUnit: grn.materials[0].baseUnit,
                      mfgDate: grn.materials[0].mfgDate,
                      expiryDate: grn.materials[0].expiryDate,
                      location: '',
                      putAwayStatus: 'Pending',
                    }
                    handleOpenPutInModal(firstLot)
                  }
                }}
                className="w-full py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer shadow-xs transition"
              >
                <Truck className="w-4 h-4" />
                <span>🚚 Put-in Now (Allocate Rack &amp; Print Slip)</span>
              </button>

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setGrnSuccessModal(null)
                    setWorkflowTab('PENDING_PUT_IN')
                    setSearchParams({ tab: 'pending' })
                  }}
                  className="flex-1 py-2 rounded-xl border border-slate-300 text-slate-700 text-xs font-bold hover:bg-slate-50 cursor-pointer transition"
                >
                  Close &amp; Go to Queue
                </button>
                <button
                  type="button"
                  onClick={() => {
                    const grn = grnSuccessModal
                    setGrnSuccessModal(null)
                    setSelectedGrn(grn)
                    setShowPrintModal(true)
                  }}
                  className="flex-1 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold flex items-center justify-center gap-1 cursor-pointer shadow-xs transition"
                >
                  <Printer className="w-3.5 h-3.5" /> View GRN Slip
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* 10. HIGH RESOLUTION PRINTABLE GRN RECEIPT MODAL           */}
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
                  <span className="text-slate-500 block">Receiving Shed:</span>
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
                          <th className="py-2 px-3">Mfg Date</th>
                          <th className="py-2 px-3">Expiry Date / ESL</th>
                          <th className="py-2 px-3 text-right">Quantity</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 bg-white">
                        {selectedGrn.materials.map((m, idx) => (
                          <tr key={idx}>
                            <td className="py-2 px-3 font-semibold text-slate-900">
                              {m.productName || m.name}
                              {m.sku && (
                                <span className="text-[10px] text-slate-400 font-mono block">
                                  SKU: {m.sku}
                                </span>
                              )}
                            </td>
                            <td className="py-2 px-3 text-slate-700 font-medium whitespace-nowrap">
                              {m.mfgDate
                                ? new Date(m.mfgDate).toLocaleDateString('en-IN', {
                                    day: '2-digit',
                                    month: 'short',
                                    year: 'numeric',
                                  })
                                : '—'}
                            </td>
                            <td className="py-2 px-3 whitespace-nowrap">
                              <span className="text-rose-700 font-semibold block">
                                {m.expiryDate ? formatDisplayDate(m.expiryDate) : '—'}
                              </span>
                              <span className="text-[10px] text-emerald-600 font-bold block">
                                {getEslInfo(m).eslText}
                              </span>
                            </td>
                            <td className="py-2 px-3 text-right font-bold text-slate-900 whitespace-nowrap">
                              {m.packageQty || 0} {m.packagingUnit || m.unit || 'Carton'}
                              {Number(m.looseQty) > 0 ? ` + ${m.looseQty} Loose` : ''}
                              {m.totalBaseQty
                                ? ` (= ${m.totalBaseQty} ${m.baseUnit || 'Packet'})`
                                : ''}
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
