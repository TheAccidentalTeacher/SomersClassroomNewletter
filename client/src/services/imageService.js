// Client-side Image Service for stock photo integration
import debugLogger from '../utils/debugLogger';
import apiService from './api';

class ImageService {
  constructor() {
    debugLogger.info('Client Image Service initialized');
  }

  /**
   * Search for images using the server API
   * @param {string} query - Search query
   * @param {Object} options - Search options
   * @returns {Promise<Object>} Search results
   */
  async searchImages(query, options = {}) {
    try {
      const {
        page = 1,
        perPage = 12,
        orientation = 'all',
        color = 'all',
        category = 'all',
        safe = true
      } = options;

      debugLogger.info('Searching for images', { query, options });

      const response = await apiService.post('/images/search', {
        query,
        page,
        perPage,
        orientation,
        color,
        category,
        safe
      });

      if (!response.success) {
        throw new Error(response.error || 'Image search failed');
      }

      debugLogger.info('Image search completed', { 
        query, 
        resultCount: response.images?.length || 0 
      });

      return response;

    } catch (error) {
      debugLogger.error('Image search failed', { error: error.message, query });
      throw error;
    }
  }

  /**
   * Get curated images for educational categories
   * @param {string} category - Category name
   * @param {Object} options - Options
   * @returns {Promise<Object>} Curated images
   */
  async getCuratedImages(category, options = {}) {
    try {
      const {
        page = 1,
        perPage = 12,
        orientation = 'all'
      } = options;

      debugLogger.info('Getting curated images', { category, options });

      const response = await apiService.get(`/images/curated/${category}`, {
        params: { page, perPage, orientation }
      });

      if (!response.success) {
        throw new Error(response.error || 'Failed to load curated images');
      }

      debugLogger.info('Curated images loaded', { 
        category, 
        resultCount: response.images?.length || 0 
      });

      return response;

    } catch (error) {
      debugLogger.error('Curated images request failed', { error: error.message, category });
      throw error;
    }
  }

  /**
   * Generate AI-powered image search suggestions
   * @param {string} content - Content to analyze
   * @param {string} contentType - Type of content
   * @returns {Promise<Array>} Array of suggestions
   */
  async generateImageSuggestions(content, contentType = 'general') {
    try {
      debugLogger.info('Generating image suggestions', { contentType, contentLength: content.length });

      const response = await apiService.post('/images/suggestions', {
        content,
        contentType
      });

      if (!response.success) {
        throw new Error(response.error || 'Failed to generate image suggestions');
      }

      debugLogger.info('Image suggestions generated', { 
        contentType, 
        suggestionsCount: response.suggestions?.length || 0 
      });

      return response.suggestions || [];

    } catch (error) {
      debugLogger.error('Image suggestions generation failed', { error: error.message, contentType });
      throw error;
    }
  }

  /**
   * Get available image categories
   * @returns {Promise<Array>} Array of categories
   */
  async getCategories() {
    try {
      debugLogger.info('Getting image categories');

      const response = await apiService.get('/images/categories');

      if (!response.success) {
        throw new Error(response.error || 'Failed to load image categories');
      }

      debugLogger.info('Image categories loaded', { 
        categoriesCount: response.categories?.length || 0 
      });

      return response.categories || [];

    } catch (error) {
      debugLogger.error('Image categories request failed', { error: error.message });
      throw error;
    }
  }

  /**
   * Analyze newsletter content and suggest relevant images
   * @param {Array} sections - Newsletter sections
   * @returns {Promise<Array>} Analysis results
   */
  async analyzeContent(sections) {
    try {
      debugLogger.info('Analyzing content for image suggestions', { sectionsCount: sections.length });

      const response = await apiService.post('/images/analyze-content', {
        sections
      });

      if (!response.success) {
        throw new Error(response.error || 'Content analysis failed');
      }

      debugLogger.info('Content analysis completed', { 
        analysisCount: response.analysis?.length || 0 
      });

      return response.analysis || [];

    } catch (error) {
      debugLogger.error('Content analysis failed', { error: error.message });
      throw error;
    }
  }

