
import { axisBottom, axisLeft } from 'd3-axis';
import { select } from 'd3-selection';

const d3 = { select, axisBottom, axisLeft };

import canvasScale from './scale';

const updateAxis = (canvas,range,data) => {

  const {x : xRange ,y : yRange } = canvasScale(canvas);

  xRange.domain(range);
  yRange.domain([Math.ceil(Math.max(...data.filter(d => d[0] <= range[1] && d[0] >= range[0] ).map( d => d[1] ))),0]);

};

const drawAxis = (canvas) => {

  const {x : xRange ,y : yRange } = canvasScale(canvas);

  const leftAxis = d3.axisLeft().scale( yRange );

  const bottomAxis = d3.axisBottom().scale( xRange );

  bottomAxis(d3.select(canvas.querySelector('g#xaxis')));
  leftAxis(d3.select(canvas.querySelector('g#yaxis')));

};


export { drawAxis, updateAxis };