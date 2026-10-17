function result = analyzeSignal(signal, config)
% ANALYZESIGNAL  Full pipeline on one loaded signal. Returns the result struct
% that exportResultJson writes for the web application.
if isnan(signal.rpm)
    error('analyzeSignal:noRpm', 'RPM is missing. Provide an RPM override.');
end
signal = preprocessSignal(signal, config);
fs = signal.fs;
segs = segmentSignal(signal.x, config.segLen, config.segOverlap);
nSeg = size(segs, 2);

geom   = getBearingGeometry(config.bearing);
theory = calculateBearingFrequencies(geom, signal.rpm);
tf     = calculateTimeFeatures(segs);

% Per-segment envelope spectrum, FFT and evidence; spectra are averaged
envAcc = 0; fftAcc = 0;
evSeg = cell(nSeg, 1);
for k = 1:nSeg
    [fe, ae] = calculateEnvelopeSpectrum(segs(:,k), fs, config.band, config.envFMax);
    [ff, af] = calculateFFT(segs(:,k), fs);
    envAcc = envAcc + ae;
    fftAcc = fftAcc + af;
    evSeg{k} = compareFaultFrequencies(fe, ae, theory, config);
end

d = diagnoseBearing(evSeg, tf, config);

% Supporting views on the whole preprocessed signal
[fp, pxxDb]      = calculatePSD(signal.x, fs, config);
[ts, fsT, magDb] = calculateSTFT(signal.x, fs, config);

fn = fieldnames(tf);
med = struct();
for i = 1:numel(fn), med.(fn{i}) = median(tf.(fn{i})); end

n = min(config.excerptLen, numel(signal.x));
result.meta = struct('fileName', signal.fileName, 'fs', fs, ...
    'fsOriginal', signal.fsOriginal, 'rpm', signal.rpm, ...
    'rpmSource', signal.rpmSource, 'durationSec', numel(signal.x)/fs, ...
    'nSegments', nSeg, 'bearing', config.bearing, 'schemaVersion', 1, ...
    'generatedAt', char(datetime('now', 'TimeZone', 'UTC', 'Format', 'yyyy-MM-dd''T''HH:mm:ss''Z''')), ...
    'matlabRelease', version('-release'));
result.timeFeatures = struct('record', med, 'perSegment', tf);
result.signal   = struct('t', (0:n-1)'/fs, 'x', signal.x(1:n));
result.fft      = struct('f', ff, 'amp', fftAcc/nSeg);
result.psd      = struct('f', fp, 'pxxDb', pxxDb);
result.stft     = struct('t', ts(:), 'f', fsT(:), 'magDb', magDb);
result.envelope = struct('band', config.band, 'f', fe, 'amp', envAcc/nSeg);
result.theory   = theory;
result.evidence = summariseEvidence(evSeg);
result.scores   = d.scores;
result.diagnosis = struct('label', d.label, 'confidence', d.confidence, ...
    'reasons', {d.reasons}, 'kurtosis', d.kurtosis, 'abnormal', d.abnormal);
end

function ev = summariseEvidence(evSeg)
% Combine the per-segment evidence tables into one row per family and harmonic.
n = numel(evSeg);
m = height(evSeg{1});
snr = zeros(m, n); fd = zeros(m, n); mt = zeros(m, n);
for k = 1:n
    snr(:,k) = evSeg{k}.snrDb;
    fd(:,k)  = evSeg{k}.fDetected;
    mt(:,k)  = evSeg{k}.matched;
end
T0 = evSeg{1};
ev = struct('fault', {}, 'harmonic', {}, 'fTheory', {}, 'fDetected', {}, ...
            'errorHz', {}, 'errorPct', {}, 'snrDb', {}, 'fractionMatched', {}, 'matched', {});
for r = 1:m
    fth = T0.fTheory(r);
    fDet = median(fd(r,:));
    ev(r,1) = struct('fault', T0.fault{r}, 'harmonic', T0.harmonic(r), ...
        'fTheory', fth, 'fDetected', fDet, 'errorHz', fDet - fth, ...
        'errorPct', 100*(fDet - fth)/fth, 'snrDb', median(snr(r,:)), ...
        'fractionMatched', mean(mt(r,:)), 'matched', mean(mt(r,:)) >= 0.5);
end
end
