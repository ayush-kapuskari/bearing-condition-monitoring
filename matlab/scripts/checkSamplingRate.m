repoRoot = fullfile(fileparts(mfilename('fullpath')), '..', '..');
addpath(genpath(fullfile(repoRoot, 'matlab', 'src')));
files = {'97.mat', '105.mat', '118.mat', '130.mat'};

for i = 1:numel(files)
    sig = loadCWRUData(fullfile(repoRoot, 'matlab', 'data', 'raw', files{i}));
    x = sig.x - mean(sig.x);
    N = numel(x);
    X = abs(fft(x .* hann(N))) / N;          % hann needs Signal Processing Toolbox
    f = (0:N-1)' * 12000 / N;                % assuming 12 kHz
    band = f > 3 & f < 40;
    fb = f(band);  Xb = X(band);
    [~, k] = max(Xb);
    fprintf('%-8s RPM=%g  shaft=%.2f Hz  strongest peak (3-40 Hz, assuming 12 kHz) = %.2f Hz\n', ...
        files{i}, sig.rpm, sig.rpm/60, fb(k));
end