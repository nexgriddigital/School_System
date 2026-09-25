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
  Check,
  ArrowRight, 
  Eye, 
  EyeOff, 
  HelpCircle,
  Mail,
  KeyRound,
  ShieldCheck,
  Crown
} from 'lucide-react';
import { AnimatedMascot } from './AnimatedMascot';
import { SchoolMascotLogo } from '../common/SchoolMascotLogo';
import { PasswordResetRequestModal } from './PasswordResetRequestModal';
import { EmailOtpView } from './EmailOtpView';
import { GoogleSignInButton } from './GoogleSignInButton';
import { GmailSendConfirmationModal } from './GmailSendConfirmationModal';
import { 
  initGoogleAuth, 
  signInWithGoogle, 
  signOutGoogle, 
  sendOtpEmailViaGmail 
} from '../../services/gmailAuthService';
import type { User as FirebaseUser } from 'firebase/auth';

interface LoginViewProps {
  onOpenTerms?: () => void;
  onOpenManual?: () => void;
}

type AuthMode = 'SIGN_IN' | 'PRINCIPAL_SIGN_UP';

export const LoginView: React.FC<LoginViewProps> = ({ onOpenTerms, onOpenManual }) => {
  const { 
    schoolName, 
    login, 
    checkCredentialsAndTemporaryStatus,
    students, 
    teachers, 
    institutionalUsers, 
    createPrincipalAccount,
    getUserByEmailOrId, 
    changeUserPassword,
    completeFirstTimePasswordChangeAndLogin,
    sessionExpiredNotification,
    clearSessionExpiredNotification,
    verifyMasterCode,
  } = useSchool();
  
  const hasPrincipal = institutionalUsers.some(u => u.role === 'PRINCIPAL');
  const existingPrincipal = institutionalUsers.find(u => u.role === 'PRINCIPAL');

  // Auth Mode: Default to PRINCIPAL_SIGN_UP if no Principal exists yet!
  const [authMode, setAuthMode] = useState<AuthMode>(() => {
    return institutionalUsers.some(u => u.role === 'PRINCIPAL') ? 'SIGN_IN' : 'PRINCIPAL_SIGN_UP';
  });

  // Sign In States
  const [selectedRole, setSelectedRole] = useState<UserRole>(() => {
    return institutionalUsers.some(u => u.role === 'PRINCIPAL') ? 'PRINCIPAL' : 'REGISTRAR';
  });
  const [identifier, setIdentifier] = useState(() => {
    const p = institutionalUsers.find(u => u.role === 'PRINCIPAL');
    return p ? p.email : '';
  });
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isPasswordFocused, setIsPasswordFocused] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);

  // First Login Mandatory Password Update States
  const [isFirstLoginPasswordStep, setIsFirstLoginPasswordStep] = useState(false);
  const [firstLoginTargetUser, setFirstLoginTargetUser] = useState<{
    id: string;
    name: string;
    email: string;
    role: UserRole;
    position: string;
    tempPasswordProvided?: string;
  } | null>(null);
  const [newPermanentPassword, setNewPermanentPassword] = useState('');
  const [confirmPermanentPassword, setConfirmPermanentPassword] = useState('');
  const [showNewPermanentPassword, setShowNewPermanentPassword] = useState(false);
  const [isSavingPermanentPassword, setIsSavingPermanentPassword] = useState(false);

  // Principal Sign Up States
  const [principalMasterCode, setPrincipalMasterCode] = useState('');
  const [showMasterCode, setShowMasterCode] = useState(false);
  const [principalName, setPrincipalName] = useState('');
  const [principalEmail, setPrincipalEmail] = useState('');
  const [principalPassword, setPrincipalPassword] = useState('');
  const [principalConfirmPassword, setPrincipalConfirmPassword] = useState('');
  const [showPrincipalPassword, setShowPrincipalPassword] = useState(false);
  
  // Google / Gmail Auth Integration
  const [googleUser, setGoogleUser] = useState<FirebaseUser | null>(null);
  const [isGoogleConnected, setIsGoogleConnected] = useState(false);
  const [isConnectingGoogle, setIsConnectingGoogle] = useState(false);
  const [showGmailConfirmModal, setShowGmailConfirmModal] = useState(false);
  const [isSendingGmail, setIsSendingGmail] = useState(false);
  const [wasSentViaGmail, setWasSentViaGmail] = useState(false);

  // OTP States
  const [isOtpStep, setIsOtpStep] = useState(false);
  const [expectedOtp, setExpectedOtp] = useState('');

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

  const handleConnectGoogle = async (): Promise<FirebaseUser | null> => {
    setIsConnectingGoogle(true);
    setErrorMsg(null);
    try {
      const result = await signInWithGoogle();
      if (result) {
        setGoogleUser(result.user);
        setIsGoogleConnected(true);
        return result.user;
      }
      return null;
    } catch (error: any) {
      if (error?.message && !error.message.includes('popup-closed')) {
        setErrorMsg(error.message);
      }
      return null;
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
    }[];
  }[] = [
    {
      title: 'Administrative Leadership',
      roles: [
        { 
          role: 'REGISTRAR', 
          label: 'Admissions & Registrar', 
          icon: Building2, 
          hintId: institutionalUsers.find(u => u.role === 'REGISTRAR')?.email || '', 
          defaultPass: '', 
          description: 'Student registrations, ID generation & verify documents' 
        },
        { 
          role: 'FINANCE', 
          label: 'Finance Office', 
          icon: CreditCard, 
          hintId: institutionalUsers.find(u => u.role === 'FINANCE')?.email || '', 
          defaultPass: '', 
          description: 'Bank reconciliation, invoices, tuition & waivers' 
        },
        { 
          role: 'PRINCIPAL', 
          label: 'Principal / Head', 
          icon: GraduationCap, 
          hintId: existingPrincipal?.email || '', 
          defaultPass: '', 
          description: 'Executive analytics, teacher leaves & stream change approvals' 
        },
        { 
          role: 'PROGRAM_OFFICE', 
          label: 'Program Office', 
          icon: Layers, 
          hintId: institutionalUsers.find(u => u.role === 'PROGRAM_OFFICE')?.email || '', 
          defaultPass: '', 
          description: 'Section capacity & automated allocation' 
        },
        { 
          role: 'COUNSELLOR', 
          label: 'Counsellor & Discipline', 
          icon: HeartHandshake, 
          hintId: institutionalUsers.find(u => u.role === 'COUNSELLOR')?.email || '', 
          defaultPass: '', 
          description: 'Student conduct, parent conferences & pastoral care' 
        },
      ]
    },
    {
      title: 'Faculty & Scholars',
      roles: [
        { 
          role: 'TEACHER', 
          label: 'Teacher Portal', 
          icon: Users, 
          hintId: teachers[0]?.id || '', 
          defaultPass: '', 
          description: 'Homeroom roster, continuous grading & day-off requests' 
        },
        { 
          role: 'STUDENT', 
          label: 'Student Scholar', 
          icon: User, 
          hintId: students[0]?.id || '', 
          defaultPass: '', 
          description: 'Report card, digital ID, schedule & tuition status' 
        },
        { 
          role: 'PARENT', 
          label: 'Parent / Guardian', 
          icon: Home, 
          hintId: students[0]?.parents?.fatherPhone || '', 
          defaultPass: '', 
          description: 'Child progress monitoring, attendance & billing history' 
        },
      ]
    }
  ];

  const currentRoleMeta = roleCategories
    .flatMap(c => c.roles)
    .find(r => r.role === selectedRole) || roleCategories[0].roles[0];

  const adminLeadershipRoles: UserRole[] = ['REGISTRAR', 'FINANCE', 'PROGRAM_OFFICE', 'COUNSELLOR'];
  const isSelectedRoleAdmin = adminLeadershipRoles.includes(selectedRole);
  const provisionedAdminUser = isSelectedRoleAdmin ? institutionalUsers.find(u => u.role === selectedRole) : null;
  const isSelectedRoleProvisionedByPrincipal = isSelectedRoleAdmin ? Boolean(provisionedAdminUser) : true;

  const handleRoleSelect = (role: UserRole) => {
    setSelectedRole(role);
    setErrorMsg(null);
    setIsOtpStep(false);
    const meta = roleCategories.flatMap(c => c.roles).find(r => r.role === role);
    if (meta) {
      if (adminLeadershipRoles.includes(role)) {
        const prov = institutionalUsers.find(u => u.role === role);
        if (prov) {
          setIdentifier(prov.email);
          setPassword('');
        } else {
          setIdentifier('');
          setPassword('');
        }
      } else if (role === 'PRINCIPAL') {
        const principalUser = institutionalUsers.find(u => u.role === 'PRINCIPAL');
        if (principalUser) {
          setIdentifier(principalUser.email);
          setPassword('');
        } else {
          setIdentifier('');
          setPassword('');
        }
      } else {
        setIdentifier(meta.hintId);
        setPassword(meta.defaultPass);
      }
    }
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

  const passStrength = calculatePasswordStrength(authMode === 'PRINCIPAL_SIGN_UP' ? principalPassword : password);

  const generateOtp = () => {
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    setExpectedOtp(code);
    return code;
  };

  const triggerShake = () => {
    setIsShaking(true);
    setTimeout(() => setIsShaking(false), 500);
  };

  // Sign in submit: validates credentials and logs in
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    // Enforce Principal-only creation requirement for administrative roles
    if (isSelectedRoleAdmin && !isSelectedRoleProvisionedByPrincipal) {
      setErrorMsg('Access Denied: This account has not been created by the Principal yet. Administrative leadership accounts must be officially created and authorized by the Principal before login is allowed.');
      triggerShake();
      return;
    }

    if (selectedRole === 'PRINCIPAL' && !hasPrincipal) {
      setErrorMsg('No Principal account found. Please initialize the Executive Principal account first using Principal Sign Up.');
      triggerShake();
      return;
    }

    if (!identifier.trim()) {
      setErrorMsg('Please enter your institutional email or account identifier.');
      triggerShake();
      return;
    }

    if (!password.trim()) {
      setErrorMsg('Please enter your account password.');
      triggerShake();
      return;
    }

    // Pre-validate credentials and temporary password status across all roles
    const credentialStatus = checkCredentialsAndTemporaryStatus(selectedRole, identifier.trim(), password);
    if (!credentialStatus.isValid) {
      setErrorMsg(credentialStatus.error || 'Invalid credentials. Please verify your identifier and password.');
      triggerShake();
      return;
    }

    // If Gmail sender is connected, dispatch real OTP code via Gmail first
    if (isGoogleConnected && googleUser) {
      generateOtp();
      setShowGmailConfirmModal(true);
      return;
    }

    // If account was provisioned with a temporary password or mandatory first-time update is flagged:
    // Prompt the user immediately for a new password without logging into dashboard
    if (credentialStatus.mustChangePassword && credentialStatus.user) {
      setFirstLoginTargetUser({
        id: credentialStatus.user.id,
        name: credentialStatus.user.name,
        email: credentialStatus.user.email,
        role: credentialStatus.user.role,
        position: credentialStatus.user.position,
        tempPasswordProvided: password,
      });
      setIsFirstLoginPasswordStep(true);
      setIsLoading(false);
      return;
    }

    // Direct password authentication for permanent passwords
    setIsLoading(true);
    try {
      const loginResult = login(selectedRole, identifier.trim(), password);
      if (!loginResult.success) {
        setErrorMsg(loginResult.error || 'Invalid identifier or password. Please verify your credentials.');
        triggerShake();
        setIsLoading(false);
        return;
      }

      setIsSuccess(true);
    } catch (err: any) {
      setErrorMsg(err.message || 'Authentication error.');
      triggerShake();
    } finally {
      setIsLoading(false);
    }
  };

  // Principal Sign Up submit: registers the Executive Principal and logs them in
  const handlePrincipalSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    // Verify master code
    if (!principalMasterCode.trim() || !verifyMasterCode(principalMasterCode.trim())) {
      setErrorMsg('Invalid Master Authorization Code. Please enter the confidential key issued for institutional Principal authorization.');
      triggerShake();
      return;
    }

    if (!principalName.trim()) {
      setErrorMsg('Please enter the Principal\'s full legal name.');
      triggerShake();
      return;
    }

    if (!principalEmail.trim() || !principalEmail.includes('@')) {
      setErrorMsg('Please enter a valid institutional email address.');
      triggerShake();
      return;
    }

    if (!principalPassword || principalPassword.length < 6) {
      setErrorMsg('Principal password must be at least 6 characters long.');
      triggerShake();
      return;
    }

    if (principalPassword !== principalConfirmPassword) {
      setErrorMsg('Passwords do not match. Please re-enter your password accurately.');
      triggerShake();
      return;
    }

    // If Google/Gmail is connected, we can send confirmation OTP
    if (isGoogleConnected && googleUser) {
      generateOtp();
      setShowGmailConfirmModal(true);
      return;
    }

    // Direct registration and initialization
    setIsLoading(true);
    try {
      const res = createPrincipalAccount({
        name: principalName.trim(),
        email: principalEmail.trim(),
        password: principalPassword,
      });

      if (!res.success) {
        setErrorMsg(res.error || 'Failed to initialize Principal account.');
        triggerShake();
        setIsLoading(false);
        return;
      }

      // Automatically authenticate as Principal
      const loginRes = login('PRINCIPAL', principalEmail.trim(), principalPassword, principalName.trim());
      if (loginRes.success) {
        setIsSuccess(true);
      } else {
        setErrorMsg(loginRes.error || 'Principal created. Please sign in with your credentials.');
        setAuthMode('SIGN_IN');
        setIdentifier(principalEmail.trim());
        setPassword(principalPassword);
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to create Principal account.');
      triggerShake();
    } finally {
      setIsLoading(false);
    }
  };

  // Dispatches the actual live OTP email through the Gmail API
  const handleConfirmSendGmail = async () => {
    setIsSendingGmail(true);
    setErrorMsg(null);

    const targetRecipient = authMode === 'PRINCIPAL_SIGN_UP' ? principalEmail.trim() : identifier.trim();
    const targetRoleLabel = authMode === 'PRINCIPAL_SIGN_UP' ? 'Principal & Executive Oversight' : currentRoleMeta.label;

    try {
      await sendOtpEmailViaGmail({
        recipientEmail: targetRecipient,
        otpCode: expectedOtp,
        roleName: targetRoleLabel,
        schoolName,
        senderName: googleUser?.displayName || schoolName,
      });

      setIsSendingGmail(false);
      setShowGmailConfirmModal(false);
      setWasSentViaGmail(true);
      setIsOtpStep(true);
    } catch (err: any) {
      console.error('Failed to send email via Gmail:', err);
      setIsSendingGmail(false);
      setShowGmailConfirmModal(false);
      setErrorMsg(`Gmail dispatch failed: ${err?.message || 'Check recipient email address and Gmail sender authorization'}. Please ensure a valid email is provided.`);
      triggerShake();
    }
  };

  // Called when user enters the correct 6-digit code received in their actual Gmail inbox
  const handleOtpSuccess = () => {
    setIsSuccess(true);

    if (authMode === 'PRINCIPAL_SIGN_UP') {
      createPrincipalAccount({
        name: principalName.trim(),
        email: principalEmail.trim(),
        password: principalPassword,
      });
      setTimeout(() => {
        const loginRes = login('PRINCIPAL', principalEmail, principalPassword, principalName);
        if (!loginRes.success) {
          setIsSuccess(false);
          setErrorMsg(loginRes.error || 'Failed to authenticate Principal account.');
          triggerShake();
        }
      }, 700);
      return;
    }

    // Check if institutional user or student requires mandatory password change on first login
    const credentialStatus = checkCredentialsAndTemporaryStatus(selectedRole, identifier.trim(), password);

    if (credentialStatus.mustChangePassword && credentialStatus.user) {
      setTimeout(() => {
        setIsSuccess(false);
        setIsOtpStep(false);
        setFirstLoginTargetUser({
          id: credentialStatus.user!.id,
          name: credentialStatus.user!.name,
          email: credentialStatus.user!.email,
          role: credentialStatus.user!.role,
          position: credentialStatus.user!.position,
          tempPasswordProvided: password,
        });
        setIsFirstLoginPasswordStep(true);
      }, 600);
      return;
    }

    setTimeout(() => {
      const loginRes = login(selectedRole, identifier, password, undefined, true);
      if (!loginRes.success) {
        setIsSuccess(false);
        setErrorMsg(loginRes.error || 'Failed to authenticate account.');
        triggerShake();
      }
    }, 700);
  };

  const handleSaveFirstLoginPermanentPassword = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!newPermanentPassword || newPermanentPassword.length < 6) {
      setErrorMsg('New permanent password must be at least 6 characters long.');
      triggerShake();
      return;
    }

    if (firstLoginTargetUser?.tempPasswordProvided && newPermanentPassword === firstLoginTargetUser.tempPasswordProvided) {
      setErrorMsg('Your new permanent password cannot be identical to your temporary password. Please choose a new unique password.');
      triggerShake();
      return;
    }

    if (newPermanentPassword !== confirmPermanentPassword) {
      setErrorMsg('Permanent passwords do not match. Please verify both fields.');
      triggerShake();
      return;
    }

    setIsSavingPermanentPassword(true);

    try {
      if (firstLoginTargetUser) {
        const result = completeFirstTimePasswordChangeAndLogin(
          firstLoginTargetUser.email,
          newPermanentPassword,
          firstLoginTargetUser.role
        );
        if (!result.success) {
          setIsSavingPermanentPassword(false);
          setErrorMsg(result.error || 'Failed to update permanent password.');
          triggerShake();
          return;
        }
        // Authentication completed synchronously. The authenticated portal will mount.
      } else {
        setIsSavingPermanentPassword(false);
        setErrorMsg('User session context not found. Please try logging in again.');
        triggerShake();
      }
    } catch (err: any) {
      setIsSavingPermanentPassword(false);
      setErrorMsg(err?.message || 'Failed to update permanent password.');
      triggerShake();
    }
  };

  const activeEmailForOtp = authMode === 'PRINCIPAL_SIGN_UP' ? principalEmail : identifier;
  const activeRoleLabelForOtp = authMode === 'PRINCIPAL_SIGN_UP' ? 'Principal & Executive Oversight' : currentRoleMeta.label;

  return (
    <div className="relative min-h-[calc(100vh-140px)] py-10 px-4 sm:px-6 lg:px-8 flex flex-col justify-between overflow-hidden">
      {/* Gmail Send Confirmation Dialog */}
      <GmailSendConfirmationModal
        isOpen={showGmailConfirmModal}
        onClose={() => setShowGmailConfirmModal(false)}
        onConfirm={handleConfirmSendGmail}
        recipientEmail={activeEmailForOtp}
        senderEmail={googleUser?.email || 'Connected Gmail Account'}
        otpCode={expectedOtp}
        roleLabel={activeRoleLabelForOtp}
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
          showPassword={showPassword || showMasterCode || showPrincipalPassword}
          inputLength={isOtpStep ? 6 : (authMode === 'PRINCIPAL_SIGN_UP' ? principalEmail.length : identifier.length)}
          isAuthenticating={isLoading || isSendingGmail}
          isSuccess={isSuccess}
          hasError={Boolean(errorMsg)}
        />

        {/* Session Inactivity Timeout Institutional Notification */}
        {sessionExpiredNotification && (
          <div 
            id="session-timeout-login-banner"
            className="mb-4 p-4 rounded-2xl bg-amber-50 border-2 border-amber-400/90 shadow-lg flex items-start gap-3 text-amber-900 animate-in fade-in slide-in-from-top-3"
          >
            <div className="p-2 bg-amber-500/20 rounded-xl border border-amber-400 text-amber-800 shrink-0 mt-0.5">
              <ShieldAlert className="w-5 h-5 text-amber-700" />
            </div>
            <div className="flex-1 text-xs">
              <div className="flex items-center justify-between">
                <span className="font-bold text-amber-950 uppercase tracking-wide text-[11px] flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-amber-500 animate-ping inline-block" />
                  Institutional Security Lockout
                </span>
                <button
                  type="button"
                  onClick={clearSessionExpiredNotification}
                  className="text-amber-700 hover:text-amber-950 font-bold text-sm px-1.5 py-0.5 rounded cursor-pointer"
                  title="Dismiss notice"
                >
                  ✕
                </button>
              </div>
              <p className="mt-1 font-medium text-amber-900 leading-relaxed">
                {sessionExpiredNotification}
              </p>
              <div className="mt-2 flex items-center gap-2 text-[10px] text-amber-800 font-mono">
                <span>FERPA/GDPR Compliance</span>
                <span>•</span>
                <span>Workstation secured against unauthorized record inspection</span>
              </div>
            </div>
          </div>
        )}

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
              <SchoolMascotLogo size="lg" withBackground showGlow interactive />
              <div className="text-left">
                <h2 className="text-lg font-bold font-oskar tracking-wide leading-tight">{schoolName}</h2>
                <p className="text-[11px] text-blue-200 font-medium">Unified Security & Portal Authentication</p>
              </div>
            </div>

            {/* Auth Mode Switcher Tabs */}
            {!isOtpStep && !isFirstLoginPasswordStep && (
              <div className="mt-4 flex items-center justify-center gap-2 p-1 bg-slate-900/60 rounded-xl border border-slate-700/60 max-w-sm mx-auto">
                <button
                  type="button"
                  onClick={() => {
                    setAuthMode('SIGN_IN');
                    setErrorMsg(null);
                  }}
                  className={`flex-1 py-1.5 px-3 rounded-lg text-xs font-semibold transition cursor-pointer flex items-center justify-center gap-1.5 ${
                    authMode === 'SIGN_IN'
                      ? 'bg-blue-600 text-white shadow-xs'
                      : 'text-slate-300 hover:text-white hover:bg-slate-800/50'
                  }`}
                >
                  <KeyRound className="w-3.5 h-3.5" />
                  <span>Sign In</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setAuthMode('PRINCIPAL_SIGN_UP');
                    setErrorMsg(null);
                  }}
                  className={`flex-1 py-1.5 px-3 rounded-lg text-xs font-semibold transition cursor-pointer flex items-center justify-center gap-1.5 ${
                    authMode === 'PRINCIPAL_SIGN_UP'
                      ? 'bg-amber-600 text-white shadow-xs'
                      : 'text-slate-300 hover:text-white hover:bg-slate-800/50'
                  }`}
                >
                  <Crown className="w-3.5 h-3.5 text-amber-300" />
                  <span>Principal Sign Up</span>
                  <span className="text-[9px] bg-amber-400/30 text-amber-200 px-1 py-0.2 rounded font-mono">Master</span>
                </button>
              </div>
            )}

            {/* Micro Badge for active portal */}
            <div className="mt-3 inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-500/20 border border-blue-400/30 text-blue-200 text-xs font-medium">
              {isFirstLoginPasswordStep ? (
                <>
                  <KeyRound className="w-3.5 h-3.5 text-amber-300" />
                  <span>Mandatory Security: <strong>First-Time Password Update</strong></span>
                  <span className="ml-1 bg-amber-400/20 text-amber-300 text-[10px] font-mono px-1.5 py-0.2 rounded border border-amber-400/30">
                    Mandatory
                  </span>
                </>
              ) : authMode === 'PRINCIPAL_SIGN_UP' ? (
                <>
                  <Crown className="w-3.5 h-3.5 text-amber-300" />
                  <span>Executive Role: <strong>Principal Registration</strong></span>
                  <span className="ml-1 bg-amber-400/20 text-amber-300 text-[10px] font-mono px-1.5 py-0.2 rounded border border-amber-400/30">
                    Master Gated
                  </span>
                </>
              ) : (
                <>
                  <currentRoleMeta.icon className="w-3.5 h-3.5 text-blue-300" />
                  <span>Target: <strong>{currentRoleMeta.label}</strong></span>
                  <span className="ml-1 bg-emerald-400/20 text-emerald-300 text-[10px] font-mono px-1.5 py-0.2 rounded border border-emerald-400/30 flex items-center gap-1">
                    <Mail className="w-3 h-3" />
                    <span>Strict Gmail OTP</span>
                  </span>
                </>
              )}
            </div>
          </div>

          {/* Form Body */}
          <div className="p-6 sm:p-7 space-y-5">
            <AnimatePresence mode="wait">
              {isFirstLoginPasswordStep && firstLoginTargetUser ? (
                /* MANDATORY FIRST-TIME LOGIN PASSWORD UPDATE VIEW */
                <motion.div
                  key="first-login-step"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.3 }}
                  className="space-y-4"
                >
                  <div className="p-4 rounded-2xl bg-amber-50 border border-amber-300 text-amber-950 flex items-start gap-3 shadow-xs">
                    <KeyRound className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                    <div className="space-y-1.5 text-xs">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-bold text-amber-950 text-sm">Request New Password at Login</span>
                        <span className="px-2 py-0.5 rounded-full bg-rose-100 text-rose-800 border border-rose-200 font-mono text-[10px] font-extrabold uppercase">
                          Must Be Changed
                        </span>
                        <span className="px-2 py-0.5 rounded-full bg-amber-200/80 text-amber-950 font-mono text-[10px] font-bold">
                          Temporary Credential Used
                        </span>
                      </div>
                      <p className="text-amber-900 leading-relaxed">
                        Welcome, <strong>{firstLoginTargetUser.name}</strong> ({firstLoginTargetUser.position}). 
                        Your account was signed into with an initial <strong>temporary login password</strong>. 
                        In adherence with institutional security compliance, <strong>you must change this temporary password now</strong> before access to your portal workspace is unlocked.
                      </p>
                    </div>
                  </div>

                  <form onSubmit={handleSaveFirstLoginPermanentPassword} className="space-y-4">
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Verified Institutional Account
                      </label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
                        <input
                          type="text"
                          readOnly
                          value={`${firstLoginTargetUser.email} (${firstLoginTargetUser.role})`}
                          className="w-full pl-9 pr-3 py-2 bg-slate-100 border border-slate-200 rounded-xl text-xs font-mono text-slate-600 cursor-not-allowed"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        New Permanent Password <span className="text-rose-500">*</span>
                      </label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
                        <input
                          type={showNewPermanentPassword ? 'text' : 'password'}
                          required
                          minLength={6}
                          value={newPermanentPassword}
                          onChange={(e) => setNewPermanentPassword(e.target.value)}
                          placeholder="Enter your personal permanent password (min 6 chars)"
                          className="w-full pl-9 pr-10 py-2.5 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
                        />
                        <button
                          type="button"
                          onClick={() => setShowNewPermanentPassword(!showNewPermanentPassword)}
                          className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600 cursor-pointer"
                        >
                          {showNewPermanentPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Confirm Permanent Password <span className="text-rose-500">*</span>
                      </label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
                        <input
                          type={showNewPermanentPassword ? 'text' : 'password'}
                          required
                          minLength={6}
                          value={confirmPermanentPassword}
                          onChange={(e) => setConfirmPermanentPassword(e.target.value)}
                          placeholder="Re-type your personal permanent password"
                          className="w-full pl-9 pr-10 py-2.5 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
                        />
                      </div>
                    </div>

                    {/* Password Policy Criteria Checklist */}
                    <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-[11px] text-slate-600 space-y-1">
                      <p className="font-semibold text-slate-800">Permanent Password Policy Requirements:</p>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-1 pt-0.5">
                        <span className={`flex items-center gap-1.5 ${newPermanentPassword.length >= 6 ? 'text-emerald-700 font-bold' : 'text-slate-500'}`}>
                          <Check className="w-3.5 h-3.5" /> Minimum 6 characters
                        </span>
                        <span className={`flex items-center gap-1.5 ${newPermanentPassword && firstLoginTargetUser.tempPasswordProvided && newPermanentPassword !== firstLoginTargetUser.tempPasswordProvided ? 'text-emerald-700 font-bold' : 'text-slate-500'}`}>
                          <Check className="w-3.5 h-3.5" /> Unique from temporary password
                        </span>
                        <span className={`flex items-center gap-1.5 ${confirmPermanentPassword && newPermanentPassword === confirmPermanentPassword ? 'text-emerald-700 font-bold' : 'text-slate-500'}`}>
                          <Check className="w-3.5 h-3.5" /> Both password entries match
                        </span>
                      </div>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-2 pt-1">
                      <button
                        type="button"
                        onClick={() => {
                          setIsFirstLoginPasswordStep(false);
                          setFirstLoginTargetUser(null);
                          setNewPermanentPassword('');
                          setConfirmPermanentPassword('');
                          setPassword('');
                          setErrorMsg(null);
                        }}
                        className="sm:w-1/3 py-2.5 px-3 border border-slate-200 hover:bg-slate-100 text-slate-700 text-xs font-semibold rounded-xl transition cursor-pointer text-center"
                      >
                        Cancel & Return
                      </button>

                      <button
                        type="submit"
                        disabled={isSavingPermanentPassword}
                        className="sm:w-2/3 py-3 px-4 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-md transition flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
                      >
                        {isSavingPermanentPassword ? (
                          <>
                            <motion.div
                              animate={{ rotate: 360 }}
                              transition={{ repeat: Infinity, duration: 0.8, ease: 'linear' }}
                              className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full"
                            />
                            <span>Committing Permanent Password...</span>
                          </>
                        ) : (
                          <>
                            <ShieldCheck className="w-4 h-4" />
                            <span>Save Permanent Password & Enter Portal</span>
                          </>
                        )}
                      </button>
                    </div>
                  </form>
                </motion.div>
              ) : isOtpStep ? (
                /* STEP 2: EMAIL OTP VERIFICATION VIEW */
                <motion.div
                  key="otp-step"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.3 }}
                >
                  <EmailOtpView
                    email={activeEmailForOtp}
                    expectedOtp={expectedOtp}
                    roleLabel={activeRoleLabelForOtp}
                    isSentViaGmail={wasSentViaGmail}
                    gmailSender={googleUser?.email}
                    onVerifySuccess={handleOtpSuccess}
                    onBack={() => {
                      setIsOtpStep(false);
                    }}
                    onResendOtp={() => {
                      generateOtp();
                      setShowGmailConfirmModal(true);
                    }}
                    onShake={triggerShake}
                  />
                </motion.div>
              ) : authMode === 'PRINCIPAL_SIGN_UP' ? (
                /* STEP 1 (B): PRINCIPAL SIGN UP (MASTERCODE GATED) */
                <motion.div
                  key="principal-signup-step"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.3 }}
                  className="space-y-4"
                >
                  {/* Google / Gmail Delivery Bar */}
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                        Gmail OTP Dispatch Account:
                      </span>
                      {isGoogleConnected && (
                        <span className="text-[10px] text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md font-semibold border border-emerald-200 flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                          <span>Connected</span>
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

                  {/* Principal Registration Notice */}
                  <div className="p-3 bg-amber-50/80 border border-amber-200 rounded-2xl text-xs text-amber-900 space-y-1">
                    <div className="flex items-center gap-1.5 font-bold text-amber-950">
                      <Crown className="w-4 h-4 text-amber-600" />
                      <span>Authorized Principal Registration</span>
                    </div>
                    <p className="text-[11px] text-amber-800 leading-relaxed">
                      {!hasPrincipal 
                        ? "Institutional Initialization: No School Principal account is currently registered. Enter a Master Authorization Key (e.g. OSKAR#APEX-2026 or any 6+ character key) to initialize the Principal executive account."
                        : "Only the institutional Principal can register an executive account. You must enter the confidential institutional master authorization key."}
                    </p>
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

                  {/* Principal Registration Form */}
                  <form onSubmit={handlePrincipalSignUp} className="space-y-3.5">
                    {/* Master Authorization Code */}
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center justify-between">
                        <span>Principal Master Authorization Code *</span>
                        <span className="text-[10px] font-medium text-slate-600 bg-slate-100 px-2 py-0.5 rounded-full border border-slate-200 flex items-center gap-1">
                          <Lock className="w-2.5 h-2.5 text-slate-500" />
                          Confidential Key
                        </span>
                      </label>
                      <div className="relative">
                        <input
                          type={showMasterCode ? 'text' : 'password'}
                          value={principalMasterCode}
                          onChange={(e) => {
                            setPrincipalMasterCode(e.target.value);
                            if (errorMsg) setErrorMsg(null);
                          }}
                          placeholder="Enter confidential master authorization key"
                          className="w-full pl-9 pr-10 py-2.5 text-sm bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent font-mono transition"
                        />
                        <ShieldCheck className="w-4 h-4 text-amber-600 absolute left-3 top-3" />
                        <button
                          type="button"
                          onClick={() => setShowMasterCode(!showMasterCode)}
                          className="absolute right-3 top-3 text-slate-400 hover:text-slate-600 cursor-pointer"
                        >
                          {showMasterCode ? <EyeOff className="w-4 h-4 text-amber-600" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                      {!hasPrincipal && (
                        <p className="text-[11px] text-amber-700 mt-1.5 flex items-center gap-1">
                          <ShieldCheck className="w-3.5 h-3.5 shrink-0" />
                          <span>Initial Setup: You can use <button type="button" onClick={() => setPrincipalMasterCode('OSKAR#APEX-2026')} className="font-mono font-semibold underline hover:text-amber-900 cursor-pointer">OSKAR#APEX-2026</button> or any 6+ char master key.</span>
                        </p>
                      )}
                    </div>

                    {/* Principal Full Name */}
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Principal Full Legal Name *
                      </label>
                      <div className="relative">
                        <input
                          type="text"
                          value={principalName}
                          onChange={(e) => {
                            setPrincipalName(e.target.value);
                            if (errorMsg) setErrorMsg(null);
                          }}
                          placeholder="Enter Principal Full Name"
                          className="w-full pl-9 pr-3 py-2.5 text-sm bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent transition"
                        />
                        <User className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                      </div>
                    </div>

                    {/* Principal Email Address (Receives actual Gmail OTP) */}
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center justify-between">
                        <span>Principal Email (Receives Real Gmail OTP) *</span>
                        <span className="text-[10px] text-blue-600 font-semibold bg-blue-50 px-1.5 py-0.5 rounded border border-blue-200">
                          Gmail OTP Delivery
                        </span>
                      </label>
                      <div className="relative">
                        <input
                          type="email"
                          value={principalEmail}
                          onChange={(e) => {
                            setPrincipalEmail(e.target.value);
                            if (errorMsg) setErrorMsg(null);
                          }}
                          placeholder="e.g. principal@oskaracademy.edu or your Gmail"
                          className="w-full pl-9 pr-3 py-2.5 text-sm bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent transition"
                        />
                        <Mail className="w-4 h-4 text-blue-600 absolute left-3 top-3" />
                      </div>
                      <p className="text-[10px] text-slate-500 mt-1">
                        The real 6-digit OTP code will be sent to this email address. You may use your personal Gmail address to verify.
                      </p>
                    </div>

                    {/* Password */}
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Executive Account Password *
                      </label>
                      <div className="relative">
                        <input
                          type={showPrincipalPassword ? 'text' : 'password'}
                          value={principalPassword}
                          onFocus={() => setIsPasswordFocused(true)}
                          onBlur={() => setIsPasswordFocused(false)}
                          onChange={(e) => {
                            setPrincipalPassword(e.target.value);
                            if (errorMsg) setErrorMsg(null);
                          }}
                          placeholder="Create secure password (min 6 chars)"
                          className="w-full pl-9 pr-10 py-2.5 text-sm bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent transition"
                        />
                        <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                        <button
                          type="button"
                          onClick={() => setShowPrincipalPassword(!showPrincipalPassword)}
                          className="absolute right-3 top-3 text-slate-400 hover:text-slate-600 cursor-pointer"
                        >
                          {showPrincipalPassword ? <EyeOff className="w-4 h-4 text-amber-600" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>

                    {/* Confirm Password */}
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Confirm Password *
                      </label>
                      <div className="relative">
                        <input
                          type={showPrincipalPassword ? 'text' : 'password'}
                          value={principalConfirmPassword}
                          onChange={(e) => {
                            setPrincipalConfirmPassword(e.target.value);
                            if (errorMsg) setErrorMsg(null);
                          }}
                          placeholder="Re-type your password"
                          className="w-full pl-9 pr-3 py-2.5 text-sm bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent transition"
                        />
                        <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                      </div>
                    </div>

                    {/* Submit Button for Principal Registration */}
                    <motion.button
                      type="submit"
                      disabled={isLoading || isSendingGmail}
                      whileHover={{ scale: 1.01 }}
                      whileTap={{ scale: 0.99 }}
                      className="w-full py-3 px-4 rounded-xl text-sm font-semibold shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer bg-amber-600 hover:bg-amber-700 disabled:bg-amber-400 text-white mt-2"
                    >
                      {isSendingGmail ? (
                        <div className="flex items-center gap-2">
                          <motion.div
                            animate={{ rotate: 360 }}
                            transition={{ repeat: Infinity, duration: 0.8, ease: 'linear' }}
                            className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full"
                          />
                          <span>Dispatching Real Gmail OTP...</span>
                        </div>
                      ) : (
                        <div className="flex items-center gap-2">
                          <Crown className="w-4 h-4" />
                          <span>
                            {isGoogleConnected && googleUser
                              ? 'Register Principal & Send Gmail OTP'
                              : 'Register Principal Account'}
                          </span>
                          <ArrowRight className="w-4 h-4" />
                        </div>
                      )}
                    </motion.button>

                    <div className="text-center pt-1">
                      <button
                        type="button"
                        onClick={() => {
                          setAuthMode('SIGN_IN');
                          setErrorMsg(null);
                        }}
                        className="text-xs text-blue-600 hover:text-blue-800 font-semibold cursor-pointer underline"
                      >
                        Already have an account? Return to Sign In
                      </button>
                    </div>
                  </form>
                </motion.div>
              ) : (
                /* STEP 1 (A): CREDENTIALS & ROLE SELECTION VIEW */
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
                        Gmail OTP Delivery Service:
                      </span>
                      {isGoogleConnected && (
                        <span className="text-[10px] text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md font-semibold border border-emerald-200 flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                          <span>Live Gmail API Active</span>
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
                      <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                        Strict OTP Protected
                      </span>
                    </div>

                    <div className="space-y-3">
                      {roleCategories.map((cat) => (
                        <div key={cat.title}>
                          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">{cat.title}</p>
                          <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5">
                            {cat.roles.map(({ role, label, icon: Icon }) => {
                              const isSelected = selectedRole === role;
                              const isAdmin = adminLeadershipRoles.includes(role);
                              const isCreated = isAdmin ? institutionalUsers.some(u => u.role === role) : true;
                              const isPrinc = role === 'PRINCIPAL';

                              return (
                                <button
                                  key={role}
                                  type="button"
                                  onClick={() => handleRoleSelect(role)}
                                  className={`relative flex items-center justify-between p-2 rounded-xl text-left border text-xs transition-all cursor-pointer ${
                                    isSelected
                                      ? 'bg-blue-600 text-white font-bold shadow-md border-blue-500'
                                      : isAdmin && !isCreated
                                      ? 'bg-amber-50/60 border-amber-200 text-slate-700 hover:bg-amber-100/60'
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
                                    <Icon className={`w-4 h-4 shrink-0 ${isSelected ? 'text-white' : isAdmin && !isCreated ? 'text-amber-600' : 'text-slate-400'}`} />
                                    <span className="truncate">{label}</span>
                                  </div>

                                  {isPrinc ? (
                                    <span 
                                      className={`text-[9px] px-1.5 py-0.5 rounded font-mono font-bold flex items-center gap-0.5 ${
                                        isSelected 
                                          ? 'bg-blue-800 text-blue-100' 
                                          : hasPrincipal 
                                          ? 'bg-emerald-100 text-emerald-800' 
                                          : 'bg-amber-100 text-amber-800'
                                      }`}
                                    >
                                      {hasPrincipal ? <Check className="w-2.5 h-2.5" /> : null}
                                      {hasPrincipal ? 'Active' : 'Setup'}
                                    </span>
                                  ) : isAdmin ? (
                                    <span 
                                      className={`text-[9px] px-1.5 py-0.5 rounded font-mono font-bold flex items-center gap-0.5 ${
                                        isSelected 
                                          ? isCreated ? 'bg-blue-800 text-blue-100' : 'bg-rose-900 text-rose-100'
                                          : isCreated 
                                          ? 'bg-emerald-100 text-emerald-800' 
                                          : 'bg-rose-50 text-rose-700 border border-rose-200'
                                      }`}
                                    >
                                      {isCreated ? <Check className="w-2.5 h-2.5" /> : <Lock className="w-2.5 h-2.5" />}
                                      {isCreated ? 'Created' : 'Not Created'}
                                    </span>
                                  ) : (
                                    <span 
                                      className={`text-[9px] px-1 py-0.2 rounded font-mono ${isSelected ? 'bg-blue-800 text-blue-200' : 'bg-slate-200 text-slate-500'}`}
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

                  {/* Principal Sign Up Prompt */}
                  {selectedRole === 'PRINCIPAL' && (
                    <div className="p-2.5 bg-amber-50 rounded-xl border border-amber-200 flex items-center justify-between text-xs text-amber-900">
                      <div className="flex items-center gap-2">
                        <Crown className="w-4 h-4 text-amber-600 shrink-0" />
                        <span>Registering as new Principal?</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          setAuthMode('PRINCIPAL_SIGN_UP');
                          setErrorMsg(null);
                        }}
                        className="font-bold text-amber-800 hover:text-amber-950 underline cursor-pointer"
                      >
                        Sign Up with Master Code
                      </button>
                    </div>
                  )}

                  {/* Account Not Created by Principal Banner */}
                  {isSelectedRoleAdmin && !isSelectedRoleProvisionedByPrincipal && (
                    <div className="p-3.5 bg-amber-50 rounded-2xl border-2 border-amber-300 text-amber-950 shadow-xs">
                      <div className="flex items-start gap-2.5">
                        <div className="w-7 h-7 rounded-lg bg-amber-200 text-amber-900 flex items-center justify-center shrink-0 mt-0.5 font-bold">
                          <Lock className="w-4 h-4" />
                        </div>
                        <div className="space-y-1 text-xs flex-1">
                          <div className="flex items-center justify-between gap-2">
                            <span className="font-bold text-sm text-amber-950">
                              Account Not Created by Principal
                            </span>
                            <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-md bg-amber-200 text-amber-900 border border-amber-300">
                              Login Restricted
                            </span>
                          </div>
                          <p className="text-amber-900/90 leading-relaxed text-xs">
                            This account should only be created by the Principal. Because no account has been provisioned for <strong>{currentRoleMeta.label}</strong> yet, login is restricted until the Principal creates it from the <em>User Provisioning</em> portal.
                          </p>
                          <div className="pt-1.5 flex flex-wrap items-center gap-2">
                            {hasPrincipal ? (
                              <button
                                type="button"
                                onClick={() => handleRoleSelect('PRINCIPAL')}
                                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs shadow transition cursor-pointer"
                              >
                                <Crown className="w-3.5 h-3.5 text-amber-400" />
                                <span>Log in as Principal to Provision Account</span>
                              </button>
                            ) : (
                              <button
                                type="button"
                                onClick={() => {
                                  setAuthMode('PRINCIPAL_SIGN_UP');
                                  setErrorMsg(null);
                                }}
                                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs shadow transition cursor-pointer"
                              >
                                <Crown className="w-3.5 h-3.5" />
                                <span>Set Up Principal Account First</span>
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Account Authorized & Created by Principal Badge */}
                  {isSelectedRoleAdmin && isSelectedRoleProvisionedByPrincipal && provisionedAdminUser && (
                    <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200 text-emerald-950 text-xs flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                        <div>
                          <span className="font-bold text-emerald-900">Account Authorized by Principal: </span>
                          <span className="text-emerald-800">{provisionedAdminUser.name} ({provisionedAdminUser.email})</span>
                        </div>
                      </div>
                      <span className="text-[10px] font-mono font-bold text-emerald-700 bg-emerald-100 px-1.5 py-0.5 rounded">
                        Ready
                      </span>
                    </div>
                  )}

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
                          Institutional Email (Receives Live Gmail OTP) *
                        </label>
                        <span className="text-[10px] text-blue-600 font-semibold bg-blue-50 px-1.5 py-0.5 rounded border border-blue-200 flex items-center gap-1">
                          <Mail className="w-3 h-3" />
                          <span>Strict Live Gmail OTP</span>
                        </span>
                      </div>
                      <div className="relative">
                        <input
                          type="text"
                          disabled={isSelectedRoleAdmin && !isSelectedRoleProvisionedByPrincipal}
                          value={identifier}
                          onChange={(e) => {
                            setIdentifier(e.target.value);
                            if (errorMsg) setErrorMsg(null);
                          }}
                          placeholder={
                            isSelectedRoleAdmin && !isSelectedRoleProvisionedByPrincipal
                              ? 'Account must be created by Principal first'
                              : `e.g. ${currentRoleMeta.hintId} or your Gmail`
                          }
                          className={`w-full pl-9 pr-3 py-2.5 text-sm rounded-xl transition ${
                            isSelectedRoleAdmin && !isSelectedRoleProvisionedByPrincipal
                              ? 'bg-slate-100 border border-slate-200 text-slate-400 cursor-not-allowed'
                              : 'bg-slate-50 border border-slate-300 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent'
                          }`}
                        />
                        <UserCheck className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                        {identifier && !isSelectedRoleAdmin && (
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
                        <span>Role Email: <strong className="text-slate-600 font-mono">{currentRoleMeta.hintId}</strong></span>
                        <span className="text-[10px] text-blue-600 font-medium">{currentRoleMeta.description}</span>
                      </p>
                      <p className="text-[10px] text-slate-500 mt-0.5">
                        Tip: You may enter your active Gmail address (e.g. nexgriddigital@gmail.com) to receive the live code in your inbox.
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
                          disabled={isSelectedRoleAdmin && !isSelectedRoleProvisionedByPrincipal}
                          value={password}
                          onFocus={() => setIsPasswordFocused(true)}
                          onBlur={() => setIsPasswordFocused(false)}
                          onChange={(e) => {
                            setPassword(e.target.value);
                            if (errorMsg) setErrorMsg(null);
                          }}
                          placeholder={
                            isSelectedRoleAdmin && !isSelectedRoleProvisionedByPrincipal
                              ? 'Login blocked until account is created'
                              : 'Enter security password'
                          }
                          className={`w-full pl-9 pr-10 py-2.5 text-sm rounded-xl transition ${
                            isSelectedRoleAdmin && !isSelectedRoleProvisionedByPrincipal
                              ? 'bg-slate-100 border border-slate-200 text-slate-400 cursor-not-allowed'
                              : 'bg-slate-50 border border-slate-300 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent'
                          }`}
                        />
                        <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                        <button
                          type="button"
                          disabled={isSelectedRoleAdmin && !isSelectedRoleProvisionedByPrincipal}
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3 top-3 text-slate-400 hover:text-slate-600 transition cursor-pointer disabled:cursor-not-allowed"
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
                          All logins strictly require 6-digit email OTP verification. Codes are dispatched live via Google Workspace Gmail API integration.
                        </p>
                      </div>
                    </div>

                    {/* Submit Button with Dynamic Animation */}
                    {isSelectedRoleAdmin && !isSelectedRoleProvisionedByPrincipal ? (
                      <div className="space-y-2">
                        <button
                          type="button"
                          disabled
                          className="w-full py-3 px-4 rounded-xl text-xs font-bold bg-slate-100 text-slate-400 cursor-not-allowed flex items-center justify-center gap-2 border border-slate-200 shadow-none"
                        >
                          <Lock className="w-4 h-4 text-slate-400" />
                          <span>Account Not Created by Principal (Login Blocked)</span>
                        </button>
                        <p className="text-[11px] text-center text-slate-500">
                          To access this department, the Principal must first provision the account from the Executive Portal.
                        </p>
                      </div>
                    ) : (
                      <motion.button
                        type="submit"
                        disabled={isLoading || isSuccess || isSendingGmail}
                        whileHover={!isLoading && !isSuccess ? { scale: 1.01 } : {}}
                        whileTap={!isLoading && !isSuccess ? { scale: 0.99 } : {}}
                        className={`w-full py-3 px-4 rounded-xl text-sm font-semibold shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer ${
                          isSuccess
                            ? 'bg-emerald-600 text-white'
                            : 'bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white'
                        }`}
                      >
                        {isLoading || isSendingGmail ? (
                          <div className="flex items-center gap-2">
                            <motion.div
                              animate={{ rotate: 360 }}
                              transition={{ repeat: Infinity, duration: 0.8, ease: 'linear' }}
                              className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full"
                            />
                            <span>Dispatching Real Gmail OTP...</span>
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
                            <Mail className="w-4 h-4" />
                            <span>
                              {isSelectedRoleAdmin && provisionedAdminUser
                                ? `Sign In as ${provisionedAdminUser.name}`
                                : 'Send OTP via Gmail & Verify'}
                            </span>
                            <ArrowRight className="w-4 h-4" />
                          </div>
                        )}
                      </motion.button>
                    )}
                  </form>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Login Card Watermark & Legal Footer - STRICTLY UNDER LOGIN CARD ONLY */}
          <div className="bg-slate-50/90 border-t border-slate-100 px-6 py-3 flex flex-wrap items-center justify-between gap-2 text-[11px] text-slate-500">
            <div className="flex items-center gap-1.5 font-medium text-slate-700">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block" />
              <span>Designed and Developed by NexGrid Digital Systems</span>
            </div>

            <div className="flex items-center gap-3">
              {onOpenTerms && (
                <button
                  type="button"
                  onClick={onOpenTerms}
                  className="text-blue-600 hover:text-blue-800 font-semibold underline cursor-pointer"
                >
                  Terms & Conditions
                </button>
              )}
              <span>•</span>
              {onOpenManual && (
                <button
                  type="button"
                  onClick={onOpenManual}
                  className="text-amber-700 hover:text-amber-900 font-semibold underline cursor-pointer"
                >
                  System Manual (PDF)
                </button>
              )}
            </div>
          </div>
        </motion.div>
      </div>

      {/* Password Reset Request Modal */}
      <PasswordResetRequestModal
        isOpen={showResetModal}
        onClose={() => setShowResetModal(false)}
        defaultIdentifier={identifier}
      />
    </div>
  );
};
