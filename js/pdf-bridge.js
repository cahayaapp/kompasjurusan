import * as pdfModule from './report-pdf.js?v=11.3';
window.KompasPdfModule = pdfModule;
window.dispatchEvent(new CustomEvent('kompas-pdf-ready'));
