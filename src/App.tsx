import React, { useState } from 'react';
import { SchoolProvider, useSchool } from './context/SchoolContext';
import { Header } from './components/common/Header';
import { IdCardModal } from './components/common/IdCardModal';
import { ReceiptModal } from './components/common/ReceiptModal';
import { DocumentViewerModal } from './components/common/DocumentViewerModal';
import { TermsAndConditionsModal } from './components/common/TermsAndConditionsModal';
import { InstructionsManualModal } from './components/common/InstructionsManualModal';
import { AdmissionsView } from './components/admissions/AdmissionsView';
import { FinanceView } from './components/finance/FinanceView';
import { ProgramOfficeView } from './components/program/ProgramOfficeView';
import { CounsellorView } from './components/counsellor/CounsellorView';
import { PrincipalView } from './components/principal/PrincipalView';
import { TeacherView } from './components/teacher/TeacherView';
import { StudentView } from './components/student/StudentView';
import { ParentView } from './components/parent/ParentView';
import { LoginView } from './components/auth/LoginView';
import { SessionTimeoutManager } from './components/common/SessionTimeoutManager';
import { FloatingMascotCompanion } from './components/common/FloatingMascotCompanion';
import { QuickActionsFAB } from './components/common/QuickActionsFAB';
import { Sparkles, Shield, BookOpen, Download } from 'lucide-react';
import { downloadInstructionsManualPdf } from './services/manualPdfService';

const MainContent: React.FC<{
  onOpenTerms: () => void;
  onOpenManual: () => void;
}> = ({ onOpenTerms, onOpenManual }) => {
  const { 
    currentRole, 
    activeDocumentModal, 
    closeDocumentViewer 
  } = useSchool();

  return (
    <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      {/* Active Department / Stakeholder Workspace */}
      {currentRole === 'REGISTRAR' && <AdmissionsView />}
      {currentRole === 'FINANCE' && <FinanceView />}
      {currentRole === 'PROGRAM_OFFICE' && <ProgramOfficeView />}
      {currentRole === 'COUNSELLOR' && <CounsellorView />}
      {currentRole === 'PRINCIPAL' && <PrincipalView />}
      {currentRole === 'TEACHER' && <TeacherView />}
      {currentRole === 'STUDENT' && <StudentView />}
      {currentRole === 'PARENT' && <ParentView />}

      {/* Global Modals */}
      <IdCardModal />
      <ReceiptModal />
      {activeDocumentModal && (
        <DocumentViewerModal
          isOpen={activeDocumentModal.isOpen}
          onClose={closeDocumentViewer}
          title={activeDocumentModal.title}
          subtitle={activeDocumentModal.subtitle}
          docName={activeDocumentModal.docName}
          docUrl={activeDocumentModal.docUrl}
          category={activeDocumentModal.category}
          watermark={activeDocumentModal.watermark}
          canSign={activeDocumentModal.canSign}
          documentId={activeDocumentModal.documentId}
          signatoryRole={activeDocumentModal.signatoryRole}
          onSignDocument={activeDocumentModal.onSignDocument}
          metadata={activeDocumentModal.metadata}
        />
      )}
    </main>
  );
};

