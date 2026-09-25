import React, { useState } from 'react';
import { useSchool } from '../../../context/SchoolContext';
import { AcademicGrade, AcademicStream, Student } from '../../../types';
import { 
  X, 
  UserPlus, 
  CheckCircle2, 
  AlertCircle, 
  CreditCard, 
  ArrowRight,
  ExternalLink,
  ShieldCheck,
  RotateCcw,
  Sparkles,
  ShieldAlert,
  Mail
} from 'lucide-react';
import { generateCredentialsMailtoUrl } from '../../../services/gmailAuthService';

interface QuickRegisterModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const QuickRegisterModal: React.FC<QuickRegisterModalProps> = ({ isOpen, onClose }) => {
  const { 
    registerStudent, 
    setSelectedStudentForIdCard, 
    setCurrentRole,
    students,
    schoolName 
  } = useSchool();

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

  // Emergency Contact (Requires at least 2 distinct phone numbers)
  const [emergencyName, setEmergencyName] = useState('');
  const [emergencyRelationship, setEmergencyRelationship] = useState('Guardian / Uncle');
  const [emergencyPhone1, setEmergencyPhone1] = useState('');
  const [emergencyPhone2, setEmergencyPhone2] = useState('');

  // 8th Grade Certificate
  const [eighthGradeCertAttached, setEighthGradeCertAttached] = useState(true);
  const [entranceScore, setEntranceScore] = useState<number>(88);

