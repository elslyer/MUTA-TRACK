import { Analysis } from '../types/bioinformatics';

export const generateCsvString = (analysis: Analysis): string => {
  const headers = [
    'Chromosome',
    'Position',
    'dbSNP_ID',
    'Reference_Allele',
    'Alternate_Allele',
    'Variant_Type',
    'Quality_Score',
    'Read_Depth',
    'Allele_Frequency',
    'Gene_Symbol',
    'Consequence_Effect',
    'Impact_Severity',
    'ClinVar_Classification',
    'Genotype'
  ];

  const escapeCsv = (val: string | number | undefined) => {
    if (val === undefined || val === null) return '';
    const str = String(val);
    if (str.includes(',') || str.includes('"') || str.includes('\n')) {
      return `"${str.replace(/"/g, '""')}"`;
    }
    return str;
  };

  const rows = analysis.variants.map((v) => [
    escapeCsv(v.chromosome),
    escapeCsv(v.position),
    escapeCsv(v.dbsnp || 'novel'),
    escapeCsv(v.reference),
    escapeCsv(v.alternate),
    escapeCsv(v.type),
    escapeCsv(v.qual),
    escapeCsv(v.depth),
    escapeCsv(v.alleleFrequency),
    escapeCsv(v.gene),
    escapeCsv(v.effect),
    escapeCsv(v.impact),
    escapeCsv(v.clinvar || 'Not Reported'),
    escapeCsv(v.genotype)
  ].join(','));

  return [headers.join(','), ...rows].join('\n');
};

export const downloadCsv = (analysis: Analysis): void => {
  const csvContent = generateCsvString(analysis);
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${analysis.sampleId}_${analysis.id}_variants.csv`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
};
