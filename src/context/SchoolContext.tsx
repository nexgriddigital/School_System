import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
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
  AcademicStream
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
  INITIAL_BANK_STATEMENT
} from '../mockData';

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
  
  // Authentication & Session State
  isAuthenticated: boolean;
  currentUser: { id: string; name: string; role: UserRole; email?: string; title?: string } | null;
  login: (role: UserRole, identifier?: string, password?: string) => { success: boolean; error?: string };
  logout: () => void;
  isDemoTemplateMode: boolean;
  setIsDemoTemplateMode: (val: boolean) => void;
  showTemplatesModal: boolean;
  setShowTemplatesModal: (show: boolean) => void;
  launchTemplate: (role: UserRole) => void;
  exitDemoMode: () => void;

  // Institution Branding
  schoolName: string;
  setSchoolName: (name: string) => void;

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
  
  // Actions: Finance
  approvePayment: (invoiceId: string) => void;
  bulkReconcileBankStatement: (uploadedRows?: BankStatementRow[]) => { matchedCount: number; approvedTotal: number };
  grantLeavingClearance: (studentId: string) => void;
  clearLostIdFinance: (studentId: string) => void;
  payInvoiceOnline: (invoiceId: string, reference: string) => void;
  
  // Actions: Program Office
  createOrUpdateSection: (section: Section) => void;
  assignStudentToSection: (studentId: string, sectionId: string) => { success: boolean; error?: string };
  autoBalanceGradeSections: (grade: AcademicGrade) => { assignedCount: number; skippedPendingStreamCount: number };
  assignHomeroomTeacher: (sectionId: string, teacherId: string) => void;
  
  // Actions: Counsellor
  recordDisciplinaryAction: (action: Omit<DisciplinaryAction, 'id' | 'homeroomTeacherNotified' | 'reversedByPrincipal'>) => void;
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
    return [
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
  });

  // Modal selections
  const [selectedStudentForIdCard, setSelectedStudentForIdCard] = useState<Student | null>(null);
  const [selectedInvoiceForReceipt, setSelectedInvoiceForReceipt] = useState<Invoice | null>(null);

  // Authentication & Session State (False until login)
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    return localStorage.getItem('oskar_school_auth') === 'true';
  });
  const [currentUser, setCurrentUser] = useState<{ id: string; name: string; role: UserRole; email?: string; title?: string } | null>(() => {
    return getRolePersona(currentRole);
  });
  const [isDemoTemplateMode, setIsDemoTemplateMode] = useState<boolean>(false);
  const [showTemplatesModal, setShowTemplatesModal] = useState<boolean>(false);

  // Institution Customization
  const [schoolName, setSchoolNameState] = useState<string>(() => {
    return localStorage.getItem('academy_school_name') || 'Academy of Excellence';
  });

  const setSchoolName = (name: string) => {
    setSchoolNameState(name);
    localStorage.setItem('academy_school_name', name);
  };

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
  const recordDisciplinaryAction = (actionData: Omit<DisciplinaryAction, 'id' | 'homeroomTeacherNotified' | 'reversedByPrincipal'>) => {
    const newAction: DisciplinaryAction = {
      ...actionData,
      id: `DISC-${Math.floor(1000 + Math.random() * 9000)}`,
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

  const login = (role: UserRole) => {
    setCurrentRole(role);
    setIsAuthenticated(true);
    try {
      localStorage.setItem('oskar_school_auth', 'true');
    } catch (e) {
      console.error(e);
    }
    return { success: true };
  };

  const logout = () => {
    setIsAuthenticated(false);
    try {
      localStorage.removeItem('oskar_school_auth');
    } catch (e) {
      console.error(e);
    }
  };

  const launchTemplate = (role: UserRole) => {
    setCurrentRole(role);
    setShowTemplatesModal(false);
    if (typeof window !== 'undefined') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const exitDemoMode = () => {
    // No-op: all portals are open directly with no login barrier
  };

  return (
    <SchoolContext.Provider value={{
      isAuthenticated,
      currentUser,
      login,
      logout,
      isDemoTemplateMode,
      setIsDemoTemplateMode,
      showTemplatesModal,
      setShowTemplatesModal,
      launchTemplate,
      exitDemoMode,
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
      schoolName,
      setSchoolName,
      selectedStudentForIdCard,
      setSelectedStudentForIdCard,
      selectedInvoiceForReceipt,
      setSelectedInvoiceForReceipt,
      registerStudent,
      reviewStreamChangeRequest,
      resetUserPassword,
      markIdCardCollected,
      approvePayment,
      bulkReconcileBankStatement,
      grantLeavingClearance,
      clearLostIdFinance,
      payInvoiceOnline,
      createOrUpdateSection,
      assignStudentToSection,
      autoBalanceGradeSections,
      assignHomeroomTeacher,
      recordDisciplinaryAction,
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
