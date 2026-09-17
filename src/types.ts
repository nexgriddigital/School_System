export type UserRole = 
  | 'REGISTRAR' 
  | 'FINANCE' 
  | 'PROGRAM_OFFICE' 
  | 'COUNSELLOR' 
  | 'PRINCIPAL' 
  | 'TEACHER' 
  | 'STUDENT' 
  | 'PARENT';

export type AcademicGrade = 9 | 10 | 11 | 12;
export type AcademicStream = 'Natural Sciences' | 'Social Sciences';

export interface ParentInfo {
  fatherName: string;
  fatherPhone: string;
  motherName: string;
  motherPhone: string;
  email?: string;
  homeAddress?: string;
  workAddress?: string;
}

export interface EmergencyContact {
  name: string;
  phone1: string;
  phone2: string;
  relationship: string;
}

export interface StreamChangeRequest {
  id: string;
  requestedStream: AcademicStream;
  requestDate: string;
  daysSinceSchoolStart: number;
  reason: string;
  status: 'PENDING' | 'ACCEPTED' | 'DENIED';
  reviewedBy?: string;
  reviewDate?: string;
}

export interface LostIdRequest {
  id: string;
  date: string;
  reason: string;
  financeCleared: boolean;
  libraryCleared: boolean;
  homeroomTeacherCleared: boolean;
  principalCleared: boolean;
  principalOverride: boolean;
  replacementFeePaid: boolean;
  status: 'PENDING_CLEARANCES' | 'CLEARED_PAYMENT_DUE' | 'PAID_READY_DOWNLOAD' | 'COLLECTED';
  clearedDate?: string;
}

export interface Student {
  id: string; // e.g. "OSK-2026-0901"
  accountNumber: string; // e.g. "ACC-90412"
  fullName: string;
  gender: 'Male' | 'Female' | 'Other';
  dob: string;
  grade: AcademicGrade;
  stream?: AcademicStream | null;
  sectionId: string | null; // e.g. "9A", "11-NAT-A"
  
  // Registration Documents & Requirements
  eighthGradeCertAttached: boolean;
  certificateDocName?: string;
  certificateDocUrl?: string;
  transcriptDocName?: string;
  transcriptDocUrl?: string;
  entranceExamScore?: number | null; // Entrance exam result (if applicable)
  ninthGradeResults?: { math: number; english: number; science: number; average: number } | null;
  tenthGradeResults?: { math: number; english: number; science: number; average: number } | null;
  eleventhGradeResults?: { math: number; physics_history: number; chemistry_geog: number; average: number } | null;
  
  photoUrl: string;
  previousSchool: {
    name: string;
    isSameSchool: boolean;
  };
  parents: ParentInfo;
  emergencyContact: EmergencyContact;
  
  // Status flags
  registrationStatus: 'PENDING_PAYMENT' | 'COMPLETE';
  temporaryPassword?: string;
  mustChangePasswordOnLogin: boolean;
  password?: string;
  idCardCollected: boolean;
  
  // Stream Change
  streamChangeRequest?: StreamChangeRequest | null;
  
  // Lost ID
  lostIdRequest?: LostIdRequest | null;
  
  // Leaving Clearance
  leavingClearance?: {
    requested: boolean;
    financeCleared: boolean;
    date?: string;
    status: 'NONE' | 'PENDING' | 'APPROVED';
  } | null;
}

export interface Section {
  id: string; // e.g. "9A", "11-NAT-A"
  grade: AcademicGrade;
  sectionLetter: string; // "A", "B", "C"
  stream?: AcademicStream | null;
  homeroomTeacherId: string | null;
  homeroomTeacherName: string | null;
  capacity: number;
}

export interface Teacher {
  id: string;
  name: string;
  email: string;
  subject: string;
  isHomeroom: boolean;
  assignedSectionId: string | null;
  assignedSections?: string[];
}

export interface TeacherDayOffRequest {
  id: string;
  teacherId: string;
  teacherName: string;
  date: string;
  reason: string;
  supportingDocName?: string;
  supportingDocUrl?: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  appliedDate: string;
  approvedDate?: string;
  affectedSections: string[];
}

