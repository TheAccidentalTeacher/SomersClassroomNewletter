import React, { useState } from 'react';
import pdfExportService from '../../services/pdfExportService';

const ExportControls = ({ previewRef, newsletter, onExportComplete }) => {
  const [isExporting, setIsExporting] = useState(false);
  const [exportFormat, setExportFormat] = useState('pdf');
  const [exportQuality, setExportQuality] = useState('high');
  const [customFilename, setCustomFilename] = useState('');

  const formats = pdfExportService.getExportFormats();
  const qualityOptions = pdfExportService.getQualityOptions();

  const generateFilename = () => {
    if (customFilename.trim()) {
      return customFilename.trim();
    }
    
    const title = newsletter.title?.replace(/[^a-zA-Z0-9]/g, '_') || 'newsletter';
    const date = new Date().toISOString().slice(0, 10);
    
    switch (exportFormat) {
      case 'pdf':
        return `${title}_${date}.pdf`;
      case 'png':
        return `${title}_${date}.png`;
      case 'jpeg':
        return `${title}_${date}.jpg`;
      default:
        return `${title}_${date}`;
    }
  };

  const handleExport = async () => {
    if (!previewRef.current) {
      alert('Newsletter preview not available. Please try again.');
      return;
    }

    setIsExporting(true);
    
    try {
      const filename = generateFilename();
      const quality = qualityOptions.find(q => q.value === exportQuality);
      
      let result;
      
      switch (exportFormat) {
        case 'pdf':
          result = await pdfExportService.exportAdvancedPDF(
            previewRef.current, 
            filename,
            {
              html2canvas: { 
                scale: quality.scale,
              },
              image: { 
                quality: quality.quality 
              }
            }
          );
          break;
          
        case 'png':
          result = await pdfExportService.exportToImage(
            previewRef.current, 
            filename, 
            'png'
          );
          break;
          
        case 'jpeg':
          result = await pdfExportService.exportToImage(
            previewRef.current, 
            filename, 
            'jpeg'
          );
          break;
          
        case 'print':
          result = await pdfExportService.printNewsletter(previewRef.current);
          break;
          
        default:
          result = { success: false, message: 'Unknown export format' };
      }

      if (result.success) {
        onExportComplete?.(result);
      } else {
        alert(result.message || 'Export failed. Please try again.');
      }

    } catch (error) {
      console.error('Export error:', error);
      alert('Export failed. Please check your browser settings and try again.');
    }
    
    setIsExporting(false);
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-6 border border-gray-200">
      <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
        <span className="text-2xl mr-2">📤</span>
        Export Newsletter
      </h3>

      <div className="space-y-4">
        {/* Format Selection */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Export Format
          </label>
          <div className="grid grid-cols-2 gap-2">
            {formats.map((format) => (
              <button
                key={format.value}
                onClick={() => setExportFormat(format.value)}
                className={`
                  flex items-center p-3 rounded-lg border-2 transition-all
                  ${exportFormat === format.value
                    ? 'border-blue-500 bg-blue-50 text-blue-700'
                    : 'border-gray-200 bg-white text-gray-700 hover:border-gray-300'
                  }
                `}
              >
                <span className="text-lg mr-2">{format.icon}</span>
                <span className="text-sm font-medium">{format.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Quality Selection (for PDF and images) */}
        {exportFormat !== 'print' && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Export Quality
            </label>
            <select
              value={exportQuality}
              onChange={(e) => setExportQuality(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {qualityOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
            <p className="text-xs text-gray-500 mt-1">
              Higher quality takes longer to process but produces better results
            </p>
          </div>
        )}

        {/* Custom Filename */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Filename (optional)
          </label>
          <input
            type="text"
            value={customFilename}
            onChange={(e) => setCustomFilename(e.target.value)}
            placeholder={generateFilename()}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <p className="text-xs text-gray-500 mt-1">
            Leave empty to use auto-generated filename
          </p>
        </div>

        {/* Export Button */}
        <button
          onClick={handleExport}
          disabled={isExporting}
          className={`
            w-full flex items-center justify-center px-4 py-3 rounded-lg font-medium transition-all
            ${isExporting
              ? 'bg-gray-400 text-white cursor-not-allowed'
              : 'bg-blue-600 text-white hover:bg-blue-700 active:bg-blue-800'
            }
          `}
        >
          {isExporting ? (
            <>
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
              Exporting...
            </>
          ) : (
            <>
              <span className="text-lg mr-2">🚀</span>
              Export Newsletter
            </>
          )}
        </button>

        {/* Export Tips */}
        <div className="bg-gray-50 rounded-lg p-4 mt-4">
          <h4 className="text-sm font-medium text-gray-900 mb-2">💡 Export Tips</h4>
          <ul className="text-xs text-gray-600 space-y-1">
            <li>• PDF format is best for sharing and printing</li>
            <li>• PNG format preserves transparency and quality</li>
            <li>• JPEG format is smaller but may lose some quality</li>
            <li>• Print option opens your browser's print dialog</li>
            <li>• Higher quality settings produce larger files</li>
          </ul>
        </div>

        {/* Quick Actions */}
        <div className="border-t pt-4">
          <p className="text-sm text-gray-600 mb-2">Quick Actions:</p>
          <div className="flex gap-2">
            <button
              onClick={() => {
                setExportFormat('pdf');
                setExportQuality('print');
              }}
              className="flex-1 px-3 py-2 text-sm bg-green-100 text-green-700 rounded-md hover:bg-green-200 transition-colors"
            >
              📄 Print Ready PDF
            </button>
            <button
              onClick={() => {
                setExportFormat('png');
                setExportQuality('high');
              }}
              className="flex-1 px-3 py-2 text-sm bg-purple-100 text-purple-700 rounded-md hover:bg-purple-200 transition-colors"
            >
              🖼️ High-Res Image
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ExportControls;
