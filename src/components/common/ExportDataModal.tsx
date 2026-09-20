import React, { useState } from 'react';
import { 
  Download, 
  X, 
  FileSpreadsheet, 
  CheckCircle2, 
  Filter, 
  Database, 
  Layers,
  Sparkles
} from 'lucide-react';
import { Student, Invoice, BankStatementRow } from '../../types';
import { 
  exportStudentsCsv, 
  exportInvoicesCsv, 
  exportBankStatementsCsv,
  STUDENT_CSV_COLUMNS,
  INVOICE_CSV_COLUMNS,
  BANK_STATEMENT_CSV_COLUMNS
} from '../../utils/csvExport';

export type ExportType = 'STUDENTS' | 'FINANCE_INVOICES' | 'FINANCE_BANK_STATEMENTS';

interface ExportDataModalProps {
  isOpen: boolean;
  onClose: () => void;
  exportType: ExportType;
  // Student props
  filteredStudents?: Student[];
  allStudents?: Student[];
  admissionsFilterSummary?: {
    searchQuery: string;
    filterGrade: string;
  };
  // Finance props
  filteredInvoices?: Invoice[];
  allInvoices?: Invoice[];
  bankStatements?: BankStatementRow[];
  financeFilterSummary?: {
    searchQuery: string;
    filterStatus: string;
  };
}

