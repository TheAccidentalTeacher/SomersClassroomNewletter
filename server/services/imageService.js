// Image Service for stock photo integration
// Supports Unsplash and Pexels APIs for high-quality educational imagery
const logger = require('../utils/logger');

class ImageService {
  constructor() {
    // Initialize API keys from environment variables
    this.unsplashAccessKey = process.env.UNSPLASH_ACCESS_KEY;
    this.pexelsApiKey = process.env.PEXELS_API_KEY;
    
    // API endpoints
    this.unsplashBaseUrl = 'https://api.unsplash.com';
    this.pexelsBaseUrl = 'https://api.pexels.com/v1';
    
    logger.info('Image Service initialized', {
      unsplashAvailable: !!this.unsplashAccessKey,
      pexelsAvailable: !!this.pexelsApiKey
    });
  }

  /**
   * Search for images across available providers
   * @param {string} query - Search query
   * @param {Object} options - Search options
   * @returns {Promise<Array>} Array of image results
   */
  async searchImages(query, options = {}) {
    const {
      page = 1,
      perPage = 12,
      orientation = 'all', // 'landscape', 'portrait', 'squarish', 'all'
      color = 'all',
      category = 'all',
      safe = true // Safe for school content
    } = options;

    const results = [];
    const errors = [];

    // Search Unsplash first (generally higher quality)
    if (this.unsplashAccessKey) {
      try {
        const unsplashResults = await this.searchUnsplash(query, {
          page,
          perPage: Math.ceil(perPage / 2), // Split between providers
          orientation,
          color
        });
        results.push(...unsplashResults);
      } catch (error) {
        logger.warn('Unsplash search failed', { error: error.message, query });
        errors.push({ provider: 'unsplash', error: error.message });
      }
    }

    // Search Pexels for additional results
    if (this.pexelsApiKey && results.length < perPage) {
      try {
        const pexelsResults = await this.searchPexels(query, {
          page,
          perPage: perPage - results.length,
          orientation,
          color
        });
        results.push(...pexelsResults);
      } catch (error) {
        logger.warn('Pexels search failed', { error: error.message, query });
        errors.push({ provider: 'pexels', error: error.message });
      }
    }

    // Filter for safe, educational content
    const filteredResults = safe ? this.filterSafeContent(results, query) : results;

    logger.info('Image search completed', {
      query,
      totalResults: filteredResults.length,
      providers: errors.length === 0 ? 'all' : `${results.length > 0 ? 'partial' : 'none'}`,
      errors: errors.length
    });

    return {
      images: filteredResults.slice(0, perPage),
      total: filteredResults.length,
      query,
      errors: errors.length > 0 ? errors : undefined
    };
  }

