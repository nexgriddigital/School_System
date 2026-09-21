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
  Sparkles,
  LogOut,
  Search,
  BookOpen,
  Shield,
  Download,
  Sun,
  Moon
} from 'lucide-react';
import { SchoolMascotLogo } from './SchoolMascotLogo';
import { SessionSecurityIndicator } from './SessionSecurityIndicator';
import { GmailNotificationIndicator } from './GmailNotificationIndicator';
import { GlobalSearchBar } from './GlobalSearchBar';

interface HeaderProps {
  onOpenTerms?: () => void;
  onOpenManual?: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onOpenTerms, onOpenManual }) => {
  const { 
    schoolName,
    theme,
    toggleTheme,
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
      <div className="w-full max-w-[1720px] mx-auto px-3 sm:px-5 lg:px-6">
        <div className="flex items-center justify-between min-h-[4rem] py-2 border-b border-slate-800/80 gap-2 sm:gap-4">
          {/* Logo with official mascot & vintage specimen font branding */}
          <div className="flex items-center gap-2.5 sm:gap-3 shrink-0 min-w-0">
            <SchoolMascotLogo size="md" withBackground showGlow interactive />
            <div className="min-w-0">
              <div className="flex items-center gap-1.5 sm:gap-2">
                <span 
                  className="font-oskar-vintage text-base sm:text-lg md:text-xl font-bold tracking-wide text-white truncate max-w-[160px] sm:max-w-[220px] md:max-w-[260px] lg:max-w-xs select-none" 
                  title={schoolName}
                >
                  {schoolName}
                </span>
                <span className="font-oskar text-[10px] font-semibold tracking-wider text-blue-400 uppercase bg-blue-950/70 px-1.5 py-0.5 rounded border border-blue-800/60 shrink-0 select-none">
                  SIS
                </span>
              </div>
              <p className="text-[10px] tracking-wider text-slate-400 uppercase truncate select-none hidden xl:block">
                Integrated School Administration & Learning System
              </p>
            </div>
          </div>

          {/* Desktop & Tablet Global Search Bar */}
          {isAuthenticated && (
            <div className="flex-1 max-w-xs md:max-w-sm lg:max-w-md mx-2 hidden md:block">
              <GlobalSearchBar />
            </div>
          )}

          {/* Right side persona selector & actions - CLEARED UNTIL LOGIN */}
          {isAuthenticated ? (
            <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
              {/* Mobile Search Trigger Button */}
              <div className="md:hidden">
                <GlobalSearchBar isMobileTrigger />
              </div>
              
              {/* Quick Context Switcher: Student or Teacher selection based on role */}
              {(currentRole === 'STUDENT' || currentRole === 'PARENT') && (
                <div className="hidden sm:flex items-center gap-1.5 bg-slate-800/70 px-2 py-1 rounded-lg border border-slate-700 text-xs">
                  <span className="text-slate-400 text-[11px]">Viewing:</span>
                  <select
                    value={activeStudentId}
                    onChange={(e) => setActiveStudentId(e.target.value)}
                    className="bg-slate-900 text-white font-medium border border-slate-600 rounded px-1.5 py-0.5 outline-none text-xs max-w-[130px] truncate"
                  >
                    {students.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.fullName} (Gr. {s.grade})
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {currentRole === 'TEACHER' && (
                <div className="hidden sm:flex items-center gap-1.5 bg-slate-800/70 px-2 py-1 rounded-lg border border-slate-700 text-xs">
                  <span className="text-slate-400 text-[11px]">Teacher:</span>
                  <select
                    value={activeTeacherId}
                    onChange={(e) => setActiveTeacherId(e.target.value)}
                    className="bg-slate-900 text-white font-medium border border-slate-600 rounded px-1.5 py-0.5 outline-none text-xs max-w-[130px] truncate"
                  >
                    {teachers.map((t) => (
                      <option key={t.id} value={t.id}>
                        {t.name}
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
                    className="flex items-center gap-1.5 px-2.5 py-1.5 bg-slate-800/90 hover:bg-slate-700 text-slate-200 rounded-lg text-xs font-medium border border-slate-700 transition cursor-pointer"
                    title={`Reset Student Credentials (Authorized for ${currentRole})`}
                  >
                    <KeyRound className="w-3.5 h-3.5 text-blue-400" />
                    <span className="hidden xl:inline">Reset Login</span>
                    <ChevronDown className="w-3 h-3 text-slate-400" />
                  </button>

                  {showResetModal && (
                    <div className="absolute right-0 mt-2 w-80 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 rounded-xl shadow-2xl border border-slate-200 dark:border-slate-800 p-4 z-50 text-xs animate-in fade-in zoom-in-95">
                      <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-2 mb-2">
                        <div>
                          <p className="font-bold text-slate-800 dark:text-white">Issue Temporary Login</p>
                          <p className="text-[10px] text-blue-600 dark:text-blue-400 font-semibold uppercase">Authorized: {currentRole}</p>
                        </div>
                        <button 
                          onClick={() => setShowResetModal(false)}
                          className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 font-bold p-1 cursor-pointer"
                        >
                          ✕
                        </button>
                      </div>

                      <p className="text-[11px] text-slate-500 dark:text-slate-400 mb-2">
                        Finance, Registrar, and Principal have sole authority to issue one-time passwords upon student/parent verification.
                      </p>

                      <div className="relative mb-2">
                        <input
                          type="text"
                          value={resetSearchTerm}
                          onChange={(e) => setResetSearchTerm(e.target.value)}
                          placeholder="Search scholar name or ID..."
                          className="w-full pl-7 pr-2 py-1 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white border border-slate-200 dark:border-slate-700 rounded text-xs focus:outline-none focus:ring-1 focus:ring-blue-500"
                        />
                        <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2 top-1.5" />
                      </div>

                      <div className="space-y-1.5 max-h-52 overflow-y-auto pr-1">
                        {filteredStudentsForReset.map((s) => (
                          <div key={s.id} className="flex items-center justify-between p-2 bg-slate-50 dark:bg-slate-800/80 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700">
                            <div>
                              <p className="font-semibold text-slate-800 dark:text-white">{s.fullName}</p>
                              <p className="text-[10px] font-mono text-slate-500 dark:text-slate-400">{s.id} • Gr. {s.grade}</p>
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

              {/* Status / Infrastructure Indicators */}
              <div className="flex items-center gap-1.5">
                {/* Gmail Automated Parent Notification Service Status */}
                <GmailNotificationIndicator />

                {/* Institutional Session Security Inactivity Indicator */}
                <SessionSecurityIndicator />
              </div>

              {/* Global Light / Dark Mode Toggle */}
              <button
                id="global-theme-toggle-btn"
                onClick={toggleTheme}
                className="flex items-center justify-center w-8 h-8 rounded-lg bg-slate-800/90 hover:bg-slate-700 text-slate-200 hover:text-white border border-slate-700 transition cursor-pointer active:scale-95 shrink-0"
                title={`Switch to ${theme === 'dark' ? 'Light' : 'Dark'} Mode`}
                aria-label={`Switch to ${theme === 'dark' ? 'Light' : 'Dark'} Mode`}
              >
                {theme === 'dark' ? (
                  <Sun className="w-4 h-4 text-amber-400" />
                ) : (
                  <Moon className="w-4 h-4 text-sky-300" />
                )}
              </button>

              {/* Notifications Dropdown */}
              <div className="relative">
                <button
                  onClick={() => setShowNoticeDropdown(!showNoticeDropdown)}
                  className="relative flex items-center justify-center w-8 h-8 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-slate-300 transition cursor-pointer shrink-0"
                  title="School Notices"
                >
                  <Bell className="w-4 h-4" />
                  {notices.length > 0 && (
                    <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-red-500 ring-2 ring-[#0B192C]" />
                  )}
                </button>

                {showNoticeDropdown && (
                  <div className="absolute right-0 mt-2 w-80 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 rounded-xl shadow-2xl border border-slate-200 dark:border-slate-800 p-4 z-50 animate-in fade-in zoom-in-95">
                    <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-2 mb-3">
                      <h4 className="font-bold text-xs uppercase tracking-wider text-slate-500 dark:text-slate-400">School Notices</h4>
                      <span className="text-[10px] bg-blue-100 dark:bg-blue-950/80 text-blue-800 dark:text-blue-300 border border-blue-200 dark:border-blue-900 px-1.5 py-0.5 rounded font-semibold">
                        {notices.length} Updates
                      </span>
                    </div>
                    <div className="space-y-2.5 max-h-64 overflow-y-auto pr-1">
                      {notices.map((n) => (
                        <div key={n.id} className="p-2 bg-slate-50 dark:bg-slate-800/70 rounded-lg border border-slate-100 dark:border-slate-800 text-xs">
                          <div className="flex items-center justify-between">
                            <span className="font-bold text-slate-800 dark:text-white">{n.title}</span>
                            <span className="text-[10px] text-slate-400">{n.date}</span>
                          </div>
                          <p className="text-slate-600 dark:text-slate-300 mt-1 text-[11px] leading-relaxed">{n.content}</p>
                          <div className="mt-1.5 flex items-center justify-between text-[10px] text-slate-400">
                            <span>By: {n.postedBy}</span>
                            <span className="px-1.5 py-0.5 bg-slate-200/80 dark:bg-slate-700 text-slate-700 dark:text-slate-200 rounded font-medium">
                              {n.category}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* System Manual */}
              {onOpenManual && (
                <button
                  onClick={onOpenManual}
                  className="hidden lg:flex items-center gap-1.5 px-2.5 py-1.5 bg-slate-800/90 hover:bg-slate-700 text-amber-300 border border-slate-700 rounded-lg text-xs font-medium transition cursor-pointer shrink-0"
                  title="Open Instructions Manual (PDF with NexGrid Digital Letterhead)"
                >
                  <BookOpen className="w-3.5 h-3.5" />
                  <span className="hidden 2xl:inline">System Manual</span>
                </button>
              )}

              {/* Active Persona display & Sign Out */}
              <div className="flex items-center gap-2 pl-2 sm:pl-2.5 border-l border-slate-800 shrink-0">
                <div className="hidden md:flex flex-col text-right max-w-[110px] lg:max-w-[150px] min-w-0">
                  <span className="text-xs font-bold text-white leading-tight truncate" title={currentUser?.name}>
                    {currentUser?.name || 'Authorized Staff'}
                  </span>
                  <span className="text-[10px] text-blue-300 truncate" title={currentUser?.title || roleConfigs.find(r => r.role === currentRole)?.label}>
                    {currentUser?.title || roleConfigs.find(r => r.role === currentRole)?.label}
                  </span>
                </div>

                <div className="w-8 h-8 rounded-full bg-blue-600 text-white font-bold flex items-center justify-center text-xs border border-blue-400/50 shrink-0" title={currentUser?.name}>
                  {currentUser?.name?.charAt(0) || 'A'}
                </div>

                <button
                  onClick={logout}
                  className="flex items-center gap-1.5 px-2.5 py-1.5 bg-rose-950/60 hover:bg-rose-900 text-rose-200 border border-rose-800/70 rounded-lg text-xs font-medium transition cursor-pointer shrink-0"
                  title="Sign out of system"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span className="hidden xl:inline">Sign Out</span>
                </button>
              </div>

            </div>
          ) : (
            /* Top Nav Bar presentation badges */
            <div className="flex items-center gap-2">
              <button
                id="unauth-theme-toggle-btn"
                onClick={toggleTheme}
                className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-slate-200 hover:text-white border border-slate-700 text-xs font-semibold transition cursor-pointer active:scale-95"
                title={`Switch to ${theme === 'dark' ? 'Light' : 'Dark'} Mode`}
                aria-label={`Switch to ${theme === 'dark' ? 'Light' : 'Dark'} Mode`}
              >
                {theme === 'dark' ? (
                  <>
                    <Sun className="w-3.5 h-3.5 text-amber-400" />
                    <span className="hidden sm:inline">Light</span>
                  </>
                ) : (
                  <>
                    <Moon className="w-3.5 h-3.5 text-sky-300" />
                    <span className="hidden sm:inline">Dark</span>
                  </>
                )}
              </button>
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
          <div className="py-1.5 flex items-center gap-2.5 overflow-x-auto no-scrollbar">
            <div className="hidden lg:flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-400 shrink-0 pl-1 pr-2 border-r border-slate-800 select-none">
              <Sparkles className="w-3 h-3 text-blue-400" />
              <span>Portals</span>
            </div>
            <nav className="flex items-center space-x-1 shrink-0">
              {roleConfigs.map(({ role, label, icon: Icon }) => {
                const isActive = currentRole === role;
                return (
                  <button
                    key={role}
                    onClick={() => setCurrentRole(role)}
                    className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                      isActive
                        ? 'bg-blue-600 text-white shadow-sm shadow-blue-900/40 border border-blue-400/50'
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
