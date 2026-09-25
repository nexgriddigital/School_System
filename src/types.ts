export type UserRole = 
  | 'REGISTRAR' 
  | 'FINANCE' 
  | 'PROGRAM_OFFICE' 
  | 'COUNSELLOR' 
  | 'PRINCIPAL' 
  | 'TEACHER' 
  | 'STUDENT' 
  | 'PARENT';

export type ThemeMode = 'light' | 'dark';

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

export interface TranscriptCourseRecord {
  id: string;
  subject: string;
  gradeLevel: number;
  academicYear?: string;
  semester1Score?: number | null;
  semester2Score?: number | null;
  finalAverage: number;
  letterGrade: string;
  creditsOrPeriods?: number | null;
  conduct?: string | null;
  remarks?: string | null;
}

export interface TranscriptAnalysisResult {
  analyzedAt: string;
  fileName: string;
  fileSize?: string;
  fileType?: string;
  studentNameFound?: string | null;
  gender?: 'Male' | 'Female' | 'Other' | null;
  schoolNameFound?: string | null;
  gradeLevelAnalyzed?: number;
  academicYear?: string | null;
  totalAverageScore?: number;
  overallLetterGrade?: string;
  totalSubjectsCount: number;
  passedCount: number;
  rankInClass?: string | null;
  conductRating?: string | null;
  promotionStatus?: string | null;
  courses: TranscriptCourseRecord[];
  summaryNotes?: string;
  rawJson?: string;
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
  transcriptAttached?: boolean;
  transcribedCourses?: TranscriptCourseRecord[];
  transcriptAnalysis?: TranscriptAnalysisResult | null;
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
  quiz?: number;
  assessment?: number;
  midExam?: number;
  finalExam?: number;
  entryDate?: string;
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
  parentAlertSent?: boolean;
  parentAlertSentAt?: string;
  parentAlertMessageId?: string;
  urgencyLevel?: 'NORMAL' | 'URGENT' | 'FINAL_OVERDUE';
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

export type DisciplineSeverity = 'LEVEL_1_MINOR' | 'LEVEL_2_MODERATE' | 'LEVEL_3_SERIOUS' | 'LEVEL_4_CRITICAL';

export type FollowUpStatus = 'PENDING' | 'COMPLETED' | 'RESCHEDULED' | 'OVERDUE' | 'NOT_REQUIRED';

export interface DisciplinaryAction {
  id: string;
  studentId: string;
  studentName: string;
  grade: AcademicGrade;
  sectionId?: string;
  incidentDate: string;
  incidentTime?: string;
  incidentType: string;
  classificationCategory?: string;
  severityLevel?: DisciplineSeverity | string;
  location?: string;
  witnesses?: string;
  description: string;
  actionTaken: string;
  counsellorName: string;
  homeroomTeacherNotified: boolean;
  reversedByPrincipal: boolean;
  reversalReason?: string;
  reversalDate?: string;
  hearingScheduled?: boolean;
  hearingDate?: string;
  hearingTime?: string;
  hearingLocation?: string;
  hearingCommittee?: string[];
  hearingStatus?: 'SCHEDULED' | 'CONCLUDED' | 'RESCHEDULED' | 'PENDING_SCHEDULING';
  parentNoticeSent?: boolean;
  parentNoticeSentAt?: string;
  parentNoticeMessageId?: string;
  // Follow-up scheduling
  followUpRequired?: boolean;
  followUpDate?: string;
  followUpTime?: string;
  followUpType?: string;
  followUpAssignedTo?: string;
  followUpNotes?: string;
  followUpStatus?: FollowUpStatus;
  followUpCompletedDate?: string;
  followUpOutcome?: string;
  followUpOutcomeNotes?: string;
}

export interface ParentEmailAlertLog {
  id: string;
  type: 'DISCIPLINARY_HEARING' | 'URGENT_FEE_DEADLINE';
  studentId: string;
  studentName: string;
  parentName: string;
  parentEmail: string;
  subject: string;
  dispatchedAt: string;
  status: 'SENT' | 'FAILED' | 'QUEUED';
  messageId?: string;
  senderEmail?: string;
  details?: string;
  referenceId: string;
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

export type AuditActionCategory = 
  | 'USER_MANAGEMENT'
  | 'SECURITY_CREDENTIALS'
  | 'DATA_GOVERNANCE'
  | 'SYSTEM_OPERATIONS'
  | 'ACADEMIC_ADMIN';

export type AuditSeverity = 'INFO' | 'WARNING' | 'CRITICAL';

export interface AuditLogEntry {
  id: string; // e.g. "AUD-2026-0921-001"
  timestamp: string; // ISO 8601 string
  action: string; // e.g. "USER_CREATED", "MASTER_CODE_CHANGED", "DATA_SNAPSHOT_EXPORTED"
  actionLabel: string; // e.g. "Institutional User Provisioned"
  category: AuditActionCategory;
  severity: AuditSeverity;
  performedBy: {
    id?: string;
    name: string;
    role: UserRole | 'SYSTEM';
    email?: string;
  };
  targetEntity?: {
    type: 'USER' | 'STUDENT' | 'TEACHER' | 'SYSTEM' | 'SECURITY' | 'BACKUP' | 'DISCIPLINARY';
    id?: string;
    label?: string;
  };
  details: string;
  ipAddress?: string;
  status: 'SUCCESS' | 'FLAGGED' | 'BLOCKED';
  metadata?: Record<string, any>;
  checksum?: string; // Simulated SHA-256 tamper-evident integrity hash
}

export interface DigitalSignatureInfo {
  signatoryId: string;
  signatoryName: string;
  signatoryRole: UserRole;
  signatoryTitle: string;
  signatureDataUrl: string; // Base64 PNG
  signedAt: string; // ISO 8601
  verificationHash: string; // Cryptographic hash
  signingRemarks?: string;
  authorizationType?: 'APPROVED' | 'OFFICIAL_ATTESTATION' | 'EXECUTIVE_CLEARANCE' | 'RECORDED_CERTIFIED';
}

export interface TranscriptRequest {
  id: string; // e.g. "TRQ-2026-001"
  studentId: string;
  studentName: string;
  grade: AcademicGrade;
  stream?: AcademicStream | null;
  requestedByRole: 'STUDENT' | 'PARENT';
  requesterName: string;
  requesterId: string;
  scope: 'FULL' | 'PARTIAL';
  requestedDate: string; // Cutoff date (YYYY-MM-DD)
  reason: string;
  status: 'PENDING_APPROVAL' | 'APPROVED' | 'REJECTED';
  appliedDate: string;
  approvedDate?: string;
  approvedBy?: string;
  rejectionReason?: string;
  authorizedSignature?: DigitalSignatureInfo;
  watermarkText: string; // "Temporary Transcript"
}

export interface InternalDocument {
  id: string;
  title: string;
  documentType: 
    | 'TRANSCRIPT'
    | 'RECOMMENDATION_LETTER'
    | 'DISCIPLINARY_NOTICE'
    | 'TEACHER_LEAVE_CLEARANCE'
    | 'STUDENT_TRANSFER_CLEARANCE'
    | 'ADMIN_MEMO'
    | 'GENERAL_POLICY';
  referenceNumber: string;
  issuedDate: string;
  targetStudentId?: string;
  targetStudentName?: string;
  description: string;
  pdfUrl?: string;
  status: 'DRAFT' | 'PENDING_SIGNATURE' | 'AUTHORIZED_SIGNED';
  signatures: DigitalSignatureInfo[];
  requiredSignatories?: UserRole[];
}
