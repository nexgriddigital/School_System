import React, { useState, useRef, useEffect, useMemo } from 'react';
import { useSchool } from '../../context/SchoolContext';
import { Student, Teacher, Invoice, BankStatementRow } from '../../types';
import {
  Search,
  X,
  User,
  GraduationCap,
  CreditCard,
  Building2,
  Receipt,
  FileSpreadsheet,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  Clock,
  AlertCircle,
  Phone,
  Mail,
  BookOpen,
  Layers,
  Sparkles,
  Command,
  HelpCircle
} from 'lucide-react';

type SearchCategory = 'ALL' | 'STUDENTS' | 'TEACHERS' | 'FINANCE';

interface SearchResultItem {
  type: 'STUDENT' | 'TEACHER' | 'INVOICE' | 'BANK';
  id: string;
  title: string;
  subtitle: string;
  badge: string;
  badgeColor: string;
  metadata?: string;
  details?: string[];
  rawItem: Student | Teacher | Invoice | BankStatementRow;
}

export interface GlobalSearchBarProps {
  isMobileTrigger?: boolean;
}

export const GlobalSearchBar: React.FC<GlobalSearchBarProps> = ({ isMobileTrigger = false }) => {
  const {
    students,
    teachers,
    invoices,
    bankStatements,
    currentRole,
    setActiveStudentId,
    setActiveTeacherId,
    setSelectedStudentForIdCard,
    setSelectedInvoiceForReceipt
  } = useSchool();

  const [query, setQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [activeCategory, setActiveCategory] = useState<SearchCategory>('ALL');
  const [selectedIndex, setSelectedIndex] = useState(0);

  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  // Global shortcut to focus search: '/' or 'Cmd+K' / 'Ctrl+K'
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement | null;
      const isInputOrTextarea = target && (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable);

      if ((e.key === '/' && !isInputOrTextarea) || ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k')) {
        e.preventDefault();
        setIsOpen(true);
        setTimeout(() => inputRef.current?.focus(), 50);
      } else if (e.key === 'Escape' && isOpen) {
        setIsOpen(false);
        inputRef.current?.blur();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen]);

  // Click outside listener
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Filter and index search results
  const searchResults = useMemo(() => {
    const trimmed = query.trim().toLowerCase();
    if (!trimmed) return [];

    const results: SearchResultItem[] = [];

    // 1. STUDENTS
    if (activeCategory === 'ALL' || activeCategory === 'STUDENTS') {
      students.forEach(s => {
        const matchesName = s.fullName.toLowerCase().includes(trimmed);
        const matchesId = s.id.toLowerCase().includes(trimmed);
        const matchesAccount = s.accountNumber.toLowerCase().includes(trimmed);
        const matchesGrade = `grade ${s.grade}`.includes(trimmed) || `gr ${s.grade}`.includes(trimmed) || `g${s.grade}`.includes(trimmed);
        const matchesSection = s.sectionId ? s.sectionId.toLowerCase().includes(trimmed) : false;
        const matchesStream = s.stream ? s.stream.toLowerCase().includes(trimmed) : false;
        const matchesFather = s.parents.fatherName.toLowerCase().includes(trimmed);
        const matchesMother = s.parents.motherName.toLowerCase().includes(trimmed);
        const matchesPhone = s.parents.fatherPhone.includes(trimmed) || s.parents.motherPhone.includes(trimmed);
        const matchesEmail = s.parents.email ? s.parents.email.toLowerCase().includes(trimmed) : false;

        if (matchesName || matchesId || matchesAccount || matchesGrade || matchesSection || matchesStream || matchesFather || matchesMother || matchesPhone || matchesEmail) {
          results.push({
            type: 'STUDENT',
            id: s.id,
            title: s.fullName,
            subtitle: `${s.id} • Acc: ${s.accountNumber}`,
            badge: `Grade ${s.grade}${s.sectionId ? ` (${s.sectionId})` : ''}`,
            badgeColor: 'bg-blue-900/80 text-blue-200 border-blue-700',
            metadata: s.stream ? `${s.stream} Stream` : s.registrationStatus === 'COMPLETE' ? 'Registered' : 'Pending Fee',
            details: [
              `Parent: ${s.parents.fatherName || s.parents.motherName || 'N/A'}`,
              `Phone: ${s.parents.fatherPhone || s.parents.motherPhone || 'N/A'}`
            ],
            rawItem: s
          });
        }
      });
    }

    // 2. TEACHERS
    if (activeCategory === 'ALL' || activeCategory === 'TEACHERS') {
      teachers.forEach(t => {
        const matchesName = t.name.toLowerCase().includes(trimmed);
        const matchesId = t.id.toLowerCase().includes(trimmed);
        const matchesSubject = t.subject.toLowerCase().includes(trimmed);
        const matchesEmail = t.email.toLowerCase().includes(trimmed);
        const matchesSection = t.assignedSectionId ? t.assignedSectionId.toLowerCase().includes(trimmed) : false;

        if (matchesName || matchesId || matchesSubject || matchesEmail || matchesSection) {
          results.push({
            type: 'TEACHER',
            id: t.id,
            title: t.name,
            subtitle: `${t.subject} Faculty • ${t.id}`,
            badge: t.isHomeroom ? `Homeroom (${t.assignedSectionId || 'Unassigned'})` : 'Subject Teacher',
            badgeColor: 'bg-indigo-900/80 text-indigo-200 border-indigo-700',
            metadata: t.email,
            details: [
              `Email: ${t.email}`,
              t.isHomeroom ? `Advisor: Section ${t.assignedSectionId}` : 'Subject Instructor'
            ],
            rawItem: t
          });
        }
      });
    }

    // 3. FINANCE - INVOICES & BANK STATEMENTS
    if (activeCategory === 'ALL' || activeCategory === 'FINANCE') {
      // Invoices
      invoices.forEach(inv => {
        const matchesId = inv.id.toLowerCase().includes(trimmed);
        const matchesStudent = inv.studentName.toLowerCase().includes(trimmed);
        const matchesStudentId = inv.studentId.toLowerCase().includes(trimmed);
        const matchesAccount = inv.accountNumber.toLowerCase().includes(trimmed);
        const matchesRef = inv.paymentReference ? inv.paymentReference.toLowerCase().includes(trimmed) : false;
        const matchesReceipt = inv.receiptNumber ? inv.receiptNumber.toLowerCase().includes(trimmed) : false;
        const matchesTitle = inv.title.toLowerCase().includes(trimmed);
        const matchesStatus = inv.status.toLowerCase().includes(trimmed);

        if (matchesId || matchesStudent || matchesStudentId || matchesAccount || matchesRef || matchesReceipt || matchesTitle || matchesStatus) {
          const isPaid = inv.status === 'PAID';
          const isPending = inv.status === 'PENDING_APPROVAL';
          results.push({
            type: 'INVOICE',
            id: inv.id,
            title: `${inv.title} — ${inv.amount.toLocaleString()} ETB`,
            subtitle: `${inv.studentName} (${inv.studentId}) • Acc: ${inv.accountNumber}`,
            badge: inv.status,
            badgeColor: isPaid
              ? 'bg-emerald-900/80 text-emerald-200 border-emerald-700'
              : isPending
              ? 'bg-amber-900/80 text-amber-200 border-amber-700'
              : 'bg-rose-900/80 text-rose-200 border-rose-700',
            metadata: `Ref: ${inv.paymentReference || 'N/A'}${inv.receiptNumber ? ` • Rcpt #${inv.receiptNumber}` : ''}`,
            details: [
              `Due: ${inv.dueDate}`,
              inv.paidDate ? `Paid: ${inv.paidDate}` : 'Payment Pending'
            ],
            rawItem: inv
          });
        }
      });

      // Bank Statements
      bankStatements.forEach(b => {
        const matchesId = b.id.toLowerCase().includes(trimmed);
        const matchesPayer = b.payerName.toLowerCase().includes(trimmed);
        const matchesRef = b.referenceNumber.toLowerCase().includes(trimmed);
        const matchesDesc = b.bankDescription.toLowerCase().includes(trimmed);

        if (matchesId || matchesPayer || matchesRef || matchesDesc) {
          results.push({
            type: 'BANK',
            id: b.id,
            title: `Bank Deposit: ${b.payerName} — ${b.amount.toLocaleString()} ETB`,
            subtitle: `Ref: ${b.referenceNumber} • ${b.transactionDate}`,
            badge: b.status,
            badgeColor: b.status === 'RECONCILED'
              ? 'bg-emerald-900/80 text-emerald-200 border-emerald-700'
              : 'bg-amber-900/80 text-amber-200 border-amber-700',
            metadata: b.bankDescription,
            details: [
              `Date: ${b.transactionDate}`,
              `Bank Note: ${b.bankDescription}`
            ],
            rawItem: b
          });
        }
      });
    }

    return results;
  }, [query, activeCategory, students, teachers, invoices, bankStatements]);

  // Counts for category tabs
  const categoryCounts = useMemo(() => {
    const trimmed = query.trim().toLowerCase();
    if (!trimmed) {
      return { ALL: 0, STUDENTS: 0, TEACHERS: 0, FINANCE: 0 };
    }

    let sCount = 0;
    students.forEach(s => {
      if (
        s.fullName.toLowerCase().includes(trimmed) ||
        s.id.toLowerCase().includes(trimmed) ||
        s.accountNumber.toLowerCase().includes(trimmed) ||
        `grade ${s.grade}`.includes(trimmed) ||
        (s.sectionId && s.sectionId.toLowerCase().includes(trimmed)) ||
        (s.stream && s.stream.toLowerCase().includes(trimmed)) ||
        s.parents.fatherName.toLowerCase().includes(trimmed) ||
        s.parents.motherName.toLowerCase().includes(trimmed) ||
        s.parents.fatherPhone.includes(trimmed)
      ) {
        sCount++;
      }
    });

    let tCount = 0;
    teachers.forEach(t => {
      if (
        t.name.toLowerCase().includes(trimmed) ||
        t.id.toLowerCase().includes(trimmed) ||
        t.subject.toLowerCase().includes(trimmed) ||
        t.email.toLowerCase().includes(trimmed) ||
        (t.assignedSectionId && t.assignedSectionId.toLowerCase().includes(trimmed))
      ) {
        tCount++;
      }
    });

    let fCount = 0;
    invoices.forEach(inv => {
      if (
        inv.id.toLowerCase().includes(trimmed) ||
        inv.studentName.toLowerCase().includes(trimmed) ||
        inv.studentId.toLowerCase().includes(trimmed) ||
        inv.accountNumber.toLowerCase().includes(trimmed) ||
        (inv.paymentReference && inv.paymentReference.toLowerCase().includes(trimmed)) ||
        (inv.receiptNumber && inv.receiptNumber.toLowerCase().includes(trimmed)) ||
        inv.title.toLowerCase().includes(trimmed)
      ) {
        fCount++;
      }
    });
    bankStatements.forEach(b => {
      if (
        b.id.toLowerCase().includes(trimmed) ||
        b.payerName.toLowerCase().includes(trimmed) ||
        b.referenceNumber.toLowerCase().includes(trimmed) ||
        b.bankDescription.toLowerCase().includes(trimmed)
      ) {
        fCount++;
      }
    });

    return {
      ALL: sCount + tCount + fCount,
      STUDENTS: sCount,
      TEACHERS: tCount,
      FINANCE: fCount
    };
  }, [query, students, teachers, invoices, bankStatements]);

  // Reset selected index when query or category changes
  useEffect(() => {
    setSelectedIndex(0);
  }, [query, activeCategory]);

  // Keyboard navigation inside dropdown list
  const handleKeyDownInInput = (e: React.KeyboardEvent) => {
    if (!isOpen || searchResults.length === 0) return;

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex(prev => (prev + 1) % searchResults.length);
      setTimeout(() => {
        const selectedEl = document.getElementById(`search-result-item-${(selectedIndex + 1) % searchResults.length}`);
        selectedEl?.scrollIntoView({ block: 'nearest' });
      }, 10);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex(prev => (prev - 1 + searchResults.length) % searchResults.length);
      setTimeout(() => {
        const selectedEl = document.getElementById(`search-result-item-${(selectedIndex - 1 + searchResults.length) % searchResults.length}`);
        selectedEl?.scrollIntoView({ block: 'nearest' });
      }, 10);
    } else if (e.key === 'Enter') {
      e.preventDefault();
      const current = searchResults[selectedIndex];
      if (current) {
        handleSelectResult(current);
      }
    }
  };

  // Primary action on selecting an item (respects active portal responsibility)
  const handleSelectResult = (item: SearchResultItem) => {
    setIsOpen(false);
    if (item.type === 'STUDENT') {
      const student = item.rawItem as Student;
      if (currentRole === 'STUDENT' || currentRole === 'PARENT') {
        setActiveStudentId(student.id);
      } else {
        // Open ID Card preview modal in-place for administrative review
        setSelectedStudentForIdCard(student);
      }
    } else if (item.type === 'TEACHER') {
      const teacher = item.rawItem as Teacher;
      if (currentRole === 'TEACHER') {
        setActiveTeacherId(teacher.id);
      }
    } else if (item.type === 'INVOICE') {
      const inv = item.rawItem as Invoice;
      setSelectedInvoiceForReceipt(inv);
    }
  };

  // Secondary quick actions
  const handleOpenStudentIdCard = (e: React.MouseEvent, student: Student) => {
    e.stopPropagation();
    setIsOpen(false);
    setSelectedStudentForIdCard(student);
  };

  const handleClear = () => {
    setQuery('');
    inputRef.current?.focus();
  };

  // Text highlighter helper
  const highlightMatch = (text: string, search: string) => {
    if (!search.trim()) return text;
    const parts = text.split(new RegExp(`(${search.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi'));
    return (
      <>
        {parts.map((part, i) =>
          part.toLowerCase() === search.toLowerCase() ? (
            <mark key={i} className="bg-amber-400/40 text-amber-200 px-0.5 rounded font-bold">
              {part}
            </mark>
          ) : (
            part
          )
        )}
      </>
    );
  };

  // Dropdown Body Content (Shared between desktop popover and mobile modal)
  const renderDropdownBody = () => (
    <>
      {/* Category Filter Tabs */}
      <div className="flex items-center justify-between px-3 py-2 border-b border-slate-800 bg-slate-950/70 text-xs">
        <div className="flex items-center gap-1 overflow-x-auto no-scrollbar">
          <button
            id="tab-search-all"
            type="button"
            onClick={() => setActiveCategory('ALL')}
            className={`px-2.5 py-1 rounded-lg font-semibold text-[11px] transition flex items-center gap-1.5 cursor-pointer ${
              activeCategory === 'ALL'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/80'
            }`}
          >
            <span>All</span>
            {query.trim() && (
              <span className="px-1.5 py-0.2 rounded-full text-[9px] bg-slate-800 text-slate-200 border border-slate-700">
                {categoryCounts.ALL}
              </span>
            )}
          </button>

          <button
            id="tab-search-students"
            type="button"
            onClick={() => setActiveCategory('STUDENTS')}
            className={`px-2.5 py-1 rounded-lg font-semibold text-[11px] transition flex items-center gap-1.5 cursor-pointer ${
              activeCategory === 'STUDENTS'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/80'
            }`}
          >
            <User className="w-3 h-3 text-blue-400" />
            <span>Students</span>
            {query.trim() && (
              <span className="px-1.5 py-0.2 rounded-full text-[9px] bg-slate-800 text-slate-200 border border-slate-700">
                {categoryCounts.STUDENTS}
              </span>
            )}
          </button>

          <button
            id="tab-search-teachers"
            type="button"
            onClick={() => setActiveCategory('TEACHERS')}
            className={`px-2.5 py-1 rounded-lg font-semibold text-[11px] transition flex items-center gap-1.5 cursor-pointer ${
              activeCategory === 'TEACHERS'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/80'
            }`}
          >
            <GraduationCap className="w-3 h-3 text-indigo-400" />
            <span>Teachers</span>
            {query.trim() && (
              <span className="px-1.5 py-0.2 rounded-full text-[9px] bg-slate-800 text-slate-200 border border-slate-700">
                {categoryCounts.TEACHERS}
              </span>
            )}
          </button>

          <button
            id="tab-search-finance"
            type="button"
            onClick={() => setActiveCategory('FINANCE')}
            className={`px-2.5 py-1 rounded-lg font-semibold text-[11px] transition flex items-center gap-1.5 cursor-pointer ${
              activeCategory === 'FINANCE'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/80'
            }`}
          >
            <CreditCard className="w-3 h-3 text-emerald-400" />
            <span>Finance</span>
            {query.trim() && (
              <span className="px-1.5 py-0.2 rounded-full text-[9px] bg-slate-800 text-slate-200 border border-slate-700">
                {categoryCounts.FINANCE}
              </span>
            )}
          </button>
        </div>

        <span className="text-[10px] text-slate-400 font-mono hidden sm:inline">
          ↑↓ Navigate • ↵ Select • Esc Close
        </span>
      </div>

      {/* Results List */}
      <div ref={listRef} className="max-h-96 overflow-y-auto divide-y divide-slate-800/80">
        {/* If no query, show helpful suggestions and quick links */}
        {!query.trim() && (
          <div className="p-4 space-y-3">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-400">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>Quick Search Suggestions across Modules</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
              <button
                type="button"
                onClick={() => {
                  setQuery('Grade 9');
                  inputRef.current?.focus();
                }}
                className="flex items-center gap-2 p-2 rounded-xl bg-slate-800/60 hover:bg-slate-800 border border-slate-700/60 text-left transition cursor-pointer group"
              >
                <div className="p-1.5 rounded-lg bg-blue-900/60 text-blue-300 border border-blue-700/50">
                  <User className="w-3.5 h-3.5" />
                </div>
                <div>
                  <div className="font-semibold text-white group-hover:text-blue-300 transition">
                    Grade 9 Students
                  </div>
                  <div className="text-[10px] text-slate-400">Find freshman scholars & admissions</div>
                </div>
              </button>

              <button
                type="button"
                onClick={() => {
                  setQuery('Mathematics');
                  inputRef.current?.focus();
                }}
                className="flex items-center gap-2 p-2 rounded-xl bg-slate-800/60 hover:bg-slate-800 border border-slate-700/60 text-left transition cursor-pointer group"
              >
                <div className="p-1.5 rounded-lg bg-indigo-900/60 text-indigo-300 border border-indigo-700/50">
                  <GraduationCap className="w-3.5 h-3.5" />
                </div>
                <div>
                  <div className="font-semibold text-white group-hover:text-indigo-300 transition">
                    Mathematics Faculty
                  </div>
                  <div className="text-[10px] text-slate-400">Teachers, homerooms & gradebooks</div>
                </div>
              </button>

              <button
                type="button"
                onClick={() => {
                  setQuery('Tuition');
                  inputRef.current?.focus();
                }}
                className="flex items-center gap-2 p-2 rounded-xl bg-slate-800/60 hover:bg-slate-800 border border-slate-700/60 text-left transition cursor-pointer group"
              >
                <div className="p-1.5 rounded-lg bg-emerald-900/60 text-emerald-300 border border-emerald-700/50">
                  <CreditCard className="w-3.5 h-3.5" />
                </div>
                <div>
                  <div className="font-semibold text-white group-hover:text-emerald-300 transition">
                    Tuition Invoices
                  </div>
                  <div className="text-[10px] text-slate-400">Term fee billings, vouchers & receipts</div>
                </div>
              </button>

              <button
                type="button"
                onClick={() => {
                  setQuery('CBE');
                  inputRef.current?.focus();
                }}
                className="flex items-center gap-2 p-2 rounded-xl bg-slate-800/60 hover:bg-slate-800 border border-slate-700/60 text-left transition cursor-pointer group"
              >
                <div className="p-1.5 rounded-lg bg-amber-900/60 text-amber-300 border border-amber-700/50">
                  <FileSpreadsheet className="w-3.5 h-3.5" />
                </div>
                <div>
                  <div className="font-semibold text-white group-hover:text-amber-300 transition">
                    Bank Statements
                  </div>
                  <div className="text-[10px] text-slate-400">Reconciliation records & CBE slips</div>
                </div>
              </button>
            </div>
          </div>
        )}

        {/* Query active but zero results */}
        {query.trim() && searchResults.length === 0 && (
          <div className="p-8 text-center space-y-2">
            <div className="w-10 h-10 mx-auto rounded-full bg-slate-800 flex items-center justify-center text-slate-400">
              <AlertCircle className="w-5 h-5 text-slate-400" />
            </div>
            <p className="text-sm font-bold text-white">No records found for "{query}"</p>
            <p className="text-xs text-slate-400 max-w-sm mx-auto">
              Try searching by student name, ID (<span className="font-mono text-blue-300">OSK-2026-XXXX</span>), account number (<span className="font-mono text-blue-300">ACC-XXXXX</span>), teacher subject, or invoice reference.
            </p>
          </div>
        )}

        {/* Query active with matching results */}
        {query.trim() && searchResults.map((item, idx) => {
          const isSelected = selectedIndex === idx;

          return (
            <div
              key={`${item.type}-${item.id}`}
              id={`search-result-item-${idx}`}
              onClick={() => handleSelectResult(item)}
              onMouseEnter={() => setSelectedIndex(idx)}
              className={`p-3 transition-colors cursor-pointer flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                isSelected ? 'bg-blue-950/70 border-l-4 border-l-blue-400' : 'hover:bg-slate-800/60 border-l-4 border-l-transparent'
              }`}
            >
              {/* Left Column: Icon & Primary Information */}
              <div className="flex items-start gap-3 min-w-0">
                <div className="mt-0.5 shrink-0">
                  {item.type === 'STUDENT' && (
                    <div className="w-9 h-9 rounded-xl bg-blue-900/60 border border-blue-700/60 flex items-center justify-center text-blue-300 shadow-xs">
                      <User className="w-4 h-4" />
                    </div>
                  )}
                  {item.type === 'TEACHER' && (
                    <div className="w-9 h-9 rounded-xl bg-indigo-900/60 border border-indigo-700/60 flex items-center justify-center text-indigo-300 shadow-xs">
                      <GraduationCap className="w-4 h-4" />
                    </div>
                  )}
                  {item.type === 'INVOICE' && (
                    <div className="w-9 h-9 rounded-xl bg-emerald-900/60 border border-emerald-700/60 flex items-center justify-center text-emerald-300 shadow-xs">
                      <Receipt className="w-4 h-4" />
                    </div>
                  )}
                  {item.type === 'BANK' && (
                    <div className="w-9 h-9 rounded-xl bg-amber-900/60 border border-amber-700/60 flex items-center justify-center text-amber-300 shadow-xs">
                      <FileSpreadsheet className="w-4 h-4" />
                    </div>
                  )}
                </div>

                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-bold text-xs text-white leading-tight">
                      {highlightMatch(item.title, query)}
                    </span>
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-semibold border ${item.badgeColor}`}
                    >
                      {item.badge}
                    </span>
                  </div>

                  <p className="text-[11px] text-slate-300 font-mono mt-0.5 truncate">
                    {highlightMatch(item.subtitle, query)}
                  </p>

                  {item.metadata && (
                    <p className="text-[10px] text-slate-400 mt-0.5 truncate">
                      {highlightMatch(item.metadata, query)}
                    </p>
                  )}
                </div>
              </div>

              {/* Right Column: Contextual In-Portal Actions (No Cross-Portal Switching) */}
              <div className="flex items-center gap-1.5 self-end sm:self-center shrink-0">
                {item.type === 'STUDENT' && (
                  <>
                    <button
                      type="button"
                      onClick={(e) => handleOpenStudentIdCard(e, item.rawItem as Student)}
                      className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-[10px] font-medium border border-slate-700 transition flex items-center gap-1 cursor-pointer"
                      title="Preview Official Student ID Card"
                    >
                      <ShieldCheck className="w-3 h-3 text-amber-400" />
                      <span>ID Card</span>
                    </button>

                    {(currentRole === 'STUDENT' || currentRole === 'PARENT') && (
                      <button
                        type="button"
                        onClick={() => {
                          setActiveStudentId((item.rawItem as Student).id);
                          setIsOpen(false);
                        }}
                        className="px-2.5 py-1 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-[10px] font-semibold transition flex items-center gap-1 shadow-xs cursor-pointer"
                        title="Select Student for Current View"
                      >
                        <span>Select</span>
                        <ArrowRight className="w-3 h-3" />
                      </button>
                    )}
                  </>
                )}

                {item.type === 'TEACHER' && (
                  <>
                    {currentRole === 'TEACHER' ? (
                      <button
                        type="button"
                        onClick={() => {
                          setActiveTeacherId((item.rawItem as Teacher).id);
                          setIsOpen(false);
                        }}
                        className="px-2.5 py-1 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-[10px] font-semibold transition flex items-center gap-1 shadow-xs cursor-pointer"
                        title="Select Teacher Profile"
                      >
                        <span>Select Profile</span>
                        <ArrowRight className="w-3 h-3" />
                      </button>
                    ) : (
                      <span className="px-2 py-1 rounded-lg bg-slate-800 text-slate-300 text-[10px] border border-slate-700">
                        Faculty Record
                      </span>
                    )}
                  </>
                )}

                {item.type === 'INVOICE' && (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setIsOpen(false);
                      setSelectedInvoiceForReceipt(item.rawItem as Invoice);
                    }}
                    className="px-2.5 py-1 rounded-lg bg-emerald-950/80 hover:bg-emerald-900 text-emerald-300 hover:text-white text-[10px] font-medium border border-emerald-700 transition flex items-center gap-1 cursor-pointer"
                    title="View Official Receipt Voucher"
                  >
                    <Receipt className="w-3 h-3 text-emerald-400" />
                    <span>Official Receipt</span>
                  </button>
                )}

                {item.type === 'BANK' && (
                  <span className="px-2 py-1 rounded-lg bg-slate-800 text-amber-300 text-[10px] border border-slate-700">
                    Bank Record
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Footer info bar */}
      <div className="px-4 py-2 bg-slate-950/90 border-t border-slate-800 text-[10px] text-slate-400 flex items-center justify-between">
        <div className="flex items-center gap-2 font-medium">
          <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse inline-block" />
          <span>Institutional Global Search across all SIS Modules</span>
        </div>
        <span>Press <kbd className="px-1 py-0.5 bg-slate-800 rounded font-mono text-slate-300">Esc</kbd> to close</span>
      </div>
    </>
  );

  // Mobile trigger button rendering
  if (isMobileTrigger) {
    return (
      <div ref={containerRef}>
        <button
          id="btn-mobile-search-trigger"
          type="button"
          onClick={() => {
            setIsOpen(true);
            setTimeout(() => inputRef.current?.focus(), 80);
          }}
          className="p-2 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-blue-400 border border-slate-700/80 transition cursor-pointer"
          title="Global Search"
        >
          <Search className="w-4 h-4" />
        </button>

        {/* Full-screen mobile modal */}
        {isOpen && (
          <div className="fixed inset-0 z-50 flex items-start justify-center p-3 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-150">
            <div className="w-full max-w-lg bg-slate-900 text-white rounded-2xl shadow-2xl border border-slate-700 overflow-hidden flex flex-col mt-4">
              {/* Top Search Input row */}
              <div className="p-3 border-b border-slate-800 flex items-center gap-2">
                <Search className="w-4 h-4 text-blue-400 shrink-0 ml-1" />
                <input
                  ref={inputRef}
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  onKeyDown={handleKeyDownInInput}
                  placeholder="Search students, teachers, finance..."
                  className="w-full bg-transparent text-white placeholder-slate-400 text-sm outline-none"
                  autoFocus
                />
                {query && (
                  <button
                    type="button"
                    onClick={handleClear}
                    className="p-1 text-slate-400 hover:text-white"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  className="px-2 py-1 rounded bg-slate-800 text-slate-300 hover:text-white text-xs font-semibold shrink-0"
                >
                  Cancel
                </button>
              </div>

              {renderDropdownBody()}
            </div>
          </div>
        )}
      </div>
    );
  }

  // Standard Desktop Inline Search Bar rendering
  return (
    <div className="relative w-full max-w-md lg:max-w-lg" ref={containerRef}>
      {/* Search Input Field */}
      <div className="relative flex items-center">
        <div className="absolute left-3 pointer-events-none text-slate-400 flex items-center">
          <Search className="w-3.5 h-3.5 text-blue-400" />
        </div>

        <input
          id="global-institution-search-input"
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            if (!isOpen) setIsOpen(true);
          }}
          onFocus={() => setIsOpen(true)}
          onKeyDown={handleKeyDownInInput}
          placeholder="Search students, teachers, invoices, or accounts... (/)"
          className="w-full pl-8 pr-16 py-1.5 bg-slate-900/90 hover:bg-slate-900 focus:bg-slate-950 text-white placeholder-slate-400 rounded-xl border border-slate-700/80 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 text-xs transition duration-150 outline-none shadow-inner"
        />

        {/* Right side shortcut badge or Clear button */}
        <div className="absolute right-2.5 flex items-center gap-1">
          {query ? (
            <button
              type="button"
              onClick={handleClear}
              className="p-1 rounded-md text-slate-400 hover:text-white hover:bg-slate-800 transition cursor-pointer"
              title="Clear search"
            >
              <X className="w-3 h-3" />
            </button>
          ) : (
            <kbd className="hidden lg:inline-flex items-center gap-0.5 px-1.5 py-0.5 text-[9px] font-mono font-semibold text-slate-400 bg-slate-800 border border-slate-700 rounded select-none">
              <span>/</span>
            </kbd>
          )}
        </div>
      </div>

      {/* Popover Dropdown Results */}
      {isOpen && (
        <div
          id="global-search-results-dropdown"
          className="absolute left-0 sm:-left-12 md:left-0 right-0 sm:w-[540px] lg:w-[620px] mt-2 bg-slate-900/98 text-white rounded-2xl shadow-2xl border border-slate-700/90 overflow-hidden z-50 animate-in fade-in zoom-in-95 duration-150 backdrop-blur-md"
        >
          {renderDropdownBody()}
        </div>
      )}
    </div>
  );
};
