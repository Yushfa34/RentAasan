// Client-side PDF/CSV generation for receipts and reports.
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import { fmtDate, monthLabel } from "./format";
import type { RentWithTenant } from "./api";

const money = (n: number | string) => "Rs. " + Number(n).toLocaleString("en-PK", { maximumFractionDigits: 0 });

export function downloadReceipt(r: RentWithTenant, landlordName: string) {
  const doc = new jsPDF();
  doc.setFillColor(13, 110, 110); doc.rect(0, 0, 210, 30, "F");
  doc.setTextColor(255); doc.setFontSize(20); doc.text("RentAasan", 14, 19);
  doc.setFontSize(12); doc.text("RENT RECEIPT", 196, 19, { align: "right" });
  doc.setTextColor(30); doc.setFontSize(11);
  doc.text(`Receipt No: ${r.receipt_no ?? "—"}`, 14, 44);
  doc.text(`Issued: ${fmtDate(new Date())}`, 196, 44, { align: "right" });
  autoTable(doc, {
    startY: 52, theme: "grid", headStyles: { fillColor: [13, 110, 110] },
    head: [["Detail", "Value"]],
    body: [
      ["Tenant", r.tenants.full_name], ["Property", r.tenants.properties?.name ?? "—"], ["Unit", r.tenants.unit || "—"],
      ["Rent month", monthLabel(r.period)], ["Amount paid", money(r.amount)], ["Payment date", fmtDate(r.paid_at)],
      ["Payment method", r.method ?? "—"], ["Received by", landlordName], ...(r.notes ? [["Notes", r.notes]] : []),
    ],
  });
  doc.setFontSize(9); doc.setTextColor(120);
  doc.text("This is a computer-generated receipt from RentAasan.", 14, 280);
  doc.save(`receipt-${r.receipt_no ?? r.id}.pdf`);
}

export function downloadTablePdf(title: string, subtitle: string, sections: { heading: string; head: string[]; rows: (string | number)[][] }[], file: string) {
  const doc = new jsPDF();
  doc.setFontSize(18); doc.text(title, 14, 18);
  doc.setFontSize(10); doc.setTextColor(110); doc.text(subtitle, 14, 25); doc.setTextColor(30);
  let y = 32;
  for (const s of sections) {
    doc.setFontSize(12); doc.text(s.heading, 14, y + 4);
    autoTable(doc, { startY: y + 7, head: [s.head], body: s.rows.map((r) => r.map(String)), headStyles: { fillColor: [13, 110, 110] }, styles: { fontSize: 9 } });
    y = (doc as unknown as { lastAutoTable: { finalY: number } }).lastAutoTable.finalY + 10;
    if (y > 260) { doc.addPage(); y = 16; }
  }
  doc.save(file);
}

export function downloadCsv(rows: (string | number | null | undefined)[][], file: string) {
  const esc = (v: unknown) => { const s = String(v ?? ""); return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s; };
  const blob = new Blob(["\ufeff" + rows.map((r) => r.map(esc).join(",")).join("\n")], { type: "text/csv;charset=utf-8" });
  const a = document.createElement("a"); a.href = URL.createObjectURL(blob); a.download = file; a.click();
  setTimeout(() => URL.revokeObjectURL(a.href), 1000);
}
