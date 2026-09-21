import React, { useState, useMemo, useEffect, useRef } from 'react';
import { useSchool } from '../../context/SchoolContext';
import { 
  Search, 
  Send, 
  Paperclip, 
  Smile, 
  CheckCheck, 
  FileText, 
  Eye, 
  User, 
  Phone, 
  GraduationCap, 
  ChevronLeft, 
  Sparkles, 
  X, 
  ShieldCheck, 
  Building, 
  Bot, 
  HelpCircle, 
  DollarSign, 
  BookOpen, 
  CheckCircle2, 
  School,
  Clock,
  UserCheck,
  MessageSquare
} from 'lucide-react';
import { generateReportCardPdf } from '../../utils/pdfGenerator';
import { UserRole } from '../../types';

interface TelegramInboxProps {
  mode?: 'TEACHER' | 'PARENT' | 'GENERAL';
  preselectedStudentId?: string;
}

interface ChatContact {
  id: string; // Unique channel or student ID
  channelId: string;
  name: string;
  subtitle: string;
  role: UserRole | 'BOT';
  category: 'TEACHER' | 'OFFICE' | 'PARENT' | 'BOT';
  phone?: string;
  officeHours?: string;
  studentId?: string;
  studentName?: string;
  gradeSection?: string;
  avatarGradient: string;
  initials: string;
}

