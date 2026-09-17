import React, { useState } from 'react';
import { useSchool } from '../../context/SchoolContext';
import { AcademicGrade, AcademicStream, Section } from '../../types';
import { 
  Layers, 
  Users, 
  Settings2, 
  Shuffle, 
  ShieldAlert, 
  CheckCircle2, 
  UserCheck, 
  AlertCircle 
} from 'lucide-react';

export const ProgramOfficeView: React.FC = () => {
  const { 
    sections, 
    students, 
    teachers, 
    createOrUpdateSection, 
    assignStudentToSection, 
    autoBalanceGradeSections, 
    assignHomeroomTeacher 
  } = useSchool();

  const [activeGrade, setActiveGrade] = useState<AcademicGrade>(9);
  const [activeSectionId, setActiveSectionId] = useState<string>('9A');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // New Section creation dialog state
  const [newSectionLetter, setNewSectionLetter] = useState('D');
  const [newSectionCapacity, setNewSectionCapacity] = useState('35');
  const [newSectionStream, setNewSectionStream] = useState<AcademicStream>('Natural Sciences');

  // Filter sections by grade
  const gradeSections = sections.filter(s => s.grade === activeGrade);

  // Filter students for active grade
  const gradeStudents = students.filter(s => s.grade === activeGrade);

  // Students in currently selected section
  const sectionStudents = students.filter(s => s.sectionId === activeSectionId);

  // Unassigned students in this grade
  const unassignedStudents = gradeStudents.filter(s => !s.sectionId);

  const handleAssignStudent = (studentId: string, targetSectionId: string) => {
    setErrorMessage(null);
    setSuccessMessage(null);
    const res = assignStudentToSection(studentId, targetSectionId);
    if (!res.success) {
      setErrorMessage(res.error || 'Failed to assign student to section.');
    } else {
      setSuccessMessage('Student successfully assigned to section roster.');
      setTimeout(() => setSuccessMessage(null), 4000);
    }
  };

  const handleAutoBalance = () => {
    setErrorMessage(null);
    setSuccessMessage(null);
    const res = autoBalanceGradeSections(activeGrade);
    if (res.skippedPendingStreamCount > 0) {
      setErrorMessage(
        `Auto-Balanced ${res.assignedCount} students into sections. Notice: ${res.skippedPendingStreamCount} student(s) with pending Stream Change requests were intentionally withheld from classroom assignment per policy.`
      );
    } else {
      setSuccessMessage(`Auto-Balanced ${res.assignedCount} students across Grade ${activeGrade} sections.`);
      setTimeout(() => setSuccessMessage(null), 5000);
    }
  };

  const handleCreateSection = (e: React.FormEvent) => {
    e.preventDefault();
    const sectionId = activeGrade >= 11
      ? `${activeGrade}-${newSectionStream === 'Natural Sciences' ? 'NAT' : 'SOC'}-${newSectionLetter.toUpperCase()}`
      : `${activeGrade}${newSectionLetter.toUpperCase()}`;

    const newSec: Section = {
      id: sectionId,
      grade: activeGrade,
      sectionLetter: newSectionLetter.toUpperCase(),
      stream: activeGrade >= 11 ? newSectionStream : null,
      homeroomTeacherId: null,
      homeroomTeacherName: null,
      capacity: parseInt(newSectionCapacity) || 35,
    };

    createOrUpdateSection(newSec);
    setActiveSectionId(sectionId);
    setSuccessMessage(`Section ${sectionId} successfully configured.`);
    setTimeout(() => setSuccessMessage(null), 4000);
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 pb-5">
          <div>
            <span className="px-2.5 py-0.5 bg-purple-100 text-purple-800 rounded text-xs font-bold uppercase tracking-wider">
              Academic Operations & Curriculum
            </span>
            <h1 className="font-oskar-vintage text-2xl font-bold text-slate-900 mt-1 tracking-wider">
              Program Office: Section Allocation & Rosters
            </h1>
            <p className="text-xs text-slate-500 mt-0.5">
              Configure class sections (A, B, C, D), split Grades 11-12 by Natural/Social stream, and generate classroom attendance rosters.
            </p>
          </div>

          {/* Grade Picker */}
          <div className="flex bg-slate-100 p-1.5 rounded-xl border border-slate-200">
            {([9, 10, 11, 12] as AcademicGrade[]).map((g) => (
              <button
                key={g}
                onClick={() => {
                  setActiveGrade(g);
                  const firstSec = sections.find(s => s.grade === g);
                  if (firstSec) setActiveSectionId(firstSec.id);
                }}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition ${
                  activeGrade === g
                    ? 'bg-white text-blue-700 shadow-sm'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Grade {g}
              </button>
            ))}
          </div>
        </div>

        {/* Feedback banners */}
        {errorMessage && (
          <div className="mt-4 p-3 bg-amber-50 border border-amber-300 rounded-xl text-xs text-amber-900 flex items-start gap-2 animate-in fade-in">
            <ShieldAlert className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            <span>{errorMessage}</span>
          </div>
        )}

        {successMessage && (
          <div className="mt-4 p-3 bg-emerald-50 border border-emerald-300 rounded-xl text-xs text-emerald-900 flex items-center gap-2 animate-in fade-in">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{successMessage}</span>
          </div>
        )}

        {/* Section Stats for Active Grade */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-5">
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
            <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Total Sections</p>
            <p className="font-oskar-vintage text-xl font-bold text-slate-900 mt-0.5">
              {gradeSections.length} Sections
            </p>
          </div>

          <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
            <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Assigned Students</p>
            <p className="font-oskar-vintage text-xl font-bold text-emerald-600 mt-0.5">
              {gradeStudents.filter(s => s.sectionId).length} / {gradeStudents.length}
            </p>
          </div>

          <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
            <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Unassigned Roster</p>
            <p className="font-oskar-vintage text-xl font-bold text-amber-600 mt-0.5">
              {unassignedStudents.length} Students
            </p>
          </div>

          <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
            <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Stream Rules (11 & 12)</p>
            <p className="text-xs font-semibold text-blue-700 mt-1">
              {activeGrade >= 11 ? 'Split: Natural vs Social' : 'Unified General'}
            </p>
          </div>
        </div>
      </div>

      {/* Main Workspace Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column: Configured Sections & Creation */}
        <div className="space-y-4">
          <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-200">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-oskar-vintage text-base font-bold text-slate-900">
                Grade {activeGrade} Sections ({gradeSections.length})
              </h3>
              <button
                onClick={handleAutoBalance}
                className="px-2.5 py-1 bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 rounded text-xs font-semibold flex items-center gap-1 transition"
                title="Distribute students evenly, withholding pending stream change students"
              >
                <Shuffle className="w-3 h-3" />
                Auto-Balance
              </button>
            </div>

            <div className="space-y-2">
              {gradeSections.map((sec) => {
                const count = students.filter(s => s.sectionId === sec.id).length;
                const isSelected = activeSectionId === sec.id;

                return (
                  <button
                    key={sec.id}
                    onClick={() => setActiveSectionId(sec.id)}
                    className={`w-full p-3 rounded-xl border text-left transition ${
                      isSelected
                        ? 'border-blue-600 bg-blue-50/80 ring-1 ring-blue-500'
                        : 'border-slate-200 hover:border-slate-300 bg-white'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-sm text-slate-900">Section {sec.id}</span>
                      <span className="text-xs font-mono font-semibold text-slate-600">
                        {count} / {sec.capacity} students
                      </span>
                    </div>

                    <div className="mt-1 flex items-center justify-between text-[11px] text-slate-500">
                      <span>Homeroom: {sec.homeroomTeacherName || 'Not Assigned'}</span>
                      {sec.stream && (
                        <span className="px-1.5 py-0.2 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded text-[10px] font-semibold">
                          {sec.stream === 'Natural Sciences' ? 'NAT' : 'SOC'}
                        </span>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Quick Homeroom Teacher Assign for Selected Section */}
            {activeSectionId && (
              <div className="mt-4 pt-4 border-t border-slate-100">
                <label className="text-xs font-semibold text-slate-700 block mb-1">
                  Assign Homeroom Teacher to {activeSectionId}:
                </label>
                <select
                  value={sections.find(s => s.id === activeSectionId)?.homeroomTeacherId || ''}
                  onChange={(e) => assignHomeroomTeacher(activeSectionId, e.target.value)}
                  className="w-full px-2.5 py-1.5 border border-slate-300 rounded-lg text-xs bg-white"
                >
                  <option value="">Select Teacher</option>
                  {teachers.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.name} ({t.subject})
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>

          {/* Section Expansion Form */}
          <form onSubmit={handleCreateSection} className="bg-white rounded-2xl p-5 shadow-sm border border-slate-200 space-y-3">
            <h4 className="font-oskar-vintage text-sm font-bold text-slate-900">
              Add New Section for Grade {activeGrade}
            </h4>

            <div>
              <label className="text-[11px] font-semibold text-slate-600 block">Section Letter (e.g. C, D, E)</label>
              <input
                type="text"
                maxLength={2}
                required
                value={newSectionLetter}
                onChange={(e) => setNewSectionLetter(e.target.value)}
                className="w-full px-2.5 py-1.5 border border-slate-300 rounded text-xs uppercase"
              />
            </div>

            {activeGrade >= 11 && (
              <div>
                <label className="text-[11px] font-semibold text-slate-600 block">Section Stream</label>
                <select
                  value={newSectionStream}
                  onChange={(e) => setNewSectionStream(e.target.value as any)}
                  className="w-full px-2.5 py-1.5 border border-slate-300 rounded text-xs bg-white"
                >
                  <option value="Natural Sciences">Natural Sciences</option>
                  <option value="Social Sciences">Social Sciences</option>
                </select>
              </div>
            )}

            <div>
              <label className="text-[11px] font-semibold text-slate-600 block">Max Capacity</label>
              <input
                type="number"
                min="10"
                max="50"
                value={newSectionCapacity}
                onChange={(e) => setNewSectionCapacity(e.target.value)}
                className="w-full px-2.5 py-1.5 border border-slate-300 rounded text-xs"
              />
            </div>

            <button
              type="submit"
              className="w-full py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold transition shadow-sm"
            >
              Create Section
            </button>
          </form>
        </div>

        {/* Center & Right Column: Roster & Assigning */}
        <div className="lg:col-span-2 space-y-4">
          
          {/* Section Roster for Active Section */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="font-oskar-vintage text-base font-bold text-slate-900">
                  Classroom Roster: Section {activeSectionId}
                </h3>
                <p className="text-xs text-slate-500">
                  Students enrolled in this section for daily attendance and timetable.
                </p>
              </div>
              <span className="px-2.5 py-1 bg-blue-100 text-blue-800 rounded font-mono font-bold text-xs">
                {sectionStudents.length} Students
              </span>
            </div>

            <div className="space-y-2">
              {sectionStudents.map((s) => (
                <div key={s.id} className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-3">
                    <img src={s.photoUrl} alt={s.fullName} className="w-8 h-10 object-cover rounded border border-slate-300" />
                    <div>
                      <p className="font-bold text-slate-900">{s.fullName}</p>
                      <p className="font-mono text-[11px] text-blue-600">{s.id}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    {s.stream && (
                      <span className="text-[10px] font-semibold text-slate-500">
                        {s.stream}
                      </span>
                    )}
                    <button
                      onClick={() => handleAssignStudent(s.id, '')}
                      className="text-xs text-rose-600 hover:underline font-semibold"
                    >
                      Remove
                    </button>
                  </div>
                </div>
              ))}

              {sectionStudents.length === 0 && (
                <p className="text-xs text-slate-400 text-center py-6">
                  No students assigned to section {activeSectionId} yet. Assign students from the unallocated pool below.
                </p>
              )}
            </div>
          </div>

          {/* Unassigned Students Pool (With Policy Safeguard Warning) */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200 space-y-4">
            <div className="border-b border-slate-100 pb-3">
              <h3 className="font-oskar-vintage text-base font-bold text-slate-900">
                Unallocated Students Pool (Grade {activeGrade})
              </h3>
              <p className="text-xs text-slate-500">
                Assign eligible students to section {activeSectionId}. Students with pending stream change requests are blocked by policy.
              </p>
            </div>

            <div className="space-y-2">
              {unassignedStudents.map((s) => {
                const hasPendingStream = s.streamChangeRequest?.status === 'PENDING';

                return (
                  <div 
                    key={s.id} 
                    className={`p-3 rounded-xl border flex items-center justify-between text-xs transition ${
                      hasPendingStream ? 'border-amber-300 bg-amber-50/50' : 'border-slate-200 bg-slate-50'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <img src={s.photoUrl} alt={s.fullName} className="w-8 h-10 object-cover rounded border border-slate-300" />
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="font-bold text-slate-900">{s.fullName}</p>
                          <span className="font-mono text-[11px] text-blue-600">{s.id}</span>
                        </div>
                        {s.stream && (
                          <span className="text-[10px] text-slate-500 font-medium">Stream: {s.stream}</span>
                        )}
                        {hasPendingStream && (
                          <span className="block text-[10px] font-bold text-amber-800">
                            ⚠ Pending Stream Change ({s.streamChangeRequest?.requestedStream}) - Allocation Withheld
                          </span>
                        )}
                      </div>
                    </div>

                    <div>
                      {hasPendingStream ? (
                        <span className="px-2 py-1 bg-amber-100 text-amber-900 rounded font-bold text-[10px] cursor-not-allowed">
                          Blocked by Policy
                        </span>
                      ) : (
                        <button
                          onClick={() => handleAssignStudent(s.id, activeSectionId)}
                          className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold text-xs transition shadow-sm"
                        >
                          Assign to {activeSectionId}
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}

              {unassignedStudents.length === 0 && (
                <p className="text-xs text-emerald-700 font-medium text-center py-4">
                  ✓ All eligible Grade {activeGrade} students have been allocated to class sections.
                </p>
              )}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};
