/*globals customElements*/
import Peakviewer from './Peakviewer';

const RegisterElement = (name='ccg-peaks') => {
	customElements.define(name,Peakviewer);
};

export { RegisterElement };

export { LEFT_MARGIN, TOP_MARGIN, PLOT_HEIGHT, BOTTOM_MARGIN, ANNOTATION_SIZE } from './Peakviewer';

export default Peakviewer;