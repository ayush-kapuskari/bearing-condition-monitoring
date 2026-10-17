import React from 'react';
import { NavLink } from 'react-router-dom';

export default function NavBar() {
  return (
    <header className="border-b border-zinc-300 bg-white sticky top-0 z-30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-14">
          <div className="flex items-center space-x-3">
            <div className="w-3 h-3 bg-zinc-800 rounded-none border border-zinc-600" />
            <div>
              <span className="font-mono font-bold text-sm sm:text-base tracking-tight text-zinc-900 uppercase">
                Bearing Condition Monitoring
              </span>
              <span className="ml-2 text-xs font-mono text-zinc-500 hidden sm:inline-block border-l border-zinc-300 pl-2">
                Offline DSP Analysis
              </span>
            </div>
          </div>

          <nav className="flex space-x-1 sm:space-x-2">
            <NavLink
              to="/"
              className={({ isActive }) =>
                `px-3 py-1.5 text-xs font-mono font-medium border transition-colors ${
                  isActive
                    ? 'border-zinc-800 bg-zinc-900 text-white'
                    : 'border-zinc-300 bg-zinc-50 text-zinc-700 hover:bg-zinc-100 hover:border-zinc-400'
                }`
              }
            >
              Analyze
            </NavLink>
            <NavLink
              to="/methodology"
              className={({ isActive }) =>
                `px-3 py-1.5 text-xs font-mono font-medium border transition-colors ${
                  isActive
                    ? 'border-zinc-800 bg-zinc-900 text-white'
                    : 'border-zinc-300 bg-zinc-50 text-zinc-700 hover:bg-zinc-100 hover:border-zinc-400'
                }`
              }
            >
              Methodology
            </NavLink>
          </nav>
        </div>
      </div>
    </header>
  );
}
