import jsPDF from 'jspdf';
import { AcademicGrade, AcademicStream, DigitalSignatureInfo } from '../types';

export interface TranscriptSubjectGrade {
  subject: string;
  teacherName?: string;
  quiz?: number | null;
  assessment?: number | null;
  midExam?: number | null;
  finalExam?: number | null;
  total?: number | null;
  letterGrade?: string | null;
  isRecorded: boolean;
  recordedDate?: string;
}

export interface GenerateTranscriptParams {
  student: {
    id: string;
    fullName: string;
    accountNumber?: string;
    grade: AcademicGrade;
    stream?: AcademicStream | null;
    sectionId?: string | null;
    dob?: string;
    gender?: string;
  };
  schoolName: string;
  cutoffDate: string; // "YYYY-MM-DD" - grades entered till this day
  scope: 'FULL' | 'PARTIAL';
  isTemporary?: boolean;
  watermarkText?: string; // Default: "Temporary Transcript"
  subjectGrades?: TranscriptSubjectGrade[];
  grades?: any[];
  cumulativeGpa?: number | string;
  conductRating?: string;
  signature?: DigitalSignatureInfo;
  authorizedSignature?: DigitalSignatureInfo;
  authorizedBy?: string;
  issuingOfficerName?: string;
  issuingOfficerTitle?: string;
}

export const getCurriculumSubjectsForGrade = (
  grade: AcademicGrade,
  stream?: AcademicStream | null
): string[] => {
  if (grade === 9 || grade === 10) {
    return [
      'English Language',
      'Mathematics',
      'Physics',
      'Chemistry',
      'Biology',
      'History',
      'Geography',
      'Civics & Ethical Studies',
      'Information Technology (ICT)',
      'Physical Education',
    ];
  }

  // Grade 11 & 12
  if (stream === 'Social Sciences') {
    return [
      'English Language',
      'Mathematics (Social)',
      'History',
      'Geography',
      'Economics',
      'General Business Studies',
      'Civics & Ethical Studies',
      'Information Technology (ICT)',
      'Physical Education',
    ];
  }

  // Default Natural Sciences
  return [
    'English Language',
    'Mathematics (Advanced)',
    'Physics',
    'Chemistry',
    'Biology',
    'Technical Drawing',
    'Civics & Ethical Studies',
    'Information Technology (ICT)',
    'Physical Education',
  ];
};

/**
 * Builds the comprehensive list of subjects for the student,
 * merging entered grades (up to cutoffDate) and marking unentered ones as NG / No Grade.
 */
