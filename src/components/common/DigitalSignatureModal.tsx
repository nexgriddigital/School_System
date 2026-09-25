import React, { useState, useRef, useEffect } from 'react';
import { 
  X, 
  PenTool, 
  Type, 
  Upload, 
  RotateCcw, 
  CheckCircle2, 
  ShieldCheck, 
  Lock,
  Sparkles,
  FileCheck
} from 'lucide-react';
import { DigitalSignatureInfo, UserRole } from '../../types';
import { 
  renderCursiveSignatureDataUrl, 
  buildDigitalSignaturePayload, 
  CursiveStyle 
} from '../../utils/digitalSignature';

export interface DigitalSignatureModalProps {
  isOpen: boolean;
  onClose: () => void;
  documentTitle: string;
  documentId: string;
  documentType?: string;
  defaultSignatoryName?: string;
  defaultSignatoryTitle?: string;
  signatoryRole: UserRole;
  onAuthorize: (signature: DigitalSignatureInfo) => void;
}

export const DigitalSignatureModal: React.FC<DigitalSignatureModalProps> = ({
  isOpen,
  onClose,
  documentTitle,
  documentId,
  documentType = 'Internal Document',
  defaultSignatoryName = '',
  defaultSignatoryTitle = '',
  signatoryRole,
  onAuthorize,
}) => {
  const [activeMode, setActiveMode] = useState<'DRAW' | 'TYPE' | 'SAVED'>('DRAW');
  const [signatoryName, setSignatoryName] = useState(defaultSignatoryName);
  const [signatoryTitle, setSignatoryTitle] = useState(defaultSignatoryTitle);
  const [authorizationType, setAuthorizationType] = useState<
    'APPROVED' | 'OFFICIAL_ATTESTATION' | 'EXECUTIVE_CLEARANCE' | 'RECORDED_CERTIFIED'
  >('APPROVED');
  const [remarks, setRemarks] = useState('');
  const [inkColor, setInkColor] = useState('#1e3a8a'); // Royal Navy Blue
  const [rememberSignature, setRememberSignature] = useState(true);

  // Type mode options
  const [typedStyle, setTypedStyle] = useState<CursiveStyle>('CLASSIC');

  // Saved signature from localStorage
  const storageKey = `oskar_digital_sig_${signatoryRole}`;
  const [savedSigUrl, setSavedSigUrl] = useState<string | null>(null);

  // Canvas drawing state
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const isDrawingRef = useRef(false);
  const hasDrawnRef = useRef(false);

  useEffect(() => {
    if (defaultSignatoryName && !signatoryName) {
      setSignatoryName(defaultSignatoryName);
    }
    if (defaultSignatoryTitle && !signatoryTitle) {
      setSignatoryTitle(defaultSignatoryTitle);
    }
    try {
      const stored = localStorage.getItem(storageKey);
      if (stored) {
        setSavedSigUrl(stored);
        if (!hasDrawnRef.current) {
          setActiveMode('SAVED');
        }
      }
    } catch (e) {
      console.error(e);
    }
  }, [isOpen, defaultSignatoryName, defaultSignatoryTitle, storageKey]);

  // Set up canvas when switching to DRAW mode
  useEffect(() => {
    if (isOpen && activeMode === 'DRAW' && canvasRef.current) {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.strokeStyle = inkColor;
        ctx.lineWidth = 2.5;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
      }
    }
  }, [isOpen, activeMode, inkColor]);

  if (!isOpen) return null;

  // Drawing Handlers
  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    isDrawingRef.current = true;
    hasDrawnRef.current = true;
    const rect = canvas.getBoundingClientRect();
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;

    const x = (clientX - rect.left) * (canvas.width / rect.width);
    const y = (clientY - rect.top) * (canvas.height / rect.height);

    ctx.beginPath();
    ctx.moveTo(x, y);
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawingRef.current) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;

    const x = (clientX - rect.left) * (canvas.width / rect.width);
    const y = (clientY - rect.top) * (canvas.height / rect.height);

    ctx.lineTo(x, y);
    ctx.stroke();
  };

  const stopDrawing = () => {
    isDrawingRef.current = false;
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    hasDrawnRef.current = false;
  };

  // Upload image handler
  const handleUploadImage = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        setSavedSigUrl(reader.result);
        setActiveMode('SAVED');
      }
    };
    reader.readAsDataURL(file);
  };

  // Submission handler
  const handleConfirmSign = () => {
    let finalSignatureUrl = '';

    if (activeMode === 'DRAW') {
      const canvas = canvasRef.current;
      if (!canvas || !hasDrawnRef.current) {
        // Fallback to typed if canvas wasn't touched
        finalSignatureUrl = renderCursiveSignatureDataUrl(signatoryName || 'Authorized Officer', 'CLASSIC', inkColor);
      } else {
        finalSignatureUrl = canvas.toDataURL('image/png');
      }
    } else if (activeMode === 'TYPE') {
      finalSignatureUrl = renderCursiveSignatureDataUrl(signatoryName || 'Authorized Officer', typedStyle, inkColor);
    } else if (activeMode === 'SAVED' && savedSigUrl) {
      finalSignatureUrl = savedSigUrl;
    } else {
      finalSignatureUrl = renderCursiveSignatureDataUrl(signatoryName || 'Authorized Officer', 'CLASSIC', inkColor);
    }

    if (rememberSignature && finalSignatureUrl) {
      try {
        localStorage.setItem(storageKey, finalSignatureUrl);
      } catch (e) {
        console.error(e);
      }
    }

    const payload = buildDigitalSignaturePayload({
      signatoryId: `AUTH-${signatoryRole}`,
      signatoryName: signatoryName || 'Authorized Officer',
      signatoryRole,
      signatoryTitle: signatoryTitle || 'Executive Attestation Officer',
      signatureDataUrl: finalSignatureUrl,
      documentId,
      signingRemarks: remarks || `Officially approved and electronically certified by ${signatoryName}.`,
      authorizationType,
    });

    onAuthorize(payload);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4 overflow-y-auto animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full border border-slate-200 overflow-hidden flex flex-col my-auto">
        
        {/* Top Header */}
        <div className="bg-slate-900 text-white px-6 py-4 flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-600/30 text-blue-400 border border-blue-500/40 flex items-center justify-center">
              <PenTool className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-oskar-vintage text-base font-bold tracking-wide">
                  Sign & Authorize Internal Document
                </h3>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-500/20 text-blue-300 border border-blue-400/30">
                  Electronic Seal
                </span>
              </div>
              <p className="text-xs text-slate-400 truncate max-w-md">
                Doc Ref: <span className="font-mono text-slate-300">{documentId}</span> • {documentTitle}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <div className="p-6 space-y-5 overflow-y-auto max-h-[75vh]">
          
          {/* Signatory Info Fields */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 bg-slate-50 p-4 rounded-2xl border border-slate-200 text-xs">
            <div>
              <label className="font-bold text-slate-700 block mb-1">
                Authorized Signatory Name
              </label>
              <input
                type="text"
                value={signatoryName}
                onChange={(e) => setSignatoryName(e.target.value)}
                placeholder="Full Legal Name"
                className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs font-semibold focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="font-bold text-slate-700 block mb-1">
                Official Position Title
              </label>
              <input
                type="text"
                value={signatoryTitle}
                onChange={(e) => setSignatoryTitle(e.target.value)}
                placeholder="e.g. Executive Principal, Registrar, Teacher"
                className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs font-semibold focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="font-bold text-slate-700 block mb-1">
                Authorization Classification
              </label>
              <select
                value={authorizationType}
                onChange={(e) => setAuthorizationType(e.target.value as any)}
                className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs font-semibold focus:ring-2 focus:ring-blue-500"
              >
                <option value="APPROVED">Executive Approval & Clearance</option>
                <option value="OFFICIAL_ATTESTATION">Academic Attestation & Certification</option>
                <option value="EXECUTIVE_CLEARANCE">Administrative Clearance Release</option>
                <option value="RECORDED_CERTIFIED">Certified SIS Record Entry</option>
              </select>
            </div>

            <div>
              <label className="font-bold text-slate-700 block mb-1">
                Ink Color Palette
              </label>
              <div className="flex items-center gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => setInkColor('#1e3a8a')}
                  className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg border text-[11px] font-semibold transition ${
                    inkColor === '#1e3a8a' 
                      ? 'border-blue-700 bg-blue-50 text-blue-900 ring-2 ring-blue-500/30' 
                      : 'border-slate-300 text-slate-700'
                  }`}
                >
                  <span className="w-3 h-3 rounded-full bg-[#1e3a8a]" />
                  Navy Ink
                </button>
                <button
                  type="button"
                  onClick={() => setInkColor('#0f172a')}
                  className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg border text-[11px] font-semibold transition ${
                    inkColor === '#0f172a' 
                      ? 'border-slate-800 bg-slate-100 text-slate-900 ring-2 ring-slate-800/30' 
                      : 'border-slate-300 text-slate-700'
                  }`}
                >
                  <span className="w-3 h-3 rounded-full bg-[#0f172a]" />
                  Classic Black
                </button>
              </div>
            </div>
          </div>

          {/* Mode Selector Tabs */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                Signature Capture Method:
              </span>
              <span className="text-[11px] text-slate-500">
                Meets electronic verification standards
              </span>
            </div>

            <div className="flex gap-2 p-1 bg-slate-100 rounded-xl">
              <button
                type="button"
                onClick={() => setActiveMode('DRAW')}
                className={`flex-1 py-2 rounded-lg text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer ${
                  activeMode === 'DRAW'
                    ? 'bg-white text-blue-700 shadow-xs border border-slate-200'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <PenTool className="w-3.5 h-3.5" />
                <span>Draw on Canvas</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveMode('TYPE')}
                className={`flex-1 py-2 rounded-lg text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer ${
                  activeMode === 'TYPE'
                    ? 'bg-white text-blue-700 shadow-xs border border-slate-200'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Type className="w-3.5 h-3.5" />
                <span>Type Cursive</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveMode('SAVED')}
                className={`flex-1 py-2 rounded-lg text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer ${
                  activeMode === 'SAVED'
                    ? 'bg-white text-blue-700 shadow-xs border border-slate-200'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Saved Signature</span>
              </button>
            </div>
          </div>

          {/* MODE 1: DRAW CANVAS */}
          {activeMode === 'DRAW' && (
            <div className="space-y-2">
              <div className="relative border-2 border-dashed border-slate-300 rounded-2xl bg-white p-2">
                <canvas
                  ref={canvasRef}
                  width={560}
                  height={170}
                  onMouseDown={startDrawing}
                  onMouseMove={draw}
                  onMouseUp={stopDrawing}
                  onMouseLeave={stopDrawing}
                  onTouchStart={startDrawing}
                  onTouchMove={draw}
                  onTouchEnd={stopDrawing}
                  className="w-full h-40 bg-white rounded-xl cursor-crosshair touch-none"
                />

                <div className="absolute bottom-3 left-4 text-[11px] text-slate-400 select-none pointer-events-none flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
                  Sign with mouse, trackpad, or finger above the line
                </div>

                <button
                  type="button"
                  onClick={clearCanvas}
                  className="absolute top-3 right-3 px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold flex items-center gap-1 transition cursor-pointer border border-slate-200"
                >
                  <RotateCcw className="w-3 h-3" />
                  Clear
                </button>
              </div>
            </div>
          )}

          {/* MODE 2: TYPE CURSIVE */}
          {activeMode === 'TYPE' && (
            <div className="space-y-3">
              <div className="flex gap-2">
                {(['CLASSIC', 'ELEGANT', 'EXECUTIVE', 'MODERN'] as CursiveStyle[]).map((style) => (
                  <button
                    key={style}
                    type="button"
                    onClick={() => setTypedStyle(style)}
                    className={`flex-1 py-1.5 text-xs font-bold rounded-xl border transition ${
                      typedStyle === style 
                        ? 'border-blue-600 bg-blue-50 text-blue-900 shadow-xs'
                        : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    {style.charAt(0) + style.slice(1).toLowerCase()}
                  </button>
                ))}
              </div>

              <div className="h-36 bg-slate-50 border-2 border-slate-200 rounded-2xl flex flex-col items-center justify-center p-4 text-center">
                <p 
                  className="text-4xl text-blue-950 font-serif italic select-none"
                  style={{
                    fontFamily: typedStyle === 'ELEGANT' ? 'serif' : typedStyle === 'EXECUTIVE' ? 'cursive' : 'sans-serif',
                    color: inkColor,
                  }}
                >
                  {signatoryName || 'Authorized Signatory'}
                </p>
                <div className="w-48 h-0.5 bg-blue-800/40 mt-3 rounded-full" />
                <span className="text-[10px] text-slate-400 mt-1 uppercase tracking-wider font-mono">
                  [ Generated Electronic Cursive Vector ]
                </span>
              </div>
            </div>
          )}

          {/* MODE 3: SAVED SIGNATURE */}
          {activeMode === 'SAVED' && (
            <div className="space-y-3">
              {savedSigUrl ? (
                <div className="p-4 bg-emerald-50/70 border border-emerald-200 rounded-2xl flex flex-col items-center justify-center space-y-2">
                  <div className="flex items-center gap-1.5 text-emerald-800 text-xs font-bold">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <span>Saved Official Profile Signature Ready</span>
                  </div>
                  <div className="h-28 flex items-center justify-center p-2 bg-white rounded-xl border border-emerald-100 shadow-xs w-full max-w-sm">
                    <img 
                      src={savedSigUrl} 
                      alt="Saved Signature" 
                      className="max-h-24 max-w-full object-contain"
                    />
                  </div>
                </div>
              ) : (
                <div className="p-6 text-center bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
                  <PenTool className="w-8 h-8 text-slate-400 mx-auto" />
                  <p className="text-xs font-semibold text-slate-700">No profile signature saved yet.</p>
                  <p className="text-[11px] text-slate-500">
                    Draw or type your signature now, and check "Remember signature" below to use it instantly next time.
                  </p>
                </div>
              )}

              <div className="flex items-center justify-center pt-1">
                <label className="px-3.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl border border-slate-300 flex items-center gap-1.5 cursor-pointer transition">
                  <Upload className="w-3.5 h-3.5" />
                  <span>Upload Signature Image (PNG/JPEG)</span>
                  <input
                    type="file"
                    accept="image/png,image/jpeg"
                    onChange={handleUploadImage}
                    className="hidden"
                  />
                </label>
              </div>
            </div>
          )}

          {/* Remarks Field */}
          <div>
            <label className="text-xs font-bold text-slate-700 block mb-1">
              Authorizing Remarks / Verification Note (Optional)
            </label>
            <input
              type="text"
              value={remarks}
              onChange={(e) => setRemarks(e.target.value)}
              placeholder="e.g. Approved and certified for official academic progression."
              className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Security & Remember Signature Toggle */}
          <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-slate-100 text-xs">
            <label className="flex items-center gap-2 cursor-pointer text-slate-700 select-none">
              <input
                type="checkbox"
                checked={rememberSignature}
                onChange={(e) => setRememberSignature(e.target.checked)}
                className="w-4 h-4 rounded text-blue-600 focus:ring-0"
              />
              <span className="font-semibold">Remember this signature for future internal documents</span>
            </label>

            <div className="flex items-center gap-1.5 text-[11px] font-mono text-slate-500">
              <Lock className="w-3 h-3 text-slate-400" />
              <span>SHA-256 Protected</span>
            </div>
          </div>
        </div>

        {/* Modal Actions */}
        <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-bold text-slate-600 hover:text-slate-900 bg-white hover:bg-slate-100 border border-slate-300 rounded-xl transition cursor-pointer"
          >
            Cancel
          </button>

          <button
            type="button"
            onClick={handleConfirmSign}
            className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl transition shadow-md shadow-blue-500/20 flex items-center gap-2 cursor-pointer"
          >
            <FileCheck className="w-4 h-4" />
            <span>Apply Digital Signature & Authorize</span>
          </button>
        </div>

      </div>
    </div>
  );
};