export const TelegramInbox: React.FC<TelegramInboxProps> = ({ 
  mode = 'TEACHER',
  preselectedStudentId 
}) => {
  const { 
    students, 
    teachers, 
    chatMessages, 
    sendChatMessage, 
    markMessagesAsRead,
    currentTeacher,
    currentParentStudent,
    schoolName,
    invoices,
    grades,
    attendanceRecords,
    openDocumentViewer,
    institutionalUsers
  } = useSchool();

  // Current active scholar for parent mode
  const currentStudent = useMemo(() => {
    return currentParentStudent || 
      (preselectedStudentId ? students.find(s => s.id === preselectedStudentId) : null) || 
      students[0];
  }, [currentParentStudent, preselectedStudentId, students]);

  // Current teacher's assigned section
  const teacherHomeroomSection = currentTeacher?.assignedSectionId || '9A';

  // State: selected contact channel ID
  const [selectedContactId, setSelectedContactId] = useState<string>(() => {
    if (mode === 'PARENT') {
      return 'AI_SCHOOL_BOT';
    } else {
      // Default to first parent of teacher's students or AI bot
      const teacherStudent = students.find(s => s.sectionId === teacherHomeroomSection) || students[0];
      return teacherStudent ? `PARENT_${teacherStudent.id}` : 'AI_TEACHER_BOT';
    }
  });

  const [searchQuery, setSearchQuery] = useState('');
  const [activeTabFilter, setActiveTabFilter] = useState<string>('ALL');
  
  // Message input state
  const [inputText, setInputText] = useState('');
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [showQuickTemplates, setShowQuickTemplates] = useState(false);
  const [showAttachMenu, setShowAttachMenu] = useState(false);
  const [attachedFile, setAttachedFile] = useState<{ name: string; url: string; type?: 'PDF' | 'DOCUMENT' | 'IMAGE' } | null>(null);
  
  // Mobile responsive view toggle
  const [mobileShowChat, setMobileShowChat] = useState(false);
  const [showDossier, setShowDossier] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Define contacts list based on mode
  const contactsList: ChatContact[] = useMemo(() => {
    if (mode === 'PARENT') {
      // Parent talks with:
      // 1. 24/7 Smart School AI Assistant
      // 2. Kid's Teachers (Homeroom & Subject Teachers)
      // 3. Principal & Headmaster Office
      // 4. All Other Offices (Finance, Registrar, Academic Program, Guidance Counsellor)
      const principalUser = institutionalUsers.find(u => u.role === 'PRINCIPAL');
      const financeUser = institutionalUsers.find(u => u.role === 'FINANCE');
      const registrarUser = institutionalUsers.find(u => u.role === 'REGISTRAR');
      const programUser = institutionalUsers.find(u => u.role === 'PROGRAM_OFFICE');
      const counsellorUser = institutionalUsers.find(u => u.role === 'COUNSELLOR');

      const list: ChatContact[] = [
        {
          id: 'AI_SCHOOL_BOT',
          channelId: 'AI_SCHOOL_BOT',
          name: '🤖 Smart Academy Assistant',
          subtitle: 'Instant AI Support • Tuition, Grades, Schedules & Routing',
          role: 'BOT',
          category: 'BOT',
          officeHours: 'Always active (24/7 Instant Responses)',
          avatarGradient: 'from-sky-500 to-indigo-600',
          initials: '🤖',
          studentId: currentStudent?.id,
          studentName: currentStudent?.fullName,
          gradeSection: currentStudent ? `Grade ${currentStudent.grade} ${currentStudent.sectionId || ''}` : undefined
        },
      ];

      // Dynamic teacher channels
      teachers.forEach(t => {
        list.push({
          id: `TEACHER_${t.id}`,
          channelId: `TEACHER_${t.id}`,
          name: t.name,
          subtitle: `${t.subject} Faculty • Grade ${t.assignedSectionId || ''}`,
          role: 'TEACHER',
          category: 'TEACHER',
          phone: t.phone || '',
          officeHours: 'Mon-Fri 08:00 AM – 04:30 PM',
          avatarGradient: 'from-blue-600 to-indigo-700',
          initials: t.name.split(' ').map(n => n[0]).join('').slice(0, 2) || 'TC',
          studentId: currentStudent?.id,
          studentName: currentStudent?.fullName,
          gradeSection: currentStudent ? `Grade ${currentStudent.grade} ${currentStudent.sectionId || ''}` : undefined
        });
      });

      // Administration Offices
      list.push(
        {
          id: 'OFFICE_PRINCIPAL',
          channelId: 'OFFICE_PRINCIPAL',
          name: principalUser ? principalUser.name : 'Office of the Principal',
          subtitle: 'Executive Leadership & Headmaster Desk',
          role: 'PRINCIPAL',
          category: 'OFFICE',
          phone: principalUser?.email || '',
          officeHours: 'Tuesdays & Thursdays 02:00 PM – 04:30 PM',
          avatarGradient: 'from-amber-600 to-orange-700',
          initials: principalUser ? principalUser.name.split(' ').map(n => n[0]).join('').slice(0, 2) : 'PR',
          studentId: currentStudent?.id,
          studentName: currentStudent?.fullName,
          gradeSection: currentStudent ? `Grade ${currentStudent.grade} ${currentStudent.sectionId || ''}` : undefined
        },
        {
          id: 'OFFICE_FINANCE',
          channelId: 'OFFICE_FINANCE',
          name: financeUser ? financeUser.name : 'Finance & Bursar Office',
          subtitle: 'Tuition, Receipts, Invoicing & Bank Slips',
          role: 'FINANCE',
          category: 'OFFICE',
          phone: financeUser?.email || '',
          officeHours: 'Mon-Fri 08:30 AM – 05:00 PM',
          avatarGradient: 'from-emerald-600 to-teal-800',
          initials: financeUser ? financeUser.name.split(' ').map(n => n[0]).join('').slice(0, 2) : 'FN',
          studentId: currentStudent?.id,
          studentName: currentStudent?.fullName,
          gradeSection: currentStudent ? `Grade ${currentStudent.grade} ${currentStudent.sectionId || ''}` : undefined
        },
        {
          id: 'OFFICE_REGISTRAR',
          channelId: 'OFFICE_REGISTRAR',
          name: registrarUser ? registrarUser.name : 'Admissions & Registrar Office',
          subtitle: 'Student Admissions, Transcripts & Certification',
          role: 'REGISTRAR',
          category: 'OFFICE',
          phone: registrarUser?.email || '',
          officeHours: 'Mon-Fri 08:00 AM – 04:30 PM',
          avatarGradient: 'from-cyan-600 to-blue-700',
          initials: registrarUser ? registrarUser.name.split(' ').map(n => n[0]).join('').slice(0, 2) : 'RG',
          studentId: currentStudent?.id,
          studentName: currentStudent?.fullName,
          gradeSection: currentStudent ? `Grade ${currentStudent.grade} ${currentStudent.sectionId || ''}` : undefined
        },
        {
          id: 'OFFICE_PROGRAM_OFFICE',
          channelId: 'OFFICE_PROGRAM_OFFICE',
          name: programUser ? programUser.name : 'Academic Program Office',
          subtitle: 'Curriculum, Examination Timetables & Streams',
          role: 'PROGRAM_OFFICE',
          category: 'OFFICE',
          phone: programUser?.email || '',
          officeHours: 'Mon-Thu 09:00 AM – 04:00 PM',
          avatarGradient: 'from-pink-600 to-rose-700',
          initials: programUser ? programUser.name.split(' ').map(n => n[0]).join('').slice(0, 2) : 'PO',
          studentId: currentStudent?.id,
          studentName: currentStudent?.fullName,
          gradeSection: currentStudent ? `Grade ${currentStudent.grade} ${currentStudent.sectionId || ''}` : undefined
        },
        {
          id: 'OFFICE_COUNSELLOR',
          channelId: 'OFFICE_COUNSELLOR',
          name: counsellorUser ? counsellorUser.name : 'Guidance & Pastoral Care Office',
          subtitle: 'Confidential Student Welfare & Academic Guidance',
          role: 'COUNSELLOR',
          category: 'OFFICE',
          phone: counsellorUser?.email || '',
          officeHours: 'Daily 08:30 AM – 04:30 PM',
          avatarGradient: 'from-purple-600 to-indigo-800',
          initials: counsellorUser ? counsellorUser.name.split(' ').map(n => n[0]).join('').slice(0, 2) : 'CN',
          studentId: currentStudent?.id,
          studentName: currentStudent?.fullName,
          gradeSection: currentStudent ? `Grade ${currentStudent.grade} ${currentStudent.sectionId || ''}` : undefined
        }
      );
      return list;
    } else {
      // Teacher mode:
      // Teacher talks with PARENTS OF THEIR STUDENTS
      // Plus an AI Parent Communication Assistant Bot
      const list: ChatContact[] = [
        {
          id: 'AI_TEACHER_BOT',
          channelId: 'AI_TEACHER_BOT',
          name: '🤖 AI Parent Communication Assistant',
          subtitle: 'Auto-Draft Progress Praise, Attendance Alerts & Amharic Notes',
          role: 'BOT',
          category: 'BOT',
          officeHours: 'Always available to draft or polish messages to parents',
          avatarGradient: 'from-indigo-600 to-purple-700',
          initials: '🤖'
        }
      ];

      // Add parents of students (homeroom section prioritized)
      students.forEach(st => {
        const parentName = st.parents.fatherName || st.parents.motherName || `Parent of ${st.fullName}`;
        const phone = st.parents.fatherPhone || st.parents.motherPhone || '+251 91 123 4567';
        const isHomeroom = (st.sectionId === teacherHomeroomSection || st.sectionId === '9A');

        const parts = parentName.trim().split(' ');
        const initials = parts.length > 1 ? (parts[0][0] + parts[parts.length - 1][0]).toUpperCase() : parts[0].slice(0, 2).toUpperCase();

        list.push({
          id: `PARENT_${st.id}`,
          channelId: `PARENT_${st.id}`,
          name: parentName,
          subtitle: `Parent of ${st.fullName} (${st.id}) • Grade ${st.grade} ${st.sectionId || ''}`,
          role: 'PARENT',
          category: 'PARENT',
          phone,
          studentId: st.id,
          studentName: st.fullName,
          gradeSection: `Grade ${st.grade} ${st.sectionId || ''}`,
          avatarGradient: isHomeroom ? 'from-blue-500 to-indigo-600' : 'from-slate-600 to-slate-800',
          initials
        });
      });

      return list;
    }
  }, [mode, currentStudent, students, teacherHomeroomSection]);

  // Selected contact object
  const activeContact = useMemo(() => {
    return contactsList.find(c => c.id === selectedContactId) || contactsList[0];
  }, [contactsList, selectedContactId]);

  // Active student associated with contact (if any)
  const activeStudent = useMemo(() => {
    if (activeContact?.studentId) {
      return students.find(s => s.id === activeContact.studentId) || currentStudent;
    }
    return currentStudent;
  }, [activeContact, students, currentStudent]);

  // Messages for active contact channel
  const activeMessages = useMemo(() => {
    if (!activeContact) return [];
    
    return chatMessages.filter(m => {
      // Explicit channel match
      if (m.channelId && m.channelId === activeContact.channelId) {
        return true;
      }

      if (mode === 'PARENT') {
        if (activeContact.channelId === 'TEACHER_HOMEROOM') {
          return m.channelId === 'TEACHER_HOMEROOM' || (m.studentId === currentStudent?.id && m.recipientRole === 'TEACHER') || (m.studentId === currentStudent?.id && m.senderRole === 'TEACHER');
        }
        if (activeContact.role !== 'BOT' && activeContact.role !== 'PARENT') {
          return m.recipientRole === activeContact.role || m.senderRole === activeContact.role;
        }
        return m.channelId === activeContact.channelId;
      } else {
        // Teacher mode: check by studentId or channel
        if (activeContact.id === 'AI_TEACHER_BOT') {
          return m.channelId === 'AI_TEACHER_BOT';
        }
        return (m.channelId === activeContact.channelId) || (m.studentId === activeContact.studentId && (m.recipientRole === 'PARENT' || m.senderRole === 'PARENT'));
      }
    });
  }, [chatMessages, activeContact, mode, currentStudent]);

  // Auto mark as read
  useEffect(() => {
    if (activeContact) {
      markMessagesAsRead(activeContact.channelId);
      if (activeContact.studentId) {
        markMessagesAsRead(activeContact.studentId);
      }
    }
  }, [activeContact, markMessagesAsRead]);

  // Auto scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [activeMessages.length, selectedContactId]);

  // Calculate unread count for contact
  const getUnreadCount = (contact: ChatContact) => {
    return chatMessages.filter(m => {
      if (m.isRead) return false;
      if (m.channelId === contact.channelId) return true;
      if (mode === 'TEACHER' && contact.studentId && m.studentId === contact.studentId && m.senderRole === 'PARENT') return true;
      if (mode === 'PARENT' && m.senderRole === contact.role && m.studentId === currentStudent?.id) return true;
      return false;
    }).length;
  };

  // Filtered contacts list for left sidebar
  const filteredContacts = useMemo(() => {
    return contactsList.filter(contact => {
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch = !q || 
        contact.name.toLowerCase().includes(q) ||
        contact.subtitle.toLowerCase().includes(q) ||
        (contact.studentName && contact.studentName.toLowerCase().includes(q)) ||
        (contact.phone && contact.phone.toLowerCase().includes(q));

      if (!matchesSearch) return false;

      if (mode === 'PARENT') {
        if (activeTabFilter === 'TEACHERS') return contact.category === 'TEACHER';
        if (activeTabFilter === 'OFFICES') return contact.category === 'OFFICE';
        if (activeTabFilter === 'BOT') return contact.category === 'BOT';
      } else {
        if (activeTabFilter === 'HOMEROOM') {
          const st = students.find(s => s.id === contact.studentId);
          return (st?.sectionId === teacherHomeroomSection || st?.sectionId === '9A') || contact.category === 'BOT';
        }
        if (activeTabFilter === 'UNREAD') return getUnreadCount(contact) > 0;
        if (activeTabFilter === 'BOT') return contact.category === 'BOT';
      }

      return true;
    });
  }, [contactsList, searchQuery, activeTabFilter, mode, students, teacherHomeroomSection, chatMessages]);

  // Quick Reply Templates based on contact type
  const quickReplies = useMemo(() => {
    if (mode === 'PARENT') {
      if (activeContact?.category === 'BOT') {
        return [
          { label: '💰 Tuition & Balance', text: `Can you check the current tuition balance and payment deadline for ${currentStudent?.fullName}?` },
          { label: '📊 Latest Exam Scores', text: `What are the latest assessment scores and GPA recorded for ${currentStudent?.fullName}?` },
          { label: '🔔 Attendance Rate', text: `Could you provide ${currentStudent?.fullName}'s attendance record and any absence marks?` },
          { label: '📅 Exam Timetable', text: `When are the upcoming mid-term examinations scheduled for Grade ${currentStudent?.grade}?` },
          { label: '📝 Stream Change Window', text: `What is the deadline and procedure for requesting a stream change (Natural vs Social)?` },
          { label: '🆔 Lost Student ID', text: `How can we report a lost ID card and obtain a cleared replacement?` }
        ];
      }
      if (activeContact?.category === 'OFFICE' && activeContact.role === 'FINANCE') {
        return [
          { label: '💳 Check Payment Status', text: `Good day, could you please verify if our bank deposit slip for tuition payment has been reconciled?` },
          { label: '🧾 Request Stamped Receipt', text: `Greetings, we submitted our deposit slip. Could you confirm when the official stamped receipt will be generated?` },
          { label: '🏦 Payment Installment Plan', text: `We would like to inquire about setting up a structured installment plan for second term tuition.` }
        ];
      }
      if (activeContact?.category === 'OFFICE' && activeContact.role === 'PRINCIPAL') {
        return [
          { label: '📅 Request Consultation', text: `Honorable Principal, we would appreciate requesting a brief consultation during office hours regarding our scholar's academic pathway.` },
          { label: '📜 Institutional Policy Inquiry', text: `Greetings Headmaster, we would like clarification regarding the school's high-honor scholarship guidelines.` }
        ];
      }
      if (activeContact?.category === 'OFFICE' && activeContact.role === 'REGISTRAR') {
        return [
          { label: '📜 Official Transcript Request', text: `Good day, we require an officially sealed academic transcript copy for foreign transfer evaluation.` },
          { label: '📄 Enrollment Verification', text: `Greetings, could you prepare an official Letter of Enrollment stating ${currentStudent?.fullName || 'our scholar'} is currently enrolled in Grade ${currentStudent?.grade || 'our current level'}?` }
        ];
      }
      if (activeContact?.category === 'OFFICE' && activeContact.role === 'PROGRAM_OFFICE') {
        return [
          { label: '🔬 Stream Placement Query', text: `Good day, we would like to confirm our scholar's placement in the Natural vs. Social Science stream for this semester.` },
          { label: '⏰ Class Timetable Copy', text: `Could you kindly share the updated laboratory and tutorial schedule for Grade ${currentStudent?.grade || 'our level'}?` }
        ];
      }
      if (activeContact?.category === 'OFFICE' && activeContact.role === 'COUNSELLOR') {
        return [
          { label: '🤝 Request Guidance Meeting', text: `Greetings, we would like to arrange a confidential session to discuss study habits and focus support for ${currentStudent?.fullName || 'our scholar'}.` }
        ];
      }
      // Teachers
      return [
        { label: '📈 Academic Progress Update', text: `Good day teacher, could you kindly provide a brief update regarding ${currentStudent?.fullName}'s recent class engagement and quiz performance?` },
        { label: '🏥 Medical Leave Excuse', text: `Greetings, ${currentStudent?.fullName} is feeling unwell today and undergoing medical review. Please excuse today's absence.` },
        { label: '📚 Homework Clarification', text: `Could you please clarify the homework requirements and notebook submission deadline for tomorrow?` },
        { label: '🤝 Parent Consultation', text: `We would appreciate scheduling a brief 10-minute consultation regarding our scholar’s semester progress when convenient.` }
      ];
    } else {
      // TEACHER MODE
      if (activeContact?.id === 'AI_TEACHER_BOT') {
        return [
          { label: '⭐ Draft Praise Note', text: `Draft an encouraging academic commendation praising active class participation and problem-solving excellence.` },
          { label: '📊 Draft Progress Report', text: `Draft a concise progress summary for parents detailing strong test scores and upcoming exam preparation.` },
          { label: '🔔 Draft Attendance Alert', text: `Draft a polite but firm notice to parents informing them of morning tardiness or unexcused roll-call absence.` },
          { label: '📅 Conference Invitation', text: `Draft a warm invitation for a 15-minute parent-teacher conference to align on academic goals.` },
          { label: '🇪🇹 Translate to Amharic', text: `Please translate the following progress note into formal, polite Amharic for the parents.` }
        ];
      }
      return [
        { label: '📊 Test Score Report', text: `Greetings. ${activeStudent?.fullName} scored high marks on the latest classroom assessment. Diligence and active class engagement continue to show strong results.` },
        { label: '⭐ Academic Praise', text: `I am delighted to commend ${activeStudent?.fullName} for exemplary focus, active participation, and positive collaboration in homeroom today.` },
        { label: '🔔 Attendance Alert', text: `Please note that ${activeStudent?.fullName} was marked absent or late during the morning roll-call. Kindly follow up with the administration.` },
        { label: '📅 Parent Consultation', text: `We would like to invite you for a 10-minute academic progress consultation this Thursday afternoon to discuss academic goals.` },
        { label: '📝 Assignment Due', text: `A reminder that the semester coursework assignment is due tomorrow morning. Please ensure the student brings their completed notebook.` }
      ];
    }
  }, [mode, activeContact, currentStudent, activeStudent]);

  const emojiPalette = ['👍', '👏', '📚', '💯', '⭐', '📝', '🔔', '🙏', '🎓', '✅', '❤️', '💡', '🏆', '🙌'];

  // Handle Send Message
  const handleSendMessage = (textToSend?: string) => {
    const text = (textToSend || inputText).trim();
    if (!text && !attachedFile) return;

    if (mode === 'PARENT') {
      const recipientRole = activeContact.role === 'BOT' ? 'REGISTRAR' : activeContact.role;
      sendChatMessage(
        recipientRole as UserRole,
        activeContact.name,
        text || (attachedFile ? `Attached: ${attachedFile.name}` : ''),
        currentStudent?.id,
        attachedFile?.name,
        attachedFile?.url,
        attachedFile?.type,
        activeContact.channelId
      );
    } else {
      // TEACHER MODE
      if (activeContact.id === 'AI_TEACHER_BOT') {
        // Teacher chatting with AI assistant
        sendChatMessage(
          'REGISTRAR',
          'AI Parent Communication Assistant',
          text,
          activeStudent?.id,
          undefined,
          undefined,
          undefined,
          'AI_TEACHER_BOT'
        );

        // Immediate bot draft response for the teacher
        setTimeout(() => {
          let botDraft = '';
          const lower = text.toLowerCase();
          if (lower.includes('praise') || lower.includes('commend') || lower.includes('great')) {
            botDraft = `Here is an academic praise draft for parents:\n\n"Dear Parent, I am pleased to share that your scholar demonstrated exemplary leadership and analytical focus in class today, contributing thoughtfully to group discussions. Thank you for your continued support at home!"`;
          } else if (lower.includes('attendance') || lower.includes('late') || lower.includes('absent')) {
            botDraft = `Here is an attendance alert draft for parents:\n\n"Dear Parent, This is a courteous notice that your scholar was marked late during today's morning roll-call (08:00 AM). Regular punctuality is vital for academic continuity. Kindly ensure timely arrival tomorrow."`;
          } else if (lower.includes('conference') || lower.includes('meeting') || lower.includes('consult')) {
            botDraft = `Here is a parent-teacher meeting invitation draft:\n\n"Dear Parent, We would like to invite you to our upcoming academic progress consultation this Thursday at 03:30 PM to review mid-term targets and celebrate milestones. Please let us know if this time suits you."`;
          } else if (lower.includes('amharic') || lower.includes('translate')) {
            botDraft = `Here is the Amharic translation draft:\n\n"የተከበሩ ወላጅ፡ ተማሪዎ በትምህርት ክፍለ ጊዜ ንቁ ተሳትፎ እና ከፍተኛ የትምህርት ጥረት እያሳየ/ች ይገኛል። ለምታደርጉላቸው የቅርብ ክትትል እና ድጋፍ ከልብ እናመሰግናለን።"`;
          } else {
            botDraft = `Here is a drafted parent update message:\n\n"Greetings. I am writing to provide an academic update regarding classwork completion and preparation for next week's assessments. Please review the attached study guidelines and feel free to reach out with any questions."`;
          }

          sendChatMessage(
            'TEACHER',
            '🤖 AI Parent Assistant',
            botDraft,
            activeStudent?.id,
            undefined,
            undefined,
            undefined,
            'AI_TEACHER_BOT'
          );
        }, 500);
      } else {
        // Teacher sending directly to parent
        sendChatMessage(
          'PARENT',
          activeContact.name,
          text || (attachedFile ? `Attached: ${attachedFile.name}` : ''),
          activeContact.studentId || activeStudent?.id,
          attachedFile?.name,
          attachedFile?.url,
          attachedFile?.type,
          activeContact.channelId
        );
      }
    }

    setInputText('');
    setAttachedFile(null);
    setShowEmojiPicker(false);
    setShowQuickTemplates(false);
    setShowAttachMenu(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  // Generate & attach Report Card PDF
  const handleAttachReportCard = () => {
    const studentToReport = activeStudent || currentStudent;
    if (!studentToReport) return;

    const reportPdf = generateReportCardPdf({
      studentName: studentToReport.fullName,
      studentId: studentToReport.id,
      grade: studentToReport.grade,
      schoolName: schoolName || 'Academy of Excellence',
      grades: grades.filter(g => g.studentId === studentToReport.id).length > 0 
        ? grades.filter(g => g.studentId === studentToReport.id).map(g => ({
            subject: g.subject,
            teacherName: teachers.find(t => t.id === g.teacherId)?.name || 'Faculty Member',
            quiz: g.quiz,
            test1Score: g.test1Score,
            assessment: g.assessment,
            midExam: g.midExam,
            finalExam: g.finalExam,
            total: g.total,
            letterGrade: g.letterGrade
          }))
        : [
            { subject: 'Mathematics / Algebra', teacherName: teachers[0]?.name || 'Department Faculty', quiz: 19, test1Score: 23, assessment: 18, midExam: 27, finalExam: 36, total: 94, letterGrade: 'A+' },
            { subject: 'English & Literature', teacherName: teachers[1]?.name || 'Department Faculty', quiz: 18, test1Score: 22, assessment: 19, midExam: 25, finalExam: 34, total: 91, letterGrade: 'A' },
            { subject: 'General Science / Physics', teacherName: teachers[2]?.name || 'Department Faculty', quiz: 17, test1Score: 21, assessment: 17, midExam: 24, finalExam: 33, total: 86, letterGrade: 'A' },
          ]
    });

    setAttachedFile({
      name: `${studentToReport.fullName.replace(/\s+/g, '_')}_Official_Report_Card.pdf`,
      url: reportPdf,
      type: 'PDF'
    });
    setShowAttachMenu(false);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      setAttachedFile({
        name: file.name,
        url: event.target?.result as string,
        type: file.type.includes('image') ? 'IMAGE' : 'PDF'
      });
    };
    reader.readAsDataURL(file);
    setShowAttachMenu(false);
  };

  return (
    <div className="w-full bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden flex flex-col h-[740px] font-sans antialiased">
      
      {/* 1. TOP TELEGRAM APP HEADER */}
      <div className="bg-[#2481cc] text-white px-5 py-3 flex items-center justify-between shadow-md select-none shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-white/20 flex items-center justify-center backdrop-blur-xs shadow-inner">
            <Send className="w-5 h-5 text-white transform -rotate-12 translate-x-[-1px] translate-y-[1px]" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="font-bold text-sm tracking-wide text-white">
                {mode === 'PARENT' ? 'Parent Telegram Portal' : 'Faculty Telegram Messenger'}
              </h2>
              <span className="px-2 py-0.5 rounded-full bg-white/20 text-[10px] font-semibold text-white/90">
                {mode === 'PARENT' ? 'Teachers, Principal & All Offices' : 'Parents of Your Students'}
              </span>
            </div>
            <p className="text-[11px] text-sky-100 flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-300" />
              {mode === 'PARENT' 
                ? `Direct Contact for Scholar: ${currentStudent?.fullName} (${currentStudent?.id})` 
                : `Active Section: Grade ${teacherHomeroomSection} Homeroom • Parent Communication Hub`}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="hidden sm:flex items-center gap-2 bg-white/10 px-3 py-1.5 rounded-xl text-xs backdrop-blur-xs">
            <span className="text-white/70">Logged In:</span>
            <span className="font-bold text-white">
              {mode === 'TEACHER' 
                ? (currentTeacher ? `${currentTeacher.name} (Faculty)` : 'Faculty Member') 
                : `${currentStudent?.parents?.fatherName || currentStudent?.parents?.motherName || 'Parent / Guardian'}`}
            </span>
          </div>

          <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-emerald-500/30 text-emerald-100 rounded-full text-[11px] font-medium border border-emerald-400/40">
            <span className="w-2 h-2 rounded-full bg-emerald-300 animate-pulse" />
            Online & Synced
          </span>
        </div>
      </div>

      {/* 2. SPLIT VIEW CONTAINER */}
      <div className="flex-1 flex overflow-hidden relative">
        
        {/* === LEFT SIDEBAR: CONTACTS & CHAT THREADS === */}
        <div className={`w-full md:w-80 lg:w-96 border-r border-slate-200 bg-slate-50/70 flex flex-col shrink-0 ${
          mobileShowChat ? 'hidden md:flex' : 'flex'
        }`}>
          {/* Search bar */}
          <div className="p-3 border-b border-slate-200 bg-white">
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5 pointer-events-none" />
              <input
                type="text"
                placeholder={mode === 'PARENT' ? "Search teachers, offices, principal..." : "Search parents of your students..."}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-8 py-1.5 bg-slate-100 hover:bg-slate-200/70 focus:bg-white text-xs text-slate-800 placeholder-slate-400 rounded-xl outline-none focus:ring-2 focus:ring-[#2481cc]/40 transition border border-transparent focus:border-[#2481cc]"
              />
              {searchQuery && (
                <button 
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2.5 top-2 text-slate-400 hover:text-slate-600 text-xs"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Filter tabs */}
            <div className="flex items-center gap-1 mt-2.5 pt-1 overflow-x-auto no-scrollbar">
              {mode === 'PARENT' ? (
                <>
                  <button
                    onClick={() => setActiveTabFilter('ALL')}
                    className={`px-2.5 py-1 text-center rounded-lg text-xs font-semibold whitespace-nowrap transition ${
                      activeTabFilter === 'ALL'
                        ? 'bg-[#2481cc] text-white shadow-xs'
                        : 'text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    All ({contactsList.length})
                  </button>
                  <button
                    onClick={() => setActiveTabFilter('TEACHERS')}
                    className={`px-2.5 py-1 text-center rounded-lg text-xs font-semibold whitespace-nowrap transition ${
                      activeTabFilter === 'TEACHERS'
                        ? 'bg-[#2481cc] text-white shadow-xs'
                        : 'text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    Teachers
                  </button>
                  <button
                    onClick={() => setActiveTabFilter('OFFICES')}
                    className={`px-2.5 py-1 text-center rounded-lg text-xs font-semibold whitespace-nowrap transition ${
                      activeTabFilter === 'OFFICES'
                        ? 'bg-[#2481cc] text-white shadow-xs'
                        : 'text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    Offices & Principal
                  </button>
                  <button
                    onClick={() => setActiveTabFilter('BOT')}
                    className={`px-2.5 py-1 text-center rounded-lg text-xs font-semibold whitespace-nowrap transition flex items-center gap-1 ${
                      activeTabFilter === 'BOT'
                        ? 'bg-[#2481cc] text-white shadow-xs'
                        : 'text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    <Bot className="w-3 h-3 text-sky-500" />
                    AI Bot
                  </button>
                </>
              ) : (
                <>
                  <button
                    onClick={() => setActiveTabFilter('ALL')}
                    className={`px-2.5 py-1 text-center rounded-lg text-xs font-semibold whitespace-nowrap transition ${
                      activeTabFilter === 'ALL'
                        ? 'bg-[#2481cc] text-white shadow-xs'
                        : 'text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    All Parents ({contactsList.filter(c => c.category === 'PARENT').length})
                  </button>
                  <button
                    onClick={() => setActiveTabFilter('HOMEROOM')}
                    className={`px-2.5 py-1 text-center rounded-lg text-xs font-semibold whitespace-nowrap transition ${
                      activeTabFilter === 'HOMEROOM'
                        ? 'bg-[#2481cc] text-white shadow-xs'
                        : 'text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    Sec {teacherHomeroomSection} Parents
                  </button>
                  <button
                    onClick={() => setActiveTabFilter('UNREAD')}
                    className={`px-2.5 py-1 text-center rounded-lg text-xs font-semibold whitespace-nowrap transition flex items-center gap-1 ${
                      activeTabFilter === 'UNREAD'
                        ? 'bg-[#2481cc] text-white shadow-xs'
                        : 'text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    Unread
                  </button>
                  <button
                    onClick={() => setActiveTabFilter('BOT')}
                    className={`px-2.5 py-1 text-center rounded-lg text-xs font-semibold whitespace-nowrap transition flex items-center gap-1 ${
                      activeTabFilter === 'BOT'
                        ? 'bg-[#2481cc] text-white shadow-xs'
                        : 'text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    <Bot className="w-3 h-3 text-indigo-500" />
                    AI Drafter
                  </button>
                </>
              )}
            </div>
          </div>

          {/* Conversations Thread List */}
          <div className="flex-1 overflow-y-auto divide-y divide-slate-100">
            {filteredContacts.length === 0 ? (
              <div className="p-8 text-center text-slate-400 text-xs space-y-2">
                <MessageSquare className="w-8 h-8 text-slate-300 mx-auto" />
                <p>No chat contacts match your search filter.</p>
              </div>
            ) : (
              filteredContacts.map((contact) => {
                const isSelected = contact.id === selectedContactId;
                const unread = getUnreadCount(contact);

                return (
                  <div
                    key={contact.id}
                    onClick={() => {
                      setSelectedContactId(contact.id);
                      setMobileShowChat(true);
                      setShowDossier(false);
                    }}
                    className={`p-3 cursor-pointer transition-all flex items-center gap-3 relative ${
                      isSelected
                        ? 'bg-[#3390ec] text-white shadow-xs'
                        : 'hover:bg-slate-100/80 text-slate-800'
                    }`}
                  >
                    {/* Avatar with online indicator */}
                    <div className="relative shrink-0">
                      <div className={`w-11 h-11 rounded-full bg-gradient-to-tr ${contact.avatarGradient} flex items-center justify-center text-white font-bold text-sm shadow-xs`}>
                        {contact.category === 'BOT' ? (
                          <Bot className="w-5 h-5 text-white" />
                        ) : (
                          contact.initials
                        )}
                      </div>
                      <span className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-white ${
                        contact.category === 'BOT' ? 'bg-sky-400' : 'bg-emerald-500'
                      }`} />
                    </div>

                    {/* Chat summary details */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-1 mb-0.5">
                        <h4 className={`text-xs font-bold truncate flex items-center gap-1 ${isSelected ? 'text-white' : 'text-slate-900'}`}>
                          {contact.name}
                          {contact.category === 'OFFICE' && (
                            <Building className={`w-3 h-3 ${isSelected ? 'text-white/80' : 'text-slate-400'}`} />
                          )}
                          {contact.category === 'TEACHER' && (
                            <School className={`w-3 h-3 ${isSelected ? 'text-white/80' : 'text-blue-400'}`} />
                          )}
                        </h4>
                      </div>

                      <p className={`text-[11px] truncate mb-0.5 ${isSelected ? 'text-white/90 font-medium' : 'text-slate-500'}`}>
                        {contact.subtitle}
                      </p>

                      {contact.phone && (
                        <span className={`text-[10px] flex items-center gap-1 ${isSelected ? 'text-white/70' : 'text-slate-400'}`}>
                          <Phone className="w-2.5 h-2.5" />
                          {contact.phone}
                        </span>
                      )}
                    </div>

                    {/* Unread badge */}
                    {unread > 0 && (
                      <span className="shrink-0 min-w-5 h-5 px-1.5 bg-[#2481cc] text-white text-[10px] font-bold rounded-full flex items-center justify-center shadow-xs">
                        {unread}
                      </span>
                    )}
                  </div>
                );
              })
            )}
          </div>

          {/* Bottom left info bar */}
          <div className="p-2.5 bg-slate-100 border-t border-slate-200 text-[11px] text-slate-500 flex items-center justify-between">
            <span>
              {mode === 'PARENT' ? 'Direct SIS Office Links' : `Parents Enrolled: ${students.length}`}
            </span>
            <span className="text-[#2481cc] font-semibold flex items-center gap-1">
              <ShieldCheck className="w-3 h-3" />
              Verified Telegram SIS
            </span>
          </div>
        </div>

        {/* === RIGHT COLUMN: ACTIVE CONVERSATION CANVAS === */}
        <div className={`flex-1 flex flex-col bg-[#eef2f5] overflow-hidden ${
          !mobileShowChat ? 'hidden md:flex' : 'flex'
        }`}>
          {activeContact ? (
            <>
              {/* Active Chat Telegram Header */}
              <div className="bg-white border-b border-slate-200 px-4 py-2.5 flex items-center justify-between shadow-xs z-10 shrink-0">
                <div className="flex items-center gap-3 min-w-0">
                  {/* Mobile Back button */}
                  <button
                    onClick={() => setMobileShowChat(false)}
                    className="md:hidden p-1.5 -ml-1 text-slate-600 hover:bg-slate-100 rounded-full transition"
                    title="Back to contact list"
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </button>

                  {/* Contact Avatar */}
                  <div className="relative shrink-0">
                    <div className={`w-10 h-10 rounded-full bg-gradient-to-tr ${activeContact.avatarGradient} flex items-center justify-center text-white font-bold text-sm shadow-xs`}>
                      {activeContact.category === 'BOT' ? (
                        <Bot className="w-5 h-5 text-white" />
                      ) : (
                        activeContact.initials
                      )}
                    </div>
                    <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-500 border-2 border-white rounded-full" />
                  </div>

                  {/* Contact Name & Status */}
                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5">
                      <h3 className="text-sm font-bold text-slate-900 truncate">
                        {activeContact.name}
                      </h3>
                      <span className="text-[10px] text-emerald-600 font-semibold flex items-center gap-1 bg-emerald-50 px-1.5 py-0.5 rounded-full border border-emerald-200">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                        online
                      </span>
                    </div>
                    
                    <p className="text-[11px] text-slate-500 truncate">
                      {activeContact.subtitle}
                    </p>
                  </div>
                </div>

                {/* Right Top Header Actions */}
                <div className="flex items-center gap-1.5 shrink-0">
                  {/* Quick Pre-fills toggle */}
                  <button
                    onClick={() => setShowQuickTemplates(!showQuickTemplates)}
                    className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition border ${
                      showQuickTemplates
                        ? 'bg-blue-50 text-[#2481cc] border-blue-200 shadow-xs'
                        : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200'
                    }`}
                    title="Quick Topic Replies"
                  >
                    <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                    <span className="hidden sm:inline">Templates</span>
                  </button>

                  {/* Dossier / Contact Info button */}
                  <button
                    onClick={() => setShowDossier(!showDossier)}
                    className={`p-1.5 rounded-lg transition border ${
                      showDossier 
                        ? 'bg-blue-50 text-[#2481cc] border-blue-200' 
                        : 'hover:bg-slate-100 text-slate-600 border-slate-200'
                    }`}
                    title="Details & Office Information"
                  >
                    <User className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Dossier / Office Profile Popover */}
              {showDossier && (
                <div className="bg-white border-b border-slate-200 p-4 text-xs shadow-md animate-in slide-in-from-top-2 duration-150 z-20">
                  <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                    <span className="font-bold text-slate-800 text-xs uppercase tracking-wider flex items-center gap-1.5">
                      <GraduationCap className="w-4 h-4 text-blue-600" />
                      {mode === 'PARENT' ? 'Contact Details & Office Information' : 'Scholar Profile & Parent Dossier'}
                    </span>
                    <button 
                      onClick={() => setShowDossier(false)}
                      className="text-slate-400 hover:text-slate-600 text-xs"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-3">
                    <div className="p-2.5 bg-slate-50 rounded-xl">
                      <span className="text-[10px] text-slate-400 block font-semibold">
                        {mode === 'PARENT' ? 'Recipient Entity' : 'Parent Contact'}
                      </span>
                      <strong className="text-slate-800">{activeContact.name}</strong>
                    </div>
                    <div className="p-2.5 bg-slate-50 rounded-xl">
                      <span className="text-[10px] text-slate-400 block font-semibold">
                        {mode === 'PARENT' ? 'Office / Duty Hours' : 'Scholar Full Name'}
                      </span>
                      <strong className="text-slate-800">
                        {mode === 'PARENT' ? (activeContact.officeHours || 'Normal Academy Hours') : activeStudent?.fullName}
                      </strong>
                    </div>
                    <div className="p-2.5 bg-slate-50 rounded-xl">
                      <span className="text-[10px] text-slate-400 block font-semibold">
                        Direct Phone / Hotline
                      </span>
                      <strong className="text-blue-700 flex items-center gap-1">
                        <Phone className="w-3 h-3 text-blue-500" />
                        {activeContact.phone || '+251 11 123 4567'}
                      </strong>
                    </div>
                    <div className="p-2.5 bg-slate-50 rounded-xl">
                      <span className="text-[10px] text-slate-400 block font-semibold">
                        Associated Scholar
                      </span>
                      <strong className="text-slate-800">
                        {activeStudent?.fullName} ({activeStudent?.id})
                      </strong>
                    </div>
                  </div>
                </div>
              )}

              {/* Quick Template Drawer */}
              {showQuickTemplates && (
                <div className="bg-sky-50/90 border-b border-sky-200 p-3 shadow-xs z-10">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[11px] font-bold text-sky-900 flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                      Suggested Inquiries for {activeContact.name}:
                    </span>
                    <button 
                      onClick={() => setShowQuickTemplates(false)}
                      className="text-sky-700 hover:text-sky-900"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {quickReplies.map((qr, idx) => (
                      <button
                        key={idx}
                        onClick={() => {
                          setInputText(qr.text);
                          setShowQuickTemplates(false);
                        }}
                        className="px-3 py-1.5 bg-white hover:bg-sky-100 text-sky-900 rounded-xl text-xs font-semibold border border-sky-200 shadow-xs transition hover:scale-105 active:scale-95 text-left"
                      >
                        {qr.label}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* 3. TELEGRAM MESSAGES CANVAS */}
              <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-[#eef2f5] select-text">
                {/* Date separator pill */}
                <div className="flex justify-center my-2">
                  <span className="px-3 py-1 bg-slate-200/90 text-slate-600 rounded-full text-[11px] font-semibold shadow-xs">
                    {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                  </span>
                </div>

                {activeMessages.length === 0 ? (
                  <div className="py-16 text-center text-slate-400 text-xs space-y-3">
                    <div className="w-12 h-12 rounded-full bg-white flex items-center justify-center mx-auto text-[#2481cc] shadow-xs">
                      {activeContact.category === 'BOT' ? (
                        <Bot className="w-6 h-6" />
                      ) : (
                        <Send className="w-6 h-6 transform -rotate-12" />
                      )}
                    </div>
                    <p className="font-semibold text-slate-700 text-sm">
                      {activeContact.category === 'BOT' 
                        ? 'Ask the Oskar SIS Assistant Anything'
                        : `No messages yet with ${activeContact.name}`}
                    </p>
                    <p className="text-[11px] max-w-sm mx-auto text-slate-500">
                      {activeContact.category === 'BOT'
                        ? 'Inquire about tuition fees, exam scores, attendance, stream placements, or office procedures.'
                        : `Send a direct message, question, or document regarding ${activeStudent?.fullName || 'the scholar'}.`}
                    </p>

                    {/* Quick Start Buttons for Empty Chat */}
                    <div className="flex flex-wrap justify-center gap-2 pt-2 max-w-md mx-auto">
                      {quickReplies.slice(0, 3).map((qr, idx) => (
                        <button
                          key={idx}
                          onClick={() => handleSendMessage(qr.text)}
                          className="px-3 py-1.5 bg-white hover:bg-sky-50 text-[#2481cc] rounded-xl text-xs font-semibold border border-sky-200 shadow-xs transition hover:scale-105"
                        >
                          {qr.label}
                        </button>
                      ))}
                    </div>
                  </div>
                ) : (
                  activeMessages.map((msg) => {
                    const isOutgoing = (mode === 'TEACHER' && msg.senderRole === 'TEACHER') || (mode === 'PARENT' && msg.senderRole === 'PARENT');

                    return (
                      <div
                        key={msg.id}
                        className={`flex flex-col ${isOutgoing ? 'items-end' : 'items-start'}`}
                      >
                        {/* Telegram Message Bubble */}
                        <div
                          className={`relative max-w-[85%] sm:max-w-[72%] p-3 shadow-xs rounded-2xl text-xs transition-all ${
                            isOutgoing
                              ? 'bg-[#effedd] text-slate-900 rounded-tr-xs border border-[#d5f1b5]'
                              : 'bg-white text-slate-800 rounded-tl-xs border border-slate-200/80'
                          }`}
                        >
                          {/* Sender name on incoming message */}
                          {!isOutgoing && (
                            <div className="font-bold text-[#2481cc] text-[11px] mb-1 flex items-center gap-1">
                              {msg.senderName.includes('Bot') || msg.senderName.includes('Assistant') ? (
                                <Bot className="w-3 h-3 text-sky-600" />
                              ) : null}
                              {msg.senderName}
                            </div>
                          )}

                          {/* Message Text */}
                          <div className="text-slate-800 whitespace-pre-wrap leading-relaxed">
                            {msg.text}
                          </div>

                          {/* Attached Document Card */}
                          {msg.attachmentName && (
                            <div className="mt-2 p-2.5 bg-black/5 rounded-xl border border-black/10 flex items-center justify-between gap-3">
                              <div className="flex items-center gap-2 min-w-0">
                                <div className="w-8 h-8 rounded-lg bg-red-100 text-red-600 flex items-center justify-center shrink-0">
                                  <FileText className="w-4 h-4" />
                                </div>
                                <div className="min-w-0">
                                  <p className="font-bold text-slate-800 truncate text-[11px]">
                                    {msg.attachmentName}
                                  </p>
                                  <span className="text-[10px] text-slate-500">Official SIS Document • PDF</span>
                                </div>
                              </div>

                              <button
                                onClick={() => {
                                  openDocumentViewer({
                                    title: 'Attached Telegram Document',
                                    subtitle: `Document attachment for ${activeStudent?.fullName || 'Student'}`,
                                    docName: msg.attachmentName || 'Telegram_Document.pdf',
                                    docUrl: msg.attachmentUrl,
                                    category: 'GENERAL',
                                    metadata: {
                                      studentName: activeStudent?.fullName,
                                      studentId: activeStudent?.id,
                                      sender: msg.senderName,
                                      timestamp: msg.timestamp
                                    }
                                  });
                                }}
                                className="px-2 py-1 bg-white hover:bg-slate-100 text-[#2481cc] font-bold rounded text-[10px] border border-slate-200 flex items-center gap-1 shadow-xs transition shrink-0"
                              >
                                <Eye className="w-3 h-3" />
                                View PDF
                              </button>
                            </div>
                          )}

                          {/* Telegram Timestamp & Double Checkmarks */}
                          <div className="flex items-center justify-end gap-1 mt-1 text-[10px] text-slate-400 select-none">
                            <span>{msg.timestamp}</span>
                            {isOutgoing && (
                              <CheckCheck className="w-3.5 h-3.5 text-[#2481cc]" />
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Attachment Preview Pill */}
              {attachedFile && (
                <div className="px-4 py-2 bg-blue-50 border-t border-blue-200 flex items-center justify-between text-xs text-blue-900">
                  <div className="flex items-center gap-2 truncate">
                    <FileText className="w-4 h-4 text-blue-600 shrink-0" />
                    <span className="font-bold truncate">Attached: {attachedFile.name}</span>
                  </div>
                  <button
                    onClick={() => setAttachedFile(null)}
                    className="p-1 text-blue-600 hover:text-red-600 transition"
                    title="Remove attachment"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              )}

              {/* Emoji Picker Popover */}
              {showEmojiPicker && (
                <div className="p-3 bg-white border-t border-slate-200 shadow-sm flex flex-wrap gap-2 text-lg animate-in fade-in duration-100">
                  {emojiPalette.map((emo, idx) => (
                    <button
                      key={idx}
                      onClick={() => {
                        setInputText(prev => prev + emo);
                        setShowEmojiPicker(false);
                      }}
                      className="w-8 h-8 rounded-lg hover:bg-slate-100 flex items-center justify-center transition hover:scale-110 active:scale-95"
                    >
                      {emo}
                    </button>
                  ))}
                </div>
              )}

              {/* Attachment Menu Popover */}
              {showAttachMenu && (
                <div className="p-3 bg-white border-t border-slate-200 shadow-sm flex items-center gap-2 text-xs animate-in fade-in duration-100">
                  <span className="text-[11px] font-bold text-slate-600 mr-2">Attach Document:</span>
                  <button
                    onClick={handleAttachReportCard}
                    className="px-3 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-800 rounded-xl font-bold flex items-center gap-1.5 border border-blue-200 transition"
                  >
                    <FileText className="w-3.5 h-3.5 text-blue-600" />
                    Official Report Card (PDF)
                  </button>

                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold flex items-center gap-1.5 border border-slate-300 transition"
                  >
                    <Paperclip className="w-3.5 h-3.5 text-slate-600" />
                    Upload File from Device...
                  </button>

                  <input 
                    type="file" 
                    ref={fileInputRef} 
                    onChange={handleFileUpload} 
                    accept=".pdf,.png,.jpg,.jpeg" 
                    className="hidden" 
                  />
                </div>
              )}

              {/* 4. TELEGRAM MESSAGE COMPOSER BAR */}
              <div className="bg-white border-t border-slate-200 p-3 flex items-center gap-2 shrink-0">
                {/* Paperclip attachment button */}
                <button
                  type="button"
                  onClick={() => setShowAttachMenu(!showAttachMenu)}
                  className={`p-2 rounded-full transition ${
                    showAttachMenu || attachedFile
                      ? 'bg-blue-100 text-[#2481cc]'
                      : 'text-slate-500 hover:text-slate-800 hover:bg-slate-100'
                  }`}
                  title="Attach Student PDF or Document"
                >
                  <Paperclip className="w-5 h-5" />
                </button>

                {/* Emoji button */}
                <button
                  type="button"
                  onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                  className={`p-2 rounded-full transition ${
                    showEmojiPicker
                      ? 'bg-amber-100 text-amber-600'
                      : 'text-slate-500 hover:text-slate-800 hover:bg-slate-100'
                  }`}
                  title="Insert Emoji"
                >
                  <Smile className="w-5 h-5" />
                </button>

                {/* Textarea message input */}
                <textarea
                  rows={1}
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder={`Write a message to ${activeContact.name}...`}
                  className="flex-1 max-h-28 py-2 px-3 bg-slate-100 focus:bg-white text-xs text-slate-900 rounded-2xl outline-none focus:ring-2 focus:ring-[#2481cc]/40 transition border border-transparent focus:border-[#2481cc] resize-none"
                />

                {/* Telegram Round Send Button */}
                <button
                  type="button"
                  onClick={() => handleSendMessage()}
                  disabled={!inputText.trim() && !attachedFile}
                  className={`w-10 h-10 rounded-full flex items-center justify-center transition shadow-md ${
                    inputText.trim() || attachedFile
                      ? 'bg-[#2481cc] hover:bg-[#1f73b6] text-white hover:scale-105 active:scale-95 cursor-pointer'
                      : 'bg-slate-200 text-slate-400 cursor-not-allowed'
                  }`}
                  title="Send Message (Enter)"
                >
                  <Send className="w-4 h-4 transform -rotate-12 translate-x-[-1px] translate-y-[1px]" />
                </button>
              </div>
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-center p-8 text-slate-400">
              <div className="w-16 h-16 rounded-full bg-slate-200 flex items-center justify-center text-slate-500 mb-3">
                <Send className="w-8 h-8 transform -rotate-12" />
              </div>
              <h3 className="font-bold text-slate-700 text-sm">Select a contact to start messaging</h3>
              <p className="text-xs text-slate-400 mt-1 max-w-xs">
                {mode === 'PARENT' 
                  ? "Choose a teacher, the principal, or an administrative office from the sidebar."
                  : "Pick a parent of your students to communicate with."}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
