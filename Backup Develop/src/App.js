// src/App.js
import React, { useState, useEffect } from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { auth } from './services/supabaseClient'

// Import components
import Login from './pages/Login'
import Sidebar from './pages/Sidebar'
import Dashboard from './pages/Dashboard'
import DataGuru from './pages/DataGuru'
import DataSiswa from './pages/DataSiswa'
import Presensi from './pages/Presensi'
import Nilai from './pages/Nilai'
import Laporan from './pages/Laporan'

function App() {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  // Check if user is already logged in when app starts
  useEffect(() => {
    const checkAuth = () => {
      try {
        const currentUser = auth.getCurrentUser()
        if (currentUser && currentUser.active) {
          setUser(currentUser)
        } else if (currentUser && !currentUser.active) {
          // User exists but inactive, sign out
          auth.signOut()
        }
      } catch (error) {
        console.error('Error checking authentication:', error)
        // Clear any corrupted data
        auth.signOut()
      }
      setLoading(false)
    }

    checkAuth()
  }, [])

  // Handle login
  const handleLogin = (userData) => {
    setUser(userData)
  }

  // Handle logout
  const handleLogout = async () => {
    try {
      await auth.signOut()
      setUser(null)
    } catch (error) {
      console.error('Error during logout:', error)
      // Force logout even if there's an error
      setUser(null)
    }
  }

  // Show loading spinner while checking authentication
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Memuat aplikasi...</p>
        </div>
      </div>
    )
  }

  // If not logged in, show login page
  if (!user) {
    return <Login onLogin={handleLogin} />
  }

  // If logged in, show main app with sidebar
  return (
    <Router>
      <div className="flex h-screen bg-gray-100">
        {/* Sidebar */}
        <Sidebar user={user} onLogout={handleLogout} />
        
        {/* Main Content */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Header */}
          <header className="bg-white shadow-sm border-b border-gray-200 px-6 py-4">
            <div className="flex items-center justify-between">
              <h1 className="text-2xl font-semibold text-gray-800">
                Sistem Presensi & Nilai
              </h1>
              <div className="flex items-center space-x-4">
                <div className="text-right">
                  <p className="text-sm font-medium text-gray-900">{user.name}</p>
                  <p className="text-xs text-gray-500">
                    {user.role === 'admin' && 'Administrator'}
                    {user.role === 'homeroom_teacher' && `Wali Kelas ${user.homeroom_class}`}
                    {user.role === 'teacher' && `Guru ${user.subject}`}
                    {user.teacher_code && (
                      <span className="ml-1">• {user.teacher_code}</span>
                    )}
                  </p>
                </div>
                <div className="bg-blue-100 rounded-full w-10 h-10 flex items-center justify-center">
                  <span className="text-blue-600 font-medium text-sm">
                    {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
                  </span>
                </div>
              </div>
            </div>
          </header>

          {/* Page Content */}
          <main className="flex-1 overflow-y-auto p-6">
            <Routes>
              <Route path="/" element={<Navigate to="/dashboard" replace />} />
              <Route path="/dashboard" element={<Dashboard user={user} />} />
              
              {/* Admin only routes */}
              {user.role === 'admin' && (
                <>
                  <Route path="/data-guru" element={<DataGuru user={user} />} />
                  <Route path="/data-siswa" element={<DataSiswa user={user} />} />
                </>
              )}
              
              {/* Teacher and homeroom teacher routes */}
              {(user.role === 'teacher' || user.role === 'homeroom_teacher') && (
                <>
                  <Route path="/presensi" element={<Presensi user={user} />} />
                  <Route path="/nilai" element={<Nilai user={user} />} />
                </>
              )}
              
              {/* Homeroom teacher specific routes */}
              {user.role === 'homeroom_teacher' && (
                <Route path="/data-siswa" element={<DataSiswa user={user} />} />
              )}
              
              {/* Common routes for all authenticated users */}
              <Route path="/laporan" element={<Laporan user={user} />} />
              
              {/* Redirect unknown routes to dashboard */}
              <Route path="*" element={<Navigate to="/dashboard" replace />} />
            </Routes>
          </main>
        </div>
      </div>
    </Router>
  )
}

export default App