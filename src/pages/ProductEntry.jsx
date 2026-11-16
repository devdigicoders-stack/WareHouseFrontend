import { useState, useMemo, useRef, useEffect } from 'react'
import {
  Boxes,
  CheckCircle2,
  AlertTriangle,
  Package,
  Layers,
  Plus,
  Download,
  Search,
  Edit2,
  Trash2,
  X,
  Check,
  ChevronDown,
  QrCode,
  Tag,
  Shield,
  RefreshCw,
} from 'lucide-react'
import { apiRequest } from '../services/api'
import DataLoader from '../components/common/DataLoader'
import { getEslInfo } from '../utils/eslHelper'
import { formatDualUnits, MAXIMUM_UNIT_OPTIONS, MINIMUM_UNIT_OPTIONS } from '../utils/unitHelper'

import CustomSelect from '../components/common/SearchableSelect'

const CATEGORY_OPTIONS = [
  { value: 'Grains & Pulses', label: 'Grains & Pulses' },
  { value: 'Edible Oils & Liquids', label: 'Edible Oils & Liquids' },
  { value: 'Packaged Food & FMCG', label: 'Packaged Food & FMCG' },
  { value: 'Packaging & Materials', label: 'Packaging & Materials' },
  { value: 'Maintenance & Spares', label: 'Maintenance & Spares' },
  { value: 'Hygiene & Chemicals', label: 'Hygiene & Chemicals' },
  { value: 'Safety & First Aid', label: 'Safety & First Aid' },
]

const PACKAGING_OPTIONS = [
  { value: 'Bag', label: 'Bag (25kg - 50kg)' },
  { value: 'Tin', label: 'Tin / Can (15L)' },
  { value: 'Box', label: 'Box / Carton' },
  { value: 'Drum / Barrel', label: 'Drum / Barrel (20L - 200L)' },
  { value: 'Bundle', label: 'Bundle / Pack' },
  { value: 'Individual Unit', label: 'Individual Unit' },
]

const BASE_UNIT_OPTIONS = [
  { value: 'Kg', label: 'Kilograms (Kg)' },
  { value: 'Litre', label: 'Litres (Ltr)' },
  { value: 'Pieces', label: 'Pieces / Nos' },
  { value: 'Boxes', label: 'Boxes' },
  { value: 'Cartons', label: 'Cartons / Gatta' },
]

const STORAGE_ZONE_OPTIONS = [
  { value: 'SH-01 (Shed 1: Grains & Bulk Pulses)', label: 'SH-01 - Shed 1: Grains & Bulk Pulses' },
  { value: 'SH-02 (Shed 2: Edible Oils & Liquids)', label: 'SH-02 - Shed 2: Edible Oils & Liquids' },
  { value: 'SH-03 (Shed 3: FMCG & Packaged Foods)', label: 'SH-03 - Shed 3: FMCG & Packaged Foods' },
  { value: 'SH-04 (Shed 4: Packaging & Materials)', label: 'SH-04 - Shed 4: Packaging & Materials' },
  { value: 'SH-05 (Shed 5: Chemicals & Hygiene)', label: 'SH-05 - Shed 5: Chemicals & Hygiene' },
  { value: 'SH-06 (Shed 6: Spares & General Hardware)', label: 'SH-06 - Shed 6: Spares & General Hardware' },
]