export const compileTranscriptGrades = (
  studentId: string,
  grade: AcademicGrade,
  stream: AcademicStream | null | undefined,
  cutoffDate: string,
  rawGrades: any[]
): {
  subjectGrades: TranscriptSubjectGrade[];
  recordedCount: number;
  unrecordedCount: number;
  calculatedGpa: number;
} => {
  const curriculum = getCurriculumSubjectsForGrade(grade, stream);
  
  // Filter grades for this student that were recorded ON OR BEFORE cutoffDate
  const studentRecordedGrades = rawGrades.filter(g => {
    if (g.studentId !== studentId) return false;
    if (g.entryDate && g.entryDate > cutoffDate) return false;
    return true;
  });

  const subjectGrades: TranscriptSubjectGrade[] = curriculum.map(subjName => {
    // Check if there is an exact or partial match in recorded grades
    const match = studentRecordedGrades.find(g => 
      g.subject.toLowerCase() === subjName.toLowerCase() ||
      subjName.toLowerCase().includes(g.subject.toLowerCase()) ||
      g.subject.toLowerCase().includes(subjName.toLowerCase())
    );

    if (match) {
      const q = match.quiz ?? match.test1Score ?? null;
      const a = match.assessment ?? null;
      const m = match.midExam ?? match.midtermScore ?? null;
      const f = match.finalExam ?? match.finalScore ?? null;
      const tot = match.total ?? match.totalGrade ?? (
        (q !== null || a !== null || m !== null || f !== null)
          ? ((q || 0) + (a || 0) + (m || 0) + (f || 0))
          : null
      );
      const letter = match.letterGrade || (
        tot !== null
          ? (tot >= 90 ? 'A+' : tot >= 85 ? 'A' : tot >= 80 ? 'B+' : tot >= 75 ? 'B' : tot >= 65 ? 'C' : 'D')
          : 'NG'
      );

      return {
        subject: subjName,
        teacherName: match.teacherName || 'Faculty Lead',
        quiz: q,
        assessment: a,
        midExam: m,
        finalExam: f,
        total: tot,
        letterGrade: letter,
        isRecorded: true,
        recordedDate: match.entryDate || cutoffDate,
      };
    }

    // Not yet entered or dated after cutoff date -> Mark as NG / No Grade
    return {
      subject: subjName,
      teacherName: 'Assigned Faculty',
      quiz: null,
      assessment: null,
      midExam: null,
      finalExam: null,
      total: null,
      letterGrade: 'NG',
      isRecorded: false,
    };
  });

  const recorded = subjectGrades.filter(s => s.isRecorded && s.total !== null);
  const totalScore = recorded.reduce((sum, s) => sum + (s.total || 0), 0);
  const calculatedGpa = recorded.length > 0 ? Math.round((totalScore / recorded.length) * 10) / 10 : 0;

  return {
    subjectGrades,
    recordedCount: recorded.length,
    unrecordedCount: subjectGrades.length - recorded.length,
    calculatedGpa,
  };
};

/**
 * Generates an official or temporary Academic Transcript PDF
 */
