import html2pdf from 'html2pdf.js';
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';

class PDFExportService {
  
  /**
   * Export newsletter to PDF using html2pdf (best quality)
   */
  async exportToPDF(element, filename = 'newsletter.pdf', options = {}) {
    const defaultOptions = {
      margin: 0.5,
      filename: filename,
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { 
        scale: 2,
        useCORS: true,
        allowTaint: true,
        backgroundColor: '#ffffff'
      },
      jsPDF: { 
        unit: 'in', 
        format: 'letter', 
        orientation: 'portrait',
        compress: true
      },
      pagebreak: { mode: ['avoid-all', 'css', 'legacy'] }
    };

    const finalOptions = { ...defaultOptions, ...options };

    try {
      // Show loading indicator
      this.showLoadingIndicator('Generating PDF...');

      // Generate and download PDF
      await html2pdf()
        .set(finalOptions)
        .from(element)
        .save();

      this.hideLoadingIndicator();
      return { success: true, message: 'PDF exported successfully!' };

    } catch (error) {
      console.error('PDF export error:', error);
      this.hideLoadingIndicator();
      return { 
        success: false, 
        message: 'Failed to export PDF. Please try again.',
        error: error.message 
      };
    }
  }

  /**
   * Export newsletter as high-quality image
   */
  async exportToImage(element, filename = 'newsletter.png', format = 'png') {
    try {
      this.showLoadingIndicator('Generating image...');

      const canvas = await html2canvas(element, {
        scale: 3, // High resolution
        useCORS: true,
        allowTaint: true,
        backgroundColor: '#ffffff',
        width: element.scrollWidth,
        height: element.scrollHeight
      });

      // Download image
      const link = document.createElement('a');
      link.download = filename;
      link.href = canvas.toDataURL(`image/${format}`, 0.95);
      link.click();

      this.hideLoadingIndicator();
      return { success: true, message: 'Image exported successfully!' };

    } catch (error) {
      console.error('Image export error:', error);
      this.hideLoadingIndicator();
      return { 
        success: false, 
        message: 'Failed to export image. Please try again.',
        error: error.message 
      };
    }
  }

  /**
   * Print newsletter directly
   */
  async printNewsletter(element) {
    try {
      // Create a new window for printing
      const printWindow = window.open('', '_blank');
      
      // Get the HTML content
      const htmlContent = element.outerHTML;
      
      // Create print-optimized HTML
      const printHTML = `
        <!DOCTYPE html>
        <html>
        <head>
          <title>Newsletter - Print</title>
          <style>
            body { 
              margin: 0; 
              padding: 20px;
              font-family: Arial, sans-serif;
              background: white;
            }
            @media print {
              body { margin: 0; padding: 0; }
              .no-print { display: none !important; }
              * { 
                -webkit-print-color-adjust: exact !important;
                color-adjust: exact !important;
                print-color-adjust: exact !important;
              }
            }
            @page {
              margin: 0.5in;
              size: letter;
            }
          </style>
        </head>
        <body>
          ${htmlContent}
          <script>
            window.onload = function() {
              window.print();
              window.onafterprint = function() {
                window.close();
              };
            };
          </script>
        </body>
        </html>
      `;

      printWindow.document.write(printHTML);
      printWindow.document.close();

      return { success: true, message: 'Print dialog opened!' };

    } catch (error) {
      console.error('Print error:', error);
      return { 
        success: false, 
        message: 'Failed to print newsletter. Please try again.',
        error: error.message 
      };
    }
  }