export const ExportDataModal: React.FC<ExportDataModalProps> = ({
  isOpen,
  onClose,
  exportType,
  filteredStudents = [],
  allStudents = [],
  admissionsFilterSummary,
  filteredInvoices = [],
  allInvoices = [],
  bankStatements = [],
  financeFilterSummary,
}) => {
  if (!isOpen) return null;

  const [selectedFinanceDataset, setSelectedFinanceDataset] = useState<'INVOICES' | 'BANK_STATEMENTS'>('INVOICES');
  const [exportScope, setExportScope] = useState<'FILTERED' | 'ALL'>('FILTERED');
  const [downloadSuccess, setDownloadSuccess] = useState(false);

  // Compute record counts based on type & scope
  let filteredCount = 0;
  let totalCount = 0;
  let datasetTitle = '';
  let activeFilterBadge = '';
  let columnsList: string[] = [];

  if (exportType === 'STUDENTS') {
    datasetTitle = 'Student Records & Enrollment Directory';
    filteredCount = filteredStudents.length;
    totalCount = allStudents.length;
    columnsList = STUDENT_CSV_COLUMNS.map(c => c.header);
    
    const filters: string[] = [];
    if (admissionsFilterSummary?.filterGrade && admissionsFilterSummary.filterGrade !== 'ALL') {
      filters.push(`Grade ${admissionsFilterSummary.filterGrade}`);
    }
    if (admissionsFilterSummary?.searchQuery?.trim()) {
      filters.push(`Search: "${admissionsFilterSummary.searchQuery.trim()}"`);
    }
    activeFilterBadge = filters.length > 0 ? filters.join(' • ') : 'Showing All Grades (No search filter)';
  } else {
    // Finance
    if (selectedFinanceDataset === 'INVOICES') {
      datasetTitle = 'Tuition Fee Ledger & Invoices';
      filteredCount = filteredInvoices.length;
      totalCount = allInvoices.length;
      columnsList = INVOICE_CSV_COLUMNS.map(c => c.header);

      const filters: string[] = [];
      if (financeFilterSummary?.filterStatus && financeFilterSummary.filterStatus !== 'ALL') {
        filters.push(`Status: ${financeFilterSummary.filterStatus}`);
      }
      if (financeFilterSummary?.searchQuery?.trim()) {
        filters.push(`Search: "${financeFilterSummary.searchQuery.trim()}"`);
      }
      activeFilterBadge = filters.length > 0 ? filters.join(' • ') : 'All Statuses (No search filter)';
    } else {
      datasetTitle = 'Bank Statement Transaction Records';
      filteredCount = bankStatements.length;
      totalCount = bankStatements.length;
      columnsList = BANK_STATEMENT_CSV_COLUMNS.map(c => c.header);
      activeFilterBadge = 'All Feed Transactions';
    }
  }

  const recordsToExportCount = exportScope === 'FILTERED' ? filteredCount : totalCount;

  const handleExecuteExport = () => {
    if (exportType === 'STUDENTS') {
      const data = exportScope === 'FILTERED' ? filteredStudents : allStudents;
      const tag = exportScope === 'FILTERED' && admissionsFilterSummary?.filterGrade !== 'ALL'
        ? `Grade_${admissionsFilterSummary?.filterGrade}` 
        : 'Directory';
      exportStudentsCsv(data, { filterLabel: tag });
    } else {
      if (selectedFinanceDataset === 'INVOICES') {
        const data = exportScope === 'FILTERED' ? filteredInvoices : allInvoices;
        const tag = exportScope === 'FILTERED' && financeFilterSummary?.filterStatus !== 'ALL'
          ? financeFilterSummary?.filterStatus
          : 'Ledger';
        exportInvoicesCsv(data, { filterLabel: tag });
      } else {
        exportBankStatementsCsv(bankStatements, { filterLabel: 'Reconciliation' });
      }
    }

    setDownloadSuccess(true);
    setTimeout(() => {
      setDownloadSuccess(false);
      onClose();
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl max-w-lg w-full overflow-hidden border border-slate-200 dark:border-slate-800 animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-800/60">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-100 dark:bg-emerald-950/70 text-emerald-700 dark:text-emerald-400 flex items-center justify-center">
              <FileSpreadsheet className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-oskar-vintage text-base font-bold text-slate-900 dark:text-white tracking-wider">
                Export Data to CSV
              </h3>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                Official external reporting and spreadsheet extraction
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 rounded-lg hover:bg-slate-200/60 dark:hover:bg-slate-800 transition cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 space-y-5 text-xs text-slate-700 dark:text-slate-300">
          
          {/* Dataset Type (only if Finance) */}
          {exportType !== 'STUDENTS' && (
            <div>
              <label className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 block mb-2">
                Select Financial Dataset
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setSelectedFinanceDataset('INVOICES')}
                  className={`p-3 rounded-xl border text-left transition flex items-start gap-2 cursor-pointer ${
                    selectedFinanceDataset === 'INVOICES'
                      ? 'border-blue-600 bg-blue-50/60 dark:bg-blue-950/40 text-blue-900 dark:text-blue-200 font-semibold'
                      : 'border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/60'
                  }`}
                >
                  <Database className="w-4 h-4 text-blue-600 dark:text-blue-400 shrink-0 mt-0.5" />
                  <div>
                    <p className="text-xs font-bold">Fee Ledger & Invoices</p>
                    <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5">
                      {allInvoices.length} student invoices & receipts
                    </p>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => setSelectedFinanceDataset('BANK_STATEMENTS')}
                  className={`p-3 rounded-xl border text-left transition flex items-start gap-2 cursor-pointer ${
                    selectedFinanceDataset === 'BANK_STATEMENTS'
                      ? 'border-blue-600 bg-blue-50/60 dark:bg-blue-950/40 text-blue-900 dark:text-blue-200 font-semibold'
                      : 'border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/60'
                  }`}
                >
                  <Layers className="w-4 h-4 text-blue-600 dark:text-blue-400 shrink-0 mt-0.5" />
                  <div>
                    <p className="text-xs font-bold">Bank Statement Feed</p>
                    <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5">
                      {bankStatements.length} reconciled CBE feed rows
                    </p>
                  </div>
                </button>
              </div>
            </div>
          )}

          {/* Active Filter Criteria Summary Card */}
          <div className="p-3.5 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-800 space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5 text-slate-800 dark:text-slate-200 font-semibold">
                <Filter className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                <span>Active Filter Criteria</span>
              </div>
              <span className="text-[10px] bg-blue-100 dark:bg-blue-950/80 text-blue-800 dark:text-blue-300 font-bold px-2 py-0.5 rounded-full">
                {filteredCount} Matches
              </span>
            </div>
            <p className="text-[11px] text-slate-600 dark:text-slate-400 font-mono bg-white dark:bg-slate-900 p-2 rounded-lg border border-slate-200 dark:border-slate-700">
              {activeFilterBadge}
            </p>
          </div>

          {/* Scope Selection: Filtered vs All */}
          <div>
            <label className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 block mb-2">
              Export Scope
            </label>
            <div className="space-y-2">
              <label 
                className={`flex items-start gap-3 p-3 rounded-xl border cursor-pointer transition ${
                  exportScope === 'FILTERED'
                    ? 'border-emerald-600 bg-emerald-50/50 dark:bg-emerald-950/30 text-emerald-950 dark:text-emerald-200'
                    : 'border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/50'
                }`}
              >
                <input
                  type="radio"
                  name="exportScope"
                  checked={exportScope === 'FILTERED'}
                  onChange={() => setExportScope('FILTERED')}
                  className="mt-1 text-emerald-600 focus:ring-emerald-500"
                />
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-xs">Filtered Records In Current View</span>
                    <span className="text-xs font-mono font-bold text-emerald-700 dark:text-emerald-400">
                      {filteredCount} Records
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                    Exports records matching your active search query and selected filter options. Ideal for department-specific or grade-specific reports.
                  </p>
                </div>
              </label>

              <label 
                className={`flex items-start gap-3 p-3 rounded-xl border cursor-pointer transition ${
                  exportScope === 'ALL'
                    ? 'border-emerald-600 bg-emerald-50/50 dark:bg-emerald-950/30 text-emerald-950 dark:text-emerald-200'
                    : 'border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/50'
                }`}
              >
                <input
                  type="radio"
                  name="exportScope"
                  checked={exportScope === 'ALL'}
                  onChange={() => setExportScope('ALL')}
                  className="mt-1 text-emerald-600 focus:ring-emerald-500"
                />
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-xs">Entire Institutional Database</span>
                    <span className="text-xs font-mono font-bold text-slate-600 dark:text-slate-300">
                      {totalCount} Total
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                    Exports all records across the school system, bypassing any current UI filters.
                  </p>
                </div>
              </label>
            </div>
          </div>

          {/* Included CSV Columns Summary */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                Included Report Columns ({columnsList.length} Columns)
              </span>
              <span className="text-[10px] text-slate-400">RFC-4180 / UTF-8 BOM</span>
            </div>
            <div className="flex flex-wrap gap-1.5 max-h-24 overflow-y-auto p-2 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-slate-700 text-[10px]">
              {columnsList.map((col, idx) => (
                <span 
                  key={idx} 
                  className="px-2 py-0.5 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 rounded border border-slate-200 dark:border-slate-700"
                >
                  {col}
                </span>
              ))}
            </div>
          </div>

          {/* Download feedback message */}
          {downloadSuccess && (
            <div className="p-3 bg-emerald-100 dark:bg-emerald-950/80 text-emerald-900 dark:text-emerald-200 rounded-xl border border-emerald-300 dark:border-emerald-800 flex items-center gap-2 animate-in fade-in">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span className="font-semibold text-xs">
                CSV report downloaded successfully! Check your downloads folder.
              </span>
            </div>
          )}
        </div>

        {/* Modal Actions Footer */}
        <div className="px-6 py-4 bg-slate-50/80 dark:bg-slate-800/60 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition cursor-pointer"
          >
            Cancel
          </button>

          <button
            type="button"
            onClick={handleExecuteExport}
            disabled={recordsToExportCount === 0}
            className={`px-4 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 shadow-sm transition cursor-pointer active:scale-95 ${
              recordsToExportCount > 0
                ? 'bg-emerald-600 hover:bg-emerald-700 text-white'
                : 'bg-slate-300 dark:bg-slate-800 text-slate-500 cursor-not-allowed'
            }`}
          >
            <Download className="w-4 h-4" />
            Download {recordsToExportCount} Records as CSV
          </button>
        </div>

      </div>
    </div>
  );
};
