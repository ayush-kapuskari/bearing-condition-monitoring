import React from 'react';
import { useLocation, Link } from 'react-router-dom';

export default function TopHeader({ onToggleSidebar, health = {} }) {
  const location = useLocation();
  const isOffline = Boolean(health.offline);
  const matlabAvailable = health.matlab && health.matlab.available;

  // Determine current page breadcrumb and title
  const getPageInfo = () => {
    const path = location.pathname;
    if (path === '/') {
      return {
        section: 'Dashboard',
        title: 'System Overview & Reference Records',
        desc: 'Case Western Reserve University (CWRU) benchmark vibration dataset'
      };
    }
    if (path.startsWith('/analyses/')) {
      const id = path.replace('/analyses/', '');
      return {
        section: 'Scientific Workspace',
        title: `Vibration Signal Analysis — Record #${id}`,
        desc: 'Demodulated envelope spectrum, kinematic peak matching & DSP evidence'
      };
    }
    if (path === '/analyze') {
      return {
        section: 'Live Processing',
        title: 'Analyze Vibration Signal (.mat)',
        desc: 'Upload custom CWRU MAT-file or run background MATLAB DSP batch evaluation'
      };
    }
    if (path === '/records') {
      return {
        section: 'Benchmark Archive',
        title: 'CWRU Reference Records Catalog',
        desc: 'Pre-computed healthy and faulty bearing baseline evaluations'
      };
    }
    if (path === '/methodology') {
      return {
        section: 'Theory & Kinematics',
        title: 'DSP Signal Processing Methodology',
        desc: 'Mechanical kinematics, resonance bandpass filtering & envelope demodulation'
      };
    }
    return {
      section: 'Condition Monitor',
      title: 'Bearing Condition Monitoring',
      desc: 'Offline digital signal processing evaluation'
    };
  };

  const pageInfo = getPageInfo();

  return (
    <header className="sticky top-0 z-30 h-16 bg-[#191920]/90 backdrop-blur-md border-b border-[#353540] px-4 sm:px-6 flex items-center justify-between">
      {/* Left: Mobile hamburger & breadcrumbs */}
      <div className="flex items-center gap-3">
        <button
          onClick={onToggleSidebar}
          className="lg:hidden p-2 rounded-lg bg-[#202027] border border-[#353540] text-[#A5A5B5] hover:text-[#F5F5FA] hover:border-[#A100FF]"
          aria-label="Open sidebar navigation"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>

        <div className="flex flex-col">
          <div className="flex items-center gap-2 text-xs font-mono">
            <span className="text-[#6E6E82] uppercase tracking-wider">{pageInfo.section}</span>
            <span className="text-[#353540]">/</span>
            <span className="text-[#22D3EE] font-semibold">{pageInfo.title.split('—')[0]}</span>
          </div>
          <span className="text-[11px] text-[#A5A5B5] font-sans hidden sm:block truncate max-w-md">
            {pageInfo.desc}
          </span>
        </div>
      </div>

      {/* Right: Accurate System Status Pill & Action */}
      <div className="flex items-center gap-3">
        {/* MATLAB Status Badge */}
        {isOffline ? (
          <div className="hidden xs:flex items-center gap-2 px-2.5 py-1 rounded-full bg-[#202027] border border-[#353540] text-xs font-mono text-[#A5A5B5]">
            <span className="w-2 h-2 rounded-full bg-[#FBBF24]"></span>
            <span className="text-[11px]">MATLAB: <span className="text-[#FBBF24]">backend offline</span></span>
          </div>
        ) : matlabAvailable ? (
          <div className="hidden xs:flex items-center gap-2 px-2.5 py-1 rounded-full bg-[#202027] border border-[#4ADE80]/30 text-xs font-mono text-[#4ADE80] shadow-[0_0_10px_rgba(74,222,128,0.2)]">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#4ADE80] opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-[#4ADE80]"></span>
            </span>
            <span className="text-[11px]">MATLAB: <span className="font-bold">ready</span></span>
          </div>
        ) : (
          <div className="hidden xs:flex items-center gap-2 px-2.5 py-1 rounded-full bg-[#202027] border border-[#FBBF24]/30 text-xs font-mono text-[#FBBF24]">
            <span className="w-2 h-2 rounded-full bg-[#FBBF24]"></span>
            <span className="text-[11px]">MATLAB: <span>unavailable</span></span>
          </div>
        )}

        {/* Quick Action Button */}
        {location.pathname !== '/analyze' && (
          <Link
            to="/analyze"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-mono font-medium text-white bg-gradient-to-r from-[#A100FF] to-[#E000A8] hover:from-[#8e00e0] hover:to-[#c70094] border border-[#A100FF] shadow-[0_0_15px_rgba(161,0,255,0.35)] transition-all"
          >
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            <span className="hidden sm:inline">Analyze File</span>
            <span className="sm:hidden">Analyze</span>
          </Link>
        )}
      </div>
    </header>
  );
}
