import React from 'react';
import {
  PlusCircle,
  Activity,
  CheckCircle2,
  AlertTriangle,
  FileSpreadsheet,
  Layers,
  ArrowRight,
  Clock,
  Dna,
  Server,
  FileCode,
  Download,
  Eye
} from 'lucide-react';
import { Analysis } from '../types/bioinformatics';
import { StatusBadge } from '../components/StatusBadge';
import { WorkflowTracker } from '../components/WorkflowTracker';
import { downloadVcf } from '../utils/vcfGenerator';
import { downloadCsv } from '../utils/csvGenerator';

interface DashboardPageProps {
  analyses: Analysis[];
  onNavigate: (page: string, analysisId?: string) => void;
}

export const DashboardPage: React.FC<DashboardPageProps> = ({
  analyses = [],
  onNavigate
}) => {
  const safeAnalyses = analyses || [];
  const totalCount = safeAnalyses.length;
  const runningCount = safeAnalyses.filter((a) => a && (a.status === 'Running' || a.status === 'Validating')).length;
  const completedCount = safeAnalyses.filter((a) => a && a.status === 'Completed').length;
  const failedCount = safeAnalyses.filter((a) => a && (a.status === 'Failed' || a.status === 'Cancelled')).length;

  const runningAnalysis = safeAnalyses.find((a) => a && a.status === 'Running');

  return (
    <div className="space-y-6">
      {/* Top Banner / Welcome */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs relative overflow-hidden">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 relative z-10">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs font-bold uppercase tracking-wider text-teal-700 bg-teal-50 px-2.5 py-0.5 rounded-full border border-teal-200">
                Bioinformatics Control Center
              </span>
              <span className="text-xs text-slate-400">•</span>
              <span className="text-xs font-mono text-slate-500">Pipeline v1.4</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Welcome to MutaTrack
            </h1>
            <p className="mt-1 text-sm text-slate-600 max-w-2xl">
              Integrated Variant Calling Platform connecting raw FASTQ quality control, read alignment, BAM processing, GATK HaplotypeCaller variant discovery, and Ensembl annotation into a unified workflow.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => onNavigate('new-analysis')}
              className="flex items-center gap-2 px-5 py-2.5 bg-teal-600 hover:bg-teal-700 text-white font-bold text-sm rounded-xl shadow-sm hover:shadow-md transition cursor-pointer"
            >
              <PlusCircle size={18} />
              <span>+ New Analysis</span>
            </button>
          </div>
        </div>

        {/* Workflow overview diagram embedded right on Dashboard */}
        <div className="mt-6 pt-5 border-t border-slate-100">
          <WorkflowTracker
            stages={runningAnalysis?.stages || analyses[0]?.stages}
            compact={true}
          />
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Analyses */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">
              Total Analyses
            </span>
            <span className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-1 block">
              {totalCount}
            </span>
            <span className="text-[11px] text-slate-400 mt-0.5 block">Registered pipeline runs</span>
          </div>
          <div className="w-12 h-12 rounded-xl bg-slate-100 text-slate-700 flex items-center justify-center">
            <FileSpreadsheet size={24} />
          </div>
        </div>

        {/* Running */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-blue-700 uppercase tracking-wider block">
                Running
              </span>
              {runningCount > 0 && (
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-600"></span>
                </span>
              )}
            </div>
            <span className="text-2xl sm:text-3xl font-extrabold text-blue-900 mt-1 block">
              {runningCount}
            </span>
            <span className="text-[11px] text-blue-600 mt-0.5 block">Active compute jobs</span>
          </div>
          <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
            <Activity size={24} className={runningCount > 0 ? 'animate-pulse' : ''} />
          </div>
        </div>

        {/* Completed */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-emerald-700 uppercase tracking-wider block">
              Completed
            </span>
            <span className="text-2xl sm:text-3xl font-extrabold text-emerald-900 mt-1 block">
              {completedCount}
            </span>
            <span className="text-[11px] text-emerald-600 mt-0.5 block">VCF & QC outputs ready</span>
          </div>
          <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <CheckCircle2 size={24} />
          </div>
        </div>

        {/* Failed */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-rose-700 uppercase tracking-wider block">
              Failed
            </span>
            <span className="text-2xl sm:text-3xl font-extrabold text-rose-900 mt-1 block">
              {failedCount}
            </span>
            <span className="text-[11px] text-rose-600 mt-0.5 block">Requires review</span>
          </div>
          <div className="w-12 h-12 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center">
            <AlertTriangle size={24} />
          </div>
        </div>
      </div>

      {/* Active Pipeline Live Bar (if running) */}
      {runningAnalysis && (
        <div className="bg-blue-50/80 border border-blue-200 rounded-xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-xs">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-blue-600 text-white flex items-center justify-center shrink-0">
              <Activity size={18} className="animate-spin" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-blue-900">Active Job in Execution:</span>
                <span className="font-mono text-xs font-bold text-blue-950 bg-blue-100 px-2 py-0.5 rounded">
                  {runningAnalysis.id}
                </span>
                <span className="text-xs text-blue-700">({runningAnalysis.sampleId})</span>
              </div>
              <p className="text-xs text-blue-700 mt-0.5">
                Current Stage: <strong>Reference Alignment (BWA-MEM)</strong> • 68% complete
              </p>
            </div>
          </div>

          <button
            onClick={() => onNavigate('monitoring', runningAnalysis.id)}
            className="flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-lg transition shrink-0 cursor-pointer"
          >
            <span>Open Real-Time Monitor</span>
            <ArrowRight size={14} />
          </button>
        </div>
      )}

      {/* Main Section: Recent Analyses Table */}
      <div className="bg-white border border-slate-200 rounded-xl shadow-xs overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h2 className="text-base font-bold text-slate-900 tracking-tight">Recent Analyses</h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Live status, pipeline progression, and direct access to results
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => onNavigate('history')}
              className="text-xs font-semibold text-teal-700 hover:text-teal-800 hover:underline flex items-center gap-1"
            >
              <span>View Full History</span>
              <ArrowRight size={13} />
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                <th className="py-3 px-4">Analysis ID</th>
                <th className="py-3 px-4">Sample ID</th>
                <th className="py-3 px-4">Reference Genome</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Date & Duration</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 text-xs">
              {analyses.map((analysis) => {
                const isRunning = analysis.status === 'Running' || analysis.status === 'Validating';
                const isCompleted = analysis.status === 'Completed';

                return (
                  <tr
                    key={analysis.id}
                    className="hover:bg-slate-50/80 transition group"
                  >
                    <td className="py-3 px-4 font-mono font-bold text-slate-900">
                      {analysis.id}
                    </td>
                    <td className="py-3 px-4">
                      <div className="font-semibold text-slate-900">{analysis.sampleId}</div>
                      <div className="text-[11px] text-slate-500 truncate max-w-[200px]">
                        {analysis.projectName}
                      </div>
                    </td>
                    <td className="py-3 px-4 font-mono text-slate-700">
                      <span className="px-2 py-0.5 bg-slate-100 rounded border border-slate-200 text-[11px]">
                        {analysis.referenceGenome}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <StatusBadge status={analysis.status} />
                    </td>
                    <td className="py-3 px-4 text-slate-600">
                      <div className="flex items-center gap-1.5 text-slate-700">
                        <Clock size={12} className="text-slate-400" />
                        <span>{analysis.createdAt}</span>
                      </div>
                      <div className="text-[11px] text-slate-400">
                        Duration: {analysis.duration || 'Running'}
                      </div>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        {isCompleted && (
                          <>
                            <button
                              onClick={() => onNavigate('results', analysis.id)}
                              className="px-2.5 py-1.5 bg-teal-50 hover:bg-teal-100 text-teal-800 font-semibold rounded-md transition text-xs flex items-center gap-1 cursor-pointer"
                              title="View interactive variants and charts"
                            >
                              <Eye size={13} />
                              <span>Results</span>
                            </button>
                            <button
                              onClick={() => onNavigate('single-canvas', analysis.id)}
                              className="px-2 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-md transition text-xs flex items-center gap-1 cursor-pointer"
                              title="Single-Canvas Integrated QC"
                            >
                              <Layers size={13} />
                              <span className="hidden sm:inline">Canvas</span>
                            </button>
                            <button
                              onClick={() => downloadVcf(analysis)}
                              className="p-1.5 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-md transition cursor-pointer"
                              title="Download VCF v4.2"
                            >
                              <Download size={14} />
                            </button>
                          </>
                        )}

                        {isRunning && (
                          <button
                            onClick={() => onNavigate('monitoring', analysis.id)}
                            className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-md transition text-xs flex items-center gap-1 cursor-pointer"
                          >
                            <Activity size={13} className="animate-spin" />
                            <span>Monitor</span>
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Value Proposition / Architectural Problem & Solution Banner */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="p-5 bg-white border border-slate-200 rounded-xl space-y-2">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-rose-700">
            <span className="w-2 h-2 rounded-full bg-rose-500" />
            <span>The Traditional Problem</span>
          </div>
          <h3 className="text-sm font-bold text-slate-900">
            Fragmented Command-by-Command Execution
          </h3>
          <p className="text-xs text-slate-600 leading-relaxed">
            Bioinformatics researchers previously run FastQC, Cutadapt, BWA-MEM, Samtools sort, Picard MarkDuplicates, GATK HaplotypeCaller, VariantFiltration, and VEP manually across 8 terminal commands. This fragments QC tracking, multiplies human error, and hides the direct link between raw inputs and pathogenic variants.
          </p>
        </div>

        <div className="p-5 bg-teal-900/90 text-white rounded-xl space-y-2 shadow-xs">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-teal-300">
            <span className="w-2 h-2 rounded-full bg-teal-400" />
            <span>MutaTrack Solution</span>
          </div>
          <h3 className="text-sm font-bold text-white">
            End-to-End Traceable & Single-Canvas Integration
          </h3>
          <p className="text-xs text-teal-100/90 leading-relaxed">
            MutaTrack bundles the entire pipeline under GATK Best Practices. You validate raw inputs up front, observe real-time progress & execution logs, diagnose QC metrics in a single canvas, and export filtered VCF/CSV/PDF reports instantly.
          </p>
        </div>
      </div>
    </div>
  );
};
