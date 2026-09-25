import jsPDF from 'jspdf';
import { TranscriptCourseRecord, TranscriptAnalysisResult } from '../types';

export const SAMPLE_ETHIOPIAN_COURSES: TranscriptCourseRecord[] = [
  {
    id: 'eth-c-01',
    subject: 'English Language',
    gradeLevel: 9,
    academicYear: '2015 E.C. (2022/2023)',
    semester1Score: 89,
    semester2Score: 91,
    finalAverage: 90,
    letterGrade: 'A',
    creditsOrPeriods: 4,
    conduct: 'A',
    remarks: 'Passed'
  },
  {
    id: 'eth-c-02',
    subject: 'Amharic (Mother Tongue)',
    gradeLevel: 9,
    academicYear: '2015 E.C. (2022/2023)',
    semester1Score: 84,
    semester2Score: 86,
    finalAverage: 85,
    letterGrade: 'A',
    creditsOrPeriods: 3,
    conduct: 'A',
    remarks: 'Passed'
  },
  {
    id: 'eth-c-03',
    subject: 'Mathematics',
    gradeLevel: 9,
    academicYear: '2015 E.C. (2022/2023)',
    semester1Score: 92,
    semester2Score: 96,
    finalAverage: 94,
    letterGrade: 'A+',
    creditsOrPeriods: 5,
    conduct: 'A',
    remarks: 'Passed'
  },
  {
    id: 'eth-c-04',
    subject: 'Physics',
    gradeLevel: 9,
    academicYear: '2015 E.C. (2022/2023)',
    semester1Score: 88,
    semester2Score: 90,
    finalAverage: 89,
    letterGrade: 'A',
    creditsOrPeriods: 3,
    conduct: 'A',
    remarks: 'Passed'
  },
  {
    id: 'eth-c-05',
    subject: 'Chemistry',
    gradeLevel: 9,
    academicYear: '2015 E.C. (2022/2023)',
    semester1Score: 85,
    semester2Score: 87,
    finalAverage: 86,
    letterGrade: 'A',
    creditsOrPeriods: 3,
    conduct: 'A',
    remarks: 'Passed'
  },
  {
    id: 'eth-c-06',
    subject: 'Biology',
    gradeLevel: 9,
    academicYear: '2015 E.C. (2022/2023)',
    semester1Score: 86,
    semester2Score: 88,
    finalAverage: 87,
    letterGrade: 'A',
    creditsOrPeriods: 3,
    conduct: 'A',
    remarks: 'Passed'
  },
  {
    id: 'eth-c-07',
    subject: 'Civics & Ethical Education',
    gradeLevel: 9,
    academicYear: '2015 E.C. (2022/2023)',
    semester1Score: 91,
    semester2Score: 93,
    finalAverage: 92,
    letterGrade: 'A+',
    creditsOrPeriods: 3,
    conduct: 'A',
    remarks: 'Passed'
  },
  {
    id: 'eth-c-08',
    subject: 'History',
    gradeLevel: 9,
    academicYear: '2015 E.C. (2022/2023)',
    semester1Score: 82,
    semester2Score: 84,
    finalAverage: 83,
    letterGrade: 'B+',
    creditsOrPeriods: 3,
    conduct: 'A',
    remarks: 'Passed'
  },
  {
    id: 'eth-c-09',
    subject: 'Geography',
    gradeLevel: 9,
    academicYear: '2015 E.C. (2022/2023)',
    semester1Score: 84,
    semester2Score: 86,
    finalAverage: 85,
    letterGrade: 'A',
    creditsOrPeriods: 3,
    conduct: 'A',
    remarks: 'Passed'
  },
  {
    id: 'eth-c-10',
    subject: 'Information & Communication Tech (ICT)',
    gradeLevel: 9,
    academicYear: '2015 E.C. (2022/2023)',
    semester1Score: 94,
    semester2Score: 96,
    finalAverage: 95,
    letterGrade: 'A+',
    creditsOrPeriods: 3,
    conduct: 'A',
    remarks: 'Passed'
  },
  {
    id: 'eth-c-11',
    subject: 'Health & Physical Education (HPE)',
    gradeLevel: 9,
    academicYear: '2015 E.C. (2022/2023)',
    semester1Score: 90,
    semester2Score: 92,
    finalAverage: 91,
    letterGrade: 'A+',
    creditsOrPeriods: 2,
    conduct: 'A',
    remarks: 'Passed'
  }
];

