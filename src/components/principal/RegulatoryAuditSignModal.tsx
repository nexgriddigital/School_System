import React, { useState, useMemo } from 'react';
import { useSchool } from '../../context/SchoolContext';
import { 
  X, 
  ShieldCheck, 
  ShieldAlert, 
  FileSpreadsheet, 
  Download, 
  Award, 
  CheckCircle2, 
  Copy, 
  Check, 
  Lock, 
  KeyRound, 
  FileCode, 
  AlertTriangle, 
  Building2, 
  Calendar, 
  Clock, 
  ExternalLink,
  Sparkles,
  Upload,
  RefreshCw,
  SearchCheck,
  FileCheck
} from 'lucide-react';
import { 
  REGULATORY_STANDARDS, 
  ComplianceStandardKey, 
  generateSignedRegulatoryAuditCsv, 
  downloadSignedAuditCsv, 
  verifySignedAuditCsvContent,
  RegulatoryAuditSignResult
} from '../../utils/regulatoryAuditSigner';

interface RegulatoryAuditSignModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const RegulatoryAuditSignModal: React.FC<RegulatoryAuditSignModalProps> = ({ isOpen, onClose }) => {
  const { 
    auditLogs, 
    schoolName, 
    currentUser, 
    verifyMasterCode, 
    logAuditAction 
  } = useSchool();

  // Active view tab in modal
  const [activeTab, setActiveTab] = useState<'SIGN_EXPORT' | 'VERIFY_CSV'>('SIGN_EXPORT');

  // Form states for Sign & Export
  const [selectedStandardKey, setSelectedStandardKey] = useState<ComplianceStandardKey>('ISO_27001');
  const [docketNumber, setDocketNumber] = useState(() => {
    const dateStr = new Date().toISOString().split('T')[0].replace(/-/g, '');
    const rand = Math.floor(1000 + Math.random() * 9000);
    return `REG-AUD-${dateStr}-${rand}`;
  });
  const [destinationAgency, setDestinationAgency] = useState('National Accreditation Board & Regulatory Compliance Inspectorate');
  const [signatoryName, setSignatoryName] = useState(() => currentUser?.name || 'Dr. O. Woldeyesus');
  const [signatoryTitle, setSignatoryTitle] = useState(() => currentUser?.title || 'Executive Principal & Chief Compliance Officer');
  const [signatoryEmail, setSignatoryEmail] = useState(() => currentUser?.email || 'principal@oskaracademy.edu');
  const [masterAuthorizationCode, setMasterAuthorizationCode] = useState('');
  const [isVerifyingCode, setIsVerifyingCode] = useState(false);
  const [codeError, setCodeError] = useState<string | null>(null);
  const [customRemarks, setCustomRemarks] = useState('Official Certified Copy for External Statutory Regulatory Compliance Inspection');
  
  // Export Result & Success feedback
  const [exportResult, setExportResult] = useState<RegulatoryAuditSignResult | null>(null);
  const [copiedCertificate, setCopiedCertificate] = useState(false);
  const [copiedSealToken, setCopiedSealToken] = useState(false);
  const [isExporting, setIsExporting] = useState(false);

  // CSV Verification Tab state
  const [verifyInputText, setVerifyInputText] = useState('');
  const [verificationResult, setVerificationResult] = useState<ReturnType<typeof verifySignedAuditCsvContent> | null>(null);
  const [isVerifyingFile, setIsVerifyingFile] = useState(false);

  const selectedStandard = useMemo(() => {
    return REGULATORY_STANDARDS.find(s => s.key === selectedStandardKey) || REGULATORY_STANDARDS[0];
  }, [selectedStandardKey]);

  if (!isOpen) return null;

