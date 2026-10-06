import { useState, useMemo, useRef, useEffect } from 'react'
import { Link } from 'react-router-dom'
import {
  Warehouse, Package, Layers, Edit2, Search, Download,
  CheckCircle2, X, ArrowUpRight, Plus, RotateCcw, Check,
  ChevronDown, ShieldCheck, Trash2, AlertTriangle,
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
                <span className="truncate">{opt.label}</span>
                {isSel && <Check className="w-3.5 h-3.5 text-indigo-600 shrink-0 ml-2" />}
              </button>
            )
          })}
        </div>
      )}
    </div>
  )
}

const SHADE_TYPES = ['Grains & Pulses', 'Edible Oils', 'Packaged FMCG', 'Packaging Materials', 'Chemicals & Hygiene', 'Spares & General', 'Cold Storage', 'General']

const emptyForm = {
  code: '', name: '', type: 'Packaged FMCG', description: '', manager: '', status: 'Active',
}

export default function ShadeManagement() {
  const [shades, setShades] = useState([])
  const [loading, setLoading] = useState(true)
  const [toast, setToast] = useState(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedType, setSelectedType] = useState('ALL')
  const [selectedStatus, setSelectedStatus] = useState('ALL')
  const [showModal, setShowModal] = useState(false)
  const [editingItem, setEditingItem] = useState(null)
  const [formData, setFormData] = useState(emptyForm)
  const [saving, setSaving] = useState(false)
  const [deleteConfirm, setDeleteConfirm] = useState(null)

  const triggerToast = (msg, type = 'success') => {
    setToast({ msg, type })
    setTimeout(() => setToast(null), 3200)
  }

  const fetchShades = async () => {
    try {
      setLoading(true)
      const res = await fetch(`${API}/api/shade`)
      const data = await res.json()
      setShades(data)
    } catch {
      triggerToast('Failed to load shades', 'error')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchShades() }, [])

  const filteredShades = useMemo(() => {
    return shades.filter((s) => {
      if (selectedType !== 'ALL' && s.type !== selectedType) return false
      if (selectedStatus !== 'ALL' && s.status !== selectedStatus) return false
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase()
        return s.code.toLowerCase().includes(q) || s.name.toLowerCase().includes(q) ||
          s.type.toLowerCase().includes(q) || (s.manager || '').toLowerCase().includes(q)
      }
      return true
    })
  }, [shades, selectedType, selectedStatus, searchQuery])

  const handleOpenAdd = () => {
    setEditingItem(null)
    const nextNum = String(shades.length + 1).padStart(2, '0')
    setFormData({ ...emptyForm, code: `SH-${nextNum}` })
    setShowModal(true)
  }

  const handleOpenEdit = (shade) => {
    setEditingItem(shade)
    setFormData({
      code: shade.code, name: shade.name, type: shade.type,
      description: shade.description || '', manager: shade.manager || '', status: shade.status,
    })
    setShowModal(true)
  }

  const handleSave = async (e) => {
    e.preventDefault()
    if (!formData.code || !formData.name) { triggerToast('Code and Name are required', 'error'); return }
    setSaving(true)
    try {
      const url = editingItem ? `${API}/api/shade/${editingItem._id}` : `${API}/api/shade`
      const method = editingItem ? 'PUT' : 'POST'
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })
      if (!res.ok) {
        const err = await res.json()
        throw new Error(err.message || 'Save failed')
      }
      await fetchShades()
      triggerToast(editingItem ? `Shade ${formData.code} updated.` : `Shade ${formData.code} created.`)
      setShowModal(false)
    } catch (err) {
      triggerToast(err.message, 'error')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (shade) => {
    try {
      const res = await fetch(`${API}/api/shade/${shade._id}`, { method: 'DELETE' })
      if (!res.ok) throw new Error('Delete failed')
      await fetchShades()
      triggerToast(`Shade ${shade.code} deleted.`)
    } catch (err) {
      triggerToast(err.message, 'error')
    } finally {
      setDeleteConfirm(null)
    }
  }

  const handleExportCSV = () => {
    const headers = ['#', 'Code', 'Name', 'Type', 'Manager', 'Status']
    const rows = filteredShades.map((s, i) => [i + 1, `"${s.code}"`, `"${s.name}"`, `"${s.type}"`, `"${s.manager || ''}"`, s.status])
    const csv = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\n')
    const link = document.createElement('a')
    link.setAttribute('href', encodeURI(csv))
    link.setAttribute('download', 'Shade_Register.csv')
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    triggerToast('Exported to CSV.')
  }

  const stats = useMemo(() => ({
    total: shades.length,
    active: shades.filter((s) => s.status === 'Active').length,
    maintenance: shades.filter((s) => s.status === 'Maintenance').length,
    inactive: shades.filter((s) => s.status === 'Inactive').length,
  }), [shades])

  const typeOptions = [
    { value: 'ALL', label: 'All Types' },
    ...SHADE_TYPES.map((t) => ({ value: t, label: t })),
  ]
  const statusOptions = [
    { value: 'ALL', label: 'All Statuses' },
    { value: 'Active', label: 'Active' },
    { value: 'Maintenance', label: 'Maintenance' },
    { value: 'Inactive', label: 'Inactive' },
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

      {/* Header */}
      <div className="bg-white rounded-2xl p-5 shadow-xs border border-slate-200/80 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 shadow-xs shrink-0">
            <Warehouse className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-slate-800 tracking-tight">Shade Management</h1>
            <p className="text-xs text-slate-500 font-medium mt-0.5">Create and manage warehouse shades. Add racks inside each shade.</p>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-2.5">
          <Link to="/location-master" className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold shadow-xs transition">
            <span>Location Master</span>
            <ArrowUpRight className="w-3.5 h-3.5 text-slate-400" />
          </Link>
          <Link to="/rack-mgmt" className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold shadow-xs transition">
            <Layers className="w-3.5 h-3.5 text-slate-500" />
            <span>Rack Management</span>
          </Link>
          <button type="button" onClick={handleExportCSV} className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold shadow-xs transition">
            <Download className="w-3.5 h-3.5 text-slate-500" />
            <span>Export CSV</span>
          </button>
          <button type="button" onClick={handleOpenAdd} className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-sm transition">
            <Plus className="w-4 h-4" />
            <span>Add Shade</span>
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5">
        {[
          { label: 'Total Shades', value: stats.total, sub: 'Configured', color: 'indigo', Icon: Warehouse },
          { label: 'Active', value: stats.active, sub: 'Operational', color: 'emerald', Icon: CheckCircle2 },
          { label: 'Maintenance', value: stats.maintenance, sub: 'Under review', color: 'amber', Icon: AlertTriangle },
          { label: 'Inactive', value: stats.inactive, sub: 'Disabled', color: 'slate', Icon: ShieldCheck },
        ].map(({ label, value, sub, color, Icon }) => (
          <div key={label} className="bg-white rounded-2xl p-4 shadow-xs border border-slate-200/80 flex items-center gap-3.5">
            <div className={`w-10 h-10 rounded-xl bg-${color}-50 text-${color}-600 border border-${color}-100 flex items-center justify-center shrink-0`}>
              <Icon className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs font-semibold text-slate-500">{label}</p>
              <h3 className="text-xl font-bold text-slate-800 leading-tight mt-0.5">{value}</h3>
              <p className={`text-[11px] text-${color}-600 font-medium`}>{sub}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl shadow-xs border border-slate-200/80 overflow-hidden">
        <div className="p-4 sm:p-5 border-b border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-3.5">
          <div className="flex items-center gap-2.5">
            <Layers className="w-4 h-4 text-indigo-600" />
            <h2 className="text-sm font-bold text-slate-800">Shade Register</h2>
            <span className="text-xs bg-slate-100 text-slate-600 font-semibold px-2 py-0.5 rounded-full border border-slate-200">{filteredShades.length} shades</span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 items-center text-xs">
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-3" />
              <input type="text" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search code, name, manager..."
                className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-8 pr-3 py-2 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 focus:bg-white" />
            </div>
            <CustomSelect value={selectedType} onChange={setSelectedType} options={typeOptions} zIndexClass="z-30" />
            <CustomSelect value={selectedStatus} onChange={setSelectedStatus} options={statusOptions} zIndexClass="z-30" />
          </div>
        </div>

        <div className="overflow-x-auto w-full">
          {loading ? (
            <div className="py-16 text-center text-slate-400 text-sm">Loading shades...</div>
          ) : filteredShades.length === 0 ? (
            <div className="py-16 text-center text-slate-400 text-sm">
              {shades.length === 0 ? 'No shades yet. Click "Add Shade" to create one.' : 'No shades match your filter.'}
            </div>
          ) : (
            <table className="w-full text-left text-xs divide-y divide-slate-200">
              <thead className="bg-slate-50/80 text-slate-600 font-bold uppercase tracking-wider text-[11px]">
                <tr>
                  <th className="py-3.5 px-4 w-12 text-center">#</th>
                  <th className="py-3.5 px-4 min-w-[90px]">Code</th>
                  <th className="py-3.5 px-4 min-w-[200px]">Shade Name</th>
                  <th className="py-3.5 px-4 min-w-[160px]">Type</th>
                  <th className="py-3.5 px-4 min-w-[180px]">Description</th>
                  <th className="py-3.5 px-4 min-w-[160px]">Manager</th>
                  <th className="py-3.5 px-4 text-center min-w-[100px]">Status</th>
                  <th className="py-3.5 px-4 text-center w-24">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 bg-white">
                {filteredShades.map((row, idx) => (
                  <tr key={row._id} className="hover:bg-slate-50/80 transition">
                    <td className="py-3.5 px-4 text-center text-slate-400 font-bold text-[11px]">{idx + 1}</td>
                    <td className="py-3.5 px-4 font-mono font-bold text-slate-900">{row.code}</td>
                    <td className="py-3.5 px-4 font-semibold text-slate-800">{row.name}</td>
                    <td className="py-3.5 px-4 text-slate-600">{row.type}</td>
                    <td className="py-3.5 px-4 text-slate-500 max-w-[200px] truncate">{row.description || '—'}</td>
                    <td className="py-3.5 px-4 text-slate-700 font-medium">{row.manager || '—'}</td>
                    <td className="py-3.5 px-4 text-center">
                      <span className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${row.status === 'Active' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : row.status === 'Maintenance' ? 'bg-amber-50 text-amber-700 border-amber-200' : 'bg-slate-100 text-slate-600 border-slate-200'}`}>
                        {row.status}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      <div className="flex items-center justify-center gap-1.5">
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
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Add/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-4 sm:p-6 max-h-[90dvh] overflow-y-auto shadow-2xl border border-slate-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
                  <Warehouse className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-bold text-sm text-slate-800">{editingItem ? 'Edit Shade' : 'Add New Shade'}</h3>
                  <p className="text-[11px] text-slate-500">Shade code must be unique (e.g. SH-01)</p>
                </div>
              </div>
              <button type="button" onClick={() => setShowModal(false)} className="text-slate-400 hover:text-slate-700 p-1">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSave} className="pt-4 space-y-3.5 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Shade Code *</label>
                  <input type="text" required value={formData.code} onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                    placeholder="e.g. SH-01"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2 text-xs font-mono font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 focus:bg-white" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Shade Name *</label>
                  <input type="text" required value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="e.g. Shade 1: Grains"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2 text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 focus:bg-white" />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Type / Category</label>
                <CustomSelect value={formData.type} onChange={(v) => setFormData({ ...formData, type: v })}
                  options={SHADE_TYPES.map((t) => ({ value: t, label: t }))} zIndexClass="z-40" />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Description</label>
                <input type="text" value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="What is stored here?"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 focus:bg-white" />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Manager</label>
                  <input type="text" value={formData.manager} onChange={(e) => setFormData({ ...formData, manager: e.target.value })}
                    placeholder="e.g. Rajesh Sharma"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 focus:bg-white" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Status</label>
                  <CustomSelect value={formData.status} onChange={(v) => setFormData({ ...formData, status: v })}
                    options={[{ value: 'Active', label: 'Active' }, { value: 'Maintenance', label: 'Maintenance' }, { value: 'Inactive', label: 'Inactive' }]}
                    zIndexClass="z-40" />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                <button type="button" onClick={() => setShowModal(false)}
                  className="px-4 py-2 border border-slate-300 rounded-xl text-xs font-semibold text-slate-700 hover:bg-slate-50">Cancel</button>
                <button type="submit" disabled={saving}
                  className="bg-indigo-600 hover:bg-indigo-700 disabled:opacity-60 text-white px-5 py-2 rounded-xl text-xs font-bold transition">
                  {saving ? 'Saving...' : editingItem ? 'Update Shade' : 'Create Shade'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirm Modal */}
      {deleteConfirm && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-sm w-full p-5 shadow-2xl border border-slate-200">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center shrink-0">
                <Trash2 className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-sm text-slate-800">Delete Shade?</h3>
                <p className="text-[11px] text-slate-500">This action cannot be undone.</p>
              </div>
            </div>
            <p className="text-xs text-slate-600 mb-4 bg-slate-50 p-3 rounded-lg border border-slate-200">
              Are you sure you want to delete <strong>{deleteConfirm.code} — {deleteConfirm.name}</strong>?
              All racks inside this shade should be deleted first.
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
