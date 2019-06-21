
import { scaleLinear } from 'd3-scale';

const all_scales = new WeakMap();

const canvasScale = (canvas) => {
  if ( ! all_scales.has(canvas) ) {
    let x = scaleLinear().clamp(true).range([0,400]);
    let y = scaleLinear().clamp(true).range([0,90]);

    all_scales.set(canvas, { x, y });
  }
  return all_scales.get(canvas);
};

export default canvasScale;