import React, { useState } from 'react';
import { SchoolProvider, useSchool } from './context/SchoolContext';
import { Header } from './components/common/Header';
import { AllTemplatesBottomSection } from './components/common/AllTemplatesBottomSection';
import { TemplatesModal } from './components/common/TemplatesModal';
import { IdCardModal } from './components/common/IdCardModal';
import { ReceiptModal } from './components/common/ReceiptModal';
import { DocumentViewerModal } from './components/common/DocumentViewerModal';
import { TermsAndConditionsModal } from './components/common/TermsAndConditionsModal';
import { InstructionsManualModal } from './components/common/InstructionsManualModal';
import { ProductionWatermark } from './components/common/ProductionWatermark';
import { AdmissionsView } from './components/admissions/AdmissionsView';
import { FinanceView } from './components/finance/FinanceView';
import { ProgramOfficeView } from './components/program/ProgramOfficeView';
import { CounsellorView } from './components/counsellor/CounsellorView';
import { PrincipalView } from './components/principal/PrincipalView';
import { TeacherView } from './components/teacher/TeacherView';
import { StudentView } from './components/student/StudentView';
import { ParentView } from './components/parent/ParentView';
import { LoginView } from './components/auth/LoginView';
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

      {/* All Templates & Stakeholder Workspaces included on the bottom as rich previews */}
      <AllTemplatesBottomSection />

      {/* Global Modals */}
      <IdCardModal />
      <ReceiptModal />
      <TemplatesModal />
      {activeDocumentModal && (
        <DocumentViewerModal
          isOpen={activeDocumentModal.isOpen}
          onClose={closeDocumentViewer}
          title={activeDocumentModal.title}
          subtitle={activeDocumentModal.subtitle}
          docName={activeDocumentModal.docName}
          docUrl={activeDocumentModal.docUrl}
          category={activeDocumentModal.category}
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
  const { schoolName, setShowTemplatesModal } = useSchool();
  const [isDownloading, setIsDownloading] = useState(false);

  const handleDownloadManual = () => {
    setIsDownloading(true);
    try {
      downloadInstructionsManualPdf(schoolName);
    } catch (e) {
      console.error(e);
    } finally {
      setTimeout(() => setIsDownloading(false), 800);
    }
  };

  return (
    <footer className="bg-white border-t border-slate-200 py-8 mt-12 text-center text-xs text-slate-500">
      <div className="max-w-7xl mx-auto px-4 flex flex-col gap-4">
        {/* Quick Access Badges for Customer Presentation */}
        <div className="flex flex-wrap items-center justify-center gap-2">
          <button
            onClick={() => setShowTemplatesModal(true)}
            className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-50 hover:bg-blue-100 text-blue-700 font-semibold text-xs border border-blue-200 transition shadow-2xs group cursor-pointer"
          >
            <Sparkles className="w-3.5 h-3.5 text-blue-600 group-hover:scale-110 transition-transform" />
            <span>Interactive System Templates & Stakeholder Portals</span>
          </button>

          <button
            onClick={onOpenManual}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-amber-50 hover:bg-amber-100 text-amber-800 font-semibold text-xs border border-amber-200 transition cursor-pointer"
          >
            <BookOpen className="w-3.5 h-3.5 text-amber-600" />
            <span>Instructions Manual</span>
          </button>

          <button
            onClick={handleDownloadManual}
            disabled={isDownloading}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-50 hover:bg-emerald-100 text-emerald-800 font-semibold text-xs border border-emerald-200 transition cursor-pointer"
            title="Download PDF Manual with NexGrid Digital Letterhead on each page"
          >
            <Download className="w-3.5 h-3.5 text-emerald-600" />
            <span>Download PDF Manual</span>
          </button>

          <button
            onClick={onOpenTerms}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs border border-slate-300 transition cursor-pointer"
          >
            <Shield className="w-3.5 h-3.5 text-slate-600" />
            <span>Terms & Conditions</span>
          </button>
        </div>

        {/* Primary Attribution & Watermark Banner */}
        <div className="py-2 border-y border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs">
          <div className="flex items-center gap-2">
            <span className="font-bold text-slate-900 tracking-wide">
              {schoolName.toUpperCase()} • SCHOOL MANAGEMENT SYSTEM (SIS)
            </span>
            <span className="text-[10px] bg-blue-100 text-blue-800 font-mono px-2 py-0.5 rounded-md font-bold">
              v2.4 Production
            </span>
          </div>

          <div className="flex items-center gap-1.5 text-blue-700 font-bold tracking-tight">
            <span>Designed and Developed by NexGrid Digital Systems</span>
          </div>
        </div>

        {/* Policy & Legal Footnotes */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-2 text-[11px] text-slate-400">
          <p>
            Compliant with Grade-Specific Verification, 15-Day Stream Policies, Bulk Bank Statement Cross-Checking & Pastoral Care
          </p>
          <div className="flex items-center gap-3">
            <button onClick={onOpenTerms} className="hover:text-blue-600 underline cursor-pointer">
              Terms & Conditions
            </button>
            <span>&bull;</span>
            <button onClick={onOpenManual} className="hover:text-blue-600 underline cursor-pointer">
              System Documentation
            </button>
            <span>&bull;</span>
            <span>All Rights Reserved &copy; 2026 NexGrid Digital Systems</span>
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
    <div className="min-h-screen bg-slate-100/70 text-slate-800 font-sans flex flex-col relative">
      <Header onOpenTerms={() => setShowTermsModal(true)} onOpenManual={() => setShowManualModal(true)} />
      <div className="flex-1">
        {isAuthenticated ? (
          <MainContent 
            onOpenTerms={() => setShowTermsModal(true)} 
            onOpenManual={() => setShowManualModal(true)} 
          />
        ) : (
          <LoginView onOpenTerms={() => setShowTermsModal(true)} onOpenManual={() => setShowManualModal(true)} />
        )}
      </div>
      <AppFooter 
        onOpenTerms={() => setShowTermsModal(true)} 
        onOpenManual={() => setShowManualModal(true)} 
      />

      {/* Floating Production Presentation Watermark & Quick Actions Toolbar */}
      <ProductionWatermark
        onOpenTerms={() => setShowTermsModal(true)}
        onOpenManual={() => setShowManualModal(true)}
      />

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
