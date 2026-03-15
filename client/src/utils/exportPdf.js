import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

/**
 * Captures a DOM element and saves it as a PDF.
 * @param {string} elementId - The id of the element to capture
 * @param {string} filename - Output filename (without .pdf)
 * @param {'portrait'|'landscape'} orientation
 */
export async function exportElementToPdf(elementId, filename = 'export', orientation = 'portrait') {
  const el = document.getElementById(elementId);
  if (!el) throw new Error('Element not found: ' + elementId);

  const canvas = await html2canvas(el, {
    scale: 2,
    useCORS: true,
    backgroundColor: '#ffffff',
    logging: false,
  });

  const imgData = canvas.toDataURL('image/png');
  const pdf = new jsPDF({ orientation, unit: 'mm', format: 'a4' });

  const pageW = pdf.internal.pageSize.getWidth();
  const pageH = pdf.internal.pageSize.getHeight();
  const imgW = pageW;
  const imgH = (canvas.height * imgW) / canvas.width;

  // If content taller than one page, split across pages
  let yOffset = 0;
  let remaining = imgH;

  while (remaining > 0) {
    pdf.addImage(imgData, 'PNG', 0, -yOffset, imgW, imgH);
    remaining -= pageH;
    yOffset += pageH;
    if (remaining > 0) pdf.addPage();
  }

  pdf.save(`${filename}.pdf`);
}
