// AttendanceModalExport.js - FIXED SCROLL VERSION
import React, { useState, useEffect } from "react";
import { supabase } from "../supabaseClient";
import ExcelJS from "exceljs";
import { saveAs } from "file-saver";

const AttendanceModalExport = ({
  showModal,
  onClose,
  attendanceMode,
  selectedClass,
  selectedSubject,
  homeroomClass,
  students,
  onShowToast,
}) => {
  const [activeTab, setActiveTab] = useState("preview");
  const [rekapData, setRekapData] = useState([]);
  const [rekapLoading, setRekapLoading] = useState(false);
  const [exportLoading, setExportLoading] = useState(false);
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
    console.log("🚀 START fetchRekapData");

    if (
      (attendanceMode === "subject" && (!selectedClass || !selectedSubject)) ||
      (attendanceMode === "daily" && !homeroomClass)
    ) {
      onShowToast?.("Pilih kelas dan mata pelajaran terlebih dahulu!", "error");
      return;
    }

    if (!students || students.length === 0) {
      console.log("❌ Students data is empty!");
      onShowToast?.("Data siswa tidak tersedia!", "error");
      return;
    }

    const dateRange = getDateRangeFromPeriod();
    if (!dateRange) {
      onShowToast?.("Pilih periode yang valid!", "error");
      return;
    }

    console.log("🎯 PARAMETERS:", {
      studentsCount: students.length,
      classFilter: attendanceMode === "subject" ? selectedClass : homeroomClass,
      attendanceMode,
      dateRange,
      period: getPeriodLabel(),
    });

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

      console.log("🔍 QUERY FILTERS:", {
        class: classFilter,
        type: typeFilter,
        mapel: mapelFilter,
        startDate: dateRange.startDate,
        endDate: dateRange.endDate,
      });

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
        console.error("❌ Database error:", attendanceError);
        throw attendanceError;
      }

      console.log("📊 DATABASE RESULTS:", {
        totalRecords: attendanceData?.length || 0,
        sampleRecords: attendanceData?.slice(0, 3),
      });

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

      console.log(
        "👥 INITIALIZED STUDENTS:",
        Object.keys(studentSummary).length
      );

      if (attendanceData && attendanceData.length > 0) {
        attendanceData.forEach((record, index) => {
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
          } else {
            console.warn("⚠️ Student not found:", record.student_id);
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

      console.log("🎯 FINAL PROCESSING RESULTS:", {
        totalStudents: students.length,
        studentsInSummary: Object.keys(studentSummary).length,
        attendanceRecords: attendanceData?.length || 0,
        finalDataCount: finalData.length,
        uniqueDates: uniqueDates.length,
        sampleFinalData: finalData.slice(0, 3).map((s) => ({
          name: s.name,
          hadir: s.hadir,
          sakit: s.sakit,
          izin: s.izin,
          alpa: s.alpa,
        })),
      });

      setRekapData(finalData);

      if (finalData.length > 0) {
        onShowToast?.(
          `✅ Data rekap berhasil dimuat: ${finalData.length} siswa, ${
            attendanceData?.length || 0
          } records`,
          "success"
        );
      } else {
        onShowToast?.("❌ Tidak ada data yang bisa ditampilkan", "warning");
      }
    } catch (error) {
      console.error("❌ Error in fetchRekapData:", error);
      onShowToast?.("❌ Gagal memuat data rekap: " + error.message, "error");
      setRekapData([]);
    } finally {
      setRekapLoading(false);
      console.log("🏁 END fetchRekapData");
    }
  };

  // Export to Excel function
  const exportToExcel = async () => {
    if (!rekapData.length) {
      onShowToast?.("Tidak ada data untuk diexport!", "error");
      return;
    }

    setExportLoading(true);
    try {
      const workbook = new ExcelJS.Workbook();

      // ===== SHEET 1: SUMMARY =====
      const summarySheet = workbook.addWorksheet("Summary");

      // Title
      summarySheet.mergeCells("A1:F1");
      const titleCell = summarySheet.getCell("A1");
      titleCell.value = "REKAP ABSENSI - SUMMARY";
      titleCell.font = { size: 18, bold: true, color: { argb: "FFFFFFFF" } };
      titleCell.alignment = { horizontal: "center", vertical: "middle" };
      titleCell.fill = {
        type: "pattern",
        pattern: "solid",
        fgColor: { argb: "FF2563EB" },
      };
      summarySheet.getRow(1).height = 30;

      // Info Section
      summarySheet.getCell("A3").value = "Periode";
      summarySheet.getCell("B3").value = getPeriodLabel();
      summarySheet.getCell("A4").value = "Kelas";
      summarySheet.getCell("B4").value =
        attendanceMode === "subject" ? selectedClass : homeroomClass;
      summarySheet.getCell("A5").value = "Mata Pelajaran";
      summarySheet.getCell("B5").value =
        attendanceMode === "subject" ? selectedSubject : "Presensi Harian";

      // Style info section
      ["A3", "A4", "A5"].forEach((cell) => {
        summarySheet.getCell(cell).font = {
          bold: true,
          color: { argb: "FF1F2937" },
        };
        summarySheet.getCell(cell).fill = {
          type: "pattern",
          pattern: "solid",
          fgColor: { argb: "FFE5E7EB" },
        };
      });

      ["B3", "B4", "B5"].forEach((cell) => {
        summarySheet.getCell(cell).font = { color: { argb: "FF1F2937" } };
      });

      // Summary table header
      summarySheet.addRow([]);
      const summaryHeaderRow = summarySheet.addRow(["Kategori", "Jumlah"]);
      summaryHeaderRow.font = { bold: true, color: { argb: "FFFFFFFF" } };
      summaryHeaderRow.alignment = { horizontal: "center", vertical: "middle" };
      summaryHeaderRow.fill = {
        type: "pattern",
        pattern: "solid",
        fgColor: { argb: "FF3B82F6" },
      };
      summaryHeaderRow.height = 25;

      // Summary data
      const summaryData = [
        ["Total Siswa", rekapData.length],
        ["Total Hari", attendanceDates.length],
        ["Hadir", rekapData.reduce((sum, student) => sum + student.hadir, 0)],
        ["Sakit", rekapData.reduce((sum, student) => sum + student.sakit, 0)],
        ["Izin", rekapData.reduce((sum, student) => sum + student.izin, 0)],
        ["Alpa", rekapData.reduce((sum, student) => sum + student.alpa, 0)],
      ];

      summaryData.forEach((rowData, index) => {
        const row = summarySheet.addRow(rowData);
        row.alignment = { vertical: "middle" };

        // Alternating colors
        if (index % 2 === 0) {
          row.fill = {
            type: "pattern",
            pattern: "solid",
            fgColor: { argb: "FFF9FAFB" },
          };
        }

        // Color based on category
        const categoryCell = row.getCell(1);
        categoryCell.font = { bold: true };

        if (rowData[0] === "Hadir") {
          categoryCell.font = { bold: true, color: { argb: "FF10B981" } };
        } else if (rowData[0] === "Sakit") {
          categoryCell.font = { bold: true, color: { argb: "FFF59E0B" } };
        } else if (rowData[0] === "Izin") {
          categoryCell.font = { bold: true, color: { argb: "FF3B82F6" } };
        } else if (rowData[0] === "Alpa") {
          categoryCell.font = { bold: true, color: { argb: "FFEF4444" } };
        }

        row.getCell(2).font = { bold: true };
        row.getCell(2).alignment = { horizontal: "center", vertical: "middle" };
      });

      // Borders for summary table
      const summaryTableRange = `A7:B${7 + summaryData.length}`;
      summarySheet.getCell("A7").border = {
        top: { style: "medium" },
        left: { style: "medium" },
        right: { style: "thin" },
      };
      summarySheet.getCell("B7").border = {
        top: { style: "medium" },
        right: { style: "medium" },
      };

      for (let i = 0; i < summaryData.length; i++) {
        const rowNum = 8 + i;
        summarySheet.getCell(`A${rowNum}`).border = {
          left: { style: "medium" },
          right: { style: "thin" },
          bottom:
            i === summaryData.length - 1
              ? { style: "medium" }
              : { style: "thin" },
        };
        summarySheet.getCell(`B${rowNum}`).border = {
          right: { style: "medium" },
          bottom:
            i === summaryData.length - 1
              ? { style: "medium" }
              : { style: "thin" },
        };
      }

      // Column widths
      summarySheet.getColumn(1).width = 25;
      summarySheet.getColumn(2).width = 15;

      // ===== SHEET 2: DETAIL =====
      const detailSheet = workbook.addWorksheet("Detail Absensi");

      // Title
      const titleRange = `A1:${String.fromCharCode(
        65 + 7 + attendanceDates.length
      )}1`;
      detailSheet.mergeCells(titleRange);
      const detailTitleCell = detailSheet.getCell("A1");
      detailTitleCell.value = `REKAP PRESENSI KELAS ${
        attendanceMode === "subject" ? selectedClass : homeroomClass
      }`;
      detailTitleCell.font = {
        size: 16,
        bold: true,
        color: { argb: "FFFFFFFF" },
      };
      detailTitleCell.alignment = { horizontal: "center", vertical: "middle" };
      detailTitleCell.fill = {
        type: "pattern",
        pattern: "solid",
        fgColor: { argb: "FF2563EB" },
      };
      detailSheet.getRow(1).height = 28;

      // Subtitle
      const subtitleRange = `A2:${String.fromCharCode(
        65 + 7 + attendanceDates.length
      )}2`;
      detailSheet.mergeCells(subtitleRange);
      const subtitleCell = detailSheet.getCell("A2");
      subtitleCell.value = `${
        attendanceMode === "subject" ? selectedSubject : "PRESENSI HARIAN"
      } - ${getPeriodLabel()}`;
      subtitleCell.font = { size: 12, bold: true, color: { argb: "FF1F2937" } };
      subtitleCell.alignment = { horizontal: "center", vertical: "middle" };
      subtitleCell.fill = {
        type: "pattern",
        pattern: "solid",
        fgColor: { argb: "FFDBEAFE" },
      };
      detailSheet.getRow(2).height = 22;

      // Headers
      const detailHeaders = [
        "No",
        "NIS",
        "Nama Siswa",
        ...attendanceDates.map((date) => {
          const d = new Date(date + "T00:00:00");
          return `${d.getDate()}/${d.getMonth() + 1}`;
        }),
        "Hadir",
        "Izin",
        "Sakit",
        "Alpa",
        "Total",
        "%",
      ];

      detailSheet.addRow([]); // Empty row
      const headerRow = detailSheet.addRow(detailHeaders);
      headerRow.font = { bold: true, color: { argb: "FFFFFFFF" } };
      headerRow.alignment = { horizontal: "center", vertical: "middle" };
      headerRow.fill = {
        type: "pattern",
        pattern: "solid",
        fgColor: { argb: "FF3B82F6" },
      };
      headerRow.height = 25;

      // Add borders to header
      headerRow.eachCell((cell) => {
        cell.border = {
          top: { style: "medium" },
          bottom: { style: "medium" },
          left: { style: "thin" },
          right: { style: "thin" },
        };
      });

      // Data rows
      rekapData.forEach((student, index) => {
        const row = [
          student.no,
          student.nis || "-",
          student.name,
          ...attendanceDates.map((date) => {
            const status = student.dailyStatus[date];
            if (!status) return "";
            return status.charAt(0).toUpperCase();
          }),
          student.hadir,
          student.izin,
          student.sakit,
          student.alpa,
          student.total,
          student.percentage,
        ];

        const dataRow = detailSheet.addRow(row);

        // Alternating row colors
        if (index % 2 === 0) {
          dataRow.fill = {
            type: "pattern",
            pattern: "solid",
            fgColor: { argb: "FFF9FAFB" },
          };
        }

        // Alignment
        dataRow.getCell(1).alignment = {
          horizontal: "center",
          vertical: "middle",
        }; // No
        dataRow.getCell(2).alignment = {
          horizontal: "center",
          vertical: "middle",
        }; // NIS
        dataRow.getCell(3).alignment = {
          horizontal: "left",
          vertical: "middle",
        }; // Name

        // Date columns alignment
        for (let i = 4; i <= 3 + attendanceDates.length; i++) {
          dataRow.getCell(i).alignment = {
            horizontal: "center",
            vertical: "middle",
          };

          // Color based on status
          const value = dataRow.getCell(i).value;
          if (value === "H") {
            dataRow.getCell(i).font = {
              bold: true,
              color: { argb: "FF10B981" },
            };
          } else if (value === "S") {
            dataRow.getCell(i).font = {
              bold: true,
              color: { argb: "FFF59E0B" },
            };
          } else if (value === "I") {
            dataRow.getCell(i).font = {
              bold: true,
              color: { argb: "FF3B82F6" },
            };
          } else if (value === "A") {
            dataRow.getCell(i).font = {
              bold: true,
              color: { argb: "FFEF4444" },
            };
          }
        }

        // Summary columns
        const summaryStartCol = 4 + attendanceDates.length;
        dataRow.getCell(summaryStartCol).alignment = {
          horizontal: "center",
          vertical: "middle",
        }; // Hadir
        dataRow.getCell(summaryStartCol).font = {
          bold: true,
          color: { argb: "FF10B981" },
        };
        dataRow.getCell(summaryStartCol).fill = {
          type: "pattern",
          pattern: "solid",
          fgColor: { argb: "FFD1FAE5" },
        };

        dataRow.getCell(summaryStartCol + 1).alignment = {
          horizontal: "center",
          vertical: "middle",
        }; // Izin
        dataRow.getCell(summaryStartCol + 1).font = {
          bold: true,
          color: { argb: "FF3B82F6" },
        };
        dataRow.getCell(summaryStartCol + 1).fill = {
          type: "pattern",
          pattern: "solid",
          fgColor: { argb: "FFDBEAFE" },
        };

        dataRow.getCell(summaryStartCol + 2).alignment = {
          horizontal: "center",
          vertical: "middle",
        }; // Sakit
        dataRow.getCell(summaryStartCol + 2).font = {
          bold: true,
          color: { argb: "FFF59E0B" },
        };
        dataRow.getCell(summaryStartCol + 2).fill = {
          type: "pattern",
          pattern: "solid",
          fgColor: { argb: "FFFEF3C7" },
        };

        dataRow.getCell(summaryStartCol + 3).alignment = {
          horizontal: "center",
          vertical: "middle",
        }; // Alpa
        dataRow.getCell(summaryStartCol + 3).font = {
          bold: true,
          color: { argb: "FFEF4444" },
        };
        dataRow.getCell(summaryStartCol + 3).fill = {
          type: "pattern",
          pattern: "solid",
          fgColor: { argb: "FFFECACA" },
        };

        dataRow.getCell(summaryStartCol + 4).alignment = {
          horizontal: "center",
          vertical: "middle",
        }; // Total
        dataRow.getCell(summaryStartCol + 4).font = { bold: true };

        dataRow.getCell(summaryStartCol + 5).alignment = {
          horizontal: "center",
          vertical: "middle",
        }; // %
        dataRow.getCell(summaryStartCol + 5).font = { bold: true };

        // Borders
        dataRow.eachCell((cell) => {
          cell.border = {
            top: { style: "thin" },
            bottom: { style: "thin" },
            left: { style: "thin" },
            right: { style: "thin" },
          };
        });
      });

      // Column widths with auto-fit
      detailSheet.getColumn(1).width = 6; // No
      detailSheet.getColumn(2).width = 12; // NIS

      // Auto-fit name column based on longest name
      const maxNameLength = Math.max(...rekapData.map((s) => s.name.length));
      detailSheet.getColumn(3).width = Math.min(
        Math.max(maxNameLength + 2, 20),
        40
      );

      // Date columns
      for (let i = 0; i < attendanceDates.length; i++) {
        detailSheet.getColumn(4 + i).width = 6;
      }

      // Summary columns
      const summaryStartCol = 4 + attendanceDates.length;
      detailSheet.getColumn(summaryStartCol).width = 8; // Hadir
      detailSheet.getColumn(summaryStartCol + 1).width = 8; // Izin
      detailSheet.getColumn(summaryStartCol + 2).width = 8; // Sakit
      detailSheet.getColumn(summaryStartCol + 3).width = 8; // Alpa
      detailSheet.getColumn(summaryStartCol + 4).width = 8; // Total
      detailSheet.getColumn(summaryStartCol + 5).width = 10; // %

      // Freeze panes (freeze first 3 columns and first 4 rows)
      detailSheet.views = [{ state: "frozen", xSplit: 3, ySplit: 4 }];

      // Generate and download
      const buffer = await workbook.xlsx.writeBuffer();
      const blob = new Blob([buffer], {
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      });

      const filename = `Rekap_Absensi_${
        attendanceMode === "subject" ? selectedClass : homeroomClass
      }_${getPeriodLabel().replace(/\s/g, "_")}.xlsx`;
      saveAs(blob, filename);

      onShowToast?.("✅ File Excel berhasil diunduh!", "success");
    } catch (error) {
      console.error("❌ Export error:", error);
      onShowToast?.("❌ Gagal export Excel: " + error.message, "error");
    } finally {
      setExportLoading(false);
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
        <div className="bg-gradient-to-r from-blue-500 to-blue-600 text-white px-4 py-2 flex justify-between items-center flex-shrink-0">
          <div className="flex items-center gap-3">
            <h2 className="text-base font-bold">📊 Rekap & Export</h2>
            <span className="text-xs bg-white/20 px-2 py-1 rounded">
              {attendanceMode === "subject" ? selectedClass : homeroomClass} |{" "}
              {attendanceMode === "subject" ? selectedSubject : "Harian"}
            </span>
          </div>
          <button
            className="text-white hover:bg-white/20 w-7 h-7 rounded-lg transition flex items-center justify-center"
            onClick={onClose}>
            ✕
          </button>
        </div>

        {/* Tabs & Filter Combined */}
        <div className="border-b border-gray-200 bg-gray-50 flex-shrink-0">
          <div className="flex items-center justify-between px-4 py-2 gap-3 flex-wrap">
            {/* Tabs */}
            <div className="flex">
              <button
                className={`px-3 py-1.5 font-medium text-xs transition rounded-t ${
                  activeTab === "preview"
                    ? "text-blue-600 bg-white border-b-2 border-blue-600"
                    : "text-gray-500 hover:text-gray-700"
                }`}
                onClick={() => setActiveTab("preview")}>
                📊 Rekap
              </button>
              <button
                className={`px-3 py-1.5 font-medium text-xs transition rounded-t ${
                  activeTab === "export"
                    ? "text-blue-600 bg-white border-b-2 border-blue-600"
                    : "text-gray-500 hover:text-gray-700"
                }`}
                onClick={() => setActiveTab("export")}>
                📤 Export
              </button>
            </div>

            {/* Compact Filter */}
            <div className="flex items-center gap-2 flex-wrap">
              <select
                value={periodType}
                onChange={(e) => setPeriodType(e.target.value)}
                className="px-2 py-1 border border-gray-300 rounded text-xs">
                <option value="month">Bulanan</option>
                <option value="semester">Semester</option>
                <option value="custom">Custom</option>
              </select>

              {periodType === "month" && (
                <>
                  <select
                    value={selectedMonth}
                    onChange={(e) => setSelectedMonth(parseInt(e.target.value))}
                    className="px-2 py-1 border border-gray-300 rounded text-xs">
                    {monthOptions.map((m) => (
                      <option key={m.value} value={m.value}>
                        {m.label}
                      </option>
                    ))}
                  </select>
                  <select
                    value={selectedYear}
                    onChange={(e) => setSelectedYear(parseInt(e.target.value))}
                    className="px-2 py-1 border border-gray-300 rounded text-xs">
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
                    className="px-2 py-1 border border-gray-300 rounded text-xs">
                    {semesterOptions.map((s) => (
                      <option key={s.value} value={s.value}>
                        {s.label}
                      </option>
                    ))}
                  </select>
                  <select
                    value={selectedYear}
                    onChange={(e) => setSelectedYear(parseInt(e.target.value))}
                    className="px-2 py-1 border border-gray-300 rounded text-xs">
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
                    className="px-2 py-1 border border-gray-300 rounded text-xs"
                  />
                  <span className="text-xs text-gray-500">-</span>
                  <input
                    type="date"
                    value={dateRange[1]?.toISOString().split("T")[0] || ""}
                    onChange={(e) =>
                      setDateRange([dateRange[0], new Date(e.target.value)])
                    }
                    className="px-2 py-1 border border-gray-300 rounded text-xs"
                  />
                </>
              )}

              <button
                onClick={fetchRekapData}
                disabled={rekapLoading}
                className="px-3 py-1 bg-blue-500 text-white rounded text-xs hover:bg-blue-600 disabled:opacity-50">
                {rekapLoading ? "⏳" : "Terapkan"}
              </button>
            </div>
          </div>
        </div>

        {/* Tab Content */}
        <div className="flex-1 p-2 sm:p-3 flex flex-col min-h-0">
          {activeTab === "preview" ? (
            /* PREVIEW TAB - FIXED SCROLL */
            <div className="flex-1 flex flex-col min-h-0">
              {/* Compact Header - Only show period */}
              <div className="mb-2 text-center bg-blue-50 border-l-4 border-blue-500 px-3 py-1.5 flex-shrink-0">
                <p className="text-xs font-semibold text-blue-800">
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
                          <th className="p-1.5 text-center font-bold text-gray-800 border-r-2 border-gray-300 sticky left-0 bg-gray-100 z-30 min-w-[35px]">
                            No
                          </th>
                          <th className="p-1.5 text-left font-bold text-gray-800 border-r-2 border-gray-300 sticky left-[35px] bg-gray-100 z-30 min-w-[150px]">
                            Nama Siswa
                          </th>

                          {attendanceDates.map((date, index) => (
                            <th
                              key={date}
                              className={`p-1.5 text-center font-bold text-gray-800 min-w-[40px] whitespace-nowrap ${
                                index < attendanceDates.length - 1
                                  ? "border-r border-gray-300"
                                  : "border-r-2 border-gray-400"
                              }`}>
                              {formatDateHeader(date)}
                            </th>
                          ))}

                          <th className="p-1.5 text-center font-bold text-green-700 border-r border-gray-300 min-w-[35px] bg-green-50">
                            H
                          </th>
                          <th className="p-1.5 text-center font-bold text-blue-700 border-r border-gray-300 min-w-[35px] bg-blue-50">
                            I
                          </th>
                          <th className="p-1.5 text-center font-bold text-yellow-700 border-r border-gray-300 min-w-[35px] bg-yellow-50">
                            S
                          </th>
                          <th className="p-1.5 text-center font-bold text-red-700 border-r-2 border-gray-400 min-w-[35px] bg-red-50">
                            A
                          </th>
                          <th className="p-1.5 text-center font-bold text-gray-800 border-r border-gray-300 min-w-[40px]">
                            Total
                          </th>
                          <th className="p-1.5 text-center font-bold text-gray-800 min-w-[45px]">
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
                              <td className="p-1.5 text-center border-r-2 border-gray-300 sticky left-0 bg-white z-10 font-medium">
                                {student.no}
                              </td>
                              <td className="p-1.5 font-medium text-gray-800 border-r-2 border-gray-300 sticky left-[35px] bg-white z-10">
                                {student.name}
                              </td>

                              {attendanceDates.map((date, index) => (
                                <td
                                  key={date}
                                  className={`p-1.5 text-center ${
                                    index < attendanceDates.length - 1
                                      ? "border-r border-gray-200"
                                      : "border-r-2 border-gray-400"
                                  }`}>
                                  {getStatusBadge(student.dailyStatus[date])}
                                </td>
                              ))}

                              <td className="p-1.5 text-center text-green-700 font-bold border-r border-gray-200 bg-green-50/50">
                                {student.hadir}
                              </td>
                              <td className="p-1.5 text-center text-blue-700 font-bold border-r border-gray-200 bg-blue-50/50">
                                {student.izin}
                              </td>
                              <td className="p-1.5 text-center text-yellow-700 font-bold border-r border-gray-200 bg-yellow-50/50">
                                {student.sakit}
                              </td>
                              <td className="p-1.5 text-center text-red-700 font-bold border-r-2 border-gray-400 bg-red-50/50">
                                {student.alpa}
                              </td>
                              <td className="p-1.5 text-center font-bold text-gray-800 border-r border-gray-200">
                                {student.total}
                              </td>
                              <td className="p-1.5 text-center font-bold text-gray-800">
                                {student.percentage}
                              </td>
                            </tr>
                          ))
                        ) : (
                          <tr>
                            <td
                              colSpan={attendanceDates.length + 8}
                              className="p-8 text-center text-gray-500">
                              <div className="text-3xl sm:text-4xl mb-3">
                                📅
                              </div>
                              <h4 className="font-semibold mb-2 text-sm sm:text-base">
                                Belum Ada Data
                              </h4>
                              <p className="text-xs sm:text-sm">
                                Belum ada data presensi untuk periode ini
                              </p>
                              <p className="text-xs text-gray-400 mt-2">
                                Coba ganti periode atau pastikan sudah input
                                data presensi
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
          ) : (
            /* EXPORT TAB */
            <div className="h-full flex flex-col items-center justify-center p-8">
              <div className="text-center max-w-md">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg
                    className="w-8 h-8 text-green-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                </div>

                <h3 className="text-lg font-bold text-gray-800 mb-2">
                  Export Data ke Excel
                </h3>
                <p className="text-gray-600 mb-6">
                  Data akan diexport dalam format Excel dengan 2 sheet: Summary
                  dan Detail Absensi
                </p>

                {rekapData.length > 0 && (
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                    <p className="text-sm text-blue-700">
                      <strong>{rekapData.length} siswa</strong> siap diexport
                      untuk periode <strong>{getPeriodLabel()}</strong>
                    </p>
                    <p className="text-xs text-blue-600 mt-1">
                      Kelas:{" "}
                      {attendanceMode === "subject"
                        ? selectedClass
                        : homeroomClass}{" "}
                      | Mapel:{" "}
                      {attendanceMode === "subject"
                        ? selectedSubject
                        : "Presensi Harian"}
                    </p>
                  </div>
                )}

                <button
                  onClick={exportToExcel}
                  disabled={exportLoading || rekapData.length === 0}
                  className="px-6 py-3 bg-green-500 text-white rounded-lg hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed transition font-medium flex items-center gap-2 mx-auto">
                  {exportLoading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      <span>Mengexport...</span>
                    </>
                  ) : (
                    <>
                      <svg
                        className="w-5 h-5"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24">
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                        />
                      </svg>
                      <span>Download Excel</span>
                    </>
                  )}
                </button>

                <p className="text-xs text-gray-500 mt-4">
                  File akan berisi data lengkap dengan format yang rapi dan siap
                  dicetak
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="bg-gray-50 px-4 py-2 border-t border-gray-200 flex justify-end flex-shrink-0">
          <button
            className="px-4 py-1.5 bg-blue-500 text-white rounded hover:bg-blue-600 transition text-sm font-medium"
            onClick={onClose}>
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
};

export default AttendanceModalExport;