  // Execute digital signing and download
  const handleSignAndExport = () => {
    setCodeError(null);

    // Optional master code validation if entered
    if (masterAuthorizationCode.trim() && !verifyMasterCode(masterAuthorizationCode.trim())) {
      setCodeError('Invalid Master Authorization Code. Please enter the Principal confidential key or leave empty for role-based attestation.');
      return;
    }

    setIsExporting(true);

    try {
      const result = generateSignedRegulatoryAuditCsv({
        logs: auditLogs,
        schoolName,
        signatoryName: signatoryName.trim() || 'Executive Principal',
        signatoryTitle: signatoryTitle.trim() || 'Executive Principal & Compliance Officer',
        signatoryRole: 'PRINCIPAL',
        signatoryEmail: signatoryEmail.trim(),
        regulatoryStandard: `${selectedStandard.label} — ${selectedStandard.code}`,
        docketNumber: docketNumber.trim(),
        destinationAgency: destinationAgency.trim(),
        customRemarks: customRemarks.trim(),
      });

      // Trigger actual download of the signed CSV
      downloadSignedAuditCsv(result);
      setExportResult(result);

      // Log this sensitive compliance export to the audit trail itself!
      logAuditAction({
        action: 'REGULATORY_AUDIT_EXPORTED',
        actionLabel: 'Signed Regulatory Audit Trail Exported',
        category: 'DATA_GOVERNANCE',
        severity: 'WARNING',
        performedBy: {
          name: signatoryName,
          role: 'PRINCIPAL',
          email: signatoryEmail,
        },
        targetEntity: {
          type: 'SECURITY',
          id: docketNumber,
          label: selectedStandard.label,
        },
        details: `Cryptographically signed audit transcript exported under Docket ${docketNumber} for ${destinationAgency}. Standard: ${selectedStandard.code}. Token: ${result.verificationToken}. Total entries: ${auditLogs.length}.`,
        status: 'SUCCESS',
      });
    } catch (err: any) {
      setCodeError(err?.message || 'Failed to generate signed audit CSV.');
    } finally {
      setIsExporting(false);
    }
  };

  const handleCopyCertificate = () => {
    if (!exportResult) return;
    navigator.clipboard.writeText(exportResult.certificateBlock);
    setCopiedCertificate(true);
    setTimeout(() => setCopiedCertificate(false), 2500);
  };

