import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import NavBar from './components/layout/NavBar';
import Analyze from './pages/Analyze';
import Result from './pages/Result';
import Methodology from './pages/Methodology';

export default function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen flex flex-col bg-zinc-100 text-zinc-900 font-mono">
        <NavBar />
        
        <main className="flex-1">
          <Routes>
            <Route path="/" element={<Analyze />} />
            <Route path="/analyses/:id" element={<Result />} />
            <Route path="/methodology" element={<Methodology />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>

        <footer className="border-t border-zinc-300 bg-white py-4 mt-8">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row justify-between items-center text-xs text-zinc-500 gap-2">
            <div>
              Bearing Condition Monitoring System — Offline DSP Evaluation
            </div>
            <div>
              Case Western Reserve University (CWRU) Benchmark Dataset
            </div>
          </div>
        </footer>
      </div>
    </BrowserRouter>
  );
}