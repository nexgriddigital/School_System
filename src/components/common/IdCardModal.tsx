import React, { useRef } from 'react';
import { Student } from '../../types';
import { Download, Printer, X, ShieldCheck, AlertCircle } from 'lucide-react';
import { useSchool } from '../../context/SchoolContext';
import { SchoolMascotLogo } from './SchoolMascotLogo';

interface IdCardModalProps {
  student?: Student | null;
  onClose?: () => void;
}

export const IdCardModal: React.FC<IdCardModalProps> = ({ student: propStudent, onClose: propOnClose }) => {
  const { 
    schoolName,
    currentRole, 
    principalOverrideLostIdDownload, 
    markIdCardCollected,
    selectedStudentForIdCard,
    setSelectedStudentForIdCard 
  } = useSchool();
  const cardRef = useRef<HTMLDivElement>(null);

  const student = propStudent || selectedStudentForIdCard;
  const onClose = propOnClose || (() => setSelectedStudentForIdCard(null));

  if (!student) {
    return null;
  }

  // Clearance check:
  // "if the student loses his/her ID, finance must give them Clearance in the finance portal after which The ID becomes Downloadable (The principal has the authority to override this and Download the ID at any time.)"
  const isLostAndPending = student.lostIdRequest && 
    student.lostIdRequest.status !== 'PAID_READY_DOWNLOAD' && 
    student.lostIdRequest.status !== 'COLLECTED' && 
    !student.lostIdRequest.principalOverride;

  const canDownload = !isLostAndPending || currentRole === 'PRINCIPAL';

  // Export card as PNG using HTML Canvas
  const handleDownloadImage = () => {
    if (!canDownload) return;
    
    // Create an offscreen canvas to render the ID card sharply
    const canvas = document.createElement('canvas');
    canvas.width = 650;
    canvas.height = 1000;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Background gradient
    const grad = ctx.createLinearGradient(0, 0, 0, 1000);
    grad.addColorStop(0, '#0F172A');
    grad.addColorStop(0.28, '#1E293B');
    grad.addColorStop(0.28, '#FFFFFF');
    grad.addColorStop(1, '#F8FAFC');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 650, 1000);

    // Accent line
    ctx.fillStyle = '#2563EB';
    ctx.fillRect(0, 275, 650, 6);

    // Header text
    ctx.fillStyle = '#FFFFFF';
    ctx.font = 'bold 36px "Big Shoulders Display", "Josefin Sans", "Syne", sans-serif';
    ctx.textAlign = 'center';
    ctx.letterSpacing = '6px';
    ctx.fillText((schoolName || 'ACADEMY').toUpperCase(), 325, 65);

    ctx.font = '500 16px "Plus Jakarta Sans", sans-serif';
    ctx.fillStyle = '#94A3B8';
    ctx.letterSpacing = '2px';
    ctx.fillText('OFFICIAL STUDENT IDENTIFICATION', 325, 95);

    // Photo placeholder / border
    ctx.fillStyle = '#E2E8F0';
    ctx.fillRect(200, 140, 250, 310);
    ctx.lineWidth = 6;
    ctx.strokeStyle = '#FFFFFF';
    ctx.strokeRect(200, 140, 250, 310);

    // Student Info
    ctx.fillStyle = '#0F172A';
    ctx.textAlign = 'center';
    ctx.font = 'bold 28px "Plus Jakarta Sans", sans-serif';
    ctx.letterSpacing = '0.5px';
    ctx.fillText(student.fullName, 325, 500);

    ctx.font = 'bold 18px "Josefin Sans", monospace';
    ctx.fillStyle = '#2563EB';
    ctx.letterSpacing = '3px';
    ctx.fillText(student.id, 325, 535);

    // Details Grid
    ctx.textAlign = 'left';
    ctx.font = 'bold 14px "Plus Jakarta Sans", sans-serif';
    ctx.fillStyle = '#64748B';
    
    ctx.fillText('GRADE LEVEL:', 80, 600);
    ctx.fillText('FEE ACCOUNT NO:', 80, 640);
    ctx.fillText('ACADEMIC STREAM:', 80, 680);
    ctx.fillText('EMERGENCY PHONE:', 80, 720);
    ctx.fillText('DATE OF BIRTH:', 80, 760);

    ctx.fillStyle = '#0F172A';
    ctx.font = '600 15px "Plus Jakarta Sans", sans-serif';
    ctx.fillText(`Grade ${student.grade}${student.sectionId ? ` (Section ${student.sectionId})` : ''}`, 260, 600);
    ctx.fillText(student.accountNumber, 260, 640);
    ctx.fillText(student.stream || 'General Curriculum', 260, 680);
    ctx.fillText(student.emergencyContact.phone1, 260, 720);
    ctx.fillText(student.dob, 260, 760);

    // Bottom barcode decoration
    ctx.fillStyle = '#0F172A';
    for (let x = 120; x < 530; x += 6) {
      const w = ((x * 17) % 5 === 0) ? 3 : 1.5;
      ctx.fillRect(x, 820, w, 45);
    }

    ctx.textAlign = 'center';
    ctx.font = '12px monospace';
    ctx.fillStyle = '#64748B';
    ctx.fillText(`* ${student.id} *`, 325, 885);

    // School Seal Badge text
    ctx.font = '11px "Plus Jakarta Sans", sans-serif';
    ctx.fillStyle = '#94A3B8';
    ctx.fillText('This card is property of Oskar Academy. Must be presented upon request.', 325, 940);
    ctx.fillText('If found, return to Registrar Office or call +251 11 551 2026', 325, 960);

    // Trigger download
    const dataUrl = canvas.toDataURL('image/png');
    const link = document.createElement('a');
    link.download = `Student_ID_${student.id}_${student.fullName.replace(/\s+/g, '_')}.png`;
    link.href = dataUrl;
    link.click();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full overflow-hidden border border-slate-200 animate-in fade-in zoom-in-95 duration-200">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50">
          <div>
            <h3 className="font-oskar-vintage text-base font-bold text-slate-900 tracking-wider">
              Student Official ID Card
            </h3>
            <p className="text-xs text-slate-500">Auto-Generated Badge with 3x4 Photo & Security Credentials</p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-200/60 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Clearance Warning if Lost and unapproved */}
        {isLostAndPending && (
          <div className="bg-amber-50 border-b border-amber-200 p-4 text-xs text-amber-900 flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold">ID Download Restricted (Lost ID Clearance in Progress)</p>
              <p className="mt-1">
                Student reported this ID lost. Download is blocked until Finance, Library, and Homeroom clearances are finalized and the 500 ETB fee is paid.
              </p>
              {currentRole === 'PRINCIPAL' && (
                <div className="mt-2 pt-2 border-t border-amber-200/80 flex items-center justify-between">
                  <span className="text-[11px] font-medium text-amber-800">
                    Principal Authority: Override clearance & enable download immediately?
                  </span>
                  <button
                    onClick={() => principalOverrideLostIdDownload(student.id)}
                    className="px-2.5 py-1 bg-amber-600 text-white rounded text-[11px] font-semibold hover:bg-amber-700 transition"
                  >
                    Principal Override
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ID Card Visual */}
        <div className="p-6 flex justify-center bg-slate-100/70">
          <div 
            ref={cardRef}
            className="w-80 rounded-2xl bg-white shadow-xl overflow-hidden border-2 border-slate-300 relative text-slate-800"
          >
            {/* ID Header */}
            <div className="bg-[#0B192C] text-white pt-4 pb-3 px-4 text-center relative">
              <div className="flex items-center justify-center gap-2 mb-1">
                <SchoolMascotLogo size="xs" />
                <span className="inline-block px-2 py-0.5 bg-blue-600/30 border border-blue-400/40 rounded-full text-[10px] tracking-widest text-blue-200 font-mono uppercase">
                  Academic Year 2026/27
                </span>
              </div>
              <h2 className="font-oskar-vintage text-lg font-bold tracking-widest text-white">
                {(schoolName || 'ACADEMY').toUpperCase()}
              </h2>
              <p className="text-[10px] tracking-wider text-slate-300 uppercase font-medium">
                High School Student Badge
              </p>
              <div className="h-1 w-full bg-blue-600 absolute bottom-0 left-0" />
            </div>

            {/* Photo & Badge Body */}
            <div className="p-5 flex flex-col items-center">
              {/* 3x4 Aspect Ratio Photo Box */}
              <div className="w-28 h-36 rounded-lg overflow-hidden border-2 border-slate-300 shadow-md bg-slate-200 mb-3 relative group">
                <img 
                  src={student.photoUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400'} 
                  alt={student.fullName}
                  className="w-full h-full object-cover"
                />
                <div className="absolute bottom-0 inset-x-0 bg-black/60 text-[9px] text-center text-white py-0.5 tracking-tight">
                  3×4 CM REGULATION
                </div>
              </div>

              {/* Student Name & ID */}
              <h3 className="font-bold text-base text-slate-900 text-center leading-snug">
                {student.fullName}
              </h3>
              <div className="font-mono text-xs font-bold text-blue-600 tracking-wider mt-0.5">
                {student.id}
              </div>

              {/* Badges */}
              <div className="flex gap-1.5 mt-2 flex-wrap justify-center">
                <span className="px-2 py-0.5 bg-slate-100 border border-slate-200 rounded text-[11px] font-semibold text-slate-700">
                  Grade {student.grade}
                </span>
                {student.sectionId && (
                  <span className="px-2 py-0.5 bg-blue-50 border border-blue-200 rounded text-[11px] font-semibold text-blue-700">
                    Sec {student.sectionId}
                  </span>
                )}
                {student.stream && (
                  <span className="px-2 py-0.5 bg-emerald-50 border border-emerald-200 rounded text-[11px] font-semibold text-emerald-800">
                    {student.stream === 'Natural Sciences' ? 'NAT-SCI' : 'SOC-SCI'}
                  </span>
                )}
              </div>

              {/* Details table */}
              <div className="w-full border-t border-slate-200 mt-4 pt-3 text-[11px] space-y-1.5 text-slate-600">
                <div className="flex justify-between">
                  <span className="text-slate-400">Fee Account:</span>
                  <span className="font-mono font-semibold text-slate-800">{student.accountNumber}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Emergency Phone:</span>
                  <span className="font-semibold text-slate-800">{student.emergencyContact.phone1}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Emergency Contact:</span>
                  <span className="truncate max-w-[150px] font-medium text-slate-800">{student.emergencyContact.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Status:</span>
                  <span className="font-semibold text-emerald-600 flex items-center gap-1">
                    <ShieldCheck className="w-3 h-3" /> Registered & Verified
                  </span>
                </div>
              </div>

              {/* Barcode representation */}
              <div className="w-full mt-4 pt-2 border-t border-dashed border-slate-200 text-center">
                <div className="h-7 w-48 mx-auto flex items-center justify-between px-1">
                  {Array.from({ length: 42 }).map((_, i) => (
                    <div 
                      key={i} 
                      className={`bg-slate-800 h-full ${i % 3 === 0 ? 'w-1' : i % 5 === 0 ? 'w-1.5' : 'w-0.5'}`} 
                    />
                  ))}
                </div>
                <p className="text-[10px] font-mono text-slate-400 mt-1">
                  *{student.id}*
                </p>
              </div>
            </div>

            {/* Collection status footer */}
            <div className="bg-slate-50 border-t border-slate-200 px-4 py-2 flex items-center justify-between text-[11px]">
              <span className="text-slate-500">Admissions Collection:</span>
              <span className={`font-semibold ${student.idCardCollected ? 'text-emerald-700' : 'text-amber-700'}`}>
                {student.idCardCollected ? 'Collected' : 'Pending Handover'}
              </span>
            </div>
          </div>
        </div>

        {/* Modal Actions */}
        <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
          <div>
            {!student.idCardCollected && currentRole === 'REGISTRAR' && (
              <button
                onClick={() => markIdCardCollected(student.id)}
                className="px-3 py-1.5 text-xs font-semibold text-blue-700 bg-blue-100 hover:bg-blue-200 rounded-lg transition"
              >
                Mark ID as Collected
              </button>
            )}
          </div>

          <div className="flex gap-2">
            <button
              onClick={() => window.print()}
              className="px-3.5 py-2 border border-slate-300 hover:bg-slate-100 text-slate-700 rounded-lg text-xs font-medium flex items-center gap-1.5 transition"
            >
              <Printer className="w-3.5 h-3.5" />
              Print
            </button>
            
            <button
              onClick={handleDownloadImage}
              disabled={!canDownload}
              className={`px-4 py-2 rounded-lg text-xs font-medium flex items-center gap-1.5 shadow-sm transition ${
                canDownload 
                  ? 'bg-blue-600 hover:bg-blue-700 text-white cursor-pointer' 
                  : 'bg-slate-300 text-slate-500 cursor-not-allowed'
              }`}
            >
              <Download className="w-3.5 h-3.5" />
              Download JPG/PNG
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
