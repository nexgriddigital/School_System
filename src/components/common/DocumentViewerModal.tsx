import React from 'react';
import { X, Download, Printer, FileText, CheckCircle2, ShieldCheck, ExternalLink } from 'lucide-react';
import { downloadPdfDataUrl } from '../../utils/pdfGenerator';

export interface DocumentViewerModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  subtitle?: string;
  docName: string;
  docUrl?: string; // Data URL or external link
  category?: 'CERTIFICATE' | 'DEPOSIT_SLIP' | 'MEDICAL_LEAVE' | 'RECOMMENDATION' | 'REPORT_CARD' | 'GENERAL';
  metadata?: {
    studentName?: string;
    studentId?: string;
    referenceNumber?: string;
    uploadedDate?: string;
    verifiedBy?: string;
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
  metadata,
}) => {
  if (!isOpen) return null;

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

  const isPdf = docName.toLowerCase().endsWith('.pdf') || (docUrl && docUrl.startsWith('data:application/pdf'));

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/75 backdrop-blur-sm p-3 sm:p-6 overflow-y-auto animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[92vh] flex flex-col overflow-hidden border border-slate-200">
        
        {/* Top Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/90">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center font-bold">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-oskar-vintage text-base font-bold text-slate-900 tracking-wide">
                  {title}
                </h3>
                <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-emerald-100 text-emerald-800 rounded-full font-bold text-[10px]">
                  <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                  Saved in Portal
                </span>
              </div>
              <p className="text-xs text-slate-500">
                {subtitle || `Archived Digital Document: ${docName}`}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
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

        {/* Verification Status Ribbon */}
        <div className="px-6 py-2 bg-blue-50/70 border-b border-blue-100 flex flex-wrap items-center justify-between text-xs text-blue-900 gap-2">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-blue-600 shrink-0" />
            <span className="font-medium">
              Document Authenticity Verified & Archived in School SIS Record
            </span>
          </div>
          {metadata && (
            <div className="flex items-center gap-4 text-[11px] text-blue-700">
              {metadata.studentName && <span>Student: <strong>{metadata.studentName}</strong></span>}
              {metadata.referenceNumber && <span>Ref: <strong className="font-mono">{metadata.referenceNumber}</strong></span>}
              {metadata.uploadedDate && <span>Uploaded: <strong>{metadata.uploadedDate}</strong></span>}
            </div>
          )}
        </div>

        {/* Document Body View */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 bg-slate-100 flex justify-center items-start min-h-[420px]">
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
                  This document is securely registered in the portal database.
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
        </div>

        {/* Footer */}
        <div className="px-6 py-3 bg-white border-t border-slate-200 flex items-center justify-between text-xs text-slate-500">
          <span className="font-mono text-[11px] text-slate-400">
            SIS-PORTAL-STORAGE // {docName}
          </span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-medium transition"
          >
            Done
          </button>
        </div>

      </div>
    </div>
  );
};
