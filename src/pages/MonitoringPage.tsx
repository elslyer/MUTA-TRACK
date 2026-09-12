import React, { useState, useEffect, useRef } from 'react';
import {
  Activity,
  CheckCircle2,
  Clock,
  Pause,
  Play,
  RotateCcw,
  XCircle,
  Terminal,
  ArrowRight,
  Sparkles,
  RefreshCw,
  Cpu,
  Layers,
  FileCode,
  Check,
  AlertTriangle,
  FastForward
} from 'lucide-react';
import { Analysis, PipelineStage, PipelineStageId } from '../types/bioinformatics';
import { StatusBadge } from '../components/StatusBadge';
import { WorkflowTracker } from '../components/WorkflowTracker';
import confetti from 'canvas-confetti';
import { sampleVariantsDataset1 } from '../data/initialAnalyses';

interface MonitoringPageProps {
  analysis: Analysis;
  onUpdateAnalysis: (updated: Analysis) => void;
  onNavigateToResults: (analysisId: string) => void;
}

export const MonitoringPage: React.FC<MonitoringPageProps> = ({
  analysis,
  onUpdateAnalysis,
  onNavigateToResults
}) => {
  const [isPaused, setIsPaused] = useState(analysis?.status === 'Paused');
  const [selectedStageId, setSelectedStageId] = useState<PipelineStageId | null>(null);
  const [elapsedSeconds, setElapsedSeconds] = useState(145);
  const logEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll logs
  useEffect(() => {
    logEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [analysis?.logs]);

  // Real-time progress simulator when running
  useEffect(() => {
    if (!analysis || analysis.status !== 'Running' || isPaused) return;

    const timer = setInterval(() => {
      setElapsedSeconds((prev) => prev + 1);

      // Advance stages
      const stages = [...(analysis.stages || [])];
      const runningStageIndex = stages.findIndex((s) => s.status === 'running');

      if (runningStageIndex !== -1) {
        const currentStage = { ...stages[runningStageIndex] };
        
        // Advance stage progress
        if (currentStage.progress < 100) {
          const stepIncrement = currentStage.id === 'alignment' ? 8 : 15;
          currentStage.progress = Math.min(100, currentStage.progress + stepIncrement);
          
          // Add occasional log
          const newLogs = [...analysis.logs];
          if (currentStage.progress === 50) {
            newLogs.push({
              timestamp: new Date().toLocaleTimeString(),
              stageId: currentStage.id,
              message: `[${currentStage.tool}] Task 50% milestone processed successfully`,
              level: 'info'
            });
          }

          stages[runningStageIndex] = currentStage;
          onUpdateAnalysis({
            ...analysis,
            stages,
            logs: newLogs
          });
        } else {
          // Current stage is 100%, complete it and move to next
          currentStage.status = 'completed';
          currentStage.endTime = new Date().toLocaleTimeString();
          stages[runningStageIndex] = currentStage;

          const nextIndex = runningStageIndex + 1;
          const newLogs = [...analysis.logs];
          newLogs.push({
            timestamp: new Date().toLocaleTimeString(),
            stageId: currentStage.id,
            message: `Stage [${currentStage.name}] completed successfully`,
            level: 'success'
          });

          if (nextIndex < stages.length) {
            const nextStage = { ...stages[nextIndex] };
            nextStage.status = 'running';
            nextStage.progress = 10;
            nextStage.startTime = new Date().toLocaleTimeString();
            stages[nextIndex] = nextStage;

            newLogs.push({
              timestamp: new Date().toLocaleTimeString(),
              stageId: nextStage.id,
              message: `Initiating stage [${nextStage.name}] with ${nextStage.tool}...`,
              level: 'info'
            });

            onUpdateAnalysis({
              ...analysis,
              stages,
              logs: newLogs
            });
          } else {
            // All stages complete!
            try {
              confetti({ particleCount: 50, spread: 60, origin: { y: 0.7 } });
            } catch (e) {}

            newLogs.push({
              timestamp: new Date().toLocaleTimeString(),
              stageId: 'report_generation',
              message: 'Analysis completed successfully! Output VCF, CSV, and summary reports ready.',
              level: 'success'
            });

            onUpdateAnalysis({
              ...analysis,
              status: 'Completed',
              completedAt: new Date().toISOString().replace('T', ' ').substring(0, 19),
              duration: `${Math.floor(elapsedSeconds / 60)}m ${elapsedSeconds % 60}s`,
              stages,
              logs: newLogs,
              variants: analysis.variants.length > 0 ? analysis.variants : sampleVariantsDataset1
            });
          }
        }
      } else {
        // No stage running, start first pending
        const firstPendingIndex = stages.findIndex((s) => s.status === 'pending');
        if (firstPendingIndex !== -1) {
          stages[firstPendingIndex].status = 'running';
          stages[firstPendingIndex].progress = 10;
          stages[firstPendingIndex].startTime = new Date().toLocaleTimeString();
          onUpdateAnalysis({ ...analysis, stages });
        }
      }
    }, 1400);

    return () => clearInterval(timer);
  }, [analysis, isPaused, elapsedSeconds, onUpdateAnalysis]);

  // Pause / Resume
  const handleTogglePause = () => {
    const nextPaused = !isPaused;
    setIsPaused(nextPaused);
    onUpdateAnalysis({
      ...analysis,
      status: nextPaused ? 'Paused' : 'Running',
      logs: [
        ...analysis.logs,
        {
          timestamp: new Date().toLocaleTimeString(),
          message: nextPaused ? 'Pipeline execution paused by user' : 'Pipeline execution resumed',
          level: 'warn'
        }
      ]
    });
  };

  // Fast-forward / complete all stages immediately
  const handleInstantComplete = () => {
    const completedStages = analysis.stages.map((st) => ({
      ...st,
      status: 'completed' as const,
      progress: 100,
      endTime: new Date().toLocaleTimeString()
    }));

    try {
      confetti({ particleCount: 80, spread: 70, origin: { y: 0.6 } });
    } catch (e) {}

    const newLogs = [
      ...analysis.logs,
      {
        timestamp: new Date().toLocaleTimeString(),
        stageId: 'report_generation' as const,
        message: 'Pipeline fast-forward simulation executed. All stages finalized.',
        level: 'success' as const
      },
      {
        timestamp: new Date().toLocaleTimeString(),
        stageId: 'report_generation' as const,
        message: '4,185 high-confidence variants classified with Ensembl VEP & ClinVar.',
        level: 'success' as const
      }
    ];

    onUpdateAnalysis({
      ...analysis,
      status: 'Completed',
      completedAt: new Date().toISOString().replace('T', ' ').substring(0, 19),
      duration: '38m 12s',
      stages: completedStages,
      logs: newLogs,
      variants: analysis.variants.length > 0 ? analysis.variants : sampleVariantsDataset1
    });
  };

  // Cancel Analysis
  const handleCancel = () => {
    onUpdateAnalysis({
      ...analysis,
      status: 'Cancelled',
      logs: [
        ...analysis.logs,
        {
          timestamp: new Date().toLocaleTimeString(),
          message: 'Analysis terminated by operator. Compute resources released.',
          level: 'error'
        }
      ]
    });
  };

  if (!analysis) {
    return (
      <div className="bg-white border border-slate-200 rounded-xl p-12 text-center space-y-4">
        <Activity size={36} className="mx-auto text-slate-400 animate-pulse" />
        <h2 className="text-lg font-bold text-slate-800">No Active Analysis Selected</h2>
        <p className="text-sm text-slate-500 max-w-md mx-auto">
          Please select an analysis from the dashboard or initiate a new pipeline run.
        </p>
      </div>
    );
  }

  // Calculate overall progress percentage
  const safeStages = analysis.stages || [];
  const totalStages = safeStages.length || 1;
  const completedStagesCount = safeStages.filter((s) => s.status === 'completed').length;
  const runningStage = safeStages.find((s) => s.status === 'running');
  const overallProgress = Math.min(100, Math.round(
    (completedStagesCount / totalStages) * 100 +
    (runningStage ? (runningStage.progress / totalStages) : 0)
  ));

  return (
    <div className="space-y-6">
      {/* Top Header Card */}
      <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <span className="text-xs font-bold uppercase tracking-wider text-teal-700 bg-teal-50 px-2.5 py-0.5 rounded-full border border-teal-200">
                UC-06 Monitoring Status dan Log
              </span>
              <span className="text-xs text-slate-400">•</span>
              <span className="text-xs font-mono text-slate-500">Node: worker-04.hpc</span>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <h1 className="text-2xl font-extrabold text-slate-900 font-mono tracking-tight">
                {analysis.id}
              </h1>
              <span className="text-sm font-semibold text-slate-600">
                Sample: <strong className="text-slate-900 font-mono">{analysis.sampleId}</strong>
              </span>
              <StatusBadge status={analysis.status} size="lg" />
            </div>

            <p className="text-xs text-slate-500 mt-1">
              Project: <span className="font-semibold text-slate-700">{analysis.projectName}</span> • Reference:{' '}
              <span className="font-mono text-slate-700">{analysis.referenceGenome}</span> • Annotation:{' '}
              <span className="text-slate-700">{analysis.annotationDb}</span>
            </p>
          </div>

          {/* Monitoring Controls */}
          <div className="flex items-center flex-wrap gap-2">
            {analysis.status === 'Running' || analysis.status === 'Paused' ? (
              <>
                <button
                  onClick={handleTogglePause}
                  className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold rounded-lg transition flex items-center gap-1.5 cursor-pointer"
                >
                  {isPaused ? <Play size={15} /> : <Pause size={15} />}
                  <span>{isPaused ? 'Resume' : 'Pause'}</span>
                </button>

                <button
                  onClick={handleInstantComplete}
                  className="px-3.5 py-2 bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold rounded-lg transition flex items-center gap-1.5 cursor-pointer shadow-xs"
                  title="Simulate all stages finishing immediately to view full results"
                >
                  <FastForward size={15} />
                  <span>Fast-Forward Run</span>
                </button>

                <button
                  onClick={handleCancel}
                  className="px-3.5 py-2 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 text-xs font-bold rounded-lg transition flex items-center gap-1.5 cursor-pointer"
                >
                  <XCircle size={15} />
                  <span>Cancel</span>
                </button>
              </>
            ) : analysis.status === 'Completed' ? (
              <button
                onClick={() => onNavigateToResults(analysis.id)}
                className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-extrabold rounded-lg transition flex items-center gap-2 shadow-md cursor-pointer"
              >
                <span>View Final Results & VCF</span>
                <ArrowRight size={16} />
              </button>
            ) : null}
          </div>
        </div>

        {/* Global Progress Bar */}
        <div className="mt-5 pt-4 border-t border-slate-100">
          <div className="flex items-center justify-between text-xs mb-1.5">
            <span className="font-semibold text-slate-700 flex items-center gap-2">
              <Cpu size={14} className="text-teal-600" />
              Overall Pipeline Completion
            </span>
            <span className="font-mono font-bold text-slate-900">{overallProgress}%</span>
          </div>
          <div className="w-full bg-slate-100 rounded-full h-3 overflow-hidden border border-slate-200/80">
            <div
              className="bg-gradient-to-r from-teal-500 to-emerald-500 h-full transition-all duration-500"
              style={{ width: `${overallProgress}%` }}
            />
          </div>
        </div>
      </div>

      {/* Main Grid: Vertical Pipeline Stages (Left) & Real-time Process Log (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Vertical Pipeline (5 Cols) */}
        <div className="lg:col-span-5 bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div className="flex items-center gap-2">
              <Layers size={16} className="text-teal-600" />
              <h3 className="text-sm font-bold text-slate-900">Pipeline Stages</h3>
            </div>
            <span className="text-[11px] font-mono text-slate-500">
              {completedStagesCount}/{totalStages} Complete
            </span>
          </div>

          <div className="space-y-3">
            {analysis.stages.map((stage, idx) => {
              const isCompleted = stage.status === 'completed';
              const isRunning = stage.status === 'running';
              const isSelected = selectedStageId === stage.id;

              return (
                <div
                  key={stage.id}
                  onClick={() => setSelectedStageId(stage.id)}
                  className={`p-3.5 rounded-xl border transition cursor-pointer ${
                    isRunning
                      ? 'bg-blue-50/70 border-blue-300 ring-2 ring-blue-100 shadow-xs'
                      : isCompleted
                      ? 'bg-emerald-50/40 border-emerald-200'
                      : 'bg-slate-50/50 border-slate-200 opacity-75'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <div className="flex items-center gap-2.5">
                      <div
                        className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                          isCompleted
                            ? 'bg-emerald-600 text-white'
                            : isRunning
                            ? 'bg-blue-600 text-white animate-pulse'
                            : 'bg-slate-200 text-slate-500'
                        }`}
                      >
                        {isCompleted ? <Check size={14} /> : idx + 1}
                      </div>
                      <div>
                        <span className="text-xs font-bold text-slate-900 block leading-tight">
                          {stage.name}
                        </span>
                        <span className="text-[10px] font-mono text-slate-500">
                          {stage.tool}
                        </span>
                      </div>
                    </div>

                    <StatusBadge status={stage.status} size="sm" />
                  </div>

                  {/* Stage Progress */}
                  <div className="mt-2">
                    <div className="flex justify-between text-[10px] text-slate-500 mb-1 font-mono">
                      <span>{stage.description}</span>
                      <span className="font-bold">{stage.progress}%</span>
                    </div>
                    <div className="w-full bg-slate-200 rounded-full h-1.5 overflow-hidden">
                      <div
                        className={`h-full transition-all duration-300 ${
                          isCompleted
                            ? 'bg-emerald-500'
                            : isRunning
                            ? 'bg-blue-600'
                            : 'bg-slate-300'
                        }`}
                        style={{ width: `${stage.progress}%` }}
                      />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Column: Real-Time Process Logs Console (7 Cols) */}
        <div className="lg:col-span-7 bg-slate-950 border border-slate-800 rounded-xl overflow-hidden shadow-xl flex flex-col h-[640px]">
          {/* Console Header */}
          <div className="bg-slate-900 px-4 py-3 border-b border-slate-800 flex items-center justify-between text-xs text-slate-300 font-mono">
            <div className="flex items-center gap-2">
              <Terminal size={15} className="text-teal-400" />
              <span className="font-bold text-white">Process Log Console</span>
              <span className="text-slate-500">|</span>
              <span className="text-teal-400 font-bold">{analysis.pipelineVersion}</span>
            </div>
            <div className="flex items-center gap-2">
              {analysis.status === 'Running' && (
                <span className="inline-flex items-center gap-1.5 text-[10px] text-emerald-400 bg-emerald-950/60 px-2 py-0.5 rounded-full border border-emerald-500/40">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                  Streaming Stdout
                </span>
              )}
            </div>
          </div>

          {/* Console Body */}
          <div className="flex-1 p-4 font-mono text-[11px] leading-relaxed overflow-y-auto space-y-2 text-slate-300 bg-slate-950/95 selection:bg-teal-500/30">
            <div className="text-slate-500 pb-2 border-b border-slate-800/80">
              # MutaTrack GATK Workflow Engine v1.4.0 (Bioinformatics Daemon)
              <br />
              # Reference Genome: {analysis.referenceGenome} | Annotation DB: {analysis.annotationDb}
              <br />
              # Working Dir: /mnt/storage/runs/{analysis.id}
            </div>

            {analysis.logs.map((log, index) => {
              let colorClass = 'text-slate-300';
              let badgeBg = 'bg-slate-800 text-slate-400';

              if (log.level === 'success') {
                colorClass = 'text-emerald-400';
                badgeBg = 'bg-emerald-950 text-emerald-300 border border-emerald-800';
              } else if (log.level === 'warn') {
                colorClass = 'text-amber-400';
                badgeBg = 'bg-amber-950 text-amber-300 border border-amber-800';
              } else if (log.level === 'error') {
                colorClass = 'text-rose-400';
                badgeBg = 'bg-rose-950 text-rose-300 border border-rose-800';
              }

              return (
                <div key={index} className="flex items-start gap-2.5 hover:bg-slate-900/60 py-0.5 px-1 rounded transition">
                  <span className="text-slate-500 shrink-0 select-none">
                    [{log.timestamp}]
                  </span>
                  {log.stageId && (
                    <span className="text-[10px] px-1.5 py-0.2 rounded font-mono uppercase shrink-0 bg-slate-800 text-teal-300">
                      {log.stageId}
                    </span>
                  )}
                  <span className={`${colorClass} break-all`}>
                    {log.message}
                  </span>
                </div>
              );
            })}

            {/* Pulsing cursor when active */}
            {analysis.status === 'Running' && (
              <div className="flex items-center gap-2 text-teal-400 pt-2 animate-pulse">
                <span>&gt; Processing genomic alignment blocks...</span>
              </div>
            )}

            <div ref={logEndRef} />
          </div>

          {/* Console Footer */}
          <div className="bg-slate-900 px-4 py-2 border-t border-slate-800 flex items-center justify-between text-[11px] font-mono text-slate-400">
            <div>
              Total Log Entries: <strong className="text-slate-200">{analysis.logs.length}</strong>
            </div>
            <div>
              Status: <span className="text-white font-bold">{analysis.status.toUpperCase()}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
