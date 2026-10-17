% Envelope spectrum of the 4 starter records, with theoretical frequencies marked.
repoRoot = fullfile(fileparts(mfilename('fullpath')), '..', '..');
addpath(genpath(fullfile(repoRoot, 'matlab', 'src')));
cfg  = defaultConfig();
geom = getBearingGeometry('6205');

files = {'97.mat', '105.mat', '118.mat', '130.mat'};
labels = {'97 healthy', '105 inner race', '118 ball', '130 outer race'};
fsFile = [12000 12000 12000 12000];   % change the first value to 48000 if 97.mat is 48 kHz
band = [2000 5000];                   % resonance band guess, try 1500-5500 if needed

figure('Name', 'Envelope spectra');
for i = 1:numel(files)
    sig = loadCWRUData(fullfile(repoRoot,'matlab','data','raw',files{i}), [], fsFile(i));
    sig = preprocessSignal(sig, cfg);
    segs = segmentSignal(sig.x, cfg.segLen, cfg.segOverlap);
    th = calculateBearingFrequencies(geom, sig.rpm);

    acc = 0;
    for k = 1:size(segs, 2)
        [f, a] = calculateEnvelopeSpectrum(segs(:,k), sig.fs, band, 600);
        acc = acc + a;
    end
    amp = acc / size(segs, 2);

    subplot(4, 1, i);
    plot(f, amp, 'k'); hold on;
    xline(th.bpfo, 'r', 'BPFO');
    xline(th.bpfi, 'b', 'BPFI');
    xline(th.bsf2, 'g', '2xBSF');
    xline(th.ftf,  'm', 'FTF');
    title(sprintf('%s   rpm=%g', labels{i}, sig.rpm));
    xlim([0 600]); ylabel('amp');

    fprintf('%-16s BPFO %.1f Hz: %.4g | BPFI %.1f Hz: %.4g | 2xBSF %.1f Hz: %.4g\n', labels{i}, ...
        th.bpfo, peakNear(f, amp, th.bpfo), th.bpfi, peakNear(f, amp, th.bpfi), th.bsf2, peakNear(f, amp, th.bsf2));
end
xlabel('Frequency (Hz)');

function p = peakNear(f, a, f0)
    m = abs(f - f0) <= 0.02*f0 + 1;
    p = max(a(m));
end 