import React, { useState, useEffect } from "react";
import { supabase } from "../lib/supabaseClient"; // Pastikan kamu sudah setup Supabase client

function DataSiswa() {
  const [siswa, setSiswa] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterClass, setFilterClass] = useState("");

  // Fetch data siswa dari Supabase
  const fetchSiswa = async () => {
    try {
      setLoading(true);
      let query = supabase
        .from("siswa")
        .select("*")
        .order("name", { ascending: true });

      // Filter berdasarkan kelas jika dipilih
      if (filterClass) {
        query = query.eq("class", filterClass);
      }

      // Filter berdasarkan pencarian nama
      if (searchTerm) {
        query = query.ilike("name", `%${searchTerm}%`);
      }

      const { data, error } = await query;

      if (error) {
        throw error;
      }

      setSiswa(data || []);
    } catch (error) {
      console.error("Error fetching siswa:", error);
      alert("Error mengambil data siswa");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSiswa();
  }, [filterClass]);

  // Handle pencarian
  const handleSearch = (e) => {
    e.preventDefault();
    fetchSiswa();
  };

  // Get unique classes untuk filter
  const uniqueClasses = [...new Set(siswa.map((item) => item.class))].sort();

  // Format tanggal
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("id-ID");
  };

  return (
    <div className="min-h-screen bg-blue-50">
      {/* Navbar (sama seperti di Dashboard) */}
      <nav className="bg-blue-900 shadow-lg sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <i className="fas fa-graduation-cap text-white text-xl mr-2"></i>
              <span className="text-white font-bold text-lg">
                Dashboard Sekolah
              </span>
            </div>

            {/* Navigation items... (sama seperti Dashboard) */}
            <div className="hidden md:flex items-center space-x-1">
              <a
                href="/dashboard"
                className="text-white hover:bg-blue-800 px-4 py-3 rounded-md transition duration-300 flex items-center">
                <i className="fas fa-tachometer-alt mr-2"></i>
                Dashboard
              </a>
              <a
                href="/data-siswa"
                className="text-white bg-blue-800 px-4 py-3 rounded-md transition duration-300 flex items-center">
                <i className="fas fa-user-graduate mr-2"></i>
                Data Siswa
              </a>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="bg-white rounded-lg shadow-sm p-6">
          {/* Header */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-800 mb-2">
                Data Siswa
              </h2>
              <p className="text-gray-600">
                Kelola dan lihat informasi data siswa secara lengkap
              </p>
            </div>
            <button className="mt-4 md:mt-0 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md flex items-center">
              <i className="fas fa-plus mr-2"></i>
              Tambah Siswa
            </button>
          </div>

          <hr className="mb-6" />

          {/* Filters and Search */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            {/* Search */}
            <div className="md:col-span-2">
              <form onSubmit={handleSearch} className="flex gap-2">
                <div className="flex-1 relative">
                  <input
                    type="text"
                    placeholder="Cari nama siswa..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <i className="fas fa-search absolute right-3 top-3 text-gray-400"></i>
                </div>
                <button
                  type="submit"
                  className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md">
                  Cari
                </button>
              </form>
            </div>

            {/* Class Filter */}
            <div>
              <select
                value={filterClass}
                onChange={(e) => setFilterClass(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500">
                <option value="">Semua Kelas</option>
                {uniqueClasses.map((kelas) => (
                  <option key={kelas} value={kelas}>
                    Kelas {kelas}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Loading State */}
          {loading && (
            <div className="text-center py-8">
              <i className="fas fa-spinner fa-spin text-2xl text-blue-600 mb-2"></i>
              <p className="text-gray-600">Memuat data siswa...</p>
            </div>
          )}

          {/* Data Table */}
          {!loading && (
            <div className="overflow-x-auto">
              <table className="min-w-full bg-white">
                <thead>
                  <tr className="bg-gray-50 border-b">
                    <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      NIS
                    </th>
                    <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Nama Siswa
                    </th>
                    <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Jenis Kelamin
                    </th>
                    <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Kelas
                    </th>
                    <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Tanggal Daftar
                    </th>
                    <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Aksi
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {siswa.length === 0 ? (
                    <tr>
                      <td
                        colSpan="7"
                        className="py-8 text-center text-gray-500">
                        <i className="fas fa-user-slash text-3xl mb-2"></i>
                        <p>Tidak ada data siswa ditemukan</p>
                      </td>
                    </tr>
                  ) : (
                    siswa.map((item) => (
                      <tr key={item.student_id} className="hover:bg-gray-50">
                        <td className="py-4 px-4 text-sm font-medium text-gray-900">
                          {item.student_id}
                        </td>
                        <td className="py-4 px-4 text-sm text-gray-900">
                          {item.name}
                        </td>
                        <td className="py-4 px-4 text-sm text-gray-900">
                          <span
                            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                              item.jenis_kelamin === "L"
                                ? "bg-blue-100 text-blue-800"
                                : "bg-pink-100 text-pink-800"
                            }`}>
                            <i
                              className={`fas ${
                                item.jenis_kelamin === "L"
                                  ? "fa-mars"
                                  : "fa-venus"
                              } mr-1`}></i>
                            {item.jenis_kelamin === "L"
                              ? "Laki-laki"
                              : "Perempuan"}
                          </span>
                        </td>
                        <td className="py-4 px-4 text-sm text-gray-900">
                          <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs">
                            {item.class}
                          </span>
                        </td>
                        <td className="py-4 px-4 text-sm">
                          <span
                            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                              item.active
                                ? "bg-green-100 text-green-800"
                                : "bg-red-100 text-red-800"
                            }`}>
                            <i
                              className={`fas ${
                                item.active
                                  ? "fa-check-circle"
                                  : "fa-times-circle"
                              } mr-1`}></i>
                            {item.active ? "Aktif" : "Non-Aktif"}
                          </span>
                        </td>
                        <td className="py-4 px-4 text-sm text-gray-500">
                          {formatDate(item.created_at)}
                        </td>
                        <td className="py-4 px-4 text-sm">
                          <div className="flex space-x-2">
                            <button className="text-blue-600 hover:text-blue-900">
                              <i className="fas fa-edit"></i>
                            </button>
                            <button className="text-green-600 hover:text-green-900">
                              <i className="fas fa-eye"></i>
                            </button>
                            <button className="text-red-600 hover:text-red-900">
                              <i className="fas fa-trash"></i>
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          )}

          {/* Summary */}
          {!loading && siswa.length > 0 && (
            <div className="mt-4 text-sm text-gray-600">
              Menampilkan <span className="font-semibold">{siswa.length}</span>{" "}
              siswa
              {filterClass && ` dari Kelas ${filterClass}`}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default DataSiswa;
