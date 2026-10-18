import React from 'react';

export default function AboutModal({ isOpen, onClose }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
      <div 
        className="relative w-full max-w-2xl bg-[#191920] border border-[#353540] rounded-xl shadow-[0_0_35px_rgba(161,0,255,0.2)] overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header with Neon Accent */}
        <div className="px-6 py-5 border-b border-[#353540] bg-[#202027] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#A100FF] to-[#22D3EE] flex items-center justify-center text-white font-bold text-sm shadow-[0_0_12px_rgba(34,211,238,0.5)]">
              DSP
            </div>
            <div>
              <h2 className="text-base font-bold text-[#F5F5FA] tracking-wide">
                About DSP Bearing Condition Monitoring
              </h2>
              <p className="text-xs text-[#A5A5B5] font-mono">
                Kinematic Vibration Analysis & Deterministic Envelope DSP
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-lg bg-[#191920] border border-[#353540] text-[#A5A5B5] hover:text-[#F5F5FA] hover:border-[#A100FF] transition-colors"
          >
            ✕
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-5 text-sm text-[#A5A5B5] max-h-[75vh] overflow-y-auto font-sans leading-relaxed">
          <div className="p-3.5 rounded-lg bg-[#202027]/80 border border-[#353540] text-xs font-mono text-[#F5F5FA] space-y-1">
            <div className="flex items-center gap-2 text-[#22D3EE] font-bold uppercase tracking-wider">
              <span className="w-2 h-2 rounded-full bg-[#22D3EE] animate-pulse"></span>
              Core System Architecture
            </div>
            <p className="text-[#A5A5B5]">
              This system conducts <strong className="text-[#F5F5FA]">offline signal processing</strong> of recorded accelerometer data. It relies purely on mechanical kinematics, resonance bandpass filtering (2,000–5,000 Hz), Hilbert envelope demodulation, and deterministic rule thresholds.
            </p>
          </div>

          <div>
            <h3 className="text-xs font-mono uppercase tracking-wider text-[#F5F5FA] font-bold mb-2 flex items-center gap-2">
              <span className="w-1.5 h-3 bg-[#A100FF] rounded-sm"></span>
              Benchmark Dataset: CWRU Bearing Data Center
            </h3>
            <p>
              Experimental vibration signals were acquired from a 2 HP Reliance Electric motor test rig at the Case Western Reserve University (CWRU) Bearing Data Center. Accelerometers installed at the 12 o'clock position on the drive-end housing sampled vibrations at 12,000 samples/second for deep-groove SKF 6205 ball bearings.
            </p>
          </div>

          <div>
            <h3 className="text-xs font-mono uppercase tracking-wider text-[#F5F5FA] font-bold mb-2 flex items-center gap-2">
              <span className="w-1.5 h-3 bg-[#E000A8] rounded-sm"></span>
              Characteristic Kinematic Frequencies
            </h3>
            <div className="grid grid-cols-2 gap-2 text-xs font-mono">
              <div className="p-2.5 rounded bg-[#202027] border border-[#353540]">
                <span className="text-[#FB7185] font-bold block">BPFO (~107.3 Hz)</span>
                <span className="text-[11px] text-[#A5A5B5]">Ball Pass Frequency Outer Race</span>
              </div>
              <div className="p-2.5 rounded bg-[#202027] border border-[#353540]">
                <span className="text-[#22D3EE] font-bold block">BPFI (~162.2 Hz)</span>
                <span className="text-[11px] text-[#A5A5B5]">Ball Pass Frequency Inner Race</span>
              </div>
              <div className="p-2.5 rounded bg-[#202027] border border-[#353540]">
                <span className="text-[#A100FF] font-bold block">2×BSF (~141.1 Hz)</span>
                <span className="text-[11px] text-[#A5A5B5]">Ball Spin Double Impact Rate</span>
              </div>
              <div className="p-2.5 rounded bg-[#202027] border border-[#353540]">
                <span className="text-[#FBBF24] font-bold block">FTF (~11.9 Hz)</span>
                <span className="text-[11px] text-[#A5A5B5]">Fundamental Cage Rotational Rate</span>
              </div>
            </div>
          </div>

          <div>
            <h3 className="text-xs font-mono uppercase tracking-wider text-[#F5F5FA] font-bold mb-2 flex items-center gap-2">
              <span className="w-1.5 h-3 bg-[#22D3EE] rounded-sm"></span>
              Deterministic Diagnostic Criteria
            </h3>
            <p>
              Harmonic search is performed within a tight <span className="font-mono text-[#F5F5FA]">±1% tolerance window</span> around theoretical fault harmonics. Normalized evidence scores range from 0.00 to 1.00 against an established decision threshold of <span className="font-mono text-[#22D3EE]">0.30</span>, cross-verified with statistical kurtosis. When evidence is ambiguous, the system explicitly reports <span className="font-mono text-[#FBBF24]">Uncertain</span>.
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-[#202027] border-t border-[#353540] flex justify-between items-center text-xs font-mono">
          <span className="text-[#A5A5B5]">DSP Evaluation Pipeline v1.0</span>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-[#A100FF] hover:bg-[#8e00e0] text-white font-semibold rounded-lg shadow-[0_0_15px_rgba(161,0,255,0.4)] transition-all"
          >
            Close Dialog
          </button>
        </div>
      </div>
    </div>
  );
}
