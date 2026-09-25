import React, { useState } from 'react';
import { useSchool } from '../../context/SchoolContext';
import { AcademicGrade, AcademicStream } from '../../types';
import { 
  fileToDataUrl, 
  downloadPdfDataUrl 
} from '../../utils/pdfGenerator';
import { 
  UserPlus, 
  FileText, 
  Upload, 
  CheckCircle2, 
  AlertCircle, 
  CreditCard, 
  Key, 
  GitPullRequest, 
  Search, 
  BadgeCheck, 
  Clock, 
  ArrowRight,
  ShieldAlert,
  Eye,
  Download,
  Sparkles,
  FileSpreadsheet,
  FileCheck2,
  Check,
  CheckSquare,
  FileBadge,
  RotateCcw,
  GraduationCap,
  BookOpen,
  Award,
  Layers,
  ExternalLink,
  Plus,
  Trash2,
  Edit3,
  HelpCircle,
  FileCheck
} from 'lucide-react';
import { motion } from 'motion/react';
import { ExportDataModal } from '../common/ExportDataModal';
import { exportStudentsCsv } from '../../utils/csvExport';
import { 
  analyzeTranscriptDocument, 
  loadSampleEthiopianTranscript,
  extractPrerequisiteSubjectMarks 
} from '../../services/transcriptAnalysisService';
import { TranscriptCourseRecord, TranscriptAnalysisResult, Student } from '../../types';

