import { Analysis, PipelineStage, VariantRecord, SingleCanvasMetrics } from '../types/bioinformatics';

export const createDefaultStages = (status: 'pending' | 'running' | 'completed' = 'pending'): PipelineStage[] => {
  return [
    {
      id: 'qc',
      name: 'Quality Control',
      tool: 'FastQC v0.12.1',
      description: 'Evaluate per-base sequence quality scores, GC content, and adapter contamination.',
      status: status === 'completed' ? 'completed' : status === 'running' ? 'completed' : 'pending',
      progress: status === 'completed' ? 100 : status === 'running' ? 100 : 0,
      logs: [
        'Running FastQC on paired-end reads R1 and R2',
        'Computing Phred scores across 150bp read cycles',
        'GC distribution: 44.8% (optimal human range)',
        'FASTQ QC check passed: 98.4% Q30 bases'
      ]
    },
    {
      id: 'trimming',
      name: 'Trimming & Adapter Removal',
      tool: 'fastp v0.23.4 / Cutadapt',
      description: 'Filter low-quality reads (Phred < 20) and trim Illumina Universal Adapter sequences.',
      status: status === 'completed' ? 'completed' : status === 'running' ? 'completed' : 'pending',
      progress: status === 'completed' ? 100 : status === 'running' ? 100 : 0,
      logs: [
        'Scanning for Illumina TruSeq/Nextera adapter signatures',
        'Trimmed 1,420,380 adapter bases across 28,450 reads',
        'Filtered out 34,120 low-quality reads with mean Q < 20',
        'Cleaned reads ready for genomic alignment'
      ]
    },
    {
      id: 'alignment',
      name: 'Reference Alignment',
      tool: 'BWA-MEM v0.7.17-r1188',
      description: 'Map paired-end trimmed FASTQ reads against reference genome index (BWT index).',
      status: status === 'completed' ? 'completed' : status === 'running' ? 'running' : 'pending',
      progress: status === 'completed' ? 100 : status === 'running' ? 68 : 0,
      logs: [
        'Loading reference genome indices into shared memory',
        'Mapping reads with 8 CPU threads using BWA-MEM algorithm',
        'Processed 24,000,000 read pairs (99.18% mapped to GRCh38)',
        'Alignment completed: 0.82% discordant or unmapped reads'
      ]
    },
    {
      id: 'bam_processing',
      name: 'BAM Processing & Deduplication',
      tool: 'SAMtools v1.19 & GATK MarkDuplicates',
      description: 'Coordinate sort SAM records, identify PCR optical duplicates, and create BAI index.',
      status: status === 'completed' ? 'completed' : 'pending',
      progress: status === 'completed' ? 100 : 0,
      logs: [
        'Coordinate sorting binary sequence alignment records',
        'Running Picard / GATK MarkDuplicatesSpark algorithm',
        'Identified 6.4% optical / PCR duplicates marked in flag field',
        'Generated BAM index (.bai) for high-speed random access'
      ]
    },
    {
      id: 'variant_calling',
      name: 'Germline / Somatic Variant Calling',
      tool: 'GATK HaplotypeCaller v4.5.0.0',
      description: 'Call SNPs and INDELs via local de-novo assembly of candidate haplotype regions.',
      status: status === 'completed' ? 'completed' : 'pending',
      progress: status === 'completed' ? 100 : 0,
      logs: [
        'ActiveRegion determination across target intervals',
        'Performing de-novo assembly via De Bruijn graphs',
        'Calculating PairHMM likelihoods of reads given haplotypes',
        'Discovered 4,821 raw candidate variants across chromosomes'
      ]
    },
    {
      id: 'filtering',
      name: 'Variant Filtration (VQSR / Hard Filters)',
      tool: 'GATK VariantFiltration',
      description: 'Filter false positives using standard parameters (QD < 2.0, FS > 60.0, MQ < 40.0).',
      status: status === 'completed' ? 'completed' : 'pending',
      progress: status === 'completed' ? 100 : 0,
      logs: [
        'Applying JEXL hard filter expression: QD < 2.0 || FS > 60.0 || MQ < 40.0',
        'Flagging low-confidence calls with LowQual and FilterTag',
        'Retained 4,185 high-confidence variants passing all quality gates',
        'Ti/Tv ratio calculated: 2.14 (expected human WGS/WES ratio)'
      ]
    },
    {
      id: 'annotation',
      name: 'Functional Annotation',
      tool: 'Ensembl VEP v111 & ClinVar 2026',
      description: 'Annotate variants with gene symbols, sequence ontology effects, and clinical significance.',
      status: status === 'completed' ? 'completed' : 'pending',
      progress: status === 'completed' ? 100 : 0,
      logs: [
        'Connecting to Ensembl Transcript Cache v111',
        'Evaluating coding consequence against RefSeq & Ensembl canonical transcripts',
        'Annotating with dbSNP rsID and ClinVar pathogenic classifications',
        'Annotated 4,185 variants: 12 High Impact, 84 Moderate Impact'
      ]
    },
    {
      id: 'report_generation',
      name: 'Report & Multi-Format Generation',
      tool: 'MutaTrack Engine & MultiQC v1.21',
      description: 'Compile single-canvas metrics, interactive variant table, VCF v4.2 and CSV outputs.',
      status: status === 'completed' ? 'completed' : 'pending',
      progress: status === 'completed' ? 100 : 0,
      logs: [
        'Generating standard compliant VCF 4.2 file format',
        'Building CSV summary spreadsheet for research team',
        'Rendering Single-Canvas visual QC and pipeline performance metrics',
        'Analysis pipeline finished successfully'
      ]
    }
  ];
};

