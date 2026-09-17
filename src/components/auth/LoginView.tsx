import React, { useState } from 'react';
import { useSchool } from '../../context/SchoolContext';
import { UserRole } from '../../types';
import { 
  Building2, 
  CreditCard, 
  Layers, 
  HeartHandshake, 
  GraduationCap, 
  Users, 
  User, 
  Home, 
  Lock, 
  UserCheck, 
  ShieldAlert,
  ArrowRight,
  Eye,
  EyeOff
} from 'lucide-react';
import { AllTemplatesBottomSection } from '../common/AllTemplatesBottomSection';

export const LoginView: React.FC = () => {
  const { schoolName, login } = useSchool();
  
  const [selectedRole, setSelectedRole] = useState<UserRole>('REGISTRAR');
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const roleCategories: {
    title: string;
    roles: { role: UserRole; label: string; icon: React.FC<{ className?: string }>; hintId: string }[];
  }[] = [
    {
      title: 'School Administration',
      roles: [
        { role: 'REGISTRAR', label: 'Admissions & Registrar', icon: Building2, hintId: 'registrar@oskaracademy.edu' },
        { role: 'FINANCE', label: 'Finance Office', icon: CreditCard, hintId: 'finance@oskaracademy.edu' },
        { role: 'PRINCIPAL', label: 'Principal / Head', icon: GraduationCap, hintId: 'principal@oskaracademy.edu' },
        { role: 'PROGRAM_OFFICE', label: 'Program Office', icon: Layers, hintId: 'program.office@oskaracademy.edu' },
        { role: 'COUNSELLOR', label: 'Counsellor & Discipline', icon: HeartHandshake, hintId: 'counselling@oskaracademy.edu' },
      ]
    },
    {
      title: 'Faculty & Community',
      roles: [
        { role: 'TEACHER', label: 'Teachers Portal', icon: Users, hintId: 'TCH-001' },
        { role: 'STUDENT', label: 'Student Scholar Portal', icon: User, hintId: 'OSK-2026-0901' },
        { role: 'PARENT', label: 'Parent / Guardian Portal', icon: Home, hintId: '+251-91-123-4567' },
      ]
    }
  ];

  const currentRoleMeta = roleCategories
    .flatMap(c => c.roles)
    .find(r => r.role === selectedRole) || roleCategories[0].roles[0];

  const handleRoleSelect = (role: UserRole) => {
    setSelectedRole(role);
    setErrorMsg(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMsg(null);

    setTimeout(() => {
      login(selectedRole, identifier || currentRoleMeta.hintId, password || 'password');
      setIsLoading(false);
    }, 400);
  };

  return (
    <div className="py-8 space-y-12">
      {/* Login Container */}
      <div className="max-w-xl mx-auto bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden">
        {/* Header banner */}
        <div className="bg-linear-to-r from-[#0B192C] via-[#1E3E62] to-[#0B192C] px-6 py-6 text-white text-center border-b border-slate-800">
          <div className="w-14 h-14 mx-auto rounded-2xl bg-blue-600/90 text-white flex items-center justify-center font-oskar font-bold text-2xl shadow-lg border border-blue-400/40 mb-3">
            {schoolName.charAt(0) || 'A'}
          </div>
          <h2 className="text-xl font-bold font-oskar tracking-wide">{schoolName}</h2>
          <p className="text-xs text-blue-200 mt-1">Authorized Stakeholder Sign-In Portal</p>
        </div>

        {/* Form Body */}
        <div className="p-6 sm:p-8 space-y-6">
          {/* Stakeholder Role Selection */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-2">
              Select Department or Portal:
            </label>
            <div className="space-y-3">
              {roleCategories.map((cat) => (
                <div key={cat.title}>
                  <p className="text-[11px] font-semibold text-slate-400 mb-1.5">{cat.title}</p>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {cat.roles.map(({ role, label, icon: Icon }) => {
                      const isSelected = selectedRole === role;
                      return (
                        <button
                          key={role}
                          type="button"
                          onClick={() => handleRoleSelect(role)}
                          className={`flex items-center gap-2 p-2 rounded-xl text-left border text-xs transition cursor-pointer ${
                            isSelected
                              ? 'bg-blue-50 border-blue-600 text-blue-900 font-bold shadow-xs'
                              : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50 hover:border-slate-300'
                          }`}
                        >
                          <Icon className={`w-4 h-4 shrink-0 ${isSelected ? 'text-blue-600' : 'text-slate-400'}`} />
                          <span className="truncate">{label}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Credentials Form */}
          <form onSubmit={handleSubmit} className="space-y-4 pt-2 border-t border-slate-100">
            {errorMsg && (
              <div className="p-3 bg-red-50 text-red-700 rounded-lg text-xs border border-red-200 flex items-center gap-2">
                <ShieldAlert className="w-4 h-4 shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Account ID / Email / Username
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  placeholder={`e.g. ${currentRoleMeta.hintId}`}
                  className="w-full pl-9 pr-3 py-2 text-sm bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                />
                <UserCheck className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your security password"
                  className="w-full pl-9 pr-10 py-2 text-sm bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                />
                <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Credential Authority Policy Notice */}
            <div className="p-3 bg-amber-50/80 border border-amber-200/80 rounded-xl text-amber-900 text-xs flex items-start gap-2.5">
              <ShieldAlert className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              <div className="space-y-0.5">
                <p className="font-semibold text-amber-950">Credential Security Policy:</p>
                <p className="text-[11px] text-amber-800 leading-relaxed">
                  Password resets are strictly permitted only via the <strong>Finance Office</strong>, <strong>Registrar</strong>, or <strong>Principal</strong> upon official verification.
                </p>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-2.5 px-4 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-semibold rounded-xl text-sm shadow-md transition flex items-center justify-center gap-2 cursor-pointer"
            >
              <span>{isLoading ? 'Authenticating...' : `Sign In to ${currentRoleMeta.label}`}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>
        </div>
      </div>

      {/* System Templates & Portal Catalog */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <AllTemplatesBottomSection />
      </div>
    </div>
  );
};
