function segs = segmentSignal(x, segLen, overlapFrac)
% SEGMENTSIGNAL  Cut x into overlapping segments, one segment per column.
x = x(:);
step = round(segLen * (1 - overlapFrac));
nSeg = floor((numel(x) - segLen) / step) + 1;
if nSeg < 1
    error('segmentSignal:tooShort', 'Signal shorter than one segment.');
end
segs = zeros(segLen, nSeg);
for k = 1:nSeg
    i0 = (k-1)*step + 1;
    segs(:, k) = x(i0 : i0 + segLen - 1);
end
end
