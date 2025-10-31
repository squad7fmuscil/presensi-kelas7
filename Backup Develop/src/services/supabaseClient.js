// services/supabaseClient.js
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://onekgoiqgdnwjjvchqgv.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9uZWtnb2lxZ2Rud2pqdmNocWd2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTU0OTg0NzYsImV4cCI6MjA3MTA3NDQ3Nn0.u69DGjg5G6V1jr-NGo_ErvKW9ab2srzr0QD59K7FkLE'

export const supabase = createClient(supabaseUrl, supabaseKey)

// ================= AUTHENTICATION FUNCTIONS =================
export const auth = {
  // Login dengan username/password ke database teachers
  signIn: async (username, password) => {
    try {
      const { data, error } = await supabase
        .from('teachers')
        .select('*')
        .eq('username', username)
        .eq('password', password)
        .eq('active', true)
        .single()
      
      if (data && !error) {
        // Simpan user data ke localStorage
        localStorage.setItem('currentUser', JSON.stringify(data))
        return { user: data, error: null }
      }
      
      return { 
        user: null, 
        error: error?.message || 'Username atau password salah' 
      }
    } catch (err) {
      return { 
        user: null, 
        error: 'Terjadi kesalahan saat login' 
      }
    }
  },

  // Ambil user dari localStorage (synchronous)
  getCurrentUser: () => {
    try {
      const userData = localStorage.getItem('currentUser')
      return userData ? JSON.parse(userData) : null
    } catch (err) {
      console.error('Error getting current user:', err)
      return null
    }
  },

  // Check if user is authenticated
  isAuthenticated: () => {
    const user = auth.getCurrentUser()
    return user !== null && user.active === true
  },

  // Logout - hapus dari localStorage
  signOut: () => {
    try {
      localStorage.removeItem('currentUser')
      return Promise.resolve()
    } catch (err) {
      return Promise.reject(err)
    }
  },

  // Update user data in localStorage (untuk update profile, etc) dengan key 'user'
  updateCurrentUser: (userData) => {
    try {
      localStorage.setItem('user', JSON.stringify(userData)) // Pakai key 'user'
      return true
    } catch (err) {
      console.error('Error updating current user:', err)
      return false
    }
  }
}

// ================= DATABASE HELPER FUNCTIONS =================
export const db = {
  // Get all teachers
  getTeachers: async () => {
    const { data, error } = await supabase
      .from('teachers')
      .select('*')
      .eq('active', true)
      .order('name')
    
    return { data, error }
  },

  // Get all students
  getStudents: async (classFilter = null) => {
    let query = supabase
      .from('students')
      .select('*')
      .eq('active', true)
      .order('name')
    
    if (classFilter) {
      query = query.eq('class', classFilter)
    }
    
    const { data, error } = await query
    return { data, error }
  },

  // Get classes list
  getClasses: async () => {
    const { data, error } = await supabase
      .from('students')
      .select('class')
      .not('class', 'is', null)
      .eq('active', true)
    
    if (error) return { data: [], error }
    
    // Get unique classes
    const uniqueClasses = [...new Set(data.map(item => item.class))].sort()
    return { data: uniqueClasses, error: null }
  }
}

// ================= DASHBOARD STATS FUNCTIONS =================

// Untuk Admin - FIXED
export const getAdminStats = async () => {
  try {
    // Total Guru
    const { count: totalGuru } = await supabase
      .from('teachers')
      .select('*', { count: 'exact', head: true })
      .eq('active', true)

    // Total Siswa
    const { count: totalSiswa } = await supabase
      .from('students')
      .select('*', { count: 'exact', head: true })
      .eq('active', true)

    // Total Kelas (unique classes)
    const { data: kelasData } = await supabase
      .from('students')
      .select('class')
      .not('class', 'is', null)
      .eq('active', true)

    const totalKelas = kelasData ? new Set(kelasData.map(item => item.class)).size : 0

    // Tingkat Kehadiran hari ini (persentase)
    const today = new Date().toISOString().split('T')[0]
    const { count: totalHadir } = await supabase
      .from('attendance')
      .select('*', { count: 'exact', head: true })
      .eq('date', today)
      .eq('status', 'Hadir')

    const tingkatKehadiran = totalSiswa > 0 ? Math.round((totalHadir / totalSiswa) * 100) : 0

    return { 
      totalGuru: totalGuru || 0, 
      totalSiswa: totalSiswa || 0, 
      totalKelas: totalKelas || 0,
      tingkatKehadiran: tingkatKehadiran || 0
    }
  } catch (error) {
    console.error('Error getting admin stats:', error)
    return { totalGuru: 0, totalSiswa: 0, totalKelas: 0, tingkatKehadiran: 0 }
  }
}

