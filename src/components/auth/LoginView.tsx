import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
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
  Lock, 
  UserCheck, 
  ShieldAlert, 
  CheckCircle2, 
  ArrowRight, 
  Eye, 
  EyeOff, 
  Sparkles,
  HelpCircle,
  Mail,
  KeyRound
} from 'lucide-react';
import { AnimatedMascot } from './AnimatedMascot';
import { PasswordResetRequestModal } from './PasswordResetRequestModal';
import { EmailOtpView } from './EmailOtpView';
import { SimulatedEmailToast } from './SimulatedEmailToast';
import { GoogleSignInButton } from './GoogleSignInButton';
import { GmailSendConfirmationModal } from './GmailSendConfirmationModal';
import { AllTemplatesBottomSection } from '../common/AllTemplatesBottomSection';
import { 
  initGoogleAuth, 
  signInWithGoogle, 
  signOutGoogle, 
  getGoogleAccessToken, 
  sendOtpEmailViaGmail 
} from '../../services/gmailAuthService';
import type { User as FirebaseUser } from 'firebase/auth';

export const LoginView: React.FC = () => {
  const { schoolName, login, students, teachers } = useSchool();
  
  const [selectedRole, setSelectedRole] = useState<UserRole>('REGISTRAR');
  const [identifier, setIdentifier] = useState('registrar@oskaracademy.edu');
  const [password, setPassword] = useState('Admin@2026');
  const [showPassword, setShowPassword] = useState(false);
  const [isPasswordFocused, setIsPasswordFocused] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  
  // Google / Gmail Auth Integration
  const [googleUser, setGoogleUser] = useState<FirebaseUser | null>(null);
  const [isGoogleConnected, setIsGoogleConnected] = useState(false);
  const [isConnectingGoogle, setIsConnectingGoogle] = useState(false);
  const [showGmailConfirmModal, setShowGmailConfirmModal] = useState(false);
  const [isSendingGmail, setIsSendingGmail] = useState(false);
  const [wasSentViaGmail, setWasSentViaGmail] = useState(false);

  // OTP States
  const [isOtpStep, setIsOtpStep] = useState(false);
  const [expectedOtp, setExpectedOtp] = useState('849201');
  const [showEmailToast, setShowEmailToast] = useState(false);

  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isShaking, setIsShaking] = useState(false);
  const [showResetModal, setShowResetModal] = useState(false);

  // Initialize Google Auth state listener
  useEffect(() => {
    const unsubscribe = initGoogleAuth(
      (user) => {
        setGoogleUser(user);
        setIsGoogleConnected(true);
      },
      () => {
        setGoogleUser(null);
        setIsGoogleConnected(false);
      }
    );
    return () => unsubscribe();
  }, []);

  const handleConnectGoogle = async () => {
    setIsConnectingGoogle(true);
    setErrorMsg(null);
    try {
      const result = await signInWithGoogle();
      if (result) {
        setGoogleUser(result.user);
        setIsGoogleConnected(true);
      }
      // If result is null, the user cancelled or closed the popup without signing in
    } catch (error: any) {
      if (error?.message && !error.message.includes('popup-closed')) {
        setErrorMsg(error.message);
      }
    } finally {
      setIsConnectingGoogle(false);
    }
  };

  const handleDisconnectGoogle = async () => {
    try {
      await signOutGoogle();
      setGoogleUser(null);
      setIsGoogleConnected(false);
    } catch (e) {
      console.error(e);
    }
  };

  const roleCategories: {
    title: string;
    roles: { 
      role: UserRole; 
      label: string; 
      icon: React.FC<{ className?: string }>; 
      hintId: string;
      defaultPass: string;
      description: string;
      requiresEmail: boolean;
    }[];
  }[] = [
    {
      title: 'Administrative Leadership',
      roles: [
        { role: 'REGISTRAR', label: 'Admissions & Registrar', icon: Building2, hintId: 'registrar@oskaracademy.edu', defaultPass: 'Admin@2026', description: 'Student registrations, ID generation & verify documents', requiresEmail: true },
        { role: 'FINANCE', label: 'Finance Office', icon: CreditCard, hintId: 'finance@oskaracademy.edu', defaultPass: 'Finance#2026', description: 'Bank reconciliation, invoices, tuition & waivers', requiresEmail: true },
        { role: 'PRINCIPAL', label: 'Principal / Head', icon: GraduationCap, hintId: 'principal@oskaracademy.edu', defaultPass: 'Principal#2026', description: 'Executive analytics, teacher leaves & stream change approvals', requiresEmail: true },
        { role: 'PROGRAM_OFFICE', label: 'Program Office', icon: Layers, hintId: 'program.office@oskaracademy.edu', defaultPass: 'Program#2026', description: 'Section capacity & automated allocation', requiresEmail: true },
        { role: 'COUNSELLOR', label: 'Counsellor & Discipline', icon: HeartHandshake, hintId: 'counselling@oskaracademy.edu', defaultPass: 'Counsellor#2026', description: 'Student conduct, parent conferences & pastoral care', requiresEmail: true },
      ]
    },
    {
      title: 'Faculty & Scholars',
      roles: [
        { role: 'TEACHER', label: 'Teacher Portal', icon: Users, hintId: teachers[0]?.id || 'TCH-001', defaultPass: 'Teacher@2026', description: 'Homeroom roster, continuous grading & day-off requests', requiresEmail: false },
        { role: 'STUDENT', label: 'Student Scholar', icon: User, hintId: students[0]?.id || 'OSK-2026-0901', defaultPass: 'Password@123', description: 'Report card, digital ID, schedule & tuition status', requiresEmail: false },
        { role: 'PARENT', label: 'Parent / Guardian', icon: Home, hintId: students[0]?.parents?.fatherPhone || '+251 91 123 4567', defaultPass: 'Parent@2026', description: 'Child progress monitoring, attendance & billing history', requiresEmail: false },
      ]
    }
  ];

  const currentRoleMeta = roleCategories
    .flatMap(c => c.roles)
    .find(r => r.role === selectedRole) || roleCategories[0].roles[0];

  // Any account using an email address, or admin leadership roles, requires Email OTP verification
  const requiresEmailOtp = identifier.includes('@') || currentRoleMeta.requiresEmail;

  const handleRoleSelect = (role: UserRole) => {
    setSelectedRole(role);
    setErrorMsg(null);
    setIsOtpStep(false);
    setShowEmailToast(false);
    const meta = roleCategories.flatMap(c => c.roles).find(r => r.role === role);
    if (meta) {
      setIdentifier(meta.hintId);
      setPassword(meta.defaultPass);
    }
  };

  const handleQuickFill = () => {
    setIdentifier(currentRoleMeta.hintId);
    setPassword(currentRoleMeta.defaultPass);
    setErrorMsg(null);
    setIsOtpStep(false);
  };

  const calculatePasswordStrength = (pass: string) => {
    if (!pass) return 0;
    let score = 0;
    if (pass.length >= 6) score += 1;
    if (pass.length >= 8) score += 1;
    if (/[A-Z]/.test(pass)) score += 1;
    if (/[0-9]/.test(pass) || /[^A-Za-z0-9]/.test(pass)) score += 1;
    return score;
  };

  const passStrength = calculatePasswordStrength(password);

  const generateOtp = () => {
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    setExpectedOtp(code);
    return code;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!identifier.trim()) {
      setErrorMsg('Please enter your assigned identifier, ID, or email.');
      triggerShake();
      return;
    }

    if (!password.trim()) {
      setErrorMsg('Please enter your account password.');
      triggerShake();
      return;
    }

    setIsLoading(true);
    setErrorMsg(null);

    // If account requires Email OTP Authentication
    if (requiresEmailOtp) {
      const code = generateOtp();

      // Check if Gmail is connected
      if (isGoogleConnected && googleUser) {
        setIsLoading(false);
        // Prompt user confirmation modal before sending real email via Gmail API
        setShowGmailConfirmModal(true);
        return;
      }

      // If Gmail is not yet connected, generate code and show OTP view with simulated toast
      setTimeout(() => {
        setIsLoading(false);
        setWasSentViaGmail(false);
        setShowEmailToast(true);
        setIsOtpStep(true);
      }, 500);
      return;
    }

    // Direct login for ID-based stakeholders (students, teachers with code)
    setTimeout(() => {
      setIsLoading(false);
      setIsSuccess(true);
      setTimeout(() => {
        login(selectedRole, identifier, password);
      }, 700);
    }, 600);
  };

  const handleConfirmSendGmail = async () => {
    setIsSendingGmail(true);
    setErrorMsg(null);

    try {
      await sendOtpEmailViaGmail({
        recipientEmail: identifier,
        otpCode: expectedOtp,
        roleName: currentRoleMeta.label,
        schoolName,
        senderName: googleUser?.displayName || schoolName,
      });

      setIsSendingGmail(false);
      setShowGmailConfirmModal(false);
      setWasSentViaGmail(true);
      setShowEmailToast(false);
      setIsOtpStep(true);
    } catch (err: any) {
      console.error('Failed to send email via Gmail:', err);
      setIsSendingGmail(false);
      setShowGmailConfirmModal(false);
      setErrorMsg(`Gmail dispatch error: ${err?.message || 'Check your Gmail permissions'}. Falling back to instant verification.`);
      // Fallback to OTP step
      setWasSentViaGmail(false);
      setShowEmailToast(true);
      setIsOtpStep(true);
    }
  };

  const handleOtpSuccess = () => {
    setIsSuccess(true);
    setShowEmailToast(false);
    setTimeout(() => {
      login(selectedRole, identifier, password);
    }, 700);
  };

  const triggerShake = () => {
    setIsShaking(true);
    setTimeout(() => setIsShaking(false), 500);
  };

  return (
    <div className="relative min-h-[calc(100vh-140px)] py-10 px-4 sm:px-6 lg:px-8 flex flex-col justify-between overflow-hidden">
      {/* Simulated Email Delivery Toast Notification (if not connected or for quick testing) */}
      <SimulatedEmailToast
        isOpen={showEmailToast}
        email={identifier}
        otpCode={expectedOtp}
        onClose={() => setShowEmailToast(false)}
        onCopyOrFill={() => {}}
      />

      {/* Gmail Send Confirmation Dialog (Mandatory User Consent before sending email) */}
      <GmailSendConfirmationModal
        isOpen={showGmailConfirmModal}
        onClose={() => setShowGmailConfirmModal(false)}
        onConfirm={handleConfirmSendGmail}
        recipientEmail={identifier}
        senderEmail={googleUser?.email || 'me'}
        otpCode={expectedOtp}
        roleLabel={currentRoleMeta.label}
        isSending={isSendingGmail}
      />

      {/* Ambient Animated Background Glows */}
      <div className="absolute inset-0 pointer-events-none -z-10 overflow-hidden">
        <motion.div
          animate={{
            x: [0, 40, -20, 0],
            y: [0, -30, 20, 0],
            scale: [1, 1.1, 0.95, 1],
          }}
          transition={{ repeat: Infinity, duration: 18, ease: 'easeInOut' }}
          className="absolute -top-32 -left-32 w-96 h-96 rounded-full bg-blue-400/15 blur-3xl"
        />
        <motion.div
          animate={{
            x: [0, -50, 20, 0],
            y: [0, 40, -20, 0],
            scale: [1, 1.15, 0.9, 1],
          }}
          transition={{ repeat: Infinity, duration: 22, ease: 'easeInOut' }}
          className="absolute top-1/3 -right-32 w-96 h-96 rounded-full bg-indigo-500/10 blur-3xl"
        />
        <motion.div
          animate={{
            x: [0, 30, -30, 0],
            y: [0, 25, -25, 0],
          }}
          transition={{ repeat: Infinity, duration: 15, ease: 'easeInOut' }}
          className="absolute -bottom-24 left-1/3 w-80 h-80 rounded-full bg-amber-400/10 blur-3xl"
        />
      </div>

      {/* Main Authentication Container */}
      <div className="max-w-xl mx-auto w-full">
        {/* Animated Mascot / Security Guardian */}
        <AnimatedMascot
          isPasswordFocused={isPasswordFocused && !isOtpStep}
          showPassword={showPassword}
          inputLength={isOtpStep ? 6 : identifier.length}
          isAuthenticating={isLoading || isSendingGmail}
          isSuccess={isSuccess}
          hasError={Boolean(errorMsg)}
        />

        {/* Form Card */}
        <motion.div
          initial={{ opacity: 0, y: 20, scale: 0.98 }}
          animate={
            isShaking
              ? { x: [-12, 12, -8, 8, -4, 4, 0] }
              : { opacity: 1, y: 0, scale: 1 }
          }
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          className="bg-white/95 backdrop-blur-md rounded-3xl shadow-2xl border border-slate-200/80 overflow-hidden"
        >
          {/* Institution Header Banner */}
          <div className="relative bg-linear-to-r from-[#0B192C] via-[#1E3E62] to-[#0B192C] px-6 py-5 text-white text-center border-b border-slate-800">
            <div className="flex items-center justify-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-blue-600/90 text-white flex items-center justify-center font-oskar font-bold text-xl shadow-md border border-blue-400/30">
                {schoolName.charAt(0) || 'A'}
              </div>
              <div className="text-left">
                <h2 className="text-lg font-bold font-oskar tracking-wide leading-tight">{schoolName}</h2>
                <p className="text-[11px] text-blue-200 font-medium">Unified Security & Portal Authentication</p>
              </div>
            </div>

            {/* Micro Badge for active portal */}
            <div className="mt-3 inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-500/20 border border-blue-400/30 text-blue-200 text-xs font-medium">
              <currentRoleMeta.icon className="w-3.5 h-3.5 text-blue-300" />
              <span>Target: <strong>{currentRoleMeta.label}</strong></span>
              {requiresEmailOtp && (
                <span className="ml-1 bg-amber-400/20 text-amber-300 text-[10px] font-mono px-1.5 py-0.2 rounded border border-amber-400/30 flex items-center gap-1">
                  <Mail className="w-3 h-3" />
                  <span>Gmail OTP</span>
                </span>
              )}
            </div>
          </div>

          {/* Form Body */}
          <div className="p-6 sm:p-7 space-y-5">
            <AnimatePresence mode="wait">
              {isOtpStep ? (
                /* STEP 2: EMAIL OTP VERIFICATION VIEW */
                <motion.div
                  key="otp-step"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.3 }}
                >
                  <EmailOtpView
                    email={identifier}
                    expectedOtp={expectedOtp}
                    roleLabel={currentRoleMeta.label}
                    isSentViaGmail={wasSentViaGmail}
                    gmailSender={googleUser?.email}
                    onVerifySuccess={handleOtpSuccess}
                    onBack={() => {
                      setIsOtpStep(false);
                      setShowEmailToast(false);
                    }}
                    onResendOtp={() => {
                      const code = generateOtp();
                      if (isGoogleConnected && googleUser) {
                        setShowGmailConfirmModal(true);
                      } else {
                        setShowEmailToast(true);
                      }
                    }}
                    onShake={triggerShake}
                  />
                </motion.div>
              ) : (
                /* STEP 1: CREDENTIALS & ROLE SELECTION VIEW */
                <motion.div
                  key="credentials-step"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  transition={{ duration: 0.3 }}
                  className="space-y-5"
                >
                  {/* Google / Gmail Account Connect Bar */}
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                        Gmail Delivery Service:
                      </span>
                      {isGoogleConnected && (
                        <span className="text-[10px] text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md font-semibold border border-emerald-200">
                          Live Gmail API Active
                        </span>
                      )}
                    </div>
                    <GoogleSignInButton
                      onSignIn={handleConnectGoogle}
                      isConnected={isGoogleConnected}
                      userEmail={googleUser?.email}
                      onDisconnect={handleDisconnectGoogle}
                      isLoading={isConnectingGoogle}
                    />
                  </div>

                  {/* Stakeholder Category & Role Selector */}
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <label className="text-xs font-bold uppercase tracking-wider text-slate-600">
                        Select Department or Stakeholder:
                      </label>
                      <button
                        type="button"
                        onClick={handleQuickFill}
                        className="inline-flex items-center gap-1 text-[11px] font-semibold text-blue-600 hover:text-blue-700 bg-blue-50 hover:bg-blue-100/80 px-2 py-0.5 rounded-md transition cursor-pointer"
                        title="Auto-fill verified credentials for this role"
                      >
                        <Sparkles className="w-3 h-3 text-blue-500" />
                        <span>Use Sample Credentials</span>
                      </button>
                    </div>

                    <div className="space-y-3">
                      {roleCategories.map((cat) => (
                        <div key={cat.title}>
                          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">{cat.title}</p>
                          <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5">
                            {cat.roles.map(({ role, label, icon: Icon, requiresEmail }) => {
                              const isSelected = selectedRole === role;
                              return (
                                <button
                                  key={role}
                                  type="button"
                                  onClick={() => handleRoleSelect(role)}
                                  className={`relative flex items-center justify-between p-2 rounded-xl text-left border text-xs transition-all cursor-pointer ${
                                    isSelected
                                      ? 'bg-blue-600 text-white font-bold shadow-md border-blue-500'
                                      : 'bg-slate-50/70 border-slate-200 text-slate-700 hover:bg-slate-100 hover:border-slate-300'
                                  }`}
                                >
                                  {isSelected && (
                                    <motion.div
                                      layoutId="activeRoleIndicator"
                                      className="absolute inset-0 bg-blue-600 rounded-xl -z-10 shadow-sm"
                                      transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                                    />
                                  )}
                                  <div className="flex items-center gap-2 truncate">
                                    <Icon className={`w-4 h-4 shrink-0 ${isSelected ? 'text-white' : 'text-slate-400'}`} />
                                    <span className="truncate">{label}</span>
                                  </div>
                                  {requiresEmail && (
                                    <span 
                                      className={`text-[9px] px-1 py-0.2 rounded font-mono ${isSelected ? 'bg-blue-800 text-blue-200' : 'bg-slate-200 text-slate-500'}`}
                                      title="Requires Email 2FA OTP"
                                    >
                                      OTP
                                    </span>
                                  )}
                                </button>
                              );
                            })}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Error Message */}
                  <AnimatePresence>
                    {errorMsg && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="p-3 bg-rose-50 text-rose-700 rounded-xl text-xs border border-rose-200 flex items-center gap-2"
                      >
                        <ShieldAlert className="w-4 h-4 shrink-0" />
                        <span>{errorMsg}</span>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* Credentials Form */}
                  <form onSubmit={handleSubmit} className="space-y-4 pt-1">
                    {/* Account Identifier Input */}
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <label className="block text-xs font-semibold text-slate-700">
                          {requiresEmailOtp ? 'Institutional Email (Sends OTP via Gmail)' : 'Account ID, Email, or Phone'}
                        </label>
                        {requiresEmailOtp && (
                          <span className="text-[10px] text-blue-600 font-semibold bg-blue-50 px-1.5 py-0.5 rounded border border-blue-200 flex items-center gap-1">
                            <Mail className="w-3 h-3" />
                            <span>Gmail OTP Required</span>
                          </span>
                        )}
                      </div>
                      <div className="relative">
                        <input
                          type="text"
                          value={identifier}
                          onChange={(e) => {
                            setIdentifier(e.target.value);
                            if (errorMsg) setErrorMsg(null);
                          }}
                          placeholder={`e.g. ${currentRoleMeta.hintId}`}
                          className="w-full pl-9 pr-3 py-2.5 text-sm bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                        />
                        <UserCheck className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                        {identifier && (
                          <button
                            type="button"
                            onClick={() => setIdentifier('')}
                            className="absolute right-3 top-3 text-slate-400 hover:text-slate-600 text-xs cursor-pointer"
                          >
                            ✕
                          </button>
                        )}
                      </div>
                      <p className="text-[11px] text-slate-400 mt-1 flex items-center justify-between">
                        <span>Authorized ID: <strong className="text-slate-600 font-mono">{currentRoleMeta.hintId}</strong></span>
                        <span className="text-[10px] text-blue-600 font-medium">{currentRoleMeta.description}</span>
                      </p>
                    </div>

                    {/* Password Input */}
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <label className="block text-xs font-semibold text-slate-700">
                          Security Password
                        </label>
                        <button
                          type="button"
                          onClick={() => setShowResetModal(true)}
                          className="text-[11px] font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-1 cursor-pointer"
                        >
                          <HelpCircle className="w-3 h-3" />
                          <span>Need Password Help?</span>
                        </button>
                      </div>
                      
                      <div className="relative">
                        <input
                          type={showPassword ? 'text' : 'password'}
                          value={password}
                          onFocus={() => setIsPasswordFocused(true)}
                          onBlur={() => setIsPasswordFocused(false)}
                          onChange={(e) => {
                            setPassword(e.target.value);
                            if (errorMsg) setErrorMsg(null);
                          }}
                          placeholder="Enter security password"
                          className="w-full pl-9 pr-10 py-2.5 text-sm bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                        />
                        <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3 top-3 text-slate-400 hover:text-slate-600 transition cursor-pointer"
                          title={showPassword ? 'Hide password' : 'Show password'}
                        >
                          {showPassword ? <EyeOff className="w-4 h-4 text-blue-600" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>

                      {/* Animated Password Strength Indicator */}
                      {password.length > 0 && (
                        <div className="mt-2 space-y-1">
                          <div className="flex gap-1 h-1.5 w-full">
                            {[1, 2, 3, 4].map((level) => {
                              const active = passStrength >= level;
                              const barColor = 
                                passStrength === 1 ? 'bg-red-500' :
                                passStrength === 2 ? 'bg-amber-500' :
                                passStrength === 3 ? 'bg-blue-500' : 'bg-emerald-500';
                              return (
                                <motion.div
                                  key={level}
                                  initial={{ scaleX: 0 }}
                                  animate={{ scaleX: 1 }}
                                  className={`flex-1 rounded-full transition-colors duration-300 ${active ? barColor : 'bg-slate-200'}`}
                                />
                              );
                            })}
                          </div>
                          <div className="flex items-center justify-between text-[10px] text-slate-500">
                            <span>Security Strength:</span>
                            <span className="font-semibold">
                              {passStrength <= 1 && <span className="text-red-600">Basic</span>}
                              {passStrength === 2 && <span className="text-amber-600">Moderate</span>}
                              {passStrength === 3 && <span className="text-blue-600">Good</span>}
                              {passStrength === 4 && <span className="text-emerald-600">Compliant</span>}
                            </span>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Remember Me & Policy Note */}
                    <div className="flex items-center justify-between pt-1">
                      <label className="flex items-center gap-2 cursor-pointer select-none">
                        <input
                          type="checkbox"
                          checked={rememberMe}
                          onChange={(e) => setRememberMe(e.target.checked)}
                          className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500 border-slate-300"
                        />
                        <span className="text-xs text-slate-600 font-medium">Keep session authenticated</span>
                      </label>

                      <button
                        type="button"
                        onClick={() => setShowResetModal(true)}
                        className="text-xs text-slate-500 hover:text-slate-800 underline decoration-dotted cursor-pointer"
                      >
                        Reset Policy
                      </button>
                    </div>

                    {/* Credential Authority Policy Notice */}
                    <div className="p-3 bg-amber-50/80 border border-amber-200/80 rounded-2xl text-amber-900 text-xs flex items-start gap-2.5">
                      <ShieldAlert className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                      <div className="space-y-0.5">
                        <p className="font-bold text-amber-950">Credential Security Protocol:</p>
                        <p className="text-[11px] text-amber-800 leading-relaxed">
                          Student & Staff password resets are strictly permitted only via the <strong>Finance Office</strong>, <strong>Registrar</strong>, or <strong>Principal</strong> upon identity verification.
                        </p>
                      </div>
                    </div>

                    {/* Submit Button with Dynamic Animation */}
                    <motion.button
                      type="submit"
                      disabled={isLoading || isSuccess}
                      whileHover={!isLoading && !isSuccess ? { scale: 1.01 } : {}}
                      whileTap={!isLoading && !isSuccess ? { scale: 0.99 } : {}}
                      className={`w-full py-3 px-4 rounded-xl text-sm font-semibold shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer ${
                        isSuccess
                          ? 'bg-emerald-600 text-white'
                          : 'bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white'
                      }`}
                    >
                      {isLoading ? (
                        <div className="flex items-center gap-2">
                          <motion.div
                            animate={{ rotate: 360 }}
                            transition={{ repeat: Infinity, duration: 0.8, ease: 'linear' }}
                            className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full"
                          />
                          <span>{requiresEmailOtp ? 'Preparing Gmail OTP...' : 'Verifying Credentials...'}</span>
                        </div>
                      ) : isSuccess ? (
                        <motion.div
                          initial={{ scale: 0.8, opacity: 0 }}
                          animate={{ scale: 1, opacity: 1 }}
                          className="flex items-center gap-2 text-white"
                        >
                          <CheckCircle2 className="w-4 h-4" />
                          <span>Access Granted • Redirecting...</span>
                        </motion.div>
                      ) : (
                        <div className="flex items-center gap-2">
                          {requiresEmailOtp ? (
                            <>
                              <Mail className="w-4 h-4" />
                              <span>{isGoogleConnected ? 'Send OTP via Gmail & Verify' : 'Verify & Send Email OTP'}</span>
                            </>
                          ) : (
                            <>
                              <KeyRound className="w-4 h-4" />
                              <span>Sign In to {currentRoleMeta.label}</span>
                            </>
                          )}
                          <ArrowRight className="w-4 h-4" />
                        </div>
                      )}
                    </motion.button>
                  </form>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </motion.div>
      </div>

      {/* Password Reset Request Modal */}
      <PasswordResetRequestModal
        isOpen={showResetModal}
        onClose={() => setShowResetModal(false)}
        defaultIdentifier={identifier}
      />

      {/* Institutional Templates & Portals Bottom Catalog */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-12">
        <AllTemplatesBottomSection />
      </div>
    </div>
  );
};
