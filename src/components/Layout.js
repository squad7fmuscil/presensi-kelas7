import { useState } from "react";
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
  User,
  ChevronDown,
  LogOut,
  PanelLeftClose,
  PanelLeftOpen,
} from "lucide-react";

export default function Layout({ children, currentPage, onPageChange }) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true); // Default buka di desktop
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const menuItems = [
    { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
    { id: "students", label: "Data Siswa", icon: Users },
    { id: "attendance", label: "Presensi Siswa", icon: ClipboardCheck },
    { id: "grades", label: "Nilai Siswa", icon: FileText },
    { id: "notes", label: "Catatan Siswa", icon: BookOpen },
    { id: "schedule", label: "Jadwal Saya", icon: Calendar },
    { id: "report", label: "Laporan", icon: BarChart3 },
  ];

  const systemMenuItems = [
    { id: "setting", label: "Pengaturan", icon: Settings },
    { id: "sistem", label: "Monitor System", icon: Monitor },
  ];

  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);
  const toggleMobileMenu = () => setIsMobileMenuOpen(!isMobileMenuOpen);

  const getPageTitle = () => {
    const allItems = [...menuItems, ...systemMenuItems];
    const currentItem = allItems.find((item) => item.id === currentPage);
    return currentItem ? currentItem.label : "Dashboard";
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      {/* Mobile Overlay */}
      {isMobileMenuOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={toggleMobileMenu}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
        fixed top-0 left-0 h-full bg-white shadow-xl z-50 transition-all duration-300 ease-in-out
        ${
          isMobileMenuOpen
            ? "translate-x-0"
            : "-translate-x-full lg:translate-x-0"
        }
        ${isSidebarOpen ? "lg:w-72" : "lg:w-20"}
        w-72
      `}>
        {/* Header */}
        <div className="p-6 border-b border-slate-200 bg-gradient-to-r from-blue-600 to-blue-700">
          <div className="flex items-center justify-between">
            <div
              className={`flex items-center gap-3 ${
                !isSidebarOpen && "lg:justify-center lg:w-full"
              }`}>
              <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center flex-shrink-0">
                <span className="text-blue-600 font-bold text-lg">SM</span>
              </div>
              {isSidebarOpen && (
                <div className="lg:block">
                  <h1 className="text-white font-bold text-sm leading-tight">
                    SMP MUSLIMIN
                  </h1>
                  <p className="text-blue-100 text-xs">Cililin</p>
                </div>
              )}
            </div>
            <button
              onClick={toggleMobileMenu}
              className="lg:hidden text-white hover:bg-blue-800 p-1 rounded">
              <X size={20} />
            </button>
          </div>
        </div>

        {/* User Info */}
        <div
          className={`p-4 border-b border-slate-200 bg-slate-50 ${
            !isSidebarOpen && "lg:hidden"
          }`}>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center flex-shrink-0">
              <User size={20} className="text-white" />
            </div>
            {isSidebarOpen && (
              <div className="flex-1">
                <p className="text-sm font-semibold text-slate-800">
                  Guru B.Inggris
                </p>
                <p className="text-xs text-slate-500">Walikelas 7F</p>
              </div>
            )}
            {isSidebarOpen && (
              <ChevronDown size={16} className="text-slate-400" />
            )}
          </div>
        </div>

        {/* Navigation Menu */}
        <nav className="p-4 overflow-y-auto h-[calc(100vh-220px)]">
          {/* Main Menu */}
          <div className="space-y-1 mb-6">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentPage === item.id;

              return (
                <button
                  key={item.id}
                  onClick={() => {
                    onPageChange(item.id);
                    if (window.innerWidth < 1024) {
                      setIsMobileMenuOpen(false);
                    }
                  }}
                  className={`
                    w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200
                    ${!isSidebarOpen && "lg:justify-center lg:px-2"}
                    ${
                      isActive
                        ? "bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-md shadow-blue-200"
                        : "text-slate-600 hover:bg-slate-100 hover:text-blue-600"
                    }
                  `}
                  title={!isSidebarOpen ? item.label : ""}>
                  <Icon
                    size={20}
                    className={`${isActive ? "text-white" : ""} flex-shrink-0`}
                  />
                  {isSidebarOpen && (
                    <span className="font-medium text-sm">{item.label}</span>
                  )}
                </button>
              );
            })}
          </div>

          {/* System Menu Section */}
          <div className="border-t border-slate-200 pt-4">
            {isSidebarOpen && (
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider px-4 mb-2">
                Sistem
              </p>
            )}
            <div className="space-y-1">
              {systemMenuItems.map((item) => {
                const Icon = item.icon;
                const isActive = currentPage === item.id;

                return (
                  <button
                    key={item.id}
                    onClick={() => {
                      onPageChange(item.id);
                      if (window.innerWidth < 1024) {
                        setIsMobileMenuOpen(false);
                      }
                    }}
                    className={`
                      w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200
                      ${!isSidebarOpen && "lg:justify-center lg:px-2"}
                      ${
                        isActive
                          ? "bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-md shadow-blue-200"
                          : "text-slate-600 hover:bg-slate-100 hover:text-blue-600"
                      }
                    `}
                    title={!isSidebarOpen ? item.label : ""}>
                    <Icon
                      size={20}
                      className={`${
                        isActive ? "text-white" : ""
                      } flex-shrink-0`}
                    />
                    {isSidebarOpen && (
                      <span className="font-medium text-sm">{item.label}</span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        </nav>

        {/* Logout Button */}
        <div
          className={`absolute bottom-0 left-0 right-0 p-4 border-t border-slate-200 bg-white ${
            !isSidebarOpen && "lg:hidden"
          }`}>
          <button className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-red-600 hover:bg-red-50 transition-colors">
            <LogOut size={20} />
            {isSidebarOpen && (
              <span className="font-medium text-sm">Keluar</span>
            )}
          </button>
        </div>

        {/* Collapsed Logout (icon only) */}
        {!isSidebarOpen && (
          <div className="hidden lg:block absolute bottom-0 left-0 right-0 p-4 border-t border-slate-200 bg-white">
            <button
              className="w-full flex items-center justify-center p-3 rounded-lg text-red-600 hover:bg-red-50 transition-colors"
              title="Keluar">
              <LogOut size={20} />
            </button>
          </div>
        )}
      </aside>

      {/* Main Content */}
      <div
        className={`transition-all duration-300 ${
          isSidebarOpen ? "lg:ml-72" : "lg:ml-20"
        }`}>
        {/* Top Bar */}
        <header className="bg-white shadow-sm sticky top-0 z-30">
          <div className="flex items-center justify-between p-4">
            <div className="flex items-center gap-4">
              {/* Mobile Menu Button */}
              <button
                onClick={toggleMobileMenu}
                className="lg:hidden p-2 hover:bg-slate-100 rounded-lg transition-colors">
                <Menu size={24} className="text-slate-600" />
              </button>

              {/* Desktop Toggle Button */}
              <button
                onClick={toggleSidebar}
                className="hidden lg:block p-2 hover:bg-slate-100 rounded-lg transition-colors"
                title={isSidebarOpen ? "Tutup Sidebar" : "Buka Sidebar"}>
                {isSidebarOpen ? (
                  <PanelLeftClose size={24} className="text-slate-600" />
                ) : (
                  <PanelLeftOpen size={24} className="text-slate-600" />
                )}
              </button>

              <div>
                <h2 className="text-xl font-bold text-slate-800">
                  {getPageTitle()}
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
          <div className="max-w-7xl mx-auto">{children}</div>
        </main>
      </div>
    </div>
  );
}
