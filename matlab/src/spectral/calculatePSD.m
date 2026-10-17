function [f, pxxDb] = calculatePSD(x, fs, config)
% CALCULATEPSD  Welch power spectral density, in dB.
win = config.psdWindow;
[pxx, f] = pwelch(x(:), hann(win), round(win/2), win, fs);
pxxDb = 10 * log10(pxx + eps);
end
