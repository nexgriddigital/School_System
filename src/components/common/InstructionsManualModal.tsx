import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  BookOpen, 
  Download, 
  X, 
  Printer, 
  Building2, 
  CreditCard, 
  Layers, 
  GraduationCap, 
  HeartHandshake, 
  Users, 
  ShieldCheck, 
  FileCheck2, 
  Sparkles,
  ExternalLink
} from 'lucide-react';
import { useSchool } from '../../context/SchoolContext';
import { downloadInstructionsManualPdf } from '../../services/manualPdfService';

interface InstructionsManualModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const InstructionsManualModal: React.FC<InstructionsManualModalProps> = ({
  isOpen,
  onClose,
}) => {
  const { schoolName } = useSchool();
  const [activeTab, setActiveTab] = useState<'overview' | 'admissions' | 'finance' | 'program' | 'principal' | 'counsellor' | 'faculty' | 'terms'>('overview');
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);

  if (!isOpen) return null;

  const handleDownloadPdf = () => {
    setIsGeneratingPdf(true);
    try {
      downloadInstructionsManualPdf(schoolName);
    } catch (err) {
      console.error('Error generating PDF:', err);
      alert('Could not download PDF. Please try again.');
    } finally {
      setTimeout(() => setIsGeneratingPdf(false), 800);
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/75 backdrop-blur-xs overflow-y-auto">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          className="relative w-full max-w-5xl bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden my-4 max-h-[92vh] flex flex-col"
        >
          {/* Top Letterhead Header Bar */}
          <div className="bg-[#0B192C] text-white px-6 py-4 flex flex-wrap items-center justify-between border-b border-slate-800 shrink-0 gap-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center font-bold text-white shadow-md border border-blue-400/30">
                <BookOpen className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-base sm:text-lg font-bold font-oskar tracking-wide">
                    Comprehensive System Operator Instruction Manual
                  </h2>
                  <span className="text-[10px] bg-amber-400/20 text-amber-300 px-2 py-0.5 rounded-full border border-amber-400/30 font-semibold font-mono">
                    NDS-SIS-MAN-2026
                  </span>
                </div>
                <p className="text-xs text-blue-200">
                  {schoolName} • Enterprise Production Edition v2.4
                </p>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleDownloadPdf}
                disabled={isGeneratingPdf}
                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold shadow-md hover:shadow-lg transition cursor-pointer disabled:opacity-75"
                title="Download full 9-page PDF with official NexGrid Digital Letterhead on each page"
              >
                {isGeneratingPdf ? (
                  <>
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ repeat: Infinity, duration: 0.8, ease: 'linear' }}
                      className="w-3.5 h-3.5 border-2 border-white/40 border-t-white rounded-full"
                    />
                    <span>Compiling PDF...</span>
                  </>
                ) : (
                  <>
                    <Download className="w-3.5 h-3.5" />
                    <span>Download PDF Manual (With Letterhead)</span>
                  </>
                )}
              </button>

              <button
                onClick={onClose}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Letterhead Sub-Bar */}
          <div className="bg-slate-100 border-b border-slate-200 px-6 py-2 flex items-center justify-between text-[11px] text-slate-600 shrink-0">
            <div className="flex items-center gap-2">
              <span className="font-bold text-slate-900 uppercase tracking-wider">Letterhead Authority:</span>
              <span className="text-blue-700 font-bold bg-white px-2 py-0.5 rounded border border-slate-300">
                Designed and Developed by NexGrid Digital Systems
              </span>
            </div>
            <div className="hidden sm:block text-slate-500">
              Multi-Stakeholder Operational Reference Guide
            </div>
          </div>

          {/* Navigation Tabs */}
          <div className="bg-slate-50 border-b border-slate-200 px-6 py-2 overflow-x-auto flex gap-1.5 shrink-0 no-scrollbar">
            {[
              { id: 'overview', label: 'Executive Overview', icon: Sparkles },
              { id: 'admissions', label: '1. Admissions & Registrar', icon: Building2 },
              { id: 'finance', label: '2. Finance & Bank Match', icon: CreditCard },
              { id: 'program', label: '3. Program Office', icon: Layers },
              { id: 'principal', label: '4. Principal & Approvals', icon: GraduationCap },
              { id: 'counsellor', label: '5. Pastoral & Discipline', icon: HeartHandshake },
              { id: 'faculty', label: '6. Faculty & Families', icon: Users },
              { id: 'terms', label: '7. Terms & Governance', icon: ShieldCheck },
            ].map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                onClick={() => setActiveTab(id as any)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition cursor-pointer ${
                  activeTab === id
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/70'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{label}</span>
              </button>
            ))}
          </div>

          {/* Body Content */}
          <div className="p-6 sm:p-8 overflow-y-auto space-y-6 text-xs text-slate-700 leading-relaxed flex-1">
            {activeTab === 'overview' && (
              <div className="space-y-4">
                <div className="p-4 bg-blue-50/80 rounded-2xl border border-blue-200 text-blue-950 flex items-start gap-3">
                  <Sparkles className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
                  <div>
                    <h4 className="text-sm font-bold text-blue-900">Enterprise Educational Architecture</h4>
                    <p className="mt-1 text-xs text-blue-800 leading-relaxed">
                      The Oskar Academy School Management System (SIS) was <strong>Designed and Developed by NexGrid Digital Systems</strong> to provide private educational institutions with end-to-end operational rigor, institutional transparency, and streamlined stakeholder governance.
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
                    <h5 className="font-bold text-slate-900 text-sm">Key Operating Pillars:</h5>
                    <ul className="list-disc pl-4 space-y-1.5 text-slate-600">
                      <li><strong>Unified RBAC Architecture:</strong> 8 distinct stakeholder portals with isolated state and permission scopes.</li>
                      <li><strong>Multi-Factor Gmail OTP:</strong> Secure 2-Step verification for administrative leadership via Google Workspace Gmail API.</li>
                      <li><strong>Grade-Specific Document Verification:</strong> Enforces Pre-K birth/clinic checks through Senior High official transcripts.</li>
                      <li><strong>Bulk Bank Statement Cross-Checking:</strong> Automated matching of bank deposits against student account numbers.</li>
                    </ul>
                  </div>

                  <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
                    <h5 className="font-bold text-slate-900 text-sm">Governance Safeguards:</h5>
                    <ul className="list-disc pl-4 space-y-1.5 text-slate-600">
                      <li><strong>Strict 15-Day Stream Change Rule:</strong> Automated rejection of stream change requests filed past the 15-day term cutoff.</li>
                      <li><strong>Restricted Credential Resets:</strong> Hardened policy permitting password resets exclusively via Finance, Registrar, or Principal.</li>
                      <li><strong>Max 30 Classroom Capacity:</strong> Intelligent overflow routing preventing classroom overcrowding.</li>
                      <li><strong>Encrypted Pastoral Case Notes:</strong> Confidentiality protection for sensitive student counselling records.</li>
                    </ul>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'admissions' && (
              <div className="space-y-4">
                <h4 className="text-sm font-bold text-slate-900">Section 1: Admissions & Registrar Portal</h4>
                <p>
                  The Registrar portal manages student intake from application submission to official enrollment and student card issuance.
                </p>
                <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-3">
                  <h5 className="font-bold text-slate-900">Mandatory Document Requirements by Grade:</h5>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="p-3 bg-white rounded-lg border border-slate-200">
                      <span className="font-bold text-blue-700 block">Pre-K & Kindergarten</span>
                      <p className="text-[11px] text-slate-600 mt-1">
                        • Birth Certificate (Proof of Age)<br />
                        • Clinic / Immunization Card
                      </p>
                    </div>
                    <div className="p-3 bg-white rounded-lg border border-slate-200">
                      <span className="font-bold text-blue-700 block">Primary School (Grades 1-8)</span>
                      <p className="text-[11px] text-slate-600 mt-1">
                        • Birth Certificate<br />
                        • Immunization Card<br />
                        • Official Prior Grade Report Card
                      </p>
                    </div>
                    <div className="p-3 bg-white rounded-lg border border-slate-200">
                      <span className="font-bold text-blue-700 block">High School (Grades 9-10)</span>
                      <p className="text-[11px] text-slate-600 mt-1">
                        • Birth Certificate<br />
                        • Grade 8 Ministry Certificate<br />
                        • Previous Academic Transcript
                      </p>
                    </div>
                    <div className="p-3 bg-white rounded-lg border border-slate-200">
                      <span className="font-bold text-blue-700 block">Senior High (Grades 11-12)</span>
                      <p className="text-[11px] text-slate-600 mt-1">
                        • Grade 10 National Exam Certificate<br />
                        • Official Transfer Letter from prior school<br />
                        • Certified Transcript of Records
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'finance' && (
              <div className="space-y-4">
                <h4 className="text-sm font-bold text-slate-900">Section 2: Finance Office & Automated Bank Cross-Checking</h4>
                <p>
                  The Finance Office manages tuition tracking, fee waiver grants, invoice generation, and automated bank statement reconciliation.
                </p>
                <div className="p-4 bg-emerald-50 rounded-xl border border-emerald-200 text-emerald-950 space-y-2">
                  <h5 className="font-bold">Bank Statement Cross-Checking Workflow:</h5>
                  <ol className="list-decimal pl-5 space-y-1 text-emerald-900">
                    <li>Import statement file (.csv / .xlsx) from CBE, Awash, Dashen, or Telebirr.</li>
                    <li>The automated engine compares depositor references against student banking accounts (e.g. OSK-ACC-101).</li>
                    <li>Verified transactions receive 100% confidence matching badges for instant 1-click ledger reconciliation.</li>
                    <li>Upon confirmation, the system marks the student invoice as Paid and issues a signed, stamped official receipt.</li>
                  </ol>
                </div>
              </div>
            )}

            {activeTab === 'program' && (
              <div className="space-y-4">
                <h4 className="text-sm font-bold text-slate-900">Section 3: Program Office & Capacity Planning</h4>
                <p>
                  Governs class section sizing and stream allocations to maintain optimal teacher-to-student ratios.
                </p>
                <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
                  <h5 className="font-bold text-slate-900">Classroom Sizing Rule: Max 30 Students</h5>
                  <p className="text-slate-600">
                    Whenever an active homeroom reaches 30 enrolled students, incoming registrations automatically route to the next available section or initiate a new section request for administrative review.
                  </p>
                </div>
              </div>
            )}

            {activeTab === 'principal' && (
              <div className="space-y-4">
                <h4 className="text-sm font-bold text-slate-900">Section 4: Principal Executive Approvals</h4>
                <p>
                  Oversees school-wide academic indicators, faculty leave requests, and senior stream change authorizations.
                </p>
                <div className="p-4 bg-amber-50 rounded-xl border border-amber-200 text-amber-950 space-y-2">
                  <h5 className="font-bold">Strict 15-Day Stream Change Policy:</h5>
                  <p className="text-amber-900">
                    Grade 11 & 12 scholars requesting to switch between the Natural Sciences and Social Sciences streams must submit their petition within 15 days of term opening. Requests submitted on Day 16 or later are locked by system governance.
                  </p>
                </div>
              </div>
            )}

            {activeTab === 'counsellor' && (
              <div className="space-y-4">
                <h4 className="text-sm font-bold text-slate-900">Section 5: Counsellor & Pastoral Care</h4>
                <p>
                  Balances disciplinary interventions with student merit recognition and confidential parent-teacher conference scheduling.
                </p>
              </div>
            )}

            {activeTab === 'faculty' && (
              <div className="space-y-4">
                <h4 className="text-sm font-bold text-slate-900">Section 6: Faculty, Student & Parent Ecosystems</h4>
                <p>
                  Connects teachers, students, and guardians in a transparent learning loop featuring continuous assessment marksheets, digital student IDs, and real-time attendance alerts.
                </p>
              </div>
            )}

            {activeTab === 'terms' && (
              <div className="space-y-4">
                <h4 className="text-sm font-bold text-slate-900">Section 7: Terms of Service & NexGrid Digital SLA</h4>
                <p>
                  Covers intellectual property, student data privacy (FERPA compliance), 99.9% uptime commitments, and 24/7 technical assistance through NexGrid Digital Systems.
                </p>
              </div>
            )}
          </div>

          {/* Footer Bar with Watermark & PDF Download */}
          <div className="bg-slate-100 border-t border-slate-200 px-6 py-3 flex flex-wrap items-center justify-between gap-3 shrink-0">
            <div className="flex items-center gap-2">
              <span className="font-mono text-[11px] text-slate-500 font-semibold">
                ★ Designed and Developed by NexGrid Digital Systems
              </span>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleDownloadPdf}
                disabled={isGeneratingPdf}
                className="flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow transition cursor-pointer"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Download PDF (With Letterhead)</span>
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
