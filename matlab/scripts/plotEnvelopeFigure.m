% plotEnvelopeFigure.m - report/slide version of the envelope spectra.
% Same calculation as demoEnvelope.m; only the presentation differs.
matlabRoot = fullfile(fileparts(mfilename('fullpath')), '..');
addpath(genpath(fullfile(matlabRoot, 'src')));
cfg  = defaultConfig();
geom = getBearingGeometry(cfg.bearing);
ids  = [97 105 118 130];

% Fault families: label, field in the theory struct, colour, harmonics to mark
fam = struct( ...
    'name',  {'BPFO (outer race)', 'BPFI (inner race)', '2xBSF (ball)', 'FTF (cage)'}, ...
    'field', {'bpfo', 'bpfi', 'bsf2', 'ftf'}, ...
    'color', {[0.85 0.15 0.15], [0.10 0.35 0.85], [0.10 0.60 0.20], [0.60 0.25 0.70]}, ...
    'nHarm', {5, 3, 3, 1});

fig = figure('Color', 'w', 'Position', [100 100 1000 900]);
try, theme(fig, 'light'); catch, end      % avoid the dark theme hiding the trace
t = tiledlayout(numel(ids), 1, 'TileSpacing', 'compact', 'Padding', 'compact');

for i = 1:numel(ids)
    info = getRecordInfo(ids(i));
    sig  = loadCWRUData(fullfile(matlabRoot, 'data', 'raw', sprintf('%d.mat', ids(i))), [], info.fs);
    sig  = preprocessSignal(sig, cfg);
    segs = segmentSignal(sig.x, cfg.segLen, cfg.segOverlap);
    th   = calculateBearingFrequencies(geom, sig.rpm);

    acc = 0;
    for k = 1:size(segs, 2)
        [f, a] = calculateEnvelopeSpectrum(segs(:,k), sig.fs, cfg.band, cfg.envFMax);
        acc = acc + a;
    end
    amp = acc / size(segs, 2);

    ax = nexttile; hold(ax, 'on');
    ax.Color = 'w'; ax.XColor = 'k'; ax.YColor = 'k';

    % Marker lines first, so the spectrum is drawn on top of them
    h = gobjects(1, numel(fam));
    for j = 1:numel(fam)
        f0 = th.(fam(j).field);
        for m = 1:fam(j).nHarm
            if m*f0 > cfg.envFMax, break; end
            style = '--'; if m > 1, style = ':'; end
            hl = xline(ax, m*f0, style, 'Color', fam(j).color, 'LineWidth', 1.2);
            if m == 1, h(j) = hl; end
        end
    end
    plot(ax, f, amp, 'Color', [0.1 0.1 0.1], 'LineWidth', 1);
    hold(ax, 'off');

    xlim(ax, [0 cfg.envFMax]);
    ylim(ax, [0 1.1*max(amp)]);            % room above the tallest peak
    ylabel(ax, 'Amplitude');
    title(ax, sprintf('%d.mat - %s (%g rpm)', ids(i), info.condition, sig.rpm), ...
        'Color', 'k', 'FontWeight', 'normal');
    if i < numel(ids), ax.XTickLabel = []; end
    if i == 1
        legend(ax, h, {fam.name}, 'Location', 'northeast', 'Orientation', 'horizontal', ...
            'TextColor', 'k', 'Color', 'w');
    end
end
xlabel(t, 'Frequency (Hz)', 'Color', 'k');
title(t, {'Envelope spectra of the four starter records', ...
    'Dashed: theoretical fault frequency.   Dotted: its harmonics'}, 'Color', 'k');

outFile = fullfile(matlabRoot, 'results', 'figures', 'envelope-spectra.png');
if ~isfolder(fileparts(outFile)), mkdir(fileparts(outFile)); end
exportgraphics(fig, outFile, 'Resolution', 200, 'BackgroundColor', 'white');
fprintf('Saved %s\n', outFile);