export default function ProductEntry() {
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('All')
  const [showModal, setShowModal] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [toastMessage, setToastMessage] = useState(null)

  const [products, setProducts] = useState([])
  const [shades, setshades] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    setLoading(true)
    Promise.allSettled([
      apiRequest('/product'),
      apiRequest('/shade'),
    ]).then(([prodRes, shadeRes]) => {
      if (prodRes.status === 'fulfilled' && Array.isArray(prodRes.value)) setProducts(prodRes.value)
      if (shadeRes.status === 'fulfilled' && Array.isArray(shadeRes.value) && shadeRes.value.length > 0) setshades(shadeRes.value)
    }).finally(() => {
      setLoading(false)
    })
  }, [])

  const storageZoneOptions = useMemo(() => {
    if (shades && shades.length > 0) {
      return shades.map((s) => ({
        value: `${s.code} (${s.name})`,
        label: `${s.code} - ${s.name} (${s.type || 'Warehouse'})`,
      }))
    }
    return STORAGE_ZONE_OPTIONS
  }, [shades])

  // Form State
  const initialForm = {
    name: '',
    sku: '',
    category: 'Grains & Pulses',
    brand: '',
    maxUnit: 'Carton',
    minUnit: 'Packet',
    conversionRatio: '10',
    baseUnit: 'Packet',
    outerPackaging: 'Carton',
    packSize: '10',
    storageZone: shades.length > 0 ? `${shades[0].code} (${shades[0].name})` : 'Shed 1 (General Stores)',
    reorderLevel: '50',
    currentStock: '0',
    barcode: '',
    hsnCode: '',
    description: '',
  }
  const [formData, setFormData] = useState(initialForm)

  // Toast trigger
  const triggerToast = (msg) => {
    setToastMessage(msg)
    setTimeout(() => setToastMessage(null), 3500)
  }

  // Filtered Products
  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      if (selectedCategory !== 'All' && p.category !== selectedCategory) return false

      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase()
        return (
          p.name.toLowerCase().includes(q) ||
          p.sku.toLowerCase().includes(q) ||
          p.category.toLowerCase().includes(q) ||
          p.brand.toLowerCase().includes(q) ||
          p.storageZone.toLowerCase().includes(q)
        )
      }
      return true
    })
  }, [products, selectedCategory, searchQuery])

  // Open Create Modal
  const handleOpenCreate = () => {
    setEditingId(null)
    const randomSku = `PRD-SKU-${Math.floor(100 + Math.random() * 900)}`
    setFormData({ ...initialForm, sku: randomSku })
    setShowModal(true)
  }

  const handleOpenEdit = (prod) => {
    setEditingId(prod._id)
    const maxU = prod.maxUnit || prod.outerPackaging || 'Carton'
    const minU = prod.minUnit || prod.baseUnit || 'Packet'
    const ratio = String(prod.conversionRatio || prod.packSize || 10)
    setFormData({
      name: prod.name,
      sku: prod.sku,
      category: prod.category,
      brand: prod.brand,
      maxUnit: maxU,
      minUnit: minU,
      conversionRatio: ratio,
      baseUnit: minU,
      outerPackaging: maxU,
      packSize: ratio,
      storageZone: prod.storageZone,
      reorderLevel: String(prod.reorderLevel),
      currentStock: String(prod.currentStock),
      barcode: prod.barcode || '',
      hsnCode: prod.hsnCode || '',
      description: prod.description || '',
    })
    setShowModal(true)
  }

  const handleSaveProduct = async (e) => {
    e.preventDefault()
    if (!formData.name.trim()) { triggerToast('Product name is required!'); return }

    const stock = Number(formData.currentStock) || 0
    const reorder = Number(formData.reorderLevel) || 50
    const status = stock <= 0 ? 'Out of Stock' : stock <= reorder ? 'Low Stock' : 'Active'
    const maxU = formData.maxUnit || formData.outerPackaging || 'Carton'
    const minU = formData.minUnit || formData.baseUnit || 'Packet'
    const ratio = Number(formData.conversionRatio) || Number(formData.packSize) || 1

    const payload = {
      ...formData,
      name: formData.name.trim(),
      sku: formData.sku.trim(),
      brand: formData.brand.trim() || 'Standard Commercial',
      maxUnit: maxU,
      minUnit: minU,
      conversionRatio: ratio,
      outerPackaging: maxU,
      baseUnit: minU,
      packSize: ratio,
      currentStock: stock,
      reorderLevel: reorder,
      status,
    }

    try {
      if (editingId) {
        const updated = await apiRequest(`/product/${editingId}`, { method: 'PUT', body: JSON.stringify(payload) })
        setProducts((p) => p.map((x) => x._id === editingId ? updated : x))
        triggerToast(`Product "${updated.name}" updated successfully!`)
      } else {
        const created = await apiRequest('/product', { method: 'POST', body: JSON.stringify(payload) })
        setProducts((p) => [created, ...p])
        triggerToast(`Product "${created.name}" added to master catalog!`)
      }
    } catch (err) {
      triggerToast(err.message || 'Failed to save product')
    }

    setShowModal(false)
    setFormData(initialForm)
  }

  const handleDeleteProduct = async (id, name) => {
    try {
      await apiRequest(`/product/${id}`, { method: 'DELETE' })
      setProducts((p) => p.filter((x) => x._id !== id))
      triggerToast(`Product "${name}" removed.`)
    } catch {
      triggerToast('Failed to delete product')
    }
  }

  // Export CSV
  const handleExportCSV = () => {
    const headers = [
      'Product Name',
      'SKU Code',
      'Category',
      'Brand',
      'Packaging Unit',
      'Pack Size',
      'Base Unit',
      'Current Stock',
      'Reorder Level',
      'Storage Zone',
      'Status',
    ]
    const rows = products.map((p) => [
      `"${p.name}"`,
      p.sku,
      `"${p.category}"`,
      `"${p.brand}"`,
      `"${p.outerPackaging}"`,
      p.packSize,
      `"${p.baseUnit}"`,
      p.currentStock,
      p.reorderLevel,
      `"${p.storageZone}"`,
      p.status,
    ])
    const csvContent =
      'data:text/csv;charset=utf-8,' +
      [headers.join(','), ...rows.map((e) => e.join(','))].join('\n')
    const encodedUri = encodeURI(csvContent)
    const link = document.createElement('a')
    link.setAttribute('href', encodedUri)
    link.setAttribute('download', 'Warehouse_Product_Catalog.csv')
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    triggerToast('Product catalog exported to CSV successfully.')
  }

  // Status Badge Styling
  const getStatusBadge = (status) => {
    switch (status) {
      case 'Active':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200'
      case 'Low Stock':
        return 'bg-amber-50 text-amber-700 border-amber-200'
      case 'Out of Stock':
        return 'bg-rose-50 text-rose-700 border-rose-200'
      default:
        return 'bg-slate-50 text-slate-700 border-slate-200'
    }
  }

  return (
    <div className="space-y-6 max-w-[1720px] mx-auto pb-10 select-none">
      {/* Toast Alert */}
      {toastMessage && (
        <div className="fixed top-5 right-5 z-[9999] pointer-events-auto bg-slate-900 text-white px-4 py-3 rounded-xl shadow-2xl border border-slate-700 flex items-center gap-3 animate-fade-in text-sm font-semibold">
          <div className="w-6 h-6 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
            <Check className="w-4 h-4" />
          </div>
          <span>{toastMessage}</span>
        </div>
      )}

      {/* 1. Header Banner - Clean, Modern & Professional */}
      <div className="bg-white rounded-2xl p-4 sm:p-6 border border-slate-200 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-start gap-3 sm:gap-4 min-w-0 flex-1">
          <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-indigo-50 border border-indigo-100 text-indigo-600 flex items-center justify-center shrink-0 shadow-xs mt-0.5">
            <Boxes className="w-5 h-5 sm:w-6 sm:h-6" />
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2 mb-1">
              <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 shrink-0">
                ● Master Inventory Online
              </span>
            </div>
            <h1 className="text-lg sm:text-xl lg:text-2xl font-bold text-slate-900 leading-tight">
              Product Catalog &amp; SKU Master
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 font-medium mt-1 leading-relaxed">
              Maintain product specifications, outer packaging ratios, SKU codes, and Shed storage zones
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2.5 w-full sm:w-auto shrink-0">
          <button
            type="button"
            onClick={handleExportCSV}
            className="flex-1 sm:flex-none justify-center px-4 py-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs sm:text-sm font-bold flex items-center gap-2 transition cursor-pointer shadow-2xs"
          >
            <Download className="w-4 h-4 text-slate-500 shrink-0" />
            <span>Export Catalog</span>
          </button>

          <button
            type="button"
            onClick={handleOpenCreate}
            className="flex-1 sm:flex-none justify-center px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white text-xs sm:text-sm font-bold flex items-center gap-2 transition cursor-pointer shadow-xs"
          >
            <Plus className="w-4 h-4 shrink-0" />
            <span>Add New Product</span>
          </button>
        </div>
      </div>

      {/* 2. Dynamic KPI Stat Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-2xl p-4.5 border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Total SKUs</p>
            <p className="text-2xl font-extrabold text-slate-900 mt-1">{products.length}</p>
            <p className="text-xs text-slate-500 font-medium mt-0.5">Master Registered Items</p>
          </div>
          <div className="w-11 h-11 rounded-xl bg-indigo-50 border border-indigo-100 text-indigo-600 flex items-center justify-center shrink-0">
            <Boxes className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white rounded-2xl p-4.5 border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Active Inventory</p>
            <p className="text-2xl font-extrabold text-emerald-600 mt-1">
              {products.filter((p) => p.status === 'Active').length}
            </p>
            <p className="text-xs text-emerald-600 font-semibold mt-0.5">Ready for Inward/Dispatch</p>
          </div>
          <div className="w-11 h-11 rounded-xl bg-emerald-50 border border-emerald-100 text-emerald-600 flex items-center justify-center shrink-0">
            <CheckCircle2 className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white rounded-2xl p-4.5 border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Low Stock Alerts</p>
            <p className="text-2xl font-extrabold text-amber-600 mt-1">
              {products.filter((p) => p.status === 'Low Stock').length}
            </p>
            <p className="text-xs text-amber-600 font-semibold mt-0.5">Below Reorder Level</p>
          </div>
          <div className="w-11 h-11 rounded-xl bg-amber-50 border border-amber-100 text-amber-600 flex items-center justify-center shrink-0">
            <AlertTriangle className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white rounded-2xl p-4.5 border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Categories</p>
            <p className="text-2xl font-extrabold text-indigo-600 mt-1">
              {new Set(products.map((p) => p.category)).size}
            </p>
            <p className="text-xs text-slate-500 font-medium mt-0.5">Material Classifications</p>
          </div>
          <div className="w-11 h-11 rounded-xl bg-indigo-50 border border-indigo-100 text-indigo-600 flex items-center justify-center shrink-0">
            <Layers className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* 3. Filter Navigation & Live Search Bar */}
      <div className="bg-white rounded-2xl p-3 border border-slate-200 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        {/* Category Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto p-1 bg-slate-100 rounded-xl text-xs font-semibold">
          <button
            type="button"
            onClick={() => setSelectedCategory('All')}
            className={`px-3.5 py-2 rounded-lg transition whitespace-nowrap cursor-pointer ${
              selectedCategory === 'All'
                ? 'bg-indigo-600 text-white shadow-xs font-bold'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/70'
            }`}
          >
            All Products ({products.length})
          </button>

          {Array.from(new Set(products.map((p) => p.category))).map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => setSelectedCategory(cat)}
              className={`px-3.5 py-2 rounded-lg transition whitespace-nowrap cursor-pointer ${
                selectedCategory === cat
                  ? 'bg-indigo-600 text-white shadow-xs font-bold'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/70'
              }`}
            >
              {cat} ({products.filter((p) => p.category === cat).length})
            </button>
          ))}
        </div>

        {/* Live Search */}
        <div className="relative flex-1 sm:max-w-xs">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3 pointer-events-none" />
          <input
            type="text"
            placeholder="Search product, SKU, brand, shed..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-50 border border-slate-300 rounded-xl pl-9 pr-3 py-2 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 focus:bg-white"
          />
        </div>
      </div>

      {/* 4. Full-Width Spacious Products Table */}
      <div className="bg-white rounded-2xl p-4 sm:p-6 border border-slate-200 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 sm:gap-3 border-b border-slate-100 pb-3">
          <div className="min-w-0">
            <h3 className="text-sm sm:text-base font-bold text-slate-900 flex flex-wrap items-center gap-2">
              <span>Master Inventory &amp; SKU Catalog</span>
              <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 shrink-0">
                {filteredProducts.length} of {products.length}
              </span>
            </h3>
            <p className="text-xs text-slate-500 mt-0.5 leading-relaxed">
              Standard product master data with outer packaging conversions and storage zones
            </p>
          </div>

          <div className="text-xs font-semibold text-slate-500 bg-slate-50 border border-slate-200 px-3 py-1.5 rounded-lg shrink-0 self-start sm:self-auto">
            Catalog: Central Inventory Master
          </div>
        </div>

        <div className="overflow-x-auto rounded-xl border border-slate-200">
          <table className="w-full text-left text-sm min-w-[1100px]">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-200 text-slate-600 text-xs uppercase tracking-wider font-bold">
                <th className="py-3.5 px-3 w-10 text-center">#</th>
                <th className="py-3.5 px-4 w-32">SKU / Code</th>
                <th className="py-3.5 px-4 min-w-[240px]">Product Name &amp; Brand</th>
                <th className="py-3.5 px-4 min-w-[160px]">Category</th>
                <th className="py-3.5 px-4 min-w-[160px]">Packaging Ratio</th>
                <th className="py-3.5 px-4 min-w-[180px]">Storage Shed</th>
                <th className="py-3.5 px-4 min-w-[140px]">Expiry / ESL</th>
                <th className="py-3.5 px-4 w-28 text-right">Stock</th>
                <th className="py-3.5 px-4 w-28 text-right">Reorder</th>
                <th className="py-3.5 px-4 text-center w-28">Status</th>
                <th className="py-3.5 px-5 text-right w-28">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 bg-white">
              {loading ? (
                <tr>
                  <td colSpan="11" className="py-8">
                    <DataLoader
                      text="Loading Product Master Catalog..."
                      subtext="Fetching registered items, SKUs, and packaging specs..."
                      size="md"
                    />
                  </td>
                </tr>
              ) : filteredProducts.length === 0 ? (
                <tr>
                  <td colSpan="11" className="py-10 text-center text-slate-400 text-sm">
                    No products found matching current category or search criteria.
                  </td>
                </tr>
              ) : (
                filteredProducts.map((p, idx) => {
                  const esl = getEslInfo(p)
                  return (
                  <tr key={p._id || p.id || idx} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3.5 px-3 text-center text-slate-400 font-mono text-xs font-semibold">
                      {idx + 1}
                    </td>
                    <td className="py-3.5 px-4 font-mono font-bold text-indigo-700 whitespace-nowrap">
                      {p.sku}
                    </td>
                    <td className="py-3.5 px-4">
                      <p className="font-bold text-slate-900">{p.name}</p>
                      <p className="text-xs text-slate-500 font-medium">{p.brand}</p>
                    </td>
                    <td className="py-3.5 px-4 text-slate-700 whitespace-nowrap font-medium text-xs">
                      {p.category}
                    </td>
                    <td className="py-3.5 px-4 text-xs whitespace-nowrap font-mono text-slate-700">
                      <div className="font-bold text-slate-900">
                        1 {p.maxUnit || p.outerPackaging} = <strong>{p.conversionRatio || p.packSize} {p.minUnit || p.baseUnit}s</strong>
                      </div>
                      <div className="text-[10px] text-slate-400 font-sans mt-0.5">
                        Max: {p.maxUnit || p.outerPackaging} • Min: {p.minUnit || p.baseUnit}
                      </div>
                    </td>
                    <td className="py-3.5 px-4 text-xs font-semibold text-slate-800 whitespace-nowrap">
                      {p.storageZone}
                    </td>
                    <td className="py-3.5 px-4 text-xs whitespace-nowrap font-mono">
                      <div className="font-bold text-slate-800">{esl.expiryFormatted}</div>
                      <div className="text-[10px] text-emerald-600 font-semibold">{esl.eslText}</div>
                    </td>
                    <td className="py-3.5 px-4 text-right whitespace-nowrap text-xs">
                      {(() => {
                        const dual = formatDualUnits(
                          p.currentStock,
                          p.conversionRatio || p.packSize,
                          p.maxUnit || p.outerPackaging,
                          p.minUnit || p.baseUnit
                        )
                        return (
                          <div>
                            <div className="font-mono font-bold text-slate-900">
                              {dual.totalQty} <span className="font-normal text-slate-500">{dual.minUnit}</span>
                            </div>
                            <div className="text-[10px] font-semibold text-indigo-600 font-mono mt-0.5">
                              {dual.breakdownText}
                            </div>
                          </div>
                        )
                      })()}
                    </td>
                    <td className="py-3.5 px-4 text-right whitespace-nowrap font-mono font-semibold text-slate-600 text-xs">
                      {p.reorderLevel} <span className="font-normal text-slate-400">{p.baseUnit}</span>
                    </td>
                    <td className="py-3.5 px-4 text-center whitespace-nowrap">
                      <span
                        className={`text-xs font-semibold px-2.5 py-1 rounded-full border ${getStatusBadge(
                          p.status
                        )}`}
                      >
                        {p.status}
                      </span>
                    </td>
                    <td className="py-3.5 px-5 text-right whitespace-nowrap">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          type="button"
                          onClick={() => handleOpenEdit(p)}
                          className="p-1.5 rounded-lg bg-indigo-50 hover:bg-indigo-600 text-indigo-700 hover:text-white border border-indigo-200 hover:border-indigo-600 transition cursor-pointer shadow-2xs"
                          title="Edit Product"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeleteProduct(p._id, p.name)}
                          className="p-1.5 rounded-lg bg-slate-50 hover:bg-rose-600 text-slate-500 hover:text-white border border-slate-200 hover:border-rose-600 transition cursor-pointer shadow-2xs"
                          title="Delete Product"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                )})
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ========================================================= */}
      {/* ADD / EDIT PRODUCT MODAL (CUSTOM SELECTS, ZERO FLICKER)   */}
      {/* ========================================================= */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 animate-fade-in">
          <div className="bg-white rounded-2xl shadow-2xl max-w-xl w-full max-h-[90dvh] overflow-y-auto p-4 sm:p-6 space-y-5 animate-scale-in border border-slate-200">
            {/* Header */}
            <div className="flex items-center justify-between border-b pb-4 border-slate-100">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-indigo-50 border border-indigo-100 text-indigo-600 flex items-center justify-center font-bold">
                  <Boxes className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">
                    {editingId ? 'Edit Product Master' : 'Add New Product to Catalog'}
                  </h3>
                  <p className="text-xs text-slate-500">
                    Configure SKU identifiers, packaging conversion, and storage rules
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowModal(false)}
                className="text-slate-400 hover:text-slate-700 p-1.5 rounded-lg hover:bg-slate-100 cursor-pointer transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveProduct} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    Product / Item Name <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Basmati Rice Superior (25kg)"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full bg-white border border-slate-300 rounded-xl px-3.5 py-2.5 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    SKU Code <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="PRD-RIC-001"
                    value={formData.sku}
                    onChange={(e) => setFormData({ ...formData, sku: e.target.value.toUpperCase() })}
                    className="w-full bg-white border border-slate-300 rounded-xl px-3.5 py-2.5 text-xs font-mono font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <CustomSelect
                  label="Category Group"
                  value={formData.category}
                  onChange={(val) => setFormData({ ...formData, category: val })}
                  options={CATEGORY_OPTIONS}
                  zIndexClass="z-40"
                />

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">Brand / Manufacturer</label>
                  <input
                    type="text"
                    placeholder="e.g. India Gate, Fortune Foods"
                    value={formData.brand}
                    onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
                    className="w-full bg-white border border-slate-300 rounded-xl px-3.5 py-2.5 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                  />
                </div>
              </div>

              {/* Dual Unit & Packaging Conversion Configuration (Inward Bada Pack vs Outward Loose Piece) */}
              <div className="bg-indigo-50/70 p-3.5 rounded-2xl border border-indigo-100 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Package className="w-4 h-4 text-indigo-600" />
                    <span className="text-xs font-bold text-indigo-950 uppercase tracking-wider">
                      Dual-Unit & Packaging Configuration (In & Out Formats)
                    </span>
                  </div>
                  <span className="text-[10px] font-bold text-indigo-700 bg-white px-2 py-0.5 rounded-full border border-indigo-200">
                    Max vs Min Units
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">
                      1. Maximum Unit (Inward Bulk Pack) <span className="text-rose-500">*</span>
                    </label>
                    <CustomSelect
                      value={formData.maxUnit || formData.outerPackaging}
                      onChange={(val) => setFormData({ ...formData, maxUnit: val, outerPackaging: val })}
                      options={MAXIMUM_UNIT_OPTIONS}
                      zIndexClass="z-30"
                    />
                    <p className="text-[10px] text-slate-500 mt-1 font-medium">
                      Bada pack (e.g. Carton, Box, Bag)
                    </p>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">
                      2. Conversion Ratio <span className="text-rose-500">*</span>
                    </label>
                    <div className="relative">
                      <input
                        type="number"
                        min="1"
                        required
                        placeholder="10"
                        value={formData.conversionRatio || formData.packSize}
                        onChange={(e) => setFormData({ ...formData, conversionRatio: e.target.value, packSize: e.target.value })}
                        className="w-full bg-white border border-slate-300 rounded-xl px-3.5 py-2.5 text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                      />
                      <span className="absolute right-3 top-2.5 text-[10px] font-mono text-slate-400">
                        per {formData.maxUnit || 'Pack'}
                      </span>
                    </div>
                    <p className="text-[10px] text-slate-500 mt-1 font-medium">
                      Number of units contained in 1 pack
                    </p>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">
                      3. Minimum Unit (Outward Loose Piece) <span className="text-rose-500">*</span>
                    </label>
                    <CustomSelect
                      value={formData.minUnit || formData.baseUnit}
                      onChange={(val) => setFormData({ ...formData, minUnit: val, baseUnit: val })}
                      options={MINIMUM_UNIT_OPTIONS}
                      zIndexClass="z-30"
                    />
                    <p className="text-[10px] text-slate-500 mt-1 font-medium">
                      Chhota piece (e.g. Packet, Piece, Kg)
                    </p>
                  </div>
                </div>

                {/* Live Interactive Conversion Preview Banner */}
                <div className="p-2.5 bg-white rounded-xl border border-indigo-200/80 flex flex-col sm:flex-row sm:items-center justify-between text-xs font-mono gap-1.5">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                    <span className="text-slate-700 font-medium">Formula:</span>
                    <strong className="text-indigo-900 font-bold">
                      1 {formData.maxUnit || 'Carton'} = {formData.conversionRatio || formData.packSize || 10} {formData.minUnit || 'Packet'}s
                    </strong>
                  </div>
                  <span className="text-[10px] text-emerald-700 font-sans font-semibold bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 self-start sm:self-auto">
                    Inward in {formData.maxUnit || 'Carton'}s • Outward in Loose {formData.minUnit || 'Packet'}s
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="sm:col-span-2">
                  <CustomSelect
                    label="Assigned Storage Shed"
                    value={formData.storageZone}
                    onChange={(val) => setFormData({ ...formData, storageZone: val })}
                    options={storageZoneOptions}
                    zIndexClass="z-20"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    Reorder Alert Level
                  </label>
                  <input
                    type="number"
                    min="1"
                    placeholder="50"
                    value={formData.reorderLevel}
                    onChange={(e) => setFormData({ ...formData, reorderLevel: e.target.value })}
                    className="w-full bg-white border border-slate-300 rounded-xl px-3.5 py-2.5 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">Barcode / EAN</label>
                  <input
                    type="text"
                    placeholder="890103001001"
                    value={formData.barcode}
                    onChange={(e) => setFormData({ ...formData, barcode: e.target.value })}
                    className="w-full bg-white border border-slate-300 rounded-xl px-3.5 py-2.5 text-xs font-mono text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">HSN Tariff Code</label>
                  <input
                    type="text"
                    placeholder="1006.30"
                    value={formData.hsnCode}
                    onChange={(e) => setFormData({ ...formData, hsnCode: e.target.value })}
                    className="w-full bg-white border border-slate-300 rounded-xl px-3.5 py-2.5 text-xs font-mono text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                  />
                </div>
              </div>

              {/* Submit Buttons */}
              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 sm:flex-none justify-center px-4 py-2.5 border border-slate-300 rounded-xl text-slate-700 hover:bg-slate-50 font-bold cursor-pointer transition text-center"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 sm:flex-none justify-center bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 rounded-xl font-bold shadow-xs cursor-pointer transition text-center"
                >
                  {editingId ? 'Save Changes' : 'Register Product'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
