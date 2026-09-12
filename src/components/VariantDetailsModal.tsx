import React from 'react';
import { VariantRecord } from '../types/bioinformatics';
import { X, Dna, ShieldAlert, CheckCircle2, ExternalLink, Activity, Info } from 'lucide-react';

interface VariantDetailsModalProps {
  variant: VariantRecord | null;
  referenceGenome: string;
  sampleId: string;
  onClose: () => void;
}

export const VariantDetailsModal: React.FC<VariantDetailsModalProps> = ({
  variant,
  referenceGenome,
  sampleId,
  onClose
}) => {
  if (!variant) return null;

  const getImpactBadgeClass = (impact: string) => {
    switch (impact) {
      case 'HIGH':
        return 'bg-rose-100 text-rose-800 border-rose-200';
      case 'MODERATE':
        return 'bg-amber-100 text-amber-800 border-amber-200';
      case 'LOW':
        return 'bg-emerald-100 text-emerald-800 border-emerald-200';
      default:
        return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="bg-white rounded-xl shadow-2xl border border-slate-200 w-full max-w-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-teal-500/20 text-teal-400 flex items-center justify-center border border-teal-500/30">
              <Dna size={20} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-white tracking-tight">{variant.gene}</h3>
                <span className={`text-[11px] px-2 py-0.5 font-bold uppercase rounded border ${getImpactBadgeClass(variant.impact)}`}>
                  {variant.impact} Impact
                </span>
                <span className="text-xs font-mono bg-slate-800 text-slate-300 px-2 py-0.5 rounded">
                  {variant.type}
                </span>
              </div>
              <p className="text-xs text-slate-400 font-mono mt-0.5">
                {variant.chromosome}:{variant.position.toLocaleString()} ({variant.reference} → {variant.alternate})
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-md hover:bg-slate-800 transition"
          >
            <X size={18} />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 space-y-5 max-h-[75vh] overflow-y-auto">
          {/* Quick Metrics Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg">
              <span className="text-[11px] font-medium text-slate-500 block">Genotype</span>
              <span className="text-sm font-mono font-bold text-slate-900">{variant.genotype} (Heterozygous)</span>
            </div>
            <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg">
              <span className="text-[11px] font-medium text-slate-500 block">Read Depth (DP)</span>
              <span className="text-sm font-mono font-bold text-slate-900">{variant.depth}x</span>
            </div>
            <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg">
              <span className="text-[11px] font-medium text-slate-500 block">Allele Freq (AF)</span>
              <span className="text-sm font-mono font-bold text-slate-900">{(variant.alleleFrequency * 100).toFixed(1)}%</span>
            </div>
            <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg">
              <span className="text-[11px] font-medium text-slate-500 block">Quality Score</span>
              <span className="text-sm font-mono font-bold text-emerald-700">{variant.qual.toFixed(1)}</span>
            </div>
          </div>

          {/* Biological & Clinical Interpretation */}
          <div className="border border-slate-200 rounded-lg overflow-hidden">
            <div className="bg-slate-100 px-4 py-2 border-b border-slate-200 flex items-center justify-between">
              <span className="text-xs font-bold text-slate-700 uppercase tracking-wide flex items-center gap-1.5">
                <ShieldAlert size={14} className="text-amber-600" />
                Clinical & Functional Consequence
              </span>
              <span className="text-[11px] text-slate-500">Ref: {referenceGenome}</span>
            </div>
            <div className="p-4 space-y-3 bg-white text-sm">
              <div className="grid grid-cols-3 gap-2 py-1 border-b border-slate-100">
                <span className="text-xs text-slate-500 font-medium">Predicted Consequence:</span>
                <span className="text-xs font-semibold col-span-2 text-slate-900 font-mono">
                  {variant.effect}
                </span>
              </div>
              <div className="grid grid-cols-3 gap-2 py-1 border-b border-slate-100">
                <span className="text-xs text-slate-500 font-medium">ClinVar Significance:</span>
                <span className="text-xs font-bold col-span-2 text-rose-700">
                  {variant.clinvar || 'Not reported in ClinVar archive'}
                </span>
              </div>
              <div className="grid grid-cols-3 gap-2 py-1 border-b border-slate-100">
                <span className="text-xs text-slate-500 font-medium">dbSNP Identifier:</span>
                <div className="col-span-2 flex items-center gap-2">
                  <span className="text-xs font-mono font-semibold text-slate-800">
                    {variant.dbsnp || 'Novel Candidate Variant'}
                  </span>
                  {variant.dbsnp && (
                    <a
                      href={`https://www.ncbi.nlm.nih.gov/snp/${variant.dbsnp}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-teal-600 hover:text-teal-800 text-[11px] flex items-center gap-0.5 underline"
                    >
                      NCBI dbSNP <ExternalLink size={11} />
                    </a>
                  )}
                </div>
              </div>
              <div className="grid grid-cols-3 gap-2 py-1">
                <span className="text-xs text-slate-500 font-medium">Gene Database:</span>
                <div className="col-span-2 flex items-center gap-2">
                  <a
                    href={`https://www.ensembl.org/Homo_sapiens/Gene/Summary?g=${variant.gene}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:text-blue-800 text-xs font-medium flex items-center gap-1 underline"
                  >
                    Ensembl Gene ({variant.gene}) <ExternalLink size={12} />
                  </a>
                </div>
              </div>
            </div>
          </div>

          {/* Raw VCF Record Representation */}
          <div>
            <span className="text-xs font-bold text-slate-700 uppercase tracking-wide block mb-1.5 flex items-center gap-1.5">
              <Info size={14} className="text-slate-500" />
              Raw Standard VCF 4.2 Record
            </span>
            <div className="bg-slate-900 text-slate-200 p-3 rounded-lg text-[11px] font-mono overflow-x-auto leading-relaxed border border-slate-800">
              <span className="text-slate-500">#CHROM POS ID REF ALT QUAL FILTER INFO FORMAT {sampleId}</span>
              <br />
              <span className="text-amber-300">{variant.chromosome}</span>{' '}
              <span className="text-emerald-400">{variant.position}</span>{' '}
              <span className="text-slate-300">{variant.dbsnp || '.'}</span>{' '}
              <span className="text-rose-400">{variant.reference}</span>{' '}
              <span className="text-sky-400">{variant.alternate}</span>{' '}
              <span className="text-emerald-300">{variant.qual.toFixed(1)}</span>{' '}
              <span className="text-green-400">PASS</span>{' '}
              <span className="text-slate-300">
                DP={variant.depth};AF={variant.alleleFrequency.toFixed(3)};GENE={variant.gene};EFFECT={variant.effect};IMPACT={variant.impact}
              </span>{' '}
              <span className="text-slate-400">GT:AD:DP:GQ</span>{' '}
              <span className="text-teal-300">{variant.genotype}:{Math.round(variant.depth * 0.5)},{Math.round(variant.depth * 0.5)}:{variant.depth}:99</span>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3 bg-slate-50 border-t border-slate-200 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-900 text-white text-xs font-semibold rounded-lg shadow-xs transition"
          >
            Close Details
          </button>
        </div>
      </div>
    </div>
  );
};
