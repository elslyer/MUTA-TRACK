import { Analysis } from '../types/bioinformatics';

export const generateVcfString = (analysis: Analysis): string => {
  const dateStr = new Date(analysis.completedAt || analysis.createdAt).toISOString().split('T')[0].replace(/-/g, '');
  
  const headers = [
    '##fileformat=VCFv4.2',
    `##fileDate=${dateStr}`,
    '##source=MutaTrack_GATK_HaplotypeCaller_v4.5.0.0',
    `##reference=${analysis.referenceGenome}`,
    `##sampleID=${analysis.sampleId}`,
    `##project=${analysis.projectName}`,
    '##FILTER=<ID=PASS,Description="All filters passed">',
    '##FILTER=<ID=LowQual,Description="Low quality variant (QUAL < threshold or QD < 2.0)">',
    '##INFO=<ID=DP,Number=1,Type=Integer,Description="Approximate read depth; some reads may have been filtered">',
    '##INFO=<ID=AF,Number=A,Type=Float,Description="Allele Frequency for each ALT allele in the same order as listed">',
    '##INFO=<ID=GENE,Number=1,Type=String,Description="Ensembl Gene Symbol">',
    '##INFO=<ID=EFFECT,Number=1,Type=String,Description="Sequence Ontology Variant Consequence Effect">',
    '##INFO=<ID=IMPACT,Number=1,Type=String,Description="Variant Impact Severity: HIGH, MODERATE, LOW, MODIFIER">',
    '##INFO=<ID=CLINVAR,Number=1,Type=String,Description="ClinVar Clinical Significance Classification">',
    '##INFO=<ID=DB,Number=0,Type=Flag,Description="dbSNP Membership">',
    '##FORMAT=<ID=GT,Number=1,Type=String,Description="Genotype">',
    '##FORMAT=<ID=AD,Number=R,Type=Integer,Description="Allelic depths for the ref and alt alleles in the order listed">',
    '##FORMAT=<ID=DP,Number=1,Type=Integer,Description="Approximate read depth">',
    '##FORMAT=<ID=GQ,Number=1,Type=Integer,Description="Genotype Quality">',
    `#CHROM\tPOS\tID\tREF\tALT\tQUAL\tFILTER\tINFO\tFORMAT\t${analysis.sampleId}`
  ];

  const lines = analysis.variants.map((v) => {
    const refDepth = Math.round(v.depth * (1 - v.alleleFrequency));
    const altDepth = Math.round(v.depth * v.alleleFrequency);
    const info = [
      `DP=${v.depth}`,
      `AF=${v.alleleFrequency.toFixed(3)}`,
      `GENE=${v.gene}`,
      `EFFECT=${v.effect}`,
      `IMPACT=${v.impact}`,
      v.clinvar ? `CLINVAR=${v.clinvar.replace(/\s+/g, '_')}` : '',
      v.dbsnp ? 'DB' : ''
    ].filter(Boolean).join(';');

    const id = v.dbsnp || '.';
    const filter = v.qual >= 30 ? 'PASS' : 'LowQual';
    const format = 'GT:AD:DP:GQ';
    const sampleVal = `${v.genotype}:${refDepth},${altDepth}:${v.depth}:99`;

    return `${v.chromosome}\t${v.position}\t${id}\t${v.reference}\t${v.alternate}\t${v.qual.toFixed(1)}\t${filter}\t${info}\t${format}\t${sampleVal}`;
  });

  return `${headers.join('\n')}\n${lines.join('\n')}\n`;
};

export const downloadVcf = (analysis: Analysis): void => {
  const vcfContent = generateVcfString(analysis);
  const blob = new Blob([vcfContent], { type: 'text/plain;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${analysis.sampleId}_${analysis.id}.vcf`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
};
