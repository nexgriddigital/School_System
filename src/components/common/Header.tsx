import React, { useState } from 'react';
import { useSchool } from '../../context/SchoolContext';
import { UserRole } from '../../types';
import { 
  Building2, 
  CreditCard, 
  Layers, 
  HeartHandshake, 
  GraduationCap, 
  Users, 
  User, 
  Home, 
  Bell, 
  KeyRound,
  ChevronDown,
  CheckCircle2,
  Edit3,
  Check,
  Sparkles,
  LogOut,
  Search,
  BookOpen,
  Shield,
  Download
} from 'lucide-react';
import { SchoolMascotLogo } from './SchoolMascotLogo';

interface HeaderProps {
  onOpenTerms?: () => void;
  onOpenManual?: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onOpenTerms, onOpenManual }) => {
  const { 
    schoolName,
    setSchoolName,
    currentRole, 
    setCurrentRole, 
    activeStudentId, 
    setActiveStudentId, 
    students,
    activeTeacherId, 
    setActiveTeacherId, 
    teachers,
    notices,
    currentUser,
    isAuthenticated,
    logout,
    resetUserPassword
  } = useSchool();

  const [showNoticeDropdown, setShowNoticeDropdown] = useState(false);
  const [showResetModal, setShowResetModal] = useState(false);
  const [resetFeedback, setResetFeedback] = useState<string | null>(null);
  const [resetSearchTerm, setResetSearchTerm] = useState('');

  // Password reset authority is strictly permitted ONLY via Finance, Registrar, or Principal
  const isResetAuthorized = currentRole === 'FINANCE' || currentRole === 'REGISTRAR' || currentRole === 'PRINCIPAL';

  const handleQuickReset = (sId: string) => {
    if (!isResetAuthorized) return;
    try {
      const tempPass = resetUserPassword(sId, currentRole as 'FINANCE' | 'REGISTRAR' | 'PRINCIPAL');
      const studentObj = students.find(s => s.id === sId);
      setResetFeedback(`Temporary login password generated for ${studentObj?.fullName || sId} (${sId}): ${tempPass} [Authorized by ${currentRole}]`);
      setTimeout(() => setResetFeedback(null), 10000);
    } catch (err: any) {
      alert(err.message || 'Password reset unauthorized');
    }
  };

  // School Name Quick Editor
  const [isEditingSchoolName, setIsEditingSchoolName] = useState(false);
  const [tempSchoolName, setTempSchoolName] = useState(schoolName);

  const handleSaveSchoolName = () => {
    if (tempSchoolName.trim()) {
      setSchoolName(tempSchoolName.trim());
    }
    setIsEditingSchoolName(false);
  };

  const roleConfigs: { role: UserRole; label: string; icon: React.FC<{ className?: string }> }[] = [
    { role: 'REGISTRAR', label: 'Admissions & Registrar', icon: Building2 },
    { role: 'FINANCE', label: 'Finance Office', icon: CreditCard },
    { role: 'PROGRAM_OFFICE', label: 'Program Office', icon: Layers },
    { role: 'COUNSELLOR', label: 'Counsellor', icon: HeartHandshake },
    { role: 'PRINCIPAL', label: 'Principal', icon: GraduationCap },
    { role: 'TEACHER', label: 'Teachers Portal', icon: Users },
    { role: 'STUDENT', label: 'Student Portal', icon: User },
    { role: 'PARENT', label: 'Parent Portal', icon: Home },
  ];

  const filteredStudentsForReset = students.filter(s => 
    s.fullName.toLowerCase().includes(resetSearchTerm.toLowerCase()) ||
    s.id.toLowerCase().includes(resetSearchTerm.toLowerCase()) ||
    s.accountNumber.toLowerCase().includes(resetSearchTerm.toLowerCase())
  );

  return (
    <header className="sticky top-0 z-40 bg-[#0B192C] text-white shadow-lg border-b border-slate-800">
      {/* Top institution bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 border-b border-slate-800/80">
          {/* Logo with official mascot guy & vintage specimen font branding */}
          <div className="flex items-center gap-3">
            <SchoolMascotLogo size="lg" withBackground showGlow interactive />
            <div>
              <div className="flex items-center gap-2">
                {isEditingSchoolName ? (
                  <div className="flex items-center gap-1.5 bg-slate-900 border border-blue-500/80 rounded-lg px-2 py-0.5">
                    <input
                      type="text"
                      value={tempSchoolName}
                      onChange={(e) => setTempSchoolName(e.target.value)}
                      placeholder="Enter School Name"
                      className="bg-transparent text-white font-bold text-sm tracking-wide outline-none w-48 font-oskar-vintage"
                      autoFocus
                    />
                    <button
                      onClick={handleSaveSchoolName}
                      className="p-1 bg-blue-600 hover:bg-blue-500 text-white rounded transition"
                      title="Save School Name"
                    >
                      <Check className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <span className="font-oskar-vintage text-2xl font-bold tracking-widest text-white">
                      {schoolName}
                    </span>
                    <button
                      onClick={() => {
                        setTempSchoolName(schoolName);
                        setIsEditingSchoolName(true);
                      }}
                      className="text-slate-400 hover:text-blue-300 p-1 rounded hover:bg-slate-800 transition"
                      title="Change School Name"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                    </button>
                    <span className="font-oskar text-xs font-semibold tracking-wider text-blue-400 uppercase bg-blue-950/60 px-2 py-0.5 rounded border border-blue-800/50">
                      SIS
                    </span>
                  </div>
                )}
              </div>
              <p className="text-[10px] tracking-wider text-slate-400 uppercase">
                Integrated School Administration & Learning System
              </p>
            </div>
          </div>

          {/* Right side persona selector & actions - CLEARED UNTIL LOGIN */}
          {isAuthenticated ? (
            <div className="flex items-center gap-3">
              
              {/* Quick Context Switcher: Student or Teacher selection based on role */}
              {(currentRole === 'STUDENT' || currentRole === 'PARENT') && (
                <div className="hidden sm:flex items-center gap-2 bg-slate-800/70 px-3 py-1.5 rounded-lg border border-slate-700 text-xs">
                  <span className="text-slate-400">Viewing as:</span>
                  <select
                    value={activeStudentId}
                    onChange={(e) => setActiveStudentId(e.target.value)}
                    className="bg-slate-900 text-white font-medium border border-slate-600 rounded px-2 py-1 outline-none text-xs"
                  >
                    {students.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.fullName} (Grade {s.grade}{s.stream ? ` - ${s.stream === 'Natural Sciences' ? 'NAT' : 'SOC'}` : ''})
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {currentRole === 'TEACHER' && (
                <div className="hidden sm:flex items-center gap-2 bg-slate-800/70 px-3 py-1.5 rounded-lg border border-slate-700 text-xs">
                  <span className="text-slate-400">Active Teacher:</span>
                  <select
                    value={activeTeacherId}
                    onChange={(e) => setActiveTeacherId(e.target.value)}
                    className="bg-slate-900 text-white font-medium border border-slate-600 rounded px-2 py-1 outline-none text-xs"
                  >
                    {teachers.map((t) => (
                      <option key={t.id} value={t.id}>
                        {t.name} {t.isHomeroom ? `(Homeroom: ${t.assignedSectionId})` : '(Subject Teacher)'}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {/* Password Reset Utility - Strictly ONLY allowed via Finance, Registrar, or Principal */}
              {isResetAuthorized && (
                <div className="relative">
                  <button
                    onClick={() => setShowResetModal(!showResetModal)}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs font-medium border border-slate-700 transition cursor-pointer"
                    title={`Reset Student Credentials (Authorized for ${currentRole})`}
                  >
                    <KeyRound className="w-3.5 h-3.5 text-blue-400" />
                    <span className="hidden md:inline">Reset Login</span>
                    <ChevronDown className="w-3 h-3 text-slate-400" />
                  </button>

                  {showResetModal && (
                    <div className="absolute right-0 mt-2 w-80 bg-white text-slate-900 rounded-xl shadow-2xl border border-slate-200 p-4 z-50 text-xs animate-in fade-in zoom-in-95">
                      <div className="flex items-center justify-between border-b border-slate-100 pb-2 mb-2">
                        <div>
                          <p className="font-bold text-slate-800">Issue Temporary Login</p>
                          <p className="text-[10px] text-blue-600 font-semibold uppercase">Authorized: {currentRole}</p>
                        </div>
                        <button 
                          onClick={() => setShowResetModal(false)}
                          className="text-slate-400 hover:text-slate-600 font-bold p-1"
                        >
                          ✕
                        </button>
                      </div>

                      <p className="text-[11px] text-slate-500 mb-2">
                        Finance, Registrar, and Principal have sole authority to issue one-time passwords upon student/parent verification.
                      </p>

                      <div className="relative mb-2">
                        <input
                          type="text"
                          value={resetSearchTerm}
                          onChange={(e) => setResetSearchTerm(e.target.value)}
                          placeholder="Search scholar name or ID..."
                          className="w-full pl-7 pr-2 py-1 bg-slate-50 border border-slate-200 rounded text-xs focus:outline-none focus:ring-1 focus:ring-blue-500"
                        />
                        <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2 top-1.5" />
                      </div>

                      <div className="space-y-1.5 max-h-52 overflow-y-auto pr-1">
                        {filteredStudentsForReset.map((s) => (
                          <div key={s.id} className="flex items-center justify-between p-2 bg-slate-50 hover:bg-slate-100 rounded-lg border border-slate-200">
                            <div>
                              <p className="font-semibold text-slate-800">{s.fullName}</p>
                              <p className="text-[10px] font-mono text-slate-500">{s.id} • Gr. {s.grade}</p>
                            </div>
                            <button
                              onClick={() => {
                                handleQuickReset(s.id);
                                setShowResetModal(false);
                              }}
                              className="px-2.5 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded-md text-[11px] font-semibold cursor-pointer shadow-xs"
                            >
                              Reset
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Notifications Dropdown */}
              <div className="relative">
                <button
                  onClick={() => setShowNoticeDropdown(!showNoticeDropdown)}
                  className="relative p-2 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-slate-300 transition cursor-pointer"
                  title="School Notices"
                >
                  <Bell className="w-4 h-4" />
                  {notices.length > 0 && (
                    <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-red-500 ring-2 ring-[#0B192C]" />
                  )}
                </button>

                {showNoticeDropdown && (
                  <div className="absolute right-0 mt-2 w-80 bg-white text-slate-800 rounded-xl shadow-2xl border border-slate-200 p-4 z-50 animate-in fade-in zoom-in-95">
                    <div className="flex items-center justify-between border-b border-slate-100 pb-2 mb-3">
                      <h4 className="font-bold text-xs uppercase tracking-wider text-slate-500">School Notices</h4>
                      <span className="text-[10px] bg-blue-100 text-blue-800 px-1.5 py-0.5 rounded font-semibold">
                        {notices.length} Updates
                      </span>
                    </div>
                    <div className="space-y-2.5 max-h-64 overflow-y-auto pr-1">
                      {notices.map((n) => (
                        <div key={n.id} className="p-2 bg-slate-50 rounded-lg border border-slate-100 text-xs">
                          <div className="flex items-center justify-between">
                            <span className="font-bold text-slate-800">{n.title}</span>
                            <span className="text-[10px] text-slate-400">{n.date}</span>
                          </div>
                          <p className="text-slate-600 mt-1 text-[11px] leading-relaxed">{n.content}</p>
                          <div className="mt-1.5 flex items-center justify-between text-[10px] text-slate-400">
                            <span>By: {n.postedBy}</span>
                            <span className="px-1.5 py-0.5 bg-slate-200/80 text-slate-700 rounded font-medium">
                              {n.category}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Active Persona display, Templates button & Sign Out */}
              <div className="flex items-center gap-2.5 pl-2 border-l border-slate-800">
                <div className="hidden md:flex flex-col text-right">
                  <span className="text-xs font-bold text-white leading-tight">
                    {currentUser?.name || 'Authorized Staff'}
                  </span>
                  <span className="text-[10px] text-blue-300">
                    {currentUser?.title || roleConfigs.find(r => r.role === currentRole)?.label}
                  </span>
                </div>

                <div className="w-8 h-8 rounded-full bg-blue-600 text-white font-bold flex items-center justify-center text-xs border border-blue-400/50 shrink-0">
                  {currentUser?.name?.charAt(0) || 'A'}
                </div>

                {onOpenManual && (
                  <button
                    onClick={onOpenManual}
                    className="hidden md:flex items-center gap-1.5 px-2.5 py-1.5 bg-slate-800/90 hover:bg-slate-700 text-amber-300 border border-slate-700 rounded-lg text-xs font-medium transition cursor-pointer"
                    title="Open Instructions Manual (PDF with NexGrid Digital Letterhead)"
                  >
                    <BookOpen className="w-3.5 h-3.5" />
                    <span>System Manual</span>
                  </button>
                )}

                <button
                  onClick={logout}
                  className="flex items-center gap-1.5 px-2.5 py-1.5 bg-rose-950/60 hover:bg-rose-900 text-rose-200 border border-rose-800/70 rounded-lg text-xs font-medium transition cursor-pointer"
                  title="Sign out of system"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span className="hidden lg:inline">Sign Out</span>
                </button>
              </div>

            </div>
          ) : (
            /* Top Nav Bar presentation badges */
            <div className="flex items-center gap-2">
              {onOpenManual && (
                <button
                  onClick={onOpenManual}
                  className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-amber-300 border border-slate-700 text-xs font-semibold transition cursor-pointer"
                  title="Instructions Manual (PDF with NexGrid Digital Letterhead)"
                >
                  <BookOpen className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Instructions Manual</span>
                </button>
              )}
              {onOpenTerms && (
                <button
                  onClick={onOpenTerms}
                  className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 text-xs font-semibold transition cursor-pointer"
                  title="Terms & Conditions"
                >
                  <Shield className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Terms</span>
                </button>
              )}
              <span className="text-[10px] text-blue-300/80 bg-blue-950/70 px-2 py-0.5 rounded border border-blue-900 font-mono hidden md:inline">
                NexGrid Digital Systems
              </span>
            </div>
          )}
        </div>

        {/* Feedback alert for password reset */}
        {resetFeedback && (
          <div className="bg-emerald-950/90 border border-emerald-500/50 text-emerald-200 px-4 py-2 my-2 rounded-lg text-xs flex items-center justify-between animate-in fade-in">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span className="font-mono">{resetFeedback}</span>
            </div>
            <button onClick={() => setResetFeedback(null)} className="text-emerald-400 hover:text-white font-bold ml-4">✕</button>
          </div>
        )}

        {/* Sub-navigation role tabs bar: ONLY rendered after login */}
        {isAuthenticated && (
          <div className="border-t border-slate-800/80 pt-2 pb-2">
            <div className="flex items-center justify-between pb-1.5 px-1">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
                <Sparkles className="w-3 h-3 text-blue-400" />
                <span>Stakeholder Portals & Workspaces:</span>
              </span>
            </div>
            <nav className="flex space-x-1 overflow-x-auto no-scrollbar">
              {roleConfigs.map(({ role, label, icon: Icon }) => {
                const isActive = currentRole === role;
                return (
                  <button
                    key={role}
                    onClick={() => setCurrentRole(role)}
                    className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                      isActive
                        ? 'bg-blue-600 text-white shadow-md shadow-blue-900/40 border border-blue-400/50'
                        : 'text-slate-300 hover:text-white hover:bg-slate-800/80'
                    }`}
                  >
                    <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                    <span>{label}</span>
                  </button>
                );
              })}
            </nav>
          </div>
        )}
      </div>
    </header>
  );
};
