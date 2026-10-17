function signal = preprocessSignal(signal, config)
% Remove offset and linear drift. Resample only if not at targetFs.
% No normalisation and no smoothing, on purpose.
x = signal.x(:);
x = x - mean(x);
x = detrend(x, 1);
if signal.fs ~= config.targetFs
    [p, q] = rat(config.targetFs / signal.fs);
    x = resample(x, p, q);          % includes anti-alias filter
    signal.fs = config.targetFs;
end
signal.x = x;
end