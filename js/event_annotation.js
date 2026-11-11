import canvasScale from './scale';

const supported_events = 'mousemove mousedown mouseup click touchstart touchend touchmove drop dragover';

const annotate_event = function(canvas,event) {
  const {x : scaleX ,y : scaleY } = canvasScale(canvas);

  if (event.clientX) {
    var pt=canvas.createSVGPoint();
    pt.x=event.clientX;
    pt.y=event.clientY;
    // Into the plot's own coordinates (the #peaks group, offset by the
    // margins), where the scales map m/z and intensity. Hard-coded margins
    // here had drifted from the drawn ones, shifting every hit by 15 units.
    const plot = canvas.querySelector('#peaks') || canvas;
    let {x: plotx, y: ploty} = pt.matrixTransform(plot.getScreenCTM().inverse());
    let xval = scaleX.invert(plotx);
    let yval = scaleY.invert(ploty);

    event.peak = { x: xval, y: yval };
  }
};

const wire_canvas_events = (canvas,callback) => {
  for (let target of supported_events.split(' ')) {
    canvas.addEventListener( target, callback, { passive: true, capture: true } );
  }
};

const wire_interaction_events = (canvas) => {
  const event_function = annotate_event.bind(null,canvas);
  wire_canvas_events(canvas,event_function);
};

export { wire_interaction_events as wireEvents };