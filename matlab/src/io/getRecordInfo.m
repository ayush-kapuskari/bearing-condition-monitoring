function info = getRecordInfo(id)
% GETRECORDINFO  Documented metadata of the CWRU records used in this project.
% Sampling rates: 105, 118 and 130 are listed on the CWRU "12k Drive End" page.
% 97 is not stated by CWRU; our quarter-harmonic test (checkSamplingRate2.m)
% showed it matches the documented 48 kHz control file 109, so it is 48 kHz.
% See docs/dataset-provenance.md.
switch id
    case 97
        info = struct('id', 97,  'condition', 'Healthy',          'fs', 48000);
    case 105
        info = struct('id', 105, 'condition', 'Inner Race Fault', 'fs', 12000);
    case 118
        info = struct('id', 118, 'condition', 'Ball Fault',       'fs', 12000);
    case 130
        info = struct('id', 130, 'condition', 'Outer Race Fault', 'fs', 12000);
    otherwise
        error('getRecordInfo:unknown', ...
            'Record %d is not in the list. Verify its sampling rate before adding it.', id);
end
end
