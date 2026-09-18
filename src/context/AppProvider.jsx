import { useState } from 'react'
import { AppContext } from './AppContext'

export function AppProvider({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [user, setUser] = useState(() => {
    try {
      const saved = localStorage.getItem('wms_auth_user')
      return saved ? JSON.parse(saved) : null
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
