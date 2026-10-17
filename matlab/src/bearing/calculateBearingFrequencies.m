function fr = calculateBearingFrequencies(geom, rpm)
% Theoretical fault frequencies from geometry and shaft speed.
shaft = rpm / 60;
r = (geom.d / geom.D) * cosd(geom.phi);
fr.shaft = shaft;
fr.bpfo  = (geom.n/2) * shaft * (1 - r);
fr.bpfi  = (geom.n/2) * shaft * (1 + r);
fr.bsf   = (geom.D/(2*geom.d)) * shaft * (1 - r^2);
fr.bsf2  = 2 * fr.bsf;
fr.ftf   = (shaft/2) * (1 - r);
end