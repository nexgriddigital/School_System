import React, { useState, useRef, useEffect } from 'react';
import { useSchool } from '../../context/SchoolContext';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Zap, 
  X, 
  UserPlus, 
  Receipt, 
  FileSpreadsheet, 
  KeyRound, 
  ShieldAlert, 
  ChevronRight,
  Sparkles,
  Layers,
  ArrowUpRight,
  GraduationCap,
  CreditCard,
  Building2
} from 'lucide-react';
import { QuickRegisterModal } from './quickActions/QuickRegisterModal';
import { QuickReceiptModal } from './quickActions/QuickReceiptModal';
import { QuickAuditReportModal } from './quickActions/QuickAuditReportModal';
import { QuickPasswordResetModal } from './quickActions/QuickPasswordResetModal';

export const QuickActionsFAB: React.FC = () => {
  const { currentRole, setCurrentRole, isAuthenticated } = useSchool();

  // Strict institutional permission check: only Registrar, Finance, and Principal
  const isAuthorized = isAuthenticated && (
    currentRole === 'REGISTRAR' || 
    currentRole === 'FINANCE' || 
    currentRole === 'PRINCIPAL'
  );

  const [isOpen, setIsOpen] = useState(false);
  const [activeModal, setActiveModal] = useState<'REGISTER' | 'RECEIPT' | 'AUDIT' | 'PASSWORD_RESET' | null>(null);

  const menuRef = useRef<HTMLDivElement>(null);

  // Close on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (activeModal) {
          setActiveModal(null);
        } else if (isOpen) {
          setIsOpen(false);
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, activeModal]);

  if (!isAuthorized) {
    return null;
  }

  const roleLabel = 
    currentRole === 'PRINCIPAL' ? 'Principal & Executive Oversight' :
    currentRole === 'FINANCE' ? 'Finance & Bursar Office' :
    'Admissions & Registrar';

  const roleBadgeColor =
    currentRole === 'PRINCIPAL' ? 'bg-purple-100 text-purple-900 border-purple-200 dark:bg-purple-950/80 dark:text-purple-300 dark:border-purple-800' :
    currentRole === 'FINANCE' ? 'bg-emerald-100 text-emerald-900 border-emerald-200 dark:bg-emerald-950/80 dark:text-emerald-300 dark:border-emerald-800' :
    'bg-blue-100 text-blue-900 border-blue-200 dark:bg-blue-950/80 dark:text-blue-300 dark:border-blue-800';

  return (
    <>
      {/* Floating Action Button Container */}
      <div 
        ref={menuRef}
        className="fixed bottom-6 right-28 sm:right-32 max-sm:bottom-20 max-sm:right-4 z-40 select-none"
      >
        {/* Speed Dial Menu Popover */}
        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ opacity: 0, scale: 0.88, y: 16 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 12 }}
              transition={{ duration: 0.18, ease: 'easeOut' }}
              className="absolute bottom-16 right-0 mb-2 w-80 sm:w-88 rounded-2xl bg-white/95 dark:bg-slate-900/95 backdrop-blur-md shadow-2xl border border-slate-200/90 dark:border-slate-800 p-3 text-slate-900 dark:text-slate-100 origin-bottom-right"
            >
              {/* Menu Header */}
              <div className="flex items-center justify-between px-2 pt-1 pb-2.5 border-b border-slate-100 dark:border-slate-800/80">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-lg bg-indigo-600/10 text-indigo-600 dark:bg-indigo-500/20 dark:text-indigo-400 flex items-center justify-center">
                    <Zap className="w-3.5 h-3.5 fill-current" />
                  </div>
                  <div>
                    <h4 className="font-bold text-xs text-slate-900 dark:text-white">
                      Administrative Quick Actions
                    </h4>
                    <span className={`text-[10px] font-semibold px-1.5 py-0.2 rounded border inline-block mt-0.5 ${roleBadgeColor}`}>
                      {roleLabel}
                    </span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Action List */}
              <div className="py-2 space-y-1.5">
                
                {/* 1. Register Student */}
                <button
                  type="button"
                  onClick={() => {
                    setActiveModal('REGISTER');
                    setIsOpen(false);
                  }}
                  className="w-full p-2.5 rounded-xl hover:bg-blue-50/80 dark:hover:bg-blue-950/40 text-left transition flex items-center gap-3 group cursor-pointer border border-transparent hover:border-blue-200 dark:hover:border-blue-800/60"
                >
                  <div className="w-9 h-9 rounded-xl bg-blue-100 text-blue-600 dark:bg-blue-900/50 dark:text-blue-400 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                    <UserPlus className="w-4 h-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-xs text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                        Register Student
                      </span>
                      <ChevronRight className="w-3.5 h-3.5 text-slate-400 group-hover:translate-x-0.5 transition-transform" />
                    </div>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
                      Admissions enrollment & auto tuition billing
                    </p>
                  </div>
                </button>

                {/* 2. Issue Receipt */}
                <button
                  type="button"
                  onClick={() => {
                    setActiveModal('RECEIPT');
                    setIsOpen(false);
                  }}
                  className="w-full p-2.5 rounded-xl hover:bg-emerald-50/80 dark:hover:bg-emerald-950/40 text-left transition flex items-center gap-3 group cursor-pointer border border-transparent hover:border-emerald-200 dark:hover:border-emerald-800/60"
                >
                  <div className="w-9 h-9 rounded-xl bg-emerald-100 text-emerald-600 dark:bg-emerald-900/50 dark:text-emerald-400 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                    <Receipt className="w-4 h-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-xs text-slate-900 dark:text-white group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                        Issue Receipt
                      </span>
                      <ChevronRight className="w-3.5 h-3.5 text-slate-400 group-hover:translate-x-0.5 transition-transform" />
                    </div>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
                      Digital payment voucher with PAID BILL watermark
                    </p>
                  </div>
                </button>

                {/* 3. Generate Audit Report */}
                <button
                  type="button"
                  onClick={() => {
                    setActiveModal('AUDIT');
                    setIsOpen(false);
                  }}
                  className="w-full p-2.5 rounded-xl hover:bg-purple-50/80 dark:hover:bg-purple-950/40 text-left transition flex items-center gap-3 group cursor-pointer border border-transparent hover:border-purple-200 dark:hover:border-purple-800/60"
                >
                  <div className="w-9 h-9 rounded-xl bg-purple-100 text-purple-600 dark:bg-purple-900/50 dark:text-purple-400 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                    <FileSpreadsheet className="w-4 h-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-xs text-slate-900 dark:text-white group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors">
                        Generate Audit Report
                      </span>
                      <ChevronRight className="w-3.5 h-3.5 text-slate-400 group-hover:translate-x-0.5 transition-transform" />
                    </div>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
                      Export SHA-256 tamper-evident CSV & JSON logs
                    </p>
                  </div>
                </button>

                {/* 4. Reset User Password */}
                <button
                  type="button"
                  onClick={() => {
                    setActiveModal('PASSWORD_RESET');
                    setIsOpen(false);
                  }}
                  className="w-full p-2.5 rounded-xl hover:bg-amber-50/80 dark:hover:bg-amber-950/40 text-left transition flex items-center gap-3 group cursor-pointer border border-transparent hover:border-amber-200 dark:hover:border-amber-800/60"
                >
                  <div className="w-9 h-9 rounded-xl bg-amber-100 text-amber-600 dark:bg-amber-900/50 dark:text-amber-400 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                    <KeyRound className="w-4 h-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-xs text-slate-900 dark:text-white group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors">
                        Reset Account Password
                      </span>
                      <ChevronRight className="w-3.5 h-3.5 text-slate-400 group-hover:translate-x-0.5 transition-transform" />
                    </div>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
                      Authorized temporary credential generator
                    </p>
                  </div>
                </button>
              </div>

              {/* Quick Workspace Navigation Bar */}
              <div className="pt-2 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between px-1">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                  Switch Workspace:
                </span>
                <div className="flex items-center gap-1 text-[10px]">
                  <button
                    type="button"
                    onClick={() => {
                      setCurrentRole('REGISTRAR');
                      setIsOpen(false);
                    }}
                    className={`px-2 py-0.5 rounded font-bold transition cursor-pointer ${
                      currentRole === 'REGISTRAR' 
                        ? 'bg-blue-600 text-white' 
                        : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                    }`}
                  >
                    Registrar
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setCurrentRole('FINANCE');
                      setIsOpen(false);
                    }}
                    className={`px-2 py-0.5 rounded font-bold transition cursor-pointer ${
                      currentRole === 'FINANCE' 
                        ? 'bg-emerald-600 text-white' 
                        : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                    }`}
                  >
                    Finance
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setCurrentRole('PRINCIPAL');
                      setIsOpen(false);
                    }}
                    className={`px-2 py-0.5 rounded font-bold transition cursor-pointer ${
                      currentRole === 'PRINCIPAL' 
                        ? 'bg-purple-600 text-white' 
                        : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                    }`}
                  >
                    Principal
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Primary FAB Trigger Button */}
        <motion.button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className={`h-11 sm:h-12 px-3.5 sm:px-4 rounded-full shadow-lg flex items-center gap-2 text-white font-bold text-xs transition-all cursor-pointer border ${
            isOpen
              ? 'bg-slate-800 hover:bg-slate-900 border-slate-700 shadow-slate-900/30'
              : 'bg-gradient-to-r from-indigo-600 via-indigo-700 to-purple-700 hover:from-indigo-500 hover:to-purple-600 border-indigo-400/40 shadow-indigo-600/30'
          }`}
          title="Administrative Quick Actions (Registrar, Finance, Principal)"
          aria-label="Administrative Quick Actions Menu"
          aria-expanded={isOpen}
        >
          <div className="relative flex items-center justify-center">
            {isOpen ? (
              <X className="w-4 h-4 transition-transform duration-200 rotate-90" />
            ) : (
              <Zap className="w-4 h-4 fill-amber-300 text-amber-300 animate-pulse" />
            )}
          </div>
          <span className="hidden sm:inline tracking-wide">
            {isOpen ? 'Close Actions' : 'Quick Actions'}
          </span>
          <span className="sm:hidden">
            {isOpen ? 'Close' : 'Quick'}
          </span>
        </motion.button>
      </div>

      {/* Sub-modals */}
      <QuickRegisterModal
        isOpen={activeModal === 'REGISTER'}
        onClose={() => setActiveModal(null)}
      />
      <QuickReceiptModal
        isOpen={activeModal === 'RECEIPT'}
        onClose={() => setActiveModal(null)}
      />
      <QuickAuditReportModal
        isOpen={activeModal === 'AUDIT'}
        onClose={() => setActiveModal(null)}
      />
      <QuickPasswordResetModal
        isOpen={activeModal === 'PASSWORD_RESET'}
        onClose={() => setActiveModal(null)}
      />
    </>
  );
};
