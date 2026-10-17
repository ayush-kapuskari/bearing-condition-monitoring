function config = defaultConfig()
% DEFAULTCONFIG  Every tunable number of the pipeline, in one place.
% The diagnosis thresholds are STARTING values. They are tuned only on the
% 0 hp and 1 hp records and must not be changed to force a wanted label.

% --- Signal conditioning ---
config.targetFs   = 12000;   % every signal is analysed at this rate (Hz)
config.segLen     = 12000;   % samples per segment (1 s at 12 kHz -> 1 Hz resolution)
config.segOverlap = 0.5;     % 50 % overlap between segments

% --- Bearing ---
config.bearing    = '6205';  % SKF 6205-2RS JEM, CWRU drive end

% --- Envelope analysis ---
config.band       = [2000 5000];  % band-pass around the structural resonance (Hz)
config.envFMax    = 600;          % envelope spectrum kept from 0 to this (Hz)

% --- Supporting spectra ---
config.psdWindow   = 2048;   % Welch window length (samples)
config.stftWindow  = 256;    % STFT window length (samples, about 21 ms)
config.stftOverlap = 192;    % STFT overlap (samples, 75 %)
config.stftSeconds = 0.5;    % STFT computed on the first 0.5 s only (keeps JSON small)
config.excerptLen  = 3000;   % samples of the time signal exported for plotting (0.25 s)

% --- Fault-frequency matching ---
config.tolerance  = 0.01;    % search half-width = tolerance * f + resolution
config.nHarmonics = 3;       % fundamental, 2nd and 3rd harmonic

% --- Diagnosis rule (starting values, see docs) ---
config.harmWeights    = [0.5 0.3 0.2];  % weight of harmonics 1, 2, 3
config.snrThresholdDb = 8;     % a harmonic counts as matched above this (dB over floor)
config.snrFullDb      = 20;    % dB at which a harmonic earns full credit
config.decisionThr    = 0.3;   % minimum family score to report a fault
config.leadMargin     = 0.15;  % required lead over the second family
config.minSegFrac     = 0.5;   % fundamental must match in this fraction of segments
config.kurtAbnormal   = 3.5;   % median kurtosis above this = abnormal signal
end
