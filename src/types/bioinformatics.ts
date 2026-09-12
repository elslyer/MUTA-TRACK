export type AnalysisStatus = 'Pending' | 'Validating' | 'Running' | 'Completed' | 'Failed' | 'Paused' | 'Cancelled';

export type StageStatus = 'pending' | 'running' | 'completed' | 'failed' | 'skipped';

export type PipelineStageId = 
  | 'qc' 
  | 'trimming' 
  | 'alignment' 
  | 'bam_processing' 
  | 'variant_calling' 
  | 'filtering' 
  | 'annotation' 
  | 'report_generation';

export interface PipelineStage {
  id: PipelineStageId;
  name: string;
  tool: string;
  description: string;
  status: StageStatus;
  progress: number; // 0 to 100
  startTime?: string;
  endTime?: string;
  logs: string[];
}

export interface AnalysisParameters {
  minMappingQuality: number; // default 30
  minBaseQuality: number;    // default 20
  minDepth: number;          // default 10
  variantQualityThreshold: number; // default 30
  filterExpression: string;  // e.g. "QD < 2.0 || FS > 60.0 || MQ < 40.0"
  threads: number;           // default 8
  pairedEnd: boolean;        // default true
}

export interface FastqFile {
  name: string;
  size: number; // in bytes
  type: string;
  lastModified?: number;
  readCountEstimated?: number;
}

export interface VariantRecord {
  id: string;
  chromosome: string;
  position: number;
  reference: string;
  alternate: string;
  qual: number;
  depth: number;
  gene: string;
  effect: string;
  impact: 'HIGH' | 'MODERATE' | 'LOW' | 'MODIFIER';
  type: 'SNP' | 'INDEL';
  alleleFrequency: number;
  clinvar?: string;
  dbsnp?: string;
  genotype: string;
}

export interface SingleCanvasMetrics {
  fastq: {
    readCount: number;
    q30ScorePct: number;
    gcContentPct: number;
    totalBasesMb: number;
  };
  trimming: {
    readsBefore: number;
    readsAfter: number;
    readsRemoved: number;
    adapterContaminationPct: number;
  };
  alignment: {
    totalReads: number;
    mappedReads: number;
    unmappedReads: number;
    mappingPercentage: number;
    duplicateReadsPct: number;
  };
  bamProcessing: {
    sorted: boolean;
    indexed: boolean;
    meanReadDepth: number;
    coverageBasesPct: number;
  };
  variantCalling: {
    totalVariants: number;
    snps: number;
    indels: number;
    tiTvRatio: number;
  };
  filtering: {
    variantsBefore: number;
    variantsAfter: number;
    filteredOut: number;
    filterPassRatePct: number;
  };
  annotation: {
    annotatedVariants: number;
    highImpact: number;
    moderateImpact: number;
    lowImpact: number;
    modifierImpact: number;
  };
}

export interface Analysis {
  id: string;
  sampleId: string;
  projectName: string;
  organism: string;
  description?: string;
  referenceGenome: 'GRCh38' | 'GRCh37' | 'Custom Reference';
  customReferenceName?: string;
  annotationDb: 'Ensembl' | 'RefSeq' | 'Custom Database';
  fastqR1?: FastqFile | null;
  fastqR2?: FastqFile | null;
  parameters: AnalysisParameters;
  status: AnalysisStatus;
  createdAt: string;
  completedAt?: string;
  duration?: string;
  pipelineVersion: string;
  stages: PipelineStage[];
  logs: { timestamp: string; stageId?: PipelineStageId; message: string; level: 'info' | 'warn' | 'error' | 'success' }[];
  metrics: SingleCanvasMetrics;
  variants: VariantRecord[];
}

export interface UserSession {
  username: string;
  fullName: string;
  role: string;
  organization: string;
  isLoggedIn: boolean;
}
