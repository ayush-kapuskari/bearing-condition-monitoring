function tf = calculateTimeFeatures(segs)
% CALCULATETIMEFEATURES  Time-domain features, one value per segment (row vectors).
mu = mean(segs, 1);
sd = std(segs, 0, 1);
tf.rms          = sqrt(mean(segs.^2, 1));
tf.peak         = max(abs(segs), [], 1);
tf.peakToPeak   = max(segs, [], 1) - min(segs, [], 1);
tf.crestFactor  = tf.peak ./ tf.rms;
z = (segs - mu) ./ sd;
tf.kurtosis     = mean(z.^4, 1);   % about 3 for Gaussian noise; impacts raise it
tf.skewness     = mean(z.^3, 1);
tf.std          = sd;
end
