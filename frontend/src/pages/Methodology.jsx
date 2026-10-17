import React from 'react';

export default function Methodology() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      {/* Offline DSP Statement Banner */}
      <section className="bg-white border border-zinc-300 p-5 font-mono">
        <div className="flex items-center gap-2 pb-2 border-b border-zinc-200">
          <span className="w-2.5 h-2.5 bg-zinc-800 inline-block" />
          <h1 className="text-sm sm:text-base font-bold uppercase tracking-wider text-zinc-900">
            System Methodology & Signal Processing Principles
          </h1>
        </div>
        <div className="mt-3 p-3 bg-zinc-50 border border-zinc-300 text-xs text-zinc-800 leading-relaxed">
          <span className="font-bold uppercase text-zinc-900 block mb-1">[FOUNDATIONAL PRINCIPLE]:</span>
          This system conducts <strong>offline analysis of recorded vibration data</strong>. It is not an online or continuous monitoring daemon.
          All diagnostic decisions are computed strictly from mechanical kinematics, classical digital signal processing (DSP), and deterministic rule thresholds.
          No parameters are trained or learned.
        </div>
      </section>

      {/* Characteristic Bearing Kinematics Formulas */}
      <section className="bg-white border border-zinc-300 p-5 font-mono">
        <h2 className="text-xs font-bold uppercase tracking-wider text-zinc-800 pb-2 border-b border-zinc-200">
          Theoretical Characteristic Fault Frequencies
        </h2>
        <p className="text-xs text-zinc-600 mt-2 leading-relaxed">
          When a localized surface defect occurs on a rolling element bearing, periodic impacts are generated as rolling elements strike the flaw.
          The impact recurrence rate depends solely on the internal geometry of the bearing and the shaft rotational speed:
        </p>

        {/* Formulas Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
          {/* BPFO */}
          <div className="bg-zinc-50 border border-zinc-300 p-4">
            <div className="flex justify-between items-baseline mb-2">
              <span className="font-bold text-xs text-red-700">BPFO (Ball Pass Frequency Outer Race)</span>
              <span className="text-[11px] text-zinc-500">Outer Ring Defect</span>
            </div>
            <div className="bg-white border border-zinc-200 p-3 my-2 text-center text-sm font-semibold tracking-wide text-zinc-900">
              BPFO = (n / 2) · f_r · [ 1 - (d / D) · cos(θ) ]
            </div>
            <p className="text-[11px] text-zinc-600">
              Rate at which rolling balls cross a fixed defect point on the stationary outer raceway. At ~1797 rpm, BPFO ≈ 107.4 Hz.
            </p>
          </div>

          {/* BPFI */}
          <div className="bg-zinc-50 border border-zinc-300 p-4">
            <div className="flex justify-between items-baseline mb-2">
              <span className="font-bold text-xs text-blue-700">BPFI (Ball Pass Frequency Inner Race)</span>
              <span className="text-[11px] text-zinc-500">Inner Ring Defect</span>
            </div>
            <div className="bg-white border border-zinc-200 p-3 my-2 text-center text-sm font-semibold tracking-wide text-zinc-900">
              BPFI = (n / 2) · f_r · [ 1 + (d / D) · cos(θ) ]
            </div>
            <p className="text-[11px] text-zinc-600">
              Rate at which rolling balls pass a flaw on the rotating inner ring. Modulated by shaft frequency f_r. At ~1797 rpm, BPFI ≈ 162.2 Hz.
            </p>
          </div>

          {/* 2xBSF */}
          <div className="bg-zinc-50 border border-zinc-300 p-4">
            <div className="flex justify-between items-baseline mb-2">
              <span className="font-bold text-xs text-purple-700">2 × BSF (Ball Spin Frequency)</span>
              <span className="text-[11px] text-zinc-500">Ball Element Defect</span>
            </div>
            <div className="bg-white border border-zinc-200 p-3 my-2 text-center text-sm font-semibold tracking-wide text-zinc-900">
              2 · BSF = (D / d) · f_r · [ 1 - ((d / D) · cos(θ))² ]
            </div>
            <p className="text-[11px] text-zinc-600">
              Because a damaged ball strikes both the inner and outer raceways during each complete revolution, impacts occur at 2 × BSF ≈ 141.2 Hz.
            </p>
          </div>

          {/* FTF */}
          <div className="bg-zinc-50 border border-zinc-300 p-4">
            <div className="flex justify-between items-baseline mb-2">
              <span className="font-bold text-xs text-amber-700">FTF (Fundamental Train Frequency)</span>
              <span className="text-[11px] text-zinc-500">Cage Rotational Speed</span>
            </div>
            <div className="bg-white border border-zinc-200 p-3 my-2 text-center text-sm font-semibold tracking-wide text-zinc-900">
              FTF = (f_r / 2) · [ 1 - (d / D) · cos(θ) ]
            </div>
            <p className="text-[11px] text-zinc-600">
              Rotational frequency of the bearing cage / separator assembly. Creates sidebands around fault harmonics. At ~1797 rpm, FTF ≈ 11.9 Hz.
            </p>
          </div>
        </div>

        {/* Geometry table */}
        <div className="mt-4 pt-3 border-t border-zinc-200 text-xs">
          <span className="font-bold text-zinc-800 uppercase block mb-2">Bearing Specifications (SKF 6205 Deep Groove Ball Bearing):</span>
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 bg-zinc-50 p-3 border border-zinc-200">
            <div>
              <span className="text-zinc-500 text-[10px] block">Number of Balls (n)</span>
              <span className="font-semibold text-zinc-800">9</span>
            </div>
            <div>
              <span className="text-zinc-500 text-[10px] block">Ball Diameter (d)</span>
              <span className="font-semibold text-zinc-800">0.3126 in (7.94 mm)</span>
            </div>
            <div>
              <span className="text-zinc-500 text-[10px] block">Pitch Diameter (D)</span>
              <span className="font-semibold text-zinc-800">1.537 in (39.04 mm)</span>
            </div>
            <div>
              <span className="text-zinc-500 text-[10px] block">Contact Angle (θ)</span>
              <span className="font-semibold text-zinc-800">0.0°</span>
            </div>
            <div>
              <span className="text-zinc-500 text-[10px] block">Shaft Speed (f_r)</span>
              <span className="font-semibold text-zinc-800">RPM / 60 ≈ 29.95 Hz</span>
            </div>
          </div>
        </div>
      </section>

      {/* Processing Pipeline Steps */}
      <section className="bg-white border border-zinc-300 p-5 font-mono">
        <h2 className="text-xs font-bold uppercase tracking-wider text-zinc-800 pb-2 border-b border-zinc-200">
          Six-Stage DSP Analysis Pipeline
        </h2>

        <div className="space-y-4 mt-4">
          {/* Step 1 */}
          <div className="flex items-start gap-3">
            <span className="px-2 py-0.5 bg-zinc-900 text-white text-xs font-bold shrink-0">1</span>
            <div className="text-xs">
              <h3 className="font-bold text-zinc-900 uppercase">Signal Acquisition & Metadata Ingestion</h3>
              <p className="text-zinc-600 mt-0.5 leading-relaxed">
                Raw 12 kHz accelerometer readings and motor tachometer tach speeds are extracted from MATLAB <code>.mat</code> files.
                Sampling rate is verified from shaft harmonic intervals.
              </p>
            </div>
          </div>

          {/* Step 2 */}
          <div className="flex items-start gap-3">
            <span className="px-2 py-0.5 bg-zinc-900 text-white text-xs font-bold shrink-0">2</span>
            <div className="text-xs">
              <h3 className="font-bold text-zinc-900 uppercase">Detrending & Mean Offset Removal</h3>
              <p className="text-zinc-600 mt-0.5 leading-relaxed">
                DC offset and slow sensor baseline drift are removed via linear detrending.
                No smoothing or amplitude normalization is applied, preserving original peak shock energies.
              </p>
            </div>
          </div>

          {/* Step 3 */}
          <div className="flex items-start gap-3">
            <span className="px-2 py-0.5 bg-zinc-900 text-white text-xs font-bold shrink-0">3</span>
            <div className="text-xs">
              <h3 className="font-bold text-zinc-900 uppercase">Signal Windowing & Segmentation</h3>
              <p className="text-zinc-600 mt-0.5 leading-relaxed">
                The continuous time record is segmented into overlapping 1.0-second sub-blocks (50% overlap).
                Statistical metrics (RMS, Peak, Kurtosis, Skewness, Crest Factor) are computed across each block.
              </p>
            </div>
          </div>

          {/* Step 4 */}
          <div className="flex items-start gap-3">
            <span className="px-2 py-0.5 bg-zinc-900 text-white text-xs font-bold shrink-0">4</span>
            <div className="text-xs">
              <h3 className="font-bold text-zinc-900 uppercase">Resonance Bandpass Filtering & Hilbert Demodulation</h3>
              <p className="text-zinc-600 mt-0.5 leading-relaxed">
                Because micro-shocks excite structural housing resonance in the 2000–5000 Hz band, a digital bandpass filter isolates this resonant region.
                The Hilbert transform constructs the analytic signal and computes the low-frequency envelope, which is then transformed via FFT into the 0–600 Hz envelope spectrum.
              </p>
            </div>
          </div>

          {/* Step 5 */}
          <div className="flex items-start gap-3">
            <span className="px-2 py-0.5 bg-zinc-900 text-white text-xs font-bold shrink-0">5</span>
            <div className="text-xs">
              <h3 className="font-bold text-zinc-900 uppercase">Kinematic Tolerance Window Matching</h3>
              <p className="text-zinc-600 mt-0.5 leading-relaxed">
                For each characteristic frequency (BPFO, BPFI, 2xBSF) and harmonics (1x, 2x, 3x), the algorithm searches within a strict ±1% tolerance window.
                Peak-to-noise ratio (SNR in dB) and segment consistency are evaluated.
              </p>
            </div>
          </div>

          {/* Step 6 */}
          <div className="flex items-start gap-3">
            <span className="px-2 py-0.5 bg-zinc-900 text-white text-xs font-bold shrink-0">6</span>
            <div className="text-xs">
              <h3 className="font-bold text-zinc-900 uppercase">Deterministic Decision Logic</h3>
              <p className="text-zinc-600 mt-0.5 leading-relaxed">
                Fault family scores are accumulated from matched harmonics. If a family score exceeds the 0.30 decision threshold
                and is corroborated by elevated signal kurtosis (&gt;3.5), the corresponding fault verdict is issued.
                When evidence is weak or ambiguous, the system explicitly reports <strong>Uncertain</strong>.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Dataset Attribution */}
      <section className="bg-white border border-zinc-300 p-5 font-mono text-xs">
        <h2 className="font-bold uppercase tracking-wider text-zinc-800 pb-2 border-b border-zinc-200">
          Benchmark Dataset Source & Reference
        </h2>
        <div className="mt-3 space-y-2 text-zinc-600">
          <p>
            <strong>Archive:</strong> Case Western Reserve University (CWRU) Bearing Data Center.
          </p>
          <p>
            <strong>Test Rig Configuration:</strong> 2 HP Reliance Electric motor, drive-end accelerometer installed at 12 o'clock position on the housing, sampling frequency 12,000 samples/second.
          </p>
          <p>
            <strong>Reference Records:</strong>
          </p>
          <ul className="list-disc list-inside pl-2 space-y-1">
            <li>Record <strong>97</strong>: Normal baseline condition (~1797 rpm).</li>
            <li>Record <strong>105</strong>: Inner raceway defect (0.007 in electro-discharge machined flaw).</li>
            <li>Record <strong>118</strong>: Rolling ball defect (0.007 in flaw).</li>
            <li>Record <strong>130</strong>: Outer raceway defect at 6 o'clock position (0.007 in flaw).</li>
          </ul>
        </div>
      </section>
    </div>
  );
}
