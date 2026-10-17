function geom = getBearingGeometry(name)
% SKF 6205-2RS drive-end bearing (CWRU). Dimensions in inches.
if nargin < 1, name = '6205'; end
switch name
    case '6205'
        geom = struct('n', 9, 'd', 0.3126, 'D', 1.537, 'phi', 0);
    otherwise
        error('getBearingGeometry:unknown', 'Unknown bearing: %s', name);
end
end