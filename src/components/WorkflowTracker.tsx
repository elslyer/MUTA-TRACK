import React from 'react';
import { PipelineStage, PipelineStageId } from '../types/bioinformatics';
import { CheckCircle2, Circle, Loader2, ArrowRight } from 'lucide-react';

interface WorkflowTrackerProps {
  stages?: PipelineStage[];
  activeStageId?: PipelineStageId | 'results';
  onSelectStage?: (stageId: PipelineStageId) => void;
  compact?: boolean;
}

export const WorkflowTracker: React.FC<WorkflowTrackerProps> = ({
  stages = [],
  activeStageId,
  onSelectStage,
  compact = false
}) => {
  const steps: { id: PipelineStageId | 'results'; label: string; tool: string }[] = [
    { id: 'qc', label: 'QC', tool: 'FastQC' },
    { id: 'trimming', label: 'Trimming', tool: 'fastp' },
    { id: 'alignment', label: 'Alignment', tool: 'BWA-MEM' },
    { id: 'bam_processing', label: 'BAM Processing', tool: 'SAMtools' },
    { id: 'variant_calling', label: 'Variant Calling', tool: 'GATK' },
    { id: 'filtering', label: 'Filtering', tool: 'VarFilter' },
    { id: 'annotation', label: 'Annotation', tool: 'VEP/ClinVar' },
    { id: 'report_generation', label: 'Results', tool: 'MultiQC/VCF' }
  ];

  return (
    <div className="w-full bg-white border border-slate-200 rounded-xl p-3 sm:p-4 shadow-xs">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">Pipeline Workflow</span>
          <span className="text-xs px-2 py-0.5 rounded bg-slate-100 text-slate-600 font-mono">GATK Best Practices</span>
        </div>
        <div className="text-xs text-slate-400 hidden sm:block">
          FASTQ → QC → Trim → Align → BAM → Call → Filter → Annotate → Results
        </div>
      </div>

      <div className="relative overflow-x-auto pb-1 pt-2">
        <div className="flex items-center min-w-[720px] justify-between">
          {steps.map((step, idx) => {
            const stage = stages.find((s) => s.id === step.id);
            const isCompleted = stage ? stage.status === 'completed' : false;
            const isRunning = stage ? stage.status === 'running' : false;
            const isSelected = activeStageId === step.id;

            return (
              <React.Fragment key={step.id}>
                <button
                  type="button"
                  onClick={() => onSelectStage && onSelectStage(step.id as PipelineStageId)}
                  disabled={!onSelectStage}
                  className={`flex flex-col items-center group text-center transition-all ${
                    onSelectStage ? 'cursor-pointer hover:opacity-90' : 'cursor-default'
                  }`}
                >
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-semibold transition-all ${
                      isCompleted
                        ? 'bg-emerald-600 text-white shadow-xs'
                        : isRunning
                        ? 'bg-blue-600 text-white ring-4 ring-blue-100'
                        : isSelected
                        ? 'bg-slate-800 text-white'
                        : 'bg-slate-100 text-slate-500 border border-slate-300'
                    }`}
                  >
                    {isCompleted ? (
                      <CheckCircle2 size={16} />
                    ) : isRunning ? (
                      <Loader2 size={16} className="animate-spin" />
                    ) : (
                      <span>{idx + 1}</span>
                    )}
                  </div>
                  
                  <span
                    className={`mt-1.5 text-xs font-medium whitespace-nowrap ${
                      isRunning
                        ? 'text-blue-700 font-bold'
                        : isCompleted
                        ? 'text-emerald-800'
                        : 'text-slate-600'
                    }`}
                  >
                    {step.label}
                  </span>
                  
                  {!compact && (
                    <span className="text-[10px] text-slate-400 font-mono leading-none mt-0.5">
                      {step.tool}
                    </span>
                  )}
                </button>

                {idx < steps.length - 1 && (
                  <div className="flex-1 mx-2 h-0.5 relative">
                    <div className="absolute inset-0 bg-slate-200" />
                    <div
                      className="absolute inset-0 bg-emerald-500 transition-all duration-500"
                      style={{
                        width: isCompleted ? '100%' : isRunning ? '50%' : '0%'
                      }}
                    />
                  </div>
                )}
              </React.Fragment>
            );
          })}
        </div>
      </div>
    </div>
  );
};