export interface AttendanceRecord {
  id: string;
  date: string;
  sectionId: string;
  takenByTeacherId: string;
  takenByTeacherName: string;
  studentId?: string;
  status?: 'PRESENT' | 'ABSENT' | 'LATE' | 'EXCUSED';
  notes?: string;
  records?: {
    studentId: string;
    status: 'PRESENT' | 'ABSENT' | 'LATE' | 'EXCUSED';
    notes?: string;
  }[];
}

export interface GradeEntry {
  id: string;
  studentId: string;
  studentName: string;
  grade: AcademicGrade;
  sectionId: string;
  subject: string;
  teacherId: string;
  teacherName: string;
  test1Score: number;
  midtermScore: number;
  finalScore: number;
  totalGrade: number;
  letterGrade: string;
  teacherComment?: string;
  semester: 'Semester 1' | 'Semester 2';
}

export interface StudentEvaluation {
  id: string;
  studentId: string;
  studentName: string;
  teacherId: string;
  teacherName: string;
  subject: string;
  date: string;
  conductRating: 'Excellent' | 'Good' | 'Needs Improvement';
  academicEffort: 'High' | 'Satisfactory' | 'Low';
  comments: string;
}

export interface Invoice {
  id: string;
  studentId: string;
  studentName: string;
  grade: AcademicGrade;
  accountNumber: string;
  title: string;
  amount: number;
  dueDate: string;
  paidDate?: string;
  paymentReference: string;
  status: 'UNPAID' | 'PENDING_APPROVAL' | 'PAID';
  slipName?: string;
  slipUrl?: string;
  paidWatermark: boolean;
  receiptNumber?: string;
}

export interface RecommendationRequest {
  id: string;
  studentId: string;
  studentName: string;
  grade: AcademicGrade;
  targetRole: 'TEACHER' | 'COUNSELLOR' | 'PRINCIPAL' | 'HOMEROOM_TEACHER';
  recipientName: string;
  recipientId?: string;
  purpose: string;
  status: 'REQUESTED' | 'IN_PROGRESS' | 'COMPLETED';
  requestedDate: string;
  completedDate?: string;
  letterContent?: string;
  stamped: boolean;
  pdfUploaded: boolean;
  pdfFileName?: string;
  pdfUrl?: string;
  hardCopyRequested: boolean;
}

export interface DisciplinaryAction {
  id: string;
  studentId: string;
  studentName: string;
  grade: AcademicGrade;
  sectionId?: string;
  incidentDate: string;
  incidentType: string;
  description: string;
  actionTaken: string;
  counsellorName: string;
  homeroomTeacherNotified: boolean;
  reversedByPrincipal: boolean;
  reversalReason?: string;
  reversalDate?: string;
}

export interface SchoolNotice {
  id: string;
  title: string;
  category: 'Academic Calendar' | 'Emergency Closure' | 'Teacher Absence' | 'Payment Due' | 'General Event';
  content: string;
  postedBy: string;
  postedRole: string;
  date: string;
  targetAudience: 'ALL' | 'STUDENTS' | 'PARENTS' | 'STAFF' | 'SECTION_SPECIFIC';
  targetSectionId?: string;
  isUrgent?: boolean;
}

export interface ChatMessage {
  id: string;
  senderRole: UserRole;
  senderName: string;
  recipientRole: UserRole;
  recipientName: string;
  studentId?: string;
  channelId?: string;
  timestamp: string;
  text: string;
  attachmentName?: string;
  attachmentUrl?: string;
  attachmentType?: 'PDF' | 'DOCUMENT' | 'IMAGE';
  isRead?: boolean;
  status?: 'sent' | 'delivered' | 'read';
}

export interface BankStatementRow {
  id: string;
  transactionDate: string;
  referenceNumber: string; // Should match student accountNumber or invoice reference
  amount: number;
  payerName: string;
  bankDescription: string;
  matchedStudentId?: string;
  matchedInvoiceId?: string;
  status: 'UNMATCHED' | 'MATCHED_PENDING' | 'RECONCILED';
}

export interface InstitutionalUser {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  position: string;
  department?: string;
  password?: string;
  temporaryPassword?: string;
  isTemporaryPassword?: boolean;
  mustChangePasswordOnFirstLogin?: boolean;
  createdAt: string;
  createdBy: string;
  phone?: string;
  extraCredentials?: {
    subject?: string;
    grade?: AcademicGrade;
    stream?: AcademicStream;
    section?: string;
    studentId?: string;
    homeroomSection?: string;
    officeLocation?: string;
  };
}