export const sampleVariantsDataset1: VariantRecord[] = [
  {
    id: 'var-01',
    chromosome: 'chr17',
    position: 43057110,
    reference: 'G',
    alternate: 'A',
    qual: 98.4,
    depth: 54,
    gene: 'BRCA1',
    effect: 'missense_variant',
    impact: 'HIGH',
    type: 'SNP',
    alleleFrequency: 0.48,
    clinvar: 'Pathogenic (Class 5)',
    dbsnp: 'rs80357713',
    genotype: '0/1'
  },
  {
    id: 'var-02',
    chromosome: 'chr17',
    position: 7674220,
    reference: 'C',
    alternate: 'T',
    qual: 99.2,
    depth: 62,
    gene: 'TP53',
    effect: 'stop_gained',
    impact: 'HIGH',
    type: 'SNP',
    alleleFrequency: 0.52,
    clinvar: 'Pathogenic',
    dbsnp: 'rs121913343',
    genotype: '0/1'
  },
  {
    id: 'var-03',
    chromosome: 'chr3',
    position: 179234297,
    reference: 'A',
    alternate: 'G',
    qual: 87.5,
    depth: 48,
    gene: 'PIK3CA',
    effect: 'missense_variant',
    impact: 'MODERATE',
    type: 'SNP',
    alleleFrequency: 0.35,
    clinvar: 'Likely Pathogenic',
    dbsnp: 'rs104886003',
    genotype: '0/1'
  },
  {
    id: 'var-04',
    chromosome: 'chr12',
    position: 25245350,
    reference: 'C',
    alternate: 'A',
    qual: 94.1,
    depth: 45,
    gene: 'KRAS',
    effect: 'missense_variant',
    impact: 'HIGH',
    type: 'SNP',
    alleleFrequency: 0.41,
    clinvar: 'Pathogenic (G12D hotspot)',
    dbsnp: 'rs121913529',
    genotype: '0/1'
  },
  {
    id: 'var-05',
    chromosome: 'chr7',
    position: 55181378,
    reference: 'GGAATTAAGAGAAGCAACATCTCCGAA',
    alternate: 'G',
    qual: 89.6,
    depth: 38,
    gene: 'EGFR',
    effect: 'inframe_deletion',
    impact: 'MODERATE',
    type: 'INDEL',
    alleleFrequency: 0.44,
    clinvar: 'Drug response (Osimertinib)',
    dbsnp: 'rs121434569',
    genotype: '0/1'
  },
  {
    id: 'var-06',
    chromosome: 'chr13',
    position: 32338189,
    reference: 'C',
    alternate: 'T',
    qual: 92.0,
    depth: 50,
    gene: 'BRCA2',
    effect: 'frameshift_variant',
    impact: 'HIGH',
    type: 'INDEL',
    alleleFrequency: 0.50,
    clinvar: 'Pathogenic',
    dbsnp: 'rs80359550',
    genotype: '0/1'
  },
  {
    id: 'var-07',
    chromosome: 'chr1',
    position: 115256530,
    reference: 'T',
    alternate: 'C',
    qual: 78.3,
    depth: 42,
    gene: 'NRAS',
    effect: 'missense_variant',
    impact: 'MODERATE',
    type: 'SNP',
    alleleFrequency: 0.28,
    clinvar: 'Uncertain Significance',
    dbsnp: 'rs11554290',
    genotype: '0/1'
  },
  {
    id: 'var-08',
    chromosome: 'chr5',
    position: 1295228,
    reference: 'G',
    alternate: 'A',
    qual: 96.0,
    depth: 58,
    gene: 'TERT',
    effect: 'upstream_gene_variant',
    impact: 'MODIFIER',
    type: 'SNP',
    alleleFrequency: 0.49,
    clinvar: 'Pathogenic promoter mutation',
    dbsnp: 'rs2853669',
    genotype: '0/1'
  },
  {
    id: 'var-09',
    chromosome: 'chr10',
    position: 87894008,
    reference: 'A',
    alternate: 'G',
    qual: 82.1,
    depth: 40,
    gene: 'PTEN',
    effect: 'synonymous_variant',
    impact: 'LOW',
    type: 'SNP',
    alleleFrequency: 0.51,
    clinvar: 'Benign',
    dbsnp: 'rs2299939',
    genotype: '0/1'
  },
  {
    id: 'var-10',
    chromosome: 'chr2',
    position: 29220790,
    reference: 'T',
    alternate: 'C',
    qual: 85.7,
    depth: 36,
    gene: 'ALK',
    effect: 'missense_variant',
    impact: 'MODERATE',
    type: 'SNP',
    alleleFrequency: 0.32,
    clinvar: 'Likely Benign',
    dbsnp: 'rs1881457',
    genotype: '0/1'
  },
  {
    id: 'var-11',
    chromosome: 'chr16',
    position: 68821034,
    reference: 'C',
    alternate: 'T',
    qual: 91.4,
    depth: 46,
    gene: 'CDH1',
    effect: 'splice_region_variant',
    impact: 'HIGH',
    type: 'SNP',
    alleleFrequency: 0.47,
    clinvar: 'Pathogenic',
    dbsnp: 'rs33967812',
    genotype: '0/1'
  },
  {
    id: 'var-12',
    chromosome: 'chr9',
    position: 21971153,
    reference: 'G',
    alternate: 'T',
    qual: 79.9,
    depth: 34,
    gene: 'CDKN2A',
    effect: 'synonymous_variant',
    impact: 'LOW',
    type: 'SNP',
    alleleFrequency: 0.50,
    clinvar: 'Benign',
    dbsnp: 'rs11515',
    genotype: '0/1'
  }
];

