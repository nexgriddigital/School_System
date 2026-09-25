import React, { useState } from 'react';
import { useSchool } from '../../context/SchoolContext';
import { 
  FileText, 
  PenTool, 
  CheckCircle2, 
  Clock, 
  Eye, 
  PlusCircle, 
  ShieldCheck, 
  Stamp, 
  Building2, 
  Search,
  Filter,
  FileCheck2,
  Lock
} from 'lucide-react';
import { DigitalSignatureModal } from '../common/DigitalSignatureModal';
import { InternalDocument, DigitalSignatureInfo } from '../../types';

export const InternalDocumentsTab: React.FC = () => {
  const { 
    internalDocuments, 
    signInternalDocument, 
    createInternalDocument,
    openDocumentViewer, 
    currentUser 
  } = useSchool();

  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<string>('ALL');

  // Online Digital Signature Modal State
  const [signingDoc, setSigningDoc] = useState<InternalDocument | null>(null);

  // New Document Creation Modal State
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [referenceNumber, setReferenceNumber] = useState(`DIR/ACAD/2026/0${(internalDocuments?.length || 0) + 1}`);
  const [category, setCategory] = useState<'ADMIN_MEMO' | 'ACADEMIC_DIRECTIVE' | 'GENERAL_POLICY' | 'FACULTY_RESOLUTION'>('ACADEMIC_DIRECTIVE');
  const [description, setDescription] = useState('');

  const filteredDocs = (internalDocuments || []).filter(doc => {
    if (filterType !== 'ALL' && doc.documentType !== filterType) return false;
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      const matchTitle = doc.title.toLowerCase().includes(term);
      const matchRef = doc.referenceNumber.toLowerCase().includes(term);
      const matchDesc = doc.description.toLowerCase().includes(term);
      if (!matchTitle && !matchRef && !matchDesc) return false;
    }
    return true;
  });

  const principalSignedCount = (internalDocuments || []).filter(d => 
    d.signatures?.some(s => s.signatoryRole === 'PRINCIPAL')
  ).length;

  const pendingSignatureCount = (internalDocuments || []).filter(d => 
    !d.signatures?.some(s => s.signatoryRole === 'PRINCIPAL')
  ).length;

  const handleOpenDocViewer = (doc: InternalDocument) => {
    openDocumentViewer({
      title: doc.title,
      subtitle: `Reference: ${doc.referenceNumber} • Category: ${doc.documentType.replace('_', ' ')}`,
      docName: `${doc.referenceNumber.replace(/[\/\\?%*:|"<>]/g, '_')}.pdf`,
      docUrl: doc.pdfUrl || undefined,
      category: 'GENERAL',
      canSign: true,
      onSignDocument: (sig: DigitalSignatureInfo) => {
        signInternalDocument(doc.id, sig);
      },
      metadata: {
        referenceNumber: doc.referenceNumber,
        issuedDate: doc.issuedDate,
        documentType: doc.documentType,
        signatures: doc.signatures,
      }
    });
  };

  const handleCreateDocument = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !description.trim()) return;

    createInternalDocument({
      title: title.trim(),
      referenceNumber: referenceNumber.trim(),
      documentType: (category === 'FACULTY_RESOLUTION' ? 'ADMIN_MEMO' : category) as any,
      description: description.trim(),
      requiredSignatories: ['PRINCIPAL'],
    });

    setIsCreateModalOpen(false);
    setTitle('');
    setDescription('');
    setReferenceNumber(`DIR/ACAD/2026/0${(internalDocuments?.length || 0) + 2}`);
  };

  return (
    <div className="space-y-6">
      {/* Policy Directive Card */}
      <div className="bg-gradient-to-r from-slate-900 to-indigo-950 rounded-2xl p-6 text-white shadow-md relative overflow-hidden border border-slate-800">
        <div className="relative z-10 max-w-3xl space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-500/20 border border-indigo-400/30 text-indigo-200 text-xs font-semibold">
            <Lock className="w-3.5 h-3.5 text-indigo-300" />
            <span>Cryptographic Online Signature & Document Desk</span>
          </div>
          <h2 className="text-xl font-bold font-oskar-vintage text-white tracking-wide">
            Internal Directives & Executive Policy Authorizations
          </h2>
          <p className="text-xs text-indigo-100/90 leading-relaxed">
            Institutional officers can sign, authorize, and seal internal memos, academic regulations, faculty resolutions, and executive mandates with touch-drawn or cursive digital signatures verified by cryptographic SHA-256 integrity tokens.
          </p>
        </div>
      </div>

      {/* Control Bar */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
          <div>
            <h3 className="font-oskar-vintage text-base font-bold text-slate-900 flex items-center gap-2">
              <FileText className="w-4 h-4 text-blue-600" />
              <span>Official Institutional Documents Register</span>
              {pendingSignatureCount > 0 && (
                <span className="px-2 py-0.5 rounded-full bg-amber-100 text-amber-900 font-bold text-xs">
                  {pendingSignatureCount} Awaiting Signature
                </span>
              )}
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Review institutional directives and apply legally binding executive digital signatures.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search reference or title..."
                className="pl-8 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:ring-1 focus:ring-blue-500 w-52"
              />
            </div>

            <button
              type="button"
              onClick={() => setIsCreateModalOpen(true)}
              className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition shadow-xs cursor-pointer active:scale-98"
            >
              <PlusCircle className="w-3.5 h-3.5" />
              <span>Draft New Directive</span>
            </button>
          </div>
        </div>

        {/* List of Internal Documents */}
        <div className="grid grid-cols-1 gap-4">
          {filteredDocs.map((doc) => {
            const isSignedByPrincipal = doc.signatures?.some(s => s.signatoryRole === 'PRINCIPAL');
            const principalSignature = doc.signatures?.find(s => s.signatoryRole === 'PRINCIPAL');

            return (
              <div 
                key={doc.id}
                className={`p-5 rounded-xl border text-xs space-y-3 transition ${
                  isSignedByPrincipal 
                    ? 'bg-slate-50/70 border-slate-200' 
                    : 'bg-amber-50/40 border-amber-200 shadow-xs'
                }`}
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-200/60 pb-3">
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-sm shrink-0 ${
                      isSignedByPrincipal 
                        ? 'bg-emerald-100 text-emerald-800 border border-emerald-200' 
                        : 'bg-amber-100 text-amber-800 border border-amber-200'
                    }`}>
                      <FileCheck2 className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-900 text-sm">{doc.title}</span>
                        <span className="font-mono text-slate-500 text-[11px] bg-white px-2 py-0.5 rounded border border-slate-200">
                          {doc.referenceNumber}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-500 mt-0.5 flex items-center gap-2">
                        <span>Issued on: <strong>{doc.issuedDate}</strong></span>
                        <span>•</span>
                        <span className="uppercase font-semibold tracking-wider text-[10px] text-indigo-700">
                          {doc.documentType.replace('_', ' ')}
                        </span>
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    {isSignedByPrincipal ? (
                      <span className="px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 font-bold text-[11px] flex items-center gap-1.5 border border-emerald-200">
                        <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                        Authorized & Signed
                      </span>
                    ) : (
                      <span className="px-3 py-1 rounded-full bg-amber-100 text-amber-900 font-bold text-[11px] flex items-center gap-1.5 border border-amber-300">
                        <Clock className="w-3.5 h-3.5 text-amber-700" />
                        Executive Signature Required
                      </span>
                    )}
                  </div>
                </div>

                {/* Description Body */}
                <p className="text-slate-700 bg-white p-3.5 rounded-lg border border-slate-100 leading-relaxed text-xs">
                  {doc.description}
                </p>

                {/* Signatures Verified Section */}
                {doc.signatures && doc.signatures.length > 0 && (
                  <div className="bg-slate-100/80 rounded-xl p-3 border border-slate-200 space-y-2">
                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
                      Cryptographic Signatures & Verification Records:
                    </span>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {doc.signatures.map((sig, idx) => (
                        <div key={idx} className="bg-white p-2.5 rounded-lg border border-slate-200 text-xs flex items-center justify-between gap-3">
                          <div className="flex items-center gap-2.5">
                            {sig.signatureDataUrl ? (
                              <img
                                src={sig.signatureDataUrl}
                                alt="Signature"
                                className="h-8 max-w-[100px] object-contain border border-slate-200 rounded bg-slate-50 px-1"
                              />
                            ) : (
                              <div className="font-serif italic text-blue-900 font-bold text-sm bg-blue-50 px-2 py-1 rounded border border-blue-200">
                                {sig.signatoryName}
                              </div>
                            )}
                            <div>
                              <p className="font-bold text-slate-900 text-xs">{sig.signatoryName}</p>
                              <p className="text-[10px] text-slate-500">{sig.signatoryTitle} ({sig.signatoryRole})</p>
                            </div>
                          </div>

                          <div className="text-right">
                            <span className="text-[10px] font-mono text-slate-500 block">
                              {new Date(sig.timestamp).toLocaleDateString()}
                            </span>
                            <span className="text-[9px] font-mono text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200 inline-block font-semibold">
                              Verified
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Actions */}
                <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-200/60">
                  <button
                    type="button"
                    onClick={() => handleOpenDocViewer(doc)}
                    className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg font-bold text-xs flex items-center gap-1.5 transition cursor-pointer"
                  >
                    <Eye className="w-3.5 h-3.5 text-slate-600" />
                    <span>View Official Document</span>
                  </button>

                  <div className="flex items-center gap-2">
                    {!isSignedByPrincipal && (
                      <button
                        type="button"
                        onClick={() => setSigningDoc(doc)}
                        className="px-4 py-1.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white rounded-lg font-bold text-xs flex items-center gap-1.5 transition shadow-xs cursor-pointer active:scale-98"
                      >
                        <PenTool className="w-3.5 h-3.5 text-blue-200" />
                        <span>Sign & Authorize Document (Online Signature)</span>
                      </button>
                    )}

                    {isSignedByPrincipal && (
                      <button
                        type="button"
                        onClick={() => setSigningDoc(doc)}
                        className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg font-bold text-xs flex items-center gap-1.5 transition cursor-pointer"
                      >
                        <PenTool className="w-3.5 h-3.5 text-slate-500" />
                        <span>Re-Affirm Signature</span>
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}

          {filteredDocs.length === 0 && (
            <div className="p-8 text-center bg-slate-50 rounded-xl border border-dashed border-slate-200">
              <FileText className="w-8 h-8 text-slate-300 mx-auto mb-2" />
              <p className="text-xs text-slate-500 font-medium">No internal documents found.</p>
            </div>
          )}
        </div>
      </div>

      {/* Online Digital Signature Modal */}
      {signingDoc && (
        <DigitalSignatureModal
          isOpen={Boolean(signingDoc)}
          onClose={() => setSigningDoc(null)}
          title={`Executive Online Signature: ${signingDoc.title}`}
          subtitle={`Reference: ${signingDoc.referenceNumber} • Category: ${signingDoc.type.replace('_', ' ')}`}
          signatoryRole="PRINCIPAL"
          defaultSignerName={currentUser?.name || 'Dr. O. Woldeyesus'}
          defaultSignerTitle="Executive Principal & Headmaster"
          onSignComplete={(signature) => {
            signInternalDocument(signingDoc.id, signature);
            setSigningDoc(null);
          }}
        />
      )}

      {/* Draft New Directive Modal */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 backdrop-blur-xs p-4">
          <form 
            onSubmit={handleCreateDocument}
            className="bg-white rounded-2xl p-6 shadow-2xl max-w-lg w-full border border-slate-200 space-y-4 animate-in fade-in duration-150"
          >
            <div className="border-b border-slate-100 pb-3">
              <h4 className="font-oskar-vintage text-base font-bold text-slate-900">
                Draft New Institutional Directive / Policy
              </h4>
              <p className="text-xs text-slate-500">
                Create an official administrative memo or academic directive requiring online signatures.
              </p>
            </div>

            <div className="space-y-3">
              <div>
                <label className="text-[11px] font-bold text-slate-700 block mb-1">
                  Document Title:
                </label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Directive Regarding Semester Final Examination Standards"
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-xs text-slate-900 focus:ring-1 focus:ring-blue-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] font-bold text-slate-700 block mb-1">
                    Reference Number:
                  </label>
                  <input
                    type="text"
                    required
                    value={referenceNumber}
                    onChange={(e) => setReferenceNumber(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-xs text-slate-900 focus:ring-1 focus:ring-blue-500 font-mono"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-bold text-slate-700 block mb-1">
                    Document Category:
                  </label>
                  <select
                    value={category}
                    onChange={(e: any) => setCategory(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-xs text-slate-900 focus:ring-1 focus:ring-blue-500"
                  >
                    <option value="ACADEMIC_DIRECTIVE">Academic Directive</option>
                    <option value="ADMIN_MEMO">Administrative Memo</option>
                    <option value="GENERAL_POLICY">General Policy</option>
                    <option value="FACULTY_RESOLUTION">Faculty Resolution</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-700 block mb-1">
                  Directive Text / Resolution Body:
                </label>
                <textarea
                  required
                  rows={4}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Detail the official mandate, procedural timeline, and enforcement requirements..."
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg p-3 text-xs text-slate-900 focus:ring-1 focus:ring-blue-500"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setIsCreateModalOpen(false)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold transition"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition shadow-xs"
              >
                Publish & Register Directive
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
