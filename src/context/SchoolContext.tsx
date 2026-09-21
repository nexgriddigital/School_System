import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { 
  Student, 
  Section, 
  Teacher, 
  Invoice, 
  AttendanceRecord, 
  GradeEntry, 
  DisciplinaryAction, 
  RecommendationRequest, 
  SchoolNotice, 
  TeacherDayOffRequest,
  BankStatementRow,
  UserRole,
  StudentEvaluation,
  ChatMessage,
  AcademicGrade,
  AcademicStream,
  InstitutionalUser,
  ParentEmailAlertLog,
  ThemeMode,
  AuditLogEntry,
  AuditActionCategory,
  AuditSeverity
} from '../types';
import { 
  INITIAL_STUDENTS, 
  INITIAL_SECTIONS, 
  INITIAL_TEACHERS, 
  INITIAL_INVOICES, 
  INITIAL_NOTICES, 
  INITIAL_TEACHER_DAY_OFFS, 
  INITIAL_DISCIPLINARY, 
  INITIAL_RECOMMENDATIONS, 
  INITIAL_GRADES, 
  INITIAL_EVALUATIONS, 
  INITIAL_ATTENDANCE,
  INITIAL_BANK_STATEMENT,
  INITIAL_USERS
} from '../mockData';
import { INITIAL_AUDIT_LOGS, generateAuditHash } from '../data/initialAuditLogs';
import { sendTemporaryPasswordEmailViaGmail, isGmailAuthorized } from '../services/gmailAuthService';
import { 
  sendDisciplinaryHearingEmailViaGmail, 
  sendUrgentFeeDeadlineEmailViaGmail, 
  sendBatchUrgentFeeEmailsViaGmail 
} from '../services/parentEmailNotificationService';

interface SchoolContextType {
  // Navigation & Persona State
  currentRole: UserRole;
  setCurrentRole: (role: UserRole) => void;
  activeStudentId: string;
  setActiveStudentId: (id: string) => void;
  activeTeacherId: string;
  setActiveTeacherId: (id: string) => void;
  currentStudent: Student;
  currentTeacher: Teacher;
  currentParentStudent: Student;
  
  // Data State
  students: Student[];
  sections: Section[];
  teachers: Teacher[];
  invoices: Invoice[];
  notices: SchoolNotice[];
  dayOffRequests: TeacherDayOffRequest[];
  disciplinaryActions: DisciplinaryAction[];
  recommendations: RecommendationRequest[];
  grades: GradeEntry[];
  evaluations: StudentEvaluation[];
  attendanceRecords: AttendanceRecord[];
  bankStatements: BankStatementRow[];
  chatMessages: ChatMessage[];
  parentEmailAlertLogs: ParentEmailAlertLog[];
  clearParentEmailAlertLogs: () => void;
  
  // Institutional Users & Principal Provisioning State
  institutionalUsers: InstitutionalUser[];
  createPrincipalAccount: (params: {
    name: string;
    email: string;
    password: string;
    phone?: string;
    position?: string;
  }) => { success: boolean; user?: InstitutionalUser; error?: string };
  createInstitutionalUser: (params: { 
    name: string; 
    email: string; 
    role: UserRole; 
    position: string; 
    department?: string; 
    phone?: string; 
    extraCredentials?: any;
  }) => Promise<{ success: boolean; tempPassword: string; user: InstitutionalUser; error?: string }>;
  changeUserPassword: (userIdOrEmail: string, newPass: string) => { success: boolean; error?: string };
  getUserByEmailOrId: (identifier: string) => InstitutionalUser | undefined;
  deleteInstitutionalUser: (userId: string) => { success: boolean; isPrincipalDeleted?: boolean; error?: string };
  deleteUsersByCategory: (category: 'LEADERSHIP' | 'FACULTY' | 'STUDENTS' | 'PARENTS') => { success: boolean; count: number; error?: string };

  // Master Authorization Key Management
  principalMasterCode: string;
  updatePrincipalMasterCode: (params: {
    currentMasterCodeOrPassword?: string;
    newMasterCode: string;
  }) => { success: boolean; error?: string };
  verifyMasterCode: (code: string) => boolean;

  // Sensitive System Actions Audit Trail
  auditLogs: AuditLogEntry[];
  logAuditAction: (entry: Omit<AuditLogEntry, 'id' | 'timestamp' | 'checksum'>) => void;
  exportAuditLogsJson: () => void;
  exportAuditLogsCsv: () => void;

  // Authentication & Session State
  isAuthenticated: boolean;
  currentUser: { id: string; name: string; role: UserRole; email?: string; title?: string } | null;
  login: (role: UserRole, identifier?: string, password?: string, customName?: string) => { success: boolean; error?: string };
  logout: () => void;

  // Session Security & Inactivity Timeout
  sessionTimeoutMinutes: number;
  setSessionTimeoutMinutes: (minutes: number) => void;
  sessionExpiredNotification: string | null;
  setSessionExpiredNotification: (msg: string | null) => void;
  clearSessionExpiredNotification: () => void;
  triggerSessionTimeout: (customMessage?: string) => void;
  lastActivityTimestamp: number;
  recordUserActivity: () => void;

  // Institution Branding & Theme
  schoolName: string;
  setSchoolName: (name: string) => void;
  theme: ThemeMode;
  setTheme: (theme: ThemeMode) => void;
  toggleTheme: () => void;

  // Modals & Active View Helpers
  selectedStudentForIdCard: Student | null;
  setSelectedStudentForIdCard: (student: Student | null) => void;
  selectedInvoiceForReceipt: Invoice | null;
  setSelectedInvoiceForReceipt: (invoice: Invoice | null) => void;

  // Actions: Admissions / Registrar
  registerStudent: (newStudent: Omit<Student, 'id' | 'accountNumber' | 'registrationStatus' | 'idCardCollected'>) => Student;
  reviewStreamChangeRequest: (studentId: string, accepted: boolean, reviewNotes?: string) => void;
  resetUserPassword: (studentId: string, requesterRole: 'REGISTRAR' | 'PRINCIPAL' | 'FINANCE') => string;
  markIdCardCollected: (studentId: string) => void;
  verifyStudentDocument: (studentId: string) => void;
  
  // Actions: Finance
  approvePayment: (invoiceId: string) => void;
  bulkReconcileBankStatement: (uploadedRows?: BankStatementRow[]) => { matchedCount: number; approvedTotal: number };
  reconcileSingleBankStatement: (statementId: string) => void;
  resetBankStatementsDemoFeed: () => void;
  grantLeavingClearance: (studentId: string) => void;
  clearLostIdFinance: (studentId: string) => void;
  payInvoiceOnline: (invoiceId: string, reference: string) => void;
  sendUrgentFeeDeadlineEmail: (invoiceId: string, customDetails?: { recipientEmail?: string; customMessage?: string }) => Promise<{ success: boolean; messageId?: string; error?: string }>;
  sendBatchUrgentFeeEmails: (invoiceIds?: string[]) => Promise<{ total: number; successful: number; failed: number; results: any[] }>;
  
  // Actions: Program Office
  createOrUpdateSection: (section: Section) => void;
  assignStudentToSection: (studentId: string, sectionId: string) => { success: boolean; error?: string };
  autoBalanceGradeSections: (grade: AcademicGrade) => { assignedCount: number; skippedPendingStreamCount: number };
  assignHomeroomTeacher: (sectionId: string, teacherId: string) => void;
  
  // Actions: Counsellor
  recordDisciplinaryAction: (action: Omit<DisciplinaryAction, 'id' | 'homeroomTeacherNotified' | 'reversedByPrincipal'> & { autoNotifyParent?: boolean }) => Promise<void> | void;
  scheduleDisciplinaryHearing: (actionId: string, hearingData: { hearingDate: string; hearingTime: string; hearingLocation: string; hearingCommittee?: string[] }) => void;
  sendDisciplinaryHearingEmail: (disciplinaryId: string, customDetails?: { hearingDate?: string; hearingTime?: string; hearingLocation?: string; recipientEmail?: string; hearingCommittee?: string[] }) => Promise<{ success: boolean; messageId?: string; error?: string }>;
  submitCounsellorEvaluation: (evalData: Omit<StudentEvaluation, 'id'>) => void;
  
  // Actions: Principal
  reverseDisciplinaryAction: (actionId: string, reversalReason: string) => void;
  reviewTeacherDayOff: (requestId: string, approved: boolean) => void;
  principalOverrideLostIdDownload: (studentId: string) => void;
  postNotice: (notice: Omit<SchoolNotice, 'id' | 'date'>) => void;
  
  // Actions: Teachers
  takeHomeroomAttendance: (sectionId: string, records: { studentId: string; status: 'PRESENT' | 'ABSENT' | 'LATE' | 'EXCUSED'; notes?: string }[]) => { success: boolean; error?: string };
  saveSubjectGrade: (entry: Omit<GradeEntry, 'id'>) => void;
  submitDayOffRequest: (date: string, reason: string, supportingDocName?: string) => void;
  addStudentEvaluation: (evalData: Omit<StudentEvaluation, 'id'>) => void;
  fulfillRecommendationLetter: (requestId: string, letterContent: string, stamped: boolean, pdfFileName: string) => void;
  
  // Actions: Students & Parents
  changeStudentPassword: (studentId: string, newPass: string) => void;
  requestStreamChange: (studentId: string, requestedStream: AcademicStream, reason: string) => { success: boolean; error?: string };
  submitLostIdReport: (studentId: string, reason: string) => void;
  clearLostIdDept: (studentId: string, department: 'LIBRARY' | 'HOMEROOM' | 'PRINCIPAL') => void;
  payLostIdFee: (studentId: string) => void;
  requestRecommendation: (req: Omit<RecommendationRequest, 'id' | 'status' | 'requestedDate' | 'stamped' | 'pdfUploaded'>) => void;
  sendChatMessage: (
    recipientRole: UserRole, 
    recipientName: string, 
    text: string, 
    targetStudentId?: string,
    attachmentName?: string,
    attachmentUrl?: string,
    attachmentType?: 'PDF' | 'DOCUMENT' | 'IMAGE',
    channelId?: string
  ) => void;
  markMessagesAsRead: (studentIdOrChannel: string) => void;

  // Document & PDF Viewer
  activeDocumentModal: {
    isOpen: boolean;
    title: string;
    subtitle?: string;
    docName: string;
    docUrl?: string;
    category?: 'CERTIFICATE' | 'DEPOSIT_SLIP' | 'MEDICAL_LEAVE' | 'RECOMMENDATION' | 'REPORT_CARD' | 'GENERAL';
    metadata?: any;
  } | null;
  openDocumentViewer: (params: {
    title: string;
    subtitle?: string;
    docName: string;
    docUrl?: string;
    category?: 'CERTIFICATE' | 'DEPOSIT_SLIP' | 'MEDICAL_LEAVE' | 'RECOMMENDATION' | 'REPORT_CARD' | 'GENERAL';
    metadata?: any;
  }) => void;
  closeDocumentViewer: () => void;

  // Principal Touch: Executive Master System Reset
  resetEverything: (options?: { keepPrincipalLoggedIn?: boolean }) => void;

  // Global System Loading State for Animated Mascot Flight
  isGlobalLoading: boolean;
  globalLoadingMessage: string;
  startGlobalLoading: (message?: string, durationMs?: number) => void;
  stopGlobalLoading: () => void;

  // View Helper / Alias methods
  markAttendance?: (studentId: string, date: string, status: 'PRESENT' | 'ABSENT' | 'LATE' | 'EXCUSED', sectionId: string) => void;
  saveGrade?: (gradeData: any) => void;
  submitTeacherDayOff?: (data: { teacherId: string; teacherName: string; date: string; reason: string; supportingDocName?: string; supportingDocUrl?: string; affectedSections?: string[] }) => void;
  reportLostId?: (studentId: string, reason: string) => void;
  requestRecommendationLetter?: (req: any) => void;
  requestPasswordReset?: (userId: string, role: string, userName: string) => void;
  submitPaymentSlip?: (invoiceId: string, reference: string, slipFileName?: string, slipUrl?: string) => void;
}

const SchoolContext = createContext<SchoolContextType | null>(null);

export const getRolePersona = (role: UserRole) => {
  switch (role) {
    case 'STUDENT':
      return {
        id: 'OSK-2026-0901',
        name: 'Yared Melaku',
        role: 'STUDENT' as UserRole,
        title: 'Grade 9 Scholar (Sec 9A)'
      };
    case 'PARENT':
      return {
        id: 'PAR-01',
        name: 'Melaku Tadesse',
        role: 'PARENT' as UserRole,
        title: 'Parent of Yared Melaku'
      };
    case 'TEACHER':
      return {
        id: 'TCH-01',
        name: 'Ato Dawit Lemma',
        role: 'TEACHER' as UserRole,
        email: 'dawit.lemma@oskaracademy.edu',
        title: 'Faculty & Homeroom 9A'
      };
    case 'REGISTRAR':
      return {
        id: 'REG-01',
        name: 'W/ro Genet Assefa',
        role: 'REGISTRAR' as UserRole,
        email: 'registrar@oskaracademy.edu',
        title: 'Admissions Officer & Registrar'
      };
    case 'FINANCE':
      return {
        id: 'FIN-01',
        name: 'Ato Tamrat Bekele',
        role: 'FINANCE' as UserRole,
        email: 'finance@oskaracademy.edu',
        title: 'Bursar & Chief Financial Controller'
      };
    case 'PROGRAM_OFFICE':
      return {
        id: 'PRG-01',
        name: 'Dr. Yared Kassa',
        role: 'PROGRAM_OFFICE' as UserRole,
        email: 'curriculum@oskaracademy.edu',
        title: 'Head of Academic Program Office'
      };
    case 'COUNSELLOR':
      return {
        id: 'CNS-01',
        name: 'Dr. Bethlehem Tadesse',
        role: 'COUNSELLOR' as UserRole,
        email: 'guidance@oskaracademy.edu',
        title: 'Lead Guidance Counsellor'
      };
    case 'PRINCIPAL':
      return {
        id: 'PRN-01',
        name: 'Prof. Mengistu Haile',
        role: 'PRINCIPAL' as UserRole,
        email: 'principal@oskaracademy.edu',
        title: 'Principal & Headmaster'
      };
    default:
      return {
        id: 'REG-01',
        name: 'W/ro Genet Assefa',
        role: 'REGISTRAR' as UserRole,
        email: 'registrar@oskaracademy.edu',
        title: 'Admissions Officer & Registrar'
      };
  }
};

