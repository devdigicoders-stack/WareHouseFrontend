import { useState, useMemo, useRef, useEffect } from 'react'
import {
  Users,
  UserCheck,
  Clock,
  LogOut,
  Check,
  Printer,
  X,
  Search,
  Plus,
  Download,
  ChevronDown,
  Building2,
  ShieldCheck,
  QrCode,
} from 'lucide-react'

// Options for Visitor Registration Dropdowns
const PURPOSE_OPTIONS = [
  { value: 'Material Inspection', label: 'Material Inspection & Audit' },
  { value: 'Official Meeting', label: 'Official Management Meeting' },
  { value: 'Vendor Discussion', label: 'Vendor & Supplier Discussion' },
  { value: 'Maintenance & Repairs', label: 'Equipment Maintenance / Repair' },
  { value: 'Consignment Dispatch', label: 'Consignment Dispatch Supervision' },
  { value: 'Audit & Compliance', label: 'Quality & Safety Compliance' },
]

const HOST_OPTIONS = [
  { value: 'Anil Sharma (Warehouse Manager)', label: 'Anil Sharma (Warehouse Manager)' },
  { value: 'Rajesh Verma (Quality & Lab Lead)', label: 'Rajesh Verma (Quality & Lab Lead)' },
  { value: 'Pooja Rana (Inventory Supervisor)', label: 'Pooja Rana (Inventory Supervisor)' },
  { value: 'Suresh Chauhan (Logistics Officer)', label: 'Suresh Chauhan (Logistics Officer)' },
  { value: 'Dr. S. Patel (Compliance Head)', label: 'Dr. S. Patel (Compliance Head)' },
]

const ID_PROOF_OPTIONS = [
  { value: 'Aadhaar Card', label: 'Aadhaar Card' },
  { value: 'Driving License', label: 'Driving License' },
  { value: 'PAN Card', label: 'PAN Card' },
  { value: 'Corporate ID', label: 'Corporate Company ID' },
  { value: 'Government ID', label: 'Government Photo ID' },
]

// Custom React Select to eliminate native OS dropdown black-frame flicker
function CustomSelect({ label, value, onChange, options, required, zIndexClass = 'z-20' }) {
  const [isOpen, setIsOpen] = useState(false)
  const containerRef = useRef(null)

  useEffect(() => {
    function handleOutside(e) {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleOutside)
    return () => document.removeEventListener('mousedown', handleOutside)
  }, [])

  const selectedOption = options.find((opt) => opt.value === value) || options[0]

  return (
    <div className={`relative ${zIndexClass}`} ref={containerRef}>
      {label && (
        <label className="block text-xs font-bold text-slate-700 mb-1.5">
          {label} {required && <span className="text-rose-500">*</span>}
        </label>
      )}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={`w-full bg-white border rounded-xl px-3.5 py-2.5 text-xs text-left flex items-center justify-between transition-all cursor-pointer shadow-2xs ${
          isOpen
            ? 'border-indigo-600 ring-2 ring-indigo-500/20 text-slate-900'
            : 'border-slate-300 text-slate-800 hover:border-slate-400'
        }`}
      >
        <span className="truncate font-medium">{selectedOption?.label || value}</span>
        <ChevronDown
          className={`w-4 h-4 text-slate-400 shrink-0 transition-transform duration-200 ml-2 ${
            isOpen ? 'rotate-180 text-indigo-600' : ''
          }`}
        />
      </button>

      {isOpen && (
        <div className="absolute left-0 right-0 top-full mt-1.5 bg-white border border-slate-200 rounded-xl shadow-xl py-1 max-h-56 overflow-y-auto z-50">
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
                className={`w-full px-3.5 py-2 text-xs text-left flex items-center justify-between transition-colors cursor-pointer ${
                  isSelected
                    ? 'bg-indigo-50 text-indigo-700 font-bold'
                    : 'text-slate-700 hover:bg-slate-50 hover:text-slate-900'
                }`}
              >
                <span className="truncate">{opt.label}</span>
                {isSelected && <Check className="w-3.5 h-3.5 text-indigo-600 shrink-0 ml-2" />}
              </button>
            )
          })}
        </div>
      )}
    </div>
  )
}

