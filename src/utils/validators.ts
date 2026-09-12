import { FastqFile, AnalysisParameters, Analysis } from '../types/bioinformatics';

export interface ValidationItem {
  id: string;
  label: string;
  isValid: boolean;
  message: string;
  critical: boolean;
}

export interface ValidationResult {
  canStart: boolean;
  items: ValidationItem[];
  criticalErrorsCount: number;
}

export const validateFastqExtension = (filename: string): boolean => {
  const lower = filename.toLowerCase();
  return (
    lower.endsWith('.fastq.gz') ||
    lower.endsWith('.fq.gz') ||
    lower.endsWith('.fastq') ||
    lower.endsWith('.fq')
  );
};

export const validateAnalysisInput = (
  sampleId: string,
  projectName: string,
  referenceGenome: string,
  annotationDb: string,
  fastqR1: FastqFile | null | undefined,
  fastqR2: FastqFile | null | undefined,
  parameters: AnalysisParameters,
  existingAnalyses: Analysis[]
): ValidationResult => {
  const items: ValidationItem[] = [];

  // 1. Sample ID Validation
  const trimmedSampleId = sampleId.trim();
  if (!trimmedSampleId) {
    items.push({
      id: 'sample_id',
      label: 'Sample ID',
      isValid: false,
      message: 'Sample ID cannot be empty',
      critical: true
    });
  } else {
    // Duplicate check within same project
    const isDuplicate = existingAnalyses.some(
      (a) =>
        a.sampleId.toLowerCase() === trimmedSampleId.toLowerCase() &&
        a.projectName.toLowerCase() === projectName.trim().toLowerCase()
    );

    if (isDuplicate) {
      items.push({
        id: 'sample_id_duplicate',
        label: 'Sample ID Uniqueness',
        isValid: false,
        message: `Sample ID "${trimmedSampleId}" already exists within project "${projectName}"`,
        critical: true
      });
    } else {
      items.push({
        id: 'sample_id',
        label: 'Sample ID',
        isValid: true,
        message: `Sample ID "${trimmedSampleId}" is valid and unique`,
        critical: true
      });
    }
  }

  // 2. FASTQ R1 Validation
  if (!fastqR1 || !fastqR1.name) {
    items.push({
      id: 'fastq_r1',
      label: 'FASTQ Forward (R1)',
      isValid: false,
      message: 'FASTQ R1 file is missing',
      critical: true
    });
  } else if (!validateFastqExtension(fastqR1.name)) {
    items.push({
      id: 'fastq_r1',
      label: 'FASTQ Forward (R1)',
      isValid: false,
      message: 'FASTQ R1 has invalid extension (must be .fastq, .fq, .fastq.gz, or .fq.gz)',
      critical: true
    });
  } else {
    items.push({
      id: 'fastq_r1',
      label: 'FASTQ Forward (R1)',
      isValid: true,
      message: `FASTQ R1 valid (${fastqR1.name})`,
      critical: true
    });
  }

  // 3. FASTQ R2 Validation (paired-end)
  if (parameters.pairedEnd) {
    if (!fastqR2 || !fastqR2.name) {
      items.push({
        id: 'fastq_r2',
        label: 'FASTQ Reverse (R2)',
        isValid: false,
        message: 'FASTQ R2 is missing for paired-end analysis',
        critical: true
      });
    } else if (!validateFastqExtension(fastqR2.name)) {
      items.push({
        id: 'fastq_r2',
        label: 'FASTQ Reverse (R2)',
        isValid: false,
        message: 'FASTQ R2 has invalid extension (must be .fastq, .fq, .fastq.gz, or .fq.gz)',
        critical: true
      });
    } else {
      items.push({
        id: 'fastq_r2',
        label: 'FASTQ Reverse (R2)',
        isValid: true,
        message: `FASTQ R2 valid (${fastqR2.name})`,
        critical: true
      });
    }
  }

  // 4. Reference Genome Validation
  if (!referenceGenome) {
    items.push({
      id: 'reference_genome',
      label: 'Reference Genome',
      isValid: false,
      message: 'No reference genome selected',
      critical: true
    });
  } else {
    items.push({
      id: 'reference_genome',
      label: 'Reference Genome',
      isValid: true,
      message: `Reference genome selected (${referenceGenome})`,
      critical: true
    });
  }

  // 5. Annotation Database Validation
  if (!annotationDb) {
    items.push({
      id: 'annotation_db',
      label: 'Annotation Database',
      isValid: false,
      message: 'No annotation database selected',
      critical: true
    });
  } else {
    items.push({
      id: 'annotation_db',
      label: 'Annotation Database',
      isValid: true,
      message: `Annotation database selected (${annotationDb})`,
      critical: true
    });
  }

  // 6. Parameters Validation
  const paramErrors: string[] = [];
  if (parameters.minDepth < 1 || parameters.minDepth > 1000) {
    paramErrors.push('Minimum depth must be between 1 and 1000');
  }
  if (parameters.minMappingQuality < 0 || parameters.minMappingQuality > 60) {
    paramErrors.push('Minimum mapping quality must be between 0 and 60');
  }
  if (parameters.minBaseQuality < 0 || parameters.minBaseQuality > 50) {
    paramErrors.push('Minimum base quality must be between 0 and 50');
  }
  if (parameters.variantQualityThreshold < 10 || parameters.variantQualityThreshold > 500) {
    paramErrors.push('Variant quality threshold must be between 10 and 500');
  }

  if (paramErrors.length > 0) {
    items.push({
      id: 'parameters',
      label: 'Analysis Parameters',
      isValid: false,
      message: paramErrors.join('; '),
      critical: true
    });
  } else {
    items.push({
      id: 'parameters',
      label: 'Analysis Parameters',
      isValid: true,
      message: 'All bioinformatics parameters validated within standard GATK ranges',
      critical: true
    });
  }

  const criticalErrorsCount = items.filter((item) => item.critical && !item.isValid).length;
  const canStart = criticalErrorsCount === 0;

  return {
    canStart,
    items,
    criticalErrorsCount
  };
};