  /**
   * Search Unsplash API
   */
  async searchUnsplash(query, options = {}) {
    if (!this.unsplashAccessKey) {
      throw new Error('Unsplash API key not configured');
    }

    const { page = 1, perPage = 12, orientation = 'all', color = 'all' } = options;
    
    const params = new URLSearchParams({
      query,
      page: page.toString(),
      per_page: perPage.toString(),
      orientation: orientation === 'all' ? '' : orientation,
      color: color === 'all' ? '' : color,
      content_filter: 'high' // Family-friendly content
    });

    // Remove empty parameters
    for (const [key, value] of [...params]) {
      if (!value) params.delete(key);
    }

    const response = await fetch(`${this.unsplashBaseUrl}/search/photos?${params}`, {
      headers: {
        'Authorization': `Client-ID ${this.unsplashAccessKey}`,
        'Accept-Version': 'v1'
      }
    });

    if (!response.ok) {
      throw new Error(`Unsplash API error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    
    return data.results.map(photo => ({
      id: `unsplash_${photo.id}`,
      provider: 'unsplash',
      url: photo.urls.regular,
      thumbnail: photo.urls.small,
      webUrl: photo.links.html,
      width: photo.width,
      height: photo.height,
      description: photo.description || photo.alt_description || query,
      photographer: photo.user.name,
      photographerUrl: photo.user.links.html,
      downloadUrl: photo.urls.full,
      tags: photo.tags?.map(tag => tag.title) || []
    }));
  }

  /**
   * Search Pexels API
   */
  async searchPexels(query, options = {}) {
    if (!this.pexelsApiKey) {
      throw new Error('Pexels API key not configured');
    }

    const { page = 1, perPage = 12, orientation = 'all', color = 'all' } = options;
    
    const params = new URLSearchParams({
      query,
      page: page.toString(),
      per_page: perPage.toString()
    });

    if (orientation !== 'all') {
      params.set('orientation', orientation);
    }

    const response = await fetch(`${this.pexelsBaseUrl}/search?${params}`, {
      headers: {
        'Authorization': this.pexelsApiKey
      }
    });

    if (!response.ok) {
      throw new Error(`Pexels API error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    
    return data.photos.map(photo => ({
      id: `pexels_${photo.id}`,
      provider: 'pexels',
      url: photo.src.large,
      thumbnail: photo.src.medium,
      webUrl: photo.url,
      width: photo.width,
      height: photo.height,
      description: photo.alt || query,
      photographer: photo.photographer,
      photographerUrl: photo.photographer_url,
      downloadUrl: photo.src.original,
      tags: []
    }));
  }

  /**
   * Get curated educational images by category
   */
  async getCuratedImages(category, options = {}) {
    const queries = this.getEducationalQueries(category);
    const allResults = [];

    for (const query of queries) {
      try {
        const results = await this.searchImages(query, { 
          ...options, 
          perPage: Math.ceil((options.perPage || 12) / queries.length)
        });
        allResults.push(...results.images);
      } catch (error) {
        logger.warn('Curated search failed for query', { category, query, error: error.message });
      }
    }

    return {
      images: allResults.slice(0, options.perPage || 12),
      category,
      total: allResults.length
    };
  }

  /**
   * Get educational search queries for different categories
   */
  getEducationalQueries(category) {
    const queryMap = {
      'classroom': ['classroom', 'students learning', 'school supplies', 'education'],
      'science': ['science experiment', 'laboratory', 'microscope', 'nature'],
      'math': ['mathematics', 'geometry', 'calculator', 'numbers'],
      'reading': ['books', 'library', 'reading', 'literature'],
      'art': ['art supplies', 'creativity', 'painting', 'drawing'],
      'sports': ['children playing', 'playground', 'team sports', 'physical education'],
      'nature': ['nature', 'outdoors', 'trees', 'wildlife'],
      'celebration': ['celebration', 'achievement', 'success', 'happy children'],
      'announcement': ['megaphone', 'announcement', 'important news', 'school news'],
      'events': ['calendar', 'event', 'gathering', 'school activity']
    };

    return queryMap[category] || ['education', 'school', 'learning'];
  }

  /**
   * Filter content for school-appropriate imagery
   */
  filterSafeContent(images, query) {
    // Educational keywords that indicate safe content
    const safeKeywords = [
      'school', 'education', 'learning', 'classroom', 'teacher', 'student',
      'book', 'study', 'science', 'math', 'art', 'nature', 'children',
      'playground', 'library', 'supplies', 'academic', 'knowledge'
    ];

    const queryLower = query.toLowerCase();
    const isSafeQuery = safeKeywords.some(keyword => queryLower.includes(keyword));

    if (isSafeQuery) {
      // If the query itself is educational, return all results
      return images;
    }

    // Otherwise, filter based on descriptions and tags
    return images.filter(image => {
      const description = (image.description || '').toLowerCase();
      const tags = (image.tags || []).join(' ').toLowerCase();
      const combined = `${description} ${tags}`;

      return safeKeywords.some(keyword => combined.includes(keyword)) ||
             combined.includes('child') || combined.includes('school');
    });
  }

  /**
   * Generate AI-powered image search suggestions
   */
  async generateImageSuggestions(content, contentType = 'general') {
    const suggestions = [];

    // Analyze content for relevant keywords
    const keywords = this.extractKeywords(content);
    
    // Generate contextual suggestions based on content type
    const contextualSuggestions = this.getContextualSuggestions(contentType, keywords);
    suggestions.push(...contextualSuggestions);

    // Add general educational suggestions
    const generalSuggestions = [
      'classroom environment',
      'happy students',
      'educational materials',
      'school activities'
    ];
    suggestions.push(...generalSuggestions);

    return [...new Set(suggestions)]; // Remove duplicates
  }

  /**
   * Extract relevant keywords from content
   */
  extractKeywords(content) {
    if (!content) return [];

    const educationalKeywords = [
      'science', 'math', 'reading', 'writing', 'art', 'music', 'sports',
      'field trip', 'experiment', 'project', 'test', 'homework', 'library',
      'playground', 'cafeteria', 'assembly', 'celebration', 'achievement'
    ];

    const contentLower = content.toLowerCase();
    return educationalKeywords.filter(keyword => contentLower.includes(keyword));
  }

  /**
   * Get contextual image suggestions based on content type
   */
  getContextualSuggestions(contentType, keywords) {
    const suggestions = [];

    switch (contentType) {
      case 'welcome':
        suggestions.push('welcoming classroom', 'smiling teacher', 'school entrance');
        break;
      case 'announcement':
        suggestions.push('important announcement', 'school bulletin', 'attention');
        break;
      case 'event':
        suggestions.push('school event', 'community gathering', 'celebration');
        break;
      case 'academic':
        suggestions.push('student achievement', 'learning success', 'academic progress');
        break;
      default:
        suggestions.push('educational environment', 'learning activities');
    }

    // Add keyword-based suggestions
    keywords.forEach(keyword => {
      suggestions.push(`${keyword} education`, `students ${keyword}`);
    });

    return suggestions;
  }

  /**
   * Check service availability
   */
  async checkAvailability() {
    const status = {
      available: false,
      providers: {},
      message: 'Image service unavailable'
    };

    if (this.unsplashAccessKey) {
      try {
        // Test Unsplash connection
        const response = await fetch(`${this.unsplashBaseUrl}/photos/random?count=1`, {
          headers: { 'Authorization': `Client-ID ${this.unsplashAccessKey}` }
        });
        status.providers.unsplash = response.ok;
      } catch (error) {
        status.providers.unsplash = false;
      }
    }

    if (this.pexelsApiKey) {
      try {
        // Test Pexels connection
        const response = await fetch(`${this.pexelsBaseUrl}/curated?per_page=1`, {
          headers: { 'Authorization': this.pexelsApiKey }
        });
        status.providers.pexels = response.ok;
      } catch (error) {
        status.providers.pexels = false;
      }
    }

    status.available = status.providers.unsplash || status.providers.pexels;
    status.message = status.available ? 'Image service operational' : 'No image providers configured';

    return status;
  }
}

module.exports = new ImageService();