export const SAMPLE_ETHIOPIAN_ANALYSIS: TranscriptAnalysisResult = {
  analyzedAt: new Date().toISOString(),
  fileName: 'Ethiopian_Official_Transcript_Grade9_Dawit_Haile.pdf',
  fileSize: '148 KB',
  fileType: 'application/pdf',
  studentNameFound: 'Dawit Haile Gebremariam',
  schoolNameFound: 'Addis Ababa Senior Secondary Comprehensive School',
  gradeLevelAnalyzed: 9,
  academicYear: '2015 E.C. (2022/2023)',
  totalAverageScore: 88.8,
  overallLetterGrade: 'A',
  totalSubjectsCount: 11,
  passedCount: 11,
  rankInClass: '3rd / 54 Students',
  conductRating: 'Excellent (A)',
  promotionStatus: 'PROMOTED TO GRADE 10',
  summaryNotes: 'Authentic Ethiopian Ministry of Education secondary transcript for Grade 9. All 11 general curriculum subjects verified with passing marks above 80%. Prerequisites for Grade 10 enrollment fulfilled with academic excellence.',
  courses: SAMPLE_ETHIOPIAN_COURSES
};

/**
 * Generates an official-looking Ethiopian Secondary School Academic Transcript PDF
 * conforming to Ministry of Education / Regional Education Bureau formats.
 */
