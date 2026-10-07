import { API_BASE_URL } from '../utils/constants'

export const apiRequest = async (endpoint, options = {}) => {
  try {
    const token = localStorage.getItem('wms_auth_token')
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...options.headers,
      },
      ...options,
    })
    const data = await response.json()
    if (!response.ok) throw new Error(data.message || 'Request failed')
    return data
  } catch (error) {
    console.error(`API Error on ${endpoint}:`, error)
    throw error
  }
}

// 1. Product Master
export const fetchProducts = () => apiRequest('/product')
export const createProduct = (data) => apiRequest('/product', { method: 'POST', body: JSON.stringify(data) })
export const updateProduct = (id, data) => apiRequest(`/product/${id}`, { method: 'PUT', body: JSON.stringify(data) })
export const deleteProduct = (id) => apiRequest(`/product/${id}`, { method: 'DELETE' })

// 2. Shades & Buildings
export const fetchShades = () => apiRequest('/shade')
export const createShade = (data) => apiRequest('/shade', { method: 'POST', body: JSON.stringify(data) })

// 3. Racks & Locations
export const fetchRacks = (shadeId) => apiRequest(`/rack${shadeId ? `?shadeId=${shadeId}` : ''}`)
export const createRack = (data) => apiRequest('/rack', { method: 'POST', body: JSON.stringify(data) })
export const fetchAllCells = () => apiRequest('/rack/cells/all')
export const allocateCell = (data) => apiRequest('/rack/allocate-cell', { method: 'POST', body: JSON.stringify(data) })

// 4. Gate Inward & Pass
export const fetchGateEntries = () => apiRequest('/gate-entry')
export const createGateEntry = (data) => apiRequest('/gate-entry', { method: 'POST', body: JSON.stringify(data) })
export const updateGateEntryStatus = (id, data) => apiRequest(`/gate-entry/${id}/status`, { method: 'PATCH', body: JSON.stringify(typeof data === 'string' ? { status: data } : data) })
export const markGateOut = (id) => apiRequest(`/gate-entry/${id}/gate-out`, { method: 'PATCH' })

// 5. Inward GRN
export const fetchGRNs = () => apiRequest('/grn')
export const createGRN = (data) => apiRequest('/grn', { method: 'POST', body: JSON.stringify(data) })
export const updateGRNStatus = (id, status) => apiRequest(`/grn/${id}/status`, { method: 'PATCH', body: JSON.stringify({ status }) })

// 6. Quality Control / Lab Testing
export const fetchQCs = () => apiRequest('/qc')
export const createQC = (data) => apiRequest('/qc', { method: 'POST', body: JSON.stringify(data) })
export const updateQCStatus = (id, status, remarks) => apiRequest(`/qc/${id}/status`, { method: 'PATCH', body: JSON.stringify({ status, remarks }) })

// 7. Outward Dispatches & Picklist
export const fetchDispatches = () => apiRequest('/dispatch')
export const createDispatch = (data) => apiRequest('/dispatch', { method: 'POST', body: JSON.stringify(data) })
export const updateDispatch = (id, data) => apiRequest(`/dispatch/${id}`, { method: 'PUT', body: JSON.stringify(data) })
export const deleteDispatch = (id) => apiRequest(`/dispatch/${id}`, { method: 'DELETE' })
export const updateDispatchStatus = (id, status, remarks) => apiRequest(`/dispatch/${id}/status`, { method: 'PATCH', body: JSON.stringify({ status, remarks }) })
export const verifyDispatchScan = (id, scanData) => apiRequest(`/dispatch/${id}/verify-item`, { method: 'POST', body: JSON.stringify(scanData) })

// 8. Stock Movements & Bin Relocations
export const fetchStockMovements = () => apiRequest('/stock-movement')
export const createStockMovement = (data) => apiRequest('/stock-movement', { method: 'POST', body: JSON.stringify(data) })
export const deleteStockMovement = (id) => apiRequest(`/stock-movement/${id}`, { method: 'DELETE' })

// 8. Stock Adjustments / Damage / Hold
export const fetchStockAdjustments = () => apiRequest('/stock-adjust')
export const createStockAdjustment = (data) => apiRequest('/stock-adjust', { method: 'POST', body: JSON.stringify(data) })

// 9. Partners (Suppliers & Customers)
export const fetchPartners = (type) => apiRequest(`/partners${type ? `?type=${type}` : ''}`)
export const createPartner = (data) => apiRequest('/partners', { method: 'POST', body: JSON.stringify(data) })

// 10. Analytics Summary
export const fetchAnalyticsSummary = () => apiRequest('/analytics/summary')

// 11. Gate Pass Management (Security & Outward)
export const fetchGatePasses = (params = '') => apiRequest(`/gate-pass${params}`)
export const createGatePass = (data) => apiRequest('/gate-pass', { method: 'POST', body: JSON.stringify(data) })
export const updateGatePassStatus = (id, status, remarks) => apiRequest(`/gate-pass/${id}/status`, { method: 'PATCH', body: JSON.stringify({ status, remarks }) })
export const deleteGatePass = (id) => apiRequest(`/gate-pass/${id}`, { method: 'DELETE' })

// 12. Visitor Management (Security Check-in & Passes)
export const fetchVisitors = () => apiRequest('/visitor')
export const createVisitor = (data) => apiRequest('/visitor', { method: 'POST', body: JSON.stringify(data) })
export const checkOutVisitor = (id) => apiRequest(`/visitor/${id}/checkout`, { method: 'PATCH' })
export const updateVisitorStatus = (id, status, remarks) => apiRequest(`/visitor/${id}/status`, { method: 'PATCH', body: JSON.stringify({ status, remarks }) })
export const deleteVisitor = (id) => apiRequest(`/visitor/${id}`, { method: 'DELETE' })
