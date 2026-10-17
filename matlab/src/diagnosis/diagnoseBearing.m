function d = diagnoseBearing(evSeg, tf, config)
% DIAGNOSEBEARING  Rule-based verdict from per-segment evidence and time features.
%   evSeg : cell array, one evidence table per segment (from compareFaultFrequencies)
%   tf    : time features per segment (from calculateTimeFeatures)
% Returns label, an evidence score in [0,1] (NOT a probability), reasons and scores.
names  = {'outer', 'inner', 'ball'};
labels = {'Outer Race Fault', 'Inner Race Fault', 'Ball Fault'};
nSeg = numel(evSeg);
segScore = zeros(3, nSeg);
fundHit  = zeros(3, nSeg);
for k = 1:nSeg
    T = evSeg{k};
    for i = 1:3
        r = strcmp(T.fault, names{i});
        segScore(i, k) = familyScore(T(r, :), config);
        fundHit(i, k)  = T.matched(r & T.harmonic == 1);
    end
end
medScore = median(segScore, 2);
fracFund = mean(fundHit, 2);
medKurt  = median(tf.kurtosis);
abnormal = medKurt > config.kurtAbnormal;

[sorted, order] = sort(medScore, 'descend');
top = order(1);
lead = sorted(1) - sorted(2);

if sorted(1) >= config.decisionThr && fracFund(top) >= config.minSegFrac && lead >= config.leadMargin
    label = labels{top};
    confidence = 0.5*sorted(1) + 0.3*min(lead/0.5, 1) + 0.2*fracFund(top);
    reasons = {sprintf('%s score %.2f, ahead of the next family by %.2f', names{top}, sorted(1), lead), ...
               sprintf('Fundamental matched in %.0f%% of segments', 100*fracFund(top)), ...
               sprintf('Median kurtosis %.2f', medKurt)};
elseif sorted(1) < config.decisionThr && ~abnormal
    label = 'Healthy';
    confidence = 1 - sorted(1);
    reasons = {sprintf('No fault family above threshold (best score %.2f)', sorted(1)), ...
               sprintf('Median kurtosis %.2f is in the normal range', medKurt)};
else
    label = 'Uncertain';
    confidence = 0.5 * sorted(1);
    reasons = {sprintf('Best score %.2f, lead %.2f, kurtosis %.2f: no single clear signature', ...
               sorted(1), lead, medKurt)};
end

d.label = label;
d.confidence = confidence;
d.reasons = reasons;
d.scores = struct('outer', medScore(1), 'inner', medScore(2), 'ball', medScore(3));
d.fracFundamental = struct('outer', fracFund(1), 'inner', fracFund(2), 'ball', fracFund(3));
d.kurtosis = medKurt;
d.abnormal = abnormal;
end

function s = familyScore(Tf, config)
% Weighted strength of the matched harmonics of one family, between 0 and 1.
w = config.harmWeights(Tf.harmonic);
w = w(:);
strength = min(max(Tf.snrDb, 0) / config.snrFullDb, 1) .* double(Tf.matched);
s = sum(w .* strength) / sum(w);
end
