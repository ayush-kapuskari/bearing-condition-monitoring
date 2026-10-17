function [t, f, magDb] = calculateSTFT(x, fs, config)
% CALCULATESTFT  Spectrogram of the first config.stftSeconds of the signal.
% magDb has one row per frequency and one column per time step.
x = x(:);
n = min(numel(x), round(config.stftSeconds * fs));
[s, f, t] = spectrogram(x(1:n), hann(config.stftWindow), config.stftOverlap, ...
                        config.stftWindow, fs);
magDb = 20 * log10(abs(s) + eps);
end
