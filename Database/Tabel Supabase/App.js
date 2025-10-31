import React, { useState, useEffect } from 'react';
import './App.css';
import { supabase } from './supabaseClient';

function App() {
  const [currentPage, setCurrentPage] = useState('login');
  const [loggedUser, setLoggedUser] = useState(null);
  const [currentClass, setCurrentClass] = useState('7A');
  const [studentsData, setStudentsData] = useState({});
  const [attendanceDate, setAttendanceDate] = useState(new Date().toISOString().split('T')[0]);
  const [isLoading, setIsLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState('Memuat sistem...');
  const [notification, setNotification] = useState({ show: false, message: '', type: 'success' });
  const [attendanceStats, setAttendanceStats] = useState({ hadir: 0, sakit: 0, izin: 0, alpha: 0 });
  const [studentDataStats, setStudentDataStats] = useState({ total: 0, laki: 0, perempuan: 0, aktif: 0 });
  const [currentAttendance, setCurrentAttendance] = useState({});
  const [classTabs, setClassTabs] = useState([]);
  const [currentTime, setCurrentTime] = useState('');
  const [currentDate, setCurrentDate] = useState('');

  // Global cache
  const cache = {
    attendance: new Map(),
    lastUpdate: null,
    expires: 5 * 60 * 1000
  };

  // Helper untuk caching
  const getCacheKey = (date, className) => {
    return `${date}_${className}`;
  };

  const isCacheValid = () => {
    return cache.lastUpdate && (Date.now() - cache.lastUpdate) < cache.expires;
  };

  const clearCache = () => {
    cache.attendance.clear();
    cache.lastUpdate = null;
  };

  // Show loading
  const showLoading = (message = 'Memuat sistem...') => {
    setLoadingMessage(message);
    setIsLoading(true);
  };

  // Hide loading
  const hideLoading = () => {
    setIsLoading(false);
  };

  // Show notification
  const showNotification = (message, type = 'success') => {
    setNotification({ show: true, message, type });
    
    setTimeout(() => {
      setNotification({ show: false, message: '', type: 'success' });
    }, 4000);
  };

  // Live Clock Function - Diperbaiki untuk React
  const updateLiveClock = () => {
    const now = new Date();
    
    const timeString = now.toLocaleTimeString('id-ID', {
      hour12: false,
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
    
    const dateString = now.toLocaleDateString('id-ID', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
    
    setCurrentTime(timeString);
    setCurrentDate(dateString);
  };

  // Password toggle function - Diperbaiki untuk React
  const togglePassword = () => {
    const passwordField = document.getElementById('password');
    if (passwordField) {
      const toggleBtn = document.querySelector('.password-toggle');
      if (passwordField.type === 'password') {
        passwordField.type = 'text';
        if (toggleBtn) toggleBtn.textContent = '🙈';
      } else {
        passwordField.type = 'password';
        if (toggleBtn) toggleBtn.textContent = '👁️';
      }
    }
  };

  // Login with Supabase
  const loginWithSupabase = async (username, password) => {
    try {
      const { data: teachers, error } = await supabase
        .from('teachers')
        .select('*')
        .eq('username', username.toLowerCase())
        .eq('active', true)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          throw new Error('Username tidak ditemukan atau tidak aktif!');
        }
        throw new Error('Error saat login: ' + error.message);
      }

      // Check password
      if (password !== teachers.password) {
        throw new Error('Password salah!');
      }

      return teachers;
    } catch (error) {
      throw error;
    }
  };

  // Load students data
  const loadStudentsData = async () => {
    try {
      console.log('🔄 Loading students data...');

      // First try the original column names
      let { data: students, error } = await supabase
        .from('students')
        .select('*')
        .eq('active', true)
        .order('class', { ascending: true })
        .order('name', { ascending: true });

      // If no data found, try alternative column names
      if ((error || !students || students.length === 0)) {
        console.log('Trying alternative column names...');

        // Try with different column name variations
        const { data: studentsAlt, error: errorAlt } = await supabase
          .from('students')
          .select('*')
          .eq('status', 'active')
          .order('kelas', { ascending: true })
          .order('nama', { ascending: true });

        if (studentsAlt && studentsAlt.length > 0) {
          students = studentsAlt;
          error = null;
          console.log('✅ Found students with alternative column names');
        }
      }

      if (error) {
        console.error('❌ Supabase error:', error);
        throw new Error('Error loading students: ' + error.message);
      }

      console.log('✅ Students loaded:', students);

      // Cek structure data
      if (students.length === 0) {
        console.warn('⚠️ No students found in database');
        // Create sample data for testing
        students = createSampleStudents();
      }

      // Group students by class
      const groupedStudents = {};
      students.forEach(student => {
        // Handle different column name possibilities
        const classValue = student.class || student.kelas || '7A';
        const nameValue = student.name || student.nama || 'Siswa';
        const idValue = student.student_id || student.id || Math.random().toString(36).substr(2, 9);
        const genderValue = student.gender || student.jenis_kelamin || 'L';
        const activeValue = student.active !== undefined ? student.active : true;

        if (!groupedStudents[classValue]) {
          groupedStudents[classValue] = [];
        }

        groupedStudents[classValue].push({
          student_id: idValue,
          name: nameValue,
          class: classValue,
          gender: genderValue,
          active: activeValue
        });
      });

      console.log('📊 Grouped by class:', groupedStudents);
      setStudentsData(groupedStudents);
      return groupedStudents;

    } catch (error) {
      console.error('❌ Error loading students:', error);
      // Create sample data for demo purposes
      const sampleData = createSampleStudentsData();
      setStudentsData(sampleData);
      showNotification('Menggunakan data demo. ' + error.message, 'info');
      return sampleData;
    }
  };

  // Create sample students data for demo
  const createSampleStudentsData = () => {
    const classes = ['7A', '7B', '7C', '7D', '7E', '7F'];
    const groupedStudents = {};

    classes.forEach(className => {
      groupedStudents[className] = [];
      for (let i = 1; i <= 10; i++) {
        groupedStudents[className].push({
          student_id: 'SMP' + className + i.toString().padStart(2, '0'),
          name: 'Siswa ' + i + ' Kelas ' + className,
          class: className,
          gender: i % 2 === 0 ? 'P' : 'L',
          active: true
        });
      }
    });

    return groupedStudents;
  };

  // Create sample students
  const createSampleStudents = () => {
    const students = [];
    const classes = ['7A', '7B', '7C', '7D', '7E', '7F'];
    
    classes.forEach(className => {
      for (let i = 1; i <= 10; i++) {
        students.push({
          student_id: 'SMP' + className + i.toString().padStart(2, '0'),
          name: 'Siswa ' + i + ' Kelas ' + className,
          class: className,
          gender: i % 2 === 0 ? 'P' : 'L',
          active: true
        });
      }
    });
    
    return students;
  };

  // Get class attendance stats
  const getClassAttendanceStats = async (className, date) => {
    try {
      const classStudents = studentsData[className];
      if (!classStudents) return { total: 0, hadir: 0, sakit: 0, izin: 0, alpa: 0 };

      const studentIds = classStudents.map(s => s.student_id);

      const { data: attendance, error } = await supabase
        .from('attendance')
        .select('status')
        .eq('date', date)
        .in('student_id', studentIds);

      if (error) throw error;

      const stats = { 
        total: classStudents.length,
        hadir: 0,
        sakit: 0,
        izin: 0,
        alpa: 0
      };

      if (attendance) {
        attendance.forEach(record => {
          if (record.status === 'hadir') stats.hadir++;
          else if (record.status === 'sakit') stats.sakit++;
          else if (record.status === 'izin') stats.izin++;
          else if (record.status === 'alpa') stats.alpa++;
        });
      }

      // Siswa tanpa record dianggap alpa
      stats.alpa += stats.total - (stats.hadir + stats.sakit + stats.izin + stats.alpa);

      return stats;
    } catch (error) {
      return { total: 0, hadir: 0 };
    }
  };

  // Load attendance from Supabase
  const loadAttendanceFromSupabase = async (date, className) => {
    try {
      if (!date || !className) {
        console.warn('Date or className not provided');
        return {};
      }

      // Get teacher ID
      const { data: teacher } = await supabase
        .from('teachers')
        .select('id')
        .eq('username', loggedUser.username)
        .single();

      if (!teacher) {
        throw new Error('Teacher tidak ditemukan');
      }

      // Get students for this class
      const students = studentsData[className];
      if (!students) {
        throw new Error('Data siswa tidak ditemukan untuk kelas ' + className);
      }

      const studentIds = students.map(s => s.student_id);

      // Get attendance data for this date and students
      const { data: attendanceRecords, error } = await supabase
        .from('attendance')
        .select('student_id, status')
        .eq('date', date)
        .eq('recorded_by', teacher.id)
        .in('student_id', studentIds);

      if (error) {
        console.error('Error loading attendance:', error);
        throw error;
      }

      // Convert to index-based object for compatibility with existing code
      const attendanceData = {};

      if (attendanceRecords && attendanceRecords.length > 0) {
        students.forEach((student, index) => {
          const record = attendanceRecords.find(r => r.student_id === student.student_id);
          if (record) {
            // Convert database status to JavaScript status
            let status = 'present'; // default
            switch (record.status) {
              case 'hadir':
                status = 'present';
                break;
              case 'sakit':
                status = 'sick';
                break;
              case 'izin':
                status = 'permit';
                break;
              case 'alpa':
                status = 'absent';
                break;
              default:
                status = 'present';
            }
            attendanceData[index] = status;
          } else {
            // Default to present if no record found
            attendanceData[index] = 'present';
          }
        });
      } else {
        // No attendance records found, default all to present
        students.forEach((student, index) => {
          attendanceData[index] = 'present';
        });
      }

      console.log('Attendance data loaded for', className, date, attendanceData);
      return attendanceData;

    } catch (error) {
      console.error('Error in loadAttendanceFromSupabase:', error);

      // Return empty object if error, will default to 'present' status
      const students = studentsData[className] || [];
      const fallbackData = {};
      students.forEach((student, index) => {
        fallbackData[index] = 'present';
      });

      return fallbackData;
    }
  };

  // Save attendance to Supabase
  const saveAttendanceToSupabase = async (attendanceData) => {
    try {
      const date = attendanceDate;
      const records = [];

      // Get teacher ID
      const { data: teacher } = await supabase
        .from('teachers')
        .select('id')
        .eq('username', loggedUser.username)
        .single();

      // Status mapping dari JavaScript ke database
      const statusMapping = {
        'present': 'hadir',
        'sick': 'sakit',
        'permit': 'izin',
        'absent': 'alpa'
      };

      // Prepare records for batch insert
      Object.entries(attendanceData).forEach(([studentIndex, jsStatus]) => {
        const student = studentsData[currentClass][studentIndex];
        if (student) {
          // Convert status dari JavaScript ke format database
          const dbStatus = statusMapping[jsStatus] || 'hadir';

          // Get notes dari input field
          const notesInput = document.getElementById(`notes_${studentIndex}`);
          const notes = notesInput ? notesInput.value.trim() : '';

          records.push({
            student_id: student.student_id,
            name: student.name,
            date: date,
            class: currentClass,
            status: dbStatus,
            session: 'daily',
            recorded_by: teacher.id,
            notes: notes || null
          });
        }
      });

      // Delete existing records for this date/class/teacher
      await supabase
        .from('attendance')
        .delete()
        .eq('date', date)
        .eq('recorded_by', teacher.id)
        .in('student_id', records.map(r => r.student_id));

      // Insert new records
      const { error } = await supabase
        .from('attendance')
        .insert(records);

      if (error) {
        throw new Error('Gagal menyimpan presensi: ' + error.message);
      }

      return true;

    } catch (error) {
      console.error('Error saving attendance:', error);
      throw error;
    }
  };

  // Update dashboard statistics
  const updateDashboardStats = async () => {
    try {
      // Count total students
      const totalStudents = Object.values(studentsData).reduce((sum, students) => sum + students.length, 0);

      // Get today's attendance statistics
      const today = new Date().toISOString().split('T')[0];
      const todayAttendance = await getClassAttendanceStats(currentClass, today);

      if (todayAttendance && todayAttendance.total > 0) {
        const percentage = Math.round((todayAttendance.hadir / todayAttendance.total) * 100);
        
        // Update stats for dashboard
        setAttendanceStats({
          hadir: todayAttendance.hadir,
          sakit: todayAttendance.sakit,
          izin: todayAttendance.izin,
          alpha: todayAttendance.alpa
        });
      }

    } catch (error) {
      console.error('Error updating dashboard stats:', error);
    }
  };

  // Initialize Presensi Module
  const initializePresensi = async () => {
    if (loggedUser) {
      await loadStudentsData();
      generateClassTabs();
      loadAttendanceData();
    }
  };

  // Generate class tabs
  const generateClassTabs = () => {
    const classes = Object.keys(studentsData).sort();
    setClassTabs(classes);
  };

  // Class switching function
  const switchClass = async (className) => {
    setCurrentClass(className);
    showLoading();
    await loadAttendanceData();
    hideLoading();
  };

  // Load attendance data
  const loadAttendanceData = async () => {
    try {
      const date = attendanceDate;
      const attendanceData = await loadAttendanceFromSupabase(date, currentClass);
      setCurrentAttendance(attendanceData);
      updateStatistics(attendanceData);
    } catch (error) {
      showNotification('Gagal memuat data presensi: ' + error.message, 'error');
    }
  };

  // Update statistics
  const updateStatistics = (attendanceData) => {
    let hadir = 0, alpha = 0, sakit = 0, izin = 0;

    Object.values(attendanceData).forEach(status => {
      if (status === 'present') hadir++;
      else if (status === 'absent') alpha++;
      else if (status === 'sick') sakit++;
      else if (status === 'permit') izin++;
    });

    setAttendanceStats({ hadir, sakit, izin, alpha });
  };

  // Set attendance status
  const setStatus = (studentIndex, status) => {
    const newAttendance = { ...currentAttendance, [studentIndex]: status };
    setCurrentAttendance(newAttendance);
    updateStatistics(newAttendance);
    showNotification('Status diubah', 'info');
  };

  // Mark all present
  const markAllPresent = () => {
    showLoading();
    setTimeout(() => {
      const newAttendance = {};
      const students = studentsData[currentClass] || [];
      
      students.forEach((_, index) => {
        newAttendance[index] = 'present';
      });
      
      setCurrentAttendance(newAttendance);
      updateStatistics(newAttendance);
      hideLoading();
      showNotification('Semua siswa ditandai hadir!');
    }, 500);
  };

  // Save attendance
  const saveAttendance = async () => {
    const date = attendanceDate;
    if (!date) {
      showNotification('Pilih tanggal terlebih dahulu!', 'error');
      return;
    }

    // Validasi tanggal tidak lebih dari hari ini
    const today = new Date();
    today.setHours(23, 59, 59, 999);
    const selectedDate = new Date(date);
    if (selectedDate > today) {
      showNotification('Tidak dapat mengisi presensi untuk tanggal yang akan datang!', 'error');
      return;
    }

    showLoading();
    try {
      await saveAttendanceToSupabase(currentAttendance);
      hideLoading();
      showNotification(`Data presensi kelas ${currentClass} tanggal ${formatDate(date)} berhasil disimpan!`);
      updateDashboardStats();
    } catch (error) {
      hideLoading();
      showNotification('Gagal menyimpan data: ' + error.message, 'error');
    }
  };

  // Format date
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const options = {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    };
    return date.toLocaleDateString('id-ID', options);
  };

  // Initialize Data Siswa Module
  const initializeDataSiswa = async () => {
    if (loggedUser) {
      await loadStudentsData();
      generateDataSiswaClassTabs();
      updateDataSiswaStats();
    }
  };

  // Generate class tabs for Data Siswa
  const generateDataSiswaClassTabs = () => {
    const classes = Object.keys(studentsData).sort();
    setClassTabs(classes);
  };

  // Update Data Siswa statistics
  const updateDataSiswaStats = () => {
    const students = studentsData[currentClass] || [];
    
    setStudentDataStats({
      total: students.length,
      laki: students.filter(s => s.gender === 'L').length,
      perempuan: students.filter(s => s.gender === 'P').length,
      aktif: students.filter(s => s.active).length
    });
  };

  // View Student Detail
  const viewStudentDetail = (studentIndex) => {
    const student = studentsData[currentClass][studentIndex];
    if (student) {
      showNotification(`Detail siswa: ${student.name} (ID: ${student.student_id})`, 'info');
    } else {
      showNotification('Data siswa tidak ditemukan', 'error');
    }
  };

  // Fungsi untuk menangani login
  const handleLogin = async (username, password) => {
    showLoading('Sedang masuk...');
    
    try {
      const teacher = await loginWithSupabase(username, password);
      setLoggedUser(teacher);

      showNotification(`Selamat datang ${teacher.name}!`, 'success');

      setTimeout(async () => {
        setCurrentPage('dashboard');

        // Load initial data
        await loadStudentsData();
        await updateDashboardStats();

        hideLoading();
      }, 1500);

    } catch (error) {
      console.error('Login error:', error);
      showNotification(error.message, 'error');
      hideLoading();
    }
  };

  // Fungsi untuk menangani logout
  const handleLogout = () => {
    setLoggedUser(null);
    setCurrentPage('login');
    setStudentsData({});
    setCurrentAttendance({});
    setAttendanceStats({ hadir: 0, sakit: 0, izin: 0, alpha: 0 });
  };

  // Fungsi untuk beralih halaman
  const navigateTo = (page) => {
    setCurrentPage(page);
    
    if (page === 'presensi') {
      initializePresensi();
    } else if (page === 'data-siswa') {
      initializeDataSiswa();
    }
  };

  // Effect untuk mengupdate jam live
  useEffect(() => {
    updateLiveClock();
    const timer = setInterval(updateLiveClock, 1000);
    
    return () => clearInterval(timer);
  }, []);

  // Effect untuk update class tabs ketika studentsData berubah
  useEffect(() => {
    if (Object.keys(studentsData).length > 0) {
      generateClassTabs();
    }
  }, [studentsData]);

  // Effect untuk update data siswa stats ketika currentClass berubah
  useEffect(() => {
    if (currentPage === 'data-siswa') {
      updateDataSiswaStats();
    }
  }, [currentClass, currentPage]);

  return (
    <div className="App">
      {/* Loading Overlay */}
      {isLoading && (
        <div id="loadingOverlay" className="loading-overlay">
          <div>
            <div className="loading-spinner"></div>
            <div className="loading-text">{loadingMessage}</div>
          </div>
        </div>
      )}

      {/* Notification Toast */}
      {notification.show && (
        <div id="notificationToast" className={`notification-toast ${notification.type}`}>
          <span className="toast-icon">
            {notification.type === 'success' ? '✅' : 
             notification.type === 'error' ? '❌' : 'ℹ️'}
          </span>
          <span id="toastMessage">{notification.message}</span>
        </div>
      )}

      {/* Login Page */}
      {currentPage === 'login' && (
        <div className="login-container">
          <div className="login-box">
            <div className="login-header">
              <div className="school-logo">🏫</div>
              <h1>SMP MUSLIMIN CILILIN</h1>
              <p>SISTEM ADMINISTRASI DIGITAL</p>
            </div>
            <form onSubmit={(e) => {
              e.preventDefault();
              handleLogin(e.target.username.value, e.target.password.value);
            }}>
              <div className="form-group">
                <label htmlFor="username">Username</label>
                <input type="text" id="username" placeholder="Masukkan username" required />
              </div>

              <div className="form-group">
                <label htmlFor="password">Password</label>
                <div className="password-field">
                  <input type="password" id="password" placeholder="Masukkan password" required />
                  <button type="button" className="password-toggle" onClick={togglePassword}>👁️</button>
                </div>
              </div>

              <button type="submit" className="login-btn" id="loginButton">
                LOGIN
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Dashboard Page */}
      {currentPage !== 'login' && (
        <div className="dashboard-container">
          <button className="mobile-menu-toggle" id="mobileMenuToggle" onClick={() => {
            document.getElementById('sidebar').classList.toggle('mobile-visible');
          }}>☰</button>

          <div className="sidebar" id="sidebar">
            <div className="sidebar-header">
              <h2>📚 Administrasi Sekolah</h2>
              <p>Management System</p>
            </div>
            <nav className="sidebar-menu">
              <a href="#" className={`menu-item ${currentPage === 'dashboard' ? 'active' : ''}`} 
                 onClick={(e) => { e.preventDefault(); navigateTo('dashboard'); }}>🏠 Dashboard</a>
              <a href="#" className={`menu-item ${currentPage === 'presensi' ? 'active' : ''}`} 
                 onClick={(e) => { e.preventDefault(); navigateTo('presensi'); }}>📋 Presensi Siswa</a>
              <a href="#" className={`menu-item ${currentPage === 'nilai' ? 'active' : ''}`} 
                 onClick={(e) => { e.preventDefault(); navigateTo('nilai'); }}>📊 Nilai Siswa</a>
              <a href="#" className={`menu-item ${currentPage === 'data-siswa' ? 'active' : ''}`} 
                 onClick={(e) => { e.preventDefault(); navigateTo('data-siswa'); }}>👥 Data Siswa</a>
              <a href="#" className={`menu-item ${currentPage === 'laporan' ? 'active' : ''}`} 
                 onClick={(e) => { e.preventDefault(); navigateTo('laporan'); }}>📄 Laporan</a>
            </nav>
          </div>

          <div className="main-content">
            {/* Welcome Section with Live Clock */}
            <div className="welcome-section">
              <div className="welcome-content">
                <div className="welcome-text">
                  <h2 id="welcomeMessage">Selamat Datang, {loggedUser?.name || 'User'}</h2>
                  <p>Di Aplikasi Sistem Administrasi Digital</p>
                </div>
                <div className="live-clock">
                  <div className="clock-time">{currentTime}</div>
                  <div className="clock-date">{currentDate}</div>
                </div>
              </div>
            </div>

            <div className="top-bar">
              <div>
                <h3 id="pageTitle">
                  {currentPage === 'dashboard' && 'Dashboard'}
                  {currentPage === 'presensi' && 'Presensi Siswa'}
                  {currentPage === 'nilai' && 'Nilai Siswa'}
                  {currentPage === 'data-siswa' && 'Data Siswa'}
                  {currentPage === 'laporan' && 'Laporan'}
                </h3>
                <small>{new Date().toLocaleDateString('id-ID', {
                  weekday: 'long',
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}</small>
              </div>
              <div className="user-info">
                <span>Selamat datang, <strong>{loggedUser?.name}</strong></span>
                <button className="logout-btn" onClick={handleLogout}>Logout</button>
              </div>
            </div>

            {/* Dashboard Content */}
            {currentPage === 'dashboard' && (
              <div id="dashboardContent" className="dashboard-sections">
                {/* Section Admin */}
                <div id="adminSection" style={{ display: loggedUser?.role === 'admin' ? 'block' : 'none' }}>
                  <div className="admin-section">
                    <h2>🔐 Dashboard Administrator</h2>
                    <p>Akses penuh untuk monitoring dan manajemen sistem</p>
                  </div>
                  <div className="widgets-grid">
                    <div className="widget">
                      <div className="widget-header">
                        <div className="widget-title">Total Guru Aktif</div>
                        <div className="widget-icon bg-purple">👨‍🏫</div>
                      </div>
                      <div className="widget-value">0</div>
                      <div className="widget-desc">Guru terdaftar</div>
                    </div>

                    <div className="widget">
                      <div className="widget-header">
                        <div className="widget-title">Total Siswa</div>
                        <div className="widget-icon bg-blue">👥</div>
                      </div>
                      <div className="widget-value">
                        {Object.values(studentsData).reduce((sum, students) => sum + students.length, 0)}
                      </div>
                      <div className="widget-desc">Dari {Object.keys(studentsData).length} kelas</div>
                    </div>

                    <div className="widget">
                      <div className="widget-header">
                        <div className="widget-title">Presensi Hari Ini</div>
                        <div className="widget-icon bg-green">✅</div>
                      </div>
                      <div className="widget-value">
                        {attendanceStats.hadir > 0 ? 
                          Math.round((attendanceStats.hadir / (attendanceStats.hadir + attendanceStats.sakit + attendanceStats.izin + attendanceStats.alpha)) * 100) + '%' : 
                          '0%'}
                      </div>
                      <div className="widget-desc">
                        {attendanceStats.hadir} hadir, {attendanceStats.sakit + attendanceStats.izin + attendanceStats.alpha} tidak hadir
                      </div>
                    </div>
                  </div>
                </div>

                {/* Section Guru Mapel */}
                <div id="guruMapelSection" style={{ 
                  display: loggedUser?.role !== 'admin' && (!loggedUser?.homeroom_class || loggedUser?.role !== 'homeroom_teacher') ? 'block' : 'none' 
                }}>
                  <h2 className="section-title">📖 Dashboard Guru Mata Pelajaran</h2>
                  <div className="widgets-grid">
                    <div className="widget">
                      <div className="widget-header">
                        <div className="widget-title">Total Siswa Diajar</div>
                        <div className="widget-icon bg-blue">👥</div>
                      </div>
                      <div className="widget-value">
                        {Object.values(studentsData).reduce((sum, students) => sum + students.length, 0)}
                      </div>
                      <div className="widget-desc">Dari {Object.keys(studentsData).length} kelas</div>
                    </div>

                    <div className="widget">
                      <div className="widget-header">
                        <div className="widget-title">Presensi Hari Ini</div>
                        <div className="widget-icon bg-green">✅</div>
                      </div>
                      <div className="widget-value">
                        {attendanceStats.hadir > 0 ? 
                          Math.round((attendanceStats.hadir / (attendanceStats.hadir + attendanceStats.sakit + attendanceStats.izin + attendanceStats.alpha)) * 100) + '%' : 
                          '0%'}
                      </div>
                      <div className="widget-desc">
                        {attendanceStats.hadir} hadir, {attendanceStats.sakit + attendanceStats.izin + attendanceStats.alpha} tidak hadir
                      </div>
                    </div>

                    <div className="widget">
                      <div className="widget-header">
                        <div className="widget-title">Kelas Diajar</div>
                        <div className="widget-icon bg-orange">📚</div>
                      </div>
                      <div className="widget-value">{Object.keys(studentsData).length}</div>
                      <div className="widget-desc">Kelas {Object.keys(studentsData).join(', ')}</div>
                    </div>
                  </div>

                  <div className="quick-actions">
                    <button className="action-btn" onClick={() => navigateTo('presensi')}>✏️ Input Presensi Hari Ini</button>
                    <button className="action-btn" onClick={() => navigateTo('presensi')}>📋 Daftar Kelas Diajar</button>
                    <button className="action-btn">📈 Lihat Rekap Bulanan</button>
                    <button className="action-btn" onClick={() => navigateTo('data-siswa')}>🔍 Cari Data Siswa</button>
                  </div>
                </div>

                {/* Section Wali Kelas */}
                <div id="waliKelasSection" style={{ 
                  display: loggedUser?.homeroom_class && loggedUser?.role === 'homeroom_teacher' ? 'block' : 'none' 
                }}>
                  <h2 className="section-title">🛡️ Dashboard Wali Kelas</h2>
                  <div className="widgets-grid">
                    <div className="widget">
                      <div className="widget-header">
                        <div className="widget-title">Siswa Kelas Binaan</div>
                        <div className="widget-icon bg-purple">🎓</div>
                      </div>
                      <div className="widget-value">
                        {studentsData[loggedUser?.homeroom_class]?.length || 0}
                      </div>
                      <div className="widget-desc">Kelas <span>{loggedUser?.homeroom_class || '-'}</span></div>
                    </div>

                    <div className="widget">
                      <div className="widget-header">
                        <div className="widget-title">Presensi Kelas Hari Ini</div>
                        <div className="widget-icon bg-green">📅</div>
                      </div>
                      <div className="widget-value">
                        {attendanceStats.hadir > 0 ? 
                          Math.round((attendanceStats.hadir / (attendanceStats.hadir + attendanceStats.sakit + attendanceStats.izin + attendanceStats.alpha)) * 100) + '%' : 
                          '0%'}
                      </div>
                      <div className="widget-desc">
                        {attendanceStats.hadir} hadir, {attendanceStats.sakit + attendanceStats.izin + attendanceStats.alpha} tidak hadir
                      </div>
                    </div>

                    <div className="widget">
                      <div className="widget-header">
                        <div className="widget-title">Total Kelas Diajar</div>
                        <div className="widget-icon bg-blue">📋</div>
                      </div>
                      <div className="widget-value">{Object.keys(studentsData).length}</div>
                      <div className="widget-desc">Semua kelas 7</div>
                    </div>
                  </div>

                  <div className="quick-actions">
                    <button className="action-btn" onClick={() => navigateTo('presensi')}>👀 Input Presensi Hari Ini</button>
                    <button className="action-btn">📋 Daftar Kelas Diajar</button>
                    <button className="action-btn">📈 Lihat Rekap Bulanan</button>
                    <button className="action-btn">🔍 Cari Data Siswa</button>
                  </div>
                </div>
              </div>
            )}

            {/* PRESENSI SISWA CONTENT */}
            {currentPage === 'presensi' && (
              <div id="presensiContent" className="presensi-container">
                <div className="presensi-header">
                  <h2>📋 PRESENSI SISWA DIGITAL</h2>
                  <div className="presensi-controls">
                    <div className="date-selector">
                      <label htmlFor="attendanceDate">Tanggal Presensi:</label>
                      <input 
                        type="date" 
                        id="attendanceDate" 
                        value={attendanceDate}
                        onChange={(e) => {
                          setAttendanceDate(e.target.value);
                          loadAttendanceData();
                        }}
                      />
                    </div>
                    <div className="class-selector">
                      <label>Pilih Kelas:</label>
                      <div className="class-tabs">
                        {classTabs.map(className => (
                          <button 
                            key={className}
                            className={`class-tab ${currentClass === className ? 'active' : ''}`}
                            onClick={() => switchClass(className)}
                          >
                            {className}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="presensi-stats">
                  <div className="stat-item">
                    <span className="stat-label">Total Siswa</span>
                    <span className="stat-value">{studentsData[currentClass]?.length || 0}</span>
                  </div>
                  <div className="stat-item">
                    <span className="stat-label">Hadir</span>
                    <span className="stat-value hadir">{attendanceStats.hadir}</span>
                  </div>
                  <div className="stat-item">
                    <span className="stat-label">Sakit</span>
                    <span className="stat-value sakit">{attendanceStats.sakit}</span>
                  </div>
                  <div className="stat-item">
                    <span className="stat-label">Izin</span>
                    <span className="stat-value izin">{attendanceStats.izin}</span>
                  </div>
                  <div className="stat-item">
                    <span className="stat-label">Alpha</span>
                    <span className="stat-value alpha">{attendanceStats.alpha}</span>
                  </div>
                </div>

                <div className="presensi-actions">
                  <button className="btn btn-primary" onClick={markAllPresent}>
                    ✅ Tandai Semua Hadir
                  </button>
                  <button className="btn btn-success" onClick={saveAttendance}>
                    💾 Simpan Presensi
                  </button>
                </div>

                <div className="presensi-table-container">
                  <table className="presensi-table">
                    <thead>
                      <tr>
                        <th width="5%">No</th>
                        <th width="15%">NIS</th>
                        <th width="40%">Nama Siswa</th>
                        <th width="20%">Status</th>
                        <th width="20%">Keterangan</th>
                      </tr>
                    </thead>
                    <tbody>
                      {studentsData[currentClass]?.map((student, index) => (
                        <tr key={index}>
                          <td>{index + 1}</td>
                          <td>{student.student_id}</td>
                          <td>{student.name}</td>
                          <td>
                            <div className="status-buttons">
                              <button 
                                className={`status-btn present ${currentAttendance[index] === 'present' ? 'active' : ''}`}
                                onClick={() => setStatus(index, 'present')}
                              >
                                Hadir
                              </button>
                              <button 
                                className={`status-btn sick ${currentAttendance[index] === 'sick' ? 'active' : ''}`}
                                onClick={() => setStatus(index, 'sick')}
                              >
                                Sakit
                              </button>
                              <button 
                                className={`status-btn permit ${currentAttendance[index] === 'permit' ? 'active' : ''}`}
                                onClick={() => setStatus(index, 'permit')}
                              >
                                Izin
                              </button>
                              <button 
                                className={`status-btn absent ${currentAttendance[index] === 'absent' ? 'active' : ''}`}
                                onClick={() => setStatus(index, 'absent')}
                              >
                                Alpha
                              </button>
                            </div>
                          </td>
                          <td>
                            <input 
                              type="text" 
                              id={`notes_${index}`}
                              className="notes-input" 
                              placeholder="Keterangan (opsional)"
                            />
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* DATA SISWA CONTENT */}
            {currentPage === 'data-siswa' && (
              <div id="dataSiswaContent" className="data-siswa-container">
                <div className="data-siswa-header">
                  <h2>👥 DATA SISWA</h2>
                  <div className="class-selector">
                    <label>Pilih Kelas:</label>
                    <div className="class-tabs">
                      {classTabs.map(className => (
                        <button 
                          key={className}
                          className={`class-tab ${currentClass === className ? 'active' : ''}`}
                          onClick={() => {
                            setCurrentClass(className);
                            updateDataSiswaStats();
                          }}
                        >
                          {className}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="data-siswa-stats">
                  <div className="stat-item">
                    <span className="stat-label">Total Siswa</span>
                    <span className="stat-value">{studentDataStats.total}</span>
                  </div>
                  <div className="stat-item">
                    <span className="stat-label">Laki-laki</span>
                    <span className="stat-value laki">{studentDataStats.laki}</span>
                  </div>
                  <div className="stat-item">
                    <span className="stat-label">Perempuan</span>
                    <span className="stat-value perempuan">{studentDataStats.perempuan}</span>
                  </div>
                  <div className="stat-item">
                    <span className="stat-label">Status Aktif</span>
                    <span className="stat-value aktif">{studentDataStats.aktif}</span>
                  </div>
                </div>

                <div className="data-siswa-table-container">
                  <table className="data-siswa-table">
                    <thead>
                      <tr>
                        <th width="5%">No</th>
                        <th width="15%">NIS</th>
                        <th width="40%">Nama Siswa</th>
                        <th width="15%">Jenis Kelamin</th>
                        <th width="15%">Status</th>
                        <th width="10%">Aksi</th>
                      </tr>
                    </thead>
                    <tbody>
                      {studentsData[currentClass]?.map((student, index) => (
                        <tr key={index}>
                          <td>{index + 1}</td>
                          <td>{student.student_id}</td>
                          <td>{student.name}</td>
                          <td>{student.gender === 'L' ? 'Laki-laki' : 'Perempuan'}</td>
                          <td>
                            <span className={`status-badge ${student.active ? 'active' : 'inactive'}`}>
                              {student.active ? 'Aktif' : 'Tidak Aktif'}
                            </span>
                          </td>
                          <td>
                            <button 
                              className="detail-btn"
                              onClick={() => viewStudentDetail(index)}
                            >
                              👁️ Lihat
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* NILAI SISWA CONTENT */}
            {currentPage === 'nilai' && (
              <div id="nilaiContent" className="nilai-container">
                <h2>📊 NILAI SISWA</h2>
                <p>Fitur ini sedang dalam pengembangan.</p>
              </div>
            )}

            {/* LAPORAN CONTENT */}
            {currentPage === 'laporan' && (
              <div id="laporanContent" className="laporan-container">
                <h2>📄 LAPORAN</h2>
                <p>Fitur ini sedang dalam pengembangan.</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default App;