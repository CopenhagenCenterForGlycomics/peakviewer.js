/* globals document,HTMLElement,ResizeObserver,customElements,window,ShadyCSS */
'use strict';

import * as debug from 'debug-any-level';

const module_string='peaksjs:peakviewer';

const log = debug(module_string);

import { drawAxis, updateAxis } from './axis';
import { wireEvents } from './event_annotation';

import drawData from './data';

import canvasScale from './scale';

import Zoom from './zoom';

const symbol_range = Symbol('range');
const symbol_data = Symbol('data');
const symbol_zoom = Symbol('zoom');

const tmpl = document.createElement('template');

tmpl.innerHTML = `
<style>
  :host {
    display: block;
    position: relative;
    --selection-color: #f00;
    --selection-opacity: 0.1;
    overflow: hidden;
  }

  :host([resizeable]) {
    resize: both;
    overflow: auto;
  }

  #canvas, .widget_contents {
    width: 100%;
    height: 100%;
  }

  #canvas.scaling {
    transform-origin: center 75%;
    transition: transform .1s ease-out;
  }

  #selection rect {
    fill: var(--selection-color,#f00);
    opacity: var(--selection-opacity,0.5);
  }

  @media only screen
    and (min-device-width: 320px)
    and (max-device-width: 480px)
    and (-webkit-min-device-pixel-ratio: 2) {

  }
</style>

<div class="widget_contents" >
<svg id="canvas" viewBox="0 0 450 125">
  <defs id="defs">
  </defs>
  <g id="selection" transform="translate(30,0)">
    <rect width="0" height="90" x="30" y="5" />
  </g>
  <g id="xaxis" transform="translate(30,95)"></g>
  <g id="yaxis" transform="translate(30,5)"></g>
  <g id="peaks" transform="translate(30,5)"></g>
  <g id="annotations" transform="translate(30,5)">
  </g>
</svg>
</div>
<div style="display: none">
<slot name="annotations"></slot>
</div>
`;

function WrapHTML() { return Reflect.construct(HTMLElement, [], Object.getPrototypeOf(this).constructor); }
Object.setPrototypeOf(WrapHTML.prototype, HTMLElement.prototype);
Object.setPrototypeOf(WrapHTML, HTMLElement);

if (window.ShadyCSS) {
  ShadyCSS.prepareTemplate(tmpl, 'x-peaks');
}

const placeAnnotation = (annotation,data) => {
  const canvas = annotation.ownerSVGElement;
  const {x : xScale, y: yScale} = canvasScale(canvas);

  let xpos = parseFloat(annotation.getAttribute('xaxis'));
  const delta = parseFloat(annotation.getAttribute('delta')) || 0;
  let closest = data.filter( dat => (dat[0] <= (xpos+delta)) && ((xpos-delta) <= dat[0]) );
  let nearest = closest[0];
  let [xmin,xmax] = xScale.range();
  let scaledx = xScale(xpos);

  if (nearest && (scaledx > xmin) && (scaledx < xmax)) {
    annotation.setAttribute('x',scaledx);
    annotation.setAttribute('y',yScale(nearest[1]));
    annotation.style.visibility = 'visible';
  } else {
    annotation.style.visibility = 'hidden';
  }
};

const refresh = (viewer) => {
  if ( ! viewer.data || viewer.data.length === 0 ) {
    return;
  }
  updateAxis(viewer.shadowRoot.querySelector('svg'),viewer.range,viewer.data);
  drawAxis(viewer.shadowRoot.querySelector('svg'));
  drawData(viewer.shadowRoot.querySelector('svg #peaks'),viewer.range,viewer.data);
  for (let annotation of viewer.shadowRoot.querySelectorAll('#annotations *')) {
    placeAnnotation(annotation,viewer.data);
  }
};

const updateAnnotations = (viewer,annotations) => {
  const canvas = viewer.shadowRoot.querySelector('svg');
  // We could use the MutationObserver to copy
  // across the SVG each time it changes
  for (let parent of annotations) {
    for (let use of parent.querySelectorAll('*[xaxis]')) {
      use = use.cloneNode(true);
      canvas.querySelector('#annotations').appendChild(use);
      use.setAttribute('width','10');
      use.setAttribute('height','10');
      use.style.visibility = 'hidden';
    }
    for (let symbol of parent.querySelectorAll('symbol')) {
      canvas.querySelector('#defs').appendChild(symbol.cloneNode(true));
    }
  }
  refresh(viewer);
};


