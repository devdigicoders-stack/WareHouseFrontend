import { useState, useMemo, useRef, useEffect } from 'react'
import { Link } from 'react-router-dom'
import {
  Layers, Warehouse, Grid, Plus, Edit2, Trash2, Search, Download,
  CheckCircle2, AlertTriangle, ChevronDown, Check, X, ArrowUpRight,
  Eye, RefreshCw, Box, MapPin
} from 'lucide-react'

const API = (import.meta.env.VITE_API_URL || 'http://localhost:8000').replace(/\/api\/?$/, '')

function CustomSelect({ value, onChange, options, placeholder = 'Select option...', className = '', zIndexClass = 'z-50' }) {
  const [isOpen, setIsOpen] = useState(false)
  const ref = useRef(null)
  useEffect(() => {
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setIsOpen(false) }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])
  const selected = options.find((o) => o.value === value)
  return (
    <div className={`relative ${className}`} ref={ref}>
      <button type="button" onClick={() => setIsOpen(!isOpen)}
        className="w-full bg-slate-50 hover:bg-slate-100/80 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-left font-medium text-slate-800 flex items-center justify-between transition focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500">
        <span className="truncate">{selected ? selected.label : placeholder}</span>
        <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform duration-200 shrink-0 ml-2 ${isOpen ? 'rotate-180 text-indigo-600' : ''}`} />
      </button>
      {isOpen && (
        <div className={`absolute left-0 right-0 mt-1.5 bg-white border border-slate-200 rounded-xl shadow-xl py-1.5 ${zIndexClass} max-h-56 overflow-y-auto`}>
          {options.map((opt) => {
            const isSel = opt.value === value
            return (
              <button key={opt.value} type="button" onClick={() => { onChange(opt.value); setIsOpen(false) }}
                className={`w-full px-3.5 py-2 text-xs text-left flex items-center justify-between transition ${isSel ? 'bg-indigo-50 text-indigo-700 font-semibold' : 'text-slate-700 hover:bg-slate-50'}`}>
                <div className="truncate">
                  <div className="truncate">{opt.label}</div>
                  {opt.sublabel && <div className="text-[10px] text-slate-400 font-normal">{opt.sublabel}</div>}
                </div>
                {isSel && <Check className="w-3.5 h-3.5 text-indigo-600 shrink-0 ml-2" />}
              </button>
            )
          })}
        </div>
      )}
    </div>
  )
}

const emptyForm = {
  shadeId: '',
  rackNumber: '',
  rows: 4,
  columns: 5,
  description: '',
  status: 'Active',
}

export default function RackManagement() {
  const [shades, setShades] = useState([])
  const [racks, setRacks] = useState([])
  const [loading, setLoading] = useState(true)
  const [toast, setToast] = useState(null)
  const [selectedShadeFilter, setSelectedShadeFilter] = useState('ALL')
  const [searchQuery, setSearchQuery] = useState('')
  const [showModal, setShowModal] = useState(false)
  const [editingRack, setEditingRack] = useState(null)
  const [formData, setFormData] = useState(emptyForm)
  const [saving, setSaving] = useState(false)
  const [deleteConfirm, setDeleteConfirm] = useState(null)
  const [expandedRackId, setExpandedRackId] = useState(null)

  const triggerToast = (msg, type = 'success') => {
    setToast({ msg, type })
    setTimeout(() => setToast(null), 3200)
  }

  const fetchData = async () => {
    try {
      setLoading(true)
      const [shadesRes, racksRes] = await Promise.all([
        fetch(`${API}/api/shade`),
        fetch(`${API}/api/rack`),
      ])
      const shadesData = await shadesRes.json()
      const racksData = await racksRes.json()
      setShades(shadesData)
      setRacks(racksData)
    } catch {
      triggerToast('Failed to load racks & shades', 'error')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchData() }, [])

  const filteredRacks = useMemo(() => {
    return racks.filter((r) => {
      if (selectedShadeFilter !== 'ALL' && r.shadeId !== selectedShadeFilter) return false
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase()
        return r.rackNumber.toLowerCase().includes(q) ||
          (r.shadeCode || '').toLowerCase().includes(q) ||
          (r.description || '').toLowerCase().includes(q)
      }
      return true
    })
  }, [racks, selectedShadeFilter, searchQuery])

  const stats = useMemo(() => {
    const totalRacks = racks.length
    const totalCells = racks.reduce((sum, r) => sum + (r.cells ? r.cells.length : r.rows * r.columns), 0)
    const activeRacks = racks.filter((r) => r.status === 'Active').length
    const totalShadesCount = shades.length
    return { totalRacks, totalCells, activeRacks, totalShadesCount }
  }, [racks, shades])

  const handleOpenAdd = () => {
    setEditingRack(null)
    const defaultShade = shades[0] ? shades[0]._id : ''
    const defaultShadeCode = shades[0] ? shades[0].code : 'SH-01'
    const shadeRacks = racks.filter((r) => r.shadeId === defaultShade)
    const nextNum = String(shadeRacks.length + 1).padStart(2, '0')
    setFormData({
      ...emptyForm,
      shadeId: defaultShade,
      rackNumber: `RK-${nextNum}`,
    })
    setShowModal(true)
  }

  const handleOpenEdit = (rack) => {
    setEditingRack(rack)
    setFormData({
      shadeId: rack.shadeId,
      rackNumber: rack.rackNumber,
      rows: rack.rows,
      columns: rack.columns,
      description: rack.description || '',
      status: rack.status || 'Active',
    })
    setShowModal(true)
  }

  const handleSave = async (e) => {
    e.preventDefault()
    if (!formData.shadeId || !formData.rackNumber) {
      triggerToast('Shade and Rack Number are required', 'error')
      return
    }
    setSaving(true)
    try {
      const url = editingRack ? `${API}/api/rack/${editingRack._id}` : `${API}/api/rack`
      const method = editingRack ? 'PUT' : 'POST'
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })
      if (!res.ok) {
        const err = await res.json()
        throw new Error(err.message || 'Failed to save rack')
      }
      await fetchData()
      triggerToast(editingRack ? `Rack ${formData.rackNumber} updated.` : `Rack ${formData.rackNumber} created with ${formData.rows * formData.columns} locations!`)
      setShowModal(false)
    } catch (err) {
      triggerToast(err.message, 'error')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (rack) => {
    try {
      const res = await fetch(`${API}/api/rack/${rack._id}`, { method: 'DELETE' })
      if (!res.ok) throw new Error('Delete failed')
      await fetchData()
      triggerToast(`Rack ${rack.rackNumber} deleted.`)
    } catch (err) {
      triggerToast(err.message, 'error')
    } finally {
      setDeleteConfirm(null)
    }
  }

  const handleExportCSV = () => {
    const headers = ['#', 'Shade Code', 'Rack Number', 'Rows', 'Columns', 'Total Locations', 'Status', 'Description']
    const rows = filteredRacks.map((r, i) => [
      i + 1,
      `"${r.shadeCode || ''}"`,
      `"${r.rackNumber}"`,
      r.rows,
      r.columns,
      r.rows * r.columns,
      r.status,
      `"${r.description || ''}"`,
    ])
    const csv = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\n')
    const link = document.createElement('a')
    link.setAttribute('href', encodeURI(csv))
    link.setAttribute('download', 'Rack_Register.csv')
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    triggerToast('Rack master exported to CSV.')
  }

  const shadeOptions = [
    { value: 'ALL', label: 'All Shades' },
    ...shades.map((s) => ({ value: s._id, label: `${s.code} — ${s.name}` })),
  ]

  return (
    <div className="space-y-5 pb-12">
      {/* Toast */}
      {toast && (
        <div className={`fixed top-5 right-5 z-[9999] pointer-events-auto px-4 py-3 rounded-xl shadow-2xl flex items-center gap-2.5 text-xs font-semibold border animate-bounce ${toast.type === 'error' ? 'bg-rose-900 text-white border-rose-700' : 'bg-slate-900 text-white border-slate-700'}`}>
          {toast.type === 'error' ? <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" /> : <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />}
          <span>{toast.msg}</span>
        </div>
      )}

      {/* Header Bar */}
      <div className="bg-white rounded-2xl p-5 shadow-xs border border-slate-200/80 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 shadow-xs shrink-0">
            <Layers className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-slate-800 tracking-tight">Rack Management</h1>
            <p className="text-xs text-slate-500 font-medium mt-0.5">Define physical racks, rows, and columns inside warehouse shades. Auto-generate cell locations.</p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <Link to="/shade-mgmt" className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold shadow-xs transition">
            <Warehouse className="w-3.5 h-3.5 text-slate-500" />
            <span>Shade Master</span>
          </Link>
          <Link to="/location-master" className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold shadow-xs transition">
            <span>Location Grid</span>
            <ArrowUpRight className="w-3.5 h-3.5 text-slate-400" />
          </Link>
          <button type="button" onClick={handleExportCSV} className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold shadow-xs transition">
            <Download className="w-3.5 h-3.5 text-slate-500" />
            <span>Export CSV</span>
          </button>
          <button type="button" onClick={handleOpenAdd} className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-sm transition">
            <Plus className="w-4 h-4" />
            <span>Add Rack</span>
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5">
        <div className="bg-white rounded-2xl p-4 shadow-xs border border-slate-200/80 flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 border border-indigo-100 flex items-center justify-center shrink-0">
            <Layers className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-500">Total Racks</p>
            <h3 className="text-xl font-bold text-slate-800 leading-tight mt-0.5">{stats.totalRacks}</h3>
            <p className="text-[11px] text-indigo-600 font-medium">Across {stats.totalShadesCount} shades</p>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-4 shadow-xs border border-slate-200/80 flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 border border-emerald-100 flex items-center justify-center shrink-0">
            <Grid className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-500">Total Cell Locations</p>
            <h3 className="text-xl font-bold text-slate-800 leading-tight mt-0.5">{stats.totalCells}</h3>
            <p className="text-[11px] text-emerald-600 font-medium">Auto-generated cells</p>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-4 shadow-xs border border-slate-200/80 flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 border border-amber-100 flex items-center justify-center shrink-0">
            <CheckCircle2 className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-500">Active Racks</p>
            <h3 className="text-xl font-bold text-slate-800 leading-tight mt-0.5">{stats.activeRacks}</h3>
            <p className="text-[11px] text-amber-600 font-medium">Ready for Put-Away</p>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-4 shadow-xs border border-slate-200/80 flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 border border-blue-100 flex items-center justify-center shrink-0">
            <Warehouse className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-500">Configured Shades</p>
            <h3 className="text-xl font-bold text-slate-800 leading-tight mt-0.5">{stats.totalShadesCount}</h3>
            <p className="text-[11px] text-blue-600 font-medium">Storage buildings</p>
          </div>
        </div>
      </div>

      {/* Main Table */}
      <div className="bg-white rounded-2xl shadow-xs border border-slate-200/80 overflow-hidden">
        <div className="p-4 sm:p-5 border-b border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-3.5">
          <div className="flex items-center gap-2.5">
            <Grid className="w-4 h-4 text-indigo-600" />
            <h2 className="text-sm font-bold text-slate-800">Rack Directory & Location Allocator</h2>
            <span className="text-xs bg-slate-100 text-slate-600 font-semibold px-2 py-0.5 rounded-full border border-slate-200">{filteredRacks.length} racks</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 items-center text-xs">
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-3" />
              <input type="text" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search rack number, shade code..."
                className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-8 pr-3 py-2 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 focus:bg-white" />
            </div>
            <CustomSelect value={selectedShadeFilter} onChange={setSelectedShadeFilter} options={shadeOptions} zIndexClass="z-30" />
          </div>
        </div>

        <div className="overflow-x-auto w-full">
          {loading ? (
            <div className="py-16 text-center text-slate-400 text-sm">Loading rack hierarchy...</div>
          ) : filteredRacks.length === 0 ? (
            <div className="py-16 text-center text-slate-400 text-sm">
              {racks.length === 0 ? 'No racks configured yet. Click "Add Rack" to create one.' : 'No racks match your filter.'}
            </div>
          ) : (
            <table className="w-full text-left text-xs divide-y divide-slate-200">
              <thead className="bg-slate-50/80 text-slate-600 font-bold uppercase tracking-wider text-[11px]">
                <tr>
                  <th className="py-3.5 px-4 w-12 text-center">#</th>
                  <th className="py-3.5 px-4 min-w-[120px]">Shade Code</th>
                  <th className="py-3.5 px-4 min-w-[120px]">Rack Number</th>
                  <th className="py-3.5 px-4 text-center min-w-[100px]">Rows × Cols</th>
                  <th className="py-3.5 px-4 text-center min-w-[120px]">Total Cells</th>
                  <th className="py-3.5 px-4 min-w-[180px]">Description</th>
                  <th className="py-3.5 px-4 text-center min-w-[100px]">Status</th>
                  <th className="py-3.5 px-4 text-center w-28">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 bg-white">
                {filteredRacks.map((row, idx) => {
                  const shadeObj = shades.find((s) => s._id === row.shadeId)
                  const isExpanded = expandedRackId === row._id
                  const totalCellCount = row.cells ? row.cells.length : row.rows * row.columns
                  return (
                    <tr key={row._id} className="hover:bg-slate-50/80 transition group">
                      <td className="py-3.5 px-4 text-center text-slate-400 font-bold text-[11px]">{idx + 1}</td>
                      <td className="py-3.5 px-4">
                        <span className="font-mono font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded border border-indigo-100">{row.shadeCode}</span>
                        <div className="text-[10px] text-slate-400 font-medium mt-0.5 truncate">{shadeObj ? shadeObj.name : ''}</div>
                      </td>
                      <td className="py-3.5 px-4 font-mono font-bold text-slate-900">{row.rackNumber}</td>
                      <td className="py-3.5 px-4 text-center">
                        <span className="font-semibold text-slate-700">{row.rows} Rows × {row.columns} Cols</span>
                      </td>
                      <td className="py-3.5 px-4 text-center">
                        <span className="font-mono font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-100">
                          {totalCellCount} Cells
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-slate-500 max-w-[200px] truncate">{row.description || '—'}</td>
                      <td className="py-3.5 px-4 text-center">
                        <span className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${row.status === 'Active' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-slate-100 text-slate-600 border-slate-200'}`}>
                          {row.status}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-center">
                        <div className="flex items-center justify-center gap-1.5">
                          <button type="button" onClick={() => setExpandedRackId(isExpanded ? null : row._id)}
                            className={`p-1.5 rounded-lg border transition ${isExpanded ? 'bg-indigo-600 text-white border-indigo-600' : 'text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 border-slate-200'}`} title="View Cell Grid Matrix">
                            <Eye className="w-3.5 h-3.5" />
                          </button>
                          <button type="button" onClick={() => handleOpenEdit(row)}
                            className="p-1.5 rounded-lg text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 border border-slate-200 transition" title="Edit">
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button type="button" onClick={() => setDeleteConfirm(row)}
                            className="p-1.5 rounded-lg text-slate-500 hover:text-rose-600 hover:bg-rose-50 border border-slate-200 transition" title="Delete">
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Expanded Rack Matrix Modal Overlay */}
      {expandedRackId && (() => {
        const rack = racks.find((r) => r._id === expandedRackId)
        if (!rack) return null
        return (
          <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-5">
            <div className="bg-slate-900 text-white rounded-2xl max-w-6xl w-full max-h-[92vh] flex flex-col shadow-2xl border border-slate-800 animate-scale-up">
              <div className="flex items-center justify-between p-4 border-b border-slate-800 shrink-0">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
                    <Grid className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-bold text-base text-slate-100">Cell Allocation Matrix: {rack.shadeCode} - {rack.rackNumber}</h3>
                    <p className="text-xs text-slate-400">
                      {rack.rows} Rows (Levels) × {rack.columns} Columns (Bays) = {rack.cells ? rack.cells.length : rack.rows * rack.columns} Unique Storage Cells
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setExpandedRackId(null)}
                  className="p-2 rounded-xl text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-700 transition cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Scrollable Elevation Chart Grid */}
              <div className="p-5 overflow-auto flex-1 space-y-3">
                {/* Column Headers */}
                <div className="flex items-center gap-2 pl-20">
                  {Array.from({ length: rack.columns }).map((_, cIdx) => (
                    <div key={cIdx + 1} className="min-w-[125px] text-center font-mono text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                      COL {cIdx + 1}
                    </div>
                  ))}
                </div>

                <div className="space-y-2.5">
                  {Array.from({ length: rack.rows }).map((_, rIdx) => {
                    const rowNum = rIdx + 1
                    return (
                      <div key={rowNum} className="flex items-center gap-2">
                        <span className="w-16 text-xs font-mono font-bold text-indigo-400 shrink-0 text-right pr-2">
                          ROW {rowNum}
                        </span>
                        <div className="flex items-center gap-2">
                          {Array.from({ length: rack.columns }).map((_, cIdx) => {
                            const colNum = cIdx + 1
                            const cellCode = `${rack.shadeCode}-${rack.rackNumber}-R${rowNum}-C${colNum}`
                            const cellData = rack.cells ? rack.cells.find((c) => c.row === rowNum && c.col === colNum) : null
                            const status = cellData ? cellData.status : 'Empty'
                            const prodName = cellData ? cellData.productName : ''

                            const isOccupied = status === 'Occupied' || (cellData && cellData.currentStock > 0)
                            const isFull = status === 'Full'

                            const colorClass = isFull
                              ? 'bg-rose-950/60 border-rose-800/60 text-rose-200'
                              : isOccupied
                              ? 'bg-emerald-950/60 border-emerald-800/60 text-emerald-200'
                              : 'bg-slate-800/80 border-slate-700/80 text-slate-300 hover:border-indigo-500'

                            return (
                              <div
                                key={colNum}
                                className={`border rounded-xl p-2.5 text-center min-w-[125px] transition shadow-xs ${colorClass}`}
                              >
                                <div className="text-[10px] font-mono font-bold text-indigo-300 truncate">{cellCode}</div>
                                <div className="text-[10px] font-semibold truncate mt-1">{prodName || status}</div>
                                <div className="text-[9px] text-slate-400 font-mono mt-0.5">R{rowNum} • C{colNum}</div>
                              </div>
                            )
                          })}
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>

              {/* Modal Footer Legend */}
              <div className="p-4 border-t border-slate-800 bg-slate-950/80 rounded-b-2xl flex items-center justify-between text-xs text-slate-400 shrink-0">
                <div className="flex items-center gap-4">
                  <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-slate-500" /> Empty</span>
                  <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-emerald-500" /> Occupied</span>
                  <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-rose-500" /> Full</span>
                </div>
                <button
                  type="button"
                  onClick={() => setExpandedRackId(null)}
                  className="px-4 py-1.5 bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs rounded-xl transition cursor-pointer"
                >
                  Close Grid
                </button>
              </div>
            </div>
          </div>
        )
      })()}


      {/* Add / Edit Rack Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-4 sm:p-6 max-h-[90dvh] overflow-y-auto shadow-2xl border border-slate-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
                  <Layers className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-bold text-sm text-slate-800">{editingRack ? 'Edit Rack Configuration' : 'Add Rack & Auto-Generate Locations'}</h3>
                  <p className="text-[11px] text-slate-500">Rows × Columns will define total cells</p>
                </div>
              </div>
              <button type="button" onClick={() => setShowModal(false)} className="text-slate-400 hover:text-slate-700 p-1">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSave} className="pt-4 space-y-3.5 text-xs">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Target Shade *</label>
                <CustomSelect
                  value={formData.shadeId}
                  onChange={(v) => {
                    const selShade = shades.find((s) => s._id === v)
                    const shadeRacks = racks.filter((r) => r.shadeId === v)
                    const nextNum = String(shadeRacks.length + 1).padStart(2, '0')
                    setFormData({ ...formData, shadeId: v, rackNumber: `RK-${nextNum}` })
                  }}
                  options={shades.map((s) => ({ value: s._id, label: `${s.code} — ${s.name}`, sublabel: s.type }))}
                  zIndexClass="z-40"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Rack Number *</label>
                  <input type="text" required value={formData.rackNumber}
                    onChange={(e) => setFormData({ ...formData, rackNumber: e.target.value.toUpperCase() })}
                    placeholder="e.g. RK-01"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2 text-xs font-mono font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 focus:bg-white" />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Status</label>
                  <CustomSelect value={formData.status} onChange={(v) => setFormData({ ...formData, status: v })}
                    options={[{ value: 'Active', label: 'Active' }, { value: 'Inactive', label: 'Inactive' }]}
                    zIndexClass="z-40" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 bg-slate-50 p-3 rounded-xl border border-slate-200">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Rows (Levels) *</label>
                  <input type="number" min="1" max="20" required value={formData.rows}
                    onChange={(e) => setFormData({ ...formData, rows: parseInt(e.target.value) || 1 })}
                    className="w-full bg-white border border-slate-200 rounded-xl p-2 text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20" />
                  <p className="text-[10px] text-slate-500 mt-1">Height levels (R1, R2...)</p>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Columns (Bays) *</label>
                  <input type="number" min="1" max="20" required value={formData.columns}
                    onChange={(e) => setFormData({ ...formData, columns: parseInt(e.target.value) || 1 })}
                    className="w-full bg-white border border-slate-200 rounded-xl p-2 text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20" />
                  <p className="text-[10px] text-slate-500 mt-1">Width sections (C1, C2...)</p>
                </div>
              </div>

              <div className="bg-indigo-50 p-3 rounded-xl border border-indigo-100 flex items-center justify-between text-indigo-900 font-semibold">
                <span>Calculated Unique Cell Locations:</span>
                <span className="font-mono font-bold text-sm bg-indigo-600 text-white px-2.5 py-0.5 rounded-lg shadow-xs">
                  {formData.rows * formData.columns} Bins
                </span>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Description / Location Details</label>
                <input type="text" value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="e.g. South Aisle Heavy Pallet Rack"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 focus:bg-white" />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                <button type="button" onClick={() => setShowModal(false)}
                  className="px-4 py-2 border border-slate-300 rounded-xl text-xs font-semibold text-slate-700 hover:bg-slate-50">Cancel</button>
                <button type="submit" disabled={saving}
                  className="bg-indigo-600 hover:bg-indigo-700 disabled:opacity-60 text-white px-5 py-2 rounded-xl text-xs font-bold transition">
                  {saving ? 'Generating...' : editingRack ? 'Update Rack' : 'Generate Cells & Save'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirm && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-sm w-full p-5 shadow-2xl border border-slate-200">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center shrink-0">
                <Trash2 className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-sm text-slate-800">Delete Rack Configuration?</h3>
                <p className="text-[11px] text-slate-500">This action will remove all auto-generated cell locations.</p>
              </div>
            </div>
            <p className="text-xs text-slate-600 mb-4 bg-slate-50 p-3 rounded-lg border border-slate-200">
              Are you sure you want to delete Rack <strong>{deleteConfirm.shadeCode} - {deleteConfirm.rackNumber}</strong>?
            </p>
            <div className="flex gap-2">
              <button type="button" onClick={() => setDeleteConfirm(null)}
                className="flex-1 py-2 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 hover:bg-slate-50">Cancel</button>
              <button type="button" onClick={() => handleDelete(deleteConfirm)}
                className="flex-1 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold transition">Delete</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
