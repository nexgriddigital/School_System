import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';

export interface DomToPdfOptions {
  element: HTMLElement;
  fileName?: string;
  onProgress?: (status: string) => void;
}

/**
 * Downloads a DOM element as a high-fidelity, multi-page vector-fitted PDF document.
 * Safely handles fonts, scroll position, and Tailwind v4 color variables.
 */
export async function downloadElementAsPdf({
  element,
  fileName = 'Institutional-Report.pdf',
  onProgress,
}: DomToPdfOptions): Promise<void> {
  try {
    onProgress?.('Preparing document fonts & layout...');

    // Ensure all web fonts are loaded prior to rasterization
    if (document.fonts) {
      await document.fonts.ready;
    }

    onProgress?.('Capturing high-resolution report...');

    // Execute capture on cloned node
    const canvas = await html2canvas(element, {
      scale: 2, // 2x DPI for crisp print-grade rendering
      useCORS: true,
      logging: false,
      backgroundColor: '#ffffff',
      scrollY: 0,
      scrollX: 0,
      windowWidth: 1200,
      onclone: (clonedDoc) => {
        // Sanitize any modern CSS color functions (like oklch) in cloned style tags to prevent parser crashes
        const styles = clonedDoc.querySelectorAll('style');
        styles.forEach((styleTag) => {
          if (styleTag.textContent && styleTag.textContent.includes('oklch')) {
            try {
              styleTag.textContent = styleTag.textContent.replace(/oklch\([^)]+\)/g, '#1e293b');
            } catch {
              // Ignore regex fallback errors
            }
          }
        });

        // Ensure cloned element is clean of container drop shadows or overflow offsets
        const clonedEl = clonedDoc.getElementById(element.id) || clonedDoc.querySelector(`#${element.id}`);
        if (clonedEl instanceof HTMLElement) {
          clonedEl.style.transform = 'none';
          clonedEl.style.boxShadow = 'none';
          clonedEl.style.margin = '0 auto';
          clonedEl.style.border = 'none';
          clonedEl.style.width = '100%';
        }
      },
    });

    onProgress?.('Assembling multi-page PDF...');

    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4',
      compress: true,
    });

    const pageWidth = pdf.internal.pageSize.getWidth(); // 210mm
    const pageHeight = pdf.internal.pageSize.getHeight(); // 297mm
    const margin = 8; // 8mm margin
    const printableWidth = pageWidth - margin * 2; // 194mm
    const printableHeight = pageHeight - margin * 2; // 281mm

    const imgWidth = printableWidth;
    const imgHeight = (canvas.height * imgWidth) / canvas.width;

    // Use JPEG format with high quality for optimal file size and fast saving
    const imgData = canvas.toDataURL('image/jpeg', 0.95);

    const totalPages = Math.max(1, Math.ceil(imgHeight / printableHeight));

    for (let page = 0; page < totalPages; page++) {
      if (page > 0) {
        pdf.addPage();
      }
      const yOffset = margin - (page * printableHeight);
      pdf.addImage(imgData, 'JPEG', margin, yOffset, imgWidth, imgHeight, undefined, 'FAST');
    }

    onProgress?.('Saving PDF to your device...');
    const safeFileName = fileName.endsWith('.pdf') ? fileName : `${fileName}.pdf`;
    pdf.save(safeFileName);
  } catch (error) {
    console.error('DOM to PDF export failed, falling back to window.print():', error);
    // Graceful fallback to browser print if canvas rendering was blocked
    window.print();
    throw error;
  }
}

