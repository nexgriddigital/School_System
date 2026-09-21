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
  StudentEvaluation,
  InstitutionalUser
} from './types';

export const INITIAL_STUDENTS: Student[] = [];
export const INITIAL_SECTIONS: Section[] = [];
export const INITIAL_TEACHERS: Teacher[] = [];
export const INITIAL_INVOICES: Invoice[] = [];
export const INITIAL_BANK_STATEMENT: BankStatementRow[] = [];
export const INITIAL_NOTICES: SchoolNotice[] = [];
export const INITIAL_TEACHER_DAY_OFFS: TeacherDayOffRequest[] = [];
export const INITIAL_DISCIPLINARY: DisciplinaryAction[] = [];
export const INITIAL_RECOMMENDATIONS: RecommendationRequest[] = [];
export const INITIAL_GRADES: GradeEntry[] = [];
export const INITIAL_EVALUATIONS: StudentEvaluation[] = [];
export const INITIAL_ATTENDANCE: AttendanceRecord[] = [];
export const INITIAL_USERS: InstitutionalUser[] = [];