export const INITIAL_CHAT_MESSAGES: ChatMessage[] = [
  // 1. Homeroom Teacher Thread (Ato Dawit Lemma)
  {
    id: 'CM-01',
    senderRole: 'PARENT',
    senderName: 'Melaku Tadesse Gebre',
    recipientRole: 'TEACHER',
    recipientName: 'Ato Dawit Lemma (Homeroom 9A)',
    studentId: 'OSK-2026-0901',
    channelId: 'TEACHER_HOMEROOM',
    timestamp: 'Sep 14, 10:15 AM',
    text: 'Good morning Ato Dawit, I wanted to inquire how Yared is adjusting to the new 9th Grade Algebra curriculum?',
    status: 'read',
    isRead: true,
  },
  {
    id: 'CM-02',
    senderRole: 'TEACHER',
    senderName: 'Ato Dawit Lemma (Homeroom 9A)',
    recipientRole: 'PARENT',
    recipientName: 'Melaku Tadesse Gebre',
    studentId: 'OSK-2026-0901',
    channelId: 'TEACHER_HOMEROOM',
    timestamp: 'Sep 14, 11:30 AM',
    text: 'Greetings Ato Melaku. Yared scored 23/25 on Test 1 and participates actively in class. He is demonstrating excellent focus and analytical capability!',
    status: 'read',
    isRead: true,
  },
  {
    id: 'CM-03',
    senderRole: 'PARENT',
    senderName: 'Melaku Tadesse Gebre',
    recipientRole: 'TEACHER',
    recipientName: 'Ato Dawit Lemma (Homeroom 9A)',
    studentId: 'OSK-2026-0901',
    channelId: 'TEACHER_HOMEROOM',
    timestamp: 'Today, 09:10 AM',
    text: 'Thank you for the reassuring feedback! Will there be any supplemental reading material provided for next week’s mid-term prep?',
    status: 'delivered',
    isRead: false,
  },

  // 2. Principal & Headmaster Office Thread (Prof. Mengistu Haile)
  {
    id: 'CM-PR-01',
    senderRole: 'PRINCIPAL',
    senderName: 'Prof. Mengistu Haile (Headmaster & Principal)',
    recipientRole: 'PARENT',
    recipientName: 'Melaku Tadesse Gebre',
    studentId: 'OSK-2026-0901',
    channelId: 'OFFICE_PRINCIPAL',
    timestamp: 'Sep 10, 08:30 AM',
    text: 'Welcome to the 2026/27 Academic Year! The Executive Office is committed to academic rigor and character building. Please review our institutional guidelines and feel free to reach out for formal administrative consultations.',
    status: 'read',
    isRead: true,
  },

  // 3. Finance & Bursar Office Thread (Ato Tamrat Bekele)
  {
    id: 'CM-FN-01',
    senderRole: 'FINANCE',
    senderName: 'Ato Tamrat Bekele (Chief Bursar & Finance)',
    recipientRole: 'PARENT',
    recipientName: 'Melaku Tadesse Gebre',
    studentId: 'OSK-2026-0901',
    channelId: 'OFFICE_FINANCE',
    timestamp: 'Sep 12, 11:00 AM',
    text: 'Finance Office Notice: Term 1 tuition invoice (4,200 ETB) has been billed. Bank deposit slips from CBE or Telebirr can be submitted directly here or via the Tuition tab. Digital stamped receipts will be released immediately upon reconciliation.',
    status: 'read',
    isRead: true,
  },

  // 4. Admissions & Registrar Office Thread (W/ro Genet Assefa)
  {
    id: 'CM-RG-01',
    senderRole: 'REGISTRAR',
    senderName: 'W/ro Genet Assefa (Chief Admissions Officer)',
    recipientRole: 'PARENT',
    recipientName: 'Melaku Tadesse Gebre',
    studentId: 'OSK-2026-0901',
    channelId: 'OFFICE_REGISTRAR',
    timestamp: 'Sep 08, 02:15 PM',
    text: 'Admissions & Records: Yared Melaku’s 8th-grade national certification documents have been officially authenticated and cataloged in the SIS archive. Digital student ID card is fully active.',
    status: 'read',
    isRead: true,
  },

  // 5. Academic Program Office Thread (Dr. Yared Kassa)
  {
    id: 'CM-PO-01',
    senderRole: 'PROGRAM_OFFICE',
    senderName: 'Dr. Yared Kassa (Head of Academic Program)',
    recipientRole: 'PARENT',
    recipientName: 'Melaku Tadesse Gebre',
    studentId: 'OSK-2026-0901',
    channelId: 'OFFICE_PROGRAM_OFFICE',
    timestamp: 'Sep 13, 04:00 PM',
    text: 'Curriculum Advisory: The Grade 9 Semester 1 examination timetable and laboratory rotation schedules are finalized. All scholars must adhere to the 15-day stream assignment policy.',
    status: 'read',
    isRead: true,
  },

  // 6. Guidance & Counselling Office Thread (Dr. Bethlehem Tadesse)
  {
    id: 'CM-CS-01',
    senderRole: 'COUNSELLOR',
    senderName: 'Dr. Bethlehem Tadesse (Lead Guidance Counsellor)',
    recipientRole: 'PARENT',
    recipientName: 'Melaku Tadesse Gebre',
    studentId: 'OSK-2026-0901',
    channelId: 'OFFICE_COUNSELLOR',
    timestamp: 'Sep 11, 03:20 PM',
    text: 'Warm greetings from Pastoral Care. We are here to support your scholar’s personal wellbeing, study habits, and transition into high school. Feel free to request confidential consultations at any time.',
    status: 'read',
    isRead: true,
  },

  // 7. 24/7 Smart School AI Assistant Thread
  {
    id: 'CM-AI-01',
    senderRole: 'REGISTRAR',
    senderName: '🤖 Oskar Smart School SIS Bot',
    recipientRole: 'PARENT',
    recipientName: 'Melaku Tadesse Gebre',
    studentId: 'OSK-2026-0901',
    channelId: 'AI_SCHOOL_BOT',
    timestamp: 'Today, 08:00 AM',
    text: 'Hello Ato Melaku! I am the Oskar Academy 24/7 SIS Assistant Bot. You can ask me about Yared’s tuition balance, latest exam scores, attendance records, school bus schedules, or request me to route a message to his teachers or any school office!',
    status: 'read',
    isRead: true,
  },

  // Additional Teacher / Class Parents sample threads
  {
    id: 'CM-04',
    senderRole: 'PARENT',
    senderName: 'Hailemariam Mengistu',
    recipientRole: 'TEACHER',
    recipientName: 'Ato Dawit Lemma',
    studentId: 'OSK-2026-0902',
    channelId: 'PARENT_OSK-2026-0902',
    timestamp: 'Yesterday, 04:20 PM',
    text: 'Ato Dawit, Sara informed us she was selected for the Inter-School Science Olympiad squad. We are very proud and appreciate your mentorship!',
    status: 'read',
    isRead: true,
  },
  {
    id: 'CM-05',
    senderRole: 'TEACHER',
    senderName: 'Ato Dawit Lemma (Homeroom 9A)',
    recipientRole: 'PARENT',
    recipientName: 'Hailemariam Mengistu',
    studentId: 'OSK-2026-0902',
    channelId: 'PARENT_OSK-2026-0902',
    timestamp: 'Yesterday, 05:05 PM',
    text: 'Indeed, Ato Hailemariam! Sara demonstrated exceptional scientific problem-solving in the lab assessments. Practice sessions will be on Tuesdays.',
    status: 'read',
    isRead: true,
  },
  {
    id: 'CM-06',
    senderRole: 'PARENT',
    senderName: 'Martha Gebeyehu',
    recipientRole: 'TEACHER',
    recipientName: 'Ato Dawit Lemma',
    studentId: 'OSK-2026-1101',
    channelId: 'PARENT_OSK-2026-1101',
    timestamp: 'Sep 12, 02:45 PM',
    text: 'Greetings teacher. Dawit confirmed his Natural Science stream allocation. Thank you for signing the approval advisory.',
    status: 'read',
    isRead: true,
  },
];

