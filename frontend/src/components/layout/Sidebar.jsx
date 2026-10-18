import React from 'react';
import { NavLink } from 'react-router-dom';

export default function Sidebar({ isOpen, onClose, onOpenAbout, health = {} }) {
  const isOffline = Boolean(health.offline);
  const matlabAvailable = health.matlab && health.matlab.available;

  const navItems = [
    {
      to: '/',
      label: 'Overview',
      icon: (
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
        </svg>
      ),
      badge: '4'
    },
    {
      to: '/analyze',
      label: 'Analyze Signal',
      icon: (
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
        </svg>
      ),
      badge: isOffline ? 'Offline' : 'Upload'
    },
    {
      to: '/records',
      label: 'Reference Records',
      icon: (
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
        </svg>
      ),
      badge: 'CWRU'
    },
    {
      to: '/methodology',
      label: 'Methodology',
      icon: (
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
        </svg>
      ),
      badge: 'DSP'
    }
  ];

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div 
          onClick={onClose}
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden"
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-40 w-64 bg-[#191920] border-r border-[#353540] flex flex-col transition-transform duration-300 ease-in-out lg:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Logo and Brand Header */}
        <div className="h-16 px-5 border-b border-[#353540] flex items-center justify-between bg-[#191920]">
          <NavLink to="/" onClick={onClose} className="flex items-center gap-3 group">
            <div className="relative w-9 h-9 rounded-lg bg-gradient-to-tr from-[#A100FF] via-[#E000A8] to-[#22D3EE] p-[1.5px] shadow-[0_0_15px_rgba(161,0,255,0.4)] group-hover:shadow-[0_0_20px_rgba(34,211,238,0.6)] transition-all">
              <div className="w-full h-full bg-[#111116] rounded-[7px] flex items-center justify-center">
                {/* Waveform Pulse Icon */}
                <svg className="w-5 h-5 text-[#22D3EE]" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
            </div>

            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-bold text-sm tracking-wider text-[#F5F5FA] font-sans">
                  VIBRO<span className="text-[#22D3EE]">DSP</span>
                </span>
                <span className="px-1.5 py-0.2 rounded text-[9px] font-mono font-bold bg-[#A100FF]/20 text-[#22D3EE] border border-[#A100FF]/40">
                  PRO
                </span>
              </div>
              <span className="text-[10px] text-[#A5A5B5] font-mono block tracking-tight">
                Bearing Condition Monitor
              </span>
            </div>
          </NavLink>

          <button
            onClick={onClose}
            className="lg:hidden p-1.5 text-[#A5A5B5] hover:text-[#F5F5FA] rounded-md hover:bg-[#202027]"
          >
            ✕
          </button>
        </div>

        {/* Section: Main Navigation */}
        <div className="flex-1 px-3 py-4 space-y-6 overflow-y-auto">
          <div>
            <div className="px-3 mb-2 text-[10px] font-mono uppercase tracking-widest text-[#6E6E82]">
              Analytics Navigation
            </div>
            <nav className="space-y-1">
              {navItems.map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  end={item.to === '/'}
                  onClick={onClose}
                  className={({ isActive }) =>
                    `group flex items-center justify-between px-3 py-2.5 rounded-lg text-xs font-medium transition-all ${
                      isActive
                        ? 'bg-gradient-to-r from-[#A100FF]/25 via-[#E000A8]/15 to-transparent text-[#F5F5FA] border-l-4 border-[#A100FF] shadow-[inset_0_1px_0_rgba(255,255,255,0.06)] font-semibold'
                        : 'text-[#A5A5B5] hover:text-[#F5F5FA] hover:bg-[#202027] border-l-4 border-transparent'
                    }`
                  }
                >
                  {({ isActive }) => (
                    <>
                      <div className="flex items-center gap-2.5">
                        <span className={`transition-colors ${isActive ? 'text-[#22D3EE]' : 'text-[#A5A5B5] group-hover:text-[#22D3EE]'}`}>
                          {item.icon}
                        </span>
                        <span className="font-sans tracking-wide">{item.label}</span>
                      </div>
                      {item.badge && (
                        <span className={`px-1.5 py-0.5 text-[10px] font-mono rounded ${
                          isActive
                            ? 'bg-[#A100FF]/30 text-[#F5F5FA] border border-[#A100FF]/50'
                            : 'bg-[#202027] text-[#6E6E82] border border-[#353540] group-hover:text-[#A5A5B5]'
                        }`}>
                          {item.badge}
                        </span>
                      )}
                    </>
                  )}
                </NavLink>
              ))}
            </nav>
          </div>

          {/* Section: Project Information */}
          <div>
            <div className="px-3 mb-2 text-[10px] font-mono uppercase tracking-widest text-[#6E6E82]">
              System Info
            </div>
            <button
              onClick={() => {
                if (onClose) onClose();
                if (onOpenAbout) onOpenAbout();
              }}
              className="w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-xs font-medium text-[#A5A5B5] hover:text-[#F5F5FA] hover:bg-[#202027] border-l-4 border-transparent transition-all group"
            >
              <div className="flex items-center gap-2.5">
                <svg className="w-4 h-4 text-[#A5A5B5] group-hover:text-[#A100FF] transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span className="font-sans tracking-wide">About System</span>
              </div>
              <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-[#202027] text-[#6E6E82] border border-[#353540]">
                DSP
              </span>
            </button>
          </div>

          {/* CWRU Benchmark Specs Card */}
          <div className="mx-1 p-3 rounded-xl bg-[#202027]/70 border border-[#353540] text-xs font-mono space-y-2">
            <div className="flex items-center justify-between text-[11px] text-[#A5A5B5]">
              <span className="text-[#6E6E82] uppercase text-[10px]">Dataset</span>
              <span className="font-semibold text-[#F5F5FA]">CWRU Benchmark</span>
            </div>
            <div className="flex items-center justify-between text-[11px] text-[#A5A5B5]">
              <span className="text-[#6E6E82] uppercase text-[10px]">Bearing</span>
              <span className="font-semibold text-[#22D3EE]">SKF 6205</span>
            </div>
            <div className="flex items-center justify-between text-[11px] text-[#A5A5B5]">
              <span className="text-[#6E6E82] uppercase text-[10px]">Sampling (fs)</span>
              <span className="font-semibold text-[#F5F5FA]">12,000 Hz</span>
            </div>
            <div className="flex items-center justify-between text-[11px] text-[#A5A5B5]">
              <span className="text-[#6E6E82] uppercase text-[10px]">Bandpass</span>
              <span className="font-semibold text-[#A100FF]">2–5 kHz</span>
            </div>
          </div>
        </div>

        {/* Bottom System Status Widget */}
        <div className="p-3 border-t border-[#353540] bg-[#14141A]">
          <div className="p-2.5 rounded-lg bg-[#202027] border border-[#353540] flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="relative flex h-2 w-2">
                {matlabAvailable ? (
                  <>
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#4ADE80] opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-[#4ADE80]"></span>
                  </>
                ) : isOffline ? (
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-[#FBBF24]"></span>
                ) : (
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-[#A5A5B5]"></span>
                )}
              </span>
              <div className="flex flex-col">
                <span className="text-[11px] font-mono font-semibold text-[#F5F5FA] leading-tight">
                  {matlabAvailable ? 'MATLAB Ready' : isOffline ? 'Offline Stored' : 'Connecting'}
                </span>
                <span className="text-[9px] font-mono text-[#6E6E82]">
                  {isOffline ? 'Bundled CWRU records' : 'Express backend live'}
                </span>
              </div>
            </div>

            <div className="px-1.5 py-0.5 rounded text-[9px] font-mono font-semibold uppercase bg-[#111116] border border-[#353540] text-[#A5A5B5]">
              {isOffline ? 'STATIC' : 'API'}
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}