const AppFooter: React.FC<{
  onOpenTerms: () => void;
  onOpenManual: () => void;
}> = ({ onOpenTerms, onOpenManual }) => {
  const { schoolName, startGlobalLoading } = useSchool();
  const [isDownloading, setIsDownloading] = useState(false);

  const handleDownloadManual = () => {
    setIsDownloading(true);
    startGlobalLoading('Generating System Documentation Manual PDF with letterhead...', 1200);
    try {
      downloadInstructionsManualPdf(schoolName);
    } catch (e) {
      console.error(e);
    } finally {
      setTimeout(() => setIsDownloading(false), 800);
    }
  };

  return (
    <footer className="bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 py-8 mt-12 text-center text-xs text-slate-500 dark:text-slate-400 transition-colors">
      <div className="max-w-7xl mx-auto px-4 flex flex-col gap-4">
        {/* Quick Access Badges for Customer Presentation */}
        <div className="flex flex-wrap items-center justify-center gap-2">
          <button
            onClick={onOpenManual}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-amber-50 hover:bg-amber-100 dark:bg-amber-950/60 dark:hover:bg-amber-900/60 text-amber-800 dark:text-amber-300 font-semibold text-xs border border-amber-200 dark:border-amber-800 transition cursor-pointer"
          >
            <BookOpen className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
            <span>Instructions Manual</span>
          </button>

          <button
            onClick={handleDownloadManual}
            disabled={isDownloading}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-950/60 dark:hover:bg-emerald-900/60 text-emerald-800 dark:text-emerald-300 font-semibold text-xs border border-emerald-200 dark:border-emerald-800 transition cursor-pointer"
            title="Download PDF Manual with NexGrid Digital Letterhead on each page"
          >
            <Download className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
            <span>Download PDF Manual</span>
          </button>

          <button
            onClick={onOpenTerms}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-semibold text-xs border border-slate-300 dark:border-slate-700 transition cursor-pointer"
          >
            <Shield className="w-3.5 h-3.5 text-slate-600 dark:text-slate-400" />
            <span>Terms & Conditions</span>
          </button>
        </div>

        {/* Primary Attribution & System Info */}
        <div className="py-2 border-y border-slate-100 dark:border-slate-800/80 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs">
          <div className="flex items-center gap-2">
            <span className="font-bold text-slate-900 dark:text-white tracking-wide">
              {schoolName.toUpperCase()} • SCHOOL MANAGEMENT SYSTEM (SIS)
            </span>
            <span className="text-[10px] bg-blue-100 dark:bg-blue-900/60 text-blue-800 dark:text-blue-300 font-mono px-2 py-0.5 rounded-md font-bold border border-blue-200 dark:border-blue-700/50">
              v2.4 Production
            </span>
          </div>

          <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400 font-medium">
            <span>Institutional Operations & Governance Portal</span>
          </div>
        </div>

        {/* Policy & Legal Footnotes */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-2 text-[11px] text-slate-400 dark:text-slate-500">
          <p>
            Compliant with Grade-Specific Verification, 15-Day Stream Policies, Bulk Bank Statement Cross-Checking & Pastoral Care
          </p>
          <div className="flex items-center gap-3">
            <button onClick={onOpenTerms} className="hover:text-blue-600 dark:hover:text-blue-400 underline cursor-pointer">
              Terms & Conditions
            </button>
            <span>&bull;</span>
            <button onClick={onOpenManual} className="hover:text-blue-600 dark:hover:text-blue-400 underline cursor-pointer">
              System Documentation
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
};

const MainApp: React.FC = () => {
  const { isAuthenticated } = useSchool();
  const [showTermsModal, setShowTermsModal] = useState(false);
  const [showManualModal, setShowManualModal] = useState(false);

  return (
    <div className="min-h-screen bg-slate-100/70 dark:bg-[#090d16] text-slate-800 dark:text-slate-100 font-sans flex flex-col relative transition-colors duration-200">
      <Header onOpenTerms={() => setShowTermsModal(true)} onOpenManual={() => setShowManualModal(true)} />
      
      {/* Institutional Session Security Inactivity Monitor & Modal */}
      <SessionTimeoutManager />

      {/* Floating Mascot Scholar Companion (Floats around UI, shows loading flight animations when logged in) */}
      <FloatingMascotCompanion />

      {/* Global Administrative Quick Actions FAB (Floating Action Button: Registrar, Finance, Principal) */}
      <QuickActionsFAB />

      <div className="flex-1">
        {isAuthenticated ? (
          <>
            <MainContent 
              onOpenTerms={() => setShowTermsModal(true)} 
              onOpenManual={() => setShowManualModal(true)} 
            />
            <AppFooter 
              onOpenTerms={() => setShowTermsModal(true)} 
              onOpenManual={() => setShowManualModal(true)} 
            />
          </>
        ) : (
          <LoginView onOpenTerms={() => setShowTermsModal(true)} onOpenManual={() => setShowManualModal(true)} />
        )}
      </div>

      {/* Terms and Conditions Modal */}
      <TermsAndConditionsModal
        isOpen={showTermsModal}
        onClose={() => setShowTermsModal(false)}
      />

      {/* Instructions Manual Modal (With PDF Download on every page with letterhead) */}
      <InstructionsManualModal
        isOpen={showManualModal}
        onClose={() => setShowManualModal(false)}
      />
    </div>
  );
};

export default function App() {
  return (
    <SchoolProvider>
      <MainApp />
    </SchoolProvider>
  );
}
