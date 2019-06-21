import canvasScale from './scale';

const supported_events = 'mousemove mousedown mouseup click touchstart touchend touchmove drop dragover';

const annotate_event = function(canvas,event) {
  const {x : scaleX ,y : scaleY } = canvasScale(canvas);

  if (event.clientX) {
    var pt=canvas.createSVGPoint();
    pt.x=event.clientX;
    pt.y=event.clientY;
    let {x: svgx, y: svgy} = pt.matrixTransform(canvas.getScreenCTM().inverse());
    let xval = scaleX.invert(svgx - 30);
    let yval = scaleY.invert(svgy - 5);

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