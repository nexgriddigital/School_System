import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Shield, FileText, Check, Download, Printer, X, Building2, Sparkles, AlertCircle } from 'lucide-react';
import { useSchool } from '../../context/SchoolContext';

interface TermsAndConditionsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const TermsAndConditionsModal: React.FC<TermsAndConditionsModalProps> = ({
  isOpen,
  onClose,
}) => {
  const { schoolName } = useSchool();
  const [hasAgreed, setHasAgreed] = useState(true);

  if (!isOpen) return null;

  const handlePrint = () => {
    window.print();
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/70 backdrop-blur-xs overflow-y-auto">
        <motion.div
          initial={{ opacity: 0, scale: 0.96, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.96, y: 15 }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          className="relative w-full max-w-4xl bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden my-6 max-h-[90vh] flex flex-col"
        >
          {/* Top Decorative Banner */}
          <div className="bg-linear-to-r from-[#0B192C] via-[#1E3E62] to-[#0B192C] px-6 py-5 text-white flex items-center justify-between border-b border-slate-800 shrink-0">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-blue-600/90 text-white flex items-center justify-center border border-blue-400/30 shadow-md">
                <Shield className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-base sm:text-lg font-bold font-oskar tracking-wide">
                    Terms & Conditions of System Operation
                  </h2>
                  <span className="text-[10px] bg-blue-500/20 text-blue-200 px-2 py-0.5 rounded-full border border-blue-400/30 font-semibold">
                    v2.4 Production
                  </span>
                </div>
                <p className="text-xs text-blue-200">
                  {schoolName} • School Management System (SIS)
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handlePrint}
                className="hidden sm:flex items-center gap-1 px-3 py-1.5 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 transition cursor-pointer"
                title="Print Terms & Conditions"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Print</span>
              </button>
              <button
                onClick={onClose}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* NexGrid Digital Systems Letterhead & Attribution Bar */}
          <div className="bg-blue-50/90 border-b border-blue-200 px-6 py-2.5 flex flex-wrap items-center justify-between gap-2 text-xs shrink-0">
            <div className="flex items-center gap-2">
              <span className="font-bold text-blue-950 uppercase tracking-wider text-[11px]">
                Architect & Technology Provider:
              </span>
              <span className="font-bold text-blue-700 bg-white px-2 py-0.5 rounded-md border border-blue-200 shadow-2xs">
                Designed and Developed by NexGrid Digital Systems
              </span>
            </div>
            <div className="text-[11px] text-blue-800 font-medium">
              Enterprise Institutional License • Active Production Staging
            </div>
          </div>

          {/* Scrollable Terms Content */}
          <div className="p-6 sm:p-8 overflow-y-auto space-y-6 text-slate-700 text-xs leading-relaxed print:p-0">
            {/* Notice Callout */}
            <div className="p-4 bg-amber-50 rounded-2xl border border-amber-200 text-amber-950 flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
              <div className="space-y-1">
                <p className="font-bold text-sm text-amber-900">Important Operational Protocol for School Leadership:</p>
                <p className="text-xs text-amber-800">
                  By accessing, deploying, or operating the {schoolName} School Management System (SIS), all operators, registrars, financial officers, faculty, and administrators agree to abide by the statutory provisions, grade-specific verification mandates, and cryptographic security rules outlined below.
                </p>
              </div>
            </div>

            {/* Section 1 */}
            <section className="space-y-2 border-b border-slate-100 pb-4">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <span className="w-6 h-6 rounded-lg bg-blue-100 text-blue-700 font-bold flex items-center justify-center text-xs">1</span>
                <span>Proprietary Rights, Intellectual Property & Development Attribution</span>
              </h3>
              <p>
                The {schoolName} School Management System (SIS) — including its algorithmic cross-checking engines, automated capacity planners, graphical interfaces, data structures, and software architecture — was <strong>Designed and Developed by NexGrid Digital Systems</strong>.
              </p>
              <p>
                All rights, titles, and intellectual property remain the exclusive property of NexGrid Digital Systems under international copyright legislation and enterprise educational software licenses. Unauthorized source modification, reverse-engineering, or unauthorized redistribution is strictly prohibited.
              </p>
            </section>

            {/* Section 2 */}
            <section className="space-y-2 border-b border-slate-100 pb-4">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <span className="w-6 h-6 rounded-lg bg-blue-100 text-blue-700 font-bold flex items-center justify-center text-xs">2</span>
                <span>Role-Based Access Control (RBAC) & Credential Integrity</span>
              </h3>
              <p>
                The system strictly segregates institutional duties into eight isolated stakeholder roles: <em>Admissions Registrar, Finance Office, Program Office, Principal Executive, Counsellor / Pastoral Care, Faculty Teachers, Student Scholars, and Parents/Guardians</em>.
              </p>
              <ul className="list-disc pl-5 space-y-1 text-slate-600">
                <li><strong>Leadership 2FA OTP:</strong> Administrative roles mandate 2-Step Email Verification through the integrated Google Workspace Gmail API.</li>
                <li><strong>Restricted Password Resets:</strong> In compliance with security standards, student and teacher password resets cannot be performed by regular staff. Resets are strictly permitted only via the <strong>Finance Office</strong>, <strong>Registrar</strong>, or <strong>Principal</strong> upon positive identity verification.</li>
              </ul>
            </section>

            {/* Section 3 */}
            <section className="space-y-2 border-b border-slate-100 pb-4">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <span className="w-6 h-6 rounded-lg bg-blue-100 text-blue-700 font-bold flex items-center justify-center text-xs">3</span>
                <span>Admissions & Grade-Specific Document Verification Standards</span>
              </h3>
              <p>
                To maintain national accreditation, the Registrar must inspect and approve required documentation in accordance with grade-specific requirements:
              </p>
              <ul className="list-disc pl-5 space-y-1 text-slate-600">
                <li><strong>Pre-K & Kindergarten:</strong> Valid Birth Certificate and Clinic/Immunization Card are mandatory prior to enrollment.</li>
                <li><strong>Primary School (Grades 1-8):</strong> Certified previous grade academic report card, immunization records, and birth certificate.</li>
                <li><strong>High School (Grades 9-12):</strong> Official Ministry Grade 8/10 Certificates, Academic Transcripts, and an authenticated Transfer Letter from the originating institution.</li>
              </ul>
            </section>

            {/* Section 4 */}
            <section className="space-y-2 border-b border-slate-100 pb-4">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <span className="w-6 h-6 rounded-lg bg-blue-100 text-blue-700 font-bold flex items-center justify-center text-xs">4</span>
                <span>Financial Governance & Bank Statement Cross-Checking</span>
              </h3>
              <p>
                All tuition payments, laboratory dues, and registration fees must reconcile with bank statement records. The automated Bulk Bank Statement Cross-Checking engine matches student bank account identifiers against bank feeds. Stamped official receipts issued by the Finance Office represent legal proof of tuition settlement. Registration fees (ETB 3,000) are strictly non-refundable.
              </p>
            </section>

            {/* Section 5 */}
            <section className="space-y-2 border-b border-slate-100 pb-4">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <span className="w-6 h-6 rounded-lg bg-blue-100 text-blue-700 font-bold flex items-center justify-center text-xs">5</span>
                <span>Strict 15-Day Senior Stream Change Policy (Grades 11 & 12)</span>
              </h3>
              <p>
                Petitions to transfer between the <em>Natural Sciences Stream</em> and <em>Social Sciences Stream</em> are strictly time-bound. Under official academy bylaws, requests must be submitted within the first <strong>15 calendar days</strong> of the academic year. Requests filed after Day 15 are automatically locked and rejected by the system. Every valid transfer requires final digital sign-off from the Principal.
              </p>
            </section>

            {/* Section 6 */}
            <section className="space-y-2 border-b border-slate-100 pb-4">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <span className="w-6 h-6 rounded-lg bg-blue-100 text-blue-700 font-bold flex items-center justify-center text-xs">6</span>
                <span>Student Privacy, FERPA & Pastoral Data Confidentiality</span>
              </h3>
              <p>
                Student personal identifiers, medical clinic entries, academic report cards, and counsellor case notes are confidential. Counsellor logs and disciplinary records are encrypted and protected from general faculty access, preserving student dignity and legal privacy standards.
              </p>
            </section>

            {/* Section 7 */}
            <section className="space-y-2">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <span className="w-6 h-6 rounded-lg bg-blue-100 text-blue-700 font-bold flex items-center justify-center text-xs">7</span>
                <span>Enterprise Service Level Agreement (SLA) & Technical Support</span>
              </h3>
              <p>
                NexGrid Digital Systems commits to 99.9% uptime for core SIS services with automated cloud backups. For emergency technical support, institutional administrators may reach the NexGrid Digital Technical Desk at <strong>support@nexgrid.digital</strong>.
              </p>
            </section>
          </div>

          {/* Footer Actions */}
          <div className="bg-slate-50 border-t border-slate-200 px-6 py-4 flex flex-col sm:flex-row items-center justify-between gap-3 shrink-0">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
                <Check className="w-3 h-3" />
              </div>
              <span className="text-xs font-semibold text-slate-700">
                Official Institutional Terms • Enforced by NexGrid Digital Systems
              </span>
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
              <button
                type="button"
                onClick={onClose}
                className="w-full sm:w-auto px-5 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow transition cursor-pointer"
              >
                I Understand & Acknowledge Terms
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