  // Success State
  const [registeredStudent, setRegisteredStudent] = useState<Student | null>(null);
  const [validationError, setValidationError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleResetForm = () => {
    setFullName('');
    setFatherName('');
    setFatherPhone('');
    setMotherName('');
    setMotherPhone('');
    setParentEmail('');
    setEmergencyName('');
    setEmergencyPhone1('');
    setEmergencyPhone2('');
    setPreviousSchoolName('');
    setRegisteredStudent(null);
    setValidationError(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setValidationError(null);

    if (!fullName.trim()) {
      setValidationError('Student full name is strictly required.');
      return;
    }

    if (!eighthGradeCertAttached) {
      setValidationError('Institutional policy mandates verification of 8th Grade Certificate.');
      return;
    }

    if (!emergencyPhone1.trim() || !emergencyPhone2.trim()) {
      setValidationError('Mandatory Safety Policy: At least 2 distinct emergency telephone numbers are required.');
      return;
    }

    if (emergencyPhone1.trim() === emergencyPhone2.trim()) {
      setValidationError('The two emergency contact numbers must be distinct.');
      return;
    }

    try {
      const newStudent = registerStudent({
        fullName: fullName.trim(),
        gender,
        dob,
        grade: selectedGrade,
        stream: (selectedGrade === 11 || selectedGrade === 12) ? selectedStream : null,
        eighthGradeCertAttached: true,
        certificateDocName: `${fullName.trim().replace(/\s+/g, '_')}_8th_Cert.pdf`,
        certificateDocUrl: 'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?auto=format&fit=crop&q=80&w=400',
        entranceExamScore: selectedGrade === 9 ? entranceScore : null,
        photoUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=300',
        previousSchool: {
          name: isSameSchool ? 'Academy of Excellence (Continuing Scholar)' : (previousSchoolName.trim() || 'St. George Secondary School'),
          isSameSchool,
        },
        parents: {
          father: {
            fullName: fatherName.trim() || 'Ato ' + fullName.split(' ')[1] || 'Parent',
            phone: fatherPhone.trim() || '+251 91 123 4567',
            email: parentEmail.trim() || undefined,
          },
          mother: {
            fullName: motherName.trim() || 'W/ro ' + fullName.split(' ')[0] + ' Mother',
            phone: motherPhone.trim() || '+251 92 234 5678',
          },
          email: parentEmail.trim() || `${fullName.toLowerCase().replace(/\s+/g, '.')}.family@gmail.com`,
          homeAddress: 'Bole Subcity, Woreda 03, Addis Ababa',
          workAddress: 'Central Commercial Center, Floor 4',
        },
        emergencyContact: {
          name: emergencyName.trim() || fatherName.trim() || 'Primary Guardian',
          relationship: emergencyRelationship,
          phone1: emergencyPhone1.trim(),
          phone2: emergencyPhone2.trim(),
        },
      });

      setRegisteredStudent(newStudent);
    } catch (err: any) {
      setValidationError(err?.message || 'Failed to complete student registration.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl max-w-2xl w-full overflow-hidden border border-slate-200 dark:border-slate-800 animate-in fade-in zoom-in-95 duration-200 my-8">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/60">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-600/10 text-blue-600 dark:bg-blue-500/20 dark:text-blue-400 flex items-center justify-center">
              <UserPlus className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-slate-900 dark:text-white text-base">
                  Quick Student Registration
                </h3>
                <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-blue-100 dark:bg-blue-900/60 text-blue-800 dark:text-blue-300 border border-blue-200 dark:border-blue-700/50">
                  Admissions FAB
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Instant enrollment with automatic student ID & tuition billing generation
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 rounded-lg hover:bg-slate-200/60 dark:hover:bg-slate-800 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 max-h-[75vh] overflow-y-auto">
          {registeredStudent ? (
            /* Registration Success Card */
            <div className="space-y-6 text-center py-4">
              <div className="w-16 h-16 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto border-4 border-emerald-50 dark:border-emerald-900/40">
                <CheckCircle2 className="w-9 h-9" />
              </div>

              <div className="space-y-1">
                <h4 className="text-xl font-bold text-slate-900 dark:text-white">
                  Student Successfully Registered!
                </h4>
                <p className="text-xs text-slate-500 dark:text-slate-400 max-w-md mx-auto">
                  Official enrollment record created. Student credentials and Term 1 registration invoice have been automatically generated.
                </p>
              </div>

              {/* Student Details Grid */}
              <div className="bg-slate-50 dark:bg-slate-800/60 rounded-xl p-4 border border-slate-200 dark:border-slate-700 text-left text-xs space-y-3 max-w-lg mx-auto">
                <div className="flex justify-between items-center pb-2 border-b border-slate-200 dark:border-slate-700">
                  <span className="text-slate-500 dark:text-slate-400">Student Name:</span>
                  <span className="font-bold text-slate-900 dark:text-white text-sm">{registeredStudent.fullName}</span>
                </div>
                <div className="flex justify-between items-center pb-2 border-b border-slate-200 dark:border-slate-700">
                  <span className="text-slate-500 dark:text-slate-400">System Student ID:</span>
                  <span className="font-mono font-bold text-blue-600 dark:text-blue-400">{registeredStudent.id}</span>
                </div>
                <div className="flex justify-between items-center pb-2 border-b border-slate-200 dark:border-slate-700">
                  <span className="text-slate-500 dark:text-slate-400">Account / Roll Number:</span>
                  <span className="font-mono font-bold text-slate-700 dark:text-slate-300">{registeredStudent.accountNumber}</span>
                </div>
                <div className="flex justify-between items-center pb-2 border-b border-slate-200 dark:border-slate-700">
                  <span className="text-slate-500 dark:text-slate-400">Grade & Stream:</span>
                  <span className="font-semibold text-slate-800 dark:text-slate-200">
                    Grade {registeredStudent.grade} {registeredStudent.stream ? `• ${registeredStudent.stream}` : ''}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-500 dark:text-slate-400">Initial Temporary Password:</span>
                  <div className="flex items-center gap-1.5">
                    <span className="font-mono bg-amber-100 dark:bg-amber-950/80 text-amber-900 dark:text-amber-200 px-2 py-0.5 rounded font-bold">
                      {registeredStudent.temporaryPassword || 'Temp#123456'}
                    </span>
                    <span className="text-[10px] uppercase font-bold px-1.5 py-0.5 rounded bg-rose-100 text-rose-800 border border-rose-200">
                      Must Be Changed
                    </span>
                  </div>
                </div>
              </div>

              {/* Mandatory Password Change Security Notice */}
              <div className="p-3 rounded-xl bg-amber-50/80 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 text-[11px] text-amber-900 dark:text-amber-200 flex items-start gap-2.5">
                <ShieldAlert className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
                <p>
                  <strong>Mandatory Security Notice:</strong> This is a temporary login password. The student/parent is strictly required to request and create a new personal permanent password upon first login (Must be changed).
                </p>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
                {registeredStudent.parents?.email && (
                  <a
                    href={generateCredentialsMailtoUrl({
                      recipientEmail: registeredStudent.parents.email,
                      recipientName: registeredStudent.parents.fatherName || registeredStudent.parents.motherName || registeredStudent.fullName,
                      roleName: 'STUDENT',
                      positionTitle: `Grade ${registeredStudent.grade} Scholar`,
                      tempPassword: registeredStudent.temporaryPassword || 'Temp#123456',
                      schoolName,
                    })}
                    className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition shadow-sm"
                    title="Send temporary login credentials email to parent"
                  >
                    <Mail className="w-4 h-4" />
                    <span>Email Temporary Credentials</span>
                  </a>
                )}

                <button
                  type="button"
                  onClick={() => {
                    setSelectedStudentForIdCard(registeredStudent);
                    onClose();
                  }}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition shadow-sm cursor-pointer"
                >
                  <CreditCard className="w-4 h-4" />
                  <span>Preview Student ID Card</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setCurrentRole('REGISTRAR');
                    onClose();
                  }}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-xl text-xs font-bold flex items-center gap-1.5 transition cursor-pointer"
                >
                  <ExternalLink className="w-4 h-4" />
                  <span>Go to Admissions Workspace</span>
                </button>

                <button
                  type="button"
                  onClick={handleResetForm}
                  className="px-4 py-2 text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Register Another Student</span>
                </button>
              </div>
            </div>
          ) : (
            /* Registration Form */
            <form onSubmit={handleSubmit} className="space-y-4">
              {validationError && (
                <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{validationError}</span>
                </div>
              )}

              {/* Student Identity */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div className="sm:col-span-2">
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Student Full Name <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="e.g. Abraham Kebede Haile"
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Enrollment Grade <span className="text-rose-500">*</span>
                  </label>
                  <select
                    value={selectedGrade}
                    onChange={(e) => setSelectedGrade(parseInt(e.target.value) as AcademicGrade)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none"
                  >
                    <option value={9}>Grade 9 (Freshman)</option>
                    <option value={10}>Grade 10 (Sophomore)</option>
                    <option value={11}>Grade 11 (Junior • Stream Specific)</option>
                    <option value={12}>Grade 12 (Senior • Stream Specific)</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Gender
                  </label>
                  <select
                    value={gender}
                    onChange={(e) => setGender(e.target.value as any)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none"
                  >
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                {(selectedGrade === 11 || selectedGrade === 12) && (
                  <div className="sm:col-span-2">
                    <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                      Academic Stream <span className="text-rose-500">*</span>
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        type="button"
                        onClick={() => setSelectedStream('Natural Sciences')}
                        className={`p-2.5 rounded-xl border text-xs font-semibold text-left transition cursor-pointer ${
                          selectedStream === 'Natural Sciences'
                            ? 'bg-blue-50 border-blue-500 text-blue-900 dark:bg-blue-950/60 dark:border-blue-400 dark:text-blue-200'
                            : 'bg-slate-50 border-slate-200 dark:bg-slate-800 dark:border-slate-700 text-slate-600 dark:text-slate-400'
                        }`}
                      >
                        🧬 Natural Sciences
                      </button>
                      <button
                        type="button"
                        onClick={() => setSelectedStream('Social Sciences')}
                        className={`p-2.5 rounded-xl border text-xs font-semibold text-left transition cursor-pointer ${
                          selectedStream === 'Social Sciences'
                            ? 'bg-purple-50 border-purple-500 text-purple-900 dark:bg-purple-950/60 dark:border-purple-400 dark:text-purple-200'
                            : 'bg-slate-50 border-slate-200 dark:bg-slate-800 dark:border-slate-700 text-slate-600 dark:text-slate-400'
                        }`}
                      >
                        🏛️ Social Sciences
                      </button>
                    </div>
                  </div>
                )}

                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Date of Birth
                  </label>
                  <input
                    type="date"
                    value={dob}
                    onChange={(e) => setDob(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Previous School
                  </label>
                  <input
                    type="text"
                    value={previousSchoolName}
                    onChange={(e) => setPreviousSchoolName(e.target.value)}
                    placeholder="e.g. St. George School"
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                </div>
              </div>

              {/* Parents & Emergency Contacts */}
              <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
                <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider block mb-2">
                  Guardian & Safety Contact Protocol
                </span>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div>
                    <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                      Father / Primary Guardian Name
                    </label>
                    <input
                      type="text"
                      value={fatherName}
                      onChange={(e) => setFatherName(e.target.value)}
                      placeholder="e.g. Ato Kebede Haile"
                      className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white outline-none"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                      Parent Email Address
                    </label>
                    <input
                      type="email"
                      value={parentEmail}
                      onChange={(e) => setParentEmail(e.target.value)}
                      placeholder="parent@example.com"
                      className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white outline-none"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                      Emergency Phone 1 <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="tel"
                      required
                      value={emergencyPhone1}
                      onChange={(e) => setEmergencyPhone1(e.target.value)}
                      placeholder="+251 91 100 2233"
                      className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white outline-none"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                      Emergency Phone 2 <span className="text-rose-500">* (Distinct)</span>
                    </label>
                    <input
                      type="tel"
                      required
                      value={emergencyPhone2}
                      onChange={(e) => setEmergencyPhone2(e.target.value)}
                      placeholder="+251 92 200 4455"
                      className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white outline-none"
                    />
                  </div>
                </div>
              </div>

              {/* Policy Check */}
              <div className="p-3 rounded-xl bg-amber-50/60 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 text-xs flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0" />
                  <span className="text-slate-700 dark:text-slate-300">
                    8th Grade Ministry Certificate Verified & On File
                  </span>
                </div>
                <input
                  type="checkbox"
                  checked={eighthGradeCertAttached}
                  onChange={(e) => setEighthGradeCertAttached(e.target.checked)}
                  className="rounded text-blue-600 w-4 h-4 cursor-pointer"
                />
              </div>

              {/* Submit Buttons */}
              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 font-semibold text-xs transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs flex items-center gap-2 transition shadow-sm cursor-pointer"
                >
                  <UserPlus className="w-4 h-4" />
                  <span>Enroll & Generate Credentials</span>
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