export const sampleMetricsDataset1: SingleCanvasMetrics = {
  fastq: {
    readCount: 28450120,
    q30ScorePct: 94.2,
    gcContentPct: 44.8,
    totalBasesMb: 4267.5
  },
  trimming: {
    readsBefore: 28450120,
    readsAfter: 28415980,
    readsRemoved: 34140,
    adapterContaminationPct: 0.9
  },
  alignment: {
    totalReads: 28415980,
    mappedReads: 28183180,
    unmappedReads: 232800,
    mappingPercentage: 99.18,
    duplicateReadsPct: 6.4
  },
  bamProcessing: {
    sorted: true,
    indexed: true,
    meanReadDepth: 48.6,
    coverageBasesPct: 98.7
  },
  variantCalling: {
    totalVariants: 4821,
    snps: 4192,
    indels: 629,
    tiTvRatio: 2.14
  },
  filtering: {
    variantsBefore: 4821,
    variantsAfter: 4185,
    filteredOut: 636,
    filterPassRatePct: 86.8
  },
  annotation: {
    annotatedVariants: 4185,
    highImpact: 12,
    moderateImpact: 84,
    lowImpact: 215,
    modifierImpact: 3874
  }
};

export const initialAnalyses: Analysis[] = [
  {
    id: 'MUT-2026-001',
    sampleId: 'SAMPLE-001-TUMOR',
    projectName: 'OncoSeq Hereditary Cancer Study',
    organism: 'Homo sapiens (Human)',
    description: 'High-depth targeted capture sequencing of hereditary oncology risk panel for diagnostic validation.',
    referenceGenome: 'GRCh38',
    annotationDb: 'Ensembl',
    fastqR1: {
      name: 'SAMPLE_001_TUMOR_R1.fastq.gz',
      size: 421000000,
      type: 'application/gzip',
      readCountEstimated: 28450120
    },
    fastqR2: {
      name: 'SAMPLE_001_TUMOR_R2.fastq.gz',
      size: 435000000,
      type: 'application/gzip',
      readCountEstimated: 28450120
    },
    parameters: {
      minMappingQuality: 30,
      minBaseQuality: 20,
      minDepth: 10,
      variantQualityThreshold: 30,
      filterExpression: 'QD < 2.0 || FS > 60.0 || MQ < 40.0',
      threads: 8,
      pairedEnd: true
    },
    status: 'Completed',
    createdAt: '2026-09-11 14:20:00',
    completedAt: '2026-09-11 15:05:42',
    duration: '45m 42s',
    pipelineVersion: 'MutaTrack v1.4 (GATK 4.5.0)',
    stages: createDefaultStages('completed'),
    logs: [
      { timestamp: '14:20:02', stageId: 'qc', message: 'Analysis initialized for sample SAMPLE-001-TUMOR', level: 'info' },
      { timestamp: '14:20:05', stageId: 'qc', message: 'FASTQ validation passed: R1 and R2 checksums match paired lengths', level: 'success' },
      { timestamp: '14:21:30', stageId: 'qc', message: 'FastQC finished: Q30 score 94.2%, GC content 44.8%', level: 'success' },
      { timestamp: '14:23:45', stageId: 'trimming', message: 'fastp adapter trimming complete: 34,140 low-quality reads pruned', level: 'info' },
      { timestamp: '14:35:10', stageId: 'alignment', message: 'BWA-MEM finished mapping: 28,183,180 reads aligned (99.18%)', level: 'success' },
      { timestamp: '14:41:22', stageId: 'bam_processing', message: 'SAMtools coordinate sort & GATK MarkDuplicates completed', level: 'info' },
      { timestamp: '14:52:15', stageId: 'variant_calling', message: 'GATK HaplotypeCaller called 4,821 raw candidate variants', level: 'info' },
      { timestamp: '14:58:30', stageId: 'filtering', message: 'VariantFiltration passed 4,185 high-confidence variants (86.8%)', level: 'success' },
      { timestamp: '15:04:10', stageId: 'annotation', message: 'Ensembl VEP completed annotation with ClinVar & dbSNP matches', level: 'success' },
      { timestamp: '15:05:42', stageId: 'report_generation', message: 'VCF, CSV and single-canvas summary generated successfully', level: 'success' }
    ],
    metrics: sampleMetricsDataset1,
    variants: sampleVariantsDataset1
  },
  {
    id: 'MUT-2026-002',
    sampleId: 'SAMPLE-002-TRIO-PROBAND',
    projectName: 'Rare Disease Diagnostic Program',
    organism: 'Homo sapiens (Human)',
    description: 'Whole Exome Sequencing for pediatric neurodevelopmental evaluation.',
    referenceGenome: 'GRCh38',
    annotationDb: 'RefSeq',
    fastqR1: {
      name: 'PROBAND_R1.fq.gz',
      size: 512000000,
      type: 'application/gzip',
      readCountEstimated: 35200000
    },
    fastqR2: {
      name: 'PROBAND_R2.fq.gz',
      size: 528000000,
      type: 'application/gzip',
      readCountEstimated: 35200000
    },
    parameters: {
      minMappingQuality: 30,
      minBaseQuality: 20,
      minDepth: 15,
      variantQualityThreshold: 35,
      filterExpression: 'QD < 2.0 || FS > 60.0 || MQ < 40.0',
      threads: 16,
      pairedEnd: true
    },
    status: 'Running',
    createdAt: '2026-09-12 08:30:00',
    duration: '22m 14s (running)',
    pipelineVersion: 'MutaTrack v1.4 (GATK 4.5.0)',
    stages: createDefaultStages('running'),
    logs: [
      { timestamp: '08:30:02', stageId: 'qc', message: 'Analysis initiated with 16 computational threads', level: 'info' },
      { timestamp: '08:30:15', stageId: 'qc', message: 'FASTQ R1 and R2 paired-end structure validated', level: 'success' },
      { timestamp: '08:34:20', stageId: 'qc', message: 'FastQC summary: 95.1% Q30, minimal adapter carryover', level: 'success' },
      { timestamp: '08:38:00', stageId: 'trimming', message: 'Adapter trimming completed: 21,500 reads trimmed', level: 'info' },
      { timestamp: '08:41:30', stageId: 'alignment', message: 'BWA-MEM mapping to GRCh38 in progress: chunk 6/10 running (68%)', level: 'info' }
    ],
    metrics: {
      ...sampleMetricsDataset1,
      fastq: { readCount: 35200000, q30ScorePct: 95.1, gcContentPct: 46.2, totalBasesMb: 5280.0 },
      alignment: { totalReads: 35200000, mappedReads: 23936000, unmappedReads: 310000, mappingPercentage: 98.7, duplicateReadsPct: 5.8 }
    },
    variants: []
  },
  {
    id: 'MUT-2026-003',
    sampleId: 'SAMPLE-003-CARDIAC',
    projectName: 'Cardiomyopathy Panel Screen',
    organism: 'Homo sapiens (Human)',
    description: 'Targeted deep sequencing of 48 cardiac sarcomere and ion-channel genes.',
    referenceGenome: 'GRCh37',
    annotationDb: 'Ensembl',
    fastqR1: {
      name: 'CARDIAC_R1.fastq.gz',
      size: 190000000,
      type: 'application/gzip',
      readCountEstimated: 14200000
    },
    fastqR2: {
      name: 'CARDIAC_R2.fastq.gz',
      size: 195000000,
      type: 'application/gzip',
      readCountEstimated: 14200000
    },
    parameters: {
      minMappingQuality: 30,
      minBaseQuality: 20,
      minDepth: 20,
      variantQualityThreshold: 30,
      filterExpression: 'QD < 2.0 || FS > 60.0',
      threads: 8,
      pairedEnd: true
    },
    status: 'Completed',
    createdAt: '2026-09-10 11:15:00',
    completedAt: '2026-09-10 11:42:18',
    duration: '27m 18s',
    pipelineVersion: 'MutaTrack v1.4 (GATK 4.5.0)',
    stages: createDefaultStages('completed'),
    logs: [
      { timestamp: '11:15:00', stageId: 'qc', message: 'Targeted cardiac panel analysis pipeline started', level: 'info' },
      { timestamp: '11:18:22', stageId: 'qc', message: 'QC metrics verified: 96.8% Q30 reads', level: 'success' },
      { timestamp: '11:22:10', stageId: 'alignment', message: 'BWA-MEM mapped 99.4% reads to GRCh37 target regions', level: 'success' },
      { timestamp: '11:34:00', stageId: 'variant_calling', message: 'HaplotypeCaller identified 892 targeted variants', level: 'info' },
      { timestamp: '11:42:18', stageId: 'report_generation', message: 'Analysis finished with 2 pathogenic MYH7 variants detected', level: 'success' }
    ],
    metrics: {
      ...sampleMetricsDataset1,
      fastq: { readCount: 14200000, q30ScorePct: 96.8, gcContentPct: 45.1, totalBasesMb: 2130.0 },
      alignment: { totalReads: 14200000, mappedReads: 14114800, unmappedReads: 85200, mappingPercentage: 99.4, duplicateReadsPct: 4.2 },
      bamProcessing: { sorted: true, indexed: true, meanReadDepth: 112.4, coverageBasesPct: 99.8 },
      variantCalling: { totalVariants: 892, snps: 820, indels: 72, tiTvRatio: 2.21 },
      filtering: { variantsBefore: 892, variantsAfter: 840, filteredOut: 52, filterPassRatePct: 94.1 },
      annotation: { annotatedVariants: 840, highImpact: 4, moderateImpact: 28, lowImpact: 88, modifierImpact: 720 }
    },
    variants: [
      {
        id: 'c-var-1',
        chromosome: 'chr14',
        position: 23887114,
        reference: 'C',
        alternate: 'T',
        qual: 99.5,
        depth: 98,
        gene: 'MYH7',
        effect: 'missense_variant',
        impact: 'HIGH',
        type: 'SNP',
        alleleFrequency: 0.50,
        clinvar: 'Pathogenic (Hypertrophic Cardiomyopathy)',
        dbsnp: 'rs121913628',
        genotype: '0/1'
      },
      {
        id: 'c-var-2',
        chromosome: 'chr1',
        position: 156108520,
        reference: 'G',
        alternate: 'A',
        qual: 94.2,
        depth: 85,
        gene: 'LMNA',
        effect: 'stop_gained',
        impact: 'HIGH',
        type: 'SNP',
        alleleFrequency: 0.49,
        clinvar: 'Pathogenic (Dilated Cardiomyopathy)',
        dbsnp: 'rs57723924',
        genotype: '0/1'
      },
      {
        id: 'c-var-3',
        chromosome: 'chr1',
        position: 201332450,
        reference: 'T',
        alternate: 'C',
        qual: 88.0,
        depth: 72,
        gene: 'TNNT2',
        effect: 'missense_variant',
        impact: 'MODERATE',
        type: 'SNP',
        alleleFrequency: 0.38,
        clinvar: 'Likely Pathogenic',
        dbsnp: 'rs104894372',
        genotype: '0/1'
      }
    ]
  }
];