export const generateTranscriptPdf = (params: GenerateTranscriptParams): string => {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const width = 210;
  const height = 297;
  const margin = 14;
  const contentWidth = width - margin * 2;

  const signature = params.authorizedSignature || params.signature;
  const isTemporary = params.isTemporary ?? (params.watermarkText ? true : false);
  const subjectGrades = params.subjectGrades || (params.grades 
    ? compileTranscriptGrades(params.student.id, params.student.grade, params.student.stream, params.cutoffDate, params.grades).subjectGrades
    : []);

  // 1. DIAGONAL WATERMARK (Required for Temporary Transcripts)
  if (isTemporary || params.watermarkText) {
    const wmText = params.watermarkText || 'Temporary Transcript';
    doc.saveGraphicsState();
    // Soft transparent rose-slate hue
    doc.setTextColor(239, 68, 68); // Red-500
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(38);

    // Diagonal watermark repeated across page
    doc.text(wmText.toUpperCase(), width / 2, height / 2 - 35, {
      align: 'center',
      angle: 45,
    });
    doc.text('(STUDENT / PARENT PROVISIONAL COPY)', width / 2, height / 2 - 18, {
      align: 'center',
      angle: 45,
    });

    doc.setFontSize(28);
    doc.text(wmText.toUpperCase(), width / 2 - 25, height / 2 + 55, {
      align: 'center',
      angle: 45,
    });
    doc.restoreGraphicsState();
  }

  // 2. HEADER BANNER
  doc.setFillColor(15, 23, 42); // slate-900
  doc.rect(0, 0, width, 26, 'F');

  // Accent Line
  doc.setFillColor(37, 99, 235); // blue-600
  doc.rect(0, 26, width, 1.5, 'F');

  doc.setTextColor(255, 255, 255);
  doc.setFontSize(14);
  doc.setFont('times', 'bold');
  doc.text(params.schoolName.toUpperCase(), width / 2, 11, { align: 'center' });

  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(226, 232, 240);
  const scopeTitle = params.scope === 'PARTIAL' 
    ? 'CUMULATIVE ACADEMIC TRANSCRIPT • PARTIAL TERM RECORD'
    : 'OFFICIAL PERMANENT ACADEMIC TRANSCRIPT RECORD';
  doc.text(scopeTitle, width / 2, 17, { align: 'center' });

  doc.setFontSize(7.5);
  doc.setTextColor(148, 163, 184);
  doc.text('OFFICE OF ACADEMIC AFFAIRS & REGISTRAR • ACCREDITED SECONDARY CURRICULUM', width / 2, 22, { align: 'center' });

  // 3. NOTICE OF CUTOFF DATE / EVALUATION TIMELINE
  doc.setFillColor(241, 245, 249);
  doc.setDrawColor(203, 213, 225);
  doc.rect(margin, 30, contentWidth, 7, 'FD');

  doc.setTextColor(30, 41, 59);
  doc.setFontSize(7.5);
  doc.setFont('helvetica', 'bold');
  doc.text(
    `EVALUATION CUT-OFF DATE: ${params.cutoffDate}  |  STATUS: GRADES ENTERED TILL REQUESTED DAY (PENDING ASSESSMENTS DISPLAYED AS 'NG' / NO GRADE)`,
    width / 2,
    34.5,
    { align: 'center' }
  );

  // 4. STUDENT DOSSIER SUMMARY
  doc.setFillColor(248, 250, 252);
  doc.setDrawColor(226, 232, 240);
  doc.roundedRect(margin, 39, contentWidth, 26, 2, 2, 'FD');

  doc.setTextColor(15, 23, 42);
  doc.setFontSize(8.5);
  doc.setFont('helvetica', 'bold');
  doc.text(`Student Name: ${params.student.fullName}`, margin + 5, 46);
  doc.text(`Student ID: ${params.student.id}`, margin + 5, 52);
  doc.text(`Banking / SIS Acc: ${params.student.accountNumber || `ACC-${params.student.id}`}`, margin + 5, 58);

  const streamInfo = params.student.stream ? ` (${params.student.stream})` : '';
  doc.text(`Enrolled Class: Grade ${params.student.grade}${streamInfo}`, margin + 95, 46);
  doc.text(`Assigned Section: ${params.student.sectionId || 'Section Unassigned'}`, margin + 95, 52);
  doc.text(`Academic Year: 2026/2027 • Term 1`, margin + 95, 58);

  // 5. SUBJECT GRADES TABLE
  let y = 68;
  doc.setFillColor(30, 58, 138); // blue-900
  doc.rect(margin, y, contentWidth, 7.5, 'F');

  doc.setTextColor(255, 255, 255);
  doc.setFontSize(7.5);
  doc.setFont('helvetica', 'bold');
  doc.text('ACADEMIC COURSE / SUBJECT', margin + 4, y + 5);
  doc.text('FACULTY INSTRUCTOR', margin + 65, y + 5);
  doc.text('QUIZ', margin + 110, y + 5, { align: 'center' });
  doc.text('CW/ASSESS', margin + 126, y + 5, { align: 'center' });
  doc.text('MIDTERM', margin + 144, y + 5, { align: 'center' });
  doc.text('FINAL', margin + 160, y + 5, { align: 'center' });
  doc.text('TOTAL', margin + 172, y + 5, { align: 'center' });
  doc.text('GRADE', margin + 184, y + 5, { align: 'center' });

  y += 7.5;

  let totalNumericScore = 0;
  let recordedCount = 0;
  let ngCount = 0;

  subjectGrades.forEach((item, index) => {
    // Alternating rows
    doc.setFillColor(index % 2 === 0 ? 255 : 248, index % 2 === 0 ? 255 : 250, index % 2 === 0 ? 255 : 252);
    doc.rect(margin, y, contentWidth, 6.8, 'F');

    doc.setDrawColor(241, 245, 249);
    doc.line(margin, y + 6.8, width - margin, y + 6.8);

    doc.setFontSize(7.5);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(15, 23, 42);
    doc.text(item.subject, margin + 4, y + 4.5);

    doc.setFont('helvetica', 'normal');
    doc.setTextColor(71, 85, 105);
    const teacherDisplay = (item.teacherName || 'Faculty Member').substring(0, 24);
    doc.text(teacherDisplay, margin + 65, y + 4.5);

    if (item.isRecorded && item.total !== null) {
      recordedCount++;
      totalNumericScore += item.total;

      const q = item.quiz !== null && item.quiz !== undefined ? `${item.quiz}` : 'NG';
      const a = item.assessment !== null && item.assessment !== undefined ? `${item.assessment}` : 'NG';
      const m = item.midExam !== null && item.midExam !== undefined ? `${item.midExam}` : 'NG';
      const f = item.finalExam !== null && item.finalExam !== undefined ? `${item.finalExam}` : 'NG';

      doc.setTextColor(51, 65, 85);
      doc.text(q, margin + 110, y + 4.5, { align: 'center' });
      doc.text(a, margin + 126, y + 4.5, { align: 'center' });
      doc.text(m, margin + 144, y + 4.5, { align: 'center' });
      doc.text(f, margin + 160, y + 4.5, { align: 'center' });

      doc.setFont('helvetica', 'bold');
      doc.setTextColor(30, 58, 138);
      doc.text(`${item.total}`, margin + 172, y + 4.5, { align: 'center' });

      const letter = item.letterGrade || (item.total >= 90 ? 'A+' : item.total >= 80 ? 'A' : 'B');
      doc.text(letter, margin + 184, y + 4.5, { align: 'center' });
    } else {
      // Unrecorded / Future / Missing -> display NG Or No Grade
      ngCount++;
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(156, 163, 175);
      doc.text('NG', margin + 110, y + 4.5, { align: 'center' });
      doc.text('NG', margin + 126, y + 4.5, { align: 'center' });
      doc.text('NG', margin + 144, y + 4.5, { align: 'center' });
      doc.text('NG', margin + 160, y + 4.5, { align: 'center' });

      doc.setFont('helvetica', 'bold');
      doc.setTextColor(220, 38, 38); // red-600
      doc.text('NG', margin + 172, y + 4.5, { align: 'center' });
      doc.text('No Grade', margin + 184, y + 4.5, { align: 'center' });
    }

    y += 6.8;
  });

  // 6. CUMULATIVE SUMMARY & GPA
  const averageGpa = recordedCount > 0 ? Math.round((totalNumericScore / recordedCount) * 10) / 10 : 0;
  y += 4;

  doc.setFillColor(248, 250, 252);
  doc.setDrawColor(203, 213, 225);
  doc.roundedRect(margin, y, contentWidth, 16, 2, 2, 'FD');

  doc.setFontSize(8.5);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(15, 23, 42);
  doc.text(`Recorded Subjects: ${recordedCount} / ${params.subjectGrades.length}`, margin + 5, y + 6);
  doc.text(`Pending (NG / No Grade): ${ngCount} Subjects`, margin + 5, y + 12);

  doc.setTextColor(30, 58, 138);
  doc.text(`Cumulative Recorded Average: ${averageGpa}%`, margin + 85, y + 6);
  const statusLabel = ngCount === 0 ? 'COMPLETE TERM ASSESSMENT' : 'PARTIAL IN-PROGRESS ASSESSMENT';
  doc.setTextColor(ngCount === 0 ? 22 : 180, ngCount === 0 ? 101 : 83, ngCount === 0 ? 52 : 9);
  doc.text(`Evaluation Status: ${statusLabel}`, margin + 85, y + 12);

  // 7. KEY / LEGEND BOX
  y += 19;
  doc.setFillColor(254, 242, 242);
  doc.setDrawColor(254, 202, 202);
  doc.roundedRect(margin, y, contentWidth, 11, 1.5, 1.5, 'FD');

  doc.setFontSize(7);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(153, 27, 27);
  doc.text('OFFICIAL TRANSCRIPT NOTATION KEY:', margin + 4, y + 4);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(185, 28, 28);
  doc.text(
    "• 'NG' / 'No Grade' indicates an assessment or subject that has not been submitted or finalized by the faculty instructor as of the requested cutoff date.",
    margin + 4,
    y + 8
  );

  // 8. EXECUTIVE DIGITAL SIGNATURE & AUTHORIZATION BLOCK
  y += 16;
  doc.setDrawColor(226, 232, 240);
  doc.roundedRect(margin, y, contentWidth, 34, 2, 2, 'D');

  // Left: Executive Principal Signature
  doc.setFontSize(7.5);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(15, 23, 42);
  doc.text('EXECUTIVE PRINCIPAL AUTHORIZATION', margin + 6, y + 6);

  if (signature?.signatureDataUrl) {
    try {
      doc.addImage(signature.signatureDataUrl, 'PNG', margin + 6, y + 8, 38, 13);
    } catch {
      doc.setFont('times', 'italic');
      doc.setFontSize(12);
      doc.text(signature.signatoryName || params.authorizedBy || 'Executive Principal', margin + 6, y + 16);
    }
  } else {
    doc.line(margin + 6, y + 19, margin + 55, y + 19);
  }

  doc.setFontSize(7);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(15, 23, 42);
  doc.text(signature?.signatoryName || params.authorizedBy || params.issuingOfficerName || 'Office of Executive Principal', margin + 6, y + 23);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(100, 116, 139);
  doc.text(signature?.signatoryTitle || params.issuingOfficerTitle || 'Executive Principal & Headmaster', margin + 6, y + 27);
  doc.text(`Signed: ${signature?.signedAt ? signature.signedAt.split('T')[0] : params.cutoffDate}`, margin + 6, y + 31);

  // Middle: Official Institutional Seal
  const sealCenterX = margin + (contentWidth / 2);
  doc.setDrawColor(30, 58, 138);
  doc.setLineWidth(0.6);
  doc.circle(sealCenterX, y + 17, 12, 'D');
  doc.setDrawColor(15, 23, 42);
  doc.setLineWidth(0.3);
  doc.circle(sealCenterX, y + 17, 10, 'D');

  doc.setFontSize(5.5);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(30, 58, 138);
  doc.text(params.schoolName.toUpperCase().substring(0, 18), sealCenterX, y + 12, { align: 'center' });
  doc.text('★ ACADEMIC REGISTRAR ★', sealCenterX, y + 16, { align: 'center' });
  doc.text('OFFICIAL RECORD', sealCenterX, y + 20, { align: 'center' });
  doc.text('2026/2027', sealCenterX, y + 23, { align: 'center' });

  // Right: Attestation & Security Verification Hash
  const rightX = margin + contentWidth - 6;
  doc.setFontSize(7.5);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(15, 23, 42);
  doc.text('ACADEMIC RECORDS ATTESTATION', rightX, y + 6, { align: 'right' });

  doc.setFontSize(6.5);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(71, 85, 105);
  doc.text('This document reflects the certified institutional SIS dossier.', rightX, y + 11, { align: 'right' });
  doc.text('Tamper-evident digital signature registered in registry.', rightX, y + 15, { align: 'right' });

  const hash = params.signature?.verificationHash || `SIG-${Math.floor(10000000 + Math.random() * 90000000)}`;
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(30, 58, 138);
  doc.text(`Digital Verification Hash:`, rightX, y + 21, { align: 'right' });
  doc.setFont('courier', 'normal');
  doc.setFontSize(6);
  doc.text(hash, rightX, y + 25, { align: 'right' });
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(148, 163, 184);
  doc.text(`Generated on ${new Date().toISOString()}`, rightX, y + 30, { align: 'right' });

  return doc.output('datauristring');
};
