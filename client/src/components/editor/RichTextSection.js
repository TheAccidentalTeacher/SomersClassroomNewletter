import React, { useState, useRef } from 'react';
import AIContentGenerator from './AIContentGenerator';
import ImageBrowser from './ImageBrowser';

const RichTextSection = ({ section, onChange, onDelete, isEditing, theme }) => {
  const { data } = section;
  const textareaRef = useRef();
  const [showFormatting, setShowFormatting] = useState(false);
  const [showAI, setShowAI] = useState(false);
  const [showImageBrowser, setShowImageBrowser] = useState(false);

  const handleChange = (field, value) => {
    onChange(section.id, {
      ...data,
      [field]: value
    });
  };

  const handleStyleChange = (styleField, value) => {
    onChange(section.id, {
      ...data,
      style: {
        ...data.style,
        [styleField]: value
      }
    });
  };

  // Handle AI-generated content
  const handleAIContentGenerated = (generatedContent) => {
    // If there's existing content, append with a paragraph break
    const newContent = data.content ? 
      data.content + '\n\n' + generatedContent : 
      generatedContent;
    
    handleChange('content', newContent);
    setShowAI(false); // Close AI panel after generating
  };

  // Handle image insertion
  const handleImageSelect = (imageData) => {
    const imageMarkdown = `![${imageData.description}](${imageData.url})`;
    const textarea = textareaRef.current;
    const cursorPos = textarea ? textarea.selectionStart : data.content.length;
    
    const beforeText = data.content.substring(0, cursorPos);
    const afterText = data.content.substring(cursorPos);
    const newContent = beforeText + '\n\n' + imageMarkdown + '\n\n' + afterText;
    
    handleChange('content', newContent);
    setShowImageBrowser(false);
  };

  // Format text with markdown-style syntax
  const formatText = (format) => {
    const textarea = textareaRef.current;
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = data.content.substring(start, end);
    const beforeText = data.content.substring(0, start);
    const afterText = data.content.substring(end);

    let newText = '';
    let newCursorPos = start;

    switch (format) {
      case 'bold':
        if (selectedText) {
          newText = beforeText + '**' + selectedText + '**' + afterText;
          newCursorPos = end + 4;
        } else {
          newText = beforeText + '****' + afterText;
          newCursorPos = start + 2;
        }
        break;
      case 'italic':
        if (selectedText) {
          newText = beforeText + '*' + selectedText + '*' + afterText;
          newCursorPos = end + 2;
        } else {
          newText = beforeText + '**' + afterText;
          newCursorPos = start + 1;
        }
        break;
      case 'bullet':
        const lines = data.content.split('\n');
        const currentLineIndex = data.content.substring(0, start).split('\n').length - 1;
        lines[currentLineIndex] = '• ' + (lines[currentLineIndex] || '');
        newText = lines.join('\n');
        newCursorPos = start + 2;
        break;
      case 'number':
        const numberLines = data.content.split('\n');
        const currentNumberLineIndex = data.content.substring(0, start).split('\n').length - 1;
        numberLines[currentNumberLineIndex] = '1. ' + (numberLines[currentNumberLineIndex] || '');
        newText = numberLines.join('\n');
        newCursorPos = start + 3;
        break;
      default:
        return;
    }

    handleChange('content', newText);
    
    // Restore cursor position after state update
    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(newCursorPos, newCursorPos);
    }, 0);
  };

  // Render formatted text for preview
  const renderFormattedText = (text) => {
    if (!text) return '';
    
    // Simple markdown-style formatting
    let formatted = text
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>') // Bold
      .replace(/\*(.*?)\*/g, '<em>$1</em>') // Italic
      .replace(/!\[(.*?)\]\((.*?)\)/g, '<img src="$2" alt="$1" class="max-w-full h-auto rounded-lg shadow-sm my-4" />') // Images
      .split('\n')
      .map(line => {
        if (line.startsWith('• ')) {
          return `<li>${line.substring(2)}</li>`;
        } else if (/^\d+\.\s/.test(line)) {
          return `<li>${line.replace(/^\d+\.\s/, '')}</li>`;
        }
        return `<p>${line}</p>`;
      })
      .join('');

    // Wrap consecutive <li> elements in <ul>
    formatted = formatted
      .replace(/(<li>.*?<\/li>\s*)+/g, (match) => `<ul>${match}</ul>`)
      .replace(/(<p><\/p>)/g, ''); // Remove empty paragraphs

    return formatted;
  };

  if (!isEditing) {
    const textColor = data.style?.color || theme?.primaryColor || '#1f2937';
    
    return (
      <div className="py-4">
        <div 
          className={`prose max-w-none ${
            data.style?.textAlign === 'center' ? 'text-center' :
            data.style?.textAlign === 'right' ? 'text-right' : 'text-left'
          }`}
          style={{ 
            fontSize: data.style?.fontSize === 'sm' ? '14px' : data.style?.fontSize === 'lg' ? '18px' : '16px',
            color: textColor
          }}
          dangerouslySetInnerHTML={{ 
            __html: renderFormattedText(data.content) 
          }}
        />
      </div>
    );
  }

  return (
    <div className="border-2 border-green-200 rounded-lg p-4 bg-green-50">
      <div className="flex justify-between items-start mb-4">
        <h3 className="text-sm font-semibold text-green-800">Text Content</h3>
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setShowAI(!showAI)}
            className="text-blue-600 hover:text-blue-800 text-sm font-medium flex items-center"
          >
            🤖 {showAI ? 'Hide AI' : 'AI Help'}
          </button>
          <button
            onClick={() => setShowImageBrowser(true)}
            className="text-purple-600 hover:text-purple-800 text-sm font-medium flex items-center"
          >
            🖼️ Add Image
          </button>
          <button
            onClick={() => setShowFormatting(!showFormatting)}
            className="text-green-600 hover:text-green-800 text-sm font-medium"
          >
            {showFormatting ? 'Hide' : 'Format'}
          </button>
          <button
            onClick={() => onDelete(section.id)}
            className="text-red-500 hover:text-red-700 text-sm"
          >
            Delete
          </button>
        </div>
      </div>

      {showFormatting && (
        <div className="mb-4 p-3 bg-white rounded border">
          <div className="flex flex-wrap gap-2 mb-3">
            <button
              onClick={() => formatText('bold')}
              className="px-3 py-1 bg-gray-100 hover:bg-gray-200 rounded text-sm font-bold"
              title="Bold (select text first)"
            >
              <strong>B</strong>
            </button>
            <button
              onClick={() => formatText('italic')}
              className="px-3 py-1 bg-gray-100 hover:bg-gray-200 rounded text-sm italic"
              title="Italic (select text first)"
            >
              <em>I</em>
            </button>
            <button
              onClick={() => formatText('bullet')}
              className="px-3 py-1 bg-gray-100 hover:bg-gray-200 rounded text-sm"
              title="Add bullet point"
            >
              • List
            </button>
            <button
              onClick={() => formatText('number')}
              className="px-3 py-1 bg-gray-100 hover:bg-gray-200 rounded text-sm"
              title="Add numbered point"
            >
              1. List
            </button>
          </div>
          <div className="text-xs text-gray-600">
            <strong>Tip:</strong> Select text before clicking Bold or Italic. Use **text** for bold and *text* for italic.
          </div>
        </div>
      )}

      <div className="space-y-3">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Content
          </label>
          <textarea
            ref={textareaRef}
            value={data.content}
            onChange={(e) => handleChange('content', e.target.value)}
            rows={8}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-green-500 font-mono text-sm"
            placeholder="Enter your content here...

