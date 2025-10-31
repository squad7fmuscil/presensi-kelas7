import React, { useState, useEffect } from 'react';
import './App.css';

function App() {
  const [currentPage, setCurrentPage] = useState('login');
  const [loggedUser, setLoggedUser] = useState(null);
  const [currentClass, setCurrentClass] = useState('7A');
  const [studentsData, setStudentsData] = useState({});
  const [attendanceDate, setAttendanceDate] = useState(new Date().toISOString().split('T')[0]);

  // Fungsi untuk menangani login
  const handleLogin = (username, password) => {
    // Implementasi login logic di sini
    console.log('Login attempted with:', username, password);
    setLoggedUser({ name: username, role: 'teacher' });
    setCurrentPage('dashboard');
  };

  // Fungsi untuk menangani logout
  const handleLogout = () => {
    setLoggedUser(null);
    setCurrentPage('login');
  };

  // Fungsi untuk beralih halaman
  const navigateTo = (page) => {
    setCurrentPage(page);
  };

  // Effect untuk mengupdate jam live
  useEffect(() => {
    const timer = setInterval(() => {
      // Logic update jam live
    }, 1000);
    
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="App">
      {/* Loading Overlay */}
      <div id="loadingOverlay" className="loading-overlay">
        <div>
          <div className="loading-spinner"></div>
          <div className="loading-text">Memuat sistem...</div>
        </div>
      </div>

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
              <div id="errorMessage" className="error-message"></div>
              <div id="successMessage" className="success-message"></div>

              <div className="form-group">
                <label htmlFor="username">Username</label>
                <input type="text" id="username" placeholder="Masukkan username" required />
              </div>

              <div className="form-group">
                <label htmlFor="password">Password</label>
                <div className="password-field">
                  <input type="password" id="password" placeholder="Masukkan password" required />
                  <button type="button" className="password-toggle" onClick={() => {
                    const passwordField = document.getElementById('password');
                    const toggleBtn = document.querySelector('.password-toggle');
                    if (passwordField.type === 'password') {
                      passwordField.type = 'text';
                      toggleBtn.textContent = '🙈';
                    } else {
                      passwordField.type = 'password';
                      toggleBtn.textContent = '👁️';
                    }
                  }}>👁️</button>
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
                  <div className="clock-time" id="liveTime">00:00:00</div>
                  <div className="clock-date" id="liveDate">Hari, Tanggal</div>
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
                <small id="currentDate">{new Date().toLocaleDateString('id-ID', {
                  weekday: 'long',
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}</small>
              </div>
              <div className="user-info">
                <span>Selamat datang, <strong id="loggedUser">{loggedUser?.name}</strong></span>
                <button className="logout-btn" onClick={handleLogout}>Logout</button>
              </div>
            </div>

            {/* Dashboard Content */}
            {currentPage === 'dashboard' && (
              <div id="dashboardContent" className="dashboard-sections">
                {/* Section Admin */}
                <div id="adminSection" style={{ display: 'none' }}>
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
                      <div className="widget-value" id="totalTeachers">0</div>
                      <div className="widget-desc">Guru terdaftar</div>
                    </div>

                    <div className="widget">
                      <div className="widget-header">
                        <div className="widget-title">Total Siswa</div>
                        <div className="widget-icon bg-blue">👥</div>
                      </div>
                      <div className="widget-value" id="totalStudentsAdmin">0</div>
                      <div className="widget-desc">Dari 6 kelas (7A - 7F)</div>
                    </div>

                    <div className="widget">
                      <div className="widget-header">
                        <div className="widget-title">Presensi Hari Ini</div>
                        <div className="widget-icon bg-green">✅</div>
                      </div>
                      <div className="widget-value" id="todayAttendanceAdmin">0%</div>
                      <div className="widget-desc" id="attendanceDescAdmin">Belum ada data</div>
                    </div>
                  </div>
                </div>

                {/* Section Guru Mapel */}
                <div id="guruMapelSection">
                  <h2 className="section-title">📖 Dashboard Guru Mata Pelajaran</h2>
                  <div className="widgets-grid">
                    <div className="widget">
                      <div className="widget-header">
                        <div className="widget-title">Total Siswa Diajar</div>
                        <div className="widget-icon bg-blue">👥</div>
                      </div>
                      <div className="widget-value" id="totalStudents">0</div>
                      <div className="widget-desc">Dari 6 kelas (7A - 7F)</div>
                    </div>

                    <div className="widget">
                      <div className="widget-header">
                        <div className="widget-title">Presensi Hari Ini</div>
                        <div className="widget-icon bg-green">✅</div>
                      </div>
                      <div className="widget-value" id="todayAttendance">0%</div>
                      <div className="widget-desc" id="attendanceDesc">Belum ada data</div>
                    </div>

                    <div className="widget">
                      <div className="widget-header">
                        <div className="widget-title">Kelas Diajar</div>
                        <div className="widget-icon bg-orange">📚</div>
                      </div>
                      <div className="widget-value">6</div>
                      <div className="widget-desc">Kelas 7A - 7F</div>
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
                <div id="waliKelasSection" style={{ display: 'none' }}>
                  <h2 className="section-title">🛡️ Dashboard Wali Kelas</h2>
                  <div className="widgets-grid">
                    <div className="widget">
                      <div className="widget-header">
                        <div className="widget-title">Siswa Kelas Binaan</div>
                        <div className="widget-icon bg-purple">🎓</div>
                      </div>
                      <div className="widget-value" id="homeroomStudents">0</div>
                      <div className="widget-desc">Kelas <span id="homeroomClass">-</span></div>
                    </div>

                    <div className="widget">
                      <div className="widget-header">
                        <div className="widget-title">Presensi Kelas Hari Ini</div>
                        <div className="widget-icon bg-green">📅</div>
                      </div>
                      <div className="widget-value" id="homeroomAttendance">0%</div>
                      <div className="widget-desc" id="homeroomAttendanceDesc">Belum ada data</div>
                    </div>

                    <div className="widget">
                      <div className="widget-header">
                        <div className="widget-title">Total Kelas Diajar</div>
                        <div className="widget-icon bg-blue">📋</div>
                      </div>
                      <div className="widget-value">6</div>
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
                  <p>Kelola Daftar Hadir Siswa Dengan Sistem Yang Terintegrasi dan Real-Time</p>
                </div>

                {/* Guru & Mapel Info */}
                <div className="mapel-info">
                  <h3 id="currentMapel">Mata Pelajaran: -</h3>
                  <p id="currentGuru">Guru: -</p>
                </div>

                {/* Controls Container */}
                <div className="presensi-controls-container">
                  {/* Baris pertama: Search box dan tombol kelas */}
                  <div className="presensi-top-row">
                    <div className="search-container">
                      <input type="text" className="search-box" id="searchBox" placeholder="🔍 Cari nama siswa..." />
                    </div>
                    <div className="class-tabs" id="classTabs">
                      {/* Class tabs will be generated here */}
                    </div>
                  </div>
                  
                  {/* Baris kedua: Tanggal dan tombol aksi */}
                  <div className="presensi-bottom-row">
                    <div className="date-input-container">
                      <input 
                        type="date" 
                        className="date-input" 
                        id="attendanceDate" 
                        value={attendanceDate}
                        onChange={(e) => setAttendanceDate(e.target.value)}
                      />
                    </div>
                    <div className="action-buttons">
                      <button className="btn btn-success">
                        <i className="fas fa-check-double"></i> Hadiri Semua
                      </button>
                      <button className="btn btn-primary">
                        <i className="fas fa-save"></i> Simpan Data
                      </button>
                      <button className="btn btn-info">
                        <i className="fas fa-calendar-alt"></i> Rekap Bulanan
                      </button>
                      <button className="btn btn-warning">
                        <i className="fas fa-file-excel"></i> Export Excel
                      </button>
                    </div>
                  </div>
                </div>

                {/* Statistics */}
                <div className="stats-grid">
                  <div className="stat-card stat-hadir">
                    <div className="stat-icon">✅</div>
                    <div className="stat-number" id="statHadir">0</div>
                    <div className="stat-label">Hadir</div>
                  </div>
                  <div className="stat-card stat-sakit">
                    <div className="stat-icon">🏥</div>
                    <div className="stat-number" id="statSakit">0</div>
                    <div className="stat-label">Sakit</div>
                  </div>
                  <div className="stat-card stat-izin">
                    <div className="stat-icon">📄</div>
                    <div className="stat-number" id="statIzin">0</div>
                    <div className="stat-label">Izin</div>
                  </div>
                  <div className="stat-card stat-alpha">
                    <div className="stat-icon">❌</div>
                    <div className="stat-number" id="statAlpha">0</div>
                    <div className="stat-label">Alpa</div>
                  </div>
                </div>

                {/* Presensi Table */}
                <div className="student-table-container">
                  <table className="student-table">
                    <thead>
                      <tr>
                        <th>No</th>
                        <th>Nama Siswa</th>
                        <th>Status Kehadiran</th>
                        <th>Keterangan</th>
                      </tr>
                    </thead>
                    <tbody id="studentTableBody">
                      {/* Student rows will be generated here */}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* DATA SISWA CONTENT */}
            {currentPage === 'data-siswa' && (
              <div id="dataSiswaContent" className="presensi-container">
                <div className="presensi-header">
                  <h2>👥 DATA SISWA DIGITAL</h2>
                  <p>Kelola Data Siswa Dengan Sistem Yang Terintegrasi dan Real-Time</p>
                </div>

                {/* Guru & Info */}
                <div className="mapel-info">
                  <h3 id="dataSiswaGuru">Guru: -</h3>
                  <p id="dataSiswaMapel">Mata Pelajaran: -</p>
                </div>

                {/* Class Tabs for Data Siswa */}
                <div className="data-siswa-header">
                  <input type="text" className="search-box" id="dataSiswaSearchBox" placeholder="🔍 Cari nama siswa..." />
                  <div className="class-tabs" id="dataSiswaClassTabs">
                    {/* Tabs will be generated dynamically */}
                  </div>
                </div>

                {/* Statistics for Data Siswa */}
                <div className="stats-grid">
                  <div className="stat-card stat-hadir">
                    <div className="stat-icon">👥</div>
                    <div className="stat-number" id="totalSiswaKelas">0</div>
                    <div className="stat-label">Total Siswa</div>
                  </div>
                  <div className="stat-card stat-alpha">
                    <div className="stat-icon">👨‍🎓</div>
                    <div className="stat-number" id="siswaLakiKelas">0</div>
                    <div className="stat-label">Laki-laki</div>
                  </div>
                  <div className="stat-card stat-sakit">
                    <div className="stat-icon">👩‍🎓</div>
                    <div className="stat-number" id="siswaPerempuanKelas">0</div>
                    <div className="stat-label">Perempuan</div>
                  </div>
                  <div className="stat-card stat-izin">
                    <div className="stat-icon">✅</div>
                    <div className="stat-number" id="siswaAktifKelas">0</div>
                    <div className="stat-label">Aktif</div>
                  </div>
                </div>

                {/* Data Siswa Table */}
                <div className="student-table-container">
                  <table className="student-table">
                    <thead>
                      <tr>
                        <th>No</th>
                        <th>ID Siswa</th>
                        <th>Nama Siswa</th>
                        <th>Jenis Kelamin</th>
                        <th>Status</th>
                        <th>Aksi</th>
                      </tr>
                    </thead>
                    <tbody id="dataSiswaTableBody">
                      {/* Student data rows will be generated here */}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* NILAI CONTENT */}
            {currentPage === 'nilai' && (
              <div id="nilaiContent">
                <h2>📊 Nilai Siswa</h2>
                <p>Halaman input dan kelola nilai siswa (Coming Soon)</p>
              </div>
            )}

            {/* LAPORAN CONTENT */}
            {currentPage === 'laporan' && (
              <div id="laporanContent">
                <h2>📄 Laporan</h2>
                <p>Halaman rekap dan laporan (Coming Soon)</p>
              </div>
            )}

            {/* Notification Toast */}
            <div id="notificationToast" className="notification-toast">
              <span className="toast-icon">✅</span>
              <span id="toastMessage">Data berhasil disimpan!</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;