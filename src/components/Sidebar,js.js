import React, { useState } from "react";
import {
  LayoutDashboard,
  Users,
  ClipboardCheck,
  FileText,
  BookOpen,
  Calendar,
  BarChart3,
  Settings,
  Monitor,
  Menu,
  X,
  ChevronDown,
  LogOut,
  User,
} from "lucide-react";

export default function SchoolAdminLayout() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [activeMenu, setActiveMenu] = useState("Dashboard");

  const menuItems = [
    { name: "Dashboard", icon: LayoutDashboard, path: "/" },
    { name: "Data Siswa", icon: Users, path: "/siswa" },
    { name: "Presensi Siswa", icon: ClipboardCheck, path: "/presensi" },
    { name: "Nilai Siswa", icon: FileText, path: "/nilai" },
    { name: "Catatan Siswa", icon: BookOpen, path: "/catatan" },
    { name: "Jadwal Saya", icon: Calendar, path: "/jadwal" },
    { name: "Laporan", icon: BarChart3, path: "/laporan" },
  ];

  const systemMenuItems = [
    { name: "Pengaturan", icon: Settings, path: "/pengaturan" },
    { name: "Monitor System", icon: Monitor, path: "/monitor" },
  ];

  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      {/* Mobile Overlay */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={toggleSidebar}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
        fixed top-0 left-0 h-full bg-white shadow-xl z-50 transition-transform duration-300 ease-in-out
        ${isSidebarOpen ? "translate-x-0" : "-translate-x-full"}
        lg:translate-x-0 w-72
      `}>
        {/* Header */}
        <div className="p-6 border-b border-slate-200 bg-gradient-to-r from-blue-600 to-blue-700">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center">
                <span className="text-blue-600 font-bold text-lg">SM</span>
              </div>
              <div>
                <h1 className="text-white font-bold text-sm leading-tight">
                  SMP MUSLIMIN
                </h1>
                <p className="text-blue-100 text-xs">Cililin</p>
              </div>
            </div>
            <button
              onClick={toggleSidebar}
              className="lg:hidden text-white hover:bg-blue-800 p-1 rounded">
              <X size={20} />
            </button>
          </div>
        </div>

        {/* User Info */}
        <div className="p-4 border-b border-slate-200 bg-slate-50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center">
              <User size={20} className="text-white" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-semibold text-slate-800">
                Admin Sekolah
              </p>
              <p className="text-xs text-slate-500">administrator</p>
            </div>
            <ChevronDown size={16} className="text-slate-400" />
          </div>
        </div>

        {/* Navigation Menu */}
        <nav className="p-4 overflow-y-auto h-[calc(100vh-220px)]">
          {/* Main Menu */}
          <div className="space-y-1 mb-6">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeMenu === item.name;

              return (
                <button
                  key={item.name}
                  onClick={() => {
                    setActiveMenu(item.name);
                    if (window.innerWidth < 1024) {
                      setIsSidebarOpen(false);
                    }
                  }}
                  className={`
                    w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200
                    ${
                      isActive
                        ? "bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-md shadow-blue-200"
                        : "text-slate-600 hover:bg-slate-100 hover:text-blue-600"
                    }
                  `}>
                  <Icon size={20} className={isActive ? "text-white" : ""} />
                  <span className="font-medium text-sm">{item.name}</span>
                </button>
              );
            })}
          </div>

          {/* System Menu Section */}
          <div className="border-t border-slate-200 pt-4">
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider px-4 mb-2">
              Sistem
            </p>
            <div className="space-y-1">
              {systemMenuItems.map((item) => {
                const Icon = item.icon;
                const isActive = activeMenu === item.name;

                return (
                  <button
                    key={item.name}
                    onClick={() => {
                      setActiveMenu(item.name);
                      if (window.innerWidth < 1024) {
                        setIsSidebarOpen(false);
                      }
                    }}
                    className={`
                      w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200
                      ${
                        isActive
                          ? "bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-md shadow-blue-200"
                          : "text-slate-600 hover:bg-slate-100 hover:text-blue-600"
                      }
                    `}>
                    <Icon size={20} className={isActive ? "text-white" : ""} />
                    <span className="font-medium text-sm">{item.name}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </nav>

        {/* Logout Button */}
        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-slate-200 bg-white">
          <button className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-red-600 hover:bg-red-50 transition-colors">
            <LogOut size={20} />
            <span className="font-medium text-sm">Keluar</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="lg:ml-72">
        {/* Top Bar */}
        <header className="bg-white shadow-sm sticky top-0 z-30">
          <div className="flex items-center justify-between p-4">
            <div className="flex items-center gap-4">
              <button
                onClick={toggleSidebar}
                className="lg:hidden p-2 hover:bg-slate-100 rounded-lg transition-colors">
                <Menu size={24} className="text-slate-600" />
              </button>
              <div>
                <h2 className="text-xl font-bold text-slate-800">
                  {activeMenu}
                </h2>
                <p className="text-xs text-slate-500">
                  Sistem Administrasi Sekolah
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <div className="hidden sm:block text-right mr-3">
                <p className="text-sm font-medium text-slate-700">
                  Rabu, 29 Okt 2025
                </p>
                <p className="text-xs text-slate-500">14:30 WIB</p>
              </div>
            </div>
          </div>
        </header>

        {/* Content Area */}
        <main className="p-4 sm:p-6 lg:p-8">
          <div className="max-w-7xl mx-auto">
            {/* Demo Content Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
              <div className="bg-white p-5 rounded-xl shadow-sm border border-slate-200 hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between mb-3">
                  <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                    <Users className="text-blue-600" size={24} />
                  </div>
                  <span className="text-xs font-medium text-green-600 bg-green-50 px-2 py-1 rounded">
                    +12%
                  </span>
                </div>
                <p className="text-slate-500 text-sm">Total Siswa</p>
                <p className="text-2xl font-bold text-slate-800 mt-1">1,247</p>
              </div>

              <div className="bg-white p-5 rounded-xl shadow-sm border border-slate-200 hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between mb-3">
                  <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                    <ClipboardCheck className="text-green-600" size={24} />
                  </div>
                  <span className="text-xs font-medium text-green-600 bg-green-50 px-2 py-1 rounded">
                    95%
                  </span>
                </div>
                <p className="text-slate-500 text-sm">Kehadiran Hari Ini</p>
                <p className="text-2xl font-bold text-slate-800 mt-1">1,185</p>
              </div>

              <div className="bg-white p-5 rounded-xl shadow-sm border border-slate-200 hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between mb-3">
                  <div className="w-12 h-12 bg-amber-100 rounded-lg flex items-center justify-center">
                    <FileText className="text-amber-600" size={24} />
                  </div>
                  <span className="text-xs font-medium text-amber-600 bg-amber-50 px-2 py-1 rounded">
                    Pending
                  </span>
                </div>
                <p className="text-slate-500 text-sm">Nilai Belum Diinput</p>
                <p className="text-2xl font-bold text-slate-800 mt-1">23</p>
              </div>

              <div className="bg-white p-5 rounded-xl shadow-sm border border-slate-200 hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between mb-3">
                  <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                    <BarChart3 className="text-purple-600" size={24} />
                  </div>
                  <span className="text-xs font-medium text-purple-600 bg-purple-50 px-2 py-1 rounded">
                    Good
                  </span>
                </div>
                <p className="text-slate-500 text-sm">Rata-rata Nilai</p>
                <p className="text-2xl font-bold text-slate-800 mt-1">84.5</p>
              </div>
            </div>

            {/* Welcome Section */}
            <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-xl p-6 sm:p-8 text-white shadow-lg">
              <h3 className="text-2xl font-bold mb-2">
                Selamat Datang di Sistem Administrasi
              </h3>
              <p className="text-blue-100 mb-4">
                SMP Muslimin Cililin - Mengelola data sekolah dengan mudah dan
                efisien
              </p>
              <div className="flex flex-wrap gap-3">
                <button className="bg-white text-blue-600 px-5 py-2 rounded-lg font-medium hover:bg-blue-50 transition-colors text-sm">
                  Lihat Statistik
                </button>
                <button className="bg-blue-800 text-white px-5 py-2 rounded-lg font-medium hover:bg-blue-900 transition-colors text-sm">
                  Download Laporan
                </button>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
