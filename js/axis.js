
import { axisBottom, axisLeft } from 'd3-axis';
import { select } from 'd3-selection';
import { scaleLinear } from 'd3-scale';

const d3 = { select, axisBottom, axisLeft };

const yRange = scaleLinear().range([0,90]).domain([100,0]);

const xRange = scaleLinear().clamp(true).range([0,400]).domain([0,1000]);

const leftAxis = d3.axisLeft().scale( yRange );
const bottomAxis = d3.axisBottom().scale( xRange );

const drawAxis = (canvas,range,data) => {
  
  xRange.domain(range);
  yRange.domain([Math.ceil(Math.max(...data.filter(d => d[0] <= range[1] && d[0] >= range[0] ).map( d => d[1] ))),0]);

  bottomAxis(d3.select(canvas.querySelector('g#xaxis')));
  leftAxis(d3.select(canvas.querySelector('g#yaxis')));
};


export default drawAxis;