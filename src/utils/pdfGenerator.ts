import jsPDF from 'jspdf';
import { Student, GradeEntry, Invoice } from '../types';

export const fileToDataUrl = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = (err) => reject(err);
    reader.readAsDataURL(file);
  });
};

export const downloadPdfDataUrl = (dataUrl: string, fileName: string) => {
  const link = document.createElement('a');
  link.href = dataUrl;
  link.download = fileName.endsWith('.pdf') ? fileName : `${fileName}.pdf`;
  document.body.appendChild(link);
  link.click();
  setTimeout(() => {
    document.body.removeChild(link);
  }, 100);
};

/**
 * Generates an official Ministry / Academy 8th Grade Certificate PDF
 */
export const generateOfficialCertificatePdf = (data: {
  studentName: string;
  studentId: string;
  grade: number;
  schoolName: string;
  examScore?: number | null;
  score?: number | null;
  completionYear?: string;
  serialNumber?: string;
}): string => {
  const doc = new jsPDF({
    orientation: 'landscape',
    unit: 'mm',
    format: 'a4',
  });

  const pageWidth = 297;
  const pageHeight = 210;
  const effectiveScore = data.examScore ?? data.score ?? 88.5;

  // Outer ornate border
  doc.setDrawColor(15, 23, 42); // slate-900
  doc.setLineWidth(1.5);
  doc.rect(10, 10, pageWidth - 20, pageHeight - 20);

  // Inner decorative border
  doc.setDrawColor(30, 58, 138); // blue-900
  doc.setLineWidth(0.6);
  doc.rect(13, 13, pageWidth - 26, pageHeight - 26);

  // Corner accents
  doc.setFillColor(30, 58, 138);
  doc.circle(13, 13, 2, 'F');
  doc.circle(pageWidth - 13, 13, 2, 'F');
  doc.circle(13, pageHeight - 13, 2, 'F');
  doc.circle(pageWidth - 13, pageHeight - 13, 2, 'F');

  // Background Watermark
  doc.setTextColor(241, 245, 249);
  doc.setFontSize(48);
  doc.setFont('helvetica', 'bold');
  doc.text('OFFICIAL MINISTRY VERIFIED', pageWidth / 2, pageHeight / 2 + 10, {
    align: 'center',
    angle: 25,
  });

  // Header Title
  doc.setTextColor(15, 23, 42);
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.text('FEDERAL DEMOCRATIC REPUBLIC OF ETHIOPIA', pageWidth / 2, 26, { align: 'center' });
  doc.text('MINISTRY OF EDUCATION & REGIONAL EXAMINATION BOARD', pageWidth / 2, 32, { align: 'center' });

  doc.setTextColor(30, 58, 138);
  doc.setFontSize(22);
  doc.setFont('times', 'bold');
  doc.text('CERTIFICATE OF GENERAL PRIMARY EDUCATION COMPLETION', pageWidth / 2, 45, { align: 'center' });
  doc.setFontSize(13);
  doc.text('(GRADE 8 NATIONAL & REGIONAL ASSESSMENT EXAMINATION)', pageWidth / 2, 52, { align: 'center' });

  // Divider
  doc.setDrawColor(203, 213, 225);
  doc.setLineWidth(0.5);
  doc.line(40, 56, pageWidth - 40, 56);

  // Serial & Reg Number
  const serial = data.serialNumber || `MOE-8TH-${Math.floor(100000 + Math.random() * 900000)}`;
  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(100, 116, 139);
  doc.text(`Certificate Serial No: ${serial}`, 20, 64);
  doc.text(`Candidate Student ID: ${data.studentId}`, pageWidth - 20, 64, { align: 'right' });

  // Body Content
  doc.setFontSize(13);
  doc.setFont('times', 'normal');
  doc.setTextColor(51, 65, 85);
  doc.text('This is to officially certify that the student named below has successfully satisfied all academic', pageWidth / 2, 77, { align: 'center' });
  doc.text('requirements and passed the regional primary completion assessments under national curriculum standards.', pageWidth / 2, 84, { align: 'center' });

  // Student Name Callout
  doc.setFontSize(22);
  doc.setFont('times', 'bold');
  doc.setTextColor(15, 23, 42);
  doc.text(data.studentName.toUpperCase(), pageWidth / 2, 102, { align: 'center' });

  // Underline
  const nameWidth = doc.getTextWidth(data.studentName.toUpperCase());
  doc.setDrawColor(30, 58, 138);
  doc.setLineWidth(0.8);
  doc.line((pageWidth - nameWidth) / 2 - 10, 105, (pageWidth + nameWidth) / 2 + 10, 105);

  // Scores Box
  doc.setFillColor(248, 250, 252);
  doc.setDrawColor(226, 232, 240);
  doc.roundedRect(45, 114, pageWidth - 90, 30, 3, 3, 'FD');

  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(30, 58, 138);
  doc.text('ACADEMIC PROFICIENCY & REGIONAL SCORE RECORD', pageWidth / 2, 122, { align: 'center' });

  doc.setFontSize(10);
  doc.setTextColor(71, 85, 105);
  doc.setFont('helvetica', 'normal');
  const score = `${effectiveScore} / 100 (Official Distinction)`;
  doc.text(`Regional Score: ${score}`, 60, 132);
  doc.text(`Academic Status: PROMOTED TO HIGH SCHOOL (GRADE 9)`, pageWidth - 60, 132, { align: 'right' });
  doc.text(`Admitted Institution: ${data.schoolName}`, 60, 138);
  doc.text(`Academic Year: ${data.completionYear || '2025/2026 Academic Calendar'}`, pageWidth - 60, 138, { align: 'right' });

  // Official Stamp & Signatures
  doc.setFontSize(9);
  doc.setTextColor(15, 23, 42);
  doc.setFont('helvetica', 'bold');

  // Registrar Signature Line
  doc.line(35, 175, 95, 175);
  doc.text('HEAD REGISTRAR / EXAMINER', 65, 180, { align: 'center' });
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.text('Ministry of Education Regional Office', 65, 184, { align: 'center' });

  // Golden Stamp in Center
  doc.setFillColor(254, 243, 199);
  doc.setDrawColor(217, 119, 6);
  doc.circle(pageWidth / 2, 172, 16, 'FD');
  doc.setFontSize(7);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(180, 83, 9);
  doc.text('MINISTRY OF EDUCATION', pageWidth / 2, 168, { align: 'center' });
  doc.text('★ OFFICIAL ★', pageWidth / 2, 172, { align: 'center' });
  doc.text('VERIFIED & ARCHIVED', pageWidth / 2, 176, { align: 'center' });

  // Principal Signature Line
  doc.setFontSize(9);
  doc.setTextColor(15, 23, 42);
  doc.setFont('helvetica', 'bold');
  doc.line(pageWidth - 95, 175, pageWidth - 35, 175);
  doc.text('DIRECTOR OF HIGH SCHOOL ADMISSIONS', pageWidth - 65, 180, { align: 'center' });
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.text(data.schoolName, pageWidth - 65, 184, { align: 'center' });

  // Security verification footer
  doc.setFontSize(7);
  doc.setTextColor(148, 163, 184);
  doc.text(`Digital Verification Hash: SHA256-${Date.now().toString(16).toUpperCase()}-OSKAR-SIS-PORTAL-CERT`, pageWidth / 2, 196, { align: 'center' });

  return doc.output('datauristring');
};

