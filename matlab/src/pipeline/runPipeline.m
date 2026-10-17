function result = runPipeline(filePath, config, rpmOverride, fs)
% RUNPIPELINE  Load one file and analyse it. fs = sampling rate of that file (Hz).
if nargin < 2 || isempty(config), config = defaultConfig(); end
if nargin < 3, rpmOverride = []; end
if nargin < 4, fs = []; end
signal = loadCWRUData(filePath, rpmOverride, fs);
result = analyzeSignal(signal, config);
end
