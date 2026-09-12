import React, { useState, useEffect } from 'react';
import { initialAnalyses } from './data/initialAnalyses';
import { Analysis } from './types/bioinformatics';
import { Navbar } from './components/Navbar';
import { Sidebar } from './components/Sidebar';
import { LoginPage } from './pages/LoginPage';
import { DashboardPage } from './pages/DashboardPage';
import { NewAnalysisPage } from './pages/NewAnalysisPage';
import { MonitoringPage } from './pages/MonitoringPage';
import { ResultsPage } from './pages/ResultsPage';
import { SingleCanvasOverview } from './pages/SingleCanvasOverview';
import { HistoryPage } from './pages/HistoryPage';

const LOCAL_STORAGE_KEY = 'mutatrack_analyses_v1';

export function App() {
  // Authentication state
  const [currentUser, setCurrentUser] = useState<{
    name: string;
    role: string;
    email: string;
  } | null>({
    name: 'Dr. Elena Rostova',
    role: 'Lead Bioinformatician',
    email: 'elena.rostova@genomics.lab'
  });

  // Analyses State with LocalStorage persistence
  const [analyses, setAnalyses] = useState<Analysis[]>(() => {
    try {
      const saved = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      }
    } catch (e) {
      console.error('Failed to load analyses from localStorage:', e);
    }
    return initialAnalyses;
  });

  // Persist analyses changes to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(analyses));
    } catch (e) {
      console.error('Failed to persist analyses to localStorage:', e);
    }
  }, [analyses]);

  // Current view and selected analysis
  const [currentPage, setCurrentPage] = useState<string>('dashboard');
  const [currentAnalysisId, setCurrentAnalysisId] = useState<string>('MUT-2026-001');

  // Find active analysis
  const activeAnalysis =
    analyses.find((a) => a.id === currentAnalysisId) || analyses[0] || initialAnalyses[0];

  // Navigation handler
  const handleNavigate = (page: string, analysisId?: string) => {
    if (analysisId) {
      setCurrentAnalysisId(analysisId);
    }
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Start new analysis
  const handleStartAnalysis = (newAnalysis: Analysis) => {
    setAnalyses((prev) => [newAnalysis, ...prev]);
    setCurrentAnalysisId(newAnalysis.id);
    setCurrentPage('monitoring');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Update existing analysis (e.g. from monitoring simulator)
  const handleUpdateAnalysis = (updated: Analysis) => {
    setAnalyses((prev) =>
      prev.map((item) => (item.id === updated.id ? updated : item))
    );
  };

  // Delete analysis
  const handleDeleteAnalysis = (analysisId: string) => {
    setAnalyses((prev) => prev.filter((a) => a.id !== analysisId));
    if (currentAnalysisId === analysisId) {
      const remaining = analyses.filter((a) => a.id !== analysisId);
      if (remaining.length > 0) {
        setCurrentAnalysisId(remaining[0].id);
      }
    }
  };

  // Reset demo data handler
  const handleResetDemoData = () => {
    setAnalyses(initialAnalyses);
    setCurrentAnalysisId(initialAnalyses[0]?.id || 'MUT-2026-001');
    try {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(initialAnalyses));
    } catch (e) {
      console.error('Failed to reset demo data:', e);
    }
  };

  // If logged out, show Login page
  if (!currentUser) {
    return (
      <LoginPage
        onLoginSuccess={(user) => {
          setCurrentUser(user);
          setCurrentPage('dashboard');
        }}
      />
    );
  }

  const runningAnalysis = analyses.find((a) => a.status === 'Running');
  const completedAnalysesCount = analyses.filter((a) => a.status === 'Completed').length;

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col antialiased">
      {/* Top Navigation */}
      <Navbar
        currentPage={currentPage}
        onNavigate={handleNavigate}
        currentUser={currentUser}
        analyses={analyses}
        onResetDemoData={handleResetDemoData}
        onLogout={() => setCurrentUser(null)}
      />

      {/* Main Body with Sidebar + Content */}
      <div className="flex-1 flex w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 gap-6">
        {/* Left Nav Sidebar */}
        <Sidebar
          currentPage={currentPage}
          onNavigate={handleNavigate}
          onLogout={() => setCurrentUser(null)}
          runningAnalysis={runningAnalysis}
          completedAnalysesCount={completedAnalysesCount}
          analysesCount={analyses.length}
          activeAnalysisId={currentAnalysisId}
        />

        {/* Dynamic Content View Container */}
        <main className="flex-1 min-w-0">
          {currentPage === 'dashboard' && (
            <DashboardPage
              analyses={analyses}
              onNavigate={handleNavigate}
            />
          )}

          {currentPage === 'new-analysis' && (
            <NewAnalysisPage
              existingAnalyses={analyses}
              onStartAnalysis={handleStartAnalysis}
            />
          )}

          {currentPage === 'monitoring' && (
            <MonitoringPage
              analysis={activeAnalysis}
              onUpdateAnalysis={handleUpdateAnalysis}
              onNavigateToResults={(id) => handleNavigate('results', id)}
            />
          )}

          {currentPage === 'single-canvas' && (
            <SingleCanvasOverview
              analysis={activeAnalysis}
              onNavigateToResults={(id) => handleNavigate('results', id)}
              onSelectAnalysis={(id) => setCurrentAnalysisId(id)}
              allAnalyses={analyses}
            />
          )}

          {currentPage === 'results' && (
            <ResultsPage
              analysis={activeAnalysis}
              onNavigateToSingleCanvas={(id) => handleNavigate('single-canvas', id)}
              onSelectAnalysis={(id) => setCurrentAnalysisId(id)}
              allAnalyses={analyses}
            />
          )}

          {currentPage === 'history' && (
            <HistoryPage
              analyses={analyses}
              onNavigate={handleNavigate}
              onDeleteAnalysis={handleDeleteAnalysis}
            />
          )}
        </main>
      </div>

      {/* Standard Bioinformatic Platform Footer */}
      <footer className="border-t border-slate-200 bg-white py-4 mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-2 font-mono">
          <div className="flex items-center gap-2">
            <span className="font-bold text-slate-700 font-sans">MutaTrack v1.4.0</span>
            <span>•</span>
            <span>Integrated GATK4 DNA-Seq Variant Calling Platform</span>
          </div>
          <div>
            Built with FastQC • BWA-MEM • SAMtools • GATK HaplotypeCaller • Ensembl VEP
          </div>
        </div>
      </footer>
    </div>
  );
}
export default App;