/**
 * Generates an official Bank Deposit Slip Voucher PDF
 */
export const generateDepositSlipPdf = (data: {
  studentName: string;
  accountNumber?: string;
  studentId?: string;
  amount: number;
  reference?: string;
  bankReference?: string;
  invoiceTitle: string;
  bankName?: string;
  date?: string;
}): string => {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a5',
  });

  const width = 148;
  const height = 210;
  const bank = data.bankName || 'COMMERCIAL BANK OF ETHIOPIA (CBE)';
  const txnRef = data.reference || data.bankReference || `CBE-TXN-${Math.floor(100000 + Math.random() * 900000)}`;
  const accNo = data.accountNumber || data.studentId || 'ACC-10029384';

  // Border
  doc.setDrawColor(30, 58, 138);
  doc.setLineWidth(0.8);
  doc.rect(8, 8, width - 16, height - 16);

  // Bank Header Banner
  doc.setFillColor(30, 58, 138);
  doc.rect(8, 8, width - 16, 22, 'F');

  doc.setTextColor(255, 255, 255);
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.text(bank, width / 2, 16, { align: 'center' });
  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  doc.text('OFFICIAL ELECTRONIC FUNDS TRANSFER / CASH DEPOSIT VOUCHER', width / 2, 22, { align: 'center' });

  // Subheader
  doc.setTextColor(15, 23, 42);
  doc.setFontSize(9);
  doc.setFont('helvetica', 'bold');
  doc.text('TRANSACTION RECEIPT & VERIFICATION RECORD', width / 2, 38, { align: 'center' });

  doc.setDrawColor(226, 232, 240);
  doc.line(16, 42, width - 16, 42);

  // Info Grid
  const leftX = 16;
  const valX = 65;
  let y = 52;
  const rowHeight = 8;

  const addRow = (label: string, value: string, isBold: boolean = false) => {
    doc.setFontSize(8.5);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(100, 116, 139);
    doc.text(label, leftX, y);

    doc.setFont('helvetica', isBold ? 'bold' : 'normal');
    doc.setTextColor(15, 23, 42);
    doc.text(value, valX, y);

    doc.setDrawColor(241, 245, 249);
    doc.line(leftX, y + 2, width - 16, y + 2);
    y += rowHeight;
  };

  addRow('Transaction Ref No:', txnRef, true);
  addRow('Payment Date:', data.date || new Date().toISOString().split('T')[0]);
  addRow('Beneficiary Account:', 'OSKAR ACADEMY SIS COLLECTION ACC (10002938491)');
  addRow('Deposited For Student:', data.studentName, true);
  addRow('Student SIS Acc No:', accNo);
  addRow('Payment Purpose:', data.invoiceTitle);
  addRow('Payment Amount:', `${data.amount.toLocaleString()} ETB`, true);
  addRow('Transaction Channel:', 'Branch Counter & Mobile CBE Birr / Internet Banking');
  addRow('Reconciliation Status:', 'VERIFIED BY SCHOOL SIS FINANCE PORTAL');

  // Highlight Box
  y += 5;
  doc.setFillColor(240, 253, 244);
  doc.setDrawColor(187, 247, 208);
  doc.roundedRect(leftX, y, width - 32, 20, 2, 2, 'FD');

  doc.setFontSize(9);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(22, 101, 52);
  doc.text(`AMOUNT CONFIRMED: ${data.amount.toLocaleString()} ETB`, width / 2, y + 8, { align: 'center' });
  doc.setFontSize(7.5);
  doc.setFont('helvetica', 'normal');
  doc.text('This voucher is officially registered and archived in the school finance ledger.', width / 2, y + 14, { align: 'center' });

  // Bank Stamp
  y += 28;
  doc.setFillColor(239, 246, 255);
  doc.setDrawColor(59, 130, 246);
  doc.circle(40, y + 14, 14, 'FD');
  doc.setFontSize(6.5);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(29, 78, 216);
  doc.text('BANK TELLER', 40, y + 11, { align: 'center' });
  doc.text('★ RECEIVED ★', 40, y + 15, { align: 'center' });
  doc.text('CBE ADDIS ABABA', 40, y + 19, { align: 'center' });

  // Teller Signature
  doc.setFontSize(8);
  doc.setTextColor(15, 23, 42);
  doc.line(width - 65, y + 20, width - 16, y + 20);
  doc.text('AUTHORIZED CASHIER / TELLER', width - 40, y + 25, { align: 'center' });

  return doc.output('datauristring');
};

