import React, { useState, useEffect } from 'react';
import { NavLink } from 'react-router-dom';
import { getHealth } from '../../services/api';

export default function NavBar() {
  const [health, setHealth] = useState({ status: 'checking', matlab: { available: false } });

  useEffect(() => {
    let isMounted = true;
    const fetchStatus = () => {
      getHealth().then((res) => {
        if (isMounted) setHealth(res);
      }).catch(() => {
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

  const getMatlabStatusBadge = () => {
    if (health.offline) {
      return (
        <span className="inline-flex items-center gap-1.5 px-2 py-0.5 text-[11px] font-mono border border-zinc-300 bg-zinc-100 text-zinc-600">
          <span className="w-1.5 h-1.5 bg-zinc-400 rounded-none inline-block" />
          <span>MATLAB: backend offline</span>
        </span>
      );
    }
    if (health.matlab && health.matlab.available) {
      return (
        <span className="inline-flex items-center gap-1.5 px-2 py-0.5 text-[11px] font-mono border border-emerald-300 bg-emerald-50 text-emerald-800">
          <span className="w-1.5 h-1.5 bg-emerald-600 rounded-none inline-block" />
          <span>MATLAB: ready</span>
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1.5 px-2 py-0.5 text-[11px] font-mono border border-amber-300 bg-amber-50 text-amber-800">
        <span className="w-1.5 h-1.5 bg-amber-500 rounded-none inline-block" />
        <span>MATLAB: unavailable</span>
      </span>
    );
  };

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

          <div className="flex items-center space-x-2 sm:space-x-4">
            {getMatlabStatusBadge()}

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
      </div>
    </header>
  );
}
