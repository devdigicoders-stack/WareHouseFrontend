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
    console.error('API Error:', error)
    throw error
  }
}
