import React, { useState, useMemo } from 'react';
import { useSchool } from '../../context/SchoolContext';
import { DisciplinaryAction, DisciplineSeverity, FollowUpStatus } from '../../types';
import { 
  ShieldAlert, 
  Calendar, 
  Clock, 
  AlertTriangle, 
  CheckCircle2, 
  RotateCcw, 
  Mail, 
  MapPin, 
  Search, 
  Filter, 
  PlusCircle, 
  CalendarCheck, 
  AlertCircle,
  Users,
  ChevronDown,
  ArrowRight,
  FileText,
  Sparkles,
  Info
} from 'lucide-react';
import { DisciplinaryHearingModal } from './DisciplinaryHearingModal';

interface Props {
  onOpenHearingModal?: (action: DisciplinaryAction) => void;
}

// Structured Incident Classification Categories & standard infractions
export const INCIDENT_CLASSIFICATIONS = [
  {
    category: 'Attendance & Punctuality',
    types: [
      'Unexcused Absence & Truancy',
      'Chronic Classroom Tardiness',
      'Skipping Scheduled Class Period',
      'Unauthorized Campus Departure',
      'Habitual Assembly Absenteeism'
    ],
    defaultSeverity: 'LEVEL_1_MINOR' as DisciplineSeverity
  },
  {
    category: 'Behavioral & Classroom Conduct',
    types: [
      'Persistent Classroom Disruption',
      'Insubordination & Defiance of Staff Directives',
      'Disrespectful Conduct toward Faculty / Staff',
      'Lab & Workshop Safety Non-Compliance',
      'Disorderly Conduct in Hallways / Dining'
    ],
    defaultSeverity: 'LEVEL_2_MODERATE' as DisciplineSeverity
  },
  {
    category: 'Academic Integrity',
    types: [
      'Examination Malpractice / Cheating',
      'Plagiarism / Uncredited Academic Work',
      'Unauthorized AI / Smart Device Use during Test',
      'Unauthorized Access / Distribution of Exam Materials',
      'Alteration / Forgery of Academic Records'
    ],
    defaultSeverity: 'LEVEL_3_SERIOUS' as DisciplineSeverity
  },
  {
    category: 'Interpersonal & Peer Safety',
    types: [
      'Bullying & Intimidation',
      'Cyberbullying & Social Media Defamation',
      'Physical Altercation / Fighting',
      'Verbal Hostility & Profanity',
      'Harassment & Discriminatory Slurs'
    ],
    defaultSeverity: 'LEVEL_3_SERIOUS' as DisciplineSeverity
  },
  {
    category: 'Safety, Property & Regulations',
    types: [
      'Vandalism & Property Defacement',
      'Theft or Possession of Stolen Goods',
      'Possession of Prohibited Articles / Devices',
      'Severe Physical Harm / Weapon Possession',
      'Gross Uniform / Institutional Dress Code Violation'
    ],
    defaultSeverity: 'LEVEL_4_CRITICAL' as DisciplineSeverity
  }
];

export const SEVERITY_CONFIG: Record<string, {
  label: string;
  badgeBg: string;
  badgeBorder: string;
  badgeText: string;
  colorHex: string;
  recommendedFollowUpDays: number;
  protocolSummary: string;
  suggestedAction: string;
}> = {
  'LEVEL_1_MINOR': {
    label: 'Level 1: Minor Infraction',
    badgeBg: 'bg-blue-50',
    badgeBorder: 'border-blue-200',
    badgeText: 'text-blue-700',
    colorHex: '#2563eb',
    recommendedFollowUpDays: 14,
    protocolSummary: 'Restorative guidance, verbal reminder, and homeroom advisory log.',
    suggestedAction: 'Counselor Advising & Homeroom Check-in'
  },
  'LEVEL_2_MODERATE': {
    label: 'Level 2: Moderate Violation',
    badgeBg: 'bg-amber-50',
    badgeBorder: 'border-amber-200',
    badgeText: 'text-amber-800',
    colorHex: '#d97706',
    recommendedFollowUpDays: 7,
    protocolSummary: 'Pastoral conference, structured behavior contract, and parent advisory.',
    suggestedAction: 'Parent Conference & 1-Week Counseling Check-in'
  },
  'LEVEL_3_SERIOUS': {
    label: 'Level 3: Serious Offense',
    badgeBg: 'bg-rose-50',
    badgeBorder: 'border-rose-200',
    badgeText: 'text-rose-700',
    colorHex: '#e11d48',
    recommendedFollowUpDays: 3,
    protocolSummary: 'Disciplinary hearing referral, formal parent summons, campus privilege restriction.',
    suggestedAction: 'Parent Summons, Disciplinary Review & Behavior Contract'
  },
  'LEVEL_4_CRITICAL': {
    label: 'Level 4: Critical / Emergency',
    badgeBg: 'bg-purple-50',
    badgeBorder: 'border-purple-200',
    badgeText: 'text-purple-800',
    colorHex: '#7c3aed',
    recommendedFollowUpDays: 2,
    protocolSummary: 'Immediate administrative escalation to Principal, emergency parent summons & executive hearing.',
    suggestedAction: 'Immediate Principal Hearing & Emergency Disciplinary Board Review'
  }
};

