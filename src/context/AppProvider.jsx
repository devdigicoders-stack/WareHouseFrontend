import { useState } from 'react'
import { AppContext } from './AppContext'

export function AppProvider({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(() => {
    if (typeof window !== 'undefined') {
      return window.innerWidth >= 1024
    }
    return true
  })
  const [user, setUser] = useState(() => {
    try {
      const saved = localStorage.getItem('wms_auth_user')
      if (saved) {
        const parsed = JSON.parse(saved)
        if (parsed?.name && /admin/i.test(parsed.name)) {
          parsed.name = 'Warehouse Manager'
        }
        if (parsed?.userId && /admin/i.test(parsed.userId)) {
          parsed.userId = 'WMS-MGR-001'
        }
        localStorage.setItem('wms_auth_user', JSON.stringify(parsed))
        return parsed
      }
      return null
    } catch {
      return null
    }
  })

  const toggleSidebar = () => setSidebarOpen((prev) => !prev)

  const loginUser = (userData) => {
    setUser(userData)
    try {
      localStorage.setItem('wms_auth_user', JSON.stringify(userData))
    } catch {
      // ignore
    }
  }

  const logout = () => {
    setUser(null)
    try {
      localStorage.removeItem('wms_auth_user')
    } catch {
      // ignore
    }
  }

  return (
    <AppContext.Provider value={{ sidebarOpen, setSidebarOpen, toggleSidebar, user, setUser: loginUser, logout }}>
      {children}
    </AppContext.Provider>
  )
}
