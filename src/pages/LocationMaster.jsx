import { useState, useMemo, useRef, useEffect } from 'react'
import { Link } from 'react-router-dom'
import QRCode from 'qrcode'
import { printSpecificElement } from '../utils/printHelper'
import { getEslInfo } from '../utils/eslHelper'
import {
  Warehouse, Package, Layers, MapPin, Search, X, Upload, Download,
  FileSpreadsheet, Edit2, QrCode, CheckCircle2, AlertTriangle, Clock,
  ChevronDown, Check, Printer, Plus, LayoutGrid, AlertCircle, Eye, ArrowUpRight,
  Truck, ArrowUp, ArrowDown, ArrowRight, Filter, Sparkles, Building2, Trash2, Loader2
} from 'lucide-react'

import { apiRequest } from '../services/api'
import DataLoader from '../components/common/DataLoader'

import CustomSelect from '../components/common/SearchableSelect'

export default function LocationMaster() {
  const [toastMessage, setToastMessage] = useState(null)
  const triggerToast = (msg, type = 'success') => {
    setToastMessage({ msg, type })
    setTimeout(() => setToastMessage(null), 3200)
  }

  // Live Database State
  const [shades, setshades] = useState([])
  const [racks, setRacks] = useState([])
  const [grns, setGrns] = useState([])
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)

  // Active Selected Shed Code (e.g. SH-01)
  const [activeshadeCode, setActiveshadeCode] = useState('')

  // Bus Booking App RedBus Style: Upper & Lower Deck Switcher ('ALL' | 'LOWER' | 'UPPER')
  const [selectedDeck, setSelectedDeck] = useState('ALL')

  // BookMyShow Style Quick Occupancy Filter ('ALL' | 'OCCUPIED' | 'EMPTY')
  const [occupancyFilter, setOccupancyFilter] = useState('ALL')

  // Filter & Search
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState('ALL')
  const [currentPage, setCurrentPage] = useState(1)
  const perPage = 10

  // Selected Cell for Bin Inspector / Edit Modal
  const [selectedCell, setSelectedCell] = useState(null)
  const [showEditCellModal, setShowEditCellModal] = useState(false)
  const [activeCellModalTab, setActiveCellModalTab] = useState('inspect') // 'inspect' | 'allocate'
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

  // Fetch real shade, Rack, GRN, & Product data from Mongo Backend API
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

      setshades(shadesData)
      setRacks(racksData)
      setGrns(grnsData)
      setProducts(prodsData)

      if (shadesData.length > 0 && !activeshadeCode) {
        setActiveshadeCode(shadesData[0].code)
      }
    } catch (err) {
      console.error('Failed to fetch location master data:', err)
      triggerToast('Failed to load sheds and racks from server', 'error')
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

          let status = 'Empty'
          let productName = ''
          let batchNo = ''
          let currentStock = 0
          let cellCode = existingCell?.code || defaultCode

          if (existingCell) {
            status = existingCell.status || 'Empty'
            productName = existingCell.productName || ''
            batchNo = existingCell.batchNo || ''
            currentStock = Number(existingCell.currentStock) || 0
          } else {
            // If cell not in rack.cells list, check GRN allocations
            const matchingGrn = allocatedFromGrn.find((a) => {
              if (!a.location) return false
              const locClean = a.location.toUpperCase().trim()
              if (locClean === cellCode.toUpperCase() || locClean === defaultCode.toUpperCase()) return true
              return false
            })

            if (matchingGrn) {
              status = 'Occupied'
              productName = matchingGrn.productName
              batchNo = matchingGrn.batchNo
              currentStock = Number(matchingGrn.quantity) || 1
            }
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
    const totalshadesCount = shades.length
    const totalRacksCount = racks.length
    return { totalBins, occupied, full, empty, blocked, totalshadesCount, totalRacksCount }
  }, [allLiveCells, shades, racks])

  // Current Active shade Object
  const currentActiveshade = useMemo(() => {
    return shades.find((s) => s.code === activeshadeCode) || shades[0]
  }, [shades, activeshadeCode])

  // Racks belonging to Active shade
  const activeshadeRacks = useMemo(() => {
    if (!activeshadeCode) return []
    return racks.filter(
      (r) => r.shadeCode === activeshadeCode || (currentActiveshade && r.shadeId === currentActiveshade._id)
    )
  }, [racks, activeshadeCode, currentActiveshade])

  // Compute Lower & Upper deck row distribution for any rack (Bus Booking App RedBus Style)
  const getDeckRows = (rackRows) => {
    const total = Number(rackRows) || 4
    if (total <= 2) {
      return { lower: [1], upper: [2] }
    }
    const mid = Math.ceil(total / 2)
    const lower = []
    const upper = []
    for (let i = 1; i <= total; i++) {
      if (i <= mid) lower.push(i)
      else upper.push(i)
    }
    return { lower, upper }
  }

  // Active Shed Cells
  const activeshadeCells = useMemo(() => {
    if (!activeshadeCode) return []
    return allLiveCells.filter(
      (c) => c.shadeCode === activeshadeCode || (currentActiveshade && c.shadeId === currentActiveshade._id)
    )
  }, [allLiveCells, activeshadeCode, currentActiveshade])

  // Active Shed Deck Statistics for RedBus / Bus Booking Switcher
  const deckStats = useMemo(() => {
    let lowerTotal = 0
    let lowerOccupied = 0
    let upperTotal = 0
    let upperOccupied = 0

    activeshadeRacks.forEach((rack) => {
      const { lower, upper } = getDeckRows(rack.rows)
      const rCells = activeshadeCells.filter(
        (c) =>
          String(c.rackId) === String(rack._id) ||
          (c.shadeCode === rack.shadeCode && c.rackNumber === rack.rackNumber)
      )
      rCells.forEach((c) => {
        const isOcc = c.status === 'Occupied' || c.status === 'Full' || Number(c.currentStock) > 0
        if (lower.includes(Number(c.row))) {
          lowerTotal++
          if (isOcc) lowerOccupied++
        } else if (upper.includes(Number(c.row))) {
          upperTotal++
          if (isOcc) upperOccupied++
        }
      })
    })

    return {
      lowerTotal,
      lowerOccupied,
      lowerEmpty: Math.max(0, lowerTotal - lowerOccupied),
      upperTotal,
      upperOccupied,
      upperEmpty: Math.max(0, upperTotal - upperOccupied),
      totalBins: lowerTotal + upperTotal,
      totalOccupied: lowerOccupied + upperOccupied,
      totalEmpty: Math.max(0, (lowerTotal + upperTotal) - (lowerOccupied + upperOccupied)),
    }
  }, [activeshadeRacks, activeshadeCells])

  // Hall Rack Alignment: Left Wall, Center Gangway, Right Wall (BookMyShow / Godown Floor Architecture)
  const hallLayout = useMemo(() => {
    const total = activeshadeRacks.length
    if (total === 0) return { left: [], center: [], right: [] }
    if (total === 1) return { left: [], center: activeshadeRacks, right: [] }
    if (total === 2) return { left: [activeshadeRacks[0]], center: [], right: [activeshadeRacks[1]] }
    if (total === 3) return { left: [activeshadeRacks[0]], center: [activeshadeRacks[1]], right: [activeshadeRacks[2]] }
    
    // 4 or more racks: split into Left and Right wings
    const mid = Math.ceil(total / 2)
    return {
      left: activeshadeRacks.slice(0, mid),
      center: [],
      right: activeshadeRacks.slice(mid),
    }
  }, [activeshadeRacks])

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

  // Searchable Product Options for direct slot allocation
  const productOptions = useMemo(() => {
    return [
      { value: '', label: '-- Select Item to Place in Bin --' },
      ...products.map((p) => ({
        value: p.name,
        label: `${p.name} (${p.sku || 'SKU'})`,
        sublabel: `Batch: ${p.batchNo || 'LOT-2026'} • Unit: ${p.baseUnit || 'Kg'} • Stock: ${p.currentStock || 0}`,
      })),
    ]
  }, [products])

  const handleProductSelectInCell = (prodName) => {
    const matched = products.find((p) => p.name === prodName)
    setCellFormData((prev) => ({
      ...prev,
      productName: prodName,
      batchNo: matched?.batchNo || prev.batchNo || 'BAT-2026-01',
      status: prodName ? (prev.status === 'Empty' ? 'Occupied' : prev.status) : 'Empty',
      currentStock: prev.currentStock > 0 ? prev.currentStock : (matched?.packSize ? matched.packSize * 10 : 50),
    }))
  }

  // Open Edit Cell Modal
  const handleInspectCell = (cell, defaultTab = 'inspect') => {
    setSelectedCell(cell)
    setActiveCellModalTab(defaultTab)
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

  // Quick 1-click vacate/clear slot
  const handleVacateCell = async () => {
    if (!selectedCell) return
    setSavingCell(true)
    try {
      await apiRequest(`/rack/${selectedCell.rackId}/cell`, {
        method: 'PATCH',
        body: JSON.stringify({
          cellCode: selectedCell.code,
          status: 'Empty',
          productName: '',
          batchNo: '',
          currentStock: 0,
        }),
      })
      await fetchMasterData()
      triggerToast(`Cell ${selectedCell.code} has been cleared to empty.`)
      setShowEditCellModal(false)
    } catch (err) {
      triggerToast(err.message || 'Failed to clear cell', 'error')
    } finally {
      setSavingCell(false)
    }
  }

  // Export CSV of real Mongo cells
  const handleExportCSV = () => {
    const headers = ['#', 'Cell Code', 'Shed', 'Rack', 'Row', 'Column', 'Product Name', 'Batch No', 'Current Stock', 'Status']
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

  // Render Individual Seat/Cell (BookMyShow / RedBus Sleeper Berth Style)
  const renderSeatCell = (cell, rowNum, colNum, isLowerDeck) => {
    const isOccupied = cell.status === 'Occupied' || cell.status === 'Full' || Number(cell.currentStock) > 0
    const isFull = cell.status === 'Full'
    const isBlocked = cell.status === 'Blocked'
    const isEmpty = !isOccupied && !isFull && !isBlocked

    // Check quick occupancy filter
    const isDimmed =
      (occupancyFilter === 'OCCUPIED' && isEmpty) ||
      (occupancyFilter === 'EMPTY' && !isEmpty)

    const esl = getEslInfo({ productName: cell.productName, batchNo: cell.batchNo })

    return (
      <div
        key={`${rowNum}-${colNum}`}
        onClick={() => handleInspectCell(cell)}
        title={`${cell.code} • ${isOccupied ? cell.productName + ' (' + cell.currentStock + ' qty)' : 'Available Empty Slot'}`}
        className={`relative group rounded-xl p-2.5 transition-all duration-200 cursor-pointer flex flex-col justify-between select-none shadow-xs min-h-[114px] min-w-[115px] border ${
          isDimmed ? 'opacity-20 grayscale scale-95' : ''
        } ${
          isFull
            ? 'bg-rose-600 text-white border-rose-500 shadow-rose-600/30 hover:scale-[1.02]'
            : isOccupied
            ? 'bg-emerald-600 text-white border-emerald-500 shadow-emerald-600/30 hover:scale-[1.02]'
            : isBlocked
            ? 'bg-amber-500 text-white border-amber-400 shadow-amber-500/30 hover:scale-[1.02]'
            : 'bg-white hover:bg-indigo-50/70 border-2 border-dashed border-slate-300 hover:border-indigo-400 text-slate-800 hover:scale-[1.02] shadow-2xs'
        }`}
      >
        {/* Top: Cell Code + Qty Pill / Status Badge */}
        <div className="flex items-center justify-between gap-1 w-full pb-1 border-b border-black/10">
          <span className={`text-[11px] font-mono font-black tracking-tight ${isEmpty ? 'text-slate-800' : 'text-white'}`}>
            R{rowNum}·C{colNum}
          </span>
          {isOccupied ? (
            <span className="text-[10px] font-black px-1.5 py-0.5 rounded-md bg-white text-emerald-800 shadow-2xs font-mono whitespace-nowrap">
              {cell.currentStock} Qty
            </span>
          ) : isFull ? (
            <span className="text-[9px] font-black px-1.5 py-0.5 rounded-md bg-white text-rose-800 uppercase whitespace-nowrap">
              Full
            </span>
          ) : isBlocked ? (
            <span className="text-[9px] font-black px-1.5 py-0.5 rounded-md bg-white text-amber-800 uppercase whitespace-nowrap">
              Hold
            </span>
          ) : (
            <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-md bg-slate-100 text-slate-600 border border-slate-200 uppercase whitespace-nowrap">
              Empty
            </span>
          )}
        </div>

        {/* Middle: Product Name or Empty Indicator */}
        <div className="my-1.5 min-h-[38px] flex flex-col justify-center">
          {cell.productName ? (
            <div>
              <p className="text-xs font-bold leading-tight line-clamp-2 text-white drop-shadow-2xs" title={cell.productName}>
                {cell.productName}
              </p>
              {cell.batchNo && (
                <p className="text-[10px] font-mono text-emerald-100 truncate mt-0.5" title={`Batch: ${cell.batchNo}`}>
                  Bth: {cell.batchNo}
                </p>
              )}
            </div>
          ) : (
            <div className="py-1 text-center">
              <p className="text-xs font-bold text-slate-700">Empty Slot</p>
              <p className="text-[10px] text-slate-400">Available Bin</p>
            </div>
          )}
        </div>

        {/* Bottom Bar: Position & ESL / Deck Level */}
        <div className={`text-[9px] font-mono flex items-center justify-between pt-1 border-t gap-1 ${
          isEmpty ? 'border-slate-100 text-slate-500' : 'border-white/20 text-white/90'
        }`}>
          {isOccupied ? (
            <>
              <span className="text-[9px] font-sans font-bold bg-white/20 px-1 py-0.2 rounded truncate" title={esl.fullBadge}>
                {esl.eslText}
              </span>
              <span className="text-[9px] font-sans font-semibold text-emerald-100 whitespace-nowrap">
                {isLowerDeck ? 'Lower Deck' : 'Upper Deck'}
              </span>
            </>
          ) : (
            <>
              <span className="text-[9px] font-sans text-slate-500 whitespace-nowrap">
                Shelf {colNum}
              </span>
              <span className="text-[9px] font-sans font-semibold text-indigo-600 whitespace-nowrap">
                {isLowerDeck ? 'Lower Deck' : 'Upper Deck'}
              </span>
            </>
          )}
        </div>
      </div>
    )
  }

  // Render Individual Storage Rack Unit
  const renderRackBlock = (rack, wingLabel = '') => {
    const rackCells = allLiveCells.filter(
      (c) =>
        String(c.rackId) === String(rack._id) ||
        (c.shadeCode === rack.shadeCode && c.rackNumber === rack.rackNumber)
    )

    const { lower, upper } = getDeckRows(rack.rows)

    // Filter rows based on selectedDeck
    let activeRows = []
    if (selectedDeck === 'LOWER') {
      activeRows = lower
    } else if (selectedDeck === 'UPPER') {
      activeRows = upper
    } else {
      activeRows = Array.from({ length: Number(rack.rows) || 4 }, (_, i) => i + 1)
    }

    const rackOccupiedCount = rackCells.filter(
      (c) => c.status === 'Occupied' || c.status === 'Full' || Number(c.currentStock) > 0
    ).length

    return (
      <div key={rack._id || rack.rackNumber} className="bg-slate-50/95 rounded-2xl p-4 border border-slate-200 shadow-xs space-y-3.5">
        {/* Rack Header */}
        <div className="flex items-center justify-between border-b border-slate-200/80 pb-2.5">
          <div className="flex items-center gap-2">
            <span className="font-mono font-bold text-xs bg-indigo-600 text-white px-2.5 py-1 rounded-lg shadow-2xs">
              {rack.shadeCode} - {rack.rackNumber}
            </span>
            <div>
              <h4 className="text-xs font-bold text-slate-900 leading-tight">
                {(rack.description || `Storage Rack ${rack.rackNumber}`).replace(/shade/gi, 'Shed')}
              </h4>
              <p className="text-[10px] text-slate-500 font-mono">
                {rack.rows} Rows × {rack.columns} Cols • {rackOccupiedCount}/{rackCells.length} Bins Occupied {wingLabel ? `(${wingLabel})` : ''}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => {
              const firstCell = rackCells[0]
              if (firstCell) handleInspectCell(firstCell)
            }}
            className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 flex items-center gap-1 cursor-pointer bg-white px-2.5 py-1 rounded-lg border border-slate-200 shadow-2xs hover:bg-slate-50 transition"
          >
            <Eye className="w-3.5 h-3.5" />
            <span>Inspect</span>
          </button>
        </div>

        {/* Rows & Shelves Elevation Grid */}
        <div className="space-y-3">
          {activeRows.map((rowNum) => {
            const isLower = lower.includes(rowNum)
            return (
              <div key={rowNum} className="space-y-1">
                {/* Row Deck Header */}
                <div className="flex items-center justify-between text-[10px] px-1 font-mono text-slate-500 font-bold">
                  <span className="flex items-center gap-1.5">
                    <span className={`w-1.5 h-1.5 rounded-full ${isLower ? 'bg-blue-500' : 'bg-purple-500'}`} />
                    <span className="text-slate-800">Row {rowNum}</span>
                    <span
                      className={`text-[9px] px-1.5 py-0.2 rounded font-sans font-semibold ${
                        isLower
                          ? 'bg-blue-50 text-blue-700 border border-blue-200'
                          : 'bg-purple-50 text-purple-700 border border-purple-200'
                      }`}
                    >
                      {isLower ? 'Lower Deck' : 'Upper Deck'}
                    </span>
                  </span>
                  <span className="text-[9px] text-slate-400">
                    {rack.columns} Shelf Slots
                  </span>
                </div>

                {/* Columns / Slots Grid with Minimum Width for Spacious Cards */}
                <div className="overflow-x-auto pb-1.5 scrollbar-thin">
                  <div className="grid grid-cols-6 gap-2.5 min-w-[740px]">
                    {Array.from({ length: Number(rack.columns) || 6 }).map((_, cIdx) => {
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
                          shadeCode: rack.shadeCode,
                          rackNumber: rack.rackNumber,
                        }

                      return renderSeatCell(cell, rowNum, colNum, isLower)
                    })}
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    )
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
            <span>Shed Master</span>
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
            <p className="text-[11px] text-indigo-600 font-medium">Across {stats.totalRacksCount} racks in {stats.totalshadesCount} sheds</p>
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

      {/* Dynamic Shed Selector Cards (Interactive Visual Godown Units) */}
      <div className="space-y-2.5">
        <div className="flex items-center justify-between px-1">
          <div className="flex items-center gap-2">
            <Warehouse className="w-4 h-4 text-indigo-600" />
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700">
              Select Warehouse Shed
            </h3>
            <span className="text-[11px] font-semibold text-slate-500">
              ({shades.length} Sheds Online)
            </span>
          </div>
          <span className="text-[11px] text-indigo-600 font-medium hidden sm:inline">
            Click any Shed box below to switch active shed layout
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          {shades.length === 0 ? (
            <div className="col-span-full text-xs text-slate-400 p-4 bg-white rounded-2xl border border-slate-200">
              Loading sheds from MongoDB...
            </div>
          ) : (
            shades.map((s) => {
              const isActive = activeshadeCode === s.code
              const shedCells = allLiveCells.filter((c) => c.shadeCode === s.code || c.shadeId === s._id)
              const occupiedCount = shedCells.filter((c) => c.status === 'Occupied' || c.status === 'Full' || Number(c.currentStock) > 0).length
              const utilPercent = shedCells.length > 0 ? Math.round((occupiedCount / shedCells.length) * 100) : 0
              const shedRacksCount = racks.filter((r) => r.shadeCode === s.code || r.shadeId === s._id).length
              const totalStockUnits = shedCells.reduce((sum, c) => sum + (Number(c.currentStock) || 0), 0)
              const cleanShedName = (s.name || '').replace(/shade/gi, 'Shed')

              return (
                <div
                  key={s._id || s.code}
                  onClick={() => {
                    setActiveshadeCode(s.code)
                    triggerToast(`Switched view to ${cleanShedName}`)
                  }}
                  className={`relative p-3.5 rounded-2xl transition-all duration-200 cursor-pointer flex flex-col justify-between border select-none group shadow-xs ${
                    isActive
                      ? 'bg-white border-indigo-600 ring-2 ring-indigo-600/30 shadow-md'
                      : 'bg-white hover:bg-slate-50 border-slate-200/90 hover:border-slate-300'
                  }`}
                >
                  {/* Top: Shed Badge + Occupancy Tag */}
                  <div className="flex items-center justify-between gap-2 pb-2 border-b border-slate-100">
                    <div className="flex items-center gap-2 min-w-0">
                      <span className={`w-7 h-7 rounded-lg flex items-center justify-center font-mono font-black text-xs shrink-0 ${
                        isActive ? 'bg-indigo-600 text-white' : 'bg-slate-900 text-white group-hover:bg-indigo-600 transition'
                      }`}>
                        {s.code.replace('SH-', 'S')}
                      </span>
                      <div className="min-w-0">
                        <h4 className={`text-xs font-bold truncate ${isActive ? 'text-indigo-900 font-extrabold' : 'text-slate-800'}`} title={cleanShedName}>
                          {cleanShedName}
                        </h4>
                        <p className="text-[10px] text-slate-400 font-mono">
                          {s.code} • {shedRacksCount} Racks
                        </p>
                      </div>
                    </div>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full shrink-0 font-mono ${
                      utilPercent > 80 ? 'bg-rose-50 text-rose-700 border border-rose-200' :
                      utilPercent > 0 ? 'bg-indigo-50 text-indigo-700 border border-indigo-200' :
                      'bg-slate-100 text-slate-600 border border-slate-200'
                    }`}>
                      {utilPercent}%
                    </span>
                  </div>

                  {/* Mini Rack Slot Visualization (2 rows of 6 dots) */}
                  <div className="my-2.5 p-2 bg-slate-50/80 rounded-xl border border-slate-100">
                    <div className="flex items-center justify-between text-[9px] font-mono text-slate-400 mb-1.5 uppercase">
                      <span>Racks: {shedRacksCount}</span>
                      <span>{occupiedCount}/{shedCells.length} Bins</span>
                    </div>
                    <div className="grid grid-cols-6 gap-1">
                      {Array.from({ length: 12 }).map((_, i) => {
                        const filledRatio = shedCells.length > 0 ? (occupiedCount / shedCells.length) * 12 : 0
                        const filled = occupiedCount > 0 ? i < Math.max(1, Math.round(filledRatio)) : false
                        return (
                          <div
                            key={i}
                            className={`h-2 rounded-xs transition-colors ${
                              filled ? 'bg-indigo-600' : 'bg-slate-200'
                            }`}
                          />
                        )
                      })}
                    </div>
                  </div>

                  {/* Progress Bar & Available Space */}
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between text-[10px]">
                      <span className="text-slate-500 font-medium">Stock:</span>
                      <span className="font-mono font-bold text-slate-800">
                        {totalStockUnits} Qty
                      </span>
                    </div>
                    <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-indigo-600 rounded-full transition-all duration-300"
                        style={{ width: `${Math.min(100, Math.max(utilPercent, occupiedCount > 0 ? 5 : 0))}%` }}
                      />
                    </div>
                    <div className="flex items-center justify-between text-[9px] pt-1">
                      <span className={`font-semibold ${isActive ? 'text-indigo-600' : 'text-slate-500'}`}>
                        {isActive ? '● Active Blueprint' : 'Click to Inspect'}
                      </span>
                      <span className="text-slate-400 font-mono">
                        {Math.max(0, shedCells.length - occupiedCount)} Empty
                      </span>
                    </div>
                  </div>
                </div>
              )
            })
          )}
        </div>
      </div>

      {/* Main Visual Matrix for Selected Shed - Visual Slot & Deck Layout */}
      <div className="bg-white rounded-3xl p-4 sm:p-6 shadow-xs border border-slate-200/80 space-y-5">
        {/* Header of Selected Shed */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-slate-100">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-lg text-xs font-mono font-bold bg-indigo-50 text-indigo-700 border border-indigo-200">
                {currentActiveshade ? currentActiveshade.code : 'SHED'}
              </span>
              <h2 className="text-base sm:text-lg font-bold text-slate-900 tracking-tight">
                {currentActiveshade ? `${currentActiveshade.code}: ${(currentActiveshade.name || '').replace(/shade/gi, 'Shed')}` : 'Warehouse Shed Layout'}
              </h2>
            </div>
            <p className="text-xs text-slate-500 mt-1 font-medium">
              {currentActiveshade ? (currentActiveshade.description || '').replace(/shade/gi, 'Shed') : ''} • {activeshadeRacks.length} Physical Racks Installed
            </p>
          </div>

          {/* Upper & Lower Deck Switcher (Bus Booking App / RedBus Sleeper Style) */}
          <div className="bg-slate-100 p-1.5 rounded-2xl flex flex-wrap items-center gap-1.5 shadow-inner">
            <button
              type="button"
              onClick={() => {
                setSelectedDeck('LOWER')
                triggerToast('Switched to LOWER DECK (Tier 1 • Ground Level / Heavy Pallets)')
              }}
              className={`flex-1 sm:flex-initial px-3.5 py-2 rounded-xl text-xs font-bold transition flex items-center justify-center gap-2 cursor-pointer ${
                selectedDeck === 'LOWER'
                  ? 'bg-blue-600 text-white shadow-sm ring-2 ring-blue-600/30'
                  : 'bg-white text-slate-700 hover:bg-slate-50 border border-slate-200'
              }`}
            >
              <span>🚌 Lower Deck (Tier 1)</span>
              <span
                className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono font-semibold ${
                  selectedDeck === 'LOWER' ? 'bg-white/20 text-white' : 'bg-blue-50 text-blue-700'
                }`}
              >
                {deckStats.lowerOccupied} / {deckStats.lowerTotal} Bins
              </span>
            </button>

            <button
              type="button"
              onClick={() => {
                setSelectedDeck('UPPER')
                triggerToast('Switched to UPPER DECK (Tier 2 • Top Elevation / Buffer Pallets)')
              }}
              className={`flex-1 sm:flex-initial px-3.5 py-2 rounded-xl text-xs font-bold transition flex items-center justify-center gap-2 cursor-pointer ${
                selectedDeck === 'UPPER'
                  ? 'bg-purple-600 text-white shadow-sm ring-2 ring-purple-600/30'
                  : 'bg-white text-slate-700 hover:bg-slate-50 border border-slate-200'
              }`}
            >
              <span>🛏️ Upper Deck (Tier 2)</span>
              <span
                className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono font-semibold ${
                  selectedDeck === 'UPPER' ? 'bg-white/20 text-white' : 'bg-purple-50 text-purple-700'
                }`}
              >
                {deckStats.upperOccupied} / {deckStats.upperTotal} Bins
              </span>
            </button>

            <button
              type="button"
              onClick={() => {
                setSelectedDeck('ALL')
                triggerToast('Viewing Both Upper & Lower Decks')
              }}
              className={`flex-1 sm:flex-initial px-3.5 py-2 rounded-xl text-xs font-bold transition flex items-center justify-center gap-2 cursor-pointer ${
                selectedDeck === 'ALL'
                  ? 'bg-indigo-600 text-white shadow-sm ring-2 ring-indigo-600/30'
                  : 'bg-white text-slate-700 hover:bg-slate-50 border border-slate-200'
              }`}
            >
              <span>🏢 Both Decks</span>
              <span
                className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono font-semibold ${
                  selectedDeck === 'ALL' ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-700'
                }`}
              >
                {deckStats.totalOccupied} / {deckStats.totalBins}
              </span>
            </button>
          </div>
        </div>

        {/* Quick Filter & Legend Bar (BookMyShow Style) */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 bg-slate-50 p-3 rounded-2xl border border-slate-200/80">
          <div className="flex items-center gap-1.5 text-xs">
            <span className="text-slate-500 font-semibold mr-1 flex items-center gap-1">
              <Filter className="w-3.5 h-3.5 text-slate-400" />
              <span>Filter:</span>
            </span>
            <button
              type="button"
              onClick={() => setOccupancyFilter('ALL')}
              className={`px-3 py-1 rounded-lg font-bold text-xs transition cursor-pointer ${
                occupancyFilter === 'ALL' ? 'bg-slate-800 text-white shadow-xs' : 'bg-white text-slate-600 hover:bg-slate-200/80 border border-slate-200'
              }`}
            >
              All Bins ({deckStats.totalBins})
            </button>
            <button
              type="button"
              onClick={() => setOccupancyFilter('OCCUPIED')}
              className={`px-3 py-1 rounded-lg font-bold text-xs transition cursor-pointer flex items-center gap-1.5 ${
                occupancyFilter === 'OCCUPIED' ? 'bg-emerald-600 text-white shadow-xs' : 'bg-white text-emerald-700 hover:bg-emerald-50 border border-emerald-200'
              }`}
            >
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
              <span>Occupied ({deckStats.totalOccupied})</span>
            </button>
            <button
              type="button"
              onClick={() => setOccupancyFilter('EMPTY')}
              className={`px-3 py-1 rounded-lg font-bold text-xs transition cursor-pointer flex items-center gap-1.5 ${
                occupancyFilter === 'EMPTY' ? 'bg-indigo-600 text-white shadow-xs' : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-300'
              }`}
            >
              <span className="w-2 h-2 rounded-full bg-slate-400" />
              <span>Empty Bins ({deckStats.totalEmpty})</span>
            </button>
          </div>

          {/* Color Indicators Legend */}
          <div className="flex flex-wrap items-center gap-2 text-xs font-semibold">
            <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-700 border border-emerald-200 shadow-2xs">
              <span className="w-2.5 h-2.5 rounded bg-emerald-600" />
              <span>Occupied</span>
            </span>
            <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-white text-slate-700 border-2 border-dashed border-slate-300 shadow-2xs">
              <span className="w-2.5 h-2.5 rounded border border-dashed border-slate-400 bg-white" />
              <span>Available (Empty Bins)</span>
            </span>
            <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-rose-50 text-rose-700 border border-rose-200 shadow-2xs">
              <span className="w-2.5 h-2.5 rounded bg-rose-500" />
              <span>Full Capacity</span>
            </span>
            <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-amber-50 text-amber-700 border border-amber-200 shadow-2xs">
              <span className="w-2.5 h-2.5 rounded bg-amber-500" />
              <span>Blocked / Hold</span>
            </span>
          </div>
        </div>

        {/* Render Racks inside Selected Shed */}
        {loading ? (
          <DataLoader
            text="Loading Warehouse Shed &amp; Rack Blueprint..."
            subtext="Syncing Warehouse Layout &amp; Upper/Lower Decks..."
            size="md"
          />
        ) : activeshadeRacks.length === 0 ? (
          <div className="py-16 text-center text-slate-400 text-sm space-y-3">
            <p>No Racks configured for this shed in MongoDB yet.</p>
            <Link
              to="/rack-mgmt"
              className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white font-bold text-xs rounded-xl hover:bg-indigo-700 transition"
            >
              <Plus className="w-4 h-4" />
              <span>Add Racks to {activeshadeCode}</span>
            </Link>
          </div>
        ) : (
          /* THE PHYSICAL GODOWN HALL BLUEPRINT */
          <div className="bg-slate-900 rounded-3xl p-4 sm:p-6 border-2 border-slate-800 shadow-xl space-y-5 text-white">
            {/* SHED TITLE & IDENTITY HEADER */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-slate-700/80 gap-3">
              <div className="flex items-center gap-3">
                <span className="px-3 py-1 rounded-xl font-mono font-black text-sm bg-indigo-600 text-white shadow-xs">
                  {currentActiveshade ? currentActiveshade.code : 'SHED'}
                </span>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-base font-black text-white tracking-tight">
                      {currentActiveshade ? (currentActiveshade.name || '').replace(/shade/gi, 'Shed') : 'Warehouse Storage Hall'}
                    </h3>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                      LIVE FLOOR MAP
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 mt-0.5">
                    {currentActiveshade ? (currentActiveshade.description || '').replace(/shade/gi, 'Shed') : ''} • {activeshadeRacks.length} Storage Racks Installed
                  </p>
                </div>
              </div>

              {/* Switch Sheds Shortcut Pills */}
              <div className="flex items-center gap-1.5 bg-slate-800/80 p-1.5 rounded-xl border border-slate-700/80 overflow-x-auto no-scrollbar">
                <span className="text-[10px] font-bold text-slate-400 uppercase px-1">Switch Shed:</span>
                {shades.map((s) => (
                  <button
                    key={s.code}
                    type="button"
                    onClick={() => setActiveshadeCode(s.code)}
                    className={`px-2.5 py-1 rounded-lg text-xs font-mono font-bold transition cursor-pointer ${
                      activeshadeCode === s.code
                        ? 'bg-indigo-600 text-white shadow-xs'
                        : 'text-slate-400 hover:text-white hover:bg-slate-700'
                    }`}
                  >
                    {s.code}
                  </button>
                ))}
              </div>
            </div>

            {/* FRONT: MAIN SHUTTER & UNLOADING DOCK (GATE 01) */}
            <div className="bg-gradient-to-r from-slate-800 via-slate-800/90 to-slate-800 border border-slate-700/80 rounded-2xl p-3 text-center shadow-inner relative overflow-hidden">
              <div className="flex items-center justify-center gap-3 text-xs sm:text-sm font-black tracking-widest text-amber-400 uppercase">
                <Truck className="w-4 h-4 text-amber-400 animate-pulse shrink-0" />
                <span>▲ MAIN ENTRY SHUTTER • UNLOADING DOCK (GATE 01) • ALL GOODS INWARD ▲</span>
                <Truck className="w-4 h-4 text-amber-400 -scale-x-100 animate-pulse shrink-0" />
              </div>
              <p className="text-[10px] text-slate-400 mt-0.5">
                All primary stock inward receiving and dispatch loading routes through this bay
              </p>
            </div>

            {/* Active Deck Elevation Subheader */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between bg-slate-800/60 px-4 py-2 rounded-xl border border-slate-700/60 text-xs gap-2">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
                <span className="font-bold text-slate-200">
                  {selectedDeck === 'LOWER' ? 'Viewing LOWER DECK (Tier 1 • Ground Level / Heavy Pallets - Rows 1 & 2)' :
                   selectedDeck === 'UPPER' ? 'Viewing UPPER DECK (Tier 2 • Top Elevation / Buffer Pallets - Rows 3 & 4)' :
                   'Viewing BOTH DECKS (Complete Multi-Tier Floor Plan)'}
                </span>
              </div>
              <div className="flex items-center gap-3 text-[11px] font-mono text-slate-300">
                <span>Hall Height: 6.5m Clearance</span>
                <span>•</span>
                <span className="text-emerald-400 font-bold">{deckStats.totalOccupied} Occupied</span>
                <span>•</span>
                <span className="text-slate-400 font-bold">{deckStats.totalEmpty} Available</span>
              </div>
            </div>

            {/* GODOWN HALL BLUEPRINT GRID: LEFT WALL, GANGWAY, RIGHT WALL */}
            <div className="grid grid-cols-1 lg:grid-cols-11 gap-4 items-stretch">
              {/* LEFT WING RACKS (Kinara 1 - Left Wall) */}
              <div className={hallLayout.center.length > 0 && hallLayout.left.length === 0 ? 'hidden' : 'lg:col-span-5 space-y-3.5'}>
                <div className="flex items-center justify-between text-[11px] font-bold text-indigo-300 border-b border-slate-800 pb-1.5 px-1">
                  <span>⬅️ WEST WING / LEFT WALL (BAYS A)</span>
                  <span className="text-[10px] font-mono text-slate-400">{hallLayout.left.length} Racks</span>
                </div>
                {hallLayout.left.map((rack) => renderRackBlock(rack, 'Left Wall'))}
              </div>

              {/* CENTRAL FORKLIFT GANGWAY / BEECH KA RASTA */}
              {hallLayout.left.length > 0 && hallLayout.right.length > 0 && (
                <div className="lg:col-span-1 hidden lg:flex flex-col items-center justify-between py-6 px-1 bg-slate-800/60 rounded-2xl border-2 border-dashed border-amber-500/60 text-center select-none shadow-inner">
                  <div className="flex flex-col items-center gap-1 text-amber-400">
                    <ArrowUp className="w-4 h-4 text-amber-400 animate-bounce" />
                    <span className="text-[9px] font-black tracking-widest uppercase bg-amber-500/20 px-1.5 py-0.5 rounded border border-amber-500/30">
                      INWARD
                    </span>
                  </div>

                  <div className="flex flex-col items-center gap-2.5 my-auto">
                    <div className="w-0.5 h-10 border-l-2 border-dashed border-amber-400/60" />
                    <span className="text-[9px] font-black text-amber-300 uppercase tracking-wider bg-slate-950 px-2 py-1 rounded border border-amber-500/40 shadow-xs whitespace-nowrap">
                      4.5M FORKLIFT
                    </span>
                    <span className="text-[8px] font-mono font-bold text-slate-300 uppercase tracking-widest whitespace-nowrap">
                      CENTRAL AISLE
                    </span>
                    <div className="w-0.5 h-10 border-l-2 border-dashed border-amber-400/60" />
                    <span className="text-[9px] font-black text-amber-300 uppercase tracking-wider bg-slate-950 px-2 py-1 rounded border border-amber-500/40 shadow-xs whitespace-nowrap">
                      KEEP CLEAR
                    </span>
                    <div className="w-0.5 h-10 border-l-2 border-dashed border-amber-400/60" />
                  </div>

                  <div className="flex flex-col items-center gap-1 text-amber-400">
                    <span className="text-[9px] font-black tracking-widest uppercase bg-amber-500/20 px-1.5 py-0.5 rounded border border-amber-500/30">
                      OUTWARD
                    </span>
                    <ArrowDown className="w-4 h-4 text-amber-400 animate-bounce" />
                  </div>
                </div>
              )}

              {/* CENTER RACKS (IF SINGLE OR 3 RACKS) */}
              {hallLayout.center.length > 0 && (
                <div className={hallLayout.left.length === 0 && hallLayout.right.length === 0 ? 'lg:col-span-11 space-y-3.5' : 'lg:col-span-3 space-y-3.5'}>
                  <div className="flex items-center justify-between text-[11px] font-bold text-amber-300 border-b border-slate-800 pb-1.5 px-1">
                    <span>↔️ CENTER ISLAND (BAY C)</span>
                    <span className="text-[10px] font-mono text-slate-400">{hallLayout.center.length} Racks</span>
                  </div>
                  {hallLayout.center.map((rack) => renderRackBlock(rack, 'Center Island'))}
                </div>
              )}

              {/* RIGHT WING RACKS (Kinara 2 - Right Wall) */}
              <div className={hallLayout.center.length > 0 && hallLayout.right.length === 0 ? 'hidden' : 'lg:col-span-5 space-y-3.5'}>
                <div className="flex items-center justify-between text-[11px] font-bold text-indigo-300 border-b border-slate-800 pb-1.5 px-1">
                  <span>EAST WING / RIGHT WALL (BAYS B) ➡️</span>
                  <span className="text-[10px] font-mono text-slate-400">{hallLayout.right.length} Racks</span>
                </div>
                {hallLayout.right.map((rack) => renderRackBlock(rack, 'Right Wall'))}
              </div>
            </div>

            {/* REAR EMERGENCY FIRE EXIT & BUFFER ZONE */}
            <div className="bg-slate-800/60 border border-slate-700/60 rounded-2xl p-2.5 text-center">
              <div className="flex items-center justify-center gap-2 text-[11px] font-bold tracking-wider text-rose-400 uppercase">
                <span>▼ 🚪 REAR WALL • EMERGENCY FIRE EXIT & INTERNAL BUFFER STAGING AREA ▼</span>
              </div>
            </div>
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
            <DataLoader
              text="Loading Location Cells & Inventory Allocations..."
              subtext="Fetching mapped products, batch balances, and bin coordinates..."
              size="md"
            />
          ) : filteredCells.length === 0 ? (
            <div className="py-16 text-center text-slate-400 text-sm">No cells match your filter.</div>
          ) : (
            <table className="w-full text-left text-xs divide-y divide-slate-200">
              <thead className="bg-slate-50/80 text-slate-600 font-bold uppercase tracking-wider text-[11px]">
                <tr>
                  <th className="py-3.5 px-4 w-12 text-center">#</th>
                  <th className="py-3.5 px-4 min-w-[140px]">Cell Code</th>
                  <th className="py-3.5 px-4 min-w-[100px]">Shed</th>
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
                    <td className="py-3.5 px-4">
                      <div className="font-semibold text-slate-800">{row.productName || '—'}</div>
                      {row.productName && (
                        <div className="text-[10px] text-slate-500 font-mono mt-0.5">
                          EXP: {getEslInfo({ productName: row.productName, batchNo: row.batchNo }).expiryFormatted}
                          <span className="ml-1 text-indigo-600 font-semibold">({getEslInfo({ productName: row.productName, batchNo: row.batchNo }).eslText})</span>
                        </div>
                      )}
                    </td>
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

      {/* Bin Details & Inspector / Allocation Modal (BookMyShow & RedBus Style) */}
      {showEditCellModal && selectedCell && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl max-w-lg w-full p-5 sm:p-6 shadow-2xl border border-slate-200 space-y-4">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center shadow-xs">
                  <MapPin className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-extrabold text-base text-slate-800">
                      Bin Location Manager
                    </h3>
                    <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-md bg-indigo-50 text-indigo-700 border border-indigo-200">
                      {selectedCell.code}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 font-medium">
                    {selectedCell.shadeName || selectedCell.shadeCode} • Rack {selectedCell.rackNumber}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowEditCellModal(false)}
                className="text-slate-400 hover:text-slate-700 p-1.5 rounded-lg hover:bg-slate-100 cursor-pointer transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Navigation Tabs inside Modal */}
            <div className="flex border-b border-slate-200 bg-slate-50/80 p-1 rounded-xl gap-1">
              <button
                type="button"
                onClick={() => setActiveCellModalTab('inspect')}
                className={`flex-1 py-2 rounded-lg text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer ${
                  activeCellModalTab === 'inspect'
                    ? 'bg-white text-indigo-700 shadow-xs border border-slate-200'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                <Eye className="w-3.5 h-3.5" />
                <span>1. Bin Inspection &amp; QR</span>
              </button>
              <button
                type="button"
                onClick={() => setActiveCellModalTab('allocate')}
                className={`flex-1 py-2 rounded-lg text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer ${
                  activeCellModalTab === 'allocate'
                    ? 'bg-indigo-600 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                <Edit2 className="w-3.5 h-3.5" />
                <span>2. Put-in / Slot Update</span>
              </button>
            </div>

            {/* TAB 1: INSPECTION & QR CODE */}
            {activeCellModalTab === 'inspect' && (
              <div className="space-y-3.5 text-xs animate-in fade-in">
                {/* Facility & Grid Info */}
                <div className="grid grid-cols-2 gap-2 bg-slate-50 p-3 rounded-xl border border-slate-200/80">
                  <div>
                    <span className="text-[10px] text-slate-400 uppercase font-bold block">Facility / Shed</span>
                    <strong className="text-slate-800 text-[11px] truncate block">{selectedCell.shadeName || selectedCell.shadeCode}</strong>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 uppercase font-bold block">Position &amp; Level</span>
                    <span className="font-mono font-semibold text-slate-800 text-[11px]">
                      Row {selectedCell.row} • Shelf {selectedCell.col}
                    </span>
                    <span className={`text-[10px] font-bold block mt-0.5 ${Number(selectedCell.row) <= 2 ? 'text-blue-700' : 'text-purple-700'}`}>
                      {Number(selectedCell.row) <= 2 ? '🚌 Lower Deck (Tier 1 Ground Level)' : '🛏️ Upper Deck (Tier 2 Upper Elevation)'}
                    </span>
                  </div>
                </div>

                {/* Status & Inventory Data */}
                {selectedCell.status === 'Occupied' || selectedCell.status === 'Full' || Number(selectedCell.currentStock) > 0 ? (
                  <div className="p-4 bg-emerald-50/70 border border-emerald-200 rounded-xl space-y-2.5">
                    <div className="flex items-center justify-between">
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-600 text-white shadow-xs">
                        <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
                        Occupied
                      </span>
                      <span className="text-xs font-mono font-black text-emerald-800 bg-white px-2 py-0.5 rounded-md border border-emerald-200 shadow-2xs">
                        Stock: {selectedCell.currentStock || 0} Units
                      </span>
                    </div>

                    <div className="pt-1 space-y-1.5 text-xs">
                      <div className="flex justify-between">
                        <span className="text-slate-600">Product:</span>
                        <strong className="text-slate-900 text-right truncate max-w-[240px]">{selectedCell.productName}</strong>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-600">Batch Number:</span>
                        <strong className="font-mono text-slate-800">{selectedCell.batchNo || 'N/A'}</strong>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-600">Expiry Date / ESL:</span>
                        <strong className="font-mono text-indigo-700">
                          {getEslInfo({ productName: selectedCell.productName, batchNo: selectedCell.batchNo }).fullBadge}
                        </strong>
                      </div>
                    </div>

                    <div className="text-[11px] text-emerald-700 font-medium pt-2 border-t border-emerald-200/60 flex items-center justify-between">
                      <span className="flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                        <span>Ready for Outward Issue / Dispatch</span>
                      </span>
                      <button
                        type="button"
                        onClick={handleVacateCell}
                        disabled={savingCell}
                        className="text-[10px] font-bold text-rose-600 hover:text-rose-800 hover:underline cursor-pointer"
                      >
                        Vacate Slot
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="p-5 bg-slate-50 border-2 border-dashed border-slate-300 rounded-xl text-center space-y-2">
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-slate-200 text-slate-700">
                      Empty Slot (Available)
                    </span>
                    <p className="text-xs text-slate-500 max-w-xs mx-auto">
                      This slot is currently empty. You can allocate inventory here via Put-in Check-in or direct allocation.
                    </p>
                    <button
                      type="button"
                      onClick={() => setActiveCellModalTab('allocate')}
                      className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-indigo-600 text-white text-xs font-bold hover:bg-indigo-700 shadow-xs cursor-pointer transition"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Place Stock in this Bin</span>
                    </button>
                  </div>
                )}

                {/* Footer Actions */}
                <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => setActiveCellModalTab('allocate')}
                    className="inline-flex items-center gap-1.5 px-3.5 py-2 border border-slate-300 hover:bg-slate-100 text-slate-700 rounded-xl text-xs font-bold transition cursor-pointer"
                  >
                    <Edit2 className="w-3.5 h-3.5 text-slate-500" />
                    <span>Edit / Put-in</span>
                  </button>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setShowEditCellModal(false)}
                      className="px-4 py-2 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 hover:bg-slate-50 cursor-pointer"
                    >
                      Close
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setShowEditCellModal(false)
                        handleOpenQrModal(selectedCell)
                      }}
                      className="inline-flex items-center gap-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition shadow-xs cursor-pointer"
                    >
                      <QrCode className="w-4 h-4" />
                      <span>Print Bin QR Tag</span>
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* TAB 2: QUICK ALLOCATION / PUT-IN FORM */}
            {activeCellModalTab === 'allocate' && (
              <form onSubmit={handleSaveCell} className="space-y-3.5 text-xs animate-in fade-in">
                <div className="p-3 bg-indigo-50/70 border border-indigo-100 rounded-xl flex items-center justify-between text-xs">
                  <div>
                    <span className="text-[10px] text-indigo-500 uppercase font-bold block">Target Coordinate</span>
                    <strong className="text-indigo-900 font-mono text-sm">{cellFormData.cellCode}</strong>
                  </div>
                  <span className="px-2 py-0.5 bg-white border border-indigo-200 text-indigo-700 font-bold rounded text-[10px]">
                    {Number(selectedCell.row) <= 2 ? 'Lower Deck' : 'Upper Deck'}
                  </span>
                </div>

                {/* Product Selector */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Select Product to Store in Bin <span className="text-rose-500">*</span>
                  </label>
                  <CustomSelect
                    value={cellFormData.productName}
                    onChange={(val) => handleProductSelectInCell(val)}
                    options={productOptions}
                    placeholder="Choose product from catalog..."
                    zIndexClass="z-30"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Batch / Lot Number
                    </label>
                    <input
                      type="text"
                      value={cellFormData.batchNo}
                      onChange={(e) => setCellFormData({ ...cellFormData, batchNo: e.target.value })}
                      placeholder="e.g. BAT-2026-001"
                      className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs font-mono font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Stock Quantity (Units)
                    </label>
                    <input
                      type="number"
                      min="0"
                      max="100000"
                      value={cellFormData.currentStock}
                      onChange={(e) => setCellFormData({ ...cellFormData, currentStock: Number(e.target.value) || 0 })}
                      className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs font-bold font-mono text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Cell Status
                  </label>
                  <CustomSelect
                    value={cellFormData.status}
                    onChange={(val) => setCellFormData({ ...cellFormData, status: val })}
                    options={[
                      { value: 'Empty', label: 'Empty (Available)', sublabel: 'Available for fresh check-in' },
                      { value: 'Occupied', label: 'Occupied (Stock Present)', sublabel: 'Contains inventory batch' },
                      { value: 'Full', label: 'Full (100% Capacity)', sublabel: 'Max capacity reached' },
                      { value: 'Blocked', label: 'Blocked / Maintenance', sublabel: 'Unavailable for allocation' },
                    ]}
                    placeholder="Select status..."
                    zIndexClass="z-20"
                  />
                </div>

                {/* Footer Buttons */}
                <div className="flex items-center justify-between pt-3 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => setActiveCellModalTab('inspect')}
                    className="px-3.5 py-2 border border-slate-200 text-slate-600 rounded-xl text-xs font-bold hover:bg-slate-50 cursor-pointer"
                  >
                    Cancel
                  </button>

                  <div className="flex items-center gap-2">
                    {selectedCell.productName && (
                      <button
                        type="button"
                        onClick={handleVacateCell}
                        disabled={savingCell}
                        className="px-3.5 py-2 border border-rose-200 text-rose-700 bg-rose-50 hover:bg-rose-100 rounded-xl text-xs font-bold transition cursor-pointer"
                      >
                        Vacate Bin
                      </button>
                    )}
                    <button
                      type="submit"
                      disabled={savingCell}
                      className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white rounded-xl text-xs font-bold transition shadow-xs flex items-center gap-1.5 cursor-pointer"
                    >
                      {savingCell ? (
                        <>
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          <span>Saving...</span>
                        </>
                      ) : (
                        <>
                          <Check className="w-3.5 h-3.5" />
                          <span>Save Bin Allocation</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </form>
            )}
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
                <div><strong>Shed:</strong> {qrCellTarget.shadeCode} | <strong>Rack:</strong> {qrCellTarget.rackNumber}</div>
                <div><strong>Bin:</strong> Row {qrCellTarget.row} • Col {qrCellTarget.col} ({Number(qrCellTarget.row) <= 2 ? 'Lower Deck' : 'Upper Deck'})</div>
                <div className="text-indigo-700 font-bold truncate"><strong>Item:</strong> {qrCellTarget.productName || 'Empty'}</div>
                {qrCellTarget.productName && (
                  <div className="text-[10px] text-slate-700 font-semibold py-0.5 bg-slate-50 rounded mt-0.5">
                    <strong>EXP:</strong> {getEslInfo({ productName: qrCellTarget.productName, batchNo: qrCellTarget.batchNo }).expiryFormatted} • <strong>{getEslInfo({ productName: qrCellTarget.productName, batchNo: qrCellTarget.batchNo }).eslText}</strong>
                  </div>
                )}
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
