import React from 'react';
import { SchoolProvider, useSchool } from './context/SchoolContext';
import { Header } from './components/common/Header';
import { AllTemplatesBottomSection } from './components/common/AllTemplatesBottomSection';
import { TemplatesModal } from './components/common/TemplatesModal';
import { IdCardModal } from './components/common/IdCardModal';
import { ReceiptModal } from './components/common/ReceiptModal';
import { DocumentViewerModal } from './components/common/DocumentViewerModal';
import { AdmissionsView } from './components/admissions/AdmissionsView';
import { FinanceView } from './components/finance/FinanceView';
import { ProgramOfficeView } from './components/program/ProgramOfficeView';
import { CounsellorView } from './components/counsellor/CounsellorView';
import { PrincipalView } from './components/principal/PrincipalView';
import { TeacherView } from './components/teacher/TeacherView';
import { StudentView } from './components/student/StudentView';
import { ParentView } from './components/parent/ParentView';
import { LoginView } from './components/auth/LoginView';
import { Sparkles } from 'lucide-react';

const MainContent: React.FC = () => {
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

const AppFooter: React.FC = () => {
  const { schoolName, setShowTemplatesModal } = useSchool();
  return (
    <footer className="bg-white border-t border-slate-200 py-6 mt-12 text-center text-xs text-slate-500">
      <div className="max-w-7xl mx-auto px-4 flex flex-col gap-3">
        {/* Link at the bottom to show how it works */}
        <div className="flex items-center justify-center">
          <button
            onClick={() => setShowTemplatesModal(true)}
            className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-50 hover:bg-blue-100 text-blue-700 font-semibold text-xs border border-blue-200 transition shadow-xs group"
          >
            <Sparkles className="w-3.5 h-3.5 text-blue-600 group-hover:scale-110 transition-transform" />
            <span>Interactive System Templates & Stakeholder Portals (Click to see how it works)</span>
          </button>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-between gap-2 pt-2 border-t border-slate-100">
          <p className="font-oskar-vintage font-bold tracking-wider text-slate-700">
            {schoolName.toUpperCase()} • SCHOOL MANAGEMENT SYSTEM (SIS)
          </p>
          <p className="text-[11px] text-slate-400">
            Compliant with Grade-Specific Verification, 15-Day Stream Policies, Bulk Bank Statement Cross-Checking & Pastoral Care
          </p>
        </div>
      </div>
    </footer>
  );
};

const MainApp: React.FC = () => {
  const { isAuthenticated } = useSchool();

  return (
    <div className="min-h-screen bg-slate-100/70 text-slate-800 font-sans flex flex-col">
      <Header />
      <div className="flex-1">
        {isAuthenticated ? <MainContent /> : <LoginView />}
      </div>
      <AppFooter />
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

