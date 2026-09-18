import { useState, useMemo } from 'react'
import { Link } from 'react-router-dom'
import { LogOut, Check, Printer, X } from 'lucide-react'

export default function VisitorManagement() {
  const [activeTab, setActiveTab] = useState('all') // 'all', 'inside', 'checked_out', 'pending', 'cancelled'
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedDate, setSelectedDate] = useState('16-09-2026')
  const [showAddModal, setShowAddModal] = useState(false)
  const [showPrintModal, setShowPrintModal] = useState(false)
  const [openActionMenuId, setOpenActionMenuId] = useState(null)
  const [toastMessage, setToastMessage] = useState(null)

  // Visitor List matching screenshot exactly
  const [visitors, setVisitors] = useState([
    {
      id: 1,
      passNo: 'V-2026-001',
      visitorName: 'Amit Verma',
      company: 'Bharat Enterprises',
      contactNo: '9876543210',
      purpose: 'Material Inspection',
      personToMeet: 'Maj. R. Singh',
      entryTime: '09:15 AM',
      exitTime: '-',
      status: 'Inside',
      statusClass: 'bg-emerald-100 text-emerald-800 border-emerald-200',
      validTill: '16 Sep 2026, 06:00 PM',
      idProof: 'Aadhaar Card',
      idNumber: '1234 5678 9012',
    },
    {
      id: 2,
      passNo: 'V-2026-002',
      visitorName: 'Sneha Kapoor',
      company: 'Defence Foods Ltd',
      contactNo: '9123456780',
      purpose: 'Official Meeting',
      personToMeet: 'Col. A. Sharma',
      entryTime: '09:32 AM',
      exitTime: '11:20 AM',
      status: 'Checked Out',
      statusClass: 'bg-emerald-50 text-emerald-700 border-emerald-200',
      validTill: '16 Sep 2026, 06:00 PM',
      idProof: 'Corporate ID',
      idNumber: 'DFL-8821',
    },
    {
      id: 3,
      passNo: 'V-2026-003',
      visitorName: 'Rohit Mehta',
      company: 'LogiTrans Pvt Ltd',
      contactNo: '9988776655',
      purpose: 'Vendor Discussion',
      personToMeet: 'Capt. P. Rana',
      entryTime: '10:10 AM',
      exitTime: '-',
      status: 'Inside',
      statusClass: 'bg-emerald-100 text-emerald-800 border-emerald-200',
      validTill: '16 Sep 2026, 06:00 PM',
      idProof: 'Driving License',
      idNumber: 'DL-0420198821',
    },
    {
      id: 4,
      passNo: 'V-2026-004',
      visitorName: 'Pooja Singh',
      company: 'Tech Solutions',
      contactNo: '9876123450',
      purpose: 'System Demo',
      personToMeet: 'Lt. S. Chauhan',
      entryTime: '10:45 AM',
      exitTime: '-',
      status: 'Pending',
      statusClass: 'bg-amber-100 text-amber-800 border-amber-200',
      validTill: '16 Sep 2026, 06:00 PM',
      idProof: 'Aadhaar Card',
      idNumber: '5544 3322 1199',
    },
    {
      id: 5,
      passNo: 'V-2026-005',
      visitorName: 'Vikram Jain',
      company: 'National Supply',
      contactNo: '9865432100',
      purpose: 'Document Submission',
      personToMeet: 'Sub. K. Yadav',
      entryTime: '11:05 AM',
      exitTime: '12:10 PM',
      status: 'Checked Out',
      statusClass: 'bg-emerald-50 text-emerald-700 border-emerald-200',
      validTill: '16 Sep 2026, 06:00 PM',
      idProof: 'PAN Card',
      idNumber: 'ABCDE1234F',
    },
    {
      id: 6,
      passNo: 'V-2026-006',
      visitorName: 'Anil Tiwari',
      company: 'Eastern Logistics',
      contactNo: '9877890123',
      purpose: 'Site Visit',
      personToMeet: 'Maj. R. Singh',
      entryTime: '11:30 AM',
      exitTime: '-',
      status: 'Inside',
      statusClass: 'bg-emerald-100 text-emerald-800 border-emerald-200',
      validTill: '16 Sep 2026, 06:00 PM',
      idProof: 'Driving License',
      idNumber: 'UP-3220187654',
    },
    {
      id: 7,
      passNo: 'V-2026-007',
      visitorName: 'Neha Gupta',
      company: 'Quality Inspection Co.',
      contactNo: '9911223344',
      purpose: 'Lab Visit',
      personToMeet: 'Dr. S. Patel',
      entryTime: '11:45 AM',
      exitTime: '-',
      status: 'Inside',
      statusClass: 'bg-emerald-100 text-emerald-800 border-emerald-200',
      validTill: '16 Sep 2026, 06:00 PM',
      idProof: 'Aadhaar Card',
      idNumber: '9988 1122 3344',
    },
    {
      id: 8,
      passNo: 'V-2026-008',
      visitorName: 'Sandeep Raj',
      company: 'Om Traders',
      contactNo: '9800112233',
      purpose: 'Delivery Follow-up',
      personToMeet: 'WO. A. Khan',
      entryTime: '12:05 PM',
      exitTime: '-',
      status: 'Pending',
      statusClass: 'bg-amber-100 text-amber-800 border-amber-200',
      validTill: '16 Sep 2026, 06:00 PM',
      idProof: 'Voter ID',
      idNumber: 'VTR-881920',
    },
    {
      id: 9,
      passNo: 'V-2026-009',
      visitorName: 'Karan Malhotra',
      company: 'Infra Services',
      contactNo: '9722334455',
      purpose: 'Contract Discussion',
      personToMeet: 'Col. A. Sharma',
      entryTime: '12:20 PM',
      exitTime: '-',
      status: 'Inside',
      statusClass: 'bg-emerald-100 text-emerald-800 border-emerald-200',
      validTill: '16 Sep 2026, 06:00 PM',
      idProof: 'Army Civilian Pass',
      idNumber: 'ACP-4412',
    },
    {
      id: 10,
      passNo: 'V-2026-010',
      visitorName: 'Riya Sharma',
      company: 'Global Supplies',
      contactNo: '9899001122',
      purpose: 'Product Sample',
      personToMeet: 'Capt. P. Rana',
      entryTime: '12:40 PM',
      exitTime: '-',
      status: 'Inside',
      statusClass: 'bg-emerald-100 text-emerald-800 border-emerald-200',
      validTill: '16 Sep 2026, 06:00 PM',
      idProof: 'Aadhaar Card',
      idNumber: '7766 5544 3322',
    },
  ])

  // Selected Visitor for Preview (defaults to first visitor)
  const [selectedVisitor, setSelectedVisitor] = useState(visitors[0])

  // New Visitor Form State
  const [newVisitor, setNewVisitor] = useState({
    visitorName: '',
    company: '',
    contactNo: '',
    purpose: 'Material Inspection',
    personToMeet: 'Col. A. Sharma',
    idProof: 'Aadhaar Card',
    idNumber: '',
  })

  // Toast trigger
  const triggerToast = (msg) => {
    setToastMessage(msg)
    setTimeout(() => setToastMessage(null), 3500)
  }

  // Filtered visitor list
  const filteredVisitors = useMemo(() => {
    return visitors.filter((item) => {
      // Tab filter
      if (activeTab === 'inside' && item.status !== 'Inside') return false
      if (activeTab === 'checked_out' && item.status !== 'Checked Out') return false
      if (activeTab === 'pending' && item.status !== 'Pending') return false
      if (activeTab === 'cancelled' && item.status !== 'Cancelled') return false

      // Search filter
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase()
        return (
          item.visitorName.toLowerCase().includes(q) ||
          item.company.toLowerCase().includes(q) ||
          item.contactNo.includes(q) ||
          item.passNo.toLowerCase().includes(q) ||
          item.personToMeet.toLowerCase().includes(q)
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

    const newObj = {
      id: Date.now(),
      passNo: passStr,
      visitorName: newVisitor.visitorName.trim(),
      company: newVisitor.company.trim() || 'Official Representative',
      contactNo: newVisitor.contactNo.trim(),
      purpose: newVisitor.purpose,
      personToMeet: newVisitor.personToMeet,
      entryTime: '01:00 PM',
      exitTime: '-',
      status: 'Inside',
      statusClass: 'bg-emerald-100 text-emerald-800 border-emerald-200',
      validTill: '16 Sep 2026, 06:00 PM',
      idProof: newVisitor.idProof,
      idNumber: newVisitor.idNumber || 'XXXX-XXXX-XXXX',
    }

    setVisitors([newObj, ...visitors])
    setSelectedVisitor(newObj)
    setShowAddModal(false)
    setNewVisitor({
      visitorName: '',
      company: '',
      contactNo: '',
      purpose: 'Material Inspection',
      personToMeet: 'Col. A. Sharma',
      idProof: 'Aadhaar Card',
      idNumber: '',
    })
    triggerToast(`Visitor Pass ${passStr} issued to ${newObj.visitorName}`)
  }

  // Update Visitor Status
  const handleStatusUpdate = (id, newStatus) => {
    setVisitors(
      visitors.map((v) => {
        if (v.id === id) {
          let sClass = 'bg-emerald-100 text-emerald-800 border-emerald-200'
          let exitTime = v.exitTime
          if (newStatus === 'Checked Out') {
            sClass = 'bg-emerald-50 text-emerald-700 border-emerald-200'
            exitTime = '01:15 PM'
          }
          if (newStatus === 'Pending') sClass = 'bg-amber-100 text-amber-800 border-amber-200'
          if (newStatus === 'Cancelled') sClass = 'bg-red-100 text-red-800 border-red-200'
          return { ...v, status: newStatus, statusClass: sClass, exitTime }
        }
        return v
      })
    )
    setOpenActionMenuId(null)
    triggerToast(`Status updated to ${newStatus}`)
  }

  // Export CSV
  const handleExport = () => {
    const headers = ['Pass No', 'Visitor Name', 'Company / Organization', 'Contact No', 'Purpose', 'Person to Meet', 'Entry Time', 'Exit Time', 'Status']
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
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n')
    const encodedUri = encodeURI(csvContent)
    const link = document.createElement('a')
    link.setAttribute('href', encodedUri)
    link.setAttribute('download', 'Indian_Army_Visitor_Log.csv')
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    triggerToast('Visitor records exported to CSV successfully.')
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
          <div className="w-11 h-11 rounded-lg bg-[#EBF5EA] border border-[#CDE5CA] flex items-center justify-center text-[#1E3A1E] shadow-xs">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
            </svg>
          </div>
          <div>
            <h1 className="text-xl font-black text-slate-800 tracking-tight">Visitor Management</h1>
            <p className="text-xs text-slate-500 font-medium">
              Manage and track all visitor entries, approvals and movements within the warehouse premises.
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="text-xs text-slate-400 flex items-center gap-1.5 font-medium mr-2">
            <Link to="/dashboard" className="hover:text-slate-700">Home</Link>
            <span>›</span>
            <span className="text-slate-800 font-semibold">Visitor Management</span>
          </div>
          <button
            type="button"
            onClick={() => setShowAddModal(true)}
            className="bg-[#1F331E] hover:bg-[#2A4428] text-white px-4 py-2 rounded-lg text-xs font-bold flex items-center gap-2 shadow-xs transition cursor-pointer"
          >
            <span className="text-base leading-none">+</span>
            <span>Register New Visitor</span>
          </button>
        </div>
      </div>

      {/* 5 KPI Stat Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
        {/* Card 1: Total Visitors Today */}
        <div className="bg-white rounded-xl p-3.5 shadow-xs border border-slate-200 flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-blue-500 text-white flex items-center justify-center shrink-0 shadow-xs">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
            </svg>
          </div>
          <div>
            <p className="text-[11px] font-semibold text-slate-500">Total Visitors Today</p>
            <div className="flex items-baseline gap-1.5">
              <h3 className="text-2xl font-black text-slate-800 leading-tight">18</h3>
              <span className="text-[10px] font-bold text-emerald-600">↑ 12%</span>
            </div>
            <p className="text-[10px] text-slate-400 font-medium">vs. previous day</p>
          </div>
        </div>

        {/* Card 2: Currently Inside */}
        <div className="bg-white rounded-xl p-3.5 shadow-xs border border-slate-200 flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-emerald-500 text-white flex items-center justify-center shrink-0 shadow-xs">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
            </svg>
          </div>
          <div>
            <p className="text-[11px] font-semibold text-slate-500">Currently Inside</p>
            <h3 className="text-2xl font-black text-slate-800 leading-tight">7</h3>
            <p className="text-[10px] text-slate-400 font-medium">In Warehouse</p>
          </div>
        </div>

        {/* Card 3: Checked Out */}
        <div className="bg-white rounded-xl p-3.5 shadow-xs border border-slate-200 flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-orange-500 text-white flex items-center justify-center shrink-0 shadow-xs">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
          </div>
          <div>
            <p className="text-[11px] font-semibold text-slate-500">Checked Out</p>
            <h3 className="text-2xl font-black text-slate-800 leading-tight">10</h3>
            <p className="text-[10px] text-slate-400 font-medium">Today</p>
          </div>
        </div>

        {/* Card 4: Pending Approval */}
        <div className="bg-white rounded-xl p-3.5 shadow-xs border border-slate-200 flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-amber-500 text-white flex items-center justify-center shrink-0 shadow-xs">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div>
            <p className="text-[11px] font-semibold text-slate-500">Pending Approval</p>
            <h3 className="text-2xl font-black text-slate-800 leading-tight">2</h3>
            <p className="text-[10px] text-slate-400 font-medium">Waiting for approval</p>
          </div>
        </div>

        {/* Card 5: Blacklisted */}
        <div className="bg-white rounded-xl p-3.5 shadow-xs border border-slate-200 flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-red-500 text-white flex items-center justify-center shrink-0 shadow-xs">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
            </svg>
          </div>
          <div>
            <p className="text-[11px] font-semibold text-slate-500">Blacklisted</p>
            <h3 className="text-2xl font-black text-slate-800 leading-tight">1</h3>
            <p className="text-[10px] text-slate-400 font-medium">Restricted visitor</p>
          </div>
        </div>
      </div>

      {/* Filter Tabs & Search Controls Bar */}
      <div className="bg-white rounded-xl p-3 shadow-xs border border-slate-200 flex flex-col lg:flex-row lg:items-center justify-between gap-3">
        {/* Left Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto">
          <button
            type="button"
            onClick={() => setActiveTab('all')}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition whitespace-nowrap cursor-pointer ${
              activeTab === 'all'
                ? 'bg-[#1E381E] text-white shadow-xs'
                : 'bg-slate-100 hover:bg-slate-200 text-slate-600'
            }`}
          >
            All Visitors
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('inside')}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition whitespace-nowrap cursor-pointer ${
              activeTab === 'inside'
                ? 'bg-[#1E381E] text-white shadow-xs'
                : 'bg-slate-100 hover:bg-slate-200 text-slate-600'
            }`}
          >
            Inside ({visitors.filter((v) => v.status === 'Inside').length})
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('checked_out')}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition whitespace-nowrap cursor-pointer ${
              activeTab === 'checked_out'
                ? 'bg-[#1E381E] text-white shadow-xs'
                : 'bg-slate-100 hover:bg-slate-200 text-slate-600'
            }`}
          >
            Checked Out ({visitors.filter((v) => v.status === 'Checked Out').length})
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('pending')}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition whitespace-nowrap cursor-pointer ${
              activeTab === 'pending'
                ? 'bg-[#1E381E] text-white shadow-xs'
                : 'bg-slate-100 hover:bg-slate-200 text-slate-600'
            }`}
          >
            Pending ({visitors.filter((v) => v.status === 'Pending').length})
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('cancelled')}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition whitespace-nowrap cursor-pointer ${
              activeTab === 'cancelled'
                ? 'bg-[#1E381E] text-white shadow-xs'
                : 'bg-slate-100 hover:bg-slate-200 text-slate-600'
            }`}
          >
            Cancelled
          </button>
        </div>

        {/* Right Search, Date & Filter Buttons */}
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1 bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs text-slate-700">
            <svg className="w-3.5 h-3.5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <input
              type="text"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="w-20 bg-transparent text-xs font-medium text-slate-800 focus:outline-none"
            />
          </div>

          <div className="relative flex-1 sm:w-64">
            <svg className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="text"
              placeholder="Search by name, mobile, company, pass no..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-lg pl-8 pr-3 py-1.5 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-emerald-600 focus:bg-white"
            />
          </div>

          <button
            type="button"
            onClick={() => triggerToast('Filter options opened.')}
            className="bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 shadow-xs transition cursor-pointer"
          >
            <svg className="w-3.5 h-3.5 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
            </svg>
            <span>Filter</span>
          </button>
        </div>
      </div>

      {/* Main 2-Column Grid: Visitors Table (Left) + Quick Actions & Live Pass Preview (Right) */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-4 items-start">
        {/* ========================================================================= */}
        {/* LEFT COLUMN: Visitors Table (Span 9 / 12)                                 */}
        {/* ========================================================================= */}
        <div className="xl:col-span-9 bg-white rounded-xl shadow-xs border border-slate-200 overflow-hidden flex flex-col">
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
              style={{ minWidth: '1320px' }}
            >
              <thead className="bg-slate-50/80 text-slate-600 font-bold uppercase tracking-wider text-[11px]">
                <tr>
                  <th className="py-3.5 px-3 w-12 text-center whitespace-nowrap">#</th>
                  <th className="py-3.5 px-4 min-w-[130px] whitespace-nowrap">Pass No.</th>
                  <th className="py-3.5 px-4 min-w-[160px] whitespace-nowrap">Visitor Name</th>
                  <th className="py-3.5 px-4 min-w-[190px] whitespace-nowrap">Company / Organization</th>
                  <th className="py-3.5 px-4 min-w-[130px] whitespace-nowrap">Contact No.</th>
                  <th className="py-3.5 px-4 min-w-[170px] whitespace-nowrap">Purpose of Visit</th>
                  <th className="py-3.5 px-4 min-w-[160px] whitespace-nowrap">Person to Meet</th>
                  <th className="py-3.5 px-4 min-w-[110px] whitespace-nowrap">Entry Time</th>
                  <th className="py-3.5 px-4 min-w-[110px] whitespace-nowrap">Exit Time</th>
                  <th className="py-3.5 px-4 text-center min-w-[125px] whitespace-nowrap">Status</th>
                  <th className="py-3.5 px-3 text-center w-16 whitespace-nowrap">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 bg-white">
                {filteredVisitors.map((v, idx) => {
                  const isSelected = selectedVisitor?.id === v.id
                  return (
                    <tr
                      key={v.id}
                      onClick={() => setSelectedVisitor(v)}
                      className={`hover:bg-emerald-50/50 cursor-pointer transition ${
                        isSelected ? 'bg-emerald-50/70 font-medium' : ''
                      }`}
                    >
                      <td className="py-3.5 px-3 text-center text-slate-400 font-bold text-[11px] whitespace-nowrap">{idx + 1}</td>
                      <td className="py-3.5 px-4 font-mono font-bold text-slate-800 text-[11px] tracking-wide whitespace-nowrap">{v.passNo}</td>
                      <td className="py-3.5 px-4 font-semibold text-slate-800 text-xs whitespace-nowrap">{v.visitorName}</td>
                      <td className="py-3.5 px-4 text-slate-600 whitespace-nowrap">{v.company}</td>
                      <td className="py-3.5 px-4 font-mono text-slate-600 text-[11px] whitespace-nowrap">{v.contactNo}</td>
                      <td className="py-3.5 px-4 text-slate-700 font-medium whitespace-nowrap">{v.purpose}</td>
                      <td className="py-3.5 px-4 text-slate-700 font-medium whitespace-nowrap">{v.personToMeet}</td>
                      <td className="py-3.5 px-4 text-slate-500 whitespace-nowrap text-[11px] font-medium">{v.entryTime}</td>
                      <td className="py-3.5 px-4 text-slate-500 whitespace-nowrap text-[11px] font-medium">{v.exitTime}</td>
                      <td className="py-3.5 px-4 text-center whitespace-nowrap">
                        <span className={`inline-block px-3 py-0.5 rounded-full text-[10px] font-bold border ${v.statusClass}`}>
                          {v.status}
                        </span>
                      </td>
                      <td className="py-3.5 px-3 text-center relative whitespace-nowrap" onClick={(e) => e.stopPropagation()}>
                        <button
                          type="button"
                          onClick={() => setOpenActionMenuId(openActionMenuId === v.id ? null : v.id)}
                          className="bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-600 px-2.5 py-1 rounded-md text-xs font-bold transition cursor-pointer"
                          title="Options"
                        >
                          •••
                        </button>

                        {/* Dropdown Menu */}
                        {openActionMenuId === v.id && (
                          <div className="absolute right-3 top-10 w-44 bg-white border border-slate-200 rounded-lg shadow-xl z-20 py-1 text-left text-xs font-medium">
                            {v.status === 'Inside' && (
                              <button
                                type="button"
                                onClick={() => handleStatusUpdate(v.id, 'Checked Out')}
                                className="w-full px-3 py-1.5 hover:bg-orange-50 text-orange-700 flex items-center gap-2"
                              >
                                <LogOut className="w-3.5 h-3.5 text-orange-600" />
                                <span>Check-Out Visitor</span>
                              </button>
                            )}
                            {v.status === 'Pending' && (
                              <button
                                type="button"
                                onClick={() => handleStatusUpdate(v.id, 'Inside')}
                                className="w-full px-3 py-1.5 hover:bg-emerald-50 text-emerald-700 flex items-center gap-2"
                              >
                                <Check className="w-3.5 h-3.5 text-emerald-600" />
                                <span>Approve & Admit</span>
                              </button>
                            )}
                            <button
                              type="button"
                              onClick={() => {
                                setSelectedVisitor(v)
                                setShowPrintModal(true)
                                setOpenActionMenuId(null)
                              }}
                              className="w-full px-3 py-1.5 hover:bg-slate-50 text-slate-700 flex items-center gap-2"
                            >
                              <Printer className="w-3.5 h-3.5 text-slate-500" />
                              <span>Print Pass Badge</span>
                            </button>
                            <button
                              type="button"
                              onClick={() => handleStatusUpdate(v.id, 'Cancelled')}
                              className="w-full px-3 py-1.5 hover:bg-red-50 text-red-700 flex items-center gap-2"
                            >
                              <X className="w-3.5 h-3.5 text-red-600" />
                              <span>Cancel Pass</span>
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>

          {/* Table Footer Bar */}
          <div className="px-4 py-2.5 bg-slate-50/80 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-slate-500">
            <span className="font-medium">
              Showing <strong className="text-slate-800 font-semibold">{filteredVisitors.length}</strong> of{' '}
              <strong className="text-slate-800 font-semibold">{visitors.length}</strong> registered visitors
            </span>
            <div className="flex items-center gap-1.5 text-[11px] text-slate-400 font-medium">
              <svg className="w-3.5 h-3.5 text-slate-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
              </svg>
              <span>Scroll horizontally to view all fields</span>
            </div>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* RIGHT COLUMN: Quick Actions & Live Visitor Pass Preview (Span 3 / 12)     */}
        {/* ========================================================================= */}
        <div className="xl:col-span-3 space-y-4">
          {/* Card 1: Quick Actions */}
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
                onClick={() => setShowAddModal(true)}
                className="w-full bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-lg py-2 px-3 text-left text-xs font-bold text-slate-700 flex items-center gap-2 transition cursor-pointer"
              >
                <span className="text-emerald-700 font-black">+</span>
                <span>Register New Visitor</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  const pending = visitors.find((v) => v.status === 'Pending')
                  if (pending) {
                    handleStatusUpdate(pending.id, 'Inside')
                  } else {
                    triggerToast('No pending visitors to approve.')
                  }
                }}
                className="w-full bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-lg py-2 px-3 text-left text-xs font-bold text-slate-700 flex items-center gap-2 transition cursor-pointer"
              >
                <svg className="w-3.5 h-3.5 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span>Approve Pending Visitor</span>
              </button>

              <button
                type="button"
                onClick={() => setShowPrintModal(true)}
                className="w-full bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-lg py-2 px-3 text-left text-xs font-bold text-slate-700 flex items-center gap-2 transition cursor-pointer"
              >
                <svg className="w-3.5 h-3.5 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
                </svg>
                <span>Print Visitor Pass</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('all')}
                className="w-full bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-lg py-2 px-3 text-left text-xs font-bold text-slate-700 flex items-center gap-2 transition cursor-pointer"
              >
                <svg className="w-3.5 h-3.5 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
                <span>View Today's Visitors</span>
              </button>

              <button
                type="button"
                onClick={handleExport}
                className="w-full bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-lg py-2 px-3 text-left text-xs font-bold text-slate-700 flex items-center gap-2 transition cursor-pointer"
              >
                <svg className="w-3.5 h-3.5 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <span>Export Records</span>
              </button>
            </div>
          </div>

          {/* Card 2: Visitor Pass Preview (Official Badge Card) */}
          <div className="bg-white rounded-xl p-3 sm:p-4 shadow-xs border border-slate-200">
            <div className="flex items-center justify-between pb-2 mb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <svg className="w-4 h-4 text-slate-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V8a2 2 0 00-2-2h-5m-4 0V5a2 2 0 114 0v1m-4 0a2 2 0 104 0m-5 8a2 2 0 100-4 2 2 0 000 4zm0 0c1.306 0 2.417.835 2.83 2M9 14a3.001 3.001 0 00-2.83 2M15 11h3m-3 4h2" />
                </svg>
                <h2 className="text-xs font-bold text-slate-800">Visitor Pass Preview</h2>
              </div>
              <button
                type="button"
                onClick={() => setShowPrintModal(true)}
                className="bg-[#1F331E] hover:bg-[#2A4428] text-white text-[10px] font-bold px-2.5 py-1 rounded-md flex items-center gap-1 shadow-xs transition cursor-pointer"
              >
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
                </svg>
                <span>Print</span>
              </button>
            </div>

            {/* Official Central Warehouse Visitor Badge Card */}
            <div className="bg-white border border-slate-300 rounded-lg p-3 text-[10px] text-slate-800 font-sans shadow-xs space-y-2.5">
              {/* Header: Logo, Title & QR Code */}
              <div className="flex items-start justify-between border-b pb-2 border-slate-200">
                <div className="flex flex-col items-center text-center">
                  <img src="/logo.png" alt="Central Warehouse Emblem" className="h-11 w-auto object-contain" />
                </div>

                <div className="text-center pt-1">
                  <h3 className="text-xs font-black tracking-wider text-slate-900 font-serif">
                    VISITOR PASS
                  </h3>
                  <p className="text-[8px] font-mono text-slate-500 font-bold">
                    Pass No. {selectedVisitor.passNo}
                  </p>
                </div>

                {/* QR Code */}
                <div className="w-11 h-11 bg-white border border-slate-300 p-0.5 rounded shadow-xs">
                  <svg viewBox="0 0 100 100" className="w-full h-full text-slate-900" fill="currentColor">
                    <rect x="0" y="0" width="30" height="30" />
                    <rect x="5" y="5" width="20" height="20" fill="white" />
                    <rect x="9" y="9" width="12" height="12" />
                    
                    <rect x="70" y="0" width="30" height="30" />
                    <rect x="75" y="5" width="20" height="20" fill="white" />
                    <rect x="79" y="9" width="12" height="12" />
                    
                    <rect x="0" y="70" width="30" height="30" />
                    <rect x="5" y="75" width="20" height="20" fill="white" />
                    <rect x="9" y="79" width="12" height="12" />

                    <rect x="36" y="8" width="6" height="14" />
                    <rect x="46" y="12" width="14" height="6" />
                    <rect x="40" y="24" width="8" height="8" />
                    <rect x="54" y="26" width="8" height="8" />

                    <rect x="8" y="38" width="14" height="6" />
                    <rect x="26" y="38" width="8" height="14" />
                    <rect x="14" y="48" width="8" height="12" />

                    <rect x="74" y="38" width="8" height="14" />
                    <rect x="86" y="44" width="8" height="8" />
                    <rect x="74" y="56" width="18" height="6" />

                    <rect x="38" y="38" width="24" height="24" />
                    <rect x="42" y="42" width="16" height="16" fill="white" />
                    <rect x="46" y="46" width="8" height="8" />

                    <rect x="38" y="70" width="12" height="8" />
                    <rect x="54" y="74" width="14" height="6" />
                    <rect x="42" y="84" width="24" height="8" />
                    <rect x="72" y="72" width="8" height="18" />
                    <rect x="84" y="76" width="12" height="12" />
                  </svg>
                </div>
              </div>

              {/* Two Column details + Avatar */}
              <div className="grid grid-cols-12 gap-2 items-start">
                <div className="col-span-8 space-y-1 text-[8.5px]">
                  <p><span className="text-slate-500">Name:</span> <strong className="text-slate-900">{selectedVisitor.visitorName}</strong></p>
                  <p><span className="text-slate-500">Company:</span> <strong>{selectedVisitor.company}</strong></p>
                  <p><span className="text-slate-500">Contact:</span> <strong className="font-mono">{selectedVisitor.contactNo}</strong></p>
                  <p><span className="text-slate-500">Purpose:</span> <strong>{selectedVisitor.purpose}</strong></p>
                  <p><span className="text-slate-500">Person to Meet:</span> <strong>{selectedVisitor.personToMeet}</strong></p>
                  <p><span className="text-slate-500">Entry Time:</span> <strong>16 Sep 2026, {selectedVisitor.entryTime}</strong></p>
                  <p><span className="text-slate-500">Valid Till:</span> <strong>{selectedVisitor.validTill}</strong></p>
                </div>

                <div className="col-span-4 flex flex-col items-center text-center">
                  <div className="w-14 h-16 bg-slate-100 border border-slate-200 rounded-md flex flex-col items-center justify-center text-slate-400 p-1 shadow-xs">
                    <svg className="w-8 h-8 text-slate-300" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <span className="mt-1 inline-block px-2 py-0.5 rounded-full text-[8px] font-bold uppercase bg-emerald-100 text-emerald-800 border border-emerald-200">
                    {selectedVisitor.status}
                  </span>
                </div>
              </div>

              {/* Disclaimer */}
              <p className="text-[7px] text-slate-400 text-center italic border-t border-slate-100 pt-1.5 leading-tight">
                Please follow all security protocols.<br />
                This pass is non-transferable.
              </p>

              {/* Tricolor Tag */}
              <div className="flex flex-col items-center pt-1 border-t border-slate-100">
                <span className="text-[7px] font-extrabold text-slate-700 tracking-widest uppercase">
                  NATION FIRST | ALWAYS
                </span>
                <div className="w-12 h-1 flex rounded-xs overflow-hidden mt-0.5">
                  <div className="w-1/3 bg-[#FF9933]"></div>
                  <div className="w-1/3 bg-white border-y border-slate-200"></div>
                  <div className="w-1/3 bg-[#138808]"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* BOTTOM SECTION: 3 ANALYTICS & ACTIVITY CARDS                              */}
      {/* ========================================================================= */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Card 1: Visitor Trend (Last 7 Days) */}
        <div className="bg-white rounded-xl p-4 shadow-xs border border-slate-200">
          <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <svg className="w-4 h-4 text-slate-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z" />
              </svg>
              <h3 className="text-xs font-bold text-slate-800">Visitor Trend (Last 7 Days)</h3>
            </div>
            <div className="flex items-center gap-3 text-[10px] font-semibold text-slate-600">
              <div className="flex items-center gap-1">
                <span className="w-2.5 h-2.5 bg-emerald-700 rounded-xs"></span>
                <span>In</span>
              </div>
              <div className="flex items-center gap-1">
                <span className="w-2.5 h-2.5 bg-orange-500 rounded-xs"></span>
                <span>Out</span>
              </div>
            </div>
          </div>

          {/* Bar Chart Canvas */}
          <div className="h-40 flex items-end justify-between gap-2 pt-4 px-2">
            {[
              { day: '10 Sep', inH: '60%', outH: '45%' },
              { day: '11 Sep', inH: '50%', outH: '40%' },
              { day: '12 Sep', inH: '55%', outH: '50%' },
              { day: '13 Sep', inH: '70%', outH: '60%' },
              { day: '14 Sep', inH: '65%', outH: '55%' },
              { day: '15 Sep', inH: '85%', outH: '75%' },
              { day: '16 Sep', inH: '90%', outH: '80%' },
            ].map((bar, idx) => (
              <div key={idx} className="flex-1 flex flex-col items-center gap-1 h-full justify-end">
                <div className="w-full flex items-end justify-center gap-1 h-32">
                  <div
                    style={{ height: bar.inH }}
                    className="w-2.5 sm:w-3 bg-emerald-700 rounded-t-xs transition-all duration-300 hover:opacity-90"
                    title={`In: ${bar.inH}`}
                  ></div>
                  <div
                    style={{ height: bar.outH }}
                    className="w-2.5 sm:w-3 bg-orange-500 rounded-t-xs transition-all duration-300 hover:opacity-90"
                    title={`Out: ${bar.outH}`}
                  ></div>
                </div>
                <span className="text-[9px] font-medium text-slate-400 whitespace-nowrap">{bar.day}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Card 2: Visitor Purpose Breakdown (Donut Chart) */}
        <div className="bg-white rounded-xl p-4 shadow-xs border border-slate-200">
          <div className="flex items-center gap-2 pb-3 mb-3 border-b border-slate-100">
            <svg className="w-4 h-4 text-slate-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 3.055A9.001 9.001 0 1020.945 13H11V3.055z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20.488 9H15V3.512A9.025 9.025 0 0120.488 9z" />
            </svg>
            <h3 className="text-xs font-bold text-slate-800">Visitor Purpose Breakdown</h3>
          </div>

          <div className="flex items-center justify-between gap-3">
            {/* SVG Donut Chart */}
            <div className="relative w-28 h-28 shrink-0">
              <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                <path
                  className="text-slate-100"
                  strokeWidth="4"
                  stroke="currentColor"
                  fill="none"
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                />
                {/* Material Inspection (28%) */}
                <path
                  className="text-blue-500"
                  strokeDasharray="28, 100"
                  strokeDashoffset="0"
                  strokeWidth="4"
                  strokeLinecap="round"
                  stroke="currentColor"
                  fill="none"
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                />
                {/* Official Meeting (22%) */}
                <path
                  className="text-emerald-500"
                  strokeDasharray="22, 100"
                  strokeDashoffset="-28"
                  strokeWidth="4"
                  strokeLinecap="round"
                  stroke="currentColor"
                  fill="none"
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                />
                {/* Vendor Discussion (17%) */}
                <path
                  className="text-orange-500"
                  strokeDasharray="17, 100"
                  strokeDashoffset="-50"
                  strokeWidth="4"
                  strokeLinecap="round"
                  stroke="currentColor"
                  fill="none"
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                />
                {/* Lab Visit (11%) */}
                <path
                  className="text-amber-500"
                  strokeDasharray="11, 100"
                  strokeDashoffset="-67"
                  strokeWidth="4"
                  strokeLinecap="round"
                  stroke="currentColor"
                  fill="none"
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                />
                {/* Contract Discussion (11%) */}
                <path
                  className="text-purple-500"
                  strokeDasharray="11, 100"
                  strokeDashoffset="-78"
                  strokeWidth="4"
                  strokeLinecap="round"
                  stroke="currentColor"
                  fill="none"
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                />
                {/* Others (11%) */}
                <path
                  className="text-slate-400"
                  strokeDasharray="11, 100"
                  strokeDashoffset="-89"
                  strokeWidth="4"
                  strokeLinecap="round"
                  stroke="currentColor"
                  fill="none"
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-base font-black text-slate-800">18</span>
                <span className="text-[8px] text-slate-400 font-semibold">Total Visitors</span>
              </div>
            </div>

            {/* Legend List */}
            <div className="space-y-1 text-[10px] font-medium flex-1">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-blue-500"></span>
                  <span className="text-slate-600 truncate">Material Inspection</span>
                </div>
                <strong className="text-slate-800">28%</strong>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                  <span className="text-slate-600 truncate">Official Meeting</span>
                </div>
                <strong className="text-slate-800">22%</strong>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-orange-500"></span>
                  <span className="text-slate-600 truncate">Vendor Discussion</span>
                </div>
                <strong className="text-slate-800">17%</strong>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-amber-500"></span>
                  <span className="text-slate-600 truncate">Lab Visit</span>
                </div>
                <strong className="text-slate-800">11%</strong>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-purple-500"></span>
                  <span className="text-slate-600 truncate">Contract Discussion</span>
                </div>
                <strong className="text-slate-800">11%</strong>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-slate-400"></span>
                  <span className="text-slate-600 truncate">Others</span>
                </div>
                <strong className="text-slate-800">11%</strong>
              </div>
            </div>
          </div>
        </div>

        {/* Card 3: Recent Activities */}
        <div className="bg-white rounded-xl p-4 shadow-xs border border-slate-200">
          <div className="flex items-center gap-2 pb-3 mb-3 border-b border-slate-100">
            <svg className="w-4 h-4 text-slate-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <h3 className="text-xs font-bold text-slate-800">Recent Activities</h3>
          </div>

          <div className="space-y-2.5 text-xs">
            <div className="flex items-center gap-2.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
              <span className="font-mono text-[10px] text-slate-400">12:40 PM</span>
              <span className="text-slate-700 text-[11px] font-medium truncate">
                <strong>Riya Sharma</strong> checked in
              </span>
            </div>

            <div className="flex items-center gap-2.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
              <span className="font-mono text-[10px] text-slate-400">12:20 PM</span>
              <span className="text-slate-700 text-[11px] font-medium truncate">
                <strong>Karan Malhotra</strong> checked in
              </span>
            </div>

            <div className="flex items-center gap-2.5">
              <span className="w-2 h-2 rounded-full bg-orange-500"></span>
              <span className="font-mono text-[10px] text-slate-400">12:10 PM</span>
              <span className="text-slate-700 text-[11px] font-medium truncate">
                <strong>Vikram Jain</strong> checked out
              </span>
            </div>

            <div className="flex items-center gap-2.5">
              <span className="w-2 h-2 rounded-full bg-amber-500"></span>
              <span className="font-mono text-[10px] text-slate-400">11:45 AM</span>
              <span className="text-slate-700 text-[11px] font-medium truncate">
                <strong>Neha Gupta</strong> checked in
              </span>
            </div>

            <div className="flex items-center gap-2.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
              <span className="font-mono text-[10px] text-slate-400">11:30 AM</span>
              <span className="text-slate-700 text-[11px] font-medium truncate">
                <strong>Anil Tiwari</strong> checked in
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* REGISTER NEW VISITOR MODAL                                               */}
      {/* ========================================================================= */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-5 space-y-4">
            <div className="flex items-center justify-between border-b pb-3 border-slate-200">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-md bg-[#EBF5EA] text-[#1E3A1E] flex items-center justify-center font-black text-sm">
                  +
                </div>
                <h3 className="text-sm font-bold text-slate-800">Register New Visitor</h3>
              </div>
              <button
                type="button"
                onClick={() => setShowAddModal(false)}
                className="text-slate-400 hover:text-slate-700 p-1 font-bold"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleRegisterVisitor} className="space-y-3 text-xs">
              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">
                  Visitor Full Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Major Harish Rawat"
                  value={newVisitor.visitorName}
                  onChange={(e) => setNewVisitor({ ...newVisitor, visitorName: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs font-medium focus:outline-none focus:ring-1 focus:ring-emerald-600 focus:bg-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">
                    Company / Org <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Bharat Electronics"
                    value={newVisitor.company}
                    onChange={(e) => setNewVisitor({ ...newVisitor, company: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-emerald-600"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">
                    Contact No. <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="10-digit mobile"
                    value={newVisitor.contactNo}
                    onChange={(e) => setNewVisitor({ ...newVisitor, contactNo: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs font-mono focus:outline-none focus:ring-1 focus:ring-emerald-600"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">Purpose of Visit</label>
                  <select
                    value={newVisitor.purpose}
                    onChange={(e) => setNewVisitor({ ...newVisitor, purpose: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-emerald-600"
                  >
                    <option value="Material Inspection">Material Inspection</option>
                    <option value="Official Meeting">Official Meeting</option>
                    <option value="Vendor Discussion">Vendor Discussion</option>
                    <option value="Lab Visit">Lab Visit</option>
                    <option value="System Demo">System Demo</option>
                    <option value="Contract Discussion">Contract Discussion</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">Person to Meet</label>
                  <select
                    value={newVisitor.personToMeet}
                    onChange={(e) => setNewVisitor({ ...newVisitor, personToMeet: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-emerald-600"
                  >
                    <option value="Col. A. Sharma">Col. A. Sharma</option>
                    <option value="Maj. R. Singh">Maj. R. Singh</option>
                    <option value="Capt. P. Rana">Capt. P. Rana</option>
                    <option value="Lt. S. Chauhan">Lt. S. Chauhan</option>
                    <option value="Dr. S. Patel">Dr. S. Patel</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">ID Proof</label>
                  <select
                    value={newVisitor.idProof}
                    onChange={(e) => setNewVisitor({ ...newVisitor, idProof: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-emerald-600"
                  >
                    <option value="Aadhaar Card">Aadhaar Card</option>
                    <option value="Defence ID">Defence ID</option>
                    <option value="Corporate ID">Corporate ID</option>
                    <option value="Driving License">Driving License</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">ID Number</label>
                  <input
                    type="text"
                    placeholder="Enter ID Number"
                    value={newVisitor.idNumber}
                    onChange={(e) => setNewVisitor({ ...newVisitor, idNumber: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-emerald-600"
                  />
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 border border-slate-300 rounded-lg text-slate-700 hover:bg-slate-50 font-semibold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-[#1F331E] hover:bg-[#2A4428] text-white px-5 py-2 rounded-lg font-bold shadow-xs cursor-pointer"
                >
                  Issue Visitor Pass
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* HIGH RES PRINTABLE VISITOR BADGE MODAL                                     */}
      {/* ========================================================================= */}
      {showPrintModal && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6 space-y-4">
            <div className="flex items-center justify-between border-b pb-3 border-slate-200">
              <div className="flex items-center gap-2">
                <img src="/logo.png" alt="Central Warehouse" className="h-8 w-auto object-contain" />
                <div>
                  <h3 className="text-sm font-bold text-slate-800">Print Visitor Pass Badge</h3>
                  <p className="text-[10px] text-slate-500">Official Military Depot Entry Pass</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowPrintModal(false)}
                className="text-slate-400 hover:text-slate-700 p-1 font-bold"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Printable Pass Paper Card */}
            <div className="border-2 border-slate-800 p-5 rounded-xl bg-white space-y-3 shadow-md">
              <div className="flex items-center justify-between border-b pb-2 border-slate-300">
                <div className="flex items-center gap-2.5">
                  <img src="/logo.png" alt="Central Warehouse Emblem" className="h-14 w-auto object-contain" />
                  <div>
                    <h4 className="text-xs font-black text-slate-900 tracking-wider">CENTRAL PROVISION DEPOT</h4>
                    <p className="text-[9px] text-slate-500 font-semibold">SECURITY CONTROL OFFICE</p>
                  </div>
                </div>
                <div className="text-right">
                  <span className="inline-block bg-[#1B3518] text-white px-2.5 py-0.5 rounded text-[11px] font-mono font-bold">
                    {selectedVisitor.passNo}
                  </span>
                  <p className="text-[9px] text-slate-500 mt-0.5">{selectedVisitor.status}</p>
                </div>
              </div>

              <div className="text-center py-1 bg-slate-100 rounded">
                <h5 className="text-xs font-black tracking-widest text-slate-900 font-serif">
                  VISITOR SECURITY PASS
                </h5>
              </div>

              <div className="grid grid-cols-3 gap-2 items-center text-xs">
                <div className="col-span-2 space-y-1">
                  <p className="text-[10px] text-slate-500">Visitor Name</p>
                  <p className="text-sm font-black text-slate-900">{selectedVisitor.visitorName}</p>
                  <p className="text-[10px] text-slate-500">Organization</p>
                  <p className="font-semibold text-slate-800">{selectedVisitor.company}</p>
                  <p className="text-[10px] text-slate-500">Person to Meet</p>
                  <p className="font-semibold text-slate-800">{selectedVisitor.personToMeet}</p>
                </div>

                <div className="col-span-1 flex flex-col items-center">
                  <div className="w-16 h-20 bg-slate-100 border border-slate-300 rounded flex items-center justify-center text-slate-400">
                    <svg className="w-10 h-10 text-slate-300" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                    </svg>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 text-[10px] bg-slate-50 p-2 rounded border border-slate-200">
                <div>
                  <span className="text-slate-500">Purpose: </span>
                  <strong>{selectedVisitor.purpose}</strong>
                </div>
                <div>
                  <span className="text-slate-500">Contact: </span>
                  <strong className="font-mono">{selectedVisitor.contactNo}</strong>
                </div>
                <div>
                  <span className="text-slate-500">Entry: </span>
                  <strong>{selectedVisitor.entryTime}</strong>
                </div>
                <div>
                  <span className="text-slate-500">Valid Till: </span>
                  <strong>06:00 PM</strong>
                </div>
              </div>

              <div className="pt-2 text-center border-t border-slate-200">
                <span className="text-[8px] font-extrabold text-slate-700 tracking-widest uppercase">
                  NATION FIRST | ALWAYS
                </span>
                <div className="w-14 h-1 flex rounded-xs overflow-hidden mx-auto mt-0.5">
                  <div className="w-1/3 bg-[#FF9933]"></div>
                  <div className="w-1/3 bg-white border-y border-slate-200"></div>
                  <div className="w-1/3 bg-[#138808]"></div>
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowPrintModal(false)}
                className="px-4 py-2 border border-slate-300 rounded-lg text-xs font-semibold text-slate-700 hover:bg-slate-50"
              >
                Close
              </button>
              <button
                type="button"
                onClick={() => {
                  window.print()
                  setShowPrintModal(false)
                }}
                className="bg-[#1F331E] hover:bg-[#2A4428] text-white px-5 py-2 rounded-lg text-xs font-bold shadow flex items-center gap-2"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
                </svg>
                <span>Print Pass Badge</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
