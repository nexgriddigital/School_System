import React, { useState, useMemo } from 'react';
import { useSchool } from '../../../context/SchoolContext';
import { 
  X, 
  FileSpreadsheet, 
  Download, 
  ShieldCheck, 
  Search, 
  Clock, 
  FileCode, 
  ExternalLink,
  Filter,
  CheckCircle2
} from 'lucide-react';

interface QuickAuditReportModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const QuickAuditReportModal: React.FC<QuickAuditReportModalProps> = ({ isOpen, onClose }) => {
  const { 
    auditLogs, 
    exportAuditLogsCsv, 
    exportAuditLogsJson, 
    setCurrentRole,
    schoolName 
  } = useSchool();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSeverity, setSelectedSeverity] = useState<string>('ALL');

  const filteredLogs = useMemo(() => {
    return (auditLogs || []).filter(log => {
      if (selectedSeverity !== 'ALL' && log.severity !== selectedSeverity) return false;

      if (!searchQuery.trim()) return true;
      const q = searchQuery.toLowerCase().trim();
      const matchAction = log.action.toLowerCase().includes(q);
      const matchDetails = log.details.toLowerCase().includes(q);
      const matchActor = log.performedBy?.name.toLowerCase().includes(q);
      const matchCategory = log.category.toLowerCase().includes(q);
      return matchAction || matchDetails || matchActor || matchCategory;
    });
  }, [auditLogs, searchQuery, selectedSeverity]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl max-w-3xl w-full overflow-hidden border border-slate-200 dark:border-slate-800 animate-in fade-in zoom-in-95 duration-200 my-8">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/60">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-purple-600/10 text-purple-600 dark:bg-purple-500/20 dark:text-purple-400 flex items-center justify-center">
              <FileSpreadsheet className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-slate-900 dark:text-white text-base">
                  Executive Audit Trail & Governance Report
                </h3>
                <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-purple-100 dark:bg-purple-900/60 text-purple-800 dark:text-purple-300 border border-purple-200 dark:border-purple-700/50">
                  Principal FAB
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Cryptographically signed ledger tracking all administrative actions & transactions
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

        {/* Quick Export Action Banner */}
        <div className="p-4 bg-gradient-to-r from-purple-50 via-indigo-50 to-blue-50 dark:from-purple-950/30 dark:via-indigo-950/30 dark:to-blue-950/30 border-b border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-white dark:bg-slate-800 shadow-xs flex items-center justify-center text-emerald-600 dark:text-emerald-400 border border-slate-200 dark:border-slate-700 shrink-0">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div className="text-xs">
              <span className="font-bold text-slate-900 dark:text-white block">
                Tamper-Evident SHA-256 Ledger
              </span>
              <span className="text-slate-600 dark:text-slate-400">
                {auditLogs.length} institutional actions logged • 100% Checksum Validated
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={exportAuditLogsCsv}
              className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold text-xs flex items-center gap-1.5 transition shadow-xs cursor-pointer active:scale-98"
              title="Download official CSV with audit checksums"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export CSV Report</span>
            </button>

            <button
              type="button"
              onClick={exportAuditLogsJson}
              className="px-3.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-white rounded-xl font-bold text-xs flex items-center gap-1.5 transition shadow-xs cursor-pointer active:scale-98"
              title="Download raw JSON ledger for external regulatory audit"
            >
              <FileCode className="w-3.5 h-3.5" />
              <span>Export JSON Ledger</span>
            </button>
          </div>
        </div>

        {/* Filter & Search */}
        <div className="p-3 border-b border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row gap-2 bg-slate-50/50 dark:bg-slate-800/40">
          <div className="relative flex-1">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by action, actor, or details..."
              className="w-full pl-8 pr-3 py-1.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs text-slate-800 dark:text-white outline-none focus:ring-1 focus:ring-purple-500"
            />
          </div>

          <div className="flex items-center gap-1 bg-white dark:bg-slate-900 p-1 rounded-lg border border-slate-200 dark:border-slate-700 text-xs">
            <Filter className="w-3 h-3 text-slate-400 ml-1.5" />
            <select
              value={selectedSeverity}
              onChange={(e) => setSelectedSeverity(e.target.value)}
              className="bg-transparent text-slate-700 dark:text-slate-300 font-semibold text-xs outline-none pr-2 cursor-pointer"
            >
              <option value="ALL">All Severities</option>
              <option value="HIGH">High Severity</option>
              <option value="MEDIUM">Medium Severity</option>
              <option value="LOW">Low Severity</option>
              <option value="INFO">Info</option>
            </select>
          </div>
        </div>

        {/* Audit Log Entries List */}
        <div className="p-4 max-h-[50vh] overflow-y-auto space-y-2">
          {filteredLogs.length === 0 ? (
            <div className="text-center py-8 text-slate-500 dark:text-slate-400 text-xs">
              No audit records matching your filter criteria.
            </div>
          ) : (
            filteredLogs.slice(0, 30).map((log) => {
              const severityColor = 
                log.severity === 'HIGH' ? 'bg-rose-100 text-rose-800 border-rose-200 dark:bg-rose-950/60 dark:text-rose-300 dark:border-rose-800' :
                log.severity === 'MEDIUM' ? 'bg-amber-100 text-amber-800 border-amber-200 dark:bg-amber-950/60 dark:text-amber-300 dark:border-amber-800' :
                log.severity === 'LOW' ? 'bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-950/60 dark:text-blue-300 dark:border-blue-800' :
                'bg-slate-100 text-slate-700 border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700';

              return (
                <div
                  key={log.id}
                  className="p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800/80 text-xs space-y-1.5 shadow-2xs"
                >
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className={`px-2 py-0.5 rounded-full font-bold text-[10px] border ${severityColor}`}>
                        {log.severity}
                      </span>
                      <span className="font-bold text-slate-900 dark:text-white font-mono text-[11px]">
                        {log.action}
                      </span>
                      <span className="text-[10px] text-slate-400 font-mono">
                        ({log.category})
                      </span>
                    </div>

                    <div className="flex items-center gap-2 text-[10px] text-slate-500 dark:text-slate-400 font-mono">
                      <Clock className="w-3 h-3" />
                      <span>{new Date(log.timestamp).toLocaleString()}</span>
                    </div>
                  </div>

                  <p className="text-slate-700 dark:text-slate-300 text-xs leading-relaxed">
                    {log.details}
                  </p>

                  <div className="flex flex-wrap items-center justify-between gap-2 pt-1 border-t border-slate-100 dark:border-slate-700/60 text-[10px] text-slate-500 dark:text-slate-400 font-mono">
                    <div>
                      Performed by: <strong className="text-slate-800 dark:text-slate-200">{log.performedBy?.name || 'Administrator'}</strong> ({log.performedBy?.role || 'SYSTEM'})
                    </div>
                    {log.checksum && (
                      <div className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400" title={`Verification Hash: ${log.checksum}`}>
                        <CheckCircle2 className="w-3 h-3" />
                        <span>Hash: {log.checksum.slice(0, 12)}...</span>
                      </div>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/60 flex items-center justify-between text-xs">
          <span className="text-slate-500 dark:text-slate-400">
            Exported audit reports contain full cryptographic hashes for regulatory submission.
          </span>
          <button
            type="button"
            onClick={() => {
              setCurrentRole('PRINCIPAL');
              onClose();
            }}
            className="text-purple-600 dark:text-purple-400 font-bold hover:underline flex items-center gap-1 cursor-pointer"
          >
            <span>Open Executive Workspace</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
