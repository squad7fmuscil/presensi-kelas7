import React, { useState } from "react";

function App() {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  return (
    <div className="min-h-screen bg-blue-50">
      {/* Navbar */}
      <nav className="bg-blue-900 shadow-lg sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex justify-between items-center h-16">
            {/* Brand */}
            <div className="flex items-center">
              <i className="fas fa-graduation-cap text-white text-xl mr-2"></i>
              <span className="text-white font-bold text-lg">
                Dashboard Sekolah
              </span>
            </div>

            {/* Mobile menu button */}
            <div className="md:hidden">
              <button
                type="button"
                className="text-white hover:text-gray-300 focus:outline-none"
                onClick={() =>
                  document
                    .getElementById("mobile-menu")
                    .classList.toggle("hidden")
                }>
                <svg
                  className="h-6 w-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 6h16M4 12h16M4 18h16"
                  />
                </svg>
              </button>
            </div>

            {/* Desktop menu */}
            <div className="hidden md:flex items-center space-x-1">
              {/* Main Navigation */}
              <div className="flex space-x-1">
                {[
                  { icon: "fas fa-user-graduate", text: "Data Siswa" },
                  { icon: "fas fa-calendar-check", text: "Presensi Siswa" },
                  { icon: "fas fa-chart-line", text: "Nilai Siswa" },
                  { icon: "fas fa-comment-dots", text: "Catatan Siswa" },
                  { icon: "fas fa-clock", text: "Jadwal Pelajaran" },
                  { icon: "fas fa-file-alt", text: "Laporan" },
                ].map((item, index) => (
                  <a
                    key={index}
                    href="#"
                    className="text-white hover:bg-blue-800 px-4 py-3 rounded-md transition duration-300 flex items-center">
                    <i className={`${item.icon} mr-2`}></i>
                    {item.text}
                  </a>
                ))}

                {/* Dropdown */}
                <div className="relative">
                  <button
                    onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                    className="text-white hover:bg-blue-800 px-4 py-3 rounded-md transition duration-300 flex items-center">
                    <i className="fas fa-cogs mr-2"></i>
                    Modul & Alat
                    <i className="fas fa-chevron-down ml-2 text-xs"></i>
                  </button>

                  {isDropdownOpen && (
                    <div className="absolute right-0 mt-2 w-56 bg-white rounded-md shadow-lg py-1 z-50">
                      <a
                        href="#"
                        className="block px-4 py-2 text-gray-700 hover:bg-gray-100">
                        <i className="fas fa-puzzle-piece mr-2"></i>
                        Easy Modul
                      </a>
                      <a
                        href="#"
                        className="block px-4 py-2 text-gray-700 hover:bg-gray-100">
                        <i className="fas fa-database mr-2"></i>
                        Bank Soal
                      </a>
                      <div className="border-t my-1"></div>
                      <a
                        href="#"
                        className="block px-4 py-2 text-gray-700 hover:bg-gray-100">
                        <i className="fas fa-tools mr-2"></i>
                        Pengaturan
                      </a>
                    </div>
                  )}
                </div>
              </div>

              {/* Right side menu */}
              <div className="flex space-x-1 ml-4">
                <a
                  href="#"
                  className="text-white hover:bg-blue-800 px-4 py-3 rounded-md transition duration-300 flex items-center">
                  <i className="fas fa-tools mr-2"></i>
                  Pengaturan
                </a>
                <a
                  href="#"
                  className="text-white hover:bg-blue-800 px-4 py-3 rounded-md transition duration-300 flex items-center">
                  <i className="fas fa-tachometer-alt mr-2"></i>
                  Monitor Sistem
                </a>
              </div>
            </div>
          </div>

          {/* Mobile menu */}
          <div id="mobile-menu" className="md:hidden hidden pb-4">
            <div className="flex flex-col space-y-2">
              {[
                { icon: "fas fa-user-graduate", text: "Data Siswa" },
                { icon: "fas fa-calendar-check", text: "Presensi Siswa" },
                { icon: "fas fa-chart-line", text: "Nilai Siswa" },
                { icon: "fas fa-comment-dots", text: "Catatan Siswa" },
                { icon: "fas fa-clock", text: "Jadwal Pelajaran" },
                { icon: "fas fa-file-alt", text: "Laporan" },
                { icon: "fas fa-cogs", text: "Modul & Alat" },
                { icon: "fas fa-tools", text: "Pengaturan" },
                { icon: "fas fa-tachometer-alt", text: "Monitor Sistem" },
              ].map((item, index) => (
                <a
                  key={index}
                  href="#"
                  className="text-white hover:bg-blue-800 px-4 py-3 rounded-md transition duration-300 flex items-center">
                  <i className={`${item.icon} mr-3`}></i>
                  {item.text}
                </a>
              ))}
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">
            Selamat Datang di Dashboard
          </h2>
          <p className="text-gray-600 mb-6">
            Antarmuka profesional dengan navigasi cepat. Klik pada menu di atas
            untuk mengakses fitur.
          </p>
          <hr className="mb-6" />

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Stat Card 1 */}
            <div className="bg-blue-600 text-white rounded-lg p-4 shadow">
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="text-2xl font-bold">1,250</h3>
                  <p className="text-blue-100">Total Siswa Aktif</p>
                </div>
                <i className="fas fa-user-graduate text-3xl opacity-80"></i>
              </div>
            </div>

            {/* Stat Card 2 */}
            <div className="bg-green-600 text-white rounded-lg p-4 shadow">
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="text-2xl font-bold">98%</h3>
                  <p className="text-green-100">Tingkat Presensi Hari Ini</p>
                </div>
                <i className="fas fa-calendar-check text-3xl opacity-80"></i>
              </div>
            </div>

            {/* Stat Card 3 */}
            <div className="bg-purple-600 text-white rounded-lg p-4 shadow">
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="text-2xl font-bold">85%</h3>
                  <p className="text-purple-100">Rata-rata Nilai</p>
                </div>
                <i className="fas fa-chart-line text-3xl opacity-80"></i>
              </div>
            </div>

            {/* Stat Card 4 */}
            <div className="bg-orange-600 text-white rounded-lg p-4 shadow">
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="text-2xl font-bold">24</h3>
                  <p className="text-orange-100">Guru Aktif</p>
                </div>
                <i className="fas fa-chalkboard-teacher text-3xl opacity-80"></i>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
