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
  RotateCcw
} from 'lucide-react';
import { downloadInstructionsManualPdf } from '../../services/manualPdfService';
import { sendTemporaryPasswordEmailViaGmail } from '../../services/gmailAuthService';

interface UserProvisioningTabProps {
  onOpenResetModal?: () => void;
}

export const UserProvisioningTab: React.FC<UserProvisioningTabProps> = ({ onOpenResetModal }) => {
  const { 
    schoolName, 
    currentUser, 
    institutionalUsers, 
    createInstitutionalUser, 
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

  // Directory Search & Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState<'ALL' | UserRole>('ALL');

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
      await sendTemporaryPasswordEmailViaGmail({
        recipientEmail: user.email,
        recipientName: user.name,
        roleName: user.role,
        positionTitle: user.position,
        tempPassword: user.temporaryPassword,
        schoolName,
        senderName: currentUser?.name || 'Office of the Principal',
      });
      setResendSuccessMsg(`Temporary password email successfully redispatched to ${user.email}`);
      setTimeout(() => setResendSuccessMsg(null), 4000);
    } catch (e: any) {
      console.error(e);
      alert('Could not dispatch email. Please verify Gmail sender authorization.');
    } finally {
      setResendingId(null);
    }
  };

  // Filtered Directory
  const filteredUsers = useMemo(() => {
    return institutionalUsers.filter((u) => {
      const matchRole = roleFilter === 'ALL' || u.role === roleFilter;
      const q = searchQuery.toLowerCase().trim();
      const matchQuery =
        !q ||
        u.name.toLowerCase().includes(q) ||
        u.email.toLowerCase().includes(q) ||
        u.position.toLowerCase().includes(q) ||
        u.id.toLowerCase().includes(q);
      return matchRole && matchQuery;
    });
  }, [institutionalUsers, roleFilter, searchQuery]);

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
              <span className="px-2.5 py-0.5 rounded-full bg-amber-400/20 text-amber-200 border border-amber-400/30 text-[10px] font-bold font-mono">
                System_Principal Protocol
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
              onClick={() => downloadInstructionsManualPdf(schoolName)}
              className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs shadow-lg transition cursor-pointer"
              title="Download official comprehensive PDF manual with NexGrid Digital Systems letterhead on every page"
            >
              <Download className="w-4 h-4" />
              <span>Download Official Manual (PDF)</span>
            </button>

            {onOpenResetModal && (
              <button
                onClick={onOpenResetModal}
                className="flex items-center justify-center gap-2 px-3.5 py-2.5 rounded-xl bg-rose-700/80 hover:bg-rose-600 text-white font-bold text-xs shadow-md border border-rose-400/40 transition cursor-pointer"
                title="Principal Executive Touch: Reset entire institution to factory demonstration state"
              >
                <RotateCcw className="w-4 h-4" />
                <span>Reset Everything</span>
              </button>
            )}
          </div>
        </div>

        {/* Ambient background accent */}
        <div className="absolute -right-16 -bottom-16 w-64 h-64 rounded-full bg-blue-500/10 blur-3xl pointer-events-none" />
      </div>

      {/* SECTION 1: PROVISION NEW USER FORM */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
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
            Authorized by: {currentUser?.name || 'Prof. Mengistu Haile (Principal)'}
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
                Automatic Temporary Password & Mandatory Change Enforcement
              </span>
              <p className="text-amber-800 leading-relaxed">
                When you click provision, the system generates an automatic cryptographic temporary password (e.g. <code className="bg-amber-100 px-1 py-0.5 rounded font-mono font-bold">Osk#XXXX!XXXX</code>), 
                emails it to the user's address via the official Google Workspace Gmail integration, and flags their profile with <span className="font-bold">mustChangePasswordOnFirstLogin: true</span>. 
                They will be required to choose their permanent personal password upon their first login.
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
                <span className="text-slate-400 text-[10px] uppercase font-bold block">Temporary Password</span>
                <div className="flex items-center gap-2 mt-0.5">
                  <span className="font-mono font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                    {provisionSuccessResult.tempPassword}
                  </span>
                  <button
                    onClick={() => handleCopyCredentials(provisionSuccessResult.tempPassword, 'provision-pass')}
                    className="p-1 hover:bg-slate-100 rounded text-slate-500"
                    title="Copy Temporary Password"
                  >
                    {copiedId === 'provision-pass' ? (
                      <Check className="w-3.5 h-3.5 text-emerald-600" />
                    ) : (
                      <Copy className="w-3.5 h-3.5" />
                    )}
                  </button>
                </div>
              </div>
            </div>

            <p className="text-[11px] text-emerald-700">
              ✓ An automated notification containing these temporary credentials was emailed to <strong>{provisionSuccessResult.user.email}</strong>. 
              The user must set their permanent password upon initial login before entering their workspace.
            </p>
          </div>
        )}
      </div>

      {/* SECTION 2: INSTITUTIONAL USERS DIRECTORY */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden space-y-4">
        <div className="p-6 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h3 className="font-oskar-vintage text-base font-bold text-slate-900">
              Institutional User Accounts Directory
            </h3>
            <p className="text-xs text-slate-500">
              Active staff, faculty, scholars, and administrative credentials under Principal oversight ({institutionalUsers.length} Total)
            </p>
          </div>

          {/* Search bar */}
          <div className="relative w-full sm:w-72">
            <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search by name, email, ID..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-xs border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
        </div>

        {/* Filter Chips */}
        <div className="px-6 flex flex-wrap items-center gap-1.5 pb-2">
          <button
            onClick={() => setRoleFilter('ALL')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition cursor-pointer ${
              roleFilter === 'ALL'
                ? 'bg-slate-900 text-white shadow-xs'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            All Accounts ({institutionalUsers.length})
          </button>
          {roleOptions.map((opt) => {
            const count = institutionalUsers.filter((u) => u.role === opt.role).length;
            const isSelected = roleFilter === opt.role;
            return (
              <button
                key={opt.role}
                onClick={() => setRoleFilter(opt.role)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition cursor-pointer flex items-center gap-1.5 ${
                  isSelected
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                <span>{opt.label}</span>
                <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${isSelected ? 'bg-blue-800 text-blue-100' : 'bg-slate-200 text-slate-700'}`}>
                  {count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Re-send notice */}
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
                <th className="py-3 px-4">Department</th>
                <th className="py-3 px-4">Contact</th>
                <th className="py-3 px-4">Password Status</th>
                <th className="py-3 px-6 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-slate-400 text-xs">
                    No institutional accounts match your criteria.
                  </td>
                </tr>
              ) : (
                filteredUsers.map((user) => {
                  const roleMeta = roleOptions.find((r) => r.role === user.role) || roleOptions[0];
                  return (
                    <tr key={user.id} className="hover:bg-slate-50/60 transition">
                      {/* Name & ID */}
                      <td className="py-3 px-6">
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-800 flex items-center justify-center font-bold text-xs shrink-0">
                            {user.name.charAt(0)}
                          </div>
                          <div>
                            <span className="font-bold text-slate-900 block">{user.name}</span>
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
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-200">
                              <AlertTriangle className="w-3 h-3 text-amber-600" />
                              <span>Temp Password (Must Change on 1st Login)</span>
                            </span>
                            {user.temporaryPassword && (
                              <div className="flex items-center gap-1">
                                <span className="font-mono text-[10px] text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded">
                                  {user.temporaryPassword}
                                </span>
                                <button
                                  onClick={() => handleCopyCredentials(user.temporaryPassword!, user.id)}
                                  className="text-slate-400 hover:text-slate-600 p-0.5"
                                  title="Copy temporary password"
                                >
                                  {copiedId === user.id ? (
                                    <Check className="w-3 h-3 text-emerald-600" />
                                  ) : (
                                    <Copy className="w-3 h-3" />
                                  )}
                                </button>
                              </div>
                            )}
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
                        {user.mustChangePasswordOnFirstLogin && user.temporaryPassword && (
                          <button
                            onClick={() => handleResendTempPassword(user)}
                            disabled={resendingId === user.id}
                            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-700 text-[11px] font-bold transition border border-blue-200 cursor-pointer disabled:opacity-60"
                            title="Resend temporary password email via Gmail"
                          >
                            <RefreshCw className={`w-3 h-3 ${resendingId === user.id ? 'animate-spin' : ''}`} />
                            <span>{resendingId === user.id ? 'Sending...' : 'Resend Email'}</span>
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
