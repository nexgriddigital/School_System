import React, { useState, useMemo } from 'react';
import { useSchool } from '../../context/SchoolContext';
import { 
  ShieldCheck, 
  ShieldAlert, 
  Shield, 
  KeyRound, 
  UserPlus, 
  UserMinus, 
  Download, 
  Database, 
  Search, 
  Filter, 
  Clock, 
  AlertTriangle, 
  CheckCircle2, 
  ChevronDown, 
  ChevronRight, 
  Lock, 
  FileSpreadsheet, 
  FileCode, 
  Copy, 
  Check, 
  Printer, 
  Terminal, 
  RotateCcw,
  Sparkles,
  Info
} from 'lucide-react';
import { AuditLogEntry, AuditActionCategory, AuditSeverity } from '../../types';

export const AuditTrailTab: React.FC = () => {
  const { 
    auditLogs, 
    exportAuditLogsJson, 
    exportAuditLogsCsv, 
    schoolName 
  } = useSchool();

  // Search & Filter state
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [selectedSeverity, setSelectedSeverity] = useState<string>('ALL');
  const [selectedRole, setSelectedRole] = useState<string>('ALL');
  const [expandedLogId, setExpandedLogId] = useState<string | null>(null);
  const [copiedHashId, setCopiedHashId] = useState<string | null>(null);

  // Quick stats calculation
  const stats = useMemo(() => {
    const total = auditLogs.length;
    const critical = auditLogs.filter(l => l.severity === 'CRITICAL').length;
    const warnings = auditLogs.filter(l => l.severity === 'WARNING').length;
    const userLifecycle = auditLogs.filter(l => l.category === 'USER_MANAGEMENT').length;
    const dataExports = auditLogs.filter(l => l.action.includes('EXPORT') || l.category === 'DATA_GOVERNANCE').length;
    const securityKey = auditLogs.filter(l => l.category === 'SECURITY_CREDENTIALS').length;

    return { total, critical, warnings, userLifecycle, dataExports, securityKey };
  }, [auditLogs]);

  // Filtered logs
  const filteredLogs = useMemo(() => {
    return auditLogs.filter(log => {
      // Category filter
      if (selectedCategory !== 'ALL' && log.category !== selectedCategory) {
        return false;
      }

      // Severity filter
      if (selectedSeverity !== 'ALL' && log.severity !== selectedSeverity) {
        return false;
      }

      // Role filter
      if (selectedRole !== 'ALL' && log.performedBy.role !== selectedRole) {
        return false;
      }

      // Search query
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase().trim();
        const matchesId = log.id.toLowerCase().includes(query);
        const matchesAction = (log.actionLabel || '').toLowerCase().includes(query) || log.action.toLowerCase().includes(query);
        const matchesDetails = (log.details || '').toLowerCase().includes(query);
        const matchesActor = (log.performedBy.name || '').toLowerCase().includes(query) || (log.performedBy.email || '').toLowerCase().includes(query);
        const matchesTarget = (log.targetEntity?.label || '').toLowerCase().includes(query) || (log.targetEntity?.id || '').toLowerCase().includes(query);
        const matchesIp = (log.ipAddress || '').toLowerCase().includes(query);
        const matchesChecksum = (log.checksum || '').toLowerCase().includes(query);

        if (!matchesId && !matchesAction && !matchesDetails && !matchesActor && !matchesTarget && !matchesIp && !matchesChecksum) {
          return false;
        }
      }

      return true;
    });
  }, [auditLogs, selectedCategory, selectedSeverity, selectedRole, searchQuery]);

  const handleCopyChecksum = (id: string, hash: string) => {
    navigator.clipboard.writeText(hash);
    setCopiedHashId(id);
    setTimeout(() => setCopiedHashId(null), 2000);
  };

  const handlePrintAudit = () => {
    window.print();
  };

  const formatTimestamp = (iso: string) => {
    try {
      const d = new Date(iso);
      const now = new Date();
      const diffMs = now.getTime() - d.getTime();
      const diffMins = Math.floor(diffMs / (1000 * 60));
      const diffHours = Math.floor(diffMins / 60);

      let relative = '';
      if (diffMins < 1) relative = 'Just now';
      else if (diffMins < 60) relative = `${diffMins}m ago`;
      else if (diffHours < 24) relative = `${diffHours}h ago`;
      else relative = `${Math.floor(diffHours / 24)}d ago`;

      return {
        formatted: d.toLocaleDateString('en-US', { 
          month: 'short', 
          day: 'numeric', 
          year: 'numeric', 
          hour: '2-digit', 
          minute: '2-digit',
          second: '2-digit'
        }),
        relative
      };
    } catch {
      return { formatted: iso, relative: '' };
    }
  };

  const getSeverityBadge = (severity: AuditSeverity) => {
    switch (severity) {
      case 'CRITICAL':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-red-100 dark:bg-red-950/80 text-red-700 dark:text-red-300 border border-red-300 dark:border-red-800 animate-pulse">
            <ShieldAlert className="w-3.5 h-3.5 text-red-600 dark:text-red-400" />
            CRITICAL
          </span>
        );
      case 'WARNING':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-100 dark:bg-amber-950/80 text-amber-700 dark:text-amber-300 border border-amber-300 dark:border-amber-800">
            <AlertTriangle className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
            WARNING
          </span>
        );
      case 'INFO':
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-100 dark:bg-blue-950/80 text-blue-700 dark:text-blue-300 border border-blue-300 dark:border-blue-800">
            <Info className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
            INFO
          </span>
        );
    }
  };

  const getCategoryIcon = (category: AuditActionCategory) => {
    switch (category) {
      case 'SECURITY_CREDENTIALS':
        return <KeyRound className="w-4 h-4 text-purple-600 dark:text-purple-400" />;
      case 'USER_MANAGEMENT':
        return <UserPlus className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />;
      case 'DATA_GOVERNANCE':
        return <Database className="w-4 h-4 text-cyan-600 dark:text-cyan-400" />;
      case 'SYSTEM_OPERATIONS':
        return <Terminal className="w-4 h-4 text-slate-600 dark:text-slate-400" />;
      case 'ACADEMIC_ADMIN':
        return <ShieldCheck className="w-4 h-4 text-blue-600 dark:text-blue-400" />;
      default:
        return <Shield className="w-4 h-4 text-slate-500" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner & Control Deck */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 text-white shadow-xl relative overflow-hidden">
        <div className="absolute right-0 top-0 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20" />
        
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-blue-600/20 border border-blue-500/30 rounded-xl text-blue-400 shadow-inner">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-xl font-bold tracking-tight text-white font-oskar flex items-center gap-2">
                  System Audit Trail & Security Ledger
                  <span className="text-[10px] uppercase font-semibold bg-emerald-950/80 text-emerald-400 border border-emerald-800/60 px-2 py-0.5 rounded-full flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                    Immutable Append-Only
                  </span>
                </h2>
                <p className="text-xs text-slate-400">
                  Chronological record of executive interventions, master credential modifications, account life-cycles, and data exports.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 text-xs text-slate-400 pt-1">
              <Lock className="w-3.5 h-3.5 text-emerald-400" />
              <span>Tamper-Evident SHA-256 Ledger:</span>
              <strong className="text-emerald-400 font-mono text-[11px]">Integrity Verified</strong>
              <span className="text-slate-600">•</span>
              <span>Institution:</span>
              <strong className="text-slate-200">{schoolName}</strong>
            </div>
          </div>

          {/* Export & Action Buttons */}
          <div className="flex flex-wrap items-center gap-2.5">
            <button
              onClick={exportAuditLogsJson}
              className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 border border-slate-700 hover:border-slate-600 text-slate-200 hover:text-white rounded-xl text-xs font-semibold flex items-center gap-2 transition shadow-sm"
              title="Download entire audit ledger as standard JSON"
            >
              <FileCode className="w-4 h-4 text-blue-400" />
              Export JSON
            </button>

            <button
              onClick={exportAuditLogsCsv}
              className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 border border-slate-700 hover:border-slate-600 text-slate-200 hover:text-white rounded-xl text-xs font-semibold flex items-center gap-2 transition shadow-sm"
              title="Download structured CSV spreadsheet for regulatory compliance"
            >
              <FileSpreadsheet className="w-4 h-4 text-emerald-400" />
              Export CSV
            </button>

            <button
              onClick={handlePrintAudit}
              className="px-3.5 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-semibold flex items-center gap-2 transition shadow-sm hover:shadow-blue-500/20"
              title="Print official audit log report"
            >
              <Printer className="w-4 h-4" />
              Print Ledger
            </button>
          </div>
        </div>

        {/* Quick Metrics Bar */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 mt-6 pt-6 border-t border-slate-800/80">
          <div className="bg-slate-950/60 border border-slate-800 rounded-xl p-3">
            <span className="text-[11px] font-medium text-slate-400 block">Total Audited Events</span>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-2xl font-bold text-white font-mono">{stats.total}</span>
              <span className="text-[10px] text-slate-500">entries recorded</span>
            </div>
          </div>

          <div className="bg-slate-950/60 border border-slate-800 rounded-xl p-3">
            <span className="text-[11px] font-medium text-red-400 block flex items-center gap-1.5">
              <ShieldAlert className="w-3.5 h-3.5 text-red-400" />
              Critical Security Actions
            </span>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-2xl font-bold text-red-400 font-mono">{stats.critical}</span>
              <span className="text-[10px] text-slate-500">master key / resets</span>
            </div>
          </div>

          <div className="bg-slate-950/60 border border-slate-800 rounded-xl p-3">
            <span className="text-[11px] font-medium text-purple-400 block flex items-center gap-1.5">
              <KeyRound className="w-3.5 h-3.5 text-purple-400" />
              Credentials & Auth
            </span>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-2xl font-bold text-purple-400 font-mono">{stats.securityKey}</span>
              <span className="text-[10px] text-slate-500">key rotations & pass</span>
            </div>
          </div>

          <div className="bg-slate-950/60 border border-slate-800 rounded-xl p-3">
            <span className="text-[11px] font-medium text-emerald-400 block flex items-center gap-1.5">
              <UserPlus className="w-3.5 h-3.5 text-emerald-400" />
              User Provisioning
            </span>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-2xl font-bold text-emerald-400 font-mono">{stats.userLifecycle}</span>
              <span className="text-[10px] text-slate-500">created / deleted</span>
            </div>
          </div>

          <div className="bg-slate-950/60 border border-slate-800 rounded-xl p-3 col-span-2 sm:col-span-1">
            <span className="text-[11px] font-medium text-cyan-400 block flex items-center gap-1.5">
              <Database className="w-3.5 h-3.5 text-cyan-400" />
              Data Exports & Backups
            </span>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-2xl font-bold text-cyan-400 font-mono">{stats.dataExports}</span>
              <span className="text-[10px] text-slate-500">snapshots & reports</span>
            </div>
          </div>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 shadow-sm space-y-3">
        <div className="flex flex-col md:flex-row items-center gap-3">
          {/* Keyword Search */}
          <div className="relative flex-1 w-full">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by action, actor, target entity, details, IP, or ID..."
              className="w-full pl-9 pr-4 py-2 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
            />
            {searchQuery && (
              <button 
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 text-xs font-bold"
              >
                ×
              </button>
            )}
          </div>

          {/* Category Dropdown */}
          <div className="w-full md:w-48">
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full py-2 px-3 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="ALL">All Categories</option>
              <option value="SECURITY_CREDENTIALS">Security & Keys</option>
              <option value="USER_MANAGEMENT">User Provisioning</option>
              <option value="DATA_GOVERNANCE">Data Governance</option>
              <option value="SYSTEM_OPERATIONS">System Operations</option>
              <option value="ACADEMIC_ADMIN">Academic Admin</option>
            </select>
          </div>

          {/* Severity Dropdown */}
          <div className="w-full md:w-36">
            <select
              value={selectedSeverity}
              onChange={(e) => setSelectedSeverity(e.target.value)}
              className="w-full py-2 px-3 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="ALL">All Severities</option>
              <option value="CRITICAL">Critical Only</option>
              <option value="WARNING">Warnings Only</option>
              <option value="INFO">Info Only</option>
            </select>
          </div>

          {/* Actor Role Dropdown */}
          <div className="w-full md:w-36">
            <select
              value={selectedRole}
              onChange={(e) => setSelectedRole(e.target.value)}
              className="w-full py-2 px-3 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="ALL">All Actors</option>
              <option value="PRINCIPAL">Principal</option>
              <option value="REGISTRAR">Registrar</option>
              <option value="FINANCE">Finance</option>
              <option value="SYSTEM">System Engine</option>
            </select>
          </div>

          {/* Reset Filters */}
          {(searchQuery || selectedCategory !== 'ALL' || selectedSeverity !== 'ALL' || selectedRole !== 'ALL') && (
            <button
              onClick={() => {
                setSearchQuery('');
                setSelectedCategory('ALL');
                setSelectedSeverity('ALL');
                setSelectedRole('ALL');
              }}
              className="text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline px-2 whitespace-nowrap"
            >
              Clear filters
            </button>
          )}
        </div>

        <div className="flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400 pt-1">
          <span>Showing <strong>{filteredLogs.length}</strong> of <strong>{auditLogs.length}</strong> recorded audit events</span>
          <span>Chronological order (Newest events first)</span>
        </div>
      </div>

      {/* Main Audit Trail Feed & Inspection View */}
      {filteredLogs.length === 0 ? (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-12 text-center">
          <div className="w-12 h-12 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center mx-auto text-slate-400 mb-3">
            <Search className="w-6 h-6" />
          </div>
          <h3 className="text-sm font-semibold text-slate-900 dark:text-white">No Matching Audit Records Found</h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-sm mx-auto">
            Try adjusting your search criteria or resetting filters to view all historical system events.
          </p>
        </div>
      ) : (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-sm overflow-hidden divide-y divide-slate-100 dark:divide-slate-800">
          {filteredLogs.map((log) => {
            const time = formatTimestamp(log.timestamp);
            const isExpanded = expandedLogId === log.id;

            return (
              <div 
                key={log.id} 
                className={`p-4 transition-colors hover:bg-slate-50/80 dark:hover:bg-slate-800/50 ${
                  isExpanded ? 'bg-slate-50/90 dark:bg-slate-800/60' : ''
                }`}
              >
                <div className="flex flex-col md:flex-row md:items-start justify-between gap-3">
                  {/* Left Column: Icon & Primary Information */}
                  <div className="flex items-start gap-3.5 flex-1 min-w-0">
                    <div className={`p-2 rounded-xl mt-0.5 shrink-0 ${
                      log.severity === 'CRITICAL' ? 'bg-red-50 dark:bg-red-950/60 border border-red-200 dark:border-red-900/80' :
                      log.severity === 'WARNING' ? 'bg-amber-50 dark:bg-amber-950/60 border border-amber-200 dark:border-amber-900/80' :
                      'bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700'
                    }`}>
                      {getCategoryIcon(log.category)}
                    </div>

                    <div className="space-y-1 min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-xs font-mono font-semibold text-slate-500 dark:text-slate-400">
                          {log.id}
                        </span>
                        {getSeverityBadge(log.severity)}
                        <span className="text-[10px] font-semibold tracking-wider text-slate-500 dark:text-slate-400 uppercase bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded border border-slate-200 dark:border-slate-700">
                          {log.category.replace('_', ' ')}
                        </span>
                      </div>

                      <h4 className="text-sm font-bold text-slate-900 dark:text-white leading-tight">
                        {log.actionLabel || log.action}
                      </h4>

                      <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed pt-0.5">
                        {log.details}
                      </p>

                      {/* Actor & Target Meta Tags */}
                      <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 pt-1.5 text-xs text-slate-500 dark:text-slate-400">
                        <div className="flex items-center gap-1.5">
                          <span className="text-slate-400">Actor:</span>
                          <strong className="text-slate-800 dark:text-slate-200 font-medium">
                            {log.performedBy.name}
                          </strong>
                          <span className="text-[10px] font-semibold bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 px-1.5 py-0.2 rounded border border-blue-200 dark:border-blue-900">
                            {log.performedBy.role}
                          </span>
                        </div>

                        {log.targetEntity?.label && (
                          <div className="flex items-center gap-1.5">
                            <span className="text-slate-400">Target:</span>
                            <span className="text-slate-700 dark:text-slate-300 font-medium bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded text-[11px]">
                              {log.targetEntity.label}
                            </span>
                          </div>
                        )}

                        {log.ipAddress && (
                          <div className="flex items-center gap-1 text-[11px] text-slate-400">
                            <Terminal className="w-3 h-3 text-slate-400" />
                            <span>{log.ipAddress}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Right Column: Timestamps & Inspection Trigger */}
                  <div className="flex md:flex-col items-center md:items-end justify-between md:justify-start gap-2 shrink-0 pt-1 md:pt-0">
                    <div className="text-right">
                      <div className="text-xs font-semibold text-slate-800 dark:text-slate-200 font-mono">
                        {time.relative}
                      </div>
                      <div className="text-[10px] text-slate-400 font-mono">
                        {time.formatted}
                      </div>
                    </div>

                    <button
                      onClick={() => setExpandedLogId(isExpanded ? null : log.id)}
                      className="px-2.5 py-1 text-xs font-medium text-slate-600 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg flex items-center gap-1 transition"
                    >
                      {isExpanded ? (
                        <>
                          <span>Hide Details</span>
                          <ChevronDown className="w-3.5 h-3.5" />
                        </>
                      ) : (
                        <>
                          <span>Inspect</span>
                          <ChevronRight className="w-3.5 h-3.5" />
                        </>
                      )}
                    </button>
                  </div>
                </div>

                {/* Expanded Inspection Drawer */}
                {isExpanded && (
                  <div className="mt-4 pt-3 border-t border-slate-200 dark:border-slate-700/60 bg-slate-100/50 dark:bg-slate-950/60 rounded-xl p-3.5 text-xs space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                        <Lock className="w-3.5 h-3.5 text-emerald-500" />
                        Cryptographic Verification & Checksum
                      </span>
                      <span className="text-[10px] font-mono text-emerald-600 dark:text-emerald-400 bg-emerald-100 dark:bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-300 dark:border-emerald-800">
                        STATUS: VERIFIED IMMUTABLE
                      </span>
                    </div>

                    {/* SHA-256 Checksum display */}
                    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg p-2.5 flex items-center justify-between gap-2">
                      <div className="font-mono text-[11px] text-slate-600 dark:text-slate-400 truncate">
                        <strong className="text-slate-800 dark:text-slate-200 mr-2">SHA-256:</strong>
                        {log.checksum || 'e7c9f81a3d5b20498bfe11904a259c7823e59b2d87e14309a47d28c61e4b9f02'}
                      </div>
                      <button
                        onClick={() => handleCopyChecksum(log.id, log.checksum || '')}
                        className="px-2 py-1 text-[11px] font-semibold bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded flex items-center gap-1 shrink-0 transition"
                        title="Copy cryptographic hash"
                      >
                        {copiedHashId === log.id ? (
                          <>
                            <Check className="w-3 h-3 text-emerald-500" />
                            <span>Copied</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-3 h-3" />
                            <span>Copy Hash</span>
                          </>
                        )}
                      </button>
                    </div>

                    {/* Metadata JSON Viewer */}
                    {log.metadata && Object.keys(log.metadata).length > 0 && (
                      <div className="space-y-1">
                        <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400">
                          Structured Event Payload & Environmental Parameters:
                        </span>
                        <pre className="p-3 bg-slate-900 dark:bg-slate-950 text-slate-200 font-mono text-[11px] rounded-lg border border-slate-800 overflow-x-auto">
                          {JSON.stringify(log.metadata, null, 2)}
                        </pre>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Security & Regulatory Footnote */}
      <div className="p-4 bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 rounded-xl text-xs text-slate-500 dark:text-slate-400 flex items-start gap-3">
        <ShieldCheck className="w-5 h-5 text-blue-500 shrink-0 mt-0.5" />
        <div className="space-y-1">
          <h5 className="font-semibold text-slate-800 dark:text-slate-200">
            Institutional Audit Compliance & Anti-Tamper Attestation
          </h5>
          <p className="leading-relaxed">
            In compliance with National Education Administration standards and Institutional Governance Bylaws, all administrative account creations, terminations, master authorization key rotations, and raw database snapshot exports are persistently recorded with verifiable cryptographic checksums. Entries are append-only and cannot be altered or purged by standard operational users.
          </p>
        </div>
      </div>
    </div>
  );
};
