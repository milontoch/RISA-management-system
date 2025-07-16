// Optional: Export as PDF/CSV for Results/Attendance
import React from "react";

function exportTableToCSV(tableId, filename) {
  const table = document.getElementById(tableId);
  let csv = [];
  for (let row of table.rows) {
    let rowData = [];
    for (let cell of row.cells) {
      rowData.push('"' + cell.innerText.replace(/"/g, '""') + '"');
    }
    csv.push(rowData.join(","));
  }
  const csvContent = csv.join("\n");
  const blob = new Blob([csvContent], { type: "text/csv" });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = filename;
  link.click();
}

export default function ExportButtons({ tableId, filename }) {
  return (
    <div className="flex gap-2 my-2">
      {/* Optional: Print to PDF */}
      <button
        className="px-3 py-1 rounded bg-gray-200 hover:bg-gray-300"
        onClick={() => window.print()}
      >
        Export as PDF
      </button>
      {/* Optional: Export as CSV */}
      <button
        className="px-3 py-1 rounded bg-gray-200 hover:bg-gray-300"
        onClick={() => exportTableToCSV(tableId, filename)}
      >
        Export as CSV
      </button>
    </div>
  );
} 