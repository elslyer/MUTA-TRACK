import React, { useState, useMemo } from 'react';
import {
  CheckCircle2,
  FileSpreadsheet,
  Download,
  Search,
  Filter,
  ArrowUpDown,
  Dna,
  ExternalLink,
  Layers,
  Sparkles,
  PieChart,
  BarChart2,
  ChevronLeft,
  ChevronRight,
  Info,
  SlidersHorizontal,
  FileText
} from 'lucide-react';
import { Analysis, VariantRecord } from '../types/bioinformatics';
import { StatusBadge } from '../components/StatusBadge';
import { VariantDetailsModal } from '../components/VariantDetailsModal';
import { downloadVcf } from '../utils/vcfGenerator';
import { downloadCsv } from '../utils/csvGenerator';
import { downloadPdfReport } from '../utils/pdfReportGenerator';

interface ResultsPageProps {
  analysis: Analysis;
  onNavigateToSingleCanvas: (analysisId: string) => void;
  onSelectAnalysis: (analysisId: string) => void;
  allAnalyses: Analysis[];
}

export const ResultsPage: React.FC<ResultsPageProps> = ({
  analysis,
  onNavigateToSingleCanvas,
  onSelectAnalysis,
  allAnalyses
}) => {
  const [selectedVariant, setSelectedVariant] = useState<VariantRecord | null>(null);

  // Table filtering and sorting state
  const [searchQuery, setSearchQuery] = useState('');
  const [impactFilter, setImpactFilter] = useState<string>('ALL');
  const [typeFilter, setTypeFilter] = useState<string>('ALL');
  const [sortField, setSortField] = useState<keyof VariantRecord>('position');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  const variants = analysis?.variants || [];

  // Filtered and sorted variants
  const processedVariants = useMemo(() => {
    return (variants || [])
      .filter((v) => {
        if (!v) return false;
        // Search
        const q = searchQuery.toLowerCase().trim();
        const matchesSearch =
          !q ||
          (v.gene && v.gene.toLowerCase().includes(q)) ||
          (v.chromosome && v.chromosome.toLowerCase().includes(q)) ||
          String(v.position).includes(q) ||
          (v.effect && v.effect.toLowerCase().includes(q)) ||
          (v.dbsnp && v.dbsnp.toLowerCase().includes(q)) ||
          (v.clinvar && v.clinvar.toLowerCase().includes(q));

        // Impact filter
        const matchesImpact = impactFilter === 'ALL' || v.impact === impactFilter;

        // Type filter
        const matchesType = typeFilter === 'ALL' || v.type === typeFilter;

        return matchesSearch && matchesImpact && matchesType;
      })
      .sort((a, b) => {
        const valA = a[sortField];
        const valB = b[sortField];

        if (valA === undefined || valB === undefined) return 0;

        let comp = 0;
        if (typeof valA === 'number' && typeof valB === 'number') {
          comp = valA - valB;
        } else {
          comp = String(valA).localeCompare(String(valB));
        }

        return sortDirection === 'asc' ? comp : -comp;
      });
  }, [variants, searchQuery, impactFilter, typeFilter, sortField, sortDirection]);

  // Pagination
  const totalPages = Math.ceil(processedVariants.length / itemsPerPage) || 1;
  const paginatedVariants = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return processedVariants.slice(start, start + itemsPerPage);
  }, [processedVariants, currentPage]);

  const handleSort = (field: keyof VariantRecord) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
    setCurrentPage(1);
  };

  if (!analysis) {
    return (
      <div className="bg-white border border-slate-200 rounded-xl p-12 text-center space-y-4">
        <FileSpreadsheet size={36} className="mx-auto text-slate-400" />
        <h2 className="text-lg font-bold text-slate-800">No Analysis Available</h2>
        <p className="text-sm text-slate-500 max-w-md mx-auto">
          Please run an analysis or select one from history.
        </p>
      </div>
    );
  }

  // Metrics summary
  const totalVariantsCount = analysis?.metrics?.variantCalling?.totalVariants || variants.length;
  const snpsCount = analysis?.metrics?.variantCalling?.snps || variants.filter((v) => v.type === 'SNP').length;
  const indelsCount = analysis?.metrics?.variantCalling?.indels || variants.filter((v) => v.type === 'INDEL').length;
  const highImpactCount = analysis?.metrics?.annotation?.highImpact || variants.filter((v) => v.impact === 'HIGH').length;
  const moderateImpactCount = analysis?.metrics?.annotation?.moderateImpact || variants.filter((v) => v.impact === 'MODERATE').length;
  const lowImpactCount = analysis?.metrics?.annotation?.lowImpact || variants.filter((v) => v.impact === 'LOW').length;

  // Visual Chromosome Distribution Data (computed from variants)
  const chrDistribution = useMemo(() => {
    const counts: { [chr: string]: number } = {};
    variants.forEach((v) => {
      if (v?.chromosome) {
        counts[v.chromosome] = (counts[v.chromosome] || 0) + 1;
      }
    });
    return Object.entries(counts).map(([chr, count]) => ({ chr, count }));
  }, [variants]);

  return (
    <div className="space-y-6">
      {/* Top Banner: Analysis Completed Successfully */}
      <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <span className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-emerald-800 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                <CheckCircle2 size={13} className="text-emerald-600" />
                Analysis Completed Successfully
              </span>
              <span className="text-xs text-slate-400">•</span>
              <span className="text-xs font-mono text-slate-500">UC-07 Penyajian Hasil</span>
            </div>

            <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
              Variant Calling & Annotation Results
            </h1>

            {/* Run metadata summary line */}
            <div className="flex flex-wrap items-center gap-y-1 gap-x-4 text-xs text-slate-600 mt-2 font-mono">
              <div>
                Analysis ID: <strong className="text-slate-900">{analysis.id}</strong>
              </div>
              <span className="text-slate-300">|</span>
              <div>
                Sample ID: <strong className="text-slate-900">{analysis.sampleId}</strong>
              </div>
              <span className="text-slate-300">|</span>
              <div>
                Reference: <strong className="text-slate-900">{analysis.referenceGenome}</strong>
              </div>
              <span className="text-slate-300">|</span>
              <div>
                Date: <strong className="text-slate-900">{analysis.completedAt || analysis.createdAt}</strong>
              </div>
              <span className="text-slate-300">|</span>
              <div>
                Pipeline: <strong className="text-slate-900">{analysis.pipelineVersion}</strong>
              </div>
            </div>
          </div>

          {/* Action and Multi-Format Exports (UC-08) */}
          <div className="flex items-center flex-wrap gap-2">
            <button
              onClick={() => onNavigateToSingleCanvas(analysis.id)}
              className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold rounded-lg transition flex items-center gap-1.5 cursor-pointer"
              title="View full Single-Canvas overview"
            >
              <Layers size={14} />
              <span>Single Canvas QC</span>
            </button>

            <button
              onClick={() => downloadVcf(analysis)}
              className="px-3.5 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-lg transition flex items-center gap-1.5 cursor-pointer shadow-xs"
              title="Download standard VCF format (v4.2)"
            >
              <Download size={14} />
              <span>Download VCF</span>
            </button>

            <button
              onClick={() => downloadCsv(analysis)}
              className="px-3.5 py-2 bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold rounded-lg transition flex items-center gap-1.5 cursor-pointer shadow-xs"
              title="Download spreadsheet CSV format"
            >
              <Download size={14} />
              <span>Download CSV</span>
            </button>

            <button
              onClick={() => downloadPdfReport(analysis)}
              className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-lg transition flex items-center gap-1.5 cursor-pointer shadow-xs"
              title="Download PDF clinical summary report"
            >
              <FileText size={14} />
              <span>Download PDF Report</span>
            </button>
          </div>
        </div>
      </div>

      {/* Variant Summary Cards */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-bold uppercase tracking-wider text-slate-700">
            Variant Discovery Summary
          </h2>
          <span className="text-xs text-slate-500 font-mono">
            Passed GATK VariantFiltration (QD &gt; 2.0, FS &lt; 60.0)
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3.5">
          {/* Total Variants */}
          <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs">
            <span className="text-xs font-semibold text-slate-500 block">Total Variants</span>
            <span className="text-2xl font-black font-mono text-slate-900 mt-1 block">
              {totalVariantsCount.toLocaleString()}
            </span>
            <span className="text-[10px] text-slate-400">Target capture</span>
          </div>

          {/* SNPs */}
          <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs">
            <span className="text-xs font-semibold text-sky-700 block">SNPs</span>
            <span className="text-2xl font-black font-mono text-sky-950 mt-1 block">
              {snpsCount.toLocaleString()}
            </span>
            <span className="text-[10px] text-sky-600">Single nucleotide</span>
          </div>

          {/* INDELs */}
          <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs">
            <span className="text-xs font-semibold text-purple-700 block">INDELs</span>
            <span className="text-2xl font-black font-mono text-purple-950 mt-1 block">
              {indelsCount.toLocaleString()}
            </span>
            <span className="text-[10px] text-purple-600">Insertions / Deletions</span>
          </div>

          {/* High Impact */}
          <div className="bg-rose-50/60 border border-rose-200 rounded-xl p-4 shadow-xs">
            <span className="text-xs font-bold text-rose-700 block">High Impact</span>
            <span className="text-2xl font-black font-mono text-rose-900 mt-1 block">
              {highImpactCount}
            </span>
            <span className="text-[10px] text-rose-600">Stop gained / Frameshift</span>
          </div>

          {/* Moderate Impact */}
          <div className="bg-amber-50/60 border border-amber-200 rounded-xl p-4 shadow-xs">
            <span className="text-xs font-bold text-amber-700 block">Moderate Impact</span>
            <span className="text-2xl font-black font-mono text-amber-900 mt-1 block">
              {moderateImpactCount}
            </span>
            <span className="text-[10px] text-amber-600">Missense variants</span>
          </div>

          {/* Low Impact */}
          <div className="bg-emerald-50/60 border border-emerald-200 rounded-xl p-4 shadow-xs">
            <span className="text-xs font-bold text-emerald-700 block">Low Impact</span>
            <span className="text-2xl font-black font-mono text-emerald-900 mt-1 block">
              {lowImpactCount}
            </span>
            <span className="text-[10px] text-emerald-600">Synonymous / Silent</span>
          </div>
        </div>
      </div>

      {/* Scientific Visualizations Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {/* Viz 1: Variant Type Distribution */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-3">
          <div className="flex items-center justify-between border-b border-slate-100 pb-2">
            <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
              <PieChart size={14} className="text-teal-600" />
              Variant Type Distribution
            </h3>
            <span className="text-[10px] font-mono text-slate-400">Ti/Tv: 2.14</span>
          </div>

          <div className="space-y-3 pt-1 text-xs">
            <div>
              <div className="flex justify-between mb-1">
                <span className="text-slate-600 font-medium">SNPs (Single Nucleotide)</span>
                <span className="font-mono font-bold text-sky-800">
                  {snpsCount} ({((snpsCount / (totalVariantsCount || 1)) * 100).toFixed(1)}%)
                </span>
              </div>
              <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden">
                <div
                  className="bg-sky-500 h-full rounded-full"
                  style={{ width: `${(snpsCount / (totalVariantsCount || 1)) * 100}%` }}
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between mb-1">
                <span className="text-slate-600 font-medium">INDELs (Insertion/Deletion)</span>
                <span className="font-mono font-bold text-purple-800">
                  {indelsCount} ({((indelsCount / (totalVariantsCount || 1)) * 100).toFixed(1)}%)
                </span>
              </div>
              <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden">
                <div
                  className="bg-purple-500 h-full rounded-full"
                  style={{ width: `${(indelsCount / (totalVariantsCount || 1)) * 100}%` }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Viz 2: Functional Impact Severity */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-3">
          <div className="flex items-center justify-between border-b border-slate-100 pb-2">
            <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
              <BarChart2 size={14} className="text-teal-600" />
              Predicted Consequence Impact
            </h3>
            <span className="text-[10px] font-mono text-slate-400">VEP v111</span>
          </div>

          <div className="space-y-2.5 pt-1 text-xs">
            <div className="flex items-center gap-3">
              <span className="w-20 text-slate-600 font-medium shrink-0">High:</span>
              <div className="flex-1 bg-slate-100 rounded-full h-2 overflow-hidden">
                <div className="bg-rose-500 h-full" style={{ width: `${Math.min(100, highImpactCount * 6)}%` }} />
              </div>
              <span className="w-8 font-mono text-right font-bold text-rose-700">{highImpactCount}</span>
            </div>

            <div className="flex items-center gap-3">
              <span className="w-20 text-slate-600 font-medium shrink-0">Moderate:</span>
              <div className="flex-1 bg-slate-100 rounded-full h-2 overflow-hidden">
                <div className="bg-amber-500 h-full" style={{ width: `${Math.min(100, moderateImpactCount * 1.5)}%` }} />
              </div>
              <span className="w-8 font-mono text-right font-bold text-amber-700">{moderateImpactCount}</span>
            </div>

            <div className="flex items-center gap-3">
              <span className="w-20 text-slate-600 font-medium shrink-0">Low:</span>
              <div className="flex-1 bg-slate-100 rounded-full h-2 overflow-hidden">
                <div className="bg-emerald-500 h-full" style={{ width: `${Math.min(100, lowImpactCount * 0.8)}%` }} />
              </div>
              <span className="w-8 font-mono text-right font-bold text-emerald-700">{lowImpactCount}</span>
            </div>
          </div>
        </div>

        {/* Viz 3: Chromosomal Distribution */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-3">
          <div className="flex items-center justify-between border-b border-slate-100 pb-2">
            <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
              <Dna size={14} className="text-teal-600" />
              Chromosome Loci
            </h3>
            <span className="text-[10px] font-mono text-slate-400">Target genes</span>
          </div>

          <div className="flex items-end justify-between h-20 pt-2 gap-1 px-1">
            {chrDistribution.length > 0 ? (
              chrDistribution.map((item) => (
                <div key={item.chr} className="flex-1 flex flex-col items-center gap-1">
                  <div
                    className="w-full bg-teal-500 hover:bg-teal-600 transition rounded-t-sm"
                    style={{ height: `${Math.max(15, Math.min(60, item.count * 20))}px` }}
                    title={`${item.chr}: ${item.count} variants`}
                  />
                  <span className="text-[9px] font-mono text-slate-500 truncate w-full text-center">
                    {item.chr.replace('chr', '')}
                  </span>
                </div>
              ))
            ) : (
              <div className="text-xs text-slate-400 text-center w-full my-auto">
                No variants to plot
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Interactive Variant Table (Requirement 13) */}
      <div className="bg-white border border-slate-200 rounded-xl shadow-xs overflow-hidden">
        {/* Table Controls Header */}
        <div className="p-4 sm:p-5 border-b border-slate-200 space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div>
              <h3 className="text-base font-bold text-slate-900">
                Identified Variants Table
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Showing {processedVariants.length} variants • Click any row for in-depth clinical & VCF interpretation
              </p>
            </div>

            {/* Notice tag for simulated demo data */}
            <span className="text-[11px] bg-slate-100 text-slate-600 px-2.5 py-1 rounded-md border border-slate-200">
              * Simulated high-depth targeted NGS dataset
            </span>
          </div>

          {/* Filters and Search Bar */}
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 pt-1">
            {/* Search */}
            <div className="sm:col-span-2 relative">
              <Search size={15} className="absolute left-3 top-2.5 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setCurrentPage(1);
                }}
                placeholder="Search by gene (e.g. BRCA1, TP53), chr, position, or rsID..."
                className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-teal-500"
              />
            </div>

            {/* Impact Filter */}
            <div>
              <select
                value={impactFilter}
                onChange={(e) => {
                  setImpactFilter(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full py-2 px-3 bg-slate-50 border border-slate-300 rounded-lg text-xs font-semibold text-slate-700"
              >
                <option value="ALL">Impact: All Severities</option>
                <option value="HIGH">High Impact Only</option>
                <option value="MODERATE">Moderate Impact Only</option>
                <option value="LOW">Low Impact Only</option>
                <option value="MODIFIER">Modifier Only</option>
              </select>
            </div>

            {/* Type Filter */}
            <div>
              <select
                value={typeFilter}
                onChange={(e) => {
                  setTypeFilter(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full py-2 px-3 bg-slate-50 border border-slate-300 rounded-lg text-xs font-semibold text-slate-700"
              >
                <option value="ALL">Type: SNPs & INDELs</option>
                <option value="SNP">SNPs Only</option>
                <option value="INDEL">INDELs Only</option>
              </select>
            </div>
          </div>
        </div>

        {/* The Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-[11px] font-bold text-slate-600 uppercase tracking-wider">
                <th
                  onClick={() => handleSort('chromosome')}
                  className="py-3 px-4 cursor-pointer hover:bg-slate-100 transition"
                >
                  <div className="flex items-center gap-1">
                    <span>Chromosome</span>
                    <ArrowUpDown size={11} className="text-slate-400" />
                  </div>
                </th>
                <th
                  onClick={() => handleSort('position')}
                  className="py-3 px-4 cursor-pointer hover:bg-slate-100 transition"
                >
                  <div className="flex items-center gap-1">
                    <span>Position</span>
                    <ArrowUpDown size={11} className="text-slate-400" />
                  </div>
                </th>
                <th className="py-3 px-3">Ref</th>
                <th className="py-3 px-3">Alt</th>
                <th
                  onClick={() => handleSort('gene')}
                  className="py-3 px-4 cursor-pointer hover:bg-slate-100 transition"
                >
                  <div className="flex items-center gap-1">
                    <span>Gene</span>
                    <ArrowUpDown size={11} className="text-slate-400" />
                  </div>
                </th>
                <th className="py-3 px-4">Effect</th>
                <th
                  onClick={() => handleSort('impact')}
                  className="py-3 px-3 cursor-pointer hover:bg-slate-100 transition"
                >
                  <div className="flex items-center gap-1">
                    <span>Impact</span>
                    <ArrowUpDown size={11} className="text-slate-400" />
                  </div>
                </th>
                <th
                  onClick={() => handleSort('depth')}
                  className="py-3 px-3 cursor-pointer hover:bg-slate-100 transition text-right"
                >
                  <div className="flex items-center justify-end gap-1">
                    <span>DP</span>
                    <ArrowUpDown size={11} className="text-slate-400" />
                  </div>
                </th>
                <th
                  onClick={() => handleSort('qual')}
                  className="py-3 px-3 cursor-pointer hover:bg-slate-100 transition text-right"
                >
                  <div className="flex items-center justify-end gap-1">
                    <span>QUAL</span>
                    <ArrowUpDown size={11} className="text-slate-400" />
                  </div>
                </th>
                <th className="py-3 px-4">ClinVar / dbSNP</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 text-xs font-mono">
              {paginatedVariants.length > 0 ? (
                paginatedVariants.map((v) => {
                  let impactBadge = 'bg-slate-100 text-slate-700 border-slate-200';
                  if (v.impact === 'HIGH') impactBadge = 'bg-rose-100 text-rose-800 border-rose-200 font-bold';
                  else if (v.impact === 'MODERATE') impactBadge = 'bg-amber-100 text-amber-800 border-amber-200 font-bold';
                  else if (v.impact === 'LOW') impactBadge = 'bg-emerald-100 text-emerald-800 border-emerald-200';

                  return (
                    <tr
                      key={v.id}
                      onClick={() => setSelectedVariant(v)}
                      className="hover:bg-teal-50/40 cursor-pointer transition group"
                    >
                      <td className="py-3 px-4 font-bold text-slate-800">
                        {v.chromosome}
                      </td>
                      <td className="py-3 px-4 text-slate-700">
                        {v.position.toLocaleString()}
                      </td>
                      <td className="py-3 px-3 text-rose-700 font-bold">
                        {v.reference.length > 6 ? `${v.reference.substring(0, 5)}…` : v.reference}
                      </td>
                      <td className="py-3 px-3 text-emerald-700 font-bold">
                        {v.alternate.length > 6 ? `${v.alternate.substring(0, 5)}…` : v.alternate}
                      </td>
                      <td className="py-3 px-4 font-sans font-extrabold text-teal-900 group-hover:text-teal-700 transition">
                        {v.gene}
                      </td>
                      <td className="py-3 px-4 font-sans text-slate-600 truncate max-w-[150px]">
                        {v.effect.replace(/_/g, ' ')}
                      </td>
                      <td className="py-3 px-3">
                        <span className={`text-[10px] px-2 py-0.5 rounded border ${impactBadge}`}>
                          {v.impact}
                        </span>
                      </td>
                      <td className="py-3 px-3 text-right text-slate-700">
                        {v.depth}x
                      </td>
                      <td className="py-3 px-3 text-right font-bold text-emerald-700">
                        {v.qual.toFixed(1)}
                      </td>
                      <td className="py-3 px-4 font-sans">
                        <div className="text-slate-800 text-[11px] font-medium truncate max-w-[180px]">
                          {v.clinvar || 'Unclassified'}
                        </div>
                        {v.dbsnp && (
                          <div className="text-[10px] text-slate-400 font-mono">
                            {v.dbsnp}
                          </div>
                        )}
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={10} className="py-8 text-center text-slate-400 font-sans">
                    No variants match your query filters.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Footer */}
        <div className="p-4 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-600">
          <div>
            Showing page <strong>{currentPage}</strong> of <strong>{totalPages}</strong> ({processedVariants.length} total entries)
          </div>

          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="p-1.5 rounded border border-slate-300 disabled:opacity-40 hover:bg-slate-50 transition cursor-pointer"
            >
              <ChevronLeft size={16} />
            </button>
            <span className="px-3 font-mono font-bold text-slate-800">
              {currentPage} / {totalPages}
            </span>
            <button
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="p-1.5 rounded border border-slate-300 disabled:opacity-40 hover:bg-slate-50 transition cursor-pointer"
            >
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      </div>

      {/* Variant Details Modal Drawer */}
      <VariantDetailsModal
        variant={selectedVariant}
        referenceGenome={analysis.referenceGenome}
        sampleId={analysis.sampleId}
        onClose={() => setSelectedVariant(null)}
      />
    </div>
  );
};
