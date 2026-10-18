% analyzeUploadedFile.m - Run pipeline on an uploaded .mat file
% Invoked via: matlab -batch "analyzeUploadedFile"
% Parameters are passed via environment variables:
%   BEARING_INPUT  - path to uploaded .mat file
%   BEARING_OUTPUT - path to destination JSON
%   BEARING_RPM    - optional RPM override (string, empty if none)
%   BEARING_FS     - sampling rate (string, e.g. '12000', empty if default)

try
    matlabRoot = fullfile(fileparts(mfilename('fullpath')), '..');
    addpath(genpath(fullfile(matlabRoot, 'src')));

    inputPath  = getenv('BEARING_INPUT');
    outputPath = getenv('BEARING_OUTPUT');
    rpmStr     = getenv('BEARING_RPM');
    fsStr      = getenv('BEARING_FS');

    if isempty(inputPath)
        error('analyzeUploadedFile:missingInput', 'BEARING_INPUT environment variable is not set.');
    end
    if isempty(outputPath)
        error('analyzeUploadedFile:missingOutput', 'BEARING_OUTPUT environment variable is not set.');
    end

    rpm = [];
    if ~isempty(rpmStr)
        val = str2double(rpmStr);
        if ~isnan(val) && isfinite(val)
            rpm = val;
        end
    end

    fs = [];
    if ~isempty(fsStr)
        val = str2double(fsStr);
        if ~isnan(val) && isfinite(val)
            fs = val;
        end
    end

    cfg = defaultConfig();
    result = runPipeline(inputPath, cfg, rpm, fs);
    exportResultJson(result, outputPath);
    fprintf('Analysis completed successfully. Output written to %s\n', outputPath);
catch ME
    fprintf(2, '%s\n', ME.message);
    exit(1);
end
