import React, { useState, useRef, useEffect } from 'react';
import { useSchool } from '../../context/SchoolContext';
import { ShieldCheck, ShieldAlert, Clock, Lock, Check, ChevronDown, AlertCircle, Play } from 'lucide-react';

export const SessionSecurityIndicator: React.FC = () => {
  const {
    isAuthenticated,
    sessionTimeoutMinutes,
    setSessionTimeoutMinutes,
    recordUserActivity,
    triggerSessionTimeout,
    logout
  } = useSchool();

  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  if (!isAuthenticated) return null;

  const timeoutOptions = [
    { value: 1, label: '1 Minute', desc: 'Demo & Security Testing' },
    { value: 5, label: '5 Minutes', desc: 'Front-Desk & Public Terminals' },
    { value: 15, label: '15 Minutes', desc: 'Standard Institutional Policy (Recommended)' },
    { value: 30, label: '30 Minutes', desc: 'Extended Faculty Work' },
    { value: 60, label: '60 Minutes', desc: 'Administrative Deep Work' },
  ];

  // Helper to trigger test countdown warning immediately for demo/testing
  const handleTestWarning = () => {
    setIsOpen(false);
    // Setting 1 minute timeout and advancing activity back simulates warning threshold immediately
    setSessionTimeoutMinutes(1);
    // Reset activity now so timer begins cleanly
    recordUserActivity();
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Header Button */}
      <button
        id="btn-session-security-indicator"
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-slate-800/90 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-medium transition cursor-pointer group"
        title="Institutional Session Inactivity Timeout Settings"
      >
        <div className="relative flex items-center justify-center">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-400 group-hover:text-emerald-300 transition" />
          <span className="absolute -top-0.5 -right-0.5 w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse ring-1 ring-slate-900" />
        </div>
        <span className="hidden sm:inline text-[11px] font-mono font-semibold text-emerald-300">
          {sessionTimeoutMinutes}m Auto-Lock
        </span>
        <ChevronDown className="w-3 h-3 text-slate-400 group-hover:text-slate-200 transition" />
      </button>

      {/* Popover Dropdown */}
      {isOpen && (
        <div 
          id="session-security-dropdown"
          className="absolute right-0 mt-2 w-80 bg-white text-slate-800 rounded-2xl shadow-2xl border border-slate-200 p-4 z-50 animate-in fade-in zoom-in-95 duration-150"
        >
          {/* Header */}
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <div className="p-1.5 bg-emerald-50 rounded-lg border border-emerald-200 text-emerald-700">
                <ShieldCheck className="w-4 h-4" />
              </div>
              <div>
                <h4 className="font-bold text-xs text-slate-900 leading-tight">Session Inactivity Timeout</h4>
                <p className="text-[10px] text-slate-500 font-medium">Institutional Data Safeguard</p>
              </div>
            </div>
            <span className="text-[10px] bg-emerald-100 text-emerald-800 font-mono font-bold px-2 py-0.5 rounded-full">
              ACTIVE
            </span>
          </div>

          {/* Compliance statement */}
          <p className="text-[11px] text-slate-500 my-3 leading-relaxed">
            Automatically logs out idle workstations after a period of inactivity to prevent unauthorized access to sensitive institutional records.
          </p>

          {/* Timeout Options */}
          <div className="space-y-1.5">
            <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block px-1">
              Select Inactivity Duration
            </label>
            {timeoutOptions.map(opt => {
              const isSelected = sessionTimeoutMinutes === opt.value;
              return (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => {
                    setSessionTimeoutMinutes(opt.value);
                    recordUserActivity();
                  }}
                  className={`w-full flex items-center justify-between p-2 rounded-xl text-left text-xs transition cursor-pointer ${
                    isSelected 
                      ? 'bg-blue-50 text-blue-900 border border-blue-200 font-semibold' 
                      : 'hover:bg-slate-50 text-slate-700 border border-transparent'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <Clock className={`w-3.5 h-3.5 ${isSelected ? 'text-blue-600' : 'text-slate-400'}`} />
                    <div>
                      <div className="text-xs font-semibold">{opt.label}</div>
                      <div className="text-[10px] text-slate-400 font-normal leading-none mt-0.5">{opt.desc}</div>
                    </div>
                  </div>
                  {isSelected && (
                    <Check className="w-4 h-4 text-blue-600 shrink-0" />
                  )}
                </button>
              );
            })}
          </div>

          {/* Quick Actions */}
          <div className="mt-4 pt-3 border-t border-slate-100 flex flex-col gap-2">
            <button
              type="button"
              onClick={handleTestWarning}
              className="w-full py-1.5 px-3 bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200 rounded-xl text-xs font-medium flex items-center justify-center gap-1.5 transition cursor-pointer"
              title="Sets timeout to 1 min so you can see the warning countdown immediately"
            >
              <Play className="w-3 h-3 text-amber-600" />
              <span>Test Inactivity Warning (1 min mode)</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setIsOpen(false);
                logout();
              }}
              className="w-full py-1.5 px-3 bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition cursor-pointer"
            >
              <Lock className="w-3 h-3 text-slate-500" />
              <span>Lock Terminal Immediately</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
