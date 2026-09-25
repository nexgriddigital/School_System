import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useSchool } from '../../context/SchoolContext';
import { UserRole, AcademicGrade, InstitutionalUser } from '../../types';
import { 
  Building2, 
  CreditCard, 
  Layers, 
  HeartHandshake, 
  Users, 
  User, 
  Home, 
  ShieldCheck, 
  KeyRound, 
  Mail, 
  Plus, 
  Search, 
  CheckCircle2, 
  RefreshCw, 
  Copy, 
  Check, 
  AlertTriangle, 
  Download, 
  BookOpen,
  Sparkles,
  Phone,
  Briefcase,
  GraduationCap,
  RotateCcw,
  Lock,
  Crown,
  ArrowRight,
  Trash2,
  AlertOctagon,
  ShieldAlert,
  Filter,
  X,
  ExternalLink
} from 'lucide-react';
import { downloadInstructionsManualPdf } from '../../services/manualPdfService';
import { 
  sendTemporaryPasswordEmailViaGmail, 
  isGmailAuthorized, 
  signInWithGoogle, 
  getCurrentGoogleUser,
  generateCredentialsMailtoUrl 
} from '../../services/gmailAuthService';
import { sendFreeTemporaryPasswordEmail } from '../../services/freeEmailService';
import { ChangeMasterCodeModal } from './ChangeMasterCodeModal';

interface UserProvisioningTabProps {
  onOpenResetModal?: () => void;
}

