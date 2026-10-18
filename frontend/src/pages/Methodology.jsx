import React, { useState } from 'react';

export default function Methodology() {
  const [activeStep, setActiveStep] = useState(null);

  const pipelineStages = [
    {
      num: 1,
      title: 'Recorded Vibration Data',
      subtitle: 'Signal Acquisition & Ingestion',
      icon: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4m0 5c0 2.21-3.582 4-8 4s-8-1.79-8-4" />
        </svg>
      ),
      accent: '#22D3EE',
      details: 'Raw 12,000 Hz accelerometer readings and motor tachometer speeds are extracted from MATLAB .mat files. Sampling rate is calibrated against shaft harmonics.'
    },
    {
      num: 2,
      title: 'Preprocessing & Detrending',
      subtitle: 'Mean Offset Removal',
      icon: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
        </svg>
      ),
      accent: '#38BDF8',
      details: 'DC bias and slow baseline sensor drift are removed via linear detrending. No artificial smoothing is applied, preserving raw impact shock spikes.'
    },
    {
      num: 3,
      title: 'Windowing & FFT Analysis',
      subtitle: 'Segment Spectral Statistics',
      icon: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z" />
        </svg>
      ),
      accent: '#818CF8',
      details: 'Signal is windowed into overlapping 1.0-second blocks (50% overlap). Statistical moments (RMS, Kurtosis, Crest Factor, Skewness) and direct FFT are computed.'
    },
    {
      num: 4,
      title: 'Filtering & Envelope Analysis',
      subtitle: 'Bandpass & Hilbert Transform',
      icon: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
        </svg>
      ),
      accent: '#A100FF',
      details: 'Structural housing resonances in the 2,000–5,000 Hz band are isolated. The Hilbert transform extracts the analytic envelope, and FFT yields the 0–600 Hz envelope spectrum.'
    },
    {
      num: 5,
      title: 'Bearing-Frequency Matching',
      subtitle: 'Kinematic ±1% Tolerance Windows',
      icon: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
      ),
      accent: '#E000A8',
      details: 'Automated peak detector searches within ±1% tolerance windows of BPFO, BPFI, 2×BSF harmonics (1x, 2x, 3x). Peak-to-noise ratio (SNR in dB) and segment consistency are calculated.'
    },
    {
      num: 6,
      title: 'Diagnosis & Evidence',
      subtitle: 'Deterministic Decision Logic',
      icon: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      accent: '#4ADE80',
      details: 'Harmonic family scores are accumulated. If evidence exceeds the 0.30 threshold and is corroborated by elevated kurtosis (> 3.5), a fault verdict is issued. Weak evidence yields Uncertain.'
    }
  ];

  return (
    <div className="space-y-6">
      {/* Foundational Statement Hero */}
      <section className="bg-gradient-to-r from-[#202027] to-[#191920] border border-[#353540] rounded-xl p-6 shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-full bg-gradient-to-l from-[#A100FF]/15 via-[#22D3EE]/5 to-transparent pointer-events-none" />
        <div className="relative z-10 space-y-3">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#22D3EE] animate-pulse"></span>
            <span className="text-[10px] font-mono uppercase tracking-widest text-[#22D3EE]">
              Scientific Foundations
            </span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold font-sans text-[#F5F5FA] tracking-tight">
            Methodology & Classical Digital Signal Processing Pipeline
          </h1>
          <div className="p-4 rounded-lg bg-[#191920]/90 border border-[#353540] text-xs font-mono text-[#F5F5FA] space-y-1.5 max-w-3xl">
            <div className="text-[#22D3EE] font-bold uppercase tracking-wider flex items-center gap-2">
              <span>⚡</span>
              <span>[CORE PRINCIPLE — OFFLINE DETERMINISTIC DSP]:</span>
            </div>
            <p className="text-[#A5A5B5] leading-relaxed">
              This system conducts <strong className="text-[#F5F5FA]">offline evaluation of recorded vibration signals</strong>. It is not an online streaming daemon.
              All diagnostic verdicts are computed strictly from mechanical kinematics, classical digital filtering, Hilbert envelope demodulation, and deterministic threshold rules. No machine learning models or black-box parameters are trained.
            </p>
          </div>
        </div>
      </section>

      {/* Clean Interactive Process Diagram */}
      <section className="bg-[#202027] border border-[#353540] rounded-xl p-6 shadow-lg space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-[#353540]">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="w-2 h-2 rounded-full bg-[#A100FF] animate-pulse"></span>
              <span className="text-[10px] font-mono uppercase tracking-widest text-[#A100FF]">
                Analysis Workflow
              </span>
            </div>
            <h2 className="text-sm sm:text-base font-bold font-mono uppercase tracking-wider text-[#F5F5FA]">
              End-to-End Six-Stage DSP Architecture
            </h2>
            <p className="text-xs text-[#A5A5B5] mt-0.5">
              Recorded vibration data &rarr; Preprocessing &rarr; FFT analysis &rarr; Filtering & envelope &rarr; Kinematic matching &rarr; Diagnosis
            </p>
          </div>
        </div>

        {/* Process Flow Diagram Nodes */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 pt-2">
          {pipelineStages.map((stage) => {
            const isSelected = activeStep === stage.num;

            return (
              <div
                key={stage.num}
                onClick={() => setActiveStep(isSelected ? null : stage.num)}
                className={`p-4 rounded-xl border transition-all cursor-pointer relative group ${
                  isSelected
                    ? 'bg-[#191920] border-[#A100FF] shadow-[0_0_20px_rgba(161,0,255,0.3)]'
                    : 'bg-[#191920]/80 border-[#353540] hover:border-[#353540] hover:bg-[#1f1f27]'
                }`}
              >
                <div className="flex items-center justify-between mb-3">
                  <div
                    className="w-9 h-9 rounded-lg flex items-center justify-center font-mono font-bold text-xs"
                    style={{
                      backgroundColor: `${stage.accent}15`,
                      color: stage.accent,
                      border: `1px solid ${stage.accent}40`,
                      boxShadow: `0 0 10px ${stage.accent}25`
                    }}
                  >
                    0{stage.num}
                  </div>

                  <span className="text-[10px] font-mono text-[#6E6E82] uppercase tracking-wider">
                    Stage {stage.num}
                  </span>
                </div>

                <div className="space-y-1">
                  <h3 className="text-sm font-bold text-[#F5F5FA] font-sans group-hover:text-[#22D3EE] transition-colors">
                    {stage.title}
                  </h3>
                  <div className="text-[11px] font-mono text-[#A5A5B5]">
                    {stage.subtitle}
                  </div>
                </div>

                <p className="text-xs text-[#A5A5B5] mt-3 leading-relaxed font-sans border-t border-[#353540]/60 pt-2.5">
                  {stage.details}
                </p>
              </div>
            );
          })}
        </div>
      </section>

      {/* Characteristic Bearing Kinematics Formulas */}
      <section className="bg-[#202027] border border-[#353540] rounded-xl p-6 shadow-lg space-y-5">
        <div className="pb-3 border-b border-[#353540]">
          <div className="flex items-center gap-2 mb-1">
            <span className="w-2 h-2 rounded-full bg-[#E000A8] animate-pulse"></span>
            <span className="text-[10px] font-mono uppercase tracking-widest text-[#E000A8]">
              Kinematic Formulas
            </span>
          </div>
          <h2 className="text-sm sm:text-base font-bold font-mono uppercase tracking-wider text-[#F5F5FA]">
            Theoretical Characteristic Fault Frequencies
          </h2>
          <p className="text-xs text-[#A5A5B5] mt-0.5 leading-relaxed">
            When rolling balls strike localized surface defects, micro-impact shocks repeat at predictable geometric intervals.
            These recurrence frequencies depend exclusively on shaft rotational speed <span className="font-mono text-[#22D3EE]">f_r</span> and bearing geometry:
          </p>
        </div>

        {/* Formulas Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* BPFO */}
          <div className="p-4 rounded-xl bg-[#191920] border border-[#353540] hover:border-[#E000A8]/50 transition-colors space-y-2">
            <div className="flex justify-between items-baseline">
              <span className="font-bold text-xs font-mono text-[#E000A8]">BPFO (Outer Raceway)</span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#E000A8]/10 text-[#E000A8] border border-[#E000A8]/30">
                Outer Ring Flaw
              </span>
            </div>
            <div className="p-3 rounded-lg bg-[#111116] border border-[#353540] text-center font-mono text-sm font-bold text-[#F5F5FA] tracking-wider text-shadow">
              BPFO = (n / 2) &bull; f_r &bull; [ 1 - (d / D) &bull; cos(&theta;) ]
            </div>
            <p className="text-xs text-[#A5A5B5] leading-relaxed">
              Rate at which rolling balls cross a fixed defect on the stationary outer race. At ~1797 rpm, BPFO ≈ <span className="text-[#22D3EE] font-mono font-semibold">107.3 Hz</span>.
            </p>
          </div>

          {/* BPFI */}
          <div className="p-4 rounded-xl bg-[#191920] border border-[#353540] hover:border-[#38BDF8]/50 transition-colors space-y-2">
            <div className="flex justify-between items-baseline">
              <span className="font-bold text-xs font-mono text-[#38BDF8]">BPFI (Inner Raceway)</span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#38BDF8]/10 text-[#38BDF8] border border-[#38BDF8]/30">
                Inner Ring Flaw
              </span>
            </div>
            <div className="p-3 rounded-lg bg-[#111116] border border-[#353540] text-center font-mono text-sm font-bold text-[#F5F5FA] tracking-wider">
              BPFI = (n / 2) &bull; f_r &bull; [ 1 + (d / D) &bull; cos(&theta;) ]
            </div>
            <p className="text-xs text-[#A5A5B5] leading-relaxed">
              Rate at which rolling balls pass a flaw on the rotating inner ring. Modulated by shaft rotational frequency f_r. At ~1797 rpm, BPFI ≈ <span className="text-[#22D3EE] font-mono font-semibold">162.2 Hz</span>.
            </p>
          </div>

          {/* 2xBSF */}
          <div className="p-4 rounded-xl bg-[#191920] border border-[#353540] hover:border-[#A100FF]/50 transition-colors space-y-2">
            <div className="flex justify-between items-baseline">
              <span className="font-bold text-xs font-mono text-[#A100FF]">2 &bull; BSF (Ball Element Spin)</span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#A100FF]/10 text-[#A100FF] border border-[#A100FF]/30">
                Ball Defect
              </span>
            </div>
            <div className="p-3 rounded-lg bg-[#111116] border border-[#353540] text-center font-mono text-sm font-bold text-[#F5F5FA] tracking-wider">
              2 &bull; BSF = (D / d) &bull; f_r &bull; [ 1 - ((d / D) &bull; cos(&theta;))&sup2; ]
            </div>
            <p className="text-xs text-[#A5A5B5] leading-relaxed">
              Because a damaged ball strikes both inner and outer raceways during each revolution, double-impact recurrence occurs at 2 &bull; BSF ≈ <span className="text-[#22D3EE] font-mono font-semibold">141.1 Hz</span>.
            </p>
          </div>

          {/* FTF */}
          <div className="p-4 rounded-xl bg-[#191920] border border-[#353540] hover:border-[#FBBF24]/50 transition-colors space-y-2">
            <div className="flex justify-between items-baseline">
              <span className="font-bold text-xs font-mono text-[#FBBF24]">FTF (Cage Rotational Frequency)</span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#FBBF24]/10 text-[#FBBF24] border border-[#FBBF24]/30">
                Cage / Separator
              </span>
            </div>
            <div className="p-3 rounded-lg bg-[#111116] border border-[#353540] text-center font-mono text-sm font-bold text-[#F5F5FA] tracking-wider">
              FTF = (f_r / 2) &bull; [ 1 - (d / D) &bull; cos(&theta;) ]
            </div>
            <p className="text-xs text-[#A5A5B5] leading-relaxed">
              Rotational frequency of the bearing cage / retainer ring. Often appears as modulation sidebands around fault harmonics. At ~1797 rpm, FTF ≈ <span className="text-[#22D3EE] font-mono font-semibold">11.9 Hz</span>.
            </p>
          </div>
        </div>

        {/* Bearing Geometry Specifications */}
        <div className="pt-2">
          <span className="text-xs font-mono font-bold uppercase tracking-wider text-[#F5F5FA] block mb-2">
            Bearing Geometry: Deep Groove SKF 6205 Specifications
          </span>
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 bg-[#191920] p-4 rounded-xl border border-[#353540] text-xs font-mono">
            <div>
              <span className="text-[#6E6E82] text-[10px] block uppercase">Ball Count (n)</span>
              <span className="font-bold text-[#F5F5FA] text-sm">9 balls</span>
            </div>
            <div>
              <span className="text-[#6E6E82] text-[10px] block uppercase">Ball Diameter (d)</span>
              <span className="font-bold text-[#22D3EE] text-sm">0.3126 in (7.94 mm)</span>
            </div>
            <div>
              <span className="text-[#6E6E82] text-[10px] block uppercase">Pitch Diameter (D)</span>
              <span className="font-bold text-[#F5F5FA] text-sm">1.537 in (39.04 mm)</span>
            </div>
            <div>
              <span className="text-[#6E6E82] text-[10px] block uppercase">Contact Angle (&theta;)</span>
              <span className="font-bold text-[#F5F5FA] text-sm">0.0&deg;</span>
            </div>
            <div>
              <span className="text-[#6E6E82] text-[10px] block uppercase">Shaft Rot. Rate (f_r)</span>
              <span className="font-bold text-[#A100FF] text-sm">RPM / 60 ≈ 29.95 Hz</span>
            </div>
          </div>
        </div>
      </section>

      {/* Dataset Attribution */}
      <section className="bg-[#202027] border border-[#353540] rounded-xl p-6 shadow-md text-xs font-mono space-y-3">
        <h3 className="font-bold uppercase tracking-wider text-[#F5F5FA] pb-2 border-b border-[#353540]">
          Benchmark Dataset Citation & Test Rig Setup
        </h3>
        <div className="space-y-2 text-[#A5A5B5] leading-relaxed">
          <p>
            <strong className="text-[#F5F5FA]">Archive:</strong> Case Western Reserve University (CWRU) Bearing Data Center.
          </p>
          <p>
            <strong className="text-[#F5F5FA]">Experimental Setup:</strong> 2 HP Reliance Electric motor test rig with torque transducer and dynamometer load. Drive-end housing accelerometer sampled at 12,000 samples/second.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-2">
            <div className="p-2.5 rounded bg-[#191920] border border-[#353540]">
              <span className="text-[#4ADE80] font-bold block">Record 97.mat</span>
              <span className="text-[11px] text-[#A5A5B5]">Normal baseline condition (~1796 rpm, 0 HP load)</span>
            </div>
            <div className="p-2.5 rounded bg-[#191920] border border-[#353540]">
              <span className="text-[#FB7185] font-bold block">Record 105.mat</span>
              <span className="text-[11px] text-[#A5A5B5]">Drive-end inner race flaw (0.007" electro-discharge flaw)</span>
            </div>
            <div className="p-2.5 rounded bg-[#191920] border border-[#353540]">
              <span className="text-[#FBBF24] font-bold block">Record 118.mat</span>
              <span className="text-[11px] text-[#A5A5B5]">Drive-end ball rolling element flaw (0.007" flaw)</span>
            </div>
            <div className="p-2.5 rounded bg-[#191920] border border-[#353540]">
              <span className="text-[#E000A8] font-bold block">Record 130.mat</span>
              <span className="text-[11px] text-[#A5A5B5]">Drive-end outer race flaw at 6 o'clock load zone (0.007" flaw)</span>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