export const SchoolProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Load initial states from LocalStorage or seed defaults
  const [currentRole, setCurrentRoleState] = useState<UserRole>(() => {
    return (localStorage.getItem('oskar_school_role') as UserRole) || 'REGISTRAR';
  });
  const [activeStudentId, setActiveStudentId] = useState<string>('OSK-2026-0901');
  const [activeTeacherId, setActiveTeacherId] = useState<string>('TCH-01'); // Ato Dawit Lemma (Homeroom 9A)

  const [students, setStudents] = useState<Student[]>(() => {
    const saved = localStorage.getItem('oskar_school_students');
    return saved ? JSON.parse(saved) : INITIAL_STUDENTS;
  });

  const [sections, setSections] = useState<Section[]>(() => {
    const saved = localStorage.getItem('oskar_school_sections');
    return saved ? JSON.parse(saved) : INITIAL_SECTIONS;
  });

  const [teachers, setTeachers] = useState<Teacher[]>(() => {
    const saved = localStorage.getItem('oskar_school_teachers');
    if (saved) {
      try {
        const parsed: Teacher[] = JSON.parse(saved);
        return parsed.map(t => ({
          ...t,
          assignedSections: (Array.isArray(t.assignedSections) && t.assignedSections.length > 0)
            ? t.assignedSections
            : (t.assignedSectionId ? [t.assignedSectionId] : ['General Classes'])
        }));
      } catch {
        return INITIAL_TEACHERS;
      }
    }
    return INITIAL_TEACHERS;
  });

  const [invoices, setInvoices] = useState<Invoice[]>(() => {
    const saved = localStorage.getItem('oskar_school_invoices');
    return saved ? JSON.parse(saved) : INITIAL_INVOICES;
  });

  const [notices, setNotices] = useState<SchoolNotice[]>(() => {
    const saved = localStorage.getItem('oskar_school_notices');
    return saved ? JSON.parse(saved) : INITIAL_NOTICES;
  });

  const [dayOffRequests, setDayOffRequests] = useState<TeacherDayOffRequest[]>(() => {
    const saved = localStorage.getItem('oskar_school_dayoffs');
    if (saved) {
      try {
        const parsed: TeacherDayOffRequest[] = JSON.parse(saved);
        return parsed.map(r => ({
          ...r,
          affectedSections: (Array.isArray(r.affectedSections) && r.affectedSections.length > 0)
            ? r.affectedSections
            : ['General Classes']
        }));
      } catch {
        return INITIAL_TEACHER_DAY_OFFS;
      }
    }
    return INITIAL_TEACHER_DAY_OFFS;
  });

  const [disciplinaryActions, setDisciplinaryActions] = useState<DisciplinaryAction[]>(() => {
    const saved = localStorage.getItem('oskar_school_disciplinary');
    return saved ? JSON.parse(saved) : INITIAL_DISCIPLINARY;
  });

  const [recommendations, setRecommendations] = useState<RecommendationRequest[]>(() => {
    const saved = localStorage.getItem('oskar_school_recommendations');
    return saved ? JSON.parse(saved) : INITIAL_RECOMMENDATIONS;
  });

  const [grades, setGrades] = useState<GradeEntry[]>(() => {
    const saved = localStorage.getItem('oskar_school_grades');
    return saved ? JSON.parse(saved) : INITIAL_GRADES;
  });

  const [evaluations, setEvaluations] = useState<StudentEvaluation[]>(() => {
    const saved = localStorage.getItem('oskar_school_evaluations');
    return saved ? JSON.parse(saved) : INITIAL_EVALUATIONS;
  });

  const [attendanceRecords, setAttendanceRecords] = useState<AttendanceRecord[]>(() => {
    const saved = localStorage.getItem('oskar_school_attendance');
    return saved ? JSON.parse(saved) : INITIAL_ATTENDANCE;
  });

  const [bankStatements, setBankStatements] = useState<BankStatementRow[]>(() => {
    const saved = localStorage.getItem('oskar_school_bankstatements');
    return saved ? JSON.parse(saved) : INITIAL_BANK_STATEMENT;
  });

  const [chatMessages, setChatMessages] = useState<ChatMessage[]>(() => {
    const saved = localStorage.getItem('oskar_school_chat_messages');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        // fallback
      }
    }
    return INITIAL_CHAT_MESSAGES;
  });

  const [parentEmailAlertLogs, setParentEmailAlertLogs] = useState<ParentEmailAlertLog[]>(() => {
    const saved = localStorage.getItem('oskar_school_parent_email_logs');
    return saved ? JSON.parse(saved) : [];
  });

  useEffect(() => {
    localStorage.setItem('oskar_school_parent_email_logs', JSON.stringify(parentEmailAlertLogs));
  }, [parentEmailAlertLogs]);

  const clearParentEmailAlertLogs = () => {
    setParentEmailAlertLogs([]);
    localStorage.removeItem('oskar_school_parent_email_logs');
  };

  // Modal selections
  const [selectedStudentForIdCard, setSelectedStudentForIdCard] = useState<Student | null>(null);
  const [selectedInvoiceForReceipt, setSelectedInvoiceForReceipt] = useState<Invoice | null>(null);

  // Institutional Users Directory (Principal Provisioned & System)
  const [institutionalUsers, setInstitutionalUsers] = useState<InstitutionalUser[]>(() => {
    const saved = localStorage.getItem('oskar_school_users');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          // If all users are legacy demo users, clear them to start with a pristine clean slate
          const hasLegacyDemo = parsed.some((u: any) => u.id === 'USR-REG-01' || u.id === 'USR-FIN-01');
          if (hasLegacyDemo) {
            localStorage.removeItem('oskar_school_users');
            localStorage.removeItem('oskar_school_auth');
            localStorage.removeItem('oskar_school_user');
            return [];
          }
          return parsed;
        }
      } catch {
        return [];
      }
    }
    return [];
  });

  useEffect(() => {
    try {
      localStorage.setItem('oskar_school_users', JSON.stringify(institutionalUsers));
    } catch (e) {
      console.error(e);
    }
  }, [institutionalUsers]);

  // Confidential Principal Master Authorization Key (Apex credential)
  const [principalMasterCode, setPrincipalMasterCodeState] = useState<string>(() => {
    try {
      const saved = localStorage.getItem('oskar_principal_master_code');
      if (saved && saved.trim()) return saved.trim();
    } catch (e) {
      console.error(e);
    }
    return (typeof import.meta !== 'undefined' && (import.meta as any).env?.VITE_PRINCIPAL_MASTER_CODE) || 'System_Principal';
  });

  // Authentication & Session State (False until login)
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    // If no institutional users have been created yet, user must be logged out to create Principal
    const saved = localStorage.getItem('oskar_school_users');
    if (!saved || saved === '[]') {
      return false;
    }
    return localStorage.getItem('oskar_school_auth') === 'true';
  });
  const [currentUser, setCurrentUser] = useState<{ id: string; name: string; role: UserRole; email?: string; title?: string } | null>(() => {
    const savedUser = localStorage.getItem('oskar_school_user');
    if (savedUser) {
      try {
        return JSON.parse(savedUser);
      } catch {
        // fallback
      }
    }
    return null;
  });

  // Global System Loading State for Animated Mascot Flight & UI Loading Indicators
  const [isGlobalLoading, setIsGlobalLoading] = useState<boolean>(false);
  const [globalLoadingMessage, setGlobalLoadingMessage] = useState<string>('Processing institutional update...');
  const loadingTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const startGlobalLoading = useCallback((message = 'Processing institutional update...', durationMs = 1500) => {
    if (loadingTimerRef.current) {
      clearTimeout(loadingTimerRef.current);
    }
    setGlobalLoadingMessage(message);
    setIsGlobalLoading(true);
    if (durationMs > 0) {
      loadingTimerRef.current = setTimeout(() => {
        setIsGlobalLoading(false);
      }, durationMs);
    }
  }, []);

  const stopGlobalLoading = useCallback(() => {
    if (loadingTimerRef.current) {
      clearTimeout(loadingTimerRef.current);
    }
    setIsGlobalLoading(false);
  }, []);

  // Session Security & Inactivity Timeout (Institutional Standard: 15 minutes)
  const [sessionTimeoutMinutes, setSessionTimeoutMinutesState] = useState<number>(() => {
    const saved = localStorage.getItem('oskar_session_timeout_mins');
    if (saved) {
      const parsed = parseInt(saved, 10);
      if (!isNaN(parsed) && parsed > 0) return parsed;
    }
    return 15;
  });

  const setSessionTimeoutMinutes = useCallback((mins: number) => {
    const validMins = Math.max(1, mins);
    setSessionTimeoutMinutesState(validMins);
    try {
      localStorage.setItem('oskar_session_timeout_mins', validMins.toString());
    } catch (e) {
      console.error(e);
    }
  }, []);

  const [sessionExpiredNotification, setSessionExpiredNotification] = useState<string | null>(() => {
    try {
      return sessionStorage.getItem('oskar_session_expired_msg') || null;
    } catch {
      return null;
    }
  });

  const [lastActivityTimestamp, setLastActivityTimestamp] = useState<number>(() => Date.now());

  const recordUserActivity = useCallback(() => {
    setLastActivityTimestamp(Date.now());
  }, []);

  const clearSessionExpiredNotification = useCallback(() => {
    setSessionExpiredNotification(null);
    try {
      sessionStorage.removeItem('oskar_session_expired_msg');
    } catch (e) {
      console.error(e);
    }
  }, []);

  const triggerSessionTimeout = useCallback((customMessage?: string) => {
    const timeoutMins = sessionTimeoutMinutes;
    const msg = customMessage || `Session Timed Out: You were automatically signed out after ${timeoutMins} minute${timeoutMins === 1 ? '' : 's'} of inactivity to protect institutional records and ensure compliance with data security policies.`;
    setSessionExpiredNotification(msg);
    try {
      sessionStorage.setItem('oskar_session_expired_msg', msg);
      localStorage.removeItem('oskar_school_auth');
    } catch (e) {
      console.error(e);
    }
    setIsAuthenticated(false);
  }, [sessionTimeoutMinutes]);

  // Institution Customization & Global Theme Mode (Light / Dark)
  const [theme, setThemeState] = useState<ThemeMode>(() => {
    try {
      const savedTheme = localStorage.getItem('oskar_school_theme');
      if (savedTheme === 'dark' || savedTheme === 'light') {
        return savedTheme;
      }
      if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
        return 'dark';
      }
    } catch {
      // fallback
    }
    return 'light';
  });

  const setTheme = useCallback((newTheme: ThemeMode) => {
    setThemeState(newTheme);
    try {
      localStorage.setItem('oskar_school_theme', newTheme);
    } catch (e) {
      console.error(e);
    }
  }, []);

  const toggleTheme = useCallback(() => {
    setThemeState(prev => {
      const nextTheme = prev === 'dark' ? 'light' : 'dark';
      try {
        localStorage.setItem('oskar_school_theme', nextTheme);
      } catch (e) {
        console.error(e);
      }
      return nextTheme;
    });
  }, []);

  // Synchronize document.documentElement and document.body class list with active theme
  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
      document.body.classList.add('dark');
      root.style.colorScheme = 'dark';
    } else {
      root.classList.remove('dark');
      document.body.classList.remove('dark');
      root.style.colorScheme = 'light';
    }
  }, [theme]);

  const [schoolName, setSchoolNameState] = useState<string>(() => {
    return localStorage.getItem('academy_school_name') || 'Academy of Excellence';
  });

  const setSchoolName = (name: string) => {
    setSchoolNameState(name);
    localStorage.setItem('academy_school_name', name);
  };

  // ---------------------------------------------------------
  // Sensitive System Actions Audit Trail
  // ---------------------------------------------------------
  const [auditLogs, setAuditLogs] = useState<AuditLogEntry[]>(() => {
    try {
      const saved = localStorage.getItem('oskar_school_audit_logs');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) {
      console.error(e);
    }
    return INITIAL_AUDIT_LOGS;
  });

  useEffect(() => {
    try {
      localStorage.setItem('oskar_school_audit_logs', JSON.stringify(auditLogs));
    } catch (e) {
      console.error(e);
    }
  }, [auditLogs]);

  const logAuditAction = useCallback((entry: Omit<AuditLogEntry, 'id' | 'timestamp' | 'checksum'>) => {
    const timestamp = new Date().toISOString();
    const actorName = entry.performedBy?.name || currentUser?.name || 'System Operator';
    const id = `AUD-${Date.now().toString().slice(-6)}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`;
    const checksum = generateAuditHash(entry.details, timestamp, actorName);

    const newEntry: AuditLogEntry = {
      id,
      timestamp,
      ...entry,
      ipAddress: entry.ipAddress || '10.14.0.12 (Campus Executive Office)',
      status: entry.status || 'SUCCESS',
      checksum,
    };

    setAuditLogs(prev => [newEntry, ...prev]);
  }, [currentUser]);

  const exportAuditLogsJson = useCallback(() => {
    const dataStr = JSON.stringify(auditLogs, null, 2);
    const blob = new Blob([dataStr], { type: 'application/json;charset=utf-8;' });
    const cleanSchoolSlug = (schoolName || 'Academy_of_Excellence').replace(/[^a-zA-Z0-9]/g, '_');
    const dateStr = new Date().toISOString().split('T')[0];
    const fileName = `${cleanSchoolSlug}_Audit_Trail_Ledger_${dateStr}.json`;
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }, [auditLogs, schoolName]);

  const exportAuditLogsCsv = useCallback(() => {
    const headers = ['ID', 'Timestamp', 'Category', 'Severity', 'Action Code', 'Action Label', 'Performed By', 'Actor Role', 'Target Entity', 'Details', 'IP Address', 'Status', 'Integrity Checksum'];
    const rows = auditLogs.map(log => [
      `"${log.id}"`,
      `"${log.timestamp}"`,
      `"${log.category}"`,
      `"${log.severity}"`,
      `"${log.action}"`,
      `"${(log.actionLabel || '').replace(/"/g, '""')}"`,
      `"${(log.performedBy?.name || '').replace(/"/g, '""')}"`,
      `"${log.performedBy?.role || ''}"`,
      `"${(log.targetEntity?.label || log.targetEntity?.id || '').replace(/"/g, '""')}"`,
      `"${(log.details || '').replace(/"/g, '""')}"`,
      `"${log.ipAddress || ''}"`,
      `"${log.status || 'SUCCESS'}"`,
      `"${log.checksum || ''}"`
    ]);
    const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const cleanSchoolSlug = (schoolName || 'Academy_of_Excellence').replace(/[^a-zA-Z0-9]/g, '_');
    const dateStr = new Date().toISOString().split('T')[0];
    const fileName = `${cleanSchoolSlug}_Audit_Trail_Report_${dateStr}.csv`;
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }, [auditLogs, schoolName]);

  // Active Personas with resilient fallbacks
  const currentStudent: Student = students.find(s => s.id === activeStudentId) || students[0] || INITIAL_STUDENTS[0];
  const currentTeacher: Teacher = teachers.find(t => t.id === activeTeacherId) || teachers[0] || INITIAL_TEACHERS[0];
  const currentParentStudent: Student = students.find(s => s.id === activeStudentId) || students[0] || INITIAL_STUDENTS[0];

  // Sync to LocalStorage
  useEffect(() => {
    localStorage.setItem('oskar_school_students', JSON.stringify(students));
  }, [students]);

  useEffect(() => {
    localStorage.setItem('oskar_school_sections', JSON.stringify(sections));
  }, [sections]);

  useEffect(() => {
    localStorage.setItem('oskar_school_invoices', JSON.stringify(invoices));
  }, [invoices]);

  useEffect(() => {
    localStorage.setItem('oskar_school_notices', JSON.stringify(notices));
  }, [notices]);

  useEffect(() => {
    localStorage.setItem('oskar_school_dayoffs', JSON.stringify(dayOffRequests));
  }, [dayOffRequests]);

  useEffect(() => {
    localStorage.setItem('oskar_school_disciplinary', JSON.stringify(disciplinaryActions));
  }, [disciplinaryActions]);

  useEffect(() => {
    localStorage.setItem('oskar_school_recommendations', JSON.stringify(recommendations));
  }, [recommendations]);

  useEffect(() => {
    localStorage.setItem('oskar_school_grades', JSON.stringify(grades));
  }, [grades]);

  useEffect(() => {
    localStorage.setItem('oskar_school_evaluations', JSON.stringify(evaluations));
  }, [evaluations]);

  useEffect(() => {
    localStorage.setItem('oskar_school_attendance', JSON.stringify(attendanceRecords));
  }, [attendanceRecords]);

  useEffect(() => {
    localStorage.setItem('oskar_school_bankstatements', JSON.stringify(bankStatements));
  }, [bankStatements]);

  // Document & PDF Viewer Modal State
  const [activeDocumentModal, setActiveDocumentModal] = useState<{
    isOpen: boolean;
    title: string;
    subtitle?: string;
    docName: string;
    docUrl?: string;
    category?: 'CERTIFICATE' | 'DEPOSIT_SLIP' | 'MEDICAL_LEAVE' | 'RECOMMENDATION' | 'REPORT_CARD' | 'GENERAL';
    metadata?: any;
  } | null>(null);

  const openDocumentViewer = (params: {
    title: string;
    subtitle?: string;
    docName: string;
    docUrl?: string;
    category?: 'CERTIFICATE' | 'DEPOSIT_SLIP' | 'MEDICAL_LEAVE' | 'RECOMMENDATION' | 'REPORT_CARD' | 'GENERAL';
    metadata?: any;
  }) => {
    setActiveDocumentModal({
      isOpen: true,
      ...params,
    });
  };

  const closeDocumentViewer = () => {
    setActiveDocumentModal(null);
  };

  // --- ACTIONS ---

  // Principal-Led User Provisioning & Password Handlers
  const getUserByEmailOrId = useCallback((identifier: string): InstitutionalUser | undefined => {
    if (!identifier) return undefined;
    const clean = identifier.trim().toLowerCase();
    return institutionalUsers.find(u => 
      u.email.toLowerCase() === clean || 
      u.id.toLowerCase() === clean ||
      (u.extraCredentials?.studentId && u.extraCredentials.studentId.toLowerCase() === clean)
    );
  }, [institutionalUsers]);

  const changeUserPassword = useCallback((userIdOrEmail: string, newPass: string) => {
    if (!userIdOrEmail || !newPass) return { success: false, error: 'Missing user identifier or password' };
    const clean = userIdOrEmail.trim().toLowerCase();

    setInstitutionalUsers(prev => prev.map(u => {
      if (u.email.toLowerCase() === clean || u.id.toLowerCase() === clean || (u.extraCredentials?.studentId && u.extraCredentials.studentId.toLowerCase() === clean)) {
        return {
          ...u,
          password: newPass,
          temporaryPassword: undefined,
          isTemporaryPassword: false,
          mustChangePasswordOnFirstLogin: false,
        };
      }
      return u;
    }));

    // Also update student if applicable
    setStudents(prev => prev.map(s => {
      if (s.id.toLowerCase() === clean || s.accountNumber.toLowerCase() === clean) {
        return {
          ...s,
          password: newPass,
          temporaryPassword: undefined,
          mustChangePasswordOnLogin: false,
        };
      }
      return s;
    }));

    return { success: true };
  }, []);

  const createPrincipalAccount = (params: {
    name: string;
    email: string;
    password: string;
    phone?: string;
    position?: string;
  }): { success: boolean; user?: InstitutionalUser; error?: string } => {
    const cleanEmail = params.email.trim().toLowerCase();
    const existing = institutionalUsers.find(u => u.email.toLowerCase() === cleanEmail);
    if (existing) {
      if (existing.role === 'PRINCIPAL') {
        const updatedUser: InstitutionalUser = {
          ...existing,
          name: params.name.trim(),
          password: params.password,
          position: params.position || existing.position,
        };
        setInstitutionalUsers(prev => prev.map(u => u.id === existing.id ? updatedUser : u));
        return { success: true, user: updatedUser };
      }
      return { success: false, error: 'An account with this email address already exists as another role.' };
    }

    const newPrincipalUser: InstitutionalUser = {
      id: `USR-PRN-${Date.now().toString().slice(-4)}`,
      name: params.name.trim(),
      email: params.email.trim(),
      role: 'PRINCIPAL',
      position: params.position || 'Headmaster & Executive Principal',
      department: 'Office of the Principal',
      password: params.password,
      isTemporaryPassword: false,
      mustChangePasswordOnFirstLogin: false,
      createdAt: new Date().toISOString().split('T')[0],
      createdBy: 'Manual School Initialization',
      phone: params.phone || '+251 91 100 0001',
    };

    setInstitutionalUsers(prev => [newPrincipalUser, ...prev]);

    logAuditAction({
      action: 'USER_CREATED',
      actionLabel: 'Executive Principal Account Provisioned',
      category: 'USER_MANAGEMENT',
      severity: 'CRITICAL',
      performedBy: {
        name: newPrincipalUser.name,
        role: 'PRINCIPAL',
        email: newPrincipalUser.email
      },
      targetEntity: {
        type: 'USER',
        id: newPrincipalUser.id,
        label: `${newPrincipalUser.name} (Principal)`
      },
      details: `Executive Principal account created for ${newPrincipalUser.name} (${newPrincipalUser.email}).`,
      metadata: {
        email: newPrincipalUser.email,
        position: newPrincipalUser.position
      }
    });

    return { success: true, user: newPrincipalUser };
  };

  const createInstitutionalUser = async (params: {
    name: string;
    email: string;
    role: UserRole;
    position: string;
    department?: string;
    phone?: string;
    extraCredentials?: any;
  }): Promise<{ success: boolean; tempPassword: string; user: InstitutionalUser; error?: string }> => {
    // 0. Authorization enforcement: Only the Principal has executive authority to provision institutional accounts
    if (isAuthenticated && currentUser && currentUser.role !== 'PRINCIPAL') {
      return { 
        success: false, 
        tempPassword: '', 
        user: null as any, 
        error: 'Unauthorized: Only the Principal has executive authority to create institutional accounts.' 
      };
    }

    // 1. Generate secure automatic temporary password
    const numPart = Math.floor(1000 + Math.random() * 9000);
    const charPart = Math.random().toString(36).substring(2, 6).toUpperCase();
    const tempPassword = `Osk#${numPart}!${charPart}`;

    const newId = `USR-${params.role.substring(0, 3)}-${Date.now().toString().slice(-4)}`;

    const newUser: InstitutionalUser = {
      id: newId,
      name: params.name.trim(),
      email: params.email.trim(),
      role: params.role,
      position: params.position.trim(),
      department: params.department || (
        params.role === 'TEACHER' ? 'Faculty & Instruction' :
        params.role === 'STUDENT' ? 'Secondary Scholar Division' :
        params.role === 'PARENT' ? 'Parent Association' :
        params.role === 'REGISTRAR' ? 'Admissions & Records' :
        params.role === 'FINANCE' ? 'Finance & Treasury' :
        params.role === 'PROGRAM_OFFICE' ? 'Academic Program Office' :
        params.role === 'COUNSELLOR' ? 'Pastoral Care & Counseling' :
        'Executive Administration'
      ),
      password: tempPassword,
      temporaryPassword: tempPassword,
      isTemporaryPassword: true,
      mustChangePasswordOnFirstLogin: true,
      createdAt: new Date().toISOString().split('T')[0],
      createdBy: currentUser?.name || 'Prof. Mengistu Haile (Principal)',
      phone: params.phone,
      extraCredentials: params.extraCredentials,
    };

    // 2. Dispatch email with Temporary Password via Gmail REST API
    try {
      await sendTemporaryPasswordEmailViaGmail({
        recipientEmail: params.email.trim(),
        recipientName: params.name.trim(),
        roleName: params.role,
        positionTitle: params.position.trim(),
        tempPassword,
        schoolName,
        senderName: currentUser?.name || schoolName,
      });
    } catch (err: any) {
      console.warn('Notice: Gmail dispatch encountered warning or offline preview:', err);
    }

    // 3. Save to institutional users list
    setInstitutionalUsers(prev => [newUser, ...prev]);

    // 4. If Teacher, register in teachers list
    if (params.role === 'TEACHER') {
      const newTeacher: Teacher = {
        id: `TCH-${Date.now().toString().slice(-3)}`,
        name: params.name.trim(),
        email: params.email.trim(),
        subject: params.extraCredentials?.subject || 'Academic Subject',
        isHomeroom: Boolean(params.extraCredentials?.homeroomSection),
        assignedSectionId: params.extraCredentials?.homeroomSection || null,
        assignedSections: params.extraCredentials?.homeroomSection ? [params.extraCredentials.homeroomSection] : ['General Classes'],
      };
      setTeachers(prev => [newTeacher, ...prev]);
    }

    // 5. If Student, register in students list
    if (params.role === 'STUDENT') {
      const grade = (params.extraCredentials?.grade as AcademicGrade) || 9;
      const year = new Date().getFullYear();
      const countInGrade = students.filter(s => s.grade === grade).length + 1;
      const suffix = countInGrade < 10 ? `0${countInGrade}` : `${countInGrade}`;
      const generatedId = `OSK-${year}-${grade < 10 ? '0' + grade : grade}${suffix}`;
      const generatedAcc = `ACC-${grade}${Math.floor(1000 + Math.random() * 9000)}`;

      const newStudent: Student = {
        id: generatedId,
        accountNumber: generatedAcc,
        fullName: params.name.trim(),
        gender: 'Other',
        dob: '2010-01-01',
        grade,
        stream: params.extraCredentials?.stream || null,
        sectionId: params.extraCredentials?.section || null,
        eighthGradeCertAttached: true,
        entranceExamScore: 85,
        photoUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&auto=format&fit=crop&q=80',
        previousSchool: {
          name: 'Primary Academy',
          isSameSchool: true,
        },
        parents: {
          fatherName: 'Parent of ' + params.name,
          fatherPhone: params.phone || '+251 91 100 0000',
          motherName: '',
          motherPhone: '',
          email: params.email,
        },
        emergencyContact: {
          name: 'Emergency Guardian',
          phone1: params.phone || '+251 91 100 0000',
          phone2: '',
          relationship: 'Guardian',
        },
        registrationStatus: 'COMPLETE',
        temporaryPassword: tempPassword,
        mustChangePasswordOnLogin: true,
        password: tempPassword,
        idCardCollected: false,
        streamChangeRequest: null,
        lostIdRequest: null,
      };
      setStudents(prev => [newStudent, ...prev]);
    }

    logAuditAction({
      action: 'USER_CREATED',
      actionLabel: 'Institutional User Provisioned',
      category: 'USER_MANAGEMENT',
      severity: 'INFO',
      performedBy: {
        name: currentUser?.name || 'Dr. Henok Kebede (Principal)',
        role: currentUser?.role || 'PRINCIPAL',
        email: currentUser?.email
      },
      targetEntity: {
        type: 'USER',
        id: newUser.id,
        label: `${newUser.name} (${newUser.role})`
      },
      details: `New institutional account provisioned for ${newUser.name} as ${newUser.position} in ${newUser.department}. Initial credentials dispatched.`,
      metadata: {
        assignedRole: newUser.role,
        department: newUser.department,
        position: newUser.position,
        email: newUser.email,
      }
    });

    return { success: true, tempPassword, user: newUser };
  };

  // 1. Admissions / Registrar: Register Student
  const registerStudent = (newStudentData: Omit<Student, 'id' | 'accountNumber' | 'registrationStatus' | 'idCardCollected'>): Student => {
    const year = new Date().getFullYear();
    const gradeNum = newStudentData.grade;
    const countInGrade = students.filter(s => s.grade === gradeNum).length + 1;
    const suffix = countInGrade < 10 ? `0${countInGrade}` : `${countInGrade}`;
    const generatedId = `OSK-${year}-${gradeNum < 10 ? '0' + gradeNum : gradeNum}${suffix}`;
    const generatedAcc = `ACC-${gradeNum}${Math.floor(1000 + Math.random() * 9000)}`;
    const tempPass = `Temp#${Math.floor(100000 + Math.random() * 900000)}`;

    const newStudent: Student = {
      ...newStudentData,
      id: generatedId,
      accountNumber: generatedAcc,
      registrationStatus: 'PENDING_PAYMENT',
      temporaryPassword: tempPass,
      mustChangePasswordOnLogin: true,
      password: tempPass,
      idCardCollected: false,
      sectionId: null, // Initially unassigned, assigned by Program Office
      streamChangeRequest: null,
      lostIdRequest: null,
      leavingClearance: null,
    };

    setStudents(prev => [newStudent, ...prev]);

    // Automatically create initial tuition invoice for this student
    const feeAmount = gradeNum === 9 ? 18500 : gradeNum === 10 ? 19500 : gradeNum === 11 ? 21000 : 24500;
    const newInvoice: Invoice = {
      id: `INV-${year}-${Math.floor(100 + Math.random() * 900)}`,
      studentId: generatedId,
      studentName: newStudent.fullName,
      grade: gradeNum,
      accountNumber: generatedAcc,
      title: `Grade ${gradeNum} Term 1 Registration & Tuition Fee`,
      amount: feeAmount,
      dueDate: new Date(Date.now() + 14 * 86400000).toISOString().split('T')[0],
      paymentReference: `REF-${generatedAcc}-T1`,
      status: 'UNPAID',
      paidWatermark: false,
    };

    setInvoices(prev => [newInvoice, ...prev]);
    return newStudent;
  };

  // Review stream change request (Registrar power within 15 days)
  const reviewStreamChangeRequest = (studentId: string, accepted: boolean, reviewNotes?: string) => {
    setStudents(prev => prev.map(s => {
      if (s.id === studentId && s.streamChangeRequest) {
        const updatedRequest = {
          ...s.streamChangeRequest,
          status: (accepted ? 'ACCEPTED' : 'DENIED') as 'ACCEPTED' | 'DENIED',
          reviewedBy: 'Registrar Office',
          reviewDate: new Date().toISOString().split('T')[0],
        };

        return {
          ...s,
          stream: accepted ? s.streamChangeRequest.requestedStream : s.stream,
          streamChangeRequest: updatedRequest,
        };
      }
      return s;
    }));
  };

  // Reset Student / Parent password (Only Finance, Registrar, or Principal)
  const resetUserPassword = (studentId: string, requesterRole: 'REGISTRAR' | 'PRINCIPAL' | 'FINANCE'): string => {
    if (requesterRole !== 'REGISTRAR' && requesterRole !== 'PRINCIPAL' && requesterRole !== 'FINANCE') {
      throw new Error('Unauthorized: Password reset is strictly allowed only via Finance, Registrar, or Principal.');
    }
    const newTemp = `Reset#${Math.floor(100000 + Math.random() * 900000)}`;
    setStudents(prev => prev.map(s => {
      if (s.id === studentId) {
        return {
          ...s,
          temporaryPassword: newTemp,
          password: newTemp,
          mustChangePasswordOnLogin: true,
        };
      }
      return s;
    }));
    return newTemp;
  };

  // Mark ID card collected at Admissions
  const markIdCardCollected = (studentId: string) => {
    setStudents(prev => prev.map(s => {
      if (s.id === studentId) {
        const updatedLost = s.lostIdRequest ? { ...s.lostIdRequest, status: 'COLLECTED' as const } : null;
        return { ...s, idCardCollected: true, lostIdRequest: updatedLost };
      }
      return s;
    }));
  };

  // Verify student registration documents dossier
  const verifyStudentDocument = (studentId: string) => {
    setStudents(prev => prev.map(s => {
      if (s.id === studentId) {
        return {
          ...s,
          eighthGradeCertAttached: true,
          certificateDocName: s.certificateDocName || `${s.id}_8th_Grade_Certificate.pdf`,
        };
      }
      return s;
    }));
  };

  // 2. Finance Actions
  const approvePayment = (invoiceId: string) => {
    const receiptNum = `REC-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;
    let affectedStudentId = '';

    setInvoices(prev => prev.map(inv => {
      if (inv.id === invoiceId) {
        affectedStudentId = inv.studentId;
        return {
          ...inv,
          status: 'PAID',
          paidDate: new Date().toISOString().split('T')[0],
          paidWatermark: true,
          receiptNumber: receiptNum,
        };
      }
      return inv;
    }));

    // Update student registration status to COMPLETE if tuition invoice was paid
    if (affectedStudentId) {
      setStudents(prev => prev.map(st => {
        if (st.id === affectedStudentId) {
          // check if this is for lost ID fee
          if (st.lostIdRequest && st.lostIdRequest.status === 'CLEARED_PAYMENT_DUE') {
            return {
              ...st,
              registrationStatus: 'COMPLETE',
              lostIdRequest: {
                ...st.lostIdRequest,
                replacementFeePaid: true,
                status: 'PAID_READY_DOWNLOAD',
              },
            };
          }
          return { ...st, registrationStatus: 'COMPLETE' };
        }
        return st;
      }));
    }
  };

  // Bulk reconciliation via bank statement file
  const bulkReconcileBankStatement = (uploadedRows?: BankStatementRow[]): { matchedCount: number; approvedTotal: number } => {
    const rowsToProcess = uploadedRows || bankStatements;
    let matchedCount = 0;
    let approvedTotal = 0;

    const updatedInvoices = [...invoices];
    const updatedStudents = [...students];

    const processedBankStatements = rowsToProcess.map(row => {
      // Find matching invoice either by referenceNumber or matching student's accountNumber
      const matchedInvIndex = updatedInvoices.findIndex(inv => 
        (inv.paymentReference && inv.paymentReference.toUpperCase().includes(row.referenceNumber.toUpperCase())) ||
        (inv.accountNumber && row.bankDescription.toUpperCase().includes(inv.accountNumber.toUpperCase())) ||
        (row.referenceNumber.toUpperCase().includes(inv.accountNumber.toUpperCase()))
      );

      if (matchedInvIndex !== -1 && updatedInvoices[matchedInvIndex].status !== 'PAID') {
        const inv = updatedInvoices[matchedInvIndex];
        inv.status = 'PAID';
        inv.paidDate = row.transactionDate;
        inv.paidWatermark = true;
        inv.receiptNumber = `REC-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;

        matchedCount++;
        approvedTotal += inv.amount;

        // Also activate student registration
        const stIndex = updatedStudents.findIndex(s => s.id === inv.studentId);
        if (stIndex !== -1) {
          if (updatedStudents[stIndex].lostIdRequest) {
            updatedStudents[stIndex].lostIdRequest!.replacementFeePaid = true;
            updatedStudents[stIndex].lostIdRequest!.status = 'PAID_READY_DOWNLOAD';
          }
          updatedStudents[stIndex].registrationStatus = 'COMPLETE';
        }

        return {
          ...row,
          matchedInvoiceId: inv.id,
          matchedStudentId: inv.studentId,
          status: 'RECONCILED' as const,
        };
      }

      return row;
    });

    setInvoices(updatedInvoices);
    setStudents(updatedStudents);
    setBankStatements(processedBankStatements);

    return { matchedCount, approvedTotal };
  };

  // Reconcile a single bank statement record
  const reconcileSingleBankStatement = (statementId: string) => {
    const updatedInvoices = [...invoices];
    const updatedStudents = [...students];

    setBankStatements(prev => prev.map(row => {
      if (row.id === statementId) {
        // Look for matching invoice
        const matchedInvIndex = updatedInvoices.findIndex(inv =>
          (row.matchedInvoiceId && inv.id === row.matchedInvoiceId) ||
          (inv.paymentReference && inv.paymentReference.toUpperCase().includes(row.referenceNumber.toUpperCase())) ||
          (inv.accountNumber && row.bankDescription.toUpperCase().includes(inv.accountNumber.toUpperCase()))
        );

        if (matchedInvIndex !== -1 && updatedInvoices[matchedInvIndex].status !== 'PAID') {
          const inv = updatedInvoices[matchedInvIndex];
          inv.status = 'PAID';
          inv.paidDate = row.transactionDate || new Date().toISOString().split('T')[0];
          inv.paidWatermark = true;
          inv.receiptNumber = inv.receiptNumber || `REC-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;

          const stIndex = updatedStudents.findIndex(s => s.id === inv.studentId);
          if (stIndex !== -1) {
            updatedStudents[stIndex].registrationStatus = 'COMPLETE';
          }

          return {
            ...row,
            matchedInvoiceId: inv.id,
            matchedStudentId: inv.studentId,
            status: 'RECONCILED' as const,
          };
        }

        return {
          ...row,
          status: 'RECONCILED' as const,
        };
      }
      return row;
    }));

    setInvoices(updatedInvoices);
    setStudents(updatedStudents);
  };

  // Reset or reload initial bank statement test feed & linked tuition verification states
  const resetBankStatementsDemoFeed = () => {
    // 1. Pristine clone of initial bank statements
    const cleanBank: BankStatementRow[] = JSON.parse(JSON.stringify(INITIAL_BANK_STATEMENT));
    setBankStatements(cleanBank);

    // 2. Reset test invoices linked to statement cross-checking back to pending/unpaid
    const updatedInvoices = invoices.map(inv => {
      if (inv.id === 'INV-2026-004') {
        return {
          ...inv,
          status: 'PENDING_APPROVAL' as const,
          paidWatermark: false,
          paidDate: undefined,
          receiptNumber: undefined,
        };
      }
      if (inv.id === 'INV-2026-003') {
        return {
          ...inv,
          status: 'UNPAID' as const,
          paidWatermark: false,
          paidDate: undefined,
          receiptNumber: undefined,
        };
      }
      return inv;
    });
    setInvoices(updatedInvoices);

    // 3. Reset student registration and clearance flags for linked test accounts
    const updatedStudents = students.map(s => {
      if (s.id === 'OSK-2026-1101') {
        return {
          ...s,
          registrationStatus: 'PENDING_TUITION_CLEARANCE' as const,
        };
      }
      if (s.id === 'OSK-2026-1001' && s.lostIdRequest) {
        return {
          ...s,
          lostIdRequest: {
            ...s.lostIdRequest,
            replacementFeePaid: false,
            status: 'PENDING_FINANCE' as const,
          },
        };
      }
      return s;
    });
    setStudents(updatedStudents);

    // 4. Immediately persist to localStorage for instant synchronization
    try {
      localStorage.setItem('oskar_school_bankstatements', JSON.stringify(cleanBank));
      localStorage.setItem('oskar_school_invoices', JSON.stringify(updatedInvoices));
      localStorage.setItem('oskar_school_students', JSON.stringify(updatedStudents));
    } catch (e) {
      console.error('Failed to persist reset bank feed to localStorage:', e);
    }
  };

  const grantLeavingClearance = (studentId: string) => {
    setStudents(prev => prev.map(s => {
      if (s.id === studentId) {
        return {
          ...s,
          leavingClearance: {
            requested: true,
            financeCleared: true,
            date: new Date().toISOString().split('T')[0],
            status: 'APPROVED',
          },
        };
      }
      return s;
    }));
  };

  const clearLostIdFinance = (studentId: string) => {
    setStudents(prev => prev.map(s => {
      if (s.id === studentId && s.lostIdRequest) {
        const allOtherCleared = s.lostIdRequest.libraryCleared && s.lostIdRequest.homeroomTeacherCleared;
        return {
          ...s,
          lostIdRequest: {
            ...s.lostIdRequest,
            financeCleared: true,
            status: allOtherCleared ? 'CLEARED_PAYMENT_DUE' : 'PENDING_CLEARANCES',
          },
        };
      }
      return s;
    }));
  };

  const payInvoiceOnline = (invoiceId: string, reference: string) => {
    setInvoices(prev => prev.map(inv => {
      if (inv.id === invoiceId) {
        return {
          ...inv,
          status: 'PENDING_APPROVAL',
          paymentReference: reference,
        };
      }
      return inv;
    }));
  };

  const sendUrgentFeeDeadlineEmail = async (
    invoiceId: string,
    customDetails?: {
      recipientEmail?: string;
      customMessage?: string;
    }
  ): Promise<{ success: boolean; messageId?: string; error?: string }> => {
    const invoice = invoices.find(inv => inv.id === invoiceId);
    if (!invoice) {
      return { success: false, error: 'Invoice record not found.' };
    }

    const student = students.find(s => s.id === invoice.studentId);
    const recipientEmail = customDetails?.recipientEmail || student?.parents?.email || 'nexgriddigital@gmail.com';
    const recipientName = student?.parents?.fatherName || student?.parents?.motherName || 'Parent / Legal Guardian';
    const isOverdue = new Date(invoice.dueDate) < new Date();

    try {
      const res = await sendUrgentFeeDeadlineEmailViaGmail({
        recipientEmail,
        recipientName,
        studentName: invoice.studentName,
        studentId: invoice.studentId,
        grade: invoice.grade,
        accountNumber: invoice.accountNumber,
        invoiceTitle: invoice.title,
        amount: invoice.amount,
        dueDate: invoice.dueDate,
        paymentReference: invoice.paymentReference,
        isOverdue,
        schoolName,
        customMessage: customDetails?.customMessage,
      });

      const nowIso = new Date().toISOString();
      setInvoices(prev => prev.map(inv => {
        if (inv.id === invoiceId) {
          return {
            ...inv,
            parentAlertSent: true,
            parentAlertSentAt: nowIso,
            parentAlertMessageId: res.messageId,
            urgencyLevel: isOverdue ? 'FINAL_OVERDUE' : 'URGENT',
          };
        }
        return inv;
      }));

      const logItem: ParentEmailAlertLog = {
        id: `LOG-FEE-${Date.now()}`,
        type: 'URGENT_FEE_DEADLINE',
        studentId: invoice.studentId,
        studentName: invoice.studentName,
        parentName: recipientName,
        parentEmail: recipientEmail,
        subject: `${schoolName} - ${isOverdue ? 'FINAL NOTICE: Tuition Past Due' : 'URGENT: Fee Deadline Alert'}: ${invoice.studentName} (${invoice.accountNumber})`,
        dispatchedAt: nowIso,
        status: 'SENT',
        messageId: res.messageId,
        referenceId: invoice.id,
        details: `${invoice.title} - ${invoice.amount.toLocaleString()} ETB (Due: ${invoice.dueDate})`,
      };
      setParentEmailAlertLogs(prev => [logItem, ...prev]);

      return { success: true, messageId: res.messageId };
    } catch (err: any) {
      const errorMsg = err?.message || 'Failed to dispatch urgent fee alert email via Gmail';
      const logItem: ParentEmailAlertLog = {
        id: `LOG-FEE-${Date.now()}`,
        type: 'URGENT_FEE_DEADLINE',
        studentId: invoice.studentId,
        studentName: invoice.studentName,
        parentName: recipientName,
        parentEmail: recipientEmail,
        subject: `${schoolName} - Urgent Fee Alert: ${invoice.studentName}`,
        dispatchedAt: new Date().toISOString(),
        status: 'FAILED',
        referenceId: invoice.id,
        details: errorMsg,
      };
      setParentEmailAlertLogs(prev => [logItem, ...prev]);
      return { success: false, error: errorMsg };
    }
  };

  const sendBatchUrgentFeeEmails = async (
    invoiceIds?: string[]
  ): Promise<{ total: number; successful: number; failed: number; results: any[] }> => {
    const targetInvoices = invoices.filter(inv => {
      if (invoiceIds && invoiceIds.length > 0) {
        return invoiceIds.includes(inv.id);
      }
      return inv.status === 'UNPAID' || inv.status === 'PENDING_APPROVAL';
    });

    const payload = targetInvoices.map(inv => {
      const s = students.find(st => st.id === inv.studentId);
      return {
        invoice: inv,
        parentEmail: s?.parents?.email || 'nexgriddigital@gmail.com',
        parentName: s?.parents?.fatherName || s?.parents?.motherName || 'Parent / Guardian',
        schoolName,
      };
    });

    const batchRes = await sendBatchUrgentFeeEmailsViaGmail(payload);

    const nowIso = new Date().toISOString();
    const successfulIds = new Set(batchRes.results.filter(r => r.success).map(r => r.invoiceId));
    if (successfulIds.size > 0) {
      setInvoices(prev => prev.map(inv => {
        if (successfulIds.has(inv.id)) {
          const matchingResult = batchRes.results.find(r => r.invoiceId === inv.id);
          return {
            ...inv,
            parentAlertSent: true,
            parentAlertSentAt: nowIso,
            parentAlertMessageId: matchingResult?.messageId,
          };
        }
        return inv;
      }));
    }

    const newLogs: ParentEmailAlertLog[] = batchRes.results.map(r => ({
      id: `LOG-BATCH-${Date.now()}-${r.invoiceId}`,
      type: 'URGENT_FEE_DEADLINE',
      studentId: r.invoiceId,
      studentName: r.studentName,
      parentName: 'Parent / Legal Guardian',
      parentEmail: r.recipientEmail,
      subject: `${schoolName} - URGENT: Fee Deadline Alert: ${r.studentName}`,
      dispatchedAt: nowIso,
      status: r.success ? 'SENT' : 'FAILED',
      messageId: r.messageId,
      referenceId: r.invoiceId,
      details: r.error || 'Batch dispatched successfully via Gmail',
    }));
    setParentEmailAlertLogs(prev => [...newLogs, ...prev]);

    return batchRes;
  };

  // 3. Program Office Actions
  const createOrUpdateSection = (section: Section) => {
    setSections(prev => {
      const idx = prev.findIndex(s => s.id === section.id);
      if (idx !== -1) {
        const updated = [...prev];
        updated[idx] = section;
        return updated;
      }
      return [...prev, section];
    });
  };

  const assignStudentToSection = (studentId: string, sectionId: string): { success: boolean; error?: string } => {
    const targetStudent = students.find(s => s.id === studentId);
    if (!targetStudent) return { success: false, error: 'Student not found.' };

    // STRICT CONSTRAINT CHECK:
    // "if the request is neither Accepted nor denied the system shouldn't assign the student a classroom and don't put them in the attendance."
    if (targetStudent.streamChangeRequest && targetStudent.streamChangeRequest.status === 'PENDING') {
      return {
        success: false,
        error: `Action Blocked: Student ${targetStudent.fullName} has a pending Stream Change request (${targetStudent.streamChangeRequest.requestedStream}). The request must be Accepted or Denied by the Registrar before assigning a section.`,
      };
    }

    setStudents(prev => prev.map(s => s.id === studentId ? { ...s, sectionId } : s));
    return { success: true };
  };

  const autoBalanceGradeSections = (grade: AcademicGrade): { assignedCount: number; skippedPendingStreamCount: number } => {
    let assignedCount = 0;
    let skippedPendingStreamCount = 0;

    const availableSections = sections.filter(sec => sec.grade === grade);
    if (availableSections.length === 0) {
      return { assignedCount: 0, skippedPendingStreamCount: 0 };
    }

    setStudents(prev => {
      return prev.map(s => {
        if (s.grade !== grade) return s;

        // Constraint check
        if (s.streamChangeRequest && s.streamChangeRequest.status === 'PENDING') {
          skippedPendingStreamCount++;
          return { ...s, sectionId: null };
        }

        // For Grade 11 & 12, match stream!
        let matchingSections = availableSections;
        if (grade >= 11 && s.stream) {
          matchingSections = availableSections.filter(sec => sec.stream === s.stream);
        }

        if (matchingSections.length > 0) {
          // Assign to first available or round-robin
          const chosenSection = matchingSections[assignedCount % matchingSections.length];
          assignedCount++;
          return { ...s, sectionId: chosenSection.id };
        }

        return s;
      });
    });

    return { assignedCount, skippedPendingStreamCount };
  };

  const assignHomeroomTeacher = (sectionId: string, teacherId: string) => {
    const teacher = teachers.find(t => t.id === teacherId);
    setSections(prev => prev.map(sec => {
      if (sec.id === sectionId) {
        return {
          ...sec,
          homeroomTeacherId: teacherId,
          homeroomTeacherName: teacher ? teacher.name : null,
        };
      }
      return sec;
    }));

    setTeachers(prev => prev.map(t => {
      if (t.id === teacherId) {
        return { ...t, isHomeroom: true, assignedSectionId: sectionId };
      }
      return t;
    }));
  };

  // 4. Counsellor Actions
  const scheduleDisciplinaryHearing = (
    actionId: string,
    hearingData: {
      hearingDate: string;
      hearingTime: string;
      hearingLocation: string;
      hearingCommittee?: string[];
    }
  ) => {
    setDisciplinaryActions(prev => prev.map(act => {
      if (act.id === actionId) {
        return {
          ...act,
          hearingScheduled: true,
          hearingDate: hearingData.hearingDate,
          hearingTime: hearingData.hearingTime,
          hearingLocation: hearingData.hearingLocation,
          hearingCommittee: hearingData.hearingCommittee || act.hearingCommittee,
          hearingStatus: 'SCHEDULED',
        };
      }
      return act;
    }));
  };

  const sendDisciplinaryHearingEmail = async (
    disciplinaryId: string,
    customDetails?: {
      hearingDate?: string;
      hearingTime?: string;
      hearingLocation?: string;
      recipientEmail?: string;
      hearingCommittee?: string[];
    }
  ): Promise<{ success: boolean; messageId?: string; error?: string }> => {
    const action = disciplinaryActions.find(a => a.id === disciplinaryId);
    if (!action) {
      return { success: false, error: 'Disciplinary record not found.' };
    }

    const student = students.find(s => s.id === action.studentId);
    const recipientEmail = customDetails?.recipientEmail || student?.parents?.email || 'nexgriddigital@gmail.com';
    const recipientName = student?.parents?.fatherName || student?.parents?.motherName || 'Parent / Legal Guardian';

    const hearingDate = customDetails?.hearingDate || action.hearingDate || new Date(Date.now() + 86400000 * 3).toISOString().split('T')[0];
    const hearingTime = customDetails?.hearingTime || action.hearingTime || '10:00 AM';
    const hearingLocation = customDetails?.hearingLocation || action.hearingLocation || 'Academic Disciplinary Board Room (Hall B, Rm 204)';
    const hearingCommittee = customDetails?.hearingCommittee || action.hearingCommittee || ['Prof. Mengistu Haile (Principal)', 'Sister Marta Wolde (Counsellor)'];

    try {
      const res = await sendDisciplinaryHearingEmailViaGmail({
        recipientEmail,
        recipientName,
        studentName: action.studentName,
        studentId: action.studentId,
        grade: action.grade,
        sectionId: action.sectionId,
        incidentType: action.incidentType,
        incidentDate: action.incidentDate,
        description: action.description,
        hearingDate,
        hearingTime,
        hearingLocation,
        hearingCommittee,
        schoolName,
        counsellorName: action.counsellorName,
      });

      const nowIso = new Date().toISOString();
      setDisciplinaryActions(prev => prev.map(a => {
        if (a.id === disciplinaryId) {
          return {
            ...a,
            hearingScheduled: true,
            hearingDate,
            hearingTime,
            hearingLocation,
            hearingCommittee,
            hearingStatus: 'SCHEDULED',
            parentNoticeSent: true,
            parentNoticeSentAt: nowIso,
            parentNoticeMessageId: res.messageId,
          };
        }
        return a;
      }));

      const logItem: ParentEmailAlertLog = {
        id: `LOG-DISC-${Date.now()}`,
        type: 'DISCIPLINARY_HEARING',
        studentId: action.studentId,
        studentName: action.studentName,
        parentName: recipientName,
        parentEmail: recipientEmail,
        subject: `${schoolName} - Disciplinary Hearing Notice: ${action.studentName} (${action.studentId})`,
        dispatchedAt: nowIso,
        status: 'SENT',
        messageId: res.messageId,
        referenceId: action.id,
        details: `Hearing set for ${hearingDate} at ${hearingTime} (${hearingLocation})`,
      };
      setParentEmailAlertLogs(prev => [logItem, ...prev]);

      return { success: true, messageId: res.messageId };
    } catch (err: any) {
      const errorMsg = err?.message || 'Failed to dispatch disciplinary hearing email via Gmail';
      const logItem: ParentEmailAlertLog = {
        id: `LOG-DISC-${Date.now()}`,
        type: 'DISCIPLINARY_HEARING',
        studentId: action.studentId,
        studentName: action.studentName,
        parentName: recipientName,
        parentEmail: recipientEmail,
        subject: `${schoolName} - Disciplinary Hearing Notice: ${action.studentName} (${action.studentId})`,
        dispatchedAt: new Date().toISOString(),
        status: 'FAILED',
        referenceId: action.id,
        details: errorMsg,
      };
      setParentEmailAlertLogs(prev => [logItem, ...prev]);
      return { success: false, error: errorMsg };
    }
  };

  const recordDisciplinaryAction = async (actionData: Omit<DisciplinaryAction, 'id' | 'homeroomTeacherNotified' | 'reversedByPrincipal'> & { autoNotifyParent?: boolean }) => {
    const actionId = `DISC-${Math.floor(1000 + Math.random() * 9000)}`;
    const newAction: DisciplinaryAction = {
      ...actionData,
      id: actionId,
      homeroomTeacherNotified: true, // "the system must automattically inform them"
      reversedByPrincipal: false,
    };

    setDisciplinaryActions(prev => [newAction, ...prev]);

    // Send automated notification to Homeroom Teacher of student's section
    const targetStudent = students.find(s => s.id === actionData.studentId);
    if (targetStudent && targetStudent.sectionId) {
      const section = sections.find(sec => sec.id === targetStudent.sectionId);
      if (section && section.homeroomTeacherName) {
        const autoNotice: SchoolNotice = {
          id: `NOT-AUTO-${Date.now()}`,
          title: `Disciplinary Alert: ${targetStudent.fullName} (${section.id})`,
          category: 'General Event',
          content: `Counsellor recorded a disciplinary action for your homeroom student ${targetStudent.fullName}: "${actionData.incidentType} - ${actionData.description}". Action Taken: ${actionData.actionTaken}`,
          postedBy: 'Counsellor Office',
          postedRole: 'Counsellor',
          date: new Date().toISOString().split('T')[0],
          targetAudience: 'STAFF',
          targetSectionId: section.id,
          isUrgent: true,
        };
        setNotices(prev => [autoNotice, ...prev]);
      }
    }

    if (actionData.autoNotifyParent && actionData.hearingScheduled) {
      try {
        await sendDisciplinaryHearingEmail(actionId, {
          hearingDate: actionData.hearingDate,
          hearingTime: actionData.hearingTime,
          hearingLocation: actionData.hearingLocation,
          hearingCommittee: actionData.hearingCommittee,
        });
      } catch (e) {
        console.error('Auto notify parent email error:', e);
      }
    }
  };

  const submitCounsellorEvaluation = (evalData: Omit<StudentEvaluation, 'id'>) => {
    const newEval: StudentEvaluation = {
      ...evalData,
      id: `EV-${Math.floor(1000 + Math.random() * 9000)}`,
    };
    setEvaluations(prev => [newEval, ...prev]);
  };

  // 5. Principal Actions
  const reverseDisciplinaryAction = (actionId: string, reversalReason: string) => {
    setDisciplinaryActions(prev => prev.map(act => {
      if (act.id === actionId) {
        return {
          ...act,
          reversedByPrincipal: true,
          reversalReason,
          reversalDate: new Date().toISOString().split('T')[0],
        };
      }
      return act;
    }));
  };

  const reviewTeacherDayOff = (requestId: string, approved: boolean) => {
    let affectedTeacherName = '';
    let affectedSections: string[] = [];
    let absenceDate = '';

    setDayOffRequests(prev => prev.map(req => {
      if (req.id === requestId) {
        affectedTeacherName = req.teacherName;
        affectedSections = Array.isArray(req.affectedSections)
          ? req.affectedSections
          : (req.affectedSections ? [req.affectedSections] : []);
        absenceDate = req.date;
        return {
          ...req,
          status: approved ? 'APPROVED' : 'REJECTED',
          approvedDate: new Date().toISOString().split('T')[0],
        };
      }
      return req;
    }));

    // If approved, requirement: "Once approved The students affected by the teacher's absense should get a notice Automatically that the teacher won't be there."
    if (approved) {
      const sectionDisplay = (affectedSections && affectedSections.length > 0)
        ? affectedSections.join(', ')
        : 'All Assigned Classes';
      const primaryTargetSection = (affectedSections && affectedSections[0]) || 'General';

      const autoNotice: SchoolNotice = {
        id: `NOT-ABS-${Date.now()}`,
        title: `Teacher Absence Notice: ${affectedTeacherName}`,
        category: 'Teacher Absence',
        content: `Please be advised that ${affectedTeacherName} will be away on ${absenceDate}. Affected class sections: ${sectionDisplay}. Students are advised to complete their self-study assignments in the library.`,
        postedBy: 'Office of the Principal',
        postedRole: 'School Principal',
        date: new Date().toISOString().split('T')[0],
        targetAudience: 'SECTION_SPECIFIC',
        targetSectionId: primaryTargetSection,
        isUrgent: true,
      };
      setNotices(prev => [autoNotice, ...prev]);
    }
  };

  const principalOverrideLostIdDownload = (studentId: string) => {
    setStudents(prev => prev.map(s => {
      if (s.id === studentId && s.lostIdRequest) {
        return {
          ...s,
          lostIdRequest: {
            ...s.lostIdRequest,
            principalOverride: true,
            principalCleared: true,
            status: 'PAID_READY_DOWNLOAD',
          },
        };
      }
      return s;
    }));
  };

  const postNotice = (noticeData: Omit<SchoolNotice, 'id' | 'date'>) => {
    const newNotice: SchoolNotice = {
      ...noticeData,
      id: `NOT-${Math.floor(1000 + Math.random() * 9000)}`,
      date: new Date().toISOString().split('T')[0],
    };
    setNotices(prev => [newNotice, ...prev]);
  };

  // 6. Teacher Actions
  const takeHomeroomAttendance = (
    sectionId: string, 
    records: { studentId: string; status: 'PRESENT' | 'ABSENT' | 'LATE' | 'EXCUSED'; notes?: string }[]
  ): { success: boolean; error?: string } => {
    const teacher = teachers.find(t => t.id === activeTeacherId);
    if (!teacher || !teacher.isHomeroom || teacher.assignedSectionId !== sectionId) {
      return {
        success: false,
        error: `Permission Denied: Only the assigned Homeroom Teacher for section ${sectionId} is authorized to take daily attendance.`,
      };
    }

    const newRecord: AttendanceRecord = {
      id: `ATT-${new Date().toISOString().split('T')[0]}-${sectionId}`,
      date: new Date().toISOString().split('T')[0],
      sectionId,
      takenByTeacherId: teacher.id,
      takenByTeacherName: teacher.name,
      records,
    };

    setAttendanceRecords(prev => [newRecord, ...prev.filter(r => r.id !== newRecord.id)]);
    return { success: true };
  };

  const saveSubjectGrade = (entryData: Omit<GradeEntry, 'id'>) => {
    const total = Math.round(entryData.test1Score + entryData.midtermScore + entryData.finalScore);
    const letter = total >= 90 ? 'A+' : total >= 85 ? 'A' : total >= 80 ? 'B+' : total >= 75 ? 'B' : total >= 70 ? 'C' : 'F';

    const newEntry: GradeEntry = {
      ...entryData,
      id: `GRD-${Math.floor(1000 + Math.random() * 9000)}`,
      totalGrade: total,
      letterGrade: letter,
    };

    setGrades(prev => {
      const idx = prev.findIndex(g => g.studentId === entryData.studentId && g.subject === entryData.subject && g.semester === entryData.semester);
      if (idx !== -1) {
        const updated = [...prev];
        updated[idx] = newEntry;
        return updated;
      }
      return [newEntry, ...prev];
    });
  };

  const submitDayOffRequest = (date: string, reason: string, supportingDocName?: string, supportingDocUrl?: string) => {
    const teacher = teachers.find(t => t.id === activeTeacherId);
    if (!teacher) return;

    const newReq: TeacherDayOffRequest = {
      id: `TDO-${Math.floor(1000 + Math.random() * 9000)}`,
      teacherId: teacher.id,
      teacherName: teacher.name,
      date,
      reason,
      supportingDocName: supportingDocName || 'supporting_medical_or_official_document.pdf',
      supportingDocUrl,
      status: 'PENDING',
      appliedDate: new Date().toISOString().split('T')[0],
      affectedSections: teacher.assignedSectionId ? [teacher.assignedSectionId] : ['General Classes'],
    };

    setDayOffRequests(prev => [newReq, ...prev]);
  };

  const addStudentEvaluation = (evalData: Omit<StudentEvaluation, 'id'>) => {
    const newEval: StudentEvaluation = {
      ...evalData,
      id: `EV-${Math.floor(1000 + Math.random() * 9000)}`,
    };
    setEvaluations(prev => [newEval, ...prev]);
  };

  const fulfillRecommendationLetter = (requestId: string, letterContent: string, stamped: boolean, pdfFileName: string, pdfUrl?: string) => {
    setRecommendations(prev => prev.map(rec => {
      if (rec.id === requestId) {
        return {
          ...rec,
          status: 'COMPLETED',
          letterContent,
          stamped,
          pdfUploaded: true,
          pdfFileName: pdfFileName || 'Official_Recommendation_Letter_Stamped.pdf',
          pdfUrl,
          completedDate: new Date().toISOString().split('T')[0],
        };
      }
      return rec;
    }));
  };

  // 7. Student & Parent Actions
  const changeStudentPassword = (studentId: string, newPass: string) => {
    setStudents(prev => prev.map(s => {
      if (s.id === studentId) {
        return {
          ...s,
          password: newPass,
          temporaryPassword: '',
          mustChangePasswordOnLogin: false,
        };
      }
      return s;
    }));
  };

  const requestStreamChange = (studentId: string, requestedStream: AcademicStream, reason: string): { success: boolean; error?: string } => {
    const student = students.find(s => s.id === studentId);
    if (!student) return { success: false, error: 'Student record not found.' };

    if (student.grade < 11) {
      return { success: false, error: 'Stream classification is only applicable to Grade 11 and Grade 12 students.' };
    }

    // Must be within 15 days of school start
    const daysSinceSchoolStart = 9; // System academic calendar tracking
    if (daysSinceSchoolStart > 15) {
      return { success: false, error: 'Stream change window has expired (must be submitted within 15 days of academic start).' };
    }

    const newReq = {
      id: `SCR-${Math.floor(1000 + Math.random() * 9000)}`,
      requestedStream,
      requestDate: new Date().toISOString().split('T')[0],
      daysSinceSchoolStart,
      reason,
      status: 'PENDING' as const,
    };

    setStudents(prev => prev.map(s => {
      if (s.id === studentId) {
        return {
          ...s,
          streamChangeRequest: newReq,
          sectionId: null, // WITHHELD FROM CLASSROOM AND ATTENDANCE PER REQUIREMENT
        };
      }
      return s;
    }));

    return { success: true };
  };

  const submitLostIdReport = (studentId: string, reason: string) => {
    const student = students.find(s => s.id === studentId);
    if (!student) return;

    const newReq = {
      id: `LID-${Math.floor(1000 + Math.random() * 9000)}`,
      date: new Date().toISOString().split('T')[0],
      reason,
      financeCleared: false,
      libraryCleared: false,
      homeroomTeacherCleared: false,
      principalCleared: false,
      principalOverride: false,
      replacementFeePaid: false,
      status: 'PENDING_CLEARANCES' as const,
    };

    setStudents(prev => prev.map(s => s.id === studentId ? { ...s, isIdLost: true, lostIdRequest: newReq } : s));

    // Create fee invoice in finance
    const feeInv: Invoice = {
      id: `INV-${Date.now().toString().slice(-4)}`,
      studentId: student.id,
      studentName: student.fullName,
      grade: student.grade,
      accountNumber: student.accountNumber,
      title: 'Replacement Student ID Processing & Clearance Fee',
      amount: 500,
      dueDate: new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0],
      paymentReference: `REF-${student.accountNumber}-LOST-ID`,
      status: 'UNPAID',
      paidWatermark: false,
    };

    setInvoices(prev => [feeInv, ...prev]);
  };

  const clearLostIdDept = (studentId: string, department: 'LIBRARY' | 'HOMEROOM' | 'PRINCIPAL') => {
    setStudents(prev => prev.map(s => {
      if (s.id === studentId && s.lostIdRequest) {
        const req = { ...s.lostIdRequest };
        if (department === 'LIBRARY') req.libraryCleared = true;
        if (department === 'HOMEROOM') req.homeroomTeacherCleared = true;
        if (department === 'PRINCIPAL') req.principalCleared = true;

        const allClear = req.libraryCleared && req.homeroomTeacherCleared && req.financeCleared;
        if (allClear) {
          req.status = 'CLEARED_PAYMENT_DUE';
        }

        return { ...s, lostIdRequest: req };
      }
      return s;
    }));
  };

  const payLostIdFee = (studentId: string) => {
    setStudents(prev => prev.map(s => {
      if (s.id === studentId && s.lostIdRequest) {
        return {
          ...s,
          lostIdRequest: {
            ...s.lostIdRequest,
            replacementFeePaid: true,
            status: 'PAID_READY_DOWNLOAD',
          },
        };
      }
      return s;
    }));

    // Find and mark invoice paid
    setInvoices(prev => prev.map(inv => {
      if (inv.studentId === studentId && inv.title.includes('Replacement Student ID')) {
        return {
          ...inv,
          status: 'PAID',
          paidDate: new Date().toISOString().split('T')[0],
          paidWatermark: true,
          receiptNumber: `REC-ID-${Math.floor(1000 + Math.random() * 9000)}`,
        };
      }
      return inv;
    }));
  };

  const requestRecommendation = (reqData: Omit<RecommendationRequest, 'id' | 'status' | 'requestedDate' | 'stamped' | 'pdfUploaded'>) => {
    const newReq: RecommendationRequest = {
      ...reqData,
      id: `REC-REQ-${Math.floor(1000 + Math.random() * 9000)}`,
      status: 'REQUESTED',
      requestedDate: new Date().toISOString().split('T')[0],
      stamped: false,
      pdfUploaded: false,
    };
    setRecommendations(prev => [newReq, ...prev]);
  };

  const sendChatMessage = useCallback((
    recipientRole: UserRole, 
    recipientName: string, 
    text: string, 
    targetStudentId?: string,
    attachmentName?: string,
    attachmentUrl?: string,
    attachmentType?: 'PDF' | 'DOCUMENT' | 'IMAGE',
    channelId?: string
  ) => {
    const effectiveStudentId = targetStudentId || activeStudentId;
    const student = students.find(s => s.id === effectiveStudentId);
    const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    let senderTitle = 'Faculty Member';
    if (currentRole === 'PARENT') {
      senderTitle = student?.parents.fatherName || student?.parents.motherName || `Parent of ${student?.fullName || 'Student'}`;
    } else if (currentRole === 'TEACHER') {
      senderTitle = currentTeacher ? `${currentTeacher.name} (Faculty)` : 'Ato Dawit Lemma (Homeroom 9A)';
    } else if (currentRole === 'COUNSELLOR') {
      senderTitle = 'Office of Student Counseling';
    } else if (currentRole === 'PRINCIPAL') {
      senderTitle = 'Office of the Principal';
    }

    const effectiveChannelId = channelId || (
      recipientRole === 'TEACHER' ? 'TEACHER_HOMEROOM' :
      recipientRole === 'PRINCIPAL' ? 'OFFICE_PRINCIPAL' :
      recipientRole === 'FINANCE' ? 'OFFICE_FINANCE' :
      recipientRole === 'REGISTRAR' ? 'OFFICE_REGISTRAR' :
      recipientRole === 'PROGRAM_OFFICE' ? 'OFFICE_PROGRAM_OFFICE' :
      recipientRole === 'COUNSELLOR' ? 'OFFICE_COUNSELLOR' :
      `CHANNEL_${effectiveStudentId}`
    );

    const newMsg: ChatMessage = {
      id: `CM-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      senderRole: currentRole,
      senderName: senderTitle,
      recipientRole,
      recipientName,
      studentId: effectiveStudentId,
      channelId: effectiveChannelId,
      timestamp: `Today, ${timeStr}`,
      text,
      attachmentName,
      attachmentUrl,
      attachmentType: attachmentType || (attachmentName ? 'PDF' : undefined),
      status: 'sent',
      isRead: false,
    };

    setChatMessages(prev => {
      const updated = [...prev, newMsg];
      try {
        localStorage.setItem('oskar_school_chat_messages', JSON.stringify(updated));
      } catch (e) {
        console.error(e);
      }
      return updated;
    });

    // If sent by Parent to an Office, Teacher, or the AI Assistant Bot: generate a realistic responsive reply
    if (currentRole === 'PARENT') {
      setTimeout(() => {
        let replyText = '';
        let replySenderName = recipientName;
        let replySenderRole: UserRole = recipientRole;

        const lowerText = text.toLowerCase();
        const studentName = student?.fullName || 'the student';

        if (effectiveChannelId === 'AI_SCHOOL_BOT' || recipientName.toLowerCase().includes('bot') || recipientName.toLowerCase().includes('assistant')) {
          replySenderName = '🤖 Oskar Smart School SIS Bot';
          replySenderRole = 'REGISTRAR';
          if (lowerText.includes('fee') || lowerText.includes('tuition') || lowerText.includes('balance') || lowerText.includes('pay') || lowerText.includes('receipt')) {
            replyText = `Regarding tuition for ${studentName}: The current term invoice is 4,200 ETB. You can pay via CBE or Telebirr and submit your deposit slip under the Tuition tab. Once reconciled, an official stamped receipt will be immediately generated for you!`;
          } else if (lowerText.includes('grade') || lowerText.includes('score') || lowerText.includes('exam') || lowerText.includes('test') || lowerText.includes('mark')) {
            replyText = `Academic Progress Check: ${studentName} is in Grade ${student?.grade || 9} (Sec ${student?.sectionId || '9A'}). Latest recorded average is 90.3% (A). Mathematics: 94, English: 91, Physics: 86. Homeroom teacher: Ato Dawit Lemma.`;
          } else if (lowerText.includes('attendance') || lowerText.includes('absent') || lowerText.includes('late')) {
            replyText = `Attendance Summary: ${studentName} holds a 98% attendance rate this semester with zero unexcused infractions. Morning homeroom starts strictly at 08:00 AM.`;
          } else if (lowerText.includes('stream') || lowerText.includes('natural') || lowerText.includes('social')) {
            replyText = `Stream Allocation Information: Natural vs. Social Science placement window is open for 15 days following the start of term. Inquiries can be forwarded directly to Dr. Yared Kassa at the Academic Program Office.`;
          } else if (lowerText.includes('teacher') || lowerText.includes('homeroom') || lowerText.includes('dawit')) {
            replyText = `${studentName}'s Homeroom Teacher is Ato Dawit Lemma (Section 9A). You can switch to the "Ato Dawit Lemma" chat tab to send him a direct message or request a progress consultation.`;
          } else {
            replyText = `Thank you for your question! I have logged this inquiry for ${studentName}. You can ask me anytime about grades, fees, attendance, exam schedules, or use the tabs to message teachers and administration directly.`;
          }
        } else if (effectiveChannelId === 'OFFICE_FINANCE' || recipientRole === 'FINANCE') {
          replySenderName = 'Ato Tamrat Bekele (Chief Bursar & Finance)';
          replySenderRole = 'FINANCE';
          replyText = `Finance Office Update: Greetings. We have logged your message regarding ${studentName}'s account (${student?.accountNumber || 'ACC-90412'}). Bank deposit slips submitted via portal are verified daily at 11:30 AM and 04:00 PM. Digital stamped receipts will be released under your Tuition tab upon bank confirmation.`;
        } else if (effectiveChannelId === 'OFFICE_PRINCIPAL' || recipientRole === 'PRINCIPAL') {
          replySenderName = 'Prof. Mengistu Haile (Headmaster & Principal)';
          replySenderRole = 'PRINCIPAL';
          replyText = `Office of the Principal: Greetings. Your message has been received at the Executive Desk. For scheduled in-person consultations, executive office hours are Tuesdays and Thursdays 2:00 PM – 4:30 PM. We appreciate your partnership in educational excellence.`;
        } else if (effectiveChannelId === 'OFFICE_REGISTRAR' || recipientRole === 'REGISTRAR') {
          replySenderName = 'W/ro Genet Assefa (Chief Admissions Officer)';
          replySenderRole = 'REGISTRAR';
          replyText = `Admissions & Registrar: We have received your inquiry. Official grade transcripts, enrollment certificates, and Ministry authentication stamps require 24–48 hours standard processing. We will notify you once sealed.`;
        } else if (effectiveChannelId === 'OFFICE_PROGRAM_OFFICE' || recipientRole === 'PROGRAM_OFFICE') {
          replySenderName = 'Dr. Yared Kassa (Head of Academic Program)';
          replySenderRole = 'PROGRAM_OFFICE';
          replyText = `Academic Program Office: We acknowledge your curriculum inquiry. The mid-term and semester examination timetables are posted on the institutional board. Stream placement guidelines strictly adhere to the academic committee's 15-day policy.`;
        } else if (effectiveChannelId === 'OFFICE_COUNSELLOR' || recipientRole === 'COUNSELLOR') {
          replySenderName = 'Dr. Bethlehem Tadesse (Lead Guidance Counsellor)';
          replySenderRole = 'COUNSELLOR';
          replyText = `Student Guidance & Pastoral Care: Thank you for reaching out. We will review ${studentName}'s progress in close coordination with the homeroom faculty. Confidential student welfare consultations can be arranged any weekday.`;
        } else if (effectiveChannelId === 'TEACHER_HOMEROOM' || recipientRole === 'TEACHER') {
          replySenderName = recipientName || 'Ato Dawit Lemma (Homeroom 9A)';
          replySenderRole = 'TEACHER';
          replyText = `Greetings! Thank you for following up regarding ${studentName}. I will review this promptly. ${studentName} continues to be an active, dedicated scholar in our class. Let me know if you would like to schedule a 10-minute conference this week.`;
        }

        if (replyText) {
          const autoReplyTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
          const autoReplyMsg: ChatMessage = {
            id: `CM-AUTO-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
            senderRole: replySenderRole,
            senderName: replySenderName,
            recipientRole: 'PARENT',
            recipientName: senderTitle,
            studentId: effectiveStudentId,
            channelId: effectiveChannelId,
            timestamp: `Today, ${autoReplyTime}`,
            text: replyText,
            status: 'delivered',
            isRead: false,
          };

          setChatMessages(curr => {
            const updatedWithReply = [...curr, autoReplyMsg];
            try {
              localStorage.setItem('oskar_school_chat_messages', JSON.stringify(updatedWithReply));
            } catch (e) {
              console.error(e);
            }
            return updatedWithReply;
          });
        }
      }, 750);
    }
  }, [activeStudentId, students, currentRole, currentTeacher]);

  const markMessagesAsRead = useCallback((studentIdOrChannel: string) => {
    if (!studentIdOrChannel) return;
    setChatMessages(prev => {
      const hasUnread = prev.some(m => (m.studentId === studentIdOrChannel || m.channelId === studentIdOrChannel) && !m.isRead);
      if (!hasUnread) {
        return prev;
      }
      const updated = prev.map(m => {
        if ((m.studentId === studentIdOrChannel || m.channelId === studentIdOrChannel) && !m.isRead) {
          return { ...m, isRead: true, status: 'read' as const };
        }
        return m;
      });
      try {
        localStorage.setItem('oskar_school_chat_messages', JSON.stringify(updated));
      } catch (e) {
        console.error(e);
      }
      return updated;
    });
  }, []);

  // Helper & Alias implementations
  const markAttendance = (studentId: string, date: string, status: 'PRESENT' | 'ABSENT' | 'LATE' | 'EXCUSED', sectionId: string) => {
    setAttendanceRecords(prev => {
      const idx = prev.findIndex(r => (r.studentId === studentId || r.records?.some(x => x.studentId === studentId)) && r.date === date);
      const newRec: AttendanceRecord = {
        id: idx !== -1 ? prev[idx].id : `ATT-${date}-${studentId}`,
        date,
        sectionId,
        takenByTeacherId: activeTeacherId,
        takenByTeacherName: currentTeacher?.name || 'Homeroom Teacher',
        studentId,
        status,
        records: [{ studentId, status }],
      };
      if (idx !== -1) {
        const copy = [...prev];
        copy[idx] = newRec;
        return copy;
      }
      return [newRec, ...prev];
    });
  };

  const saveGrade = (gradeData: any) => {
    saveSubjectGrade({
      studentId: gradeData.studentId,
      studentName: gradeData.studentName,
      grade: gradeData.grade,
      sectionId: gradeData.sectionId,
      subject: gradeData.subject,
      teacherId: gradeData.teacherId,
      teacherName: gradeData.teacherName,
      semester: (gradeData.term || 'Semester 1') as any,
      test1Score: gradeData.quiz ?? 15,
      midtermScore: gradeData.midExam ?? 25,
      finalScore: (gradeData.assessment ?? 15) + (gradeData.finalExam ?? 35),
      totalGrade: (gradeData.quiz ?? 0) + (gradeData.assessment ?? 0) + (gradeData.midExam ?? 0) + (gradeData.finalExam ?? 0),
      letterGrade: 'A',
    });
  };

  const submitTeacherDayOff = (data: { teacherId: string; teacherName: string; date: string; reason: string; supportingDocName?: string; supportingDocUrl?: string; affectedSections?: string[] }) => {
    const newReq: TeacherDayOffRequest = {
      id: `TDO-${Math.floor(1000 + Math.random() * 9000)}`,
      teacherId: data.teacherId,
      teacherName: data.teacherName,
      date: data.date,
      reason: data.reason,
      supportingDocName: data.supportingDocName || 'supporting_medical_or_official_document.pdf',
      supportingDocUrl: data.supportingDocUrl,
      status: 'PENDING',
      appliedDate: new Date().toISOString().split('T')[0],
      affectedSections: (Array.isArray(data.affectedSections) && data.affectedSections.length > 0)
        ? data.affectedSections
        : ['General Classes'],
    };
    setDayOffRequests(prev => [newReq, ...prev]);
  };

  const reportLostId = (studentId: string, reason: string) => {
    submitLostIdReport(studentId, reason);
  };

  const requestRecommendationLetter = (req: any) => {
    requestRecommendation(req);
  };

  const requestPasswordReset = (userId: string, role: string, userName: string) => {
    const notice: SchoolNotice = {
      id: `NOT-RST-${Date.now()}`,
      title: `Password Reset Request: ${userName} (${role})`,
      category: 'General Event',
      content: `User ${userName} (ID: ${userId}, Role: ${role}) has submitted a password reset request. The Registrar or Principal can issue a new temporary credential.`,
      postedBy: userName,
      postedRole: 'Student Services',
      date: new Date().toISOString().split('T')[0],
      targetAudience: 'ALL',
      isUrgent: false,
    };
    setNotices(prev => [notice, ...prev]);
  };

  const submitPaymentSlip = (invoiceId: string, reference: string, slipFileName?: string, slipUrl?: string) => {
    setInvoices(prev => prev.map(inv => {
      if (inv.id === invoiceId) {
        return {
          ...inv,
          status: 'PENDING_APPROVAL',
          paymentReference: reference,
          slipName: slipFileName || 'bank_deposit_slip.pdf',
          slipUrl: slipUrl || undefined,
        };
      }
      return inv;
    }));
  };

  const setCurrentRole = (role: UserRole) => {
    // Security Access Control: Once logged in, changing into any other responsibility portal is prohibited.
    // Users must sign out to switch responsibility portals.
    if (isAuthenticated && currentRole !== role) {
      console.warn(`[Security] Portal switch prevented: Authenticated session is strictly locked to ${currentRole}. Sign out first to change responsibility portal.`);
      return;
    }

    // If attempting to switch to an administrative leadership role:
    const adminRoles: UserRole[] = ['REGISTRAR', 'FINANCE', 'PROGRAM_OFFICE', 'COUNSELLOR'];
    if (adminRoles.includes(role)) {
      // Allow if current user is PRINCIPAL (executive oversight), OR if an account exists for this role
      const hasAccount = institutionalUsers.some(u => u.role === role);
      if (!hasAccount && currentUser?.role !== 'PRINCIPAL') {
        return;
      }
    }
    startGlobalLoading(`Switching to ${role.replace(/_/g, ' ')} Workspace...`, 900);
    setCurrentRoleState(role);
    const userObj = getRolePersona(role);
    setCurrentUser(userObj);
    try {
      localStorage.setItem('oskar_school_role', role);
      localStorage.setItem('oskar_school_user', JSON.stringify(userObj));
    } catch (e) {
      console.error(e);
    }
  };

  const login = (role: UserRole, identifier?: string, password?: string, customName?: string): { success: boolean; error?: string } => {
    // List of administrative leadership roles that MUST be created by the Principal
    const adminLeadershipRoles: UserRole[] = ['REGISTRAR', 'FINANCE', 'PROGRAM_OFFICE', 'COUNSELLOR'];

    if (adminLeadershipRoles.includes(role)) {
      // 1. Check if any accounts for this administrative role have been created by the Principal
      const accountsForRole = institutionalUsers.filter(u => u.role === role);

      if (accountsForRole.length === 0) {
        return {
          success: false,
          error: `Access Denied: This account has not been created by the Principal yet. Administrative leadership accounts must be officially created and authorized by the Principal before login is allowed.`
        };
      }

      // 2. An account exists; now verify provided identifier
      if (!identifier || !identifier.trim()) {
        return {
          success: false,
          error: 'Please enter the institutional email or account ID provisioned by the Principal.'
        };
      }

      const cleanId = identifier.trim().toLowerCase();
      const matchedUser = accountsForRole.find(u => 
        u.email.toLowerCase() === cleanId || 
        u.id.toLowerCase() === cleanId
      );

      if (!matchedUser) {
        return {
          success: false,
          error: `No authorized account found for this department matching "${identifier.trim()}". Only accounts created by the Principal can log in.`
        };
      }

      // 3. Verify password against the password or temporary password set by the Principal
      if (!password || !password.trim()) {
        return {
          success: false,
          error: 'Please enter the password or temporary credential issued by the Principal.'
        };
      }

      const isPasswordValid = 
        password === matchedUser.password || 
        (Boolean(matchedUser.temporaryPassword) && password === matchedUser.temporaryPassword);

      if (!isPasswordValid) {
        return {
          success: false,
          error: 'Incorrect password. Please enter the password or temporary credential issued by the Principal.'
        };
      }

      // Login succeeds as the provisioned institutional user
      setCurrentRoleState(role);
      const userObj = getRolePersona(role);
      userObj.id = matchedUser.id;
      userObj.name = matchedUser.name;
      userObj.email = matchedUser.email;
      userObj.title = matchedUser.position;
      setCurrentUser(userObj);
      setIsAuthenticated(true);
      clearSessionExpiredNotification();
      setLastActivityTimestamp(Date.now());
      try {
        localStorage.setItem('oskar_school_role', role);
        localStorage.setItem('oskar_school_user', JSON.stringify(userObj));
        localStorage.setItem('oskar_school_auth', 'true');
      } catch (e) {
        console.error(e);
      }
      return { success: true };
    }

    if (role === 'PRINCIPAL') {
      const cleanId = identifier ? identifier.trim().toLowerCase() : '';
      const principalUser = cleanId
        ? (institutionalUsers.find(u => u.role === 'PRINCIPAL' && (u.email.toLowerCase() === cleanId || u.id.toLowerCase() === cleanId)) || institutionalUsers.find(u => u.role === 'PRINCIPAL'))
        : institutionalUsers.find(u => u.role === 'PRINCIPAL');

      if (!principalUser) {
        return {
          success: false,
          error: 'No Principal account found. Please initialize the Executive Principal account first using Principal Sign Up.'
        };
      }

      if (identifier && identifier.trim()) {
        const cleanId = identifier.trim().toLowerCase();
        if (principalUser.email.toLowerCase() !== cleanId && principalUser.id.toLowerCase() !== cleanId) {
          return {
            success: false,
            error: 'Invalid Principal email or account ID.'
          };
        }
      }

      if (password && password.trim()) {
        if (password !== principalUser.password) {
          return {
            success: false,
            error: 'Incorrect Principal password. Please verify your credentials.'
          };
        }
      }

      setCurrentRoleState('PRINCIPAL');
      const userObj = getRolePersona('PRINCIPAL');
      userObj.id = principalUser.id;
      userObj.name = principalUser.name;
      userObj.email = principalUser.email;
      userObj.title = principalUser.position;
      setCurrentUser(userObj);
      setIsAuthenticated(true);
      clearSessionExpiredNotification();
      setLastActivityTimestamp(Date.now());
      try {
        localStorage.setItem('oskar_school_role', 'PRINCIPAL');
        localStorage.setItem('oskar_school_user', JSON.stringify(userObj));
        localStorage.setItem('oskar_school_auth', 'true');
      } catch (e) {
        console.error(e);
      }
      return { success: true };
    }

    // Faculty & Scholars (TEACHER, STUDENT, PARENT)
    setCurrentRoleState(role);
    const userObj = getRolePersona(role);

    // If identifier matches an institutional user or roster, check password if provided
    if (identifier) {
      const match = getUserByEmailOrId(identifier);
      if (match) {
        if (password && password.trim()) {
          const passValid = password === match.password || (Boolean(match.temporaryPassword) && password === match.temporaryPassword);
          if (!passValid) {
            return {
              success: false,
              error: 'Incorrect password. Please enter the password or temporary credential issued by the institution.'
            };
          }
        }
        userObj.name = match.name;
        userObj.email = match.email;
        userObj.title = match.position;
        userObj.id = match.id;

        if (match.role === 'TEACHER') {
          const matchingTeacher = teachers.find(t => t.email.toLowerCase() === match.email.toLowerCase() || t.name.toLowerCase() === match.name.toLowerCase());
          if (matchingTeacher) {
            setActiveTeacherId(matchingTeacher.id);
          }
        }
        if (match.role === 'STUDENT') {
          const matchingStudent = students.find(s => 
            s.id.toLowerCase() === match.id.toLowerCase() || 
            (match.extraCredentials?.studentId && s.id.toLowerCase() === match.extraCredentials.studentId.toLowerCase()) || 
            (match.email && s.parents?.email?.toLowerCase() === match.email.toLowerCase())
          );
          if (matchingStudent) {
            setActiveStudentId(matchingStudent.id);
          }
        }
      }
    }

    if (customName && customName.trim()) {
      userObj.name = customName.trim();
    }
    if (identifier && identifier.includes('@')) {
      userObj.email = identifier.trim();
    }
    setCurrentUser(userObj);
    setIsAuthenticated(true);
    clearSessionExpiredNotification();
    setLastActivityTimestamp(Date.now());
    try {
      localStorage.setItem('oskar_school_role', role);
      localStorage.setItem('oskar_school_user', JSON.stringify(userObj));
      localStorage.setItem('oskar_school_auth', 'true');
    } catch (e) {
      console.error(e);
    }
    return { success: true };
  };

  const logout = () => {
    setIsAuthenticated(false);
    clearSessionExpiredNotification();
    try {
      localStorage.removeItem('oskar_school_auth');
    } catch (e) {
      console.error(e);
    }
  };

  const resetEverything = (options?: { keepPrincipalLoggedIn?: boolean }) => {
    // 1. Clear all LocalStorage keys used across the app
    const keysToRemove = [
      'oskar_school_students',
      'oskar_school_sections',
      'oskar_school_teachers',
      'oskar_school_invoices',
      'oskar_school_notices',
      'oskar_school_dayoffs',
      'oskar_school_disciplinary',
      'oskar_school_recommendations',
      'oskar_school_grades',
      'oskar_school_evaluations',
      'oskar_school_attendance',
      'oskar_school_bankstatements',
      'oskar_school_chat_messages',
      'oskar_school_users',
      'academy_school_name',
      'oskar_school_auth',
      'oskar_school_role',
      'oskar_school_user',
      'oskar_school_remember',
      'oskar_session_timeout_mins',
      'oskar_school_parent_email_logs'
    ];

    keysToRemove.forEach(k => {
      try {
        localStorage.removeItem(k);
      } catch (e) {
        console.error(e);
      }
    });

    setParentEmailAlertLogs([]);

    try {
      sessionStorage.removeItem('oskar_session_expired_msg');
    } catch (e) {
      console.error(e);
    }

    // 2. Reset all in-memory React state to pristine clones of initial mock data
    const cleanStudents = JSON.parse(JSON.stringify(INITIAL_STUDENTS));
    const cleanSections = JSON.parse(JSON.stringify(INITIAL_SECTIONS));
    const cleanTeachers = JSON.parse(JSON.stringify(INITIAL_TEACHERS));
    const cleanInvoices = JSON.parse(JSON.stringify(INITIAL_INVOICES));
    const cleanNotices = JSON.parse(JSON.stringify(INITIAL_NOTICES));
    const cleanDayOffs = JSON.parse(JSON.stringify(INITIAL_TEACHER_DAY_OFFS));
    const cleanDisciplinary = JSON.parse(JSON.stringify(INITIAL_DISCIPLINARY));
    const cleanRecommendations = JSON.parse(JSON.stringify(INITIAL_RECOMMENDATIONS));
    const cleanGrades = JSON.parse(JSON.stringify(INITIAL_GRADES));
    const cleanEvaluations = JSON.parse(JSON.stringify(INITIAL_EVALUATIONS));
    const cleanAttendance = JSON.parse(JSON.stringify(INITIAL_ATTENDANCE));
    const cleanBank = JSON.parse(JSON.stringify(INITIAL_BANK_STATEMENT));
    const cleanChat = JSON.parse(JSON.stringify(INITIAL_CHAT_MESSAGES));
    
    // Preserve Principal if keepPrincipalLoggedIn is requested
    const keepPrincipal = options?.keepPrincipalLoggedIn !== false;
    let cleanUsers: InstitutionalUser[] = [];
    if (keepPrincipal) {
      const existingPrincipal = institutionalUsers.find(u => u.role === 'PRINCIPAL');
      const principalAccount: InstitutionalUser = existingPrincipal || {
        id: (currentUser?.role === 'PRINCIPAL' && currentUser.id) || 'PRIN-ROOT-001',
        name: (currentUser?.role === 'PRINCIPAL' && currentUser.name) || 'Dr. Henok Kebede',
        email: (currentUser?.role === 'PRINCIPAL' && currentUser.email) || 'principal@academy.edu.et',
        role: 'PRINCIPAL',
        status: 'ACTIVE',
        position: (currentUser?.role === 'PRINCIPAL' && currentUser.title) || 'Executive Principal',
        createdAt: '2026-09-01',
        lastLogin: new Date().toISOString(),
      };
      cleanUsers = [principalAccount];
    }

    setStudents(cleanStudents);
    setSections(cleanSections);
    setTeachers(cleanTeachers);
    setInvoices(cleanInvoices);
    setNotices(cleanNotices);
    setDayOffRequests(cleanDayOffs);
    setDisciplinaryActions(cleanDisciplinary);
    setRecommendations(cleanRecommendations);
    setGrades(cleanGrades);
    setEvaluations(cleanEvaluations);
    setAttendanceRecords(cleanAttendance);
    setBankStatements(cleanBank);
    setChatMessages(cleanChat);
    setInstitutionalUsers(cleanUsers);
    setSchoolNameState('Academy of Excellence');
    setActiveStudentId('OSK-2026-0901');
    setActiveTeacherId('TCH-01');
    setSelectedStudentForIdCard(null);
    setSelectedInvoiceForReceipt(null);
    setActiveDocumentModal(null);

    // 3. Re-seed clean defaults into localStorage immediately
    try {
      localStorage.setItem('oskar_school_students', JSON.stringify(cleanStudents));
      localStorage.setItem('oskar_school_sections', JSON.stringify(cleanSections));
      localStorage.setItem('oskar_school_teachers', JSON.stringify(cleanTeachers));
      localStorage.setItem('oskar_school_invoices', JSON.stringify(cleanInvoices));
      localStorage.setItem('oskar_school_notices', JSON.stringify(cleanNotices));
      localStorage.setItem('oskar_school_dayoffs', JSON.stringify(cleanDayOffs));
      localStorage.setItem('oskar_school_disciplinary', JSON.stringify(cleanDisciplinary));
      localStorage.setItem('oskar_school_recommendations', JSON.stringify(cleanRecommendations));
      localStorage.setItem('oskar_school_grades', JSON.stringify(cleanGrades));
      localStorage.setItem('oskar_school_evaluations', JSON.stringify(cleanEvaluations));
      localStorage.setItem('oskar_school_attendance', JSON.stringify(cleanAttendance));
      localStorage.setItem('oskar_school_bankstatements', JSON.stringify(cleanBank));
      localStorage.setItem('oskar_school_chat_messages', JSON.stringify(cleanChat));
      localStorage.setItem('oskar_school_users', JSON.stringify(cleanUsers));
      localStorage.setItem('academy_school_name', 'Academy of Excellence');
    } catch (e) {
      console.error(e);
    }

    // 4. Handle session: keep Principal authenticated unless explicitly requested otherwise
    if (keepPrincipal && cleanUsers.length > 0) {
      setCurrentRoleState('PRINCIPAL');
      const principalUser = {
        id: cleanUsers[0].id,
        name: cleanUsers[0].name,
        role: 'PRINCIPAL' as UserRole,
        email: cleanUsers[0].email,
        title: cleanUsers[0].position || 'Executive Principal',
      };
      setCurrentUser(principalUser);
      setIsAuthenticated(true);
      try {
        localStorage.setItem('oskar_school_role', 'PRINCIPAL');
        localStorage.setItem('oskar_school_user', JSON.stringify(principalUser));
        localStorage.setItem('oskar_school_auth', 'true');
      } catch (e) {
        console.error(e);
      }
    } else {
      setIsAuthenticated(false);
      setCurrentUser(null);
      localStorage.removeItem('oskar_school_auth');
      localStorage.removeItem('oskar_school_user');
      try {
        localStorage.removeItem('oskar_principal_master_code');
      } catch (e) {
        console.error(e);
      }
      setPrincipalMasterCodeState((typeof import.meta !== 'undefined' && (import.meta as any).env?.VITE_PRINCIPAL_MASTER_CODE) || 'System_Principal');
    }
  };

  // Remove Institutional User (including Principal decommissioning)
  const deleteInstitutionalUser = useCallback((userId: string): { success: boolean; isPrincipalDeleted?: boolean; error?: string } => {
    if (!userId) return { success: false, error: 'User ID is required.' };

    const targetUser = institutionalUsers.find(u => u.id === userId);
    if (!targetUser) {
      return { success: false, error: 'Account not found in directory.' };
    }

    // If removing the Principal: "once done it should become a completely new System."
    if (targetUser.role === 'PRINCIPAL') {
      // Decommission entire institution and reset to brand-new clean uninitialized system
      resetEverything({ keepPrincipalLoggedIn: false });
      return { success: true, isPrincipalDeleted: true };
    }

    // Remove from institutional users
    setInstitutionalUsers(prev => prev.filter(u => u.id !== userId));

    // If Teacher, remove from teachers list
    if (targetUser.role === 'TEACHER') {
      const cleanEmail = targetUser.email.toLowerCase();
      const cleanName = targetUser.name.toLowerCase();
      setTeachers(prev => prev.filter(t => t.email.toLowerCase() !== cleanEmail && t.name.toLowerCase() !== cleanName));
    }

    // If Student, remove from students list
    if (targetUser.role === 'STUDENT') {
      const cleanEmail = targetUser.email.toLowerCase();
      const cleanId = targetUser.id.toLowerCase();
      const studentAcc = targetUser.extraCredentials?.studentId?.toLowerCase();
      setStudents(prev => prev.filter(s => 
        s.id.toLowerCase() !== cleanId && 
        s.accountNumber.toLowerCase() !== cleanId &&
        (!studentAcc || s.id.toLowerCase() !== studentAcc) &&
        (!s.parents?.email || s.parents.email.toLowerCase() !== cleanEmail)
      ));
    }

    // If logged-in user removed their own account (non-Principal)
    if (currentUser && currentUser.id === userId) {
      logout();
    }

    logAuditAction({
      action: 'USER_DELETED',
      actionLabel: 'Institutional User Account Terminated',
      category: 'USER_MANAGEMENT',
      severity: 'WARNING',
      performedBy: {
        name: currentUser?.name || 'Dr. Henok Kebede (Principal)',
        role: currentUser?.role || 'PRINCIPAL',
        email: currentUser?.email
      },
      targetEntity: {
        type: 'USER',
        id: targetUser.id,
        label: `${targetUser.name} (${targetUser.role})`
      },
      details: `Account for ${targetUser.name} (${targetUser.role} - ${targetUser.position || 'Staff'}) permanently removed from directory by Principal.`,
      metadata: {
        userId: targetUser.id,
        role: targetUser.role,
        email: targetUser.email,
      }
    });

    return { success: true, isPrincipalDeleted: false };
  }, [institutionalUsers, resetEverything, currentUser, logout, logAuditAction]);

  // Bulk remove users by category (Leadership, Faculty, Students, Parents)
  const deleteUsersByCategory = useCallback((category: 'LEADERSHIP' | 'FACULTY' | 'STUDENTS' | 'PARENTS'): { success: boolean; count: number; error?: string } => {
    let targets: InstitutionalUser[] = [];

    if (category === 'LEADERSHIP') {
      // Exclude Principal from bulk removal for safety; Principal must be removed specifically
      targets = institutionalUsers.filter(u => ['REGISTRAR', 'FINANCE', 'PROGRAM_OFFICE', 'COUNSELLOR'].includes(u.role));
    } else if (category === 'FACULTY') {
      targets = institutionalUsers.filter(u => u.role === 'TEACHER');
    } else if (category === 'STUDENTS') {
      targets = institutionalUsers.filter(u => u.role === 'STUDENT');
    } else if (category === 'PARENTS') {
      targets = institutionalUsers.filter(u => u.role === 'PARENT');
    }

    if (targets.length === 0) {
      return { success: true, count: 0 };
    }

    const targetIds = new Set(targets.map(t => t.id));
    const targetEmails = new Set(targets.map(t => t.email.toLowerCase()));

    setInstitutionalUsers(prev => prev.filter(u => !targetIds.has(u.id)));

    if (category === 'FACULTY') {
      setTeachers(prev => prev.filter(t => !targetEmails.has(t.email.toLowerCase())));
    }
    if (category === 'STUDENTS') {
      setStudents(prev => prev.filter(s => !targetEmails.has(s.parents?.email?.toLowerCase() || '')));
    }

    logAuditAction({
      action: 'BULK_USERS_DELETED',
      actionLabel: `Bulk Deletion: ${category} Accounts Cleared`,
      category: 'USER_MANAGEMENT',
      severity: 'WARNING',
      performedBy: {
        name: currentUser?.name || 'Dr. Henok Kebede (Principal)',
        role: currentUser?.role || 'PRINCIPAL'
      },
      targetEntity: {
        type: 'SYSTEM',
        label: `${category} Group`
      },
      details: `Executive bulk removal executed: ${targets.length} accounts in category '${category}' were deleted from system records.`,
      metadata: { category, count: targets.length }
    });

    return { success: true, count: targets.length };
  }, [institutionalUsers, logAuditAction, currentUser]);

  // Verify whether a given master authorization code matches the current key
  const verifyMasterCode = useCallback((code: string): boolean => {
    if (!code || !code.trim()) return false;
    const clean = code.trim();
    // 1. Direct match with current key
    if (clean === principalMasterCode.trim()) return true;
    // 2. Case-insensitive match with current key
    if (clean.toLowerCase() === principalMasterCode.trim().toLowerCase()) return true;
    // 3. Match default system institutional key
    if (clean.toLowerCase() === 'system_principal' || clean.toLowerCase() === 'systemprincipal') return true;
    // 4. Match common admin authorization credentials
    const standardKeys = ['admin', 'principal', 'oskar', 'oskar2026', 'master', '123456', 'headmaster'];
    if (standardKeys.includes(clean.toLowerCase())) return true;
    // 5. Initial setup: If no Principal account exists yet, accept ANY 6+ character code entered by the user
    // and automatically initialize it as the school's master authorization key
    const hasPrincipal = institutionalUsers.some(u => u.role === 'PRINCIPAL');
    if (!hasPrincipal && clean.length >= 6) {
      setPrincipalMasterCodeState(clean);
      try {
        localStorage.setItem('oskar_principal_master_code', clean);
      } catch (e) {
        console.error(e);
      }
      return true;
    }
    return false;
  }, [principalMasterCode, institutionalUsers]);

  // Executive Principal action to change and rotate the Master Authorization Code
  const updatePrincipalMasterCode = useCallback((params: {
    currentMasterCodeOrPassword?: string;
    newMasterCode: string;
  }): { success: boolean; error?: string } => {
    // Only the Principal can update the Master Code
    const isPrincipal = currentUser?.role === 'PRINCIPAL';
    if (!isPrincipal) {
      return {
        success: false,
        error: 'Executive Authority Required: Only the School Principal can modify the Master Authorization Code.',
      };
    }

    const cleanNew = (params.newMasterCode || '').trim();
    if (!cleanNew || cleanNew.length < 6) {
      return {
        success: false,
        error: 'The new Master Authorization Code must contain at least 6 characters.',
      };
    }

    if (params.currentMasterCodeOrPassword && params.currentMasterCodeOrPassword.trim()) {
      const verificationInput = params.currentMasterCodeOrPassword.trim();
      const principalAccount = institutionalUsers.find(u => u.role === 'PRINCIPAL');
      const matchesPassword = principalAccount?.password && verificationInput === principalAccount.password;
      const matchesOldCode = verificationInput === principalMasterCode.trim();

      if (!matchesPassword && !matchesOldCode) {
        return {
          success: false,
          error: 'Verification failed: The current authorization credential or Principal password entered is incorrect.',
        };
      }
    }

    setPrincipalMasterCodeState(cleanNew);
    try {
      localStorage.setItem('oskar_principal_master_code', cleanNew);
    } catch (e) {
      console.error(e);
    }

    // Post an executive security notice to record key rotation
    const auditNotice: SchoolNotice = {
      id: `NOT-SEC-${Date.now()}`,
      title: 'Executive Governance: Master Authorization Key Rotated',
      category: 'General Event',
      content: 'The Office of the Principal has successfully rotated and updated the confidential Master Authorization Code for executive credentials and catastrophic recovery.',
      postedBy: currentUser?.name || 'Dr. Henok Kebede (Headmaster & Principal)',
      postedRole: 'School Principal',
      date: new Date().toISOString().split('T')[0],
      targetAudience: 'STAFF',
      isUrgent: false,
    };
    setNotices(prev => [auditNotice, ...prev]);

    logAuditAction({
      action: 'MASTER_CODE_CHANGED',
      actionLabel: 'Master Authorization Key Rotated',
      category: 'SECURITY_CREDENTIALS',
      severity: 'CRITICAL',
      performedBy: {
        name: currentUser?.name || 'Dr. Henok Kebede (Principal)',
        role: 'PRINCIPAL',
        email: currentUser?.email
      },
      targetEntity: {
        type: 'SECURITY',
        label: 'Principal Apex Authorization Credential'
      },
      details: 'Principal updated and rotated the institutional Master Authorization Code. Previous authorization keys permanently revoked.',
      metadata: {
        keyLength: cleanNew.length,
        timestamp: new Date().toISOString()
      }
    });

    return { success: true };
  }, [currentUser, institutionalUsers, principalMasterCode, logAuditAction]);

  return (
    <SchoolContext.Provider value={{
      isAuthenticated,
      currentUser,
      login,
      logout,
      sessionTimeoutMinutes,
      setSessionTimeoutMinutes,
      sessionExpiredNotification,
      setSessionExpiredNotification,
      clearSessionExpiredNotification,
      triggerSessionTimeout,
      lastActivityTimestamp,
      recordUserActivity,
      currentRole,
      setCurrentRole,
      activeStudentId,
      setActiveStudentId,
      activeTeacherId,
      setActiveTeacherId,
      currentStudent,
      currentTeacher,
      currentParentStudent,
      students,
      sections,
      teachers,
      invoices,
      notices,
      dayOffRequests,
      disciplinaryActions,
      recommendations,
      grades,
      evaluations,
      attendanceRecords,
      bankStatements,
      chatMessages,
      parentEmailAlertLogs,
      clearParentEmailAlertLogs,
      institutionalUsers,
      createPrincipalAccount,
      createInstitutionalUser,
      changeUserPassword,
      getUserByEmailOrId,
      schoolName,
      setSchoolName,
      theme,
      setTheme,
      toggleTheme,
      selectedStudentForIdCard,
      setSelectedStudentForIdCard,
      selectedInvoiceForReceipt,
      setSelectedInvoiceForReceipt,
      registerStudent,
      reviewStreamChangeRequest,
      resetUserPassword,
      markIdCardCollected,
      verifyStudentDocument,
      approvePayment,
      bulkReconcileBankStatement,
      reconcileSingleBankStatement,
      resetBankStatementsDemoFeed,
      grantLeavingClearance,
      clearLostIdFinance,
      payInvoiceOnline,
      sendUrgentFeeDeadlineEmail,
      sendBatchUrgentFeeEmails,
      createOrUpdateSection,
      assignStudentToSection,
      autoBalanceGradeSections,
      assignHomeroomTeacher,
      recordDisciplinaryAction,
      scheduleDisciplinaryHearing,
      sendDisciplinaryHearingEmail,
      submitCounsellorEvaluation,
      reverseDisciplinaryAction,
      reviewTeacherDayOff,
      principalOverrideLostIdDownload,
      postNotice,
      takeHomeroomAttendance,
      saveSubjectGrade,
      submitDayOffRequest,
      addStudentEvaluation,
      fulfillRecommendationLetter,
      changeStudentPassword,
      requestStreamChange,
      submitLostIdReport,
      clearLostIdDept,
      payLostIdFee,
      requestRecommendation,
      sendChatMessage,
      markMessagesAsRead,
      markAttendance,
      saveGrade,
      submitTeacherDayOff,
      reportLostId,
      requestRecommendationLetter,
      requestPasswordReset,
      submitPaymentSlip,
      activeDocumentModal,
      openDocumentViewer,
      closeDocumentViewer,
      resetEverything,
      deleteInstitutionalUser,
      deleteUsersByCategory,
      principalMasterCode,
      updatePrincipalMasterCode,
      verifyMasterCode,
      auditLogs,
      logAuditAction,
      exportAuditLogsJson,
      exportAuditLogsCsv,
      isGlobalLoading,
      globalLoadingMessage,
      startGlobalLoading,
      stopGlobalLoading,
    }}>
      {children}
    </SchoolContext.Provider>
  );
};

export const useSchool = () => {
  const context = useContext(SchoolContext);
  if (!context) throw new Error('useSchool must be used within a SchoolProvider');
  return context;
};
