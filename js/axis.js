
import { axisBottom, axisLeft } from 'd3-axis';
import { select } from 'd3-selection';
import { formatLocale } from 'd3-format';

const d3 = { select, axisBottom, axisLeft };

import canvasScale from './scale';

const updateAxis = (canvas,range,data) => {

  const {x : xRange ,y : yRange } = canvasScale(canvas);

  xRange.domain(range);
  yRange.domain([Math.ceil(Math.max(...data.filter(d => d[0] <= range[1] && d[0] >= range[0] ).map( d => d[1] ))),0]);

  let max_y = Math.max(...yRange.domain());
  let max_x = Math.max(...xRange.domain());


  let formatter = formatLocale('^5.4~g');
  let y_width = formatter.format('^5.4~g')(max_y).length;
  let x_width = formatter.format('^5.4~g')(max_x).length;

  d3.select(canvas.querySelector('g#yaxis')).style('font-size', `calc(${60/y_width}px * var(--text-factor))` );
  d3.select(canvas.querySelector('g#xaxis')).style('font-size', `calc(${60/x_width}px * var(--text-factor))` );


};

const drawAxis = (canvas) => {

  const {x : xRange ,y : yRange } = canvasScale(canvas);

  const leftAxis = d3.axisLeft().scale( yRange ).ticks(10,'^5.4~g');

  const bottomAxis = d3.axisBottom().scale( xRange ).ticks(10,'^5.4~g');

  bottomAxis(d3.select(canvas.querySelector('g#xaxis')));
  leftAxis(d3.select(canvas.querySelector('g#yaxis')));

};


export { drawAxis, updateAxis };