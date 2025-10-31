// AttendanceExcel.js - Excel Export Logic
import ExcelJS from "exceljs";
import { saveAs } from "file-saver";

export const exportToExcel = async ({
  rekapData,
  attendanceDates,
  getPeriodLabel,
  attendanceMode,
  selectedClass,
  homeroomClass,
  selectedSubject,
}) => {
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
        i === summaryData.length - 1 ? { style: "medium" } : { style: "thin" },
    };
    summarySheet.getCell(`B${rowNum}`).border = {
      right: { style: "medium" },
      bottom:
        i === summaryData.length - 1 ? { style: "medium" } : { style: "thin" },
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

    // Date columns alignment and coloring
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

    // Summary columns styling
    const summaryStartCol = 4 + attendanceDates.length;

    // Hadir
    dataRow.getCell(summaryStartCol).alignment = {
      horizontal: "center",
      vertical: "middle",
    };
    dataRow.getCell(summaryStartCol).font = {
      bold: true,
      color: { argb: "FF10B981" },
    };
    dataRow.getCell(summaryStartCol).fill = {
      type: "pattern",
      pattern: "solid",
      fgColor: { argb: "FFD1FAE5" },
    };

    // Izin
    dataRow.getCell(summaryStartCol + 1).alignment = {
      horizontal: "center",
      vertical: "middle",
    };
    dataRow.getCell(summaryStartCol + 1).font = {
      bold: true,
      color: { argb: "FF3B82F6" },
    };
    dataRow.getCell(summaryStartCol + 1).fill = {
      type: "pattern",
      pattern: "solid",
      fgColor: { argb: "FFDBEAFE" },
    };

    // Sakit
    dataRow.getCell(summaryStartCol + 2).alignment = {
      horizontal: "center",
      vertical: "middle",
    };
    dataRow.getCell(summaryStartCol + 2).font = {
      bold: true,
      color: { argb: "FFF59E0B" },
    };
    dataRow.getCell(summaryStartCol + 2).fill = {
      type: "pattern",
      pattern: "solid",
      fgColor: { argb: "FFFEF3C7" },
    };

    // Alpa
    dataRow.getCell(summaryStartCol + 3).alignment = {
      horizontal: "center",
      vertical: "middle",
    };
    dataRow.getCell(summaryStartCol + 3).font = {
      bold: true,
      color: { argb: "FFEF4444" },
    };
    dataRow.getCell(summaryStartCol + 3).fill = {
      type: "pattern",
      pattern: "solid",
      fgColor: { argb: "FFFECACA" },
    };

    // Total
    dataRow.getCell(summaryStartCol + 4).alignment = {
      horizontal: "center",
      vertical: "middle",
    };
    dataRow.getCell(summaryStartCol + 4).font = { bold: true };

    // Percentage
    dataRow.getCell(summaryStartCol + 5).alignment = {
      horizontal: "center",
      vertical: "middle",
    };
    dataRow.getCell(summaryStartCol + 5).font = { bold: true };

    // Borders for all cells in row
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
};
