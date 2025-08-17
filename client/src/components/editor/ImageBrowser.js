import React, { useState, useEffect, useCallback } from 'react';
import imageService from '../../services/imageService';
import debugLogger from '../../utils/debugLogger';

const ImageBrowser = ({ onImageSelect, onClose, initialQuery = '', contentType = 'general' }) => {
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [query, setQuery] = useState(initialQuery);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [orientation, setOrientation] = useState('all');
  const [suggestions, setSuggestions] = useState([]);
  const [activeTab, setActiveTab] = useState(initialQuery ? 'search' : 'categories');
  const [serviceStatus, setServiceStatus] = useState(null);

  // Load initial data
  useEffect(() => {
    loadCategories();
    checkServiceStatus();
    if (initialQuery) {
      handleSearch(initialQuery);
    }
  }, [initialQuery]);

  // Check service availability
  const checkServiceStatus = async () => {
    try {
      const status = await imageService.checkAvailability();
      setServiceStatus(status);
    } catch (error) {
      debugLogger.error('Failed to check image service status', { error });
      setServiceStatus({ available: false, message: 'Service unavailable' });
    }
  };

  // Load categories
  const loadCategories = async () => {
    try {
      const categoriesData = await imageService.getCategories();
      setCategories(categoriesData);
    } catch (error) {
      debugLogger.error('Failed to load categories', { error });
      setError('Failed to load image categories');
    }
  };

  // Handle search
  const handleSearch = useCallback(async (searchQuery = query, resetPage = true) => {
    if (!searchQuery.trim()) return;

    setLoading(true);
    setError(null);
    
    const searchPage = resetPage ? 1 : page;
    if (resetPage) {
      setImages([]);
      setPage(1);
    }

    try {
      const results = await imageService.searchImages(searchQuery, {
        page: searchPage,
        perPage: 20,
        orientation,
        safe: true
      });

      const newImages = results.images.map(img => imageService.formatImageData(img));
      
      setImages(prev => resetPage ? newImages : [...prev, ...newImages]);
      setHasMore(newImages.length === 20);
      setPage(prev => resetPage ? 2 : prev + 1);
      setActiveTab('search');

    } catch (error) {
      debugLogger.error('Image search failed', { error, query: searchQuery });
      setError(error.message || 'Image search failed');
    } finally {
      setLoading(false);
    }
  }, [query, page, orientation]);

  // Handle category selection
  const handleCategorySelect = async (categoryId) => {
    if (categoryId === selectedCategory) return;

    setSelectedCategory(categoryId);
    setLoading(true);
    setError(null);
    setImages([]);
    setPage(1);

    try {
      if (categoryId === 'all') {
        // Load general educational images
        await handleSearch('education classroom learning', true);
      } else {
        const results = await imageService.getCuratedImages(categoryId, {
          page: 1,
          perPage: 20,
          orientation
        });

        const newImages = results.images.map(img => imageService.formatImageData(img));
        setImages(newImages);
        setHasMore(newImages.length === 20);
        setPage(2);
      }
      setActiveTab('categories');
    } catch (error) {
      debugLogger.error('Category selection failed', { error, categoryId });
      setError(error.message || 'Failed to load category images');
    } finally {
      setLoading(false);
    }
  };

  // Load more images
  const loadMore = () => {
    if (activeTab === 'search') {
      handleSearch(query, false);
    } else if (selectedCategory !== 'all') {
      loadMoreCurated();
    }
  };

  const loadMoreCurated = async () => {
    if (loading || !hasMore) return;

    setLoading(true);
    try {
      const results = await imageService.getCuratedImages(selectedCategory, {
        page,
        perPage: 20,
        orientation
      });

      const newImages = results.images.map(img => imageService.formatImageData(img));
      setImages(prev => [...prev, ...newImages]);
      setHasMore(newImages.length === 20);
      setPage(prev => prev + 1);
    } catch (error) {
      debugLogger.error('Failed to load more curated images', { error });
      setError('Failed to load more images');
    } finally {
      setLoading(false);
    }
  };

  // Generate suggestions based on content type
  const generateSuggestions = () => {
    const quickSuggestions = imageService.getQuickSearchSuggestions(contentType);
    setSuggestions(quickSuggestions);
  };

  // Handle suggestion click
  const handleSuggestionClick = (suggestion) => {
    setQuery(suggestion);
    handleSearch(suggestion, true);
  };

  // Handle image selection
  const handleImageClick = (image) => {
    debugLogger.info('Image selected', { imageId: image.id, provider: image.provider });
    onImageSelect(image);
    onClose();
  };

  if (!serviceStatus) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-6">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-4"></div>
            <p>Loading image browser...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!serviceStatus.available) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-6 max-w-md">
          <div className="text-center">
            <div className="text-red-500 text-4xl mb-4">⚠️</div>
            <h3 className="text-lg font-semibold mb-2">Image Service Unavailable</h3>
            <p className="text-gray-600 mb-4">{serviceStatus.message}</p>
            <button
              onClick={onClose}
              className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg w-full max-w-6xl h-full max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-bold text-gray-800">Browse Images</h2>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700 text-2xl"
            >
              ×
            </button>
          </div>

          {/* Search Bar */}
          <div className="flex gap-2 mb-4">
            <div className="flex-1">
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                placeholder="Search for images... (e.g., 'classroom', 'science experiment', 'happy students')"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <button
              onClick={() => handleSearch()}
              disabled={!query.trim() || loading}
              className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Search
            </button>
          </div>

          {/* Quick Suggestions */}
          {contentType !== 'general' && (
            <div className="mb-4">
              <p className="text-sm text-gray-600 mb-2">Quick suggestions for {contentType}:</p>
              <div className="flex flex-wrap gap-2">
                {imageService.getQuickSearchSuggestions(contentType).slice(0, 5).map((suggestion, index) => (
                  <button
                    key={index}
                    onClick={() => handleSuggestionClick(suggestion)}
                    className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm hover:bg-gray-200"
                  >
                    {suggestion}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Tabs and Filters */}
          <div className="flex justify-between items-center">
            <div className="flex space-x-1">
              <button
                onClick={() => setActiveTab('search')}
                className={`px-4 py-2 rounded-lg ${
                  activeTab === 'search' 
                    ? 'bg-blue-500 text-white' 
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Search Results
              </button>
              <button
                onClick={() => setActiveTab('categories')}
                className={`px-4 py-2 rounded-lg ${
                  activeTab === 'categories' 
                    ? 'bg-blue-500 text-white' 
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Categories
              </button>
            </div>

            {/* Orientation Filter */}
            <select
              value={orientation}
              onChange={(e) => setOrientation(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
            >
              <option value="all">All Orientations</option>
              <option value="landscape">Landscape</option>
              <option value="portrait">Portrait</option>
              <option value="squarish">Square</option>
            </select>
          </div>
        </div>

        {/* Categories Tab */}
        {activeTab === 'categories' && (
          <div className="p-6 border-b border-gray-200">
            <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
              <button
                onClick={() => handleCategorySelect('all')}
                className={`p-3 rounded-lg border text-center ${
                  selectedCategory === 'all'
                    ? 'border-blue-500 bg-blue-50 text-blue-700'
                    : 'border-gray-200 hover:bg-gray-50'
                }`}
              >
                <div className="text-2xl mb-1">🎯</div>
                <div className="font-medium text-sm">All Images</div>
              </button>
              {categories.map((category) => (
                <button
                  key={category.id}
                  onClick={() => handleCategorySelect(category.id)}
                  className={`p-3 rounded-lg border text-center ${
                    selectedCategory === category.id
                      ? 'border-blue-500 bg-blue-50 text-blue-700'
                      : 'border-gray-200 hover:bg-gray-50'
                  }`}
                >
                  <div className="text-2xl mb-1">{category.icon}</div>
                  <div className="font-medium text-sm">{category.name}</div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Content Area */}
        <div className="flex-1 overflow-auto p-6">
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
              <div className="text-red-800">{error}</div>
              <button
                onClick={() => setError(null)}
                className="text-red-600 hover:text-red-800 text-sm mt-2"
              >
                Dismiss
              </button>
            </div>
          )}

          {images.length === 0 && !loading ? (
            <div className="text-center py-12">
              <div className="text-gray-400 text-6xl mb-4">🖼️</div>
              <p className="text-gray-600 text-lg mb-2">
                {activeTab === 'search' ? 'Search for images above' : 'Select a category to browse images'}
              </p>
              <p className="text-gray-500 text-sm">
                Find high-quality, educational images for your newsletter
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {images.map((image) => (
                <div
                  key={image.id}
                  onClick={() => handleImageClick(image)}
                  className="group cursor-pointer bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow overflow-hidden border border-gray-200"
                >
                  <div className="aspect-w-4 aspect-h-3 overflow-hidden">
                    <img
                      src={image.thumbnail}
                      alt={image.description}
                      className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-200"
                      loading="lazy"
                    />
                  </div>
                  <div className="p-3">
                    <p className="text-sm text-gray-800 font-medium line-clamp-2 mb-1">
                      {image.description}
                    </p>
                    <p className="text-xs text-gray-500">
                      by {image.photographer} • {image.provider}
                    </p>
                    <p className="text-xs text-gray-400 mt-1">
                      {image.width} × {image.height}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Load More Button */}
          {hasMore && images.length > 0 && (
            <div className="text-center mt-8">
              <button
                onClick={loadMore}
                disabled={loading}
                className="px-6 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 disabled:opacity-50"
              >
                {loading ? 'Loading...' : 'Load More Images'}
              </button>
            </div>
          )}

          {/* Loading State */}
          {loading && images.length === 0 && (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
              <p className="text-gray-600">Loading images...</p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-gray-200 bg-gray-50">
          <p className="text-xs text-gray-500 text-center">
            Images provided by Unsplash and Pexels. All images are free to use for educational purposes.
          </p>
        </div>
      </div>
    </div>
  );
};

export default ImageBrowser;
