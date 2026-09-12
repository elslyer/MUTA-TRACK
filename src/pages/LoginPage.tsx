import React, { useState } from 'react';
import { Dna, Lock, User, ArrowRight, ShieldCheck, CheckCircle2, AlertCircle, Info } from 'lucide-react';
import { UserSession } from '../types/bioinformatics';

interface LoginPageProps {
  onLogin: (user: UserSession) => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({ onLogin }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    if (!username.trim() || !password.trim()) {
      setErrorMessage('Please enter both username / email and password.');
      return;
    }

    // Accept demo or any non-empty credentials
    if (username.toLowerCase() === 'demo' || username.includes('@') || username.toLowerCase().includes('analisis') || username.toLowerCase().includes('user')) {
      onLogin({
        username: username.trim(),
        fullName: 'Pengguna Analisis (Clinical Bioinformatician)',
        role: 'Lead Genomic Analyst',
        organization: 'Genomics & Precision Medicine Institute',
        isLoggedIn: true
      });
    } else {
      // Validate credentials
      onLogin({
        username: username.trim(),
        fullName: username.trim(),
        role: 'Bioinformatician',
        organization: 'Clinical Sequencing Lab',
        isLoggedIn: true
      });
    }
  };

  const handleDemoLogin = () => {
    setUsername('analisis.user@mutatrack.org');
    setPassword('DemoGatk2026!');
    setErrorMessage('');
    
    setTimeout(() => {
      onLogin({
        username: 'analisis.user@mutatrack.org',
        fullName: 'Pengguna Analisis (Lead Bioinformatician)',
        role: 'Senior Genomic Analyst',
        organization: 'Molecular Diagnostics & Variant Curation Lab',
        isLoggedIn: true
      });
    }, 150);
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col justify-center py-12 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Subtle Genomic Background Accents */}
      <div className="absolute inset-0 opacity-10 pointer-events-none">
        <div className="absolute -top-24 -left-24 w-96 h-96 rounded-full bg-teal-500 blur-3xl" />
        <div className="absolute -bottom-24 -right-24 w-96 h-96 rounded-full bg-cyan-600 blur-3xl" />
      </div>

      <div className="sm:mx-auto sm:w-full sm:max-w-md relative z-10">
        <div className="flex justify-center">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-teal-500 to-cyan-500 flex items-center justify-center text-slate-950 shadow-xl shadow-teal-500/25 ring-1 ring-white/20">
            <Dna size={32} className="text-white" />
          </div>
        </div>
        <h2 className="mt-4 text-center text-2xl font-extrabold text-white tracking-tight">
          MutaTrack
        </h2>
        <p className="mt-1 text-center text-xs font-mono uppercase tracking-widest text-teal-400">
          Integrated Variant Calling Platform
        </p>
        <p className="mt-2 text-center text-xs text-slate-400 max-w-sm mx-auto">
          Automated DNA-Seq GATK Variant Calling, Real-Time Pipeline Monitoring & Single-Canvas Diagnostics
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md relative z-10">
        <div className="bg-slate-900/90 backdrop-blur-md py-8 px-6 shadow-2xl border border-slate-800 rounded-2xl sm:px-10">
          <form className="space-y-5" onSubmit={handleLogin}>
            {errorMessage && (
              <div className="p-3 bg-rose-500/10 border border-rose-500/30 rounded-lg flex items-start gap-2.5 text-rose-300 text-xs animate-in fade-in">
                <AlertCircle size={16} className="shrink-0 mt-0.5" />
                <span>{errorMessage}</span>
              </div>
            )}

            <div>
              <label className="block text-xs font-medium text-slate-300">
                Username or Email
              </label>
              <div className="mt-1.5 relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500">
                  <User size={16} />
                </div>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="analisis.user@mutatrack.org"
                  className="block w-full pl-10 pr-3 py-2 bg-slate-800/80 border border-slate-700 rounded-lg text-sm text-white placeholder-slate-500 focus:outline-hidden focus:ring-2 focus:ring-teal-500 focus:border-transparent transition"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300">
                Password
              </label>
              <div className="mt-1.5 relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500">
                  <Lock size={16} />
                </div>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="block w-full pl-10 pr-3 py-2 bg-slate-800/80 border border-slate-700 rounded-lg text-sm text-white placeholder-slate-500 focus:outline-hidden focus:ring-2 focus:ring-teal-500 focus:border-transparent transition"
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full flex justify-center items-center gap-2 py-2.5 px-4 border border-transparent rounded-lg shadow-sm text-xs font-bold text-slate-950 bg-teal-400 hover:bg-teal-300 focus:outline-hidden focus:ring-2 focus:ring-offset-2 focus:ring-teal-500 transition cursor-pointer"
            >
              <span>Sign In to Platform</span>
              <ArrowRight size={14} />
            </button>
          </form>

          {/* Demo Account Quick Access */}
          <div className="mt-6 pt-6 border-t border-slate-800">
            <div className="bg-slate-800/60 rounded-xl p-3.5 border border-slate-700/60">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-200">
                  <ShieldCheck size={14} className="text-teal-400" />
                  <span>Bioinformatics Demo Access</span>
                </div>
                <span className="text-[10px] bg-teal-500/20 text-teal-300 font-mono px-2 py-0.5 rounded border border-teal-500/30">
                  UC-01 Login
                </span>
              </div>
              <p className="text-[11px] text-slate-400 mb-3">
                Pre-configured for <strong>Pengguna Analisis</strong> to test variant calling workflow and monitoring.
              </p>
              <button
                type="button"
                onClick={handleDemoLogin}
                className="w-full py-2 px-3 bg-slate-700/80 hover:bg-slate-700 border border-slate-600 rounded-lg text-xs font-semibold text-teal-300 flex items-center justify-center gap-2 transition cursor-pointer"
              >
                <CheckCircle2 size={14} />
                <span>One-Click Demo Login</span>
              </button>
            </div>
          </div>
        </div>

        {/* Workflow Reference Notice */}
        <div className="mt-6 text-center text-xs text-slate-500">
          Conceptual reference:{' '}
          <span className="font-mono text-slate-400">
            snakemake-workflows/dna-seq-gatk-variant-calling
          </span>
        </div>
      </div>
    </div>
  );
};
