/* globals document,HTMLElement,customElements,window,ShadyCSS */
'use strict';

import * as debug from 'debug-any-level';

const module_string='peaksjs:peakviewer';

const log = debug(module_string);

import { drawAxis, updateAxis } from './axis';
import { wireEvents } from './event_annotation';

import drawData from './data';

import canvasScale from './scale';

const symbol_range = Symbol('range');
const symbol_data = Symbol('data');

const tmpl = document.createElement('template');

tmpl.innerHTML = `
<style>
  :host {
    display: block;
    position: relative;
    --selection-color: #f00;
    --selection-opacity: 0.1;
  }

  :host([resizeable]) {
    resize: both;
    overflow: auto;
  }

  #canvas, .widget_contents {
    width: 100%;
    height: 100%;
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
  <g id="selection" transform="translate(30,0)">
    <rect width="0" height="90" x="30" y="5" />
  </g>
  <g id="xaxis" transform="translate(30,95)"></g>
  <g id="yaxis" transform="translate(30,5)"></g>
  <g id="peaks" transform="translate(30,5)"></g>
</svg>
</div>
`;

function WrapHTML() { return Reflect.construct(HTMLElement, [], Object.getPrototypeOf(this).constructor); }
Object.setPrototypeOf(WrapHTML.prototype, HTMLElement.prototype);
Object.setPrototypeOf(WrapHTML, HTMLElement);

if (window.ShadyCSS) {
  ShadyCSS.prepareTemplate(tmpl, 'x-peaks');
}


const refresh = (viewer) => {
  updateAxis(viewer.shadowRoot.querySelector('svg'),viewer.range,viewer.data);
  drawAxis(viewer.shadowRoot.querySelector('svg'));
  drawData(viewer.shadowRoot.querySelector('svg #peaks'),viewer.range,viewer.data);
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

  connectedCallback() {
    if (window.ShadyCSS) {
      ShadyCSS.styleElement(this);
    }
    let shadowRoot = this.attachShadow({mode: 'open'});
    shadowRoot.appendChild(tmpl.content.cloneNode(true));
    drawAxis(this.shadowRoot.querySelector('svg'));
    wireEvents(this.shadowRoot.querySelector('svg'));

    this.data = Array(300).fill('').map( () => [ Math.random()*1000,Math.random()*100 ]  );
  }

}

customElements.define('x-peaks',Peakviewer);

export default Peakviewer;