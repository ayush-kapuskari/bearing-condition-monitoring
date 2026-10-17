function [f, amp] = calculateEnvelopeSpectrum(x, fs, band, fMax)
% Band-pass -> Hilbert envelope -> remove mean -> FFT of the envelope.
if nargin < 4, fMax = 600; end
x = x(:);
[b, a] = butter(4, band / (fs/2), 'bandpass');
xf  = filtfilt(b, a, x);
env = abs(hilbert(xf));
env = env - mean(env);
N = numel(env);
w = hann(N);
Y = fft(env .* w);
half = floor(N/2) + 1;
amp = abs(Y(1:half)) / sum(w) * 2;
f   = (0:half-1)' * fs / N;
keep = f <= fMax;
f = f(keep);
amp = amp(keep);
end