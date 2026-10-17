function [f, amp] = calculateFFT(x, fs)
% CALCULATEFFT  Hann-windowed one-sided amplitude spectrum.
x = x(:);
N = numel(x);
w = hann(N);
Y = fft(x .* w);
half = floor(N/2) + 1;
amp = abs(Y(1:half)) / sum(w) * 2;
f = (0:half-1)' * fs / N;
end