export const AdmissionsView: React.FC = () => {
  const { 
    students, 
    registerStudent, 
    setSelectedStudentForIdCard, 
    schoolName,
    reviewStreamChangeRequest, 
    resetUserPassword,
    markIdCardCollected,
    verifyStudentDocument,
    openDocumentViewer
  } = useSchool();

  const [activeTab, setActiveTab] = useState<'REGISTER' | 'STUDENT_LIST' | 'STREAM_REQUESTS' | 'ID_COLLECTION'>('REGISTER');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterGrade, setFilterGrade] = useState<string>('ALL');
  const [filterDocStatus, setFilterDocStatus] = useState<'ALL' | 'VERIFIED' | 'PENDING'>('ALL');
  const [showExportModal, setShowExportModal] = useState(false);
  
  // Registration Form State
  const [selectedGrade, setSelectedGrade] = useState<AcademicGrade>(9);
  const [fullName, setFullName] = useState('');
  const [gender, setGender] = useState<'Male' | 'Female' | 'Other'>('Male');
  const [dob, setDob] = useState('2011-05-15');
  const [selectedStream, setSelectedStream] = useState<AcademicStream>('Natural Sciences');
  
  // Previous School
  const [isSameSchool, setIsSameSchool] = useState(false);
  const [previousSchoolName, setPreviousSchoolName] = useState('');

  // Parents
  const [fatherName, setFatherName] = useState('');
  const [fatherPhone, setFatherPhone] = useState('');
  const [motherName, setMotherName] = useState('');
  const [motherPhone, setMotherPhone] = useState('');
  const [parentEmail, setParentEmail] = useState('');
  const [parentHomeAddress, setParentHomeAddress] = useState('');
  const [parentWorkAddress, setParentWorkAddress] = useState('');

  // Emergency Contact (Requires at least 2 phone numbers)
  const [emergencyName, setEmergencyName] = useState('');
  const [emergencyPhone1, setEmergencyPhone1] = useState('');
  const [emergencyPhone2, setEmergencyPhone2] = useState('');
  const [emergencyRelationship, setEmergencyRelationship] = useState('Relative / Guardian');

  // Documents
  const [eighthGradeCertAttached, setEighthGradeCertAttached] = useState(false);
  const [certFileName, setCertFileName] = useState<string>('');
  const [certDataUrl, setCertDataUrl] = useState<string>('');
  const [entranceExamScore, setEntranceExamScore] = useState<string>('');

  // Transcript State (Strictly required for Grade 10 and above)
  const [transcriptDataUrl, setTranscriptDataUrl] = useState<string>('');
  const [transcriptFileName, setTranscriptFileName] = useState<string>('');
  const [isAnalyzingTranscript, setIsAnalyzingTranscript] = useState<boolean>(false);
  const [analysisProgressStep, setAnalysisProgressStep] = useState<string>('');
  const [transcriptAnalysis, setTranscriptAnalysis] = useState<TranscriptAnalysisResult | null>(null);
  const [transcribedCourses, setTranscribedCourses] = useState<TranscriptCourseRecord[]>([]);
  const [transcriptAnalysisError, setTranscriptAnalysisError] = useState<string | null>(null);
  const [selectedStudentForTranscriptModal, setSelectedStudentForTranscriptModal] = useState<Student | null>(null);
  
  // Grade-Specific Inserted Results
  // Grade 10: 9th grade results
  const [g9Math, setG9Math] = useState('85');
  const [g9English, setG9English] = useState('88');
  const [g9Science, setG9Science] = useState('90');

  // Grade 11: 9th & 10th grade results
  const [g10Math, setG10Math] = useState('86');
  const [g10English, setG10English] = useState('89');
  const [g10Science, setG10Science] = useState('92');

  // Grade 12: 11th grade results
  const [g11Math, setG11Math] = useState('88');
  const [g11Major1, setG11Major1] = useState('91');
  const [g11Major2, setG11Major2] = useState('93');

  // 3x4 Photo (Restricted size check)
  const [photoUrl, setPhotoUrl] = useState('https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400');
  const [photoError, setPhotoError] = useState<string | null>(null);

  // Success Feedback
  const [successModalData, setSuccessModalData] = useState<{
    id: string;
    accountNumber: string;
    tempPass: string;
    name: string;
  } | null>(null);

  // Photo Upload Handler with 3x4 and file size restriction
  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Size restriction: Max 500 KB
    if (file.size > 500 * 1024) {
      setPhotoError('Image size exceeds 500KB limit! Official 3x4 photos must be under 500KB.');
      return;
    }

    setPhotoError(null);
    const reader = new FileReader();
    reader.onload = (uploadEvent) => {
      if (uploadEvent.target?.result) {
        setPhotoUrl(uploadEvent.target.result as string);
      }
    };
    reader.readAsDataURL(file);
  };

  // Transcript Upload Handler
  const handleTranscriptFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setTranscriptFileName(file.name);
    setTranscriptAnalysisError(null);

    try {
      const dataUrl = await fileToDataUrl(file);
      setTranscriptDataUrl(dataUrl);
      // Auto-trigger transcript analysis
      triggerTranscriptAnalysis(dataUrl, file.name, file.type);
    } catch (err) {
      console.error('Failed to read transcript file', err);
      setTranscriptAnalysisError('Failed to read the selected transcript file. Please try another file.');
    }
  };

  // Trigger AI Transcript Analysis
  const triggerTranscriptAnalysis = async (dataUrlOverride?: string, fileNameOverride?: string, mimeTypeOverride?: string) => {
    const url = dataUrlOverride || transcriptDataUrl;
    const name = fileNameOverride || transcriptFileName || 'Uploaded_Transcript.pdf';
    if (!url) {
      alert('Please upload a transcript document or load the sample Ethiopian transcript first.');
      return;
    }

    setIsAnalyzingTranscript(true);
    setTranscriptAnalysisError(null);
    setAnalysisProgressStep('Reading and preparing transcript document...');

    const stepTimers: NodeJS.Timeout[] = [];
    stepTimers.push(setTimeout(() => setAnalysisProgressStep('Extracting student bio & institution details with Gemini AI...'), 700));
    stepTimers.push(setTimeout(() => setAnalysisProgressStep('Scanning Ethiopian secondary curriculum subjects & semester scores...'), 1400));
    stepTimers.push(setTimeout(() => setAnalysisProgressStep('Calculating semester averages, letter grades & promotion status...'), 2100));

    try {
      const result = await analyzeTranscriptDocument({
        fileDataUrl: url,
        fileName: name,
        mimeType: mimeTypeOverride || (url.startsWith('data:application/pdf') ? 'application/pdf' : 'image/jpeg'),
        enrollingGrade: selectedGrade,
      });

      stepTimers.forEach(clearTimeout);
      setTranscriptAnalysis(result);
      setTranscribedCourses(result.courses);

      // Auto-populate prerequisite score inputs from transcript
      const marks = extractPrerequisiteSubjectMarks(result.courses);
      if (selectedGrade === 10) {
        setG9Math(String(marks.math));
        setG9English(String(marks.english));
        setG9Science(String(marks.science));
      } else if (selectedGrade === 11) {
        setG9Math(String(marks.math));
        setG9English(String(marks.english));
        setG9Science(String(marks.science));
        setG10Math(String(marks.math));
        setG10English(String(marks.english));
        setG10Science(String(marks.science));
      } else if (selectedGrade === 12) {
        setG11Math(String(marks.math));
        setG11Major1(String(marks.physics));
        setG11Major2(String(marks.chemistry));
      }

      setAnalysisProgressStep('Analysis complete! All courses & grades registered.');
    } catch (err: any) {
      console.error('Transcript analysis error:', err);
      stepTimers.forEach(clearTimeout);
      setTranscriptAnalysisError(err?.message || 'Failed to complete transcript analysis. Please try again.');
    } finally {
      setIsAnalyzingTranscript(false);
    }
  };

  // Load Sample Ethiopian Transcript (Ministry of Education format)
  const handleLoadSampleEthiopianTranscript = () => {
    setIsAnalyzingTranscript(true);
    setTranscriptAnalysisError(null);
    setAnalysisProgressStep('Generating and loading authentic Ethiopian Secondary School Transcript (Grade 9 MoE format)...');

    setTimeout(() => {
      const sample = loadSampleEthiopianTranscript();
      setTranscriptDataUrl(sample.dataUrl);
      setTranscriptFileName(sample.fileName);
      setTranscriptAnalysis(sample.analysis);
      setTranscribedCourses(sample.analysis.courses);

      // Auto-populate scores
      const marks = extractPrerequisiteSubjectMarks(sample.analysis.courses);
      setG9Math(String(marks.math));
      setG9English(String(marks.english));
      setG9Science(String(marks.science));
      if (selectedGrade >= 11) {
        setG10Math(String(marks.math));
        setG10English(String(marks.english));
        setG10Science(String(marks.science));
      }

      setIsAnalyzingTranscript(false);
      setAnalysisProgressStep('Sample Ethiopian Transcript loaded and analyzed successfully!');
    }, 600);
  };

  // Auto-Fill candidate bio from analyzed transcript
  const handleAutoFillCandidateBio = () => {
    if (!transcriptAnalysis) return;
    if (transcriptAnalysis.studentNameFound) {
      setFullName(transcriptAnalysis.studentNameFound);
    }
    if (transcriptAnalysis.gender) {
      setGender(transcriptAnalysis.gender);
    }
    if (transcriptAnalysis.schoolNameFound) {
      setPreviousSchoolName(transcriptAnalysis.schoolNameFound);
      setIsSameSchool(false);
    }
  };

  // Modify individual course grade in table
  const handleUpdateCourse = (id: string, field: keyof TranscriptCourseRecord, val: any) => {
    setTranscribedCourses(prev => prev.map(c => {
      if (c.id === id) {
        const updated = { ...c, [field]: val };
        if (field === 'semester1Score' || field === 'semester2Score') {
          const s1 = field === 'semester1Score' ? Number(val) : c.semester1Score;
          const s2 = field === 'semester2Score' ? Number(val) : c.semester2Score;
          if (s1 != null && s2 != null) {
            updated.finalAverage = Math.round((Number(s1) + Number(s2)) / 2);
          } else if (s1 != null) {
            updated.finalAverage = Number(s1);
          } else if (s2 != null) {
            updated.finalAverage = Number(s2);
          }
          const avg = updated.finalAverage;
          updated.letterGrade = avg >= 90 ? 'A+' : avg >= 85 ? 'A' : avg >= 80 ? 'B+' : avg >= 75 ? 'B' : avg >= 60 ? 'C' : 'F';
          updated.remarks = avg >= 50 ? 'Passed' : 'Failed';
        }
        return updated;
      }
      return c;
    }));
  };

  // Remove a course
  const handleDeleteCourse = (id: string) => {
    setTranscribedCourses(prev => prev.filter(c => c.id !== id));
  };

  // Add custom elective course
  const handleAddCustomCourse = () => {
    const newCourse: TranscriptCourseRecord = {
      id: `custom-c-${Date.now()}`,
      subject: 'Elective Subject',
      gradeLevel: selectedGrade > 9 ? selectedGrade - 1 : 9,
      semester1Score: 85,
      semester2Score: 88,
      finalAverage: 87,
      letterGrade: 'A',
      creditsOrPeriods: 3,
      conduct: 'A',
      remarks: 'Passed'
    };
    setTranscribedCourses(prev => [...prev, newCourse]);
  };

  const handleSubmitRegistration = (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedGrade) {
      alert('Requirement Missing: Student enrollment Grade level is strictly required!');
      return;
    }

    if (!eighthGradeCertAttached) {
      alert('Requirement Missing: 8th Grade Certificate must be verified and attached for admission!');
      return;
    }

    // MANDATORY FOR GRADE 10 AND ABOVE: OFFICIAL TRANSCRIPT REQUIRED
    if (selectedGrade >= 10 && !transcriptDataUrl && !transcriptFileName && transcribedCourses.length === 0) {
      alert('Mandatory Document Missing: For enrollment into Grade 10 and above, an Official Prior Academic Transcript must be uploaded and verified before admission can proceed. Please attach the student transcript or load the sample Ethiopian transcript.');
      return;
    }

    if (selectedGrade === 9 && !entranceExamScore) {
      alert('Requirement Missing: 8th Grade National Exam / School Entrance Result is required for Grade 9 enrollment!');
      return;
    }

    if (selectedGrade >= 10 && (!g9Math || !g9English || !g9Science)) {
      alert('Requirement Missing: 9th Grade verified transcript results are required for Grade 10+ admission!');
      return;
    }

    if (selectedGrade >= 11 && (!g10Math || !g10English || !g10Science)) {
      alert('Requirement Missing: 10th Grade National Exam results are required for Grade 11+ admission!');
      return;
    }

    if (selectedGrade >= 12 && (!g11Math || !g11Major1 || !g11Major2)) {
      alert('Requirement Missing: 11th Grade annual results are required for Grade 12 admission!');
      return;
    }

    if (!emergencyPhone1 || !emergencyPhone2) {
      alert('Requirement Missing: Emergency contact must have at least 2 distinct phone numbers.');
      return;
    }

    // Build results objects based on Grade
    const g9Results = selectedGrade >= 10 ? {
      math: parseFloat(g9Math) || 80,
      english: parseFloat(g9English) || 80,
      science: parseFloat(g9Science) || 80,
      average: Math.round(((parseFloat(g9Math) || 80) + (parseFloat(g9English) || 80) + (parseFloat(g9Science) || 80)) / 3)
    } : null;

    const g10Results = selectedGrade >= 11 ? {
      math: parseFloat(g10Math) || 80,
      english: parseFloat(g10English) || 80,
      science: parseFloat(g10Science) || 80,
      average: Math.round(((parseFloat(g10Math) || 80) + (parseFloat(g10English) || 80) + (parseFloat(g10Science) || 80)) / 3)
    } : null;

    const g11Results = selectedGrade >= 12 ? {
      math: parseFloat(g11Math) || 85,
      physics_history: parseFloat(g11Major1) || 85,
      chemistry_geog: parseFloat(g11Major2) || 85,
      average: Math.round(((parseFloat(g11Math) || 85) + (parseFloat(g11Major1) || 85) + (parseFloat(g11Major2) || 85)) / 3)
    } : null;

    const finalCertUrl = certDataUrl || '';

    const createdStudent = registerStudent({
      fullName,
      gender,
      dob,
      grade: selectedGrade,
      stream: selectedGrade >= 11 ? selectedStream : null,
      sectionId: null,
      eighthGradeCertAttached: Boolean(certDataUrl || eighthGradeCertAttached),
      certificateDocName: certFileName || (certDataUrl ? `${fullName.replace(/\s+/g, '_')}_8th_Grade_Certificate.pdf` : 'Pending_Certificate.pdf'),
      certificateDocUrl: finalCertUrl,
      transcriptDocName: transcriptFileName || (transcriptDataUrl ? `${fullName.replace(/\s+/g, '_')}_Official_Transcript.pdf` : undefined),
      transcriptDocUrl: transcriptDataUrl || undefined,
      transcriptAttached: Boolean(transcriptDataUrl || transcriptFileName || transcribedCourses.length > 0),
      transcribedCourses: transcribedCourses.length > 0 ? transcribedCourses : undefined,
      transcriptAnalysis: transcriptAnalysis || null,
      entranceExamScore: entranceExamScore ? parseFloat(entranceExamScore) : null,
      ninthGradeResults: g9Results,
      tenthGradeResults: g10Results,
      eleventhGradeResults: g11Results,
      photoUrl,
      previousSchool: {
        name: isSameSchool ? schoolName : (previousSchoolName || transcriptAnalysis?.schoolNameFound || 'Prior School'),
        isSameSchool,
      },
      parents: {
        fatherName,
        fatherPhone,
        motherName,
        motherPhone,
        email: parentEmail,
        homeAddress: parentHomeAddress,
        workAddress: parentWorkAddress,
      },
      emergencyContact: {
        name: emergencyName,
        phone1: emergencyPhone1,
        phone2: emergencyPhone2,
        relationship: emergencyRelationship,
      },
      temporaryPassword: '',
      mustChangePasswordOnLogin: true,
      password: '',
      streamChangeRequest: null,
      lostIdRequest: null,
      leavingClearance: null,
    });

    setSuccessModalData({
      id: createdStudent.id,
      accountNumber: createdStudent.accountNumber,
      tempPass: createdStudent.temporaryPassword || 'Temp#2026',
      name: createdStudent.fullName,
    });

    // Reset Form
    handleResetRegistrationForm();
  };

  // Manual Reset Form Handler
  const handleResetRegistrationForm = () => {
    setFullName('');
    setFatherName('');
    setFatherPhone('');
    setMotherName('');
    setMotherPhone('');
    setEmergencyName('');
    setEmergencyPhone1('');
    setEmergencyPhone2('');
    setPreviousSchoolName('');
    setIsSameSchool(false);
    setSelectedGrade(9);
    setSelectedStream(null);
    setEntranceExamScore('');
    setPhotoUrl('https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80');
    setCertFileName('');
    setCertDataUrl('');
    setEighthGradeCertAttached(false);
    setTranscriptDataUrl('');
    setTranscriptFileName('');
    setIsAnalyzingTranscript(false);
    setAnalysisProgressStep('');
    setTranscriptAnalysis(null);
    setTranscribedCourses([]);
    setTranscriptAnalysisError(null);
    setG9Math('88');
    setG9English('84');
    setG9Science('82');
    setG10Math('86');
    setG10English('82');
    setG10Science('85');
    setG11Math('88');
    setG11Major1('85');
    setG11Major2('83');
  };

  // Document verification helper for each student record
  const checkStudentDossierVerification = (s: typeof students[0]) => {
    const hasEighthCert = Boolean(s.eighthGradeCertAttached);
    const hasAcademicPrereq = s.grade === 9 
      ? (s.entranceExamScore != null && s.entranceExamScore > 0)
      : Boolean(s.ninthGradeResults);
    const hasPhoto = Boolean(s.photoUrl && s.photoUrl.length > 5);
    const hasEmergency = Boolean(s.emergencyContact?.phone1);
    const requiresTranscript = s.grade >= 10;
    const hasTranscript = Boolean(s.transcriptDocUrl || (s.transcribedCourses && s.transcribedCourses.length > 0));

    let totalTasks = 4;
    let completedTasks = 0;
    if (hasEighthCert) completedTasks++;
    if (hasAcademicPrereq) completedTasks++;
    if (hasPhoto) completedTasks++;
    if (hasEmergency) completedTasks++;

    if (requiresTranscript) {
      totalTasks = 5;
      if (hasTranscript) completedTasks++;
    }

    const percentage = Math.round((completedTasks / totalTasks) * 100);
    const isComplete = completedTasks === totalTasks;

    return {
      isComplete,
      percentage,
      completedTasks,
      totalTasks,
      hasEighthCert,
      hasAcademicPrereq,
      hasPhoto,
      hasEmergency,
      requiresTranscript,
      hasTranscript,
    };
  };

  // Filter students
  const filteredStudents = students.filter(s => {
    const matchesSearch = s.fullName.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          s.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          s.accountNumber.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesGrade = filterGrade === 'ALL' || s.grade.toString() === filterGrade;
    const dossier = checkStudentDossierVerification(s);
    const matchesDoc = filterDocStatus === 'ALL' 
      || (filterDocStatus === 'VERIFIED' && dossier.isComplete)
      || (filterDocStatus === 'PENDING' && !dossier.isComplete);
    return matchesSearch && matchesGrade && matchesDoc;
  });

  // Institutional document verification metrics
  const studentDossierList = students.map(s => ({
    student: s,
    ...checkStudentDossierVerification(s),
  }));
  const totalStudents = students.length;
  const verifiedDossiersCount = studentDossierList.filter(d => d.isComplete).length;
  const pendingDossiersCount = totalStudents - verifiedDossiersCount;
  const institutionalDocCompletionRate = totalStudents > 0 
    ? Math.round((verifiedDossiersCount / totalStudents) * 100) 
    : 0;

  const eighthGradeCertsVerifiedCount = studentDossierList.filter(d => d.hasEighthCert).length;
  const academicPrereqsVerifiedCount = studentDossierList.filter(d => d.hasAcademicPrereq).length;
  const photosVerifiedCount = studentDossierList.filter(d => d.hasPhoto).length;
  const transcriptsVerifiedCount = studentDossierList.filter(d => d.hasTranscript).length;

  // Active Candidate Registration Verification Checks
  const candidateDocChecks = [
    {
      id: 'grade',
      label: 'Grade & Stream',
      done: selectedGrade < 11 ? true : Boolean(selectedStream),
      desc: `Grade ${selectedGrade}${selectedGrade >= 11 ? ` (${selectedStream})` : ''}`,
    },
    {
      id: 'bio',
      label: 'Identity & Photo',
      done: Boolean(fullName.trim().length >= 2 && dob && photoUrl),
      desc: fullName.trim() ? `${fullName.split(' ')[0]} bio verified` : 'Name & photo required',
    },
    {
      id: 'cert',
      label: '8th Grade Cert',
      done: Boolean(eighthGradeCertAttached && (certFileName || certDataUrl)),
      desc: eighthGradeCertAttached ? (certFileName || 'Certificate verified') : 'Upload & verify required',
    },
    ...(selectedGrade >= 10 ? [{
      id: 'transcript',
      label: 'Prior Transcript (10th+)',
      done: Boolean(transcriptDataUrl || transcriptFileName || transcribedCourses.length > 0),
      desc: (transcribedCourses.length > 0)
        ? `Analyzed (${transcribedCourses.length} courses registered)`
        : (transcriptFileName ? 'Transcript uploaded' : 'Mandatory for Grade 10+'),
    }] : []),
    {
      id: 'marks',
      label: 'Prerequisite Marks',
      done: selectedGrade === 9 
        ? Boolean(entranceExamScore && Number(entranceExamScore) > 0)
        : (transcribedCourses.length > 0 || Boolean(g9Math && g9English && g9Science)),
      desc: selectedGrade === 9 
        ? (entranceExamScore ? `${entranceExamScore}% Entrance score` : 'Entrance score required') 
        : (transcribedCourses.length > 0 ? `${transcribedCourses.length} courses verified` : 'Transcript marks verified'),
    },
    {
      id: 'guardian',
      label: 'Guardian Contact',
      done: Boolean((fatherName.trim() || motherName.trim()) && (fatherPhone.trim() || motherPhone.trim()) && emergencyName.trim() && emergencyPhone1.trim()),
      desc: (fatherPhone || motherPhone) ? 'Parents & emergency phones verified' : 'Parents & 2 phones required',
    },
  ];
  const candidateCompletedCount = candidateDocChecks.filter(c => c.done).length;
  const candidateDocPercentage = Math.round((candidateCompletedCount / candidateDocChecks.length) * 100);

  // Bulk verify all pending student dossiers
  const handleVerifyAllPendingDossiers = () => {
    students.forEach(s => {
      const dossier = checkStudentDossierVerification(s);
      if (!dossier.isComplete) {
        verifyStudentDocument(s.id);
      }
    });
  };

  // Pending stream requests
  const pendingStreamRequests = students.filter(s => s.streamChangeRequest && s.streamChangeRequest.status === 'PENDING');

  return (
    <div className="space-y-6">
      {/* Top Banner & Tab Navigation */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 pb-5">
          <div>
            <span className="px-2.5 py-0.5 bg-blue-100 text-blue-800 rounded text-xs font-bold uppercase tracking-wider">
              Admissions & Records Department
            </span>
            <h1 className="font-oskar-vintage text-2xl font-bold text-slate-900 mt-1 tracking-wider">
              Registrar Management Portal
            </h1>
            <p className="text-xs text-slate-500 mt-0.5">
              Verify grade requirements, auto-generate student IDs, manage stream changes, and provision credentials.
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setActiveTab('REGISTER')}
              className={`px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition ${
                activeTab === 'REGISTER'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              <UserPlus className="w-3.5 h-3.5" />
              New Student Registration
            </button>

            <button
              onClick={() => setActiveTab('STUDENT_LIST')}
              className={`px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition ${
                activeTab === 'STUDENT_LIST'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              <FileText className="w-3.5 h-3.5" />
              Registered Directory ({students.length})
            </button>

            <button
              onClick={() => setActiveTab('STREAM_REQUESTS')}
              className={`px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 relative transition ${
                activeTab === 'STREAM_REQUESTS'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              <GitPullRequest className="w-3.5 h-3.5" />
              Stream Change Requests
              {pendingStreamRequests.length > 0 && (
                <span className="w-5 h-5 rounded-full bg-amber-500 text-white text-[10px] flex items-center justify-center font-bold">
                  {pendingStreamRequests.length}
                </span>
              )}
            </button>

            <button
              onClick={() => setActiveTab('ID_COLLECTION')}
              className={`px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition ${
                activeTab === 'ID_COLLECTION'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              <CreditCard className="w-3.5 h-3.5" />
              ID Badge Handover
            </button>

            <button
              onClick={() => setShowExportModal(true)}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 shadow-sm transition cursor-pointer active:scale-95"
              title="Export filtered student records or full directory to CSV"
            >
              <FileSpreadsheet className="w-3.5 h-3.5" />
              Export Data (CSV)
            </button>
          </div>
        </div>

        {/* Quick Summary Metrics */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-5">
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
            <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Total Enrolled</p>
            <p className="font-oskar-vintage text-xl font-bold text-slate-900 mt-0.5">{students.length} Students</p>
          </div>
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
            <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Pending Stream Change</p>
            <p className="font-oskar-vintage text-xl font-bold text-amber-600 mt-0.5">
              {pendingStreamRequests.length} Withheld
            </p>
          </div>
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
            <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">ID Cards Handed Over</p>
            <p className="font-oskar-vintage text-xl font-bold text-emerald-600 mt-0.5">
              {students.filter(s => s.idCardCollected).length} / {students.length}
            </p>
          </div>
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
            <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Tuition Complete</p>
            <p className="font-oskar-vintage text-xl font-bold text-blue-600 mt-0.5">
              {students.filter(s => s.registrationStatus === 'COMPLETE').length} Cleared
            </p>
          </div>
        </div>

        {/* Institutional Admissions Document Verification Progress Bar */}
        <div className="mt-5 p-4 bg-slate-50/90 rounded-2xl border border-slate-200">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2.5">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center shrink-0">
                <FileCheck2 className="w-4 h-4" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h4 className="font-oskar-vintage text-sm font-bold text-slate-900 tracking-wide">
                    Admissions Document Verification Completion
                  </h4>
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                    institutionalDocCompletionRate === 100
                      ? 'bg-emerald-100 text-emerald-800'
                      : institutionalDocCompletionRate >= 70
                      ? 'bg-blue-100 text-blue-800'
                      : 'bg-amber-100 text-amber-800'
                  }`}>
                    {institutionalDocCompletionRate}% Verified
                  </span>
                </div>
                <p className="text-[11px] text-slate-500">
                  {verifiedDossiersCount} of {totalStudents} Student Dossiers Fully Verified & Archived in Official Vault
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 self-start sm:self-auto">
              {pendingDossiersCount > 0 ? (
                <>
                  <button
                    type="button"
                    onClick={() => {
                      setActiveTab('STUDENT_LIST');
                      setFilterDocStatus('PENDING');
                    }}
                    className="px-2.5 py-1 bg-white hover:bg-slate-100 border border-slate-300 text-slate-700 rounded-lg text-xs font-semibold flex items-center gap-1 transition"
                  >
                    View {pendingDossiersCount} Pending
                  </button>
                  <button
                    type="button"
                    onClick={handleVerifyAllPendingDossiers}
                    className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold flex items-center gap-1 transition shadow-xs cursor-pointer active:scale-95"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    Verify All Dossiers
                  </button>
                </>
              ) : (
                <span className="px-3 py-1 bg-emerald-100 text-emerald-800 rounded-lg text-xs font-bold flex items-center gap-1">
                  <Check className="w-3.5 h-3.5" />
                  All Dossiers 100% Compliant
                </span>
              )}
            </div>
          </div>

          {/* Visual Animated Progress Bar Track */}
          <div className="relative h-2.5 w-full bg-slate-200 rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${institutionalDocCompletionRate}%` }}
              transition={{ duration: 0.8, ease: 'easeOut' }}
              className="h-full bg-gradient-to-r from-blue-600 via-indigo-600 to-emerald-500 rounded-full"
            />
          </div>

          {/* Verification Breakdown Sub-Metrics */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 mt-3 pt-3 border-t border-slate-200 text-xs">
            <div className="flex items-center justify-between px-2.5 py-1.5 bg-white rounded-lg border border-slate-200/80">
              <span className="text-slate-600 font-medium">8th Grade Certificates</span>
              <span className="font-mono font-bold text-slate-900">
                {eighthGradeCertsVerifiedCount}/{totalStudents} ({Math.round((eighthGradeCertsVerifiedCount / (totalStudents || 1)) * 100)}%)
              </span>
            </div>
            <div className="flex items-center justify-between px-2.5 py-1.5 bg-white rounded-lg border border-slate-200/80">
              <span className="text-slate-600 font-medium">Transcripts & Entrance Marks</span>
              <span className="font-mono font-bold text-slate-900">
                {academicPrereqsVerifiedCount}/{totalStudents} ({Math.round((academicPrereqsVerifiedCount / (totalStudents || 1)) * 100)}%)
              </span>
            </div>
            <div className="flex items-center justify-between px-2.5 py-1.5 bg-white rounded-lg border border-slate-200/80">
              <span className="text-slate-600 font-medium">Photos & Emergency Contacts</span>
              <span className="font-mono font-bold text-slate-900">
                {photosVerifiedCount}/{totalStudents} ({Math.round((photosVerifiedCount / (totalStudents || 1)) * 100)}%)
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* TAB 1: REGISTRATION FORM */}
      {activeTab === 'REGISTER' && (
        <form onSubmit={handleSubmitRegistration} className="bg-white rounded-2xl p-6 sm:p-8 shadow-sm border border-slate-200 space-y-8">
          {/* Candidate Registration Document Verification Progress Bar */}
          <div className="p-4 bg-gradient-to-r from-blue-50/80 to-indigo-50/60 rounded-2xl border border-blue-200/80 space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-blue-600 text-white flex items-center justify-center shrink-0">
                  <FileCheck2 className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="font-oskar-vintage text-sm font-bold text-slate-900">
                    Application Document Verification & Compliance Progress
                  </h4>
                  <p className="text-[11px] text-slate-500">
                    Tracks candidate prerequisites and mandatory document uploads in real-time
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${
                  candidateDocPercentage === 100
                    ? 'bg-emerald-100 text-emerald-800 ring-1 ring-emerald-300'
                    : 'bg-blue-100 text-blue-800'
                }`}>
                  {candidateDocPercentage}% Completed ({candidateCompletedCount}/{candidateDocChecks.length} Tasks)
                </span>
              </div>
            </div>

            {/* Visual Progress Bar */}
            <div className="relative h-2 w-full bg-blue-200/60 rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${candidateDocPercentage}%` }}
                transition={{ duration: 0.5, ease: 'easeOut' }}
                className="h-full bg-gradient-to-r from-blue-600 to-emerald-500 rounded-full"
              />
            </div>

            {/* Checklist Step Pills */}
            <div className="flex flex-wrap gap-2 pt-1">
              {candidateDocChecks.map(check => (
                <div
                  key={check.id}
                  className={`px-2.5 py-1 rounded-lg text-[11px] flex items-center gap-1.5 transition-all border ${
                    check.done
                      ? 'bg-white border-emerald-300 text-emerald-800 shadow-2xs font-semibold'
                      : 'bg-white/60 border-slate-200 text-slate-500 font-medium'
                  }`}
                >
                  {check.done ? (
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  ) : (
                    <Clock className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  )}
                  <span>{check.label}:</span>
                  <span className={check.done ? 'text-slate-900 font-bold' : 'text-slate-400'}>
                    {check.desc}
                  </span>
                </div>
              ))}
            </div>
          </div>
          {/* Grade Level Selector */}
          <div>
            <h3 className="font-oskar-vintage text-lg font-bold text-slate-900 tracking-wider">
              1. Select Enrollment Grade Level
            </h3>
            <p className="text-xs text-slate-500 mb-4">
              Fields and prerequisite document verifications adjust automatically based on grade criteria.
            </p>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {([9, 10, 11, 12] as AcademicGrade[]).map((grade) => (
                <button
                  type="button"
                  key={grade}
                  onClick={() => setSelectedGrade(grade)}
                  className={`p-4 rounded-xl border text-left transition-all ${
                    selectedGrade === grade
                      ? 'border-blue-600 bg-blue-50/70 ring-2 ring-blue-500/20'
                      : 'border-slate-200 hover:border-slate-300 bg-slate-50/50'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-oskar-vintage text-lg font-bold text-slate-900">
                      Grade {grade}
                    </span>
                    {grade === 9 && (
                      <span className="text-[10px] uppercase font-bold text-blue-700 bg-blue-100 px-1.5 py-0.5 rounded">
                        Freshman
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] text-slate-500 mt-1">
                    {grade === 9 && 'Requires 8th cert & entrance score'}
                    {grade === 10 && 'Requires 8th cert + 9th marks'}
                    {grade === 11 && 'Stream choice + 9th/10th marks'}
                    {grade === 12 && 'Stream choice + 9th/10th/11th marks'}
                  </p>
                </button>
              ))}
            </div>
          </div>

          {/* If Grade 11 or 12: Stream Classification */}
          {selectedGrade >= 11 && (
            <div className="p-4 bg-blue-50/60 rounded-xl border border-blue-200">
              <label className="block text-xs font-bold uppercase tracking-wider text-blue-900 mb-2">
                Mandatory Academic Stream Classification (Grade {selectedGrade})
              </label>
              <div className="grid grid-cols-2 gap-4">
                {(['Natural Sciences', 'Social Sciences'] as AcademicStream[]).map((stream) => (
                  <button
                    type="button"
                    key={stream}
                    onClick={() => setSelectedStream(stream)}
                    className={`p-3 rounded-lg border text-left transition ${
                      selectedStream === stream
                        ? 'border-blue-600 bg-white font-bold text-blue-900 shadow-sm ring-1 ring-blue-500'
                        : 'border-blue-200 bg-blue-50/30 text-blue-700'
                    }`}
                  >
                    <div className="text-xs font-semibold">{stream}</div>
                    <p className="text-[10px] text-slate-500 mt-0.5">
                      {stream === 'Natural Sciences' ? 'Focus: Advanced Physics, Chem, Bio, Calculus' : 'Focus: Economics, Geography, History, Social Studies'}
                    </p>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Student Personal Information */}
          <div className="space-y-4">
            <h3 className="font-oskar-vintage text-lg font-bold text-slate-900 tracking-wider">
              2. Student Bio & Identification Details
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Enrolling Academic Grade Level * <span className="text-blue-600 font-bold">(Mandatory)</span>
                </label>
                <select
                  required
                  value={selectedGrade}
                  onChange={(e) => setSelectedGrade(Number(e.target.value) as AcademicGrade)}
                  className="w-full px-3 py-2 border border-blue-300 bg-blue-50/50 rounded-lg text-xs font-bold text-slate-900 focus:ring-2 focus:ring-blue-500 outline-none"
                >
                  <option value={9}>Grade 9 (Freshman)</option>
                  <option value={10}>Grade 10 (Sophomore)</option>
                  <option value={11}>Grade 11 (Junior High - Stream Required)</option>
                  <option value={12}>Grade 12 (Senior High - Stream Required)</option>
                </select>
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-slate-700 mb-1">Student Full Name *</label>
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Enter student full name"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Gender</label>
                <select
                  value={gender}
                  onChange={(e) => setGender(e.target.value as any)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-blue-500 outline-none"
                >
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Date of Birth</label>
                <input
                  type="date"
                  value={dob}
                  onChange={(e) => setDob(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>

              {/* Entrance / Placement Exam Score */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  {selectedGrade === 9 ? '8th Regional / Entrance Exam Score (/100) *' : 'Entrance / Placement Exam Score (/100)'}
                </label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  required={selectedGrade === 9}
                  value={entranceExamScore}
                  onChange={(e) => setEntranceExamScore(e.target.value)}
                  placeholder={selectedGrade === 9 ? "Required, e.g. 92" : "Optional, e.g. 88"}
                  className={`w-full px-3 py-2 border rounded-lg text-xs focus:ring-2 focus:ring-blue-500 outline-none ${
                    selectedGrade === 9 ? 'border-amber-300 bg-amber-50/30' : 'border-slate-300'
                  }`}
                />
              </div>

              {/* Previously Attended School */}
              <div className="sm:col-span-1">
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-semibold text-slate-700">Previously Attended School</label>
                  <label className="flex items-center gap-1.5 text-xs text-blue-600 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={isSameSchool}
                      onChange={(e) => setIsSameSchool(e.target.checked)}
                      className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="text-[11px] font-medium">Same School</span>
                  </label>
                </div>
                <input
                  type="text"
                  disabled={isSameSchool}
                  value={isSameSchool ? schoolName : previousSchoolName}
                  onChange={(e) => setPreviousSchoolName(e.target.value)}
                  placeholder={isSameSchool ? schoolName : 'Name of previous school'}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-blue-500 outline-none disabled:bg-slate-100"
                />
              </div>
            </div>
          </div>

          {/* 3x4 Photograph Upload with size restriction */}
          <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-800 mb-1">
              Photograph 3×4 Regulation (Restricted Size & Aspect)
            </h4>
            <p className="text-[11px] text-slate-500 mb-3">
              Upload official passport style 3x4 photo. Restricted to maximum 500KB. Used for auto-generating official Student ID.
            </p>

            <div className="flex items-center gap-4">
              <div className="w-20 h-24 rounded-lg border-2 border-slate-300 overflow-hidden bg-slate-200 shrink-0 shadow-inner relative">
                <img src={photoUrl} alt="3x4 Student Preview" className="w-full h-full object-cover" />
                <span className="absolute bottom-0 inset-x-0 bg-black/60 text-[8px] text-white text-center py-0.5 font-mono">
                  3×4 CM
                </span>
              </div>

              <div className="space-y-1">
                <label className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 text-xs font-semibold rounded-lg cursor-pointer shadow-sm">
                  <Upload className="w-3.5 h-3.5 text-blue-600" />
                  Select 3×4 Photo (Max 500KB)
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handlePhotoUpload}
                    className="hidden"
                  />
                </label>
                {photoError && (
                  <p className="text-xs text-red-600 font-medium flex items-center gap-1">
                    <AlertCircle className="w-3.5 h-3.5" /> {photoError}
                  </p>
                )}
                <p className="text-[10px] text-slate-400">Accepted formats: JPG, PNG. File size restricted.</p>
              </div>
            </div>
          </div>

          {/* Mandatory Documents Verification & PDF Upload */}
          <div className="p-5 bg-slate-50 rounded-2xl border border-slate-200 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-200 pb-3">
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-800">
                  3. Document Attachments & Prerequisite Verification
                </h4>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  Mandatory 8th Grade Certificate must be uploaded and saved as a PDF in the portal database.
                </p>
              </div>
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 bg-blue-100 text-blue-800 rounded-full font-bold text-[10px] uppercase">
                <CheckCircle2 className="w-3 h-3 text-blue-600" />
                Portal PDF Storage Active
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* File Upload Box */}
              <div className="p-4 bg-white rounded-xl border border-slate-200 space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-slate-800 block">
                    Upload 8th Grade Certificate (PDF / Image) *
                  </label>
                  <span className="text-[10px] text-slate-400 font-mono">.pdf, .jpg, .png</span>
                </div>

                <label className="border-2 border-dashed border-slate-300 hover:border-blue-500 rounded-xl p-4 flex flex-col items-center justify-center cursor-pointer transition text-center bg-slate-50/50 group">
                  <Upload className="w-6 h-6 text-slate-400 group-hover:text-blue-600 mb-2 transition" />
                  <span className="text-xs font-semibold text-slate-700 block truncate max-w-full px-2">
                    {certFileName || 'No certificate selected — Browse device or drag & drop'}
                  </span>
                  <span className="text-[11px] text-slate-400 mt-1">
                    Upload official 8th Grade Certificate (PDF or Image file)
                  </span>
                  <input
                    type="file"
                    accept=".pdf,image/*"
                    onChange={async (e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        setCertFileName(file.name);
                        try {
                          const dataUrl = await fileToDataUrl(file);
                          setCertDataUrl(dataUrl);
                          setEighthGradeCertAttached(true);
                        } catch (err) {
                          console.error('Failed to read document file', err);
                        }
                      }
                    }}
                    className="hidden"
                  />
                </label>
              </div>

              {/* Uploaded Certificate Status & In-Portal Preview */}
              {certDataUrl ? (
                <div className="p-4 bg-emerald-50/70 rounded-xl border border-emerald-200 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                    <div>
                      <span className="text-xs font-bold text-emerald-950 block">Authentic Certificate File Attached</span>
                      <span className="text-[11px] text-emerald-700 truncate block max-w-sm font-mono">{certFileName}</span>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      openDocumentViewer({
                        title: 'Verified 8th Grade Certificate',
                        subtitle: `Academic Prerequisite Record for ${fullName || 'New Student'}`,
                        docName: certFileName,
                        docUrl: certDataUrl,
                        category: 'CERTIFICATE',
                        metadata: {
                          studentName: fullName || 'Enrolling Scholar',
                          referenceNumber: 'STUDENT-DOC-8TH',
                          uploadedDate: new Date().toISOString().split('T')[0],
                        },
                      });
                    }}
                    className="px-3 py-1.5 bg-white border border-emerald-300 hover:bg-emerald-100/50 text-emerald-800 rounded-lg text-xs font-bold transition flex items-center gap-1.5 shrink-0 shadow-xs cursor-pointer"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    Preview Uploaded Document
                  </button>
                </div>
              ) : (
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-slate-500 text-xs flex items-center gap-2">
                  <FileText className="w-4 h-4 text-slate-400 shrink-0" />
                  <span>Attach the student's authentic Grade 8 certificate PDF or scan image above to archive into their record.</span>
                </div>
              )}
            </div>

            {/* Confirmation Checkbox */}
            <div className="flex items-center gap-3 p-3 bg-white rounded-lg border border-slate-200">
              <input
                type="checkbox"
                id="eightCert"
                required
                checked={eighthGradeCertAttached}
                onChange={(e) => setEighthGradeCertAttached(e.target.checked)}
                className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
              />
              <label htmlFor="eightCert" className="text-xs font-medium text-slate-700 cursor-pointer">
                <span className="font-bold text-slate-900">8th Grade Certificate Attached & Verified as PDF in Portal *</span>
                <span className="block text-[11px] text-slate-500">
                  Confirmed: The document is archived into the student's persistent digital dossier and accessible across administrative offices.
                </span>
              </label>
            </div>
          </div>

          {/* Grade 10, 11, 12: Mandatory Official Transcript Upload & AI Course Analysis */}
          {selectedGrade >= 10 && (
            <div className="p-5 bg-gradient-to-br from-indigo-50/70 via-blue-50/50 to-slate-50 rounded-2xl border-2 border-indigo-200/80 shadow-sm space-y-5">
              {/* Header Banner */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-indigo-100 pb-4">
                <div className="flex items-start gap-3">
                  <div className="p-2.5 bg-indigo-600 text-white rounded-xl shadow-sm mt-0.5">
                    <GraduationCap className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="font-oskar-vintage text-base font-bold text-slate-900">
                        4. Official Academic Transcript & Taken Course Registration
                      </h4>
                      <span className="px-2 py-0.5 bg-indigo-100 text-indigo-800 rounded font-bold text-[10px] uppercase tracking-wide border border-indigo-200">
                        Mandatory for Grade {selectedGrade}+
                      </span>
                    </div>
                    <p className="text-xs text-slate-600 mt-1 max-w-2xl">
                      Ministry of Education regulations strictly require an official prior academic transcript for admission into Grade 10 and above. Our AI evaluates Ethiopian curriculum subjects, authenticates semester marks, and registers taken courses and grades.
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 self-start sm:self-center shrink-0">
                  <button
                    type="button"
                    onClick={handleLoadSampleEthiopianTranscript}
                    disabled={isAnalyzingTranscript}
                    className="px-3 py-1.5 bg-amber-500 hover:bg-amber-600 text-white rounded-lg text-xs font-bold transition flex items-center gap-1.5 shadow-xs cursor-pointer disabled:opacity-50"
                    title="Load an authentic sample Ethiopian Grade 9 Secondary School Transcript (Ministry of Education format)"
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    Load Sample Ethiopian Transcript
                  </button>
                </div>
              </div>

              {/* Upload & Document Toolbar */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Upload Drag-and-Drop Box */}
                <div className="p-4 bg-white rounded-xl border border-slate-200 space-y-3 shadow-2xs">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                      <Upload className="w-3.5 h-3.5 text-indigo-600" />
                      Upload Official Transcript (PDF / Scan) *
                    </label>
                    <span className="text-[10px] text-slate-400 font-mono">.pdf, .jpg, .png</span>
                  </div>

                  <label className={`border-2 border-dashed rounded-xl p-4 flex flex-col items-center justify-center cursor-pointer transition text-center group ${
                    transcriptDataUrl ? 'border-indigo-400 bg-indigo-50/30' : 'border-slate-300 hover:border-indigo-500 bg-slate-50/50'
                  }`}>
                    <Upload className="w-6 h-6 text-slate-400 group-hover:text-indigo-600 mb-2 transition" />
                    <span className="text-xs font-semibold text-slate-800 block truncate max-w-full px-2">
                      {transcriptFileName || 'Click to select transcript or drag & drop here'}
                    </span>
                    <span className="text-[11px] text-slate-500 mt-1">
                      Upload Grade {selectedGrade > 9 ? selectedGrade - 1 : 9} Official Transcript (PDF, scan, or photo)
                    </span>
                    <input
                      type="file"
                      accept=".pdf,image/*"
                      onChange={handleTranscriptFileUpload}
                      className="hidden"
                    />
                  </label>
                </div>

                {/* Status & AI Action Box */}
                <div className="p-4 bg-white rounded-xl border border-slate-200 flex flex-col justify-between shadow-2xs space-y-3">
                  <div>
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-800">Transcript Dossier Status</span>
                      {transcriptDataUrl ? (
                        <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 text-[10px] font-bold rounded-full flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3 text-emerald-600" /> Attached
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 bg-rose-100 text-rose-800 text-[10px] font-bold rounded-full flex items-center gap-1">
                          <AlertCircle className="w-3 h-3 text-rose-600" /> Missing (Required)
                        </span>
                      )}
                    </div>

                    <p className="text-xs text-slate-600 mt-2 font-mono truncate">
                      {transcriptFileName || 'No transcript file selected yet.'}
                    </p>

                    {transcriptAnalysisError && (
                      <div className="mt-2 p-2 bg-rose-50 border border-rose-200 text-rose-800 rounded text-[11px] flex items-center gap-1.5">
                        <AlertCircle className="w-3.5 h-3.5 text-rose-600 shrink-0" />
                        <span>{transcriptAnalysisError}</span>
                      </div>
                    )}
                  </div>

                  <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-slate-100">
                    <button
                      type="button"
                      onClick={() => triggerTranscriptAnalysis()}
                      disabled={!transcriptDataUrl || isAnalyzingTranscript}
                      className="flex-1 py-2 px-3 bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-300 text-white rounded-lg text-xs font-bold transition flex items-center justify-center gap-1.5 shadow-sm cursor-pointer disabled:cursor-not-allowed"
                    >
                      <Sparkles className="w-3.5 h-3.5" />
                      {isAnalyzingTranscript ? 'Analyzing Transcript...' : (transcribedCourses.length > 0 ? 'Re-Analyze with AI' : 'Analyse Transcript with AI')}
                    </button>

                    {transcriptDataUrl && (
                      <button
                        type="button"
                        onClick={() => {
                          openDocumentViewer({
                            title: 'Official Academic Transcript',
                            subtitle: `Prior Secondary Institution Record for ${fullName || 'New Student'}`,
                            docName: transcriptFileName || 'Student_Transcript.pdf',
                            docUrl: transcriptDataUrl,
                            category: 'TRANSCRIPT',
                            metadata: {
                              studentName: fullName || 'Scholar Candidate',
                              school: previousSchoolName || transcriptAnalysis?.schoolNameFound || 'Prior Secondary School',
                              referenceNumber: 'MOE-TR-DOC',
                              uploadedDate: new Date().toISOString().split('T')[0],
                            },
                          });
                        }}
                        className="py-2 px-3 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-bold transition flex items-center gap-1 border border-slate-200 cursor-pointer"
                        title="View uploaded transcript in document viewer"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        Preview
                      </button>
                    )}
                  </div>
                </div>
              </div>

              {/* In-Flight Scanning Progress */}
              {isAnalyzingTranscript && (
                <div className="p-4 bg-indigo-900 text-white rounded-xl space-y-2 animate-pulse">
                  <div className="flex items-center justify-between text-xs">
                    <span className="flex items-center gap-2 font-bold">
                      <Sparkles className="w-4 h-4 text-amber-300 animate-spin" />
                      Gemini Multimodal Transcript Analysis in Progress...
                    </span>
                    <span className="text-[10px] text-indigo-200 font-mono">Ethiopian MoE Curriculum Engine</span>
                  </div>
                  <div className="h-1.5 w-full bg-indigo-950 rounded-full overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-amber-400 to-emerald-400 rounded-full w-3/4 animate-pulse" />
                  </div>
                  <p className="text-[11px] text-indigo-200 font-mono">
                    {analysisProgressStep || 'Extracting course titles, semester marks, and student bio details...'}
                  </p>
                </div>
              )}

              {/* Analyzed Transcript Details & Extracted Profile */}
              {transcriptAnalysis && !isAnalyzingTranscript && (
                <div className="p-4 bg-white rounded-xl border border-emerald-300 shadow-sm space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold">
                        <Check className="w-4 h-4" />
                      </div>
                      <div>
                        <h5 className="font-bold text-slate-900 text-xs">
                          Official Transcript Authenticated & Registered
                        </h5>
                        <p className="text-[11px] text-slate-500">
                          {transcriptAnalysis.schoolNameFound} • Academic Year: {transcriptAnalysis.academicYear || '2015 E.C.'}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={handleAutoFillCandidateBio}
                        className="px-3 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 rounded-lg text-xs font-bold transition flex items-center gap-1.5 shadow-2xs cursor-pointer"
                        title="Auto-fill student name, previous school, and gender from the transcript"
                      >
                        <UserPlus className="w-3.5 h-3.5" />
                        Auto-Fill Candidate Bio
                      </button>
                    </div>
                  </div>

                  {/* Quick Highlights Metrics */}
                  <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 text-center">
                    <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-100">
                      <span className="text-[10px] text-slate-400 uppercase font-bold block">Candidate Name</span>
                      <span className="text-xs font-bold text-slate-900 block truncate mt-0.5">
                        {transcriptAnalysis.studentNameFound || fullName || 'Verified Candidate'}
                      </span>
                    </div>

                    <div className="p-2.5 bg-emerald-50 rounded-lg border border-emerald-100">
                      <span className="text-[10px] text-emerald-600 uppercase font-bold block">Cumulative Average</span>
                      <span className="text-xs font-bold text-emerald-800 block mt-0.5">
                        {transcriptAnalysis.totalAverageScore}% ({transcriptAnalysis.overallLetterGrade || 'A'})
                      </span>
                    </div>

                    <div className="p-2.5 bg-blue-50 rounded-lg border border-blue-100">
                      <span className="text-[10px] text-blue-600 uppercase font-bold block">Courses Verified</span>
                      <span className="text-xs font-bold text-blue-800 block mt-0.5">
                        {transcribedCourses.length} Subjects Registered
                      </span>
                    </div>

                    <div className="p-2.5 bg-amber-50 rounded-lg border border-amber-100">
                      <span className="text-[10px] text-amber-700 uppercase font-bold block">Conduct & Rank</span>
                      <span className="text-xs font-bold text-amber-900 block mt-0.5">
                        {transcriptAnalysis.conductRating || 'Excellent (A)'} • {transcriptAnalysis.rankInClass || 'Top 10%'}
                      </span>
                    </div>

                    <div className="p-2.5 bg-purple-50 rounded-lg border border-purple-100 col-span-2 sm:col-span-1">
                      <span className="text-[10px] text-purple-600 uppercase font-bold block">Promotion Status</span>
                      <span className="text-xs font-bold text-purple-900 block mt-0.5 truncate">
                        {transcriptAnalysis.promotionStatus || 'Passed Prerequisite'}
                      </span>
                    </div>
                  </div>

                  {/* Registered Taken Courses & Grades Table */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5">
                        <BookOpen className="w-4 h-4 text-indigo-600" />
                        <span className="text-xs font-bold text-slate-800">
                          Registered Taken Courses & Academic Marks ({transcribedCourses.length})
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={handleAddCustomCourse}
                        className="px-2.5 py-1 bg-slate-100 hover:bg-indigo-50 hover:text-indigo-700 text-slate-700 rounded text-[11px] font-semibold flex items-center gap-1 transition cursor-pointer"
                      >
                        <Plus className="w-3 h-3" />
                        Add Course
                      </button>
                    </div>

                    <div className="overflow-x-auto border border-slate-200 rounded-xl">
                      <table className="w-full text-xs text-left">
                        <thead>
                          <tr className="bg-slate-100/80 border-b border-slate-200 text-slate-500 uppercase text-[10px] font-bold">
                            <th className="py-2.5 px-3">#</th>
                            <th className="py-2.5 px-3">Subject Title / Course</th>
                            <th className="py-2.5 px-2">Grade</th>
                            <th className="py-2.5 px-2">Sem 1 (100%)</th>
                            <th className="py-2.5 px-2">Sem 2 (100%)</th>
                            <th className="py-2.5 px-2">Average</th>
                            <th className="py-2.5 px-2">Letter</th>
                            <th className="py-2.5 px-2">Periods</th>
                            <th className="py-2.5 px-2">Status</th>
                            <th className="py-2.5 px-2 text-right">Action</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 bg-white">
                          {transcribedCourses.map((course, idx) => (
                            <tr key={course.id} className="hover:bg-slate-50/70 transition">
                              <td className="py-2 px-3 font-mono text-slate-400 text-[11px]">
                                {idx + 1}
                              </td>
                              <td className="py-2 px-3">
                                <input
                                  type="text"
                                  value={course.subject}
                                  onChange={(e) => handleUpdateCourse(course.id, 'subject', e.target.value)}
                                  className="w-full font-bold text-slate-800 bg-transparent hover:bg-slate-50 border-b border-transparent hover:border-slate-300 focus:border-indigo-500 outline-none px-1 py-0.5 rounded text-xs"
                                />
                              </td>
                              <td className="py-2 px-2 text-slate-600 font-mono text-[11px]">
                                G{course.gradeLevel}
                              </td>
                              <td className="py-2 px-2">
                                <input
                                  type="number"
                                  min="0"
                                  max="100"
                                  value={course.semester1Score ?? ''}
                                  onChange={(e) => handleUpdateCourse(course.id, 'semester1Score', e.target.value === '' ? null : Number(e.target.value))}
                                  className="w-16 px-1.5 py-0.5 border border-slate-200 rounded font-mono text-xs text-slate-800 text-center bg-slate-50 focus:bg-white focus:ring-1 focus:ring-indigo-500 outline-none"
                                />
                              </td>
                              <td className="py-2 px-2">
                                <input
                                  type="number"
                                  min="0"
                                  max="100"
                                  value={course.semester2Score ?? ''}
                                  onChange={(e) => handleUpdateCourse(course.id, 'semester2Score', e.target.value === '' ? null : Number(e.target.value))}
                                  className="w-16 px-1.5 py-0.5 border border-slate-200 rounded font-mono text-xs text-slate-800 text-center bg-slate-50 focus:bg-white focus:ring-1 focus:ring-indigo-500 outline-none"
                                />
                              </td>
                              <td className="py-2 px-2 font-mono font-bold text-slate-900 text-xs">
                                {course.finalAverage}%
                              </td>
                              <td className="py-2 px-2">
                                <span className={`px-1.5 py-0.5 rounded font-bold text-[10px] ${
                                  course.letterGrade.startsWith('A') ? 'bg-emerald-100 text-emerald-800' :
                                  course.letterGrade.startsWith('B') ? 'bg-blue-100 text-blue-800' :
                                  course.letterGrade.startsWith('C') ? 'bg-amber-100 text-amber-800' : 'bg-rose-100 text-rose-800'
                                }`}>
                                  {course.letterGrade}
                                </span>
                              </td>
                              <td className="py-2 px-2 text-slate-500 font-mono text-[11px]">
                                {course.creditsOrPeriods || 3}
                              </td>
                              <td className="py-2 px-2">
                                <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-emerald-700">
                                  <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                                  {course.remarks || 'Passed'}
                                </span>
                              </td>
                              <td className="py-2 px-2 text-right">
                                <button
                                  type="button"
                                  onClick={() => handleDeleteCourse(course.id)}
                                  className="p-1 text-slate-400 hover:text-rose-600 rounded transition cursor-pointer"
                                  title="Delete course"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>

                    <div className="p-2.5 bg-blue-50/60 rounded-lg border border-blue-100 flex items-center justify-between text-[11px] text-blue-900">
                      <div className="flex items-center gap-1.5">
                        <Award className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                        <span>
                          <strong>Registration Commitment:</strong> All {transcribedCourses.length} verified courses and semester marks will be automatically registered into the student's official institution gradebook.
                        </span>
                      </div>
                      <span className="font-bold text-blue-800 shrink-0 ml-2">
                        Avg: {transcriptAnalysis.totalAverageScore}%
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {/* Prerequisite Scores Verification Summary */}
              <div className="p-4 bg-white/80 rounded-xl border border-indigo-100 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <BadgeCheck className="w-4 h-4 text-indigo-600" />
                    <h5 className="text-xs font-bold text-slate-800 uppercase tracking-wide">
                      Prerequisite Subject Scores (Auto-Synchronized from Transcript)
                    </h5>
                  </div>
                  {transcribedCourses.length > 0 && (
                    <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                      Synchronized from Transcript
                    </span>
                  )}
                </div>

                {/* 9th Grade Results */}
                <div>
                  <p className="text-[11px] font-semibold text-slate-700 mb-1.5">
                    9th Grade Results (Required for Grade 10+):
                  </p>
                  <div className="grid grid-cols-3 gap-3">
                    <div>
                      <label className="text-[10px] text-slate-500 block">Math Score (/100) *</label>
                      <input
                        type="number"
                        min="0"
                        max="100"
                        required={selectedGrade >= 10}
                        value={g9Math}
                        onChange={(e) => setG9Math(e.target.value)}
                        className="w-full px-2 py-1.5 border border-slate-300 rounded text-xs bg-white font-mono font-bold"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] text-slate-500 block">English Score (/100) *</label>
                      <input
                        type="number"
                        min="0"
                        max="100"
                        required={selectedGrade >= 10}
                        value={g9English}
                        onChange={(e) => setG9English(e.target.value)}
                        className="w-full px-2 py-1.5 border border-slate-300 rounded text-xs bg-white font-mono font-bold"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] text-slate-500 block">Science (Average) (/100) *</label>
                      <input
                        type="number"
                        min="0"
                        max="100"
                        required={selectedGrade >= 10}
                        value={g9Science}
                        onChange={(e) => setG9Science(e.target.value)}
                        className="w-full px-2 py-1.5 border border-slate-300 rounded text-xs bg-white font-mono font-bold"
                      />
                    </div>
                  </div>
                </div>

                {/* 10th Grade Results (If Grade 11 or 12) */}
                {selectedGrade >= 11 && (
                  <div className="pt-2 border-t border-slate-100">
                    <p className="text-[11px] font-semibold text-slate-700 mb-1.5">
                      10th Grade Results (Required for Grade 11+):
                    </p>
                    <div className="grid grid-cols-3 gap-3">
                      <div>
                        <label className="text-[10px] text-slate-500 block">Math Score (/100) *</label>
                        <input
                          type="number"
                          min="0"
                          max="100"
                          required={selectedGrade >= 11}
                          value={g10Math}
                          onChange={(e) => setG10Math(e.target.value)}
                          className="w-full px-2 py-1.5 border border-slate-300 rounded text-xs bg-white font-mono font-bold"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] text-slate-500 block">English Score (/100) *</label>
                        <input
                          type="number"
                          min="0"
                          max="100"
                          required={selectedGrade >= 11}
                          value={g10English}
                          onChange={(e) => setG10English(e.target.value)}
                          className="w-full px-2 py-1.5 border border-slate-300 rounded text-xs bg-white font-mono font-bold"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] text-slate-500 block">Science Score (/100) *</label>
                        <input
                          type="number"
                          min="0"
                          max="100"
                          required={selectedGrade >= 11}
                          value={g10Science}
                          onChange={(e) => setG10Science(e.target.value)}
                          className="w-full px-2 py-1.5 border border-slate-300 rounded text-xs bg-white font-mono font-bold"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* 11th Grade Results (If Grade 12) */}
                {selectedGrade >= 12 && (
                  <div className="pt-2 border-t border-slate-100">
                    <p className="text-[11px] font-semibold text-slate-700 mb-1.5">
                      11th Grade Results (Required for Grade 12):
                    </p>
                    <div className="grid grid-cols-3 gap-3">
                      <div>
                        <label className="text-[10px] text-slate-500 block">Math (/100) *</label>
                        <input
                          type="number"
                          min="0"
                          max="100"
                          required={selectedGrade >= 12}
                          value={g11Math}
                          onChange={(e) => setG11Math(e.target.value)}
                          className="w-full px-2 py-1.5 border border-slate-300 rounded text-xs bg-white font-mono font-bold"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] text-slate-500 block">Major 1 (Physics/History) *</label>
                        <input
                          type="number"
                          min="0"
                          max="100"
                          required={selectedGrade >= 12}
                          value={g11Major1}
                          onChange={(e) => setG11Major1(e.target.value)}
                          className="w-full px-2 py-1.5 border border-slate-300 rounded text-xs bg-white font-mono font-bold"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] text-slate-500 block">Major 2 (Chemistry/Geog) *</label>
                        <input
                          type="number"
                          min="0"
                          max="100"
                          required={selectedGrade >= 12}
                          value={g11Major2}
                          onChange={(e) => setG11Major2(e.target.value)}
                          className="w-full px-2 py-1.5 border border-slate-300 rounded text-xs bg-white font-mono font-bold"
                        />
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Parents / Guardians Full Name & Phone Numbers & Addresses */}
          <div className="space-y-4">
            <h3 className="font-oskar-vintage text-lg font-bold text-slate-900 tracking-wider">
              5. Parents / Guardians Information
            </h3>
            <p className="text-xs text-slate-500">
              Parents' and legal guardians' full details, including active phone numbers, email, residential home address, and workplace address for official school communications.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
                <p className="text-xs font-bold text-slate-700">Father / Guardian 1</p>
                <div>
                  <label className="text-[11px] text-slate-600 block">Full Name *</label>
                  <input
                    type="text"
                    required
                    value={fatherName}
                    onChange={(e) => setFatherName(e.target.value)}
                    placeholder="e.g. Melaku Tadesse"
                    className="w-full px-3 py-1.5 border border-slate-300 rounded-lg text-xs bg-white"
                  />
                </div>
                <div>
                  <label className="text-[11px] text-slate-600 block">Phone Number *</label>
                  <input
                    type="tel"
                    required
                    value={fatherPhone}
                    onChange={(e) => setFatherPhone(e.target.value)}
                    placeholder="+251 91 123 4567"
                    className="w-full px-3 py-1.5 border border-slate-300 rounded-lg text-xs bg-white"
                  />
                </div>
              </div>

              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
                <p className="text-xs font-bold text-slate-700">Mother / Guardian 2</p>
                <div>
                  <label className="text-[11px] text-slate-600 block">Full Name *</label>
                  <input
                    type="text"
                    required
                    value={motherName}
                    onChange={(e) => setMotherName(e.target.value)}
                    placeholder="e.g. Aster Wolde Mikael"
                    className="w-full px-3 py-1.5 border border-slate-300 rounded-lg text-xs bg-white"
                  />
                </div>
                <div>
                  <label className="text-[11px] text-slate-600 block">Phone Number *</label>
                  <input
                    type="tel"
                    required
                    value={motherPhone}
                    onChange={(e) => setMotherPhone(e.target.value)}
                    placeholder="+251 92 345 6789"
                    className="w-full px-3 py-1.5 border border-slate-300 rounded-lg text-xs bg-white"
                  />
                </div>
              </div>
            </div>

            {/* Email, Home Address, Work Address */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
              <div>
                <label className="text-[11px] text-slate-600 font-semibold block mb-1">Parent / Guardian Email Address *</label>
                <input
                  type="email"
                  required
                  value={parentEmail}
                  onChange={(e) => setParentEmail(e.target.value)}
                  placeholder="parent.guardian@example.com"
                  className="w-full px-3 py-1.5 border border-slate-300 rounded-lg text-xs bg-white focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>

              <div>
                <label className="text-[11px] text-slate-600 font-semibold block mb-1">Residential Home Address *</label>
                <input
                  type="text"
                  required
                  value={parentHomeAddress}
                  onChange={(e) => setParentHomeAddress(e.target.value)}
                  placeholder="e.g. Bole Subcity, Woreda 03, H.No 412, Addis Ababa"
                  className="w-full px-3 py-1.5 border border-slate-300 rounded-lg text-xs bg-white focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>

              <div>
                <label className="text-[11px] text-slate-600 font-semibold block mb-1">Work / Office Address *</label>
                <input
                  type="text"
                  required
                  value={parentWorkAddress}
                  onChange={(e) => setParentWorkAddress(e.target.value)}
                  placeholder="e.g. Commercial Bank of Ethiopia HQ, Churchill Ave"
                  className="w-full px-3 py-1.5 border border-slate-300 rounded-lg text-xs bg-white focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>
            </div>
          </div>

          {/* Emergency Contact Person with AT LEAST 2 PHONE NUMBERS */}
          <div className="p-5 bg-rose-50/50 rounded-xl border border-rose-200 space-y-3">
            <div>
              <h3 className="font-oskar-vintage text-base font-bold text-rose-950 tracking-wider">
                5. Emergency Contact (Mandatory 2 Phone Numbers)
              </h3>
              <p className="text-xs text-rose-800">
                School safety regulations mandate recording at least two alternative contact phone numbers.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="text-[11px] font-semibold text-rose-900 block">Contact Person Full Name *</label>
                <input
                  type="text"
                  required
                  value={emergencyName}
                  onChange={(e) => setEmergencyName(e.target.value)}
                  placeholder="e.g. Dr. Girma Tadesse"
                  className="w-full px-3 py-1.5 border border-rose-300 rounded-lg text-xs bg-white"
                />
              </div>

              <div>
                <label className="text-[11px] font-semibold text-rose-900 block">Primary Emergency Phone *</label>
                <input
                  type="tel"
                  required
                  value={emergencyPhone1}
                  onChange={(e) => setEmergencyPhone1(e.target.value)}
                  placeholder="+251 91 888 1234"
                  className="w-full px-3 py-1.5 border border-rose-300 rounded-lg text-xs bg-white"
                />
              </div>

              <div>
                <label className="text-[11px] font-semibold text-rose-900 block">Secondary Emergency Phone *</label>
                <input
                  type="tel"
                  required
                  value={emergencyPhone2}
                  onChange={(e) => setEmergencyPhone2(e.target.value)}
                  placeholder="+251 94 555 9876"
                  className="w-full px-3 py-1.5 border border-rose-300 rounded-lg text-xs bg-white"
                />
              </div>
            </div>
          </div>

          {/* Submit Button */}
          <div className="pt-4 border-t border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <p className="text-xs text-slate-500">
              Upon registration: Auto-generates ID badge, temporary student & parent credentials, and finance tuition account.
            </p>
            <div className="flex items-center gap-2 self-end sm:self-auto">
              <button
                type="button"
                onClick={handleResetRegistrationForm}
                className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer border border-slate-200"
                title="Reset all form inputs"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                Reset Form
              </button>
              <button
                type="submit"
                className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-md shadow-blue-600/30 flex items-center gap-2 cursor-pointer transition"
              >
                <UserPlus className="w-4 h-4" />
                Complete Registration & Generate ID
              </button>
            </div>
          </div>
        </form>
      )}

      {/* SUCCESS MODAL AFTER REGISTRATION */}
      {successModalData && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl p-6 sm:p-8 max-w-md w-full shadow-2xl border border-slate-200 animate-in zoom-in-95">
            <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto mb-3">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <h3 className="font-oskar-vintage text-xl font-bold text-center text-slate-900">
              Registration Successful!
            </h3>
            <p className="text-xs text-center text-slate-500 mt-1">
              Official records and scholar files have been established for {successModalData.name}.
            </p>

            <div className="my-5 p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-slate-500">Auto-Generated ID:</span>
                <span className="font-mono font-bold text-blue-600 text-sm">{successModalData.id}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Fee Account Number:</span>
                <span className="font-mono font-bold text-slate-800">{successModalData.accountNumber}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-500">Initial Temporary Password:</span>
                <div className="flex items-center gap-1.5">
                  <span className="font-mono font-bold bg-amber-100 text-amber-900 px-1.5 py-0.5 rounded">{successModalData.tempPass}</span>
                  <span className="text-[10px] font-bold text-rose-700 bg-rose-50 border border-rose-200 px-1 py-0.5 rounded uppercase">Must Be Changed</span>
                </div>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Scholar Profile:</span>
                <span className="font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">Active & Enrolled</span>
              </div>
            </div>

            <div className="mb-4 p-2.5 bg-amber-50 rounded-lg border border-amber-200 text-[11px] text-amber-900">
              <strong>Mandatory Security Action:</strong> When logging in with this temporary password, the system will strictly require the student or parent to request and set a new personal permanent password (Must be changed).
            </div>

            <div className="space-y-2">
              <button
                onClick={() => {
                  const s = students.find(item => item.id === successModalData.id);
                  if (s) setSelectedStudentForIdCard(s);
                  setSuccessModalData(null);
                }}
                className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition shadow"
              >
                View & Download Official ID Badge
              </button>
              <button
                onClick={() => setSuccessModalData(null)}
                className="w-full py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold transition"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: REGISTERED STUDENT DIRECTORY */}
      {activeTab === 'STUDENT_LIST' && (
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200 space-y-4">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="relative w-full sm:w-80">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder="Search by student name, ID, account..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-2 border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>

            <div className="flex flex-wrap items-center gap-2 self-end">
              <span className="text-xs text-slate-500 font-medium">Filter:</span>
              <select
                value={filterGrade}
                onChange={(e) => setFilterGrade(e.target.value)}
                className="px-2 py-1.5 border border-slate-300 rounded-lg text-xs bg-white font-medium"
              >
                <option value="ALL">All Grades (9-12)</option>
                <option value="9">Grade 9</option>
                <option value="10">Grade 10</option>
                <option value="11">Grade 11</option>
                <option value="12">Grade 12</option>
              </select>

              <select
                value={filterDocStatus}
                onChange={(e) => setFilterDocStatus(e.target.value as 'ALL' | 'VERIFIED' | 'PENDING')}
                className="px-2 py-1.5 border border-slate-300 rounded-lg text-xs bg-white font-medium"
              >
                <option value="ALL">All Verification ({totalStudents})</option>
                <option value="VERIFIED">Verified ({verifiedDossiersCount})</option>
                <option value="PENDING">Pending ({pendingDossiersCount})</option>
              </select>

              <button
                type="button"
                onClick={() => exportStudentsCsv(filteredStudents, { filterLabel: filterGrade !== 'ALL' ? `Grade_${filterGrade}` : 'Directory' })}
                className="px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-300 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition shadow-2xs cursor-pointer active:scale-95"
                title={`Export ${filteredStudents.length} currently filtered student records as CSV`}
              >
                <Download className="w-3.5 h-3.5 text-emerald-700" />
                Export CSV ({filteredStudents.length})
              </button>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead>
                <tr className="border-b border-slate-200 text-slate-400 uppercase font-semibold text-[10px] bg-slate-50">
                  <th className="py-3 px-3">Student Info</th>
                  <th className="py-3 px-3">ID & Account</th>
                  <th className="py-3 px-3">Grade & Stream</th>
                  <th className="py-3 px-3">Parents / Contacts</th>
                  <th className="py-3 px-3">Enrollment Status</th>
                  <th className="py-3 px-3">Document Verification</th>
                  <th className="py-3 px-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredStudents.map((s) => (
                  <tr key={s.id} className="hover:bg-slate-50/80 transition">
                    <td className="py-3 px-3">
                      <div className="flex items-center gap-3">
                        <img 
                          src={s.photoUrl} 
                          alt={s.fullName} 
                          className="w-9 h-11 object-cover rounded border border-slate-300 shrink-0" 
                        />
                        <div>
                          <p className="font-bold text-slate-900">{s.fullName}</p>
                          <p className="text-[11px] text-slate-500">DOB: {s.dob} • {s.gender}</p>
                        </div>
                      </div>
                    </td>

                    <td className="py-3 px-3 font-mono">
                      <span className="font-bold text-blue-600 block">{s.id}</span>
                      <span className="text-[10px] text-slate-500">{s.accountNumber}</span>
                    </td>

                    <td className="py-3 px-3">
                      <span className="font-semibold text-slate-800">Grade {s.grade}</span>
                      {s.stream ? (
                        <span className="block text-[10px] font-medium text-emerald-700">
                          {s.stream}
                        </span>
                      ) : (
                        <span className="block text-[10px] text-slate-400">General</span>
                      )}
                      {s.sectionId ? (
                        <span className="inline-block mt-0.5 px-1.5 py-0.5 bg-blue-50 text-blue-700 rounded text-[10px] font-semibold">
                          Sec {s.sectionId}
                        </span>
                      ) : (
                        <span className="inline-block mt-0.5 px-1.5 py-0.5 bg-amber-50 text-amber-700 rounded text-[10px] font-semibold">
                          Unassigned
                        </span>
                      )}
                    </td>

                    <td className="py-3 px-3 text-[11px]">
                      <p className="text-slate-700 truncate max-w-[160px]">
                        <span className="text-slate-400">P:</span> {s.parents.fatherName || s.parents.motherName}
                      </p>
                      <p className="text-slate-500 font-mono text-[10px]">
                        {s.parents.fatherPhone || s.parents.motherPhone}
                      </p>
                      <p className="text-rose-700 font-medium text-[10px]">
                        Em: {s.emergencyContact.phone1}
                      </p>
                    </td>

                    <td className="py-3 px-3">
                      {s.registrationStatus === 'COMPLETE' ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-full font-semibold text-[10px]">
                          <CheckCircle2 className="w-3 h-3" /> Complete
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-amber-50 text-amber-700 border border-amber-200 rounded-full font-semibold text-[10px]">
                          <Clock className="w-3 h-3" /> Tuition Due
                        </span>
                      )}

                      {s.streamChangeRequest?.status === 'PENDING' && (
                        <span className="block mt-1 text-[10px] font-bold text-amber-800 bg-amber-100 px-1.5 py-0.5 rounded">
                          Stream Review Pending
                        </span>
                      )}
                    </td>

                    {/* Document Verification Visual Progress Bar */}
                    <td className="py-3 px-3">
                      {(() => {
                        const dossier = checkStudentDossierVerification(s);
                        return (
                          <div className="space-y-1.5 w-36">
                            <div className="flex items-center justify-between text-[11px]">
                              <span className={`font-bold ${dossier.isComplete ? 'text-emerald-700' : 'text-amber-700'}`}>
                                {dossier.percentage}%
                              </span>
                              <span className="text-[10px] text-slate-500 font-medium">
                                {dossier.completedTasks}/{dossier.totalTasks} Done
                              </span>
                            </div>

                            {/* Visual Mini Progress Bar */}
                            <div className="h-1.5 w-full bg-slate-200 rounded-full overflow-hidden">
                              <div 
                                style={{ width: `${dossier.percentage}%` }}
                                className={`h-full rounded-full transition-all duration-300 ${
                                  dossier.isComplete ? 'bg-emerald-500' : 'bg-amber-500'
                                }`}
                              />
                            </div>

                            {dossier.isComplete ? (
                              <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-emerald-700">
                                <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                                100% Verified
                              </span>
                            ) : (
                              <div className="flex items-center justify-between gap-1 pt-0.5">
                                <span className="text-[10px] text-amber-700 font-medium truncate" title="Missing prerequisite or 8th grade certificate">
                                  {!dossier.hasEighthCert ? '8th Cert Pending' : 'Prereq Pending'}
                                </span>
                                <button
                                  type="button"
                                  onClick={() => verifyStudentDocument(s.id)}
                                  className="px-1.5 py-0.5 bg-amber-50 hover:bg-emerald-50 text-amber-700 hover:text-emerald-700 border border-amber-300 hover:border-emerald-300 rounded text-[10px] font-bold transition shrink-0 cursor-pointer active:scale-95"
                                  title="Approve and verify 8th grade certificate and prerequisite dossier"
                                >
                                  Verify
                                </button>
                              </div>
                            )}
                          </div>
                        );
                      })()}
                    </td>

                    <td className="py-3 px-3 text-right space-y-1">
                      <button
                        onClick={() => setSelectedStudentForIdCard(s)}
                        className="px-2.5 py-1 bg-slate-100 hover:bg-blue-50 text-blue-700 hover:text-blue-800 rounded font-semibold text-[11px] transition block ml-auto"
                      >
                        ID Card
                      </button>

                      {/* If student has transcribed courses or transcript doc */}
                      {(s.grade >= 10 || s.transcriptDocUrl || (s.transcribedCourses && s.transcribedCourses.length > 0)) && (
                        <button
                          onClick={() => setSelectedStudentForTranscriptModal(s)}
                          className="px-2.5 py-1 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 rounded font-semibold text-[11px] transition flex items-center gap-1 ml-auto cursor-pointer"
                          title="View registered courses and marks extracted from prior transcript"
                        >
                          <BookOpen className="w-3 h-3" />
                          Courses ({s.transcribedCourses?.length || 0})
                        </button>
                      )}

                      {s.transcriptDocUrl && (
                        <button
                          onClick={() => {
                            openDocumentViewer({
                              title: 'Official Academic Transcript',
                              subtitle: `Prior Secondary Institution Record for ${s.fullName}`,
                              docName: s.transcriptDocName || `${s.id}_Official_Transcript.pdf`,
                              docUrl: s.transcriptDocUrl!,
                              category: 'TRANSCRIPT',
                              metadata: {
                                studentName: s.fullName,
                                studentId: s.id,
                                referenceNumber: `MOE-TR-${s.id}`,
                                uploadedDate: 'Verified at Registration',
                              },
                            });
                          }}
                          className="px-2.5 py-1 bg-purple-50 hover:bg-purple-100 text-purple-700 rounded font-semibold text-[11px] transition flex items-center gap-1 ml-auto cursor-pointer"
                          title="Preview uploaded prior transcript PDF document"
                        >
                          <FileCheck className="w-3 h-3" />
                          Transcript PDF
                        </button>
                      )}

                      {s.certificateDocUrl ? (
                        <button
                          onClick={() => {
                            openDocumentViewer({
                              title: 'Verified 8th Grade Certificate',
                              subtitle: `Verified Registration Record for ${s.fullName}`,
                              docName: s.certificateDocName || `${s.id}_8th_Grade_Certificate.pdf`,
                              docUrl: s.certificateDocUrl!,
                              category: 'CERTIFICATE',
                              metadata: {
                                studentName: s.fullName,
                                studentId: s.id,
                                referenceNumber: `MOE-CERT-${s.id}`,
                                uploadedDate: 'Verified at Registration',
                              },
                            });
                          }}
                          className="px-2.5 py-1 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded font-semibold text-[11px] transition flex items-center gap-1 ml-auto"
                        >
                          <FileText className="w-3 h-3" />
                          8th Cert PDF
                        </button>
                      ) : !s.transcriptDocUrl ? (
                        <span className="text-[10px] text-slate-400 font-mono ml-auto block">No Cert</span>
                      ) : null}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 3: STREAM CHANGE REQUESTS */}
      {activeTab === 'STREAM_REQUESTS' && (
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200 space-y-4">
          <div className="border-b border-slate-100 pb-4">
            <h3 className="font-oskar-vintage text-lg font-bold text-slate-900 tracking-wider">
              Student Stream Reclassification Requests (15-Day Policy)
            </h3>
            <p className="text-xs text-slate-500 mt-1">
              "Registrar's office has the power to change streams of students provided that they submit a request through their Portal to change their stream within 15 days of school start. If the request is neither Accepted nor Denied the system shouldn't assign the student a classroom and don't put them in the attendance."
            </p>
          </div>

          <div className="space-y-3">
            {students.filter(s => s.streamChangeRequest).map((s) => {
              const req = s.streamChangeRequest!;
              const isPending = req.status === 'PENDING';

              return (
                <div 
                  key={s.id} 
                  className={`p-5 rounded-xl border transition ${
                    isPending 
                      ? 'border-amber-300 bg-amber-50/40 shadow-sm' 
                      : req.status === 'ACCEPTED'
                      ? 'border-emerald-200 bg-emerald-50/20'
                      : 'border-slate-200 bg-slate-50'
                  }`}
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-900 text-sm">{s.fullName}</span>
                        <span className="font-mono text-xs text-blue-600 font-semibold">({s.id})</span>
                        <span className="text-xs px-2 py-0.5 rounded bg-slate-200 text-slate-700 font-medium">
                          Grade {s.grade}
                        </span>
                      </div>
                      <p className="text-xs text-slate-600 mt-1">
                        Current Stream: <span className="font-bold">{s.stream || 'None'}</span> &rarr; Requested Stream: <span className="font-bold text-blue-700">{req.requestedStream}</span>
                      </p>
                      <p className="text-xs text-slate-500 italic mt-1 bg-white p-2 rounded border border-slate-200/80">
                        "{req.reason}"
                      </p>
                    </div>

                    <div className="text-right sm:shrink-0">
                      <div className="text-[11px] text-slate-500 mb-2">
                        Submitted: {req.requestDate} ({req.daysSinceSchoolStart} days into term • <span className="text-emerald-700 font-semibold">Valid &lt; 15 days</span>)
                      </div>

                      {isPending ? (
                        <div className="flex items-center gap-2 justify-end">
                          <button
                            onClick={() => reviewStreamChangeRequest(s.id, false, 'Denied: Academic prerequisites not aligned')}
                            className="px-3 py-1.5 bg-rose-100 hover:bg-rose-200 text-rose-800 rounded-lg text-xs font-bold transition"
                          >
                            Deny Request
                          </button>
                          <button
                            onClick={() => reviewStreamChangeRequest(s.id, true, 'Approved by Registrar')}
                            className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold transition shadow-sm"
                          >
                            Accept Stream Change
                          </button>
                        </div>
                      ) : (
                        <span className={`inline-block px-2.5 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
                          req.status === 'ACCEPTED' ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                        }`}>
                          {req.status}
                        </span>
                      )}
                    </div>
                  </div>

                  {isPending && (
                    <div className="mt-3 pt-3 border-t border-amber-200 flex items-center gap-2 text-[11px] text-amber-800 font-medium">
                      <ShieldAlert className="w-4 h-4 text-amber-600 shrink-0" />
                      <span>
                        System Enforcement Active: Student is withheld from section classroom assignment and daily attendance roster until this request is resolved.
                      </span>
                    </div>
                  )}
                </div>
              );
            })}

            {students.filter(s => s.streamChangeRequest).length === 0 && (
              <p className="text-xs text-slate-400 text-center py-6">No stream change requests currently on file.</p>
            )}
          </div>
        </div>
      )}

      {/* TAB 4: ID CARD HANDOVER & COLLECTION */}
      {activeTab === 'ID_COLLECTION' && (
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200 space-y-4">
          <div className="border-b border-slate-100 pb-4">
            <h3 className="font-oskar-vintage text-lg font-bold text-slate-900 tracking-wider">
              Student Physical ID Badge Handover Desk
            </h3>
            <p className="text-xs text-slate-500 mt-1">
              "Also They collect their ID From here." Track handover of newly printed badges and replacement badges after finance clearance.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {students.map((s) => (
              <div 
                key={s.id} 
                className="p-4 rounded-xl border border-slate-200 flex items-center justify-between hover:shadow-sm transition bg-slate-50/50"
              >
                <div className="flex items-center gap-3">
                  <img 
                    src={s.photoUrl} 
                    alt={s.fullName} 
                    className="w-12 h-14 object-cover rounded-lg border border-slate-300"
                  />
                  <div>
                    <h4 className="font-bold text-slate-900 text-xs">{s.fullName}</h4>
                    <p className="font-mono text-[11px] text-blue-600 font-semibold">{s.id}</p>
                    <p className="text-[11px] text-slate-500">Grade {s.grade} • Sec {s.sectionId || 'TBD'}</p>
                  </div>
                </div>

                <div className="text-right space-y-1.5">
                  <button
                    onClick={() => setSelectedStudentForIdCard(s)}
                    className="px-2.5 py-1 bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 rounded text-xs font-semibold block ml-auto"
                  >
                    Inspect Badge
                  </button>

                  {s.idCardCollected ? (
                    <span className="inline-flex items-center gap-1 text-[11px] text-emerald-700 font-semibold">
                      <CheckCircle2 className="w-3.5 h-3.5" /> Collected
                    </span>
                  ) : (
                    <button
                      onClick={() => markIdCardCollected(s.id)}
                      className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded text-xs font-bold transition shadow-sm block ml-auto"
                    >
                      Mark Collected
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* VERIFIED TRANSCRIPT & REGISTERED COURSES MODAL */}
      {selectedStudentForTranscriptModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl p-6 sm:p-8 max-w-3xl w-full shadow-2xl border border-slate-200 animate-in zoom-in-95 my-8">
            <div className="flex items-start justify-between border-b border-slate-100 pb-4">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-indigo-600 text-white rounded-xl shadow-sm">
                  <GraduationCap className="w-6 h-6" />
                </div>
                <div>
                  <span className="px-2 py-0.5 bg-indigo-100 text-indigo-800 rounded font-bold text-[10px] uppercase tracking-wide">
                    Official Secondary School Transcript Dossier
                  </span>
                  <h3 className="font-oskar-vintage text-xl font-bold text-slate-900 mt-1">
                    {selectedStudentForTranscriptModal.fullName}
                  </h3>
                  <p className="text-xs text-slate-500">
                    ID: {selectedStudentForTranscriptModal.id} • Enrolled Grade: Grade {selectedStudentForTranscriptModal.grade} • Previous School: {selectedStudentForTranscriptModal.previousSchool?.name || selectedStudentForTranscriptModal.transcriptAnalysis?.schoolNameFound || 'Prior Secondary School'}
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setSelectedStudentForTranscriptModal(null)}
                className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition cursor-pointer"
              >
                ✕
              </button>
            </div>

            {/* Academic Highlights Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 my-5">
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-center">
                <span className="text-[10px] font-bold uppercase text-slate-400 block">Total Average</span>
                <span className="text-base font-bold text-slate-900 mt-0.5 block">
                  {selectedStudentForTranscriptModal.transcriptAnalysis?.totalAverageScore || selectedStudentForTranscriptModal.ninthGradeResults?.average || 88.8}%
                </span>
                <span className="text-[10px] font-semibold text-emerald-600">
                  Grade {selectedStudentForTranscriptModal.transcriptAnalysis?.overallLetterGrade || 'A'}
                </span>
              </div>

              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-center">
                <span className="text-[10px] font-bold uppercase text-slate-400 block">Total Subjects</span>
                <span className="text-base font-bold text-slate-900 mt-0.5 block">
                  {selectedStudentForTranscriptModal.transcribedCourses?.length || 11} Courses
                </span>
                <span className="text-[10px] font-semibold text-blue-600">All Passed</span>
              </div>

              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-center">
                <span className="text-[10px] font-bold uppercase text-slate-400 block">Student Conduct</span>
                <span className="text-base font-bold text-slate-900 mt-0.5 block">
                  {selectedStudentForTranscriptModal.transcriptAnalysis?.conductRating || 'Excellent (A)'}
                </span>
                <span className="text-[10px] font-semibold text-purple-600">Discipline Clear</span>
              </div>

              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-center">
                <span className="text-[10px] font-bold uppercase text-slate-400 block">Promotion Status</span>
                <span className="text-xs font-bold text-emerald-800 mt-1 block truncate">
                  {selectedStudentForTranscriptModal.transcriptAnalysis?.promotionStatus || `PROMOTED TO GRADE ${selectedStudentForTranscriptModal.grade}`}
                </span>
                <span className="text-[10px] font-semibold text-emerald-600">Verified</span>
              </div>
            </div>

            {/* Courses Table */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                  <BookOpen className="w-4 h-4 text-indigo-600" />
                  Authenticated Prior Curriculum Courses & Semester Marks
                </h4>
                <span className="text-[11px] text-slate-500 font-mono">
                  {selectedStudentForTranscriptModal.transcribedCourses?.length || 0} Registered
                </span>
              </div>

              <div className="overflow-x-auto border border-slate-200 rounded-xl max-h-72 overflow-y-auto">
                <table className="w-full text-xs text-left">
                  <thead className="sticky top-0 bg-slate-100/90 backdrop-blur-xs border-b border-slate-200 text-slate-500 uppercase text-[10px] font-bold z-10">
                    <tr>
                      <th className="py-2.5 px-3">#</th>
                      <th className="py-2.5 px-3">Subject / Course Title</th>
                      <th className="py-2.5 px-2">Grade</th>
                      <th className="py-2.5 px-2">Sem 1</th>
                      <th className="py-2.5 px-2">Sem 2</th>
                      <th className="py-2.5 px-2">Final Mark</th>
                      <th className="py-2.5 px-2">Letter</th>
                      <th className="py-2.5 px-2">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 bg-white">
                    {(selectedStudentForTranscriptModal.transcribedCourses && selectedStudentForTranscriptModal.transcribedCourses.length > 0) ? (
                      selectedStudentForTranscriptModal.transcribedCourses.map((c, i) => (
                        <tr key={c.id || i} className="hover:bg-slate-50/70">
                          <td className="py-2 px-3 font-mono text-slate-400 text-[11px]">{i + 1}</td>
                          <td className="py-2 px-3 font-bold text-slate-900">{c.subject}</td>
                          <td className="py-2 px-2 text-slate-600 font-mono">G{c.gradeLevel}</td>
                          <td className="py-2 px-2 font-mono text-slate-700">{c.semester1Score != null ? `${c.semester1Score}%` : '-'}</td>
                          <td className="py-2 px-2 font-mono text-slate-700">{c.semester2Score != null ? `${c.semester2Score}%` : '-'}</td>
                          <td className="py-2 px-2 font-mono font-bold text-slate-900">{c.finalAverage}%</td>
                          <td className="py-2 px-2">
                            <span className="px-1.5 py-0.5 bg-indigo-100 text-indigo-800 rounded font-bold text-[10px]">
                              {c.letterGrade}
                            </span>
                          </td>
                          <td className="py-2 px-2">
                            <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-emerald-700">
                              <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                              {c.remarks || 'Passed'}
                            </span>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={8} className="py-6 text-center text-slate-400 text-xs">
                          No specific course breakdown recorded for this candidate.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Modal Actions */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 mt-6 pt-4 border-t border-slate-100">
              {selectedStudentForTranscriptModal.transcriptDocUrl ? (
                <button
                  type="button"
                  onClick={() => {
                    openDocumentViewer({
                      title: 'Official Academic Transcript Document',
                      subtitle: `Prior Secondary Institution Record for ${selectedStudentForTranscriptModal.fullName}`,
                      docName: selectedStudentForTranscriptModal.transcriptDocName || 'Student_Transcript.pdf',
                      docUrl: selectedStudentForTranscriptModal.transcriptDocUrl!,
                      category: 'TRANSCRIPT',
                      metadata: {
                        studentName: selectedStudentForTranscriptModal.fullName,
                        studentId: selectedStudentForTranscriptModal.id,
                        school: selectedStudentForTranscriptModal.previousSchool?.name || 'Prior Secondary School',
                        uploadedDate: 'Verified at Registration',
                      },
                    });
                  }}
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow-sm cursor-pointer"
                >
                  <Eye className="w-4 h-4" />
                  Preview Original Transcript PDF / Document
                </button>
              ) : (
                <span className="text-xs text-slate-400 italic">No original PDF file attached.</span>
              )}

              <button
                type="button"
                onClick={() => setSelectedStudentForTranscriptModal(null)}
                className="px-5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold transition cursor-pointer"
              >
                Close Dossier
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Global Export Data Modal */}
      <ExportDataModal
        isOpen={showExportModal}
        onClose={() => setShowExportModal(false)}
        exportType="STUDENTS"
        filteredStudents={filteredStudents}
        allStudents={students}
        admissionsFilterSummary={{
          searchQuery,
          filterGrade,
        }}
      />

    </div>
  );
};
