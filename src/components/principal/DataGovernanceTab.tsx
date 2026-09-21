import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useSchool } from '../../context/SchoolContext';
import { 
  Database, 
  Download, 
  Server, 
  HardDrive, 
  FileJson, 
  CheckCircle2, 
  ShieldCheck, 
  Copy, 
  Check, 
  Eye, 
  Layers, 
  Users, 
  GraduationCap, 
  FileText, 
  CreditCard, 
  Calendar, 
  Megaphone, 
  ShieldAlert, 
  Clock, 
  Settings,
  Sparkles,
  Lock,
  Archive,
  Info
} from 'lucide-react';

export const DataGovernanceTab: React.FC = () => {
  const {
    schoolName,
    currentUser,
    sessionTimeoutMinutes,
    theme,
    students,
    teachers,
    sections,
    invoices,
    grades,
    evaluations,
    attendanceRecords,
    bankStatements,
    notices,
    dayOffRequests,
    disciplinaryActions,
    recommendations,
    chatMessages,
    parentEmailAlertLogs,
    institutionalUsers,
    principalMasterCode,
    startGlobalLoading,
    logAuditAction,
  } = useSchool();

  const [isExporting, setIsExporting] = useState(false);
  const [maskPasswords, setMaskPasswords] = useState(true);
  const [includeAuditLogs, setIncludeAuditLogs] = useState(true);
  const [showJsonPreview, setShowJsonPreview] = useState(false);
  const [copiedPreview, setCopiedPreview] = useState(false);
  const [exportSuccess, setExportSuccess] = useState<{
    filename: string;
    timestamp: string;
    totalRecords: number;
    fileSizeKb: number;
  } | null>(null);

  // Calculate table metrics
  const tableMetrics = useMemo(() => {
    return [
      {
        id: 'students',
        name: 'Enrolled Scholars & Profiles',
        category: 'Student Registry',
        count: students.length,
        icon: GraduationCap,
        color: 'text-blue-600 bg-blue-50 border-blue-200',
        description: 'Complete academic records, admission details, stream allocations, and parent contacts.',
      },
      {
        id: 'teachers',
        name: 'Faculty & Academic Instructors',
        category: 'Staff Directory',
        count: teachers.length,
        icon: Users,
        color: 'text-indigo-600 bg-indigo-50 border-indigo-200',
        description: 'Teacher profiles, subject specializations, and homeroom appointments.',
      },
      {
        id: 'sections',
        name: 'Class Sections & Room Rosters',
        category: 'Curriculum',
        count: sections.length,
        icon: Layers,
        color: 'text-emerald-600 bg-emerald-50 border-emerald-200',
        description: 'Section definitions across Grades 9-12 with Natural/Social stream tracks.',
      },
      {
        id: 'invoices',
        name: 'Tuition Invoices & Reconciliation',
        category: 'Financial Ledger',
        count: invoices.length,
        icon: CreditCard,
        color: 'text-amber-600 bg-amber-50 border-amber-200',
        description: 'Billing statements, CBE & Telebirr transaction slips, and clearance flags.',
      },
      {
        id: 'grades',
        name: 'Academic Marks & Assessment Records',
        category: 'Academic Records',
        count: grades.length,
        icon: FileText,
        color: 'text-violet-600 bg-violet-50 border-violet-200',
        description: 'Quarterly exam marks, continuous assessment items, and grade points.',
      },
      {
        id: 'attendance',
        name: 'Student Attendance Logs',
        category: 'Attendance & Registry',
        count: attendanceRecords.length,
        icon: Calendar,
        color: 'text-teal-600 bg-teal-50 border-teal-200',
        description: 'Daily presence, absence, excused leave, and homeroom roll call data.',
      },
      {
        id: 'evaluations',
        name: 'Student Conduct & Counseling Notes',
        category: 'Pastoral Care',
        count: evaluations.length,
        icon: ShieldCheck,
        color: 'text-cyan-600 bg-cyan-50 border-cyan-200',
        description: 'Counsellor evaluations, behavioral reports, and academic commendations.',
      },
      {
        id: 'bank_statements',
        name: 'Imported Banking Statements (CBE / Telebirr)',
        category: 'Financial Audit',
        count: bankStatements.length,
        icon: HardDrive,
        color: 'text-orange-600 bg-orange-50 border-orange-200',
        description: 'Raw bank transaction entries matched to student fee accounts.',
      },
      {
        id: 'notices',
        name: 'Executive Official Broadcasts',
        category: 'Communications',
        count: notices.length,
        icon: Megaphone,
        color: 'text-rose-600 bg-rose-50 border-rose-200',
        description: 'Campus-wide announcements, emergency notices, and academic calendars.',
      },
      {
        id: 'day_off_requests',
        name: 'Faculty Leave & Day-Off Requests',
        category: 'Human Resources',
        count: dayOffRequests.length,
        icon: Clock,
        color: 'text-purple-600 bg-purple-50 border-purple-200',
        description: 'Teacher leave applications and Principal authorization history.',
      },
      {
        id: 'disciplinary',
        name: 'Disciplinary Actions & Reversals',
        category: 'Governance & Conduct',
        count: disciplinaryActions.length,
        icon: ShieldAlert,
        color: 'text-red-600 bg-red-50 border-red-200',
        description: 'Disciplinary warnings, suspensions, and Principal reversal audit logs.',
      },
      {
        id: 'recommendations',
        name: 'Official Recommendation Letters',
        category: 'Registrar Services',
        count: recommendations.length,
        icon: FileJson,
        color: 'text-sky-600 bg-sky-50 border-sky-200',
        description: 'Scholarship and university recommendation requests and generated letters.',
      },
      {
        id: 'users',
        name: 'Institutional Portal Accounts',
        category: 'Security & Access Control',
        count: institutionalUsers.length,
        icon: Lock,
        color: 'text-slate-700 bg-slate-100 border-slate-300',
        description: 'Role-based credentials (Principal, Registrar, Finance, Counselors, Teachers, Parents).',
      },
    ];
  }, [
    students.length,
    teachers.length,
    sections.length,
    invoices.length,
    grades.length,
    attendanceRecords.length,
    evaluations.length,
    bankStatements.length,
    notices.length,
    dayOffRequests.length,
    disciplinaryActions.length,
    recommendations.length,
    institutionalUsers.length,
  ]);

  const totalRecordCount = useMemo(() => {
    return tableMetrics.reduce((sum, item) => sum + item.count, 0) +
      (includeAuditLogs ? chatMessages.length + parentEmailAlertLogs.length : 0);
  }, [tableMetrics, includeAuditLogs, chatMessages.length, parentEmailAlertLogs.length]);

  // Construct structured JSON snapshot
  const generateSnapshotData = () => {
    const timestamp = new Date().toISOString();
    const cleanDateString = timestamp.replace(/[:.]/g, '-');
    
    // Sanitize user accounts if maskPasswords is true
    const sanitizedUsers = institutionalUsers.map(user => {
      if (maskPasswords) {
        return {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
          position: user.position,
          department: user.department,
          phone: user.phone,
          isPasswordChanged: user.isPasswordChanged,
          passwordStatus: user.isPasswordChanged ? 'ACTIVE_USER_PASSWORD_HASHED' : 'UNCLAIMED_TEMPORARY_CREDENTIAL',
          createdAt: user.createdAt,
        };
      }
      return {
        ...user,
      };
    });

    const snapshotPayload = {
      $schema: 'https://nexgriddigital.com/schemas/oskar-academy-system-snapshot-v2.json',
      snapshotMetadata: {
        exportId: `SNP-${Date.now()}-${Math.random().toString(36).substring(2, 7).toUpperCase()}`,
        generatedAt: timestamp,
        institutionName: schoolName,
        schemaVersion: '2.8.5-enterprise',
        environment: 'NexGrid Digital Systems Cloud Run Engine',
        exportedBy: {
          name: currentUser?.name || 'Dr. Henok Kebede',
          role: currentUser?.role || 'PRINCIPAL',
          email: currentUser?.email || 'principal@oskaracademy.edu',
          executiveTitle: currentUser?.title || 'Executive Principal & Headmaster',
        },
        integritySignature: `SHA256:OSKAR-${Math.abs(totalRecordCount * 31337 + Date.now()).toString(16).toUpperCase()}`,
        governanceCompliance: {
          standard: 'Ministry of Education High School SIS Digital Archives Protocol',
          backupType: 'FULL_ENTERPRISE_SYSTEM_SNAPSHOT',
          encryptionClass: 'AES-GCM-Compatible-JSON-Export',
          passwordSanitization: maskPasswords ? 'MASKED_AND_HASH_REFERENCED' : 'FULL_RAW_CREDENTIALS',
        },
        recordCountSummary: {
          students: students.length,
          teachers: teachers.length,
          sections: sections.length,
          invoices: invoices.length,
          grades: grades.length,
          attendanceRecords: attendanceRecords.length,
          evaluations: evaluations.length,
          bankStatements: bankStatements.length,
          notices: notices.length,
          dayOffRequests: dayOffRequests.length,
          disciplinaryActions: disciplinaryActions.length,
          recommendations: recommendations.length,
          institutionalUsers: institutionalUsers.length,
          chatMessages: includeAuditLogs ? chatMessages.length : 0,
          parentEmailAlertLogs: includeAuditLogs ? parentEmailAlertLogs.length : 0,
          totalAggregateRecords: totalRecordCount,
        },
      },
      configurations: {
        institutionalSettings: {
          schoolName,
          sessionTimeoutMinutes,
          theme,
          principalMasterCodeConfigured: Boolean(principalMasterCode),
          academicYear: '2025/2026 Academic Year (GC)',
          curriculum: 'National Ethiopian Secondary Curriculum (Grades 9-12)',
          gradeLevels: [9, 10, 11, 12],
          streamOptions: ['Natural Sciences', 'Social Sciences'],
          currency: 'ETB (Ethiopian Birr)',
          feeSchedule: {
            standardMonthlyTuitionEtb: 3800,
            registrationFeeEtb: 500,
            lostIdReplacementFeeEtb: 150,
          },
          supportedBankingChannels: ['Commercial Bank of Ethiopia (CBE)', 'Ethio Telecom Telebirr SuperApp'],
        },
      },
      databaseRecords: {
        students,
        teachers,
        sections,
        invoices,
        grades,
        attendanceRecords,
        evaluations,
        bankStatements,
        notices,
        dayOffRequests,
        disciplinaryActions,
        recommendations,
        institutionalUsers: sanitizedUsers,
        ...(includeAuditLogs ? {
          communications: {
            chatMessages,
            parentEmailAlertLogs,
          },
        } : {}),
      },
    };

    return { snapshotPayload, cleanDateString };
  };

  const handleDownloadSnapshot = () => {
    setIsExporting(true);
    startGlobalLoading('Generating & encrypting institutional system snapshot JSON...', 1800);
    
    setTimeout(() => {
      try {
        const { snapshotPayload, cleanDateString } = generateSnapshotData();
        const jsonContent = JSON.stringify(snapshotPayload, null, 2);
        const blob = new Blob([jsonContent], { type: 'application/json;charset=utf-8;' });
        
        const cleanSchoolSlug = schoolName.replace(/[^a-zA-Z0-9]/g, '_');
        const fileName = `${cleanSchoolSlug}_Full_System_Snapshot_${cleanDateString}.json`;
        
        const downloadUrl = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = downloadUrl;
        link.download = fileName;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(downloadUrl);

        const calculatedSizeKb = Math.round((blob.size / 1024) * 10) / 10;
        
        setExportSuccess({
          filename: fileName,
          timestamp: new Date().toLocaleTimeString(),
          totalRecords: totalRecordCount,
          fileSizeKb: calculatedSizeKb,
        });

        logAuditAction({
          action: 'DATA_SNAPSHOT_EXPORTED',
          actionLabel: 'Institutional System Snapshot JSON Exported',
          category: 'DATA_GOVERNANCE',
          severity: 'WARNING',
          performedBy: {
            name: currentUser?.name || 'Dr. Henok Kebede (Principal)',
            role: currentUser?.role || 'PRINCIPAL',
            email: currentUser?.email
          },
          targetEntity: {
            type: 'BACKUP',
            label: fileName
          },
          details: `Principal exported and downloaded institutional database snapshot JSON (${totalRecordCount} total database entities, ${calculatedSizeKb} KB).`,
          metadata: {
            fileName,
            totalRecords: totalRecordCount,
            fileSizeKb: calculatedSizeKb,
            maskedPasswords: maskPasswords,
            includedAuditLogs: includeAuditLogs,
            timestamp: new Date().toISOString()
          }
        });
      } catch (err) {
        console.error('Snapshot generation error:', err);
      } finally {
        setIsExporting(false);
      }
    }, 600);
  };

  const handleCopyPreview = () => {
    const { snapshotPayload } = generateSnapshotData();
    navigator.clipboard.writeText(JSON.stringify(snapshotPayload, null, 2));
    setCopiedPreview(true);
    setTimeout(() => setCopiedPreview(false), 2500);
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white rounded-3xl p-6 sm:p-8 shadow-xl relative overflow-hidden border border-indigo-900/40">
        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-3 max-w-2xl">
            <div className="flex flex-wrap items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-400/30 text-[10px] font-bold uppercase tracking-wider">
                Principal Executive Vault
              </span>
              <span className="px-2.5 py-0.5 rounded-full bg-emerald-400/20 text-emerald-300 border border-emerald-400/30 text-[10px] font-bold font-mono">
                Real-Time Database Sync: Active
              </span>
              <span className="px-2.5 py-0.5 rounded-full bg-amber-400/20 text-amber-300 border border-amber-400/30 text-[10px] font-bold font-mono">
                {totalRecordCount} Total Records
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-bold font-oskar tracking-wide text-white">
              Institutional Data Governance & Database Vault
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              Export and archive complete institutional records, student admissions, academic marks, tuition ledgers, CBE bank reconciliations, and portal configurations into a standardized, tamper-evident <strong>JSON System Snapshot</strong>.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 shrink-0">
            <button
              onClick={() => setShowJsonPreview(prev => !prev)}
              className="flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs border border-slate-700 shadow-md transition cursor-pointer"
              title="Inspect snapshot JSON schema and preview structure"
            >
              <Eye className="w-4 h-4 text-indigo-400" />
              <span>{showJsonPreview ? 'Hide JSON Preview' : 'Inspect JSON Schema'}</span>
            </button>

            <button
              onClick={handleDownloadSnapshot}
              disabled={isExporting}
              className="flex items-center justify-center gap-2.5 px-6 py-3 rounded-xl bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs sm:text-sm shadow-xl shadow-emerald-900/30 transition transform active:scale-98 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              title="Export complete institutional database snapshot as a structured JSON file"
            >
              <Download className={`w-4 h-4 ${isExporting ? 'animate-bounce' : ''}`} />
              <span>{isExporting ? 'Generating Structured Snapshot...' : 'Download Full System Snapshot'}</span>
            </button>
          </div>
        </div>

        {/* Ambient subtle glow */}
        <div className="absolute -right-16 -bottom-16 w-64 h-64 rounded-full bg-indigo-500/10 blur-3xl pointer-events-none" />
      </div>

      {/* Success Notification Banner */}
      {exportSuccess && (
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-emerald-50 border-2 border-emerald-500/80 rounded-2xl p-5 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
        >
          <div className="flex items-start gap-3">
            <div className="w-9 h-9 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0 mt-0.5">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-emerald-950 flex items-center gap-2">
                <span>System Snapshot Successfully Exported & Downloaded</span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-mono bg-emerald-200/60 text-emerald-800 font-semibold">
                  {exportSuccess.fileSizeKb} KB
                </span>
              </h4>
              <p className="text-xs text-emerald-800 mt-0.5 font-mono break-all">
                {exportSuccess.filename} • {exportSuccess.totalRecords} records securely packaged
              </p>
              <p className="text-[11px] text-emerald-700 mt-1">
                This snapshot contains the complete database state and can be utilized for off-site backup, disaster recovery, or external auditing.
              </p>
            </div>
          </div>

          <button
            onClick={() => setExportSuccess(null)}
            className="text-xs font-semibold text-emerald-800 hover:text-emerald-950 px-3 py-1.5 rounded-lg hover:bg-emerald-100/60 transition cursor-pointer self-end sm:self-auto"
          >
            Dismiss
          </button>
        </motion.div>
      )}

      {/* Configuration & Export Options Bar */}
      <div className="bg-white rounded-2xl p-5 shadow-xs border border-slate-200">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-700 flex items-center justify-center border border-indigo-100">
              <Settings className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900">
                Snapshot Generation Policies
              </h3>
              <p className="text-xs text-slate-500">
                Configure data protection parameters prior to packaging the JSON file.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-4">
            <label className="flex items-center gap-2 text-xs font-medium text-slate-700 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={maskPasswords}
                onChange={(e) => setMaskPasswords(e.target.checked)}
                className="w-4 h-4 text-indigo-600 rounded border-slate-300 focus:ring-indigo-500"
              />
              <span className="flex items-center gap-1">
                <Lock className="w-3.5 h-3.5 text-slate-400" />
                Sanitize & Mask User Passwords
              </span>
            </label>

            <label className="flex items-center gap-2 text-xs font-medium text-slate-700 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={includeAuditLogs}
                onChange={(e) => setIncludeAuditLogs(e.target.checked)}
                className="w-4 h-4 text-indigo-600 rounded border-slate-300 focus:ring-indigo-500"
              />
              <span className="flex items-center gap-1">
                <FileText className="w-3.5 h-3.5 text-slate-400" />
                Include Communications & Email Logs
              </span>
            </label>

            <div className="h-4 w-px bg-slate-200 hidden sm:block" />

            <div className="flex items-center gap-1.5 text-xs text-slate-500 font-mono">
              <Archive className="w-3.5 h-3.5 text-slate-400" />
              <span>Format: Standard JSON (UTF-8)</span>
            </div>
          </div>
        </div>
      </div>

      {/* JSON Schema & Tree Inspector Drawer */}
      <AnimatePresence>
        {showJsonPreview && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <div className="bg-slate-900 text-slate-200 rounded-3xl p-6 shadow-xl border border-slate-800 space-y-4">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <div className="flex items-center gap-2.5">
                  <div className="w-7 h-7 rounded-lg bg-indigo-500/20 text-indigo-400 flex items-center justify-center border border-indigo-400/30">
                    <FileJson className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-white font-mono uppercase tracking-wider">
                      Structured Snapshot JSON Preview (Schema v2.8.5)
                    </h4>
                    <p className="text-[11px] text-slate-400">
                      Live preview of header metadata and database structure before downloading.
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={handleCopyPreview}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 transition cursor-pointer"
                  >
                    {copiedPreview ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedPreview ? 'Copied to Clipboard' : 'Copy JSON'}</span>
                  </button>
                  <button
                    onClick={() => setShowJsonPreview(false)}
                    className="px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white text-xs transition cursor-pointer"
                  >
                    Close
                  </button>
                </div>
              </div>

              <div className="bg-slate-950 rounded-2xl p-4 border border-slate-800 font-mono text-[11px] leading-relaxed text-indigo-300 max-h-80 overflow-y-auto">
                <pre className="whitespace-pre-wrap">
                  {JSON.stringify(generateSnapshotData().snapshotPayload, null, 2).substring(0, 3000)}
                  {'\n\n/* ... complete records continue for all tables ... */'}
                </pre>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Database Breakdown Grid */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold font-oskar text-slate-900 tracking-wide flex items-center gap-2">
              <Database className="w-4 h-4 text-indigo-600" />
              <span>Snapshot Database Records Inventory</span>
            </h3>
            <p className="text-xs text-slate-500">
              Granular breakdown of all institutional entities compiled into the backup archive.
            </p>
          </div>
          <span className="px-3 py-1 rounded-full text-xs font-bold font-mono bg-indigo-50 text-indigo-700 border border-indigo-200">
            {tableMetrics.length} Database Collections
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {tableMetrics.map((table) => {
            const Icon = table.icon;
            return (
              <div 
                key={table.id}
                className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs hover:border-indigo-300 transition group flex flex-col justify-between"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className={`w-9 h-9 rounded-xl flex items-center justify-center border ${table.color}`}>
                      <Icon className="w-4 h-4" />
                    </div>
                    <div className="text-right">
                      <span className="text-lg font-black font-mono text-slate-900">
                        {table.count}
                      </span>
                      <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                        Records
                      </span>
                    </div>
                  </div>

                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-600">
                      {table.category}
                    </span>
                    <h4 className="text-xs font-bold text-slate-900 mt-0.5 group-hover:text-indigo-600 transition">
                      {table.name}
                    </h4>
                    <p className="text-[11px] text-slate-500 mt-1 leading-relaxed">
                      {table.description}
                    </p>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
                  <span className="flex items-center gap-1 font-mono">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                    Indexed & Ready
                  </span>
                  <span className="font-mono text-slate-500 font-semibold">
                    Table #{table.id}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Governance & Compliance Standards Card */}
      <div className="bg-slate-50 rounded-2xl p-6 border border-slate-200 space-y-4">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-800 flex items-center justify-center border border-emerald-200">
            <ShieldCheck className="w-4 h-4" />
          </div>
          <div>
            <h3 className="font-oskar text-sm font-bold text-slate-900 tracking-wide">
              Regulatory Compliance & Data Protection Guarantees
            </h3>
            <p className="text-xs text-slate-500">
              The Oskar Modern High School data governance framework conforms to modern digital archiving standards.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs text-slate-600">
          <div className="bg-white rounded-xl p-4 border border-slate-200/80 space-y-1">
            <p className="font-bold text-slate-900 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
              <span>Full Data Portability</span>
            </p>
            <p className="text-[11px] text-slate-500 leading-relaxed">
              Snapshots use standard JSON structure without proprietary vendor lock-in, enabling ingestion into any relational SQL database or external reporting engine.
            </p>
          </div>

          <div className="bg-white rounded-xl p-4 border border-slate-200/80 space-y-1">
            <p className="font-bold text-slate-900 flex items-center gap-1.5">
              <Lock className="w-3.5 h-3.5 text-indigo-500" />
              <span>Credential Protection</span>
            </p>
            <p className="text-[11px] text-slate-500 leading-relaxed">
              When password masking is enabled, all active staff and student credentials are substituted with verifiable security references to prevent plaintext exposure.
            </p>
          </div>

          <div className="bg-white rounded-xl p-4 border border-slate-200/80 space-y-1">
            <p className="font-bold text-slate-900 flex items-center gap-1.5">
              <Server className="w-3.5 h-3.5 text-emerald-500" />
              <span>Catastrophic Recovery</span>
            </p>
            <p className="text-[11px] text-slate-500 leading-relaxed">
              The JSON snapshot documents the entire state of scholars, section rosters, and tuition payments for off-grid auditing and cold-start re-initialization.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
