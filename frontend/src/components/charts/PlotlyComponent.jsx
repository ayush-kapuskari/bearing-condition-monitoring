import React from 'react';
import Plotly from 'plotly.js-basic-dist';
import createPlotlyComponent from 'react-plotly.js/factory';

// Create a custom Plotly component using the lightweight plotly.js-basic-dist bundle
const Plot = createPlotlyComponent(Plotly);

export default Plot;
