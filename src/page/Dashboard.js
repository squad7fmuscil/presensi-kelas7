import { useState, useEffect } from "react";
import { supabase } from "../supabaseClient";

export default function Dashboard({ onPageChange }) {
  const [stats, setStats] = useState({
    totalSiswa: 0,
    totalKelas: 0,
    siswaAktif: 0,
    siswaLaki: 0,
    siswaPerempuan: 0,
  });
  const [recentStudents, setRecentStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentTime, setCurrentTime] = useState(new Date());

  // Real-time clock update setiap detik
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Fungsi untuk greeting berdasarkan jam
  const getGreeting = () => {
    const hour = currentTime.getHours();
    if (hour < 11) return "Selamat Pagi";
    if (hour < 15) return "Selamat Siang";
    if (hour < 19) return "Selamat Sore";
    return "Selamat Malam";
  };

  // Format waktu Indonesia
  const formatTime = (date) => {
    return date.toLocaleTimeString("id-ID", {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: false,
    });
  };

  // Format tanggal Indonesia
  const formatDate = (date) => {
    return date.toLocaleDateString("id-ID", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  // Fetch data untuk dashboard
  const fetchDashboardData = async () => {
    setLoading(true);

    try {
      // Fetch data siswa
      const { data: students, error } = await supabase
        .from("students")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;

      // Hitung stats
      const totalSiswa = students?.length || 0;
      const totalKelas = [...new Set(students?.map((s) => s.class))].length;
      const siswaAktif = students?.filter((s) => s.active).length || 0;
      const siswaLaki =
        students?.filter((s) => s.jenis_kelamin === "L").length || 0;
      const siswaPerempuan =
        students?.filter((s) => s.jenis_kelamin === "P").length || 0;

      setStats({
        totalSiswa,
        totalKelas,
        siswaAktif,
        siswaLaki,
        siswaPerempuan,
      });

      // Ambil 5 siswa terbaru
      setRecentStudents(students?.slice(0, 5) || []);
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  // Stats Cards
  const StatCard = ({ title, value, icon, color, subtitle }) => (
    <div
      className={`bg-white rounded-xl shadow-md p-6 border-l-4 ${color} hover:shadow-lg transition-shadow duration-300`}>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="text-3xl font-bold text-gray-900 mt-2">
            {loading ? "..." : value}
          </p>
          {subtitle && <p className="text-xs text-gray-500 mt-1">{subtitle}</p>}
        </div>
        <div className="text-4xl opacity-80">{icon}</div>
      </div>
    </div>
  );

  // Quick Action Button
  const QuickAction = ({ icon, label, onClick, color }) => (
    <button
      onClick={onClick}
      className={`flex flex-col items-center p-4 rounded-lg ${color} hover:shadow-md transition-all duration-300 transform hover:scale-105`}>
      <span className="text-2xl mb-2">{icon}</span>
      <span className="text-sm font-medium">{label}</span>
    </button>
  );

  return (
    <div className="space-y-6">
      {/* Header - JAM & TANGGAL PINDAH KE KANAN */}
      <div className="bg-gradient-to-r from-blue-400 to-indigo-400 rounded-2xl shadow-lg p-6 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">{getGreeting()}! 👋</h1>
            <p className="text-blue-50 mt-2 text-lg">
              Guru B.Inggris - Walikelas 7F
            </p>
          </div>
          <div className="text-right">
            <p className="text-blue-50 font-medium text-base">
              {formatDate(currentTime)}
            </p>
            <p className="text-white text-2xl font-bold mt-1">
              {formatTime(currentTime)} WIB
            </p>
          </div>
        </div>
      </div>

      {/* Quick Actions - WARNA PASTEL SOFT */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <QuickAction
          icon="👥"
          label="Data Siswa"
          color="bg-blue-100 hover:bg-blue-200 text-blue-700"
          onClick={() => onPageChange("students")}
        />
        <QuickAction
          icon="✅"
          label="Presensi"
          color="bg-green-100 hover:bg-green-200 text-green-700"
          onClick={() => onPageChange("attendance")}
        />
        <QuickAction
          icon="📝"
          label="Input Nilai"
          color="bg-orange-100 hover:bg-orange-200 text-orange-700"
          onClick={() => onPageChange("grades")}
        />
        <QuickAction
          icon="📊"
          label="Laporan"
          color="bg-purple-100 hover:bg-purple-200 text-purple-700"
          onClick={() => onPageChange("report")}
        />
      </div>

      {/* Stats Grid - WARNA PASTEL SOFT */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Kelas"
          value={stats.totalKelas}
          icon="🏫"
          color="border-blue-300"
          subtitle="Kelas aktif"
        />
        <StatCard
          title="Total Siswa"
          value={stats.totalSiswa}
          icon="👨‍🎓"
          color="border-green-300"
          subtitle="Semua siswa"
        />
        <StatCard
          title="Siswa Aktif"
          value={stats.siswaAktif}
          icon="✅"
          color="border-emerald-300"
          subtitle={`${
            stats.totalSiswa
              ? Math.round((stats.siswaAktif / stats.totalSiswa) * 100)
              : 0
          }% aktif`}
        />
        <StatCard
          title="Gender Ratio"
          value={`${stats.siswaLaki}:${stats.siswaPerempuan}`}
          icon="⚥"
          color="border-purple-300"
          subtitle="Laki : Perempuan"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Students */}
        <div className="bg-white rounded-xl shadow-md p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-800">
              Siswa Terbaru
            </h3>
            <span className="text-sm text-blue-600">5 terbaru</span>
          </div>

          <div className="space-y-3">
            {recentStudents.map((student, index) => (
              <div
                key={student.student_id}
                className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-blue-50 transition-colors">
                <div className="flex items-center space-x-3">
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-sm ${
                      student.jenis_kelamin === "L"
                        ? "bg-blue-400"
                        : "bg-pink-400"
                    }`}>
                    {student.jenis_kelamin === "L" ? "L" : "P"}
                  </div>
                  <div>
                    <p className="font-medium text-gray-800">{student.name}</p>
                    <p className="text-sm text-gray-500">
                      {student.class} • {student.student_id}
                    </p>
                  </div>
                </div>
                <span
                  className={`px-2 py-1 rounded-full text-xs ${
                    student.active
                      ? "bg-green-100 text-green-700"
                      : "bg-red-100 text-red-700"
                  }`}>
                  {student.active ? "Aktif" : "Nonaktif"}
                </span>
              </div>
            ))}

            {recentStudents.length === 0 && !loading && (
              <p className="text-center text-gray-500 py-4">
                Belum ada data siswa
              </p>
            )}

            {loading && (
              <p className="text-center text-gray-500 py-4">Memuat data...</p>
            )}
          </div>
        </div>

        {/* Class Distribution */}
        <div className="bg-white rounded-xl shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">
            Distribusi Kelas
          </h3>

          <div className="space-y-4">
            {["7A", "7B", "7C", "7D", "7E", "7F"].map((kelas) => {
              const jumlah = recentStudents.filter(
                (s) => s.class === kelas
              ).length;
              const percentage = stats.totalSiswa
                ? (jumlah / stats.totalSiswa) * 100
                : 0;

              return (
                <div key={kelas} className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="font-medium">Kelas {kelas}</span>
                    <span>
                      {jumlah} siswa ({Math.round(percentage)}%)
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-blue-400 h-2 rounded-full transition-all duration-500"
                      style={{ width: `${percentage}%` }}></div>
                  </div>
                </div>
              );
            })}
          </div>

          {loading && (
            <p className="text-center text-gray-500 py-4">
              Memuat distribusi...
            </p>
          )}
        </div>
      </div>

      {/* System Status */}
      <div className="bg-white rounded-xl shadow-md p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">
          Status Sistem
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="flex items-center space-x-3 p-3 bg-green-50 rounded-lg">
            <div className="w-3 h-3 bg-green-400 rounded-full"></div>
            <div>
              <p className="font-medium">Database</p>
              <p className="text-sm text-green-600">Terhubung</p>
            </div>
          </div>
          <div className="flex items-center space-x-3 p-3 bg-blue-50 rounded-lg">
            <div className="w-3 h-3 bg-blue-400 rounded-full"></div>
            <div>
              <p className="font-medium">Aplikasi</p>
              <p className="text-sm text-blue-600">Online</p>
            </div>
          </div>
          <div className="flex items-center space-x-3 p-3 bg-emerald-50 rounded-lg">
            <div className="w-3 h-3 bg-emerald-400 rounded-full"></div>
            <div>
              <p className="font-medium">Update</p>
              <p className="text-sm text-emerald-600">Terbaru</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