  /**
   * Generate PDF with custom page breaks and formatting
   */
  async exportAdvancedPDF(element, filename = 'newsletter.pdf', options = {}) {
    try {
      this.showLoadingIndicator('Creating professional PDF...');

      // Advanced options for better formatting
      const advancedOptions = {
        margin: [0.5, 0.5, 0.5, 0.5],
        filename: filename,
        image: { 
          type: 'jpeg', 
          quality: 1.0 
        },
        html2canvas: { 
          scale: 3,
          useCORS: true,
          allowTaint: true,
          backgroundColor: '#ffffff',
          logging: false,
          letterRendering: true,
          removeContainer: true
        },
        jsPDF: { 
          unit: 'in', 
          format: 'letter', 
          orientation: 'portrait',
          precision: 16,
          compress: true
        },
        pagebreak: { 
          mode: ['avoid-all', 'css'],
          before: '.page-break-before',
          after: '.page-break-after',
          avoid: '.page-break-avoid'
        }
      };

      const finalOptions = { ...advancedOptions, ...options };

      // Pre-process the element for better PDF rendering
      const clonedElement = this.prepareElementForPDF(element);

      await html2pdf()
        .set(finalOptions)
        .from(clonedElement)
        .toPdf()
        .get('pdf')
        .then((pdf) => {
          // Add metadata
          pdf.setProperties({
            title: 'Classroom Newsletter',
            subject: 'Educational Newsletter',
            author: 'Classroom Newsletter System',
            creator: 'Newsletter Editor',
            producer: 'Newsletter System v1.0'
          });
        })
        .save();

      this.hideLoadingIndicator();
      return { success: true, message: 'Professional PDF created successfully!' };

    } catch (error) {
      console.error('Advanced PDF export error:', error);
      this.hideLoadingIndicator();
      return { 
        success: false, 
        message: 'Failed to create PDF. Please try again.',
        error: error.message 
      };
    }
  }

  /**
   * Prepare element for better PDF rendering
   */
  prepareElementForPDF(element) {
    const clone = element.cloneNode(true);
    
    // Ensure images are loaded
    const images = clone.querySelectorAll('img');
    images.forEach(img => {
      img.style.maxWidth = '100%';
      img.style.height = 'auto';
      img.style.display = 'block';
    });

    // Fix text rendering
    const textElements = clone.querySelectorAll('p, h1, h2, h3, h4, h5, h6, div, span');
    textElements.forEach(el => {
      el.style.webkitFontSmoothing = 'antialiased';
      el.style.mozOsxFontSmoothing = 'grayscale';
    });

    // Ensure backgrounds are preserved
    const elementsWithBg = clone.querySelectorAll('[style*="background"]');
    elementsWithBg.forEach(el => {
      el.style.webkitPrintColorAdjust = 'exact';
      el.style.printColorAdjust = 'exact';
    });

    return clone;
  }

  /**
   * Show loading indicator
   */
  showLoadingIndicator(message = 'Exporting...') {
    // Remove existing indicator
    this.hideLoadingIndicator();

    const indicator = document.createElement('div');
    indicator.id = 'pdf-loading-indicator';
    indicator.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: rgba(0, 0, 0, 0.8);
      display: flex;
      justify-content: center;
      align-items: center;
      z-index: 10000;
      color: white;
      font-family: Arial, sans-serif;
      font-size: 18px;
    `;

    indicator.innerHTML = `
      <div style="text-align: center;">
        <div style="
          border: 4px solid #f3f3f3;
          border-top: 4px solid #3498db;
          border-radius: 50%;
          width: 50px;
          height: 50px;
          animation: spin 1s linear infinite;
          margin: 0 auto 20px;
        "></div>
        <div>${message}</div>
        <style>
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        </style>
      </div>
    `;

    document.body.appendChild(indicator);
  }

  /**
   * Hide loading indicator
   */
  hideLoadingIndicator() {
    const indicator = document.getElementById('pdf-loading-indicator');
    if (indicator) {
      indicator.remove();
    }
  }

  /**
   * Get export format options
   */
  getExportFormats() {
    return [
      { value: 'pdf', label: 'PDF Document', icon: '📄' },
      { value: 'png', label: 'PNG Image', icon: '🖼️' },
      { value: 'jpeg', label: 'JPEG Image', icon: '📸' },
      { value: 'print', label: 'Print Newsletter', icon: '🖨️' }
    ];
  }

  /**
   * Get PDF quality options
   */
  getQualityOptions() {
    return [
      { value: 'draft', label: 'Draft (Fast)', scale: 1, quality: 0.7 },
      { value: 'standard', label: 'Standard', scale: 2, quality: 0.85 },
      { value: 'high', label: 'High Quality', scale: 3, quality: 0.95 },
      { value: 'print', label: 'Print Ready', scale: 4, quality: 1.0 }
    ];
  }
}

export default new PDFExportService();
