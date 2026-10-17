function signal = loadCWRUData(filePath, rpmOverride, fs)
% LOADCWRUDATA  Load one CWRU .mat file. Variables are found by name pattern.
%   signal = loadCWRUData(filePath, rpmOverride, fs)
%   filePath    : path to the .mat file
%   rpmOverride : [] to use the RPM stored in the file
%   fs          : sampling rate of THIS file in Hz (not stored in the file;
%                 use getRecordInfo). Defaults to 12000 if empty.
if nargin < 2, rpmOverride = []; end
if nargin < 3 || isempty(fs), fs = 12000; end
if ~isfile(filePath)
    error('loadCWRUData:notFound', 'File not found: %s', filePath);
end
S = load(filePath);
names = fieldnames(S);

iDE = find(endsWith(names, '_DE_time'), 1);
if isempty(iDE)
    error('loadCWRUData:noSignal', 'No *_DE_time variable in %s', filePath);
end
x = double(S.(names{iDE})(:));

iRPM = find(endsWith(names, 'RPM'), 1);
if ~isempty(rpmOverride)
    rpm = rpmOverride;  rpmSource = 'user';
elseif ~isempty(iRPM) && isscalar(S.(names{iRPM}))
    rpm = double(S.(names{iRPM}));  rpmSource = 'file';
else
    rpm = NaN;  rpmSource = 'missing';
end

[~, name, ext] = fileparts(filePath);
signal = struct('x', x, 'fs', fs, 'rpm', rpm, ...
                'rpmSource', rpmSource, 'fileName', [name ext]);
end
