// pages/Dashboard.js
import React, { useState, useEffect } from 'react'
import { 
  getAdminStats, 
  getHomeroomStats, 
  getTeacherStats,
  getAnnouncements 
} from '../services/supabaseClient'

function Dashboard({ user }) {
  const [currentTime, setCurrentTime] = useState(new Date())
  const [stats, setStats] = useState({})
  const [announcements, setAnnouncements] = useState([])
  const [loading, setLoading] = useState(true)

  // Update time setiap detik
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date())
    }, 1000)
    return () => clearInterval(timer)
  }, [])

  // Fetch data dari Supabase
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true)
      try {
        let statsData = {}
        
        // Fetch stats berdasarkan role
        if (user.role === 'admin') {
          statsData = await getAdminStats()
        } else if (user.role === 'homeroom_teacher') {
          statsData = await getHomeroomStats(user.homeroom_class)
        } else if (user.role === 'teacher') {
          statsData = await getTeacherStats(user.id)
        }

        // Fetch pengumuman
        const announcementsData = await getAnnouncements()

        setStats(statsData)
        setAnnouncements(announcementsData)
      } catch (error) {
        console.error('Error fetching data:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [user])

  // Function to format user role display  
  const formatUserRole = (user) => {
    if (user.role === 'admin') {
      return 'Administrator Sistem Sekolah Digital'
    } else if (user.role === 'homeroom_teacher') {
      return `Walikelas ${user.homeroom_class || user.class} & Guru ${user.subject}`
    } else if (user.role === 'teacher') {
      return `Guru ${user.subject}`
    }
    return 'Sistem Sekolah Digital'
  }

  // Format hari dalam bahasa Indonesia
  const formatDay = (date) => {
    const days = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu']
    return days[date.getDay()]
  }

  // Format tanggal dalam bahasa Indonesia
  const formatDate = (date) => {
    const months = [
      'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
      'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
    ]
    const day = date.getDate()
    const month = months[date.getMonth()]
    const year = date.getFullYear()
    return `${day} ${month} ${year}`
  }

  // Format jam
  const formatTime = (date) => {
    return date.toLocaleTimeString('id-ID', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    })
  }

  // Format combined date time for single line
  const formatDateTime = (date) => {
    const dayName = formatDay(date)
    const dateStr = formatDate(date)
    return `${dayName}, ${dateStr}`
  }

  // Render stats cards berdasarkan role
  const renderStatsCards = () => {
    if (loading) {
      return (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map((item) => (
            <div key={item} className="bg-white rounded-lg shadow p-6 animate-pulse">
              <div className="flex items-center">
                <div className="bg-gray-200 rounded-lg p-3">
                  <div className="w-6 h-6"></div>
                </div>
                <div className="ml-4">
                  <div className="h-4 bg-gray-200 rounded w-20 mb-2"></div>
                  <div className="h-8 bg-gray-200 rounded w-12"></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )
    }

    if (user.role === 'admin') {
      return (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="bg-blue-100 rounded-lg p-3">
                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm text-gray-600">Total Guru</p>
                <p className="text-2xl font-semibold text-gray-900">{stats.totalGuru || 0}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="bg-green-100 rounded-lg p-3">
                <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 9a2 2 0 00-2 2v2a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm text-gray-600">Total Kelas</p>
                <p className="text-2xl font-semibold text-gray-900">{stats.totalKelas || 0}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="bg-purple-100 rounded-lg p-3">
                <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm text-gray-600">Total Siswa</p>
                <p className="text-2xl font-semibold text-gray-900">{stats.totalSiswa || 0}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="bg-orange-100 rounded-lg p-3">
                <svg className="w-6 h-6 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm text-gray-600">Tingkat Kehadiran</p>
                <p className="text-2xl font-semibold text-gray-900">{stats.tingkatKehadiran || 0}%</p>
              </div>
            </div>
          </div>
        </div>
      )
    }

    if (user.role === 'homeroom_teacher') {
      return (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="bg-blue-100 rounded-lg p-3">
                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm text-gray-600">Siswa Kelas {user.homeroom_class || user.class}</p>
                <p className="text-2xl font-semibold text-gray-900">{stats.totalSiswa || 0}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="bg-green-100 rounded-lg p-3">
                <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm text-gray-600">Laki-Laki / Perempuan</p>
                <p className="text-2xl font-semibold text-gray-900">
                  {stats.siswaLaki || 0} / {stats.siswaPerempuan || 0}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="bg-purple-100 rounded-lg p-3">
                <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm text-gray-600">Hadir Hari Ini</p>
                <p className="text-2xl font-semibold text-gray-900">{stats.hadirHariIni || 0}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="bg-red-100 rounded-lg p-3">
                <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 15.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm text-gray-600">Tidak Hadir</p>
                <p className="text-2xl font-semibold text-gray-900">{stats.tidakHadir || 0}</p>
              </div>
            </div>
          </div>
        </div>
      )
    }

    if (user.role === 'teacher') {
      return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="bg-blue-100 rounded-lg p-3">
                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm text-gray-600">Total Siswa Diajar</p>
                <p className="text-2xl font-semibold text-gray-900">{stats.totalSiswaDiajar || 0}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="bg-green-100 rounded-lg p-3">
                <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 9a2 2 0 00-2 2v2a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm text-gray-600">Total Kelas Diajar</p>
                <p className="text-2xl font-semibold text-gray-900">{stats.totalKelasDiajar || 0}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="bg-orange-100 rounded-lg p-3">
                <svg className="w-6 h-6 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm text-gray-600">Hadir Mapel Hari Ini</p>
                <p className="text-2xl font-semibold text-gray-900">{stats.hadirMapelHariIni || 0}</p>
              </div>
            </div>
          </div>
        </div>
      )
    }
  }

  // Render quick actions berdasarkan role
  const renderQuickActions = () => {
    const actions = []

    if (user.role === 'admin') {
      actions.push(
        { label: 'Kelola Data Guru', color: 'blue', path: '/data-guru' },
        { label: 'Kelola Kelas', color: 'green', path: '/data-kelas' },
        { label: 'Kelola Siswa', color: 'purple', path: '/data-siswa' },
        { label: 'Laporan Lengkap', color: 'orange', path: '/laporan' }
      )
    } else if (user.role === 'homeroom_teacher') {
      actions.push(
        { label: `Presensi Kelas ${user.homeroom_class || user.class}`, color: 'blue', path: '/presensi' },
        { label: `Input Nilai ${user.subject}`, color: 'green', path: '/nilai' },
        { label: `Data Siswa ${user.homeroom_class || user.class}`, color: 'purple', path: '/data-siswa' },
        { label: `Laporan Kelas ${user.homeroom_class || user.class}`, color: 'orange', path: '/laporan' }
      )
    } else if (user.role === 'teacher') {
      actions.push(
        { label: `Presensi ${user.subject}`, color: 'blue', path: '/presensi' },
        { label: `Input Nilai ${user.subject}`, color: 'green', path: '/nilai' },
        { label: 'EasyModul', color: 'orange', path: '/easymodul' }
      )
    }

    return (
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Aksi Cepat</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {actions.map((action, index) => (
            <button
              key={index}
              className={`bg-${action.color}-50 hover:bg-${action.color}-100 text-${action.color}-700 font-medium py-3 px-4 rounded-lg transition-colors`}
              onClick={() => window.location.href = action.path}
            >
              {action.label}
            </button>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Welcome Section with Real-time Clock - WIDER LAYOUT */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <h2 className="text-2xl font-bold text-gray-800 mb-2">
              Selamat Datang, {user.name}!
            </h2>
            <p className="text-gray-600 text-lg">
              {formatUserRole(user)}
            </p>
          </div>
          
          {/* Real-time Clock & Date - WIDER CARD */}
          <div className="ml-8">
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-6 border border-blue-100 min-w-0">
              <div className="text-center">
                <div className="text-3xl font-bold text-blue-600 font-mono mb-2">
                  {formatTime(currentTime)}
                </div>
                <div className="text-base text-gray-700 font-medium">
                  {formatDateTime(currentTime)}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      {renderStatsCards()}

      {/* Quick Actions */}
      {renderQuickActions()}

      {/* Pengumuman Terkini */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Pengumuman Terkini</h3>
        <div className="space-y-3">
          {loading ? (
            <div className="animate-pulse space-y-3">
              <div className="border-l-4 border-gray-200 pl-4 py-2 bg-gray-50 rounded-r-lg">
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-1/2"></div>
              </div>
            </div>
          ) : announcements && announcements.length > 0 ? (
            announcements.map((announcement) => (
              <div
                key={announcement.id}
                className="border-l-4 border-blue-500 pl-4 py-2 bg-blue-50 rounded-r-lg"
              >
                {announcement.title && (
                  <h4 className="text-sm font-medium text-blue-800 mb-1">
                    {announcement.title}
                  </h4>
                )}
                
                <p className="text-sm text-blue-700">
                  {announcement.content}
                </p>
              </div>
            ))
          ) : (
            <div className="text-center py-8">
              <div className="text-gray-400 mb-2">
                <svg className="w-12 h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z" />
                </svg>
              </div>
              <p className="text-gray-500 text-sm">Belum ada pengumuman</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default Dashboard