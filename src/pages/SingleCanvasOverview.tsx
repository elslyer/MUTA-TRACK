import React from 'react';
import {
  Layers,
  Dna,
  Scissors,
  Compass,
  FileCheck,
  Filter,
  Sparkles,
  BarChart3,
  CheckCircle2,
  ArrowUpRight,
  Download,
  Eye,
  Info
} from 'lucide-react';
import { Analysis } from '../types/bioinformatics';
import { StatusBadge } from '../components/StatusBadge';
import { WorkflowTracker } from '../components/WorkflowTracker';
import { downloadVcf } from '../utils/vcfGenerator';
import { downloadCsv } from '../utils/csvGenerator';
import { downloadPdfReport } from '../utils/pdfReportGenerator';

interface SingleCanvasOverviewProps {
  analysis: Analysis;
  onNavigateToResults: (analysisId: string) => void;
  onSelectAnalysis: (analysisId: string) => void;
  allAnalyses: Analysis[];
}

export const SingleCanvasOverview: React.FC<SingleCanvasOverviewProps> = ({
  analysis,
  onNavigateToResults,
  onSelectAnalysis,
  allAnalyses
}) => {
  if (!analysis) {
    return (
      <div className="bg-white border border-slate-200 rounded-xl p-12 text-center space-y-4">
        <Layers size={36} className="mx-auto text-slate-400" />
        <h2 className="text-lg font-bold text-slate-800">No Analysis Selected</h2>
        <p className="text-sm text-slate-500 max-w-md mx-auto">
          Please select an analysis from the dashboard or history.
        </p>
      </div>
    );
  }

  const { metrics } = analysis;

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-bold uppercase tracking-wider text-teal-700 bg-teal-50 px-2.5 py-0.5 rounded-full border border-teal-200">
              Single-Canvas Integrated QC & Diagnostic Dashboard
            </span>
            <span className="text-xs text-slate-400">•</span>
            <span className="text-xs font-mono text-slate-500">All Outputs in One View</span>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
              Single Canvas Diagnostic Hub
            </h1>
            <span className="font-mono text-sm font-bold text-slate-800 bg-slate-100 px-2.5 py-0.5 rounded">
              {analysis.id}
            </span>
            <StatusBadge status={analysis.status} />
          </div>

          <p className="text-xs text-slate-500 mt-1">
            Eliminates inspecting FastQC zip archives, Picard metrics, BAM headers, and VCF files separately.
          </p>
        </div>

        {/* Switcher & Exports */}
        <div className="flex items-center flex-wrap gap-2">
          {allAnalyses.length > 1 && (
            <select
              value={analysis.id}
              onChange={(e) => onSelectAnalysis(e.target.value)}
              className="text-xs font-semibold bg-slate-50 border border-slate-300 rounded-lg px-2.5 py-2 text-slate-700"
            >
              {allAnalyses.map((a) => (
                <option key={a.id} value={a.id}>
                  {a.id} - {a.sampleId} ({a.status})
                </option>
              ))}
            </select>
          )}

          <button
            onClick={() => onNavigateToResults(analysis.id)}
            className="px-3.5 py-2 bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold rounded-lg transition flex items-center gap-1.5 cursor-pointer shadow-xs"
          >
            <Eye size={14} />
            <span>Variant Table</span>
          </button>

          <button
            onClick={() => downloadPdfReport(analysis)}
            className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold rounded-lg transition flex items-center gap-1.5 cursor-pointer"
            title="Download PDF clinical summary report"
          >
            <Download size={14} />
            <span>PDF Report</span>
          </button>
        </div>
      </div>

      {/* Visual Workflow Tracker */}
      <WorkflowTracker stages={analysis.stages} activeStageId="report_generation" />

      {/* The 7 Single-Canvas Modules (A through G) */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
        {/* Module A: FASTQ Quality */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-4 hover:border-teal-300 transition">
          <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-teal-50 text-teal-700 font-bold text-xs flex items-center justify-center">
                A
              </div>
              <h3 className="text-sm font-bold text-slate-900">FASTQ Quality (FastQC)</h3>
            </div>
            <span className="text-[10px] font-mono text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
              Passed QC
            </span>
          </div>

          <div className="grid grid-cols-2 gap-3 text-xs">
            <div className="p-3 bg-slate-50 rounded-lg border border-slate-100">
              <span className="text-slate-500 block text-[11px]">Total Read Count</span>
              <span className="font-mono font-bold text-slate-900 text-base mt-0.5 block">
                {(metrics.fastq.readCount / 1e6).toFixed(2)}M
              </span>
              <span className="text-[10px] text-slate-400">150bp Paired-End</span>
            </div>

            <div className="p-3 bg-slate-50 rounded-lg border border-slate-100">
              <span className="text-slate-500 block text-[11px]">Q30 Quality Score</span>
              <span className="font-mono font-bold text-emerald-700 text-base mt-0.5 block">
                {metrics.fastq.q30ScorePct}%
              </span>
              <span className="text-[10px] text-emerald-600">Threshold &gt; 85%</span>
            </div>

            <div className="p-3 bg-slate-50 rounded-lg border border-slate-100">
              <span className="text-slate-500 block text-[11px]">GC Content</span>
              <span className="font-mono font-bold text-slate-900 text-base mt-0.5 block">
                {metrics.fastq.gcContentPct}%
              </span>
              <span className="text-[10px] text-slate-400">Normal human range</span>
            </div>

            <div className="p-3 bg-slate-50 rounded-lg border border-slate-100">
              <span className="text-slate-500 block text-[11px]">Total Yield</span>
              <span className="font-mono font-bold text-slate-900 text-base mt-0.5 block">
                {(metrics.fastq.totalBasesMb / 1000).toFixed(2)} Gb
              </span>
              <span className="text-[10px] text-slate-400">Sequencing Output</span>
            </div>
          </div>
        </div>

        {/* Module B: Trimming & Preprocessing */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-4 hover:border-teal-300 transition">
          <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-teal-50 text-teal-700 font-bold text-xs flex items-center justify-center">
                B
              </div>
              <h3 className="text-sm font-bold text-slate-900">Trimming (fastp / Cutadapt)</h3>
            </div>
            <span className="text-[10px] font-mono text-slate-600 bg-slate-100 px-2 py-0.5 rounded">
              Adapters Removed
            </span>
          </div>

          <div className="grid grid-cols-2 gap-3 text-xs">
            <div className="p-3 bg-slate-50 rounded-lg border border-slate-100">
              <span className="text-slate-500 block text-[11px]">Reads Before Trim</span>
              <span className="font-mono font-bold text-slate-900 text-base mt-0.5 block">
                {(metrics.trimming.readsBefore / 1e6).toFixed(2)}M
              </span>
              <span className="text-[10px] text-slate-400">Raw paired reads</span>
            </div>

            <div className="p-3 bg-slate-50 rounded-lg border border-slate-100">
              <span className="text-slate-500 block text-[11px]">Reads After Trim</span>
              <span className="font-mono font-bold text-slate-900 text-base mt-0.5 block">
                {(metrics.trimming.readsAfter / 1e6).toFixed(2)}M
              </span>
              <span className="text-[10px] text-emerald-600">High-purity retained</span>
            </div>

            <div className="p-3 bg-slate-50 rounded-lg border border-slate-100">
              <span className="text-slate-500 block text-[11px]">Reads Filtered</span>
              <span className="font-mono font-bold text-amber-700 text-base mt-0.5 block">
                {metrics.trimming.readsRemoved.toLocaleString()}
              </span>
              <span className="text-[10px] text-slate-400">Low qual or poly-G</span>
            </div>

            <div className="p-3 bg-slate-50 rounded-lg border border-slate-100">
              <span className="text-slate-500 block text-[11px]">Adapter Carryover</span>
              <span className="font-mono font-bold text-emerald-700 text-base mt-0.5 block">
                {metrics.trimming.adapterContaminationPct}%
              </span>
              <span className="text-[10px] text-emerald-600">&lt; 1% optimal</span>
            </div>
          </div>
        </div>

        {/* Module C: Alignment */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-4 hover:border-teal-300 transition">
          <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-teal-50 text-teal-700 font-bold text-xs flex items-center justify-center">
                C
              </div>
              <h3 className="text-sm font-bold text-slate-900">Alignment (BWA-MEM)</h3>
            </div>
            <span className="text-[10px] font-mono text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
              {metrics.alignment.mappingPercentage}% Mapped
            </span>
          </div>

          <div className="grid grid-cols-2 gap-3 text-xs">
            <div className="p-3 bg-slate-50 rounded-lg border border-slate-100">
              <span className="text-slate-500 block text-[11px]">Mapped Reads</span>
              <span className="font-mono font-bold text-emerald-700 text-base mt-0.5 block">
                {(metrics.alignment.mappedReads / 1e6).toFixed(2)}M
              </span>
              <span className="text-[10px] text-slate-400">Aligned to {analysis.referenceGenome}</span>
            </div>

            <div className="p-3 bg-slate-50 rounded-lg border border-slate-100">
              <span className="text-slate-500 block text-[11px]">Unmapped Reads</span>
              <span className="font-mono font-bold text-slate-600 text-base mt-0.5 block">
                {(metrics.alignment.unmappedReads / 1e3).toFixed(1)}k
              </span>
              <span className="text-[10px] text-slate-400">&lt; 1% unmapped</span>
            </div>

            <div className="p-3 bg-slate-50 rounded-lg border border-slate-100 col-span-2">
              <div className="flex justify-between items-center text-[11px] mb-1">
                <span className="text-slate-500 font-medium">Duplicate Reads Marked</span>
                <span className="font-mono font-bold text-slate-800">{metrics.alignment.duplicateReadsPct}%</span>
              </div>
              <div className="w-full bg-slate-200 rounded-full h-1.5 overflow-hidden">
                <div
                  className="bg-amber-500 h-full"
                  style={{ width: `${metrics.alignment.duplicateReadsPct}%` }}
                />
              </div>
              <span className="text-[10px] text-slate-400 mt-1 block">
                Marked via Picard / GATK MarkDuplicates algorithm
              </span>
            </div>
          </div>
        </div>

        {/* Module D: BAM Processing */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-4 hover:border-teal-300 transition">
          <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-teal-50 text-teal-700 font-bold text-xs flex items-center justify-center">
                D
              </div>
              <h3 className="text-sm font-bold text-slate-900">BAM Processing (SAMtools)</h3>
            </div>
            <span className="text-[10px] font-mono text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
              Sorted & Indexed
            </span>
          </div>

          <div className="space-y-3 text-xs">
            <div className="flex items-center justify-between p-2.5 bg-slate-50 rounded-lg border border-slate-100">
              <span className="text-slate-600">Coordinate Sorted:</span>
              <span className="font-bold text-emerald-700 font-mono flex items-center gap-1">
                <CheckCircle2 size={14} /> YES (samtools sort)
              </span>
            </div>

            <div className="flex items-center justify-between p-2.5 bg-slate-50 rounded-lg border border-slate-100">
              <span className="text-slate-600">BAM Index Built:</span>
              <span className="font-bold text-emerald-700 font-mono flex items-center gap-1">
                <CheckCircle2 size={14} /> YES (.bam.bai ready)
              </span>
            </div>

            <div className="p-3 bg-teal-50/50 rounded-lg border border-teal-200">
              <div className="flex justify-between items-center mb-1">
                <span className="text-[11px] font-bold text-teal-900">Mean Target Read Depth:</span>
                <span className="font-mono text-base font-extrabold text-teal-900">
                  {metrics.bamProcessing.meanReadDepth}x
                </span>
              </div>
              <span className="text-[10px] text-teal-700 block">
                {metrics.bamProcessing.coverageBasesPct}% of target exons covered &gt;= 30x depth
              </span>
            </div>
          </div>
        </div>

        {/* Module E: Variant Calling */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-4 hover:border-teal-300 transition">
          <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-teal-50 text-teal-700 font-bold text-xs flex items-center justify-center">
                E
              </div>
              <h3 className="text-sm font-bold text-slate-900">Variant Calling (GATK HC)</h3>
            </div>
            <span className="text-[10px] font-mono text-purple-700 bg-purple-50 px-2 py-0.5 rounded border border-purple-200">
              HaplotypeCaller
            </span>
          </div>

          <div className="grid grid-cols-2 gap-3 text-xs">
            <div className="p-3 bg-slate-50 rounded-lg border border-slate-100 col-span-2">
              <span className="text-slate-500 block text-[11px]">Total Raw Candidate Variants</span>
              <span className="font-mono font-bold text-slate-900 text-xl mt-0.5 block">
                {metrics.variantCalling.totalVariants.toLocaleString()}
              </span>
              <span className="text-[10px] text-slate-400">Discovered across target intervals</span>
            </div>

            <div className="p-3 bg-blue-50/50 rounded-lg border border-blue-200">
              <span className="text-blue-700 block text-[11px] font-medium">Single Nucleotide (SNPs)</span>
              <span className="font-mono font-bold text-blue-950 text-base mt-0.5 block">
                {metrics.variantCalling.snps.toLocaleString()}
              </span>
              <span className="text-[10px] text-blue-600">
                {((metrics.variantCalling.snps / metrics.variantCalling.totalVariants) * 100).toFixed(1)}%
              </span>
            </div>

            <div className="p-3 bg-purple-50/50 rounded-lg border border-purple-200">
              <span className="text-purple-700 block text-[11px] font-medium">Insertions & Deletions</span>
              <span className="font-mono font-bold text-purple-950 text-base mt-0.5 block">
                {metrics.variantCalling.indels.toLocaleString()}
              </span>
              <span className="text-[10px] text-purple-600">
                {((metrics.variantCalling.indels / metrics.variantCalling.totalVariants) * 100).toFixed(1)}%
              </span>
            </div>
          </div>
        </div>

        {/* Module F: Filtering */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-4 hover:border-teal-300 transition">
          <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-teal-50 text-teal-700 font-bold text-xs flex items-center justify-center">
                F
              </div>
              <h3 className="text-sm font-bold text-slate-900">Filtration (VariantFiltration)</h3>
            </div>
            <span className="text-[10px] font-mono text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
              {metrics.filtering.filterPassRatePct}% Pass Rate
            </span>
          </div>

          <div className="space-y-2.5 text-xs">
            <div className="flex items-center justify-between p-2.5 bg-slate-50 rounded-lg">
              <span className="text-slate-600">Variants Before Filter:</span>
              <span className="font-mono font-bold text-slate-900">
                {metrics.filtering.variantsBefore.toLocaleString()}
              </span>
            </div>

            <div className="flex items-center justify-between p-2.5 bg-emerald-50/80 border border-emerald-200 rounded-lg">
              <span className="text-emerald-900 font-medium">Variants Passed Quality Filter:</span>
              <span className="font-mono font-bold text-emerald-800 text-sm">
                {metrics.filtering.variantsAfter.toLocaleString()}
              </span>
            </div>

            <div className="flex items-center justify-between p-2.5 bg-rose-50/60 border border-rose-200 rounded-lg">
              <span className="text-rose-800">Filtered Out (LowQual/QD/FS):</span>
              <span className="font-mono font-bold text-rose-700">
                {metrics.filtering.filteredOut.toLocaleString()}
              </span>
            </div>
          </div>
        </div>

        {/* Module G: Functional Annotation */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-4 md:col-span-2 xl:col-span-3 hover:border-teal-300 transition">
          <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-teal-50 text-teal-700 font-bold text-xs flex items-center justify-center">
                G
              </div>
              <h3 className="text-sm font-bold text-slate-900">Functional Annotation ({analysis.annotationDb} VEP v111)</h3>
            </div>
            <span className="text-[10px] font-mono text-teal-700 bg-teal-50 px-2 py-0.5 rounded border border-teal-200">
              {metrics.annotation.annotatedVariants} Curated Variants
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
            <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-xl">
              <div className="flex items-center justify-between mb-1">
                <span className="text-[11px] font-bold text-rose-800 uppercase tracking-wide">High Impact</span>
                <span className="text-[10px] bg-rose-200/80 text-rose-900 px-1.5 py-0.2 rounded font-mono">Critical</span>
              </div>
              <span className="text-2xl font-black font-mono text-rose-900 block">
                {metrics.annotation.highImpact}
              </span>
              <span className="text-[10px] text-rose-700 mt-1 block">
                Frameshift, stop gained, splice site mutations
              </span>
            </div>

            <div className="p-3.5 bg-amber-50 border border-amber-200 rounded-xl">
              <div className="flex items-center justify-between mb-1">
                <span className="text-[11px] font-bold text-amber-800 uppercase tracking-wide">Moderate Impact</span>
                <span className="text-[10px] bg-amber-200/80 text-amber-900 px-1.5 py-0.2 rounded font-mono">Missense</span>
              </div>
              <span className="text-2xl font-black font-mono text-amber-900 block">
                {metrics.annotation.moderateImpact}
              </span>
              <span className="text-[10px] text-amber-700 mt-1 block">
                Inframe deletions, non-synonymous codon changes
              </span>
            </div>

            <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-xl">
              <div className="flex items-center justify-between mb-1">
                <span className="text-[11px] font-bold text-emerald-800 uppercase tracking-wide">Low Impact</span>
                <span className="text-[10px] bg-emerald-200/80 text-emerald-900 px-1.5 py-0.2 rounded font-mono">Silent</span>
              </div>
              <span className="text-2xl font-black font-mono text-emerald-900 block">
                {metrics.annotation.lowImpact}
              </span>
              <span className="text-[10px] text-emerald-700 mt-1 block">
                Synonymous coding variants with conserved protein
              </span>
            </div>

            <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl">
              <div className="flex items-center justify-between mb-1">
                <span className="text-[11px] font-bold text-slate-700 uppercase tracking-wide">Modifier</span>
                <span className="text-[10px] bg-slate-200 text-slate-700 px-1.5 py-0.2 rounded font-mono">Intronic</span>
              </div>
              <span className="text-2xl font-black font-mono text-slate-800 block">
                {metrics.annotation.modifierImpact.toLocaleString()}
              </span>
              <span className="text-[10px] text-slate-500 mt-1 block">
                UTR, promoter, regulatory & intergenic variants
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