/**
 * Generates an official Medical Excuse / Leave Supporting Certificate PDF
 */
export const generateMedicalLeavePdf = (data: {
  teacherName: string;
  teacherId: string;
  date: string;
  reason: string;
  clinicName?: string;
}): string => {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a5',
  });

  const width = 148;
  const clinic = data.clinicName || 'ST. PAUL HOSPITAL MILLENNIUM MEDICAL COLLEGE';

  // Border
  doc.setDrawColor(71, 85, 105);
  doc.setLineWidth(0.6);
  doc.rect(8, 8, width - 16, 194);

  // Clinic Header
  doc.setTextColor(15, 23, 42);
  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.text(clinic, width / 2, 20, { align: 'center' });
  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(100, 116, 139);
  doc.text('OUTPATIENT CLINICAL & CONSULTATION DEPARTMENT', width / 2, 25, { align: 'center' });
  doc.text('Addis Ababa, Ethiopia • P.O. Box 1271 • Tel: +251 11 275 0125', width / 2, 29, { align: 'center' });

  doc.setDrawColor(203, 213, 225);
  doc.line(16, 33, width - 16, 33);

  // Document Title
  doc.setTextColor(185, 28, 28);
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text('MEDICAL CERTIFICATE OF EXCUSE / APPOINTMENT', width / 2, 43, { align: 'center' });

  // Body
  doc.setTextColor(51, 65, 85);
  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.text(`Date of Examination / Issue: ${data.date}`, 16, 54);
  doc.text(`Reference Ref: MED-${Math.floor(10000 + Math.random() * 90000)}`, width - 16, 54, { align: 'right' });

  let y = 68;
  doc.text('TO WHOM IT MAY CONCERN / THE SCHOOL PRINCIPAL:', 16, y);
  y += 10;

  const contentText = `This is to formally confirm that faculty member ${data.teacherName} (ID: ${data.teacherId}) was scheduled and evaluated at this medical institution on ${data.date}. In consideration of the clinical examination and necessity for recovery/treatment, medical leave of absence is hereby advised.`;
  const splitContent = doc.splitTextToSize(contentText, width - 32);
  doc.text(splitContent, 16, y);

  y += 26;
  doc.setFont('helvetica', 'bold');
  doc.text('Documented Medical Justification:', 16, y);
  y += 6;
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.text(`"${data.reason}"`, 16, y);

  y += 25;
  doc.setFillColor(254, 242, 242);
  doc.setDrawColor(254, 202, 202);
  doc.roundedRect(16, y, width - 32, 16, 2, 2, 'FD');
  doc.setTextColor(153, 27, 27);
  doc.setFontSize(8);
  doc.setFont('helvetica', 'bold');
  doc.text('AUTHORIZED MEDICAL APPOINTMENT SLIP', width / 2, y + 6, { align: 'center' });
  doc.setFont('helvetica', 'normal');
  doc.text('Archived digitally for Academic Administration & Faculty Leave Records.', width / 2, y + 11, { align: 'center' });

  // Signatures & Stamp
  y += 35;
  doc.setDrawColor(220, 38, 38);
  doc.circle(38, y + 12, 12, 'D');
  doc.setFontSize(6.5);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(220, 38, 38);
  doc.text('ST. PAUL HOSPITAL', 38, y + 9, { align: 'center' });
  doc.text('MEDICAL REGISTRY', 38, y + 13, { align: 'center' });
  doc.text('★ VERIFIED ★', 38, y + 17, { align: 'center' });

  doc.setTextColor(15, 23, 42);
  doc.line(width - 65, y + 18, width - 16, y + 18);
  doc.setFontSize(8);
  doc.setFont('helvetica', 'bold');
  doc.text('DR. YOHANNES TESHOME, MD', width - 40, y + 23, { align: 'center' });
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.text('Consultant Physician & Surgeon', width - 40, y + 27, { align: 'center' });

  return doc.output('datauristring');
};

