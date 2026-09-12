import React from 'react';
import { Dna, Activity, PlusCircle, Bell, RefreshCw, UserCheck, ShieldCheck } from 'lucide-react';
import { Analysis, UserSession } from '../types/bioinformatics';

interface NavbarProps {
  user?: UserSession | { name?: string; fullName?: string; role?: string; email?: string } | null;
  currentUser?: { name?: string; fullName?: string; role?: string; email?: string } | null;
  analyses?: Analysis[];
  currentPage?: string;
  onNavigate: (page: string, analysisId?: string) => void;
  onResetDemoData?: () => void;
  onLogout?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  user,
  currentUser,
  analyses = [],
  currentPage,
  onNavigate,
  onResetDemoData,
  onLogout
}) => {
  const safeAnalyses = analyses || [];
  const runningCount = safeAnalyses.filter((a) => a && (a.status === 'Running' || a.status === 'Validating')).length;
  const runningAnalysis = safeAnalyses.find((a) => a && a.status === 'Running');

  const activeUser = user || currentUser;
  const displayName =
    (activeUser && 'fullName' in activeUser && activeUser.fullName) ||
    (activeUser && 'name' in activeUser && activeUser.name) ||
    'Dr. Elena Rostova';
  const displayRole = activeUser?.role || 'Lead Bioinformatician';

  return (
    <header className="bg-slate-900 border-b border-slate-800 sticky top-0 z-40 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand */}
        <div className="flex items-center gap-3 cursor-pointer" onClick={() => onNavigate('dashboard')}>
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-teal-500 to-cyan-600 flex items-center justify-center text-slate-950 shadow-md shadow-teal-500/20">
            <Dna size={22} className="text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-lg tracking-tight text-white">MutaTrack</span>
              <span className="bg-teal-500/20 text-teal-300 text-[10px] font-mono px-2 py-0.5 rounded-full border border-teal-500/30">
                GATK Best Practices
              </span>
            </div>
            <p className="text-[11px] text-slate-400 -mt-0.5 hidden sm:block">
              Integrated Variant Calling Platform
            </p>
          </div>
        </div>

        {/* Status indicator & Active Jobs */}
        <div className="flex items-center gap-2 sm:gap-4">
          {runningCount > 0 ? (
            <button
              onClick={() => onNavigate('monitoring', runningAnalysis?.id)}
              className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-blue-950/60 border border-blue-500/40 text-blue-300 text-xs hover:bg-blue-900/60 transition cursor-pointer"
              title="Click to view live monitoring"
            >
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
              </span>
              <span className="font-medium">{runningCount} Pipeline Active</span>
            </button>
          ) : (
            <div className="hidden md:flex items-center gap-1.5 text-xs text-slate-400">
              <Activity size={14} className="text-emerald-400" />
              <span>Nodes Ready (8 Cores)</span>
            </div>
          )}

          {/* Quick New Analysis Action */}
          <button
            onClick={() => onNavigate('new-analysis')}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-teal-500 hover:bg-teal-400 text-slate-950 font-semibold text-xs rounded-lg shadow-sm transition cursor-pointer"
          >
            <PlusCircle size={15} />
            <span className="hidden sm:inline">New Analysis</span>
          </button>

          {/* Reset Demo Data Button */}
          {onResetDemoData && (
            <button
              onClick={onResetDemoData}
              className="p-1.5 text-slate-400 hover:text-slate-200 hover:bg-slate-800 rounded-lg transition cursor-pointer"
              title="Reset to initial demo datasets"
            >
              <RefreshCw size={15} />
            </button>
          )}

          {/* User profile */}
          <div className="flex items-center gap-2 pl-2 border-l border-slate-800">
            <div className="w-8 h-8 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-teal-300 text-xs font-bold">
              {displayName.slice(0, 2).toUpperCase()}
            </div>
            <div className="hidden lg:block text-left">
              <div className="text-xs font-semibold text-slate-200">{displayName}</div>
              <div className="text-[10px] text-teal-400/90 font-mono flex items-center gap-1">
                <ShieldCheck size={10} /> {displayRole}
              </div>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};
