
import { axisBottom, axisLeft } from 'd3-axis';
import { select } from 'd3-selection';

const d3 = { select, axisBottom, axisLeft };

import canvasScale from './scale';

// The plot is 400 units wide but only 90 tall: ask for fewer ticks on y, or
// round maxima (e.g. 0-3e6, step 2e5) give 16 labels on a 90-unit axis.
const X_TICKS = 10;
const Y_TICKS = 5;
const TICK_FORMAT = '^5.4~g';

// Plot geometry in viewBox units (Peakviewer.js, scale.js): the y labels
// have the left margin less the tick and its padding (45 - 6 - 3).
const PLOT_WIDTH = 400;
const PLOT_HEIGHT = 90;
const Y_LABEL_SPACE = 36;
// Generous glyph metrics for sans-serif digits, in em, so the caps err on
// the small side: character width, and label height plus a gap.
const CHAR_WIDTH = 0.6;
const LINE_HEIGHT = 1.2;

// Tick count and longest label of an axis (the axis formats its labels
// with the same scale.tickFormat).
const tickLabels = (scale,count) => {
  const format = scale.tickFormat(count,TICK_FORMAT);
  const ticks = scale.ticks(count);
  return { count: ticks.length, length: ticks.reduce((m, t) => Math.max(m, format(t).length), 0) };
};

const arraymax = (array) => {
  if (! array.length ) {
    return;
  }
  return array.reduce((m, v) => v > m ? v : m, -Infinity);
};

const updateAxis = (canvas,range,data) => {

  const {x : xRange ,y : yRange } = canvasScale(canvas);

  xRange.domain(range);
  yRange.domain([Math.ceil(arraymax(data.filter(d => d[0] <= range[1] && d[0] >= range[0] ).map( d => d[1] ))),0]);

  // One font size for both axes. It stays a fixed size on screen (via
  // --text-factor), from the longest label actually drawn rather than the
  // axis maxima, whose text can be shorter ('3e+6' against '2.5e+6').
  // On small plots it is capped, in viewBox units, so that the y labels fit
  // the left margin and neither axis's labels overlap their neighbours.
  const x = tickLabels(xRange,X_TICKS);
  const y = tickLabels(yRange,Y_TICKS);
  const label_width = Math.max(5, x.length, y.length);
  const cap = Math.min(
    Y_LABEL_SPACE / (CHAR_WIDTH * Math.max(5, y.length)),
    PLOT_HEIGHT / (LINE_HEIGHT * Math.max(1, y.count - 1)),
    PLOT_WIDTH / (Math.max(1, x.count - 1) * (CHAR_WIDTH * Math.max(5, x.length) + 1))
  );
  // The on-screen size is in rem (90px / 16 at the default base), so it
  // follows the page's base font size; the cap stays in viewBox units.
  const font_size = `min(calc(${(90/16/label_width).toFixed(4)}rem * var(--text-factor)), ${cap.toFixed(2)}px)`;

  d3.select(canvas.querySelector('g#yaxis')).style('font-size', font_size );
  d3.select(canvas.querySelector('g#xaxis')).style('font-size', font_size );


};

const drawAxis = (canvas) => {

  const {x : xRange ,y : yRange } = canvasScale(canvas);

  const leftAxis = d3.axisLeft().scale( yRange ).ticks(Y_TICKS,TICK_FORMAT);

  const bottomAxis = d3.axisBottom().scale( xRange ).ticks(X_TICKS,TICK_FORMAT);

  bottomAxis(d3.select(canvas.querySelector('g#xaxis')));
  leftAxis(d3.select(canvas.querySelector('g#yaxis')));

};


export { drawAxis, updateAxis };