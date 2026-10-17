repoRoot = fullfile(fileparts(mfilename('fullpath')), '..', '..');
dataDir = fullfile(repoRoot, 'matlab', 'data', 'raw');
files = {'97.mat', '105.mat', '118.mat', '130.mat'};
for i = 1:numel(files)
    filePath = fullfile(dataDir, files{i});
    fprintf('\n===== %s =====\n', files{i});
    if ~isfile(filePath)
        fprintf('NOT FOUND at %s\n', filePath);
        continue
    end
    info = whos('-file', filePath);
    for k = 1:numel(info)
        fprintf('%-20s %-14s %s\n', info(k).name, mat2str(info(k).size), info(k).class);
    end
    S = load(filePath);
    names = fieldnames(S);
    for k = 1:numel(names)
        v = S.(names{k});
        if isnumeric(v) && isscalar(v)
            fprintf('  %s = %g\n', names{k}, v);
        elseif isnumeric(v) && isvector(v)
            n = numel(v);
            fprintf('  %s: %d samples = %.2f s at 12 kHz, or %.2f s at 48 kHz\n', ...
                names{k}, n, n/12000, n/48000);
        end
    end
end