export default function VisitorManagement() {
  const [activeTab, setActiveTab] = useState('all') // 'all', 'inside', 'checked_out', 'pending'
  const [searchQuery, setSearchQuery] = useState('')
  const [showAddModal, setShowAddModal] = useState(false)
  const [showPrintModal, setShowPrintModal] = useState(false)
  const [toastMessage, setToastMessage] = useState(null)

  // Real-time Commercial Warehouse Visitor Registry
  const [visitors, setVisitors] = useState([
    {
      id: 1,
      passNo: 'V-2026-001',
      visitorName: 'Amit Verma',
      company: 'M/s Bharat Supply Corp',
      contactNo: '98765 43210',
      purpose: 'Material Inspection',
      personToMeet: 'Anil Sharma (Warehouse Manager)',
      entryTime: '09:15 AM',
      exitTime: '—',
      status: 'Inside',
      validTill: 'Today, 06:00 PM',
      idProof: 'Aadhaar Card',
      idNumber: '1234 5678 9012',
    },
    {
      id: 2,
      passNo: 'V-2026-002',
      visitorName: 'Sneha Kapoor',
      company: 'Prime Foods Logistics Ltd',
      contactNo: '91234 56780',
      purpose: 'Official Meeting',
      personToMeet: 'Pooja Rana (Inventory Supervisor)',
      entryTime: '09:32 AM',
      exitTime: '11:20 AM',
      status: 'Checked Out',
      validTill: 'Today, 06:00 PM',
      idProof: 'Corporate ID',
      idNumber: 'DFL-8821',
    },
    {
      id: 3,
      passNo: 'V-2026-003',
      visitorName: 'Rohit Mehta',
      company: 'LogiTrans Solutions Pvt Ltd',
      contactNo: '99887 76655',
      purpose: 'Vendor Discussion',
      personToMeet: 'Suresh Chauhan (Logistics Officer)',
      entryTime: '10:10 AM',
      exitTime: '—',
      status: 'Inside',
      validTill: 'Today, 06:00 PM',
      idProof: 'Driving License',
      idNumber: 'DL-0420198821',
    },
    {
      id: 4,
      passNo: 'V-2026-004',
      visitorName: 'Pooja Singh',
      company: 'Apex Industrial Tools',
      contactNo: '98761 23450',
      purpose: 'Maintenance & Repairs',
      personToMeet: 'Rajesh Verma (Quality & Lab Lead)',
      entryTime: '10:45 AM',
      exitTime: '—',
      status: 'Pending',
      validTill: 'Today, 06:00 PM',
      idProof: 'Aadhaar Card',
      idNumber: '5544 3322 1199',
    },
    {
      id: 5,
      passNo: 'V-2026-005',
      visitorName: 'Vikram Jain',
      company: 'National Packaging Supplies',
      contactNo: '98654 32100',
      purpose: 'Consignment Dispatch',
      personToMeet: 'Anil Sharma (Warehouse Manager)',
      entryTime: '11:05 AM',
      exitTime: '12:10 PM',
      status: 'Checked Out',
      validTill: 'Today, 06:00 PM',
      idProof: 'PAN Card',
      idNumber: 'ABCDE1234F',
    },
    {
      id: 6,
      passNo: 'V-2026-006',
      visitorName: 'Anil Tiwari',
      company: 'Eastern Logistics Corridors',
      contactNo: '98450 99881',
      purpose: 'Audit & Compliance',
      personToMeet: 'Dr. S. Patel (Compliance Head)',
      entryTime: '11:30 AM',
      exitTime: '—',
      status: 'Inside',
      validTill: 'Today, 06:00 PM',
      idProof: 'Driving License',
      idNumber: 'UP-3220184451',
    },
    {
      id: 7,
      passNo: 'V-2026-007',
      visitorName: 'Neha Gupta',
      company: 'Global Agri Traders Ltd',
      contactNo: '98112 34455',
      purpose: 'Official Meeting',
      personToMeet: 'Pooja Rana (Inventory Supervisor)',
      entryTime: '11:45 AM',
      exitTime: '—',
      status: 'Inside',
      validTill: 'Today, 06:00 PM',
      idProof: 'Aadhaar Card',
      idNumber: '9988 7766 5544',
    },
    {
      id: 8,
      passNo: 'V-2026-008',
      visitorName: 'Karan Malhotra',
      company: 'Kansai Industrial Paints',
      contactNo: '98333 22110',
      purpose: 'Material Inspection',
      personToMeet: 'Rajesh Verma (Quality & Lab Lead)',
      entryTime: '12:20 PM',
      exitTime: '—',
      status: 'Inside',
      validTill: 'Today, 06:00 PM',
      idProof: 'Corporate ID',
      idNumber: 'KIP-3321',
    },
  ])

  // Selected Visitor for Print Badge Modal
  const [selectedVisitor, setSelectedVisitor] = useState(visitors[0])

  // New Visitor Form State
  const [newVisitor, setNewVisitor] = useState({
    visitorName: '',
    company: '',
    contactNo: '',
    purpose: 'Material Inspection',
    personToMeet: 'Anil Sharma (Warehouse Manager)',
    idProof: 'Aadhaar Card',
    idNumber: '',
  })

  // Toast trigger
  const triggerToast = (msg) => {
    setToastMessage(msg)
    setTimeout(() => setToastMessage(null), 3500)
  }

  // Filtered visitors
  const filteredVisitors = useMemo(() => {
    return visitors.filter((item) => {
      // Tab filter
      if (activeTab === 'inside' && item.status !== 'Inside') return false
      if (activeTab === 'checked_out' && item.status !== 'Checked Out') return false
      if (activeTab === 'pending' && item.status !== 'Pending') return false

      // Search filter
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase()
        return (
          item.visitorName.toLowerCase().includes(q) ||
          item.company.toLowerCase().includes(q) ||
          item.contactNo.includes(q) ||
          item.passNo.toLowerCase().includes(q) ||
          item.personToMeet.toLowerCase().includes(q) ||
          item.purpose.toLowerCase().includes(q)
        )
      }
      return true
    })
  }, [visitors, activeTab, searchQuery])

  // Register New Visitor
  const handleRegisterVisitor = (e) => {
    e.preventDefault()
    if (!newVisitor.visitorName.trim() || !newVisitor.contactNo.trim()) {
      triggerToast('Please provide Visitor Name and Contact Number!')
      return
    }

    const nextPassNum = visitors.length + 1
    const passStr = `V-2026-${String(nextPassNum).padStart(3, '0')}`
    const currentTime = new Date().toLocaleTimeString('en-IN', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    })

    const newObj = {
      id: Date.now(),
      passNo: passStr,
      visitorName: newVisitor.visitorName.trim(),
      company: newVisitor.company.trim() || 'Direct Client Representative',
      contactNo: newVisitor.contactNo.trim(),
      purpose: newVisitor.purpose,
      personToMeet: newVisitor.personToMeet,
      entryTime: currentTime,
      exitTime: '—',
      status: 'Inside',
      validTill: 'Today, 06:00 PM',
      idProof: newVisitor.idProof,
      idNumber: newVisitor.idNumber.trim() || 'VERIFIED-ON-GATE',
    }

    setVisitors([newObj, ...visitors])
    setSelectedVisitor(newObj)
    setShowAddModal(false)
    setShowPrintModal(true)
    setNewVisitor({
      visitorName: '',
      company: '',
      contactNo: '',
      purpose: 'Material Inspection',
      personToMeet: 'Anil Sharma (Warehouse Manager)',
      idProof: 'Aadhaar Card',
      idNumber: '',
    })
    triggerToast(`Visitor Pass ${passStr} issued to ${newObj.visitorName}`)
  }

  // Check-Out Visitor
  const handleCheckOut = (id) => {
    const currentTime = new Date().toLocaleTimeString('en-IN', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    })
    setVisitors(
      visitors.map((v) =>
        v.id === id ? { ...v, status: 'Checked Out', exitTime: currentTime } : v
      )
    )
    triggerToast('Visitor checked out successfully.')
  }

  // Approve Pending Visitor
  const handleApprove = (id) => {
    setVisitors(
      visitors.map((v) => (v.id === id ? { ...v, status: 'Inside' } : v))
    )
    triggerToast('Visitor approved and admitted into premises.')
  }

  // Export CSV
  const handleExport = () => {
    const headers = [
      'Pass No',
      'Visitor Name',
      'Company / Organization',
      'Contact No',
      'Purpose',
      'Host Person',
      'Entry Time',
      'Exit Time',
      'Status',
    ]
    const rows = visitors.map((v) => [
      v.passNo,
      `"${v.visitorName}"`,
      `"${v.company}"`,
      v.contactNo,
      `"${v.purpose}"`,
      `"${v.personToMeet}"`,
      v.entryTime,
      v.exitTime,
      v.status,
    ])
    const csvContent =
      'data:text/csv;charset=utf-8,' +
      [headers.join(','), ...rows.map((e) => e.join(','))].join('\n')
    const encodedUri = encodeURI(csvContent)
    const link = document.createElement('a')
    link.setAttribute('href', encodedUri)
    link.setAttribute('download', 'Warehouse_Visitor_Log.csv')
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    triggerToast('Visitor records exported to CSV successfully.')
  }

  // Status Badge Styling
  const getStatusBadge = (status) => {
    switch (status) {
      case 'Inside':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200'
      case 'Checked Out':
        return 'bg-slate-100 text-slate-700 border-slate-200'
      case 'Pending':
        return 'bg-amber-50 text-amber-700 border-amber-200'
      default:
        return 'bg-slate-50 text-slate-600 border-slate-200'
    }
  }

  return (
    <div className="space-y-6 max-w-[1720px] mx-auto pb-10 select-none">
      {/* Toast Alert */}
      {toastMessage && (
        <div className="fixed top-5 right-5 z-50 bg-slate-900 text-white px-4 py-3 rounded-xl shadow-2xl border border-slate-700 flex items-center gap-3 animate-fade-in text-sm font-semibold">
          <div className="w-6 h-6 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
            <Check className="w-4 h-4" />
          </div>
          <span>{toastMessage}</span>
        </div>
      )}

      {/* 1. Header Banner - Clean, Modern & Professional */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-indigo-50 border border-indigo-100 text-indigo-600 flex items-center justify-center shrink-0 shadow-xs">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-3 flex-wrap">
              <h1 className="text-xl sm:text-2xl font-bold text-slate-900">
                Visitor Management
              </h1>
              <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                ● Visitor Access Active
              </span>
            </div>
            <p className="text-xs sm:text-sm text-slate-500 font-medium mt-1">
              Issue visitor badges, monitor on-premise guests, verify credentials, and manage check-out audits
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2.5 flex-wrap shrink-0">
          <button
            type="button"
            onClick={handleExport}
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
            <span>Register New Visitor</span>
          </button>
        </div>
      </div>

      {/* 2. Dynamic KPI Stat Cards (Real State Calculations) */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {/* Card 1: Total Visitors Registered */}
        <div className="bg-white rounded-2xl p-4.5 border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Total Visitors</p>
            <p className="text-2xl font-extrabold text-slate-900 mt-1">{visitors.length}</p>
            <p className="text-xs text-slate-500 font-medium mt-0.5">Today's Total Log</p>
          </div>
          <div className="w-11 h-11 rounded-xl bg-indigo-50 border border-indigo-100 text-indigo-600 flex items-center justify-center shrink-0">
            <Users className="w-5 h-5" />
          </div>
        </div>

        {/* Card 2: Currently Inside Premises */}
        <div className="bg-white rounded-2xl p-4.5 border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Currently Inside</p>
            <p className="text-2xl font-extrabold text-emerald-600 mt-1">
              {visitors.filter((v) => v.status === 'Inside').length}
            </p>
            <p className="text-xs text-emerald-600 font-semibold mt-0.5">Active on Campus</p>
          </div>
          <div className="w-11 h-11 rounded-xl bg-emerald-50 border border-emerald-100 text-emerald-600 flex items-center justify-center shrink-0">
            <UserCheck className="w-5 h-5" />
          </div>
        </div>

        {/* Card 3: Checked Out */}
        <div className="bg-white rounded-2xl p-4.5 border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Checked Out</p>
            <p className="text-2xl font-extrabold text-slate-700 mt-1">
              {visitors.filter((v) => v.status === 'Checked Out').length}
            </p>
            <p className="text-xs text-slate-500 font-medium mt-0.5">Visit Concluded</p>
          </div>
          <div className="w-11 h-11 rounded-xl bg-slate-100 border border-slate-200 text-slate-700 flex items-center justify-center shrink-0">
            <LogOut className="w-5 h-5" />
          </div>
        </div>

        {/* Card 4: Pending Approval */}
        <div className="bg-white rounded-2xl p-4.5 border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Pending Entry</p>
            <p className="text-2xl font-extrabold text-amber-600 mt-1">
              {visitors.filter((v) => v.status === 'Pending').length}
            </p>
            <p className="text-xs text-amber-600 font-semibold mt-0.5">Awaiting Clearance</p>
          </div>
          <div className="w-11 h-11 rounded-xl bg-amber-50 border border-amber-100 text-amber-600 flex items-center justify-center shrink-0">
            <Clock className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* 3. Filter Navigation & Live Search Bar */}
      <div className="bg-white rounded-2xl p-3 border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-3">
        {/* Filter Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto p-1 bg-slate-100 rounded-xl text-xs font-semibold">
          <button
            type="button"
            onClick={() => setActiveTab('all')}
            className={`px-3.5 py-2 rounded-lg transition whitespace-nowrap cursor-pointer ${
              activeTab === 'all'
                ? 'bg-indigo-600 text-white shadow-xs font-bold'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/70'
            }`}
          >
            All Visitors ({visitors.length})
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('inside')}
            className={`px-3.5 py-2 rounded-lg transition whitespace-nowrap cursor-pointer ${
              activeTab === 'inside'
                ? 'bg-indigo-600 text-white shadow-xs font-bold'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/70'
            }`}
          >
            Currently Inside ({visitors.filter((v) => v.status === 'Inside').length})
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('checked_out')}
            className={`px-3.5 py-2 rounded-lg transition whitespace-nowrap cursor-pointer ${
              activeTab === 'checked_out'
                ? 'bg-indigo-600 text-white shadow-xs font-bold'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/70'
            }`}
          >
            Checked Out ({visitors.filter((v) => v.status === 'Checked Out').length})
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('pending')}
            className={`px-3.5 py-2 rounded-lg transition whitespace-nowrap cursor-pointer ${
              activeTab === 'pending'
                ? 'bg-indigo-600 text-white shadow-xs font-bold'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/70'
            }`}
          >
            Pending Entry ({visitors.filter((v) => v.status === 'Pending').length})
          </button>
        </div>

        {/* Live Search */}
        <div className="relative flex-1 md:max-w-xs">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3 pointer-events-none" />
          <input
            type="text"
            placeholder="Search visitor, company, host, pass..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-50 border border-slate-300 rounded-xl pl-9 pr-3 py-2 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 focus:bg-white"
          />
        </div>
      </div>

      {/* 4. Full-Width Spacious Visitor Ledger Table */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div>
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <span>Visitor Entry Ledger &amp; Security Audits</span>
              <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700">
                {filteredVisitors.length} of {visitors.length}
              </span>
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Chronological log of verified visitor credentials and check-in clearances
            </p>
          </div>

          <div className="text-xs font-semibold text-slate-500">
            Terminal: Gate 01 Security Control
          </div>
        </div>

        <div className="overflow-x-auto rounded-xl border border-slate-200">
          <table className="w-full text-left text-sm min-w-[1050px]">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-200 text-slate-600 text-xs uppercase tracking-wider font-bold">
                <th className="py-3.5 px-3 w-10 text-center">#</th>
                <th className="py-3.5 px-4 w-28">Pass No.</th>
                <th className="py-3.5 px-4 min-w-[170px]">Visitor Details</th>
                <th className="py-3.5 px-4 min-w-[180px]">Company / Organization</th>
                <th className="py-3.5 px-4 min-w-[170px]">Purpose of Visit</th>
                <th className="py-3.5 px-4 min-w-[190px]">Person to Meet (Host)</th>
                <th className="py-3.5 px-4 w-24">Entry</th>
                <th className="py-3.5 px-4 w-24">Exit</th>
                <th className="py-3.5 px-4 text-center w-28">Status</th>
                <th className="py-3.5 px-5 text-right w-44">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 bg-white">
              {filteredVisitors.length === 0 ? (
                <tr>
                  <td colSpan="10" className="py-10 text-center text-slate-400 text-sm">
                    No visitor records match the current filter or search criteria.
                  </td>
                </tr>
              ) : (
                filteredVisitors.map((v, idx) => (
                  <tr key={v.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3.5 px-3 text-center text-slate-400 font-mono text-xs font-semibold">
                      {idx + 1}
                    </td>
                    <td className="py-3.5 px-4 font-mono font-bold text-indigo-700 whitespace-nowrap">
                      {v.passNo}
                    </td>
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <p className="font-bold text-slate-900">{v.visitorName}</p>
                      <p className="text-xs text-slate-500 font-mono">{v.contactNo}</p>
                    </td>
                    <td className="py-3.5 px-4 text-slate-700">
                      <p className="font-medium text-slate-900 truncate max-w-[180px]">{v.company}</p>
                    </td>
                    <td className="py-3.5 px-4 text-slate-700 whitespace-nowrap font-medium text-xs">
                      {v.purpose}
                    </td>
                    <td className="py-3.5 px-4 text-slate-700 whitespace-nowrap">
                      <p className="font-semibold text-slate-900 text-xs">{v.personToMeet}</p>
                    </td>
                    <td className="py-3.5 px-4 text-xs text-slate-700 font-semibold whitespace-nowrap">
                      {v.entryTime}
                    </td>
                    <td className="py-3.5 px-4 text-xs text-slate-500 whitespace-nowrap">
                      {v.exitTime}
                    </td>
                    <td className="py-3.5 px-4 text-center whitespace-nowrap">
                      <span
                        className={`text-xs font-semibold px-2.5 py-1 rounded-full border ${getStatusBadge(
                          v.status
                        )}`}
                      >
                        {v.status}
                      </span>
                    </td>
                    <td className="py-3.5 px-5 text-right whitespace-nowrap">
                      <div className="flex items-center justify-end gap-1.5">
                        {v.status === 'Inside' && (
                          <button
                            type="button"
                            onClick={() => handleCheckOut(v.id)}
                            className="px-2.5 py-1 rounded-lg bg-orange-50 hover:bg-orange-600 text-orange-700 hover:text-white border border-orange-200 hover:border-orange-600 text-xs font-bold transition cursor-pointer shadow-2xs flex items-center gap-1"
                            title="Check-Out Visitor"
                          >
                            <LogOut className="w-3 h-3" />
                            <span>Check Out</span>
                          </button>
                        )}

                        {v.status === 'Pending' && (
                          <button
                            type="button"
                            onClick={() => handleApprove(v.id)}
                            className="px-2.5 py-1 rounded-lg bg-emerald-50 hover:bg-emerald-600 text-emerald-700 hover:text-white border border-emerald-200 hover:border-emerald-600 text-xs font-bold transition cursor-pointer shadow-2xs flex items-center gap-1"
                            title="Approve Entry"
                          >
                            <Check className="w-3 h-3" />
                            <span>Approve</span>
                          </button>
                        )}

                        <button
                          type="button"
                          onClick={() => {
                            setSelectedVisitor(v)
                            setShowPrintModal(true)
                          }}
                          className="px-2.5 py-1 rounded-lg bg-indigo-50 hover:bg-indigo-600 text-indigo-700 hover:text-white border border-indigo-200 hover:border-indigo-600 text-xs font-bold transition cursor-pointer shadow-2xs flex items-center gap-1"
                          title="Print Pass Badge"
                        >
                          <Printer className="w-3 h-3" />
                          <span>Pass Badge</span>
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

      {/* ========================================================= */}
      {/* REGISTER NEW VISITOR MODAL (CUSTOM PURE REACT SELECTS)    */}
      {/* ========================================================= */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full p-6 space-y-5 animate-scale-in border border-slate-200">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b pb-4 border-slate-100">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-indigo-50 border border-indigo-100 text-indigo-600 flex items-center justify-center font-bold">
                  <Users className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">Register New Visitor</h3>
                  <p className="text-xs text-slate-500">Generate access token and security pass slip</p>
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

            <form onSubmit={handleRegisterVisitor} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    Visitor Full Name <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Ramesh Chandra"
                    value={newVisitor.visitorName}
                    onChange={(e) =>
                      setNewVisitor({ ...newVisitor, visitorName: e.target.value })
                    }
                    className="w-full bg-white border border-slate-300 rounded-xl px-3.5 py-2.5 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    Company / Organization <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Bharat Supply Corp"
                    value={newVisitor.company}
                    onChange={(e) =>
                      setNewVisitor({ ...newVisitor, company: e.target.value })
                    }
                    className="w-full bg-white border border-slate-300 rounded-xl px-3.5 py-2.5 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    Contact Phone Number <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="tel"
                    required
                    placeholder="e.g. 98765 43210"
                    value={newVisitor.contactNo}
                    onChange={(e) =>
                      setNewVisitor({ ...newVisitor, contactNo: e.target.value })
                    }
                    className="w-full bg-white border border-slate-300 rounded-xl px-3.5 py-2.5 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                  />
                </div>

                <CustomSelect
                  label="Purpose of Visit"
                  value={newVisitor.purpose}
                  onChange={(val) => setNewVisitor({ ...newVisitor, purpose: val })}
                  options={PURPOSE_OPTIONS}
                  zIndexClass="z-30"
                />
              </div>

              <CustomSelect
                label="Person to Meet (Host)"
                value={newVisitor.personToMeet}
                onChange={(val) => setNewVisitor({ ...newVisitor, personToMeet: val })}
                options={HOST_OPTIONS}
                zIndexClass="z-20"
              />

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <CustomSelect
                  label="Government ID Proof"
                  value={newVisitor.idProof}
                  onChange={(val) => setNewVisitor({ ...newVisitor, idProof: val })}
                  options={ID_PROOF_OPTIONS}
                  zIndexClass="z-10"
                />

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    ID Document Number
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. 1234 5678 9012"
                    value={newVisitor.idNumber}
                    onChange={(e) =>
                      setNewVisitor({ ...newVisitor, idNumber: e.target.value })
                    }
                    className="w-full bg-white border border-slate-300 rounded-xl px-3.5 py-2.5 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                  />
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2.5 border border-slate-300 rounded-xl text-slate-700 hover:bg-slate-50 font-bold cursor-pointer transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 rounded-xl font-bold shadow-xs cursor-pointer transition"
                >
                  Issue Visitor Pass
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* HIGH RESOLUTION PRINTABLE VISITOR BADGE MODAL             */}
      {/* ========================================================= */}
      {showPrintModal && selectedVisitor && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 space-y-4 animate-scale-in border border-slate-200">
            {/* Header */}
            <div className="flex items-center justify-between border-b pb-3 border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-indigo-50 border border-indigo-100 text-indigo-600 flex items-center justify-center font-bold">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">Official Visitor Pass Badge</h3>
                  <p className="text-[11px] text-slate-500">Security Gate Authorization Slip</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowPrintModal(false)}
                className="text-slate-400 hover:text-slate-700 p-1.5 rounded-lg hover:bg-slate-100 cursor-pointer transition"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Printable Pass Paper Card */}
            <div className="border border-slate-300 rounded-2xl bg-white p-5 space-y-4 shadow-sm">
              <div className="flex items-center justify-between border-b border-slate-200 pb-3">
                <div>
                  <span className="text-[10px] uppercase font-bold text-indigo-600 tracking-wider block">
                    WAREHOUSE OPERATIONS
                  </span>
                  <h4 className="text-base font-extrabold text-slate-900 tracking-tight">
                    VISITOR SECURITY PASS
                  </h4>
                  <p className="text-xs font-mono font-bold text-slate-700 mt-0.5">
                    {selectedVisitor.passNo}
                  </p>
                </div>
                <div className="w-14 h-14 bg-slate-50 border border-slate-200 rounded-xl p-1 flex flex-col items-center justify-center">
                  <QrCode className="w-10 h-10 text-slate-800" />
                </div>
              </div>

              {/* Details List */}
              <div className="space-y-2 text-xs">
                <div className="grid grid-cols-3 gap-2">
                  <span className="text-slate-500 font-medium">Visitor Name:</span>
                  <span className="col-span-2 font-bold text-slate-900">{selectedVisitor.visitorName}</span>
                </div>
                <div className="grid grid-cols-3 gap-2">
                  <span className="text-slate-500 font-medium">Organization:</span>
                  <span className="col-span-2 font-semibold text-slate-800">{selectedVisitor.company}</span>
                </div>
                <div className="grid grid-cols-3 gap-2">
                  <span className="text-slate-500 font-medium">Contact:</span>
                  <span className="col-span-2 font-mono font-semibold text-slate-800">{selectedVisitor.contactNo}</span>
                </div>
                <div className="grid grid-cols-3 gap-2">
                  <span className="text-slate-500 font-medium">Host (Meet):</span>
                  <span className="col-span-2 font-semibold text-indigo-700">{selectedVisitor.personToMeet}</span>
                </div>
                <div className="grid grid-cols-3 gap-2">
                  <span className="text-slate-500 font-medium">Purpose:</span>
                  <span className="col-span-2 text-slate-700">{selectedVisitor.purpose}</span>
                </div>
                <div className="grid grid-cols-3 gap-2">
                  <span className="text-slate-500 font-medium">Entry Time:</span>
                  <span className="col-span-2 font-semibold text-slate-800">{selectedVisitor.entryTime}</span>
                </div>
                <div className="grid grid-cols-3 gap-2">
                  <span className="text-slate-500 font-medium">Validity:</span>
                  <span className="col-span-2 text-slate-600">{selectedVisitor.validTill}</span>
                </div>
              </div>

              {/* Status Tag */}
              <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                <span className="text-slate-500">Clearance Status:</span>
                <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold border ${getStatusBadge(selectedVisitor.status)}`}>
                  {selectedVisitor.status}
                </span>
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
                onClick={() => window.print()}
                className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-xs transition"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Print Official Badge</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
