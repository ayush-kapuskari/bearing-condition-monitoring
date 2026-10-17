function signal = preprocessSignal(signal, config)
% PREPROCESSSIGNAL  Remove offset and linear drift; resample only if needed.
% No normalisation and no smoothing, on purpose: both would remove the
% amplitude and high-frequency information the diagnosis needs.
signal.fsOriginal = signal.fs;
x = signal.x(:);
x = x - mean(x);
x = detrend(x, 1);
if signal.fs ~= config.targetFs
    [p, q] = rat(config.targetFs / signal.fs);   % 48000 -> 12000 gives p = 1, q = 4
    x = resample(x, p, q);                        % includes an anti-alias low-pass filter
    signal.fs = config.targetFs;
end
signal.x = x;
end
