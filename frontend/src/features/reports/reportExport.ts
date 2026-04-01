import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

function safeSheetName(name: string): string {
  return name.replace(/[[\]:*?/\\]/g, '-').slice(0, 31) || 'Sheet';
}

/** Multi-sheet Excel workbook. */
export function downloadXlsxWorkbook(filename: string, sheets: { name: string; data: Record<string, unknown>[] }[]) {
  const wb = XLSX.utils.book_new();
  for (const s of sheets) {
    const name = safeSheetName(s.name);
    if (!s.data.length) {
      const ws = XLSX.utils.aoa_to_sheet([['No data in this section']]);
      XLSX.utils.book_append_sheet(wb, ws, name);
    } else {
      const ws = XLSX.utils.json_to_sheet(s.data);
      XLSX.utils.book_append_sheet(wb, ws, name);
    }
  }
  XLSX.writeFile(wb, filename.endsWith('.xlsx') ? filename : `${filename}.xlsx`);
}

/** Single-sheet Excel from row objects. */
export function downloadXlsxSheet(filename: string, sheetName: string, data: Record<string, unknown>[]) {
  downloadXlsxWorkbook(filename, [{ name: sheetName, data }]);
}

type PdfTable = { subtitle: string; head: string[][]; body: (string | number)[][] };

/** PDF with title and one or more tables (auto pagination). */
export function downloadPdfReport(filename: string, title: string, tables: PdfTable[]) {
  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
  let y = 14;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(13);
  doc.setTextColor(15, 23, 42);
  doc.text(title, 14, y);
  y += 9;
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(100, 116, 139);
  doc.text(`Generated ${new Date().toLocaleString()}`, 14, y);
  y += 8;

  for (const t of tables) {
    if (y > 270) {
      doc.addPage();
      y = 14;
    }
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);
    doc.setTextColor(15, 23, 42);
    doc.text(t.subtitle, 14, y);
    y += 5;
    doc.setFont('helvetica', 'normal');
    autoTable(doc, {
      startY: y,
      head: t.head,
      body: t.body,
      styles: { fontSize: 7, cellPadding: 1.5 },
      headStyles: { fillColor: [79, 56, 246], textColor: 255, fontStyle: 'bold' },
      alternateRowStyles: { fillColor: [248, 250, 252] },
      margin: { left: 14, right: 14 },
    });
    const g = doc as jsPDF & { lastAutoTable?: { finalY: number } };
    y = (g.lastAutoTable?.finalY ?? y) + 10;
  }

  doc.save(filename.endsWith('.pdf') ? filename : `${filename}.pdf`);
}
