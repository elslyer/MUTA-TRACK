import React, { useState, useMemo } from 'react';
import {
  History,
  Search,
  Filter,
  Eye,
  Activity,
  Layers,
  Download,
  Trash2,
  RefreshCw,
  Clock,
  Dna,
  FileCode,
  FileText
} from 'lucide-react';
import { Analysis } from '../types/bioinformatics';
import { StatusBadge } from '../components/StatusBadge';
import { downloadVcf } from '../utils/vcfGenerator';
import { downloadCsv } from '../utils/csvGenerator';
import { downloadPdfReport } from '../utils/pdfReportGenerator';

interface HistoryPageProps {
  analyses: Analysis[];
  onNavigate: (page: string, analysisId?: string) => void;
  onDeleteAnalysis: (analysisId: string) => void;
}

export const HistoryPage: React.FC<HistoryPageProps> = ({
  analyses = [],
  onNavigate,
  onDeleteAnalysis
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');

  const filteredAnalyses = useMemo(() => {
    return (analyses || []).filter((a) => {
      if (!a) return false;
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !q ||
        (a.id && a.id.toLowerCase().includes(q)) ||
        (a.sampleId && a.sampleId.toLowerCase().includes(q)) ||
        (a.projectName && a.projectName.toLowerCase().includes(q)) ||
        (a.referenceGenome && a.referenceGenome.toLowerCase().includes(q));

      const matchesStatus = statusFilter === 'ALL' || a.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [analyses, searchQuery, statusFilter]);

  const handleExportManifest = () => {
    const dataStr = JSON.stringify(analyses, null, 2);
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `MutaTrack_Analyses_Manifest_${new Date().toISOString().substring(0, 10)}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-bold uppercase tracking-wider text-teal-700 bg-teal-50 px-2.5 py-0.5 rounded-full border border-teal-200">
              Analysis History & Traceability Audit Log
            </span>
            <span className="text-xs text-slate-400">•</span>
            <span className="text-xs font-mono text-slate-500">{analyses.length} Total Runs</span>
          </div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
            Analysis History
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Full historical audit trail of DNA-Seq GATK variant calling pipelines and archived outputs.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleExportManifest}
            className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-lg transition flex items-center gap-1.5 cursor-pointer"
            title="Export full runs JSON manifest"
          >
            <FileCode size={14} />
            <span>Export Manifest (JSON)</span>
          </button>
        </div>
      </div>

      {/* Table Container */}
      <div className="bg-white border border-slate-200 rounded-xl shadow-xs overflow-hidden">
        {/* Filters */}
        <div className="p-4 border-b border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="w-full sm:w-80 relative">
            <Search size={15} className="absolute left-3 top-2.5 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by analysis ID, sample ID, or project..."
              className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-teal-500"
            />
          </div>

          <div className="w-full sm:w-auto flex items-center gap-2">
            <Filter size={14} className="text-slate-400" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full sm:w-auto py-2 px-3 bg-slate-50 border border-slate-300 rounded-lg text-xs font-semibold text-slate-700"
            >
              <option value="ALL">All Statuses</option>
              <option value="Completed">Completed Only</option>
              <option value="Running">Running Only</option>
              <option value="Failed">Failed / Cancelled</option>
            </select>
          </div>
        </div>

        {/* The Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-[11px] font-bold text-slate-600 uppercase tracking-wider">
                <th className="py-3 px-4">Analysis ID</th>
                <th className="py-3 px-4">Sample ID</th>
                <th className="py-3 px-4">Project</th>
                <th className="py-3 px-4">Reference</th>
                <th className="py-3 px-4">Date & Time</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Duration</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 text-xs">
              {filteredAnalyses.length > 0 ? (
                filteredAnalyses.map((analysis) => {
                  const isCompleted = analysis.status === 'Completed';
                  const isRunning = analysis.status === 'Running' || analysis.status === 'Validating';

                  return (
                    <tr
                      key={analysis.id}
                      className="hover:bg-slate-50/80 transition group"
                    >
                      <td className="py-3 px-4 font-mono font-bold text-slate-900">
                        {analysis.id}
                      </td>
                      <td className="py-3 px-4 font-mono font-semibold text-slate-900">
                        {analysis.sampleId}
                      </td>
                      <td className="py-3 px-4 text-slate-700 max-w-[180px] truncate">
                        {analysis.projectName}
                      </td>
                      <td className="py-3 px-4 font-mono text-slate-600">
                        <span className="px-2 py-0.5 bg-slate-100 rounded text-[11px]">
                          {analysis.referenceGenome}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-slate-600 font-mono text-[11px]">
                        {analysis.createdAt}
                      </td>
                      <td className="py-3 px-4">
                        <StatusBadge status={analysis.status} size="sm" />
                      </td>
                      <td className="py-3 px-4 font-mono text-slate-600">
                        {analysis.duration || 'Running'}
                      </td>
                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {isCompleted ? (
                            <>
                              <button
                                onClick={() => onNavigate('results', analysis.id)}
                                className="px-2.5 py-1.5 bg-teal-50 hover:bg-teal-100 text-teal-800 font-bold rounded-md transition text-xs flex items-center gap-1 cursor-pointer"
                                title="View Results"
                              >
                                <Eye size={13} />
                                <span>View Results</span>
                              </button>

                              <button
                                onClick={() => onNavigate('single-canvas', analysis.id)}
                                className="p-1.5 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-md transition"
                                title="Single-Canvas Overview"
                              >
                                <Layers size={14} />
                              </button>

                              <button
                                onClick={() => downloadVcf(analysis)}
                                className="p-1.5 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-md transition"
                                title="Download VCF"
                              >
                                <Download size={14} />
                              </button>

                              <button
                                onClick={() => downloadPdfReport(analysis)}
                                className="p-1.5 text-emerald-700 hover:bg-emerald-50 rounded-md transition"
                                title="Download PDF Report"
                              >
                                <FileText size={14} />
                              </button>
                            </>
                          ) : isRunning ? (
                            <button
                              onClick={() => onNavigate('monitoring', analysis.id)}
                              className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-md transition text-xs flex items-center gap-1 cursor-pointer"
                            >
                              <Activity size={13} className="animate-spin" />
                              <span>Monitor</span>
                            </button>
                          ) : (
                            <button
                              onClick={() => onNavigate('monitoring', analysis.id)}
                              className="px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium rounded-md transition text-xs"
                            >
                              View Run
                            </button>
                          )}

                          {analyses.length > 1 && (
                            <button
                              onClick={() => onDeleteAnalysis(analysis.id)}
                              className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-md transition"
                              title="Delete from local storage"
                            >
                              <Trash2 size={14} />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-slate-400">
                    No historical analyses found matching search criteria.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
