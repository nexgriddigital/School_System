import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Shield, BookOpen, Download, ChevronUp, ChevronDown, Sparkles, Award } from 'lucide-react';
import { useSchool } from '../../context/SchoolContext';
import { downloadInstructionsManualPdf } from '../../services/manualPdfService';

interface ProductionWatermarkProps {
  onOpenTerms: () => void;
  onOpenManual: () => void;
}

export const ProductionWatermark: React.FC<ProductionWatermarkProps> = ({
  onOpenTerms,
  onOpenManual,
}) => {
  const { schoolName } = useSchool();
  const [isExpanded, setIsExpanded] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);

  const handleQuickDownload = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsDownloading(true);
    try {
      downloadInstructionsManualPdf(schoolName);
    } catch (err) {
      console.error(err);
    } finally {
      setTimeout(() => setIsDownloading(false), 800);
    }
  };

  return (
    <aside aria-label="NexGrid Production Badge" className="fixed bottom-3 right-3 z-30 flex flex-col items-end pointer-events-auto select-none print:hidden">
      <motion.div
        layout
        className="bg-slate-900/90 hover:bg-slate-900 text-white backdrop-blur-md rounded-2xl shadow-xl border border-slate-700/80 p-2.5 transition-all text-xs"
      >
        <div className="flex items-center gap-2.5">
          {/* NexGrid Badge Icon */}
          <div className="w-6 h-6 rounded-lg bg-blue-600 text-white flex items-center justify-center font-bold text-[11px] shadow-xs shrink-0">
            N
          </div>

          <div className="text-left cursor-pointer" onClick={() => setIsExpanded(!isExpanded)}>
            <div className="flex items-center gap-1.5">
              <span className="font-bold tracking-tight text-white text-xs">
                Designed and Developed by NexGrid Digital Systems
              </span>
              <span className="text-[9px] bg-emerald-500/20 text-emerald-300 font-mono px-1.5 py-0.2 rounded border border-emerald-400/30">
                PROD v2.4
              </span>
            </div>
            <p className="text-[10px] text-slate-400">
              {schoolName} • Customer Presentation Edition
            </p>
          </div>

          {/* Quick Action Buttons */}
          <div className="flex items-center gap-1 ml-1">
            <button
              type="button"
              onClick={handleQuickDownload}
              disabled={isDownloading}
              className="p-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white transition cursor-pointer shadow-xs"
              title="Download Instructions Manual PDF (With NexGrid Digital Letterhead)"
            >
              {isDownloading ? (
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ repeat: Infinity, duration: 0.8, ease: 'linear' }}
                  className="w-3.5 h-3.5 border border-white/40 border-t-white rounded-full"
                />
              ) : (
                <Download className="w-3.5 h-3.5" />
              )}
            </button>

            <button
              type="button"
              onClick={() => setIsExpanded(!isExpanded)}
              className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition cursor-pointer"
              title={isExpanded ? 'Collapse' : 'Expand Options'}
            >
              {isExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronUp className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* Expanded Drawer Options */}
        <AnimatePresence>
          {isExpanded && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.2 }}
              className="mt-2.5 pt-2 border-t border-slate-700/80 flex flex-wrap items-center gap-2"
            >
              <button
                type="button"
                onClick={onOpenTerms}
                className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-[11px] font-semibold transition cursor-pointer border border-slate-600/50"
              >
                <Shield className="w-3 h-3 text-blue-400" />
                <span>Terms & Conditions</span>
              </button>

              <button
                type="button"
                onClick={onOpenManual}
                className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-[11px] font-semibold transition cursor-pointer border border-slate-600/50"
              >
                <BookOpen className="w-3 h-3 text-amber-400" />
                <span>Interactive User Manual</span>
              </button>

              <button
                type="button"
                onClick={handleQuickDownload}
                disabled={isDownloading}
                className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-blue-600/80 hover:bg-blue-600 text-white text-[11px] font-semibold transition cursor-pointer"
              >
                <Download className="w-3 h-3" />
                <span>Download PDF Manual</span>
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </aside>
  );
};