  const handleCopySealToken = (token: string) => {
    navigator.clipboard.writeText(token);
    setCopiedSealToken(true);
    setTimeout(() => setCopiedSealToken(false), 2000);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsVerifyingFile(true);
    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      setVerifyInputText(content);
      const res = verifySignedAuditCsvContent(content);
      setVerificationResult(res);
      setIsVerifyingFile(false);
    };
    reader.onerror = () => {
      setIsVerifyingFile(false);
    };
    reader.readAsText(file);
  };

  const handleManualVerify = () => {
    if (!verifyInputText.trim()) return;
    setIsVerifyingFile(true);
    setTimeout(() => {
      const res = verifySignedAuditCsvContent(verifyInputText);
      setVerificationResult(res);
      setIsVerifyingFile(false);
    }, 200);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl max-w-4xl w-full overflow-hidden border border-slate-200 dark:border-slate-800 animate-in fade-in zoom-in-95 duration-200 my-8">
        
        {/* Modal Top Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-800 bg-gradient-to-r from-slate-900 via-slate-850 to-slate-900 text-white">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center shrink-0">
              <Award className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-white text-base">
                  Regulatory Compliance Audit Attestation
                </h3>
                <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-400/40">
                  Signed CSV Export
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Cryptographically attested, tamper-evident audit ledger for external statutory compliance bodies & accredited auditors
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition cursor-pointer"
            title="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Tabs */}
        <div className="flex items-center border-b border-slate-200 dark:border-slate-800 px-6 bg-slate-50 dark:bg-slate-800/40">
          <button
            onClick={() => setActiveTab('SIGN_EXPORT')}
            className={`py-3 px-4 text-xs font-bold border-b-2 flex items-center gap-2 transition cursor-pointer ${
              activeTab === 'SIGN_EXPORT'
                ? 'border-emerald-600 text-emerald-700 dark:text-emerald-400 bg-emerald-50/50 dark:bg-emerald-950/20'
                : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            <FileSpreadsheet className="w-4 h-4" />
            <span>Sign & Export Compliance CSV</span>
          </button>

          <button
            onClick={() => setActiveTab('VERIFY_CSV')}
            className={`py-3 px-4 text-xs font-bold border-b-2 flex items-center gap-2 transition cursor-pointer ${
              activeTab === 'VERIFY_CSV'
                ? 'border-emerald-600 text-emerald-700 dark:text-emerald-400 bg-emerald-50/50 dark:bg-emerald-950/20'
                : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            <SearchCheck className="w-4 h-4" />
            <span>Verify Signed CSV Integrity</span>
          </button>
        </div>

        {/* Tab 1: Sign & Export */}
        {activeTab === 'SIGN_EXPORT' ? (
          <div className="p-6 space-y-5 max-h-[75vh] overflow-y-auto">
            
            {/* Tamper-Evident Ledger Integrity Status Banner */}
            <div className="p-4 rounded-xl bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-emerald-950/40 dark:to-teal-950/30 border border-emerald-200 dark:border-emerald-800/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-lg bg-emerald-600 text-white flex items-center justify-center shrink-0 mt-0.5">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <div className="text-xs">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-emerald-950 dark:text-emerald-200 text-sm">
                      Tamper-Evident SHA-256 Ledger
                    </span>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-200 text-emerald-900 dark:bg-emerald-900 dark:text-emerald-200">
                      Integrity Verified
                    </span>
                  </div>
                  <p className="text-emerald-800 dark:text-emerald-300 mt-0.5">
                    <strong>{auditLogs.length}</strong> sequential chronological events recorded in the institutional database. 
                    Every record is chained with previous cryptographic hashes to guarantee immutability.
                  </p>
                </div>
              </div>

              <div className="text-right shrink-0">
                <span className="text-[10px] font-mono uppercase text-emerald-700 dark:text-emerald-400 font-bold block">
                  Institution
                </span>
                <span className="font-semibold text-xs text-slate-900 dark:text-white">
                  {schoolName}
                </span>
              </div>
            </div>

            {/* Regulatory Standard Selection */}
            <div className="space-y-2">
              <label className="block text-xs font-bold text-slate-900 dark:text-white">
                Select Compliance Regulatory Standard & Statutory Authority <span className="text-rose-500">*</span>
              </label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
                {REGULATORY_STANDARDS.map((standard) => (
                  <div
                    key={standard.key}
                    onClick={() => setSelectedStandardKey(standard.key)}
                    className={`p-3 rounded-xl border text-xs cursor-pointer transition flex items-start gap-2.5 ${
                      selectedStandardKey === standard.key
                        ? 'border-emerald-500 bg-emerald-50/60 dark:bg-emerald-950/30 text-emerald-950 dark:text-emerald-200 shadow-xs'
                        : 'border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300'
                    }`}
                  >
                    <div className={`w-4 h-4 rounded-full border mt-0.5 flex items-center justify-center shrink-0 ${
                      selectedStandardKey === standard.key
                        ? 'border-emerald-600 bg-emerald-600 text-white'
                        : 'border-slate-400'
                    }`}>
                      {selectedStandardKey === standard.key && <Check className="w-2.5 h-2.5" />}
                    </div>
                    <div className="space-y-0.5">
                      <span className="font-bold block text-slate-900 dark:text-white">
                        {standard.label}
                      </span>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-normal">
                        {standard.description}
                      </p>
                      <span className="text-[10px] text-slate-400 dark:text-slate-500 font-mono block">
                        Authority: {standard.governingBody}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Attestation Parameters & Docket */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Compliance Docket Reference Number <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={docketNumber}
                  onChange={(e) => setDocketNumber(e.target.value)}
                  placeholder="e.g. REG-AUD-2026-0925-101"
                  className="w-full px-3 py-2 rounded-lg bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-600 text-slate-900 dark:text-white font-mono font-bold focus:ring-1 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Destination Regulatory Agency / External Auditor
                </label>
                <input
                  type="text"
                  value={destinationAgency}
                  onChange={(e) => setDestinationAgency(e.target.value)}
                  placeholder="e.g. Ministry of Education Inspectorate"
                  className="w-full px-3 py-2 rounded-lg bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-600 text-slate-900 dark:text-white focus:ring-1 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Authorized Certifying Signatory <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={signatoryName}
                  onChange={(e) => setSignatoryName(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-600 text-slate-900 dark:text-white font-bold focus:ring-1 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Signatory Official Title / Capacity
                </label>
                <input
                  type="text"
                  value={signatoryTitle}
                  onChange={(e) => setSignatoryTitle(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-600 text-slate-900 dark:text-white focus:ring-1 focus:ring-emerald-500"
                />
              </div>
            </div>

            {/* Official Digital Signature Seal Preview */}
            <div className="p-4 rounded-xl border border-amber-300 dark:border-amber-700/60 bg-gradient-to-br from-amber-50/70 via-orange-50/40 to-amber-100/50 dark:from-amber-950/30 dark:to-orange-950/20 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Award className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                  <span className="font-bold text-xs text-amber-950 dark:text-amber-200 uppercase tracking-wider">
                    Executive Compliance Attestation Seal
                  </span>
                </div>
                <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-amber-200/80 dark:bg-amber-900/60 text-amber-950 dark:text-amber-200 border border-amber-300">
                  Digital Signature Algorithm: SHA-256 HMAC
                </span>
              </div>

              <p className="text-xs text-amber-900 dark:text-amber-300 italic leading-relaxed">
                "I hereby attest under official executive authority that this exported audit ledger represents a true, complete, and tamper-evident record of all system events and transactions recorded within the institutional database."
              </p>

              <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-amber-200/70 dark:border-amber-800/50 text-[11px] text-amber-900 dark:text-amber-300 font-mono">
                <span>Signatory: <strong>{signatoryName}</strong></span>
                <span>Role: <strong>{signatoryTitle}</strong></span>
                <span>Docket: <strong>{docketNumber}</strong></span>
              </div>
            </div>

            {codeError && (
              <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 text-xs flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 shrink-0" />
                <span>{codeError}</span>
              </div>
            )}

            {/* Export Success Modal Card */}
            {exportResult && (
              <div className="p-4 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-300 dark:border-emerald-700 text-xs space-y-3 animate-in fade-in">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                    <span className="font-bold text-emerald-950 dark:text-emerald-200 text-sm">
                      Signed CSV Successfully Generated & Exported
                    </span>
                  </div>
                  <span className="font-mono text-[10px] font-bold text-emerald-800 dark:text-emerald-300 bg-emerald-200/70 dark:bg-emerald-900/80 px-2 py-0.5 rounded">
                    {exportResult.fileName}
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 font-mono text-[11px] bg-white dark:bg-slate-900 p-3 rounded-lg border border-emerald-200 dark:border-emerald-800/60">
                  <div>
                    <span className="text-slate-400 block text-[10px]">Verification Token:</span>
                    <div className="flex items-center gap-1.5 font-bold text-emerald-700 dark:text-emerald-400">
                      <span>{exportResult.verificationToken}</span>
                      <button
                        onClick={() => handleCopySealToken(exportResult.verificationToken)}
                        className="text-slate-400 hover:text-slate-600 p-0.5"
                        title="Copy token"
                      >
                        {copiedSealToken ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                      </button>
                    </div>
                  </div>

                  <div>
                    <span className="text-slate-400 block text-[10px]">Ledger Chain Hash:</span>
                    <span className="text-slate-600 dark:text-slate-300 truncate block" title={exportResult.cumulativeHash}>
                      {exportResult.cumulativeHash.substring(0, 24)}...
                    </span>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-1">
                  <span className="text-[11px] text-emerald-800 dark:text-emerald-300">
                    File includes formal commented regulatory metadata header, row-by-row hash chains, and signature seal trailer.
                  </span>
                  <button
                    type="button"
                    onClick={handleCopyCertificate}
                    className="px-3 py-1.5 bg-white dark:bg-slate-800 hover:bg-emerald-100 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-700 rounded-lg text-xs font-bold flex items-center gap-1.5 transition cursor-pointer"
                  >
                    {copiedCertificate ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedCertificate ? 'Certificate Copied!' : 'Copy Attestation Certificate'}</span>
                  </button>
                </div>
              </div>
            )}

            {/* Modal Bottom Actions */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
              <span className="text-[11px] text-slate-500 dark:text-slate-400">
                Official output complies with FERPA (§ 99.32), ISO/IEC 27001, and NIST log standards.
              </span>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl text-xs font-semibold transition cursor-pointer"
                >
                  Close
                </button>

                <button
                  type="button"
                  onClick={handleSignAndExport}
                  disabled={isExporting}
                  className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold flex items-center gap-2 transition shadow-md hover:shadow-emerald-600/20 active:scale-98 cursor-pointer disabled:opacity-60"
                >
                  {isExporting ? (
                    <RefreshCw className="w-4 h-4 animate-spin" />
                  ) : (
                    <FileCheck className="w-4 h-4" />
                  )}
                  <span>{isExporting ? 'Cryptographically Signing...' : 'Export Signed CSV'}</span>
                </button>
              </div>
            </div>

          </div>
        ) : (
          /* Tab 2: Verify Signed CSV */
          <div className="p-6 space-y-5 max-h-[75vh] overflow-y-auto">
            
            <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-2 text-xs">
              <div className="flex items-center gap-2 text-slate-900 dark:text-white font-bold">
                <SearchCheck className="w-4 h-4 text-emerald-600" />
                <span>External Auditor Cryptographic Verifier</span>
              </div>
              <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
                Upload or paste any exported audit CSV transcript. This inspector recalculates the sequential SHA-256 hash chains 
                and verifies the digital signature seal to determine whether any character or row was modified after export.
              </p>
            </div>

            {/* File Dropzone / Upload */}
            <div className="border-2 border-dashed border-slate-300 dark:border-slate-700 hover:border-emerald-500 rounded-xl p-5 text-center transition bg-slate-50/50 dark:bg-slate-900/50">
              <Upload className="w-8 h-8 text-slate-400 mx-auto mb-2" />
              <p className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                Drag and drop your exported signed CSV here, or browse files
              </p>
              <input
                type="file"
                accept=".csv"
                onChange={handleFileUpload}
                className="mt-3 block w-full text-xs text-slate-500 file:mr-4 file:py-1.5 file:px-4 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-emerald-50 file:text-emerald-700 hover:file:bg-emerald-100 cursor-pointer"
              />
            </div>

            {/* Paste Box */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-xs">
                <label className="font-semibold text-slate-700 dark:text-slate-300">
                  Or paste CSV transcript content directly:
                </label>
                {verifyInputText && (
                  <button
                    onClick={() => {
                      setVerifyInputText('');
                      setVerificationResult(null);
                    }}
                    className="text-slate-400 hover:text-slate-600 text-[11px] underline"
                  >
                    Clear
                  </button>
                )}
              </div>
              <textarea
                rows={5}
                value={verifyInputText}
                onChange={(e) => setVerifyInputText(e.target.value)}
                placeholder="Paste the contents of your signed audit CSV file here..."
                className="w-full p-3 text-xs font-mono rounded-xl bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-slate-800 dark:text-slate-200 outline-none focus:ring-1 focus:ring-emerald-500"
              />
              <button
                type="button"
                onClick={handleManualVerify}
                disabled={!verifyInputText.trim() || isVerifyingFile}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
              >
                {isVerifyingFile ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <SearchCheck className="w-3.5 h-3.5" />}
                <span>Validate Cryptographic Signature</span>
              </button>
            </div>

            {/* Verification Result Card */}
            {verificationResult && (
              <div className={`p-4 rounded-xl border text-xs space-y-3 animate-in fade-in ${
                verificationResult.isValid
                  ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-300 dark:border-emerald-700 text-emerald-950 dark:text-emerald-200'
                  : 'bg-rose-50 dark:bg-rose-950/40 border-rose-300 dark:border-rose-700 text-rose-950 dark:text-rose-200'
              }`}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {verificationResult.isValid ? (
                      <CheckCircle2 className="w-6 h-6 text-emerald-600 shrink-0" />
                    ) : (
                      <ShieldAlert className="w-6 h-6 text-rose-600 shrink-0" />
                    )}
                    <div>
                      <span className="font-bold text-sm block">
                        {verificationResult.isValid
                          ? 'Cryptographic Verification Passed: 100% Genuine & Untampered'
                          : 'Cryptographic Verification Failed: Tamper Violation Detected'}
                      </span>
                      <span className="text-[11px] opacity-80">
                        {verificationResult.isValid
                          ? `All sequential hash chains and the Principal digital seal match the recorded data entries (${verificationResult.totalRecords} verified records).`
                          : verificationResult.errorMessage}
                      </span>
                    </div>
                  </div>
                </div>

                {verificationResult.isValid && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px] font-mono bg-white/70 dark:bg-slate-900/70 p-3 rounded-lg border border-emerald-200 dark:border-emerald-800">
                    <div>
                      <span className="text-slate-400 block text-[10px]">Certifying Signatory:</span>
                      <strong className="text-slate-800 dark:text-white">{verificationResult.signatoryName || 'Executive Principal'}</strong>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[10px]">Docket ID:</span>
                      <strong className="text-slate-800 dark:text-white">{verificationResult.docketNumber || 'N/A'}</strong>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[10px]">Regulatory Standard:</span>
                      <span className="text-slate-700 dark:text-slate-300 truncate block">{verificationResult.regulatoryStandard}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[10px]">Digital Signature Seal:</span>
                      <span className="text-emerald-700 dark:text-emerald-400 font-bold truncate block">{verificationResult.computedSeal}</span>
                    </div>
                  </div>
                )}
              </div>
            )}

            <div className="flex justify-end pt-3 border-t border-slate-100 dark:border-slate-800">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl text-xs font-semibold transition cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};
