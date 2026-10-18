import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Sidebar from './components/layout/Sidebar';
import TopHeader from './components/layout/TopHeader';
import AboutModal from './components/layout/AboutModal';
import Overview from './pages/Overview';
import Analyze from './pages/Analyze';
import Result from './pages/Result';
import Methodology from './pages/Methodology';
import { getHealth } from './services/api';

export default function App() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [aboutOpen, setAboutOpen] = useState(false);
  const [health, setHealth] = useState({ status: 'checking', matlab: { available: false } });

  useEffect(() => {
    let isMounted = true;
    const fetchStatus = () => {
      getHealth()
        .then((res) => {
          if (isMounted) setHealth(res);
        })
        .catch(() => {
          if (isMounted) setHealth({ status: 'offline', matlab: { available: false }, offline: true });
        });
    };

    fetchStatus();
    const interval = setInterval(fetchStatus, 15000);
    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, []);

  return (
    <BrowserRouter>
      <div className="min-h-screen bg-[#111116] text-[#F5F5FA] font-sans flex flex-col selection:bg-[#A100FF]/30 selection:text-[#22D3EE]">
        {/* Left Sidebar */}
        <Sidebar
          isOpen={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
          onOpenAbout={() => setAboutOpen(true)}
          health={health}
        />

        {/* Main Content Area (offset by sidebar on desktop) */}
        <div className="lg:pl-64 flex flex-col flex-1 min-w-0">
          {/* Top Header */}
          <TopHeader
            onToggleSidebar={() => setSidebarOpen(!sidebarOpen)}
            health={health}
          />

          {/* Main Workspace View */}
          <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
            <Routes>
              <Route path="/" element={<Overview />} />
              <Route path="/records" element={<Overview />} />
              <Route path="/analyze" element={<Analyze />} />
              <Route path="/analyses/:id" element={<Result />} />
              <Route path="/methodology" element={<Methodology />} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </main>

          {/* Dark Industrial Footer */}
          <footer className="border-t border-[#353540] bg-[#191920] py-5 mt-10">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row justify-between items-center text-xs font-mono text-[#A5A5B5] gap-3">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-[#A100FF]"></span>
                <span>DSP Bearing Condition Monitoring &bull; Offline Vibration Analysis</span>
              </div>
              <div className="flex items-center gap-4 text-[#6E6E82]">
                <span>CWRU Benchmark Dataset (SKF 6205)</span>
                <span>&bull;</span>
                <span>Deterministic Envelope DSP</span>
              </div>
            </div>
          </footer>
        </div>

        {/* About Dialog Modal */}
        <AboutModal
          isOpen={aboutOpen}
          onClose={() => setAboutOpen(false)}
        />
      </div>
    </BrowserRouter>
  );
}