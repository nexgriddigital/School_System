import React, { useState } from 'react';
import { 
  X, 
  Download, 
  Printer, 
  FileText, 
  CheckCircle2, 
  ShieldCheck, 
  ExternalLink,
  PenTool,
  Stamp,
  Award,
  AlertTriangle
} from 'lucide-react';
import { downloadPdfDataUrl } from '../../utils/pdfGenerator';
import { DigitalSignatureModal } from './DigitalSignatureModal';
import { DigitalSignatureInfo, UserRole } from '../../types';

export interface DocumentViewerModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  subtitle?: string;
  docName: string;
  docUrl?: string; // Data URL or external link
  category?: 'CERTIFICATE' | 'DEPOSIT_SLIP' | 'MEDICAL_LEAVE' | 'RECOMMENDATION' | 'REPORT_CARD' | 'TRANSCRIPT' | 'GENERAL';
  watermark?: string;
  canSign?: boolean;
  documentId?: string;
  signatoryRole?: UserRole;
  onSignDocument?: (signature: DigitalSignatureInfo) => void;
  metadata?: {
    studentName?: string;
    studentId?: string;
    referenceNumber?: string;
    uploadedDate?: string;
    verifiedBy?: string;
    watermark?: string;
    cutoffDate?: string;
    scope?: string;
    signatures?: DigitalSignatureInfo[];
  };
}

