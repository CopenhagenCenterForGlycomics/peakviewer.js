# Dead simple Spectrum Viewer

## Events

Mouse / touch events get populated with an attribute `peak` that contains the x/y co-ordinates
on the spectrum so you know where the clicks have ocurred.

`mousemove mousedown mouseup click touchstart touchend touchmove drop dragover`


## Zooming in/out of ranges

To zoom, you can either set the zoom property, or directly set the visible range using the
`range` attribute. If you set the zoom property, it will animate the zoom change. It actually
only re-renders the spectrum once for a zoom, because the intermediate state in zooming isn't
useful.

## Annotations

See `examples/simple_annotation`

## Building

Standard webpack build, look in `dist/peakviewer-bundle.js` for a bundled file that can be
used in a script tag.