Tips:
- Use **bold text** for bold
- Use *italic text* for italic  
- Start lines with • for bullets
- Start lines with 1. for numbers"
          />
        </div>

        <div className="grid grid-cols-3 gap-3">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Text Alignment
            </label>
            <select
              value={data.style?.textAlign || 'left'}
              onChange={(e) => handleStyleChange('textAlign', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-green-500"
            >
              <option value="left">Left</option>
              <option value="center">Center</option>
              <option value="right">Right</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Font Size
            </label>
            <select
              value={data.style?.fontSize || 'base'}
              onChange={(e) => handleStyleChange('fontSize', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-green-500"
            >
              <option value="sm">Small</option>
              <option value="base">Normal</option>
              <option value="lg">Large</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Text Color
            </label>
            <input
              type="color"
              value={data.style?.color || theme?.primaryColor || '#1f2937'}
              onChange={(e) => handleStyleChange('color', e.target.value)}
              className="w-full h-10 border border-gray-300 rounded-md cursor-pointer"
            />
          </div>
        </div>
      </div>

      {/* AI Content Generator */}
      {showAI && (
        <AIContentGenerator
          onContentGenerated={handleAIContentGenerated}
          onClose={() => setShowAI(false)}
          contextType="rich-text"
        />
      )}

      {/* Image Browser */}
      {showImageBrowser && (
        <ImageBrowser
          onImageSelect={handleImageSelect}
          onClose={() => setShowImageBrowser(false)}
          initialQuery=""
          contentType="rich-text"
        />
      )}
    </div>
  );
};

export default RichTextSection;