export const UserProvisioningTab: React.FC<UserProvisioningTabProps> = ({ onOpenResetModal }) => {
  const { 
    schoolName, 
    currentUser, 
    institutionalUsers, 
    createInstitutionalUser, 
    deleteInstitutionalUser,
    deleteUsersByCategory,
    sections 
  } = useSchool();

  // Provisioning Form State
  const [selectedRole, setSelectedRole] = useState<UserRole>('REGISTRAR');
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [position, setPosition] = useState('Senior Admissions & Records Officer');
  const [department, setDepartment] = useState('Admissions & Registrar Division');
  const [phone, setPhone] = useState('+251 91 100 2200');

  // Role-Specific Fields
  const [teacherSubject, setTeacherSubject] = useState('Mathematics & Calculus');
  const [teacherHomeroomSection, setTeacherHomeroomSection] = useState('');
  const [studentGrade, setStudentGrade] = useState<AcademicGrade>(9);
  const [studentStream, setStudentStream] = useState<'NATURAL' | 'SOCIAL' | null>(null);
  const [studentSection, setStudentSection] = useState('Sec-9A');

  // UI States
  const [isProvisioning, setIsProvisioning] = useState(false);
  const [provisionSuccessResult, setProvisionSuccessResult] = useState<{
    user: InstitutionalUser;
    tempPassword: string;
  } | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [resendingId, setResendingId] = useState<string | null>(null);
  const [resendSuccessMsg, setResendSuccessMsg] = useState<string | null>(null);

  // Categorized Directory & Deletion States
  const [activeCategory, setActiveCategory] = useState<'ALL' | 'LEADERSHIP' | 'FACULTY' | 'STUDENTS' | 'PARENTS'>('ALL');
  const [accountToDelete, setAccountToDelete] = useState<InstitutionalUser | null>(null);
  const [isDeletingUser, setIsDeletingUser] = useState(false);
  const [isChangeMasterCodeModalOpen, setIsChangeMasterCodeModalOpen] = useState(false);
  const [isDeletePrincipalModalOpen, setIsDeletePrincipalModalOpen] = useState(false);
  const [principalResetConfirmInput, setPrincipalResetConfirmInput] = useState('');
  const [isDeletingPrincipal, setIsDeletingPrincipal] = useState(false);
  const [categoryToPurge, setCategoryToPurge] = useState<'ALL' | 'LEADERSHIP' | 'FACULTY' | 'STUDENTS' | 'PARENTS' | null>(null);
  const [purgeConfirmInput, setPurgeConfirmInput] = useState('');
  const [isPurgingCategory, setIsPurgingCategory] = useState(false);
  const [deleteSuccessMsg, setDeleteSuccessMsg] = useState<string | null>(null);

  // Directory Search & Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState<'ALL' | UserRole>('ALL');

  // Free Gmail Integration State
  const [isConnectingGmail, setIsConnectingGmail] = useState(false);
  const [gmailStatusNotice, setGmailStatusNotice] = useState<string | null>(null);
  const isGmailActive = isGmailAuthorized();
  const currentGoogle = getCurrentGoogleUser();

  const handleConnectGmail = async () => {
    setIsConnectingGmail(true);
    setGmailStatusNotice(null);
    try {
      const res = await signInWithGoogle();
      if (res) {
        setGmailStatusNotice(`Google account (${res.user.email}) connected! Temporary passwords will now be emailed directly to user inboxes.`);
      }
    } catch (err: any) {
      setGmailStatusNotice(err?.message || 'Google authorization could not be completed.');
    } finally {
      setIsConnectingGmail(false);
    }
  };

  // Role Metadata Config
  const roleOptions: {
    role: UserRole;
    label: string;
    icon: React.FC<{ className?: string }>;
    defaultPosition: string;
    defaultDept: string;
    badgeColor: string;
  }[] = [
    {
      role: 'PRINCIPAL',
      label: 'Executive Headmaster & Principal',
      icon: Crown,
      defaultPosition: 'Executive Headmaster & Principal',
      defaultDept: 'Office of the Principal & Board of Trustees',
      badgeColor: 'bg-amber-100 text-amber-900 border-amber-300',
    },
    {
      role: 'REGISTRAR',
      label: 'Admissions & Registrar',
      icon: Building2,
      defaultPosition: 'Chief Admissions & Records Officer',
      defaultDept: 'Admissions & Records Division',
      badgeColor: 'bg-indigo-100 text-indigo-800 border-indigo-200',
    },
    {
      role: 'FINANCE',
      label: 'Finance & Bursar',
      icon: CreditCard,
      defaultPosition: 'Senior Finance Officer & Bursar',
      defaultDept: 'Finance & Treasury Department',
      badgeColor: 'bg-emerald-100 text-emerald-800 border-emerald-200',
    },
    {
      role: 'PROGRAM_OFFICE',
      label: 'Program Office',
      icon: Layers,
      defaultPosition: 'Academic Program & Curriculum Coordinator',
      defaultDept: 'Academic Planning & Program Office',
      badgeColor: 'bg-cyan-100 text-cyan-800 border-cyan-200',
    },
    {
      role: 'COUNSELLOR',
      label: 'Guidance & Pastoral Care',
      icon: HeartHandshake,
      defaultPosition: 'Head of Student Welfare & Discipline',
      defaultDept: 'Pastoral Care & Counseling Center',
      badgeColor: 'bg-rose-100 text-rose-800 border-rose-200',
    },
    {
      role: 'TEACHER',
      label: 'Faculty & Instruction',
      icon: Users,
      defaultPosition: 'Secondary Faculty Instructor',
      defaultDept: 'Department of Natural & Applied Sciences',
      badgeColor: 'bg-blue-100 text-blue-800 border-blue-200',
    },
    {
      role: 'STUDENT',
      label: 'Student Scholar',
      icon: User,
      defaultPosition: 'High School Enrolled Scholar',
      defaultDept: 'Secondary Scholar Division',
      badgeColor: 'bg-purple-100 text-purple-800 border-purple-200',
    },
    {
      role: 'PARENT',
      label: 'Parent / Guardian',
      icon: Home,
      defaultPosition: 'Primary Guardian & Family Liaison',
      defaultDept: 'Parent-Teacher Association',
      badgeColor: 'bg-amber-100 text-amber-800 border-amber-200',
    },
  ];

  const handleRoleChange = (newRole: UserRole) => {
    setSelectedRole(newRole);
    const meta = roleOptions.find((r) => r.role === newRole);
    if (meta) {
      setPosition(meta.defaultPosition);
      setDepartment(meta.defaultDept);
    }
  };

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setProvisionSuccessResult(null);

    if (!fullName.trim()) {
      setErrorMessage('Please provide the full legal name of the user.');
      return;
    }

    if (!email.trim() || !email.includes('@')) {
      setErrorMessage('Please provide a valid institutional email address for temporary password dispatch.');
      return;
    }

    // Check duplicate email
    const exists = institutionalUsers.some((u) => u.email.toLowerCase() === email.trim().toLowerCase());
    if (exists) {
      setErrorMessage(`A user account with email "${email.trim()}" is already registered in the institutional directory.`);
      return;
    }

    setIsProvisioning(true);

    try {
      // Build role-specific extra payload
      let extraCredentials: any = undefined;
      if (selectedRole === 'TEACHER') {
        extraCredentials = {
          subject: teacherSubject,
          homeroomSection: teacherHomeroomSection || undefined,
        };
      } else if (selectedRole === 'STUDENT') {
        extraCredentials = {
          grade: studentGrade,
          stream: studentGrade >= 11 ? (studentStream || 'NATURAL') : undefined,
          section: studentSection,
        };
      }

      const result = await createInstitutionalUser({
        name: fullName.trim(),
        email: email.trim(),
        role: selectedRole,
        position: position.trim(),
        department: department.trim(),
        phone: phone.trim(),
        extraCredentials,
      });

      if (result.success) {
        setProvisionSuccessResult({
          user: result.user,
          tempPassword: result.tempPassword,
        });
        // Clear form
        setFullName('');
        setEmail('');
      } else {
        setErrorMessage(result.error || 'Failed to create user.');
      }
    } catch (err: any) {
      setErrorMessage(err?.message || 'Error occurred while provisioning user.');
    } finally {
      setIsProvisioning(false);
    }
  };

  const handleCopyCredentials = (pass: string, id: string) => {
    navigator.clipboard.writeText(pass);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleResendTempPassword = async (user: InstitutionalUser) => {
    if (!user.temporaryPassword) return;
    setResendingId(user.id);
    setResendSuccessMsg(null);

    try {
      // 1. Dispatch via Free API endpoint directly to user email
      const freeRes = await sendFreeTemporaryPasswordEmail({
        recipientEmail: user.email.trim(),
        recipientName: user.name.trim(),
        roleName: user.role,
        positionTitle: user.position.trim(),
        tempPassword: user.temporaryPassword,
        schoolName,
        senderName: currentUser?.name || 'Office of the Principal',
      });

      // 2. Also dispatch via Gmail if logged in
      if (isGmailAuthorized()) {
        try {
          await sendTemporaryPasswordEmailViaGmail({
            recipientEmail: user.email.trim(),
            recipientName: user.name.trim(),
            roleName: user.role,
            positionTitle: user.position.trim(),
            tempPassword: user.temporaryPassword,
            schoolName,
            senderName: currentUser?.name || 'Office of the Principal',
          });
        } catch (gErr) {
          console.warn('Gmail redispatch fallback notice:', gErr);
        }
      }

      setResendSuccessMsg(`Temporary password email successfully dispatched via Free API directly to ${user.email}`);
      setTimeout(() => setResendSuccessMsg(null), 5000);
    } catch (e: any) {
      console.warn('Email dispatch notice:', e);
      const mailto = generateCredentialsMailtoUrl({
        recipientEmail: user.email,
        recipientName: user.name,
        roleName: user.role,
        positionTitle: user.position,
        tempPassword: user.temporaryPassword,
        schoolName,
      });
      window.location.href = mailto;
      setResendSuccessMsg(`Opened pre-filled email in default mail client for ${user.email}`);
    } finally {
      setResendingId(null);
    }
  };

  // Identify the Principal user (or synthesize root Principal if in executive mode)
  const principalUser = useMemo(() => {
    return (
      institutionalUsers.find((u) => u.role === 'PRINCIPAL') ||
      (currentUser?.role === 'PRINCIPAL'
        ? ({
            id: currentUser.id || 'PRIN-ROOT-001',
            name: currentUser.name || 'Dr. O. Woldeyesus',
            email: currentUser.email || 'principal@oskaracademy.edu',
            role: 'PRINCIPAL' as UserRole,
            position: currentUser.title || 'Executive Headmaster & Principal',
            department: 'Office of the Principal & Board of Trustees',
            createdAt: new Date().toISOString(),
            createdBy: 'System Root Authority',
          } as InstitutionalUser)
        : null)
    );
  }, [institutionalUsers, currentUser]);

  // Unified roster ensuring the Principal is included for directory management and decommission
  const allDirectoryUsers = useMemo(() => {
    const list = [...institutionalUsers];
    if (principalUser && !list.some((u) => u.role === 'PRINCIPAL')) {
      list.unshift(principalUser);
    }
    return list;
  }, [institutionalUsers, principalUser]);

  // Category Configuration
  const categoryOptions = useMemo(() => [
    {
      id: 'ALL' as const,
      title: 'All Institutional Users',
      shortLabel: 'All Users',
      description: 'Unified roster across all leadership departments, faculty, scholars, and parents',
      icon: Users,
      badgeClass: 'bg-slate-900 text-white',
      count: allDirectoryUsers.length,
      roles: ['PRINCIPAL', 'REGISTRAR', 'FINANCE', 'PROGRAM_OFFICE', 'COUNSELLOR', 'TEACHER', 'STUDENT', 'PARENT'] as UserRole[],
    },
    {
      id: 'LEADERSHIP' as const,
      title: 'Executive Leadership & Administration',
      shortLabel: 'Leadership',
      description: 'Institutional directors: Principal, Registrar, Bursar, Curriculum Dean & Pastoral Care',
      icon: Crown,
      badgeClass: 'bg-amber-600 text-white',
      count: allDirectoryUsers.filter((u) => ['PRINCIPAL', 'REGISTRAR', 'FINANCE', 'PROGRAM_OFFICE', 'COUNSELLOR'].includes(u.role)).length,
      roles: ['PRINCIPAL', 'REGISTRAR', 'FINANCE', 'PROGRAM_OFFICE', 'COUNSELLOR'] as UserRole[],
    },
    {
      id: 'FACULTY' as const,
      title: 'Faculty & Instructional Staff',
      shortLabel: 'Faculty & Teachers',
      description: 'Departmental subject teachers, academic instructors, and homeroom advisors',
      icon: Briefcase,
      badgeClass: 'bg-blue-600 text-white',
      count: allDirectoryUsers.filter((u) => u.role === 'TEACHER').length,
      roles: ['TEACHER'] as UserRole[],
    },
    {
      id: 'STUDENTS' as const,
      title: 'Scholars & Student Body',
      shortLabel: 'Scholars & Students',
      description: 'Registered secondary division students across Grades 9–12',
      icon: GraduationCap,
      badgeClass: 'bg-purple-600 text-white',
      count: allDirectoryUsers.filter((u) => u.role === 'STUDENT').length,
      roles: ['STUDENT'] as UserRole[],
    },
    {
      id: 'PARENTS' as const,
      title: 'Parents & Guardians',
      shortLabel: 'Parents & Guardians',
      description: 'Authorized family liaisons and guardian accounts linked to student scholars',
      icon: Home,
      badgeClass: 'bg-emerald-600 text-white',
      count: allDirectoryUsers.filter((u) => u.role === 'PARENT').length,
      roles: ['PARENT'] as UserRole[],
    },
  ], [allDirectoryUsers]);

  // Filtered Directory based on Category, sub-role filter, and Search Query
  const filteredUsers = useMemo(() => {
    const activeCatMeta = categoryOptions.find((c) => c.id === activeCategory);
    const categoryRoles = activeCatMeta ? activeCatMeta.roles : [];

    return allDirectoryUsers.filter((u) => {
      const matchCategory = activeCategory === 'ALL' || categoryRoles.includes(u.role);
      const matchRole = roleFilter === 'ALL' || u.role === roleFilter;
      const q = searchQuery.toLowerCase().trim();
      const matchQuery =
        !q ||
        u.name.toLowerCase().includes(q) ||
        u.email.toLowerCase().includes(q) ||
        u.position.toLowerCase().includes(q) ||
        (u.department && u.department.toLowerCase().includes(q)) ||
        u.id.toLowerCase().includes(q);
      return matchCategory && matchRole && matchQuery;
    });
  }, [allDirectoryUsers, activeCategory, categoryOptions, roleFilter, searchQuery]);

  // Handler: Standard User Removal
  const handleConfirmDeleteUser = () => {
    if (!accountToDelete) return;
    setIsDeletingUser(true);
    try {
      const res = deleteInstitutionalUser(accountToDelete.id);
      if (res.success) {
        setDeleteSuccessMsg(`Account for "${accountToDelete.name}" (${accountToDelete.position}) has been removed. All permissions and login access revoked.`);
        setAccountToDelete(null);
        setTimeout(() => setDeleteSuccessMsg(null), 5000);
      } else {
        setErrorMessage(res.error || 'Failed to remove user account.');
      }
    } catch (e: any) {
      setErrorMessage(e.message || 'Error occurred while removing user.');
    } finally {
      setIsDeletingUser(false);
    }
  };

  // Handler: Principal Decommission & Complete System Reset
  const handleConfirmDeletePrincipal = () => {
    if (principalResetConfirmInput.trim().toUpperCase() !== 'RESET') {
      return;
    }
    setIsDeletingPrincipal(true);
    try {
      const targetId = principalUser?.id || 'PRIN-ROOT-001';
      const res = deleteInstitutionalUser(targetId);
      if (res.success) {
        setIsDeletePrincipalModalOpen(false);
        setPrincipalResetConfirmInput('');
        setIsDeletingPrincipal(false);
      } else {
        setErrorMessage(res.error || 'Error decommissioning system.');
        setIsDeletingPrincipal(false);
      }
    } catch (e: any) {
      setErrorMessage(e.message || 'Error decommissioning system.');
      setIsDeletingPrincipal(false);
    }
  };

  // Handler: Bulk Purge by Category
  const handleConfirmPurgeCategory = () => {
    if (!categoryToPurge || purgeConfirmInput.trim().toUpperCase() !== 'DELETE') {
      return;
    }
    setIsPurgingCategory(true);
    try {
      if (categoryToPurge === 'ALL') {
        const res = deleteUsersByCategory('LEADERSHIP');
        const res2 = deleteUsersByCategory('FACULTY');
        const res3 = deleteUsersByCategory('STUDENTS');
        const res4 = deleteUsersByCategory('PARENTS');
        const total = (res.count || 0) + (res2.count || 0) + (res3.count || 0) + (res4.count || 0);
        setDeleteSuccessMsg(`Successfully purged ${total} non-executive user accounts.`);
      } else if (categoryToPurge === 'LEADERSHIP') {
        const res = deleteUsersByCategory('LEADERSHIP');
        setDeleteSuccessMsg(`Successfully revoked all ${res.count} departmental leadership accounts. Login is now blocked until re-provisioned.`);
      } else if (categoryToPurge === 'FACULTY') {
        const res = deleteUsersByCategory('FACULTY');
        setDeleteSuccessMsg(`Successfully removed ${res.count} faculty accounts and instructional assignments.`);
      } else if (categoryToPurge === 'STUDENTS') {
        const res = deleteUsersByCategory('STUDENTS');
        setDeleteSuccessMsg(`Successfully removed ${res.count} scholar credentials.`);
      } else if (categoryToPurge === 'PARENTS') {
        const res = deleteUsersByCategory('PARENTS');
        setDeleteSuccessMsg(`Successfully removed ${res.count} parent/guardian portal credentials.`);
      }
      setTimeout(() => setDeleteSuccessMsg(null), 5000);
      setCategoryToPurge(null);
      setPurgeConfirmInput('');
    } catch (e: any) {
      setErrorMessage(e.message || 'Error purging category accounts.');
    } finally {
      setIsPurgingCategory(false);
    }
  };

  // Administrative Leadership Roles Overview
  const adminRolesSummary = useMemo(() => {
    const roles: {
      role: UserRole;
      title: string;
      department: string;
      defaultPosition: string;
      defaultName: string;
      defaultEmail: string;
      icon: any;
    }[] = [
      {
        role: 'REGISTRAR',
        title: 'Admissions & Registrar',
        department: 'Admissions & Records Office',
        defaultPosition: 'Senior Admissions & Records Officer',
        defaultName: '',
        defaultEmail: 'admissions@oskaracademy.edu',
        icon: Building2,
      },
      {
        role: 'FINANCE',
        title: 'Finance & Bursar',
        department: 'Finance & Accounts Division',
        defaultPosition: 'Chief Bursar & Finance Director',
        defaultName: '',
        defaultEmail: 'bursar@oskaracademy.edu',
        icon: CreditCard,
      },
      {
        role: 'PROGRAM_OFFICE',
        title: 'Program Office',
        department: 'Curriculum & Academic Affairs',
        defaultPosition: 'Curriculum & Examinations Dean',
        defaultName: '',
        defaultEmail: 'programoffice@oskaracademy.edu',
        icon: Layers,
      },
      {
        role: 'COUNSELLOR',
        title: 'Guidance & Pastoral Care',
        department: 'Student Support Services',
        defaultPosition: 'Head of Student Welfare & Mentorship',
        defaultName: '',
        defaultEmail: 'pastoral@oskaracademy.edu',
        icon: HeartHandshake,
      },
    ];

    return roles.map(item => {
      const activeUser = institutionalUsers.find(u => u.role === item.role);
      return {
        ...item,
        isCreated: Boolean(activeUser),
        user: activeUser,
      };
    });
  }, [institutionalUsers]);

  const handleQuickProvisionRole = (roleMeta: (typeof adminRolesSummary)[0]) => {
    handleRoleChange(roleMeta.role);
    setPosition(roleMeta.defaultPosition);
    setDepartment(roleMeta.department);
    setEmail(roleMeta.defaultEmail);
    const formEl = document.getElementById('provisioning-form-anchor');
    if (formEl) {
      formEl.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="space-y-8">
      {/* Top Banner with Policy & PDF Manual Button */}
      <div className="bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 text-white rounded-3xl p-6 sm:p-8 shadow-xl relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full bg-blue-500/20 text-blue-200 border border-blue-400/30 text-[10px] font-bold uppercase tracking-wider">
                Principal Executive Authority
              </span>
              <span className="px-2.5 py-0.5 rounded-full bg-emerald-400/20 text-emerald-200 border border-emerald-400/30 text-[10px] font-bold font-mono">
                Cryptographic Master Key Protocol
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-bold font-oskar tracking-wide text-white">
              Institutional User Provisioning & Credential Lifecycle
            </h2>
            <p className="text-xs sm:text-sm text-blue-100/80 leading-relaxed">
              Users other than the Principal are created exclusively by the Principal. Once details and credentials are provided, 
              the system automatically creates a secure <strong>Temporary Password</strong>, sends an official email notification via Gmail, 
              and enforces a <strong>mandatory password change upon their first login</strong>.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 shrink-0">
            <button
              onClick={() => setIsChangeMasterCodeModalOpen(true)}
              className="flex items-center justify-center gap-2 px-3.5 py-2.5 rounded-xl bg-amber-600/90 hover:bg-amber-500 text-white font-bold text-xs shadow-md border border-amber-400/40 transition cursor-pointer"
              title="Change the confidential Master Authorization Code for executive Principal authority"
            >
              <KeyRound className="w-4 h-4 text-amber-200" />
              <span>Change Master Code</span>
            </button>

            <button
              onClick={() => downloadInstructionsManualPdf(schoolName)}
              className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs shadow-lg transition cursor-pointer"
              title="Download official comprehensive PDF manual with NexGrid Digital Systems letterhead on every page"
            >
              <Download className="w-4 h-4" />
              <span>Download Official Manual (PDF)</span>
            </button>

            <button
              onClick={() => {
                setPrincipalResetConfirmInput('');
                setIsDeletePrincipalModalOpen(true);
              }}
              className="flex items-center justify-center gap-2 px-3.5 py-2.5 rounded-xl bg-rose-900/90 hover:bg-rose-800 text-white font-bold text-xs shadow-md border border-rose-500/50 transition cursor-pointer"
              title="Decommission Principal account and reset platform to a clean uninitialized system"
            >
              <AlertOctagon className="w-4 h-4 text-rose-300" />
              <span>Decommission Principal & Reset System</span>
            </button>

            {onOpenResetModal && (
              <button
                onClick={onOpenResetModal}
                className="flex items-center justify-center gap-2 px-3.5 py-2.5 rounded-xl bg-slate-800/90 hover:bg-slate-700 text-white font-bold text-xs shadow-md border border-slate-600/40 transition cursor-pointer"
                title="Reset institutional demonstration data"
              >
                <RotateCcw className="w-4 h-4" />
                <span>Reset Demo Data</span>
              </button>
            )}
          </div>
        </div>

        {/* Ambient background accent */}
        <div className="absolute -right-16 -bottom-16 w-64 h-64 rounded-full bg-blue-500/10 blur-3xl pointer-events-none" />
      </div>

      {/* FREE GMAIL SENDER DISPATCH STATUS CARD */}
      <div className={`p-4 rounded-3xl border transition-all ${
        isGmailActive 
          ? 'bg-emerald-50/70 border-emerald-200 text-emerald-950' 
          : 'bg-amber-50/70 border-amber-200 text-amber-950'
      }`}>
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 ${
              isGmailActive ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-800'
            }`}>
              <Mail className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h4 className="font-bold text-sm">
                  {isGmailActive ? 'Free Automated Gmail Dispatch Connected' : 'Free Gmail Dispatch Integration'}
                </h4>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase font-mono ${
                  isGmailActive ? 'bg-emerald-200 text-emerald-900' : 'bg-amber-200 text-amber-900'
                }`}>
                  {isGmailActive ? 'Active & Ready' : 'OAuth Not Connected'}
                </span>
              </div>
              <p className="text-xs text-slate-600 mt-0.5 max-w-2xl">
                {isGmailActive ? (
                  <>Temporary passwords are automatically emailed directly to provisioned user inboxes from <strong>{currentGoogle?.email || 'Authorized Google Sender'}</strong>. Plaintext passwords are confidential and never shown on-screen.</>
                ) : (
                  <>Connect your Google/Gmail account (100% Free OAuth, no credit card or paid API required) so the system emails temporary passwords directly to users instead of displaying them to the Principal.</>
                )}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {!isGmailActive ? (
              <button
                type="button"
                onClick={handleConnectGmail}
                disabled={isConnectingGmail}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition shadow-sm flex items-center gap-2 cursor-pointer disabled:opacity-60"
              >
                <Mail className="w-4 h-4" />
                <span>{isConnectingGmail ? 'Connecting Google Account...' : 'Connect Free Gmail Sender'}</span>
              </button>
            ) : (
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white border border-emerald-300 text-emerald-800 text-xs font-semibold shadow-xs">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>Dispatch Ready</span>
              </span>
            )}
          </div>
        </div>

        {gmailStatusNotice && (
          <div className="mt-3 p-2.5 bg-white rounded-xl border border-slate-200 text-xs text-slate-700 flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-blue-500 shrink-0" />
            <span>{gmailStatusNotice}</span>
          </div>
        )}
      </div>

      {/* SECTION 0: ADMINISTRATIVE LEADERSHIP AUTHORITY STATUS GRID */}
      <div className="bg-slate-50 border border-slate-200 rounded-3xl p-6 shadow-xs">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-amber-100 text-amber-900 flex items-center justify-center border border-amber-200">
              <Crown className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-oskar-vintage text-base font-bold text-slate-900">
                Administrative Leadership Account Authority
              </h3>
              <p className="text-xs text-slate-500">
                These accounts should only be created by the Principal; otherwise, login to these portals is blocked.
              </p>
            </div>
          </div>
          <span className="text-[11px] font-semibold px-2.5 py-1 rounded-full bg-slate-200/80 text-slate-700">
            {adminRolesSummary.filter(r => r.isCreated).length} of {adminRolesSummary.length} Roles Provisioned
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {adminRolesSummary.map((item) => {
            const Icon = item.icon;
            return (
              <div
                key={item.role}
                className={`p-4 rounded-2xl border transition-all ${
                  item.isCreated
                    ? 'bg-white border-emerald-200 shadow-xs'
                    : 'bg-amber-50/50 border-amber-200/90 shadow-xs'
                }`}
              >
                <div className="flex items-center justify-between gap-2 mb-2">
                  <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${item.isCreated ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-100 text-amber-800'}`}>
                    <Icon className="w-4 h-4" />
                  </div>
                  {item.isCreated ? (
                    <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700 bg-emerald-100/70 border border-emerald-200 px-2 py-0.5 rounded-full font-mono">
                      <Check className="w-3 h-3" />
                      Authorized
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 text-[10px] font-bold text-rose-700 bg-rose-100/70 border border-rose-200 px-2 py-0.5 rounded-full font-mono">
                      <Lock className="w-3 h-3" />
                      Login Blocked
                    </span>
                  )}
                </div>

                <h4 className="text-xs font-bold text-slate-900 leading-tight">
                  {item.title}
                </h4>
                <p className="text-[11px] text-slate-500 truncate mb-2">
                  {item.department}
                </p>

                {item.isCreated && item.user ? (
                  <div className="pt-2 border-t border-slate-100 text-[11px] space-y-1">
                    <p className="font-semibold text-slate-800 truncate">{item.user.name}</p>
                    <p className="text-slate-500 font-mono text-[10px] truncate">{item.user.email}</p>
                    <div className="flex items-center justify-between pt-1">
                      <span className="text-[10px] text-emerald-600 font-medium">
                        ✓ Can log in
                      </span>
                      <button
                        type="button"
                        onClick={() => setAccountToDelete(item.user!)}
                        className="inline-flex items-center gap-1 text-[10px] text-rose-600 hover:text-rose-800 font-bold hover:underline cursor-pointer"
                        title={`Revoke ${item.title} account`}
                      >
                        <Trash2 className="w-2.5 h-2.5" />
                        <span>Revoke</span>
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="pt-2 border-t border-amber-200/70 text-[11px] space-y-2">
                    <p className="text-amber-900 text-[11px] leading-tight">
                      No account created yet. Staff cannot log in until you provision it.
                    </p>
                    <button
                      type="button"
                      onClick={() => handleQuickProvisionRole(item)}
                      className="w-full inline-flex items-center justify-center gap-1.5 py-1.5 px-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs shadow-xs transition cursor-pointer"
                    >
                      <span>Provision This Role</span>
                      <ArrowRight className="w-3 h-3 text-amber-400" />
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* SECTION 1: PROVISION NEW USER FORM */}
      <div id="provisioning-form-anchor" className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-slate-100 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center border border-blue-100">
              <Plus className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-oskar-vintage text-base font-bold text-slate-900">
                Provision New Institutional Account
              </h3>
              <p className="text-xs text-slate-500">
                Generate official credentials with automatic temporary password and instant Gmail notification
              </p>
            </div>
          </div>

          <span className="text-[11px] font-mono px-2.5 py-1 rounded-md bg-slate-100 text-slate-600 border border-slate-200 font-semibold">
            Authorized by: {currentUser?.name || 'Office of the Principal'}
          </span>
        </div>

        <form onSubmit={handleCreateUser} className="p-6 space-y-6">
          {/* Error Message */}
          {errorMessage && (
            <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2.5">
              <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Role Picker */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-2">
              Select Institutional Role / Portal
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2">
              {roleOptions.map((opt) => {
                const isSelected = selectedRole === opt.role;
                const Icon = opt.icon;
                return (
                  <button
                    key={opt.role}
                    type="button"
                    onClick={() => handleRoleChange(opt.role)}
                    className={`p-3 rounded-xl border text-left transition flex flex-col justify-between cursor-pointer ${
                      isSelected
                        ? 'border-blue-600 bg-blue-50/70 ring-2 ring-blue-500/20 shadow-sm'
                        : 'border-slate-200 bg-white hover:bg-slate-50'
                    }`}
                  >
                    <Icon className={`w-4 h-4 ${isSelected ? 'text-blue-600' : 'text-slate-500'}`} />
                    <div className="mt-2">
                      <p className={`text-xs font-bold leading-tight ${isSelected ? 'text-blue-900' : 'text-slate-800'}`}>
                        {opt.label}
                      </p>
                      <span className="text-[9px] font-mono text-slate-400 block mt-0.5">
                        {opt.role}
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Primary Fields */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Full Legal Name <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <User className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  required
                  placeholder="e.g. Dr. Berhanu Nega"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Official Institutional Email <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
                <input
                  type="email"
                  required
                  placeholder="e.g. b.nega@oskaracademy.edu"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <p className="text-[10px] text-slate-400 mt-1">
                The automatic temporary password will be dispatched to this inbox via Gmail.
              </p>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Official Position Title <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <Briefcase className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  required
                  placeholder="e.g. Senior Registrar Officer"
                  value={position}
                  onChange={(e) => setPosition(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Department / Division
              </label>
              <input
                type="text"
                placeholder="e.g. Admissions & Records Division"
                value={department}
                onChange={(e) => setDepartment(e.target.value)}
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Phone Number (Optional)
              </label>
              <div className="relative">
                <Phone className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  placeholder="+251 91 100 0000"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>

            {/* Dynamic Role Fields */}
            {selectedRole === 'TEACHER' && (
              <>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Primary Academic Subject
                  </label>
                  <input
                    type="text"
                    value={teacherSubject}
                    onChange={(e) => setTeacherSubject(e.target.value)}
                    placeholder="e.g. Physics, Biology, History"
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Homeroom Section (Optional)
                  </label>
                  <select
                    value={teacherHomeroomSection}
                    onChange={(e) => setTeacherHomeroomSection(e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
                  >
                    <option value="">No Homeroom (Subject Teacher Only)</option>
                    {sections.map((sec) => (
                      <option key={sec.id} value={sec.id}>
                        {sec.name} (Grade {sec.grade})
                      </option>
                    ))}
                  </select>
                </div>
              </>
            )}

            {selectedRole === 'STUDENT' && (
              <>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Grade Level
                  </label>
                  <select
                    value={studentGrade}
                    onChange={(e) => setStudentGrade(Number(e.target.value) as AcademicGrade)}
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
                  >
                    <option value={9}>Grade 9 (General)</option>
                    <option value={10}>Grade 10 (General)</option>
                    <option value={11}>Grade 11 (Streamed)</option>
                    <option value={12}>Grade 12 (Streamed)</option>
                  </select>
                </div>

                {studentGrade >= 11 && (
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Academic Stream
                    </label>
                    <select
                      value={studentStream || 'NATURAL'}
                      onChange={(e) => setStudentStream(e.target.value as 'NATURAL' | 'SOCIAL')}
                      className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
                    >
                      <option value="NATURAL">Natural Sciences Stream</option>
                      <option value="SOCIAL">Social Sciences Stream</option>
                    </select>
                  </div>
                )}

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Assigned Class Section
                  </label>
                  <select
                    value={studentSection}
                    onChange={(e) => setStudentSection(e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
                  >
                    <option value="Sec-9A">Section 9-A</option>
                    <option value="Sec-9B">Section 9-B</option>
                    <option value="Sec-10A">Section 10-A</option>
                    <option value="Sec-11Nat-A">Section 11 Natural-A</option>
                    <option value="Sec-12Nat-A">Section 12 Natural-A</option>
                  </select>
                </div>
              </>
            )}
          </div>

          {/* Security Notice Box */}
          <div className="p-4 bg-amber-50/70 rounded-2xl border border-amber-200 text-amber-900 flex items-start gap-3">
            <KeyRound className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
            <div className="text-xs space-y-1">
              <span className="font-bold text-amber-950">
                Automatic Temporary Password & Mandatory Change Enforcement (Must be changed)
              </span>
              <p className="text-amber-800 leading-relaxed">
                When you click provision, the system generates an automatic cryptographic temporary password (e.g. <code className="bg-amber-100 px-1 py-0.5 rounded font-mono font-bold">Osk#XXXX!XXXX</code>), 
                emails it to the user's address via the official Google Workspace Gmail integration, and flags their profile with <span className="font-bold">mustChangePasswordOnFirstLogin: true</span>. 
                When sending the email with this login password, it is explicitly delivered as a temporary credential, and the user is strictly required to request and set a new password at login (Must be changed).
              </p>
            </div>
          </div>

          {/* Submit Button */}
          <div className="flex items-center justify-end gap-3 pt-2 border-t border-slate-100">
            <button
              type="submit"
              disabled={isProvisioning}
              className="px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-md hover:shadow-lg transition flex items-center gap-2 cursor-pointer disabled:opacity-60"
            >
              {isProvisioning ? (
                <>
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ repeat: Infinity, duration: 0.8, ease: 'linear' }}
                    className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full"
                  />
                  <span>Provisioning & Dispatching Email via Gmail...</span>
                </>
              ) : (
                <>
                  <ShieldCheck className="w-4 h-4" />
                  <span>Provision Account & Dispatch Temporary Password</span>
                </>
              )}
            </button>
          </div>
        </form>

        {/* Provision Success Receipt Modal / Card */}
        {provisionSuccessResult && (
          <div className="p-6 bg-emerald-50/90 border-t border-emerald-200 space-y-4">
            <div className="flex items-center gap-2 text-emerald-800">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
              <h4 className="font-bold text-sm">
                Account Successfully Provisioned & Email Dispatched!
              </h4>
            </div>

            <div className="bg-white rounded-xl p-4 border border-emerald-200 shadow-xs grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
              <div>
                <span className="text-slate-400 text-[10px] uppercase font-bold block">User Full Name</span>
                <span className="font-bold text-slate-800">{provisionSuccessResult.user.name}</span>
              </div>
              <div>
                <span className="text-slate-400 text-[10px] uppercase font-bold block">Official Position</span>
                <span className="font-semibold text-slate-700">{provisionSuccessResult.user.position}</span>
              </div>
              <div>
                <span className="text-slate-400 text-[10px] uppercase font-bold block">Email / Username</span>
                <span className="font-mono text-slate-800 font-semibold">{provisionSuccessResult.user.email}</span>
              </div>
              <div>
                <span className="text-slate-400 text-[10px] uppercase font-bold block">Delivery Status</span>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <span className="inline-flex items-center gap-1 font-mono font-bold text-emerald-800 bg-emerald-100/70 px-2 py-0.5 rounded border border-emerald-300 text-[11px]">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                    Emailed to User
                  </span>
                </div>
              </div>
            </div>

            <div className="p-3 bg-white rounded-xl border border-emerald-300/80 flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-start gap-2 max-w-xl">
                <Lock className="w-4 h-4 text-emerald-700 shrink-0 mt-0.5" />
                <div className="text-[11px] text-emerald-950 space-y-0.5">
                  <p className="font-bold">Confidential Temporary Password Delivery (Must Be Changed at Login)</p>
                  <p className="text-emerald-800 leading-normal">
                    The cryptographic temporary login password has been dispatched directly to <strong>{provisionSuccessResult.user.email}</strong>. 
                    Upon login, the system will strictly require the recipient to choose a new confidential personal password (Must be changed). In adherence with security standards, temporary passwords are not revealed to administrators.
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => handleResendTempPassword(provisionSuccessResult.user)}
                  disabled={resendingId === provisionSuccessResult.user.id}
                  className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold transition flex items-center gap-1.5 shadow-xs cursor-pointer disabled:opacity-60"
                >
                  <Mail className="w-3.5 h-3.5" />
                  <span>{resendingId === provisionSuccessResult.user.id ? 'Sending...' : 'Resend Email via Gmail'}</span>
                </button>
                <a
                  href={generateCredentialsMailtoUrl({
                    recipientEmail: provisionSuccessResult.user.email,
                    recipientName: provisionSuccessResult.user.name,
                    roleName: provisionSuccessResult.user.role,
                    positionTitle: provisionSuccessResult.user.position,
                    tempPassword: provisionSuccessResult.tempPassword,
                    schoolName,
                  })}
                  className="px-3 py-1.5 bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 rounded-lg text-xs font-semibold transition flex items-center gap-1.5 shadow-xs"
                  title="Open pre-formatted draft in default mail client"
                >
                  <ExternalLink className="w-3.5 h-3.5 text-slate-500" />
                  <span>Open in Mail Client</span>
                </a>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* SECTION 2: INSTITUTIONAL USERS DIRECTORY */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden space-y-4">
        {/* Header & Category Controls */}
        <div className="p-6 border-b border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700 text-[10px] font-bold uppercase tracking-wider">
                Access & Identity Directory
              </span>
              <span className="px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200 text-[10px] font-bold">
                Categorized Authority
              </span>
            </div>
            <h3 className="font-oskar-vintage text-lg font-bold text-slate-900">
              Institutional User Accounts Directory
            </h3>
            <p className="text-xs text-slate-500">
              Active accounts across all institutional categories ({allDirectoryUsers.length} total enrolled credentials)
            </p>
          </div>

          {/* Search bar */}
          <div className="relative w-full sm:w-80">
            <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search by name, email, department, ID..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-xs border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
        </div>

        {/* Category Navigation Tabs */}
        <div className="px-6 border-b border-slate-100">
          <div className="flex flex-wrap items-center gap-2 pb-4">
            {categoryOptions.map((cat) => {
              const Icon = cat.icon;
              const isActive = activeCategory === cat.id;
              return (
                <button
                  key={cat.id}
                  onClick={() => {
                    setActiveCategory(cat.id);
                    setRoleFilter('ALL');
                  }}
                  className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition cursor-pointer ${
                    isActive
                      ? `${cat.badgeClass} shadow-sm`
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200/80 hover:text-slate-900'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span>{cat.shortLabel}</span>
                  <span
                    className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                      isActive ? 'bg-white/20 text-white' : 'bg-slate-200 text-slate-700'
                    }`}
                  >
                    {cat.count}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Active Category Description & Bulk Actions Bar */}
          {(() => {
            const currentCat = categoryOptions.find((c) => c.id === activeCategory) || categoryOptions[0];
            return (
              <div className="mb-4 p-3.5 rounded-xl bg-slate-50 border border-slate-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                <div className="space-y-0.5">
                  <div className="flex items-center gap-1.5 font-bold text-slate-800">
                    <span>{currentCat.title}</span>
                    <span className="text-slate-400 font-normal">({currentCat.count} Active)</span>
                  </div>
                  <p className="text-[11px] text-slate-500 leading-relaxed">
                    {currentCat.description}
                  </p>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  {activeCategory !== 'ALL' && activeCategory !== 'LEADERSHIP' && currentCat.count > 0 && (
                    <button
                      onClick={() => {
                        setPurgeConfirmInput('');
                        setCategoryToPurge(activeCategory);
                      }}
                      className="px-3 py-1.5 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-bold border border-rose-200 transition cursor-pointer flex items-center gap-1.5"
                      title={`Remove all ${currentCat.shortLabel} accounts`}
                    >
                      <Trash2 className="w-3.5 h-3.5 text-rose-600" />
                      <span>Purge {currentCat.shortLabel}</span>
                    </button>
                  )}

                  {activeCategory === 'LEADERSHIP' && (
                    <button
                      onClick={() => {
                        setPrincipalResetConfirmInput('');
                        setIsDeletePrincipalModalOpen(true);
                      }}
                      className="px-3 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold shadow-xs transition cursor-pointer flex items-center gap-1.5"
                      title="Decommission Principal and reset to an entirely clean, new system"
                    >
                      <AlertOctagon className="w-3.5 h-3.5" />
                      <span>Decommission Principal & Reset System</span>
                    </button>
                  )}
                </div>
              </div>
            );
          })()}
        </div>

        {/* Sub-Role Filter Chips */}
        <div className="px-6 flex flex-wrap items-center gap-1.5 pb-2">
          <button
            onClick={() => setRoleFilter('ALL')}
            className={`px-3 py-1 rounded-xl text-xs font-semibold transition cursor-pointer ${
              roleFilter === 'ALL'
                ? 'bg-slate-800 text-white shadow-xs'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            Show All Roles ({filteredUsers.length})
          </button>
          {roleOptions
            .filter((opt) => {
              if (activeCategory === 'ALL') return true;
              const catMeta = categoryOptions.find((c) => c.id === activeCategory);
              return catMeta?.roles.includes(opt.role);
            })
            .map((opt) => {
              const count = allDirectoryUsers.filter((u) => u.role === opt.role).length;
              const isSelected = roleFilter === opt.role;
              return (
                <button
                  key={opt.role}
                  onClick={() => setRoleFilter(opt.role)}
                  className={`px-2.5 py-1 rounded-xl text-xs font-semibold transition cursor-pointer flex items-center gap-1.5 ${
                    isSelected
                      ? 'bg-blue-600 text-white shadow-xs'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  <span>{opt.label}</span>
                  <span
                    className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                      isSelected ? 'bg-blue-800 text-blue-100' : 'bg-slate-200 text-slate-700'
                    }`}
                  >
                    {count}
                  </span>
                </button>
              );
            })}
        </div>

        {/* Action feedback banners */}
        {deleteSuccessMsg && (
          <div className="mx-6 p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>{deleteSuccessMsg}</span>
            </div>
            <button onClick={() => setDeleteSuccessMsg(null)} className="text-slate-400 hover:text-slate-600">
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        {resendSuccessMsg && (
          <div className="mx-6 p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{resendSuccessMsg}</span>
          </div>
        )}

        {/* Directory Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50/80 border-y border-slate-100 text-slate-400 font-bold uppercase tracking-wider text-[10px]">
                <th className="py-3 px-6">User & Identity</th>
                <th className="py-3 px-4">Position & Role</th>
                <th className="py-3 px-4">Department / Category</th>
                <th className="py-3 px-4">Contact</th>
                <th className="py-3 px-4">Password & Access Status</th>
                <th className="py-3 px-6 text-right">Actions & Security</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-slate-400 text-xs">
                    No institutional accounts match your active category or filter criteria.
                  </td>
                </tr>
              ) : (
                filteredUsers.map((user) => {
                  const roleMeta = roleOptions.find((r) => r.role === user.role) || roleOptions[0];
                  const isPrincipal = user.role === 'PRINCIPAL';

                  return (
                    <tr
                      key={user.id}
                      className={`transition ${
                        isPrincipal ? 'bg-amber-50/40 hover:bg-amber-50/70' : 'hover:bg-slate-50/60'
                      }`}
                    >
                      {/* Name & ID */}
                      <td className="py-3 px-6">
                        <div className="flex items-center gap-2.5">
                          <div
                            className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs shrink-0 ${
                              isPrincipal
                                ? 'bg-amber-200 text-amber-900 border border-amber-300'
                                : 'bg-blue-100 text-blue-800'
                            }`}
                          >
                            {isPrincipal ? <Crown className="w-4 h-4" /> : user.name.charAt(0)}
                          </div>
                          <div>
                            <div className="flex items-center gap-1.5">
                              <span className="font-bold text-slate-900">{user.name}</span>
                              {isPrincipal && (
                                <span className="px-1.5 py-0.2 rounded text-[9px] font-bold bg-amber-200 text-amber-900">
                                  System Head
                                </span>
                              )}
                            </div>
                            <span className="font-mono text-[10px] text-slate-400">{user.id}</span>
                          </div>
                        </div>
                      </td>

                      {/* Position & Role */}
                      <td className="py-3 px-4">
                        <span className="font-semibold text-slate-800 block leading-tight">{user.position}</span>
                        <span className={`inline-block mt-0.5 px-2 py-0.5 rounded-full text-[9px] font-bold border ${roleMeta.badgeColor}`}>
                          {user.role}
                        </span>
                      </td>

                      {/* Department */}
                      <td className="py-3 px-4 text-slate-600">
                        {user.department || 'General Administration'}
                      </td>

                      {/* Contact */}
                      <td className="py-3 px-4">
                        <span className="font-mono text-slate-700 block text-[11px]">{user.email}</span>
                        {user.phone && <span className="text-slate-400 text-[10px]">{user.phone}</span>}
                      </td>

                      {/* Password Status */}
                      <td className="py-3 px-4">
                        {user.mustChangePasswordOnFirstLogin ? (
                          <div className="space-y-1">
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-900 border border-amber-200">
                              <Mail className="w-3 h-3 text-amber-600" />
                              <span>Emailed to User</span>
                            </span>
                            <div className="flex items-center gap-1 text-[10px] text-slate-500 font-medium">
                              <Lock className="w-3 h-3 text-slate-400" />
                              <span>Confidential to {user.email}</span>
                            </div>
                          </div>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                            <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                            <span>Permanent Password Active</span>
                          </span>
                        )}
                      </td>

                      {/* Actions */}
                      <td className="py-3 px-6 text-right">
                        <div className="flex items-center justify-end gap-2">
                          {user.mustChangePasswordOnFirstLogin && user.temporaryPassword && (
                            <div className="flex items-center gap-1">
                              <button
                                onClick={() => handleResendTempPassword(user)}
                                disabled={resendingId === user.id}
                                className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-700 text-xs font-bold transition border border-blue-200 cursor-pointer disabled:opacity-60"
                                title="Resend temporary password email via Gmail"
                              >
                                <RefreshCw className={`w-3 h-3 ${resendingId === user.id ? 'animate-spin' : ''}`} />
                                <span>{resendingId === user.id ? 'Sending...' : 'Resend Email'}</span>
                              </button>
                              <a
                                href={generateCredentialsMailtoUrl({
                                  recipientEmail: user.email,
                                  recipientName: user.name,
                                  roleName: user.role,
                                  positionTitle: user.position,
                                  tempPassword: user.temporaryPassword,
                                  schoolName,
                                })}
                                className="p-1.5 hover:bg-slate-100 text-slate-500 hover:text-slate-800 rounded-lg transition border border-transparent hover:border-slate-200"
                                title="Open pre-filled draft in default mail client"
                              >
                                <ExternalLink className="w-3.5 h-3.5" />
                              </a>
                            </div>
                          )}

                          {isPrincipal ? (
                            <button
                              onClick={() => {
                                setPrincipalResetConfirmInput('');
                                setIsDeletePrincipalModalOpen(true);
                              }}
                              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold shadow-xs transition cursor-pointer"
                              title="Remove Principal and reset to an entirely new system"
                            >
                              <AlertOctagon className="w-3.5 h-3.5" />
                              <span>Remove Principal & Reset System</span>
                            </button>
                          ) : (
                            <button
                              onClick={() => setAccountToDelete(user)}
                              className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-semibold border border-rose-200 transition cursor-pointer"
                              title={`Revoke access and delete ${user.name}`}
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                              <span>Remove</span>
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL 1: Standard Institutional User Removal */}
      <AnimatePresence>
        {accountToDelete && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-3xl p-6 sm:p-7 max-w-md w-full shadow-2xl border border-slate-200 space-y-5"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-rose-100 text-rose-700 flex items-center justify-center shrink-0">
                  <Trash2 className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">
                    Remove User Account
                  </h3>
                  <p className="text-xs text-slate-500">
                    Revoke credentials and institutional access
                  </p>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-xs space-y-2">
                <div className="flex justify-between">
                  <span className="text-slate-500">Name:</span>
                  <span className="font-bold text-slate-900">{accountToDelete.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Role & Position:</span>
                  <span className="font-semibold text-slate-800">{accountToDelete.position} ({accountToDelete.role})</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Official Email:</span>
                  <span className="font-mono text-slate-700">{accountToDelete.email}</span>
                </div>
              </div>

              <div className="p-3.5 rounded-xl bg-amber-50 border border-amber-200 text-[11px] text-amber-900 leading-relaxed">
                <strong>Security Impact:</strong> Once removed, this user will immediately lose access to the portal. 
                {['REGISTRAR', 'FINANCE', 'PROGRAM_OFFICE', 'COUNSELLOR'].includes(accountToDelete.role) && (
                  <span> Because this is a leadership role, login to the {accountToDelete.role} portal will be blocked until the Principal provisions a replacement account.</span>
                )}
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setAccountToDelete(null)}
                  disabled={isDeletingUser}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleConfirmDeleteUser}
                  disabled={isDeletingUser}
                  className="px-4 py-2 rounded-xl text-xs font-bold bg-rose-600 hover:bg-rose-700 text-white shadow-sm transition cursor-pointer disabled:opacity-50 flex items-center gap-1.5"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>{isDeletingUser ? 'Removing...' : 'Confirm Account Removal'}</span>
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* MODAL 2: Principal Decommission & Complete System Reset */}
      <AnimatePresence>
        {isDeletePrincipalModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-3xl p-6 sm:p-8 max-w-lg w-full shadow-2xl border border-rose-200 space-y-5"
            >
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-2xl bg-rose-600 text-white flex items-center justify-center shrink-0 shadow-lg shadow-rose-600/30">
                  <AlertOctagon className="w-6 h-6" />
                </div>
                <div>
                  <div className="inline-block px-2.5 py-0.5 rounded-full bg-rose-100 text-rose-800 text-[10px] font-bold uppercase tracking-wider mb-1">
                    Nuclear Administrative Action
                  </div>
                  <h3 className="text-lg font-bold text-slate-900">
                    Decommission Principal & Reset to New System
                  </h3>
                  <p className="text-xs text-slate-500">
                    Removing the Principal wipes all institutional state and transforms the portal into a clean, brand-new system.
                  </p>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-xs text-rose-950 space-y-2 leading-relaxed">
                <p className="font-bold text-rose-900 flex items-center gap-1.5">
                  <ShieldAlert className="w-4 h-4 text-rose-600" />
                  Complete System Transformation:
                </p>
                <ul className="list-disc list-inside space-y-1 text-[11px] text-rose-900/90 pl-1">
                  <li>The Principal's account and authorization credentials will be completely deleted.</li>
                  <li>All subordinate institutional users, faculty, students, grades, and finance records will be wiped.</li>
                  <li>All active sessions will be terminated and logged out.</li>
                  <li>The system will return to an uninitialized factory state ready for a new Principal master code registration.</li>
                </ul>
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-700">
                  Type <span className="text-rose-600 font-mono font-black">RESET</span> to confirm decommission:
                </label>
                <input
                  type="text"
                  placeholder="Type RESET"
                  value={principalResetConfirmInput}
                  onChange={(e) => setPrincipalResetConfirmInput(e.target.value)}
                  className="w-full px-3.5 py-2 text-xs border border-rose-300 rounded-xl focus:ring-2 focus:ring-rose-500 focus:border-rose-500 font-mono uppercase font-bold"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setIsDeletePrincipalModalOpen(false);
                    setPrincipalResetConfirmInput('');
                  }}
                  disabled={isDeletingPrincipal}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleConfirmDeletePrincipal}
                  disabled={principalResetConfirmInput.trim().toUpperCase() !== 'RESET' || isDeletingPrincipal}
                  className="px-5 py-2 rounded-xl text-xs font-bold bg-rose-600 hover:bg-rose-700 disabled:bg-slate-200 disabled:text-slate-400 text-white shadow-lg shadow-rose-600/20 transition cursor-pointer flex items-center gap-1.5"
                >
                  <AlertOctagon className="w-4 h-4" />
                  <span>{isDeletingPrincipal ? 'Resetting System...' : 'Decommission Principal & Reset System'}</span>
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* MODAL 3: Bulk Purge Category Modal */}
      <AnimatePresence>
        {categoryToPurge && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-3xl p-6 sm:p-7 max-w-md w-full shadow-2xl border border-slate-200 space-y-5"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-rose-100 text-rose-700 flex items-center justify-center shrink-0">
                  <Trash2 className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">
                    Purge Category Accounts
                  </h3>
                  <p className="text-xs text-slate-500">
                    Bulk removal of all accounts in category: <strong>{categoryToPurge}</strong>
                  </p>
                </div>
              </div>

              <p className="text-xs text-slate-600 leading-relaxed">
                This will revoke and delete all active accounts in the <strong>{categoryToPurge}</strong> category. 
                Users in this category will immediately be blocked from logging in.
              </p>

              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-700">
                  Type <span className="text-rose-600 font-mono font-black">DELETE</span> to confirm bulk purge:
                </label>
                <input
                  type="text"
                  placeholder="Type DELETE"
                  value={purgeConfirmInput}
                  onChange={(e) => setPurgeConfirmInput(e.target.value)}
                  className="w-full px-3.5 py-2 text-xs border border-rose-300 rounded-xl focus:ring-2 focus:ring-rose-500 focus:border-rose-500 font-mono uppercase font-bold"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setCategoryToPurge(null);
                    setPurgeConfirmInput('');
                  }}
                  disabled={isPurgingCategory}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleConfirmPurgeCategory}
                  disabled={purgeConfirmInput.trim().toUpperCase() !== 'DELETE' || isPurgingCategory}
                  className="px-4 py-2 rounded-xl text-xs font-bold bg-rose-600 hover:bg-rose-700 disabled:bg-slate-200 disabled:text-slate-400 text-white shadow-sm transition cursor-pointer flex items-center gap-1.5"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>{isPurgingCategory ? 'Purging Category...' : 'Purge All Accounts'}</span>
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Change Principal Master Authorization Code Modal */}
      <ChangeMasterCodeModal
        isOpen={isChangeMasterCodeModalOpen}
        onClose={() => setIsChangeMasterCodeModalOpen(false)}
      />
    </div>
  );
};
