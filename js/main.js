/*globals customElements*/
import Peakviewer from './Peakviewer';

const RegisterElement = (name='ccg-peaks') => {
	customElements.define(name,Peakviewer);
};

export { RegisterElement };

export default Peakviewer;