export const StudentDisciplineModule: React.FC<Props> = ({ onOpenHearingModal }) => {
  const { 
    students, 
    disciplinaryActions, 
    recordDisciplinaryAction, 
    updateDisciplinaryAction,
    currentUser 
  } = useSchool();

  const todayStr = useMemo(() => new Date().toISOString().split('T')[0], []);

  // Helper to add days to a date string (YYYY-MM-DD)
  const addDaysToDate = (baseDateStr: string, days: number): string => {
    const base = new Date(baseDateStr);
    if (isNaN(base.getTime())) return todayStr;
    base.setDate(base.getDate() + days);
    return base.toISOString().split('T')[0];
  };

  // Form states
  const [selectedStudentId, setSelectedStudentId] = useState<string>(students[0]?.id || '');
  const [incidentDate, setIncidentDate] = useState<string>(todayStr);
  const [incidentTime, setIncidentTime] = useState<string>('09:15');
  const [selectedCategory, setSelectedCategory] = useState<string>(INCIDENT_CLASSIFICATIONS[0].category);
  const [incidentType, setIncidentType] = useState<string>(INCIDENT_CLASSIFICATIONS[0].types[0]);
  const [isCustomType, setIsCustomType] = useState<boolean>(false);
  const [customTypeInput, setCustomTypeInput] = useState<string>('');
  
  const [severityLevel, setSeverityLevel] = useState<DisciplineSeverity>('LEVEL_1_MINOR');
  const [location, setLocation] = useState<string>('Classroom / Academic Block');
  const [witnesses, setWitnesses] = useState<string>('');
  const [description, setDescription] = useState<string>('');
  const [actionTaken, setActionTaken] = useState<string>(SEVERITY_CONFIG['LEVEL_1_MINOR'].suggestedAction);

  // Automated Follow-up Scheduling States
  const [followUpRequired, setFollowUpRequired] = useState<boolean>(true);
  const [followUpDate, setFollowUpDate] = useState<string>(addDaysToDate(todayStr, 14));
  const [followUpTime, setFollowUpTime] = useState<string>('10:00');
  const [followUpType, setFollowUpType] = useState<string>('Post-Incident Counseling & Reflection');
  const [followUpNotes, setFollowUpNotes] = useState<string>('Review student conduct improvement and homeroom engagement.');
  const [followUpAssignedTo, setFollowUpAssignedTo] = useState<string>(currentUser?.name || 'Guidance Counsellor');

  // Hearing option in initial form
  const [scheduleHearingInForm, setScheduleHearingInForm] = useState<boolean>(false);
  const [formHearingDate, setFormHearingDate] = useState<string>(addDaysToDate(todayStr, 3));
  const [formHearingTime, setFormHearingTime] = useState<string>('10:30 AM');
  const [formHearingLocation, setFormHearingLocation] = useState<string>('Academic Disciplinary Board Room (Hall B, Rm 204)');

  // Submission feedback
  const [formSuccess, setFormSuccess] = useState<string | null>(null);

  // Ledger Filter & Search States
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [filterSeverity, setFilterSeverity] = useState<string>('ALL');
  const [filterCategory, setFilterCategory] = useState<string>('ALL');
  const [filterFollowUpStatus, setFilterFollowUpStatus] = useState<string>('ALL');
  const [activeLedgerTab, setActiveLedgerTab] = useState<'ALL' | 'PENDING_FOLLOW_UP' | 'OVERDUE' | 'COMPLETED'>('ALL');

  // Modal states for Follow-up Management
  const [selectedActionForFollowUp, setSelectedActionForFollowUp] = useState<DisciplinaryAction | null>(null);
  const [completeModalDate, setCompleteModalDate] = useState<string>(todayStr);
  const [completeModalOutcome, setCompleteModalOutcome] = useState<string>('Satisfactory - Conduct Improved');
  const [completeModalNotes, setCompleteModalNotes] = useState<string>('');

  // Reschedule state
  const [rescheduleModalDate, setRescheduleModalDate] = useState<string>(addDaysToDate(todayStr, 7));
  const [rescheduleModalTime, setRescheduleModalTime] = useState<string>('10:00');
  const [rescheduleModalReason, setRescheduleModalReason] = useState<string>('');
  const [followUpModalTab, setFollowUpModalTab] = useState<'COMPLETE' | 'RESCHEDULE'>('COMPLETE');

  // Hearing Modal State
  const [selectedActionForHearing, setSelectedActionForHearing] = useState<DisciplinaryAction | null>(null);

  // Handle category change: update types and suggested severity
  const handleCategoryChange = (categoryName: string) => {
    setSelectedCategory(categoryName);
    const catObj = INCIDENT_CLASSIFICATIONS.find(c => c.category === categoryName);
    if (catObj) {
      setIncidentType(catObj.types[0]);
      setIsCustomType(false);
      // Auto-set severity and follow-up
      handleSeverityChange(catObj.defaultSeverity);
    }
  };

  // Handle severity change: auto-recalculate follow-up schedule
  const handleSeverityChange = (newSev: DisciplineSeverity) => {
    setSeverityLevel(newSev);
    const config = SEVERITY_CONFIG[newSev];
    if (config) {
      setActionTaken(config.suggestedAction);
      // Auto-schedule date based on severity
      const recommendedDate = addDaysToDate(incidentDate || todayStr, config.recommendedFollowUpDays);
      setFollowUpDate(recommendedDate);
      setFollowUpRequired(true);

      // Auto-enable hearing prompt if critical
      if (newSev === 'LEVEL_4_CRITICAL') {
        setScheduleHearingInForm(true);
      }
    }
  };

  // Preset follow-up interval clicker
  const handleApplyPresetInterval = (days: number) => {
    const base = incidentDate || todayStr;
    setFollowUpDate(addDaysToDate(base, days));
    setFollowUpRequired(true);
  };

  // Submit Disciplinary Incident
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const st = students.find(s => s.id === selectedStudentId);
    if (!st) return;

    const finalIncidentType = isCustomType && customTypeInput.trim() ? customTypeInput.trim() : incidentType;

    await recordDisciplinaryAction({
      studentId: st.id,
      studentName: st.fullName,
      grade: st.grade,
      sectionId: st.sectionId || undefined,
      incidentDate,
      incidentTime,
      incidentType: finalIncidentType,
      classificationCategory: selectedCategory,
      severityLevel,
      location,
      witnesses: witnesses.trim() || undefined,
      description,
      actionTaken,
      counsellorName: currentUser?.name || 'Head Guidance Counsellor',
      
      // Follow-up scheduling
      followUpRequired,
      followUpDate: followUpRequired ? followUpDate : undefined,
      followUpTime: followUpRequired ? followUpTime : undefined,
      followUpType: followUpRequired ? followUpType : undefined,
      followUpAssignedTo: followUpRequired ? followUpAssignedTo : undefined,
      followUpNotes: followUpRequired ? followUpNotes : undefined,
      followUpStatus: followUpRequired ? 'PENDING' : 'NOT_REQUIRED',

      // Hearing
      autoNotifyParent: scheduleHearingInForm,
      hearingScheduled: scheduleHearingInForm,
      hearingDate: scheduleHearingInForm ? formHearingDate : undefined,
      hearingTime: scheduleHearingInForm ? formHearingTime : undefined,
      hearingLocation: scheduleHearingInForm ? formHearingLocation : undefined,
      hearingCommittee: scheduleHearingInForm 
        ? ['Office of the Principal', currentUser?.name || 'Head Guidance Counsellor'] 
        : undefined,
      hearingStatus: scheduleHearingInForm ? 'SCHEDULED' : undefined,
    });

    setFormSuccess(`Disciplinary record logged for ${st.fullName}. Homeroom teacher alerted and follow-up scheduled.`);
    setDescription('');
    setWitnesses('');
    setScheduleHearingInForm(false);
    setTimeout(() => setFormSuccess(null), 6000);
  };

  // Helper to determine follow-up status dynamically
  const getDynamicFollowUpStatus = (action: DisciplinaryAction): FollowUpStatus => {
    if (!action.followUpRequired) return 'NOT_REQUIRED';
    if (action.followUpStatus === 'COMPLETED') return 'COMPLETED';
    if (!action.followUpDate) return 'PENDING';
    
    // Check if overdue
    if (action.followUpDate < todayStr) {
      return 'OVERDUE';
    }
    return action.followUpStatus || 'PENDING';
  };

  // Complete Follow-up
  const handleSaveFollowUpCompletion = () => {
    if (!selectedActionForFollowUp) return;
    updateDisciplinaryAction(selectedActionForFollowUp.id, {
      followUpStatus: 'COMPLETED',
      followUpCompletedDate: completeModalDate,
      followUpOutcome: completeModalOutcome,
      followUpOutcomeNotes: completeModalNotes,
    });
    setSelectedActionForFollowUp(null);
    setCompleteModalNotes('');
  };

  // Reschedule Follow-up
  const handleSaveFollowUpReschedule = () => {
    if (!selectedActionForFollowUp) return;
    updateDisciplinaryAction(selectedActionForFollowUp.id, {
      followUpStatus: 'RESCHEDULED',
      followUpDate: rescheduleModalDate,
      followUpTime: rescheduleModalTime,
      followUpNotes: `${selectedActionForFollowUp.followUpNotes || ''} [Rescheduled on ${todayStr}: ${rescheduleModalReason}]`.trim(),
    });
    setSelectedActionForFollowUp(null);
    setRescheduleModalReason('');
  };

  // Filtered Disciplinary Actions
  const filteredActions = useMemo(() => {
    return disciplinaryActions.filter(action => {
      // Search
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesName = action.studentName.toLowerCase().includes(q);
        const matchesId = action.studentId.toLowerCase().includes(q);
        const matchesType = action.incidentType.toLowerCase().includes(q);
        const matchesDesc = (action.description || '').toLowerCase().includes(q);
        if (!matchesName && !matchesId && !matchesType && !matchesDesc) return false;
      }

      // Severity
      if (filterSeverity !== 'ALL') {
        if (action.severityLevel !== filterSeverity) return false;
      }

      // Category
      if (filterCategory !== 'ALL') {
        if (action.classificationCategory !== filterCategory) return false;
      }

      // Tab filter & follow-up status
      const dynStatus = getDynamicFollowUpStatus(action);

      if (activeLedgerTab === 'PENDING_FOLLOW_UP') {
        if (dynStatus !== 'PENDING' && dynStatus !== 'RESCHEDULED') return false;
      } else if (activeLedgerTab === 'OVERDUE') {
        if (dynStatus !== 'OVERDUE') return false;
      } else if (activeLedgerTab === 'COMPLETED') {
        if (dynStatus !== 'COMPLETED') return false;
      }

      if (filterFollowUpStatus !== 'ALL') {
        if (dynStatus !== filterFollowUpStatus) return false;
      }

      return true;
    });
  }, [disciplinaryActions, searchQuery, filterSeverity, filterCategory, filterFollowUpStatus, activeLedgerTab, todayStr]);

  // Statistics
  const stats = useMemo(() => {
    let pendingFollowUps = 0;
    let overdueFollowUps = 0;
    let completedFollowUps = 0;
    let criticalCases = 0;

    disciplinaryActions.forEach(act => {
      const st = getDynamicFollowUpStatus(act);
      if (st === 'PENDING' || st === 'RESCHEDULED') pendingFollowUps++;
      if (st === 'OVERDUE') overdueFollowUps++;
      if (st === 'COMPLETED') completedFollowUps++;
      if (act.severityLevel === 'LEVEL_4_CRITICAL') criticalCases++;
    });

    return {
      total: disciplinaryActions.length,
      pendingFollowUps,
      overdueFollowUps,
      completedFollowUps,
      criticalCases
    };
  }, [disciplinaryActions, todayStr]);

  return (
    <div className="space-y-6">
      {/* Metrics Banner */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        <div className="p-3.5 bg-white rounded-xl border border-slate-200 shadow-xs">
          <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Total Incidents</p>
          <p className="font-oskar-vintage text-xl font-bold text-slate-900 mt-1">{stats.total}</p>
          <span className="text-[10px] text-slate-500">Logged cases</span>
        </div>

        <div className="p-3.5 bg-white rounded-xl border border-amber-200 bg-amber-50/20 shadow-xs">
          <p className="text-[10px] font-bold uppercase tracking-wider text-amber-700 flex items-center gap-1">
            <Clock className="w-3 h-3" /> Pending Follow-Ups
          </p>
          <p className="font-oskar-vintage text-xl font-bold text-amber-900 mt-1">{stats.pendingFollowUps}</p>
          <span className="text-[10px] text-amber-700">Scheduled checks</span>
        </div>

        <div className={`p-3.5 rounded-xl border shadow-xs transition ${
          stats.overdueFollowUps > 0 
            ? 'bg-rose-50 border-rose-300 text-rose-900 animate-pulse' 
            : 'bg-white border-slate-200 text-slate-700'
        }`}>
          <p className="text-[10px] font-bold uppercase tracking-wider flex items-center gap-1 text-rose-600">
            <AlertTriangle className="w-3 h-3" /> Overdue Follow-Ups
          </p>
          <p className="font-oskar-vintage text-xl font-bold text-rose-700 mt-1">{stats.overdueFollowUps}</p>
          <span className="text-[10px] text-rose-600">Attention needed</span>
        </div>

        <div className="p-3.5 bg-white rounded-xl border border-purple-200 bg-purple-50/20 shadow-xs">
          <p className="text-[10px] font-bold uppercase tracking-wider text-purple-700 flex items-center gap-1">
            <ShieldAlert className="w-3 h-3" /> Level 4 Critical
          </p>
          <p className="font-oskar-vintage text-xl font-bold text-purple-900 mt-1">{stats.criticalCases}</p>
          <span className="text-[10px] text-purple-700">Principal referrals</span>
        </div>

        <div className="p-3.5 bg-white rounded-xl border border-emerald-200 bg-emerald-50/20 shadow-xs">
          <p className="text-[10px] font-bold uppercase tracking-wider text-emerald-700 flex items-center gap-1">
            <CheckCircle2 className="w-3 h-3" /> Resolved Follow-Ups
          </p>
          <p className="font-oskar-vintage text-xl font-bold text-emerald-800 mt-1">{stats.completedFollowUps}</p>
          <span className="text-[10px] text-emerald-700">Closed outcomes</span>
        </div>
      </div>

      {/* Main Grid: Logging Form (Left) & Incident Ledger (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* LOGGING FORM */}
        <div className="lg:col-span-5 bg-white rounded-2xl p-6 shadow-sm border border-slate-200 space-y-5">
          <div className="border-b border-slate-100 pb-3">
            <div className="flex items-center justify-between">
              <h3 className="font-oskar-vintage text-lg font-bold text-slate-900 flex items-center gap-2">
                <ShieldAlert className="w-5 h-5 text-rose-600" />
                Log Disciplinary Incident
              </h3>
              <span className="text-[11px] font-medium px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">
                MoE Protocol
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Classify infractions, assess severity, and configure automated follow-up scheduling with standard date pickers.
            </p>
          </div>

          {formSuccess && (
            <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-900 flex items-start gap-2.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <div>
                <p className="font-bold">Incident Successfully Recorded</p>
                <p className="text-[11px] text-emerald-700 mt-0.5">{formSuccess}</p>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Student Selection */}
            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1">
                Student Involved *
              </label>
              <select
                value={selectedStudentId}
                onChange={(e) => setSelectedStudentId(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs bg-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
                required
              >
                {students.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.fullName} ({s.id}) — Grade {s.grade} {s.sectionId ? `| Sec ${s.sectionId}` : ''}
                  </option>
                ))}
              </select>
            </div>

            {/* Incident Date & Time standard pickers */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1 flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5 text-slate-500" />
                  Incident Date *
                </label>
                <input
                  type="date"
                  required
                  value={incidentDate}
                  max={todayStr}
                  onChange={(e) => {
                    setIncidentDate(e.target.value);
                    if (followUpRequired) {
                      const cfg = SEVERITY_CONFIG[severityLevel];
                      setFollowUpDate(addDaysToDate(e.target.value, cfg?.recommendedFollowUpDays || 7));
                    }
                  }}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs bg-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1 flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5 text-slate-500" />
                  Time of Occurrence
                </label>
                <input
                  type="time"
                  value={incidentTime}
                  onChange={(e) => setIncidentTime(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs bg-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>
            </div>

            {/* Incident Classification Hierarchy */}
            <div className="space-y-2 p-3 bg-slate-50 rounded-xl border border-slate-200">
              <label className="text-xs font-bold text-slate-800 block">
                Incident Classification Category *
              </label>

              {/* Category pills */}
              <div className="flex flex-wrap gap-1.5">
                {INCIDENT_CLASSIFICATIONS.map((c) => (
                  <button
                    key={c.category}
                    type="button"
                    onClick={() => handleCategoryChange(c.category)}
                    className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold transition cursor-pointer ${
                      selectedCategory === c.category
                        ? 'bg-slate-900 text-white shadow-xs'
                        : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    {c.category}
                  </button>
                ))}
              </div>

              {/* Specific Infraction Dropdown */}
              <div className="mt-2">
                <label className="text-[11px] font-semibold text-slate-600 block mb-1">
                  Specific Infraction Type *
                </label>
                {!isCustomType ? (
                  <select
                    value={incidentType}
                    onChange={(e) => {
                      if (e.target.value === '__CUSTOM__') {
                        setIsCustomType(true);
                      } else {
                        setIncidentType(e.target.value);
                      }
                    }}
                    className="w-full px-2.5 py-1.5 border border-slate-300 rounded-lg text-xs bg-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  >
                    {INCIDENT_CLASSIFICATIONS.find(c => c.category === selectedCategory)?.types.map(t => (
                      <option key={t} value={t}>{t}</option>
                    ))}
                    <option value="__CUSTOM__">+ Other / Custom Infraction...</option>
                  </select>
                ) : (
                  <div className="flex gap-1.5">
                    <input
                      type="text"
                      required
                      placeholder="Specify custom infraction..."
                      value={customTypeInput}
                      onChange={(e) => setCustomTypeInput(e.target.value)}
                      className="flex-1 px-2.5 py-1.5 border border-slate-300 rounded-lg text-xs bg-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    />
                    <button
                      type="button"
                      onClick={() => setIsCustomType(false)}
                      className="px-2 py-1 text-[11px] bg-slate-200 text-slate-700 rounded-lg hover:bg-slate-300"
                    >
                      Reset
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Severity Level Selector */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-800 flex items-center justify-between">
                <span>Severity Level *</span>
                <span className="text-[10px] font-normal text-slate-500">Determines follow-up urgency</span>
              </label>

              <div className="grid grid-cols-2 gap-2">
                {(Object.keys(SEVERITY_CONFIG) as DisciplineSeverity[]).map((sevKey) => {
                  const cfg = SEVERITY_CONFIG[sevKey];
                  const isSelected = severityLevel === sevKey;
                  return (
                    <button
                      key={sevKey}
                      type="button"
                      onClick={() => handleSeverityChange(sevKey)}
                      className={`p-2.5 rounded-xl border text-left transition relative cursor-pointer ${
                        isSelected
                          ? `${cfg.badgeBg} ${cfg.badgeBorder} ring-2 ring-blue-500/20 shadow-xs`
                          : 'bg-white border-slate-200 hover:bg-slate-50'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className={`text-[11px] font-bold ${cfg.badgeText}`}>
                          {cfg.label.split(':')[0]}
                        </span>
                        {isSelected && <CheckCircle2 className="w-3.5 h-3.5 text-blue-600" />}
                      </div>
                      <p className="text-[10px] text-slate-600 mt-0.5 line-clamp-1 font-medium">
                        {cfg.label.split(':')[1]}
                      </p>
                      <span className="text-[9px] text-slate-500 block mt-1">
                        Follow-up: ~{cfg.recommendedFollowUpDays} days
                      </span>
                    </button>
                  );
                })}
              </div>

              {/* Active Severity Protocol Notice */}
              <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-[11px] space-y-1">
                <div className="flex items-center gap-1.5 font-semibold text-slate-800">
                  <Info className="w-3.5 h-3.5 text-blue-600" />
                  <span>Protocol Guideline: {SEVERITY_CONFIG[severityLevel]?.label}</span>
                </div>
                <p className="text-slate-600 text-[11px]">
                  {SEVERITY_CONFIG[severityLevel]?.protocolSummary}
                </p>
              </div>
            </div>

            {/* Location & Witnesses */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">Location</label>
                <input
                  type="text"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="e.g. Science Lab 2 / Field"
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs bg-white"
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">Witnesses / Reporting Staff</label>
                <input
                  type="text"
                  value={witnesses}
                  onChange={(e) => setWitnesses(e.target.value)}
                  placeholder="e.g. Teacher Almaz, Student Prefect"
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs bg-white"
                />
              </div>
            </div>

            {/* Detailed Description */}
            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1">
                Objective Incident Description *
              </label>
              <textarea
                rows={3}
                required
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Factual summary: who, what, when, evidence observed, and immediate mitigating steps taken..."
                className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
            </div>

            {/* Action Taken */}
            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1">
                Immediate Action & Interventions *
              </label>
              <input
                type="text"
                required
                value={actionTaken}
                onChange={(e) => setActionTaken(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
            </div>

            {/* AUTOMATED FOLLOW-UP SCHEDULING SECTION WITH STANDARD DATE PICKER */}
            <div className="p-4 bg-blue-50/50 border border-blue-200 rounded-2xl space-y-3.5">
              <div className="flex items-center justify-between">
                <label className="flex items-center gap-2 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={followUpRequired}
                    onChange={(e) => setFollowUpRequired(e.target.checked)}
                    className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-xs font-bold text-blue-950 flex items-center gap-1.5">
                    <CalendarCheck className="w-4 h-4 text-blue-600" />
                    Automated Follow-Up Scheduling
                  </span>
                </label>
                <span className="text-[10px] font-semibold bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full">
                  Standard Date Picker
                </span>
              </div>

              {followUpRequired && (
                <div className="space-y-3 pt-1">
                  {/* Preset Buttons for Quick Calculation */}
                  <div>
                    <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block mb-1.5">
                      Auto-Schedule Preset Intervals
                    </label>
                    <div className="grid grid-cols-5 gap-1.5">
                      {[
                        { label: '+2 Days', days: 2, note: 'Critical' },
                        { label: '+3 Days', days: 3, note: 'Urgent' },
                        { label: '+7 Days', days: 7, note: '1 Week' },
                        { label: '+14 Days', days: 14, note: '2 Weeks' },
                        { label: '+30 Days', days: 30, note: '1 Month' },
                      ].map(p => (
                        <button
                          key={p.days}
                          type="button"
                          onClick={() => handleApplyPresetInterval(p.days)}
                          className="px-1.5 py-1.5 bg-white hover:bg-blue-100 border border-blue-200 rounded-lg text-[10px] font-semibold text-blue-900 transition flex flex-col items-center justify-center cursor-pointer shadow-2xs"
                        >
                          <span>{p.label}</span>
                          <span className="text-[8px] text-slate-500 font-normal">{p.note}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Standard Date & Time Pickers */}
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs font-semibold text-slate-700 block mb-1 flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5 text-blue-600" />
                        Follow-Up Date *
                      </label>
                      <input
                        type="date"
                        required={followUpRequired}
                        min={incidentDate || todayStr}
                        value={followUpDate}
                        onChange={(e) => setFollowUpDate(e.target.value)}
                        className="w-full px-3 py-2 border border-blue-300 rounded-xl text-xs bg-white font-medium focus:ring-2 focus:ring-blue-500 focus:outline-none"
                      />
                      <span className="text-[10px] text-slate-500 block mt-0.5">
                        Target: {followUpDate}
                      </span>
                    </div>

                    <div>
                      <label className="text-xs font-semibold text-slate-700 block mb-1 flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5 text-blue-600" />
                        Follow-Up Time
                      </label>
                      <input
                        type="time"
                        value={followUpTime}
                        onChange={(e) => setFollowUpTime(e.target.value)}
                        className="w-full px-3 py-2 border border-blue-300 rounded-xl text-xs bg-white font-medium focus:ring-2 focus:ring-blue-500 focus:outline-none"
                      />
                    </div>
                  </div>

                  {/* Follow-up Objective / Focus */}
                  <div>
                    <label className="text-xs font-semibold text-slate-700 block mb-1">
                      Follow-up Objective / Intervention Plan
                    </label>
                    <select
                      value={followUpType}
                      onChange={(e) => setFollowUpType(e.target.value)}
                      className="w-full px-2.5 py-1.5 border border-slate-300 rounded-xl text-xs bg-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    >
                      <option value="Post-Incident Counseling & Reflection">Post-Incident Counseling & Reflection</option>
                      <option value="Restorative Justice & Peer Reconciliation">Restorative Justice & Peer Reconciliation</option>
                      <option value="Behavior Contract Milestone Check">Behavior Contract Milestone Check</option>
                      <option value="Parent-Counselor Follow-up Conference">Parent-Counselor Follow-up Conference</option>
                      <option value="Academic & Conduct Re-evaluation">Academic & Conduct Re-evaluation</option>
                      <option value="Executive Disciplinary Sanction Review">Executive Disciplinary Sanction Review</option>
                    </select>
                  </div>

                  {/* Assigned Counselor & Targets */}
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs font-semibold text-slate-700 block mb-1">Assigned Counselor</label>
                      <input
                        type="text"
                        value={followUpAssignedTo}
                        onChange={(e) => setFollowUpAssignedTo(e.target.value)}
                        className="w-full px-2.5 py-1.5 border border-slate-300 rounded-xl text-xs bg-white"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-semibold text-slate-700 block mb-1">Milestone Target Note</label>
                      <input
                        type="text"
                        value={followUpNotes}
                        onChange={(e) => setFollowUpNotes(e.target.value)}
                        placeholder="e.g. 0 tardy slips during 2-week period"
                        className="w-full px-2.5 py-1.5 border border-slate-300 rounded-xl text-xs bg-white"
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Formal Disciplinary Hearing & Parent Summons Section */}
            <div className="pt-2 border-t border-slate-200">
              <label className="flex items-start gap-2.5 p-3 rounded-xl bg-amber-50/70 border border-amber-200/80 cursor-pointer">
                <input
                  type="checkbox"
                  checked={scheduleHearingInForm}
                  onChange={(e) => setScheduleHearingInForm(e.target.checked)}
                  className="mt-0.5 rounded text-amber-600 focus:ring-amber-500"
                />
                <div>
                  <span className="text-xs font-bold text-amber-900 block">
                    Schedule Formal Disciplinary Hearing & Auto-Summons Parent via Gmail
                  </span>
                  <span className="text-[11px] text-amber-800 leading-tight block mt-0.5">
                    Transmits an official summons notice with date, committee, and protocol directly to the parent's email.
                  </span>
                </div>
              </label>

              {scheduleHearingInForm && (
                <div className="mt-3 p-3.5 bg-slate-50 border border-slate-200 rounded-xl space-y-3">
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="text-[11px] font-semibold text-slate-700 block mb-1">Hearing Date</label>
                      <input
                        type="date"
                        required={scheduleHearingInForm}
                        value={formHearingDate}
                        onChange={(e) => setFormHearingDate(e.target.value)}
                        className="w-full px-2.5 py-1.5 border border-slate-300 rounded-lg text-xs bg-white"
                      />
                    </div>
                    <div>
                      <label className="text-[11px] font-semibold text-slate-700 block mb-1">Hearing Time</label>
                      <input
                        type="text"
                        required={scheduleHearingInForm}
                        value={formHearingTime}
                        onChange={(e) => setFormHearingTime(e.target.value)}
                        placeholder="e.g. 10:30 AM"
                        className="w-full px-2.5 py-1.5 border border-slate-300 rounded-lg text-xs bg-white"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="text-[11px] font-semibold text-slate-700 block mb-1">Hearing Location</label>
                    <input
                      type="text"
                      required={scheduleHearingInForm}
                      value={formHearingLocation}
                      onChange={(e) => setFormHearingLocation(e.target.value)}
                      placeholder="e.g. Academic Board Room (Hall B, Rm 204)"
                      className="w-full px-2.5 py-1.5 border border-slate-300 rounded-lg text-xs bg-white"
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Submission Button */}
            <button
              type="submit"
              className="w-full py-3 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold transition shadow-sm flex items-center justify-center gap-2 cursor-pointer"
            >
              <ShieldAlert className="w-4 h-4" />
              <span>Record Incident, Alert Homeroom & Set Follow-up</span>
            </button>
          </form>
        </div>

        {/* INCIDENT & FOLLOW-UP LEDGER (Right) */}
        <div className="lg:col-span-7 space-y-4">
          {/* Header & View Switcher */}
          <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-200 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h3 className="font-oskar-vintage text-base font-bold text-slate-900">
                  Student Discipline & Follow-Up Ledger
                </h3>
                <p className="text-xs text-slate-500">
                  Tracking active infractions, severity ratings, and automated calendar follow-ups.
                </p>
              </div>

              {/* Sub tabs */}
              <div className="flex flex-wrap gap-1 bg-slate-100 p-1 rounded-xl">
                <button
                  onClick={() => setActiveLedgerTab('ALL')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer ${
                    activeLedgerTab === 'ALL' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  All ({disciplinaryActions.length})
                </button>
                <button
                  onClick={() => setActiveLedgerTab('PENDING_FOLLOW_UP')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition flex items-center gap-1 cursor-pointer ${
                    activeLedgerTab === 'PENDING_FOLLOW_UP' ? 'bg-white text-amber-900 shadow-xs font-bold' : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <Clock className="w-3 h-3 text-amber-600" />
                  Upcoming ({stats.pendingFollowUps})
                </button>
                <button
                  onClick={() => setActiveLedgerTab('OVERDUE')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition flex items-center gap-1 cursor-pointer ${
                    activeLedgerTab === 'OVERDUE' ? 'bg-white text-rose-800 shadow-xs font-bold' : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <AlertTriangle className="w-3 h-3 text-rose-600" />
                  Overdue ({stats.overdueFollowUps})
                </button>
                <button
                  onClick={() => setActiveLedgerTab('COMPLETED')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition flex items-center gap-1 cursor-pointer ${
                    activeLedgerTab === 'COMPLETED' ? 'bg-white text-emerald-800 shadow-xs font-bold' : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                  Resolved ({stats.completedFollowUps})
                </button>
              </div>
            </div>

            {/* Filter Bar */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-2 border-t border-slate-100">
              <div className="relative">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  placeholder="Search student, ID, infraction..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-8 pr-3 py-1.5 border border-slate-300 rounded-xl text-xs bg-white"
                />
              </div>

              <div>
                <select
                  value={filterSeverity}
                  onChange={(e) => setFilterSeverity(e.target.value)}
                  className="w-full px-2.5 py-1.5 border border-slate-300 rounded-xl text-xs bg-white"
                >
                  <option value="ALL">All Severity Levels</option>
                  <option value="LEVEL_1_MINOR">Level 1: Minor</option>
                  <option value="LEVEL_2_MODERATE">Level 2: Moderate</option>
                  <option value="LEVEL_3_SERIOUS">Level 3: Serious</option>
                  <option value="LEVEL_4_CRITICAL">Level 4: Critical</option>
                </select>
              </div>

              <div>
                <select
                  value={filterCategory}
                  onChange={(e) => setFilterCategory(e.target.value)}
                  className="w-full px-2.5 py-1.5 border border-slate-300 rounded-xl text-xs bg-white"
                >
                  <option value="ALL">All Classification Categories</option>
                  {INCIDENT_CLASSIFICATIONS.map(c => (
                    <option key={c.category} value={c.category}>{c.category}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Cards List */}
          <div className="space-y-3">
            {filteredActions.map((action) => {
              const dynFollowUpStatus = getDynamicFollowUpStatus(action);
              const sevConfig = SEVERITY_CONFIG[action.severityLevel || 'LEVEL_1_MINOR'] || SEVERITY_CONFIG['LEVEL_1_MINOR'];

              return (
                <div
                  key={action.id}
                  className={`p-4 rounded-2xl border transition shadow-2xs space-y-3 ${
                    action.reversedByPrincipal
                      ? 'bg-emerald-50/40 border-emerald-200'
                      : dynFollowUpStatus === 'OVERDUE'
                      ? 'bg-rose-50/50 border-rose-300'
                      : 'bg-white border-slate-200 hover:border-slate-300'
                  }`}
                >
                  {/* Card Header */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-2.5">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-slate-900 text-white flex items-center justify-center font-bold text-xs">
                        {action.studentName.charAt(0)}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-slate-900 text-xs sm:text-sm">{action.studentName}</span>
                          <span className="font-mono text-slate-500 text-[11px]">({action.studentId})</span>
                          <span className="text-[10px] bg-slate-100 text-slate-700 px-1.5 py-0.5 rounded font-semibold">
                            Grade {action.grade}
                          </span>
                        </div>
                        <span className="text-[10px] text-slate-500">
                          Incident Date: {action.incidentDate} {action.incidentTime ? `at ${action.incidentTime}` : ''}
                        </span>
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-1.5">
                      {/* Severity badge */}
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${sevConfig.badgeBg} ${sevConfig.badgeBorder} ${sevConfig.badgeText}`}>
                        {sevConfig.label.split(':')[0]}
                      </span>

                      {/* Principal Reversal badge */}
                      {action.reversedByPrincipal ? (
                        <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 rounded-full font-bold text-[10px] flex items-center gap-1">
                          <RotateCcw className="w-3 h-3" /> Reversed by Principal
                        </span>
                      ) : (
                        <span className="text-[10px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full">
                          Active Incident
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Classification & Infraction */}
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-[11px] font-bold text-slate-900">{action.incidentType}</span>
                      {action.classificationCategory && (
                        <span className="text-[10px] bg-slate-100 text-slate-600 px-2 py-0.2 rounded font-medium">
                          {action.classificationCategory}
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-slate-600 mt-1 bg-slate-50/70 p-2.5 rounded-xl border border-slate-100 leading-relaxed">
                      {action.description}
                    </p>
                  </div>

                  {/* Immediate Action */}
                  <div className="flex flex-wrap items-center justify-between text-[11px] text-slate-600 gap-2">
                    <div>
                      <span>Action Taken: <strong className="text-slate-800">{action.actionTaken}</strong></span>
                    </div>
                    {action.location && (
                      <span className="flex items-center gap-1 text-slate-500 text-[10px]">
                        <MapPin className="w-3 h-3" /> {action.location}
                      </span>
                    )}
                  </div>

                  {/* Follow-up Section Banner */}
                  {action.followUpRequired && (
                    <div className={`p-3 rounded-xl border text-xs space-y-2 ${
                      dynFollowUpStatus === 'COMPLETED'
                        ? 'bg-emerald-50/80 border-emerald-200 text-emerald-950'
                        : dynFollowUpStatus === 'OVERDUE'
                        ? 'bg-rose-50 border-rose-300 text-rose-950'
                        : 'bg-blue-50/70 border-blue-200 text-blue-950'
                    }`}>
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                        <div className="flex items-center gap-2">
                          <CalendarCheck className={`w-4 h-4 shrink-0 ${
                            dynFollowUpStatus === 'COMPLETED'
                              ? 'text-emerald-600'
                              : dynFollowUpStatus === 'OVERDUE'
                              ? 'text-rose-600'
                              : 'text-blue-600'
                          }`} />
                          <div>
                            <span className="font-bold text-xs">
                              {dynFollowUpStatus === 'COMPLETED'
                                ? `Follow-Up Completed: ${action.followUpCompletedDate || 'Recorded'}`
                                : dynFollowUpStatus === 'OVERDUE'
                                ? `Follow-Up OVERDUE: Scheduled for ${action.followUpDate}!`
                                : `Follow-Up Scheduled: ${action.followUpDate} (${action.followUpTime || 'Morning Session'})`}
                            </span>
                            <p className="text-[11px] opacity-85">
                              Objective: {action.followUpType || 'Counseling & Reflection'} • Facilitator: {action.followUpAssignedTo || action.counsellorName}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-1.5 self-end sm:self-center">
                          {dynFollowUpStatus === 'COMPLETED' ? (
                            <span className="px-2 py-0.5 bg-emerald-200 text-emerald-900 rounded-full font-bold text-[10px] flex items-center gap-1">
                              <CheckCircle2 className="w-3 h-3" /> Outcome Logged
                            </span>
                          ) : (
                            <button
                              type="button"
                              onClick={() => {
                                setSelectedActionForFollowUp(action);
                                setFollowUpModalTab('COMPLETE');
                                setCompleteModalDate(todayStr);
                              }}
                              className="px-2.5 py-1 bg-white hover:bg-slate-50 border border-slate-300 text-slate-800 rounded-lg text-[11px] font-semibold transition shadow-2xs flex items-center gap-1 cursor-pointer"
                            >
                              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                              Log Outcome
                            </button>
                          )}

                          {dynFollowUpStatus !== 'COMPLETED' && (
                            <button
                              type="button"
                              onClick={() => {
                                setSelectedActionForFollowUp(action);
                                setFollowUpModalTab('RESCHEDULE');
                                setRescheduleModalDate(addDaysToDate(todayStr, 7));
                              }}
                              className="px-2.5 py-1 bg-white hover:bg-slate-50 border border-slate-300 text-slate-800 rounded-lg text-[11px] font-semibold transition shadow-2xs flex items-center gap-1 cursor-pointer"
                              title="Reschedule follow-up using date picker"
                            >
                              <Calendar className="w-3.5 h-3.5 text-blue-600" />
                              Reschedule
                            </button>
                          )}
                        </div>
                      </div>

                      {/* Completed Outcome Note */}
                      {action.followUpOutcome && (
                        <div className="text-[11px] pt-1 border-t border-emerald-200/60 flex items-start gap-1">
                          <strong>Outcome:</strong>
                          <span>{action.followUpOutcome}</span>
                          {action.followUpOutcomeNotes && (
                            <span className="italic"> — "{action.followUpOutcomeNotes}"</span>
                          )}
                        </div>
                      )}

                      {/* Target milestone notes */}
                      {action.followUpNotes && !action.followUpOutcome && (
                        <div className="text-[10px] text-slate-500 italic">
                          Target: {action.followUpNotes}
                        </div>
                      )}
                    </div>
                  )}

                  {/* Hearing Information Card if scheduled */}
                  {action.hearingScheduled && (
                    <div className="p-2.5 rounded-xl bg-amber-50/80 border border-amber-200 text-amber-950 text-[11px] space-y-1">
                      <div className="flex items-center justify-between font-bold">
                        <span className="flex items-center gap-1.5 text-amber-900">
                          <Calendar className="w-3.5 h-3.5 text-amber-700" />
                          Executive Hearing: {action.hearingDate} at {action.hearingTime}
                        </span>
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-200 text-amber-900 font-mono font-bold">
                          {action.hearingStatus || 'SCHEDULED'}
                        </span>
                      </div>
                      <div className="flex items-center gap-1 text-amber-800 text-[10px]">
                        <MapPin className="w-3 h-3 text-amber-600" />
                        {action.hearingLocation}
                      </div>
                    </div>
                  )}

                  {/* Actions Bar Footer */}
                  <div className="flex flex-wrap items-center justify-between pt-2 border-t border-slate-100 text-[11px]">
                    <div className="flex items-center gap-2">
                      <span className="text-emerald-700 font-semibold flex items-center gap-0.5">
                        <CheckCircle2 className="w-3 h-3" /> Homeroom Teacher Notified
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      {action.parentNoticeSent ? (
                        <span className="text-[10px] font-bold text-emerald-800 bg-emerald-100 border border-emerald-300 px-2 py-0.5 rounded-full flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                          Parent Summons Sent (Gmail)
                        </span>
                      ) : (
                        <span className="text-[10px] font-medium text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full">
                          Parent Notice Pending
                        </span>
                      )}

                      <button
                        type="button"
                        onClick={() => setSelectedActionForHearing(action)}
                        className="px-2.5 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-[11px] font-semibold transition flex items-center gap-1 cursor-pointer"
                      >
                        <Mail className="w-3 h-3" />
                        {action.hearingScheduled ? 'Manage Summons' : 'Schedule Hearing & Email'}
                      </button>
                    </div>
                  </div>

                  {/* Principal Reversal Note */}
                  {action.reversedByPrincipal && (
                    <div className="p-2 bg-emerald-100/70 border border-emerald-300 rounded-xl text-[11px] text-emerald-900">
                      <strong>Principal Decision:</strong> "{action.reversalReason}" ({action.reversalDate})
                    </div>
                  )}
                </div>
              );
            })}

            {filteredActions.length === 0 && (
              <div className="bg-white rounded-2xl p-12 text-center border border-slate-200">
                <ShieldAlert className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                <p className="text-xs font-semibold text-slate-700">No disciplinary incidents match current filters.</p>
                <p className="text-[11px] text-slate-400 mt-1">Adjust filters or record a new incident using the form.</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* FOLLOW-UP MANAGEMENT MODAL (Complete or Reschedule using Standard Date Picker) */}
      {selectedActionForFollowUp && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs animate-fade-in">
          <div className="bg-white rounded-2xl max-w-lg w-full border border-slate-200 shadow-xl overflow-hidden">
            {/* Modal Header */}
            <div className="p-5 bg-slate-900 text-white flex items-center justify-between">
              <div>
                <span className="text-[10px] font-mono tracking-wider text-blue-300 uppercase">
                  Follow-Up Session Manager
                </span>
                <h4 className="font-oskar-vintage text-base font-bold text-white mt-0.5">
                  {selectedActionForFollowUp.studentName} ({selectedActionForFollowUp.studentId})
                </h4>
                <p className="text-xs text-slate-300">
                  Infraction: {selectedActionForFollowUp.incidentType}
                </p>
              </div>

              <button
                onClick={() => setSelectedActionForFollowUp(null)}
                className="w-7 h-7 rounded-lg bg-slate-800 text-slate-300 hover:text-white flex items-center justify-center transition"
              >
                ✕
              </button>
            </div>

            {/* Modal Tabs */}
            <div className="flex border-b border-slate-200 bg-slate-50 px-5 pt-3">
              <button
                onClick={() => setFollowUpModalTab('COMPLETE')}
                className={`pb-2.5 px-3 text-xs font-bold border-b-2 transition cursor-pointer flex items-center gap-1.5 ${
                  followUpModalTab === 'COMPLETE'
                    ? 'border-emerald-600 text-emerald-800'
                    : 'border-transparent text-slate-500 hover:text-slate-800'
                }`}
              >
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                Log Completion & Outcome
              </button>
              <button
                onClick={() => setFollowUpModalTab('RESCHEDULE')}
                className={`pb-2.5 px-3 text-xs font-bold border-b-2 transition cursor-pointer flex items-center gap-1.5 ${
                  followUpModalTab === 'RESCHEDULE'
                    ? 'border-blue-600 text-blue-800'
                    : 'border-transparent text-slate-500 hover:text-slate-800'
                }`}
              >
                <Calendar className="w-3.5 h-3.5 text-blue-600" />
                Reschedule Date Picker
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-5 space-y-4">
              {followUpModalTab === 'COMPLETE' ? (
                <div className="space-y-4">
                  <div>
                    <label className="text-xs font-semibold text-slate-700 block mb-1 flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5 text-slate-500" />
                      Session Completion Date (Standard Date Picker) *
                    </label>
                    <input
                      type="date"
                      value={completeModalDate}
                      max={todayStr}
                      onChange={(e) => setCompleteModalDate(e.target.value)}
                      className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs bg-white focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-slate-700 block mb-1">
                      Student Conduct & Progress Assessment *
                    </label>
                    <select
                      value={completeModalOutcome}
                      onChange={(e) => setCompleteModalOutcome(e.target.value)}
                      className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs bg-white focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                    >
                      <option value="Satisfactory - Conduct Improved">Satisfactory - Conduct Improved</option>
                      <option value="Resolved - Goals Fully Met">Resolved - Goals Fully Met</option>
                      <option value="Continued Monitoring - Bi-weekly Check">Continued Monitoring - Bi-weekly Check</option>
                      <option value="Non-Compliant - Escalated to Principal">Non-Compliant - Escalated to Principal</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-slate-700 block mb-1">
                      Counselor Session Notes & Observations
                    </label>
                    <textarea
                      rows={3}
                      value={completeModalNotes}
                      onChange={(e) => setCompleteModalNotes(e.target.value)}
                      placeholder="Detail student engagement, attitude during discussion, parent feedback..."
                      className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                    />
                  </div>

                  <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                    <button
                      type="button"
                      onClick={() => setSelectedActionForFollowUp(null)}
                      className="px-3.5 py-2 rounded-xl text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700"
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      onClick={handleSaveFollowUpCompletion}
                      className="px-4 py-2 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white flex items-center gap-1.5 shadow-xs cursor-pointer"
                    >
                      <CheckCircle2 className="w-4 h-4" />
                      Save & Mark Follow-Up Completed
                    </button>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-900">
                    Rescheduling updates the automated follow-up calendar reminder and flags the student ledger.
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs font-semibold text-slate-700 block mb-1 flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5 text-blue-600" />
                        New Follow-Up Date *
                      </label>
                      <input
                        type="date"
                        min={todayStr}
                        value={rescheduleModalDate}
                        onChange={(e) => setRescheduleModalDate(e.target.value)}
                        className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs bg-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="text-xs font-semibold text-slate-700 block mb-1 flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5 text-blue-600" />
                        New Time
                      </label>
                      <input
                        type="time"
                        value={rescheduleModalTime}
                        onChange={(e) => setRescheduleModalTime(e.target.value)}
                        className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs bg-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-slate-700 block mb-1">
                      Reason for Rescheduling
                    </label>
                    <input
                      type="text"
                      value={rescheduleModalReason}
                      onChange={(e) => setRescheduleModalReason(e.target.value)}
                      placeholder="e.g. Student absence / parent requested postponement"
                      className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs bg-white"
                    />
                  </div>

                  <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                    <button
                      type="button"
                      onClick={() => setSelectedActionForFollowUp(null)}
                      className="px-3.5 py-2 rounded-xl text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700"
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      onClick={handleSaveFollowUpReschedule}
                      className="px-4 py-2 rounded-xl text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white flex items-center gap-1.5 shadow-xs cursor-pointer"
                    >
                      <Calendar className="w-4 h-4" />
                      Save New Schedule
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Disciplinary Hearing Modal */}
      {selectedActionForHearing && (
        <DisciplinaryHearingModal
          isOpen={!!selectedActionForHearing}
          onClose={() => setSelectedActionForHearing(null)}
          action={selectedActionForHearing}
        />
      )}
    </div>
  );
};