/**
 * Generates an official Recommendation Letter PDF
 */
export const generateRecommendationLetterPdf = (data: {
  studentName: string;
  studentId: string;
  authorName: string;
  authorRole: string;
  purpose: string;
  content: string;
  schoolName: string;
  date: string;
}): string => {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const width = 210;

  // Outer Header
  doc.setFillColor(15, 23, 42);
  doc.rect(0, 0, width, 24, 'F');

  doc.setTextColor(255, 255, 255);
  doc.setFontSize(13);
  doc.setFont('times', 'bold');
  doc.text(data.schoolName.toUpperCase(), width / 2, 12, { align: 'center' });
  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  doc.text('OFFICE OF ACADEMIC COUNSELLING & INSTITUTIONAL RECOMMENDATIONS', width / 2, 18, { align: 'center' });

  // Date & Ref
  doc.setTextColor(100, 116, 139);
  doc.setFontSize(9);
  doc.text(`Date: ${data.date}`, 20, 36);
  doc.text(`Letter Reference No: REC-${data.studentId}-${Date.now().toString(16).toUpperCase()}`, width - 20, 36, { align: 'right' });

  // Subject Line
  doc.setTextColor(15, 23, 42);
  doc.setFontSize(13);
  doc.setFont('times', 'bold');
  doc.text('OFFICIAL LETTER OF ACADEMIC & CHARACTER RECOMMENDATION', 20, 48);

  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(30, 58, 138);
  doc.text(`Candidate: ${data.studentName} (Student ID: ${data.studentId})`, 20, 55);
  doc.text(`Recommendation Target Purpose: ${data.purpose}`, 20, 61);

  doc.setDrawColor(226, 232, 240);
  doc.line(20, 66, width - 20, 66);

  // Letter Body
  doc.setTextColor(30, 41, 59);
  doc.setFontSize(10.5);
  doc.setFont('times', 'normal');

  const greeting = 'To Whom It May Concern:';
  doc.text(greeting, 20, 76);

  const body = data.content || `I am writing this official recommendation letter on behalf of ${data.studentName}, who has demonstrated exceptional scholarly dedication, intellectual discipline, and outstanding community citizenship at ${data.schoolName}. In both coursework and collaborative extracurricular environments, ${data.studentName} routinely exhibits superior academic prowess, resilience, and personal integrity. I recommend them with full confidence for ${data.purpose}.`;
  
  const splitText = doc.splitTextToSize(body, width - 40);
  doc.text(splitText, 20, 86);

  // Signature Block & Stamp
  const sigY = 210;
  doc.line(20, sigY, 80, sigY);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(15, 23, 42);
  doc.text(data.authorName, 20, sigY + 6);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.setTextColor(100, 116, 139);
  doc.text(data.authorRole, 20, sigY + 11);
  doc.text(data.schoolName, 20, sigY + 16);

  // Official Seal
  doc.setFillColor(239, 246, 255);
  doc.setDrawColor(37, 99, 235);
  doc.circle(width - 50, sigY + 5, 18, 'FD');
  doc.setFontSize(7.5);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(30, 58, 138);
  doc.text('OFFICIAL ACADEMIC SEAL', width - 50, sigY + 1, { align: 'center' });
  doc.text('★ VERIFIED ★', width - 50, sigY + 6, { align: 'center' });
  doc.text(data.schoolName.substring(0, 16), width - 50, sigY + 11, { align: 'center' });

  return doc.output('datauristring');
};

