function theory = calculateBearingFrequencies(geom, rpm)
% CALCULATEBEARINGFREQUENCIES  Theoretical fault frequencies (Hz) from geometry and speed.
% At 1797 rpm: BPFO 107.36, BPFI 162.19, BSF 70.58, FTF 11.93 Hz.
shaft = rpm / 60;
r = (geom.d / geom.D) * cosd(geom.phi);
theory.shaft = shaft;
theory.bpfo  = (geom.n/2) * shaft * (1 - r);
theory.bpfi  = (geom.n/2) * shaft * (1 + r);
theory.bsf   = (geom.D/(2*geom.d)) * shaft * (1 - r^2);
theory.bsf2  = 2 * theory.bsf;          % a ball defect hits both races per spin
theory.ftf   = (shaft/2) * (1 - r);
end
