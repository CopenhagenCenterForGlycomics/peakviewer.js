
import { select } from 'd3-selection';
import { scaleLinear } from 'd3-scale';

const yScale = scaleLinear().range([0,90]).domain([100,0]);
const xScale = scaleLinear().range([0,400]);
const drawData = (element,range,data) => {
  xScale.domain(range);
  let max_y = Math.ceil(Math.max(...data.filter(d => d[0] <= range[1] && d[0] >= range[0] ).map( d => d[1] )));
  yScale.domain([max_y,0]);

  let rects = select(element)
  .selectAll('rect')
  .data(data);


  rects.enter()
    .append('rect')
    .attr('x', d => xScale(d[0]))
    .attr('y', d => yScale(d[1]))
    .attr('height',d => yScale(max_y - d[1]))
    .style('visibility', d => (d[0] >= range[0] && d[0] <= range[1]) ? 'visible': 'hidden')
    .attr('width',0.1);

  rects
    .attr('x', d => xScale(d[0]))
    .attr('y', d => yScale(d[1]))
    .attr('height',d => yScale(max_y - d[1]))
    .style('visibility', d => (d[0] >= range[0] && d[0] <= range[1]) ? 'visible': 'hidden');

  rects.exit().remove();

};

export default drawData;