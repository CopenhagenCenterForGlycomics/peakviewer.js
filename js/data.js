
import { select } from 'd3-selection';
import { scaleLinear } from 'd3-scale';

const yScale = scaleLinear().range([0,90]).domain([100,0]);
const xScale = scaleLinear().range([0,400]);
const drawData = (element,range,data) => {

  xScale.domain(range);

  select(element)
  .selectAll('rect')
  .data(data)
  .enter()
    .append('rect')
    .attr('x', d => xScale(d[0]) )
    .attr('y', d => yScale(d[1]))
    .attr('height',d => yScale(100 - d[1]))
    .attr('width',0.1);
};

export default drawData;