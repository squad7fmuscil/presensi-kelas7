// Copy this content to: src/pages/Sidebar.js
import React, { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'

function Sidebar({ user, onLogout }) {
  const location = useLocation()
  const [isCollapsed, setIsCollapsed] = useState(false)
  const [isDataExpanded, setIsDataExpanded] = useState(false)

  // Function to format user role display
  const formatUserRole = (user) => {
    if (user.role === 'admin') {
      return 'Administrator'
    } else if (user.role === 'homeroom_teacher') {
      return `Walikelas ${user.class || ''} & ${user.subject || ''}`
    } else if (user.role === 'teacher') {
      return `Guru ${user.subject || ''}`
    }
    return user.role
  }

  // Main menu items
  const menuItems = [
    {
      path: '/dashboard',
      name: 'Dashboard',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2-2z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5a2 2 0 012-2h4a2 2 0 012 2v6H8V5z" />
        </svg>
      )
    },
    {
      path: 'data',
      name: 'Data',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 9a2 2 0 00-2 2v2a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 9V7a2 2 0 012-2h10a2 2 0 012 2v2" />
        </svg>
      ),
      hasSubmenu: true,
      submenu: [
        {
          path: '/data-guru',
          name: 'Data Guru',
          icon: (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
          )
        },
        {
          path: '/data-kelas',
          name: 'Data Kelas',
          icon: (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2-2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
            </svg>
          )
        },
        {
          path: '/data-siswa',
          name: 'Data Siswa',
          icon: (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
            </svg>
          )
        }
      ]
    },
    {
      path: '/presensi',
      name: 'Presensi Siswa',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
        </svg>
      )
    },
    {
      path: '/nilai',
      name: 'Nilai Siswa',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2-2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
        </svg>
      )
    },
    {
      path: '/laporan',
      name: 'Laporan',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      )
    },
    {
      path: '/easymodul',
      name: 'EasyModul',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
        </svg>
      )
    }
  ]

  // FIXED HIGHLIGHTING LOGIC
  const isActive = (path) => location.pathname === path
  
  // Check if any data submenu is active
  const isDataMenuActive = () => {
    return ['/data-guru', '/data-kelas', '/data-siswa'].includes(location.pathname)
  }

  // Check if dashboard should be highlighted (only when exactly on dashboard AND not in data submenu)
  const isDashboardActive = () => {
    return location.pathname === '/dashboard' && !isDataMenuActive()
  }

  // Universal menu highlighting function - ONE ACTIVE AT A TIME
  const isMenuActive = (menuPath) => {
    // Special case for Dashboard: only active when exactly on dashboard
    if (menuPath === '/dashboard') {
      return location.pathname === '/dashboard'
    }
    
    // Special case for Data parent menu: active when on any data submenu
    if (menuPath === 'data') {
      return isDataMenuActive()
    }
    
    // Regular menu items: exact match only
    return location.pathname === menuPath
  }

  const handleLogout = () => {
    if (window.confirm('Yakin ingin logout?')) {
      onLogout()
    }
  }

  const toggleDataMenu = () => {
    setIsDataExpanded(!isDataExpanded)
  }

  return (
    <div className={`bg-white shadow-lg h-screen flex flex-col transition-all duration-300 ${isCollapsed ? 'w-16' : 'w-64'}`}>
      {/* Sidebar Header */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          {!isCollapsed && (
            <div>
              <h2 className="text-xl font-bold text-gray-800">SMP Muslimin</h2>
              <p className="text-sm text-gray-500">Presensi App</p>
            </div>
          )}
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="p-2 rounded-lg hover:bg-gray-100 transition-colors duration-200"
          >
            <svg 
              className={`w-5 h-5 text-gray-600 transition-transform duration-200 ${isCollapsed ? 'rotate-180' : ''}`} 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 19l-7-7 7-7m8 14l-7-7 7-7" />
            </svg>
          </button>
        </div>
      </div>

      {/* User Info - Expanded State (REMOVED LOGOUT BUTTON) */}
      {!isCollapsed && (
        <div className="p-4 bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="bg-blue-500 rounded-full w-10 h-10 flex items-center justify-center">
              <span className="text-white font-medium text-sm">
                {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-base font-medium text-gray-900 truncate">{user.name}</p>
              <p className="text-sm text-blue-600 truncate">{formatUserRole(user)}</p>
            </div>
          </div>
        </div>
      )}

      {/* Navigation Menu */}
      <nav className="flex-1 overflow-y-auto mt-4 px-2">
        <ul className="space-y-1">
          {menuItems.map((item) => (
            <li key={item.path}>
              {item.hasSubmenu ? (
                // Data menu with submenu - FIXED HIGHLIGHTING
                <>
                  <button
                    onClick={toggleDataMenu}
                    className={`w-full flex items-center justify-between px-3 py-3 rounded-lg transition-all duration-200 text-base font-medium ${
                      isDataMenuActive()
                        ? 'bg-blue-500 text-white shadow-md'
                        : 'text-gray-700 hover:bg-blue-50 hover:text-blue-600'
                    }`}
                    title={isCollapsed ? item.name : ''}
                  >
                    <div className="flex items-center">
                      <span className={`${isDataMenuActive() ? 'text-white' : ''}`}>
                        {item.icon}
                      </span>
                      {!isCollapsed && (
                        <span className="ml-3">{item.name}</span>
                      )}
                    </div>
                    {!isCollapsed && (
                      <svg 
                        className={`w-5 h-5 transition-transform duration-200 ${isDataExpanded ? 'rotate-180' : ''}`}
                        fill="none" 
                        stroke="currentColor" 
                        viewBox="0 0 24 24"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    )}
                  </button>
                  
                  {/* Submenu */}
                  {!isCollapsed && isDataExpanded && (
                    <ul className="mt-1 ml-4 space-y-1">
                      {item.submenu.map((subItem) => (
                        <li key={subItem.path}>
                          <Link
                            to={subItem.path}
                            className={`flex items-center px-3 py-2 rounded-lg transition-all duration-200 text-base ${
                              isActive(subItem.path)
                                ? 'bg-blue-500 text-white shadow-md'
                                : 'text-gray-600 hover:bg-blue-50 hover:text-blue-600'
                            }`}
                          >
                            <span className={`${isActive(subItem.path) ? 'text-white' : ''}`}>
                              {subItem.icon}
                            </span>
                            <span className="ml-3">{subItem.name}</span>
                          </Link>
                        </li>
                      ))}
                    </ul>
                  )}
                </>
              ) : (
                // Regular menu items - UNIVERSAL HIGHLIGHTING LOGIC
                <Link
                  to={item.path}
                  className={`flex items-center px-3 py-3 rounded-lg transition-all duration-200 text-base font-medium ${
                    isMenuActive(item.path)
                      ? 'bg-blue-500 text-white shadow-md'
                      : 'text-gray-700 hover:bg-blue-50 hover:text-blue-600'
                  }`}
                  title={isCollapsed ? item.name : ''}
                >
                  <span className={`${isMenuActive(item.path) ? 'text-white' : ''}`}>
                    {item.icon}
                  </span>
                  {!isCollapsed && (
                    <span className="ml-3">{item.name}</span>
                  )}
                </Link>
              )}
            </li>
          ))}
        </ul>
      </nav>

      {/* Logout Button - Bottom Fixed (ENHANCED STYLING) */}
      <div className="p-3 border-t border-gray-200 bg-white">
        {!isCollapsed ? (
          <button
            onClick={handleLogout}
            className="w-full flex items-center px-3 py-3 rounded-lg text-red-600 hover:bg-red-50 hover:text-red-700 transition-all duration-200 font-bold text-base group"
          >
            <svg className="w-5 h-5 group-hover:scale-110 transition-transform duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
            <span className="ml-3">Logout</span>
          </button>
        ) : (
          <div className="flex flex-col items-center space-y-2">
            <div className="bg-blue-500 rounded-full w-8 h-8 flex items-center justify-center">
              <span className="text-white font-medium text-xs">
                {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
              </span>
            </div>
            <button
              onClick={handleLogout}
              className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors duration-200 group"
              title="Logout"
            >
              <svg className="w-5 h-5 group-hover:scale-110 transition-transform duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

export default Sidebar