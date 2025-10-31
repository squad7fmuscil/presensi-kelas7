// AttendanceModal.js - Modal Preview Rekap Only
import React, { useState, useEffect } from "react";
import { supabase } from "../supabaseClient";

const AttendanceModal = ({
  showModal,
  onClose,
  attendanceMode,
  selectedClass,
  selectedSubject,
  homeroomClass,
  students,
  onShowToast,
}) => {
  const [rekapData, setRekapData] = useState([]);
  const [rekapLoading, setRekapLoading] = useState(false);
  const [attendanceDates, setAttendanceDates] = useState([]);

  // Filter states
  const [selectedMonth, setSelectedMonth] = useState(
    () => new Date().getMonth() + 1
  );
  const [selectedYear, setSelectedYear] = useState(() =>
    new Date().getFullYear()
  );
  const [periodType, setPeriodType] = useState("month");
  const [semester, setSemester] = useState("ganjil");
  const [dateRange, setDateRange] = useState([null, null]);

  // Generate year options
  const yearOptions = [];
  const maxYear = 2030;
  for (let year = 2024; year <= maxYear; year++) {
    yearOptions.push(year);
  }
  const currentYear = new Date().getFullYear();
  if (currentYear > 2030 && !yearOptions.includes(currentYear)) {
    yearOptions.push(currentYear);
  }
  yearOptions.sort((a, b) => a - b);

  // Month options
  const monthOptions = [
    { value: 1, label: "Januari" },
    { value: 2, label: "Februari" },
    { value: 3, label: "Maret" },
    { value: 4, label: "April" },
    { value: 5, label: "Mei" },
    { value: 6, label: "Juni" },
    { value: 7, label: "Juli" },
    { value: 8, label: "Agustus" },
    { value: 9, label: "September" },
    { value: 10, label: "Oktober" },
    { value: 11, label: "November" },
    { value: 12, label: "Desember" },
  ];

  // Semester options
  const semesterOptions = [
    { value: "ganjil", label: "Ganjil" },
    { value: "genap", label: "Genap" },
  ];

  // Normalize status function
  const normalizeStatus = (status) => {
    if (!status) return null;
    const normalized = status.toString().toLowerCase().trim();
    if (normalized === "alpha") return "alpa";
    return normalized;
  };

  // Get date range based on period type
  const getDateRangeFromPeriod = () => {
    switch (periodType) {
      case "month":
        const lastDay = new Date(selectedYear, selectedMonth, 0).getDate();
        return {
          startDate: `${selectedYear}-${String(selectedMonth).padStart(
            2,
            "0"
          )}-01`,
          endDate: `${selectedYear}-${String(selectedMonth).padStart(
            2,
            "0"
          )}-${String(lastDay).padStart(2, "0")}`,
        };

      case "semester":
        const semesterStartMonth = semester === "ganjil" ? 7 : 1;
        const semesterEndMonth = semester === "ganjil" ? 12 : 6;
        const semesterYear =
          semester === "ganjil" ? selectedYear : selectedYear;
        return {
          startDate: `${semesterYear}-${String(semesterStartMonth).padStart(
            2,
            "0"
          )}-01`,
          endDate: `${semesterYear}-${String(semesterEndMonth).padStart(
            2,
            "0"
          )}-${String(
            new Date(semesterYear, semesterEndMonth, 0).getDate()
          ).padStart(2, "0")}`,
        };

      case "custom":
        if (!dateRange[0] || !dateRange[1]) return null;
        return {
          startDate: dateRange[0].toISOString().split("T")[0],
          endDate: dateRange[1].toISOString().split("T")[0],
        };

      default:
        return null;
    }
  };

  // Fetch rekap data
  const fetchRekapData = async () => {
    if (
      (attendanceMode === "subject" && (!selectedClass || !selectedSubject)) ||
      (attendanceMode === "daily" && !homeroomClass)
    ) {
      onShowToast?.("Pilih kelas dan mata pelajaran terlebih dahulu!", "error");
      return;
    }

    if (!students || students.length === 0) {
      onShowToast?.("Data siswa tidak tersedia!", "error");
      return;
    }

    const dateRange = getDateRangeFromPeriod();
    if (!dateRange) {
      onShowToast?.("Pilih periode yang valid!", "error");
      return;
    }

    setRekapLoading(true);
    try {
      const classFilter =
        attendanceMode === "subject" ? selectedClass : homeroomClass;

      let typeFilter, mapelFilter;

      if (attendanceMode === "subject") {
        typeFilter = "mapel";
        mapelFilter = selectedSubject;
      } else {
        typeFilter = "walikelas";
        mapelFilter = null;
      }

      let query = supabase
        .from("attendance")
        .select("student_id, status, date, class, mapel, type")
        .eq("class", classFilter)
        .eq("type", typeFilter)
        .gte("date", dateRange.startDate)
        .lte("date", dateRange.endDate);

      if (mapelFilter === null) {
        query = query.is("mapel", null);
      } else {
        query = query.eq("mapel", mapelFilter);
      }

      const { data: attendanceData, error: attendanceError } = await query;

      if (attendanceError) {
        throw attendanceError;
      }

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

      const finalData = Object.values(studentSummary);

      const uniqueDates = [
        ...new Set(attendanceData?.map((r) => r.date) || []),
      ].sort();
      setAttendanceDates(uniqueDates);

      setRekapData(finalData);

      if (finalData.length > 0) {
        onShowToast?.(
          `✅ Data rekap berhasil dimuat: ${finalData.length} siswa`,
          "success"
        );
      } else {
        onShowToast?.("❌ Tidak ada data untuk ditampilkan", "warning");
      }
    } catch (error) {
      console.error("❌ Error in fetchRekapData:", error);
      onShowToast?.("❌ Gagal memuat data rekap: " + error.message, "error");
      setRekapData([]);
    } finally {
      setRekapLoading(false);
    }
  };

  // Helper functions
  const getPeriodLabel = () => {
    switch (periodType) {
      case "month":
        return `${
          monthOptions.find((m) => m.value === selectedMonth)?.label
        } ${selectedYear}`;
      case "semester":
        return `Semester ${semester} ${selectedYear}`;
      case "custom":
        return dateRange[0] && dateRange[1]
          ? `${dateRange[0].toLocaleDateString(
              "id-ID"
            )} - ${dateRange[1].toLocaleDateString("id-ID")}`
          : "Custom Range";
      default:
        return "Unknown Period";
    }
  };

  const getStatusBadge = (status) => {
    if (!status) return <span className="text-gray-400">-</span>;

    const normalized = normalizeStatus(status);
    const statusMap = {
      hadir: { text: "H", color: "bg-green-500 text-white" },
      sakit: { text: "S", color: "bg-yellow-500 text-white" },
      izin: { text: "I", color: "bg-blue-500 text-white" },
      alpa: { text: "A", color: "bg-red-500 text-white" },
    };

    const statusInfo = statusMap[normalized] || {
      text: "-",
      color: "bg-gray-200 text-gray-500",
    };

    return (
      <span
        className={`inline-block px-2 py-1 rounded text-xs font-bold ${statusInfo.color}`}>
        {statusInfo.text}
      </span>
    );
  };

  const formatDateHeader = (dateStr) => {
    const date = new Date(dateStr + "T00:00:00");
    const day = date.getDate();
    const month = date.getMonth() + 1;
    return `${day}/${month}`;
  };

  useEffect(() => {
    if (showModal) {
      fetchRekapData();
    }
  }, [showModal, periodType, selectedMonth, selectedYear, semester]);

  if (!showModal) return null;

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-2 sm:p-4"
      onClick={onClose}>
      <div
        className="bg-white rounded-lg sm:rounded-xl w-full max-w-7xl max-h-[95vh] sm:max-h-[90vh] overflow-hidden flex flex-col"
        onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-500 to-blue-600 text-white px-4 py-3 flex justify-between items-center flex-shrink-0">
          <div className="flex items-center gap-3">
            <h2 className="text-lg font-bold">📊 Preview Rekap Presensi</h2>
            <span className="text-xs bg-white/20 px-2 py-1 rounded">
              {attendanceMode === "subject" ? selectedClass : homeroomClass} |{" "}
              {attendanceMode === "subject" ? selectedSubject : "Harian"}
            </span>
          </div>
          <button
            className="text-white hover:bg-white/20 w-8 h-8 rounded-lg transition flex items-center justify-center text-xl"
            onClick={onClose}>
            ✕
          </button>
        </div>

        {/* Filter Section */}
        <div className="border-b border-gray-200 bg-gray-50 flex-shrink-0 px-4 py-3">
          <div className="flex items-center gap-2 flex-wrap">
            <select
              value={periodType}
              onChange={(e) => setPeriodType(e.target.value)}
              className="px-2 py-1.5 border border-gray-300 rounded text-sm">
              <option value="month">Bulanan</option>
              <option value="semester">Semester</option>
              <option value="custom">Custom</option>
            </select>

            {periodType === "month" && (
              <>
                <select
                  value={selectedMonth}
                  onChange={(e) => setSelectedMonth(parseInt(e.target.value))}
                  className="px-2 py-1.5 border border-gray-300 rounded text-sm">
                  {monthOptions.map((m) => (
                    <option key={m.value} value={m.value}>
                      {m.label}
                    </option>
                  ))}
                </select>
                <select
                  value={selectedYear}
                  onChange={(e) => setSelectedYear(parseInt(e.target.value))}
                  className="px-2 py-1.5 border border-gray-300 rounded text-sm">
                  {yearOptions.map((y) => (
                    <option key={y} value={y}>
                      {y}
                    </option>
                  ))}
                </select>
              </>
            )}

            {periodType === "semester" && (
              <>
                <select
                  value={semester}
                  onChange={(e) => setSemester(e.target.value)}
                  className="px-2 py-1.5 border border-gray-300 rounded text-sm">
                  {semesterOptions.map((s) => (
                    <option key={s.value} value={s.value}>
                      {s.label}
                    </option>
                  ))}
                </select>
                <select
                  value={selectedYear}
                  onChange={(e) => setSelectedYear(parseInt(e.target.value))}
                  className="px-2 py-1.5 border border-gray-300 rounded text-sm">
                  {yearOptions.map((y) => (
                    <option key={y} value={y}>
                      {y}
                    </option>
                  ))}
                </select>
              </>
            )}

            {periodType === "custom" && (
              <>
                <input
                  type="date"
                  value={dateRange[0]?.toISOString().split("T")[0] || ""}
                  onChange={(e) =>
                    setDateRange([new Date(e.target.value), dateRange[1]])
                  }
                  className="px-2 py-1.5 border border-gray-300 rounded text-sm"
                />
                <span className="text-sm text-gray-500">-</span>
                <input
                  type="date"
                  value={dateRange[1]?.toISOString().split("T")[0] || ""}
                  onChange={(e) =>
                    setDateRange([dateRange[0], new Date(e.target.value)])
                  }
                  className="px-2 py-1.5 border border-gray-300 rounded text-sm"
                />
              </>
            )}

            <button
              onClick={fetchRekapData}
              disabled={rekapLoading}
              className="px-4 py-1.5 bg-blue-500 text-white rounded text-sm hover:bg-blue-600 disabled:opacity-50">
              {rekapLoading ? "⏳" : "Terapkan"}
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 p-3 flex flex-col min-h-0">
          {/* Header Info */}
          <div className="mb-2 text-center bg-blue-50 border-l-4 border-blue-500 px-3 py-2 flex-shrink-0">
            <p className="text-sm font-semibold text-blue-800">
              {getPeriodLabel()} • {rekapData.length} Siswa •{" "}
              {attendanceDates.length} Hari
            </p>
          </div>

          {/* Data Table */}
          {rekapLoading ? (
            <div className="flex items-center justify-center p-8 text-gray-500">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500 mr-3"></div>
              Memuat data...
            </div>
          ) : (
            <div className="flex-1 border border-gray-300 rounded bg-white shadow-sm flex flex-col min-h-0">
              <div className="flex-1 overflow-auto min-h-0">
                <table className="w-full text-xs border-collapse">
                  <thead className="bg-gray-100 sticky top-0 z-20">
                    <tr className="border-b-2 border-gray-400">
                      <th className="p-2 text-center font-bold text-gray-800 border-r-2 border-gray-300 sticky left-0 bg-gray-100 z-30 min-w-[40px]">
                        No
                      </th>
                      <th className="p-2 text-left font-bold text-gray-800 border-r-2 border-gray-300 sticky left-[40px] bg-gray-100 z-30 min-w-[180px]">
                        Nama Siswa
                      </th>

                      {attendanceDates.map((date, index) => (
                        <th
                          key={date}
                          className={`p-2 text-center font-bold text-gray-800 min-w-[45px] whitespace-nowrap ${
                            index < attendanceDates.length - 1
                              ? "border-r border-gray-300"
                              : "border-r-2 border-gray-400"
                          }`}>
                          {formatDateHeader(date)}
                        </th>
                      ))}

                      <th className="p-2 text-center font-bold text-green-700 border-r border-gray-300 min-w-[40px] bg-green-50">
                        H
                      </th>
                      <th className="p-2 text-center font-bold text-blue-700 border-r border-gray-300 min-w-[40px] bg-blue-50">
                        I
                      </th>
                      <th className="p-2 text-center font-bold text-yellow-700 border-r border-gray-300 min-w-[40px] bg-yellow-50">
                        S
                      </th>
                      <th className="p-2 text-center font-bold text-red-700 border-r-2 border-gray-400 min-w-[40px] bg-red-50">
                        A
                      </th>
                      <th className="p-2 text-center font-bold text-gray-800 border-r border-gray-300 min-w-[45px]">
                        Total
                      </th>
                      <th className="p-2 text-center font-bold text-gray-800 min-w-[50px]">
                        %
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {rekapData.length > 0 ? (
                      rekapData.map((student) => (
                        <tr
                          key={student.studentId}
                          className="border-b border-gray-200 hover:bg-blue-50 transition">
                          <td className="p-2 text-center border-r-2 border-gray-300 sticky left-0 bg-white z-10 font-medium">
                            {student.no}
                          </td>
                          <td className="p-2 font-medium text-gray-800 border-r-2 border-gray-300 sticky left-[40px] bg-white z-10">
                            {student.name}
                          </td>

                          {attendanceDates.map((date, index) => (
                            <td
                              key={date}
                              className={`p-2 text-center ${
                                index < attendanceDates.length - 1
                                  ? "border-r border-gray-200"
                                  : "border-r-2 border-gray-400"
                              }`}>
                              {getStatusBadge(student.dailyStatus[date])}
                            </td>
                          ))}

                          <td className="p-2 text-center text-green-700 font-bold border-r border-gray-200 bg-green-50/50">
                            {student.hadir}
                          </td>
                          <td className="p-2 text-center text-blue-700 font-bold border-r border-gray-200 bg-blue-50/50">
                            {student.izin}
                          </td>
                          <td className="p-2 text-center text-yellow-700 font-bold border-r border-gray-200 bg-yellow-50/50">
                            {student.sakit}
                          </td>
                          <td className="p-2 text-center text-red-700 font-bold border-r-2 border-gray-400 bg-red-50/50">
                            {student.alpa}
                          </td>
                          <td className="p-2 text-center font-bold text-gray-800 border-r border-gray-200">
                            {student.total}
                          </td>
                          <td className="p-2 text-center font-bold text-gray-800">
                            {student.percentage}
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td
                          colSpan={attendanceDates.length + 8}
                          className="p-8 text-center text-gray-500">
                          <div className="text-4xl mb-3">📅</div>
                          <h4 className="font-semibold mb-2">Belum Ada Data</h4>
                          <p className="text-sm">
                            Belum ada data presensi untuk periode ini
                          </p>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="bg-gray-50 px-4 py-3 border-t border-gray-200 flex justify-end flex-shrink-0">
          <button
            className="px-5 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition font-medium"
            onClick={onClose}>
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
};

export default AttendanceModal;
