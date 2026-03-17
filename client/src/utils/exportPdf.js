import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

/**
 * Captures a DOM element and saves it as a PDF.
 * @param {string} elementId - The id of the element to capture
 * @param {string} filename - Output filename (without .pdf)
 * @param {'portrait'|'landscape'} orientation
 */
export async function exportElementToPdf(elementId, filename = 'export', orientation = 'portrait') {
  try {
    const el = document.getElementById(elementId);
    if (!el) {
      throw new Error(`Element with id '${elementId}' not found`);
    }

    console.log('Element found, capturing with html2canvas...');
    
    // Make element visible temporarily for capture
    const originalStyle = el.style.cssText;
    el.style.position = 'fixed';
    el.style.left = '0';
    el.style.top = '0';
    el.style.zIndex = '9999';
    el.style.backgroundColor = 'white';
    
    const canvas = await html2canvas(el, {
      scale: 2,
      useCORS: true,
      backgroundColor: '#ffffff',
      logging: false,
      allowTaint: true,
      foreignObjectRendering: true,
      width: el.scrollWidth,
      height: el.scrollHeight,
    });

    // Restore original position
    el.style.cssText = originalStyle;

    console.log('Canvas created, generating PDF...');
    const imgData = canvas.toDataURL('image/png');
    const pdf = new jsPDF({ orientation, unit: 'mm', format: 'a4' });

    const pageW = pdf.internal.pageSize.getWidth();
    const pageH = pdf.internal.pageSize.getHeight();
    const imgW = pageW - 20; // Add margins
    const imgH = (canvas.height * imgW) / canvas.width;

    // Center the image
    const x = 10;
    let y = 10;

    // If content taller than one page, split across pages
    let remaining = imgH;
    let sourceY = 0;

    while (remaining > 0) {
      const pageHeight = Math.min(remaining, pageH - 20);
      pdf.addImage(imgData, 'PNG', x, y, imgW, imgH, undefined, 'FAST', 0, -sourceY);
      
      remaining -= (pageH - 20);
      sourceY += (pageH - 20) * (canvas.height / imgH);
      
      if (remaining > 0) {
        pdf.addPage();
        y = 10;
      }
    }

    console.log('Saving PDF...');
    pdf.save(`${filename}.pdf`);
    console.log('PDF saved successfully');
  } catch (error) {
    console.error('PDF export error:', error);
    throw error;
  }
}

// Alternative simple receipt download using window.print
export function printReceipt(elementId) {
  const element = document.getElementById(elementId);
  if (!element) {
    throw new Error(`Element with id '${elementId}' not found`);
  }
  
  const printWindow = window.open('', '_blank');
  printWindow.document.write(`
    <html>
      <head>
        <title>Fee Receipt</title>
        <style>
          body { font-family: Arial, sans-serif; margin: 20px; }
          .receipt { max-width: 600px; margin: 0 auto; }
          table { width: 100%; border-collapse: collapse; }
          th, td { padding: 8px; text-align: left; border-bottom: 1px solid #ddd; }
          .header { text-align: center; margin-bottom: 20px; }
          .logo { color: #4f46e5; font-weight: bold; font-size: 24px; }
          @media print { body { margin: 0; } }
        </style>
      </head>
      <body>
        <div class="receipt">
          ${element.innerHTML}
        </div>
        <script>
          window.onload = function() {
            window.print();
            window.close();
          }
        </script>
      </body>
    </html>
  `);
  printWindow.document.close();
}
