import React from 'react';
import {
  LayoutDashboard,
  PlusCircle,
  Activity,
  FileSpreadsheet,
  History,
  Sliders,
  LogOut,
  Dna,
  Layers,
  HelpCircle,
  Sparkles
} from 'lucide-react';
import { Analysis } from '../types/bioinformatics';

interface SidebarProps {
  currentPage: string;
  onNavigate: (page: string, analysisId?: string) => void;
  onLogout?: () => void;
  runningAnalysis?: Analysis;
  completedAnalysesCount?: number;
  analysesCount?: number;
  activeAnalysisId?: string;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentPage,
  onNavigate,
  onLogout,
  runningAnalysis,
  completedAnalysesCount = 0,
  analysesCount = 0,
  activeAnalysisId
}) => {
  const navItems = [
    {
      id: 'dashboard',
      label: 'Dashboard',
      icon: LayoutDashboard,
      badge: null,
      useCase: 'Overview'
    },
    {
      id: 'new-analysis',
      label: 'New Analysis',
      icon: PlusCircle,
      badge: 'Input & Params',
      useCase: 'UC-02 / UC-04'
    },
    {
      id: 'monitoring',
      label: 'Running Analysis',
      icon: Activity,
      badge: runningAnalysis ? 'Live' : null,
      pulse: !!runningAnalysis,
      useCase: 'UC-06'
    },
    {
      id: 'results',
      label: 'Results & Variants',
      icon: FileSpreadsheet,
      badge: completedAnalysesCount > 0 ? `${completedAnalysesCount}` : null,
      useCase: 'UC-07 / UC-08'
    },
    {
      id: 'single-canvas',
      label: 'Single Canvas QC',
      icon: Layers,
      badge: 'Integrated',
      useCase: 'Single-Canvas'
    },
    {
      id: 'history',
      label: 'Analysis History',
      icon: History,
      badge: null,
      useCase: 'Audit Log'
    },
    {
      id: 'settings',
      label: 'Pipeline Config',
      icon: Sliders,
      badge: null,
      useCase: 'Tools & DB'
    }
  ];

  return (
    <aside className="w-64 bg-white border-r border-slate-200 flex flex-col justify-between shrink-0 min-h-[calc(100vh-4rem)]">
      <div className="p-4 space-y-6">
        {/* Navigation list */}
        <div>
          <div className="px-3 mb-2 flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
              Platform Workflow
            </span>
            <span className="text-[10px] text-teal-700 bg-teal-50 px-1.5 py-0.5 rounded font-mono">
              v1.4 GATK
            </span>
          </div>

          <nav className="space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentPage === item.id;

              return (
                <button
                  key={item.id}
                  onClick={() => onNavigate(item.id)}
                  className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                    isActive
                      ? 'bg-teal-50 text-teal-900 border border-teal-200/80 shadow-xs'
                      : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon
                      size={17}
                      className={isActive ? 'text-teal-600' : 'text-slate-400 group-hover:text-slate-600'}
                    />
                    <span>{item.label}</span>
                  </div>

                  <div className="flex items-center gap-1.5">
                    {item.badge && (
                      <span
                        className={`text-[10px] px-1.5 py-0.5 rounded-full font-mono ${
                          item.pulse
                            ? 'bg-blue-100 text-blue-800 font-bold animate-pulse'
                            : isActive
                            ? 'bg-teal-200/60 text-teal-900'
                            : 'bg-slate-100 text-slate-500'
                        }`}
                      >
                        {item.badge}
                      </span>
                    )}
                  </div>
                </button>
              );
            })}
          </nav>
        </div>

        {/* Reference Workflow Infobox */}
        <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
          <div className="flex items-center gap-1.5 text-xs font-bold text-slate-800">
            <Dna size={14} className="text-teal-600" />
            <span>Workflow Reference</span>
          </div>
          <p className="text-[11px] text-slate-500 leading-relaxed">
            Follows Snakemake DNA-Seq GATK standard workflow architecture for paired-end variant calling.
          </p>
          <div className="pt-1 text-[10px] text-slate-400 font-mono">
            FastQC → fastp → BWA → SAMtools → GATK → VEP
          </div>
        </div>
      </div>

      {/* Footer / Logout */}
      <div className="p-4 border-t border-slate-200 space-y-2">
        <button
          onClick={onLogout}
          className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium text-rose-600 hover:bg-rose-50 hover:text-rose-700 transition cursor-pointer"
        >
          <LogOut size={16} />
          <span>Sign Out</span>
        </button>
        <div className="text-[11px] text-center text-slate-400">
          MutaTrack Platform © 2026
        </div>
      </div>
    </aside>
  );
};
