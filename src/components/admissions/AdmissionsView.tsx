import React, { useState } from 'react';
import { useSchool } from '../../context/SchoolContext';
import { AcademicGrade, AcademicStream } from '../../types';
import { 
  generateOfficialCertificatePdf, 
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
  Sparkles
} from 'lucide-react';

export const AdmissionsView: React.FC = () => {
  const { 
    students, 
    registerStudent, 
    setSelectedStudentForIdCard, 
    schoolName,
    reviewStreamChangeRequest, 
    resetUserPassword,
    markIdCardCollected,
    openDocumentViewer
  } = useSchool();

  const [activeTab, setActiveTab] = useState<'REGISTER' | 'STUDENT_LIST' | 'STREAM_REQUESTS' | 'ID_COLLECTION'>('REGISTER');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterGrade, setFilterGrade] = useState<string>('ALL');
  
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
  const [eighthGradeCertAttached, setEighthGradeCertAttached] = useState(true);
  const [certFileName, setCertFileName] = useState<string>('8th_grade_ministry_certificate.pdf');
  const [certDataUrl, setCertDataUrl] = useState<string>('');
  const [entranceExamScore, setEntranceExamScore] = useState<string>('');
  
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

    const finalCertUrl = certDataUrl || generateOfficialCertificatePdf({
      studentName: fullName || 'Enrolled Student',
      studentId: `OSK-${new Date().getFullYear()}-0${selectedGrade}99`,
      grade: selectedGrade,
      schoolName,
      examScore: entranceExamScore ? parseFloat(entranceExamScore) : 89.5,
    });

    const createdStudent = registerStudent({
      fullName,
      gender,
      dob,
      grade: selectedGrade,
      stream: selectedGrade >= 11 ? selectedStream : null,
      sectionId: null,
      eighthGradeCertAttached: true,
      certificateDocName: certFileName || '8th_grade_ministry_certificate.pdf',
      certificateDocUrl: finalCertUrl,
      entranceExamScore: entranceExamScore ? parseFloat(entranceExamScore) : null,
      ninthGradeResults: g9Results,
      tenthGradeResults: g10Results,
      eleventhGradeResults: g11Results,
      photoUrl,
      previousSchool: {
        name: isSameSchool ? schoolName : previousSchoolName,
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
  };

  // Filter students
  const filteredStudents = students.filter(s => {
    const matchesSearch = s.fullName.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          s.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          s.accountNumber.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesGrade = filterGrade === 'ALL' || s.grade.toString() === filterGrade;
    return matchesSearch && matchesGrade;
  });

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
      </div>

      {/* TAB 1: REGISTRATION FORM */}
      {activeTab === 'REGISTER' && (
        <form onSubmit={handleSubmitRegistration} className="bg-white rounded-2xl p-6 sm:p-8 shadow-sm border border-slate-200 space-y-8">
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
                  placeholder="e.g. Almaz Bekele Tadesse"
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
                    {certFileName}
                  </span>
                  <span className="text-[11px] text-slate-400 mt-1">
                    Click to browse device or drag and drop certificate
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

              {/* Instant PDF Generation & Preview Box */}
              <div className="p-4 bg-blue-50/60 rounded-xl border border-blue-200 flex flex-col justify-between space-y-3">
                <div>
                  <div className="flex items-center gap-1.5 text-blue-900 font-bold text-xs">
                    <Sparkles className="w-4 h-4 text-blue-600" />
                    <span>Generate Official Ministry Certificate PDF</span>
                  </div>
                  <p className="text-[11px] text-blue-800/80 mt-1 leading-relaxed">
                    Instantly compile an official Ministry of Education & Regional Examination Board Grade 8 Certificate with serial credentials, scores, and watermark seal.
                  </p>
                </div>

                <div className="flex flex-wrap gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => {
                      const generated = generateOfficialCertificatePdf({
                        studentName: fullName || 'New Enrolling Candidate',
                        studentId: `MOE-8TH-${Math.floor(100000 + Math.random() * 900000)}`,
                        grade: selectedGrade,
                        schoolName,
                        examScore: entranceExamScore ? parseFloat(entranceExamScore) : 91.2,
                      });
                      setCertDataUrl(generated);
                      setCertFileName(`${(fullName || 'student').replace(/\s+/g, '_')}_8th_Grade_Certificate.pdf`);
                      setEighthGradeCertAttached(true);
                    }}
                    className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold transition shadow-sm flex items-center gap-1.5"
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    Generate Authentic PDF
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      const targetUrl = certDataUrl || generateOfficialCertificatePdf({
                        studentName: fullName || 'Preview Candidate',
                        studentId: 'MOE-PREVIEW-01',
                        grade: selectedGrade,
                        schoolName,
                        examScore: entranceExamScore ? parseFloat(entranceExamScore) : 89.4,
                      });
                      openDocumentViewer({
                        title: 'Official Ministry 8th Grade Certificate',
                        subtitle: `Academic Prerequisite Record for ${fullName || 'New Student'}`,
                        docName: certFileName,
                        docUrl: targetUrl,
                        category: 'CERTIFICATE',
                        metadata: {
                          studentName: fullName || 'Enrolling Scholar',
                          referenceNumber: 'MOE-REG-8TH-CERT',
                          uploadedDate: new Date().toISOString().split('T')[0],
                        },
                      });
                    }}
                    className="px-3 py-1.5 bg-white border border-blue-300 hover:bg-blue-100/50 text-blue-700 rounded-lg text-xs font-bold transition flex items-center gap-1.5"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    Preview in Portal
                  </button>
                </div>
              </div>
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

          {/* Grade 10, 11, 12: Manual Results Insertion */}
          {selectedGrade >= 10 && (
            <div className="p-5 bg-amber-50/50 rounded-xl border border-amber-200 space-y-4">
              <div className="flex items-center gap-2">
                <BadgeCheck className="w-4 h-4 text-amber-700" />
                <h4 className="text-xs font-bold uppercase tracking-wider text-amber-950">
                  Manual Academic Results Verification
                </h4>
              </div>

              {/* 9th Grade Results (For 10, 11, 12) */}
              <div>
                <p className="text-xs font-semibold text-slate-800 mb-2">
                  9th Grade Official Results (Required for Grade 10, 11, 12):
                </p>
                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="text-[11px] text-slate-600 block">Math Score (/100) *</label>
                    <input
                      type="number"
                      min="0"
                      max="100"
                      required={selectedGrade >= 10}
                      value={g9Math}
                      onChange={(e) => setG9Math(e.target.value)}
                      className="w-full px-2 py-1.5 border border-slate-300 rounded text-xs bg-white"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] text-slate-600 block">English Score (/100) *</label>
                    <input
                      type="number"
                      min="0"
                      max="100"
                      required={selectedGrade >= 10}
                      value={g9English}
                      onChange={(e) => setG9English(e.target.value)}
                      className="w-full px-2 py-1.5 border border-slate-300 rounded text-xs bg-white"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] text-slate-600 block">General Science (/100) *</label>
                    <input
                      type="number"
                      min="0"
                      max="100"
                      required={selectedGrade >= 10}
                      value={g9Science}
                      onChange={(e) => setG9Science(e.target.value)}
                      className="w-full px-2 py-1.5 border border-slate-300 rounded text-xs bg-white"
                    />
                  </div>
                </div>
              </div>

              {/* 10th Grade Results (For 11, 12) */}
              {selectedGrade >= 11 && (
                <div className="pt-3 border-t border-amber-200">
                  <p className="text-xs font-semibold text-slate-800 mb-2">
                    10th Grade Official Results (Required for Grade 11, 12):
                  </p>
                  <div className="grid grid-cols-3 gap-3">
                    <div>
                      <label className="text-[11px] text-slate-600 block">Math Score (/100) *</label>
                      <input
                        type="number"
                        min="0"
                        max="100"
                        required={selectedGrade >= 11}
                        value={g10Math}
                        onChange={(e) => setG10Math(e.target.value)}
                        className="w-full px-2 py-1.5 border border-slate-300 rounded text-xs bg-white"
                      />
                    </div>
                    <div>
                      <label className="text-[11px] text-slate-600 block">English Score (/100) *</label>
                      <input
                        type="number"
                        min="0"
                        max="100"
                        required={selectedGrade >= 11}
                        value={g10English}
                        onChange={(e) => setG10English(e.target.value)}
                        className="w-full px-2 py-1.5 border border-slate-300 rounded text-xs bg-white"
                      />
                    </div>
                    <div>
                      <label className="text-[11px] text-slate-600 block">Natural/Social Sc (/100) *</label>
                      <input
                        type="number"
                        min="0"
                        max="100"
                        required={selectedGrade >= 11}
                        value={g10Science}
                        onChange={(e) => setG10Science(e.target.value)}
                        className="w-full px-2 py-1.5 border border-slate-300 rounded text-xs bg-white"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* 11th Grade Results (For 12) */}
              {selectedGrade >= 12 && (
                <div className="pt-3 border-t border-amber-200">
                  <p className="text-xs font-semibold text-slate-800 mb-2">
                    11th Grade Results (Required for Senior Grade 12):
                  </p>
                  <div className="grid grid-cols-3 gap-3">
                    <div>
                      <label className="text-[11px] text-slate-600 block">Math (/100) *</label>
                      <input
                        type="number"
                        min="0"
                        max="100"
                        required={selectedGrade >= 12}
                        value={g11Math}
                        onChange={(e) => setG11Math(e.target.value)}
                        className="w-full px-2 py-1.5 border border-slate-300 rounded text-xs bg-white"
                      />
                    </div>
                    <div>
                      <label className="text-[11px] text-slate-600 block">Major 1 (Physics/History) *</label>
                      <input
                        type="number"
                        min="0"
                        max="100"
                        required={selectedGrade >= 12}
                        value={g11Major1}
                        onChange={(e) => setG11Major1(e.target.value)}
                        className="w-full px-2 py-1.5 border border-slate-300 rounded text-xs bg-white"
                      />
                    </div>
                    <div>
                      <label className="text-[11px] text-slate-600 block">Major 2 (Chemistry/Geog) *</label>
                      <input
                        type="number"
                        min="0"
                        max="100"
                        required={selectedGrade >= 12}
                        value={g11Major2}
                        onChange={(e) => setG11Major2(e.target.value)}
                        className="w-full px-2 py-1.5 border border-slate-300 rounded text-xs bg-white"
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Parents / Guardians Full Name & Phone Numbers & Addresses */}
          <div className="space-y-4">
            <h3 className="font-oskar-vintage text-lg font-bold text-slate-900 tracking-wider">
              4. Parents / Guardians Information
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
          <div className="pt-4 border-t border-slate-200 flex items-center justify-between">
            <p className="text-xs text-slate-500">
              Upon registration: Auto-generates ID badge, temporary student & parent credentials, and finance tuition account.
            </p>
            <button
              type="submit"
              className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-md shadow-blue-600/30 flex items-center gap-2 cursor-pointer transition"
            >
              <UserPlus className="w-4 h-4" />
              Complete Registration & Generate ID
            </button>
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
              <div className="flex justify-between">
                <span className="text-slate-500">Scholar Profile:</span>
                <span className="font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">Active & Enrolled</span>
              </div>
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

            <div className="flex items-center gap-2 self-end">
              <span className="text-xs text-slate-500 font-medium">Filter Grade:</span>
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

                    <td className="py-3 px-3 text-right space-y-1">
                      <button
                        onClick={() => setSelectedStudentForIdCard(s)}
                        className="px-2.5 py-1 bg-slate-100 hover:bg-blue-50 text-blue-700 hover:text-blue-800 rounded font-semibold text-[11px] transition block ml-auto"
                      >
                        ID Card
                      </button>
                      <button
                        onClick={() => {
                          const docUrl = s.certificateDocUrl || generateOfficialCertificatePdf({
                            studentName: s.fullName,
                            studentId: s.id,
                            grade: s.grade,
                            schoolName,
                            examScore: s.entranceExamScore || 89.4,
                          });
                          openDocumentViewer({
                            title: 'Official Ministry 8th Grade Certificate',
                            subtitle: `Verified Registration Record for ${s.fullName}`,
                            docName: s.certificateDocName || `${s.id}_8th_Grade_Certificate.pdf`,
                            docUrl: docUrl,
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

    </div>
  );
};
