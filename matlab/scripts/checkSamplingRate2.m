% checkSamplingRate2.m - quarter-harmonic test with a known 48 kHz file as a second control.
% Every file is read as if it were 12 kHz. A true 12 kHz recording has shaft lines only at whole
% multiples of the shaft frequency fr. A 48 kHz recording read as 12 kHz has all frequencies
% divided by 4, so its shaft harmonics also appear at fr/4, fr/2, 3fr/4, 5fr/4, ...
scriptDir = fileparts(mfilename('fullpath'));
dataDir = fullfile(scriptDir, '..', 'data', 'raw');

ids = [105 118 130 109 97];  % 105,118,130: documented 12 kHz. 109: documented 48 kHz. 97: unknown.
assumedFs = 12000;
quarters = 1:12;             % positions m*fr/4, from fr/4 up to 3*fr
searchHz = 0.4;              % half-width of the search window
floorHz = 3;                 % background measured within +-3 Hz (quarter spacing is about 7.5 Hz)

for id = ids
    S = load(fullfile(dataDir, sprintf('%d.mat', id)));
    x = S.(sprintf('X%03d_DE_time', id));
    rpmName = sprintf('X%03dRPM', id);
    if isfield(S, rpmName)
        rpm = S.(rpmName);
    else
        rpm = 1797;
        fprintf('\n(%d.mat has no RPM variable; using the nominal 1797)', id);
    end
    x = x - mean(x);

    N = numel(x);
    w = hann(N);
    A = abs(fft(x .* w)) * 2 / sum(w);
    A = A(1:floor(N/2) + 1);
    f = (0:numel(A) - 1)' * assumedFs / N;
    fr = rpm / 60;

    promDb = zeros(size(quarters));
    for m = quarters
        fm = m * fr / 4;
        inWin = abs(f - fm) <= searchHz;
        nearby = abs(f - fm) <= floorHz & ~inWin;
        promDb(m) = 20 * log10(max(A(inWin)) / median(A(nearby)));
    end
    whole = mod(quarters, 4) == 0;           % m = 4, 8, 12 are 1x, 2x, 3x shaft speed

    fprintf('\n%d.mat  (%d samples, RPM %g)\n', id, N, rpm);
    fprintf('  dB above background at m*fr/4 for m = 1..12:\n  %s\n', mat2str(round(promDb, 1)));
    fprintf('  mean at whole multiples (1x, 2x, 3x):      %5.1f dB\n', mean(promDb(whole)));
    fprintf('  mean at quarter positions in between:      %5.1f dB\n', mean(promDb(~whole)));
end
