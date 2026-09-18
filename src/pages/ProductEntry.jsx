import { useState, useMemo } from 'react'
import { Link } from 'react-router-dom'
import {
  UtensilsCrossed,
  Target,
  Shirt,
  HeartPulse,
  Wrench,
  Truck,
  Radio,
  Package,
  Shield,
  Tent,
  Pill,
  Layers,
  Zap,
  Footprints,
  Plus,
  Fuel,
  Edit2,
  QrCode,
  Trash2,
  X,
  Upload,
  Download,
  RefreshCw,
  Barcode,
  CheckCircle2,
  AlertTriangle,
  Boxes,
  Search,
  FileSpreadsheet,
} from 'lucide-react'

export default function ProductEntry() {
  // Toast Notification state
  const [toastMessage, setToastMessage] = useState(null)

  // Mode: 'add' or 'edit'
  const [formMode, setFormMode] = useState('add') // 'add' | 'edit'
  const [editingId, setEditingId] = useState(null)

  // Search & Filter state
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('All')
  const [selectedStatus, setSelectedStatus] = useState('All')
  const [currentPage, setCurrentPage] = useState(1)
  const [perPage, setPerPage] = useState(5)

  // Modals state
  const [showScannerModal, setShowScannerModal] = useState(false)
  const [showImportModal, setShowImportModal] = useState(false)
  const [showLabelModal, setShowLabelModal] = useState(false)
  const [selectedProductForLabel, setSelectedProductForLabel] = useState(null)
  const [openActionMenuId, setOpenActionMenuId] = useState(null)

  // Form State
  const initialFormState = {
    name: '',
    sku: '',
    category: 'Grains & Pulses',
    brand: '',
    baseUnit: 'Kg',
    outerPackaging: 'Bag',
    packSize: '25',
    storageZone: 'Dry & Ambient Zone',
    reorderLevel: '100',
    openingStock: '0',
    barcode: '',
    hsnCode: '',
    description: '',
  }

  const [formData, setFormData] = useState(initialFormState)

  // Trigger Toast Notification
  const triggerToast = (msg) => {
    setToastMessage(msg)
    setTimeout(() => setToastMessage(null), 3500)
  }

  // Master Products List with Realistic Warehouse Inventory & Packaging Units
  const [products, setProducts] = useState([
    {
      id: 1,
      name: 'Rice (Basmati Superior 25kg)',
      sku: 'PRD-RIC-001',
      category: 'Grains & Pulses',
      brand: 'India Gate',
      baseUnit: 'Kg',
      outerPackaging: 'Bag',
      packSize: 25,
      currentStock: 1250,
      reorderLevel: 250,
      storageZone: 'Dry & Ambient Zone',
      status: 'Active',
      statusClass: 'bg-emerald-100 text-emerald-800 border-emerald-200',
      barcode: '890103001001',
      hsnCode: '1006.30',
      description: 'Premium aged long grain Basmati rice packed in heavy duty 25kg woven bags.',
    },
    {
      id: 2,
      name: 'Refined Mustard Oil (15L Tin)',
      sku: 'PRD-OIL-002',
      category: 'Edible Oils & Liquids',
      brand: 'Fortune',
      baseUnit: 'Litre',
      outerPackaging: 'Tin',
      packSize: 15,
      currentStock: 450,
      reorderLevel: 100,
      storageZone: 'Liquid & Oil Bay',
      status: 'Active',
      statusClass: 'bg-emerald-100 text-emerald-800 border-emerald-200',
      barcode: '890103001002',
      hsnCode: '1514.91',
      description: 'First-press refined mustard cooking oil in 15-litre food-grade sealed tin.',
    },
    {
      id: 3,
      name: 'Arhar / Toor Dal (Grade A)',
      sku: 'PRD-DAL-003',
      category: 'Grains & Pulses',
      brand: 'Tata Sampann',
      baseUnit: 'Kg',
      outerPackaging: 'Bag',
      packSize: 30,
      currentStock: 900,
      reorderLevel: 150,
      storageZone: 'Dry & Ambient Zone',
      status: 'Active',
      statusClass: 'bg-emerald-100 text-emerald-800 border-emerald-200',
      barcode: '890103001003',
      hsnCode: '0713.60',
      description: 'Unpolished protein-rich Toor dal in standard 30kg commercial packaging.',
    },
    {
      id: 4,
      name: 'Industrial First Aid Kit',
      sku: 'PRD-MED-004',
      category: 'Safety & First Aid',
      brand: 'Sanjivani Healthcare',
      baseUnit: 'Nos',
      outerPackaging: 'Box',
      packSize: 1,
      currentStock: 85,
      reorderLevel: 20,
      storageZone: 'Cool & Climate Controlled',
      status: 'Active',
      statusClass: 'bg-emerald-100 text-emerald-800 border-emerald-200',
      barcode: '890103001004',
      hsnCode: '3006.50',
      description: 'Comprehensive workplace safety kit with bandages, burn gel, and antiseptics.',
    },
    {
      id: 5,
      name: 'Industrial Lubricant 15W-40',
      sku: 'PRD-LUB-005',
      category: 'Maintenance & Spares',
      brand: 'Castrol CRB',
      baseUnit: 'Litre',
      outerPackaging: 'Drum / Barrel',
      packSize: 20,
      currentStock: 60,
      reorderLevel: 80,
      storageZone: 'Liquid & Oil Bay',
      status: 'Low Stock',
      statusClass: 'bg-amber-100 text-amber-800 border-amber-200',
      barcode: '890103001005',
      hsnCode: '2710.19',
      description: 'Heavy duty commercial forklift and fleet engine lubricant in 20L barrels.',
    },
    {
      id: 6,
      name: 'Heavy Duty Waterproof Tarpaulin',
      sku: 'PRD-TAR-006',
      category: 'Packaging & Materials',
      brand: 'Silpaulin',
      baseUnit: 'Pieces',
      outerPackaging: 'Bundle',
      packSize: 5,
      currentStock: 150,
      reorderLevel: 30,
      storageZone: 'Bulk Pallet Racks',
      status: 'Active',
      statusClass: 'bg-emerald-100 text-emerald-800 border-emerald-200',
      barcode: '890103001006',
      hsnCode: '6306.12',
      description: '24x18 ft multi-layered cross laminated waterproof cargo protective sheets.',
    },
    {
      id: 7,
      name: 'Corrugated Packaging Cartons',
      sku: 'PRD-BOX-007',
      category: 'Packaging & Materials',
      brand: 'PackWell',
      baseUnit: 'Pieces',
      outerPackaging: 'Bundle',
      packSize: 50,
      currentStock: 1200,
      reorderLevel: 200,
      storageZone: 'Bulk Pallet Racks',
      status: 'Active',
      statusClass: 'bg-emerald-100 text-emerald-800 border-emerald-200',
      barcode: '890103001007',
      hsnCode: '4819.10',
      description: '5-ply export quality shipping boxes for outer consignment dispatch packaging.',
    },
    {
      id: 8,
      name: 'Industrial Disinfectant 5L',
      sku: 'PRD-CHM-008',
      category: 'Hygiene & Chemicals',
      brand: 'Lizol Pro',
      baseUnit: 'Cans',
      outerPackaging: 'Box',
      packSize: 4,
      currentStock: 120,
      reorderLevel: 30,
      storageZone: 'Chemical Safety Bay',
      status: 'Active',
      statusClass: 'bg-emerald-100 text-emerald-800 border-emerald-200',
      barcode: '890103001008',
      hsnCode: '3808.94',
      description: 'Surface cleaner and disinfectant solution in 5-litre HDPE containers.',
    },
  ])

  // Categories Master matching realistic commercial warehouse needs
  const categoriesList = [
    { id: 'grains', name: 'Grains & Pulses', count: 245, icon: UtensilsCrossed },
    { id: 'oils', name: 'Edible Oils & Liquids', count: 180, icon: Fuel },
    { id: 'fmcg', name: 'Packaged Food & FMCG', count: 210, icon: Package },
    { id: 'packaging', name: 'Packaging & Materials', count: 165, icon: Layers },
    { id: 'maintenance', name: 'Maintenance & Spares', count: 98, icon: Wrench },
    { id: 'hygiene', name: 'Hygiene & Chemicals', count: 142, icon: Shield },
    { id: 'electrical', name: 'Electrical & Lighting', count: 86, icon: Zap },
    { id: 'safety', name: 'Safety & First Aid', count: 122, icon: HeartPulse },
  ]

  // Recent Added Products matching civilian warehouse items
  const recentAddedProducts = [
    { name: 'Rice (Basmati Superior)', sku: 'PRD-RIC-001', timeAgo: '2 hours ago', icon: UtensilsCrossed },
    { name: 'Refined Mustard Oil', sku: 'PRD-OIL-002', timeAgo: '5 hours ago', icon: Fuel },
    { name: 'Toor Dal (Grade A)', sku: 'PRD-DAL-003', timeAgo: '1 day ago', icon: Package },
    { name: 'Waterproof Tarpaulin', sku: 'PRD-TAR-006', timeAgo: '1 day ago', icon: Layers },
    { name: 'Packaging Cartons', sku: 'PRD-BOX-007', timeAgo: '2 days ago', icon: Package },
  ]

  // Filtered Products
  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      // Category filter
      if (selectedCategory !== 'All' && p.category !== selectedCategory) return false

      // Status filter
      if (selectedStatus !== 'All' && p.status !== selectedStatus) return false

      // Search Query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase()
        return (
          p.name.toLowerCase().includes(q) ||
          p.sku.toLowerCase().includes(q) ||
          p.category.toLowerCase().includes(q) ||
          (p.brand && p.brand.toLowerCase().includes(q))
        )
      }
      return true
    })
  }, [products, selectedCategory, selectedStatus, searchQuery])

  // Save Product Handler (Create or Update)
  const handleSaveProduct = (e) => {
    e.preventDefault()
    if (!formData.name.trim()) {
      triggerToast('Please provide Product Name!')
      return
    }

    if (formMode === 'edit' && editingId) {
      setProducts(
        products.map((p) => {
          if (p.id === editingId) {
            const updatedStock = formData.openingStock !== '' ? Number(formData.openingStock) : p.currentStock
            const updatedReorder = formData.reorderLevel !== '' ? Number(formData.reorderLevel) : p.reorderLevel
            const status = updatedStock <= 0 ? 'Out of Stock' : updatedStock <= updatedReorder ? 'Low Stock' : 'Active'
            const statusClass = status === 'Out of Stock'
              ? 'bg-red-100 text-red-800 border-red-200'
              : status === 'Low Stock'
              ? 'bg-amber-100 text-amber-800 border-amber-200'
              : 'bg-emerald-100 text-emerald-800 border-emerald-200'

            return {
              ...p,
              name: formData.name.trim(),
              sku: formData.sku.trim() || p.sku,
              category: formData.category || p.category,
              brand: formData.brand.trim() || p.brand,
              baseUnit: formData.baseUnit || p.baseUnit || 'Nos',
              outerPackaging: formData.outerPackaging || p.outerPackaging || 'Bag',
              packSize: Number(formData.packSize) || p.packSize || 1,
              storageZone: formData.storageZone || p.storageZone || 'Bulk Pallet Racks',
              reorderLevel: updatedReorder,
              currentStock: updatedStock,
              status,
              statusClass,
              barcode: formData.barcode.trim() || p.barcode,
              hsnCode: formData.hsnCode.trim() || p.hsnCode,
              description: formData.description.trim() || p.description,
            }
          }
          return p
        })
      )
      triggerToast(`Product "${formData.name}" updated successfully!`)
      setFormMode('add')
      setEditingId(null)
      setFormData(initialFormState)
    } else {
      // Create new
      const nextSku = formData.sku.trim() || `PRD-SKU-${String(products.length + 1).padStart(3, '0')}`
      const currentStock = Number(formData.openingStock) || 0
      const reorderLevel = Number(formData.reorderLevel) || 50
      const status = currentStock <= 0 ? 'Out of Stock' : currentStock <= reorderLevel ? 'Low Stock' : 'Active'
      const statusClass = status === 'Out of Stock'
        ? 'bg-red-100 text-red-800 border-red-200'
        : status === 'Low Stock'
        ? 'bg-amber-100 text-amber-800 border-amber-200'
        : 'bg-emerald-100 text-emerald-800 border-emerald-200'

      const newObj = {
        id: Date.now(),
        name: formData.name.trim(),
        sku: nextSku,
        category: formData.category || 'Grains & Pulses',
        brand: formData.brand.trim() || 'General Issue',
        baseUnit: formData.baseUnit || 'Kg',
        outerPackaging: formData.outerPackaging || 'Bag',
        packSize: Number(formData.packSize) || 25,
        currentStock,
        reorderLevel,
        storageZone: formData.storageZone || 'Dry & Ambient Pallet Bay',
        status,
        statusClass,
        barcode: formData.barcode.trim() || `89010300${String(products.length + 1).padStart(4, '0')}`,
        hsnCode: formData.hsnCode.trim() || '1006.30',
        description: formData.description.trim() || 'Standard warehouse registered product item.',
      }
      setProducts([newObj, ...products])
      triggerToast(`Product "${newObj.name}" created with SKU ${newObj.sku}!`)
      setFormData(initialFormState)
    }
  }

  // Load product to edit
  const handleEditProduct = (prod) => {
    setFormMode('edit')
    setEditingId(prod.id)
    setFormData({
      name: prod.name,
      sku: prod.sku,
      category: prod.category || '',
      brand: prod.brand || '',
      baseUnit: prod.baseUnit || 'Nos',
      outerPackaging: prod.outerPackaging || 'Bag',
      packSize: String(prod.packSize || 1),
      storageZone: prod.storageZone || 'Dry & Ambient Pallet Bay',
      reorderLevel: String(prod.reorderLevel ?? 50),
      openingStock: String(prod.currentStock ?? 0),
      barcode: prod.barcode || '',
      hsnCode: prod.hsnCode || '',
      description: prod.description || '',
    })
    window.scrollTo({ top: 180, behavior: 'smooth' })
    triggerToast(`Loaded "${prod.name}" into editor.`)
  }

  // Delete product
  const handleDeleteProduct = (id) => {
    setProducts(products.filter((p) => p.id !== id))
    setOpenActionMenuId(null)
    triggerToast('Product removed from master register.')
  }

  // Export CSV
  const handleExportCSV = () => {
    const headers = [
      'Product Name',
      'SKU / Code',
      'Category',
      'Brand',
      'Outer Packaging',
      'Pack Size',
      'Base Unit',
      'Conversion Factor',
      'Current Stock',
      'Reorder Level',
      'Storage Zone',
      'Status',
      'Barcode',
      'HSN Code'
    ]
    const rows = products.map((p) => [
      `"${p.name}"`,
      p.sku,
      `"${p.category}"`,
      `"${p.brand || ''}"`,
      `"${p.outerPackaging || 'Bag'}"`,
      p.packSize || 1,
      `"${p.baseUnit || 'Nos'}"`,
      `"1 ${p.outerPackaging || 'Bag'} = ${p.packSize || 1} ${p.baseUnit || 'Nos'}"`,
      p.currentStock,
      p.reorderLevel,
      `"${p.storageZone || ''}"`,
      p.status,
      `"${p.barcode || ''}"`,
      `"${p.hsnCode || ''}"`,
    ])
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n')
    const encodedUri = encodeURI(csvContent)
    const link = document.createElement('a')
    link.setAttribute('href', encodedUri)
    link.setAttribute('download', 'Warehouse_Product_Master.csv')
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    triggerToast('Product master exported to CSV successfully.')
  }

  // Render product visual category icon badge
  const renderProductThumbnail = (prod) => {
    const cat = (prod?.category || '').toLowerCase()
    if (cat.includes('grain') || cat.includes('pulse') || cat.includes('rice')) {
      return (
        <div className="w-10 h-10 rounded-lg bg-amber-50 border border-amber-200 p-1 flex flex-col items-center justify-center text-amber-700 shadow-xs">
          <UtensilsCrossed className="w-4 h-4" />
          <span className="text-[7px] font-bold mt-0.5">GRAIN</span>
        </div>
      )
    }
    if (cat.includes('oil') || cat.includes('liquid')) {
      return (
        <div className="w-10 h-10 rounded-lg bg-amber-500/10 border border-amber-300 p-1 flex flex-col items-center justify-center text-amber-600 shadow-xs">
          <Fuel className="w-4 h-4" />
          <span className="text-[7px] font-bold mt-0.5">OIL</span>
        </div>
      )
    }
    if (cat.includes('safety') || cat.includes('aid') || cat.includes('medical')) {
      return (
        <div className="w-10 h-10 rounded-lg bg-rose-50 border border-rose-200 p-1 flex flex-col items-center justify-center text-rose-600 shadow-xs">
          <HeartPulse className="w-4 h-4 stroke-[2.2]" />
          <span className="text-[7px] font-bold mt-0.5">SAFETY</span>
        </div>
      )
    }
    if (cat.includes('chemical') || cat.includes('hygiene')) {
      return (
        <div className="w-10 h-10 rounded-lg bg-sky-50 border border-sky-200 p-1 flex flex-col items-center justify-center text-sky-600 shadow-xs">
          <Shield className="w-4 h-4" />
          <span className="text-[7px] font-bold mt-0.5">HYGIENE</span>
        </div>
      )
    }
    if (cat.includes('maintenance') || cat.includes('spare')) {
      return (
        <div className="w-10 h-10 rounded-lg bg-slate-100 border border-slate-200 p-1 flex flex-col items-center justify-center text-slate-700 shadow-xs">
          <Wrench className="w-4 h-4" />
          <span className="text-[7px] font-bold mt-0.5">SPARES</span>
        </div>
      )
    }
    if (cat.includes('pack')) {
      return (
        <div className="w-10 h-10 rounded-lg bg-emerald-50 border border-emerald-200 p-1 flex flex-col items-center justify-center text-emerald-700 shadow-xs">
          <Layers className="w-4 h-4" />
          <span className="text-[7px] font-bold mt-0.5">PACK</span>
        </div>
      )
    }
    return (
      <div className="w-10 h-10 rounded-lg bg-slate-50 border border-slate-200 flex flex-col items-center justify-center text-slate-600 shadow-xs">
        <Package className="w-4 h-4" />
        <span className="text-[7px] font-bold mt-0.5">ITEM</span>
      </div>
    )
  }

  return (
    <div className="space-y-4 pb-12">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-5 right-5 z-50 bg-[#162214] border border-amber-400 text-amber-300 px-4 py-2.5 rounded-lg shadow-2xl flex items-center gap-2 text-xs font-medium animate-bounce">
          <svg className="w-4 h-4 text-amber-400 shrink-0" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
          </svg>
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Top Himalayan Convoy Banner */}
      <div className="relative rounded-xl overflow-hidden shadow-md border border-slate-200/80 bg-slate-900 h-28 sm:h-32">
        <img
          src="/border.png"
          alt="Central Warehouse Logistics Operations"
          className="w-full h-full object-cover object-center opacity-90"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-black/50 via-black/20 to-black/60"></div>
        <div className="absolute top-3 right-4 flex items-center gap-2 bg-black/40 backdrop-blur-md px-3 py-1 rounded-full border border-white/20">
          <div className="h-2 w-5 flex flex-col justify-between rounded-xs overflow-hidden">
            <div className="h-0.5 bg-[#FF9933]"></div>
            <div className="h-0.5 bg-white"></div>
            <div className="h-0.5 bg-[#138808]"></div>
          </div>
          <span className="text-[10px] font-bold text-white tracking-widest uppercase">
            NATION FIRST ALWAYS
          </span>
        </div>
      </div>

      {/* Page Header Bar */}
      <div className="bg-white rounded-xl p-4 sm:p-5 shadow-xs border border-slate-200/80 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-xl bg-[#EBF5EA] border border-[#CDE5CA] flex items-center justify-center text-[#1E3A1E] shadow-xs shrink-0">
            <Boxes className="w-6 h-6 stroke-[1.8]" />
          </div>
          <div>
            <h1 className="text-xl font-black text-slate-800 tracking-tight flex items-center gap-2">
              <span>Product & SKU Master</span>
            </h1>
            <p className="text-xs text-slate-500 font-medium">
              Maintain product catalog, packaging units, and reorder levels used across Inward, GRN, and Outward dispatch.
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="text-xs text-slate-400 flex items-center gap-1.5 font-medium mr-2">
            <Link to="/dashboard" className="hover:text-slate-700">Home</Link>
            <span>›</span>
            <span className="text-slate-500">Master Data</span>
            <span>›</span>
            <span className="text-slate-800 font-semibold">Product Entry</span>
          </div>
          <button
            type="button"
            onClick={() => {
              setFormMode('add')
              setEditingId(null)
              setFormData(initialFormState)
              window.scrollTo({ top: 180, behavior: 'smooth' })
              triggerToast('Ready to add new product.')
            }}
            className="bg-[#1F331E] hover:bg-[#2A4428] text-white px-4 py-2 rounded-lg text-xs font-bold flex items-center gap-2 shadow-xs transition cursor-pointer"
          >
            <span className="text-base leading-none font-black">+</span>
            <span>Add New Product</span>
          </button>
        </div>
      </div>

      {/* 5 KPI Stat Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
        {/* Card 1: Total Products */}
        <div className="bg-white rounded-xl p-3.5 shadow-xs border border-slate-200 flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-emerald-500 text-white flex items-center justify-center shrink-0 shadow-xs">
            <Boxes className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[11px] font-semibold text-slate-500">Total Products</p>
            <h3 className="text-2xl font-black text-slate-800 leading-tight">
              {products.length}
            </h3>
            <p className="text-[10px] font-bold text-emerald-600">Master SKUs registered</p>
          </div>
        </div>

        {/* Card 2: Active Products */}
        <div className="bg-white rounded-xl p-3.5 shadow-xs border border-slate-200 flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-blue-500 text-white flex items-center justify-center shrink-0 shadow-xs">
            <CheckCircle2 className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[11px] font-semibold text-slate-500">Active Products</p>
            <h3 className="text-2xl font-black text-slate-800 leading-tight">
              {products.filter((p) => p.status === 'Active').length}
            </h3>
            <p className="text-[10px] text-slate-400 font-medium">Ready for transactions</p>
          </div>
        </div>

        {/* Card 3: Low Stock Items */}
        <div className="bg-white rounded-xl p-3.5 shadow-xs border border-slate-200 flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-amber-500 text-white flex items-center justify-center shrink-0 shadow-xs">
            <AlertTriangle className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[11px] font-semibold text-slate-500">Low Stock Alert</p>
            <h3 className="text-2xl font-black text-slate-800 leading-tight">
              {products.filter((p) => p.status === 'Low Stock' || (p.currentStock <= p.reorderLevel && p.currentStock > 0)).length}
            </h3>
            <p className="text-[10px] text-amber-600 font-bold">Below reorder level</p>
          </div>
        </div>

        {/* Card 4: Packaging Types */}
        <div className="bg-white rounded-xl p-3.5 shadow-xs border border-slate-200 flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-indigo-500 text-white flex items-center justify-center shrink-0 shadow-xs">
            <Package className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[11px] font-semibold text-slate-500">Packaging Units</p>
            <h3 className="text-2xl font-black text-slate-800 leading-tight">6</h3>
            <p className="text-[10px] text-slate-400 font-medium">Bag, Box, Tin, Drum...</p>
          </div>
        </div>

        {/* Card 5: Categories */}
        <div className="bg-white rounded-xl p-3.5 shadow-xs border border-slate-200 flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-slate-600 text-white flex items-center justify-center shrink-0 shadow-xs">
            <Layers className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[11px] font-semibold text-slate-500">Categories</p>
            <h3 className="text-2xl font-black text-slate-800 leading-tight">
              {categoriesList.length}
            </h3>
            <p className="text-[10px] text-slate-400 font-medium">Standard commodity groups</p>
          </div>
        </div>
      </div>

      {/* Main 2-Column Section: Form + Table (Left 9) & Categories + Quick Actions (Right 3) */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-4 items-start">
        {/* ========================================================================= */}
        {/* LEFT COLUMN: Add / Edit Form + Product List Table (Span 9 / 12)           */}
        {/* ========================================================================= */}
        <div className="xl:col-span-9 space-y-4">
          {/* 1. Add / Edit Product Form Card */}
          <div className="bg-white rounded-xl p-5 shadow-xs border border-slate-200">
            {/* Header: Title + Radio Toggle (Add New vs Edit Existing) */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 mb-4 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-800 border border-emerald-200 flex items-center justify-center font-bold">
                  {formMode === 'edit' ? <Edit2 className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
                </div>
                <div>
                  <h2 className="text-sm font-bold text-slate-800">
                    {formMode === 'edit' ? `Edit Product: ${formData.name || 'Selected Item'}` : 'Add New Product to Master'}
                  </h2>
                  <p className="text-[11px] text-slate-500 font-medium">
                    {formMode === 'edit' ? 'Update SKU information, packaging ratio, or storage rules' : 'Define item master parameters, packaging conversion, and storage zone'}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-4 text-xs font-semibold text-slate-700 bg-slate-50 p-1.5 rounded-lg border border-slate-200">
                <label className="flex items-center gap-2 cursor-pointer px-2.5 py-1 rounded-md transition hover:bg-white">
                  <input
                    type="radio"
                    name="formMode"
                    value="add"
                    checked={formMode === 'add'}
                    onChange={() => {
                      setFormMode('add')
                      setEditingId(null)
                      setFormData(initialFormState)
                    }}
                    className="w-3.5 h-3.5 text-emerald-600 focus:ring-emerald-500"
                  />
                  <span>Add New</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer px-2.5 py-1 rounded-md transition hover:bg-white">
                  <input
                    type="radio"
                    name="formMode"
                    value="edit"
                    checked={formMode === 'edit'}
                    onChange={() => {
                      setFormMode('edit')
                      if (products.length > 0 && !editingId) {
                        handleEditProduct(products[0])
                      }
                    }}
                    className="w-3.5 h-3.5 text-emerald-600 focus:ring-emerald-500"
                  />
                  <span>Edit Existing</span>
                </label>
              </div>
            </div>

            {/* Form Fields Structured in 3 Clear Sections */}
            <form onSubmit={handleSaveProduct} className="space-y-5 text-xs">
              {/* SECTION 1: Basic Item Identification */}
              <div className="bg-slate-50/60 rounded-xl p-4 border border-slate-200/80 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-emerald-800 text-white text-[10px] font-black flex items-center justify-center">1</span>
                    <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">Basic Item Details</h3>
                  </div>
                  <span className="text-[10px] text-slate-400 font-medium">* Required fields</span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                  {/* Product Name */}
                  <div className="md:col-span-2">
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">
                      Product / Item Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Basmati Rice Superior (25 Kg) or Mustard Oil (15L)"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-xs font-medium focus:outline-none focus:ring-1 focus:ring-emerald-600"
                    />
                  </div>

                  {/* SKU / Code with Auto Generate Button */}
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="block text-[11px] font-bold text-slate-700">
                        SKU / Item Code <span className="text-red-500">*</span>
                      </label>
                      <button
                        type="button"
                        onClick={() => {
                          const prefix = (formData.category || 'GEN').substring(0, 3).toUpperCase()
                          const randomCode = Math.floor(100 + Math.random() * 900)
                          setFormData({ ...formData, sku: `PRD-${prefix}-${randomCode}` })
                          triggerToast('Generated automatic SKU code.')
                        }}
                        className="text-[10px] text-emerald-700 hover:text-emerald-900 font-bold flex items-center gap-1 cursor-pointer"
                        title="Generate random unique SKU"
                      >
                        <RefreshCw className="w-3 h-3" /> Auto
                      </button>
                    </div>
                    <input
                      type="text"
                      placeholder="PRD-RIC-001"
                      value={formData.sku}
                      onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
                      className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-xs font-mono font-bold focus:outline-none focus:ring-1 focus:ring-emerald-600"
                    />
                  </div>

                  {/* Category Dropdown */}
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">
                      Category <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={formData.category}
                      onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                      className="w-full bg-white border border-slate-200 rounded-lg px-2.5 py-2 text-xs text-slate-700 font-medium focus:outline-none focus:ring-1 focus:ring-emerald-600"
                    >
                      <option value="">Select Category</option>
                      {categoriesList.map((c) => (
                        <option key={c.id} value={c.name}>{c.name}</option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Brand / Supplier */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">Brand / Manufacturer</label>
                    <input
                      type="text"
                      placeholder="e.g. India Gate, Fortune, Tata, Castrol"
                      value={formData.brand}
                      onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
                      className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-emerald-600"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">Barcode / EAN-13</label>
                    <div className="relative">
                      <input
                        type="text"
                        placeholder="Scan or enter barcode"
                        value={formData.barcode}
                        onChange={(e) => setFormData({ ...formData, barcode: e.target.value })}
                        className="w-full bg-white border border-slate-200 rounded-lg pl-3 pr-8 py-2 text-xs font-mono focus:outline-none focus:ring-1 focus:ring-emerald-600"
                      />
                      <button
                        type="button"
                        onClick={() => setShowScannerModal(true)}
                        className="absolute right-2 top-2 text-slate-400 hover:text-emerald-700 cursor-pointer"
                        title="Scan Barcode"
                      >
                        <Barcode className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">HSN / GST Code</label>
                    <input
                      type="text"
                      placeholder="e.g. 1006.30 or 1514.99"
                      value={formData.hsnCode}
                      onChange={(e) => setFormData({ ...formData, hsnCode: e.target.value })}
                      className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-xs font-mono focus:outline-none focus:ring-1 focus:ring-emerald-600"
                    />
                  </div>
                </div>
              </div>

              {/* SECTION 2: Packaging Units & Conversion Factor */}
              <div className="bg-emerald-50/40 rounded-xl p-4 border border-emerald-200/70 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-emerald-800 text-white text-[10px] font-black flex items-center justify-center">2</span>
                    <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">Packaging & Unit Conversion</h3>
                  </div>
                  <span className="text-[10px] text-emerald-800 font-semibold bg-emerald-100/80 px-2 py-0.5 rounded-full border border-emerald-200">
                    Essential for Gate Inward & GRN
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  {/* Outer Packaging Unit */}
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">
                      Outer Packaging Unit (Gate Inward) <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={formData.outerPackaging}
                      onChange={(e) => setFormData({ ...formData, outerPackaging: e.target.value })}
                      className="w-full bg-white border border-slate-200 rounded-lg px-2.5 py-2 text-xs text-slate-700 font-semibold focus:outline-none focus:ring-1 focus:ring-emerald-600"
                    >
                      <option value="Bag">Bag / Bora (बोरी)</option>
                      <option value="Tin">Tin / Canister (पीपा)</option>
                      <option value="Box">Box / Carton (कार्टन)</option>
                      <option value="Drum">Drum / Barrel (ड्रम)</option>
                      <option value="Bundle">Bundle (बंडल)</option>
                      <option value="Case">Case / Crate (क्रेट)</option>
                      <option value="Pack">Pack / Packet (पैकेट)</option>
                    </select>
                    <p className="text-[10px] text-slate-400 mt-1">Unit vehicle unloads at gate (e.g. 100 Bags)</p>
                  </div>

                  {/* Quantity per Outer Pack */}
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">
                      Quantity per Pack (Pack Size) <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="number"
                      min="1"
                      placeholder="25"
                      value={formData.packSize}
                      onChange={(e) => setFormData({ ...formData, packSize: e.target.value })}
                      className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-xs font-bold text-slate-800 focus:outline-none focus:ring-1 focus:ring-emerald-600"
                    />
                    <p className="text-[10px] text-slate-400 mt-1">Base units per single outer package</p>
                  </div>

                  {/* Base Storage Unit */}
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">
                      Base Storage Unit (Inventory Ledger) <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={formData.baseUnit}
                      onChange={(e) => setFormData({ ...formData, baseUnit: e.target.value })}
                      className="w-full bg-white border border-slate-200 rounded-lg px-2.5 py-2 text-xs text-slate-700 font-semibold focus:outline-none focus:ring-1 focus:ring-emerald-600"
                    >
                      <option value="Kg">Kg (Kilograms)</option>
                      <option value="Ltr">Ltr (Litres)</option>
                      <option value="Nos">Nos (Numbers / Pieces)</option>
                      <option value="Meter">Meter</option>
                      <option value="Pair">Pair</option>
                      <option value="Set">Set</option>
                    </select>
                    <p className="text-[10px] text-slate-400 mt-1">Unit warehouse tracks inside storage</p>
                  </div>
                </div>

                {/* Dynamic Conversion Pill Banner */}
                <div className="bg-white rounded-lg p-3 border border-emerald-200 flex flex-col sm:flex-row sm:items-center justify-between gap-2 shadow-xs">
                  <div className="flex items-center gap-2">
                    <span className="text-emerald-700 font-black text-sm">✨</span>
                    <div>
                      <span className="text-xs font-bold text-slate-800">
                        Conversion Formula:&nbsp;
                      </span>
                      <span className="font-mono font-black text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-300">
                        1 {formData.outerPackaging || 'Bag'} = {formData.packSize || 1} {formData.baseUnit || 'Kg'}
                      </span>
                    </div>
                  </div>
                  <span className="text-[11px] text-slate-500 font-medium">
                    Gate Inward accepts in <strong>{formData.outerPackaging || 'Bag'}s</strong> ➔ GRN converts to <strong>{formData.baseUnit || 'Kg'}s</strong> automatically.
                  </span>
                </div>
              </div>

              {/* SECTION 3: Warehouse Storage Zone & Inventory Rules */}
              <div className="bg-slate-50/60 rounded-xl p-4 border border-slate-200/80 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-emerald-800 text-white text-[10px] font-black flex items-center justify-center">3</span>
                    <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">Warehouse Storage & Stock Rules</h3>
                  </div>
                  <span className="text-[10px] text-slate-400 font-medium">Physical allocation</span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  {/* Storage Zone */}
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">
                      Designated Storage Zone <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={formData.storageZone}
                      onChange={(e) => setFormData({ ...formData, storageZone: e.target.value })}
                      className="w-full bg-white border border-slate-200 rounded-lg px-2.5 py-2 text-xs text-slate-700 font-medium focus:outline-none focus:ring-1 focus:ring-emerald-600"
                    >
                      <option value="Dry & Ambient Pallet Bay">Dry & Ambient Pallet Bay</option>
                      <option value="Liquid & Oil Bay">Liquid & Oil Bay</option>
                      <option value="Chemical Safety Bay">Chemical Safety Bay</option>
                      <option value="Bulk Pallet Racks">Bulk Pallet Racks</option>
                      <option value="Small Spares Bin Rack">Small Spares Bin Rack</option>
                      <option value="Cold Storage Chamber">Cold Storage Chamber</option>
                    </select>
                  </div>

                  {/* Safety Reorder Level */}
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">
                      Reorder Threshold ({formData.baseUnit || 'Kg'}) <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="number"
                      min="0"
                      placeholder="50"
                      value={formData.reorderLevel}
                      onChange={(e) => setFormData({ ...formData, reorderLevel: e.target.value })}
                      className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-xs font-bold text-amber-700 focus:outline-none focus:ring-1 focus:ring-emerald-600"
                    />
                    <p className="text-[10px] text-slate-400 mt-1">Alerts when inventory drops below this number</p>
                  </div>

                  {/* Opening Stock */}
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">
                      Opening Stock ({formData.baseUnit || 'Kg'})
                    </label>
                    <input
                      type="number"
                      min="0"
                      placeholder="0"
                      value={formData.openingStock}
                      onChange={(e) => setFormData({ ...formData, openingStock: e.target.value })}
                      className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-xs font-bold text-slate-800 focus:outline-none focus:ring-1 focus:ring-emerald-600"
                    />
                    <p className="text-[10px] text-slate-400 mt-1">Initial physical quantity currently in warehouse</p>
                  </div>
                </div>

                {/* Description & Handling Notes */}
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">Handling & Storage Remarks</label>
                  <textarea
                    rows="2"
                    placeholder="e.g. Keep on raised wooden pallets, store in moisture-free area, stack limit 6 bags max."
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-emerald-600"
                  ></textarea>
                </div>
              </div>

              {/* Form Action Buttons Bar */}
              <div className="pt-2 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3">
                <div className="text-xs text-slate-500 font-medium">
                  {formMode === 'edit' ? (
                    <span className="text-amber-700 font-semibold">Editing existing product master SKU</span>
                  ) : (
                    <span>Fill in details and click Save Product to register in WMS</span>
                  )}
                </div>

                <div className="flex items-center gap-2.5">
                  <button
                    type="button"
                    onClick={() => {
                      setFormData(initialFormState)
                      setFormMode('add')
                      setEditingId(null)
                      triggerToast('Form cleared.')
                    }}
                    className="px-4 py-2 border border-slate-300 rounded-lg text-slate-700 hover:bg-slate-50 text-xs font-semibold cursor-pointer transition"
                  >
                    Clear Form
                  </button>
                  <button
                    type="submit"
                    className="bg-[#1F331E] hover:bg-[#2A4428] text-white px-6 py-2 rounded-lg text-xs font-bold shadow-xs flex items-center gap-2 cursor-pointer transition"
                  >
                    {formMode === 'edit' ? <Edit2 className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
                    <span>{formMode === 'edit' ? 'Update Product Master' : 'Save & Register Product'}</span>
                  </button>
                </div>
              </div>
            </form>
          </div>

          {/* 2. Product List Master Table Card */}
          <div className="bg-white rounded-xl shadow-xs border border-slate-200 overflow-hidden flex flex-col">
            {/* Header & Filter Toolbar */}
            <div className="p-4 border-b border-slate-100 flex flex-col lg:flex-row lg:items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <svg className="w-4 h-4 text-slate-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 10h16M4 14h16M4 18h16" />
                </svg>
                <h2 className="text-sm font-bold text-slate-800">Product List</h2>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                {/* Search Bar */}
                <div className="relative flex-1 sm:w-64">
                  <svg className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                  <input
                    type="text"
                    placeholder="Search by name, SKU, category, brand..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg pl-8 pr-3 py-1.5 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-emerald-600 focus:bg-white"
                  />
                </div>

                {/* Category Dropdown */}
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs text-slate-700 focus:outline-none focus:ring-1 focus:ring-emerald-600"
                >
                  <option value="All">All Categories</option>
                  {categoriesList.map((c) => (
                    <option key={c.id} value={c.name}>{c.name}</option>
                  ))}
                </select>

                {/* Status Dropdown */}
                <select
                  value={selectedStatus}
                  onChange={(e) => setSelectedStatus(e.target.value)}
                  className="bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs text-slate-700 focus:outline-none focus:ring-1 focus:ring-emerald-600"
                >
                  <option value="All">All Status</option>
                  <option value="Active">Active</option>
                  <option value="Low Stock">Low Stock</option>
                  <option value="Inactive">Inactive</option>
                </select>

                {/* Export Button */}
                <button
                  type="button"
                  onClick={handleExportCSV}
                  className="bg-[#1F331E] hover:bg-[#2A4428] text-white text-xs px-3.5 py-1.5 rounded-lg flex items-center gap-1.5 font-bold shadow-xs transition cursor-pointer"
                >
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                  </svg>
                  <span>Export</span>
                </button>
              </div>
            </div>

            {/* Table Container - Protected with table-nowrap and hidden scrollbar */}
            <div
              className="overflow-x-auto no-scrollbar scroll-smooth w-full"
              style={{
                scrollbarWidth: 'none',
                msOverflowStyle: 'none',
                WebkitOverflowScrolling: 'touch',
              }}
            >
              <table
                className="w-full text-left text-xs divide-y divide-slate-200 border-collapse table-nowrap"
                style={{ minWidth: '1150px' }}
              >
                <thead className="bg-slate-50/90 text-slate-600 font-bold uppercase tracking-wider text-[11px] border-b border-slate-200">
                  <tr>
                    <th className="py-3 px-3 w-10 text-center whitespace-nowrap">#</th>
                    <th className="py-3 px-3 w-12 text-center whitespace-nowrap">Type</th>
                    <th className="py-3 px-4 min-w-[200px] whitespace-nowrap">Product Name & SKU</th>
                    <th className="py-3 px-4 min-w-[150px] whitespace-nowrap">Category</th>
                    <th className="py-3 px-4 min-w-[140px] whitespace-nowrap">Packaging Ratio</th>
                    <th className="py-3 px-4 min-w-[120px] whitespace-nowrap">Current Stock</th>
                    <th className="py-3 px-4 min-w-[110px] whitespace-nowrap">Reorder Level</th>
                    <th className="py-3 px-4 min-w-[150px] whitespace-nowrap">Storage Zone</th>
                    <th className="py-3 px-4 text-center min-w-[100px] whitespace-nowrap">Status</th>
                    <th className="py-3 px-3 text-center w-24 whitespace-nowrap">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 bg-white">
                  {filteredProducts.length === 0 ? (
                    <tr>
                      <td colSpan="10" className="py-10 text-center text-slate-400 font-medium">
                        No products match your search or filter criteria.
                      </td>
                    </tr>
                  ) : (
                    filteredProducts.map((p, idx) => (
                      <tr
                        key={p.id}
                        className="hover:bg-emerald-50/40 transition cursor-pointer"
                        onClick={() => handleEditProduct(p)}
                      >
                        <td className="py-3.5 px-3 text-center text-slate-400 font-bold text-[11px] whitespace-nowrap">
                          {idx + 1}
                        </td>
                        <td className="py-3.5 px-3 text-center whitespace-nowrap">
                          <div className="flex items-center justify-center">
                            {renderProductThumbnail(p)}
                          </div>
                        </td>
                        <td className="py-3.5 px-4 whitespace-nowrap">
                          <div className="font-bold text-slate-800 text-xs">
                            {p.name}
                          </div>
                          <div className="flex items-center gap-2 mt-0.5">
                            <span className="font-mono text-[10px] font-bold text-emerald-800 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200">
                              {p.sku}
                            </span>
                            {p.brand && (
                              <span className="text-[10px] text-slate-400 font-medium">
                                • {p.brand}
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="py-3.5 px-4 text-slate-700 font-medium whitespace-nowrap">
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-slate-100 text-slate-700">
                            {p.category}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 whitespace-nowrap">
                          <span className="inline-flex items-center font-mono font-bold text-[11px] text-slate-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200/80">
                            1 {p.outerPackaging || 'Pack'} = {p.packSize || 1} {p.baseUnit || 'Nos'}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 whitespace-nowrap">
                          <div className="font-mono font-black text-slate-900 text-xs">
                            {p.currentStock.toLocaleString()} {p.baseUnit || 'Nos'}
                          </div>
                          {p.packSize > 1 && (
                            <div className="text-[10px] text-slate-400 font-medium">
                              ≈ {Math.floor(p.currentStock / p.packSize)} {p.outerPackaging || 'Pack'}s
                            </div>
                          )}
                        </td>
                        <td className="py-3.5 px-4 whitespace-nowrap">
                          <div className={`font-mono text-xs font-semibold ${p.currentStock <= p.reorderLevel ? 'text-amber-700 font-bold' : 'text-slate-600'}`}>
                            {p.reorderLevel.toLocaleString()} {p.baseUnit || 'Nos'}
                          </div>
                          {p.currentStock <= p.reorderLevel && (
                            <span className="text-[9px] text-amber-700 font-bold uppercase tracking-wider">
                              Alert
                            </span>
                          )}
                        </td>
                        <td className="py-3.5 px-4 text-slate-600 text-xs font-medium whitespace-nowrap">
                          {p.storageZone || 'General Storage'}
                        </td>
                        <td className="py-3.5 px-4 text-center whitespace-nowrap">
                          <span className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${p.statusClass}`}>
                            {p.status}
                          </span>
                        </td>
                        <td className="py-3.5 px-3 text-center relative whitespace-nowrap" onClick={(e) => e.stopPropagation()}>
                          <div className="flex items-center justify-center gap-1.5">
                            <button
                              type="button"
                              onClick={() => handleEditProduct(p)}
                              className="bg-slate-50 hover:bg-emerald-50 border border-slate-200 hover:border-emerald-300 text-slate-700 p-1.5 rounded-md text-xs font-bold transition cursor-pointer"
                              title="Edit Product Details"
                            >
                              <Edit2 className="w-3.5 h-3.5 text-slate-600" />
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                setSelectedProductForLabel(p)
                                setShowLabelModal(true)
                              }}
                              className="bg-slate-50 hover:bg-emerald-50 border border-slate-200 hover:border-emerald-300 text-slate-700 p-1.5 rounded-md text-xs font-bold transition cursor-pointer"
                              title="Print Barcode / QR Label"
                            >
                              <Barcode className="w-3.5 h-3.5 text-slate-600" />
                            </button>
                            <button
                              type="button"
                              onClick={() => setOpenActionMenuId(openActionMenuId === p.id ? null : p.id)}
                              className="bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-600 px-2 py-1 rounded-md text-xs font-bold transition cursor-pointer"
                              title="More Options"
                            >
                              ⋮
                            </button>
                          </div>

                          {/* Dropdown Menu */}
                          {openActionMenuId === p.id && (
                            <div className="absolute right-3 top-10 w-44 bg-white border border-slate-200 rounded-lg shadow-xl z-20 py-1 text-left text-xs font-medium">
                              <button
                                type="button"
                                onClick={() => {
                                  handleEditProduct(p)
                                  setOpenActionMenuId(null)
                                }}
                                className="w-full px-3 py-1.5 hover:bg-slate-50 flex items-center gap-2 text-slate-700"
                              >
                                <Edit2 className="w-3.5 h-3.5 text-slate-500" />
                                <span>Edit Details</span>
                              </button>
                              <button
                                type="button"
                                onClick={() => {
                                  setSelectedProductForLabel(p)
                                  setShowLabelModal(true)
                                  setOpenActionMenuId(null)
                                }}
                                className="w-full px-3 py-1.5 hover:bg-slate-50 flex items-center gap-2 text-slate-700"
                              >
                                <QrCode className="w-3.5 h-3.5 text-slate-500" />
                                <span>Print QR / Barcode</span>
                              </button>
                              <button
                                type="button"
                                onClick={() => handleDeleteProduct(p.id)}
                                className="w-full px-3 py-1.5 hover:bg-red-50 text-red-700 flex items-center gap-2"
                              >
                                <Trash2 className="w-3.5 h-3.5 text-rose-600" />
                                <span>Delete Product</span>
                              </button>
                            </div>
                          )}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination Footer */}
            <div className="px-4 py-3 bg-slate-50/80 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500">
              <span className="font-medium">
                Showing <strong>{filteredProducts.length === 0 ? 0 : 1} to {Math.min(filteredProducts.length, perPage)}</strong> of <strong>{filteredProducts.length}</strong> master products
              </span>

              {/* Number Buttons */}
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                  className="px-2 py-1 rounded border border-slate-200 text-slate-600 hover:bg-slate-100 font-bold"
                >
                  ‹
                </button>
                <button
                  type="button"
                  className="px-2.5 py-1 rounded font-bold bg-[#1E3A1E] text-white"
                >
                  1
                </button>
                <button
                  type="button"
                  onClick={() => triggerToast('Page 2 loaded')}
                  className="px-2.5 py-1 rounded font-semibold text-slate-700 hover:bg-slate-100"
                >
                  2
                </button>
                <button
                  type="button"
                  onClick={() => triggerToast('Page 3 loaded')}
                  className="px-2.5 py-1 rounded font-semibold text-slate-700 hover:bg-slate-100"
                >
                  3
                </button>
                <button
                  type="button"
                  onClick={() => setCurrentPage(currentPage + 1)}
                  className="px-2 py-1 rounded border border-slate-200 text-slate-600 hover:bg-slate-100 font-bold"
                >
                  ›
                </button>
              </div>

              {/* Show per page selector */}
              <div className="flex items-center gap-2">
                <span>Show</span>
                <select
                  value={perPage}
                  onChange={(e) => setPerPage(Number(e.target.value))}
                  className="bg-white border border-slate-200 rounded px-2 py-1 text-xs font-semibold text-slate-700 focus:outline-none"
                >
                  <option value={5}>5</option>
                  <option value={8}>8</option>
                  <option value={15}>15</option>
                  <option value={25}>25</option>
                </select>
                <span>per page</span>
              </div>
            </div>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* RIGHT COLUMN: Product Categories + Quick Actions + Recent Added (Span 3) */}
        {/* ========================================================================= */}
        <div className="xl:col-span-3 space-y-4">
          {/* Card 1: Product Categories */}
          <div className="bg-white rounded-xl p-4 shadow-xs border border-slate-200">
            <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <svg className="w-4 h-4 text-slate-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 10h16M4 14h16M4 18h16" />
                </svg>
                <h2 className="text-xs font-bold text-slate-800">Product Categories</h2>
              </div>
              <button
                type="button"
                onClick={() => triggerToast('Category management opened.')}
                className="text-[10px] font-bold text-emerald-800 hover:text-emerald-950 hover:underline cursor-pointer"
              >
                Manage Categories
              </button>
            </div>

            <div className="space-y-1.5">
              {categoriesList.map((cat) => {
                const isCurrent = selectedCategory === cat.name
                return (
                  <div
                    key={cat.id}
                    onClick={() => {
                      setSelectedCategory(isCurrent ? 'All' : cat.name)
                      triggerToast(`Filtered by ${cat.name}`)
                    }}
                    className={`flex items-center justify-between p-2 rounded-lg text-xs cursor-pointer transition ${
                      isCurrent
                        ? 'bg-emerald-50 text-emerald-900 font-bold border border-emerald-200'
                        : 'hover:bg-slate-50 text-slate-700 font-medium'
                    }`}
                  >
                    <div className="flex items-center gap-2 truncate">
                      <cat.icon className="w-4 h-4 shrink-0 text-slate-500" />
                      <span className="truncate">{cat.name}</span>
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0">
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#EBF5EA] text-[#1E3A1E] border border-[#CDE5CA]">
                        {cat.count}
                      </span>
                      <span className="text-slate-400 text-xs font-bold">›</span>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Card 2: Quick Actions */}
          <div className="bg-white rounded-xl p-4 shadow-xs border border-slate-200">
            <div className="flex items-center gap-2 pb-3 mb-3 border-b border-slate-100">
              <svg className="w-4 h-4 text-slate-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
              <h2 className="text-xs font-bold text-slate-800">Quick Actions</h2>
            </div>

            <div className="space-y-2">
              <button
                type="button"
                onClick={() => setShowImportModal(true)}
                className="w-full bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-lg py-2 px-3 text-left text-xs font-bold text-slate-700 flex items-center gap-2.5 transition cursor-pointer"
              >
                <svg className="w-4 h-4 text-slate-600 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <span>Import Products (Excel)</span>
              </button>

              <button
                type="button"
                onClick={() => triggerToast('Product template spreadsheet downloaded.')}
                className="w-full bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-lg py-2 px-3 text-left text-xs font-bold text-slate-700 flex items-center gap-2.5 transition cursor-pointer"
              >
                <svg className="w-4 h-4 text-slate-600 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                </svg>
                <span>Download Product Template</span>
              </button>

              <button
                type="button"
                onClick={() => triggerToast('Bulk product update wizard launched.')}
                className="w-full bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-lg py-2 px-3 text-left text-xs font-bold text-slate-700 flex items-center gap-2.5 transition cursor-pointer"
              >
                <svg className="w-4 h-4 text-slate-600 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                </svg>
                <span>Bulk Update</span>
              </button>

              <button
                type="button"
                onClick={() => setShowLabelModal(true)}
                className="w-full bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-lg py-2 px-3 text-left text-xs font-bold text-slate-700 flex items-center gap-2.5 transition cursor-pointer"
              >
                <svg className="w-4 h-4 text-slate-600 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
                </svg>
                <span>Print Labels (QR/Barcode)</span>
              </button>
            </div>
          </div>

          {/* Card 3: Recent Added Products */}
          <div className="bg-white rounded-xl p-4 shadow-xs border border-slate-200">
            <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <svg className="w-4 h-4 text-slate-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <h2 className="text-xs font-bold text-slate-800">Recent Added Products</h2>
              </div>
              <button
                type="button"
                onClick={() => triggerToast('All recently registered products loaded.')}
                className="text-[10px] font-bold text-emerald-800 hover:text-emerald-950 cursor-pointer"
              >
                View All →
              </button>
            </div>

            <div className="space-y-3 text-xs">
              {recentAddedProducts.map((item, idx) => (
                <div key={idx} className="flex items-center justify-between gap-2 p-1 hover:bg-slate-50 rounded-lg transition">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-lg bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-600 shadow-xs shrink-0">
                      <item.icon className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="font-semibold text-slate-800 text-[11px] leading-tight">
                        {item.name}
                      </p>
                      <p className="font-mono text-[10px] text-slate-400 font-bold">
                        {item.sku}
                      </p>
                    </div>
                  </div>
                  <span className="text-[10px] text-slate-400 font-medium whitespace-nowrap">
                    {item.timeAgo}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* MODAL: OPTICAL SCANNER                                                    */}
      {/* ========================================================================= */}
      {showScannerModal && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-sm w-full p-5 space-y-4">
            <div className="flex items-center justify-between border-b pb-2.5 border-slate-200">
              <div className="flex items-center gap-2">
                <Barcode className="w-5 h-5 text-emerald-800" />
                <h3 className="text-sm font-bold text-slate-800">Scan Product Barcode / QR</h3>
              </div>
              <button
                type="button"
                onClick={() => setShowScannerModal(false)}
                className="text-slate-400 hover:text-slate-700 p-1 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="relative bg-slate-900 rounded-lg h-52 flex flex-col items-center justify-center overflow-hidden border-2 border-dashed border-emerald-500/50">
              <div className="absolute inset-x-8 top-1/2 -translate-y-1/2 h-0.5 bg-red-500 shadow-[0_0_12px_#ef4444] animate-pulse"></div>
              <div className="w-36 h-36 border-2 border-emerald-400 rounded-md relative flex items-center justify-center">
                <div className="w-28 h-28 border border-emerald-500/30 rounded flex flex-col items-center justify-center p-2 text-center">
                  <span className="text-[10px] text-emerald-400 font-mono font-bold tracking-widest uppercase">
                    AIM AT PRODUCT
                  </span>
                  <span className="text-[9px] text-slate-400 mt-1">Ready for input</span>
                </div>
              </div>
            </div>

            <p className="text-[11px] text-slate-500 text-center font-medium">
              Point handheld optical scanner or camera at item EAN-13 / Code-128 barcode
            </p>

            <button
              type="button"
              onClick={() => {
                setFormData({
                  ...formData,
                  barcode: '890103001009',
                  sku: formData.sku || 'PRD-RIC-109',
                })
                setShowScannerModal(false)
                triggerToast('Scanned Barcode: 890103001009')
              }}
              className="w-full bg-[#1F331E] hover:bg-[#2A4428] text-white py-2.5 rounded-lg text-xs font-bold shadow transition cursor-pointer flex items-center justify-center gap-2"
            >
              <Barcode className="w-4 h-4" />
              <span>Simulate Barcode Scan (890103001009)</span>
            </button>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: PRINT QR / BARCODE LABELS                                          */}
      {/* ========================================================================= */}
      {showLabelModal && (() => {
        const labelItem = selectedProductForLabel || products[0] || {}
        return (
          <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-5 space-y-4">
              <div className="flex items-center justify-between border-b pb-2.5 border-slate-200">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded bg-[#EBF5EA] border border-[#CDE5CA] flex items-center justify-center text-[#1E3A1E] font-bold">
                    <Barcode className="w-4 h-4" />
                  </div>
                  <h3 className="text-sm font-bold text-slate-800">Print Product Warehouse Tag</h3>
                </div>
                <button
                  type="button"
                  onClick={() => setShowLabelModal(false)}
                  className="text-slate-400 hover:text-slate-700 p-1 cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Commercial Barcode Shelf / Pallet Label Card */}
              <div className="border-2 border-slate-900 rounded-lg p-4 bg-white space-y-2.5 shadow-sm text-xs">
                <div className="flex items-center justify-between border-b pb-2 border-slate-200">
                  <div>
                    <h4 className="font-black text-slate-900 text-xs tracking-wider uppercase">
                      CENTRAL LOGISTICS WAREHOUSE
                    </h4>
                    <p className="text-[9px] text-emerald-800 font-bold uppercase tracking-wider">
                      ITEM MASTER STORAGE TAG
                    </p>
                  </div>
                  <span className="font-mono text-[10px] font-bold px-2 py-0.5 bg-slate-100 border border-slate-300 rounded text-slate-800">
                    {labelItem.storageZone || 'PALLET BAY-01'}
                  </span>
                </div>

                <div>
                  <p className="text-sm font-black text-slate-900">
                    {labelItem.name || 'Basmati Rice Superior 25kg'}
                  </p>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="text-[10px] font-mono font-bold text-slate-700 bg-slate-100 px-1.5 py-0.2 rounded border border-slate-200">
                      SKU: {labelItem.sku || 'PRD-RIC-001'}
                    </span>
                    {labelItem.brand && (
                      <span className="text-[10px] text-slate-500 font-semibold">
                        Brand: {labelItem.brand}
                      </span>
                    )}
                  </div>
                </div>

                {/* Packaging ratio hint */}
                <div className="bg-emerald-50 border border-emerald-200 px-2 py-1 rounded text-[10px] font-semibold text-emerald-900 flex justify-between">
                  <span>Category: {labelItem.category || 'General Goods'}</span>
                  <span>
                    Ratio: 1 {labelItem.outerPackaging || 'Bag'} = {labelItem.packSize || 1} {labelItem.baseUnit || 'Nos'}
                  </span>
                </div>

                {/* Barcode Graphic */}
                <div className="text-center p-2.5 bg-slate-50 rounded border border-slate-200">
                  <div className="flex justify-center items-end h-10 gap-0.5">
                    {[2, 1, 3, 1, 2, 4, 1, 2, 1, 3, 2, 1, 4, 2, 1, 3, 1, 2, 3, 1, 4, 2, 1, 3, 2, 1, 3].map((w, i) => (
                      <div key={i} style={{ width: `${w * 2}px` }} className="h-full bg-slate-900"></div>
                    ))}
                  </div>
                  <span className="font-mono text-[11px] tracking-widest text-slate-900 font-black mt-1.5 block">
                    * {labelItem.barcode || '890103001001'} *
                  </span>
                </div>

                <div className="flex justify-between text-[9px] text-slate-500 border-t pt-1.5 border-slate-100 font-medium">
                  <span>Unit: {labelItem.baseUnit || 'Kg'}</span>
                  <span>HSN: {labelItem.hsnCode || '1006.30'}</span>
                  <span>Quality Assured</span>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowLabelModal(false)}
                  className="px-4 py-1.5 border border-slate-300 rounded-lg text-xs font-semibold text-slate-700 hover:bg-slate-50 cursor-pointer"
                >
                  Close
                </button>
                <button
                  type="button"
                  onClick={() => {
                    window.print()
                    setShowLabelModal(false)
                  }}
                  className="bg-[#1F331E] hover:bg-[#2A4428] text-white px-5 py-1.5 rounded-lg text-xs font-bold shadow cursor-pointer flex items-center gap-1.5"
                >
                  <Barcode className="w-3.5 h-3.5" />
                  <span>Print Label</span>
                </button>
              </div>
            </div>
          </div>
        )
      })()}

      {/* ========================================================================= */}
      {/* MODAL: IMPORT PRODUCTS (EXCEL)                                            */}
      {/* ========================================================================= */}
      {showImportModal && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-5 space-y-4">
            <div className="flex items-center justify-between border-b pb-2.5 border-slate-200">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-800">
                  <FileSpreadsheet className="w-4 h-4" />
                </div>
                <h3 className="text-sm font-bold text-slate-800">Import Products from Excel</h3>
              </div>
              <button
                type="button"
                onClick={() => setShowImportModal(false)}
                className="text-slate-400 hover:text-slate-700 p-1 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="border-2 border-dashed border-slate-300 hover:border-emerald-500 rounded-xl p-6 text-center bg-slate-50 transition cursor-pointer">
              <FileSpreadsheet className="w-8 h-8 text-emerald-700 mx-auto mb-2" />
              <p className="text-xs font-bold text-slate-700">Drag and drop your .xlsx or .csv product catalog here</p>
              <p className="text-[10px] text-slate-400 mt-1">Supports standard warehouse product master catalog templates up to 10 MB</p>
            </div>

            <div className="flex items-center justify-between pt-2">
              <button
                type="button"
                onClick={() => triggerToast('Sample product Excel template downloaded.')}
                className="text-xs text-emerald-800 font-bold hover:underline cursor-pointer flex items-center gap-1"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Sample Template</span>
              </button>

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setShowImportModal(false)}
                  className="px-4 py-1.5 border border-slate-300 rounded-lg text-xs font-semibold text-slate-700 hover:bg-slate-50 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowImportModal(false)
                    triggerToast('Sample warehouse products imported successfully!')
                  }}
                  className="bg-[#1F331E] hover:bg-[#2A4428] text-white px-5 py-1.5 rounded-lg text-xs font-bold shadow cursor-pointer flex items-center gap-1.5"
                >
                  <Upload className="w-3.5 h-3.5" />
                  <span>Import File</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
