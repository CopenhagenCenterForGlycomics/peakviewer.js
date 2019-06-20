
import { axisBottom, axisLeft } from 'd3-axis';
import { select } from 'd3-selection';
import { scaleLinear } from 'd3-scale';

const d3 = { select, axisBottom, axisLeft };

const leftAxis = d3.axisLeft().scale( scaleLinear().range([0,90]).domain([100,0]) );

const drawAxis = (canvas,range) => {
  
  const bottomAxis = d3.axisBottom().scale( scaleLinear().clamp(true).range([0,400]).domain(range) );

  bottomAxis(d3.select(canvas.querySelector('g#xaxis')));
  leftAxis(d3.select(canvas.querySelector('g#yaxis')));
};


export default drawAxis;