export const DocumentViewerModal: React.FC<DocumentViewerModalProps> = ({
  isOpen,
  onClose,
  title,
  subtitle,
  docName,
  docUrl,
  category = 'GENERAL',
  watermark,
  canSign = false,
  documentId,
  signatoryRole = 'PRINCIPAL',
  onSignDocument,
  metadata,
}) => {
  const [showSignModal, setShowSignModal] = useState(false);
  const [localSignatures, setLocalSignatures] = useState<DigitalSignatureInfo[]>(
    metadata?.signatures || []
  );

  if (!isOpen) return null;

  const activeWatermark = watermark || metadata?.watermark;

  const handleDownload = () => {
    if (docUrl && docUrl.startsWith('data:')) {
      downloadPdfDataUrl(docUrl, docName);
    } else if (docUrl) {
      const a = document.createElement('a');
      a.href = docUrl;
      a.download = docName;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    } else {
      alert(`Preparing ${docName} for download...`);
    }
  };

  const handleSignatureComplete = (sig: DigitalSignatureInfo) => {
    setLocalSignatures(prev => [...prev.filter(s => s.signatoryRole !== sig.signatoryRole), sig]);
    setShowSignModal(false);
    if (onSignDocument) {
      onSignDocument(sig);
    }
  };

  const isPdf = docName.toLowerCase().endsWith('.pdf') || (docUrl && docUrl.startsWith('data:application/pdf'));

  return (
    <>
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/75 backdrop-blur-sm p-3 sm:p-6 overflow-y-auto animate-in fade-in duration-200">
        <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[92vh] flex flex-col overflow-hidden border border-slate-200">
          
          {/* Top Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/90">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center font-bold">
                {category === 'TRANSCRIPT' ? <Award className="w-5 h-5 text-indigo-700" /> : <FileText className="w-5 h-5" />}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-oskar-vintage text-base font-bold text-slate-900 tracking-wide">
                    {title}
                  </h3>
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-emerald-100 text-emerald-800 rounded-full font-bold text-[10px]">
                    <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                    Verified Document
                  </span>
                  {activeWatermark && (
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 bg-amber-100 border border-amber-300 text-amber-900 rounded-full font-bold text-[10px] tracking-wide uppercase shadow-xs">
                      <Stamp className="w-3 h-3 text-amber-700" />
                      {activeWatermark}
                    </span>
                  )}
                </div>
                <p className="text-xs text-slate-500">
                  {subtitle || `Archived Digital Document: ${docName}`}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {canSign && (
                <button
                  onClick={() => setShowSignModal(true)}
                  className="px-3.5 py-1.5 bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-700 hover:to-amber-800 text-white rounded-lg text-xs font-bold flex items-center gap-1.5 transition shadow-sm"
                  title="Authorize and digitally sign this document"
                >
                  <PenTool className="w-3.5 h-3.5 text-amber-200" />
                  Sign & Authorize
                </button>
              )}
              <button
                onClick={handleDownload}
                className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 transition shadow-sm"
                title="Download PDF to device"
              >
                <Download className="w-3.5 h-3.5" />
                Download PDF
              </button>
              <button
                onClick={() => window.print()}
                className="hidden sm:flex px-3 py-1.5 border border-slate-200 hover:bg-slate-100 text-slate-700 rounded-lg text-xs font-semibold items-center gap-1.5 transition"
                title="Print document"
              >
                <Printer className="w-3.5 h-3.5" />
                Print
              </button>
              <button
                onClick={onClose}
                className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-200 transition ml-2"
                title="Close modal"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Verification & Watermark Status Ribbon */}
          <div className="px-6 py-2.5 bg-blue-50/70 border-b border-blue-100 flex flex-wrap items-center justify-between text-xs text-blue-900 gap-2">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-blue-600 shrink-0" />
              <span className="font-medium">
                Official SIS Record • Cryptographically Tracked & Archived
              </span>
            </div>
            {metadata && (
              <div className="flex items-center gap-4 text-[11px] text-blue-800">
                {metadata.studentName && <span>Student: <strong>{metadata.studentName}</strong></span>}
                {metadata.studentId && <span>ID: <strong className="font-mono">{metadata.studentId}</strong></span>}
                {metadata.cutoffDate && (
                  <span className="bg-blue-100/80 px-2 py-0.5 rounded text-blue-900 font-semibold">
                    Cutoff Date: {metadata.cutoffDate}
                  </span>
                )}
                {metadata.referenceNumber && <span>Ref: <strong className="font-mono">{metadata.referenceNumber}</strong></span>}
              </div>
            )}
          </div>

          {/* Watermark Notice Ribbon when active */}
          {activeWatermark && (
            <div className="px-6 py-2 bg-amber-50/90 border-b border-amber-200 flex items-center justify-between text-xs text-amber-900">
              <div className="flex items-center gap-2">
                <Stamp className="w-4 h-4 text-amber-700 shrink-0" />
                <span className="font-semibold">
                  Diagonal Security Watermark Active:
                </span>
                <span>
                  The text &quot;<strong>{activeWatermark}</strong>&quot; is permanently rendered diagonally across this document.
                </span>
              </div>
              <span className="text-[11px] font-mono font-bold text-amber-800">
                OFFICIAL TEMPORARY TRANSCRIPT POLICY
              </span>
            </div>
          )}

          {/* Document Body View */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-6 bg-slate-100 flex flex-col justify-start items-center min-h-[420px] space-y-4">
            {docUrl ? (
              <div className="w-full max-w-3xl bg-white rounded-xl shadow-md border border-slate-300 overflow-hidden flex flex-col">
                {isPdf ? (
                  <div className="w-full h-[540px] relative bg-slate-900">
                    <iframe
                      src={docUrl}
                      title={docName}
                      className="w-full h-full border-0 rounded-b-xl"
                    />
                  </div>
                ) : (
                  <div className="p-4 flex flex-col items-center justify-center">
                    <img
                      src={docUrl}
                      alt={docName}
                      className="max-h-[500px] w-auto object-contain rounded border border-slate-200 shadow-sm"
                    />
                    <p className="text-xs text-slate-500 mt-2 font-mono">{docName}</p>
                  </div>
                )}
              </div>
            ) : (
              <div className="w-full max-w-xl p-8 bg-white rounded-2xl border border-slate-200 shadow-sm text-center my-auto space-y-4">
                <div className="w-16 h-16 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mx-auto">
                  <FileText className="w-8 h-8" />
                </div>
                <div>
                  <h4 className="font-bold text-slate-900 text-sm">{docName}</h4>
                  <p className="text-xs text-slate-500 mt-1">
                    This document is registered in the SIS portal database.
                  </p>
                </div>
                <button
                  onClick={handleDownload}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition shadow-sm inline-flex items-center gap-2"
                >
                  <Download className="w-4 h-4" />
                  Download Document
                </button>
              </div>
            )}

            {/* Display Authorized Digital Signatures if present */}
            {localSignatures.length > 0 && (
              <div className="w-full max-w-3xl bg-white rounded-xl border border-slate-200 p-4 shadow-sm">
                <div className="flex items-center gap-2 mb-3 pb-2 border-b border-slate-100">
                  <Stamp className="w-4 h-4 text-emerald-600" />
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700">
                    Verified Digital Authorizations ({localSignatures.length})
                  </h4>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {localSignatures.map((sig, idx) => (
                    <div key={idx} className="bg-slate-50 rounded-lg p-3 border border-slate-200 flex flex-col justify-between">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-[11px] font-bold text-slate-800">
                          {sig.signatoryName}
                        </span>
                        <span className="text-[10px] font-mono px-2 py-0.5 bg-emerald-100 text-emerald-800 rounded font-semibold">
                          {sig.signatoryRole}
                        </span>
                      </div>
                      {sig.signatureDataUrl && (
                        <div className="bg-white border border-slate-100 rounded p-1 mb-2 flex items-center justify-center h-12">
                          <img src={sig.signatureDataUrl} alt="Signature" className="max-h-10 max-w-full object-contain" />
                        </div>
                      )}
                      <div className="text-[10px] text-slate-500 space-y-0.5">
                        <p>Authorized: <strong>{new Date(sig.timestamp).toLocaleDateString()}</strong></p>
                        <p className="font-mono text-[9px] text-slate-400 truncate">
                          SHA: {sig.verificationHash}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="px-6 py-3 bg-white border-t border-slate-200 flex items-center justify-between text-xs text-slate-500">
            <span className="font-mono text-[11px] text-slate-400">
              SIS-PORTAL-STORAGE // {docName}
            </span>
            <div className="flex items-center gap-3">
              {canSign && (
                <button
                  onClick={() => setShowSignModal(true)}
                  className="px-3 py-1.5 bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-300 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition"
                >
                  <PenTool className="w-3.5 h-3.5 text-amber-700" />
                  Sign Document
                </button>
              )}
              <button
                onClick={onClose}
                className="px-4 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-medium transition"
              >
                Close
              </button>
            </div>
          </div>

        </div>
      </div>

      {/* Online Digital Signature Modal */}
      {showSignModal && (
        <DigitalSignatureModal
          isOpen={showSignModal}
          onClose={() => setShowSignModal(false)}
          documentTitle={title}
          documentId={documentId || docName}
          signatoryRole={signatoryRole}
          onAuthorize={handleSignatureComplete}
        />
      )}
    </>
  );
};
