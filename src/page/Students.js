import { useState, useEffect } from "react";
import { supabase } from "../supabaseClient";

export default function Students() {
  const [students, setStudents] = useState([]);
  const [filteredStudents, setFilteredStudents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    student_id: "",
    jenis_kelamin: "L",
    class: "7F",
    active: true,
  });
  const [editingId, setEditingId] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [filters, setFilters] = useState({
    search: "",
    class: "Semua Kelas",
    gender: "Semua",
  });

  // Fetch data siswa
  const fetchStudents = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("students")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching students:", error);
    } else {
      setStudents(data || []);
      setFilteredStudents(data || []);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchStudents();
  }, []);

  // Apply filters
  useEffect(() => {
    let filtered = students;

    // Filter by search
    if (filters.search) {
      filtered = filtered.filter(
        (student) =>
          student.name.toLowerCase().includes(filters.search.toLowerCase()) ||
          (student.student_id &&
            student.student_id
              .toLowerCase()
              .includes(filters.search.toLowerCase()))
      );
    }

    // Filter by class
    if (filters.class !== "Semua Kelas") {
      filtered = filtered.filter((student) => student.class === filters.class);
    }

    // Filter by gender
    if (filters.gender !== "Semua") {
      filtered = filtered.filter(
        (student) => student.jenis_kelamin === filters.gender
      );
    }

    setFilteredStudents(filtered);
  }, [filters, students]);

  // Calculate stats
  const stats = {
    totalKelas: [...new Set(students.map((s) => s.class))].length,
    totalSiswa: students.length,
    lakiLaki: students.filter((s) => s.jenis_kelamin === "L").length,
    perempuan: students.filter((s) => s.jenis_kelamin === "P").length,
  };

  // Handle form input
  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  // Handle filter change
  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Add/Edit student
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (editingId) {
        // Update student
        const { error } = await supabase
          .from("students")
          .update({
            ...formData,
            updated_at: new Date().toISOString(),
          })
          .eq("student_id", editingId);

        if (error) throw error;
      } else {
        // Add new student
        const { error } = await supabase.from("students").insert([formData]);

        if (error) throw error;
      }

      await fetchStudents();
      resetForm();
    } catch (error) {
      console.error("Error saving student:", error);
      alert("Error saving student: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  // Edit student
  const handleEdit = (student) => {
    setFormData({
      name: student.name,
      student_id: student.student_id,
      jenis_kelamin: student.jenis_kelamin,
      class: student.class,
      active: student.active,
    });
    setEditingId(student.student_id);
    setShowForm(true);
  };

  // Delete student
  const handleDelete = async (id) => {
    if (!window.confirm("Yakin hapus siswa ini?")) return;

    setLoading(true);
    const { error } = await supabase
      .from("students")
      .delete()
      .eq("student_id", id);

    if (error) {
      console.error("Error deleting student:", error);
      alert("Error deleting student: " + error.message);
    } else {
      await fetchStudents();
    }
    setLoading(false);
  };

  // Reset form
  const resetForm = () => {
    setFormData({
      name: "",
      student_id: "",
      jenis_kelamin: "L",
      class: "7F",
      active: true,
    });
    setEditingId(null);
    setShowForm(false);
  };

  // Reset all filters
  const resetAllFilters = () => {
    setFilters({
      search: "",
      class: "Semua Kelas",
      gender: "Semua",
    });
  };

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Data Siswa</h2>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="text-2xl font-bold text-blue-600">
            {stats.totalKelas}
          </div>
          <div className="text-sm text-blue-800">Total Kelas</div>
        </div>
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="text-2xl font-bold text-green-600">
            {stats.totalSiswa}
          </div>
          <div className="text-sm text-green-800">Total Siswa</div>
        </div>
        <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
          <div className="text-2xl font-bold text-orange-600">
            {stats.lakiLaki}
          </div>
          <div className="text-sm text-orange-800">Laki-laki</div>
        </div>
        <div className="bg-pink-50 border border-pink-200 rounded-lg p-4">
          <div className="text-2xl font-bold text-pink-600">
            {stats.perempuan}
          </div>
          <div className="text-sm text-pink-800">Perempuan</div>
        </div>
      </div>

      {/* Filters + Tambah Siswa dalam satu baris */}
      <div className="bg-gray-50 p-4 rounded-lg mb-6">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          {/* Cari Siswa */}
          <div>
            <label className="block text-sm font-medium mb-1">Cari Siswa</label>
            <input
              type="text"
              name="search"
              value={filters.search}
              onChange={handleFilterChange}
              className="w-full p-2 border rounded-lg"
              placeholder="Cari nama atau NIS..."
            />
          </div>

          {/* Filter Kelas */}
          <div>
            <label className="block text-sm font-medium mb-1">
              Pilih Kelas
            </label>
            <select
              name="class"
              value={filters.class}
              onChange={handleFilterChange}
              className="w-full p-2 border rounded-lg">
              <option value="Semua Kelas">Semua Kelas</option>
              <option value="7A">Kelas 7A</option>
              <option value="7B">Kelas 7B</option>
              <option value="7C">Kelas 7C</option>
              <option value="7D">Kelas 7D</option>
              <option value="7E">Kelas 7E</option>
              <option value="7F">Kelas 7F</option>
            </select>
          </div>

          {/* Filter Jenis Kelamin */}
          <div>
            <label className="block text-sm font-medium mb-1">
              Pilih Jenis Kelamin
            </label>
            <select
              name="gender"
              value={filters.gender}
              onChange={handleFilterChange}
              className="w-full p-2 border rounded-lg">
              <option value="Semua">Semua</option>
              <option value="L">Laki-laki</option>
              <option value="P">Perempuan</option>
            </select>
          </div>

          {/* Reset Filter */}
          <div className="flex items-end">
            <button
              onClick={resetAllFilters}
              className="bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600 w-full">
              Reset Filter
            </button>
          </div>

          {/* Tambah Siswa */}
          <div className="flex items-end">
            <button
              onClick={() => setShowForm(true)}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 w-full">
              + Tambah Siswa
            </button>
          </div>
        </div>
      </div>

      {/* Form */}
      {showForm && (
        <div className="mb-6 p-4 border rounded-lg bg-gray-50">
          <h3 className="text-lg font-semibold mb-4">
            {editingId ? "Edit Siswa" : "Tambah Siswa Baru"}
          </h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">
                Nama Siswa
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                required
                className="w-full p-2 border rounded-lg"
                placeholder="Nama lengkap siswa"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">NIS</label>
              <input
                type="text"
                name="student_id"
                value={formData.student_id}
                onChange={handleInputChange}
                className="w-full p-2 border rounded-lg"
                placeholder="Nomor Induk Siswa"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">
                Jenis Kelamin
              </label>
              <select
                name="jenis_kelamin"
                value={formData.jenis_kelamin}
                onChange={handleInputChange}
                className="w-full p-2 border rounded-lg">
                <option value="L">Laki-laki</option>
                <option value="P">Perempuan</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Kelas</label>
              <select
                name="class"
                value={formData.class}
                onChange={handleInputChange}
                className="w-full p-2 border rounded-lg">
                <option value="7A">7A</option>
                <option value="7B">7B</option>
                <option value="7C">7C</option>
                <option value="7D">7D</option>
                <option value="7E">7E</option>
                <option value="7F">7F</option>
              </select>
            </div>

            <div className="flex items-center">
              <input
                type="checkbox"
                name="active"
                checked={formData.active}
                onChange={handleInputChange}
                className="mr-2"
              />
              <label className="text-sm font-medium">Aktif</label>
            </div>

            <div className="flex space-x-2">
              <button
                type="submit"
                disabled={loading}
                className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 disabled:opacity-50">
                {loading ? "Loading..." : editingId ? "Update" : "Simpan"}
              </button>
              <button
                type="button"
                onClick={resetForm}
                className="bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600">
                Batal
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Table */}
      <div className="overflow-x-auto">
        <div className="mb-4 text-sm text-gray-600">
          Menampilkan {filteredStudents.length} dari {students.length} siswa
        </div>
        <table className="min-w-full table-auto">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-2 text-left">No.</th>
              <th className="px-4 py-2 text-left">Nama</th>
              <th className="px-4 py-2 text-left">NIS</th>
              <th className="px-4 py-2 text-left">Jenis Kelamin</th>
              <th className="px-4 py-2 text-left">Kelas</th>
              <th className="px-4 py-2 text-left">Status</th>
              <th className="px-4 py-2 text-left">Aksi</th>
            </tr>
          </thead>
          <tbody>
            {filteredStudents.map((student, index) => (
              <tr
                key={student.student_id}
                className="border-b hover:bg-gray-50">
                <td className="px-4 py-2">{index + 1}</td>
                <td className="px-4 py-2">{student.name}</td>
                <td className="px-4 py-2">{student.student_id}</td>
                <td className="px-4 py-2">
                  {student.jenis_kelamin === "L" ? "Laki-laki" : "Perempuan"}
                </td>
                <td className="px-4 py-2">{student.class}</td>
                <td className="px-4 py-2">
                  <span
                    className={`px-2 py-1 rounded-full text-xs ${
                      student.active
                        ? "bg-green-100 text-green-800"
                        : "bg-red-100 text-red-800"
                    }`}>
                    {student.active ? "Aktif" : "Tidak Aktif"}
                  </span>
                </td>
                <td className="px-4 py-2 space-x-2">
                  <button
                    onClick={() => handleEdit(student)}
                    className="bg-yellow-500 text-white px-3 py-1 rounded text-sm hover:bg-yellow-600">
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(student.student_id)}
                    className="bg-red-500 text-white px-3 py-1 rounded text-sm hover:bg-red-600">
                    Hapus
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {filteredStudents.length === 0 && !loading && (
          <p className="text-center py-4 text-gray-500">Tidak ada data siswa</p>
        )}

        {loading && (
          <p className="text-center py-4 text-gray-500">Loading...</p>
        )}
      </div>
    </div>
  );
}