export const demoPresets = [
  {
    name: 'Cancer Genomics Risk Panel (BRCA1/TP53/KRAS)',
    sampleId: 'SAMPLE-BRCA-004',
    projectName: 'Oncology Precision Trial',
    organism: 'Homo sapiens (Human)',
    description: 'High-depth clinical diagnostic panel targeting hereditary breast and ovarian cancer genes.',
    referenceGenome: 'GRCh38' as const,
    annotationDb: 'Ensembl' as const,
    r1FileName: 'BRCA_S4_L001_R1_001.fastq.gz',
    r2FileName: 'BRCA_S4_L001_R2_001.fastq.gz',
    r1Size: 385000000,
    r2Size: 398000000,
    parameters: {
      minMappingQuality: 30,
      minBaseQuality: 20,
      minDepth: 15,
      variantQualityThreshold: 30,
      filterExpression: 'QD < 2.0 || FS > 60.0 || MQ < 40.0',
      threads: 8,
      pairedEnd: true
    }
  },
  {
    name: 'Rare Disease Whole Exome (Pediatric Trio)',
    sampleId: 'SAMPLE-WES-005',
    projectName: 'Rare Disease Genomics Unit',
    organism: 'Homo sapiens (Human)',
    description: 'De novo mutation search across 22,000 coding genes with GRCh38 high-stringency calling.',
    referenceGenome: 'GRCh38' as const,
    annotationDb: 'RefSeq' as const,
    r1FileName: 'WES_TRIO_P05_R1.fq.gz',
    r2FileName: 'WES_TRIO_P05_R2.fq.gz',
    r1Size: 620000000,
    r2Size: 645000000,
    parameters: {
      minMappingQuality: 40,
      minBaseQuality: 25,
      minDepth: 20,
      variantQualityThreshold: 40,
      filterExpression: 'QD < 3.0 || FS > 50.0 || MQ < 45.0',
      threads: 12,
      pairedEnd: true
    }
  }
];
