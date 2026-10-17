% demoEnvelope.m - envelope spectra of the 4 starter records with the
% theoretical fault frequencies marked. Run from anywhere:
%   run(fullfile('scripts', 'demoEnvelope.m'))   (Current Folder = Matlab)
matlabRoot = fullfile(fileparts(mfilename('fullpath')), '..');
addpath(genpath(fullfile(matlabRoot, 'src')));
cfg  = defaultConfig();
geom = getBearingGeometry(cfg.bearing);

ids = [97 105 118 130];
figure('Name', 'Envelope spectra', 'Color', 'w');
for i = 1:numel(ids)
    info = getRecordInfo(ids(i));      % includes the verified sampling rate (97 = 48 kHz)
    sig  = loadCWRUData(fullfile(matlabRoot, 'data', 'raw', sprintf('%d.mat', ids(i))), [], info.fs);
    sig  = preprocessSignal(sig, cfg); % 97 is resampled 48 kHz -> 12 kHz here
    segs = segmentSignal(sig.x, cfg.segLen, cfg.segOverlap);
    th   = calculateBearingFrequencies(geom, sig.rpm);

    acc = 0;
    for k = 1:size(segs, 2)
        [f, a] = calculateEnvelopeSpectrum(segs(:,k), sig.fs, cfg.band, cfg.envFMax);
        acc = acc + a;
    end
    amp = acc / size(segs, 2);

    subplot(numel(ids), 1, i);
    plot(f, amp, 'k'); hold on;
    xline(th.bpfo, 'r', 'BPFO');
    xline(th.bpfi, 'b', 'BPFI');
    xline(th.bsf2, 'g', '2xBSF');
    xline(th.ftf,  'm', 'FTF');
    hold off;
    title(sprintf('%d.mat - %s   (rpm %g, recorded at %g kHz, %d segments)', ...
        ids(i), info.condition, sig.rpm, info.fs/1000, size(segs, 2)));
    xlim([0 cfg.envFMax]); ylabel('Envelope amplitude');

    fprintf('%-4d %-17s BPFO %.1f Hz: %.4g | BPFI %.1f Hz: %.4g | 2xBSF %.1f Hz: %.4g\n', ...
        ids(i), info.condition, th.bpfo, peakNear(f, amp, th.bpfo), ...
        th.bpfi, peakNear(f, amp, th.bpfi), th.bsf2, peakNear(f, amp, th.bsf2));
end
xlabel('Frequency (Hz)');

function p = peakNear(f, a, f0)
    m = abs(f - f0) <= 0.02*f0 + 1;
    p = max(a(m));
end