// Untuk Wali Kelas - FIXED
export const getHomeroomStats = async (classId) => {
  try {
    // Total siswa di kelas
    const { count: totalSiswa } = await supabase
      .from('students')
      .select('*', { count: 'exact', head: true })
      .eq('class', classId)
      .eq('active', true)

    // Siswa Laki-laki (format: "L")
    const { count: siswaLaki } = await supabase
      .from('students')
      .select('*', { count: 'exact', head: true })
      .eq('class', classId)
      .eq('active', true)
      .eq('jenis_kelamin', 'L')

    // Siswa Perempuan (format: "P")
    const { count: siswaPerempuan } = await supabase
      .from('students')
      .select('*', { count: 'exact', head: true })
      .eq('class', classId)
      .eq('active', true)
      .eq('jenis_kelamin', 'P')

    // Attendance hari ini
    const today = new Date().toISOString().split('T')[0]
    const { count: hadirHariIni } = await supabase
      .from('attendance')
      .select('*', { count: 'exact', head: true })
      .eq('date', today)
      .eq('class', classId)
      .eq('status', 'Hadir')

    const { count: tidakHadir } = await supabase
      .from('attendance')
      .select('*', { count: 'exact', head: true })
      .eq('date', today)
      .eq('class', classId)
      .neq('status', 'Hadir')

    console.log('Homeroom Stats Debug:', {
      classId,
      totalSiswa,
      siswaLaki,
      siswaPerempuan,
      hadirHariIni,
      tidakHadir
    })

    return { 
      totalSiswa: totalSiswa || 0, 
      siswaLaki: siswaLaki || 0, 
      siswaPerempuan: siswaPerempuan || 0,
      hadirHariIni: hadirHariIni || 0,
      tidakHadir: tidakHadir || 0
    }
  } catch (error) {
    console.error('Error getting homeroom stats:', error)
    return { totalSiswa: 0, siswaLaki: 0, siswaPerempuan: 0, hadirHariIni: 0, tidakHadir: 0 }
  }
}

// Untuk Guru Mapel
export const getTeacherStats = async (teacherId) => {
  try {
    // Get teacher assignments (jika ada tabel teacher_assignments)
    const { data: assignments } = await supabase
      .from('teacher_assignments')
      .select('class_id')
      .eq('teacher_id', teacherId)

    let totalSiswaDiajar = 0
    let totalKelasDiajar = 0

    if (assignments && assignments.length > 0) {
      // Hitung dari assignments
      totalKelasDiajar = assignments.length
      
      for (const assignment of assignments) {
        const { count } = await supabase
          .from('students')
          .select('*', { count: 'exact', head: true })
          .eq('class', assignment.class_id)
          .eq('active', true)
        totalSiswaDiajar += count || 0
      }
    } else {
      // Fallback: estimate dari total siswa aktif (untuk guru yang mengajar semua kelas)
      const { count: totalSiswa } = await supabase
        .from('students')
        .select('*', { count: 'exact', head: true })
        .eq('active', true)
      
      const { data: classes } = await supabase
        .from('students')
        .select('class')
        .not('class', 'is', null)
        .eq('active', true)
      
      totalSiswaDiajar = totalSiswa || 0
      totalKelasDiajar = classes ? new Set(classes.map(c => c.class)).size : 0
    }

    // Kehadiran untuk mapel hari ini
    const today = new Date().toISOString().split('T')[0]
    const { count: hadirMapelHariIni } = await supabase
      .from('attendance')
      .select('*', { count: 'exact', head: true })
      .eq('date', today)
      .eq('status', 'Hadir')

    return {
      totalSiswaDiajar: totalSiswaDiajar || 0,
      totalKelasDiajar: totalKelasDiajar || 0,
      hadirMapelHariIni: hadirMapelHariIni || 0
    }
  } catch (error) {
    console.error('Error getting teacher stats:', error)
    return { totalSiswaDiajar: 0, totalKelasDiajar: 0, hadirMapelHariIni: 0 }
  }
}

// ================= ANNOUNCEMENTS FUNCTIONS =================
export const getAnnouncements = async () => {
  try {
    const { data, error } = await supabase
      .from('announcements')
      .select('id, title, content, created_at, updated_at')
      .order('created_at', { ascending: false })
      .limit(5)

    if (error && error.code === '42P01') {
      // Table doesn't exist
      console.warn('Tabel announcements belum dibuat')
      return []
    }

    if (error) {
      console.error('Error fetching announcements:', error)
      return []
    }

    return data || []
  } catch (error) {
    console.warn('Error fetching announcements:', error)
    return []
  }
}

// ================= ATTENDANCE FUNCTIONS =================
export const getTodayAttendance = async (classId = null) => {
  try {
    const today = new Date().toISOString().split('T')[0]
    let query = supabase
      .from('attendance')
      .select('*')
      .eq('date', today)

    if (classId) {
      query = query.eq('class', classId)
    }

    const { data, error } = await query
    return { data: data || [], error }
  } catch (error) {
    console.error('Error getting today attendance:', error)
    return { data: [], error }
  }
}

export const getClassStudents = async (classId) => {
  try {
    const { data, error } = await supabase
      .from('students')
      .select('*')
      .eq('class', classId)
      .eq('active', true)
      .order('name')

    return { data: data || [], error }
  } catch (error) {
    console.error('Error getting class students:', error)
    return { data: [], error }
  }
}

// ================= UTILITY FUNCTIONS =================
export const formatRole = (role) => {
  const roleMap = {
    'admin': 'Administrator',
    'teacher': 'Guru Mapel',
    'homeroom_teacher': 'Wali Kelas'
  }
  return roleMap[role] || role
}

export const formatDate = (dateString) => {
  const date = new Date(dateString)
  return date.toLocaleDateString('id-ID', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
}

export const formatTime = (dateString) => {
  const date = new Date(dateString)
  return date.toLocaleTimeString('id-ID', {
    hour: '2-digit',
    minute: '2-digit'
  })
}