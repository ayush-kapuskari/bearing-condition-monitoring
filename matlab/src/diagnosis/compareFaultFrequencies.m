function T = compareFaultFrequencies(f, amp, theory, config)
% COMPAREFAULTFREQUENCIES  For each fault family and harmonic, find the largest
% peak near the theoretical frequency and measure how far it stands above the
% local noise floor (median of the spectrum on either side of the window).
families = {'outer', 'inner', 'ball'};
base = [theory.bpfo, theory.bpfi, theory.bsf2];
df = f(2) - f(1);

% Empty struct array with the final field order (avoids assigning a struct into [])
rows = struct('fault', {}, 'harmonic', {}, 'fTheory', {}, 'fDetected', {}, ...
              'errorHz', {}, 'errorPct', {}, 'snrDb', {}, 'matched', {});
for i = 1:numel(families)
    for h = 1:config.nHarmonics
        f0 = h * base(i);
        hw = config.tolerance * f0 + df;            % search half-width (Hz)
        inWin = abs(f - f0) <= hw;
        fw = f(inWin);
        [pk, idx] = max(amp(inWin));
        fd = fw(idx);
        flank = abs(f - f0) <= 6*hw & ~inWin;        % neighbourhood for the noise floor
        fl = median(amp(flank));
        snr = 20 * log10(pk / fl);
        rows(end+1, 1) = struct('fault', families{i}, 'harmonic', h, ...
            'fTheory', f0, 'fDetected', fd, 'errorHz', fd - f0, ...
            'errorPct', 100*(fd - f0)/f0, 'snrDb', snr, ...
            'matched', snr >= config.snrThresholdDb); %#ok<AGROW>
    end
end
T = struct2table(rows);
end
