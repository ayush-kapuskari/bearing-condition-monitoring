function config = defaultConfig()
% All tunable numbers live here.
config.targetFs   = 12000;   % every signal is brought to this rate (Hz)
config.segLen     = 12000;   % samples per segment (1 s at 12 kHz)
config.segOverlap = 0.5;     % 50% overlap
end