const fixTextScaling = (svg) => {
  // We assume the SVG has a viewBox attribute
  // Getting the natural width of the SVG from the viewBox attribute
  const width = svg.getAttribute('viewBox').split(' ')[2];

  // Set the initial value for the scaling factor and mark it as loaded
  svg.style.setProperty('--text-factor', width / svg.clientWidth);

  // Update the scaling factor when SVG is resized
  const resizeObserver = new ResizeObserver(() => {
    svg.style.setProperty('--text-factor', width / svg.clientWidth);
  });

  resizeObserver.observe(svg);

  // In a real app, you'll want to disconnect the observer
  // on unmount by calling resizeObserver.disconnect();
};

class Peakviewer extends WrapHTML {

  static get observedAttributes() {
    return ['range','selected'];
  }

  constructor() {
    super();
    log('Initiating Peakviewer element');
  }

  attributeChangedCallback(name) {
    if (name === 'range') {
      this[symbol_range] = this.getAttribute('range').split('-').map( val => parseFloat(val.trim()) );
      refresh(this);
    }
    if (name === 'selected') {
      let canvas = this.shadowRoot.querySelector('svg');
      let selection_rect = canvas.querySelector('#selection rect');
      const {x : xScale} = canvasScale(canvas);
      let [start,end] = this.getAttribute('selected').split('-').map( val => parseFloat(val.trim()) );
      selection_rect.setAttribute('width',Math.abs(xScale(end) - xScale(start)));
      selection_rect.setAttribute('x',xScale(start));
    }
  }

  get range() {
    return this[symbol_range];
  }

  set data(data) {
    this[symbol_data] = data;
    let vals = data.map( d => d[0]);
    let maxrange = Math.ceil(Math.max(...vals));
    let minrange = Math.floor(Math.min(...vals));
    this.setAttribute('range',`${minrange}-${maxrange}`);
  }

  get data() {
    return this[symbol_data] || [];
  }

  get zoom() {
    return this._zoom || 1;
  }

  set zoom(zoom) {
    let curr_zoom = this[symbol_zoom];
    let zoomval,mid;
    if (typeof zoom === 'object') {
      zoomval = zoom.value;
      mid = zoom.center;
    } else {
      zoomval = zoom;
    }
    if ( ! curr_zoom ) {
      curr_zoom = new Zoom(this,this._zoom || 1);

      curr_zoom.finished( () => {
        this._zoom = curr_zoom.end;
        let [start,end] = this.getAttribute('range').split('-').map( v => parseFloat(v) );
        mid = mid ? mid : start + 0.5*(end - start);
        let factor = (1 / curr_zoom.scale);
        this.setAttribute('range',`${Math.floor(Math.max(0,mid + factor*(start-mid)))}-${Math.floor(mid+factor*(end-mid))}`);
        this[symbol_zoom] = null;
      });
      this[symbol_zoom] = curr_zoom;
    }
    curr_zoom.zoom = zoomval;
  }

  connectedCallback() {
    if (window.ShadyCSS) {
      ShadyCSS.styleElement(this);
    }
    let shadowRoot = this.attachShadow({mode: 'open'});
    shadowRoot.appendChild(tmpl.content.cloneNode(true));

    const canvas = this.shadowRoot.querySelector('svg');

    let annotations_slot = this.shadowRoot.querySelector('slot[name="annotations"]');
    annotations_slot.addEventListener('slotchange',() => updateAnnotations(this,annotations_slot.assignedElements({flatten: true})));


    drawAxis(canvas);
    wireEvents(canvas);
    fixTextScaling(canvas);

    updateAnnotations(this,annotations_slot.assignedElements({flatten: true}));

    for (let annotation of this.shadowRoot.querySelectorAll('#annotations *')) {
      placeAnnotation(annotation,this.data);
    }

  }

}

customElements.define('x-peaks',Peakviewer);

export default Peakviewer;