import React, { useState, useMemo } from 'react';
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
  Sparkles, 
  CheckCircle2, 
  ChevronRight,
  ShieldCheck
} from 'lucide-react';

interface TemplatePreviewItem {
  role: UserRole;
  name: string;
  category: 'Administration' | 'Academics' | 'Students & Families';
  icon: React.FC<{ className?: string }>;
  accentColor: string;
  badgeBg: string;
  borderHover: string;
  iconBg: string;
  description: string;
  features: string[];
  persona: string;
  personaTitle: string;
}

export const AllTemplatesBottomSection: React.FC = () => {
  const { currentRole, setCurrentRole } = useSchool();
  const [previewFilter, setPreviewFilter] = useState<'ALL' | 'Administration' | 'Academics' | 'Students & Families'>('ALL');

  const templates: TemplatePreviewItem[] = useMemo(() => [
    {
      role: 'REGISTRAR',
      name: 'Admissions & Registrar',
      category: 'Administration',
      icon: Building2,
      accentColor: 'text-blue-600',
      badgeBg: 'bg-blue-100 text-blue-800 border-blue-200',
      borderHover: 'hover:border-blue-500',
      iconBg: 'bg-blue-50 text-blue-600 border-blue-200',
      description: 'Central admissions registry for Grade 9–12 onboarding, prerequisite certificate screening, and strict institutional policies.',
      features: [
        '8th-grade certificate & national entrance score validation',
        'Auto-generated official student photo ID card with secure QR code',
        'Enforce strict 15-day Natural vs. Social stream transfer lock',
        'Certified academic transcript generation with Ministry seal'
      ],
      persona: 'W/ro Genet Assefa',
      personaTitle: 'Chief Admissions Officer & Registrar'
    },
    {
      role: 'FINANCE',
      name: 'Finance & Bursar Office',
      category: 'Administration',
      icon: CreditCard,
      accentColor: 'text-emerald-600',
      badgeBg: 'bg-emerald-100 text-emerald-800 border-emerald-200',
      borderHover: 'hover:border-emerald-500',
      iconBg: 'bg-emerald-50 text-emerald-600 border-emerald-200',
      description: 'Comprehensive financial accounting, term tuition fee schedules, student ledgers, and automated bank reconciliation.',
      features: [
        'CBE & Telebirr bank statement CSV/Excel bulk matching',
        'One-click automated transaction cross-check & invoice settlement',
        'Official watermarked & digital stamped tuition receipts',
        'Tuition balance tracking and deposit slip verification'
      ],
      persona: 'Ato Tamrat Bekele',
      personaTitle: 'Bursar & Chief Financial Controller'
    },
    {
      role: 'PROGRAM_OFFICE',
      name: 'Academic Program Office',
      category: 'Administration',
      icon: Layers,
      accentColor: 'text-indigo-600',
      badgeBg: 'bg-indigo-100 text-indigo-800 border-indigo-200',
      borderHover: 'hover:border-indigo-500',
      iconBg: 'bg-indigo-50 text-indigo-600 border-indigo-200',
      description: 'Master academic timetable, curriculum planning, grade quotas, and algorithmic student section allocation.',
      features: [
        'Balanced section distribution based on entrance score & gender parity',
        'Evaluation of 15-day stream transfer requests within capacity caps',
        'Homeroom and subject faculty section assignments',
        'Master institutional examination timetables and schedules'
      ],
      persona: 'Dr. Yared Kassa',
      personaTitle: 'Head of Academic Program Office'
    },
    {
      role: 'COUNSELLOR',
      name: 'Pastoral Care & Guidance',
      category: 'Administration',
      icon: HeartHandshake,
      accentColor: 'text-rose-600',
      badgeBg: 'bg-rose-100 text-rose-800 border-rose-200',
      borderHover: 'hover:border-rose-500',
      iconBg: 'bg-rose-50 text-rose-600 border-rose-200',
      description: 'Confidential student guidance, pastoral welfare evaluations, behavioral observation logs, and multi-tier disciplinary management.',
      features: [
        'Confidential pastoral progress evaluations & study support plans',
        'Multi-level disciplinary tracking with homeroom notification',
        'Academic difficulty identification and behavioral trend monitoring',
        'Private family and student counseling session scheduling'
      ],
      persona: 'Dr. Bethlehem Tadesse',
      personaTitle: 'Lead Guidance Counsellor'
    },
    {
      role: 'PRINCIPAL',
      name: 'Principal & Executive Oversight',
      category: 'Administration',
      icon: GraduationCap,
      accentColor: 'text-amber-600',
      badgeBg: 'bg-amber-100 text-amber-800 border-amber-200',
      borderHover: 'hover:border-amber-500',
      iconBg: 'bg-amber-50 text-amber-600 border-amber-200',
      description: 'Supreme institutional executive management, faculty leave approvals, disciplinary appeal resolutions, and policy bulletins.',
      features: [
        'Faculty day-off approval with medical slip review',
        'Executive reversal and adjustment of disciplinary sanctions',
        'Emergency lost ID reprint overrides & institution-wide bulletins',
        'High-level school performance analytics and accreditation oversight'
      ],
      persona: 'Prof. Mengistu Haile',
      personaTitle: 'Headmaster & Executive Principal'
    },
    {
      role: 'TEACHER',
      name: 'Faculty & Homeroom Portal',
      category: 'Academics',
      icon: Users,
      accentColor: 'text-purple-600',
      badgeBg: 'bg-purple-100 text-purple-800 border-purple-200',
      borderHover: 'hover:border-purple-500',
      iconBg: 'bg-purple-50 text-purple-600 border-purple-200',
      description: 'Classroom instruction and homeroom hub for daily roll-calls, continuous assessment gradebooks, and direct parent messaging.',
      features: [
        'Daily homeroom roll-call with real-time attendance statistics',
        'Continuous assessment score entry (quizzes, tests, midterms, finals)',
        'Telegram-style instant direct chat with parents of students',
        'AI parent communication assistant & polite Amharic translation'
      ],
      persona: 'Ato Dawit Lemma',
      personaTitle: 'Homeroom Faculty (Section 9A)'
    },
    {
      role: 'STUDENT',
      name: 'Student Scholar Portal',
      category: 'Students & Families',
      icon: User,
      accentColor: 'text-cyan-600',
      badgeBg: 'bg-cyan-100 text-cyan-800 border-cyan-200',
      borderHover: 'hover:border-cyan-500',
      iconBg: 'bg-cyan-50 text-cyan-600 border-cyan-200',
      description: 'Dedicated student dashboard for examination results, official terminal report cards, digital ID cards, and institutional services.',
      features: [
        'Official printable terminal report cards (PDF generator)',
        'Digital barcoded student ID card with wallet preview',
        'Lost ID multi-department replacement clearance workflow',
        'Academic course schedule, exam timetables, and teacher contacts'
      ],
      persona: 'Yared Melaku',
      personaTitle: 'Grade 9 Scholar (Sec 9A)'
    },
    {
      role: 'PARENT',
      name: 'Guardian & Parent Portal',
      category: 'Students & Families',
      icon: Home,
      accentColor: 'text-teal-600',
      badgeBg: 'bg-teal-100 text-teal-800 border-teal-200',
      borderHover: 'hover:border-teal-500',
      iconBg: 'bg-teal-50 text-teal-600 border-teal-200',
      description: 'Family portal for tuition payments, bank deposit slip submissions, stamped receipt downloads, attendance alerts, and direct faculty chat.',
      features: [
        'Online bank deposit slip upload & tuition status tracking',
        'Instant download of watermarked & stamped official receipts',
        'Telegram chat with child\'s teachers, principal, and all school offices',
        '24/7 Smart School SIS AI Assistant chatbot for instant inquiries'
      ],
      persona: 'Melaku Tadesse',
      personaTitle: 'Parent of Yared Melaku'
    }
  ], []);

  const filteredTemplates = useMemo(() => {
    if (previewFilter === 'ALL') return templates;
    return templates.filter(t => t.category === previewFilter);
  }, [templates, previewFilter]);

  const handleSelectRole = (role: UserRole) => {
    setCurrentRole(role);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <section className="mt-14 pt-10 border-t border-slate-200/90 max-w-7xl mx-auto w-full">
      {/* Section Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-7">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-blue-100/90 text-blue-800 rounded-full text-xs font-bold uppercase tracking-wider mb-2 border border-blue-200">
            <Sparkles className="w-3.5 h-3.5 text-blue-600" />
            <span>Interactive Stakeholder Workspaces</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight font-oskar-vintage">
            All Institutional Templates & Live Workspaces
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 mt-1.5 max-w-2xl leading-relaxed">
            All 8 stakeholder portals are fully accessible with no login required. Click any template card below to switch directly into its live interface and workflows.
          </p>
        </div>

        {/* Category Filter Pills */}
        <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-xl text-xs font-semibold shrink-0 overflow-x-auto">
          <button
            onClick={() => setPreviewFilter('ALL')}
            className={`px-3 py-1.5 rounded-lg transition whitespace-nowrap ${
              previewFilter === 'ALL'
                ? 'bg-white text-slate-900 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            All Templates ({templates.length})
          </button>
          <button
            onClick={() => setPreviewFilter('Administration')}
            className={`px-3 py-1.5 rounded-lg transition whitespace-nowrap ${
              previewFilter === 'Administration'
                ? 'bg-white text-slate-900 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Administration (5)
          </button>
          <button
            onClick={() => setPreviewFilter('Academics')}
            className={`px-3 py-1.5 rounded-lg transition whitespace-nowrap ${
              previewFilter === 'Academics'
                ? 'bg-white text-slate-900 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Academics (1)
          </button>
          <button
            onClick={() => setPreviewFilter('Students & Families')}
            className={`px-3 py-1.5 rounded-lg transition whitespace-nowrap ${
              previewFilter === 'Students & Families'
                ? 'bg-white text-slate-900 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Students & Families (2)
          </button>
        </div>
      </div>

      {/* 8 Template Preview Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
        {filteredTemplates.map((tmpl) => {
          const Icon = tmpl.icon;
          const isActive = currentRole === tmpl.role;

          return (
            <div
              key={tmpl.role}
              onClick={() => handleSelectRole(tmpl.role)}
              className={`bg-white rounded-2xl border transition-all duration-200 flex flex-col justify-between overflow-hidden group cursor-pointer p-5 relative ${
                isActive 
                  ? 'border-blue-600 ring-2 ring-blue-500/30 shadow-md bg-blue-50/10' 
                  : `border-slate-200/90 shadow-sm hover:shadow-xl ${tmpl.borderHover}`
              }`}
            >
              {/* Top: Category and Status Badge */}
              <div>
                <div className="flex items-center justify-between gap-2 mb-3.5">
                  <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md border ${tmpl.badgeBg}`}>
                    {tmpl.category}
                  </span>
                  {isActive ? (
                    <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-800 border border-emerald-200 flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                      <span>Active</span>
                    </span>
                  ) : (
                    <span className="text-[11px] font-semibold text-slate-400 group-hover:text-blue-600 transition flex items-center gap-1">
                      <span>Preview</span>
                    </span>
                  )}
                </div>

                {/* Header: Icon & Title */}
                <div className="flex items-start gap-3 mb-3">
                  <div className={`w-11 h-11 rounded-xl border flex items-center justify-center shrink-0 shadow-xs ${tmpl.iconBg}`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <div className="min-w-0">
                    <h3 className="font-bold text-slate-900 text-sm leading-tight group-hover:text-blue-700 transition">
                      {tmpl.name}
                    </h3>
                    <p className="text-[11px] text-slate-500 truncate mt-0.5">
                      {tmpl.persona}
                    </p>
                  </div>
                </div>

                {/* Operational Persona Banner */}
                <div className="bg-slate-50 border border-slate-100 rounded-lg p-2 mb-3 text-[11px]">
                  <span className="text-slate-400 font-semibold block text-[10px] uppercase tracking-wider">
                    Assigned Officer / User
                  </span>
                  <strong className="text-slate-800 block truncate">
                    {tmpl.persona}
                  </strong>
                  <span className="text-slate-500 text-[10px] block truncate">
                    {tmpl.personaTitle}
                  </span>
                </div>

                {/* Description */}
                <p className="text-xs text-slate-600 leading-relaxed mb-4">
                  {tmpl.description}
                </p>

                {/* Key Features Bullet Points */}
                <div className="space-y-2 mb-5">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                    Core Workflows
                  </span>
                  {tmpl.features.map((feat, idx) => (
                    <div key={idx} className="flex items-start gap-1.5 text-xs text-slate-700">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                      <span className="leading-snug text-[11px]">{feat}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Bottom Switch Button */}
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  handleSelectRole(tmpl.role);
                }}
                className={`w-full py-2.5 px-3 rounded-xl font-semibold text-xs shadow-sm transition flex items-center justify-center gap-1.5 cursor-pointer mt-auto ${
                  isActive
                    ? 'bg-blue-600 text-white shadow-md'
                    : 'bg-slate-900 hover:bg-blue-600 text-white group-hover:shadow'
                }`}
              >
                <span>{isActive ? 'Currently Active' : 'Switch to Workspace'}</span>
                <ChevronRight className="w-3.5 h-3.5 transform group-hover:translate-x-0.5 transition" />
              </button>
            </div>
          );
        })}
      </div>

      {/* Footer Policy Badge */}
      <div className="mt-8 text-center text-xs text-slate-500 flex items-center justify-center gap-2">
        <ShieldCheck className="w-4 h-4 text-emerald-600" />
        <span>
          Compliant with Ethiopian Grade 9–12 Admissions, 15-Day Natural/Social Stream Policy & CBE/Telebirr Bank Reconciliation
        </span>
      </div>
    </section>
  );
};
