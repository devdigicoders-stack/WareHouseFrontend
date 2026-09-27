import { useState, useMemo, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { printSpecificElement } from '../utils/printHelper'
import { apiRequest } from '../services/api'
import {
  Truck, FileText, ClipboardList, Package, Trash2, Check,
  Printer, ChevronDown, Search, ArrowRight, QrCode, LogOut, Clock,
  Plus, Warehouse,
} from 'lucide-react'

const fmt = (iso) => {
  if (!iso) return '-'
  return new Date(iso).toLocaleString('en-IN', {
    day: '2-digit', month: 'short', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  })
}

const EMPTY_ITEM = () => ({
  id: Date.now(),
  productSku: '',
  packageQty: '',
  baseUnitEstimate: '',
  remarks: '',
})

const calcEstimate = (prod, qty) => {
  if (!prod || !qty) return ''
  return `${Number(qty) * prod.packSize} ${prod.baseUnit}`
}

export default function GateEntry() {
  const [activeTab, setActiveTab] = useState('new')
  const [toast, setToast] = useState(null)
  const [loading, setLoading] = useState(false)
  const [allEntries, setAllEntries] = useState([])
  const [products, setProducts] = useState([])
  const [activePassModal, setActivePassModal] = useState(null)
  const [logSearch, setLogSearch] = useState('')
  const [logFilter, setLogFilter] = useState('All')

  // Form state
  const [vehicleNumber, setVehicleNumber] = useState('')
  const [vehicleType, setVehicleType] = useState('Heavy Commercial Truck')
  const [driverName, setDriverName] = useState('')
  const [driverContact, setDriverContact] = useState('')
  const [supplier, setSupplier] = useState('')
  const [challanNo, setChallanNo] = useState('')
  const [purpose, setPurpose] = useState('Goods Delivery (GRN Inward)')
  const [assignedBay, setAssignedBay] = useState('Bay 1 (General Stores - Shade 1)')
  const [remarks, setRemarks] = useState('')
  const [materialItems, setMaterialItems] = useState([EMPTY_ITEM()])

  const triggerToast = (msg) => {
    setToast(msg)
    setTimeout(() => setToast(null), 3500)
  }

  const fetchEntries = () => {
    apiRequest('/gate-entry')
      .then(setAllEntries)
      .catch(() => triggerToast('Failed to load entries'))
  }

  useEffect(() => {
    fetchEntries()
    apiRequest('/product').then(setProducts).catch(() => {})
  }, [])

  const activeVehicles = allEntries.filter((e) => e.status !== 'Gate Out / Cleared')

  const filteredLog = useMemo(() => {
    return allEntries.filter((e) => {
      if (logFilter === 'Inside' && e.status === 'Gate Out / Cleared') return false
      if (logFilter === 'Cleared' && e.status !== 'Gate Out / Cleared') return false
      if (logSearch.trim()) {
        const q = logSearch.toLowerCase()
        return (
          e.passNumber?.toLowerCase().includes(q) ||
          e.vehicleNumber?.toLowerCase().includes(q) ||
          e.driverName?.toLowerCase().includes(q) ||
          e.supplier?.toLowerCase().includes(q) ||
          e.challanNo?.toLowerCase().includes(q)
        )
      }
      return true
    })
  }, [allEntries, logSearch, logFilter])

  const handleAddItem = () => setMaterialItems((p) => [...p, EMPTY_ITEM()])

  const handleRemoveItem = (id) => {
    if (materialItems.length === 1) return
    setMaterialItems((p) => p.filter((i) => i.id !== id))
  }

  const handleItemChange = (id, field, val) => {
    setMaterialItems((prev) =>
      prev.map((item) => {
        if (item.id !== id) return item
        const updated = { ...item, [field]: val }
        const sku = field === 'productSku' ? val : item.productSku
        const qty = field === 'packageQty' ? val : item.packageQty
        const prod = products.find((p) => p.sku === sku)
        updated.baseUnitEstimate = calcEstimate(prod, qty)
        return updated
      })
    )
  }

  const handleReset = () => {
    setVehicleNumber(''); setVehicleType('Heavy Commercial Truck')
    setDriverName(''); setDriverContact(''); setSupplier('')
    setChallanNo(''); setPurpose('Goods Delivery (GRN Inward)')
    setAssignedBay('Bay 1 (General Stores - Shade 1)'); setRemarks('')
    setMaterialItems([EMPTY_ITEM()])
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      const entry = await apiRequest('/gate-entry', {
        method: 'POST',
        body: JSON.stringify({
          vehicleNumber, vehicleType, driverName, driverContact,
          supplier, challanNo, purpose, assignedBay, remarks,
          materialItems: materialItems.map(({ id, productSku, ...rest }) => {
            const prod = products.find((p) => p.sku === productSku)
            return {
              ...rest,
              product: prod?.name || productSku,
              packagingUnit: prod?.outerPackaging || '',
            }
          }),
          status: 'Waiting at Gate',
        }),
      })
      setAllEntries((p) => [entry, ...p])
      setActivePassModal(entry)
      triggerToast(`Gate Entry ${entry.passNumber} registered!`)
      handleReset()
    } catch (err) {
      triggerToast(err.message || 'Failed to save entry')
    } finally {
      setLoading(false)
    }
  }

  const handleGateOut = async (entryId) => {
    try {
      const updated = await apiRequest(`/gate-entry/${entryId}/gate-out`, { method: 'PATCH' })
      setAllEntries((p) => p.map((e) => e._id === entryId ? updated : e))
      triggerToast(`Vehicle cleared for Gate Out`)
    } catch {
      triggerToast('Failed to update status')
    }
  }

  return (
    <div className="space-y-6 max-w-[1720px] mx-auto pb-10 select-none">
      {toast && (
        <div className="fixed top-5 right-5 z-50 bg-slate-900 text-white px-4 py-3 rounded-xl shadow-2xl border border-slate-700 flex items-center gap-3 text-sm font-semibold">
          <Check className="w-4 h-4 text-emerald-400" />
          <span>{toast}</span>
        </div>
      )}

      {/* Header */}
      <div className="bg-white rounded-2xl p-5 sm:p-7 border border-slate-200 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-11 h-11 rounded-xl bg-indigo-50 border border-indigo-100 text-indigo-600 flex items-center justify-center shrink-0">
            <Truck className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-slate-900">Gate Entry & Vehicle Clearance</h1>
            <p className="text-sm text-slate-500 mt-0.5">Vehicle check-in, bay allocation & gate pass management</p>
          </div>
        </div>
        <Link to="/grn" className="px-4 py-2.5 rounded-xl bg-slate-50 hover:bg-indigo-600 text-slate-700 hover:text-white border border-slate-200 text-sm font-bold transition-all flex items-center gap-2 group shrink-0">
          <span>Proceed to GRN</span>
          <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
        </Link>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Vehicles Inside', value: activeVehicles.length, icon: <Warehouse className="w-5 h-5" />, color: 'bg-indigo-50 border-indigo-100 text-indigo-600' },
          { label: "Total Entries", value: allEntries.length, icon: <Truck className="w-5 h-5" />, color: 'bg-emerald-50 border-emerald-100 text-emerald-600' },
          { label: 'At Unloading Bay', value: activeVehicles.filter(v => v.status === 'Unloading at Bay').length, icon: <Package className="w-5 h-5" />, color: 'bg-amber-50 border-amber-100 text-amber-600' },
          { label: 'Gate Out Cleared', value: allEntries.filter(v => v.status === 'Gate Out / Cleared').length, icon: <LogOut className="w-5 h-5" />, color: 'bg-slate-100 border-slate-200 text-slate-600' },
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
            <button key={t.key} type="button" onClick={() => setActiveTab(t.key)}
              className={`px-4 py-2 rounded-lg transition-all cursor-pointer flex items-center gap-2 whitespace-nowrap ${activeTab === t.key ? 'bg-indigo-600 text-white font-bold' : 'text-slate-600 hover:bg-slate-200/70'}`}>
              {t.icon}<span>{t.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* TAB: NEW ENTRY FORM */}
      {activeTab === 'new' && (
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Vehicle & Driver */}
          <div className="bg-white rounded-2xl p-5 sm:p-7 border border-slate-200 shadow-sm space-y-5">
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2 border-b border-slate-100 pb-3">
              <Truck className="w-4 h-4 text-indigo-600" /> 1. Vehicle & Driver Details
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">Vehicle Number <span className="text-rose-500">*</span></label>
                <div className="flex rounded-lg border border-slate-300 overflow-hidden focus-within:ring-2 focus-within:ring-indigo-500/20 focus-within:border-indigo-500">
                  <span className="px-2.5 bg-slate-100 border-r border-slate-200 text-xs font-bold text-indigo-900 flex items-center">IND</span>
                  <input type="text" value={vehicleNumber} onChange={(e) => setVehicleNumber(e.target.value.toUpperCase())} placeholder="e.g. RJ14 GA 4589" required className="w-full px-3 py-2 text-sm font-bold uppercase font-mono outline-none" />
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">Vehicle Type <span className="text-rose-500">*</span></label>
                <div className="relative">
                  <select value={vehicleType} onChange={(e) => setVehicleType(e.target.value)} className="w-full pl-3 pr-8 py-2 rounded-lg border border-slate-300 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 appearance-none cursor-pointer">
                    <option>Heavy Commercial Truck</option>
                    <option>Covered Container</option>
                    <option>Light Cargo Vehicle (LCV)</option>
                    <option>Trailor (Multi-Axle)</option>
                    <option>Tanker (Fuel/Liquid)</option>
                  </select>
                  <ChevronDown className="w-4 h-4 absolute right-2.5 top-3 pointer-events-none text-slate-400" />
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">Driver Full Name <span className="text-rose-500">*</span></label>
                <input type="text" value={driverName} onChange={(e) => setDriverName(e.target.value)} placeholder="Enter driver name" required className="w-full px-3 py-2 rounded-lg border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500" />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">Driver Phone <span className="text-rose-500">*</span></label>
                <input type="tel" value={driverContact} onChange={(e) => setDriverContact(e.target.value)} placeholder="e.g. 98765 43210" required className="w-full px-3 py-2 rounded-lg border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500" />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">Purpose <span className="text-rose-500">*</span></label>
                <div className="relative">
                  <select value={purpose} onChange={(e) => setPurpose(e.target.value)} className="w-full pl-3 pr-8 py-2 rounded-lg border border-slate-300 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 appearance-none cursor-pointer">
                    <option>Goods Delivery (GRN Inward)</option>
                    <option>Quality / Lab Testing Sample</option>
                    <option>Return / Replaced Stock</option>
                    <option>Maintenance / Transfer</option>
                  </select>
                  <ChevronDown className="w-4 h-4 absolute right-2.5 top-3 pointer-events-none text-slate-400" />
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">Assign Unloading Bay <span className="text-rose-500">*</span></label>
                <div className="relative">
                  <select value={assignedBay} onChange={(e) => setAssignedBay(e.target.value)} className="w-full pl-3 pr-8 py-2 rounded-lg border border-slate-300 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 appearance-none cursor-pointer">
                    <option>Bay 1 (General Stores - Shade 1)</option>
                    <option>Bay 2 (Food &amp; Grains - Shade 2)</option>
                    <option>Bay 3 (Industrial Supplies - Shade 3)</option>
                    <option>Bay 4 (Apparel &amp; Uniforms - Shade 4)</option>
                    <option>Bay 5 (Hardware &amp; Tools - Shade 5)</option>
                    <option>Bay 6 (Medical &amp; Pharma - Shade 6)</option>
                  </select>
                  <ChevronDown className="w-4 h-4 absolute right-2.5 top-3 pointer-events-none text-slate-400" />
                </div>
              </div>
            </div>
          </div>

          {/* Supplier & Challan */}
          <div className="bg-white rounded-2xl p-5 sm:p-7 border border-slate-200 shadow-sm space-y-5">
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2 border-b border-slate-100 pb-3">
              <FileText className="w-4 h-4 text-indigo-600" /> 2. Supplier & Document Reference
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">Supplier / Vendor Name <span className="text-rose-500">*</span></label>
                <div className="relative">
                  <select value={supplier} onChange={(e) => setSupplier(e.target.value)} required className="w-full pl-3 pr-8 py-2 rounded-lg border border-slate-300 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 appearance-none cursor-pointer">
                    <option value="">Select Supplier</option>
                    <option>M/s Bharat Supply Corp</option>
                    <option>M/s Prime Foods Ltd</option>
                    <option>M/s Apex Manufacturing Ltd</option>
                    <option>M/s Metro Supplies Corp</option>
                    <option>M/s National Logistics</option>
                  </select>
                  <ChevronDown className="w-4 h-4 absolute right-2.5 top-3 pointer-events-none text-slate-400" />
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">Challan / PO Number <span className="text-rose-500">*</span></label>
                <input type="text" value={challanNo} onChange={(e) => setChallanNo(e.target.value.toUpperCase())} placeholder="e.g. CH-2026-9912" required className="w-full px-3 py-2 rounded-lg border border-slate-300 text-sm font-mono font-bold focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500" />
              </div>
            </div>
          </div>

          {/* Material Items */}
          <div className="bg-white rounded-2xl p-5 sm:p-7 border border-slate-200 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Package className="w-4 h-4 text-indigo-600" /> 3. Declared Material / Packaging
              </h3>
              <button type="button" onClick={handleAddItem} className="px-3 py-1.5 rounded-xl bg-indigo-50 hover:bg-indigo-600 text-indigo-700 hover:text-white border border-indigo-200 text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer">
                <Plus className="w-3.5 h-3.5" /> Add Item
              </button>
            </div>
            <div className="overflow-x-auto rounded-xl border border-slate-100">
              <table className="w-full text-left text-sm min-w-[680px]">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50/70 text-slate-600 text-xs uppercase tracking-wider font-bold">
                    <th className="py-3 px-3 w-8 text-center">#</th>
                    <th className="py-3 px-3">Product</th>
                    <th className="py-3 px-3 w-28">Qty</th>
                    <th className="py-3 px-3 w-44">Packaging Unit</th>
                    <th className="py-3 px-3 w-40">Base Estimate</th>
                    <th className="py-3 px-3 w-32">Remarks</th>
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
                          <select value={item.productSku} onChange={(e) => handleItemChange(item.id, 'productSku', e.target.value)} required className="w-full px-2 py-1.5 rounded-lg border border-slate-300 text-xs bg-white focus:outline-none focus:ring-1 focus:ring-indigo-500">
                            <option value="">Select Product</option>
                            {products.map((p) => (
                              <option key={p.sku} value={p.sku}>{p.name}</option>
                            ))}
                          </select>
                        </td>
                        <td className="py-3 px-3">
                          <input type="number" min="1" value={item.packageQty} onChange={(e) => handleItemChange(item.id, 'packageQty', e.target.value)} placeholder="Qty" required className="w-full px-2 py-1.5 rounded-lg border border-slate-300 text-xs font-bold focus:outline-none focus:ring-1 focus:ring-indigo-500" />
                        </td>
                        <td className="py-3 px-3">
                          <span className="text-xs font-semibold text-slate-700 bg-slate-50 px-2 py-1.5 rounded-md border border-slate-200 block truncate">
                            {selectedProd ? `${selectedProd.outerPackaging} = ${selectedProd.packSize} ${selectedProd.baseUnit}` : '—'}
                          </span>
                        </td>
                        <td className="py-3 px-3">
                          <span className="text-xs font-semibold text-emerald-800 bg-emerald-50 px-2 py-1 rounded-md border border-emerald-200 block truncate">
                            {item.baseUnitEstimate || 'Auto-calc'}
                          </span>
                        </td>
                        <td className="py-3 px-3">
                          <input type="text" value={item.remarks} onChange={(e) => handleItemChange(item.id, 'remarks', e.target.value)} placeholder="Note..." className="w-full px-2 py-1.5 rounded-lg border border-slate-300 text-xs focus:outline-none focus:ring-1 focus:ring-indigo-500" />
                        </td>
                        <td className="py-3 px-3 text-center">
                          <button type="button" onClick={() => handleRemoveItem(item.id)} disabled={materialItems.length === 1} className="text-slate-400 hover:text-rose-600 disabled:opacity-30 cursor-pointer p-1 rounded hover:bg-rose-50 transition-colors">
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

          {/* Remarks + Submit */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            <input type="text" value={remarks} onChange={(e) => setRemarks(e.target.value)} placeholder="Gate officer remarks (optional)..." className="flex-1 px-4 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 bg-white" />
            <div className="flex gap-3 shrink-0">
              <button type="button" onClick={handleReset} className="px-5 py-2.5 rounded-xl border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 text-sm font-bold cursor-pointer transition-colors">
                Clear
              </button>
              <button type="submit" disabled={loading} className="px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-bold flex items-center gap-2 cursor-pointer shadow-sm transition-all disabled:opacity-60">
                <Printer className="w-4 h-4" />
                {loading ? 'Saving...' : 'Register & Print Pass'}
              </button>
            </div>
          </div>
        </form>
      )}

      {/* TAB: VEHICLES INSIDE */}
      {activeTab === 'queue' && (
        <div className="bg-white rounded-2xl p-5 sm:p-7 border border-slate-200 shadow-sm space-y-5">
          <h3 className="text-lg font-bold text-slate-900 border-b border-slate-100 pb-3">Vehicles Inside Warehouse</h3>
          {activeVehicles.length === 0 ? (
            <div className="py-16 text-center">
              <Truck className="w-12 h-12 mx-auto mb-3 text-slate-300" />
              <p className="text-slate-500 font-semibold">No vehicles inside premises</p>
              <button onClick={() => setActiveTab('new')} className="mt-4 px-5 py-2 bg-indigo-600 text-white rounded-xl text-xs font-bold hover:bg-indigo-700 transition-colors">
                Register New Entry
              </button>
            </div>
          ) : (
            <div className="overflow-x-auto rounded-xl border border-slate-100">
              <table className="w-full text-left text-sm min-w-[800px]">
                <thead>
                  <tr className="bg-slate-50/70 border-b border-slate-200 text-slate-600 text-xs uppercase tracking-wider font-bold">
                    <th className="py-4 px-4">Pass No.</th>
                    <th className="py-4 px-4">Vehicle</th>
                    <th className="py-4 px-4">Driver</th>
                    <th className="py-4 px-4">Supplier / Challan</th>
                    <th className="py-4 px-4">Bay</th>
                    <th className="py-4 px-4">In Time</th>
                    <th className="py-4 px-4 text-center">Status</th>
                    <th className="py-4 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 bg-white">
                  {activeVehicles.map((v) => (
                    <tr key={v._id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-4 px-4 font-mono font-bold text-indigo-700">{v.passNumber}</td>
                      <td className="py-4 px-4">
                        <span className="font-mono font-bold text-slate-900 bg-slate-100 px-2.5 py-1 rounded-md border border-slate-200">{v.vehicleNumber}</span>
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
                      <td className="py-4 px-4 text-xs font-semibold text-slate-700 bg-slate-50">{v.assignedBay}</td>
                      <td className="py-4 px-4 text-xs font-mono text-slate-500">{fmt(v.inTime)}</td>
                      <td className="py-4 px-4 text-center">
                        <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-amber-50 text-amber-700 border border-amber-200">{v.status}</span>
                      </td>
                      <td className="py-4 px-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button type="button" onClick={() => setActivePassModal(v)} className="px-3 py-1.5 rounded-lg border border-slate-300 hover:bg-slate-100 text-slate-700 text-xs font-semibold cursor-pointer transition-colors">
                            Slip
                          </button>
                          <button type="button" onClick={() => handleGateOut(v._id)} className="px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold cursor-pointer flex items-center gap-1.5 transition-colors">
                            <LogOut className="w-3.5 h-3.5" /> Gate Out
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* TAB: GATE LOG */}
      {activeTab === 'log' && (
        <div className="bg-white rounded-2xl p-5 sm:p-7 border border-slate-200 shadow-sm space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
            <h3 className="text-lg font-bold text-slate-900">Daily Gate Register</h3>
            <div className="flex items-center gap-2">
              <div className="relative">
                <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400 pointer-events-none" />
                <input type="text" value={logSearch} onChange={(e) => setLogSearch(e.target.value)} placeholder="Search..." className="pl-9 pr-3 py-2 rounded-xl border border-slate-300 text-xs w-52 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500" />
              </div>
              <select value={logFilter} onChange={(e) => setLogFilter(e.target.value)} className="px-3 py-2 rounded-xl border border-slate-300 text-xs bg-white font-semibold focus:outline-none">
                <option value="All">All</option>
                <option value="Inside">Inside Only</option>
                <option value="Cleared">Cleared Only</option>
              </select>
            </div>
          </div>
          <div className="overflow-x-auto rounded-xl border border-slate-100">
            <table className="w-full text-left text-sm min-w-[800px]">
              <thead>
                <tr className="bg-slate-50/70 border-b border-slate-200 text-slate-600 text-xs uppercase tracking-wider font-bold">
                  <th className="py-4 px-4">Pass No.</th>
                  <th className="py-4 px-4">Vehicle</th>
                  <th className="py-4 px-4">Driver</th>
                  <th className="py-4 px-4">Supplier</th>
                  <th className="py-4 px-4">Challan</th>
                  <th className="py-4 px-4">In Time</th>
                  <th className="py-4 px-4">Out Time</th>
                  <th className="py-4 px-4 text-center">Status</th>
                  <th className="py-4 px-4 text-right">Pass</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 bg-white">
                {filteredLog.map((e) => (
                  <tr key={e._id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-4 px-4 font-mono font-bold text-indigo-700">{e.passNumber}</td>
                    <td className="py-4 px-4 font-mono font-bold text-slate-900">
                      <span className="bg-slate-100 px-2.5 py-1 rounded-md border border-slate-200">{e.vehicleNumber}</span>
                    </td>
                    <td className="py-4 px-4 font-bold text-slate-900">{e.driverName}</td>
                    <td className="py-4 px-4 text-slate-700">{e.supplier}</td>
                    <td className="py-4 px-4 font-mono text-slate-600">{e.challanNo}</td>
                    <td className="py-4 px-4 font-mono text-slate-500 text-xs">{fmt(e.inTime)}</td>
                    <td className="py-4 px-4 font-mono text-slate-500 text-xs">
                      {e.outTime ? fmt(e.outTime) : <span className="text-amber-600 font-semibold bg-amber-50 px-2 py-0.5 rounded border border-amber-200">On-site</span>}
                    </td>
                    <td className="py-4 px-4 text-center">
                      <span className={`text-xs font-semibold px-2.5 py-1 rounded-full border ${e.status === 'Gate Out / Cleared' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-amber-50 text-amber-700 border-amber-200'}`}>
                        {e.status}
                      </span>
                    </td>
                    <td className="py-4 px-4 text-right">
                      <button type="button" onClick={() => setActivePassModal(e)} className="px-3 py-1.5 rounded-lg border border-slate-300 hover:bg-slate-100 text-slate-700 text-xs font-semibold cursor-pointer inline-flex items-center gap-1.5 transition-colors">
                        <Printer className="w-3.5 h-3.5" /> View
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* GATE PASS MODAL */}
      {activePassModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-white rounded-2xl max-w-lg w-full max-h-[90dvh] overflow-y-auto shadow-2xl border border-slate-200">
            <div id="printable-gate-entry-pass">
              <div className="bg-slate-900 text-white p-5 rounded-t-2xl flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-indigo-600 flex items-center justify-center">
                  <Truck className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-extrabold text-base">WAREHOUSE OPERATIONS</h3>
                  <p className="text-xs text-indigo-300 font-semibold uppercase tracking-wider">Official Vehicle Inward Gate Pass</p>
                </div>
              </div>
              <div className="p-6 space-y-4 text-sm">
                <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl border border-slate-200">
                  <div>
                    <p className="text-xs uppercase font-bold text-slate-500">Gate Pass Token</p>
                    <p className="text-lg font-extrabold text-indigo-700 font-mono">{activePassModal.passNumber}</p>
                    <p className="text-xs text-slate-600 mt-1">Bay: <strong>{activePassModal.assignedBay}</strong></p>
                  </div>
                  <div className="w-16 h-16 bg-white border border-slate-300 rounded-xl p-2 flex flex-col items-center justify-center">
                    <QrCode className="w-10 h-10 text-slate-800" />
                    <span className="text-[9px] font-mono font-bold text-slate-500 mt-0.5">GATE-PASS</span>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3 border-y border-slate-200 py-4 text-xs">
                  <div><span className="text-slate-500 block">Vehicle No.</span><span className="font-mono font-bold text-slate-900">{activePassModal.vehicleNumber}</span></div>
                  <div><span className="text-slate-500 block">Vehicle Type</span><span className="font-semibold text-slate-800">{activePassModal.vehicleType}</span></div>
                  <div><span className="text-slate-500 block">Driver Name</span><span className="font-bold text-slate-900">{activePassModal.driverName}</span></div>
                  <div><span className="text-slate-500 block">Driver Phone</span><span className="font-mono text-slate-800">{activePassModal.driverContact}</span></div>
                  <div><span className="text-slate-500 block">Supplier</span><span className="font-semibold text-slate-800">{activePassModal.supplier}</span></div>
                  <div><span className="text-slate-500 block">Challan / PO</span><span className="font-mono font-bold text-indigo-700">{activePassModal.challanNo}</span></div>
                  <div><span className="text-slate-500 block">In Time</span><span className="font-mono text-slate-700">{fmt(activePassModal.inTime)}</span></div>
                  <div><span className="text-slate-500 block">Status</span><span className="font-bold text-amber-700">{activePassModal.status}</span></div>
                </div>
                {activePassModal.materialItems?.length > 0 && (
                  <div className="bg-indigo-50 p-3.5 rounded-xl border border-indigo-100">
                    <p className="text-xs font-bold uppercase text-indigo-900 mb-1">Declared Material:</p>
                    {activePassModal.materialItems.map((m, i) => (
                      <p key={i} className="text-xs text-slate-700">{m.packageQty} {m.packagingUnit} — {m.product}</p>
                    ))}
                  </div>
                )}
                <div className="border-t border-dashed border-slate-300 pt-3 flex justify-between text-xs text-slate-500">
                  <span>Security Officer Verified</span>
                  <span className="font-mono font-bold text-slate-700">GRN Handover Copy</span>
                </div>
              </div>
            </div>
            <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-end gap-3">
              <button type="button" onClick={() => setActivePassModal(null)} className="px-4 py-2 border border-slate-300 rounded-xl text-xs font-semibold text-slate-700 hover:bg-white cursor-pointer">
                Close
              </button>
              <button type="button" onClick={() => printSpecificElement('#printable-gate-entry-pass', `Gate Pass - ${activePassModal.passNumber}`)} className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer">
                <Printer className="w-4 h-4" /> Print Gate Pass
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
