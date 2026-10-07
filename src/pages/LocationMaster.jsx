import { useState, useMemo, useRef, useEffect } from 'react'
import { Link } from 'react-router-dom'
import QRCode from 'qrcode'
import { printSpecificElement } from '../utils/printHelper'
import {
  Warehouse, Package, Layers, MapPin, Search, X, Upload, Download,
  FileSpreadsheet, Edit2, QrCode, CheckCircle2, AlertTriangle, Clock,
  ChevronDown, Check, Printer, Plus, LayoutGrid, AlertCircle, Eye, ArrowUpRight
} from 'lucide-react'

import { apiRequest } from '../services/api'

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
        className="w-full bg-slate-50 hover:bg-slate-100/80 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-left font-medium text-slate-800 flex items-center justify-between transition focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
      >
        <span className="truncate">{selectedOption ? selectedOption.label : placeholder}</span>
        <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform duration-200 shrink-0 ml-2 ${isOpen ? 'rotate-180 text-indigo-600' : ''}`} />
      </button>

      {isOpen && (
        <div className={`absolute left-0 right-0 mt-1.5 bg-white border border-slate-200 rounded-xl shadow-xl py-1.5 ${zIndexClass} max-h-56 overflow-y-auto`}>
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
                className={`w-full px-3.5 py-2 text-xs text-left flex items-center justify-between transition ${
                  isSelected ? 'bg-indigo-50 text-indigo-700 font-semibold' : 'text-slate-700 hover:bg-slate-50'
                }`}
              >
                <div className="truncate">
                  <div className="truncate">{opt.label}</div>
                  {opt.sublabel && <div className="text-[10px] text-slate-400 font-normal">{opt.sublabel}</div>}
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

export default function LocationMaster() {
  const [toastMessage, setToastMessage] = useState(null)
  const triggerToast = (msg, type = 'success') => {
    setToastMessage({ msg, type })
    setTimeout(() => setToastMessage(null), 3200)
  }

  // Live Database State
  const [shades, setShades] = useState([])
  const [racks, setRacks] = useState([])
  const [grns, setGrns] = useState([])
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)

  // Active Selected Shade Code (e.g. SH-01)
  const [activeShadeCode, setActiveShadeCode] = useState('')

  // Filter & Search
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState('ALL')
  const [currentPage, setCurrentPage] = useState(1)
  const perPage = 10

  // Selected Cell for Bin Inspector / Edit Modal
  const [selectedCell, setSelectedCell] = useState(null)
  const [showEditCellModal, setShowEditCellModal] = useState(false)
  const [showQrModal, setShowQrModal] = useState(false)
  const [savingCell, setSavingCell] = useState(false)

  // Form State for editing cell allocation
  const [cellFormData, setCellFormData] = useState({
    rackId: '',
    cellCode: '',
    status: 'Empty',
    productName: '',
    batchNo: '',
    currentStock: 0,
  })

  // Fetch real Shade, Rack, GRN, & Product data from Mongo Backend API
  const fetchMasterData = async () => {
    try {
      setLoading(true)
      const [shadesRes, racksRes, grnsRes, prodsRes] = await Promise.allSettled([
        apiRequest('/shade'),
        apiRequest('/rack'),
        apiRequest('/grn'),
        apiRequest('/product'),
      ])

      const shadesData = shadesRes.status === 'fulfilled' && Array.isArray(shadesRes.value) ? shadesRes.value : []
      const racksData = racksRes.status === 'fulfilled' && Array.isArray(racksRes.value) ? racksRes.value : []
      const grnsData = grnsRes.status === 'fulfilled' && Array.isArray(grnsRes.value) ? grnsRes.value : []
      const prodsData = prodsRes.status === 'fulfilled' && Array.isArray(prodsRes.value) ? prodsRes.value : []

      setShades(shadesData)
      setRacks(racksData)
      setGrns(grnsData)
      setProducts(prodsData)

      if (shadesData.length > 0 && !activeShadeCode) {
        setActiveShadeCode(shadesData[0].code)
      }
    } catch (err) {
      console.error('Failed to fetch location master data:', err)
      triggerToast('Failed to load shades and racks from server', 'error')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchMasterData()
  }, [])

  // Flatten all cells from all live racks with metadata & merge with GRN/Product allocated inventory
  const allLiveCells = useMemo(() => {
    const cellsList = []

    // Build lookup map of allocated materials from GRNs
    const allocatedFromGrn = []
    grns.forEach((g) => {
      if (g.materials && Array.isArray(g.materials)) {
        g.materials.forEach((m) => {
          if (m.location || m.putAwayStatus === 'Completed') {
            allocatedFromGrn.push({
              grnNo: g.grnNo,
              location: m.location || '',
              shade: g.shade || '',
              productName: m.productName,
              sku: m.sku,
              batchNo: m.batchNo,
              quantity: m.totalBaseQty || m.packageQty || 1,
            })
          }
        })
      }
    })

    racks.forEach((rack) => {
      const shadeObj = shades.find((s) => String(s._id) === String(rack.shadeId) || s.code === rack.shadeCode)
      const shadeName = shadeObj ? shadeObj.name : rack.shadeCode
      const rawCells = rack.cells && Array.isArray(rack.cells) ? rack.cells : []

      for (let r = 1; r <= (Number(rack.rows) || 4); r++) {
        for (let c = 1; c <= (Number(rack.columns) || 5); c++) {
          const defaultCode = `${rack.shadeCode}-${rack.rackNumber}-R${r}-C${c}`
          const existingCell = rawCells.find((cell) => Number(cell.row) === r && Number(cell.col) === c)

          let status = existingCell?.status || 'Empty'
          let productName = existingCell?.productName || ''
          let batchNo = existingCell?.batchNo || ''
          let currentStock = Number(existingCell?.currentStock) || 0
          let cellCode = existingCell?.code || defaultCode

          if (existingCell && (existingCell.status === 'Occupied' || existingCell.status === 'Full' || Number(existingCell.currentStock) > 0)) {
            status = existingCell.status || 'Occupied'
            productName = existingCell.productName
            batchNo = existingCell.batchNo
            currentStock = Number(existingCell.currentStock) || 1
          }

          // Also check GRN allocations matching cell code or (shade, rack, row, col)
          const matchingGrn = allocatedFromGrn.find((a) => {
            if (!a.location) return false
            if (a.location.toUpperCase() === cellCode.toUpperCase() || a.location.toUpperCase() === defaultCode.toUpperCase()) return true

            const sMatch = a.location.match(/SH[-_]?0?(\d+)/i)
            const rkMatch = a.location.match(/RK[-_]?0?(\d+)/i)
            const rMatch = a.location.match(/R0?(\d+)/i)
            const cMatch = a.location.match(/C0?(\d+)/i)

            const rackSMatch = (rack.shadeCode || '').match(/SH[-_]?0?(\d+)/i)
            const rackRKMatch = (rack.rackNumber || '').match(/RK[-_]?0?(\d+)/i)

            if (sMatch && rMatch && cMatch && rackSMatch) {
              const shadeMatch = parseInt(sMatch[1]) === parseInt(rackSMatch[1])
              const rowMatch = parseInt(rMatch[1]) === r
              const colMatch = parseInt(cMatch[1]) === c

              if (rkMatch && rackRKMatch) {
                return shadeMatch && parseInt(rkMatch[1]) === parseInt(rackRKMatch[1]) && rowMatch && colMatch
              }
              return shadeMatch && rowMatch && colMatch
            }
            return false
          })

          if (matchingGrn && status === 'Empty') {
            status = 'Occupied'
            productName = matchingGrn.productName
            batchNo = matchingGrn.batchNo
            currentStock = Number(matchingGrn.quantity) || 1
          }

          cellsList.push({
            code: cellCode,
            row: r,
            col: c,
            status,
            productName,
            batchNo,
            currentStock,
            rackId: rack._id,
            rackNumber: rack.rackNumber,
            shadeCode: rack.shadeCode,
            shadeId: rack.shadeId,
            shadeName,
          })
        }
      }
    })
    return cellsList
  }, [racks, shades, grns, products])

  // Live KPI Stats calculated from Mongo DB
  const stats = useMemo(() => {
    const totalBins = allLiveCells.length
    const occupied = allLiveCells.filter((c) => c.status === 'Occupied' || c.status === 'Full' || c.currentStock > 0).length
    const full = allLiveCells.filter((c) => c.status === 'Full').length
    const empty = allLiveCells.filter((c) => c.status === 'Empty' && (!c.currentStock || c.currentStock === 0)).length
    const blocked = allLiveCells.filter((c) => c.status === 'Blocked').length
    const totalShadesCount = shades.length
    const totalRacksCount = racks.length
    return { totalBins, occupied, full, empty, blocked, totalShadesCount, totalRacksCount }
  }, [allLiveCells, shades, racks])

  // Current Active Shade Object
  const currentActiveShade = useMemo(() => {
    return shades.find((s) => s.code === activeShadeCode) || shades[0]
  }, [shades, activeShadeCode])

  // Racks belonging to Active Shade
  const activeShadeRacks = useMemo(() => {
    if (!activeShadeCode) return []
    return racks.filter(
      (r) => r.shadeCode === activeShadeCode || (currentActiveShade && r.shadeId === currentActiveShade._id)
    )
  }, [racks, activeShadeCode, currentActiveShade])

  // Filtered cells list for table view & search
  const filteredCells = useMemo(() => {
    return allLiveCells.filter((cell) => {
      if (statusFilter !== 'ALL' && cell.status !== statusFilter) return false
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase()
        return (
          cell.code.toLowerCase().includes(q) ||
          cell.shadeCode.toLowerCase().includes(q) ||
          cell.rackNumber.toLowerCase().includes(q) ||
          (cell.productName || '').toLowerCase().includes(q) ||
          (cell.batchNo || '').toLowerCase().includes(q)
        )
      }
      return true
    })
  }, [allLiveCells, statusFilter, searchQuery])

  // Pagination for table
  const totalPages = Math.max(1, Math.ceil(filteredCells.length / perPage))
  const paginatedCells = filteredCells.slice((currentPage - 1) * perPage, currentPage * perPage)

  // Open Edit Cell Modal
  const handleInspectCell = (cell) => {
    setSelectedCell(cell)
    setCellFormData({
      rackId: cell.rackId,
      cellCode: cell.code,
      status: cell.status || 'Empty',
      productName: cell.productName || '',
      batchNo: cell.batchNo || '',
      currentStock: cell.currentStock || 0,
    })
    setShowEditCellModal(true)
  }

  // State & Handler for Location Bin QR Code Modal
  const [qrDataUrl, setQrDataUrl] = useState('')
  const [qrCellTarget, setQrCellTarget] = useState(null)

  const handleOpenQrModal = async (cell) => {
    setQrCellTarget(cell)
    const payload = JSON.stringify({
      type: 'WMS_BIN_LOCATION',
      cellCode: cell.code,
      shade: cell.shadeCode,
      rack: cell.rackNumber,
      row: cell.row,
      col: cell.col,
      status: cell.status,
      product: cell.productName || 'Available',
      batch: cell.batchNo || 'N/A',
      stock: cell.currentStock || 0,
      timestamp: new Date().toISOString(),
    })
    try {
      const url = await QRCode.toDataURL(payload, { width: 220, margin: 1 })
      setQrDataUrl(url)
      setShowQrModal(true)
    } catch (err) {
      console.error(err)
      triggerToast('Failed to generate QR Code', 'error')
    }
  }

  // Save updated cell state to MongoDB via PATCH API
  const handleSaveCell = async (e) => {
    e.preventDefault()
    if (!cellFormData.rackId || !cellFormData.cellCode) return

    setSavingCell(true)
    try {
      await apiRequest(`/rack/${cellFormData.rackId}/cell`, {
        method: 'PATCH',
        body: JSON.stringify(cellFormData),
      })

      await fetchMasterData()
      triggerToast(`Cell ${cellFormData.cellCode} updated successfully.`)
      setShowEditCellModal(false)
    } catch (err) {
      triggerToast(err.message || 'Failed to update cell', 'error')
    } finally {
      setSavingCell(false)
    }
  }

  // Export CSV of real Mongo cells
  const handleExportCSV = () => {
    const headers = ['#', 'Cell Code', 'Shade', 'Rack', 'Row', 'Column', 'Product Name', 'Batch No', 'Current Stock', 'Status']
    const rows = filteredCells.map((c, idx) => [
      idx + 1,
      `"${c.code}"`,
      `"${c.shadeCode}"`,
      `"${c.rackNumber}"`,
      `R${c.row}`,
      `C${c.col}`,
      `"${c.productName || ''}"`,
      `"${c.batchNo || ''}"`,
      c.currentStock || 0,
      c.status,
    ])
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n')
    const encodedUri = encodeURI(csvContent)
    const link = document.createElement('a')
    link.setAttribute('href', encodedUri)
    link.setAttribute('download', 'Warehouse_Location_Cells_Master.csv')
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    triggerToast('Location cells exported to CSV.')
  }

  const statusOptions = [
    { value: 'ALL', label: 'All Cell Statuses' },
    { value: 'Empty', label: 'Empty (Available)' },
    { value: 'Occupied', label: 'Occupied (Stock Present)' },
    { value: 'Full', label: 'Full (100% Capacity)' },
    { value: 'Blocked', label: 'Blocked' },
    { value: 'Reserved', label: 'Reserved' },
  ]

  return (
    <div className="space-y-5 pb-12">
      {/* Toast Notification */}
      {toastMessage && (
        <div className={`fixed top-5 right-5 z-[9999] pointer-events-auto px-4 py-3 rounded-xl shadow-2xl flex items-center gap-2.5 text-xs font-semibold border animate-bounce ${toastMessage.type === 'error' ? 'bg-rose-900 text-white border-rose-700' : 'bg-slate-900 text-white border-slate-700'}`}>
          {toastMessage.type === 'error' ? <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" /> : <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />}
          <span>{toastMessage.msg}</span>
        </div>
      )}

      {/* Page Header */}
      <div className="bg-white rounded-2xl p-4 sm:p-5 shadow-xs border border-slate-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-start sm:items-center gap-3.5 min-w-0 flex-1">
          <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 shadow-xs shrink-0 mt-0.5 sm:mt-0">
            <Warehouse className="w-5 h-5" />
          </div>
          <div className="min-w-0">
            <h1 className="text-lg sm:text-xl font-bold text-slate-800 tracking-tight leading-tight">
              Location Master (Live Real Database Locations)
            </h1>
            <p className="text-xs text-slate-500 font-medium mt-0.5 leading-relaxed">
              Real-time 2D visual cell matrix, rack elevation grids, and stock bin allocation mapped directly to MongoDB.
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2.5 w-full sm:w-auto shrink-0">
          <Link
            to="/shade-mgmt"
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold shadow-xs transition"
          >
            <Warehouse className="w-3.5 h-3.5 text-slate-500" />
            <span>Shade Master</span>
          </Link>
          <Link
            to="/rack-mgmt"
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold shadow-xs transition"
          >
            <Layers className="w-3.5 h-3.5 text-slate-500" />
            <span>Rack Master</span>
          </Link>
          <button
            type="button"
            onClick={handleExportCSV}
            className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold shadow-xs transition cursor-pointer"
          >
            <Download className="w-3.5 h-3.5 text-slate-500 shrink-0" />
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      {/* 4 Live Dynamic KPI Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5">
        <div className="bg-white rounded-2xl p-4 shadow-xs border border-slate-200/80 flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 border border-indigo-100 flex items-center justify-center shrink-0">
            <LayoutGrid className="w-5 h-5" />
          </div>
          <div>
            <div className="text-slate-400 text-xs font-medium">Total Live Cells</div>
            <h3 className="text-xl font-bold text-slate-800 tracking-tight">{stats.totalBins} Bins</h3>
            <p className="text-[11px] text-indigo-600 font-medium">Across {stats.totalRacksCount} racks in {stats.totalShadesCount} shades</p>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-4 shadow-xs border border-slate-200/80 flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 border border-emerald-100 flex items-center justify-center shrink-0">
            <CheckCircle2 className="w-5 h-5" />
          </div>
          <div>
            <div className="text-slate-400 text-xs font-medium">Active Stock Cells</div>
            <h3 className="text-xl font-bold text-emerald-600 tracking-tight">{stats.occupied} Bins</h3>
            <p className="text-[11px] text-emerald-600 font-medium">With mapped inventory</p>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-4 shadow-xs border border-slate-200/80 flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-rose-50 text-rose-600 border border-rose-100 flex items-center justify-center shrink-0">
            <AlertCircle className="w-5 h-5" />
          </div>
          <div>
            <div className="text-slate-400 text-xs font-medium">Full Capacity Cells</div>
            <h3 className="text-xl font-bold text-rose-600 tracking-tight">{stats.full} Bins</h3>
            <p className="text-[11px] text-rose-600 font-medium">100% capacity reached</p>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-4 shadow-xs border border-slate-200/80 flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 border border-blue-100 flex items-center justify-center shrink-0">
            <Layers className="w-5 h-5" />
          </div>
          <div>
            <div className="text-slate-400 text-xs font-medium">Available Empty Bins</div>
            <h3 className="text-xl font-bold text-slate-800 tracking-tight">{stats.empty} Bins</h3>
            <p className="text-[11px] text-blue-600 font-medium">Ready for put-away</p>
          </div>
        </div>
      </div>

      {/* Dynamic Shade Switcher Tabs */}
      <div className="bg-white rounded-2xl p-3 shadow-xs border border-slate-200/80">
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar">
          {shades.length === 0 ? (
            <div className="text-xs text-slate-400 p-2">Loading shades from MongoDB...</div>
          ) : (
            shades.map((s) => {
              const isActive = activeShadeCode === s.code
              const shadeCells = allLiveCells.filter((c) => c.shadeCode === s.code || c.shadeId === s._id)
              const occupiedCount = shadeCells.filter((c) => c.status === 'Occupied' || c.status === 'Full' || c.currentStock > 0).length
              const utilPercent = shadeCells.length > 0 ? Math.round((occupiedCount / shadeCells.length) * 100) : 0

              return (
                <button
                  key={s._id || s.code}
                  type="button"
                  onClick={() => {
                    setActiveShadeCode(s.code)
                    triggerToast(`Switched view to ${s.name}`)
                  }}
                  className={`px-4 py-2.5 rounded-xl text-xs font-bold transition flex items-center gap-2.5 whitespace-nowrap cursor-pointer shrink-0 ${
                    isActive
                      ? 'bg-indigo-600 text-white shadow-sm ring-2 ring-indigo-600/20'
                      : 'bg-slate-50 text-slate-700 hover:bg-slate-100 border border-slate-200/80'
                  }`}
                >
                  <span className={`w-2 h-2 rounded-full ${isActive ? 'bg-white' : 'bg-indigo-500'}`} />
                  <span className="font-mono">{s.code}:</span>
                  <span>{s.name}</span>
                  <span
                    className={`text-[10px] px-2 py-0.5 rounded-full font-mono font-semibold ${
                      isActive ? 'bg-white/20 text-white' : 'bg-slate-200/80 text-slate-700'
                    }`}
                  >
                    {utilPercent}% Occupied ({shadeCells.length} Bins)
                  </span>
                </button>
              )
            })
          )}
        </div>
      </div>

      {/* Main Visual Matrix for Selected Shade */}
      <div className="bg-white rounded-2xl p-4 sm:p-6 shadow-xs border border-slate-200/80 space-y-6">
        {/* Header of Selected Shade */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
          <div>
            <h2 className="text-base sm:text-lg font-bold text-slate-900 tracking-tight">
              {currentActiveShade ? `${currentActiveShade.code}: ${currentActiveShade.name}` : 'Shade Matrix'}
            </h2>
            <p className="text-xs text-slate-500 mt-0.5 font-medium">
              {currentActiveShade ? currentActiveShade.description : ''} • {activeShadeRacks.length} Racks Configured
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2 text-xs font-semibold">
            <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-700 border border-emerald-200">
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
              <span>Occupied</span>
            </span>
            <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-rose-50 text-rose-700 border border-rose-200">
              <span className="w-2 h-2 rounded-full bg-rose-500" />
              <span>Full</span>
            </span>
            <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-amber-50 text-amber-700 border border-amber-200">
              <span className="w-2 h-2 rounded-full bg-amber-500" />
              <span>Blocked</span>
            </span>
            <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-100 text-slate-600 border border-slate-200">
              <span className="w-2 h-2 rounded-full bg-slate-400" />
              <span>Empty</span>
            </span>
          </div>
        </div>

        {/* Render Racks inside Selected Shade */}
        {loading ? (
          <div className="py-16 text-center text-slate-400 text-sm">Loading real Mongo location cells...</div>
        ) : activeShadeRacks.length === 0 ? (
          <div className="py-16 text-center text-slate-400 text-sm space-y-3">
            <p>No Racks configured for this Shade in MongoDB yet.</p>
            <Link
              to="/rack-mgmt"
              className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white font-bold text-xs rounded-xl hover:bg-indigo-700 transition"
            >
              <Plus className="w-4 h-4" />
              <span>Add Racks to {activeShadeCode}</span>
            </Link>
          </div>
        ) : (
          <div className="space-y-6">
            {activeShadeRacks.map((rack) => {
              const rackCells = allLiveCells.filter(
                (c) =>
                  String(c.rackId) === String(rack._id) ||
                  (c.shadeCode === rack.shadeCode && c.rackNumber === rack.rackNumber)
              )

              return (
                <div key={rack._id} className="bg-slate-50 rounded-2xl p-4 border border-slate-200/80 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <span className="font-mono font-bold text-xs bg-indigo-600 text-white px-2.5 py-1 rounded-lg">
                        {rack.shadeCode} - {rack.rackNumber}
                      </span>
                      <span className="text-xs font-bold text-slate-800">
                        {rack.description || `Storage Rack ${rack.rackNumber}`}
                      </span>
                      <span className="text-xs text-slate-500 font-medium">
                        ({rack.rows} Rows × {rack.columns} Cols = {rackCells.length} Bins)
                      </span>
                    </div>

                    <button
                      type="button"
                      onClick={() => {
                        const firstCell = rackCells[0]
                        if (firstCell) handleInspectCell(firstCell)
                      }}
                      className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 flex items-center gap-1 cursor-pointer"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span>Inspect Rack</span>
                    </button>
                  </div>

                  {/* 2D Grid Representation for Rack Elevation */}
                  <div className="overflow-x-auto pb-2 scrollbar-thin">
                    <div className="inline-block min-w-full">
                      <div className="space-y-2">
                        {Array.from({ length: rack.rows }).map((_, rIdx) => {
                          const rowNum = rIdx + 1
                          return (
                            <div key={rowNum} className="flex items-center gap-2">
                              <span className="w-16 text-[11px] font-mono font-bold text-slate-400 shrink-0 text-right pr-2">
                                R{rowNum}
                              </span>
                              <div className="flex items-center gap-2 flex-1">
                                {Array.from({ length: rack.columns }).map((_, cIdx) => {
                                  const colNum = cIdx + 1
                                  const cellCode = `${rack.shadeCode}-${rack.rackNumber}-R${rowNum}-C${colNum}`
                                  const cell =
                                    rackCells.find(
                                      (c) =>
                                        Number(c.row) === Number(rowNum) &&
                                        Number(c.col) === Number(colNum)
                                    ) || {
                                      code: cellCode,
                                      row: rowNum,
                                      col: colNum,
                                      status: 'Empty',
                                      currentStock: 0,
                                      rackId: rack._id,
                                    }

                                  const isOccupied = cell.status === 'Occupied' || cell.currentStock > 0
                                  const isFull = cell.status === 'Full'
                                  const isBlocked = cell.status === 'Blocked'

                                  const bgStyle = isFull
                                    ? 'bg-rose-50 border-rose-200 text-rose-800 hover:bg-rose-100'
                                    : isOccupied
                                    ? 'bg-emerald-50 border-emerald-200 text-emerald-800 hover:bg-emerald-100'
                                    : isBlocked
                                    ? 'bg-amber-50 border-amber-200 text-amber-800 hover:bg-amber-100'
                                    : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-100'

                                  const badgeStyle = isFull
                                    ? 'bg-rose-600 text-white'
                                    : isOccupied
                                    ? 'bg-emerald-600 text-white'
                                    : isBlocked
                                    ? 'bg-amber-600 text-white'
                                    : 'bg-slate-200 text-slate-600'

                                  return (
                                    <div
                                      key={colNum}
                                      onClick={() => handleInspectCell(cell)}
                                      className={`border rounded-xl p-2 min-w-[115px] transition cursor-pointer group shadow-xs ${bgStyle}`}
                                    >
                                      <div className="flex items-center justify-between gap-1">
                                        <span className="text-[10px] font-mono font-bold truncate">{cell.code}</span>
                                        <span className={`text-[9px] px-1.5 py-0.2 rounded font-bold uppercase shrink-0 ${badgeStyle}`}>
                                          {cell.status}
                                        </span>
                                      </div>
                                      <div className="text-[10px] font-semibold truncate mt-1 text-slate-800">
                                        {cell.productName || 'Empty Cell'}
                                      </div>
                                      <div className="text-[9px] text-slate-500 font-mono mt-0.5 flex items-center justify-between">
                                        <span>R{rowNum}•C{colNum}</span>
                                        {cell.currentStock > 0 && (
                                          <span className="font-bold text-slate-700">{cell.currentStock} qty</span>
                                        )}
                                      </div>
                                    </div>
                                  )
                                })}
                              </div>
                            </div>
                          )
                        })}
                      </div>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* Live Table Directory of All Cells */}
      <div className="bg-white rounded-2xl shadow-xs border border-slate-200/80 overflow-hidden">
        <div className="p-4 sm:p-5 border-b border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-3.5">
          <div className="flex items-center gap-2.5">
            <LayoutGrid className="w-4 h-4 text-indigo-600" />
            <h2 className="text-sm font-bold text-slate-800">Master Bin Cell Register</h2>
            <span className="text-xs bg-slate-100 text-slate-600 font-semibold px-2 py-0.5 rounded-full border border-slate-200">
              {filteredCells.length} Live Cells
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 items-center text-xs">
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-3" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search cell code, product, batch..."
                className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-8 pr-3 py-2 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 focus:bg-white"
              />
            </div>
            <CustomSelect value={statusFilter} onChange={setStatusFilter} options={statusOptions} zIndexClass="z-30" />
          </div>
        </div>

        <div className="overflow-x-auto w-full">
          {loading ? (
            <div className="py-16 text-center text-slate-400 text-sm">Loading cell inventory...</div>
          ) : filteredCells.length === 0 ? (
            <div className="py-16 text-center text-slate-400 text-sm">No cells match your filter.</div>
          ) : (
            <table className="w-full text-left text-xs divide-y divide-slate-200">
              <thead className="bg-slate-50/80 text-slate-600 font-bold uppercase tracking-wider text-[11px]">
                <tr>
                  <th className="py-3.5 px-4 w-12 text-center">#</th>
                  <th className="py-3.5 px-4 min-w-[140px]">Cell Code</th>
                  <th className="py-3.5 px-4 min-w-[100px]">Shade</th>
                  <th className="py-3.5 px-4 min-w-[100px]">Rack</th>
                  <th className="py-3.5 px-4 text-center min-w-[90px]">Row • Col</th>
                  <th className="py-3.5 px-4 min-w-[180px]">Mapped Product</th>
                  <th className="py-3.5 px-4 min-w-[120px]">Batch No</th>
                  <th className="py-3.5 px-4 text-right min-w-[100px]">Current Stock</th>
                  <th className="py-3.5 px-4 text-center min-w-[100px]">Status</th>
                  <th className="py-3.5 px-4 text-center w-24">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 bg-white">
                {paginatedCells.map((row, idx) => (
                  <tr key={row.code + idx} className="hover:bg-slate-50/80 transition">
                    <td className="py-3.5 px-4 text-center text-slate-400 font-bold text-[11px]">
                      {(currentPage - 1) * perPage + idx + 1}
                    </td>
                    <td className="py-3.5 px-4 font-mono font-bold text-indigo-600">{row.code}</td>
                    <td className="py-3.5 px-4 font-semibold text-slate-800">{row.shadeCode}</td>
                    <td className="py-3.5 px-4 font-mono font-semibold text-slate-700">{row.rackNumber}</td>
                    <td className="py-3.5 px-4 text-center font-mono text-slate-600">R{row.row} • C{row.col}</td>
                    <td className="py-3.5 px-4 font-semibold text-slate-800">{row.productName || '—'}</td>
                    <td className="py-3.5 px-4 font-mono text-slate-600">{row.batchNo || '—'}</td>
                    <td className="py-3.5 px-4 text-right font-bold text-slate-900">{row.currentStock || 0}</td>
                    <td className="py-3.5 px-4 text-center">
                      <span className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${
                        row.status === 'Occupied' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
                        row.status === 'Full' ? 'bg-rose-50 text-rose-700 border-rose-200' :
                        row.status === 'Blocked' ? 'bg-amber-50 text-amber-700 border-amber-200' :
                        'bg-slate-100 text-slate-600 border-slate-200'
                      }`}>
                        {row.status}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      <div className="flex items-center justify-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => handleOpenQrModal(row)}
                          className="p-1.5 rounded-lg text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 border border-slate-200 transition cursor-pointer"
                          title="Print / View Location QR"
                        >
                          <QrCode className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleInspectCell(row)}
                          className="p-1.5 rounded-lg text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 border border-slate-200 transition cursor-pointer"
                          title="Edit Cell Allocation"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Pagination Controls */}
        <div className="p-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
          <div>Showing {filteredCells.length === 0 ? 0 : (currentPage - 1) * perPage + 1} to {Math.min(currentPage * perPage, filteredCells.length)} of {filteredCells.length} cells</div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              disabled={currentPage === 1}
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              className="px-3 py-1.5 border border-slate-200 rounded-lg disabled:opacity-40 hover:bg-slate-50"
            >
              Previous
            </button>
            <span className="font-semibold text-slate-700">Page {currentPage} of {totalPages}</span>
            <button
              type="button"
              disabled={currentPage === totalPages}
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              className="px-3 py-1.5 border border-slate-200 rounded-lg disabled:opacity-40 hover:bg-slate-50"
            >
              Next
            </button>
          </div>
        </div>
      </div>

      {/* Edit / Inspect Cell Modal */}
      {showEditCellModal && selectedCell && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-5 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
                  <MapPin className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-sm text-slate-800">Bin Cell Inspector</h3>
                  <p className="font-mono font-bold text-xs text-indigo-600">{cellFormData.cellCode}</p>
                </div>
              </div>
              <button type="button" onClick={() => setShowEditCellModal(false)} className="text-slate-400 hover:text-slate-700">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveCell} className="space-y-3.5 text-xs">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Cell Status</label>
                <CustomSelect
                  value={cellFormData.status}
                  onChange={(v) => setCellFormData({ ...cellFormData, status: v })}
                  options={[
                    { value: 'Empty', label: 'Empty (Available for Put-Away)' },
                    { value: 'Occupied', label: 'Occupied (Stock Present)' },
                    { value: 'Full', label: 'Full (Max Capacity)' },
                    { value: 'Blocked', label: 'Blocked (Maintenance / Quarantine)' },
                    { value: 'Reserved', label: 'Reserved' },
                  ]}
                  zIndexClass="z-50"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Mapped Product Name</label>
                <input
                  type="text"
                  value={cellFormData.productName}
                  onChange={(e) => setCellFormData({ ...cellFormData, productName: e.target.value })}
                  placeholder="e.g. Basmati Rice 25kg"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs text-slate-800 font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 focus:bg-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Batch Number</label>
                  <input
                    type="text"
                    value={cellFormData.batchNo}
                    onChange={(e) => setCellFormData({ ...cellFormData, batchNo: e.target.value })}
                    placeholder="e.g. BT-2026-001"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs font-mono text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 focus:bg-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Current Stock Quantity</label>
                  <input
                    type="number"
                    min="0"
                    value={cellFormData.currentStock}
                    onChange={(e) => setCellFormData({ ...cellFormData, currentStock: parseInt(e.target.value) || 0 })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 focus:bg-white"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowEditCellModal(false)}
                  className="px-4 py-2 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={savingCell}
                  className="bg-indigo-600 hover:bg-indigo-700 disabled:opacity-60 text-white px-5 py-2 rounded-xl text-xs font-bold transition shadow-xs"
                >
                  {savingCell ? 'Saving...' : 'Update Mongo Cell'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Printable Bin / Cell Location QR Modal */}
      {showQrModal && qrCellTarget && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-sm w-full p-5 shadow-2xl border border-slate-200 space-y-4 text-center">
            <div className="flex items-center justify-between border-b pb-2.5 border-slate-100">
              <h3 className="text-sm font-bold text-slate-800">Physical Rack / Bin QR Label</h3>
              <button
                type="button"
                onClick={() => setShowQrModal(false)}
                className="text-slate-400 hover:text-slate-700 p-1"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div id="printable-location-bin-tag" className="printable-area border-2 border-slate-900 rounded-xl p-4 bg-white space-y-2 text-center">
              <div className="text-[9px] font-black uppercase tracking-wider text-slate-500">
                CENTRAL WAREHOUSE • LOCATION BIN TAG
              </div>
              <div className="text-xl font-black font-mono tracking-widest text-slate-900 py-1 bg-slate-50 rounded border border-dashed border-slate-300">
                {qrCellTarget.code}
              </div>

              <div className="w-32 h-32 mx-auto border border-slate-200 p-1 rounded-lg flex items-center justify-center bg-white shadow-xs">
                {qrDataUrl ? (
                  <img src={qrDataUrl} alt="Location QR" className="w-full h-full object-contain" />
                ) : (
                  <QrCode className="w-12 h-12 text-slate-300 animate-pulse" />
                )}
              </div>

              <div className="text-[11px] font-mono text-slate-700 space-y-0.5">
                <div><strong>Shade:</strong> {qrCellTarget.shadeCode} | <strong>Rack:</strong> {qrCellTarget.rackNumber}</div>
                <div><strong>Bin:</strong> Row {qrCellTarget.row} • Col {qrCellTarget.col}</div>
                <div className="text-indigo-700 font-bold truncate"><strong>Item:</strong> {qrCellTarget.productName || 'Empty'}</div>
              </div>

              <div className="text-[9px] text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 inline-block">
                Status: {qrCellTarget.status} ({qrCellTarget.currentStock || 0} Qty)
              </div>
            </div>

            <div className="flex gap-2 pt-1">
              <button
                type="button"
                onClick={() => setShowQrModal(false)}
                className="flex-1 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition"
              >
                Close
              </button>
              <button
                type="button"
                onClick={() => printSpecificElement('#printable-location-bin-tag', `Location Bin Tag - ${qrCellTarget.code}`)}
                className="flex-1 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl transition flex items-center justify-center gap-1.5"
              >
                <Printer className="w-4 h-4" />
                <span>Print Tag</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