export function generateSampleEthiopianTranscriptPdf(): string {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4'
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();

  // Background tint & outer double border
  doc.setDrawColor(30, 41, 59); // slate-800
  doc.setLineWidth(0.8);
  doc.rect(8, 8, pageWidth - 16, pageHeight - 16);
  doc.setLineWidth(0.3);
  doc.rect(10, 10, pageWidth - 20, pageHeight - 20);

  // Top Ethiopian MoE Header
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(30, 41, 59);
  doc.text('FEDERAL DEMOCRATIC REPUBLIC OF ETHIOPIA', pageWidth / 2, 17, { align: 'center' });
  doc.setFontSize(9);
  doc.text('MINISTRY OF EDUCATION — ADDIS ABABA EDUCATION BUREAU', pageWidth / 2, 22, { align: 'center' });
  
  // School Name
  doc.setFontSize(14);
  doc.setTextColor(15, 23, 42);
  doc.text('ADDIS ABABA SENIOR SECONDARY SCHOOL', pageWidth / 2, 29, { align: 'center' });
  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(100, 116, 139);
  doc.text('P.O. Box 1024, Yeka Sub-City, Addis Ababa, Ethiopia | Tel: +251 11 123 4567', pageWidth / 2, 33, { align: 'center' });

  // Title Box
  doc.setFillColor(241, 245, 249);
  doc.rect(12, 36, pageWidth - 24, 9, 'F');
  doc.setDrawColor(203, 213, 225);
  doc.rect(12, 36, pageWidth - 24, 9, 'S');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(30, 58, 138); // blue-900
  doc.text('OFFICIAL SECONDARY SCHOOL ACADEMIC TRANSCRIPT / የተማሪ የትምህርት ማስረጃ', pageWidth / 2, 42, { align: 'center' });

  // Student Bio Grid
  const bioY = 49;
  doc.setFontSize(8.5);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(51, 65, 85);

  doc.text('Student Full Name:', 14, bioY);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(15, 23, 42);
  doc.text('Dawit Haile Gebremariam', 46, bioY);

  doc.setFont('helvetica', 'bold');
  doc.setTextColor(51, 65, 85);
  doc.text('Sex / Gender:', 110, bioY);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(15, 23, 42);
  doc.text('Male', 133, bioY);

  doc.setFont('helvetica', 'bold');
  doc.setTextColor(51, 65, 85);
  doc.text('Student ID / Roll No:', 155, bioY);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(15, 23, 42);
  doc.text('ETH-9B-018', 186, bioY);

  const bioY2 = bioY + 5;
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(51, 65, 85);
  doc.text('Academic Year:', 14, bioY2);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(15, 23, 42);
  doc.text('2015 E.C. (2022/2023 G.C.)', 46, bioY2);

  doc.setFont('helvetica', 'bold');
  doc.setTextColor(51, 65, 85);
  doc.text('Grade Completed:', 110, bioY2);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(15, 23, 42);
  doc.text('Grade 9 (Section B)', 138, bioY2);

  doc.setFont('helvetica', 'bold');
  doc.setTextColor(51, 65, 85);
  doc.text('Age / DOB:', 155, bioY2);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(15, 23, 42);
  doc.text('15 Years (2007-09-12)', 175, bioY2);

  // Divider line
  doc.setDrawColor(226, 232, 240);
  doc.line(12, bioY2 + 3, pageWidth - 12, bioY2 + 3);

  // Table Header
  const tableStartY = bioY2 + 6;
  doc.setFillColor(30, 41, 59);
  doc.rect(12, tableStartY, pageWidth - 24, 7, 'F');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.setTextColor(255, 255, 255);
  doc.text('NO', 15, tableStartY + 5);
  doc.text('SUBJECT TITLE / የትምህርት ዓይነት', 25, tableStartY + 5);
  doc.text('PERIODS', 98, tableStartY + 5);
  doc.text('SEM 1 (100%)', 114, tableStartY + 5);
  doc.text('SEM 2 (100%)', 135, tableStartY + 5);
  doc.text('AVERAGE', 156, tableStartY + 5);
  doc.text('LETTER', 174, tableStartY + 5);
  doc.text('STATUS', 188, tableStartY + 5);

  let currentY = tableStartY + 7;
  doc.setFontSize(8);

  SAMPLE_ETHIOPIAN_COURSES.forEach((course, idx) => {
    // Alternating rows
    if (idx % 2 === 0) {
      doc.setFillColor(248, 250, 252);
      doc.rect(12, currentY, pageWidth - 24, 6.5, 'F');
    }
    doc.setDrawColor(226, 232, 240);
    doc.rect(12, currentY, pageWidth - 24, 6.5, 'S');

    doc.setFont('helvetica', 'normal');
    doc.setTextColor(71, 85, 105);
    doc.text(String(idx + 1).padStart(2, '0'), 15, currentY + 4.5);

    doc.setFont('helvetica', 'bold');
    doc.setTextColor(15, 23, 42);
    doc.text(course.subject, 25, currentY + 4.5);

    doc.setFont('helvetica', 'normal');
    doc.setTextColor(51, 65, 85);
    doc.text(String(course.creditsOrPeriods || 3), 103, currentY + 4.5);
    doc.text(String(course.semester1Score || '-'), 120, currentY + 4.5);
    doc.text(String(course.semester2Score || '-'), 141, currentY + 4.5);

    doc.setFont('helvetica', 'bold');
    doc.text(String(course.finalAverage), 162, currentY + 4.5);

    doc.setTextColor(30, 64, 175);
    doc.text(course.letterGrade, 178, currentY + 4.5);

    doc.setTextColor(22, 101, 52);
    doc.text(course.remarks || 'Pass', 190, currentY + 4.5);

    currentY += 6.5;
  });

  // Summary Row
  doc.setFillColor(241, 245, 249);
  doc.rect(12, currentY, pageWidth - 24, 15, 'F');
  doc.setDrawColor(148, 163, 184);
  doc.rect(12, currentY, pageWidth - 24, 15, 'S');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.setTextColor(15, 23, 42);

  doc.text('TOTAL MARKS: 977 / 1100', 16, currentY + 5);
  doc.text('ANNUAL CUMULATIVE AVERAGE: 88.8%', 85, currentY + 5);
  doc.text('GRADE RANK: 3rd / 54 Students', 150, currentY + 5);

  doc.text('STUDENT CONDUCT: Excellent (A)', 16, currentY + 11);
  doc.setTextColor(22, 101, 52);
  doc.text('PROMOTION DECISION: PROMOTED TO GRADE 10 (አስረኛ ክፍል ያለፈ)', 85, currentY + 11);

  currentY += 21;

  // Ministry Grading Scale Reference
  doc.setFontSize(7);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(100, 116, 139);
  doc.text('National Grading Scale: A+ (90-100% Exceptional) | A (85-89% Excellent) | B+ (80-84% Very Good) | B (75-79% Good) | C (60-74% Satisfactory) | F (<50% Unsatisfactory)', 14, currentY);

  currentY += 10;

  // Attestation Signatures & Official Stamp
  const sigY = currentY;
  
  // Homeroom Teacher
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(30, 41, 59);
  doc.text('Teacher Yohannes Tesfaye', 18, sigY + 12);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(100, 116, 139);
  doc.text('Homeroom Teacher Signature', 18, sigY + 16);
  doc.line(18, sigY + 9, 65, sigY + 9);

  // Registrar Officer
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(30, 41, 59);
  doc.text('Aster Bekele (Senior Registrar)', 78, sigY + 12);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(100, 116, 139);
  doc.text('Records & Admissions Officer', 78, sigY + 16);
  doc.line(78, sigY + 9, 130, sigY + 9);

  // Director Seal & Stamp Box
  doc.setDrawColor(59, 130, 246);
  doc.setLineWidth(0.5);
  doc.roundedRect(145, sigY - 4, 52, 24, 2, 2, 'S');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.setTextColor(30, 58, 138);
  doc.text('OFFICIAL REGISTRAR STAMP', 148, sigY);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(6.5);
  doc.setTextColor(100, 116, 139);
  doc.text('Addis Ababa Secondary Comprehensive', 148, sigY + 4);
  doc.text('Verified & Sealed Document', 148, sigY + 8);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(22, 101, 52);
  doc.text('AUTHENTICATED: 2015 E.C.', 148, sigY + 13);
  doc.setTextColor(71, 85, 105);
  doc.text('Dr. Berhanu Wolde, Principal', 148, sigY + 17);

  // Bottom Notice
  doc.setFontSize(6.5);
  doc.setTextColor(148, 163, 184);
  doc.text('Notice: Any alteration, erasure, or unauthorized duplication of this official transcript renders it void under Ethiopian Ministry of Education penal regulations.', pageWidth / 2, pageHeight - 12, { align: 'center' });

  return doc.output('datauristring');
}
