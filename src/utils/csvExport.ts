import { Student, Invoice, BankStatementRow } from '../types';

export interface CsvColumn<T> {
  header: string;
  accessor: (item: T) => string | number | boolean | null | undefined;
}

/**
 * Encodes an array of items into an RFC-4180 compliant CSV string with UTF-8 BOM.
 */
export function generateCsvString<T>(columns: CsvColumn<T>[], data: T[]): string {
  const escapeCell = (val: any): string => {
    if (val === null || val === undefined) return '""';
    const str = String(val);
    // If string contains comma, quote, or newline, escape quotes and wrap in quotes
    if (/[",\n\r]/.test(str)) {
      return `"${str.replace(/"/g, '""')}"`;
    }
    return `"${str}"`;
  };

  const headerRow = columns.map(col => escapeCell(col.header)).join(',');
  const dataRows = data.map(item => {
    return columns.map(col => escapeCell(col.accessor(item))).join(',');
  });

  // Prepend UTF-8 Byte Order Mark (\uFEFF) for optimal Excel compatibility
  return '\uFEFF' + [headerRow, ...dataRows].join('\r\n');
}

/**
 * Triggers a browser download of a CSV file.
 */
export function downloadCsvFile(csvContent: string, fileName: string): void {
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', fileName);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Column definitions for Student records
 */
export const STUDENT_CSV_COLUMNS: CsvColumn<Student>[] = [
  { header: 'Student ID', accessor: s => s.id },
  { header: 'Account Number', accessor: s => s.accountNumber },
  { header: 'Full Name', accessor: s => s.fullName },
  { header: 'Gender', accessor: s => s.gender },
  { header: 'Date of Birth', accessor: s => s.dob },
  { header: 'Grade Level', accessor: s => `Grade ${s.grade}` },
  { header: 'Academic Stream', accessor: s => s.stream || 'General' },
  { header: 'Homeroom Section', accessor: s => s.sectionId || 'Unassigned' },
  { header: 'Enrollment Status', accessor: s => s.registrationStatus === 'COMPLETE' ? 'Registered / Complete' : 'Tuition Pending' },
  { header: 'ID Badge Status', accessor: s => s.idCardCollected ? 'Collected' : 'Pending Handover' },
  { header: '8th Grade Cert Attached', accessor: s => s.eighthGradeCertAttached ? 'Yes' : 'No' },
  { header: 'Certificate Doc File', accessor: s => s.certificateDocName || 'N/A' },
  { header: 'Entrance Exam Score', accessor: s => s.entranceExamScore != null ? s.entranceExamScore : 'N/A' },
  { header: 'Previous School Name', accessor: s => s.previousSchool?.name || 'N/A' },
  { header: 'Attended Same School', accessor: s => s.previousSchool?.isSameSchool ? 'Yes' : 'No' },
  { header: 'Father / Guardian 1 Name', accessor: s => s.parents?.fatherName || '' },
  { header: 'Father Phone', accessor: s => s.parents?.fatherPhone || '' },
  { header: 'Mother / Guardian 2 Name', accessor: s => s.parents?.motherName || '' },
  { header: 'Mother Phone', accessor: s => s.parents?.motherPhone || '' },
  { header: 'Parent Email', accessor: s => s.parents?.email || '' },
  { header: 'Residential Home Address', accessor: s => s.parents?.homeAddress || '' },
  { header: 'Work Address', accessor: s => s.parents?.workAddress || '' },
  { header: 'Emergency Contact Person', accessor: s => s.emergencyContact?.name || '' },
  { header: 'Emergency Phone 1', accessor: s => s.emergencyContact?.phone1 || '' },
  { header: 'Emergency Phone 2', accessor: s => s.emergencyContact?.phone2 || '' },
  { header: 'Emergency Relationship', accessor: s => s.emergencyContact?.relationship || '' },
  { header: 'Stream Change Status', accessor: s => s.streamChangeRequest ? `${s.streamChangeRequest.status} (${s.streamChangeRequest.requestedStream})` : 'None' },
  { header: 'Lost ID Request', accessor: s => s.lostIdRequest ? s.lostIdRequest.status : 'None' },
  { header: 'Leaving Clearance', accessor: s => s.leavingClearance ? s.leavingClearance.status : 'None' },
];

/**
 * Column definitions for Invoice / Fee Ledger records
 */
export const INVOICE_CSV_COLUMNS: CsvColumn<Invoice>[] = [
  { header: 'Invoice ID', accessor: i => i.id },
  { header: 'Student Name', accessor: i => i.studentName },
  { header: 'Student ID', accessor: i => i.studentId },
  { header: 'Account Number', accessor: i => i.accountNumber },
  { header: 'Grade Level', accessor: i => `Grade ${i.grade}` },
  { header: 'Fee Title', accessor: i => i.title },
  { header: 'Amount (ETB)', accessor: i => i.amount },
  { header: 'Due Date', accessor: i => i.dueDate },
  { header: 'Payment Status', accessor: i => i.status },
  { header: 'Bank Reference Code', accessor: i => i.paymentReference || 'Unpaid / No Ref' },
  { header: 'Deposit Slip File', accessor: i => i.slipName || 'No Slip' },
  { header: 'Payment Date', accessor: i => i.paidDate || 'N/A' },
  { header: 'Official Receipt Number', accessor: i => i.receiptNumber || 'N/A' },
  { header: 'Parent Alert Dispatched', accessor: i => i.parentAlertSent ? 'Sent via Gmail' : 'Not Dispatched' },
  { header: 'Alert Timestamp', accessor: i => i.parentAlertSentAt || 'N/A' },
];

/**
 * Column definitions for Bank Statement records
 */
export const BANK_STATEMENT_CSV_COLUMNS: CsvColumn<BankStatementRow>[] = [
  { header: 'Transaction ID', accessor: b => b.id },
  { header: 'Transaction Date', accessor: b => b.transactionDate },
  { header: 'Bank Reference Number', accessor: b => b.referenceNumber },
  { header: 'Amount (ETB)', accessor: b => b.amount },
  { header: 'Payer Name', accessor: b => b.payerName },
  { header: 'Bank Description', accessor: b => b.bankDescription },
  { header: 'Matched Student ID', accessor: b => b.matchedStudentId || 'Unmatched' },
  { header: 'Matched Invoice ID', accessor: b => b.matchedInvoiceId || 'Unmatched' },
  { header: 'Reconciliation Status', accessor: b => b.status },
];

/**
 * Exports student records to CSV
 */
export function exportStudentsCsv(
  students: Student[], 
  options?: { filterLabel?: string; customFilename?: string }
): void {
  const dateStr = new Date().toISOString().split('T')[0];
  const tag = options?.filterLabel ? `_${options.filterLabel.replace(/[^a-zA-Z0-9_-]/g, '_')}` : '';
  const fileName = options?.customFilename || `Oskar_Students_Directory${tag}_${dateStr}.csv`;
  const csv = generateCsvString(STUDENT_CSV_COLUMNS, students);
  downloadCsvFile(csv, fileName);
}

/**
 * Exports financial invoice records to CSV
 */
export function exportInvoicesCsv(
  invoices: Invoice[], 
  options?: { filterLabel?: string; customFilename?: string }
): void {
  const dateStr = new Date().toISOString().split('T')[0];
  const tag = options?.filterLabel ? `_${options.filterLabel.replace(/[^a-zA-Z0-9_-]/g, '_')}` : '';
  const fileName = options?.customFilename || `Oskar_Finance_Invoices_Ledger${tag}_${dateStr}.csv`;
  const csv = generateCsvString(INVOICE_CSV_COLUMNS, invoices);
  downloadCsvFile(csv, fileName);
}

/**
 * Exports bank reconciliation records to CSV
 */
export function exportBankStatementsCsv(
  statements: BankStatementRow[],
  options?: { filterLabel?: string; customFilename?: string }
): void {
  const dateStr = new Date().toISOString().split('T')[0];
  const tag = options?.filterLabel ? `_${options.filterLabel.replace(/[^a-zA-Z0-9_-]/g, '_')}` : '';
  const fileName = options?.customFilename || `Oskar_Bank_Statements_Feed${tag}_${dateStr}.csv`;
  const csv = generateCsvString(BANK_STATEMENT_CSV_COLUMNS, statements);
  downloadCsvFile(csv, fileName);
}
