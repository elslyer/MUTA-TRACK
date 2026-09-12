import React from 'react';
import { CheckCircle2, Clock, PlayCircle, AlertTriangle, XCircle, PauseCircle } from 'lucide-react';
import { AnalysisStatus, StageStatus } from '../types/bioinformatics';

interface StatusBadgeProps {
  status: AnalysisStatus | StageStatus;
  size?: 'sm' | 'md' | 'lg';
  showIcon?: boolean;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({
  status,
  size = 'md',
  showIcon = true
}) => {
  const normStatus = status.toLowerCase();

  const sizeClasses = {
    sm: 'text-xs px-2 py-0.5',
    md: 'text-xs px-2.5 py-1',
    lg: 'text-sm px-3 py-1.5'
  };

  const iconSizes = {
    sm: 12,
    md: 14,
    lg: 16
  };

  if (normStatus === 'completed') {
    return (
      <span className={`inline-flex items-center gap-1.5 font-medium rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 ${sizeClasses[size]}`}>
        {showIcon && <CheckCircle2 size={iconSizes[size]} className="text-emerald-600" />}
        <span>Completed</span>
      </span>
    );
  }

  if (normStatus === 'running') {
    return (
      <span className={`inline-flex items-center gap-1.5 font-medium rounded-full bg-blue-50 text-blue-700 border border-blue-200 ${sizeClasses[size]}`}>
        {showIcon && (
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-600"></span>
          </span>
        )}
        <span>Running</span>
      </span>
    );
  }

  if (normStatus === 'pending') {
    return (
      <span className={`inline-flex items-center gap-1.5 font-medium rounded-full bg-slate-100 text-slate-600 border border-slate-200 ${sizeClasses[size]}`}>
        {showIcon && <Clock size={iconSizes[size]} className="text-slate-400" />}
        <span>Pending</span>
      </span>
    );
  }

  if (normStatus === 'validating') {
    return (
      <span className={`inline-flex items-center gap-1.5 font-medium rounded-full bg-amber-50 text-amber-700 border border-amber-200 ${sizeClasses[size]}`}>
        {showIcon && <PlayCircle size={iconSizes[size]} className="text-amber-500 animate-spin" />}
        <span>Validating</span>
      </span>
    );
  }

  if (normStatus === 'paused') {
    return (
      <span className={`inline-flex items-center gap-1.5 font-medium rounded-full bg-amber-50 text-amber-700 border border-amber-200 ${sizeClasses[size]}`}>
        {showIcon && <PauseCircle size={iconSizes[size]} className="text-amber-600" />}
        <span>Paused</span>
      </span>
    );
  }

  if (normStatus === 'failed' || normStatus === 'cancelled') {
    return (
      <span className={`inline-flex items-center gap-1.5 font-medium rounded-full bg-rose-50 text-rose-700 border border-rose-200 ${sizeClasses[size]}`}>
        {showIcon && <XCircle size={iconSizes[size]} className="text-rose-600" />}
        <span>{status}</span>
      </span>
    );
  }

  return (
    <span className={`inline-flex items-center gap-1.5 font-medium rounded-full bg-slate-100 text-slate-700 border border-slate-200 ${sizeClasses[size]}`}>
      {showIcon && <AlertTriangle size={iconSizes[size]} className="text-slate-500" />}
      <span>{status}</span>
    </span>
  );
};
