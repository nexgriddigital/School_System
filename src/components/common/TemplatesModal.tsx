import React from 'react';
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
  X, 
  ArrowRight, 
  Sparkles,
  ShieldCheck,
  CheckCircle2
} from 'lucide-react';

interface TemplateItem {
  role: UserRole;
  name: string;
  category: 'Administration' | 'Academics' | 'Students & Families';
  icon: React.FC<{ className?: string }>;
  accentColor: string;
  badgeBg: string;
  description: string;
  features: string[];
  sampleUser: string;
}

export const TemplatesModal: React.FC = () => {
  const { showTemplatesModal, setShowTemplatesModal, launchTemplate, schoolName } = useSchool();

  if (!showTemplatesModal) return null;

  const templates: TemplateItem[] = [
    {
      role: 'REGISTRAR',
      name: 'Admissions & Registrar',
      category: 'Administration',
      icon: Building2,
      accentColor: 'text-blue-600 border-blue-200 bg-blue-50/50',
      badgeBg: 'bg-blue-100 text-blue-800',
      description: 'Handles complete Grade 9–12 enrollment, prerequisite document verification, and strict institutional policies.',
      features: [
        '8th-grade certificate & entrance score verification',
        'Auto-generated photo ID card with secure QR code',
        'Strict 15-day Natural/Social stream transfer lock'
      ],
      sampleUser: 'W/ro Genet Assefa (Chief Registrar)'
    },
    {
      role: 'FINANCE',
      name: 'Finance & Bursar',
      category: 'Administration',
      icon: CreditCard,
      accentColor: 'text-emerald-600 border-emerald-200 bg-emerald-50/50',
      badgeBg: 'bg-emerald-100 text-emerald-800',
      description: 'Financial ledger, tuition invoice lifecycle, and bulk automated bank reconciliation.',
      features: [
        'CBE & Telebirr bank statement CSV/Excel matching',
        'One-click bulk cross-check and invoice auto-settlement',
        'Official watermarked & stamped tuition receipts'
      ],
      sampleUser: 'Ato Tamrat Bekele (Finance Bursar)'
    },
    {
      role: 'PROGRAM_OFFICE',
      name: 'Academic Program Office',
      category: 'Administration',
      icon: Layers,
      accentColor: 'text-indigo-600 border-indigo-200 bg-indigo-50/50',
      badgeBg: 'bg-indigo-100 text-indigo-800',
      description: 'Curriculum planning, grade-level quotas, and intelligent algorithmic student distribution.',
      features: [
        'Auto-balanced sections by entrance score & gender parity',
        'Stream change request evaluation & capacity limits',
        'Homeroom teacher section assignments'
      ],
      sampleUser: 'Dr. Yared Kassa (Head of Program Office)'
    },
    {
      role: 'COUNSELLOR',
      name: 'Pastoral Care & Guidance',
      category: 'Administration',
      icon: HeartHandshake,
      accentColor: 'text-rose-600 border-rose-200 bg-rose-50/50',
      badgeBg: 'bg-rose-100 text-rose-800',
      description: 'Confidential student welfare management, disciplinary tracking, and behavioural records.',
      features: [
        'Multi-level disciplinary tracking with homeroom notification',
        'Confidential pastoral progress evaluations',
        'Behavioral trend monitoring across grades'
      ],
      sampleUser: 'Dr. Bethlehem Tadesse (Guidance Counsellor)'
    },
    {
      role: 'PRINCIPAL',
      name: 'Principal & Executive Oversight',
      category: 'Administration',
      icon: GraduationCap,
      accentColor: 'text-amber-600 border-amber-200 bg-amber-50/50',
      badgeBg: 'bg-amber-100 text-amber-800',
      description: 'Supreme institutional executive management, appeals resolution, and policy broadcasts.',
      features: [
        'Faculty day-off approval with medical slip review',
        'Executive reversal of disciplinary sanctions',
        'Emergency lost ID reprint overrides & bulletin posts'
      ],
      sampleUser: 'Prof. Mengistu Haile (Headmaster)'
    },
    {
      role: 'TEACHER',
      name: 'Faculty & Homeroom Portal',
      category: 'Academics',
      icon: Users,
      accentColor: 'text-purple-600 border-purple-200 bg-purple-50/50',
      badgeBg: 'bg-purple-100 text-purple-800',
      description: 'Classroom management hub for daily attendance roll-call, gradebooks, and direct messaging.',
      features: [
        'Daily homeroom roll-call with real-time statistics',
        'Continuous assessment score entry (tests, midterms, finals)',
        'Telegram-style instant direct chat with parents & scholars'
      ],
      sampleUser: 'Ato Dawit Lemma (Homeroom 9A Teacher)'
    },
    {
      role: 'STUDENT',
      name: 'Student Scholar Portal',
      category: 'Students & Families',
      icon: User,
      accentColor: 'text-cyan-600 border-cyan-200 bg-cyan-50/50',
      badgeBg: 'bg-cyan-100 text-cyan-800',
      description: 'Dedicated student workspace for term results, schedule, credentials, and institutional requests.',
      features: [
        'Official printable terminal report cards',
        'Digital barcoded student ID card with wallet preview',
        'Lost ID multi-department replacement clearance workflow'
      ],
      sampleUser: 'Yared Melaku (Grade 9 Scholar)'
    },
    {
      role: 'PARENT',
      name: 'Guardian & Parent Portal',
      category: 'Students & Families',
      icon: Home,
      accentColor: 'text-teal-600 border-teal-200 bg-teal-50/50',
      badgeBg: 'bg-teal-100 text-teal-800',
      description: 'Parent window for tuition management, academic monitoring, and direct faculty communication.',
      features: [
        'Online bank deposit slip upload & fee tracking',
        'Immediate download of stamped official receipts',
        'Two-way direct Telegram chat with homeroom faculty'
      ],
      sampleUser: 'Melaku Tadesse (Parent of Yared Melaku)'
    }
  ];

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4 sm:p-6 animate-in fade-in duration-200">
      <div 
        className="relative bg-white w-full max-w-5xl rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[92vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-[#0B192C] text-white p-6 border-b border-slate-800 flex items-start justify-between">
          <div className="flex items-start gap-3">
            <div className="w-12 h-12 rounded-xl bg-blue-600 flex items-center justify-center text-white font-bold text-2xl shadow-md border border-blue-400/40 shrink-0">
              <Sparkles className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl sm:text-2xl font-bold tracking-tight font-oskar-vintage">
                  Interactive System Templates
                </h2>
                <span className="text-[11px] font-semibold uppercase tracking-wider bg-blue-900/80 text-blue-300 px-2 py-0.5 rounded border border-blue-700/50">
                  Live Preview
                </span>
              </div>
              <p className="text-sm text-slate-300 mt-1 max-w-2xl leading-relaxed">
                {schoolName} provides tailored workspaces for each educational stakeholder. Select any role below to launch its interactive template and test the real features immediately.
              </p>
            </div>
          </div>
          
          <button
            onClick={() => setShowTemplatesModal(false)}
            className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition"
            title="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Informative banner */}
        <div className="bg-blue-50 px-6 py-3 border-b border-blue-100 flex items-center justify-between text-xs text-blue-900">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-blue-600 shrink-0" />
            <span>
              <strong>How it works:</strong> All 8 department workflows are fully functional with seeded Ethiopian academic data, Grade 9–12 verification policies, and bank matching.
            </span>
          </div>
          <span className="hidden sm:inline text-blue-600 font-medium">8 Integrated Portals</span>
        </div>

        {/* Templates Grid */}
        <div className="p-6 overflow-y-auto space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {templates.map((tmpl) => {
              const Icon = tmpl.icon;
              return (
                <div 
                  key={tmpl.role}
                  className="bg-white rounded-xl border border-slate-200 hover:border-blue-400 p-5 shadow-sm hover:shadow-md transition-all flex flex-col justify-between group"
                >
                  <div>
                    {/* Top Row */}
                    <div className="flex items-start justify-between gap-3 mb-2.5">
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-lg flex items-center justify-center border ${tmpl.accentColor}`}>
                          <Icon className="w-5 h-5" />
                        </div>
                        <div>
                          <h3 className="font-bold text-slate-900 text-base group-hover:text-blue-600 transition">
                            {tmpl.name}
                          </h3>
                          <span className="text-[11px] text-slate-500">
                            Persona: <span className="font-medium text-slate-700">{tmpl.sampleUser}</span>
                          </span>
                        </div>
                      </div>
                      <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${tmpl.badgeBg}`}>
                        {tmpl.category}
                      </span>
                    </div>

                    {/* Description */}
                    <p className="text-xs text-slate-600 mb-3 leading-relaxed">
                      {tmpl.description}
                    </p>

                    {/* Features list */}
                    <ul className="space-y-1.5 mb-4 text-xs text-slate-700">
                      {tmpl.features.map((feat, idx) => (
                        <li key={idx} className="flex items-start gap-2">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                          <span className="text-[11px] text-slate-600">{feat}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Launch CTA button */}
                  <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                    <span className="text-[11px] text-slate-400 font-medium">Full Interactive Sandbox</span>
                    <button
                      onClick={() => launchTemplate(tmpl.role)}
                      className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white rounded-lg text-xs font-semibold shadow-sm hover:shadow transition"
                    >
                      <span>Launch Template</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Footer */}
        <div className="bg-slate-50 px-6 py-4 border-t border-slate-200 flex items-center justify-between text-xs text-slate-500">
          <p>
            Switch freely between any of the 8 stakeholder portals anytime using the top bar or workspace cards.
          </p>
          <button
            onClick={() => setShowTemplatesModal(false)}
            className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-700 font-semibold rounded-lg transition"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
