import { useState, useEffect } from "react";
import { supabase } from "../supabaseClient";
import AttendanceModal from "./AttendanceModal";
import { exportToExcel } from "./AttendanceExcel";

export default function Attendance() {
  const [students, setStudents] = useState([]);
  const [filteredStudents, setFilteredStudents] = useState([]);
  const [attendanceData, setAttendanceData] = useState({});
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [existingAttendance, setExistingAttendance] = useState([]);
  const [showRecapModal, setShowRecapModal] = useState(false);
  const [exporting, setExporting] = useState(false);

  // Filters
  const [filters, setFilters] = useState({
    class: "7F",
    type: "walikelas",
    date: new Date().toISOString().split("T")[0],
    mapel: "Bahasa Inggris",
  });

  // Current semester & academic year
  const currentSemester = "ganjil";
  const currentAcademicYear = "2024/2025";

  // Fetch students based on filters
  const fetchStudents = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("students")
        .select("*")
        .eq("class", filters.class)
        .eq("active", true)
        .order("name");

      if (error) throw error;
      setStudents(data || []);
      setFilteredStudents(data || []);
    } catch (error) {
      console.error("Error fetching students:", error);
      showNotification("error", "Error memuat data siswa: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  // Fetch existing attendance for selected date
  const fetchExistingAttendance = async () => {
    try {
      const { data, error } = await supabase
        .from("attendance")
        .select("*")
        .eq("class", filters.class)
        .eq("date", filters.date)
        .eq("type", filters.type)
        .eq("mapel", filters.type === "mapel" ? filters.mapel : null);

      if (error) throw error;

      setExistingAttendance(data || []);

      // Convert to object for easy access
      const attendanceObj = {};
      data?.forEach((item) => {
        attendanceObj[item.student_id] = {
          status: item.status,
          notes: item.notes,
        };
      });
      setAttendanceData(attendanceObj);
    } catch (error) {
      console.error("Error fetching attendance:", error);
      showNotification("error", "Error memuat data presensi: " + error.message);
    }
  };

  useEffect(() => {
    fetchStudents();
    fetchExistingAttendance();
  }, [filters.class, filters.date, filters.type]);

  // Handle filter changes
  const handleFilterChange = (e) => {
    const { name, value } = e.target;

    if (name === "type") {
      setFilters((prev) => ({
        ...prev,
        [name]: value,
        class: value === "walikelas" ? "7F" : prev.class,
      }));
    } else {
      setFilters((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  // Handle attendance status change
  const handleStatusChange = (studentId, status) => {
    setAttendanceData((prev) => ({
      ...prev,
      [studentId]: {
        ...prev[studentId],
        status: status,
        notes: status === "hadir" ? "" : prev[studentId]?.notes || "",
      },
    }));
  };

  // Handle notes change
  const handleNotesChange = (studentId, notes) => {
    setAttendanceData((prev) => ({
      ...prev,
      [studentId]: {
        ...prev[studentId],
        notes: notes,
      },
    }));
  };

  // Check if attendance already exists for this date/class/type
  const checkExistingAttendance = () => {
    return existingAttendance.length > 0;
  };

  // Show notification
  const showNotification = (type, message) => {
    const bgColor = type === "error" ? "bg-red-500" : "bg-green-500";
    const notification = document.createElement("div");
    notification.className = `fixed top-4 right-4 ${bgColor} text-white px-6 py-3 rounded-lg shadow-lg z-50 transform transition-transform duration-300`;
    notification.textContent = message;

    document.body.appendChild(notification);

    setTimeout(() => {
      notification.style.transform = "translateX(100%)";
      setTimeout(() => {
        document.body.removeChild(notification);
      }, 300);
    }, 5000);
  };

  // Save attendance
  const saveAttendance = async () => {
    const studentsWithoutStatus = students.filter(
      (student) => !attendanceData[student.student_id]?.status
    );

    if (studentsWithoutStatus.length > 0) {
      showNotification(
        "error",
        `Ada ${studentsWithoutStatus.length} siswa yang belum dipilih status kehadirannya!`
      );
      return;
    }

    setSaving(true);
    try {
      const attendanceRecords = students.map((student) => ({
        student_id: student.student_id,
        class: filters.class,
        date: filters.date,
        status: attendanceData[student.student_id]?.status || "alpha",
        notes: attendanceData[student.student_id]?.notes || "",
        type: filters.type,
        mapel: filters.type === "mapel" ? filters.mapel : null,
        teacher: "Guru B.Inggris",
        semester: currentSemester,
        academic_year: currentAcademicYear,
      }));

      const existingCount = existingAttendance.length;

      if (existingCount > 0) {
        const confirmOverwrite = window.confirm(
          `Presensi untuk ${filters.date} sudah ada (${existingCount} data). Apakah Anda ingin mengganti dengan data yang baru?`
        );

        if (!confirmOverwrite) {
          setSaving(false);
          return;
        }

        const { error: deleteError } = await supabase
          .from("attendance")
          .delete()
          .eq("class", filters.class)
          .eq("date", filters.date)
          .eq("type", filters.type)
          .eq("mapel", filters.type === "mapel" ? filters.mapel : null);

        if (deleteError) throw deleteError;
      }

      const { error: insertError } = await supabase
        .from("attendance")
        .insert(attendanceRecords);

      if (insertError) throw insertError;

      showNotification(
        "success",
        `Presensi berhasil disimpan! (${
          existingCount > 0 ? "Diperbarui" : "Ditambahkan"
        })`
      );
      fetchExistingAttendance();
    } catch (error) {
      console.error("Error saving attendance:", error);
      showNotification("error", "Error menyimpan presensi: " + error.message);
    } finally {
      setSaving(false);
    }
  };

  // Quick select all hadir
  const quickSelectAllHadir = () => {
    const newAttendanceData = { ...attendanceData };
    students.forEach((student) => {
      newAttendanceData[student.student_id] = {
        status: "hadir",
        notes: "",
      };
    });
    setAttendanceData(newAttendanceData);
    showNotification("success", "Semua siswa diatur sebagai Hadir");
  };

  // Handle Direct Export Excel
  const handleDirectExport = async () => {
    setExporting(true);
    showNotification("success", "Memproses export Excel...");

    try {
      // Get current month data
      const currentDate = new Date();
      const year = currentDate.getFullYear();
      const month = currentDate.getMonth() + 1;
      const lastDay = new Date(year, month, 0).getDate();

      const startDate = `${year}-${String(month).padStart(2, "0")}-01`;
      const endDate = `${year}-${String(month).padStart(2, "0")}-${String(
        lastDay
      ).padStart(2, "0")}`;

      const classFilter = filters.type === "walikelas" ? "7F" : filters.class;
      const typeFilter = filters.type === "walikelas" ? "walikelas" : "mapel";
      const mapelFilter = filters.type === "mapel" ? filters.mapel : null;

      let query = supabase
        .from("attendance")
        .select("student_id, status, date, class, mapel, type")
        .eq("class", classFilter)
        .eq("type", typeFilter)
        .gte("date", startDate)
        .lte("date", endDate);

      if (mapelFilter === null) {
        query = query.is("mapel", null);
      } else {
        query = query.eq("mapel", mapelFilter);
      }

      const { data: attendanceData, error } = await query;

      if (error) throw error;

      // Process data
      const normalizeStatus = (status) => {
        if (!status) return null;
        const normalized = status.toString().toLowerCase().trim();
        return normalized === "alpha" ? "alpa" : normalized;
      };

      const studentSummary = {};
      students.forEach((student, index) => {
        studentSummary[student.student_id] = {
          no: index + 1,
          studentId: student.student_id,
          name: student.name,
          nis: student.student_id,
          dailyStatus: {},
          hadir: 0,
          sakit: 0,
          izin: 0,
          alpa: 0,
          total: 0,
          percentage: "0%",
        };
      });

      if (attendanceData && attendanceData.length > 0) {
        attendanceData.forEach((record) => {
          if (studentSummary[record.student_id]) {
            const status = normalizeStatus(record.status);
            studentSummary[record.student_id].dailyStatus[record.date] = status;

            if (status === "hadir") studentSummary[record.student_id].hadir++;
            else if (status === "sakit")
              studentSummary[record.student_id].sakit++;
            else if (status === "izin")
              studentSummary[record.student_id].izin++;
            else if (status === "alpa")
              studentSummary[record.student_id].alpa++;
          }
        });
      }

      Object.keys(studentSummary).forEach((studentId) => {
        const student = studentSummary[studentId];
        student.total =
          student.hadir + student.sakit + student.izin + student.alpa;
        student.percentage =
          student.total > 0
            ? `${Math.round((student.hadir / student.total) * 100)}%`
            : "0%";
      });

      const rekapData = Object.values(studentSummary);
      const attendanceDates = [
        ...new Set(attendanceData?.map((r) => r.date) || []),
      ].sort();

      // Month names
      const monthNames = [
        "Januari",
        "Februari",
        "Maret",
        "April",
        "Mei",
        "Juni",
        "Juli",
        "Agustus",
        "September",
        "Oktober",
        "November",
        "Desember",
      ];

      // Export
      await exportToExcel({
        rekapData,
        attendanceDates,
        getPeriodLabel: () => `${monthNames[month - 1]} ${year}`,
        attendanceMode: filters.type === "walikelas" ? "daily" : "subject",
        selectedClass: filters.class,
        homeroomClass: "7F",
        selectedSubject: filters.mapel,
      });

      showNotification("success", "✅ File Excel berhasil diunduh!");
    } catch (error) {
      console.error("Export error:", error);
      showNotification("error", "❌ Gagal export Excel: " + error.message);
    } finally {
      setExporting(false);
    }
  };

  // Get status count
  const getStatusCount = (status) => {
    return students.filter(
      (student) => attendanceData[student.student_id]?.status === status
    ).length;
  };

  // Status colors
  const statusCardColors = {
    hadir: "bg-green-500 hover:bg-green-600",
    izin: "bg-yellow-500 hover:bg-yellow-600",
    sakit: "bg-blue-500 hover:bg-blue-600",
    alpha: "bg-red-500 hover:bg-red-600",
  };

  const statusSelectedColors = {
    hadir: "ring-2 ring-green-500 bg-green-100 border-green-500 text-green-800",
    izin: "ring-2 ring-yellow-500 bg-yellow-100 border-yellow-500 text-yellow-800",
    sakit: "ring-2 ring-blue-500 bg-blue-100 border-blue-500 text-blue-800",
    alpha: "ring-2 ring-red-500 bg-red-100 border-red-500 text-red-800",
  };

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Presensi Siswa</h2>
        <div className="text-sm text-gray-600">
          {filters.type === "walikelas" ? "Wali Kelas" : "Guru Mapel"} •{" "}
          {filters.class}
          {checkExistingAttendance() && (
            <span className="ml-2 bg-yellow-100 text-yellow-800 px-2 py-1 rounded text-xs">
              Data Sudah Ada
            </span>
          )}
        </div>
      </div>

      {/* Filters */}
      <div className="bg-gray-50 p-4 rounded-lg mb-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">
              Jenis Presensi
            </label>
            <select
              name="type"
              value={filters.type}
              onChange={handleFilterChange}
              className="w-full p-2 border rounded-lg">
              <option value="walikelas">Wali Kelas</option>
              <option value="mapel">Guru Mapel</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Kelas</label>
            <select
              name="class"
              value={filters.class}
              onChange={handleFilterChange}
              disabled={filters.type === "walikelas"}
              className={`w-full p-2 border rounded-lg ${
                filters.type === "walikelas" ? "bg-gray-100 text-gray-500" : ""
              }`}>
              <option value="7A">7A</option>
              <option value="7B">7B</option>
              <option value="7C">7C</option>
              <option value="7D">7D</option>
              <option value="7E">7E</option>
              <option value="7F">7F</option>
            </select>
            {filters.type === "walikelas" && (
              <p className="text-xs text-gray-500 mt-1">
                Otomatis 7F untuk Wali Kelas
              </p>
            )}
          </div>

          {filters.type === "mapel" && (
            <div>
              <label className="block text-sm font-medium mb-1">
                Mata Pelajaran
              </label>
              <select
                name="mapel"
                value={filters.mapel}
                onChange={handleFilterChange}
                className="w-full p-2 border rounded-lg">
                <option value="Bahasa Inggris">Bahasa Inggris</option>
              </select>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium mb-1">Tanggal</label>
            <input
              type="date"
              name="date"
              value={filters.date}
              onChange={handleFilterChange}
              className="w-full p-2 border rounded-lg"
            />
          </div>
        </div>
      </div>

      {/* Action Buttons - DIPISAH 4 BUTTON */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <button
          onClick={quickSelectAllHadir}
          className="bg-green-500 text-white py-3 rounded-lg hover:bg-green-600 transition font-medium">
          ✅ Hadir Semua
        </button>
        <button
          onClick={saveAttendance}
          disabled={saving}
          className="bg-blue-500 text-white py-3 rounded-lg hover:bg-blue-600 disabled:opacity-50 transition font-medium">
          {saving ? "💾 Menyimpan..." : "💾 Simpan Presensi"}
        </button>
        <button
          onClick={() => setShowRecapModal(true)}
          className="bg-purple-500 text-white py-3 rounded-lg hover:bg-purple-600 transition font-medium">
          📊 Lihat Rekap
        </button>
        <button
          onClick={handleDirectExport}
          disabled={exporting}
          className="bg-emerald-500 text-white py-3 rounded-lg hover:bg-emerald-600 disabled:opacity-50 transition font-medium">
          {exporting ? "⏳ Exporting..." : "📥 Export Excel"}
        </button>
      </div>

      {/* Status Summary */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-center">
          <div className="text-2xl font-bold text-green-600">
            {getStatusCount("hadir")}
          </div>
          <div className="text-sm text-green-800">Hadir</div>
        </div>
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 text-center">
          <div className="text-2xl font-bold text-yellow-600">
            {getStatusCount("izin")}
          </div>
          <div className="text-sm text-yellow-800">Izin</div>
        </div>
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-center">
          <div className="text-2xl font-bold text-blue-600">
            {getStatusCount("sakit")}
          </div>
          <div className="text-sm text-blue-800">Sakit</div>
        </div>
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-center">
          <div className="text-2xl font-bold text-red-600">
            {getStatusCount("alpha")}
          </div>
          <div className="text-sm text-red-800">Alpha</div>
        </div>
      </div>

      {/* Attendance Table */}
      <div className="overflow-x-auto">
        <table className="min-w-full table-auto">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-2 text-left">No.</th>
              <th className="px-4 py-2 text-left">NIS</th>
              <th className="px-4 py-2 text-left">Nama Siswa</th>
              <th className="px-4 py-2 text-left">Status Kehadiran</th>
              <th className="px-4 py-2 text-left">Keterangan</th>
            </tr>
          </thead>
          <tbody>
            {students.map((student, index) => (
              <tr
                key={student.student_id}
                className="border-b hover:bg-gray-50">
                <td className="px-4 py-2">{index + 1}</td>
                <td className="px-4 py-2">{student.student_id}</td>
                <td className="px-4 py-2">{student.name}</td>
                <td className="px-4 py-2">
                  <div className="flex space-x-2">
                    {["hadir", "sakit", "izin", "alpha"].map((status) => (
                      <button
                        key={status}
                        onClick={() =>
                          handleStatusChange(student.student_id, status)
                        }
                        className={`px-4 py-2 rounded-lg font-medium transition ${
                          attendanceData[student.student_id]?.status === status
                            ? statusSelectedColors[status]
                            : `${statusCardColors[status]} text-white`
                        }`}>
                        {status.charAt(0).toUpperCase() + status.slice(1)}
                      </button>
                    ))}
                  </div>
                </td>
                <td className="px-4 py-2">
                  <input
                    type="text"
                    placeholder="Keterangan..."
                    value={attendanceData[student.student_id]?.notes || ""}
                    onChange={(e) =>
                      handleNotesChange(student.student_id, e.target.value)
                    }
                    className="w-full p-2 border rounded-lg"
                    disabled={
                      attendanceData[student.student_id]?.status === "hadir"
                    }
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {students.length === 0 && !loading && (
          <p className="text-center py-4 text-gray-500">Tidak ada data siswa</p>
        )}

        {loading && (
          <p className="text-center py-4 text-gray-500">Memuat data...</p>
        )}
      </div>

      {/* Modal - HANYA PREVIEW */}
      <AttendanceModal
        showModal={showRecapModal}
        onClose={() => setShowRecapModal(false)}
        attendanceMode={filters.type === "walikelas" ? "daily" : "subject"}
        selectedClass={filters.class}
        selectedSubject={filters.mapel}
        homeroomClass="7F"
        students={students}
        onShowToast={showNotification}
      />
    </div>
  );
}
