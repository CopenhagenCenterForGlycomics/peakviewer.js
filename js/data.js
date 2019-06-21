
import { select } from 'd3-selection';

import canvasScale from './scale';

const drawData = (element,range,data) => {

  const {x : xScale ,y : yScale } = canvasScale(element.ownerSVGElement);

  xScale.domain(range);
  let max_y = yScale.domain()[0];

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