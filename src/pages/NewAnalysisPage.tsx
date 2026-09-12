import React, { useState, useMemo } from 'react';
import {
  Upload,
  FileCheck,
  Dna,
  Database,
  Sliders,
  AlertCircle,
  CheckCircle2,
  XCircle,
  Play,
  FileText,
  Trash2,
  Sparkles,
  Info,
  HelpCircle
} from 'lucide-react';
import { Analysis, FastqFile, AnalysisParameters } from '../types/bioinformatics';
import { validateAnalysisInput, ValidationResult } from '../utils/validators';
import { demoPresets } from '../data/initialAnalyses';

interface NewAnalysisPageProps {
  existingAnalyses: Analysis[];
  onStartAnalysis: (newAnalysis: Analysis) => void;
}

export const NewAnalysisPage: React.FC<NewAnalysisPageProps> = ({
  existingAnalyses,
  onStartAnalysis
}) => {
  // Form State
  const [sampleId, setSampleId] = useState('SAMPLE-004-ONCO');
  const [projectName, setProjectName] = useState('Precision Oncology Cohort');
  const [organism, setOrganism] = useState('Homo sapiens (Human)');
  const [description, setDescription] = useState('Diagnostic targeted NGS sequencing for high-risk cancer susceptibility variants.');

  const [referenceGenome, setReferenceGenome] = useState<'GRCh38' | 'GRCh37' | 'Custom Reference'>('GRCh38');
  const [customReferenceName, setCustomReferenceName] = useState('');
  const [annotationDb, setAnnotationDb] = useState<'Ensembl' | 'RefSeq' | 'Custom Database'>('Ensembl');

  // FASTQ Files
  const [fastqR1, setFastqR1] = useState<FastqFile | null>({
    name: 'SAMPLE_004_ONCO_R1.fastq.gz',
    size: 440200000,
    type: 'application/gzip',
    readCountEstimated: 29500000
  });

  const [fastqR2, setFastqR2] = useState<FastqFile | null>({
    name: 'SAMPLE_004_ONCO_R2.fastq.gz',
    size: 452100000,
    type: 'application/gzip',
    readCountEstimated: 29500000
  });

  // Parameters
  const [parameters, setParameters] = useState<AnalysisParameters>({
    minMappingQuality: 30,
    minBaseQuality: 20,
    minDepth: 10,
    variantQualityThreshold: 30,
    filterExpression: 'QD < 2.0 || FS > 60.0 || MQ < 40.0',
    threads: 8,
    pairedEnd: true
  });

  // Drag states
  const [isDraggingR1, setIsDraggingR1] = useState(false);
  const [isDraggingR2, setIsDraggingR2] = useState(false);

  // Real-time Validation
  const validation: ValidationResult = useMemo(() => {
    return validateAnalysisInput(
      sampleId,
      projectName,
      referenceGenome,
      annotationDb,
      fastqR1,
      fastqR2,
      parameters,
      existingAnalyses
    );
  }, [sampleId, projectName, referenceGenome, annotationDb, fastqR1, fastqR2, parameters, existingAnalyses]);

  // Handlers for File Selection
  const handleFileDrop = (e: React.DragEvent<HTMLDivElement>, isR2: boolean) => {
    e.preventDefault();
    if (isR2) setIsDraggingR2(false);
    else setIsDraggingR1(false);

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const file = e.dataTransfer.files[0];
      const newFastq: FastqFile = {
        name: file.name,
        size: file.size,
        type: file.type || 'application/gzip',
        lastModified: file.lastModified,
        readCountEstimated: Math.round(file.size / 30)
      };

      if (isR2) setFastqR2(newFastq);
      else setFastqR1(newFastq);
    }
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>, isR2: boolean) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      const newFastq: FastqFile = {
        name: file.name,
        size: file.size,
        type: file.type || 'application/gzip',
        lastModified: file.lastModified,
        readCountEstimated: Math.round(file.size / 30)
      };

      if (isR2) setFastqR2(newFastq);
      else setFastqR1(newFastq);
    }
  };

  // Load Preset
  const handleLoadPreset = (index: number) => {
    const preset = demoPresets[index];
    if (!preset) return;

    setSampleId(preset.sampleId);
    setProjectName(preset.projectName);
    setOrganism(preset.organism);
    setDescription(preset.description);
    setReferenceGenome(preset.referenceGenome);
    setAnnotationDb(preset.annotationDb);
    setParameters({ ...preset.parameters });

    setFastqR1({
      name: preset.r1FileName,
      size: preset.r1Size,
      type: 'application/gzip',
      readCountEstimated: Math.round(preset.r1Size / 28)
    });

    setFastqR2({
      name: preset.r2FileName,
      size: preset.r2Size,
      type: 'application/gzip',
      readCountEstimated: Math.round(preset.r2Size / 28)
    });
  };

  // Run Analysis
  const handleStart = () => {
    if (!validation.canStart) return;

    const nextNumber = existingAnalyses.length + 1;
    const analysisId = `MUT-2026-${String(nextNumber).padStart(3, '0')}`;

    const newAnalysis: Analysis = {
      id: analysisId,
      sampleId: sampleId.trim(),
      projectName: projectName.trim(),
      organism: organism.trim(),
      description: description.trim(),
      referenceGenome,
      customReferenceName: referenceGenome === 'Custom Reference' ? customReferenceName : undefined,
      annotationDb,
      fastqR1,
      fastqR2,
      parameters: { ...parameters },
      status: 'Running',
      createdAt: new Date().toISOString().replace('T', ' ').substring(0, 19),
      duration: '0s',
      pipelineVersion: 'MutaTrack v1.4 (GATK 4.5.0)',
      stages: [
        {
          id: 'qc',
          name: 'Quality Control',
          tool: 'FastQC v0.12.1',
          description: 'Evaluate per-base sequence quality scores and GC distribution.',
          status: 'running',
          progress: 15,
          logs: [
            `[${new Date().toLocaleTimeString()}] Pipeline initiated for ${sampleId}`,
            `[${new Date().toLocaleTimeString()}] FastQC started on ${fastqR1?.name} & ${fastqR2?.name}`,
            `[${new Date().toLocaleTimeString()}] Computing base calling quality matrices...`
          ]
        },
        {
          id: 'trimming',
          name: 'Trimming & Adapter Removal',
          tool: 'fastp v0.23.4',
          description: 'Filter low-quality reads and trim adapter overhangs.',
          status: 'pending',
          progress: 0,
          logs: []
        },
        {
          id: 'alignment',
          name: 'Reference Alignment',
          tool: 'BWA-MEM v0.7.17',
          description: `Align paired-end reads to reference genome ${referenceGenome}.`,
          status: 'pending',
          progress: 0,
          logs: []
        },
        {
          id: 'bam_processing',
          name: 'BAM Processing & Deduplication',
          tool: 'SAMtools & GATK MarkDuplicates',
          description: 'Sort BAM by coordinates, mark optical duplicates, generate BAI index.',
          status: 'pending',
          progress: 0,
          logs: []
        },
        {
          id: 'variant_calling',
          name: 'Variant Calling',
          tool: 'GATK HaplotypeCaller v4.5.0.0',
          description: 'Discover SNPs and INDELs via local de-novo haplotype assembly.',
          status: 'pending',
          progress: 0,
          logs: []
        },
        {
          id: 'filtering',
          name: 'Variant Filtration',
          tool: 'GATK VariantFiltration',
          description: `Apply hard filters (${parameters.filterExpression}).`,
          status: 'pending',
          progress: 0,
          logs: []
        },
        {
          id: 'annotation',
          name: 'Functional Annotation',
          tool: `${annotationDb} VEP v111 & ClinVar`,
          description: 'Annotate coding consequence, transcript symbols, and pathogenicity.',
          status: 'pending',
          progress: 0,
          logs: []
        },
        {
          id: 'report_generation',
          name: 'Report Generation',
          tool: 'MultiQC & MutaTrack Engine',
          description: 'Compile single-canvas metrics, VCF, CSV, and diagnostic plots.',
          status: 'pending',
          progress: 0,
          logs: []
        }
      ],
      logs: [
        {
          timestamp: new Date().toLocaleTimeString(),
          stageId: 'qc',
          message: `Analysis job ${analysisId} submitted for sample ${sampleId} [Project: ${projectName}]`,
          level: 'info'
        },
        {
          timestamp: new Date().toLocaleTimeString(),
          stageId: 'qc',
          message: `Input verified: Reference=${referenceGenome}, DB=${annotationDb}, Threads=${parameters.threads}`,
          level: 'success'
        }
      ],
      metrics: {
        fastq: {
          readCount: 31200000,
          q30ScorePct: 95.4,
          gcContentPct: 45.2,
          totalBasesMb: 4680.0
        },
        trimming: {
          readsBefore: 31200000,
          readsAfter: 31165000,
          readsRemoved: 35000,
          adapterContaminationPct: 0.8
        },
        alignment: {
          totalReads: 31165000,
          mappedReads: 30946845,
          unmappedReads: 218155,
          mappingPercentage: 99.3,
          duplicateReadsPct: 5.2
        },
        bamProcessing: {
          sorted: true,
          indexed: true,
          meanReadDepth: 52.4,
          coverageBasesPct: 99.1
        },
        variantCalling: {
          totalVariants: 4950,
          snps: 4320,
          indels: 630,
          tiTvRatio: 2.16
        },
        filtering: {
          variantsBefore: 4950,
          variantsAfter: 4310,
          filteredOut: 640,
          filterPassRatePct: 87.1
        },
        annotation: {
          annotatedVariants: 4310,
          highImpact: 14,
          moderateImpact: 92,
          lowImpact: 234,
          modifierImpact: 3970
        }
      },
      variants: []
    };

    onStartAnalysis(newAnalysis);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-bold uppercase tracking-wider text-teal-700 bg-teal-50 px-2.5 py-0.5 rounded-full border border-teal-200">
              UC-02 Menyiapkan Input • UC-04 Parameter
            </span>
            <span className="text-xs font-mono text-slate-400">• New Workflow Run</span>
          </div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
            Create New Variant Calling Analysis
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Configure paired-end FASTQ reads, reference genome index, annotation databases, and GATK calling thresholds.
          </p>
        </div>

        {/* Preset quick loader */}
        <div className="flex items-center gap-2">
          <span className="text-xs font-medium text-slate-500 hidden sm:inline">Presets:</span>
          <button
            type="button"
            onClick={() => handleLoadPreset(0)}
            className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-medium rounded-lg border border-slate-300 transition flex items-center gap-1 cursor-pointer"
          >
            <Sparkles size={13} className="text-teal-600" />
            <span>Onco Risk Panel</span>
          </button>
          <button
            type="button"
            onClick={() => handleLoadPreset(1)}
            className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-medium rounded-lg border border-slate-300 transition flex items-center gap-1 cursor-pointer"
          >
            <Sparkles size={13} className="text-teal-600" />
            <span>Rare Disease WES</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Columns: Input Configuration Forms */}
        <div className="lg:col-span-2 space-y-6">
          {/* Section A: FASTQ Files Upload */}
          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-teal-50 text-teal-700 flex items-center justify-center font-bold text-xs">
                  A
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">FASTQ Input Files (Paired-End)</h3>
                  <p className="text-[11px] text-slate-500">
                    Supports .fastq.gz, .fq.gz, .fastq, or .fq formats
                  </p>
                </div>
              </div>
              <span className="text-[11px] font-mono text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
                Illumina HiSeq / NovaSeq
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* FASTQ R1 */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 flex items-center justify-between">
                  <span>FASTQ R1 (Forward Read) *</span>
                  {fastqR1 && (
                    <button
                      type="button"
                      onClick={() => setFastqR1(null)}
                      className="text-rose-600 hover:text-rose-800 text-[11px] flex items-center gap-0.5"
                    >
                      <Trash2 size={11} /> Remove
                    </button>
                  )}
                </label>

                {fastqR1 ? (
                  <div className="p-3 bg-teal-50/60 border border-teal-200 rounded-lg flex items-center justify-between">
                    <div className="flex items-center gap-2 overflow-hidden">
                      <FileCheck size={18} className="text-teal-600 shrink-0" />
                      <div className="overflow-hidden">
                        <p className="text-xs font-mono font-bold text-slate-800 truncate">
                          {fastqR1.name}
                        </p>
                        <p className="text-[10px] text-slate-500">
                          {(fastqR1.size / (1024 * 1024)).toFixed(1)} MB • ~{((fastqR1.readCountEstimated || 0) / 1e6).toFixed(1)}M reads
                        </p>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div
                    onDragOver={(e) => { e.preventDefault(); setIsDraggingR1(true); }}
                    onDragLeave={() => setIsDraggingR1(false)}
                    onDrop={(e) => handleFileDrop(e, false)}
                    className={`border-2 border-dashed rounded-lg p-5 text-center transition ${
                      isDraggingR1
                        ? 'border-teal-500 bg-teal-50/40'
                        : 'border-slate-300 hover:border-slate-400 bg-slate-50/50'
                    }`}
                  >
                    <Upload size={22} className="mx-auto text-slate-400 mb-1.5" />
                    <p className="text-xs font-medium text-slate-700">
                      Drag & drop FASTQ R1 here
                    </p>
                    <p className="text-[10px] text-slate-400 mb-2">or select from local drive</p>
                    <label className="inline-flex px-3 py-1.5 bg-white border border-slate-300 rounded-md text-xs font-semibold text-slate-700 hover:bg-slate-50 cursor-pointer shadow-2xs">
                      Browse R1
                      <input
                        type="file"
                        accept=".fastq,.fq,.fastq.gz,.fq.gz"
                        className="hidden"
                        onChange={(e) => handleFileInput(e, false)}
                      />
                    </label>
                  </div>
                )}
              </div>

              {/* FASTQ R2 */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 flex items-center justify-between">
                  <span>FASTQ R2 (Reverse Read) *</span>
                  {fastqR2 && (
                    <button
                      type="button"
                      onClick={() => setFastqR2(null)}
                      className="text-rose-600 hover:text-rose-800 text-[11px] flex items-center gap-0.5"
                    >
                      <Trash2 size={11} /> Remove
                    </button>
                  )}
                </label>

                {fastqR2 ? (
                  <div className="p-3 bg-teal-50/60 border border-teal-200 rounded-lg flex items-center justify-between">
                    <div className="flex items-center gap-2 overflow-hidden">
                      <FileCheck size={18} className="text-teal-600 shrink-0" />
                      <div className="overflow-hidden">
                        <p className="text-xs font-mono font-bold text-slate-800 truncate">
                          {fastqR2.name}
                        </p>
                        <p className="text-[10px] text-slate-500">
                          {(fastqR2.size / (1024 * 1024)).toFixed(1)} MB • ~{((fastqR2.readCountEstimated || 0) / 1e6).toFixed(1)}M reads
                        </p>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div
                    onDragOver={(e) => { e.preventDefault(); setIsDraggingR2(true); }}
                    onDragLeave={() => setIsDraggingR2(false)}
                    onDrop={(e) => handleFileDrop(e, true)}
                    className={`border-2 border-dashed rounded-lg p-5 text-center transition ${
                      isDraggingR2
                        ? 'border-teal-500 bg-teal-50/40'
                        : 'border-slate-300 hover:border-slate-400 bg-slate-50/50'
                    }`}
                  >
                    <Upload size={22} className="mx-auto text-slate-400 mb-1.5" />
                    <p className="text-xs font-medium text-slate-700">
                      Drag & drop FASTQ R2 here
                    </p>
                    <p className="text-[10px] text-slate-400 mb-2">or select from local drive</p>
                    <label className="inline-flex px-3 py-1.5 bg-white border border-slate-300 rounded-md text-xs font-semibold text-slate-700 hover:bg-slate-50 cursor-pointer shadow-2xs">
                      Browse R2
                      <input
                        type="file"
                        accept=".fastq,.fq,.fastq.gz,.fq.gz"
                        className="hidden"
                        onChange={(e) => handleFileInput(e, true)}
                      />
                    </label>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Section B & C: Reference Genome & Annotation Database */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Reference Genome */}
            <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-3">
              <div className="flex items-center gap-2 border-b border-slate-100 pb-2">
                <div className="w-6 h-6 rounded-md bg-teal-50 text-teal-700 flex items-center justify-center font-bold text-xs">
                  B
                </div>
                <h3 className="text-sm font-bold text-slate-900">Reference Genome *</h3>
              </div>

              <div className="space-y-2">
                {[
                  { id: 'GRCh38', title: 'GRCh38 / hg38', desc: 'Default GATK bundle (Ensembl/NCBI build 38)' },
                  { id: 'GRCh37', title: 'GRCh37 / hg19', desc: 'Legacy clinical standard build' },
                  { id: 'Custom Reference', title: 'Custom FASTA', desc: 'Provide custom indexed FASTA' }
                ].map((item) => (
                  <label
                    key={item.id}
                    className={`flex items-start gap-2.5 p-2.5 rounded-lg border text-xs cursor-pointer transition ${
                      referenceGenome === item.id
                        ? 'bg-teal-50/80 border-teal-300 text-teal-950 font-medium'
                        : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                    }`}
                  >
                    <input
                      type="radio"
                      name="refGenome"
                      checked={referenceGenome === item.id}
                      onChange={() => setReferenceGenome(item.id as any)}
                      className="mt-0.5 text-teal-600 focus:ring-teal-500"
                    />
                    <div>
                      <span className="font-bold block">{item.title}</span>
                      <span className="text-[11px] text-slate-500">{item.desc}</span>
                    </div>
                  </label>
                ))}

                {referenceGenome === 'Custom Reference' && (
                  <div className="pt-2">
                    <input
                      type="text"
                      placeholder="e.g. /data/references/custom_t2t.fasta"
                      value={customReferenceName}
                      onChange={(e) => setCustomReferenceName(e.target.value)}
                      className="w-full text-xs font-mono p-2 border border-slate-300 rounded-md"
                    />
                  </div>
                )}
              </div>
            </div>

            {/* Annotation Database */}
            <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-3">
              <div className="flex items-center gap-2 border-b border-slate-100 pb-2">
                <div className="w-6 h-6 rounded-md bg-teal-50 text-teal-700 flex items-center justify-center font-bold text-xs">
                  C
                </div>
                <h3 className="text-sm font-bold text-slate-900">Annotation Database *</h3>
              </div>

              <div className="space-y-2">
                {[
                  { id: 'Ensembl', title: 'Ensembl VEP v111', desc: 'Includes canonical transcripts & ClinVar' },
                  { id: 'RefSeq', title: 'NCBI RefSeq & dbSNP', desc: 'NCBI curated transcript models' },
                  { id: 'Custom Database', title: 'Custom SnpEff / DB', desc: 'Targeted custom database annotation' }
                ].map((item) => (
                  <label
                    key={item.id}
                    className={`flex items-start gap-2.5 p-2.5 rounded-lg border text-xs cursor-pointer transition ${
                      annotationDb === item.id
                        ? 'bg-teal-50/80 border-teal-300 text-teal-950 font-medium'
                        : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                    }`}
                  >
                    <input
                      type="radio"
                      name="annotDb"
                      checked={annotationDb === item.id}
                      onChange={() => setAnnotationDb(item.id as any)}
                      className="mt-0.5 text-teal-600 focus:ring-teal-500"
                    />
                    <div>
                      <span className="font-bold block">{item.title}</span>
                      <span className="text-[11px] text-slate-500">{item.desc}</span>
                    </div>
                  </label>
                ))}
              </div>
            </div>
          </div>

          {/* Section D: Sample Information */}
          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-4">
            <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
              <div className="w-6 h-6 rounded-md bg-teal-50 text-teal-700 flex items-center justify-center font-bold text-xs">
                D
              </div>
              <h3 className="text-sm font-bold text-slate-900">Sample & Project Metadata</h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Sample ID *
                </label>
                <input
                  type="text"
                  value={sampleId}
                  onChange={(e) => setSampleId(e.target.value)}
                  placeholder="e.g. SAMPLE-004-ONCO"
                  className="w-full text-xs font-mono p-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:outline-hidden"
                />
                <span className="text-[10px] text-slate-400 mt-0.5 block">
                  Unique sample identifier within the project
                </span>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Project Name *
                </label>
                <input
                  type="text"
                  value={projectName}
                  onChange={(e) => setProjectName(e.target.value)}
                  placeholder="e.g. Precision Oncology Cohort"
                  className="w-full text-xs p-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Organism
                </label>
                <input
                  type="text"
                  value={organism}
                  onChange={(e) => setOrganism(e.target.value)}
                  className="w-full text-xs p-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Run Description / Notes
                </label>
                <input
                  type="text"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Clinical diagnostic notes or panel specifications"
                  className="w-full text-xs p-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:outline-hidden"
                />
              </div>
            </div>
          </div>

          {/* Section E: Configurable Analysis Parameters */}
          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-md bg-teal-50 text-teal-700 flex items-center justify-center font-bold text-xs">
                  E
                </div>
                <h3 className="text-sm font-bold text-slate-900">Analysis Parameters (GATK Config)</h3>
              </div>
              <span className="text-[11px] text-teal-700 bg-teal-50 px-2 py-0.5 rounded font-mono">
                Standard Defaults Loaded
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Minimum Depth (DP)
                </label>
                <input
                  type="number"
                  min="1"
                  max="1000"
                  value={parameters.minDepth}
                  onChange={(e) => setParameters({ ...parameters, minDepth: Number(e.target.value) })}
                  className="w-full text-xs font-mono p-2 border border-slate-300 rounded-lg"
                />
                <span className="text-[10px] text-slate-400">Default = 10</span>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Min Mapping Quality (MQ)
                </label>
                <input
                  type="number"
                  min="0"
                  max="60"
                  value={parameters.minMappingQuality}
                  onChange={(e) => setParameters({ ...parameters, minMappingQuality: Number(e.target.value) })}
                  className="w-full text-xs font-mono p-2 border border-slate-300 rounded-lg"
                />
                <span className="text-[10px] text-slate-400">Default = 30 (Phred)</span>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Min Base Quality (BQ)
                </label>
                <input
                  type="number"
                  min="0"
                  max="50"
                  value={parameters.minBaseQuality}
                  onChange={(e) => setParameters({ ...parameters, minBaseQuality: Number(e.target.value) })}
                  className="w-full text-xs font-mono p-2 border border-slate-300 rounded-lg"
                />
                <span className="text-[10px] text-slate-400">Default = 20 (Q20)</span>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Variant Quality Threshold
                </label>
                <input
                  type="number"
                  min="10"
                  max="500"
                  value={parameters.variantQualityThreshold}
                  onChange={(e) => setParameters({ ...parameters, variantQualityThreshold: Number(e.target.value) })}
                  className="w-full text-xs font-mono p-2 border border-slate-300 rounded-lg"
                />
                <span className="text-[10px] text-slate-400">Default = 30</span>
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Variant Hard-Filter Expression
                </label>
                <input
                  type="text"
                  value={parameters.filterExpression}
                  onChange={(e) => setParameters({ ...parameters, filterExpression: e.target.value })}
                  className="w-full text-xs font-mono p-2 border border-slate-300 rounded-lg"
                />
                <span className="text-[10px] text-slate-400">JEXL GATK VariantFiltration expression</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right 1 Column: Input Validation Box (UC-03) & Run Analysis (UC-05) */}
        <div className="space-y-6">
          {/* Validation Panel */}
          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-4 sticky top-20">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-1.5">
                <FileCheck size={16} className="text-teal-600" />
                <h3 className="text-sm font-bold text-slate-900">Input Validation (UC-03)</h3>
              </div>
              <span
                className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                  validation.canStart
                    ? 'bg-emerald-100 text-emerald-800'
                    : 'bg-rose-100 text-rose-800'
                }`}
              >
                {validation.canStart ? 'Ready to Run' : `${validation.criticalErrorsCount} Issues`}
              </span>
            </div>

            <p className="text-[11px] text-slate-500 leading-relaxed">
              MutaTrack inspects all required files, pair extensions, sample uniqueness, and parameter boundaries before dispatching pipeline tasks.
            </p>

            {/* Validation Checklist */}
            <div className="space-y-2.5 pt-1">
              {validation.items.map((item) => (
                <div
                  key={item.id}
                  className={`p-2.5 rounded-lg border text-xs flex items-start gap-2 transition ${
                    item.isValid
                      ? 'bg-emerald-50/50 border-emerald-200 text-emerald-900'
                      : 'bg-rose-50/70 border-rose-200 text-rose-900'
                  }`}
                >
                  {item.isValid ? (
                    <CheckCircle2 size={16} className="text-emerald-600 shrink-0 mt-0.5" />
                  ) : (
                    <XCircle size={16} className="text-rose-600 shrink-0 mt-0.5" />
                  )}
                  <div className="flex-1">
                    <span className="font-semibold block">{item.label}</span>
                    <span className={`text-[11px] ${item.isValid ? 'text-emerald-700' : 'text-rose-700 font-medium'}`}>
                      {item.message}
                    </span>
                  </div>
                </div>
              ))}
            </div>

            {/* Run Button (UC-05) */}
            <div className="pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={handleStart}
                disabled={!validation.canStart}
                className={`w-full py-3.5 px-4 rounded-xl font-extrabold text-sm flex items-center justify-center gap-2 shadow-md transition cursor-pointer ${
                  validation.canStart
                    ? 'bg-teal-600 hover:bg-teal-700 text-white shadow-teal-600/20 active:scale-[0.99]'
                    : 'bg-slate-200 text-slate-400 cursor-not-allowed shadow-none'
                }`}
              >
                <Play size={18} className={validation.canStart ? 'fill-current' : ''} />
                <span>Run Analysis</span>
              </button>

              {!validation.canStart && (
                <p className="text-[11px] text-rose-600 text-center mt-2 font-medium">
                  Resolve critical validation errors above to enable pipeline execution.
                </p>
              )}

              {validation.canStart && (
                <p className="text-[11px] text-slate-500 text-center mt-2">
                  Will dispatch 8 workflow stages: QC → Trim → BWA → BAM → GATK → VEP
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