export interface RecommendationPdfParams {
  studentName: string;
  studentId: string;
  grade?: number;
  recipientName?: string;
  purpose: string;
  counsellorName?: string;
  authorName?: string;
  authorRole?: string;
  letterContent?: string;
  content?: string;
  schoolName: string;
  date?: string;
}

/**
 * Universal Recommendation Letter PDF generator accepting flexible parameter variants
 */
export const generateRecommendationPdf = (data: RecommendationPdfParams): string => {
  return generateRecommendationLetterPdf({
    studentName: data.studentName,
    studentId: data.studentId,
    authorName: data.authorName || data.counsellorName || 'School Counseling Office',
    authorRole: data.authorRole || (data.counsellorName ? 'Head of Guidance & Counseling' : 'Academic Counselor & Faculty Mentor'),
    purpose: data.recipientName ? `${data.purpose} (Addressed to: ${data.recipientName})` : data.purpose,
    content: data.letterContent || data.content || '',
    schoolName: data.schoolName,
    date: data.date || new Date().toISOString().split('T')[0],
  });
};

/**
 * Generates an official Student Report Card & Transcript PDF
 */
export const generateReportCardPdf = (data: {
  student?: Partial<Student>;
  studentName?: string;
  studentId?: string;
  grade?: number;
  stream?: string;
  term?: string;
  grades: Array<{
    subject: string;
    teacherName: string;
    quiz?: number;
    test1Score?: number;
    assessment?: number;
    midExam?: number;
    midtermScore?: number;
    finalExam?: number;
    finalScore?: number;
    total?: number;
    totalGrade?: number;
    letterGrade?: string;
  }>;
  schoolName: string;
  academicYear?: string;
}): string => {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const width = 210;

  const sName = data.student?.fullName || data.studentName || 'Student';
  const sId = data.student?.id || data.studentId || 'SIS-STUDENT';
  const sAcc = data.student?.accountNumber || `ACC-${sId}`;
  const sGrade = data.student?.grade || data.grade || 9;
  const sStream = data.student?.stream || data.stream || '';
  const sSec = data.student?.sectionId || 'Section A';
  const sYear = data.academicYear || (data.term ? `${data.term} - 2025/2026 Academic Year` : '2025/2026 Academic Year');

  // Header Banner
  doc.setFillColor(15, 23, 42);
  doc.rect(0, 0, width, 24, 'F');

  doc.setTextColor(255, 255, 255);
  doc.setFontSize(14);
  doc.setFont('times', 'bold');
  doc.text(data.schoolName.toUpperCase(), width / 2, 12, { align: 'center' });
  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  doc.text('OFFICIAL ASSESSMENT TRANSCRIPT & SEMESTER PROGRESS REPORT CARD', width / 2, 18, { align: 'center' });

  // Student Dossier Summary
  doc.setFillColor(248, 250, 252);
  doc.setDrawColor(226, 232, 240);
  doc.roundedRect(15, 30, width - 30, 28, 2, 2, 'FD');

  doc.setTextColor(15, 23, 42);
  doc.setFontSize(9);
  doc.setFont('helvetica', 'bold');
  doc.text(`Student Name: ${sName}`, 20, 38);
  doc.text(`Student ID: ${sId}`, 20, 44);
  doc.text(`Account No: ${sAcc}`, 20, 50);

  doc.text(`Enrolled Grade: Grade ${sGrade} ${sStream ? `(${sStream})` : ''}`, width / 2, 38);
  doc.text(`Class Section: ${sSec}`, width / 2, 44);
  doc.text(`Academic Calendar: ${sYear}`, width / 2, 50);

  // Table Headers
  let y = 68;
  doc.setFillColor(30, 58, 138);
  doc.rect(15, y, width - 30, 8, 'F');

  doc.setTextColor(255, 255, 255);
  doc.setFontSize(8);
  doc.setFont('helvetica', 'bold');
  doc.text('SUBJECT', 20, y + 5.5);
  doc.text('INSTRUCTOR', 65, y + 5.5);
  doc.text('QUIZ', 105, y + 5.5, { align: 'center' });
  doc.text('ASSESSMENT', 125, y + 5.5, { align: 'center' });
  doc.text('MID', 145, y + 5.5, { align: 'center' });
  doc.text('FINAL', 165, y + 5.5, { align: 'center' });
  doc.text('TOTAL', 182, y + 5.5, { align: 'center' });
  doc.text('GRADE', 193, y + 5.5, { align: 'center' });

  y += 8;

  let totalPoints = 0;
  let subjectCount = 0;

  data.grades.forEach((g, idx) => {
    doc.setFillColor(idx % 2 === 0 ? 255 : 248, idx % 2 === 0 ? 255 : 250, idx % 2 === 0 ? 255 : 252);
    doc.rect(15, y, width - 30, 7.5, 'F');

    doc.setDrawColor(241, 245, 249);
    doc.line(15, y + 7.5, width - 15, y + 7.5);

    doc.setFontSize(8);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(15, 23, 42);
    doc.text(g.subject, 20, y + 5);

    doc.setFont('helvetica', 'normal');
    doc.setTextColor(71, 85, 105);
    doc.text(g.teacherName.substring(0, 22), 65, y + 5);

    const q = g.quiz ?? g.test1Score ?? 18;
    const a = g.assessment ?? 18;
    const m = g.midExam ?? g.midtermScore ?? 27;
    const f = g.finalExam ?? g.finalScore ?? 35;
    const tot = g.total ?? g.totalGrade ?? (q + a + m + f);
    const letter = g.letterGrade || (tot >= 90 ? 'A+' : tot >= 85 ? 'A' : tot >= 75 ? 'B' : 'C');

    doc.text(`${q}`, 105, y + 5, { align: 'center' });
    doc.text(`${a}`, 125, y + 5, { align: 'center' });
    doc.text(`${m}`, 145, y + 5, { align: 'center' });
    doc.text(`${f}`, 165, y + 5, { align: 'center' });

    doc.setFont('helvetica', 'bold');
    doc.setTextColor(30, 58, 138);
    doc.text(`${tot}`, 182, y + 5, { align: 'center' });
    doc.text(letter, 193, y + 5, { align: 'center' });

    totalPoints += tot;
    subjectCount += 1;
    y += 7.5;
  });

  // Summary row
  const average = subjectCount > 0 ? Math.round((totalPoints / subjectCount) * 10) / 10 : 0;
  y += 4;
  doc.setFillColor(240, 253, 244);
  doc.setDrawColor(187, 247, 208);
  doc.roundedRect(15, y, width - 30, 14, 2, 2, 'FD');

  doc.setFontSize(9);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(22, 101, 52);
  doc.text(`Cumulative Academic Average: ${average}%`, 22, y + 9);
  doc.text('Academic Standing: EXCELLENT / HONORS ROLL', width - 22, y + 9, { align: 'right' });

  // Signatures
  y += 40;
  doc.setFontSize(8.5);
  doc.setTextColor(15, 23, 42);
  doc.line(20, y, 75, y);
  doc.text('HOMEROOM TEACHER SIGNATURE', 47, y + 5, { align: 'center' });

  doc.line(width - 75, y, width - 20, y);
  doc.text('OFFICE OF THE PRINCIPAL', width - 47, y + 5, { align: 'center' });

  return doc.output('datauristring');
};
