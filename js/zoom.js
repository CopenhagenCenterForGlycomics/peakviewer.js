/* globals window */
'use strict';

const symbol_start = Symbol('start');
const symbol_target = Symbol('target');
const symbol_end = Symbol('end');
const symbol_callback = Symbol('callback');


class Zoom {
  constructor(target,startzoom) {
    this[symbol_start] = startzoom;
    this[symbol_target] = target.shadowRoot.querySelector('svg');
    this[symbol_target].classList.add('scaling');
  }
  get target() {
    return this[symbol_target];
  }

  get end() {
    return this[symbol_end];
  }

  get scale() {
    return this[symbol_end] / this[symbol_start];
  }

  finished(callback) {
    this[symbol_callback] = callback;
  }

  get zoom() {
    return this.end;
  }

  set zoom(zoom) {
    let curr_transform = this.target.style.transform;
    let scale = zoom / this[symbol_start];
    this[symbol_end] = zoom;
    if ( ! curr_transform.match(/scale\([\d\.]+\)/)) {
      curr_transform = curr_transform+' scale(1)';
    }
    curr_transform = curr_transform.replace(/scale\([\d\.]+\)/, `scale(${scale})`).replace(/\s+/,' ');
    window.requestAnimationFrame(() => {
      this.target.style.transform = curr_transform;
    });

    window.clearTimeout(this._done);

    let finished_zoom = window.setTimeout( () => {
      this[symbol_target].classList.remove('scaling');
      this[symbol_callback]();
      this.target.style.transform = '';
    },100);

    this._done = finished_zoom;
  }
}

export default Zoom;