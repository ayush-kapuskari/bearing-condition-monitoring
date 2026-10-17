function exportResultJson(result, outPath)
% EXPORTRESULTJSON  Write the result struct as JSON for the web application.
folder = fileparts(outPath);
if ~isempty(folder) && ~isfolder(folder), mkdir(folder); end
txt = jsonencode(result);          % NaN becomes null, as the web app expects
fid = fopen(outPath, 'w');
if fid < 0
    error('exportResultJson:open', 'Cannot write %s', outPath);
end
fprintf(fid, '%s', txt);
fclose(fid);
end