  /**
   * Check image service availability
   * @returns {Promise<Object>} Service status
   */
  async checkAvailability() {
    try {
      debugLogger.info('Checking image service availability');

      const response = await apiService.get('/images/status');

      debugLogger.info('Image service status checked', { 
        available: response.available,
        providers: response.providers
      });

      return response;

    } catch (error) {
      debugLogger.error('Image service status check failed', { error: error.message });
      return {
        available: false,
        message: 'Image service unavailable',
        error: error.message
      };
    }
  }

  /**
   * Get quick search suggestions for different contexts
   * @param {string} context - Context (e.g., 'classroom', 'announcement')
   * @returns {Array} Quick search suggestions
   */
  getQuickSearchSuggestions(context = 'general') {
    const suggestionMap = {
      classroom: [
        'happy students learning',
        'classroom environment',
        'teacher and students',
        'school supplies',
        'educational materials'
      ],
      science: [
        'science experiment',
        'laboratory equipment',
        'microscope',
        'students in lab',
        'nature discovery'
      ],
      math: [
        'mathematics concepts',
        'geometry shapes',
        'calculator',
        'math homework',
        'numbers and equations'
      ],
      reading: [
        'children reading books',
        'library scene',
        'storytelling',
        'literature',
        'reading corner'
      ],
      art: [
        'art supplies',
        'painting activity',
        'creative projects',
        'student artwork',
        'arts and crafts'
      ],
      sports: [
        'children playing sports',
        'playground activities',
        'team sports',
        'physical education',
        'active kids'
      ],
      announcement: [
        'important announcement',
        'megaphone',
        'attention sign',
        'school notice',
        'bulletin board'
      ],
      event: [
        'school event',
        'community gathering',
        'celebration',
        'school activity',
        'students together'
      ],
      general: [
        'happy school children',
        'educational environment',
        'learning activities',
        'school community',
        'academic success'
      ]
    };

    return suggestionMap[context] || suggestionMap.general;
  }

  /**
   * Format image data for display
   * @param {Object} image - Raw image data
   * @returns {Object} Formatted image data
   */
  formatImageData(image) {
    return {
      id: image.id,
      url: image.url,
      thumbnail: image.thumbnail,
      webUrl: image.webUrl,
      width: image.width,
      height: image.height,
      description: image.description,
      photographer: image.photographer,
      photographerUrl: image.photographerUrl,
      provider: image.provider,
      downloadUrl: image.downloadUrl,
      tags: image.tags || [],
      aspectRatio: image.width && image.height ? (image.width / image.height).toFixed(2) : '1',
      isLandscape: image.width > image.height,
      isPortrait: image.height > image.width,
      isSquare: Math.abs(image.width - image.height) < (Math.min(image.width, image.height) * 0.1)
    };
  }

  /**
   * Filter images by criteria
   * @param {Array} images - Array of images
   * @param {Object} filters - Filter criteria
   * @returns {Array} Filtered images
   */
  filterImages(images, filters = {}) {
    let filtered = [...images];

    if (filters.orientation && filters.orientation !== 'all') {
      filtered = filtered.filter(img => {
        const formatted = this.formatImageData(img);
        switch (filters.orientation) {
          case 'landscape':
            return formatted.isLandscape;
          case 'portrait':
            return formatted.isPortrait;
          case 'square':
            return formatted.isSquare;
          default:
            return true;
        }
      });
    }

    if (filters.provider && filters.provider !== 'all') {
      filtered = filtered.filter(img => img.provider === filters.provider);
    }

    if (filters.minWidth) {
      filtered = filtered.filter(img => img.width >= filters.minWidth);
    }

    if (filters.minHeight) {
      filtered = filtered.filter(img => img.height >= filters.minHeight);
    }

    return filtered;
  }
}

export default new ImageService();
