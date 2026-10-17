% plotSamplingRateCheck.m - figure for the report: which files are really 12 kHz?
% Every file is read as if it were 12 kHz. A true 12 kHz file has shaft peaks only at whole
% multiples of the shaft frequency (blue). A 48 kHz file read this way has all its frequencies
% divided by 4, so it also shows peaks at the quarter positions in between (orange).
scriptDir = fileparts(mfilename('fullpath'));
dataDir = fullfile(scriptDir, '..', 'data', 'raw');
figDir = fullfile(scriptDir, '..', 'results', 'figures');
if ~isfolder(figDir), mkdir(figDir); end

ids    = [105 118 130 109 97];
labels = {'documented 12 kHz', 'documented 12 kHz', 'documented 12 kHz', ...
          'documented 48 kHz (control)', 'sampling rate not documented'};
assumedFs = 12000;
fMax = 100;                                   % Hz shown, with the file read as 12 kHz

fig = figure('Color', 'w', 'Position', [100 100 900 1000]);
try, theme(fig, 'light'); catch, end
t = tiledlayout(numel(ids), 1, 'TileSpacing', 'compact', 'Padding', 'compact');

for i = 1:numel(ids)
    id = ids(i);
    S = load(fullfile(dataDir, sprintf('%d.mat', id)));
    x = S.(sprintf('X%03d_DE_time', id));
    rpmName = sprintf('X%03dRPM', id);
    if isfield(S, rpmName), rpm = S.(rpmName); else, rpm = 1797; end
    x = x - mean(x);

    % One-sided amplitude spectrum of the whole record (Hann window), in dB relative to its maximum
    N = numel(x);
    w = hann(N);
    A = abs(fft(x .* w)) * 2 / sum(w);
    A = A(1:floor(N/2) + 1);
    f = (0:numel(A) - 1)' * assumedFs / N;
    keep = f <= fMax;
    AdB = 20 * log10(A(keep) / max(A(keep)));
    fr = rpm / 60;

    ax = nexttile;
    hold(ax, 'on');
    m = 1:13;                                 % positions m*fr/4 up to about 97 Hz
    positions = m * fr / 4;
    whole = mod(m, 4) == 0;                   % m = 4, 8, 12 -> 1x, 2x, 3x shaft speed
    xline(ax, positions(~whole), '--', 'Color', [0.85 0.33 0.10], 'LineWidth', 0.8);
    xline(ax, positions(whole), '-', 'Color', [0 0.45 0.74], 'LineWidth', 1.4);
    plot(ax, f(keep), AdB, 'k', 'LineWidth', 0.6);
    hold(ax, 'off');

    xlim(ax, [0 fMax]);
    ylim(ax, [-90 5]);
    ylabel(ax, 'dB');
    title(ax, sprintf('%d.mat - %s (RPM %g)', id, labels{i}, rpm), 'FontWeight', 'normal');
    if i < numel(ids), ax.XTickLabel = []; end
end

xlabel(t, 'Frequency in Hz, with the file read as 12 kHz');
title(t, {'Shaft-speed peaks with every file read as 12 kHz', ...
          'Blue solid: 1x, 2x, 3x shaft speed.   Orange dashed: quarter positions in between'});

outFile = fullfile(figDir, 'sampling-rate-check.png');
exportgraphics(fig, outFile, 'Resolution', 200, 'BackgroundColor', 'white');
fprintf('Saved %s\n', outFile);
