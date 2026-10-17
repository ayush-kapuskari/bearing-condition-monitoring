% runAllStarter.m - run the full pipeline on the 4 starter records and write
% one JSON result per record into Matlab/results/json/.
%   run(fullfile('scripts', 'runAllStarter.m'))   (Current Folder = Matlab)
matlabRoot = fullfile(fileparts(mfilename('fullpath')), '..');
addpath(genpath(fullfile(matlabRoot, 'src')));
cfg = defaultConfig();
ids = [97 105 118 130];
outDir = fullfile(matlabRoot, 'results', 'json');

for id = ids
    info = getRecordInfo(id);
    r = runPipeline(fullfile(matlabRoot, 'data', 'raw', sprintf('%d.mat', id)), cfg, [], info.fs);
    exportResultJson(r, fullfile(outDir, sprintf('%d.json', id)));
    s = r.scores;
    fprintf('%-4d known: %-17s -> %-17s evidence %.2f | outer %.2f inner %.2f ball %.2f | kurt %.2f | %d seg\n', ...
        id, info.condition, r.diagnosis.label, r.diagnosis.confidence, ...
        s.outer, s.inner, s.ball, r.timeFeatures.record.kurtosis, r.meta.nSegments);
end
fprintf('JSON files written to %s\n', outDir);
